document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("portfolioTheme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const isMobile = window.innerWidth <= 768;

  // --- PROGRESS BAR ---
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--arctic-gradient);
    z-index: 10001;
    transition: width 0.1s ease;
    width: 0%;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";

    if (isMobile) {
      const glow = document.getElementById("mouseGlow");
      const scrollPos = (winScroll / height) * window.innerHeight;
      glow.style.top = `${scrollPos}px`;
      glow.style.left = `50%`;
    }
  });

  // --- CURSOR LOGIC ---
  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");

  window.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;
    if (dot) {
      dot.style.left = `${clientX}px`;
      dot.style.top = `${clientY}px`;
    }

    if (outline) {
      outline.animate(
        { left: `${clientX}px`, top: `${clientY}px` },
        { duration: 500, fill: "forwards" }
      );
    }

    const glow = document.getElementById("mouseGlow");
    if (glow && !isMobile) {
      glow.style.left = `${clientX}px`;
      glow.style.top = `${clientY}px`;
    }

    const heroVisual = document.querySelector(".hero-visual");
    if (heroVisual && !isMobile) {
      const moveX = (clientX - window.innerWidth / 2) / 50;
      const moveY = (clientY - window.innerHeight / 2) / 50;
      heroVisual.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  });

  const interactiveElements = document.querySelectorAll("a, button, .bento-item, .project-card");
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (outline) {
        outline.style.transform = "translate(-50%, -50%) scale(1.5)";
        outline.style.background = "rgba(0, 242, 254, 0.1)";
      }
    });
    el.addEventListener("mouseleave", () => {
      if (outline) {
        outline.style.transform = "translate(-50%, -50%) scale(1)";
        outline.style.background = "transparent";
      }
    });
  });

  const inputElements = document.querySelectorAll("input, textarea");
  inputElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (dot) dot.classList.add("input-hover");
      if (outline) outline.classList.add("input-hover");
    });
    el.addEventListener("mouseleave", () => {
      if (dot) dot.classList.remove("input-hover");
      if (outline) outline.classList.remove("input-hover");
    });
  });

  // --- PARTICLES ---
  const canvas = document.getElementById("particleCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];

    function initCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        ctx.fillStyle = isLight ? `rgba(37, 99, 235, ${this.opacity})` : `rgba(0, 242, 254, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function createParticles() {
      const count = Math.floor(window.innerWidth / 15);
      particles = [];
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function animateParticles() {
      if (!isAnimating) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }

    window.addEventListener("resize", () => {
      initCanvas();
      createParticles();
    });

    initCanvas();
    createParticles();

    const heroSection = document.getElementById("hero");
    let isAnimating = true;

    if (heroSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isAnimating = entry.isIntersecting;
          if (isAnimating) {
            animateParticles();
          }
        });
      }, { threshold: 0 });
      observer.observe(heroSection);
    } else {
      animateParticles();
    }
  }

  // --- SCROLL REVEAL ---
  const groups = document.querySelectorAll(".skills-grid, .about-right-stack, .exp-list, .projects-bento");
  groups.forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.15}s`;
      child.classList.add("reveal");
    });
  });

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        const id = entry.target.getAttribute("id");
        if (id) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) link.classList.add("active");
          });
        }
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  revealElements.forEach((el) => observer.observe(el));
  sections.forEach((section) => observer.observe(section));

  // --- NAVBAR ---
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 100);
  });

  // --- THEME TOGGLE ---
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const newTheme = html.getAttribute("data-theme") === "light" ? "dark" : "light";
      html.setAttribute("data-theme", newTheme);
      localStorage.setItem("portfolioTheme", newTheme);
    });
  }

  // --- MOBILE MENU ---
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinksList = document.querySelector(".nav-links");
  const navLinksItems = document.querySelectorAll(".nav-link");

  if (mobileToggle && navLinksList) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      navLinksList.classList.toggle("active");
      if (navLinksList.classList.contains("active")) {
        document.body.classList.add("no-scroll");
      } else {
        document.body.classList.remove("no-scroll");
      }
    });
  }

  navLinksItems.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileToggle) mobileToggle.classList.remove("active");
      if (navLinksList) navLinksList.classList.remove("active");
      document.body.classList.remove("no-scroll");
    });
  });

  // --- FORM SUBMISSION ---
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!submitBtn) return;

      submitBtn.textContent = "TRANSMITTING...";
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:";
        const API_URL = isLocal ? "http://localhost:5000/api/contact" : "https://portfolio-v-69f9.onrender.com/api/contact";

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          submitBtn.textContent = "MESSAGE TRANSMITTED!";
          submitBtn.style.background = "#10b981";
          contactForm.reset();
          setTimeout(() => {
            submitBtn.textContent = "Transmit Message";
            submitBtn.style.background = "var(--arctic-gradient)";
            submitBtn.disabled = false;
          }, 3000);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Server error");
        }
      } catch (error) {
        submitBtn.textContent = error.message === "Failed to fetch" ? "TRANSMISSION FAILED" : error.message.toUpperCase();
        submitBtn.style.background = "#ef4444";
        setTimeout(() => {
          submitBtn.textContent = "Try Again";
          submitBtn.style.background = "var(--arctic-gradient)";
          submitBtn.disabled = false;
        }, 4000);
      }
    });
  }
});
