import type { OperatorId } from "./operators";
import { getOperatorById } from "./operators";

export type Step = {
  a: bigint;
  op: OperatorId;
  emoji?: string;
  b: bigint;
  result: bigint;
  log: string;
};

export type Evaluation = {
  steps: Step[];
  final: bigint;
};

export function evaluateSequence(
  elements: number[],
  operators: { id: OperatorId; emoji?: string }[]
): Evaluation {
  if (elements.length !== operators.length + 1) {
    throw new Error("elements must be one longer than operators");
  }
  let current = BigInt(elements[0]);
  const steps: Step[] = [];
  for (let i = 0; i < operators.length; i += 1) {
    const op = getOperatorById(operators[i].id);
    const b = BigInt(elements[i + 1]);
    const result = op.apply(current, b);
    const displayEmoji = operators[i].emoji ?? "?";
    const log = `${current.toString()} ${displayEmoji} ${b.toString()} = ${result.toString()}`;
    steps.push({ a: current, op: op.id, emoji: operators[i].emoji, b, result, log });
    current = result;
  }
  return { steps, final: current };
}

export function evaluatePartialSequence(
  elements: number[],
  operators: { id: OperatorId; emoji?: string }[]
): Evaluation | undefined {
  if (elements.length === 0) return undefined;
  const maxSteps = Math.min(operators.length, Math.max(0, elements.length - 1));
  let current = BigInt(elements[0]);
  const steps: Step[] = [];
  for (let i = 0; i < maxSteps; i += 1) {
    const op = getOperatorById(operators[i].id);
    const b = BigInt(elements[i + 1]);
    const result = op.apply(current, b);
    const displayEmoji = operators[i].emoji ?? "?";
    const log = `${current.toString()} ${displayEmoji} ${b.toString()} = ${result.toString()}`;
    steps.push({ a: current, op: op.id, emoji: operators[i].emoji, b, result, log });
    current = result;
  }
  return { steps, final: current };
}


