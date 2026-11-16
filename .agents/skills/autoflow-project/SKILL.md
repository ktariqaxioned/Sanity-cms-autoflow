---
name: autoflow-project
description: Complete project skill for designing, developing, maintaining, and extending AutoFlow, a personal AI-powered workflow automation platform built with Bun, Turborepo, Next.js, TypeScript, and Sanity CMS as its only application backend.
---

# AutoFlow – Complete Project Skill

## 1. Project identity

**Project name:** AutoFlow

**Project type:** Personal AI-powered automation and productivity platform.

**Primary purpose:** Build a responsive web application that allows a person to create, manage, schedule, and execute automated workflows using natural-language AI instructions and a visual workflow builder.

AutoFlow is intended to become a personal automation engine rather than just another task manager, chatbot, or note-taking application.

Users should be able to describe repetitive work in ordinary language, convert those instructions into structured workflows, and let the application execute approved actions automatically.

### Core product vision

AutoFlow should help users:

- Automate repetitive digital tasks.
- Organize personal information.
- Manage tasks and deadlines.
- Generate AI-powered summaries.
- Create automated daily and weekly reports.
- Build reusable workflows.
- Connect external services.
- Monitor workflow executions.
- Understand failures and retry failed operations.
- Control when automations run and what actions they can perform.

The application should be responsive and usable on desktop, tablet, and mobile devices.

---

## 2. Non-negotiable project decisions

These decisions have been established and should not be changed without explicit user approval.

| Area | Decision |
|---|---|
| Project | AutoFlow |
| Monorepo | Turborepo |
| Package manager | Bun |
| Frontend | Next.js |
| Language | TypeScript |
| UI styling | Tailwind CSS |
| Component library | shadcn/ui |
| Workflow visual builder | React Flow |
| CMS | Sanity Studio |
| Only application backend/data store | Sanity Content Lake |
| AI | OpenAI API |
| Validation | Zod |
| Architecture | Modular monorepo |
| Initial user scope | Personal, single-user application |
| Workflow creation | AI-assisted and visual |
| Trigger support | Scheduled and event-based |
| Responsive support | Desktop, tablet, mobile |

### Critical backend restriction

**Use Sanity CMS / Sanity Content Lake as the only application database and persistent application data backend.**

Do not introduce:

- Supabase
- Firebase
- PostgreSQL
- MySQL
- MongoDB
- Prisma with another database
- Redis as an application data store
- Another database to persist workflow executions or application state

Sanity must store persistent application information, including:

- Workflow definitions
- Workflow templates
- Workflow execution records
- Execution logs
- User preferences
- Integration metadata
- Automation settings
- Task and note records, when implemented as application features

AI providers, email APIs, external integrations, and scheduled execution infrastructure are permitted. They are services, not alternative application databases.

Never place API keys, passwords, OAuth refresh tokens, or privileged credentials in ordinary Sanity documents.

---

## 3. Product functionality

### 3.1 Dashboard

The dashboard should provide a centralized overview.

Features:

- Total workflows.
- Active workflows.
- Paused workflows.
- Successful executions.
- Failed executions.
- Recent activity.
- Upcoming scheduled automations.
- Quick workflow creation.
- Productivity summaries.

### 3.2 Workflow management

Users should be able to:

- Create workflows.
- Edit workflows.
- Delete workflows.
- Duplicate workflows.
- Activate and pause workflows.
- Run workflows manually.
- View workflow details.
- Configure triggers.
- Configure actions.
- Configure conditions.
- View execution history.

### 3.3 AI automation assistant

Users should be able to describe an automation in natural language.

Example:

"Every morning at 8 AM, check my incomplete tasks, identify the most important ones, generate a daily summary, and notify me."

The AI assistant should:

1. Understand the user's instruction.
2. Identify the trigger.
3. Identify required actions.
4. Determine dependencies between actions.
5. Generate a structured workflow definition.
6. Validate the workflow.
7. Present the workflow for review.
8. Save it to Sanity after user confirmation.

AI-generated workflows must not be executed automatically before validation and appropriate user approval.

### 3.4 Visual workflow builder

Provide a drag-and-drop workflow editor using React Flow.

Node categories:

- Trigger nodes.
- Action nodes.
- AI processing nodes.
- Condition nodes.
- Notification nodes.

Users should be able to connect nodes and define execution order.

The visual builder should serialize the workflow into a validated structured representation that the workflow engine can execute.

### 3.5 Workflow execution center

Features:

