// gestion des fenêtres
// boutons du dock (hors troll)
const dockButtons=document.querySelectorAll('.dock-item[data-target]');
const trollBtn=document.getElementById('troll-button');
const alertBtn=document.getElementById('alert-btn');
const trollInSettings=document.getElementById('troll-btn');
// lecture de sons
function playSound(name){
  const audio=new Audio(`sons/${name}.mp3`);
  audio.volume=0.8;
  audio.play();
}

let callAudio;
function playCallSound(name){
  if(callAudio){callAudio.pause();callAudio.currentTime=0;}
  callAudio=new Audio(`sons/${name}.mp3`);
  callAudio.loop=true;
  callAudio.volume=0.8;
  callAudio.play();
  return callAudio;
}
function stopCallSound(){
  if(callAudio){callAudio.pause();callAudio.currentTime=0;}
}
const windows=document.querySelectorAll('.window');
const oppoWindow=document.getElementById('oppo-window');
const oppoContent=document.getElementById('oppo-content');
const phoneWindow=document.getElementById('phone-window');
const gameWindow=document.getElementById('game-window');
const birdsWindow=document.getElementById('birds-window');
let startGame2048;
let startBirdsGame;
let slide=0;
let carouselInit=false;
function initCarousel(){
  if(carouselInit) return;
  carouselInit=true;
  const track=oppoContent.querySelector('.carousel-track');
  const slides=[...track.children];
  const prev=oppoContent.querySelector('.carousel-btn.prev');
  const next=oppoContent.querySelector('.carousel-btn.next');
  const update=()=>track.style.transform=`translateX(-${slide*100}%)`;
  prev.onclick=()=>{slide=(slide-1+slides.length)%slides.length;update();};
  next.onclick=()=>{slide=(slide+1)%slides.length;update();};
  let start=null;
  track.addEventListener('touchstart',e=>start=e.touches[0].clientX);
  track.addEventListener('touchend',e=>{
    if(start===null) return;
    const diff=e.changedTouches[0].clientX-start;
    if(Math.abs(diff)>50){diff<0?next.onclick():prev.onclick();}
    start=null;
  });
  update();
}
dockButtons.forEach(btn=>{
  btn.addEventListener('click',()=>openWindow(document.getElementById(btn.dataset.target)));
});
trollBtn&&trollBtn.addEventListener('click',()=>playSound('yehaw'));
alertBtn&&alertBtn.addEventListener('click',launchAlert);
document.querySelectorAll('.window .close').forEach(c=>c.onclick=()=>c.parentElement.classList.remove('open'));

// slide down to close for touch devices
windows.forEach(w=>{
  let startY=null;
  const mobile=()=>window.innerWidth<=600;
  w.addEventListener('touchstart',e=>{
    if(!w.classList.contains('open')) return;
    startY=e.touches[0].clientY;
    w.style.transition='none';
  });
  w.addEventListener('touchmove',e=>{
    if(startY===null) return;
    const y=e.touches[0].clientY-startY;
    if(y<0) return;
    w.style.transform=mobile()?`translateY(${y}px)`:`translate(-50%, calc(-50% + ${y}px))`;
  });
  w.addEventListener('touchend',e=>{
    if(startY===null) return;
    const y=e.changedTouches[0].clientY-startY;
    w.style.transition='';
    w.style.transform='';
    if(y>100) w.classList.remove('open');
    startY=null;
  });
});

function openWindow(el){
  windows.forEach(w=>w.classList.remove('open'));
  if(el){
    el.classList.add('open');
    playSound('notif');
    if(el===oppoWindow) initCarousel();
    if(el===gameWindow && typeof startGame2048==='function') startGame2048();
    if(el===birdsWindow && typeof startBirdsGame==='function') startBirdsGame();
  }
}

// thème clair/sombre
const themeBtn=document.getElementById('theme-toggle');
if(localStorage.theme==='dark') document.body.classList.add('dark');
themeBtn.onclick=()=>{
  document.body.classList.toggle('dark');
  localStorage.theme=document.body.classList.contains('dark')?'dark':'light';
  playSound('success');
};

