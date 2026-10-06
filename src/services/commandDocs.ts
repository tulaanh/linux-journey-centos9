export interface CommandDoc {
  name: string;
  aliases: string[];
  group: string;
  synopsis: string;
  summary: string;
  options: string[];
  examples: string[];
  notes?: string;
}

const doc = (
  name: string,
  group: string,
  synopsis: string,
  summary: string,
  options: string[] = [],
  examples: string[] = [],
  notes?: string,
): CommandDoc => ({ name, aliases: [], group, synopsis, summary, options, examples, ...(notes ? { notes } : {}) });

export const COMMAND_DOCS: CommandDoc[] = [
  doc('pwd', 'Điều hướng và tệp', 'pwd [-L|-P|--logical|--physical|--help|--version]', 'In thư mục làm việc hiện tại.', ['-L, --logical: hiển thị đường dẫn logic (mặc định).', '-P, --physical: giải liên kết tượng trưng.', '--help, --version: in trợ giúp hoặc phiên bản mô phỏng.'], ['pwd', 'pwd -P']),
  doc('cd', 'Điều hướng và tệp', 'cd [-L|-P] [THƯ_MỤC|-|~]', 'Thay đổi thư mục làm việc; mặc định về HOME.', ['-L: giữ đường dẫn logic.', '-P: giải đường dẫn vật lý.', '-: quay lại OLDPWD và in đường dẫn mới.', '~: thư mục home của user hiện tại.'], ['cd /etc', 'cd ..', 'cd -']),
  doc('ls', 'Điều hướng và tệp', 'ls [-a] [-l] [-h] [ĐƯỜNG_DẪN...]', 'Liệt kê tệp và thư mục trong VFS.', ['-a: gồm tên bắt đầu bằng dấu chấm.', '-l: dạng chi tiết gồm mode, owner, group, size, mtime.', '-h: định dạng size dễ đọc khi dùng cùng -l.', '--all: dạng dài của -a.', '--color=auto: được bỏ qua để tương thích alias ll/la.'], ['ls -la /etc', 'ls -lh /var']),
  doc('mkdir', 'Điều hướng và tệp', 'mkdir [-p] [-m MODE] THƯ_MỤC...', 'Tạo một hoặc nhiều thư mục.', ['-p: tạo thư mục cha còn thiếu; không lỗi nếu thư mục đã có.', '-m MODE: đặt mode bát phân.'], ['mkdir -p /opt/app/log', 'mkdir -m 750 /srv/private']),
  doc('touch', 'Điều hướng và tệp', 'touch TỆP...', 'Tạo tệp rỗng nếu chưa tồn tại hoặc cập nhật mtime.', [], ['touch notes.txt', 'touch file1 file2']),
  doc('rm', 'Điều hướng và tệp', 'rm [-r|-R] [-f] TỆP...', 'Xóa tệp hoặc thư mục khỏi VFS.', ['-r, -R: xóa đệ quy thư mục.', '-f: bỏ qua mục không tồn tại.', 'Các flag ghép ngắn như -rf được nhận.'], ['rm old.txt', 'rm -rf /tmp/build']),
  doc('cp', 'Điều hướng và tệp', 'cp [-r|-R] NGUỒN ĐÍCH', 'Sao chép một tệp hoặc thư mục trong VFS.', ['-r, -R: cho phép sao chép thư mục đệ quy.'], ['cp config.ini config.bak', 'cp -r project /tmp/project-copy'], 'Bộ mô phỏng xử lý một nguồn mỗi lần; không triển khai prompt ghi đè -i.'),
  doc('mv', 'Điều hướng và tệp', 'mv NGUỒN ĐÍCH', 'Di chuyển hoặc đổi tên một mục trong VFS.', [], ['mv draft.txt final.txt', 'mv report.txt /tmp/']),
  doc('cat', 'Điều hướng và tệp', 'cat [-n] [TỆP...]', 'Nối nội dung tệp và in ra stdout; nếu không có tệp, đọc stdin.', ['-n: đánh số dòng đầu ra.', 'Dấu - không được xử lý như tên stdin riêng.'], ['cat /etc/os-release', 'cat -n /etc/passwd']),
  doc('less', 'Điều hướng và tệp', 'less TỆP', 'Hiển thị nội dung tệp theo kiểu pager mô phỏng.', [], ['less /var/log/messages'], 'Không có tương tác cuộn/pager thật.'),
  doc('ln', 'Điều hướng và tệp', 'ln [-s] [-f] ĐÍCH LIÊN_KẾT', 'Tạo liên kết tượng trưng hoặc bản sao mô phỏng cho hard link.', ['-s: tạo symbolic link.', '-f: gỡ liên kết đích đã tồn tại trước khi tạo.'], ['ln -s /var/log /tmp/log-link']),
  doc('realpath', 'Điều hướng và tệp', 'realpath ĐƯỜNG_DẪN...', 'In đường dẫn vật lý đã chuẩn hóa.', [], ['realpath /var/run']),
  doc('readlink', 'Điều hướng và tệp', 'readlink [-f|-e|-m] LIÊN_KẾT', 'Đọc đích symbolic link hoặc phân giải đường dẫn.', ['-f, -e, -m: in đường dẫn vật lý đã phân giải.'], ['readlink /var/run', 'readlink -f /var/run']),
  doc('file', 'Điều hướng và tệp', 'file TỆP...', 'Nhận diện loại tệp, thư mục hoặc symbolic link trong VFS.', [], ['file /etc/hosts', 'file /home/pete/projects/app.py']),
  doc('head', 'Điều hướng và tệp', 'head [-n SỐ] [TỆP]', 'In các dòng đầu tiên; mặc định 10 dòng.', ['-n SỐ: số dòng cần in.'], ['head -n 5 /var/log/messages']),
  doc('tail', 'Điều hướng và tệp', 'tail [-n SỐ] [TỆP]', 'In các dòng cuối cùng; mặc định 10 dòng.', ['-n SỐ: số dòng cần in.'], ['tail -n 20 /var/log/secure']),
  doc('find', 'Điều hướng và tệp', 'find [ĐƯỜNG_DẪN] [-name MẪU] [-type f|d]', 'Duyệt cây thư mục ảo và lọc theo tên hoặc loại.', ['-name MẪU: khớp tên với wildcard *.', '-type f: chỉ tệp.', '-type d: chỉ thư mục.'], ['find /etc -name "*.conf"', 'find /home -type d']),
  doc('tree', 'Điều hướng và tệp', 'tree [-a] [ĐƯỜNG_DẪN]', 'Hiển thị cây thư mục, giới hạn độ sâu mô phỏng.', ['-a: bao gồm tên ẩn.'], ['tree /etc']),
  doc('chmod', 'Quyền và tài khoản', 'chmod [-R] MODE TỆP...', 'Đổi quyền truy cập Unix cho các node VFS.', ['MODE: dạng bát phân (ví dụ 640) hoặc symbolic (u+rw,g-w,o=).', '-R: áp dụng đệ quy.'], ['chmod 640 secret.txt', 'chmod u+x script.sh']),
  doc('chown', 'Quyền và tài khoản', 'chown [-R] USER[:GROUP] TỆP...', 'Đổi owner và tùy chọn group của node VFS.', ['-R: áp dụng đệ quy.', 'USER:GROUP: đặt cả owner lẫn group.'], ['chown centos:centos /home/centos/file.txt', 'chown -R pete /srv/project']),
  doc('chgrp', 'Quyền và tài khoản', 'chgrp [-R] GROUP TỆP...', 'Đổi group sở hữu của node VFS.', ['-R: áp dụng đệ quy.'], ['chgrp wheel /opt/tool']),
  doc('useradd', 'Quyền và tài khoản', 'useradd [-m|-M] [-s SHELL] [-d HOME] [-g GROUP] [-G GROUPS] USER', 'Tạo user mô phỏng và tùy chọn home directory.', ['-m: tạo home (mặc định).', '-M: không tạo home.', '-s SHELL: đặt shell.', '-d HOME: đặt home.', '-g GROUP: chọn primary group nếu group tồn tại.', '-G GROUPS: danh sách supplementary group phân cách bằng dấu phẩy.'], ['useradd -m -G wheel alice']),
  doc('userdel', 'Quyền và tài khoản', 'userdel [-r] USER', 'Xóa user khỏi bản đồ tài khoản mô phỏng.', ['-r: xóa home directory.'], ['userdel -r alice'], 'Đồng bộ file cơ sở dữ liệu tài khoản chưa đầy đủ trong simulator.'),
  doc('groupadd', 'Quyền và tài khoản', 'groupadd GROUP', 'Tạo group mô phỏng với GID tự cấp.', [], ['groupadd developers']),
  doc('groupdel', 'Quyền và tài khoản', 'groupdel GROUP', 'Xóa group mô phỏng.', [], ['groupdel developers']),
  doc('usermod', 'Quyền và tài khoản', 'usermod [-aG GROUPS] [-g GROUP] [-s SHELL] USER', 'Thay đổi group, shell cho user mô phỏng.', ['-aG GROUPS: bổ sung supplementary groups phân cách dấu phẩy.', '-g GROUP: đặt primary group nếu tồn tại.', '-s SHELL: đổi login shell.'], ['usermod -aG wheel alice', 'usermod -s /bin/bash alice']),
  doc('passwd', 'Quyền và tài khoản', 'passwd [USER]', 'Mô phỏng cập nhật password token cho tài khoản.', [], ['passwd', 'passwd centos'], 'Không lưu hoặc xác thực mật khẩu thật.'),
  doc('id', 'Quyền và tài khoản', 'id [USER]', 'In UID, primary GID và các group của user.', [], ['id', 'id centos']),
  doc('whoami', 'Quyền và tài khoản', 'whoami', 'In tên user đang hoạt động trong terminal.', [], ['whoami']),
  doc('su', 'Quyền và tài khoản', 'su [-] [USER]', 'Chuyển user trong trạng thái kernel mô phỏng.', ['- hoặc không ghi USER: chuyển root.', 'USER: chuyển tới user được chỉ định.'], ['su centos', 'su -']),
  doc('sudo', 'Quyền và tài khoản', 'sudo LỆNH [ĐỐI_SỐ...]', 'Chạy một lệnh với currentUser tạm thời là root nếu user thuộc wheel.', [], ['sudo systemctl status sshd'], 'Không hỏi hoặc xác minh mật khẩu sudo.'),
  doc('systemctl', 'Dịch vụ và tiến trình', 'systemctl [start|stop|restart|enable|disable|status|is-active|is-enabled] SERVICE', 'Quản lý trạng thái dịch vụ systemd mô phỏng.', ['start, stop, restart: thay đổi active state.', 'enable, disable: thay đổi unit-file state.', 'status, is-active, is-enabled: truy vấn trạng thái.'], ['systemctl status sshd', 'systemctl enable nginx', 'systemctl start nginx'], 'Dịch vụ và PID là trạng thái mô phỏng.'),
  doc('service', 'Dịch vụ và tiến trình', 'service SERVICE ACTION', 'Cú pháp tương thích cũ, chuyển tiếp sang systemctl.', ['ACTION: các action mà systemctl handler hỗ trợ.'], ['service sshd status']),
  doc('ps', 'Dịch vụ và tiến trình', 'ps [aux|-ef]', 'In danh sách tiến trình mô phỏng.', ['aux hoặc -ef: dạng danh sách đầy đủ.', 'Không có option: dạng rút gọn.'], ['ps', 'ps aux']),
  doc('top', 'Dịch vụ và tiến trình', 'top', 'In snapshot giả lập tài nguyên và tiến trình.', [], ['top'], 'Không phải màn hình cập nhật tương tác.'),
  doc('kill', 'Dịch vụ và tiến trình', 'kill [SIGNAL] PID', 'Xóa PID khỏi danh sách tiến trình mô phỏng.', ['PID: handler dùng đối số không bắt đầu bằng dấu gạch ngang cuối cùng.'], ['kill 1234'], 'SIGNAL được bỏ qua; mọi kill thành công đều loại tiến trình khỏi danh sách.'),
  doc('pkill', 'Dịch vụ và tiến trình', 'pkill PATTERN', 'Xóa tiến trình có command chứa chuỗi PATTERN.', [], ['pkill nginx'], 'Không dùng regex và không xử lý signal.'),
  doc('crontab', 'Dịch vụ và tiến trình', 'crontab [-l|-r|-e|-] ', 'Đọc, xóa hoặc thay crontab của user hiện tại.', ['-l: liệt kê.', '-r: xóa.', '-e: in hướng dẫn chỉnh sửa mô phỏng.', '- với stdin: cài các dòng từ stdin.'], ['crontab -l', 'echo "0 2 * * * /opt/backup.sh" | crontab -']),
  doc('dnf', 'Gói phần mềm', 'dnf [install|remove|search|list|clean] [GÓI]', 'Quản lý catalog RPM/DNF giả lập của CentOS Stream 9.', ['install GÓI: đánh dấu gói cài và tạo file/service mô phỏng.', 'remove GÓI: đánh dấu gói chưa cài.', 'search TỪ_KHÓA: tìm tên hoặc summary.', 'list [MẪU]: liệt kê gói đã cài.', 'clean: in thông báo dọn metadata mô phỏng.'], ['dnf search nginx', 'dnf install nginx', 'dnf list'], 'yum dùng chung handler và catalog với dnf.'),
  doc('rpm', 'Gói phần mềm', 'rpm -qa | rpm -qi GÓI', 'Truy vấn thông tin gói RPM trong catalog mô phỏng.', ['-qa: liệt kê gói đã cài.', '-qi GÓI: hiện thông tin gói đã cài.'], ['rpm -qa', 'rpm -qi tree']),
  doc('hostnamectl', 'Mạng và hệ thống', 'hostnamectl [status|set-hostname HOST]', 'Xem hoặc đặt hostname trong trạng thái mô phỏng.', ['status: xem thông tin máy.', 'set-hostname HOST: đổi hostname và /etc/hostname.'], ['hostnamectl status', 'hostnamectl set-hostname lab01']),
  doc('hostname', 'Mạng và hệ thống', 'hostname [HOST]', 'In hoặc đặt hostname mô phỏng.', [], ['hostname', 'hostname web01']),
  doc('ip', 'Mạng và hệ thống', 'ip [addr|a|route|r]', 'In địa chỉ hoặc routing table mạng mô phỏng.', ['addr, a: địa chỉ interface.', 'route, r: bảng route.'], ['ip addr', 'ip route']),
  doc('ifconfig', 'Mạng và hệ thống', 'ifconfig', 'In thông tin interface mạng kiểu net-tools.', [], ['ifconfig']),
  doc('ping', 'Mạng và hệ thống', 'ping [HOST]', 'In kết quả ping mẫu tới host.', [], ['ping 192.168.1.1'], 'Không gửi ICMP packet thật; output là dữ liệu mô phỏng.'),
  doc('curl', 'Mạng và hệ thống', 'curl [-I|-s|-v] [-o FILE] URL', 'Mô phỏng tải hoặc xem nội dung URL; hỗ trợ web server local ảo.', ['-I, --head: chỉ in HTTP headers.', '-s, --silent: ẩn progress.', '-v, --verbose: thêm trace cho local response.', '-o FILE: lưu body vào VFS.'], ['curl http://localhost', 'curl -I http://localhost', 'curl -o page.html https://example.invalid'], 'Không thực hiện HTTP request ra mạng thật.'),
  doc('wget', 'Mạng và hệ thống', 'wget URL', 'Tạo file nội dung tải giả lập từ URL.', [], ['wget https://example.invalid/index.html'], 'Không tải dữ liệu từ Internet thật.'),
  doc('nmcli', 'Mạng và hệ thống', 'nmcli [general|connection|device] [status|show|up|down]', 'Hiển thị trạng thái NetworkManager mô phỏng.', ['g/general: trạng thái tổng quát.', 'c/connection/con: show, up, down.', 'd/device/dev: status hoặc show.'], ['nmcli general status', 'nmcli connection show', 'nmcli device status']),
  doc('journalctl', 'Mạng và hệ thống', 'journalctl [-u UNIT] [-n SỐ]', 'Đọc log hệ thống mô phỏng từ /var/log/messages.', ['-u UNIT: lọc theo tên unit.', '-n SỐ: giới hạn số dòng cuối.'], ['journalctl -u sshd', 'journalctl -n 10']),
  doc('firewall-cmd', 'Mạng và hệ thống', 'firewall-cmd [--state|--reload|--list-all|--add-service=SERVICE|--remove-service=SERVICE|--add-port=PORT/PROTO|--remove-port=PORT/PROTO]', 'Xem hoặc sửa tập rule firewalld mô phỏng.', ['--state: trạng thái firewalld.', '--reload: trả success.', '--list-all: hiển thị services/ports.', '--add/remove-service=NAME: sửa service.', '--add/remove-port=PORT/PROTO: sửa port.'], ['firewall-cmd --state', 'firewall-cmd --add-service=http', 'firewall-cmd --list-all']),
  doc('sestatus', 'Mạng và hệ thống', 'sestatus', 'Hiển thị trạng thái SELinux mô phỏng.', [], ['sestatus']),
  doc('getenforce', 'Mạng và hệ thống', 'getenforce', 'In chế độ SELinux hiện tại.', [], ['getenforce']),
  doc('setenforce', 'Mạng và hệ thống', 'setenforce [0|1|Permissive|Enforcing]', 'Chuyển SELinux giữa permissive và enforcing (root).', ['0, Permissive: chuyển permissive.', '1, Enforcing: chuyển enforcing.'], ['setenforce 0', 'setenforce Enforcing'], 'Không hỗ trợ thay đổi vĩnh viễn sang Disabled.'),
  doc('lscpu', 'Mạng và hệ thống', 'lscpu', 'In cấu hình CPU mẫu của máy ảo.', [], ['lscpu'], 'Dữ liệu phần cứng là fixture tĩnh.'),
  doc('lsblk', 'Mạng và hệ thống', 'lsblk', 'In sơ đồ block device mẫu.', [], ['lsblk'], 'Không phản ánh lưu trữ thật.'),
  doc('df', 'Mạng và hệ thống', 'df', 'In bảng dung lượng filesystem mẫu.', [], ['df'], 'Output là fixture tĩnh; option đầu vào hiện không làm thay đổi định dạng.'),
  doc('free', 'Mạng và hệ thống', 'free [-m]', 'In bộ nhớ và swap mẫu.', ['-m: hiển thị theo MiB.', 'Không có option: hiển thị theo KiB.'], ['free', 'free -m'], 'Không đọc bộ nhớ host thật.'),
  doc('uname', 'Mạng và hệ thống', 'uname [-a|-r]', 'In tên kernel hoặc thông tin kernel CentOS 9.', ['-a: dòng thông tin đầy đủ.', '-r: kernel release.'], ['uname', 'uname -r', 'uname -a']),
  doc('uptime', 'Mạng và hệ thống', 'uptime', 'In uptime và load average mẫu.', [], ['uptime'], 'Output là fixture tĩnh.'),
  doc('date', 'Mạng và hệ thống', 'date [+FORMAT]', 'In thời gian UTC hiện tại hoặc format phần trăm.', ['+FORMAT: hỗ trợ các định dạng phổ biến %Y %m %d %H %M %S %F %T %a %b %Z và một số mã POSIX.'], ['date', 'date +%F']),
  doc('netstat', 'Mạng và hệ thống', 'netstat', 'Liệt kê listening sockets dựa theo trạng thái service mô phỏng.', [], ['netstat -tulnp'], 'Các option bị bỏ qua; ss/netstat dùng chung output handler.'),
  doc('tar', 'Nén và lưu trữ', 'tar [-c|-x|-t] [-v] -f ARCHIVE [TỆP...]', 'Tạo, liệt kê hoặc giải nén archive JSON mô phỏng trong VFS.', ['-c: tạo archive.', '-x: giải nén.', '-t: liệt kê.', '-f ARCHIVE: đường dẫn archive.', '-v: in danh sách thành viên khi tạo/giải nén.'], ['tar -cvf backup.tar notes.txt', 'tar -tf backup.tar', 'tar -xvf backup.tar'], 'Định dạng archive là nội bộ simulator, không tương thích tar binary thật.'),
  doc('gzip', 'Nén và lưu trữ', 'gzip TỆP', 'Mô phỏng nén bằng cách chuyển nội dung sang tên .gz.', [], ['gzip report.txt'], 'Không tạo dữ liệu gzip binary thật.'),
  doc('gunzip', 'Nén và lưu trữ', 'gunzip TỆP.gz', 'Mô phỏng giải nén tệp .gz.', [], ['gunzip report.txt.gz'], 'Không giải mã gzip binary thật.'),
  doc('export', 'Shell và tiện ích', 'export [NAME=VALUE ...]', 'Đặt biến môi trường của shell mô phỏng.', ['NAME=VALUE: lưu biến trong môi trường kernel.', 'Không có đối số: in khai báo biến.'], ['export EDITOR=vim', 'export']),
  doc('env', 'Shell và tiện ích', 'env', 'In các biến môi trường shell hiện tại.', [], ['env']),
  doc('echo', 'Shell và tiện ích', 'echo [-n] [-e|-E] [TEXT...]', 'In các đối số đã ghép bằng dấu cách.', ['-n: flag được chấp nhận; newline do terminal renderer quản lý.', '-e: diễn giải một số escape sequence.', '-E: giữ escape nguyên dạng.'], ['echo Hello World', 'echo -e "one\\ntwo"']),
  doc('clear', 'Shell và tiện ích', 'clear', 'Xóa nội dung terminal bằng ANSI clear-screen sequence.', [], ['clear']),
  doc('history', 'Shell và tiện ích', 'history', 'In lịch sử các dòng lệnh đã chạy.', [], ['history']),
  doc('which', 'Shell và tiện ích', 'which COMMAND', 'Tìm tên executable trong một số thư mục bin chuẩn của VFS.', [], ['which ls'], 'Tra cứu dựa trên file có trong VFS; không thực thi PATH đầy đủ.'),
  doc('whereis', 'Shell và tiện ích', 'whereis COMMAND', 'In vị trí executable/man page theo mẫu.', [], ['whereis grep'], 'Đường dẫn kết quả là mẫu, không được dò filesystem thực.'),
  doc('alias', 'Shell và tiện ích', 'alias [NAME[=VALUE] ...]', 'In, xem hoặc đặt alias của shell.', [], ['alias', 'alias ll="ls -l"', 'alias ll']),
  doc('unalias', 'Shell và tiện ích', 'unalias [-a] NAME...', 'Xóa alias hoặc xóa toàn bộ alias.', ['-a: xóa mọi alias.'], ['unalias ll', 'unalias -a']),
  doc('man', 'Trợ giúp', 'man [SECTION] NAME...', 'Hiển thị trang manual cục bộ; nhận nhiều topic trong một lần gọi.', ['SECTION: số section tùy chọn, được bỏ qua trong lookup.', 'NAME...: command có trong registry.'], ['man ls', 'man 1 grep systemctl']),
  doc('help', 'Trợ giúp', 'help [COMMAND...]', 'In catalog theo nhóm hoặc hướng dẫn nhanh từng command.', [], ['help', 'help chmod']),
  doc('whatis', 'Trợ giúp', 'whatis NAME...', 'In mô tả một dòng cho từng command đã đăng ký.', [], ['whatis ls dnf']),
  doc('exit', 'Shell và tiện ích', 'exit', 'Thoát session shell hiện tại theo quy tắc terminal mô phỏng.', [], ['exit'], 'Mô phỏng chỉ chuyển user thường về root hoặc in thông báo logout khi root.'),
  doc('wc', 'Xử lý văn bản', 'wc [-l] [-w] [-c] [TỆP]', 'Đếm dòng, từ và byte của file hoặc stdin.', ['-l: đếm newline theo cách POSIX.', '-w: đếm từ.', '-c: đếm byte UTF-8.', 'Không option: in cả ba số.'], ['wc -l /etc/passwd', 'cat file.txt | wc -w']),
  doc('tee', 'Xử lý văn bản', 'tee [-a|--append] [TỆP...]', 'Ghi stdin ra stdout và đồng thời vào một hoặc nhiều tệp.', ['-a, --append: nối thêm thay vì ghi đè.'], ['ls /etc | tee listing.txt', 'echo ok | tee -a log.txt']),
  doc('grep', 'Xử lý văn bản', 'grep [-i] [-v] [-n] [-c] PATTERN [TỆP]', 'Tìm dòng khớp regular expression trong stdin hoặc một tệp.', ['-i: không phân biệt hoa thường.', '-v: đảo điều kiện khớp.', '-n: thêm số dòng.', '-c: chỉ in số dòng khớp.', '--color=auto: bị bỏ qua để tương thích alias mặc định.', '-E không được parse như option; cú pháp regex JavaScript có thể dùng trực tiếp.'], ['grep -n root /etc/passwd', 'grep "(403|500)" /var/log/messages'], 'Hiện handler đọc một tệp mỗi lần; regex được xử lý bằng JavaScript RegExp.'),
  doc('cut', 'Xử lý văn bản', 'cut -d DELIM -f FIELDS [TỆP]', 'Trích các trường phân tách bằng một ký tự từ stdin hoặc tệp.', ['-d DELIM: dấu phân cách một ký tự.', '-f FIELDS: chỉ số hoặc range trường, ví dụ 1,3-4.', '-s: bỏ dòng không có delimiter.'], ['cut -d: -f1 /etc/passwd']),
  doc('sort', 'Xử lý văn bản', 'sort [-r] [-n] [-f] [-u] [-t DELIM] [-k FIELD] [TỆP]', 'Sắp xếp dòng từ stdin hoặc tệp.', ['-r: thứ tự ngược.', '-n: sắp xếp số.', '-f: không phân biệt hoa thường.', '-u: bỏ dòng trùng sau khi sắp xếp.', '-t DELIM: phân cách trường.', '-k FIELD: chọn trường khóa.'], ['cut -d: -f1 /etc/passwd | sort', 'sort -u names.txt']),
  doc('uniq', 'Xử lý văn bản', 'uniq [-c|-d|-u|-i] [TỆP]', 'Gộp các dòng trùng liền kề.', ['-c: đếm số lần lặp.', '-d: chỉ in nhóm lặp.', '-u: chỉ in nhóm đơn.', '-i: so sánh không phân biệt hoa thường.'], ['sort names.txt | uniq -c']),
  doc('awk', 'Xử lý văn bản', 'awk [-F SEP] \'{print $N}\' [TỆP]', 'Trích xuất trường và in record với tập con awk mô phỏng.', ['-F SEP: ký tự phân tách trường.', 'print, printf: tập lệnh in hỗ trợ.', '$0, $N, $NF, NR: biến record/trường hỗ trợ.'], ['awk -F: \'{print $1}\' /etc/passwd', 'awk \'{print $1}\' access.log'], 'Không phải interpreter awk đầy đủ; điều kiện, biểu thức và biến do người dùng đặt chưa hỗ trợ.'),
  doc('sed', 'Xử lý văn bản', 'sed [-n] EXPR [TỆP]', 'Biến đổi từng dòng theo tập con sed mô phỏng.', ['s/OLD/NEW/[gip]: thay chuỗi.', '[N]d: xóa dòng hoặc dòng số N.', '[N]p: in dòng (phối hợp -n).', '-n: tắt in mặc định.'], ['sed "s/old/new/g" file.txt', 'sed -n "2p" file.txt'], 'Chỉ hỗ trợ một expression đơn giản mỗi lần.'),
  doc('tr', 'Xử lý văn bản', 'tr [-d] [-s] SET1 [SET2]', 'Biến đổi tập ký tự của stdin.', ['-d: xóa ký tự thuộc SET1.', '-s: gộp ký tự liên tiếp trong tập đích.', 'Dải ký tự dạng a-z được mở rộng.'], ['echo hello | tr a-z A-Z', 'tr -d " " < file.txt']),
  doc('nl', 'Xử lý văn bản', 'nl [-wWIDTH] [TỆP]', 'Đánh số các dòng không rỗng.', ['-wWIDTH: độ rộng cột số.'], ['nl -w3 /etc/passwd']),
  doc('diff', 'Xử lý văn bản', 'diff TỆP1 TỆP2', 'So sánh nội dung hai tệp và in các dòng khác nhau.', [], ['diff old.conf new.conf'], 'Output là định dạng khác biệt đơn giản, không phải unified diff đầy đủ.'),
  doc('vi', 'Trình soạn thảo', 'vi FILE', 'Mở trình soạn thảo VFS trong giao diện terminal.', [], ['vi /etc/example.conf'], 'Các lệnh vi hỗ trợ do terminal editor quyết định.'),
];

