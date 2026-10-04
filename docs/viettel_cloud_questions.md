---
title: "BỘ CÂU HỎI PHỎNG VẤN & ÔN THI VIETTEL CLOUD / DEVOPS 2026"
tags:
  - viettel-cloud
  - viettel-digital-talent
  - openstack
  - kubernetes
  - networking
  - devops
  - interview-prep
date: 2026-09-09
source: "1043152640-viettel-dsai-internship-application-insights-2026.pdf (Trang 19–27)"
---

# ☁️ BỘ CÂU HỎI PHỎNG VẤN & ÔN THI VIETTEL CLOUD / DEVOPS
> *Tài liệu chuẩn hóa trích xuất từ tài liệu tuyển dụng Viettel Digital Talent 2026 & Tuyển dụng kỹ sư Viettel IDC / Viettel Cloud (Định dạng tối ưu cho Obsidian)*

---

## I. TỔNG QUAN & INSIGHT TUYỂN DỤNG VIETTEL CLOUD

### 1. Bối cảnh & Chương trình tuyển dụng
* **Viettel Digital Talent 2026 – Cloud**:
  * Track thực tập Cloud kéo dài 6 tháng (3 tháng đào tạo bán thời gian + 3 tháng tham gia dự án toàn thời gian).
  * Mức hỗ trợ: Tối đa 10 triệu đồng/tháng.
  * Chỉ tiêu: 50 chỉ tiêu.
  * Hình thức thi: **IQ + Tiếng Anh TOEIC + Chuyên môn**.
  * Trọng tâm công khai: *Cloud/DevSecOps, RCA, DevOps, microservices, cloud-native, Ansible, Terraform, auto scaling, auto healing, Linux, Git, networking basics, và 1 ngôn ngữ như C/Python/Golang/Bash*.
* **Vị trí tuyển dụng chính thức tại Viettel / Viettel IDC**:
  * *Cloud OpenStack Engineer, Cloud VMware Engineer, Senior Cloud Engineer, DevOps Engineer, Presale System-Cloud, Distinguished Engineer - Cloud, Cloud Engineer (Storage)*.
  * Yêu cầu chung: *Linux, networking, microservices, Docker/Kubernetes, CI/CD, monitoring/logging, automation bằng Ansible/Terraform, capacity planning, performance tuning, migration/POC, L3 support, cloud security, backup/DR, và tư duy HA/resilience*. Yêu cầu TOEIC từ 550+ đến 650+.

### 2. Insight công nghệ cốt lõi tại Viettel Cloud
* **Hướng đi Open-Source Cloud-Native**:
  * Viettel Cloud lấy **OpenStack** làm công nghệ lõi, tự xây dựng hệ sinh thái IaaS/PaaS gồm VM, Storage, Network, Kubernetes, Database.
  * Theo CNCF và OpenInfra, Viettel vận hành một trong những hạ tầng OpenStack + Kubernetes mã nguồn mở lớn nhất Đông Nam Á:
    * **15 private cloud clusters**
    * **Hơn 3.500 physical servers**
    * **Hơn 112.000 vCPU cores**
    * **Hơn 1.200 TB RAM**
    * **Hơn 11.000 TB (11 PB) storage**
* > [!WARNING] **LƯU Ý QUAN TRỌNG KHI PHỎNG VẤN**
  > Đi phỏng vấn Cloud ở Viettel nếu chỉ ôn AWS/GCP cơ bản là **thiếu hụt rất lớn**. Viettel công khai thiên nặng về **OpenStack / Kubernetes / Ceph / Private Cloud / Hybrid Cloud**.

### 3. Phong cách trả lời "ăn điểm" chuẩn Production
Nói theo ngôn ngữ vận hành thực chiến: **SLA/SLO, capacity, High Availability (HA), resilience, rollback, blast radius, RCA (Root Cause Analysis), RTO/RPO, compliance, cost optimization, standards, auto scaling, auto healing**.

---

## II. 10 CÂU HỎI NÓNG NHẤT (MUST-KNOW) & ĐÁP ÁN GỢI Ý

> [!TIP] **Chiến lược ôn tập**
> Nếu có ít thời gian ôn tập, hãy khóa và trả lời trôi chảy 10 câu hỏi này trước khi vào phòng phỏng vấn.

### 1. Container khác VM thế nào?
* **VM (Virtual Machine):** Ảo hóa ở **tầng phần cứng (Hardware-level)** thông qua Hypervisor (Type 1 hoặc 2). Mỗi VM mang theo một Hệ điều hành khách (Guest OS) riêng biệt, tốn nhiều tài nguyên (vài GB RAM/disk) và khởi động mất vài chục giây đến vài phút.
* **Container:** Ảo hóa ở **tầng hệ điều hành (OS-level)**. Các container dùng chung **Linux Kernel** của máy chủ host, cô lập không gian người dùng bằng Linux `namespaces` (pid, net, mnt, ipc, uts) và giới hạn tài nguyên bằng `cgroups`. Dung lượng nhẹ (vài chục MB) và khởi động trong vài mili-giây.

