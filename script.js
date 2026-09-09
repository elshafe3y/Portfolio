/* =========================================================
   Ahmed Elshafey — Portfolio Scripts (Vanilla JavaScript)
   Modules:
   1.  Helpers
   2.  Loading Screen
   3.  Mobile Navigation (Hamburger)
   4.  Navbar Scroll State + Scroll Progress
   5.  Active Navigation Highlight
   6.  Smooth Scrolling
   7.  Typing Effect
   8.  Scroll Reveal Animations
   9.  Animated Skill Progress Bars
   10. Ripple Button Effect
   11. Mouse Glow Effect
   12. Parallax Background
   13. Back To Top Button
   14. Download CV (generated file)
   15. Init
   ========================================================= */

(function () {
  "use strict";

  /* =======================================================
     1. Helpers
     ======================================================= */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Throttle a callback to one call per animation frame. */
  function onFrame(callback) {
    let queued = false;
    return function (...args) {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        callback.apply(this, args);
      });
    };
  }

  /* =======================================================
     2. Loading Screen
     ======================================================= */
  function initLoader() {
    const loader = $("#loader");
    const bar = $("#loaderBar");
    if (!loader) return;

    let progress = 0;

    const tick = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18 + 6, 100);
      if (bar) bar.style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(tick);
        setTimeout(() => {
          loader.classList.add("is-done");
          document.body.classList.remove("is-locked");
          // Trigger the first reveal pass once the page is visible
          revealVisible();
        }, 260);
      }
    }, 140);

    document.body.classList.add("is-locked");

    // Safety net: never trap the user behind the loader
    setTimeout(() => {
      clearInterval(tick);
      loader.classList.add("is-done");
      document.body.classList.remove("is-locked");
    }, 3500);
  }

  /* =======================================================
     3. Mobile Navigation (Hamburger)
     ======================================================= */
  function initMobileNav() {
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    };

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    // Close after choosing a link
    $$(".nav__link", menu).forEach((link) => link.addEventListener("click", closeMenu));

    // Close on Escape or when resizing to desktop
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  /* =======================================================
     4. Navbar Scroll State + Scroll Progress
     ======================================================= */
  function initScrollChrome() {
    const navbar = $("#navbar");
    const progress = $("#scrollProgress");

    const update = onFrame(() => {
      const scrolled = window.scrollY;

      // Navbar background while scrolling
      if (navbar) navbar.classList.toggle("is-scrolled", scrolled > 30);

      // Reading progress bar
      if (progress) {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = height > 0 ? (scrolled / height) * 100 : 0;
        progress.style.width = ratio + "%";
      }
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* =======================================================
     5. Active Navigation Highlight
     ======================================================= */
  function initActiveNav() {
    const links = $$(".nav__link");
    const sections = links
      .map((link) => $(link.getAttribute("href")))
      .filter(Boolean);

    if (!sections.length) return;

    const update = onFrame(() => {
      const line = window.scrollY + window.innerHeight * 0.32;
      let activeId = sections[0].id;

      sections.forEach((section) => {
        if (section.offsetTop <= line) activeId = section.id;
      });

      // Force the last section active at the very bottom of the page
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) activeId = sections[sections.length - 1].id;

      links.forEach((link) =>
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + activeId)
      );
    });

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* =======================================================
     6. Smooth Scrolling
     ======================================================= */
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;

        const target = $(id);
        if (!target) return;

        event.preventDefault();
        const offset = 84;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  }

  /* =======================================================
     7. Typing Effect
     ======================================================= */
  function initTyping() {
    const target = $("#typed");
    if (!target) return;

    const phrases = [
      "Full Stack Web Developer",
      "Angular Developer",
      "SQL Server & Database Design",
      "Responsive UI Builder",
    ];

    if (prefersReducedMotion) {
      target.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function loop() {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = phrase.slice(0, charIndex);

      let delay = deleting ? 45 : 85;

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 340;
      }

      setTimeout(loop, delay);
    }

    setTimeout(loop, 700);
  }

  /* =======================================================
     8. Scroll Reveal Animations
     ======================================================= */
  let revealObserver = null;

  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = Number(entry.target.dataset.delay || 0);
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item) => revealObserver.observe(item));
  }

  /** Reveal anything already inside the viewport (used after the loader closes). */
  function revealVisible() {
    $$(".reveal").forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        const delay = Number(item.dataset.delay || 0);
        setTimeout(() => item.classList.add("is-visible"), delay);
      }
    });
  }

  /* =======================================================
     9. Animated Skill Progress Bars
     ======================================================= */
  function initSkillBars() {
    const bars = $$(".progress__bar");
    if (!bars.length) return;

    const fill = (bar) => {
      bar.style.width = (bar.dataset.level || 0) + "%";
    };

    if (!("IntersectionObserver" in window)) {
      bars.forEach(fill);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (!entry.isIntersecting) return;
          setTimeout(() => fill(entry.target), index * 90);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    bars.forEach((bar) => observer.observe(bar));
  }

  /* =======================================================
     10. Ripple Button Effect
     ======================================================= */
  function initRipple() {
    $$(".ripple").forEach((element) => {
      element.addEventListener("click", (event) => {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        const wave = document.createElement("span");
        wave.className = "ripple-wave";
        wave.style.width = wave.style.height = size + "px";
        wave.style.left = event.clientX - rect.left - size / 2 + "px";
        wave.style.top = event.clientY - rect.top - size / 2 + "px";

        element.appendChild(wave);
        setTimeout(() => wave.remove(), 680);
      });
    });
  }

  /* =======================================================
     11. Mouse Glow Effect
     ======================================================= */
  function initCursorGlow() {
    const glow = $("#cursorGlow");
    if (!glow || prefersReducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let x = 0;
    let y = 0;

    const move = onFrame(() => {
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    window.addEventListener(
      "pointermove",
      (event) => {
        x = event.clientX;
        y = event.clientY;
        glow.classList.add("is-on");
        move();
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
  }

  /* =======================================================
     12. Parallax Background
     ======================================================= */
  function initParallax() {
    const layers = $$("[data-parallax]");
    if (!layers.length || prefersReducedMotion) return;

    const update = onFrame(() => {
      const scrolled = window.scrollY;
      if (scrolled > window.innerHeight * 1.2) return; // hero only

      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallax) || 0.1;
        layer.style.translate = `0 ${scrolled * speed}px`;
      });
    });

    window.addEventListener("scroll", update, { passive: true });
  }

  /* =======================================================
     13. Back To Top Button
     ======================================================= */
  function initBackToTop() {
    const button = $("#toTop");
    if (!button) return;

    const update = onFrame(() => {
      button.classList.toggle("is-visible", window.scrollY > 520);
    });

    window.addEventListener("scroll", update, { passive: true });

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    update();
  }

  /* =======================================================
     14. Download CV (generated file)
     Creates a plain-text CV on the fly so the button always
     works without shipping a binary asset.
     ======================================================= */
  function initDownloadCv() {
    const link = $("#downloadCv");
    if (!link) return;

    const cv = [
      "AHMED ELSHAFEY",
      "Full Stack Web Developer — Egypt",
      "Email: your_aaalahmed@gmail.com",
      "LinkedIn: https://www.linkedin.com/in/ahmed-el-shafei-423284351/",
      "",
      "PROFILE",
      "Full Stack Web Development student with experience building responsive and",
      "user-friendly web applications. I enjoy solving problems, learning new",
      "technologies, and creating modern websites that help businesses improve",
      "their online presence.",
      "",
      "SKILLS",
      "HTML, CSS, JavaScript, Angular, SQL Server, Database Design,",
      "Responsive Web Design, Backend Development, Git & GitHub",
      "",
      "PROJECT — Inventory Management System",
      "Responsive system to help businesses manage products, categories and",
      "inventory efficiently. Built with Angular, HTML, CSS, JavaScript and",
      "SQL Server. Worked across frontend, backend, database design and testing.",
      "Repository: https://github.com/esraaaboelaas44/inventory-system",
    ].join("\n");

    const blob = new Blob([cv], { type: "text/plain;charset=utf-8" });
    link.href = URL.createObjectURL(blob);
  }

  /* =======================================================
     15. Init
     ======================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initMobileNav();
    initScrollChrome();
    initActiveNav();
    initSmoothScroll();
    initTyping();
    initReveal();
    initSkillBars();
    initRipple();
    initCursorGlow();
    initParallax();
    initBackToTop();
    initDownloadCv();
  });
})();