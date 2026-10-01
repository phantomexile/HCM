# Phòng giải mã lịch sử tư tưởng Hồ Chí Minh

## Mục tiêu đã thống nhất

Website tiếng Việt dành cho sinh viên ôn tập thông qua trò chơi giải đố một người. Người chơi tự đọc kiến thức, trả lời thử thách và xem giải thích. Không có đội chơi, phòng trực tuyến hoặc đăng nhập.

## Thiết kế đề xuất cho bản đầu

- Giao diện mang cảm giác phòng tư liệu lịch sử: giấy ngà, đỏ trầm, chữ dễ đọc, các thẻ hồ sơ và dòng thời gian.
- Trang chủ giới thiệu ngắn, có nút bắt đầu, tiếp tục hành trình và mở phần ôn tập.
- Hành trình gồm các chặng về cơ sở hình thành, quá trình phát triển và những nội dung cơ bản của tư tưởng Hồ Chí Minh.
- Mỗi chặng có thẻ kiến thức, thử thách và phần tổng kết. Kiến thức luôn có thể mở để ôn lại.
- Thử thách gồm trắc nghiệm một đáp án, ghép sự kiện với thời điểm và sắp xếp trình tự. Các thao tác đều sử dụng được bằng bàn phím hoặc chạm, không bắt buộc kéo thả.
- Sau khi nộp đáp án, hiển thị đúng/sai, đáp án và giải thích; người chơi chủ động chuyển sang câu tiếp theo.
- Trang kết quả hiển thị điểm, số câu đúng và danh sách kiến thức cần ôn lại.

## Quy tắc trò chơi

- Mỗi thử thách đúng được 10 điểm; trả lời sai được 0 điểm và vẫn được đi tiếp sau khi đọc giải thích.
- Mỗi câu chỉ tính điểm một lần trong một lượt chơi, kể cả khi bấm nút nộp nhiều lần.
- Gợi ý phục vụ học tập và không trừ điểm. Đây là trò chơi tự luyện, không dùng làm điểm kiểm tra chính thức.
- Đồng hồ hiển thị thời gian đã chơi, không ép hết giờ và không làm thay đổi điểm.
- Lưu tiến độ và kết quả tốt nhất trên trình duyệt. Có thể tiếp tục lượt đang chơi hoặc bắt đầu lượt mới.
- Bắt đầu lượt mới đặt lại điểm, câu trả lời và đồng hồ của lượt hiện tại nhưng giữ kết quả tốt nhất.

## Nội dung và nguồn

- Soạn tiếng Việt có dấu, phân biệt rõ sự kiện lịch sử với nội dung khái quát để ôn tập.
- Đối chiếu thông tin với tài liệu chính thống trước khi đưa vào bộ câu hỏi; dẫn nguồn ngay trong phần kiến thức hoặc giải thích liên quan.
- Không đặt nội dung diễn giải trong dấu ngoặc kép như một lời trích dẫn của Hồ Chí Minh.
- Bản đầu dùng bộ câu hỏi có sẵn, không tự sinh đáp án khi người chơi đang chơi.

## Tổ chức và dữ liệu

- Tách giao diện, bộ câu hỏi/nguồn tham khảo và phần xử lý lượt chơi để dễ sửa nội dung mà không thay đổi quy tắc tính điểm.
- Bộ câu hỏi dùng mã định danh ổn định; trạng thái lưu bao gồm phiên bản dữ liệu, chặng hiện tại, đáp án đã nộp, điểm và thời gian đã chơi.
- Kiểm tra dữ liệu lưu trước khi khôi phục. Nếu dữ liệu hỏng hoặc không còn tương thích, thông báo dễ hiểu và cho bắt đầu lại.
- Nếu trình duyệt không cho lưu, vẫn chơi được trong phiên hiện tại và hiển thị thông báo ngắn.
- Chưa cần máy chủ, cơ sở dữ liệu hoặc tài khoản người dùng. Nền tảng triển khai cụ thể được chọn trong kế hoạch thực hiện.

## Khả năng sử dụng và quy ước mã nguồn

- Bố cục thích ứng trên điện thoại, máy tính bảng và máy tính; chữ rõ, nút đủ lớn, có trạng thái bàn phím rõ ràng.
- Không dùng màu sắc làm dấu hiệu duy nhất để báo đúng/sai.
- Tất cả tệp văn bản lưu UTF-8 không BOM; giữ nguyên tiếng Việt có dấu.
- Các hàm và khối xử lý quan trọng có chú thích tiếng Việt giải thích mục đích, đầu vào/đầu ra, tính điểm, kiểm tra đáp án, lưu/khôi phục và xử lý lỗi.
- Không tạo commit khi chưa được người dùng yêu cầu.

## Kiểm tra nghiệm thu

- Hoàn thành được hành trình một người từ trang chủ đến kết quả.
- Mỗi loại câu hỏi nhận đúng đáp án, giải thích và chỉ cộng điểm một lần.
- Tải lại trang khôi phục đúng tiến độ; bắt đầu lại không mang điểm cũ vào lượt mới.
- Thời gian không tăng nhanh hơn khi chuyển trang hoặc khôi phục lượt chơi.
- Dữ liệu lưu hỏng hoặc không thể lưu không làm hỏng toàn bộ trò chơi.
- Nội dung, dấu tiếng Việt và bố cục được kiểm tra trên màn hình rộng và màn hình điện thoại.

## Trạng thái

Đã cập nhật theo yêu cầu chơi một người. Đây là bản thiết kế để người dùng xem trước khi lập kế hoạch triển khai; chưa phải website đã hoàn thành.
