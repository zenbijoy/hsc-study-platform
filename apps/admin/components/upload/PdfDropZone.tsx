"use client";

import { useRef, useState } from 'react';
import { FileUp, UploadCloud } from 'lucide-react';

export function PdfDropZone({
  onFilesSelected,
  disabled,
}: {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const valid = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      );
      if (valid.length > 0) onFilesSelected(valid);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const valid = Array.from(e.target.files).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      );
      if (valid.length > 0) onFilesSelected(valid);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
        isDragOver
          ? 'border-mint bg-mint/5 scale-[1.01]'
          : 'border-white/10 hover:border-white/20 bg-[#0B0F17]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-mint/10 flex items-center justify-center mb-4 text-mint">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          Drop PDF textbooks & guidebooks here
        </h3>
        <p className="text-sm text-white/50 max-w-md mb-4">
          Supports large PDFs (300 MB – 2 GB) with resumable streaming directly into the Content Factory warehouse.
        </p>
        <button
          type="button"
          disabled={disabled}
          className="px-6 py-2.5 rounded-xl bg-mint text-ink font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        >
          <FileUp className="w-4 h-4" />
          Choose PDF Files
        </button>
      </div>
    </div>
  );
}
