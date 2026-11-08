/* Tegania Solutions — interactions */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Reveal on scroll (with sibling stagger) ---------- */
  const revealEls = $$(".reveal");
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const i = siblings.indexOf(el);
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
  });
  // Hero content is above the fold: reveal it on load rather than waiting for the observer
  requestAnimationFrame(() => $$(".hero .reveal").forEach((el) => el.classList.add("is-in")));
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Nav: scrolled state, hide on scroll down, active link ---------- */
  const nav = $("#nav");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 20);
    const menuOpen = toggle.getAttribute("aria-expanded") === "true";
    nav.classList.toggle("is-hidden", !menuOpen && y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y < 500) nav.classList.remove("is-hidden");
    lastY = y;
    updateProcess();
  };

  const links = $$(".nav__links a");
  const sections = links.map((a) => $(a.getAttribute("href")));
  const sectionIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
      }
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => s && sectionIO.observe(s));

  /* ---------- Mobile menu ---------- */
  const toggle = $(".nav__toggle");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => e.matches && setMenu(false));

  /* ---------- Design ↔ Code split ---------- */
  const split = $("#split");
  const range = $(".split__range", split);
  const setPos = (pct) => {
    pct = Math.max(0, Math.min(100, pct));
    split.style.setProperty("--pos", `${pct}%`);
    range.value = Math.round(pct);
  };
  range.addEventListener("input", () => setPos(+range.value));
  range.style.pointerEvents = "none"; // pointer handled below; range stays for keyboard

  let dragging = false;
  let userTouched = false;
  const fromEvent = (e) => {
    const r = split.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  };
  split.addEventListener("pointerdown", (e) => {
    dragging = true; userTouched = true;
    split.setPointerCapture(e.pointerId);
    fromEvent(e);
  });
  split.addEventListener("pointermove", (e) => {
    if (dragging) fromEvent(e);
    else if (finePointer && userTouched) fromEvent(e);
  });
  const end = () => { dragging = false; };
  split.addEventListener("pointerup", end);
  split.addEventListener("pointercancel", end);
  split.addEventListener("pointerenter", () => { userTouched = true; });

  // Intro sweep to hint interactivity
  if (!reduceMotion) {
    const start = performance.now() + 900;
    const dur = 2200;
    const sweep = (t) => {
      if (userTouched) return;
      const p = Math.max(0, Math.min(1, (t - start) / dur));
      // 50 → 78 → 28 → 50
      const v = 50 + Math.sin(p * Math.PI * 2) * 26 * (1 - p * 0.15);
      setPos(p >= 1 ? 50 : v);
      if (p < 1) requestAnimationFrame(sweep);
    };
    requestAnimationFrame(sweep);
  }

  /* ---------- Services accordion ---------- */
  $$(".service").forEach((item) => {
    const btn = $(".service__row", item);
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      $$(".service.is-open").forEach((o) => {
        o.classList.remove("is-open");
        $(".service__row", o).setAttribute("aria-expanded", "false");
      });
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Spotlight cards ---------- */
  $$(".spot").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* ---------- Process progress rail ---------- */
  const process = $(".process");
  const fill = $(".process__fill");
  const steps = $$(".step");
  function updateProcess() {
    if (!process) return;
    const r = process.getBoundingClientRect();
    const mid = innerHeight * 0.55;
    const pct = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    fill.style.setProperty("--progress", `${pct * 100}%`);
    steps.forEach((s) => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle("is-active", sr.top < mid);
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Contact form ---------- */
  const form = $("#contact-form");
  const status = $(".form__status", form);
  // Address used for the "email us directly" fallback link
  const TO = "nasser@tegania.com";
  // Enquiries are delivered by FormSubmit (formsubmit.co) to nasser@tegania.com.
  // FORM_ID: paste the random alias from FormSubmit's activation email here (e.g. "a1b2c3d4e5...")
  // so the address isn't used in the form endpoint. Until then it falls back to the address.
  const FORM_ID = "nasser@tegania.com";
  const ENDPOINT = `https://formsubmit.co/ajax/${FORM_ID}`;
  const submitBtn = $('button[type="submit"]', form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const required = ["name", "email", "message"];
    let firstBad = null;
    required.forEach((n) => {
      const input = form.elements[n];
      const ok = input.value.trim() && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));
      input.closest(".field").classList.toggle("is-invalid", !ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) {
      status.className = "form__status is-err";
      status.textContent = "Please fill in your name, a valid email and a short message.";
      firstBad.focus();
      return;
    }
    const interests = data.getAll("interest").join(", ") || "—";
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Interested in: ${interests}`,
      `Budget: ${data.get("budget") || "Not sure yet"}`,
      "",
      data.get("message"),
    ].join("\n");
    const subject = `New project enquiry — ${data.get("name")}`;

    // Honeypot: real people never see or fill this field
    if (data.get("_honey")) return;

    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "Sending…";
    status.className = "form__status";
    status.textContent = "";

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          interested_in: interests,
          budget: data.get("budget") || "Not sure yet",
          message: data.get("message"),
          _subject: subject,
          _replyto: data.get("email"),
          _template: "table",
          _captcha: "false",
        }),
      });
      const json = await res.json().catch(() => ({}));
      // First-ever submission: FormSubmit holds it and emails TO an activation link
      if (/activat/i.test(json.message || "")) {
        status.className = "form__status is-ok";
        status.textContent = "Form not activated yet — FormSubmit has emailed an activation link to the site owner.";
        return;
      }
      if (!res.ok || json.success === false || json.success === "false") throw new Error(json.message || res.status);

      form.reset();
      status.className = "form__status is-ok";
      status.textContent = "Thank you! Your enquiry has been received — we'll be in touch as soon as possible.";
    } catch (err) {
      // Network or service problem: fall back to the visitor's email app so the lead isn't lost
      status.className = "form__status is-err";
      status.innerHTML = `Something went wrong sending your message. <a href="mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}" style="text-decoration:underline">Email us directly instead</a>.`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector("span").textContent = "Send enquiry";
    }
  });
  $$("input, textarea", form).forEach((el) =>
    el.addEventListener("input", () => el.closest(".field")?.classList.remove("is-invalid"))
  );

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", updateProcess);
  onScroll();
})();
