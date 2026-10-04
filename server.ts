import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure storage folders exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads', 'bgm');
const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_FILE = path.join(DATA_DIR, 'system-config.json');

// Interface for Background Music Config
interface BgmConfig {
  bgmUrl: string;
  bgmName: string;
  bgmSize: number;
  updatedAt: string;
  autoPlayAfterInteraction: boolean;
  volume: number;
}

// Interface for YouTube Config
interface YouTubeConfig {
  youtubeUrl: string;
  embedUrl: string;
  videoId: string;
  title: string;
  updatedAt: string;
}

interface FullSystemConfig {
  bgm: BgmConfig;
  youtube: YouTubeConfig;
}

const DEFAULT_BGM_CONFIG: BgmConfig = {
  bgmUrl: '',
  bgmName: '',
  bgmSize: 0,
  updatedAt: '',
  autoPlayAfterInteraction: true,
  volume: 0.6,
};

const DEFAULT_YOUTUBE_CONFIG: YouTubeConfig = {
  youtubeUrl: '',
  embedUrl: '',
  videoId: '',
  title: '',
  updatedAt: '',
};

function readSystemConfig(): FullSystemConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        bgm: { ...DEFAULT_BGM_CONFIG, ...(parsed.bgm || (parsed.bgmUrl !== undefined ? parsed : {})) },
        youtube: { ...DEFAULT_YOUTUBE_CONFIG, ...(parsed.youtube || {}) },
      };
    }
  } catch (err) {
    console.error('Error reading system config:', err);
  }
  return {
    bgm: DEFAULT_BGM_CONFIG,
    youtube: DEFAULT_YOUTUBE_CONFIG,
  };
}

function writeSystemConfig(cfg: FullSystemConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing system config:', err);
  }
}

function readBgmConfig(): BgmConfig {
  return readSystemConfig().bgm;
}

function writeBgmConfig(bgm: BgmConfig): void {
  const full = readSystemConfig();
  full.bgm = bgm;
  writeSystemConfig(full);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    // Generate safe clean filename: bgm_<timestamp>.<ext>
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `bgm_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

// Strictly accept only .mp3 and .wav, limit 5MB
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum as required
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.mp3', '.wav'];
    const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'];

    if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các file âm thanh định dạng .mp3 hoặc .wav!'));
    }
  },
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// API: Get Background Music Configuration
app.get('/api/bgm-config', (_req: Request, res: Response) => {
  const cfg = readBgmConfig();
  res.json({
    status: 'success',
    data: cfg,
  });
});

// API: Upload Background Music
app.post('/api/upload-bgm', (req: Request, res: Response) => {
  upload.single('audio')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'Dung lượng file vượt quá giới hạn 5MB cho phép!',
        });
      }
      return res.status(400).json({
        status: 'error',
        message: `Lỗi upload: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        status: 'error',
        message: err.message || 'File tải lên không hợp lệ',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng chọn một file nhạc .mp3 hoặc .wav để tải lên!',
      });
    }

    // New uploaded file path
    const fileUrl = `/uploads/bgm/${req.file.filename}`;
    const prevConfig = readBgmConfig();

    // Optionally clean up previous file if different
    if (prevConfig.bgmUrl && prevConfig.bgmUrl.startsWith('/uploads/bgm/')) {
      const prevFile = path.resolve(process.cwd(), prevConfig.bgmUrl.replace(/^\//, ''));
      if (fs.existsSync(prevFile) && prevFile !== req.file.path) {
        try {
          fs.unlinkSync(prevFile);
        } catch {
          // ignore cleanup error
        }
      }
    }

    const newConfig: BgmConfig = {
      ...prevConfig,
      bgmUrl: fileUrl,
      bgmName: req.file.originalname,
      bgmSize: req.file.size,
      updatedAt: new Date().toISOString(),
    };

    writeBgmConfig(newConfig);

    res.json({
      status: 'success',
      message: 'Tải nhạc nền thành công!',
      data: newConfig,
    });
  });
});

// API: Delete / Reset Background Music
app.delete('/api/bgm', (_req: Request, res: Response) => {
  const current = readBgmConfig();
  if (current.bgmUrl && current.bgmUrl.startsWith('/uploads/bgm/')) {
    const filePath = path.resolve(process.cwd(), current.bgmUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
    }
  }

  const resetConfig: BgmConfig = {
    ...current,
    bgmUrl: '',
    bgmName: '',
    bgmSize: 0,
    updatedAt: new Date().toISOString(),
  };

  writeBgmConfig(resetConfig);

  res.json({
    status: 'success',
    message: 'Đã xóa nhạc nền thành công!',
    data: resetConfig,
  });
});

// API: Get YouTube Configuration
app.get('/api/youtube-config', (_req: Request, res: Response) => {
  const cfg = readSystemConfig();
  res.json({
    status: 'success',
    data: cfg.youtube,
  });
});

// API: Save YouTube Configuration
app.post('/api/youtube-config', (req: Request, res: Response) => {
  const { youtubeUrl, embedUrl, videoId, title } = req.body;

  if (!embedUrl || !videoId) {
    return res.status(400).json({
      status: 'error',
      message: 'Thiếu đường dẫn nhúng (embedUrl) hoặc Video ID hợp lệ!',
    });
  }

  const full = readSystemConfig();
  full.youtube = {
    youtubeUrl: youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl,
    videoId,
    title: title || 'Video Giới Thiệu',
    updatedAt: new Date().toISOString(),
  };

  writeSystemConfig(full);

  res.json({
    status: 'success',
    message: 'Đã lưu cấu hình video YouTube thành công!',
    data: full.youtube,
  });
});

// API: Delete YouTube Configuration
app.delete('/api/youtube-config', (_req: Request, res: Response) => {
  const full = readSystemConfig();
  full.youtube = { ...DEFAULT_YOUTUBE_CONFIG, updatedAt: new Date().toISOString() };
  writeSystemConfig(full);

  res.json({
    status: 'success',
    message: 'Đã xóa cấu hình video YouTube!',
    data: full.youtube,
  });
});

// Setup Vite or static serving based on environment
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[Express] Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Express] Server failed to start:', err);
});
