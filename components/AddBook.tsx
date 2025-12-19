import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, FileText, Smartphone, QrCode, AlertCircle, ChevronDown, ChevronUp, Landmark, ShieldCheck } from 'lucide-react';
import { Book } from '../types';

interface AddBookProps {
  onAddBook: (book: Book) => void;
  onCancel: () => void;
}

export const AddBook: React.FC<AddBookProps> = ({ onAddBook, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    mrp: '',
    price: '',
    category: 'General',
    synopsis: '',
    mobile: '',
    upiId: '',
    accountHolder: '',
    bankAccount: '',
    ifsc: '',
    kycAgreed: false
  });

  const [coverFile, setCoverFile] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  
  // UI States
  const [uploadProgress, setUploadProgress] = useState(0);

  // File refs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(''); 
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, kycAgreed: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'pdf' | 'qr') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (type === 'pdf' && file.type !== 'application/pdf') {
        setError("Please upload a valid PDF file.");
        return;
      }
      
      const maxSize = 150 * 1024 * 1024; // 150MB Limit
      if (file.size > maxSize) { 
        setError("File size too large (Max 150MB).");
        return;
      }

      setError(''); 

      if (type === 'pdf') {
        setUploadProgress(0);
        setPdfFile(null);
        
        const duration = 1500; 
        const intervalTime = 50;
        const steps = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
          currentStep++;
          const progress = Math.min((currentStep / steps) * 100, 100);
          setUploadProgress(progress);

          if (currentStep >= steps) {
            clearInterval(timer);
            const objectUrl = URL.createObjectURL(file);
            setPdfFile(objectUrl);
          }
        }, intervalTime);

      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (type === 'cover') setCoverFile(result);
          if (type === 'qr') setQrCodeFile(result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title.trim()) { setError("Please enter the book title."); return; }
    if (!formData.author.trim()) { setError("Please enter the author's name."); return; }
    
    // Price Validation
    const mrp = Number(formData.mrp);
    const sellingPrice = Number(formData.price);
    if (!mrp || mrp <= 0) { setError("Please enter a valid MRP."); return; }
    if (!sellingPrice || sellingPrice <= 0) { setError("Please enter a valid Selling Price."); return; }
    if (sellingPrice > mrp) { setError("Selling Price cannot be higher than MRP."); return; }

    if (!formData.synopsis.trim()) { setError("Please enter a description."); return; }
    
    if (!coverFile) { setError("Please upload a cover image."); return; }
    if (!pdfFile) { setError("Please upload the eBook PDF file."); return; }
    
    // Bank & KYC Validation
    if (!formData.mobile.trim()) { setError("Mobile number is required."); return; }
    if (!formData.accountHolder.trim()) { setError("Account Holder Name is required."); return; }
    if (!formData.bankAccount.trim()) { setError("Bank Account Number is required."); return; }
    if (!formData.ifsc.trim()) { setError("IFSC Code is required."); return; }
    if (!formData.kycAgreed) { setError("You must agree to the KYC declaration."); return; }
    
    setIsSubmitting(true);

    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      author: formData.author,
      mrp: mrp,
      price: sellingPrice,
      coverUrl: coverFile,
      synopsis: formData.synopsis,
      category: formData.category,
      rating: 0,
      pdfUrl: pdfFile,
      seller: {
        mobile: formData.mobile,
        upiId: formData.upiId || undefined,
        qrCodeUrl: qrCodeFile || undefined,
        accountHolder: formData.accountHolder,
        bankAccount: formData.bankAccount,
        ifsc: formData.ifsc,
        isKycVerified: true
      }
    };

    setTimeout(() => {
      onAddBook(newBook);
      setIsSubmitting(false);
    }, 1000);
  };

  const discountPercent = (Number(formData.mrp) > 0 && Number(formData.price) > 0)
    ? Math.round(((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sell Your eBook</h1>
        <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-700 bg-slate-100 p-2 rounded-full">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-4 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Book Details Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
            Book Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Book Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                  placeholder="e.g. The Psychology of Money"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Author Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                  placeholder="e.g. Morgan Housel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white transition-shadow"
                  >
                    <option>General</option>
                    <option>Finance</option>
                    <option>Self-Help</option>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Cooking</option>
                    <option>Fiction</option>
                    <option>Science</option>
                    <option>Education</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
               {/* Pricing Row */}
               <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">MRP (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="mrp"
                      min="0"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                      placeholder="e.g. 299"
                    />
                  </div>
               </div>
               
               {discountPercent > 0 && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
                    <Check size={16} />
                    You are offering a <span className="font-bold">{discountPercent}% Discount</span>
                 </div>
               )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-shadow"
                  placeholder="What is your book about?"
                />
              </div>
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Files Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
            Upload Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cover Upload */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${coverFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
              onClick={() => coverInputRef.current?.click()}
            >
              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
              {coverFile ? (
                <div className="text-center w-full">
                  <div className="w-full h-32 relative mb-2">
                    <img src={coverFile} alt="Cover Preview" className="w-full h-full object-contain mx-auto rounded shadow-sm" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-emerald-700">
                    <Check size={16} />
                    <span className="text-sm font-medium">Cover Uploaded</span>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-500 group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Upload Cover Image</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG</p>
                </div>
              )}
            </div>

            {/* PDF Upload */}
            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${pdfFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
              onClick={() => pdfInputRef.current?.click()}
            >
              <input type="file" ref={pdfInputRef} className="hidden" accept="application/pdf" onChange={(e) => handleFileChange(e, 'pdf')} />
              
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <div className="w-full max-w-xs text-center">
                   <div className="mb-2 flex justify-between text-xs font-semibold text-indigo-600">
                     <span>Uploading...</span>
                     <span>{Math.round(uploadProgress)}%</span>
                   </div>
                   <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-75" style={{ width: `${uploadProgress}%` }}></div>
                   </div>
                </div>
              ) : pdfFile ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm font-medium text-emerald-800">PDF Uploaded Successfully</p>
                  <p className="text-xs text-emerald-600 mt-1">Ready for sale</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-500 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Upload eBook PDF</p>
                  <p className="text-xs text-slate-400 mt-1">PDF (Max 150MB)</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Bank & KYC Section */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
            Bank Details & KYC
          </h2>
          
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name <span className="text-red-500">*</span></label>
                   <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Name as per Bank Records"
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                   <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Linked to Bank Account"
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Bank Account Number <span className="text-red-500">*</span></label>
                   <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. 1234567890"
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code <span className="text-red-500">*</span></label>
                   <input
                      type="text"
                      name="ifsc"
                      value={formData.ifsc}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                      placeholder="e.g. SBIN0001234"
                    />
                </div>
             </div>

             <div className="pt-2 border-t border-slate-200">
                <div className="flex gap-4 items-start">
                   <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">UPI ID (Optional)</label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="username@upi"
                      />
                   </div>
                   <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">QR Code (Optional)</label>
                      <button 
                          type="button"
                          onClick={() => qrInputRef.current?.click()}
                          className="w-full bg-white border border-slate-300 text-slate-600 px-4 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition border-dashed flex items-center justify-center gap-2"
                        >
                          <QrCode size={16} />
                          {qrCodeFile ? 'QR Image Selected' : 'Upload Payment QR'}
                        </button>
                      <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'qr')} />
                   </div>
                </div>
             </div>

             {/* KYC Checkbox */}
             <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start border border-blue-100">
                <input 
                  type="checkbox" 
                  id="kyc" 
                  checked={formData.kycAgreed}
                  onChange={handleCheckboxChange}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="kyc" className="text-sm text-slate-700 leading-relaxed cursor-pointer select-none">
                  <span className="font-semibold text-slate-900 block mb-1">KYC Declaration</span>
                  I confirm that the bank details provided above belong to me and are correct. I understand that payouts for my sales will be credited to this account. I certify that I am not uploading copyrighted content without permission.
                </label>
             </div>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
            <AlertCircle size={20} className="flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="pt-4 flex flex-col-reverse sm:flex-row gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>Listing...</>
            ) : (
              <>
                <ShieldCheck size={20} />
                List Book for Sale
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
