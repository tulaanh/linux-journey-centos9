---
title: "Lộ Trình Mạng Thực Chiến Cho Cloud & DevOps (17 Ngày)"
tags:
  - networking
  - cloud
  - devops
  - viettel-digital-talent
  - viettel-cloud
  - openstack
  - kubernetes
  - study-plan
date: 2026-09-08
updated: 2026-09-09
source: "1043152640-viettel-dsai-internship-application-insights-2026.pdf"
status: in-progress
---

# 🌐 LỘ TRÌNH MẠNG THỰC CHIẾN VIETTEL CLOUD (17 NGÀY)
> *Tài liệu chuẩn hóa bám sát 100% ngân hàng câu hỏi tuyển dụng Viettel Digital Talent 2026 & Kỹ sư Viettel Cloud / Viettel IDC.*
> *Liên kết trực tiếp tới ngân hàng đề thi tổng: [[viettel_cloud_questions]]*

> [!INFO] **Thông Tin Lộ Trình**
> * **Mục tiêu**: Nắm vững bản chất mạng từ Tầng 2 đến Tầng 7, mạng ảo hóa SDN (OpenStack Neutron, VXLAN) và mạng Container/K8s (CNI), làm chủ kỹ năng gỡ lỗi hệ thống trên Linux bằng `tcpdump`, `ss`, `iptables`, tự tin trả lời chính xác toàn bộ các câu hỏi phỏng vấn mạng của Viettel.
> * **Thời lượng**: 17 ngày (Mỗi ngày 60 – 90 phút).
> * **Mỗi ngày bao gồm**: Kiến thức cốt lõi + 100% Link Video bài giảng thật đã được xác minh + Bài Lab dòng lệnh + Câu hỏi phỏng vấn chính xác trong đề thi Viettel.

---

## 📊 BẢNG THEO DÕI TIẾN ĐỘ & BÀI HỌC LIÊN KẾT

- [x] **Ngày 01**: Mô hình OSI vs TCP/IP & Giao thức ARP (L2 Broadcast) ──> [[TCP-IP]]
- [x] **Ngày 02**: Cấu trúc IPv4, Public/Private IP, NAT Gateway & Bastion Host ──> [[6-9-2026-02-IPv4-Public-PrivateIP]] 👉 *(Câu 38)*
- [x] **Ngày 03**: Bản chất Subnet Mask, CIDR & Cơ chế Toán Nhị phân (AND bit) ──> [[6-9-2026-01-What-is-Subnetting]] 👉 *(Câu 36 - Phần 1)*
- [x] **Ngày 04**: Kỹ thuật chia Subnet từng bước (VLSM, VPC 3-Tier) & Phân đoạn mạng VLAN (802.1Q) ──> [[04 - Ky Thuat Chia Subnet VLSM, VPC 3-Tier va Phan Doan VLAN 802.1Q]] 👉 *(Câu 36 - Phần 2)*
- [ ] **Ngày 05**: Tầng Giao vận: TCP vs UDP & Quản lý Socket trên Linux Server
- [ ] **Ngày 06**: TCP 3-Way Handshake, Sequence Number & Trạng thái TIME_WAIT 👉 *(Câu 31)*
- [ ] **Ngày 07**: Xử lý sự cố Socket: "Port đang listen nhưng ngoài không truy cập được" 👉 *(Câu 27)*
- [ ] **Ngày 08**: Bảng định tuyến (Routing Table) & Sự cố Asymmetric Routing với Stateful Firewall 👉 *(Câu 37)*
- [ ] **Ngày 09**: Hệ thống phân giải DNS: Phân lập lỗi Client vs Resolver vs Authoritative 👉 *(Câu 32)*
- [ ] **Ngày 10**: Cơ chế biên dịch địa chỉ NAT: Phân biệt SNAT vs DNAT trên Linux iptables 👉 *(Câu 34)*
- [ ] **Ngày 11**: Tường lửa Host: Checklist kiểm tra iptables / nftables trên Linux Production 👉 *(Câu 26)*
- [ ] **Ngày 12**: An ninh mạng đa tầng: Firewall Rules vs Security Groups vs K8s Network Policy 👉 *(Câu 94)*
- [ ] **Ngày 13**: Giao thức Web & Mật mã: HTTP vs HTTPS và luồng bắt tay TLS 1.3 Handshake 👉 *(Câu 33)*
- [ ] **Ngày 14**: Cân bằng tải hạ tầng: Phân biệt chuyên sâu Load Balancer L4 vs L7 👉 *(Câu 35)*
- [ ] **Ngày 15**: Mạng ảo hóa Data Center: Provider Network (VLAN) vs Overlay Network (VXLAN) 👉 *(Câu 65)*
- [ ] **Ngày 16**: Mạng Container & Kubernetes: CNI (Calico/Cilium) & ClusterIP, NodePort, LoadBalancer, Ingress 👉 *(Câu 52 & 56)*
- [ ] **Ngày 17**: Tổng kết thực chiến: Quy trình 4 bước kiểm tra End-to-End khi dịch vụ mất kết nối 👉 *(Câu 45)*

---

# MODULE 1: ĐỊA CHỈ IP, PHÂN HOẠCH SUBNET & CÔ LẬP LAYER 2 (NGÀY 1 – 4)

