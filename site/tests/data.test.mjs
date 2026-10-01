import test from 'node:test';
import assert from 'node:assert/strict';
import { chapters, questions, sources } from '../dist/data.mjs';
import { validAnswer } from '../dist/game.mjs';

// Một câu bị thiếu nguồn hoặc thiếu đáp án sẽ khiến người học nhận kiến thức không thể kiểm chứng.
test('mọi thử thách có đáp án hợp lệ, giải thích, gợi ý và nguồn tra cứu', () => {
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const q of questions) {
    assert.ok(chapters.some(c => c.id === q.chapterId));
    assert.ok(validAnswer(q, q.answer), q.id);
    assert.ok(q.explanation && q.hint);
    assert.ok(q.sourceIds.length);
    assert.ok(q.sourceIds.every(id => sources.some(s => s.id === id && new URL(s.url).protocol === 'https:')));
  }
  for (const chapter of chapters) assert.ok(questions.some(q => q.chapterId === chapter.id));
  assert.deepEqual([...new Set(questions.map(q => q.type))].sort(), ['choice', 'match', 'order']);
});
