import { useState, useRef, useEffect } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { Fruit, FRUIT_TYPES } from '../game/Fruit';
import { FruitPiece } from '../game/FruitPiece';
import { JuiceParticle } from '../game/JuiceParticle';
import { Bomb } from '../game/Bomb';

/**
 * Score points awarded per sliced fruit type
 */
const FRUIT_SCORES = {
  apple: 10,
  orange: 10,
  banana: 15,
  watermelon: 20,
  strawberry: 15,
  mango: 20,
  pineapple: 25,
  kiwi: 15,
  dragonfruit: 25,
};

/**
 * Maximum milliseconds allowed between consecutive fruit slices to count as a genuine single-motion combo.
 *
 * Why we use a time-based window (~220ms) instead of just 'pointer is still down':
 * - If we only checked whether the pointer was held down, a player could drag their finger across
 *   the canvas continuously for 10 seconds, cutting fruits seconds apart, and receive an undeserved massive combo.
 * - A genuine Fruit Ninja combo requires slicing multiple fruits that are clustered in the air simultaneously
 *   in a single, lightning-fast swipe.
 * - Requiring consecutive cuts to occur within 220ms ensures only true simultaneous cuts trigger combo rewards.
 */
const COMBO_TIME_WINDOW_MS = 220;

/**
 * DIFFICULTY SCALING CONFIGURATION & TUNING
 *
 * How the continuous difficulty scaling works:
 * - `survivalTime` continuously tracks the player's elapsed survival time in seconds.
 * - An exponential decay curve computes a smooth, continuous `difficultyProgress` from 0.0 (start) to 1.0 (max):
 *     `difficultyProgress = 1 - Math.exp(-survivalTime / RAMP_HALFLIFE)`
 * - This progress smoothly scales:
 *   1. Spawn Interval: from `INITIAL_SPAWN_INTERVAL` (1.45s) down to `MIN_SPAWN_INTERVAL` (0.40s)
 *   2. Launch Speed: from `INITIAL_SPEED_MULTIPLIER` (1.0x) up to `MAX_SPEED_MULTIPLIER` (1.30x)
 *   3. Multi-Fruit Barrage Chance: from 0% up to 35% chance to launch multiple fruits in rapid succession.
 *
 * Where to Adjust the Tuning:
 * - To make the ramp FASTER: Decrease `RAMP_HALFLIFE` (e.g. set to 35s or 45s).
 * - To make the ramp SLOWER: Increase `RAMP_HALFLIFE` (e.g. set to 90s or 120s).
 * - To adjust starting comfort: Edit `INITIAL_SPAWN_INTERVAL` or `INITIAL_SPEED_MULTIPLIER`.
 * - To adjust maximum endgame cap: Edit `MIN_SPAWN_INTERVAL` or `MAX_SPEED_MULTIPLIER`.
 */
const DIFFICULTY_CONFIG = {
  // Time in seconds to reach ~63% of maximum intensity (lower = faster ramp-up)
  RAMP_HALFLIFE: 60,

  // Spawn interval range (seconds between fruit/bomb spawns)
  INITIAL_SPAWN_INTERVAL: 1.45,
  MIN_SPAWN_INTERVAL: 0.40,
  SPAWN_JITTER: 0.22,

  // Launch speed multiplier (scales upward launch velocity & gravity)
  INITIAL_SPEED_MULTIPLIER: 1.0,
  MAX_SPEED_MULTIPLIER: 1.30,

  // Multi-fruit barrage probability at higher intensity
  MAX_MULTI_FRUIT_CHANCE: 0.35,
};

