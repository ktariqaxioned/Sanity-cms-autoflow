# AutoFlow — Remaining Features and Project Completion Checklist

Reviewed: November 19, 2026

## 1. Purpose and scope

AutoFlow is a personal AI automation application. A user defines when a workflow should start, what actions it should perform, and how to inspect the results.

The finished experience should support:

1. Create a workflow through a guided form, AI assistance, or a visual editor.
2. Choose a manual, scheduled, or Sanity document-event trigger.
3. Configure approved actions, AI processing, and conditions.
4. Review and test the workflow.
5. Activate it for automatic execution.
6. Inspect execution history, outputs, logs, and failures.
7. Pause, update, cancel, or retry operations where supported.

This checklist combines the supplied project handoff with inspection of the current source files. Existing code has not been verified through a live application session or live Sanity execution during this review. An unchecked item is work remaining to implement or verify, not a claim that no related code exists.

### Architecture to preserve

- Bun and Turborepo for the monorepo.
- Next.js and TypeScript for the application and server routes.
- Tailwind CSS and the existing shared UI components.
- Sanity Studio for administrative content management.
- Sanity Content Lake as the only persistent application data store.
- A custom TypeScript engine that executes registered actions.
- OpenAI requests on the server.
- Zod for runtime validation and React Flow for the planned visual builder.
- Environment variables or an appropriate secrets manager for credentials.

Server-side workers, scheduled functions, and external integration APIs are permitted. They must not introduce another persistent application database or persistent queue without explicit approval.

## 2. Current implementation baseline

| Area | Evidence in the current repository | Remaining gap |
| --- | --- | --- |
| Foundation | Web app, Studio, shared packages, Bun workspace, Turborepo configuration | Verify checks and replace starter documentation |
| Task management | Create/list APIs, creation form, task cards | Update, complete, archive, due-date entry, filtering |
| Workflow management | Create/list/detail screens and activate/pause/delete controls | Edit, duplicate, guided configuration, runtime verification |
| Manual execution | Run endpoint and sequential executor | Run interface, result display, end-to-end verification |
| Action registry | Approved-handler lookup and built-in registration | More actions and per-action validation |
| Built-in actions | `fetchTasks` | Useful filtering and actions that perform work |
| Execution storage | Execution/log schemas and engine writes | Durable outputs, richer step records, reliable failure handling |
| Monitoring queries | Execution list/detail and log queries | Monitoring routes and screens |
| Scheduling | Trigger fields and schedule inputs | Dispatcher, duplicate protection, next-run display |
| Document events | Trigger configuration | Verified webhook receiver and event dispatch |
| Conditions | Condition schema and selectable step type | Runtime semantics and execution |
| AI | Selectable AI step type | Server integration, AI actions, workflow generation |
| Visual builder | Described in the project plan | React Flow editor and compatible execution model |
| Templates | Schema and query | Template browser and create-from-template flow |
| Application shell | Individual feature pages | AutoFlow home page, dashboard, navigation, settings |
| Authentication | No authentication layer found in the inspected application routes | Protected access before public deployment |

The web configuration no longer contains the previously reported `baseUrl` option. The web package now declares the workflow-engine dependency. These observations do not establish that type checking or execution succeeds.

## 3. Milestone 1 — Complete manual execution

**User outcome:** Open a saved workflow, click Run, and see its actual result.

- [ ] Verify package resolution and the existing TypeScript, lint, and build checks.
- [ ] Correct any failures without replacing working architecture.
- [ ] Add a Run button to the workflow detail page.
- [ ] Connect the button to the existing manual execution endpoint.
- [ ] Show submitting, running, completed, and failed states accurately.
- [ ] Prevent accidental repeated submissions while a request is pending.
- [ ] Display the execution ID and useful final output.
- [ ] Link the result to its execution detail page when available.
- [ ] Return meaningful errors for missing workflows and invalid definitions.
- [ ] Define whether drafts and paused workflows can be tested manually.
- [ ] Enforce that policy on the server.
- [ ] Verify a successful run creates execution and log documents in Sanity.
- [ ] Verify an unsuccessful run records failure correctly.
- [ ] Update the workflow's `lastExecutedAt` using a defined execution-start or completion policy.

