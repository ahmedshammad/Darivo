import { z } from 'zod';
import { embed } from './embedding';
export function embeddingSource() {
  return process.env.AI_PROVIDER === 'openai' && process.env.OPENAI_API_KEY
    ? `openai:${process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'}:64`
    : 'mock-hash-v1';
}
export async function embedText(text: string): Promise<number[]> {
  if (embeddingSource() === 'mock-hash-v1') return embed(text);
  const base = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
  const url = new URL(base);
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname))
    throw new Error('unsafe_provider_url');
  const response = await fetch(`${base.replace(/\/$/, '')}/embeddings`, {
    method: 'POST',
    signal: AbortSignal.timeout(30000),
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
      input: text,
      dimensions: 64,
    }),
  });
  if (!response.ok) throw new Error('embedding_provider_unavailable');
  const result = z
    .object({
      data: z.array(z.object({ embedding: z.array(z.number().finite()).length(64) })).min(1),
    })
    .parse(await response.json());
  return result.data[0].embedding;
}
