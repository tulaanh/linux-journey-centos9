import React, { useState } from 'react';
import { VirtualFileSystem } from '../services/vfs';
import type { VFSNode } from '../types/linux';
import {
  X,
  Folder,
  File,
  ArrowUp,
  FileEdit,
  RefreshCw
} from 'lucide-react';

interface FileBrowserModalProps {
  isOpen: boolean;
  vfs: VirtualFileSystem;
  onClose: () => void;
  onEditFile: (path: string, content: string) => void;
}

export const FileBrowserModal: React.FC<FileBrowserModalProps> = ({
  isOpen,
  vfs,
  onClose,
  onEditFile,
}) => {
  const [currentPath, setCurrentPath] = useState('/root');
  const [, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const items = vfs.readdir(currentPath) || [];
  items.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });

  const goUp = () => {
    if (currentPath === '/' || currentPath === '') return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
    setCurrentPath(parent);
  };

  const navigateTo = (item: VFSNode) => {
    if (item.type === 'dir') {
      const next = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      setCurrentPath(next);
    } else if (item.type === 'file') {
      const filePath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      const content = vfs.readFile(filePath) ?? '';
      onEditFile(filePath, content);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] rounded-xl w-full max-w-3xl flex flex-col shadow-2xl max-h-[85vh] overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117]">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-xs">Duyệt tệp tin ảo</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Path bar & shortcuts */}
        <div className="p-2.5 border-b border-slate-200 dark:border-[#30363d] bg-slate-100/60 dark:bg-[#12161f] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
            <button
              onClick={goUp}
              disabled={currentPath === '/'}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 disabled:opacity-30 text-slate-600 dark:text-slate-300 transition"
              title="Lên thư mục cha"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <div className="px-2.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-blue-600 dark:text-blue-400 flex-1 truncate">
              {currentPath}
            </div>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Làm mới"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono">
            {['/', '/etc', '/var/log', '/root', '/home/centos'].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPath(p)}
                className={`px-1.5 py-0.5 rounded border ${
                  currentPath === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* File Table */}
        <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-[#0a0e17]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10.5px] uppercase border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-1.5 px-2.5">Tên</th>
                <th className="py-1.5 px-2.5">Quyền</th>
                <th className="py-1.5 px-2.5">Sở hữu</th>
                <th className="py-1.5 px-2.5">Size</th>
                <th className="py-1.5 px-2.5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Thư mục trống
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const permStr = VirtualFileSystem.modeToString(it.mode, it.type);
                  const isDir = it.type === 'dir';
                  return (
                    <tr
                      key={it.name}
                      onClick={() => navigateTo(it)}
                      className="hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="py-1.5 px-2.5 flex items-center gap-1.5">
                        {isDir ? (
                          <Folder className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        ) : (
                          <File className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className={`truncate ${isDir ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}>
                          {it.name}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-500 text-[11px]">{permStr}</td>
                      <td className="py-1.5 px-2.5 text-slate-500 text-[11px]">
                        {it.owner}:{it.group}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-500 text-[11px]">
                        {isDir ? '4K' : `${it.size}B`}
                      </td>
                      <td className="py-1.5 px-2.5 text-right">
                        {!isDir && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateTo(it);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                            title="Chỉnh sửa"
                          >
                            <FileEdit className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
