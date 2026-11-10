/**
 * Parallax Tilt & Centrifugal Sway System
 * Handles deviceorientation (gamma/beta), devicemotion (shake/centrifugal impulses),
 * and desktop mouse/touch fallback with silky smooth spring lerp damping.
 */

export interface TiltState {
  tiltX: number; // Normalized -1 to 1 (left to right)
  tiltY: number; // Normalized -1 to 1 (top to bottom)
  centrifugalX: number; // Centrifugal sway offset in pixels
  centrifugalY: number; // Centrifugal sway offset in pixels
  shakeStrength: number; // 0 to 1 strength indicator
  isDeviceMotionActive: boolean;
}

/**
 * Normalizes device orientation angles (gamma: -90..90, beta: -180..180) to [-1, 1] range.
 */
export function normalizeOrientationAngles(gamma: number | null, beta: number | null): { x: number; y: number } {
  const g = gamma ?? 0;
  const b = beta ?? 0;

  // Clamped gamma (roll) - normal holding angle is roughly -45 to 45 deg
  const clampedGamma = Math.max(-45, Math.min(45, g));
  const normX = clampedGamma / 45;

  // Beta (pitch) - portrait holding angle typically around 40..60 deg upright
  // We offset by 45 deg so holding upright equals 0 center tilt
  const offsetBeta = b - 45;
  const clampedBeta = Math.max(-45, Math.min(45, offsetBeta));
  const normY = clampedBeta / 45;

  return {
    x: Math.max(-1, Math.min(1, normX)),
    y: Math.max(-1, Math.min(1, normY)),
  };
}

/**
 * Calculates shake magnitude from 3D acceleration vectors.
 */
export function calculateShakeMagnitude(
  accelX: number | null,
  accelY: number | null,
  accelZ: number | null,
  gravityThreshold: number = 18.0
): number {
  const x = accelX ?? 0;
  const y = accelY ?? 0;
  const z = accelZ ?? 0;
  const total = Math.sqrt(x * x + y * y + z * z);
  if (total > gravityThreshold) {
    return Math.min(1.0, (total - gravityThreshold) / 20.0);
  }
  return 0;
}

/**
 * Smooth exponential damping lerp.
 */
export function lerpTilt(current: number, target: number, speed: number = 0.12): number {
  return current + (target - current) * speed;
}

type TiltSubscriber = (state: TiltState) => void;

class ParallaxTiltManager {
  private targetX: number = 0;
  private targetY: number = 0;
  private smoothX: number = 0;
  private smoothY: number = 0;

  private centrifugalX: number = 0;
  private centrifugalY: number = 0;
  private shakeStrength: number = 0;
  private shakeOscillation: number = 0;

  private isDeviceMotionActive: boolean = false;
  private isListening: boolean = false;
  private animFrameId: number | null = null;
  private subscribers: Set<TiltSubscriber> = new Set();

