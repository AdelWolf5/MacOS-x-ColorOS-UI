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

// notes
const noteArea=document.getElementById('note-area');
if(noteArea){
  noteArea.value=localStorage.notes||'';
  noteArea.addEventListener('input',()=>localStorage.notes=noteArea.value);
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
const alertOverlay=document.getElementById('alert-overlay');
const alertBox=alertOverlay.querySelector('.alert-box');
const alertOk=document.getElementById('alert-ok');
const alertIgnore=document.getElementById('alert-ignore');
const contacts={
  Rodrigue:{sound:'cat-iphone-ringtone',img:'img/contacts/rodrigue.svg'},
  Nouhaila:{sound:'notif',img:'img/contacts/nouhaila.svg'},
  Bardella:{sound:'buzzer-error',img:'img/contacts/bardella.svg'}
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
