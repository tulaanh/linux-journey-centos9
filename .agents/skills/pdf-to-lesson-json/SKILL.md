---
name: pdf-to-lesson-json
description: >-
  Chuyen doi tai lieu hoc Linux/Cloud tu file PDF sang dinh dang JSON bai hoc tuong tac (Interactive Lesson).
  Tu dong trich xuat noi dung, loai bo van noi ruom ra, dich phan tai lieu huong dan sang Tieng Viet chuan ky thuat,
  GIU NGUYEN 100% cau lenh goc (command, syntax, path, options, CLI examples), dong khung inline code bang backticks va ky tu '/',
  va xuat ra file JSON hop le theo schema LessonDocument.
  Su dung skill nay khi nguoi dung yeu cau: doc file PDF bai hoc, chuyen PDF sang JSON, them bai hoc moi tu PDF,
  hoac tao du lieu bai giang Linux Journey tu tai lieu PDF.
---

# Skill: Chuyển Đổi Tài Liệu PDF Sang Bài Học JSON Tương Tác (`pdf-to-lesson-json`)

Kỹ năng này hướng dẫn agent tự động đọc tài liệu bài học từ file PDF, chắt lọc kiến thức cốt lõi, dịch phần thuyết minh/hướng dẫn sang tiếng Việt chuẩn kỹ thuật, giữ nguyên vẹn toàn bộ các câu lệnh thực hành gốc, và đóng gói thành file JSON hợp lệ cho hệ thống học tập tương tác.

---

## ⚠️ CÁC NGUYÊN TẮC BẤT BIẾN (CRITICAL RULES)

1. **TUYỆT ĐỐI KHÔNG DỊCH CÂU LỆNH LINUX:**
   * Mọi câu lệnh, cú pháp, tham số, tùy chọn cờ lệnh (flags) và ví dụ nhập liệu CLI **bắt buộc phải giữ nguyên 100% tiếng Anh gốc**.
   * *Ví dụ:* `echo Hello World` giữ nguyên `echo Hello World` (KHÔNG dịch thành `echo "Xin chào thế giới"`).
   * *Ví dụ:* `cd "Vacation Photos"` giữ nguyên `cd "Vacation Photos"`.
   * *Ví dụ:* Cú pháp `command options arguments` hoặc `cd [DIRECTORY]` giữ nguyên từ khóa tiếng Anh kỹ thuật.

2. **ĐÓNG KHUNG INLINE CODE VÀ KÝ TỰ THƯ MỤC GỐC `/`:**
   * Mọi lệnh, tên tệp, đường dẫn và ký tự đặc biệt khi nhắc đến trong văn bản phải được bọc trong cặp dấu backtick `` `...` `` để UI hiển thị dạng khung bo góc (badge):
     * Thư mục gốc: `` `/` `` (thay vì viết `/` trần hoặc `( / )`).
     * Đường dẫn: `` `/home/pete` ``, `` `/etc` ``, `` `/bin` ``.
     * Tên lệnh: `` `pwd` ``, `` `cd` ``, `` `ls -la` ``, `` `echo` ``.
     * Phím tắt điều hướng: `` `.` ``, `` `..` ``, `` `~` ``, `` `-` ``.
     * Ký hiệu shell: `` `$` `` (người dùng thường), `` `#` `` (root).

3. **LOẠI BỎ NỘI DUNG THỪA, CHẮT LỌC CỐT LÕI:**
   * Bỏ văn nói rườm rà, lời chào hỏi, số trang, header/footer của PDF hoặc các đoạn tán gẫu không cần thiết.
   * Tập trung vào: Khái niệm kỹ thuật, cú pháp, ví dụ chạy lệnh, lỗi thường gặp, và câu hỏi củng cố.

4. **ĐẢM BẢO JSON HỢP LỆ THEO SCHEMA:**
   * File JSON tạo ra phải tuân thủ nghiêm ngặt cấu trúc `LessonDocument` của hệ thống (xem chi tiết ở Bước 5).

---

## 🔄 Quy Trình Xử Lý 5 Bước (Workflow)

### Bước 1: Trích Xuất Dữ Liệu Từ File PDF
Khi người dùng cung cấp đường dẫn file PDF (ví dụ: `docs/lesson-04-ls.pdf`), sử dụng script Python trợ lực:

```bash
python "C:\Users\Do Anh Tu\.gemini\config\skills\pdf-to-lesson-json\scripts\extract_pdf.py" "<duong_dan_file.pdf>" [trang_bat_dau] [trang_ket_thuc]
```

* Script sẽ in ra toàn bộ nội dung text của các trang kèm đánh dấu trang rõ ràng.

### Bước 2: Phân Tích & Chắt Lọc Nội Dung
Từ văn bản thô trích xuất được, phân loại thành 4 nhóm nội dung:
1. **Lý thuyết & Khái niệm:** Bản chất lệnh dùng để làm gì, tại sao cần dùng.
2. **Cú pháp & Ví dụ minh họa:** Cú pháp chuẩn, các tùy chọn (flags) thông dụng nhất.
3. **Câu hỏi kiểm tra nhanh (Quiz):** 3-5 câu hỏi trắc nghiệm kiểm tra mức độ hiểu bài.
4. **Bài tập thực hành (Hands-on Labs):** Các bước lệnh cụ thể để người học gõ thử trên terminal.

