export const textCollections = {
  easy: {
    english: [
      "The quick brown fox jumps over the lazy dog.",
      "Hello world from the typing test.",
      "Practice makes perfect in typing.",
      "Keep calm and type on.",
      "Speed and accuracy matter.",
    ],
    motivational: [
      "You are doing great keep typing.",
      "Every keystroke brings you closer.",
      "Success comes with practice.",
      "Believe in yourself and type.",
      "The best time to type is now.",
    ],
    technical: [
      "Code is poetry written for machines.",
      "Variables store data in memory.",
      "Functions are reusable code blocks.",
      "Loops iterate over collections.",
      "Algorithms solve problems efficiently.",
    ],
  },
  medium: {
    english: [
      "The quick brown fox jumps over the lazy dog while the sun sets over the digital horizon.",
      "Consistency is the key to mastering any skill. Practice every day and watch your progress grow.",
      "Design is not just what it looks like and feels like. Design is how it works for the user.",
      "Focus on being productive instead of busy. Time is the most valuable asset we have in this life.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts in the end.",
    ],
    motivational: [
      "Your time is limited, so do not waste it living someone else's life or following their dreams.",
      "The only way to do great work is to love what you do. Keep looking and do not settle for less.",
      "In the middle of every difficulty lies opportunity. Embrace challenges and grow stronger with each one.",
      "The future belongs to those who believe in the beauty of their dreams. Keep dreaming and keep typing.",
      "Don't watch the clock; do what it does. Keep going and make every second count towards your goals.",
    ],
    technical: [
      "Asynchronous programming allows concurrent task execution without blocking the main thread.",
      "Object oriented design principles promote code reusability and maintainability.",
      "Database normalization reduces data redundancy and improves query performance.",
      "RESTful APIs provide stateless communication between client and server applications.",
      "Version control systems track changes and enable collaborative development workflows.",
    ],
  },
  hard: {
    english: [
      "The efficacious implementation of sophisticated algorithms necessitates comprehensive understanding of computational complexity paradigms and optimization methodologies.",
      "Phenomenological approaches to existential philosophy challenge conventional epistemological frameworks and necessitate reconsideration of fundamental ontological presuppositions.",
      "Implementing microservices architecture requires meticulous orchestration of containerized components, sophisticated load balancing, and comprehensive monitoring infrastructures.",
      "Cryptographic protocols employ mathematical transformations to ensure confidentiality, authenticity, and non-repudiation across unsecured communication channels.",
      "Machine learning models leverage statistical inference and pattern recognition to extract meaningful insights from voluminous multidimensional datasets.",
    ],
    motivational: [
      "Transcend limitations by embracing the extraordinary potential within your consciousness and cultivating relentless determination.",
      "Metamorphosis of character occurs through perseverance, introspection, and unwavering commitment to continuous self-improvement.",
      "Enlightenment emerges from understanding interconnectedness and recognizing infinite possibilities within seemingly insurmountable challenges.",
      "Virtuosity manifests through deliberate practice, authentic passion, and an uncompromising commitment to mastery.",
      "The zenith of achievement reveals itself to those who persistently pursue excellence and transcend conventional boundaries.",
    ],
    technical: [
      "Implementing homomorphic encryption enables computation on encrypted data without decryption, revolutionizing secure cloud computing paradigms.",
      "Quantum computing exploits superposition and entanglement to achieve exponential speedups for specific computational problems.",
      "Distributed consensus mechanisms in blockchain networks solve Byzantine fault tolerance through sophisticated cryptographic commitments.",
      "Natural language processing combines neural architectures with linguistic theory to enable machines to comprehend human communication.",
      "Zero knowledge proofs demonstrate cryptographic statements without revealing underlying information or requiring trusted intermediaries.",
    ],
  },
};

