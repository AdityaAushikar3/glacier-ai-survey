import { motion } from 'framer-motion';

export default function Mascot() {
  return (
    <div className="flex flex-col items-center justify-center p-2 relative h-48 w-48 mx-auto">
      {/* Floating Mascot Head and Body using premium Framer Motion loops */}
      <motion.div 
        className="relative z-10 w-full h-full flex items-center justify-center cursor-pointer"
        animate={{
          y: [-5, 5, -5]
        }}
        transition={{
          y: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        whileHover={{
          scale: 1.04,
          rotate: -1.5,
          transition: {
            type: "spring",
            stiffness: 90,
            damping: 14
          }
        }}
        whileTap={{
          scale: 0.97,
          transition: {
            type: "spring",
            stiffness: 150,
            damping: 10
          }
        }}
      >
        <svg 
          viewBox="0 0 120 120" 
          fill="none" 
          className="w-36 h-36 filter drop-shadow-[0_4px_10px_rgba(125,211,252,0.15)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Antennas */}
          <path d="M45 25 L35 15" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
          <path d="M75 25 L85 15" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="35" cy="15" r="4" fill="var(--color-tertiary)" />
          <circle cx="85" cy="15" r="4" fill="var(--color-tertiary)" />

          {/* Ears / Side Bolt Connectors */}
          <rect x="24" y="42" width="6" height="12" rx="3" fill="var(--color-on_surface_variant)" />
          <rect x="90" y="42" width="6" height="12" rx="3" fill="var(--color-on_surface_variant)" />

          {/* Main Floating Head */}
          <rect 
            x="28" 
            y="26" 
            width="64" 
            height="44" 
            rx="16" 
            fill="var(--color-surface-bright)" 
            stroke="var(--color-border-glow)" 
            strokeWidth="3" 
          />

          {/* Glowing Visor Screen */}
          <rect 
            x="36" 
            y="34" 
            width="48" 
            height="26" 
            rx="8" 
            fill="rgba(10, 15, 30, 0.85)" 
            stroke="rgba(125, 211, 252, 0.15)"
            strokeWidth="1.5"
          />

          {/* Blinking Circular Eyes - Occasional Blinking loop using Framer Motion */}
          <motion.g 
            animate={{
              scaleY: [1, 1, 1, 0.1, 1, 1, 1]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.45, 0.47, 0.49, 0.51, 0.55, 1]
            }}
            style={{ originX: "60px", originY: "47px" }}
          >
            <circle cx="48" cy="47" r="5" fill="var(--color-primary)" />
            <circle cx="72" cy="47" r="5" fill="var(--color-primary)" />
            {/* Eye Pupil Sparkles */}
            <circle cx="49.5" cy="45.5" r="1.5" fill="#ffffff" />
            <circle cx="73.5" cy="45.5" r="1.5" fill="#ffffff" />
          </motion.g>

          {/* Mouth/LED Indicator */}
          <line x1="52" y1="55" x2="68" y2="55" stroke="var(--color-tertiary)" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" />

          {/* Neck Link */}
          <rect x="54" y="69" width="12" height="6" rx="2" fill="var(--color-on_surface_variant)" />

          {/* Chest Plate / Body */}
          <path 
            d="M40 75 H80 L74 100 H46 L40 75 Z" 
            fill="var(--color-surface-bright)" 
            stroke="var(--color-border-glow)" 
            strokeWidth="3" 
            strokeLinejoin="round" 
          />

          {/* Glowing Center Power Core LED - gentle breathing glow */}
          <motion.circle 
            cx="60" 
            cy="87" 
            r="6" 
            fill="var(--color-primary)" 
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ originX: "60px", originY: "87px" }}
          />
          {/* Core Sparkle */}
          <circle cx="60" cy="87" r="2" fill="#ffffff" opacity="0.9" />

          {/* Arms */}
          <path d="M38 78 L26 90" stroke="var(--color-border-glow)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M82 78 L94 90" stroke="var(--color-border-glow)" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="26" cy="90" r="3.5" fill="var(--color-tertiary)" />
          <circle cx="94" cy="90" r="3.5" fill="var(--color-tertiary)" />
        </svg>
      </motion.div>

      {/* Ground Inverse Shadow - shrinks/grows with robot floating height */}
      <motion.div 
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-on_surface/5 dark:bg-primary/10 rounded-full blur-[2px]"
        style={{
          boxShadow: '0 0 8px var(--color-shadow-primary)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
