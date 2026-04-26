/* 
  THE MASTERPIECE - INTERACTIVE LOGIC
  Advanced Cursor, Particles, and Scroll Reveal
*/

document.addEventListener("DOMContentLoaded", () => {
  // --- 0. SCROLL PROGRESS BAR ---
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
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
  });

  // --- 1. CUSTOM CURSOR ---
  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");

  window.addEventListener("mousemove", (e) => {
    const { clientX, clientY } = e;

    // Smooth dot movement
    dot.style.left = `${clientX}px`;
    dot.style.top = `${clientY}px`;

    // Delayed outline movement for 'organic' feel
    outline.animate(
      {
        left: `${clientX}px`,
        top: `${clientY}px`,
      },
      { duration: 500, fill: "forwards" },
    );

    // Interactive Background Glow
    const glow = document.getElementById("mouseGlow");
    glow.style.left = `${clientX}px`;
    glow.style.top = `${clientY}px`;

    // Parallax Effect for Hero
    const heroVisual = document.querySelector(".hero-visual");
    if (heroVisual) {
      const moveX = (clientX - window.innerWidth / 2) / 50;
      const moveY = (clientY - window.innerHeight / 2) / 50;
      heroVisual.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  });

  // Cursor hover effects
  const interactiveElements = document.querySelectorAll(
    "a, button, .bento-item, .project-card",
  );
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      outline.style.transform = "translate(-50%, -50%) scale(1.5)";
      outline.style.background = "rgba(0, 242, 254, 0.1)";
    });
    el.addEventListener("mouseleave", () => {
      outline.style.transform = "translate(-50%, -50%) scale(1)";
      outline.style.background = "transparent";
    });
  });

  // Input hover effects (to prevent blocking text)
  const inputElements = document.querySelectorAll("input, textarea");
  inputElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      dot.classList.add("input-hover");
      outline.classList.add("input-hover");
    });
    el.addEventListener("mouseleave", () => {
      dot.classList.remove("input-hover");
      outline.classList.remove("input-hover");
    });
  });

  // --- 2. ADVANCED PARTICLE SYSTEM ---
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }
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
      if (
        this.x < 0 ||
        this.x > canvas.width ||
        this.y < 0 ||
        this.y > canvas.height
      ) {
        this.reset();
      }
    }
    draw() {
      const isLight =
        document.documentElement.getAttribute("data-theme") === "light";
      ctx.fillStyle = isLight
        ? `rgba(37, 99, 235, ${this.opacity})`
        : `rgba(0, 242, 254, ${this.opacity})`;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function createParticles() {
    const count = Math.floor(window.innerWidth / 15);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener("resize", () => {
    initCanvas();
    createParticles();
  });

  initCanvas();
  createParticles();
  animateParticles();

  // --- 3. SCROLL REVEAL ENGINE (STAGGERED) ---
  // Apply staggered delays to groups FIRST
  const groups = document.querySelectorAll(
    ".skills-grid, .about-right-stack, .exp-list, .projects-bento",
  );
  groups.forEach((group) => {
    const children = group.children;
    for (let i = 0; i < children.length; i++) {
      children[i].style.transitionDelay = `${i * 0.15}s`;
      children[i].classList.add("reveal");
    }
  });

  // Now select ALL reveal elements (including the ones added above)
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-scale",
  );
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section");

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");

        // Active Nav Link Update
        const id = entry.target.getAttribute("id");
        if (id) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
  sections.forEach((section) => observer.observe(section));

  // --- 4. NAVBAR BEHAVIOR ---
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // --- 5. THEME TOGGLE (PREMIUM) ---
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("portfolioTheme", newTheme);
  });

  // --- 6. FORM TRANSMISSION ---
  const contactForm = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!submitBtn) return;

      submitBtn.textContent = "TRANSMITTING...";
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);
      const data = {
        user_name: formData.get("user_name"),
        user_email: formData.get("user_email"),
        message: formData.get("message"),
      };

      try {
        const response = await fetch("https://portfolio-v-69f9.onrender.com/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          throw new Error("Server error");
        }
      } catch (error) {
        console.error("FAILED...", error);
        submitBtn.textContent = "TRANSMISSION FAILED";
        submitBtn.style.background = "#ef4444";

        setTimeout(() => {
          submitBtn.textContent = "Try Again";
          submitBtn.style.background = "var(--arctic-gradient)";
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  }
});
