"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", room: "", village: "", locality: "", pincode: "" });

  useEffect(() => {
    const saved = localStorage.getItem("saved_address");
    if (saved) {
      setAddress(JSON.parse(saved));
      setStep(2);
    }
  }, []);

  const saveAddress = () => {
    if(!address.name || !address.phone) return alert("Please fill details");
    localStorage.setItem("saved_address", JSON.stringify(address));
    setStep(2);
  };

  if (step === 1) return (
    <div className="min-h-screen bg-white text-black p-6 font-sans">
      <h1 className="text-xl font-black uppercase mb-6 border-b border-black pb-2">Delivery Address</h1>
      <div className="space-y-4">
        <input placeholder="FULL NAME" className="w-full border-2 border-black p-4 font-bold text-black placeholder-black" value={address.name} onChange={(e) => setAddress({...address, name: e.target.value})} />
        <input placeholder="PHONE NUMBER" className="w-full border-2 border-black p-4 font-bold text-black placeholder-black" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} />
        <input placeholder="ROOM / HOUSE NO" className="w-full border-2 border-black p-4 font-bold text-black placeholder-black" value={address.room} onChange={(e) => setAddress({...address, room: e.target.value})} />
        <input placeholder="VILLAGE" className="w-full border-2 border-black p-4 font-bold text-black placeholder-black" value={address.village} onChange={(e) => setAddress({...address, village: e.target.value})} />
        <input placeholder="LOCALITY / AREA" className="w-full border-2 border-black p-4 font-bold text-black placeholder-black" value={address.locality} onChange={(e) => setAddress({...address, locality: e.target.value})} />
        <input placeholder="PINCODE" className="w-full border-2 border-black p-4 font-bold text-black placeholder-black" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} />
        <button onClick={saveAddress} className="w-full bg-black text-white py-5 font-black uppercase tracking-widest">Continue</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black p-6 font-sans">
      <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
        <h1 className="text-xl font-black uppercase">Checkout</h1>
        <button onClick={() => setStep(1)} className="text-xs font-black underline uppercase">Change Address</button>
      </div>
      <div className="mb-6 p-4 border-2 border-black font-bold text-sm">
        <p className="text-[10px] uppercase font-black text-gray-500 mb-1">Deliver to:</p>
        <p>{address.name} | {address.phone}</p>
        <p>{address.room}, {address.village}, {address.locality} - {address.pincode}</p>
      </div>
      <button className="w-full bg-black text-white py-5 font-black uppercase tracking-widest">Place Order</button>
    </div>
  );
}
