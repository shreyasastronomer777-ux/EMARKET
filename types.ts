export interface SellerInfo {
  mobile: string;
  upiId?: string;
  qrCodeUrl?: string; // Base64 or Blob URL for custom QR
  bankAccount?: string;
  ifsc?: string;
  accountHolder?: string;
  isKycVerified?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number; // Selling Price
  mrp: number;   // Maximum Retail Price
  coverUrl: string;
  synopsis: string; // Description
  category: string;
  rating: number;
  pdfUrl: string; // The actual eBook file
  seller: SellerInfo;
}

export interface Purchase {
  id: string;
  bookId: string;
  status: 'pending' | 'approved';
  screenshotUrl: string;
  timestamp: number;
}

export interface Review {
  id: string;
  bookId: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}

export type ViewState = 'store' | 'library' | 'details' | 'wishlist' | 'sell' | 'cart' | 'dashboard';
