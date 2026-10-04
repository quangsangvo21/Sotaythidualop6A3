export type RoleType = 'gvcn' | 'lop_truong' | 'co_do' | 'to_truong';

export interface UserSession {
  role: RoleType;
  name: string;
  title: string;
  avatar: string;
  group?: number; // For To truong
}

export interface Student {
  id: string; // MaHS e.g. "HS01", "HS02"
  name: string; // HoTen
  group: number; // To: 1, 2, 3, 4
  gender: 'nam' | 'nu';
  avatar?: string;
  totalPoints: number; // TongDiem hien tai
  weeklyPoints: number; // Diem trong tuan
  previousRank?: number; // Rank tuan truoc
  roleTitle?: string; // e.g. "Lớp phó học tập", "Tổ trưởng Tổ 1", "Học sinh"
  notes?: string;
}

export interface EmulationCriterion {
  id: string; // MaTieuChi e.g. "TC01"
  name: string; // TenTieuChi
  type: 'plus' | 'minus'; // 'plus' = Diem cong, 'minus' = Diem tru
  points: number; // So diem (e.g. 5, 10)
  category: 'hoc_tap' | 'ne_nep' | 've_sinh' | 'hoat_dong' | 'khac';
  icon?: string;
}

export interface ScoreLog {
  id: string;
  timestamp: string; // ISO or 'DD/MM/YYYY HH:mm'
  scorerName: string;
  scorerRole: string;
  studentId: string;
  studentName: string;
  studentGroup: number;
  criterionId: string;
  criterionName: string;
  type: 'plus' | 'minus';
  pointsChanged: number; // e.g. +5 or -10
  note?: string;
  isReverted?: boolean;
  revertedAt?: string;
  revertedBy?: string;
}

export interface GroupSummary {
  group: number;
  name: string;
  leaderName: string;
  totalMembers: number;
  totalPoints: number;
  averagePoints: number;
  rank: number;
}

export interface ClassConfig {
  className: string; // "Lớp 6A3"
  schoolName: string; // "Trường THCS Lê Quý Đôn"
  schoolYear: string; // "2025 - 2026"
  currentWeek: number; // 4
  currentSemester: number; // 1
  gasUrl: string; // Google Apps Script Web App URL
  audioEnabled: boolean;
  autoConfetti: boolean;
  baselineScore: number; // Điểm chuẩn đầu tuần e.g. 100
}

export interface WeeklyArchive {
  week: number;
  date: string;
  totalClassPoints: number;
  topStudents: { id: string; name: string; points: number; group: number }[];
  lowStudents: { id: string; name: string; points: number; group: number }[];
  groupRanking: { group: number; points: number; average: number }[];
}
