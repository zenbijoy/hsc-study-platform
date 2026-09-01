"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Layers } from 'lucide-react';

export function MetadataEditor({
  initialTitle,
  initialSubject,
  initialPaper,
  initialPublisher,
  pageCount,
  onChange,
}: {
  initialTitle: string;
  initialSubject: string;
  initialPaper: number;
  initialPublisher: string;
  pageCount?: number;
  onChange: (meta: {
    title: string;
    subject_id: string;
    paper_number: number;
  }) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [subjectId, setSubjectId] = useState(initialSubject);
  const [paperNumber, setPaperNumber] = useState(initialPaper);

  useEffect(() => {
    onChange({ title, subject_id: subjectId, paper_number: paperNumber });
  }, [title, subjectId, paperNumber, onChange]);

  return (
    <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-mint" />
        <h4 className="text-base font-bold text-white">Book Metadata</h4>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1.5">
            Book Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#121824] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mint"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-mint"
            >
              <option value="physics">Physics (পদার্থবিজ্ঞান)</option>
              <option value="chemistry">Chemistry (রসায়ন)</option>
              <option value="mathematics">Higher Math (উচ্চতর গণিত)</option>
              <option value="biology">Biology (জীববিজ্ঞান)</option>
              <option value="ict">ICT (তথ্য ও প্রযুক্তি)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">
              Paper
            </label>
            <select
              value={paperNumber}
              onChange={(e) => setPaperNumber(Number(e.target.value))}
              className="w-full bg-[#121824] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-mint"
            >
              <option value={1}>1st Paper (১ম পত্র)</option>
              <option value={2}>2nd Paper (২য় পত্র)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-white/50">
          <span>Publisher: {initialPublisher}</span>
          <span>Total Pages: {pageCount || '—'}</span>
        </div>
      </div>
    </div>
  );
}
