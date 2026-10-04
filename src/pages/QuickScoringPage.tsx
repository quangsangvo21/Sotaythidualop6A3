import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Check, 
  Sparkles,
  PlusCircle,
  MinusCircle,
  Clock,
  Send
} from 'lucide-react';
import { EmulationCriterion, Student } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';

interface QuickScoringPageProps {
  preselectedStudentId?: string | null;
  onClearPreselectedStudent?: () => void;
}

export const QuickScoringPage: React.FC<QuickScoringPageProps> = ({
  preselectedStudentId,
  onClearPreselectedStudent,
}) => {
  const { students, criteria, scoreStudent, currentUser } = useApp();

  // Step 1: Selected Student
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [activeGroupFilter, setActiveGroupFilter] = useState<number | 'all'>('all');

  // Step 2: Behavior Type: 'plus' (Việc tốt) vs 'minus' (Vi phạm)
  const [behaviorType, setBehaviorType] = useState<'plus' | 'minus'>('plus');

  // Step 3: Selected Criterion
  const [selectedCriterionId, setSelectedCriterionId] = useState<string>('');

  // Step 4: Optional Note & Custom Points
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Update if preselected prop changes
  React.useEffect(() => {
    if (preselectedStudentId) {
      setSelectedStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  // Find currently selected student object
  const currentStudent = students.find((s) => s.id === selectedStudentId);

  // Filter students for Step 1 picker
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGroup = activeGroupFilter === 'all' || s.group === activeGroupFilter;
      const matchQuery =
        !studentSearch.trim() ||
        s.name.toLowerCase().includes(studentSearch.toLowerCase().trim()) ||
        s.id.toLowerCase().includes(studentSearch.toLowerCase().trim());
      return matchGroup && matchQuery;
    });
  }, [students, activeGroupFilter, studentSearch]);

  // Filter criteria by behaviorType (plus or minus)
  const activeCriteriaList = useMemo(() => {
    return criteria.filter((c) => c.type === behaviorType);
  }, [criteria, behaviorType]);

  const currentCriterion = criteria.find((c) => c.id === selectedCriterionId);

  // Submit scoring
  const handleScoreSubmit = async () => {
    if (!selectedStudentId) {
      alert('Vui lòng chọn học sinh trước khi chấm điểm!');
      return;
    }
    if (!selectedCriterionId) {
      alert('Vui lòng chọn tiêu chí thi đua!');
      return;
    }

    setIsSubmitting(true);
    const success = await scoreStudent(selectedStudentId, selectedCriterionId, undefined, note);
    setIsSubmitting(false);

    if (success) {
      // Reset criterion & note, keep student if needed or clear
      setSelectedCriterionId('');
      setNote('');
      if (onClearPreselectedStudent) {
        onClearPreselectedStudent();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-red-200">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Chấm Điểm Nhanh
            </h1>
            <p className="text-xs text-slate-500">
              Quy trình 3 bước tối ưu cho điện thoại: Chọn học sinh → Chọn hành vi → Lưu điểm
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 self-start sm:self-auto">
          <span>Người chấm: </span>
          <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.title})
        </div>
      </div>

      {/* STEP 1: CHỌN HỌC SINH */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="font-extrabold text-base text-slate-900">
              Chọn Học Sinh Cần Chấm Điểm
            </h2>
          </div>
          {currentStudent && (
            <button
              onClick={() => {
                setSelectedStudentId('');
                if (onClearPreselectedStudent) onClearPreselectedStudent();
              }}
              className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Chọn lại
            </button>
          )}
        </div>

        {/* Selected Student Banner (if chosen) */}
        {currentStudent ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-500 flex items-center justify-between gap-3 animate-in zoom-in-95">
            <div className="flex items-center gap-3 min-w-0">
              <StudentAvatar student={currentStudent} size="md" editable={true} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base text-slate-900 truncate">
                    {currentStudent.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                    Tổ {currentStudent.group}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">#{currentStudent.id}</span>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Điểm hiện tại: <strong className="text-red-700">{currentStudent.totalPoints}đ</strong> • {currentStudent.roleTitle || 'Học sinh'}
                </div>
              </div>
            </div>
            <div className="p-2 rounded-full bg-red-600 text-white">
              <Check className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Search and Group filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Gõ tên hoặc mã HS (vd: An, Nam, HS01)..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 1, 2, 3, 4] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setActiveGroupFilter(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                      activeGroupFilter === g
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g === 'all' ? 'Tất cả' : `Tổ ${g}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-100 rounded-xl">
              {filteredStudents.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStudentId(s.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/50 text-left transition bg-white"
                >
                  <StudentAvatar student={s} size="xs" editable={false} />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-800 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Tổ {s.group} • {s.totalPoints}đ
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: CHỌN LOẠI HÀNH VI (VIỆC TỐT vs VI PHẠM) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
            2
          </span>
          <h2 className="font-extrabold text-base text-slate-900">
            Chọn Loại Hành Vi
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Green Positive Button */}
          <button
            type="button"
            onClick={() => {
              setBehaviorType('plus');
              setSelectedCriterionId('');
            }}
            className={`py-4 px-4 rounded-2xl border-2 font-black text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition shadow-sm ${
              behaviorType === 'plus'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PlusCircle className={`w-6 h-6 sm:w-7 sm:h-7 ${behaviorType === 'plus' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div className="text-center sm:text-left">
              <div>🟢 VIỆC TỐT / KHEN THƯỞNG</div>
              <div className="text-[11px] font-normal text-emerald-700 opacity-90 hidden sm:block">
                Cộng điểm thi đua (+5đ, +10đ, +15đ)
              </div>
            </div>
          </button>

          {/* Red Negative Button */}
          <button
            type="button"
            onClick={() => {
              setBehaviorType('minus');
              setSelectedCriterionId('');
            }}
            className={`py-4 px-4 rounded-2xl border-2 font-black text-sm sm:text-base flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 transition shadow-sm ${
              behaviorType === 'minus'
                ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MinusCircle className={`w-6 h-6 sm:w-7 sm:h-7 ${behaviorType === 'minus' ? 'text-rose-600' : 'text-slate-400'}`} />
            <div className="text-center sm:text-left">
              <div>🔴 VI PHẠM NỘI QUY</div>
              <div className="text-[11px] font-normal text-rose-700 opacity-90 hidden sm:block">
                Trừ điểm thi đua (-5đ, -10đ, -15đ)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* STEP 3: CHỌN TIÊU CHÍ */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h2 className="font-extrabold text-base text-slate-900">
              Chọn Tiêu Chí Thi Đua ({activeCriteriaList.length})
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {behaviorType === 'plus' ? 'Các việc tốt' : 'Các lỗi vi phạm'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {activeCriteriaList.map((crit) => {
            const isSelected = selectedCriterionId === crit.id;
            return (
              <button
                key={crit.id}
                type="button"
                onClick={() => setSelectedCriterionId(crit.id)}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-start justify-between gap-3 transition ${
                  isSelected
                    ? behaviorType === 'plus'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-300'
                      : 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-300'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0 mt-0.5">{crit.icon || '📌'}</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                      {crit.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                      {crit.category}
                    </div>
                  </div>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shrink-0 ${
                    crit.type === 'plus'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {crit.type === 'plus' ? `+${crit.points}` : `-${crit.points}`}đ
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional Note Field */}
        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Ghi chú thêm (Tùy chọn)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Tiết Toán, kiểm tra 15p, đến muộn 10 phút, trực nhật dãy bàn 3..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* FINAL SUBMIT BUTTON BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
        <div className="text-xs text-slate-600 text-center sm:text-left">
          {currentStudent && currentCriterion ? (
            <span>
              Sẵn sàng {currentCriterion.type === 'plus' ? 'cộng' : 'trừ'}{' '}
              <strong className={currentCriterion.type === 'plus' ? 'text-emerald-600' : 'text-rose-600'}>
                {currentCriterion.type === 'plus' ? `+${currentCriterion.points}` : `-${currentCriterion.points}`}đ
              </strong>{' '}
              cho <strong className="text-slate-900">{currentStudent.name}</strong> (Tổ {currentStudent.group})
            </span>
          ) : (
            <span className="text-slate-400">Vui lòng chọn học sinh và tiêu chí ở các bước trên</span>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedStudentId || !selectedCriterionId || isSubmitting}
          onClick={handleScoreSubmit}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 ${
            !selectedStudentId || !selectedCriterionId || isSubmitting
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : behaviorType === 'plus'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
          }`}
        >
          {isSubmitting ? (
            <span>Đang ghi điểm...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                LƯU ĐIỂM NGAY (
                {currentCriterion ? (currentCriterion.type === 'plus' ? `+${currentCriterion.points}` : `-${currentCriterion.points}`) : '0'}
                đ)
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
