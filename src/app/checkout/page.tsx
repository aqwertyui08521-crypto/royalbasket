"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", room: "", village: "", locality: "", pincode: "" });
  const [upi, setUpi] = useState({ phonepe: "", paytm: "", generic: "" });
  
  const [selectedPayment, setSelectedPayment] = useState("");
  const [amount, setAmount] = useState(0); 

  useEffect(() => {
    // ১. অ্যাড্রেস লোড করা হচ্ছে
    const saved = localStorage.getItem("saved_address");
    if (saved) { setAddress(JSON.parse(saved)); setStep(2); }
    
    // ২. অ্যাডমিন প্যানেল থেকে UPI আনা হচ্ছে
    supabase.from("store_settings").select("*").eq("id", 1).single().then(({data}) => {
       if(data) setUpi({ 
         phonepe: data.phonepe_upi || "", 
         paytm: data.paytm_upi || "", 
         generic: data.qr_code_url || "" 
       });
    });

    // ৩. কার্ট থেকে ডায়নামিক প্রাইস হিসাব করা হচ্ছে
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      try {
        const items = JSON.parse(cartData);
        let total = 0;
        items.forEach((item: any) => {
          const itemPrice = Number(item.price || 0); // প্রোডাক্টের দাম
          const itemQty = Number(item.quantity || 1); // কয়টা প্রোডাক্ট নিয়েছে
          total += (itemPrice * itemQty);
        });
        setAmount(total); // অটোমেটিক টোটাল সেট হয়ে যাবে
      } catch (error) {
        console.error("Cart price calculation error");
      }
    }
  }, []);

  const saveAddress = () => { 
    if(!address.name || !address.phone) return alert("Please fill details");
    localStorage.setItem("saved_address", JSON.stringify(address)); 
    setStep(2); 
  };

  const handlePlaceOrder = () => {
    if (!selectedPayment) return alert("Please select a payment option first.");
    if (amount === 0) return alert("Your cart is empty!");
    
    let upiId = "";
    if (selectedPayment === "phonepe") upiId = upi.phonepe;
    if (selectedPayment === "paytm") upiId = upi.paytm;
    if (selectedPayment === "generic") upiId = upi.generic;

    if (upiId) {
      // ডায়নামিক প্রাইস am=${amount}.00 দিয়ে পাঠানো হচ্ছে
      const upiLink = `upi://pay?pa=${upiId}&pn=RoyalBasket&am=${amount}.00&cu=INR`;
      window.location.href = upiLink;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-black pb-24">
      {step === 1 ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <h1 className="text-xl font-black mb-6 uppercase">Delivery Address</h1>
          <div className="space-y-4">
            {["name", "phone", "room", "village", "locality", "pincode"].map((f) => (
              <input key={f} placeholder={f.toUpperCase()} className="w-full bg-gray-100 p-4 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-[#5C3A21]" value={address[f as keyof typeof address]} onChange={(e) => setAddress({...address, [f]: e.target.value})} />
            ))}
            <button onClick={saveAddress} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase">Continue</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-5">
              <h1 className="font-black text-2xl">Checkout</h1>
              <button onClick={() => setStep(1)} className="text-sm font-bold text-[#5C3A21] underline">Change</button>
            </div>
            <div className="bg-[#EAEBEF] p-5 rounded-2xl font-bold text-gray-800">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Deliver To:</p>
              <p className="text-lg">{address.name} | {address.pincode}</p>
              <p className="text-sm">{address.room}, {address.village}, {address.locality} - {address.phone}</p>
            </div>
          </div>
          
          <h2 className="text-xs font-black uppercase text-gray-500 px-2 mt-4">Payment Options</h2>

          {/* PhonePe */}
          {upi.phonepe && (
            <div onClick={() => setSelectedPayment('phonepe')} className={`bg-white p-4 rounded-[1.5rem] shadow-sm border-2 cursor-pointer flex items-center justify-between transition-all ${selectedPayment === 'phonepe' ? 'border-[#5C3A21] bg-[#FDFBF9]' : 'border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#5E2B97] rounded-xl flex items-center justify-center text-white font-black text-xl">पे</div>
                <div>
                  <p className="font-black text-lg">PhonePe</p>
                  <p className="text-[10px] font-bold text-gray-500">Pay via PhonePe app</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'phonepe' ? 'border-[#5C3A21]' : 'border-gray-300'}`}>
                {selectedPayment === 'phonepe' && <div className="w-2.5 h-2.5 bg-[#5C3A21] rounded-full"></div>}
              </div>
            </div>
          )}

          {/* Paytm */}
          {upi.paytm && (
            <div onClick={() => setSelectedPayment('paytm')} className={`bg-white p-4 rounded-[1.5rem] shadow-sm border-2 cursor-pointer flex items-center justify-between transition-all ${selectedPayment === 'paytm' ? 'border-[#5C3A21] bg-[#FDFBF9]' : 'border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#002970] rounded-xl flex items-center justify-center text-white font-black text-sm">Paytm</div>
                <div>
                  <p className="font-black text-lg">Paytm</p>
                  <p className="text-[10px] font-bold text-gray-500">Pay via Paytm app</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'paytm' ? 'border-[#5C3A21]' : 'border-gray-300'}`}>
                {selectedPayment === 'paytm' && <div className="w-2.5 h-2.5 bg-[#5C3A21] rounded-full"></div>}
              </div>
            </div>
          )}

          {/* Place Order Button */}
          <button onClick={handlePlaceOrder} className="w-full bg-[#5C3A21] text-white py-5 rounded-2xl font-black text-lg uppercase shadow-lg mt-6 active:scale-95 transition-transform">
            Place Order ₹{amount}
          </button>
        </div>
      )}
    </div>
  );
}
