import React from 'react';
import { Book, Purchase } from '../types';
import { TrendingUp, BookOpen, IndianRupee, Plus, ShoppingBag } from 'lucide-react';

interface SellerDashboardProps {
  books: Book[];
  purchases: Purchase[];
  onAddBook: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({ books, purchases, onAddBook }) => {
  // Calculate Stats
  const myBookIds = new Set(books.map(b => b.id));
  
  // Filter purchases that match the user's books
  const mySales = purchases.filter(p => myBookIds.has(p.bookId));
  
  const totalEarnings = mySales.reduce((acc, sale) => {
    const book = books.find(b => b.id === sale.bookId);
    return acc + (book ? book.price : 0);
  }, 0);

  const totalSalesCount = mySales.length;
  const totalListings = books.length;

  const getSalesForBook = (bookId: string) => {
    return mySales.filter(p => p.bookId === bookId).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Seller Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your inventory and track your earnings.</p>
        </div>
        <button 
          onClick={onAddBook}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Earnings</p>
            <h3 className="text-2xl font-bold text-slate-900">₹{totalEarnings.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Sales</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalSalesCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Listings</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalListings}</h3>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">My Listings</h3>
        </div>
        
        {books.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="mb-4">You haven't listed any books yet.</p>
            <button onClick={onAddBook} className="text-indigo-600 font-medium hover:underline">Create your first listing</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Book Details</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Sales Count</th>
                  <th className="px-6 py-4">Total Revenue</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => {
                  const soldCount = getSalesForBook(book.id);
                  const revenue = soldCount * book.price;
                  
                  return (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-9 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
                             <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{book.title}</p>
                            <p className="text-xs text-slate-500">{book.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        ₹{book.price} <span className="text-xs text-slate-400 line-through">₹{book.mrp}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {soldCount}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-emerald-600">
                        ₹{revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