- Execution history.
- Running executions.
- Successful executions.
- Failed executions.
- Step-level execution information.
- Error messages.
- Retry operations.
- Execution timestamps.
- Execution details.

### 3.6 Templates

Initial template ideas:

1. Morning productivity briefing.
2. Weekly productivity report.
3. Smart note organizer.
4. Article summarizer.
5. Deadline reminder.
6. Project task generator.
7. Learning reminder.
8. Document information extractor.
9. Failed workflow monitor.
10. Evening productivity review.

### 3.7 Integrations

Potential integrations:

- Email services.
- Calendar services.
- Notification services.
- Article and webpage retrieval.
- External productivity APIs.

Integrations should be implemented through server-side adapters.

Store integration metadata and connection status in Sanity. Store credentials securely outside Sanity.

---

## 4. Architecture

Use a modular monolith initially.

Do not introduce microservices without a demonstrated need.

### High-level architecture

```text
User
 |
 v
Next.js Frontend
 |
 v
Next.js Server/API Layer
 |
 +------------------------+
 |                        |
 v                        v
Sanity Content Lake     OpenAI API
 |                        |
 |                        |
 v                        v
Workflow Definitions    AI Processing
 |
 v
Workflow Engine
 |
 +---------------------------+
 |             |             |
 v             v             v
Triggers      Actions      Conditions
 |             |             |
 +-------------+-------------+
               |
               v
       Execution Records
               |
               v
        Sanity Content Lake
```

### Architectural responsibilities

**Next.js frontend**

- User interface.
- Dashboard.
- Workflow management.
- Visual editor.
- AI assistant interface.
- Execution monitoring.

**Next.js server/API layer**

- Authentication.
- Input validation.
- Sanity reads and mutations.
- AI orchestration.
- Integration adapters.
- Workflow management operations.

**Sanity Content Lake**

- Persistent application documents.
- Workflow definitions.
- Execution records.
- Logs.
- Settings.
- Templates.

**Workflow engine**

- Reads validated workflow definitions.
- Resolves approved action handlers.
- Executes steps in order.
- Evaluates conditions.
- Handles errors and retries.
- Records execution status.

**Scheduler and event infrastructure**

- Starts scheduled workflows.
- Receives Sanity webhook events.
- Starts appropriate executions.
- Invokes server-side execution handlers.

The scheduler and execution infrastructure must not introduce another application database.

---

## 5. Monorepo structure

The intended repository organization is:

```text
autoflow/
│
├── apps/
│   │
│   ├── web/
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/
│   │       │   ├── (dashboard)/
│   │       │   │   ├── dashboard/
│   │       │   │   ├── workflows/
│   │       │   │   ├── templates/
│   │       │   │   ├── executions/
│   │       │   │   ├── integrations/
│   │       │   │   ├── ai-assistant/
│   │       │   │   └── settings/
│   │       │   └── api/
│   │       │       ├── workflows/
│   │       │       ├── ai/
│   │       │       ├── executions/
│   │       │       ├── triggers/
│   │       │       └── webhooks/
│   │       │
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   ├── layout/
│   │       │   ├── dashboard/
│   │       │   ├── workflow/
│   │       │   └── execution/
│   │       │
│   │       ├── features/
│   │       │   ├── workflows/
│   │       │   ├── ai-assistant/
│   │       │   ├── templates/
│   │       │   ├── integrations/
│   │       │   └── monitoring/
│   │       │
│   │       ├── hooks/
│   │       ├── providers/
│   │       ├── lib/
│   │       └── styles/
│   │
│   └── studio/
│       ├── schemaTypes/
│       │   ├── documents/
│       │   ├── objects/
│       │   └── index.ts
│       ├── structure/
│       ├── sanity.config.ts
│       ├── sanity.cli.ts
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   └── src/
│   │       ├── types/
│   │       ├── constants/
│   │       ├── validators/
│   │       └── index.ts
│   │
│   ├── sanity-client/
│   │   └── src/
│   │       ├── client.ts
│   │       ├── queries.ts
│   │       ├── mutations.ts
│   │       ├── assets.ts
│   │       └── index.ts
│   │
│   └── workflow-engine/
│       └── src/
│           ├── engine.ts
│           ├── executor.ts
│           ├── registry.ts
│           ├── conditions.ts
│           ├── retry.ts
│           ├── actions/
│           └── index.ts
│
├── infrastructure/
│   ├── scheduler/
│   └── webhooks/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── turbo.json
├── package.json
├── bun.lock
├── tsconfig.json
└── README.md
```

