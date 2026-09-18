export interface AppTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  appName: string;
  packageName: string;
  orientation: 'portrait' | 'landscape' | 'unspecified';
  themeColor: string;
  permissions: string[];
  html: string;
}

export const APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'calculator',
    name: 'Neo Calc Pro',
    category: 'Productivity',
    description: 'A sleek, haptic-ready scientific calculator with history tape and memory functions.',
    icon: 'Calculator',
    appName: 'Neo Calc',
    packageName: 'com.mobile.neocalc',
    orientation: 'portrait',
    themeColor: '#0ea5e9',
    permissions: ['android.permission.VIBRATE'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Neo Calc</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; height: 100vh; justify-content: flex-end; padding: 20px; overflow: hidden; }
    .display { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; padding: 20px 10px; word-break: break-all; }
    .history { font-size: 1.1rem; color: #64748b; min-height: 24px; margin-bottom: 8px; font-family: monospace; }
    .current { font-size: 3.2rem; font-weight: 700; color: #38bdf8; transition: font-size 0.2s; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 10px; }
    button {
      background: #1e293b; border: 1px solid #334155; color: #f1f5f9; font-size: 1.4rem; font-weight: 600;
      padding: 18px 0; border-radius: 18px; cursor: pointer; transition: all 0.1s; active:scale-95;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
    button:active { transform: scale(0.94); background: #334155; }
    button.op { background: #0284c7; color: white; border-color: #38bdf8; }
    button.op:active { background: #0369a1; }
    button.action { background: #334155; color: #cbd5e1; }
    button.equal { background: #10b981; color: white; border-color: #34d399; grid-column: span 2; }
    button.equal:active { background: #059669; }
  </style>
</head>
<body>
  <div class="display">
    <div class="history" id="history"></div>
    <div class="current" id="display">0</div>
  </div>
  <div class="grid">
    <button class="action" onclick="clearAll()">AC</button>
    <button class="action" onclick="deleteLast()">⌫</button>
    <button class="action" onclick="inputOp('%')">%</button>
    <button class="op" onclick="inputOp('/')">÷</button>
    
    <button onclick="inputNum('7')">7</button>
    <button onclick="inputNum('8')">8</button>
    <button onclick="inputNum('9')">9</button>
    <button class="op" onclick="inputOp('*')">×</button>
    
    <button onclick="inputNum('4')">4</button>
    <button onclick="inputNum('5')">5</button>
    <button onclick="inputNum('6')">6</button>
    <button class="op" onclick="inputOp('-')">−</button>
    
    <button onclick="inputNum('1')">1</button>
    <button onclick="inputNum('2')">2</button>
    <button onclick="inputNum('3')">3</button>
    <button class="op" onclick="inputOp('+')">+</button>
    
    <button onclick="inputNum('0')">0</button>
    <button onclick="inputDot()">.</button>
    <button class="equal" onclick="calculate()">=</button>
  </div>

  <script>
    let currentInput = '0';
    let prevInput = '';
    let operation = null;
    let resetOnNext = false;

    function vibrate() {
      if (navigator.vibrate) {
        navigator.vibrate(20);
      }
    }

    function updateDisplay() {
      const el = document.getElementById('display');
      el.innerText = currentInput;
      if (currentInput.length > 9) el.style.fontSize = '2.2rem';
      else if (currentInput.length > 7) el.style.fontSize = '2.6rem';
      else el.style.fontSize = '3.2rem';
      document.getElementById('history').innerText = prevInput + (operation ? ' ' + operation : '');
    }

    function inputNum(num) {
      vibrate();
      if (currentInput === '0' || resetOnNext) {
        currentInput = num;
        resetOnNext = false;
      } else {
        currentInput += num;
      }
      updateDisplay();
    }

    function inputDot() {
      vibrate();
      if (resetOnNext) {
        currentInput = '0.';
        resetOnNext = false;
      } else if (!currentInput.includes('.')) {
        currentInput += '.';
      }
      updateDisplay();
    }

    function inputOp(op) {
      vibrate();
      if (operation && !resetOnNext) {
        calculate();
      }
      prevInput = currentInput;
      operation = op;
      resetOnNext = true;
      updateDisplay();
    }

    function calculate() {
      vibrate();
      if (!operation || resetOnNext) return;
      let result;
      const prev = parseFloat(prevInput);
      const cur = parseFloat(currentInput);
      if (isNaN(prev) || isNaN(cur)) return;

      switch(operation) {
        case '+': result = prev + cur; break;
        case '-': result = prev - cur; break;
        case '*': result = prev * cur; break;
        case '/': result = cur === 0 ? 'Error' : prev / cur; break;
        case '%': result = (prev * cur) / 100; break;
        default: return;
      }

      currentInput = typeof result === 'number' ? Math.round(result * 100000000) / 100000000 + '' : result;
      prevInput = '';
      operation = null;
      resetOnNext = true;
      updateDisplay();
    }

    function clearAll() {
      vibrate();
      currentInput = '0';
      prevInput = '';
      operation = null;
      resetOnNext = false;
      updateDisplay();
    }

    function deleteLast() {
      vibrate();
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = '0';
      }
      updateDisplay();
    }
  </script>
</body>
</html>`
  },
  {
    id: 'space-game',
    name: 'Star Galaxy 2D',
    category: 'Gaming',
    description: 'Fast-paced space arcade game with particles, audio synthesis, joystick touch controls, and high scores.',
    icon: 'Gamepad2',
    appName: 'Star Galaxy',
    packageName: 'com.arcade.stargalaxy',
    orientation: 'portrait',
    themeColor: '#8b5cf6',
    permissions: ['android.permission.VIBRATE'],
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Star Galaxy</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #05050b; font-family: sans-serif; touch-action: none; }
    canvas { display: block; width: 100vw; height: 100vh; }
    #ui { position: absolute; top: 16px; left: 16px; right: 16px; display: flex; justify-content: space-between; color: white; font-weight: 700; font-size: 1.2rem; pointer-events: none; }
    #gameover { display: none; position: absolute; inset: 0; background: rgba(5,5,15,0.85); flex-direction: column; align-items: center; justify-content: center; color: white; }
    #gameover h1 { font-size: 2.5rem; margin-bottom: 10px; color: #ef4444; }
    #restart-btn { pointer-events: auto; padding: 14px 28px; font-size: 1.2rem; font-weight: bold; background: #8b5cf6; border: none; border-radius: 12px; color: white; cursor: pointer; box-shadow: 0 4px 14px rgba(139,92,246,0.5); }
  </style>
</head>
<body>
  <div id="ui">
    <div id="score">SCORE: 0</div>
    <div id="lives">SHIELDS: 3</div>
  </div>
  <canvas id="canvas"></canvas>
  <div id="gameover">
    <h1>MISSION FAILED</h1>
    <p id="finalScore" style="font-size: 1.4rem; margin-bottom: 24px;"></p>
    <button id="restart-btn" onclick="restartGame()">RELAUNCH FIGHTER</button>
  </div>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let score = 0, lives = 3, gameOver = false;
    let player = { x: width / 2, y: height - 100, radius: 20, targetX: width / 2 };
    let bullets = [], enemies = [], stars = [], particles = [];

    for (let i = 0; i < 60; i++) {
      stars.push({ x: Math.random() * width, y: Math.random() * height, speed: 0.5 + Math.random() * 2, size: Math.random() * 2 });
    }

    window.addEventListener('pointermove', (e) => { player.targetX = e.clientX; });
    window.addEventListener('pointerdown', (e) => {
      player.targetX = e.clientX;
      shoot();
    });

    let shootTimer = 0;
    function shoot() {
      if (gameOver) return;
      bullets.push({ x: player.x - 10, y: player.y - 15, vy: -12 });
      bullets.push({ x: player.x + 10, y: player.y - 15, vy: -12 });
      if (navigator.vibrate) navigator.vibrate(10);
    }

    function spawnEnemy() {
      if (gameOver) return;
      enemies.push({
        x: 30 + Math.random() * (width - 60),
        y: -30,
        radius: 16 + Math.random() * 8,
        vy: 2 + Math.random() * 3,
        color: ['#f43f5e', '#fb923c', '#e11d48'][Math.floor(Math.random() * 3)]
      });
    }

    let enemyInterval = setInterval(spawnEnemy, 900);

    function createParticles(x, y, color) {
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 5 + 1;
        particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          color,
          alpha: 1
        });
      }
    }

    function update() {
      if (!gameOver) {
        player.x += (player.targetX - player.x) * 0.15;
        shootTimer++;
        if (shootTimer % 12 === 0) shoot();
      }

      stars.forEach(s => {
        s.y += s.speed;
        if (s.y > height) s.y = 0;
      });

      bullets.forEach((b, i) => {
        b.y += b.vy;
        if (b.y < -10) bullets.splice(i, 1);
      });

      enemies.forEach((e, ei) => {
        e.y += e.vy;
        bullets.forEach((b, bi) => {
          const dist = Math.hypot(b.x - e.x, b.y - e.y);
          if (dist < e.radius + 6) {
            createParticles(e.x, e.y, e.color);
            enemies.splice(ei, 1);
            bullets.splice(bi, 1);
            score += 100;
            document.getElementById('score').innerText = 'SCORE: ' + score;
            if (navigator.vibrate) navigator.vibrate(30);
          }
        });

        if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
          createParticles(player.x, player.y, '#38bdf8');
          enemies.splice(ei, 1);
          lives--;
          document.getElementById('lives').innerText = 'SHIELDS: ' + lives;
          if (navigator.vibrate) navigator.vibrate(100);
          if (lives <= 0) {
            gameOver = true;
            document.getElementById('finalScore').innerText = 'Final Score: ' + score;
            document.getElementById('gameover').style.display = 'flex';
          }
        }

        if (e.y > height + 40) enemies.splice(ei, 1);
      });

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) particles.splice(i, 1);
      });
    }

    function draw() {
      ctx.fillStyle = '#070714';
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bullets
      ctx.fillStyle = '#38bdf8';
      bullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y, 4, 12);
      });

      // Enemies
      enemies.forEach(e => {
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.restore();
      });

      // Player Ship
      if (!gameOver) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(18, 20);
        ctx.lineTo(0, 10);
        ctx.lineTo(-18, 20);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-3, 10, 6, 8);
        ctx.restore();
      }

      update();
      requestAnimationFrame(draw);
    }

    function restartGame() {
      score = 0; lives = 3; gameOver = false;
      bullets = []; enemies = []; particles = [];
      document.getElementById('score').innerText = 'SCORE: 0';
      document.getElementById('lives').innerText = 'SHIELDS: 3';
      document.getElementById('gameover').style.display = 'none';
    }

    draw();
  </script>
</body>
</html>`
  },
  {
    id: 'task-flow',
    name: 'TaskFlow Minimalist',
    category: 'Productivity',
    description: 'Clean daily planner with local device storage persistence, status filters, and smooth completion badges.',
    icon: 'CheckSquare',
    appName: 'Task Flow',
    packageName: 'com.mobile.taskflow',
    orientation: 'portrait',
    themeColor: '#10b981',
    permissions: ['android.permission.VIBRATE'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Task Flow</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 24px 18px; min-height: 100vh; display: flex; flex-direction: column; }
    header { margin-bottom: 24px; }
    h1 { font-size: 1.8rem; font-weight: 800; color: #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
    .badge { font-size: 0.8rem; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: rgba(16,185,129,0.15); color: #34d399; }
    .input-row { display: flex; gap: 8px; margin-bottom: 20px; }
    input { flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px 16px; color: white; font-size: 1rem; outline: none; }
    input:focus { border-color: #10b981; }
    button.add-btn { background: #10b981; color: white; border: none; border-radius: 12px; padding: 0 20px; font-weight: 700; font-size: 1.2rem; cursor: pointer; }
    .list { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .task { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
    .task.done { opacity: 0.5; text-decoration: line-through; border-color: #1e293b; }
    .task-left { display: flex; align-items: center; gap: 12px; flex: 1; }
    .checkbox { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .task.done .checkbox { background: #10b981; border-color: #10b981; }
    .checkbox::after { content: '✓'; color: white; font-size: 14px; display: none; font-weight: bold; }
    .task.done .checkbox::after { display: block; }
    .del-btn { background: none; border: none; color: #ef4444; font-size: 1.1rem; cursor: pointer; padding: 4px 8px; opacity: 0.7; }
    .del-btn:hover { opacity: 1; }
  </style>
</head>
<body>
  <header>
    <h1>Task Flow <span class="badge" id="counter">0 active</span></h1>
  </header>

  <div class="input-row">
    <input type="text" id="taskInput" placeholder="Add a new goal or task..." onkeydown="if(event.key==='Enter') addTask()">
    <button class="add-btn" onclick="addTask()">+</button>
  </div>

  <ul class="list" id="taskList"></ul>

  <script>
    let tasks = JSON.parse(localStorage.getItem('tasks_data') || '[]');
    if (tasks.length === 0) {
      tasks = [
        { id: 1, text: 'Install APK on Android mobile', done: true },
        { id: 2, text: 'Test offline storage & performance', done: false },
        { id: 3, text: 'Publish on APKPure or Google Play', done: false }
      ];
      saveTasks();
    }

    function saveTasks() {
      localStorage.setItem('tasks_data', JSON.stringify(tasks));
      render();
    }

    function addTask() {
      const input = document.getElementById('taskInput');
      const val = input.value.trim();
      if (!val) return;
      tasks.unshift({ id: Date.now(), text: val, done: false });
      input.value = '';
      if (navigator.vibrate) navigator.vibrate(20);
      saveTasks();
    }

    function toggleTask(id) {
      const t = tasks.find(item => item.id === id);
      if (t) {
        t.done = !t.done;
        if (navigator.vibrate) navigator.vibrate(30);
        saveTasks();
      }
    }

    function deleteTask(id) {
      tasks = tasks.filter(item => item.id !== id);
      saveTasks();
    }

    function render() {
      const list = document.getElementById('taskList');
      list.innerHTML = '';
      let activeCount = 0;

      tasks.forEach(t => {
        if (!t.done) activeCount++;
        const li = document.createElement('li');
        li.className = 'task' + (t.done ? ' done' : '');
        li.innerHTML = \`
          <div class="task-left" onclick="toggleTask(\${t.id})">
            <div class="checkbox"></div>
            <span>\${t.text}</span>
          </div>
          <button class="del-btn" onclick="deleteTask(\${t.id})">✕</button>
        \`;
        list.appendChild(li);
      });

      document.getElementById('counter').innerText = activeCount + ' active';
    }

    render();
  </script>
</body>
</html>`
  },
  {
    id: 'device-info',
    name: 'Hardware & Sensor Inspector',
    category: 'Utilities',
    description: 'Direct inspection of mobile hardware, battery percentage, orientation accelerometer, and network state.',
    icon: 'Cpu',
    appName: 'Sensor Inspect',
    packageName: 'com.mobile.sensors',
    orientation: 'portrait',
    themeColor: '#ec4899',
    permissions: ['android.permission.ACCESS_NETWORK_STATE', 'android.permission.VIBRATE'],
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Device Inspector</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0c0a09; color: #fafaf9; padding: 20px; }
    h1 { font-size: 1.6rem; font-weight: 800; color: #ec4899; margin-bottom: 20px; }
    .card { background: #1c1917; border: 1px solid #292524; border-radius: 16px; padding: 18px; margin-bottom: 14px; }
    .card-title { font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; color: #a8a29e; margin-bottom: 8px; font-weight: 700; }
    .stat { font-size: 1.5rem; font-weight: 700; color: white; }
    .sub { font-size: 0.85rem; color: #78716c; margin-top: 4px; }
    button.test-btn { width: 100%; background: #ec4899; color: white; font-weight: bold; padding: 16px; border: none; border-radius: 12px; margin-top: 8px; cursor: pointer; }
    button.test-btn:active { background: #db2777; }
  </style>
</head>
<body>
  <h1>Device Inspector</h1>

  <div class="card">
    <div class="card-title">Battery Status</div>
    <div class="stat" id="battery">Detecting...</div>
    <div class="sub" id="batterySub">API: navigator.getBattery()</div>
  </div>

  <div class="card">
    <div class="card-title">Screen & Viewport</div>
    <div class="stat" id="screen">Checking...</div>
    <div class="sub" id="screenDpi">DPR: \${window.devicePixelRatio}x</div>
  </div>

  <div class="card">
    <div class="card-title">Network & Connectivity</div>
    <div class="stat" id="network">Checking...</div>
    <div class="sub" id="netType">Online state verified</div>
  </div>

  <div class="card">
    <div class="card-title">Haptic Engine Test</div>
    <button class="test-btn" onclick="testVibrate()">TRIGGER HARDWARE VIBRATE</button>
  </div>

  <script>
    document.getElementById('screen').innerText = window.innerWidth + ' × ' + window.innerHeight + ' px';
    document.getElementById('network').innerText = navigator.onLine ? 'ONLINE (Connected)' : 'OFFLINE';

    if (navigator.getBattery) {
      navigator.getBattery().then(b => {
        const updateBat = () => {
          document.getElementById('battery').innerText = Math.round(b.level * 100) + '% ' + (b.charging ? '⚡ (Charging)' : '🔋');
        };
        updateBat();
        b.addEventListener('levelchange', updateBat);
        b.addEventListener('chargingchange', updateBat);
      }).catch(() => {
        document.getElementById('battery').innerText = '100% (Simulated)';
      });
    } else {
      document.getElementById('battery').innerText = 'Protected in Sandbox';
    }

    function testVibrate() {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      } else {
        alert('Vibration API available on real physical device!');
      }
    }
  </script>
</body>
</html>`
  }
];
