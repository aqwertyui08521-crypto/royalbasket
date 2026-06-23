"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Tag, ChevronRight, ShieldCheck, Lock } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [total, setTotal] = useState(349);
  const [savings, setSavings] = useState(7546);
  const [itemsCount, setItemsCount] = useState(1);

  useEffect(() => {
    const savedTotal = localStorage.getItem("cartTotal");
    if (savedTotal) setTotal(parseInt(savedTotal));
    // ডেমো সেভিংস (স্ক্রিনশটের মতো)
    setSavings(savedTotal ? Math.floor(parseInt(savedTotal) * 1.5) : 7546);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">Checkout</h1>
            <p className="text-[10px] font-bold text-gray-500 mt-1">{itemsCount} item in your cart</p>
         </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Address Block */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3 relative">
           <div className="bg-[#F8F9FA] p-2 rounded-full shrink-0"><MapPin className="h-5 w-5 text-[#5C3A21]" /></div>
           <div className="pr-12">
              <h2 className="text-sm font-extrabold text-gray-900 mb-1">Deliver to Home</h2>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">Rubina Khatun, NN, Jns, Najem,<br/>Chandigarh - 743206<br/>Mobile: 7943188464</p>
           </div>
           <button className="absolute top-4 right-4 text-[10px] font-black text-[#5C3A21] tracking-wider uppercase">Change</button>
        </div>

        {/* Items in cart */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-4">Items in cart</h3>
           <div className="flex items-start gap-3">
              <div className="h-16 w-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-3xl">🌰</div>
              <div className="flex-1">
                 <h4 className="text-sm font-bold text-gray-900 leading-tight">Dry Fruits Combo Pack</h4>
                 <p className="text-[10px] text-gray-500 font-medium mt-0.5">1 Kg</p>
                 <div className="font-black text-gray-900 mt-2 text-sm">₹{total}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className="bg-[#5C3A21] text-white rounded-lg flex items-center px-2 py-1 shadow-sm">
                    <button className="text-lg font-black px-2.5">−</button>
                    <span className="font-black text-sm min-w-[20px] text-center">1</span>
                    <button className="text-lg font-black px-2.5">+</button>
                 </div>
                 <button className="text-[10px] font-bold text-red-500">Remove</button>
              </div>
           </div>
        </div>

        {/* Offers Available */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-3">Offers Available</h3>
           <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl p-3 flex justify-between items-center bg-[#FAFAFA]">
                 <div><h4 className="text-xs font-bold text-gray-900">Buy 3 Get 1 Free</h4><p className="text-[10px] text-gray-500 mt-0.5">Add 2 more item(s) to unlock</p></div>
                 <span className="text-[10px] font-black text-[#8B5A2B] uppercase tracking-wider">Locked</span>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 flex justify-between items-center bg-[#FAFAFA]">
                 <div><h4 className="text-xs font-bold text-gray-900">Buy 5 Get 2 Free</h4><p className="text-[10px] text-gray-500 mt-0.5">Add 4 more item(s) to unlock</p></div>
                 <span className="text-[10px] font-black text-[#8B5A2B] uppercase tracking-wider">Locked</span>
              </div>
           </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-4">Bill Details</h3>
           <div className="space-y-2.5 text-xs font-semibold text-gray-600 mb-4">
              <div className="flex justify-between"><span>Item Total</span><span className="text-gray-900">₹{total + savings}</span></div>
              <div className="flex justify-between text-[#8B5A2B]"><span>Product Savings</span><span>− ₹{savings}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span className="text-green-600 font-bold uppercase">Free</span></div>
           </div>
           <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-300">
              <span className="text-gray-900 font-black text-sm">To Pay</span>
              <span className="text-lg font-black text-gray-900">₹{total}</span>
           </div>
        </div>

        {/* Savings Tag */}
        <div className="bg-[#F4EFE6] text-[#5C3A21] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-[#EADBC8]">
           <Tag className="h-4 w-4 fill-[#5C3A21]" /> You saved ₹{savings} on this order
        </div>

        <div className="flex flex-col items-center justify-center py-6 opacity-50">
           <div className="flex items-center gap-2 mb-1"><div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px]">🌰</div><span className="font-black text-gray-900">Royal Basket</span></div>
           <p className="text-[8px] font-bold tracking-widest uppercase text-gray-500">Premium Dryfruit Store</p>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-50">
         <button onClick={() => router.push('/payment')} className="w-full bg-[#5C3A21] text-white rounded-xl py-4 px-5 flex items-center justify-between shadow-md active:scale-95 transition">
            <span className="text-lg font-black">₹{total}</span>
            <span className="text-sm font-extrabold flex items-center gap-1">Proceed to Payment <ChevronRight className="h-5 w-5" /></span>
         </button>
      </div>
    </div>
  );
}
