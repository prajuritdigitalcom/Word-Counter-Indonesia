import React from 'react';
import {
  FileText,
  Search,
  Eye,
  Link2,
  Eraser,
  Code,
  Wrench,
  ArrowRight,
} from 'lucide-react';
import { OTHER_TOOLS } from '../data/tools';

export const OtherToolsSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText;
      case 'Search':
        return Search;
      case 'Eye':
        return Eye;
      case 'Link2':
        return Link2;
      case 'Eraser':
        return Eraser;
      case 'Code':
        return Code;
      default:
        return Wrench;
    }
  };

  return (
    <section id="tools" className="w-full pt-8 pb-4 border-t border-slate-200 space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Tools Gratis Lainnya
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Kumpulan perkakas praktis untuk mempermudah pekerjaan konten dan SEO.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OTHER_TOOLS.map((tool) => {
          const Icon = getIcon(tool.iconName);
          const isActive = tool.status === 'active';

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-colors ${
                isActive
                  ? 'bg-white border-slate-300'
                  : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <h3 className="font-semibold text-sm text-slate-800">{tool.name}</h3>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-bold text-[#fe4c6f]">
                      Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">
                      Segera
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{tool.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
