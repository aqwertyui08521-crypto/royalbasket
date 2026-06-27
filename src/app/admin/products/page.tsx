"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null, name: "", description: "", price: "", sale_price: "", category: "", weight: "", 
    rating: "4.5", reviews_count: "10", image_url: "", gallery: []
  });

  useEffect(() => { fetchProducts(); fetchBanners(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) setProducts(data);
  };

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("id", { ascending: false });
    if (data) setBanners(data);
  };

  const handleBannerUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const { data } = await supabase.storage.from('images').upload(`banners/${Date.now()}.jpg`, file);
    if (data) {
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path);
      await supabase.from("banners").insert([{ image_url: urlData.publicUrl }]);
      fetchBanners();
    }
  };

  const handleSave = async () => {
    const data = { ...form, price: Number(form.price), sale_price: Number(form.sale_price) };
    if (form.id) await supabase.from("products").update(data).eq("id", form.id);
    else await supabase.from("products").insert([data]);
    setIsModalOpen(false);
    fetchProducts();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-4 rounded-xl mb-6 shadow-sm">
        <h2 className="font-bold mb-2">Banners</h2>
        <input type="file" onChange={handleBannerUpload} />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-xl">Products</h2>
        <button onClick={() => { setForm({id: null, name: "", description: "", price: "", sale_price: "", category: "", weight: "", rating: "4.5", reviews_count: "10", image_url: "", gallery: []}); setIsModalOpen(true); }} className="bg-[#5C3A21] text-white px-4 py-2 rounded-xl text-sm font-bold">+ Add New</button>
      </div>

      <div className="grid gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-sm text-gray-500">₹{p.sale_price}</p>
            </div>
            <button onClick={() => { setForm(p); setIsModalOpen(true); }} className="text-blue-600 font-bold">Edit</button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
            <h2 className="font-bold mb-4">{form.id ? "Edit Product" : "Add Product"}</h2>
            <input placeholder="Name" className="w-full border p-2 mb-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <textarea placeholder="Description" className="w-full border p-2 mb-2 rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Price" className="border p-2 rounded" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              <input placeholder="Sale Price" className="border p-2 rounded" value={form.sale_price} onChange={e => setForm({...form, sale_price: e.target.value})} />
            </div>
            <input placeholder="Category" className="w-full border p-2 mb-2 rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            <input placeholder="Weight" className="w-full border p-2 mb-2 rounded" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
            <button onClick={handleSave} className="w-full bg-[#5C3A21] text-white py-2 rounded-lg font-bold mt-4">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
