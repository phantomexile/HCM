import { questions } from './data.mjs';

/** Một lượt mới không mang theo điểm cũ; điểm tốt nhất được lưu riêng ở lớp lưu trữ. */
export function createGame() {
  return { version: 1, currentIndex: 0, answers: {}, elapsedMs: 0, completed: false };
}

/** Kiểm tra đủ lựa chọn trước khi chấm để tránh nộp câu rỗng hoặc ghép trùng đáp án. */
export function validAnswer(question, answer) {
  const ids = question.options.map(option => option.id);
  if (question.type === 'choice') return typeof answer === 'string' && ids.includes(answer);
  if (question.type === 'order') return Array.isArray(answer) && answer.length === ids.length && new Set(answer).size === ids.length && answer.every(id => ids.includes(id));
  if (question.type === 'match') return answer !== null && typeof answer === 'object' && !Array.isArray(answer)
    && Object.keys(answer).length === question.items.length
    && question.items.every(item => Object.hasOwn(answer, item.id) && ids.includes(answer[item.id]))
    && new Set(Object.values(answer)).size === question.items.length;
  return false;
}

/** So sánh theo kiểu câu hỏi, không phụ thuộc thứ tự thuộc tính trong câu ghép. */
export function isCorrect(question, answer) {
  if (!validAnswer(question, answer)) return false;
  if (question.type === 'choice') return answer === question.answer;
  if (question.type === 'order') return answer.every((id, index) => id === question.answer[index]);
  return question.items.every(item => answer[item.id] === question.answer[item.id]);
}

/** Chỉ câu hiện tại được nhận bài; câu đã chấm không được cộng điểm lại khi bấm nhiều lần. */
export function submitAnswer(state, question, answer) {
  const canonical = questions[state.currentIndex];
  if (state.completed || !canonical || canonical.id !== question.id || Object.hasOwn(state.answers, question.id) || !validAnswer(canonical, answer)) return state;
  return { ...state, answers: { ...state.answers, [question.id]: { value: structuredClone(answer), correct: isCorrect(canonical, answer) } } };
}

/** Tính điểm từ kết quả từng câu; không duy trì biến tổng điểm dễ bị cộng lặp. */
export function getScore(state) {
  return Object.values(state.answers).filter(answer => answer.correct).length * 10;
}

/** Chỉ chuyển sau khi có lời giải; câu cuối giữ chỉ số hợp lệ và đánh dấu hoàn thành. */
export function advance(state) {
  if (state.completed || !Object.hasOwn(state.answers, questions[state.currentIndex]?.id)) return state;
  return state.currentIndex === questions.length - 1 ? { ...state, completed: true } : { ...state, currentIndex: state.currentIndex + 1 };
}

/** Mốc thời gian dùng performance.now; null biểu thị đang tạm dừng ngoài màn chơi. */
export function elapsedAt(elapsedMs, activeSince, now) {
  return elapsedMs + (activeSince === null ? 0 : Math.max(0, now - activeSince));
}
