import React, { useState, useRef } from 'react';
import { X, Upload, Smartphone, AlertCircle, QrCode, Landmark, Copy, Check } from 'lucide-react';
import { Book } from '../types';

interface PaymentModalProps {
  book: Book;
  onClose: () => void;
  onConfirmPurchase: (screenshot: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ book, onClose, onConfirmPurchase }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');
  const [copiedMobile, setCopiedMobile] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (!preview) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmPurchase(preview);
      setIsSubmitting(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, type: 'mobile' | 'upi') => {
    navigator.clipboard.writeText(text);
    if (type === 'mobile') {
      setCopiedMobile(true);
      setTimeout(() => setCopiedMobile(false), 2000);
    } else {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const hasCustomQr = !!book.seller.qrCodeUrl;
  const upiId = book.seller.upiId || '';
  const upiLink = upiId 
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(book.seller.accountHolder || 'Seller')}&am=${book.price}&cu=INR&tn=Book-${book.id}`
    : '#';

  const generatedQrUrl = upiId 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`
    : '';

  const displayQrUrl = hasCustomQr ? book.seller.qrCodeUrl : generatedQrUrl;
  const hasBankDetails = !!book.seller.bankAccount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-lg leading-6 font-bold text-slate-900" id="modal-title">
                Buy "{book.title}"
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <X size={24} />
              </button>
            </div>

            <div className="mt-2">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
                    <p className="text-sm text-indigo-800 font-medium">Amount to Pay</p>
                    <p className="text-3xl font-bold text-indigo-900">₹{book.price}</p>
                  </div>

                  {/* Payment Method Tabs */}
                  {hasBankDetails && (
                    <div className="flex border-b border-slate-200">
                      <button 
                        className={`flex-1 pb-2 text-sm font-medium ${paymentMethod === 'upi' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setPaymentMethod('upi')}
                      >
                        UPI / QR Code
                      </button>
                      <button 
                        className={`flex-1 pb-2 text-sm font-medium ${paymentMethod === 'bank' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setPaymentMethod('bank')}
                      >
                        Bank Transfer
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="text-sm text-slate-600">
                      <p className="mb-4"><strong>Step 1:</strong> Pay to Seller</p>
                      
                      {paymentMethod === 'upi' ? (
                        <>
                           {displayQrUrl ? (
                              <div className="flex justify-center mb-4">
                                <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                                  <img src={displayQrUrl} alt="Payment QR Code" className="w-48 h-48 object-contain" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6 bg-slate-100 rounded-lg mb-4 text-slate-500">
                                <QrCode size={32} className="mb-2 opacity-50"/>
                                <p>No QR Code available.</p>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                                {/* UPI ID Row */}
                                {upiId && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs sm:text-sm">
                                       <div className="flex flex-col overflow-hidden">
                                           <span className="text-slate-500 text-[10px] uppercase font-bold">UPI ID</span>
                                           <span className="font-mono text-slate-800 font-medium truncate">{upiId}</span>
                                       </div>
                                       <button 
                                        onClick={() => copyToClipboard(upiId, 'upi')}
                                        className="text-indigo-600 hover:bg-indigo-50 p-2 rounded flex-shrink-0"
                                        title="Copy UPI ID"
                                       >
                                         {copiedUpi ? <Check size={16} /> : <Copy size={16} />}
                                       </button>
                                    </div>
                                )}

                                {/* Mobile Number Row */}
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center text-xs sm:text-sm">
                                   <div className="flex flex-col">
                                       <span className="text-slate-500 text-[10px] uppercase font-bold">Pay to Mobile Number</span>
                                       <span className="font-mono text-slate-800 font-medium">{book.seller.mobile}</span>
                                   </div>
                                   <button 
                                    onClick={() => copyToClipboard(book.seller.mobile, 'mobile')}
                                    className="text-indigo-600 hover:bg-indigo-50 p-2 rounded flex-shrink-0"
                                    title="Copy Mobile Number"
                                   >
                                     {copiedMobile ? <Check size={16} /> : <Copy size={16} />}
                                   </button>
                                </div>
                            </div>

                             {upiId && (
                              <a 
                                href={upiLink}
                                className="flex items-center justify-center w-full gap-2 bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-200 mt-4"
                              >
                                <Smartphone size={20} />
                                Pay via UPI App
                              </a>
                            )}
                        </>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                           <div>
                              <p className="text-xs text-slate-500">Account Holder Name</p>
                              <p className="font-medium text-slate-900 select-all">{book.seller.accountHolder}</p>
                           </div>
                           <div>
                              <p className="text-xs text-slate-500">Account Number</p>
                              <p className="font-mono font-medium text-slate-900 bg-white p-2 rounded border border-slate-100 select-all">{book.seller.bankAccount}</p>
                           </div>
                           <div>
                              <p className="text-xs text-slate-500">IFSC Code</p>
                              <p className="font-mono font-medium text-slate-900 select-all">{book.seller.ifsc}</p>
                           </div>
                           <div className="text-[10px] text-slate-400 italic pt-2">
                             * Please ensure exact amount transfer.
                           </div>
                        </div>
                      )}

                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                      I have made the payment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-sm text-slate-600">
                     <p className="mb-4"><strong>Step 2:</strong> Upload Screenshot</p>
                  </div>

                  <div 
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${preview ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {preview ? (
                      <div className="relative w-full h-48">
                         <img src={preview} alt="Receipt" className="w-full h-full object-contain rounded-lg" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium">Change Image</span>
                         </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className="text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-600">Upload Receipt</p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2">
                     <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                     <p className="text-xs text-amber-800">Ensure Transaction ID is visible.</p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold" disabled={isSubmitting}>Back</button>
                    <button onClick={handleSubmit} disabled={!preview || isSubmitting} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                      {isSubmitting ? 'Verifying...' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
