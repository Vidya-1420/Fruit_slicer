/**
 * Fruit Types Configuration
 *
 * Tailored botanical palettes and dimensions for all fruit entities.
 */
export const FRUIT_TYPES = {
  apple: {
    type: 'apple',
    name: 'Apple',
    radius: 34,
    points: 10,
    lightColor: '#ff7675',
    midColor: '#e74c3c',
    darkColor: '#780c0c',
    blushColor: '#ffeaa7',
    rindBorder: '#4a0808',
    fleshColor: '#fefae0',
    fleshLight: '#ffffff',
    detailColor: '#2ecc71',
  },
  orange: {
    type: 'orange',
    name: 'Orange',
    radius: 36,
    points: 10,
    lightColor: '#ffeaa7',
    midColor: '#ff9f43',
    darkColor: '#c0392b',
    blushColor: '#fed330',
    rindBorder: '#8c2415',
    fleshColor: '#ffa502',
    fleshLight: '#ffbe76',
    detailColor: '#27ae60',
  },
  banana: {
    type: 'banana',
    name: 'Banana',
    radius: 34,
    points: 15,
    lightColor: '#FFFDE7',      // Top lit facet (pale sunlit cream yellow)
    midColor: '#FFEB3B',        // Main body facet (pure ripe banana yellow)
    darkColor: '#F57F17',       // Bottom shaded facet (deep golden amber)
    blushColor: '#7CB342',      // Stem neck green
    rindBorder: '#8D5B00',
    fleshColor: '#FFF9DB',
    fleshLight: '#FFFFFF',
    detailColor: '#2D1810',
  },
  watermelon: {
    type: 'watermelon',
    name: 'Watermelon',
    radius: 46,
    points: 20,
    lightColor: '#1B5E20',      // Sunlit deep green
    midColor: '#0E3E18',        // Deep authentic forest green base
    darkColor: '#051E0A',       // Deep ambient shadow
    blushColor: '#74C69D',      // Light minty marbling green for jagged stripes
    rindBorder: '#031407',
    fleshColor: '#FF4757',
    fleshLight: '#FF6B81',
    detailColor: '#1E272E',
  },
  strawberry: {
    type: 'strawberry',
    name: 'Strawberry',
    radius: 30,
    points: 15,
    lightColor: '#FF7675',
    midColor: '#FF3838',
    darkColor: '#8A0D24',
    blushColor: '#FF9FF3',
    rindBorder: '#5C0818',
    fleshColor: '#FF7675',
    fleshLight: '#FAB1A0',
    detailColor: '#FED330',
  },
  mango: {
    type: 'mango',
    name: 'Mango',
    radius: 38,
    points: 20,
    lightColor: '#FF7675',
    midColor: '#F9CA24',
    darkColor: '#E58E26',
    blushColor: '#78E08F',
    rindBorder: '#B35900',
    fleshColor: '#F9CA24',
    fleshLight: '#FFEAA7',
    detailColor: '#5D4037',
  },
  pineapple: {
    type: 'pineapple',
    name: 'Pineapple',
    radius: 44,
    points: 25,
    lightColor: '#F9CA24',
    midColor: '#E58E26',
    darkColor: '#783800',
    blushColor: '#E55039',
    rindBorder: '#4A2200',
    fleshColor: '#FED330',
    fleshLight: '#FFEAA7',
    detailColor: '#2ECC71',
  },
  kiwi: {
    type: 'kiwi',
    name: 'Kiwi',
    radius: 32,
    points: 15,
    lightColor: '#9C6D57',
    midColor: '#795548',
    darkColor: '#3E2723',
    blushColor: '#6D4C41',
    rindBorder: '#271916',
    fleshColor: '#2ED573',
    fleshLight: '#7BED9F',
    detailColor: '#FFFFFF',
  },
  dragonfruit: {
    type: 'dragonfruit',
    name: 'Dragonfruit',
    radius: 38,
    points: 25,
    lightColor: '#FF4081',
    midColor: '#E91E8C',
    darkColor: '#C2185B',
    blushColor: '#689F38',
    rindBorder: '#880E4F',
    fleshColor: '#F5F6FA',
    fleshLight: '#FFFFFF',
    detailColor: '#1E272E',
  },
};

const FRUIT_KEYS = Object.keys(FRUIT_TYPES);