This is the intended target structure, not a claim that every folder has already been implemented.

Preserve the actual repository structure when working on the project. Do not recreate or overwrite existing files unnecessarily.

---

## 6. Sanity CMS architecture

Sanity Studio lives in:

```text
apps/studio/
```

Use `schemaTypes/documents` for independent document schemas and `schemaTypes/objects` for reusable embedded object schemas.

### Document versus object

A document:

- Has its own `_id`.
- Is independently stored in Sanity.
- Can be queried independently.
- Can be referenced by other documents.

An object:

- Does not have its own independent document identity.
- Is embedded inside a document or another object.
- Groups reusable related fields.

The folder name is an organizational convention. Sanity determines schema behavior from `type: "document"` and `type: "object"`.

### Initial document schemas

| Schema | Responsibility |
|---|---|
| workflow | Automation definition |
| workflowExecution | Individual workflow run |
| workflowLog | Execution event and diagnostic information |
| workflowTemplate | Reusable automation template |

Additional schemas can include:

| Schema | Responsibility |
|---|---|
| userProfile | User preferences and profile |
| automationSettings | Global automation preferences |
| integration | External integration metadata |
| task | Personal tasks, if implemented |
| note | Personal knowledge records, if implemented |

### Initial object schemas

| Schema | Responsibility |
|---|---|
| trigger | Workflow trigger configuration |
| workflowStep | Action, AI, or condition step |
| workflowCondition | Conditional evaluation |
| retryPolicy | Retry configuration |

### Important data modeling rules

- Separate workflow definitions from workflow execution records.
- Keep execution logs in independent documents.
- Use Sanity references for relationships.
- Avoid storing unlimited execution history inside workflow documents.
- Use bounded document sizes.
- Use GROQ for reads.
- Use Sanity mutations for writes.
- Use transactions when multiple related mutations must be atomic.
- Add ownership fields and access checks when multi-user functionality is introduced.
- Generate TypeScript types using Sanity TypeGen.
- Validate incoming data on the server.

### Initial workflow schema fields

A workflow should support:

- Name.
- Description.
- Status.
- Trigger.
- Steps.
- Creation timestamp.
- Last execution timestamp.
- Optional category and metadata.

### Trigger types

Initially support:

- Manual.
- Schedule.
- Document event.

### Workflow step types

Initially support:

- Action.
- AI processing.
- Condition.

### Execution status

Support:

- Queued.
- Running.
- Completed.
- Failed.
- Cancelled.

---

## 7. Workflow engine design

The workflow engine is the central execution component.

It should use a registry-based execution model.

Example:

```ts
const actionRegistry = {
  fetchTasks,
  summarizeContent,
  createNotification,
};
```

The engine resolves action identifiers against approved handlers.

Never execute arbitrary code from workflow documents.

### Execution lifecycle

```text
Workflow Triggered
       |
       v
Create Execution Record
       |
       v
Load Workflow Definition
       |
       v
Validate Workflow
       |
       v
Execute First Step
       |
       v
Evaluate Result
       |
       v
Execute Next Step
       |
       v
Save Logs and Status
       |
       v
Complete or Fail
```

### Required reliability features

- Input validation.
- Execution timeouts.
- Idempotency keys.
- Bounded retries.
- Concurrency limits.
- Step-level logs.
- Failure reporting.
- Interrupted-execution recovery.
- Duplicate-trigger protection.
- Human approval for sensitive actions.

Each execution should have an independent Sanity document.

Each step should produce structured diagnostic information.

Use a safe, explicitly defined workflow format rather than arbitrary JavaScript stored in Sanity.

---

## 8. Scheduling and event handling

AutoFlow must support both scheduled and event-based workflows.

### Scheduled workflows

Example:

```text
Every day at 8 AM
Timezone: Asia/Kolkata
```

Use a scheduled server-side function or worker to inspect due workflows and start their executions.

Do not depend on the Next.js frontend being open.

### Event-based workflows

Example:

```text
When a new note is created:
    Retrieve note
    Generate summary
    Identify tags
    Update note
```

Sanity webhooks can notify the application of document changes.

Verify webhook signatures and validate incoming payloads.

A webhook is an event notification mechanism, not a complete workflow scheduler or durable execution engine.

### Manual workflows

The user can select Run Now.

The frontend should invoke an authenticated server endpoint that starts the workflow.

---

## 9. AI integration

Use OpenAI API through server-side code.

Never expose AI API keys to the browser.

AI responsibilities:

- Natural-language workflow interpretation.
- Workflow generation.
- Content summarization.
- Note classification.
- Priority suggestions.
- Information extraction.
- Structured output generation.

### AI workflow generation process

```text
User Instruction
       |
       v
AI Interpretation
       |
       v
Structured Workflow JSON
       |
       v
Zod Validation
       |
       v
Permission and Safety Checks
       |
       v
User Review
       |
       v
Save to Sanity
       |
       v
Ready for Execution
```

AI-generated definitions must be validated before storage and execution.

Do not trust model-generated action names, parameters, URLs, or instructions without validation.

---

## 10. Security requirements

Security is part of the initial architecture.

### Sanity

- Keep privileged tokens server-side.
- Do not expose write tokens in client-side bundles.
- Use least-privilege access where possible.
- Validate every mutation.
- Enforce ownership and authorization.
- Avoid storing secrets in documents.

### AI

- Use server-side API calls.
- Validate generated structured output.
- Apply token and request limits.
- Avoid unnecessary sensitive data in prompts.

### Workflow execution

- Only allow registered action handlers.
- Validate all action arguments.
- Apply execution timeouts.
- Use bounded retries.
- Prevent duplicate execution.
- Require approval for consequential operations.
- Log failures without leaking credentials.

### Integrations

- Keep credentials in environment variables or a secure secrets manager.
- Do not put OAuth tokens into ordinary integration metadata documents.
- Verify external webhook signatures.
- Use secure authentication and authorization.

---

## 11. Development roadmap

Build AutoFlow incrementally.

### Phase 1 – Foundation

- Initialize Bun and Turborepo monorepo.
- Create Next.js application.
- Create Sanity Studio.
- Configure Sanity project and dataset.
- Configure shared TypeScript settings.
- Establish environment variable conventions.

### Phase 2 – Sanity data architecture

- Implement document schemas.
- Implement reusable object schemas.
- Register schemas.
- Configure Studio structure.
- Set up Sanity client.
- Configure GROQ queries and mutations.
- Configure Sanity TypeGen.
- Add validation.

### Phase 3 – Frontend foundation

- Build application layout.
- Create responsive navigation.
- Create dashboard.
- Add reusable UI components.
- Configure frontend providers.
- Connect frontend to Sanity.

### Phase 4 – Workflow management

- Implement workflow listing.
- Create workflow.
- Edit workflow.
- Delete workflow.
- Duplicate workflow.
- Activate and pause workflow.
- Add workflow details.

### Phase 5 – Execution engine

- Define workflow specification.
- Implement action registry.
- Implement executor.
- Implement conditions.
- Implement execution records.
- Implement logs.
- Implement retry policies.
- Add idempotency.

### Phase 6 – AI assistant

- Integrate OpenAI API.
- Create natural-language workflow generation.
- Validate generated definitions.
- Add workflow preview.
- Add approval and save functionality.

### Phase 7 – Visual builder

- Integrate React Flow.
- Create trigger nodes.
- Create action nodes.
- Create AI nodes.
- Create condition nodes.
- Implement connections.
- Serialize and validate workflows.

### Phase 8 – Automation infrastructure

- Implement scheduled execution.
- Implement Sanity webhooks.
- Implement event handlers.
- Implement integration adapters.
- Implement notifications.
- Add failure recovery.

### Phase 9 – Monitoring and production readiness

- Execution monitoring.
- Error diagnostics.
- Security review.
- Unit tests.
- Integration tests.
- End-to-end tests.
- Deployment.
- Documentation.

---

## 12. Development conventions

Follow these standards throughout the project.

### TypeScript

- Prefer strict TypeScript.
- Avoid `any`.
- Define explicit domain types.
- Reuse shared types.
- Validate untrusted input at runtime.

### React and Next.js

- Prefer Server Components for server-rendered data.
- Use Client Components only where interactivity is needed.
- Keep server-only code out of browser bundles.
- Separate business logic from UI components.
- Use server routes for privileged operations.

### Sanity

- Keep schemas modular.
- Use descriptive field names.
- Add meaningful validation.
- Keep document relationships explicit.
- Avoid oversized nested documents.
- Use generated types where possible.

### Project structure

- Organize by feature and responsibility.
- Avoid unnecessary abstractions.
- Do not create duplicate service layers.
- Keep reusable packages independent.
- Maintain consistent import paths.

### UI/UX

- Responsive design first.
- Clear loading, empty, success, and error states.
- Accessible controls.
- Consistent design system.
- Useful confirmations for destructive actions.
- Clear execution status indicators.