// messages (simple stockage local)
const messageArea=document.getElementById('message-area');
if(messageArea){
  messageArea.value=localStorage.messages||'';
  messageArea.addEventListener('input',()=>localStorage.messages=messageArea.value);
}

trollInSettings&&trollInSettings.addEventListener('click',()=>playSound('yehaw'));
document.querySelectorAll('#sound-test [data-sound]').forEach(btn=>{
  btn.addEventListener('click',e=>{
    const sound=e.currentTarget.dataset.sound;
    if(sound==='warning'){showAlert('Alerte \u26A0');}else{playSound(sound);}
  });
});

// Appels entrants
const callOverlay=document.getElementById('call-overlay');
const callCard=callOverlay.querySelector('.call-card');
const callPhoto=document.getElementById('call-photo');
const callTitle=document.getElementById('call-title');
const answerBtn=document.getElementById('call-answer');
const declineBtn=document.getElementById('call-decline');
const ignoreBtn=document.getElementById('call-ignore');
const alertOverlay=document.getElementById('alert-overlay');
const alertBox=alertOverlay.querySelector('.alert-box');
const alertOk=document.getElementById('alert-ok');
const alertIgnore=document.getElementById('alert-ignore');
const contacts={
  Rodrigue:{sound:'cat-iphone-ringtone',img:'img/contacts/rodrigue.svg'},
  Nouhaila:{sound:'cat-iphone-ringtone',img:'img/contacts/nouhaila.svg'},
  Bardella:{sound:'error',img:'img/contacts/bardella.svg'}
};
let callTimer;

function openCall(name, sound, img){
  callTitle.textContent=`${name} Appelle…`;
  callPhoto.src=img;
  callOverlay.classList.add('show');
  callCard.classList.add('ringing');
  playCallSound(sound);
  clearTimeout(callTimer);
  callTimer=setTimeout(closeCall,5000);
}

function closeCall(){
  stopCallSound();
  callOverlay.classList.remove('show');
  callCard.classList.remove('ringing');
  clearTimeout(callTimer);
}

function launchCall(name){
  const c=contacts[name];
  if(c) openCall(name,c.sound,c.img);
}

function openPhoneApp(){
  openWindow(phoneWindow);
}


answerBtn.addEventListener('click',closeCall);
declineBtn.addEventListener('click',closeCall);
ignoreBtn&&ignoreBtn.addEventListener('click',()=>{
  document.querySelector('.call-overlay').classList.remove('active');
  playSound('error');
});

let alertTimer;
function launchAlert(){
  playSound('error');
  if(navigator.vibrate) navigator.vibrate(200);
  alertOverlay.classList.add('show');
  alertBox.classList.add('shake');
  clearTimeout(alertTimer);
  alertTimer=setTimeout(closeAlert,10000);
  setTimeout(()=>alertBox.classList.remove('shake'),500);
}

function closeAlert(){
  alertOverlay.classList.remove('show');
  clearTimeout(alertTimer);
}

function showAlert(msg){
  playSound('warning');
  alert(msg);
}

// lecteur audio
const audio=document.getElementById('audio');
const playlistEl=document.getElementById('playlist');
const titleEl=document.getElementById('track-title');
const playBtn=document.getElementById('play');
const nextBtn=document.getElementById('next');
const prevBtn=document.getElementById('prev');
const seek=document.getElementById('seek');
const elapsed=document.getElementById('elapsed');
const duration=document.getElementById('duration');
const volume=document.getElementById('volume');
const loopBtn=document.getElementById('loop');
const shuffleBtn=document.getElementById('shuffle');
const coverImg=document.getElementById('cover-img');
const coverBox=document.querySelector('.cover');
const covers={}; // cache des jaquettes

