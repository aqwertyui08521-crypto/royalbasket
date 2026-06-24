"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Truck, CreditCard, Star, Info, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  
  useEffect(() => {
    const savedAddress = localStorage.getItem("saved_address");
    if (savedAddress) setAddress(JSON.parse(savedAddress));
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-24">
      <header className="bg-white px-4 h-14 flex items-center shadow-sm sticky top-0 z-40">
        <button onClick={() => router.back()} className="mr-4"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-lg font-black">{step === 1 ? 'Delivery Address' : 'Payment Options'}</h1>
      </header>

      <main className="p-4 space-y-4">
        {step === 1 ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <input type="text" placeholder="Full Name" value={address.name} onChange={e=>setAddress({...address, name:e.target.value})} className="w-full border-b p-3 mb-2 font-bold" />
            <input type="tel" placeholder="Mobile Number" value={address.phone} onChange={e=>setAddress({...address, phone:e.target.value})} className="w-full border-b p-3 mb-2 font-bold" />
            <input type="text" placeholder="Address" value={address.street} onChange={e=>setAddress({...address, street:e.target.value})} className="w-full border-b p-3 mb-2 font-bold" />
            <button onClick={() => { localStorage.setItem("saved_address", JSON.stringify(address)); setStep(2); }} className="w-full bg-[#523220] text-white py-4 rounded-xl font-black mt-4 uppercase">PROCEED</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 items-center">
              <Truck className="h-10 w-10 text-[#523220]" />
              <div><p className="font-black">Free delivery applied!</p><p className="text-xs text-gray-500 font-bold">You saved on this order</p></div>
            </div>
            
            <h3 className="text-xs font-black text-gray-500 uppercase">Recommended UPI Options</h3>
            <div className="bg-white p-4 rounded-2xl border-2 border-[#523220] flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="h-10 w-10 bg-[#5E2B97] rounded-lg flex items-center justify-center text-white font-black">पे</div><div><p className="font-black text-sm">PhonePe</p><p className="text-[10px] font-bold text-gray-500">Android native PhonePe payment</p></div></div>
              <div className="h-5 w-5 rounded-full border-2 border-[#523220] flex items-center justify-center"><div className="h-2.5 w-2.5 bg-[#523220] rounded-full"></div></div>
            </div>

            <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center">
              <div className="flex items-center gap-3"><div className="h-10 w-10 bg-[#002970] rounded-lg flex items-center justify-center text-white font-black text-xs">Paytm</div><div><p className="font-black text-sm">Paytm UPI</p><p className="text-[10px] font-bold text-gray-500">UPI payment option available</p></div></div>
              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mt-6">
              <div className="flex justify-between font-bold text-sm mb-2"><span>Item Total</span><span>₹2547</span></div>
              <div className="flex justify-between font-black text-lg pt-2 border-t"><span>To Pay</span><span>₹2547</span></div>
            </div>

            <button className="w-full bg-[#523220] text-white py-4 rounded-xl font-black uppercase">PAY SECURELY ₹2547</button>
          </div>
        )}
      </main>
    </div>
  );
}
