import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ_DATA } from '../data/faq';

export const FAQSection: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section id="faq" className="w-full pt-8 pb-4 border-t border-slate-200 space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pertanyaan Umum (FAQ)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Jawaban atas pertanyaan seputar penggunaan Word Counter Indonesia.
        </p>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {FAQ_DATA.map((item, index) => {
          const isOpen = openIndexes.includes(index);
          return (
            <div key={item.question} className="py-3">
              <button
                type="button"
                onClick={() => toggleIndex(index)}
                className="w-full flex items-center justify-between gap-4 text-left py-1 hover:text-[#fe4c6f] transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-slate-800 text-sm sm:text-base">
                  {item.question}
                </span>
                <span className="text-slate-400 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="pt-2 pb-1 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
