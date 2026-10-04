import { Student, EmulationCriterion, ScoreLog, ClassConfig } from '../types';
import { INITIAL_CONFIG, INITIAL_CRITERIA, INITIAL_STUDENTS, INITIAL_LOGS } from './sampleData';

const STORAGE_KEYS = {
  STUDENTS: 'emulation_6a3_students',
  CRITERIA: 'emulation_6a3_criteria',
  LOGS: 'emulation_6a3_logs',
  CONFIG: 'emulation_6a3_config',
  USER: 'emulation_6a3_current_user',
};

// Google Apps Script source code template for teacher to deploy on Google Sheets
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ========================================================
 * SỔ TAY THI ĐUA THÔNG MINH LỚP 6A3 - GOOGLE APPS SCRIPT API
 * File: Code.gs
 * Tác giả: Hệ thống Quản Lý Thi Đua Nề Nếp Lớp Học 6A3
 * ========================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (3 BƯỚC):
 * 1. Mở Google Sheets của bạn (hoặc tạo file mới tên: DU_LIEU_THI_DUA_6A3)
 * 2. Vào menu: Tiện ích mở rộng (Extensions) -> Apps Script
 * 3. Xoá hết mã cũ, dán toàn bộ đoạn code này vào và bấm 'Lưu' (Ctrl + S)
 * 4. Bấm nút: 'Triển khai' (Deploy) -> 'Tùy chọn triển khai mới' (New deployment)
 *    - Chọn loại: Ứng dụng web (Web app)
 *    - Thực thi với tư cách: Tôi (Execute as: Me)
 *    - Ai có quyền truy cập: Bất kỳ ai (Who has access: Anyone)
 * 5. Bấm 'Triển khai' và copy URL ứng dụng web dán vào mục Cài đặt của Web App!
 */

const SHEET_NAMES = {
  STUDENTS: 'DANH_SACH_HOC_SINH',
  CRITERIA: 'DANH_MUC_THI_DUA',
  LOGS: 'LICH_SU_CHAM_DIEM',
  CONFIG: 'CAU_HINH'
};

