import { chapters, questions, sources } from './data.mjs';
import { icon } from './icons.mjs';
import { getScore } from './game.mjs';

const typeNames = { choice: 'CHỌN ĐÁP ÁN', match: 'GHÉP DẤU MỐC', order: 'SẮP XẾP TRÌNH TỰ' };
/** Mã hóa chuỗi để dữ liệu hiển thị không thể trở thành thẻ HTML thực thi. */
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
export const formatTime = ms => `${Math.floor(ms / 60000).toString().padStart(2, '0')}:${Math.floor(ms / 1000 % 60).toString().padStart(2, '0')}`;
const answeredCount = state => state ? Object.keys(state.answers).length : 0;
const chapterQuestions = chapter => questions.filter(q => q.chapterId === chapter.id);
const chapterCount = (chapter, state) => chapterQuestions(chapter).filter(q => state?.answers[q.id]).length;
const chapterCorrect = (chapter, state) => chapterQuestions(chapter).filter(q => state?.answers[q.id]?.correct).length;

/** Mở tư liệu ở tab riêng để không mất màn đang chơi. */
function sourceLinks(ids) {
  return `<ul class="source-links">${ids.map(id => sources.find(s => s.id === id)).map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title)} ↗</a></li>`).join('')}</ul>`;
}

/** Bản đồ hồ sơ mở đầu: người học nhìn thấy cấu trúc hành trình trước khi bắt đầu. */
export function homeHTML(state, bestScore, adventure = {items:0}) {
  const started = adventure.items > 0;
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow"><span class="tiny-line"></span> GAME KHÁM PHÁ & GIẢI MÃ LỊCH SỬ</p>
        <h1>Mỗi căn phòng,<br><em>một bí mật mở ra.</em></h1>
        <p class="hero-intro">Bước vào phòng giải mã lịch sử tư tưởng Hồ Chí Minh. Tìm đồ vật, ghép manh mối và mở những cơ cấu khóa để lần theo một hành trình tư tưởng.</p>
        <div class="hero-actions"><button class="button primary" data-action="explore">${started ? 'Tiếp tục khám phá' : 'Vào phòng giải mã'} ${icon('arrow')}</button><a href="#study" class="text-link">Mở sổ tay tư liệu ${icon('book', 18)}</a></div>
        <div class="hero-facts"><span><strong>04</strong> căn phòng</span><span><strong>12</strong> vật phẩm</span><span>${icon('flag', 17)} Chơi một người</span></div>
      </div>
      <a href="#play" class="game-preview" aria-label="Khám phá phòng 01 — Tấm vé khởi hành"><span class="game-preview-tag">PHIÊU LƯU TRI THỨC · 1 NGƯỜI CHƠI</span><span class="preview-target"></span><span class="game-preview-caption"><span><small>PHÒNG 01 / BẾN NHÀ RỒNG</small>Tấm vé khởi hành</span><b>${icon('arrow',23)}</b></span></a>
    </section>
    ${started ? `<section class="resume-strip"><div>${icon('compass',24)}<span><strong>${adventure.completed?'Bạn đã mở khóa bốn căn phòng':'Cuộc khám phá đang chờ bạn'}</strong><small>${adventure.items}/12 vật phẩm · ${adventure.roomsSolved}/4 phòng · ${adventure.score} điểm khám phá</small></span></div><a href="#play" class="text-link">${adventure.completed?'Xem thành quả':'Trở lại phòng'} ${icon('arrow',18)}</a></section>`:''}
    <section class="journey-section" aria-labelledby="journey-heading">
      <div class="section-heading"><div><p class="eyebrow">BẢN ĐỒ KIẾN THỨC</p><h2 id="journey-heading">Hành trình của bạn</h2></div><p>4 hồ sơ. Từng bước mở khóa hiểu biết.</p></div>
      <div class="chapter-grid">${chapters.map(c => `<a href="#study/${c.id}" class="chapter-card"><div class="card-top"><span class="chapter-icon">${icon(c.icon, 27)}</span><span class="chapter-number">${c.number}</span></div><p class="eyebrow">${c.period}</p><h3>${c.title}</h3><p>${c.summary}</p><div class="card-bottom"><span>4 thử thách</span><span class="card-link">Xem hồ sơ ${icon('arrow', 18)}</span></div></a>`).join('')}</div>
    </section>
    <section class="learning-strip"><span class="strip-icon">${icon('book', 30)}</span><div><h3>Khám phá xong, thử xem bạn nhớ được bao nhiêu.</h3><p>16 câu ôn tập có giải thích và nguồn tham khảo, tách riêng khỏi hành trình game.</p></div><a href="#quiz" class="text-link">${state&&!state.completed?'Tiếp tục ôn tập':'Thử sức ôn tập'} ${icon('arrow', 18)}</a></section>`;
}

