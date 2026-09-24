import {
  ContentFormat,
  ContentStyle,
  ContentStructure,
  CtaType,
  HookType,
  Personalization,
  SentenceType,
  Stance,
  Tone,
  XPostAnalysisStatus,
} from "@prisma/client";

import type { Prisma } from "@prisma/client";

export type XPostAnalysisInput = {
  xPostId: string;
  content: string;
};

export type XPostAnalysisResult = {
  xPostId: string;

  status: XPostAnalysisStatus;

  hookType: HookType;
  structure: ContentStructure;
  topic: string;
  tone: Tone;
  format: ContentFormat;
  ctaType: CtaType;
  contentLength: number;
  contentStyle: ContentStyle;
  stance: Stance;
  sentenceType: SentenceType;
  personalization: Personalization;

  confidence: number;

  analysisVersion: string;
  analysisModel: string;
};

export type XPostAnalysisCreateData =
  Prisma.XPostAnalysisUncheckedCreateInput;

export const X_POST_ANALYSIS_VERSION = "v1";

export const X_POST_ANALYSIS_MODEL =
  "deterministic-v1";

function normalizeText(content: string): string {
  return content
    .replace(/\s+/g, " ")
    .trim();
}

function getOpening(content: string): string {
  const normalized = normalizeText(content);

  if (!normalized) {
    return "";
  }

  return normalized;
}

function hasQuestion(content: string): boolean {
  return content.includes("?");
}

function hasListStructure(content: string): boolean {
  const lines = content.split(/\r?\n/);

  return lines.some((line) =>
    /^\s*(?:[-*•]|\d+[.)])\s+/.test(line)
  );
}

function detectCta(content: string): CtaType {
  const normalized = content.toLowerCase();

  if (
    /\b(what do you think|thoughts|agree|disagree|your take)\b/.test(
      normalized
    )
  ) {
    return CtaType.QUESTION;
  }

  if (
    /\b(follow me|follow for|follow along)\b/.test(
      normalized
    )
  ) {
    return CtaType.FOLLOW;
  }

  if (
    /\b(reply|comment below|drop a comment)\b/.test(
      normalized
    )
  ) {
    return CtaType.REPLY;
  }

  if (
    /\b(sign up|signup|join|register)\b/.test(
      normalized
    )
  ) {
    return CtaType.SIGNUP;
  }

  if (
    /\b(click|visit|check out|read more|learn more)\b/.test(
      normalized
    )
  ) {
    return CtaType.CLICK;
  }

  if (
    /\b(share this|retweet|repost)\b/.test(
      normalized
    )
  ) {
    return CtaType.SHARE;
  }

  return CtaType.NONE;
}

function detectHookType(
  content: string
): HookType {
  const opening = getOpening(content);
  const normalized = opening.toLowerCase();

  if (!opening) {
    return HookType.OTHER;
  }

  if (opening.includes("?")) {
    return HookType.QUESTION;
  }

  if (
    /\b(unpopular opinion|hot take|contrary|most people are wrong|you're wrong|you are wrong)\b/.test(
      normalized
    )
  ) {
    return HookType.CONTRARIAN;
  }

  if (
    /\b(here's why|here is why|the reason|why)\b/.test(
      normalized
    )
  ) {
    return HookType.CURIOSITY;
  }

  if (
    /\b(problem|struggle|struggling|mistake|pain|failure)\b/.test(
      normalized
    )
  ) {
    return HookType.PROBLEM;
  }

  if (
    /\b(how to|you can|learn|build|create|increase|improve)\b/.test(
      normalized
    )
  ) {
    return HookType.BENEFIT;
  }

  if (
    /\b(i |i've|i have|my |we |we've|we have)\b/.test(
      normalized
    )
  ) {
    return HookType.STORY;
  }

  return HookType.STATEMENT;
}

