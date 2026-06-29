"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function TrackOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const saved = localStorage.getItem("saved_address");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) {
          const { data } = await supabase
            .from("orders")
            .select("*")
            .eq("customer_phone", parsed.phone)
            .order("created_at", { ascending: false });
          if (data) setOrders(data);
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-4 text-black font-sans pb-20">
      <h1 className="text-xl font-black mb-6">Live Orders</h1>
      {loading ? <p>Loading...</p> : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-3xl shadow-sm text-center">
          <p className="font-bold text-gray-500">No orders placed yet.</p>
          <button onClick={() => router.push('/')} className="mt-4 bg-[#5C3A21] text-white px-6 py-2 rounded-xl">Shop Now</button>
        </div>
      ) : (
        orders.map((o) => (
          <div key={o.id} className="bg-white p-5 rounded-3xl shadow-sm mb-4">
            <div className="flex justify-between font-black text-sm mb-2"><span>{o.order_id}</span> <span>₹{o.total_amount}</span></div>
            <p className="text-xs font-bold text-green-600 uppercase">{o.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
