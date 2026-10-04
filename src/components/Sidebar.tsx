import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Zap, 
  Users, 
  FolderKanban, 
  ListChecks, 
  FileSpreadsheet, 
  History, 
  Settings, 
  X,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export type PageId = 
  | 'dashboard'
  | 'leaderboard'
  | 'quick-scoring'
  | 'students'
  | 'groups'
  | 'criteria'
  | 'report'
  | 'logs'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { students, criteria, logs, config } = useApp();

  const menuItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'leaderboard', label: 'Bảng Xếp Hạng', icon: <Trophy className="w-5 h-5 text-amber-500" />, badge: 'Top 3' },
    { id: 'quick-scoring', label: 'Chấm Điểm Nhanh', icon: <Zap className="w-5 h-5 text-red-500" />, badge: 'Hot' },
    { id: 'students', label: 'Danh Sách Học Sinh', icon: <Users className="w-5 h-5" />, badge: students.length },
    { id: 'groups', label: 'Thi Đua Các Tổ', icon: <FolderKanban className="w-5 h-5" />, badge: '4 Tổ' },
    { id: 'criteria', label: 'Tiêu Chí Thi Đua', icon: <ListChecks className="w-5 h-5" />, badge: criteria.length },
    { id: 'report', label: 'Báo Cáo Sinh Hoạt', icon: <FileSpreadsheet className="w-5 h-5 text-blue-500" /> },
    { id: 'logs', label: 'Lịch Sử Chấm Điểm', icon: <History className="w-5 h-5" />, badge: logs.length },
    { id: 'settings', label: 'Cài Đặt & Sheets', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelect = (page: PageId) => {
    onSelectPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden p-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-black flex items-center justify-center text-xs">
              6A3
            </div>
            <span className="font-extrabold text-sm text-slate-900">Sổ Tay Thi Đua</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Quản Lý
          </div>
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-red-50 text-red-600 shadow-xs shadow-red-100 border border-red-200/60 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={isActive ? 'text-red-600' : 'text-slate-500'}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : item.id === 'quick-scoring'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Class Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {config.className} • {config.schoolYear}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {config.schoolName}
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>Học kỳ: {config.currentSemester}</span>
              <span className="font-bold text-red-600">Tuần {config.currentWeek}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
