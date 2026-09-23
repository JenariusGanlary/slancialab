# Slancialab — Master Project Context

## Product
Slancialab is an X (Twitter) creator experimentation and intelligence platform.

**Category:** X Experimentation Intelligence  
**Positioning:** The experimentation engine for X creators.  
**Promise:** Stop guessing what works. Research, experiment, measure, and learn.

It is not primarily an AI tweet writer, scheduler, generic analytics dashboard, viral-post generator, or creator database. Those may become supporting capabilities. The core product is the learning and experimentation loop.

## Total Product Outcome
The eventual experience is:

Connect X → learn the account → research relevant creators → analyze content → detect patterns → identify signals → propose strategies → propose experiments → generate content → user approval → publish → measure → evaluate → learn → recommend the next experiment.

The product should progressively move users from **Manual → Assisted → Automated**, while retaining user control over consequential actions.

The final question Slancialab should answer is:

> Based on my account, audience, past experiments, and relevant creator research, what should I test next, why, how should I execute it, and what did we learn?

## Core Flywheel
Discover → Study → Analyze → Detect Patterns → Formulate Strategy → Experiment → Generate → Publish → Measure → Learn → Recommend → Repeat.

Technical flow:

Creator Research / User X Data
→ Content Analysis
→ Patterns
→ Performance Signals
→ Strategies
→ Experiments
→ Experiment Posts
→ X Performance
→ Evaluation
→ Learning
→ Next Experiment

## User Workflow

### New user
1. Landing page
2. Sign up
3. Onboarding: niche, follower stage, goal, first action
4. Personalized strategies/research
5. Connect X when integration is available
6. Import/learn from own content
7. Research creators
8. Discover evidence/patterns
9. Select a strategy
10. Define/review an experiment
11. Start experiment
12. Publish posts linked to the experiment
13. Measure
14. Evaluate
15. Store learning
16. Recommend next experiment

### Research creator
Search creator → profile → posts → structured analysis → patterns → performance evidence → research finding → strategy candidate → experiment on user's own account.

Research creators are evidence sources, not people to copy.

### Own X account
Connect X → OAuth → secure account/token handling → sync posts/metrics → analyze → aggregate patterns → baseline/signal detection → strategy → experiment → ExperimentPost → metrics → evaluation → learning.

X is a source; Slancialab's database is the application intelligence layer.

## Experiments
Strategy → Experiment → ExperimentPost → Measurements → Evaluation → ExperimentResult.

Current concepts include:
- hypothesis
- protocol
- durationDays
- targetPostCount
- primaryMetric
- successThresholdPercent
- baseline
- status
- startedAt
- completedAt

Lifecycle:
- active
- paused
- completed

Valid:
- active → paused
- active → completed
- paused → active
- paused → completed

Completed experiments cannot reopen or receive new measurements.

## Experimental Integrity
Distinguish:

Observation → Signal → Hypothesis → Experiment → Result → Learning.

Missing metrics are not zero.

Follower growth is an outcome, not proof of causation.

Prefer language such as observed change, observed signal, performance difference, and experiment result. Do not make unsupported causal claims.

## Creator Intelligence
Creator → CreatorPost → Structured Analysis → ResearchFinding.

Structured analysis includes concepts such as:
- hookType
- structure
- topic
- tone
- format
- ctaType
- contentLength
- contentStyle
- stance
- sentenceType
- personalization

Raw/performance fields include:
- content
- postUrl
- publishedAt
- views
- likes
- replies
- reposts
- observation
- notes

AI should eventually classify posts into structured fields and persist the result.

## Pattern Intelligence
Architecture:

RAW DATA → STRUCTURED ANALYSIS → PATTERN AGGREGATION → OBSERVATION → SIGNAL → STRATEGY → EXPERIMENT

Initial dimensions:
- hookType
- structure
- contentStyle

Metrics:
- count
- meanViews
- medianViews
- availableViews
- sourcePostIds

Future signal analysis may add sample size, engagement, recency, variance, distribution, frequency, and baseline comparison.

## Strategy Intelligence
Eventually:

Creator Research + User History + User Content + Patterns + Signals + Profile
→ Strategy Candidate.

Strategy can eventually contain:
- title
- description
- hypothesis
- target pattern
- rationale
- evidence/source posts
- expected outcome
- execution instructions
- suggested frequency
- test duration
- variables
- primary metric
- success threshold

Strategies are testable hypotheses, not generic content advice.

## AI Role
AI is a component of the system, not the product itself.

AI may eventually handle:
- content classification
- research interpretation
- strategy formulation
- experiment proposals
- content generation
- experiment analysis
- learning summaries
- recommendations