**Completion check:** A user can run a saved `fetchTasks` workflow and inspect a real response. Both success and failure paths are verified against Sanity.

## 4. Milestone 2 — Execution history and results

**User outcome:** Understand what ran, what happened, and what needs attention.

- [ ] Build an execution history page across workflows.
- [ ] Add execution history to each workflow detail page.
- [ ] Build an execution detail page.
- [ ] Show workflow name, trigger source, status, start time, completion time, and duration.
- [ ] Filter history by workflow, status, and date range.
- [ ] Paginate execution history and logs rather than relying on fixed result limits.
- [ ] Display step progress and the exact step that failed.
- [ ] Save and display bounded, safe step outputs and final results.
- [ ] Record explicit timestamps when the engine creates logs through the API.
- [ ] Add structured log metadata where useful, including step ID and attempt.
- [ ] Show retry and cancellation information when those features exist.
- [ ] Refresh running executions through polling or a suitable live update mechanism.
- [ ] Stop updates after a terminal state or when the user leaves the page.
- [ ] Add loading, empty, not-found, and error states.
- [ ] Redact credentials and avoid exposing unnecessary sensitive content.

**Completion check:** Reloading a completed or failed execution still shows its saved result, timeline, and diagnostic details.

## 5. Milestone 3 — Useful actions and task operations

**User outcome:** Workflows perform useful work beyond retrieving a task list.

### Initial action set

- [ ] Extend task fetching with supported status, priority, due-date, and limit filters.
- [ ] Ensure the action explicitly distinguishes incomplete tasks from all non-archived tasks.
- [ ] Apply result limits in the Sanity query rather than only slicing fetched results.
- [ ] Add a create-task action.
- [ ] Add an update-task action, including completion status.
- [ ] Add an archive-task action if included in the first release.
- [ ] Add an action that saves a report or generated result to Sanity.
- [ ] Give each action a clear name, description, configuration schema, and output contract.
- [ ] Define which actions read data and which change data.
- [ ] Define retry safety and approval requirements for actions with external effects.

### Task interface

- [ ] Edit task titles, descriptions, priorities, and due dates.
- [ ] Mark tasks incomplete, in progress, or completed.
- [ ] Archive and restore tasks where supported.
- [ ] Add task search, filtering, and pagination.
- [ ] Ensure summary counts describe the complete matching dataset, not only the loaded page.
- [ ] Keep the task feature focused on supplying and inspecting automation inputs.

**Completion check:** A workflow can fetch selected tasks and perform a second meaningful action with their data.

## 6. Milestone 4 — Workflow editing and validation

**User outcome:** Configure supported workflows without entering internal handler names or raw JSON.

### Workflow interface

- [ ] Edit an existing workflow's name, description, trigger, and steps.
- [ ] Duplicate a workflow with fresh workflow identity and appropriate step identifiers.
- [ ] Reorder, insert, and remove steps.
- [ ] Replace free-text action names with a registered-action picker.
- [ ] Provide action-specific configuration fields and examples.
- [ ] Provide clear schedule and event-trigger configuration.
- [ ] Show validation errors beside the relevant field or step.
- [ ] Clearly mark or disable AI, condition, and automatic triggers until executable.
- [ ] Warn about unsaved changes.
- [ ] Verify activate, pause, and delete behavior at runtime.
- [ ] Define deletion behavior when executions reference a workflow; preserve useful history.
- [ ] Decide how edits affect running executions and use a consistent definition snapshot or version policy.

### Shared contracts and runtime validation

