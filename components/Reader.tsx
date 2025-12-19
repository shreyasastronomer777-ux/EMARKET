import React, { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { generateBookContent } from '../services/geminiService';

interface ReaderProps {
  book: Book;
  onClose: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ book, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const text = await generateBookContent(book.title);
      setContent(text);
      setLoading(false);
    };
    loadContent();
  }, [book]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Reader Header */}
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
           <BookOpen className="text-indigo-600" size={24} />
           <div>
             <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">{book.title}</h2>
             <p className="text-xs text-slate-500 hidden sm:block">by {book.author}</p>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#faf9f6] relative">
        <div className="max-w-2xl mx-auto px-6 py-12 sm:px-10 sm:py-16 bg-white min-h-full shadow-sm">
           
           <div className="mb-12 text-center border-b border-slate-100 pb-8">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">{book.title}</h1>
              <p className="text-slate-500 font-serif italic">Chapter 1</p>
           </div>

           {loading ? (
             <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
                <div className="h-32 bg-slate-100 rounded w-full mt-8"></div>
             </div>
           ) : (
             <div className="prose prose-lg prose-slate font-serif leading-relaxed text-slate-800">
               {content.split('\n').map((paragraph, idx) => (
                 paragraph.trim() && <p key={idx} className="mb-6 indent-8 text-justify">{paragraph}</p>
               ))}
             </div>
           )}

           {!loading && (
             <div className="mt-16 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
               <p>End of Preview</p>
               <p className="mt-2 text-xs">Note: This content is AI-generated for demonstration.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