## 📅 NGÀY 01: Mô hình OSI vs TCP/IP & Giao thức ARP
* 🔗 **Ghi chú bài học chi tiết**: [[TCP-IP]]
* ⏱️ **Thời lượng**: 60 phút
* 🧠 **Kiến thức cần biết**:
  * **Mô hình OSI 7 tầng vs TCP/IP 4 tầng**: Phân biệt mô hình tham chiếu lý thuyết (OSI) và kiến trúc thực thi trên Internet (TCP/IP).
  * **Quá trình đóng gói (*Encapsulation*)**: Data $\rightarrow$ Segment (L4) $\rightarrow$ Packet (L3) $\rightarrow$ Frame (L2) $\rightarrow$ Bits (L1).
  * **Địa chỉ MAC vs Địa chỉ IP**: MAC định danh card mạng vật lý cục bộ trong mạng LAN (Layer 2); IP định danh logic toàn cầu để định tuyến gói tin xuyên qua các router (Layer 3).
  * **Giao thức ARP (RFC 826)**: Cơ chế broadcast gói tin hỏi *"Ai có IP này thì trả lời địa chỉ MAC cho tôi"*. Khái niệm ARP Cache và bảng lưu tạm.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Hiểu cách các máy chủ vật lý trong Data Center tìm thấy nhau trong cùng Switch L2.
  * Debug lỗi mất kết nối cục bộ do ARP table bị tràn hoặc ARP spoofing.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [what is TCP/IP and OSI? // FREE CCNA // EP 3 - NetworkChuck](https://www.youtube.com/watch?v=CRdL1PcherM) *(Giải thích cực hay về 7 tầng OSI và 4 tầng TCP/IP)*
  * 🎥 [ARP Explained - Address Resolution Protocol - PowerCert Animated](https://www.youtube.com/watch?v=cn8Zxh9bPio) *(Mô hình hoạt hình trực quan về cơ chế gói tin ARP)*
  * 📄 [RFC 826 - An Ethernet Address Resolution Protocol](https://datatracker.ietf.org/doc/html/rfc826)
* 💻 **Bài Lab thực hành**:
  ```bash
  ip link show                    # Xem địa chỉ MAC của card mạng eth0
  ip neigh show                   # Xem bảng ARP Cache hiện tại của máy
  sudo ip neigh flush all         # Xóa sạch bảng ARP Cache
  ping -c 2 192.168.1.1           # Ping Gateway để ép máy gửi ARP Request
  ip neigh show                   # Quan sát địa chỉ MAC của Gateway vừa học lại
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud**:
  > [!QUESTION] **Phỏng vấn**
  > *Gói tin ARP chạy ở tầng nào trong mô hình OSI? Tại sao Router không cho gói tin ARP đi qua ra ngoài Internet?*
  > **Trả lời**: ARP chạy ở Tầng 2 (Data Link) vì nó sử dụng địa chỉ MAC đích broadcast `FF:FF:FF:FF:FF:FF` chỉ có hiệu lực nội bộ trong miền quảng bá (Broadcast Domain). Router có nhiệm vụ chia cắt Broadcast Domain và chặn các gói broadcast này để tránh làm tê liệt (bão mạng) toàn bộ mạng Internet.

---

## 📅 NGÀY 02: Cấu trúc IPv4, Public/Private IP, NAT Gateway & Bastion Host
* 🔗 **Ghi chú bài học chi tiết**: [[6-9-2026-02-IPv4-Public-PrivateIP]]
* ⏱️ **Thời lượng**: 60 phút
* 🧠 **Kiến thức cần biết**:
  * Cấu trúc 32-bit của địa chỉ IPv4 (gồm 4 octet).
  * **3 dải Private IP chuẩn RFC 1918 (bắt buộc thuộc lòng)**:
    * Lớp A: `10.0.0.0/8` (từ `10.0.0.0` đến `10.255.255.255`) $\rightarrow$ Dùng cho Data Center, mạng Cloud lớn.
    * Lớp B: `172.16.0.0/12` (từ `172.16.0.0` đến `172.31.255.255`) $\rightarrow$ Dùng cho mạng ảo Docker, K8s Pods.
    * Lớp C: `192.168.0.0/16` (từ `192.168.0.0` đến `192.168.255.255`) $\rightarrow$ Mạng văn phòng, gia đình.
  * **Public IP**: Cấp phát bởi IANA/APNIC, định tuyến toàn cầu. Chỉ gán cho Load Balancer, Gateway.
  * **NAT Gateway**: Thiết bị cho phép máy chủ mang Private IP đi ra ngoài Internet (tải bản vá, gọi API bên thứ 3) mà không cho phép chiều ngược lại từ Internet kết nối vào.
  * **Bastion Host (Jump Server)**: Máy chủ duy nhất mở cổng SSH/RDP ra ngoài Internet nhưng được khóa chặt bảo mật (chỉ mở cho IP kỹ sư, bắt buộc dùng SSH Key + 2FA), làm cầu nối để quản trị viên truy cập vào các cụm máy chủ Private nội bộ.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Nguyên tắc tối thượng trong kiến trúc Cloud viễn thông/ngân hàng: Database và Backend tuyệt đối không được cấp Public IP.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Public vs Private IP Address - PowerCert Animated](https://www.youtube.com/watch?v=po8ZFG0Xc4Q) *(Phân biệt bản chất IP công cộng và IP nội bộ)*
  * 🎥 [Jump Servers Explained | AKA Bastion Host - IBM Technology](https://www.youtube.com/watch?v=9FN31QDLyFs) *(Kiến trúc bảo mật vùng mạng với Bastion Host)*
  * 📄 [RFC 1918 - Address Allocation for Private Internets](https://datatracker.ietf.org/doc/html/rfc1918)
* 💻 **Bài Lab thực hành**:
  ```bash
  ip -4 addr show                 # Xem IP Private của card mạng máy ảo
  curl ifconfig.me                # Xem Public IP thực tế của gateway ra ngoài Internet
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 38 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Private IP, public IP, NAT gateway, bastion host dùng trong trường hợp nào?*
  > **Trả lời**: 
  > - **Public IP**: Dùng cho các dịch vụ tiếp nhận traffic Internet (Load Balancer, Web Frontend, VPN Gateway).
  > - **Private IP**: Dùng cho hạ tầng nội bộ cần bảo vệ (Database, Backend API, Redis Cluster, Storage node).
  > - **NAT Gateway**: Cho phép máy Private chủ động đi ra Internet tải bản vá/gọi API ngoài mà ngăn chặn chiều ngược lại từ Internet kết nối vào.
  > - **Bastion Host**: Điểm truy cập SSH an toàn duy nhất có xác thực 2FA/Key để quản trị viên vào cụm Private.

---

## 📅 NGÀY 03: Bản chất Subnet Mask, CIDR & Cơ chế Toán Nhị phân (AND bit)
* 🔗 **Ghi chú bài học chi tiết**: [[6-9-2026-01-What-is-Subnetting]]
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **Bản chất Subnet Mask**: Dãy số 32-bit (gồm các bit 1 liên tục đại diện cho Network, các bit 0 đại diện cho Host).
  * **Phép toán AND bit trong nhân Linux/Router**:
    * Khi Router nhận gói tin có IP đích, nó lấy `IP Destination AND Subnet Mask` để tìm ra **Network ID**.
  * **CIDR (RFC 4632)**: Ký hiệu tiền tố `/n` (ví dụ: `/24` là 24 bit 1 liên tục $\rightarrow$ `255.255.255.0`).
  * **Bảng chuyển đổi 8 giá trị Octet kinh điển cần thuộc lòng**:
    * `/25` (`.128`) $\rightarrow$ 128 IPs
    * `/26` (`.192`) $\rightarrow$ 64 IPs
    * `/27` (`.224`) $\rightarrow$ 32 IPs
    * `/28` (`.240`) $\rightarrow$ 16 IPs
    * `/29` (`.248`) $\rightarrow$ 8 IPs
    * `/30` (`.252`) $\rightarrow$ 4 IPs
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Nắm chắc bản chất toán học để không bao giờ bị tính nhầm khi cấp phát dải mạng VPC cho khách hàng.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [what is an IP Address? // You SUCK at Subnetting // EP 1 - NetworkChuck](https://www.youtube.com/watch?v=5WfiTHiU4x8) *(Video vỡ lòng về bit nhị phân, IP, Network ID và Subnet Mask)*
  * 🎥 [Subnet Mask - Explained - PowerCert Animated](https://www.youtube.com/watch?v=s_Ntt6eTn94) *(Hoạt họa trực quan giải thích vai trò của Subnet Mask trong việc tách mạng)*
  * 🌐 [SubnettingPractice.com - Công cụ luyện tính nhẩm Subnet](https://subnettingpractice.com/)
  * 📄 [RFC 4632 - Classless Inter-domain Routing (CIDR)](https://datatracker.ietf.org/doc/html/rfc4632)
* 💻 **Bài Lab thực hành**:
  ```bash
  sudo apt install -y ipcalc
  ipcalc 192.168.1.0/26           # Quan sát phép AND bit và dải IP
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 36 - Phần 1 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *CIDR là gì? Subnet mask của dải /26 là gì và có bao nhiêu IP gán được cho máy chủ?*
  > **Trả lời**: CIDR là phương pháp định tuyến không phân lớp biểu thị mạng bằng tiền tố bit (`/n`). Subnet mask của dải `/26` là `255.255.255.192`. Số IP gán được cho máy chủ là $2^{(32-26)} - 2 = 64 - 2 = \mathbf{62}$ IP khả dụng (loại trừ IP mạng và IP broadcast).

---

## 📅 NGÀY 04: Kỹ thuật chia Subnet từng bước (VLSM, VPC 3-Tier) & Phân đoạn mạng VLAN (802.1Q)
* 🔗 **Ghi chú bài học chi tiết**: [[04 - Ky Thuat Chia Subnet VLSM, VPC 3-Tier va Phan Doan VLAN 802.1Q]]
* ⏱️ **Thời lượng**: 90 phút
* 🧠 **Kiến thức cần biết**:
  * **Quy trình 5 bước chia Subnetting bất kỳ**:
    1. Xác định số lượng Host cần dùng $\rightarrow$ Tìm số bit Host $h$ sao cho $2^h - 2 \ge \text{Hosts}$.
    2. Xác định Prefix mới: $n = 32 - h$.
    3. Tính **Block Size (Bước nhảy)**: $\text{Block Size} = 2^h = 256 - \text{Octet Subnet Mask tương ứng}$.
    4. Tìm dải mạng: Network ID đầu tiên $\rightarrow$ Mạng tiếp theo $=$ Network ID cũ $+$ Block Size.
    5. Broadcast ID $=$ Mạng tiếp theo $- 1$. Dải Host khả dụng $=$ $[\text{Network ID} + 1, \text{Broadcast ID} - 1]$.
  * **VLSM (Variable Length Subnet Masking)**: Kỹ thuật chia các subnet có kích thước khác nhau trong cùng một dải mạng (Web cần dải lớn, DB cần dải nhỏ).
  * **VLAN (IEEE 802.1Q)**:
    * Công nghệ chia Switch vật lý thành các Switch ảo biệt lập ở Tầng 2.
    * Thẻ VLAN Tag 12-bit (tối đa 4096 VLAN IDs).
    * Phân biệt **Access Port** (Untagged cho máy chủ) và **Trunk Port** (Tagged truyền nhiều VLAN qua switch/router).
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Thiết kế kiến trúc mạng 3 lớp chuẩn doanh nghiệp: **Web Tier (`/26`) $\rightarrow$ App Tier (`/26`) $\rightarrow$ DB Tier (`/28`)**, cô lập bằng VLAN hoặc Subnet riêng biệt.
* 📚 **Link Video bài giảng đã xác minh (CHUỖI BÀI GIẢNG CHIA SUBNET CHI TIẾT NHẤT)**:
  * 🎥 [What is Subnetting? - Subnetting Mastery - Part 1 of 7 - Practical Networking](https://www.youtube.com/watch?v=BWZ-MHIhqjM) *(Bộ bài giảng số 1 thế giới về cách chia Subnetting từng bước)*
  * 🎥 [Subnetting VLSM: i bet you can't do this - NetworkChuck](https://www.youtube.com/watch?v=2-i5x8KCfII) *(Cách tính và chia Subnet theo phương pháp VLSM)*
  * 🎥 [VLAN Explained - PowerCert Animated](https://www.youtube.com/watch?v=jC6MJTh9fRE) *(Hoạt họa giải thích chi tiết VLAN 802.1Q và Trunk port)*
* 💻 **Bài Lab thực hành (Thiết kế Subnet VPC 3 lớp)**:
  * **Đề bài**: Viettel cấp dải `10.0.0.0/24`. Hãy chia mạng cho: Web (50 máy), App (50 máy), Database (10 máy).
  * **Thực hiện**:
    * Subnet 1 (Web): `10.0.0.0/26` (Dải máy: `10.0.0.1` – `10.0.0.62`, Broadcast: `10.0.0.63`).
    * Subnet 2 (App): `10.0.0.64/26` (Dải máy: `10.0.0.65` – `10.0.0.126`, Broadcast: `10.0.0.127`).
    * Subnet 3 (DB): `10.0.0.128/28` (Dải máy: `10.0.0.129` – `10.0.0.142`, Broadcast: `10.0.0.143`).
  * **Tạo VLAN 10 trên card mạng Linux**:
    ```bash
    sudo ip link add link eth0 name eth0.10 type vlan id 10
    sudo ip addr add 10.0.0.1/26 dev eth0.10
    sudo ip link set dev eth0.10 up
    ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 36 - Phần 2 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *VLAN là gì? Vì sao trong Cloud quy mô lớn VLAN lại bộc lộ hạn chế?*
  > **Trả lời**: VLAN là kỹ thuật chia tách miền quảng bá (Broadcast Domain) ở Tầng 2 trên cùng một hạ tầng switch vật lý. Hạn chế lớn nhất của VLAN trong môi trường Cloud lớn là không gian địa chỉ bị giới hạn ở 4096 VLAN ID (thẻ tag 12-bit), không đủ phân tách độc lập cho hàng chục nghìn tenant (khách hàng), đồng thời yêu cầu cấu hình thủ công trên các switch vật lý mỗi khi tạo dải mạng mới.

---

# MODULE 2: TẦNG GIAO VẬN, SOCKET & GỠ LỖI PORT (NGÀY 5 – 7)

## 📅 NGÀY 05: Tầng Giao vận: TCP vs UDP & Quản lý Socket trên Server
* ⏱️ **Thời lượng**: 60 phút
* 🧠 **Kiến thức cần biết**:
  * **So sánh bản chất TCP vs UDP**:
    * **TCP (RFC 9293)**: Hướng kết nối (Connection-oriented), đảm bảo tin cậy, truyền dữ liệu tuần tự có ACK, kiểm soát lưu lượng (Flow Control) và kiểm soát tắc nghẽn (Congestion Control) $\rightarrow$ Dùng cho Web (HTTP/S), SSH, Database, File transfer.
    * **UDP (RFC 768)**: Phi kết nối (Connectionless), không có cờ ACK, gửi gói tin với độ trễ thấp nhất có thể $\rightarrow$ Dùng cho DNS query, VoIP, Live Streaming, NTP, DHCP.
  * **Socket trên Linux**: Cặp thông số `IP:Port` đại diện cho một kênh giao tiếp của tiến trình.
  * **Phân loại cổng (Port)**: Well-known ports (0–1023), Registered ports (1024–49151), Ephemeral ports (49152–65535 dùng làm cổng nguồn tạm thời của client).
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Nắm rõ giao thức vận hành của từng dịch vụ microservices trên hệ thống để cấp phát firewall và QoS phù hợp.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [TCP vs UDP Comparison - PowerCert Animated](https://www.youtube.com/watch?v=uwoD5YsGACg) *(So sánh chi tiết hoạt động giữa TCP và UDP)*
  * 🎥 [Socket management and Kernel Data structures - Hussein Nasser](https://www.youtube.com/watch?v=rn8r1RdhEUQ) *(Cấu trúc socket và file descriptor trong nhân Linux)*
  * 📄 [Linux socket(7) - Linux Manual Page](https://man7.org/linux/man-pages/man7/socket.7.html)
* 💻 **Bài Lab thực hành**:
  ```bash
  sudo ss -tulnp                  # Liệt kê toàn bộ socket TCP/UDP đang ở trạng thái LISTEN
  # Terminal 1: Mở cổng TCP 9999 lắng nghe bằng netcat
  nc -l -p 9999
  # Terminal 2: Kết nối từ máy khác
  nc 127.0.0.1 9999
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud**:
  > [!QUESTION] **Phỏng vấn**
  > *Tại sao DNS query thông thường lại chạy trên UDP port 53 mà không dùng TCP?*
  > **Trả lời**: DNS query có kích thước gói tin rất nhỏ (dưới 512 bytes) và yêu cầu phản hồi nhanh. Dùng UDP giúp bỏ qua quá trình bắt tay 3 bước của TCP, giảm độ trễ tối đa cho người dùng và giảm tải tiêu hao CPU/RAM cho máy chủ DNS khi phải xử lý hàng triệu truy vấn mỗi giây. (Lưu ý: DNS Zone Transfer hoặc DNSSEC kích thước lớn mới dùng TCP).

---

## 📅 NGÀY 06: TCP 3-Way Handshake, Sequence Number & Trạng thái TIME_WAIT
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **3-way handshake (Khởi tạo kết nối)**:
    1. Client gửi `[SYN]` với số thứ tự khởi tạo ngẫu nhiên ($Seq = X$). Trạng thái: `SYN_SENT`.
    2. Server nhận gói, phản hồi `[SYN, ACK]`, xác nhận gói client ($Ack = X + 1$) và gửi số khởi tạo của mình ($Seq = Y$). Trạng thái: `SYN_RCVD`.
    3. Client gửi `[ACK]`, xác nhận gói server ($Ack = Y + 1$). Cả 2 chuyển sang trạng thái: `ESTABLISHED`.
  * **Sequence Number**: Đánh số thứ tự từng byte dữ liệu gửi đi, giúp bên nhận sắp xếp lại các gói tin đúng vị trí và phát hiện mất gói tin để yêu cầu truyền lại (Retransmission).
  * **Trạng thái `TIME_WAIT`**: Phía chủ động đóng kết nối sẽ giữ socket ở trạng thái `TIME_WAIT` trong $2 \times \text{MSL}$ (khoảng 60 giây). Mục đích: Đảm bảo gói tin `ACK` cuối cùng đến đích an toàn và hứng toàn bộ các gói tin đi lạc trên mạng, tránh làm hỏng phiên kết nối mới cùng cổng.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Tránh sự cố **cạn kiệt Socket/Port**: Khi microservices gọi nhau liên tục và đóng socket không đúng cách, hàng chục nghìn kết nối rơi vào `TIME_WAIT` làm cạn kiệt Ephemeral Ports, khiến server không thể mở kết nối mới.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [TCP - Three-way handshake in details - PowerCert Animated](https://www.youtube.com/watch?v=xMtP5ZB3wSk) *(Phân tích từng cờ SYN, ACK, Sequence Number)*
  * 🎥 [Top 8 Most Popular Network Protocols Explained - ByteByteGo](https://www.youtube.com/watch?v=P6SZLcGE4us) *(Luồng kết nối và các giao thức mạng phổ biến)*
  * 📄 [RFC 9293 - Transmission Control Protocol (TCP)](https://datatracker.ietf.org/doc/html/rfc9293)
* 💻 **Bài Lab thực hành**:
  ```bash
  ss -s                           # Thống kê tổng số kết nối ESTABLISHED, TIME-WAIT
  ss -t state time-wait           # Xem danh sách socket đang bị giam ở TIME-WAIT
  # Bắt 3 gói tin bắt tay TCP cổng 80:
  sudo tcpdump -i any port 80 -nn -c 3
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 31 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *TCP 3-way handshake là gì? Ý nghĩa của số Sequence Number là gì?*
  > **Trả lời**: TCP 3-way handshake là quá trình 3 bước (SYN -> SYN-ACK -> ACK) nhằm đồng bộ Sequence Number và kích thước cửa sổ nhận giữa hai đầu cuối trước khi truyền dữ liệu thực tế. Sequence Number dùng để đánh số thứ tự từng byte dữ liệu gửi đi, đảm bảo bên nhận có thể lắp ghép dữ liệu đúng trật tự ngay cả khi các gói tin đi qua các đường mạng khác nhau và phát hiện gói tin bị mất để gửi lại.

---

## 📅 NGÀY 07: Xử lý sự cố Socket: "Port đang listen nhưng ngoài không truy cập được"
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết & Checklist 5 bước điều tra sự cố**:
  1. **IP Binding**: Kiểm tra daemon dịch vụ bind vào địa chỉ nào:
     * `127.0.0.1` hoặc `::1`: Chỉ chấp nhận kết nối cục bộ trong nội bộ máy chủ đó.
     * `0.0.0.0` hoặc `*`: Lắng nghe trên TẤT CẢ các card mạng, cho phép bên ngoài truy cập.
  2. **Host Firewall**: Tường lửa cục bộ trên Linux (`iptables`, `nftables`, `ufw`, `firewalld`) có rule DROP/REJECT cổng đó không.
  3. **Cloud Security Group**: Tường lửa lớp ảo hóa (OpenStack Security Group / AWS SG) đã mở cổng Inbound cho dải IP nguồn chưa.
  4. **Network Routing**: Server có bảng định tuyến và Default Gateway đúng chưa? Gói tin phản hồi có bị Asymmetric Routing không.
  5. **Tường lửa biên (Hardware Firewall / LB)**: Thiết bị cân bằng tải phía trước có đang health check dịch vụ bị fail không.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Câu hỏi thực chiến kinh điển để đánh giá phản xạ gỡ lỗi hệ thống của kỹ sư vận hành Cloud.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Socket Management & Listening Ports Troubleshooting - Hussein Nasser](https://www.youtube.com/watch?v=rn8r1RdhEUQ) *(Cách debug port và kernel socket)*
  * 🎥 [Wireshark Tutorial for Beginners - NetworkChuck](https://www.youtube.com/watch?v=qTaOZrDnMzQ) *(Kỹ năng bắt và phân tích gói tin mạng)*
  * 📄 [ss(8) - Linux Manual Page](https://man7.org/linux/man-pages/man8/ss.8.html)
* 💻 **Bài Lab thực hành**:
  ```bash
  # 1. Kiểm tra IP Binding
  sudo ss -tulnp | grep :80
  
  # 2. Kiểm tra rule INPUT của iptables
  sudo iptables -L INPUT -n -v --line-numbers
  
  # 3. Dùng tcpdump bắt gói tin xem request có chạm tới card mạng không
  sudo tcpdump -i eth0 port 80 -nn -v
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 27 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Một port đang listen nhưng từ ngoài vẫn không truy cập được; bạn debug thế nào?*
  > **Trả lời**: Tôi thực hiện theo checklist 4 bước:
  > 1. Dùng `ss -tulnp` kiểm tra xem tiến trình có đang bind nhầm vào `127.0.0.1` thay vì `0.0.0.0` hay không.
  > 2. Kiểm tra firewall trên máy chủ (`iptables -L -n -v`) xem chain INPUT có chặn cổng dịch vụ.
  > 3. Kiểm tra Security Group của máy ảo trên hạ tầng Cloud (OpenStack/Neutron) xem đã cấu hình Inbound Rule cho phép IP nguồn hay chưa.
  > 4. Chạy `tcpdump -i <interface> port <port> -nn` trên máy chủ: Nếu thấy gói SYN đến mà không có gói phản hồi thì lỗi do tường lửa; nếu hoàn toàn không thấy gói tin đến thì lỗi do hạ tầng mạng/Security Group hoặc Routing bên ngoài.

---

# MODULE 3: ĐỊNH TUYẾN, PHÂN GIẢI TÊN MIỀN & BIẾN ĐỔI ĐỊA CHỈ (NGÀY 8 – 10)

## 📅 NGÀY 08: Bảng định tuyến (Routing Table) & Sự cố Asymmetric Routing
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **Quy tắc định tuyến Longest Prefix Match**: Khi có nhiều đường mạng, router luôn ưu tiên chọn route có Subnet Mask dài nhất (cụ thể nhất).
  * **Default Gateway (`0.0.0.0/0`)**: Tuyến đường mặc định được dùng khi gói tin không khớp với bất kỳ route cụ thể nào trong bảng định tuyến.
  * **Asymmetric Routing (Định tuyến bất đối xứng)**:
    * Hiện tượng chiều đi từ Client $\rightarrow$ Server đi qua Router/Firewall A, nhưng chiều phản hồi từ Server $\rightarrow$ Client lại đi qua Router/Firewall B.
  * **Tại sao nguy hiểm với Stateful Firewall?**:
    * Các tường lửa hiện đại quản lý phiên theo cơ chế **Stateful Packet Inspection** thông qua bảng **Connection Tracking (`conntrack`)**.
    * Firewall B không hề nhìn thấy gói tin bắt tay `SYN` khởi tạo kết nối (vì gói này đi qua Firewall A) $\rightarrow$ Firewall B coi gói phản hồi `SYN-ACK` là bất thường (Invalid State) và tự động **DROP** ngay lập tức.
    * Dẫn đến lỗi đứt kết nối ngẫu nhiên hoặc timeout rất khó phát hiện.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Hạ tầng Cloud có nhiều đường truyền dự phòng (Dual-homed, Multi-DC, VPN kết hợp Direct Connect) rất dễ gặp sự cố này nếu cấu hình BGP hoặc routing table không chuẩn.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Routing Tables \| CCNA - Explained - PowerCert Animated](https://www.youtube.com/watch?v=CGmTvukObOw) *(Cách router đọc và xử lý bảng định tuyến)*
  * 🎥 [What is asymmetric routing? - Practical Networking](https://www.youtube.com/watch?v=I5Bwex8qKjc) *(Nguyên nhân và cách xử lý hiện tượng Asymmetric Routing)*
  * 📄 [Netfilter Connection Tracking System](https://conntrack-tools.netfilter.org/)
* 💻 **Bài Lab thực hành**:
  ```bash
  ip route show                   # Đọc bảng định tuyến hiện tại
  traceroute -n 8.8.8.8           # Xem từng hop router gói tin đi qua
  sudo conntrack -L               # Xem danh sách các phiên kết nối đang duy trì
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 37 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Asymmetric routing là gì và vì sao nó nguy hiểm với hệ thống có Tường lửa Stateful?*
  > **Trả lời**: Asymmetric routing là hiện tượng gói tin đi một đường và phản hồi về bằng một đường mạng khác. Nó đặc biệt nguy hiểm với hệ thống có Stateful Firewall vì firewall ở chiều về không hề thấy gói tin khởi tạo bắt tay (SYN) trước đó trong bảng Connection Tracking, nên sẽ tự động coi gói tin phản hồi là bất hợp pháp và DROP, gây rớt kết nối bí ẩn.

---

## 📅 NGÀY 09: Hệ thống phân giải DNS: Phân lập lỗi Client vs Resolver vs Authoritative
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **Chuỗi phân giải DNS 5 bước**:
    1. Client kiểm tra Local Cache và file `/etc/hosts`.
    2. Client gửi truy vấn tới **DNS Resolver** (DNS Server của nhà mạng Viettel hoặc Public DNS `8.8.8.8`).
    3. Resolver hỏi **Root DNS Server (`.`)**.
    4. Root DNS trỏ tới **TLD DNS Server (`.vn`, `.com`)**.
    5. TLD DNS trỏ tới **Authoritative Name Server** (máy chủ gốc nắm giữ bản ghi của tên miền, ví dụ `ns1.viettel.com.vn`).
  * **Các loại bản ghi bắt buộc**: `A` (IPv4), `AAAA` (IPv6), `CNAME` (Bí danh), `MX` (Mail), `NS` (Name Server), `TXT` (SPF/DKIM).
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * "Xương sống của Internet": Khi khách hàng báo hệ thống sập, việc đầu tiên là xác định lỗi do phân giải tên miền hay do hạ tầng máy chủ.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Everything You Need to Know About DNS - ByteByteGo](https://www.youtube.com/watch?v=27r4Bzuj5NQ) *(Khoá học cô đọng toàn bộ luồng phân giải tên miền và hệ thống phân tán DNS)*
  * 🎥 [DNS Records Explained - PowerCert Animated](https://www.youtube.com/watch?v=HnUDtycXSNE) *(Giải thích chi tiết các bản ghi A, CNAME, MX, NS)*
  * 📄 [dig(1) - Linux Manual Page](https://man7.org/linux/man-pages/man1/dig.1.html)
* 💻 **Bài Lab thực hành**:
  ```bash
  cat /etc/resolv.conf            # Xem máy đang trỏ tới DNS Resolver nào
  dig domain.com                  # Truy vấn dùng DNS Resolver mặc định
  dig @8.8.8.8 domain.com         # Truy vấn qua Google DNS
  dig NS domain.com +short        # Tìm Name Server gốc của domain
  dig @<authoritative_ns> domain.com # Truy vấn thẳng vào Authoritative Server
  dig +trace viettel.com.vn       # Theo dõi toàn bộ luồng phân giải từ Root Server
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 32 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Khi DNS lỗi, bạn xác định vấn đề nằm ở client, resolver hay authoritative server thế nào?*
  > **Trả lời**: Tôi dùng công cụ `dig` để phân vùng theo 3 cấp độ:
  > 1. **Kiểm tra Client**: Chạy `dig domain.com`. Nếu thất bại, kiểm tra cấu hình mạng máy cục bộ và file `/etc/resolv.conf`.
  > 2. **Kiểm tra Resolver**: Chạy `dig @8.8.8.8 domain.com`. Nếu query qua 8.8.8.8 thành công mà query local thất bại $ightarrow$ DNS Resolver nội bộ hoặc DNS nhà mạng bị hỏng/nghẽn.
  > 3. **Kiểm tra Authoritative**: Tìm NS gốc bằng `dig NS domain.com` rồi query thẳng `dig @ns_server domain.com` (hoặc dùng `dig +trace`). Nếu query trực tiếp vào NS gốc mà vẫn bị lỗi hoặc NXDOMAIN $ightarrow$ Bản ghi DNS trên máy chủ của bên cung cấp tên miền bị cấu hình sai hoặc chết server.

---

## 📅 NGÀY 10: Cơ chế biên dịch địa chỉ NAT: Phân biệt SNAT vs DNAT trên Linux
* ⏱️ **Thời lượng**: 60 phút
* 🧠 **Kiến thức cần biết**:
  * **Bản chất của NAT (RFC 3022)**: Sửa đổi địa chỉ IP trong IP header của gói tin khi đi qua Gateway/Router.
  * **SNAT (Source NAT)**:
    * Thay đổi **IP nguồn** của gói tin.
    * Diễn ra tại chain `POSTROUTING` sau khi gói tin đã được định tuyến.
    * Ứng dụng Cloud: Cho phép hàng nghìn máy ảo Private đi ra ngoài Internet tải phần mềm thông qua 1 IP Public của NAT Gateway (kỹ thuật Masquerade).
  * **DNAT (Destination NAT)**:
    * Thay đổi **IP đích** của gói tin.
    * Diễn ra tại chain `PREROUTING` trước khi quyết định đường đi của gói tin.
    * Ứng dụng Cloud: Port Forwarding, Load Balancer nhận request gửi đến Public IP và chuyển tiếp tới Private IP của các máy chủ Web backend.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Tối ưu không gian IPv4 cạn kiệt và bảo vệ vùng mạng nhạy cảm (Private Zone) của khách hàng.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [NAT Explained - Network Address Translation - PowerCert Animated](https://www.youtube.com/watch?v=FTUV0t6JaDA) *(Mô phỏng trực quan cơ chế dịch địa chỉ IP và Port)*
  * 🎥 [Network Address Translation - NAT Explained - Practical Networking](https://www.youtube.com/watch?v=RG97rvw1eUo) *(Chi tiết SNAT, DNAT và Masquerade trong Linux)*
  * 📄 [Linux iptables-extensions(8) - NAT Targets](https://man7.org/linux/man-pages/man8/iptables-extensions.8.html)
* 💻 **Bài Lab thực hành**:
  ```bash
  # Xem bảng NAT trong iptables
  sudo iptables -t nat -L -n -v
  
  # Cấu hình rule SNAT (Masquerade gói tin đi ra qua card eth0)
  sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
  
  # Cấu hình rule DNAT (Chuyển tiếp cổng 80 ngoài vào web nội bộ 10.0.0.10)
  sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 10.0.0.10:80
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 34 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *NAT, SNAT, DNAT khác nhau thế nào? Cho ví dụ thực tế trong hạ tầng Cloud.*
  > **Trả lời**: SNAT thay đổi IP nguồn của gói tin, áp dụng khi các máy ảo dải Private cần đi ra ngoài Internet thông qua NAT Gateway. DNAT thay đổi IP đích của gói tin, áp dụng khi người dùng ngoài Internet cần truy cập vào dịch vụ nội bộ thông qua việc ánh xạ cổng hoặc Virtual IP của Load Balancer.

---

# MODULE 4: TƯỜNG LỬA HỆ ĐIỀU HÀNH & AN NINH MẠNG CLOUD (NGÀY 11 – 12)

## 📅 NGÀY 11: Tường lửa Host: Checklist kiểm tra iptables / nftables trên Linux
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết & Checklist 4 bước chuẩn Production**:
  1. **Bước 1 (Xác định công cụ quản lý)**: Kiểm tra hệ thống đang chạy `iptables-legacy`, `nftables`, `ufw` hay `firewalld`.
  2. **Bước 2 (Kiểm tra Default Policy)**:
     * Kiểm tra chính sách mặc định của các chain: `INPUT`, `FORWARD`, `OUTPUT`.
     * Nếu Default Policy của `INPUT` là `DROP` mà chưa có rule ACCEPT cho cổng cần dùng thì dịch vụ sẽ bị chặn toàn bộ.
  3. **Bước 3 (Kiểm tra thứ tự Rule)**:
     * iptables duyệt rule từ trên xuống dưới theo thứ tự xuất hiện. Nếu một rule DROP/REJECT nằm phía trên rule ACCEPT của port dịch vụ thì gói tin sẽ bị hủy trước khi chạm tới rule cho phép.
  4. **Bước 4 (Kiểm tra Stateful Connection Tracking Rule)**:
     * Bắt buộc phải có rule: `-m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT`. Thiếu rule này, server có thể gửi gói tin đi nhưng không thể nhận gói tin phản hồi của các kết nối hợp lệ.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Quy định an toàn thông tin bắt buộc: Mọi máy chủ Production của Viettel đều phải cấu hình Default Policy DROP và khóa chặt cổng quản trị.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Mastering IPTables Firewall: Step-by-Step Practical Guide - NetworkChuck / Hacker School](https://www.youtube.com/watch?v=04zZFMEP9qw) *(Hướng dẫn thực hành chi tiết từ đầu về iptables)*
  * 🎥 [5 Steps to Secure Linux (Protect from Hackers) - NetworkChuck](https://www.youtube.com/watch?v=ZhMw53Ud2tY) *(Cấu hình tường lửa và bảo mật Linux Server)*
  * 📄 [Linux iptables(8) - Linux Manual Page](https://man7.org/linux/man-pages/man8/iptables.8.html)
* 💻 **Bài Lab thực hành**:
  ```bash
  sudo iptables -L -n -v --line-numbers  # Liệt kê toàn bộ rule kèm số dòng và số packet
  sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
  sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
  sudo iptables -P INPUT DROP            # Khóa toàn bộ các cổng lạ
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 26 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Bạn kiểm tra firewall trên Linux theo checklist nào?*
  > **Trả lời**: Tôi kiểm tra theo checklist 4 điểm:
  > 1. Xác định daemon tường lửa đang thực sự chạy (iptables, nftables, ufw hay firewalld).
  > 2. Kiểm tra Default Policy của chain INPUT xem là ACCEPT hay DROP.
  > 3. Rà soát thứ tự các rule để đảm bảo rule ACCEPT cổng dịch vụ nằm trước các rule DROP/REJECT chung.
  > 4. Kiểm tra sự hiện diện của rule conntrack ESTABLISHED,RELATED để đảm bảo gói tin phản hồi không bị chặn.

---

## 📅 NGÀY 12: An ninh mạng đa tầng: Firewall Rules vs Security Groups vs K8s Network Policy
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **Firewall Rules (Host level)**: Chạy trong nhân Linux của máy chủ (`iptables`/`nftables`). Do sysadmin quản lý trực tiếp.
  * **Security Groups (Infrastructure/Hypervisor level)**: Tường lửa ảo do nền tảng Cloud (OpenStack Neutron, AWS VPC) điều khiển. Lọc gói tin ngay tại Tầng ảo hóa (OVS/Hypervisor) trước khi gói tin chạm tới máy ảo (VM). Stateful, cấu hình theo Security Group Rules.
  * **Network Policy (Container/Application level)**: Tường lửa vi mô (Micro-segmentation) trong cụm Kubernetes. Cấu hình bằng file YAML, do CNI Plugin (Calico, Cilium) thực thi. Lọc traffic giữa các Pod dựa trên **Labels** (`app: backend`), **Namespace** và Port.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Mô hình phòng thủ chiều sâu (Defense-in-Depth): Phối hợp Security Group ở tầng hạ tầng máy ảo và Network Policy ở tầng microservices.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Kubernetes Network Policy Deep Dive - ByteByteGo / TechWorld with Nana](https://www.youtube.com/watch?v=Fr-6oDHbobM) *(Cách viết và kiểm tra Network Policy trong Kubernetes)*
  * 📄 [OpenStack Neutron Security Groups Documentation](https://docs.openstack.org/neutron/latest/admin/config-security-groups.html)
  * 📄 [Kubernetes Network Policies Official Guide](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
* 💻 **Bài Lab thực hành (K8s Network Policy mẫu)**:
  ```yaml
  apiVersion: networking.k8s.io/v1
  kind: NetworkPolicy
  metadata:
    name: db-policy
  spec:
    podSelector:
      matchLabels:
        role: db
    ingress:
    - from:
      - podSelector:
          matchLabels:
            role: frontend
      ports:
      - protocol: TCP
        port: 5432
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 94 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Security groups, firewall rules, network policy khác nhau thế nào?*
  > **Trả lời**: Firewall rules chạy ở tầng hệ điều hành của chính máy chủ. Security Groups là lớp tường lửa ảo hóa do nền tảng Cloud (OpenStack Neutron) quản lý, bảo vệ máy ảo ngay tại cổng ảo hóa trước khi gói tin chạm vào VM. Network Policy là lớp tường lửa vi mô trong Kubernetes, lọc traffic giữa các Pod dựa trên Label và Namespace thông qua CNI plugin.

---

# MODULE 5: GIAO THỨC ỨNG DỤNG & CÂN BẰNG TẢI (NGÀY 13 – 14)

## 📅 NGÀY 13: Giao thức Web & Mật mã: HTTP vs HTTPS và luồng bắt tay TLS 1.3
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **HTTP vs HTTPS**: HTTP truyền văn bản thô (port 80), dễ bị nghe lén (Man-in-the-Middle). HTTPS = HTTP + TLS (port 443), bảo đảm Tính bảo mật (Encryption), Toàn vẹn (Integrity) và Xác thực danh tính (Authentication).
  * **Quy trình TLS Handshake ở mức cao**:
    1. **ClientHello**: Gửi TLS version, Cipher Suites hỗ trợ, chuỗi ngẫu nhiên.
    2. **ServerHello & Certificate**: Server chọn Cipher Suite, gửi Chứng chỉ số SSL Certificate (chứa Public Key của server).
    3. **Xác thực Certificate**: Client dùng Public Key của Root CA có sẵn trong OS để giải mã và xác thực chữ ký số của chứng chỉ.
    4. **Trao đổi khóa (Key Exchange)**: Hai bên sử dụng thuật toán mã hóa bất đối xứng (ECDHE) để tính toán ra một chìa khóa chung (**Symmetric Session Key**).
    5. **Truyền dữ liệu mã hóa**: Hai bên chuyển sang mã hóa toàn bộ dữ liệu HTTP bằng Session Key đối xứng vì tốc độ nhanh hơn nhiều lần so với mã hóa bất đối xứng.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Cấu hình SSL Termination trên Load Balancer và gia hạn chứng chỉ số cho cổng thanh toán viễn thông/ngân hàng.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [SSL, TLS, HTTPS Explained - ByteByteGo](https://www.youtube.com/watch?v=j9QmMEWmcfo) *(Giải thích cực kỳ dễ hiểu về cơ chế mã hóa bất đối xứng và đối xứng)*
  * 🎥 [SSL, TLS, HTTP, HTTPS Explained - PowerCert Animated](https://www.youtube.com/watch?v=hExRDVZHhig) *(Mô phỏng toàn bộ luồng bắt tay và xác thực chứng chỉ số)*
  * 📄 [RFC 8446 - The Transport Layer Security (TLS) Protocol Version 1.3](https://datatracker.ietf.org/doc/html/rfc8446)
* 💻 **Bài Lab thực hành**:
  ```bash
  curl -Iv https://viettel.com.vn        # Xem quá trình đàm phán TLS và Certificate
  openssl s_client -connect viettel.com.vn:443 -tls1_3
  ```
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 33 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *HTTPS khác HTTP ở đâu? TLS handshake diễn ra ra sao ở mức cao?*
  > **Trả lời**: HTTPS là HTTP chạy trên kênh mã hóa bảo mật TLS. Quá trình TLS handshake diễn ra qua việc đàm phán thuật toán mã hóa, xác minh chứng chỉ số SSL của server qua các Root CA, sau đó dùng mật mã bất đối xứng để thỏa thuận ra một khóa đối xứng dùng chung (Session Key). Toàn bộ dữ liệu ứng dụng sau đó được mã hóa bằng khóa đối xứng này để đảm bảo hiệu năng cao nhất.

---

## 📅 NGÀY 14: Cân bằng tải hạ tầng: Phân biệt chuyên sâu Load Balancer L4 vs L7
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết**:
  * **L4 Load Balancer (Transport Layer)**:
    * Định tuyến dựa trên `IP:Port` (TCP/UDP), không đọc và không giải mã dữ liệu payload.
    * Tốc độ cực nhanh, chịu tải hàng triệu kết nối, tiêu tốn rất ít CPU/RAM.
    * Dùng làm tầng đón đầu ngoài cùng hoặc cân bằng tải cho các cụm Database. Ví dụ: HAProxy (mode TCP), LVS, IPVS, AWS NLB.
  * **L7 Load Balancer (Application Layer)**:
    * Phân tích sâu nội dung HTTP: URL path (`/api`, `/static`), Header, Cookies.
    * Hỗ trợ định tuyến thông minh cho microservices, SSL Termination, URL rewrite, Rate limiting.
    * Tiêu tốn nhiều tài nguyên CPU hơn. Ví dụ: Nginx, HAProxy (mode HTTP), Traefik, AWS ALB.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Thiết kế kiến trúc High Availability (HA) chịu tải hàng triệu request: Phối hợp L4 ở tầng ngoài đón traffic khổng lồ và L7 ở tầng trong để phân loại request cho các Pod.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Load balancing in Layer 4 vs Layer 7 with HAPROXY Examples - Hussein Nasser](https://www.youtube.com/watch?v=aKMLgFVxZYk) *(Mổ xẻ sâu bản chất L4 vs L7 kèm ví dụ HAProxy)*
  * 🎥 [What is a LOAD BALANCER really about? - ByteByteGo](https://www.youtube.com/watch?v=LQuuoHTyYz8) *(Tổng quan các mô hình và thuật toán cân bằng tải)*
  * 📄 [HAProxy Architecture Guide](https://www.haproxy.org/)
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 35 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Load balancer L4 và L7 khác nhau ở đâu? Khi nào nên chọn loại nào?*
  > **Trả lời**: L4 hoạt động ở tầng giao vận, chỉ nhìn thấy IP và Port, không đọc payload nên tốc độ rất cao và nhẹ tài nguyên, dùng khi cần throughput cực lớn hoặc cho các giao thức phi HTTP như Database cluster. L7 hoạt động ở tầng ứng dụng, đọc được HTTP Header, URL path và Cookie, dùng khi cần định tuyến microservices, xử lý session cookie hoặc SSL Termination.

---

# MODULE 6: MẠNG ẢO HÓA CLOUD, SDN & CONTAINER (NGÀY 15 – 16)

## 📅 NGÀY 15: Mạng ảo hóa Data Center: Provider Network (VLAN) vs Overlay Network (VXLAN)
* ⏱️ **Thời lượng**: 75 phút
* 🧠 **Kiến thức cần biết (Đặc sản Viettel Cloud - OpenStack Neutron)**:
  * **Provider Network**:
    * Mạng ảo gắn trực tiếp vào hạ tầng mạng vật lý của Data Center (thường dùng **VLAN 802.1Q**).
    * Gói tin không bị bọc thêm header nên đạt hiệu năng tối đa.
    * Nhược điểm: Giới hạn 4096 VLAN và phải cấu hình switch vật lý khi tạo dải mạng mới.
  * **Overlay Network (Tenant Network - VXLAN / Geneve)**:
    * Mạng ảo chạy phủ (chồng) lên hạ tầng mạng L3 vật lý.
    * Cơ chế **L2 over L3**: Đóng gói toàn bộ Ethernet Frame của máy ảo vào bên trong gói tin Layer 3 UDP (cổng 4789).
    * Khắc phục triệt để giới hạn 4096 VLAN nhờ trường định danh **VNI 24-bit (hỗ trợ hơn 16 triệu mạng riêng biệt)**.
    * Cho phép máy ảo (VM) thực hiện **Live Migration** sang các máy chủ vật lý khác tủ rack/Data Center mà không bị đổi địa chỉ IP.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Viettel Cloud vận hành hạ tầng OpenStack hơn 3.500 máy chủ vật lý, mạng nội bộ khách hàng hoàn toàn chạy trên công nghệ VXLAN Overlay.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [VXLAN overlay networks with Open vSwitch - David Bombal](https://www.youtube.com/watch?v=tnSkHhsLqpM) *(Thực hành chi tiết cấu hình VXLAN trên Open vSwitch)*
  * 📄 [OpenStack Neutron: Provider Networks vs Overlay Networks](https://docs.openstack.org/neutron/latest/admin/intro-overlay.html)
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 65 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *Provider network và overlay network khác nhau thế nào trong OpenStack? Vì sao Cloud lớn cần VXLAN?*
  > **Trả lời**: Provider network gắn trực tiếp vào hạ tầng VLAN vật lý của Data Center, hiệu năng cao nhưng bị giới hạn 4096 VLAN. Overlay network sử dụng công nghệ đóng gói VXLAN L2 over L3 UDP, cho phép tạo tới 16 triệu mạng cô lập cho hàng chục nghìn khách hàng mà không cần can thiệp cấu hình switch vật lý, hỗ trợ máy ảo di chuyển (Live Migration) linh hoạt giữa các node.

---

## 📅 NGÀY 16: Mạng Container & Kubernetes: CNI & Service Types
* ⏱️ **Thời lượng**: 90 phút
* 🧠 **Kiến thức cần biết**:
  * **CNI (Container Network Interface)**: Chuẩn giao tiếp của CNCF điều khiển cách cấp phát IP và cấu hình tuyến đường cho Container.
  * **Cơ chế hoạt động bên dưới Linux**:
    * Khi Pod sinh ra, CNI tạo một cặp dây mạng ảo (**Veth Pair**): Một đầu gắn vào Network Namespace của Pod (thành `eth0`), đầu còn lại cắm vào **Linux Bridge** hoặc routing table của máy chủ Host.
    * Các CNI phổ biến: **Flannel** (dùng VXLAN), **Calico** (dùng giao thức định tuyến BGP đạt hiệu năng native), **Cilium** (dùng eBPF tối ưu hóa sâu trong nhân Linux).
  * **4 loại Service công khai ứng dụng trong Kubernetes**:
    1. **ClusterIP**: Mặc định, cấp Virtual IP nội bộ, chỉ truy cập được bên trong cụm K8s.
    2. **NodePort**: Mở một cổng tĩnh (30000–32767) trên tất cả các Worker Node để nhận traffic ngoài.
    3. **LoadBalancer**: Tích hợp hạ tầng Cloud để tự động cấp một Load Balancer L4 có Public IP bên ngoài trỏ vào NodePort.
    4. **Ingress**: Reverse Proxy L7 (Nginx/Traefik) định tuyến theo Tên miền (Host) và Đường dẫn (Path) tới các ClusterIP, xử lý SSL Termination tập trung.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Thiết kế mạng cho nền tảng Viettel Managed Kubernetes (VKS).
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Kubernetes Explained in 6 Minutes \| k8s Architecture - ByteByteGo](https://www.youtube.com/watch?v=TlHvYWVUZyc) *(Kiến trúc Kubernetes và mô hình dịch vụ mạng)*
  * 🎥 [Container Networking From Scratch - Hussein Nasser / Kristen Jacobs](https://www.youtube.com/watch?v=6v_BDHIgOY8) *(Cơ chế Veth Pair, Bridge và Network Namespace trong Linux)*
  * 📄 [Kubernetes Service Architecture Guide](https://kubernetes.io/docs/concepts/services-networking/service/)
* ❓ **Câu hỏi phỏng vấn Viettel Cloud (Câu 52 & 56 trong [[viettel_cloud_questions]])**:
  > [!QUESTION] **Phỏng vấn**
  > *ClusterIP, NodePort, LoadBalancer, Ingress khác nhau thế nào? CNI có vai trò gì?*
  > **Trả lời**: ClusterIP là IP nội bộ chỉ dùng cho liên lạc giữa các Pod. NodePort mở một cổng trên toàn bộ node để nhận traffic từ ngoài. LoadBalancer cấp một Public IP L4 chuyên dụng trên Cloud. Ingress là Proxy L7 định tuyến tên miền, path và SSL cho nhiều dịch vụ dùng chung một IP. CNI là tiêu chuẩn chuẩn hóa việc cấp phát IP và nối cặp veth pair giữa Pod với mạng host.

---

# MODULE 7: GỠ LỖI MẠNG END-TO-END TỔNG HỢP (NGÀY 17)

## 📅 NGÀY 17: Quy trình 4 bước kiểm tra End-to-End khi dịch vụ mất kết nối
* ⏱️ **Thời lượng**: 90 phút
* 🧠 **Kiến thức cần biết**:
  * Kỹ năng gỡ lỗi hệ thống từ dưới lên trên (**Bottom-Up Troubleshooting**): Đi từ tầng mạng vật lý lên tới ứng dụng và mã nguồn.
* 🎯 **Tại sao cần (Góc nhìn Viettel Cloud)**:
  * Câu hỏi quyết định năng lực thực chiến trong vòng phỏng vấn kỹ thuật của Viettel Cloud.
* 📚 **Link Video bài giảng đã xác minh**:
  * 🎥 [Top 5 Network Troubleshooting Commands - NetworkChuck](https://www.youtube.com/watch?v=Jfvg3CS1X3A) *(Các lệnh kiểm tra mạng và khoanh vùng sự cố thực tế)*
  * 📄 [tcpdump(1) - Official Manual Page](https://www.tcpdump.org/manpages/tcpdump.1.html)
* 💻 **Kịch bản thực chiến (Câu 45 trong [[viettel_cloud_questions]])**:
  > [!IMPORTANT] **Tình huống phỏng vấn**
  > *"Khách hàng báo website của Viettel Cloud không thể truy cập được, bạn kiểm tra end-to-end từ client tới backend theo thứ tự nào?"*
  
  **Quy trình 4 bước trả lời ăn điểm tuyệt đối**:
  1. **Tầng 3 (Network / IP - Thông tuyến mạng)**: 
     * Dùng `ping <IP>` kiểm tra thông mạng và packet loss.
     * Dùng `traceroute -n <IP>` kiểm tra xem gói tin có bị rớt ở hop router nào không. Kiểm tra bảng định tuyến `ip route`.
  2. **Tầng 4 (Transport / Port - Thông cổng kết nối)**:
     * Dùng `nc -zv <IP> 80` (hoặc 443) kiểm tra port dịch vụ có mở không.
     * Nếu port đóng/timeout: Kiểm tra Firewall máy chủ (`sudo iptables -L -n -v`), Security Group trên Cloud hoặc Access Control List (ACL).
  3. **Tầng 7 (Application / HTTP - Phản hồi ứng dụng)**:
     * Dùng `curl -Iv http(s)://<IP>:<PORT>` xem mã trạng thái trả về:
       * Mã `502 Bad Gateway`: Nginx/Proxy sống nhưng cụm backend phía sau bị chết.
       * Mã `504 Gateway Timeout`: Backend xử lý quá lâu hoặc treo kết nối DB.
       * Mã `403 Forbidden`: Lỗi phân quyền thư mục hoặc chặn IP.
  4. **Tầng Máy chủ (Host / Service - Kiểm tra nội tại server)**:
     * SSH vào server backend:
       * `systemctl status <service>`: Kiểm tra trạng thái tiến trình.
       * `sudo ss -tulnp`: Xem Nginx/App đang lắng nghe trên `0.0.0.0` hay bị gắn nhầm vào `127.0.0.1`.
       * `dmesg -T | grep -i oom`: Kiểm tra xem process có bị OOM-Killer tiêu diệt không.
       * `tail -n 50 /var/log/<service>/error.log`: Đọc trực tiếp file log lỗi.

---

## 🗺️ BẢNG ĐỐI CHIẾU CHÉO 17 NGÀY MẠNG VỚI ĐỀ THI VIETTEL CLOUD

| Câu hỏi trong [[viettel_cloud_questions]] | Nội dung câu hỏi nguyên văn | Ngày học trong lộ trình |
| :---: | :--- | :---: |
| **Câu 26** | Bạn kiểm tra firewall trên Linux theo checklist nào? | **Ngày 11** |
| **Câu 27** | Một port đang listen nhưng từ ngoài vẫn không truy cập được; bạn debug thế nào? | **Ngày 07** |
| **Câu 31** | TCP 3-way handshake là gì? | **Ngày 06** |
| **Câu 32** | Khi DNS lỗi, bạn xác định vấn đề nằm ở client, resolver hay authoritative server thế nào? | **Ngày 09** |
| **Câu 33** | HTTPS khác HTTP ở đâu? TLS handshake diễn ra ra sao ở mức cao? | **Ngày 13** |
| **Câu 34** | NAT, SNAT, DNAT khác nhau thế nào? | **Ngày 10** |
| **Câu 35** | Load balancer L4 và L7 khác nhau ở đâu? | **Ngày 14** |
| **Câu 36** | CIDR, subnet mask, VLAN là gì? | **Ngày 03 & Ngày 04** |
| **Câu 37** | Asymmetric routing là gì và vì sao nó nguy hiểm? | **Ngày 08** |
| **Câu 38** | Private IP, public IP, NAT gateway, bastion host dùng trong trường hợp nào? | **Ngày 02** |
| **Câu 45** | Một service “không truy cập được”, bạn kiểm tra end-to-end từ client tới backend thế nào? | **Ngày 17** |
| **Câu 52** | ClusterIP, NodePort, LoadBalancer, Ingress khác nhau thế nào? | **Ngày 16** |
| **Câu 56** | CNI và CSI là gì? (Trọng tâm CNI) | **Ngày 16** |
| **Câu 65** | Provider network và overlay network khác nhau thế nào? | **Ngày 15** |
| **Câu 94** | Security groups, firewall rules, network policy khác nhau thế nào? | **Ngày 12** |
