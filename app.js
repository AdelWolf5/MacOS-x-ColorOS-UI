const appContainer=document.getElementById('app-container');
const controlCenter=document.getElementById('control-center');
const controlToggle=document.getElementById('control-toggle');
const themeToggle=document.getElementById('theme-toggle');
let dark=false;

// ouverture/fermeture du centre de contrôle
controlToggle.addEventListener('click',()=>{
  controlCenter.classList.toggle('open');
});
controlCenter.querySelector('.close').addEventListener('click',()=>{
  controlCenter.classList.remove('open');
});

document.querySelectorAll('.app-icon[data-app]').forEach(btn=>{
  btn.addEventListener('click',()=>openApp(btn.dataset.app));
});

// boutons à bascule
controlCenter.querySelectorAll('.toggle').forEach(btn=>{
  btn.addEventListener('click',()=>btn.classList.toggle('active'));
});

// sliders affichant la valeur
controlCenter.querySelectorAll('.sliders input[type="range"]').forEach(slider=>{
  const output=slider.nextElementSibling;
  output.textContent=slider.value;
  slider.addEventListener('input',()=>output.textContent=slider.value);
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
