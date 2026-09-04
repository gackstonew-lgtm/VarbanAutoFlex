// Centralized Varban Auto Flex Motion System Design Tokens
export const motionTokens = {
  duration: {
    fast: 0.2,     // 200ms for micro-interactions (buttons, hovers)
    normal: 0.4,   // 400ms for standard entrances
    slow: 0.6,     // 600ms for section reveals
    stately: 0.8,  // 800ms for hero reveals
  },
  ease: {
    standard: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    emphasized: [0.16, 1, 0.3, 1] as [number, number, number, number], // Cubic bezier smooth deceleration
    enter: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
    exit: [0.4, 0.0, 1, 1] as [number, number, number, number],
  },
  distance: {
    subtle: 12,  // 12px for micro elements
    medium: 24,  // 24px for card containers
    section: 36, // 36px for section headers
  },
  stagger: {
    fast: 0.05,  // 50ms stagger between list items
    normal: 0.08, // 80ms stagger between vehicle cards
  },
  hover: {
    scaleImage: 1.04,
    liftCard: -4,
  }
};