  private handleOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma !== null || e.beta !== null) {
      this.isDeviceMotionActive = true;
      const { x, y } = normalizeOrientationAngles(e.gamma, e.beta);
      this.targetX = x;
      this.targetY = y;
    }
  };

  private handleMotion = (e: DeviceMotionEvent) => {
    const accel = e.accelerationIncludingGravity;
    if (accel) {
      const mag = calculateShakeMagnitude(accel.x, accel.y, accel.z);
      if (mag > 0.15) {
        this.shakeStrength = Math.min(1.0, this.shakeStrength + mag * 0.7);
        // Centrifugal impulse kick in direction of shake with safe clamping
        const kickX = ((accel.x ?? 0) / 10) * 12;
        const kickY = ((accel.y ?? 0) / 10) * 12;
        this.centrifugalX = Math.max(-28, Math.min(28, this.centrifugalX + kickX));
        this.centrifugalY = Math.max(-24, Math.min(24, this.centrifugalY + kickY));
      }
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    // If device orientation is not active (e.g. desktop PC), provide smooth mouse parallax
    if (!this.isDeviceMotionActive) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const normX = (e.clientX - centerX) / (centerX || 1);
      const normY = (e.clientY - centerY) / (centerY || 1);
      this.targetX = Math.max(-1, Math.min(1, normX));
      this.targetY = Math.max(-1, Math.min(1, normY));
    }
  };

  public init() {
    if (typeof window === 'undefined' || this.isListening) return;
    this.isListening = true;

    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    window.addEventListener('devicemotion', this.handleMotion, { passive: true });
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });

    this.startLoop();
  }

  public async requestMotionPermission(): Promise<boolean> {
    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }).requestPermission === 'function'
    ) {
      try {
        const resp = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<'granted' | 'denied'> }).requestPermission();
        return resp === 'granted';
      } catch {
        return false;
      }
    }
    return true;
  }

  private startLoop() {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth lerp for main tilt
      this.smoothX = lerpTilt(this.smoothX, this.targetX, 0.12);
      this.smoothY = lerpTilt(this.smoothY, this.targetY, 0.12);

      // Centrifugal shake decay & spring oscillation
      if (this.shakeStrength > 0.005) {
        this.shakeOscillation += dt * 18;
        this.shakeStrength = Math.max(0, this.shakeStrength - dt * 2.2);
        const wave = Math.sin(this.shakeOscillation) * this.shakeStrength * 14;
        this.centrifugalX = lerpTilt(this.centrifugalX, wave * (this.smoothX || 1), 0.18);
        this.centrifugalY = lerpTilt(this.centrifugalY, wave * (this.smoothY || 0.8), 0.18);
      } else {
        this.centrifugalX = lerpTilt(this.centrifugalX, 0, 0.15);
        this.centrifugalY = lerpTilt(this.centrifugalY, 0, 0.15);
        this.shakeStrength = 0;
      }

      // Notify subscribers
      if (this.subscribers.size > 0) {
        const state = this.getState();
        for (const sub of this.subscribers) {
          sub(state);
        }
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public update(dt: number = 0.016) {
    this.smoothX = lerpTilt(this.smoothX, this.targetX, 0.12);
    this.smoothY = lerpTilt(this.smoothY, this.targetY, 0.12);
    if (this.shakeStrength > 0.005) {
      this.shakeOscillation += dt * 18;
      this.shakeStrength = Math.max(0, this.shakeStrength - dt * 2.2);
      const wave = Math.sin(this.shakeOscillation) * this.shakeStrength * 14;
      this.centrifugalX = lerpTilt(this.centrifugalX, wave * (this.smoothX || 1), 0.18);
      this.centrifugalY = lerpTilt(this.centrifugalY, wave * (this.smoothY || 0.8), 0.18);
    } else {
      this.centrifugalX = lerpTilt(this.centrifugalX, 0, 0.15);
      this.centrifugalY = lerpTilt(this.centrifugalY, 0, 0.15);
      this.shakeStrength = 0;
    }
  }

  public getState(): TiltState {
    return {
      tiltX: Math.round(this.smoothX * 1000) / 1000,
      tiltY: Math.round(this.smoothY * 1000) / 1000,
      centrifugalX: Math.round(this.centrifugalX * 10) / 10,
      centrifugalY: Math.round(this.centrifugalY * 10) / 10,
      shakeStrength: Math.round(this.shakeStrength * 100) / 100,
      isDeviceMotionActive: this.isDeviceMotionActive,
    };
  }

  public subscribe(cb: TiltSubscriber): () => void {
    this.subscribers.add(cb);
    this.init();
    cb(this.getState());
    return () => {
      this.subscribers.delete(cb);
    };
  }

  // Programmatic shake trigger (for testing, button tap, or game hit impacts)
  public triggerCentrifugalKick(intensity: number = 0.8, directionX: number = 1, directionY: number = 0.5) {
    this.shakeStrength = Math.min(1.0, this.shakeStrength + intensity);
    this.centrifugalX = Math.max(-28, Math.min(28, this.centrifugalX + directionX * intensity * 15));
    this.centrifugalY = Math.max(-24, Math.min(24, this.centrifugalY + directionY * intensity * 12));
  }

  public destroy() {
    this.isListening = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', this.handleOrientation);
      window.removeEventListener('devicemotion', this.handleMotion);
      window.removeEventListener('mousemove', this.handleMouseMove);
    }
    this.subscribers.clear();
  }
}

export const parallaxTiltManager = new ParallaxTiltManager();
