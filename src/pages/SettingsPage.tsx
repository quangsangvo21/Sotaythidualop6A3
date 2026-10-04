import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles,
  HelpCircle,
  FileCode,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  GOOGLE_APPS_SCRIPT_CODE, 
  testGasConnection 
} from '../services/googleSheetsService';

export const SettingsPage: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    syncWithGoogleSheets, 
    pushAllToGoogleSheets, 
    resetAllDataToSample,
    isSyncing,
    addToast
  } = useApp();

  const [gasUrlInput, setGasUrlInput] = useState(config.gasUrl || '');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Class info form
  const [classNameInput, setClassNameInput] = useState(config.className);
  const [schoolNameInput, setSchoolNameInput] = useState(config.schoolName);
  const [schoolYearInput, setSchoolYearInput] = useState(config.schoolYear);
  const [currentWeekInput, setCurrentWeekInput] = useState(config.currentWeek);

  const handleSaveGasUrl = () => {
    updateConfig({ gasUrl: gasUrlInput.trim() });
    addToast('success', 'Đã lưu cấu hình URL Google Apps Script!');
  };

  const handleTestConnection = async () => {
    if (!gasUrlInput.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập URL Web App trước khi kiểm tra' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    const res = await testGasConnection(gasUrlInput.trim());
    setTestingConnection(false);
    setTestResult(res);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    addToast('success', 'Đã sao chép toàn bộ mã Google Apps Script vào clipboard!');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleSaveClassInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      className: classNameInput.trim(),
      schoolName: schoolNameInput.trim(),
      schoolYear: schoolYearInput.trim(),
      currentWeek: Number(currentWeekInput),
    });
    addToast('success', 'Đã cập nhật thông tin lớp học!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Cài Đặt & Kết Nối Google Sheets
            </h1>
            <p className="text-xs text-slate-500">
              Cấu hình liên kết cơ sở dữ liệu đám mây Google Sheets và tùy chỉnh hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* 1. GOOGLE APPS SCRIPT WEB APP INTEGRATION */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="font-extrabold text-base text-slate-900">
              Đường Link Google Apps Script (Web App URL)
            </h2>
          </div>
          {config.gasUrl ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Đã kết nối
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Chế độ Cục Bộ (LocalStorage)
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Dán đường link Web App được cấp sau khi bạn triển khai mã Apps Script vào Google Sheets (bắt đầu bằng <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600">https://script.google.com/macros/s/.../exec</code>).
        </p>

        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={gasUrlInput}
              onChange={(e) => setGasUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition"
            />
            <button
              onClick={handleSaveGasUrl}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu URL</span>
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {testingConnection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Kiểm Tra Kết Nối</span>
            </button>
          </div>

          {/* Test connection result badge */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Sync Buttons */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          <button
            onClick={syncWithGoogleSheets}
            disabled={isSyncing || !config.gasUrl}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Tải Dữ Liệu Từ Google Sheets Về Web</span>
          </button>

          <button
            onClick={pushAllToGoogleSheets}
            disabled={isSyncing || !config.gasUrl}
            className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Khởi Tạo / Lưu Toàn Bộ Lớp Lên Google Sheets</span>
          </button>
        </div>
      </div>

      {/* 2. GOOGLE APPS SCRIPT CODE & INSTRUCTIONS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-red-600" />
            <h2 className="font-extrabold text-base text-slate-900">
              Mã Nguồn Google Apps Script (Code.gs)
            </h2>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-1.5 transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Đã Sao Chép!' : 'Sao Chép Toàn Bộ Mã'}</span>
          </button>
        </div>

        {/* 4 Steps Guide */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs space-y-2 text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Hướng dẫn cài đặt nhanh 4 bước trên Google Drive của giáo viên:
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
            <li>Mở Google Sheets mới trên Drive, đặt tên file: <code className="bg-white px-1 py-0.5 rounded border font-mono">DU_LIEU_THI_DUA_6A3</code>.</li>
            <li>Vào menu trên thanh công cụ: <strong>Tiện ích mở rộng (Extensions)</strong> → <strong>Apps Script</strong>.</li>
            <li>Xóa mã trống và <strong>Dán toàn bộ mã nguồn bên dưới</strong> vào file <code className="bg-white px-1 py-0.5 rounded border font-mono">Code.gs</code> rồi bấm Lưu (Ctrl + S).</li>
            <li>Bấm nút xanh góc phải: <strong>Triển khai (Deploy)</strong> → <strong>Tùy chọn triển khai mới (New deployment)</strong>:
              <ul className="list-disc list-inside pl-4 mt-0.5">
                <li>Chọn loại: <strong>Ứng dụng web (Web app)</strong></li>
                <li>Thực thi với tư cách: <strong>Tôi (Me)</strong></li>
                <li>Ai có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong></li>
              </ul>
            </li>
            <li>Copy URL Web App vừa tạo và dán vào ô <strong>Đường Link Google Apps Script</strong> ở trên!</li>
          </ol>
        </div>

        {/* Code Preview Box */}
        <div className="relative">
          <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono max-h-64 overflow-y-auto leading-relaxed border border-slate-800">
            {GOOGLE_APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

      {/* 3. CLASS INFO & SYSTEM SETTINGS */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Thông Tin Lớp Học & Tùy Chọn
        </h2>

        <form onSubmit={handleSaveClassInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Tên Lớp
              </label>
              <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Trường Học
              </label>
              <input
                type="text"
                value={schoolNameInput}
                onChange={(e) => setSchoolNameInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Năm Học
              </label>
              <input
                type="text"
                value={schoolYearInput}
                onChange={(e) => setSchoolYearInput(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Tuần Thi Đua Hiện Tại
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={currentWeekInput}
                onChange={(e) => setCurrentWeekInput(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateConfig({ audioEnabled: !config.audioEnabled })}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 text-slate-700 hover:bg-slate-50"
              >
                {config.audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                <span>Âm thanh hiệu ứng: {config.audioEnabled ? 'BẬT' : 'TẮT'}</span>
              </button>
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-200 transition"
            >
              Cập Nhật Cấu Hình
            </button>
          </div>
        </form>
      </div>

      {/* 4. DANGER ZONE / RESET */}
      <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-rose-900">Khôi Phục Dữ Liệu Mẫu Ban Đầu</h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Xoá toàn bộ dữ liệu hiện tại và tải lại danh sách 40 học sinh lớp 6A3 và tiêu chí mẫu.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn đặt lại dữ liệu lớp 6A3 về trạng thái ban đầu?')) {
              resetAllDataToSample();
            }
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt Lại Dữ Liệu Mẫu</span>
        </button>
      </div>
    </div>
  );
};
