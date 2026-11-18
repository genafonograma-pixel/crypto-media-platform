import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import {
  Layers,
  Layout,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  MousePointerClick
} from 'lucide-react';

interface AdItem {
  id: string;
  format: string;
  image_url?: string | null;
  target_url: string;
  cta_text?: string | null;
  active: boolean;
  created_at: string;
  button_color?: string;
}

const AD_FORMAT_CONFIGS = [
  {
    id: 'skyscraper',
    label: 'Skyscraper Banner',
    category: 'sidebar',
    dimensions: '160x600 (Vertical)',
    description: 'Strictly on Article pages: left and right gutters flanking the article',
    badge: 'Article Only'
  },
  {
    id: 'billboard',
    label: 'Billboard Banner',
    category: 'banner',
    dimensions: '970x250 or 728x90 (Horizontal)',
    description: 'Top placement: top of Homepage, Category pages & Article headers',
    badge: 'Top Banner'
  },
  {
    id: 'in-article',
    label: 'In-Article / Sidebar Card',
    category: 'sidebar',
    dimensions: '300x250 (Medium Rectangle)',
    description: 'Inside article body & Homepage Most Read sidebar',
    badge: 'Content & Sidebar'
  },
  {
    id: 'native',
    label: 'Native In-Feed Card',
    category: 'banner',
    dimensions: 'Responsive (1200x200)',
    description: 'Mid-feed breaks between news sections on Homepage & Category pages',
    badge: 'Mid-Feed'
  },
  {
    id: 'header-button',
    label: 'Header Sponsor Button',
    category: 'button',
    dimensions: 'CTA Text & Link',
    description: 'Strictly in top navigation header replacing the subscribe button',
    badge: 'Navbar Only'
  },
  {
    id: 'popup',
    label: 'Popup Modal',
    category: 'popup',
    dimensions: '400x500 (Portrait/Square)',
    description: 'High-converting modal dialogue shown after user activity',
    badge: 'Modal Overlay'
  }
];

const BUTTON_COLORS = [
  { id: 'brand', label: 'SPORT25 Red', class: 'bg-brand text-white border-transparent' },
  { id: 'emerald', label: 'Emerald Green', class: 'bg-emerald-600 text-white border-transparent' },
  { id: 'blue', label: 'Royal Blue', class: 'bg-blue-600 text-white border-transparent' },
  { id: 'gold', label: 'Gold Accent', class: 'bg-brand text-white border-transparent' },
  { id: 'purple', label: 'Deep Purple', class: 'bg-purple-600 text-white border-transparent' },
  { id: 'dark', label: 'Sleek Dark', class: 'bg-white/10 text-white border-white/30' }
];

