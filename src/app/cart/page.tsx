"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Tag, ChevronRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function CartPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const supabaseUrl = "https://npzfzlkvdxweiaewnnem.supabase.co";
      const supabaseKey = "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz";
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("products").select("*");
      if (data) setProducts(data);
      
      const savedCart = localStorage.getItem("royal_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      setLoading(false);
    };
    fetchAllData();
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

  const totalCartItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
  const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const totalOldAmount = products.reduce((sum, p) => sum + ((p.old_price || p.price) * (cart[p.id] || 0)), 0);
  const totalSaved = totalOldAmount - totalAmount;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 h-14 flex items-center gap-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="bg-gray-100 p-1.5 rounded-full active:scale-95 transition"><ArrowLeft className="h-5 w-5 text-gray-800" /></button>
         <h1 className="text-lg font-bold text-gray-900 tracking-tight">Shopping Cart</h1>
      </header>

      {totalCartItems === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-white h-28 w-28 rounded-full flex items-center justify-center mb-5 shadow-sm border border-gray-100"><ShoppingCart className="h-12 w-12 text-gray-300" /></div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-sm text-gray-500 font-medium mb-8 max-w-[250px]">Looks like you haven't added any premium dry fruits yet.</p>
          <button onClick={() => router.push('/')} className="bg-[#5C3A21] text-white font-extrabold py-3.5 px-8 rounded-2xl text-sm flex items-center gap-2 shadow-[0_4px_12px_rgba(92,58,33,0.3)] active:scale-95 transition">Continue Shopping <ChevronRight className="h-4 w-4" /></button>
        </div>
      ) : (
        <main className="p-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 flex items-center gap-3">
             <CheckCircle2 className="h-6 w-6 text-green-600" />
             <div><h3 className="font-bold text-gray-900 text-sm">Cart is ready!</h3><p className="text-xs text-gray-500">{totalCartItems} item{totalCartItems > 1 ? 's' : ''} inside</p></div>
          </div>

          <div className="space-y-3">
            {products.filter(p => cart[p.id]).map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl border border-gray-50">🌰</div>
                <div className="flex-1"><h4 className="font-bold text-sm text-gray-900 leading-tight pr-2">{p.name}</h4><div className="font-extrabold text-gray-900 mt-1 text-base">₹{p.price}</div></div>
                <div className="bg-gray-100 rounded-xl flex items-center px-2 py-1.5 border border-gray-200">
                   <button onClick={() => updateCart(p.id, -1)} className="text-lg font-black text-gray-700 px-2.5">−</button>
                   <span className="font-black text-sm text-[#5C3A21] min-w-[20px] text-center">{cart[p.id]}</span>
                   <button onClick={() => updateCart(p.id, 1)} className="text-lg font-black text-gray-700 px-2.5">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 mt-6">
            <h3 className="font-extrabold text-gray-900 mb-4 text-base border-b border-gray-100 pb-3">Bill Details</h3>
            <div className="space-y-3 text-sm font-medium mb-4">
               <div className="flex justify-between text-gray-600"><span>Item Total</span><span>₹{totalOldAmount}</span></div>
               <div className="flex justify-between text-green-600"><span>Store Discount</span><span>- ₹{totalSaved}</span></div>
               <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span className="text-green-600 font-bold">FREE</span></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
              <span className="text-gray-900 font-black text-base">Grand Total</span>
              <span className="text-2xl font-black text-[#5C3A21]">₹{totalAmount}</span>
            </div>
            <button onClick={() => { localStorage.setItem("cartTotal", totalAmount.toString()); router.push(localStorage.getItem("deliveryAddress") ? "/payment" : "/address"); }} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 active:scale-95 transition shadow-md">
              Buy Now <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
