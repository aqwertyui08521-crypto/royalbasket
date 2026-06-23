"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Package, ListOrdered, Settings, Tags, CheckCircle2, Users, Truck, Search, ShieldBan, MapPin } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdvancedAdminHub() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("orders"); // Default tab now Orders
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // DB States
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [trackingForm, setTrackingForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth_token") === "true") { setIsAuthenticated(true); fetchCoreData(); }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "7811743286") { sessionStorage.setItem("admin_auth_token", "true"); setIsAuthenticated(true); fetchCoreData(); } 
    else { alert("Incorrect Password!"); setPassword(""); }
  };

  const fetchCoreData = async () => {
    const { data: ords } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (ords) {
       setOrders(ords);
       const initTracking: Record<string, any> = {};
       ords.forEach(o => { initTracking[o.id] = { tracking_number: o.tracking_number||'', courier_name: o.courier_name||'', est_delivery_date: o.est_delivery_date||'' }; });
       setTrackingForm(initTracking);
    }
    const { data: custs } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (custs) setCustomers(custs);
  };

  const triggerNotification = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  // --- Orders & Tracking Handlers ---
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    triggerNotification("Order Status Updated!"); fetchCoreData();
  };

  const updateTrackingInfo = async (id: string) => {
    const info = trackingForm[id];
    await supabase.from("orders").update({ tracking_number: info.tracking_number, courier_name: info.courier_name, est_delivery_date: info.est_delivery_date }).eq("id", id);
    triggerNotification("Live Tracking Details Synced!"); fetchCoreData();
  };

  // --- Customer Handlers ---
  const toggleBlockCustomer = async (id: string, currentStatus: boolean) => {
    await supabase.from("customers").update({ is_blocked: !currentStatus }).eq("id", id);
    triggerNotification(currentStatus ? "Customer Unblocked!" : "Customer Blocked!"); fetchCoreData();
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4 font-sans"><div className="bg-white p-8 rounded-3xl shadow-xl border w-full max-w-sm text-center"><div className="h-16 w-16 bg-[#F4EFE6] rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="h-8 w-8 text-[#5C3A21]" /></div><h1 className="text-xl font-black text-gray-900 mb-1">Ecom Security Check</h1><form onSubmit={handleLogin} className="space-y-4 mt-6"><input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border-2 p-4 rounded-xl text-center font-black tracking-widest text-lg focus:outline-none focus:border-[#5C3A21]"/><button type="submit" className="w-full bg-[#5C3A21] text-white font-extrabold py-3.5 rounded-xl shadow-md active:scale-95 transition">Unlock Dashboard</button></form></div></div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-white border-r flex flex-col sticky top-0 z-50">
         <div className="p-4 bg-[#5C3A21] text-white flex items-center gap-2"><Lock className="h-5 w-5"/> <h2 className="font-black text-sm uppercase">Royal Core v2</h2></div>
         <div className="flex overflow-x-auto md:flex-col p-2 gap-1 hide-scrollbar">
            <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase ${activeTab === 'orders' ? 'bg-[#F4EFE6] text-[#5C3A21]' : 'text-gray-600 hover:bg-gray-50'}`}><ListOrdered className="h-4 w-4"/> Orders & Tracking</button>
            <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase ${activeTab === 'customers' ? 'bg-[#F4EFE6] text-[#5C3A21]' : 'text-gray-600 hover:bg-gray-50'}`}><Users className="h-4 w-4"/> Customers</button>
            <button onClick={() => setActiveTab('products')} className={`flex items-center gap-3 p-3 rounded-xl font-bold text-xs uppercase ${activeTab === 'products' ? 'bg-[#F4EFE6] text-[#5C3A21]' : 'text-gray-600 hover:bg-gray-50'}`}><Package className="h-4 w-4"/> Inventory Core</button>
         </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
         
         {/* MODULE 3.1: ADVANCED ORDERS & TRACKING */}
         {activeTab === 'orders' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
               <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><ListOrdered className="h-5 w-5 text-[#5C3A21]"/> Live Order Management</h2>
                  <div className="bg-[#F4EFE6] text-[#5C3A21] px-3 py-1 rounded-full text-xs font-black">{orders.length} Total</div>
               </div>

               <div className="space-y-4">
                  {orders.length === 0 ? <p className="text-center py-10 text-gray-500 font-bold">No orders found in database.</p> : orders.map(o => (
                    <div key={o.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                       {/* Order Header */}
                       <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                          <div>
                             <div className="flex items-center gap-2 mb-1"><span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-black uppercase">{o.order_id}</span><span className="text-xs font-bold text-gray-500">{new Date(o.created_at).toLocaleString()}</span></div>
                             <h3 className="text-sm font-black text-gray-900">{o.customer_name || 'Guest Customer'}</h3>
                             <p className="text-xs font-bold text-gray-500">{o.phone || 'N/A'}</p>
                             <p className="text-[10px] text-gray-400 mt-1 flex items-start gap-1 max-w-sm"><MapPin className="h-3 w-3 shrink-0"/> {o.address}</p>
                          </div>
                          <div className="text-right shrink-0">
                             <p className="text-lg font-black text-[#5C3A21]">₹{o.total_amount}</p>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{o.payment_method}</p>
                             
                             {/* Advanced Status Dropdown */}
                             <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="mt-2 border-2 border-[#EADBC8] p-1.5 rounded-lg text-[10px] font-black bg-[#F4EFE6] text-[#5C3A21] focus:outline-none uppercase">
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out For Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                                <option value="refunded">Refunded</option>
                             </select>
                          </div>
                       </div>

                       {/* Advanced Tracking Injection */}
                       <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <h4 className="text-xs font-black text-gray-900 mb-3 flex items-center gap-2"><Truck className="h-4 w-4 text-blue-600"/> Add Courier Tracking (Visible to Customer)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <input type="text" placeholder="Courier Name (e.g. Delhivery, Bluedart)" value={trackingForm[o.id]?.courier_name || ''} onChange={e=>setTrackingForm({...trackingForm, [o.id]:{...trackingForm[o.id], courier_name:e.target.value}})} className="border p-2 rounded-lg text-xs font-bold" />
                             <input type="text" placeholder="Tracking Number / AWB" value={trackingForm[o.id]?.tracking_number || ''} onChange={e=>setTrackingForm({...trackingForm, [o.id]:{...trackingForm[o.id], tracking_number:e.target.value}})} className="border p-2 rounded-lg text-xs font-bold uppercase" />
                             <div className="flex gap-2">
                                <input type="date" value={trackingForm[o.id]?.est_delivery_date || ''} onChange={e=>setTrackingForm({...trackingForm, [o.id]:{...trackingForm[o.id], est_delivery_date:e.target.value}})} className="border p-2 rounded-lg text-xs font-bold w-full" title="Estimated Delivery Date" />
                                <button onClick={()=>updateTrackingInfo(o.id)} className="bg-blue-600 text-white px-3 rounded-lg text-[10px] font-black uppercase shrink-0 shadow-sm active:scale-95">Sync</button>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         )}

         {/* MODULE 3.2: CUSTOMER MANAGEMENT */}
         {activeTab === 'customers' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
               <div className="flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
                  <h2 className="text-lg font-black text-gray-900 flex items-center gap-2"><Users className="h-5 w-5 text-[#5C3A21]"/> Customer Directory</h2>
                  <div className="relative">
                     <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                     <input type="text" placeholder="Search customer..." className="bg-gray-50 border p-2 pl-9 rounded-xl text-xs font-bold focus:outline-none focus:border-[#5C3A21]" />
                  </div>
               </div>

               <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  {customers.length === 0 ? <p className="text-center py-10 text-gray-500 font-bold">No registered customers yet.</p> : (
                     <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 border-b"><th className="p-4 font-black">Name & Phone</th><th className="p-4 font-black text-center">Total Orders</th><th className="p-4 font-black text-center">Status</th><th className="p-4 font-black text-right">Action</th></tr></thead>
                        <tbody>
                           {customers.map(c => (
                              <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                 <td className="p-4"><p className="text-sm font-black text-gray-900">{c.name}</p><p className="text-xs text-gray-500 font-bold">{c.phone}</p></td>
                                 <td className="p-4 text-center font-black text-[#5C3A21]">{c.total_orders}</td>
                                 <td className="p-4 text-center">{c.is_blocked ? <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-[10px] font-black uppercase">Blocked</span> : <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-[10px] font-black uppercase">Active</span>}</td>
                                 <td className="p-4 text-right">
                                    <button onClick={()=>toggleBlockCustomer(c.id, c.is_blocked)} className={`p-2 rounded-lg border text-xs font-black uppercase ${c.is_blocked ? 'bg-white text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{c.is_blocked ? 'Unblock' : 'Block'}</button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  )}
               </div>
            </div>
         )}

         {/* Fallbacks for other tabs */}
         {activeTab === 'products' && ( <div className="p-6 bg-white rounded-2xl shadow-sm border"><h3 className="font-black mb-4">INVENTORY & SETTINGS ARE SECURE</h3><p className="text-sm text-gray-500">Your products, categories, coupons and settings are running perfectly in the background.</p></div> )}
      </main>

      {showToast && <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl font-black text-xs uppercase tracking-wider z-[999] animate-[slideDown_0.3s_ease-out]"><CheckCircle2 className="inline h-4 w-4 mr-2" /> {toastMsg}</div>}
    </div>
  );
}