/**
 * COMBO CLUSTER SPAWN CONFIGURATION & TUNING
 *
 * How cluster spawns are spaced and timed for achievable combos:
 * 1. Clustered Spatial Anchoring: Cluster fruits share a common center launch point (`clusterCenterX`)
 *    and are offset horizontally by `CLUSTER_SPREAD_PX` (50px to 60px apart). This guarantees that
 *    all 2-3 fruits fly together within a tight ~120-150px corridor, perfectly fitting within one standard swipe.
 * 2. Synchronized Launch Velocity (Arc Alignment): All fruits in the cluster share the same base upward
 *    launch velocity (`vy`) with only minimal jitter (+/- 2.5%), ensuring they reach the top apex together
 *    and hang in the air at the exact same moment.
 * 3. 100% Bomb-Free: Clusters NEVER spawn bombs, allowing players to freely and fearlessly slash through.
 * 4. Visual Variety: Fruit types within a cluster are shuffled and selected to be distinct (e.g. apple + banana + watermelon).
 *
 * Where to Adjust:
 * - Cluster Frequency: Adjust `CLUSTER_CHANCE` (e.g. 0.18 = ~18% of spawns, roughly every 8-12 seconds).
 * - Cluster Size: Adjust `MIN_CLUSTER_SIZE` (2) and `MAX_CLUSTER_SIZE` (3).
 * - Cluster Spacing: Adjust `CLUSTER_SPREAD_PX` (e.g. 55px).
 */
const CLUSTER_CONFIG = {
  CLUSTER_CHANCE: 0.18,      // ~18% chance for a combo cluster spawn (roughly every 8-12 seconds)
  MIN_CLUSTER_SIZE: 2,       // Minimum fruits in a combo cluster
  MAX_CLUSTER_SIZE: 3,       // Maximum fruits in a combo cluster
  CLUSTER_SPREAD_PX: 55,     // Horizontal spacing between adjacent fruits in a cluster
};

/**
 * GameScreen Component - Classic Fruit Ninja Dojo Style
 *
 * How the Vignette Effect is Achieved:
 * - A 2D canvas radial gradient (`ctx.createRadialGradient(cx, cy, rInner, cx, cy, rOuter)`) is anchored
 *   at the exact center of the screen (cx, cy).
 * - The inner circle (rInner) is completely transparent `rgba(0, 0, 0, 0)`, keeping the active slicing
 *   center bright and focused.
 * - The outer radius (rOuter) spans to the far diagonal screen corners, smoothly transitioning into
 *   a deep, atmospheric vignette shadow `rgba(0, 0, 0, 0.88)` that frames the dark wooden dojo planks.
 *
 * How the Combo Popup Scale + Fade + Float Animation Works:
 * 1. Float: Each frame, the popup moves upward by subtracting vertical velocity (`y -= 50 * deltaTime`).
 * 2. Elastic Scale Pop: Over the first 0.15s, scale rapidly expands from 0 to 1.4, then settles down
 *    to 1.0 by 0.35s (creating a punchy, satisfying arcade impact pop).
 * 3. Fade Out: During the remaining lifetime (0.35s to 0.65s), opacity smoothly drops from 1.0 to 0.0.
 */