- [ ] Define shared types and Zod schemas for workflows, triggers, steps, actions, and execution results.
- [ ] Validate complete request bodies on the server before mutation.
- [ ] Validate again before execution, including documents edited through Studio.
- [ ] Reject unknown trigger types, step types, actions, and unsupported settings.
- [ ] Validate cron expressions, timezones, document-event settings, and action arguments.
- [ ] Enforce unique step IDs and valid references between steps.
- [ ] Define bounded workflow sizes, input sizes, and output sizes.
- [ ] Replace unsafe casts and `any` in relevant application paths.
- [ ] Add a workflow format version for future changes.
- [ ] Configure Sanity TypeGen and use generated types where appropriate.

**Completion check:** An unsupported or malformed workflow cannot be saved or executed through either the web application or direct requests.

## 7. Milestone 5 — Reliable execution

**User outcome:** Runs remain understandable and recoverable when something goes wrong.

- [ ] Define and enforce queued, running, completed, failed, and cancelled transitions.
- [ ] Separate execution submission from processing for workflows that outlast an ordinary request.
- [ ] Store durable execution state in Sanity.
- [ ] Use atomic claiming or equivalent coordination to avoid concurrent processing of one execution.
- [ ] Assign an idempotency key to each logical trigger or submission.
- [ ] Prevent duplicate execution during repeated requests and trigger delivery.
- [ ] Apply step timeouts and an overall execution deadline.
- [ ] Add bounded retries with delays and a distinction between retryable and permanent failures.
- [ ] Avoid repeating successful external effects without an explicit safe replay strategy.
- [ ] Limit concurrent workflows and requests to external providers.
- [ ] Support cancellation requests and stop between steps; abort supported in-flight operations.
- [ ] Record completed steps and execution checkpoints where recovery requires them.
- [ ] Detect interrupted or stale runs and mark or recover them according to a defined policy.
- [ ] Harden error handling so a failed log write does not prevent a terminal-state update attempt.
- [ ] Preserve the original failure when diagnostic persistence also fails.
- [ ] Define bounded input/output mapping between steps.
- [ ] Record execution source, attempt, workflow version or snapshot, and relevant step metadata.
- [ ] Require confirmation or approval for selected consequential actions.

**Completion check:** Duplicate requests, provider errors, process interruption, and cancellation have predictable, tested outcomes. External actions use provider idempotency where available; universal exactly-once execution is not assumed.

## 8. Milestone 6 — Conditions and branching

**User outcome:** A workflow can decide whether to continue based on earlier results.

- [ ] Define supported condition operators and input values.
- [ ] Support conditions based on prior step outputs.
- [ ] Define true/false branches, skipped steps, and branch completion.
- [ ] Define how execution continues after a branch.
- [ ] Reject invalid branch targets and unsupported cycles.
- [ ] Implement a safe condition evaluator without arbitrary stored code.
- [ ] Log the condition result and selected path.
- [ ] Show skipped and executed paths in monitoring.
- [ ] Ensure the form, stored workflow format, executor, and later visual editor share these rules.

**Completion check:** A workflow can continue only when incomplete tasks exist, and its history explains the chosen path.

## 9. Milestone 7 — Scheduled workflows

**User outcome:** An active workflow runs at the selected time while the application is closed.

- [ ] Select and configure suitable server-side scheduling infrastructure.
- [ ] Validate and store schedule configuration and timezone.
- [ ] Calculate and display the next run time.
- [ ] Find due active workflows and create execution submissions.
- [ ] Prevent overlapping dispatchers from submitting the same scheduled occurrence twice.
- [ ] Define behavior when a previous run is still active.
- [ ] Define missed-run handling after downtime.
- [ ] Handle schedule edits, pause, reactivation, and timezone changes consistently.
- [ ] Apply the configured timezone, including daylight-saving behavior where relevant.
- [ ] Protect scheduler entry points from unauthorized invocation.
- [ ] Record scheduled trigger metadata in execution history.
- [ ] Monitor scheduler health and dispatch failures.

**Completion check:** A scheduled workflow runs without an open browser, respects pause, and does not duplicate one scheduled occurrence.

## 10. Milestone 8 — Sanity document-event workflows

**User outcome:** A workflow reacts automatically when a relevant Sanity document changes.

