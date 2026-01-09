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

    // NEW: orbit state for 3D circular motion
    this.orbitPhase = 0;
    this.orbitEnergy = 0; // 0..1
    this.orbitEnergyDecay = 0.9; // decay per update() call
    this.orbitSpeed = 0.35; // phase advance multiplier
    this.orbitAmp = { x: 0.45, y: 0.22, z: 0.55 }; // world units
  }

  addVelocity(deltaX, deltaY) {
    this.isScrolling = true;
    this.isUserScrolling = true;

    const vX = deltaX * this.inputScale;
    const vY = deltaY * this.inputScale;

    // Track scroll velocity for effects
    this.scrollVelocityX = vX;
    this.scrollVelocityY = vY;

    // Direction mainly from Y, but if trackpad horizontal is strong, let it steer too
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

    // NEW: inject orbit energy from the scroll impulse magnitude
    const impulse = Math.min(1, speed * 2.5);
    this.orbitEnergy = Math.min(1, this.orbitEnergy + impulse * 0.55);
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

    // NEW: decay and phase advance for orbit
    this.orbitEnergy *= this.orbitEnergyDecay;

    // Use both velocities to influence phase speed (all-direction feel)
    const vMag = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
    const dir = this.autoScrollDirection;

    // advance phase even when auto-scrolling (subtle motion), but stronger when user scrolls
    const base = 0.08;
    const boost = vMag * 0.35 + this.orbitEnergy * 0.65;
    this.orbitPhase += dir * this.orbitSpeed * (base + boost);

    return this.position;
  }

  getTiltRotation() {
    // Clamp tilt based on scroll velocity (radians)
    const maxTilt = 0.15;

    // Use both axes: vertical scroll tilts X, horizontal scroll tilts Z slightly
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

  // NEW: Shared orbital offset (x/y/z) derived from phase + energy
  getOrbitOffset() {
    const e = this.orbitEnergy;

    // Circle on X/Z, slight bob on Y
    const x = Math.sin(this.orbitPhase) * this.orbitAmp.x * e;
    const z = Math.cos(this.orbitPhase) * this.orbitAmp.z * e;
    const y = Math.sin(this.orbitPhase * 1.35) * this.orbitAmp.y * e;

    return { x, y, z, energy: e, phase: this.orbitPhase };
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