---

## 13. Environment variables

Use `.env.example` to document required environment variables.

Illustrative variables:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=

SANITY_API_TOKEN=

OPENAI_API_KEY=

AUTH_SECRET=

NEXT_PUBLIC_APP_URL=
```

Only expose public, non-sensitive Sanity configuration to the browser.

Do not commit real secrets.

Authentication implementation must be selected and configured before exposing protected application functionality.

---

## 14. Current project progress and conversation decisions

The following is the project history established so far.

### Confirmed user decisions

1. The project is named AutoFlow.
2. It is a personal productivity and automation application.
3. It should use advanced AI and automation.
4. It should support responsive web interfaces.
5. Sanity CMS must be the only application backend/data store.
6. The repository should use Turborepo.
7. Bun should be used as the package manager and runtime.
8. The architecture should separate frontend and Sanity Studio.
9. Workflow creation should support AI and visual building.
10. The initial scope is personal single-user use.
11. Both scheduled and event-based automation are desired.

### Discussed repository layout

```text
autoflow/
├── apps/
│   ├── web/
│   └── studio/
├── packages/
│   ├── shared/
│   ├── sanity-client/
│   └── workflow-engine/
├── infrastructure/
├── tests/
├── package.json
├── turbo.json
└── bun.lock
```

### Sanity schemas discussed

Documents:

- workflow
- workflowExecution
- workflowLog
- workflowTemplate

Objects:

- trigger
- workflowStep
- workflowCondition
- retryPolicy (planned)

### Commands discussed

Create Turborepo:

```bash
bunx create-turbo@latest autoflow
cd autoflow
```

Create the Next.js application:

```bash
bunx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir
```

Create Sanity Studio using Bun's create command:

```bash
cd apps
bun create sanity@latest
```

Select `studio` as the output directory, resulting in `apps/studio`.

Important: `bunx create sanity@latest` is not the correct command. Use `bun create sanity@latest`.

### Progress must not be assumed

The commands and code snippets above were discussed in the conversation, but their successful completion has not been independently verified.

Before changing files or continuing implementation:

1. Inspect the actual repository.
2. Identify which applications and packages exist.
3. Inspect existing package manifests.
4. Inspect the Sanity configuration.
5. Inspect the registered schemas.
6. Preserve working code.
7. Identify incomplete work.
8. Continue from the actual project state.

Do not claim a feature is implemented merely because it appears in this skill.

---

## 15. How an AI coding assistant should work on AutoFlow

When assisting with AutoFlow development, follow this workflow:

### Before implementation

- Understand the requested feature.
- Check the existing project structure.
- Identify the relevant files.
- Check the existing schemas and types.
- Identify dependencies.
- Respect the Sanity-only backend constraint.
- Explain architectural implications where relevant.

### During implementation

- Work within the existing monorepo.
- Prefer the existing libraries and conventions.
- Keep changes modular.
- Add appropriate types and validation.
- Update Sanity schemas when the data model changes.
- Keep frontend and backend contracts synchronized.
- Avoid unnecessary dependencies.
- Avoid replacing working files wholesale.

### After implementation

- Explain which files changed.
- Explain how the feature works.
- Provide Bun commands to install or run anything required.
- Identify environment variables.
- Report any unimplemented parts.
- Provide test instructions.
- Do not claim tests passed unless they were actually run.

### When requirements are ambiguous

Ask one specific clarification rather than making a major architectural decision without approval.

### When proposing a new dependency

Explain why it is needed and verify that it does not violate the project's backend constraint.

---

## 16. Definition of done

A feature is not complete merely because its interface exists.

A feature should be considered complete only when:

- Its UI works.
- Its server-side logic works.
- Its Sanity data model is correct.
- Its validation is implemented.
- Its error states are handled.
- Its authorization is correct.
- Its responsive behavior is verified.
- Relevant tests pass.
- Its documentation is updated.

For workflow execution specifically, verify that the execution record, status transitions, logs, and failure handling work correctly.

---

## 17. Final project principle

AutoFlow should be developed as a reliable, maintainable personal AI automation platform.

The central design principle is:

**Next.js provides the user experience. Sanity Content Lake stores the application's persistent data. OpenAI provides AI capabilities. The workflow engine executes approved automation logic. Scheduling and integration infrastructure trigger and connect these operations.**

Keep these responsibilities separate.

Never replace Sanity with another application database without explicit approval.

Prioritize correctness, security, reliability, maintainability, and a clear user experience over unnecessary architectural complexity.
