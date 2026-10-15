import type { AlgorithmMeta } from "../../../engine/types";

const meta: AlgorithmMeta = {
  id: "eval-rpn",
  title: "Evaluate Reverse Polish Notation",
  category: "stacks-queues",
  subcategory: "Stack problems",
  difficulty: "core",
  order: 2,
  summary: "Postfix expressions need no parentheses: push numbers, and let each operator pop its two operands and push the result.",
  keywords: ["reverse polish notation", "RPN", "postfix", "evaluate expression", "operand stack"],
  problems: [
    { id: 150, title: "Evaluate Reverse Polish Notation", difficulty: "Medium", slug: "evaluate-reverse-polish-notation", note: "Exactly this operand stack, with division truncating toward zero." },
    { id: 224, title: "Basic Calculator", difficulty: "Hard", slug: "basic-calculator", note: "Convert infix to postfix (shunting-yard), then evaluate it like this page." },
    { id: 1628, title: "Design an Expression Tree With Evaluate Function", difficulty: "Medium", slug: "design-an-expression-tree-with-evaluate-function", note: "Same stack walk over postfix tokens, but it builds tree nodes instead of numbers." },
  ],
};

export default meta;