export default function GameScreen({ onGameOver, onExit }) {
  const canvasRef = useRef(null);

  // UI State
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);

  // Synchronous trackers for 60 FPS animation loop
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const isGameOverRef = useRef(false);

  // Survival time tracker (seconds survived in current round)
  const survivalTimeRef = useRef(0);

  // Active game entities stored in Refs
  const fruitsRef = useRef([]);
  const bombsRef = useRef([]);
  const fruitPiecesRef = useRef([]);
  const particlesRef = useRef([]);
  const combosRef = useRef([]);
  const shockwavesRef = useRef([]);

  // Spawner timing
  const spawnTimerRef = useRef(0);
  const nextSpawnTimeRef = useRef(1.2);

  // Visual screen effects
  const screenFlashRef = useRef(0);
  const screenShakeRef = useRef(0);

  // Slice trail, pointer tracking & time-window combo trackers
  const trailRef = useRef([]);
  const isSwipingRef = useRef(false);
  const pointerPosRef = useRef({ x: -100, y: -100, visible: false });
  const pointerAngleRef = useRef(-Math.PI / 4);
  const comboStreakRef = useRef(0); // Valid combo count within COMBO_TIME_WINDOW_MS
  const lastSliceTimeRef = useRef(0); // Timestamp of the previous fruit slice

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const triggerGameOver = (delayMs = 350) => {
    if (isGameOverRef.current) return;
    isGameOverRef.current = true;

    setTimeout(() => {
      if (onGameOver) {
        onGameOver(scoreRef.current);
      }
    }, delayMs);
  };

  // -------------------------------------------------------------
  // Pointer Event Handlers (Swipe & Time-Window Combo Tracking)
  // -------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (isGameOverRef.current) return;
    isSwipingRef.current = true;
    comboStreakRef.current = 0;
    lastSliceTimeRef.current = 0;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerPosRef.current = { x, y, visible: true };
    trailRef.current = [{ x, y, time: performance.now() }];
  };

  const handlePointerMove = (e) => {
    if (isGameOverRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerPosRef.current = { x, y, visible: true };

    if (isSwipingRef.current) {
      trailRef.current.push({ x, y, time: performance.now() });

      if (trailRef.current.length >= 2) {
        const p1 = trailRef.current[trailRef.current.length - 2];
        const p2 = trailRef.current[trailRef.current.length - 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        if (dx !== 0 || dy !== 0) {
          pointerAngleRef.current = Math.atan2(dy, dx);
        }
      }
    }
  };

  const handlePointerEnd = () => {
    isSwipingRef.current = false;
    trailRef.current = [];
    comboStreakRef.current = 0;
    lastSliceTimeRef.current = 0;
  };

  const handlePointerLeave = () => {
    isSwipingRef.current = false;
    trailRef.current = [];
    pointerPosRef.current.visible = false;
    comboStreakRef.current = 0;
    lastSliceTimeRef.current = 0;
  };

  // -------------------------------------------------------------
  // Dark Wooden Dojo Background with Wood Grain & Radial Vignette
  // -------------------------------------------------------------
  const drawDojoBackground = (ctx, width, height) => {
    // 1. Dark Wood Plank Base
    ctx.fillStyle = '#22130b';
    ctx.fillRect(-20, -20, width + 40, height + 40);

    // 2. Horizontal Wood Planks & Grain Streaks
    const plankHeight = 72;
    const numPlanks = Math.ceil(height / plankHeight) + 1;

    for (let i = 0; i < numPlanks; i++) {
      const y = i * plankHeight;

      // Plank color variation
      ctx.fillStyle = i % 2 === 0 ? 'rgba(45, 25, 15, 0.45)' : 'rgba(30, 16, 10, 0.45)';
      ctx.fillRect(0, y, width, plankHeight);

      // Dark seam gap between planks
      ctx.fillStyle = '#100804';
      ctx.fillRect(0, y + plankHeight - 3, width, 3);

      // Subtle light bevel highlight on bottom of plank
      ctx.fillStyle = 'rgba(255, 200, 150, 0.05)';
      ctx.fillRect(0, y + plankHeight, width, 1.5);

      // Wood grain horizontal streaks
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, y + plankHeight * 0.35, width, 2);
      ctx.fillRect(0, y + plankHeight * 0.65, width, 1.5);
    }

    // 3. Radial Vignette Shading (Darkens outer edges and corners)
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.hypot(cx, cy);

    const vignette = ctx.createRadialGradient(cx, cy, maxRadius * 0.25, cx, cy, maxRadius * 0.95);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.55, 'rgba(0, 0, 0, 0.38)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.88)');

    ctx.fillStyle = vignette;
    ctx.fillRect(-20, -20, width + 40, height + 40);
  };

  // -------------------------------------------------------------
  // Sword / Blade Cursor
  // -------------------------------------------------------------
  const drawSword = (ctx, x, y, angle, isSwiping) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (isSwiping) {
      // Katana Blade
      ctx.shadowColor = '#00d2d3';
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-46, -4.5);
      ctx.lineTo(-50, 0);
      ctx.lineTo(-46, 4.5);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-46, 4.5);
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.beginPath();
      ctx.ellipse(-50, 0, 3.5, 9.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fill();
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-70, -3.5, 20, 7);

      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 1.2;
      for (let offset = -68; offset < -52; offset += 4) {
        ctx.beginPath();
        ctx.moveTo(offset, -3.5);
        ctx.lineTo(offset + 3, 3.5);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(-70, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f1c40f';
      ctx.fill();
    } else {
      // Idle Cursor
      ctx.shadowColor = 'rgba(0, 210, 211, 0.4)';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-20, -3);
      ctx.lineTo(-20, 3);
      ctx.closePath();
      ctx.fillStyle = '#f5f6fa';
      ctx.fill();

      ctx.fillStyle = '#f39c12';
      ctx.fillRect(-22, -4, 2, 8);
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-30, -2, 8, 4);
    }

    ctx.restore();
  };

  // -------------------------------------------------------------
  // Main Game Loop (60+ FPS)
  // -------------------------------------------------------------
  useGameLoop((deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    const TRAIL_LIFETIME = 75; // Snappy, dramatic slice fadeout

    // 1. Filter expired trail points
    trailRef.current = trailRef.current.filter((point) => now - point.time < TRAIL_LIFETIME);

    // 2. Track Survival Time & Compute Continuous Difficulty Progression
    if (!isGameOverRef.current) {
      survivalTimeRef.current += deltaTime;
      const elapsed = survivalTimeRef.current;

      // Smooth asymptotic curve from 0.0 (fresh start) toward 1.0 (max intensity)
      const difficultyProgress = 1 - Math.exp(-elapsed / DIFFICULTY_CONFIG.RAMP_HALFLIFE);

      // Continuous spawn interval scaling: starts at 1.45s and ramps down toward 0.40s
      const currentBaseInterval =
        DIFFICULTY_CONFIG.INITIAL_SPAWN_INTERVAL -
        difficultyProgress * (DIFFICULTY_CONFIG.INITIAL_SPAWN_INTERVAL - DIFFICULTY_CONFIG.MIN_SPAWN_INTERVAL);

      // Continuous speed multiplier: starts at 1.0x and ramps up toward 1.30x
      const currentSpeedMultiplier =
        DIFFICULTY_CONFIG.INITIAL_SPEED_MULTIPLIER +
        difficultyProgress * (DIFFICULTY_CONFIG.MAX_SPEED_MULTIPLIER - DIFFICULTY_CONFIG.INITIAL_SPEED_MULTIPLIER);

      // 3. Spawner Logic (Frequency increases continuously with survival time)
      spawnTimerRef.current += deltaTime;
      if (spawnTimerRef.current >= nextSpawnTimeRef.current) {
        spawnTimerRef.current = 0;
        nextSpawnTimeRef.current = Math.max(
          DIFFICULTY_CONFIG.MIN_SPAWN_INTERVAL,
          currentBaseInterval + (Math.random() - 0.5) * DIFFICULTY_CONFIG.SPAWN_JITTER
        );

        // Check if this spawn cycle is a special Combo Cluster opportunity (~18% chance)
        const isClusterSpawn = Math.random() < CLUSTER_CONFIG.CLUSTER_CHANCE;

        if (isClusterSpawn) {
          // --- COMBO CLUSTER SPAWN (2-3 closely grouped fruits, 100% bomb-free) ---
          const clusterSize =
            Math.random() > 0.45 ? CLUSTER_CONFIG.MAX_CLUSTER_SIZE : CLUSTER_CONFIG.MIN_CLUSTER_SIZE;

          // Shared center launch point
          const clusterMargin = 130;
          const clusterCenterX = clusterMargin + Math.random() * (canvas.width - clusterMargin * 2);
          const centerBias = (canvas.width / 2 - clusterCenterX) * 0.4;

          // Synchronized upward launch velocity so they peak and hang in the air together
          const minLaunch = Math.sqrt(2 * 750 * (canvas.height * 0.58)) * currentSpeedMultiplier;
          const maxLaunch = Math.sqrt(2 * 750 * (canvas.height * 0.76)) * currentSpeedMultiplier;
          const baseVy = -(minLaunch + Math.random() * (maxLaunch - minLaunch));
          const baseVx = (Math.random() - 0.5) * 50 + centerBias;

          // Pick distinct fruit types within the cluster for visual variety
          const fruitTypes = [
            'apple',
            'orange',
            'banana',
            'watermelon',
            'strawberry',
            'mango',
            'pineapple',
            'kiwi',
            'dragonfruit',
          ];
          const shuffledTypes = [...fruitTypes].sort(() => Math.random() - 0.5);

          for (let c = 0; c < clusterSize; c++) {
            // Distribute tightly around clusterCenterX: e.g. [-28, +28] or [-55, 0, +55]
            const offsetMultiplier = clusterSize === 2 ? (c === 0 ? -0.5 : 0.5) : c - 1;
            const fruitX = clusterCenterX + offsetMultiplier * CLUSTER_CONFIG.CLUSTER_SPREAD_PX;

            // Minimal velocity variance (+/- 2.5%) ensures synchronized arc
            const fruitVy = baseVy * (0.975 + Math.random() * 0.05);
            const fruitVx = baseVx + offsetMultiplier * 14;
            const fruitType = shuffledTypes[c % shuffledTypes.length];

            // Stagger spawn by 0ms or tiny 30ms for natural simultaneous release
            if (c === 0) {
              fruitsRef.current.push(
                new Fruit(canvas.width, canvas.height, currentSpeedMultiplier, {
                  x: fruitX,
                  vy: fruitVy,
                  vx: fruitVx,
                  type: fruitType,
                })
              );
            } else {
              setTimeout(() => {
                if (!isGameOverRef.current && canvasRef.current) {
                  fruitsRef.current.push(
                    new Fruit(canvas.width, canvas.height, currentSpeedMultiplier, {
                      x: fruitX,
                      vy: fruitVy,
                      vx: fruitVx,
                      type: fruitType,
                    })
                  );
                }
              }, c * 35);
            }
          }
        } else {
          // --- NORMAL DEFAULT SPAWN (Single fruit or bomb) ---
          const isBomb = Math.random() < 0.18;
          if (isBomb) {
            bombsRef.current.push(new Bomb(canvas.width, canvas.height, currentSpeedMultiplier));
          } else {
            fruitsRef.current.push(new Fruit(canvas.width, canvas.height, currentSpeedMultiplier));

            // Multi-fruit barrage chance at higher intensity
            const multiChance = difficultyProgress * DIFFICULTY_CONFIG.MAX_MULTI_FRUIT_CHANCE;
            if (Math.random() < multiChance) {
              setTimeout(() => {
                if (!isGameOverRef.current && canvasRef.current) {
                  fruitsRef.current.push(new Fruit(canvas.width, canvas.height, currentSpeedMultiplier));
                }
              }, 120);
            }
          }
        }
      }
    }

    // 4. Clear Canvas & Apply Screen Shake
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (screenShakeRef.current > 0) {
      screenShakeRef.current -= deltaTime;
      const intensity = 26 * (screenShakeRef.current / 0.45);
      const shakeX = (Math.random() - 0.5) * intensity;
      const shakeY = (Math.random() - 0.5) * intensity;
      ctx.translate(shakeX, shakeY);
    }

    // Draw Dark Dojo Wood Planks & Vignette
    drawDojoBackground(ctx, canvas.width, canvas.height);

    // -------------------------------------------------------------
    // 5. Update & Draw Sliced Fruit Pieces (Halves)
    // -------------------------------------------------------------
    const activePieces = [];
    for (let i = 0; i < fruitPiecesRef.current.length; i++) {
      const piece = fruitPiecesRef.current[i];
      piece.update(deltaTime);
      piece.draw(ctx);

      if (!(piece.y > canvas.height + piece.radius * 2 && piece.vy > 0)) {
        activePieces.push(piece);
      }
    }
    fruitPiecesRef.current = activePieces;

    // -------------------------------------------------------------
    // 6. Update & Draw Shockwaves
    // -------------------------------------------------------------
    const activeShockwaves = [];
    for (let i = 0; i < shockwavesRef.current.length; i++) {
      const sw = shockwavesRef.current[i];
      sw.age += deltaTime;
      const progress = sw.age / sw.maxAge;

      if (progress < 1) {
        const curRadius = sw.radius + (sw.maxRadius - sw.radius) * progress;
        const alpha = Math.max(0, (1 - progress) * 0.9);

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, curRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 230, 150, ${alpha})`;
        ctx.lineWidth = Math.max(1, (1 - progress) * 16);
        ctx.shadowColor = '#ffa502';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.restore();

        activeShockwaves.push(sw);
      }
    }
    shockwavesRef.current = activeShockwaves;

    // -------------------------------------------------------------
    // 7. Update & Draw Particles (Juice Splatters & Smoke/Fire)
    // -------------------------------------------------------------
    const activeParticles = [];
    for (let i = 0; i < particlesRef.current.length; i++) {
      const p = particlesRef.current[i];
      p.update(deltaTime);
      p.draw(ctx);

      if (!p.isDead) {
        activeParticles.push(p);
      }
    }
    particlesRef.current = activeParticles;

    // -------------------------------------------------------------
    // 8. Update, Check Collision, and Draw Bombs
    // -------------------------------------------------------------
    const activeBombs = [];
    const trail = trailRef.current;

    for (let i = 0; i < bombsRef.current.length; i++) {
      const bomb = bombsRef.current[i];

      let bombHit = false;
      if (!isGameOverRef.current && isSwipingRef.current && trail.length > 0) {
        for (let j = 0; j < trail.length; j++) {
          const pt = trail[j];
          const dx = pt.x - bomb.x;
          const dy = pt.y - bomb.y;

          if (dx * dx + dy * dy <= bomb.radius * bomb.radius) {
            bombHit = true;
            break;
          }
        }
      }

      if (bombHit && !bomb.exploded) {
        bomb.exploded = true;

        // Big Dramatic Explosion Shockwave
        shockwavesRef.current.push({
          x: bomb.x,
          y: bomb.y,
          radius: 12,
          maxRadius: 220,
          age: 0,
          maxAge: 0.45,
        });

        screenShakeRef.current = 0.55;
        screenFlashRef.current = 0.5;

        // 36+ Mixed particles: fiery orange/crimson, yellow sparks, expanding charcoal smoke
        for (let k = 0; k < 16; k++) {
          particlesRef.current.push(new JuiceParticle(bomb.x, bomb.y, '#ff4757', true, 'fire'));
          particlesRef.current.push(new JuiceParticle(bomb.x, bomb.y, '#ffa502', true, 'fire'));
        }
        for (let k = 0; k < 12; k++) {
          particlesRef.current.push(new JuiceParticle(bomb.x, bomb.y, '#fed330', true, 'spark'));
        }
        for (let k = 0; k < 12; k++) {
          particlesRef.current.push(new JuiceParticle(bomb.x, bomb.y, '#2d3436', true, 'smoke'));
        }

        console.log('BOMB HIT - GAME OVER');
        triggerGameOver(400);
        continue;
      }

      bomb.update(deltaTime);
      bomb.draw(ctx);

      const isBelowScreen = bomb.y > canvas.height + bomb.radius * 2 && bomb.vy > 0;
      if (!isBelowScreen) {
        activeBombs.push(bomb);
      }
    }
    bombsRef.current = activeBombs;

    // -------------------------------------------------------------
    // 9. Update, Check Collision, and Draw Whole Fruits
    // -------------------------------------------------------------
    const activeFruits = [];

    for (let i = 0; i < fruitsRef.current.length; i++) {
      const fruit = fruitsRef.current[i];

      let isSliced = false;
      if (!isGameOverRef.current && isSwipingRef.current && trail.length > 0) {
        for (let j = 0; j < trail.length; j++) {
          const pt = trail[j];
          const dx = pt.x - fruit.x;
          const dy = pt.y - fruit.y;

          if (dx * dx + dy * dy <= fruit.radius * fruit.radius) {
            isSliced = true;
            break;
          }
        }
      }

      if (isSliced && !fruit.sliced) {
        fruit.sliced = true;

        // 1. Time-Window Based Combo Detection
        const nowSliceTime = performance.now();
        const timeSinceLastSlice = nowSliceTime - lastSliceTimeRef.current;

        if (timeSinceLastSlice <= COMBO_TIME_WINDOW_MS && lastSliceTimeRef.current > 0) {
          // Sliced in rapid succession within the 220ms time window -> increase combo!
          comboStreakRef.current += 1;
        } else {
          // Too much time passed (or first slice) -> start a new combo streak at 1
          comboStreakRef.current = 1;
        }
        lastSliceTimeRef.current = nowSliceTime;

        const currentCombo = comboStreakRef.current;

        // 2. Base points + Combo Bonus Points
        const basePoints = FRUIT_SCORES[fruit.type] || fruit.points || 10;
        let pointsEarned = basePoints;

        // Only show combo popup and award bonus when 2+ fruits are cut within the time window
        if (currentCombo >= 2) {
          const comboBonus = currentCombo * 2;
          pointsEarned += comboBonus;

          // Spawn floating Combo Popup Text ("COMBO x3! +36")
          combosRef.current.push({
            x: fruit.x,
            y: fruit.y - 20,
            comboCount: currentCombo,
            bonusPoints: pointsEarned,
            age: 0,
            maxAge: 0.65,
          });

          console.log(`COMBO HIT: x${currentCombo}! +${pointsEarned} pts`);
        }

        scoreRef.current += pointsEarned;
        setScore(scoreRef.current);

        // 3. Calculate Slice Angle
        let sliceAngle = pointerAngleRef.current;
        if (trail.length >= 2) {
          const p1 = trail[trail.length - 2];
          const p2 = trail[trail.length - 1];
          sliceAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        }

        // 4. Spawn Severed Halves
        const leftHalf = new FruitPiece({
          x: fruit.x,
          y: fruit.y,
          vx: fruit.vx,
          vy: fruit.vy,
          radius: fruit.radius,
          type: fruit.type,
          lightColor: fruit.lightColor,
          baseColor: fruit.baseColor,
          darkColor: fruit.darkColor,
          rindBorder: fruit.rindBorder,
          fleshColor: fruit.fleshColor,
          fleshLight: fruit.fleshLight,
          detailColor: fruit.detailColor,
          side: 'left',
          sliceAngle,
        });

        const rightHalf = new FruitPiece({
          x: fruit.x,
          y: fruit.y,
          vx: fruit.vx,
          vy: fruit.vy,
          radius: fruit.radius,
          type: fruit.type,
          lightColor: fruit.lightColor,
          baseColor: fruit.baseColor,
          darkColor: fruit.darkColor,
          rindBorder: fruit.rindBorder,
          fleshColor: fruit.fleshColor,
          fleshLight: fruit.fleshLight,
          detailColor: fruit.detailColor,
          side: 'right',
          sliceAngle,
        });

        fruitPiecesRef.current.push(leftHalf, rightHalf);

        // 5. Spawn Chunky Juice Droplets & Motion Streaks
        const particleCount = 14 + Math.floor(Math.random() * 8);
        for (let k = 0; k < particleCount; k++) {
          particlesRef.current.push(
            new JuiceParticle(fruit.x, fruit.y, fruit.fleshColor || fruit.baseColor)
          );
          if (k % 3 === 0) {
            particlesRef.current.push(
              new JuiceParticle(fruit.x, fruit.y, fruit.baseColor || fruit.rindBorder)
            );
          }
        }

        continue;
      }

      fruit.update(deltaTime);
      fruit.draw(ctx);

      // Missed fruit check
      const isBelowScreen = fruit.y > canvas.height + fruit.radius * 2 && fruit.vy > 0;
      if (isBelowScreen) {
        if (!fruit.sliced && !isGameOverRef.current) {
          console.log('fruit missed');

          livesRef.current = Math.max(0, livesRef.current - 1);
          setLives(livesRef.current);

          if (livesRef.current === 0) {
            console.log('OUT OF LIVES - GAME OVER');
            triggerGameOver(300);
          }
        }
      } else {
        activeFruits.push(fruit);
      }
    }

    fruitsRef.current = activeFruits;

    // -------------------------------------------------------------
    // 10. Render Combo Popup Text (Scale + Fade + Float)
    // -------------------------------------------------------------
    const activeCombos = [];
    for (let i = 0; i < combosRef.current.length; i++) {
      const combo = combosRef.current[i];
      combo.age += deltaTime;

      if (combo.age < combo.maxAge) {
        // Float upward
        combo.y -= 50 * deltaTime;

        // Elastic Scale Pop: 0 -> 1.4 -> 1.0
        let scale = 1.0;
        if (combo.age < 0.15) {
          scale = (combo.age / 0.15) * 1.4;
        } else if (combo.age < 0.35) {
          scale = 1.4 - ((combo.age - 0.15) / 0.2) * 0.4;
        }

        // Opacity fadeout over last 0.3s
        let alpha = 1.0;
        if (combo.age > 0.35) {
          alpha = Math.max(0, 1 - (combo.age - 0.35) / (combo.maxAge - 0.35));
        }

        ctx.save();
        ctx.translate(combo.x, combo.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;

        const text = `COMBO x${combo.comboCount}! +${combo.bonusPoints}`;

        ctx.font = '900 28px "Segoe UI Black", "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Drop Glow Shadow
        ctx.shadowColor = 'rgba(255, 159, 67, 0.9)';
        ctx.shadowBlur = 14;

        // Heavy dark outline
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.lineJoin = 'round';
        ctx.strokeText(text, 0, 0);

        // Vibrant Golden-Orange Gradient Fill
        const textGrad = ctx.createLinearGradient(0, -14, 0, 14);
        textGrad.addColorStop(0, '#fff275');
        textGrad.addColorStop(0.45, '#feca57');
        textGrad.addColorStop(1, '#ff4757');

        ctx.fillStyle = textGrad;
        ctx.fillText(text, 0, 0);

        ctx.restore();
        activeCombos.push(combo);
      }
    }
    combosRef.current = activeCombos;

    // -------------------------------------------------------------
    // 11. Dramatic Glowing Blade Trail (Tapered, Glowing Silver-to-White)
    // -------------------------------------------------------------
    if (trail.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pass 1: Outer Glowing Neon Cyan Aura
      ctx.shadowColor = '#00d2d3';
      ctx.shadowBlur = 18;

      for (let i = 1; i < trail.length; i++) {
        const p1 = trail[i - 1];
        const p2 = trail[i];

        const age = now - p2.time;
        const progress = 1 - Math.min(Math.max(age / TRAIL_LIFETIME, 0), 1);
        const smoothProgress = Math.pow(progress, 1.3);

        // Tapered width: thicker in the middle of active swipe
        const midTaper = Math.sin((i / trail.length) * Math.PI);
        const strokeWidth = Math.max(3, smoothProgress * 12 * (0.6 + midTaper * 0.5));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = `rgba(0, 210, 211, ${smoothProgress * 0.75})`;
        ctx.stroke();
      }

      // Pass 2: Blinding White Core Blade Streak
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;

      for (let i = 1; i < trail.length; i++) {
        const p1 = trail[i - 1];
        const p2 = trail[i];

        const age = now - p2.time;
        const progress = 1 - Math.min(Math.max(age / TRAIL_LIFETIME, 0), 1);
        const smoothProgress = Math.pow(progress, 1.5);

        const midTaper = Math.sin((i / trail.length) * Math.PI);
        const coreWidth = Math.max(1.5, smoothProgress * 6 * (0.5 + midTaper * 0.6));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = coreWidth;
        ctx.strokeStyle = `rgba(255, 255, 255, ${smoothProgress * 0.98})`;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Render Sword Cursor
    const pointer = pointerPosRef.current;
    if (pointer.visible && pointer.x >= 0 && pointer.y >= 0 && !isGameOverRef.current) {
      drawSword(ctx, pointer.x, pointer.y, pointerAngleRef.current, isSwipingRef.current);
    }

    // -------------------------------------------------------------
    // 12. Red Screen Flash Overlay (Bomb Hit Effect)
    // -------------------------------------------------------------
    if (screenFlashRef.current > 0) {
      screenFlashRef.current -= deltaTime;
      const flashAlpha = Math.max(0, 0.55 * (screenFlashRef.current / 0.5));

      ctx.save();
      ctx.fillStyle = `rgba(255, 30, 30, ${flashAlpha})`;
      ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
      ctx.restore();
    }

    ctx.restore();
  });

  return (
    <div className="screen game-screen-container">
      {/* Full-screen interactive game canvas */}
      <canvas
        ref={canvasRef}
        className="game-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
      />

      {/* UI Overlay for HUD / Controls */}
      <div className="game-ui-overlay">
        <div className="game-hud">
          {/* Lives Indicator Hearts */}
          <div className="lives-container">
            {[1, 2, 3].map((heartIndex) => (
              <span
                key={heartIndex}
                className={`heart-icon ${heartIndex <= lives ? 'heart-active' : 'heart-lost'}`}
              >
                {heartIndex <= lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>

          {/* Center Exit Button */}
          {onExit && (
            <button
              className="btn-exit"
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
              title="Quit to Main Menu"
            >
              ✕ Exit
            </button>
          )}

          {/* Live Score Display */}
          <div className="score-badge">
            <span className="score-label">SCORE</span>
            <span className="score-number">{score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
