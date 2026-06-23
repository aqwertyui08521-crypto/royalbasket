"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // কার্টের ডেটা পড়ে সেটাকে "Recent Order" হিসেবে সেভ করা হচ্ছে
    const savedCart = localStorage.getItem("royal_cart");
    if (savedCart) {
      const newId = "RB-" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(newId);
      localStorage.setItem("royal_recent_order", JSON.stringify({
        id: newId,
        items: JSON.parse(savedCart),
        total: localStorage.getItem("cartTotal") || "0",
        date: new Date().toISOString()
      }));
    }

    // অর্ডার সেভ হয়ে গেলে কার্ট ক্লিয়ার করে দেওয়া হচ্ছে
    localStorage.removeItem("royal_cart");
    localStorage.removeItem("cartTotal");
    window.dispatchEvent(new Event("storage"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
       <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-[scaleIn_0.4s_ease-out]">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
       </div>
       <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed!</h1>
       {orderId && <p className="text-sm font-bold text-[#5C3A21] mb-2">Order ID: {orderId}</p>}
       <p className="text-sm text-gray-500 font-medium mb-10 max-w-[280px]">Thank you for shopping with Royal Basket. Your premium dry fruits are on the way.</p>
       
       <button onClick={() => router.push('/track')} className="w-full max-w-[300px] bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-md active:scale-95 transition mb-3">
         Track Order <ChevronRight className="h-5 w-5" />
       </button>
       <button onClick={() => router.push('/')} className="w-full max-w-[300px] bg-white text-[#5C3A21] border border-[#5C3A21] font-extrabold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 active:scale-95 transition">
         Continue Shopping
       </button>
    </div>
  );
}
