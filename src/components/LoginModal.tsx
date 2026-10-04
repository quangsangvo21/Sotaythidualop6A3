import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserSession } from '../types';
import { KeyRound, ShieldCheck, X, Check, Award, Flag, Users, Youtube } from 'lucide-react';
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer';
import { YouTubeModal } from './YouTubeModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginWithRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserSession['role']>(currentUser.role);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);

  if (!isOpen) return null;

  const roleConfigs: {
    role: UserSession['role'];
    title: string;
    sub: string;
    icon: React.ReactNode;
    defaultCode: string;
    badgeColor: string;
  }[] = [
    {
      role: 'gvcn',
      title: 'Giáo viên Chủ nhiệm',
      sub: 'Toàn quyền quản trị, thêm sửa xoá, chốt tuần, phục hồi điểm',
      icon: <Award className="w-5 h-5 text-red-600" />,
      defaultCode: '6A3GV',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
    {
      role: 'lop_truong',
      title: 'Lớp trưởng',
      sub: 'Chấm điểm nề nếp toàn lớp, theo dõi bảng xếp hạng',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
      defaultCode: '6A3LT',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      role: 'co_do',
      title: 'Đội cờ đỏ',
      sub: 'Chấm điểm nhanh giờ truy bài, 15 phút đầu giờ và giải lao',
      icon: <Flag className="w-5 h-5 text-amber-600" />,
      defaultCode: '6A3CD',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    {
      role: 'to_truong',
      title: 'Tổ trưởng (Tổ 1 - 4)',
      sub: 'Quản lý điểm thi đua các thành viên trong tổ',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      defaultCode: '6A3TT',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
  ];

  const handleRoleSelect = (role: UserSession['role']) => {
    setSelectedRole(role);
    const item = roleConfigs.find((r) => r.role === role);
    if (item) {
      setPasscode(item.defaultCode);
    }
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginWithRole(selectedRole, passcode);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Mật khẩu không đúng. Gợi ý: ' + roleConfigs.find((r) => r.role === selectedRole)?.defaultCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Đăng Nhập / Đổi Vai Trò</h3>
              <p className="text-xs text-red-100 mt-0.5">Sổ Tay Thi Đua Thông Minh 6A3</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* YouTube Icon Button */}
            <button
              type="button"
              onClick={() => setIsYouTubeModalOpen(true)}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 shadow-xs"
              title="Cài đặt và phát video YouTube"
              aria-label="Cài đặt Video YouTube"
            >
              <Youtube className="w-5 h-5 fill-white text-white" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Chọn vai trò đăng nhập
            </label>
            <div className="grid grid-cols-1 gap-2">
              {roleConfigs.map((item) => {
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    type="button"
                    key={item.role}
                    onClick={() => handleRoleSelect(item.role)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 ring-1 ring-red-500'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-800">{item.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-red-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Mật khẩu truy cập
              </label>
              <button
                type="button"
                onClick={() => {
                  const item = roleConfigs.find((r) => r.role === selectedRole);
                  if (item) setPasscode(item.defaultCode);
                }}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Gợi ý: {roleConfigs.find((r) => r.role === selectedRole)?.defaultCode}
              </button>
            </div>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Nhập mã bí mật..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              autoFocus
            />
            {errorMsg && <p className="text-xs text-rose-600 mt-1.5 font-medium">{errorMsg}</p>}
          </div>

          {/* Background Music & Media Control Cluster */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Media:</span>
              <button
                type="button"
                onClick={() => setIsYouTubeModalOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-2xs"
                title="Cài đặt Video YouTube"
              >
                <Youtube className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                <span>YouTube</span>
              </button>
            </div>
            <BackgroundMusicPlayer position="inline" />
          </div>

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-slate-300 hover:bg-slate-100 rounded-xl text-sm font-medium text-slate-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-red-200 transition"
            >
              Vào Hệ Thống
            </button>
          </div>
        </form>
      </div>

      {/* YouTube Setting & Player Modal */}
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onClose={() => setIsYouTubeModalOpen(false)}
      />
    </div>
  );
};
