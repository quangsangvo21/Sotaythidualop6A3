import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Upload, Music, Loader2, Play, Pause, Trash2, Youtube } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BgmConfigResponse {
  bgmUrl: string;
  bgmName: string;
  bgmSize: number;
  volume?: number;
}

interface BackgroundMusicPlayerProps {
  position?: 'bottom-right' | 'top-right' | 'inline';
  className?: string;
  onOpenYouTube?: () => void;
}

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  position = 'bottom-right',
  className = '',
  onOpenYouTube,
}) => {
  const { addToast } = useApp();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [bgmUrl, setBgmUrl] = useState<string>('');
  const [bgmName, setBgmName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);

  // Fetch BGM config from backend on mount
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const res = await fetch('/api/bgm-config');
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success' && json.data?.bgmUrl && isMounted) {
            setBgmUrl(json.data.bgmUrl);
            setBgmName(json.data.bgmName || 'Nhạc nền hệ thống');
            if (typeof json.data.volume === 'number') {
              setVolume(json.data.volume);
            }
          }
        }
      } catch (err) {
        // Fallback to localStorage if API is temporarily unavailable
        const localUrl = localStorage.getItem('app_bgm_url');
        const localName = localStorage.getItem('app_bgm_name');
        if (localUrl && isMounted) {
          setBgmUrl(localUrl);
          setBgmName(localName || 'Nhạc nền lưu trữ');
        }
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update audio volume whenever state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Autoplay after first user interaction if music is available and not yet playing
  useEffect(() => {
    if (!bgmUrl) return;

    let hasStarted = false;

    const handleFirstInteraction = () => {
      if (hasStarted || isPlaying) return;
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            hasStarted = true;
            setIsPlaying(true);
          })
          .catch(() => {
            // Autoplay blocked until direct user interaction on audio element
          });
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [bgmUrl, isPlaying]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Lỗi phát âm thanh:', err);
          addToast('error', 'Không thể phát nhạc', 'Trình duyệt có thể đã chặn âm thanh. Vui lòng thử lại!');
        });
    }
  };

  // Trigger hidden file picker
  const handleOpenPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload Audio Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Strict validation: Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      addToast(
        'error',
        'Dung lượng vượt quá 5MB!',
        `File của bạn (${(file.size / (1024 * 1024)).toFixed(1)}MB) quá lớn. Vui lòng chọn file dưới 5MB.`
      );
      e.target.value = '';
      return;
    }

    // 2. Format validation (.mp3, .wav)
    const validExtensions = ['.mp3', '.wav'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      addToast('error', 'Định dạng không hỗ trợ!', 'Chỉ chấp nhận file âm thanh định dạng .mp3 hoặc .wav.');
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch('/api/upload-bgm', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.status === 'success') {
        const newUrl = json.data.bgmUrl;
        const newName = json.data.bgmName;
        setBgmUrl(newUrl);
        setBgmName(newName);

        // Backup to localStorage
        localStorage.setItem('app_bgm_url', newUrl);
        localStorage.setItem('app_bgm_name', newName);

        addToast('success', 'Tải nhạc nền thành công!', `Đã lưu file "${newName}" vĩnh viễn vào máy chủ`);

        // Automatically start playing new music
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }, 200);
      } else {
        throw new Error(json.message || 'Lỗi tải nhạc');
      }
    } catch (err: any) {
      console.error('Lỗi upload BGM:', err);
      // Fallback to local Blob / Data URL for pure frontend demo if server route is offline
      const blobUrl = URL.createObjectURL(file);
      setBgmUrl(blobUrl);
      setBgmName(file.name);
      localStorage.setItem('app_bgm_url', blobUrl);
      localStorage.setItem('app_bgm_name', file.name);
      addToast('success', 'Đã tải nhạc vào phiên duyệt web!', `Đang phát "${file.name}"`);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 200);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4 z-40',
    'top-right': 'fixed top-20 right-4 z-40',
    inline: 'relative',
  }[position];

  return (
    <div className={`${positionClasses} ${className}`}>
      {/* HTML5 Audio Element */}
      {bgmUrl && (
        <audio
          ref={audioRef}
          src={bgmUrl}
          loop
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            setIsPlaying(false);
          }}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Floating Control Cluster */}
      <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md border border-amber-500/30 rounded-2xl shadow-xl shadow-black/40 text-white transition-all duration-200">
        {/* Play / Pause Speaker Button */}
        {bgmUrl ? (
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={togglePlay}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition transform active:scale-95 ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/40 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
              title={isPlaying ? 'Tắt nhạc nền (Pause)' : 'Bật nhạc nền (Play)'}
              aria-label={isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            >
              {isPlaying ? (
                <Volume2 className="w-4 h-4 text-slate-950" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Track Info Badge */}
            <div
              className="ml-2 pr-1 max-w-[120px] sm:max-w-[160px] truncate text-[11px] cursor-pointer"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              title={`${bgmName} (Nhấp để chỉnh âm lượng)`}
            >
              <div className="flex items-center gap-1 font-semibold truncate text-amber-200">
                <Music className="w-3 h-3 shrink-0" />
                <span className="truncate">{bgmName}</span>
              </div>
              <div className="text-[9px] text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span>{isPlaying ? 'Đang phát' : 'Đã dừng'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 text-xs text-slate-400">
            <Music className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Chưa có nhạc</span>
          </div>
        )}

        {/* Volume Slider Popover */}
        {showVolumeSlider && bgmUrl && (
          <div className="flex items-center gap-1 px-2 border-l border-white/10">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 accent-amber-400 cursor-pointer"
              title={`Âm lượng: ${Math.round(volume * 100)}%`}
            />
            <span className="text-[10px] text-slate-400 font-mono w-6">{Math.round(volume * 100)}%</span>
          </div>
        )}

        {/* 'Tải nhạc nền' Button */}
        <button
          type="button"
          onClick={handleOpenPicker}
          disabled={isUploading}
          className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-slate-100 border border-white/10 flex items-center gap-1.5 transition disabled:opacity-50"
          title="Tải file nhạc .mp3 hoặc .wav từ máy tính (tối đa 5MB)"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span className="hidden sm:inline">Đang lưu...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Tải nhạc nền</span>
            </>
          )}
        </button>

        {/* YouTube Trigger Button (Optional) */}
        {onOpenYouTube && (
          <button
            type="button"
            onClick={onOpenYouTube}
            className="p-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white border border-red-500/40 shadow-xs flex items-center justify-center transition"
            title="Mở Video YouTube"
            aria-label="Mở Video YouTube"
          >
            <Youtube className="w-4 h-4 fill-white" />
          </button>
        )}
      </div>
    </div>
  );
};
