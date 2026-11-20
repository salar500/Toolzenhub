/* =========================================================
   ToolZen Hub
   Java Programming path: lessons (original to this site; facts checked against the Java SE 17 documentation). Java does
   not run in the page (no suitable small, permissively licensed in-browser compiler was confirmed), so exercises ask the
   learner to predict output that was recorded by compiling and running each program with Java 17.
========================================================= */

export const lessons = [
    { id: "java-basics", title: "Java basics: types, variables and output", level: "beginner", prerequisite: "None, though the JavaScript or Python path helps.",
        objectives: ["Write a class with main", "Use int, double, boolean and String", "Predict integer division and string joining"],
        intro: "Every Java program lives in classes; execution starts in public static void main(String[] args). Java is statically typed: each variable is declared with a type such as int, double, boolean or String and the compiler checks it. Integer division drops the fraction, and + joins text as soon as one side is a String.",
        blocks: [
            { type: "example", title: "Running Java on your computer", text: "// Save as Main.java, then in a terminal (JDK 17 or later):\njava Main.java\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, ShopLite!\");\n    }\n}" },
            { type: "predict", heading: "Your turn: integer division", exercise: "jv-p-int-division" },
            { type: "predict", heading: "Your turn: joining text and numbers", exercise: "jv-p-concat" }
        ],
        why: "Java runs much of the world's enterprise back ends and Android apps, and Selenium with Java is common in test teams.",
        analogy: "Static types are labelled storage boxes: the compiler refuses to put a book in a box labelled shoes.",
        mistakes: ["Expecting 7 / 2 to be 3.5.", "\"Total: \" + a + b joining instead of adding.", "Forgetting semicolons."],
        check: [{ q: "Where does a Java program start?", a: "In the main method of the class you run." }, { q: "How do you get 3.5 from 7 and 2?", a: "Make one operand a double: (double) 7 / 2." }],
        summary: "Java code lives in classes and starts in main; types are checked at compile time, int division truncates and String + joins." },
    { id: "java-strings-conditions", title: "Strings, equality and conditions", level: "beginner",
        objectives: ["Compare strings with equals", "Branch with if and the ternary operator", "Handle null safely"],
        intro: "Strings are objects. == compares whether two references point to the same object; equals compares their characters, so always use equals for text. if/else and the ternary operator (condition ? a : b) choose values. Calling a method on null throws NullPointerException; writing the known value first, \"SAVE10\".equals(code), avoids it.",
        blocks: [
            { type: "predict", heading: "Your turn: == versus equals", exercise: "jv-p-string-equals" },
            { type: "predict", heading: "Your turn: the boundary", exercise: "jv-p-boundary" },
            { type: "predict", heading: "Your turn: null", exercise: "jv-p-null" }
        ],
        why: "String == is one of the most common Java bugs, and NullPointerException is the most common Java exception.",
        analogy: "== asks 'is this the same piece of paper?'; equals asks 'does it say the same thing?'.",
        mistakes: ["Comparing strings with ==.", "Calling methods on possibly null values.", "Off-by-one boundaries."],
        check: [{ q: "Which compares the characters of two strings?", a: "equals (or equalsIgnoreCase)." }, { q: "How do you avoid NPE when comparing to a constant?", a: "Call equals on the constant: \"SAVE10\".equals(code)." }],
        summary: "Compare strings with equals, choose values with if or ?:, and guard against null." },
    { id: "java-loops-arrays", title: "Loops and arrays", level: "beginner",
        objectives: ["Loop with for and for-each", "Index arrays from 0", "Accumulate totals"],
        intro: "A classic for loop has a start, a condition and a step; the enhanced for (for (int p : prices)) visits each element. Arrays have a fixed length and indexes from 0 to length − 1; going past the end throws ArrayIndexOutOfBoundsException.",
        blocks: [
            { type: "predict", heading: "Your turn: totals and the last element", exercise: "jv-p-array-loop" }
        ],
        why: "Loops over arrays and lists are everywhere, and index errors are a classic bug.",
        analogy: "An array is a row of numbered lockers that cannot be extended once built.",
        mistakes: ["i <= length.", "Using arrays where a resizable List is needed.", "Forgetting to initialise the total."],
        check: [{ q: "What is the last valid index of an array?", a: "length − 1." }, { q: "When is for-each better?", a: "When you need each element but not its index." }],
        summary: "Use for or for-each over arrays, index from 0 and stop before length." },
    { id: "java-methods", title: "Methods, overloading and pass-by-value", level: "intermediate",
        objectives: ["Write static methods with parameters and returns", "Overload methods", "Explain pass-by-value with references"],
        intro: "Methods take typed parameters and declare a return type (void returns nothing). Overloaded methods share a name but differ in parameters. Java always passes copies of values: for primitives the method changes only its copy; for objects and arrays the copy is a reference, so the method can change the shared object's contents.",
        blocks: [
            { type: "predict", heading: "Your turn: overloading", exercise: "jv-p-overload" },
            { type: "predict", heading: "Your turn: pass-by-value", exercise: "jv-p-pass-by-value" }
        ],
        why: "'Is Java pass-by-reference?' is a standard interview question; the precise answer shows real understanding.",
        analogy: "Passing a reference is handing someone a copy of your house key: they cannot move your house, but they can rearrange the furniture.",
        mistakes: ["Expecting a method to change a primitive argument.", "Confusing overloading with overriding.", "Methods with too many parameters."],
        check: [{ q: "Is Java pass-by-value or pass-by-reference?", a: "Always pass-by-value; object references are copied." }, { q: "What distinguishes overloaded methods?", a: "Their parameter lists." }],
        summary: "Methods declare typed parameters and returns; overloads differ by parameters; Java copies values, including references." },
    { id: "java-classes", title: "Classes, objects and encapsulation", level: "intermediate",
        objectives: ["Write a class with fields, a constructor and methods", "Keep fields private", "Protect invariants in methods"],
        intro: "A class defines fields (state) and methods (behaviour); new creates objects. Constructors initialise fields, often with this.name = name. Encapsulation keeps fields private and exposes methods that protect rules, such as never selling more stock than exists.",
        blocks: [
            { type: "predict", heading: "Your turn: an object's state", exercise: "jv-p-class" }
        ],
        why: "Object-oriented design is the core of Java, and page objects in Selenium frameworks are classes.",
        analogy: "Encapsulation is a shop counter: customers ask the clerk (methods) rather than reaching into the stockroom (fields).",
        mistakes: ["Public fields that anyone can break.", "Getters and setters for everything, with no rules.", "Forgetting this when names clash."],
        check: [{ q: "Why make fields private?", a: "So only the class's methods can change them, protecting its rules." }, { q: "What does a constructor do?", a: "Initialises a new object." }],
        summary: "Classes bundle private state with methods that enforce rules; constructors set up each object." },
    { id: "java-inheritance", title: "Inheritance, interfaces and polymorphism", level: "intermediate",
        objectives: ["Extend classes and override methods", "Use abstract classes and interfaces", "Explain polymorphism"],
        intro: "A subclass extends a superclass and can override its methods (mark them @Override). Abstract classes cannot be instantiated and may declare abstract methods; interfaces declare capabilities a class implements. Polymorphism means a variable of the general type can hold any subtype, and the actual object's method runs.",
        blocks: [
            { type: "predict", heading: "Your turn: polymorphism", exercise: "jv-p-polymorphism" },
            { type: "quiz", questions: [
                { q: "Abstract class or interface for 'can be exported as CSV' across unrelated classes?", options: ["Interface", "Abstract class"], answer: 0, explain: "Interfaces describe capabilities shared by unrelated classes; a class can implement many." }
            ] }
        ],
        why: "Frameworks are built on interfaces and overriding; WebDriver itself is an interface with browser-specific implementations.",
        analogy: "Polymorphism is a universal remote: the same 'play' button works on whichever device it is pointed at.",
        mistakes: ["Deep inheritance trees.", "Forgetting @Override and misspelling a method.", "Inheriting to reuse code that should be composed."],
        check: [{ q: "What decides which override runs?", a: "The actual object's class at run time." }, { q: "Can a class implement several interfaces?", a: "Yes, but extend only one class." }],
        summary: "Override in subclasses, describe capabilities with interfaces and rely on polymorphism for flexible code." },
    { id: "java-collections", title: "Collections: List, Map and Set", level: "intermediate",
        objectives: ["Use ArrayList and HashMap", "Choose between List, Set and Map", "Count with Map.merge"],
        intro: "The collections framework provides resizable structures: List (ordered, duplicates allowed; ArrayList), Set (unique; HashSet, TreeSet) and Map (key to value; HashMap, TreeMap). Generics such as List<String> make them type-safe. TreeMap and TreeSet keep keys sorted; HashMap has no guaranteed order.",
        blocks: [
            { type: "predict", heading: "Your turn: a list", exercise: "jv-p-arraylist" },
            { type: "predict", heading: "Your turn: counting with a map", exercise: "jv-p-map" }
        ],
        why: "Every Java program uses collections; choosing the right one is a daily decision and an interview staple.",
        analogy: "A List is a queue, a Set is a guest list without repeats, a Map is a coat check: ticket to coat.",
        mistakes: ["Relying on HashMap order.", "remove(int) versus remove(Object) on a List<Integer>.", "Raw types without generics."],
        check: [{ q: "Which keeps keys sorted?", a: "TreeMap." }, { q: "What does map.getOrDefault(k, 0) return for a missing key?", a: "0." }],
        summary: "Pick List, Set or Map by need, use generics, and remember which implementations keep order." },
    { id: "java-exceptions", title: "Exceptions and error handling", level: "advanced",
        objectives: ["Catch and throw exceptions", "Tell checked from unchecked exceptions", "Use try-with-resources"],
        intro: "Exceptions signal problems. Checked exceptions (such as IOException) must be caught or declared with throws; unchecked ones (RuntimeException and subclasses such as NumberFormatException) need not be. finally always runs, and try-with-resources closes files and connections automatically.",
        blocks: [
            { type: "predict", heading: "Your turn: try, catch and finally", exercise: "jv-p-exceptions" },
            { type: "example", title: "try-with-resources", text: "try (BufferedReader in = Files.newBufferedReader(Path.of(\"orders.csv\"))) {\n    System.out.println(in.readLine());\n} catch (IOException e) {\n    System.err.println(\"Could not read orders: \" + e.getMessage());\n}" }
        ],
        why: "Robust Java services and test frameworks depend on precise, honest error handling.",
        analogy: "A checked exception is a warning label the compiler insists you read.",
        mistakes: ["Empty catch blocks.", "Catching Exception everywhere.", "Not closing resources."],
        check: [{ q: "Is NumberFormatException checked?", a: "No, it is unchecked (a RuntimeException)." }, { q: "What does try-with-resources do?", a: "Closes the declared resources automatically." }],
        summary: "Catch specific exceptions, know checked versus unchecked, and close resources with try-with-resources." },
    { id: "java-streams-testing", title: "Streams, lambdas and unit testing with JUnit", level: "advanced",
        objectives: ["Read stream pipelines", "Write lambdas and method references", "Write JUnit 5 tests"],
        intro: "Streams process collections in pipelines: filter, map, then a terminal operation such as sum, count or toList. Lambdas (p -> p > 400) and method references (Integer::sum) pass behaviour as values. JUnit 5 tests are methods annotated @Test that use assertEquals and assertThrows.",
        blocks: [
            { type: "predict", heading: "Your turn: a stream pipeline", exercise: "jv-p-streams" },
            { type: "example", title: "A JUnit 5 test", text: "class DeliveryTest {\n    @Test\n    void ordersOver999ShipFree() {\n        assertEquals(0, Delivery.fee(1000));\n        assertEquals(49, Delivery.fee(999));\n    }\n\n    @Test\n    void rejectsNegativeTotals() {\n        assertThrows(IllegalArgumentException.class, () -> Delivery.fee(-1));\n    }\n}" }
        ],
        why: "Modern Java is written with streams and lambdas, and JUnit is the standard for unit tests and many Selenium suites.",
        analogy: "A stream is a conveyor belt with stations: sort, filter, package.",
        mistakes: ["Side effects inside stream operations.", "Overlong pipelines.", "Tests without boundary cases."],
        check: [{ q: "Which annotation marks a JUnit 5 test?", a: "@Test." }, { q: "Which assertion checks an exception?", a: "assertThrows." }],
        summary: "Use stream pipelines with lambdas for collection work and protect code with JUnit tests, including boundaries and exceptions." }
];

