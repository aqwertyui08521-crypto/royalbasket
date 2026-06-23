"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, Tag, QrCode, CreditCard, Banknote, ShieldCheck, Info } from "lucide-react";

export default function PaymentOptionsPage() {
  const router = useRouter();
  const [total, setTotal] = useState(349);
  const [savings, setSavings] = useState(7546);
  const [paymentMethod, setPaymentMethod] = useState("phonepe");

  useEffect(() => {
    const savedTotal = localStorage.getItem("cartTotal");
    if (savedTotal) setTotal(parseInt(savedTotal));
    setSavings(savedTotal ? Math.floor(parseInt(savedTotal) * 1.5) : 7546);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">Payment Options</h1>
            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">1 ITEM - TO PAY: ₹{total}</p>
         </div>
      </header>

      <main className="p-4 space-y-5">
        {/* Free Delivery Banner */}
        <div className="bg-[#F0F8FF] border border-[#D0E8FF] rounded-2xl p-4 flex items-start gap-3">
           <div className="bg-white p-2 rounded-full shadow-sm shrink-0"><Truck className="h-5 w-5 text-[#8B5A2B]" /></div>
           <div>
              <h3 className="text-sm font-extrabold text-gray-900">Free delivery applied!</h3>
              <p className="text-[10px] font-bold text-[#8B5A2B] mt-0.5">You saved ₹{savings} on this order</p>
           </div>
        </div>

        {/* Bank & Wallet Offers */}
        <div>
           <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5"><Tag className="h-4 w-4 fill-[#8B5A2B] text-[#8B5A2B]"/> Bank & Wallet Offers</h3><span className="text-[10px] font-extrabold text-[#8B5A2B] cursor-pointer">View All</span></div>
           <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
              <div className="min-w-[220px] bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm relative overflow-hidden">
                 <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#8B5A2B]"></div>
                 <div className="h-8 w-8 bg-[#F0F8FF] rounded-full flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-blue-600">UPI</span></div>
                 <p className="text-[10px] font-bold text-gray-600 leading-tight">Eligible UPI offers, if any, are shown by your payment app.</p>
              </div>
              <div className="min-w-[220px] bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                 <div className="h-8 w-8 bg-red-50 rounded-full flex items-center justify-center shrink-0"><CreditCard className="h-4 w-4 text-red-500" /></div>
                 <p className="text-[10px] font-bold text-gray-600 leading-tight">Card Payment Offers available on select banks.</p>
              </div>
           </div>
        </div>

        {/* Recommended UPI Options */}
        <div>
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Recommended UPI Options</h3>
           <div className="space-y-3">
              <div onClick={() => setPaymentMethod('phonepe')} className={`bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'phonepe' ? 'border-2 border-[#8B5A2B] shadow-sm bg-[#FFFDF9]' : 'border border-gray-200 shadow-sm'}`}>
                 <div className="h-10 w-10 bg-[#5E2D91] rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">पे</div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2"><h4 className="text-sm font-extrabold text-gray-900">PhonePe</h4><span className="bg-[#F4EFE6] text-[#8B5A2B] text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5"><span className="text-[10px]">⚡</span> Fast</span></div>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Android native PhonePe payment</p>
                 </div>
                 <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'phonepe' ? 'border-[#8B5A2B]' : 'border-gray-300'}`}>
                    {paymentMethod === 'phonepe' && <div className="h-2.5 w-2.5 bg-[#8B5A2B] rounded-full"></div>}
                 </div>
              </div>

              <div onClick={() => setPaymentMethod('paytm')} className={`bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'paytm' ? 'border-2 border-[#8B5A2B] shadow-sm bg-[#FFFDF9]' : 'border border-gray-200 shadow-sm'}`}>
                 <div className="h-10 w-10 bg-[#002970] rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0">Paytm</div>
                 <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-gray-900">Paytm UPI</h4>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">UPI payment option available</p>
                 </div>
                 <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paytm' ? 'border-[#8B5A2B]' : 'border-gray-300'}`}>
                    {paymentMethod === 'paytm' && <div className="h-2.5 w-2.5 bg-[#8B5A2B] rounded-full"></div>}
                 </div>
              </div>
           </div>
        </div>

        {/* Scan & Pay */}
        <div>
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Scan & Pay</h3>
           <div onClick={() => router.push('/payment/qr')} className={`bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-2 border-[#8B5A2B] shadow-sm bg-[#FFFDF9]' : 'border border-gray-200 shadow-sm'}`}>
              <div className="h-10 w-10 bg-[#F8F9FA] border border-gray-200 rounded-xl flex items-center justify-center shrink-0"><QrCode className="h-5 w-5 text-gray-700" /></div>
              <div className="flex-1">
                 <h4 className="text-sm font-extrabold text-gray-900">Scan QR Code</h4>
                 <p className="text-[10px] font-bold text-gray-500 mt-0.5">Use any UPI app to scan & pay</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'qr' ? 'border-[#8B5A2B]' : 'border-gray-300'}`}>
                 {paymentMethod === 'qr' && <div className="h-2.5 w-2.5 bg-[#8B5A2B] rounded-full"></div>}
              </div>
           </div>
        </div>

        {/* Other Options */}
        <div>
           <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Other Options</h3>
           <div className="space-y-3">
              <div className="bg-[#F8F9FA] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 opacity-60">
                 <div className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0"><CreditCard className="h-5 w-5 text-gray-400" /></div>
                 <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-gray-500">Credit / Debit Card</h4>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">Temporarily unavailable</p>
                 </div>
              </div>

              <div onClick={() => setPaymentMethod('cod')} className={`bg-white rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-2 border-[#8B5A2B] shadow-sm bg-[#FFFDF9]' : 'border border-gray-200 shadow-sm'}`}>
                 <div className="h-10 w-10 bg-[#F8F9FA] border border-gray-200 rounded-xl flex items-center justify-center shrink-0"><Banknote className="h-5 w-5 text-gray-700" /></div>
                 <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-gray-900">Pay on Delivery (COD)</h4>
                    <p className="text-[10px] font-bold text-green-600 mt-0.5">Available for this order</p>
                 </div>
                 <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#8B5A2B]' : 'border-gray-300'}`}>
                    {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 bg-[#8B5A2B] rounded-full"></div>}
                 </div>
              </div>
           </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-4">Bill Details</h3>
           <div className="space-y-2.5 text-xs font-semibold text-gray-600 mb-4">
              <div className="flex justify-between"><span>Item Total</span><span className="text-gray-900">₹{total + savings}</span></div>
              <div className="flex justify-between text-[#8B5A2B]"><span>Product Savings</span><span>− ₹{savings}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span className="text-gray-900 font-bold uppercase">Free</span></div>
           </div>
           <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-300">
              <span className="text-gray-900 font-black text-sm">To Pay</span>
              <span className="text-lg font-black text-gray-900">₹{total}</span>
           </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
           <Info className="h-4 w-4 text-gray-900 shrink-0 mt-0.5" />
           <p className="text-[10px] font-medium text-gray-600 leading-relaxed"><span className="font-bold text-gray-900">Cancellation Policy:</span> Orders cannot be cancelled once packed for delivery. In case of unexpected delays, refund will be provided, if applicable.</p>
        </div>

        <div className="flex justify-center items-center gap-1.5 py-4 text-gray-600">
           <ShieldCheck className="h-4 w-4 text-[#8B5A2B]" />
           <span className="text-xs font-bold">100% Secure Payments</span>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-50">
         <button onClick={() => { localStorage.setItem("payment_method", paymentMethod); router.push('/success'); }} className="w-full bg-[#5C3A21] text-white rounded-xl py-4 flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
            <span className="text-base font-extrabold">Pay securely ₹{total}</span>
         </button>
      </div>
    </div>
  );
}
