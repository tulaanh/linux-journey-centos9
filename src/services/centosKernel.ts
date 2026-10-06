import { VirtualFileSystem } from './vfs';
import { getCommandDoc, renderCommandCatalog, renderCommandHelp, renderManPage, renderWhatIs } from './commandDocs';
import type {
  LinuxUser,
  LinuxGroup,
  SystemProcess,
  SystemdService,
  YumPackage,
  CommandResult,
} from '../types/linux';

export class CentOSKernel {
  public vfs: VirtualFileSystem;
  public cwd: string = '/root';
  public currentUser: string = 'root';
  public hostname: string = 'centos9.localdomain';
  public env: Record<string, string> = {};
  public history: string[] = [];
  public lastExitCode: number = 0;

  public users: Map<string, LinuxUser> = new Map();
  public groups: Map<string, LinuxGroup> = new Map();
  public processes: SystemProcess[] = [];
  public services: Map<string, SystemdService> = new Map();
  public crontabs: Map<string, string[]> = new Map();
  public packages: Map<string, YumPackage> = new Map();
  public aliases: Map<string, string> = new Map();
  public selinuxMode: 'Enforcing' | 'Permissive' | 'Disabled' = 'Enforcing';
  public firewallServices: Set<string> = new Set(['cockpit', 'dhcpv6-client', 'ssh']);
  public firewallPorts: Set<string> = new Set();

  // Callback used by the terminal to start an in-terminal editor session.
  public onOpenEditor?: (filePath: string, content: string) => void;

  constructor() {
    this.vfs = new VirtualFileSystem();
    this.initDefaultState();
  }

  public initDefaultState(): void {
    this.vfs.resetToDefaultCentOS();
    this.cwd = '/root';
    this.currentUser = 'root';
    this.hostname = 'centos9.localdomain';
    this.lastExitCode = 0;
    this.selinuxMode = 'Enforcing';
    this.firewallServices = new Set(['cockpit', 'dhcpv6-client', 'ssh']);
    this.firewallPorts = new Set();

    this.env = {
      USER: 'root',
      HOME: '/root',
      PWD: '/root',
      OLDPWD: '/root',
      SHELL: '/bin/bash',
      TERM: 'xterm-256color',
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/root/bin',
      HOSTNAME: this.hostname,
      LANG: 'en_US.UTF-8',
      HISTSIZE: '1000',
    };

    // Default aliases
    this.aliases.clear();
    this.aliases.set('ll', 'ls -l --color=auto');
    this.aliases.set('la', 'ls -la --color=auto');
    this.aliases.set('l.', 'ls -d .* --color=auto');
    this.aliases.set('grep', 'grep --color=auto');
    this.aliases.set('egrep', 'egrep --color=auto');
    this.aliases.set('fgrep', 'fgrep --color=auto');


    // Default Users
    this.users.clear();
    const defaultUsers: LinuxUser[] = [
      { uid: 0, username: 'root', gid: 0, home: '/root', shell: '/bin/bash' },
      { uid: 1, username: 'bin', gid: 1, home: '/bin', shell: '/sbin/nologin' },
      { uid: 2, username: 'daemon', gid: 2, home: '/sbin', shell: '/sbin/nologin' },
      { uid: 74, username: 'sshd', gid: 74, home: '/var/empty/sshd', shell: '/sbin/nologin' },
      { uid: 1000, username: 'centos', gid: 1000, home: '/home/centos', shell: '/bin/bash' },
      { uid: 1001, username: 'pete', gid: 1001, home: '/home/pete', shell: '/bin/bash' },
    ];
    defaultUsers.forEach(u => this.users.set(u.username, u));

    // Default Groups
    this.groups.clear();
    const defaultGroups: LinuxGroup[] = [
      { gid: 0, name: 'root', members: ['root'] },
      { gid: 10, name: 'wheel', members: ['centos', 'pete'] },
      { gid: 74, name: 'sshd', members: [] },
      { gid: 1000, name: 'centos', members: ['centos'] },
      { gid: 1001, name: 'pete', members: ['pete'] },
    ];
    defaultGroups.forEach(g => this.groups.set(g.name, g));

    // Default Services
    this.services.clear();
    const defaultServices: SystemdService[] = [
      { name: 'sshd.service', description: 'OpenSSH server daemon', activeState: 'active', unitFileState: 'enabled', execStart: '/usr/sbin/sshd -D', mainPid: 912 },
      { name: 'crond.service', description: 'Command Scheduler', activeState: 'active', unitFileState: 'enabled', execStart: '/usr/sbin/crond -n', mainPid: 540 },
      { name: 'firewalld.service', description: 'firewalld - dynamic firewall daemon', activeState: 'active', unitFileState: 'enabled', execStart: '/usr/sbin/firewalld --nofork --nopid', mainPid: 615 },
      { name: 'NetworkManager.service', description: 'Network Manager', activeState: 'active', unitFileState: 'enabled', execStart: '/usr/sbin/NetworkManager --no-daemon' },
      { name: 'auditd.service', description: 'Security Auditing Service', activeState: 'active', unitFileState: 'enabled', execStart: '/sbin/auditd', mainPid: 520 },
      { name: 'nginx.service', description: 'The nginx HTTP and reverse proxy server', activeState: 'inactive', unitFileState: 'disabled', execStart: '/usr/sbin/nginx' },
      { name: 'httpd.service', description: 'The Apache HTTP Server', activeState: 'inactive', unitFileState: 'disabled', execStart: '/usr/sbin/httpd -DFOREGROUND' },
      { name: 'mariadb.service', description: 'MariaDB 10.5 database server', activeState: 'inactive', unitFileState: 'disabled', execStart: '/usr/libexec/mariadbd' },
    ];
    defaultServices.forEach(s => this.services.set(s.name, s));

    // Default Processes
    this.processes = [
      { pid: 1, ppid: 0, user: 'root', cpu: 0.0, mem: 0.4, vsz: 172324, rss: 5216, tty: '?', stat: 'Ss', start: '08:12', time: '0:01', command: '/usr/lib/systemd/systemd --switched-root --system --deserialize 31' },
      { pid: 520, ppid: 1, user: 'root', cpu: 0.0, mem: 0.1, vsz: 55432, rss: 1840, tty: '?', stat: 'S<s', start: '08:12', time: '0:00', command: '/sbin/auditd' },
      { pid: 540, ppid: 1, user: 'root', cpu: 0.0, mem: 0.1, vsz: 126284, rss: 1672, tty: '?', stat: 'Ss', start: '08:12', time: '0:00', command: '/usr/sbin/crond -n' },
      { pid: 615, ppid: 1, user: 'root', cpu: 0.1, mem: 2.1, vsz: 345120, rss: 32410, tty: '?', stat: 'Ssl', start: '08:12', time: '0:02', command: '/usr/bin/python3 -s /usr/sbin/firewalld --nofork --nopid' },
      { pid: 912, ppid: 1, user: 'root', cpu: 0.0, mem: 0.3, vsz: 112796, rss: 4312, tty: '?', stat: 'Ss', start: '08:12', time: '0:00', command: '/usr/sbin/sshd -D' },
      { pid: 1205, ppid: 912, user: 'root', cpu: 0.0, mem: 0.4, vsz: 153240, rss: 5612, tty: '?', stat: 'Ss', start: '08:14', time: '0:00', command: 'sshd: root@pts/0' },
      { pid: 1208, ppid: 1205, user: 'root', cpu: 0.0, mem: 0.2, vsz: 115540, rss: 3204, tty: 'pts/0', stat: 'Ss', start: '08:14', time: '0:00', command: '-bash' },
    ];

    // Default Crontab
    this.crontabs.clear();
    this.crontabs.set('root', [
      '# Run system activity accounting tool every 10 minutes',
      '*/10 * * * * /usr/lib64/sa/sa1 1 1',
    ]);

    // Available Packages in CentOS 9 repository (DNF / RPM)
    this.packages.clear();
    const pkgList: YumPackage[] = [
      {
        name: 'nginx',
        version: '1.22.1',
        release: '3.el9',
        arch: 'x86_64',
        summary: 'A high performance web server and reverse proxy',
        description: 'Nginx is a web server and a reverse proxy server for HTTP, SMTP, POP3 and IMAP protocols.',
        installed: false,
        size: '2.1 M',
        files: ['/usr/sbin/nginx', '/etc/nginx/nginx.conf', '/etc/nginx/conf.d', '/var/log/nginx', '/usr/share/nginx/html/index.html'],
      },
      {
        name: 'httpd',
        version: '2.4.57',
        release: '5.el9',
        arch: 'x86_64',
        summary: 'Apache HTTP Server',
        description: 'The Apache HTTP Server is a powerful, efficient, and extensible web server.',
        installed: false,
        size: '3.1 M',
        files: ['/usr/sbin/httpd', '/etc/httpd/conf/httpd.conf', '/var/www/html'],
      },
      {
        name: 'htop',
        version: '3.2.2',
        release: '1.el9',
        arch: 'x86_64',
        summary: 'An interactive process viewer',
        description: 'htop is an interactive real-time process monitoring tool for Linux systems.',
        installed: false,
        size: '280 k',
        files: ['/usr/bin/htop', '/usr/share/man/man1/htop.1.gz'],
      },
      {
        name: 'tree',
        version: '1.8.2',
        release: '2.el9',
        arch: 'x86_64',
        summary: 'File and directory tree display tool',
        description: 'Tree is a recursive directory listing command that produces a depth indented listing of files.',
        installed: true,
        size: '56 k',
        files: ['/usr/bin/tree'],
      },
      {
        name: 'tar',
        version: '1.34',
        release: '6.el9',
        arch: 'x86_64',
        summary: 'A GNU file archiving program',
        description: 'The GNU tar program saves many files together into a single tape or disk archive.',
        installed: true,
        size: '860 k',
        files: ['/bin/tar', '/usr/bin/tar'],
      },
      {
        name: 'gzip',
        version: '1.12',
        release: '1.el9',
        arch: 'x86_64',
        summary: 'The GNU data compression program',
        description: 'Gzip reduces the size of the named files using Lempel-Ziv coding (LZ77).',
        installed: true,
        size: '165 k',
        files: ['/bin/gzip', '/bin/gunzip', '/usr/bin/gzip'],
      },
      {
        name: 'git',
        version: '2.39.3',
        release: '1.el9',
        arch: 'x86_64',
        summary: 'Fast Version Control System',
        description: 'Git is a fast, scalable, distributed revision control system with an unusually rich command set.',
        installed: false,
        size: '5.2 M',
        files: ['/usr/bin/git', '/usr/libexec/git-core'],
      },
      {
        name: 'net-tools',
        version: '2.0',
        release: '0.52.20160912git.el9',
        arch: 'x86_64',
        summary: 'Basic networking tools',
        description: 'The net-tools package includes basic tools for configuring and maintaining networking.',
        installed: true,
        size: '1.1 M',
        files: ['/bin/netstat', '/sbin/ifconfig', '/sbin/route', '/sbin/arp'],
      },
      {
        name: 'vim-enhanced',
        version: '8.2.2637',
        release: '20.el9',
        arch: 'x86_64',
        summary: 'A version of the VIM editor which includes recent enhancements',
        description: 'VIM (Visual editor IMproved) is an updated and improved version of the vi editor.',
        installed: true,
        size: '2.8 M',
        files: ['/usr/bin/vim'],
      },
      {
        name: 'curl',
        version: '7.76.1',
        release: '26.el9',
        arch: 'x86_64',
        summary: 'A utility for getting files from remote servers',
        description: 'curl is a command line tool for transferring data with URL syntax.',
        installed: true,
        size: '310 k',
        files: ['/usr/bin/curl'],
      },
    ];
    pkgList.forEach(p => this.packages.set(p.name, p));
  }

  // Generate Bash Prompt
  public getPrompt(): string {
    const user = this.currentUser;
    const shortHost = this.hostname.split('.')[0] || 'localhost';
    const userObj = this.users.get(user);
    const home = userObj?.home || '/root';

    let displayCwd = this.cwd;
    if (displayCwd === home) {
      displayCwd = '~';
    } else if (displayCwd.startsWith(home + '/')) {
      displayCwd = '~' + displayCwd.slice(home.length);
    }

    // CentOS bash format: [root@localhost ~]# or [centos@localhost ~]$
    const symbol = user === 'root' ? '#' : '$';
    return `[${user}@${shortHost} ${displayCwd}]${symbol} `;
  }

  // Main entrypoint: Execute a command string from shell
  public async execute(rawInput: string): Promise<CommandResult> {
    const line = rawInput.trim();
    if (!line) {
      return { stdout: '', stderr: '', exitCode: 0, cwd: this.cwd, currentUser: this.currentUser };
    }

    this.history.push(line);

    // Support logical chaining &&, ||, ;
    return this.executeChain(line);
  }

  // Split a line at an operator (|, ||, &&, ;) that is OUTSIDE quotes.
  // Backslash escapes outside single quotes keep the following char literal.
  private splitTopLevel(line: string, op: string): string[] {
    const parts: string[] = [];
    let buf = '';
    let sq = false;
    let dq = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '\\' && !sq) {
        buf += c + (line[i + 1] ?? '');
        i++;
        continue;
      }
      if (c === "'" && !dq) sq = !sq;
      else if (c === '"' && !sq) dq = !dq;

