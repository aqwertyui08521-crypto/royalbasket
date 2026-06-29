"use client";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white p-6 text-black font-sans">
      <button onClick={() => router.back()} className="text-xl font-black mb-6">←</button>
      <h1 className="text-2xl font-black mb-6">Help & Support</h1>
      <div className="space-y-4">
        <a href="https://wa.me/919876543210" className="block bg-green-100 p-4 rounded-2xl font-bold text-green-800">💬 Chat on WhatsApp</a>
        <a href="tel:919876543210" className="block bg-brown-100 p-4 rounded-2xl font-bold text-[#5C3A21] border border-[#5C3A21]">📞 Call Us Now</a>
      </div>
    </div>
  );
}