- [ ] Build a webhook receiver and configure the corresponding Sanity webhook.
- [ ] Verify webhook signatures and validate payloads.
- [ ] Support explicit create, update, and delete event selection where required.
- [ ] Match events to active workflows and any configured filters.
- [ ] Pass useful event context to steps using a documented input contract.
- [ ] Deduplicate repeated event deliveries.
- [ ] Prevent loops caused by a workflow updating documents that trigger itself.
- [ ] Exclude execution/log documents from triggering loops unless explicitly intended.
- [ ] Handle missing, deleted, unpublished, or changed source documents appropriately.
- [ ] Keep webhook acknowledgement fast and delegate longer work to execution processing.
- [ ] Record event identity and trigger source without storing unnecessary sensitive data.

**Completion check:** Creating a matching task starts one intended execution; repeated delivery and workflow-generated updates do not create uncontrolled runs.

## 11. Milestone 9 — AI processing and workflow generation

**User outcome:** Use AI within a workflow or describe an automation in ordinary language.

### AI execution steps

- [ ] Add a server-side OpenAI integration with documented environment variables.
- [ ] Implement initial AI actions such as task summarization and classification.
- [ ] Map selected prior-step outputs into AI inputs.
- [ ] Validate structured responses before downstream use.
- [ ] Bound input length, output size, request duration, and retries.
- [ ] Track useful usage and failure metadata without logging secrets.
- [ ] Provide clear errors for missing credentials, provider failures, and invalid responses.
- [ ] Treat fetched content as data rather than permission to run additional actions.

### Natural-language workflow creation

- [ ] Build an instruction-entry interface.
- [ ] Generate definitions using only the supported action catalog and workflow format.
- [ ] Validate the generated result with shared schemas.
- [ ] Identify missing information, unsupported requests, and required integrations.
- [ ] Present a readable preview of trigger, steps, settings, and expected effects.
- [ ] Let the user edit or regenerate the proposal.
- [ ] Require review before saving or activating the generated workflow.
- [ ] Never execute arbitrary model-generated code.

**Completion check:** A user can request a morning task summary, review a valid supported workflow, save it, and execute its AI step.

## 12. Milestone 10 — Visual workflow builder

**User outcome:** Build and understand workflows through connected visual steps.

- [ ] Integrate React Flow into a dedicated workflow editor.
- [ ] Add trigger, action, AI, and condition node types.
- [ ] Provide an action palette and configuration panel.
- [ ] Add, move, connect, duplicate, and remove nodes.
- [ ] Support branch labels and condition paths that match executor behavior.
- [ ] Validate connections, required configuration, reachability, and unsupported cycles.
- [ ] Serialize the graph into the shared validated workflow format.
- [ ] Load saved workflows without losing settings or connections.
- [ ] Preserve node positions as bounded presentation metadata.
- [ ] Support save, validation feedback, and unsaved-change handling.
- [ ] Add zoom, fit-to-view, keyboard access, and a usable small-screen editing approach.
- [ ] Highlight active, completed, failed, and skipped nodes when inspecting a run.

**Completion check:** A user can visually build a branching workflow, save it, reload it, and execute the same behavior shown in the diagram.

## 13. Milestone 11 — Templates, integrations, and notifications

### Templates

- [ ] Build template browsing and template detail views.
- [ ] Add category filtering and search.
- [ ] Explain each template's trigger, actions, prerequisites, and expected effects.
- [ ] Create an independent editable workflow from a template.
- [ ] Detect missing integrations and unsupported actions before activation.
- [ ] Add a small set of templates backed by working actions.

### Integrations

- [ ] Choose one initial external integration based on a useful end-to-end workflow.
- [ ] Implement its registered actions and configuration validation.
- [ ] Add connection status, setup, connection testing, and disconnect behavior.
- [ ] Implement authorization, credential refresh, and revocation as required by the provider.
- [ ] Keep credentials in environment variables or a secrets manager; store only safe metadata in Sanity.
- [ ] Handle provider rate limits, timeouts, expired access, and duplicate submissions.
- [ ] Show which workflows depend on a connection before disconnecting it.