### Bước 3: Dịch Tài Liệu Sang Tiếng Việt Chuẩn Kỹ Thuật
* Dịch lời dẫn, giải thích khái niệm, câu hỏi và đáp án sang tiếng Việt tự nhiên, trong sáng, dễ hiểu.
* Sử dụng thuật ngữ công nghệ thông tin chuẩn:
  * *Current working directory* ➔ *Thư mục làm việc hiện tại*
  * *Absolute path / Relative path* ➔ *Đường dẫn tuyệt đối / Đường dẫn tương đối*
  * *Parent directory* ➔ *Thư mục cha*
  * *Home directory* ➔ *Thư mục cá nhân (home)*
  * *Symbolic link / Symlink* ➔ *Liên kết tượng trưng*
* **Nhắc lại:** Tuyệt đối không dịch câu lệnh và chuỗi đối số!

### Bước 4: Đóng Khung Mã Lệnh Bằng Backticks
Rà soát toàn bộ câu văn tiếng Việt và bọc backtick `` `...` `` quanh:
* Ký tự thư mục gốc: `` `/` ``
* Các đường dẫn: `` `/home` ``, `` `/etc` ``, `` `/var` ``, `` `taxes/` ``
* Các câu lệnh và cờ lệnh: `` `ls` ``, `` `pwd -P` ``, `` `cd ..` ``
* Biến môi trường: `` `$PWD` ``, `` `$OLDPWD` ``, `` `$SHELL` ``

### Bước 5: Đóng Gói Thành JSON Hợp Lệ

Cấu trúc file JSON theo schema `LessonDocument`:

```json
{
  "id": 4,
  "slug": "ls",
  "category": "Command Line",
  "lessonNumber": 4,
  "title": "ls (Liệt kê tệp tin và thư mục)",
  "subtitle": "Tìm hiểu cách sử dụng lệnh ls để xem nội dung thư mục trong Linux.",
  "defaultCwd": "/home/pete",
  "steps": [
    {
      "id": "step-0",
      "stepIndex": 0,
      "type": "content",
      "title": "Tiêu đề phần lý thuyết",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Nội dung giải thích lý thuyết, có chèn inline code như `ls -la` và thư mục `/`."
        },
        {
          "type": "callout",
          "variant": "info",
          "text": "Ghi chú quan trọng cần lưu ý."
        },
        {
          "type": "code",
          "codeBlock": {
            "type": "command",
            "code": "$ ls -l\ntotal 0",
            "runnableCommand": "ls -l"
          }
        },
        {
          "type": "list",
          "items": [
            "`-l`: Hiển thị định dạng danh sách chi tiết (long format).",
            "`-a`: Hiển thị toàn bộ tệp tin, bao gồm cả tệp ẩn bắt đầu bằng dấu chấm."
          ]
        }
      ]
    },
    {
      "id": "step-1",
      "stepIndex": 1,
      "type": "quiz",
      "quiz": {
        "id": "q1",
        "question": "Câu hỏi trắc nghiệm liên quan đến lệnh vừa học?",
        "options": [
          { "text": "ls -l", "isCode": true },
          { "text": "cd ..", "isCode": true },
          { "text": "pwd", "isCode": true }
        ],
        "correctIndex": 0,
        "explanation": "Chính xác! Lệnh `ls -l` hiển thị danh sách chi tiết."
      }
    },
    {
      "id": "step-2",
      "stepIndex": 2,
      "type": "hands_on",
      "title": "Thực hành tương tác",
      "handsOn": [
        {
          "id": "lab-1",
          "title": "1. Thực hành lệnh ls",
          "description": "Mô tả mục tiêu của bài lab thực hành.",
          "isPrimary": true,
          "tasks": [
            {
              "id": "task-1",
              "stepNumber": 1,
              "title": "Bước 1: Chạy lệnh ls",
              "description": "Liệt kê các tệp tin trong thư mục hiện tại.",
              "runnableCommand": "ls -la",
              "buttonLabel": "Chạy ls -la"
            }
          ]
        }
      ]
    },
    {
      "id": "step-3",
      "stepIndex": 3,
      "type": "summary",
      "title": "Bạn đã hoàn thành bài học",
      "takeaways": [
        { "text": "Nắm vững cú pháp cơ bản của lệnh `ls`." },
        { "text": "Biết cách kết hợp các tùy chọn `-l`, `-a`, `-h`." }
      ]
    }
  ]
}
```

---

## 🎯 Kiểm Tra Chất Lượng (Pre-flight Verification)
Sau khi tạo file JSON:
1. Đảm bảo file được ghi vào đường dẫn: `src/data/lessons/<id>-<slug>.json`.
2. Kiểm tra cú pháp JSON hợp lệ bằng Node/Python:
   ```bash
   node -e "JSON.parse(fs.readFileSync('src/data/lessons/<id>-<slug>.json', 'utf8')); console.log('JSON Valid!')"
   ```
3. Chạy `npm run build` để xác nhận hệ thống TypeScript và Vite biên dịch mượt mà không lỗi schema.
