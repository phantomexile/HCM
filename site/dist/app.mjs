import { questions } from './data.mjs';
import { createGame, submitAnswer, advance, getScore, elapsedAt, validAnswer } from './game.mjs';
import { loadProgress, saveProgress } from './storage.mjs';
import { homeHTML, gameHTML, studyHTML, checkpointHTML, resultsHTML, guideHTML, sourcesHTML, formatTime } from './views.mjs';
import { createRoomGame } from './quest-game.mjs';

const main = document.querySelector('#main');
const notice = document.querySelector('#notice');
// Quyền truy cập localStorage có thể bị chặn; lỗi này không được ngăn người học mở trò chơi.
let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } }; }
const restored = loadProgress(storage, questions);
let state = restored.state;
let bestScore = restored.bestScore;
let activeSince = null;
let view = 'home';
let orderDraft = [];
let orderQuestionId = '';

/** Thông báo lỗi lưu nằm ngoài màn câu hỏi để không che đáp án hoặc làm mất thao tác. */
function showNotice(message) { notice.textContent = message; notice.hidden = !message; }
showNotice(restored.warning);
const adventure = createRoomGame(main,showNotice);

/** Chốt thời gian trước khi rời màn chơi; mốc null biểu thị đồng hồ đang tạm dừng. */
function pauseClock() {
  if (state && activeSince !== null) state = { ...state, elapsedMs: elapsedAt(state.elapsedMs, activeSince, performance.now()) };
  activeSince = null;
}
function resumeClock() {
  if (state && !state.completed && view === 'quiz' && !document.hidden && activeSince === null) activeSince = performance.now();
}
/** Kỷ lục tách biệt với lượt chơi nên vẫn còn sau khi người học chọn bắt đầu lại. */
function persist() {
  if (!state) return;
  bestScore = Math.max(bestScore, getScore(state));
  const result = saveProgress(storage, state, bestScore);
  if (!result.saved) showNotice(result.warning);
}

/** Dùng lại lượt chưa hoàn thành; chỉ tạo lượt mới khi người chơi chủ động bắt đầu lại. */
function startGame(fresh = false) {
  pauseClock();
  if (fresh || !state || state.completed) { state = createGame(); orderQuestionId = ''; }
  persist();
  navigate('quiz');
}
function navigate(route) {
  if (location.hash === `#${route}`) renderRoute(); else location.hash = route;
}