### Notifications

- [ ] Define initial notification channels and user preferences.
- [ ] Implement a real notification action, such as sending an email report.
- [ ] Notify on selected failures or successes when configured.
- [ ] Avoid repeated alerts for the same failure.
- [ ] Surface delivery failures and allow safe recovery.

**Completion check:** A template can produce a working workflow that sends a real result through the chosen integration.

Gmail, Google Calendar, Google Drive, Slack, and Notion are possible later integrations. Supporting every provider is not required for the first complete release.

## 14. Milestone 12 — Application shell and settings

**User outcome:** Navigate AutoFlow as one coherent application.

- [ ] Replace the starter home page and default application metadata.
- [ ] Add shared navigation for dashboard, workflows, tasks, executions, templates, and settings.
- [ ] Build a dashboard with active workflows, recent runs, failures, and upcoming schedules.
- [ ] Calculate dashboard totals from appropriate queries rather than a limited loaded page.
- [ ] Add timezone and notification preferences stored in Sanity.
- [ ] Add settings for available integrations and relevant execution preferences.
- [ ] Use consistent components, spacing, status indicators, and feedback messages.
- [ ] Add loading, empty, error, and not-found experiences throughout.
- [ ] Verify mobile layouts and keyboard navigation.
- [ ] Provide accessible labels, focus states, and readable status messaging.
- [ ] Confirm destructive actions and explain effects on related data.
- [ ] Display dates in the selected timezone and make next-run times understandable.

**Completion check:** A user can navigate from the dashboard to a workflow, run it, inspect results, and return without manually entering URLs.

## 15. Milestone 13 — Authentication and deployment protection

These items must be complete before protected application functionality is exposed publicly. Build their design alongside server features rather than postponing route protection until the end.

- [ ] Select and implement authentication suitable for the initial single-user application.
- [ ] Restrict application access to the intended user.
- [ ] Protect reads, mutations, execution submission, cancellation, retry, and monitoring routes.
- [ ] Check that referenced documents have the expected type and permitted scope.
- [ ] Protect browser-originated state changes against inappropriate cross-site requests.
- [ ] Protect scheduler and webhook endpoints using their appropriate verification mechanisms.
- [ ] Apply request limits to execution, AI, and integration operations.
- [ ] Keep privileged Sanity access and external credentials on the server.
- [ ] Use appropriately scoped credentials and separate development/production configuration.
- [ ] Return useful public errors while keeping secrets out of responses and logs.
- [ ] Require approval for configured consequential workflow actions.
- [ ] Validate destinations and permissions for any future action that accepts external URLs.

Multi-user teams, roles, and tenant ownership are future scope. Add ownership fields and enforce isolation before introducing additional users; they are not prerequisites for a private single-user release.

## 16. Milestone 14 — Sanity data maintenance and administration

- [ ] Extend existing schemas only where the implemented features require additional data.
- [ ] Add structured step results, execution metadata, and safe output storage.
- [ ] Add report, settings, or integration-metadata schemas when their features are built.
- [ ] Use transactions or revision checks where state updates require atomic coordination.
- [ ] Ensure programmatic writes supply required timestamps and values; do not depend on Studio form defaults.
- [ ] Provide useful Studio previews and administrative views for executions and logs.
- [ ] Define document/reference behavior for deleted workflows and retained history.
- [ ] Define retention and cleanup for execution history, outputs, and logs.
- [ ] Bound document and array sizes and paginate large histories.
- [ ] Document schema migrations and compatibility with existing workflow definitions.
- [ ] Define export, backup, and restore procedures appropriate to the Sanity setup.
- [ ] Confirm the web application and Studio point to the intended project and dataset in each environment.

**Completion check:** Long-term usage does not create unbounded documents, broken references, or unexplained differences between Studio and application writes.

## 17. Milestone 15 — Verification, documentation, and operations

### Meaningful verification

