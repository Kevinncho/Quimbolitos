const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.sessionStorage;
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

function migrateValue(key: string): string | null {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();

  if (!sessionStorage || !localStorage) {
    return null;
  }

  const sessionValue = sessionStorage.getItem(key);
  if (sessionValue) {
    return sessionValue;
  }

  const localValue = localStorage.getItem(key);
  if (!localValue) {
    return null;
  }

  sessionStorage.setItem(key, localValue);
  localStorage.removeItem(key);
  return localValue;
}

export function getStoredToken(): string | null {
  return migrateValue(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  sessionStorage?.setItem(TOKEN_KEY, token);
  localStorage?.removeItem(TOKEN_KEY);
}

export function clearStoredToken(): void {
  getSessionStorage()?.removeItem(TOKEN_KEY);
  getLocalStorage()?.removeItem(TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return migrateValue(USER_KEY);
}

export function setStoredUser(user: string): void {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();
  sessionStorage?.setItem(USER_KEY, user);
  localStorage?.removeItem(USER_KEY);
}

export function clearStoredUser(): void {
  getSessionStorage()?.removeItem(USER_KEY);
  getLocalStorage()?.removeItem(USER_KEY);
}
