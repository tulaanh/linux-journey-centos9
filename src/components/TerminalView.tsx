import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { CentOSKernel } from '../services/centosKernel';
import {
  RotateCcw,
  Terminal as TerminalIcon,
  Copy,
  Clipboard,
  Check
} from 'lucide-react';

interface TerminalViewProps {
  kernel: CentOSKernel;
  theme: 'dark' | 'light';
  onKernelUpdate?: () => void;
  onOpenEditor?: (filePath: string, content: string) => void;
  pendingCommand?: { id: number; command: string } | null;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  hasSelection: boolean;
}

const darkTerminalTheme = {
  background: '#0a0e17',
  foreground: '#e6edf3',
  cursor: '#58a6ff',
  cursorAccent: '#0a0e17',
  selectionBackground: '#264f78',
  black: '#161b22',
  red: '#ff7b72',
  green: '#3fb950',
  yellow: '#d29922',
  blue: '#58a6ff',
  magenta: '#bc8cff',
  cyan: '#39c5cf',
  white: '#d0d7de',
  brightBlack: '#6e7681',
  brightRed: '#ffa198',
  brightGreen: '#56d364',
  brightYellow: '#e3b341',
  brightBlue: '#79c0ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#56d4dd',
  brightWhite: '#ffffff',
};

const lightTerminalTheme = {
  background: '#ffffff',
  foreground: '#24292f',
  cursor: '#0969da',
  cursorAccent: '#ffffff',
  selectionBackground: '#b6e3ff',
  black: '#24292f',
  red: '#cf222e',
  green: '#1a7f37',
  yellow: '#9a6700',
  blue: '#0969da',
  magenta: '#8250df',
  cyan: '#1b7c83',
  white: '#6e7781',
  brightBlack: '#57606a',
  brightRed: '#a40e26',
  brightGreen: '#116329',
  brightYellow: '#633c01',
  brightBlue: '#0550ae',
  brightMagenta: '#6639ba',
  brightCyan: '#114b53',
  brightWhite: '#24292f',
};

