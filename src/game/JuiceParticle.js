/**
 * JuiceParticle Class
 *
 * Chunky, dramatic fruit juice splatters with motion streaks and specular drops:
 * - Emits a mix of chunky splash blobs, high-speed streak droplets, and fine mist.
 * - Fast-moving droplets stretch along their velocity vector, creating authentic motion blur.
 */
export class JuiceParticle {
  constructor(x, y, color, isExplosion = false, explosionType = 'fire') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.isExplosion = isExplosion;
    this.explosionType = explosionType; // 'fire', 'spark', or 'smoke'

    // Burst angle and speed
    const angle = Math.random() * Math.PI * 2;
    const speed = isExplosion
      ? 180 + Math.random() * 380
      : 140 + Math.random() * 320;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.gravity = isExplosion && explosionType === 'smoke' ? -50 : 650;

    // Mixed particle sizes: chunky blobs (6-11px), standard drops (3-5px), or fine mist
    const sizeRoll = Math.random();
    if (isExplosion) {
      this.radius = explosionType === 'smoke' ? 14 + Math.random() * 16 : 4 + Math.random() * 6;
      this.lifetime = explosionType === 'smoke' ? 0.6 + Math.random() * 0.3 : 0.35 + Math.random() * 0.25;
    } else {
      if (sizeRoll > 0.8) {
        this.radius = 7 + Math.random() * 4.5; // Chunky splash blob
        this.isChunky = true;
      } else if (sizeRoll > 0.4) {
        this.radius = 3.5 + Math.random() * 2.5; // Standard drop
        this.isChunky = false;
      } else {
        this.radius = 1.8 + Math.random() * 1.5; // Fine droplet
        this.isChunky = false;
      }
      this.lifetime = 0.4 + Math.random() * 0.28;
    }

    this.age = 0;
    this.isDead = false;
  }

  /**
   * Update particle age, position, and velocity
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.age += deltaTime;
    if (this.age >= this.lifetime) {
      this.isDead = true;
      return;
    }

    this.vy += this.gravity * deltaTime;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Smoke particles expand as they billow outward
    if (this.isExplosion && this.explosionType === 'smoke') {
      this.radius += deltaTime * 20;
    }
  }

  /**
   * Render the chunky droplet / motion streak on canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (this.isDead) return;

    const progress = 1 - this.age / this.lifetime; // 1 -> 0
    const alpha = Math.max(0, progress * (this.explosionType === 'smoke' ? 0.6 : 0.95));

    ctx.save();
    ctx.globalAlpha = alpha;

    if (this.isExplosion && this.explosionType === 'smoke') {
      // Soft expanding smoke puff
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#2d3436';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fill();
    } else {
      // Motion-streaked juice / fire droplet
      const speed = Math.hypot(this.vx, this.vy);
      const moveAngle = Math.atan2(this.vy, this.vx);

      ctx.translate(this.x, this.y);
      ctx.rotate(moveAngle);

      const r = Math.max(1, this.radius * progress);
      // Elongate in motion direction if moving rapidly
      const lengthFactor = speed > 200 ? 1.8 : 1.2;

      ctx.beginPath();
      ctx.ellipse(0, 0, r * lengthFactor, r, 0, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8 * progress;
      ctx.fill();

      // Specular highlight gloss dot on chunky droplets
      if (this.isChunky && progress > 0.4) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(-r * 0.4, -r * 0.3, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