const STRAWBERRY_SEEDS = [
  [-0.35, -0.3], [0.35, -0.3], [0, -0.5],
  [-0.45, 0.05], [0.45, 0.05], [0, -0.1],
  [-0.25, 0.35], [0.25, 0.35], [0, 0.25],
  [-0.12, 0.55], [0.12, 0.55]
];

const ORANGE_DIMPLE_PORES = [
  [-0.45, -0.2], [-0.15, -0.5], [0.3, -0.4], [0.55, -0.1],
  [-0.55, 0.2], [-0.2, 0.4], [0.25, 0.3], [0.5, 0.4],
  [-0.1, 0.1], [0.15, -0.1], [0.0, -0.3], [-0.35, 0.05]
];

const MANGO_LENTICELS = [
  [-0.4, -0.3], [-0.1, -0.4], [0.3, -0.2], [0.45, 0.1],
  [-0.3, 0.2], [0.1, 0.3], [0.35, 0.4], [-0.1, 0.6]
];

export class Fruit {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 1.0, options = {}) {
    const randomKey = options.type || FRUIT_KEYS[Math.floor(Math.random() * FRUIT_KEYS.length)];
    const config = FRUIT_TYPES[randomKey];

    this.type = config.type;
    this.name = config.name;
    this.radius = config.radius;
    this.points = config.points;
    this.speedMultiplier = speedMultiplier;

    this.lightColor = config.lightColor;
    this.midColor = config.midColor;
    this.darkColor = config.darkColor;
    this.blushColor = config.blushColor;
    this.rindBorder = config.rindBorder;
    this.fleshColor = config.fleshColor;
    this.fleshLight = config.fleshLight;
    this.detailColor = config.detailColor;

    this.baseColor = config.midColor;
    this.rindColor = config.midColor;
    this.color = config.midColor;
    this.secondaryColor = config.rindBorder;

    // -------------------------------------------------------------
    // Precomputed Unique Visual Geometry (Calculated once per fruit)
    // -------------------------------------------------------------
    if (this.type === 'banana') {
      // Natural ripening sugar speckles near tips & body
      this.bananaSpeckles = [
        { u: 0.08, v: -1.5, size: 1.3 },
        { u: 0.12, v: 2.2, size: 1.0 },
        { u: 0.15, v: -0.5, size: 1.4 },
        { u: 0.85, v: 1.5, size: 1.3 },
        { u: 0.89, v: -1.8, size: 1.5 },
        { u: 0.93, v: 0.8, size: 1.1 },
        { u: 0.35, v: 2.5, size: 1.1 },
        { u: 0.65, v: -2.0, size: 1.0 }
      ];
    } else if (this.type === 'watermelon') {
      // 7 highly authentic, branching jagged marbling bands
      const stripeAngles = [-0.75, -0.50, -0.25, 0.0, 0.25, 0.50, 0.75];
      const segments = 12;

      this.watermelonStripes = stripeAngles.map((anglePos) => {
        const pathPoints = [];
        const teeth = [];

        for (let i = 0; i <= segments; i++) {
          const t = i / segments; // 0 = top pole, 1 = bottom pole
          const yNorm = -1 + t * 2; // -1 to +1
          const y = yNorm * this.radius * 0.96;

          // Spherical width expansion (wider at equator, zero at poles)
          const sphereRadius = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
          const baseX = anglePos * this.radius * sphereRadius;

          // Jagged organic displacement
          const jitterX = (Math.random() - 0.5) * 5.5;
          const x = baseX + jitterX;
          const width = (5.5 + Math.sin(t * Math.PI) * 4.5) * (0.8 + Math.random() * 0.4);

          pathPoints.push({ x, y, width });

          // Lateral branching teeth
          if (i > 1 && i < segments - 1 && Math.random() > 0.45) {
            teeth.push({
              x,
              y,
              dir: Math.random() > 0.5 ? 1 : -1,
              length: 4 + Math.random() * 5,
              width: 3 + Math.random() * 2,
            });
          }
        }

        return { pathPoints, teeth };
      });
    } else if (this.type === 'dragonfruit') {
      this.dragonScales = [
        { x: -0.78, y: -0.45, angle: -Math.PI * 0.72, length: 16, width: 9, isOuter: true },
        { x: 0.78, y: -0.45, angle: -Math.PI * 0.28, length: 16, width: 9, isOuter: true },
        { x: -0.85, y: 0.15, angle: -Math.PI * 0.88, length: 18, width: 10, isOuter: true },
        { x: 0.85, y: 0.15, angle: -Math.PI * 0.12, length: 18, width: 10, isOuter: true },
        { x: -0.65, y: 0.70, angle: Math.PI * 0.75, length: 16, width: 9, isOuter: true },
        { x: 0.65, y: 0.70, angle: Math.PI * 0.25, length: 16, width: 9, isOuter: true },
        { x: 0.0, y: -1.05, angle: -Math.PI * 0.5, length: 19, width: 10, isOuter: true },
        { x: 0.0, y: 0.98, angle: Math.PI * 0.5, length: 14, width: 8, isOuter: true },
        { x: -0.32, y: -0.40, angle: -Math.PI * 0.58, length: 15, width: 8.5, isOuter: false },
        { x: 0.32, y: -0.35, angle: -Math.PI * 0.42, length: 15, width: 8.5, isOuter: false },
        { x: -0.35, y: 0.22, angle: -Math.PI * 0.65, length: 16, width: 9, isOuter: false },
        { x: 0.35, y: 0.20, angle: -Math.PI * 0.35, length: 16, width: 9, isOuter: false },
        { x: 0.0, y: -0.05, angle: -Math.PI * 0.5, length: 17, width: 9.5, isOuter: false },
        { x: -0.15, y: 0.55, angle: -Math.PI * 0.55, length: 14, width: 8, isOuter: false }
      ];
    }

