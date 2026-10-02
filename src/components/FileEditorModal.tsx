import React, { useState, useEffect } from 'react';
import { X, Save, FileCode } from 'lucide-react';

interface FileEditorModalProps {
  isOpen: boolean;
  filePath: string;
  initialContent: string;
  onSave: (filePath: string, content: string) => void;
  onClose: () => void;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({
  isOpen,
  filePath,
  initialContent,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent);
  const [path, setPath] = useState(filePath);

  useEffect(() => {
    setContent(initialContent);
    setPath(filePath);
  }, [initialContent, filePath]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(path, content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[85vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-xs">Soạn thảo tệp tin</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Path Input */}
        <div className="px-3.5 py-2 border-b border-slate-200 dark:border-[#30363d] bg-slate-100/60 dark:bg-[#12161f] flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Đường dẫn:</span>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="flex-1 bg-white dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-blue-500"
            placeholder="/etc/example.conf"
          />
        </div>

        {/* Text Area */}
        <div className="flex-1 p-3 bg-white dark:bg-[#0a0e17]">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-72 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-3 text-xs font-mono resize-none focus:outline-none focus:border-blue-500 leading-relaxed text-slate-800 dark:text-slate-200"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
          <span className="text-[11px] text-slate-500 font-mono">
            {content.split('\n').length} dòng
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded border border-slate-300 dark:border-[#30363d] hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
