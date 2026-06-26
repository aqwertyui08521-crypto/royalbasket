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

  useEffect(() => {
    // ১. অ্যাড্রেস লোড
    const saved = localStorage.getItem("saved_address");
    if (saved) { setAddress(JSON.parse(saved)); setStep(2); }
    
    // ২. কার্ট এবং প্রোডাক্ট লোড
    const loadCart = async () => {
      try {
        const savedCart = localStorage.getItem("royal_cart");
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          const { data: products } = await supabase.from("products").select("*");
          
          if (products) {
            let tempCart: any[] = [];
            let tOld = 0;
            let tNew = 0;
            let tQty = 0;

            products.forEach((p: any) => {
              const qty = cartItems[p.id];
              if (qty > 0) {
                tempCart.push({ ...p, qty });
                const oldP = Number(p.price || 0);
                const newP = Number(p.sale_price || p.price || 0);
                tOld += (oldP * qty);
                tNew += (newP * qty);
                tQty += qty;
              }
            });
            
            setCartData(tempCart);
            setTotals({ itemTotal: tOld, saved: (tOld - tNew), toPay: tNew, totalQty: tQty });
          }
        }
      } catch (error) {
        console.error("Cart error", error);
      }
    };
    loadCart();
  }, []);

  const saveAddress = () => { 
    if(!address.name || !address.phone) return alert("Please fill required details");
    localStorage.setItem("saved_address", JSON.stringify(address)); 
    setStep(2); 
  };

  const handleProceedToPayment = () => {
    if (totals.toPay === 0) return alert("Your cart is empty!");
    // টোটাল অ্যামাউন্ট পেমেন্ট পেজের জন্য সেভ করে রাখছি
    localStorage.setItem("checkout_total", totals.toPay.toString());
    localStorage.setItem("checkout_savings", totals.saved.toString());
    router.push('/payment');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-black pb-28">
      {step === 1 ? (
        <div className="p-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-xl font-bold mb-6 text-gray-800">Add Delivery Address</h1>
            <div className="space-y-4">
              {["name", "phone", "room", "village", "locality", "pincode"].map((f) => (
                <input 
                  key={f}
                  placeholder={f === "room" ? "House / Flat / Block No." : f.charAt(0).toUpperCase() + f.slice(1)} 
                  className="w-full bg-gray-50 p-4 rounded-xl font-medium border border-gray-200 outline-none focus:border-[#7A401A]" 
                  value={address[f as keyof typeof address]} 
                  onChange={(e) => setAddress({...address, [f]: e.target.value})} 
                />
              ))}
              <button onClick={saveAddress} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-bold mt-2">Save & Continue</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="bg-[#F5F5F5] sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1"><span className="text-xl font-bold">←</span></button>
              <div>
                <h1 className="font-extrabold text-lg leading-tight">Checkout</h1>
                <p className="text-xs text-gray-500 font-medium">{totals.totalQty} item{totals.totalQty > 1 ? 's' : ''} in your cart</p>
              </div>
            </div>
          </div>

          <div className="px-4 space-y-4 mt-2">
            {/* Address Card */}
            <div className="bg-white p-4 rounded-3xl shadow-sm flex items-start justify-between">
              <div className="flex gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#7A401A]/10 flex items-center justify-center text-[#7A401A] text-xs">📍</div>
                <div>
                  <h2 className="font-extrabold text-sm text-gray-800">Deliver to Home</h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed font-medium">
                    {address.name}, {address.room}, {address.village}, {address.locality},<br/>
                    Pincode - {address.pincode}<br/>
                    Mobile: {address.phone}
                  </p>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-[#7A401A] uppercase tracking-wide">Change</button>
            </div>

            {/* Items in Cart */}
            <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h2 className="font-extrabold text-sm mb-4">Items in cart</h2>
              <div className="space-y-4">
                {cartData.map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-tight text-gray-800">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.weight || '1 Kg'}</p>
                      <h4 className="font-extrabold text-sm mt-1">₹{item.sale_price || item.price}</h4>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="bg-[#5C3A21] text-white flex items-center rounded-lg px-2 py-1 gap-3">
                        <span className="text-sm font-bold px-1">-</span>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <span className="text-sm font-bold px-1">+</span>
                      </div>
                      <button className="text-[10px] text-red-500 font-bold mt-2">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offers Available */}
            <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h2 className="font-extrabold text-sm mb-3">Offers Available</h2>
              <div className="space-y-3">
                {/* Offer 1: Buy 3 Get 1 */}
                <div className="border border-gray-200 rounded-2xl p-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">Buy 3 Get 1 Free</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {totals.totalQty >= 3 ? 'Offer applied to your cart' : `Add ${3 - totals.totalQty} more item(s) to unlock`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-wide ${totals.totalQty >= 3 ? 'text-green-600' : 'text-[#7A401A]'}`}>
                    {totals.totalQty >= 3 ? 'APPLIED' : 'LOCKED'}
                  </span>
                </div>
                
                {/* Offer 2: Buy 5 Get 2 */}
                <div className="border border-gray-200 rounded-2xl p-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">Buy 5 Get 2 Free</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                      {totals.totalQty >= 5 ? 'Offer applied to your cart' : `Add ${Math.max(0, 5 - totals.totalQty)} more item(s) to unlock`}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold tracking-wide ${totals.totalQty >= 5 ? 'text-green-600' : 'text-[#7A401A]'}`}>
                    {totals.totalQty >= 5 ? 'APPLIED' : 'LOCKED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h2 className="font-extrabold text-sm mb-4">Bill Details</h2>
              <div className="space-y-2 text-xs font-medium text-gray-600">
                <div className="flex justify-between"><span>Item Total</span><span>₹{totals.itemTotal}</span></div>
                <div className="flex justify-between text-[#7A401A] font-bold"><span>Product Savings</span><span>- ₹{totals.saved}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span className="text-[#7A401A] font-bold">FREE</span></div>
              </div>
              <div className="border-t border-dashed border-gray-300 my-3"></div>
              <div className="flex justify-between font-extrabold text-base text-black">
                <span>To Pay</span><span>₹{totals.toPay}</span>
              </div>
              
              {/* Saving Banner */}
              {totals.saved > 0 && (
                <div className="bg-[#F8EFE9] text-[#7A401A] text-[11px] font-bold text-center py-2.5 rounded-xl mt-4 flex items-center justify-center gap-2">
                  <span>🏷️</span> You saved ₹{totals.saved} on this order
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-20">
            <button onClick={handleProceedToPayment} className="w-full bg-[#5C3A21] text-white h-14 rounded-full font-bold flex items-center justify-between px-6 shadow-lg shadow-[#5C3A21]/30 active:scale-[0.98] transition-transform">
              <span className="text-lg">₹{totals.toPay}</span>
              <span className="text-sm tracking-wide">Proceed to Payment ►</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
