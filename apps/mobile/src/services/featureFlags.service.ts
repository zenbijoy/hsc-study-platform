export interface FeatureFlags {
  smartDarkPdf: boolean;
  offlineBooks: boolean;
  aiExplanation: boolean;
  semanticSearch: boolean;
  dailyRevision: boolean;
  studyAnalytics: boolean;
  advancedReader: boolean;
}

const defaultFlags: FeatureFlags = {
  smartDarkPdf: true,
  offlineBooks: true,
  aiExplanation: true,
  semanticSearch: false,
  dailyRevision: true,
  studyAnalytics: true,
  advancedReader: true,
};

let cachedFlags: FeatureFlags = { ...defaultFlags };

export function getFeatureFlag<K extends keyof FeatureFlags>(key: K): boolean {
  return cachedFlags[key] ?? defaultFlags[key];
}

export function getAllFeatureFlags(): FeatureFlags {
  return { ...cachedFlags };
}

export function updateFeatureFlags(flags: Partial<FeatureFlags>): void {
  cachedFlags = { ...cachedFlags, ...flags };
}
