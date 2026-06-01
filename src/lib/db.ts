import fs from 'fs';
import path from 'path';

export interface SurveyBlueprint {
  id: string;
  title: string;
  topic: string;
  description: string;
  goals: string[];
  persona: string;
  createdAt: string;
}

export interface RespondentSession {
  id: string;
  surveyId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  extractedPoints: Record<string, string>; // Maps goal -> summary of response
  completed: boolean;
  createdAt: string;
}

interface DatabaseSchema {
  surveys: Record<string, SurveyBlueprint>;
  sessions: Record<string, RespondentSession>;
}

// Dynamic, cross-platform path to the db.json file in the active workspace
const DB_FILE_PATH = path.join(process.cwd(), 'db.json');

// Helper to initialize or load the database safely
function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialDb: DatabaseSchema = { surveys: {}, sessions: {} };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading JSON database:", error);
    return { surveys: {}, sessions: {} };
  }
}

// Helper to write changes to disk safely
function saveDb(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error("Error saving JSON database:", error);
  }
}

// === Survey CRUD Methods ===

export function saveSurvey(survey: SurveyBlueprint): void {
  const db = loadDb();
  db.surveys[survey.id] = survey;
  saveDb(db);
}

export function getSurvey(id: string): SurveyBlueprint | null {
  const db = loadDb();
  return db.surveys[id] || null;
}

export function listSurveys(): SurveyBlueprint[] {
  const db = loadDb();
  return Object.values(db.surveys).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// === Session CRUD Methods ===

export function saveSession(session: RespondentSession): void {
  const db = loadDb();
  db.sessions[session.id] = session;
  saveDb(db);
}

export function getSession(id: string): RespondentSession | null {
  const db = loadDb();
  return db.sessions[id] || null;
}

export function listSessionsForSurvey(surveyId: string): RespondentSession[] {
  const db = loadDb();
  return Object.values(db.sessions)
    .filter((s) => s.surveyId === surveyId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
