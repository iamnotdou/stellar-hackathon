import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import './style.css';

// ==========================================
// ГЛАВНАЯ КОНФИГУРАЦИЯ
// ==========================================
const GAME_CONFIG = {
  SCENE: {
    WIDTH: 1920,
    HEIGHT: 1080,
  },

  CENTER: {
    X: 960,
    Y: 420,
  },

  // Настройки программного обода
  RIM_STYLE: {
    VISIBLE: true,
    RADIUS: 365,        // Начало обода (сразу за секторами)
    THICKNESS: 40,      // Толщина серой рамки
    COLOR: 0x222222,    // Цвет подложки обода
    
    // "Пиксельные" блоки (зубчики)
    // Ставим число, кратное 8, чтобы выглядело симметрично с призами
    BLOCKS_COUNT: 64,   
    BLOCK_COLOR: 0x555555, // Сделал чуть светлее, чтобы было видно
    BLOCK_WIDTH: 10,       // Ширина зубчика
    BLOCK_HEIGHT: 20,      // Высота зубчика
  },

  // Настройки секторов (Пицца)
  SECTORS: {
    INNER_RADIUS: 0, 
    OUTER_RADIUS: 360, // Сектора заканчиваются там, где начинается обод
    TEXT_RADIUS: 250,  
    
    // Яркие разделители, чтобы четко видеть 8 кусков
    STROKE_COLOR: 0xFFFFFF, 
    STROKE_WIDTH: 3,
    STROKE_ALPHA: 0.8, 
  },

  GRAPHICS: {
    BACKGROUND: { WIDTH: null, HEIGHT: null, ALPHA: 1 },
    POINTER: {
      WIDTH: 80,   
      HEIGHT: 95,
      OFFSET_X: 0,
      OFFSET_Y: 25, 
    },
    BUTTON: {
      WIDTH: 240,
      HEIGHT: 100,
      OFFSET_X: 0,
      OFFSET_Y: 180, 
    }
  },

  CENTER_CAP: {
    VISIBLE: true,
    RADIUS: 40,
    COLOR: 0x151515,
    BORDER_COLOR: 0x888888,
    BORDER_WIDTH: 2,
  },

  TEXT: {
    FONT_SIZE: 36,
    FONT_FAMILY: 'Arial',
    COLOR: '#ffffff',
    BOLD: true,
    STROKE: '#000000',
    STROKE_THICKNESS: 0,
    ROTATE_TEXT: true,
  },

  ANIMATION: {
    DURATION: 5,
    SPINS: 5,
    EASE: 'power4.out',
  },

  TICKER: {
    ANGLE: 15, 
    DURATION: 0.1, 
  },

  // Немного осветлил цвета, чтобы на черном фоне они не сливались в пятно
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
// КОД ПРИЛОЖЕНИЯ
// ==========================================

const app = new PIXI.Application();
const root = new PIXI.Container();

let mainWheelWrapper: PIXI.Container;
let spinLayer: PIXI.Container; 
let button: PIXI.Sprite;
let pointerSprite: PIXI.Sprite;

type AssetMap = {
  background: PIXI.Texture;
  pointer: PIXI.Texture;
  button: PIXI.Texture;
};

async function init() {
  await app.init({
    resizeTo: window,
    backgroundAlpha: 0,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  document.body.appendChild(app.canvas);

  const [bg, ptr, btn] = await Promise.all([
    PIXI.Assets.load('/Assets/background.png'),
    PIXI.Assets.load('/Assets/pointer.png'),
    PIXI.Assets.load('/Assets/button.png'),
  ]);

  const assets: AssetMap = {
    background: bg,
    pointer: ptr,
    button: btn,
  };

  app.stage.addChild(root);
  setupScene(assets);
  layout();
  window.addEventListener('resize', layout);
}

function setupScene(assets: AssetMap) {
  const GFX = GAME_CONFIG.GRAPHICS;

  // 1. ФОН
  const bg = new PIXI.Sprite(assets.background);
  bg.width = GFX.BACKGROUND.WIDTH || GAME_CONFIG.SCENE.WIDTH;
  bg.height = GFX.BACKGROUND.HEIGHT || GAME_CONFIG.SCENE.HEIGHT;
  root.addChild(bg);

  // 2. ГЛАВНЫЙ КОНТЕЙНЕР
  mainWheelWrapper = new PIXI.Container();
  mainWheelWrapper.position.set(GAME_CONFIG.CENTER.X, GAME_CONFIG.CENTER.Y);
  root.addChild(mainWheelWrapper);

  // 3. ВРАЩАЮЩИЙСЯ СЛОЙ
  spinLayer = new PIXI.Container();
  mainWheelWrapper.addChild(spinLayer);

  // --- A) РИСУЕМ СЕКТОРА (8 штук) ---
  const sectorsCfg = GAME_CONFIG.SECTORS;
  const sectorAngle = (Math.PI * 2) / GAME_CONFIG.PRIZES.length;
  const startRotation = -Math.PI / 2; 

  GAME_CONFIG.PRIZES.forEach((prize, index) => {
    const start = startRotation + index * sectorAngle;
    const end   = start + sectorAngle;

    const g = new PIXI.Graphics();
    
    // Сектор
    g.beginPath();
    g.moveTo(0, 0); 
    g.arc(0, 0, sectorsCfg.OUTER_RADIUS, start, end);
    g.lineTo(0, 0);
    g.closePath();
    g.fill({ color: prize.color });
    
    // Яркая линия разделителя
    g.stroke({ 
      width: sectorsCfg.STROKE_WIDTH, 
      color: sectorsCfg.STROKE_COLOR, 
      alpha: sectorsCfg.STROKE_ALPHA 
    });

    // Текст
    const textStyle = new PIXI.TextStyle({
      fontFamily: GAME_CONFIG.TEXT.FONT_FAMILY,
      fontSize: GAME_CONFIG.TEXT.FONT_SIZE,
      fill: GAME_CONFIG.TEXT.COLOR,
      fontWeight: 'bold',
    });

    const text = new PIXI.Text({ text: prize.text, style: textStyle });
    text.anchor.set(0.5);

    const mid = (start + end) / 2;
    text.position.set(
      Math.cos(mid) * sectorsCfg.TEXT_RADIUS, 
      Math.sin(mid) * sectorsCfg.TEXT_RADIUS
    );

    if (GAME_CONFIG.TEXT.ROTATE_TEXT) {
      text.rotation = mid + Math.PI; 
    }

    const segmentContainer = new PIXI.Container();
    segmentContainer.addChild(g);
    segmentContainer.addChild(text);
    spinLayer.addChild(segmentContainer);
  });

  // --- B) MANUAL RIM (Обод с зубчиками) ---
  const rimParams = GAME_CONFIG.RIM_STYLE;
  if (rimParams.VISIBLE) {
    // 1. Рисуем подложку обода как ТОЛСТУЮ ОБВОДКУ (Stroke), а не заливку.
    // Это гарантирует, что центр останется прозрачным и не закроет призы.
    const rimBase = new PIXI.Graphics();
    
    const midRadius = rimParams.RADIUS + rimParams.THICKNESS / 2;
    
    rimBase.beginPath();
    rimBase.arc(0, 0, midRadius, 0, Math.PI * 2);
    rimBase.stroke({ 
        width: rimParams.THICKNESS, 
        color: rimParams.COLOR 
    });
    
    spinLayer.addChild(rimBase);

    // 2. Рисуем "пиксельные" зубчики
    const blocks = rimParams.BLOCKS_COUNT;
    const blockAngleStep = (Math.PI * 2) / blocks;
    
    const teethContainer = new PIXI.Container();
    spinLayer.addChild(teethContainer);

    for(let i=0; i<blocks; i++) {
        // Рисуем через один, чтобы была текстура
        if (i % 2 !== 0) continue; 

        const tooth = new PIXI.Graphics();
        // Рисуем прямоугольник с центром в (0,0)
        tooth.rect(
            -rimParams.BLOCK_WIDTH / 2, 
            -rimParams.BLOCK_HEIGHT / 2, 
            rimParams.BLOCK_WIDTH, 
            rimParams.BLOCK_HEIGHT
        );
        tooth.fill({ color: rimParams.BLOCK_COLOR });
        
        const angle = i * blockAngleStep;
        // Позиция по центру толщины обода
        const radius = rimParams.RADIUS + rimParams.THICKNESS / 2;
        
        tooth.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius
        );
        
        // Поворачиваем прямоугольник по касательной к кругу
        tooth.rotation = angle + Math.PI / 2; 
        
        teethContainer.addChild(tooth);
    }
  }

  // --- C) CENTER CAP ---
  if (GAME_CONFIG.CENTER_CAP.VISIBLE) {
    const cap = new PIXI.Graphics();
    cap.beginPath();
    cap.arc(0, 0, GAME_CONFIG.CENTER_CAP.RADIUS, 0, Math.PI * 2);
    cap.fill({ color: GAME_CONFIG.CENTER_CAP.COLOR });
    cap.stroke({ 
      width: GAME_CONFIG.CENTER_CAP.BORDER_WIDTH, 
      color: GAME_CONFIG.CENTER_CAP.BORDER_COLOR 
    });
    spinLayer.addChild(cap);
  }

  // --- D) POINTER (СТРЕЛКА) ---
  pointerSprite = new PIXI.Sprite(assets.pointer);
  pointerSprite.anchor.set(0.5, 1); 
  pointerSprite.rotation = Math.PI; 
  
  if (GFX.POINTER.WIDTH) pointerSprite.width = GFX.POINTER.WIDTH;
  if (GFX.POINTER.HEIGHT) pointerSprite.height = GFX.POINTER.HEIGHT;

  const ptrY = -(GAME_CONFIG.SECTORS.OUTER_RADIUS + GFX.POINTER.OFFSET_Y);
  const ptrX = GFX.POINTER.OFFSET_X;
  
  pointerSprite.position.set(ptrX, ptrY);
  mainWheelWrapper.addChild(pointerSprite);

  // --- E) КНОПКА START ---
  button = new PIXI.Sprite(assets.button);
  button.anchor.set(0.5);
  
  if (GFX.BUTTON.WIDTH) button.width = GFX.BUTTON.WIDTH;
  if (GFX.BUTTON.HEIGHT) button.height = GFX.BUTTON.HEIGHT;

  const btnY = GAME_CONFIG.SECTORS.OUTER_RADIUS + GFX.BUTTON.OFFSET_Y;
  const btnX = GFX.BUTTON.OFFSET_X;

  button.position.set(btnX, btnY);
  button.eventMode = 'static';
  button.cursor = 'pointer';
  button.on('pointerdown', () => startSpin(spinLayer, button));
  mainWheelWrapper.addChild(button);
}

function layout() {
  const { WIDTH, HEIGHT } = GAME_CONFIG.SCENE;
  const scale = Math.min(app.screen.width / WIDTH, app.screen.height / HEIGHT);

  root.scale.set(scale);
  root.position.set(
    (app.screen.width - WIDTH * scale) / 2,
    (app.screen.height - HEIGHT * scale) / 2
  );
}

// ----------------------------------------------------
// ЛОГИКА ВРАЩЕНИЯ
// ----------------------------------------------------

function startSpin(wheel: PIXI.Container, btn: PIXI.Sprite) {
  btn.eventMode = 'none';
  btn.alpha = 0.5;

  const prizes = GAME_CONFIG.PRIZES;
  const winningIndex = Math.floor(Math.random() * prizes.length);
  console.log('Win:', prizes[winningIndex].text);

  const sectorCount = prizes.length;
  const sectorAngle = (Math.PI * 2) / sectorCount;
  
  // Рассчитываем так, чтобы центр сектора попал под стрелку
  const targetRotation = GAME_CONFIG.ANIMATION.SPINS * Math.PI * 2 - (winningIndex * sectorAngle + sectorAngle / 2);

  let previousSectorIndex = -1;

  gsap.to(wheel, {
    rotation: targetRotation,
    duration: GAME_CONFIG.ANIMATION.DURATION,
    ease: GAME_CONFIG.ANIMATION.EASE,
    
    onUpdate: function() {
        const currentRot = this.targets()[0].rotation;
        
        // Нормализация угла
        let normalizedRot = currentRot % (Math.PI * 2);
        if (normalizedRot < 0) normalizedRot += Math.PI * 2;

        const pointerOffset = Math.PI / 2;
        const rawIndex = Math.floor((normalizedRot + pointerOffset) / sectorAngle);
        const currentIndex = rawIndex % sectorCount;

        if (currentIndex !== previousSectorIndex) {
            if (previousSectorIndex !== -1) {
                playTickAnimation();
            }
            previousSectorIndex = currentIndex;
        }
    },

    onComplete: () => {
      wheel.rotation = targetRotation % (Math.PI * 2);
      btn.eventMode = 'static';
      btn.alpha = 1;
      alert(`You won: ${prizes[winningIndex].text}`);
    },
  });
}

function playTickAnimation() {
  if (!pointerSprite) return;

  gsap.killTweensOf(pointerSprite);

  const baseRotation = Math.PI;
  const kickAngleRad = (GAME_CONFIG.TICKER.ANGLE * Math.PI) / 180;
  
  const tl = gsap.timeline();
  tl.to(pointerSprite, {
    rotation: baseRotation - kickAngleRad, 
    duration: GAME_CONFIG.TICKER.DURATION * 0.3, 
    ease: 'power1.out',
  })
  .to(pointerSprite, {
    rotation: baseRotation, 
    duration: GAME_CONFIG.TICKER.DURATION * 0.7,
    ease: 'elastic.out(1, 0.5)',
  });
}

init();