// Liste des fichiers MP3.
// Si vous avez accès au serveur, générez ce tableau en scannant le dossier
// 'Musique' (ex. via fs.readdir) puis envoyez le résultat au client.
const tracks=[
  'Musique/Dj Hamida - Paname ft. Camro.mp3',
  'Musique/Silhouettes (Original Mix).mp3',
  'Musique/[SPOTIFY-DOWNLOADER.COM] Disco Maghreb.mp3',
  'Musique/[SPOTIFY-DOWNLOADER.COM] Kalimba.mp3',
  'Musique/[SPOTIFY-DOWNLOADER.COM] Proxy.mp3'
];

let current=0;
let playing=false;

function cleanTitle(path){
  let name=path.split('/').pop();
  name=name.replace(/\.[^/.]+$/, '');
  name=name.replace(/\[[^\]]*\]/g, '');
  return name.trim();
}

function loadPlaylist(){
  playlistEl.innerHTML='';
  tracks.forEach((t,i)=>{
    const li=document.createElement('li');
    li.textContent=cleanTitle(t);
    li.onclick=()=>{current=i; playTrack();};
    playlistEl.appendChild(li);
  });
  updateActive();
}

function updateActive(){
  playlistEl.querySelectorAll('li').forEach((li,i)=>{
    li.classList.toggle('active',i===current);
  });
}

function playTrack(){
  audio.src=tracks[current];
  audio.play();
  updateCover();
}

playBtn.onclick=()=>{
  if(playing){
    audio.pause();
  }else{
    if(!audio.src) playTrack(); else audio.play();
  }
};
nextBtn.onclick=()=>next();
prevBtn.onclick=()=>prev();

function next(){
  if(shuffleBtn.classList.contains('active')){
    current=Math.floor(Math.random()*tracks.length);
  }else{
    current=(current+1)%tracks.length;
  }
  playTrack();
}
function prev(){
  if(shuffleBtn.classList.contains('active')){
    current=Math.floor(Math.random()*tracks.length);
  }else{
    current=(current-1+tracks.length)%tracks.length;
  }
  playTrack();
}

function updateCover(){
  const track=tracks[current];
  if(track in covers){
    setCover(covers[track]);
    return;
  }
  jsmediatags.read(track,{
    onSuccess:tag=>{
      const pic=tag.tags.picture;
      if(pic){
        let str='';
        for(const b of pic.data){str+=String.fromCharCode(b);} 
        const img=`data:${pic.format};base64,${btoa(str)}`;
        covers[track]=img;
        setCover(img);
      }else{covers[track]=null; setCover(null);}
    },
    onError:()=>{covers[track]=null; setCover(null);}
  });
}

function setCover(src){
  if(src){
    coverImg.src=src;
    coverImg.style.display='block';
    coverBox.classList.remove('placeholder');
  }else{
    coverImg.removeAttribute('src');
    coverImg.style.display='none';
    coverBox.classList.add('placeholder');
  }
}

loopBtn.onclick=()=>{
  loopBtn.classList.toggle('active');
  audio.loop=loopBtn.classList.contains('active');
};
shuffleBtn.onclick=()=>shuffleBtn.classList.toggle('active');

volume.oninput=()=>{audio.volume=volume.value;};
seek.oninput=()=>{audio.currentTime=seek.value;};

audio.addEventListener('timeupdate',()=>{
  seek.value=audio.currentTime;
  elapsed.textContent=formatTime(audio.currentTime);
});

audio.addEventListener('durationchange',()=>{
  seek.max=audio.duration;
  duration.textContent=formatTime(audio.duration);
});

audio.addEventListener('play',()=>{
  document.querySelector('.player').classList.add('playing');
  playBtn.textContent='❚❚';
  playing=true;
  titleEl.textContent=cleanTitle(tracks[current]);
  updateActive();
  playSound('success');
});

audio.addEventListener('pause',()=>{
  document.querySelector('.player').classList.remove('playing');
  playBtn.textContent='▶️';
  playing=false;
});

audio.addEventListener('ended',()=>{next();});
audio.addEventListener('error',()=>playSound('error'));

