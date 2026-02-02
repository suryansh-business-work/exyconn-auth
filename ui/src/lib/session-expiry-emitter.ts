/**
 * Session Expiry Event Emitter
 *
 * This module provides a way to communicate session expiry events
 * from the API interceptor (outside React) to the React context.
 */

type SessionExpiryListener = () => void;

class SessionExpiryEmitter {
  private listeners: Set<SessionExpiryListener> = new Set();
  private isBlocked = false;

  subscribe(listener: SessionExpiryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(): void {
    // Emit only once
    if (!this.isBlocked) {
      this.isBlocked = true;
      this.listeners.forEach((listener) => listener());
    }
  }

  reset(): void {
    this.isBlocked = false;
  }

  isApiBlocked(): boolean {
    return this.isBlocked;
  }
}

export const sessionExpiryEmitter = new SessionExpiryEmitter();
