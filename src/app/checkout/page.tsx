"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, ShieldCheck, QrCode, CreditCard, ChevronRight, Info, Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
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
        
        const { data: setts } = await supabase.from("store_settings").select("*").eq("id", 1).single();
        if (setts) setSettings(setts);
      }
      setLoading(false);
    };
    fetchCheckoutData();
  }, []);

  const itemTotal = products.reduce((sum, p) => sum + ((p.old_price || p.price) * (cart[p.id] || 0)), 0);
  const totalAmount = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);
  const productSavings = itemTotal - totalAmount;
  const finalAmount = totalAmount + (settings.shipping_charge || 0);

  const proceedToPayment = () => {
    if(!address.name || !address.phone || !address.street || !address.pincode) return alert("Please fill all address details securely.");
    localStorage.setItem("saved_address", JSON.stringify(address));
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert("Please select a payment method.");
    if (paymentMethod !== "COD" && !transactionId) return alert("Please enter the Transaction ID / UTR after completing the payment.");
    
    setIsProcessing(true);
    const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");
    const orderId = "RB-" + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `${address.street}, ${address.city} - ${address.pincode}`;

    let payGateway = paymentMethod;
    if (paymentMethod === "PhonePe" || paymentMethod === "Paytm" || paymentMethod === "QR") payGateway = "UPI";

    const { error } = await supabase.from("orders").insert([{
       order_id: orderId,
       customer_name: address.name,
       phone: address.phone,
       address: fullAddress,
       items: cart,
       total_amount: finalAmount,
       payment_method: payGateway,
       status: "pending",
       delivery_notes: payGateway === "UPI" ? `Method: ${paymentMethod} | Trx ID: ${transactionId}` : "COD Order"
    }]);

    if(!error) {
       await supabase.from("customers").upsert([{ name: address.name, phone: address.phone, total_orders: 1 }], { onConflict: 'phone' });
       localStorage.setItem("last_order_id", orderId);
       localStorage.removeItem("royal_cart");
       window.dispatchEvent(new Event("storage"));
       router.push('/success');
    } else {
       alert("Something went wrong! Please try again.");
       setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;
  if (Object.keys(cart).length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><p className="font-bold text-gray-500 mb-4">Cart is empty</p><button onClick={()=>router.push('/')} className="bg-[#5C3A21] text-white px-6 py-2 rounded-xl font-bold">Go to Shop</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 font-sans">
      <header className="bg-white px-4 h-14 flex items-center gap-3 shadow-sm sticky top-0 z-40 border-b">
         <button onClick={() => step === 2 ? setStep(1) : router.back()} className="p-2"><ArrowLeft className="h-6 w-6 text-black" /></button>
         <div>
            <h1 className="text-lg font-black text-gray-900">{step === 1 ? 'Delivery Address' : 'Payment Options'}</h1>
            {step === 2 && <p className="text-[10px] font-bold text-gray-500 uppercase">{Object.keys(cart).length} ITEM(S) • TO PAY: ₹{finalAmount}</p>}
         </div>
      </header>

      <main className="p-4">
         {/* STEP 1: RESTORED ADDRESS PAGE (DARK TEXT) */}
         {step === 1 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="text-sm font-black mb-4 flex items-center gap-2 text-black"><MapPin className="h-5 w-5 text-gray-700"/> Contact Details</h2>
                  <div className="space-y-3">
                     <input type="text" placeholder="Full Name" value={address.name} onChange={e=>setAddress({...address, name:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                     <input type="tel" placeholder="Mobile Number" value={address.phone} onChange={e=>setAddress({...address, phone:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                     <input type="text" placeholder="House No, Street, Landmark" value={address.street} onChange={e=>setAddress({...address, street:e.target.value})} className="w-full border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                     <div className="flex gap-3">
                        <input type="text" placeholder="City" value={address.city} onChange={e=>setAddress({...address, city:e.target.value})} className="w-1/2 border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                        <input type="number" placeholder="Pincode" value={address.pincode} onChange={e=>setAddress({...address, pincode:e.target.value})} className="w-1/2 border-2 border-gray-300 p-3 rounded-xl text-sm font-black text-black placeholder-gray-400 focus:outline-none focus:border-[#5C3A21]" />
                     </div>
                  </div>
               </div>

               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                  <h2 className="text-sm font-black mb-3 text-black">Order Summary</h2>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-2"><span>Total Items ({Object.keys(cart).length})</span><span>₹{totalAmount}</span></div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-3 border-b border-gray-200 pb-3"><span>Delivery Charge</span><span className="text-green-600">{settings.shipping_charge > 0 ? `₹${settings.shipping_charge}` : 'FREE'}</span></div>
                  <div className="flex justify-between text-lg font-black text-black"><span>Amount to Pay</span><span>₹{finalAmount}</span></div>
               </div>
            </div>
         )}

         {/* STEP 2: EXACT ORIGINAL PAYMENT UI REPLICA */}
         {step === 2 && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
               
               {/* Savings Banner */}
               {(productSavings > 0 || settings.shipping_charge === 0) && (
                  <div className="bg-[#F4FAFE] border border-[#E1F0FA] rounded-xl p-4 flex gap-3">
                     <div className="bg-white p-2 rounded-full shadow-sm shrink-0 h-10 w-10 flex items-center justify-center"><Truck className="h-5 w-5 text-[#5C3A21]"/></div>
                     <div>
                        <h4 className="text-sm font-black text-black">{settings.shipping_charge === 0 ? 'Free delivery applied!' : 'Awesome Savings!'}</h4>
                        <p className="text-xs font-bold text-[#8B5A2B]">You saved ₹{productSavings + (settings.shipping_charge === 0 ? 50 : 0)} on this order</p>
                     </div>
                  </div>
               )}

               {/* Bank & Wallet Offers Toggle UI */}
               <div>
                  <div className="flex justify-between items-end mb-2"><h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Bank & Wallet Offers</h3><span className="text-[10px] font-bold text-[#5C3A21]">View All</span></div>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                     <div className="border-2 border-[#5C3A21] bg-white p-2 rounded-xl flex items-center gap-2 min-w-[200px] shrink-0 shadow-sm"><span className="text-blue-600 text-xs font-black border border-blue-200 px-1.5 py-0.5 rounded">UPI</span><p className="text-[10px] text-gray-600 font-bold leading-tight">Eligible UPI offers, if any, are shown by your app.</p></div>
                     <div className="border border-gray-200 bg-white p-2 rounded-xl flex items-center gap-2 min-w-[200px] shrink-0 opacity-50"><CreditCard className="h-4 w-4 text-red-500 shrink-0"/><p className="text-[10px] text-gray-600 font-bold leading-tight">Card Payment on select bins.</p></div>
                  </div>
               </div>

               {/* RECOMMENDED UPI OPTIONS (Dynamic from Admin) */}
               <div>
                  <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 mt-4">Recommended UPI Options</h3>
                  <div className="space-y-3">
                     
                     {/* PhonePe - Only shows if Admin added ID */}
                     {settings.phonepe_upi && (
                        <div className={`border-2 rounded-2xl transition overflow-hidden ${paymentMethod === 'PhonePe' ? 'border-[#5C3A21] bg-white' : 'border-gray-200 bg-white'}`}>
                           <label className="flex items-center justify-between p-4 cursor-pointer">
                              <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 bg-[#5E2B97] rounded-xl flex items-center justify-center text-white font-black text-xl">पे</div>
                                 <div>
                                    <h4 className="text-sm font-black text-black flex items-center gap-2">PhonePe <span className="bg-[#FFF4E5] text-[#D48806] text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center"><Star className="h-2 w-2 fill-[#D48806] mr-0.5"/> Fast</span></h4>
                                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">Pay securely via PhonePe</p>
                                 </div>
                              </div>
                              <input type="radio" name="payment" value="PhonePe" onChange={(e)=>setPaymentMethod(e.target.value)} className="h-5 w-5 accent-[#5C3A21]" />
                           </label>
                           {/* Show UPI details input ONLY when selected */}
                           {paymentMethod === 'PhonePe' && (
                              <div className="px-4 pb-4 bg-[#FAFAFA] border-t border-gray-100 pt-3">
                                 <p className="text-[10px] font-bold text-gray-500 mb-2">1. Send ₹{finalAmount} to <span className="text-black font-black bg-gray-200 px-1 rounded">{settings.phonepe_upi}</span></p>
                                 <p className="text-[10px] font-bold text-gray-500 mb-1">2. Enter Transaction ID / UTR below:</p>
                                 <input type="text" placeholder="e.g. T2305281452..." value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="w-full border-2 border-gray-300 p-2.5 rounded-lg text-xs font-black text-black placeholder-gray-400 focus:border-[#5C3A21] focus:outline-none" />
                              </div>
                           )}
                        </div>
                     )}

                     {/* Paytm - Only shows if Admin added ID */}
                     {settings.paytm_upi && (
                        <div className={`border-2 rounded-2xl transition overflow-hidden ${paymentMethod === 'Paytm' ? 'border-[#5C3A21] bg-white' : 'border-gray-200 bg-white'}`}>
                           <label className="flex items-center justify-between p-4 cursor-pointer">
                              <div className="flex items-center gap-3">
                                 <div className="h-10 w-10 bg-[#002970] rounded-xl flex items-center justify-center text-white font-black text-[10px]">Paytm</div>
                                 <div><h4 className="text-sm font-black text-black">Paytm UPI</h4><p className="text-[10px] font-bold text-gray-500 mt-0.5">UPI payment option available</p></div>
                              </div>
                              <input type="radio" name="payment" value="Paytm" onChange={(e)=>setPaymentMethod(e.target.value)} className="h-5 w-5 accent-[#5C3A21]" />
                           </label>
                           {paymentMethod === 'Paytm' && (
                              <div className="px-4 pb-4 bg-[#FAFAFA] border-t border-gray-100 pt-3">
                                 <p className="text-[10px] font-bold text-gray-500 mb-2">1. Send ₹{finalAmount} to <span className="text-black font-black bg-gray-200 px-1 rounded">{settings.paytm_upi}</span></p>
                                 <p className="text-[10px] font-bold text-gray-500 mb-1">2. Enter Transaction ID / UTR below:</p>
                                 <input type="text" placeholder="e.g. 31456789..." value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="w-full border-2 border-gray-300 p-2.5 rounded-lg text-xs font-black text-black placeholder-gray-400 focus:border-[#5C3A21] focus:outline-none" />
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               </div>

               {/* SCAN & PAY */}
               {settings.qr_code_url && (
                  <div>
                     <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 mt-4">Scan & Pay</h3>
                     <div className={`border-2 rounded-2xl transition overflow-hidden ${paymentMethod === 'QR' ? 'border-[#5C3A21] bg-white' : 'border-gray-200 bg-white'}`}>
                        <label className="flex items-center justify-between p-4 cursor-pointer">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center"><QrCode className="h-6 w-6 text-gray-600"/></div>
                              <div><h4 className="text-sm font-black text-black">Scan QR Code</h4><p className="text-[10px] font-bold text-gray-500 mt-0.5">Use any UPI app to scan & pay</p></div>
                           </div>
                           <input type="radio" name="payment" value="QR" onChange={(e)=>setPaymentMethod(e.target.value)} className="h-5 w-5 accent-[#5C3A21]" />
                        </label>
                        {paymentMethod === 'QR' && (
                           <div className="px-4 pb-4 bg-[#FAFAFA] border-t border-gray-100 pt-3 flex flex-col items-center">
                              <img src={settings.qr_code_url} alt="Pay QR" className="h-40 w-40 object-contain border-4 border-white rounded-xl shadow-sm mb-3" />
                              <div className="w-full">
                                 <p className="text-[10px] font-bold text-gray-500 mb-1">Enter Transaction ID / UTR below after scanning:</p>
                                 <input type="text" placeholder="Transaction ID" value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="w-full border-2 border-gray-300 p-2.5 rounded-lg text-xs font-black text-black placeholder-gray-400 focus:border-[#5C3A21] focus:outline-none" />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* OTHER OPTIONS */}
               <div>
                  <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 mt-4">Other Options</h3>
                  <div className="space-y-3">
                     <div className="border border-gray-200 bg-gray-50 rounded-2xl p-4 flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3"><div className="h-10 w-10 bg-white border rounded-xl flex items-center justify-center"><CreditCard className="h-5 w-5 text-gray-400"/></div><div><h4 className="text-sm font-black text-gray-500">Credit / Debit Card</h4><p className="text-[10px] font-bold text-gray-400 mt-0.5">Temporarily unavailable</p></div></div>
                     </div>

                     {/* COD - Controlled strictly from Admin */}
                     {settings.cod_enabled && (
                        <label className={`border-2 rounded-2xl transition flex items-center justify-between p-4 cursor-pointer ${paymentMethod === 'COD' ? 'border-[#5C3A21] bg-white' : 'border-gray-200 bg-white'}`}>
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-[#F4FAFE] border border-[#E1F0FA] rounded-xl flex items-center justify-center"><div className="text-green-600 font-black text-xs">₹</div></div>
                              <div><h4 className="text-sm font-black text-black">Pay on Delivery (COD)</h4><p className="text-[10px] font-bold text-green-600 mt-0.5">Available for this order</p></div>
                           </div>
                           <input type="radio" name="payment" value="COD" onChange={(e)=>setPaymentMethod(e.target.value)} className="h-5 w-5 accent-[#5C3A21]" />
                        </label>
                     )}
                  </div>
               </div>

               {/* BILL DETAILS */}
               <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="font-black text-black text-sm mb-4">Bill Details</h3>
                  <div className="space-y-2 text-xs font-bold text-gray-600">
                     <div className="flex justify-between"><span>Item Total</span><span>₹{itemTotal}</span></div>
                     <div className="flex justify-between"><span>Product Savings</span><span className="text-green-600">- ₹{productSavings}</span></div>
                     <div className="flex justify-between pb-3 border-b border-gray-200 border-dashed"><span>Delivery Fee</span><span className="text-green-600">{settings.shipping_charge === 0 ? 'FREE' : `₹${settings.shipping_charge}`}</span></div>
                     <div className="flex justify-between text-sm font-black text-black pt-2"><span>To Pay</span><span>₹{finalAmount}</span></div>
                  </div>
               </div>

               {/* CANCELLATION POLICY */}
<div className="bg-gray-100 p-3 rounded-xl flex gap-3 items-start mt-4">
                  <Info className="h-4 w-4 text-gray-500 shrink-0 mt-0.5"/>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed"><span className="text-black">Cancellation Policy:</span> Orders cannot be cancelled once packed for delivery. In case of unexpected delays, refund will be provided, if applicable.</p>
               </div>
               
               <p className="text-center text-[10px] font-black text-gray-500 flex items-center justify-center gap-1 mt-4"><ShieldCheck className="h-3 w-3 text-[#5C3A21]"/> 100% Secure Payments</p>
            </div>
         )}
      </main>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50">
         {step === 1 ? (
            <button onClick={proceedToPayment} className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-xl shadow-md uppercase tracking-wider text-sm active:scale-[0.98] transition">PROCEED TO PAYMENT</button>
         ) : (
            <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-xl shadow-md text-sm active:scale-[0.98] transition flex justify-center items-center">
               {isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : `Pay securely â‚¹${finalAmount}`}
            </button>
         )}
      </div>
    </div>
  );
}
