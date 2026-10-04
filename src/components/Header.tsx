import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Menu, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles,
  Database
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onOpenLoginModal }) => {
  const { 
    currentUser, 
    config, 
    updateConfig, 
    isSyncing, 
    syncWithGoogleSheets, 
    students,
    setSelectedStudentModal
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredStudents = searchTerm.trim()
    ? students.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `tổ ${s.group}`.includes(searchTerm.toLowerCase())
      ).slice(0, 6)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-950/15 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu button + Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-black shadow-md shadow-red-200 text-sm sm:text-base shrink-0">
              6A3
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-tight">
                  SỔ TAY THI ĐUA 6A3
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Tuần {config.currentWeek}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Trường THCS Hải Châu I</p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Tìm nhanh học sinh (Mã HS, Họ tên)..."
              className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-100 border border-transparent focus:border-red-400 focus:bg-white rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden transition placeholder:text-slate-400"
            />
          </div>

          {/* Quick Search Dropdown */}
          {showSearchResults && searchTerm.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
              {filteredStudents.length > 0 ? (
                <div>
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Kết quả tìm kiếm ({filteredStudents.length})
                  </div>
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStudentModal(s);
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-red-50/50 flex items-center justify-between border-b border-slate-50 last:border-0 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm">
                          {s.gender === 'nu' ? '👧' : '👦'}
                        </span>
                        <div>
                          <div className="text-xs sm:text-sm font-semibold text-slate-800">{s.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Mã: <span className="font-mono">{s.id}</span> • Tổ {s.group} • {s.roleTitle || 'Học sinh'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs sm:text-sm font-black ${s.totalPoints >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {s.totalPoints}đ
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  Không tìm thấy học sinh nào khớp với "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sync Button */}
          {config.gasUrl ? (
            <button
              onClick={syncWithGoogleSheets}
              disabled={isSyncing}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                isSyncing
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title="Đồng bộ Google Sheets"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-slate-400' : 'text-emerald-600'}`} />
              <span className="hidden md:inline">Sheets Sync</span>
            </button>
          ) : (
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px]"
              title="Hệ thống đang lưu trữ trực tiếp trên thiết bị (LocalStorage)"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Dữ liệu Cục bộ</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => updateConfig({ audioEnabled: !config.audioEnabled })}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition"
            title={config.audioEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          >
            {config.audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Current User Session Chip */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition shadow-xs"
          >
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-none mt-1">
                {currentUser.title}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>
        </div>
      </div>

      {/* Backdrop for quick search click-away */}
      {showSearchResults && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </header>
  );
};
