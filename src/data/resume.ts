import { DEFAULT_LOCALE, type Locale } from '../i18n';

/**
 * A human-readable value that must exist in every supported locale.
 * Same convention as `site.author.nameByLocale` — the `Record<Locale, T>`
 * type makes a missing translation a compile error.
 */
export type Localized<T> = Record<Locale, T>;

export interface Experience {
  /** Brand name — rendered as-is in every locale, do NOT translate. */
  company: string;
  companyUrl?: string;
  location: string;
  /** 'YYYY-MM'. */
  start: string;
  /** 'YYYY-MM'. Omit for the current job (set `current` instead). */
  end?: string;
  current?: boolean;
  role: Localized<string>;
  summary: Localized<string>;
  bullets: Localized<string[]>;
  badges?: Localized<string[]>;
}

/** Experience with localized fields flattened for one locale. */
export interface ResolvedExperience
  extends Omit<Experience, 'role' | 'summary' | 'bullets' | 'badges'> {
  role: string;
  summary: string;
  bullets: string[];
  badges?: string[];
}

export interface SkillGroup {
  title: string;
  skills: string[];
}

/** Pick the value for `locale`, falling back to the default locale. */
function resolve<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value[DEFAULT_LOCALE];
}

/** Work history — newest first. Keep zh-CN and en in sync. Shown on /work */
export const experience: Experience[] = [
  {
    company: 'Seaforest Tools',
    companyUrl: 'https://seaforesttools.com',
    location: 'Remote',
    start: '2024-06',
    current: true,
    role: {
      'zh-CN': '软件架构师，Seaforest 创始人',
      en: 'Software Architect & Founder',
    },
    summary: {
      'zh-CN': '验证 AI 应用能力，实现营销自动化落地。',
      en: 'Validation of AI application capabilities and marketing automation delivery.',
    },
    bullets: {
      'zh-CN': [
        '负责 Seahorizon 体系系统的设计、开发与上线落地。',
        '将财务票据处理耗时降低 70%',
        '搭建并落地 AI 营销自动化方案，实现营销转化效率提升。',
      ],
      en: [
        'Owned the design, development and launch of the Seahorizon system.',
        'Reduced financial invoice processing time by 70%.',
        'Built and deployed AI marketing automation solutions to improve marketing conversion rates.',
      ],
    },
    badges: {
      'zh-CN': ['TODO', 'TODO'],
      en: ['TODO', 'TODO'],
    },
  },
  {
    company: 'TCL 实业',
    companyUrl: 'https://tcl.com',
    location: 'China',
    start: '2020-07',
    end: '2024-02',
    role: {
      'zh-CN': '高经经理/架构师',
      en: 'Senior Manager / Software Architect',
    },
    summary: {
      'zh-CN': '主导信发平台与 B 端 IoT 平台的软件架构，同时负责研发团队管理。',
      en: 'Led software architecture for messaging platform and B2B IoT platform, and managed the R&D team.',
    },
    bullets: {
      'zh-CN': [
        'TODO: 端到端负责 X —— 设计、实现、上线。',
        'TODO: 构建 Y 服务 Z 客户。',
      ],
      en: [
        'TODO: Owned X end to end — design, implementation, launch.',
        'TODO: Built service Y, serving Z customers.',
      ],
    },
  },
  {
    company: '旦倍科技',
    companyUrl: 'https://danbay.com',
    location: 'China',
    start: '2018-07',
    end: '2020-07',
    role: {
      'zh-CN': '高经经理/架构师',
      en: 'Senior Manager / Software Architect',
    },
    summary: {
      'zh-CN': '主导信发平台与 B 端 IoT 平台的软件架构，同时负责研发团队管理。',
      en: 'Led software architecture for messaging platform and B2B IoT platform, and managed the R&D team.',
    },
    bullets: {
      'zh-CN': [
        'TODO: 端到端负责 X —— 设计、实现、上线。',
        'TODO: 构建 Y 服务 Z 客户。',
      ],
      en: [
        'TODO: Owned X end to end — design, implementation, launch.',
        'TODO: Built service Y, serving Z customers.',
      ],
    },
  },
  {
    company: '魅族科技',
    companyUrl: 'https://meizu.com',
    location: 'China',
    start: '2015-10',
    end: '2018-07',
    role: {
      'zh-CN': '高级工程师',
      en: 'Senior Engineer',
    },
    summary: {
      'zh-CN': '主导信发平台与 B 端 IoT 平台的软件架构，同时负责研发团队管理。',
      en: 'Led software architecture for messaging platform and B2B IoT platform, and managed the R&D team.',
    },
    bullets: {
      'zh-CN': [
        'TODO: 端到端负责 X —— 设计、实现、上线。',
        'TODO: 构建 Y 服务 Z 客户。',
      ],
      en: [
        'TODO: Owned X end to end — design, implementation, launch.',
        'TODO: Built service Y, serving Z customers.',
      ],
    },
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Languages',
    skills: ['Java', 'Go', 'Python',  'TypeScript'],
  },
  {
    title: 'Infrastructure',
    skills: [ 'Docker', 'Linux', 'Nginx'],
  },
  {
    title: 'Data & Messaging',
    skills: ['Kafka', 'Redis', 'MySQL', 'Elasticsearch'],
  },
  {
    title: 'IoT',
    skills: ['MQTT', 'CoAP', 'Cloud IoT'],
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

/** Work history for one locale — newest first. */
export function getExperience(locale: Locale): ResolvedExperience[] {
  return experience.map((e) => ({
    ...e,
    role: resolve(e.role, locale),
    summary: resolve(e.summary, locale),
    bullets: resolve(e.bullets, locale),
    badges: e.badges ? resolve(e.badges, locale) : undefined,
  }));
}
