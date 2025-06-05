// gestion des fenêtres
const dockButtons=document.querySelectorAll('.dock-item');
const windows=document.querySelectorAll('.window');
const oppoWindow=document.getElementById('oppo-window');
const oppoContent=document.getElementById('oppo-content');

const deviceData={
  phone:{name:'Oppo Phone',os:'iOS',desc:"Un smartphone au style iPhone."},
  tablet:{name:'Oppo Tablet',os:'iPadOS',desc:"Une tablette façon iPad."},
  computer:{name:'Oppo Computer',os:'MacOS',desc:"Un laptop inspir\u00e9 Macbook."}
};

function deviceSVG(type){
  switch(type){
    case 'phone':
      return `<svg viewBox="0 0 120 220" class="svg-device"><rect x="30" y="10" width="60" height="200" rx="12" fill="none" stroke="currentColor" stroke-width="8"/><rect x="40" y="30" width="40" height="160" fill="currentColor" opacity="0.1"/><circle cx="60" cy="190" r="6" fill="currentColor"/><text x="60" y="120" text-anchor="middle" font-size="18" fill="currentColor">OPPO</text></svg>`;
    case 'tablet':
      return `<svg viewBox="0 0 160 200" class="svg-device"><rect x="20" y="10" width="120" height="180" rx="14" fill="none" stroke="currentColor" stroke-width="8"/><rect x="30" y="30" width="100" height="140" fill="currentColor" opacity="0.1"/><circle cx="80" cy="185" r="5" fill="currentColor"/><text x="80" y="100" text-anchor="middle" font-size="20" fill="currentColor">OPPO</text></svg>`;
    default:
      return `<svg viewBox="0 0 220 160" class="svg-device"><rect x="40" y="20" width="140" height="80" rx="6" fill="none" stroke="currentColor" stroke-width="8"/><rect x="50" y="30" width="120" height="60" fill="currentColor" opacity="0.1"/><rect x="20" y="110" width="180" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="8"/><text x="110" y="70" text-anchor="middle" font-size="20" fill="currentColor">OPPO</text></svg>`;
  }
}

function detectDevice(){
  const w=window.innerWidth, h=window.innerHeight, ua=navigator.userAgent;
  if(w<=600||/Mobile|Android|iPhone/i.test(ua)) return 'phone';
  if(w<=1024||/iPad|Tablet/i.test(ua)||(h>w&&navigator.maxTouchPoints>1)) return 'tablet';
  return 'computer';
}

function updateOppoContent(){
  const type=detectDevice();
  const {name,os,desc}=deviceData[type];
  oppoContent.innerHTML=`${deviceSVG(type)}<h1>${name} \u2013 ${os}</h1><button class="discover-btn">D\u00e9couvrir</button><p class="description">${desc}</p>`;
  const btn=oppoContent.querySelector('.discover-btn');
  const p=oppoContent.querySelector('.description');
  btn.addEventListener('click',()=>p.classList.toggle('show')); 
}
dockButtons.forEach(btn=>{
  btn.addEventListener('click',()=>openWindow(document.getElementById(btn.dataset.target)));
});
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
    if(el===oppoWindow) updateOppoContent();
  }
}

// thème clair/sombre
const themeBtn=document.getElementById('theme-toggle');
if(localStorage.theme==='dark') document.body.classList.add('dark');
themeBtn.onclick=()=>{
  document.body.classList.toggle('dark');
  localStorage.theme=document.body.classList.contains('dark')?'dark':'light';
};

// notes
const noteArea=document.getElementById('note-area');
if(noteArea){
  noteArea.value=localStorage.notes||'';
  noteArea.addEventListener('input',()=>localStorage.notes=noteArea.value);
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
});

audio.addEventListener('pause',()=>{
  document.querySelector('.player').classList.remove('playing');
  playBtn.textContent='▶️';
  playing=false;
});

audio.addEventListener('ended',()=>{next();});

function formatTime(s){
  if(isNaN(s)) return '0:00';
  const m=Math.floor(s/60);
  const sec=Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

loadPlaylist();
volume.dispatchEvent(new Event('input'));

window.addEventListener('resize',()=>{
  if(oppoWindow.classList.contains('open')) updateOppoContent();
});
updateOppoContent();