### 2. Deployment, StatefulSet, DaemonSet khác nhau ra sao?
* **Deployment:** Quản lý các ứng dụng **không trạng thái (Stateless)** (Web frontend, API backend). Các Pod có vai trò như nhau, có thể bị xóa và tạo mới ngẫu nhiên với IP và tên ngẫu nhiên.
* **StatefulSet:** Quản lý ứng dụng **có trạng thái (Stateful)** (Database: MySQL, Postgres, MongoDB, Kafka, ZooKeeper). Các Pod được định danh duy nhất theo thứ tự tuần tự (tên `pod-0`, `pod-1`), gắn cố định với Persistent Volume (PVC), khởi động và terminate theo thứ tự ngặt nghèo.
* **DaemonSet:** Đảm bảo **mỗi Worker Node trong cụm chạy đúng 1 bản sao của Pod**. Thường dùng cho các dịch vụ nền cấp hạ tầng: Thu thập log (Fluentd/Filebeat), giám sát phần cứng (Node Exporter), hoặc CNI plugin mạng (Calico/Cilium).

### 3. OpenStack có những service lõi nào và từng service làm gì?
* **Keystone (Identity):** Xác thực, cấp phát token và phân quyền truy cập cho người dùng và các service khác.
* **Nova (Compute):** Quản lý vòng đời máy ảo (tạo, khởi động, tắt, live migration qua Hypervisor KVM/QEMU).
* **Neutron (Networking):** Cung cấp mạng ảo (VLAN, VXLAN/Overlay, Router ảo, Floating IP, Security Group).
* **Cinder (Block Storage):** Cung cấp ổ đĩa khối gắn vào máy ảo (thường tích hợp cụm Ceph RBD).
* **Glance (Image Service):** Lưu trữ và quản lý template hệ điều hành (qcow2, raw, ISO).
* **Swift (Object Storage):** Lưu trữ đối tượng không cấu trúc (tương tự AWS S3).
* **Horizon (Dashboard):** Giao diện web portal quản trị đồ họa.

### 4. VMware và OpenStack khác nhau ở đâu, khi nào chọn cái nào?
* **VMware:** Giải pháp phần mềm thương mại đóng gói (Enterprise Commercial), độ ổn định cực cao, giao diện và công cụ quản trị hoàn thiện (vSphere, vCenter), hỗ trợ chính hãng 24/7. Nhược điểm: Chi phí bản quyền (licensing/subscription) cực đắt. Chọn khi: Khách hàng truyền thống (ngân hàng, cơ quan nhà nước), đội ngũ kỹ thuật mỏng, cần sự an toàn tuyệt đối.
* **OpenStack:** Nền tảng mã nguồn mở (Open Source), hoàn toàn miễn phí bản quyền phần mềm, tránh bị khóa nhà cung cấp (Vendor lock-in), khả năng tùy biến sâu theo kiến trúc viễn thông lớn. Nhược điểm: Độ phức tạp triển khai và vận hành rất cao, đòi hỏi đội ngũ kỹ sư nội bộ có trình độ L3 giỏi. Chọn khi: Doanh nghiệp quy mô lớn muốn làm chủ công nghệ, xây dựng Private/Public Cloud hàng nghìn node như Viettel Cloud.

### 5. HPA, auto scaling và auto healing hoạt động thế nào?
* **HPA (Horizontal Pod Autoscaler):** Tự động co giãn số lượng bản sao Pod dựa trên chỉ số sử dụng tài nguyên (CPU, RAM qua Metrics Server) hoặc Custom Metrics (RPS, Queue depth). Thuật toán: $\text{Desired Replicas} = \lceil \text{Current Replicas} \times \frac{\text{Current Metric}}{\text{Desired Metric}} \rceil$.
* **Auto Scaling (Cluster Autoscaler):** Tự động thêm/bớt Node vật lý hoặc VM vào cụm khi Pod rơi vào trạng thái `Pending` do thiếu tài nguyên.
* **Auto Healing:** Khả năng tự phát hiện và phục hồi: Nếu Pod chết, Controller Manager lập tức tạo Pod mới thay thế để duy trì số lượng `replicas`. Nếu Node chết, K8s tự động dời các Pod sang Node khỏe mạnh (Eviction).