/** Dùng chung đáp án chuẩn cho phản hồi ngay sau câu hỏi và màn ôn lại cuối lượt. */
function answerText(q, answer = q.answer) {
  const text = id => q.options.find(o => o.id === id)?.text || '';
  if (q.type === 'choice') return escapeHTML(text(answer));
  if (q.type === 'order') return answer.map(text).map(escapeHTML).join(' → ');
  return q.items.map(item => `${escapeHTML(item.text)}: ${escapeHTML(text(answer[item.id]))}`).join('; ');
}

/** Điều khiển HTML thật hỗ trợ bàn phím và chạm, không bắt buộc kéo thả. */
function answerControls(q, stored, order) {
  const disabled = stored ? 'disabled' : '';
  if (q.type === 'choice') return `<fieldset class="choices"><legend class="sr-only">Chọn một đáp án</legend>${q.options.map((o, i) => `<label class="choice ${stored && o.id === q.answer ? 'correct' : ''} ${stored && stored.value === o.id && !stored.correct ? 'incorrect' : ''}"><input type="radio" name="answer" value="${o.id}" ${stored?.value === o.id ? 'checked' : ''} ${disabled}><span class="option-letter">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(o.text)}</span>${stored && o.id === q.answer ? `<span class="answer-mark">${icon('check',18)}<span class="sr-only">Đáp án đúng</span></span>` : ''}</label>`).join('')}</fieldset>`;
  if (q.type === 'match') return `<div class="match-list">${q.items.map((item, index) => `<div class="match-row"><label for="match-${item.id}"><span class="row-number">0${index + 1}</span>${escapeHTML(item.text)}</label><span aria-hidden="true">→</span><select id="match-${item.id}" name="${item.id}" ${disabled}><option value="">Chọn đáp án…</option>${q.options.map(o => `<option value="${o.id}" ${stored?.value[item.id] === o.id ? 'selected' : ''}>${escapeHTML(o.text)}</option>`).join('')}</select></div>`).join('')}</div>`;
  return `<ol class="order-list" aria-label="Thứ tự các sự kiện">${order.map((id, index) => { const o = q.options.find(o => o.id === id); return `<li><span class="row-number">0${index + 1}</span><span>${escapeHTML(o.text)}</span><div class="order-buttons"><button type="button" data-move="up" data-id="${id}" aria-label="Đưa ${escapeHTML(o.text)} lên" ${stored || index === 0 ? 'disabled' : ''}>↑</button><button type="button" data-move="down" data-id="${id}" aria-label="Đưa ${escapeHTML(o.text)} xuống" ${stored || index === order.length - 1 ? 'disabled' : ''}>↓</button></div></li>`; }).join('')}</ol><p class="input-note">Dùng nút ↑ ↓ để đổi thứ tự, từ sớm đến muộn.</p>`;
}

