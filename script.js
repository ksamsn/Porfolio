/* Karl Samson Portfolio: script.js */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Copyright year ----------
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Mobile menu ----------
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) setMenu(false); });
  }

  // ---------- Active nav link + scroll reveal (each reveals once) ----------
  var links = document.querySelectorAll(".site-nav a");
  var reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  // ---------- Scroll progress bar + back-to-top button ----------
  var bar = document.querySelector(".progress span");
  var toTop = document.querySelector(".to-top");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Rotating hero label ----------
  var rot = document.getElementById("rotator");
  var phrases = ["Computer Engineering Student", "Creative Thinker", "Lifelong Learner"];
  if (rot && !reduce) {
    var idx = 0;
    setInterval(function () {
      if (document.hidden) return;
      rot.classList.add("out");
      setTimeout(function () {
        idx = (idx + 1) % phrases.length;
        rot.textContent = phrases[idx];
        rot.classList.remove("out");
      }, 350);
    }, 3000);
  }

  // ---------- Skill cards: tap to activate on touch screens ----------
  var cards = document.querySelectorAll(".skill");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      var wasOn = card.classList.contains("is-active");
      cards.forEach(function (c) { c.classList.remove("is-active"); });
      if (!wasOn) card.classList.add("is-active");
    });
  });

  // ---------- Page background: floating colored shapes (lightweight canvas) ----------
  // The canvas is fixed behind the whole page. Shapes rise from the bottom to the top of the screen, spin slowly,
  // scatter away from the mouse, and burst when you click or tap empty space.
  var canvas = document.getElementById("bg");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var colors = ["#ff6b6b", "#ffd166", "#4cc9f0", "#b794f6", "#5ee0a0"];
    var shapes = [], w = 0, h = 0, lastW = 0, raf = 0, dpr = 1;
    var ptr = { x: -999, y: -999 };
    var fine = window.matchMedia("(pointer: fine)").matches;

    var size = function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var build = function () {
      size();
      var n = w < 700 ? 14 : Math.min(36, Math.round(w / 40)); // fewer shapes on small screens
      shapes = [];
      for (var i = 0; i < n; i++) {
        var bx = (Math.random() - 0.5) * 0.1, by = -(0.6 + Math.random() * 0.9); // rise steadily, slight sideways drift
        shapes.push({
          x: Math.random() * w, y: Math.random() * h, s: 6 + Math.random() * 10,
          type: Math.floor(Math.random() * 5), color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * 6.28, bvr: (Math.random() - 0.5) * 0.015, vr: 0,
          ph: Math.random() * 6.28, bx: bx, by: by, vx: bx, vy: by, a: 0.25 + Math.random() * 0.3
        });
      }
      draw();
    };

    var drawShape = function (d) {
      var r = d.s / 2;
      ctx.save();
      ctx.translate(d.x, d.y); ctx.rotate(d.rot);
      ctx.globalAlpha = d.a; ctx.fillStyle = d.color; ctx.strokeStyle = d.color; ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (d.type === 0) { ctx.arc(0, 0, r, 0, 6.2832); ctx.fill(); }                       // dot
      else if (d.type === 1) { ctx.strokeRect(-r, -r, d.s, d.s); }                          // square
      else if (d.type === 2) { ctx.moveTo(0, -r * 1.1); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fill(); } // triangle
      else if (d.type === 3) { ctx.lineWidth = 2; ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke(); } // plus
      else { ctx.arc(0, 0, r, 0, 6.2832); ctx.stroke(); }                                   // ring
      ctx.restore();
    };

    var draw = function () {
      ctx.clearRect(0, 0, w, h);
      shapes.forEach(drawShape);
    };

    var tick = function () {
      shapes.forEach(function (d) {
        var dx = d.x - ptr.x, dy = d.y - ptr.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) { // gently scatter away from the mouse
          var f = (1 - dist / 130) * 0.5;
          d.vx += (dx / dist) * f; d.vy += (dy / dist) * f;
        }
        d.vx += (d.bx - d.vx) * 0.04; d.vy += (d.by - d.vy) * 0.04; d.vr += (d.bvr - d.vr) * 0.03;
        d.x += d.vx + Math.sin(d.y * 0.012 + d.ph) * 0.25; d.y += d.vy; d.rot += d.vr + d.bvr; // gentle sway while rising
        if (d.y < -20) { d.y = h + 20 + Math.random() * 60; d.x = Math.random() * w; } // leave at the top, re-enter from the bottom
        else if (d.y > h + 90) d.y = h + 20;
        if (d.x < -20) d.x = w + 20; else if (d.x > w + 20) d.x = -20;
      });
      draw();
      raf = requestAnimationFrame(tick);
    };

    var start = function () { if (!raf && !reduce && !document.hidden) raf = requestAnimationFrame(tick); };
    var stop = function () { cancelAnimationFrame(raf); raf = 0; };

    build(); lastW = w; start();

    if (!reduce) {
      window.addEventListener("pointermove", function (e) {
        if (fine) { ptr.x = e.clientX; ptr.y = e.clientY; }
      }, { passive: true });
      document.addEventListener("pointerleave", function () { ptr.x = ptr.y = -999; });
      // Click or tap on empty space: shapes burst outward and spin
      window.addEventListener("pointerdown", function (e) {
        if (e.target.closest && e.target.closest("a, button, .skill")) return;
        shapes.forEach(function (d) {
          var dx = d.x - e.clientX, dy = d.y - e.clientY, dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 240) {
            var f = (1 - dist / 240) * 5;
            d.vx += (dx / dist) * f; d.vy += (dy / dist) * f; d.vr += (Math.random() - 0.5) * 0.25;
          }
        });
      }, { passive: true });
    }

    var timer;
    window.addEventListener("resize", function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (window.innerWidth !== lastW) { lastW = window.innerWidth; build(); }
        else { size(); draw(); } // only the height changed (mobile address bar)
      }, 200);
    });
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  }
})();