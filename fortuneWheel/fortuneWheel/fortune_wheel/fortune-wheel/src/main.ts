import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import './style.css';

// ==========================================
// ГЛАВНАЯ КОНФИГУРАЦИЯ
// ==========================================
const GAME_CONFIG = {
  SCENE: { WIDTH: 1920, HEIGHT: 1080 },
  CENTER: { X: 960, Y: 420 },

  // Цвета фона
  COLORS: {
    BACKGROUND: 0x050505, 
    GRID: 0xFFFFFF,       
    GRID_ALPHA: 0.05,     
  },

  RIM_STYLE: {
    VISIBLE: true,
    RADIUS: 365,
    THICKNESS: 40,
    COLOR: 0x222222,
    BLOCKS_COUNT: 64,
    BLOCK_COLOR: 0x555555,
    BLOCK_WIDTH: 10,
    BLOCK_HEIGHT: 20,
  },

  SECTORS: {
    INNER_RADIUS: 0,
    OUTER_RADIUS: 360,
    TEXT_RADIUS: 250,
    STROKE_COLOR: 0xFFFFFF,
    STROKE_WIDTH: 3,
    STROKE_ALPHA: 0.8,
  },

  GRAPHICS: {
    POINTER: { WIDTH: 80, HEIGHT: 95, OFFSET_X: 0, OFFSET_Y: 25 },
    BUTTON: { WIDTH: 240, HEIGHT: 100, OFFSET_X: 0, OFFSET_Y: 180 }
  },

  CENTER_CAP: {
    VISIBLE: true, RADIUS: 40, COLOR: 0x151515, BORDER_COLOR: 0x888888, BORDER_WIDTH: 2,
  },

  TEXT: {
    FONT_SIZE: 36, FONT_FAMILY: 'Arial', COLOR: '#ffffff', BOLD: true, STROKE_THICKNESS: 0, ROTATE_TEXT: true,
  },

  ANIMATION: {
    DURATION: 20,
    SPINS: 15,
    EASE: 'power4.out',
  },

  TICKER: {
    ANGLE: 15,
    BASE_DURATION: 0.1,
  },

  PRIZES: [
    { id: 1, text: '100$',    color: 0x252525 },
    { id: 2, text: 'BONUS',   color: 0x3d3d3d },
    { id: 3, text: 'TICKET',  color: 0x252525 },
    { id: 4, text: 'EMPTY',   color: 0x3d3d3d },
    { id: 5, text: '500$',    color: 0x252525 },
    { id: 6, text: 'SPIN',    color: 0x3d3d3d },
    { id: 7, text: 'NFT',     color: 0x252525 },
    { id: 8, text: 'JACKPOT', color: 0x3d3d3d },
  ],
};

// ==========================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ==========================================

const app = new PIXI.Application();
const root = new PIXI.Container();

let mainWheelWrapper: PIXI.Container;
let spinLayer: PIXI.Container;
let button: PIXI.Sprite;
let pointerSprite: PIXI.Sprite;
let audioCtx: AudioContext | null = null;

type AssetMap = {
  pointer: PIXI.Texture;
  button: PIXI.Texture;
};

// ==========================================
// ИНИЦИАЛИЗАЦИЯ
// ==========================================

async function init() {
  await app.init({
    resizeTo: window,
    backgroundColor: GAME_CONFIG.COLORS.BACKGROUND, 
    backgroundAlpha: 1, 
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });
  document.body.appendChild(app.canvas);

  // Audio Context
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  } catch (e) {
    console.error('Audio API Error', e);
  }

  const [ptr, btn] = await Promise.all([
    PIXI.Assets.load('/Assets/pointer.png'),
    PIXI.Assets.load('/Assets/button.png'),
  ]);

  const assets: AssetMap = { pointer: ptr, button: btn };

  app.stage.addChild(root);
  setupScene(assets);
  layout();
  window.addEventListener('resize', layout);
}

