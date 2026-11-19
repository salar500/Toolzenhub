/* =========================================================
   ToolZen Hub
   AI Prompt Builder: professional tool intelligence (AI programme D18;
   research and sources in docs/ecosystem-review/ai-ecosystem/
   20-ROLES-TASKS-TOOLS.md)

   Each tool: what it is, the terms its own documentation uses,
   how the work is done in it (in general, or for a given task),
   what the AI must ask the visitor to share (it cannot open the
   visitor's tools or accounts), and what a person must check.
   `checked` is the date its official documentation was read for
   this registry; an entry without it uses the documentation's
   long-standing, general terms only. TASK_TOOLS says which tools
   are offered for which task; HANDOFFS describe how work moves
   between two tools without claiming an integration that does
   not exist. Data only; loaded when a task is chosen.
========================================================= */

const t = (id, name, kind, doc, fields) => ({ id, name, kind, doc, ...fields });

export const TOOLS = [

    /* ---------- testing and development ---------- */
    t("postman", "Postman", "API client", "https://learning.postman.com/docs/", {
        checked: "2026-11-17",
        terms: "collections, requests, environments, variables (global, collection, environment, data and local scopes), pre-request and post-response scripts, pm.test and pm.expect assertions, the Collection Runner and the Postman CLI",
        how: ["Organise the work as a Postman collection with folders by endpoint or feature.", "Put base URLs and tokens in environment variables, never hard-coded in requests."],
        tasks: {
            "api-testing": ["Write each test case as a request in the collection with post-response script assertions using pm.test and pm.expect (status code, response time, body fields, JSON schema where useful).", "Chain requests by saving values from a response into variables (for example an id or a token) for the next request.", "Say how to run the collection with the Collection Runner or the Postman CLI against a test environment, and how to read the results."],
            "api-design": ["Describe the requests and example responses so they can be saved as collection examples, and say what Postman can generate from an OpenAPI definition if one exists."]
        },
        deep: {
            all: ["Keep one environment per stage (for example local, test and staging) with the same variable names, so the collection runs unchanged against each."],
            "api-testing": [
            "Use pre-request scripts only for setup a request needs (a timestamp, a signature, a token refresh) and keep the assertions in post-response scripts.",
            "In each test, assert the status code, the agreed response-time limit, the content type, the body fields and their types, and the error format for failures; check the JSON schema with pm.response.to.have.jsonSchema where the schema is known.",
            "For data-driven runs, give a CSV or JSON data file whose columns become data variables in the Collection Runner, one iteration per row, including the invalid and boundary values.",
            "Order the folders so the requests that create data run before those that read, change and delete it, and clean up what the run created at the end."
            ]
        },
        share: "the collection exported as JSON or the request details (method, URL, headers, body), and the names of environment variables, never their secret values",
        check: "Run the collection against a test environment yourself; a test only passes when Postman shows it passed."
    }),
    t("openapi", "OpenAPI / Swagger", "API specification", "https://swagger.io/specification/", {
        terms: "the OpenAPI document (paths, operations, parameters, request bodies, responses, schemas, security schemes)",
        how: ["Treat the OpenAPI document as the contract: derive endpoints, required fields, types and error responses from it, and report where the document is incomplete."],
        share: "the OpenAPI document (YAML or JSON) or the relevant paths and schemas",
        check: "Check that the running API behaves as the document says; the document can be out of date."
    }),
    t("playwright", "Playwright", "browser test automation", "https://playwright.dev/docs/intro", {
        checked: "2026-11-17",
        terms: "Playwright Test, locators (getByRole, getByLabel, getByText), web-first assertions with auto-waiting, fixtures, test hooks, projects for browsers, the trace viewer and the HTML reporter",
        how: ["Write tests with Playwright Test in the language the project uses.", "Prefer user-facing locators (getByRole, getByLabel) over CSS or XPath, and web-first assertions such as expect(locator).toBeVisible() instead of fixed waits.", "Keep each test independent; set up state with fixtures or hooks, not by depending on another test."],
        tasks: {
            "test-automation": ["Follow the project's existing structure (config, page objects or fixtures) if I share it; otherwise propose a minimal one.", "Configure projects for the browsers and viewports needed, and turn on traces for failures so they can be opened in the trace viewer.", "Say how to run the tests locally and in CI, and how to read the HTML report."]
        },
        deep: [
            "Rely on Playwright Test's isolation (each test gets a fresh browser context); share a signed-in state through a saved storage state instead of signing in through the interface in every test.",
            "Create and remove test data with fixtures or test.beforeEach and test.afterEach hooks, through the API where the application has one.",
            "Use page objects only where several tests share a screen, and keep the assertions in the tests.",
            "Configure retries and traces for CI (for example trace: 'on-first-retry' and screenshots on failure in playwright.config); a test that passes only on retry is flaky and must be fixed, not ignored.",
            "Run in parallel with workers once the tests are independent; tests that share data must not run at the same time."
        ],
        share: "the test you are changing, playwright.config, page objects or fixtures, the application URL of a test environment, and the HTML of the elements involved",
        check: "Run the tests yourself, several times, before trusting them; a generated test has not passed until it runs green."
    }),
    t("selenium", "Selenium WebDriver", "browser test automation", "https://www.selenium.dev/documentation/", {
        terms: "WebDriver, browser drivers, locators (By.id, By.cssSelector and others), explicit waits and the Page Object pattern",
        how: ["Use explicit waits for the condition needed, never fixed sleeps.", "Keep locators in page objects; prefer ids and stable attributes."],
        share: "the existing test code, framework (TestNG, JUnit, pytest), the browser and driver versions, and the HTML of the elements involved",
        check: "Run the tests yourself before relying on them."
    }),
    t("cypress", "Cypress", "browser test automation", "https://docs.cypress.io/", {
        terms: "specs, commands (cy.get, cy.contains), assertions with built-in retry, cy.intercept for network requests and fixtures for test data",
        how: ["Rely on Cypress's retrying assertions instead of fixed waits.", "Use cy.intercept to control or observe network calls where the test needs it."],
        share: "the spec you are changing, cypress.config and the HTML of the elements involved",
        check: "Run the specs yourself before relying on them."
    }),
    t("appium", "Appium", "mobile test automation", "https://appium.io/docs/en/latest/", {
        terms: "the Appium server, drivers (UiAutomator2 for Android, XCUITest for iOS), capabilities and sessions",
        how: ["Name the platform, driver and capabilities each test needs.", "Use accessibility ids as locators where the app provides them."],
        share: "the capabilities, app build details and the element hierarchy of the screens",
        check: "Run the tests on a real device or emulator before relying on them."
    }),
    t("jmeter", "Apache JMeter", "load testing", "https://jmeter.apache.org/usermanual/index.html", {
        terms: "test plans, thread groups, samplers, listeners, assertions and timers",
        how: ["Model each user journey as a thread group with samplers, think-time timers and assertions.", "Run load tests from the command line (non-GUI mode) and keep the GUI for building the plan."],
        share: "the test plan (.jmx) or the requests to model, and the target load and environment",
        check: "Only run load against environments you are allowed to load, and read the results yourself."
    }),
    t("jira", "Jira", "work tracking", "https://support.atlassian.com/jira-software-cloud/", {
        checked: "2026-11-17",
        terms: "work items (called issues in older versions), spaces (projects), work types such as Bug, Story and Task, fields, statuses and workflows, and JQL for advanced search and saved filters",
        how: ["Write anything meant for Jira in the fields Jira uses (summary, description, steps, priority, labels, components, linked work items)."],
        tasks: {
            defect: ["Write the defect as a Jira Bug: summary, environment, steps to reproduce, expected and actual result, severity and priority as separate fields, attachments to add, and work items to link."],
            "status-report": ["Base the report on a Jira export or a JQL filter of the period; give the JQL I could use."],
            prd: ["Split the requirements into epics and stories ready to create as Jira work items, with acceptance criteria."],
            "test-plan": ["Say how test work and defects will be tracked in Jira (work types, links between stories, tests and bugs)."]
        },
        deep: Object.fromEntries(["api-testing", "test-plan", "test-cases", "regression", "defect"].map((task) => [task, [
            "Raise one Bug per distinct cause: a summary that names the behaviour and the endpoint or screen, severity (impact) kept apart from priority (urgency), the environment and build, and the evidence attached with secrets removed.",
            "Link each Bug to the story or requirement it breaks, and group one test cycle's work with a label or fix version so it can be reported from a filter.",
            "Give the JQL for the cycle's open defects, for example project = KEY AND type = Bug AND statusCategory != Done AND labels = cycle-label, with my space key and label put in."
        ]])),
        share: "the work items or a CSV export, and your space's work types and required fields",
        check: "Check fields and links after creating the work items in Jira."
    }),
    t("azure-devops", "Azure DevOps", "work tracking and pipelines", "https://learn.microsoft.com/en-us/azure/devops/", {
        terms: "Boards (work items such as User Story, Bug and Task), Repos, Pipelines (YAML), and Test Plans (test plans, suites and test cases)",
        how: ["Use Azure DevOps work item types and fields; for tests, structure them as test plans, suites and test cases."],
        share: "the work items or exports, and the pipeline YAML if relevant",
        check: "Check the items and pipelines in Azure DevOps after creating them."
    }),
    t("testrail", "TestRail", "test management", "https://support.testrail.com/", {
        terms: "projects, test suites and sections, test cases, test runs, results and milestones",
        how: ["Structure test cases by sections with preconditions, steps and expected results, ready to import (CSV) or enter in TestRail.", "Keep runs and results apart from the case design: results are recorded only when tests are executed."],
        share: "your TestRail case template fields or a CSV export",
        check: "Results in TestRail must come from real executions."
    }),
    t("github", "GitHub", "code hosting", "https://docs.github.com/", {
        checked: "2026-11-17",
        terms: "repositories, branches, commits, pull requests, reviews, issues and GitHub Actions",
        /* a review comments on someone else's pull request; proposing changes on a branch is for the author */
        howNot: ["code-review"],
        how: ["Work on a branch and propose changes as a pull request with a clear description and the tests run."],
        tasks: {
            "code-review": ["Review as a pull request review: comment on specific lines, separate blocking issues from suggestions, and check the tests in the PR."],
            debug: ["Find when the defect appeared: compare with the last good release, read the file's history and the Blame view of the lines involved (recent commits and pull requests touching the code), and use git bisect between a good and a bad commit when the cause is unclear."]
        },
        deep: [
            "Search the open and closed issues and pull requests for related work before starting.",
            "In the pull request, describe the change and its reason, the tests that cover it and how it was verified, and link the issue.",
            "A change is not done while the pull request's checks fail or before a reviewer has read it."
        ],
        share: "the relevant files or the pull request diff, and the error output",
        check: "Review every change yourself before merging."
    }),
    t("gitlab", "GitLab", "code hosting and CI", "https://docs.gitlab.com/", {
        terms: "projects, merge requests, pipelines defined in .gitlab-ci.yml, jobs and stages, issues",
        how: ["Propose changes as a merge request; describe CI changes in .gitlab-ci.yml terms (stages, jobs, rules)."],
        share: "the relevant files, merge request diff or pipeline log",
        check: "Review every change and pipeline run yourself."
    }),
    t("github-actions", "GitHub Actions", "CI/CD", "https://docs.github.com/en/actions", {
        checked: "2026-11-17",
        terms: "workflows (YAML files in .github/workflows), events, jobs, steps, runners and actions",
        how: ["Define the automation as a workflow triggered by the right events, with jobs and steps; keep secrets in repository secrets, never in the YAML."],
        deep: [
            "Cache dependencies, give the workflow's token only the permissions it needs, and upload reports, logs or traces as artifacts so a failure can be examined."
        ],
        share: "the workflow YAML and the failing run's log",
        check: "Trigger the workflow and read the run log."
    }),
    t("jenkins", "Jenkins", "CI/CD", "https://www.jenkins.io/doc/", {
        terms: "pipelines defined in a Jenkinsfile, stages, steps, agents and credentials",
        how: ["Describe CI as a declarative Jenkinsfile pipeline with stages; use Jenkins credentials for secrets."],
        share: "the Jenkinsfile and the console output of the failing build",
        check: "Run the pipeline and read the console output."
    }),
    t("vscode", "Visual Studio Code", "code editor", "https://code.visualstudio.com/docs/debugtest/debugging", {
        checked: "2026-11-17",
        terms: "the workspace, extensions, the integrated terminal, debug configurations (launch.json) and tasks",
        how: ["Where debugging helps, give a launch.json configuration and the breakpoints to set."],
        deep: [
            "To see what the code really does, run it under the debugger: a launch.json configuration for the application or the test, breakpoints (conditional where only certain data matters), and the Variables, Watch and Call Stack views to inspect the state.",
            "Run commands in the integrated terminal, so the exact output can be shared.",
            "Before changing a function, find every caller with Go to Definition, Find All References and search across files."
        ],
        share: "the relevant files and any launch.json or settings involved",
        check: "Run and debug the change yourself."
    }),
    t("docker", "Docker", "containers", "https://docs.docker.com/", {
        checked: "2026-11-17",
        terms: "Dockerfiles, images, containers, build stages (multi-stage builds with several FROM and COPY --from), volumes, networks and Docker Compose",
        how: ["Keep images small and reproducible: pinned base image tags, multi-stage builds, a .dockerignore, and configuration through environment variables.", "Never bake secrets into an image."],
        share: "the Dockerfile, compose file and the build or run output",
        check: "Build and run the image yourself and check the logs."
    }),
    t("kubernetes", "Kubernetes", "container orchestration", "https://kubernetes.io/docs/home/", {
        terms: "clusters, nodes, pods, deployments, services, config maps, secrets and namespaces, managed with kubectl",
        how: ["Start diagnosis with read-only kubectl commands (get, describe, logs, events) before changing anything."],
        share: "the manifests and the output of kubectl get, describe and logs for the affected resources",
        check: "Confirm changes in a non-production namespace first."
    }),
    t("sql-db", "SQL database (PostgreSQL, MySQL, SQL Server)", "database", "https://www.postgresql.org/docs/", {
        terms: "tables, keys, joins, indexes, transactions and the database's own SQL dialect",
        how: ["Write SQL for the database and version I name; say where the dialects differ.", "Read data with SELECT first; any UPDATE or DELETE needs a WHERE clause checked with a SELECT and a transaction you can roll back."],
        share: "the table definitions (CREATE TABLE or column lists) and a few sample rows with personal data removed",
        check: "Run queries on a copy or test database first and check the row counts."
    }),
    t("devtools", "Browser developer tools", "debugging", "https://developer.chrome.com/docs/devtools", {
        terms: "the Elements, Console, Network and Application panels",
        how: ["Use the Network panel to check requests, status codes and responses, and the Console for errors, as evidence."],
        share: "Console errors and the relevant Network entries (request, status, response), with tokens removed",
        check: "Reproduce the issue with the panels open to confirm."
    }),

    /* ---------- data ---------- */
    t("excel", "Microsoft Excel", "spreadsheet", "https://support.microsoft.com/en-us/excel", {
        checked: "2026-11-17",
        terms: "tables, formulas and functions (XLOOKUP, SUMIFS, FILTER), PivotTables, Power Query (Get & Transform) and charts",
        how: ["Give formulas with the exact cells or table columns they go in, and say which functions are missing from older versions (XLOOKUP and FILTER are not in Excel 2016 or 2019) and give an alternative such as INDEX and MATCH.", "Use Excel tables and structured references, and PivotTables for summaries."],
        deep: [
            "Keep raw data, calculations and outputs on separate sheets, and never type over the raw data.",
            "Convert each range to a named Excel table and use structured references, so formulas extend when rows are added.",
            "When the same cleaning repeats each period, do it in Power Query (Get & Transform) as applied steps instead of by hand.",
            "Add a reconciliation cell for each key total (the source total minus the report total must be zero) and Data Validation on input cells."
        ],
        share: "the column headers and a few sample rows (personal data removed), and which Excel version you use",
        check: "Recalculate key totals another way to confirm the formulas."
    }),
    t("power-query", "Power Query", "data preparation", "https://learn.microsoft.com/en-us/power-query/", {
        terms: "queries, applied steps, the M language, merge and append, data types",
        how: ["Describe the cleaning as Power Query applied steps in order (and the M code if useful), so the steps refresh with new data."],
        share: "the source columns and types and the steps you already have",
        check: "Compare row counts before and after each step."
    }),
    t("power-bi", "Power BI", "business intelligence", "https://learn.microsoft.com/en-us/power-bi/", {
        checked: "2026-11-17",
        terms: "Power BI Desktop, Power Query, the data model, relationships (cardinality and cross filter direction), DAX measures, report pages, visuals and the Power BI service",
        how: ["Model the data as a star schema: fact tables related to dimension tables, with the cardinality and cross filter direction stated for each relationship.", "Write calculations as DAX measures, not calculated columns, unless a column is really needed; explain each measure.", "Design report pages around the questions users ask, with filters and drill-through where they help."],
        deep: [
            "Create a date table, mark it as the date table and relate it to each fact table's date before writing time-intelligence measures.",
            "Name each DAX measure for what it means, keep base measures (sums, counts) apart from the ratios and comparisons built on them, and use DIVIDE for ratios so a zero denominator returns blank instead of an error.",
            "Prefer a single cross filter direction; use both only for a stated need, because it can make filters ambiguous.",
            "Plan the refresh: the sources, how often they change, and whether the Power BI service needs a gateway for on-premises data.",
            "Test each page with the slicers and filters a user will apply, and compare the totals with the source."
        ],
        share: "the table and column names, the relationships and the measures you have",
        check: "Reconcile a measure's result with a number you trust before publishing."
    }),
    t("tableau", "Tableau", "business intelligence", "https://help.tableau.com/current/pro/desktop/en-us/default.htm", {
        terms: "data sources, worksheets, dashboards, dimensions and measures, calculated fields, level of detail (LOD) expressions and filters",
        how: ["Write calculations as Tableau calculated fields (LOD expressions where the level of detail differs), and design dashboards around the user's questions."],
        share: "the fields in your data source and the calculations you have",
        check: "Check calculated values against a trusted total."
    }),
    t("google-sheets", "Google Sheets", "spreadsheet", "https://support.google.com/docs/topic/9054603", {
        terms: "formulas (QUERY, FILTER, ARRAYFORMULA, XLOOKUP), pivot tables and charts",
        how: ["Give Google Sheets formulas with the cells they go in; say where they differ from Excel."],
        share: "the column headers and a few sample rows",
        check: "Check totals another way."
    }),
    t("looker-studio", "Looker Studio", "reporting", "https://support.google.com/looker-studio", {
        terms: "data sources, reports, charts, dimensions, metrics, calculated fields and controls",
        how: ["Describe the report as pages, charts with their dimensions and metrics, and controls for filtering."],
        share: "the data source fields",
        check: "Compare report figures with the source."
    }),
    t("python-data", "Python with pandas and Jupyter", "data analysis", "https://pandas.pydata.org/docs/", {
        terms: "DataFrames, read_csv, groupby, merge, notebooks and cells",
        how: ["Write pandas code in small notebook cells, each with a check of its result (shape, head, null counts)."],
        share: "the column names, dtypes and a few sample rows",
        check: "Run the notebook top to bottom and check the outputs."
    }),

    /* ---------- IT operations ---------- */
    t("powershell", "PowerShell", "scripting", "https://learn.microsoft.com/en-us/powershell/", {
        terms: "cmdlets (Verb-Noun), modules, the pipeline, -WhatIf and -Confirm",
        how: ["Use approved Verb-Noun cmdlets and support -WhatIf for anything that changes the system."],
        share: "the PowerShell version (PSVersionTable), the modules installed and the error output",
        check: "Run with -WhatIf first on a test machine."
    }),
    t("bash", "Bash on Linux", "scripting", "https://www.gnu.org/software/bash/manual/", {
        terms: "shell scripts, exit codes, set -euo pipefail, pipes and the distribution's package manager and service manager (systemd)",
        how: ["Start scripts with strict mode (set -euo pipefail), quote variables, and check exit codes."],
        share: "the distribution and version, and the command output",
        check: "Run on a test machine first."
    }),
    t("windows-server", "Windows Server", "server OS", "https://learn.microsoft.com/en-us/windows-server/", {
        terms: "roles and features, services, Event Viewer logs, Active Directory and Group Policy",
        how: ["Use Event Viewer entries and service status as evidence before changing configuration."],
        share: "the version, the event log entries and the role configuration involved",
        check: "Test changes outside production first."
    }),
    t("aws", "Amazon Web Services", "cloud", "https://docs.aws.amazon.com/", {
        terms: "accounts, regions, IAM users, roles and policies, EC2, S3, VPC, CloudWatch and CloudTrail",
        how: ["Name the region and service; follow least-privilege IAM; use CloudWatch metrics and logs as evidence."],
        share: "the service configuration (without keys), CloudWatch logs and the error",
        check: "Check costs and permissions before applying changes."
    }),
    t("azure", "Microsoft Azure", "cloud", "https://learn.microsoft.com/en-us/azure/", {
        terms: "subscriptions, resource groups, Microsoft Entra ID roles (RBAC), virtual machines, storage accounts and Azure Monitor",
        how: ["Name the subscription scope and resource group; use role-based access; use Azure Monitor logs as evidence."],
        share: "the resource configuration (without secrets) and the logs",
        check: "Check costs and permissions before applying changes."
    }),
    t("terraform", "Terraform", "infrastructure as code", "https://developer.hashicorp.com/terraform/docs", {
        terms: "configuration files, providers, resources, state, terraform plan and terraform apply",
        how: ["Express changes as Terraform configuration and always review terraform plan output before apply."],
        share: "the relevant .tf files and the plan output (secrets removed)",
        check: "Read the plan line by line before applying."
    }),
    t("ansible", "Ansible", "configuration management", "https://docs.ansible.com/", {
        terms: "inventories, playbooks, tasks, modules, roles and check mode",
        how: ["Write idempotent playbooks and run them in check mode (--check) first."],
        share: "the playbook, inventory group and the run output",
        check: "Run in check mode on a test group first."
    }),

    /* ---------- marketing and content ---------- */
    t("search-console", "Google Search Console", "search performance", "https://support.google.com/webmasters/", {
        checked: "2026-11-17",
        terms: "properties, the Performance report (clicks, impressions, CTR and average position by query, page, country, device, search appearance and date), Page indexing, URL Inspection and sitemaps",
        how: ["Use the Performance report to find pages and queries with many impressions but low CTR or falling clicks, comparing date ranges.", "Use Page indexing and URL Inspection as evidence for indexing problems."],
        share: "Performance report exports (queries and pages, with the date range) and Page indexing details",
        check: "Check findings in Search Console yourself; data lags by a few days."
    }),
    t("ga4", "Google Analytics 4", "web analytics", "https://support.google.com/analytics/", {
        terms: "properties, data streams, events, key events, sessions, users, engagement, reports and explorations",
        how: ["Base conclusions on GA4 events and reports for a stated date range, and say which report or exploration shows each figure."],
        share: "report exports with the date range and the events tracked",
        check: "Confirm tracking works before trusting the numbers."
    }),
    t("google-ads", "Google Ads", "paid search", "https://support.google.com/google-ads/", {
        terms: "campaigns, ad groups, keywords and match types, responsive search ads, bidding strategies, conversions and the search terms report",
        how: ["Structure campaigns and ad groups around themes, write responsive search ad assets within Google Ads' length limits, and track conversions."],
        share: "the campaign structure and a performance export",
        check: "Review the policy and spend settings before going live."
    }),
    t("meta-ads", "Meta Ads Manager", "social advertising", "https://www.facebook.com/business/help", {
        terms: "campaigns, ad sets, ads, objectives, audiences, placements, budgets and the Meta pixel or Conversions API",
        how: ["Structure by campaign objective, ad sets for audiences and budget, and ads for creative, with conversion tracking set up."],
        share: "the campaign structure and a results export",
        check: "Check targeting and spend settings before publishing."
    }),
    t("gtm", "Google Tag Manager", "tag management", "https://support.google.com/tagmanager/", {
        terms: "containers, tags, triggers, variables, the data layer and Preview mode",
        how: ["Describe tracking as tags with triggers and variables, and test it in Preview mode before publishing."],
        share: "the container's tags and triggers involved",
        check: "Test in Preview mode before publishing."
    }),
    t("semrush", "Semrush", "SEO platform", "https://www.semrush.com/kb/", {
        terms: "projects, Site Audit, Position Tracking, keyword research tools and keyword difficulty",
        how: ["Use its exports for volumes and difficulty; label them as the platform's estimates."],
        share: "exports from the relevant Semrush report",
        check: "Treat volumes and difficulty as estimates."
    }),
    t("ahrefs", "Ahrefs", "SEO platform", "https://help.ahrefs.com/", {
        terms: "Site Explorer, Keywords Explorer, Site Audit, backlinks and keyword difficulty",
        how: ["Use its exports for volumes and backlinks; label them as the platform's estimates."],
        share: "exports from the relevant Ahrefs report",
        check: "Treat volumes and difficulty as estimates."
    }),
    t("mailchimp", "Mailchimp", "email marketing", "https://mailchimp.com/help/", {
        terms: "audiences, segments, tags, campaigns, automations (customer journeys) and merge tags",
        how: ["Write emails with Mailchimp merge tags for personalisation and plan sends to segments."],
        share: "your audience segments and merge tags",
        check: "Send a test email and check consent and unsubscribe links."
    }),
    t("hubspot", "HubSpot", "CRM and marketing", "https://knowledge.hubspot.com/", {
        terms: "contacts, companies, deals, pipelines and stages, lists, workflows, sequences and properties",
        how: ["Use HubSpot objects and properties; describe automation as workflows and outreach as sequences."],
        share: "the relevant properties, pipeline stages or a CRM export",
        check: "Check records and automation in HubSpot before they run."
    }),
    t("wordpress", "WordPress", "content management", "https://wordpress.org/documentation/", {
        terms: "posts and pages, the block editor, categories and tags, slugs, excerpts, featured images and plugins",
        how: ["Deliver content ready for the block editor: title, slug, excerpt, headings as blocks, and suggested categories and tags."],
        share: "your post structure and categories",
        check: "Preview the post before publishing."
    }),
    t("google-docs", "Google Docs", "documents", "https://support.google.com/docs/", {
        terms: "headings and the document outline, suggestions mode, comments and version history",
        how: ["Use headings that build the document outline; give edits as suggestions I can accept or reject."],
        share: "the document text",
        check: "Read the final document once more yourself."
    }),
    t("ms-word", "Microsoft Word", "documents", "https://support.microsoft.com/en-us/word", {
        terms: "styles (Heading 1, 2, 3), the navigation pane, Track Changes, comments and Compare",
        how: ["Use Word heading styles for structure; give edits so they can be applied with Track Changes."],
        share: "the document text",
        check: "Review all tracked changes yourself."
    }),
    t("notion", "Notion", "workspace", "https://www.notion.com/help", {
        terms: "pages, databases, properties, views and templates",
        how: ["Structure outputs as Notion pages or database entries with properties."],
        share: "the page or database structure",
        check: "Check the structure in Notion."
    }),
    t("markdown-docs", "Docs-as-code (Markdown with GitHub, Docusaurus or MkDocs)", "documentation", "https://www.mkdocs.org/", {
        terms: "Markdown files, front matter, navigation configuration, pull requests for review and a docs build",
        how: ["Write in Markdown with front matter and headings, organised as files the docs site's navigation can list; changes go through a pull request."],
        share: "the docs folder structure and the configuration file",
        check: "Build the docs locally and check the links."
    }),
    t("confluence", "Confluence", "wiki", "https://support.atlassian.com/confluence-cloud/", {
        terms: "spaces, pages, page trees, templates, macros and labels",
        how: ["Structure the content as a Confluence page (or page tree) with headings, tables and the macros it needs."],
        share: "the space structure and existing pages",
        check: "Review the page in Confluence before publishing."
    }),

    /* ---------- business, product, project and design ---------- */
    t("miro", "Miro", "whiteboard", "https://help.miro.com/", {
        terms: "boards, frames, sticky notes, templates and diagrams",
        how: ["Give the output as frames and sticky-note groups that can be copied onto a Miro board."],
        share: "the board's content as text or an export",
        check: "Arrange and review it on the board."
    }),
    t("diagrams", "Visio or Lucidchart", "diagramming", "https://help.lucid.co/", {
        terms: "process flows, swimlanes, BPMN shapes and data flow diagrams",
        how: ["Describe diagrams as lanes, steps and decisions in order, so they can be drawn shape by shape."],
        share: "the current diagram as an image or a list of steps",
        check: "Walk through the diagram with the people who do the work."
    }),
    t("asana", "Asana", "project management", "https://help.asana.com/", {
        terms: "projects, sections, tasks, subtasks, assignees, due dates, dependencies and milestones",
        how: ["Give the plan as Asana sections and tasks with assignee roles, due dates, dependencies and milestones."],
        share: "a project export or the current task list",
        check: "Check dates and dependencies after importing."
    }),
    t("trello", "Trello", "kanban boards", "https://support.atlassian.com/trello/", {
        terms: "boards, lists, cards, checklists, labels and due dates",
        how: ["Give the work as Trello lists and cards with checklists and labels."],
        share: "the board's lists and cards",
        check: "Review the board after creating the cards."
    }),
    t("ms-project", "Microsoft Project", "scheduling", "https://support.microsoft.com/en-us/project", {
        terms: "tasks, durations, predecessors, resources, the critical path, baselines and the Gantt chart",
        how: ["Give tasks with durations and predecessors so the schedule and critical path can be built, and say where to set a baseline."],
        share: "the task list with durations and dependencies",
        check: "Check the critical path in Project after entering the tasks."
    }),
    t("canva", "Canva", "design and video editor", "https://www.canva.com/help/", {
        terms: "designs, templates, pages, elements, the editor and its timeline for video, and download formats",
        how: ["Describe each design or scene as pages or timeline clips with their text, images, sizes and timing, ready to build from a template or a blank design."],
        share: "the design's size and format, your brand colours and fonts, and the text and images to use",
        check: "Check text, sizes and export settings in Canva before you publish."
    }),
    t("capcut", "CapCut", "video editor", "https://www.capcut.com/", {
        terms: "projects, the timeline, clips, text and captions, transitions, effects and export settings",
        how: ["Lay the video out as clips on the timeline in order, with the caption text, transitions and audio for each, and the aspect ratio and length to export."],
        share: "the clips you have, the aspect ratio and length you need, and the caption text",
        check: "Watch the export on the target device: captions, timing and sound."
    }),
    t("premiere-pro", "Adobe Premiere Pro", "video editor", "https://helpx.adobe.com/premiere-pro/user-guide.html", {
        terms: "projects, bins, sequences, the timeline, markers, captions, audio tracks and export settings",
        how: ["Describe the edit as a sequence: shots in order with in and out points or durations, markers for music and graphics, captions, and the export settings."],
        share: "the footage list, the sequence settings (frame size and rate), and the target length and platform",
        check: "Review the exported file in full before publishing."
    }),
    t("davinci", "DaVinci Resolve", "video editor", "https://www.blackmagicdesign.com/products/davinciresolve", {
        checked: "2026-11-18",
        terms: "projects, timelines, and its Media, Cut, Edit, Fusion (effects), Color, Fairlight (audio) and Deliver pages",
        how: ["Describe the edit as a timeline of clips with durations, then the colour, audio and delivery settings as separate passes."],
        share: "the footage list, the timeline settings, and the target length and platform",
        check: "Review the delivered file in full before publishing."
    }),
    t("audacity", "Audacity", "audio editor", "https://manual.audacityteam.org/", {
        terms: "projects, tracks, clips, selections, effects (for example noise reduction and normalisation), labels and export",
        how: ["Describe the audio work as steps on tracks: recording or import, cleaning, levels, then export format and loudness target."],
        share: "the recording's length, format and problems you hear, and where it will be published",
        check: "Listen to the exported file in full on headphones and speakers."
    }),
    t("figma", "Figma", "interface design", "https://help.figma.com/", {
        checked: "2026-11-17",
        terms: "files, frames, components and variants, auto layout, variables and styles, prototypes, and Dev Mode (the Inspect panel, code snippets and \"Ready for dev\" status, on paid plans)",
        how: ["Refer to frames, components, variants and variables by their names in the file."],
        tasks: {
            "design-handoff": ["Base the specification on what Dev Mode shows (layout, spacing, variables and styles in the Inspect panel, and frames marked Ready for dev), and list what Dev Mode does not capture: states, behaviour, content rules and accessibility."]
        },
        share: "frame and component names, exported specs or screenshots; the AI cannot open your Figma file",
        check: "Compare the specification with the file in Dev Mode."
    }),
    t("amplitude", "Amplitude or Mixpanel", "product analytics", "https://amplitude.com/docs", {
        terms: "events, event properties, user properties, funnels, retention and cohorts",
        how: ["Define metrics as events and funnels with exact event names and properties."],
        share: "your event names and properties, and chart exports",
        check: "Check that events fire as defined before trusting a funnel."
    }),
    t("salesforce", "Salesforce", "CRM", "https://help.salesforce.com/", {
        terms: "leads, accounts, contacts, opportunities, stages, activities and reports",
        how: ["Use Salesforce objects and fields; tie outreach and calls to the opportunity stage."],
        share: "the relevant records or a report export",
        check: "Update the records yourself after the work."
    }),
    t("sales-navigator", "LinkedIn Sales Navigator", "prospecting", "https://www.linkedin.com/help/sales-navigator", {
        terms: "lead and account searches, saved lists, alerts and InMail",
        how: ["Use only information visible on the prospect's profile and posts; respect InMail and connection-message limits."],
        share: "the profile details you are allowed to use",
        check: "Personalisation must be accurate and respectful."
    }),

    /* ---------- people and support ---------- */
    t("ats", "Applicant tracking system (Greenhouse, Lever, Workday)", "recruiting", "https://support.greenhouse.io/", {
        terms: "job posts, pipeline stages, scorecards, interview kits and candidate profiles",
        how: ["Structure interview plans as interview kits and scorecards with one attribute per criterion."],
        share: "your scorecard attributes and stages",
        check: "Check the job post and scorecards in the system before publishing."
    }),
    t("zendesk", "Zendesk", "help desk", "https://support.zendesk.com/", {
        terms: "tickets, views, macros, triggers, tags, the Help Center (articles and sections)",
        how: ["Write replies that can become macros, with placeholders for ticket fields; write help articles for Help Center sections."],
        share: "ticket exports (personal data removed) and your macros",
        check: "Test macros on a test ticket."
    }),
    t("freshdesk", "Freshdesk", "help desk", "https://support.freshdesk.com/", {
        terms: "tickets, canned responses, automations, the knowledge base and solution articles",
        how: ["Write replies as canned responses with placeholders, and articles as solution articles."],
        share: "ticket exports with personal data removed",
        check: "Test on a test ticket."
    }),
    t("jsm", "Jira Service Management", "service desk", "https://support.atlassian.com/jira-service-management-cloud/", {
        terms: "service projects, request types, queues, SLAs and knowledge base articles in Confluence",
        how: ["Use request types and SLAs in the analysis or reply; knowledge articles live in Confluence."],
        share: "request exports with personal data removed",
        check: "Check SLAs and queues in the service project."
    }),

    /* ---------- education and research ---------- */
    t("lms", "Learning platform (Google Classroom, Moodle, Canvas)", "learning management", "https://docs.moodle.org/", {
        terms: "courses, modules, assignments, quizzes, question banks and rubrics",
        how: ["Format quizzes and rubrics so they can be entered or imported into the platform's quiz or assignment tool."],
        share: "the course structure or the question format your platform imports",
        check: "Preview the quiz as a student before releasing it."
    }),
    t("slides", "PowerPoint or Google Slides", "presentations", "https://support.microsoft.com/en-us/powerpoint", {
        terms: "slides, layouts, speaker notes and the slide master",
        how: ["Give one idea per slide with a short headline, the visual to use, and speaker notes."],
        share: "your template or existing slides as text",
        check: "Rehearse with the slides."
    }),
    t("zotero", "Zotero or Mendeley", "reference management", "https://www.zotero.org/support/", {
        terms: "libraries, collections, items, notes, citation styles and exports (BibTeX, RIS)",
        how: ["Work only from the references I export from my library (BibTeX or RIS) and keep each citation key."],
        share: "a BibTeX or RIS export of the references",
        check: "Check every citation against the source."
    }),
    t("stats", "SPSS, R or Stata", "statistics", "https://www.r-project.org/other-docs.html", {
        terms: "datasets, variables, descriptive statistics, tests (t-test, chi-square, regression), assumptions and effect sizes",
        how: ["State each test's assumptions and how to check them, and give the commands or menus for the software I name."],
        share: "variable names and types, sample size and the output you have",
        check: "Check assumptions before interpreting results."
    }),
    t("nvivo", "NVivo", "qualitative analysis", "https://help-nv.qsrinternational.com/", {
        terms: "projects, files, codes, cases, queries and memos",
        how: ["Describe the analysis as a codebook (codes with definitions and examples) and the queries to run."],
        share: "excerpts and your current codes",
        check: "Code a sample with a colleague to check agreement."
    }),

    /* ---------- finance and legal ---------- */
    t("tally", "Tally", "accounting", "https://help.tallysolutions.com/", {
        terms: "ledgers, groups, vouchers, the trial balance and reports",
        how: ["Map analysis to Tally ledgers and groups, and name the report to export."],
        share: "the Tally report exported to Excel or the trial balance",
        check: "Reconcile exports with the books."
    }),
    t("quickbooks", "QuickBooks or Xero", "accounting", "https://quickbooks.intuit.com/learn-support/", {
        terms: "the chart of accounts, transactions, bank feeds, reconciliation and reports",
        how: ["Work from exported reports and the chart of accounts; reconciliation follows the software's bank reconciliation screen."],
        share: "report exports and the chart of accounts",
        check: "Reconcile in the software itself."
    }),
    t("sap", "SAP", "ERP", "https://help.sap.com/", {
        terms: "company codes, general ledger accounts, cost centres, transactions and reports",
        how: ["Refer to company codes, GL accounts and cost centres; base analysis on report exports."],
        share: "report exports and the account structure",
        check: "Confirm figures with the finance system owner."
    }),
    t("doc-compare", "Word Compare or a document comparison tool", "document comparison", "https://support.microsoft.com/en-us/word", {
        terms: "compare versions, redlines and tracked changes",
        how: ["Work from a redline of the two versions so each change is reviewed."],
        share: "the redline or both versions",
        check: "Check every change in the redline."
    }),
    t("esign", "E-signature platform (DocuSign and others)", "e-signature", "https://support.docusign.com/", {
        terms: "envelopes, recipients, signing order and fields",
        how: ["Only prepare the document; signing happens in the platform after legal review."],
        share: "nothing beyond the final document",
        check: "Check signatories and order before sending."
    })

];