### 6. Bạn debug một service trên K8s đang CrashLoopBackOff ra sao?
* **Quy trình 4 bước:**
  1. `kubectl describe pod <pod-name>`: Xem sự kiện (Events) ở cuối log (xem có lỗi OOMKilled, fail Liveness Probe, hay kéo image thất bại không).
  2. `kubectl logs <pod-name> --previous`: Xem log của lần crash gần nhất (thường ứng dụng bị lỗi code, thiếu biến môi trường hoặc không kết nối được Database trước khi tắt).
  3. Kiểm tra Exit Code:
     * `Exit Code 137`: Bị Linux **OOM Killer** tiêu diệt (vượt quá `limits.memory`).
     * `Exit Code 1`: Lỗi ứng dụng (Application crash, panic, unhandled exception).
     * `Exit Code 143` hoặc `130`: Nhận tín hiệu SIGTERM/SIGINT.
  4. Kiểm tra ConfigMap / Secret / Database dependency: Xác minh ứng dụng có đang chờ phụ thuộc ngoài nào không.

### 7. Bạn thiết kế CI/CD cho microservice chạy trên K8s thế nào?
* **Pipeline chuẩn GitOps:**
  * **CI (GitLab CI / GitHub Actions):** Code commit $\rightarrow$ Lint & Unit test $\rightarrow$ SonarQube (Quét chất lượng code) $\rightarrow$ Trivy (Quét lỗ hổng image) $\rightarrow$ Build Docker image đa tầng (Multi-stage build) $\rightarrow$ Đánh tag theo Git Commit SHA $\rightarrow$ Push lên Harbor Registry $\rightarrow$ Cập nhật image tag vào Git Repository cấu hình (Config Repo).
  * **CD (ArgoCD / FluxCD - GitOps):** ArgoCD theo dõi Git Config Repo; khi thấy commit mới sẽ tự động đồng bộ (Sync) và triển khai lên K8s Cluster theo chiến lược **Canary** (dùng Argo Rollouts) hoặc **Rolling Update**, giám sát tỷ lệ lỗi trước khi chuyển 100% traffic.

### 8. RCA cho một incident làm tụt SLA sẽ viết ra sao?
* **Một bản RCA (Root Cause Analysis) chuẩn gồm 6 phần:**
  1. **Executive Summary:** Tóm tắt ngắn gọn sự cố, thời gian gián đoạn, dịch vụ ảnh hưởng và mức độ vi phạm SLA.
  2. **Timeline:** Lịch sử chi tiết theo từng phút (T0: Sự cố bắt đầu $\rightarrow$ T1: Cảnh báo kích hoạt $\rightarrow$ T2: Kỹ sư tiếp nhận $\rightarrow$ T3: Xác định nguyên nhân $\rightarrow$ T4: Khắc phục xong).
  3. **Root Cause (Nguyên nhân gốc rễ):** Áp dụng phương pháp **5 Whys** để tìm ra nguyên nhân sâu xa nhất (do thiếu monitor, bug code, hay quy trình test chưa bao phủ).
  4. **Impact:** Thống kê định lượng (số lượng user ảnh hưởng, số request lỗi 5xx, doanh thu tổn thất).
  5. **Resolution:** Các biện pháp tạm thời đã thực hiện để khôi phục dịch vụ nhanh nhất.
  6. **Action Items (Phòng ngừa tái diễn):** Danh sách đầu việc cụ thể, có người chịu trách nhiệm và deadline (ví dụ: bổ sung alert, giới hạn timeout, tăng dung lượng pool).

### 9. Bạn thiết kế HA + DR cho hệ thống phục vụ hàng triệu user thế nào?
* **High Availability (HA) nội bộ Data Center:**
  * Mô hình Multi-AZ (tối thiểu 3 Availability Zones).
  * Tầng mạng: Cặp Load Balancer Active-Active (Keepalived/VRRP + BGP Anycast).
  * Tầng ứng dụng: Microservices chạy trên K8s trải đều các Zone (dùng `topologySpreadConstraints`), tự động co giãn bằng HPA.
  * Tầng dữ liệu: Database Cluster chạy Master-Slave có cơ chế tự động Failover (như Patroni cho PostgreSQL hoặc Galera cho MySQL). Cache phân tán Redis Cluster.
* **Disaster Recovery (DR) giữa 2 Data Center khác biệt địa lý:**
  * Mô hình **Active-Passive (Warm Standby)** hoặc **Active-Active** dùng DNS GSLB (Global Server Load Balancing).
  * Đồng bộ cơ sở dữ liệu: Dùng Async Replication liên Data Center để tối ưu độ trễ mạng.
  * Cam kết chỉ số: Định nghĩa rõ **RTO** (thời gian khôi phục tối đa) và **RPO** (lượng dữ liệu chấp nhận mất mát tối đa).

