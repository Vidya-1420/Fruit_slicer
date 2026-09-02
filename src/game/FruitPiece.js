/**
 * FruitPiece Class
 *
 * 3D Sliced Fruit Halves:
 * - Uses multi-layered radial gradients for outer skin and inner exposed flesh.
 * - Sliced dragon fruit pieces include green scale tips on the outer rim.
 * - Sliced watermelon pieces include a distinct white rind ring between green peel and red pulp.
 */
export class FruitPiece {
  constructor({
    x,
    y,
    vx,
    vy,
    radius,
    type,
    lightColor,
    baseColor,
    darkColor,
    rindBorder,
    fleshColor,
    fleshLight,
    detailColor,
    side,
    sliceAngle = 0,
  }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;

    // 3D Color Gradients
    this.lightColor = lightColor || '#ff7675';
    this.baseColor = baseColor || '#e74c3c';
    this.darkColor = darkColor || '#8e1212';
    this.rindBorder = rindBorder || '#5c0d0d';
    this.fleshColor = fleshColor || '#fefae0';
    this.fleshLight = fleshLight || '#ffffff';
    this.detailColor = detailColor || '#ffffff';
    this.side = side; // 'left' or 'right'

    // Outward separation impulse
    const splitSpeed = 160 + Math.random() * 80;
    const perpAngle = sliceAngle + (side === 'left' ? -Math.PI / 2 : Math.PI / 2);

    this.vx = vx * 0.5 + Math.cos(perpAngle) * splitSpeed;
    this.vy = vy * 0.6 + Math.sin(perpAngle) * splitSpeed - (40 + Math.random() * 60);

    this.gravity = 800;

    // Tumbling Spin
    this.rotation = sliceAngle;
    this.rotationSpeed = (side === 'left' ? -1 : 1) * (4 + Math.random() * 4);
  }

  /**
   * Update position, velocity, and tumbling rotation
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.vy += this.gravity * deltaTime;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
  }

  /**
   * Draw the 3D-shaded fruit half
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    if (this.side === 'right') {
      ctx.scale(1, -1);
    }

    const r = this.radius;

    // -------------------------------------------------------------
    // 1. Soft Drop Shadow
    // -------------------------------------------------------------
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    // -------------------------------------------------------------
    // 2. Dragon Fruit Outer Green Flame Scales (if dragonfruit)
    // -------------------------------------------------------------
    if (this.type === 'dragonfruit') {
      const scaleAngles = [Math.PI * 0.2, Math.PI * 0.5, Math.PI * 0.8];
      scaleAngles.forEach((angle) => {
        ctx.save();
        const sx = Math.cos(angle) * (r * 0.95);
        const sy = Math.sin(angle) * (r * 0.95);
        ctx.translate(sx, sy);
        ctx.rotate(angle + Math.PI / 2);

        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.quadraticCurveTo(0, -6, 0, -12);
        ctx.quadraticCurveTo(0, -6, 4, 0);
        ctx.closePath();
        ctx.fillStyle = '#2ed573';
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });
    }

    // -------------------------------------------------------------
    // 3. Outer Rind Layer (Radial Gradient)
    // -------------------------------------------------------------
    const rindGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
    rindGrad.addColorStop(0, this.lightColor);
    rindGrad.addColorStop(0.6, this.baseColor);
    rindGrad.addColorStop(1, this.darkColor);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = rindGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = this.rindBorder;
    ctx.stroke();

    // Watermelon White Rind Layer
    if (this.type === 'watermelon') {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, Math.PI, false);
      ctx.closePath();
      ctx.fillStyle = '#f5f6fa';
      ctx.fill();
    }

    // -------------------------------------------------------------
    // 4. Inner Exposed Flesh Layer (Juicy Radial Gradient)
    // -------------------------------------------------------------
    const fleshGrad = ctx.createRadialGradient(0, r * 0.25, 2, 0, r * 0.2, r * 0.82);
    fleshGrad.addColorStop(0, this.fleshLight);
    fleshGrad.addColorStop(0.5, this.fleshColor);
    fleshGrad.addColorStop(1, this.fleshColor);

    ctx.beginPath();
    ctx.arc(0, 0, this.type === 'watermelon' ? r * 0.82 : r * 0.84, 0, Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = fleshGrad;
    ctx.fill();

    // -------------------------------------------------------------
    // 5. Flat Cut Face Moisture Sheen Line
    // -------------------------------------------------------------
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();

    // -------------------------------------------------------------
    // 6. Internal Flesh Details (Seeds, segments, star cores)
    // -------------------------------------------------------------
    this.drawFleshDetails(ctx, r);

    ctx.restore();
  }

  drawFleshDetails(ctx, r) {
    switch (this.type) {
      case 'watermelon': {
        const seedAngles = [Math.PI * 0.22, Math.PI * 0.42, Math.PI * 0.62, Math.PI * 0.82];
        seedAngles.forEach((angle) => {
          const sx = Math.cos(angle) * (r * 0.52);
          const sy = Math.sin(angle) * (r * 0.52);

          ctx.fillStyle = '#1e272e';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(sx - 0.7, sy - 0.7, 0.8, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'orange': {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.8;
        for (let i = 1; i <= 3; i++) {
          const angle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * (r * 0.78), Math.sin(angle) * (r * 0.78));
          ctx.stroke();
        }
        break;
      }

      case 'apple': {
        ctx.fillStyle = '#574b90';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.28, 2.2, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'banana': {
        ctx.fillStyle = '#8395a7';
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.arc(i * 4.5, r * 0.25, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'mango': {
        ctx.strokeStyle = '#e58e26';
        ctx.lineWidth = 1.6;
        for (let i = 1; i <= 3; i++) {
          const a = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, r * 0.2);
          ctx.lineTo(Math.cos(a) * (r * 0.72), Math.sin(a) * (r * 0.72));
          ctx.stroke();
        }

        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(0, r * 0.25, r * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'kiwi': {
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath();
        ctx.ellipse(0, r * 0.22, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#222f3e';
        for (let a = Math.PI * 0.15; a <= Math.PI * 0.85; a += Math.PI * 0.12) {
          const kx = Math.cos(a) * (r * 0.48);
          const ky = Math.sin(a) * (r * 0.48);
          ctx.beginPath();
          ctx.arc(kx, ky, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'dragonfruit': {
        ctx.fillStyle = '#2f3542';
        const dragonSeeds = [
          [-0.3, 0.3], [0.3, 0.3], [0, 0.2],
          [-0.5, 0.5], [0.5, 0.5], [-0.1, 0.6], [0.2, 0.6],
          [-0.4, 0.7], [0.4, 0.7], [0, 0.4]
        ];
        dragonSeeds.forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.arc(dx * r, dy * r, 1.6, 0, Math.PI * 2);
          ctx.fill();
        });
        break;
      }

      case 'strawberry': {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, r * 0.25, r * 0.18, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff7675';
        ctx.lineWidth = 1.5;
        for (let i = 1; i <= 3; i++) {
          const a = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, r * 0.25);
          ctx.lineTo(Math.cos(a) * (r * 0.65), Math.sin(a) * (r * 0.65));
          ctx.stroke();
        }
        break;
      }

      case 'pineapple': {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 4; i++) {
          const a = (i * Math.PI) / 5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * (r * 0.75), Math.sin(a) * (r * 0.75));
          ctx.stroke();
        }
        break;
      }

      default:
        break;
    }
  }
}