function setupScene(assets: AssetMap) {
  // 1. ФОН (СЕТКА)
  const gridG = new PIXI.Graphics();
  gridG.beginPath();
  const gridSize = 100;
  
  for (let x = 0; x <= GAME_CONFIG.SCENE.WIDTH; x += gridSize) {
    gridG.moveTo(x, 0);
    gridG.lineTo(x, GAME_CONFIG.SCENE.HEIGHT);
  }
  for (let y = 0; y <= GAME_CONFIG.SCENE.HEIGHT; y += gridSize) {
    gridG.moveTo(0, y);
    gridG.lineTo(GAME_CONFIG.SCENE.WIDTH, y);
  }
  gridG.stroke({ width: 1, color: GAME_CONFIG.COLORS.GRID, alpha: GAME_CONFIG.COLORS.GRID_ALPHA });
  root.addChild(gridG);

  // 2. ГЛАВНЫЙ КОНТЕЙНЕР
  mainWheelWrapper = new PIXI.Container();
  mainWheelWrapper.position.set(GAME_CONFIG.CENTER.X, GAME_CONFIG.CENTER.Y);
  root.addChild(mainWheelWrapper);

  // Тень
  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 0, 420, 420);
  shadow.fill({ color: 0x000000, alpha: 0.5 });
  mainWheelWrapper.addChild(shadow);

  // 3. СЛОЙ ВРАЩЕНИЯ
  spinLayer = new PIXI.Container();
  mainWheelWrapper.addChild(spinLayer);

  // --- СЕКТОРА ---
  const sectorsCfg = GAME_CONFIG.SECTORS;
  const sectorAngle = (Math.PI * 2) / GAME_CONFIG.PRIZES.length;
  const startRotation = -Math.PI / 2;

  GAME_CONFIG.PRIZES.forEach((prize, index) => {
    const start = startRotation + index * sectorAngle;
    const end = start + sectorAngle;
    const g = new PIXI.Graphics();
    
    g.beginPath();
    g.moveTo(0, 0);
    g.arc(0, 0, sectorsCfg.OUTER_RADIUS, start, end);
    g.lineTo(0, 0);
    g.closePath();
    g.fill({ color: prize.color });
    g.stroke({ width: sectorsCfg.STROKE_WIDTH, color: sectorsCfg.STROKE_COLOR, alpha: sectorsCfg.STROKE_ALPHA });

    const textStyle = new PIXI.TextStyle({
      fontFamily: GAME_CONFIG.TEXT.FONT_FAMILY, fontSize: GAME_CONFIG.TEXT.FONT_SIZE,
      fill: GAME_CONFIG.TEXT.COLOR, fontWeight: 'bold',
    });
    const text = new PIXI.Text({ text: prize.text, style: textStyle });
    text.anchor.set(0.5);
    const mid = (start + end) / 2;
    text.position.set(Math.cos(mid) * sectorsCfg.TEXT_RADIUS, Math.sin(mid) * sectorsCfg.TEXT_RADIUS);
    if (GAME_CONFIG.TEXT.ROTATE_TEXT) text.rotation = mid + Math.PI;

    const segmentContainer = new PIXI.Container();
    segmentContainer.addChild(g);
    segmentContainer.addChild(text);
    spinLayer.addChild(segmentContainer);
  });

  // --- ОБОД ---
  const rimParams = GAME_CONFIG.RIM_STYLE;
  if (rimParams.VISIBLE) {
    const rimBase = new PIXI.Graphics();
    rimBase.beginPath();
    rimBase.arc(0, 0, rimParams.RADIUS + rimParams.THICKNESS / 2, 0, Math.PI * 2);
    rimBase.stroke({ width: rimParams.THICKNESS, color: rimParams.COLOR });
    spinLayer.addChild(rimBase);

    const teethContainer = new PIXI.Container();
    spinLayer.addChild(teethContainer);
    const blocks = rimParams.BLOCKS_COUNT;
    const blockAngleStep = (Math.PI * 2) / blocks;
    for(let i=0; i<blocks; i++) {
        if (i % 2 !== 0) continue; 
        const tooth = new PIXI.Graphics();
        tooth.rect(-rimParams.BLOCK_WIDTH / 2, -rimParams.BLOCK_HEIGHT / 2, rimParams.BLOCK_WIDTH, rimParams.BLOCK_HEIGHT);
        tooth.fill({ color: rimParams.BLOCK_COLOR });
        const angle = i * blockAngleStep;
        const radius = rimParams.RADIUS + rimParams.THICKNESS / 2;
        tooth.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius);
        tooth.rotation = angle + Math.PI / 2; 
        teethContainer.addChild(tooth);
    }
  }

  // --- ЦЕНТР И СТРЕЛКА ---
  if (GAME_CONFIG.CENTER_CAP.VISIBLE) {
    const cap = new PIXI.Graphics();
    cap.beginPath();
    cap.arc(0, 0, GAME_CONFIG.CENTER_CAP.RADIUS, 0, Math.PI * 2);
    cap.fill({ color: GAME_CONFIG.CENTER_CAP.COLOR });
    cap.stroke({ width: GAME_CONFIG.CENTER_CAP.BORDER_WIDTH, color: GAME_CONFIG.CENTER_CAP.BORDER_COLOR });
    spinLayer.addChild(cap);
  }

  const GFX = GAME_CONFIG.GRAPHICS;
  pointerSprite = new PIXI.Sprite(assets.pointer);
  pointerSprite.anchor.set(0.5, 1);
  pointerSprite.rotation = Math.PI;
  if (GFX.POINTER.WIDTH) pointerSprite.width = GFX.POINTER.WIDTH;
  if (GFX.POINTER.HEIGHT) pointerSprite.height = GFX.POINTER.HEIGHT;
  pointerSprite.position.set(GFX.POINTER.OFFSET_X, -(GAME_CONFIG.SECTORS.OUTER_RADIUS + GFX.POINTER.OFFSET_Y));
  mainWheelWrapper.addChild(pointerSprite);

  // --- КНОПКА START ---
  button = new PIXI.Sprite(assets.button);
  button.anchor.set(0.5);
  if (GFX.BUTTON.WIDTH) button.width = GFX.BUTTON.WIDTH;
  if (GFX.BUTTON.HEIGHT) button.height = GFX.BUTTON.HEIGHT;
  button.position.set(GFX.BUTTON.OFFSET_X, GAME_CONFIG.SECTORS.OUTER_RADIUS + GFX.BUTTON.OFFSET_Y);
  button.eventMode = 'static';
  button.cursor = 'pointer';
  
  // (АНИМАЦИЯ ПУЛЬСАЦИИ УБРАНА)

  button.on('pointerdown', () => startSpin(spinLayer, button));
  mainWheelWrapper.addChild(button);
}