export const DISPATCH_ALIASES: Record<string, string> = {
  more: 'less',
  yum: 'dnf',
  ss: 'netstat',
  vim: 'vi',
  nano: 'vi',
};

export const COMMAND_DOCS_BY_NAME = new Map<string, CommandDoc>();
for (const command of COMMAND_DOCS) {
  COMMAND_DOCS_BY_NAME.set(command.name, command);
}
for (const [alias, canonical] of Object.entries(DISPATCH_ALIASES)) {
  const command = COMMAND_DOCS_BY_NAME.get(canonical);
  if (command) COMMAND_DOCS_BY_NAME.set(alias, command);
}

export const COMMAND_NAMES = [...COMMAND_DOCS_BY_NAME.keys()].sort((a, b) => a.localeCompare(b));

export function getCommandDoc(name: string): CommandDoc | undefined {
  return COMMAND_DOCS_BY_NAME.get(name);
}

export function renderCommandHelp(command: CommandDoc, requestedName: string = command.name): string {
  const aliases = Object.entries(DISPATCH_ALIASES).filter(([, canonical]) => canonical === command.name).map(([alias]) => alias);
  const lines = [`${requestedName}: ${command.summary}`, '', `Usage: ${command.synopsis.replaceAll(command.name, requestedName)}`];
  if (requestedName === command.name && aliases.length) lines.push('', `Also available as: ${aliases.join(', ')}`);
  if (command.options.length) lines.push('', 'Supported options:', ...command.options.map(option => `  ${option}`));
  if (command.examples.length) lines.push('', 'Examples:', ...command.examples.map(example => `  $ ${example}`));
  lines.push('', 'Run `man ' + requestedName + '` for details.');
  return lines.join('\n');
}

