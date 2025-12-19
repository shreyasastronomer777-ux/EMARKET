import React, { useState } from 'react';
import { Star, User } from 'lucide-react';
import { Review } from '../types';

interface ReviewsProps {
  reviews: Review[];
  isPurchased: boolean;
  onAddReview: (rating: number, comment: string) => void;
}

export const Reviews: React.FC<ReviewsProps> = ({ reviews, isPurchased, onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;

    setIsSubmitting(true);
    // Simulate delay
    setTimeout(() => {
      onAddReview(rating, comment);
      setRating(0);
      setComment('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="mt-12 border-t border-slate-100 pt-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Reader Reviews</h2>

      {/* Review Form (Only if purchased) */}
      {isPurchased && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
          <h3 className="font-semibold text-slate-800 mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                rows={3}
                placeholder="What did you think about this book?"
                required
              />
            </div>

            <button
              type="submit"
              disabled={rating === 0 || !comment.trim() || isSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-slate-500 italic">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.user}</p>
                    <p className="text-xs text-slate-400">{review.date}</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-slate-200"} />
                  ))}
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
