"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, ShieldCheck, QrCode, CreditCard, Info, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({}); // ডেটাবেস থেকে সেটিংস আসবে
  
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
      setCart(savedCart);
      const { data: setts } = await supabase.from("store_settings").select("*").eq("id", 1).single();
      if(setts) setSettings(setts);
      
      const productIds = Object.keys(savedCart);
      if (productIds.length > 0) {
        const { data: prods } = await supabase.from("products").select("*").in("id", productIds);
        if (prods) setProducts(prods);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const finalAmount = totalAmount + (Number(settings.shipping_charge) || 0);

  // ডেটাবেস থেকে আসা UPI দিয়ে ডাইনামিক QR
  const primaryUpi = settings.phonepe_upi || settings.paytm_upi || "";
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${primaryUpi}&pn=RoyalBasket&am=${finalAmount}&cu=INR`;

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert("Please select payment method.");
    if (paymentMethod !== "COD" && !transactionId) return alert("Please enter Transaction ID.");
    
    setIsProcessing(true);
    const orderId = "RB-" + Math.floor(100000 + Math.random() * 900000);
    const { error } = await supabase.from("orders").insert([{
       order_id: orderId,
       customer_name: address.name,
       phone: address.phone,
       address: `${address.street}, ${address.city}`,
       total_amount: finalAmount,
       payment_method: paymentMethod,
       status: "pending"
    }]);

    if(!error) {
       localStorage.removeItem("royal_cart");
       router.push('/success');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <h1 className="text-xl font-black mb-4">Checkout</h1>
      {step === 1 ? (
        <div className="bg-white p-4 rounded-xl shadow-sm">
           <input type="text" placeholder="Name" onChange={e=>setAddress({...address, name:e.target.value})} className="w-full border p-2 mb-2"/>
           <button onClick={()=>setStep(2)} className="w-full bg-[#5C3A21] text-white p-3 rounded-lg font-black uppercase">Proceed</button>
        </div>
      ) : (
        <div className="space-y-4">
           {settings.phonepe_upi && <div className="bg-white p-4 rounded-xl"><p>Pay: {settings.phonepe_upi}</p><img src={dynamicQrUrl} className="w-40 mx-auto"/></div>}
           {settings.cod_enabled && <button onClick={()=>setPaymentMethod("COD")} className="w-full border p-3 rounded-lg font-black">Cash on Delivery</button>}
           <input type="text" placeholder="Trans ID" onChange={e=>setTransactionId(e.target.value)} className="w-full border p-2"/>
           <button onClick={handlePlaceOrder} className="w-full bg-green-600 text-white p-4 rounded-lg font-black">Confirm Order</button>
        </div>
      )}
    </div>
  );
}
