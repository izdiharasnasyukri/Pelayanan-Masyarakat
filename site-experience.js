(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("ambientCanvas");
  const context = canvas && canvas.getContext("2d");
  const particles = [];
  let animationFrame = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pixelRatio = 1;

  if (canvas && context) {
    const resizeCanvas = () => {
      window.cancelAnimationFrame(animationFrame);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      canvas.width = Math.round(canvasWidth * pixelRatio);
      canvas.height = Math.round(canvasHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleCount = Math.min(70, Math.max(24, Math.floor((canvasWidth * canvasHeight) / 18000)));
      particles.length = 0;
      for (let index = 0; index < particleCount; index += 1) {
        particles.push({
          x: Math.random() * canvasWidth,
          y: Math.random() * canvasHeight,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          radius: Math.random() * 1.6 + 0.5
        });
      }

      drawParticles(!reducedMotion);
    };

    const drawParticles = (moveParticles) => {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      const darkMode = document.documentElement.dataset.theme === "dark";
      const particleColor = darkMode ? "149, 207, 181" : "23, 107, 88";

      particles.forEach((particle, index) => {
        if (moveParticles) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < 0 || particle.x > canvasWidth) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvasHeight) particle.vy *= -1;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particleColor}, ${darkMode ? 0.36 : 0.22})`;
        context.fill();

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const distanceX = particle.x - other.x;
          const distanceY = particle.y - other.y;
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (distance < 105) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(${particleColor}, ${(1 - distance / 105) * (darkMode ? 0.16 : 0.09)})`;
            context.lineWidth = 0.7;
            context.stroke();
          }
        }
      });

      if (moveParticles && !document.hidden) {
        animationFrame = window.requestAnimationFrame(() => drawParticles(true));
      }
    };

    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("visibilitychange", () => {
      window.cancelAnimationFrame(animationFrame);
      if (!document.hidden && !reducedMotion) drawParticles(true);
    });

    resizeCanvas();

    const themeObserver = new MutationObserver(() => {
      if (reducedMotion) drawParticles(false);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
  } else if (canvas) {
    console.warn("Canvas ambient tidak tersedia pada browser ini.");
  }

  if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.addEventListener("pointermove", (event) => {
      document.documentElement.style.setProperty("--light-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--light-y", `${event.clientY}px`);
    }, { passive: true });

    document.querySelectorAll(".card-hover, .performance-stat, .tracking-card").forEach((card) => {
      card.classList.add("interactive-tilt");
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const relativeX = (event.clientX - bounds.left) / bounds.width;
        const relativeY = (event.clientY - bounds.top) / bounds.height;
        const rotateY = (relativeX - 0.5) * 7;
        const rotateX = (0.5 - relativeY) * 7;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        card.style.setProperty("--shine-x", `${relativeX * 100}%`);
        card.style.setProperty("--shine-y", `${relativeY * 100}%`);
        card.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.classList.remove("is-tilting");
      });
    });
  }

  const counters = Array.from(document.querySelectorAll("[data-count]"));
  const animateCounter = (element) => {
    const target = Number(element.dataset.count);
    const decimals = Number(element.dataset.decimals || 0);
    const suffix = element.dataset.suffix || "";
    if (!Number.isFinite(target)) return;

    if (reducedMotion) {
      element.textContent = `${new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(target)}${suffix}`;
      return;
    }

    const startTime = performance.now();
    const duration = 1400;
    const update = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const easedProgress = 1 - ((1 - progress) ** 3);
      const value = target * easedProgress;
      element.textContent = `${new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(progress === 1 ? target : Number(value.toFixed(decimals)))}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
  };

  const chartBars = Array.from(document.querySelectorAll("[data-chart-bar]"));
  const chart = document.querySelector(".performance-chart-svg");
  if (chart) chart.classList.add("chart-ready");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    chartBars.forEach((bar) => bar.classList.add("is-animated"));
  } else {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    counters.forEach((counter) => statsObserver.observe(counter));

    const chartObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        chartBars.forEach((bar, index) => {
          window.setTimeout(() => bar.classList.add("is-animated"), index * 90);
        });
        observer.disconnect();
      });
    }, { threshold: 0.25 });
    if (chart) chartObserver.observe(chart);
  }

  const audioToggle = document.getElementById("tombolAudioUi");
  const audioLabel = document.getElementById("labelAudioUi");
  let audioEnabled = false;
  let audioContext = null;
  try {
    audioEnabled = localStorage.getItem("audioUiPortal") === "on";
  } catch (error) {
    console.warn("Preferensi suara tidak dapat dibaca:", error);
  }

  const updateAudioToggle = () => {
    if (!audioToggle) return;
    audioToggle.setAttribute("aria-pressed", String(audioEnabled));
    audioLabel.textContent = audioEnabled ? "Suara aktif" : "Suara mati";
    audioToggle.querySelector(".bi").className = audioEnabled
      ? "bi bi-volume-up"
      : "bi bi-volume-mute";
  };
  updateAudioToggle();

  if (audioToggle) {
    audioToggle.addEventListener("click", () => {
      audioEnabled = !audioEnabled;
      updateAudioToggle();
      try {
        localStorage.setItem("audioUiPortal", audioEnabled ? "on" : "off");
      } catch (error) {
        console.warn("Preferensi suara tidak dapat disimpan:", error);
      }
    });
  }

  const playUiSound = () => {
    if (!audioEnabled) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;

    try {
      audioContext = audioContext || new AudioContextConstructor();
      const playTone = () => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.07);
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.13);
      };

      if (audioContext.state === "suspended") {
        audioContext.resume().then(playTone).catch((error) => {
          console.warn("Efek suara tidak dapat diputar:", error);
        });
      } else {
        playTone();
      }
    } catch (error) {
      console.warn("Efek suara tidak dapat dibuat:", error);
    }
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("button:not(:disabled), a.btn, [role='button']")) {
      playUiSound();
    }
  });

  const readAloudToggle = document.getElementById("tombolBacakan");
  const chatBody = document.getElementById("isiChatAi");
  let readAloudEnabled = false;
  const canSpeak = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  if (readAloudToggle && chatBody && canSpeak) {
    readAloudToggle.addEventListener("click", () => {
      readAloudEnabled = !readAloudEnabled;
      readAloudToggle.setAttribute("aria-pressed", String(readAloudEnabled));
      readAloudToggle.querySelector(".bi").className = readAloudEnabled
        ? "bi bi-volume-up"
        : "bi bi-volume-mute";
      readAloudToggle.title = readAloudEnabled
        ? "Nonaktifkan pembacaan jawaban"
        : "Aktifkan pembacaan jawaban";
      if (!readAloudEnabled) window.speechSynthesis.cancel();
    });

    const speechObserver = new MutationObserver((mutations) => {
      if (!readAloudEnabled) return;
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement) || !node.matches(".chat-msg.bot")) return;
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(node.textContent.trim());
          utterance.lang = "id-ID";
          utterance.rate = 1;
          window.speechSynthesis.speak(utterance);
        });
      });
    });
    speechObserver.observe(chatBody, { childList: true });
  } else if (readAloudToggle) {
    readAloudToggle.disabled = true;
    readAloudToggle.title = "Browser Anda tidak mendukung pembacaan suara";
  }
})();
