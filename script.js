(function () {
  "use strict";

  const body = document.body;
  const hero = document.querySelector("[data-hero]");
  const editorial = document.querySelector("[data-signal-editorial]");
  const dotRoot = document.querySelector("[data-signal-dots]");
  const evidenceClose = document.querySelector("[data-evidence-close]");
  const evidenceReveal = document.querySelector("[data-evidence-reveal]");
  const method = document.querySelector("[data-method]");
  const methodAtlas = document.querySelector("[data-method-atlas]");
  const methodDotRoot = document.querySelector("[data-method-dots]");
  const menuTrigger = document.querySelector("[data-menu-trigger]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const previewParameters = new URLSearchParams(window.location.search);
  const forcedReduced = previewParameters.get("motion") === "reduce";
  const forcedCoarse = previewParameters.get("input") === "coarse";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (forcedReduced) document.documentElement.dataset.motion = "reduce";
  if (forcedCoarse) document.documentElement.dataset.input = "coarse";

  const evidenceByAudience = Object.freeze({
    local: Object.freeze({
      question: Object.freeze({
        label: "반복 질문",
        title: "같은 질문에는 설명이 필요한 순간이 있습니다.",
        detail: "한 번의 인상보다 같은 맥락에서 되풀이되는 말을 먼저 확인합니다.",
        action: "먼저 해볼 일 · 처음 고르는 기준을 한 장으로 설명하기",
        methodAction: "처음 고르는 기준을\n한 장으로 설명하기",
        methodLive: "반복 질문을 ‘처음 고르는 기준’ 설명으로 바꿔볼 차례입니다."
      }),
      pause: Object.freeze({
        label: "머뭇한 장면",
        title: "메뉴 앞에서 잠시 멈춘 순간도 살펴볼 장면입니다.",
        detail: "결정을 재촉하기보다 어떤 순서와 말이 막혔는지 장면을 다시 봅니다.",
        action: "먼저 해볼 일 · 메뉴 첫 화면의 선택 순서를 세 단계로 줄이기",
        methodAction: "메뉴 첫 화면의\n선택 순서 줄이기",
        methodLive: "머뭇한 장면을 더 짧고 분명한 선택 순서로 바꿔봅니다."
      }),
      standard: Object.freeze({
        label: "브랜드 기준",
        title: "쉽게 말해도 대표의 기준은 지킵니다.",
        detail: "더 세게 말하는 대신 브랜드가 약속할 수 있는 범위 안에서 설명합니다.",
        action: "먼저 해볼 일 · 쉽게 설명하는 세 문장을 브랜드 기준으로 고정하기",
        methodAction: "브랜드의 쉬운 말투를\n세 문장으로 고정하기",
        methodLive: "대표가 지키는 기준을 다음 설명에서도 흔들리지 않게 정리합니다."
      })
    }),
    team: Object.freeze({
      question: Object.freeze({
        label: "고객·영업 반응",
        title: "흩어진 요청은 같은 운영 과제를 가리킬 수 있습니다.",
        detail: "채널이 달라도 같은 맥락에서 반복되는 질문과 반응을 함께 확인합니다.",
        action: "먼저 해볼 일 · 반복되는 요청을 이번 운영 과제 한 장으로 정리하기",
        methodAction: "반복되는 요청을\n한 과제로 정리하기",
        methodLive: "흩어진 요청을 이번에 함께 해결할 운영 과제 하나로 좁혀봅니다."
      }),
      pause: Object.freeze({
        label: "이어지지 않는 판단",
        title: "채널과 캠페인이 따로 움직이는 순간을 함께 봅니다.",
        detail: "도구를 더 붙이기 전에 어디에서 판단과 승인이 끊겼는지 확인합니다.",
        action: "먼저 해볼 일 · 채널과 콘텐츠의 우선순위를 한 순서로 연결하기",
        methodAction: "채널과 콘텐츠를\n한 순서로 연결하기",
        methodLive: "따로 움직이는 일을 하나의 우선순위와 승인 순서로 연결해봅니다."
      }),
      standard: Object.freeze({
        label: "팀의 브랜드 기준",
        title: "쉽게 말해도 팀이 지키는 브랜드 기준은 남깁니다.",
        detail: "협력사와 채널이 달라도 브랜드가 약속할 수 있는 범위를 먼저 확인합니다.",
        action: "먼저 해볼 일 · 팀과 협력사가 함께 쓸 판단 기준을 세 문장으로 고정하기",
        methodAction: "팀의 판단 기준을\n세 문장으로 고정하기",
        methodLive: "팀과 협력사가 같은 기준으로 검토할 수 있게 정리합니다."
      })
    })
  });
  const evidence = evidenceByAudience[body.dataset.audience] || evidenceByAudience.local;
  const teamAudience = body.dataset.audience === "team";

  const tones = ["#3867ff", "#5b7cff", "#ff6f78", "#ff9ab2", "#9aa3b4"];
  const heroDots = [];
  const methodDots = [];
  const fieldSignals = [...document.querySelectorAll("[data-field-signal]")];
  const methodLayouts = { question: [], pause: [], standard: [] };
  let pinnedSignal = "";
  let revealOpener = null;
  let suppressSignalFocusPreview = false;
  let heroVisible = true;
  let methodVisible = false;
  let heroFrame = 0;
  let methodFrame = 0;

  function buildHeroDots() {
    for (let index = 0; index < 64; index += 1) {
      const dot = document.createElement("i");
      const x = 6 + ((index * 41) % 88);
      const y = 8 + ((index * 57) % 82);
      const size = 2.5 + (index % 4) * 1.35;
      dot.dataset.x = String(x);
      dot.dataset.y = String(y);
      dot.style.left = `${x}%`;
      dot.style.top = `${y}%`;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.background = tones[index % tones.length];
      dot.style.opacity = String(0.2 + (index % 5) * 0.1);
      dotRoot.append(dot);
      heroDots.push(dot);
    }
  }

  function buildMethodDots() {
    for (let index = 0; index < 48; index += 1) {
      const dot = document.createElement("i");
      const row = Math.floor(index / 8);
      const column = index % 8;
      methodLayouts.question.push({ x: 24 + column * 23 + Math.sin(index * 0.8) * 5, y: 44 + row * 29 + Math.cos(index) * 4 });
      methodLayouts.pause.push({ x: 45 + (index % 6) * 24 + Math.sin(index * 1.2) * 6, y: 34 + Math.floor(index / 6) * 23 });
      methodLayouts.standard.push({ x: 104 + Math.cos(index * 0.72) * (30 + (index % 6) * 8), y: 112 + Math.sin(index * 0.72) * (24 + (index % 5) * 8) });
      dot.style.width = `${3 + (index % 3) * 1.5}px`;
      dot.style.height = dot.style.width;
      dot.style.background = tones[index % tones.length];
      dot.style.opacity = String(0.34 + (index % 4) * 0.15);
      methodDotRoot.append(dot);
      methodDots.push(dot);
    }
  }

  function motionAllowed() {
    return finePointer.matches && !reduceMotion.matches && !forcedReduced && !forcedCoarse;
  }

  function setEvidence(mode, source) {
    if (!evidence[mode]) return;
    const copy = evidence[mode];
    hero.dataset.reveal = mode;
    evidenceReveal.setAttribute("aria-hidden", "false");
    document.querySelector("[data-evidence-label]").textContent = copy.label;
    document.querySelector("[data-evidence-title]").textContent = copy.title;
    document.querySelector("[data-evidence-detail]").textContent = copy.detail;
    document.querySelector("[data-evidence-action]").textContent = copy.action;
    fieldSignals.forEach((button) => {
      button.setAttribute("aria-expanded", String(button.dataset.fieldSignal === mode));
    });
    if (source === "keyboard") hero.dataset.keyboardChange = "true";
    window.requestAnimationFrame(() => delete hero.dataset.keyboardChange);
  }

  function closeEvidence(options = {}) {
    pinnedSignal = "";
    hero.dataset.reveal = "none";
    evidenceReveal.setAttribute("aria-hidden", "true");
    fieldSignals.forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (options.restoreFocus && revealOpener) {
      suppressSignalFocusPreview = true;
      revealOpener.focus({ preventScroll: true });
      window.requestAnimationFrame(() => { suppressSignalFocusPreview = false; });
    }
  }

  function previewEvidence(mode, source) {
    if (pinnedSignal) return;
    setEvidence(mode, source);
  }

  function clearPreview() {
    if (!pinnedSignal) {
      hero.dataset.reveal = "none";
      evidenceReveal.setAttribute("aria-hidden", "true");
      fieldSignals.forEach((button) => button.setAttribute("aria-expanded", "false"));
    }
  }

  function placeMethodDots(mode, source) {
    if (source === "keyboard") method.dataset.keyboardChange = "true";
    methodDots.forEach((dot, index) => {
      const point = methodLayouts[mode][index];
      dot.dataset.x = String(point.x);
      dot.dataset.y = String(point.y);
      dot.style.transform = `translate3d(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px, 0)`;
    });
    if (source === "keyboard") window.requestAnimationFrame(() => delete method.dataset.keyboardChange);
  }

  function selectMethod(mode, source) {
    if (!evidence[mode]) return;
    method.dataset.methodActive = mode;
    document.querySelectorAll("[data-method-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.methodChoice === mode));
    });
    document.querySelector("[data-method-action]").innerHTML = evidence[mode].methodAction.replace("\n", "<br />");
    document.querySelector("[data-method-live]").textContent = evidence[mode].methodLive;
    placeMethodDots(mode, source);
  }

  function togglePinnedSignal(button, source) {
    const mode = button.dataset.fieldSignal;
    revealOpener = button;
    if (pinnedSignal === mode) {
      closeEvidence({ restoreFocus: false });
      return;
    }
    pinnedSignal = mode;
    setEvidence(mode, source);
    selectMethod(mode, source);
  }

  function updateProximity(event) {
    if (!motionAllowed() || !heroVisible || heroFrame) return;
    heroFrame = window.requestAnimationFrame(() => {
      const bounds = editorial.getBoundingClientRect();
      const pointerX = event.clientX - bounds.left;
      const pointerY = event.clientY - bounds.top;
      editorial.dataset.pointer = "active";
      editorial.style.setProperty("--pointer-x", `${pointerX.toFixed(1)}px`);
      editorial.style.setProperty("--pointer-y", `${pointerY.toFixed(1)}px`);

      heroDots.forEach((dot) => {
        const x = Number(dot.dataset.x) * bounds.width / 100;
        const y = Number(dot.dataset.y) * bounds.height / 100;
        const deltaX = x - pointerX;
        const deltaY = y - pointerY;
        const distance = Math.hypot(deltaX, deltaY);
        if (distance < 132) {
          const shift = (132 - distance) / 132 * 8;
          const safeDistance = Math.max(distance, 1);
          dot.style.transform = `translate3d(${(deltaX / safeDistance * shift).toFixed(2)}px, ${(deltaY / safeDistance * shift).toFixed(2)}px, 0)`;
          dot.dataset.near = "true";
        } else {
          dot.style.transform = "";
          dot.dataset.near = "false";
        }
      });

      heroFrame = 0;
    });
  }

  function resetProximity() {
    editorial.dataset.pointer = "idle";
    heroDots.forEach((dot) => {
      dot.style.transform = "";
      dot.dataset.near = "false";
    });
    fieldSignals.forEach((button) => delete button.dataset.proximate);
    clearPreview();
  }

  function updateMethodPointer(event) {
    if (!motionAllowed() || !methodVisible || methodFrame) return;
    methodFrame = window.requestAnimationFrame(() => {
      const rect = methodAtlas.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 4;
      methodDots.forEach((dot, index) => {
        const depth = 0.18 + (index % 5) * 0.1;
        const x = Number(dot.dataset.x) + offsetX * depth;
        const y = Number(dot.dataset.y) + offsetY * depth;
        dot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });
      methodFrame = 0;
    });
  }

  function openMenu() {
    mobileMenu.hidden = false;
    menuTrigger.setAttribute("aria-expanded", "true");
    body.dataset.menuOpen = "true";
    document.querySelector("main").setAttribute("inert", "");
    document.querySelector("footer").setAttribute("inert", "");
    mobileMenu.querySelector("a").focus();
  }

  function closeMenu(options = {}) {
    mobileMenu.hidden = true;
    menuTrigger.setAttribute("aria-expanded", "false");
    delete body.dataset.menuOpen;
    document.querySelector("main").removeAttribute("inert");
    document.querySelector("footer").removeAttribute("inert");
    if (options.restoreFocus) menuTrigger.focus();
  }

  function trapMenuFocus(event) {
    if (event.key !== "Tab" || mobileMenu.hidden) return;
    const items = [menuTrigger, ...mobileMenu.querySelectorAll("a")];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const fitSection = document.querySelector("[data-depth-section='fit']");
  const selectedFit = new Set();

  function markKeyboardChange(container) {
    container.dataset.keyboardChange = "true";
    window.requestAnimationFrame(() => delete container.dataset.keyboardChange);
  }

  function updateFitMap(source) {
    const count = selectedFit.size;
    const fitMap = document.querySelector("[data-fit-map]");
    fitMap.dataset.count = String(count);
    document.querySelector("[data-fit-count]").textContent = `선택 ${count} / 3`;
    document.querySelectorAll("[data-fit-node]").forEach((node) => node.dataset.selected = String(selectedFit.has(node.dataset.fitNode)));
    const summaries = teamAudience ? [
      "가까운 문장을 고르면 파일럿에서 확인할 지점이 여기에 표시됩니다.",
      "고른 한 가지를 첫 파일럿 대화에서 구체적으로 살펴볼 수 있습니다.",
      "두 가지가 가깝습니다. 근거와 우선순위 중 무엇부터 볼지 정해봅니다.",
      "세 가지 모두 가깝습니다. 근거·우선순위·승인 경계를 함께 확인해봅니다."
    ] : [
      "가까운 문장을 고르면 첫 대화에서 살펴볼 내용이 여기에 표시됩니다.",
      "고른 한 가지를 첫 대화에서 구체적으로 살펴볼 수 있습니다.",
      "두 가지가 가깝습니다. 설명과 우선순위 중 무엇부터 볼지 정해봅니다.",
      "세 가지 모두 가깝습니다. 설명·우선순위·대표 결정을 함께 보는 방식이 맞습니다."
    ];
    document.querySelector("[data-fit-summary]").textContent = summaries[count];
    if (source === "keyboard") markKeyboardChange(fitSection);
  }

  function toggleFit(button, source) {
    const mode = button.dataset.fitCard;
    if (selectedFit.has(mode)) selectedFit.delete(mode);
    else selectedFit.add(mode);
    button.setAttribute("aria-pressed", String(selectedFit.has(mode)));
    button.querySelector("small").textContent = selectedFit.has(mode) ? "선택됨" : "선택";
    updateFitMap(source);
  }

  document.querySelectorAll("[data-fit-card]").forEach((button) => {
    button.addEventListener("click", (event) => toggleFit(button, event.detail === 0 ? "keyboard" : "pointer"));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleFit(button, "keyboard");
    });
  });

  const depthSections = [...document.querySelectorAll("[data-depth-section]")];
  depthSections.forEach((section) => section.dataset.motionReady = "true");

  buildHeroDots();
  buildMethodDots();
  placeMethodDots("question", "initial");

  fieldSignals.forEach((button) => {
    const mode = button.dataset.fieldSignal;
    button.addEventListener("pointerenter", () => {
      if (!motionAllowed()) return;
      fieldSignals.forEach((candidate) => delete candidate.dataset.proximate);
      button.dataset.proximate = "true";
    });
    button.addEventListener("pointerleave", () => {
      delete button.dataset.proximate;
      if (!button.matches(":focus-visible")) clearPreview();
    });
    button.addEventListener("focus", () => {
      if (!suppressSignalFocusPreview) previewEvidence(mode, "keyboard");
    });
    button.addEventListener("blur", clearPreview);
    button.addEventListener("click", (event) => togglePinnedSignal(button, event.detail === 0 ? "keyboard" : "pointer"));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      togglePinnedSignal(button, "keyboard");
    });
  });

  document.querySelectorAll("[data-method-choice]").forEach((button) => {
    button.addEventListener("click", (event) => selectMethod(button.dataset.methodChoice, event.detail === 0 ? "keyboard" : "pointer"));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      selectMethod(button.dataset.methodChoice, "keyboard");
    });
  });

  evidenceClose.addEventListener("click", () => {
    closeEvidence({ restoreFocus: true });
    resetProximity();
  });
  editorial.addEventListener("pointermove", updateProximity, { passive: true });
  editorial.addEventListener("pointerleave", resetProximity);
  editorial.addEventListener("focusout", (event) => {
    if (!editorial.contains(event.relatedTarget)) resetProximity();
  });
  methodAtlas.addEventListener("pointermove", updateMethodPointer, { passive: true });
  methodAtlas.addEventListener("pointerleave", () => placeMethodDots(method.dataset.methodActive, "pointer"));

  menuTrigger.addEventListener("click", () => {
    if (mobileMenu.hidden) openMenu();
    else closeMenu({ restoreFocus: true });
  });
  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu({ restoreFocus: false });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !mobileMenu.hidden) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }
    if (event.key === "Escape" && hero.dataset.reveal !== "none") {
      event.preventDefault();
      closeEvidence({ restoreFocus: true });
      resetProximity();
      return;
    }
    trapMenuFocus(event);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === method) methodVisible = entry.isIntersecting;
      });
    }, { threshold: 0.04 });
    observer.observe(hero);
    observer.observe(method);

    const depthObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.inview = "true";
        depthObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    depthSections.forEach((section) => depthObserver.observe(section));
  } else {
    methodVisible = true;
    depthSections.forEach((section) => section.dataset.inview = "true");
  }

  reduceMotion.addEventListener?.("change", () => {
    resetProximity();
    placeMethodDots(method.dataset.methodActive, "initial");
  });
})();
