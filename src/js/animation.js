import { getActiveDetails } from './storage.js';
import { targetCountdownDateStr } from '../config/constants.js';

/**
 * Setup Intersection Observer for cinematic scroll-triggered animations.
 */
export function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.12
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });
}

/**
 * Live Countdown Clock towards the dynamic wedding date.
 */
export function setupCountdownTimer() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minsEl = document.getElementById("minutes");
  const secsEl = document.getElementById("seconds");

  function updateClock() {
    const countdownDate = new Date(targetCountdownDateStr).getTime();
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(Math.max(0, days)).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(Math.max(0, hours)).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(Math.max(0, minutes)).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(Math.max(0, seconds)).padStart(2, '0');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Elegant Falling Particles Canvas.
 * Automatically adapts particle sways, wind direction, shapes, and colors
 * dynamically depending on the selected template.
 */
export function setupAmbientCanvas() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let particles = [];
  const maxParticles = 30;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    reset() {
      const details = getActiveDetails();
      this.template = details.template || "garden";
      
      this.x = Math.random() * canvas.width;
      this.y = -20;
      
      if (this.template === "royal") {
        // Star Shimmers (Sparkles)
        this.size = Math.random() * 3 + 1.5;
        this.speedY = Math.random() * 0.4 + 0.15; // float slow
        this.speedX = Math.random() * 0.2 - 0.1;
        this.opacity = Math.random() * 0.2 + 0.1; // Reduced opacity range for subtle background elegance
        this.opacitySpeed = Math.random() * 0.01 + 0.005;
        this.isRoyalSparkle = true;
      } 
      else if (this.template === "islamic") {
        // Muted Sage leaf points
        this.size = Math.random() * 3 + 2;
        this.speedY = Math.random() * 0.2 + 0.1; // Slow down fall speed for calm movement
        this.speedX = Math.random() * 0.1 - 0.05; // Minimal sideways drift
        this.opacity = Math.random() * 0.4 + 0.2;
        this.isSageLeaf = Math.random() > 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.006 - 0.003;
        this.isRoyalSparkle = false;
      } 
      else {
        // Garden Romance soft rose & gold petals
        this.size = Math.random() * 7 + 4;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.speedX = Math.random() * 0.4 + 0.1; // soft wind drift
        this.opacity = Math.random() * 0.5 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = Math.random() * 0.02 - 0.01;
        this.isPinkPetal = Math.random() > 0.4;
        this.isRoyalSparkle = false;
      }
    }

    update() {
      const details = getActiveDetails();
      const currentTemplate = details.template || "garden";

      // If template shifted on fly, re-init elements
      if (currentTemplate !== this.template) {
        this.reset();
      }

      this.y += this.speedY;
      
      if (this.isRoyalSparkle) {
        // Fade sparkles in and out pulsing
        this.opacity += this.opacitySpeed;
        if (this.opacity > 0.95 || this.opacity < 0.15) {
          this.opacitySpeed = -this.opacitySpeed;
        }
        this.x += this.speedX;
      } 
      else if (currentTemplate === "islamic") {
        this.x += this.speedX + Math.sin(this.angle) * 0.1;
        this.angle += this.spinSpeed;
      } 
      else {
        // Garden wind sways
        this.x += this.speedX + Math.sin(this.angle) * 0.3;
        this.angle += this.spinSpeed;
      }

      // Reset when particle drifts off screen boundaries
      if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      // Draw nothing if view is currently in homepage creation forms to keep readability high
      const creatorContainer = document.getElementById("creator-container");
      const isCreatorVisible = creatorContainer && !creatorContainer.classList.contains("hidden");
      if (isCreatorVisible) return;

      ctx.save();
      ctx.translate(this.x, this.y);

      if (this.isRoyalSparkle) {
        // Golden Diamond Shimmer
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.5);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size * 1.5);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(223, 195, 132, ${this.opacity})`;
        ctx.fill();
      } 
      else if (this.template === "islamic") {
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 1.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.isSageLeaf 
          ? `rgba(106, 143, 115, ${this.opacity})` 
          : `rgba(62, 95, 79, ${this.opacity})`;
        ctx.fill();
      } 
      else {
        // Garden Romance
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.isPinkPetal 
          ? `rgba(240, 180, 185, ${this.opacity})` 
          : `rgba(223, 195, 132, ${this.opacity})`;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}
