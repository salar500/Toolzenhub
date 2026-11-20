/* =========================================================
   ToolZen Hub
   Machine Learning Foundations path: lessons (original to this site). Visualizers run the real algorithms on small fixed
   datasets in the browser (ai/ml-models.js); no model is downloaded and nothing is sent.
========================================================= */

export const lessons = [
    { id: "ml-what", title: "What machine learning is and how a project runs", level: "beginner", prerequisite: "AI and LLM Foundations lesson 1 helps; basic arithmetic is enough.",
        objectives: ["Tell supervised from unsupervised learning", "Name the steps of an ML project", "Recognise regression and classification problems"],
        intro: "Machine learning builds models from examples. In supervised learning every example has a known answer (a label) and the model learns to predict it: a number in regression (a price), a category in classification (spam or not). In unsupervised learning there are no labels and the model finds structure, such as groups of similar customers. A project runs from a clear question and data, through training and evaluation, to deployment and monitoring.",
        blocks: [
            { type: "order", heading: "Your turn: the project steps", prompt: "Put the steps of a machine-learning project in order.", items: ["Define the question and how success is measured", "Collect and clean the data", "Split it into training and test sets", "Train candidate models", "Evaluate on the test set and choose", "Deploy and monitor for drift"], explain: "The question and metric come first; the test set stays untouched until evaluation; monitoring continues after release." },
            { type: "quiz", questions: [
                { q: "Predict tomorrow's number of orders.", options: ["Regression", "Classification", "Clustering"], answer: 0, explain: "The answer is a number." },
                { q: "Group customers by behaviour without predefined groups.", options: ["Clustering (unsupervised)", "Regression"], answer: 0, explain: "No labels: the algorithm finds the groups." },
                { q: "Decide whether a payment is fraudulent.", options: ["Classification", "Regression"], answer: 0, explain: "The answer is a category: fraud or not." }
            ] }
        ],
        why: "Recommendations, fraud checks, demand forecasts and search ranking are ML. Developers, analysts and testers increasingly work beside these systems.",
        analogy: "Supervised learning is learning from a teacher's marked homework; unsupervised learning is sorting a box of mixed buttons by yourself.",
        mistakes: ["Starting with an algorithm instead of a question.", "Measuring success with the wrong metric.", "Forgetting that models must be monitored after release."],
        check: [{ q: "What is a label?", a: "The known answer for an example in supervised learning." }, { q: "Regression or classification: predicting delivery days?", a: "Regression (a number)." }],
        summary: "Supervised learning predicts labels (regression for numbers, classification for categories); unsupervised learning finds structure; projects run from question to monitoring." },
    { id: "ml-data", title: "Data, features and train/test splits", level: "beginner",
        objectives: ["Turn raw data into features", "Explain why we hold out a test set", "Recognise data leakage"],
        intro: "Features are the inputs a model uses: size, city, number of past orders. Categories are encoded as numbers (one column per category), numbers are often scaled, and missing values are handled deliberately. The data is split before training: the model learns from the training set and is judged on the test set it has never seen. Leakage happens when information from the answer sneaks into the features, giving results that are too good to be true.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "A model predicts whether a customer will cancel, using a feature 'cancellation_date is filled in'. What is wrong?", options: ["Leakage: the feature contains the answer", "Nothing"], answer: 0, explain: "It will look perfect in testing and fail in real use, where the date is unknown in advance." },
                { q: "Why must the test set be kept separate?", options: ["To estimate how the model does on new data", "To make training faster"], answer: 0, explain: "Evaluating on training data rewards memorising." },
                { q: "City is Pune, Delhi or Mumbai. How is it usually given to a model?", options: ["One-hot encoding: a 0/1 column per city", "As 1, 2 and 3"], answer: 0, explain: "Numbering implies an order and distance that do not exist." }
            ] }
        ],
        why: "Most ML failures are data failures. The Statistics path's cleaning skills apply directly.",
        analogy: "A test set is an exam with questions the student has not seen; leakage is the answer sheet left in the exam room.",
        mistakes: ["Scaling or cleaning using statistics from the whole dataset, test set included.", "Leaky features.", "Random splits for time-ordered data (use past to predict future)."],
        check: [{ q: "What is a feature?", a: "An input variable the model uses to predict." }, { q: "How should time-series data be split?", a: "By time: train on earlier data, test on later data." }],
        summary: "Prepare features carefully, split before training, keep the test set untouched and watch for leakage." },
    { id: "ml-regression", title: "Linear regression and the error a model makes", level: "beginner",
        objectives: ["Fit a straight line by eye and by least squares", "Explain mean squared error", "Interpret a slope"],
        intro: "Linear regression predicts a number as intercept + slope × feature. Training means choosing the line that makes the mean squared error (the average of the squared gaps between predictions and real values) as small as possible; least squares finds it exactly. The slope says how much the prediction changes per unit of the feature.",
        blocks: [
            { type: "aiviz", kind: "regression", heading: "Try it: fit the line yourself", text: "Eight houses: size in square metres against price in ₹ lakh. Move the sliders to make the error as small as you can, then compare with the least-squares line." },
            { type: "quiz", questions: [
                { q: "The fitted slope is about 0.61. What does it mean?", options: ["Each extra m² adds about ₹0.61 lakh to the predicted price", "Prices rise 61%"], answer: 0, explain: "The slope is the change in prediction per unit of the feature." },
                { q: "Why square the errors?", options: ["So positive and negative gaps do not cancel, and big misses count more", "To make numbers smaller"], answer: 0, explain: "Squaring makes every gap count and penalises large errors." }
            ] }
        ],
        why: "Regression is the simplest model and the base for understanding how all models are trained by minimising an error.",
        analogy: "Fitting a line is stretching a rubber band through a scatter of pins so it is as close as possible to all of them.",
        mistakes: ["Predicting far outside the data's range.", "Assuming a straight line when the pattern curves.", "Reading the slope as cause."],
        check: [{ q: "What does training minimise in linear regression?", a: "The mean squared error on the training data." }, { q: "Can a line predict prices for 500 m² homes here?", a: "Not reliably: the data only covers 45 to 140 m²." }],
        summary: "Linear regression fits intercept + slope × feature by minimising mean squared error; interpret the slope within the data's range." },
    { id: "ml-classification", title: "Classification, thresholds and the confusion matrix", level: "intermediate",
        objectives: ["Explain predicted probabilities and thresholds", "Read precision and recall", "Choose a threshold for the cost of errors"],
        intro: "Classifiers such as logistic regression output a probability; a threshold turns it into a decision. The confusion matrix counts true and false positives and negatives; precision and recall summarise them. Choosing the threshold is a business decision about which mistakes cost more.",
        blocks: [
            { type: "aiviz", kind: "confusion", heading: "Try it: move the threshold", text: "Twenty emails scored by a spam filter. Watch precision and recall trade off as the threshold changes." },
            { type: "quiz", questions: [
                { q: "A medical screening test should miss as few sick patients as possible. Optimise for:", options: ["Recall", "Precision"], answer: 0, explain: "Missing a real case is the costly error; follow-up tests handle false alarms." },
                { q: "F1 is:", options: ["The harmonic mean of precision and recall", "Accuracy times two"], answer: 0, explain: "It is high only when both are high." }
            ] }
        ],
        why: "Fraud, spam, churn and moderation systems are classifiers, and their thresholds decide who gets blocked.",
        analogy: "The threshold is a bouncer's strictness: stricter means fewer troublemakers inside, and more good guests turned away.",
        mistakes: ["Using the default 0.5 threshold without thought.", "Reporting accuracy on imbalanced data.", "Ignoring the cost of each error type."],
        check: [{ q: "What does a classifier usually output before the threshold?", a: "A probability or score." }, { q: "Raising the threshold usually does what to recall?", a: "Lowers it." }],
        summary: "Classifiers output probabilities; thresholds turn them into decisions, traded off through precision and recall by the cost of errors." },
    { id: "ml-trees", title: "Decision trees and ensembles", level: "intermediate",
        objectives: ["Explain how a tree chooses a split", "Calculate the effect of a split with Gini impurity", "Describe random forests and boosting"],
        intro: "A decision tree asks yes/no questions about features (income ≤ 6?) and predicts at the leaves. Each split is chosen to make the groups purer; Gini impurity measures how mixed a group is (0 means all one class). Single trees overfit easily, so practitioners combine many: random forests average trees trained on random samples, and gradient boosting adds trees that correct earlier mistakes.",
        blocks: [
            { type: "aiviz", kind: "tree", heading: "Try it: choose the best split", text: "Ten loan applications: income and whether the loan was repaid. Move the threshold to find the split with the lowest weighted Gini impurity." },
            { type: "quiz", questions: [
                { q: "Which threshold gives the purest split here?", options: ["Income ≤ 6 (impurity 0.160)", "Income ≤ 4 (impurity 0.300)"], answer: 0, explain: "Try the slider: 6 separates repaid and unpaid loans best: only one loan (income 6, repaid) is on the wrong side." },
                { q: "Why do random forests usually beat a single deep tree?", options: ["Averaging many varied trees reduces overfitting", "They use more features"], answer: 0, explain: "Each tree's random mistakes partly cancel out." }
            ] }
        ],
        why: "Tree ensembles are the strongest standard choice for tabular business data and are widely used in industry.",
        analogy: "A decision tree is the game twenty questions: each good question halves the possibilities.",
        mistakes: ["Very deep trees that memorise noise.", "Trusting one tree's structure as an explanation of the world.", "Ignoring feature leakage that makes splits look perfect."],
        check: [{ q: "What does a Gini impurity of 0 mean?", a: "The group contains only one class." }, { q: "Bagging versus boosting?", a: "Bagging averages independent trees (random forest); boosting adds trees that fix earlier errors." }],
        summary: "Trees split on the questions that most reduce impurity; ensembles of trees (forests, boosting) are accurate and robust on tabular data." },
    { id: "ml-overfitting", title: "Overfitting, validation and model evaluation", level: "intermediate",
        objectives: ["Recognise overfitting and underfitting", "Use validation and cross-validation", "Pick the model that generalises best"],
        intro: "A model that is too simple misses the pattern (underfitting); one that is too flexible memorises noise in the training data (overfitting) and does badly on new data. Training error alone always prefers the more complex model, so choices are made on data the model has not trained on: a validation set or k-fold cross-validation. The test set is used once, at the end.",
        blocks: [
            { type: "aiviz", kind: "overfit", heading: "Try it: change the model's complexity", text: "Ten noisy training points from a wave, and nine test points the model never sees. Increase the polynomial degree and watch training error fall while test error falls, then rises." },
            { type: "quiz", questions: [
                { q: "Which degree generalises best here?", options: ["Degree 5, the lowest test error", "Degree 9, zero training error"], answer: 0, explain: "Degree 9 passes through every training point and wobbles between them." },
                { q: "What does 5-fold cross-validation do?", options: ["Trains 5 times, each time validating on a different fifth of the data", "Trains on five copies of the data"], answer: 0, explain: "It gives a steadier estimate than one split." },
                { q: "Training accuracy 99%, test accuracy 70%. Most likely?", options: ["Overfitting", "Underfitting"], answer: 0, explain: "A large gap between training and test performance signals memorisation." }
            ] }
        ],
        why: "Overfitting is the central practical problem of ML; every evaluation choice is about avoiding it.",
        analogy: "Overfitting is memorising last year's exam answers: perfect on those questions, lost on new ones.",
        mistakes: ["Choosing models by training error.", "Tuning repeatedly on the test set.", "Too little data for a flexible model."],
        check: [{ q: "Underfitting versus overfitting?", a: "Too simple to capture the pattern versus so flexible it memorises noise." }, { q: "When is the test set used?", a: "Once, for the final estimate after choices are made." }],
        summary: "Balance simplicity and flexibility, choose models on validation data or cross-validation, and keep the test set for the final check." },
    { id: "ml-clustering", title: "Clustering with k-means", level: "advanced",
        objectives: ["Run k-means step by step", "Explain inertia and convergence", "Choose k and interpret clusters"],
        intro: "k-means groups points into k clusters. It starts with k centres, assigns every point to the nearest centre, moves each centre to the mean of its points, and repeats until nothing changes. Inertia, the total squared distance from points to their centres, never increases. Results depend on the starting centres and on scaling the features; the elbow method and business sense help choose k.",
        blocks: [
            { type: "aiviz", kind: "kmeans", heading: "Try it: step through k-means", text: "Twelve customers and three badly placed starting centres. Step through the iterations and watch the centres find the three groups." },
            { type: "quiz", questions: [
                { q: "Visits range from 2 to 11 and basket values from 300 to 1,200 rupees, unscaled. What happens?", options: ["Distances are dominated by the basket value", "Nothing"], answer: 0, explain: "Scale features before distance-based methods." },
                { q: "Do the clusters come with names?", options: ["No: people interpret and name them, such as frequent small spenders", "Yes, automatically"], answer: 0, explain: "Unsupervised results need human interpretation." }
            ] }
        ],
        why: "Segmentation for marketing, grouping documents and finding unusual behaviour all start with clustering.",
        analogy: "k-means is placing k ice-cream vans on a beach and repeatedly moving each van to the middle of its customers.",
        mistakes: ["Unscaled features.", "Treating clusters as ground truth.", "Choosing k without looking at the data or the use."],
        check: [{ q: "What two steps repeat in k-means?", a: "Assign points to the nearest centre; move each centre to the mean of its points." }, { q: "What is inertia?", a: "The total squared distance from points to their cluster centres." }],
        summary: "k-means alternates assignment and centre updates until stable; scale features, try several starts and interpret clusters with care." },
    { id: "ml-neural", title: "Neural networks and deep learning", level: "advanced",
        objectives: ["Describe neurons, layers and activations", "Explain training with gradient descent", "Know when deep learning fits"],
        intro: "A neural network passes inputs through layers of simple units. Each unit computes a weighted sum, adds a bias and applies an activation such as ReLU; stacking layers lets the network learn complex patterns. Training adjusts the weights by gradient descent: compute the error, use backpropagation to find how each weight affects it, and move the weights a small step (the learning rate) in the direction that reduces it. Deep learning shines on images, audio and text with large datasets.",
        blocks: [
            { type: "example", title: "One neuron", text: "inputs:   size = 0.8, rooms = 0.5\nweights:  0.6, 0.4    bias: 0.1\nsum:      0.8 × 0.6 + 0.5 × 0.4 + 0.1 = 0.78\nReLU:     max(0, 0.78) = 0.78" },
            { type: "quiz", heading: "Your turn", questions: [
                { q: "The learning rate is far too high. What usually happens?", options: ["The error jumps around or grows instead of settling", "Training is perfect"], answer: 0, explain: "Steps overshoot the minimum." },
                { q: "A neuron's weights 0.5 and −1, bias 0.2, inputs 2 and 1, activation ReLU. Output?", options: ["0.2", "0"], answer: 0, explain: "2 × 0.5 + 1 × (−1) + 0.2 = 0.2, and ReLU keeps positive values." },
                { q: "For 2,000 rows of tabular sales data, what usually works best first?", options: ["Gradient-boosted trees", "A very deep neural network"], answer: 0, explain: "Deep learning needs much data; trees are strong on small tabular sets." }
            ] }
        ],
        why: "Language models, image recognition and speech systems are deep neural networks; understanding the basics demystifies them.",
        analogy: "Gradient descent is walking downhill in fog: feel the slope underfoot and take a small step down, again and again.",
        mistakes: ["Deep learning for small tabular problems.", "Learning rates that are too high or too low.", "No validation set to catch overfitting."],
        check: [{ q: "What does backpropagation compute?", a: "How much each weight contributed to the error (the gradients)." }, { q: "What does an activation function add?", a: "Non-linearity, so stacked layers can model complex patterns." }],
        summary: "Networks stack weighted sums and activations, train by gradient descent with backpropagation and excel on large unstructured data." },
    { id: "ml-nlp-vision", title: "NLP, computer vision and models in production", level: "advanced",
        objectives: ["Describe how text and images become model inputs", "Explain transfer learning", "Monitor models for drift and bias"],
        intro: "Text is turned into tokens and embeddings; transformer models read whole sequences with attention, which is how language models work. Images are grids of pixel values processed by convolutional networks or vision transformers. Transfer learning starts from a large pretrained model and fine-tunes it on a small task-specific dataset. In production, inputs change over time (data drift), so performance, fairness and the input distribution must be monitored and models retrained.",
        blocks: [
            { type: "quiz", heading: "Your turn", questions: [
                { q: "You have 800 labelled photos of damaged parcels. Best approach?", options: ["Fine-tune a pretrained vision model (transfer learning)", "Train a large network from scratch"], answer: 0, explain: "Pretrained features need far less labelled data." },
                { q: "A fraud model's precision falls after a festival season. Likely cause?", options: ["Data drift: buying behaviour changed", "The code was deleted"], answer: 0, explain: "Monitor input distributions and performance; retrain when they move." },
                { q: "What does attention let a transformer do?", options: ["Weigh how much each token should use every other token", "Store images"], answer: 0, explain: "Attention connects words across a whole passage." },
                { q: "A model approves fewer loans for one group with equal incomes. What should the team do?", options: ["Investigate the data and features for bias, and measure outcomes per group", "Nothing; the model is objective"], answer: 0, explain: "Models learn biases in their data; fairness must be measured." }
            ] }
        ],
        why: "Most real AI products combine pretrained models with a little task data, and fail quietly without monitoring.",
        analogy: "Transfer learning is hiring an experienced chef and teaching them your menu, rather than training someone who has never cooked.",
        mistakes: ["Training from scratch with little data.", "No monitoring after release.", "Assuming models are neutral."],
        check: [{ q: "What is data drift?", a: "A change in the input data over time, so the model sees data unlike its training data." }, { q: "What is transfer learning?", a: "Adapting a model pretrained on a large dataset to a new task with less data." }],
        summary: "Text becomes tokens and embeddings for transformers, images become pixel grids for vision models; reuse pretrained models and monitor drift and fairness in production." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. ML interviews probe judgement about data and evaluation more than formulas.",
    description: "12 machine-learning interview questions with explained answers: supervised and unsupervised learning, leakage, overfitting, metrics, trees, clustering and neural networks.",
    coding: [],
    quiz: [
        { q: "Supervised versus unsupervised?", options: ["Labels versus no labels", "Fast versus slow"], answer: 0, explain: "Unsupervised finds structure without answers." },
        { q: "What is overfitting?", options: ["Fitting noise in training data so new data suffers", "Using too little data"], answer: 0, explain: "Big train/test gap." },
        { q: "How do you detect overfitting?", options: ["Compare training and validation performance", "Look at training accuracy only"], answer: 0, explain: "Cross-validation helps." },
        { q: "What is data leakage?", options: ["Information about the target leaking into features or training", "A security breach"], answer: 0, explain: "Results look too good." },
        { q: "Bias-variance trade-off?", options: ["Simple models err by bias, flexible ones by variance", "A fairness rule"], answer: 0, explain: "Balance them." },
        { q: "Why scale features for k-means?", options: ["Distances otherwise depend on units", "It is optional decoration"], answer: 0, explain: "Large-range features dominate." },
        { q: "Precision versus recall?", options: ["Flagged items that are right versus real cases caught", "The same"], answer: 0, explain: "Threshold trade-off." },
        { q: "Random forest versus single tree?", options: ["Averages many trees to reduce overfitting", "Uses one bigger tree"], answer: 0, explain: "Bagging." },
        { q: "What does the learning rate control?", options: ["The size of each weight update", "The dataset size"], answer: 0, explain: "Too high diverges, too low is slow." },
        { q: "What is regularisation?", options: ["Penalising complexity to reduce overfitting", "Cleaning data"], answer: 0, explain: "L1, L2, dropout." },
        { q: "When is accuracy misleading?", options: ["With imbalanced classes", "Never"], answer: 0, explain: "Use precision, recall, F1 or AUC." },
        { q: "What is transfer learning?", options: ["Adapting a pretrained model to a new task", "Moving data between servers"], answer: 0, explain: "Needs less data." }
    ]
};
