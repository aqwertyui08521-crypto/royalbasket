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
  const [paymentSettings, setPaymentSettings] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("saved_address");
    if (saved) { setAddress(JSON.parse(saved)); setStep(2); }
    
    const loadData = async () => {
      // Cart Logic
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

      // Updated Payment Logic: Fetching fresh data by ensuring we don't rely on stale cache
      const { data: paySettings, error } = await supabase
        .from("payment_settings")
        .select("*")
        .order('id', { ascending: false }); // Latest added first
      
      if (paySettings) {
        setPaymentSettings(paySettings);
      }
    };
    loadData();
  }, []);

  // ... (বাকি ফাংশনগুলো আগের মতোই থাকবে)
  const updateCartItem = (id: string, action: 'increase' | 'decrease' | 'remove') => {
    let savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
    if (action === 'increase') savedCart[id] = (savedCart[id] || 0) + 1;
    else if (action === 'decrease') savedCart[id] > 1 ? savedCart[id] -= 1 : delete savedCart[id];
    else if (action === 'remove') delete savedCart[id];
    localStorage.setItem("royal_cart", JSON.stringify(savedCart));
    window.dispatchEvent(new Event("storage"));
    
    let tempCart = [...cartData];
    if (action === 'increase') {
        const item = tempCart.find(i => i.id === id);
        if(item) item.qty += 1;
    } else if (action === 'decrease') {
        const item = tempCart.find(i => i.id === id);
        if(item) { item.qty -= 1; if(item.qty <= 0) tempCart = tempCart.filter(i => i.id !== id); }
    } else if (action === 'remove') tempCart = tempCart.filter(i => i.id !== id);
    
    setCartData(tempCart);
    let tOld = 0, tNew = 0, tQty = 0;
    tempCart.forEach(p => {
        const oldP = Number(p.price || 0);
        const newP = Number(p.sale_price || p.price || 0);
        tOld += (oldP * p.qty);
        tNew += (newP * p.qty);
        tQty += p.qty;
    });
    setTotals({ itemTotal: tOld, saved: (tOld - tNew), toPay: tNew, totalQty: tQty });
  };

  const saveAddress = () => { 
    if(!address.name || !address.phone) return alert("Please fill required details");
    localStorage.setItem("saved_address", JSON.stringify(address)); 
    setStep(2); 
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
                <input key={f} placeholder={f} className="w-full bg-gray-50 p-4 rounded-xl font-medium border border-gray-200" value={address[f as keyof typeof address]} onChange={(e) => setAddress({...address, [f]: e.target.value})} />
              ))}
              <button onClick={saveAddress} className="w-full bg-[#5C3A21] text-white py-4 rounded-xl font-bold mt-2">Save & Continue</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
           {/* Header and Cart items design remain exactly same */}
           <div className="px-4 space-y-4 mt-2">
            {/* ... (Cart Section same as before) */}
            
            {/* UPI Section */}
            {paymentSettings.length > 0 && (
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-green-100">
                <h2 className="font-extrabold text-sm mb-3 text-gray-800">Pay using UPI</h2>
                <div className="flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-2xl">
                   <p className="text-sm font-black text-gray-900">{paymentSettings[0].upi_id}</p>
                   <span className="text-green-600 font-extrabold text-xs">Verified</span>
                </div>
              </div>
            )}
            
            {/* Bill Details */}
            {/* ... (Bill Details Section) */}
          </div>
        </div>
      )}
    </div>
  );
}
