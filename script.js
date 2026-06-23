const canvas = document.querySelector("#flow-field");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0, y: 0, active: false };

function getYearColor() {
  const value = getComputedStyle(document.body).getPropertyValue("--year-color").trim();
  return value || "#2dd4bf";
}

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(95, Math.max(42, Math.floor((width * height) / 22000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.22 + Math.random() * 0.48,
    radius: 0.7 + Math.random() * 1.4,
    phase: Math.random() * Math.PI * 2,
  }));
}

function draw(time = 0) {
  const yearColor = getYearColor();
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  for (const particle of particles) {
    const drift = Math.sin(time * 0.00028 + particle.phase) * 0.85;
    const angle =
      Math.sin((particle.x + time * 0.018) * 0.004) +
      Math.cos((particle.y - time * 0.012) * 0.005) +
      drift;

    particle.x += Math.cos(angle) * particle.speed;
    particle.y += Math.sin(angle) * particle.speed;

    if (pointer.active) {
      const dx = pointer.x - particle.x;
      const dy = pointer.y - particle.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 160) {
        particle.x -= dx * 0.005;
        particle.y -= dy * 0.005;
      }
    }

    if (particle.x < -20) particle.x = width + 20;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;

    ctx.beginPath();
    ctx.fillStyle = yearColor;
    ctx.globalAlpha = 0.26;
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = yearColor;
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 92) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resize();
requestAnimationFrame(draw);

function toggleTicket(ticket) {
  const wall = ticket.closest(".ticket-hero-wall");
  wall?.querySelectorAll("figure.is-active").forEach((item) => {
    if (item !== ticket) item.classList.remove("is-active");
  });
  ticket.classList.toggle("is-active");
}

document.querySelectorAll(".ticket-hero-wall").forEach((wall) => {
  wall.addEventListener("click", (event) => {
    const ticket = event.target.closest("figure");
    if (ticket && wall.contains(ticket)) toggleTicket(ticket);
  });

  wall.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const ticket = event.target.closest("figure");
    if (!ticket || !wall.contains(ticket)) return;
    event.preventDefault();
    toggleTicket(ticket);
  });
});

document.querySelectorAll("[data-copy-email]").forEach((button) => {
  const originalText = button.textContent;
  button.addEventListener("click", async () => {
    const email = button.dataset.copyEmail;
    if (!email) return;

    const copyWithFallback = () => {
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      return copied;
    };

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(email);
        } catch {
          copyWithFallback();
        }
      } else {
        copyWithFallback();
      }
      button.textContent = `Email 已复制 · ${email}`;
    } catch {
      button.textContent = `Email · ${email}`;
    }

    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1600);
  });
});
