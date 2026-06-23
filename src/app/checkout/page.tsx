"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Tag, ChevronRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function CheckoutPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data);
      
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      setLoading(false);
    };
    fetchData();
  }, []);

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const next = (prev[id] || 0) + delta;
      const newCart = { ...prev };
      if (next <= 0) delete newCart[id];
      else newCart[id] = next;
      localStorage.setItem("royal_cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("storage"));
      return newCart;
    });
  };

  const totalQuantity = Object.values(cart).reduce((sum, count) => sum + count, 0);

  // কার্ট ফাঁকা হলে কার্ট পেজে পাঠিয়ে দেবে
  useEffect(() => {
    if (!loading && totalQuantity === 0) router.push('/cart');
  }, [totalQuantity, loading, router]);

  // বিলের হিসেব
  const baseTotalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const baseTotalOldAmount = products.reduce((sum, p) => sum + ((p.old_price || p.price) * (cart[p.id] || 0)), 0);
  
  // অফারের ম্যাজিক ক্যালকুলেশন (অফার পেলে দামও কমে যাবে)
  let offerDiscount = 0;
  if (totalQuantity >= 5) {
     const avgPrice = baseTotalAmount / totalQuantity;
     offerDiscount = Math.floor(avgPrice * 2); // ২টা ফ্রি
  } else if (totalQuantity >= 3) {
     const avgPrice = baseTotalAmount / totalQuantity;
     offerDiscount = Math.floor(avgPrice * 1); // ১টা ফ্রি
  }

  const finalAmount = baseTotalAmount - offerDiscount;
  const savings = baseTotalOldAmount - finalAmount;

  if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-28 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-none">Checkout</h1>
            <p className="text-[10px] font-bold text-gray-500 mt-1">{totalQuantity} item{totalQuantity > 1 ? 's' : ''} in your cart</p>
         </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Address Block */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3 relative">
           <div className="bg-[#F8F9FA] p-2 rounded-full shrink-0"><MapPin className="h-5 w-5 text-[#5C3A21]" /></div>
           <div className="pr-12">
              <h2 className="text-sm font-extrabold text-gray-900 mb-1">Deliver to Home</h2>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">Rubina Khatun, NN, Jns, Najem,<br/>Chandigarh - 743206<br/>Mobile: 7943188464</p>
           </div>
           <button className="absolute top-4 right-4 text-[10px] font-black text-[#5C3A21] tracking-wider uppercase">Change</button>
        </div>

        {/* Dynamic Items in cart */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-4">Items in cart</h3>
           <div className="space-y-4">
              {products.filter(p => cart[p.id]).map(p => (
                 <div key={p.id} className="flex items-start gap-3 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="h-16 w-16 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center text-3xl shrink-0">🌰</div>
                    <div className="flex-1">
                       <h4 className="text-sm font-bold text-gray-900 leading-tight">{p.name}</h4>
                       <p className="text-[10px] text-gray-500 font-medium mt-0.5">{p.weight || '1 Kg'}</p>
                       <div className="font-black text-gray-900 mt-2 text-sm">₹{p.price}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <div className="bg-[#5C3A21] text-white rounded-lg flex items-center px-2 py-1 shadow-sm">
                          <button onClick={() => updateCart(p.id, -1)} className="text-lg font-black px-2.5 active:scale-95">−</button>
                          <span className="font-black text-sm min-w-[20px] text-center">{cart[p.id]}</span>
                          <button onClick={() => updateCart(p.id, 1)} className="text-lg font-black px-2.5 active:scale-95">+</button>
                       </div>
                       <button onClick={() => updateCart(p.id, -cart[p.id])} className="text-[10px] font-bold text-red-500">Remove</button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Dynamic Offers Available */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-3">Offers Available</h3>
           <div className="space-y-3">
              {/* Offer 1: Buy 3 */}
              <div className={`border rounded-xl p-3 flex justify-between items-center transition-colors ${totalQuantity >= 3 ? 'bg-green-50 border-green-200' : 'bg-[#FAFAFA] border-gray-200'}`}>
                 <div>
                    <h4 className={`text-xs font-bold ${totalQuantity >= 3 ? 'text-green-800' : 'text-gray-900'}`}>Buy 3 Get 1 Free</h4>
                    <p className={`text-[10px] mt-0.5 ${totalQuantity >= 3 ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                       {totalQuantity >= 3 ? 'Offer applied successfully!' : `Add ${3 - totalQuantity} more item(s) to unlock`}
                    </p>
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-wider ${totalQuantity >= 3 ? 'text-green-600' : 'text-[#8B5A2B]'}`}>
                    {totalQuantity >= 3 ? 'Applied' : 'Locked'}
                 </span>
              </div>

              {/* Offer 2: Buy 5 */}
              <div className={`border rounded-xl p-3 flex justify-between items-center transition-colors ${totalQuantity >= 5 ? 'bg-green-50 border-green-200' : 'bg-[#FAFAFA] border-gray-200'}`}>
                 <div>
                    <h4 className={`text-xs font-bold ${totalQuantity >= 5 ? 'text-green-800' : 'text-gray-900'}`}>Buy 5 Get 2 Free</h4>
                    <p className={`text-[10px] mt-0.5 ${totalQuantity >= 5 ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                       {totalQuantity >= 5 ? 'Offer applied successfully!' : `Add ${5 - totalQuantity} more item(s) to unlock`}
                    </p>
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-wider ${totalQuantity >= 5 ? 'text-green-600' : 'text-[#8B5A2B]'}`}>
                    {totalQuantity >= 5 ? 'Applied' : 'Locked'}
                 </span>
              </div>
           </div>
        </div>

        {/* Dynamic Bill Details */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-extrabold text-gray-900 mb-4">Bill Details</h3>
           <div className="space-y-2.5 text-xs font-semibold text-gray-600 mb-4">
              <div className="flex justify-between"><span>Item Total</span><span className="text-gray-900">₹{baseTotalOldAmount}</span></div>
              {offerDiscount > 0 && <div className="flex justify-between text-green-600"><span>Free Item Discount</span><span>− ₹{offerDiscount}</span></div>}
              <div className="flex justify-between text-[#8B5A2B]"><span>Product Savings</span><span>− ₹{savings - offerDiscount}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span className="text-green-600 font-bold uppercase">Free</span></div>
           </div>
           <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-300">
              <span className="text-gray-900 font-black text-sm">To Pay</span>
              <span className="text-lg font-black text-gray-900">₹{finalAmount}</span>
           </div>
        </div>

        {/* Savings Tag */}
        {savings > 0 && (
           <div className="bg-[#F4EFE6] text-[#5C3A21] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-[#EADBC8]">
              <Tag className="h-4 w-4 fill-[#5C3A21]" /> You saved ₹{savings} on this order
           </div>
        )}

        <div className="flex flex-col items-center justify-center py-6 opacity-50">
           <div className="flex items-center gap-2 mb-1"><div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px]">🌰</div><span className="font-black text-gray-900">Royal Basket</span></div>
           <p className="text-[8px] font-bold tracking-widest uppercase text-gray-500">Premium Dryfruit Store</p>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_20px_-3px_rgba(0,0,0,0.08)] z-50">
         <button onClick={() => { localStorage.setItem("cartTotal", finalAmount.toString()); router.push('/payment'); }} className="w-full bg-[#5C3A21] text-white rounded-xl py-4 px-5 flex items-center justify-between shadow-md active:scale-95 transition">
            <span className="text-lg font-black">₹{finalAmount}</span>
            <span className="text-sm font-extrabold flex items-center gap-1">Proceed to Payment <ChevronRight className="h-5 w-5" /></span>
         </button>
      </div>
    </div>
  );
}
