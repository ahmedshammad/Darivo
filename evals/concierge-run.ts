import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { emptyConciergeBrief, providerPlanSchema } from '../src/lib/concierge';
import { applyConciergeBriefPatch } from '../src/server/concierge/brief';
import { parseConciergeMessage } from '../src/server/concierge/mock-parser';

export type ParserEvalCase = {
  id: string;
  scope: 'parser';
  responseLanguage: 'en' | 'ar';
  turns: string[];
  checks: { path: string; equals?: unknown; includes?: unknown; excludes?: unknown }[];
  requiredCalls: string[];
  forbiddenCalls: string[];
  /** Execution-only assertions against returned records, not parsed intent. */
  resultPlaces?: ('palm' | 'saadiyat' | 'jebel-ali')[];
  forbiddenNoticeCodes?: string[];
};
export function readParserCases(): ParserEvalCase[] {
  return readFileSync(new URL('./concierge.jsonl', import.meta.url), 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
}
function atPath(value: unknown, path: string): unknown {
  for (const key of path.split('.')) {
    if (Array.isArray(value) && key !== 'length' && !/^\d+$/.test(key))
      value = value.find((row) => row?.id === key);
    else value = value != null ? (value as Record<string, unknown>)[key] : undefined;
  }
  return value;
}
export function runParserCase(test: ParserEvalCase): string[] {
  const failures: string[] = [];
  let brief = emptyConciergeBrief();
  let result: ReturnType<typeof parseConciergeMessage> | undefined;
  for (const [index, message] of test.turns.entries()) {
    try {
      result = parseConciergeMessage(message, brief, {
        responseLanguage: test.responseLanguage,
        now: '2026-10-22',
      });
      providerPlanSchema.parse(result.plan);
      const applied = applyConciergeBriefPatch(brief, result.plan.briefPatch!);
      if (!isDeepStrictEqual(applied, result.brief))
        failures.push(`turn ${index + 1}: provider patch does not reproduce semantic Brief`);
      brief = applied;
    } catch (error) {
      return [`turn ${index + 1}: ${String(error)}`];
    }
  }
  for (const check of test.checks) {
    const actual = atPath(result, check.path);
    if ('equals' in check && !isDeepStrictEqual(actual, check.equals))
      failures.push(
        `${check.path}: expected ${JSON.stringify(check.equals)}, got ${JSON.stringify(actual)}`,
      );
    const values = Array.isArray(actual)
      ? actual.map((item) =>
          typeof item === 'object' && item !== null && 'id' in item ? item.id : item,
        )
      : [];
    if ('includes' in check && !values.includes(check.includes))
      failures.push(
        `${check.path}: missing ${JSON.stringify(check.includes)} in ${JSON.stringify(values)}`,
      );
    if ('excludes' in check && values.includes(check.excludes))
      failures.push(`${check.path}: forbidden ${JSON.stringify(check.excludes)}`);
  }
  const names = result?.plan.calls.map((call) => call.name) ?? [];
  for (const name of test.requiredCalls)
    if (!names.includes(name as (typeof names)[number]))
      failures.push(`missing tool proposal ${name}`);
  for (const name of test.forbiddenCalls)
    if (names.includes(name as (typeof names)[number]))
      failures.push(`forbidden tool proposal ${name}`);
  return failures;
}
export function runParserEvals() {
  const cases = readParserCases();
  const failures = cases.flatMap((test) =>
    runParserCase(test).map((failure) => ({ id: test.id, failure })),
  );
  const report = {
    scope: 'deterministic-parser',
    cases: cases.length,
    distinctPhrases: new Set(cases.flatMap((test) => test.turns)).size,
    passed: cases.length - new Set(failures.map((f) => f.id)).size,
    failures,
    limitations: [
      'No database authorization or source-grounding execution is performed by this runner.',
      'Provider proposals are not proof that a write is authorized, an entity exists, or a fact is grounded.',
      'No browser, native Arabic reader, or real-provider certification.',
    ],
  };
  console.log(JSON.stringify(report, null, 2));
  return failures.length === 0;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = runParserEvals() ? 0 : 1;
