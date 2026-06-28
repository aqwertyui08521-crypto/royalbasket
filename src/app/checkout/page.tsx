"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", room: "", village: "", locality: "", pincode: "" });
  const [cartData, setCartData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ itemTotal: 0, saved: 0, toPay: 0, totalQty: 0 });
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("saved_address");
    if (saved) { setAddress(JSON.parse(saved)); setStep(2); }
    
    const loadAll = async () => {
      // Fetch UPI ID
      const { data: paySettings } = await supabase.from("payment_settings").select("upi_id").single();
      if (paySettings) setUpiId(paySettings.upi_id);

      // Fetch Cart
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const { data: products } = await supabase.from("products").select("*");
        if (products) {
          let tempCart: any[] = [];
          let tOld = 0, tNew = 0, tQty = 0;
          products.forEach((p: any) => {
            if (cartItems[p.id] > 0) {
              tempCart.push({ ...p, qty: cartItems[p.id] });
              tOld += (Number(p.price || 0) * cartItems[p.id]);
              tNew += (Number(p.sale_price || p.price || 0) * cartItems[p.id]);
              tQty += cartItems[p.id];
            }
          });
          setCartData(tempCart);
          setTotals({ itemTotal: tOld, saved: (tOld - tNew), toPay: tNew, totalQty: tQty });
        }
      }
    };
    loadAll();
  }, []);

  const updateCartItem = (id: string, action: 'increase' | 'decrease' | 'remove') => {
    let savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
    if (action === 'increase') savedCart[id] = (savedCart[id] || 0) + 1;
    else if (action === 'decrease') { if (savedCart[id] > 1) savedCart[id] -= 1; else delete savedCart[id]; }
    else if (action === 'remove') delete savedCart[id];
    localStorage.setItem("royal_cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("storage"));
    
    let tempCart = [...cartData];
    if (action === 'increase') { const item = tempCart.find(i => i.id === id); if(item) item.qty += 1; }
    else if (action === 'decrease') { const item = tempCart.find(i => i.id === id); if(item) { item.qty -= 1; if(item.qty <= 0) tempCart = tempCart.filter(i => i.id !== id); } }
    else if (action === 'remove') tempCart = tempCart.filter(i => i.id !== id);
    setCartData(tempCart);
    
    let tOld = 0, tNew = 0, tQty = 0;
    tempCart.forEach(p => { tOld += (Number(p.price || 0) * p.qty); tNew += (Number(p.sale_price || p.price || 0) * p.qty); tQty += p.qty; });
    setTotals({ itemTotal: tOld, saved: (tOld - tNew), toPay: tNew, totalQty: tQty });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-black pb-28">
      {step === 1 ? (
        <div className="p-5">
           {/* Address form (Same as original) */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h1 className="text-xl font-bold mb-6 text-gray-800">Add Delivery Address</h1>
             <div className="space-y-4">
                {["name", "phone", "room", "village", "locality", "pincode"].map((f) => (
                  <input key={f} placeholder={f} className="w-full bg-gray-50 p-4 rounded-xl font-medium border border-gray-200" value={address[f as keyof typeof address]} onChange={(e) => setAddress({...address, [f]: e.target.value})} />
                ))}
                <button onClick={() => { localStorage.setItem("saved_address", JSON.stringify(address)); setStep(2); }} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-bold mt-2">Save & Continue</button>
             </div>
           </div>
        </div>
      ) : (
        <div className="px-4 space-y-4 mt-2">
          {/* Cart Section (Original) */}
          <div className="bg-white p-4 rounded-3xl shadow-sm">
            <h2 className="font-extrabold text-sm mb-4">Items in cart</h2>
            {cartData.map((item, idx) => (
              <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4">
                <img src={item.image_url || 'https://via.placeholder.com/60'} className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
                <div className="flex-1">
                   <h3 className="font-bold text-sm text-gray-800">{item.name}</h3>
                   <h4 className="font-extrabold text-sm mt-1">₹{item.sale_price || item.price}</h4>
                </div>
                <div className="bg-[#5C3A21] text-white flex items-center rounded-lg px-2 py-1 gap-3">
                   <button onClick={() => updateCartItem(item.id, 'decrease')} className="text-sm font-bold px-1">-</button>
                   <span className="text-xs font-bold">{item.qty}</span>
                   <button onClick={() => updateCartItem(item.id, 'increase')} className="text-sm font-bold px-1">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* New UPI Display Box */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-green-100">
            <h2 className="font-extrabold text-sm mb-3 text-gray-800">Pay using UPI</h2>
            <div className="bg-green-50 border border-green-100 p-3 rounded-2xl flex justify-between items-center">
              <p className="text-sm font-black text-gray-900">{upiId || "Loading..."}</p>
              <span className="text-green-600 font-extrabold text-xs">Verified</span>
            </div>
          </div>

          {/* Bill Details & Proceed Button (Original) */}
          <div className="bg-white p-4 rounded-3xl shadow-sm">
             <h2 className="font-extrabold text-sm mb-4">Bill Details</h2>
             <div className="flex justify-between text-xs font-medium"><span>To Pay</span><span>₹{totals.toPay}</span></div>
          </div>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <button onClick={() => router.push('/payment')} className="w-full bg-[#5C3A21] text-white h-14 rounded-full font-bold">Proceed to Payment ►</button>
          </div>
        </div>
      )}
    </div>
  );
}
