import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Student, EmulationCriterion, ScoreLog, ClassConfig, UserSession, GroupSummary, WeeklyArchive } from '../types';
import { 
  LocalStorageDataService, 
  postScoreToGas, 
  postRevertToGas, 
  pullDataFromGas, 
  syncAllToGas,
  postAvatarToGas 
} from '../services/googleSheetsService';
import { sound } from '../utils/audio';
import { fireConfetti, fireStars } from '../utils/confetti';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  subMessage?: string;
  timestamp: number;
}

interface AppContextType {
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  logout: () => void;
  loginWithRole: (role: UserSession['role'], passcode?: string) => boolean;

  students: Student[];
  criteria: EmulationCriterion[];
  logs: ScoreLog[];
  config: ClassConfig;
  updateConfig: (newConfig: Partial<ClassConfig>) => void;

  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string, subMessage?: string) => void;
  removeToast: (id: string) => void;

  isSyncing: boolean;
  syncWithGoogleSheets: () => Promise<void>;
  pushAllToGoogleSheets: () => Promise<boolean>;

  // Actions
  scoreStudent: (studentId: string, criterionId: string, customPoints?: number, note?: string) => Promise<boolean>;
  revertLog: (logId: string) => Promise<boolean>;
  addStudent: (student: Omit<Student, 'totalPoints' | 'weeklyPoints'> & { initialPoints?: number }) => boolean;
  updateStudent: (student: Student) => boolean;
  updateStudentAvatar: (studentId: string, avatarData: string, base64Data?: string) => Promise<boolean>;
  deleteStudent: (studentId: string) => boolean;
  importStudents: (students: Partial<Student>[]) => number;

  addCriterion: (criterion: Omit<EmulationCriterion, 'id'>) => boolean;
  updateCriterion: (criterion: EmulationCriterion) => boolean;
  deleteCriterion: (criterionId: string) => boolean;

  closeWeekAndArchive: () => WeeklyArchive;
  resetAllDataToSample: () => void;

  // Computed
  groupsSummary: GroupSummary[];
  topStudents: Student[];
  lowStudents: Student[];
  selectedStudentModal: Student | null;
  setSelectedStudentModal: (student: Student | null) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USERS: Record<string, UserSession> = {
  gvcn: {
    role: 'gvcn',
    name: 'Cô Chu Thị Mai',
    title: 'Giáo viên chủ nhiệm 6A3',
    avatar: '👩‍🏫',
  },
  lop_truong: {
    role: 'lop_truong',
    name: 'Nguyễn Gia Bảo',
    title: 'Lớp trưởng 6A3',
    avatar: '🧑‍💼',
    group: 1,
  },
  co_do: {
    role: 'co_do',
    name: 'Trần Bảo Ngọc',
    title: 'Đội trưởng Cờ đỏ 6A3',
    avatar: '🚩',
    group: 4,
  },
  to_truong: {
    role: 'to_truong',
    name: 'Dương Mai Phương',
    title: 'Tổ trưởng Tổ 2',
    avatar: '⭐',
    group: 2,
  },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('emulation_6a3_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'gvcn') {
          return { ...parsed, name: 'Cô Chu Thị Mai' };
        }
        return parsed;
      } catch {
        return DEFAULT_USERS.gvcn;
      }
    }
    return DEFAULT_USERS.gvcn;
  });

  const [students, setStudents] = useState<Student[]>(() => LocalStorageDataService.getStudents());
  const [criteria, setCriteria] = useState<EmulationCriterion[]>(() => LocalStorageDataService.getCriteria());
  const [logs, setLogs] = useState<ScoreLog[]>(() => LocalStorageDataService.getLogs());
  const [config, setConfig] = useState<ClassConfig>(() => LocalStorageDataService.getConfig());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedStudentModal, setSelectedStudentModal] = useState<Student | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Sync sound preference
  useEffect(() => {
    sound.enabled = config.audioEnabled;
  }, [config.audioEnabled]);

  // Persist user session
  useEffect(() => {
    localStorage.setItem('emulation_6a3_session', JSON.stringify(currentUser));
  }, [currentUser]);

  // Toast helper
  const addToast = useCallback((type: ToastMessage['type'], message: string, subMessage?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, subMessage, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ClassConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      LocalStorageDataService.saveConfig(updated);
      return updated;
    });
  }, []);

  // Login handler
  const loginWithRole = useCallback((role: UserSession['role'], passcode?: string): boolean => {
    // Default passcodes for demo:
    // gvcn: 6A3GV
    // lop_truong: 6A3LT
    // co_do: 6A3CD
    // to_truong: 6A3TT
    // Or allow simple instant login if no strict code
    const validCodes: Record<string, string> = {
      gvcn: '6A3GV',
      lop_truong: '6A3LT',
      co_do: '6A3CD',
      to_truong: '6A3TT',
    };

    if (passcode && passcode.trim().toUpperCase() !== validCodes[role]) {
      addToast('error', 'Mật khẩu truy cập không chính xác', `Vui lòng nhập đúng mã dành cho ${role}`);
      return false;
    }

    const session = DEFAULT_USERS[role] || DEFAULT_USERS.gvcn;
    setCurrentUser(session);
    sound.playClick();
    addToast('success', `Đăng nhập thành công!`, `Chào mừng ${session.name} (${session.title})`);
    return true;
  }, [addToast]);

  const logout = useCallback(() => {
    setCurrentUser(DEFAULT_USERS.co_do);
    sound.playClick();
    addToast('info', 'Đã chuyển về quyền xem / cờ đỏ', 'Bạn có thể đăng nhập lại bằng tài khoản Giáo viên');
  }, [addToast]);

  // Pull data from Google Apps Script if URL is present on initial load
  useEffect(() => {
    if (config.gasUrl && config.gasUrl.startsWith('http')) {
      pullDataFromGas(config.gasUrl).then((remoteData) => {
        if (remoteData) {
          if (remoteData.students && remoteData.students.length > 0) {
            setStudents(remoteData.students);
            LocalStorageDataService.saveStudents(remoteData.students);
          }
          if (remoteData.criteria && remoteData.criteria.length > 0) {
            setCriteria(remoteData.criteria);
            LocalStorageDataService.saveCriteria(remoteData.criteria);
          }
          if (remoteData.logs && remoteData.logs.length > 0) {
            setLogs(remoteData.logs);
            LocalStorageDataService.saveLogs(remoteData.logs);
          }
        }
      });
    }
  }, [config.gasUrl]);

  // Sync with Google Sheets manually
  const syncWithGoogleSheets = useCallback(async () => {
    if (!config.gasUrl || !config.gasUrl.startsWith('http')) {
      addToast('warning', 'Chưa cài đặt URL Google Apps Script', 'Vui lòng vào mục Cài đặt để dán đường link triển khai');
      return;
    }
    setIsSyncing(true);
    try {
      const remoteData = await pullDataFromGas(config.gasUrl);
      if (remoteData) {
        if (remoteData.students) {
          setStudents(remoteData.students);
          LocalStorageDataService.saveStudents(remoteData.students);
        }
        if (remoteData.criteria) {
          setCriteria(remoteData.criteria);
          LocalStorageDataService.saveCriteria(remoteData.criteria);
        }
        if (remoteData.logs) {
          setLogs(remoteData.logs);
          LocalStorageDataService.saveLogs(remoteData.logs);
        }
        addToast('success', 'Đồng bộ Google Sheets thành công!', 'Dữ liệu thi đua đã cập nhật mới nhất');
        sound.playSuccess();
      } else {
        addToast('error', 'Không nhận được dữ liệu từ Google Sheets', 'Vui lòng kiểm tra lại quyền Web App');
      }
    } catch {
      addToast('error', 'Lỗi khi đồng bộ Google Sheets');
    } finally {
      setIsSyncing(false);
    }
  }, [config.gasUrl, addToast]);

  const pushAllToGoogleSheets = useCallback(async (): Promise<boolean> => {
    if (!config.gasUrl || !config.gasUrl.startsWith('http')) {
      addToast('warning', 'Chưa có URL Google Sheets', 'Vui lòng cấu hình URL Google Apps Script trong Cài đặt');
      return false;
    }
    setIsSyncing(true);
    try {
      const ok = await syncAllToGas(config.gasUrl, students, criteria, logs);
      if (ok) {
        addToast('success', 'Đã lưu toàn bộ dữ liệu vào Google Sheets!', '4 bảng danh sách đã được cập nhật');
        sound.playSuccess();
        return true;
      } else {
        addToast('error', 'Lỗi lưu vào Google Sheets', 'Vui lòng kiểm tra mã Apps Script');
        return false;
      }
    } catch {
      addToast('error', 'Không thể kết nối đến Google Sheets');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [config.gasUrl, students, criteria, logs, addToast]);

  // Scoring function: CORE UX WORKFLOW
  const scoreStudent = useCallback(
    async (studentId: string, criterionId: string, customPoints?: number, note?: string): Promise<boolean> => {
      const student = students.find((s) => s.id === studentId);
      const criterion = criteria.find((c) => c.id === criterionId);

      if (!student || !criterion) {
        addToast('error', 'Dữ liệu không hợp lệ', 'Không tìm thấy thông tin học sinh hoặc tiêu chí');
        return false;
      }

      const pointsDelta =
        customPoints !== undefined
          ? criterion.type === 'minus'
            ? -Math.abs(customPoints)
            : Math.abs(customPoints)
          : criterion.type === 'minus'
          ? -Math.abs(criterion.points)
          : Math.abs(criterion.points);

      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(
        2,
        '0'
      )}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newLog: ScoreLog = {
        id: `LOG_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp,
        scorerName: currentUser.name,
        scorerRole: currentUser.title,
        studentId: student.id,
        studentName: student.name,
        studentGroup: student.group,
        criterionId: criterion.id,
        criterionName: criterion.name,
        type: criterion.type,
        pointsChanged: pointsDelta,
        note: note?.trim() || undefined,
      };

      // 1. Play immediate audio
      if (criterion.type === 'plus') {
        sound.playSuccess();
      } else {
        sound.playWarning();
      }

      // 2. Update Student State immediately
      const updatedStudents = students.map((s) => {
        if (s.id === student.id) {
          const newTotal = s.totalPoints + pointsDelta;
          const newWeekly = s.weeklyPoints + pointsDelta;
          return {
            ...s,
            totalPoints: newTotal,
            weeklyPoints: newWeekly,
          };
        }
        return s;
      });

      // 3. Update Logs State
      const updatedLogs = [newLog, ...logs];

      setStudents(updatedStudents);
      setLogs(updatedLogs);

      LocalStorageDataService.saveStudents(updatedStudents);
      LocalStorageDataService.saveLogs(updatedLogs);

      // 4. Milestone Gamification (Confetti)
      const newScore = student.totalPoints + pointsDelta;
      if (criterion.type === 'plus') {
        if (newScore >= 100 && student.totalPoints < 100) {
          sound.playCelebration();
          fireConfetti(3000);
          addToast(
            'success',
            `🎉 Đạt Mốc 100 Điểm Danh Dự!`,
            `Chúc mừng ${student.name} đã chạm mốc 100 điểm thi đua xuất sắc!`
          );
        } else if (newScore >= 120 && pointsDelta >= 10) {
          fireStars();
        }
      }

      // 5. Toast Feedback
      if (criterion.type === 'plus') {
        addToast(
          'success',
          `🟢 Đã cộng +${Math.abs(pointsDelta)} điểm cho ${student.name}`,
          `Tiêu chí: ${criterion.name} (Tổ ${student.group})`
        );
      } else {
        addToast(
          'warning',
          `🔴 Đã trừ ${Math.abs(pointsDelta)} điểm của ${student.name}`,
          `Lý do: ${criterion.name} (Tổ ${student.group})`
        );
      }

      // 6. Push to Google Apps Script asynchronously
      if (config.gasUrl) {
        postScoreToGas(config.gasUrl, newLog).catch((err) => {
          console.error('Lỗi đẩy điểm lên Google Sheet:', err);
        });
      }

      return true;
    },
    [students, criteria, logs, currentUser, config.gasUrl, addToast]
  );

  // Revert / Undo a scoring action
  const revertLog = useCallback(
    async (logId: string): Promise<boolean> => {
      const log = logs.find((l) => l.id === logId);
      if (!log) {
        addToast('error', 'Không tìm thấy lượt chấm điểm cần hủy');
        return false;
      }
      if (log.isReverted) {
        addToast('warning', 'Lượt chấm điểm này đã được hủy bỏ trước đó');
        return false;
      }

      sound.playClick();

      // Undo points on student
      const updatedStudents = students.map((s) => {
        if (s.id === log.studentId) {
          return {
            ...s,
            totalPoints: s.totalPoints - log.pointsChanged,
            weeklyPoints: s.weeklyPoints - log.pointsChanged,
          };
        }
        return s;
      });

      const updatedLogs = logs.map((l) => {
        if (l.id === logId) {
          return {
            ...l,
            isReverted: true,
            revertedAt: new Date().toLocaleTimeString('vi-VN'),
            revertedBy: currentUser.name,
          };
        }
        return l;
      });

      setStudents(updatedStudents);
      setLogs(updatedLogs);

      LocalStorageDataService.saveStudents(updatedStudents);
      LocalStorageDataService.saveLogs(updatedLogs);

      addToast(
        'info',
        `Đã hủy thao tác chấm điểm (${log.pointsChanged > 0 ? '+' : ''}${log.pointsChanged}đ)`,
        `Đã hoàn lại điểm cho ${log.studentName}`
      );

      if (config.gasUrl) {
        postRevertToGas(config.gasUrl, logId).catch((err) => {
          console.error('Lỗi hủy điểm trên Google Sheet:', err);
        });
      }

      return true;
    },
    [logs, students, currentUser, config.gasUrl, addToast]
  );

  // Add Student
  const addStudent = useCallback(
    (studentData: Omit<Student, 'totalPoints' | 'weeklyPoints'> & { initialPoints?: number }): boolean => {
      const exists = students.some((s) => s.id === studentData.id);
      if (exists) {
        addToast('error', `Mã học sinh ${studentData.id} đã tồn tại!`);
        return false;
      }

      const initial = studentData.initialPoints ?? 100;
      const newStudent: Student = {
        ...studentData,
        totalPoints: initial,
        weeklyPoints: 0,
        roleTitle: studentData.roleTitle || 'Học sinh',
      };

      const updated = [...students, newStudent];
      setStudents(updated);
      LocalStorageDataService.saveStudents(updated);
      sound.playClick();
      addToast('success', `Đã thêm học sinh ${newStudent.name}`, `Mã: ${newStudent.id} - Tổ ${newStudent.group}`);
      return true;
    },
    [students, addToast]
  );

  // Update Student
  const updateStudent = useCallback(
    (updated: Student): boolean => {
      const next = students.map((s) => (s.id === updated.id ? updated : s));
      setStudents(next);
      LocalStorageDataService.saveStudents(next);
      sound.playClick();
      addToast('success', `Đã cập nhật thông tin ${updated.name}`);
      return true;
    },
    [students, addToast]
  );

  // Update Student Avatar (Immediate optimistic update + async GAS Drive sync)
  const updateStudentAvatar = useCallback(
    async (studentId: string, avatarData: string, base64Data?: string): Promise<boolean> => {
      const student = students.find((s) => s.id === studentId);
      if (!student) return false;

      // 1. Immediately update client-side state & local storage
      const updated = students.map((s) => (s.id === studentId ? { ...s, avatar: avatarData } : s));
      setStudents(updated);
      LocalStorageDataService.saveStudents(updated);

      if (selectedStudentModal && selectedStudentModal.id === studentId) {
        setSelectedStudentModal({ ...selectedStudentModal, avatar: avatarData });
      }

      sound.playSuccess();
      addToast('success', 'Cập nhật ảnh thành công!', `Đã lưu ảnh đại diện cho học sinh ${student.name}`);

      // 2. If Google Apps Script is configured, push Base64 to Google Drive & update Sheet
      if (config.gasUrl && base64Data) {
        try {
          const res = await postAvatarToGas(config.gasUrl, studentId, base64Data);
          if (res.success && res.avatarUrl) {
            // Replace with permanent Drive URL if returned
            const withDriveUrl = students.map((s) => (s.id === studentId ? { ...s, avatar: res.avatarUrl } : s));
            setStudents(withDriveUrl);
            LocalStorageDataService.saveStudents(withDriveUrl);
            if (selectedStudentModal && selectedStudentModal.id === studentId) {
              setSelectedStudentModal({ ...selectedStudentModal, avatar: res.avatarUrl });
            }
          }
        } catch (err) {
          console.warn('Lỗi đồng bộ avatar lên Drive:', err);
        }
      }

      return true;
    },
    [students, config.gasUrl, selectedStudentModal, addToast]
  );

  // Delete Student
  const deleteStudent = useCallback(
    (studentId: string): boolean => {
      const target = students.find((s) => s.id === studentId);
      if (!target) return false;
      const next = students.filter((s) => s.id !== studentId);
      setStudents(next);
      LocalStorageDataService.saveStudents(next);
      sound.playWarning();
      addToast('info', `Đã xóa học sinh ${target.name} khỏi danh sách`);
      return true;
    },
    [students, addToast]
  );

  // Bulk Import Students
  const importStudents = useCallback(
    (newStudents: Partial<Student>[]): number => {
      if (!newStudents.length) return 0;
      let count = 0;
      const map = new Map<string, Student>();
      students.forEach((s) => map.set(s.id, s));

      newStudents.forEach((ns, index) => {
        const id = ns.id || `HS${String(map.size + index + 1).padStart(2, '0')}`;
        if (!map.has(id) && ns.name) {
          map.set(id, {
            id,
            name: ns.name,
            group: ns.group || 1,
            gender: ns.gender || 'nam',
            totalPoints: ns.totalPoints ?? 100,
            weeklyPoints: ns.weeklyPoints ?? 0,
            roleTitle: ns.roleTitle || 'Học sinh',
          });
          count++;
        }
      });

      const updatedList = Array.from(map.values());
      setStudents(updatedList);
      LocalStorageDataService.saveStudents(updatedList);
      sound.playSuccess();
      addToast('success', `Đã nhập thành công ${count} học sinh vào lớp!`);
      return count;
    },
    [students, addToast]
  );

  // Criteria Management
  const addCriterion = useCallback(
    (criterion: Omit<EmulationCriterion, 'id'>): boolean => {
      const prefix = criterion.type === 'plus' ? 'TC_P' : 'TC_M';
      const id = `${prefix}${String(criteria.length + 1).padStart(2, '0')}`;
      const newCrit: EmulationCriterion = { ...criterion, id };
      const updated = [...criteria, newCrit];
      setCriteria(updated);
      LocalStorageDataService.saveCriteria(updated);
      sound.playClick();
      addToast('success', `Đã tạo tiêu chí mới: ${newCrit.name}`, `${newCrit.type === 'plus' ? '+' : '-'}${newCrit.points} điểm`);
      return true;
    },
    [criteria, addToast]
  );

  const updateCriterion = useCallback(
    (criterion: EmulationCriterion): boolean => {
      const updated = criteria.map((c) => (c.id === criterion.id ? criterion : c));
      setCriteria(updated);
      LocalStorageDataService.saveCriteria(updated);
      sound.playClick();
      addToast('success', `Đã cập nhật tiêu chí: ${criterion.name}`);
      return true;
    },
    [criteria, addToast]
  );

  const deleteCriterion = useCallback(
    (id: string): boolean => {
      const target = criteria.find((c) => c.id === id);
      if (!target) return false;
      const updated = criteria.filter((c) => c.id !== id);
      setCriteria(updated);
      LocalStorageDataService.saveCriteria(updated);
      sound.playWarning();
      addToast('info', `Đã xóa tiêu chí: ${target.name}`);
      return true;
    },
    [criteria, addToast]
  );

  // Close weekly emulation period and snapshot
  const closeWeekAndArchive = useCallback((): WeeklyArchive => {
    const sorted = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
    const topStudents = sorted.slice(0, 5).map((s) => ({
      id: s.id,
      name: s.name,
      points: s.totalPoints,
      group: s.group,
    }));
    const lowStudents = [...students].sort((a, b) => a.totalPoints - b.totalPoints).slice(0, 3).map((s) => ({
      id: s.id,
      name: s.name,
      points: s.totalPoints,
      group: s.group,
    }));

    const totalClassPoints = students.reduce((acc, s) => acc + s.totalPoints, 0);

    const groupRanking = [1, 2, 3, 4].map((g) => {
      const gStudents = students.filter((s) => s.group === g);
      const points = gStudents.reduce((acc, s) => acc + s.totalPoints, 0);
      const avg = gStudents.length > 0 ? points / gStudents.length : 0;
      return { group: g, points, average: avg };
    }).sort((a, b) => b.average - a.average);

    const archive: WeeklyArchive = {
      week: config.currentWeek,
      date: new Date().toLocaleDateString('vi-VN'),
      totalClassPoints,
      topStudents,
      lowStudents,
      groupRanking,
    };

    // Store archive in localStorage history
    const historyKey = 'emulation_6a3_archives';
    const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
    localStorage.setItem(historyKey, JSON.stringify([archive, ...existing]));

    // Advance week count and reset weekly delta
    const nextWeek = config.currentWeek + 1;
    updateConfig({ currentWeek: nextWeek });

    const updatedStudents = students.map((s, idx) => ({
      ...s,
      weeklyPoints: 0,
      previousRank: idx + 1,
    }));
    setStudents(updatedStudents);
    LocalStorageDataService.saveStudents(updatedStudents);

    sound.playCelebration();
    fireConfetti(3500);
    addToast('success', `Đã chốt sổ thi đua Tuần ${config.currentWeek}!`, `Chuyển sang Tuần ${nextWeek} thành công`);

    return archive;
  }, [students, config.currentWeek, updateConfig, addToast]);

  const resetAllDataToSample = useCallback(() => {
    LocalStorageDataService.resetToDefault();
    setStudents(LocalStorageDataService.getStudents());
    setCriteria(LocalStorageDataService.getCriteria());
    setLogs(LocalStorageDataService.getLogs());
    setConfig(LocalStorageDataService.getConfig());
    sound.playWarning();
    addToast('info', 'Đã đặt lại dữ liệu mẫu lớp 6A3 ban đầu');
  }, [addToast]);

  // Computed: Group Summaries
  const groupsSummary = useMemo((): GroupSummary[] => {
    const summaries: GroupSummary[] = [1, 2, 3, 4].map((groupNum) => {
      const members = students.filter((s) => s.group === groupNum);
      const leader = members.find((m) => m.roleTitle?.toLowerCase().includes('tổ trưởng')) || members[0];
      const totalPts = members.reduce((sum, m) => sum + m.totalPoints, 0);
      const avg = members.length > 0 ? totalPts / members.length : 0;
      return {
        group: groupNum,
        name: `Tổ ${groupNum}`,
        leaderName: leader ? leader.name : 'Chưa chỉ định',
        totalMembers: members.length,
        totalPoints: totalPts,
        averagePoints: Math.round(avg * 10) / 10,
        rank: 1,
      };
    });

    // Rank groups by average points
    summaries.sort((a, b) => b.averagePoints - a.averagePoints);
    summaries.forEach((g, idx) => {
      g.rank = idx + 1;
    });

    return summaries;
  }, [students]);

  // Computed: Top 5 & Low 3
  const topStudents = useMemo(() => {
    return [...students].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);
  }, [students]);

  const lowStudents = useMemo(() => {
    return [...students].sort((a, b) => a.totalPoints - b.totalPoints).slice(0, 3);
  }, [students]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logout,
        loginWithRole,
        students,
        criteria,
        logs,
        config,
        updateConfig,
        toasts,
        addToast,
        removeToast,
        isSyncing,
        syncWithGoogleSheets,
        pushAllToGoogleSheets,
        scoreStudent,
        revertLog,
        addStudent,
        updateStudent,
        updateStudentAvatar,
        deleteStudent,
        importStudents,
        addCriterion,
        updateCriterion,
        deleteCriterion,
        closeWeekAndArchive,
        resetAllDataToSample,
        groupsSummary,
        topStudents,
        lowStudents,
        selectedStudentModal,
        setSelectedStudentModal,
        globalSearch,
        setGlobalSearch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
