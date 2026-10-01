import test from 'node:test';
import assert from 'node:assert/strict';
import { rooms, createQuest, collectClue, solveRoom, nextRoom, questScore, restoreQuest } from '../dist/quest.mjs';

// Kiểm tra vòng chơi thật: phải khám phá đủ vật phẩm trước khi giải khóa, không cộng thưởng lặp.
test('không mở khóa khi chưa thu đủ manh mối', () => {
  const initial = createQuest();
  const result = solveRoom(initial, rooms[0].solution);
  assert.equal(result.success,false);
  assert.deepEqual(result.state,initial);
});
test('thu vật phẩm chỉ một lần và không thể lấy vật phẩm ở phòng chưa mở', () => {
  const initial = createQuest();
  const one = collectClue(initial, rooms[0].items[0].id);
  assert.equal(questScore(one),20);
  assert.deepEqual(collectClue(one, rooms[0].items[0].id),one);
  assert.deepEqual(collectClue(one, rooms[1].items[0].id),one);
  assert.deepEqual(nextRoom(one),one);
});
test('thử sai vẫn giữ vật phẩm, giải đúng thưởng một lần và mở phòng kế', () => {
  let state = createQuest();
  for (const item of rooms[0].items) state = collectClue(state,item.id);
  const wrong = solveRoom(state,'0000');
  assert.equal(wrong.success,false);
  assert.equal(questScore(wrong.state),60);
  assert.equal(wrong.state.attempts[rooms[0].id],1);
  const right = solveRoom(wrong.state,rooms[0].solution);
  assert.equal(right.success,true);
  assert.equal(questScore(right.state),160);
  assert.equal(questScore(solveRoom(right.state,rooms[0].solution).state),160);
  assert.equal(nextRoom(right.state).roomIndex,1);
});
test('bốn phòng hoàn thành bằng khám phá và các cơ chế khóa khác nhau', () => {
  let state = createQuest();
  for (const room of rooms) {
    for (const item of room.items) state = collectClue(state,item.id);
    const result = solveRoom(state,room.solution);
    assert.equal(result.success,true,room.id);
    state = nextRoom(result.state);
  }
  assert.equal(state.completed,true);
  assert.equal(questScore(state),640);
});
test('lưu hỏng, phòng vượt tiến độ hoặc vật phẩm lạ không được khôi phục', () => {
  for (const state of [{...createQuest(),roomIndex:3},{...createQuest(),completed:true},{...createQuest(),found:{harbor:['unknown']}},{...createQuest(),solved:['paris']},{...createQuest(),version:100}]) {
    assert.equal(restoreQuest(JSON.stringify(state)),null);
  }
  assert.equal(restoreQuest('{bad'),null);
  let state = collectClue(createQuest(),rooms[0].items[0].id);
  assert.deepEqual(restoreQuest(JSON.stringify(state)),state);
});
