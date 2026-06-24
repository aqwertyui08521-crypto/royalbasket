"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, ShieldCheck, QrCode, CreditCard, Info, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const MY_PHONEPE_UPI = "rubi9321@ptyes";
const MY_PAYTM_UPI = "rubi9321@ptyes";
const STORE_NAME = "Royal Basket";
const IS_COD_ENABLED = true;
const DELIVERY_CHARGE = 0;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
      setCart(savedCart);
      const productIds = Object.keys(savedCart);
      const savedAddress = localStorage.getItem("saved_address");
      if (savedAddress) setAddress(JSON.parse(savedAddress));
      if (productIds.length > 0) {
        const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
        const { data: prods } = await supabase.from("products").select("*").in("id", productIds);
        if (prods) setProducts(prods);
      }
      setLoading(false);
    };
    fetchCheckoutData();
  }, []);

  const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const finalAmount = totalAmount + DELIVERY_CHARGE;
  const primaryUpi = MY_PHONEPE_UPI || MY_PAYTM_UPI;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${primaryUpi}&pn=${encodeURIComponent(STORE_NAME)}&am=${finalAmount}&cu=INR`;
  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert("Select payment method.");
    if (paymentMethod !== "COD" && !transactionId) return alert("Enter Transaction ID.");
    setIsProcessing(true);
    const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
    const orderId = "RB-" + Math.floor(100000 + Math.random() * 900000);
    const { error } = await supabase.from("orders").insert([{
       order_id: orderId, customer_name: address.name, phone: address.phone, address: `${address.street}, ${address.city}`,
       total_amount: finalAmount, payment_method: paymentMethod === "COD" ? "COD" : "UPI", status: "pending"
    }]);
    if(!error) { localStorage.removeItem("royal_cart"); router.push('/success'); }
    else { alert("Error!"); setIsProcessing(false); }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F5F7F9] pb-28 font-sans">
      <header className="bg-white px-4 h-14 flex items-center gap-3 shadow-sm sticky top-0 z-40">
         <button onClick={() => step === 2 ? setStep(1) : router.back()} className="p-1"><ArrowLeft className="h-6 w-6 text-black" /></button>
         <h1 className="text-lg font-black">{step === 1 ? 'Delivery Address' : 'Payment'}</h1>
      </header>
      <main className="p-4 space-y-4">
         {step === 1 ? (
            <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-3">
               <input type="text" placeholder="Name" value={address.name} onChange={e=>setAddress({...address, name:e.target.value})} className="w-full border-2 p-3 rounded-xl font-black"/>
               <input type="tel" placeholder="Mobile" value={address.phone} onChange={e=>setAddress({...address, phone:e.target.value})} className="w-full border-2 p-3 rounded-xl font-black"/>
               <input type="text" placeholder="Address" value={address.street} onChange={e=>setAddress({...address, street:e.target.value})} className="w-full border-2 p-3 rounded-xl font-black"/>
               <button onClick={() => {localStorage.setItem("saved_address", JSON.stringify(address)); setStep(2);}} className="w-full bg-[#5C3A21] text-white p-4 rounded-xl font-black uppercase">Proceed</button>
            </div>
         ) : (
            <div className="space-y-4">
               <div className="bg-white p-5 rounded-2xl shadow-sm border text-center">
                  <h3 className="font-black mb-3">Pay ₹{finalAmount}</h3>
                  <img src={dynamicQrUrl} className="w-40 h-40 mx-auto"/>
                  <input type="text" placeholder="Transaction ID" onChange={e=>setTransactionId(e.target.value)} className="w-full border-2 p-3 rounded-xl mt-3"/>
               </div>
               {IS_COD_ENABLED && (
                  <button onClick={()=>setPaymentMethod("COD")} className="w-full bg-white p-4 rounded-xl border font-black">Cash on Delivery</button>
               )}
               <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full bg-[#5C3A21] text-white p-4 rounded-xl font-black uppercase">
                 {isProcessing ? "Processing..." : "Confirm Order"}
               </button>
            </div>
         )}
      </main>
    </div>
  );
}
