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
    title: 'I/O Redirection (Redirecting Input and Output in Linux)',
    category: 'Text-Fu',
    difficulty: 'Cơ bản',
    estimatedTime: '15 phút',
    summary: 'Master standard streams (stdin, stdout, stderr) and redirection operators: >, >>, 2>, 2>>, &>, tee, and <.',
    scenario: 'Trong hệ điều hành Linux, việc kiểm soát luồng dữ liệu là kỹ năng tối quan trọng. Bài thực hành này giúp bạn làm chủ 3 luồng tiêu chuẩn (stdin, stdout, stderr), các toán tử chuyển hướng >, >>, 2>, 2>>, &>, cũng như sử dụng lệnh tee và chuyển hướng đầu vào < theo chuẩn CompTIA Linux+ và LabEx #590840.',
    tasks: [
      'Task 1: Tạo tệp `greetings.txt` và chuyển hướng Standard Output với toán tử `>` (`echo "Hello, this is the first line." > greetings.txt`).',
      'Task 2: Nối thêm dòng thứ 2 vào `greetings.txt` với `>>` và ghi nhật ký thời gian vào `activity.log` (`date >> activity.log`).',
      'Task 3: Chuyển hướng Standard Error với toán tử `2>` vào `error.txt` (`ls /nonexistent_folder 2> error.txt`).',
      'Task 4: Chuyển hướng cả stdout và stderr vào một tệp `output.txt` bằng toán tử `&>` (hoặc `> output.txt 2>&1`), đồng thời thử nghiệm hủy output với `/dev/null`.',
      'Task 5: Tách đôi luồng dữ liệu bằng lệnh `tee` (`ls /etc | tee etc_listing.txt`) và chuyển hướng đầu vào stdin bằng toán tử `<` (`wc -w < greetings.txt`).',
    ],
    hints: [
      'Chạy: echo "Hello, this is the first line." > greetings.txt',
      'Chạy: echo "This is the second line, appended." >> greetings.txt && date >> activity.log',
      'Chạy: ls /nonexistent_folder 2> error.txt',
      'Chạy: ls -d /root /nonexistent_folder &> output.txt',
      'Chạy: ls /etc | tee etc_listing.txt && wc -w < greetings.txt',
    ],
    usefulCommands: [
      'cmd > file - Chuyển hướng stdout (ghi đè file)',
      'cmd >> file - Nối thêm stdout vào file',
      'cmd 2> file - Chuyển hướng stderr ra file',
      'cmd &> file - Chuyển cả stdout và stderr vào một file',
      'cmd > /dev/null 2>&1 - Hủy toàn bộ output vào thiết bị rác',
      'cmd1 | tee file - Vừa in ra màn hình vừa lưu vào file',
      'cmd < file - Chuyển hướng nội dung file vào stdin của lệnh',
    ],
    checks: [
      {
        id: 'io-1',
        title: 'Chuyển hướng Standard Output với >',
        description: 'Đã tạo tệp greetings.txt với nội dung dòng đầu tiên bằng toán tử >',
        points: 20,
        hint: 'Chạy: echo "Hello, this is the first line." > greetings.txt',
      },
      {
        id: 'io-2',
        title: 'Nối thêm dữ liệu với >>',
        description: 'Tệp greetings.txt có ít nhất 2 dòng và tệp activity.log đã được tạo bằng >>',
        points: 20,
        hint: 'Chạy: echo "This is the second line, appended." >> greetings.txt && date >> activity.log',
      },
      {
        id: 'io-3',
        title: 'Chuyển hướng Standard Error với 2>',
        description: 'Đã ghi nhận thông báo lỗi vào tệp error.txt bằng toán tử 2>',
        points: 20,
        hint: 'Chạy: ls /nonexistent_folder 2> error.txt',
      },
      {
        id: 'io-4',
        title: 'Chuyển hướng kết hợp cả stdout và stderr',
        description: 'Đã tạo tệp output.txt chứa cả kết quả thành công và lỗi (hoặc chạy lệnh với &> hay 2>&1)',
        points: 20,
        hint: 'Chạy: ls -d /root /nonexistent_folder &> output.txt',
      },
      {
        id: 'io-5',
        title: 'Sử dụng lệnh tee và chuyển hướng stdin <',
        description: 'Đã tạo etc_listing.txt bằng lệnh tee và chạy lệnh đọc stdin với < (ví dụ wc -w < greetings.txt)',
        points: 20,
        hint: 'Chạy: ls /etc | tee etc_listing.txt && wc -w < greetings.txt',
      },
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.cwd = '/home/pete';
      kernel.vfs.unlink('/home/pete/greetings.txt');
      kernel.vfs.unlink('/home/pete/activity.log');
      kernel.vfs.unlink('/home/pete/error.txt');
      kernel.vfs.unlink('/home/pete/output.txt');
      kernel.vfs.unlink('/home/pete/etc_listing.txt');
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());

      // Check 1: greetings.txt exists and has content
      const greetings1 =
        kernel.vfs.readFile(kernel.vfs.resolvePath(kernel.cwd, 'greetings.txt')) ||
        kernel.vfs.readFile('/home/pete/greetings.txt') ||
        kernel.vfs.readFile('/root/greetings.txt');
      const linesGreetings = (greetings1 || '').trim().split('\n').filter(Boolean);
      const p1 = greetings1 !== null && linesGreetings.length >= 1;

      // Check 2: greetings.txt has >= 2 lines AND activity.log exists
      const actLog =
        kernel.vfs.readFile(kernel.vfs.resolvePath(kernel.cwd, 'activity.log')) ||
        kernel.vfs.readFile('/home/pete/activity.log') ||
        kernel.vfs.readFile('/root/activity.log');
      const p2 = p1 && linesGreetings.length >= 2 && actLog !== null;

      // Check 3: error.txt exists and contains error text
      const errTxt =
        kernel.vfs.readFile(kernel.vfs.resolvePath(kernel.cwd, 'error.txt')) ||
        kernel.vfs.readFile('/home/pete/error.txt') ||
        kernel.vfs.readFile('/root/error.txt');
      const ranErrRedirect = hist.some((h) => h.includes('2>') && (h.includes('error.txt') || h.includes('error')));
      const p3 = (errTxt !== null && errTxt.length > 0) || ranErrRedirect;

      // Check 4: output.txt exists or command with &> / 2>&1 ran
      const outTxt =
        kernel.vfs.readFile(kernel.vfs.resolvePath(kernel.cwd, 'output.txt')) ||
        kernel.vfs.readFile('/home/pete/output.txt') ||
        kernel.vfs.readFile('/root/output.txt');
      const ranBothRedirect = hist.some((h) => h.includes('&>') || h.includes('2>&1'));
      const p4 = (outTxt !== null && outTxt.length > 0) || ranBothRedirect;

      // Check 5: etc_listing.txt exists (tee) AND stdin redirect (<) ran
      const etcList =
        kernel.vfs.readFile(kernel.vfs.resolvePath(kernel.cwd, 'etc_listing.txt')) ||
        kernel.vfs.readFile('/home/pete/etc_listing.txt') ||
        kernel.vfs.readFile('/root/etc_listing.txt');
      const ranTee = hist.some((h) => h.includes('tee')) || (etcList !== null && etcList.length > 0);
      const ranInputRedirect = hist.some((h) => h.includes('<'));
      const p5 = ranTee && ranInputRedirect;

      return [
        {
          id: 'io-1',
          title: 'Chuyển hướng Standard Output với >',
          passed: p1,
          pointsEarned: p1 ? 20 : 0,
          maxPoints: 20,
          message: p1 ? 'Đã tạo tệp greetings.txt thành công.' : 'Chưa tạo tệp greetings.txt bằng toán tử >.',
          hint: 'Chạy: echo "Hello, this is the first line." > greetings.txt',
        },
        {
          id: 'io-2',
          title: 'Nối thêm dữ liệu với >>',
          passed: p2,
          pointsEarned: p2 ? 20 : 0,
          maxPoints: 20,
          message: p2 ? 'Đã nối thêm dòng thứ 2 và tạo activity.log thành công.' : 'Tệp greetings.txt chưa có 2 dòng hoặc chưa tạo activity.log.',
          hint: 'Chạy: echo "This is the second line, appended." >> greetings.txt && date >> activity.log',
        },
        {
          id: 'io-3',
          title: 'Chuyển hướng Standard Error với 2>',
          passed: p3,
          pointsEarned: p3 ? 20 : 0,
          maxPoints: 20,
          message: p3 ? 'Đã lưu thông báo lỗi vào error.txt thành công.' : 'Chưa chuyển hướng thông báo lỗi bằng 2> vào error.txt.',
          hint: 'Chạy: ls /nonexistent_folder 2> error.txt',
        },
        {
          id: 'io-4',
          title: 'Chuyển hướng kết hợp cả stdout và stderr',
          passed: p4,
          pointsEarned: p4 ? 20 : 0,
          maxPoints: 20,
          message: p4 ? 'Đã chuyển hướng kết hợp cả stdout và stderr vào output.txt.' : 'Chưa chạy lệnh chuyển hướng &> hoặc 2>&1 vào output.txt.',
          hint: 'Chạy: ls -d /root /nonexistent_folder &> output.txt',
        },
        {
          id: 'io-5',
          title: 'Sử dụng lệnh tee và chuyển hướng stdin <',
          passed: p5,
          pointsEarned: p5 ? 20 : 0,
          maxPoints: 20,
          message: p5 ? 'Đã sử dụng lệnh tee và toán tử chuyển hướng đầu vào <.' : 'Chưa chạy lệnh kết hợp tee hoặc toán tử <.',
          hint: 'Chạy: ls /etc | tee etc_listing.txt && wc -w < greetings.txt',
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
  // 601. ps (Monitor Processes)
  {
    id: 601,
    slug: 'monitor-processes-ps-command',
    title: 'ps (Giám sát tiến trình với ps & top)',
    category: 'Processes',
    difficulty: 'Cơ bản',
    estimatedTime: '6 phút',
    summary: 'Giám sát và kiểm tra tiến trình đang chạy trong Linux bằng các lệnh ps và top.',
    scenario: 'Mỗi chương trình chạy trong Linux là một tiến trình có PID riêng. Lệnh ps chụp ảnh nhanh tức thời của các tiến trình, trong khi top cung cấp màn hình theo dõi tài nguyên động theo thời gian thực.',
    tasks: [
      'Kiểm tra các tiến trình thuộc terminal hiện tại bằng lệnh ps cơ bản.',
      'Liệt kê chi tiết toàn bộ tiến trình hệ thống bằng cú pháp BSD: ps aux (hoặc chuẩn POSIX: ps -ef).',
      'Kiểm tra tải CPU/RAM hệ thống bằng lệnh top (hoặc uptime, free).',
    ],
    hints: [
      'Chạy ps để xem các tiến trình trong phiên terminal.',
      'Chạy ps aux để xem các cột USER, PID, %CPU, %MEM, COMMAND.',
      'Chạy top hoặc uptime để xem thông số tải máy chủ.',
    ],
    usefulCommands: [
      'ps - Liệt kê tiến trình trong terminal hiện tại',
      'ps aux - Liệt kê tất cả tiến trình theo phong cách BSD',
      'ps -ef - Liệt kê tiến trình theo chuẩn POSIX/UNIX',
      'top - Giám sát tiến trình và tài nguyên theo thời gian thực',
    ],
    checks: [
      {
        id: 'ps-1',
        title: 'Liệt kê tiến trình với ps',
        description: 'Đã chạy lệnh ps trong phiên terminal hiện tại',
        points: 35,
        hint: 'Chạy: ps',
      },
      {
        id: 'ps-2',
        title: 'Liệt kê toàn bộ tiến trình hệ thống',
        description: 'Đã chạy lệnh ps aux hoặc ps -ef để xem toàn bộ tiến trình',
        points: 35,
        hint: 'Chạy: ps aux',
      },
      {
        id: 'ps-3',
        title: 'Kiểm tra tài nguyên với top hoặc uptime',
        description: 'Đã chạy lệnh top, uptime hoặc free để theo dõi tải hệ thống',
        points: 30,
        hint: 'Chạy: top hoặc uptime',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h === 'ps' || h.startsWith('ps '));
      const p2 = hist.some(
        (h) => h.includes('ps aux') || h.includes('ps -ef') || h.includes('ps -e') || h.includes('ps ax')
      );
      const p3 = hist.some((h) => h.startsWith('top') || h.startsWith('uptime') || h.startsWith('free'));
      return [
        {
          id: 'ps-1',
          title: 'Liệt kê tiến trình với ps',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã chạy lệnh ps thành công.' : 'Chưa chạy lệnh ps.',
          hint: 'Chạy: ps',
        },
        {
          id: 'ps-2',
          title: 'Liệt kê toàn bộ tiến trình hệ thống',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã liệt kê toàn bộ tiến trình bằng ps aux/ps -ef.' : 'Chưa chạy lệnh ps aux hoặc ps -ef.',
          hint: 'Chạy: ps aux',
        },
        {
          id: 'ps-3',
          title: 'Kiểm tra tài nguyên với top hoặc uptime',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã theo dõi tài nguyên máy chủ.' : 'Chưa chạy top hoặc uptime.',
          hint: 'Chạy: top hoặc uptime',
        },
      ];
    },
  },

  // 602. controlling-terminal
  {
    id: 602,
    slug: 'controlling-terminal',
    title: 'Controlling Terminal (Thiết bị đầu cuối điều khiển)',
    category: 'Processes',
    difficulty: 'Cơ bản',
    estimatedTime: '5 phút',
    summary: 'Xác định thiết bị terminal điều khiển (TTY/PTS) và nhận diện các tiến trình daemon không gắn terminal.',
    scenario: 'Khi bạn mở một terminal, hệ thống cấp phát một thiết bị ảo như /dev/pts/0 làm controlling terminal. Các dịch vụ hệ thống (daemons) chạy nền thường không gắn với terminal nào và hiển thị dấu hỏi (?) trong cột TTY.',
    tasks: [
      'Kiểm tra tên thiết bị terminal hiện tại bằng lệnh tty.',
      'Chạy ps để quan sát cột TTY của các tiến trình trong phiên làm việc.',
      'Liệt kê các tiến trình daemon không có terminal điều khiển bằng ps -x hoặc ps aux.',
    ],
    hints: [
      'Chạy lệnh tty để in ra tên thiết bị (ví dụ /dev/pts/0).',
      'Chạy ps để xem cột TTY hiển thị pts/0.',
      'Chạy ps -x hoặc ps aux để thấy nhiều tiến trình hệ thống có cột TTY là ?.',
    ],
    usefulCommands: [
      'tty - In tên tệp của thiết bị terminal hiện tại',
      'ps -o pid,tty,cmd - Xem cụ thể cột TTY của tiến trình',
      'ps -x - Liệt kê cả các tiến trình không gắn controlling terminal',
    ],
    checks: [
      {
        id: 'tty-1',
        title: 'Kiểm tra thiết bị với tty',
        description: 'Đã chạy lệnh tty để xác định thiết bị đầu cuối điều khiển',
        points: 35,
        hint: 'Chạy: tty',
      },
      {
        id: 'tty-2',
        title: 'Xem cột TTY với ps',
        description: 'Đã chạy ps để kiểm tra cột TTY của các tiến trình',
        points: 35,
        hint: 'Chạy: ps hoặc ps -o pid,tty,cmd',
      },
      {
        id: 'tty-3',
        title: 'Nhận diện tiến trình daemon không gắn TTY',
        description: 'Đã chạy ps -x hoặc ps aux để quan sát tiến trình mang ký hiệu ?',
        points: 30,
        hint: 'Chạy: ps -x hoặc ps aux',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h === 'tty' || h.startsWith('tty '));
      const p2 = hist.some((h) => h === 'ps' || h.startsWith('ps '));
      const p3 = hist.some(
        (h) => h.includes('ps -x') || h.includes('ps aux') || h.includes('ps -ef') || h.includes('grep ?')
      );
      return [
        {
          id: 'tty-1',
          title: 'Kiểm tra thiết bị với tty',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã xác định thiết bị terminal thành công.' : 'Chưa chạy lệnh tty.',
          hint: 'Chạy: tty',
        },
        {
          id: 'tty-2',
          title: 'Xem cột TTY với ps',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã quan sát cột TTY trong bảng tiến trình.' : 'Chưa chạy lệnh ps.',
          hint: 'Chạy: ps',
        },
        {
          id: 'tty-3',
          title: 'Nhận diện tiến trình daemon không gắn TTY',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã nhận diện các tiến trình nền daemon (TTY = ?).' : 'Chưa chạy ps -x hoặc ps aux.',
          hint: 'Chạy: ps -x hoặc ps aux',
        },
      ];
    },
  },

  // 603. process-details
  {
    id: 603,
    slug: 'process-details',
    title: 'Process Details (Cấu trúc và chi tiết tiến trình)',
    category: 'Processes',
    difficulty: 'Cơ bản',
    estimatedTime: '6 phút',
    summary: 'Khám phá quan hệ cha-con (PID và PPID), quyền thực thi và cấu trúc cây phân cấp tiến trình.',
    scenario: 'Mọi tiến trình trong Linux (ngoại trừ PID 1) đều được sinh ra bởi một tiến trình cha (Parent Process ID - PPID). Việc nắm vững quan hệ cha-con và quyền hạn chạy tiến trình là cốt lõi trong quản trị hệ thống.',
    tasks: [
      'Hiển thị danh sách tiến trình kèm cột PPID bằng ps -ef hoặc ps -o pid,ppid,cmd.',
      'Xem PID của chính phiên shell hiện tại bằng biến đặc biệt echo $$.',
      'Xem cây phân cấp tiến trình trực quan bằng lệnh pstree (hoặc ps axjf).',
    ],
    hints: [
      'Chạy ps -ef để xem cột PPID cạnh PID.',
      'Chạy echo $$ để lấy PID của shell đang chạy.',
      'Chạy pstree để thấy nhánh quan hệ từ systemd đến bash.',
    ],
    usefulCommands: [
      'echo $$ - In PID của shell hiện tại',
      'ps -ef - Liệt kê tiến trình đầy đủ bao gồm cột PPID',
      'ps -o pid,ppid,user,cmd - Tùy chỉnh cột hiển thị của ps',
      'pstree - Hiển thị cây phân cấp tiến trình trực quan',
    ],
    checks: [
      {
        id: 'detail-1',
        title: 'Xem quan hệ PID và PPID',
        description: 'Đã chạy ps -ef hoặc ps kèm cột PPID để quan sát tiến trình cha',
        points: 35,
        hint: 'Chạy: ps -ef',
      },
      {
        id: 'detail-2',
        title: 'Kiểm tra PID của shell với $$',
        description: 'Đã in ra PID của shell hiện tại bằng echo $$',
        points: 35,
        hint: 'Chạy: echo $$',
      },
      {
        id: 'detail-3',
        title: 'Xem cây tiến trình với pstree',
        description: 'Đã hiển thị cây phân cấp tiến trình với pstree hoặc ps axjf',
        points: 30,
        hint: 'Chạy: pstree',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('ppid') || h.includes('ps -ef') || h.includes('ps -f'));
      const p2 = hist.some((h) => h.includes('$$') || h.includes('echo $') || h.includes('ps -p $$'));
      const p3 = hist.some(
        (h) => h.startsWith('pstree') || h.includes('ps axjf') || h.includes('ps -ejh') || h.includes('pstree')
      );
      return [
        {
          id: 'detail-1',
          title: 'Xem quan hệ PID và PPID',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã quan sát quan hệ PID và PPID thành công.' : 'Chưa chạy ps -ef.',
          hint: 'Chạy: ps -ef',
        },
        {
          id: 'detail-2',
          title: 'Kiểm tra PID của shell với $$',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã kiểm tra PID của shell hiện tại ($$).' : 'Chưa chạy echo $$.',
          hint: 'Chạy: echo $$',
        },
        {
          id: 'detail-3',
          title: 'Xem cây tiến trình với pstree',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã xem cây tiến trình hệ thống.' : 'Chưa chạy lệnh pstree.',
          hint: 'Chạy: pstree',
        },
      ];
    },
  },

  // 604. process-creation
  {
    id: 604,
    slug: 'process-creation',
    title: 'Process Creation (Khởi tạo tiến trình: fork & exec)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Tìm hiểu cơ chế sinh tiến trình qua fork & exec, vai trò của PID 1 (systemd) và khởi chạy tiến trình con.',
    scenario: 'Linux tạo tiến trình mới bằng cơ chế gọi hệ thống fork() để nhân bản và exec() để nạp chương trình mới. PID 1 (systemd) là cội nguồn của toàn bộ không gian người dùng.',
    tasks: [
      'Kiểm tra tiến trình đầu tiên PID 1 của hệ thống bằng lệnh ps -p 1 -o pid,ppid,comm,cmd.',
      'Khởi chạy một tiến trình con chạy nền bằng sleep 300 &.',
      'Tìm kiếm PID của tiến trình con vừa tạo bằng công cụ pgrep sleep.',
    ],
    hints: [
      'Chạy ps -p 1 -o pid,ppid,comm,cmd để xem thông tin của systemd.',
      'Chạy sleep 300 & để tạo tiến trình con chạy ngầm.',
      'Chạy pgrep sleep hoặc pgrep -l sleep để lấy PID của tiến trình con.',
    ],
    usefulCommands: [
      'ps -p 1 -o pid,ppid,cmd - Xem tiến trình gốc PID 1',
      'sleep 300 & - Chạy lệnh sleep 300 giây trong nền',
      'pgrep sleep - Tìm PID của tiến trình theo tên lệnh',
    ],
    checks: [
      {
        id: 'create-1',
        title: 'Kiểm tra tiến trình PID 1',
        description: 'Đã kiểm tra thông tin của tiến trình init/systemd (PID 1)',
        points: 35,
        hint: 'Chạy: ps -p 1 -o pid,ppid,cmd',
      },
      {
        id: 'create-2',
        title: 'Khởi chạy tiến trình con trong nền',
        description: 'Đã khởi chạy tiến trình sleep 300 & trong nền',
        points: 35,
        hint: 'Chạy: sleep 300 &',
      },
      {
        id: 'create-3',
        title: 'Tìm PID tiến trình con với pgrep',
        description: 'Đã sử dụng lệnh pgrep để định vị PID của sleep',
        points: 30,
        hint: 'Chạy: pgrep sleep',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some(
        (h) => h.includes('-p 1') || h.includes('ps 1') || (h.includes('pid,ppid') && h.includes('1'))
      );
      const p2 = hist.some((h) => h.includes('sleep') && h.includes('&'));
      const p3 = hist.some(
        (h) => h.startsWith('pgrep') || h.includes('pgrep sleep') || h.includes('pidof sleep')
      );
      return [
        {
          id: 'create-1',
          title: 'Kiểm tra tiến trình PID 1',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã kiểm tra tiến trình PID 1 thành công.' : 'Chưa chạy ps kiểm tra PID 1.',
          hint: 'Chạy: ps -p 1 -o pid,ppid,cmd',
        },
        {
          id: 'create-2',
          title: 'Khởi chạy tiến trình con trong nền',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã khởi chạy tiến trình con thành công.' : 'Chưa chạy lệnh sleep 300 &.',
          hint: 'Chạy: sleep 300 &',
        },
        {
          id: 'create-3',
          title: 'Tìm PID tiến trình con với pgrep',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã tìm thấy PID với lệnh pgrep.' : 'Chưa chạy pgrep sleep.',
          hint: 'Chạy: pgrep sleep',
        },
      ];
    },
  },

  // 605. process-termination
  {
    id: 605,
    slug: 'process-termination',
    title: 'Process Termination (Kết thúc tiến trình, Zombie & Orphan)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Kiểm tra mã trạng thái thoát ($?), hiểu hiện tượng Zombie, Orphan và cơ chế thu dọn của init.',
    scenario: 'Khi tiến trình gọi exit(), nó trả về một mã trạng thái (exit status 0-255). Nếu tiến trình cha không gọi wait() để đọc trạng thái, tiến trình con sẽ trở thành Zombie (Z). Nếu tiến trình cha chết trước, tiến trình con mồ côi (Orphan) sẽ được PID 1 nhận nuôi.',
    tasks: [
      'Chạy một câu lệnh thành công (như true hoặc ls) và kiểm tra mã thoát bằng echo $?.',
      'Cố tình chạy một câu lệnh thất bại (như ls /nonexistent_dir) và kiểm tra mã lỗi $? khác 0.',
      'Kiểm tra các tiến trình zombie trên hệ thống bằng lệnh ps -eo pid,stat,cmd.',
    ],
    hints: [
      'Chạy ls /root && echo $? để xem mã 0 (thành công).',
      'Chạy ls /thu_muc_khong_ton_tai rồi gõ echo $? để xem mã khác 0 (lỗi).',
      'Chạy ps -eo pid,stat,cmd để tìm kiếm các cờ trạng thái tiến trình.',
    ],
    usefulCommands: [
      'echo $? - In mã trạng thái kết thúc của câu lệnh liền trước',
      'true - Lệnh luôn trả về mã thoát 0',
      'false - Lệnh luôn trả về mã thoát 1',
      'ps -eo pid,stat,cmd - Xem trạng thái tất cả tiến trình',
    ],
    checks: [
      {
        id: 'term-1',
        title: 'Kiểm tra mã thoát thành công echo $?',
        description: 'Đã kiểm tra mã thoát thành công ($? = 0)',
        points: 35,
        hint: 'Chạy: true && echo $?',
      },
      {
        id: 'term-2',
        title: 'Kiểm tra mã thoát lỗi của lệnh thất bại',
        description: 'Đã kiểm tra mã thoát khi câu lệnh gặp lỗi ($? > 0)',
        points: 35,
        hint: 'Chạy: ls /nonexistent && echo $?',
      },
      {
        id: 'term-3',
        title: 'Truy vấn cờ trạng thái tiến trình với ps',
        description: 'Đã chạy ps kèm cột stat để kiểm tra tiến trình',
        points: 30,
        hint: 'Chạy: ps -eo pid,stat,cmd',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('echo $?'));
      const p2 = hist.some(
        (h) =>
          h.includes('false') ||
          h.includes('nonexistent') ||
          h.includes('khong') ||
          (h.includes('echo $?') && kernel.lastExitCode !== 0)
      );
      const p3 = hist.some((h) => h.includes('stat') && h.includes('ps'));
      return [
        {
          id: 'term-1',
          title: 'Kiểm tra mã thoát thành công echo $?',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã kiểm tra biến $? thành công.' : 'Chưa chạy echo $?.',
          hint: 'Chạy: true && echo $?',
        },
        {
          id: 'term-2',
          title: 'Kiểm tra mã thoát lỗi của lệnh thất bại',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã kiểm tra mã lỗi của câu lệnh thất bại.' : 'Chưa chạy lệnh gây lỗi và echo $?.',
          hint: 'Chạy: ls /nonexistent && echo $?',
        },
        {
          id: 'term-3',
          title: 'Truy vấn cờ trạng thái tiến trình với ps',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã kiểm tra cột STAT của tiến trình.' : 'Chưa chạy ps -eo pid,stat,cmd.',
          hint: 'Chạy: ps -eo pid,stat,cmd',
        },
      ];
    },
  },

  // 606. process-signals
  {
    id: 606,
    slug: 'process-signals',
    title: 'Signals (Hệ thống tín hiệu trong Linux)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '6 phút',
    summary: 'Khám phá danh sách tín hiệu trong Linux, hành vi mặc định và các tín hiệu bất khả kháng như SIGKILL, SIGSTOP.',
    scenario: 'Tín hiệu (signals) là cơ chế IPC bất đồng bộ thông báo cho tiến trình về một sự kiện. Hầu hết các tín hiệu có thể được bắt (catch) hoặc bỏ qua (ignore), ngoại trừ SIGKILL (9) và SIGSTOP (19).',
    tasks: [
      'Liệt kê danh sách toàn bộ các tín hiệu được kernel hỗ trợ bằng kill -l.',
      'Tra cứu mã số tương ứng của SIGTERM, SIGKILL và SIGINT bằng kill -l SIGTERM SIGKILL SIGINT.',
      'Thực hiện kiểm tra thăm dò tín hiệu an toàn tới phiên shell bằng kill -0 $$.',
    ],
    hints: [
      'Chạy kill -l để xem bảng 64 tín hiệu chuẩn và realtime.',
      'Chạy kill -l SIGTERM SIGKILL SIGINT để xem các số hiệu 15, 9, 2.',
      'Chạy kill -0 $$ để kiểm tra quyền và sự tồn tại của chính shell mà không gửi tín hiệu thật.',
    ],
    usefulCommands: [
      'kill -l - Liệt kê tất cả tên tín hiệu',
      'kill -l <SIGNAL> - Tra cứu mã số của tín hiệu',
      'kill -0 <PID> - Kiểm tra quyền và sự tồn tại của tiến trình',
    ],
    checks: [
      {
        id: 'sig-1',
        title: 'Liệt kê danh sách tín hiệu với kill -l',
        description: 'Đã chạy lệnh kill -l để xem các tín hiệu hệ thống',
        points: 35,
        hint: 'Chạy: kill -l',
      },
      {
        id: 'sig-2',
        title: 'Tra cứu số hiệu tín hiệu cụ thể',
        description: 'Đã tra cứu mã hiệu của SIGTERM hoặc SIGKILL qua kill -l',
        points: 35,
        hint: 'Chạy: kill -l SIGTERM SIGKILL',
      },
      {
        id: 'sig-3',
        title: 'Thử nghiệm tín hiệu kiểm tra kill -0',
        description: 'Đã chạy kill -0 để thăm dò quyền gửi tín hiệu',
        points: 30,
        hint: 'Chạy: kill -0 $$',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h === 'kill -l' || h.startsWith('kill -l'));
      const p2 = hist.some(
        (h) => h.includes('kill -l sig') || h.includes('kill -l term') || h.includes('kill -l kill')
      );
      const p3 = hist.some((h) => h.includes('kill -0'));
      return [
        {
          id: 'sig-1',
          title: 'Liệt kê danh sách tín hiệu với kill -l',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã liệt kê danh sách tín hiệu kernel.' : 'Chưa chạy kill -l.',
          hint: 'Chạy: kill -l',
        },
        {
          id: 'sig-2',
          title: 'Tra cứu số hiệu tín hiệu cụ thể',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã tra cứu mã số tín hiệu thành công.' : 'Chưa chạy kill -l SIGTERM.',
          hint: 'Chạy: kill -l SIGTERM SIGKILL',
        },
        {
          id: 'sig-3',
          title: 'Thử nghiệm tín hiệu kiểm tra kill -0',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã thực hiện kiểm tra tín hiệu thăm dò với kill -0.' : 'Chưa chạy kill -0 $$.',
          hint: 'Chạy: kill -0 $$',
        },
      ];
    },
  },

  // 607. killing-processes
  {
    id: 607,
    slug: 'killing-processes',
    title: 'kill (Chấm dứt và gửi tín hiệu tới tiến trình)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Áp dụng quy trình leo thang tín hiệu an toàn (SIGTERM -> SIGKILL) để chấm dứt tiến trình.',
    scenario: 'Khi cần dừng một tiến trình, nguyên tắc vàng là bắt đầu với SIGTERM để cho phép ứng dụng dọn dẹp tài nguyên. Chỉ khi tiến trình bị treo không phản hồi sau một khoảng thời gian hợp lý mới leo thang sang SIGKILL.',
    tasks: [
      'Khởi chạy tiến trình sleep 600 & trong nền.',
      'Tìm PID của tiến trình sleep và kiểm tra quyền gửi tín hiệu bằng kill -0 <PID>.',
      'Gửi tín hiệu kết thúc an toàn bằng kill -TERM <PID> (hoặc kill <PID>).',
      'Kiểm tra lại danh sách tiến trình bằng ps để đảm bảo tiến trình đã được kết thúc sạch sẽ.',
    ],
    hints: [
      'Chạy sleep 600 & để tạo tiến trình kiểm thử.',
      'Chạy pgrep sleep để lấy PID, sau đó chạy kill -0 <PID>.',
      'Chạy kill -TERM <PID> hoặc kill <PID> để yêu cầu kết thúc.',
      'Chạy ps aux | grep sleep để xác nhận tiến trình không còn chạy.',
    ],
    usefulCommands: [
      'kill <PID> - Gửi tín hiệu SIGTERM (mặc định) tới PID',
      'kill -TERM <PID> - Gửi tường minh tín hiệu SIGTERM',
      'kill -KILL <PID> hoặc kill -9 <PID> - Cưỡng chế kết thúc ngay lập tức',
      'pgrep sleep - Tìm PID của lệnh sleep',
    ],
    checks: [
      {
        id: 'k-1',
        title: 'Khởi chạy tiến trình nền sleep',
        description: 'Đã khởi chạy sleep 600 & trong nền',
        points: 30,
        hint: 'Chạy: sleep 600 &',
      },
      {
        id: 'k-2',
        title: 'Kiểm tra quyền hạn với kill -0',
        description: 'Đã kiểm tra quyền hạn gửi tín hiệu bằng kill -0',
        points: 35,
        hint: 'Chạy: kill -0 $(pgrep sleep)',
      },
      {
        id: 'k-3',
        title: 'Gửi tín hiệu kết thúc có trật tự với kill',
        description: 'Đã gửi tín hiệu kết thúc TERM tới tiến trình',
        points: 35,
        hint: 'Chạy: kill -TERM $(pgrep sleep) hoặc kill $(pgrep sleep)',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('sleep') && h.includes('&'));
      const p2 = hist.some((h) => h.includes('kill -0'));
      const p3 = hist.some(
        (h) =>
          h.includes('kill -term') ||
          h.includes('kill -15') ||
          (h.startsWith('kill ') && !h.includes('-l') && !h.includes('-0'))
      );
      return [
        {
          id: 'k-1',
          title: 'Khởi chạy tiến trình nền sleep',
          passed: p1,
          pointsEarned: p1 ? 30 : 0,
          maxPoints: 30,
          message: p1 ? 'Đã khởi chạy sleep trong nền.' : 'Chưa chạy sleep 600 &.',
          hint: 'Chạy: sleep 600 &',
        },
        {
          id: 'k-2',
          title: 'Kiểm tra quyền hạn với kill -0',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã kiểm tra quyền hạn với kill -0.' : 'Chưa chạy kill -0 <PID>.',
          hint: 'Chạy: kill -0 $(pgrep sleep)',
        },
        {
          id: 'k-3',
          title: 'Gửi tín hiệu kết thúc có trật tự với kill',
          passed: p3,
          pointsEarned: p3 ? 35 : 0,
          maxPoints: 35,
          message: p3 ? 'Đã gửi tín hiệu dừng tiến trình thành công.' : 'Chưa gửi tín hiệu kết thúc kill.',
          hint: 'Chạy: kill -TERM $(pgrep sleep)',
        },
      ];
    },
  },

  // 608. process-niceness
  {
    id: 608,
    slug: 'process-niceness',
    title: 'Niceness (Độ ưu tiên lập lịch tiến trình với nice & renice)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Điều chỉnh trọng số lập lịch CPU bằng nice khi khởi chạy và renice khi tiến trình đang chạy.',
    scenario: 'Niceness (-20 đến 19) quy định mức độ nhường nhịn CPU của tiến trình. Giá trị nice càng nhỏ thì tiến trình càng được ưu tiên nhận thời gian CPU. Dùng nice để khởi chạy và renice để điều chỉnh tiến trình sống.',
    tasks: [
      'Khởi chạy tiến trình sleep 300 với mức nice là 10 trong nền: nice -n 10 sleep 300 &.',
      'Kiểm tra cột NI của tiến trình vừa chạy bằng lệnh ps -o pid,ni,pri,cmd.',
      'Điều chỉnh lại độ ưu tiên của tiến trình lên mức 15 bằng lệnh renice -n 15 -p <PID>.',
    ],
    hints: [
      'Chạy nice -n 10 sleep 300 &.',
      'Chạy ps -o pid,ni,pri,cmd để xem cột NI có giá trị 10.',
      'Dùng pgrep sleep để lấy PID, sau đó chạy renice -n 15 -p <PID>.',
    ],
    usefulCommands: [
      'nice -n <VAL> <COMMAND> - Khởi chạy lệnh với nice value',
      'renice -n <VAL> -p <PID> - Thay đổi nice value của tiến trình đang chạy',
      'ps -o pid,ni,pri,cmd - Hiển thị cột nice và scheduler priority',
    ],
    checks: [
      {
        id: 'ni-1',
        title: 'Khởi chạy lệnh với nice -n',
        description: 'Đã khởi chạy tiến trình mới với nice điều chỉnh',
        points: 35,
        hint: 'Chạy: nice -n 10 sleep 300 &',
      },
      {
        id: 'ni-2',
        title: 'Kiểm tra cột NI với ps',
        description: 'Đã kiểm tra cột NI của tiến trình bằng ps',
        points: 30,
        hint: 'Chạy: ps -o pid,ni,pri,cmd',
      },
      {
        id: 'ni-3',
        title: 'Điều chỉnh niceness bằng renice',
        description: 'Đã thay đổi giá trị niceness của tiến trình đang chạy bằng renice',
        points: 35,
        hint: 'Chạy: renice -n 15 -p <PID>',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.startsWith('nice -n') || h.includes('nice -n'));
      const p2 = hist.some((h) => (h.includes('ni') && h.includes('ps')) || h.includes('ps -l'));
      const p3 = hist.some((h) => h.startsWith('renice') || h.includes('renice '));
      return [
        {
          id: 'ni-1',
          title: 'Khởi chạy lệnh với nice -n',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã khởi chạy tiến trình với nice tùy chỉnh.' : 'Chưa chạy nice -n.',
          hint: 'Chạy: nice -n 10 sleep 300 &',
        },
        {
          id: 'ni-2',
          title: 'Kiểm tra cột NI với ps',
          passed: p2,
          pointsEarned: p2 ? 30 : 0,
          maxPoints: 30,
          message: p2 ? 'Đã kiểm tra cột NI thành công.' : 'Chưa chạy ps để xem cột NI.',
          hint: 'Chạy: ps -o pid,ni,pri,cmd',
        },
        {
          id: 'ni-3',
          title: 'Điều chỉnh niceness bằng renice',
          passed: p3,
          pointsEarned: p3 ? 35 : 0,
          maxPoints: 35,
          message: p3 ? 'Đã điều chỉnh niceness bằng renice thành công.' : 'Chưa chạy renice.',
          hint: 'Chạy: renice -n 15 -p <PID>',
        },
      ];
    },
  },

  // 609. process-states
  {
    id: 609,
    slug: 'process-states',
    title: 'Process States (Các trạng thái của tiến trình)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Nhận diện và điều khiển các trạng thái tiến trình R, S, D, T, Z trong Linux.',
    scenario: 'Trạng thái tiến trình được hiển thị ở cột STAT của ps: R (đang chạy), S (ngủ có thể ngắt), D (ngủ không thể ngắt vì I/O), T (bị dừng), Z (zombie). Hãy thực hành theo dõi và điều khiển sự chuyển đổi trạng thái này.',
    tasks: [
      'Liệt kê trạng thái các tiến trình hiện có kèm cột STAT: ps -o pid,stat,cmd.',
      'Chạy tiến trình sleep 400 & và quan sát trạng thái S (Interruptible Sleep).',
      'Gửi tín hiệu SIGSTOP để đưa tiến trình vào trạng thái T (Stopped): kill -STOP <PID>, sau đó khôi phục lại bằng kill -CONT <PID>.',
    ],
    hints: [
      'Chạy ps -o pid,stat,cmd để quan sát các chữ cái trong cột STAT.',
      'Khởi chạy sleep 400 & rồi dùng ps kiểm tra cờ S.',
      'Chạy kill -STOP <PID>, kiểm tra thấy cờ T, rồi gửi kill -CONT <PID> để đánh thức.',
    ],
    usefulCommands: [
      'ps -o pid,stat,cmd - Hiển thị cột trạng thái STAT',
      'kill -STOP <PID> - Tạm dừng tiến trình (chuyển sang trạng thái T)',
      'kill -CONT <PID> - Khôi phục tiến trình đang dừng',
    ],
    checks: [
      {
        id: 'st-1',
        title: 'Xem cột STAT bằng ps',
        description: 'Đã chạy ps kèm cột STAT để xem trạng thái',
        points: 35,
        hint: 'Chạy: ps -o pid,stat,cmd',
      },
      {
        id: 'st-2',
        title: 'Khởi chạy tiến trình ngủ ở trạng thái S',
        description: 'Đã chạy sleep trong nền và quan sát trạng thái S',
        points: 30,
        hint: 'Chạy: sleep 400 &',
      },
      {
        id: 'st-3',
        title: 'Điều khiển dừng và tiếp tục với SIGSTOP / SIGCONT',
        description: 'Đã gửi tín hiệu STOP hoặc CONT để thay đổi trạng thái tiến trình',
        points: 35,
        hint: 'Chạy: kill -STOP <PID> && kill -CONT <PID>',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => (h.includes('stat') && h.includes('ps')) || h.includes('ps aux'));
      const p2 = hist.some((h) => h.includes('sleep') && h.includes('&'));
      const p3 = hist.some(
        (h) =>
          h.includes('kill -stop') ||
          h.includes('kill -cont') ||
          h.includes('kill -19') ||
          h.includes('kill -18')
      );
      return [
        {
          id: 'st-1',
          title: 'Xem cột STAT bằng ps',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã xem cột STAT thành công.' : 'Chưa chạy ps -o pid,stat,cmd.',
          hint: 'Chạy: ps -o pid,stat,cmd',
        },
        {
          id: 'st-2',
          title: 'Khởi chạy tiến trình ngủ ở trạng thái S',
          passed: p2,
          pointsEarned: p2 ? 30 : 0,
          maxPoints: 30,
          message: p2 ? 'Đã khởi chạy tiến trình ngủ.' : 'Chưa chạy sleep 400 &.',
          hint: 'Chạy: sleep 400 &',
        },
        {
          id: 'st-3',
          title: 'Điều khiển dừng và tiếp tục với SIGSTOP / SIGCONT',
          passed: p3,
          pointsEarned: p3 ? 35 : 0,
          maxPoints: 35,
          message: p3 ? 'Đã thao tác tín hiệu dừng và khôi phục thành công.' : 'Chưa gửi kill -STOP hoặc kill -CONT.',
          hint: 'Chạy: kill -STOP <PID>',
        },
      ];
    },
  },

  // 610. proc-filesystem
  {
    id: 610,
    slug: 'proc-filesystem',
    title: '/proc Filesystem (Hệ thống tệp ảo /proc)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '6 phút',
    summary: 'Khám phá hệ thống tệp ảo /proc để truy xuất thông tin tiến trình và tham số kernel theo thời gian thực.',
    scenario: 'Thư mục /proc là mount point của procfs - một hệ thống tệp ảo trong bộ nhớ RAM. Nhân Linux phơi bày thông tin của từng tiến trình qua /proc/[PID]/ và số liệu thống kê toàn hệ thống qua các tệp như /proc/cpuinfo, /proc/meminfo, /proc/uptime.',
    tasks: [
      'Liệt kê các thư mục tiến trình trong /proc bằng ls -d /proc/[0-9]* hoặc ls /proc.',
      'Đọc thông tin trạng thái của tiến trình PID 1 (systemd) bằng cat /proc/1/status.',
      'Đọc thông số thời gian hoạt động hệ thống qua cat /proc/uptime hoặc mức tải qua cat /proc/loadavg.',
    ],
    hints: [
      'Chạy ls -d /proc/[0-9]* | head -n 5 để xem các thư mục PID.',
      'Chạy cat /proc/1/status | head -n 10 để xem Name, State, Pid.',
      'Chạy cat /proc/uptime hoặc cat /proc/loadavg để xem thông số hạt nhân.',
    ],
    usefulCommands: [
      'cat /proc/1/status - Xem trạng thái chi tiết của PID 1',
      'cat /proc/1/cmdline - Xem dòng lệnh khởi chạy PID 1',
      'cat /proc/uptime - Xem thời gian máy chủ đã chạy',
      'cat /proc/loadavg - Xem tải trung bình 1, 5, 15 phút',
    ],
    checks: [
      {
        id: 'procfs-1',
        title: 'Khám phá thư mục /proc',
        description: 'Đã liệt kê các mục trong hệ thống tệp ảo /proc',
        points: 35,
        hint: 'Chạy: ls /proc hoặc ls -d /proc/[0-9]*',
      },
      {
        id: 'procfs-2',
        title: 'Đọc thông tin tiến trình qua /proc/1/status',
        description: 'Đã đọc tệp trạng thái hoặc cmdline của PID 1',
        points: 35,
        hint: 'Chạy: cat /proc/1/status',
      },
      {
        id: 'procfs-3',
        title: 'Đọc tệp thống kê hệ thống toàn cục',
        description: 'Đã đọc tệp /proc/uptime, /proc/loadavg hoặc /proc/meminfo',
        points: 30,
        hint: 'Chạy: cat /proc/uptime hoặc cat /proc/loadavg',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('/proc') && (h.startsWith('ls') || h.startsWith('findmnt')));
      const p2 = hist.some(
        (h) =>
          h.includes('/proc/1/status') ||
          h.includes('/proc/1/cmdline') ||
          h.includes('/proc/1/comm')
      );
      const p3 = hist.some(
        (h) =>
          h.includes('/proc/uptime') ||
          h.includes('/proc/loadavg') ||
          h.includes('/proc/meminfo') ||
          h.includes('/proc/cpuinfo')
      );
      return [
        {
          id: 'procfs-1',
          title: 'Khám phá thư mục /proc',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã khám phá thư mục /proc thành công.' : 'Chưa chạy ls /proc.',
          hint: 'Chạy: ls /proc',
        },
        {
          id: 'procfs-2',
          title: 'Đọc thông tin tiến trình qua /proc/1/status',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã đọc thông tin PID 1 từ procfs.' : 'Chưa đọc /proc/1/status.',
          hint: 'Chạy: cat /proc/1/status',
        },
        {
          id: 'procfs-3',
          title: 'Đọc tệp thống kê hệ thống toàn cục',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã đọc tệp số liệu hệ thống từ /proc.' : 'Chưa đọc /proc/uptime hoặc /proc/loadavg.',
          hint: 'Chạy: cat /proc/uptime',
        },
      ];
    },
  },

  // 611. job-control
  {
    id: 611,
    slug: 'job-control',
    title: 'Job Control (Quản lý tác vụ Shell jobs, bg, fg)',
    category: 'Processes',
    difficulty: 'Trung bình',
    estimatedTime: '7 phút',
    summary: 'Quản lý tác vụ chạy nền (&, jobs), tạm dừng (Ctrl-Z), tiếp tục (bg) và đưa lên tiền cảnh (fg).',
    scenario: 'Job Control cho phép bạn chạy nhiều tác vụ trong cùng một phiên shell. Bạn có thể đẩy tác vụ chạy ngầm với &, liệt kê danh sách tác vụ với jobs, đưa tác vụ trở lại màn hình với fg và điều khiển tác vụ bằng Job ID (%1).',
    tasks: [
      'Khởi chạy tác vụ nền với dấu &: sleep 500 &.',
      'Liệt kê danh sách các tác vụ của phiên shell hiện tại bằng lệnh jobs.',
      'Đưa tác vụ lên tiền cảnh bằng fg %1 (hoặc tiếp tục với bg, hoặc gửi tín hiệu dừng với kill %1).',
    ],
    hints: [
      'Chạy sleep 500 & để đưa lệnh vào bảng jobs.',
      'Chạy jobs để thấy số hiệu [1] và trạng thái Running.',
      'Chạy fg %1 hoặc kill %1 để tác động lên tác vụ.',
    ],
    usefulCommands: [
      'sleep 500 & - Khởi chạy tác vụ trong nền',
      'jobs - Liệt kê các tác vụ đang quản lý',
      'fg %1 - Đưa tác vụ số 1 lên tiền cảnh',
      'bg %1 - Tiếp tục chạy tác vụ số 1 trong nền',
      'kill %1 - Gửi tín hiệu dừng tới Job ID 1',
    ],
    checks: [
      {
        id: 'jc-1',
        title: 'Khởi chạy tác vụ nền với dấu &',
        description: 'Đã khởi chạy lệnh trong nền bằng ký tự &',
        points: 35,
        hint: 'Chạy: sleep 500 &',
      },
      {
        id: 'jc-2',
        title: 'Liệt kê tác vụ bằng lệnh jobs',
        description: 'Đã chạy lệnh jobs để kiểm tra danh sách tác vụ',
        points: 35,
        hint: 'Chạy: jobs',
      },
      {
        id: 'jc-3',
        title: 'Điều khiển tác vụ với fg, bg hoặc kill %1',
        description: 'Đã điều phối tác vụ bằng fg, bg hoặc gửi tín hiệu với %',
        points: 30,
        hint: 'Chạy: fg %1 hoặc kill %1',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('&'));
      const p2 = hist.some((h) => h === 'jobs' || h.startsWith('jobs '));
      const p3 = hist.some(
        (h) => h.startsWith('fg') || h.startsWith('bg') || h.includes('%1') || h.includes('%')
      );
      return [
        {
          id: 'jc-1',
          title: 'Khởi chạy tác vụ nền với dấu &',
          passed: p1,
          pointsEarned: p1 ? 35 : 0,
          maxPoints: 35,
          message: p1 ? 'Đã khởi chạy tác vụ nền với &.' : 'Chưa chạy sleep 500 &.',
          hint: 'Chạy: sleep 500 &',
        },
        {
          id: 'jc-2',
          title: 'Liệt kê tác vụ bằng lệnh jobs',
          passed: p2,
          pointsEarned: p2 ? 35 : 0,
          maxPoints: 35,
          message: p2 ? 'Đã liệt kê các tác vụ bằng jobs.' : 'Chưa chạy lệnh jobs.',
          hint: 'Chạy: jobs',
        },
        {
          id: 'jc-3',
          title: 'Điều khiển tác vụ với fg, bg hoặc kill %1',
          passed: p3,
          pointsEarned: p3 ? 30 : 0,
          maxPoints: 30,
          message: p3 ? 'Đã điều phối tác vụ shell thành công.' : 'Chưa dùng lệnh fg, bg hoặc kill %1.',
          hint: 'Chạy: fg %1 hoặc kill %1',
        },
      ];
    },
  },

  // 590864. CompTIA Linux+: Manage and Monitor Linux Processes
  {
    id: 590864,
    slug: 'comptia-manage-and-monitor-linux-processes-590864',
    title: 'Manage and Monitor Linux Processes (CompTIA Linux+ #590864)',
    category: 'Processes',
    difficulty: 'Cơ bản',
    estimatedTime: '30 phút',
    summary: 'Bài thực hành tổng hợp chuẩn CompTIA Linux+ và LabEx: &, jobs, ps, top, fg, bg, Ctrl-Z, renice và kill.',
    scenario: 'Trong môi trường quản trị Linux, việc làm chủ toàn diện vòng đời tiến trình là kỹ năng tối quan trọng. Bài thực hành này hướng dẫn bạn thực hiện đủ 6 tác vụ: chạy nền với &, quản lý với jobs, chụp snapshot với ps, theo dõi tài nguyên với top, điều khiển trạng thái với fg/bg/Ctrl-Z, điều chỉnh mức ưu tiên với renice và kết thúc tiến trình an toàn với kill.',
    tasks: [
      'Task 1: Khởi chạy lệnh `sleep 300 &` trong nền và kiểm tra trạng thái bằng `jobs`.',
      'Task 2: Chụp snapshot tiến trình với `ps`, lọc tiến trình `sleep` bằng `ps aux | grep sleep` và `ps -ef | grep sleep`.',
      'Task 3: Giám sát tài nguyên CPU/RAM theo thời gian thực bằng công cụ tương tác `top`.',
      'Task 4: Thực hành Job Control: đưa tác vụ lên tiền cảnh (`fg %1`), tạm dừng (`Ctrl-Z`), và tiếp tục chạy nền (`bg %1`).',
      'Task 5: Tra cứu cột `NI` bằng `ps -o pid,ni,cmd` và đổi giá trị nice lên 10 bằng lệnh `renice -n 10 -p 23885`.',
      'Task 6: Chấm dứt tiến trình an toàn bằng lệnh `kill %1` (hoặc `kill <PID>`) và xác nhận tiến trình đã bị hủy bằng `jobs`.',
    ],
    hints: [
      'Chạy: sleep 300 & && jobs',
      'Chạy: ps aux | grep sleep hoặc ps -ef | grep sleep',
      'Chạy: top (nhấn q để thoát)',
      'Chạy: fg %1 rồi bg %1 && jobs',
      'Chạy: ps -o pid,ni,cmd -p 23885 && renice -n 10 -p 23885',
      'Chạy: kill %1 && jobs',
    ],
    usefulCommands: [
      'sleep 300 & - Khởi chạy tác vụ nền giải phóng dấu nhắc lệnh',
      'jobs - Liệt kê các tác vụ nền trong phiên shell hiện tại',
      'ps aux | grep sleep - Lọc chi tiết tiến trình theo phong cách BSD',
      'ps -ef | grep sleep - Lọc tiến trình hiển thị PPID theo chuẩn POSIX',
      'top - Theo dõi tài nguyên CPU/RAM thời gian thực (phím M, P, q)',
      'fg %1 / bg %1 - Chuyển đổi trạng thái giữa Foreground và Background',
      'renice -n 10 -p <PID> - Điều chỉnh độ ưu tiên lập lịch CPU (Niceness)',
      'kill %1 - Gửi tín hiệu SIGTERM kết thúc tác vụ an toàn',
    ],
    checks: [
      {
        id: 'comptia-1',
        title: 'Khởi chạy tác vụ nền sleep với & và kiểm tra jobs',
        description: 'Đã chạy sleep 300 trong nền và dùng jobs kiểm tra',
        points: 15,
        hint: 'Chạy: sleep 300 & && jobs',
      },
      {
        id: 'comptia-2',
        title: 'Chụp snapshot tiến trình với ps kết hợp grep',
        description: 'Đã lọc thông tin tiến trình sleep bằng ps aux hoặc ps -ef',
        points: 20,
        hint: 'Chạy: ps aux | grep sleep',
      },
      {
        id: 'comptia-3',
        title: 'Giám sát hệ thống thời gian thực với top',
        description: 'Đã chạy tiện ích top để theo dõi tải CPU và RAM',
        points: 15,
        hint: 'Chạy: top',
      },
      {
        id: 'comptia-4',
        title: 'Thực hành điều khiển tác vụ Job Control (fg / bg)',
        description: 'Đã sử dụng lệnh fg hoặc bg để điều phối trạng thái tác vụ',
        points: 15,
        hint: 'Chạy: bg %1 hoặc fg %1',
      },
      {
        id: 'comptia-5',
        title: 'Điều chỉnh độ ưu tiên niceness với renice',
        description: 'Đã nâng giá trị nice lên 10 bằng lệnh renice',
        points: 20,
        hint: 'Chạy: renice -n 10 -p 23885',
      },
      {
        id: 'comptia-6',
        title: 'Chấm dứt tiến trình an toàn với kill',
        description: 'Đã kết thúc tiến trình sleep bằng kill %1 hoặc kill <PID>',
        points: 15,
        hint: 'Chạy: kill %1 && jobs',
      },
    ],
    setupState: (_kernel: CentOSKernel) => {},
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const hist = kernel.history.map((h) => h.trim().toLowerCase());
      const p1 = hist.some((h) => h.includes('sleep') && h.includes('&')) && hist.some((h) => h.includes('jobs'));
      const p2 = hist.some((h) => h.includes('ps') && h.includes('grep') && h.includes('sleep'));
      const p3 = hist.some((h) => h.startsWith('top') || h === 'top');
      const p4 = hist.some((h) => h.startsWith('bg') || h.startsWith('fg') || h.includes('%1'));
      const p5 = hist.some((h) => h.includes('renice') && (h.includes('10') || h.includes('-n')));
      const p6 = hist.some((h) => h.includes('kill') && (h.includes('%1') || h.includes('23885') || h.includes('sleep')));
      return [
        {
          id: 'comptia-1',
          title: 'Khởi chạy tác vụ nền sleep với & và kiểm tra jobs',
          passed: p1,
          pointsEarned: p1 ? 15 : 0,
          maxPoints: 15,
          message: p1 ? 'Đã khởi chạy tác vụ nền và kiểm tra jobs thành công.' : 'Chưa chạy sleep 300 & và jobs.',
          hint: 'Chạy: sleep 300 & && jobs',
        },
        {
          id: 'comptia-2',
          title: 'Chụp snapshot tiến trình với ps kết hợp grep',
          passed: p2,
          pointsEarned: p2 ? 20 : 0,
          maxPoints: 20,
          message: p2 ? 'Đã lọc tiến trình với ps aux | grep sleep.' : 'Chưa chạy ps aux | grep sleep.',
          hint: 'Chạy: ps aux | grep sleep',
        },
        {
          id: 'comptia-3',
          title: 'Giám sát hệ thống thời gian thực với top',
          passed: p3,
          pointsEarned: p3 ? 15 : 0,
          maxPoints: 15,
          message: p3 ? 'Đã mở màn hình theo dõi top.' : 'Chưa chạy lệnh top.',
          hint: 'Chạy: top',
        },
        {
          id: 'comptia-4',
          title: 'Thực hành điều khiển tác vụ Job Control (fg / bg)',
          passed: p4,
          pointsEarned: p4 ? 15 : 0,
          maxPoints: 15,
          message: p4 ? 'Đã thực hiện điều phối tác vụ với fg/bg.' : 'Chưa dùng fg %1 hoặc bg %1.',
          hint: 'Chạy: bg %1 hoặc fg %1',
        },
        {
          id: 'comptia-5',
          title: 'Điều chỉnh độ ưu tiên niceness với renice',
          passed: p5,
          pointsEarned: p5 ? 20 : 0,
          maxPoints: 20,
          message: p5 ? 'Đã điều chỉnh nice value bằng renice.' : 'Chưa chạy renice -n 10 -p 23885.',
          hint: 'Chạy: renice -n 10 -p 23885',
        },
        {
          id: 'comptia-6',
          title: 'Chấm dứt tiến trình an toàn với kill',
          passed: p6,
          pointsEarned: p6 ? 15 : 0,
          maxPoints: 15,
          message: p6 ? 'Đã gửi tín hiệu kết thúc tiến trình.' : 'Chưa chạy kill %1 hoặc kill <PID>.',
          hint: 'Chạy: kill %1 && jobs',
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

