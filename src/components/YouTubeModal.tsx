import React, { useState, useEffect } from 'react';
import { X, Youtube, Save, ExternalLink, Play, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { extractYouTubeVideoId, buildYouTubeEmbedUrl } from '../utils/youtube';
import { useApp } from '../context/AppContext';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useApp();

  const [inputUrl, setInputUrl] = useState<string>('');
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load existing YouTube config on mount
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const res = await fetch('/api/youtube-config');
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data?.embedUrl && isMounted) {
            setEmbedUrl(json.data.embedUrl);
            setInputUrl(json.data.youtubeUrl || '');
            setCurrentVideoId(json.data.videoId || '');
            return;
          }
        }
      } catch (err) {
        // Fallback to localStorage if server route is unavailable
      }

      // Check localStorage fallback
      const savedEmbed = localStorage.getItem('app_youtube_embed_url');
      const savedOriginal = localStorage.getItem('app_youtube_original_url');
      const savedId = localStorage.getItem('app_youtube_video_id');
      if (savedEmbed && isMounted) {
        setEmbedUrl(savedEmbed);
        setInputUrl(savedOriginal || '');
        setCurrentVideoId(savedId || '');
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  // Handle Save / Render Embed
  const handleSaveAndEmbed = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!inputUrl.trim()) {
      setErrorMsg('Vui lòng dán đường link YouTube!');
      return;
    }

    const videoId = extractYouTubeVideoId(inputUrl);
    if (!videoId) {
      setErrorMsg('Link YouTube không hợp lệ. Vui lòng kiểm tra lại định dạng link (ví dụ: https://www.youtube.com/watch?v=...)');
      return;
    }

    const newEmbedUrl = buildYouTubeEmbedUrl(videoId, true);
    setEmbedUrl(newEmbedUrl);
    setCurrentVideoId(videoId);
    setIsSaving(true);

    // Save to localStorage immediately
    localStorage.setItem('app_youtube_embed_url', newEmbedUrl);
    localStorage.setItem('app_youtube_original_url', inputUrl.trim());
    localStorage.setItem('app_youtube_video_id', videoId);

    // Sync to Node.js backend server
    try {
      const res = await fetch('/api/youtube-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: inputUrl.trim(),
          embedUrl: newEmbedUrl,
          videoId: videoId,
          title: 'Video YouTube Lớp 6A3',
        }),
      });
      if (res.ok) {
        addToast('success', 'Lưu video YouTube thành công!', 'Video đã sẵn sàng phát trên hệ thống');
      } else {
        addToast('success', 'Đã nhúng video vào phiên làm việc!', 'Video đã sẵn sàng phát');
      }
    } catch {
      addToast('success', 'Đã nhúng video vào phiên làm việc!', 'Video đã sẵn sàng phát');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick preset sample links for testing
  const sampleVideos = [
    {
      title: 'Hành khúc Đội Thiếu Niên',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      title: 'Nhạc Lofi Học Tập Không Lời',
      url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    },
    {
      title: 'Việt Nam Ơi - Giai Điệu Tự Hào',
      url: 'https://www.youtube.com/watch?v=kXx3d17u68g',
    },
  ];

  const handleSelectSample = (url: string) => {
    setInputUrl(url);
    setErrorMsg('');
  };

  const handleClearVideo = async () => {
    setEmbedUrl('');
    setInputUrl('');
    setCurrentVideoId('');
    localStorage.removeItem('app_youtube_embed_url');
    localStorage.removeItem('app_youtube_original_url');
    localStorage.removeItem('app_youtube_video_id');

    try {
      await fetch('/api/youtube-config', { method: 'DELETE' });
    } catch {}

    addToast('info', 'Đã gỡ bỏ video YouTube');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Youtube className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight text-white flex items-center gap-1.5">
                Cài đặt Video YouTube
              </h3>
              <p className="text-xs text-red-100 font-medium mt-0.5">
                Nhúng và phát video giới thiệu, bài học hoặc nhạc nền YouTube
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition active:scale-95"
            title="Đóng hộp thoại"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {/* Input & Action Form */}
          <form onSubmit={handleSaveAndEmbed} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Dán đường link YouTube vào đây:
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
                    <Youtube className="w-4 h-4 fill-red-500" />
                  </div>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition font-mono placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/30 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu & Hiển thị</span>
                  </button>

                  {embedUrl && (
                    <button
                      type="button"
                      onClick={handleClearVideo}
                      className="p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                      title="Gỡ video hiện tại"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Quick Sample Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
              <span className="font-semibold flex items-center gap-1 text-slate-600">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Gợi ý mẫu:
              </span>
              {sampleVideos.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => handleSelectSample(sample.url)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 transition"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </form>

          {/* Video Preview Frame */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                Khung hiển thị video YouTube:
              </span>
              {currentVideoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Mở trên YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {embedUrl ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-xl border border-slate-200 relative group">
                <iframe
                  src={embedUrl}
                  title="YouTube video player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
                  <Youtube className="w-8 h-8 fill-red-500 text-red-500" />
                </div>
                <h4 className="font-bold text-sm text-slate-700">Chưa có video YouTube nào được chọn</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Hãy dán link video YouTube vào ô phía trên rồi bấm <strong>"Lưu & Hiển thị"</strong> để xem video ngay tại đây.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tự động lưu vĩnh viễn trên hệ thống</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
