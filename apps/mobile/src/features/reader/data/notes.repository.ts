import type { ReaderNote } from '../types/reader.types';

const inMemoryNotes = new Map<string, ReaderNote[]>();

export function getNotesForBook(bookId: string): ReaderNote[] {
  return inMemoryNotes.get(bookId) || [];
}

export function getNotesForPage(bookId: string, pageNumber: number): ReaderNote[] {
  const notes = getNotesForBook(bookId);
  return notes.filter((n) => n.pageNumber === pageNumber);
}

export function saveNoteForBook(note: ReaderNote): ReaderNote[] {
  const list = getNotesForBook(note.bookId);
  const existingIdx = list.findIndex((n) => n.id === note.id);
  let updated: ReaderNote[];

  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = { ...note, updatedAt: Date.now() };
  } else {
    updated = [...list, note].sort((a, b) => a.pageNumber - b.pageNumber);
  }

  inMemoryNotes.set(note.bookId, updated);
  return updated;
}

export function deleteNoteById(bookId: string, noteId: string): ReaderNote[] {
  const list = getNotesForBook(bookId);
  const updated = list.filter((n) => n.id !== noteId);
  inMemoryNotes.set(bookId, updated);
  return updated;
}
