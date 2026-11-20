/* =========================================================
   ToolZen Hub
   Kubernetes and Deployment path: lessons (original to this site; object names and behaviour as in the Kubernetes
   documentation). Checked by questions, ordering tasks and manifest reading; no cluster runs in the page.
========================================================= */

export const lessons = [
    { id: "k8s-compose", title: "Multi-container apps with Docker Compose", level: "intermediate", prerequisite: "The containers lesson of Git and DevOps Foundations.",
        objectives: ["Describe services, networks and volumes", "Read a compose file", "Run a local stack"],
        intro: "Real applications need several containers: the web app, a database, a cache. Docker Compose describes them in one compose.yaml: each service has an image or build, ports, environment variables and volumes for data that must survive restarts. Services on the same Compose network reach each other by service name.",
        blocks: [
            { type: "example", title: "compose.yaml for ShopLite", text: "services:\n  web:\n    build: .\n    ports: [\"8080:8080\"]\n    environment:\n      DATABASE_URL: postgres://shop:secret@db:5432/shop\n    depends_on: [db]\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_USER: shop\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - dbdata:/var/lib/postgresql/data\nvolumes:\n  dbdata:" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "How does web reach the database?", options: ["By the service name db on the Compose network", "By localhost"], answer: 0, explain: "Inside a container, localhost is the container itself." },
                { q: "What happens to the database data if db is recreated?", options: ["It survives in the dbdata volume", "It is lost"], answer: 0, explain: "Volumes keep data outside the container's writable layer." },
                { q: "Is putting POSTGRES_PASSWORD in compose.yaml fine for production?", options: ["No: use secrets or environment files kept out of Git", "Yes"], answer: 0, explain: "Fine for a local demo, not for real secrets." }
            ] }
        ],
        why: "Compose is the standard way to run a full stack locally and in many test environments.",
        analogy: "A compose file is a seating plan for a dinner: who sits where, and who can talk to whom.",
        mistakes: ["Using localhost between containers.", "No volume for databases.", "Committed real passwords."],
        check: [{ q: "What keeps data across container restarts?", a: "A volume." }, { q: "What does depends_on do?", a: "Starts the listed services first (it does not wait for them to be ready)." }],
        summary: "Compose describes services, networks and volumes for a multi-container app; services talk by name and volumes keep data." },
    { id: "k8s-objects", title: "Kubernetes: pods, deployments and services", level: "intermediate",
        objectives: ["Explain what Kubernetes does", "Read a Deployment and a Service", "Use kubectl to inspect them"],
        intro: "Kubernetes runs containers across many machines and keeps them in the state you declare. A Pod is one or more containers scheduled together. A Deployment keeps a number of identical pods running and replaces failed ones. A Service gives a stable name and address in front of changing pods. You declare the desired state in YAML and kubectl apply sends it to the cluster.",
        blocks: [
            { type: "example", title: "A Deployment and a Service", text: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: shoplite-web\nspec:\n  replicas: 3\n  selector:\n    matchLabels: { app: shoplite-web }\n  template:\n    metadata:\n      labels: { app: shoplite-web }\n    spec:\n      containers:\n        - name: web\n          image: registry.example/shoplite:1.4.2\n          ports: [{ containerPort: 8080 }]\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: shoplite-web\nspec:\n  selector: { app: shoplite-web }\n  ports: [{ port: 80, targetPort: 8080 }]" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "One of the three pods crashes. What happens?", options: ["The Deployment starts a replacement to keep 3 running", "Nothing until someone notices"], answer: 0, explain: "Controllers continuously reconcile actual state with desired state." },
                { q: "How does the Service know which pods to send traffic to?", options: ["Its selector matches the pods' labels", "By pod names"], answer: 0, explain: "Labels and selectors connect objects." },
                { q: "Which command shows why a pod is failing?", options: ["kubectl describe pod NAME and kubectl logs NAME", "kubectl delete"], answer: 0, explain: "describe shows events; logs shows output." }
            ] }
        ],
        why: "Kubernetes is the most common platform for running containerised services at scale.",
        analogy: "A Deployment is a thermostat: you set the temperature (replicas) and it keeps correcting towards it.",
        mistakes: ["Using the latest tag for images.", "Selectors that do not match labels.", "Running single pods instead of Deployments."],
        check: [{ q: "What does a Service provide?", a: "A stable name and address in front of a changing set of pods." }, { q: "What does kubectl apply -f do?", a: "Sends the declared desired state to the cluster." }],
        summary: "Declare pods through Deployments, expose them with Services matched by labels, and inspect with kubectl describe and logs." },
    { id: "k8s-config-health", title: "Configuration, secrets and health checks", level: "advanced",
        objectives: ["Use ConfigMaps and Secrets", "Add readiness and liveness probes", "Set resource requests and limits"],
        intro: "ConfigMaps hold configuration and Secrets hold sensitive values, injected as environment variables or files, so images stay the same across environments. Readiness probes tell Kubernetes when a pod can receive traffic; liveness probes restart a pod that has hung. Resource requests reserve CPU and memory; limits cap them.",
        blocks: [
            { type: "example", title: "Probes and resources", text: "readinessProbe:\n  httpGet: { path: /health/ready, port: 8080 }\n  periodSeconds: 5\nlivenessProbe:\n  httpGet: { path: /health/live, port: 8080 }\n  initialDelaySeconds: 20\nresources:\n  requests: { cpu: 250m, memory: 256Mi }\n  limits: { memory: 512Mi }" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "The app needs 30 seconds to warm up and receives traffic too early. Which probe fixes it?", options: ["Readiness probe", "Liveness probe"], answer: 0, explain: "Readiness keeps the pod out of the Service until it is ready." },
                { q: "A pod keeps being killed with OOMKilled. What does it mean?", options: ["It exceeded its memory limit", "The network failed"], answer: 0, explain: "Raise the limit after checking for leaks, or reduce memory use." },
                { q: "Are Kubernetes Secrets encrypted by default?", options: ["Only base64-encoded unless encryption at rest is configured", "Always strongly encrypted"], answer: 0, explain: "Base64 is encoding, not encryption; restrict access and enable encryption at rest." }
            ] }
        ],
        why: "Most production incidents in Kubernetes come from missing probes, wrong limits or mishandled configuration.",
        analogy: "Readiness is a shop sign switched from Closed to Open; liveness is a manager checking the cashier has not fallen asleep.",
        mistakes: ["Liveness probes that check dependencies and cause restart storms.", "No resource requests.", "Treating base64 as encryption."],
        check: [{ q: "Readiness versus liveness?", a: "Readiness controls traffic; liveness triggers restarts." }, { q: "Where should a database password live?", a: "In a Secret (or an external secret store), not the image." }],
        summary: "Inject configuration with ConfigMaps and Secrets, add readiness and liveness probes and set resource requests and limits." },
    { id: "k8s-deploy-strategies", title: "Deployment strategies and rollbacks", level: "advanced",
        objectives: ["Compare rolling, blue-green and canary releases", "Roll back a bad release", "Use feature flags"],
        intro: "A rolling update replaces pods a few at a time, the Kubernetes default. Blue-green runs the new version beside the old and switches traffic at once. A canary sends a small share of traffic to the new version and watches metrics before going further. kubectl rollout undo returns to the previous version; feature flags turn features off without redeploying.",
        blocks: [
            { type: "order", heading: "Your turn: a canary release", prompt: "Order the steps of a careful canary release.", items: ["Deploy the new version beside the current one", "Send about 5% of traffic to it", "Compare error rate and latency with the current version", "Increase traffic step by step while metrics stay healthy", "Complete the switch, or roll back if metrics worsen"], explain: "Small exposure first, watch real metrics, then widen or roll back." },
            { type: "quiz", questions: [
                { q: "A release raises errors from 0.2% to 4%. Fastest safe action?", options: ["Roll back (kubectl rollout undo) and investigate", "Wait for it to settle"], answer: 0, explain: "Restore service first." },
                { q: "Database migrations in rolling releases should be:", options: ["Backward compatible, so old and new versions work during the switch", "Destructive in the same release"], answer: 0, explain: "Expand first, contract in a later release." }
            ] }
        ],
        why: "How you release decides how many users a bad change can hurt and how quickly you recover.",
        analogy: "A canary release is tasting the soup before serving the whole room.",
        mistakes: ["Big-bang releases.", "Incompatible database changes.", "No rollback plan."],
        check: [{ q: "What is a canary release?", a: "Sending a small share of traffic to the new version first and watching metrics." }, { q: "How do you roll back a Deployment?", a: "kubectl rollout undo deployment/NAME." }],
        summary: "Release gradually (rolling, blue-green, canary), keep migrations compatible and be ready to roll back." },
    { id: "k8s-reliability", title: "Reliability: SLIs, SLOs and error budgets", level: "advanced",
        objectives: ["Define SLIs and SLOs", "Use an error budget", "Design for failure"],
        intro: "Site reliability engineering measures what users experience. A service level indicator (SLI) is a measurement such as the share of successful requests. A service level objective (SLO) is the target, such as 99.9% over 30 days. The error budget is what remains: 0.1% of requests may fail, and when it is spent, reliability work comes before new features.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "An SLO of 99.9% availability over 30 days allows about how much downtime?", options: ["About 43 minutes", "About 7 hours"], answer: 0, explain: "0.1% of 43,200 minutes is 43.2 minutes." },
                { q: "The error budget is used up in week two. What usually happens?", options: ["Feature releases pause while reliability is improved", "Nothing"], answer: 0, explain: "The budget turns reliability into a shared decision rule." },
                { q: "Which is a good SLI for checkout?", options: ["Share of checkout requests that succeed within 2 seconds", "Server CPU usage"], answer: 0, explain: "SLIs measure user experience, not machine internals." }
            ] }
        ],
        why: "Clear reliability targets stop endless arguments between shipping fast and staying stable.",
        analogy: "An error budget is a monthly allowance: spend it on risky releases, but when it is gone, you save.",
        mistakes: ["Aiming for 100%.", "SLIs that do not reflect users.", "Ignoring the budget."],
        check: [{ q: "SLI versus SLO?", a: "The SLI is the measurement; the SLO is the target for it." }, { q: "What is an error budget?", a: "The amount of failure the SLO allows over its period." }],
        summary: "Measure user-facing SLIs, set SLO targets and use the error budget to balance releases and reliability." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Platform interviews reward clear reasoning about failure and recovery.",
    description: "10 Docker Compose, Kubernetes and reliability interview questions with explained answers.",
    coding: [],
    quiz: [
        { q: "Pod versus Deployment?", options: ["A Deployment manages replicated pods and replaces failed ones", "The same"], answer: 0, explain: "Use Deployments for stateless apps." },
        { q: "What does a Service do?", options: ["Gives a stable address in front of pods", "Builds images"], answer: 0, explain: "Selected by labels." },
        { q: "Readiness versus liveness probe?", options: ["Readiness controls traffic; liveness restarts hung pods", "The same"], answer: 0, explain: "Both are health checks with different actions." },
        { q: "What is OOMKilled?", options: ["The container exceeded its memory limit", "A network error"], answer: 0, explain: "Check limits and leaks." },
        { q: "Are Secrets encrypted by default?", options: ["Base64-encoded; encryption at rest must be configured", "Yes, always"], answer: 0, explain: "Restrict access." },
        { q: "Rolling versus canary?", options: ["Rolling replaces gradually; canary tests a small share of traffic first", "The same"], answer: 0, explain: "Canaries are watched before widening." },
        { q: "How do you roll back?", options: ["kubectl rollout undo", "Delete the cluster"], answer: 0, explain: "Returns to the previous ReplicaSet." },
        { q: "Why avoid the latest image tag?", options: ["Deployments become unpredictable and hard to roll back", "It is slower"], answer: 0, explain: "Pin versions." },
        { q: "What is an SLO?", options: ["A target for a service level indicator", "A server type"], answer: 0, explain: "For example 99.9% successful requests." },
        { q: "How do containers in Compose reach each other?", options: ["By service name", "By localhost"], answer: 0, explain: "Compose provides DNS on its network." }
    ]
};
