import type { LabDefinition, LabCheckResult } from '../types/linux';
import { CentOSKernel } from './centosKernel';

export const COMMAND_LINE_LABS: LabDefinition[] = [
  // 1. The Shell
  {
    id: 1,
    slug: 'the-shell',
    title: 'The Shell',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn what the Linux shell is and how commands are executed.',
    scenario: 'The shell is an interface between the user and the kernel. On CentOS Stream 9, GNU Bash (Bourne-Again SHell) is the default interactive command language interpreter.',
    tasks: [
      'Kiểm tra shell mặc định đang sử dụng bằng lệnh `echo $SHELL`.',
      'Kiểm tra phiên bản Bash của hệ thống bằng lệnh `bash --version` (hoặc kiểm tra biến `$BASH_VERSION`).',
      'Kiểm tra thông tin hạt nhân Linux và kiến trúc hệ thống bằng lệnh `uname -a`.',
    ],
    hints: [
      'Gõ lệnh `echo $SHELL` và nhấn Enter để xem đường dẫn shell hiện tại (ví dụ `/bin/bash`).',
      'Gõ `bash --version` hoặc `echo $BASH_VERSION` để xem phiên bản Bash đang chạy.',
      'Gõ `uname -a` để xem hostname, phiên bản kernel 5.14.0 và kiến trúc x86_64.',
    ],
    usefulCommands: [
      'echo $SHELL - Hiển thị đường dẫn shell hiện hành',
      'bash --version - Kiểm tra phiên bản GNU Bash',
      'uname -a - In toàn bộ thông tin hệ điều hành và kernel',
      'whoami - In tên người dùng hiện tại',
    ],
    checks: [
      {
        id: 'shell-1',
        title: 'Kiểm tra biến $SHELL',
        description: 'Đã thực hiện kiểm tra biến môi trường $SHELL trong shell',
        points: 35,
        hint: 'Chạy: echo $SHELL',
      },
      {
        id: 'shell-2',
        title: 'Kiểm tra thông tin Bash version',
        description: 'Đã thực thi kiểm tra phiên bản bash',
        points: 35,
        hint: 'Chạy: bash --version hoặc echo $BASH_VERSION',
      },
      {
        id: 'shell-3',
        title: 'Kiểm tra thông tin hệ điều hành bằng uname',
        description: 'Đã thực thi lệnh uname -a để xem thông tin kernel',
        points: 30,
        hint: 'Chạy: uname -a',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {
      // Clean slate
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const checkedShell = hist.some(h => h.includes('echo $shell') || h.includes('echo "$shell"'));
      const checkedBash = hist.some(h => h.includes('bash --version') || h.includes('$bash_version'));
      const checkedUname = hist.some(h => h.startsWith('uname'));

      return [
        {
          id: 'shell-1',
          title: 'Kiểm tra biến $SHELL',
          passed: checkedShell,
          pointsEarned: checkedShell ? 35 : 0,
          maxPoints: 35,
          message: checkedShell ? 'Đã kiểm tra $SHELL thành công.' : 'Chưa chạy lệnh echo $SHELL.',
          hint: 'Chạy: echo $SHELL',
        },
        {
          id: 'shell-2',
          title: 'Kiểm tra thông tin Bash version',
          passed: checkedBash,
          pointsEarned: checkedBash ? 35 : 0,
          maxPoints: 35,
          message: checkedBash ? 'Đã kiểm tra phiên bản Bash thành công.' : 'Chưa chạy lệnh bash --version.',
          hint: 'Chạy: bash --version',
        },
        {
          id: 'shell-3',
          title: 'Kiểm tra thông tin hệ điều hành bằng uname',
          passed: checkedUname,
          pointsEarned: checkedUname ? 30 : 0,
          maxPoints: 30,
          message: checkedUname ? 'Đã xem thông tin uname thành công.' : 'Chưa chạy lệnh uname -a.',
          hint: 'Chạy: uname -a',
        },
      ];
    },
  },

  // 2. pwd (Print Working Directory)
  {
    id: 2,
    slug: 'pwd',
    title: 'pwd (Print Working Directory)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to use pwd to identify your current location in the Linux filesystem.',
    scenario: 'Trong Linux, bạn luôn hoạt động trong một thư mục làm việc hiện tại (working directory). Lệnh pwd sẽ in ra đường dẫn tuyệt đối bắt đầu từ gốc `/` đến vị trí hiện tại của bạn.',
    tasks: [
      'Chạy lệnh `pwd` tại thư mục hiện tại để xác định vị trí ban đầu (ví dụ `/root`).',
      'Di chuyển sang thư mục `/var/log` bằng lệnh `cd /var/log`.',
      'Tiếp tục chạy lại lệnh `pwd` để xác nhận thư mục làm việc đã thay đổi thành `/var/log`.',
    ],
    hints: [
      'Nhập `pwd` và gõ Enter.',
      'Dùng `cd /var/log` để di chuyển thư mục, sau đó gõ `pwd` một lần nữa.',
    ],
    usefulCommands: [
      'pwd - In đường dẫn thư mục hiện hành',
      'cd <path> - Đổi thư mục làm việc',
    ],
    checks: [
      {
        id: 'pwd-1',
        title: 'Thực thi lệnh pwd',
        description: 'Đã sử dụng lệnh pwd để in thư mục hiện hành',
        points: 50,
        hint: 'Chạy: pwd',
      },
      {
        id: 'pwd-2',
        title: 'Chuyển thư mục và kiểm tra lại vị trí',
        description: 'Vị trí hiện tại đang ở /var/log hoặc đã đổi thư mục và chạy pwd',
        points: 50,
        hint: 'Chạy: cd /var/log && pwd',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.cwd = '/root';
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const ranPwd = hist.some(h => h === 'pwd' || h.startsWith('pwd '));
      const atVarLogOrRan = kernel.cwd === '/var/log' || hist.some(h => h.includes('cd /var/log'));

      return [
        {
          id: 'pwd-1',
          title: 'Thực thi lệnh pwd',
          passed: ranPwd,
          pointsEarned: ranPwd ? 50 : 0,
          maxPoints: 50,
          message: ranPwd ? 'Đã chạy lệnh pwd chính xác.' : 'Chưa thực hiện lệnh pwd.',
          hint: 'Chạy: pwd',
        },
        {
          id: 'pwd-2',
          title: 'Chuyển thư mục và kiểm tra lại vị trí',
          passed: ranPwd && atVarLogOrRan,
          pointsEarned: ranPwd && atVarLogOrRan ? 50 : 0,
          maxPoints: 50,
          message: atVarLogOrRan ? 'Đã chuyển sang /var/log và xác nhận thư mục.' : 'Chưa chuyển đến /var/log.',
          hint: 'Chạy: cd /var/log sau đó gõ pwd',
        },
      ];
    },
  },

  // 3. cd (Change Directory)
  {
    id: 3,
    slug: 'cd',
    title: 'cd (Change Directory)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to use cd with paths and shortcuts to move through the Linux filesystem.',
    scenario: 'Lệnh cd cho phép bạn điều hướng cây thư mục. Các phím tắt quan trọng bao gồm: `cd /` (thư mục gốc), `cd ..` (lên thư mục cha), `cd ~` hoặc `cd` (về thư mục nhà), `cd -` (về thư mục trước đó).',
    tasks: [
      'Điều hướng đến thư mục `/etc/systemd` bằng đường dẫn tuyệt đối: `cd /etc/systemd`.',
      'Di chuyển lên 1 cấp thư mục cha (`/etc`) bằng phím tắt: `cd ..`.',
      'Quay trở về thư mục home của bạn bằng lệnh `cd ~` hoặc `cd`.',
    ],
    hints: [
      'Đường dẫn tuyệt đối luôn bắt đầu bằng dấu `/`, ví dụ `/etc/systemd`.',
      '`..` đại diện cho thư mục cấp cha ngay trên vị trí hiện tại.',
      '`~` là ký hiệu đại diện cho home directory của user hiện tại.',
    ],
    usefulCommands: [
      'cd /etc/systemd - Di chuyển đến thư mục chỉ định bằng đường dẫn tuyệt đối',
      'cd .. - Lên một cấp thư mục cha',
      'cd ~ - Trở về thư mục Home ($HOME)',
      'cd - - Trở về thư mục làm việc trước đó',
    ],
    checks: [
      {
        id: 'cd-1',
        title: 'Điều hướng đến /etc/systemd',
        description: 'Đã thực hiện di chuyển đến thư mục /etc/systemd',
        points: 40,
        hint: 'Chạy: cd /etc/systemd',
      },
      {
        id: 'cd-2',
        title: 'Sử dụng phím tắt cd ..',
        description: 'Đã dùng cd .. để di chuyển lên thư mục cha',
        points: 30,
        hint: 'Chạy: cd ..',
      },
      {
        id: 'cd-3',
        title: 'Quay về thư mục Home',
        description: 'Đã quay về thư mục Home (/root hoặc /home/centos)',
        points: 30,
        hint: 'Chạy: cd ~ hoặc cd',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.cwd = '/root';
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const toSystemd = hist.some(h => h === 'cd /etc/systemd' || h === 'cd /etc/systemd/');
      const dotDot = hist.some(h => h === 'cd ..' || h.startsWith('cd ../'));
      const homeOk = hist.some(h => h === 'cd' || h === 'cd ~' || h === 'cd ~/');

      return [
        {
          id: 'cd-1',
          title: 'Điều hướng đến /etc/systemd',
          passed: toSystemd,
          pointsEarned: toSystemd ? 40 : 0,
          maxPoints: 40,
          message: toSystemd ? 'Đã điều hướng đến /etc/systemd.' : 'Chưa điều hướng đến /etc/systemd.',
          hint: 'Chạy: cd /etc/systemd',
        },
        {
          id: 'cd-2',
          title: 'Sử dụng phím tắt cd ..',
          passed: dotDot,
          pointsEarned: dotDot ? 30 : 0,
          maxPoints: 30,
          message: dotDot ? 'Đã sử dụng cd .. thành công.' : 'Chưa sử dụng cd .. để lên thư mục cha.',
          hint: 'Chạy: cd ..',
        },
        {
          id: 'cd-3',
          title: 'Quay về thư mục Home',
          passed: homeOk,
          pointsEarned: homeOk ? 30 : 0,
          maxPoints: 30,
          message: homeOk ? 'Đã quay về thư mục Home.' : 'Chưa dùng cd hoặc cd ~ để về thư mục Home.',
          hint: 'Chạy: cd ~',
        },
      ];
    },
  },

  // 4. ls (List Directories)
  {
    id: 4,
    slug: 'ls',
    title: 'ls (List Directories)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to use ls options to inspect files, hidden entries, details, sizes, and sort order.',
    scenario: 'Lệnh ls liệt kê nội dung của thư mục. Thêm các tham số cờ như `-l` (long listing), `-a` (hiển thị file ẩn bắt đầu bằng dấu chấm), `-h` (kích thước human-readable) cho phép bạn quan sát toàn diện.',
    tasks: [
      'Liệt kê danh sách file ở thư mục `/etc` bằng lệnh `ls /etc`.',
      'Xem tất cả các file bao gồm file ẩn trong thư mục home bằng lệnh `ls -a` hoặc `ls -la`.',
      'Liệt kê chi tiết quyền hạn, chủ sở hữu, kích thước của `/var` bằng lệnh `ls -lh /var`.',
    ],
    hints: [
      'File ẩn trong Linux bắt đầu bằng dấu chấm `.` (ví dụ: `.bashrc`, `.bash_profile`). Dùng cờ `-a` để xem.',
      'Cờ `-l` hiển thị định dạng danh sách dài với đầy đủ quyền, user, nhóm và thời gian sửa đổi.',
      'Cờ `-lh` hiển thị kích thước theo dạng K, M, G dễ đọc.',
    ],
    usefulCommands: [
      'ls - Liệt kê file và thư mục',
      'ls -a - Liệt kê toàn bộ file kể cả file ẩn',
      'ls -l - Liệt kê dạng danh sách chi tiết',
      'ls -lh - Liệt kê chi tiết kèm đơn vị dung lượng dễ đọc',
    ],
    checks: [
      {
        id: 'ls-1',
        title: 'Liệt kê danh sách thư mục /etc',
        description: 'Đã thực hiện lệnh ls /etc',
        points: 30,
        hint: 'Chạy: ls /etc',
      },
      {
        id: 'ls-2',
        title: 'Xem file ẩn với tuỳ chọn -a',
        description: 'Đã thực hiện lệnh ls -a hoặc ls -la',
        points: 40,
        hint: 'Chạy: ls -a hoặc ls -la',
      },
      {
        id: 'ls-3',
        title: 'Xem chi tiết với tuỳ chọn -l',
        description: 'Đã thực hiện lệnh ls -l hoặc ls -lh',
        points: 30,
        hint: 'Chạy: ls -l /var hoặc ls -lh /var',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.cwd = '/root';
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const lsEtc = hist.some(h => h.includes('ls') && h.includes('/etc'));
      const lsA = hist.some(h => h.includes('ls') && (h.includes('-a') || h.includes('-la') || h.includes('-al')));
      const lsL = hist.some(h => h.includes('ls') && (h.includes('-l') || h.includes('-lh')));

      return [
        {
          id: 'ls-1',
          title: 'Liệt kê danh sách thư mục /etc',
          passed: lsEtc,
          pointsEarned: lsEtc ? 30 : 0,
          maxPoints: 30,
          message: lsEtc ? 'Đã liệt kê thư mục /etc.' : 'Chưa chạy ls /etc.',
          hint: 'Chạy: ls /etc',
        },
        {
          id: 'ls-2',
          title: 'Xem file ẩn với tuỳ chọn -a',
          passed: lsA,
          pointsEarned: lsA ? 40 : 0,
          maxPoints: 40,
          message: lsA ? 'Đã xem file ẩn thành công.' : 'Chưa dùng cờ -a với ls.',
          hint: 'Chạy: ls -la',
        },
        {
          id: 'ls-3',
          title: 'Xem chi tiết với tuỳ chọn -l',
          passed: lsL,
          pointsEarned: lsL ? 30 : 0,
          maxPoints: 30,
          message: lsL ? 'Đã xem danh sách định dạng chi tiết.' : 'Chưa dùng cờ -l với ls.',
          hint: 'Chạy: ls -lh /var',
        },
      ];
    },
  },

  // 5. touch
  {
    id: 5,
    slug: 'touch',
    title: 'touch',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to create empty files and manage file timestamps with the touch command.',
    scenario: 'Lệnh touch dùng để tạo một file rỗng mới nếu file đó chưa tồn tại, hoặc cập nhật thời gian truy cập/sửa đổi (access & modification timestamps) của file hiện có mà không làm thay đổi nội dung.',
    tasks: [
      'Tạo một file mới rỗng có tên `server.log` trong thư mục `/tmp` bằng lệnh `touch /tmp/server.log`.',
      'Tạo một file thứ hai có tên `deploy.txt` trong thư mục hiện tại của bạn.',
      'Dùng `ls -l /tmp/server.log` để kiểm tra kích thước file (0 bytes) và thời gian vừa được tạo.',
    ],
    hints: [
      'Cú pháp: `touch <ten_file>`.',
      'Nếu đường dẫn chứa thư mục cha, thư mục cha đó phải tồn tại trước khi touch.',
    ],
    usefulCommands: [
      'touch filename - Tạo file rỗng hoặc cập nhật timestamp',
      'touch file1 file2 - Tạo nhiều file cùng lúc',
      'ls -l filename - Kiểm tra kích thước và thời gian sửa đổi',
    ],
    checks: [
      {
        id: 'touch-1',
        title: 'Tạo file /tmp/server.log',
        description: 'File /tmp/server.log đã được tạo thành công trong hệ thống',
        points: 50,
        hint: 'Chạy: touch /tmp/server.log',
      },
      {
        id: 'touch-2',
        title: 'Tạo file deploy.txt',
        description: 'File deploy.txt tồn tại trong thư mục làm việc',
        points: 50,
        hint: 'Chạy: touch deploy.txt',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.removeFile('/tmp/server.log');
      kernel.vfs.removeFile(`${kernel.cwd}/deploy.txt`);
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const serverLogExists = kernel.vfs.fileExists('/tmp/server.log');
      const deployExists = kernel.vfs.fileExists(`${kernel.cwd}/deploy.txt`) || kernel.vfs.fileExists('/root/deploy.txt');

      return [
        {
          id: 'touch-1',
          title: 'Tạo file /tmp/server.log',
          passed: serverLogExists,
          pointsEarned: serverLogExists ? 50 : 0,
          maxPoints: 50,
          message: serverLogExists ? 'File /tmp/server.log đã được tạo.' : 'Chưa tìm thấy /tmp/server.log.',
          hint: 'Chạy: touch /tmp/server.log',
        },
        {
          id: 'touch-2',
          title: 'Tạo file deploy.txt',
          passed: deployExists,
          pointsEarned: deployExists ? 50 : 0,
          maxPoints: 50,
          message: deployExists ? 'File deploy.txt đã được tạo.' : 'Chưa tìm thấy file deploy.txt.',
          hint: 'Chạy: touch deploy.txt',
        },
      ];
    },
  },

  // 6. file
  {
    id: 6,
    slug: 'file',
    title: 'file',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: "Learn how to identify a file's likely content type without relying on its name or extension.",
    scenario: 'Khác với Windows dựa vào phần mở rộng (.txt, .exe), Linux kiểm tra chữ ký ma thuật (magic numbers) và cấu trúc dữ liệu để xác định loại tệp thực sự thông qua tiện ích `file`.',
    tasks: [
      'Kiểm tra loại file của `/etc/passwd` bằng lệnh `file /etc/passwd` (kết quả sẽ là ASCII text).',
      'Kiểm tra file nhị phân thực thi của Bash bằng lệnh `file /bin/bash` (kết quả là ELF 64-bit executable).',
      'Kiểm tra loại tệp của thư mục `/etc` bằng lệnh `file /etc` (kết quả là directory).',
    ],
    hints: [
      'Chạy cú pháp: `file <duong_dan_file>`.',
      'Thử nghiệm với các tệp tin hệ thống khác nhau để quan sát sự khác biệt.',
    ],
    usefulCommands: [
      'file /etc/passwd - Xác định loại tệp văn bản',
      'file /bin/bash - Xác định tệp nhị phân thực thi ELF',
      'file /etc - Xác định thư mục',
    ],
    checks: [
      {
        id: 'file-1',
        title: 'Kiểm tra file text /etc/passwd',
        description: 'Đã chạy lệnh file /etc/passwd',
        points: 40,
        hint: 'Chạy: file /etc/passwd',
      },
      {
        id: 'file-2',
        title: 'Kiểm tra file thực thi ELF /bin/bash',
        description: 'Đã chạy lệnh file /bin/bash hoặc file /bin/ls',
        points: 30,
        hint: 'Chạy: file /bin/bash',
      },
      {
        id: 'file-3',
        title: 'Kiểm tra thư mục với file',
        description: 'Đã chạy lệnh file /etc hoặc thư mục bất kỳ',
        points: 30,
        hint: 'Chạy: file /etc',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const textCheck = hist.some(h => h.includes('file') && h.includes('passwd'));
      const elfCheck = hist.some(h => h.includes('file') && (h.includes('/bin/bash') || h.includes('/usr/bin/bash') || h.includes('/bin/ls')));
      const dirCheck = hist.some(h => h.includes('file') && (h.includes('/etc') || h.includes('/var') || h.includes('/tmp')));

      return [
        {
          id: 'file-1',
          title: 'Kiểm tra file text /etc/passwd',
          passed: textCheck,
          pointsEarned: textCheck ? 40 : 0,
          maxPoints: 40,
          message: textCheck ? 'Đã kiểm tra file text bằng lệnh file.' : 'Chưa chạy file /etc/passwd.',
          hint: 'Chạy: file /etc/passwd',
        },
        {
          id: 'file-2',
          title: 'Kiểm tra file thực thi ELF /bin/bash',
          passed: elfCheck,
          pointsEarned: elfCheck ? 30 : 0,
          maxPoints: 30,
          message: elfCheck ? 'Đã kiểm tra file thực thi ELF.' : 'Chưa chạy file /bin/bash.',
          hint: 'Chạy: file /bin/bash',
        },
        {
          id: 'file-3',
          title: 'Kiểm tra thư mục với file',
          passed: dirCheck,
          pointsEarned: dirCheck ? 30 : 0,
          maxPoints: 30,
          message: dirCheck ? 'Đã kiểm tra thư mục bằng lệnh file.' : 'Chưa chạy file /etc.',
          hint: 'Chạy: file /etc',
        },
      ];
    },
  },

  // 7. cat
  {
    id: 7,
    slug: 'cat',
    title: 'cat',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to display, concatenate, and redirect file content safely with the cat command.',
    scenario: 'Lệnh cat (concatenate) cho phép in toàn bộ nội dung file ra màn hình, nối nhiều file lại với nhau, hoặc kết hợp với toán tử chuyển hướng `>` để tạo và ghi nội dung vào file.',
    tasks: [
      'In ra thông tin bản phân phối CentOS Stream 9 bằng lệnh `cat /etc/os-release`.',
      'Tạo file mới `/tmp/welcome.txt` chứa nội dung `Hello CentOS Stream 9` bằng lệnh chuyển hướng: `echo "Hello CentOS Stream 9" > /tmp/welcome.txt`.',
      'Hiển thị nội dung vừa tạo bằng lệnh `cat /tmp/welcome.txt`.',
    ],
    hints: [
      'Dùng `cat /etc/os-release` để đọc thông tin hệ điều hành.',
      'Toán tử `>` chuyển hướng đầu ra tiêu chuẩn vào file.',
    ],
    usefulCommands: [
      'cat filename - In toàn bộ nội dung file ra terminal',
      'cat -n filename - Đánh số thứ tự từng dòng khi in',
      'echo "text" > filename - Ghi đè chuỗi ký tự vào file',
    ],
    checks: [
      {
        id: 'cat-1',
        title: 'Xem /etc/os-release bằng cat',
        description: 'Đã thực thi cat /etc/os-release',
        points: 40,
        hint: 'Chạy: cat /etc/os-release',
      },
      {
        id: 'cat-2',
        title: 'Tạo file /tmp/welcome.txt',
        description: 'File /tmp/welcome.txt chứa chuỗi Hello CentOS Stream 9',
        points: 60,
        hint: 'Chạy: echo "Hello CentOS Stream 9" > /tmp/welcome.txt',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.removeFile('/tmp/welcome.txt');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const catOs = hist.some(h => h.includes('cat') && h.includes('os-release'));
      const content = kernel.vfs.readFile('/tmp/welcome.txt') ?? '';
      const fileOk = content.includes('Hello CentOS Stream 9');

      return [
        {
          id: 'cat-1',
          title: 'Xem /etc/os-release bằng cat',
          passed: catOs,
          pointsEarned: catOs ? 40 : 0,
          maxPoints: 40,
          message: catOs ? 'Đã xem os-release thành công.' : 'Chưa chạy lệnh cat /etc/os-release.',
          hint: 'Chạy: cat /etc/os-release',
        },
        {
          id: 'cat-2',
          title: 'Tạo file /tmp/welcome.txt',
          passed: fileOk,
          pointsEarned: fileOk ? 60 : 0,
          maxPoints: 60,
          message: fileOk ? 'File /tmp/welcome.txt có nội dung hợp lệ.' : 'Chưa tạo file /tmp/welcome.txt hoặc thiếu nội dung yêu cầu.',
          hint: 'Chạy: echo "Hello CentOS Stream 9" > /tmp/welcome.txt',
        },
      ];
    },
  },

  // 8. less
  {
    id: 8,
    slug: 'less',
    title: 'less',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to navigate, search, and follow long text files interactively with less.',
    scenario: 'Khi xem các file dài (như log hệ thống, cấu hình), lệnh `cat` sẽ làm trôi màn hình. Lệnh `less` là một công cụ pager cho phép bạn cuộn trang, tìm kiếm và điều hướng mượt mà từng màn hình một.',
    tasks: [
      'Mở xem file cấu hình tài khoản hệ thống `/etc/passwd` bằng lệnh `less /etc/passwd`.',
      'Thực hành xem file cấu hình mạng `/etc/hosts` bằng lệnh `less /etc/hosts` (hoặc `more /etc/hosts`).',
    ],
    hints: [
      'Chạy: `less /etc/passwd`. Trong terminal tương tác, nhấn phím bất kỳ hoặc gõ lệnh tiếp theo.',
    ],
    usefulCommands: [
      'less filename - Mở xem file dưới dạng trang phân trang',
      'more filename - Phân trang cơ bản',
    ],
    checks: [
      {
        id: 'less-1',
        title: 'Xem file /etc/passwd bằng less',
        description: 'Đã thực hiện lệnh less /etc/passwd',
        points: 50,
        hint: 'Chạy: less /etc/passwd',
      },
      {
        id: 'less-2',
        title: 'Thực hành pager với lệnh less hoặc more',
        description: 'Đã trải nghiệm điều hướng file văn bản qua less/more',
        points: 50,
        hint: 'Chạy: less /etc/hosts hoặc less /etc/services',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const ranPasswd = hist.some(h => (h.startsWith('less ') || h.startsWith('more ')) && h.includes('passwd'));
      const ranOther = hist.some(h => (h.startsWith('less ') || h.startsWith('more ')) && (h.includes('hosts') || h.includes('services') || h.includes('os-release')));

      const p1 = ranPasswd;
      const p2 = ranOther || hist.filter(h => h.startsWith('less ') || h.startsWith('more ')).length >= 2;

      return [
        {
          id: 'less-1',
          title: 'Xem file /etc/passwd bằng less',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã mở file bằng less thành công.' : 'Chưa chạy lệnh less /etc/passwd.',
          hint: 'Chạy: less /etc/passwd',
        },
        {
          id: 'less-2',
          title: 'Thực hành pager với lệnh less hoặc more',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã hoàn thành bài thực hành phân trang văn bản.' : 'Hãy chạy thêm một lệnh less với file khác (ví dụ: less /etc/hosts).',
          hint: 'Chạy: less /etc/hosts',
        },
      ];
    },
  },

  // 9. history
  {
    id: 9,
    slug: 'history',
    title: 'history',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to inspect, search, reuse, and manage command history in Bash.',
    scenario: 'Bash tự động lưu trữ các lệnh bạn vừa nhập vào bộ đệm và ghi vào file `~/.bash_history`. Tiện ích `history` giúp bạn xem lại các lệnh đã gõ, tái sử dụng nhanh bằng số thứ tự.',
    tasks: [
      'Liệt kê danh sách các lệnh bạn đã gõ từ đầu phiên làm việc bằng lệnh `history`.',
      'Thực thi một vài lệnh kiểm tra hệ thống như `date` và `whoami`, sau đó chạy lại `history` để xem lịch sử được cập nhật.',
    ],
    hints: [
      'Gõ `history` để xem danh sách kèm số thứ tự.',
      'Trong Bash thật, bạn có thể gõ `!10` để chạy lại lệnh số 10 hoặc nhấn phím Mũi tên Lên.',
    ],
    usefulCommands: [
      'history - Hiển thị toàn bộ lịch sử lệnh kèm số ID',
      'history 10 - Chỉ hiển thị 10 lệnh gần nhất',
    ],
    checks: [
      {
        id: 'hist-1',
        title: 'Xem lịch sử lệnh với history',
        description: 'Đã thực hiện lệnh history trong terminal',
        points: 50,
        hint: 'Chạy: history',
      },
      {
        id: 'hist-2',
        title: 'Thực thi các lệnh và cập nhật lịch sử',
        description: 'Lịch sử có chứa lệnh date hoặc whoami',
        points: 50,
        hint: 'Chạy: date hoặc whoami rồi gõ history',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const ranHist = hist.some(h => h.startsWith('history'));
      const ranBonus = hist.some(h => h === 'date' || h === 'whoami' || h.startsWith('echo '));

      return [
        {
          id: 'hist-1',
          title: 'Xem lịch sử lệnh với history',
          passed: ranHist,
          pointsEarned: ranHist ? 50 : 0,
          maxPoints: 50,
          message: ranHist ? 'Đã xem danh sách history.' : 'Chưa chạy lệnh history.',
          hint: 'Chạy: history',
        },
        {
          id: 'hist-2',
          title: 'Thực thi các lệnh và cập nhật lịch sử',
          passed: ranHist && ranBonus,
          pointsEarned: ranHist && ranBonus ? 50 : 0,
          maxPoints: 50,
          message: ranBonus ? 'Lịch sử phiên làm việc đã được cập nhật.' : 'Hãy chạy lệnh date hoặc whoami.',
          hint: 'Chạy: date sau đó chạy history',
        },
      ];
    },
  },

  // 10. cp (Copy)
  {
    id: 10,
    slug: 'cp',
    title: 'cp (Copy)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to copy files and directory trees while controlling overwrites and preserved attributes.',
    scenario: 'Lệnh cp tạo bản sao của file hoặc thư mục. Đối với thư mục, bạn cần thêm cờ đệ quy `-r` (recursive) để sao chép toàn bộ cây thư mục con bên trong.',
    tasks: [
      'Sao chép file `/etc/hosts` sang vị trí mới `/tmp/hosts.backup` bằng lệnh `cp /etc/hosts /tmp/hosts.backup`.',
      'Sao chép thư mục `/etc/default` sang `/tmp/default_backup` bằng cờ đệ quy: `cp -r /etc/default /tmp/default_backup`.',
    ],
    hints: [
      'Cú pháp: `cp <nguon> <dich>`.',
      'Nếu sao chép thư mục: `cp -r <thu_muc_nguon> <thu_muc_dich>`.',
    ],
    usefulCommands: [
      'cp file.txt file.bak - Sao chép file',
      'cp -r dir1 dir2 - Sao chép toàn bộ thư mục đệ quy',
      'cp -i file1 file2 - Nhắc xác nhận trước khi ghi đè',
    ],
    checks: [
      {
        id: 'cp-1',
        title: 'Bản sao /tmp/hosts.backup',
        description: 'File /tmp/hosts.backup đã được sao chép chính xác từ /etc/hosts',
        points: 50,
        hint: 'Chạy: cp /etc/hosts /tmp/hosts.backup',
      },
      {
        id: 'cp-2',
        title: 'Bản sao thư mục /tmp/default_backup',
        description: 'Thư mục /tmp/default_backup đã được sao chép đệ quy',
        points: 50,
        hint: 'Chạy: cp -r /etc/default /tmp/default_backup',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.removeFile('/tmp/hosts.backup');
      kernel.vfs.rmRecursive('/tmp/default_backup');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hostsBak = kernel.vfs.fileExists('/tmp/hosts.backup');
      const dirBak = kernel.vfs.isDirectory('/tmp/default_backup');

      return [
        {
          id: 'cp-1',
          title: 'Bản sao /tmp/hosts.backup',
          passed: hostsBak,
          pointsEarned: hostsBak ? 50 : 0,
          maxPoints: 50,
          message: hostsBak ? 'Đã sao chép file hosts.backup thành công.' : 'Chưa tìm thấy /tmp/hosts.backup.',
          hint: 'Chạy: cp /etc/hosts /tmp/hosts.backup',
        },
        {
          id: 'cp-2',
          title: 'Bản sao thư mục /tmp/default_backup',
          passed: dirBak,
          pointsEarned: dirBak ? 50 : 0,
          maxPoints: 50,
          message: dirBak ? 'Đã sao chép thư mục đệ quy thành công.' : 'Chưa tìm thấy thư mục /tmp/default_backup.',
          hint: 'Chạy: cp -r /etc/default /tmp/default_backup',
        },
      ];
    },
  },

  // 11. mv (Move)
  {
    id: 11,
    slug: 'mv',
    title: 'mv (Move)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to rename and move files or directories while avoiding unintended overwrites.',
    scenario: 'Lệnh mv dùng cho cả 2 thao tác: đổi tên (rename) file/thư mục và di chuyển (move) chúng đến một vị trí mới trên cây tệp tin mà không tạo bản sao thừa.',
    tasks: [
      'Tạo file thử nghiệm `/tmp/draft.txt` bằng lệnh `touch /tmp/draft.txt`.',
      'Đổi tên file `/tmp/draft.txt` thành `/tmp/final_report.txt` bằng lệnh `mv /tmp/draft.txt /tmp/final_report.txt`.',
      'Di chuyển file `/tmp/final_report.txt` vào thư mục `/var/tmp/` bằng lệnh `mv /tmp/final_report.txt /var/tmp/`.',
    ],
    hints: [
      'Đổi tên: `mv <ten_cu> <ten_moi>`.',
      'Di chuyển vào thư mục: `mv <duong_dan_file> <duong_dan_thu_muc>/`.',
    ],
    usefulCommands: [
      'mv old.txt new.txt - Đổi tên tệp tin',
      'mv file.txt /path/to/dir/ - Di chuyển tệp tin vào thư mục',
    ],
    checks: [
      {
        id: 'mv-1',
        title: 'Đổi tên file draft.txt thành final_report.txt',
        description: 'File draft.txt không còn trong /tmp và đã được đổi tên',
        points: 50,
        hint: 'Chạy: mv /tmp/draft.txt /tmp/final_report.txt',
      },
      {
        id: 'mv-2',
        title: 'Di chuyển file vào /var/tmp/',
        description: 'File /var/tmp/final_report.txt tồn tại hợp lệ',
        points: 50,
        hint: 'Chạy: mv /tmp/final_report.txt /var/tmp/',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.writeFile('/tmp/draft.txt', 'Draft report content');
      kernel.vfs.removeFile('/tmp/final_report.txt');
      kernel.vfs.removeFile('/var/tmp/final_report.txt');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const draftGone = !kernel.vfs.fileExists('/tmp/draft.txt');
      const inVarTmp = kernel.vfs.fileExists('/var/tmp/final_report.txt');

      return [
        {
          id: 'mv-1',
          title: 'Đổi tên file draft.txt thành final_report.txt',
          passed: draftGone,
          pointsEarned: draftGone ? 50 : 0,
          maxPoints: 50,
          message: draftGone ? 'File draft.txt đã được di chuyển/đổi tên.' : 'File /tmp/draft.txt vẫn còn tồn tại.',
          hint: 'Chạy: mv /tmp/draft.txt /tmp/final_report.txt',
        },
        {
          id: 'mv-2',
          title: 'Di chuyển file vào /var/tmp/',
          passed: inVarTmp,
          pointsEarned: inVarTmp ? 50 : 0,
          maxPoints: 50,
          message: inVarTmp ? 'File final_report.txt đã nằm trong /var/tmp/.' : 'Chưa tìm thấy /var/tmp/final_report.txt.',
          hint: 'Chạy: mv /tmp/final_report.txt /var/tmp/',
        },
      ];
    },
  },

  // 12. mkdir (Make Directory)
  {
    id: 12,
    slug: 'mkdir',
    title: 'mkdir (Make Directory)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to create single, multiple, and nested directories with mkdir options.',
    scenario: 'Lệnh mkdir dùng để tạo thư mục mới. Cờ quan trọng nhất là `-p` (parents) cho phép tạo toàn bộ cây thư mục cha-con lồng nhau chỉ trong một lệnh duy nhất mà không báo lỗi nếu thư mục đã tồn tại.',
    tasks: [
      'Tạo một thư mục đơn có tên `/tmp/lab_workspace` bằng lệnh `mkdir /tmp/lab_workspace`.',
      'Tạo một cây thư mục lồng nhau sâu `/tmp/lab_workspace/project/src/components` chỉ bằng 1 lệnh duy nhất với cờ `-p`.',
    ],
    hints: [
      'Sử dụng tham số `-p`: `mkdir -p /tmp/lab_workspace/project/src/components`.',
    ],
    usefulCommands: [
      'mkdir mydir - Tạo một thư mục',
      'mkdir dir1 dir2 dir3 - Tạo nhiều thư mục cùng lúc',
      'mkdir -p path/to/nested/dir - Tạo cả chuỗi thư mục lồng nhau',
    ],
    checks: [
      {
        id: 'mkdir-1',
        title: 'Tạo thư mục /tmp/lab_workspace',
        description: 'Thư mục /tmp/lab_workspace đã được tạo thành công',
        points: 40,
        hint: 'Chạy: mkdir /tmp/lab_workspace',
      },
      {
        id: 'mkdir-2',
        title: 'Tạo cây thư mục lồng nhau với cờ -p',
        description: 'Đường dẫn /tmp/lab_workspace/project/src/components tồn tại',
        points: 60,
        hint: 'Chạy: mkdir -p /tmp/lab_workspace/project/src/components',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.rmRecursive('/tmp/lab_workspace');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const baseOk = kernel.vfs.isDirectory('/tmp/lab_workspace');
      const nestedOk = kernel.vfs.isDirectory('/tmp/lab_workspace/project/src/components');

      return [
        {
          id: 'mkdir-1',
          title: 'Tạo thư mục /tmp/lab_workspace',
          passed: baseOk,
          pointsEarned: baseOk ? 40 : 0,
          maxPoints: 40,
          message: baseOk ? 'Thư mục /tmp/lab_workspace đã được tạo.' : 'Chưa tìm thấy /tmp/lab_workspace.',
          hint: 'Chạy: mkdir /tmp/lab_workspace',
        },
        {
          id: 'mkdir-2',
          title: 'Tạo cây thư mục lồng nhau với cờ -p',
          passed: nestedOk,
          pointsEarned: nestedOk ? 60 : 0,
          maxPoints: 60,
          message: nestedOk ? 'Đã tạo đầy đủ cây thư mục lồng nhau.' : 'Chưa tạo cây thư mục /tmp/lab_workspace/project/src/components.',
          hint: 'Chạy: mkdir -p /tmp/lab_workspace/project/src/components',
        },
      ];
    },
  },

  // 13. rm (Remove)
  {
    id: 13,
    slug: 'rm',
    title: 'rm (Remove)',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to remove files and directories while checking targets and choosing safer rm options.',
    scenario: 'Lệnh rm xoá vĩnh viễn tệp và thư mục (trong Linux không có Thùng rác mặc định ở terminal!). Để xoá thư mục cùng toàn bộ tệp bên trong, bạn cần dùng cờ `-r` hoặc `-rf`.',
    tasks: [
      'Hệ thống đã chuẩn bị sẵn file rác `/tmp/junk_file.log`. Hãy xoá nó bằng lệnh `rm /tmp/junk_file.log`.',
      'Hệ thống cũng chuẩn bị sẵn thư mục `/tmp/obsolete_data` chứa các file con. Hãy xoá toàn bộ thư mục này bằng lệnh `rm -r /tmp/obsolete_data`.',
    ],
    hints: [
      'Xoá file: `rm <ten_file>`.',
      'Xoá thư mục: `rm -r <ten_thu_muc>`.',
      'Cẩn trọng tuyệt đối: không bao giờ chạy `rm -rf /` trên hệ thống thật!',
    ],
    usefulCommands: [
      'rm file.txt - Xoá tệp tin',
      'rm -r folder/ - Xoá thư mục và tất cả nội dung đệ quy',
      'rm -i file.txt - Nhắc xác nhận trước khi xoá (an toàn hơn)',
    ],
    checks: [
      {
        id: 'rm-1',
        title: 'Xoá file rác /tmp/junk_file.log',
        description: 'File /tmp/junk_file.log đã bị xoá khỏi hệ thống',
        points: 50,
        hint: 'Chạy: rm /tmp/junk_file.log',
      },
      {
        id: 'rm-2',
        title: 'Xoá thư mục /tmp/obsolete_data bằng cờ -r',
        description: 'Thư mục /tmp/obsolete_data đã bị xoá hoàn toàn',
        points: 50,
        hint: 'Chạy: rm -r /tmp/obsolete_data',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.writeFile('/tmp/junk_file.log', 'temporary junk content');
      kernel.vfs.mkdir('/tmp/obsolete_data');
      kernel.vfs.writeFile('/tmp/obsolete_data/item1.dat', 'data 1');
      kernel.vfs.writeFile('/tmp/obsolete_data/item2.dat', 'data 2');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const fileGone = !kernel.vfs.fileExists('/tmp/junk_file.log');
      const dirGone = !kernel.vfs.isDirectory('/tmp/obsolete_data');

      return [
        {
          id: 'rm-1',
          title: 'Xoá file rác /tmp/junk_file.log',
          passed: fileGone,
          pointsEarned: fileGone ? 50 : 0,
          maxPoints: 50,
          message: fileGone ? 'Đã xoá /tmp/junk_file.log thành công.' : 'File /tmp/junk_file.log vẫn còn tồn tại.',
          hint: 'Chạy: rm /tmp/junk_file.log',
        },
        {
          id: 'rm-2',
          title: 'Xoá thư mục /tmp/obsolete_data bằng cờ -r',
          passed: dirGone,
          pointsEarned: dirGone ? 50 : 0,
          maxPoints: 50,
          message: dirGone ? 'Đã xoá thư mục đệ quy thành công.' : 'Thư mục /tmp/obsolete_data vẫn còn tồn tại.',
          hint: 'Chạy: rm -r /tmp/obsolete_data',
        },
      ];
    },
  },

  // 14. find
  {
    id: 14,
    slug: 'find',
    title: 'find',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to search directory trees by name, type, size, and time, then act on verified matches.',
    scenario: 'Lệnh find là công cụ tìm kiếm mạnh mẽ nhất trong Linux, duyệt đệ quy cây thư mục theo tên tệp (`-name`), loại đối tượng (`-type f` cho file, `-type d` cho thư mục), kích thước và thời gian.',
    tasks: [
      'Tìm tất cả các tệp cấu hình có đuôi `.conf` trong thư mục `/etc` bằng lệnh `find /etc -name "*.conf"`.',
      'Tìm tất cả các thư mục con bên trong `/var` bằng lệnh `find /var -type d`.',
    ],
    hints: [
      'Luôn đặt mẫu tìm kiếm có ký tự đại diện `*` trong dấu ngoặc kép để tránh shell tự mở rộng: `find /etc -name "*.conf"`.',
      'Cờ `-type f` tìm file thông thường, `-type d` tìm thư mục.',
    ],
    usefulCommands: [
      'find /etc -name "*.conf" - Tìm file theo tên hoặc phần mở rộng',
      'find /var -type d - Tìm tất cả thư mục',
      'find /tmp -type f -size +1M - Tìm file có dung lượng lớn hơn 1MB',
    ],
    checks: [
      {
        id: 'find-1',
        title: 'Tìm kiếm file .conf trong /etc',
        description: 'Đã thực thi lệnh find /etc với tên *.conf',
        points: 50,
        hint: 'Chạy: find /etc -name "*.conf"',
      },
      {
        id: 'find-2',
        title: 'Tìm kiếm thư mục với tuỳ chọn -type d',
        description: 'Đã thực thi lệnh find với cờ -type d',
        points: 50,
        hint: 'Chạy: find /var -type d',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const findConf = hist.some(h => h.includes('find') && h.includes('/etc') && h.includes('.conf'));
      const findDir = hist.some(h => h.includes('find') && h.includes('-type d'));

      return [
        {
          id: 'find-1',
          title: 'Tìm kiếm file .conf trong /etc',
          passed: findConf,
          pointsEarned: findConf ? 50 : 0,
          maxPoints: 50,
          message: findConf ? 'Đã tìm kiếm file cấu hình theo tên.' : 'Chưa chạy find /etc -name "*.conf".',
          hint: 'Chạy: find /etc -name "*.conf"',
        },
        {
          id: 'find-2',
          title: 'Tìm kiếm thư mục với tuỳ chọn -type d',
          passed: findDir,
          pointsEarned: findDir ? 50 : 0,
          maxPoints: 50,
          message: findDir ? 'Đã tìm kiếm thư mục với -type d.' : 'Chưa chạy find /var -type d.',
          hint: 'Chạy: find /var -type d',
        },
      ];
    },
  },

  // 15. help
  {
    id: 15,
    slug: 'help',
    title: 'help',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to choose built-in help, program usage output, or manual pages for a command.',
    scenario: 'Trong Bash, các lệnh tích hợp sẵn (built-in commands như `cd`, `pwd`, `alias`, `exit`) không có file nhị phân riêng trong `/bin`. Để xem trợ giúp của các lệnh built-in này, bạn sử dụng lệnh `help <command>`. Đối với các chương trình ngoài, bạn dùng cờ `--help`.',
    tasks: [
      'Xem thông tin trợ giúp lệnh built-in `cd` bằng lệnh `help cd`.',
      'Xem trợ giúp lệnh built-in `pwd` bằng lệnh `help pwd`.',
      'Xem danh sách tuỳ chọn của chương trình `ls` bằng lệnh `ls --help`.',
    ],
    hints: [
      'Lệnh `help` chỉ áp dụng cho bash built-ins: `help cd`, `help pwd`, `help alias`.',
      'Các ứng dụng ngoài (GNU coreutils) hỗ trợ cờ `--help`: `ls --help`, `grep --help`.',
    ],
    usefulCommands: [
      'help - Liệt kê trợ giúp các lệnh built-in của Bash',
      'help cd - Xem trợ giúp chi tiết về lệnh cd',
      'command --help - Hiển thị cú pháp vắn tắt của chương trình',
    ],
    checks: [
      {
        id: 'help-1',
        title: 'Xem trợ giúp lệnh built-in cd',
        description: 'Đã thực hiện lệnh help cd',
        points: 40,
        hint: 'Chạy: help cd',
      },
      {
        id: 'help-2',
        title: 'Xem trợ giúp lệnh built-in pwd',
        description: 'Đã thực hiện lệnh help pwd',
        points: 30,
        hint: 'Chạy: help pwd',
      },
      {
        id: 'help-3',
        title: 'Sử dụng tuỳ chọn --help với ls',
        description: 'Đã chạy lệnh ls --help',
        points: 30,
        hint: 'Chạy: ls --help',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const helpCd = hist.some(h => h === 'help cd');
      const helpPwd = hist.some(h => h === 'help pwd');
      const lsHelp = hist.some(h => h.includes('ls --help'));

      return [
        {
          id: 'help-1',
          title: 'Xem trợ giúp lệnh built-in cd',
          passed: helpCd,
          pointsEarned: helpCd ? 40 : 0,
          maxPoints: 40,
          message: helpCd ? 'Đã xem trợ giúp help cd.' : 'Chưa chạy help cd.',
          hint: 'Chạy: help cd',
        },
        {
          id: 'help-2',
          title: 'Xem trợ giúp lệnh built-in pwd',
          passed: helpPwd,
          pointsEarned: helpPwd ? 30 : 0,
          maxPoints: 30,
          message: helpPwd ? 'Đã xem trợ giúp help pwd.' : 'Chưa chạy help pwd.',
          hint: 'Chạy: help pwd',
        },
        {
          id: 'help-3',
          title: 'Sử dụng tuỳ chọn --help với ls',
          passed: lsHelp,
          pointsEarned: lsHelp ? 30 : 0,
          maxPoints: 30,
          message: lsHelp ? 'Đã chạy ls --help thành công.' : 'Chưa chạy ls --help.',
          hint: 'Chạy: ls --help',
        },
      ];
    },
  },

  // 16. man
  {
    id: 16,
    slug: 'man',
    title: 'man',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to open, navigate, search, and select sections of installed manual pages.',
    scenario: 'Lệnh man (manual) là tài liệu hướng dẫn chính thức và đầy đủ nhất cho mọi câu lệnh Linux. Man pages được chia thành các phân vùng (sections) như section 1 (User Commands), section 5 (File Formats), section 8 (System Administration).',
    tasks: [
      'Mở xem tài liệu hướng dẫn của lệnh `ls` bằng lệnh `man ls`.',
      'Mở xem hướng dẫn của lệnh nối file `cat` bằng lệnh `man cat`.',
    ],
    hints: [
      'Gõ `man ls` để mở manual page.',
      'Dùng `man <command>` để tra cứu bất kỳ câu lệnh nào trong hệ thống.',
    ],
    usefulCommands: [
      'man ls - Mở manual page của lệnh ls',
      'man cat - Mở manual page của lệnh cat',
      'man man - Xem hướng dẫn sử dụng chính hệ thống man',
    ],
    checks: [
      {
        id: 'man-1',
        title: 'Đọc manual page của lệnh ls',
        description: 'Đã thực hiện lệnh man ls',
        points: 50,
        hint: 'Chạy: man ls',
      },
      {
        id: 'man-2',
        title: 'Đọc manual page của lệnh cat',
        description: 'Đã thực hiện lệnh man cat',
        points: 50,
        hint: 'Chạy: man cat',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const manLs = hist.some(h => h === 'man ls');
      const manCat = hist.some(h => h === 'man cat');

      return [
        {
          id: 'man-1',
          title: 'Đọc manual page của lệnh ls',
          passed: manLs,
          pointsEarned: manLs ? 50 : 0,
          maxPoints: 50,
          message: manLs ? 'Đã xem manual page của ls.' : 'Chưa chạy man ls.',
          hint: 'Chạy: man ls',
        },
        {
          id: 'man-2',
          title: 'Đọc manual page của lệnh cat',
          passed: manCat,
          pointsEarned: manCat ? 50 : 0,
          maxPoints: 50,
          message: manCat ? 'Đã xem manual page của cat.' : 'Chưa chạy man cat.',
          hint: 'Chạy: man cat',
        },
      ];
    },
  },

  // 17. whatis
  {
    id: 17,
    slug: 'whatis',
    title: 'whatis',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to retrieve concise manual-page descriptions and interpret their section numbers.',
    scenario: 'Nếu bạn chỉ muốn biết nhanh một dòng tóm tắt công dụng của một lệnh mà không cần đọc hết trang man dài dằng dặc, lệnh `whatis` sẽ trích xuất phần NAME từ cơ sở dữ liệu man pages.',
    tasks: [
      'Tra cứu mô tả nhanh của lệnh `ls` bằng lệnh `whatis ls`.',
      'Tra cứu mô tả của lệnh `cat` bằng lệnh `whatis cat`.',
      'Tra cứu mô tả của shell `bash` bằng lệnh `whatis bash`.',
    ],
    hints: [
      'Cú pháp: `whatis <ten_lenh>`.',
      'Có thể kiểm tra nhiều lệnh cùng lúc: `whatis ls cat pwd`.',
    ],
    usefulCommands: [
      'whatis ls - In dòng mô tả tóm tắt của lệnh ls',
      'whatis pwd - In dòng mô tả của lệnh pwd',
      'whatis bash - In dòng mô tả của Bash shell',
    ],
    checks: [
      {
        id: 'whatis-1',
        title: 'Tra cứu whatis ls',
        description: 'Đã thực hiện lệnh whatis ls',
        points: 40,
        hint: 'Chạy: whatis ls',
      },
      {
        id: 'whatis-2',
        title: 'Tra cứu whatis cat',
        description: 'Đã thực hiện lệnh whatis cat',
        points: 30,
        hint: 'Chạy: whatis cat',
      },
      {
        id: 'whatis-3',
        title: 'Tra cứu whatis bash',
        description: 'Đã thực hiện lệnh whatis bash',
        points: 30,
        hint: 'Chạy: whatis bash',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const wLs = hist.some(h => h.includes('whatis') && h.includes('ls'));
      const wCat = hist.some(h => h.includes('whatis') && h.includes('cat'));
      const wBash = hist.some(h => h.includes('whatis') && h.includes('bash'));

      return [
        {
          id: 'whatis-1',
          title: 'Tra cứu whatis ls',
          passed: wLs,
          pointsEarned: wLs ? 40 : 0,
          maxPoints: 40,
          message: wLs ? 'Đã tra cứu whatis ls.' : 'Chưa chạy whatis ls.',
          hint: 'Chạy: whatis ls',
        },
        {
          id: 'whatis-2',
          title: 'Tra cứu whatis cat',
          passed: wCat,
          pointsEarned: wCat ? 30 : 0,
          maxPoints: 30,
          message: wCat ? 'Đã tra cứu whatis cat.' : 'Chưa chạy whatis cat.',
          hint: 'Chạy: whatis cat',
        },
        {
          id: 'whatis-3',
          title: 'Tra cứu whatis bash',
          passed: wBash,
          pointsEarned: wBash ? 30 : 0,
          maxPoints: 30,
          message: wBash ? 'Đã tra cứu whatis bash.' : 'Chưa chạy whatis bash.',
          hint: 'Chạy: whatis bash',
        },
      ];
    },
  },

  // 18. alias
  {
    id: 18,
    slug: 'alias',
    title: 'alias',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to create, inspect, persist, bypass, and remove command aliases in Bash.',
    scenario: 'Alias trong Linux giống như một phím tắt hoặc biệt danh tuỳ biến cho một lệnh dài. Ví dụ lệnh `ll` thực chất là alias của `ls -l`. Bạn có thể tự định nghĩa alias bằng cú pháp `alias ten="lenh"`.',
    tasks: [
      'Xem tất cả các alias hiện có trên CentOS Stream 9 bằng cách gõ lệnh `alias`.',
      'Tạo một alias mới có tên `syscheck` tương đương với `uptime` bằng lệnh: `alias syscheck="uptime"`.',
      'Chạy thử alias vừa tạo bằng cách gõ `syscheck` trên terminal.',
    ],
    hints: [
      'Gõ `alias` không kèm tham số để liệt kê toàn bộ danh sách.',
      'Cú pháp tạo alias: `alias syscheck="uptime"`. Không đặt khoảng trắng trước và sau dấu `=`.',
    ],
    usefulCommands: [
      'alias - Liệt kê tất cả alias đang được nạp',
      'alias name="command" - Tạo alias mới',
      'unalias name - Xoá alias đã tạo',
    ],
    checks: [
      {
        id: 'alias-1',
        title: 'Liệt kê danh sách alias',
        description: 'Đã chạy lệnh alias để xem các alias hiện có',
        points: 40,
        hint: 'Chạy: alias',
      },
      {
        id: 'alias-2',
        title: 'Tạo alias syscheck',
        description: 'Alias syscheck đã được định nghĩa trong shell',
        points: 60,
        hint: 'Chạy: alias syscheck="uptime"',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.aliases.delete('syscheck');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const ranAliasList = hist.some(h => h === 'alias');
      const hasSyscheck = kernel.aliases.has('syscheck');

      return [
        {
          id: 'alias-1',
          title: 'Liệt kê danh sách alias',
          passed: ranAliasList,
          pointsEarned: ranAliasList ? 40 : 0,
          maxPoints: 40,
          message: ranAliasList ? 'Đã xem danh sách alias.' : 'Chưa chạy lệnh alias.',
          hint: 'Chạy: alias',
        },
        {
          id: 'alias-2',
          title: 'Tạo alias syscheck',
          passed: hasSyscheck,
          pointsEarned: hasSyscheck ? 60 : 0,
          maxPoints: 60,
          message: hasSyscheck ? 'Alias syscheck đã được tạo thành công.' : 'Chưa tạo alias syscheck="uptime".',
          hint: 'Chạy: alias syscheck="uptime"',
        },
      ];
    },
  },

  // 19. exit
  {
    id: 19,
    slug: 'exit',
    title: 'exit',
    category: 'Command Line',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Learn how to leave the current shell and choose the status it returns to its caller.',
    scenario: 'Lệnh exit dùng để thoát khỏi phiên shell hiện tại. Khi bạn dùng `su <user>` để chuyển tài khoản, gõ `exit` sẽ đưa bạn trở lại tài khoản trước đó. Biến `$?` sẽ lưu mã thoát (exit status) của lệnh gần nhất.',
    tasks: [
      'Chuyển sang user thông thường `centos` bằng lệnh `su centos`.',
      'Sau khi đã ở user `centos`, gõ `exit` để thoát phiên và trở về quyền `root`.',
      'Kiểm tra mã thoát (exit code 0) bằng lệnh `echo $?`.',
    ],
    hints: [
      'Gõ `su centos` để chuyển user.',
      'Gõ `exit` để thoát sub-shell.',
      'Lệnh kết thúc thành công luôn trả về mã thoát `0`. Kiểm tra bằng `echo $?`.',
    ],
    usefulCommands: [
      'exit - Thoát khỏi phiên làm việc hiện tại',
      'echo $? - Hiển thị mã trạng thái kết thúc của lệnh vừa chạy',
    ],
    checks: [
      {
        id: 'exit-1',
        title: 'Chuyển user và thoát bằng exit',
        description: 'Đã thực hiện su centos và thoát bằng exit',
        points: 50,
        hint: 'Chạy: su centos sau đó gõ exit',
      },
      {
        id: 'exit-2',
        title: 'Kiểm tra mã thoát echo $?',
        description: 'Đã kiểm tra mã thoát bằng echo $?',
        points: 50,
        hint: 'Chạy: echo $?',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.currentUser = 'root';
      kernel.cwd = '/root';
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const ranSu = hist.some(h => h.includes('su centos'));
      const ranExit = hist.some(h => h === 'exit');
      const ranExitStatus = hist.some(h => h === 'echo $?' || h.includes('$exitcode') || h.includes('$last'));

      const p1 = ranExit || (ranSu && ranExit);
      const p2 = ranExitStatus;

      return [
        {
          id: 'exit-1',
          title: 'Chuyển user và thoát bằng exit',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã thực hiện thoát shell bằng exit.' : 'Chưa thực hiện lệnh exit.',
          hint: 'Chạy: su centos sau đó gõ exit',
        },
        {
          id: 'exit-2',
          title: 'Kiểm tra mã thoát echo $?',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã kiểm tra mã thoát thành công.' : 'Chưa chạy lệnh echo $?.',
          hint: 'Chạy: echo $?',
        },
      ];
    },
  },
];

export const LABS: LabDefinition[] = COMMAND_LINE_LABS;