export default function AdminAds() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    document.title = 'Ad Campaign Manager | SPORT25 Admin';
    return () => { meta.remove(); };
  }, []);

  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [format, setFormat] = useState('billboard');
  const [targetUrl, setTargetUrl] = useState('');
  const [ctaText, setCtaText] = useState('Bet now');
  const [buttonColor, setButtonColor] = useState('brand');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [htmlBannerUrl, setHtmlBannerUrl] = useState('');
  const [htmlBannerDirection, setHtmlBannerDirection] = useState<'bottom' | 'top'>('bottom');
  const [htmlBannerSaving, setHtmlBannerSaving] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.ads)) {
        setAds(data.ads);
        const hb = data.ads.find((a: AdItem) => a.format === 'html-banner');
        if (hb) {
          setHtmlBannerUrl(hb.target_url || '');
          setHtmlBannerDirection((hb.cta_text as 'bottom' | 'top') === 'top' ? 'top' : 'bottom');
        }
      }
    } catch (err) {
      console.error('Error fetching ads:', err);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const base64 = await toBase64(file);
      setImagePreview(base64);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFormSuccessMessage(null);

    if (format !== 'header-button') {
      if (imageInputMode === 'upload' && !imageFile && !imagePreview) {
        setErrorMessage('Please select an ad image file to upload.');
        return;
      }
      if (imageInputMode === 'url' && !imageUrl.trim()) {
        setErrorMessage('Please enter an image URL.');
        return;
      }
    }

    if (!targetUrl.trim()) {
      setErrorMessage('Please provide a valid Target URL.');
      return;
    }

    setUploading(true);
    try {
      let finalImageUrl = imageInputMode === 'url' ? imageUrl.trim() : null;

      if (imageInputMode === 'upload') {
        let base64 = imagePreview;
        if (imageFile) {
          base64 = await toBase64(imageFile);
        }
        if (base64) {
          try {
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ base64Image: base64 })
            });
            const uploadData = await uploadRes.json();
            if (uploadData.status === 'success' && uploadData.url) {
              finalImageUrl = uploadData.url;
            } else {
              finalImageUrl = base64;
            }
          } catch (uploadErr) {
            console.warn('Upload error, using base64 fallback:', uploadErr);
            finalImageUrl = base64;
          }
        }
      }

      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          target_url: targetUrl.trim(),
          cta_text: ctaText.trim(),
          button_color: buttonColor,
          image_url: finalImageUrl,
          active: true
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setFormSuccessMessage(`New ${format} ad created and activated successfully!`);
        setImageFile(null);
        setImagePreview(null);
        setImageUrl('');
        setTargetUrl('');
        fetchAds();
        setTimeout(() => setFormSuccessMessage(null), 4000);
      } else {
        setErrorMessage(data.message || data.error || 'Failed to create ad.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to connect to server. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (ad: AdItem) => {
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !ad.active })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAds();
      }
    } catch (err) {
      console.error('Error toggling ad:', err);
    }
  };

  const saveHtmlBanner = async (ad: AdItem) => {
    setHtmlBannerSaving(true);
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: htmlBannerUrl.trim(),
          cta_text: htmlBannerDirection  // reuse cta_text to store direction
        })
      });
      const data = await res.json();
      if (data.status === 'success') fetchAds();
    } catch (err) {
      console.error('Error saving html banner:', err);
    } finally {
      setHtmlBannerSaving(false);
    }
  };

  const handleDelete = async (id: string, adFormat: string) => {
    if (!confirm(`Are you sure you want to permanently delete this ${adFormat} ad?`)) return;
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAds();
      }
    } catch (err) {
      console.error('Error deleting ad:', err);
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Stats calculation
  const totalCount = ads.length;
  const activeCount = ads.filter(a => a.active).length;
  const inactiveCount = totalCount - activeCount;

  // Filtered ads
  const filteredAds = useMemo(() => {
    if (filterCategory === 'all') return ads;
    if (filterCategory === 'banner') return ads.filter(a => a.format === 'billboard' || a.format === 'native');
    if (filterCategory === 'popup') return ads.filter(a => a.format === 'popup');
    if (filterCategory === 'button') return ads.filter(a => a.format === 'header-button');
    if (filterCategory === 'sidebar') return ads.filter(a => a.format === 'skyscraper' || a.format === 'in-article');
    return ads;
  }, [ads, filterCategory]);

  const activeFormatConfig = AD_FORMAT_CONFIGS.find(f => f.id === format);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <Header />

      <main className="max-w-[1240px] w-full mx-auto px-4 md:px-6 py-8 flex-1">
        {/* Top Header & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-line gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-bold text-muted">Backoffice Admin</span>
            </div>
            <h1 className="text-title-mobile md:text-title font-extrabold font-display text-ink">
              Ad Campaign &amp; Placement Manager
            </h1>
            <p className="text-sm text-muted mt-1">
              Control top billboards, sponsor buttons, popup modals, sidebar skyscrapers, and in-feed ads.
            </p>
          </div>

          <button
            onClick={fetchAds}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-bg-soft hover:bg-line border border-line rounded-card text-xs font-semibold text-ink transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync Ads</span>
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-bg-soft border border-line p-4 rounded-card">
            <span className="text-xs text-muted font-medium block">Total Campaigns</span>
            <span className="text-2xl font-bold font-display text-ink mt-1 block">{totalCount}</span>
          </div>
          <div className="bg-bg-soft border border-emerald-500/30 p-4 rounded-card">
            <span className="text-xs text-emerald-600 font-medium block">Active Online</span>
            <span className="text-2xl font-bold font-display text-emerald-600 mt-1 block">{activeCount}</span>
          </div>
          <div className="bg-bg-soft border border-line p-4 rounded-card">
            <span className="text-xs text-muted font-medium block">Paused / Inactive</span>
            <span className="text-2xl font-bold font-display text-muted mt-1 block">{inactiveCount}</span>
          </div>
          <div className="bg-bg-soft border border-brand/30 p-4 rounded-card">
            <span className="text-xs text-brand font-medium block">Supported Formats</span>
            <span className="text-2xl font-bold font-display text-brand mt-1 block">6 Types</span>
          </div>
        </div>

        {/* ── HTML Banner Controller ─────────────────────────────── */}
        {(() => {
          const htmlBannerAd = ads.find(a => a.format === 'html-banner');
          if (!htmlBannerAd) return null;
          return (
            <div className="mb-8 bg-bg-soft border border-purple-500/40 rounded-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                {/* Left: info + toggle */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">HTML Banner Ad</span>
                    <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full border ${htmlBannerAd.active ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500' : 'bg-muted/15 border-line text-muted'}`}>
                      {htmlBannerAd.active ? '● Live' : '○ Paused'}
                    </span>
                  </div>
                  <h2 className="text-card font-bold font-display text-ink mb-1">Sticky Bottom HTML Banner</h2>
                  <p className="text-xs text-muted mb-4">
                    Full-width sticky banner at the bottom of every page — displays the Bet25 animated HTML creative
                    via iframe. Toggle below to show or hide it site-wide without deleting the campaign.
                  </p>

                  {/* Target URL edit */}
                  <label className="block text-xs font-bold text-ink mb-1">Click-through URL</label>
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="url"
                      value={htmlBannerUrl}
                      onChange={e => setHtmlBannerUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 h-9 px-3 rounded-card border border-line bg-bg text-xs text-ink font-mono focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>

                  {/* Direction selector */}
                  <label className="block text-xs font-bold text-ink mb-1">Banner Position</label>
                  <div className="flex items-center gap-2 mb-5">
                    {(['bottom', 'top'] as const).map(dir => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => setHtmlBannerDirection(dir)}
                        className={`px-4 py-1.5 rounded-card border text-xs font-semibold capitalize transition-colors cursor-pointer ${
                          htmlBannerDirection === dir
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-bg border-line text-muted hover:border-purple-400'
                        }`}
                      >
                        {dir === 'bottom' ? '⬇ Sticky Bottom' : '⬆ Sticky Top'}
                      </button>
                    ))}
                  </div>

                  {/* ON / OFF toggle + Save row */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => toggleActive(htmlBannerAd)}
                      className={`relative inline-flex h-7 w-14 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                        htmlBannerAd.active
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'bg-bg-soft border-line'
                      }`}
                      aria-label="Toggle HTML banner"
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out mt-0.5 ${
                          htmlBannerAd.active ? 'translate-x-7' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-semibold text-ink flex-1">
                      {htmlBannerAd.active ? 'Banner is LIVE — click to pause' : 'Banner is PAUSED — click to activate'}
                    </span>
                    <button
                      type="button"
                      onClick={() => saveHtmlBanner(htmlBannerAd)}
                      disabled={htmlBannerSaving}
                      className="px-4 py-1.5 rounded-card bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {htmlBannerSaving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                      {htmlBannerSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                {/* Right: miniature preview */}
                <div className="shrink-0 w-full sm:w-72">
                  <span className="text-xs font-bold text-muted block mb-2">Live Preview</span>
                  <div className="relative rounded-card overflow-hidden border border-purple-500/30 bg-[#0A021F] h-14 w-full shadow-lg">
                    <iframe
                      title="HTML Banner Preview"
                      src="/ads/bet25/index.html"
                      scrolling="no"
                      style={{ width: '100%', height: '48px', border: 0, display: 'block', pointerEvents: 'none' }}
                    />
                    {!htmlBannerAd.active && (
                      <div className="absolute inset-0 bg-bg/70 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-xs font-bold text-muted">Paused</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted mt-1.5 text-center">Actual banner shown at bottom of page</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Create Ad Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Form Side (7 cols) */}
          <div className="lg:col-span-7 bg-bg-soft border border-line p-6 rounded-card">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-line">
              <Plus size={18} className="text-brand" />
              <h2 className="text-card font-bold font-display text-ink">
                Create new ad campaign
              </h2>
            </div>

            {formSuccessMessage && (
              <div className="mb-5 p-3 rounded-card bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{formSuccessMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3 rounded-card bg-alert/10 border border-alert/30 text-alert text-xs font-semibold flex items-center gap-2">
                <XCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Format Selection */}
              <div>
                <label className="block text-xs font-bold text-ink mb-2">
                  1. Select Ad Placement Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AD_FORMAT_CONFIGS.map(f => {
                    const isSelected = format === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormat(f.id)}
                        className={`text-left p-3 rounded-card border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand/5 border-brand ring-1 ring-brand text-brand'
                            : 'bg-white border-line hover:border-ink/40 text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold leading-tight line-clamp-1">{f.label}</span>
                        </div>
                        <span className="text-xs text-muted block line-clamp-1 font-mono">{f.dimensions}</span>
                        <span className="text-xs font-semibold text-brand mt-1 inline-block">
                          {f.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {activeFormatConfig && (
                  <p className="text-xs text-muted mt-2 bg-white/60 p-2.5 rounded border border-line/60">
                    <span className="font-semibold text-ink">Placement: </span>
                    {activeFormatConfig.description}
                  </p>
                )}
              </div>

              {/* 2. Image Input (if not header button) */}
              {format !== 'header-button' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-ink">
                      2. Ad Banner Artwork
                    </label>
                    <div className="flex rounded border border-line overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className={`px-3 py-1 font-semibold cursor-pointer ${imageInputMode === 'upload' ? 'bg-brand text-white' : 'bg-white text-muted hover:text-ink'}`}
                      >
                        File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-3 py-1 font-semibold cursor-pointer ${imageInputMode === 'url' ? 'bg-brand text-white' : 'bg-white text-muted hover:text-ink'}`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {imageInputMode === 'upload' ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full bg-white border border-line rounded-card px-3 py-2 text-ink text-sm cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-bg-soft file:text-ink hover:file:bg-line"
                      />
                      <span className="text-xs text-muted block">
                        Recommended aspect ratio: {activeFormatConfig?.dimensions}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="https://example.com/banner.jpg"
                        className="w-full bg-white border border-line rounded-card px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                      />
                      <span className="text-xs text-muted block">
                        Direct link to HTTPS image resource
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Target URL */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {format === 'header-button' ? '2.' : '3.'} Target Destination URL
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://sponsor.com/promo-link"
                  className="w-full bg-white border border-line rounded-card px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>

              {/* 4. CTA Text & Color (for popup, header button, and native) */}
              {(format === 'header-button' || format === 'popup' || format === 'native') && (
                <div className="space-y-3 pt-2 border-t border-line">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Button Text (CTA)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g. Bet now, Play free, Claim 100%"
                      className="w-full bg-white border border-line rounded-card px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-2">
                      Button Color Palette
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {BUTTON_COLORS.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setButtonColor(c.id)}
                          className={`h-9 px-2 rounded-card text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${c.class} ${
                            buttonColor === c.id ? 'ring-2 ring-offset-2 ring-brand scale-105' : 'opacity-85 hover:opacity-100'
                          }`}
                        >
                          {c.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full sm:w-auto h-11 px-8 rounded-card bg-brand hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Saving &amp; deploying ad...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Publish &amp; Activate Ad</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Side (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-bg-soft border border-line p-5 rounded-card flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-brand" />
                  <h3 className="text-card font-bold font-display text-ink">
                    Live Placement Preview
                  </h3>
                </div>
                <span className="text-xs font-bold bg-white px-2 py-0.5 rounded border border-line text-muted">
                  {format}
                </span>
              </div>

              {/* Interactive preview box */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] p-4 bg-white/70 rounded-card border border-dashed border-line">
                {format === 'header-button' ? (
                  <div className="w-full bg-ink-900 p-4 rounded-card border border-line/30 flex items-center justify-between">
                    <img src="/sport25_logo.svg" alt="Logo" className="h-6 w-auto" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50 hidden sm:inline">Nav items...</span>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className={`h-8 px-4 rounded-card text-xs font-bold flex items-center justify-center shadow-md ${
                          BUTTON_COLORS.find(c => c.id === buttonColor)?.class || 'bg-brand text-white'
                        }`}
                      >
                        {ctaText || 'Button CTA'}
                      </a>
                    </div>
                  </div>
                ) : format === 'popup' ? (
                  <div className="w-full max-w-[280px] bg-bg border border-line rounded-card shadow-xl overflow-hidden">
                    <div className="p-2 bg-ink-900 text-white flex items-center justify-between">
                      <span className="text-xs font-bold text-white/70">Sponsored Modal</span>
                      <span className="text-white/50 text-xs">✕</span>
                    </div>
                    <div className="aspect-[4/3] bg-bg-soft flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-4 text-muted">
                          <ImageIcon size={32} className="mx-auto mb-1 opacity-40" />
                          <span className="text-xs">Select an image to preview</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-line">
                      <div className={`w-full h-8 rounded-card text-xs font-bold flex items-center justify-center ${
                        BUTTON_COLORS.find(c => c.id === buttonColor)?.class || 'bg-brand text-white'
                      }`}>
                        {ctaText || 'Learn more'}
                      </div>
                    </div>
                  </div>
                ) : format === 'skyscraper' ? (
                  <div className="w-[120px] h-[340px] bg-bg-soft border border-line rounded-card flex flex-col items-center justify-between p-2 overflow-hidden">
                    <span className="text-xs text-muted font-bold">Ad 160x600</span>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center text-muted">
                        <ImageIcon size={24} className="mx-auto mb-1 opacity-40" />
                        <span className="text-xs">Skyscraper</span>
                      </div>
                    )}
                    <span className="text-xs text-muted">SPORT25 Sidebar</span>
                  </div>
                ) : (
                  <div className="w-full max-w-md bg-bg-soft border border-line rounded-card p-3 flex flex-col items-center">
                    <span className="text-label font-bold text-muted block mb-1 text-center">
                      Advertisement
                    </span>
                    <div className="w-full aspect-[4/1] bg-white rounded border border-line/60 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center text-muted">
                          <ImageIcon size={24} className="mx-auto mb-1 opacity-40" />
                          <span className="text-xs">Banner Graphic (728x90 / Native)</span>
                        </div>
                      )}
                    </div>
                    {ctaText && format === 'native' && (
                      <div className="w-full mt-2 pt-2 border-t border-line/20 flex items-center justify-between text-xs">
                        <span className="text-muted font-medium">Sponsored</span>
                        <span className="font-bold text-brand">{ctaText} →</span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted mt-4 text-center">
                  Target: <span className="text-ink font-mono">{targetUrl || 'https://...'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Ads List & Management Section */}
        <div className="bg-bg-soft border border-line p-6 rounded-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-line gap-4">
            <div>
              <h2 className="text-card font-bold font-display text-ink">
                Campaign Inventory
              </h2>
              <span className="text-xs text-muted">Manage active status, inspect links, and remove obsolete banners</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-card transition-colors cursor-pointer ${filterCategory === 'all' ? 'bg-brand text-white' : 'bg-white border border-line text-ink hover:bg-line'}`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setFilterCategory('banner')}
                className={`px-3 py-1.5 rounded-card transition-colors cursor-pointer ${filterCategory === 'banner' ? 'bg-brand text-white' : 'bg-white border border-line text-ink hover:bg-line'}`}
              >
                Banners
              </button>
              <button
                onClick={() => setFilterCategory('popup')}
                className={`px-3 py-1.5 rounded-card transition-colors cursor-pointer ${filterCategory === 'popup' ? 'bg-brand text-white' : 'bg-white border border-line text-ink hover:bg-line'}`}
              >
                Popups
              </button>
              <button
                onClick={() => setFilterCategory('button')}
                className={`px-3 py-1.5 rounded-card transition-colors cursor-pointer ${filterCategory === 'button' ? 'bg-brand text-white' : 'bg-white border border-line text-ink hover:bg-line'}`}
              >
                Buttons
              </button>
              <button
                onClick={() => setFilterCategory('sidebar')}
                className={`px-3 py-1.5 rounded-card transition-colors cursor-pointer ${filterCategory === 'sidebar' ? 'bg-brand text-white' : 'bg-white border border-line text-ink hover:bg-line'}`}
              >
                Sidebars
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted text-sm flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span>Fetching campaigns...</span>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-card border border-dashed border-line">
              <p className="text-ink font-semibold text-sm mb-1">No ads found in this filter.</p>
              <p className="text-muted text-xs">Create your first ad campaign using the builder above.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredAds.map(ad => (
                <div
                  key={ad.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-card bg-white transition-all gap-4 ${
                    ad.active ? 'border-line shadow-xs' : 'border-line/40 opacity-60 bg-white/50'
                  }`}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {ad.format === 'header-button' ? (
                      <div className="w-16 h-16 rounded-card bg-ink-900 flex items-center justify-center text-white shrink-0 border border-line">
                        <MousePointerClick size={22} className="text-brand" />
                      </div>
                    ) : ad.image_url ? (
                      <img
                        src={ad.image_url}
                        alt="Ad preview"
                        className="w-16 h-16 object-contain bg-bg-soft rounded-card border border-line shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-card bg-bg-soft flex items-center justify-center text-muted shrink-0 border border-line">
                        <ImageIcon size={20} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                          {ad.format}
                        </span>
                        {ad.active ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-muted bg-bg-soft px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Paused
                          </span>
                        )}
                        {ad.cta_text && (
                          <span className="text-xs text-muted font-medium">
                            CTA: <span className="text-ink font-semibold">{ad.cta_text}</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-ink truncate font-mono">
                        {ad.target_url}
                      </div>

                      <span className="text-xs text-muted block mt-0.5">
                        Created {new Date(ad.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Test Target Link */}
                    <a
                      href={ad.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted hover:text-ink hover:bg-bg-soft rounded-card border border-line transition-colors"
                      title="Open target URL in new tab"
                    >
                      <ExternalLink size={15} />
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={() => copyUrl(ad.id, ad.target_url)}
                      className="p-2 text-muted hover:text-ink hover:bg-bg-soft rounded-card border border-line transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === ad.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                    </button>

                    {/* Active/Pause Switch */}
                    <button
                      onClick={() => toggleActive(ad)}
                      className={`h-8 px-3 rounded-card text-xs font-semibold transition-colors cursor-pointer ${
                        ad.active
                          ? 'bg-ink text-white hover:bg-ink-900'
                          : 'bg-brand text-white hover:bg-brand-600'
                      }`}
                    >
                      {ad.active ? 'Pause' : 'Activate'}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(ad.id, ad.format)}
                      className="p-2 text-alert hover:bg-alert/10 rounded-card border border-alert/30 transition-colors cursor-pointer"
                      title="Delete ad"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
