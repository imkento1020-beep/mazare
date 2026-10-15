export const POST_ID_QUERY_CHUNK = 80;

export function chunkPostIds(ids: string[]): string[][] {
  const unique = [...new Set(ids.filter(Boolean))];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += POST_ID_QUERY_CHUNK) {
    chunks.push(unique.slice(i, i + POST_ID_QUERY_CHUNK));
  }
  return chunks;
}
