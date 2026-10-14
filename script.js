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

if (!document.body.classList.contains("home-reference")) {
window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resize();
requestAnimationFrame(draw);
}

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
  const status = document.querySelector(".copy-status");
  let resetTimer;
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
      button.focus({ preventScroll: true });
      if (!copied) throw new Error("Clipboard copy failed");
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
      if (status) status.textContent = "邮箱已复制";
      else button.textContent = `邮箱已复制 · ${email}`;
    } catch {
      if (status) status.textContent = "复制失败，请手动复制邮箱地址";
      else button.textContent = `邮箱 · ${email}`;
    }

    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      button.textContent = originalText;
      if (status) status.textContent = "";
    }, 3000);
  });
});

document.querySelectorAll("[data-pdf-viewer]").forEach((viewer) => {
  const pages = Array.from(viewer.querySelectorAll(".pdf-page"));
  const links = Array.from(viewer.querySelectorAll(".pdf-sidebar a"));
  const counter = viewer.querySelector("[data-pdf-count]");
  const prevButton = viewer.querySelector("[data-pdf-prev]");
  const nextButton = viewer.querySelector("[data-pdf-next]");
  let currentIndex = 0;

  function setActive(index) {
    currentIndex = Math.max(0, Math.min(index, pages.length - 1));
    links.forEach((link, linkIndex) => {
      link.classList.toggle("is-active", linkIndex === currentIndex);
    });
    if (counter) {
      counter.textContent = `Page ${String(currentIndex + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
    }
  }

  function goTo(index) {
    const page = pages[Math.max(0, Math.min(index, pages.length - 1))];
    page?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  prevButton?.addEventListener("click", () => goTo(currentIndex - 1));
  nextButton?.addEventListener("click", () => goTo(currentIndex + 1));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActive(pages.indexOf(visible.target));
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.3, 0.55] },
    );
    pages.forEach((page) => observer.observe(page));
  } else {
    setActive(0);
  }
});