### 10. Một khách hàng muốn migrate khỏi VMware lên private cloud/open-source cloud, bạn bắt đầu từ đâu?
* **Quy trình 5 giai đoạn:**
  1. **Assessment (Khảo sát & Đánh giá):** Kiểm kê toàn bộ tài nguyên VM (CPU, RAM, Disk, IOPS, Network), phân loại hệ điều hành (Linux, Windows) và tính tương thích của ứng dụng.
  2. **TCO / ROI Analysis:** Tính toán chi phí bản quyền tiết kiệm được so với chi phí đào tạo và vận hành OpenStack.
  3. **Xây dựng môi trường thử nghiệm (POC):** Chuyển thử một số VM không quan trọng (Dev/Test) để đo kiểm hiệu năng và độ ổn định.
  4. **Lựa chọn công cụ chuyển đổi:** Chuyển đổi định dạng ổ đĩa ảo từ `vmdk` sang `qcow2`/`raw` bằng công cụ `qemu-img` hoặc sử dụng các giải pháp chuyên dụng như Cloudbase Cora, Virt-v2v.
  5. **Migration Waves & Cutover Plan:** Chia các VM theo từng đợt di chuyển (Waves), thực hiện đồng bộ trước (Pre-copy), chọn thời điểm bảo trì đêm để cutover DNS và có sẵn phương án rollback nếu phát sinh lỗi.

---

## III. BỘ 120 CÂU HỎI CLOUD SÁT NHẤT CHO VIETTEL

### Nhóm A: Mở màn, Fit, Project, Hành vi (Câu 1 – 15)
1. Hãy giới thiệu bản thân trong 60–90 giây theo hướng Cloud.
2. Vì sao bạn chọn Viettel Cloud/Viettel IDC thay vì một công ty cloud khác?
3. Vì sao bạn muốn làm private/hybrid cloud thay vì chỉ public cloud?
4. Bạn hợp nhất với role nào hơn: Cloud Engineer, DevOps, OpenStack, VMware hay Presale?
5. Project cloud nào thể hiện năng lực của bạn rõ nhất?
6. Hãy kể một incident production bạn từng xử lý và cách bạn làm RCA.
7. Hệ thống lớn nhất bạn từng vận hành có quy mô ra sao?
8. Một việc thủ công bạn đã tự động hóa là gì?
9. Lỗi Linux/Kubernetes khó nhất bạn từng gặp là gì?
10. Trong project gần nhất, bạn làm phần nào và phối hợp với ai?
11. Sai lầm kỹ thuật lớn nhất bạn từng mắc trong triển khai hệ thống là gì?
12. Bạn có thể làm việc onsite tại Hà Nội/HCM và tham gia on-call không?
13. Mức lương kỳ vọng của bạn là bao nhiêu và vì sao?
14. Hãy giải thích project cloud gần nhất của bạn cho một người không kỹ thuật.
15. Nếu được nhận, kế hoạch 30-60-90 ngày đầu của bạn là gì?

---

### Nhóm B: Linux, Hệ điều hành, Scripting (Câu 16 – 30)
16. Process và thread khác nhau thế nào?
17. Zombie process và orphan process là gì?
18. Load average trên Linux thực sự phản ánh điều gì?
19. Khi top cho thấy CPU cao, bạn đọc số liệu thế nào để tìm root cause?
20. RSS, VSS, cache, buffer khác nhau thế nào?
21. File descriptor là gì, vì sao hết FD làm dịch vụ lỗi?
22. Một service chạy bằng systemd bị fail liên tục, bạn debug theo thứ tự nào?
23. Khi nào dùng grep, awk, sed?
24. Hãy viết hoặc mô tả script Bash/Python để parse access log và đếm 5xx theo phút.
25. cron khác systemd timer ra sao?
26. Bạn kiểm tra firewall trên Linux theo checklist nào?
27. Một port đang listen nhưng từ ngoài vẫn không truy cập được; bạn debug thế nào?
28. Ổ đĩa đầy đột ngột trên server Linux, bạn điều tra ra sao?
29. Hãy mô tả health-check script cho một service web có phụ thuộc database.
30. Bạn tối ưu một script automation chạy chậm và dễ lỗi như thế nào?

---

### Nhóm C: Networking, Storage, Virtualization Cơ bản (Câu 31 – 45) — [CÓ ĐÁP ÁN CHI TIẾT]

#### Câu 31. TCP 3-way handshake là gì?
> [!NOTE] **Đáp án**
> * Là quá trình thiết lập kết nối tin cậy 2 chiều giữa Client và Server ở tầng Transport:
>   1. **SYN:** Client gửi `[SYN]`, Sequence number $Seq = X$.
>   2. **SYN-ACK:** Server gửi lại `[SYN, ACK]`, $Seq = Y$, $Ack = X + 1$.
>   3. **ACK:** Client gửi `[ACK]`, $Ack = Y + 1 \rightarrow$ Kết nối chuyển sang trạng thái `ESTABLISHED`.
> * Mục đích: Đồng bộ Sequence Number giữa hai bên để kiểm soát mất gói và ghép dữ liệu đúng thứ tự.

