import { useEffect, useRef } from 'react';
import { getSessionRefreshDelay, isSessionExpired, shouldAttemptRefresh } from '../utils/auth';

export default function useSessionRefresh({ session, onRefresh, onLogout }) {
  const callbacksRef = useRef({ onRefresh, onLogout });

  useEffect(() => {
    callbacksRef.current = { onRefresh, onLogout };
  }, [onRefresh, onLogout]);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    if (isSessionExpired(session) && !shouldAttemptRefresh(session)) {
      callbacksRef.current.onLogout();
      return undefined;
    }

    const delay = getSessionRefreshDelay(session);

    if (delay === null) {
      return undefined;
    }

    let active = true;
    const timeoutId = window.setTimeout(async () => {
      if (!active) {
        return;
      }

      const refreshed = await callbacksRef.current.onRefresh();

      if (!refreshed) {
        callbacksRef.current.onLogout();
      }
    }, delay);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [session]);
}
