"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Wallet, Banknote } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("cod");

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-bold text-gray-900 tracking-tight">Checkout</h1>
      </header>
      
      <div className="p-4 mt-4">
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-base font-extrabold text-gray-900 mb-4 border-b border-gray-100 pb-3">Select Payment Method</h2>
            
            <div className="space-y-3">
                {/* UPI Option */}
                <div onClick={() => setPaymentMethod('upi')} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${paymentMethod === 'upi' ? 'border-[#5C3A21] bg-[#F4EFE6]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                   {paymentMethod === 'upi' ? <CheckCircle2 className="h-5 w-5 text-[#5C3A21]" /> : <Circle className="h-5 w-5 text-gray-400" />}
                   <Wallet className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-[#5C3A21]' : 'text-gray-500'}`} />
                   <span className={`font-bold text-sm ${paymentMethod === 'upi' ? 'text-[#5C3A21]' : 'text-gray-700'}`}>UPI (GPay, PhonePe, Paytm)</span>
                </div>

                {/* COD Option */}
                <div onClick={() => setPaymentMethod('cod')} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${paymentMethod === 'cod' ? 'border-[#5C3A21] bg-[#F4EFE6]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                   {paymentMethod === 'cod' ? <CheckCircle2 className="h-5 w-5 text-[#5C3A21]" /> : <Circle className="h-5 w-5 text-gray-400" />}
                   <Banknote className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-[#5C3A21]' : 'text-gray-500'}`} />
                   <span className={`font-bold text-sm ${paymentMethod === 'cod' ? 'text-[#5C3A21]' : 'text-gray-700'}`}>Cash on Delivery (COD)</span>
                </div>
            </div>
         </div>

         <button onClick={() => { localStorage.setItem("payment_method", paymentMethod); router.push('/success'); }} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg shadow-md active:scale-95 transition">
            Place Order Now
         </button>
      </div>
    </div>
  );
}
