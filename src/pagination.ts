import type { Page } from "./types.js";
export async function* paginate<T>(fetchPage: (cursor?: string) => Promise<Page<T>>): AsyncGenerator<T> { let cursor: string | undefined; do { const page = await fetchPage(cursor); for (const item of page.data) yield item; cursor = page.next_cursor ?? undefined; } while (cursor); }
export async function collect<T>(source: AsyncIterable<T>): Promise<T[]> { const items: T[] = []; for await (const item of source) items.push(item); return items; }
