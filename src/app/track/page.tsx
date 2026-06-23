"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Truck, Package, CheckCircle2, MapPin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastOrder = localStorage.getItem("last_order_id");
    if(lastOrder) { setOrderId(lastOrder); fetchOrder(lastOrder); }
  }, []);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
    const { data } = await supabase.from("orders").select("*").eq("order_id", id.toUpperCase()).single();
    if (data) setOrderData(data);
    setLoading(false);
  };

  const handleTrack = (e: React.FormEvent) => { e.preventDefault(); fetchOrder(orderId); };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white shadow-sm sticky top-0 px-4 h-14 flex items-center gap-3 border-b"><button onClick={() => router.back()} className="bg-gray-100 p-2 rounded-full"><ArrowLeft className="h-5 w-5"/></button><h1 className="text-lg font-black">Track Order</h1></header>
      <main className="p-4 space-y-5">
        <form onSubmit={handleTrack} className="bg-white p-5 rounded-2xl shadow-sm border flex gap-2">
           <input type="text" placeholder="Enter Order ID (e.g. RB-123456)" value={orderId} onChange={(e) => setOrderId(e.target.value)} className="w-full bg-gray-50 border p-3 rounded-xl text-sm font-bold" />
           <button type="submit" className="bg-[#5C3A21] text-white font-bold px-5 rounded-xl">Track</button>
        </form>

        {loading ? <div className="text-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21] mx-auto"></div></div> : 
        orderData ? (
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
              <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Order ID</p><p className="text-sm font-black text-gray-900">{orderData.order_id}</p></div>
              <div className="text-right"><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Amount</p><p className="text-sm font-black text-green-600">₹{orderData.total_amount}</p></div>
            </div>
            {/* Live Status Timeline from DB */}
            <div className="relative pl-6 space-y-6">
               <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-gray-100"></div>
               <div className={`absolute left-[11px] top-2 w-0.5 bg-green-500 transition-all duration-1000 ${orderData.status === 'processing' ? 'h-1/3' : orderData.status === 'shipped' ? 'h-2/3' : 'h-full'}`}></div>
               
               <div className="relative"><div className="absolute -left-6 bg-green-500 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white z-10"><Package className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold">Order Placed</h4></div>
               <div className={`relative ${orderData.status !== 'processing' && orderData.status !== 'shipped' && orderData.status !== 'delivered' ? 'opacity-40' : ''}`}><div className={`absolute -left-6 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white z-10 ${orderData.status === 'processing' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}><CheckCircle2 className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold">Processing</h4></div>
               <div className={`relative ${orderData.status !== 'shipped' && orderData.status !== 'delivered' ? 'opacity-40' : ''}`}><div className={`absolute -left-6 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white z-10 ${orderData.status === 'shipped' ? 'bg-amber-500 animate-pulse' : orderData.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}><Truck className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold">Shipped</h4></div>
               <div className={`relative ${orderData.status !== 'delivered' ? 'opacity-40' : ''}`}><div className={`absolute -left-6 h-6 w-6 rounded-full flex items-center justify-center border-4 border-white z-10 ${orderData.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}><MapPin className="h-3 w-3 text-white" /></div><h4 className="text-sm font-bold">Delivered</h4></div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 opacity-50"><Truck className="h-16 w-16 text-gray-300 mx-auto mb-3" /><p className="text-xs text-gray-400 font-bold">Track your order instantly.</p></div>
        )}
      </main>
    </div>
  );
}
