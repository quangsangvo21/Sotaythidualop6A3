import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Download, 
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';
import { exportStudentsToCsv } from '../utils/export';
import { StudentAvatar } from '../components/StudentAvatar';

interface LeaderboardPageProps {
  onOpenQuickScoringWithStudent?: (studentId: string) => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onOpenQuickScoringWithStudent }) => {
  const { students, config, setSelectedStudentModal } = useApp();

  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'semester'>('week');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort students based on total points or weekly points
  const sortedStudents = useMemo(() => {
    let list = [...students];

    // Group filter
    if (selectedGroup !== 'all') {
      list = list.filter((s) => s.group === selectedGroup);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    }

    // Sort criteria
    if (timeFilter === 'week') {
      list.sort((a, b) => b.totalPoints - a.totalPoints || b.weeklyPoints - a.weeklyPoints);
    } else {
      list.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    return list;
  }, [students, selectedGroup, searchQuery, timeFilter]);

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];
  const remainingStudents = sortedStudents.slice(3);

  const handleExport = () => {
    exportStudentsToCsv(students, config.currentWeek);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-1">
            <Trophy className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            Đấu Trường Thi Đua Lớp 6A3
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bảng Xếp Hạng Thi Đua Cá Nhân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Vinh danh các cá nhân tiêu biểu và nỗ lực rèn luyện của cả lớp</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeFilter === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần {config.currentWeek}
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng Này
            </button>
            <button
              onClick={() => setTimeFilter('semester')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                timeFilter === 'semester' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Học Kỳ I
            </button>
          </div>

          <button
            onClick={handleExport}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
            title="Xuất Excel bảng điểm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Filter by Group & Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc Tổ:
          </span>
          {(['all', 1, 2, 3, 4] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedGroup === g
                  ? 'bg-red-600 text-white shadow-xs shadow-red-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g === 'all' ? 'Tất cả 4 Tổ' : `Tổ ${g}`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên học sinh..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* TOP 3 PODIUM (GAMIFICATION HERO) */}
      {selectedGroup === 'all' && !searchQuery.trim() && top1 && (
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />

          <div className="text-center mb-6 relative z-10">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> BỤC VINH DANH XUẤT SẮC TUẦN NÀY <Sparkles className="w-4 h-4" />
            </h2>
            <p className="text-xs text-slate-400 mt-1">Top 3 học sinh có điểm thi đua dẫn đầu toàn lớp</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-2xl mx-auto pt-4 relative z-10">
            {/* TOP 2 - BẠC (Silver) */}
            {top2 && (
              <div
                onClick={() => setSelectedStudentModal(top2)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <StudentAvatar student={top2} size="xl" editable={true} />
                  <div className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md border border-slate-900">
                    2
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-[100px] sm:max-w-[130px]">
                    {top2.name}
                  </div>
                  <div className="text-[11px] text-slate-400">Tổ {top2.group}</div>
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-black border border-slate-700 inline-block">
                    {top2.totalPoints}đ
                  </div>
                </div>
                {/* Silver Pedestal */}
                <div className="w-full h-24 sm:h-32 mt-3 rounded-t-2xl bg-gradient-to-b from-slate-700 to-slate-800/80 border-t border-slate-600 flex items-center justify-center flex-col text-slate-300">
                  <Medal className="w-7 h-7 text-slate-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Huy Chương Bạc</span>
                </div>
              </div>
            )}

            {/* TOP 1 - VÀNG (Gold) */}
            {top1 && (
              <div
                onClick={() => setSelectedStudentModal(top1)}
                className="flex flex-col items-center cursor-pointer group -translate-y-3"
              >
                <div className="relative mb-2">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                    <Crown className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" />
                  </div>
                  <StudentAvatar student={top1} size="xl" editable={true} />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-black text-sm flex items-center justify-center shadow-lg border-2 border-slate-900">
                    1
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-extrabold text-sm sm:text-base text-amber-300 truncate max-w-[110px] sm:max-w-[150px]">
                    {top1.name}
                  </div>
                  <div className="text-[11px] text-amber-200/80 font-medium">Tổ {top1.group} • {top1.roleTitle || 'Học sinh'}</div>
                  <div className="mt-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-sm font-black shadow-md inline-block">
                    {top1.totalPoints}đ
                  </div>
                </div>
                {/* Gold Pedestal */}
                <div className="w-full h-32 sm:h-44 mt-3 rounded-t-2xl bg-gradient-to-b from-amber-500 to-amber-700 border-t-2 border-amber-300 shadow-lg shadow-amber-500/20 flex items-center justify-center flex-col text-slate-950 font-bold">
                  <Trophy className="w-9 h-9 text-slate-950 fill-amber-300" />
                  <span className="text-xs font-black uppercase tracking-wider mt-1">QUÁN QUÂN</span>
                  <span className="text-[10px] text-amber-950/80 font-semibold">+ {top1.weeklyPoints}đ tuần này</span>
                </div>
              </div>
            )}

            {/* TOP 3 - ĐỒNG (Bronze) */}
            {top3 && (
              <div
                onClick={() => setSelectedStudentModal(top3)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-2">
                  <StudentAvatar student={top3} size="xl" editable={true} />
                  <div className="absolute -top-2 -right-1 w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md border border-slate-900">
                    3
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-[100px] sm:max-w-[130px]">
                    {top3.name}
                  </div>
                  <div className="text-[11px] text-slate-400">Tổ {top3.group}</div>
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 text-xs font-black border border-slate-700 inline-block">
                    {top3.totalPoints}đ
                  </div>
                </div>
                {/* Bronze Pedestal */}
                <div className="w-full h-20 sm:h-24 mt-3 rounded-t-2xl bg-gradient-to-b from-amber-800 to-amber-950 border-t border-amber-600 flex items-center justify-center flex-col text-amber-200">
                  <Medal className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Huy Chương Đồng</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL LEADERBOARD LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Danh Sách Xếp Hạng ({sortedStudents.length} học sinh)</span>
          <span>Bấm vào học sinh để xem hồ sơ & chấm điểm</span>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedStudents.map((student, index) => {
            const rank = index + 1;
            const diffRank = student.previousRank ? student.previousRank - rank : 0;
            const isTop3 = rank <= 3;

            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudentModal(student)}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-red-50/40 cursor-pointer transition ${
                  isTop3 ? 'bg-amber-50/30' : ''
                }`}
              >
                {/* Left: Rank & Avatar & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                    {rank === 1 ? (
                      <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                        🥇
                      </span>
                    ) : rank === 2 ? (
                      <span className="w-8 h-8 rounded-xl bg-slate-300 text-slate-800 flex items-center justify-center shadow-xs">
                        🥈
                      </span>
                    ) : rank === 3 ? (
                      <span className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        🥉
                      </span>
                    ) : (
                      <span className="text-slate-500 font-extrabold">{rank}</span>
                    )}
                  </div>

                  {/* Rank Delta arrow */}
                  <div className="w-6 text-center text-xs font-bold shrink-0">
                    {diffRank > 0 ? (
                      <span className="text-emerald-600 flex items-center justify-center gap-0.5" title={`Tăng ${diffRank} bậc`}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-[10px]">+{diffRank}</span>
                      </span>
                    ) : diffRank < 0 ? (
                      <span className="text-rose-600 flex items-center justify-center gap-0.5" title={`Giảm ${Math.abs(diffRank)} bậc`}>
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{diffRank}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 flex items-center justify-center">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Avatar & Details */}
                  <StudentAvatar student={student} size="sm" editable={true} />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                        {student.name}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        Tổ {student.group}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-[11px]">#{student.id}</span>
                      <span>•</span>
                      <span>{student.roleTitle || 'Học sinh'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Points & Progress */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="hidden md:block w-28 text-left">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Mục tiêu 120đ</span>
                      <span>{Math.min(Math.round((student.totalPoints / 120) * 100), 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          student.totalPoints >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(Math.max((student.totalPoints / 120) * 100, 5), 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div
                      className={`text-lg sm:text-xl font-black ${
                        student.totalPoints >= 100 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {student.totalPoints}đ
                    </div>
                    <div className="text-[11px] text-slate-400 font-semibold">
                      Tuần: {student.weeklyPoints > 0 ? `+${student.weeklyPoints}` : student.weeklyPoints}đ
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
