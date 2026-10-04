export interface Experience {
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  start: string;
  end: string;
  current?: boolean;
  summary: string;
  bullets: string[];
  badges?: string[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

export interface Education {
  degree: string;
  field: string;
  school: string;
  start: string;
  end: string;
}

/** Work history — newest first. Shown on /work */
export const experience: Experience[] = [
  {
    role: 'Senior Software Engineer',
    company: 'TODO Company',
    companyUrl: 'https://example.com',
    location: 'Remote',
    start: '2024-03',
    end: 'Present',
    current: true,
    summary: 'TODO: 一句话总结你负责的方向或系统。',
    bullets: [
      'TODO: 写一个你主导的项目，结果导向而非职责罗列。',
      'TODO: 另一个量化结果（如：延迟降低一半、采用率提升 3 倍）。',
      'TODO: 团队贡献（Mentoring、设计评审、On-call 等）。',
    ],
    badges: ['TODO', 'TODO'],
  },
  {
    role: 'Software Engineer',
    company: 'TODO Previous Company',
    companyUrl: 'https://example.com',
    location: 'China',
    start: '2021-07',
    end: '2024-02',
    summary: 'TODO: 一句话描述产品和你负责的部分。',
    bullets: [
      'TODO: 端到端负责 X —— 设计、实现、上线。',
      'TODO: 构建 Y 服务 Z 客户。',
    ],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    skills: ['Go', 'Java', 'Python', 'Rust', 'TypeScript'],
  },
  {
    title: 'Infrastructure',
    skills: ['Kubernetes', 'Docker', 'Linux', 'Nginx', 'Terraform'],
  },
  {
    title: 'Data & Messaging',
    skills: ['Kafka', 'Redis', 'PostgreSQL', 'gRPC'],
  },
  {
    title: 'AI / LLM',
    skills: ['LangChain', 'RAG', 'Vector DB', 'Prompt Engineering'],
  },
];

/** Words typed out one character at a time in the hero */
export const typingRoles = [
  'Internet Architect',
  'AI Agent Builder',
  'Lifelong Learner',
];

/** Education — newest first. Shown on /work */
export const education: Education[] = [
  // TODO: add your education here, e.g.:
  // {
  //   degree: "Master's",
  //   field: 'Computer Science',
  //   school: 'TODO University',
  //   start: '2018',
  //   end: '2020',
  // },
];
