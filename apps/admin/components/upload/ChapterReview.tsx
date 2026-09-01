"use client";

import { useEffect, useState } from 'react';
import { Bookmark, Check, Edit2, Plus, Trash2 } from 'lucide-react';
import { ChapterCandidate } from '@/lib/api';

export function ChapterReview({
  initialChapters = [],
  pageCount,
  onChange,
}: {
  initialChapters?: ChapterCandidate[];
  pageCount?: number;
  onChange: (chapters: ChapterCandidate[]) => void;
}) {
  const [chapters, setChapters] = useState<ChapterCandidate[]>(initialChapters);

  useEffect(() => {
    onChange(chapters);
  }, [chapters, onChange]);

  const updateChapter = (index: number, field: keyof ChapterCandidate, value: any) => {
    const next = [...chapters];
    next[index] = { ...next[index], [field]: value };
    setChapters(next);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const addChapter = () => {
    const lastPage = chapters.length > 0 ? (chapters[chapters.length - 1].end_page || chapters[chapters.length - 1].start_page + 20) : 1;
    setChapters([
      ...chapters,
      {
        number: chapters.length + 1,
        title: `Chapter ${chapters.length + 1}`,
        start_page: lastPage + 1,
        end_page: (pageCount && lastPage + 30 <= pageCount) ? lastPage + 30 : pageCount || lastPage + 30,
        confidence: 1.0,
        source: 'manual',
      },
    ]);
  };

  return (
    <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-mint" />
          <h4 className="text-base font-bold text-white">
            Chapter Map & Page Ranges ({chapters.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={addChapter}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Chapter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-white/40 font-semibold uppercase tracking-wider">
              <th className="pb-2 pl-2">#</th>
              <th className="pb-2">Title</th>
              <th className="pb-2 w-20">Start</th>
              <th className="pb-2 w-20">End</th>
              <th className="pb-2 w-24">Source</th>
              <th className="pb-2 w-12 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white/80">
            {chapters.map((ch, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="py-2.5 pl-2 font-mono text-white/40">{ch.number}</td>
                <td className="py-2.5 pr-3">
                  <input
                    type="text"
                    value={ch.title}
                    onChange={(e) => updateChapter(idx, 'title', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-white/20 focus:border-mint px-1 py-0.5 text-xs text-white focus:outline-none"
                  />
                </td>
                <td className="py-2.5 pr-2">
                  <input
                    type="number"
                    value={ch.start_page}
                    onChange={(e) => updateChapter(idx, 'start_page', Number(e.target.value))}
                    className="w-16 bg-[#121824] border border-white/10 rounded px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-mint"
                  />
                </td>
                <td className="py-2.5 pr-2">
                  <input
                    type="number"
                    value={ch.end_page || ''}
                    onChange={(e) => updateChapter(idx, 'end_page', Number(e.target.value))}
                    className="w-16 bg-[#121824] border border-white/10 rounded px-2 py-1 text-center text-xs text-white focus:outline-none focus:border-mint"
                  />
                </td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-white/60">
                    {ch.source} ({Math.round(ch.confidence * 100)}%)
                  </span>
                </td>
                <td className="py-2.5 text-right pr-2">
                  <button
                    type="button"
                    onClick={() => removeChapter(idx)}
                    className="p-1 text-white/30 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
