export interface AppVersionInfo {
  currentVersion: string;
  minSupportedVersion: string;
  latestVersion: string;
  isUpdateRequired: boolean;
  isUpdateAvailable: boolean;
}

export function parseSemver(versionStr: string): [number, number, number] {
  const parts = versionStr.split('.').map((p) => parseInt(p, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function isVersionOlder(current: string, target: string): boolean {
  const [cMaj, cMin, cPat] = parseSemver(current);
  const [tMaj, tMin, tPat] = parseSemver(target);

  if (cMaj < tMaj) return true;
  if (cMaj > tMaj) return false;
  if (cMin < tMin) return true;
  if (cMin > tMin) return false;
  return cPat < tPat;
}

export function evaluateAppVersion(
  currentVersion: string,
  minSupportedVersion: string = '0.1.0',
  latestVersion: string = '0.1.0'
): AppVersionInfo {
  const isUpdateRequired = isVersionOlder(currentVersion, minSupportedVersion);
  const isUpdateAvailable = isVersionOlder(currentVersion, latestVersion);

  return {
    currentVersion,
    minSupportedVersion,
    latestVersion,
    isUpdateRequired,
    isUpdateAvailable,
  };
}