/** Đặt câu hỏi ở trung tâm; sổ tay và tiến độ hỗ trợ học tập, không tạo áp lực thời gian. */
export function gameHTML(state, order) {
  const q = questions[state.currentIndex];
  const chapter = chapters.find(c => c.id === q.chapterId);
  const stored = state.answers[q.id];
  return `<div class="play-header"><div><a href="#home" class="back-link">← Về hành trình</a><p class="eyebrow">PHÒNG GIẢI MÃ / HỒ SƠ ${chapter.number}</p><h1>${chapter.title}</h1></div><div class="play-stats"><span>${icon('star',19)}<strong id="score">${getScore(state)}</strong><small>điểm</small></span><span>${icon('clock',19)}<strong id="timer">${formatTime(state.elapsedMs)}</strong><small>đã chơi</small></span></div></div>
  <div class="play-layout"><aside class="journey-sidebar"><p class="eyebrow">HÀNH TRÌNH GIẢI MÃ</p><ol>${chapters.map(c => `<li class="${c.id === chapter.id ? 'current' : ''} ${chapterCount(c,state) === 4 ? 'done' : ''}"><span class="step-number">${chapterCount(c,state) === 4 ? icon('check',16) : c.number}</span><div><strong>${c.title}</strong><small>${chapterCount(c,state)}/4 thử thách đã giải mã</small></div></li>`).join('')}</ol><div class="sidebar-note">${icon('book',22)}<p>Cần một chút gợi nhớ?<br>Sổ tay luôn ở đây.</p><a href="#study/${chapter.id}" class="text-link">Mở hồ sơ ôn tập ↗</a></div><button class="quiet-button" data-action="restart">Bắt đầu lại lượt chơi</button></aside>
  <section class="question-panel" aria-labelledby="question-title"><div class="question-top"><span class="eyebrow">THỬ THÁCH ${String(state.currentIndex + 1).padStart(2,'0')} <span>/ 16</span></span><span class="type-badge">${typeNames[q.type]}</span></div><progress value="${answeredCount(state)}" max="16" aria-label="Tiến độ toàn hành trình">${answeredCount(state)}/16</progress><div class="question-body"><span class="question-category">${icon(chapter.icon,18)} ${chapter.period}</span><h2 id="question-title">${escapeHTML(q.prompt)}</h2><p class="question-instruction">${q.type === 'choice' ? 'Chọn một đáp án bạn cho là đúng.' : q.type === 'match' ? 'Mỗi đáp án chỉ dùng một lần. Hãy ghép đủ các mục.' : 'Sắp xếp các thẻ để nối lại dòng thời gian.'}</p>
  <form id="answer-form" novalidate>${answerControls(q,stored,order)}<p id="answer-error" class="form-error" role="alert" hidden></p>
  ${stored ? `<div class="feedback ${stored.correct ? 'success' : 'review'}" role="status"><h3 id="feedback-title" tabindex="-1">${stored.correct ? '✓ Giải mã chính xác! +10 điểm' : 'Một manh mối để bạn nhớ hơn'}</h3><p><strong>Đáp án:</strong> ${answerText(q)}</p><p>${escapeHTML(q.explanation)}</p>${sourceLinks(q.sourceIds)}</div>` : `<details class="hint"><summary>${icon('hint',18)} Mở một gợi ý <span>Không trừ điểm</span></summary><p>${escapeHTML(q.hint)}</p></details>`}
  <div class="question-actions"><span>${stored ? 'Đọc lời giải trước khi tiếp tục.' : 'Không giới hạn thời gian. Cứ suy nghĩ nhé.'}</span>${stored ? `<button type="button" class="button primary" data-action="next">${state.currentIndex === questions.length - 1 ? 'Xem kết quả' : (state.currentIndex + 1) % 4 === 0 ? 'Tổng kết chặng' : 'Câu tiếp theo'} ${icon('arrow',18)}</button>` : `<button class="button primary" type="submit">Kiểm tra đáp án ${icon('arrow',18)}</button>`}</div></form></div></section></div>`;
}