function formatTime(s){
  if(isNaN(s)) return '0:00';
  const m=Math.floor(s/60);
  const sec=Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

loadPlaylist();
volume.dispatchEvent(new Event('input'));

window.addEventListener('resize',()=>{
  if(oppoWindow.classList.contains('open')) initCarousel();
});
initCarousel();

// 2048
if(gameWindow){
  const boardEl=gameWindow.querySelector('#board');
  const scoreEl=gameWindow.querySelector('#game-score');
  const replay=gameWindow.querySelector('.replay');
  const size=4;
  let board,score;

  function init(){
    boardEl.innerHTML='';
    for(let i=0;i<size*size;i++){
      const c=document.createElement('div');
      c.className='cell-bg';
      boardEl.appendChild(c);
    }
    board=Array.from({length:size},()=>Array(size).fill(0));
    score=0;
    addTile();addTile();
    update();
  }

  function addTile(){
    const empty=[];
    for(let r=0;r<size;r++)for(let c=0;c<size;c++)
      if(board[r][c]===0) empty.push([r,c]);
    if(!empty.length) return;
    const [r,c]=empty[Math.floor(Math.random()*empty.length)];
    board[r][c]=Math.random()<0.9?2:4;
  }

  function update(){
    scoreEl.textContent=score;
    boardEl.querySelectorAll('.tile').forEach(t=>t.remove());
    for(let r=0;r<size;r++){
      for(let c=0;c<size;c++){
        const v=board[r][c];
        if(v){
          const t=document.createElement('div');
          t.className='tile appear';
          t.textContent=v;
          t.style.transform=`translate(${c*100}%,${r*100}%)`;
          t.style.background=getColor(v);
          boardEl.appendChild(t);
        }
      }
    }
  }

  function getColor(v){
    if(v<=64) return 'linear-gradient(135deg,#ff9a3e,#ff6126)';
    if(v<=512) return 'linear-gradient(135deg,#ffd54f,#ffb300)';
    return 'linear-gradient(135deg,#4fc3f7,#0288d1)';
  }

  function moveLeft(){
    let moved=false;
    for(let r=0;r<size;r++){
      let row=board[r].filter(v=>v);
      for(let i=0;i<row.length-1;i++){
        if(row[i]===row[i+1]){
          row[i]*=2; score+=row[i]; row.splice(i+1,1);
        }
      }
      while(row.length<size) row.push(0);
      if(row.some((v,i)=>v!==board[r][i])){board[r]=row;moved=true;}
    }
    afterMove(moved);
  }

  function moveRight(){
    board.forEach(r=>r.reverse());
    moveLeft();
    board.forEach(r=>r.reverse());
  }

  function transpose(){
    board=board[0].map((_,i)=>board.map(r=>r[i]));
  }

  function moveUp(){
    transpose();
    moveLeft();
    transpose();
  }

  function moveDown(){
    transpose();
    moveRight();
    transpose();
  }

  function afterMove(moved){
    if(moved){
      addTile();
      update();
      if(!canMove()) alert('Perdu !');
    }
  }

  function canMove(){
    for(let r=0;r<size;r++){
      for(let c=0;c<size;c++){
        if(board[r][c]===0) return true;
        if(c<size-1 && board[r][c]===board[r][c+1]) return true;
        if(r<size-1 && board[r][c]===board[r+1][c]) return true;
      }
    }
    return false;
  }

  function handleKey(e){
    if(!gameWindow.classList.contains('open')) return;
    switch(e.key){
      case 'ArrowLeft':moveLeft();break;
      case 'ArrowRight':moveRight();break;
      case 'ArrowUp':moveUp();break;
      case 'ArrowDown':moveDown();break;
      default:return;
    }
    e.preventDefault();
  }

  let sx,sy;
  boardEl.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;});
  boardEl.addEventListener('touchend',e=>{
    const t=e.changedTouches[0];
    const dx=t.clientX-sx; const dy=t.clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)){
      if(dx>40) moveRight(); else if(dx<-40) moveLeft();
    }else{
      if(dy>40) moveDown(); else if(dy<-40) moveUp();
    }
  });

  document.addEventListener('keydown',handleKey);
  replay.addEventListener('click',init);
  startGame2048=init;
  init();
}

