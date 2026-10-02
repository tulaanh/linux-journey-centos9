import type { VFSNode, NodeType } from '../types/linux';

export class VirtualFileSystem {
  private root: VFSNode;

  constructor() {
    this.root = this.createDefaultRoot();
  }

  private createDefaultRoot(): VFSNode {
    const rootNode: VFSNode = {
      name: '',
      type: 'dir',
      mode: 0o755,
      owner: 'root',
      group: 'root',
      size: 4096,
      mtime: new Date(),
      children: new Map(),
    };
    return rootNode;
  }

  // Canonicalize path: resolves . and .., removes redundant slashes
  public resolvePath(cwd: string, path: string): string {
    if (!path) return cwd;
    let fullPath = path.startsWith('/') ? path : `${cwd.replace(/\/$/, '')}/${path}`;
    
    const parts = fullPath.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  // Traverse to node given absolute normalized path
  public getNode(path: string): VFSNode | null {
    if (path === '/' || path === '') return this.root;

    const parts = path.split('/').filter(Boolean);
    let current: VFSNode = this.root;

    for (const part of parts) {
      if (current.type === 'symlink' && current.target) {
        const targetNode = this.getNode(current.target);
        if (!targetNode) return null;
        current = targetNode;
      }

      if (current.type !== 'dir' || !current.children) {
        return null;
      }

      const nextNode = current.children.get(part);
      if (!nextNode) return null;
      current = nextNode;
    }

    if (current.type === 'symlink' && current.target) {
      return this.getNode(current.target);
    }

    return current;
  }

  public getRawNode(path: string): VFSNode | null {
    if (path === '/' || path === '') return this.root;
    const parts = path.split('/').filter(Boolean);
    let current: VFSNode = this.root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (current.type !== 'dir' || !current.children) return null;
      const nextNode = current.children.get(part);
      if (!nextNode) return null;
      current = nextNode;
    }
    return current;
  }

  public exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  public isDirectory(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'dir';
  }

  public isFile(path: string): boolean {
    const node = this.getNode(path);
    return node !== null && node.type === 'file';
  }

  public fileExists(path: string): boolean {
    return this.isFile(path);
  }

  public removeFile(path: string): boolean {
    return this.unlink(path);
  }

  public mkdir(path: string, options: { recursive?: boolean; mode?: number; owner?: string; group?: string } = {}): boolean {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return true; // root exists

    let current = this.root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children) {
        current.children = new Map();
      }