function layout() {
  const scale = Math.min(app.screen.width / GAME_CONFIG.SCENE.WIDTH, app.screen.height / GAME_CONFIG.SCENE.HEIGHT);
  root.scale.set(scale);
  root.position.set((app.screen.width - GAME_CONFIG.SCENE.WIDTH * scale) / 2, (app.screen.height - GAME_CONFIG.SCENE.HEIGHT * scale) / 2);
}

// ==========================================
// ЛОГИКА АНИМАЦИИ
// ==========================================

function startSpin(wheel: PIXI.Container, btn: PIXI.Sprite) {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  btn.eventMode = 'none';
  btn.alpha = 0.5; // Просто делаем полупрозрачной

  const prizes = GAME_CONFIG.PRIZES;
  const winningIndex = Math.floor(Math.random() * prizes.length);
  console.log('Win:', prizes[winningIndex].text);

  const sectorCount = prizes.length;
  const sectorAngle = (Math.PI * 2) / sectorCount;
  const randomOffset = (Math.random() - 0.5) * (sectorAngle * 0.4); 
  const targetRotation = GAME_CONFIG.ANIMATION.SPINS * Math.PI * 2 
                         - (winningIndex * sectorAngle + sectorAngle / 2) 
                         + randomOffset;

  let previousSectorIndex = -1;
  let lastRotation = wheel.rotation;

  gsap.to(wheel, {
    rotation: targetRotation,
    duration: GAME_CONFIG.ANIMATION.DURATION,
    ease: GAME_CONFIG.ANIMATION.EASE,
    
    onUpdate: function() {
        const currentRot = this.targets()[0].rotation;
        const velocity = Math.abs(currentRot - lastRotation);
        lastRotation = currentRot;

        let normalizedRot = currentRot % (Math.PI * 2);
        if (normalizedRot < 0) normalizedRot += Math.PI * 2;
        const pointerOffset = Math.PI / 2;
        const rawIndex = Math.floor((normalizedRot + pointerOffset) / sectorAngle);
        const currentIndex = rawIndex % sectorCount;

        if (currentIndex !== previousSectorIndex) {
            if (previousSectorIndex !== -1) {
                triggerTick(velocity);
            }
            previousSectorIndex = currentIndex;
        }
    },

    onComplete: () => {
      wheel.rotation = targetRotation % (Math.PI * 2);
      btn.eventMode = 'static';
      btn.alpha = 1; // Возвращаем полную яркость
      alert(`You won: ${prizes[winningIndex].text}`);
    },
  });
}

function triggerTick(velocity: number) {
  const intensity = Math.min(Math.max(velocity * 8, 0.1), 1);

  if (audioCtx) {
    playProceduralClick(intensity);
  }

  if (pointerSprite) {
    gsap.killTweensOf(pointerSprite);
    const baseRotation = Math.PI;
    const dynamicAngle = GAME_CONFIG.TICKER.ANGLE * intensity;
    const kickAngleRad = (dynamicAngle * Math.PI) / 180;
    const duration = Math.max(GAME_CONFIG.TICKER.BASE_DURATION / (intensity * 2 + 0.5), 0.04);

    const tl = gsap.timeline();
    tl.to(pointerSprite, {
      rotation: baseRotation - kickAngleRad, 
      duration: duration * 0.3, 
      ease: 'power1.out',
    })
    .to(pointerSprite, {
      rotation: baseRotation, 
      duration: duration * 0.7,
      ease: 'elastic.out(1, 0.5)',
    });
  }
}

// ==========================================
// ГЕНЕРАТОР ЗВУКА
// ==========================================
function playProceduralClick(intensity: number) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const baseFreq = 100; // Низкий бас
  const maxFreqAdd = 500;
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq + (maxFreqAdd * intensity), audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(baseFreq, audioCtx.currentTime + 0.1);

  const volume = intensity * 0.8; 
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

init();