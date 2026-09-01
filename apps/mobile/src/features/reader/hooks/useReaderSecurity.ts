import { useMemo, useEffect, useRef } from 'react';
import { ProtectedReaderSession } from '../security/protectedReaderSession';
import type { ReaderLaunchResolution } from '../types/reader.types';

export function useReaderSecurity(bookId: string, resolution: ReaderLaunchResolution) {
  const sessionRef = useRef<ProtectedReaderSession | null>(null);

  const sessionId = useMemo(() => {
    return `S:${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  }, []);

  useEffect(() => {
    const session = new ProtectedReaderSession(`reader-${bookId}`);
    sessionRef.current = session;

    return () => {
      session.destroy();
      sessionRef.current = null;
    };
  }, [bookId]);

  return {
    sessionId,
    sessionRef,
  };
}