function detectStructure(
  content: string
): ContentStructure {
  const normalized = normalizeText(content);
  const lower = normalized.toLowerCase();

  if (!normalized) {
    return ContentStructure.OTHER;
  }

  if (hasListStructure(content)) {
    return ContentStructure.LIST;
  }

  if (
    /\b(problem|issue|struggle|pain)\b/.test(lower) &&
    /\b(solution|fix|solve|solved|instead)\b/.test(lower)
  ) {
    return ContentStructure.PROBLEM_SOLUTION;
  }

  if (
    /\b(step 1|step 2|framework|principle|rule|playbook)\b/.test(
      lower
    )
  ) {
    return ContentStructure.FRAMEWORK;
  }

  if (
    /\b(because|why|here's why|here is why)\b/.test(
      lower
    )
  ) {
    return ContentStructure.CLAIM_EXPLANATION;
  }

  if (
    /\b(i learned|i learnt|lesson|learned from)\b/.test(
      lower
    )
  ) {
    return ContentStructure.STORY_LESSON;
  }

  if (hasQuestion(content)) {
    return ContentStructure.QUESTION_ANSWER;
  }

  if (
    /\b(here's how|here is how|do this|you should)\b/.test(
      lower
    )
  ) {
    return ContentStructure.HOOK_BODY_CTA;
  }

  return ContentStructure.OTHER;
}

function detectTopic(content: string): string {
  const normalized = normalizeText(content);

  if (!normalized) {
    return "";
  }

  const lower = normalized.toLowerCase();

  const topicKeywords: Array<{
    topic: string;
    keywords: string[];
  }> = [
    {
      topic: "ai",
      keywords: [
        "ai",
        "artificial intelligence",
        "llm",
        "chatgpt",
        "gemini",
        "claude",
      ],
    },
    {
      topic: "saas",
      keywords: [
        "saas",
        "software as a service",
        "micro saas",
        "startup",
        "product",
      ],
    },
    {
      topic: "building",
      keywords: [
        "build",
        "building",
        "developer",
        "coding",
        "code",
        "ship",
        "shipped",
      ],
    },
    {
      topic: "business",
      keywords: [
        "business",
        "revenue",
        "customer",
        "customers",
        "sales",
        "marketing",
      ],
    },
    {
      topic: "creator",
      keywords: [
        "creator",
        "content",
        "audience",
        "followers",
        "twitter",
        "x.com",
      ],
    },
    {
      topic: "career",
      keywords: [
        "career",
        "job",
        "interview",
        "resume",
        "salary",
        "work",
      ],
    },
    {
      topic: "productivity",
      keywords: [
        "productivity",
        "focus",
        "discipline",
        "habit",
        "habits",
        "routine",
      ],
    },
  ];

  for (const candidate of topicKeywords) {
    if (
      candidate.keywords.some((keyword) =>
        lower.includes(keyword)
      )
    ) {
      return candidate.topic;
    }
  }

  return "general";
}

function detectTone(content: string): Tone {
  const normalized = content.toLowerCase();

  if (!normalized.trim()) {
    return Tone.OTHER;
  }

  if (
    /\b(lol|haha|😂|🤣|funny|joke)\b/.test(
      normalized
    )
  ) {
    return Tone.HUMOROUS;
  }

  if (
    /\b(i believe|i think|in my opinion|my take)\b/.test(
      normalized
    )
  ) {
    return Tone.PERSONAL;
  }

  if (
    /\b(you must|you need to|the truth is|fact is|the rule)\b/.test(
      normalized
    )
  ) {
    return Tone.AUTHORITATIVE;
  }

  if (
    /\b(you can|learn|how to|here's how|here is how)\b/.test(
      normalized
    )
  ) {
    return Tone.EDUCATIONAL;
  }

  if (
    /\b(inspire|believe|keep going|don't give up|never give up)\b/.test(
      normalized
    )
  ) {
    return Tone.INSPIRATIONAL;
  }

  if (
    /\b(wrong|unpopular|controversial|nobody|everyone is wrong)\b/.test(
      normalized
    )
  ) {
    return Tone.PROVOCATIVE;
  }

  return Tone.NEUTRAL;
}

function detectFormat(content: string): ContentFormat {
  const normalized = normalizeText(content);
  const lower = normalized.toLowerCase();

  if (!normalized) {
    return ContentFormat.OTHER;
  }

  if (hasListStructure(content)) {
    return ContentFormat.LIST;
  }

  if (/\b(thread|🧵)\b/.test(lower)) {
    return ContentFormat.THREAD;
  }

  if (hasQuestion(content)) {
    return ContentFormat.QUESTION;
  }

  if (
    /\b(framework|principles|playbook|steps)\b/.test(
      lower
    )
  ) {
    return ContentFormat.FRAMEWORK;
  }

  if (
    /\b(i |my |we |our )\b/.test(lower)
  ) {
    return ContentFormat.STORY;
  }

  if (
    /\b(because|how to|here's how|learn|lesson)\b/.test(
      lower
    )
  ) {
    return ContentFormat.EDUCATIONAL;
  }

  if (
    /\b(i think|i believe|in my opinion|my take)\b/.test(
      lower
    )
  ) {
    return ContentFormat.OPINION;
  }

  return ContentFormat.OBSERVATION;
}

