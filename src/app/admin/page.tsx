"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Package, CreditCard, Save, CheckCircle2, Store, QrCode, Plus, Trash2, Image as ImageIcon, ListOrdered, Truck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // States
  const [settings, setSettings] = useState({ phonepe_upi: "", paytm_upi: "", qr_code_url: "", gateway_key: "", cod_enabled: true, support_phone: "", store_address: "" });
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", weight: "1 Kg", category: "Premium" });
  const [banners, setBanners] = useState<any[]>([]);
  const [newBanner, setNewBanner] = useState({ title: "", subtitle: "", image_url: "" });
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Settings
    const { data: setts } = await supabase.from("store_settings").select("*").eq("id", 1).single();
    if (setts) setSettings(setts);
    // Fetch Products
    const { data: prods } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (prods) setProducts(prods);
    // Fetch Banners
    const { data: bans } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    if (bans) setBanners(bans);
    // Fetch Orders
    const { data: ords } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (ords) setOrders(ords);
    setLoading(false);
  };

  const showNotification = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  // Handlers
  const handleSaveSettings = async () => {
    await supabase.from("store_settings").upsert({ id: 1, ...settings });
    showNotification("Settings Saved Successfully!");
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await supabase.from("products").insert([{ ...newProduct, price: parseFloat(newProduct.price) }]);
    setNewProduct({ name: "", price: "", weight: "1 Kg", category: "Premium" });
    fetchData(); showNotification("Product Added!");
  };

  const handleAddBanner = async () => {
    if (!newBanner.title || !newBanner.image_url) return;
    await supabase.from("banners").insert([newBanner]);
    setNewBanner({ title: "", subtitle: "", image_url: "" });
    fetchData(); showNotification("Banner Added!");
  };

  const handleDelete = async (table: string, id: string) => {
    if(confirm("Are you sure?")) { await supabase.from(table).delete().eq("id", id); fetchData(); }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData(); showNotification("Order Status Updated!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C3A21]"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32">
      <header className="bg-[#5C3A21] text-white p-4 sticky top-0 z-40 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2"><Store className="h-6 w-6" /><h1 className="text-xl font-black">Admin HQ</h1></div>
        <button onClick={() => router.push('/')} className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">View Store</button>
      </header>

      <div className="bg-white border-b border-gray-200 flex overflow-x-auto hide-scrollbar sticky top-14 z-30 shadow-sm">
        <button onClick={() => setActiveTab('orders')} className={`px-5 py-4 text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'orders' ? 'border-[#5C3A21] text-[#5C3A21]' : 'border-transparent text-gray-500'}`}><ListOrdered className="h-4 w-4"/> Orders</button>
        <button onClick={() => setActiveTab('products')} className={`px-5 py-4 text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'products' ? 'border-[#5C3A21] text-[#5C3A21]' : 'border-transparent text-gray-500'}`}><Package className="h-4 w-4"/> Products</button>
        <button onClick={() => setActiveTab('banners')} className={`px-5 py-4 text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'banners' ? 'border-[#5C3A21] text-[#5C3A21]' : 'border-transparent text-gray-500'}`}><ImageIcon className="h-4 w-4"/> Banners</button>
        <button onClick={() => setActiveTab('payments')} className={`px-5 py-4 text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'payments' ? 'border-[#5C3A21] text-[#5C3A21]' : 'border-transparent text-gray-500'}`}><CreditCard className="h-4 w-4"/> Payments</button>
        <button onClick={() => setActiveTab('settings')} className={`px-5 py-4 text-sm font-extrabold whitespace-nowrap flex items-center gap-2 border-b-2 ${activeTab === 'settings' ? 'border-[#5C3A21] text-[#5C3A21]' : 'border-transparent text-gray-500'}`}><Settings className="h-4 w-4"/> Settings</button>
      </div>

      <main className="p-4">
         {/* ORDERS TAB */}
         {activeTab === 'orders' && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
               <h2 className="text-sm font-black text-gray-900 mb-2">Live Orders ({orders.length})</h2>
               {orders.length === 0 ? <p className="text-xs text-gray-500">No orders yet.</p> : orders.map(o => (
                 <div key={o.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
                       <div><span className="text-[10px] font-bold bg-[#F4EFE6] text-[#5C3A21] px-2 py-1 rounded">{o.order_id}</span><p className="text-xs font-bold text-gray-900 mt-2">{o.customer_name || 'Customer'}</p><p className="text-[10px] text-gray-500">{o.phone || 'No phone'}</p></div>
                       <div className="text-right"><p className="text-sm font-black text-[#5C3A21]">₹{o.total_amount}</p><p className="text-[10px] font-bold text-gray-500 uppercase">{o.payment_method}</p></div>
                    </div>
                    <div className="mb-3"><p className="text-[10px] text-gray-600 line-clamp-2">{o.address}</p></div>
                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="w-full border border-gray-200 p-2 rounded-lg text-xs font-bold bg-gray-50 focus:outline-none">
                       <option value="processing">Processing</option>
                       <option value="shipped">Shipped</option>
                       <option value="delivered">Delivered</option>
                    </select>
                 </div>
               ))}
            </div>
         )}

         {/* PRODUCTS TAB */}
         {activeTab === 'products' && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-[#5C3A21]"/> Add Product</h2>
                  <div className="space-y-3">
                     <input type="text" placeholder="Product Name" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                     <div className="flex gap-3">
                        <input type="number" placeholder="Price (₹)" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-1/2 border p-3 rounded-xl text-sm" />
                        <input type="text" placeholder="Weight (e.g. 1 Kg)" value={newProduct.weight} onChange={e=>setNewProduct({...newProduct, weight: e.target.value})} className="w-1/2 border p-3 rounded-xl text-sm" />
                     </div>
                     <button onClick={handleAddProduct} className="w-full bg-[#5C3A21] text-white font-bold py-3 rounded-xl text-sm">Add to Database</button>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4">All Products</h2>
                  <div className="space-y-3">
                     {products.map(p => (
                        <div key={p.id} className="flex justify-between items-center border p-3 rounded-xl bg-gray-50">
                           <div><h4 className="text-sm font-bold text-gray-900">{p.name}</h4><p className="text-[10px] text-gray-500">₹{p.price} • {p.weight}</p></div>
                           <button onClick={() => handleDelete("products", p.id)} className="bg-red-100 p-2 rounded-lg"><Trash2 className="h-4 w-4 text-red-500"/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* BANNERS TAB */}
         {activeTab === 'banners' && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-[#5C3A21]"/> Add Home Banner</h2>
                  <div className="space-y-3">
                     <input type="text" placeholder="Title (e.g. Mega Sale)" value={newBanner.title} onChange={e=>setNewBanner({...newBanner, title: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                     <input type="text" placeholder="Subtitle" value={newBanner.subtitle} onChange={e=>setNewBanner({...newBanner, subtitle: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                     <input type="text" placeholder="Image URL or Emoji (e.g. 🌰)" value={newBanner.image_url} onChange={e=>setNewBanner({...newBanner, image_url: e.target.value})} className="w-full border p-3 rounded-xl text-sm" />
                     <button onClick={handleAddBanner} className="w-full bg-[#5C3A21] text-white font-bold py-3 rounded-xl text-sm">Add Banner</button>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4">Active Banners</h2>
                  <div className="space-y-3">
                     {banners.map(b => (
                        <div key={b.id} className="flex justify-between items-center border p-3 rounded-xl bg-gray-50">
                           <div><h4 className="text-sm font-bold text-gray-900">{b.title}</h4><p className="text-[10px] text-gray-500">{b.subtitle}</p></div>
                           <button onClick={() => handleDelete("banners", b.id)} className="bg-red-100 p-2 rounded-lg"><Trash2 className="h-4 w-4 text-red-500"/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         {/* PAYMENTS TAB */}
         {activeTab === 'payments' && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-[#5C3A21]"/> UPI Configuration</h2>
                  <div className="space-y-4">
                     <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">PhonePe UPI ID</label><input type="text" value={settings.phonepe_upi} onChange={(e) => setSettings({...settings, phonepe_upi: e.target.value})} className="w-full border p-3 rounded-xl text-sm" /></div>
                     <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Paytm UPI ID</label><input type="text" value={settings.paytm_upi} onChange={(e) => setSettings({...settings, paytm_upi: e.target.value})} className="w-full border p-3 rounded-xl text-sm" /></div>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2"><QrCode className="h-5 w-5 text-[#5C3A21]"/> QR Code Link</h2>
                  <input type="text" value={settings.qr_code_url} onChange={(e) => setSettings({...settings, qr_code_url: e.target.value})} className="w-full border p-3 rounded-xl text-sm mb-3" />
                  {settings.qr_code_url && <img src={settings.qr_code_url} alt="QR" className="h-24 w-24 border-2 border-dashed rounded-xl p-1 object-contain" />}
               </div>
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div><h2 className="text-sm font-black text-gray-900">COD Enable</h2></div>
                  <button onClick={() => setSettings({...settings, cod_enabled: !settings.cod_enabled})} className={`w-12 h-6 rounded-full relative transition-colors ${settings.cod_enabled ? 'bg-green-500' : 'bg-gray-300'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.cod_enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div></button>
               </div>
            </div>
         )}

         {/* SETTINGS TAB */}
         {activeTab === 'settings' && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-[#5C3A21]"/> Store Details</h2>
                  <div className="space-y-4">
                     <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Support Phone / WhatsApp</label><input type="text" value={settings.support_phone} onChange={(e) => setSettings({...settings, support_phone: e.target.value})} className="w-full border p-3 rounded-xl text-sm" /></div>
                     <div><label className="text-xs font-bold text-gray-600 mb-1.5 block">Store Address</label><textarea value={settings.store_address} onChange={(e) => setSettings({...settings, store_address: e.target.value})} rows={3} className="w-full border p-3 rounded-xl text-sm" /></div>
                  </div>
               </div>
            </div>
         )}
      </main>

      {(activeTab === 'payments' || activeTab === 'settings') && (
         <div className="fixed bottom-6 left-4 right-4 z-50">
            <button onClick={handleSaveSettings} className="w-full bg-[#5C3A21] text-white font-extrabold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition">
               <Save className="h-5 w-5" /> Save Changes
            </button>
         </div>
      )}

      {showToast && (
         <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 z-50 animate-[slideDown_0.3s_ease-out]">
            <CheckCircle2 className="h-5 w-5" /> {toastMsg}
         </div>
      )}
    </div>
  );
}