#### Câu 32. Khi DNS lỗi, bạn xác định vấn đề nằm ở client, resolver hay authoritative server thế nào?
> [!NOTE] **Đáp án**
> Dùng công cụ `dig` để khoanh vùng:
> 1. **Kiểm tra Client:** `dig domain.com` dùng resolver mặc định trong `/etc/resolv.conf`. Nếu lỗi, kiểm tra cấu hình mạng local.
> 2. **Kiểm tra Resolver:** `dig @8.8.8.8 domain.com`. Nếu thành công mà truy vấn local lỗi $\rightarrow$ Resolver nội bộ / DNS nhà mạng bị hỏng.
> 3. **Kiểm tra Authoritative Server:** Truy vấn trực tiếp Name Server gốc `dig @ns1.domain.com domain.com` hoặc dùng `dig +trace domain.com`. Nếu lỗi từ tầng này $\rightarrow$ Server DNS gốc của bên quản lý tên miền chết hoặc cấu hình sai bản ghi.

#### Câu 33. HTTPS khác HTTP ở đâu? TLS handshake diễn ra ra sao ở mức cao?
> [!NOTE] **Đáp án**
> * HTTP gửi dữ liệu bản rõ (cổng 80). HTTPS = HTTP + TLS/SSL (cổng 443), bảo đảm tính bảo mật, toàn vẹn và xác thực danh tính.
> * TLS Handshake mức cao:
>   1. `ClientHello`: Gửi TLS version, Cipher Suites hỗ trợ.
>   2. `ServerHello`: Server chọn Cipher Suite và gửi **SSL Certificate** (chứa Public Key).
>   3. Client kiểm tra tính hợp lệ của Certificate qua tổ chức CA gốc.
>   4. Hai bên dùng mã hóa bất đối xứng để thỏa thuận ra một khóa chung (**Symmetric Session Key**).
>   5. Mọi dữ liệu sau đó được mã hóa bằng khóa đối xứng này nhằm tối ưu hiệu năng.

#### Câu 34. NAT, SNAT, DNAT khác nhau thế nào?
> [!NOTE] **Đáp án**
> * **NAT (Network Address Translation):** Kỹ thuật sửa đổi địa chỉ IP trong header của gói tin khi đi qua gateway.
> * **SNAT (Source NAT):** Sửa đổi **IP nguồn**. Dùng khi máy ảo trong dải Private cần đi ra ngoài Internet (Bản chất của NAT Gateway).
> * **DNAT (Destination NAT):** Sửa đổi **IP đích**. Dùng khi người dùng từ ngoài Internet cần kết nối tới máy chủ nằm trong mạng Private (Port Forwarding, Load Balancer).

#### Câu 35. Load balancer L4 và L7 khác nhau ở đâu?
> [!NOTE] **Đáp án**
> * **L4 Load Balancer (Transport Layer):** Chỉ xem xét `IP:Port`, không đọc nội dung gói tin. Tốc độ cực nhanh, tốn ít CPU, dùng để đón traffic khủng hoặc các giao thức non-HTTP (DB, TCP). Ví dụ: HAProxy (mode TCP), IPVS, AWS NLB.
> * **L7 Load Balancer (Application Layer):** Phân tích dữ liệu ứng dụng (URL, Header, Cookie). Hỗ trợ định tuyến thông minh theo path, SSL Termination, caching. Tốn nhiều CPU hơn. Ví dụ: Nginx, Traefik, AWS ALB.

#### Câu 36. CIDR, subnet mask, VLAN là gì?
> [!NOTE] **Đáp án**
> * **CIDR (Classless Inter-Domain Routing):** Định dạng địa chỉ IP kèm tiền tố bit (ví dụ `/24`, `/26`) giúp phân chia mạng linh hoạt, khắc phục sự lãng phí của các lớp mạng cổ điển (Class A, B, C).
> * **Subnet mask:** Dãy số 32 bit (dạng `255.255.255.0`) dùng phép logic `AND` với địa chỉ IP để tách biệt phần Network ID và Host ID.
> * **VLAN (Virtual LAN - 802.1Q):** Phân chia một switch vật lý thành nhiều mạng L2 ảo biệt lập, phân tách broadcast domain ở tầng 2 bằng VLAN ID (1 – 4094).

#### Câu 37. Asymmetric routing là gì và vì sao nó nguy hiểm?
> [!NOTE] **Đáp án**
> * **Định nghĩa:** Hiện tượng định tuyến bất đối xứng: Chiều đi từ Client $\rightarrow$ Server đi qua Router/Firewall A, nhưng chiều phản hồi từ Server $\rightarrow$ Client lại đi qua Router/Firewall B.
> * **Mức độ nguy hiểm:** Các tường lửa hiện đại là **Stateful Firewall** (quản lý bảng `conntrack`). Chiều về qua Firewall B không thấy gói tin bắt tay `SYN` khởi tạo nên sẽ tự động coi gói tin là bất hợp pháp và **DROP**, dẫn đến đứt kết nối hoặc timeout bí ẩn.

