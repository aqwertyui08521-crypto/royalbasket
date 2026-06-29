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
    const saved = localStorage.getItem("saved_address");
    if (saved) { setAddress(JSON.parse(saved)); setStep(2); }
    
    const loadCart = async () => {
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) {
        const cartItems = JSON.parse(savedCart);
        const { data: products } = await supabase.from("products").select("*");
        if (products) {
          let tempCart: any[] = [];
          let tOld = 0, tNew = 0, tQty = 0;
          products.forEach((p: any) => {
            const qty = cartItems[p.id];
            if (qty > 0) {
              tempCart.push({ ...p, qty });
              tOld += (Number(p.price || 0) * qty);
              tNew += (Number(p.sale_price || p.price || 0) * qty);
              tQty += qty;
            }
          });
          setCartData(tempCart);
          setTotals({ itemTotal: tOld, saved: (tOld - tNew), toPay: tNew, totalQty: tQty });
        }
      }
    };
    loadCart();
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

  const handleProceedToPayment = () => {
    if (totals.toPay === 0) return alert("Your cart is empty!");
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
                <input key={f} placeholder={f} className="w-full bg-gray-50 p-4 rounded-xl font-medium border border-gray-200 outline-none" value={address[f as keyof typeof address]} onChange={(e) => setAddress({...address, [f]: e.target.value})} />
              ))}
              <button onClick={() => { localStorage.setItem("saved_address", JSON.stringify(address)); setStep(2); }} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-bold mt-2">Save & Continue</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-[#F5F5F5] sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
            <button onClick={() => router.back()} className="text-xl font-bold">←</button>
            <h1 className="font-extrabold text-lg">Checkout</h1>
          </div>
          <div className="px-4 space-y-4 mt-2">
            <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h2 className="font-extrabold text-sm mb-4">Items in cart</h2>
              {cartData.map((item, idx) => (
                <div key={idx} className="flex gap-4 border-b pb-4 mb-4">
                  <img src={item.image_url} className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
                  <div className="flex-1"><h3 className="font-bold text-sm">{item.name}</h3><p className="text-xs">₹{item.sale_price}</p></div>
                  <div className="flex bg-[#5C3A21] text-white rounded-lg px-2 py-1 gap-2">
                    <button onClick={() => updateCartItem(item.id, 'decrease')}>-</button>
                    <span className="text-xs font-bold">{item.qty}</span>
                    <button onClick={() => updateCartItem(item.id, 'increase')}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm">
              <h2 className="font-extrabold text-sm mb-4">Bill Details</h2>
              <div className="flex justify-between text-xs"><span>To Pay</span><span className="font-bold">₹{totals.toPay}</span></div>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
            <button onClick={handleProceedToPayment} className="w-full bg-[#5C3A21] text-white h-14 rounded-full font-bold">Proceed to Payment ►</button>
          </div>
        </div>
      )}
    </div>
  );
}
