"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, ShieldCheck, QrCode, CreditCard, Info } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  return (
    <div className="min-h-screen bg-[#F5F7F9] pb-28 font-sans text-black">
      <header className="bg-white px-4 h-14 flex items-center shadow-sm sticky top-0 z-40">
        <button onClick={() => router.back()} className="mr-3"><ArrowLeft className="h-6 w-6"/></button>
        <h1 className="text-lg font-black">{step === 1 ? 'Delivery Address' : 'Payment Options'}</h1>
      </header>
      <main className="p-4 space-y-4">
        {step === 1 ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm">
            <input type="text" placeholder="Full Name" className="w-full border-b p-3 mb-2 font-black"/>
            <input type="tel" placeholder="Mobile Number" className="w-full border-b p-3 mb-2 font-black"/>
            <input type="text" placeholder="Address" className="w-full border-b p-3 mb-4 font-black"/>
            <button onClick={() => setStep(2)} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-black uppercase">PROCEED</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#F4FAFE] p-4 rounded-xl flex gap-3 border border-[#E1F0FA]">
              <Truck className="h-8 w-8 text-[#5C3A21]"/>
              <div><p className="font-black">Free delivery applied!</p><p className="text-xs font-bold text-[#5C3A21]">You saved on this order</p></div>
            </div>
            <h3 className="text-[11px] font-black uppercase text-gray-500">Recommended UPI Options</h3>
            <div className="bg-white p-4 rounded-2xl border-2 border-[#5C3A21] flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="h-10 w-10 bg-[#5E2B97] rounded-lg text-white font-black flex items-center justify-center">पे</div><div><p className="font-black text-sm">PhonePe</p><p className="text-[10px] font-bold text-gray-500">Android native PhonePe payment</p></div></div>
              <div className="h-5 w-5 rounded-full border-2 border-[#5C3A21] flex items-center justify-center"><div className="h-2.5 w-2.5 bg-[#5C3A21] rounded-full"></div></div>
            </div>
            <div className="bg-white p-4 rounded-2xl border flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="h-10 w-10 bg-[#002970] rounded-lg text-white font-black text-[10px] flex items-center justify-center">Paytm</div><div><p className="font-black text-sm">Paytm UPI</p><p className="text-[10px] font-bold text-gray-500">UPI payment option available</p></div></div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-2">
               <div className="flex justify-between font-bold text-sm"><span>Item Total</span><span>₹2547</span></div>
               <div className="flex justify-between font-black text-lg pt-2 border-t"><span>To Pay</span><span>₹2547</span></div>
            </div>
            <button className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-black uppercase">PAY SECURELY ₹2547</button>
          </div>
        )}
      </main>
    </div>
  );
}
