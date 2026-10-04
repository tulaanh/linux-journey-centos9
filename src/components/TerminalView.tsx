import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Terminal, type ITheme } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { CentOSKernel } from '../services/centosKernel';
import {
  RotateCcw,
  Terminal as TerminalIcon,
  Copy,
  Clipboard,
  Check,
  Search,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Download,
  Palette,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';

interface TerminalViewProps {
  kernel: CentOSKernel;
  theme: 'dark' | 'light';
  onKernelUpdate?: () => void;
  pendingCommand?: { id: number; command: string } | null;
  className?: string;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  hasSelection: boolean;
}

export interface TerminalThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  accent: string;
  theme: ITheme;
}

// Curated Professional Developer Terminal Themes
export const TERMINAL_THEMES: TerminalThemeConfig[] = [
  {
    id: 'centos',
    name: 'CentOS Stream',
    isDark: true,
    accent: '#58a6ff',
    theme: {
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
    },
  },
  {
    id: 'dracula',
    name: 'Dracula Pro',
    isDark: true,
    accent: '#bd93f9',
    theme: {
      background: '#282a36',
      foreground: '#f8f8f2',
      cursor: '#f8f8f0',
      cursorAccent: '#282a36',
      selectionBackground: '#44475a',
      black: '#21222c',
      red: '#ff5555',
      green: '#50fa7b',
      yellow: '#f1fa8c',
      blue: '#bd93f9',
      magenta: '#ff79c6',
      cyan: '#8be9fd',
      white: '#f8f8f2',
      brightBlack: '#6272a4',
      brightRed: '#ff6e6e',
      brightGreen: '#69ff94',
      brightYellow: '#ffffa5',
      brightBlue: '#d6acff',
      brightMagenta: '#ff92df',
      brightCyan: '#a4ffff',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai Pro',
    isDark: true,
    accent: '#ffd866',
    theme: {
      background: '#2d2a2e',
      foreground: '#fcfcfa',
      cursor: '#ffd866',
      cursorAccent: '#2d2a2e',
      selectionBackground: '#403e41',
      black: '#403e41',
      red: '#ff6188',
      green: '#a9dc76',
      yellow: '#ffd866',
      blue: '#fc9867',
      magenta: '#ab9df2',
      cyan: '#78dce8',
      white: '#fcfcfa',
      brightBlack: '#727072',
      brightRed: '#ff6188',
      brightGreen: '#a9dc76',
      brightYellow: '#ffd866',
      brightBlue: '#fc9867',
      brightMagenta: '#ab9df2',
      brightCyan: '#78dce8',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'tokyonight',
    name: 'Tokyo Night',
    isDark: true,
    accent: '#7aa2f7',
    theme: {
      background: '#1a1b26',
      foreground: '#a9b1d6',
      cursor: '#c0caf5',
      cursorAccent: '#1a1b26',
      selectionBackground: '#33467c',
      black: '#32344a',
      red: '#f7768e',
      green: '#9ece6a',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      magenta: '#bb9af7',
      cyan: '#7dcfff',
      white: '#a9b1d6',
      brightBlack: '#444b6a',
      brightRed: '#ff7a93',
      brightGreen: '#b9f27c',
      brightYellow: '#ff9e64',
      brightBlue: '#7da6ff',
      brightMagenta: '#bb9af7',
      brightCyan: '#0db9d7',
      brightWhite: '#acb0d0',
    },
  },
  {
    id: 'onedark',
    name: 'One Dark Pro',
    isDark: true,
    accent: '#61afef',
    theme: {
      background: '#1e222a',
      foreground: '#abb2bf',
      cursor: '#528bff',
      cursorAccent: '#1e222a',
      selectionBackground: '#3e4451',
      black: '#282c34',
      red: '#e06c75',
      green: '#98c379',
      yellow: '#e5c07b',
      blue: '#61afef',
      magenta: '#c678dd',
      cyan: '#56b6c2',
      white: '#abb2bf',
      brightBlack: '#5c6370',
      brightRed: '#e06c75',
      brightGreen: '#98c379',
      brightYellow: '#e5c07b',
      brightBlue: '#61afef',
      brightMagenta: '#c678dd',
      brightCyan: '#56b6c2',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'matrix',
    name: 'Hacker Matrix',
    isDark: true,
    accent: '#00ff66',
    theme: {
      background: '#0d1117',
      foreground: '#00ff66',
      cursor: '#00ff66',
      cursorAccent: '#0d1117',
      selectionBackground: '#003b1f',
      black: '#161b22',
      red: '#ff5555',
      green: '#00ff66',
      yellow: '#50fa7b',
      blue: '#39ff14',
      magenta: '#00e676',
      cyan: '#00ffcc',
      white: '#e6edf3',
      brightBlack: '#2ea043',
      brightRed: '#ff7b72',
      brightGreen: '#39ff14',
      brightYellow: '#66ff66',
      brightBlue: '#39ff14',
      brightMagenta: '#00e676',
      brightCyan: '#56d4dd',
      brightWhite: '#ffffff',
    },
  },
  {
    id: 'githubLight',
    name: 'GitHub Light',
    isDark: false,
    accent: '#0969da',
    theme: {
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
    },
  },
];

export const TerminalView: React.FC<TerminalViewProps> = ({
  kernel,
  theme,
  onKernelUpdate,
  pendingCommand,
  className = '',
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const lastExecutedIdRef = useRef<number>(0);

  // Command line editing state
  const inputBuffer = useRef<string>('');
  const cursorPosition = useRef<number>(0);
  const historyIndex = useRef<number>(-1);
  const isExecutingRef = useRef<boolean>(false);
  const editorSession = useRef<{
    path: string;
    content: string;
    cursor: number;
    mode: 'NORMAL' | 'INSERT' | 'COMMAND';
    command: string;
    message?: string;
    pendingKey?: string;
    scrollRow?: number;
  } | null>(null);

  // UI Interactive States
  const [selectedThemeId, setSelectedThemeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('xterm_theme_id');
      if (saved && TERMINAL_THEMES.some((t) => t.id === saved)) return saved;
    } catch {
      // ignore
    }
    return theme === 'light' ? 'githubLight' : 'centos';
  });

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('xterm_font_size');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 11 && parsed <= 22) return parsed;
      }
    } catch {
      // ignore
    }
    return 14;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchOptions, setSearchOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
  });
  const [searchMatchesCount, setSearchMatchesCount] = useState<number | null>(null);

  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<{ cols: number; rows: number }>({ cols: 80, rows: 24 });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    hasSelection: false,
  });

  // Current active theme configuration
  const currentThemeConfig = useMemo(() => {
    return TERMINAL_THEMES.find((t) => t.id === selectedThemeId) || TERMINAL_THEMES[0];
  }, [selectedThemeId]);

  // Toast feedback helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2000);
  }, []);

  // Update prompt on terminal
  const showPrompt = useCallback(() => {
    if (!xtermInstance.current) return;
    const prompt = kernel.getPrompt();
    const colorPrompt = `\x1b[1;32m${prompt}\x1b[0m`;
    xtermInstance.current.write(colorPrompt);
  }, [kernel]);

  // Redraw command line with exact cursor positioning
  const redrawLine = useCallback(
    (term: Terminal) => {
      const prompt = kernel.getPrompt();
      term.write(`\r\x1b[K\x1b[1;32m${prompt}\x1b[0m${inputBuffer.current}`);
      const backSteps = inputBuffer.current.length - cursorPosition.current;
      if (backSteps > 0) {
        term.write(`\x1b[${backSteps}D`);
      }
    },
    [kernel]
  );

  // Welcome banner print helper
  const printWelcomeBanner = useCallback((term: Terminal) => {
    term.writeln('\x1b[1;31m  ____           _    ___  ____    ___  \x1b[0m');
    term.writeln('\x1b[1;31m / ___|___ _ __ | |_ / _ \\/ ___|  / _ \\ \x1b[0m');
    term.writeln('\x1b[1;31m| |   / _ \\ \' _ \\| __| | | \\___ \\ | (_) |\x1b[0m');
    term.writeln('\x1b[1;31m| |__|  __/ | | | |_| |_| |___) | \\__, |\x1b[0m');
    term.writeln('\x1b[1;31m \\____\\___|_| |_|\\__|\\___/|____/    /_/ \x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1mCentOS Stream 9 (x86_64) • Linux 5.14.0-el9\x1b[0m');
    term.writeln('\x1b[90mLast login: ' + new Date().toLocaleTimeString() + ' on pts/0\x1b[0m');
    term.writeln('\x1b[36mNhập lệnh Linux hoặc nhấn phím Tab để tự động gợi ý. Gõ \'help\' để xem trợ giúp.\x1b[0m\r\n');
  }, []);

  // Insert text directly into the input buffer (handles copy-paste & quick keys)
  const insertText = useCallback(
    (textToInsert: string) => {
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
          isExecutingRef.current = true;
          setIsExecuting(true);
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
          isExecutingRef.current = false;
          setIsExecuting(false);
        })();
      }
    },
    [kernel, onKernelUpdate, redrawLine, showPrompt]
  );

  // Tab completion helper with column preview
  const handleTabCompletion = useCallback(
    (term: Terminal) => {
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
          term.writeln(`\x1b[36m${matches.join('   ')}\x1b[0m`);
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
        term.writeln(
          matches
            .map((m) => (m.type === 'dir' ? `\x1b[1;34m${m.name}/\x1b[0m` : m.name))
            .join('   ')
        );
        showPrompt();
        term.write(inputBuffer.current);
      }
    },
    [kernel, redrawLine, showPrompt]
  );

  // Copy selection or current input buffer
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
        showToast('Đã sao chép vào bộ nhớ đệm');
      } catch (e) {
        console.error('Failed to copy', e);
      }
    }
  }, [showToast]);

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        insertText(text);
        showToast('Đã dán nội dung');
      }
    } catch {
      const manual = prompt('Dán lệnh vào terminal:');
      if (manual) {
        insertText(manual);
      }
    }
  }, [insertText, showToast]);

  // Select all text in terminal
  const handleSelectAll = useCallback(() => {
    if (!xtermInstance.current) return;
    xtermInstance.current.selectAll();
    showToast('Đã chọn toàn bộ nội dung');
  }, [showToast]);

  // Export full terminal session log as text file
  const handleExportLog = useCallback(() => {
    if (!xtermInstance.current) return;
    const term = xtermInstance.current;
    const buffer = term.buffer.active;
    const lines: string[] = [];
    for (let i = 0; i < buffer.length; i++) {
      const line = buffer.getLine(i);
      if (line) {
        lines.push(line.translateToString(true));
      }
    }
    const fullLog = lines.join('\n').trim();
    if (!fullLog) {
      showToast('Chưa có dữ liệu nhật ký');
      return;
    }

    const blob = new Blob([fullLog], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centos9-terminal-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống file nhật ký');
  }, [showToast]);

  // Restart / Reset terminal session
  const handleResetSession = useCallback(() => {
    if (!xtermInstance.current) return;
    const term = xtermInstance.current;
    term.reset();
    inputBuffer.current = '';
    cursorPosition.current = 0;
    historyIndex.current = -1;
    editorSession.current = null;
    printWelcomeBanner(term);
    showPrompt();
    showToast('Đã khởi động lại phiên terminal');
  }, [printWelcomeBanner, showPrompt, showToast]);

  // Execute quick command string
  const runQuickCommand = useCallback(
    async (cmd: string) => {
      if (!xtermInstance.current) return;
      const term = xtermInstance.current;
      const lines = cmd.split('\n').map((l) => l.trim()).filter(Boolean);

      isExecutingRef.current = true;
      setIsExecuting(true);

      for (const singleCmd of lines) {
        term.write(singleCmd + '\r\n');
        const res = await kernel.execute(singleCmd);
        if (res.stdout) term.writeln(res.stdout);
        if (res.stderr) term.writeln(`\x1b[31m${res.stderr}\x1b[0m`);
        inputBuffer.current = '';
        cursorPosition.current = 0;
        historyIndex.current = -1;
        showPrompt();
      }

      isExecutingRef.current = false;
      setIsExecuting(false);
      if (onKernelUpdate) onKernelUpdate();
    },
    [kernel, onKernelUpdate, showPrompt]
  );

  // Search Addon Controls
  const handleSearchNext = useCallback(() => {
    if (!searchAddonRef.current || !searchQuery) return;
    searchAddonRef.current.findNext(searchQuery, {
      regex: searchOptions.regex,
      caseSensitive: searchOptions.caseSensitive,
      wholeWord: searchOptions.wholeWord,
      incremental: false,
    });
  }, [searchQuery, searchOptions]);

  const handleSearchPrevious = useCallback(() => {
    if (!searchAddonRef.current || !searchQuery) return;
    searchAddonRef.current.findPrevious(searchQuery, {
      regex: searchOptions.regex,
      caseSensitive: searchOptions.caseSensitive,
      wholeWord: searchOptions.wholeWord,
    });
  }, [searchQuery, searchOptions]);

  // Change font size
  const handleZoom = useCallback(
    (delta: number) => {
      setFontSize((prev) => {
        const next = Math.max(11, Math.min(22, prev + delta));
        try {
          localStorage.setItem('xterm_font_size', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  // Apply theme selection
  const handleSelectTheme = useCallback((themeId: string) => {
    setSelectedThemeId(themeId);
    setShowThemePicker(false);
    try {
      localStorage.setItem('xterm_theme_id', themeId);
    } catch {
      // ignore
    }
  }, []);

  // Update theme when selectedThemeId changes
  useEffect(() => {
    if (xtermInstance.current) {
      xtermInstance.current.options.theme = currentThemeConfig.theme;
    }
  }, [currentThemeConfig]);

  // Update font size in xterm
  useEffect(() => {
    if (xtermInstance.current && fitAddonRef.current) {
      xtermInstance.current.options.fontSize = fontSize;
      try {
        fitAddonRef.current.fit();
        setDimensions({
          cols: xtermInstance.current.cols,
          rows: xtermInstance.current.rows,
        });
      } catch {
        // ignore
      }
    }
  }, [fontSize]);

  // Re-fit when fullscreen changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fitAddonRef.current && xtermInstance.current) {
        try {
          fitAddonRef.current.fit();
          setDimensions({
            cols: xtermInstance.current.cols,
            rows: xtermInstance.current.rows,
          });
        } catch {
          // ignore
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Initialize xterm
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", monospace',
      fontSize: fontSize,
      lineHeight: 1.25,
      theme: currentThemeConfig.theme,
      convertEol: true,
      scrollback: 10000,
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(searchAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;

    setDimensions({ cols: term.cols, rows: term.rows });

    searchAddon.onDidChangeResults?.((e: { resultIndex: number; resultCount: number }) => {
      setSearchMatchesCount(e ? e.resultCount : null);
    });

    // In-terminal Vi / Vim Editor (Authentic CentOS 9 UI & Layout)
    const drawEditor = () => {
      const session = editorSession.current;
      if (!session) return;
      const lines = session.content.split('\n');
      const viewport = Math.max(1, term.rows - 1);
      const beforeCursor = session.content.slice(0, session.cursor);
      const cursorLine = beforeCursor.split('\n').length - 1;
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const cursorCol = session.cursor - lineStart;

      // Keep scrolling smooth
      if (session.scrollRow === undefined) session.scrollRow = 0;
      if (cursorLine < session.scrollRow) {
        session.scrollRow = cursorLine;
      } else if (cursorLine >= session.scrollRow + viewport) {
        session.scrollRow = cursorLine - viewport + 1;
      }
      const startLine = Math.max(0, Math.min(session.scrollRow, Math.max(0, lines.length - viewport)));
      session.scrollRow = startLine;

      // Atomic single buffer write
      let buf = '\x1b[?25l'; // Hide cursor while rendering

      // Draw lines in viewport
      for (let row = 0; row < viewport; row++) {
        const fileLineIdx = startLine + row;
        buf += `\x1b[${row + 1};1H\x1b[K`;
        if (fileLineIdx < lines.length) {
          const lineText = lines[fileLineIdx];
          buf += lineText.slice(0, term.cols);
        } else {
          // Lines beyond end of file show classic blue tilde
          buf += '\x1b[1;34m~\x1b[0m';
        }
      }

      // Draw bottom status line (Authentic CentOS Vim format)
      const statusRow = term.rows;
      buf += `\x1b[${statusRow};1H\x1b[K`;

      if (session.mode === 'COMMAND') {
        buf += `:${session.command}`;
      } else {
        // Percentage indicator on right
        let positionPercent = '';
        if (lines.length <= viewport) {
          positionPercent = 'All';
        } else if (startLine === 0) {
          positionPercent = 'Top';
        } else if (startLine + viewport >= lines.length) {
          positionPercent = 'Bot';
        } else {
          const pct = Math.round(((cursorLine + 1) / lines.length) * 100);
          positionPercent = `${pct}%`;
        }

        const ruler = `${cursorLine + 1},${cursorCol + 1}`;
        const rightPart = `${ruler.padStart(7)}          ${positionPercent} `;

        if (session.mode === 'INSERT') {
          const modeLabel = '\x1b[1m-- INSERT --\x1b[0m';
          const rawLabelLen = 12;
          const spaces = Math.max(1, term.cols - rawLabelLen - rightPart.length);
          buf += `${modeLabel}${' '.repeat(spaces)}${rightPart}`;
        } else {
          // NORMAL mode: display message or empty
          const msg = session.message || '';
          const spaces = Math.max(1, term.cols - msg.length - rightPart.length);
          buf += `${msg}${' '.repeat(spaces)}${rightPart}`;
        }
      }

      // Position cursor
      if (session.mode === 'COMMAND') {
        const commandCol = Math.min(term.cols, session.command.length + 2);
        buf += `\x1b[${statusRow};${commandCol}H`;
      } else {
        const rowInView = Math.max(1, Math.min(viewport, cursorLine - startLine + 1));
        const colInView = Math.max(1, Math.min(term.cols, cursorCol + 1));
        buf += `\x1b[${rowInView};${colInView}H`;
      }

      buf += '\x1b[?25h'; // Show cursor
      term.write(buf);
    };

    kernel.onOpenEditor = (filePath, content) => {
      const lineCount = content.split('\n').length;
      editorSession.current = {
        path: filePath,
        content,
        cursor: 0,
        mode: 'NORMAL',
        command: '',
        message: `"${filePath}" ${lineCount}L, ${content.length}B`,
        scrollRow: 0,
      };
      term.write('\x1b[2J\x1b[H'); // Initial screen clear once when opening editor
      drawEditor();
    };

    // Keyboard Shortcuts Interceptor
    term.attachCustomKeyEventHandler((event: KeyboardEvent) => {
      // Ctrl+F -> Open in-terminal search
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setIsSearchOpen(true);
        return false;
      }

      // Escape -> Close search or exit fullscreen
      if (event.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          return false;
        }
      }

      // Copy selection (Ctrl+C)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        if (term.hasSelection()) {
          const selectedText = term.getSelection();
          navigator.clipboard.writeText(selectedText);
          showToast('Đã sao chép vào bộ nhớ đệm');
          return false;
        }
        return true;
      }

      // Paste (Ctrl+V or Shift+Insert)
      if (
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') ||
        (event.shiftKey && event.key === 'Insert')
      ) {
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

    // Native DOM Paste Listener
    const domElem = terminalRef.current;
    const handleDomPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        insertText(text);
      }
    };
    domElem.addEventListener('paste', handleDomPaste);

    // Initial Welcome Message
    printWelcomeBanner(term);
    showPrompt();

    // Main Keystroke Handler (Bash readline-like)
    const disposable = term.onData(async (data) => {
      const editor = editorSession.current;
      if (editor) {
        const lines = editor.content.split('\n');
        const beforeCursor = editor.content.slice(0, editor.cursor);
        const curLineIdx = beforeCursor.split('\n').length - 1;
        const lineStart = beforeCursor.lastIndexOf('\n') + 1;
        const nextNewline = editor.content.indexOf('\n', editor.cursor);
        const lineEnd = nextNewline === -1 ? editor.content.length : nextNewline;
        const curCol = editor.cursor - lineStart;

        const moveVertical = (dir: 'up' | 'down') => {
          const targetLineIdx = dir === 'up' ? curLineIdx - 1 : curLineIdx + 1;
          if (targetLineIdx < 0 || targetLineIdx >= lines.length) return;
          let targetStart = 0;
          for (let i = 0; i < targetLineIdx; i++) {
            targetStart += lines[i].length + 1;
          }
          const targetLineLen = lines[targetLineIdx].length;
          const maxCol = editor.mode === 'INSERT' ? targetLineLen : Math.max(0, targetLineLen - 1);
          const targetCol = Math.min(curCol, maxCol);
          editor.cursor = targetStart + targetCol;
        };

        const moveHorizontal = (dir: 'left' | 'right') => {
          if (dir === 'left') {
            if (editor.cursor > lineStart) editor.cursor--;
          } else {
            const maxEnd = editor.mode === 'INSERT' ? lineEnd : Math.max(lineStart, lineEnd - 1);
            if (editor.cursor < maxEnd) editor.cursor++;
          }
        };

        // COMMAND MODE (:w, :q, :wq, :x, :q!)
        if (editor.mode === 'COMMAND') {
          if (data === '\x1b') {
            editor.mode = 'NORMAL';
            editor.command = '';
            editor.message = '';
          } else if (data === '\r') {
            const command = editor.command.trim();
            if (command === 'w' || command === 'wq' || command === 'x') {
              kernel.vfs.writeFile(editor.path, editor.content);
              const totalLines = editor.content.split('\n').length;
              editor.message = `"${editor.path}" ${totalLines}L, ${editor.content.length}B written`;
              if (onKernelUpdate) onKernelUpdate();
            }
            if (command === 'q' || command === 'q!' || command === 'wq' || command === 'x') {
              editorSession.current = null;
              term.write('\x1b[2J\x1b[H');
              inputBuffer.current = '';
              cursorPosition.current = 0;
              showPrompt();
              return;
            }
            editor.mode = 'NORMAL';
            editor.command = '';
          } else if (data === '\x7f' || data === '\b') {
            if (editor.command.length > 0) {
              editor.command = editor.command.slice(0, -1);
            } else {
              editor.mode = 'NORMAL';
              editor.command = '';
            }
          } else if (data.length === 1 && data >= ' ') {
            editor.command += data;
          }
          drawEditor();
          return;
        }

        // INSERT MODE
        if (editor.mode === 'INSERT') {
          if (data === '\x1b') {
            editor.mode = 'NORMAL';
            editor.message = '';
            if (editor.cursor > lineStart) {
              editor.cursor--;
            }
          } else if (data === '\x7f' || data === '\b') {
            if (editor.cursor > 0) {
              editor.content = editor.content.slice(0, editor.cursor - 1) + editor.content.slice(editor.cursor);
              editor.cursor--;
            }
          } else if (data === '\r') {
            editor.content = editor.content.slice(0, editor.cursor) + '\n' + editor.content.slice(editor.cursor);
            editor.cursor++;
          } else if (data === '\t') {
            editor.content = editor.content.slice(0, editor.cursor) + '    ' + editor.content.slice(editor.cursor);
            editor.cursor += 4;
          } else if (data.startsWith('\x1b[')) {
            const seq = data.slice(2);
            if (seq === 'A') moveVertical('up');
            else if (seq === 'B') moveVertical('down');
            else if (seq === 'C') moveHorizontal('right');
            else if (seq === 'D') moveHorizontal('left');
          } else if (data >= ' ') {
            editor.content = editor.content.slice(0, editor.cursor) + data + editor.content.slice(editor.cursor);
            editor.cursor += data.length;
          }
          drawEditor();
          return;
        }

        // NORMAL MODE
        editor.message = '';
        if (data === ':') {
          editor.mode = 'COMMAND';
          editor.command = '';
        } else if (data === 'i') {
          editor.mode = 'INSERT';
        } else if (data === 'I') {
          editor.cursor = lineStart;
          editor.mode = 'INSERT';
        } else if (data === 'a') {
          editor.cursor = Math.min(lineEnd, editor.cursor + 1);
          editor.mode = 'INSERT';
        } else if (data === 'A') {
          editor.cursor = lineEnd;
          editor.mode = 'INSERT';
        } else if (data === 'o') {
          editor.content = editor.content.slice(0, lineEnd) + '\n' + editor.content.slice(lineEnd);
          editor.cursor = lineEnd + 1;
          editor.mode = 'INSERT';
        } else if (data === 'O') {
          editor.content = editor.content.slice(0, lineStart) + '\n' + editor.content.slice(lineStart);
          editor.cursor = lineStart;
          editor.mode = 'INSERT';
        } else if (data === 'h' || data === '\x1b[D') {
          moveHorizontal('left');
        } else if (data === 'l' || data === '\x1b[C') {
          moveHorizontal('right');
        } else if (data === 'j' || data === '\x1b[B') {
          moveVertical('down');
        } else if (data === 'k' || data === '\x1b[A') {
          moveVertical('up');
        } else if (data === '0') {
          editor.cursor = lineStart;
        } else if (data === '$') {
          editor.cursor = Math.max(lineStart, lineEnd - 1);
        } else if (data === 'x') {
          if (editor.cursor < lineEnd) {
            editor.content = editor.content.slice(0, editor.cursor) + editor.content.slice(editor.cursor + 1);
          }
        } else if (data === 'd') {
          if (editor.pendingKey === 'd') {
            const deleteEnd = nextNewline === -1 ? editor.content.length : nextNewline + 1;
            editor.content = editor.content.slice(0, lineStart) + editor.content.slice(deleteEnd);
            editor.cursor = Math.min(editor.content.length, lineStart);
            editor.pendingKey = undefined;
          } else {
            editor.pendingKey = 'd';
          }
        } else if (data === 'G') {
          editor.cursor = editor.content.length;
        } else if (data === 'g') {
          if (editor.pendingKey === 'g') {
            editor.cursor = 0;
            editor.pendingKey = undefined;
          } else {
            editor.pendingKey = 'g';
          }
        } else {
          editor.pendingKey = undefined;
        }

        drawEditor();
        return;
      }

      // Enter key -> Execute Command
      if (data === '\r') {
        const cmd = inputBuffer.current;
        term.write('\r\n');

        if (cmd.trim()) {
          isExecutingRef.current = true;
          setIsExecuting(true);

          const res = await kernel.execute(cmd);
          if (editorSession.current) {
            isExecutingRef.current = false;
            setIsExecuting(false);
            return;
          }
          if (res.stdout) {
            term.writeln(res.stdout);
          }
          if (res.stderr) {
            term.writeln(`\x1b[31m${res.stderr}\x1b[0m`);
          }
          if (onKernelUpdate) onKernelUpdate();

          isExecutingRef.current = false;
          setIsExecuting(false);
        }

        inputBuffer.current = '';
        cursorPosition.current = 0;
        historyIndex.current = -1;
        showPrompt();
        return;
      }

      // Backspace
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

      // Delete key (\x1b[3~)
      if (data === '\x1b[3~') {
        if (cursorPosition.current < inputBuffer.current.length) {
          const buf = inputBuffer.current;
          const pos = cursorPosition.current;
          inputBuffer.current = buf.slice(0, pos) + buf.slice(pos + 1);
          redrawLine(term);
        }
        return;
      }

      // Tab completion
      if (data === '\t') {
        handleTabCompletion(term);
        return;
      }

      // Ctrl+C -> Send SIGINT
      if (data === '\x03') {
        term.writeln('^C');
        inputBuffer.current = '';
        cursorPosition.current = 0;
        historyIndex.current = -1;
        showPrompt();
        return;
      }

      // Ctrl+L -> Clear terminal
      if (data === '\x0C') {
        term.clear();
        showPrompt();
        if (inputBuffer.current) {
          term.write(inputBuffer.current);
        }
        return;
      }

      // Ctrl+A / Home -> Jump to start
      if (data === '\x01' || data === '\x1b[H' || data === '\x1b[1~') {
        cursorPosition.current = 0;
        redrawLine(term);
        return;
      }

      // Ctrl+E / End -> Jump to end
      if (data === '\x05' || data === '\x1b[F' || data === '\x1b[4~') {
        cursorPosition.current = inputBuffer.current.length;
        redrawLine(term);
        return;
      }

      // Ctrl+U -> Clear from cursor to beginning
      if (data === '\x15') {
        inputBuffer.current = inputBuffer.current.slice(cursorPosition.current);
        cursorPosition.current = 0;
        redrawLine(term);
        return;
      }

      // Ctrl+K -> Clear from cursor to end
      if (data === '\x0B') {
        inputBuffer.current = inputBuffer.current.slice(0, cursorPosition.current);
        redrawLine(term);
        return;
      }

      // Ctrl+W -> Delete word before cursor
      if (data === '\x17') {
        const before = inputBuffer.current.slice(0, cursorPosition.current);
        const after = inputBuffer.current.slice(cursorPosition.current);
        const trimmed = before.trimEnd();
        const lastSpace = trimmed.lastIndexOf(' ');
        const newBefore = lastSpace >= 0 ? trimmed.slice(0, lastSpace + 1) : '';
        inputBuffer.current = newBefore + after;
        cursorPosition.current = newBefore.length;
        redrawLine(term);
        return;
      }

      // Ctrl+Left / Alt+B -> Jump back word
      if (data === '\x1bb' || data === '\x1b[1;5D') {
        if (cursorPosition.current > 0) {
          const before = inputBuffer.current.slice(0, cursorPosition.current);
          const match = before.match(/\s*\S+$/);
          const jump = match ? match[0].length : 1;
          cursorPosition.current = Math.max(0, cursorPosition.current - jump);
          redrawLine(term);
        }
        return;
      }

      // Ctrl+Right / Alt+F -> Jump forward word
      if (data === '\x1bf' || data === '\x1b[1;5C') {
        if (cursorPosition.current < inputBuffer.current.length) {
          const after = inputBuffer.current.slice(cursorPosition.current);
          const match = after.match(/^\S+\s*/);
          const jump = match ? match[0].length : 1;
          cursorPosition.current = Math.min(inputBuffer.current.length, cursorPosition.current + jump);
          redrawLine(term);
        }
        return;
      }

      // Escape sequences (Arrows)
      if (data.startsWith('\x1b[')) {
        const seq = data.slice(2);
        // Up Arrow
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
        // Down Arrow
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
        // Right Arrow
        if (seq === 'C') {
          if (cursorPosition.current < inputBuffer.current.length) {
            cursorPosition.current++;
            term.write('\x1b[C');
          }
          return;
        }
        // Left Arrow
        if (seq === 'D') {
          if (cursorPosition.current > 0) {
            cursorPosition.current--;
            term.write('\x1b[D');
          }
          return;
        }
        return;
      }

      // Printable characters
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
        setDimensions({ cols: term.cols, rows: term.rows });
        if (editorSession.current) {
          drawEditor();
        }
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

  // Listen for pendingCommand changes from props
  useEffect(() => {
    if (pendingCommand && pendingCommand.id !== lastExecutedIdRef.current && xtermInstance.current) {
      lastExecutedIdRef.current = pendingCommand.id;
      runQuickCommand(pendingCommand.command);
    }
  }, [pendingCommand, runQuickCommand]);

  // Context Menu Handlers
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
    if (showThemePicker) setShowThemePicker(false);
  };

  return (
    <div
      className={`flex flex-col relative transition-all duration-200 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : `h-full w-full ${className}`
      }`}
      style={{
        backgroundColor: currentThemeConfig.theme.background,
        color: currentThemeConfig.theme.foreground,
      }}
      onClick={closeContextMenu}
    >
      {/* PROFESSIONAL TERMINAL HEADER */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-xs flex-wrap gap-1.5 z-20 ${
          currentThemeConfig.isDark
            ? 'bg-[#12161f]/95 border-[#30363d] text-slate-300'
            : 'bg-[#f6f8fa]/95 border-[#d0d7de] text-slate-700'
        }`}
      >
        {/* Left: Host Info & Status Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isExecuting
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              }`}
              title={isExecuting ? 'Đang thực thi lệnh...' : 'Hệ điều hành sẵn sàng'}
            />
            <TerminalIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-200 hidden sm:inline">CentOS 9</span>
          </div>

          <span className="opacity-40">|</span>

          <span
            className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium truncate max-w-[180px] sm:max-w-none"
            style={{
              backgroundColor: currentThemeConfig.isDark ? '#1c2128' : '#eaf0f6',
              color: currentThemeConfig.accent,
            }}
          >
            {kernel.currentUser}@{kernel.hostname.split('.')[0]}:{kernel.cwd}
          </span>

          {isExecuting && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse font-sans">
              Đang chạy...
            </span>
          )}
        </div>

        {/* Right: Rich Action Controls */}
        <div className="flex items-center gap-1 flex-wrap font-sans">
          {/* Search Toggle Button */}
          <button
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setShowThemePicker(false);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition border cursor-pointer ${
              isSearchOpen
                ? 'bg-blue-600 text-white border-blue-500'
                : currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-300 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d0d7de]'
            }`}
            title="Tìm kiếm trong terminal (Ctrl+F)"
          >
            <Search className="w-3 h-3" />
            <span className="hidden sm:inline">Tìm</span>
          </button>

          {/* Font Size Adjustments */}
          <div
            className={`flex items-center rounded border overflow-hidden ${
              currentThemeConfig.isDark
                ? 'bg-[#1c2128] border-[#30363d]'
                : 'bg-white border-[#d0d7de]'
            }`}
          >
            <button
              onClick={() => handleZoom(-1)}
              className="px-1.5 py-1 hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Giảm kích thước chữ"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1 text-[10px] font-mono text-slate-400 min-w-[28px] text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => handleZoom(1)}
              className="px-1.5 py-1 hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Tăng kích thước chữ"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowThemePicker((v) => !v);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition border cursor-pointer ${
                showThemePicker
                  ? 'bg-blue-600 text-white border-blue-500'
                  : currentThemeConfig.isDark
                  ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-300 border-[#30363d]'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d0d7de]'
              }`}
              title="Đổi giao diện màu sắc"
            >
              <Palette className="w-3 h-3" style={{ color: currentThemeConfig.accent }} />
              <span className="hidden md:inline">{currentThemeConfig.name}</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-70" />
            </button>

            {/* Theme list popover */}
            {showThemePicker && (
              <div
                className={`absolute right-0 top-full mt-1 w-52 rounded-lg shadow-2xl border p-1.5 z-50 ${
                  currentThemeConfig.isDark
                    ? 'bg-[#161b22] border-[#30363d] text-slate-200'
                    : 'bg-white border-[#d0d7de] text-slate-800'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/40 mb-1">
                  Chọn chủ đề màu
                </div>
                {TERMINAL_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition cursor-pointer ${
                      t.id === selectedThemeId
                        ? 'bg-blue-600 text-white font-medium'
                        : currentThemeConfig.isDark
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: t.accent }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {t.id === selectedThemeId && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition border cursor-pointer ${
              currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-300 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d0d7de]'
            }`}
            title="Sao chép (Ctrl+C)"
          >
            <Copy className="w-3 h-3 opacity-70" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          {/* Quick Paste Button */}
          <button
            onClick={handlePaste}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border transition cursor-pointer ${
              currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-300 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-[#d0d7de]'
            }`}
            title="Dán từ Clipboard (Ctrl+V)"
          >
            <Clipboard className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          {/* Export Log Button */}
          <button
            onClick={handleExportLog}
            className={`p-1 rounded transition border cursor-pointer ${
              currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-[#d0d7de]'
            }`}
            title="Tải xuống nhật ký terminal (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Terminal Button */}
          <button
            onClick={() => runQuickCommand('clear')}
            className={`p-1 rounded transition border cursor-pointer ${
              currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-[#d0d7de]'
            }`}
            title="Xóa màn hình (Ctrl+L)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Restart Shell Session Button */}
          <button
            onClick={handleResetSession}
            className={`p-1 rounded transition border cursor-pointer ${
              currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-[#d0d7de]'
            }`}
            title="Khởi động lại phiên làm việc terminal"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen / Minimize Toggle */}
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className={`p-1 rounded transition border cursor-pointer ${
              isFullscreen
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : currentThemeConfig.isDark
                ? 'bg-[#1c2128] hover:bg-slate-700 text-slate-400 hover:text-slate-200 border-[#30363d]'
                : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-[#d0d7de]'
            }`}
            title={isFullscreen ? 'Thu nhỏ cửa sổ (Esc)' : 'Toàn màn hình terminal'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* FLOATING SEARCH BAR (ADDON-SEARCH) */}
      {isSearchOpen && (
        <div
          className={`absolute top-10 right-4 z-40 flex items-center gap-1.5 p-1.5 rounded-lg shadow-2xl border text-xs animate-fadeIn ${
            currentThemeConfig.isDark
              ? 'bg-[#161b22] border-[#30363d] text-slate-200'
              : 'bg-white border-[#d0d7de] text-slate-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.shiftKey) handleSearchPrevious();
                else handleSearchNext();
              } else if (e.key === 'Escape') {
                setIsSearchOpen(false);
              }
            }}
            placeholder="Tìm trong terminal..."
            autoFocus
            className={`px-2 py-0.5 rounded text-xs outline-none w-44 font-mono ${
              currentThemeConfig.isDark
                ? 'bg-[#0d1117] text-slate-100 border border-[#30363d] focus:border-blue-500'
                : 'bg-slate-50 text-slate-900 border border-slate-300 focus:border-blue-500'
            }`}
          />

          {searchMatchesCount !== null && (
            <span className="text-[10px] text-slate-400 font-mono px-1">
              {searchMatchesCount} kết quả
            </span>
          )}

          {/* Case sensitive toggle */}
          <button
            onClick={() =>
              setSearchOptions((prev) => ({ ...prev, caseSensitive: !prev.caseSensitive }))
            }
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
              searchOptions.caseSensitive
                ? 'bg-blue-600 text-white border-blue-500'
                : 'opacity-60 hover:opacity-100 border-transparent'
            }`}
            title="Khớp chữ hoa/chữ thường (Aa)"
          >
            Aa
          </button>

          {/* Whole word toggle */}
          <button
            onClick={() =>
              setSearchOptions((prev) => ({ ...prev, wholeWord: !prev.wholeWord }))
            }
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
              searchOptions.wholeWord
                ? 'bg-blue-600 text-white border-blue-500'
                : 'opacity-60 hover:opacity-100 border-transparent'
            }`}
            title="Khớp nguyên từ (\b)"
          >
            \b
          </button>

          {/* Regex toggle */}
          <button
            onClick={() =>
              setSearchOptions((prev) => ({ ...prev, regex: !prev.regex }))
            }
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
              searchOptions.regex
                ? 'bg-blue-600 text-white border-blue-500'
                : 'opacity-60 hover:opacity-100 border-transparent'
            }`}
            title="Biểu thức chính quy Regex (.*)"
          >
            .*
          </button>

          {/* Previous / Next buttons */}
          <button
            onClick={handleSearchPrevious}
            className="p-1 rounded hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Kết quả trước (Shift+Enter)"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleSearchNext}
            className="p-1 rounded hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Kết quả tiếp (Enter)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 cursor-pointer"
            title="Đóng (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* XTERM CANVAS CONTAINER */}
      <div
        className="flex-1 w-full p-2 overflow-hidden relative select-text"
        ref={terminalRef}
        onContextMenu={handleContextMenu}
      />

      {/* TERMINAL STATUS BAR (FOOTER) */}
      <div
        className={`flex items-center justify-between px-3 py-1 border-t text-[11px] font-mono flex-wrap gap-2 ${
          currentThemeConfig.isDark
            ? 'bg-[#0a0e17] border-[#21262d] text-slate-400'
            : 'bg-[#f6f8fa] border-[#d0d7de] text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isExecuting ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="text-[10px] text-slate-400">
              {isExecuting ? 'Đang thực thi' : 'Sẵn sàng'}
            </span>
          </div>

          <span className="hidden sm:inline opacity-40">|</span>

          <span className="hidden sm:inline text-slate-400">
            Kích thước: <strong className="text-slate-300">{dimensions.cols} × {dimensions.rows}</strong>
          </span>

          <span className="hidden md:inline opacity-40">|</span>

          <span className="hidden md:inline text-slate-400">
            Thư mục: <strong className="text-emerald-400">{kernel.cwd}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-[10px] text-slate-500">
            Ctrl+C: Hủy • Tab: Gợi ý • Ctrl+L: Xóa • Ctrl+F: Tìm
          </span>

          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800/40 text-slate-400 border border-slate-700/50">
            UTF-8
          </span>

          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800/40 text-slate-400 border border-slate-700/50">
            /bin/bash
          </span>
        </div>
      </div>

      {/* DISCREET TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-md shadow-2xl bg-slate-900/90 text-white text-xs border border-slate-700 flex items-center gap-1.5 pointer-events-none animate-fadeIn font-sans">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CUSTOM RIGHT-CLICK CONTEXT MENU */}
      {contextMenu.visible && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className={`fixed z-50 border rounded-lg shadow-2xl py-1.5 w-48 text-xs font-sans animate-fadeIn ${
            currentThemeConfig.isDark
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
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 opacity-70" />
              <span>Sao chép</span>
            </div>
            <span className="text-[10px] opacity-60">Ctrl+C</span>
          </button>

          <button
            onClick={() => {
              handlePaste();
              closeContextMenu();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clipboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Dán</span>
            </div>
            <span className="text-[10px] opacity-60">Ctrl+V</span>
          </button>

          <button
            onClick={() => {
              handleSelectAll();
              closeContextMenu();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
              <span>Chọn tất cả</span>
            </div>
          </button>

          <div
            className={`h-px my-1 ${
              currentThemeConfig.isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          />

          <button
            onClick={() => {
              setIsSearchOpen(true);
              closeContextMenu();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark ? 'hover:bg-blue-600 hover:text-white' : 'hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 opacity-70" />
              <span>Tìm kiếm</span>
            </div>
            <span className="text-[10px] opacity-60">Ctrl+F</span>
          </button>

          <button
            onClick={() => {
              runQuickCommand('clear');
              closeContextMenu();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 opacity-70" />
              <span>Xóa màn hình</span>
            </div>
            <span className="text-[10px] opacity-60">Ctrl+L</span>
          </button>

          <button
            onClick={() => {
              handleExportLog();
              closeContextMenu();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 opacity-70" />
              <span>Xuất nhật ký (.txt)</span>
            </div>
          </button>

          <div
            className={`h-px my-1 ${
              currentThemeConfig.isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          />

          <button
            onClick={() => {
              handleResetSession();
              closeContextMenu();
            }}
            className={`w-full flex items-center justify-between px-3 py-1.5 transition text-left cursor-pointer ${
              currentThemeConfig.isDark
                ? 'hover:bg-rose-950/40 text-rose-400'
                : 'hover:bg-rose-50 text-rose-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khởi động lại Shell</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