// Galaxy Birds
if(birdsWindow){
  const canvas=birdsWindow.querySelector('#birds-canvas');
  const ctx=canvas.getContext('2d');
  const scoreEl=birdsWindow.querySelector('#birds-score');
  const replayBtn=birdsWindow.querySelector('.replay');
  let width,height,score,loopId;
  const sling={x:60,y:0};
  let bird,pigs,dragging=false;

  function resize(){
    width=canvas.clientWidth;
    height=canvas.clientHeight;
    canvas.width=width;
    canvas.height=height;
    sling.y=height-40;
  }

  function reset(){
    score=0; scoreEl.textContent=score;
    bird={x:sling.x,y:sling.y,r:12,vx:0,vy:0,launched:false};
    pigs=[
      {x:width-60,y:height-40,r:15,hit:false},
      {x:width-120,y:height-40,r:15,hit:false}
    ];
  }

  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

  function update(){
    if(bird.launched){
      bird.vy+=0.4;
      bird.x+=bird.vx;
      bird.y+=bird.vy;
      if(bird.y>height) miss();
    }
    pigs.forEach(p=>{
      if(!p.hit && dist(bird,p)<bird.r+p.r){
        p.hit=true;
        score++; scoreEl.textContent=score;
        playSound('success');
        if(pigs.every(pg=>pg.hit)) playSound('cat-iphone-ringtone');
      }
    });
  }

  function miss(){
    playSound('error');
    bird.launched=false;
    bird.vx=bird.vy=0;
    bird.x=sling.x; bird.y=sling.y;
  }

  function draw(){
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle='rgba(0,0,0,0.15)';
    ctx.fillRect(0,height-20,width,20);
    ctx.strokeStyle='#654';
    ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(sling.x-15,sling.y);
    ctx.lineTo(sling.x+15,sling.y);
    ctx.stroke();

    pigs.forEach(p=>{
      if(!p.hit){
        ctx.font='20px sans-serif';
        ctx.fillText('🐷',p.x-p.r,p.y);
      }
    });

    ctx.font='20px sans-serif';
    ctx.fillText('🐦',bird.x-bird.r,bird.y);
  }

  function loop(){
    update();
    draw();
    loopId=requestAnimationFrame(loop);
  }

  function start(){
    resize();
    reset();
    if(loopId) cancelAnimationFrame(loopId);
    loopId=null;
    loop();
  }

  function getPos(e){const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}

  canvas.addEventListener('pointerdown',e=>{
    if(dist(getPos(e),bird)<=bird.r*1.5 && !bird.launched) dragging=true;
  });
  canvas.addEventListener('pointermove',e=>{
    if(dragging && !bird.launched){const p=getPos(e);bird.x=p.x;bird.y=p.y;}
  });
  canvas.addEventListener('pointerup',endDrag);
  canvas.addEventListener('pointerleave',endDrag);
  function endDrag(e){
    if(!dragging || bird.launched) return;
    dragging=false;
    const p=getPos(e);
    bird.vx=(sling.x-p.x)*0.2;
    bird.vy=(sling.y-p.y)*0.2;
    bird.launched=true;
  }

  replayBtn.addEventListener('click',reset);
  window.addEventListener('resize',resize);
startBirdsGame=start;
}

// écran d'accueil
const home=document.getElementById('home');
const pages=[...home.querySelectorAll('.page')];
let pageIndex=0;showPage(0);
function showPage(i){pageIndex=Math.max(0,Math.min(i,pages.length-1));home.style.transform=`translateX(-${pageIndex*100}%)`;}
let sx=null,sy=null;
home.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
home.addEventListener('touchend',e=>{
  if(sx===null) return;const dx=e.changedTouches[0].clientX-sx;const dy=e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){dx<0?showPage(pageIndex+1):showPage(pageIndex-1);}else if(dy<-80){openMultitask();}
  sx=sy=null;
});