function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#E2E8F0');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getOrCreateSheet(ss, SHEET_NAMES.STUDENTS, ['MaHS', 'HoTen', 'To', 'GioiTinh', 'ChucVu', 'TongDiem', 'DiemTuan', 'Avatar']);
  getOrCreateSheet(ss, SHEET_NAMES.CRITERIA, ['MaTieuChi', 'TenTieuChi', 'Loai', 'Diem', 'DanhMuc']);
  getOrCreateSheet(ss, SHEET_NAMES.LOGS, ['ID', 'ThoiGian', 'NguoiCham', 'VaiTro', 'MaHS', 'TenHocSinh', 'To', 'MaTieuChi', 'TenTieuChi', 'DiemThayDoi', 'TrangThai', 'GhiChu']);
  getOrCreateSheet(ss, SHEET_NAMES.CONFIG, ['Key', 'Value']);
}

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  initSheets();
  
  const action = (e && e.parameter && e.parameter.action) || 'getAll';
  
  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Kết nối Google Sheets thành công!' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Lấy dữ liệu tất cả các Sheet
  const studentsSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
  const criteriaSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
  const logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
  const configSheet = ss.getSheetByName(SHEET_NAMES.CONFIG);

  const students = sheetToObjects(studentsSheet);
  const criteria = sheetToObjects(criteriaSheet);
  const logs = sheetToObjects(logsSheet);
  const configArr = sheetToObjects(configSheet);
  
  const config = {};
  configArr.forEach(c => { if (c.Key) config[c.Key] = c.Value; });

  const result = {
    status: 'success',
    data: {
      students: students.map(s => ({
        id: String(s.MaHS || ''),
        name: String(s.HoTen || ''),
        group: Number(s.To || 1),
        gender: s.GioiTinh === 'nu' ? 'nu' : 'nam',
        roleTitle: String(s.ChucVu || 'Học sinh'),
        totalPoints: Number(s.TongDiem || 100),
        weeklyPoints: Number(s.DiemTuan || 0),
        avatar: String(s.Avatar || '')
      })),
      criteria: criteria.map(c => ({
        id: String(c.MaTieuChi || ''),
        name: String(c.TenTieuChi || ''),
        type: String(c.Loai || 'plus'),
        points: Number(c.Diem || 5),
        category: String(c.DanhMuc || 'ne_nep')
      })),
      logs: logs.map(l => ({
        id: String(l.ID || ''),
        timestamp: String(l.ThoiGian || ''),
        scorerName: String(l.NguoiCham || ''),
        scorerRole: String(l.VaiTro || ''),
        studentId: String(l.MaHS || ''),
        studentName: String(l.TenHocSinh || ''),
        studentGroup: Number(l.To || 1),
        criterionId: String(l.MaTieuChi || ''),
        criterionName: String(l.TenTieuChi || ''),
        pointsChanged: Number(l.DiemThayDoi || 0),
        type: Number(l.DiemThayDoi || 0) >= 0 ? 'plus' : 'minus',
        isReverted: String(l.TrangThai || '') === 'reverted',
        note: String(l.GhiChu || '')
      })),
      config: config
    }
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    initSheets();
    
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    const action = payload.action;
    
    if (action === 'score') {
      const log = payload.log;
      const logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
      logsSheet.appendRow([
        log.id,
        log.timestamp,
        log.scorerName,
        log.scorerRole,
        log.studentId,
        log.studentName,
        log.studentGroup,
        log.criterionId,
        log.criterionName,
        log.pointsChanged,
        'active',
        log.note || ''
      ]);
      
      // Update student points in sheet
      const studentsSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      const data = studentsSheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(log.studentId)) {
          const currentTotal = Number(data[i][5] || 0);
          const currentWeekly = Number(data[i][6] || 0);
          studentsSheet.getRange(i + 1, 6).setValue(currentTotal + Number(log.pointsChanged));
          studentsSheet.getRange(i + 1, 7).setValue(currentWeekly + Number(log.pointsChanged));
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đã lưu điểm thành công!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'revertScore') {
      const logId = payload.logId;
      const logsSheet = ss.getSheetByName(SHEET_NAMES.LOGS);
      const data = logsSheet.getDataRange().getValues();
      let found = false;
      let studentId = '';
      let pointsChanged = 0;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(logId)) {
          studentId = data[i][4];
          pointsChanged = Number(data[i][9]);
          logsSheet.getRange(i + 1, 11).setValue('reverted');
          found = true;
          break;
        }
      }

      if (found) {
        const studentsSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
        const sData = studentsSheet.getDataRange().getValues();
        for (let j = 1; j < sData.length; j++) {
          if (String(sData[j][0]) === String(studentId)) {
            const currentTotal = Number(sData[j][5] || 0);
            const currentWeekly = Number(sData[j][6] || 0);
            studentsSheet.getRange(j + 1, 6).setValue(currentTotal - pointsChanged);
            studentsSheet.getRange(j + 1, 7).setValue(currentWeekly - pointsChanged);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đã hoàn điểm thành công!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'uploadAvatar') {
      const studentId = payload.studentId;
      const base64Data = payload.base64Data; // data:image/jpeg;base64,...
      
      const avatarUrl = uploadAvatarToDrive(studentId, base64Data);
      
      // Update student Avatar column in DANH_SACH_HOC_SINH
      const studentsSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
      const data = studentsSheet.getDataRange().getValues();
      const headers = data[0];
      let avatarColIdx = -1;
      for (let h = 0; h < headers.length; h++) {
        if (String(headers[h]).toLowerCase() === 'avatar') {
          avatarColIdx = h;
          break;
        }
      }
      if (avatarColIdx === -1) {
        avatarColIdx = headers.length;
        studentsSheet.getRange(1, avatarColIdx + 1).setValue('Avatar').setFontWeight('bold');
      }

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(studentId)) {
          studentsSheet.getRange(i + 1, avatarColIdx + 1).setValue(avatarUrl);
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Cập nhật ảnh thành công!',
        avatarUrl: avatarUrl,
        studentId: studentId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'syncAll') {
      // Sync complete dataset to sheets
      const { students, criteria, logs } = payload;
      if (students) {
        const sSheet = ss.getSheetByName(SHEET_NAMES.STUDENTS);
        sSheet.clear();
        sSheet.appendRow(['MaHS', 'HoTen', 'To', 'GioiTinh', 'ChucVu', 'TongDiem', 'DiemTuan', 'Avatar']);
        students.forEach(s => {
          sSheet.appendRow([s.id, s.name, s.group, s.gender, s.roleTitle || 'Học sinh', s.totalPoints, s.weeklyPoints, s.avatar || '']);
        });
      }
      if (criteria) {
        const cSheet = ss.getSheetByName(SHEET_NAMES.CRITERIA);
        cSheet.clear();
        cSheet.appendRow(['MaTieuChi', 'TenTieuChi', 'Loai', 'Diem', 'DanhMuc']);
        criteria.forEach(c => {
          cSheet.appendRow([c.id, c.name, c.type, c.points, c.category]);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', message: 'Đã đồng bộ toàn bộ dữ liệu vào Google Sheets!' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Hành động không hợp lệ' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function uploadAvatarToDrive(studentId, base64Data) {
  // Folder: AVATAR_THI_DUA_6A3
  let folders = DriveApp.getFoldersByName('AVATAR_THI_DUA_6A3');
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder('AVATAR_THI_DUA_6A3');
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }

  // Parse mime type and clean base64 string
  let contentType = 'image/jpeg';
  let cleanBase64 = base64Data;
  if (base64Data.indexOf(';base64,') > -1) {
    const parts = base64Data.split(';base64,');
    contentType = parts[0].replace('data:', '');
    cleanBase64 = parts[1];
  }

  const decoded = Utilities.base64Decode(cleanBase64);
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const fileName = 'avatar_' + studentId + '_' + new Date().getTime() + '.' + ext;
  const blob = Utilities.newBlob(decoded, contentType, fileName);

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Return direct Google Drive thumbnail link for fast web display
  const fileId = file.getId();
  const directLink = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w500';
  return directLink;
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  return rows;
}
`;

export class LocalStorageDataService {
  static getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      this.saveStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  static saveStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  static getCriteria(): EmulationCriterion[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CRITERIA);
    if (!raw) {
      this.saveCriteria(INITIAL_CRITERIA);
      return INITIAL_CRITERIA;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CRITERIA;
    }
  }

  static saveCriteria(criteria: EmulationCriterion[]) {
    localStorage.setItem(STORAGE_KEYS.CRITERIA, JSON.stringify(criteria));
  }

  static getLogs(): ScoreLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      this.saveLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LOGS;
    }
  }

  static saveLogs(logs: ScoreLog[]) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  static getConfig(): ClassConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!raw) {
      this.saveConfig(INITIAL_CONFIG);
      return INITIAL_CONFIG;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.schoolName === 'Trường THCS Chu Văn An') {
        parsed.schoolName = 'Trường THCS Hải Châu I';
        this.saveConfig(parsed);
      }
      return { ...INITIAL_CONFIG, ...parsed };
    } catch {
      return INITIAL_CONFIG;
    }
  }

  static saveConfig(config: ClassConfig) {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }

  static resetToDefault() {
    this.saveStudents(INITIAL_STUDENTS);
    this.saveCriteria(INITIAL_CRITERIA);
    this.saveLogs(INITIAL_LOGS);
    this.saveConfig(INITIAL_CONFIG);
  }
}

// Google Apps Script Network Call with plain text payload to bypass CORS preflight
export async function testGasConnection(gasUrl: string): Promise<{ success: boolean; message: string }> {
  if (!gasUrl || !gasUrl.startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script không hợp lệ (cần bắt đầu bằng https://script.google.com/macros/s/...)' };
  }

  try {
    const testUrl = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=ping`;
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { success: true, message: data.message || 'Kết nối Google Sheets thành công!' };
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    return { 
      success: false, 
      message: `Không thể kết nối Google Apps Script (${errMessage}). Hãy kiểm tra xem đã triển khai ở chế độ 'Bất kỳ ai (Anyone)' chưa.` 
    };
  }
}

// Send scoring event to Google Apps Script
export async function postScoreToGas(gasUrl: string, log: ScoreLog): Promise<boolean> {
  if (!gasUrl || !gasUrl.startsWith('http')) return false;

  try {
    await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'score',
        log,
      }),
    });
    return true;
  } catch (err) {
    console.warn('Lỗi gửi điểm lên Google Apps Script:', err);
    return false;
  }
}