export function renderManPage(command: CommandDoc, requestedName: string = command.name): string {
  const aliases = Object.entries(DISPATCH_ALIASES).filter(([, canonical]) => canonical === command.name).map(([alias]) => alias);
  const aliasNote = aliases.length ? `\n       Also available as: ${aliases.join(', ')}` : '';
  const sections = [
    `${requestedName.toUpperCase()}(1)                         CentOS Stream 9                         ${requestedName.toUpperCase()}(1)`,
    '',
    'NAME',
    `       ${requestedName} - ${command.summary}${requestedName === command.name ? aliasNote : ''}`,
    '',
    'SYNOPSIS',
    `       ${command.synopsis.replaceAll(command.name, requestedName)}`,
    '',
    'DESCRIPTION',
    `       ${command.summary}`,
  ];
  if (command.options.length) sections.push('', 'OPTIONS / SUBCOMMANDS', ...command.options.map(option => `       ${option}`));
  if (command.examples.length) sections.push('', 'EXAMPLES', ...command.examples.map(example => `       $ ${example}`));
  if (command.notes) sections.push('', 'SIMULATOR NOTES', `       ${command.notes}`);
  sections.push('', 'CentOS Stream 9 Virtual Lab');
  return sections.join('\n');
}

export function renderWhatIs(command: CommandDoc, requestedName: string = command.name): string {
  return `${requestedName} (1) - ${command.summary}`;
}

export function renderCommandCatalog(): string {
  const groups = new Map<string, string[]>();
  for (const command of COMMAND_DOCS) {
    const aliases = Object.entries(DISPATCH_ALIASES).filter(([, canonical]) => canonical === command.name).map(([alias]) => alias);
    const names = [command.name, ...aliases];
    groups.set(command.group, [...(groups.get(command.group) ?? []), ...names]);
  }
  return [
    'CentOS Stream 9 Virtual Shell — command reference',
    'Gõ `help COMMAND` để xem hướng dẫn nhanh hoặc `man COMMAND` để đọc manual.',
    ...[...groups.entries()].flatMap(([group, names]) => ['', `${group}:`, `  ${[...new Set(names)].sort((a, b) => a.localeCompare(b)).join(', ')}`]),
    '',
    `Tổng cộng ${COMMAND_NAMES.length} tên command được dispatcher hỗ trợ.`,
  ].join('\n');
}