#### Câu 38. Private IP, public IP, NAT gateway, bastion host dùng trong trường hợp nào?
> [!NOTE] **Đáp án**
> * **Public IP:** Cho thiết bị cần giao tiếp trực tiếp với toàn Internet (Web server, Load Balancer, VPN).
> * **Private IP:** Cho hạ tầng nội bộ cần bảo vệ (Database, Backend API, Redis, Worker node).
> * **NAT Gateway:** Cho máy chủ Private IP chủ động kết nối ra Internet để tải bản vá/gọi API ngoài, ngăn chặn hoàn toàn chiều từ Internet kết nối ngược vào.
> * **Bastion Host:** Máy chủ trung chuyển duy nhất có Public IP, mở SSH được quản lý chặt (chỉ whitelist IP, bắt buộc 2FA/Key) để quản trị viên truy cập vào cụm Private.

#### Câu 39. Block storage, file storage, object storage khác nhau ra sao?
> [!NOTE] **Đáp án**
> * **Block Storage:** Lưu trữ dữ liệu dạng block thô, độ trễ cực thấp, IOPS cao. Dùng làm ổ đĩa gắn cho VM, Database (Cinder, Ceph RBD, AWS EBS).
> * **File Storage:** Lưu trữ theo cấu trúc thư mục phân cấp (File/Folder), chia sẻ qua giao thức NFS/SMB cho nhiều máy chủ cùng đọc/ghi (CephFS, AWS EFS).
> * **Object Storage:** Lưu trữ đối tượng phẳng gồm Data + Metadata + ID duy nhất, truy xuất qua REST API S3/HTTP. Khả năng mở rộng vô hạn, giá rẻ. Dùng cho ảnh, video, backup, static files (Ceph RGW, Swift, AWS S3).

#### Câu 40. IOPS, throughput, latency khác nhau thế nào?
> [!NOTE] **Đáp án**
> * **IOPS (Input/Output Operations Per Second):** Số thao tác đọc/ghi hoàn thành trong 1 giây. Quan trọng cho ứng dụng đọc ghi ngẫu nhiên (Random I/O) như Database OLTP.
> * **Throughput (Băng thông):** Tốc độ truyền tải dung lượng dữ liệu trong 1 giây (MB/s). Quan trọng cho đọc ghi tuần tự tệp lớn (Sequential I/O) như Video streaming, Data Warehouse.
> * **Latency (Độ trễ):** Thời gian từ khi gửi yêu cầu I/O đến khi hoàn tất phản hồi (ms hoặc $\mu s$).

#### Câu 41. RAID 5 và RAID 10 khác nhau thế nào, dùng khi nào?
> [!NOTE] **Đáp án**
> * **RAID 5 (Striping with Parity):** Cần tối thiểu 3 ổ. Dung lượng khả dụng: $(N - 1) \times \text{Size}$. Chịu lỗi tối đa 1 ổ. Tiết kiệm dung lượng nhưng hiệu năng ghi chậm (Write penalty do tính parity), rebuild ổ hỏng rất lâu. Dùng cho: File storage, backup, dữ liệu ít ghi.
> * **RAID 10 (Mirroring + Striping):** Cần tối thiểu 4 ổ. Dung lượng khả dụng: $50\%$ tổng ổ. Hiệu năng đọc/ghi cực nhanh, rebuild nhanh. Chi phí đắt hơn. Dùng cho: Production Database, máy chủ ảo hóa hypervisor.

#### Câu 42. Snapshot, backup và replication khác nhau ra sao?
> [!NOTE] **Đáp án**
> * **Snapshot:** Điểm ghi lại trạng thái tức thời (Copy-on-Write). Tạo ngay lập tức, tốn ít dung lượng nhưng phụ thuộc vào storage gốc (ổ đĩa vật lý chết thì mất snapshot). Dùng để rollback nhanh khi nâng cấp/patch.
> * **Backup:** Bản sao lưu độc lập hoàn chỉnh ra một hệ thống lưu trữ tách biệt vật lý (sang DC khác, Tape, S3). Chậm hơn nhưng đảm bảo an toàn kể cả khi hệ thống chính bị hủy hoại.
> * **Replication:** Quá trình đồng bộ dữ liệu liên tục (Sync/Async) giữa 2 node hoặc 2 Data Center theo thời gian thực để duy trì tính sẵn sàng cao (HA) và chuyển đổi dự phòng (Failover).

#### Câu 43. Hypervisor type 1 và type 2 khác nhau thế nào?
> [!NOTE] **Đáp án**
> * **Type 1 (Bare-metal):** Cài trực tiếp trên phần cứng máy chủ vật lý, không cần hệ điều hành trung gian (KVM, VMware ESXi, Hyper-V). Hiệu năng cao, độ trễ thấp, dùng cho Data Center/Cloud.
> * **Type 2 (Hosted):** Chạy như một ứng dụng phần mềm trên nền OS chủ như Windows, macOS, Linux (VirtualBox, VMware Workstation). Hiệu năng thấp hơn do hao phí tài nguyên chạy OS chủ, dùng cho lab học tập, dev cá nhân.