export const TOOL_BY_ID = Object.freeze(Object.fromEntries(TOOLS.map((x) => [x.id, x])));

/* which tools are offered for which task (in display order); a task not listed has no tool step */
export const TASK_TOOLS = Object.freeze({
    architecture: ["diagrams", "confluence", "markdown-docs", "github", "aws", "azure"],
    "code-feature": ["vscode", "github", "gitlab", "docker", "sql-db"],
    debug: ["github", "vscode", "devtools", "docker", "sql-db"],
    "code-review": ["github", "gitlab"],
    refactor: ["vscode", "github", "gitlab"],
    "api-design": ["openapi", "postman"],
    "tech-docs": ["markdown-docs", "confluence", "openapi", "ms-word", "google-docs"],
    requirements: ["jira", "azure-devops", "confluence", "diagrams", "miro"],
    "test-plan": ["jira", "azure-devops", "testrail", "confluence"],
    "test-cases": ["testrail", "jira", "azure-devops", "excel"],
    "api-testing": ["postman", "openapi", "jira", "azure-devops", "jmeter", "sql-db"],
    "test-automation": ["playwright", "selenium", "cypress", "appium", "github-actions", "jenkins"],
    regression: ["jira", "testrail", "azure-devops"],
    defect: ["jira", "azure-devops", "devtools"],
    "performance-test": ["jmeter"],
    "data-analysis": ["excel", "sql-db", "power-bi", "power-query", "python-data", "google-sheets", "tableau"],
    dashboard: ["power-bi", "excel", "tableau", "looker-studio", "google-sheets", "power-query", "sql-db"],
    report: ["excel", "power-bi", "looker-studio", "google-docs", "ms-word"],
    "market-research": ["semrush", "google-sheets", "excel"],
    "research-plan": ["zotero", "stats", "nvivo"],
    "literature-review": ["zotero"],
    "doc-summary": ["ms-word", "google-docs"],
    article: ["wordpress", "google-docs", "ms-word"],
    "social-posts": ["meta-ads", "hubspot"],
    "marketing-copy": ["google-ads", "meta-ads", "mailchimp", "hubspot"],
    "project-plan": ["jira", "asana", "trello", "ms-project", "excel"],
    presentation: ["slides", "canva"],
    "video-concept": ["premiere-pro", "davinci", "capcut", "canva"],
    script: ["premiere-pro", "davinci", "capcut"],
    storyboard: ["canva", "premiere-pro", "davinci", "capcut", "figma"],
    podcast: ["audacity"],
    "learning-plan": ["notion", "lms"],
    "seo-audit": ["search-console", "ga4", "semrush", "ahrefs", "gtm"],
    "keyword-research": ["search-console", "semrush", "ahrefs", "google-ads"],
    "campaign-plan": ["google-ads", "meta-ads", "ga4", "gtm", "mailchimp", "hubspot"],
    "sales-outreach": ["hubspot", "salesforce", "sales-navigator"],
    "discovery-call": ["salesforce", "hubspot"],
    "business-plan": ["excel", "google-sheets"],
    prd: ["jira", "confluence", "figma", "amplitude"],
    "status-report": ["jira", "asana", "ms-project", "excel"],
    "risk-register": ["jira", "excel", "confluence"],
    "job-description": ["ats"],
    "hiring-interview": ["ats"],
    "onboarding-plan": ["notion", "confluence"],
    "support-reply": ["zendesk", "freshdesk", "jsm"],
    "kb-article": ["zendesk", "freshdesk", "confluence"],
    "ticket-analysis": ["zendesk", "freshdesk", "jsm", "excel"],
    "lesson-plan": ["lms", "slides"],
    assessment: ["lms"],
    rubric: ["lms"],
    "ux-research-plan": ["miro", "figma"],
    "usability-test": ["figma", "miro"],
    "user-flow": ["figma", "miro", "diagrams"],
    "graphic-design": ["canva", "figma"],
    "ux-review": ["figma"],
    "design-handoff": ["figma", "jira"],
    incident: ["kubernetes", "docker", "aws", "azure", "windows-server", "bash", "powershell"],
    "ops-script": ["powershell", "bash"],
    runbook: ["confluence", "markdown-docs", "kubernetes", "aws", "azure"],
    "change-plan": ["terraform", "ansible", "kubernetes", "aws", "azure"],
    "financial-analysis": ["excel", "power-bi", "tally", "quickbooks", "sap"],
    "budget-forecast": ["excel", "google-sheets"],
    "variance-analysis": ["excel", "power-bi", "tally", "sap"],
    reconciliation: ["excel", "tally", "quickbooks"],
    "contract-review": ["ms-word", "doc-compare", "esign"],
    "legal-research": ["ms-word"],
    "clause-draft": ["ms-word", "doc-compare"]
});

