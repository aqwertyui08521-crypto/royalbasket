"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Truck, Package, CheckCircle2, MapPin } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setIsTracking(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-bold text-gray-900 tracking-tight">Track Order</h1>
      </header>

      <main className="p-4 space-y-5">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h2 className="text-sm font-bold text-gray-900 mb-1">Where is my order?</h2>
           <p className="text-[10px] text-gray-500 mb-4">Enter your tracking number or order ID below</p>
           <form onSubmit={handleTrack} className="flex gap-2">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
               <input type="text" placeholder="e.g. RB-102938" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5C3A21] focus:ring-1 focus:ring-[#5C3A21] font-medium transition" />
             </div>
             <button type="submit" className="bg-[#5C3A21] text-white font-bold px-5 py-2.5 rounded-xl text-sm active:scale-95 transition shadow-sm">Track</button>
           </form>
        </div>

        {isTracking && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Order ID</p><p className="text-sm font-black text-gray-900">{orderId.toUpperCase()}</p></div>
              <div className="text-right"><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Est. Delivery</p><p className="text-sm font-black text-green-600">Arriving in 2 Days</p></div>
            </div>

            {/* Tracking Timeline */}
            <div className="relative pl-6 space-y-6">
               <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-100"></div>
               <div className="absolute left-[11px] top-2 h-1/2 w-0.5 bg-green-500"></div>
               <div className="relative"><div className="absolute -left-6 bg-green-500 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10"><Package className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold text-gray-900 leading-tight">Order Placed</h4><p className="text-[10px] text-gray-500 mt-0.5">We have received your order.</p></div>
               <div className="relative"><div className="absolute -left-6 bg-green-500 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10"><CheckCircle2 className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold text-gray-900 leading-tight">Processing</h4><p className="text-[10px] text-gray-500 mt-0.5">Your items are being packed securely.</p></div>
               <div className="relative"><div className="absolute -left-6 bg-amber-500 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 animate-pulse"><Truck className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold text-amber-600 leading-tight">Shipped</h4><p className="text-[10px] text-gray-500 mt-0.5">Your package is on the way to your city.</p></div>
               <div className="relative opacity-40"><div className="absolute -left-6 bg-gray-200 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10"><MapPin className="h-3 w-3 text-gray-400" /></div><h4 className="text-sm font-bold text-gray-900 leading-tight">Delivered</h4><p className="text-[10px] text-gray-500 mt-0.5">Package will be handed over to you.</p></div>
            </div>

            {/* Order Details in Track Page */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Item Details</h3>
              <div className="flex items-center gap-3">
                 <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl border border-gray-100">🌰</div>
                 <div className="flex-1">
                   <h4 className="text-xs font-bold text-gray-900 leading-tight">Royal Basket Premium Combo</h4>
                   <p className="text-[10px] text-gray-500 mt-0.5">Qty: 1 • 1 Kg</p>
                 </div>
                 <div className="text-sm font-black text-[#5C3A21]">₹849</div>
              </div>
            </div>
          </div>
        )}

        {!isTracking && <div className="flex flex-col items-center justify-center py-10 opacity-50"><Truck className="h-16 w-16 text-gray-300 mb-3" /><p className="text-xs text-gray-400 font-medium text-center">Track your premium quality<br/>dry fruits delivery in real-time.</p></div>}
      </main>
    </div>
  );
}
