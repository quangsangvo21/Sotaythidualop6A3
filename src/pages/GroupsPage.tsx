import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderKanban, 
  Crown, 
  Users, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Zap, 
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import { Student } from '../types';

interface GroupsPageProps {
  onOpenQuickScoringWithStudent?: (studentId: string) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ onOpenQuickScoringWithStudent }) => {
  const { groupsSummary, students, setSelectedStudentModal } = useApp();
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<number | null>(null);

  const activeGroupData = selectedGroupDetail
    ? groupsSummary.find((g) => g.group === selectedGroupDetail)
    : null;

  const activeGroupMembers = selectedGroupDetail
    ? students
        .filter((s) => s.group === selectedGroupDetail)
        .sort((a, b) => b.totalPoints - a.totalPoints)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold mb-1">
            <FolderKanban className="w-3.5 h-3.5" />
            Thi Đua Tập Thể
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Thi Đua Giữa 4 Tổ Lớp 6A3
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xếp hạng thi đua tổ được tính theo Điểm Trung Bình cộng của tất cả thành viên trong tổ
          </p>
        </div>
      </div>

      {/* 4 Large Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupsSummary.map((group) => {
          let rankBadge = '';
          let borderHighlight = 'border-slate-200';
          let headerBg = 'bg-slate-50';

          if (group.rank === 1) {
            rankBadge = '🥇 Quán Quân';
            borderHighlight = 'border-amber-400 ring-2 ring-amber-300 shadow-amber-100';
            headerBg = 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950';
          } else if (group.rank === 2) {
            rankBadge = '🥈 Hạng Nhì';
            borderHighlight = 'border-slate-300 shadow-slate-100';
            headerBg = 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
          } else if (group.rank === 3) {
            rankBadge = '🥉 Hạng Ba';
            borderHighlight = 'border-amber-700/50';
            headerBg = 'bg-gradient-to-r from-amber-700 to-amber-800 text-white';
          } else {
            rankBadge = 'Hạng 4';
            borderHighlight = 'border-slate-200';
            headerBg = 'bg-slate-200 text-slate-700';
          }

          const isSelected = selectedGroupDetail === group.group;

          return (
            <div
              key={group.group}
              className={`rounded-2xl border bg-white shadow-xs overflow-hidden flex flex-col justify-between transition-all ${borderHighlight} ${
                isSelected ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <div>
                {/* Header Banner */}
                <div className={`p-4 flex items-center justify-between ${headerBg}`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">{group.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs bg-white/30 backdrop-blur-md">
                    {rankBadge}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Điểm Trung Bình:</span>
                    <span className="text-2xl font-black text-slate-900">
                      {group.averagePoints} <span className="text-xs font-normal text-slate-400">đ/HS</span>
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Tổng điểm tổ:</span>
                      <strong className="text-slate-900">{group.totalPoints} điểm</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Thành viên:</span>
                      <strong className="text-slate-900">{group.totalMembers} học sinh</strong>
                    </div>
                    <div className="flex justify-between text-slate-600 truncate">
                      <span>Tổ trưởng:</span>
                      <strong className="text-slate-900 truncate max-w-[120px]">{group.leaderName}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="p-3 bg-slate-50 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedGroupDetail(isSelected ? null : group.group)}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{isSelected ? 'Đóng Chi Tiết' : 'XEM CHI TIẾT TỔ'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Group Detail Expansion Table */}
      {activeGroupData && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Danh Sách Thành Viên - {activeGroupData.name} ({activeGroupMembers.length} học sinh)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổ trưởng: <strong>{activeGroupData.leaderName}</strong> • Tổng điểm: <strong>{activeGroupData.totalPoints}đ</strong> • Trung bình: <strong>{activeGroupData.averagePoints}đ/HS</strong>
              </p>
            </div>
            <button
              onClick={() => setSelectedGroupDetail(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline self-start sm:self-auto"
            >
              Thu gọn
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeGroupMembers.map((member, index) => (
              <div
                key={member.id}
                className="p-3.5 rounded-xl border border-slate-200/80 hover:border-red-300 hover:bg-red-50/20 transition flex items-center justify-between gap-3 bg-white"
              >
                <div
                  onClick={() => setSelectedStudentModal(member)}
                  className="flex items-center gap-2.5 cursor-pointer min-w-0"
                >
                  <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
                    {member.gender === 'nu' ? '👧' : '👦'}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      #{member.id} • {member.roleTitle || 'Học sinh'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className={`font-black text-sm ${member.totalPoints >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {member.totalPoints}đ
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {member.weeklyPoints > 0 ? `+${member.weeklyPoints}` : member.weeklyPoints}đ
                    </div>
                  </div>

                  {onOpenQuickScoringWithStudent && (
                    <button
                      onClick={() => onOpenQuickScoringWithStudent(member.id)}
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                      title="Chấm điểm cho bạn này"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
