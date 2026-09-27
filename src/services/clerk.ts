export const CLERK_STORAGE_KEY = 'intervexa_clerk_publishable_key';

export function isClerkKeyValid(key?: string | null): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return (trimmed.startsWith('pk_test_') || trimmed.startsWith('pk_live_')) && trimmed.length >= 25;
}

export function getClerkPublishableKey(): string {
  const envKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
  if (isClerkKeyValid(envKey)) {
    return envKey;
  }

  const storedKey = (typeof window !== 'undefined' ? localStorage.getItem(CLERK_STORAGE_KEY) : null) || '';
  if (isClerkKeyValid(storedKey)) {
    return storedKey.trim();
  }

  return '';
}

export function setClerkPublishableKey(key: string): void {
  if (typeof window !== 'undefined') {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(CLERK_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(CLERK_STORAGE_KEY);
    }
  }
}

export function clearClerkPublishableKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CLERK_STORAGE_KEY);
  }
}
