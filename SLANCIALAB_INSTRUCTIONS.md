# Slancialab — Permanent Development Instructions

## 1. Source of Truth
The actual repository is the source of truth.

Use `SLANCIALAB_CONTEXT.md` for product intent, architecture, roadmap, and outcome. Never assume the repository perfectly matches it.

If context and code disagree:
1. inspect the code,
2. report the difference,
3. determine what is outdated,
4. do not silently rewrite the project.

## 2. Development Loop
Always:

INSPECT → UNDERSTAND → PLAN → IMPLEMENT → TEST → VERIFY → REPORT

Do not skip inspection.

## 3. One File at a Time
Prefer one coherent file change at a time.

Before editing:
- read the complete relevant file
- understand dependencies
- preserve existing behavior
- inspect related tests

Do not rewrite unrelated functionality.

When the user asks for code, provide the complete file rather than partial snippets.

## 4. Tests and Scripts Are Mandatory
Production implementation alone does not mean done.

For important business logic, an executable test must exist.

If a required test file does not exist: **CREATE IT.**

If a useful verification script does not exist: **CREATE IT.**

Never leave core logic as "test later."

## 5. Required Test Coverage
Maintain executable coverage for:

### Strategy
- deterministic matching
- canonical vocabulary
- personalization

### Pattern Intelligence
- mean
- median
- count
- missing views
- missing analysis
- multiple patterns
- source post IDs
- 0 posts
- 1 post
- 2 posts

Known deterministic dataset:
10K, 12K, 18K, 20K, 40K
Expected mean = 20K
Expected median = 18K

### Experiments
- duplicate active experiment prevention
- strategy reuse after completion
- strategy reuse after deletion
- cross-user mutation blocked
- dependent records handled correctly
- Strategy preserved after experiment deletion
- ResearchFinding preserved where intended
- completed experiment cannot receive measurements
- invalid lifecycle transitions
- baseline behavior
- evaluation behavior

### Measurements
- valid values
- chronology
- duplicate same-day behavior
- timezone behavior
- historical edits
- follower decreases
- completed experiment restrictions

If these tests/scripts do not exist in the repository, implement them.

## 6. Real Verification
Never claim tests pass without actually running them.

After meaningful changes:
- run relevant tests
- run typecheck where relevant
- run build where structural changes require it
- inspect Prisma state when database changes occur

Report actual results.

## 7. Business Logic
Core logic belongs in reusable services/modules.

Avoid putting intelligence directly inside:
- React components
- pages
- UI handlers
- route-specific code

Prefer:

UI → action/API → domain/service → database

This is necessary because future automation will call the same services without a UI.

## 8. Automation-Ready Architecture
Slancialab will eventually automate much of its experimentation loop.

Design domain services so they can later be invoked by:
- UI
- server actions
- APIs
- scheduled jobs
- background workers
- webhooks
- X synchronization
- AI pipelines

Do not make React components the source of truth for intelligence.

Do not prematurely build autonomous workflows unless explicitly requested.

## 9. Current Scope
Current priority is foundation reliability.

Do not jump ahead into:
- X OAuth
- publishing
- billing/Paddle
- ML
- recommendation engines
- autonomous agents
- enterprise
- multi-platform

unless explicitly requested or the current milestone is complete.

## 10. Experimental Integrity
Always distinguish:

Observation → Signal → Hypothesis → Experiment → Result → Learning

Never turn correlation into causation.

Avoid unsupported terms such as "caused", "proven", or "guaranteed".

Follower growth is an outcome, not proof of causality.

## 11. Missing Data
Never treat missing metrics as zero.

`views = null` is not `views = 0`.

Preserve metric availability.

## 12. Deterministic Foundations
Prefer deterministic logic for:
- matching
- validation
- lifecycle
- ownership
- aggregation
- calculations
- permissions

Use AI where probabilistic reasoning is useful:
- content classification
- research interpretation
- strategy formulation
- generation
- qualitative analysis

## 13. AI Persistence
Prefer:

Raw content → AI analysis → structured fields → persist → reuse

Do not call expensive AI analysis on every dashboard render.

## 14. Security
Protected operation:

Authenticate
→ internal user lookup
→ resource lookup
→ ownership check
→ input validation
→ mutation

Never trust client-provided ownership.

Cross-user access must be tested.

## 15. Database Discipline
For Prisma changes:
1. inspect schema
2. inspect relationships
3. inspect migrations
4. make minimal change
5. create migration
6. regenerate client if needed
7. run tests
8. verify existing functionality

Do not silently alter relationships.

## 16. User Changes / Git
Never discard unrelated user work.

Before editing:
- inspect `git status`
- understand existing changes
- preserve uncommitted work

Do not use destructive reset/clean commands to remove user changes unless explicitly instructed.

Do not commit or push unless explicitly requested.

## 17. UI Discipline
Do not rewrite UI simply because a cleaner implementation is possible.

Preserve working:
- flows
- visual identity
- interactions
- functionality

Only change UI when it is part of the task.

## 18. Day-Based Workflow
At the start of each development day:
1. inspect repository
2. inspect git status
3. review recent work
4. compare implementation with milestone
5. identify missing tests/scripts
6. select ONE highest-value task
7. implement it
8. add/update tests
9. verify
10. report

Do not blindly follow old checklists if the repository has advanced.

## 19. Progress Report
After meaningful work, report:

### Completed
What was actually implemented.

### Tests / Verification
What was actually run and passed.

### Added
New files/tests/scripts/migrations.

### Changed
Existing files modified.

### Remaining
What is incomplete.

### Risks
Architecture/data/security concerns.

### Next
ONE highest-value next task.

Never claim scaffolded functionality is fully implemented.

## 20. Definition of Done
Done means:
- implementation exists
- business rules are enforced
- ownership/security is enforced
- edge cases are handled
- automated tests exist
- tests pass
- useful scripts exist
- typecheck/build is healthy where relevant
- migrations are correct where relevant
- existing behavior remains intact
- future automation is not unnecessarily constrained

A page existing is not enough.
A button working manually is not enough.
A successful TypeScript compile is not enough.

## 21. Product Direction
The eventual system is:

X Data
→ Analysis
→ Patterns
→ Signals
→ Strategies
→ Experiments
→ Generated Content
→ Publishing
→ Metrics
→ Evaluation
→ Learning
→ Recommendations
→ Automation

Build today's foundation so that this future does not require a rewrite.

## 22. Final Principle
Do not optimize for maximum code written.

Optimize for maximum validated product capability per unit of complexity.

Build a small, reliable experimentation engine first.

Then progressively add:

X integration
→ AI intelligence
→ publishing
→ recommendations
→ automation
→ monetization

The final product should continuously learn what works for each creator and turn that learning into the next experiment.