- [ ] Validate workflow definitions and action configuration, including invalid and unknown values.
- [ ] Test output passing, conditions, timeouts, retries, cancellation, and failure persistence.
- [ ] Test duplicate submissions, competing execution claims, and interrupted runs.
- [ ] Verify task/workflow APIs and persistence against a suitable test dataset.
- [ ] Test webhook signature rejection, event deduplication, and loop prevention.
- [ ] Test schedule timing, pause/reactivation, and missed-run behavior.
- [ ] Verify authentication and rejected unauthorized operations.
- [ ] Test one complete user journey from workflow creation to inspecting results.
- [ ] Verify mobile and keyboard use on the main flows.
- [ ] Run the existing applicable type, lint, and production build checks.
- [ ] Add repeatable automated checks for the important behaviors above.

### Documentation

- [ ] Replace starter READMEs with AutoFlow setup and usage instructions.
- [ ] Document required variables in `.env.example` without real credentials.
- [ ] Explain supported actions, triggers, conditions, and workflow format.
- [ ] Document scheduler, webhook, AI, and integration setup.
- [ ] Explain local development, verification, deployment, and recovery.
- [ ] Provide one working example workflow and common troubleshooting steps.
- [ ] Keep supported features and known limitations accurate.

### Deployment and operation

- [ ] Configure application hosting and server-side execution processing.
- [ ] Configure Studio deployment if remote administrative access is needed.
- [ ] Configure production secrets, Sanity permissions, and required origins.
- [ ] Enable production scheduling and verified event delivery.
- [ ] Monitor failed/stale executions and worker/scheduler health.
- [ ] Define request, AI usage, concurrency, and storage limits suitable for personal use.
- [ ] Prepare rollback, backup, and restore procedures.
- [ ] Run a production smoke test of manual, scheduled, and event-triggered workflows that are enabled for release.

## 18. Suggested release boundaries

| Release | What the user can do | Required foundation |
| --- | --- | --- |
| First usable local version | Create tasks, configure useful action workflows, run them manually, inspect saved results | Manual execution, monitoring, useful actions, editing, validation, essential error handling |
| Reliable personal automation | Run scheduled and document-event workflows with predictable recovery | Reliable execution, conditions as needed, scheduling, verified events, operational limits |
| AI automation experience | Generate workflows from instructions and run AI processing steps | Server AI integration, validation, review, usage controls |
| Visual workflow experience | Build supported workflows visually and inspect their execution paths | Stable shared workflow format, branching semantics, visual editor |
| Complete planned personal release | Use templates, a selected integration, notifications, dashboard, and settings | Earlier releases plus finished user experience, verification, documentation, and operations |
| Publicly hosted personal release | Access the same application securely over the internet | Authentication and deployment protection, regardless of how many features ship |

Complete each release's server behavior and Sanity persistence along with its interface. A selectable trigger, a saved configuration, or a drawn node does not establish working execution.

## 19. Definition of done

A feature is complete only when:

- [ ] The user can perform the intended operation through the interface.
- [ ] Its server behavior performs the real work.
- [ ] Sanity stores the correct persistent data and relationships.
- [ ] Untrusted input is validated and access is controlled where required.
- [ ] Loading, empty, success, and failure states are understandable.
- [ ] Relevant failure and recovery behavior has been checked.
- [ ] Important paths have appropriate verification and applicable project checks pass.
- [ ] The main flow works on supported screen sizes and with a keyboard.
- [ ] Documentation and environment-variable examples are current.
- [ ] Remaining limitations are stated honestly.

## 20. Immediate next implementation task

Finish the existing manual execution path before starting the full visual editor or AI assistant:

1. Verify the current web and workflow-engine checks.
2. Add Run controls to the workflow detail page.
3. Display the returned execution ID and output.
4. Verify successful and failed execution records and logs in Sanity.
5. Add saved execution results and history as the next increment.

The intended first demonstration is: **create tasks → save a workflow → click Run → execute a real action → inspect its persisted status, result, and logs.**
