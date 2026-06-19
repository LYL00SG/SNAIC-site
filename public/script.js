/* ============================================================================
   Low Yee Lei — portfolio behaviour (vanilla JS, no dependencies)
   ========================================================================== */
(function () {
  "use strict";

  var GITHUB_USERNAME = "LYL00SG";
  var REPOS_URL =
    "https://api.github.com/users/" +
    GITHUB_USERNAME +
    "/repos?sort=updated&per_page=12";

  /* ------------------------------ Theme toggle ---------------------------- */
  function initTheme() {
    var root = document.documentElement;
    var toggle = document.getElementById("theme-toggle");
    var stored = null;
    try {
      stored = localStorage.getItem("theme");
    } catch (e) {
      /* localStorage may be unavailable (private mode) — fall back to OS pref */
    }
    if (stored === "light" || stored === "dark") {
      root.setAttribute("data-theme", stored);
    }

    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      var current =
        root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* ignore persistence failures */
      }
    });
  }

  /* ------------------------------- Mobile nav ----------------------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("nav-menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after tapping a link on mobile.
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* --------------------------- Reveal on scroll --------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !items.length) {
      // No observer support: just show everything.
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------- Active section in the nav ---------------------- */
  function initActiveNav() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll(".nav-menu a")
    );
    if (!("IntersectionObserver" in window) || !links.length) return;

    var byId = {};
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      if (id) byId[id] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.remove("is-active");
            });
            var active = byId[entry.target.id];
            if (active) active.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* --------------------------------- Year --------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------- GitHub repos --------------------------- */

  // A small palette so common languages get their familiar dot colour.
  var LANGUAGE_COLORS = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Shell: "#89e051",
    Kotlin: "#A97BFF",
    Swift: "#F05138",
    Dart: "#00B4AB",
    Vue: "#41b883",
    Jupyter: "#DA5B0B",
    "Jupyter Notebook": "#DA5B0B"
  };

  function svg(paths, extraClass) {
    var ns = "http://www.w3.org/2000/svg";
    var el = document.createElementNS(ns, "svg");
    el.setAttribute("viewBox", "0 0 24 24");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("class", "icon" + (extraClass ? " " + extraClass : ""));
    paths.forEach(function (d) {
      var p = document.createElementNS(ns, "path");
      p.setAttribute("d", d);
      el.appendChild(p);
    });
    return el;
  }

  function makeMetaItem(content) {
    var span = document.createElement("span");
    span.className = "repo-meta-item";
    content.forEach(function (node) {
      span.appendChild(node);
    });
    return span;
  }

  function buildRepoCard(repo) {
    var card = document.createElement("a");
    card.className = "repo-card";
    card.href = repo.html_url;
    card.target = "_blank";
    card.rel = "noopener";

    // Header: repo icon + name (+ optional fork badge)
    var head = document.createElement("div");
    head.className = "repo-card-head";
    head.appendChild(
      svg([
        "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      ])
    );
    var name = document.createElement("span");
    name.className = "repo-name";
    name.textContent = repo.name;
    head.appendChild(name);
    if (repo.fork) {
      var badge = document.createElement("span");
      badge.className = "repo-fork-badge";
      badge.textContent = "Fork";
      head.appendChild(badge);
    }
    card.appendChild(head);

    // Description
    var desc = document.createElement("p");
    desc.className = "repo-desc";
    if (repo.description) {
      desc.textContent = repo.description;
    } else {
      desc.textContent = "No description provided.";
      desc.classList.add("is-empty");
    }
    card.appendChild(desc);

    // Meta: language + stars
    var meta = document.createElement("div");
    meta.className = "repo-meta";

    if (repo.language) {
      var dot = document.createElement("span");
      dot.className = "lang-dot";
      var color = LANGUAGE_COLORS[repo.language];
      if (color) dot.style.background = color;
      var langText = document.createElement("span");
      langText.textContent = repo.language;
      meta.appendChild(makeMetaItem([dot, langText]));
    }

    var starIcon = svg(
      [
        "M12 2.5l2.9 5.9 6.6 1-4.8 4.6 1.1 6.5L12 17.9 6.2 20.9l1.1-6.5L2.5 9.4l6.6-1z"
      ],
      "star-icon"
    );
    var starText = document.createElement("span");
    starText.textContent = String(repo.stargazers_count || 0);
    meta.appendChild(makeMetaItem([starIcon, starText]));

    card.appendChild(meta);
    return card;
  }

  function setStatus(statusEl, html, isError) {
    statusEl.hidden = false;
    statusEl.classList.toggle("is-error", !!isError);
    statusEl.innerHTML = html;
  }

  function loadRepos() {
    var statusEl = document.getElementById("repos-status");
    var gridEl = document.getElementById("repos-grid");
    if (!statusEl || !gridEl) return;

    if (!("fetch" in window)) {
      setStatus(
        statusEl,
        'Your browser can’t load this list. View them on ' +
          '<a href="https://github.com/' +
          GITHUB_USERNAME +
          '" target="_blank" rel="noopener">GitHub</a>.',
        true
      );
      return;
    }

    // Guard against a hung request.
    var controller =
      "AbortController" in window ? new AbortController() : null;
    var timer = controller
      ? setTimeout(function () {
          controller.abort();
        }, 10000)
      : null;

    fetch(REPOS_URL, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) {
          throw new Error("GitHub API responded with " + res.status);
        }
        return res.json();
      })
      .then(function (repos) {
        if (!Array.isArray(repos) || repos.length === 0) {
          setStatus(
            statusEl,
            'No public repositories to show yet — see the latest on ' +
              '<a href="https://github.com/' +
              GITHUB_USERNAME +
              '" target="_blank" rel="noopener">GitHub</a>.'
          );
          return;
        }

        var fragment = document.createDocumentFragment();
        repos.forEach(function (repo) {
          fragment.appendChild(buildRepoCard(repo));
        });
        gridEl.appendChild(fragment);
        gridEl.hidden = false;
        statusEl.hidden = true;
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        var aborted = err && err.name === "AbortError";
        setStatus(
          statusEl,
          (aborted
            ? "That took too long to load. "
            : "Couldn’t load repositories right now. ") +
            'You can browse them directly on ' +
            '<a href="https://github.com/' +
            GITHUB_USERNAME +
            '" target="_blank" rel="noopener">GitHub</a>.',
          true
        );
      });
  }

  /* --------------------------------- Init --------------------------------- */
  function init() {
    initTheme();
    initNav();
    initReveal();
    initActiveNav();
    initYear();
    loadRepos();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
