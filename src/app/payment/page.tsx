"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, Banknote, ShieldCheck, CheckCircle2, Smartphone } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function PaymentPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [userAddress, setUserAddress] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data } = await supabase.from("payment_settings").select("*").eq("is_enabled", true).order("id");
      if (data && data.length > 0) {
        setPaymentMethods(data);
        setSelectedMethod(data[0].method_name);
      }

      const savedTotal = localStorage.getItem("cartTotal") || "0";
      setTotalAmount(Number(savedTotal));

      // লোকাল স্টোরেজ থেকে ঠিকানা নিয়ে আসা
      const savedAddress = localStorage.getItem("deliveryAddress");
      if (savedAddress) setUserAddress(JSON.parse(savedAddress));
      
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handlePayment = () => {
    if (selectedMethod === 'Razorpay' || selectedMethod === 'UPI') {
       alert("Real UPI/Card Payment gateway will open here (Requires Razorpay API keys to be added from Admin panel). For now, simulating success!");
    }
    
    setOrderPlaced(true);
    setTimeout(() => {
      localStorage.removeItem("cartTotal"); // অর্ডার কনফার্ম হলে কার্ট ফাঁকা হবে
      router.push("/");
    }, 3500);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[32px] shadow-xl flex flex-col items-center text-center animate-[scaleIn_0.3s_ease-out] w-full max-w-sm">
          <CheckCircle2 className="h-24 w-24 text-green-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 text-sm mb-6">Your order has been successfully placed via <span className="font-bold text-gray-800">{selectedMethod}</span>.</p>
          <div className="text-xs font-bold text-gray-400 flex items-center gap-2">
            <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full"></div> 
            Redirecting to home...
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-800"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-28 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 h-14 flex items-center gap-3">
        <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition">
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">Checkout</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Dynamic Delivery Address */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-800"></div>
          <div className="flex justify-between items-start mb-2 pl-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-800" />
              <h3 className="font-bold text-sm text-gray-900">Delivery Address</h3>
            </div>
            {/* Change বাটনে ক্লিক করলে অ্যাড্রেস পেজে ফেরত যাবে */}
            <button onClick={() => router.push("/address")} className="text-amber-600 text-xs font-extrabold bg-amber-50 px-2 py-1 rounded active:scale-95 transition">Change</button>
          </div>
          <div className="pl-8 text-xs text-gray-600 space-y-1 mt-2">
            <p className="font-extrabold text-gray-900 text-sm">{userAddress?.name || "Customer Name"}</p>
            <p className="line-clamp-2">{userAddress?.addressDetails || "No address provided"}</p>
            <p>PIN: {userAddress?.pin || "N/A"}</p>
            <p className="pt-1.5 font-bold text-gray-800">Mobile: {userAddress?.phone || "N/A"}</p>
          </div>
        </div>

        {/* Dynamic Payment Options */}
        <div>
          <h3 className="font-extrabold text-sm text-gray-900 mb-3 px-1">Select Payment Method</h3>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} onClick={() => setSelectedMethod(method.method_name)} className={`bg-white p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.98] ${selectedMethod === method.method_name ? 'border-amber-800 bg-amber-50/30' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl shadow-sm ${selectedMethod === method.method_name ? 'bg-amber-800 text-white' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                    {method.method_name === 'COD' && <Banknote className="h-5 w-5" />}
                    {method.method_name === 'UPI' && <Smartphone className="h-5 w-5" />}
                    {(method.method_name !== 'COD' && method.method_name !== 'UPI') && <CreditCard className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">{method.method_name === 'Razorpay' ? 'Cards, UPI & Netbanking' : method.method_name}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">{method.method_name === 'COD' ? 'Pay cash upon delivery' : '100% Secure online payment'}</p>
                  </div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMethod === method.method_name ? 'border-amber-800' : 'border-gray-300'}`}>
                  {selectedMethod === method.method_name && <div className="h-2.5 w-2.5 rounded-full bg-amber-800 scale-in-center"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green-50 text-green-800 text-[10px] font-bold py-3 px-4 text-center rounded-xl flex justify-center items-center gap-1.5 border border-green-100">
          <ShieldCheck className="h-4 w-4" /> 100% SECURE & ENCRYPTED PAYMENTS
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-50 rounded-t-3xl">
        <div className="flex justify-between items-center mb-3.5 px-2">
          <span className="text-gray-500 text-xs font-bold">Total Payable</span>
          <span className="text-2xl font-black text-gray-900">₹{totalAmount}</span>
        </div>
        <button onClick={handlePayment} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-[#4a2e1a] active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(92,58,33,0.3)]">
          {selectedMethod === 'COD' ? 'Confirm Order' : `Pay ₹${totalAmount}`}
        </button>
      </div>
    </div>
  );
}
