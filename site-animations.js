(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.createElement("div");
  progress.className = "site-scroll-progress";
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-label", "Progres membaca halaman");
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");
  progress.setAttribute("aria-valuenow", "0");
  document.body.append(progress);

  const backToTop = document.createElement("button");
  backToTop.className = "site-back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "Kembali ke atas");
  backToTop.title = "Kembali ke atas";
  backToTop.textContent = "↑";
  document.body.append(backToTop);

  const navigation = document.querySelector(".navbar, .topbar");
  const hero = document.querySelector(
    ".hero, .hero-section, .page-header, header:not(.topbar):not(nav)"
  );
  if (hero) hero.classList.add("site-hero");

  const updateScrollEffects = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollableHeight > 0
      ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
      : 0;

    document.body.style.setProperty("--site-scroll-progress", String(amount));
    progress.setAttribute("aria-valuenow", String(Math.round(amount * 100)));
    if (navigation) navigation.classList.toggle("site-scrolled", window.scrollY > 12);
    backToTop.classList.toggle("site-visible", window.scrollY > 480);
    scrollFrame = null;
  };

  let scrollFrame = null;
  window.addEventListener("scroll", () => {
    if (scrollFrame === null) {
      scrollFrame = window.requestAnimationFrame(updateScrollEffects);
    }
  }, { passive: true });
  updateScrollEffects();

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? "auto" : "smooth"
    });
  });

  const revealCandidates = Array.from(document.querySelectorAll(
    "main > *, main > .container > *, main > .row > *, main section, main article, main form, main aside, main .card, main [class*='card'], body > .container, body > .form-card, body > .login-card, body > section:not([aria-live]):not(.hero):not(.hero-section), body > footer"
  )).filter((element) => {
    if (element.hasAttribute("hidden") || element.matches("[aria-live]")) return false;
    return getComputedStyle(element).display !== "none";
  });
  const revealTargets = revealCandidates.filter((element) =>
    !revealCandidates.some((candidate) => candidate !== element && candidate.contains(element))
  );

  const cards = document.querySelectorAll(
    ".card, article, .service-card, .feature-card, .form-card, .side-card, .preview-card, .login-card"
  );
  cards.forEach((card) => card.classList.add("site-interactive-card"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("site-visible"));
    return;
  }

  revealTargets.forEach((element, index) => {
    element.classList.add("site-reveal");
    element.style.transitionDelay = `${(index % 4) * 70}ms`;
    element.addEventListener("transitionend", (event) => {
      if (event.target === element && event.propertyName === "opacity") {
        element.style.transitionDelay = "";
      }
    });
  });

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("site-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach((element) => observer.observe(element));
})();