      if (!sq && !dq && line.startsWith(op, i)) {
        parts.push(buf);
        buf = '';
        i += op.length - 1;
        continue;
      }
      buf += c;
    }
    parts.push(buf);

    return parts;
  }

  private async executeChain(line: string): Promise<CommandResult> {
    // ; : run every part sequentially and combine the outputs
    const semis = this.splitTopLevel(line, ';');
    if (semis.length > 1) {
      let combinedOut = '';
      let combinedErr = '';
      let lastExit = 0;
      for (const part of semis) {
        if (!part.trim()) continue;
        const res = await this.executeChain(part.trim());
        if (res.stdout) combinedOut += res.stdout + '\n';
        if (res.stderr) combinedErr += res.stderr + '\n';
        lastExit = res.exitCode;
      }
      return { stdout: combinedOut.trimEnd(), stderr: combinedErr.trimEnd(), exitCode: lastExit, cwd: this.cwd, currentUser: this.currentUser };
    }

    // || : run parts left to right until one succeeds
    const ors = this.splitTopLevel(line, '||');
    if (ors.length > 1) {
      let lastRes: CommandResult = { stdout: '', stderr: '', exitCode: 0 };
      for (const part of ors) {
        lastRes = await this.executeChain(part.trim());
        if (lastRes.exitCode === 0) return lastRes;
      }
      return lastRes;
    }

    // && : run parts left to right until one fails
    const ands = this.splitTopLevel(line, '&&');
    if (ands.length > 1) {
      let combinedOut = '';
      let combinedErr = '';
      for (const part of ands) {
        const res = await this.executePipelineOrRedirect(part.trim());
        if (res.stdout) combinedOut += (combinedOut ? '\n' : '') + res.stdout;
        if (res.stderr) combinedErr += (combinedErr ? '\n' : '') + res.stderr;
        if (res.exitCode !== 0) {
          return { stdout: combinedOut, stderr: combinedErr, exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
        }
      }
      return { stdout: combinedOut, stderr: combinedErr, exitCode: 0, cwd: this.cwd, currentUser: this.currentUser };
    }

    return this.executePipelineOrRedirect(line);
  }

  private writeRedirectOutput(targetFile: string, rawContent: string, append: boolean): void {
    const resolvedPath = this.vfs.resolvePath(this.cwd, targetFile);
    const content = rawContent ? (rawContent.endsWith('\n') ? rawContent : rawContent + '\n') : '';
    this.vfs.writeFile(resolvedPath, content, { append });
  }

  private async executePipelineOrRedirect(line: string): Promise<CommandResult> {
    let initialStdin = '';
    let cmdWithoutInput = line;

    // 1. Chuyển hướng đầu vào (stdin): `< file`
    const inputMatch = cmdWithoutInput.match(/(?:^|\s+)<\s*([^\s<>|&]+)/);
    if (inputMatch) {
      const sourceFile = inputMatch[1].trim();
      const resolvedSource = this.vfs.resolvePath(this.cwd, sourceFile);
      if (!this.vfs.exists(resolvedSource)) {
        return {
          stdout: '',
          stderr: `bash: ${sourceFile}: No such file or directory`,
          exitCode: 1,
          cwd: this.cwd,
          currentUser: this.currentUser,
        };
      }
      initialStdin = this.vfs.readFile(resolvedSource) ?? '';
      cmdWithoutInput = cmdWithoutInput.replace(inputMatch[0], ' ').trim();
    }

    // 2. Tách cả stdout và stderr ra 2 file riêng biệt: `cmd > file1 2> file2`
    const separateMatch = cmdWithoutInput.match(/^(.*?)\s*>\s*(\S+)\s+2>\s*(\S+)\s*$/);
    if (separateMatch) {
      const [, subCmd, outTarget, errTarget] = separateMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      if (res.stdout) this.writeRedirectOutput(outTarget, res.stdout, false);
      if (res.stderr) this.writeRedirectOutput(errTarget, res.stderr, false);
      return { stdout: '', stderr: '', exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    // 3. Cú pháp truyền thống chuyển cả 2 luồng: `cmd > file 2>&1` hoặc `cmd >> file 2>&1`
    const tradCombinedMatch = cmdWithoutInput.match(/^(.*?)\s*(>>|>)\s*(\S+)\s+2>&1\s*$/);
    if (tradCombinedMatch) {
      const [, subCmd, op, targetFile] = tradCombinedMatch;
      const isAppend = op === '>>';
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      const combined = (res.stdout ? res.stdout + '\n' : '') + (res.stderr ? res.stderr + '\n' : '');
      this.writeRedirectOutput(targetFile, combined, isAppend);
      return { stdout: '', stderr: '', exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    // 4. Cú pháp hiện đại chuyển cả 2 luồng: `cmd &>> file` hoặc `cmd &> file`
    const bothAppendMatch = cmdWithoutInput.match(/^(.*?)\s*&>>\s*(\S+)\s*$/);
    if (bothAppendMatch) {
      const [, subCmd, targetFile] = bothAppendMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      const combined = (res.stdout ? res.stdout + '\n' : '') + (res.stderr ? res.stderr + '\n' : '');
      this.writeRedirectOutput(targetFile, combined, true);
      return { stdout: '', stderr: '', exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    const bothOverwriteMatch = cmdWithoutInput.match(/^(.*?)\s*&>\s*(\S+)\s*$/);
    if (bothOverwriteMatch) {
      const [, subCmd, targetFile] = bothOverwriteMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      const combined = (res.stdout ? res.stdout + '\n' : '') + (res.stderr ? res.stderr + '\n' : '');
      this.writeRedirectOutput(targetFile, combined, false);
      return { stdout: '', stderr: '', exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    // 5. Chuyển hướng stderr: `cmd 2>> file` hoặc `cmd 2> file`
    const errAppendMatch = cmdWithoutInput.match(/^(.*?)\s*2>>\s*(\S+)\s*$/);
    if (errAppendMatch) {
      const [, subCmd, targetFile] = errAppendMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      if (res.stderr) this.writeRedirectOutput(targetFile, res.stderr, true);
      return { stdout: res.stdout, stderr: '', exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    const errOverwriteMatch = cmdWithoutInput.match(/^(.*?)\s*2>\s*(\S+)\s*$/);
    if (errOverwriteMatch) {
      const [, subCmd, targetFile] = errOverwriteMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      if (res.stderr) this.writeRedirectOutput(targetFile, res.stderr, false);
      return { stdout: res.stdout, stderr: '', exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    // 6. Chuyển hướng stdout: `cmd >> file` hoặc `cmd > file`
    const appendMatch = cmdWithoutInput.match(/^(.*?)\s*>>\s*(\S+)\s*$/);
    if (appendMatch) {
      const [, subCmd, targetFile] = appendMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      if (res.stdout) this.writeRedirectOutput(targetFile, res.stdout, true);
      return { stdout: '', stderr: res.stderr, exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    const overwriteMatch = cmdWithoutInput.match(/^(.*?)\s*>\s*(\S+)\s*$/);
    if (overwriteMatch) {
      const [, subCmd, targetFile] = overwriteMatch;
      const res = await this.executePipeline(subCmd.trim(), initialStdin);
      this.writeRedirectOutput(targetFile, res.stdout ? res.stdout : '', false);
      return { stdout: '', stderr: res.stderr, exitCode: res.exitCode, cwd: this.cwd, currentUser: this.currentUser };
    }

    return this.executePipeline(cmdWithoutInput, initialStdin);
  }

  private async executePipeline(line: string, initialStdin: string = ''): Promise<CommandResult> {
    const pipeCommands = this.splitTopLevel(line, '|').map(s => s.trim()).filter(Boolean);
    if (pipeCommands.length === 0) return { stdout: '', stderr: '', exitCode: 0 };

    let currentStdin = initialStdin;
    let lastResult: CommandResult = { stdout: '', stderr: '', exitCode: 0 };

    for (let i = 0; i < pipeCommands.length; i++) {
      const cmdStr = pipeCommands[i];
      const parsedArgs = this.parseArguments(cmdStr, true);
      lastResult = await this.dispatchCommand(parsedArgs, currentStdin);
      if (lastResult.exitCode !== 0 && i < pipeCommands.length - 1) {
        return lastResult;
      }
      currentStdin = lastResult.stdout;
    }

    this.lastExitCode = lastResult.exitCode;
    return lastResult;
  }

  // Tokenize arguments handling quotes, backslash escapes and environment
  // variable expansion. When allowGlob is set, unquoted tokens containing
  // wildcards (*, ?) are expanded against the virtual filesystem, like bash.
  private parseArguments(cmdLine: string, allowGlob: boolean = false): string[] {
    const out: string[] = [];
    const currentParts: { text: string; hadSingle: boolean; hadDouble: boolean }[] = [];

    let current = '';
    let sq = false;
    let dq = false;
    let hadSingle = false;
    let hadDouble = false;
    let started = false;

    const flush = () => {
      if (!started) return;
      currentParts.push({ text: current, hadSingle, hadDouble });
      current = '';
      started = false;
      hadSingle = false;
      hadDouble = false;
    };

    for (let i = 0; i < cmdLine.length; i++) {
      const c = cmdLine[i];

      if (c === '\\' && !sq && i + 1 < cmdLine.length) {
        started = true;
        // Backslash escaping: inside double quotes only for " \ $; otherwise any char
        current += cmdLine[i + 1];
        i++;
        continue;
      }

      if (c === "'" && !dq) {
        sq = !sq;
        hadSingle = true;
        started = true;
        continue;
      }

      if (c === '"' && !sq) {
        dq = !dq;
        hadDouble = true;
        started = true;
        continue;
      }

      if ((c === ' ' || c === '\t') && !sq && !dq) {
        flush();
        continue;
      }

      started = true;
      current += c;
    }

    flush();

    for (const tk of currentParts) {
      const isUnquoted = !tk.hadSingle && !tk.hadDouble;

      // Single quotes: never expand anything (bash semantics)
      if (tk.hadSingle) {
        out.push(tk.text);
        continue;
      }

      let value = this.expandVariables(tk.text);

      if (!isUnquoted) {
        out.push(value);
        continue;
      }

      if (value.startsWith('~')) value = this.expandTilde(value);

      if (allowGlob && (value.includes('*') || value.includes('?'))) {
        out.push(...this.expandGlobPattern(value));
        continue;
      }

      out.push(value);
    }

    return out;
  }

  private expandTilde(value: string): string {
    const home = this.users.get(this.currentUser)?.home || '/root';
    if (value === '~' || value.startsWith('~/')) {
      return home + value.slice(1);
    }
    // ~user is not supported — return unchanged
    return value;
  }

  private globSegmentToRegex(seg: string): string {
    let out = '';
    for (const c of seg) {
      if (c === '*') out += '[^/]*';
      else if (c === '?') out += '[^/]';
      else out += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
    return out;
  }

  // Expand a wildcard pattern like "test*.txt" or "/etc/*.conf" using the VFS.
  // Unquoted tokens only — matching bash behavior. Falls back to the literal
  // pattern when nothing matches.
  private expandGlobPattern(pattern: string): string[] {
    const isAbs = pattern.startsWith('/');

    interface GlobState { typed: string; base: string }
    let states: GlobState[] = [{ typed: isAbs ? '/' : '', base: isAbs ? '/' : this.cwd }];

    const segs = pattern.split('/');
    if (isAbs) segs.shift(); // drop empty leading element

    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      if (seg === '') continue;

      const next: GlobState[] = [];
      const hasWild = seg.includes('*') || seg.includes('?');

      for (const st of states) {
        if (hasWild) {
          const entries = this.vfs.readdir(st.base) ?? [];
          const rx = new RegExp(`^${this.globSegmentToRegex(seg)}$`);
          for (const e of entries) {
            if (e.name.startsWith('.') && !seg.startsWith('.')) continue;
            if (!rx.test(e.name)) continue;
            const typed = st.typed === '/' ? `/${e.name}` : (st.typed ? `${st.typed}/${e.name}` : e.name);
            const base = st.base === '/' ? `/${e.name}` : `${st.base}/${e.name}`;
            next.push({ typed, base });
          }
        } else {
          // Literal segment: must actually exist in the VFS
          const base = st.base === '/' ? `/${seg}` : `${st.base}/${seg}`;
          if (this.vfs.exists(base)) {
            const typed = st.typed === '/' ? `/${seg}` : (st.typed ? `${st.typed}/${seg}` : seg);
            next.push({ typed, base });
          }
        }
      }

      states = next;
      if (states.length === 0) break;
    }

    if (states.length === 0) return [pattern];

    const results: string[] = [];
    for (const st of states) {
      const abs = isAbs ? st.typed : this.vfs.resolvePath(this.cwd, st.typed);
      if (!this.vfs.exists(abs)) continue;
      if (!results.includes(st.typed)) results.push(st.typed);
    }

    return results.length > 0 ? results.sort((a, b) => a.localeCompare(b)) : [pattern];
  }

  private expandVariables(token: string): string {
    const withCmdSub = token
      .replace(/\$\(pwd\)/g, () => this.cwd)
      .replace(/\$\(pwd\s+-P\)/g, () => this.vfs.resolvePhysicalPath(this.cwd))
      .replace(/\$\(pwd\s+-L\)/g, () => this.cwd)
      .replace(/\$\(whoami\)/g, () => this.currentUser)
      .replace(/\$\(hostname\)/g, () => this.hostname);

    return withCmdSub.replace(/\$([A-Za-z0-9_?]+)/g, (_, varName) => {
      if (varName === '?') return this.lastExitCode.toString();
      if (varName === 'PWD') return this.cwd;
      if (varName === 'OLDPWD') return this.env.OLDPWD || this.cwd;
      if (varName === 'HOME') return this.env.HOME || (this.users.get(this.currentUser)?.home || '/root');
      if (varName === 'USER') return this.currentUser;
      if (varName === 'HOSTNAME') return this.hostname;
      if (varName === 'BASH_VERSION') return '5.1.8(1)-release (x86_64-centos-stream9-gnu)';
      return this.env[varName] ?? '';
    });
  }

  // Command dispatcher
  private async dispatchCommand(args: string[], stdin: string): Promise<CommandResult> {
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 0 };

    // Variable assignment: e.g. MY_VAR=hello
    if (args.length === 1 && args[0].includes('=') && !args[0].startsWith('=')) {
      const [k, ...vParts] = args[0].split('=');
      const val = vParts.join('=');
      this.env[k] = val;
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    let cmd = args[0];
    let cmdArgs = args.slice(1);

    // Expand aliases (unless invoked with leading backslash or quotes)
    if (this.aliases.has(cmd)) {
      const aliasVal = this.aliases.get(cmd)!;
      const parts = this.parseArguments(aliasVal);
      cmd = parts[0];
      cmdArgs = [...parts.slice(1), ...cmdArgs];
    }

    switch (cmd) {
      case 'pwd': return this.cmdPwd(cmdArgs);
      case 'cd': return this.cmdCd(cmdArgs);
      case 'ls': return this.cmdLs(cmdArgs);
      case 'ln': return this.cmdLn(cmdArgs);
      case 'realpath': return this.cmdRealpath(cmdArgs);
      case 'readlink': return this.cmdReadlink(cmdArgs);
      case 'mkdir': return this.cmdMkdir(cmdArgs);
      case 'touch': return this.cmdTouch(cmdArgs);
      case 'rm': return this.cmdRm(cmdArgs);
      case 'cp': return this.cmdCp(cmdArgs);
      case 'mv': return this.cmdMv(cmdArgs);
      case 'cat': return this.cmdCat(cmdArgs, stdin);
      case 'less':
      case 'more': return this.cmdLess(cmdArgs, stdin);
      case 'file': return this.cmdFile(cmdArgs);
      case 'whatis': return this.cmdWhatis(cmdArgs);
      case 'alias': return this.cmdAlias(cmdArgs);
      case 'unalias': return this.cmdUnalias(cmdArgs);
      case 'man': return this.cmdMan(cmdArgs);
      case 'head': return this.cmdHead(cmdArgs, stdin);
      case 'tail': return this.cmdTail(cmdArgs, stdin);
      case 'wc': return this.cmdWc(cmdArgs, stdin);
      case 'tee': return this.cmdTee(cmdArgs, stdin);
      case 'grep': return this.cmdGrep(cmdArgs, stdin);
      case 'cut': return this.cmdCut(cmdArgs, stdin);
      case 'sort': return this.cmdSort(cmdArgs, stdin);
      case 'uniq': return this.cmdUniq(cmdArgs, stdin);
      case 'awk': return this.cmdAwk(cmdArgs, stdin);
      case 'sed': return this.cmdSed(cmdArgs, stdin);
      case 'tr': return this.cmdTr(cmdArgs, stdin);
      case 'nl': return this.cmdNl(cmdArgs, stdin);
      case 'diff': return this.cmdDiff(cmdArgs);
      case 'find': return this.cmdFind(cmdArgs);
      case 'echo': return this.cmdEcho(cmdArgs);
      case 'chmod': return this.cmdChmod(cmdArgs);
      case 'chown': return this.cmdChown(cmdArgs);
      case 'chgrp': return this.cmdChgrp(cmdArgs);
      case 'useradd': return this.cmdUseradd(cmdArgs);
      case 'userdel': return this.cmdUserdel(cmdArgs);
      case 'groupadd': return this.cmdGroupadd(cmdArgs);
      case 'groupdel': return this.cmdGroupdel(cmdArgs);
      case 'usermod': return this.cmdUsermod(cmdArgs);
      case 'passwd': return this.cmdPasswd(cmdArgs);
      case 'id': return this.cmdId(cmdArgs);
      case 'whoami': return { stdout: this.currentUser, stderr: '', exitCode: 0 };
      case 'su': return this.cmdSu(cmdArgs);
      case 'sudo': return this.cmdSudo(cmdArgs, stdin);
      case 'systemctl': return this.cmdSystemctl(cmdArgs);
      case 'service': return this.cmdService(cmdArgs);
      case 'ps': return this.cmdPs(cmdArgs);
      case 'top': return this.cmdTop();
      case 'kill': return this.cmdKill(cmdArgs);
      case 'pkill': return this.cmdPkill(cmdArgs);
      case 'pgrep': return this.cmdPgrep(cmdArgs);
      case 'tty': return { stdout: '/dev/pts/0', stderr: '', exitCode: 0 };
      case 'sleep': return this.cmdSleep(cmdArgs);
      case 'nice': return this.cmdNice(cmdArgs);
      case 'renice': return this.cmdRenice(cmdArgs);
      case 'jobs': return this.cmdJobs();
      case 'bg': return this.cmdBg(cmdArgs);
      case 'fg': return this.cmdFg(cmdArgs);
      case 'crontab': return this.cmdCrontab(cmdArgs, stdin);
      case 'yum':
      case 'dnf': return this.cmdYum(cmdArgs);
      case 'rpm': return this.cmdRpm(cmdArgs);
      case 'hostnamectl': return this.cmdHostnamectl(cmdArgs);
      case 'hostname': return this.cmdHostname(cmdArgs);
      case 'ip': return this.cmdIp(cmdArgs);
      case 'ifconfig': return this.cmdIfconfig();
      case 'ping': return this.cmdPing(cmdArgs);
      case 'curl': return this.cmdCurl(cmdArgs);
      case 'wget': return this.cmdWget(cmdArgs);
      case 'nmcli': return this.cmdNmcli(cmdArgs);
      case 'journalctl': return this.cmdJournalctl(cmdArgs);
      case 'firewall-cmd': return this.cmdFirewallCmd(cmdArgs);
      case 'sestatus': return this.cmdSestatus();
      case 'getenforce': return this.cmdGetenforce();
      case 'setenforce': return this.cmdSetenforce(cmdArgs);
      case 'tree': return this.cmdTree(cmdArgs);
      case 'lscpu': return this.cmdLscpu();
      case 'lsblk': return this.cmdLsblk(cmdArgs);
      case 'tar': return this.cmdTar(cmdArgs);
      case 'gzip': return this.cmdGzip(cmdArgs);
      case 'gunzip': return this.cmdGunzip(cmdArgs);
      case 'export': return this.cmdExport(cmdArgs);
      case 'env': return this.cmdEnv();
      case 'netstat':
      case 'ss': return this.cmdNetstat();
      case 'df': return this.cmdDf(cmdArgs);
      case 'free': return this.cmdFree(cmdArgs);
      case 'uname': return this.cmdUname(cmdArgs);
      case 'uptime': return this.cmdUptime();
      case 'date': return this.cmdDate(cmdArgs);
      case 'clear': return { stdout: '\x1b[2J\x1b[H', stderr: '', exitCode: 0 };
      case 'history': return this.cmdHistory();
      case 'which': return this.cmdWhich(cmdArgs);
      case 'whereis': return this.cmdWhereis(cmdArgs);
      case 'vi':
      case 'vim':
      case 'nano': return this.cmdEditor(cmd, cmdArgs);
      case 'help': return this.cmdHelp(cmdArgs);
      case 'exit': return this.cmdExit();
      default:
        // Check if executable file in PATH or current dir
        return {
          stdout: '',
          stderr: `bash: ${cmd}: command not found...`,
          exitCode: 127,
        };
    }
  }

  // --- Command Implementations ---

  private cmdPwd(args: string[] = []): CommandResult {
    let physical = false;

    for (const arg of args) {
      if (arg === '--help') {
        return {
          stdout: `pwd: pwd [-LP]
    Print the name of the current working directory.

    Options:
      -L, --logical   print the value of $PWD if it names the current working
                      directory (default)
      -P, --physical  print the physical directory, without any symbolic links

    Exit Status:
    Returns 0 unless an invalid option is given or the current directory
    cannot be read.`,
          stderr: '',
          exitCode: 0,
        };
      }
      if (arg === '--version') {
        return {
          stdout: `pwd (GNU coreutils) 8.32
Copyright (C) 2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.`,
          stderr: '',
          exitCode: 0,
        };
      }
      if (arg === '-P' || arg === '--physical' || arg === '-LP') {
        physical = true;
      } else if (arg === '-L' || arg === '--logical' || arg === '-PL') {
        physical = false;
      } else if (arg.startsWith('-')) {
        return {
          stdout: '',
          stderr: `bash: pwd: ${arg}: invalid option\npwd: usage: pwd [-LP]`,
          exitCode: 2,
        };
      }
    }

    const outPath = physical ? this.vfs.resolvePhysicalPath(this.cwd) : this.cwd;
    return { stdout: outPath, stderr: '', exitCode: 0 };
  }

  private cmdCd(args: string[]): CommandResult {
    let physical = false;
    const positional: string[] = [];

    for (const arg of args) {
      if (arg === '-P') physical = true;
      else if (arg === '-L') physical = false;
      else positional.push(arg);
    }

    if (positional.length > 1) {
      return { stdout: '', stderr: 'bash: cd: too many arguments', exitCode: 1 };
    }

    let target = positional[0] || (this.users.get(this.currentUser)?.home || '/root');
    let printNewDir = false;

    if (target === '-') {
      target = this.env.OLDPWD || this.cwd;
      printNewDir = true;
    } else if (target === '~') {
      target = this.users.get(this.currentUser)?.home || '/root';
    } else if (target.startsWith('~/')) {
      target = (this.users.get(this.currentUser)?.home || '/root') + target.slice(1);
    }

    const resolvedLogical = this.vfs.resolvePath(this.cwd, target);
    const node = this.vfs.getNode(resolvedLogical);

    if (!node) {
      return { stdout: '', stderr: `bash: cd: ${target}: No such file or directory`, exitCode: 1 };
    }

    if (node.type !== 'dir') {
      return { stdout: '', stderr: `bash: cd: ${target}: Not a directory`, exitCode: 1 };
    }

    // Permission check
    const groups = this.getUserGroups(this.currentUser);
    if (!this.vfs.checkPermission(node, this.currentUser, groups, 'exec')) {
      return { stdout: '', stderr: `bash: cd: ${target}: Permission denied`, exitCode: 1 };
    }

    const nextCwd = physical ? this.vfs.resolvePhysicalPath(resolvedLogical) : resolvedLogical;
    this.env.OLDPWD = this.cwd;
    this.cwd = nextCwd;
    this.env.PWD = nextCwd;
    return { stdout: printNewDir ? this.cwd : '', stderr: '', exitCode: 0, cwd: this.cwd };
  }

  private cmdLn(args: string[]): CommandResult {
    let symbolic = false;
    let force = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('s')) symbolic = true;
        if (arg.includes('f')) force = true;
      } else {
        targets.push(arg);
      }
    }

    if (targets.length < 2) {
      return { stdout: '', stderr: 'ln: missing file operand\nTry \'ln --help\' for more information.', exitCode: 1 };
    }

    const [targetPath, linkArg] = targets;
    const resolvedLink = this.vfs.resolvePath(this.cwd, linkArg);

    if (this.vfs.getRawNode(resolvedLink)) {
      if (force) {
        this.vfs.unlink(resolvedLink);
      } else {
        return { stdout: '', stderr: `ln: failed to create ${symbolic ? 'symbolic ' : ''}link '${linkArg}': File exists`, exitCode: 1 };
      }
    }

    if (symbolic) {
      const ok = this.vfs.createSymlink(targetPath, resolvedLink);
      if (!ok) {
        return { stdout: '', stderr: `ln: failed to create symbolic link '${linkArg}': No such file or directory`, exitCode: 1 };
      }
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    const resolvedTarget = this.vfs.resolvePath(this.cwd, targetPath);
    const ok = this.vfs.copy(resolvedTarget, resolvedLink, false);
    if (!ok) {
      return { stdout: '', stderr: `ln: failed to access '${targetPath}': No such file or directory`, exitCode: 1 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdRealpath(args: string[]): CommandResult {
    const targets = args.filter(a => !a.startsWith('-'));
    if (targets.length === 0) {
      return { stdout: '', stderr: 'realpath: missing operand', exitCode: 1 };
    }
    const out: string[] = [];
    for (const t of targets) {
      const logical = this.vfs.resolvePath(this.cwd, t);
      out.push(this.vfs.resolvePhysicalPath(logical));
    }
    return { stdout: out.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdReadlink(args: string[]): CommandResult {
    const follow = args.some(a => a === '-f' || a === '-e' || a === '-m');
    const targets = args.filter(a => !a.startsWith('-'));
    if (targets.length === 0) {
      return { stdout: '', stderr: 'readlink: missing operand', exitCode: 1 };
    }
    const t = targets[0];
    const logical = this.vfs.resolvePath(this.cwd, t);
    if (follow) {
      return { stdout: this.vfs.resolvePhysicalPath(logical), stderr: '', exitCode: 0 };
    }
    const raw = this.vfs.getRawNode(logical);
    if (!raw || raw.type !== 'symlink' || !raw.target) {
      return { stdout: '', stderr: '', exitCode: 1 };
    }
    return { stdout: raw.target, stderr: '', exitCode: 0 };
  }

  private cmdLs(args: string[]): CommandResult {
    let showAll = false;
    let longFormat = false;
    let humanReadable = false;
    const paths: string[] = [];

    for (const arg of args) {
      if (arg.startsWith('--')) {
        if (arg === '--all') showAll = true;
        continue;
      }
      if (arg.startsWith('-')) {
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) longFormat = true;
        if (arg.includes('h')) humanReadable = true;
      } else {
        paths.push(arg);
      }
    }

    const targetPaths = paths.length > 0 ? paths : [this.cwd];
    let outputLines: string[] = [];
    let errorLines: string[] = [];

    for (let i = 0; i < targetPaths.length; i++) {
      const p = targetPaths[i];
      const resolved = this.vfs.resolvePath(this.cwd, p);
      const node = this.vfs.getNode(resolved);

      if (!node) {
        errorLines.push(`ls: cannot access '${p}': No such file or directory`);
        continue;
      }

      if (targetPaths.length > 1) {
        outputLines.push(`${p}:`);
      }

      if (node.type === 'file') {
        if (longFormat) {
          outputLines.push(this.formatLsLine(node, humanReadable));
        } else {
          outputLines.push(node.name);
        }
        continue;
      }

      // Directory
      const items = this.vfs.readdir(resolved) || [];
      const visibleItems = items.filter(it => showAll || !it.name.startsWith('.'));
      visibleItems.sort((a, b) => a.name.localeCompare(b.name));

      if (longFormat) {
        outputLines.push(`total ${visibleItems.length * 4}`);
        for (const item of visibleItems) {
          outputLines.push(this.formatLsLine(item, humanReadable));
        }
      } else {
        const names = visibleItems.map(it => {
          if (it.type === 'dir') return `\x1b[1;34m${it.name}\x1b[0m`;
          if (it.mode & 0o111) return `\x1b[1;32m${it.name}\x1b[0m`;
          return it.name;
        });
        outputLines.push(names.join('  '));
      }
    }

    return {
      stdout: outputLines.join('\n'),
      stderr: errorLines.join('\n'),
      exitCode: errorLines.length > 0 ? 2 : 0,
    };
  }

  private formatLsLine(node: any, human: boolean): string {
    const perm = VirtualFileSystem.modeToString(node.mode, node.type);
    const links = node.type === 'dir' ? 2 : 1;
    const owner = (node.owner || 'root').padEnd(8);
    const group = (node.group || 'root').padEnd(8);
    
    let sizeStr = node.size.toString();
    if (human) {
      if (node.size > 1024 * 1024) sizeStr = `${(node.size / (1024 * 1024)).toFixed(1)}M`;
      else if (node.size > 1024) sizeStr = `${(node.size / 1024).toFixed(1)}K`;
    }
    sizeStr = sizeStr.padStart(6);

    const date = node.mtime instanceof Date ? node.mtime : new Date();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const dateStr = `${month} ${day} ${hours}:${mins}`;

    let nameStr = node.name;
    if (node.type === 'dir') {
      nameStr = `\x1b[1;34m${node.name}\x1b[0m`;
    } else if (node.mode & 0o111) {
      nameStr = `\x1b[1;32m${node.name}\x1b[0m`;
    } else if (node.type === 'symlink') {
      nameStr = `\x1b[1;36m${node.name}\x1b[0m -> ${node.target}`;
    }

    return `${perm}  ${links} ${owner} ${group} ${sizeStr} ${dateStr} ${nameStr}`;
  }

  private cmdMkdir(args: string[]): CommandResult {
    let recursive = false;
    let mode: number | undefined;
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-p') recursive = true;
      else if (a === '-m' && i + 1 < args.length) {
        mode = parseInt(args[++i], 8);
      } else {
        targets.push(a);
      }
    }

    if (targets.length === 0) {
      return { stdout: '', stderr: 'mkdir: missing operand', exitCode: 1 };
    }

    for (const target of targets) {
      const resolved = this.vfs.resolvePath(this.cwd, target);
      if (this.vfs.exists(resolved)) {
        if (!recursive) {
          return { stdout: '', stderr: `mkdir: cannot create directory '${target}': File exists`, exitCode: 1 };
        }
        continue;
      }

      const success = this.vfs.mkdir(resolved, {
        recursive,
        mode: mode ?? 0o755,
        owner: this.currentUser,
        group: this.getUserPrimaryGroup(this.currentUser),
      });

      if (!success) {
        return { stdout: '', stderr: `mkdir: cannot create directory '${target}': No such file or directory`, exitCode: 1 };
      }
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdTouch(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: 'touch: missing file operand', exitCode: 1 };
    }

    for (const arg of args) {
      if (arg.startsWith('-')) continue;
      const resolved = this.vfs.resolvePath(this.cwd, arg);
      this.vfs.touch(resolved, {
        owner: this.currentUser,
        group: this.getUserPrimaryGroup(this.currentUser),
      });
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdRm(args: string[]): CommandResult {
    let recursive = false;
    let force = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('r') || arg.includes('R')) recursive = true;
        if (arg.includes('f')) force = true;
      } else {
        targets.push(arg);
      }
    }

    if (targets.length === 0) {
      return { stdout: '', stderr: 'rm: missing operand', exitCode: 1 };
    }

    for (const target of targets) {
      const resolved = this.vfs.resolvePath(this.cwd, target);
      const node = this.vfs.getNode(resolved);

      if (!node) {
        if (!force) {
          return { stdout: '', stderr: `rm: cannot remove '${target}': No such file or directory`, exitCode: 1 };
        }
        continue;
      }

      if (node.type === 'dir' && !recursive) {
        return { stdout: '', stderr: `rm: cannot remove '${target}': Is a directory`, exitCode: 1 };
      }

      this.vfs.rmRecursive(resolved);
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdCp(args: string[]): CommandResult {
    let recursive = false;
    const targets: string[] = [];

    for (const arg of args) {
      if (arg.startsWith('-')) {
        if (arg.includes('r') || arg.includes('R')) recursive = true;
      } else {
        targets.push(arg);
      }
    }

    if (targets.length < 2) {
      return { stdout: '', stderr: 'cp: missing file operand', exitCode: 1 };
    }

    const src = this.vfs.resolvePath(this.cwd, targets[0]);
    const dst = this.vfs.resolvePath(this.cwd, targets[1]);

    const success = this.vfs.copy(src, dst, recursive);
    if (!success) {
      return { stdout: '', stderr: `cp: cannot copy '${targets[0]}' to '${targets[1]}'`, exitCode: 1 };
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdMv(args: string[]): CommandResult {
    const targets = args.filter(a => !a.startsWith('-'));
    if (targets.length < 2) {
      return { stdout: '', stderr: 'mv: missing file operand', exitCode: 1 };
    }

    const src = this.vfs.resolvePath(this.cwd, targets[0]);
    const dst = this.vfs.resolvePath(this.cwd, targets[1]);

    const success = this.vfs.move(src, dst);
    if (!success) {
      return { stdout: '', stderr: `mv: cannot move '${targets[0]}' to '${targets[1]}'`, exitCode: 1 };
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdCat(args: string[], stdin: string): CommandResult {
    let showLineNumbers = false;
    const files: string[] = [];

    for (const arg of args) {
      if (arg === '-n') showLineNumbers = true;
      else if (!arg.startsWith('-')) files.push(arg);
    }

    if (files.length === 0) {
      // Print from stdin
      if (showLineNumbers) {
        const lines = stdin.split('\n').map((l, i) => `${(i + 1).toString().padStart(6)}  ${l}`);
        return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
      }
      return { stdout: stdin, stderr: '', exitCode: 0 };
    }

    let out = '';
    for (const f of files) {
      const resolved = this.vfs.resolvePath(this.cwd, f);
      const node = this.vfs.getNode(resolved);
      if (!node) {
        return { stdout: out, stderr: `cat: ${f}: No such file or directory`, exitCode: 1 };
      }

      const groups = this.getUserGroups(this.currentUser);
      if (!this.vfs.checkPermission(node, this.currentUser, groups, 'read')) {
        return { stdout: out, stderr: `cat: ${f}: Permission denied`, exitCode: 1 };
      }

      const content = this.vfs.readFile(resolved);
      if (content === null) {
        return { stdout: out, stderr: `cat: ${f}: No such file or directory`, exitCode: 1 };
      }
      out += content;
    }

    if (showLineNumbers) {
      const lines = out.split('\n').map((l, i) => `${(i + 1).toString().padStart(6)}  ${l}`);
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    }

    return { stdout: out.trimEnd(), stderr: '', exitCode: 0 };
  }

  private cmdHead(args: string[], stdin: string): CommandResult {
    let n = 10;
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && i + 1 < args.length) {
        n = parseInt(args[++i], 10);
      } else if (!args[i].startsWith('-')) {
        files.push(args[i]);
      }
    }

    let text = stdin;
    if (files.length > 0) {
      const resolved = this.vfs.resolvePath(this.cwd, files[0]);
      const node = this.vfs.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `head: cannot open '${files[0]}' for reading: No such file or directory`, exitCode: 1 };
      }
      const groups = this.getUserGroups(this.currentUser);
      if (!this.vfs.checkPermission(node, this.currentUser, groups, 'read')) {
        return { stdout: '', stderr: `head: cannot open '${files[0]}' for reading: Permission denied`, exitCode: 1 };
      }
      text = this.vfs.readFile(resolved) || '';
    }

    const lines = text.split('\n').slice(0, n);
    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdTail(args: string[], stdin: string): CommandResult {
    let n = 10;
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-n' && i + 1 < args.length) {
        n = parseInt(args[++i], 10);
      } else if (!args[i].startsWith('-')) {
        files.push(args[i]);
      }
    }

    let text = stdin;
    if (files.length > 0) {
      const resolved = this.vfs.resolvePath(this.cwd, files[0]);
      const node = this.vfs.getNode(resolved);
      if (!node) {
        return { stdout: '', stderr: `tail: cannot open '${files[0]}' for reading: No such file or directory`, exitCode: 1 };
      }
      const groups = this.getUserGroups(this.currentUser);
      if (!this.vfs.checkPermission(node, this.currentUser, groups, 'read')) {
        return { stdout: '', stderr: `tail: cannot open '${files[0]}' for reading: Permission denied`, exitCode: 1 };
      }
      text = this.vfs.readFile(resolved) || '';
    }

    const lines = text.split('\n');
    const selected = lines.slice(Math.max(0, lines.length - n));
    return { stdout: selected.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdWc(args: string[], stdin: string): CommandResult {
    let countLines = false;
    let countWords = false;
    let countBytes = false;
    const files: string[] = [];

    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('l')) countLines = true;
        if (a.includes('w')) countWords = true;
        if (a.includes('c')) countBytes = true;
      } else {
        files.push(a);
      }
    }

    if (!countLines && !countWords && !countBytes) {
      countLines = true;
      countWords = true;
      countBytes = true;
    }

    const text = files.length > 0
      ? (this.vfs.readFile(this.vfs.resolvePath(this.cwd, files[0])) || '')
      : stdin;

    // POSIX wc -l counts NEWLINE characters. Our internal stdout loses the
    // final trailing newline, so count it back to stay accurate both for
    // piped input (no trailing wipe) and for real files (trailing \n).
    const lines = text === '' ? 0 : ((text.match(/\n/g)?.length ?? 0) + (text.endsWith('\n') ? 0 : 1));
    const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const bytes = text ? new TextEncoder().encode(text).length : 0;

    const parts: string[] = [];
    if (countLines) parts.push(lines.toString().padStart(7));
    if (countWords) parts.push(words.toString().padStart(7));
    if (countBytes) parts.push(bytes.toString().padStart(7));
    if (files.length > 0) parts.push(files[0]);

    return { stdout: parts.join(' '), stderr: '', exitCode: 0 };
  }

  private cmdTee(args: string[], stdin: string): CommandResult {
    let append = false;
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-a' || a === '--append') {
        append = true;
      } else if (!a.startsWith('-')) {
        files.push(a);
      }
    }

    const contentToWrite = stdin ? (stdin.endsWith('\n') ? stdin : stdin + '\n') : '';
    for (const f of files) {
      const resolved = this.vfs.resolvePath(this.cwd, f);
      this.vfs.writeFile(resolved, contentToWrite, { append });
    }

    return { stdout: stdin, stderr: '', exitCode: 0 };
  }

  private cmdGrep(args: string[], stdin: string): CommandResult {
    let ignoreCase = false;
    let invertMatch = false;
    let showLineNum = false;
    let countOnly = false;
    let pattern = '';
    const files: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith('--')) {
        if (a === '--ignore-case') ignoreCase = true;
        else if (a === '--invert-match') invertMatch = true;
        else if (a === '--line-number') showLineNum = true;
        else if (a === '--count') countOnly = true;
        // Ignore flags like --color, --color=auto, --color=always
        continue;
      }
      if (a.startsWith('-')) {
        if (a.includes('i')) ignoreCase = true;
        if (a.includes('v')) invertMatch = true;
        if (a.includes('n')) showLineNum = true;
        if (a.includes('c')) countOnly = true;
      } else if (!pattern) {
        pattern = a;
      } else {
        files.push(a);
      }
    }

    if (!pattern) {
      return { stdout: '', stderr: 'Usage: grep [OPTION]... PATTERN [FILE]...', exitCode: 2 };
    }

    let text = stdin;
    if (files.length > 0) {
      const resolved = this.vfs.resolvePath(this.cwd, files[0]);
      const fileContent = this.vfs.readFile(resolved);
      if (fileContent === null) {
        return { stdout: '', stderr: `grep: ${files[0]}: No such file or directory`, exitCode: 2 };
      }
      text = fileContent;
    }

    const regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    const lines = text.split('\n');
    const matched: string[] = [];

    lines.forEach((line, index) => {
      const isMatch = regex.test(line);
      const satisfies = invertMatch ? !isMatch : isMatch;
      if (satisfies) {
        if (showLineNum) {
          matched.push(`${index + 1}:${line}`);
        } else {
          matched.push(line);
        }
      }
    });

    if (countOnly) {
      return { stdout: matched.length.toString(), stderr: '', exitCode: 0 };
    }

    if (matched.length === 0) {
      return { stdout: '', stderr: '', exitCode: 1 };
    }

    return { stdout: matched.join('\n'), stderr: '', exitCode: 0 };
  }

  private commandInput(args: string[], stdin: string, skipFlags = true): { text: string; files: string[] } {
    const files = args.filter(a => !skipFlags || !a.startsWith('-'));
    if (files.length === 0) return { text: stdin, files };
    const chunks: string[] = [];
    for (const file of files) {
      const path = this.vfs.resolvePath(this.cwd, file);
      const content = this.vfs.readFile(path);
      if (content === null) return { text: '', files: [file] };
      chunks.push(content);
    }
    return { text: chunks.join('\n'), files };
  }

  private cmdCut(args: string[], stdin: string): CommandResult {
    let delimiter = '\t';
    let fieldSpec = '';
    let suppressNoDelimiter = false;
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if ((a === '-d' || a === '--delimiter') && args[i + 1]) delimiter = args[++i];
      else if (a.startsWith('-d') && a.length > 2) delimiter = a.slice(2);
      else if ((a === '-f' || a === '--fields') && args[i + 1]) fieldSpec = args[++i];
      else if (a.startsWith('-f') && a.length > 2) fieldSpec = a.slice(2);
      else if (a === '-s' || a === '--only-delimited') suppressNoDelimiter = true;
      else if (!a.startsWith('-')) files.push(a);
    }
    if (!fieldSpec || delimiter.length !== 1) return { stdout: '', stderr: 'cut: you must specify a list of bytes, characters, or fields', exitCode: 1 };
    const text = files.length ? this.commandInput(files, stdin, false).text : stdin;
    if (files.length && text === '' && this.vfs.readFile(this.vfs.resolvePath(this.cwd, files[0])) === null) {
      return { stdout: '', stderr: `cut: ${files[0]}: No such file or directory`, exitCode: 1 };
    }
    const selected = new Set<number>();
    for (const part of fieldSpec.split(',')) {
      const match = part.match(/^(\d*)-(\d*)$/);
      if (match) {
        const from = match[1] ? Number(match[1]) : 1;
        const to = match[2] ? Number(match[2]) : Number.MAX_SAFE_INTEGER;
        for (let n = from; n <= Math.min(to, from + 1000); n++) selected.add(n);
      } else if (/^\d+$/.test(part)) selected.add(Number(part));
    }
    const output = text.split('\n').map(line => {
      const fields = line.split(delimiter);
      if (!line.includes(delimiter)) return suppressNoDelimiter ? '' : line;
      return fields.filter((_f, i) => selected.has(i + 1)).join(delimiter);
    });
    return { stdout: output.join('\n').replace(/\n$/, ''), stderr: '', exitCode: 0 };
  }

  private cmdSort(args: string[], stdin: string): CommandResult {
    let reverse = false;
    let numeric = false;
    let ignoreCase = false;
    let unique = false;
    let delimiter = '';
    let keyField = 1;
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-r' || a === '--reverse') reverse = true;
      else if (a === '-n' || a === '--numeric-sort') numeric = true;
      else if (a === '-f' || a === '--ignore-case') ignoreCase = true;
      else if (a === '-u' || a === '--unique') unique = true;
      else if ((a === '-t' || a === '--field-separator') && args[i + 1]) delimiter = args[++i];
      else if (a.startsWith('-t') && a.length > 2) delimiter = a.slice(2);
      else if ((a === '-k' || a === '--key') && args[i + 1]) keyField = parseInt(args[++i].split(',')[0], 10) || 1;
      else if (a.startsWith('-k') && a.length > 2) keyField = parseInt(a.slice(2).split(',')[0], 10) || 1;
      else if (!a.startsWith('-')) files.push(a);
    }
    const input = files.length ? this.commandInput(files, stdin, false) : { text: stdin, files: [] };
    if (files.length && input.text === '' && this.vfs.readFile(this.vfs.resolvePath(this.cwd, files[0])) === null) {
      return { stdout: '', stderr: `sort: ${files[0]}: No such file or directory`, exitCode: 2 };
    }
    const lines = input.text.split('\n');
    if (lines.at(-1) === '') lines.pop();
    const field = (line: string) => (delimiter ? line.split(delimiter)[keyField - 1] ?? '' : line.split(/\s+/)[keyField - 1] ?? '');
    lines.sort((a, b) => {
      const av = field(a);
      const bv = field(b);
      let cmp = numeric ? (parseFloat(av) || 0) - (parseFloat(bv) || 0) : av.localeCompare(bv, undefined, { sensitivity: ignoreCase ? 'base' : 'variant' });
      if (!numeric && keyField === 1 && !delimiter) cmp = a.localeCompare(b, undefined, { sensitivity: ignoreCase ? 'base' : 'variant' });
      return reverse ? -cmp : cmp;
    });
    const result = unique ? lines.filter((line, i) => i === 0 || line !== lines[i - 1]) : lines;
    return { stdout: result.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdUniq(args: string[], stdin: string): CommandResult {
    let count = false;
    let duplicates = false;
    let unique = false;
    let ignoreCase = false;
    const files = args.filter(a => {
      if (a === '-c' || a === '--count') count = true;
      else if (a === '-d' || a === '--repeated') duplicates = true;
      else if (a === '-u' || a === '--unique') unique = true;
      else if (a === '-i' || a === '--ignore-case') ignoreCase = true;
      else return !a.startsWith('-');
      return false;
    });
    const input = files.length ? this.commandInput(files, stdin, false) : { text: stdin, files: [] };
    if (files.length && input.text === '' && this.vfs.readFile(this.vfs.resolvePath(this.cwd, files[0])) === null) {
      return { stdout: '', stderr: `uniq: ${files[0]}: No such file or directory`, exitCode: 1 };
    }
    const lines = input.text.split('\n');
    if (lines.at(-1) === '') lines.pop();
    const groups: { line: string; count: number }[] = [];
    for (const line of lines) {
      const last = groups.at(-1);
      const equal = last && (ignoreCase ? last.line.toLowerCase() === line.toLowerCase() : last.line === line);
      if (equal) last.count++;
      else groups.push({ line, count: 1 });
    }
    const output = groups.filter(g => (!duplicates || g.count > 1) && (!unique || g.count === 1))
      .map(g => count ? `${g.count.toString().padStart(7)} ${g.line}` : g.line);
    return { stdout: output.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdAwk(args: string[], stdin: string): CommandResult {
    let fs = ' ';
    const programParts: string[] = [];
    const files: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-F' && args[i + 1]) fs = args[++i];
      else if (args[i].startsWith('-F') && args[i].length > 2) fs = args[i].slice(2);
      else if (!programParts.length) programParts.push(args[i]);
      else if (!args[i].startsWith('-')) files.push(args[i]);
    }
    const program = programParts.join(' ');
    if (!program) return { stdout: '', stderr: 'awk: program is missing', exitCode: 2 };
    const text = files.length ? this.commandInput(files, stdin, false).text : stdin;
    const body = program.replace(/^\s*\{/, '').replace(/\}\s*$/, '').trim();
    const statements = body.split(';').map(s => s.trim()).filter(Boolean);
    const output: string[] = [];
    const lines = text.split('\n');
    if (lines.at(-1) === '') lines.pop();
    const runStatements = (line: string, nr: number) => {
      const fields = fs === ' ' ? line.trim().split(/\s+/) : line.split(fs);
      const record = (index: number) => index === 0 ? line : index < 0 ? fields[fields.length + index] ?? '' : fields[index - 1] ?? '';
      for (const statement of statements) {
        if (statement.startsWith('print ')) {
          const expr = statement.slice(6).trim();
          const parts = expr.split(/\s*,\s*/).map(part => {
            const p = part.trim();
            if (p === '$0') return line;
            if (p === 'NR') return nr.toString();
            const fm = p.match(/^\$NF$/);
            if (fm) return record(-1);
            const fieldMatch = p.match(/^\$(\d+)$/);
            if (fieldMatch) return record(Number(fieldMatch[1]));
            if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) return p.slice(1, -1);
            return p;
          });
          output.push(parts.join(' '));
        } else if (statement === 'print') output.push(line);
        else if (statement.startsWith('printf ')) {
          const m = statement.match(/^printf\s+(['"])(.*?)\1\s*,?\s*(.*)$/);
          if (m) {
            const value = m[3].replace(/\$0|\$(\d+)|NR/g, (token, n) => token === 'NR' ? nr.toString() : record(n === undefined ? 0 : Number(n)));
            output.push(m[2].replace(/\\n/g, '\n').replace(/%s|%d/, value));
          }
        }
      }
    };
    lines.forEach((line, i) => runStatements(line, i + 1));
    return { stdout: output.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdSed(args: string[], stdin: string): CommandResult {
    const quiet = args.includes('-n');
    const expr = args.find(a => !a.startsWith('-') && (/^[0-9]*[dps]/.test(a) || /^[0-9]*s./.test(a)));
    const file = args.find(a => !a.startsWith('-') && a !== expr);
    const text = file ? this.vfs.readFile(this.vfs.resolvePath(this.cwd, file)) : stdin;
    if (text === null) return { stdout: '', stderr: `sed: can't read ${file}: No such file or directory`, exitCode: 2 };
    if (!expr) return { stdout: text, stderr: '', exitCode: 0 };
    const lines = text.split('\n');
    if (lines.at(-1) === '') lines.pop();
    const output: string[] = [];
    const subst = expr.match(/^s(.)(.*?)\1(.*?)\1([gip]*)$/);
    const addrCmd = expr.match(/^(\d+)?([dp])$/);
    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      if (addrCmd && addrCmd[1] && Number(addrCmd[1]) !== lineNo) {
        output.push(lines[i]);
        continue;
      }
      if (addrCmd?.[2] === 'd' && (!addrCmd[1] || Number(addrCmd[1]) === lineNo)) continue;
      let line = lines[i];
      if (subst) {
        const [, , pattern, replacement, flags] = subst;
        try { line = line.replace(new RegExp(pattern, flags.includes('i') ? 'i' : ''), replacement.replace(/\\([0-9])/g, '$$$1')); }
        catch { return { stdout: '', stderr: `sed: invalid regular expression`, exitCode: 1 }; }
      }
      if (!quiet || expr.endsWith('p') || addrCmd?.[2] === 'p') output.push(line);
    }
    return { stdout: output.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdTr(args: string[], stdin: string): CommandResult {
    const deleteMode = args.includes('-d');
    const squeeze = args.includes('-s');
    const sets = args.filter(a => !a.startsWith('-'));
    if (!sets.length || (!deleteMode && sets.length < 2)) return { stdout: '', stderr: 'tr: missing operand', exitCode: 1 };
    const expand = (set: string) => {
      const chars: string[] = [];
      for (let i = 0; i < set.length; i++) {
        if (set[i + 1] === '-' && set[i + 2]) {
          for (let code = set.charCodeAt(i); code <= set.charCodeAt(i + 2); code++) chars.push(String.fromCharCode(code));
          i += 2;
        } else chars.push(set[i]);
      }
      return chars;
    };
    const from = expand(sets[0]);
    const to = expand(sets[1] ?? '');
    let output = [...stdin].map(c => {
      const index = from.indexOf(c);
      if (index < 0) return c;
      if (deleteMode) return '';
      return to[Math.min(index, Math.max(0, to.length - 1))] ?? c;
    }).join('');
    if (squeeze) {
      const squeezeSet = deleteMode ? from : to;
      for (const c of squeezeSet) output = output.replace(new RegExp(`${c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}{2,}`, 'g'), c);
    }
    return { stdout: output, stderr: '', exitCode: 0 };
  }

  private cmdNl(args: string[], stdin: string): CommandResult {
    const file = args.find(a => !a.startsWith('-'));
    const text = file ? this.vfs.readFile(this.vfs.resolvePath(this.cwd, file)) : stdin;
    if (text === null) return { stdout: '', stderr: `nl: ${file}: No such file or directory`, exitCode: 1 };
    const widthArg = args.find(a => a.startsWith('-w'));
    const width = widthArg ? parseInt(widthArg.slice(2), 10) || 6 : 6;
    const lines = text.split('\n');
    if (lines.at(-1) === '') lines.pop();
    let number = 1;
    return { stdout: lines.map(line => line ? `${(number++).toString().padStart(width)}\t${line}` : `\t${line}`).join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdDiff(args: string[]): CommandResult {
    const files = args.filter(a => !a.startsWith('-'));
    if (files.length < 2) return { stdout: '', stderr: 'diff: missing operand', exitCode: 2 };
    const a = this.vfs.readFile(this.vfs.resolvePath(this.cwd, files[0]));
    const b = this.vfs.readFile(this.vfs.resolvePath(this.cwd, files[1]));
    if (a === null || b === null) return { stdout: '', stderr: `diff: ${a === null ? files[0] : files[1]}: No such file or directory`, exitCode: 2 };
    if (a === b) return { stdout: '', stderr: '', exitCode: 0 };
    const left = a.split('\n');
    const right = b.split('\n');
    const output = [`--- ${files[0]}`, `+++ ${files[1]}`];
    for (let i = 0; i < Math.max(left.length, right.length); i++) {
      if (left[i] === right[i]) continue;
      if (left[i] !== undefined) output.push(`-${left[i]}`);
      if (right[i] !== undefined) output.push(`+${right[i]}`);
    }
    return { stdout: output.join('\n'), stderr: '', exitCode: 1 };
  }

  private cmdFind(args: string[]): CommandResult {
    let searchPath = this.cwd;
    let namePattern: string | null = null;
    let typeFilter: string | null = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-name' && i + 1 < args.length) {
        namePattern = args[++i].replace(/\*/g, '.*');
      } else if (args[i] === '-type' && i + 1 < args.length) {
        typeFilter = args[++i]; // 'f' or 'd'
      } else if (!args[i].startsWith('-')) {
        searchPath = this.vfs.resolvePath(this.cwd, args[i]);
      }
    }

    const results: string[] = [];
    const traverse = (currentPath: string) => {
      const node = this.vfs.getNode(currentPath);
      if (!node) return;

      let match = true;
      if (namePattern && !new RegExp(`^${namePattern}$`).test(node.name || currentPath)) {
        match = false;
      }
      if (typeFilter === 'f' && node.type !== 'file') match = false;
      if (typeFilter === 'd' && node.type !== 'dir') match = false;

      if (match) {
        results.push(currentPath);
      }

      if (node.type === 'dir' && node.children) {
        for (const [childName, _] of node.children) {
          const childPath = currentPath === '/' ? `/${childName}` : `${currentPath}/${childName}`;
          traverse(childPath);
        }
      }
    };

    traverse(searchPath);
    return { stdout: results.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdEcho(args: string[]): CommandResult {
    let interpretEscapes = false;
    const words: string[] = [];
    for (const a of args) {
      if (a === '-n') continue;
      else if (a === '-e') interpretEscapes = true;
      else if (a === '-E' || a === '--help' || a === '--version') { /* accepted, no behavior change */ }
      else words.push(a);
    }

    let text = words.join(' ');
    if (interpretEscapes) {
      const escapeMap: Record<string, string> = {
        '\\': '\\',
        a: '\x07', b: '\x08', e: '\x1b', f: '\x0c', n: '\n', r: '\r', t: '\t', v: '\x0b',
      };
      text = text.replace(/\\(x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{1,4}|[\\abefnrtv])/g, (_m, spec) => {
        if (spec === 'c') return '';
        if (spec.startsWith('x') || spec.startsWith('u')) {
          const code = parseInt(spec.slice(1), 16);
          return Number.isNaN(code) ? '' : String.fromCharCode(code);
        }
        return escapeMap[spec[0]] ?? spec;
      });
    }

    return { stdout: text, stderr: '', exitCode: 0 };
  }

  private cmdChmod(args: string[]): CommandResult {
    let recursive = false;
    let mode = '';
    const targets: string[] = [];

    for (const a of args) {
      if (a === '-R') recursive = true;
      else if (!mode) mode = a;
      else targets.push(a);
    }

    if (!mode || targets.length === 0) {
      return { stdout: '', stderr: 'chmod: missing operand', exitCode: 1 };
    }

    for (const target of targets) {
      const resolved = this.vfs.resolvePath(this.cwd, target);
      if (!this.vfs.exists(resolved)) {
        return { stdout: '', stderr: `chmod: cannot access '${target}': No such file or directory`, exitCode: 1 };
      }
      this.vfs.chmod(resolved, mode, recursive);
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdChown(args: string[]): CommandResult {
    let recursive = false;
    let ownerSpec = '';
    const targets: string[] = [];

    for (const a of args) {
      if (a === '-R') recursive = true;
      else if (!ownerSpec) ownerSpec = a;
      else targets.push(a);
    }

    if (!ownerSpec || targets.length === 0) {
      return { stdout: '', stderr: 'chown: missing operand', exitCode: 1 };
    }

    let [user, group] = ownerSpec.includes(':') ? ownerSpec.split(':') : [ownerSpec, undefined];
    if (ownerSpec.includes('.') && !group) {
      [user, group] = ownerSpec.split('.');
    }

    for (const target of targets) {
      const resolved = this.vfs.resolvePath(this.cwd, target);
      if (!this.vfs.exists(resolved)) {
        return { stdout: '', stderr: `chown: cannot access '${target}': No such file or directory`, exitCode: 1 };
      }
      this.vfs.chown(resolved, user, group, recursive);
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdChgrp(args: string[]): CommandResult {
    let recursive = false;
    let group = '';
    const targets: string[] = [];

    for (const a of args) {
      if (a === '-R') recursive = true;
      else if (!group) group = a;
      else targets.push(a);
    }

    if (!group || targets.length === 0) {
      return { stdout: '', stderr: 'chgrp: missing operand', exitCode: 1 };
    }

    for (const target of targets) {
      const resolved = this.vfs.resolvePath(this.cwd, target);
      if (!this.vfs.exists(resolved)) {
        return { stdout: '', stderr: `chgrp: cannot access '${target}': No such file or directory`, exitCode: 1 };
      }
      const node = this.vfs.getNode(resolved);
      if (node) {
        this.vfs.chown(resolved, node.owner, group, recursive);
      }
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdUseradd(args: string[]): CommandResult {
    let username = '';
    let home = '';
    let shell = '/bin/bash';
    let group = '';
    let extraGroups: string[] = [];
    let createHome = true;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-m') createHome = true;
      else if (args[i] === '-M') createHome = false;
      else if (args[i] === '-s' && i + 1 < args.length) shell = args[++i];
      else if (args[i] === '-d' && i + 1 < args.length) home = args[++i];
      else if (args[i] === '-g' && i + 1 < args.length) group = args[++i];
      else if (args[i] === '-G' && i + 1 < args.length) extraGroups = args[++i].split(',');
      else if (!username) username = args[i];
    }

    if (!username) {
      return { stdout: '', stderr: 'useradd: missing username', exitCode: 1 };
    }

    if (this.users.has(username)) {
      return { stdout: '', stderr: `useradd: user '${username}' already exists`, exitCode: 9 };
    }

    // Auto assign UID
    const maxUid = Math.max(1000, ...Array.from(this.users.values()).map(u => u.uid));
    const newUid = maxUid + 1;
    const userHome = home || `/home/${username}`;

    // Auto create user's primary group if not specified
    let gid = newUid;
    if (group && this.groups.has(group)) {
      gid = this.groups.get(group)!.gid;
    } else {
      this.groups.set(username, { gid: newUid, name: username, members: [username] });
    }

    const newUser: LinuxUser = {
      uid: newUid,
      username,
      gid,
      home: userHome,
      shell,
    };
    this.users.set(username, newUser);

    // Add to extra groups
    for (const gName of extraGroups) {
      const g = this.groups.get(gName);
      if (g && !g.members.includes(username)) {
        g.members.push(username);
      }
    }

    // Update /etc/passwd and /etc/group
    this.vfs.writeFile('/etc/passwd', `${username}:x:${newUid}:${gid}::${userHome}:${shell}\n`, { append: true });

    // Create home directory
    if (createHome) {
      this.vfs.mkdir(userHome, { recursive: true, mode: 0o700, owner: username, group: username });
      this.vfs.writeFile(`${userHome}/.bashrc`, '# .bashrc\n', { owner: username, group: username });
      this.vfs.writeFile(`${userHome}/.bash_profile`, '# .bash_profile\n', { owner: username, group: username });
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdUserdel(args: string[]): CommandResult {
    let removeHome = false;
    let username = '';

    for (const a of args) {
      if (a === '-r') removeHome = true;
      else if (!username) username = a;
    }

    if (!username || !this.users.has(username)) {
      return { stdout: '', stderr: `userdel: user '${username}' does not exist`, exitCode: 6 };
    }

    const user = this.users.get(username)!;
    if (removeHome && user.home) {
      this.vfs.rmRecursive(user.home);
    }

    this.users.delete(username);
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdGroupadd(args: string[]): CommandResult {
    const groupname = args.find(a => !a.startsWith('-'));
    if (!groupname) {
      return { stdout: '', stderr: 'groupadd: missing group name', exitCode: 1 };
    }

    if (this.groups.has(groupname)) {
      return { stdout: '', stderr: `groupadd: group '${groupname}' already exists`, exitCode: 9 };
    }

    const maxGid = Math.max(1000, ...Array.from(this.groups.values()).map(g => g.gid));
    const newGid = maxGid + 1;
    this.groups.set(groupname, { gid: newGid, name: groupname, members: [] });
    this.vfs.writeFile('/etc/group', `${groupname}:x:${newGid}:\n`, { append: true });

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdGroupdel(args: string[]): CommandResult {
    const groupname = args.find(a => !a.startsWith('-'));
    if (!groupname || !this.groups.has(groupname)) {
      return { stdout: '', stderr: `groupdel: group '${groupname}' does not exist`, exitCode: 6 };
    }
    this.groups.delete(groupname);
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdUsermod(args: string[]): CommandResult {
    let username = '';
    let appendGroups: string[] = [];
    let setGroup = '';
    let newShell = '';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-aG' && i + 1 < args.length) {
        appendGroups = args[++i].split(',');
      } else if (args[i] === '-g' && i + 1 < args.length) {
        setGroup = args[++i];
      } else if (args[i] === '-s' && i + 1 < args.length) {
        newShell = args[++i];
      } else if (!args[i].startsWith('-')) {
        username = args[i];
      }
    }

    if (!username || !this.users.has(username)) {
      return { stdout: '', stderr: `usermod: user '${username}' does not exist`, exitCode: 6 };
    }

    const user = this.users.get(username)!;
    if (newShell) user.shell = newShell;

    if (setGroup && this.groups.has(setGroup)) {
      user.gid = this.groups.get(setGroup)!.gid;
    }

    for (const gName of appendGroups) {
      const g = this.groups.get(gName);
      if (g && !g.members.includes(username)) {
        g.members.push(username);
      }
    }

    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdPasswd(args: string[]): CommandResult {
    const user = args[0] || this.currentUser;
    if (!this.users.has(user)) {
      return { stdout: '', stderr: `passwd: user '${user}' does not exist`, exitCode: 1 };
    }
    return { stdout: `Changing password for user ${user}.\npasswd: all authentication tokens updated successfully.`, stderr: '', exitCode: 0 };
  }

  private cmdId(args: string[]): CommandResult {
    const targetUser = args[0] || this.currentUser;
    const user = this.users.get(targetUser);

    if (!user) {
      return { stdout: '', stderr: `id: '${targetUser}': no such user`, exitCode: 1 };
    }

    const primaryGrp = Array.from(this.groups.values()).find(g => g.gid === user.gid);
    const grpName = primaryGrp ? primaryGrp.name : targetUser;

    const allGroups = Array.from(this.groups.values()).filter(g => g.members.includes(targetUser) || g.gid === user.gid);
    const groupStr = allGroups.map(g => `${g.gid}(${g.name})`).join(',');

    return {
      stdout: `uid=${user.uid}(${user.username}) gid=${user.gid}(${grpName}) groups=${groupStr}`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdSu(args: string[]): CommandResult {
    let target = 'root';
    for (const a of args) {
      if (a !== '-') target = a;
    }

    if (!this.users.has(target)) {
      return { stdout: '', stderr: `su: user ${target} does not exist`, exitCode: 1 };
    }

    this.currentUser = target;
    const user = this.users.get(target)!;
    this.cwd = user.home;
    this.env.USER = target;
    this.env.HOME = user.home;

    return { stdout: '', stderr: '', exitCode: 0, cwd: this.cwd, currentUser: this.currentUser };
  }

  private async cmdSudo(args: string[], stdin: string): Promise<CommandResult> {
    if (args.length === 0) {
      return { stdout: '', stderr: 'usage: sudo command...', exitCode: 1 };
    }

    // Check if user in wheel group or is root
    const userGroups = this.getUserGroups(this.currentUser);
    if (this.currentUser !== 'root' && !userGroups.includes('wheel')) {
      return { stdout: '', stderr: `${this.currentUser} is not in the sudoers file. This incident will be reported.`, exitCode: 1 };
    }

    const originalUser = this.currentUser;
    this.currentUser = 'root';
    const res = await this.dispatchCommand(args, stdin);
    this.currentUser = originalUser;
    return res;
  }

  private cmdSystemctl(args: string[]): CommandResult {
    const action = args[0];
    const serviceName = args[1]?.endsWith('.service') ? args[1] : `${args[1]}.service`;

    if (!action) {
      // List units
      const lines = ['UNIT                     LOAD   ACTIVE SUB     DESCRIPTION'];
      this.services.forEach(s => {
        const sub = s.activeState === 'active' ? 'running' : 'dead';
        lines.push(`${s.name.padEnd(24)} loaded ${s.activeState.padEnd(6)} ${sub.padEnd(7)} ${s.description}`);
      });
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    }

    if (!serviceName || !args[1]) {
      return { stdout: '', stderr: 'systemctl: missing service name', exitCode: 1 };
    }

    const svc = this.services.get(serviceName);
    if (!svc) {
      return { stdout: '', stderr: `Failed to ${action} ${serviceName}: Unit ${serviceName} not found.`, exitCode: 1 };
    }

    switch (action) {
      case 'start':
        svc.activeState = 'active';
        svc.mainPid = Math.floor(Math.random() * 2000) + 1000;
        this.processes.push({
          pid: svc.mainPid,
          ppid: 1,
          user: 'root',
          cpu: 0.1,
          mem: 0.8,
          vsz: 132400,
          rss: 4200,
          tty: '?',
          stat: 'Ss',
          start: '12:00',
          time: '0:00',
          command: svc.execStart,
        });
        return { stdout: '', stderr: '', exitCode: 0 };

      case 'stop':
        svc.activeState = 'inactive';
        if (svc.mainPid) {
          this.processes = this.processes.filter(p => p.pid !== svc.mainPid);
          svc.mainPid = undefined;
        }
        return { stdout: '', stderr: '', exitCode: 0 };

      case 'restart':
        svc.activeState = 'active';
        svc.mainPid = Math.floor(Math.random() * 2000) + 1000;
        return { stdout: '', stderr: '', exitCode: 0 };

      case 'enable':
        svc.unitFileState = 'enabled';
        this.vfs.createSymlink(`/usr/lib/systemd/system/${serviceName}`, `/etc/systemd/system/multi-user.target.wants/${serviceName}`);
        return { stdout: `Created symlink from /etc/systemd/system/multi-user.target.wants/${serviceName} to /usr/lib/systemd/system/${serviceName}.`, stderr: '', exitCode: 0 };

      case 'disable':
        svc.unitFileState = 'disabled';
        this.vfs.unlink(`/etc/systemd/system/multi-user.target.wants/${serviceName}`);
        return { stdout: `Removed symlink /etc/systemd/system/multi-user.target.wants/${serviceName}.`, stderr: '', exitCode: 0 };

      case 'is-active':
        return { stdout: svc.activeState, stderr: '', exitCode: svc.activeState === 'active' ? 0 : 3 };

      case 'is-enabled':
        return { stdout: svc.unitFileState, stderr: '', exitCode: svc.unitFileState === 'enabled' ? 0 : 1 };

      case 'status':
        const activeColor = svc.activeState === 'active' ? '\x1b[32m●\x1b[0m active (running)' : '\x1b[31m●\x1b[0m inactive (dead)';
        const statusOutput = [
          `● ${svc.name} - ${svc.description}`,
          `   Loaded: loaded (/usr/lib/systemd/system/${svc.name}; ${svc.unitFileState}; vendor preset: disabled)`,
          `   Active: ${activeColor} since ${new Date().toUTCString()}`,
          ` Main PID: ${svc.mainPid || '(none)'} (${svc.execStart.split(' ')[0]})`,
          `   CGroup: /system.slice/${svc.name}`,
          `           └─${svc.mainPid || 0} ${svc.execStart}`,
        ].join('\n');
        return { stdout: statusOutput, stderr: '', exitCode: svc.activeState === 'active' ? 0 : 3 };

      default:
        return { stdout: '', stderr: `Unknown operation '${action}'.`, exitCode: 1 };
    }
  }

  private cmdService(args: string[]): CommandResult {
    if (args.length < 2) {
      return { stdout: '', stderr: 'Usage: service <name> <action>', exitCode: 1 };
    }
    return this.cmdSystemctl([args[1], args[0]]);
  }

  private cmdPs(args: string[]): CommandResult {
    // 1. Filter by PID if -p <pid>
    let filterPid: number | null = null;
    const pIdx = args.indexOf('-p');
    if (pIdx !== -1 && args[pIdx + 1]) {
      const parsed = parseInt(args[pIdx + 1], 10);
      if (!isNaN(parsed)) filterPid = parsed;
    }

    // 2. Custom columns if -o specified
    let customCols: string[] = [];
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-o' && args[i + 1]) {
        customCols = args[i + 1].toLowerCase().split(',').map(s => s.trim().split(':')[0]);
        break;
      } else if (args[i].startsWith('-o') && args[i].length > 2) {
        customCols = args[i].slice(2).toLowerCase().split(',').map(s => s.trim().split(':')[0]);
        break;
      }
    }

    let procs = [...this.processes];
    if (filterPid !== null) {
      procs = procs.filter(p => p.pid === filterPid);
      // If not found in default list, check if sleep was meant
      if (procs.length === 0 && (filterPid === 23885 || filterPid > 10000)) {
        const sleepP = this.processes.find(p => p.command.includes('sleep'));
        if (sleepP) procs = [sleepP];
      }
    }

    // Format custom output
    if (customCols.length > 0) {
      const headers = customCols.map(c => c.toUpperCase());
      const lines = [headers.join('  ')];
      for (const p of procs) {
        const row = customCols.map(c => {
          if (c === 'pid') return p.pid.toString().padStart(5);
          if (c === 'ppid') return p.ppid.toString().padStart(5);
          if (c === 'user' || c === 'uid') return p.user.padEnd(8);
          if (c === 'ni' || c === 'nice') return (p.ni ?? 0).toString().padStart(3);
          if (c === 'pri') return ((p.ni ?? 0) + 20).toString().padStart(3);
          if (c === 'stat') return p.stat.padEnd(4);
          if (c === 'tty') return p.tty.padEnd(8);
          if (c === 'cmd' || c === 'command') return p.command;
          if (c === 'comm') return p.command.split(' ')[0];
          return '-';
        });
        lines.push(row.join('  '));
      }
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    }

    const full = args.some(a => a.includes('aux') || a.includes('-ef') || a.includes('-e') || a.includes('-f'));
    const header = full
      ? 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND'
      : '  PID TTY          TIME CMD';

    const lines = [header];
    for (const p of procs) {
      if (full) {
        lines.push(
          `${p.user.padEnd(8)} ${p.pid.toString().padStart(5)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)} ${p.vsz.toString().padStart(6)} ${p.rss.toString().padStart(5)} ${p.tty.padEnd(8)} ${p.stat.padEnd(4)} ${p.start.padEnd(7)} ${p.time.padStart(6)} ${p.command}`
        );
      } else {
        lines.push(`${p.pid.toString().padStart(5)} ${p.tty.padEnd(8)} ${p.time.padStart(8)} ${p.command.split(' ')[0]}`);
      }
    }

    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdTop(): CommandResult {
    const uptimeStr = 'up 4:12,  2 users,  load average: 0.08, 0.03, 0.01';
    const header = [
      `top - ${new Date().toLocaleTimeString()} ${uptimeStr}`,
      `Tasks: ${this.processes.length} total,   1 running, ${this.processes.length - 1} sleeping,   0 stopped,   0 zombie`,
      `%Cpu(s):  1.2 us,  0.8 sy,  0.0 ni, 97.9 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st`,
      `KiB Mem :  4044812 total,  2140224 free,   779998 used,  1124580 buff/cache`,
      `KiB Swap:  2097148 total,  2097148 free,        0 used.  3158912 avail Mem `,
      '',
      '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND',
    ];

    for (const p of this.processes.slice(0, 10)) {
      header.push(
        `${p.pid.toString().padStart(5)} ${p.user.padEnd(8)}  20   ${(p.ni ?? 0).toString().padStart(2)}  ${p.vsz.toString().padStart(6)}  ${p.rss.toString().padStart(5)}   1240 S   ${p.cpu.toFixed(1).padStart(4)}  ${p.mem.toFixed(1).padStart(4)}   ${p.time} ${p.command.split(' ')[0]}`
      );
    }

    return { stdout: header.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdSleep(args: string[]): CommandResult {
    const isBg = args.includes('&');
    const sec = args.find(a => !a.startsWith('-') && a !== '&') || '300';
    const pid = 23885;

    // Check if sleep process already running
    const existing = this.processes.find(p => p.command.includes('sleep'));
    if (!existing) {
      this.processes.push({
        pid,
        ppid: 23882,
        user: this.currentUser === 'root' ? 'labex' : this.currentUser,
        cpu: 0.0,
        mem: 0.0,
        vsz: 7264,
        rss: 868,
        tty: 'pts/0',
        stat: 'S',
        start: '11:50',
        time: '0:00',
        command: `sleep ${sec}`,
        ni: 0,
      });
    }

    if (isBg) {
      return { stdout: `[1] ${pid}\n`, stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdBg(_args: string[]): CommandResult {
    const sleepProc = this.processes.find(p => p.command.includes('sleep'));
    if (sleepProc) sleepProc.stat = 'S';
    return { stdout: '[1]+  394 continued  sleep 300\n', stderr: '', exitCode: 0 };
  }

  private cmdFg(_args: string[]): CommandResult {
    const sleepProc = this.processes.find(p => p.command.includes('sleep'));
    if (sleepProc) sleepProc.stat = 'R';
    return { stdout: '[1]+  394 running    sleep 300\n', stderr: '', exitCode: 0 };
  }

  private cmdKill(args: string[]): CommandResult {
    if (args.includes('-l')) {
      return {
        stdout: ' 1) SIGHUP       2) SIGINT       3) SIGQUIT      4) SIGILL\n 5) SIGTRAP      6) SIGABRT      7) SIGBUS       8) SIGFPE\n 9) SIGKILL     10) SIGUSR1     11) SIGSEGV     12) SIGUSR2\n13) SIGPIPE     14) SIGALRM     15) SIGTERM     16) SIGSTKFLT\n17) SIGCHLD     18) SIGCONT     19) SIGSTOP     20) SIGTSTP',
        stderr: '',
        exitCode: 0,
      };
    }

    let target = '';
    for (const a of args) {
      if (!a.startsWith('-')) target = a;
    }

    if (!target) {
      return { stdout: '', stderr: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...', exitCode: 1 };
    }

    if (args.includes('-0')) {
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    // Handle job specification %1 or %
    if (target.startsWith('%')) {
      const sleepIdx = this.processes.findIndex(p => p.command.includes('sleep'));
      if (sleepIdx !== -1) {
        const cmdName = this.processes[sleepIdx].command;
        this.processes.splice(sleepIdx, 1);
        return { stdout: `[1]+  Terminated              ${cmdName}\n`, stderr: '', exitCode: 0 };
      }
      return { stdout: '[1]+  Terminated\n', stderr: '', exitCode: 0 };
    }

    const pid = parseInt(target, 10);
    if (isNaN(pid)) {
      return { stdout: '', stderr: 'kill: invalid argument', exitCode: 1 };
    }

    const idx = this.processes.findIndex(p => p.pid === pid);
    if (idx === -1) {
      const sleepIdx = this.processes.findIndex(p => p.command.includes('sleep'));
      if (sleepIdx !== -1) {
        this.processes.splice(sleepIdx, 1);
        return { stdout: '', stderr: '', exitCode: 0 };
      }
      return { stdout: '', stderr: `bash: kill: (${pid}) - No such process`, exitCode: 1 };
    }

    this.processes.splice(idx, 1);
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdPkill(args: string[]): CommandResult {
    const pattern = args.find(a => !a.startsWith('-'));
    if (!pattern) {
      return { stdout: '', stderr: 'pkill: pattern required', exitCode: 1 };
    }

    const before = this.processes.length;
    this.processes = this.processes.filter(p => !p.command.includes(pattern));
    return { stdout: '', stderr: '', exitCode: this.processes.length < before ? 0 : 1 };
  }

  private cmdPgrep(args: string[]): CommandResult {
    const pattern = args.find(a => !a.startsWith('-'))?.toLowerCase();
    if (!pattern) {
      return { stdout: '', stderr: 'pgrep: pattern required', exitCode: 1 };
    }
    const matching = this.processes.filter(p => p.command.toLowerCase().includes(pattern));
    if (matching.length === 0) {
      return { stdout: '', stderr: '', exitCode: 1 };
    }
    return { stdout: matching.map(p => p.pid.toString()).join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdNice(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '0', stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdRenice(args: string[]): CommandResult {
    let newVal = 10;
    let targetPid = 23885;

    const nIdx = args.indexOf('-n');
    if (nIdx !== -1 && args[nIdx + 1]) {
      newVal = parseInt(args[nIdx + 1], 10) || 10;
    } else if (args[0] && !isNaN(parseInt(args[0], 10))) {
      newVal = parseInt(args[0], 10);
    }

    const pIdx = args.indexOf('-p');
    if (pIdx !== -1 && args[pIdx + 1]) {
      targetPid = parseInt(args[pIdx + 1], 10) || targetPid;
    } else {
      const numArg = args.find((a, i) => i > 0 && !isNaN(parseInt(a, 10)) && i !== nIdx + 1);
      if (numArg) targetPid = parseInt(numArg, 10);
    }

    const proc = this.processes.find(p => p.pid === targetPid) || this.processes.find(p => p.command.includes('sleep'));
    const oldVal = proc?.ni ?? 0;
    if (proc) {
      proc.ni = newVal;
      targetPid = proc.pid;
    }

    return {
      stdout: `${targetPid} (process ID) old priority ${oldVal}, new priority ${newVal}\n`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdJobs(): CommandResult {
    const sleepProc = this.processes.find(p => p.command.includes('sleep'));
    if (sleepProc) {
      const statWord = sleepProc.stat === 'T' ? 'Suspended' : 'Running';
      return { stdout: `[1]+  ${statWord.padEnd(20)} ${sleepProc.command} &\n`, stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdCrontab(args: string[], stdin: string): CommandResult {
    const user = this.currentUser;

    if (args.includes('-l')) {
      const jobs = this.crontabs.get(user) || [];
      if (jobs.length === 0) {
        return { stdout: '', stderr: `no crontab for ${user}`, exitCode: 1 };
      }
      return { stdout: jobs.join('\n'), stderr: '', exitCode: 0 };
    }

    if (args.includes('-r')) {
      this.crontabs.delete(user);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    if (args.includes('-e')) {
      // In terminal, provide instructions or prompt
      return {
        stdout: `~ Crontab Editor Mode ~\nTo set a crontab entry, you can pipe it directly into crontab:\necho "0 2 * * * /opt/backup.sh" | crontab -\nOr use the Web UI Quick Actions.`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (args.includes('-') && stdin) {
      // Install from stdin
      const lines = stdin.split('\n').map(l => l.trim()).filter(Boolean);
      this.crontabs.set(user, lines);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: 'crontab: usage error: file name must be specified for replace', exitCode: 1 };
  }

  private cmdYum(args: string[]): CommandResult {
    const nonFlags = args.filter(a => !a.startsWith('-'));
    const sub = nonFlags[0];
    const pkgName = nonFlags[1];

    if (!sub) {
      return { stdout: '', stderr: 'Updating Subscription Management repositories.\nCommand Error: Need to specify an action: install, remove, list, info, update, search', exitCode: 1 };
    }

    switch (sub) {
      case 'install': {
        if (!pkgName) return { stdout: '', stderr: 'Error: Need a package name to install', exitCode: 1 };
        const pkg = this.packages.get(pkgName);
        if (!pkg) {
          return { stdout: '', stderr: `Updating Subscription Management repositories.\nLast metadata expiration check: 0:14:22 ago.\nNo match for argument: ${pkgName}\nError: Unable to find a match: ${pkgName}`, exitCode: 1 };
        }
        if (pkg.installed) {
          return { stdout: `Updating Subscription Management repositories.\nLast metadata expiration check: 0:14:22 ago.\nPackage ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch} is already installed.\nDependencies resolved.\nNothing to do.\nComplete!`, stderr: '', exitCode: 0 };
        }

        // Install files into VFS
        pkg.installed = true;
        for (const file of pkg.files) {
          if (file.endsWith('/')) {
            this.vfs.mkdir(file, { recursive: true });
          } else {
            this.vfs.touch(file);
          }
        }

        // If nginx, register service and default page
        if (pkgName === 'nginx' && !this.services.has('nginx.service')) {
          this.services.set('nginx.service', {
            name: 'nginx.service',
            description: 'The nginx HTTP and reverse proxy server',
            activeState: 'inactive',
            unitFileState: 'disabled',
            execStart: '/usr/sbin/nginx',
          });
          this.vfs.mkdir('/usr/share/nginx/html', { recursive: true });
          this.vfs.writeFile('/usr/share/nginx/html/index.html', '<!DOCTYPE html><html><body><h1>Welcome to CentOS Stream 9 NGINX Server!</h1></body></html>\n');
        }

        return {
          stdout: `Updating Subscription Management repositories.
Last metadata expiration check: 0:14:22 ago on Thu 02 Oct 2026.
Dependencies resolved.
================================================================================
 Package       Arch         Version                 Repository             Size
================================================================================
Installing:
 ${pkg.name.padEnd(12)}  ${pkg.arch.padEnd(10)}  ${(pkg.version + '-' + pkg.release).padEnd(22)}  appstream             ${pkg.size}

Transaction Summary
================================================================================
Install  1 Package

Total download size: ${pkg.size}
Installed size: 4.8 M
Downloading Packages:
${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}.rpm                   2.4 MB/s | ${pkg.size}     00:00    
--------------------------------------------------------------------------------
Total                                           2.4 MB/s | ${pkg.size}     00:00     
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Preparing        :                                                        1/1 
  Installing       : ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}                                  1/1 
  Running scriptlet: ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}                                  1/1 
  Verifying        : ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}                                  1/1 

Installed:
  ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}

Complete!`,
          stderr: '',
          exitCode: 0,
        };
      }

      case 'remove': {
        if (!pkgName) return { stdout: '', stderr: 'Error: Need a package name to remove', exitCode: 1 };
        const pkg = this.packages.get(pkgName);
        if (!pkg || !pkg.installed) {
          return { stdout: '', stderr: `No match for argument: ${pkgName}\nNo packages marked for removal.`, exitCode: 1 };
        }
        pkg.installed = false;
        return {
          stdout: `Dependencies resolved.
================================================================================
 Package       Arch         Version                 Repository             Size
================================================================================
Removing:
 ${pkg.name.padEnd(12)}  ${pkg.arch.padEnd(10)}  ${(pkg.version + '-' + pkg.release).padEnd(22)}  @appstream            ${pkg.size}

Transaction Summary
================================================================================
Remove  1 Package

Freed space: 4.8 M
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Erasing          : ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}                                  1/1 
  Verifying        : ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}                                  1/1 

Removed:
  ${pkg.name}-${pkg.version}-${pkg.release}.${pkg.arch}

Complete!`,
          stderr: '',
          exitCode: 0,
        };
      }

      case 'search': {
        const query = nonFlags[1] || '';
        const lines = [
          'Updating Subscription Management repositories.',
          'Last metadata expiration check: 0:14:22 ago.',
          '========================== Name & Summary Matched: ' + query + ' ==========================',
        ];
        this.packages.forEach(p => {
          if (p.name.includes(query) || p.summary.includes(query)) {
            lines.push(`${p.name}.${p.arch} : ${p.summary}`);
          }
        });
        return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
      }

      case 'list': {
        const filter = nonFlags[1];
        const lines = [
          'Updating Subscription Management repositories.',
          'Last metadata expiration check: 0:14:22 ago.',
          'Installed Packages',
        ];
        this.packages.forEach(p => {
          if (p.installed && (!filter || p.name.includes(filter))) {
            lines.push(`${p.name}.${p.arch}`.padEnd(32) + `${p.version}-${p.release}`.padEnd(24) + '@appstream');
          }
        });
        return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
      }

      case 'clean':
        return { stdout: 'Loaded plugins: fastestmirror\nCleaning repos: base updates\nCleaning up everything', stderr: '', exitCode: 0 };

      default:
        return { stdout: '', stderr: `Unknown yum command: ${sub}`, exitCode: 1 };
    }
  }

  private cmdRpm(args: string[]): CommandResult {
    if (args.includes('-qa')) {
      const installed = Array.from(this.packages.values())
        .filter(p => p.installed)
        .map(p => `${p.name}-${p.version}-${p.release}.${p.arch}`);
      return { stdout: installed.join('\n'), stderr: '', exitCode: 0 };
    }

    if (args.some(a => a.startsWith('-qi'))) {
      const pkgName = args[args.length - 1];
      const pkg = this.packages.get(pkgName);
      if (!pkg || !pkg.installed) {
        return { stdout: '', stderr: `package ${pkgName} is not installed`, exitCode: 1 };
      }
      return {
        stdout: `Name        : ${pkg.name}
Version     : ${pkg.version}
Release     : ${pkg.release}
Architecture: ${pkg.arch}
Install Date: ${new Date().toUTCString()}
Group       : Applications/System
Size        : ${pkg.size}
Summary     : ${pkg.summary}
Description :
${pkg.description}`,
        stderr: '',
        exitCode: 0,
      };
    }

    return { stdout: '', stderr: 'rpm: specify -qa or -qi <package>', exitCode: 1 };
  }

  private cmdHostnamectl(args: string[]): CommandResult {
    if (args.length === 0 || args[0] === 'status') {
      return {
        stdout: `   Static hostname: ${this.hostname}
         Icon name: computer-vm
           Chassis: vm
        Machine ID: e9f21b7762bb44e59dfd306b976722d4
           Boot ID: 8acbd8469ad04e548235a64393699742
    Virtualization: kvm
  Operating System: CentOS Stream 9
       CPE OS Name: cpe:/o:centos:centos:9
            Kernel: Linux 5.14.0-362.el9.x86_64
      Architecture: x86-64`,
        stderr: '',
        exitCode: 0,
      };
    }

    if (args[0] === 'set-hostname' && args[1]) {
      this.hostname = args[1];
      this.env.HOSTNAME = args[1];
      this.vfs.writeFile('/etc/hostname', `${args[1]}\n`);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: 'hostnamectl: command not recognized', exitCode: 1 };
  }

  private cmdHostname(args: string[]): CommandResult {
    if (args.length > 0) {
      this.hostname = args[0];
      this.env.HOSTNAME = args[0];
      this.vfs.writeFile('/etc/hostname', `${args[0]}\n`);
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    return { stdout: this.hostname, stderr: '', exitCode: 0 };
  }

  private cmdIp(args: string[]): CommandResult {
    const sub = args[0] || 'addr';
    if (sub === 'a' || sub === 'addr') {
      return {
        stdout: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.50/24 brd 192.168.1.255 scope global dynamic noprefixroute eth0
       valid_lft 86320sec preferred_lft 86320sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link 
       valid_lft forever preferred_lft forever`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (sub === 'r' || sub === 'route') {
      return {
        stdout: `default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.50 metric 100 
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50 metric 100`,
        stderr: '',
        exitCode: 0,
      };
    }
    return { stdout: '', stderr: 'ip: argument not supported', exitCode: 1 };
  }

  private cmdIfconfig(): CommandResult {
    return {
      stdout: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.50  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::5054:ff:fe12:3456  prefixlen 64  scopeid 0x20<link>
        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)
        RX packets 1452  bytes 129482 (126.4 KiB)
        TX packets 1204  bytes 108392 (105.8 KiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdPing(args: string[]): CommandResult {
    const host = args.find(a => !a.startsWith('-')) || 'localhost';
    return {
      stdout: `PING ${host} (192.168.1.1) 56(84) bytes of data.
64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=0.428 ms
64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=0.385 ms
64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=0.392 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2001ms
rtt min/avg/max/mdev = 0.385/0.401/0.428/0.024 ms`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdNetstat(): CommandResult {
    const rows = [
      'Active Internet connections (only servers)',
      'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    ',
    ];

    const sshd = this.services.get('sshd.service');
    if (sshd?.activeState === 'active') {
      rows.push(`tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      ${sshd.mainPid || 912}/sshd`);
      rows.push(`tcp6       0      0 :::22                   :::*                    LISTEN      ${sshd.mainPid || 912}/sshd`);
    }

    const nginx = this.services.get('nginx.service');
    if (nginx?.activeState === 'active') {
      rows.push(`tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      ${nginx.mainPid || 1420}/nginx: master`);
      rows.push(`tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      ${nginx.mainPid || 1420}/nginx: master`);
    }

    const httpd = this.services.get('httpd.service');
    if (httpd?.activeState === 'active') {
      rows.push(`tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      ${httpd.mainPid || 1510}/httpd`);
    }

    const mariadb = this.services.get('mariadb.service');
    if (mariadb?.activeState === 'active') {
      rows.push(`tcp        0      0 0.0.0.0:3306            0.0.0.0:*               LISTEN      ${mariadb.mainPid || 1620}/mariadbd`);
    }

    return { stdout: rows.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdCurl(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: "curl: try 'curl --help' for more information", exitCode: 2 };
    }

    const headOnly = args.includes('-I') || args.includes('--head');
    const silent = args.includes('-s') || args.includes('--silent');
    const verbose = args.includes('-v') || args.includes('--verbose');
    let outputFile: string | null = null;
    const oIdx = args.indexOf('-o');
    if (oIdx !== -1 && args[oIdx + 1]) {
      outputFile = args[oIdx + 1];
    }

    let url = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith('-')) {
        if (args[i] === '-o') i++;
        continue;
      }
      url = args[i];
      break;
    }

    if (!url) {
      return { stdout: '', stderr: 'curl: no URL specified!', exitCode: 2 };
    }

    const isLocal = url.includes('localhost') || url.includes('127.0.0.1') || url.includes('centos9') || url.includes('192.168.1.50');

    if (isLocal) {
      const nginx = this.services.get('nginx.service');
      const httpd = this.services.get('httpd.service');
      const isNginxActive = nginx?.activeState === 'active';
      const isHttpdActive = httpd?.activeState === 'active';

      if (!isNginxActive && !isHttpdActive) {
        return {
          stdout: '',
          stderr: 'curl: (7) Failed to connect to localhost port 80: Connection refused',
          exitCode: 7,
        };
      }

      const serverName = isNginxActive ? 'nginx/1.22.1' : 'Apache/2.4.57 (CentOS Stream)';
      const filePath = isNginxActive ? '/usr/share/nginx/html/index.html' : '/var/www/html/index.html';
      const htmlContent = this.vfs.readFile(filePath) || '<!DOCTYPE html><html><body><h1>Welcome to CentOS Stream 9 Web Server!</h1></body></html>\n';
      const dateStr = new Date().toUTCString();

      const headers = [
        'HTTP/1.1 200 OK',
        `Server: ${serverName}`,
        `Date: ${dateStr}`,
        'Content-Type: text/html; charset=UTF-8',
        `Content-Length: ${htmlContent.length}`,
        'Connection: keep-alive',
        'ETag: "651a2b3c-4e8"',
        'Accept-Ranges: bytes',
        '',
      ].join('\r\n');

      if (headOnly) {
        return { stdout: headers, stderr: '', exitCode: 0 };
      }

      let out = htmlContent;
      if (verbose) {
        out = `*   Trying 127.0.0.1:80...\n* Connected to localhost (127.0.0.1) port 80 (#0)\n> GET / HTTP/1.1\n> Host: localhost\n> User-Agent: curl/7.76.1\n> Accept: */*\n>\n< HTTP/1.1 200 OK\n< Server: ${serverName}\n< Content-Length: ${htmlContent.length}\n< \n` + htmlContent;
      }

      if (outputFile) {
        const dest = this.vfs.resolvePath(this.cwd, outputFile);
        this.vfs.writeFile(dest, htmlContent);
        return {
          stdout: silent ? '' : `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n100   ${htmlContent.length}  100   ${htmlContent.length}    0     0   240k      0 --:--:-- --:--:-- --:--:--  240k`,
          stderr: '',
          exitCode: 0,
        };
      }

      return { stdout: out, stderr: '', exitCode: 0 };
    }

    if (headOnly) {
      return {
        stdout: `HTTP/2 200\r\ndate: ${new Date().toUTCString()}\r\ncontent-type: text/html; charset=UTF-8\r\nserver: cloudflare\r\n`,
        stderr: '',
        exitCode: 0,
      };
    }

    const remoteContent = `<!doctype html>\n<html>\n<head><title>CentOS Stream 9 Client</title></head>\n<body>\n<h1>Connected to ${url}</h1>\n<p>Simulation response received successfully.</p>\n</body>\n</html>\n`;

    if (outputFile) {
      const dest = this.vfs.resolvePath(this.cwd, outputFile);
      this.vfs.writeFile(dest, remoteContent);
      return { stdout: silent ? '' : `100   ${remoteContent.length}  100   ${remoteContent.length}    0     0   310k      0 --:--:-- --:--:-- --:--:--  310k`, stderr: '', exitCode: 0 };
    }

    return {
      stdout: remoteContent,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdWget(args: string[]): CommandResult {
    const url = args.find(a => !a.startsWith('-'));
    if (!url) {
      return { stdout: '', stderr: 'wget: missing URL\nUsage: wget [OPTION]... [URL]...', exitCode: 1 };
    }

    const filename = url.split('/').filter(Boolean).pop() || 'index.html';
    const filePath = this.vfs.resolvePath(this.cwd, filename);
    const content = `<!-- Downloaded from ${url} via wget on ${new Date().toISOString()} -->\n<!DOCTYPE html><html><body><h1>Saved content from ${url}</h1></body></html>\n`;
    this.vfs.writeFile(filePath, content);

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const host = url.replace(/^https?:\/\//, '').split('/')[0];
    const output = `--${nowStr}--  ${url}
Resolving ${host}... 104.18.24.120, 2606:4700::6812:1878
Connecting to ${host}|104.18.24.120|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: ${content.length} [text/html]
Saving to: ‘${filename}’

${filename}        100%[===================>]     ${content.length}  --.-KB/s    in 0.001s  

${nowStr} (1.42 MB/s) - ‘${filename}’ saved [${content.length}/${content.length}]`;

    return { stdout: output, stderr: '', exitCode: 0 };
  }

  private cmdNmcli(args: string[]): CommandResult {
    const target = args[0] || 'general';
    const sub = args[1] || 'status';

    if (target === 'g' || target === 'general' || args.length === 0) {
      return {
        stdout: `STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN    
connected  full          enabled  enabled  enabled  enabled `,
        stderr: '',
        exitCode: 0,
      };
    }

    if (target === 'c' || target === 'connection' || target === 'con') {
      if (sub === 'show' || sub === 's' || args.length === 1) {
        return {
          stdout: `NAME    UUID                                  TYPE      DEVICE 
ens160  8e6b12a0-43b5-4a41-b0e6-990a42429402  ethernet  ens160 `,
          stderr: '',
          exitCode: 0,
        };
      }
      if (sub === 'up') {
        return { stdout: 'Connection successfully activated (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/1)', stderr: '', exitCode: 0 };
      }
      if (sub === 'down') {
        return { stdout: "Connection 'ens160' successfully deactivated.", stderr: '', exitCode: 0 };
      }
    }

    if (target === 'd' || target === 'device' || target === 'dev') {
      if (sub === 'status' || sub === 's' || args.length === 1) {
        return {
          stdout: `DEVICE  TYPE      STATE      CONNECTION 
ens160  ethernet  connected  ens160     
lo      loopback  unmanaged  --         `,
          stderr: '',
          exitCode: 0,
        };
      }
      if (sub === 'show') {
        return {
          stdout: `GENERAL.DEVICE:                         ens160
GENERAL.TYPE:                           ethernet
GENERAL.HWADDR:                         52:54:00:12:34:56
GENERAL.MTU:                            1500
GENERAL.STATE:                          100 (connected)
GENERAL.CONNECTION:                     ens160
IP4.ADDRESS[1]:                         192.168.1.50/24
IP4.GATEWAY:                            192.168.1.1
IP4.DNS[1]:                             8.8.8.8
IP4.DNS[2]:                             1.1.1.1`,
          stderr: '',
          exitCode: 0,
        };
      }
    }

    return { stdout: `Error: Object '${target}' is unknown, try 'nmcli help'.`, stderr: '', exitCode: 1 };
  }

  private cmdJournalctl(args: string[]): CommandResult {
    let lines = (this.vfs.readFile('/var/log/messages') || '').split('\n').filter(Boolean);

    const uIdx = args.indexOf('-u');
    if (uIdx !== -1 && args[uIdx + 1]) {
      const unit = args[uIdx + 1].replace(/\.service$/, '');
      lines = lines.filter(l => l.toLowerCase().includes(unit.toLowerCase()));
      if (lines.length === 0) {
        lines = [
          '-- Logs begin at Thu 2026-10-02 08:12:01 UTC, end at Thu 2026-10-02 12:45:00 UTC. --',
          `Oct  2 08:12:05 centos9 systemd[1]: Starting ${unit}.service...`,
          `Oct  2 08:12:06 centos9 systemd[1]: Started ${unit}.service.`,
        ];
      }
    }

    const nIdx = args.indexOf('-n');
    let limit = 50;
    if (nIdx !== -1 && args[nIdx + 1]) {
      const parsed = parseInt(args[nIdx + 1], 10);
      if (!isNaN(parsed)) limit = parsed;
    }

    const output = [
      '-- Logs begin at Thu 2026-10-02 08:12:01 UTC, end at Thu 2026-10-02 12:45:00 UTC. --',
      ...lines.slice(-limit),
    ].join('\n');

    return { stdout: output, stderr: '', exitCode: 0 };
  }

  private cmdFirewallCmd(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: 'firewall-cmd: error: no options specified', exitCode: 2 };
    }

    if (args.includes('--state')) {
      const fwService = this.services.get('firewalld.service');
      const isRunning = fwService?.activeState === 'active';
      return { stdout: isRunning ? 'running' : 'not running', stderr: '', exitCode: isRunning ? 0 : 252 };
    }

    if (args.includes('--reload')) {
      return { stdout: 'success', stderr: '', exitCode: 0 };
    }

    if (args.includes('--list-all')) {
      const svcs = Array.from(this.firewallServices).join(' ');
      const ports = Array.from(this.firewallPorts).join(' ');
      return {
        stdout: `public (active)
  target: default
  icmp-block-inversion: no
  interfaces: ens160
  sources: 
  services: ${svcs}
  ports: ${ports}
  protocols: 
  forward: yes
  masquerade: no
  forward-ports: 
  source-ports: 
  icmp-blocks: 
  rich rules: `,
        stderr: '',
        exitCode: 0,
      };
    }

    for (const arg of args) {
      if (arg.startsWith('--add-service=')) {
        const s = arg.split('=')[1];
        this.firewallServices.add(s);
        return { stdout: 'success', stderr: '', exitCode: 0 };
      }
      if (arg.startsWith('--remove-service=')) {
        const s = arg.split('=')[1];
        this.firewallServices.delete(s);
        return { stdout: 'success', stderr: '', exitCode: 0 };
      }
      if (arg.startsWith('--add-port=')) {
        const p = arg.split('=')[1];
        this.firewallPorts.add(p);
        return { stdout: 'success', stderr: '', exitCode: 0 };
      }
      if (arg.startsWith('--remove-port=')) {
        const p = arg.split('=')[1];
        this.firewallPorts.delete(p);
        return { stdout: 'success', stderr: '', exitCode: 0 };
      }
    }

    return { stdout: 'success', stderr: '', exitCode: 0 };
  }

  private cmdSestatus(): CommandResult {
    return {
      stdout: `SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   ${this.selinuxMode.toLowerCase()}
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdGetenforce(): CommandResult {
    return { stdout: this.selinuxMode, stderr: '', exitCode: 0 };
  }

  private cmdSetenforce(args: string[]): CommandResult {
    if (this.currentUser !== 'root') {
      return { stdout: '', stderr: 'setenforce: setenforce() failed', exitCode: 1 };
    }
    const val = args[0]?.toLowerCase();
    if (val === '0' || val === 'permissive') {
      this.selinuxMode = 'Permissive';
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    if (val === '1' || val === 'enforcing') {
      this.selinuxMode = 'Enforcing';
      return { stdout: '', stderr: '', exitCode: 0 };
    }
    return { stdout: '', stderr: 'usage:  setenforce [ Enforcing | Permissive | 1 | 0 ]', exitCode: 1 };
  }

  private cmdTree(args: string[]): CommandResult {
    const target = args.find(a => !a.startsWith('-')) || '.';
    const resolved = this.vfs.resolvePath(this.cwd, target);
    const rootNode = this.vfs.getNode(resolved);

    if (!rootNode) {
      return { stdout: '', stderr: `${target} [error opening dir]`, exitCode: 1 };
    }

    if (rootNode.type !== 'dir') {
      return { stdout: `${target}\n\n0 directories, 1 file`, stderr: '', exitCode: 0 };
    }

    const lines: string[] = [target];
    let dirCount = 0;
    let fileCount = 0;

    const buildTree = (dirPath: string, prefix: string, depth: number) => {
      if (depth > 4) return;
      const entries = this.vfs.readdir(dirPath);
      if (!entries) return;
      const visible = entries.filter(e => !e.name.startsWith('.') || args.includes('-a'));

      visible.forEach((entry, idx) => {
        const isLast = idx === visible.length - 1;
        const branch = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        if (entry.type === 'dir') {
          dirCount++;
          lines.push(`${prefix}${branch}\x1b[1;34m${entry.name}\x1b[0m`);
          const nextPath = dirPath === '/' ? `/${entry.name}` : `${dirPath}/${entry.name}`;
          buildTree(nextPath, prefix + childPrefix, depth + 1);
        } else if (entry.type === 'symlink') {
          fileCount++;
          lines.push(`${prefix}${branch}\x1b[36m${entry.name} -> ${entry.target}\x1b[0m`);
        } else {
          fileCount++;
          const isExec = (entry.mode & 0o111) !== 0;
          const colorName = isExec ? `\x1b[1;32m${entry.name}\x1b[0m` : entry.name;
          lines.push(`${prefix}${branch}${colorName}`);
        }
      });
    };

    buildTree(resolved, '', 1);
    lines.push('');
    lines.push(`${dirCount} directories, ${fileCount} files`);
    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdLscpu(): CommandResult {
    return {
      stdout: `Architecture:                    x86_64
CPU op-mode(s):                  32-bit, 64-bit
Address sizes:                   48 bits physical, 48 bits virtual
Byte Order:                      Little Endian
CPU(s):                          2
On-line CPU(s) list:             0,1
Vendor ID:                       GenuineIntel
Model name:                      Intel(R) Xeon(R) Platinum 8375C CPU @ 2.80GHz
CPU family:                      6
Model:                           106
Thread(s) per core:              1
Core(s) per socket:              2
Socket(s):                       1
Stepping:                        2
BogoMIPS:                        5599.99
Flags:                           fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx pdpe1gb rdtscp lm constant_tsc rep_good nopl xtopology nonstop_tsc cpuid tsc_known_freq pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm 3dnowprefetch invpcid_single ssbd ibrs ibpb stibp fsgsbase tsc_adjust bmi1 avx2 smep bmi2 erms invpcid avx512f avx512dq rdseed adx smap avx512ifma clflushopt clwb avx512cd sha_ni avx512bw avx512vl xsaveopt xsave xsaves wbnoinvd arat spec_ctrl intel_stibp flush_l1d arch_capabilities
Hypervisor vendor:               KVM
Virtualization type:             full
L1d cache:                       96 KiB (2 instances)
L1i cache:                       64 KiB (2 instances)
L2 cache:                        2.5 MiB (2 instances)
L3 cache:                        54 MiB (1 instance)
NUMA node(s):                    1
NUMA node0 CPU(s):               0,1`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdLsblk(_args: string[] = []): CommandResult {
    return {
      stdout: `NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vda         252:0    0   40G  0 disk 
├─vda1      252:1    0    1G  0 part /boot
└─vda2      252:2    0   39G  0 part 
  ├─cs-root 253:0    0 37.2G  0 lvm  /
  └─cs-swap 253:1    0  1.8G  0 lvm  [SWAP]`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdTar(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: "tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' for more information.", exitCode: 2 };
    }

    let mode = '';
    let archiveFile = '';
    const fileTargets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a.startsWith('-')) {
        if (a.includes('c')) mode = 'create';
        if (a.includes('x')) mode = 'extract';
        if (a.includes('t')) mode = 'list';
        if (a.includes('f')) {
          if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
            archiveFile = args[++i];
          }
        }
      } else {
        if (!archiveFile) {
          archiveFile = a;
        } else {
          fileTargets.push(a);
        }
      }
    }

    if (!archiveFile) {
      return { stdout: '', stderr: 'tar: Refusing to read archive contents from terminal (missing -f flag?)', exitCode: 2 };
    }

    const archivePath = this.vfs.resolvePath(this.cwd, archiveFile);

    if (mode === 'create') {
      if (fileTargets.length === 0) {
        return { stdout: '', stderr: 'tar: Cowardly refusing to create an empty archive', exitCode: 2 };
      }
      const recorded: Record<string, string> = {};
      const lines: string[] = [];
      for (const t of fileTargets) {
        const full = this.vfs.resolvePath(this.cwd, t);
        const node = this.vfs.getNode(full);
        if (!node) {
          return { stdout: '', stderr: `tar: ${t}: Cannot stat: No such file or directory`, exitCode: 2 };
        }
        lines.push(t);
        recorded[t] = node.content ?? '';
      }
      this.vfs.writeFile(archivePath, `TAR_ARCHIVE_V1\n${JSON.stringify(recorded)}`);
      return { stdout: args.some(a => a.includes('v')) ? lines.join('\n') : '', stderr: '', exitCode: 0 };
    }

    if (mode === 'extract') {
      const raw = this.vfs.readFile(archivePath);
      if (!raw) {
        return { stdout: '', stderr: `tar: ${archiveFile}: Cannot open: No such file or directory`, exitCode: 2 };
      }
      if (!raw.startsWith('TAR_ARCHIVE_V1\n')) {
        return { stdout: args.some(a => a.includes('v')) ? archiveFile : '', stderr: '', exitCode: 0 };
      }
      const jsonStr = raw.replace('TAR_ARCHIVE_V1\n', '');
      try {
        const files: Record<string, string> = JSON.parse(jsonStr);
        const lines: string[] = [];
        for (const [fname, content] of Object.entries(files)) {
          lines.push(fname);
          const dest = this.vfs.resolvePath(this.cwd, fname);
          this.vfs.writeFile(dest, content);
        }
        return { stdout: args.some(a => a.includes('v')) ? lines.join('\n') : '', stderr: '', exitCode: 0 };
      } catch {
        return { stdout: '', stderr: 'tar: Error parsing archive', exitCode: 2 };
      }
    }

    if (mode === 'list') {
      const raw = this.vfs.readFile(archivePath);
      if (!raw) {
        return { stdout: '', stderr: `tar: ${archiveFile}: Cannot open: No such file or directory`, exitCode: 2 };
      }
      if (raw.startsWith('TAR_ARCHIVE_V1\n')) {
        const jsonStr = raw.replace('TAR_ARCHIVE_V1\n', '');
        try {
          const files: Record<string, string> = JSON.parse(jsonStr);
          return { stdout: Object.keys(files).join('\n'), stderr: '', exitCode: 0 };
        } catch {
          return { stdout: '', stderr: 'tar: Error reading archive', exitCode: 2 };
        }
      }
      return { stdout: `${archiveFile}\ninstall.sh\nREADME.txt`, stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: 'tar: specify action (-c, -x, -t)', exitCode: 2 };
  }

  private cmdGzip(args: string[]): CommandResult {
    const filename = args.find(a => !a.startsWith('-'));
    if (!filename) return { stdout: '', stderr: 'gzip: missing file', exitCode: 1 };
    const src = this.vfs.resolvePath(this.cwd, filename);
    const content = this.vfs.readFile(src);
    if (content === null) return { stdout: '', stderr: `gzip: ${filename}: No such file or directory`, exitCode: 1 };
    this.vfs.unlink(src);
    this.vfs.writeFile(`${src}.gz`, content);
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdGunzip(args: string[]): CommandResult {
    const filename = args.find(a => !a.startsWith('-'));
    if (!filename) return { stdout: '', stderr: 'gunzip: missing file', exitCode: 1 };
    const src = this.vfs.resolvePath(this.cwd, filename);
    const content = this.vfs.readFile(src);
    if (content === null) return { stdout: '', stderr: `gunzip: ${filename}: No such file or directory`, exitCode: 1 };
    const dest = src.endsWith('.gz') ? src.slice(0, -3) : src + '.out';
    this.vfs.unlink(src);
    this.vfs.writeFile(dest, content);
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdEnv(): CommandResult {
    const lines = Object.entries(this.env).map(([k, v]) => `${k}=${v}`);
    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdExport(args: string[]): CommandResult {
    if (args.length === 0) {
      const lines = Object.entries(this.env).map(([k, v]) => `declare -x ${k}="${v}"`);
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    }
    for (const a of args) {
      if (a.includes('=')) {
        const [k, ...v] = a.split('=');
        this.env[k] = v.join('=');
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdDf(_args?: string[]): CommandResult {
    return {
      stdout: `Filesystem     1K-blocks    Used Available Use% Mounted on
devtmpfs         1998240       0   1998240   0% /dev
tmpfs            2009404       0   2009404   0% /dev/shm
tmpfs            2009404    8612   2000792   1% /run
tmpfs            2009404       0   2009404   0% /sys/fs/cgroup
/dev/vda1       41931756 2420480  39511276   6% /
tmpfs             401884       0    401884   0% /run/user/0`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdFree(args: string[]): CommandResult {
    const isMega = args.includes('-m');
    if (isMega) {
      return {
        stdout: `              total        used        free      shared  buff/cache   available
Mem:           3949         761        2090          16        1098        3084
Swap:          2047           0        2047`,
        stderr: '',
        exitCode: 0,
      };
    }
    return {
      stdout: `              total        used        free      shared  buff/cache   available
Mem:        4044812      779998     2140224       16384     1124580     3158912
Swap:       2097148           0     2097148`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdUname(args: string[]): CommandResult {
    if (args.includes('-a')) {
      return {
        stdout: `Linux ${this.hostname} 5.14.0-362.el9.x86_64 #1 SMP PREEMPT_DYNAMIC Wed Oct 11 17:30:01 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux`,
        stderr: '',
        exitCode: 0,
      };
    }
    if (args.includes('-r')) {
      return { stdout: '5.14.0-362.el9.x86_64', stderr: '', exitCode: 0 };
    }
    return { stdout: 'Linux', stderr: '', exitCode: 0 };
  }

  private cmdDate(args: string[]): CommandResult {
    const d = new Date();
    const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth();
    const day = d.getUTCDate();
    const hour = d.getUTCHours();
    const minute = d.getUTCMinutes();
    const second = d.getUTCSeconds();
    const yday = Math.floor((Date.UTC(year, month, day) - Date.UTC(year, 0, 1)) / 86400000) + 1;
    const isoWeekday = d.getUTCDay() || 7;
    const values: Record<string, string> = {
      '%a': dayNames[d.getUTCDay()], '%A': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getUTCDay()],
      '%b': monthNames[month], '%B': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month],
      '%C': pad(Math.floor(year / 100)), '%d': pad(day), '%D': `${pad(month + 1)}/${pad(day)}/${pad(year % 100)}`,
      '%e': day.toString().padStart(2, ' '), '%F': `${year}-${pad(month + 1)}-${pad(day)}`, '%H': pad(hour),
      '%I': pad(hour % 12 || 12), '%j': pad(yday, 3), '%k': hour.toString().padStart(2, ' '),
      '%l': (hour % 12 || 12).toString().padStart(2, ' '), '%m': pad(month + 1), '%M': pad(minute),
      '%n': '\n', '%p': hour < 12 ? 'AM' : 'PM', '%P': hour < 12 ? 'am' : 'pm',
      '%r': `${pad(hour % 12 || 12)}:${pad(minute)}:${pad(second)} ${hour < 12 ? 'AM' : 'PM'}`,
      '%R': `${pad(hour)}:${pad(minute)}`, '%s': Math.floor(d.getTime() / 1000).toString(), '%S': pad(second),
      '%t': '\t', '%T': `${pad(hour)}:${pad(minute)}:${pad(second)}`, '%u': isoWeekday.toString(),
      '%w': d.getUTCDay().toString(), '%y': pad(year % 100), '%Y': year.toString(), '%z': '+0000', '%Z': 'UTC', '%%': '%',
    };
    const formatArg = args.find(a => a.startsWith('+'));
    const output = formatArg
      ? formatArg.slice(1).replace(/%[a-zA-Z%]/g, token => values[token] ?? token)
      : `${dayNames[d.getUTCDay()]} ${monthNames[month]} ${day.toString().padStart(2, ' ')} ${pad(hour)}:${pad(minute)}:${pad(second)} UTC ${year}`;
    return { stdout: output, stderr: '', exitCode: 0 };
  }

  private cmdUptime(): CommandResult {
    return { stdout: ` 12:45:00 up 4:12,  2 users,  load average: 0.08, 0.03, 0.01`, stderr: '', exitCode: 0 };
  }

  private cmdHistory(): CommandResult {
    const lines = this.history.map((h, i) => `${(i + 1).toString().padStart(5)}  ${h}`);
    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdWhich(args: string[]): CommandResult {
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 1 };
    const name = args[0];
    const stdBins = ['/usr/bin', '/bin', '/usr/sbin', '/sbin'];
    for (const bin of stdBins) {
      const full = `${bin}/${name}`;
      if (this.vfs.exists(full)) {
        return { stdout: full, stderr: '', exitCode: 0 };
      }
    }
    return { stdout: '', stderr: `/usr/bin/which: no ${name} in (${this.env.PATH})`, exitCode: 1 };
  }

  private cmdWhereis(args: string[]): CommandResult {
    if (args.length === 0) return { stdout: '', stderr: '', exitCode: 1 };
    const name = args[0];
    return { stdout: `${name}: /usr/bin/${name} /usr/share/man/man1/${name}.1.gz`, stderr: '', exitCode: 0 };
  }

  private cmdEditor(editorName: string, args: string[]): CommandResult {
    const filename = args[0];
    if (!filename) {
      return { stdout: '', stderr: `${editorName}: please specify a file to edit`, exitCode: 1 };
    }

    const resolved = this.vfs.resolvePath(this.cwd, filename);
    let content = this.vfs.readFile(resolved) ?? '';

    if (this.onOpenEditor) {
      this.onOpenEditor(resolved, content);
      return { stdout: '', stderr: '', exitCode: 0 };
    }

    return { stdout: `[Editor ${editorName} initialized for ${filename}]`, stderr: '', exitCode: 0 };
  }

  private cmdLess(args: string[], stdin: string): CommandResult {
    if (args.length === 0) {
      if (stdin) {
        return { stdout: stdin, stderr: '', exitCode: 0 };
      }
      return { stdout: 'Missing filename ("less --help" for help)', stderr: '', exitCode: 1 };
    }
    const fullPath = this.vfs.resolvePath(this.cwd, args[0]);
    const content = this.vfs.readFile(fullPath);
    if (content === null) {
      return { stdout: '', stderr: `${args[0]}: No such file or directory`, exitCode: 1 };
    }
    return {
      stdout: `${content}\n\n(END - Press q or continue typing to exit pager)`,
      stderr: '',
      exitCode: 0,
    };
  }

  private cmdFile(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: "file: missing operand\nTry 'file --help' for more information.", exitCode: 1 };
    }
    const lines: string[] = [];
    for (const arg of args) {
      if (arg.startsWith('-')) continue;
      const fullPath = this.vfs.resolvePath(this.cwd, arg);
      const node = this.vfs.getNode(fullPath);
      if (!node) {
        lines.push(`${arg}: cannot open '${arg}' (No such file or directory)`);
        continue;
      }
      if (node.type === 'dir') {
        lines.push(`${arg}: directory`);
      } else if (node.type === 'symlink') {
        lines.push(`${arg}: symbolic link to ${node.target}`);
      } else {
        if (fullPath.startsWith('/bin') || fullPath.startsWith('/usr/bin') || fullPath.startsWith('/sbin') || fullPath.startsWith('/usr/sbin')) {
          lines.push(`${arg}: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=824ef74b, stripped`);
        } else if (node.content?.startsWith('#!')) {
          lines.push(`${arg}: POSIX shell script, ASCII text executable`);
        } else if (arg.endsWith('.gz')) {
          lines.push(`${arg}: gzip compressed data, max compression, original size 10240`);
        } else {
          lines.push(`${arg}: ASCII text`);
        }
      }
    }
    return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
  }

  private cmdWhatis(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: 'whatis: whatis what?', exitCode: 1 };
    }

    const lines: string[] = [];
    let exitCode = 0;
    for (const name of args) {
      const command = getCommandDoc(name);
      if (command) {
        lines.push(renderWhatIs(command, name));
      } else {
        lines.push(`${name}: nothing appropriate.`);
        exitCode = 16;
      }
    }
    return { stdout: lines.join('\n'), stderr: '', exitCode };
  }

  private cmdAlias(args: string[]): CommandResult {
    if (args.length === 0) {
      const lines: string[] = [];
      for (const [k, v] of this.aliases.entries()) {
        lines.push(`alias ${k}='${v}'`);
      }
      return { stdout: lines.join('\n'), stderr: '', exitCode: 0 };
    }
    for (const arg of args) {
      if (arg.includes('=')) {
        const eqIdx = arg.indexOf('=');
        const k = arg.slice(0, eqIdx).trim();
        let v = arg.slice(eqIdx + 1).trim();
        if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
          v = v.slice(1, -1);
        }
        this.aliases.set(k, v);
      } else {
        if (this.aliases.has(arg)) {
          return { stdout: `alias ${arg}='${this.aliases.get(arg)}'`, stderr: '', exitCode: 0 };
        } else {
          return { stdout: '', stderr: `bash: alias: ${arg}: not found`, exitCode: 1 };
        }
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdUnalias(args: string[]): CommandResult {
    if (args.length === 0) {
      return { stdout: '', stderr: 'unalias: usage: unalias [-a] name [name ...]', exitCode: 2 };
    }
    for (const arg of args) {
      if (arg === '-a') {
        this.aliases.clear();
      } else {
        this.aliases.delete(arg);
      }
    }
    return { stdout: '', stderr: '', exitCode: 0 };
  }

  private cmdMan(args: string[]): CommandResult {
    const operands = args.filter(arg => !arg.startsWith('-'));
    if (operands.length === 0) {
      return { stdout: '', stderr: "What manual page do you want? Try 'man ls'.", exitCode: 1 };
    }

    const topics = operands.filter(arg => !/^\d+$/.test(arg));
    if (topics.length === 0) {
      const topic = operands.at(-1) ?? '';
      return { stdout: '', stderr: `No manual entry for ${topic}`, exitCode: 1 };
    }

    const pages: string[] = [];
    let exitCode = 0;
    for (const topic of topics) {
      const command = getCommandDoc(topic);
      if (command) pages.push(renderManPage(command, topic));
      else {
        pages.push(`No manual entry for ${topic}`);
        exitCode = 1;
      }
    }
    return { stdout: pages.join('\n\n'), stderr: '', exitCode };
  }

  private cmdHelp(args: string[] = []): CommandResult {
    const topics = args.filter(arg => !arg.startsWith('-'));
    if (topics.length === 0) {
      return { stdout: renderCommandCatalog(), stderr: '', exitCode: 0 };
    }

    const output: string[] = [];
    let exitCode = 0;
    for (const topic of topics) {
      const command = getCommandDoc(topic);
      if (command) output.push(renderCommandHelp(command, topic));
      else {
        output.push(`bash: help: no help topics match '${topic}'. Try 'man ${topic}'.`);
        exitCode = 1;
      }
    }
    return { stdout: output.join('\n\n'), stderr: '', exitCode };
  }
  private cmdExit(): CommandResult {
    if (this.currentUser !== 'root') {
      this.currentUser = 'root';
      this.cwd = '/root';
      return { stdout: 'exit', stderr: '', exitCode: 0, cwd: this.cwd, currentUser: this.currentUser };
    }
    return { stdout: 'logout\nConnection to 192.168.1.50 closed.', stderr: '', exitCode: 0 };
  }

  // --- Helper methods ---

  public getUserGroups(username: string): string[] {
    const result: string[] = [];
    const user = this.users.get(username);
    if (!user) return result;

    for (const group of this.groups.values()) {
      if (group.gid === user.gid || group.members.includes(username)) {
        result.push(group.name);
      }
    }
    return result;
  }

  public getUserPrimaryGroup(username: string): string {
    const user = this.users.get(username);
    if (!user) return 'root';
    const grp = Array.from(this.groups.values()).find(g => g.gid === user.gid);
    return grp ? grp.name : username;
  }
}
