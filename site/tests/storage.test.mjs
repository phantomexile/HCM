import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, submitAnswer, advance, getScore } from '../dist/game.mjs';
import { questions } from '../dist/data.mjs';
import { loadProgress, saveProgress, STORAGE_KEY } from '../dist/storage.mjs';

// Bộ lưu nhỏ thay localStorage để chủ động mô phỏng dữ liệu hỏng và trình duyệt chặn ghi.
function memory(raw = null) {
  let content = raw;
  return { getItem: () => content, setItem: (_key, value) => { content = value; } };
}
test('khôi phục lượt chơi đã lưu và giữ điểm tốt nhất khi chơi lại', () => {
  const store = memory();
  const state = advance(submitAnswer(createGame(), questions[0], questions[0].answer));
  assert.equal(saveProgress(store, state, 80).saved, true);
  const loaded = loadProgress(store, questions);
  assert.equal(loaded.state.currentIndex, 1);
  assert.equal(getScore(loaded.state), 10);
  assert.equal(loaded.bestScore, 80);
  saveProgress(store, createGame(), loaded.bestScore);
  assert.equal(loadProgress(store, questions).bestScore, 80);
  assert.ok(STORAGE_KEY);
});
test('dữ liệu hỏng, phiên bản cũ và trạng thái không hợp lệ được đặt lại an toàn', () => {
  const badStates = [
    { ...createGame(), version: 99 },
    { ...createGame(), currentIndex: -1 },
    { ...createGame(), currentIndex: 500 },
    { ...createGame(), elapsedMs: -10 },
    { ...createGame(), answers: { lost: { value: 'a', correct: true } } },
    { ...createGame(), currentIndex: 2 },
    { ...createGame(), completed: true },
  ];
  const raws = ['not json', 'null', ...badStates.map(state => JSON.stringify({ state, bestScore: 0 }))];
  for (const raw of raws) {
    const loaded = loadProgress(memory(raw), questions);
    assert.equal(loaded.state, null, raw);
    assert.ok(loaded.warning, raw);
  }
});
test('không tin cờ chấm đúng hoặc điểm tốt nhất sai định dạng trong dữ liệu lưu', () => {
  const q = questions[0];
  const wrong = q.options.find(o => o.id !== q.answer).id;
  const state = submitAnswer(createGame(), q, wrong);
  state.answers[q.id].correct = true;
  const loaded = loadProgress(memory(JSON.stringify({ state, bestScore: 99999 })), questions);
  assert.equal(getScore(loaded.state), 0);
  assert.equal(loaded.bestScore, 0);
});
test('khi lưu hoặc đọc bị chặn thì trả thông báo thay vì làm hỏng trò chơi', () => {
  const denied = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } };
  assert.ok(loadProgress(denied, questions).warning);
  const state = createGame();
  assert.equal(saveProgress(denied, state, 0).saved, false);
  assert.equal(state.currentIndex, 0);
});
