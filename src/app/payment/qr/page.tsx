"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ScanLine, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function QRPaymentPage() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [qrImage, setQrImage] = useState("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=yourupi@ybl&pn=RoyalBasket&cu=INR"); // Default QR

  useEffect(() => {
    const savedTotal = localStorage.getItem("cartTotal");
    if (savedTotal) setTotal(parseInt(savedTotal));
    
    // অ্যাডমিন প্যানেল থেকে সেট করা QR Code থাকলে সেটা দেখাবে
    const adminQr = localStorage.getItem("admin_qr_code");
    if (adminQr) setQrImage(adminQr);
  }, []);

  const handlePaymentDone = () => {
    // পেমেন্ট হয়ে গেলে success পেজে যাবে
    router.push('/success');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">Scan & Pay</h1>
         </div>
      </header>

      <main className="p-5 flex flex-col items-center justify-center mt-6">
         <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 w-full max-w-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#5C3A21]"></div>
            
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 mt-2">Amount to Pay</h2>
            <div className="text-4xl font-black text-[#5C3A21] mb-8">₹{total}</div>

            <div className="relative bg-white p-3 rounded-2xl border-2 border-dashed border-[#EADBC8] shadow-sm mb-6">
               <img src={qrImage} alt="Payment QR Code" className="w-48 h-48 object-contain" />
               <div className="absolute -bottom-4 -right-4 bg-[#F4EFE6] p-2 rounded-full shadow-sm"><ScanLine className="h-6 w-6 text-[#5C3A21]" /></div>
            </div>

            <p className="text-xs font-bold text-gray-600 mb-6 px-4 leading-relaxed">
               Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code to complete your payment.
            </p>

            <button onClick={handlePaymentDone} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition">
               <CheckCircle2 className="h-5 w-5" /> I have made the payment
            </button>
         </div>

         <div className="flex justify-center items-center gap-1.5 mt-8 text-gray-500">
           <ShieldCheck className="h-4 w-4 text-[#8B5A2B]" />
           <span className="text-xs font-bold">100% Secure & Verified</span>
         </div>
      </main>
    </div>
  );
}
