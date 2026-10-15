import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "basic-calculator",
  title: "Basic Calculator (Shunting-yard)",
  category: "stacks-queues",
  subcategory: "Stack problems",
  difficulty: "advanced",
  order: 4,
  summary: "Dijkstra's shunting-yard turns infix into postfix with an operator stack that respects precedence and parentheses; a second stack then evaluates it.",
  keywords: ["basic calculator", "shunting yard", "infix to postfix", "operator precedence", "expression evaluation", "parser"],
  problems: [
    { id: 224, title: "Basic Calculator", difficulty: "Hard", slug: "basic-calculator", note: "+, − and parentheses (with unary minus); a sign stack is the usual shortcut." },
    { id: 227, title: "Basic Calculator II", difficulty: "Medium", slug: "basic-calculator-ii", note: "+ − * / without parentheses: precedence handled exactly as on this page." },
    { id: 772, title: "Basic Calculator III", difficulty: "Hard", slug: "basic-calculator-iii", note: "All four operators and parentheses — the full shunting-yard." },
    { id: 150, title: "Evaluate Reverse Polish Notation", difficulty: "Medium", slug: "evaluate-reverse-polish-notation", note: "The second half of this page on its own." },
  ],
};

export default meta;
