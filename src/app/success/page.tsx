"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function SuccessPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const processOrder = async () => {
      const savedCart = localStorage.getItem("royal_cart");
      if (!savedCart) return; // Order already processed
      
      const newId = "RB-" + Math.floor(100000 + Math.random() * 900000);
      setOrderId(newId);
      
      const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
      
      // ডেটাবেসে অর্ডার ইনসার্ট করা হচ্ছে
      await supabase.from("orders").insert([{
         order_id: newId,
         customer_name: "Rubina Khatun", // Address theke asbe
         phone: "7943188464",
         address: "NN, Jns, Najem, Chandigarh - 743206",
         items: JSON.parse(savedCart),
         total_amount: parseFloat(localStorage.getItem("cartTotal") || "0"),
         payment_method: localStorage.getItem("payment_method") || "COD",
         status: "processing"
      }]);

      localStorage.setItem("last_order_id", newId);
      localStorage.removeItem("royal_cart");
      localStorage.removeItem("cartTotal");
      window.dispatchEvent(new Event("storage"));
    };
    
    processOrder();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
       <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-[scaleIn_0.4s_ease-out]"><CheckCircle2 className="h-12 w-12 text-green-600" /></div>
       <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
       {orderId && <p className="text-sm font-bold text-[#5C3A21] mb-2 bg-[#F4EFE6] px-4 py-1 rounded-full border border-[#EADBC8]">Order ID: {orderId}</p>}
       <p className="text-sm text-gray-500 font-medium mb-10 mt-4">We have received your order securely.</p>
       <button onClick={() => router.push('/track')} className="w-full max-w-xs bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl mb-3">Track Order <ChevronRight className="inline h-5 w-5"/></button>
       <button onClick={() => router.push('/')} className="w-full max-w-xs bg-white text-[#5C3A21] border border-[#5C3A21] font-extrabold py-4 rounded-2xl">Continue Shopping</button>
    </div>
  );
}
