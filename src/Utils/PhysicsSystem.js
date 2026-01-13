// Utils/physicsSystem.js
export class PhysicsSystem {
  constructor() {
    this.velocity = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.friction = 0.92;
    this.inputScale = 0.015;
    this.maxVelocity = 2.0;

    // Auto-scroll properties
    this.autoScrollSpeed = 0.0003;
    this.autoScrollDirection = -1;
    this.userScrollTimeout = null;
    this.isUserScrolling = false;

    // Scroll state tracking
    this.isScrolling = false;
    this.scrollTimeout = null;

    // Tilt tracking based on scroll velocity
    this.scrollVelocityY = 0;
    this.scrollVelocityX = 0;

    // Cylindrical effect properties
    this.cylinderEffect = 0; // 0 = flat, 1 = full cylinder
    this.cylinderEffectDecay = 0.92;
    this.cylinderEffectBoost = 0.9;
  }

  addVelocity(deltaX, deltaY) {
    this.isScrolling = true;
    this.isUserScrolling = true;

    const vX = deltaX * this.inputScale;
    const vY = deltaY * this.inputScale;

    // Track scroll velocity for effects
    this.scrollVelocityX = vX;
    this.scrollVelocityY = vY;

    // Direction mainly from Y
    if (Math.abs(deltaY) > 1) {
      this.autoScrollDirection = deltaY > 0 ? 1 : -1;
    } else if (Math.abs(deltaX) > 1) {
      this.autoScrollDirection = deltaX > 0 ? 1 : -1;
    }

    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
    if (this.userScrollTimeout) clearTimeout(this.userScrollTimeout);

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.scrollVelocityY = 0;
      this.scrollVelocityX = 0;
    }, 150);

    this.userScrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;
    }, 150);

    this.velocity.x += vX;
    this.velocity.y += vY;

    const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);

    if (speed > this.maxVelocity) {
      const scale = this.maxVelocity / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }

    // Boost cylinder effect based on scroll magnitude
    const impulse = Math.min(1, speed * 2.0);
    this.cylinderEffect = Math.min(
      1,
      this.cylinderEffect + impulse * this.cylinderEffectBoost
    );
  }

  update() {
    if (!this.isUserScrolling) {
      this.velocity.y += this.autoScrollSpeed * this.autoScrollDirection;
    }

    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (Math.abs(this.velocity.x) < 0.001) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.001 && this.isUserScrolling) {
      this.velocity.y = 0;
    }

    // Decay cylinder effect back to 0 when not scrolling
    if (!this.isUserScrolling) {
      this.cylinderEffect *= this.cylinderEffectDecay;
      if (this.cylinderEffect < 0.001) this.cylinderEffect = 0;
    }

    return this.position;
  }

  getTiltRotation() {
    const maxTilt = 0.15;

    const tiltX = Math.max(
      -maxTilt,
      Math.min(maxTilt, this.scrollVelocityY * 2)
    );
    const tiltZ = Math.max(
      -maxTilt,
      Math.min(maxTilt, -this.scrollVelocityX * 1.5)
    );

    return { x: tiltX, y: 0, z: tiltZ };
  }

  getCylinderEffect() {
    return this.cylinderEffect;
  }

  getIsScrolling() {
    return this.isScrolling;
  }

  getPosition() {
    return { ...this.position };
  }

  getVelocity() {
    return { ...this.velocity };
  }

  setAutoScrollSpeed(speed) {
    this.autoScrollSpeed = speed;
  }

  getAutoScrollDirection() {
    return this.autoScrollDirection;
  }
}

export class SpringValue {
  constructor(initialValue = 0, stiffness = 0.15, damping = 0.8) {
    this.current = initialValue;
    this.target = initialValue;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  setTarget(value) {
    this.target = value;
  }

  update() {
    const force = (this.target - this.current) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.current += this.velocity;
    return this.current;
  }

  getCurrent() {
    return this.current;
  }
}
