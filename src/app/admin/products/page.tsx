"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: "", price: "", sale_price: "", category: "Premium Combo", weight: "1 Kg", image_url: "", description: "", rating: "4.5", reviews_count: "10" });

  useEffect(() => { fetchProducts(); fetchBanners(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("id", { ascending: false });
    if (data) setBanners(data);
  };

  const uploadBanner = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const { data } = await supabase.storage.from('images').upload(`banners/${Date.now()}.jpg`, file);
    if (data) {
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      await supabase.from("banners").insert([{ image_url: urlData.publicUrl }]);
      window.location.reload();
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const data = { ...form, price: Number(form.price), sale_price: Number(form.sale_price), rating: Number(form.rating), reviews_count: Number(form.reviews_count) };
    if (form.id) await supabase.from("products").update(data).eq("id", form.id);
    else await supabase.from("products").insert([data]);
    window.location.reload();
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Banner Section */}
      <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
        <h2 className="font-bold mb-2">Upload Banners</h2>
        <input type="file" accept="image/*" onChange={uploadBanner} />
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {banners.map(b => <img key={b.id} src={b.image_url} className="w-20 h-20 object-cover rounded" />)}
        </div>
      </div>

      {/* Product List */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">Products</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#5C3A21] text-white px-4 py-2 rounded-xl text-sm font-bold">+ Add</button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl flex gap-4 items-center shadow-sm">
            <img src={p.image_url} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-xs text-gray-500">₹{p.sale_price}</p>
            </div>
            <button onClick={() => { setForm(p); setIsModalOpen(true); }} className="text-blue-600 font-bold text-sm">Edit</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <input placeholder="Name" className="w-full border p-2 mb-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input placeholder="Price" className="w-full border p-2 mb-2" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            <input placeholder="Sale Price" className="w-full border p-2 mb-2" value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} />
            <button onClick={handleSave} className="w-full bg-[#5C3A21] text-white py-2 rounded-lg font-bold">{loading ? "Saving..." : "Save Product"}</button>
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-2 text-gray-500">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
