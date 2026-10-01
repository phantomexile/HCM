# Phòng giải mã — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Phương án đề xuất là triển khai trực tiếp trong cuộc trò chuyện này; chờ người dùng chọn cách thực hiện.

**Goal:** Tạo website ôn tập một người, có kiến thức, ba dạng câu đố, giải thích, kết quả và lưu tiến độ.

**Architecture:** Website tĩnh dùng một trang chính và các màn hình thay đổi theo trạng thái. Tách nội dung học tập, quy tắc trò chơi, lưu trữ và giao diện; không cần tài khoản hoặc máy chủ dữ liệu. Mã nguồn ứng dụng đặt trong `site/dist`, tài liệu hiện có được giữ nguyên.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node.js test runner; Sites dành cho xem trước và xuất bản theo khả năng công cụ.

**Spec:** `docs/superpowers/specs/2026-09-30-phong-giai-ma-design.md`.

## Global Constraints

- Website tiếng Việt dành cho sinh viên ôn tập thông qua trò chơi giải đố một người.
- Không có đội chơi, phòng trực tuyến hoặc đăng nhập.
- Mỗi thử thách đúng được 10 điểm; trả lời sai được 0 điểm và vẫn được đi tiếp sau khi đọc giải thích.
- Mỗi câu chỉ tính điểm một lần trong một lượt chơi, kể cả khi bấm nút nộp nhiều lần.
- Gợi ý phục vụ học tập và không trừ điểm.
- Đồng hồ hiển thị thời gian đã chơi, không ép hết giờ và không làm thay đổi điểm.
- Tất cả tệp văn bản lưu UTF-8 không BOM; giữ nguyên tiếng Việt có dấu.
- Không tạo commit khi chưa được người dùng yêu cầu.

## Review Focus

- Nộp đáp án nhiều lần: không cộng điểm lại, không ghi đè câu đã chấm.
- Dữ liệu lưu hỏng, sai phiên bản hoặc tham chiếu câu đã bị bỏ: khôi phục an toàn, không để màn hình trắng.
- Trình duyệt từ chối lưu: phiên chơi hiện tại vẫn hoạt động và người chơi biết tiến độ chưa được lưu.
- Chuyển màn hình hoặc mở lại trang: không tạo nhiều đồng hồ; chỉ tính thời gian hoạt động trong màn chơi.
- Chỉ dùng bàn phím hoặc màn hình hẹp: làm được cả câu ghép và sắp xếp, không phụ thuộc kéo thả.

## Task 1: Nội dung học tập và quy tắc lượt chơi

**Files:** `site/dist/data.mjs`, `site/dist/game.mjs`, `site/tests/game.test.mjs`, `site/tests/data.test.mjs`.

**Interfaces:**
- `chapters`: danh sách `{ id, title, summary, notes, sourceIds }`.
- `questions`: danh sách `{ id, chapterId, type, prompt, options, answer, explanation, hint, sourceIds }`; `type` là `choice`, `match` hoặc `order`.
- `sources`: danh sách `{ id, title, url }` trỏ tới tài liệu đã đọc và đối chiếu.
- `createGame()`: trả trạng thái mới `{ version, currentIndex, answers, elapsedMs, completed }`.
- `submitAnswer(state, question, answer)`: trả trạng thái mới, giữ câu đã chấm bất biến; không chấp nhận câu không phải câu hiện tại.
- `getScore(state)`: số câu đúng nhân 10; `advance(state)`: đi tiếp sau khi đã trả lời, kết thúc ở câu cuối.
- `elapsedAt(elapsedMs, activeSince, now)`: số mili giây đã tích lũy cộng thời gian hoạt động hiện tại, không âm.

- [ ] Đọc nguồn chính thống, soạn 4 chặng và 16 câu, có đủ 3 loại; mỗi câu và phần kiến thức có nguồn. Các chặng lần lượt là nền tảng hình thành, tìm đường cứu nước, phát triển tư tưởng và nội dung cơ bản.
- [ ] Viết kiểm thử cấu trúc nội dung: ID duy nhất, nguồn có thật trong danh sách, đáp án thuộc lựa chọn, mỗi câu có giải thích và gợi ý.
- [ ] Viết kiểm thử lượt chơi: câu đúng 10 điểm, sai 0 điểm, nộp lặp không đổi điểm, chưa trả lời không đi tiếp, hoàn tất câu cuối và bắt đầu lại từ 0.
- [ ] Chạy `node --test site/tests/game.test.mjs site/tests/data.test.mjs`, xác nhận thất bại vì phần xử lý chưa được triển khai.
- [ ] Triển khai các giao diện đã nêu, chú thích tiếng Việt cho kiểm tra đầu vào, tính điểm và chuyển chặng.
- [ ] Chạy lại kiểm thử, yêu cầu tất cả đạt; thêm kiểm tra thời gian với đầu vào kiểm soát được, không dùng chờ thực tế.

Nguồn khởi đầu đã tìm thấy: bài “Nguyễn Ái Quốc đọc tác phẩm của V.I. Lênin: Sơ thảo lần thứ nhất những luận cương về vấn đề dân tộc và vấn đề thuộc địa” và “Chuyến đi lịch sử” trên `baotanghochiminh.vn`. Đọc đầy đủ các trang cần dùng và bổ sung nguồn cho nội dung cơ bản trước khi soạn câu hỏi.