// Send revert event to Google Apps Script
export async function postRevertToGas(gasUrl: string, logId: string): Promise<boolean> {
  if (!gasUrl || !gasUrl.startsWith('http')) return false;

  try {
    await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'revertScore',
        logId,
      }),
    });
    return true;
  } catch (err) {
    console.warn('Lỗi hủy điểm trên Google Apps Script:', err);
    return false;
  }
}

// Push all local data into Google Sheets
export async function syncAllToGas(gasUrl: string, students: Student[], criteria: EmulationCriterion[], logs: ScoreLog[]): Promise<boolean> {
  if (!gasUrl || !gasUrl.startsWith('http')) return false;

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'syncAll',
        students,
        criteria,
        logs,
      }),
    });
    const result = await res.json();
    return result.status === 'success';
  } catch (err) {
    console.warn('Lỗi đồng bộ vào Google Apps Script:', err);
    return false;
  }
}

// Pull all data from Google Apps Script
export async function pullDataFromGas(gasUrl: string): Promise<{ students?: Student[]; criteria?: EmulationCriterion[]; logs?: ScoreLog[] } | null> {
  if (!gasUrl || !gasUrl.startsWith('http')) return null;

  try {
    const url = `${gasUrl}${gasUrl.includes('?') ? '&' : '?'}action=getAll`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === 'success' && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('Lỗi lấy dữ liệu từ Google Apps Script:', err);
    return null;
  }
}

// Upload student avatar to Google Apps Script (Drive + Sheet update)
export async function postAvatarToGas(
  gasUrl: string,
  studentId: string,
  base64Data: string
): Promise<{ success: boolean; avatarUrl?: string; message?: string }> {
  if (!gasUrl || !gasUrl.startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script' };
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'uploadAvatar',
        studentId,
        base64Data,
      }),
    });
    const result = await res.json();
    if (result.status === 'success') {
      return { success: true, avatarUrl: result.avatarUrl, message: result.message };
    }
    return { success: false, message: result.message || 'Lỗi không xác định từ Google Apps Script' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Lỗi tải ảnh lên Google Apps Script:', err);
    return { success: false, message: msg };
  }
}
