import { rooms, createQuest, collectClue, solveRoom, nextRoom, questScore, restoreQuest } from './quest.mjs';
import { sources } from './data.mjs';
import { icon } from './icons.mjs';
import { escapeHTML as e, formatTime } from './views.mjs';
import { elapsedAt } from './game.mjs';

const KEY='hcm-escape-room:v1';
/** Bộ điều khiển phòng: khám phá đồ vật, túi manh mối, giải khóa và tiến sang phòng mới. */
export function createRoomGame(root, notify) {
  let state=createQuest(), active=false, startedAt=null, modal=null, toast='', error='', draft=[], selectedTile=null, draftRoom=-1;
  let store;
  try { store=localStorage; const raw=store.getItem(KEY); if(raw){ const saved=restoreQuest(raw); if(saved)state=saved; else notify('Lượt khám phá cũ không còn hợp lệ. Một hành trình mới đã sẵn sàng.'); } }
  catch { notify('Trình duyệt đang chặn lưu. Bạn vẫn chơi được trong phiên này.'); }
  const room=()=>rooms[state.roomIndex];
  const found=()=>state.found[room().id]||[];
  const solved=()=>state.solved.includes(room().id);

  /** Lưu độc lập với bộ trắc nghiệm để việc chuyển chế độ không làm mất lượt cũ. */
  function save() { try { store.setItem(KEY,JSON.stringify(state)); } catch { notify('Chưa lưu được hành trình. Bạn vẫn có thể chơi tiếp trong phiên này.'); } }
  function pause() { if(startedAt!==null)state={...state,elapsedMs:elapsedAt(state.elapsedMs,startedAt,performance.now())};startedAt=null; }
  function resume() { if(active&&!state.completed&&!document.hidden&&startedAt===null)startedAt=performance.now(); }
  function deactivate() { pause(); if(active)save(); active=false; modal=null; }

  const links=ids=>`<div class="quest-sources">${ids.map(id=>sources.find(s=>s.id===id)).map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${e(s.title)} ↗</a>`).join('')}</div>`;
  function introPanel() {
    return `<div class="mission-heading"><span>HỒ SƠ ${String(state.roomIndex+1).padStart(2,'0')}</span><span>KHÁM PHÁ & GIẢI MÃ</span></div><h2>${room().title}</h2><p class="mission-story">${room().intro}</p><div class="mission-task"><span class="quest-eyebrow">NHIỆM VỤ HIỆN TẠI</span><p>${solved()?'Cánh cửa đã mở. Mang tri thức sang căn phòng tiếp theo.':found().length<3?'Khám phá 3 đồ vật phát sáng trong căn phòng.':room().mission}</p></div><div class="mission-checklist">${room().items.map(item=>`<button data-qact="inspect" data-item="${item.id}" class="${found().includes(item.id)?'found':''}"><span>${found().includes(item.id)?'✓':'○'}</span>${item.name}<span>${found().includes(item.id)?'Đã thu thập':'Khám phá →'}</span></button>`).join('')}</div><button class="quest-button ${found().length===3?'gold':'outline'}" data-qact="lock">${solved()?'Xem thành quả':found().length===3?'Giải cơ cấu khóa':'Kiểm tra ổ khóa'} ${icon('arrow',18)}</button><button class="quest-hint" data-qact="hint">${icon('hint',16)} Cần một gợi ý?</button>`;
  }

  /** Dựng vùng chạm trên cùng nền ảnh; nút có tên đầy đủ để dùng được với bàn phím. */
  function sceneHTML() {
    return `<div class="room-scene" style="--room-position:${room().art}"><div class="scene-shade"></div><div class="room-caption"><span class="live-dot"></span>${room().location}<small>${room().period}</small></div><span class="scene-tip">CHẠM VÀO ĐỒ VẬT ĐỂ KHÁM PHÁ</span>${room().items.map((item,i)=>`<button class="hotspot ${found().includes(item.id)?'collected':''}" style="left:${i===0?22:i===1?48:82}%;top:${i===0?29:i===1?80:78}%" data-qact="inspect" data-item="${item.id}" aria-label="Khám phá ${item.name}"><span class="hotspot-ring">${found().includes(item.id)?icon('check',20):icon(item.icon,21)}</span><span class="hotspot-label">${item.name}</span></button>`).join('')}<button class="hotspot lock-hotspot ${solved()?'collected':found().length===3?'ready':''}" style="left:${state.roomIndex===2?83:91}%;top:${state.roomIndex===2?40:48}%" data-qact="lock" aria-label="Mở ${room().lockTitle}"><span class="hotspot-ring">${solved()?icon('check',23):'<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>'}</span><span class="hotspot-label">${solved()?'Đã mở khóa':'Cơ cấu khóa'}</span></button><span class="art-caption">BỐI CẢNH MINH HỌA HƯ CẤU</span></div>`;
  }

  function inventoryHTML() {
    return `<div class="inventory"><div class="inventory-title">${icon('book',23)}<span>TÚI MANH MỐI<small>${found().length}/3 vật phẩm</small></span></div><div class="inventory-slots">${room().items.map(item=>found().includes(item.id)?`<button data-qact="inspect" data-item="${item.id}" title="Xem lại ${item.name}">${icon(item.icon,20)}<span>${item.name}</span><small>✓</small></button>`:`<div class="inventory-empty" aria-label="Ô vật phẩm chưa tìm thấy"><span>?</span><small>Chưa tìm thấy</small></div>`).join('')}</div></div>`;
  }

  /** Bảng hoàn thành phản ánh vật phẩm và phòng đã giải, không dùng số liệu mẫu. */
  function finishHTML() {
    return `<section class="quest-finale"><div class="finale-orbit">${icon('star',54)}</div><p class="quest-eyebrow">BẠN ĐÃ MỞ KHÓA CẢ BỐN CĂN PHÒNG</p><h1>Hành trình khép lại.<br><em>Tri thức còn ở lại.</em></h1><p>12 manh mối. 4 cơ cấu khóa. Một hành trình tìm hiểu lịch sử tư tưởng Hồ Chí Minh.</p><div class="finale-stats"><div><strong>${questScore(state)}</strong><span>ĐIỂM KHÁM PHÁ</span></div><div><strong>12/12</strong><span>VẬT PHẨM</span></div><div><strong>${formatTime(state.elapsedMs)}</strong><span>THỜI GIAN CHƠI</span></div></div><div class="medal-row">${rooms.map((r,i)=>`<div><span>${icon(['compass','book','seed','star'][i],26)}</span><strong>${r.reward}</strong><small>PHÒNG 0${i+1}</small></div>`).join('')}</div><div class="finale-actions"><button class="quest-button gold" data-qact="restart">Khám phá lại từ đầu ${icon('arrow',18)}</button><a class="quest-button outline" href="#quiz">Thử sức với 16 câu ôn tập</a></div><a href="#home" class="quest-home-link">← Về trang chủ</a></section>`;
  }

  /** Vẽ lại giữ nguyên trạng thái vật phẩm; chỉ khởi tạo bảng ghép khi sang phòng khác. */
  function render() {
    pause(); active=true;
    if(draftRoom!==state.roomIndex){draftRoom=state.roomIndex;draft=room().type==='tiles'?room().pieces.map(p=>p.id):[];selectedTile=null;}
    document.body.classList.add('game-mode');
    root.innerHTML=state.completed?finishHTML():`<div class="quest-topbar"><a href="#home" class="quest-back">← Phòng giải mã</a><div class="room-stepper" aria-label="Tiến độ các phòng">${rooms.map((r,i)=>`<span class="${i===state.roomIndex?'current':''} ${state.solved.includes(r.id)?'done':''}" title="${e(r.title)}">${state.solved.includes(r.id)?'✓':String(i+1).padStart(2,'0')}</span>${i<3?'<i></i>':''}`).join('')}</div><div class="quest-counters"><span>${icon('star',16)} <strong>${questScore(state)}</strong></span><span>${icon('clock',16)} <strong id="quest-timer">${formatTime(state.elapsedMs)}</strong></span></div></div><div class="quest-title-row"><div><p class="quest-eyebrow">CHƯƠNG ${String(state.roomIndex+1).padStart(2,'0')} / CUỘC PHIÊU LƯU TRI THỨC</p><h1>${room().title}</h1></div><span class="quest-save-label">● Tự lưu hành trình</span></div><div class="quest-layout"><section class="room-stage" aria-label="Căn phòng tương tác">${sceneHTML()}${inventoryHTML()}</section><aside class="mission-panel">${introPanel()}</aside></div><div class="quest-bottom"><p id="quest-toast" role="status">${e(toast||'Mẹo: khám phá đồ vật, đọc manh mối, rồi thử mở ổ khóa. Không bị trừ điểm khi thử sai.')}</p><div><a href="#study/${room().chapterId}">Sổ tay tư liệu ↗</a><button data-qact="restart">Chơi lại</button></div></div><dialog id="quest-modal" class="quest-modal" aria-labelledby="quest-modal-title"></dialog>`;
    if(modal&&!state.completed)openModal();
    save();resume();
  }

  /** Cơ cấu số, xếp sự kiện và phục chế mảnh giấy dùng những thao tác khác nhau trong cùng vòng chơi. */
  function puzzleHTML() {
    const r=room();
    if(r.type==='pin')return `<label class="pin-label" for="quest-pin">MẬT MÃ 4 CHỮ SỐ</label><input id="quest-pin" name="pin" class="pin-input" inputmode="numeric" autocomplete="off" maxlength="4" pattern="[0-9]{4}" placeholder="• • • •" aria-label="Mật mã 4 chữ số"><div class="keypad">${['1','2','3','4','5','6','7','8','9','clear','0','back'].map(key=>`<button type="button" data-qact="key" data-key="${key}" aria-label="${key==='clear'?'Xóa mật mã':key==='back'?'Xóa số cuối':key}">${key==='clear'?'Xóa':key==='back'?'⌫':key}</button>`).join('')}</div>`;
    if(r.type==='sequence')return `<div class="sequence-slots">${[0,1,2].map(i=>`<div><small>${i+1}</small><span>${e(r.pieces.find(p=>p.id===draft[i])?.text||'Chọn mảnh')}</span></div>`).join('')}</div><div class="sequence-pieces">${r.pieces.map(p=>`<button type="button" data-qact="sequence" data-piece="${p.id}" ${draft.includes(p.id)?'disabled':''}>${icon('book',18)}${e(p.text)}</button>`).join('')}</div><button type="button" class="puzzle-reset" data-qact="reset-puzzle">↺ Xếp lại từ đầu</button>`;
    return `<div class="torn-paper" aria-label="Bản thảo sáu mảnh">${draft.map((id,i)=>`<button type="button" class="paper-piece ${selectedTile===i?'selected':''}" data-qact="tile" data-index="${i}" aria-label="Mảnh ${i+1}: ${r.pieces.find(p=>p.id===id).text}" aria-pressed="${selectedTile===i}"><small>${i+1}</small>${r.pieces.find(p=>p.id===id).text}</button>`).join('')}</div><p class="puzzle-instruction">${selectedTile===null?'Chọn 2 mảnh bất kỳ để đổi chỗ.':'Đã chọn một mảnh. Chạm mảnh thứ hai để đổi chỗ.'}</p>`;
  }

  function openModal() {
    const dialog=root.querySelector('#quest-modal'); if(!dialog)return;
    const item=room().items.find(item=>item.id===modal);
    let content='';
    if(item) content=`<span class="modal-symbol">${icon(item.icon,35)}</span><p class="quest-eyebrow">VẬT PHẨM ${found().includes(item.id)?'ĐÃ THU THẬP':'VỪA TÌM THẤY'}</p><h2 id="quest-modal-title">${item.name}</h2><p>${item.text}</p><div class="clue-slip"><span>MANH MỐI</span><strong>${item.clue}</strong></div><p class="item-note">${item.note}</p><p class="fiction-label">Vật phẩm mô phỏng phục vụ trò chơi; không phải hiện vật gốc.</p>${links(room().sourceIds)}<button class="quest-button gold" data-qact="${found().includes(item.id)?'close':'collect'}" data-item="${item.id}">${found().includes(item.id)?'Trở lại căn phòng':'Thu thập manh mối · +20'} ${icon('arrow',18)}</button>`;
    else if(modal==='hint') content=`<span class="modal-symbol">${icon('hint',35)}</span><p class="quest-eyebrow">MỘT CHÚT ÁNH SÁNG</p><h2 id="quest-modal-title">Gợi ý cho bạn</h2><p>${found().length<3?'Chạm vào bản đồ hoặc tờ ghi chú bên trái, cuốn sổ trên bàn và vật phẩm ở góc phải. Bấm “Thu thập manh mối” sau khi đọc.':room().hint}</p><button class="quest-button gold" data-qact="close">Tiếp tục khám phá</button>`;
    else if(modal==='restart') content=`<p class="quest-eyebrow">KHỞI ĐẦU MỚI</p><h2 id="quest-modal-title">Chơi lại từ phòng đầu?</h2><p>Vật phẩm, phòng đã mở và điểm khám phá của hành trình này sẽ được đặt lại. Phần ôn tập trắc nghiệm vẫn được giữ.</p><div class="modal-actions"><button class="quest-button outline" data-qact="close">Giữ hành trình</button><button class="quest-button gold" data-qact="confirm-restart">Chơi lại</button></div>`;
    else if(solved()) content=`<div class="unlock-burst">${icon('star',48)}</div><p class="quest-eyebrow">CƠ CẤU KHÓA ĐÃ ĐƯỢC GIẢI MÃ</p><h2 id="quest-modal-title">Bạn nhận được<br>“${room().reward}”</h2><span class="reward-points">+100 ĐIỂM KHÁM PHÁ</span><p>${room().takeaway}</p>${links(room().sourceIds)}<button class="quest-button gold" data-qact="next-room">${state.roomIndex===3?'Hoàn thành hành trình':'Bước sang phòng tiếp theo'} ${icon('arrow',18)}</button>`;
    else if(found().length<3) content=`<span class="modal-symbol">${icon('compass',35)}</span><p class="quest-eyebrow">Ổ KHÓA CHƯA SẴN SÀNG</p><h2 id="quest-modal-title">Còn thiếu manh mối</h2><p>Bạn đã tìm được ${found().length}/3 vật phẩm. Hãy khám phá căn phòng để có đủ chỉ dẫn trước khi thử khóa.</p><button class="quest-button gold" data-qact="close">Quay lại khám phá</button>`;
    else content=`<p class="quest-eyebrow">CƠ CẤU KHÓA / PHÒNG 0${state.roomIndex+1}</p><h2 id="quest-modal-title">${room().lockTitle}</h2><p>${room().lockInstruction}</p><details class="lock-clues"><summary>Xem các manh mối đã thu thập</summary>${room().items.map(i=>`<p>${i.clue}</p>`).join('')}</details><form id="quest-lock-form" novalidate>${puzzleHTML()}<p class="quest-error" role="alert" ${error?'':'hidden'}>${e(error)}</p><button type="submit" class="quest-button gold">Thử mở khóa ${icon('arrow',18)}</button></form>`;
    dialog.innerHTML=`<button class="modal-close" data-qact="close" aria-label="Đóng cửa sổ">×</button>${content}`;
    if(!dialog.open)dialog.showModal();
    dialog.addEventListener('cancel',()=>{modal=null;error='';},{once:true});
  }

  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-qact]');if(!button||button.disabled||!active)return;
    const action=button.dataset.qact;
    if(action==='key') {const input=root.querySelector('#quest-pin');const key=button.dataset.key;input.value=key==='clear'?'':key==='back'?input.value.slice(0,-1):(input.value+key).slice(0,4);input.dispatchEvent(new Event('input',{bubbles:true}));return;}
    if(action==='inspect'){modal=button.dataset.item;error='';openModal();return;}
    if(action==='close'){modal=null;error='';root.querySelector('#quest-modal')?.close();return;}
    if(action==='collect'){state=collectClue(state,button.dataset.item);modal=null;toast='✓ Đã thu thập manh mối. +20 điểm khám phá';render();return;}
    if(action==='lock'||action==='hint'||action==='restart'){modal=action;error='';if(state.completed&&action==='restart'){state=createQuest();draftRoom=-1;modal=null;toast='';}render();return;}
    if(action==='confirm-restart'){pause();state=createQuest();draftRoom=-1;modal=null;toast='';render();return;}
    if(action==='next-room'){pause();state=nextRoom(state);modal=null;toast='';render();window.scrollTo({top:0,behavior:'instant'});return;}
    if(action==='sequence'){if(!draft.includes(button.dataset.piece)&&draft.length<3)draft.push(button.dataset.piece);error='';openModal();return;}
    if(action==='reset-puzzle'){draft=[];error='';openModal();return;}
    if(action==='tile'){const index=Number(button.dataset.index);if(selectedTile===null)selectedTile=index;else{[draft[selectedTile],draft[index]]=[draft[index],draft[selectedTile]];selectedTile=null;}error='';openModal();}
  });
  root.addEventListener('submit',event=>{
    if(event.target.id!=='quest-lock-form'||!active)return;
    event.preventDefault();pause();
    const input=room().type==='pin'?new FormData(event.target).get('pin'):draft;
    const result=solveRoom(state,input);state=result.state;save();
    if(result.success){error='';modal='lock';render();}else{error=result.message;openModal();resume();}
  });
  document.addEventListener('visibilitychange',()=>{pause();if(active)save();resume();});
  window.addEventListener('pagehide',()=>{pause();if(active)save();});
  window.addEventListener('pageshow',resume);
  setInterval(()=>{const label=root.querySelector('#quest-timer');if(active&&label)label.textContent=formatTime(elapsedAt(state.elapsedMs,startedAt,performance.now()));},1000);
  return {render,deactivate,summary:()=>({completed:state.completed,roomsSolved:state.solved.length,items:Object.values(state.found).flat().length,score:questScore(state)})};
}
