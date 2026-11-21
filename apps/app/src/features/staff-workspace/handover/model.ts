export interface CountLine {
  id: string;
  label: string;
  expected: number;
  scale: 1 | 100;
}
interface Signature {
  actor: string;
  counts: Record<string, number>;
  note: string;
  at: string;
}
export interface Handover {
  lines: CountLine[];
  outgoing: Signature;
  incoming?: Signature;
  status: 'AWAITING_INCOMING_SIGNOFF' | 'SEALED_PENDING_SYNC';
  result?: 'BALANCED' | 'UNBALANCED';
}
function signature(
  lines: CountLine[],
  inputs: Record<string, string>,
  note: string,
  actor: string
): Signature {
  if (!actor.trim() || actor.length > 100 || note.length > 500 || !lines.length)
    throw new Error('Invalid handover evidence.');
  if (
    new Set(lines.map((line) => line.id)).size !== lines.length ||
    lines.some(
      (line) => typeof line.label !== 'string' || !line.label.trim() || line.label.length > 120
    )
  )
    throw new Error('Invalid count labels.');
  const counts: Record<string, number> = {};
  for (const line of lines) {
    if (
      !/^[a-z0-9][a-z0-9_-]*$/i.test(line.id) ||
      ![1, 100].includes(line.scale) ||
      !Number.isSafeInteger(line.expected)
    )
      throw new Error('Invalid count context.');
    const input = inputs[line.id] ?? '';
    if (!(line.scale === 100 ? /^\d{1,10}(\.\d{1,2})?$/ : /^\d{1,10}$/).test(input))
      throw new Error(`Enter a valid physical count for ${line.label}.`);
    const [whole, decimal = ''] = input.split('.');
    const value =
      line.scale === 100 ? Number(whole) * 100 + Number(decimal.padEnd(2, '0')) : Number(whole);
    if (!Number.isSafeInteger(value) || value < 0)
      throw new Error('Count is outside the supported range.');
    counts[line.id] = value;
  }
  if (lines.some((line) => counts[line.id] !== line.expected) && !note.trim())
    throw new Error('Explain the variance before signing the handover.');
  return { actor, counts, note: note.trim(), at: new Date().toISOString() };
}
export function submitOutgoing(
  lines: CountLine[],
  inputs: Record<string, string>,
  note: string,
  actor: string
): Handover {
  return {
    lines: lines.map((line) => ({ ...line })),
    outgoing: signature(lines, inputs, note, actor),
    status: 'AWAITING_INCOMING_SIGNOFF',
  };
}
export function signIncoming(
  record: Handover,
  inputs: Record<string, string>,
  note: string,
  actor: string,
  current: CountLine[]
): Handover {
  if (record.status !== 'AWAITING_INCOMING_SIGNOFF')
    throw new Error('This handover has already been signed.');
  if (record.outgoing.actor === actor)
    throw new Error('The incoming lead must be a different person.');
  if (JSON.stringify(record.lines) !== JSON.stringify(current))
    throw new Error(
      'The underlying movements changed. Preserve this evidence and resolve the handover conflict before continuing.'
    );
  const incoming = signature(record.lines, inputs, note, actor);
  if (
    record.lines.some((line) => incoming.counts[line.id] !== record.outgoing.counts[line.id]) &&
    !note.trim()
  )
    throw new Error('Explain the difference between the two independent counts.');
  const unbalanced = record.lines.some(
    (line) =>
      record.outgoing.counts[line.id] !== line.expected ||
      incoming.counts[line.id] !== line.expected
  );
  return {
    ...record,
    incoming,
    status: 'SEALED_PENDING_SYNC',
    result: unbalanced ? 'UNBALANCED' : 'BALANCED',
  };
}
export function parseHandover(raw: string): Handover | null {
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.lines) || value.lines.length > 100 || !value.outgoing)
      return null;
    const inputs = (sig: Signature) =>
      Object.fromEntries(
        value.lines.map((line: CountLine) => [line.id, String(sig.counts[line.id] / line.scale)])
      );
    let record = submitOutgoing(
      value.lines,
      inputs(value.outgoing),
      value.outgoing.note,
      value.outgoing.actor
    );
    if (!Number.isFinite(Date.parse(value.outgoing.at))) return null;
    record.outgoing.at = value.outgoing.at;
    if (value.incoming) {
      record = signIncoming(
        record,
        inputs(value.incoming),
        value.incoming.note,
        value.incoming.actor,
        value.lines
      );
      if (!Number.isFinite(Date.parse(value.incoming.at))) return null;
      record.incoming!.at = value.incoming.at;
    }
    if (record.status !== value.status || record.result !== value.result) return null;
    return record;
  } catch {
    return null;
  }
}
