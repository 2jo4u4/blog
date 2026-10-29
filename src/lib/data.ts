export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ProjectMetadata {
  id: string;
  tags: string[];
  links: {
    live?: string;
    store?: string;
    chrome?: string;
    note?: string;
  };
  image: string;
  screenshots?: string[];
}

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/2jo4u4",
    icon: "github",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/huang-jay",
    icon: "linkedin",
  },
  {
    name: "CakeResume",
    url: "https://www.cake.me/me/HuangJay",
    icon: "cake",
  },
  {
    name: "Email",
    url: "mailto:2jo4u4@gmail.com",
    icon: "mail",
  },
];

export const skillCategories: SkillCategory[] = [
  {
    category: "Frontend & Core Web",
    skills: [
      "React",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5 Canvas API",
      "Web Audio API",
      "Redux / 狀態管理",
      "Tailwind CSS",
      "Vite / Webpack",
    ],
  },
  {
    category: "Engineering & DevOps",
    skills: [
      "Turborepo",
      "pnpm",
      "Docker",
      "Cloudflare Workers",
      "CircleCI",
      "GCP",
      "Verdaccio (私有 NPM)",
      "Monorepo 架構",
    ],
  },
  {
    category: "Systems & Integration",
    skills: [
      "Node.js (遊戲/服務核心)",
      "WebSocket 即時通訊",
      "權威伺服器與狀態同步",
      "Electron 桌面應用",
      "RESTful API 設計",
      "Dual-package (ESM / CJS)",
    ],
  },
  {
    category: "Forward-Looking & Tools",
    skills: [
      "AI Agent 自主驅動全端開發",
      "LLM 工作流與 Tool Calling",
      "Git 版本控管",
      "VS Code / Antigravity",
    ],
  },
];

export const projectsMetadata: ProjectMetadata[] = [
  {
    id: "soundcraft-eq",
    tags: [
      "React 18",
      "TypeScript",
      "Web Audio API (DSP)",
      "DynamicsCompressor",
      "Chrome / Firefox Extension",
      "True Bypass",
      "Per-Tab Isolation",
    ],
    links: {
      chrome: "https://chromewebstore.google.com/detail/soundcraft-eq-audio-equal/nfkljeighcefimkcgmcfbkmojnpggljf",
      store: "https://addons.mozilla.org/en-US/firefox/addon/soundcraft-eq-audio-equalizer/",
    },
    image: "/images/projects/soundcraft-eq.png",
    screenshots: [
      "/images/projects/01_hero_equalizer.png",
      "/images/projects/03_inpage_picker_overlay.png",
    ],
  },
  {
    id: "dreamcity",
    tags: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Vite",
      "Node.js",
      "Cloudflare Workers",
      "Monorepo",
      "AI Agent Built",
    ],
    links: {
      live: "https://dreamcity.2jo4u4.workers.dev/",
    },
    image: "/images/projects/dreamcity.png",
  },
  {
    id: "infra-performance",
    tags: [
      "pnpm",
      "Turborepo",
      "Docker",
      "CircleCI",
      "GCP",
      "Webpack",
      "Verdaccio",
    ],
    links: {},
    image: "/images/projects/infra-performance.png",
  },
  {
    id: "creative-board",
    tags: [
      "React",
      "TypeScript",
      "HTML5 Canvas",
      "WebSocket",
      "Webpack",
      "SASS",
      "CI/CD",
    ],
    links: {
      live: "https://whiteboard.optoma.com/",
      note: "需登入體驗",
    },
    image: "/images/projects/creative-board.png",
  },
  {
    id: "vegeking-ecommerce",
    tags: [
      "React",
      "Material UI",
      "Axios",
      "CI/CD",
      "Sass",
      "RESTful API",
    ],
    links: {
      live: "https://www.vegeking.com.tw/?lang=zh-TW",
    },
    image: "/images/projects/vegeking.png",
  },
  {
    id: "retail-db-analytics",
    tags: [
      "Database Systems",
      "3NF Normalization",
      "Relational Modeling (ERD)",
      "T-SQL / MS SQL",
      "Window Functions (RANK)",
      "Set Operations (Outer Join)",
      "DFD Level 0/1",
    ],
    links: {},
    image: "/images/projects/retail-db-schema.png",
  },
];

export const data = {
  profile: {
    socialLinks,
  },
  skillCategories,
  projects: projectsMetadata,
};
