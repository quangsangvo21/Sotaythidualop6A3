import React from 'react';
import { useApp } from '../context/AppContext';
import { PageId } from '../components/Sidebar';
import { 
  Trophy, 
  Crown, 
  AlertTriangle, 
  Users, 
  Zap, 
  TrendingUp, 
  Award, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { StudentAvatar } from '../components/StudentAvatar';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onOpenQuickScoringWithStudent?: (studentId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenQuickScoringWithStudent }) => {
  const { students, groupsSummary, logs, config, setSelectedStudentModal } = useApp();

  // 1. Total class points
  const totalClassPoints = students.reduce((acc, s) => acc + s.totalPoints, 0);
  const avgClassPoints = students.length > 0 ? (totalClassPoints / students.length).toFixed(1) : '0';

  // 2. Leading group
  const leadingGroup = groupsSummary[0] || { group: 1, name: 'Tổ 1', averagePoints: 100, totalPoints: 1000 };

  // 3. MVP Student (highest total points)
  const sortedStudents = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
  const mvpStudent = sortedStudents[0];

  // 4. Student needing attention (lowest score)
  const attentionStudent = [...students].sort((a, b) => a.totalPoints - b.totalPoints)[0];

  // 5. Violations frequency analysis for Pie/Donut breakdown
  const minusLogs = logs.filter((l) => l.type === 'minus' && !l.isReverted);
  const violationCounts: Record<string, { count: number; points: number }> = {};
  minusLogs.forEach((l) => {
    const key = l.criterionName;
    if (!violationCounts[key]) {
      violationCounts[key] = { count: 0, points: 0 };
    }
    violationCounts[key].count += 1;
    violationCounts[key].points += Math.abs(l.pointsChanged);
  });

  const sortedViolations = Object.entries(violationCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const totalViolationsCount = minusLogs.length;

  // Max score for bar chart scaling
  const maxGroupAvg = Math.max(...groupsSummary.map((g) => g.averagePoints), 120);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Banner - Inlaid Antique Plaque */}
      <div className="inlaid-plaque-banner rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden transition-all duration-300">
        <div className="absolute right-0 top-0 bottom-0 opacity-[0.06] pointer-events-none flex items-center pr-6">
          <Trophy className="w-64 h-64 text-amber-200" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider mb-2 text-amber-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {config.className} • Tuần {config.currentWeek}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Cục Diện Thi Đua & Nề Nếp Lớp Học
            </h1>
            <p className="text-xs sm:text-sm text-slate-200/90 mt-1.5 leading-relaxed drop-shadow-xs">
              Theo dõi bảng điểm cờ đỏ theo thời gian thực. Toàn bộ dữ liệu được cập nhật tự động và đồng bộ trực tiếp.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('quick-scoring')}
              className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-950/40 border border-amber-300/60 flex items-center gap-2 transition transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Chấm Điểm Nhanh
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/20 font-bold text-sm shadow-md transition"
            >
              Xem Xếp Hạng
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Class Points */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng Điểm Cả Lớp
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalClassPoints}</span>
            <span className="text-xs font-semibold text-slate-500">điểm</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Sĩ số: {students.length} học sinh</span>
            <span className="font-bold text-blue-600">TB: {avgClassPoints}đ/HS</span>
          </div>
        </div>

        {/* Card 2: Leading Group */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổ Đang Dẫn Đầu
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Crown className="w-5 h-5 fill-amber-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">Tổ {leadingGroup.group}</span>
            <span className="text-xs font-bold text-amber-600/80">Quán quân</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Điểm TB: <strong className="text-slate-800">{leadingGroup.averagePoints}đ</strong></span>
            <button
              onClick={() => onNavigate('groups')}
              className="text-red-600 hover:underline font-semibold"
            >
              Chi tiết →
            </button>
          </div>
        </div>

        {/* Card 3: MVP Student */}
        <div 
          onClick={() => mvpStudent && setSelectedStudentModal(mvpStudent)}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Xuất Sắc Nhất Tuần
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2 truncate">
            <span className="text-2xl font-black text-emerald-600 truncate">
              {mvpStudent?.name || 'Chưa có'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Tổ {mvpStudent?.group} • {mvpStudent?.roleTitle || 'Học sinh'}</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {mvpStudent?.totalPoints}đ
            </span>
          </div>
        </div>

        {/* Card 4: Most violations */}
        <div 
          onClick={() => attentionStudent && setSelectedStudentModal(attentionStudent)}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cần Nhắc Nhở Nề Nếp
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2 truncate">
            <span className="text-2xl font-black text-rose-600 truncate">
              {attentionStudent?.name || 'Không có'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Tổ {attentionStudent?.group}</span>
            <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
              {attentionStudent?.totalPoints}đ
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Bar Chart 4 Groups & Pie Breakdown of Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar Chart Comparing 4 Groups */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                So Sánh Điểm Thi Đua 4 Tổ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Xếp hạng dựa trên điểm trung bình thành viên trong tổ</p>
            </div>
            <button
              onClick={() => onNavigate('groups')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {groupsSummary.map((group) => {
              const percentage = Math.min(Math.round((group.averagePoints / maxGroupAvg) * 100), 100);
              let barColor = 'bg-slate-300';
              let badge = '';

              if (group.rank === 1) {
                barColor = 'bg-gradient-to-r from-amber-400 to-amber-500';
                badge = '🥇 Quán Quân';
              } else if (group.rank === 2) {
                barColor = 'bg-gradient-to-r from-slate-400 to-slate-500';
                badge = '🥈 Hạng Nhì';
              } else if (group.rank === 3) {
                barColor = 'bg-gradient-to-r from-amber-600 to-amber-700';
                badge = '🥉 Hạng Ba';
              } else {
                barColor = 'bg-gradient-to-r from-red-400 to-rose-500';
                badge = 'Hạng 4';
              }

              return (
                <div key={group.group} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{group.name}</span>
                      <span className="text-[11px] text-slate-500">({group.totalMembers} thành viên)</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {badge}
                      </span>
                    </div>
                    <div className="font-black text-slate-900">
                      {group.averagePoints} <span className="text-[11px] font-normal text-slate-500">đ/HS</span>
                      <span className="ml-2 font-normal text-slate-400">({group.totalPoints}đ)</span>
                    </div>
                  </div>

                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Điểm chuẩn sàn: {config.baselineScore}đ</span>
            <span>Cập nhật theo lượt chấm mới nhất</span>
          </div>
        </div>

        {/* Right: Violations Distribution (Pie/Breakdown) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  Thống Kê Vi Phạm Nội Quy
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Các lỗi phổ biến nhất trong tuần để chấn chỉnh</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {totalViolationsCount} lượt
              </span>
            </div>

            {sortedViolations.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Lớp học không có vi phạm nào!</p>
                <p className="text-xs text-slate-500 mt-1">Tuyệt vời, tất cả học sinh đều chấp hành tốt nội quy.</p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {sortedViolations.map(([name, data], idx) => {
                  const percent = totalViolationsCount > 0 ? Math.round((data.count / totalViolationsCount) * 100) : 0;
                  const colors = [
                    'bg-rose-500',
                    'bg-amber-500',
                    'bg-orange-500',
                    'bg-indigo-500',
                    'bg-slate-500',
                  ];
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate pr-2">
                          {idx + 1}. {name}
                        </span>
                        <span className="font-black text-rose-600 shrink-0">
                          {data.count} lần ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors[idx % colors.length]}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-800 leading-relaxed">
              <strong>Lưu ý nề nếp:</strong> Giáo viên chủ nhiệm & Đội cờ đỏ cần theo dõi sát các lỗi chiếm trên 30% để nhắc nhở trong giờ sinh hoạt lớp.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Scoring Activities */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-600" />
              Hoạt Động Chấm Điểm Vừa Diễn Ra
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Nhật ký trực tiếp các hành động khen thưởng và xử lý nề nếp</p>
          </div>
          <button
            onClick={() => onNavigate('logs')}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            Xem tất cả nhật ký ({logs.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.slice(0, 5).map((log) => {
            const isPlus = log.type === 'plus';
            const studentObj = students.find((s) => s.id === log.studentId) || {
              id: log.studentId,
              name: log.studentName,
              group: log.studentGroup,
            };

            return (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StudentAvatar
                    student={studentObj}
                    size="sm"
                    editable={true}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const target = students.find((s) => s.id === log.studentId);
                          if (target) setSelectedStudentModal(target);
                        }}
                        className="font-bold text-sm text-slate-900 hover:text-red-600 transition text-left"
                      >
                        {log.studentName}
                      </button>
                      <span className="text-[11px] font-semibold px-2 py-0.2 rounded-md bg-slate-100 text-slate-600">
                        Tổ {log.studentGroup}
                      </span>
                      {log.isReverted && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                          Đã hủy
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {log.criterionName}
                      {log.note && <span className="italic text-slate-400"> - "{log.note}"</span>}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-black ${
                      log.isReverted
                        ? 'line-through text-slate-400'
                        : isPlus
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {log.pointsChanged > 0 ? `+${log.pointsChanged}` : log.pointsChanged}đ
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{log.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
