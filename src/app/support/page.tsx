"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function TrackOrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const saved = localStorage.getItem("saved_address");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.phone) {
            setUserPhone(parsed.phone);
            // Supabase থেকে সরাসরি লাইভ অর্ডার টানা হচ্ছে
            const { data, error } = await supabase
              .from("orders")
              .select("*")
              .eq("customer_phone", parsed.phone)
              .order("created_at", { ascending: false });

            if (data && data.length > 0) {
              setOrders(data);
            }
          }
        }
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ট্র্যাকিং স্টেপ ডিজাইন
  const StatusStep = ({ title, desc, icon, isActive, isLast }: any) => (
    <div className="flex gap-4 relative">
      {!isLast && <div className={`absolute left-5 top-10 w-0.5 h-12 ${isActive ? 'bg-[#5C3A21]' : 'bg-gray-200'}`}></div>}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[18px] z-10 ${isActive ? 'bg-[#5C3A21] text-white shadow-md shadow-[#5C3A21]/30' : 'bg-gray-100 text-gray-400'}`}>
        {icon}
      </div>
      <div className="pb-8">
        <p className={`font-extrabold text-sm ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{title}</p>
        <p className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-[#7A401A]' : 'text-gray-400'}`}>{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-black pb-20">
      <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.push('/')} className="p-1"><span className="text-xl font-bold">←</span></button>
        <div>
          <h1 className="font-extrabold text-lg leading-tight text-[#4A2C11]">Track Orders</h1>
          <p className="text-xs text-gray-500 font-medium">
            {userPhone ? `Tracking for: ${userPhone}` : "View your recent orders"}
          </p>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 font-bold text-sm">Loading real orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-gray-100 mt-10">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
            <h2 className="font-extrabold text-gray-800 text-lg">No Orders Found</h2>
            <p className="text-xs text-gray-500 mt-2">
              {userPhone ? `We couldn't find any orders for ${userPhone}.` : "Please place an order to see it here."}
            </p>
            <button onClick={() => router.push('/')} className="mt-6 bg-[#5C3A21] text-white px-6 py-3 rounded-xl font-bold text-sm">Start Shopping</button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              
              <div className="p-5 border-b border-gray-100 bg-[#FDFBF9]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">ORDER ID</p>
                    <p className="font-black text-sm text-[#4A2C11]">{order.order_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">AMOUNT</p>
                    <p className="font-black text-sm text-[#4A2C11]">₹{order.total_amount}</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-medium">
                  Placed on: {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="p-5 border-b border-gray-100">
                <h3 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-3">Items</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl border border-gray-200">🛍️</div>
                  <div>
                    <p className="font-extrabold text-sm text-gray-800">
                      {order.items && order.items[0] ? order.items[0].name : "Royal Basket Products"}
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                      {order.items && order.items.length > 1 ? `+ ${order.items.length - 1} more items` : `Qty: ${order.items[0]?.qty || 1}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-6">
                <h3 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-widest mb-5">Order Status</h3>
                
                <StatusStep title="Order Confirmed" desc="We have received your order." icon="📝" isActive={true} isLast={false} />
                <StatusStep title="Processing" desc="Seller is preparing your order." icon="⚙️" isActive={order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'} isLast={false} />
                <StatusStep title="Shipped" desc="Order is out for delivery." icon="🚚" isActive={order.status === 'shipped' || order.status === 'delivered'} isLast={false} />
                <StatusStep title="Delivered" desc="Order has been delivered." icon="✅" isActive={order.status === 'delivered'} isLast={true} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}