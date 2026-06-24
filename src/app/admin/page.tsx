"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState("pay");
  const [data, setData] = useState<any>({ prods:[], cats:[], setts:{id:1}, revs:[], ords:[] });
  const [pForm, setPForm] = useState<any>({});
  const [rForm, setRForm] = useState<any>({});
  const [file, setFile] = useState<File|null>(null);

  useEffect(() => { if(sessionStorage.getItem("auth")==="1"){ setAuth(true); load(); } }, []);

  const load = async () => {
    const [p, c, s, r, o] = await Promise.all([
      supabase.from("products").select("*").order("created_at",{ascending:false}),
      supabase.from("categories").select("*"),
      supabase.from("store_settings").select("*").eq("id",1).single(),
      supabase.from("product_reviews").select("*").order("created_at",{ascending:false}),
      supabase.from("orders").select("*").order("created_at",{ascending:false})
    ]);
    setData({ prods: p.data||[], cats: c.data||[], setts: s.data||{id:1}, revs: r.data||[], ords: o.data||[] });
  };

  const upload = async (f: File) => {
    const name = `${Date.now()}_${f.name}`;
    await supabase.storage.from("images").upload(name, f);
    return supabase.storage.from("images").getPublicUrl(name).data.publicUrl;
  };

  const saveSett = async () => { await supabase.from("store_settings").upsert(data.setts); load(); alert("Saved successfully!"); };

  const saveProd = async (e:any) => {
    e.preventDefault();
    let url = pForm.gallery_urls;
    if(file) { alert("Uploading photo from gallery..."); url = await upload(file); }
    const payload = {...pForm, price: Number(pForm.price||0), image_gallery: url ? [url] : []};
    if(pForm.id) await supabase.from("products").update(payload).eq("id", pForm.id);
    else await supabase.from("products").insert([payload]);
    setPForm({}); setFile(null); load(); alert("Product Saved!");
  };

  const saveRev = async (e:any) => {
    e.preventDefault();
    let url = rForm.photo_url;
    if(file) { alert("Uploading photo from gallery..."); url = await upload(file); }
    const payload = {...rForm, photo_url: url};
    if(rForm.id) await supabase.from("product_reviews").update(payload).eq("id", rForm.id);
    else await supabase.from("product_reviews").insert([payload]);
    setRForm({}); setFile(null); load(); alert("Review Saved!");
  };

  const del = async (table:string, id:string) => { if(confirm("Delete permanently?")){ await supabase.from(table).delete().eq("id",id); load(); } };

  if(!auth) return <div className="p-10 text-center"><input id="pwd" type="password" placeholder="Passcode" className="border-2 p-3 rounded-xl mb-3 w-full max-w-xs font-black"/><br/><button onClick={()=>{if((document.getElementById('pwd') as HTMLInputElement).value==="7811743286"){sessionStorage.setItem("auth","1");setAuth(true);load();}}} className="bg-[#5C3A21] text-white p-3 rounded-xl font-black w-full max-w-xs tracking-widest">LOGIN</button></div>;

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen font-sans">
      <aside className="w-full md:w-56 bg-white border-r p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto">
        <h2 className="font-black text-[#5C3A21] mb-4 hidden md:block">ADMIN PANEL</h2>
        {[{id:'pay', icon:'💳', label:'Payments'}, {id:'products', icon:'📦', label:'Products'}, {id:'reviews', icon:'⭐', label:'Reviews'}, {id:'orders', icon:'🛒', label:'Orders'}].map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-xs uppercase min-w-max ${tab===t.id?'bg-[#F4EFE6] text-[#5C3A21]':'text-gray-600 hover:bg-gray-100'}`}>{t.icon} {t.label}</button>
        ))}
      </aside>

      <main className="flex-1 p-4 overflow-y-auto">
        {tab === "pay" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm max-w-xl space-y-4">
            <h3 className="font-black uppercase">💳 Payment & UPI Settings</h3>
            <div><label className="text-xs font-bold">PhonePe UPI ID</label><input type="text" value={data.setts.phonepe_upi||''} onChange={e=>setData({...data, setts:{...data.setts, phonepe_upi:e.target.value}})} className="w-full border-2 p-3 rounded-xl text-sm font-bold"/></div>
            <div><label className="text-xs font-bold">Paytm / GPay UPI ID</label><input type="text" value={data.setts.paytm_upi||''} onChange={e=>setData({...data, setts:{...data.setts, paytm_upi:e.target.value}})} className="w-full border-2 p-3 rounded-xl text-sm font-bold"/></div>
            <div><label className="text-xs font-bold">QR Code Link</label><input type="text" value={data.setts.qr_code_url||''} onChange={e=>setData({...data, setts:{...data.setts, qr_code_url:e.target.value}})} className="w-full border-2 p-3 rounded-xl text-sm font-bold"/></div>
            <label className="flex items-center gap-2 font-bold text-sm"><input type="checkbox" checked={data.setts.cod_enabled||false} onChange={e=>setData({...data, setts:{...data.setts, cod_enabled:e.target.checked}})} className="h-5 w-5"/> Enable Cash on Delivery</label>
            <button onClick={saveSett} className="w-full bg-[#5C3A21] text-white p-4 rounded-xl font-black uppercase">Save Settings</button>
          </div>
        )}

        {tab === "products" && (
          <div className="space-y-6">
            <form onSubmit={saveProd} className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl space-y-3">
              <h3 className="font-black uppercase">{pForm.id ? '✏️ Edit Product' : '📦 Add Product'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Name" value={pForm.name||''} onChange={e=>setPForm({...pForm, name:e.target.value})} className="border-2 p-2 rounded-lg font-bold text-sm" required/>
                <input type="number" placeholder="Price" value={pForm.price||''} onChange={e=>setPForm({...pForm, price:e.target.value})} className="border-2 p-2 rounded-lg font-bold text-sm" required/>
                <select value={pForm.category||''} onChange={e=>setPForm({...pForm, category:e.target.value})} className="border-2 p-2 rounded-lg font-bold text-sm bg-white"><option value="">Category...</option>{data.cats.map((c:any)=><option key={c.id}>{c.name}</option>)}</select>
                <input type="text" placeholder="Weight (e.g. 1Kg)" value={pForm.weight||''} onChange={e=>setPForm({...pForm, weight:e.target.value})} className="border-2 p-2 rounded-lg font-bold text-sm"/>
              </div>
              <div className="border-2 border-dashed p-4 rounded-xl text-center bg-gray-50">
                <label className="text-xs font-black cursor-pointer">🖼️ Upload Photo from Gallery <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="hidden"/></label>
                {file && <p className="text-[10px] text-green-600 mt-1">{file.name} selected</p>}
              </div>
              <button type="submit" className="w-full bg-[#5C3A21] text-white p-3 rounded-lg font-black uppercase">{pForm.id ? 'Update' : 'Save'} Product</button>
              {pForm.id && <button type="button" onClick={()=>{setPForm({}); setFile(null);}} className="w-full bg-gray-200 p-2 rounded-lg font-bold text-xs">Cancel Edit</button>}
            </form>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm max-w-2xl">
              <h3 className="font-black mb-3">Live Products ({data.prods.length})</h3>
              {data.prods.map((p:any) => <div key={p.id} className="flex justify-between items-center border-b py-2"><span className="text-sm font-bold">{p.name} (₹{p.price})</span><div className="space-x-3"><button onClick={()=>setPForm(p)} className="text-blue-600 font-bold text-xs">Edit</button><button onClick={()=>del("products", p.id)} className="text-red-500 font-bold text-xs">Del</button></div></div>)}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-6">
            <form onSubmit={saveRev} className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl space-y-3">
              <h3 className="font-black uppercase">{rForm.id ? '✏️ Edit Review' : '⭐ Add Review'}</h3>
              <select value={rForm.product_id||''} onChange={e=>setRForm({...rForm, product_id:e.target.value})} className="w-full border-2 p-3 rounded-xl font-bold text-sm"><option value="">Select Product...</option>{data.prods.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Customer Name" value={rForm.customer_name||''} onChange={e=>setRForm({...rForm, customer_name:e.target.value})} className="border-2 p-3 rounded-xl font-bold text-sm" required/>
                <input type="number" placeholder="Rating (1-5)" value={rForm.rating||''} onChange={e=>setRForm({...rForm, rating:e.target.value})} className="border-2 p-3 rounded-xl font-bold text-sm"/>
              </div>
              <textarea placeholder="Review Comment..." value={rForm.review_text||''} onChange={e=>setRForm({...rForm, review_text:e.target.value})} className="w-full border-2 p-3 rounded-xl font-bold text-sm"/>
              <div className="border-2 border-dashed p-4 rounded-xl text-center bg-gray-50">
                <label className="text-xs font-black cursor-pointer">🖼️ Upload Photo from Gallery <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="hidden"/></label>
                {file && <p className="text-[10px] text-green-600 mt-1">{file.name} selected</p>}
              </div>
              <button type="submit" className="w-full bg-[#5C3A21] text-white p-3 rounded-lg font-black uppercase">{rForm.id ? 'Update' : 'Save'} Review</button>
              {rForm.id && <button type="button" onClick={()=>{setRForm({}); setFile(null);}} className="w-full bg-gray-200 p-2 rounded-lg font-bold text-xs">Cancel Edit</button>}
            </form>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm max-w-2xl">
              <h3 className="font-black mb-3">Live Reviews</h3>
              {data.revs.map((r:any) => <div key={r.id} className="border-b py-3"><p className="font-black">{r.customer_name} <span className="text-amber-500">({r.rating}★)</span></p><p className="text-sm my-1">{r.review_text}</p>{r.photo_url && <img src={r.photo_url} className="h-16 w-16 object-cover rounded"/>}<div className="space-x-3 mt-2"><button onClick={()=>setRForm(r)} className="text-blue-600 font-bold text-xs">Edit</button><button onClick={()=>del("product_reviews", r.id)} className="text-red-500 font-bold text-xs">Del</button></div></div>)}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm max-w-2xl">
            <h3 className="font-black uppercase mb-4">🛒 Recent Orders</h3>
            {data.ords.length===0 ? <p className="text-gray-500 font-bold">No orders yet.</p> : data.ords.map((o:any)=>(<div key={o.id} className="border-b py-3 flex justify-between items-center text-sm"><div><p className="font-black">{o.order_id}</p><p className="text-gray-600">{o.customer_name} • ₹{o.total_amount}</p></div><span className="bg-[#F4EFE6] text-[#5C3A21] px-2 py-1 rounded font-black uppercase text-xs">{o.status}</span></div>))}
          </div>
        )}
      </main>
    </div>
  );
}
