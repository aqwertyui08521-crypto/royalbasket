"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", room: "", village: "", locality: "", pincode: "" });

  useEffect(() => {
    const saved = localStorage.getItem("saved_address");
    if (saved) { setAddress(JSON.parse(saved)); setStep(2); }
  }, []);

  const saveAddress = () => {
    localStorage.setItem("saved_address", JSON.stringify(address));
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-black">
      {step === 1 ? (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
          <h1 className="text-xl font-black mb-6 uppercase">Delivery Address</h1>
          <div className="space-y-4">
            {["name", "phone", "room", "village", "locality", "pincode"].map((f) => (
              <input key={f} placeholder={f.toUpperCase()} className="w-full bg-gray-100 p-4 rounded-xl font-bold border-none" 
                     value={address[f as keyof typeof address]} onChange={(e) => setAddress({...address, [f]: e.target.value})} />
            ))}
            <button onClick={saveAddress} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-black uppercase tracking-widest">Continue</button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl shadow-xl border-t-4 border-[#5C3A21] -mt-2">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-black text-lg">Checkout</h1>
              <button onClick={() => setStep(1)} className="text-xs font-black text-[#5C3A21] underline">Change</button>
            </div>
            <div className="bg-gray-200 p-4 rounded-2xl font-bold text-sm text-gray-700">
              <p>{address.name} | {address.phone}</p>
              <p>{address.room}, {address.village}, {address.locality} - {address.pincode}</p>
            </div>
          </div>
          <button className="w-full bg-[#5C3A21] text-white py-4 rounded-2xl font-black uppercase shadow-lg">Place Order</button>
        </div>
      )}
    </div>
  );
}
