# 🐧 CentOS Stream 9 Virtual Machine Lab & Grading System

Môi trường giả lập **CentOS Stream 9 (Kernel 5.14.0, DNF / RPM)** chạy trực tiếp trên nền tảng Web với **Terminal xterm.js tương tác** và **Hệ thống chấm điểm bài Lab tự động (Automated Grading Engine)**. Giao diện được thiết kế tối giản, trực quan và tập trung tối đa vào trải nghiệm thực hành.

---

## ⚡ Các cập nhật CentOS Stream 9 & Giao diện tối giản

### 1. Nâng cấp hệ điều hành CentOS Stream 9
- **Kernel Linux 5.14.0-362.el9.x86_64** (`uname -a`, `uname -r`, `/proc/version`).
- **OS Identity**:
  - `/etc/redhat-release` & `/etc/centos-release`: `CentOS Stream release 9`
  - `/etc/os-release`: `CentOS Stream 9 (platform:el9)`
  - `hostnamectl`: Hiển thị thông số CentOS Stream 9 và Linux 5.14
- **Trình quản lý gói DNF / YUM hiện đại**:
  - Hỗ trợ cú pháp lệnh `dnf install`, `dnf search`, `dnf list`, `rpm -qa`, `rpm -qi`.
  - Cấu hình repo chuẩn `/etc/yum.repos.d/centos.repo` (BaseOS, AppStream).
  - Các gói phần mềm chuẩn phiên bản `.el9` (Nginx 1.22.1, Httpd 2.4.57, Htop 3.2.2, Git 2.39).
- **Prompt Terminal**: `[root@centos9 ~]# ` hoặc `[centos@centos9 ~]$ `.

### 2. Giao diện tối giản (Minimalist UI)
- **Header gọn gàng**: Chỉ giữ lại logo CentOS 9, tên máy chủ, tiến độ hoàn thành dạng thanh mảnh (`3/10 bài`) và các nút chức năng cốt lõi (Đổi user, Duyệt File, Hướng dẫn, Reset).
- **Cột bài Lab tinh gọn**:
  - Bộ chọn bài nhanh bằng dropdown menu nhỏ gọn kèm nút tiến/lùi (`<`, `>`).
  - Danh sách yêu cầu tích hợp trực tiếp kết quả chấm điểm (hiển thị trạng thái Đạt/Chưa đạt và số điểm ngay trên từng tiêu chí sau khi ấn **Chấm điểm**).
  - Phản hồi và gợi ý ngắn gọn, không bị rối mắt bởi quá nhiều thẻ lồng nhau.
- **Terminal trọng tâm**:
  - Không gian terminal chiếm trọn tầm nhìn với font chữ sắc nét JetBrains Mono.
  - Thanh tiêu đề terminal tinh giản với 4 lệnh nhanh thông dụng và nút xóa màn hình.

---

## 🚀 Khởi chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại: **`http://localhost:5173/`**
