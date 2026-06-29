"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  // কাস্টমার সাপোর্টের নম্বর (আপনি পরে চেঞ্জ করে নেবেন)
  const supportPhone = "+919876543210";
  const whatsappMsg = "Hello Royal Basket, I need some help with my order.";

  const faqs = [
    {
      q: "How can I track my order?",
      a: "You can easily track your live order status by going to the 'Track Order' page from the Home screen after placing an order."
    },
    {
      q: "What is your return & refund policy?",
      a: "We offer a 7-day easy return policy for damaged or incorrect items. Refunds are processed within 3-5 working days directly to your original payment method."
    },
    {
      q: "Are my UPI payments safe?",
      a: "Absolutely! We use highly secured, encrypted banking channels. Your payment details are 100% safe and verified."
    },
    {
      q: "Can I cancel my order?",
      a: "Orders can only be cancelled before they are shipped. Once the order is out for delivery, cancellation is not possible."
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // মেসেজ সেন্ড হওয়ার সুন্দর পপ-আপ
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    // ফর্ম ক্লিয়ার করার জন্য e.target.reset() ব্যবহার করতে পারেন
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-black pb-24 relative">
      
      {/* 🚀 Beautiful Toast Notification 🚀 */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-[#198754] text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 font-black text-sm transition-all duration-300">
          <span className="text-lg">✅</span> Message Sent Successfully!
        </div>
      )}

      {/* Header */}
      <div className="bg-white sticky top-0 z-40 px-4 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.push('/')} className="p-1 active:scale-90 transition-transform">
          <span className="text-xl font-bold">←</span>
        </button>
        <div>
          <h1 className="font-extrabold text-lg leading-tight text-[#4A2C11]">Help & Support</h1>
          <p className="text-xs text-gray-500 font-medium">We are here to help you</p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#FDFBF9] rounded-full flex items-center justify-center text-3xl border border-[#f5e6de] shrink-0">
            🎧
          </div>
          <div>
            <h2 className="font-black text-lg text-gray-900 leading-tight mb-1">Hello there!</h2>
            <p className="text-xs font-medium text-gray-500">How can we assist you today? Choose an option below.</p>
          </div>
        </div>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(whatsappMsg)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#25D366]/10 border border-[#25D366]/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 active:scale-95 transition-transform"
          >
            <span className="text-3xl">💬</span>
            <span className="font-extrabold text-[11px] text-[#1da851] uppercase tracking-wider">WhatsApp Us</span>
          </a>
          <a 
            href={`tel:${supportPhone}`}
            className="bg-[#5C3A21]/10 border border-[#5C3A21]/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 active:scale-95 transition-transform"
          >
            <span className="text-3xl">📞</span>
            <span className="font-extrabold text-[11px] text-[#5C3A21] uppercase tracking-wider">Call Support</span>
          </a>
        </div>

        {/* FAQs Section */}
        <div>
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest px-2 mb-3">Frequently Asked Questions</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0">
                <button 
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left p-4 flex justify-between items-center bg-white active:bg-gray-50 transition-colors"
                >
                  <span className={`font-extrabold text-sm pr-4 ${activeFaq === index ? 'text-[#5C3A21]' : 'text-gray-800'}`}>
                    {faq.q}
                  </span>
                  <span className={`text-lg font-bold text-gray-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-45 text-[#5C3A21]' : ''}`}>
                    +
                  </span>
                </button>
                
                {/* Accordion Content */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ${activeFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="p-4 pt-0 text-xs font-medium text-gray-600 leading-relaxed bg-white">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Write to us Form */}
        <div>
          <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest px-2 mb-3">Write to us</h3>
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your Full Name" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20 focus:border-[#5C3A21]/30 transition-all" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  placeholder="Your Phone Number" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20 focus:border-[#5C3A21]/30 transition-all" 
                />
              </div>
              <div>
                <textarea 
                  placeholder="How can we help you?" 
                  rows={4}
                  required
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5C3A21]/20 focus:border-[#5C3A21]/30 transition-all resize-none" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-black text-sm active:scale-95 transition-transform flex justify-center items-center gap-2"
              >
                Send Message <span>✉️</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      <p className="text-xs text-center text-gray-400 font-bold mt-8">Secured by Royal Basket Support</p>
    </div>
  );
}