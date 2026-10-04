import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Award, TrendingUp, Calendar, Zap, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { StudentAvatar } from './StudentAvatar';

interface StudentProfileModalProps {
  onOpenScoringWithStudent?: (studentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ onOpenScoringWithStudent }) => {
  const { selectedStudentModal, setSelectedStudentModal, students, logs, currentUser, revertLog } = useApp();

  if (!selectedStudentModal) return null;

  // Refresh latest data for this student from list
  const student = students.find((s) => s.id === selectedStudentModal.id) || selectedStudentModal;
  const sortedStudents = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
  const currentRank = sortedStudents.findIndex((s) => s.id === student.id) + 1;

  // Filter logs for this student
  const studentLogs = logs.filter((l) => l.studentId === student.id);

  // Group calculations
  const groupMates = students.filter((s) => s.group === student.group);
  const groupPoints = groupMates.reduce((sum, s) => sum + s.totalPoints, 0);
  const groupAvg = groupMates.length > 0 ? (groupPoints / groupMates.length).toFixed(1) : '0';

  const plusLogsCount = studentLogs.filter((l) => l.type === 'plus' && !l.isReverted).length;
  const minusLogsCount = studentLogs.filter((l) => l.type === 'minus' && !l.isReverted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-blue-800 p-5 text-white relative">
          <button
            onClick={() => setSelectedStudentModal(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <StudentAvatar student={student} size="xl" editable={true} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase bg-white/20 backdrop-blur-md">
                  Tổ {student.group}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-800/60">
                  {student.roleTitle || 'Học sinh'}
                </span>
                <span className="text-xs text-white/80 font-mono">#{student.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 text-white truncate">{student.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-red-100">
                <span>Hạng #{currentRank} / {students.length}</span>
                <span>•</span>
                <span>Tổ trung bình: {groupAvg}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-3 sm:p-4 gap-2 text-center">
          <div className="p-2 sm:p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Tổng Điểm</div>
            <div className={`text-xl sm:text-2xl font-black mt-0.5 ${student.totalPoints >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {student.totalPoints}
            </div>
            <div className="text-[11px] text-slate-400">Chuẩn: 100đ</div>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Điểm Tuần Này</div>
            <div className={`text-xl sm:text-2xl font-black mt-0.5 ${student.weeklyPoints >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {student.weeklyPoints > 0 ? `+${student.weeklyPoints}` : student.weeklyPoints}
            </div>
            <div className="text-[11px] text-slate-400">Thay đổi tuần</div>
          </div>

          <div className="p-2 sm:p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="text-xs text-slate-500 font-medium">Lượt Chấm</div>
            <div className="flex items-center justify-center gap-2 mt-1 text-sm font-bold">
              <span className="text-emerald-600 flex items-center">+{plusLogsCount}</span>
              <span className="text-slate-300">/</span>
              <span className="text-rose-600 flex items-center">-{minusLogsCount}</span>
            </div>
            <div className="text-[11px] text-slate-400">Khen / Nhắc</div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Nhật Ký Thi Đua Cá Nhân ({studentLogs.length})
          </div>
          {onOpenScoringWithStudent && (
            <button
              onClick={() => {
                const sId = student.id;
                setSelectedStudentModal(null);
                onOpenScoringWithStudent(sId);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              <Zap className="w-3.5 h-3.5" />
              Chấm điểm ngay
            </button>
          )}
        </div>

        {/* Timeline Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {studentLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="text-sm font-medium">Chưa có lịch sử chấm điểm nào cho học sinh này</p>
              <p className="text-xs text-slate-400 mt-1">Các lượt khen thưởng và vi phạm sẽ được ghi nhận tại đây.</p>
            </div>
          ) : (
            studentLogs.map((log) => {
              const isPlus = log.type === 'plus';
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition ${
                    log.isReverted
                      ? 'bg-slate-100/70 border-slate-200 opacity-60'
                      : isPlus
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isPlus ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800">{log.criterionName}</span>
                          {log.isReverted && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-600 font-medium">
                              Đã hủy
                            </span>
                          )}
                        </div>
                        {log.note && <p className="text-xs text-slate-600 mt-0.5 italic">"{log.note}"</p>}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{log.timestamp}</span>
                          <span>•</span>
                          <span>Bởi: {log.scorerName} ({log.scorerRole})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span
                        className={`text-base font-black ${
                          log.isReverted
                            ? 'line-through text-slate-400'
                            : isPlus
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {log.pointsChanged > 0 ? `+${log.pointsChanged}` : log.pointsChanged}đ
                      </span>

                      {/* Revert option for GVCN or Scorer */}
                      {!log.isReverted && (currentUser.role === 'gvcn' || currentUser.name === log.scorerName) && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận hủy lượt chấm điểm này của ${student.name}?`)) {
                              revertLog(log.id);
                            }
                          }}
                          className="mt-1 text-[11px] text-rose-600 hover:text-rose-800 underline font-medium"
                        >
                          Hủy bỏ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setSelectedStudentModal(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
