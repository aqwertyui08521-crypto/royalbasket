"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminDashboard() {
  const router = useRouter();
  const [upi, setUpi] = useState({ phonepe: "", paytm: "", generic: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // আগের মতোই পেমেন্ট সেটিং লোড হচ্ছে
    supabase.from("store_settings").select("*").eq("id", 1).single().then(({data}) => {
       if(data) {
         setUpi({ 
           phonepe: data.phonepe_upi || "", 
           paytm: data.paytm_upi || "", 
           generic: data.qr_code_url || "" 
         });
       }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    // আগের মতোই পেমেন্ট সেটিং সেভ হচ্ছে
    const { error } = await supabase
      .from("store_settings")
      .update({ 
        phonepe_upi: upi.phonepe, 
        paytm_upi: upi.paytm, 
        qr_code_url: upi.generic 
      })
      .eq("id", 1);
      
    setLoading(false);
    if (error) alert("Error: " + error.message);
    else alert("Payment Options Saved Successfully!");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 md:p-6 font-sans text-gray-900 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Dashboard Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your store settings and products</p>
          </div>
        </div>

        {/* 🆕 Navigation Menu (এখানেই আমরা দরজা তৈরি করলাম) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/products" className="bg-[#5C3A21] text-white p-5 rounded-2xl shadow-md shadow-[#5C3A21]/20 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="text-3xl">📦</span>
            <span className="font-bold text-sm tracking-wide">Products</span>
          </Link>
          
          <div className="bg-[#F8EFE9] border-2 border-[#5C3A21] text-[#5C3A21] p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 cursor-default">
            <span className="text-3xl">💳</span>
            <span className="font-bold text-sm tracking-wide">Payments</span>
          </div>
          
          <div className="bg-white border border-gray-200 text-gray-400 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-60">
            <span className="text-3xl">🛒</span>
            <span className="font-bold text-sm">Orders (Soon)</span>
          </div>
          
          <div className="bg-white border border-gray-200 text-gray-400 p-5 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-60">
            <span className="text-3xl">⚙️</span>
            <span className="font-bold text-sm">Settings</span>
          </div>
        </div>

        {/* Existing Payment Settings Form (একদম আগের মতো) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-6">
          <h2 className="text-lg font-extrabold mb-6 text-gray-800">Set Payment Options</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">PhonePe UPI</label>
              <input className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-200 outline-none focus:bg-white focus:border-[#5C3A21] transition-colors" value={upi.phonepe} onChange={(e) => setUpi({...upi, phonepe: e.target.value})} placeholder="e.g. number@ybl" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Paytm UPI</label>
              <input className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-200 outline-none focus:bg-white focus:border-[#5C3A21] transition-colors" value={upi.paytm} onChange={(e) => setUpi({...upi, paytm: e.target.value})} placeholder="e.g. number@paytm" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Any Other UPI (GPay/BHIM)</label>
              <input className="w-full bg-gray-50 p-4 rounded-xl font-bold border border-gray-200 outline-none focus:bg-white focus:border-[#5C3A21] transition-colors" value={upi.generic} onChange={(e) => setUpi({...upi, generic: e.target.value})} placeholder="e.g. name@upi" />
            </div>
            
            <button onClick={handleSave} disabled={loading} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-black mt-4 tracking-wide uppercase shadow-lg shadow-[#5C3A21]/30 active:scale-[0.98] transition-transform">
              {loading ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
