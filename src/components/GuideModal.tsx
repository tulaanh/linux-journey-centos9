import React from 'react';
import { X, Book, Terminal, Shield, Zap } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-xl w-full max-w-xl flex flex-col shadow-2xl max-h-[85vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-xs">Hướng dẫn & Phím tắt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Shortcuts */}
          <div className="p-3 rounded border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>Phím tắt Terminal</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11.5px]">
              <li>
                <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">
                  Tab
                </kbd>{' '}
                : Tự động hoàn thiện lệnh hoặc đường dẫn file.
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">
                  ↑ / ↓
                </kbd>{' '}
                : Xem lại lịch sử các lệnh vừa gõ.
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">
                  Ctrl + C
                </kbd>{' '}
                : Sao chép nếu có bôi đen; ngắt lệnh Bash nếu không bôi đen.
              </li>
              <li>
                <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[10px]">
                  Ctrl + V
                </kbd>{' '}
                : Dán nội dung từ clipboard vào terminal.
              </li>
              <li>
                Gõ <code className="font-mono text-blue-600 dark:text-blue-400">vi &lt;file&gt;</code> hoặc{' '}
                <code className="font-mono text-blue-600 dark:text-blue-400">nano &lt;file&gt;</code> để mở cửa sổ soạn thảo GUI.
              </li>
            </ul>
          </div>

          {/* Quick permissions */}
          <div className="p-3 rounded border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>Phân quyền cơ bản (chmod)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">755</span>: rwxr-xr-x (Thư mục / script)
              </div>
              <div className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">644</span>: rw-r--r-- (File thường / config)
              </div>
              <div className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">700</span>: rwx------ (Thư mục riêng)
              </div>
              <div className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">600</span>: rw------- (Khóa bảo mật)
              </div>
            </div>
          </div>

          {/* Grading */}
          <div className="p-3 rounded border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quy trình làm bài</span>
            </div>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400">
              Đọc yêu cầu ở cột trái $\rightarrow$ Thực hiện lệnh trên Terminal $\rightarrow$ Nhấn nút <strong>Chấm điểm</strong> để kiểm tra kết quả ngay lập tức.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 border-t border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
