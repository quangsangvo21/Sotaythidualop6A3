import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Pencil, Loader2 } from 'lucide-react';
import { compressImageToBase64, validateImageSize } from '../utils/imageCompressor';

interface StudentAvatarProps {
  student: {
    id: string;
    name: string;
    gender?: 'nam' | 'nu';
    avatar?: string;
    group?: number;
  };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

// Generate consistent background color based on name/group
const GROUP_COLORS: Record<number, string> = {
  1: 'from-blue-500 to-indigo-600 text-white',
  2: 'from-amber-500 to-orange-600 text-white',
  3: 'from-emerald-500 to-teal-600 text-white',
  4: 'from-rose-500 to-red-600 text-white',
};

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  student,
  size = 'md',
  editable = false,
  className = '',
  onClick,
}) => {
  const { updateStudentAvatar, addToast, currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Size dimensions configuration
  const sizeClasses = {
    xs: {
      box: 'w-7 h-7 text-xs',
      editBtn: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5 p-0.5',
      editIcon: 'w-2 h-2',
      spinner: 'w-3 h-3',
    },
    sm: {
      box: 'w-9 h-9 text-sm',
      editBtn: 'w-4 h-4 -bottom-0.5 -right-0.5 p-0.5',
      editIcon: 'w-2.5 h-2.5',
      spinner: 'w-4 h-4',
    },
    md: {
      box: 'w-11 h-11 text-base',
      editBtn: 'w-5 h-5 -bottom-0.5 -right-0.5 p-1',
      editIcon: 'w-3 h-3',
      spinner: 'w-5 h-5',
    },
    lg: {
      box: 'w-14 h-14 text-xl',
      editBtn: 'w-6 h-6 bottom-0 right-0 p-1',
      editIcon: 'w-3.5 h-3.5',
      spinner: 'w-6 h-6',
    },
    xl: {
      box: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl',
      editBtn: 'w-7 h-7 sm:w-8 sm:h-8 bottom-0 right-0 p-1.5',
      editIcon: 'w-4 h-4',
      spinner: 'w-8 h-8',
    },
  }[size];

  // Extract initial letter (last word's first letter, e.g. "Nguyễn Gia Bảo" -> "B")
  const getInitial = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const lastWord = parts[parts.length - 1];
    return lastWord ? lastWord[0].toUpperCase() : name[0].toUpperCase();
  };

  const initialLetter = getInitial(student.name);
  const groupBg = student.group ? GROUP_COLORS[student.group] || GROUP_COLORS[1] : GROUP_COLORS[1];

  // Active display image (Preview > Saved Avatar)
  const displayImage = previewUrl || student.avatar;

  // Handle Pencil Click: trigger hidden input
  const handlePencilClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle File Input Change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check size limit: < 2MB
    if (!validateImageSize(file, 2 * 1024 * 1024)) {
      addToast('error', 'Dung lượng ảnh quá lớn (> 2MB)', 'Vui lòng chọn bức ảnh có kích thước dưới 2MB!');
      e.target.value = '';
      return;
    }

    // 2. Immediate blurred preview & loading spinner
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      // 3. Compress & convert to Base64 JPEG on client side
      const base64Data = await compressImageToBase64(file, 320, 320, 0.85);

      // 4. Update via context (persists locally & pushes to Google Apps Script / Drive)
      await updateStudentAvatar(student.id, base64Data, base64Data);
    } catch (err) {
      console.error('Lỗi nén và tải ảnh:', err);
      addToast('error', 'Không thể xử lý file ảnh này', 'Vui lòng thử lại với ảnh định dạng JPG hoặc PNG');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Check if current user has permission to edit avatar (GVCN or self/cán sự)
  const canEdit = editable && (currentUser.role === 'gvcn' || currentUser.role === 'lop_truong');

  return (
    <div
      onClick={onClick}
      className={`relative inline-block shrink-0 select-none ${className}`}
      title={student.name}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Circular Avatar Frame */}
      <div
        className={`${sizeClasses.box} rounded-full overflow-hidden flex items-center justify-center font-black shadow-xs border-2 border-white/90 ring-1 ring-slate-200/80 transition-transform ${
          displayImage ? 'bg-slate-100' : `bg-gradient-to-tr ${groupBg}`
        }`}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={student.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isUploading ? 'opacity-40 blur-xs' : 'opacity-100'
            }`}
            onError={(e) => {
              // Fallback to initial letter if image fails to load
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="tracking-tight leading-none drop-shadow-xs">{initialLetter}</span>
        )}

        {/* Loading Spinner Overlay during upload */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-slate-900/50 backdrop-blur-xs flex items-center justify-center text-white">
            <Loader2 className={`${sizeClasses.spinner} animate-spin text-amber-400`} />
          </div>
        )}
      </div>

      {/* Pencil Edit Icon Button (Overlay bottom-right) */}
      {canEdit && !isUploading && (
        <button
          type="button"
          onClick={handlePencilClick}
          className={`absolute ${sizeClasses.editBtn} rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md border-2 border-white flex items-center justify-center transition transform active:scale-90 hover:scale-110`}
          title={`Đổi ảnh đại diện cho ${student.name}`}
          aria-label={`Đổi ảnh đại diện cho ${student.name}`}
        >
          <Pencil className={sizeClasses.editIcon} />
        </button>
      )}
    </div>
  );
};
