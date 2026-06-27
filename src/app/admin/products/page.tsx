"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const bannerInputRef = useRef<HTMLInputElement>(null); // নতুন: ইনপুট রিফ্রেশ করার জন্য

  const [form, setForm] = useState({
    id: null, name: "", description: "", price: "", sale_price: "", 
    category: "Premium Combo", weight: "1 Kg", 
    image_url: "", gallery: [] as string[], in_stock: true, is_active: true,
    rating: "4.5", reviews_count: "10"
  });

  useEffect(() => {
    fetchProducts();
    fetchBanners();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
    if (data) {
      setProducts(data);
      const cats = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
      setExistingCategories(cats as string[]);
    }
  };

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("id", { ascending: false });
    if (data) setBanners(data);
  };

  // আপডেট করা ব্যানার আপলোড ফাংশন
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingBanner(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `banner-${Date.now()}-${i}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) continue;

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        await supabase.from("banners").insert([{ image_url: data.publicUrl }]);
      }
      
      fetchBanners();
      // ফিক্স: ইনপুট রিফ্রেশ করা যাতে পরেরবার ক্লিক করলেই আবার ওপেন হয়
      if (bannerInputRef.current) bannerInputRef.current.value = "";
      alert("✅ Uploaded successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const deleteBanner = async (id: number) => {
    if (window.confirm("Delete this banner?")) {
      await supabase.from("banners").delete().eq("id", id);
      fetchBanners();
    }
  };

  // ... (অন্যান্য ফাংশন আগের মতোই)
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
        if (uploadError) { setUploading(false); return; }
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        if (!mainImage) mainImage = data.publicUrl;
        newGallery.push(data.publicUrl);
      }
      setForm({ ...form, image_url: mainImage, gallery: newGallery });
      e.target.value = "";
    } catch (error) { console.error(error); } finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalImageUrl = form.image_url || (form.gallery && form.gallery.length > 0 ? form.gallery[0] : "");
    const productData = {
      name: form.name, description: form.description, price: Number(form.price),
      sale_price: Number(form.sale_price) > 0 ? Number(form.sale_price) : Number(form.price),
      category: form.category, weight: form.weight, image_url: finalImageUrl,
      gallery: form.gallery, in_stock: form.in_stock, is_active: form.is_active,
      rating: Number(form.rating) || 4.5, reviews_count: Number(form.reviews_count) || 0
    };
    if (form.id) await supabase.from("products").update(productData).eq("id", form.id);
    else await supabase.from("products").insert([productData]);
    setLoading(false); setIsModalOpen(false); fetchProducts();
  };

  const editProduct = (p: any) => {
    setForm({ 
      id: p.id, name: p.name || "", description: p.description || "", price: p.price || "", sale_price: p.sale_price || "", 
      category: p.category || "Premium Combo", weight: p.weight || "1 Kg", image_url: p.image_url || "", gallery: p.gallery || [], 
      in_stock: p.in_stock ?? true, is_active: p.is_active ?? true, rating: p.rating?.toString() || "4.5", reviews_count: p.reviews_count?.toString() || "10"
    });
    setIsModalOpen(true);
  };

  const deleteProduct = async (id: number) => {
    if (window.confirm("Sure?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-900 pb-20">
        {/* ব্যানার সেকশন */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-[#5C3A21]">Banners</h2>
            <div className="relative">
              <input ref={bannerInputRef} type="file" multiple accept="image/*" onChange={handleBannerUpload} className="hidden" id="banner-upload" />
              <label htmlFor="banner-upload" className="bg-[#5C3A21] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md cursor-pointer inline-block">
                {uploadingBanner ? "Wait..." : "+ Upload"}
              </label>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {banners.map((b) => (
              <div key={b.id} className="relative min-w-[120px] h-[60px] rounded-lg overflow-hidden border">
                <img src={b.image_url} className="w-full h-full object-cover" />
                <button onClick={() => deleteBanner(b.id)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs">✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* লিস্ট */}
        <button onClick={() => { setIsModalOpen(true); }} className="bg-[#5C3A21] text-white w-full py-3 rounded-xl font-bold mb-4">+ Add Product</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
              <img src={p.image_url} className="w-20 h-20 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => editProduct(p)} className="bg-blue-100 text-blue-600 px-4 py-1 rounded-lg font-bold text-xs">Edit</button>
                  <button onClick={() => deleteProduct(p.id)} className="bg-red-100 text-red-600 px-4 py-1 rounded-lg font-bold text-xs">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* [Modal code same as before] */}
    </div>
  );
}