    // Position & Physics (Support custom cluster coordinates)
    const margin = this.radius * 2;
    this.x = options.x !== undefined ? options.x : margin + Math.random() * (canvasWidth - margin * 2);
    this.y = options.y !== undefined ? options.y : canvasHeight + this.radius + 10;

    const centerBias = (canvasWidth / 2 - this.x) * 0.4;
    this.vx = options.vx !== undefined ? options.vx : (Math.random() - 0.5) * (120 * speedMultiplier) + centerBias;

    // Scale gravity and upward launch with speedMultiplier for faster reaction window
    this.gravity = 750 * Math.pow(speedMultiplier, 1.25);

    const minLaunch = Math.sqrt(2 * 750 * (canvasHeight * 0.55)) * speedMultiplier;
    const maxLaunch = Math.sqrt(2 * 750 * (canvasHeight * 0.78)) * speedMultiplier;
    this.vy = options.vy !== undefined ? options.vy : -(minLaunch + Math.random() * (maxLaunch - minLaunch));

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * (6 * speedMultiplier);
    this.sliced = false;
  }

  update(deltaTime) {
    this.vy += this.gravity * deltaTime;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const r = this.radius;

    // 1. Soft Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // 2. Body Silhouette & Shading
    this.drawFruitBody(ctx, r);

    ctx.shadowColor = 'transparent';

    // 3. Subtle Contour Outline
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = this.rindBorder;
    this.strokeFruitContour(ctx, r);

    // 4. Detailed Surface Features
    this.drawFruitDetails(ctx, r);

    ctx.restore();
  }

  drawFruitBody(ctx, r) {
    switch (this.type) {
      case 'banana': {
        // Multi-Faceted 3D Shading for Banana
        // Layer 1: Base Body Silhouette with golden-yellow gradient
        const bodyGrad = ctx.createLinearGradient(0, -r * 0.5, 0, r * 0.7);
        bodyGrad.addColorStop(0, this.lightColor); // Pale cream top
        bodyGrad.addColorStop(0.45, this.midColor);  // Pure ripe banana yellow
        bodyGrad.addColorStop(1, this.darkColor);   // Golden amber bottom shadow

        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        // Natural arched banana crescent smile
        ctx.moveTo(r * 1.35, -r * 0.38); // Stem end (right)
        // Outer convex curve (bottom)
        ctx.bezierCurveTo(r * 0.55, r * 0.88, -r * 0.55, r * 0.88, -r * 1.35, -r * 0.12); // Blossom end (left)
        ctx.quadraticCurveTo(-r * 1.45, -r * 0.02, -r * 1.35, 0.05);
        // Inner concave curve (top)
        ctx.bezierCurveTo(-r * 0.5, r * 0.38, r * 0.5, r * 0.38, r * 1.25, -r * 0.20);
        ctx.quadraticCurveTo(r * 1.42, -r * 0.30, r * 1.35, -r * 0.38);
        ctx.closePath();
        ctx.fill();

        // Layer 2: Distinct Upper Lit Ridge Facet
        ctx.fillStyle = 'rgba(255, 253, 231, 0.45)';
        ctx.beginPath();
        ctx.moveTo(r * 1.25, -r * 0.22);
        ctx.bezierCurveTo(r * 0.5, r * 0.38, -r * 0.5, r * 0.38, -r * 1.35, -r * 0.12);
        ctx.bezierCurveTo(-r * 0.5, r * 0.52, r * 0.5, r * 0.52, r * 1.25, -r * 0.22);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'watermelon': {
        // Deep authentic forest green base with rich spherical 3D shading
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.08, 0, 0, r * 1.02);
        grad.addColorStop(0, this.lightColor); // #1B5E20 (rich green highlight)
        grad.addColorStop(0.55, this.midColor); // #0E3E18 (deep forest base)
        grad.addColorStop(1, this.darkColor);  // #051E0A (dark shadow)

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'dragonfruit': {
        if (this.dragonScales) {
          this.dragonScales.filter(s => s.isOuter).forEach((scale) => {
            this.drawSingleDragonScale(ctx, scale.x * r, scale.y * r, scale.angle, scale.length, scale.width);
          });
        }

        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, r * 0.1, r * 1.15);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.5, this.midColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.08);
        ctx.bezierCurveTo(r * 0.65, -r * 1.02, r * 0.92, r * 0.15, r * 0.82, r * 0.72);
        ctx.bezierCurveTo(r * 0.72, r * 1.12, -r * 0.72, r * 1.12, -r * 0.82, r * 0.72);
        ctx.bezierCurveTo(-r * 0.92, r * 0.15, -r * 0.65, -r * 1.02, 0, -r * 1.08);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'apple': {
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.05);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.45, this.midColor);
        grad.addColorStop(0.8, this.blushColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.78);
        ctx.bezierCurveTo(-r * 0.55, -r * 1.08, -r * 1.05, -r * 0.45, -r * 0.95, r * 0.25);
        ctx.bezierCurveTo(-r * 0.85, r * 0.82, -r * 0.38, r * 1.02, -r * 0.12, r * 0.94);
        ctx.bezierCurveTo(0, r * 0.86, 0, r * 0.86, r * 0.12, r * 0.94);
        ctx.bezierCurveTo(r * 0.38, r * 1.02, r * 0.85, r * 0.82, r * 0.95, r * 0.25);
        ctx.bezierCurveTo(r * 1.05, -r * 0.45, r * 0.55, -r * 1.08, 0, -r * 0.78);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'strawberry': {
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.08, 0, 0, r * 0.95);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.5, this.midColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.9);
        ctx.bezierCurveTo(r * 0.95, -r * 0.9, r * 0.9, r * 0.2, 0, r);
        ctx.bezierCurveTo(-r * 0.9, r * 0.2, -r * 0.95, -r * 0.9, 0, -r * 0.9);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'mango': {
        const grad = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.5, this.midColor);
        grad.addColorStop(0.85, this.blushColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.88);
        ctx.bezierCurveTo(r * 0.72, -r * 0.88, r * 0.98, -r * 0.15, r * 0.78, r * 0.52);
        ctx.bezierCurveTo(r * 0.58, r * 0.96, r * 0.15, r * 1.06, -r * 0.22, r * 0.88);
        ctx.bezierCurveTo(-r * 0.86, r * 0.48, -r * 0.98, -r * 0.25, -r * 0.42, -r * 0.88);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'pineapple': {
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 1.05);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.6, this.midColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.82, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'kiwi': {
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r * 0.95);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.55, this.midColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.88, r * 0.96, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default: {
        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
        grad.addColorStop(0, this.lightColor);
        grad.addColorStop(0.55, this.midColor);
        grad.addColorStop(1, this.darkColor);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }

  drawSingleDragonScale(ctx, x, y, angle, length, width) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.bezierCurveTo(-width * 0.4, -length * 0.5, -2, -length * 0.85, 0, -length);
    ctx.bezierCurveTo(2, -length * 0.85, width * 0.4, -length * 0.5, width / 2, 0);
    ctx.closePath();

    const scaleGrad = ctx.createLinearGradient(0, 0, 0, -length);
    scaleGrad.addColorStop(0, '#E91E8C');
    scaleGrad.addColorStop(0.35, '#689F38');
    scaleGrad.addColorStop(0.75, '#4CAF50');
    scaleGrad.addColorStop(1, '#8BC34A');

    ctx.fillStyle = scaleGrad;
    ctx.fill();

    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  strokeFruitContour(ctx, r) {
    switch (this.type) {
      case 'banana':
        ctx.beginPath();
        ctx.moveTo(r * 1.35, -r * 0.38);
        ctx.bezierCurveTo(r * 0.55, r * 0.88, -r * 0.55, r * 0.88, -r * 1.35, -r * 0.12);
        ctx.quadraticCurveTo(-r * 1.45, -r * 0.02, -r * 1.35, 0.05);
        ctx.bezierCurveTo(-r * 0.5, r * 0.38, r * 0.5, r * 0.38, r * 1.25, -r * 0.20);
        ctx.quadraticCurveTo(r * 1.42, -r * 0.30, r * 1.35, -r * 0.38);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'dragonfruit':
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.08);
        ctx.bezierCurveTo(r * 0.65, -r * 1.02, r * 0.92, r * 0.15, r * 0.82, r * 0.72);
        ctx.bezierCurveTo(r * 0.72, r * 1.12, -r * 0.72, r * 1.12, -r * 0.82, r * 0.72);
        ctx.bezierCurveTo(-r * 0.92, r * 0.15, -r * 0.65, -r * 1.02, 0, -r * 1.08);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'apple':
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.78);
        ctx.bezierCurveTo(-r * 0.55, -r * 1.08, -r * 1.05, -r * 0.45, -r * 0.95, r * 0.25);
        ctx.bezierCurveTo(-r * 0.85, r * 0.82, -r * 0.38, r * 1.02, -r * 0.12, r * 0.94);
        ctx.bezierCurveTo(0, r * 0.86, 0, r * 0.86, r * 0.12, r * 0.94);
        ctx.bezierCurveTo(r * 0.38, r * 1.02, r * 0.85, r * 0.82, r * 0.95, r * 0.25);
        ctx.bezierCurveTo(r * 1.05, -r * 0.45, r * 0.55, -r * 1.08, 0, -r * 0.78);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'strawberry':
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.9);
        ctx.bezierCurveTo(r * 0.95, -r * 0.9, r * 0.9, r * 0.2, 0, r);
        ctx.bezierCurveTo(-r * 0.9, r * 0.2, -r * 0.95, -r * 0.9, 0, -r * 0.9);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'mango':
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.88);
        ctx.bezierCurveTo(r * 0.72, -r * 0.88, r * 0.98, -r * 0.15, r * 0.78, r * 0.52);
        ctx.bezierCurveTo(r * 0.58, r * 0.96, r * 0.15, r * 1.06, -r * 0.22, r * 0.88);
        ctx.bezierCurveTo(-r * 0.86, r * 0.48, -r * 0.98, -r * 0.25, -r * 0.42, -r * 0.88);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'pineapple':
      case 'kiwi':
        ctx.beginPath();
        ctx.ellipse(0, 0, r * (this.type === 'pineapple' ? 0.82 : 0.88), r * (this.type === 'pineapple' ? 0.95 : 0.96), 0, 0, Math.PI * 2);
        ctx.stroke();
        break;

      default:
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  }

  drawFruitDetails(ctx, r) {
    switch (this.type) {
      case 'banana': {
        // 1. Stem stalk at right (green neck -> dark brown cut end)
        ctx.fillStyle = this.blushColor; // #7CB342 (fresh green stem transition)
        ctx.beginPath();
        ctx.moveTo(r * 1.25, -r * 0.20);
        ctx.lineTo(r * 1.48, -r * 0.42);
        ctx.lineTo(r * 1.38, -r * 0.52);
        ctx.lineTo(r * 1.18, -r * 0.28);
        ctx.closePath();
        ctx.fill();

        // Dark woody cut end on stem
        ctx.fillStyle = '#2D1810';
        ctx.beginPath();
        ctx.ellipse(r * 1.43, -r * 0.47, 2.5, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // 2. Blossom end tip at left (tapered dark pinch)
        ctx.fillStyle = '#1A0C08';
        ctx.beginPath();
        ctx.moveTo(-r * 1.30, -r * 0.10);
        ctx.lineTo(-r * 1.46, -r * 0.02);
        ctx.lineTo(-r * 1.32, 0.08);
        ctx.closePath();
        ctx.fill();

        // 3. 3 Longitudinal Facet Ridge Lines
        // Top facet line (creamy light)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(r * 1.22, -r * 0.22);
        ctx.bezierCurveTo(r * 0.48, r * 0.46, -r * 0.48, r * 0.46, -r * 1.24, -r * 0.08);
        ctx.stroke();

        // Center spine line (golden amber shadow)
        ctx.strokeStyle = 'rgba(180, 110, 0, 0.38)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(r * 1.25, -r * 0.28);
        ctx.bezierCurveTo(r * 0.52, r * 0.62, -r * 0.52, r * 0.62, -r * 1.26, -r * 0.10);
        ctx.stroke();

        // Lower facet line
        ctx.strokeStyle = 'rgba(195, 120, 0, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r * 1.28, -r * 0.32);
        ctx.bezierCurveTo(r * 0.54, r * 0.74, -r * 0.54, r * 0.74, -r * 1.28, -r * 0.12);
        ctx.stroke();

        // 4. Fixed sugar speckles near tips & sparse body
        if (this.bananaSpeckles) {
          ctx.fillStyle = 'rgba(62, 39, 35, 0.75)';
          this.bananaSpeckles.forEach((spot) => {
            const u = spot.u;
            const x = (1 - u) * (r * 1.25) + u * (-r * 1.25);
            const y = Math.sin(u * Math.PI) * (r * 0.58) - (r * 0.18) + spot.v;
            ctx.beginPath();
            ctx.arc(x, y, spot.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        break;
      }

      case 'watermelon': {
        // 1. 7 Highly authentic, branching jagged marbling bands
        if (this.watermelonStripes) {
          this.watermelonStripes.forEach((st) => {
            ctx.save();

            // Main marbling stripe body
            ctx.fillStyle = this.blushColor; // #74C69D (light minty marbling green)
            ctx.strokeStyle = this.blushColor;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Draw central jagged stripe polygon
            ctx.beginPath();
            const pts = st.pathPoints;
            for (let i = 0; i < pts.length; i++) {
              const p = pts[i];
              if (i === 0) ctx.moveTo(p.x - p.width / 2, p.y);
              else ctx.lineTo(p.x - p.width / 2, p.y);
            }
            for (let i = pts.length - 1; i >= 0; i--) {
              const p = pts[i];
              ctx.lineTo(p.x + p.width / 2, p.y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw lateral branching teeth
            if (st.teeth) {
              st.teeth.forEach((t) => {
                ctx.beginPath();
                ctx.moveTo(t.x, t.y - t.width / 2);
                ctx.lineTo(t.x + t.dir * t.length, t.y);
                ctx.lineTo(t.x, t.y + t.width / 2);
                ctx.closePath();
                ctx.fill();
              });
            }

            // Inner light green spine for depth
            ctx.strokeStyle = '#B7E4C7';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.stroke();

            ctx.restore();
          });
        }

        // 2. Pale Yellow-Cream Ground Patch (where melon rested in field)
        ctx.fillStyle = 'rgba(255, 238, 140, 0.18)';
        ctx.beginPath();
        ctx.ellipse(r * 0.45, r * 0.45, r * 0.35, r * 0.22, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Top Stem Point Button
        ctx.fillStyle = '#2D1810';
        ctx.beginPath();
        ctx.arc(0, -r * 0.94, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // 4. Soft Light Highlight (Glossy spherical reflection)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.38, -r * 0.38, r * 0.28, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-r * 0.42, -r * 0.42, r * 0.35, Math.PI * 0.85, Math.PI * 1.35);
        ctx.stroke();
        break;
      }

      case 'dragonfruit': {
        if (this.dragonScales) {
          this.dragonScales.filter(s => !s.isOuter).forEach((scale) => {
            this.drawSingleDragonScale(ctx, scale.x * r, scale.y * r, scale.angle, scale.length, scale.width);
          });
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.32, -r * 0.45, r * 0.24, r * 0.36, -Math.PI / 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.45, r * 0.28, Math.PI * 0.85, Math.PI * 1.35);
        ctx.stroke();
        break;
      }

      case 'apple': {
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.75);
        ctx.quadraticCurveTo(6, -r * 1.08, 9, -r * 1.25);
        ctx.stroke();

        ctx.fillStyle = this.detailColor;
        ctx.beginPath();
        ctx.ellipse(8, -r * 0.92, 5.5, 11, Math.PI / 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-r * 0.42, -r * 0.38, r * 0.32, Math.PI * 0.85, Math.PI * 1.4);
        ctx.stroke();
        break;
      }

      case 'orange': {
        ORANGE_DIMPLE_PORES.forEach(([ox, oy]) => {
          ctx.fillStyle = 'rgba(140, 36, 21, 0.55)';
          ctx.beginPath();
          ctx.arc(ox * r, oy * r, 1.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 234, 167, 0.45)';
          ctx.beginPath();
          ctx.arc(ox * r + 0.6, oy * r + 0.6, 0.9, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = this.detailColor;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 2 * Math.PI) / 5;
          const px = Math.cos(a) * 4.5;
          const py = -r * 0.88 + Math.sin(a) * 4.5;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'strawberry': {
        STRAWBERRY_SEEDS.forEach(([sx, sy]) => {
          ctx.fillStyle = 'rgba(92, 8, 24, 0.75)';
          ctx.beginPath();
          ctx.arc(sx * r, sy * r + 1, 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = this.detailColor;
          ctx.beginPath();
          ctx.ellipse(sx * r, sy * r, 1.3, 2.1, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#2ed573';
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.85);
        ctx.lineTo(-r * 0.35, -r * 1.15); ctx.lineTo(-r * 0.15, -r * 0.85);
        ctx.lineTo(0, -r * 1.25); ctx.lineTo(r * 0.15, -r * 0.85);
        ctx.lineTo(r * 0.35, -r * 1.15); ctx.lineTo(0, -r * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-r * 0.32, -r * 0.35, r * 0.25, Math.PI * 0.9, Math.PI * 1.35);
        ctx.stroke();
        break;
      }

      case 'mango': {
        MANGO_LENTICELS.forEach(([mx, my]) => {
          ctx.fillStyle = 'rgba(179, 89, 0, 0.45)';
          ctx.beginPath();
          ctx.arc(mx * r, my * r, 1.4, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = this.detailColor;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.84, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-r * 0.38, -r * 0.35, r * 0.32, Math.PI * 0.85, Math.PI * 1.4);
        ctx.stroke();
        break;
      }

      case 'pineapple': {
        ctx.strokeStyle = 'rgba(74, 34, 0, 0.55)';
        ctx.lineWidth = 2.2;
        const bw = r * 0.75;
        const bh = r * 0.9;

        for (let i = -2; i <= 2; i++) {
          const shift = i * (bw * 0.38);
          ctx.beginPath();
          ctx.moveTo(-bw + shift, -bh);
          ctx.lineTo(bw + shift, bh);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(bw + shift, -bh);
          ctx.lineTo(-bw + shift, bh);
          ctx.stroke();
        }

        ctx.fillStyle = '#f9ca24';
        for (let ix = -1; ix <= 1; ix++) {
          for (let iy = -1; iy <= 1; iy++) {
            const px = ix * (bw * 0.38);
            const py = iy * (bh * 0.38);
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#783800';
            ctx.beginPath();
            ctx.arc(px, py + 1.8, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.fillStyle = '#2ecc71';
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.25, -r * 0.85);
        ctx.lineTo(-r * 0.48, -r * 1.38); ctx.lineTo(-r * 0.18, -r * 0.95);
        ctx.lineTo(0, -r * 1.55); ctx.lineTo(r * 0.18, -r * 0.95);
        ctx.lineTo(r * 0.48, -r * 1.38); ctx.lineTo(r * 0.25, -r * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'kiwi': {
        ctx.strokeStyle = 'rgba(39, 25, 22, 0.7)';
        ctx.lineWidth = 1.6;
        for (let i = 0; i < 12; i++) {
          const a = (i * Math.PI) / 6;
          const kx = Math.cos(a) * (r * 0.88);
          const ky = Math.sin(a) * (r * 0.96);
          ctx.beginPath();
          ctx.moveTo(kx, ky);
          ctx.lineTo(kx * 1.08, ky * 1.08);
          ctx.stroke();
        }

        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(0, -r * 0.92, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(156, 109, 87, 0.6)';
        ctx.beginPath();
        ctx.arc(0, -r * 0.92, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.32, Math.PI * 0.8, Math.PI * 1.35);
        ctx.stroke();
        break;
      }

      default:
        break;
    }
  }
}
