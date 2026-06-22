"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";

export default function AddressPage() {
  const router = useRouter();
  const [address, setAddress] = useState({ name: "", phone: "", addressDetails: "", pin: "" });

  useEffect(() => {
    const saved = localStorage.getItem("deliveryAddress");
    if (saved) {
      setAddress(JSON.parse(saved));
    }
  }, []);

  const handleSaveAndProceed = () => {
    if (!address.name || !address.phone || !address.addressDetails || !address.pin) {
      alert("Please fill all the details!");
      return;
    }
    // লোকাল স্টোরেজে ঠিকানা সেভ করা হচ্ছে
    localStorage.setItem("deliveryAddress", JSON.stringify(address));
    router.push("/payment"); // সেভ হলে পেমেন্ট পেজে চলে যাবে
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 h-14 flex items-center gap-3">
        <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition">
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Delivery Address</h1>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <MapPin className="h-5 w-5" />
            <h2 className="font-extrabold text-gray-900">Enter your details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name</label>
              <input value={address.name} onChange={(e) => setAddress({...address, name: e.target.value})} type="text" placeholder="e.g. Rahul Das" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-600" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Mobile Number</label>
              <input value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} type="tel" placeholder="+91 9876543210" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-600" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Full Address (House No, Street, Area)</label>
              <textarea value={address.addressDetails} onChange={(e) => setAddress({...address, addressDetails: e.target.value})} rows={3} placeholder="123, VIP Road..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-600"></textarea>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">PIN Code</label>
              <input value={address.pin} onChange={(e) => setAddress({...address, pin: e.target.value})} type="number" placeholder="700052" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-600" />
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-50">
        <button onClick={handleSaveAndProceed} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-[#4a2e1a] active:scale-[0.98] transition-all">
          Save & Proceed <CheckCircle2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