function detectContentStyle(
  content: string
): ContentStyle {
  const normalized = content.toLowerCase();

  if (
    /\b(i |i've|i have|my |we |we've|we have)\b/.test(
      normalized
    )
  ) {
    return ContentStyle.PERSONAL;
  }

  if (
    /\b(how to|learn|lesson|because|explain|guide)\b/.test(
      normalized
    )
  ) {
    return ContentStyle.EDUCATIONAL;
  }

  if (
    /\b(i think|i believe|my take|unpopular opinion)\b/.test(
      normalized
    )
  ) {
    return ContentStyle.OPINION;
  }

  if (
    /\b(framework|principles|steps|playbook|rules)\b/.test(
      normalized
    )
  ) {
    return ContentStyle.FRAMEWORK;
  }

  if (hasListStructure(content)) {
    return ContentStyle.LIST;
  }

  if (
    /\b(story|journey|happened|yesterday|today)\b/.test(
      normalized
    )
  ) {
    return ContentStyle.STORY;
  }

  return ContentStyle.OBSERVATIONAL;
}

function detectStance(content: string): Stance {
  const normalized = content.toLowerCase();

  if (
    /\b(unpopular opinion|hot take|most people are wrong|everyone is wrong|you're wrong|you are wrong|stop doing)\b/.test(
      normalized
    )
  ) {
    return Stance.CONTRARIAN;
  }

  if (
    /\b(best practice|common practice|generally|usually|standard)\b/.test(
      normalized
    )
  ) {
    return Stance.CONVENTIONAL;
  }

  return Stance.NEUTRAL;
}

function detectSentenceType(
  content: string
): SentenceType {
  const opening = getOpening(content);

  if (opening.includes("?")) {
    return SentenceType.QUESTION;
  }

  return SentenceType.STATEMENT;
}

function detectPersonalization(
  content: string
): Personalization {
  const normalized = content.toLowerCase();

  if (
    /\b(i|i'm|i've|i'll|me|my|mine|we|we're|we've|our|ours)\b/.test(
      normalized
    )
  ) {
    return Personalization.PERSONAL;
  }

  return Personalization.GENERIC;
}

export function analyzeXPost(
  input: XPostAnalysisInput
): XPostAnalysisResult {
  const content = normalizeText(input.content);

  if (!input.xPostId) {
    throw new Error("X post ID is required.");
  }

  if (!content) {
    throw new Error(
      "X post content is required for analysis."
    );
  }

  return {
    xPostId: input.xPostId,

    status: XPostAnalysisStatus.ANALYZED,

    hookType: detectHookType(content),
    structure: detectStructure(content),
    topic: detectTopic(content),
    tone: detectTone(content),
    format: detectFormat(content),
    ctaType: detectCta(content),
    contentLength: content.length,
    contentStyle: detectContentStyle(content),
    stance: detectStance(content),
    sentenceType: detectSentenceType(content),
    personalization:
      detectPersonalization(content),

    confidence: 1,

    analysisVersion: X_POST_ANALYSIS_VERSION,
    analysisModel: X_POST_ANALYSIS_MODEL,
  };
}

export function toXPostAnalysisCreateData(
  result: XPostAnalysisResult
): XPostAnalysisCreateData {
  return {
    xPostId: result.xPostId,
    status: result.status,

    hookType: result.hookType,
    structure: result.structure,
    topic: result.topic,
    tone: result.tone,
    format: result.format,
    ctaType: result.ctaType,
    contentLength: result.contentLength,
    contentStyle: result.contentStyle,
    stance: result.stance,
    sentenceType: result.sentenceType,
    personalization: result.personalization,

    confidence: result.confidence,

    analysisVersion: result.analysisVersion,
    analysisModel: result.analysisModel,

    analyzedAt: new Date(),
  };
}