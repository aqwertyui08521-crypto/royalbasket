"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function PaymentPage() {
  const router = useRouter();
  const [upi, setUpi] = useState({ phonepe: "", paytm: "", generic: "" });
  const [selectedPayment, setSelectedPayment] = useState("");
  const [amount, setAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);

  useEffect(() => {
    // ১. চেকআউট পেজ থেকে দাম লোড করা হচ্ছে
    const total = localStorage.getItem("checkout_total");
    const savings = localStorage.getItem("checkout_savings");
    if (total) setAmount(Number(total));
    if (savings) setSavedAmount(Number(savings));

   // ২. অ্যাডমিন প্যানেল থেকে UPI সেটিংস আনা হচ্ছে (সঠিক payment_settings টেবিল থেকে)
    supabase.from("payment_settings").select("*").eq("id", 1).single().then(({data}) => {
       if(data) {
           setUpi({ 
             phonepe: data.phonepe || "", 
             paytm: data.paytm || "", 
             generic: data.other_upi || "" 
           });
           // ডিফল্টভাবে প্রথম যেই অপশনটা থাকবে সেটা সিলেক্ট করে রাখা
           if(data.phonepe) setSelectedPayment("phonepe");
           else if(data.paytm) setSelectedPayment("paytm");
           else if(data.other_upi) setSelectedPayment("generic");
       }
    });
  }, []);

  const handlePay = () => {
    if (!selectedPayment) return alert("Please select a payment option");
    
    let upiId = "";
    if (selectedPayment === "phonepe") upiId = upi.phonepe;
    if (selectedPayment === "paytm") upiId = upi.paytm;
    if (selectedPayment === "generic") upiId = upi.generic;

    if (upiId && amount > 0) {
      const upiLink = `upi://pay?pa=${upiId}&pn=RoyalBasket&am=${amount}.00&cu=INR`;
      window.location.href = upiLink;
    } else {
        alert("Payment settings missing or cart empty!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-black pb-28">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.back()} className="p-1"><span className="text-xl font-bold">←</span></button>
        <div>
          <h1 className="font-extrabold text-lg leading-tight">Payment Options</h1>
          <p className="text-xs text-gray-500 font-medium">TO PAY: ₹{amount}</p>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-3">
        {/* Free Delivery Banner */}
        <div className="bg-[#EAF3EE] p-3 rounded-2xl flex items-center gap-3 border border-green-100">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">🚚</div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-800">Free delivery applied!</h3>
            {savedAmount > 0 && <p className="text-xs text-[#7A401A] font-bold">You saved ₹{savedAmount} on this order</p>}
          </div>
        </div>

        {/* Bank & Wallet Offers (Visual Only) */}
        <div className="bg-white p-4 rounded-3xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-extrabold text-sm flex items-center gap-2"><span>🏷️</span> Bank & Wallet Offers</h2>
            <span className="text-[10px] font-bold text-[#7A401A]">View All</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="min-w-[200px] border border-gray-200 rounded-xl p-3 flex gap-3 items-center bg-gray-50/50">
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[8px] font-bold text-blue-500 bg-white">UPI</div>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">Eligible UPI offers, if any, are shown by your payment app.</p>
            </div>
            <div className="min-w-[200px] border border-gray-200 rounded-xl p-3 flex gap-3 items-center bg-gray-50/50">
              <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-red-500 bg-white text-xs">💳</div>
              <p className="text-[10px] text-gray-600 font-medium leading-tight">10% instant discount on Credit Cards.</p>
            </div>
          </div>
        </div>

        {/* RECOMMENDED UPI OPTIONS */}
        <div>
          <h2 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest px-2 mb-3">Recommended UPI Options</h2>
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
            
            {/* PhonePe */}
            {upi.phonepe && (
              <div onClick={() => setSelectedPayment('phonepe')} className={`p-4 flex items-center justify-between border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${selectedPayment === 'phonepe' ? 'bg-[#FDFBF9]' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#5E2B97] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">पे</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm text-gray-800">PhonePe</p>
                      <span className="bg-[#F8EFE9] text-[#7A401A] text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">⚡ Fast</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 mt-0.5">Android native PhonePe payment</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'phonepe' ? 'border-[#7A401A]' : 'border-gray-300'}`}>
                  {selectedPayment === 'phonepe' && <div className="w-2.5 h-2.5 bg-[#7A401A] rounded-full"></div>}
                </div>
              </div>
            )}

            {/* Paytm */}
            {upi.paytm && (
              <div onClick={() => setSelectedPayment('paytm')} className={`p-4 flex items-center justify-between border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${selectedPayment === 'paytm' ? 'bg-[#FDFBF9]' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#002970] rounded-xl flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm">Paytm</div>
                  <div>
                    <p className="font-extrabold text-sm text-gray-800">Paytm UPI</p>
                    <p className="text-[10px] font-medium text-gray-500 mt-0.5">UPI payment option available</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'paytm' ? 'border-[#7A401A]' : 'border-gray-300'}`}>
                  {selectedPayment === 'paytm' && <div className="w-2.5 h-2.5 bg-[#7A401A] rounded-full"></div>}
                </div>
              </div>
            )}

            {/* Any UPI */}
            {upi.generic && (
              <div onClick={() => setSelectedPayment('generic')} className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${selectedPayment === 'generic' ? 'bg-[#FDFBF9]' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00BFA5] rounded-xl flex items-center justify-center text-white font-extrabold text-[12px] shadow-sm">UPI</div>
                  <div>
                    <p className="font-extrabold text-sm text-gray-800">Other UPI Apps</p>
                    <p className="text-[10px] font-medium text-gray-500 mt-0.5">GPay, BHIM, Cred, etc.</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'generic' ? 'border-[#7A401A]' : 'border-gray-300'}`}>
                  {selectedPayment === 'generic' && <div className="w-2.5 h-2.5 bg-[#7A401A] rounded-full"></div>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OTHER OPTIONS */}
        <div>
          <h2 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest px-2 mb-3">Other Options</h2>
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 flex items-center gap-4 border-b border-gray-100 opacity-50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">💳</div>
              <div>
                <p className="font-extrabold text-sm text-gray-800">Credit / Debit Card</p>
                <p className="text-[10px] font-medium text-gray-500">Temporarily unavailable</p>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl">💵</div>
              <div>
                <p className="font-extrabold text-sm text-gray-800">Pay on Delivery</p>
                <p className="text-[10px] font-medium text-gray-500">Not available for this order</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-extrabold text-sm mb-4">Bill Details</h2>
          <div className="space-y-2 text-xs font-medium text-gray-600">
            <div className="flex justify-between"><span>Item Total</span><span>₹{(amount + savedAmount).toFixed(0)}</span></div>
            <div className="flex justify-between text-[#7A401A] font-bold"><span>Product Savings</span><span>- ₹{savedAmount}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span className="text-[#7A401A] font-bold">FREE</span></div>
          </div>
          <div className="border-t border-dashed border-gray-300 my-4"></div>
          <div className="flex justify-between font-extrabold text-base text-black">
            <span>To Pay</span><span>₹{amount}</span>
          </div>
          
          {/* Cancellation Policy */}
          <div className="bg-gray-50 p-3 rounded-xl mt-5 flex gap-2 border border-gray-100">
            <span className="text-gray-400 text-sm">ℹ️</span>
            <p className="text-[9px] text-gray-500 font-medium leading-relaxed">
              <strong className="text-gray-700">Cancellation Policy:</strong> Orders cannot be cancelled once packed for delivery. In case of unexpected delays, refund will be provided, if applicable.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1 mt-4">
            <span className="text-[#7A401A] text-xs">🛡️</span>
            <span className="text-[10px] font-extrabold text-gray-500">100% Secure Payments</span>
          </div>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
        <button onClick={handlePay} className="w-full bg-[#5C3A21] text-white h-14 rounded-xl font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-[#5C3A21]/30 active:scale-[0.98] transition-transform text-lg">
          Pay securely ₹{amount}
        </button>
      </div>
    </div>
  );
}
