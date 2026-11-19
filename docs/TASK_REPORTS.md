# Manual high-priority task reports

## What this stage does

Open AutoFlow, click **Run task report**, and read a report saved in Sanity.

The report includes published tasks where:

- Status is exactly `incomplete`.
- Priority is exactly `high`.
- `isArchived` is not `true`.

Urgent is a separate priority and is not included. Completed, in-progress, low-priority, medium-priority, archived, and draft-only tasks are excluded.

No OpenAI key is needed. Reports are generated from task data without AI. Scheduling is outside this stage.

## Setup

Install the repository dependencies from the repository root:

```sh
bun install
```

Create `apps/web/.env.local` using the Next.js variables in `.env.example`:

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-02-19
SANITY_API_TOKEN=your-server-side-write-token
```

Use the intended dataset and a token allowed to read tasks and create workflows, executions, logs, and reports. Keep the file uncommitted and never use a `NEXT_PUBLIC_` prefix for the token. Restart the web server after changing these values.

Start the web application:

```sh
cd apps/web
bun run dev
```

The home page redirects to `/reports`. The default local address is `http://localhost:3000/reports`.

To inspect reports administratively, configure the same project/dataset in `apps/studio/.env`, then start Studio in a separate terminal:

```sh
cd apps/studio
bun run dev
```

The registered Studio schemas now include **Task Reports** and embedded task snapshots. Restart Studio if it was already running before these schemas were added.

## Using the feature

1. Open **Tasks** from the navigation.
2. Create a task and choose **High Priority**. New tasks are incomplete by default.
3. Open **Reports**.
4. Click **Run task report** once.
5. The button shows a running state while the workflow executes.
6. After the save succeeds, the app opens the saved report.
7. Refresh the page or return through **Saved reports** to read it again.
8. Use **Run task report** again to create a separate, updated snapshot.

An empty report is a successful result: it says no incomplete high-priority tasks were found and is saved normally.

## How it works

1. The browser submits `POST /api/reports/run`.
2. The server creates the built-in manual workflow if it does not already exist. Its ID is `autoflow-high-priority-task-report`.
3. The existing workflow engine creates a `workflowExecution` document.
4. Its registered `generateTaskReport` action queries matching tasks directly in Sanity.
5. The action saves a `taskReport` containing task snapshots and references to the workflow and execution.
6. The engine writes timestamped step logs and records completion, together with the workflow's latest execution time.
7. The endpoint returns the saved report ID, and the browser opens `/reports/[id]`.

The workflow detail page also has **Run workflow** controls. Opening the built-in report workflow and running it there performs the same report action.

## Saved data and limits

Each `taskReport` stores its title, timestamp, summary, included count, total matching count, task snapshots, workflow reference, and execution reference.

Snapshots contain the original task ID, title, priority, and optional due date. Editing, completing, or deleting the source task does not change previously generated reports. Task titles are bounded to 200 characters in reports.

For bounded Sanity document sizes, one report includes at most **500 tasks**, ordered by most recently created first, with the task ID as a tie-breaker. The total count still includes every match, and the report explicitly says when only the latest 500 are included. Filtering happens before the limit, so unrelated tasks do not hide matching tasks.

The history page displays the **latest 50 reports**. Dates are displayed in **Asia/Kolkata (IST)** for this stage.

## Failure behavior

- Missing configuration or a failed request produces an error message and re-enables the button.
- The app only opens a saved report after the endpoint reports success.
- If report persistence fails, the engine attempts to mark the execution failed and record an error log.
- Error-log failure does not prevent a separate attempt to save failed execution status.
- If a failure occurs after the report was saved, or the response is lost, a saved report can still exist. Check history before retrying.
- Repeated deliberate runs create separate reports. This stage prevents repeated clicks while a request is pending but does not provide server-side idempotency or background recovery.
- Existing authentication is not supplied by this feature. Continue using the application as local development until protected access is implemented.

## Verification

Run the behavior tests:

```sh
cd packages/workflow-engine
bun run test
```

These tests exercise the real workflow engine and Run route with simulated Sanity persistence. They evaluate the actual task queries using Sanity's `groq-js` evaluator, a development-only dependency. They cover task exclusion, matches beyond the earlier 50-task query limit, empty reports, stable snapshots, independent repeated runs, bounded reports, persistence failures, cross-origin rejection, and missing credentials.

Run the existing type checks from `apps/web`, `apps/studio`, `packages/sanity-client`, and `packages/workflow-engine` using `bun run check-types`. Run `bun run lint` in the web and Studio applications. Run `bun run build` in the web application for a production build.

For a live check:

1. Create one incomplete High task, one incomplete Low task, and one High task marked completed through Studio.
2. Generate a report and confirm it contains only the incomplete High task among those examples.
3. Confirm the report, completed execution, and timestamped logs appear in Studio.
4. Change or complete the included task through Studio.
5. Refresh the original report and confirm its snapshot remains unchanged.
6. Run again and confirm a new report reflects the current task state.

Passing the automated tests does not establish that the configured live Sanity project or token has been verified.
