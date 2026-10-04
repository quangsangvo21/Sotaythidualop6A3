import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Search, 
  UserPlus, 
  Upload, 
  Download, 
  Edit3, 
  Trash2, 
  FileText, 
  X, 
  Check, 
  HelpCircle,
  Zap
} from 'lucide-react';
import { Student } from '../types';
import { StudentAvatar } from '../components/StudentAvatar';
import { 
  exportStudentsToCsv, 
  downloadStudentTemplateCsv, 
  parseStudentsCsv 
} from '../utils/export';

interface StudentsPageProps {
  onOpenQuickScoringWithStudent?: (studentId: string) => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({ onOpenQuickScoringWithStudent }) => {
  const { 
    students, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    importStudents, 
    currentUser, 
    setSelectedStudentModal,
    config
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGroup, setFormGroup] = useState<number>(1);
  const [formGender, setFormGender] = useState<'nam' | 'nu'>('nam');
  const [formRole, setFormRole] = useState('Học sinh');
  const [formInitialPoints, setFormInitialPoints] = useState<number>(100);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
      const matchSearch =
        !search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.id.toLowerCase().includes(search.toLowerCase().trim()) ||
        (s.roleTitle && s.roleTitle.toLowerCase().includes(search.toLowerCase().trim()));
      return matchGroup && matchSearch;
    });
  }, [students, selectedGroup, search]);

  const openAddModal = () => {
    const nextNum = students.length + 1;
    setFormId(`HS${String(nextNum).padStart(2, '0')}`);
    setFormName('');
    setFormGroup(1);
    setFormGender('nam');
    setFormRole('Học sinh');
    setFormInitialPoints(100);
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormId(student.id);
    setFormName(student.name);
    setFormGroup(student.group);
    setFormGender(student.gender);
    setFormRole(student.roleTitle || 'Học sinh');
    setFormInitialPoints(student.totalPoints);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        name: formName.trim(),
        group: formGroup,
        gender: formGender,
        roleTitle: formRole.trim(),
        totalPoints: formInitialPoints,
      });
    } else {
      addStudent({
        id: formId.trim() || `HS${Date.now()}`,
        name: formName.trim(),
        group: formGroup,
        gender: formGender,
        roleTitle: formRole.trim(),
        initialPoints: formInitialPoints,
      });
    }

    setIsAddModalOpen(false);
  };

  // CSV File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseStudentsCsv(text);
        if (parsed.length > 0) {
          importStudents(parsed);
        } else {
          alert('Không đọc được dữ liệu học sinh từ file CSV này. Hãy tải file mẫu để xem định dạng chuẩn!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            Sĩ số: {students.length} Học Sinh
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Danh Sách Học Sinh Lớp 6A3
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ thi đua, thông tin ban cán sự và phân chia tổ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import CSV */}
          <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Import CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Download Sample Template */}
          <button
            onClick={downloadStudentTemplateCsv}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
            title="Tải file mẫu Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Mẫu CSV</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportStudentsToCsv(students, config.currentWeek)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
            title="Xuất danh sách ra file Excel"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Add Student Button (Admin / GVCN) */}
          {currentUser.role === 'gvcn' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-200 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Học Sinh</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 1, 2, 3, 4] as const).map((g) => {
            const count = g === 'all' ? students.length : students.filter((s) => s.group === g).length;
            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedGroup === g
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'all' ? `Tất cả (${count})` : `Tổ ${g} (${count})`}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã HS, chức vụ..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Mã HS</th>
                <th className="px-4 py-3">Học Sinh</th>
                <th className="px-4 py-3">Tổ</th>
                <th className="px-4 py-3">Chức Vụ</th>
                <th className="px-4 py-3 text-right">Điểm Tuần</th>
                <th className="px-4 py-3 text-right">Tổng Điểm</th>
                <th className="px-4 py-3 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{s.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={s} size="sm" editable={true} />
                      <button
                        type="button"
                        onClick={() => setSelectedStudentModal(s)}
                        className="font-bold text-slate-900 hover:text-red-600 transition text-left"
                      >
                        {s.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                      Tổ {s.group}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.roleTitle || 'Học sinh'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-xs">
                    <span className={s.weeklyPoints >= 0 ? 'text-blue-600' : 'text-rose-600'}>
                      {s.weeklyPoints > 0 ? `+${s.weeklyPoints}` : s.weeklyPoints}đ
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-black text-sm ${s.totalPoints >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {s.totalPoints}đ
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedStudentModal(s)}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                        title="Xem hồ sơ chi tiết"
                      >
                        Hồ sơ
                      </button>

                      {onOpenQuickScoringWithStudent && (
                        <button
                          onClick={() => onOpenQuickScoringWithStudent(s.id)}
                          className="p-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Chấm điểm nhanh"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {currentUser.role === 'gvcn' && (
                        <>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa học sinh ${s.name} khỏi danh sách?`)) {
                                deleteStudent(s.id);
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingStudent ? 'Chỉnh Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mã Học Sinh
                </label>
                <input
                  type="text"
                  value={formId}
                  disabled={!!editingStudent}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="HS01, HS02..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Họ và Tên Học Sinh
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nguyễn Văn A..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tổ
                  </label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Giới Tính
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'nam' | 'nu')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="nam">Nam (👦)</option>
                    <option value="nu">Nữ (👧)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Chức Vụ
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="Lớp trưởng, Tổ trưởng, Học sinh..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Điểm Số
                  </label>
                  <input
                    type="number"
                    value={formInitialPoints}
                    onChange={(e) => setFormInitialPoints(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200"
                >
                  {editingStudent ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
