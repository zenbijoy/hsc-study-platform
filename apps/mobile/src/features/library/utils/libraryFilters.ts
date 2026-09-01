import { LibraryBookViewModel, LibraryFilters } from '../types/library.types';

export const INITIAL_LIBRARY_FILTERS: LibraryFilters = {
  subjectIds: [],
  paperNumbers: [],
  publishers: [],
  downloadedOnly: false,
  inProgressOnly: false,
  updateAvailableOnly: false,
};

export function matchesLibraryFilters(
  book: LibraryBookViewModel,
  filters: LibraryFilters
): boolean {
  // 1. Subject Filter (Empty array = no restriction)
  if (filters.subjectIds.length > 0 && !filters.subjectIds.includes(book.subjectId)) {
    return false;
  }

  // 2. Paper Filter
  if (
    filters.paperNumbers.length > 0 &&
    book.paperNumber !== undefined &&
    !filters.paperNumbers.includes(book.paperNumber)
  ) {
    return false;
  }

  // 3. Publisher Filter
  if (
    filters.publishers.length > 0 &&
    book.publisher &&
    !filters.publishers.includes(book.publisher)
  ) {
    return false;
  }

  // 4. Downloaded Only Filter
  if (filters.downloadedOnly && !book.isDownloaded) {
    return false;
  }

  // 5. In Progress Only Filter
  if (filters.inProgressOnly && (!book.progress || book.progress <= 0 || book.progress >= 100)) {
    return false;
  }

  // 6. Update Available Only
  if (filters.updateAvailableOnly && !book.hasUpdate) {
    return false;
  }

  return true;
}

export function countActiveFilters(filters: LibraryFilters): number {
  let count = 0;
  count += filters.subjectIds.length;
  count += filters.paperNumbers.length;
  count += filters.publishers.length;
  if (filters.downloadedOnly) count += 1;
  if (filters.inProgressOnly) count += 1;
  if (filters.updateAvailableOnly) count += 1;
  return count;
}
