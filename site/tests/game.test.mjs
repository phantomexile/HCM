import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, submitAnswer, advance, getScore, elapsedAt, validAnswer } from '../dist/game.mjs';
import { questions } from '../dist/data.mjs';

// Kiểm tra quy tắc nghiệp vụ bằng lượt chơi thật: điểm chỉ được cộng một lần.
test('câu đúng được 10 điểm và nộp lặp không thay đổi kết quả', () => {
  const original = createGame();
  const next = submitAnswer(original, questions[0], questions[0].answer);
  assert.equal(getScore(next), 10);
  assert.equal(getScore(original), 0);
  assert.deepEqual(submitAnswer(next, questions[0], 'khong-ton-tai'), next);
});
test('không nhận câu tương lai hoặc đáp án không có trong lựa chọn', () => {
  const state = createGame();
  assert.deepEqual(submitAnswer(state, questions[1], questions[1].answer), state);
  assert.deepEqual(submitAnswer(state, questions[0], '__proto__'), state);
  assert.deepEqual(advance(state), state);
});
test('câu sai được 0 điểm nhưng vẫn được đi tiếp', () => {
  const q = questions[0];
  const wrong = q.options.find(o => o.id !== q.answer).id;
  const state = submitAnswer(createGame(), q, wrong);
  assert.equal(getScore(state), 0);
  assert.equal(state.answers[q.id].correct, false);
  assert.equal(advance(state).currentIndex, 1);
});
test('hoàn tất 16 câu, đạt 160 điểm và lượt mới bắt đầu từ 0', () => {
  let state = createGame();
  for (const q of questions) state = advance(submitAnswer(state, q, q.answer));
  assert.equal(state.completed, true);
  assert.equal(getScore(state), 160);
  assert.equal(Object.keys(state.answers).length, 16);
  assert.equal(getScore(createGame()), 0);
});
test('câu ghép và sắp xếp yêu cầu đủ mục, không nhận lựa chọn trùng', () => {
  const order = questions.find(q => q.type === 'order');
  assert.equal(validAnswer(order, order.answer), true);
  assert.equal(validAnswer(order, [order.answer[0], order.answer[0]]), false);
  assert.equal(validAnswer(order, [...order.answer].reverse()), true);
  const match = questions.find(q => q.type === 'match');
  assert.equal(validAnswer(match, match.answer), true);
  assert.equal(validAnswer(match, {}), false);
  assert.equal(validAnswer(match, Object.fromEntries(match.items.map(i => [i.id, match.options[0].id]))), false);
});
test('đồng hồ cộng thời gian đang chơi và không lùi khi mốc đồng hồ thay đổi', () => {
  assert.equal(elapsedAt(5000, 1000, 3500), 7500);
  assert.equal(elapsedAt(5000, null, 9000), 5000);
  assert.equal(elapsedAt(5000, 9000, 1000), 5000);
});