/*
 * How work moves between two tools. Only connections the tools' documentation describes are stated as features;
 * every other pair is a hand-off by export, file or copied value (see handoffLines).
 */
export const HANDOFFS = Object.freeze([
    { from: "playwright", to: "github-actions", line: "Run the Playwright tests in a GitHub Actions workflow (Playwright offers one when you install it), and upload the HTML report as an artifact so failures can be opened.", steps: ["In the repository: the Playwright tests and playwright.config with the CI settings (retries, trace, reporter).", "In GitHub Actions: a workflow on push and pull request that installs dependencies and the browsers, then runs the tests.", "After the run: the HTML report and traces uploaded as artifacts.", "Check: a failing test fails the workflow, and its trace opens in the trace viewer."] },
    { from: "postman", to: "github-actions", line: "Run the exported collection in CI with the Postman CLI inside a GitHub Actions workflow, with environment values from repository secrets." },
    { from: "excel", to: "power-bi", line: "Load the Excel tables into Power BI Desktop with Get data; do the cleaning in Power Query so it repeats on refresh rather than by hand in Excel.", steps: ["In Excel: keep each dataset as a named table with one header row and one type per column.", "Into Power BI Desktop: Get data from the workbook and choose the tables.", "In Power Query: repeat the cleaning as applied steps so it runs again on every refresh.", "In the model: relate the tables as a star schema and write the DAX measures.", "Check: the report's totals match the Excel totals for the same period and filters."] },
    { from: "power-query", to: "power-bi", line: "Keep the Power Query steps in the Power BI file so the cleaning repeats on every refresh." },
    { from: "jira", to: "postman", line: "Jira and Postman are not connected by default: take the acceptance criteria from the Jira work item, write them into the collection, and record defects back in Jira by hand with the failing request and response.", steps: ["In Jira: gather the stories or requirements of the API with their acceptance criteria (a JQL filter or a CSV export).", "Into Postman: turn each acceptance criterion into requests and assertions, and name each request with the key of the work item it covers.", "In Postman: run the collection against the test environment and keep the run results.", "Back into Jira: raise one Bug per failure with the request, response and run result attached, linked to the story it breaks.", "Check: every acceptance criterion has a request, and every failure has a Bug or a written reason why not."] },
    { from: "jira", to: "testrail", line: "Link TestRail cases and results to the Jira work items they cover (TestRail documents a Jira integration; check it is set up in your instance)." },
    { from: "figma", to: "jira", line: "Link each Jira work item to the Figma frame it implements, and mark frames Ready for dev when they can be built." },
    { from: "search-console", to: "ga4", line: "Search Console shows search behaviour before the click and Analytics shows what happens after it; compare them for the same pages and dates, and link the two products if the link is not set up yet." },
    { from: "vscode", to: "github", line: "VS Code works on the local copy of the repository; GitHub receives the change only when it is committed and pushed, and the review happens in the pull request.", steps: ["In VS Code: reproduce, fix and test on a branch.", "Commit with a message that names the cause and the fix, then push the branch.", "On GitHub: open a pull request that links the issue; the checks run there.", "Check: the checks pass and a reviewer has read the change before it is merged."] },
    { from: "github", to: "docker", line: "Build the image from the Dockerfile in the repository, ideally in CI, and tag it with the commit so a running container can be traced to its code." },
    { from: "terraform", to: "ansible", line: "Let Terraform create the infrastructure and Ansible configure what runs on it; pass host details from Terraform outputs to the Ansible inventory." }
]);