const clockEl=document.querySelector('.clock-widget');
const batteryEl=document.querySelector('.battery-widget');
const dateEl=document.querySelector('.calendar-widget');
function updateClock(){const d=new Date();clockEl.textContent=d.toLocaleTimeString();dateEl.textContent=d.toLocaleDateString();}
setInterval(updateClock,1000);updateClock();
if(navigator.getBattery){navigator.getBattery().then(b=>{function upd(){batteryEl.textContent=Math.round(b.level*100)+'%';}b.addEventListener('levelchange',upd);upd();});}

const multitask=document.getElementById('multitask');
function openMultitask(){
  multitask.innerHTML='';
  windows.forEach(w=>{
    if(w.classList.contains('open')){
      const c=document.createElement('div');
      c.className='card';
      c.textContent=w.id.replace('-window','');
      c.onclick=()=>{multitask.classList.remove('show');openWindow(w);};
      multitask.appendChild(c);
    }
  });
  multitask.classList.add('show');
}
multitask.addEventListener('click',e=>{if(e.target===multitask) multitask.classList.remove('show');});

// mini 2048
const mini=document.getElementById('mini-game');
if(mini){
  const size=4;let board;init();
  mini.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;});
  mini.addEventListener('touchend',handleMove);
  document.addEventListener('keydown',e=>{if(!document.body.contains(mini))return;switch(e.key){case 'ArrowLeft':moveLeft();break;case 'ArrowRight':moveRight();break;case 'ArrowUp':moveUp();break;case 'ArrowDown':moveDown();break;}});

  function init(){
    mini.innerHTML='';
    mini.style.position='relative';
    for(let i=0;i<size*size;i++){const d=document.createElement('div');d.className='cell-bg';mini.appendChild(d);}board=Array.from({length:size},()=>Array(size).fill(0));add();add();render();}
  function add(){const e=[];for(let r=0;r<size;r++)for(let c=0;c<size;c++)if(board[r][c]===0)e.push([r,c]);if(!e.length)return;const [r,c]=e[Math.floor(Math.random()*e.length)];board[r][c]=Math.random()<0.9?2:4;}
  function render(){mini.querySelectorAll('.tile').forEach(t=>t.remove());for(let r=0;r<size;r++)for(let c=0;c<size;c++){const v=board[r][c];if(v){const t=document.createElement('div');t.className='tile appear';t.textContent=v;t.style.transform=`translate(${c*100}%,${r*100}%)`;t.style.background=getCol(v);mini.appendChild(t);}}}
  function getCol(v){if(v<=64)return'linear-gradient(135deg,#ff9a3e,#ff6126)';if(v<=512)return'linear-gradient(135deg,#ffd54f,#ffb300)';return'linear-gradient(135deg,#4fc3f7,#0288d1)';}
  function moveLeft(){let m=false;for(let r=0;r<size;r++){let row=board[r].filter(v=>v);for(let i=0;i<row.length-1;i++){if(row[i]===row[i+1]){row[i]*=2;row.splice(i+1,1);}}while(row.length<size)row.push(0);if(row.some((v,i)=>v!==board[r][i])){board[r]=row;m=true;}}after(m);}
  function moveRight(){board.forEach(r=>r.reverse());moveLeft();board.forEach(r=>r.reverse());}
  function transpose(){board=board[0].map((_,i)=>board.map(r=>r[i]));}
  function moveUp(){transpose();moveLeft();transpose();}
  function moveDown(){transpose();moveRight();transpose();}
  function after(m){if(m){add();render();}}
  function handleMove(e){const dx=e.changedTouches[0].clientX-sx;const dy=e.changedTouches[0].clientY-sy;Math.abs(dx)>Math.abs(dy)?(dx>40?moveRight():dx<-40&&moveLeft()):(dy>40?moveDown():dy<-40&&moveUp());}
}