export const TerminalView: React.FC<TerminalViewProps> = ({
  kernel,
  theme,
  onKernelUpdate,
  onOpenEditor,
  pendingCommand,
}) => {
  const isDark = theme === 'dark';
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const lastExecutedIdRef = useRef<number>(0);

  // Command line editing state
  const inputBuffer = useRef<string>('');
  const cursorPosition = useRef<number>(0);
  const historyIndex = useRef<number>(-1);

  // Copy feedback state
  const [copied, setCopied] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    hasSelection: false,
  });

  // Helper to print prompt
  const showPrompt = useCallback(() => {
    if (!xtermInstance.current) return;
    const prompt = kernel.getPrompt();
    const colorPrompt = `\x1b[1;32m${prompt}\x1b[0m`;
    xtermInstance.current.write(colorPrompt);
  }, [kernel]);

  const redrawLine = useCallback((term: Terminal) => {
    const prompt = kernel.getPrompt();
    term.write(`\r\x1b[K\x1b[1;32m${prompt}\x1b[0m${inputBuffer.current}`);
    const backSteps = inputBuffer.current.length - cursorPosition.current;
    if (backSteps > 0) {
      term.write(`\x1b[${backSteps}D`);
    }
  }, [kernel]);

  // Insert text directly into the input buffer (handles copy-paste)
  const insertText = useCallback((textToInsert: string) => {
    if (!textToInsert || !xtermInstance.current) return;
    const term = xtermInstance.current;

    const lines = textToInsert.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

    if (lines.length === 1) {
      const clean = lines[0];
      const buf = inputBuffer.current;
      const pos = cursorPosition.current;
      inputBuffer.current = buf.slice(0, pos) + clean + buf.slice(pos);
      cursorPosition.current += clean.length;
      redrawLine(term);
    } else {
      (async () => {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (i < lines.length - 1) {
            const fullCmd = inputBuffer.current + line;
            term.write(line + '\r\n');
            inputBuffer.current = '';
            cursorPosition.current = 0;
            if (fullCmd.trim()) {
              const res = await kernel.execute(fullCmd);
              if (res.stdout) term.writeln(res.stdout);
              if (res.stderr) term.writeln(`\x1b[31m${res.stderr}\x1b[0m`);
              if (onKernelUpdate) onKernelUpdate();
            }
            showPrompt();
          } else {
            inputBuffer.current = line;
            cursorPosition.current = line.length;
            redrawLine(term);
          }
        }
      })();
    }
  }, [kernel, onKernelUpdate, redrawLine, showPrompt]);

  // Copy selection or current line
  const handleCopy = useCallback(async () => {
    if (!xtermInstance.current) return;
    const term = xtermInstance.current;
    let textToCopy = '';

    if (term.hasSelection()) {
      textToCopy = term.getSelection();
    } else if (inputBuffer.current) {
      textToCopy = inputBuffer.current;
    }

    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (e) {
        console.error('Failed to copy', e);
      }
    }
  }, []);

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        insertText(text);
      }
    } catch {
      const manual = prompt('Dán lệnh vào terminal:');
      if (manual) {
        insertText(manual);
      }
    }
  }, [insertText]);

  // Dynamically update terminal theme on change
  useEffect(() => {
    if (xtermInstance.current) {
      xtermInstance.current.options.theme = isDark ? darkTerminalTheme : lightTerminalTheme;
    }
  }, [isDark]);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.25,
      theme: isDark ? darkTerminalTheme : lightTerminalTheme,
      convertEol: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    kernel.onOpenEditor = (filePath, content) => {
      if (onOpenEditor) onOpenEditor(filePath, content);
    };

    term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        if (term.hasSelection()) {
          const selectedText = term.getSelection();
          navigator.clipboard.writeText(selectedText);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
          return false;
        }
        return true;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        navigator.clipboard
          .readText()
          .then((text) => {
            if (text) insertText(text);
          })
          .catch(() => {});
        return false;
      }

      if (event.shiftKey && event.key === 'Insert') {
        navigator.clipboard
          .readText()
          .then((text) => {
            if (text) insertText(text);
          })
          .catch(() => {});
        return false;
      }

      return true;
    });

    const domElem = terminalRef.current;
    const handleDomPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        insertText(text);
      }
    };
    domElem.addEventListener('paste', handleDomPaste);

    // Welcome banner
    term.writeln('\x1b[1;31m  ____           _    ___  ____    ___  \x1b[0m');
    term.writeln('\x1b[1;31m / ___|___ _ __ | |_ / _ \\/ ___|  / _ \\ \x1b[0m');
    term.writeln('\x1b[1;31m| |   / _ \\ \'_ \\| __| | | \\___ \\ | (_) |\x1b[0m');
    term.writeln('\x1b[1;31m| |__|  __/ | | | |_| |_| |___) | \\__, |\x1b[0m');
    term.writeln('\x1b[1;31m \\____\\___|_| |_|\\__|\\___/|____/    /_/ \x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1mCentOS Stream 9 (x86_64) • Linux 5.14.0\x1b[0m');
    term.writeln('\x1b[90mLast login: ' + new Date().toLocaleTimeString() + ' on pts/0\x1b[0m\r\n');

    showPrompt();

    const disposable = term.onData(async (data) => {
      if (data === '\r') {
        const cmd = inputBuffer.current;
        term.write('\r\n');

        if (cmd.trim()) {
          const res = await kernel.execute(cmd);
          if (res.stdout) {
            term.writeln(res.stdout);
          }
          if (res.stderr) {
            term.writeln(`\x1b[31m${res.stderr}\x1b[0m`);
          }
          if (onKernelUpdate) onKernelUpdate();
        }

        inputBuffer.current = '';
        cursorPosition.current = 0;
        historyIndex.current = -1;
        showPrompt();
        return;
      }

      if (data === '\x7F' || data === '\b') {
        if (cursorPosition.current > 0) {
          const buf = inputBuffer.current;
          const pos = cursorPosition.current;
          inputBuffer.current = buf.slice(0, pos - 1) + buf.slice(pos);
          cursorPosition.current--;
          redrawLine(term);
        }
        return;
      }

      if (data === '\t') {
        handleTabCompletion(term);
        return;
      }

      if (data === '\x03') {
        term.writeln('^C');
        inputBuffer.current = '';
        cursorPosition.current = 0;
        showPrompt();
        return;
      }

      if (data === '\x0C') {
        term.clear();
        showPrompt();
        if (inputBuffer.current) {
          term.write(inputBuffer.current);
        }
        return;
      }

      if (data.startsWith('\x1b[')) {
        const seq = data.slice(2);
        if (seq === 'A') {
          if (kernel.history.length === 0) return;
          if (historyIndex.current === -1) {
            historyIndex.current = kernel.history.length - 1;
          } else if (historyIndex.current > 0) {
            historyIndex.current--;
          }
          inputBuffer.current = kernel.history[historyIndex.current] || '';
          cursorPosition.current = inputBuffer.current.length;
          redrawLine(term);
          return;
        }
        if (seq === 'B') {
          if (historyIndex.current !== -1) {
            if (historyIndex.current < kernel.history.length - 1) {
              historyIndex.current++;
              inputBuffer.current = kernel.history[historyIndex.current] || '';
            } else {
              historyIndex.current = -1;
              inputBuffer.current = '';
            }
            cursorPosition.current = inputBuffer.current.length;
            redrawLine(term);
          }
          return;
        }
        if (seq === 'C') {
          if (cursorPosition.current < inputBuffer.current.length) {
            cursorPosition.current++;
            term.write('\x1b[C');
          }
          return;
        }
        if (seq === 'D') {
          if (cursorPosition.current > 0) {
            cursorPosition.current--;
            term.write('\x1b[D');
          }
          return;
        }
        return;
      }

      if (data >= ' ' || data === '\t') {
        const buf = inputBuffer.current;
        const pos = cursorPosition.current;
        inputBuffer.current = buf.slice(0, pos) + data + buf.slice(pos);
        cursorPosition.current += data.length;
        redrawLine(term);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {
        // ignore
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      domElem.removeEventListener('paste', handleDomPaste);
      disposable.dispose();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  const handleTabCompletion = (term: Terminal) => {
    const buf = inputBuffer.current;
    const words = buf.split(' ');
    const lastWord = words[words.length - 1] || '';

    if (words.length === 1 && !lastWord.includes('/')) {
      const commonCommands = [
        'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat', 'head', 'tail',
        'wc', 'grep', 'find', 'echo', 'chmod', 'chown', 'chgrp', 'useradd', 'userdel',
        'groupadd', 'groupdel', 'usermod', 'passwd', 'id', 'whoami', 'su', 'sudo',
        'systemctl', 'service', 'ps', 'top', 'kill', 'pkill', 'crontab', 'dnf', 'yum',
        'rpm', 'hostnamectl', 'hostname', 'ip', 'ifconfig', 'ping', 'curl', 'wget',
        'nmcli', 'journalctl', 'firewall-cmd', 'sestatus', 'getenforce', 'setenforce',
        'tree', 'lscpu', 'lsblk', 'tar', 'gzip', 'gunzip', 'export', 'env',
        'netstat', 'ss', 'df', 'free', 'uname', 'uptime', 'date', 'clear', 'history',
        'which', 'whereis', 'whatis', 'alias', 'unalias', 'vi', 'nano', 'help'
      ];
      const matches = commonCommands.filter((c) => c.startsWith(lastWord));
      if (matches.length === 1) {
        const completion = matches[0].slice(lastWord.length) + ' ';
        inputBuffer.current += completion;
        cursorPosition.current = inputBuffer.current.length;
        redrawLine(term);
      } else if (matches.length > 1) {
        term.writeln('');
        term.writeln(matches.join('  '));
        showPrompt();
        term.write(inputBuffer.current);
      }
      return;
    }

    let searchDir = kernel.cwd;
    let prefix = lastWord;

    if (lastWord.includes('/')) {
      const lastSlash = lastWord.lastIndexOf('/');
      const dirPart = lastWord.slice(0, lastSlash) || '/';
      prefix = lastWord.slice(lastSlash + 1);
      searchDir = kernel.vfs.resolvePath(kernel.cwd, dirPart);
    }

    const items = kernel.vfs.readdir(searchDir) || [];
    const matches = items.filter((it) => it.name.startsWith(prefix));

    if (matches.length === 1) {
      const isDir = matches[0].type === 'dir';
      const completion = matches[0].name.slice(prefix.length) + (isDir ? '/' : ' ');
      inputBuffer.current += completion;
      cursorPosition.current = inputBuffer.current.length;
      redrawLine(term);
    } else if (matches.length > 1) {
      term.writeln('');
      term.writeln(matches.map((m) => m.name + (m.type === 'dir' ? '/' : '')).join('  '));
      showPrompt();
      term.write(inputBuffer.current);
    }
  };

  const runQuickCommand = useCallback(async (cmd: string) => {
    if (!xtermInstance.current) return;
    const term = xtermInstance.current;
    const lines = cmd.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const singleCmd of lines) {
      term.write(singleCmd + '\r\n');
      const res = await kernel.execute(singleCmd);
      if (res.stdout) term.writeln(res.stdout);
      if (res.stderr) term.writeln(`\x1b[31m${res.stderr}\x1b[0m`);
      inputBuffer.current = '';
      cursorPosition.current = 0;
      showPrompt();
    }
    if (onKernelUpdate) onKernelUpdate();
  }, [kernel, onKernelUpdate, showPrompt]);

  useEffect(() => {
    if (pendingCommand && pendingCommand.id !== lastExecutedIdRef.current && xtermInstance.current) {
      lastExecutedIdRef.current = pendingCommand.id;
      runQuickCommand(pendingCommand.command);
    }
  }, [pendingCommand, runQuickCommand]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const term = xtermInstance.current;
    const hasSel = term ? term.hasSelection() : false;
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      hasSelection: hasSel,
    });
  };

  const closeContextMenu = () => {
    if (contextMenu.visible) {
      setContextMenu((prev) => ({ ...prev, visible: false }));
    }
  };

  return (
    <div
      className={`flex flex-col h-full relative transition-colors ${
        isDark ? 'bg-[#0a0e17]' : 'bg-white'
      }`}
      onClick={closeContextMenu}
    >
      {/* Sleek Terminal Header */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-xs ${
          isDark
            ? 'bg-[#12161f] border-[#30363d] text-slate-300'
            : 'bg-[#f6f8fa] border-[#d0d7de] text-slate-700'
        }`}
      >
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
          <TerminalIcon className="w-3.5 h-3.5 text-blue-500" />
          <span>
            {kernel.currentUser}@{kernel.hostname.split('.')[0]}:{kernel.cwd}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition border ${
              copied
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                : isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-300 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d0d7de]'
            }`}
            title="Sao chép (Ctrl+C)"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 opacity-70" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Quick Paste Button */}
          <button
            onClick={handlePaste}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition ${
              isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-300 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d0d7de]'
            }`}
            title="Dán từ Clipboard (Ctrl+V)"
          >
            <Clipboard className="w-3 h-3 text-blue-500" />
            <span>Paste</span>
          </button>

          <span
            className={`w-px h-3 mx-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
          />

          <button
            onClick={() => runQuickCommand('clear')}
            className={`p-1 rounded transition ${
              isDark
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
            title="Xóa màn hình (Ctrl+L)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* xterm canvas container with right-click context menu */}
      <div
        className="flex-1 w-full p-2 overflow-hidden"
        ref={terminalRef}
        onContextMenu={handleContextMenu}
      />

      {/* Custom Right-Click Context Menu */}
      {contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className={`fixed z-50 border rounded shadow-lg py-1 w-32 text-xs font-sans ${
            isDark
              ? 'bg-[#161b22] border-[#30363d] text-slate-200'
              : 'bg-white border-[#d0d7de] text-slate-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleCopy();
              closeContextMenu();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition text-left ${
              isDark ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Sao chép</span>
          </button>

          <button
            onClick={() => {
              handlePaste();
              closeContextMenu();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition text-left ${
              isDark ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>Dán</span>
          </button>

          <div className={`h-px my-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <button
            onClick={() => {
              runQuickCommand('clear');
              closeContextMenu();
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 transition text-left ${
              isDark
                ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa terminal</span>
          </button>
        </div>
      )}
    </div>
  );
};
