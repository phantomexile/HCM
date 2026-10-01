/** Bốn bối cảnh hư cấu phục vụ học tập; các dữ kiện lịch sử có nguồn riêng, mật mã là luật game. */
export const rooms = [
  { id:'harbor', title:'Tấm vé khởi hành', location:'BẾN NHÀ RỒNG', period:'1911', chapterId:'search', art:'0% 0%', accent:'#c69c64', type:'pin', solution:'1911', reward:'Khát vọng', mission:'Tìm lại năm khởi hành để mở chiếc rương hành lý.', intro:'Một tấm vé cũ bị nhòe mất năm. Trong căn phòng lưu trữ bên bến cảng, ba vật phẩm đang giữ những phần còn lại của câu chuyện.', lockTitle:'Chiếc rương khởi hành', lockInstruction:'Ổ khóa cần 4 chữ số: năm Nguyễn Tất Thành rời bến Nhà Rồng.', hint:'Đối chiếu tấm vé với ghi chú trong sổ. Năm cần tìm nằm ngay sau 1910.', takeaway:'Ngày 5/6/1911, Nguyễn Tất Thành rời bến Nhà Rồng tìm đường cứu nước. Khát vọng độc lập mở đầu một hành trình dài.', sourceIds:['journey'], items:[
    {id:'harbor-map',name:'Tấm bản đồ',icon:'compass',x:23,y:31,text:'Trên bản đồ, một sợi chỉ đỏ nối bến Nhà Rồng với hành trình ra nước ngoài.',clue:'ĐỊA ĐIỂM: BẾN NHÀ RỒNG',note:'Hãy tìm năm của chuyến đi, không phải ngày hoặc tháng.'},
    {id:'harbor-journal',name:'Sổ hành trình',icon:'book',x:49,y:65,text:'Ghi chú học tập: Nguyễn Tất Thành khởi hành ngày 5 tháng 6. Năm đó ở sau 1910 và trước 1912.',clue:'1910 < NĂM KHỞI HÀNH < 1912',note:'Bốn chữ số của năm cũng là mã chiếc rương.'},
    {id:'harbor-ticket',name:'Tấm vé cũ',icon:'flag',x:77,y:77,text:'Bạn tìm thấy một tấm vé mô phỏng với dòng ghi chú: “05 / 06 / 19••”. Hai chữ số cuối đã phai.',clue:'05 / 06 / 19••',note:'Kết hợp với sổ hành trình để khôi phục phần bị mất.'},
  ]},
  { id:'paris',title:'Những mảnh báo ở Paris',location:'CĂN GÁC PARIS',period:'1919 — 1920',chapterId:'search',art:'100% 0%',accent:'#81aeb8',type:'sequence',solution:['petition','thesis','tours'],reward:'Con đường',mission:'Tìm ba mảnh tư liệu và xếp chúng theo dòng thời gian.',intro:'Một chiếc hộp chỉ mở khi các sự kiện trở về đúng vị trí. Khám phá căn gác để ghép lại bước ngoặt trong hành trình tìm đường cứu nước.',lockTitle:'Hộp thời gian',lockInstruction:'Chạm các mảnh tư liệu theo thứ tự từ sớm đến muộn. Không cần gõ đáp án.',hint:'Bản Yêu sách thuộc năm 1919. Đọc Luận cương vào tháng 7, Đại hội Tua vào tháng 12 năm 1920.',takeaway:'Từ bản Yêu sách năm 1919 đến việc đọc Luận cương và tham dự Đại hội Tua năm 1920 là những dấu mốc quan trọng trong chuyển biến nhận thức của Nguyễn Ái Quốc.',sourceIds:['bio','lenin','journey'],pieces:[{id:'tours',text:'Đại hội Tua'},{id:'petition',text:'Bản Yêu sách'},{id:'thesis',text:'Đọc Luận cương'}],items:[
    {id:'paris-news',name:'Mảnh báo',icon:'book',x:22,y:30,text:'Tháng 7/1920, Nguyễn Ái Quốc đọc Luận cương của Lênin về vấn đề dân tộc và thuộc địa trên báo L’Humanité.',clue:'ĐỌC LUẬN CƯƠNG · 07/1920',note:'Đây là một dấu mốc ở giữa chuỗi sự kiện trong hộp.'},
    {id:'paris-book',name:'Tập ghi chép',icon:'compass',x:49,y:64,text:'Tháng 12/1920, tại Đại hội Tua, Người tán thành Quốc tế III và tham gia sáng lập Đảng Cộng sản Pháp.',clue:'ĐẠI HỘI TUA · 12/1920',note:'Tháng 12 đến sau tháng 7.'},
    {id:'paris-letter',name:'Phong thư',icon:'flag',x:77,y:78,text:'Năm 1919, bản Yêu sách của nhân dân An Nam được gửi tới Hội nghị Véc-xây với tên Nguyễn Ái Quốc.',clue:'BẢN YÊU SÁCH · 1919',note:'Mảnh tư liệu này có niên đại sớm nhất.'},
  ]},
  { id:'print',title:'Bản thảo bị xé',location:'XƯỞNG IN TƯ LIỆU',period:'NHỮNG NĂM 1920',chapterId:'develop',art:'0% 100%',accent:'#d2a162',type:'tiles',solution:['tu','tuong','chinh','tri','to','chuc'],reward:'Nền tảng',mission:'Thu thập chỉ dẫn rồi ghép lại bản thảo sáu mảnh.',intro:'Bản thảo quan trọng đã bị xáo trộn. Tìm các chỉ dẫn trong xưởng in, rồi đổi chỗ từng cặp mảnh giấy để khôi phục ba dòng chữ.',lockTitle:'Bàn phục chế bản thảo',lockInstruction:'Chạm một mảnh, rồi chạm mảnh khác để đổi chỗ. Ghép thành 3 dòng, mỗi dòng 2 từ, theo chỉ dẫn đã tìm.',hint:'Từ trên xuống: TƯ TƯỞNG / CHÍNH TRỊ / TỔ CHỨC.',takeaway:'Hoạt động của Nguyễn Ái Quốc trong những năm 1920 góp phần chuẩn bị về tư tưởng, chính trị và tổ chức cho sự ra đời của Đảng Cộng sản Việt Nam.',sourceIds:['path'],pieces:[{id:'chuc',text:'CHỨC'},{id:'tu',text:'TƯ'},{id:'tri',text:'TRỊ'},{id:'to',text:'TỔ'},{id:'tuong',text:'TƯỞNG'},{id:'chinh',text:'CHÍNH'}],items:[
    {id:'print-poster',name:'Tờ ghi chú',icon:'flag',x:23,y:30,text:'Chỉ dẫn phục chế: dòng đầu nói về nhận thức, lý luận và việc truyền bá những quan điểm cách mạng.',clue:'DÒNG 1: TƯ TƯỞNG',note:'Hai mảnh “TƯ” và “TƯỞNG” thuộc hàng trên cùng.'},
    {id:'print-blocks',name:'Bộ chữ in',icon:'book',x:49,y:64,text:'Chỉ dẫn phục chế: dòng giữa nói về đường lối và mục tiêu cách mạng.',clue:'DÒNG 2: CHÍNH TRỊ',note:'Hai mảnh “CHÍNH” và “TRỊ” thuộc hàng giữa.'},
    {id:'print-paper',name:'Bó bản thảo',icon:'seed',x:77,y:77,text:'Chỉ dẫn phục chế: dòng cuối nói về chuẩn bị lực lượng, đào tạo cán bộ và xây dựng tổ chức.',clue:'DÒNG 3: TỔ CHỨC',note:'Hai mảnh “TỔ” và “CHỨC” thuộc hàng cuối.'},
  ]},
  { id:'values',title:'Chiếc hộp giá trị',location:'PHÒNG LƯU TRỮ',period:'HIỂU ĐỂ VẬN DỤNG',chapterId:'values',art:'100% 100%',accent:'#9aba91',type:'pin',solution:'2413',reward:'Hành động',mission:'Dùng bảng ký hiệu để giải mật mã cuối cùng.',intro:'Chiếc hộp cuối cùng không dùng một năm lịch sử. Mật mã nằm trong cách liên kết bốn phẩm chất với ký hiệu bạn tìm được.',lockTitle:'Chiếc hộp giá trị',lockInstruction:'Nhập mã theo thứ tự CẦN → KIỆM → LIÊM → CHÍNH. Các số là quy ước của trò chơi, không phải dữ kiện lịch sử.',hint:'Ghép hai nửa bảng: Cần = 2, Kiệm = 4, Liêm = 1, Chính = 3. Giữ đúng thứ tự trên ổ khóa.',takeaway:'Cần, kiệm, liêm, chính cần được rèn luyện qua hành động. Trong học tập, hãy thực hành bằng sự chăm chỉ, tiết kiệm thời gian, trung thực và trách nhiệm.',sourceIds:['ethics','unity'],items:[
    {id:'values-photo',name:'Khung tư liệu',icon:'star',x:23,y:30,text:'Đại đoàn kết hướng đến phát huy sức mạnh của nhân dân vì lợi ích chung. Phía sau khung là chỉ dẫn cho chiếc hộp.',clue:'THỨ TỰ: CẦN → KIỆM → LIÊM → CHÍNH',note:'Đây là thứ tự đọc mã trong game.'},
    {id:'values-notebook',name:'Sổ rèn luyện',icon:'book',x:49,y:64,text:'Cần: siêng năng, chăm chỉ. Kiệm: tiết kiệm, không lãng phí. Bên lề sổ có nửa đầu bảng ký hiệu.',clue:'CẦN = 2 · KIỆM = 4',note:'Ký hiệu số được đặt riêng cho câu đố này.'},
    {id:'values-card',name:'Thẻ ký hiệu',icon:'compass',x:77,y:77,text:'Liêm: trong sạch, không tham lam. Chính: ngay thẳng, đúng đắn. Bạn tìm thấy nửa bảng còn lại.',clue:'LIÊM = 1 · CHÍNH = 3',note:'Ghép hai nửa bảng để có đủ bốn số.'},
  ]},
];