#### Câu 44. “Noisy neighbor” là gì và bạn giảm nó bằng cách nào?
> [!NOTE] **Đáp án**
> * **Khái niệm:** Hiện tượng một máy ảo (VM) hoặc Container trên cụm dùng chung (Multi-tenancy) tiêu tốn quá nhiều tài nguyên (CPU, Disk I/O, Network), làm nghẽn và suy giảm hiệu năng của các tenant khác nằm cùng máy chủ vật lý.
> * **Cách giảm thiểu:**
>   1. Dùng `cgroups` thiết lập trần giới hạn cứng (hard limits/quotas) cho CPU và RAM.
>   2. Cấu hình Storage QoS: Giới hạn chỉ số IOPS và Throughput tối đa của từng ổ đĩa ảo trên Ceph / Cinder.
>   3. Áp dụng CPU Pinning (ghim cố định vCPU vào Core vật lý riêng cho các VM quan trọng).
>   4. Phân chia băng thông mạng qua SR-IOV và Network Rate Limiting.

#### Câu 45. Một service “không truy cập được”, bạn kiểm tra end-to-end từ client tới backend thế nào?
> [!NOTE] **Đáp án**
> Thực hiện theo quy trình 4 bước từ dưới lên (Bottom-Up):
> 1. **Layer 3 (Network):** Dùng `ping <IP>` kiểm tra thông mạng; dùng `traceroute -n <IP>` kiểm tra gói tin có bị nghẽn/drop ở hop nào không; kiểm tra bảng định tuyến `ip route`.
> 2. **Layer 4 (Transport & Firewall):** Dùng `nc -zv <IP> <PORT>` kiểm tra port có mở không; nếu không kết nối được, kiểm tra `sudo iptables -L -n -v` hoặc Security Group.
> 3. **Layer 7 (Application):** Dùng `curl -Iv http(s)://<IP>` xem HTTP status code:
>    * `502 Bad Gateway`: Proxy sống nhưng backend app chết.
>    * `504 Gateway Timeout`: Backend xử lý quá lâu hoặc treo kết nối DB.
>    * `403 Forbidden`: Sai phân quyền file hoặc bị chặn IP.
> 4. **Host / Service:** SSH vào server kiểm tra: `systemctl status <service>`, `sudo ss -tulnp` (xem service bind vào `0.0.0.0` hay bị nhầm sang `127.0.0.1`), kiểm tra tài nguyên (`top`, `dmesg -T | grep -i oom`) và đọc error log (`tail -n 100 /var/log/...`).

---

### Nhóm D: Docker, Kubernetes, Cloud-Native (Câu 46 – 60)
46. Container khác virtual machine như thế nào?
47. `cgroups` và `namespaces` có vai trò gì trong container?
48. Docker image layers là gì?
49. Multi-stage build giúp gì?
50. Vì sao chạy database trong container cần cẩn thận?
51. Deployment, StatefulSet, DaemonSet khác nhau ra sao?
52. ClusterIP, NodePort, LoadBalancer, Ingress khác nhau thế nào?
53. readinessProbe, livenessProbe, startupProbe khác nhau thế nào?
54. requests, limits, QoS class và OOMKilled liên hệ ra sao?
55. HPA, VPA và Cluster Autoscaler khác nhau như thế nào?
56. CNI và CSI là gì?
57. ConfigMap và Secret khác nhau ra sao?
58. Pod bị CrashLoopBackOff hoặc Pending, bạn debug theo checklist nào?
59. Rolling update, blue-green, canary khác nhau thế nào?
60. Service mesh có thực sự cần không, khi nào nên và không nên dùng?

---

### Nhóm E: OpenStack, VMware, Private Cloud (Câu 61 – 75)
61. Vì sao OpenStack phù hợp với private/sovereign cloud?
62. Nova, Neutron, Cinder, Glance, Keystone làm gì?
63. Control plane và compute node khác nhau ra sao?
64. Image, flavor, key pair, security group trong OpenStack là gì?
65. Provider network và overlay network khác nhau thế nào?
66. Volume và ephemeral disk khác nhau ra sao?
67. Tenant isolation trong OpenStack được thực hiện thế nào?
68. Scheduler trong OpenStack ảnh hưởng tới capacity planning ra sao?
69. Live migration cần những điều kiện gì, rủi ro nào hay xảy ra?
70. Vì sao nhiều hệ OpenStack đi cùng Ceph?
71. Bạn lên chiến lược patch/upgrade OpenStack control plane thế nào?
72. ESXi, vCenter, vMotion, DRS, HA trong VMware khác nhau như thế nào?
73. vSAN hoặc NSX giải quyết bài toán gì trong hệ VMware?
74. Một workload đang chạy trên VMware, bạn lập kế hoạch migrate sang OpenStack ra sao?
75. GPU passthrough, SR-IOV hay hỗ trợ AI/HPC workloads trên cloud bạn hiểu thế nào?