export const achievements = [
  { id: 'speed-100', name: 'Speed Demon', description: '100+ WPM', icon: '⚡', condition: (r) => r.wpm >= 100 },
  { id: 'accuracy-99', name: 'Perfect', description: '99%+ Accuracy', icon: '🎯', condition: (r) => r.accuracy >= 99 },
  { id: 'marathon', name: 'Marathon', description: 'Complete 2min test', icon: '🏃', condition: (r) => r.time >= 120 },
  { id: 'consistency', name: 'Consistent', description: '95%+ Accuracy (3 times)', icon: '📊', condition: null },
  { id: 'speedster', name: 'Speedster', description: '120+ WPM', icon: '🚀', condition: (r) => r.wpm >= 120 },
  { id: 'first-test', name: 'Getting Started', description: 'Complete first test', icon: '🌱', condition: null },
];

export const SHOP_ITEMS = [
  { id: 'theme-nord', name: 'Nordic Chill', type: 'theme', price: 500, icon: '❄️', desc: 'A cool, frost-blue theme for focused typing.', tag: 'New' },
  { id: 'theme-sunset', name: 'Desert Sunset', type: 'theme', price: 500, icon: '🌅', desc: 'Warm gradients to soothe your eyes.', tag: 'Exclusive' },
  { id: 'aura-gold', name: 'Gold Aura', type: 'aura', price: 1000, icon: '✨', desc: 'A radiant golden glow for your profile.', tag: 'Premium' },
  { id: 'pet-owl', name: 'Wise Owl', type: 'pet', price: 2000, icon: '🦉', desc: 'A guardian that watches your accuracy.', tag: 'Companion' },
  { id: 'pet-dragon', name: 'Fire Drake', type: 'pet', price: 5000, icon: '🐉', desc: 'An epic pet that loves high speed.', tag: 'Legendary' },
];

export const TITLES = [
  { id: 'novice', name: 'Novice', tier: 'common', requirement: 'Level 2', condition: (stats, level) => level >= 2 },
  { id: 'enthusiast', name: 'Enthusiast', tier: 'common', requirement: '10 tests completed', condition: (stats) => stats.totalTests >= 10 },
  { id: 'precision', name: 'Precision', tier: 'rare', requirement: '98% Avg. Accuracy', condition: (stats) => stats.avgAcc >= 98 },
  { id: 'speed-demon', name: 'Speed Demon', tier: 'rare', requirement: '100+ Best WPM', condition: (stats) => stats.pbEasy >= 100 || stats.pbMedium >= 100 || stats.pbHard >= 100 },
  { id: 'zen-master', name: 'Zen Master', tier: 'epic', requirement: '50 tests completed', condition: (stats) => stats.totalTests >= 50 },
  { id: 'epic-typer', name: 'Epic Typer', tier: 'epic', requirement: 'Level 10', condition: (stats, level) => level >= 10 },
  { id: 'ghost-king', name: 'Ghost King', tier: 'legendary', requirement: '120+ Best WPM', condition: (stats) => stats.pbEasy >= 120 || stats.pbMedium >= 120 || stats.pbHard >= 120 },
  { id: 'typing-legend', name: 'Typing Legend', tier: 'legendary', requirement: 'Level 20', condition: (stats, level) => level >= 20 },
];

export const AVATARS = ['👤', '🐱', '🐶', '🦊', '🐼', '🦁', '🐯', '🐨', '🐸', '🐙', '🦖', '🦄', '👻', '🤖', '👽', '👾', '🎮', '💡', '🔥', '✨'];

export const CLAN_MILESTONES = [
  { words: 10000, name: 'Shared Bronze Banner', icon: '🚩', pet: '🥚' },
  { words: 50000, name: 'Shared Silver Banner', icon: '🥈', pet: '🐥' },
  { words: 150000, name: 'Shared Gold Banner', icon: '🥇', pet: '🦅' },
  { words: 500000, name: 'Stronghold Guardian', icon: '🏰', pet: '🐲' },
];
