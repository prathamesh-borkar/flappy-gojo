

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


const W = 960;
const H = 540;
canvas.width = W;
canvas.height = H;


const bgImage = new Image();
bgImage.src = 'images/background.jpg';

const gojoImg = new Image();
gojoImg.src = 'images/gojo.gif';

const sukunaImg = new Image();
sukunaImg.src = 'images/sukuna.jpg';


const bgMusic = document.getElementById('bgMusic');
bgMusic.volume = 0.28;


let started = false;       
let running = true;        
let score = 0;
let obstacles = [];        
let frame = 0;


const gojo = {
  x: Math.round(W * 0.15),
  y: H / 2,
  width: Math.round(H * 0.12),  
  height: Math.round(H * 0.12),
  gravity: 0.55,
  lift: -11,
  velocity: 0
};


const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const scoreSpan = document.getElementById('scoreValue');


function resetGame() {
  score = 0;
  obstacles = [];
  frame = 0;
  gojo.y = H / 2;
  gojo.velocity = 0;
  scoreSpan.textContent = score;
  started = false;
  running = true;
  overlay.style.display = 'flex';
}

function startGame() {
  if (!started) {
    started = true;
    overlay.style.display = 'none';
    
    try { bgMusic.currentTime = 0; bgMusic.play(); } catch (e) { /* ignore */ }
  }
}

function spawnPair() {
  const gap = Math.round(H * 0.50); 
  
  const maxTop = H * 0.5;
  const minTop = H * 0.08 + 80;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop) + minTop);

  const obsWidth = Math.round(W * 0.14); 
  const top = {
    x: W,
    y: topHeight - (H * 0.5), 
    width: obsWidth,
    height: Math.round(H * 0.6), 
    type: 'top',
    passed: false 
  };
  const bottom = {
    x: W,
    y: topHeight + gap,
    width: obsWidth,
    height: Math.round(H * 0.6),
    type: 'bottom',
    passed: false
  };

  
  obstacles.push({ top, bottom, counted: false });
}


function drawBackground() {
  
  if (bgImage.complete) ctx.drawImage(bgImage, 0, 0, W, H);
  else {
    ctx.fillStyle = '#6fb5ff';
    ctx.fillRect(0, 0, W, H);
  }
}

function drawGojo() {
  if (gojoImg.complete) ctx.drawImage(gojoImg, gojo.x, gojo.y, gojo.width, gojo.height);
  else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(gojo.x, gojo.y, gojo.width, gojo.height);
  }
}

function drawObstacles() {
  obstacles.forEach(pair => {
    
    const t = pair.top;
    
    if (sukunaImg.complete) ctx.drawImage(sukunaImg, t.x, t.y, t.width, t.height);
    else {
      ctx.fillStyle = '#8a2be2';
      ctx.fillRect(t.x, t.y, t.width, t.height);
    }
    
    const b = pair.bottom;
    if (sukunaImg.complete) ctx.drawImage(sukunaImg, b.x, b.y, b.width, b.height);
    else {
      ctx.fillStyle = '#8a2be2';
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }
  });
}


function intersects(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}


function update() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();

  
  drawObstacles();
  drawGojo();

  if (started && running) {
    
    gojo.velocity += gojo.gravity;
    gojo.y += gojo.velocity;

    
    if (gojo.y + gojo.height > H) {
      gojo.y = H - gojo.height;
      
      gameOver();
    }
    if (gojo.y < 0) {
      gojo.y = 0;
      gojo.velocity = 0;
    }

    
    if (frame % 100 === 0) spawnPair();

    
    const speed = 4.5; 
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const pair = obstacles[i];
      pair.top.x -= speed;
      pair.bottom.x -= speed;

      
      const topBox = {
        x: pair.top.x,
        y: pair.top.y,
        w: pair.top.width,
        h: pair.top.height
      };
      const bottomBox = {
        x: pair.bottom.x,
        y: pair.bottom.y,
        w: pair.bottom.width,
        h: pair.bottom.height
      };

      if (intersects(gojo.x, gojo.y, gojo.width, gojo.height, topBox.x, topBox.y, topBox.w, topBox.h)
       || intersects(gojo.x, gojo.y, gojo.width, gojo.height, bottomBox.x, bottomBox.y, bottomBox.w, bottomBox.h)) {
        gameOver();
      }

      
      if (!pair.counted && pair.top.x + pair.top.width < gojo.x) {
        pair.counted = true;
        score++;
        scoreSpan.textContent = score;
      }

     
      if (pair.top.x + pair.top.width < -50) {
        obstacles.splice(i, 1);
      }
    }

    frame++;
  } else {
    
    const bob = Math.sin(frame / 12) * 6;
    ctx.clearRect(gojo.x - 2, 0, gojo.width + 4, H);
    
    drawBackground();
    drawObstacles();
    ctx.save();
    ctx.translate(0, bob);
    drawGojo();
    ctx.restore();
    frame++;
  }

  
  if (running) requestAnimationFrame(update);
}


function flap() {
  if (!started) startGame();
  
  if (running) gojo.velocity = gojo.lift;
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    flap();
  }
});

window.addEventListener('mousedown', (e) => { flap(); });
window.addEventListener('touchstart', (e) => { e.preventDefault(); flap(); }, {passive:false});


startBtn.addEventListener('click', () => { startGame(); });


function gameOver() {
  running = false;
  
  try { bgMusic.pause(); bgMusic.currentTime = 0; } catch (e) {}

  
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ff7777';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('💀 GAME OVER 💀', W / 2, H / 2 - 12);

  ctx.fillStyle = '#ffffff';
  ctx.font = '28px Arial';
  ctx.fillText('Score: ' + score, W / 2, H / 2 + 32);

  
  setTimeout(() => {
    overlay.style.display = 'flex';
   
    document.querySelector('.overlay-box h1').textContent = 'Game Over';
    document.querySelector('.overlay-box p').textContent = 'Click Start to play again';
    startBtn.textContent = 'Restart';
   
    startBtn.onclick = () => {
      
      document.querySelector('.overlay-box h1').textContent = 'Flappy Sukuna';
      document.querySelector('.overlay-box p').textContent = 'Click / Tap or press Space to start & flap';
      startBtn.textContent = 'Start Game';
      startBtn.onclick = () => startGame();
      resetGame();
      
      requestAnimationFrame(update);
    };
  }, 800);
}


scoreSpan.textContent = score;
overlay.style.display = 'flex';
requestAnimationFrame(update);
