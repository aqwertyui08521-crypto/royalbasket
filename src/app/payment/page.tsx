"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-bold text-gray-900 tracking-tight">Checkout</h1>
      </header>
      <div className="p-4 mt-10">
         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-4 border-b pb-2">Select Payment Method</h2>
            <div className="flex items-center gap-3 p-4 border border-green-500 bg-green-50 rounded-xl cursor-pointer">
               <CheckCircle2 className="h-5 w-5 text-green-600" />
               <span className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</span>
            </div>
         </div>
         <button onClick={() => router.push('/success')} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg shadow-md active:scale-95 transition">
            Place Order Now
         </button>
      </div>
    </div>
  );
}
