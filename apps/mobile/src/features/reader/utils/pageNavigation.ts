import type { ReaderLocationHistoryItem } from '../types/reader.types';

/**
 * Clamps a requested page number between 1 and totalPages.
 */
export function clampPage(requestedPage: number, totalPages: number): number {
  if (Number.isNaN(requestedPage)) return 1;
  const max = Math.max(1, totalPages);
  return Math.max(1, Math.min(requestedPage, max));
}

/**
 * Manages an in-memory navigation history stack for back-location jumps.
 */
export class ReaderLocationHistory {
  private stack: ReaderLocationHistoryItem[] = [];
  private maxDepth: number;

  constructor(maxDepth: number = 20) {
    this.maxDepth = maxDepth;
  }

  push(item: ReaderLocationHistoryItem): void {
    // Avoid duplicate pushes to the same page
    const last = this.peek();
    if (last && last.pageNumber === item.pageNumber) return;

    this.stack.push(item);
    if (this.stack.length > this.maxDepth) {
      this.stack.shift();
    }
  }

  pop(): ReaderLocationHistoryItem | null {
    return this.stack.pop() ?? null;
  }

  peek(): ReaderLocationHistoryItem | null {
    return this.stack[this.stack.length - 1] ?? null;
  }

  canGoBack(): boolean {
    return this.stack.length > 0;
  }

  clear(): void {
    this.stack = [];
  }
}
