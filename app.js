const appContainer=document.getElementById('app-container');
const controlCenter=document.getElementById('control-center');
const controlToggle=document.getElementById('control-toggle');
const themeToggle=document.getElementById('theme-toggle');
let dark=false;

controlToggle.addEventListener('click',()=>{
  controlCenter.classList.toggle('hidden');
});

document.querySelectorAll('.app-icon[data-app]').forEach(btn=>{
  btn.addEventListener('click',()=>openApp(btn.dataset.app));
});

function openApp(name){
  const tpl=document.getElementById(`${name}-app`);
  if(!tpl)return;
  const clone=tpl.content.firstElementChild.cloneNode(true);
  clone.querySelector('.close').onclick=()=>clone.remove();
  appContainer.appendChild(clone);
}

themeToggle.addEventListener('click',()=>{
  dark=!dark;
  document.body.classList.toggle('dark',dark);
});
