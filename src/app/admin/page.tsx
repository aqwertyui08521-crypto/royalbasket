"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function Admin() {
  const [upi, setUpi] = useState({ phonepe: "", paytm: "", generic: "" });

  useEffect(() => {
    supabase.from("store_settings").select("*").eq("id", 1).single().then(({data}) => {
       if(data) setUpi({ 
         phonepe: data.phonepe_upi || "", 
         paytm: data.paytm_upi || "", 
         generic: data.qr_code_url || "" 
       });
    });
  }, []);

  const save = async () => {
    const { error } = await supabase.from("store_settings").upsert({ 
      id: 1, 
      phonepe_upi: upi.phonepe, 
      paytm_upi: upi.paytm, 
      qr_code_url: upi.generic 
    });
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Payment Options Saved Successfully!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans text-black">
      <h1 className="font-black text-2xl mb-6 uppercase">Admin Panel</h1>
      <div className="bg-white p-6 rounded-3xl shadow-sm max-w-lg mb-8 border">
        <h2 className="font-black mb-4 uppercase">Set Payment Options</h2>
        
        <label className="block text-xs font-bold text-gray-500 mb-1">PHONEPE UPI</label>
        <input className="w-full border-2 border-gray-200 p-4 rounded-xl mb-4 font-bold" placeholder="example@ybl" value={upi.phonepe} onChange={e=>setUpi({...upi, phonepe: e.target.value})}/>
        
        <label className="block text-xs font-bold text-gray-500 mb-1">PAYTM UPI</label>
        <input className="w-full border-2 border-gray-200 p-4 rounded-xl mb-4 font-bold" placeholder="example@paytm" value={upi.paytm} onChange={e=>setUpi({...upi, paytm: e.target.value})}/>
        
        <label className="block text-xs font-bold text-gray-500 mb-1">OTHER UPI (GPay, BHIM)</label>
        <input className="w-full border-2 border-gray-200 p-4 rounded-xl mb-4 font-bold" placeholder="example@upi" value={upi.generic} onChange={e=>setUpi({...upi, generic: e.target.value})}/>
        
        <button onClick={save} className="w-full bg-[#5C3A21] text-white p-4 rounded-xl font-black uppercase mt-2">Save All</button>
      </div>
    </div>
  );
}
