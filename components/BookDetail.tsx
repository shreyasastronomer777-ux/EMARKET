import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, Heart, Download, Check, ShieldCheck, Zap, Share2, ShoppingCart } from 'lucide-react';
import { Book, Review } from '../types';
import { generateBookPreview } from '../services/geminiService';
import { Reviews } from './Reviews';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onPurchase: () => void;
  onAddToCart: () => void;
  isPurchased: boolean;
  isWishlisted: boolean;
  isInCart: boolean;
  onToggleWishlist: () => void;
  reviews: Review[];
  onAddReview: (rating: number, comment: string) => void;
}

export const BookDetail: React.FC<BookDetailProps> = ({ 
  book, 
  onBack, 
  onPurchase, 
  onAddToCart,
  isPurchased, 
  isWishlisted,
  isInCart,
  onToggleWishlist,
  reviews,
  onAddReview
}) => {
  const [aiHook, setAiHook] = useState<string>('');

  useEffect(() => {
    const fetchHook = async () => {
      const hook = await generateBookPreview(book.title, book.author);
      setAiHook(hook);
    };
    fetchHook();
  }, [book]);

  const mrp = book.mrp || Math.floor(book.price * 1.25);
  const discount = Math.round(((mrp - book.price) / mrp) * 100);

  return (
    <div className="bg-[#f1f3f6] min-h-screen pb-12">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-16 z-40 px-4 py-2">
         <button 
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-[#2874f0] text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Products
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Image & Buttons */}
          <div className="md:w-1/3 lg:w-2/5 p-4 border-r border-slate-100 flex flex-col items-center">
             <div className="w-full aspect-[3/4] max-w-sm relative p-4 border border-slate-100 rounded mb-6">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-full object-contain"
                />
                <button 
                  onClick={onToggleWishlist}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md text-slate-400 hover:text-rose-500 border border-slate-100"
                >
                   <Heart size={20} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
                </button>
             </div>

             <div className="w-full max-w-sm flex gap-3">
               {isPurchased ? (
                  <a 
                    href={book.pdfUrl}
                    download={`${book.title}.pdf`}
                    className="flex-1 bg-emerald-600 text-white py-3.5 rounded-sm font-bold shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2 uppercase text-sm"
                  >
                    <Download size={18} /> Download
                  </a>
               ) : (
                 <>
                   <button 
                    onClick={onAddToCart}
                    className="flex-1 bg-[#ff9f00] text-white py-3.5 rounded-sm font-bold shadow-sm hover:shadow-md transition uppercase text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} fill="currentColor" />
                    {isInCart ? 'Go to Cart' : 'Add to Cart'}
                  </button>
                   <button 
                    onClick={onPurchase}
                    className="flex-1 bg-[#fb641b] text-white py-3.5 rounded-sm font-bold shadow-sm hover:shadow-md transition uppercase text-sm flex items-center justify-center gap-2"
                  >
                    <Zap size={18} fill="currentColor" />
                    Buy Now
                  </button>
                 </>
               )}
             </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:w-2/3 lg:w-3/5 p-6 sm:p-8">
            {/* Breadcrumb-ish */}
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              Home {'>'} Books {'>'} {book.category} {'>'} <span className="text-slate-600 truncate">{book.title}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-medium text-slate-900 mb-1">{book.title}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                 {book.rating || '4.5'} <Star size={10} fill="currentColor" />
              </div>
              <span className="text-slate-500 text-sm font-medium">1,240 Ratings & 42 Reviews</span>
            </div>

            <p className="text-sm text-slate-500 mb-4">Author: <span className="text-[#2874f0] font-medium">{book.author}</span></p>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-1">
                 <span className="text-3xl font-medium text-slate-900">₹{book.price}</span>
                 {discount > 0 && (
                   <>
                     <span className="text-slate-500 line-through text-sm mb-1">₹{mrp}</span>
                     <span className="text-green-600 font-bold text-sm mb-1">{discount}% off</span>
                   </>
                 )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck size={14} className="text-slate-400" /> 100% Authentic & Verified
              </p>
            </div>

            {/* AI Insight Box */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded-bl">AI Summary</div>
               <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                 <Zap size={14} className="text-yellow-500 fill-current" /> Quick Insight
               </h3>
               <p className="text-sm text-slate-700 italic leading-relaxed">
                 {aiHook ? `"${aiHook}"` : "Generating insights..."}
               </p>
            </div>

            {/* Seller Info */}
            <div className="border border-slate-200 rounded p-4 mb-6 flex items-start gap-4">
               <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-900">Sold by: {book.seller.accountHolder || book.seller.mobile}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    7 Day Replacement Policy • GST invoice available
                  </p>
               </div>
            </div>

            {/* Description */}
            <div>
               <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <h3 className="text-lg font-medium text-slate-800">Product Description</h3>
               </div>
               <p className="text-sm text-slate-600 leading-relaxed mb-6">
                 {book.synopsis}
               </p>
            </div>

            <Reviews 
               reviews={reviews} 
               isPurchased={isPurchased} 
               onAddReview={onAddReview} 
            />

          </div>
        </div>
      </div>
    </div>
  );
};
