import type { LabDefinition, LabCheckResult, CourseModule } from '../types/linux';
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
    scenario: 'Trong Linux, bạn luôn hoạt động trong một thư mục làm việc hiện tại (working directory). Lệnh pwd (Print Working Directory) in ra đường dẫn tuyệt đối bắt đầu từ gốc `/` đến vị trí hiện tại, đồng thời hỗ trợ phân biệt đường dẫn logic (`pwd -L`) và vật lý (`pwd -P`).',
    tasks: [
      'Chạy lệnh `pwd` tại thư mục hiện tại để xác định vị trí ban đầu (ví dụ `/root` hoặc `/home/pete`).',
      'Di chuyển sang thư mục `/home/pete/projects` (hoặc `/var/log`) và chạy `pwd` kèm `ls` để xác nhận vị trí.',
      'Thử nghiệm di chuyển vào symbolic link `/tmp/mylogs` (`cd /tmp/mylogs`) và so sánh `pwd -L` (logical) với `pwd -P` (physical).',
    ],
    hints: [
      'Nhập `pwd` và nhấn Enter để xem đường dẫn tuyệt đối.',
      'Dùng `cd /home/pete/projects` hoặc `cd /var/log`, sau đó gõ `pwd`.',
      'Dùng `cd /tmp/mylogs && pwd -L && pwd -P` để thấy sự khác biệt khi phân giải symlink.',
    ],
    usefulCommands: [
      'pwd - In đường dẫn tuyệt đối của thư mục hiện hành',
      'pwd -L - Hiển thị đường dẫn logic (giữ nguyên symbolic link)',
      'pwd -P - Hiển thị đường dẫn vật lý thật (phân giải symbolic link)',
      'echo "Dir: $(pwd)" - Chèn đường dẫn hiện tại vào lệnh khác',
    ],
    checks: [
      {
        id: 'pwd-1',
        title: 'Thực thi lệnh pwd',
        description: 'Đã sử dụng lệnh pwd để in thư mục làm việc hiện hành',
        points: 35,
        hint: 'Chạy: pwd',
      },
      {
        id: 'pwd-2',
        title: 'Kiểm tra thư mục dự án hoặc hệ thống',
        description: 'Đã di chuyển tới /home/pete/projects hoặc /var/log và kiểm tra vị trí',
        points: 35,
        hint: 'Chạy: cd /home/pete/projects && pwd && ls',
      },
      {
        id: 'pwd-3',
        title: 'Phân biệt đường dẫn Vật lý (pwd -P) và Logic (pwd -L)',
        description: 'Đã thực thi pwd -P (hoặc kiểm tra symlink /tmp/mylogs)',
        points: 30,
        hint: 'Chạy: cd /tmp/mylogs && pwd -P',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.cwd = '/root';
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const ranPwd = hist.some(h => h === 'pwd' || h.startsWith('pwd '));
      const atTargetOrRan =
        kernel.cwd === '/var/log' ||
        kernel.cwd === '/home/pete/projects' ||
        hist.some(h => h.includes('/var/log') || h.includes('/home/pete'));
      const ranPhysical = hist.some(
        h => h.includes('pwd -p') || h.includes('pwd --physical') || h.includes('/tmp/mylogs')
      );

      return [
        {
          id: 'pwd-1',
          title: 'Thực thi lệnh pwd',
          passed: ranPwd,
          pointsEarned: ranPwd ? 35 : 0,
          maxPoints: 35,
          message: ranPwd ? 'Đã chạy lệnh pwd chính xác.' : 'Chưa thực hiện lệnh pwd.',
          hint: 'Chạy: pwd',
        },
        {
          id: 'pwd-2',
          title: 'Kiểm tra thư mục dự án hoặc hệ thống',
          passed: ranPwd && atTargetOrRan,
          pointsEarned: ranPwd && atTargetOrRan ? 35 : 0,
          maxPoints: 35,
          message: atTargetOrRan
            ? 'Đã di chuyển thư mục và xác nhận vị trí.'
            : 'Chưa chuyển đến /home/pete/projects hoặc /var/log.',
          hint: 'Chạy: cd /home/pete/projects && pwd',
        },
        {
          id: 'pwd-3',
          title: 'Phân biệt đường dẫn Vật lý (pwd -P) và Logic (pwd -L)',
          passed: ranPhysical,
          pointsEarned: ranPhysical ? 30 : 0,
          maxPoints: 30,
          message: ranPhysical
            ? 'Đã thực hành phân giải đường dẫn vật lý với pwd -P.'
            : 'Chưa thử nghiệm lệnh pwd -P.',
          hint: 'Chạy: cd /tmp/mylogs && pwd -P',
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
    estimatedTime: '6 phút',
    summary: 'Learn how to use cd with paths and shortcuts to move through the Linux filesystem.',
    scenario: 'Lệnh cd (change directory) cho phép bạn di chuyển trong hệ thống tệp tin bằng đường dẫn tuyệt đối (`/home/pete/Pictures`), đường dẫn tương đối (`Hawaii`, `"Vacation Photos"`) và các phím tắt shell (`.`, `..`, `~`, `-`).',
    tasks: [
      'Điều hướng đến thư mục `/home/pete/Pictures` (hoặc `/etc/systemd`) bằng đường dẫn tuyệt đối: `cd /home/pete/Pictures`.',
      'Di chuyển lên thư mục cha bằng phím tắt `cd ..` (hoặc `cd ../..`).',
      'Quay trở về thư mục home bằng lệnh `cd ~` hoặc `cd` (hoặc quay lại thư mục trước đó bằng `cd -`).',
    ],
    hints: [
      'Đường dẫn tuyệt đối luôn bắt đầu bằng dấu `/`, ví dụ `cd /home/pete/Pictures`.',
      '`..` đại diện cho thư mục cấp cha ngay trên vị trí hiện tại (`cd ..`).',
      '`~` đại diện cho thư mục Home, và `-` đưa bạn quay lại thư mục vừa đứng trước đó (`cd -`).',
    ],
    usefulCommands: [
      'cd /home/pete/Pictures - Di chuyển bằng đường dẫn tuyệt đối',
      'cd Hawaii - Di chuyển vào thư mục con bằng đường dẫn tương đối',
      'cd "Vacation Photos" - Di chuyển vào thư mục có tên chứa khoảng trắng',
      'cd .. / cd ~ / cd - - Lên thư mục cha / Về thư mục Home / Về thư mục trước đó',
    ],
    checks: [
      {
        id: 'cd-1',
        title: 'Điều hướng bằng đường dẫn tuyệt đối',
        description: 'Đã di chuyển đến /home/pete/Pictures hoặc /etc/systemd',
        points: 40,
        hint: 'Chạy: cd /home/pete/Pictures',
      },
      {
        id: 'cd-2',
        title: 'Sử dụng phím tắt cd ..',
        description: 'Đã dùng cd .. hoặc cd ../.. để di chuyển lên thư mục cha',
        points: 30,
        hint: 'Chạy: cd ..',
      },
      {
        id: 'cd-3',
        title: 'Sử dụng phím tắt cd ~, cd hoặc cd -',
        description: 'Đã quay về thư mục Home (cd ~ / cd) hoặc thư mục trước đó (cd -)',
        points: 30,
        hint: 'Chạy: cd ~ hoặc cd -',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.cwd = '/home/pete';
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map(h => h.trim().toLowerCase());
      const absMove = hist.some(
        h =>
          h.includes('cd /home/pete/pictures') ||
          h.includes('cd /etc/systemd') ||
          h.includes('cd hawaii') ||
          h.includes('vacation photos')
      );
      const dotDot = hist.some(h => h === 'cd ..' || h.startsWith('cd ../'));
      const homeOrPrev = hist.some(
        h => h === 'cd' || h === 'cd ~' || h === 'cd ~/' || h === 'cd -'
      );

      return [
        {
          id: 'cd-1',
          title: 'Điều hướng bằng đường dẫn tuyệt đối',
          passed: absMove,
          pointsEarned: absMove ? 40 : 0,
          maxPoints: 40,
          message: absMove
            ? 'Đã điều hướng đến thư mục đích thành công.'
            : 'Chưa điều hướng đến /home/pete/Pictures.',
          hint: 'Chạy: cd /home/pete/Pictures',
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
          title: 'Sử dụng phím tắt cd ~, cd hoặc cd -',
          passed: homeOrPrev,
          pointsEarned: homeOrPrev ? 30 : 0,
          maxPoints: 30,
          message: homeOrPrev
            ? 'Đã sử dụng phím tắt điều hướng thành công.'
            : 'Chưa dùng cd, cd ~ hoặc cd -.',
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

export const GETTING_STARTED_LABS: LabDefinition[] = [
  {
    id: 101,
    slug: 'linux-history',
    title: 'History of Linux',
    category: 'Getting Started',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Explore the UNIX heritage, GNU project, and Linux kernel architecture.',
    scenario: 'Linux ra đời năm 1991 bởi Linus Torvalds kết hợp cùng bộ công cụ GNU của Richard Stallman. Trên máy ảo CentOS Stream 9, bạn có thể kiểm tra thông tin kernel và hệ điều hành GNU/Linux trực tiếp từ terminal.',
    tasks: [
      'Kiểm tra tên hệ điều hành và phiên bản kernel bằng lệnh `uname -sr`.',
      'Xem thông tin chi tiết bản phân phối trong `/etc/os-release` bằng lệnh `cat /etc/os-release`.',
    ],
    hints: [
      'Gõ `uname -sr` hoặc `uname -a` để hiển thị tên kernel Linux.',
      'Gõ `cat /etc/os-release` để xem thông tin CentOS Stream 9.',
    ],
    usefulCommands: [
      'uname -a - Hiển thị toàn bộ thông tin kernel',
      'cat /etc/os-release - Xem thông tin bản phân phối Linux',
      'hostnamectl - Xem thông tin định danh hệ thống và OS',
    ],
    checks: [
      {
        id: 'gs-1',
        title: 'Kiểm tra thông tin Kernel với uname',
        description: 'Đã chạy lệnh uname để kiểm tra phiên bản nhân Linux',
        points: 50,
        hint: 'Chạy: uname -sr hoặc uname -a',
      },
      {
        id: 'gs-2',
        title: 'Đọc thông tin bản phân phối /etc/os-release',
        description: 'Đã xem nội dung tệp /etc/os-release',
        points: 50,
        hint: 'Chạy: cat /etc/os-release',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.startsWith('uname'));
      const p2 = hist.some((h) => h.includes('/etc/os-release') || h.includes('redhat-release'));
      return [
        {
          id: 'gs-1',
          title: 'Kiểm tra thông tin Kernel với uname',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã kiểm tra thông tin kernel thành công.' : 'Chưa chạy lệnh uname.',
          hint: 'Chạy: uname -sr',
        },
        {
          id: 'gs-2',
          title: 'Đọc thông tin bản phân phối /etc/os-release',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã đọc thông tin bản phân phối.' : 'Chưa đọc /etc/os-release.',
          hint: 'Chạy: cat /etc/os-release',
        },
      ];
    },
  },
  {
    id: 102,
    slug: 'choosing-distribution',
    title: 'Choosing a Linux Distribution',
    category: 'Getting Started',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Understand major Linux families: Debian/Ubuntu, RHEL/CentOS/Fedora, and SUSE.',
    scenario: 'CentOS Stream 9 thuộc nhánh Red Hat Enterprise Linux (RHEL), đóng vai trò upstream cho các bản phát hành RHEL minor tiếp theo. Hãy kiểm tra tệp định danh nhánh Red Hat và thông tin hostname của máy chủ.',
    tasks: [
      'Đọc tệp `/etc/redhat-release` bằng lệnh `cat /etc/redhat-release`.',
      'Kiểm tra hostname và kiến trúc phần cứng bằng lệnh `hostname` hoặc `uname -m`.',
    ],
    hints: [
      'Chạy `cat /etc/redhat-release` để xác minh dòng RHEL/CentOS.',
      'Chạy `uname -m` hoặc `hostname` để xem kiến trúc hệ thống.',
    ],
    usefulCommands: [
      'cat /etc/redhat-release - Xem phiên bản dòng Red Hat / CentOS',
      'uname -m - Xem kiến trúc phần cứng (x86_64)',
      'hostname - Xem tên máy chủ hiện tại',
    ],
    checks: [
      {
        id: 'gs-distro-1',
        title: 'Kiểm tra /etc/redhat-release',
        description: 'Đã đọc tệp /etc/redhat-release',
        points: 50,
        hint: 'Chạy: cat /etc/redhat-release',
      },
      {
        id: 'gs-distro-2',
        title: 'Kiểm tra kiến trúc hoặc hostname',
        description: 'Đã chạy uname -m hoặc hostname',
        points: 50,
        hint: 'Chạy: uname -m',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('redhat-release') || h.includes('os-release'));
      const p2 = hist.some((h) => h.includes('uname') || h.includes('hostname') || h.includes('arch'));
      return [
        {
          id: 'gs-distro-1',
          title: 'Kiểm tra /etc/redhat-release',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã kiểm tra thông tin nhánh Red Hat.' : 'Chưa xem /etc/redhat-release.',
          hint: 'Chạy: cat /etc/redhat-release',
        },
        {
          id: 'gs-distro-2',
          title: 'Kiểm tra kiến trúc hoặc hostname',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã kiểm tra hostname/kiến trúc.' : 'Chưa chạy uname -m hoặc hostname.',
          hint: 'Chạy: uname -m',
        },
      ];
    },
  },
];

export const TEXT_FU_LABS: LabDefinition[] = [
  {
    id: 201,
    slug: 'stdout-redirect',
    title: 'stdout (Standard Output)',
    category: 'Text-Fu',
    difficulty: 'Cơ bản',
    estimatedTime: '6 phút',
    summary: 'Redirect standard output to files using > and >> operators.',
    scenario: 'Trong Linux, mọi tiến trình đều sử dụng các luồng I/O chuẩn. Toán tử `>` ghi đè kết quả ra tệp mới, còn `>>` nối thêm (append) vào cuối tệp hiện có.',
    tasks: [
      'Ghi chuỗi `"Hello Peanut"` vào tệp `/tmp/hello.txt` bằng lệnh `echo "Hello Peanut" > /tmp/hello.txt`.',
      'Nối thêm dòng `"Linux Text-Fu"` vào cuối tệp `/tmp/hello.txt` bằng toán tử `>>`.',
    ],
    hints: [
      'Chạy: `echo "Hello Peanut" > /tmp/hello.txt`',
      'Chạy: `echo "Linux Text-Fu" >> /tmp/hello.txt`',
    ],
    usefulCommands: [
      'echo "text" > file - Ghi đè nội dung vào tệp',
      'echo "text" >> file - Nối thêm nội dung vào cuối tệp',
      'cat /tmp/hello.txt - Kiểm tra nội dung tệp vừa ghi',
    ],
    checks: [
      {
        id: 'tf-1',
        title: 'Tạo tệp /tmp/hello.txt bằng chuyển hướng >',
        description: 'Tệp /tmp/hello.txt tồn tại và có nội dung',
        points: 50,
        hint: 'Chạy: echo "Hello Peanut" > /tmp/hello.txt',
      },
      {
        id: 'tf-2',
        title: 'Nối thêm dòng bằng >>',
        description: 'Tệp /tmp/hello.txt chứa từ khóa Linux hoặc có từ 2 dòng trở lên',
        points: 50,
        hint: 'Chạy: echo "Linux Text-Fu" >> /tmp/hello.txt',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.unlink('/tmp/hello.txt');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const content = kernel.vfs.readFile('/tmp/hello.txt');
      const exists = content !== null;
      const lines = (content || '').trim().split('\n').filter(Boolean);
      const p1 = exists && lines.length >= 1;
      const p2 = exists && lines.length >= 2;
      return [
        {
          id: 'tf-1',
          title: 'Tạo tệp /tmp/hello.txt bằng chuyển hướng >',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã tạo tệp /tmp/hello.txt thành công.' : 'Chưa tạo /tmp/hello.txt.',
          hint: 'Chạy: echo "Hello Peanut" > /tmp/hello.txt',
        },
        {
          id: 'tf-2',
          title: 'Nối thêm dòng bằng >>',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã nối thêm dòng thứ 2 vào tệp.' : 'Tệp chưa có dòng thứ 2.',
          hint: 'Chạy: echo "Linux Text-Fu" >> /tmp/hello.txt',
        },
      ];
    },
  },
  {
    id: 202,
    slug: 'pipe-tee',
    title: 'pipe and tee',
    category: 'Text-Fu',
    difficulty: 'Cơ bản',
    estimatedTime: '6 phút',
    summary: 'Chain commands together with pipes (|) and split output streams.',
    scenario: 'Toán tử đường ống `|` (pipe) cho phép lấy đầu ra (stdout) của lệnh bên trái làm đầu vào (stdin) cho lệnh bên phải.',
    tasks: [
      'Kết hợp `ls /etc` và `head` qua pipe: `ls /etc | head -n 5`.',
      'Đếm số lượng dòng trong `/etc/passwd` bằng pipe: `cat /etc/passwd | wc -l`.',
    ],
    hints: [
      'Gõ `ls /etc | head -n 5` để xem 5 mục đầu tiên trong `/etc`.',
      'Gõ `cat /etc/passwd | wc -l` để đếm tổng số dòng.',
    ],
    usefulCommands: [
      'cmd1 | cmd2 - Chuyển kết quả của cmd1 sang cmd2',
      'wc -l - Đếm số dòng',
      'head -n 5 - Lấy 5 dòng đầu tiên',
    ],
    checks: [
      {
        id: 'pipe-1',
        title: 'Sử dụng pipe với head',
        description: 'Đã thực thi lệnh kết hợp | head',
        points: 50,
        hint: 'Chạy: ls /etc | head -n 5',
      },
      {
        id: 'pipe-2',
        title: 'Sử dụng pipe với wc -l',
        description: 'Đã thực thi lệnh kết hợp | wc',
        points: 50,
        hint: 'Chạy: cat /etc/passwd | wc -l',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('|') && h.includes('head'));
      const p2 = hist.some((h) => h.includes('|') && h.includes('wc'));
      return [
        {
          id: 'pipe-1',
          title: 'Sử dụng pipe với head',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã kết hợp pipe với head.' : 'Chưa chạy lệnh có | head.',
          hint: 'Chạy: ls /etc | head -n 5',
        },
        {
          id: 'pipe-2',
          title: 'Sử dụng pipe với wc -l',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã kết hợp pipe với wc.' : 'Chưa chạy lệnh có | wc.',
          hint: 'Chạy: cat /etc/passwd | wc -l',
        },
      ];
    },
  },
  {
    id: 203,
    slug: 'grep-search',
    title: 'grep',
    category: 'Text-Fu',
    difficulty: 'Cơ bản',
    estimatedTime: '6 phút',
    summary: 'Search files for lines matching specific text patterns with grep.',
    scenario: '`grep` (Global Regular Expression Print) là công cụ tìm kiếm chuỗi văn bản phổ biến nhất trên Linux.',
    tasks: [
      'Tìm dòng chứa thông tin user `root` trong `/etc/passwd` bằng lệnh `grep root /etc/passwd`.',
      'Tìm kiếm không phân biệt chữ hoa/thường với cờ `-i`: `grep -i centos /etc/os-release`.',
    ],
    hints: [
      'Chạy `grep root /etc/passwd`.',
      'Chạy `grep -i centos /etc/os-release`.',
    ],
    usefulCommands: [
      'grep pattern file - Tìm dòng khớp mẫu trong tệp',
      'grep -i pattern file - Tìm kiếm không phân biệt hoa thường',
      'grep -n pattern file - Hiển thị kèm số thứ tự dòng',
    ],
    checks: [
      {
        id: 'grep-1',
        title: 'Tìm user root trong /etc/passwd',
        description: 'Đã chạy grep root /etc/passwd',
        points: 50,
        hint: 'Chạy: grep root /etc/passwd',
      },
      {
        id: 'grep-2',
        title: 'Tìm kiếm với grep -i trong /etc/os-release',
        description: 'Đã chạy grep trên /etc/os-release',
        points: 50,
        hint: 'Chạy: grep -i centos /etc/os-release',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('grep') && h.includes('/etc/passwd'));
      const p2 = hist.some((h) => h.includes('grep') && h.includes('os-release'));
      return [
        {
          id: 'grep-1',
          title: 'Tìm user root trong /etc/passwd',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã tìm kiếm trong /etc/passwd thành công.' : 'Chưa chạy grep trên /etc/passwd.',
          hint: 'Chạy: grep root /etc/passwd',
        },
        {
          id: 'grep-2',
          title: 'Tìm kiếm với grep -i trong /etc/os-release',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã tìm kiếm trong /etc/os-release thành công.' : 'Chưa chạy grep trên /etc/os-release.',
          hint: 'Chạy: grep -i centos /etc/os-release',
        },
      ];
    },
  },
];

export const ADVANCED_TEXT_FU_LABS: LabDefinition[] = [
  {
    id: 301,
    slug: 'vim-editor',
    title: 'Vim Text Editor',
    category: 'Advanced Text-Fu',
    difficulty: 'Trung bình',
    estimatedTime: '8 phút',
    summary: 'Master modal text editing, saving, and navigation in Vim/Nano.',
    scenario: 'Trình soạn thảo văn bản trực tiếp trên terminal giúp quản trị viên chỉnh sửa tệp cấu hình nhanh chóng. Bạn có thể mở trình soạn thảo bằng `vim` hoặc `nano` và lưu thay đổi.',
    tasks: [
      'Mở trình soạn thảo tạo tệp `/tmp/notes.txt` bằng lệnh `vim /tmp/notes.txt` (hoặc `nano /tmp/notes.txt`) và lưu nội dung bất kỳ.',
      'Kiểm tra lại nội dung tệp `/tmp/notes.txt` bằng lệnh `cat /tmp/notes.txt`.',
    ],
    hints: [
      'Gõ `vim /tmp/notes.txt` trên terminal để mở cửa sổ soạn thảo, nhập nội dung rồi bấm Lưu.',
      'Gõ `cat /tmp/notes.txt` để xác nhận nội dung.',
    ],
    usefulCommands: [
      'vim <file> - Mở tệp trong trình soạn thảo Vim',
      'nano <file> - Mở tệp trong trình soạn thảo Nano',
      'cat <file> - Xem nội dung tệp sau khi lưu',
    ],
    checks: [
      {
        id: 'adv-1',
        title: 'Tạo và lưu tệp /tmp/notes.txt',
        description: 'Tệp /tmp/notes.txt tồn tại và có nội dung',
        points: 100,
        hint: 'Chạy vim /tmp/notes.txt, nhập văn bản và nhấn Lưu',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.unlink('/tmp/notes.txt');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const content = kernel.vfs.readFile('/tmp/notes.txt');
      const p1 = content !== null && content.trim().length > 0;
      return [
        {
          id: 'adv-1',
          title: 'Tạo và lưu tệp /tmp/notes.txt',
          passed: p1,
          pointsEarned: p1 ? 100 : 0,
          maxPoints: 100,
          message: p1 ? 'Đã tạo và lưu nội dung vào /tmp/notes.txt.' : 'Tệp /tmp/notes.txt chưa tồn tại hoặc đang trống.',
          hint: 'Chạy: vim /tmp/notes.txt',
        },
      ];
    },
  },
  {
    id: 302,
    slug: 'sed-awk-manipulation',
    title: 'Regular Expressions & Stream Filtering',
    category: 'Advanced Text-Fu',
    difficulty: 'Trung bình',
    estimatedTime: '8 phút',
    summary: 'Filter and transform structured text files using sort, uniq, and cut.',
    scenario: 'Khi xử lý dữ liệu cấu trúc như `/etc/passwd`, bạn có thể trích xuất cột tên người dùng và sắp xếp theo thứ tự bảng chữ cái.',
    tasks: [
      'Trích xuất cột đầu tiên (username) từ `/etc/passwd` bằng lệnh `cut -d: -f1 /etc/passwd`.',
      'Kết hợp sắp xếp danh sách người dùng bằng `cut -d: -f1 /etc/passwd | sort`.',
    ],
    hints: [
      'Chạy `cut -d: -f1 /etc/passwd`',
      'Chạy `cut -d: -f1 /etc/passwd | sort`',
    ],
    usefulCommands: [
      'cut -d: -f1 /etc/passwd - Cắt trường số 1 phân cách bởi dấu hai chấm',
      'sort - Sắp xếp các dòng theo thứ tự ABC',
      'uniq - Loại bỏ các dòng trùng lặp liên tiếp',
    ],
    checks: [
      {
        id: 'adv-cut',
        title: 'Sử dụng cut trích xuất cột từ /etc/passwd',
        description: 'Đã chạy lệnh cut trên /etc/passwd',
        points: 50,
        hint: 'Chạy: cut -d: -f1 /etc/passwd',
      },
      {
        id: 'adv-sort',
        title: 'Kết hợp sort để sắp xếp kết quả',
        description: 'Đã sử dụng lệnh sort',
        points: 50,
        hint: 'Chạy: cut -d: -f1 /etc/passwd | sort',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('cut') && h.includes('/etc/passwd'));
      const p2 = hist.some((h) => h.includes('sort'));
      return [
        {
          id: 'adv-cut',
          title: 'Sử dụng cut trích xuất cột từ /etc/passwd',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã trích xuất cột thành công.' : 'Chưa chạy lệnh cut trên /etc/passwd.',
          hint: 'Chạy: cut -d: -f1 /etc/passwd',
        },
        {
          id: 'adv-sort',
          title: 'Kết hợp sort để sắp xếp kết quả',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã sắp xếp dữ liệu với sort.' : 'Chưa chạy lệnh sort.',
          hint: 'Chạy: cut -d: -f1 /etc/passwd | sort',
        },
      ];
    },
  },
];

export const USER_MANAGEMENT_LABS: LabDefinition[] = [
  {
    id: 401,
    slug: 'users-and-groups',
    title: 'Users and /etc/passwd',
    category: 'User Management',
    difficulty: 'Cơ bản',
    estimatedTime: '6 phút',
    summary: 'Inspect user identities, UID/GID mappings, and /etc/passwd structure.',
    scenario: 'Linux quản lý người dùng thông qua UID (User ID) và GID (Group ID). Bạn có thể kiểm tra định danh hiện tại bằng `id` và tạo tài khoản mới bằng `useradd`.',
    tasks: [
      'Kiểm tra UID và GID của tài khoản hiện tại bằng lệnh `id`.',
      'Tạo một người dùng mới tên là `alice` bằng lệnh `useradd alice`.',
    ],
    hints: [
      'Gõ `id` để xem UID/GID.',
      'Gõ `useradd alice` (với quyền root hoặc sudo) để thêm user `alice`.',
    ],
    usefulCommands: [
      'id - Hiển thị UID, GID và các nhóm của người dùng',
      'useradd <username> - Tạo tài khoản người dùng mới',
      'cat /etc/passwd - Xem danh sách tài khoản trên hệ thống',
    ],
    checks: [
      {
        id: 'um-1',
        title: 'Kiểm tra định danh bằng lệnh id',
        description: 'Đã chạy lệnh id',
        points: 40,
        hint: 'Chạy: id',
      },
      {
        id: 'um-2',
        title: 'Tạo người dùng alice',
        description: 'Người dùng alice tồn tại trong hệ thống',
        points: 60,
        hint: 'Chạy: useradd alice',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.users.delete('alice');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h === 'id' || h.startsWith('id '));
      const p2 = kernel.users.has('alice');
      return [
        {
          id: 'um-1',
          title: 'Kiểm tra định danh bằng lệnh id',
          passed: p1,
          pointsEarned: p1 ? 40 : 0,
          maxPoints: 40,
          message: p1 ? 'Đã kiểm tra UID/GID bằng lệnh id.' : 'Chưa chạy lệnh id.',
          hint: 'Chạy: id',
        },
        {
          id: 'um-2',
          title: 'Tạo người dùng alice',
          passed: p2,
          pointsEarned: p2 ? 60 : 0,
          maxPoints: 60,
          message: p2 ? 'Đã tạo người dùng alice thành công.' : 'Người dùng alice chưa được tạo.',
          hint: 'Chạy: useradd alice',
        },
      ];
    },
  },
];

export const PERMISSIONS_LABS: LabDefinition[] = [
  {
    id: 501,
    slug: 'file-permissions-chmod',
    title: 'Modifying Permissions (chmod & chown)',
    category: 'Permissions',
    difficulty: 'Trung bình',
    estimatedTime: '8 phút',
    summary: 'Understand read, write, and execute bits (rwx) and modify them with chmod.',
    scenario: 'Mỗi tệp trong Linux có 3 nhóm quyền: Owner (u), Group (g), và Others (o). Chế độ số bát phân `755` tương ứng với `rwxr-xr-x`.',
    tasks: [
      'Tạo tệp `/tmp/deploy.sh` bằng lệnh `touch /tmp/deploy.sh`.',
      'Cấp quyền thực thi `755` (`rwxr-xr-x`) cho `/tmp/deploy.sh` bằng lệnh `chmod 755 /tmp/deploy.sh`.',
    ],
    hints: [
      'Chạy `touch /tmp/deploy.sh`',
      'Chạy `chmod 755 /tmp/deploy.sh` rồi kiểm tra bằng `ls -l /tmp/deploy.sh`',
    ],
    usefulCommands: [
      'ls -l <file> - Xem quyền hạn hiện tại của tệp',
      'chmod 755 <file> - Đặt quyền rwxr-xr-x cho tệp',
      'chown user:group <file> - Thay đổi chủ sở hữu tệp',
    ],
    checks: [
      {
        id: 'perm-1',
        title: 'Tạo tệp /tmp/deploy.sh',
        description: 'Tệp /tmp/deploy.sh tồn tại',
        points: 40,
        hint: 'Chạy: touch /tmp/deploy.sh',
      },
      {
        id: 'perm-2',
        title: 'Đặt quyền 755 cho /tmp/deploy.sh',
        description: 'Mode của /tmp/deploy.sh là 0o755',
        points: 60,
        hint: 'Chạy: chmod 755 /tmp/deploy.sh',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.unlink('/tmp/deploy.sh');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const node = kernel.vfs.getNode('/tmp/deploy.sh');
      const p1 = node !== null;
      const p2 = node !== null && node.mode === 0o755;
      return [
        {
          id: 'perm-1',
          title: 'Tạo tệp /tmp/deploy.sh',
          passed: p1,
          pointsEarned: p1 ? 40 : 0,
          maxPoints: 40,
          message: p1 ? 'Tệp /tmp/deploy.sh đã được tạo.' : 'Chưa tạo /tmp/deploy.sh.',
          hint: 'Chạy: touch /tmp/deploy.sh',
        },
        {
          id: 'perm-2',
          title: 'Đặt quyền 755 cho /tmp/deploy.sh',
          passed: p2,
          pointsEarned: p2 ? 60 : 0,
          maxPoints: 60,
          message: p2 ? 'Đã cấp quyền 755 (rwxr-xr-x) chính xác.' : 'Quyền của tệp chưa phải là 755.',
          hint: 'Chạy: chmod 755 /tmp/deploy.sh',
        },
      ];
    },
  },
];

export const PROCESSES_LABS: LabDefinition[] = [
  {
    id: 601,
    slug: 'ps-and-kill',
    title: 'Tracking & Terminating Processes (ps, kill)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Monitor running processes with ps aux and manage signals using kill.',
    scenario: 'Mỗi chương trình đang chạy trên Linux là một tiến trình có PID riêng. Bạn có thể liệt kê toàn bộ tiến trình bằng `ps aux` và kiểm tra tài nguyên bằng `free -h` hoặc `uptime`.',
    tasks: [
      'Liệt kê toàn bộ tiến trình đang chạy trên hệ thống bằng lệnh `ps aux`.',
      'Kiểm tra thời gian hoạt động và tải hệ thống bằng lệnh `uptime`.',
    ],
    hints: [
      'Chạy `ps aux` để xem danh sách PID, USER, COMMAND.',
      'Chạy `uptime` để xem thời gian máy chủ đã chạy.',
    ],
    usefulCommands: [
      'ps aux - Liệt kê tất cả tiến trình đang chạy',
      'kill <PID> - Gửi tín hiệu dừng tiến trình theo PID',
      'uptime - Xem thời gian hoạt động và load average',
    ],
    checks: [
      {
        id: 'proc-1',
        title: 'Liệt kê tiến trình với ps aux',
        description: 'Đã chạy lệnh ps aux',
        points: 50,
        hint: 'Chạy: ps aux',
      },
      {
        id: 'proc-2',
        title: 'Kiểm tra tải hệ thống với uptime',
        description: 'Đã chạy lệnh uptime',
        points: 50,
        hint: 'Chạy: uptime',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.startsWith('ps'));
      const p2 = hist.some((h) => h.startsWith('uptime') || h.startsWith('top') || h.startsWith('free'));
      return [
        {
          id: 'proc-1',
          title: 'Liệt kê tiến trình với ps aux',
          passed: p1,
          pointsEarned: p1 ? 50 : 0,
          maxPoints: 50,
          message: p1 ? 'Đã liệt kê danh sách tiến trình.' : 'Chưa chạy lệnh ps aux.',
          hint: 'Chạy: ps aux',
        },
        {
          id: 'proc-2',
          title: 'Kiểm tra tải hệ thống với uptime',
          passed: p2,
          pointsEarned: p2 ? 50 : 0,
          maxPoints: 50,
          message: p2 ? 'Đã kiểm tra trạng thái hệ thống.' : 'Chưa chạy lệnh uptime.',
          hint: 'Chạy: uptime',
        },
      ];
    },
  },
];

export const PACKAGES_LABS: LabDefinition[] = [
  {
    id: 701,
    slug: 'yum-dnf-package-management',
    title: 'Package Management with DNF / YUM & RPM',
    category: 'Packages',
    difficulty: 'Trung bình',
    estimatedTime: '8 phút',
    summary: 'Search, inspect, and install software packages on CentOS Stream 9 using dnf/yum.',
    scenario: 'Trên CentOS Stream 9 / RHEL 9, `dnf` ( và `yum`) cùng `rpm` được sử dụng để quản lý các gói phần mềm. Hãy cài đặt gói máy chủ web `nginx` hoặc công cụ `htop`.',
    tasks: [
      'Kiểm tra danh sách các gói đã cài đặt bằng lệnh `dnf list installed` (hoặc `rpm -qa`).',
      'Cài đặt gói `nginx` bằng lệnh `dnf install -y nginx` (hoặc `yum install -y nginx`).',
    ],
    hints: [
      'Gõ `dnf list installed` hoặc `rpm -qa`.',
      'Gõ `dnf install -y nginx` để cài đặt gói nginx.',
    ],
    usefulCommands: [
      'dnf list installed - Xem các gói đã cài đặt',
      'dnf install -y <pkg> - Cài đặt gói phần mềm mới',
      'rpm -qa - Truy vấn tất cả gói RPM trên hệ thống',
    ],
    checks: [
      {
        id: 'pkg-1',
        title: 'Truy vấn danh sách gói đã cài đặt',
        description: 'Đã chạy dnf list installed hoặc rpm -qa',
        points: 40,
        hint: 'Chạy: dnf list installed',
      },
      {
        id: 'pkg-2',
        title: 'Cài đặt gói phần mềm nginx',
        description: 'Gói nginx đã được đánh dấu installed trong hệ thống',
        points: 60,
        hint: 'Chạy: dnf install -y nginx',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      const nginxPkg = kernel.packages.get('nginx');
      if (nginxPkg) nginxPkg.installed = false;
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some(
        (h) => h.includes('dnf list') || h.includes('yum list') || h.includes('rpm -q')
      );
      const nginxPkg = kernel.packages.get('nginx');
      const p2 = Boolean(nginxPkg?.installed);
      return [
        {
          id: 'pkg-1',
          title: 'Truy vấn danh sách gói đã cài đặt',
          passed: p1,
          pointsEarned: p1 ? 40 : 0,
          maxPoints: 40,
          message: p1 ? 'Đã kiểm tra danh sách gói.' : 'Chưa chạy dnf list installed hoặc rpm -qa.',
          hint: 'Chạy: dnf list installed',
        },
        {
          id: 'pkg-2',
          title: 'Cài đặt gói phần mềm nginx',
          passed: p2,
          pointsEarned: p2 ? 60 : 0,
          maxPoints: 60,
          message: p2 ? 'Đã cài đặt gói nginx thành công.' : 'Gói nginx chưa được cài đặt.',
          hint: 'Chạy: dnf install -y nginx',
        },
      ];
    },
  },
];

export const GRASSHOPPER_MODULES: CourseModule[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'What is Linux? Get started with choosing a distribution and installation.',
    section: 'Grasshopper',
    labs: GETTING_STARTED_LABS,
  },
  {
    id: 'command-line',
    title: 'Command Line',
    description: 'Learn the fundamentals of the command line, navigating files, directories, and more.',
    section: 'Grasshopper',
    labs: COMMAND_LINE_LABS,
  },
  {
    id: 'text-fu',
    title: 'Text-Fu',
    description: 'Learn basic text manipulation and navigation.',
    section: 'Grasshopper',
    labs: TEXT_FU_LABS,
  },
  {
    id: 'advanced-text-fu',
    title: 'Advanced Text-Fu',
    description: 'Navigate text like a Linux spider monkey with Vim and Emacs.',
    section: 'Grasshopper',
    labs: ADVANCED_TEXT_FU_LABS,
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Learn about user roles and management.',
    section: 'Grasshopper',
    labs: USER_MANAGEMENT_LABS,
  },
  {
    id: 'permissions',
    title: 'Permissions',
    description: 'Learn about permission levels and modifying permissions.',
    section: 'Grasshopper',
    labs: PERMISSIONS_LABS,
  },
  {
    id: 'processes',
    title: 'Processes',
    description: 'Learn about the running processes on the system.',
    section: 'Grasshopper',
    labs: PROCESSES_LABS,
  },
  {
    id: 'packages',
    title: 'Packages',
    description: 'Learn all about the dpkg, apt-get, rpm, and yum package management tools.',
    section: 'Grasshopper',
    labs: PACKAGES_LABS,
  },
];

export const ALL_LABS: LabDefinition[] = GRASSHOPPER_MODULES.flatMap((m) => m.labs);

export const LABS: LabDefinition[] = COMMAND_LINE_LABS;

