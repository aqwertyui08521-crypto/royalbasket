"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, CreditCard, ShieldCheck, CheckCircle2, QrCode } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Checkout Steps State
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", street: "", city: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      const savedCart = JSON.parse(localStorage.getItem("royal_cart") || "{}");
      setCart(savedCart);
      const productIds = Object.keys(savedCart);

      if (productIds.length > 0) {
        const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
        const { data: prods } = await supabase.from("products").select("*").in("id", productIds);
        if (prods) setProducts(prods);
        
        const { data: setts } = await supabase.from("store_settings").select("*").eq("id", 1).single();
        if (setts) setSettings(setts);
      }
      setLoading(false);
    };
    fetchCheckoutData();
  }, []);

  const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const finalAmount = totalAmount + (settings.shipping_charge || 0);

  const handlePlaceOrder = async () => {
    if (paymentMethod === "UPI" && !transactionId) {
       alert("Please enter the Transaction ID or UTR number after paying!");
       return;
    }
    setIsProcessing(true);
    const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
    const orderId = "RB-" + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `${address.street}, ${address.city} - ${address.pincode}`;

    const { error } = await supabase.from("orders").insert([{
       order_id: orderId,
       customer_name: address.name,
       phone: address.phone,
       address: fullAddress,
       items: cart,
       total_amount: finalAmount,
       payment_method: paymentMethod,
       status: "pending",
       delivery_notes: paymentMethod === "UPI" ? `Trx ID: ${transactionId}` : "COD Order"
    }]);

    if(!error) {
       // Save customer info
       await supabase.from("customers").upsert([{ name: address.name, phone: address.phone }], { onConflict: 'phone' });
       localStorage.setItem("last_order_id", orderId);
       localStorage.removeItem("royal_cart");
       window.dispatchEvent(new Event("storage"));
       router.push('/success');
    } else {
       alert("Something went wrong!");
       setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;
  if (Object.keys(cart).length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><p className="font-bold text-gray-500 mb-4">Cart is empty</p><button onClick={()=>router.push('/')} className="bg-[#5C3A21] text-white px-6 py-2 rounded-xl font-bold">Go to Shop</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white px-4 h-14 flex items-center gap-3 shadow-sm sticky top-0 z-40 border-b">
         <button onClick={() => step === 2 ? setStep(1) : router.back()} className="bg-gray-100 p-2 rounded-full"><ArrowLeft className="h-5 w-5" /></button>
         <h1 className="text-lg font-black text-gray-900">{step === 1 ? 'Delivery Address' : 'Payment'}</h1>
      </header>

      <main className="p-4">
         {/* STEP 1: ADDRESS */}
         {step === 1 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black mb-4 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#5C3A21]"/> Contact Details</h2>
                  <div className="space-y-3">
                     <input type="text" placeholder="Full Name" value={address.name} onChange={e=>setAddress({...address, name:e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold" />
                     <input type="tel" placeholder="Mobile Number" value={address.phone} onChange={e=>setAddress({...address, phone:e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold" />
                     <input type="text" placeholder="House No, Street, Landmark" value={address.street} onChange={e=>setAddress({...address, street:e.target.value})} className="w-full border p-3 rounded-xl text-sm font-bold" />
                     <div className="flex gap-3">
                        <input type="text" placeholder="City" value={address.city} onChange={e=>setAddress({...address, city:e.target.value})} className="w-1/2 border p-3 rounded-xl text-sm font-bold" />
                        <input type="number" placeholder="Pincode" value={address.pincode} onChange={e=>setAddress({...address, pincode:e.target.value})} className="w-1/2 border p-3 rounded-xl text-sm font-bold" />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black mb-3">Order Summary</h2>
                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-2"><span>Total Items ({Object.keys(cart).length})</span><span>₹{totalAmount}</span></div>
                  <div className="flex justify-between text-xs font-bold text-gray-600 mb-3 border-b pb-3"><span>Delivery Charge</span><span className="text-green-600">{settings.shipping_charge > 0 ? `₹${settings.shipping_charge}` : 'FREE'}</span></div>
                  <div className="flex justify-between text-sm font-black text-gray-900"><span>Amount to Pay</span><span>₹{finalAmount}</span></div>
               </div>

               <button onClick={() => {
                  if(!address.name || !address.phone || !address.street || !address.pincode) return alert("Please fill all address details!");
                  setStep(2);
               }} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl shadow-md uppercase tracking-widest text-sm">Proceed to Payment</button>
            </div>
         )}

         {/* STEP 2: SECURE PAYMENT */}
         {step === 2 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black mb-4 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#5C3A21]"/> Choose Payment Method</h2>
                  
                  <div className="space-y-3">
                     {/* UPI Option */}
                     <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'UPI' ? 'border-[#5C3A21] bg-[#F4EFE6]' : 'border-gray-100'}`}>
                        <div className="flex items-center gap-3"><div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-[#5C3A21]' : 'border-gray-300'}`}>{paymentMethod === 'UPI' && <div className="h-2 w-2 bg-[#5C3A21] rounded-full"></div>}</div><span className="font-black text-sm">Pay via UPI (GPay, PhonePe)</span></div>
                        <QrCode className="h-5 w-5 text-gray-500"/>
                     </label>

                     {/* COD Option (Only if enabled in admin) */}
                     {settings.cod_enabled && (
                        <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'COD' ? 'border-[#5C3A21] bg-[#F4EFE6]' : 'border-gray-100'}`}>
                           <div className="flex items-center gap-3"><div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#5C3A21]' : 'border-gray-300'}`}>{paymentMethod === 'COD' && <div className="h-2 w-2 bg-[#5C3A21] rounded-full"></div>}</div><span className="font-black text-sm">Cash on Delivery</span></div>
                        </label>
                     )}
                  </div>
               </div>

               {/* UPI DETAILS BOX */}
               {paymentMethod === 'UPI' && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 text-center animate-[fadeIn_0.3s_ease-out]">
                     <h3 className="text-xs font-black uppercase text-blue-600 mb-4 tracking-widest">Scan or Pay to UPI</h3>
                     
                     {settings.qr_code_url ? (
                        <img src={settings.qr_code_url} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-gray-100 rounded-xl mb-4 p-2 object-contain" />
                     ) : (
                        <div className="w-48 h-48 mx-auto bg-gray-50 border-2 border-dashed rounded-xl mb-4 flex items-center justify-center"><QrCode className="h-10 w-10 text-gray-300"/></div>
                     )}

                     <div className="bg-gray-50 p-3 rounded-xl mb-4">
                        {settings.phonepe_upi && <p className="text-xs font-bold text-gray-600 mb-1">PhonePe: <span className="text-black">{settings.phonepe_upi}</span></p>}
                        {settings.paytm_upi && <p className="text-xs font-bold text-gray-600">Paytm/GPay: <span className="text-black">{settings.paytm_upi}</span></p>}
                        {!settings.phonepe_upi && !settings.paytm_upi && <p className="text-xs text-red-500 font-bold">Admin has not set UPI ID yet.</p>}
                     </div>

                     <div className="text-left">
                        <label className="text-xs font-bold text-gray-900 block mb-2">Enter Transaction ID / UTR No. *</label>
                        <input type="text" placeholder="e.g. 312345678901" value={transactionId} onChange={(e)=>setTransactionId(e.target.value)} className="w-full border-2 border-blue-200 p-3 rounded-xl text-sm font-black focus:outline-none focus:border-blue-500 bg-blue-50" />
                        <p className="text-[10px] font-bold text-gray-500 mt-1">We will verify this ID and confirm your order.</p>
                     </div>
                  </div>
               )}

               <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full bg-green-600 text-white font-extrabold py-4 rounded-2xl shadow-md uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  {isProcessing ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><ShieldCheck className="h-5 w-5"/> {paymentMethod === 'UPI' ? 'Verify Payment & Order' : 'Confirm Order'}</>}
               </button>
            </div>
         )}
      </main>
    </div>
  );
}
