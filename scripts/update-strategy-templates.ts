import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { prisma } = await import("../lib/prisma");

  const strategyTemplates = [
    {
      title: "Reply-Guy Method",
      hypothesisTemplate:
        "Consistently replying with useful, specific insights on larger creators' posts will increase profile visits and engagement compared with relying only on standalone posts.",
      protocolTemplate:
        "For 14 days, publish your normal standalone content while intentionally leaving 5-10 valuable replies each day on relevant posts from larger creators in your niche. Track the number and quality of replies and compare your results against your baseline.",
      recommendedDurationDays: 14,
      recommendedPostCount: 6,
      primaryMetric: "views",
      successThresholdPercent: 25,
    },

    {
      title: "Curiosity-Gap Hooks",
      hypothesisTemplate:
        "Using curiosity-gap openings that create an unanswered question will generate more views than my normal post openings because they give readers a reason to stop and continue reading.",
      protocolTemplate:
        "For 14 days, publish posts using curiosity-gap hooks. Keep the core topic and posting cadence reasonably consistent, then compare the average views of these posts against your captured baseline.",
      recommendedDurationDays: 14,
      recommendedPostCount: 6,
      primaryMetric: "views",
      successThresholdPercent: 25,
    },

    {
      title: "Thread Every Tuesday",
      hypothesisTemplate:
        "Publishing one structured thread every Tuesday will generate more views and engagement than my normal standalone posts because longer-form content gives me more opportunities to provide useful information.",
      protocolTemplate:
        "For 4 weeks, publish one structured thread every Tuesday. Keep the topic within your normal niche and record the performance of each thread. Compare the average performance against your baseline.",
      recommendedDurationDays: 28,
      recommendedPostCount: 4,
      primaryMetric: "views",
      successThresholdPercent: 25,
    },

    {
      title: "Build-in-Public Daily Log",
      hypothesisTemplate:
        "Sharing specific daily progress, lessons, and outcomes from building will generate more engagement than generic updates because concrete progress gives the audience something specific to follow and respond to.",
      protocolTemplate:
        "For 14 days, publish one short build-in-public update each day. Focus each post on a specific thing you built, shipped, learned, failed at, or changed. Compare the average views against your baseline.",
      recommendedDurationDays: 14,
      recommendedPostCount: 10,
      primaryMetric: "views",
      successThresholdPercent: 25,
    },

    {
      title: "Contrarian Take Fridays",
      hypothesisTemplate:
        "Publishing a well-supported contrarian opinion on Fridays will generate more engagement than my normal opinion posts because challenging a common assumption gives people a reason to respond.",
      protocolTemplate:
        "For 4 weeks, publish one contrarian take every Friday. Each post should challenge a common assumption in your niche and provide reasoning or evidence. Compare the average performance against your baseline.",
      recommendedDurationDays: 28,
      recommendedPostCount: 4,
      primaryMetric: "likes",
      successThresholdPercent: 25,
    },

    {
      title: "Quote-Tweet Value-Add",
      hypothesisTemplate:
        "Adding an original, useful perspective to relevant posts through quote-tweets will generate more engagement than publishing only standalone posts because the content starts from an existing conversation.",
      protocolTemplate:
        "For 14 days, publish 3-5 quote-tweets containing a genuine value-add such as analysis, a counterpoint, an example, or an actionable lesson. Track their performance and compare the average against your baseline.",
      recommendedDurationDays: 14,
      recommendedPostCount: 6,
      primaryMetric: "likes",
      successThresholdPercent: 25,
    },

    {
      title: "The Numbered List Post",
      hypothesisTemplate:
        "Packaging one useful lesson into a short numbered list will generate more views than my normal post structure because numbered lists make information easier to scan and consume.",
      protocolTemplate:
        "For 14 days, publish 5-6 numbered list posts focused on useful lessons, frameworks, mistakes, or actionable ideas within your niche. Keep the list structure consistent and compare average views against your baseline.",
      recommendedDurationDays: 14,
      recommendedPostCount: 6,
      primaryMetric: "views",
      successThresholdPercent: 25,
    },

    {
      title: "Screenshot-Proof Posts",
      hypothesisTemplate:
        "Supporting claims with screenshots or concrete proof will generate more engagement than unsupported claims because visible evidence makes the content more credible and tangible.",
      protocolTemplate:
        "For 14 days, publish 5-6 posts that use screenshots or concrete evidence to support a claim, result, workflow, or lesson. Compare the average performance of these posts against your baseline.",
      recommendedDurationDays: 14,
      recommendedPostCount: 6,
      primaryMetric: "views",
      successThresholdPercent: 25,
    },
  ];

  try {
    for (const template of strategyTemplates) {
      const result = await prisma.strategy.updateMany({
        where: {
          title: template.title,
        },
        data: {
          hypothesisTemplate: template.hypothesisTemplate,
          protocolTemplate: template.protocolTemplate,
          recommendedDurationDays: template.recommendedDurationDays,
          recommendedPostCount: template.recommendedPostCount,
          primaryMetric: template.primaryMetric,
          successThresholdPercent: template.successThresholdPercent,
        },
      });

      console.log(
        `${template.title}: ${
          result.count === 1
            ? "updated"
            : `matched ${result.count} records`
        }`
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});