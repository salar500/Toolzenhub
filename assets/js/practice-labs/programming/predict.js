/* =========================================================
   ToolZen Hub
   Output-prediction exercises (the predict block): read the code, type exactly what it prints. Used where the browser
   does not run the language (Java) and for tracing practice in Python. Every expected output was produced by running
   the code with the real compiler or interpreter (pinned by tests/unit/predict.test.mjs with javac 17 and CPython).
========================================================= */

const indent = (text, n) => text.split("\n").map((l) => (l ? " ".repeat(n) + l : l)).join("\n");
const java = (body, after = "", imports = "") => `${imports ? `${imports}\n\n` : ""}public class Main {\n    public static void main(String[] args) {\n${indent(body, 8)}\n    }${after ? `\n\n${indent(after, 4)}` : ""}\n}`;

export const PREDICT = Object.freeze([
    { id: "jv-p-int-division", lang: "java", code: java("int items = 7;\nint boxes = 2;\nSystem.out.println(items / boxes);\nSystem.out.println(items % boxes);\nSystem.out.println((double) items / boxes);"),
        output: "3\n1\n3.5", hint: "Dividing two ints throws away the fraction; the cast happens before the division in the last line.",
        explain: "int / int is integer division (3), % is the remainder (1), and casting one operand to double first gives 3.5." },
    { id: "jv-p-concat", lang: "java", code: java("System.out.println(1 + 2 + \"3\" + 4 + 5);\nSystem.out.println(\"Total: \" + 499 + 49);\nSystem.out.println(\"Total: \" + (499 + 49));"),
        output: "3345\nTotal: 49949\nTotal: 548", hint: "+ is evaluated left to right; once one side is a String, + joins text.",
        explain: "1 + 2 is 3 (numbers), then \"3\" turns everything after it into text. Brackets force the numeric sum first." },
    { id: "jv-p-string-equals", lang: "java", code: java("String a = \"SAVE10\";\nString b = new String(\"SAVE10\");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));\nSystem.out.println(\"save10\".equalsIgnoreCase(a));"),
        output: "false\ntrue\ntrue", hint: "== compares whether two references point to the same object.",
        explain: "new String creates a different object, so == is false; equals compares the characters. Always compare strings with equals." },
    { id: "jv-p-boundary", lang: "java", code: java("int[] totals = {500, 999, 1000};\nfor (int t : totals) {\n    int fee = t > 999 ? 0 : 49;\n    System.out.println(t + \" -> \" + fee);\n}"),
        output: "500 -> 49\n999 -> 49\n1000 -> 0", hint: "The ternary operator: condition ? valueIfTrue : valueIfFalse.",
        explain: "Only totals greater than 999 ship free; 999 still pays ₹49." },
    { id: "jv-p-array-loop", lang: "java", code: java("int[] prices = {499, 1299, 349};\nint total = 0;\nfor (int i = 0; i < prices.length; i++) {\n    total += prices[i];\n}\nSystem.out.println(total);\nSystem.out.println(prices[prices.length - 1]);"),
        output: "2147\n349", hint: "Indexes run from 0 to length − 1.",
        explain: "The loop adds all three prices; the last element is at index length − 1." },
    { id: "jv-p-overload", lang: "java", code: java("System.out.println(area(3));\nSystem.out.println(area(2.0, 1.5));", "static int area(int side) {\n    return side * side;\n}\n\nstatic double area(double width, double height) {\n    return width * height;\n}"),
        output: "9\n3.0", hint: "Java picks the method whose parameters match the arguments.",
        explain: "Overloading: same name, different parameter lists. A double result always prints with a decimal point." },
    { id: "jv-p-pass-by-value", lang: "java", code: java("int x = 5;\nbump(x);\nint[] box = {5};\nbumpFirst(box);\nSystem.out.println(x);\nSystem.out.println(box[0]);", "static void bump(int n) {\n    n = n + 1;\n}\n\nstatic void bumpFirst(int[] a) {\n    a[0] = a[0] + 1;\n}"),
        output: "5\n6", hint: "Java passes copies of values; for an array, the copied value is a reference to the same array.",
        explain: "bump changes its own copy of 5. bumpFirst receives a copy of the reference and changes the shared array." },
    { id: "jv-p-class", lang: "java", code: java("Product lamp = new Product(\"Lamp\", 3);\nSystem.out.println(lamp.sell(2));\nSystem.out.println(lamp.sell(2));\nSystem.out.println(lamp.getStock());", "static class Product {\n    private final String name;\n    private int stock;\n\n    Product(String name, int stock) {\n        this.name = name;\n        this.stock = stock;\n    }\n\n    boolean sell(int qty) {\n        if (qty > stock) return false;\n        stock -= qty;\n        return true;\n    }\n\n    int getStock() {\n        return stock;\n    }\n}"),
        output: "true\nfalse\n1", hint: "The second sale asks for more than is left.",
        explain: "The constructor sets the fields; sell checks the private stock before changing it (encapsulation), so the second call refuses and stock stays 1." },
    { id: "jv-p-polymorphism", lang: "java", code: java("Payment[] payments = { new Upi(), new Card() };\nfor (Payment p : payments) {\n    System.out.println(p.describe(1000));\n}", "static abstract class Payment {\n    abstract double fee(double amount);\n\n    String describe(double amount) {\n        return getClass().getSimpleName() + \" fee: \" + fee(amount);\n    }\n}\n\nstatic class Upi extends Payment {\n    double fee(double amount) { return 0; }\n}\n\nstatic class Card extends Payment {\n    double fee(double amount) { return amount * 0.02; }\n}"),
        output: "Upi fee: 0.0\nCard fee: 20.0", hint: "describe calls fee, and the object's actual class decides which fee runs.",
        explain: "Polymorphism: the same call picks the subclass's override at run time. A double prints as 0.0 and 20.0." },
    { id: "jv-p-arraylist", lang: "java", code: java("List<String> cart = new ArrayList<>();\ncart.add(\"Lamp\");\ncart.add(\"Mug\");\ncart.add(\"Lamp\");\ncart.remove(\"Lamp\");\nSystem.out.println(cart);\nSystem.out.println(cart.size());", "", "import java.util.ArrayList;\nimport java.util.List;"),
        output: "[Mug, Lamp]\n2", hint: "remove(Object) removes only the first match.",
        explain: "Lists keep order and allow duplicates; remove(\"Lamp\") deletes the first occurrence only." },
    { id: "jv-p-map", lang: "java", code: java("Map<String, Integer> counts = new TreeMap<>();\nfor (String city : new String[] {\"Pune\", \"Delhi\", \"Pune\"}) {\n    counts.merge(city, 1, Integer::sum);\n}\nSystem.out.println(counts);\nSystem.out.println(counts.getOrDefault(\"Mumbai\", 0));", "", "import java.util.Map;\nimport java.util.TreeMap;"),
        output: "{Delhi=1, Pune=2}\n0", hint: "A TreeMap keeps its keys sorted.",
        explain: "merge adds 1 to an existing count or starts it at 1; TreeMap prints keys in order; getOrDefault avoids null for missing keys." },
    { id: "jv-p-exceptions", lang: "java", code: java("try {\n    int qty = Integer.parseInt(\"2.5\");\n    System.out.println(\"qty \" + qty);\n} catch (NumberFormatException e) {\n    System.out.println(\"not a whole number\");\n} finally {\n    System.out.println(\"checked\");\n}"),
        output: "not a whole number\nchecked", hint: "parseInt accepts only whole numbers; finally always runs.",
        explain: "The exception skips the rest of the try block, the matching catch runs, and finally runs either way." },
    { id: "jv-p-null", lang: "java", code: java("String coupon = null;\nSystem.out.println(\"SAVE10\".equals(coupon));\ntry {\n    System.out.println(coupon.equals(\"SAVE10\"));\n} catch (NullPointerException e) {\n    System.out.println(\"NullPointerException\");\n}"),
        output: "false\nNullPointerException", hint: "Calling a method on null fails.",
        explain: "Putting the known string first (\"SAVE10\".equals(x)) is null-safe; calling a method on a null reference throws NullPointerException." },
    { id: "jv-p-streams", lang: "java", code: java("List<Integer> prices = List.of(499, 1299, 349, 1799);\nint total = prices.stream().filter(p -> p > 400).mapToInt(Integer::intValue).sum();\nSystem.out.println(total);\nSystem.out.println(prices.stream().map(p -> p / 100).toList());", "", "import java.util.List;"),
        output: "3597\n[4, 12, 3, 17]", hint: "filter keeps prices above 400; p / 100 is integer division.",
        explain: "Streams describe a pipeline: filter, then transform, then a terminal operation such as sum or toList." },
    { id: "py-p-slicing", lang: "python", code: "s = \"ShopLite\"\nprint(s[0:4])\nprint(s[-4:])\nprint(s[::-1])\nprint(len(s))",
        output: "Shop\nLite\netiLpohS\n8", hint: "s[start:end] stops before end; negative indexes count from the end; a step of −1 reverses.",
        explain: "Slices copy part of a sequence. s[::-1] is the usual way to reverse a string." },
    { id: "py-p-division", lang: "python", code: "print(7 // 2, 7 % 2, 7 / 2)\nprint(-7 // 2)\nprint(round(2.5), round(3.5))",
        output: "3 1 3.5\n-4\n2 4", hint: "// rounds down (towards minus infinity); round() rounds halves to the even neighbour.",
        explain: "Floor division of −7 by 2 gives −4. Python's round uses banker's rounding: 2.5 → 2 and 3.5 → 4." },
    { id: "py-p-mutable-default", lang: "python", code: "def add(item, bag=[]):\n    bag.append(item)\n    return bag\n\nprint(add(\"lamp\"))\nprint(add(\"mug\"))\nprint(add(\"pen\", []))",
        output: "['lamp']\n['lamp', 'mug']\n['pen']", hint: "The default list is created once, when the function is defined.",
        explain: "Mutable defaults are shared between calls. Use bag=None and create a new list inside the function." },
    { id: "py-p-scope", lang: "python", code: "total = 10\n\ndef add_tax(amount):\n    total = amount * 1.18\n    return round(total, 2)\n\nprint(add_tax(100))\nprint(total)",
        output: "118.0\n10", hint: "Assigning inside a function creates a local variable.",
        explain: "The function's total is local, so the global total stays 10." }
]);

/** compare a learner's typed output with the expected output, ignoring trailing spaces and a final newline */
export const normaliseOutput = (text) => String(text ?? "").replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
export const checkPrediction = (exercise, text) => normaliseOutput(text) === normaliseOutput(exercise.output);
