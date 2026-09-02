/**
 * Bomb Class
 *
 * Why bombs use the same physics system as fruit but branch into different logic on collision:
 * 1. Shared Physics: Both fruits and bombs are airborne arcade projectiles. Reusing the same launch
 *    velocity (vy < 0), horizontal drift (vx), and downward gravity acceleration ensures bombs move
 *    at identical speeds and trajectories, making them blend naturally into the fruit barrage.
 * 2. Divergent Collision Logic: While fruits reward the player by splitting into halves and granting
 *    points upon contact, bombs represent lethal hazards. Therefore, when the slice trail intersects
 *    a bomb, instead of running cut/splitting physics, it triggers a catastrophic screen flash/explosion
 *    and instant game over penalty.
 */
export class Bomb {
  constructor(canvasWidth, canvasHeight, speedMultiplier = 1.0) {
    this.type = 'bomb';
    this.name = 'Bomb';
    this.radius = 30;
    this.speedMultiplier = speedMultiplier;

    // Position: Spawn near the bottom of the canvas
    const margin = this.radius * 2;
    this.x = margin + Math.random() * (canvasWidth - margin * 2);
    this.y = canvasHeight + this.radius + 10;

    // Horizontal drift towards center
    const centerBias = (canvasWidth / 2 - this.x) * 0.4;
    this.vx = (Math.random() - 0.5) * (100 * speedMultiplier) + centerBias;

    // Scale gravity and upward launch with speedMultiplier
    this.gravity = 750 * Math.pow(speedMultiplier, 1.25);

    const minLaunch = Math.sqrt(2 * 750 * (canvasHeight * 0.55)) * speedMultiplier;
    const maxLaunch = Math.sqrt(2 * 750 * (canvasHeight * 0.75)) * speedMultiplier;
    this.vy = -(minLaunch + Math.random() * (maxLaunch - minLaunch));

    // Rotation
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * (4 * speedMultiplier);

    // Spark animation timer for lit fuse
    this.sparkTimer = 0;
    this.exploded = false;
  }

  /**
   * Update bomb position, velocity, and rotation
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.vy += this.gravity * deltaTime;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.rotation += this.rotationSpeed * deltaTime;
    this.sparkTimer += deltaTime * 12;
  }

  /**
   * Render the bomb with dark metallic body, cap, curved fuse, and glowing spark
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 1. Outer glow / shadow
    ctx.shadowColor = 'rgba(231, 76, 60, 0.4)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 4;

    // 2. Dark metallic bomb sphere body
    const gradient = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 2, 0, 0, this.radius);
    gradient.addColorStop(0, '#485460');
    gradient.addColorStop(0.5, '#1e272e');
    gradient.addColorStop(1, '#0f1418');

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Dark border outline
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1e272e';
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // 3. Metallic fuse cap
    ctx.fillStyle = '#718093';
    ctx.fillRect(-6, -this.radius - 5, 12, 6);
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 1;
    ctx.strokeRect(-6, -this.radius - 5, 12, 6);

    // 4. Curved rope fuse
    ctx.beginPath();
    ctx.moveTo(0, -this.radius - 5);
    ctx.quadraticCurveTo(8, -this.radius - 16, 4, -this.radius - 22);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d2dae2';
    ctx.stroke();

    // 5. Warning Hazard Emblem ('X' or Skull mark in the center)
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    const xSize = this.radius * 0.35;
    ctx.beginPath();
    ctx.moveTo(-xSize, -xSize);
    ctx.lineTo(xSize, xSize);
    ctx.moveTo(xSize, -xSize);
    ctx.lineTo(-xSize, xSize);
    ctx.stroke();

    // 6. Animated Lit Spark at fuse tip
    const sparkX = 4;
    const sparkY = -this.radius - 22;
    const sparkRadius = 3 + Math.sin(this.sparkTimer) * 1.5;

    // Spark glowing aura
    ctx.shadowColor = '#ffa502';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkRadius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffa502';
    ctx.fill();

    // Spark star rays
    ctx.strokeStyle = '#fed330';
    ctx.lineWidth = 1.5;
    const rayLength = 6 + Math.sin(this.sparkTimer * 2) * 3;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + this.sparkTimer;
      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY);
      ctx.lineTo(sparkX + Math.cos(angle) * rayLength, sparkY + Math.sin(angle) * rayLength);
      ctx.stroke();
    }

    ctx.restore();
  }
}
