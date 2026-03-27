/* eslint-disable */
(function () {
  "use strict";

  // ── Helpers ───────────────────────────────────────────────────────────
  function isBlank(v) {
    return !v || String(v).includes("{{") || String(v).trim() === "";
  }

  // ── Hide nodes with unresolved placeholders ───────────────────────────
  function hideStale() {
    document.querySelectorAll("[data-hide-if-empty]").forEach(function (n) {
      if (isBlank(n.textContent)) n.hidden = true;
    });
    document.querySelectorAll("[data-hide-if-placeholder]").forEach(function (n) {
      if (isBlank(n.getAttribute("href"))) n.hidden = true;
    });
    document.querySelectorAll("[data-hide-if-broken]").forEach(function (img) {
      img.addEventListener("error", function () { img.hidden = true; });
    });
  }

  // ── Skill pills ───────────────────────────────────────────────────────
  function renderPills() {
    document.querySelectorAll("[data-split-items]").forEach(function (wrap) {
      var raw = wrap.getAttribute("data-split-items") || "";
      if (isBlank(raw)) { wrap.hidden = true; return; }
      wrap.innerHTML = raw.split(",")
        .map(function (s) { return s.trim(); })
        .filter(Boolean)
        .map(function (s) { return '<span class="skill-pill">' + s + "</span>"; })
        .join("");
    });
  }

  // ── Work grid ─────────────────────────────────────────────────────────
  // {{works}} = JSON array of { title, tag, image_url, url }
  function renderWorks() {
    document.querySelectorAll("[data-works]").forEach(function (grid) {
      var raw = grid.getAttribute("data-works") || "";
      if (isBlank(raw)) return;
      var works;
      try { works = JSON.parse(raw); } catch (e) { return; }
      if (!Array.isArray(works) || !works.length) return;
      var ph = document.getElementById("work-placeholder");
      if (ph) ph.hidden = true;
      grid.insertAdjacentHTML("beforeend", works.map(function (w) {
        return '<a href="' + (w.url || "#") + '" target="_blank" rel="noreferrer" class="work-card">'
          + '<img src="' + (w.image_url || "") + '" alt="' + (w.title || "") + '" loading="lazy">'
          + '<div class="work-card-overlay">'
          + '<p class="work-card-title">' + (w.title || "") + "</p>"
          + '<p class="work-card-tag">' + (w.tag || "") + "</p>"
          + "</div></a>";
      }).join(""));
    });
  }

  // ── Animated counters ─────────────────────────────────────────────────
  function animateCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-target") || "0", 10);
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        var display = el.querySelector(".counter-value");
        if (!display) { io.unobserve(el); return; }
        var current = 0;
        var inc = Math.ceil(target / 60);
        var timer = setInterval(function () {
          current = Math.min(current + inc, target);
          display.textContent = prefix + current + suffix;
          if (current >= target) clearInterval(timer);
        }, 24);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io.observe(c); });
  }

  // ── Marquee: clone template items for seamless loop ──────────────────
  function initMarquee() {
    var tmpl = document.getElementById("marquee-items");
    if (!tmpl) return;
    var wrap = tmpl.parentElement;
    var items = tmpl.content.cloneNode(true);
    var items2 = tmpl.content.cloneNode(true);
    wrap.appendChild(items);
    wrap.appendChild(items2);
    tmpl.remove();
  }

  hideStale();
  renderPills();
  renderWorks();
  animateCounters();
  initMarquee();
})();