/** Sổ tay cho phép đọc bất kỳ chặng nào, độc lập với tiến độ lượt chơi. */
export function studyHTML(chapterId, state) {
  const selected = chapters.find(c => c.id === chapterId) || chapters[0];
  return `<section class="page-heading"><a href="#home" class="back-link">← Về hành trình</a><p class="eyebrow">ĐỌC CHẬM MỘT CHÚT, NHỚ LÂU HƠN</p><h1>Sổ tay ôn tập</h1><p>Những ý chính để kết nối sự kiện với tư tưởng. Mở nguồn để tìm hiểu sâu hơn.</p></section><div class="study-layout"><nav class="study-nav" aria-label="Chọn hồ sơ ôn tập">${chapters.map(c => `<a href="#study/${c.id}" ${c.id === selected.id ? 'aria-current="page" class="selected"' : ''}><span>${c.number}</span>${c.title}${icon('chevron',16)}</a>`).join('')}</nav><article class="study-paper"><div class="study-paper-heading"><span class="chapter-icon">${icon(selected.icon,35)}</span><span class="eyebrow">HỒ SƠ ${selected.number} / ${selected.period}</span></div><h2>${selected.title}</h2><p class="study-lead">${selected.summary}</p><ol class="study-notes">${selected.notes.map((note,index) => `<li><span>0${index+1}</span><p>${escapeHTML(note)}</p></li>`).join('')}</ol><div class="study-reminder"><strong>Gợi ý tự ôn</strong><p>Thử giải thích ý chính bằng lời của bạn, rồi dùng một mốc thời gian hoặc tình huống để minh họa.</p></div><div class="study-sources"><p class="eyebrow">ĐỌC & ĐỐI CHIẾU</p>${sourceLinks(selected.sourceIds)}</div><div class="study-actions"><button class="button primary" data-action="start">${state && !state.completed ? 'Trở lại lượt chơi' : 'Bắt đầu giải mã'} ${icon('arrow',18)}</button>${chapters.indexOf(selected) < chapters.length - 1 ? `<a class="text-link" href="#study/${chapters[chapters.indexOf(selected)+1].id}">Hồ sơ tiếp theo →</a>` : '<a class="text-link" href="#sources">Tất cả nguồn tham khảo ↗</a>'}</div></article></div>`;
}

/** Tổng kết giữa chặng củng cố ý chính trước khi mở nhóm kiến thức mới. */
export function checkpointHTML(state) {
  const previous = chapters[Math.max(0, Math.floor(state.currentIndex / 4) - 1)];
  const next = chapters[Math.floor(state.currentIndex / 4)];
  return `<section class="checkpoint"><span class="completion-icon">${icon('check',40)}</span><p class="eyebrow">HỒ SƠ ${previous.number} ĐÃ ĐƯỢC GIẢI MÃ</p><h1>${previous.title}</h1><p>Bạn đã hoàn thành 4 thử thách với <strong>${chapterCorrect(previous,state)}/4 câu đúng</strong>.</p><div class="checkpoint-note"><span class="eyebrow">ĐIỀU ĐỌNG LẠI</span><p>${previous.notes[0]}</p><a href="#study/${previous.id}" class="text-link">Ôn lại hồ sơ này ↗</a></div><p class="next-chapter">Tiếp theo: ${next.title}</p><a href="#quiz" class="button primary">Mở hồ sơ ${next.number} ${icon('arrow',18)}</a></section>`;
}

/** Chỉ tổng hợp đáp án thật; câu sai có lời giải và liên kết quay về hồ sơ tương ứng. */
export function resultsHTML(state, bestScore) {
  const wrong = questions.filter(q => !state.answers[q.id]?.correct);
  return `<section class="results-heading"><span class="completion-icon">${icon('star',35)}</span><p class="eyebrow">HÀNH TRÌNH ĐÃ HOÀN THÀNH</p><h1>Mỗi lần giải mã,<br><em>một lần hiểu sâu hơn.</em></h1><p>Bạn đã đi qua 4 hồ sơ. Cùng nhìn lại những điều đã học nhé.</p><div class="result-stats"><div><strong>${getScore(state)}<small>/160</small></strong><span>ĐIỂM CỦA BẠN</span></div><div><strong>${16-wrong.length}<small>/16</small></strong><span>CÂU TRẢ LỜI ĐÚNG</span></div><div><strong>${formatTime(state.elapsedMs)}</strong><span>THỜI GIAN ĐÃ CHƠI</span></div></div><p class="best-score">${icon('star',16)} Kỷ lục trên trình duyệt này: <strong>${bestScore}/160 điểm</strong></p><div class="result-actions"><button class="button primary" data-action="restart">Giải mã lần nữa ${icon('arrow',18)}</button><a href="#study" class="button secondary">Mở sổ tay ôn tập</a></div></section><section class="result-detail"><div class="section-heading"><div><p class="eyebrow">NHÌN LẠI TỪNG HỒ SƠ</p><h2>Bạn đã đi được những gì?</h2></div></div><div class="chapter-summary">${chapters.map(c => `<a href="#study/${c.id}"><span>${icon(c.icon,24)}</span><div><strong>${c.title}</strong><small>${chapterCorrect(c,state)}/4 câu đúng</small></div>${icon('arrow',18)}</a>`).join('')}</div><h2 class="review-heading">${wrong.length ? `${wrong.length} câu để ôn lại` : 'Bạn đã giải mã trọn vẹn!'}</h2>${wrong.length ? wrong.map(q => `<details class="review-question"><summary>${escapeHTML(q.prompt)}</summary><div><p><strong>Bạn đã chọn:</strong> ${answerText(q,state.answers[q.id].value)}</p><p><strong>Đáp án đúng:</strong> ${answerText(q)}</p><p>${escapeHTML(q.explanation)}</p><a href="#study/${q.chapterId}" class="text-link">Ôn lại phần kiến thức này ↗</a>${sourceLinks(q.sourceIds)}</div></details>`).join('') : '<p class="all-correct">16/16 câu chính xác. Hãy thử kể lại hành trình bằng lời của mình để kiến thức trở nên bền vững hơn.</p>'}</section>`;
}

