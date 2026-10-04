import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  History, 
  Search, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Filter,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { exportLogsToCsv } from '../utils/export';

export const HistoryLogsPage: React.FC = () => {
  const { logs, revertLog, currentUser, setSelectedStudentModal, students } = useApp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'plus' | 'minus' | 'reverted'>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Type filter
      if (filterType === 'plus' && (log.type !== 'plus' || log.isReverted)) return false;
      if (filterType === 'minus' && (log.type !== 'minus' || log.isReverted)) return false;
      if (filterType === 'reverted' && !log.isReverted) return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        log.studentName.toLowerCase().includes(q) ||
        log.studentId.toLowerCase().includes(q) ||
        log.criterionName.toLowerCase().includes(q) ||
        log.scorerName.toLowerCase().includes(q) ||
        (log.note && log.note.toLowerCase().includes(q))
      );
    });
  }, [logs, filterType, search]);

  const handleRevert = async (logId: string, studentName: string, points: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn HỦY BỎ lượt chấm điểm này của học sinh "${studentName}" (${points > 0 ? '+' : ''}${points}đ)? Điểm số sẽ được tự động hoàn lại!`)) {
      await revertLog(logId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold mb-1">
            <History className="w-3.5 h-3.5" />
            Nhật Ký Hệ Thống ({logs.length} lượt)
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Lịch Sử Chấm Điểm & Kiểm Soát Nề Nếp
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Toàn bộ lịch sử cộng / trừ điểm được ghi nhận minh bạch và có thể hoàn tác khi chấm nhầm
          </p>
        </div>

        <button
          onClick={() => exportLogsToCsv(logs)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Xuất Nhật Ký CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setFilterType('plus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filterType === 'plus'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Việc Tốt ({logs.filter((l) => l.type === 'plus' && !l.isReverted).length})
          </button>
          <button
            onClick={() => setFilterType('minus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filterType === 'minus'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Vi Phạm ({logs.filter((l) => l.type === 'minus' && !l.isReverted).length})
          </button>
          <button
            onClick={() => setFilterType('reverted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              filterType === 'reverted'
                ? 'bg-slate-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Đã Hủy ({logs.filter((l) => l.isReverted).length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo học sinh, người chấm, tiêu chí..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Thời Gian</th>
                <th className="px-4 py-3">Học Sinh</th>
                <th className="px-4 py-3">Tổ</th>
                <th className="px-4 py-3">Tiêu Chí Thi Đua</th>
                <th className="px-4 py-3 text-right">Điểm</th>
                <th className="px-4 py-3">Người Chấm</th>
                <th className="px-4 py-3 text-center">Trạng Thái</th>
                <th className="px-4 py-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi chấm điểm nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isPlus = log.type === 'plus';
                  const studentObj = students.find((s) => s.id === log.studentId);
                  const canRevert = !log.isReverted && (currentUser.role === 'gvcn' || currentUser.name === log.scorerName);

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/70 transition ${
                        log.isReverted ? 'bg-slate-100/50 opacity-60' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => studentObj && setSelectedStudentModal(studentObj)}
                          className="font-bold text-slate-900 hover:text-red-600 transition text-left"
                        >
                          {log.studentName}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                          Tổ {log.studentGroup}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {isPlus ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span className="font-semibold text-xs text-slate-800">
                            {log.criterionName}
                          </span>
                        </div>
                        {log.note && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5">
                            "{log.note}"
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-black text-xs sm:text-sm ${
                            log.isReverted
                              ? 'line-through text-slate-400'
                              : isPlus
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {log.pointsChanged > 0 ? `+${log.pointsChanged}` : log.pointsChanged}đ
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600">
                        <div className="font-medium text-slate-800">{log.scorerName}</div>
                        <div className="text-[10px] text-slate-400">{log.scorerRole}</div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {log.isReverted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                            Đã hủy hoàn điểm
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPlus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Hợp lệ
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {canRevert ? (
                          <button
                            type="button"
                            onClick={() => handleRevert(log.id, log.studentName, log.pointsChanged)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition"
                            title="Hoàn trả điểm và hủy log"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Hủy Bỏ</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
