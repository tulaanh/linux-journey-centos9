import type { LabCheckResult } from '../types/linux';
import { CentOSKernel } from './centosKernel';

export interface ChallengeTask {
  id: string;
  title: string;
  description: string;
  points: number;
  hint?: string;
}

export interface ChallengeDefinition {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  estimatedTime: string;
  xp: number;
  summary: string;
  scenario: string;
  objectives: {
    title: string;
    description: string;
  }[];
  tasks: ChallengeTask[];
  hints: string[];
  referenceCommands: string[];
  setupState: (kernel: CentOSKernel) => void;
  evaluate: (kernel: CentOSKernel) => LabCheckResult[];
}

export const LINUX_CHALLENGES: ChallengeDefinition[] = [
  // 0. File Permissions & Hidden Files (Easy)
  {
    id: 1000,
    slug: 'hidden-files-permissions',
    title: 'File Permissions & Hidden Files (Easy)',
    category: 'Permissions & Security',
    difficulty: 'Cơ bản',
    estimatedTime: '10 phút',
    xp: 100,
    summary: 'Tìm tệp chứa Flag nằm trong thư mục /home/guest và đọc nội dung của nó.',
    scenario: `Ở thư mục người dùng (/home/guest), tác giả thách thức nói rằng file chứa Flag nằm ngay trong thư mục này nhưng lệnh ls thông thường không nhìn thấy. Sau khi tìm được, bạn nhận ra file bị khóa quyền đọc.

Nhiệm vụ của bạn:
Tìm tệp chứa Flag trong thư mục /home/guest và hiển thị nội dung Flag bí mật.`,
    objectives: [
      {
        title: 'Tìm tệp chứa Flag',
        description: 'Xác định tệp chứa Flag trong thư mục /home/guest.',
      },
      {
        title: 'Mở quyền đọc cho tệp Flag',
        description: 'Cấp quyền đọc cho tệp chứa Flag để có thể xem nội dung.',
      },
      {
        title: 'Hiển thị nội dung Flag',
        description: 'Đọc và hiển thị chuỗi Flag bí mật.',
      },
    ],
    tasks: [
      {
        id: 'hidden-perm',
        title: 'Cấp quyền đọc cho tệp chứa Flag',
        description: 'Tệp chứa Flag trong /home/guest đã được cấp quyền đọc hợp lệ.',
        points: 50,
        hint: 'Sử dụng lệnh: chmod +r /home/guest/.flag.txt (hoặc chmod 644 .flag.txt)',
      },
      {
        id: 'flag-read',
        title: 'Đọc nội dung chuỗi Flag bí mật',
        description: 'Đã thực thi lệnh đọc nội dung tệp chứa Flag thành công.',
        points: 50,
        hint: 'Sử dụng lệnh: cat /home/guest/.flag.txt',
      },
    ],
    hints: [
      'Liệt kê toàn bộ file (kể cả file ẩn): Trong Linux, các tệp bắt đầu bằng dấu chấm "." là tệp ẩn, lệnh "ls" thông thường không hiển thị. Hãy dùng "ls -a" hoặc "ls -la".',
      'Kiểm tra quyền sở hữu và phân quyền (Permissions) của file: Dùng lệnh "ls -l <file>" để kiểm tra. Nếu thấy "----------", file đang bị khóa quyền đọc.',
      'Cấp quyền đọc cho user hiện tại: Dùng lệnh "chmod +r <file>" (hoặc "chmod 644 <file>") để mở quyền đọc cho tệp.',
      'Đọc nội dung flag: Dùng lệnh "cat <file>" để hiển thị chuỗi Flag bí mật.',
    ],
    referenceCommands: [
      'cd /home/guest',
      'ls -la',
      'ls -l .flag.txt',
      'chmod +r .flag.txt',
      'cat .flag.txt',
    ],
    setupState: (kernel: CentOSKernel) => {
      // Ensure guest user and group exist
      if (!kernel.users.has('guest')) {
        kernel.users.set('guest', {
          uid: 1002,
          username: 'guest',
          gid: 1002,
          home: '/home/guest',
          shell: '/bin/bash',
        });
      }
      if (!kernel.groups.has('guest')) {
        kernel.groups.set('guest', {
          gid: 1002,
          name: 'guest',
          members: ['guest'],
        });
      }

      // Switch context to guest in /home/guest
      kernel.currentUser = 'guest';
      kernel.cwd = '/home/guest';
      kernel.env.USER = 'guest';
      kernel.env.HOME = '/home/guest';

      // Create /home/guest folder with proper ownership
      kernel.vfs.createDirectory('/home/guest');
      const guestDir = kernel.vfs.getNode('/home/guest');
      if (guestDir) {
        guestDir.owner = 'guest';
        guestDir.group = 'guest';
        guestDir.mode = 0o755;
      }

      // Create decoy files
      kernel.vfs.writeFile(
        '/home/guest/welcome.txt',
        '=== Chào mừng bạn đến với thử thách Linux ===\nFlag bí mật đang được giấu đâu đó ngay trong thư mục này.\nHãy dùng kỹ năng dòng lệnh của bạn để tìm ra nó!\n',
        { owner: 'guest', group: 'guest', mode: 0o644 }
      );
      kernel.vfs.writeFile(
        '/home/guest/hints.txt',
        'Gợi ý: Lệnh "ls" mặc định chỉ hiển thị các tệp thông thường.\nNhững tệp bắt đầu bằng dấu chấm "." được hệ thống coi là tệp ẩn!\n',
        { owner: 'guest', group: 'guest', mode: 0o644 }
      );

      // Create the hidden locked flag file
      const flagPath = '/home/guest/.flag.txt';
      kernel.vfs.writeFile(
        flagPath,
        'FLAG{h1dd3n_f1l3s_4nd_p3rm1ss10ns_m4st3r}\n',
        { owner: 'guest', group: 'guest', mode: 0o000 }
      );
      const flagNode = kernel.vfs.getNode(flagPath);
      if (flagNode) {
        flagNode.mode = 0o000; // Locked - no read/write/exec
        flagNode.owner = 'guest';
        flagNode.group = 'guest';
      }

      // Remove flag output if any from previous run
      if (kernel.vfs.exists('/home/guest/flag.txt')) {
        kernel.vfs.deleteNode('/home/guest/flag.txt');
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const flagNode = kernel.vfs.getNode('/home/guest/.flag.txt');
      const isFilePresent = flagNode !== null;

      // Check 1: Flag file has read permission for guest user
      const hasReadPermission = flagNode
        ? (flagNode.mode & 0o444) !== 0
        : false;

      // Check 2: User successfully read the flag
      const history = kernel.history.map((h) => h.trim().toLowerCase());
      const ranReadCmd = history.some(
        (h) =>
          (h.includes('cat') || h.includes('less') || h.includes('more') || h.includes('head') || h.includes('tail') || h.includes('grep')) &&
          (h.includes('.flag.txt') || h.includes('.flag'))
      );
      const flagExportContent = kernel.vfs.readFile('/home/guest/flag.txt') ?? '';
      const exportedFlag = flagExportContent.includes('FLAG{h1dd3n_f1l3s_4nd_p3rm1ss10ns_m4st3r}');

      const isFlagRead = (hasReadPermission && ranReadCmd) || exportedFlag;

      return [
        {
          id: 'hidden-perm',
          title: 'Cấp quyền đọc cho tệp ẩn .flag.txt',
          passed: hasReadPermission,
          pointsEarned: hasReadPermission ? 50 : 0,
          maxPoints: 50,
          message: hasReadPermission
            ? `Tệp ẩn .flag.txt đã được cấp quyền đọc thành công (mode: 0${(flagNode ? (flagNode.mode & 0o777) : 0).toString(8)}).`
            : isFilePresent
            ? `Tệp .flag.txt vẫn bị khóa quyền đọc (mode: 0${(flagNode ? (flagNode.mode & 0o777) : 0).toString(8)}). Hãy dùng chmod +r .flag.txt.`
            : 'Tệp /home/guest/.flag.txt không tồn tại!',
          hint: 'Chạy: chmod +r /home/guest/.flag.txt (hoặc chmod 644 .flag.txt)',
        },
        {
          id: 'flag-read',
          title: 'Đọc nội dung chuỗi Flag bí mật',
          passed: isFlagRead,
          pointsEarned: isFlagRead ? 50 : 0,
          maxPoints: 50,
          message: isFlagRead
            ? 'Chúc mừng! Bạn đã hiển thị thành công nội dung Flag: FLAG{h1dd3n_f1l3s_4nd_p3rm1ss10ns_m4st3r}'
            : 'Chưa đọc nội dung Flag. Sau khi mở quyền, hãy chạy lệnh cat .flag.txt để xem Flag.',
          hint: 'Chạy: cat /home/guest/.flag.txt',
        },
      ];
    },
  },

  // 1. Troubleshoot & Fix Broken File Permissions
  {
    id: 1001,
    slug: 'fix-broken-permissions',
    title: 'Khôi Phục Phân Quyền Bảo Mật Sau Sự Cố Chmod 777',
    category: 'Permissions & Security',
    difficulty: 'Cơ bản',
    estimatedTime: '15 phút',
    xp: 100,
    summary: 'Khắc phục sự cố phân quyền nguy hiểm sau khi một quản trị viên vô tình gán quyền 777 cho thư mục nhạy cảm.',
    scenario: `Hệ thống giám sát bảo mật vừa phát hiện cảnh báo nguy cấp: một quản trị viên đã chạy lệnh "chmod -R 777" lên toàn bộ ứng dụng tại "/var/www/secure_portal". 

Hiện tại, các tệp chứa thông tin nhạy cảm và cơ sở dữ liệu đều có thể bị bất kỳ người dùng nào trên máy đọc và sửa đổi trái phép. Bạn cần khôi phục lại quyền sở hữu và phân quyền bảo mật theo đúng chuẩn nguyên tắc đặc quyền tối thiểu (Principle of Least Privilege).`,
    objectives: [
      {
        title: 'Quyền sở hữu thư mục',
        description: 'Chuyển toàn bộ quyền sở hữu thư mục /var/www/secure_portal và các tệp bên trong về user "centos" và group "centos".',
      },
      {
        title: 'Phân quyền thư mục gốc',
        description: 'Đặt phân quyền cho thư mục /var/www/secure_portal thành 750 (rwxr-x---).',
      },
      {
        title: 'Bảo mật tệp biến môi trường',
        description: 'Đặt phân quyền cho tệp /var/www/secure_portal/config.env thành 600 (rw-------), chỉ chủ sở hữu mới có quyền đọc và ghi.',
      },
      {
        title: 'Phân quyền mã nguồn và tệp công khai',
        description: 'Đặt phân quyền cho tập lệnh /var/www/secure_portal/app.sh thành 750 (rwxr-x---) và tệp /var/www/secure_portal/index.html thành 644 (rw-r--r--).',
      },
    ],
    tasks: [
      {
        id: 'perm-chown',
        title: 'Khôi phục quyền sở hữu centos:centos',
        description: 'Tất cả các tệp trong /var/www/secure_portal phải thuộc sở hữu của user "centos" và group "centos".',
        points: 25,
        hint: 'Sử dụng lệnh: chown -R centos:centos /var/www/secure_portal',
      },
      {
        id: 'perm-dir',
        title: 'Phân quyền thư mục portal 750',
        description: 'Thư mục /var/www/secure_portal phải có phân quyền 750 (rwxr-x---).',
        points: 25,
        hint: 'Sử dụng lệnh: chmod 750 /var/www/secure_portal',
      },
      {
        id: 'perm-env',
        title: 'Bảo mật tệp config.env 600',
        description: 'Tệp /var/www/secure_portal/config.env phải có phân quyền 600 (rw-------).',
        points: 25,
        hint: 'Sử dụng lệnh: chmod 600 /var/www/secure_portal/config.env',
      },
      {
        id: 'perm-files',
        title: 'Phân quyền app.sh (750) và index.html (644)',
        description: 'Tệp app.sh có quyền 750 và index.html có quyền 644.',
        points: 25,
        hint: 'Sử dụng lệnh: chmod 750 /var/www/secure_portal/app.sh && chmod 644 /var/www/secure_portal/index.html',
      },
    ],
    hints: [
      'Để đổi chủ sở hữu và nhóm sở hữu đệ quy, hãy sử dụng: chown -R centos:centos /var/www/secure_portal',
      'Để đổi quyền số (octal mode), hãy dùng lệnh chmod kèm chỉ số 3 chữ số: chmod 750 <path>',
      'Quyền 600 tương ứng: Chủ sở hữu Đọc + Ghi (4+2=6), Nhóm 0, Người khác 0.',
      'Sau khi sửa, bạn có thể kiểm tra lại bằng lệnh: ls -la /var/www/secure_portal',
    ],
    referenceCommands: [
      'chown -R centos:centos /var/www/secure_portal',
      'chmod 750 /var/www/secure_portal',
      'chmod 600 /var/www/secure_portal/config.env',
      'chmod 750 /var/www/secure_portal/app.sh',
      'chmod 644 /var/www/secure_portal/index.html',
      'ls -la /var/www/secure_portal',
    ],
    setupState: (kernel: CentOSKernel) => {
      // Create broken directory structure with 777 permissions
      kernel.vfs.createDirectory('/var/www/secure_portal');
      const dirNode = kernel.vfs.getNode('/var/www/secure_portal');
      if (dirNode) {
        dirNode.mode = 0o777;
        dirNode.owner = 'root';
        dirNode.group = 'root';
      }

      kernel.vfs.writeFile(
        '/var/www/secure_portal/config.env',
        'DB_HOST=10.0.0.5\nDB_USER=prod_admin\nDB_PASS=SuperSecretKey9981!\nAPI_SECRET=jwt_token_secret_xyz\n'
      );
      const envNode = kernel.vfs.getNode('/var/www/secure_portal/config.env');
      if (envNode) {
        envNode.mode = 0o777;
        envNode.owner = 'root';
        envNode.group = 'root';
      }

      kernel.vfs.writeFile(
        '/var/www/secure_portal/app.sh',
        '#!/bin/bash\necho "Portal starting on port 8080..."\npython3 -m http.server 8080\n'
      );
      const appNode = kernel.vfs.getNode('/var/www/secure_portal/app.sh');
      if (appNode) {
        appNode.mode = 0o777;
        appNode.owner = 'root';
        appNode.group = 'root';
      }

      kernel.vfs.writeFile(
        '/var/www/secure_portal/index.html',
        '<!DOCTYPE html><html><body><h1>Internal Portal</h1><p>Secured Area</p></body></html>\n'
      );
      const htmlNode = kernel.vfs.getNode('/var/www/secure_portal/index.html');
      if (htmlNode) {
        htmlNode.mode = 0o777;
        htmlNode.owner = 'root';
        htmlNode.group = 'root';
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const dir = kernel.vfs.getNode('/var/www/secure_portal');
      const env = kernel.vfs.getNode('/var/www/secure_portal/config.env');
      const app = kernel.vfs.getNode('/var/www/secure_portal/app.sh');
      const html = kernel.vfs.getNode('/var/www/secure_portal/index.html');

      // Check 1: Ownership centos:centos
      const isOwnerCorrect =
        dir?.owner === 'centos' &&
        dir?.group === 'centos' &&
        env?.owner === 'centos' &&
        env?.group === 'centos' &&
        app?.owner === 'centos' &&
        app?.group === 'centos' &&
        html?.owner === 'centos' &&
        html?.group === 'centos';

      // Check 2: Directory mode 750
      const isDirModeCorrect = dir ? (dir.mode & 0o777) === 0o750 : false;

      // Check 3: config.env mode 600
      const isEnvModeCorrect = env ? (env.mode & 0o777) === 0o600 : false;

      // Check 4: app.sh mode 750 and index.html mode 644
      const isFilesModeCorrect =
        (app ? (app.mode & 0o777) === 0o750 : false) &&
        (html ? (html.mode & 0o777) === 0o644 : false);

      return [
        {
          id: 'perm-chown',
          title: 'Khôi phục quyền sở hữu centos:centos',
          passed: isOwnerCorrect,
          pointsEarned: isOwnerCorrect ? 25 : 0,
          maxPoints: 25,
          message: isOwnerCorrect
            ? 'Đã chuyển quyền sở hữu toàn bộ thư mục về centos:centos chính xác.'
            : 'Các tệp hoặc thư mục vẫn chưa thuộc sở hữu đầy đủ của centos:centos.',
          hint: 'Chạy: chown -R centos:centos /var/www/secure_portal',
        },
        {
          id: 'perm-dir',
          title: 'Phân quyền thư mục portal 750',
          passed: isDirModeCorrect,
          pointsEarned: isDirModeCorrect ? 25 : 0,
          maxPoints: 25,
          message: isDirModeCorrect
            ? 'Thư mục /var/www/secure_portal đã có phân quyền 750 chuẩn an toàn.'
            : `Thư mục hiện có quyền 0${(dir?.mode ?? 0 & 0o777).toString(8)}, cần là 750.`,
          hint: 'Chạy: chmod 750 /var/www/secure_portal',
        },
        {
          id: 'perm-env',
          title: 'Bảo mật tệp config.env 600',
          passed: isEnvModeCorrect,
          pointsEarned: isEnvModeCorrect ? 25 : 0,
          maxPoints: 25,
          message: isEnvModeCorrect
            ? 'Tệp config.env đã được khóa quyền 600 an toàn.'
            : `Tệp config.env hiện có quyền 0${(env?.mode ?? 0 & 0o777).toString(8)}, cần là 600.`,
          hint: 'Chạy: chmod 600 /var/www/secure_portal/config.env',
        },
        {
          id: 'perm-files',
          title: 'Phân quyền app.sh (750) và index.html (644)',
          passed: isFilesModeCorrect,
          pointsEarned: isFilesModeCorrect ? 25 : 0,
          maxPoints: 25,
          message: isFilesModeCorrect
            ? 'Tệp app.sh (750) và index.html (644) đã được phân quyền đúng quy định.'
            : 'Kiểm tra lại quyền app.sh (cần 750) hoặc index.html (cần 644).',
          hint: 'Chạy: chmod 750 /var/www/secure_portal/app.sh && chmod 644 /var/www/secure_portal/index.html',
        },
      ];
    },
  },

  // 2. Incident Response: Audit & Filter Nginx Access Logs
  {
    id: 1002,
    slug: 'audit-nginx-access-logs',
    title: 'Phân Tích & Truy Vết Nhật Ký Web Server Nginx',
    category: 'Text Processing & Streams',
    difficulty: 'Trung bình',
    estimatedTime: '20 phút',
    xp: 150,
    summary: 'Sử dụng các công cụ dòng lệnh xử lý văn bản (grep, cut/awk, sort, uniq, redirection) để phát hiện và báo cáo các địa chỉ IP tấn công.',
    scenario: `Máy chủ Nginx ghi nhận lưu lượng bất thường. Đội ngũ an ninh nghi ngờ có kẻ tấn công đang thực hiện quét cổng và gửi các truy vấn độc hại gây ra các mã phản hồi lỗi HTTP 403 (Forbidden) hoặc 500 (Internal Server Error).

Nhiệm vụ của bạn là phân tích tệp nhật ký tại "/var/log/nginx/access.log", trích xuất các địa chỉ IP vi phạm, lập danh sách độc nhất (unique) và đếm tổng số sự cố để phục vụ báo cáo.`,
    objectives: [
      {
        title: 'Trích xuất địa chỉ IP lỗi',
        description: 'Lọc ra tất cả các dòng nhật ký có chứa mã trạng thái "403" hoặc "500", lấy trường địa chỉ IP ở đầu mỗi dòng.',
      },
      {
        title: 'Tạo danh sách IP vi phạm duy nhất',
        description: 'Sắp xếp và loại bỏ các IP trùng lặp, ghi danh sách kết quả vào tệp "/home/centos/malicious_ips.txt".',
      },
      {
        title: 'Đếm tổng số dòng sự cố',
        description: 'Đếm tổng số lượt truy vấn gặp lỗi 403 hoặc 500 và ghi số lượng này vào tệp "/home/centos/error_count.txt".',
      },
    ],
    tasks: [
      {
        id: 'log-ips',
        title: 'Danh sách IP độc nhất malicious_ips.txt',
        description: 'Tệp /home/centos/malicious_ips.txt chứa đúng danh sách các IP gây lỗi 403/500 đã được sắp xếp.',
        points: 50,
        hint: 'Dùng grep lọc " 403 " hoặc " 500 ", lấy cột 1 (IP), sắp xếp sort -u rồi chuyển hướng > /home/centos/malicious_ips.txt',
      },
      {
        id: 'log-count',
        title: 'Tổng số lượt truy cập lỗi error_count.txt',
        description: 'Tệp /home/centos/error_count.txt chứa số lượng bản ghi lỗi chính xác.',
        points: 50,
        hint: 'Dùng grep kết hợp wc -l rồi chuyển hướng vào file: grep -E " (403|500) " /var/log/nginx/access.log | wc -l > /home/centos/error_count.txt',
      },
    ],
    hints: [
      'Định dạng log Nginx chuẩn: <IP> - - [<Date>] "<Request>" <StatusCode> <Bytes>',
      'Để tìm dòng có mã 403 hoặc 500: grep -E " (403|500) " /var/log/nginx/access.log',
      'Để lấy cột đầu tiên (IP): awk \'{print $1}\' hoặc cut -d\' \' -f1',
      'Để lọc các IP duy nhất: sort | uniq (hoặc sort -u)',
      'Để lưu ra file: > /home/centos/malicious_ips.txt',
    ],
    referenceCommands: [
      'grep -E " (403|500) " /var/log/nginx/access.log | awk \'{print $1}\' | sort -u > /home/centos/malicious_ips.txt',
      'grep -E " (403|500) " /var/log/nginx/access.log | wc -l > /home/centos/error_count.txt',
      'cat /home/centos/malicious_ips.txt',
      'cat /home/centos/error_count.txt',
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.createDirectory('/var/log/nginx');
      const logContent = [
        '192.168.1.10 - - [04/Oct/2026:14:00:01 +0700] "GET /index.html HTTP/1.1" 200 1024',
        '203.0.113.45 - - [04/Oct/2026:14:00:05 +0700] "GET /admin.php HTTP/1.1" 403 234',
        '192.168.1.12 - - [04/Oct/2026:14:00:10 +0700] "GET /static/logo.png HTTP/1.1" 200 4520',
        '198.51.100.99 - - [04/Oct/2026:14:00:15 +0700] "POST /api/v1/login HTTP/1.1" 500 89',
        '203.0.113.45 - - [04/Oct/2026:14:00:20 +0700] "GET /.env HTTP/1.1" 403 234',
        '192.168.1.15 - - [04/Oct/2026:14:00:22 +0700] "GET /dashboard HTTP/1.1" 200 3210',
        '198.51.100.99 - - [04/Oct/2026:14:00:25 +0700] "POST /api/v1/auth HTTP/1.1" 500 89',
        '192.0.2.77 - - [04/Oct/2026:14:00:30 +0700] "GET /etc/passwd HTTP/1.1" 403 234',
        '192.168.1.10 - - [04/Oct/2026:14:00:35 +0700] "GET /profile HTTP/1.1" 200 2150',
        '203.0.113.45 - - [04/Oct/2026:14:00:40 +0700] "GET /wp-config.php HTTP/1.1" 403 234',
        '198.51.100.99 - - [04/Oct/2026:14:00:45 +0700] "GET /api/v1/crash HTTP/1.1" 500 120',
      ].join('\n') + '\n';

      kernel.vfs.writeFile('/var/log/nginx/access.log', logContent);

      // Clean target files if exist
      if (kernel.vfs.exists('/home/centos/malicious_ips.txt')) {
        kernel.vfs.deleteNode('/home/centos/malicious_ips.txt');
      }
      if (kernel.vfs.exists('/home/centos/error_count.txt')) {
        kernel.vfs.deleteNode('/home/centos/error_count.txt');
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const expectedIps = ['192.0.2.77', '198.51.100.99', '203.0.113.45'];
      const ipsContent = kernel.vfs.readFile('/home/centos/malicious_ips.txt') ?? '';
      const actualIps = ipsContent
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .sort();

      const ipsMatch =
        actualIps.length === expectedIps.length &&
        expectedIps.every((ip) => actualIps.includes(ip));

      const countContent = kernel.vfs.readFile('/home/centos/error_count.txt') ?? '';
      const countNum = parseInt(countContent.trim(), 10);
      const isCountCorrect = countNum === 6;

      return [
        {
          id: 'log-ips',
          title: 'Danh sách IP độc nhất malicious_ips.txt',
          passed: ipsMatch,
          pointsEarned: ipsMatch ? 50 : 0,
          maxPoints: 50,
          message: ipsMatch
            ? 'Đã trích xuất và lọc danh sách IP vi phạm duy nhất thành công (192.0.2.77, 198.51.100.99, 203.0.113.45).'
            : `Danh sách IP chưa chính xác. Kỳ vọng 3 IP độc nhất (192.0.2.77, 198.51.100.99, 203.0.113.45), hiện có: [${actualIps.join(', ')}].`,
          hint: 'Gợi ý: grep -E " (403|500) " /var/log/nginx/access.log | awk \'{print $1}\' | sort -u > /home/centos/malicious_ips.txt',
        },
        {
          id: 'log-count',
          title: 'Tổng số lượt truy cập lỗi error_count.txt',
          passed: isCountCorrect,
          pointsEarned: isCountCorrect ? 50 : 0,
          maxPoints: 50,
          message: isCountCorrect
            ? 'Số lượng bản ghi lỗi (6 bản ghi) hoàn toàn trùng khớp.'
            : `Số lượng lỗi ghi nhận là "${countContent.trim()}", kỳ vọng chính xác là 6.`,
          hint: 'Gợi ý: grep -E " (403|500) " /var/log/nginx/access.log | wc -l > /home/centos/error_count.txt',
        },
      ];
    },
  },

  // 3. Emergency Disk & Process Triage
  {
    id: 1003,
    slug: 'disk-and-process-triage',
    title: 'Xử Lý Khẩn Cấp: Tiêu Diệt Tiến Trình Lạ & Dọn Dẹp Đĩa',
    category: 'Process & Storage Triage',
    difficulty: 'Trung bình',
    estimatedTime: '20 phút',
    xp: 150,
    summary: 'Nhận diện và chấm dứt tiến trình đào coin giả mạo đang ngốn CPU, dọn sạch các tệp kết xuất bộ nhớ (core dump) chiếm dụng phân vùng /tmp.',
    scenario: `Hệ thống giám sát Nagios vừa kích hoạt còi báo động:
1. Có một tiến trình bí ẩn mang tên "xmrig_miner" đang chiếm dụng 99% CPU dưới quyền tài khoản "nobody".
2. Thư mục "/tmp/cache" bị ngập tràn bởi các tệp tạm đuôi ".dump" làm cạn kiệt dung lượng đĩa.

Nhiệm vụ của bạn: Dò tìm PID của tiến trình độc hại và tiêu diệt nó bằng tín hiệu SIGKILL (-9). Xóa sạch toàn bộ các tệp đuôi ".dump" trong "/tmp/cache" (giữ lại các tệp cấu hình hợp lệ khác). Sau đó tạo tệp báo cáo hoàn thành.`,
    objectives: [
      {
        title: 'Tiêu diệt tiến trình độc hại',
        description: 'Tìm kiếm tiến trình "xmrig_miner" bằng lệnh "ps aux" hoặc "pgrep" và chấm dứt nó bằng lệnh "kill".',
      },
      {
        title: 'Dọn dẹp tệp rác .dump',
        description: 'Xóa toàn bộ các tệp có đuôi mở rộng ".dump" trong thư mục "/tmp/cache". Lưu ý KHÔNG xóa tệp "cache_manifest.json".',
      },
      {
        title: 'Tạo tệp xác nhận sự cố',
        description: 'Tạo tệp "/home/centos/incident_status.txt" với nội dung "RESOLVED" để báo cáo sự cố đã được khắc phục hoàn toàn.',
      },
    ],
    tasks: [
      {
        id: 'proc-kill',
        title: 'Tiến trình xmrig_miner đã bị chấm dứt',
        description: 'Tiến trình độc hại xmrig_miner không còn tồn tại trong danh sách tiến trình của hệ thống.',
        points: 50,
        hint: 'Sử dụng lệnh: ps aux | grep xmrig để tìm PID, sau đó chạy: kill -9 <PID> (hoặc pkill xmrig_miner)',
      },
      {
        id: 'cleanup-dump',
        title: 'Dọn sạch các tệp .dump trong /tmp/cache',
        description: 'Tất cả tệp đuôi .dump đã bị xóa, tệp cache_manifest.json vẫn được giữ nguyên an toàn.',
        points: 25,
        hint: 'Sử dụng lệnh: rm -f /tmp/cache/*.dump',
      },
      {
        id: 'report-status',
        title: 'Tệp báo cáo incident_status.txt chứa RESOLVED',
        description: 'Tệp /home/centos/incident_status.txt tồn tại và chứa chính xác dòng chữ RESOLVED.',
        points: 25,
        hint: 'Sử dụng lệnh: echo "RESOLVED" > /home/centos/incident_status.txt',
      },
    ],
    hints: [
      'Xem danh sách tiến trình: ps aux hoặc ps -ef',
      'Để tìm tiến trình theo tên: ps aux | grep xmrig',
      'Để chấm dứt tiến trình theo PID: kill -9 <PID>',
      'Để xóa file theo mẫu wildcard: rm -f /tmp/cache/*.dump',
      'Kiểm tra thư mục sau khi xóa: ls -la /tmp/cache',
    ],
    referenceCommands: [
      'ps aux | grep xmrig',
      'pkill -9 xmrig_miner || kill -9 $(pgrep xmrig_miner)',
      'rm -f /tmp/cache/*.dump',
      'ls -la /tmp/cache',
      'echo "RESOLVED" > /home/centos/incident_status.txt',
    ],
    setupState: (kernel: CentOSKernel) => {
      // Add fake rogue process
      kernel.processes = kernel.processes.filter((p) => p.command !== 'xmrig_miner');
      kernel.processes.push({
        pid: 7482,
        ppid: 1,
        user: 'nobody',
        cpu: 99.2,
        mem: 14.8,
        vsz: 524288,
        rss: 124000,
        tty: '?',
        stat: 'R',
        start: '13:45',
        time: '42:15',
        command: 'xmrig_miner',
      });

      // Populate /tmp/cache
      kernel.vfs.createDirectory('/tmp/cache');
      kernel.vfs.writeFile('/tmp/cache/core_dump_01.dump', '0xDEADBEEF'.repeat(100));
      kernel.vfs.writeFile('/tmp/cache/core_dump_02.dump', '0xCAFEBABE'.repeat(100));
      kernel.vfs.writeFile('/tmp/cache/memory_trace.dump', '0xBAADF00D'.repeat(100));
      kernel.vfs.writeFile(
        '/tmp/cache/cache_manifest.json',
        '{"version": "1.0", "active_caches": []}\n'
      );

      if (kernel.vfs.exists('/home/centos/incident_status.txt')) {
        kernel.vfs.deleteNode('/home/centos/incident_status.txt');
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      // 1. Process killed
      const hasMiner = kernel.processes.some((p) =>
        p.command.toLowerCase().includes('xmrig')
      );

      // 2. Dump files removed, manifest retained
      const cacheNode = kernel.vfs.getNode('/tmp/cache');
      let dumpCount = 0;
      let manifestExists = false;

      if (cacheNode?.children) {
        for (const [name] of cacheNode.children) {
          if (name.endsWith('.dump')) {
            dumpCount++;
          }
          if (name === 'cache_manifest.json') {
            manifestExists = true;
          }
        }
      }
      const isCleanupDone = dumpCount === 0 && manifestExists;

      // 3. Status report
      const statusContent =
        kernel.vfs.readFile('/home/centos/incident_status.txt')?.trim() ?? '';
      const isReportValid = statusContent === 'RESOLVED';

      return [
        {
          id: 'proc-kill',
          title: 'Tiến trình xmrig_miner đã bị chấm dứt',
          passed: !hasMiner,
          pointsEarned: !hasMiner ? 50 : 0,
          maxPoints: 50,
          message: !hasMiner
            ? 'Tiến trình độc hại xmrig_miner đã bị chấm dứt hoàn toàn.'
            : 'Tiến trình xmrig_miner (PID 7482) vẫn đang chạy.',
          hint: 'Chạy: kill -9 7482 hoặc pkill xmrig_miner',
        },
        {
          id: 'cleanup-dump',
          title: 'Dọn sạch các tệp .dump trong /tmp/cache',
          passed: isCleanupDone,
          pointsEarned: isCleanupDone ? 25 : 0,
          maxPoints: 25,
          message: isCleanupDone
            ? 'Tất cả tệp .dump đã được xóa an toàn; tệp manifest được bảo vệ nguyên vẹn.'
            : dumpCount > 0
            ? `Vẫn còn ${dumpCount} tệp .dump chưa được dọn dẹp.`
            : 'Tệp cache_manifest.json bị xóa nhầm!',
          hint: 'Chạy: rm -f /tmp/cache/*.dump',
        },
        {
          id: 'report-status',
          title: 'Tệp báo cáo incident_status.txt chứa RESOLVED',
          passed: isReportValid,
          pointsEarned: isReportValid ? 25 : 0,
          maxPoints: 25,
          message: isReportValid
            ? 'Báo cáo sự cố incident_status.txt đã được tạo chính xác.'
            : 'Tệp /home/centos/incident_status.txt chưa tồn tại hoặc nội dung không phải "RESOLVED".',
          hint: 'Chạy: echo "RESOLVED" > /home/centos/incident_status.txt',
        },
      ];
    },
  },

  // 4. User & Group Provisioning for DevOps Team
  {
    id: 1004,
    slug: 'devops-team-provisioning',
    title: 'Khởi Tạo Phòng Ban & Phân Quyền Nhóm DevOps',
    category: 'User & Group Administration',
    difficulty: 'Cơ bản',
    estimatedTime: '15 phút',
    xp: 100,
    summary: 'Tạo tài khoản người dùng, thiết lập nhóm dùng chung devops và cấp quyền truy cập thư mục cộng tác dự án.',
    scenario: `Đội ngũ phát triển chào đón hai thành viên mới: "alex" và "sarah". Để tạo điều kiện làm việc cộng tác, bạn cần:
1. Tạo một nhóm người dùng mới mang tên "devops".
2. Tạo hai tài khoản người dùng "alex" và "sarah", đưa cả hai vào nhóm "devops" với shell mặc định là "/bin/bash".
3. Tạo thư mục làm việc chung tại "/srv/devops_project" và cấu hình quyền sao cho các thành viên trong nhóm "devops" có thể đọc và ghi, trong khi người dùng khác (others) không có quyền truy cập.`,
    objectives: [
      {
        title: 'Tạo nhóm devops',
        description: 'Tạo nhóm hệ thống mới có tên "devops" bằng lệnh groupadd.',
      },
      {
        title: 'Tạo tài khoản người dùng',
        description: 'Tạo 2 user "alex" và "sarah" có nhóm phụ là "devops" và shell "/bin/bash".',
      },
      {
        title: 'Thư mục cộng tác chung',
        description: 'Tạo thư mục /srv/devops_project, gán quyền sở hữu nhóm cho "devops" và phân quyền 770 (rwxrwx---).',
      },
    ],
    tasks: [
      {
        id: 'usr-group',
        title: 'Tạo nhóm devops với thành viên alex và sarah',
        description: 'Nhóm devops tồn tại và chứa cả hai người dùng alex và sarah.',
        points: 40,
        hint: 'groupadd devops && useradd -G devops alex && useradd -G devops sarah',
      },
      {
        id: 'usr-dir',
        title: 'Tạo thư mục /srv/devops_project thuộc nhóm devops',
        description: 'Thư mục /srv/devops_project tồn tại và thuộc nhóm devops.',
        points: 30,
        hint: 'mkdir -p /srv/devops_project && chown :devops /srv/devops_project',
      },
      {
        id: 'usr-perm',
        title: 'Phân quyền thư mục cộng tác 770',
        description: 'Thư mục /srv/devops_project có phân quyền 770 (rwxrwx---).',
        points: 30,
        hint: 'chmod 770 /srv/devops_project',
      },
    ],
    hints: [
      'Tạo nhóm mới: groupadd devops',
      'Tạo user kèm nhóm phụ: useradd -G devops -s /bin/bash alex',
      'Nếu user đã tồn tại, thêm vào nhóm: usermod -aG devops sarah',
      'Đổi nhóm sở hữu thư mục: chown :devops /srv/devops_project (hoặc chgrp devops /srv/devops_project)',
      'Phân quyền đọc/ghi/thực thi cho owner và group, cấm others: chmod 770 /srv/devops_project',
    ],
    referenceCommands: [
      'groupadd devops',
      'useradd -G devops -s /bin/bash alex',
      'useradd -G devops -s /bin/bash sarah',
      'mkdir -p /srv/devops_project',
      'chown :devops /srv/devops_project',
      'chmod 770 /srv/devops_project',
      'ls -ld /srv/devops_project',
    ],
    setupState: (kernel: CentOSKernel) => {
      // Reset users and groups
      kernel.groups.delete('devops');
      kernel.users.delete('alex');
      kernel.users.delete('sarah');
      if (kernel.vfs.exists('/srv/devops_project')) {
        kernel.vfs.deleteNode('/srv/devops_project');
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const group = kernel.groups.get('devops');
      const userAlex = kernel.users.get('alex');
      const userSarah = kernel.users.get('sarah');

      const isGroupValid =
        !!group &&
        (group.members.includes('alex') || userAlex !== undefined) &&
        (group.members.includes('sarah') || userSarah !== undefined);

      const dir = kernel.vfs.getNode('/srv/devops_project');
      const isDirValid = !!dir && dir.group === 'devops';
      const isPermValid = !!dir && (dir.mode & 0o777) === 0o770;

      return [
        {
          id: 'usr-group',
          title: 'Tạo nhóm devops với thành viên alex và sarah',
          passed: isGroupValid,
          pointsEarned: isGroupValid ? 40 : 0,
          maxPoints: 40,
          message: isGroupValid
            ? 'Nhóm devops và các thành viên alex, sarah đã được cấu hình thành công.'
            : 'Chưa tạo nhóm devops hoặc chưa thêm đủ alex và sarah vào nhóm.',
          hint: 'Chạy: groupadd devops && useradd -G devops alex && useradd -G devops sarah',
        },
        {
          id: 'usr-dir',
          title: 'Tạo thư mục /srv/devops_project thuộc nhóm devops',
          passed: isDirValid,
          pointsEarned: isDirValid ? 30 : 0,
          maxPoints: 30,
          message: isDirValid
            ? 'Thư mục /srv/devops_project thuộc nhóm sở hữu devops chính xác.'
            : 'Thư mục /srv/devops_project chưa được tạo hoặc chưa thuộc nhóm devops.',
          hint: 'Chạy: mkdir -p /srv/devops_project && chown :devops /srv/devops_project',
        },
        {
          id: 'usr-perm',
          title: 'Phân quyền thư mục cộng tác 770',
          passed: isPermValid,
          pointsEarned: isPermValid ? 30 : 0,
          maxPoints: 30,
          message: isPermValid
            ? 'Phân quyền 770 (rwxrwx---) đã được áp dụng an toàn cho thư mục dự án.'
            : `Quyền hiện tại là 0${(dir?.mode ?? 0 & 0o777).toString(8)}, cần là 770.`,
          hint: 'Chạy: chmod 770 /srv/devops_project',
        },
      ];
    },
  },

  // 5. Automated Backup Pipeline with Tee & Redirection
  {
    id: 1005,
    slug: 'automated-backup-pipeline',
    title: 'Xây Dựng Pipeline Sao Lưu Kèm Nhật Ký Bằng Tee & Redirection',
    category: 'I/O Streams & Backup',
    difficulty: 'Nâng cao',
    estimatedTime: '25 phút',
    xp: 200,
    summary: 'Thiết kế chuỗi lệnh thu thập danh sách cấu hình hệ thống, đồng thời ghi vào hai tệp sao lưu bằng lệnh tee, chuyển hướng mọi thông báo lỗi vào tệp log riêng biệt.',
    scenario: `Hệ thống yêu cầu quy trình sao lưu tệp kiểm kê cấu hình tự động:
1. Bạn cần thu thập danh sách tệp từ thư mục cấu hình "/etc".
2. Bất kỳ thông báo lỗi nào (stderr) phát sinh trong quá trình quét phải được chuyển hướng vào tệp nhật ký lỗi "/var/log/backup_err.log" bằng toán tử "2>".
3. Danh sách tệp thành công (stdout) phải được ghi đồng thời vào tệp "/backup/manifest.txt" và bản sao dự phòng "/backup/manifest.bak" thông qua lệnh "tee".
4. Cuối cùng, nối thêm (append) thông điệp xác thực "BACKUP_VERIFIED_OK" vào cuối tệp "/backup/manifest.txt" bằng toán tử ">>".`,
    objectives: [
      {
        title: 'Chuyển hướng luồng lỗi',
        description: 'Tạo tệp /var/log/backup_err.log bằng cách chuyển hướng luồng lỗi stderr (2>).',
      },
      {
        title: 'Sao lưu đồng thời qua tee',
        description: 'Sử dụng lệnh tee để tạo cả hai tệp /backup/manifest.txt và /backup/manifest.bak chứa danh sách cấu hình.',
      },
      {
        title: 'Nối dữ liệu xác thực (Append)',
        description: 'Sử dụng toán tử ">>" để nối dòng chữ "BACKUP_VERIFIED_OK" vào cuối tệp /backup/manifest.txt.',
      },
    ],
    tasks: [
      {
        id: 'bk-err',
        title: 'Tệp nhật ký lỗi backup_err.log',
        description: 'Tệp /var/log/backup_err.log tồn tại trên hệ thống.',
        points: 30,
        hint: 'ls /etc /nonexistent 2> /var/log/backup_err.log',
      },
      {
        id: 'bk-manifest',
        title: 'Cặp tệp manifest.txt và manifest.bak tạo bởi tee',
        description: 'Cả hai tệp /backup/manifest.txt và /backup/manifest.bak đều tồn tại và có nội dung tương đồng.',
        points: 40,
        hint: 'ls /etc | tee /backup/manifest.txt > /backup/manifest.bak (hoặc tee /backup/manifest.bak)',
      },
      {
        id: 'bk-append',
        title: 'Nối chuỗi BACKUP_VERIFIED_OK vào manifest.txt',
        description: 'Dòng cuối cùng của /backup/manifest.txt chứa chuỗi BACKUP_VERIFIED_OK.',
        points: 30,
        hint: 'echo "BACKUP_VERIFIED_OK" >> /backup/manifest.txt',
      },
    ],
    hints: [
      'Đảm bảo thư mục đích tồn tại: mkdir -p /backup /var/log',
      'Chuyển hướng stderr độc lập: cmd 2> /var/log/backup_err.log',
      'Ghi đồng thời ra stdout và tệp: cmd | tee /backup/manifest.txt > /backup/manifest.bak',
      'Toán tử ghi nối tiếp không ghi đè: echo "TEXT" >> /backup/manifest.txt',
      'Kiểm tra dòng cuối bằng lệnh: tail -n 1 /backup/manifest.txt',
    ],
    referenceCommands: [
      'mkdir -p /backup /var/log',
      'ls /etc 2> /var/log/backup_err.log | tee /backup/manifest.txt > /backup/manifest.bak',
      'echo "BACKUP_VERIFIED_OK" >> /backup/manifest.txt',
      'tail -n 2 /backup/manifest.txt',
      'cat /var/log/backup_err.log',
    ],
    setupState: (kernel: CentOSKernel) => {
      kernel.vfs.createDirectory('/backup');
      kernel.vfs.createDirectory('/var/log');
      if (kernel.vfs.exists('/backup/manifest.txt')) {
        kernel.vfs.deleteNode('/backup/manifest.txt');
      }
      if (kernel.vfs.exists('/backup/manifest.bak')) {
        kernel.vfs.deleteNode('/backup/manifest.bak');
      }
      if (kernel.vfs.exists('/var/log/backup_err.log')) {
        kernel.vfs.deleteNode('/var/log/backup_err.log');
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const errExists = kernel.vfs.exists('/var/log/backup_err.log');
      const manifest1 = kernel.vfs.readFile('/backup/manifest.txt') ?? '';
      const manifest2 = kernel.vfs.readFile('/backup/manifest.bak') ?? '';

      const isManifestsValid =
        manifest1.length > 0 &&
        manifest2.length > 0 &&
        (manifest1.includes('passwd') || manifest1.includes('shadow') || manifest1.includes('group') || manifest1.includes('hosts'));

      const isAppended = manifest1.trim().endsWith('BACKUP_VERIFIED_OK');

      return [
        {
          id: 'bk-err',
          title: 'Tệp nhật ký lỗi backup_err.log',
          passed: errExists,
          pointsEarned: errExists ? 30 : 0,
          maxPoints: 30,
          message: errExists
            ? 'Đã tạo tệp ghi nhận luồng lỗi /var/log/backup_err.log thành công.'
            : 'Tệp /var/log/backup_err.log chưa tồn tại.',
          hint: 'Chạy: ls /etc /nonexistent 2> /var/log/backup_err.log',
        },
        {
          id: 'bk-manifest',
          title: 'Cặp tệp manifest.txt và manifest.bak tạo bởi tee',
          passed: isManifestsValid,
          pointsEarned: isManifestsValid ? 40 : 0,
          maxPoints: 40,
          message: isManifestsValid
            ? 'Cả hai tệp sao lưu manifest.txt và manifest.bak đã được ghi nhận đầy đủ.'
            : 'Một trong hai tệp manifest chưa được tạo hoặc không có nội dung cấu hình.',
          hint: 'Chạy: ls /etc | tee /backup/manifest.txt > /backup/manifest.bak',
        },
        {
          id: 'bk-append',
          title: 'Nối chuỗi BACKUP_VERIFIED_OK vào manifest.txt',
          passed: isAppended,
          pointsEarned: isAppended ? 30 : 0,
          maxPoints: 30,
          message: isAppended
            ? 'Chuỗi xác thực BACKUP_VERIFIED_OK đã được nối vào cuối tệp chính xác.'
            : 'Dòng cuối của /backup/manifest.txt chưa chứa "BACKUP_VERIFIED_OK".',
          hint: 'Chạy: echo "BACKUP_VERIFIED_OK" >> /backup/manifest.txt',
        },
      ];
    },
  },

  // 6. Rescue Lost Credentials (Find, Grep & Permissions)
  {
    id: 1006,
    slug: 'rescue-lost-credentials',
    title: 'Cứu Hộ Khóa Bí Mật Thất Lạc Bằng Find & Grep',
    category: 'Search & Security',
    difficulty: 'Trung bình',
    estimatedTime: '20 phút',
    xp: 150,
    summary: 'Dò tìm khóa API Token nhạy cảm bị thất lạc trong thư mục ứng dụng sâu nhiều tầng, trích xuất và bảo mật tuyệt đối.',
    scenario: `Một nhà phát triển đã lưu tạm mã bí mật "API_SECRET_KEY" vào một tệp cấu hình cũ nằm sâu trong thư mục "/opt/legacy_data" nhưng đã quên mất tên tệp và vị trí chính xác.

Nhiệm vụ của bạn:
1. Sử dụng lệnh tìm kiếm ("grep -r" hoặc kết hợp "find") để quét toàn bộ thư mục "/opt/legacy_data", xác định dòng chứa chuỗi "API_SECRET_KEY=".
2. Trích xuất chính xác dòng chứa khóa đó và lưu vào tệp an toàn tại "/root/master_key.txt".
3. Khóa quyền tệp "/root/master_key.txt" về mức bảo mật nghiêm ngặt 400 (chỉ đọc cho người dùng root, cấm mọi quyền khác).`,
    objectives: [
      {
        title: 'Tìm kiếm chuỗi khóa bí mật',
        description: 'Quét đệ quy thư mục /opt/legacy_data để tìm tệp chứa chuỗi "API_SECRET_KEY=".',
      },
      {
        title: 'Trích xuất vào /root/master_key.txt',
        description: 'Lưu đúng dòng chứa API_SECRET_KEY vào tệp /root/master_key.txt.',
      },
      {
        title: 'Khóa phân quyền 400',
        description: 'Thiết lập phân quyền của /root/master_key.txt thành 400 (r--------).',
      },
    ],
    tasks: [
      {
        id: 'sec-extract',
        title: 'Trích xuất API_SECRET_KEY vào master_key.txt',
        description: 'Tệp /root/master_key.txt chứa chính xác chuỗi API_SECRET_KEY=sk_live_99812_centos_stream.',
        points: 60,
        hint: 'grep -rh "API_SECRET_KEY=" /opt/legacy_data > /root/master_key.txt',
      },
      {
        id: 'sec-mode',
        title: 'Bảo mật phân quyền 400 cho master_key.txt',
        description: 'Tệp /root/master_key.txt có phân quyền 400 (r--------).',
        points: 40,
        hint: 'chmod 400 /root/master_key.txt',
      },
    ],
    hints: [
      'Để tìm kiếm chuỗi trong tất cả các tệp đệ quy: grep -r "API_SECRET_KEY=" /opt/legacy_data',
      'Nếu không muốn in tên file ở đầu dòng: dùng cờ -h: grep -rh "API_SECRET_KEY=" /opt/legacy_data',
      'Chuyển hướng kết quả vào file đích: grep -rh "API_SECRET_KEY=" /opt/legacy_data > /root/master_key.txt',
      'Phân quyền chỉ đọc cho chủ sở hữu: chmod 400 /root/master_key.txt',
    ],
    referenceCommands: [
      'grep -rh "API_SECRET_KEY=" /opt/legacy_data > /root/master_key.txt',
      'chmod 400 /root/master_key.txt',
      'cat /root/master_key.txt',
      'ls -l /root/master_key.txt',
    ],
    setupState: (kernel: CentOSKernel) => {
      // Build deep folder hierarchy
      kernel.vfs.createDirectory('/opt/legacy_data');
      kernel.vfs.createDirectory('/opt/legacy_data/services');
      kernel.vfs.createDirectory('/opt/legacy_data/services/v1');
      kernel.vfs.createDirectory('/opt/legacy_data/services/v1/auth');
      kernel.vfs.createDirectory('/opt/legacy_data/services/v2');
      kernel.vfs.createDirectory('/opt/legacy_data/cache');

      kernel.vfs.writeFile(
        '/opt/legacy_data/services/v1/notes.txt',
        'Old notes about v1 architecture\n'
      );
      kernel.vfs.writeFile(
        '/opt/legacy_data/services/v1/auth/credentials_dump.env',
        '# Legacy API Config\nDEBUG=false\nAPI_SECRET_KEY=sk_live_99812_centos_stream\nSESSION_TIMEOUT=3600\n'
      );
      kernel.vfs.writeFile(
        '/opt/legacy_data/services/v2/app.conf',
        'PORT=8080\nHOST=localhost\n'
      );

      if (kernel.vfs.exists('/root/master_key.txt')) {
        kernel.vfs.deleteNode('/root/master_key.txt');
      }
    },
    evaluate: (kernel: CentOSKernel): LabCheckResult[] => {
      const keyFile = kernel.vfs.getNode('/root/master_key.txt');
      const content = kernel.vfs.readFile('/root/master_key.txt')?.trim() ?? '';

      const isContentValid =
        content.includes('API_SECRET_KEY=sk_live_99812_centos_stream');
      const isModeValid = keyFile ? (keyFile.mode & 0o777) === 0o400 : false;

      return [
        {
          id: 'sec-extract',
          title: 'Trích xuất API_SECRET_KEY vào master_key.txt',
          passed: isContentValid,
          pointsEarned: isContentValid ? 60 : 0,
          maxPoints: 60,
          message: isContentValid
            ? 'Đã tìm thấy và trích xuất đúng mã bí mật sk_live_99812_centos_stream.'
            : 'Tệp /root/master_key.txt chưa chứa đúng chuỗi API_SECRET_KEY hợp lệ.',
          hint: 'Chạy: grep -rh "API_SECRET_KEY=" /opt/legacy_data > /root/master_key.txt',
        },
        {
          id: 'sec-mode',
          title: 'Bảo mật phân quyền 400 cho master_key.txt',
          passed: isModeValid,
          pointsEarned: isModeValid ? 40 : 0,
          maxPoints: 40,
          message: isModeValid
            ? 'Tệp master_key.txt đã được khóa quyền 400 (chỉ đọc) an toàn tuyệt đối.'
            : `Quyền hiện tại là 0${(keyFile?.mode ?? 0 & 0o777).toString(8)}, cần là 400.`,
          hint: 'Chạy: chmod 400 /root/master_key.txt',
        },
      ];
    },
  },
];

// Helper to convert ChallengeDefinition to LabDefinition so LabWorkspace can run it seamlessly
export const challengeToLabDefinition = (c: ChallengeDefinition) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  category: c.category,
  difficulty: c.difficulty,
  estimatedTime: c.estimatedTime,
  summary: c.summary,
  scenario: c.scenario,
  tasks: c.tasks.map((t) => t.title),
  hints: c.hints,
  usefulCommands: c.referenceCommands,
  checks: c.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    points: t.points,
    hint: t.hint || '',
  })),
  setupState: c.setupState,
  evaluate: c.evaluate,
});