      let child = current.children.get(part);
      if (!child) {
        if (!options.recursive && i < parts.length - 1) {
          return false;
        }
        child = {
          name: part,
          type: 'dir',
          mode: options.mode ?? 0o755,
          owner: options.owner ?? 'root',
          group: options.group ?? 'root',
          size: 4096,
          mtime: new Date(),
          children: new Map(),
        };
        current.children.set(part, child);
      } else if (child.type !== 'dir') {
        return false;
      }
      current = child;
    }
    return true;
  }

  public touch(path: string, options: { mode?: number; owner?: string; group?: string } = {}): boolean {
    const existing = this.getNode(path);
    if (existing) {
      existing.mtime = new Date();
      return true;
    }

    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) {
      return false;
    }

    const newFile: VFSNode = {
      name: filename,
      type: 'file',
      mode: options.mode ?? 0o644,
      owner: options.owner ?? 'root',
      group: options.group ?? 'root',
      size: 0,
      mtime: new Date(),
      content: '',
    };

    parentNode.children.set(filename, newFile);
    return true;
  }

  public writeFile(path: string, content: string, options: { append?: boolean; mode?: number; owner?: string; group?: string } = {}): boolean {
    const existing = this.getNode(path);
    if (existing) {
      if (existing.type !== 'file') return false;
      existing.content = options.append ? (existing.content || '') + content : content;
      existing.size = new TextEncoder().encode(existing.content).length;
      existing.mtime = new Date();
      return true;
    }

    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const filename = path.substring(path.lastIndexOf('/') + 1);
    
    // Auto-create parent if doesn't exist
    if (!this.exists(parentPath)) {
      this.mkdir(parentPath, { recursive: true, owner: options.owner, group: options.group });
    }

    const parentNode = this.getNode(parentPath);
    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) {
      return false;
    }

    const newFile: VFSNode = {
      name: filename,
      type: 'file',
      mode: options.mode ?? 0o644,
      owner: options.owner ?? 'root',
      group: options.group ?? 'root',
      size: new TextEncoder().encode(content).length,
      mtime: new Date(),
      content: content,
    };

    parentNode.children.set(filename, newFile);
    return true;
  }

  public readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content ?? '';
  }

  public readdir(path: string): VFSNode[] | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'dir' || !node.children) return null;
    return Array.from(node.children.values());
  }

  public unlink(path: string): boolean {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) return false;
    const target = parentNode.children.get(filename);
    if (!target || target.type === 'dir') return false;

    return parentNode.children.delete(filename);
  }

  public rmdir(path: string): boolean {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const dirname = path.substring(path.lastIndexOf('/') + 1);
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) return false;
    const target = parentNode.children.get(dirname);
    if (!target || target.type !== 'dir') return false;
    if (target.children && target.children.size > 0) return false; // not empty

    return parentNode.children.delete(dirname);
  }

  public rmRecursive(path: string): boolean {
    if (path === '/' || path === '') return false; // Cannot rm /
    const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
    const name = path.substring(path.lastIndexOf('/') + 1);
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) return false;
    return parentNode.children.delete(name);
  }

  public copy(sourcePath: string, destPath: string, recursive: boolean = false): boolean {
    const sourceNode = this.getNode(sourcePath);
    if (!sourceNode) return false;

    const sourceName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
    let targetPath = destPath;

    // If dest is existing directory, copy inside it
    if (this.isDirectory(destPath)) {
      targetPath = `${destPath.replace(/\/$/, '')}/${sourceName}`;
    }

    if (sourceNode.type === 'file') {
      return this.writeFile(targetPath, sourceNode.content || '', {
        mode: sourceNode.mode,
        owner: sourceNode.owner,
        group: sourceNode.group,
      });
    }

    if (sourceNode.type === 'dir') {
      if (!recursive) return false;
      this.mkdir(targetPath, {
        mode: sourceNode.mode,
        owner: sourceNode.owner,
        group: sourceNode.group,
        recursive: true,
      });

      if (sourceNode.children) {
        for (const [childName, _] of sourceNode.children) {
          const childSrc = `${sourcePath.replace(/\/$/, '')}/${childName}`;
          const childDst = `${targetPath.replace(/\/$/, '')}/${childName}`;
          this.copy(childSrc, childDst, true);
        }
      }
      return true;
    }

    return false;
  }

  public move(sourcePath: string, destPath: string): boolean {
    const sourceNode = this.getNode(sourcePath);
    if (!sourceNode) return false;

    const sourceName = sourcePath.substring(sourcePath.lastIndexOf('/') + 1);
    let targetPath = destPath;

    if (this.isDirectory(destPath)) {
      targetPath = `${destPath.replace(/\/$/, '')}/${sourceName}`;
    }

    const copied = this.copy(sourcePath, targetPath, true);
    if (copied) {
      this.rmRecursive(sourcePath);
      return true;
    }
    return false;
  }

  public chmod(path: string, mode: number | string, recursive: boolean = false): boolean {
    const node = this.getNode(path);
    if (!node) return false;

    let targetMode = 0;
    if (typeof mode === 'number') {
      targetMode = mode;
    } else {
      // Parse octal string like "755" or symbolic like "+x", "u+rw"
      if (/^[0-7]{3,4}$/.test(mode)) {
        targetMode = parseInt(mode, 8);
      } else {
        targetMode = this.applySymbolicMode(node.mode, mode);
      }
    }

    node.mode = targetMode;

    if (recursive && node.type === 'dir' && node.children) {
      for (const [_, child] of node.children) {
        this.chmodRecursive(child, mode);
      }
    }

    return true;
  }

  private chmodRecursive(node: VFSNode, mode: number | string) {
    if (typeof mode === 'number') {
      node.mode = mode;
    } else if (/^[0-7]{3,4}$/.test(mode)) {
      node.mode = parseInt(mode, 8);
    } else {
      node.mode = this.applySymbolicMode(node.mode, mode);
    }

    if (node.type === 'dir' && node.children) {
      for (const [_, child] of node.children) {
        this.chmodRecursive(child, mode);
      }
    }
  }

  private applySymbolicMode(currentMode: number, spec: string): number {
    let mode = currentMode;
    const parts = spec.split(',');
    for (const part of parts) {
      const match = part.match(/^([ugoa]*)([\+\-\=])([rwxXst]*)$/);
      if (!match) continue;
      let [, who, op, perm] = match;
      if (!who) who = 'a';

      let bits = 0;
      if (perm.includes('r')) bits |= 4;
      if (perm.includes('w')) bits |= 2;
      if (perm.includes('x')) bits |= 1;

      let mask = 0;
      if (who.includes('u') || who.includes('a')) mask |= (bits << 6);
      if (who.includes('g') || who.includes('a')) mask |= (bits << 3);
      if (who.includes('o') || who.includes('a')) mask |= bits;

      let clearMask = 0;
      if (who.includes('u') || who.includes('a')) clearMask |= (7 << 6);
      if (who.includes('g') || who.includes('a')) clearMask |= (7 << 3);
      if (who.includes('o') || who.includes('a')) clearMask |= 7;

      if (op === '+') {
        mode |= mask;
      } else if (op === '-') {
        mode &= ~mask;
      } else if (op === '=') {
        mode = (mode & ~clearMask) | mask;
      }
    }
    return mode;
  }

  public chown(path: string, owner: string, group?: string, recursive: boolean = false): boolean {
    const node = this.getNode(path);
    if (!node) return false;

    node.owner = owner;
    if (group) node.group = group;

    if (recursive && node.type === 'dir' && node.children) {
      for (const [_, child] of node.children) {
        this.chownRecursive(child, owner, group);
      }
    }
    return true;
  }

  private chownRecursive(node: VFSNode, owner: string, group?: string) {
    node.owner = owner;
    if (group) node.group = group;

    if (node.type === 'dir' && node.children) {
      for (const [_, child] of node.children) {
        this.chownRecursive(child, owner, group);
      }
    }
  }

  public createSymlink(target: string, linkPath: string): boolean {
    const parentPath = linkPath.substring(0, linkPath.lastIndexOf('/')) || '/';
    const linkName = linkPath.substring(linkPath.lastIndexOf('/') + 1);
    const parentNode = this.getNode(parentPath);

    if (!parentNode || parentNode.type !== 'dir' || !parentNode.children) return false;

    const symlinkNode: VFSNode = {
      name: linkName,
      type: 'symlink',
      mode: 0o777,
      owner: 'root',
      group: 'root',
      size: target.length,
      mtime: new Date(),
      target: target,
    };

    parentNode.children.set(linkName, symlinkNode);
    return true;
  }

  // Format mode to string: 0o755 -> -rwxr-xr-x or drwxr-xr-x
  public static modeToString(mode: number, type: NodeType): string {
    const typeChar = type === 'dir' ? 'd' : type === 'symlink' ? 'l' : '-';
    const chars = [
      (mode & 0o400) ? 'r' : '-',
      (mode & 0o200) ? 'w' : '-',
      (mode & 0o100) ? 'x' : '-',
      (mode & 0o040) ? 'r' : '-',
      (mode & 0o020) ? 'w' : '-',
      (mode & 0o010) ? 'x' : '-',
      (mode & 0o004) ? 'r' : '-',
      (mode & 0o002) ? 'w' : '-',
      (mode & 0o001) ? 'x' : '-',
    ];
    return typeChar + chars.join('');
  }

  public static modeToOctal(mode: number): string {
    return (mode & 0o7777).toString(8).padStart(3, '0');
  }

  // Check if a user has read/write/exec permission
  public checkPermission(node: VFSNode, user: string, groups: string[], action: 'read' | 'write' | 'exec'): boolean {
    if (user === 'root') return true; // root has full bypass

    let bit = 0;
    if (action === 'read') bit = 4;
    if (action === 'write') bit = 2;
    if (action === 'exec') bit = 1;

    // Check user bit
    if (node.owner === user) {
      return (node.mode & (bit << 6)) !== 0;
    }

    // Check group bit
    if (groups.includes(node.group)) {
      return (node.mode & (bit << 3)) !== 0;
    }

    // Check other bit
    return (node.mode & bit) !== 0;
  }

  // Clone entire VFS tree for snapshot / reset
  public clone(): VirtualFileSystem {
    const newFs = new VirtualFileSystem();
    newFs.root = this.cloneNode(this.root);
    return newFs;
  }

  private cloneNode(node: VFSNode): VFSNode {
    const copy: VFSNode = {
      name: node.name,
      type: node.type,
      mode: node.mode,
      owner: node.owner,
      group: node.group,
      size: node.size,
      mtime: new Date(node.mtime.getTime()),
      content: node.content,
      target: node.target,
    };

    if (node.children) {
      copy.children = new Map();
      for (const [k, v] of node.children.entries()) {
        copy.children.set(k, this.cloneNode(v));
      }
    }

    return copy;
  }

  // Reset to freshly populated CentOS VFS
  public resetToDefaultCentOS(): void {
    this.root = this.createDefaultRoot();
    this.populateCentOSDefaults();
  }

  public populateCentOSDefaults(): void {
    // Basic standard directories
    const dirs = [
      '/bin', '/boot', '/dev', '/etc', '/etc/systemd', '/etc/systemd/system',
      '/etc/sysconfig', '/etc/cron.d', '/etc/cron.daily', '/etc/yum.repos.d',
      '/home', '/home/centos', '/lib', '/lib64', '/media', '/mnt', '/opt',
      '/proc', '/root', '/run', '/sbin', '/srv', '/sys', '/tmp',
      '/usr', '/usr/bin', '/usr/sbin', '/usr/lib', '/usr/lib/systemd/system',
      '/usr/local', '/usr/local/bin', '/usr/share',
      '/var', '/var/log', '/var/log/nginx', '/var/spool', '/var/spool/cron',
      '/var/tmp', '/var/www', '/var/www/html'
    ];

    for (const dir of dirs) {
      this.mkdir(dir, { recursive: true, mode: dir === '/tmp' ? 0o1777 : 0o755 });
    }

    // User home permissions
    const centosHome = this.getNode('/home/centos');
    if (centosHome) {
      centosHome.owner = 'centos';
      centosHome.group = 'centos';
      centosHome.mode = 0o700;
    }

    const rootHome = this.getNode('/root');
    if (rootHome) {
      rootHome.owner = 'root';
      rootHome.group = 'root';
      rootHome.mode = 0o700;
    }

    // CentOS 9 Stream system files
    this.writeFile('/etc/redhat-release', 'CentOS Stream release 9\n');
    this.writeFile('/etc/centos-release', 'CentOS Stream release 9\n');
    this.writeFile('/etc/os-release', `NAME="CentOS Stream"
VERSION="9"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="9"
PLATFORM_ID="platform:el9"
PRETTY_NAME="CentOS Stream 9"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:9"
HOME_URL="https://centos.org/"
BUG_REPORT_URL="https://bugzilla.redhat.com/"
REDHAT_SUPPORT_PRODUCT="CentOS Stream"
REDHAT_SUPPORT_PRODUCT_VERSION="9"
`);

    this.writeFile('/etc/hostname', 'centos9.localdomain\n');
    this.writeFile('/etc/hosts', `127.0.0.1   localhost localhost.localdomain centos9 centos9.localdomain
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
`);

    this.writeFile('/etc/passwd', `root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/sbin/nologin
daemon:x:2:2:daemon:/sbin:/sbin/nologin
adm:x:3:4:adm:/var/adm:/sbin/nologin
lp:x:4:7:lp:/var/spool/lpd:/sbin/nologin
sync:x:5:0:sync:/sbin:/bin/sync
shutdown:x:6:0:shutdown:/sbin:/sbin/shutdown
halt:x:7:0:halt:/sbin:/sbin/halt
mail:x:8:12:mail:/var/spool/mail:/sbin/nologin
operator:x:11:0:operator:/root:/sbin/nologin
games:x:12:100:games:/usr/games:/sbin/nologin
ftp:x:14:50:FTP User:/var/ftp:/sbin/nologin
nobody:x:99:99:Nobody:/:/sbin/nologin
systemd-network:x:192:192:systemd Network Management:/:/sbin/nologin
dbus:x:81:81:System message bus:/:/sbin/nologin
polkitd:x:999:998:User for polkitd:/:/sbin/nologin
sshd:x:74:74:Privilege-separated SSH:/var/empty/sshd:/sbin/nologin
postfix:x:89:89::/var/spool/postfix:/sbin/nologin
chrony:x:998:996::/var/lib/chrony:/sbin/nologin
centos:x:1000:1000:CentOS Cloud User:/home/centos:/bin/bash
`);

    this.writeFile('/etc/group', `root:x:0:
bin:x:1:
daemon:x:2:
sys:x:3:
adm:x:4:
tty:x:5:
disk:x:6:
lp:x:7:
mem:x:8:
kmem:x:9:
wheel:x:10:centos
mail:x:12:postfix
ftp:x:50:
nobody:x:99:
systemd-journal:x:190:
sshd:x:74:
centos:x:1000:
`);

    this.writeFile('/etc/shadow', `root:$6$v.xYpLzQ$q/W0.Yc3aF1a8V0o2o12:19200:0:99999:7:::
centos:$6$kL81jZa.$3Z9g3qFmP8:19200:0:99999:7:::
`, { mode: 0o000, owner: 'root', group: 'root' });

    this.writeFile('/etc/sudoers', `## Sudoers allows particular users to run various commands as the root user
root    ALL=(ALL)       ALL
%wheel  ALL=(ALL)       NOPASSWD: ALL
`, { mode: 0o440 });

    this.writeFile('/etc/resolv.conf', `nameserver 8.8.8.8
nameserver 1.1.1.1
search localdomain
`);

    // Realistic system logs
    this.writeFile('/var/log/messages', `Oct  2 08:12:01 localhost systemd[1]: Starting System Logging Service...
Oct  2 08:12:01 localhost systemd[1]: Started System Logging Service.
Oct  2 08:12:02 localhost kernel: Initializing cgroup subsys cpuset
Oct  2 08:12:02 localhost kernel: Linux version 3.10.0-1160.el7.x86_64 (mockbuild@kbuilder.bsys.centos.org)
Oct  2 08:12:03 localhost systemd[1]: Starting Network Manager...
Oct  2 08:12:04 localhost NetworkManager[621]: <info>  [1696234324.12] NetworkManager (version 1.18.8-2.el7_9) is starting...
Oct  2 08:12:05 localhost sshd[912]: Server listening on 0.0.0.0 port 22.
Oct  2 08:12:05 localhost sshd[912]: Server listening on :: port 22.
Oct  2 08:12:06 localhost systemd[1]: Started OpenSSH server daemon.
Oct  2 08:15:22 localhost sshd[1240]: Failed password for invalid user admin from 192.168.1.150 port 54312 ssh2
Oct  2 08:15:25 localhost sshd[1240]: Failed password for invalid user admin from 192.168.1.150 port 54312 ssh2
Oct  2 08:15:30 localhost sshd[1243]: ERROR: Connection reset by peer [preauth]
Oct  2 08:18:44 localhost sshd[1301]: Failed password for root from 192.168.1.188 port 48210 ssh2
Oct  2 08:19:02 localhost systemd[1]: Started Session 1 of user centos.
Oct  2 08:20:11 localhost systemd[1]: ERROR: Failed to start Custom Analytics Reporter service. Unit not found.
Oct  2 08:25:00 localhost CROND[1422]: (root) CMD (/usr/lib64/sa/sa1 1 1)
Oct  2 08:30:15 localhost kernel: [Firmware Bug]: ACPI: BIOS _OSI(Linux) query ignored
Oct  2 08:35:00 localhost CROND[1510]: (root) CMD (/usr/lib64/sa/sa1 1 1)
Oct  2 08:42:19 localhost auditd[520]: Audit daemon rotating log files
Oct  2 08:45:00 localhost CROND[1602]: (root) CMD (/usr/lib64/sa/sa1 1 1)
`);

    this.writeFile('/var/log/messages', `Oct  2 08:12:01 centos9 systemd[1]: Starting System Logging Service...
Oct  2 08:12:01 centos9 systemd[1]: Started System Logging Service.
Oct  2 08:12:02 centos9 kernel: Linux version 5.14.0-362.el9.x86_64 (mockbuild@x86-04.stream.rdu2.redhat.com)
Oct  2 08:12:03 centos9 systemd[1]: Starting NetworkManager...
Oct  2 08:12:04 centos9 NetworkManager[621]: <info>  [1696234324.12] NetworkManager (version 1.42.2-1.el9) is starting...
Oct  2 08:12:05 centos9 sshd[912]: Server listening on 0.0.0.0 port 22.
Oct  2 08:12:06 centos9 systemd[1]: Started OpenSSH server daemon.
Oct  2 08:15:22 centos9 sshd[1240]: Failed password for invalid user admin from 192.168.1.150 port 54312 ssh2
Oct  2 08:15:25 centos9 sshd[1240]: Failed password for invalid user admin from 192.168.1.150 port 54312 ssh2
Oct  2 08:15:30 centos9 sshd[1243]: ERROR: Connection reset by peer [preauth]
Oct  2 08:18:44 centos9 sshd[1301]: Failed password for root from 192.168.1.188 port 48210 ssh2
Oct  2 08:19:02 centos9 systemd[1]: Started Session 1 of user centos.
Oct  2 08:20:11 centos9 systemd[1]: ERROR: Failed to start Custom Analytics Reporter service. Unit not found.
Oct  2 08:25:00 centos9 crond[1422]: (root) CMD (/usr/lib64/sa/sa1 1 1)
Oct  2 08:42:19 centos9 auditd[520]: Audit daemon rotating log files
Oct  2 08:45:00 centos9 crond[1602]: (root) CMD (/usr/lib64/sa/sa1 1 1)
`);

    this.writeFile('/var/log/secure', `Oct  2 08:12:06 centos9 sshd[912]: Server listening on 0.0.0.0 port 22.
Oct  2 08:15:22 centos9 sshd[1240]: Failed password for invalid user admin from 192.168.1.150 port 54312 ssh2
Oct  2 08:15:25 centos9 sshd[1240]: Failed password for invalid user admin from 192.168.1.150 port 54312 ssh2
Oct  2 08:18:44 centos9 sshd[1301]: Failed password for root from 192.168.1.188 port 48210 ssh2
Oct  2 08:19:02 centos9 sshd[1305]: Accepted publickey for centos from 192.168.1.2 port 51234 ssh2
Oct  2 08:19:02 centos9 sshd[1305]: pam_unix(sshd:session): session opened for user centos by (uid=0)
`);

    this.writeFile('/etc/yum.repos.d/centos.repo', `[baseos]
name=CentOS Stream 9 - BaseOS
metalink=https://mirrors.centos.org/metalink?repo=centos-baseos-9-stream&arch=$basearch&protocol=https,http
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
enabled=1

[appstream]
name=CentOS Stream 9 - AppStream
metalink=https://mirrors.centos.org/metalink?repo=centos-appstream-9-stream&arch=$basearch&protocol=https,http
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-centosofficial
gpgcheck=1
enabled=1
`);

    // Sample user bash profile & bashrc
    this.writeFile('/root/.bashrc', `# .bashrc
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Source global definitions
if [ -f /etc/bashrc ]; then
\t. /etc/bashrc
fi
`);

    this.writeFile('/home/centos/.bashrc', `# .bashrc
# Source global definitions
if [ -f /etc/bashrc ]; then
\t. /etc/bashrc
fi
`);

    // Standard /proc files mock
    this.writeFile('/proc/cpuinfo', `processor\t: 0
vendor_id\t: GenuineIntel
cpu family\t: 6
model_name\t: Intel(R) Xeon(R) Platinum 8375C CPU @ 2.80GHz
stepping\t: 2
cpu MHz\t\t: 2799.998
cache size\t: 55296 KB
physical id\t: 0
siblings\t: 2
core id\t\t: 0
cpu cores\t: 2
`);

    this.writeFile('/proc/meminfo', `MemTotal:        4044812 kB
MemFree:         2450120 kB
MemAvailable:    3320140 kB
Buffers:          124900 kB
Cached:          1124580 kB
SwapTotal:       2097148 kB
SwapFree:        2097148 kB
`);

    this.writeFile('/proc/version', 'Linux version 5.14.0-362.el9.x86_64 (mockbuild@x86-04.stream.rdu2.redhat.com) (gcc (GCC) 11.4.1 20230605 (Red Hat 11.4.1-2)) #1 SMP PREEMPT_DYNAMIC Wed Oct 11 17:30:01 UTC 2023\n');
  }
}
