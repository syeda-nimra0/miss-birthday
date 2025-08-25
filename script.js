// ===== Fireworks =====
const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
function sizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
sizeCanvas();
window.addEventListener('resize', sizeCanvas);

let fireworks = [];
class Firework {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color;
    this.particles = [];
    for (let i = 0; i < 60; i++) {
      this.particles.push({
        x, y,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 5 + 2.5,
        radius: Math.random() * 2 + 1.2,
        alpha: 1,
        gravity: .03
      });
    }
  }
  draw() {
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${p.alpha})`;
      ctx.fill();
    }
  }
  update() {
    for (const p of this.particles) {
      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed + p.gravity;
      p.alpha -= 0.015 + Math.random() * 0.01;
      p.speed *= 0.985;
    }
  }
}
let magicInterval = null;
function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  fireworks = fireworks.filter(f => f.particles[0].alpha > 0);
  for (const f of fireworks){ f.update(); f.draw(); }
  requestAnimationFrame(animate);
}
animate();

function startMagic() {
  if (magicInterval) return; // prevent multiple intervals
  magicInterval = setInterval(() => {
    const x = Math.random() * canvas.width * 0.9 + canvas.width * 0.05;
    const y = Math.random() * canvas.height * 0.45 + canvas.height * 0.05;
    const color = `${rand255()},${rand255()},${rand255()}`;
    fireworks.push(new Firework(x, y, color));
  }, 480);
}
function rand255(){ return Math.floor(Math.random()*255); }

// ===== Birthday Letter =====
const backdrop = document.getElementById('letter-backdrop');
const typedEl = document.getElementById('typed');

const LETTER_TEXT = 
`Miss Minahil 🎂, aap hamari coding queen ho 👑.  
Kabhi strict, kabhi funny, aur hamesha hamare liye guide.  
Aaj ke din bas enjoy karein, koi assignments aur bugs allowed nahi 😜.  
Happy Birthday once again, you’re simply the besttt! 💕
`;

let typingTimer = null;

function typeText(el, text, speed=22){
  el.textContent = '';
  let i = 0;
  clearInterval(typingTimer);
  typingTimer = setInterval(() => {
    el.textContent += text[i] ?? '';
    i++;
    if (i > text.length) clearInterval(typingTimer);
  }, speed);
}

function openLetter(){
  backdrop.classList.add('show','opening');
  // allow flap to animate then paper drop
  requestAnimationFrame(() => {
    const paper = backdrop.querySelector('.paper');
    // start content typing slightly after show
    setTimeout(() => {
      paper.classList.add('show');
      typeText(typedEl, LETTER_TEXT);
    }, 350);
  });
}

function closeLetter(e){
  // close if clicked on backdrop outside the letter
  if (e.target === backdrop) forceCloseLetter();
}
function forceCloseLetter(){
  backdrop.classList.remove('show','opening');
  const paper = backdrop.querySelector('.paper');
  paper.classList.remove('show');
  clearInterval(typingTimer);
  typedEl.textContent = '';
}

// Optional: simple “download as image” using HTML2Canvas-free approach via SVG foreignObject
function downloadCard(){
  const node = backdrop.querySelector('.paper');
  const w = 800, h = 520;
  const data = new XMLSerializer().serializeToString(makeSVGFromNode(node, w, h));
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'birthday-letter.svg';
  a.click();
}

function makeSVGFromNode(node, width, height){
  // clone node styles via computed css snapshot (basic)
  const clone = node.cloneNode(true);
  const wrapper = document.createElement('div');
  wrapper.appendChild(clone);

  const style = document.createElement('style');
  style.textContent = `
    *{box-sizing:border-box}
    body{margin:0}
    .paper{font-family: Poppins, Arial, sans-serif; background:#fffdf7; color:#2a2a2a;}
    h2{margin:0 0 8px 0; font-size:24px}
    p{font-size:16px; line-height:1.6; white-space:pre-wrap}
    .signoff{font-style:italic; opacity:.85}
    #typed{border:none}
  `;

  const foreign = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;padding:26px 22px;background:#fffdf7;border-radius:20px;">
          ${style.outerHTML}
          ${clone.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;
  const parser = new DOMParser();
  return parser.parseFromString(foreign, 'image/svg+xml').documentElement;
}
