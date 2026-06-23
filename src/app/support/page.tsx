"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, Headset, Clock } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-bold text-gray-900">Help & Support</h1>
      </header>

      <main className="p-4 space-y-4">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3"><Headset className="h-8 w-8 text-[#5C3A21]" /></div>
            <h2 className="text-xl font-black text-gray-900 mb-1">We're here to help!</h2>
            <p className="text-xs text-gray-500 font-medium">Any issues? Our support team is available from 9 AM to 9 PM.</p>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition">
               <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center shrink-0"><MessageCircle className="h-5 w-5 text-green-600" /></div>
               <div><h3 className="font-bold text-gray-900 text-sm">WhatsApp Chat</h3><p className="text-[10px] text-gray-500">Fastest response</p></div>
            </div>
            <div className="p-4 border-b border-gray-50 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition">
               <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0"><Phone className="h-5 w-5 text-blue-600" /></div>
               <div><h3 className="font-bold text-gray-900 text-sm">Call Us</h3><p className="text-[10px] text-gray-500">+91 9876543210</p></div>
            </div>
            <div className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition">
               <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center shrink-0"><Mail className="h-5 w-5 text-red-600" /></div>
               <div><h3 className="font-bold text-gray-900 text-sm">Email Support</h3><p className="text-[10px] text-gray-500">support@royalbasket.com</p></div>
            </div>
         </div>

         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-[#5C3A21]"/> Our Store Location</h3>
            <p className="text-xs text-gray-600 leading-relaxed">123, VIP Road, Near Airport<br/>Kolkata, West Bengal - 700052<br/>India</p>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500 font-medium">
               <Clock className="h-4 w-4 text-gray-400" /> Open Mon - Sat, 10:00 AM - 8:00 PM
            </div>
         </div>
      </main>
    </div>
  );
}
