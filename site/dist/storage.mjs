import { getScore, validAnswer, isCorrect } from './game.mjs';
export const STORAGE_KEY = 'hcm-history-room:v1';
const damaged = 'Tiến độ cũ không còn hợp lệ. Bạn có thể bắt đầu một hành trình mới.';

/** Khôi phục có kiểm tra: dữ liệu trình duyệt có thể cũ, bị sửa hoặc bị ghi thiếu. */
export function loadProgress(storage, questions) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { state: null, bestScore: 0, warning: '' };
    const saved = JSON.parse(raw);
    const state = saved?.state;
    if (!state || state.version !== 1 || !Number.isInteger(state.currentIndex) || state.currentIndex < 0 || state.currentIndex >= questions.length
      || typeof state.completed !== 'boolean' || !Number.isFinite(state.elapsedMs) || state.elapsedMs < 0 || state.elapsedMs > Number.MAX_SAFE_INTEGER
      || !state.answers || typeof state.answers !== 'object' || Array.isArray(state.answers)) throw Error('invalid');
    const entries = Object.entries(state.answers);
    // Các đáp án phải là một đoạn liên tục từ đầu; không cho khôi phục sang câu chưa mở.
    const count = entries.length;
    if (count < state.currentIndex || count > state.currentIndex + 1 || (state.completed && (count !== questions.length || state.currentIndex !== questions.length - 1))) throw Error('sequence');
    const answers = {};
    for (let i = 0; i < count; i++) {
      const q = questions[i];
      const answer = state.answers[q.id];
      if (!answer || !validAnswer(q, answer.value)) throw Error('answer');
      answers[q.id] = { value: answer.value, correct: isCorrect(q, answer.value) };
    }
    const restored = { version: 1, currentIndex: state.currentIndex, completed: state.completed, elapsedMs: state.elapsedMs, answers };
    const best = saved.bestScore;
    const bestScore = Number.isInteger(best) && best >= 0 && best <= questions.length * 10 && best % 10 === 0 ? best : 0;
    return { state: restored, bestScore: Math.max(bestScore, getScore(restored)), warning: '' };
  } catch (error) {
    return { state: null, bestScore: 0, warning: error?.message === 'denied' || error?.name === 'SecurityError' ? 'Trình duyệt đang chặn lưu tiến độ. Bạn vẫn có thể chơi trong phiên này.' : damaged };
  }
}

/** Lỗi quyền hoặc hết dung lượng không được làm gián đoạn lượt chơi đang nằm trong bộ nhớ. */
export function saveProgress(storage, state, bestScore) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ state, bestScore: Math.max(bestScore, getScore(state)) }));
    return { saved: true, warning: '' };
  } catch {
    return { saved: false, warning: 'Chưa lưu được tiến độ trên trình duyệt. Bạn vẫn có thể tiếp tục chơi trong phiên này.' };
  }
}
