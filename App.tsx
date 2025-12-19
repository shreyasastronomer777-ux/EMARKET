
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './services/firebase';
import { Navbar } from './components/Navbar';
import { BookDetail } from './components/BookDetail';
import { PaymentModal } from './components/PaymentModal';
import { AddBook } from './components/AddBook';
import { SellerDashboard } from './components/SellerDashboard';
import { Auth } from './components/Auth';
import { Notification } from './components/Notification';
import { MOCK_BOOKS, MOCK_REVIEWS } from './constants';
import { Book, Purchase, ViewState, Review } from './types';
import { Lock, AlertTriangle, Heart, Star, Zap, ShoppingCart, Trash2, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Data States with Persistence
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('emarket_books');
      return saved ? JSON.parse(saved) : MOCK_BOOKS;
    } catch (error) {
      return MOCK_BOOKS;
    }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem('emarket_purchases');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('emarket_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      return new Set();
    }
  });

  const [cart, setCart] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('emarket_cart');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      return new Set();
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('emarket_reviews');
      return saved ? JSON.parse(saved) : MOCK_REVIEWS;
    } catch (error) {
      return MOCK_REVIEWS;
    }
  });

  const [notification, setNotification] = useState<{message: string, isVisible: boolean, type: 'success' | 'error'}>({
    message: '',
    isVisible: false,
    type: 'success'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      const savedRole = localStorage.getItem(`emarket_role_${user?.uid}`);
      if (savedRole) setUserRole(savedRole as 'buyer' | 'seller');
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Set default view based on role
  useEffect(() => {
    if (userRole === 'seller') {
      setCurrentView('dashboard');
    } else if (userRole === 'buyer') {
      setCurrentView('store');
    }
  }, [userRole]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('emarket_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('emarket_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('emarket_wishlist', JSON.stringify(Array.from(wishlist)));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('emarket_cart', JSON.stringify(Array.from(cart)));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('emarket_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const purchasedBookIds = new Set(purchases.map(p => p.bookId));

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, isVisible: true, type });
  };

  const handleAuthSuccess = (role: 'buyer' | 'seller') => {
    setUserRole(role);
    if (auth.currentUser) {
      localStorage.setItem(`emarket_role_${auth.currentUser.uid}`, role);
    }
    showNotification(`Welcome, ${auth.currentUser?.displayName || 'User'}!`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUserRole(null);
    setCurrentView('store');
    showNotification("Logged out successfully");
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setCurrentView('details');
  };

  const handlePurchaseClick = (book: Book) => {
    setSelectedBook(book);
    setShowPaymentModal(true);
  };

  const confirmPurchase = (screenshotUrl: string) => {
    if (selectedBook) {
      const newPurchase: Purchase = {
        id: Math.random().toString(36).substr(2, 9),
        bookId: selectedBook.id,
        status: 'approved',
        screenshotUrl,
        timestamp: Date.now()
      };
      setPurchases([...purchases, newPurchase]);
      setShowPaymentModal(false);
      showNotification(`Payment successful! You can now download "${selectedBook.title}".`);
      
      if (cart.has(selectedBook.id)) {
        const newCart = new Set(cart);
        newCart.delete(selectedBook.id);
        setCart(newCart);
      }
      if (wishlist.has(selectedBook.id)) {
        toggleWishlist(selectedBook.id);
      }
    }
  };

  const toggleWishlist = (bookId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(bookId)) {
      newWishlist.delete(bookId);
      if (currentView !== 'wishlist' && currentView !== 'details') showNotification("Removed from wishlist", 'success');
    } else {
      newWishlist.add(bookId);
      showNotification("Added to wishlist", 'success');
    }
    setWishlist(newWishlist);
  };

  const handleAddToCart = (bookId: string) => {
    if (cart.has(bookId)) {
      setCurrentView('cart');
      return;
    }
    const newCart = new Set(cart);
    newCart.add(bookId);
    setCart(newCart);
    showNotification("Added to cart successfully!");
  };

  const handleRemoveFromCart = (bookId: string) => {
    const newCart = new Set(cart);
    newCart.delete(bookId);
    setCart(newCart);
    showNotification("Removed from cart");
  };

  const handleAddReview = (rating: number, comment: string) => {
    if (!selectedBook) return;
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      bookId: selectedBook.id,
      user: currentUser?.displayName || 'Reader',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };
    setReviews([newReview, ...reviews]);
    showNotification("Review posted successfully!");
  };

  const handleAddNewBook = (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
    setCurrentView('dashboard');
    showNotification("Your eBook has been listed for sale successfully!");
  };

  // Filter books logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const purchasedBooksList = books.filter(book => purchasedBookIds.has(book.id));
  const wishlistBooksList = books.filter(book => wishlist.has(book.id));
  const cartBooksList = books.filter(book => cart.has(book.id));
  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!currentUser || !userRole) {
    return (
      <>
        <Notification 
          message={notification.message}
          isVisible={notification.isVisible}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
        />
        <Auth onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  const renderBookGrid = (booksToRender: Book[], emptyMessage: string) => {
    if (booksToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white m-4 rounded-lg shadow-sm">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" alt="Empty" className="w-48 h-48 object-contain opacity-50 mb-4" />
          <h3 className="text-xl font-medium text-slate-900">{emptyMessage}</h3>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 p-2 sm:p-4 bg-[#f1f3f6]">
        {booksToRender.map((book) => {
          const isWishlisted = wishlist.has(book.id);
          const isOwned = purchasedBookIds.has(book.id);
          const mrp = book.mrp || Math.floor(book.price * 1.25);
          const discount = Math.round(((mrp - book.price) / mrp) * 100);

          return (
            <div 
              key={book.id} 
              className="bg-white rounded-sm shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer relative overflow-hidden"
              onClick={() => handleBookClick(book)}
            >
              <div className="relative pt-[120%] bg-white border-b border-slate-50">
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(book.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-slate-400 hover:text-rose-500 shadow-sm z-10"
                >
                   <Heart size={16} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
                </button>
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <div className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">{book.category}</div>
                <h3 className="text-sm font-medium text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2">by {book.author}</p>
                
                <div className="flex items-center gap-2 mb-2">
                   <div className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      {book.rating || '4.5'} <Star size={8} fill="currentColor" />
                   </div>
                   <span className="text-xs text-slate-400">(42)</span>
                </div>

                <div className="mt-auto">
                   <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-slate-900">₹{book.price}</span>
                      {discount > 0 && (
                        <>
                           <span className="text-xs text-slate-400 line-through">₹{mrp}</span>
                           <span className="text-xs text-green-600 font-bold">{discount}% off</span>
                        </>
                      )}
                   </div>
                   <div className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1">
                      {isOwned ? (
                         <span className="text-emerald-600 flex items-center gap-1"><Zap size={10} fill="currentColor" /> Purchased</span>
                      ) : (
                         <span>Instant Access</span>
                      )}
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStore = () => (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-6 py-3 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-sm font-medium whitespace-nowrap transition-colors flex flex-col items-center gap-1 group ${selectedCategory === cat ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
              >
                {cat}
                <span className={`h-0.5 w-full rounded-full transition-all ${selectedCategory === cat ? 'bg-blue-600' : 'bg-transparent group-hover:bg-blue-200'}`}></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-2 sm:p-4">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-sm shadow-md text-white p-6 sm:p-12 relative overflow-hidden">
           <div className="relative z-10 max-w-lg">
             <h2 className="text-3xl sm:text-4xl font-bold mb-2">Knowledge Festival</h2>
             <p className="text-lg opacity-90 mb-6">Up to 70% off on Finance & Self-Help Bestsellers.</p>
             <button className="bg-white text-indigo-600 px-6 py-2 rounded-sm font-semibold shadow-lg hover:bg-slate-50 transition">
               Explore Now
             </button>
           </div>
           <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[url('https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto pb-8">
        <div className="bg-white mx-2 sm:mx-4 mb-4 p-4 rounded-sm shadow-sm flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
             {selectedCategory === 'All' ? 'Recommended for You' : `${selectedCategory} Books`}
          </h2>
          <button className="bg-[#2874f0] text-white text-xs font-semibold px-3 py-2 rounded-sm shadow-sm">VIEW ALL</button>
        </div>
        {renderBookGrid(filteredBooks, "No books found matching your criteria.")}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans">
      <Notification 
        message={notification.message}
        isVisible={notification.isVisible}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />

      <Navbar 
        currentView={currentView} 
        setView={setCurrentView} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cart.size}
        user={currentUser}
        onLogout={handleLogout}
        role={userRole}
      />
      
      <main>
        {currentView === 'store' && renderStore()}
        {currentView === 'cart' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Shopping Cart ({cartBooksList.length})</h1>
            {cartBooksList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <ShoppingCart size={32} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Your cart is empty</h3>
                <button onClick={() => setCurrentView('store')} className="mt-4 bg-[#2874f0] text-white px-6 py-2 rounded-sm font-medium">Shop Now</button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  {cartBooksList.map(book => (
                    <div key={book.id} className="bg-white p-4 rounded-sm shadow-sm flex gap-4 border border-slate-200">
                       <div className="w-24 h-32 flex-shrink-0 bg-slate-50"><img src={book.coverUrl} className="w-full h-full object-contain" /></div>
                       <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{book.title}</h3>
                          <p className="text-sm text-slate-500">by {book.author}</p>
                          <div className="mt-4 flex gap-4">
                            <button onClick={() => handleRemoveFromCart(book.id)} className="text-slate-600 hover:text-red-500 text-sm font-medium">Remove</button>
                            <button onClick={() => handlePurchaseClick(book)} className="text-white bg-[#fb641b] px-4 py-1.5 rounded-sm text-sm font-bold">Buy Now</button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {currentView === 'dashboard' && (
          <SellerDashboard 
            books={books}
            purchases={purchases}
            onAddBook={() => setCurrentView('sell')}
          />
        )}
        {currentView === 'wishlist' && (
           <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-semibold text-slate-800 mb-6">My Wishlist ({wishlist.size})</h1>
              {renderBookGrid(wishlistBooksList, "Your wishlist is empty.")}
           </div>
        )}
        {currentView === 'library' && (
           <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-semibold text-slate-800 mb-6">My Library</h1>
              {purchasedBooksList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                  <Lock size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">Your purchased books will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {purchasedBooksList.map(book => (
                     <div key={book.id} className="bg-white rounded p-3 shadow-sm border border-slate-200 cursor-pointer" onClick={() => handleBookClick(book)}>
                        <img src={book.coverUrl} className="w-full aspect-[2/3] object-cover mb-2" />
                        <h3 className="font-medium text-sm truncate">{book.title}</h3>
                     </div>
                   ))}
                </div>
              )}
           </div>
        )}
        {currentView === 'sell' && (
          <AddBook 
            onAddBook={handleAddNewBook}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'details' && selectedBook && (
          <BookDetail 
            book={selectedBook} 
            onBack={() => setCurrentView(userRole === 'buyer' ? 'store' : 'dashboard')}
            onPurchase={() => handlePurchaseClick(selectedBook)}
            onAddToCart={() => handleAddToCart(selectedBook.id)}
            isPurchased={purchasedBookIds.has(selectedBook.id)}
            isWishlisted={wishlist.has(selectedBook.id)}
            isInCart={cart.has(selectedBook.id)}
            onToggleWishlist={() => toggleWishlist(selectedBook.id)}
            reviews={reviews.filter(r => r.bookId === selectedBook.id)}
            onAddReview={handleAddReview}
          />
        )}
      </main>

      {showPaymentModal && selectedBook && (
        <PaymentModal 
          book={selectedBook} 
          onClose={() => setShowPaymentModal(false)}
          onConfirmPurchase={confirmPurchase}
        />
      )}
    </div>
  );
};

export default App;
