"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tempUrl, setTempUrl] = useState("");

  const [form, setForm] = useState({
    id: null, name: "", description: "", price: "", sale_price: "", 
    category: "Premium Combo", weight: "1 Kg", 
    image_url: "", gallery: [] as string[], in_stock: true, is_active: true
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (error) console.error("Fetch Error:", error.message);
    if (data) {
      setProducts(data);
      // Extract unique categories to help user choose easily
      const cats = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
      setExistingCategories(cats as string[]);
    }
  };

  const calculateDiscount = (mrp: number, sale: number) => {
    if (!mrp || !sale || mrp <= sale) return 0;
    return Math.round(((mrp - sale) / mrp) * 100);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newGallery = [...form.gallery];
      let mainImage = form.image_url;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        
        if (uploadError) {
          alert("Image Upload Error: " + uploadError.message);
          setUploading(false);
          return;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        if (!mainImage) mainImage = data.publicUrl;
        newGallery.push(data.publicUrl);
      }

      setForm({ ...form, image_url: mainImage, gallery: newGallery });
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const addManualUrl = () => {
    if (tempUrl) {
      const newGallery = [...form.gallery, tempUrl];
      setForm({ ...form, gallery: newGallery, image_url: form.image_url || tempUrl });
      setTempUrl("");
    }
  };

  const removeImage = (index: number) => {
    const newGallery = [...form.gallery];
    newGallery.splice(index, 1);
    setForm({ ...form, gallery: newGallery, image_url: newGallery.length > 0 ? newGallery[0] : "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const finalImageUrl = form.image_url || (form.gallery && form.gallery.length > 0 ? form.gallery[0] : "");

    const productData = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      sale_price: Number(form.sale_price) > 0 ? Number(form.sale_price) : Number(form.price),
      category: form.category,
      weight: form.weight,
      image_url: finalImageUrl,
      gallery: form.gallery,
      in_stock: form.in_stock,
      is_active: form.is_active
    };

    let saveError = null;

    if (form.id) {
      const { error } = await supabase.from("products").update(productData).eq("id", form.id);
      saveError = error;
    } else {
      const { error } = await supabase.from("products").insert([productData]);
      saveError = error;
    }
    
    setLoading(false);

    if (saveError) {
      alert("❌ Database Error: " + saveError.message);
    } else {
      setIsModalOpen(false);
      fetchProducts();
    }
  };

  const editProduct = (p: any) => {
    setForm({ 
      id: p.id, name: p.name || "", description: p.description || "", 
      price: p.price || "", sale_price: p.sale_price || "", 
      category: p.category || "Premium Combo", weight: p.weight || "1 Kg", 
      image_url: p.image_url || "", gallery: p.gallery || [], 
      in_stock: p.in_stock ?? true, is_active: p.is_active ?? true 
    });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) alert("Delete Error: " + error.message);
      else fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans text-gray-900 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">Products List</h1>
          <button onClick={() => {
              setForm({ id: null, name: "", description: "", price: "", sale_price: "", category: "Premium Combo", weight: "1 Kg", image_url: "", gallery: [], in_stock: true, is_active: true });
              setIsModalOpen(true);
            }} 
            className="bg-[#5C3A21] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
          >
            + Add Product
          </button>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm mb-6 border border-gray-100 flex items-center gap-3">
          <span>🔍</span>
          <input type="text" placeholder="Search..." className="w-full bg-transparent outline-none font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase())).map((p) => {
            const discount = calculateDiscount(p.price, p.sale_price);
            const displayImg = p.image_url || (p.gallery && p.gallery.length > 0 ? p.gallery[0] : "https://placehold.co/100x100/eeeeee/999999?text=No+Image");
            
            return (
              <div key={p.id} className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative ${!p.is_active ? 'opacity-50' : ''}`}>
                {!p.is_active && <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded">HIDDEN</span>}
                <img src={displayImg} className="w-20 h-20 rounded-xl object-cover bg-gray-50 border border-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-gray-800 leading-tight">{p.name}</h3>
                  <p className="text-[10px] text-gray-500 font-bold mt-1">{p.weight} • {p.category}</p>
                  <div className="mt-1 flex items-center flex-wrap gap-1">
                    <span className="font-black text-[#5C3A21] text-sm">₹{p.sale_price || p.price}</span>
                    {p.sale_price && p.sale_price < p.price && <span className="text-[10px] text-gray-400 line-through ml-1">₹{p.price}</span>}
                    {discount > 0 && <span className="bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1">{discount}% OFF</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => editProduct(p)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold w-full">Edit</button>
                    <button onClick={() => deleteProduct(p.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold w-full">Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center sm:p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-black">{form.id ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-100 w-8 h-8 rounded-full font-bold">✕</button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">1. Upload from Gallery</label>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="gallery-upload" />
                <label htmlFor="gallery-upload" className="w-full bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer active:bg-gray-50">
                  <span className="text-2xl">📸</span>
                  <span className="font-bold text-sm text-[#5C3A21] mt-1">Select Multiple Photos</span>
                  {uploading && <span className="text-xs font-bold text-blue-600 mt-1">Uploading...</span>}
                </label>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">OR 2. Paste Image Link</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Paste URL here..." className="w-full bg-white border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={tempUrl} onChange={e=>setTempUrl(e.target.value)} />
                    <button type="button" onClick={addManualUrl} className="bg-[#5C3A21] text-white px-4 rounded-xl font-bold text-sm">Add</button>
                  </div>
                </div>

                {form.gallery.length > 0 && (
                  <div className="flex gap-3 mt-5 overflow-x-auto pb-2">
                    {form.gallery.map((img, i) => (
                      <div key={i} className="relative min-w-[60px]">
                        <img src={img} className="w-16 h-16 object-cover rounded-lg border border-gray-300 shadow-sm" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600">✕</button>
                        {i === 0 && <span className="absolute -bottom-2 left-1 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">MAIN</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Product Name</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">MRP (Old Price)</label>
                    <input required type="number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.price} onChange={e=>setForm({...form, price: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sale Price</label>
                    <input required type="number" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.sale_price} onChange={e=>setForm({...form, sale_price: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Weight (e.g. 1Kg)</label>
                    <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.weight} onChange={e=>setForm({...form, weight: e.target.value})} />
                  </div>
                  <div>
                    {/* Dynamic Category Input Box that allows custom typing to ADD a category, or picking existing ones */}
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Category (Type New or Pick below)</label>
                    <input 
                      required 
                      list="existing-categories"
                      placeholder="e.g. Almonds, Walnuts"
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" 
                      value={form.category} 
                      onChange={e=>setForm({...form, category: e.target.value})} 
                    />
                    <datalist id="existing-categories">
                      {existingCategories.map((c, i) => <option key={i} value={c} />)}
                      <option value="Premium Combo" />
                      <option value="Daily Use" />
                      <option value="Gift Box" />
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
                  <textarea rows={3} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl font-medium outline-none text-sm" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1 cursor-pointer">
                  <input type="checkbox" checked={form.in_stock} onChange={e=>setForm({...form, in_stock: e.target.checked})} className="w-4 h-4 accent-[#5C3A21]" />
                  <span className="font-bold text-xs">In Stock</span>
                </label>
                <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active: e.target.checked})} className="w-4 h-4 accent-[#5C3A21]" />
                  <span className="font-bold text-xs">Show Global</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 bg-white rounded-b-3xl">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold">Cancel</button>
              <button onClick={handleSave} disabled={loading || uploading} className="flex-1 bg-[#5C3A21] text-white py-3.5 rounded-xl font-bold">
                {loading ? "Saving..." : "Save Globally"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
