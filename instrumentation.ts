export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { z } = await import('zod');
    z.object({
      DATA_REGION: z.enum(['UAE', 'EGYPT', 'LOCAL']).default('UAE'),
      AI_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
    }).parse(process.env);
  }
}
export async function onRequestError(error: unknown, request: { path: string }) {
  console.error(
    JSON.stringify({
      event: 'request_failure',
      path: request.path.split('?')[0],
      type: error instanceof Error ? error.name : 'unknown',
    }),
  );
}
