"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://npzfzlkvdxweiaewnnem.supabase.co", "sb_publishable_it_SC_2dJQ8K4n7K4DqYjw_AaVk59xz");

export default function AdminProducts() {
  const [banners, setBanners] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("id", { ascending: false });
    if (data) setBanners(data);
  };

  const uploadSingleBanner = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const fileName = `banner-${Date.now()}.jpg`;
    
    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage.from('images').upload(`banners/${fileName}`, file);
    if (uploadError) { alert("Upload error: " + uploadError.message); setUploading(false); return; }

    // 2. Get URL
    const { data } = supabase.storage.from('images').getPublicUrl(`banners/${fileName}`);
    
    // 3. Save to DB
    const { error: dbError } = await supabase.from("banners").insert([{ image_url: data.publicUrl }]);
    
    setUploading(false);
    if (dbError) {
      alert("DB Error: " + dbError.message);
    } else {
      alert("Success! Page is reloading...");
      window.location.reload(); // Force full reload to clear all states
    }
  };

  return (
    <div className="p-6">
      <h2 className="font-bold mb-4">Upload Banners (One by one)</h2>
      <input type="file" accept="image/*" onChange={uploadSingleBanner} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      
      <div className="flex gap-4 mt-6">
        {banners.map(b => (
          <img key={b.id} src={b.image_url} className="w-24 h-24 object-cover border" />
        ))}
      </div>
    </div>
  );
}
