import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Trophy, 
  AlertTriangle, 
  Crown, 
  Printer, 
  Download, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Calendar,
  Users
} from 'lucide-react';
import { exportMeetingReportToCsv } from '../utils/export';
import { WeeklyArchive } from '../types';

export const ReportPage: React.FC = () => {
  const { 
    students, 
    groupsSummary, 
    config, 
    closeWeekAndArchive, 
    currentUser, 
    setSelectedStudentModal 
  } = useApp();

  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [archivedSnapshot, setArchivedSnapshot] = useState<WeeklyArchive | null>(null);

  // Top 5 and Low 3
  const sortedStudents = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
  const top5 = sortedStudents.slice(0, 5);
  const low3 = [...students].sort((a, b) => a.totalPoints - b.totalPoints).slice(0, 3);

  // Best and lowest team
  const bestTeam = groupsSummary[0];
  const lowestTeam = groupsSummary[groupsSummary.length - 1];

  const totalPoints = students.reduce((sum, s) => sum + s.totalPoints, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const archiveData: WeeklyArchive = {
      week: config.currentWeek,
      date: new Date().toLocaleDateString('vi-VN'),
      totalClassPoints: totalPoints,
      topStudents: top5.map((s) => ({ id: s.id, name: s.name, points: s.totalPoints, group: s.group })),
      lowStudents: low3.map((s) => ({ id: s.id, name: s.name, points: s.totalPoints, group: s.group })),
      groupRanking: groupsSummary.map((g) => ({ group: g.group, points: g.totalPoints, average: g.averagePoints })),
    };
    exportMeetingReportToCsv(archiveData);
  };

  const executeCloseWeek = () => {
    const archive = closeWeekAndArchive();
    setArchivedSnapshot(archive);
    setIsConfirmCloseOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Top Banner and Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Sinh Hoạt Lớp Thứ Sáu • Tuần {config.currentWeek}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Báo Cáo Thi Đua & Đánh Giá Nề Nếp Tuần {config.currentWeek}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp dữ liệu tự động phục vụ giáo viên chủ nhiệm và ban cán sự lớp tổng kết
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Xuất Báo Cáo CSV</span>
          </button>

          {currentUser.role === 'gvcn' && (
            <button
              onClick={() => setIsConfirmCloseOpen(true)}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-red-200 transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>CHỐT ĐIỂM TUẦN NÀY</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
              {config.schoolName}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              BẢNG TỔNG KẾT THI ĐUA NỀ NẾP {config.className.toUpperCase()}
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mt-2">
              <span>Năm học: {config.schoolYear}</span>
              <span>•</span>
              <span>Học kỳ {config.currentSemester}</span>
              <span>•</span>
              <span className="text-red-600 font-bold">TUẦN {config.currentWeek}</span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Ngày lập: {new Date().toLocaleDateString('vi-VN')}</div>
            <div className="font-bold text-slate-800 mt-0.5">GVCN: Cô Chu Thị Mai</div>
          </div>
        </div>

        {/* 1. ĐÁNH GIÁ THI ĐUA TẬP THỂ CÁC TỔ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
            <Crown className="w-5 h-5 text-amber-500" />
            I. XẾP HẠNG THI ĐUA CÁC TỔ
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {groupsSummary.map((group) => {
              const isFirst = group.rank === 1;
              const isLast = group.rank === groupsSummary.length;
              return (
                <div
                  key={group.group}
                  className={`p-4 rounded-2xl border ${
                    isFirst
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/60'
                      : isLast
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base text-slate-900">{group.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-black ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950'
                          : isLast
                          ? 'bg-rose-200 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isFirst ? '🥇 Nhất tuần' : isLast ? 'Cần cố gắng' : `Hạng ${group.rank}`}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Điểm TB:</span>
                    <span className="text-xl font-black text-slate-900">{group.averagePoints}đ/HS</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>Tổng: {group.totalPoints}đ</span>
                    <span>Tổ trưởng: {group.leaderName}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/60">
            📌 <strong>Nhận xét tổ:</strong> <strong>Tổ {bestTeam.group}</strong> đạt kết quả thi đua cao nhất với điểm trung bình {bestTeam.averagePoints} điểm. <strong>Tổ {lowestTeam.group}</strong> xếp cuối cần tăng cường ý thức tự quản và hạn chế lỗi quên bài tập, mất trật tự.
          </div>
        </div>

        {/* 2. TUYÊN DƯƠNG TOP 5 HỌC SINH XUẤT SẮC */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-700">
            <Trophy className="w-5 h-5 text-emerald-600" />
            II. TUYÊN DƯƠNG TOP 5 HỌC SINH XUẤT SẮC NHẤT
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {top5.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setSelectedStudentModal(s)}
                className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col items-center text-center cursor-pointer hover:bg-emerald-100/50 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-xl shadow-xs">
                  {s.gender === 'nu' ? '👧' : '👦'}
                </div>
                <div className="mt-2 font-black text-sm text-slate-900 truncate w-full">
                  {idx + 1}. {s.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Tổ {s.group}</div>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs">
                  {s.totalPoints} điểm
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. PHÊ BÌNH & NHẮC NHỞ TOP 3 HỌC SINH */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-rose-700">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            III. HỌC SINH CẦN CHẤN CHỈNH NỀ NẾP & HỌC TẬP
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {low3.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setSelectedStudentModal(s)}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-3 cursor-pointer hover:bg-rose-100/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-rose-300 flex items-center justify-center text-xl shadow-xs">
                    {s.gender === 'nu' ? '👧' : '👦'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{s.name}</div>
                    <div className="text-xs text-slate-500">Tổ {s.group} • #{s.id}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-rose-600">{s.totalPoints} điểm</div>
                  <div className="text-[10px] text-slate-400">Điểm tuần: {s.weeklyPoints}đ</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="font-bold text-slate-600 uppercase">ĐẠI DIỆN BAN CÁN SỰ LỚP</div>
            <div className="text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</div>
            <div className="h-16"></div>
            <div className="font-bold text-slate-800 text-sm">Nguyễn Gia Bảo</div>
            <div className="text-[11px] text-slate-500">Lớp trưởng 6A3</div>
          </div>

          <div>
            <div className="font-bold text-slate-600 uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
            <div className="text-slate-400 mt-0.5">(Ký duyệt)</div>
            <div className="h-16"></div>
            <div className="font-bold text-slate-800 text-sm">Cô Chu Thị Mai</div>
            <div className="text-[11px] text-slate-500">GVCN Lớp 6A3</div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Closing the Week */}
      {isConfirmCloseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-black text-lg text-slate-900">
                Xác Nhận Chốt Điểm Tuần {config.currentWeek}?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hành động này sẽ lưu trữ ảnh chụp thi đua Tuần {config.currentWeek}, reset điểm tuần về 0, và chuyển cả lớp sang <strong>Tuần {config.currentWeek + 1}</strong>.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              ⚠️ Tổng điểm tích lũy của học sinh vẫn được giữ nguyên, chỉ có chỉ số điểm trong tuần được đặt lại.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmCloseOpen(false)}
                className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={executeCloseWeek}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200"
              >
                Chốt Sổ & Sang Tuần Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