## Task 2: Lưu và khôi phục tiến độ

**Files:** `site/dist/storage.mjs`, `site/tests/storage.test.mjs`.

**Interfaces:**
- `loadProgress(storage, questions)`: trả `{ state, bestScore, warning }`, kiểm tra JSON, phiên bản, chỉ số hiện tại, câu trả lời và thời gian.
- `saveProgress(storage, state, bestScore)`: trả `{ saved, warning }`, không ném lỗi ra giao diện khi quyền lưu bị chặn.
- Khóa lưu `hcm-history-room:v1`, gồm trạng thái lượt chơi và điểm tốt nhất; không lưu thông tin cá nhân.

- [ ] Viết kiểm thử với bộ lưu giả: khôi phục hợp lệ, JSON lỗi, phiên bản cũ, câu lạ, chỉ số âm/quá giới hạn, điểm bất hợp lệ và thao tác lưu ném lỗi.
- [ ] Chạy `node --test site/tests/storage.test.mjs`, xác nhận thất bại trước khi triển khai.
- [ ] Triển khai kiểm tra dữ liệu và thông báo tiếng Việt; tính lại điểm từ câu trả lời đã được kiểm tra, không tin điểm do dữ liệu lưu cung cấp.
- [ ] Chạy lại kiểm thử; xác nhận lượt mới không xóa điểm tốt nhất và lỗi lưu không làm mất trạng thái đang chơi trong bộ nhớ.

## Task 3: Giao diện hoàn chỉnh và trải nghiệm chơi

**Files:** `site/dist/index.html`, `site/dist/styles.css`, `site/dist/app.mjs`, `site/preview.mjs`, `site/README.md`.

**Interfaces:** `app.mjs` dùng dữ liệu, quy tắc và lưu trữ từ hai phần trước; thao tác người dùng gọi các hàm này rồi cập nhật giao diện. `preview.mjs` chỉ phục vụ tài sản công khai trong `site/dist` trên localhost, chặn đường dẫn ra ngoài thư mục.

- [ ] Tạo trang chủ giấy ngà/đỏ trầm, bản đồ 4 chặng, thẻ ôn tập và nút bắt đầu; khai báo UTF-8, `lang="vi"`, viewport và biểu tượng trang riêng.
- [ ] Chạy bản xem trước bằng `node site/preview.mjs`; mở trong Codex khi trang đã có nội dung và bố cục đại diện.
- [ ] Hoàn thiện màn ôn tập, chơi, giải thích và kết quả; mỗi câu có nút nộp, gợi ý và nguồn. Câu ghép dùng lựa chọn có nhãn; câu sắp xếp dùng nút lên/xuống có nhãn.
- [ ] Kết nối lưu tiến độ sau mỗi chuyển trạng thái và khi rời màn chơi; chỉ có một bộ cập nhật đồng hồ. Thời gian khi đóng trang không tính vào lượt chơi.
- [ ] Hiển thị tổng điểm, các câu sai, kiến thức cần ôn và điểm tốt nhất; nút chơi lại bắt đầu lượt mới, thao tác bỏ lượt đang chơi có xác nhận trong giao diện.
- [ ] Kiểm tra thủ công một lượt đủ các loại câu, nộp lặp, mở gợi ý, tải lại, tiếp tục và chơi lại; thử bàn phím, màn hình rộng và màn hình 390 px.
- [ ] Ghi hướng dẫn chạy và giới hạn lưu theo thiết bị; mã quan trọng có chú thích tiếng Việt, mọi tệp UTF-8 không BOM.

## Task 4: Kiểm tra cuối và bàn giao

**Files:** `site/.openai/hosting.json` nếu dùng Sites; các tệp ở trên được sửa nếu phát hiện lỗi.

- [ ] Chạy `node --test site/tests/*.test.mjs`, kiểm tra cú pháp các tệp JavaScript và kiểm tra tham chiếu tài sản cục bộ; tất cả phải đạt.
- [ ] Kiểm tra byte UTF-8 không BOM, các nhãn tiếng Việt và các liên kết nguồn; không để nội dung mẫu hoặc nút không hoạt động.
- [ ] Đọc và áp dụng hướng dẫn Sites hosting trước xuất bản; chỉ đưa `site/dist` lên dịch vụ, không gửi tài liệu nội bộ hay tệp kiểm thử. Xác nhận trạng thái triển khai thành công rồi kiểm tra trang được phục vụ.
- [ ] Nếu dịch vụ xuất bản không khả dụng, giữ nguyên bản chạy cục bộ và báo rõ giới hạn, không tuyên bố đã xuất bản.
- [ ] Bàn giao liên kết chạy, những chức năng đã hoàn thành và kết quả kiểm tra; không commit.

## Tự rà soát

Kế hoạch bao phủ nội dung, các loại câu hỏi, điểm, gợi ý, thời gian, lưu/khôi phục, chơi lại, nguồn, khả năng truy cập và UTF-8. Năm tình huống rủi ro trong Review Focus đều có bước kiểm tra tương ứng. Không bổ sung tài khoản, đội chơi, bảng xếp hạng trực tuyến hoặc cơ sở dữ liệu.