/** Đường dẫn chọn màn hiển thị, không cho xem kết quả của một lượt chưa hoàn tất. */
function renderRoute() {
  pauseClock(); persist(); adventure.deactivate();
  document.body.classList.remove('game-mode');
  const [requested, chapterId] = location.hash.slice(1).split('/');
  view = ['home','play','quiz','study','guide','sources','results','checkpoint'].includes(requested) ? requested : 'home';
  if (view === 'quiz' && !state) { state = createGame(); persist(); }
  if (view === 'quiz' && state?.completed) view = 'results';
  if (view === 'results' && !state?.completed) view = 'home';
  if (view === 'checkpoint' && (!state || state.completed || state.currentIndex === 0 || state.currentIndex % 4 !== 0)) view = 'home';
  if (view === 'home') main.innerHTML = homeHTML(state,bestScore,adventure.summary());
  if (view === 'play') adventure.render();
  if (view === 'study') main.innerHTML = studyHTML(chapterId,state);
  if (view === 'guide') main.innerHTML = guideHTML();
  if (view === 'sources') main.innerHTML = sourcesHTML();
  if (view === 'results') main.innerHTML = resultsHTML(state,bestScore);
  if (view === 'checkpoint') main.innerHTML = checkpointHTML(state);
  if (view === 'quiz') renderQuestion();
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === view || (link.dataset.nav === 'home' && ['play','quiz','checkpoint','results'].includes(view));
    link.classList.toggle('active',active);
    if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
  resumeClock();
  main.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/** Giữ thứ tự đang sắp xếp khi vẽ lại nút; chỉ đặt lại khi sang câu hỏi khác. */
function renderQuestion() {
  const q = questions[state.currentIndex];
  if (orderQuestionId !== q.id) { orderQuestionId = q.id; orderDraft = q.options.map(o => o.id); }
  main.innerHTML = gameHTML(state,state.answers[q.id]?.value && q.type === 'order' ? state.answers[q.id].value : orderDraft);
}

/** Thu đáp án từ form, kiểm tra đủ lựa chọn rồi chấm bằng cùng quy tắc đã kiểm thử. */
main.addEventListener('submit', event => {
  if (event.target.id !== 'answer-form') return;
  event.preventDefault();
  const q = questions[state.currentIndex];
  const data = new FormData(event.target);
  const answer = q.type === 'choice' ? data.get('answer') : q.type === 'order' ? orderDraft : Object.fromEntries(q.items.map(item => [item.id,data.get(item.id)]));
  if (!validAnswer(q,answer)) {
    const error = document.querySelector('#answer-error');
    error.textContent = q.type === 'match' ? 'Hãy ghép đủ các mục và chỉ dùng mỗi đáp án một lần.' : 'Bạn hãy chọn một đáp án trước khi kiểm tra.';
    error.hidden = false;
    return;
  }
  pauseClock(); state = submitAnswer(state,q,answer); persist(); renderQuestion(); resumeClock();
  document.querySelector('#feedback-title')?.focus({ preventScroll: true });
  document.querySelector('.feedback')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});

/** Gắn sự kiện một lần cho toàn màn, tránh gắn lặp khi chuyển câu và cộng điểm nhiều lần. */
main.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.action === 'explore') navigate('play');
  if (button.dataset.action === 'start') startGame();
  if (button.dataset.action === 'restart') {
    if (state && !state.completed) {
      const dialog=document.querySelector('#restart-dialog');
      // Xóa kết quả lần mở trước để nhấn Escape không bị hiểu nhầm là xác nhận chơi lại.
      dialog.returnValue=''; dialog.showModal();
    } else startGame(true);
  }
  if (button.dataset.action === 'next' && view === 'quiz') {
    pauseClock(); state = advance(state); persist();
    navigate(state.completed ? 'results' : state.currentIndex % 4 === 0 ? 'checkpoint' : 'quiz');
  }
  if (button.dataset.move && view === 'quiz') {
    const from = orderDraft.indexOf(button.dataset.id);
    const to = from + (button.dataset.move === 'up' ? -1 : 1);
    if (from < 0 || to < 0 || to >= orderDraft.length || state.answers[questions[state.currentIndex].id]) return;
    [orderDraft[from],orderDraft[to]] = [orderDraft[to],orderDraft[from]];
    renderQuestion();
    const moved = main.querySelector(`[data-id="${button.dataset.id}"][data-move="${button.dataset.move}"]`);
    if (moved && !moved.disabled) moved.focus({preventScroll:true});
    else main.querySelector(`[data-id="${button.dataset.id}"]:not(:disabled)`)?.focus({preventScroll:true});
  }
});
document.querySelector('#restart-dialog').addEventListener('close', event => { if (event.target.returnValue === 'restart') startGame(true); });
// Liên kết bỏ qua điều hướng chỉ chuyển tiêu điểm, không đổi màn hoặc mất đáp án đang chọn.
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();});
window.addEventListener('hashchange',renderRoute);
document.addEventListener('visibilitychange', () => { pauseClock(); persist(); resumeClock(); });
window.addEventListener('pagehide', () => { pauseClock(); persist(); });
window.addEventListener('pageshow', () => resumeClock());
// Một bộ hẹn giờ chỉ cập nhật chữ; thời lượng được tính từ mốc đơn điệu chứ không đếm số lần gọi.
setInterval(() => {
  const timer = document.querySelector('#timer');
  if (timer && state) timer.textContent = formatTime(elapsedAt(state.elapsedMs,activeSince,performance.now()));
},1000);
renderRoute();