/** The hand-off lines for the tools chosen together, in the order chosen; a pair without a documented link gets the export rule. */
export function handoffLines(ids) {

    const lines = [];

    for (let i = 0; i < ids.length; i += 1) {
        for (let j = 0; j < ids.length; j += 1) {
            if (i === j) continue;
            const h = HANDOFFS.find((x) => x.from === ids[i] && x.to === ids[j]);
            if (h) lines.push(h.line);
        }
    }

    if (ids.length > 1) {
        lines.push(`For each step, say which tool it happens in (${ids.map((id) => TOOL_BY_ID[id]?.name ?? id).join(", ")}) and what moves from one tool to the next (an export, a file or a copied value). Do not assume two tools are connected unless I say they are.`);
    }

    return lines;

}

/* Experience with a tool, asked apart from professional experience (D18): a senior tester may be new to Playwright. */
export const TOOL_EXPERIENCE = Object.freeze([
    { id: "", label: "Not said" },
    { id: "new", label: "New to it" },
    { id: "basic", label: "Basic" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
    { id: "expert", label: "Expert" }
]);

const LEVEL_RULE = {
    new: (n) => `I am new to ${n}: say where in ${n} each step is done (the menu, panel or tab) and explain each of its terms the first time you use it.`,
    basic: (n) => `I know the basics of ${n}: explain any feature beyond the basics when you use it.`,
    advanced: (n) => `I use ${n} at an advanced level: skip interface steps; include edge cases and configuration trade-offs.`,
    expert: (n) => `I know ${n} in depth: no basic explanations; focus on precise implementation, constraints and risks.`
};

const bullets = (lines) => lines.map((l) => `- ${l}`).join("\n");

/**
 * The tools' part of a Work Pack, for compileWorkPack's input.toolPrompt: { blocks, prepare, quality }.
 * input: { tools: [{ tool, experience }], toolChoice: "none" | "recommend" | "", otherTool, handoffs, offered }.
 * A tool's instructions change with the task (tool.tasks[taskId]) and with the visitor's experience of it.
 */
export function toolPrompt(input, taskId) {

    const chosen = (input.tools ?? []).filter((x) => x?.tool?.name);
    const blocks = [];
    /* Very detailed (D19) adds each tool's deeper practice and the hand-offs step by step */
    const deep = input.detail === "comprehensive" || (input.extras ?? []).includes("tooldeep");

    for (const { tool, experience } of chosen) {
        const lines = [
            `Use ${tool.name}'s own terms: ${tool.terms}.`,
            ...(tool.tasks?.[taskId] ?? []),
            /* a tool's general workflow is left out where it does not fit the task (howNot) */
            ...(tool.howNot?.includes(taskId) ? [] : tool.how ?? []),
            /* deeper practice: for every task (a list) or per task ({ all, [taskId] }) */
            ...(!deep ? [] : Array.isArray(tool.deep) ? tool.deep : [...(tool.deep?.all ?? []), ...(tool.deep?.[taskId] ?? [])]),
            `You cannot open my ${tool.name} or my accounts: ask me to share ${tool.share}.`,
            LEVEL_RULE[experience]?.(tool.name) ?? "",
            deep && (experience === "new" || experience === "basic") ? `Include a short example for each ${tool.name} step, and the prerequisites (installation, access, settings) before the first one.` : ""
        ].filter(Boolean);
        const label = TOOL_EXPERIENCE.find((e) => e.id && e.id === experience)?.label;
        blocks.push(`Working in ${tool.name}${label ? ` (my experience with it: ${label.toLowerCase()})` : ""}:\n${bullets(lines)}`);
    }

    const other = String(input.otherTool ?? "").trim().slice(0, 100);
    if (other) blocks.push(`I also use ${other}. Use its terms where you know them; if you are not sure how it works, say so and ask me rather than guessing its features.`);

    const handoffs = (input.handoffs ?? []).filter(Boolean);
    if (handoffs.length) blocks.push(`How the tools fit together:\n${bullets(handoffs)}`);
    if (deep) {
        const ids = chosen.map((u) => u.tool.id);
        for (const h of HANDOFFS.filter((x) => x.steps && ids.includes(x.from) && ids.includes(x.to))) {
            blocks.push(`From ${TOOL_BY_ID[h.from].name} to ${TOOL_BY_ID[h.to].name}, step by step:\n${h.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`);
        }
    }

    if (!chosen.length && !other) {
        if (input.toolChoice === "none") blocks.push("I do not use a specific tool for this. Give the result as plain text and tables I can use anywhere, without tool-specific steps.");
        if (input.toolChoice === "recommend") blocks.push(`Recommend the tool that suits this task best${input.offered?.length ? ` (for example ${input.offered.join(", ")})` : ""}, or say if none is needed: one line on why, and what it needs. Do not assume I already have it.`);
    }

    /* the concise prompt: each tool's terms, its instructions for this task and its general ones (short, and what makes the
       work tool-specific, including rules such as keeping tokens out of requests), what to share, and the first hand-off
       line; only the Very detailed deeper practice is left out */
    const concise = chosen.map(({ tool, experience }) => {
        const work = [...(tool.tasks?.[taskId] ?? []), ...(tool.howNot?.includes(taskId) ? [] : tool.how ?? [])];
        return `Working in ${tool.name}: use its own terms (${tool.terms}).${work.map((l) => ` ${l}`).join("")} You cannot open my ${tool.name}: ask me to share ${tool.share}.${LEVEL_RULE[experience] ? ` ${LEVEL_RULE[experience](tool.name)}` : ""}`;
    });
    if (other) concise.push(blocks.find((b) => b.startsWith(`I also use ${other}`)));
    if (handoffs.length) concise.push(`How the tools fit together: ${handoffs[0]}`);
    if (!chosen.length && !other) concise.push(...blocks);

    return {
        blocks,
        concise: concise.filter(Boolean),
        prepare: chosen.map(({ tool }) => `From ${tool.name}: ${tool.share}.`),
        quality: chosen.map(({ tool }) => `${tool.name}: ${tool.check}`)
    };

}

/* The tools each profession typically uses, listed first in its tool step (kept here, not in roles.js, so the page's
   first load carries only the professions and their tasks; D17). */
export const ROLE_TOOLS = Object.freeze({
    creator: ["premiere-pro", "davinci", "capcut", "canva", "audacity"],
    graphic: ["canva", "figma", "slides"],
    developer: ["vscode", "github", "gitlab", "docker", "sql-db", "github-actions"],
    qa: ["jira", "postman", "playwright", "selenium", "testrail", "azure-devops", "sql-db", "github-actions"],
    data: ["excel", "sql-db", "power-bi", "power-query", "python-data", "tableau", "google-sheets"],
    sysadmin: ["powershell", "bash", "windows-server", "aws", "azure", "kubernetes", "terraform", "ansible", "docker"],
    marketer: ["search-console", "ga4", "google-ads", "meta-ads", "gtm", "semrush", "ahrefs", "mailchimp", "hubspot"],
    writer: ["wordpress", "google-docs", "ms-word", "search-console", "semrush"],
    techwriter: ["markdown-docs", "confluence", "openapi", "github", "ms-word"],
    ba: ["jira", "confluence", "azure-devops", "diagrams", "miro", "excel", "power-bi"],
    owner: ["excel", "google-sheets", "hubspot", "wordpress", "mailchimp", "quickbooks"],
    sales: ["salesforce", "hubspot", "sales-navigator", "excel"],
    pm: ["jira", "asana", "trello", "ms-project", "excel", "confluence", "miro"],
    product: ["jira", "confluence", "figma", "amplitude", "miro", "ga4"],
    student: ["google-docs", "ms-word", "zotero", "slides", "notion"],
    teacher: ["lms", "slides", "google-docs"],
    researcher: ["zotero", "stats", "nvivo", "python-data", "excel"],
    designer: ["figma", "miro"],
    hr: ["ats", "excel", "notion", "confluence"],
    support: ["zendesk", "freshdesk", "jsm", "excel"],
    finance: ["excel", "tally", "quickbooks", "sap", "power-bi", "google-sheets"],
    legal: ["ms-word", "doc-compare", "esign"]
});

/** The tools offered for a task, a profession's own tools first. */
export function toolsFor(taskId, preferred = []) {

    const ids = TASK_TOOLS[taskId] ?? [];
    /* the profession's tools first, in the task's order (the tool most central to the task leads) */
    const first = ids.filter((id) => preferred.includes(id));

    return [...first, ...ids.filter((id) => !first.includes(id))].map((id) => TOOL_BY_ID[id]).filter(Boolean);

}