export const interview = {
    howTo: "Answer each question before opening the explanation. Java interviews test precise language knowledge; read the reasoning.",
    description: "12 Java interview questions with explained answers: types, strings, equality, pass-by-value, OOP, collections, exceptions and streams.",
    coding: [],
    quiz: [
        { q: "== versus equals for strings?", options: ["== compares references; equals compares content", "The same"], answer: 0, explain: "Use equals." },
        { q: "Is Java pass-by-value?", options: ["Yes, always; references are copied", "No, objects are passed by reference"], answer: 0, explain: "The reference value is copied." },
        { q: "What is 7 / 2 in Java with ints?", options: ["3", "3.5"], answer: 0, explain: "Integer division." },
        { q: "Overloading versus overriding?", options: ["Overloading: same name, different parameters; overriding: subclass replaces a method", "The same"], answer: 0, explain: "Compile time versus run time." },
        { q: "Abstract class versus interface?", options: ["A class extends one abstract class but can implement many interfaces", "No difference"], answer: 0, explain: "Interfaces describe capabilities." },
        { q: "ArrayList versus LinkedList for random access?", options: ["ArrayList", "LinkedList"], answer: 0, explain: "Index access is O(1) in ArrayList." },
        { q: "HashMap order?", options: ["Not guaranteed", "Insertion order"], answer: 0, explain: "Use LinkedHashMap or TreeMap for order." },
        { q: "Checked versus unchecked exceptions?", options: ["Checked must be caught or declared", "Unchecked must be caught"], answer: 0, explain: "RuntimeException subclasses are unchecked." },
        { q: "What does final mean on a variable?", options: ["It cannot be reassigned", "It is constant forever, including object contents"], answer: 0, explain: "The object can still change." },
        { q: "Why are Strings immutable?", options: ["Safety, caching and thread-safety", "No reason"], answer: 0, explain: "Every change makes a new String." },
        { q: "What does try-with-resources do?", options: ["Closes resources automatically", "Retries on failure"], answer: 0, explain: "For AutoCloseable resources." },
        { q: "What does stream().filter(...).toList() return?", options: ["A new list of matching elements", "It changes the original list"], answer: 0, explain: "Streams do not modify the source." }
    ]
};
