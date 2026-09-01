export type BookAccessStatus =
  | 'available'
  | 'requires_entitlement'
  | 'unavailable'
  | 'coming_soon'
  | 'restricted';

export type LibraryViewMode = 'grid' | 'list';

export type LibrarySortOption =
  | 'recommended'
  | 'recently_added'
  | 'title_asc'
  | 'title_desc'
  | 'recently_read'
  | 'progress'
  | 'downloaded_first';

export interface LibraryFilters {
  subjectIds: string[];
  paperNumbers: number[];
  publishers: string[];
  downloadedOnly: boolean;
  inProgressOnly: boolean;
  updateAvailableOnly: boolean;
}

export interface LibraryBookViewModel {
  id: string;
  title: string;
  subtitle?: string;
  subjectId: string;
  subjectName: string;
  paperNumber?: number;
  publisher?: string;
  edition?: string;
  coverUrl?: string;
  totalPages: number;
  chapters: number;
  formulas: number;
  progress: number;
  lastPage: number;
  accessStatus: BookAccessStatus;
  isDownloaded: boolean;
  hasUpdate: boolean;
  isNew: boolean;
  publishedAt?: string;
}

export interface LibraryScreenViewModel {
  books: LibraryBookViewModel[];
  totalCount: number;
  downloadedCount: number;
  activeFilterCount: number;
  isFiltered: boolean;
  availablePublishers: string[];
}
