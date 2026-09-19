# Slancialab

**Slancialab** is an experimentation engine for X creators built around a simple idea: stop guessing what works and start learning from what actually happens.

Instead of treating creator growth as a collection of generic tips, Slancialab helps turn observations into structured strategies, experiments, measurements, and insights.

## Product Philosophy

```text
Discover
   ↓
Study
   ↓
Identify Patterns
   ↓
Formulate Strategy
   ↓
Experiment
   ↓
Measure
   ↓
Learn
   ↓
Recommend
   ↺
```

The goal is to help creators gradually build a **personal growth system based on evidence from their own experiments**.

## Core Areas

### Creator Intelligence

A research layer for studying creators and their content.

* Creator research library
* Creator profiles
* Studied posts
* Content observations
* Pattern tagging
* Research notes
* Post-level references

Creator research provides the foundation for understanding what other creators are doing and turning those observations into potential strategies.

### Strategies

A structured library of growth strategies designed to become experiment hypotheses.

Strategies can be associated with:

* Creator niches
* Audience stages
* Content patterns
* Experiment history

### Experiments

Experiments turn strategies into measurable actions.

Each experiment can track:

* Strategy
* Status
* Start date
* Check-ins
* Follower count
* Observed change
* Measurement history

The system is designed around experimentation rather than assuming that a strategy will work before it has been tested.

### Insights

Insights transform experiment history into observations.

The insights layer surfaces:

* Measured experiments
* Positive and negative changes
* Observed signals
* Experiment performance
* Historical measurements

Observed changes are treated as signals rather than automatic proof of causation.

## Application Structure

```text
Landing Page
     │
     ▼
Authentication
     │
     ▼
Dashboard
     │
     ├── Strategies
     │      │
     │      ▼
     │   Experiments
     │      │
     │      ▼
     │   Check-ins
     │      │
     │      ▼
     │   Insights
     │
     └── Creator Intelligence
            │
            ├── Creator Library
            │
            ├── Creator Profiles
            │
            └── Studied Posts
```

## Tech Stack

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS**
* **Clerk**
* **Prisma**
* **PostgreSQL / Neon**
* **Lucide React**

## Data Model

The current data model centers around users, strategies, experiments, measurements, and creator research.

```text
User
 ├── Experiments
 │      ├── Strategy
 │      └── Check-ins
 │
Strategy
 └── Experiments

Creator
 └── Creator Posts
        ├── Pattern
        ├── Content
        ├── Observation
        └── Source
```

This structure allows creator research and personal experimentation to remain separate while providing a foundation for connecting research patterns to future strategies.

## Current Product Direction

Slancialab is being developed around two complementary intelligence layers:

**Creator Intelligence**

> What are other creators doing?

**Experiment Intelligence**

> What actually works for me?

Together, they form the basis for a continuous learning loop:

```text
Creator Research
      ↓
Patterns
      ↓
Strategies
      ↓
Experiments
      ↓
Results
      ↓
Insights
      ↓
Better Experiments
```

## Status

Slancialab is currently in active development, with the core experimentation workflow and initial Creator Intelligence research layer established.

The product is being built incrementally around the principle of **experiment → measure → learn**.

---

**Slancialab**

*Experiment. Learn. Grow.*