---

### Nhóm F: DevOps, CI/CD, IaC, Observability (Câu 76 – 90)
76. CI, CD và GitOps khác nhau ở đâu?
77. Jenkins, GitLab CI và ArgoCD khác nhau thế nào?
78. Bạn chọn trunk-based development, GitFlow hay release branching cho platform team?
79. Hãy thiết kế pipeline CI/CD cho một microservice chạy trên Kubernetes.
80. Secret management trong pipeline nên làm thế nào?
81. Idempotency trong Ansible là gì và vì sao quan trọng?
82. Terraform state là gì, remote backend và locking dùng để làm gì?
83. Bạn tách module Terraform theo môi trường/dev-stg-prod thế nào?
84. Artifact/image versioning và promotion giữa các môi trường nên làm thế nào?
85. Khi deploy lỗi, bạn rollback theo chiến lược nào?
86. Logs, metrics và traces khác nhau ra sao?
87. Vì sao Prometheus dùng pull model, và khi nào cần push?
88. ELK/EFK giải quyết bài toán gì?
89. OpenTelemetry hoặc Jaeger hỗ trợ RCA như thế nào?
90. RabbitMQ và Kafka khác nhau ra sao trong kiến trúc microservice?

---

### Nhóm G: Database, Cache, Reliability, Security (Câu 91 – 105)
91. Các lỗi hay gặp khi chạy Postgres/MySQL trên cloud hoặc K8s là gì?
92. Redis nên dùng trong tình huống nào và rủi ro gì hay bị bỏ quên?
93. Least privilege trong cloud nên triển khai thế nào?
94. Security groups, firewall rules, network policy khác nhau thế nào?
95. Image scanning, SBOM, supply-chain security là gì?
96. Bạn rotation certificate và secret như thế nào để không downtime?
97. HA, fault tolerance và resilience khác nhau ở đâu?
98. Cách tìm Single Point of Failure trong một hệ cloud/platform là gì?
99. Bạn định nghĩa severity của incident như thế nào?
100. Một bản RCA tốt cần có những phần nào?
101. Backup/restore testing vì sao quan trọng hơn chỉ “có backup”?
102. RTO và RPO là gì?
103. Thiết kế DR giữa 2 DC/2 region nên bắt đầu từ đâu?
104. SLI, SLO và SLA khác nhau ra sao?
105. Làm sao bảo vệ môi trường cloud multi-tenant cho khách hàng doanh nghiệp/chính phủ?

---

### Nhóm H: Architecture, Migration, Presale, Case Study (Câu 106 – 120)
106. Hãy thiết kế private hoặc hybrid cloud cho một khách hàng ngân hàng/chính phủ có yêu cầu dữ liệu lưu trong nước.
107. Khi nào bạn khuyên khách hàng dùng public cloud, private cloud hay hybrid cloud?
108. Cloud Server, Cloud PC, Cloud Storage, Cloud Backup/DR khác nhau thế nào; khi nào chào từng dịch vụ?
109. Một khách hàng muốn rời VMware do chi phí/compliance; bạn assessment bài toán migrate ra sao?
110. Hãy định cỡ CPU/RAM/storage/network cho một POC 3 tháng.
111. Success criteria của một POC cloud nên đặt như thế nào?
112. Hãy thiết kế kiến trúc HA cho một dịch vụ phục vụ hàng triệu người dùng.
113. Bạn xây auto scaling và auto healing cho workload traffic tăng đột biến thế nào?
114. Khi forecast tăng trưởng 3x trong 6 tháng, bạn làm capacity planning ra sao?
115. Làm sao tối ưu cost mà không làm vỡ SLA?
116. Hãy trình bày một giải pháp cloud cho giám đốc không kỹ thuật trong 2 phút.
117. Bạn lập migration waves, rollback plan và cutover plan thế nào?
118. Sau khi go-live, bạn báo cáo những KPI nào cho khách hàng và quản lý?
119. Viettel công khai nhắc tới open source contribution và technical conference; bạn đã từng contribute hoặc chia sẻ kỹ thuật gì chưa?
120. Vì sao Viettel nên chọn bạn cho vị trí Cloud này?

---

## IV. THỨ TỰ ÔN TẬP HIỆU QUẢ NHẤT
1. **Linux + Networking** (Nền tảng hệ điều hành và mạng máy tính)
2. **Docker + Kubernetes** (Đóng gói container và điều phối cụm)
3. **OpenStack / VMware** (Hạ tầng ảo hóa và Private Cloud lõi)
4. **CI/CD + Ansible/Terraform + Monitoring** (Tự động hóa và giám sát)
5. **HA / DR / RCA / Security** (Vận hành độ tin cậy và khắc phục sự cố)
6. **Case Migration / Presale / Cost** (Tư vấn giải pháp và chuyển dịch hạ tầng)