/** Trạng thái game riêng biệt để giữ nguyên lượt trắc nghiệm cũ khi đổi trải nghiệm chính. */
export function createQuest() { return {version:1,roomIndex:0,found:{},solved:[],attempts:{},elapsedMs:0,completed:false}; }
export function questScore(state) { return Object.values(state.found).reduce((sum,items)=>sum+items.length*20,0)+state.solved.length*100; }
/** Chỉ thu vật phẩm thuộc phòng hiện tại và mỗi vật phẩm chỉ tạo điểm một lần. */
export function collectClue(state,itemId) {
  const room=rooms[state.roomIndex];
  const found=state.found[room.id]||[];
  if(state.completed || !room.items.some(item=>item.id===itemId) || found.includes(itemId)) return state;
  return {...state,found:{...state.found,[room.id]:[...found,itemId]}};
}
/** Đủ ba manh mối mới được giải khóa; một lần giải đúng không được nhận thưởng lặp. */
export function solveRoom(state,input) {
  const room=rooms[state.roomIndex];
  if(state.solved.includes(room.id)) return {state,success:true,message:'Phòng này đã được mở khóa.'};
  if((state.found[room.id]||[]).length!==room.items.length) return {state,success:false,message:'Hãy tìm đủ 3 manh mối trong phòng trước khi mở khóa.'};
  const correct=room.type==='pin' ? typeof input==='string' && input===room.solution : Array.isArray(input) && input.length===room.solution.length && input.every((id,i)=>id===room.solution[i]);
  const next={...state,attempts:{...state.attempts,[room.id]:(state.attempts[room.id]||0)+1}};
  return correct ? {state:{...next,solved:[...state.solved,room.id]},success:true,message:'Mở khóa thành công!'} : {state:next,success:false,message:'Cơ cấu khóa chưa khớp. Xem lại manh mối và thử tiếp — bạn không bị mất điểm.'};
}
/** Cửa ra chỉ mở sau khi giải khóa; phòng cuối đánh dấu hoàn tất thay vì tăng chỉ số quá giới hạn. */
export function nextRoom(state) {
  if(!state.solved.includes(rooms[state.roomIndex].id)||state.completed) return state;
  return state.roomIndex===rooms.length-1 ? {...state,completed:true} : {...state,roomIndex:state.roomIndex+1};
}
/** Không tin dữ liệu lưu: kiểm tra thứ tự phòng, vật phẩm duy nhất và thành tích thực tế. */
export function restoreQuest(raw) {
  try {
    const s=JSON.parse(raw);
    if(!s||s.version!==1||!Number.isInteger(s.roomIndex)||s.roomIndex<0||s.roomIndex>=rooms.length||!Array.isArray(s.solved)||typeof s.completed!=='boolean'||!Number.isFinite(s.elapsedMs)||s.elapsedMs<0||!s.found||typeof s.found!=='object'||Array.isArray(s.found)||!s.attempts||typeof s.attempts!=='object'||Array.isArray(s.attempts)) return null;
    if(s.solved.length>4||!s.solved.every((id,i)=>rooms[i].id===id)||s.solved.length<s.roomIndex||s.solved.length>s.roomIndex+1||s.completed&&(s.solved.length!==4||s.roomIndex!==3)) return null;
    for(const [id,items] of Object.entries(s.found)) {
      const index=rooms.findIndex(r=>r.id===id);
      if(index<0||index>s.roomIndex||!Array.isArray(items)||new Set(items).size!==items.length||!items.every(item=>rooms[index].items.some(i=>i.id===item))) return null;
    }
    if(s.solved.some(id=>s.found[id]?.length!==3)) return null;
    if(Object.entries(s.attempts).some(([id,count])=>!rooms.some(r=>r.id===id)||!Number.isInteger(count)||count<0)) return null;
    return {version:1,roomIndex:s.roomIndex,found:s.found,solved:s.solved,attempts:s.attempts,elapsedMs:s.elapsedMs,completed:s.completed};
  } catch {return null;}
}
