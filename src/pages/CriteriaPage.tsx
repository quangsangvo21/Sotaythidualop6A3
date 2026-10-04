import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ListChecks, 
  Plus, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { EmulationCriterion } from '../types';

export const CriteriaPage: React.FC = () => {
  const { criteria, addCriterion, updateCriterion, deleteCriterion, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'plus' | 'minus'>('plus');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EmulationCriterion | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'plus' | 'minus'>('plus');
  const [formPoints, setFormPoints] = useState<number>(5);
  const [formCategory, setFormCategory] = useState<EmulationCriterion['category']>('ne_nep');
  const [formIcon, setFormIcon] = useState('⭐');

  const filteredCriteria = criteria.filter((c) => c.type === activeTab);

  const openAddModal = (presetType?: 'plus' | 'minus') => {
    setEditingCriterion(null);
    setFormType(presetType || activeTab);
    setFormName('');
    setFormPoints(5);
    setFormCategory('ne_nep');
    setFormIcon(presetType === 'minus' || activeTab === 'minus' ? '⚠️' : '⭐');
    setIsModalOpen(true);
  };

  const openEditModal = (c: EmulationCriterion) => {
    setEditingCriterion(c);
    setFormName(c.name);
    setFormType(c.type);
    setFormPoints(c.points);
    setFormCategory(c.category);
    setFormIcon(c.icon || '📌');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập tên tiêu chí!');
      return;
    }

    if (editingCriterion) {
      updateCriterion({
        ...editingCriterion,
        name: formName.trim(),
        type: formType,
        points: Math.abs(formPoints),
        category: formCategory,
        icon: formIcon,
      });
    } else {
      addCriterion({
        name: formName.trim(),
        type: formType,
        points: Math.abs(formPoints),
        category: formCategory,
        icon: formIcon,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold mb-1">
            <ListChecks className="w-3.5 h-3.5" />
            Nội Quy & Tiêu Chuẩn Lớp Học
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Danh Mục Tiêu Chí Thi Đua
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình các lỗi vi phạm và các hành vi biểu dương, khen thưởng nề nếp
          </p>
        </div>

        {currentUser.role === 'gvcn' && (
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-200 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Tiêu Chí Mới</span>
          </button>
        )}
      </div>

      {/* Tabs: Điểm Cộng vs Điểm Trừ */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex gap-2">
        <button
          onClick={() => setActiveTab('plus')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'plus'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>ĐIỂM CỘNG / VIỆC TỐT ({criteria.filter((c) => c.type === 'plus').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('minus')}
          className={`flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition ${
            activeTab === 'minus'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MinusCircle className="w-4 h-4" />
          <span>ĐIỂM TRỪ / VI PHẠM ({criteria.filter((c) => c.type === 'minus').length})</span>
        </button>
      </div>

      {/* Criteria Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredCriteria.map((c) => (
          <div
            key={c.id}
            className={`p-4 rounded-2xl border bg-white shadow-xs flex items-start justify-between gap-3 hover:shadow-md transition ${
              c.type === 'plus' ? 'border-emerald-200 hover:border-emerald-300' : 'border-rose-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 mt-0.5">
                {c.icon || (c.type === 'plus' ? '⭐' : '⚠️')}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 leading-snug">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-mono text-[11px] text-slate-400">#{c.id}</span>
                  <span>•</span>
                  <span className="px-2 py-0.2 rounded-md bg-slate-100 text-slate-600 capitalize font-medium">
                    {c.category === 'hoc_tap'
                      ? 'Học tập'
                      : c.category === 'ne_nep'
                      ? 'Nề nếp'
                      : c.category === 've_sinh'
                      ? 'Vệ sinh'
                      : 'Hoạt động'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <span
                className={`px-3 py-1 rounded-xl text-sm font-black ${
                  c.type === 'plus'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {c.type === 'plus' ? `+${c.points}` : `-${c.points}`}đ
              </span>

              {currentUser.role === 'gvcn' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Xóa tiêu chí "${c.name}"?`)) {
                        deleteCriterion(c.id);
                      }
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Xóa tiêu chí"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Criterion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingCriterion ? 'Chỉnh Sửa Tiêu Chí Thi Đua' : 'Thêm Tiêu Chí Thi Đua Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Loại Tiêu Chí
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormType('plus');
                      if (formIcon === '⚠️') setFormIcon('⭐');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formType === 'plus'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-400'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Điểm Cộng (+)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType('minus');
                      if (formIcon === '⭐') setFormIcon('⚠️');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      formType === 'minus'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-1 ring-rose-400'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" /> Điểm Trừ (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tên Tiêu Chí / Lỗi Vi Phạm
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Mặc sai đồng phục, Không thuộc bài, Giúp đỡ bạn..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Số Điểm Thay Đổi
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Math.abs(Number(e.target.value)))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Biểu Tượng Emoji
                  </label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="⭐, ⚠️, ⏰, 🧹..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Nhóm Danh Mục
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as EmulationCriterion['category'])}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                >
                  <option value="ne_nep">Nề nếp / Kỷ luật</option>
                  <option value="hoc_tap">Học tập / Chuyên cần</option>
                  <option value="ve_sinh">Vệ sinh / Trực nhật</option>
                  <option value="hoat_dong">Phong trào / Hoạt động Đội</option>
                  <option value="khac">Khác</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200"
                >
                  {editingCriterion ? 'Cập Nhật' : 'Lưu Tiêu Chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
