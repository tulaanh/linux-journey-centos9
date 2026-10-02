export type NodeType = 'file' | 'dir' | 'symlink';

export interface VFSNode {
  name: string;
  type: NodeType;
  mode: number; // e.g. 0o755 (octal)
  owner: string; // e.g. 'root'
  group: string; // e.g. 'root'
  size: number;
  mtime: Date;
  content?: string; // For files
  children?: Map<string, VFSNode>; // For directories
  target?: string; // For symlinks
}

export interface LinuxUser {
  uid: number;
  username: string;
  gid: number;
  home: string;
  shell: string;
  password?: string;
}

export interface LinuxGroup {
  gid: number;
  name: string;
  members: string[];
}

export interface SystemProcess {
  pid: number;
  ppid: number;
  user: string;
  cpu: number;
  mem: number;
  vsz: number;
  rss: number;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

export interface SystemdService {
  name: string;
  description: string;
  activeState: 'active' | 'inactive' | 'failed';
  unitFileState: 'enabled' | 'disabled';
  execStart: string;
  mainPid?: number;
}

export interface CronJob {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  command: string;
  user: string;
}

export interface YumPackage {
  name: string;
  version: string;
  release: string;
  arch: string;
  summary: string;
  description: string;
  installed: boolean;
  size: string;
  files: string[];
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  cwd?: string;
  currentUser?: string;
}

export interface LabCheck {
  id: string;
  title: string;
  description: string;
  points: number;
  hint: string;
}

export interface LabCheckResult {
  id: string;
  title: string;
  passed: boolean;
  message: string;
  pointsEarned: number;
  maxPoints: number;
  hint?: string;
}

export interface LabDefinition {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  estimatedTime: string;
  summary: string;
  scenario: string;
  tasks: string[];
  hints: string[];
  usefulCommands: string[];
  checks: LabCheck[];
  setupState: (kernel: any) => void;
  evaluate: (kernel: any) => LabCheckResult[];
}
