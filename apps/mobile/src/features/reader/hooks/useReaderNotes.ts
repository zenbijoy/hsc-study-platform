import { useState, useCallback } from 'react';
import { getNotesForBook, saveNoteForBook, deleteNoteById } from '../data/notes.repository';
import type { ReaderNote } from '../types/reader.types';

export function useReaderNotes(bookId: string, versionId?: string) {
  const [notes, setNotes] = useState<ReaderNote[]>(() => getNotesForBook(bookId));

  const getNotesForPage = useCallback(
    (pageNumber: number) => {
      return notes.filter((n) => n.pageNumber === pageNumber);
    },
    [notes]
  );

  const hasNoteOnPage = useCallback(
    (pageNumber: number) => {
      return notes.some((n) => n.pageNumber === pageNumber);
    },
    [notes]
  );

  const addOrUpdateNote = useCallback(
    (pageNumber: number, text: string, noteId?: string, chapterTitle?: string, chapterId?: string) => {
      const now = Date.now();
      const note: ReaderNote = {
        id: noteId || `note-${now}-${Math.random().toString(16).slice(2, 6)}`,
        bookId,
        versionId,
        pageNumber,
        chapterId,
        chapterTitle,
        text,
        createdAt: now,
        updatedAt: now,
      };
      const updated = saveNoteForBook(note);
      setNotes(updated);
    },
    [bookId, versionId]
  );

  const removeNote = useCallback(
    (id: string) => {
      const updated = deleteNoteById(bookId, id);
      setNotes(updated);
    },
    [bookId]
  );

  return {
    notes,
    getNotesForPage,
    hasNoteOnPage,
    addOrUpdateNote,
    removeNote,
  };
}