export function guideHTML() {
  return `<section class="page-heading"><p class="eyebrow">MỘT NGƯỜI CHƠI, BỐN CĂN PHÒNG BÍ ẨN</p><h1>Khám phá. Kết nối. Mở khóa.</h1><p>Bạn là người khám phá một kho tư liệu. Mỗi đồ vật giữ một phần của câu chuyện.</p></section><div class="guide-grid">${[
    ['01','Khám phá căn phòng','Chạm vào đồ vật phát sáng trên ảnh hoặc chọn tên đồ vật trong bảng nhiệm vụ. Đọc tư liệu và tìm chỉ dẫn được giấu bên trong.'],
    ['02','Thu thập manh mối','Bấm Thu thập để đưa vật phẩm vào túi. Mỗi vật phẩm được 20 điểm. Bạn có thể mở lại bất kỳ manh mối nào đã tìm thấy.'],
    ['03','Giải cơ cấu khóa','Tìm đủ 3 vật phẩm rồi thử khóa. Nhập mật mã, xếp sự kiện hoặc chạm 2 mảnh bản thảo để đổi chỗ. Thử sai và dùng gợi ý không mất điểm.'],
    ['04','Mở phòng tiếp theo','Mỗi cơ cấu khóa giải đúng được 100 điểm và một huy hiệu tri thức. Hoàn thành cả 4 phòng để nhận 640 điểm khám phá.']
  ].map(([number,title,text]) => `<article><span>${number}</span><h2>${title}</h2><p>${text}</p></article>`).join('')}</div><section class="guide-note"><h2>Bạn có thể dừng lại, rồi tiếp tục bất cứ lúc nào.</h2><p>Tiến độ được lưu trên trình duyệt và thiết bị đang dùng. Đồng hồ tạm dừng khi mở sổ tay hoặc chuyển sang tab khác. Xóa dữ liệu trình duyệt sẽ xóa tiến độ.</p><p>Các căn phòng và vật phẩm là bối cảnh hư cấu phục vụ học tập. Dữ kiện lịch sử có nguồn tham khảo; mật mã và bảng ký hiệu là quy ước của game.</p><p>Muốn tự kiểm tra kiến thức? Mục ôn tập riêng có 16 câu, mỗi câu đúng được 10 điểm, tối đa 160 điểm. Điểm ôn tập tách biệt với điểm khám phá.</p><button class="button primary" data-action="explore">Vào phòng giải mã ${icon('arrow',18)}</button></section>`;
}

export function sourcesHTML() {
  return `<section class="page-heading"><p class="eyebrow">HIỂU KIẾN THỨC TỪ NGUỒN GỐC</p><h1>Nguồn tham khảo</h1><p>Nội dung được diễn giải để tự ôn tập; các đường dẫn dưới đây giúp bạn đọc và đối chiếu.</p></section><div class="sources-page">${sources.map((source,i) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer"><span>0${i+1}</span><div><h2>${escapeHTML(source.title)}</h2><p>${new URL(source.url).hostname}</p></div>${icon('arrow',22)}</a>`).join('')}</div><p class="source-note">Các tình huống vận dụng do website biên soạn và được ghi rõ trong lời giải. Nội dung diễn giải không phải lời trích nguyên văn của Chủ tịch Hồ Chí Minh.</p>`;
}