Deterministic logic should remain deterministic for:
- matching
- lifecycle
- ownership
- validation
- aggregation
- calculations

AI analysis should be persisted rather than regenerated on every dashboard render.

## Long-Term Automation
Future automation pipeline:

X Sync
→ Post Ingestion
→ Content Analysis
→ Pattern Aggregation
→ Signal Detection
→ Strategy Proposal
→ Experiment Proposal
→ Content Generation
→ User Approval
→ Publishing
→ Metric Sync
→ Evaluation
→ Learning
→ Recommendation

Core domain services should eventually be callable from UI, server actions, APIs, scheduled jobs, background workers, webhooks, X integrations, and AI pipelines.

### Automation levels
**Manual:** user performs most decisions/actions.

**Assisted:** Slancialab researches, analyzes, proposes, generates; user approves important actions.

**Automated:** explicitly approved workflows can sync, analyze, prepare experiments, generate, publish, measure, evaluate, and recommend.

Do not build autonomous workflows prematurely.

## Publishing
Future:

Strategy → Content Generation → Variations → User Review → Publish/Schedule/Copy → X Post ID → ExperimentPost → Metrics.

Also support manually published posts by allowing the user to paste an X URL and associate it with an ExperimentPost.

## Integrations
### X
Core future integration:
- OAuth
- account identity
- secure tokens
- post retrieval
- metrics
- publishing where supported
- rate-limit handling
- token expiry/revocation
- synchronization

Keep X integration isolated behind provider/service abstractions.

### Authentication
Current application authentication uses Clerk.

### Payments
Future international SaaS billing is expected to use Paddle.

Architecture:

User → Subscription → Plan → Entitlements → Usage.

Billing should eventually handle checkout, subscriptions, webhooks, plan status, entitlements, and usage limits.

Do not implement billing until product validation.

### Email
Potential future transactional/onboarding/experiment/billing/security notifications.

### Analytics
Potential future product analytics for activation, experiment creation/completion, retention, usage, and conversion. Avoid vanity analytics.

### Scheduling / Jobs
Future scheduled/background workflows for X sync, metric refresh, analysis, recommendations, recurring reports, and reminders.

## Monetization
Pricing is not finalized.

Potential entitlement dimensions:
- X accounts
- own posts
- research creators
- research posts
- research refreshes
- active experiments
- AI credits
- historical data
- automation features

AI credits should remain separate from X/data usage.

Do not hardcode hypothetical pricing/credit values as final.

## Product Areas — Eventually
- Home / Command Center
- Onboarding
- Strategy Library
- Strategy Detail
- Creator Research
- Creator Profiles
- Creator Posts
- Pattern Intelligence
- Signals
- Experiments
- Experiment Results
- Content Generation
- Publishing
- Analytics
- Recommendations
- Connected X Accounts
- Settings
- Billing
- Usage
- Notifications

Not all should be built now.

## Current Phase
Days 1–5:
- onboarding
- personalization
- strategy library/matching
- creator research foundation
- creator posts
- structured analysis foundation
- pattern aggregation

Day 6:
- experiment definition
- hypothesis/protocol
- lifecycle
- baseline
- ExperimentPost
- evaluation
- ExperimentResult
- ownership validation

Day 7:
**Foundation hardening + complete tests/scripts + integration audit.**

The actual repository must be inspected before deciding what is already complete.

## Roadmap
### Phase A — Foundation
Reliable research, patterns, strategies, experiments, evaluation, tests.

### Phase B — Own X Account
OAuth → account → posts → metrics → analysis → user patterns/signals.

### Phase C — Experiment ↔ X Post
ExperimentPost linked to actual X posts and performance.

### Phase D — AI Content Analysis
Raw posts → structured analysis → persisted results.

### Phase E — Signal Intelligence
Patterns → evidence → baseline → signals.

### Phase F — Strategy Intelligence
Research + user evidence + signals → strategy candidates.

### Phase G — AI Generation + Publishing
Strategy → drafts → review → publish → measure.

### Phase H — Recommendations
Results + history + research → next experiment.

### Phase I — Automation
Progressively automate synchronization, analysis, signals, strategies, experiments, generation, publishing, measurement, evaluation, and learning.

### Phase J — Monetization
Subscriptions, Paddle, entitlements, usage, billing.

## Final Outcome
Slancialab should become a creator's continuous experimentation operating system:

**Research → Intelligence → Strategy → Experiment → Automation → Measurement → Learning → Next Experiment.**

The final product is not "AI that writes tweets." It is a system that continuously learns what works for a creator and turns that learning into the next experiment.
