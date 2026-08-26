import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState('popup');
  const [targetUrl, setTargetUrl] = useState('');
  const [ctaText, setCtaText] = useState('Get Bonus');
  const [buttonColor, setButtonColor] = useState('#3B82F6');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      if (data.status === 'success') {
        setAds(data.ads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (format !== 'header-button' && !imageFile) return alert('Please select an image file first.');
    setUploading(true);

    try {
      let finalImageUrl = '';
      
      if (imageFile) {
        const base64Image = await toBase64(imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Image })
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.status !== 'success') {
          throw new Error(uploadData.message || 'Image upload failed');
        }
        finalImageUrl = uploadData.url;
      }

      // Create ad
      const adRes = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          image_url: finalImageUrl,
          target_url: targetUrl,
          cta_text: ctaText,
          button_color: buttonColor,
          active: true
        })
      });
      const adData = await adRes.json();
      
      if (adData.status === 'success') {
        setAds([adData.ad, ...ads]);
        setImageFile(null);
        setTargetUrl('');
      } else {
         throw new Error(adData.message);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      setAds(ads.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (ad: any) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ad, active: !ad.active })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAds(ads.map(a => a.id === ad.id ? data.ad : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <Header />
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Ad Management Backoffice</h1>
        
        {/* Create Ad Form */}
        <div className="bg-[#0A0A0A] border border-[#1a1a1a] p-6 rounded-xl mb-12">
          <h2 className="text-xl font-bold mb-4 border-b border-[#222] pb-2">Create New Ad</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ad Format</label>
              <select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white"
              >
                <option value="popup">Popup Ad</option>
                <option value="billboard">Billboard (Top/Banner)</option>
                <option value="skyscraper">Skyscraper (Sidebar)</option>
                <option value="in-article">In-Article (Square)</option>
                <option value="header-button">Header Button (Cloaked)</option>
              </select>
            </div>

            {format !== 'header-button' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Upload Image (Banner/Popup Design)</label>
                
                {/* Recommended Size Helper Text */}
                <div className="text-xs text-blue-400 mb-2 p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                  <span className="font-bold">Recommended Size: </span>
                  {format === 'popup' && "400x500px (or similar portrait/square aspect ratio)"}
                  {format === 'billboard' && "728x90px or 970x250px (Horizontal Banner)"}
                  {format === 'skyscraper' && "160x600px (Tall Vertical Sidebar)"}
                  {format === 'in-article' && "300x250px (Medium Rectangle)"}
                </div>

                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Target URL (Where does it link to?)</label>
              <input 
                type="url" 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white"
                placeholder="https://your-sponsor-link.com"
                required
              />
            </div>

            {(format === 'popup' || format === 'header-button') && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Button Text</label>
                <input 
                  type="text" 
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] rounded px-3 py-2 text-white"
                  placeholder="e.g. GET BONUS"
                  required
                />
              </div>
            )}

            {format === 'header-button' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Button Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="h-10 w-20 bg-transparent cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">{buttonColor}</span>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={uploading}
              className="mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              {uploading ? 'Uploading & Saving...' : 'Create Ad'}
            </button>
          </form>
        </div>

        {/* Existing Ads List */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b border-[#222] pb-2">Active & Past Ads</h2>
          {loading ? (
            <p className="text-gray-500">Loading ads...</p>
          ) : ads.length === 0 ? (
            <p className="text-gray-500">No ads found. Create one above!</p>
          ) : (
            <div className="grid gap-4">
              {ads.map(ad => (
                <div key={ad.id} className={`flex items-center gap-4 p-4 border rounded-xl bg-[#0a0a0a] ${ad.active ? 'border-[#333]' : 'border-red-900/30 opacity-50'}`}>
                  <img src={ad.image_url} alt="Ad preview" className="w-24 h-24 object-contain bg-black rounded" />
                  <div className="flex-1">
                    <div className="font-bold uppercase text-xs text-blue-400 mb-1">{ad.format}</div>
                    <div className="text-sm truncate max-w-sm text-gray-300">🔗 {ad.target_url}</div>
                    {ad.format === 'popup' && <div className="text-xs mt-1 text-gray-500">CTA: {ad.cta_text}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleActive(ad)}
                      className={`px-3 py-1 rounded text-xs font-bold ${ad.active ? 'bg-orange-600 hover:bg-orange-500' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                      {ad.active ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => handleDelete(ad.id)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
