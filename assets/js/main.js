/* Saveli — site script (no dependencies) */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      toggle.querySelector(".nav-toggle-label").textContent = open ? "Close" : "Menu";
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.hidden = false;
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var original = btn.textContent;
      var done = function (msg) {
        btn.textContent = msg;
        setTimeout(function () { btn.textContent = original; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done("Select and copy the address above"); });
      } else {
        done("Select and copy the address above");
      }
    });
  });

  /* ---------- Offers ---------- */
  var offersRoot = document.getElementById("offers-live");
  if (offersRoot) {
    var offers = Array.isArray(window.SAVELI_OFFERS) ? window.SAVELI_OFFERS.filter(function (o) {
      return o && o.store && o.rate && /^https:\/\//i.test(o.url || "");
    }) : [];
    if (offers.length) {
      offersRoot.hidden = false;
      var grid = offersRoot.querySelector(".offer-grid");
      var filters = offersRoot.querySelector(".offer-filters");
      var esc = function (s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
      };
      var safeUrl = function (u) { return /^https:\/\//i.test(u) ? u : "#"; };
      var render = function (cat) {
        grid.innerHTML = offers.filter(function (o) { return !cat || o.category === cat; }).map(function (o) {
          var terms = Array.isArray(o.terms) && o.terms.length
            ? "<ul>" + o.terms.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "";
          var meta = (o.trackingTime || o.validationPeriod) ? '<dl class="offer-meta">' +
            (o.trackingTime ? "<div><dt>Tracks in</dt><dd>" + esc(o.trackingTime) + "</dd></div>" : "") +
            (o.validationPeriod ? "<div><dt>Confirms in</dt><dd>" + esc(o.validationPeriod) + "</dd></div>" : "") +
            "</dl>" : "";
          return '<article class="offer-card">' +
            '<div class="offer-top"><div><h3>' + esc(o.store) + '</h3>' +
            (o.category ? '<div class="offer-cat">' + esc(o.category) + "</div>" : "") + "</div></div>" +
            '<div class="offer-rate">' + esc(o.rate) + (o.rateNote ? "<span>" + esc(o.rateNote) + "</span>" : "") + "</div>" +
            '<div class="stack" style="gap:.75rem">' + meta + terms + "</div>" +
            '<a class="btn btn-primary" href="' + esc(safeUrl(o.url)) + '" target="_blank" rel="noopener sponsored">Shop at ' + esc(o.store) + "</a>" +
            "</article>";
        }).join("");
      };
      var cats = [];
      offers.forEach(function (o) { if (o.category && cats.indexOf(o.category) === -1) cats.push(o.category); });
      if (cats.length > 1) {
        filters.hidden = false;
        var make = function (label, value) {
          var b = document.createElement("button");
          b.type = "button"; b.className = "chip"; b.textContent = label;
          b.setAttribute("aria-pressed", value === "" ? "true" : "false");
          b.addEventListener("click", function () {
            filters.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
            b.setAttribute("aria-pressed", "true");
            render(value);
          });
          filters.appendChild(b);
        };
        make("All", "");
        cats.forEach(function (c) { make(c, c); });
      }
      render("");
    }
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    var submitBtn = form.querySelector("button[type=submit]");
    var supportEmail = form.getAttribute("data-email");
    var endpoint = form.getAttribute("data-endpoint") || "";

    var showStatus = function (kind, html) {
      statusEl.className = "form-status " + kind;
      statusEl.innerHTML = html;
      statusEl.hidden = false;
      statusEl.focus();
    };
    var setError = function (field, msg) {
      var input = form.elements[field];
      var err = document.getElementById(field + "-error");
      if (!input || !err) return;
      if (msg) {
        input.setAttribute("aria-invalid", "true");
        err.textContent = msg; err.hidden = false;
      } else {
        input.removeAttribute("aria-invalid");
        err.textContent = ""; err.hidden = true;
      }
    };
    var validate = function () {
      var ok = true, first = null;
      var v = function (name) { return (form.elements[name].value || "").trim(); };
      var check = function (name, cond, msg) {
        setError(name, cond ? "" : msg);
        if (!cond) { ok = false; if (!first) first = form.elements[name]; }
      };
      check("name", v("name").length >= 2, "Enter your name.");
      check("email", /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email")), "Enter a valid email address, like name@example.com.");
      check("topic", v("topic") !== "", "Choose what your message is about.");
      check("message", v("message").length >= 10, "Write a few words so we can help (at least 10 characters).");
      check("consent", form.elements.consent.checked, "Tick this box so we can use your details to reply.");
      if (first) first.focus();
      return ok;
    };
    var mailtoFallback = function () {
      var f = form.elements;
      var body = "Name: " + f.name.value.trim() + "\nEmail: " + f.email.value.trim() +
        (f.order.value.trim() ? "\nOrder / reference: " + f.order.value.trim() : "") +
        "\n\n" + f.message.value.trim();
      var href = "mailto:" + supportEmail + "?subject=" + encodeURIComponent("[" + f.topic.value + "] Message from saveli.in") +
        "&body=" + encodeURIComponent(body);
      showStatus("ok", "Your email app should now open with the message filled in. Press send there to reach us. " +
        "If nothing opens, email us directly at <a href=\"mailto:" + supportEmail + "\">" + supportEmail + "</a>.");
      window.location.href = href;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.hidden = true;
      if (!validate()) return;
      if (!endpoint || !window.fetch) { mailtoFallback(); return; }

      submitBtn.disabled = true;
      var label = submitBtn.textContent;
      submitBtn.textContent = "Sending…";
      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        return res.json().catch(function () { return { ok: false, fallback: true }; }).then(function (data) {
          return { status: res.status, data: data };
        });
      }).then(function (r) {
        if (r.data && r.data.ok) {
          form.reset();
          showStatus("ok", "Thanks, your message has reached the Saveli team. We'll reply to the email address you gave.");
        } else if (r.status < 500 && r.data && r.data.error && !r.data.fallback) {
          showStatus("err", r.data.error);
        } else {
          mailtoFallback();
        }
      }).catch(function () {
        mailtoFallback();
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = label;
      });
    });

    ["name", "email", "topic", "message"].forEach(function (n) {
      form.elements[n].addEventListener("input", function () {
        if (form.elements[n].getAttribute("aria-invalid") === "true") setError(n, "");
      });
    });
    form.elements.consent.addEventListener("change", function () { setError("consent", ""); });

    if (/[?&]sent=1/.test(window.location.search)) {
      showStatus("ok", "Thanks, your message has reached the Saveli team. We'll reply to the email address you gave.");
    } else if (/[?&]sent=0/.test(window.location.search)) {
      showStatus("err", "We couldn't send your message. Please email us at <a href=\"mailto:" + supportEmail + "\">" + supportEmail + "</a>.");
    }
  }
})();
