"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, MapPin, Headset, MessageCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function SupportPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    const fetchSetts = async () => {
      const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
      const { data } = await supabase.from("store_settings").select("*").eq("id", 1).single();
      if(data) setSettings(data);
    };
    fetchSetts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 px-4 h-14 flex items-center gap-3 border-b"><button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full"><ArrowLeft className="h-5 w-5"/></button><h1 className="text-lg font-black">Support</h1></header>
      <main className="p-4 space-y-4">
         <div className="bg-white p-6 rounded-2xl shadow-sm border text-center"><div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3"><Headset className="h-8 w-8 text-[#5C3A21]" /></div><h2 className="text-xl font-black mb-1">We're here to help!</h2></div>
         <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <a href={`https://wa.me/${settings.support_phone?.replace(/\D/g,'')}`} target="_blank" className="p-4 border-b flex items-center gap-4 active:bg-gray-50 transition"><div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center"><MessageCircle className="h-5 w-5 text-green-600" /></div><div><h3 className="font-bold text-sm">WhatsApp Chat</h3><p className="text-[10px] text-gray-500">{settings.support_phone || 'Loading...'}</p></div></a>
            <a href={`tel:${settings.support_phone}`} className="p-4 flex items-center gap-4 active:bg-gray-50 transition"><div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center"><Phone className="h-5 w-5 text-blue-600" /></div><div><h3 className="font-bold text-sm">Call Us</h3><p className="text-[10px] text-gray-500">{settings.support_phone || 'Loading...'}</p></div></a>
         </div>
         <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><MapPin className="h-4 w-4 text-[#5C3A21]"/> Store Location</h3>
            <p className="text-xs text-gray-600 whitespace-pre-line">{settings.store_address || 'Loading address...'}</p>
         </div>
      </main>
    </div>
  );
}
