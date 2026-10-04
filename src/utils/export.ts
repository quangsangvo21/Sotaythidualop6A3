import { Student, ScoreLog, WeeklyArchive } from '../types';

// Helper to trigger browser file download with UTF-8 BOM for Excel support
function downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export student ranking to CSV
export function exportStudentsToCsv(students: Student[], weekNum: number = 4) {
  const headers = ['Mã HS', 'Họ và Tên', 'Tổ', 'Chức vụ', 'Điểm Tuần Này', 'Tổng Điểm', 'Xếp Hạng'];
  const sorted = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
  
  const rows = sorted.map((s, index) => [
    `"${s.id}"`,
    `"${s.name}"`,
    `"Tổ ${s.group}"`,
    `"${s.roleTitle || 'Học sinh'}"`,
    s.weeklyPoints,
    s.totalPoints,
    index + 1
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`Bang_Diem_Thi_Dua_Lop_6A3_Tuan_${weekNum}_${dateStr}.csv`, csvContent);
}

// Export scoring history logs
export function exportLogsToCsv(logs: ScoreLog[]) {
  const headers = ['Mã Log', 'Thời Gian', 'Người Chấm', 'Vai Trò', 'Mã HS', 'Tên Học Sinh', 'Tổ', 'Tiêu Chí', 'Điểm Thay Đổi', 'Trạng Thái', 'Ghi Chú'];
  const rows = logs.map(l => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.scorerName}"`,
    `"${l.scorerRole}"`,
    `"${l.studentId}"`,
    `"${l.studentName}"`,
    `"Tổ ${l.studentGroup}"`,
    `"${l.criterionName}"`,
    l.pointsChanged > 0 ? `+${l.pointsChanged}` : `${l.pointsChanged}`,
    l.isReverted ? '"Đã hủy"' : '"Hợp lệ"',
    `"${(l.note || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(`Nhat_Ky_Cham_Diem_6A3_${dateStr}.csv`, csvContent);
}

// Export Weekly Meeting Report
export function exportMeetingReportToCsv(archive: WeeklyArchive) {
  const lines: string[] = [];
  lines.push(`BÁO CÁO THI ĐUA SINH HOẠT LỚP 6A3 - TUẦN ${archive.week}`);
  lines.push(`Ngày xuất: ${archive.date}`);
  lines.push(`Tổng điểm thi đua toàn lớp: ${archive.totalClassPoints} điểm`);
  lines.push('');
  lines.push('XẾP HẠNG THI ĐUA CÁC TỔ:');
  lines.push('Hạng,Tổ,Tổng Điểm,Điểm Trung Bình Thành Viên');
  archive.groupRanking.forEach((g, idx) => {
    lines.push(`${idx + 1},"Tổ ${g.group}",${g.points},${g.average.toFixed(1)}`);
  });

  lines.push('');
  lines.push('TOP 5 HỌC SINH XUẤT SẮC ĐƯỢC TUYÊN DƯƠNG:');
  lines.push('Hạng,Họ và Tên,Tổ,Tổng Điểm');
  archive.topStudents.forEach((s, idx) => {
    lines.push(`${idx + 1},"${s.name}","Tổ ${s.group}",${s.points}`);
  });

  lines.push('');
  lines.push('HỌC SINH CẦN NHẮC NHỞ / CỐ GẮNG NỀ NẾP:');
  lines.push('Hạng,Họ và Tên,Tổ,Tổng Điểm');
  archive.lowStudents.forEach((s, idx) => {
    lines.push(`${idx + 1},"${s.name}","Tổ ${s.group}",${s.points}`);
  });

  const csvContent = lines.join('\r\n');
  downloadFile(`Bao_Cao_Sinh_Hoat_Lop_6A3_Tuan_${archive.week}.csv`, csvContent);
}

// Download Sample Template for importing students
export function downloadStudentTemplateCsv() {
  const content = [
    'MaHS,HoTen,To,GioiTinh,ChucVu,DiemBanDau',
    'HS01,Nguyễn Văn An,1,nam,Lớp trưởng,100',
    'HS02,Trần Thị Mai,1,nu,Tổ trưởng Tổ 1,100',
    'HS03,Lê Hoàng Nam,2,nam,Học sinh,100',
    'HS04,Phạm Quỳnh Chi,2,nu,Tổ phó,100',
    'HS05,Võ Minh Khang,3,nam,Cờ đỏ,100'
  ].join('\r\n');
  downloadFile('Mau_Import_Danh_Sach_Hoc_Sinh_6A3.csv', content);
}

// Parse imported CSV file
export function parseStudentsCsv(csvText: string): Partial<Student>[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  const students: Partial<Student>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
    if (parts.length >= 2) {
      const id = parts[0] || `HS${String(i).padStart(2, '0')}`;
      const name = parts[1];
      const groupNum = parseInt(parts[2], 10) || 1;
      const gender = (parts[3] || 'nam').toLowerCase() === 'nu' ? 'nu' : 'nam';
      const roleTitle = parts[4] || 'Học sinh';
      const points = parseInt(parts[5], 10) || 100;

      students.push({
        id,
        name,
        group: Math.min(Math.max(groupNum, 1), 4),
        gender,
        roleTitle,
        totalPoints: points,
        weeklyPoints: points,
      });
    }
  }
  return students;
}
