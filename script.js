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

  const evidence = Object.freeze({
    question: Object.freeze({
      label: "반복 질문",
      title: "같은 질문에는 설명이 필요한 순간이 있습니다.",
      detail: "한 번의 인상보다 같은 맥락에서 되풀이되는 말을 먼저 확인합니다.",
      action: "다음 단서 · 처음 고르는 기준을 한 장으로 설명하기",
      methodAction: "처음 고르는 기준을\n한 장으로 설명하기",
      methodLive: "반복 질문을 ‘처음 고르는 기준’ 설명으로 바꿔볼 차례입니다."
    }),
    pause: Object.freeze({
      label: "머뭇한 장면",
      title: "잠시 멈춘 손도 선택의 신호입니다.",
      detail: "결정을 재촉하기보다 어떤 순서와 말이 막혔는지 장면을 다시 봅니다.",
      action: "다음 단서 · 첫 화면의 선택 순서를 세 단계로 줄이기",
      methodAction: "메뉴 첫 화면의\n선택 순서 줄이기",
      methodLive: "머뭇한 장면을 더 짧고 분명한 선택 순서로 바꿔봅니다."
    }),
    standard: Object.freeze({
      label: "브랜드 기준",
      title: "쉽게 말해도 대표님의 기준은 지킵니다.",
      detail: "더 세게 말하는 대신 브랜드가 약속할 수 있는 범위 안에서 설명합니다.",
      action: "다음 단서 · 쉽게 설명하는 세 문장을 브랜드 기준으로 고정하기",
      methodAction: "브랜드의 쉬운 말투를\n세 문장으로 고정하기",
      methodLive: "대표님이 지키는 기준을 다음 설명에서도 흔들리지 않게 정리합니다."
    })
  });

  const tones = ["#3867ff", "#5b7cff", "#ff6f78", "#ff9ab2", "#9aa3b4"];
  const heroDots = [];
  const methodDots = [];
  const methodLayouts = { question: [], pause: [], standard: [] };
  let pinnedSignal = "";
  let revealOpener = null;
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
    document.querySelectorAll("[data-field-signal]").forEach((button) => {
      button.setAttribute("aria-expanded", String(button.dataset.fieldSignal === mode));
    });
    if (source === "keyboard") hero.dataset.keyboardChange = "true";
    window.requestAnimationFrame(() => delete hero.dataset.keyboardChange);
  }

  function closeEvidence(options = {}) {
    pinnedSignal = "";
    hero.dataset.reveal = "none";
    evidenceReveal.setAttribute("aria-hidden", "true");
    document.querySelectorAll("[data-field-signal]").forEach((button) => button.setAttribute("aria-expanded", "false"));
    if (options.restoreFocus && revealOpener) revealOpener.focus();
  }

  function previewEvidence(mode, source) {
    if (pinnedSignal) return;
    setEvidence(mode, source);
  }

  function clearPreview() {
    if (!pinnedSignal) {
      hero.dataset.reveal = "none";
      evidenceReveal.setAttribute("aria-hidden", "true");
      document.querySelectorAll("[data-field-signal]").forEach((button) => button.setAttribute("aria-expanded", "false"));
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

      let nearest = null;
      let nearestDistance = Infinity;
      document.querySelectorAll("[data-field-signal]").forEach((button) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left - bounds.left + rect.width / 2;
        const centerY = rect.top - bounds.top + rect.height / 2;
        const distance = Math.hypot(centerX - pointerX, centerY - pointerY);
        button.dataset.proximate = "false";
        if (distance < nearestDistance) {
          nearest = button;
          nearestDistance = distance;
        }
      });
      if (nearest && nearestDistance < 190) nearest.dataset.proximate = "true";
      heroFrame = 0;
    });
  }

  function resetProximity() {
    editorial.dataset.pointer = "idle";
    heroDots.forEach((dot) => {
      dot.style.transform = "";
      dot.dataset.near = "false";
    });
    document.querySelectorAll("[data-field-signal]").forEach((button) => button.dataset.proximate = "false");
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

  const operatingCopy = Object.freeze({
    observe: Object.freeze({
      label: "현장을 함께 봅니다",
      title: "사실, 시장 신호, 오노랩의 해석을 같은 무게로 섞지 않습니다.",
      copy: "시장·리뷰·고객 질문을 출처와 시점이 보이게 정리해, 무엇을 확인했고 무엇은 아직 가설인지 나눕니다."
    }),
    decide: Object.freeze({
      label: "한 행동을 설명합니다",
      title: "왜 지금 이 행동인지, 무엇을 보류할지 함께 말합니다.",
      copy: "브랜드의 기준과 사용할 수 있는 시간 안에서 행동 하나를 제안합니다. 채택·수정·진행하지 않음은 대표님이 정합니다."
    }),
    learn: Object.freeze({
      label: "결과를 다시 봅니다",
      title: "승인된 범위만 움직이고 관찰된 변화를 다음 판단에 씁니다.",
      copy: "실행 전 기준과 실제로 관찰된 변화를 나눠 기록합니다. 자동 게시와 성과 보장은 운영 동행의 범위가 아닙니다."
    })
  });

  const proofCopy = Object.freeze({
    applied: Object.freeze({
      label: "지금 적용하는 기준",
      title: "사실과 해석, 사람의 결정을 나눕니다.",
      copy: "출처와 한계, 브랜드 기준, 공개·연락·비용의 사람 확인을 매번 남깁니다.",
      list: ["확인한 사실과 해석 구분", "브랜드가 지키는 기준 확인", "외부 행동 전 사람 결정"]
    }),
    testing: Object.freeze({
      label: "지금 검증하는 범위",
      title: "실제 한 사이클이 다음 판단에 도움이 되는지 확인합니다.",
      copy: "한 행동을 고르고 수정해 실행한 뒤, 관찰된 결과를 다음 선택에 쓰는 과정은 아직 검증 중입니다.",
      list: ["실제 고객 한 사이클", "행동 채택과 수정 과정", "결과를 다음 판단에 쓰는 방식"]
    }),
    unclaimed: Object.freeze({
      label: "아직 공개하지 않는 것",
      title: "확인하지 않은 성과를 먼저 채우지 않습니다.",
      copy: "고객 매출·순위·방문 증가와 무인 운영, 자동 수익은 현재 성과로 말하지 않습니다.",
      list: ["고객 매출·순위 성과", "무인 운영과 자동 수익", "검증되지 않은 미래 상품"]
    })
  });

  const noteCopy = Object.freeze({
    signal: Object.freeze({ title: "무엇이 달라졌는지 먼저 확인합니다.", copy: "같은 맥락에서 반복되는 변화인지, 한 번의 인상인지 나눠 적습니다." }),
    scope: Object.freeze({ title: "누구에게 중요한지 범위를 좁힙니다.", copy: "모든 매장에 일반화하지 않고, 어떤 상황과 브랜드에 해당하는지 함께 남깁니다." }),
    action: Object.freeze({ title: "읽고 끝나지 않도록 다음 확인을 둡니다.", copy: "바로 실행할 명령이 아니라, 이번 주 무엇을 더 확인할지 한 가지 행동 후보를 기록합니다." }),
    evidence: Object.freeze({ title: "출처와 확인 시점, 한계를 붙입니다.", copy: "공식 사실, 시장 신호, 오노랩의 해석이 어디까지인지 나눠 다음 판단에서 다시 볼 수 있게 합니다." })
  });

  const flowCopy = Object.freeze({
    context: Object.freeze({ index: "01 / 기준 듣기", title: "매장이 꼭 지키고 싶은 이유부터 듣습니다.", copy: "무엇을 더 만들지보다 어떤 경험과 약속을 흔들지 않을지 먼저 확인합니다." }),
    scene: Object.freeze({ index: "02 / 장면 고르기", title: "최근 가장 자주 걸린 한 장면을 고릅니다.", copy: "리뷰, 고객 질문, 메뉴 앞의 망설임 가운데 지금 판단에 가장 가까운 장면 하나를 봅니다." }),
    action: Object.freeze({ index: "03 / 행동 설명", title: "첫 행동 후보와 지금 보류할 일을 함께 설명합니다.", copy: "왜 이 행동인지, 어디까지 준비할지, 무엇은 아직 하지 않을지 한 화면에서 확인합니다." }),
    decision: Object.freeze({ index: "04 / 함께 정하기", title: "진행, 수정, 멈춤을 서로 다른 선택으로 남깁니다.", copy: "상담 참여가 제작·업로드·공개 승인이 되지 않도록 다음 결정의 범위를 분리합니다." })
  });

  const operatingSection = document.querySelector("[data-depth-section='partnership']");
  const proofSection = document.querySelector("[data-depth-section='proof']");
  const noteSection = document.querySelector("[data-depth-section='note']");
  const fitSection = document.querySelector("[data-depth-section='fit']");
  const firstFlow = document.querySelector("[data-first-flow]");
  const noteMatrix = document.querySelector("[data-note-matrix]");
  const selectedFit = new Set();
  let operatingPinned = "observe";
  let proofPinned = "applied";
  let notePinned = "signal";

  function markKeyboardChange(container) {
    container.dataset.keyboardChange = "true";
    window.requestAnimationFrame(() => delete container.dataset.keyboardChange);
  }

  function activateOperating(mode, source, pin) {
    if (!operatingCopy[mode]) return;
    if (pin) operatingPinned = mode;
    operatingSection.dataset.operatingActive = mode;
    document.querySelectorAll("[data-operating-card]").forEach((button) => {
      button.setAttribute("aria-expanded", String(button.dataset.operatingCard === mode));
    });
    document.querySelector("[data-operating-label]").textContent = operatingCopy[mode].label;
    document.querySelector("[data-operating-title]").textContent = operatingCopy[mode].title;
    document.querySelector("[data-operating-copy]").textContent = operatingCopy[mode].copy;
    if (source === "keyboard") markKeyboardChange(operatingSection);
  }

  function activateProof(mode, source, pin) {
    if (!proofCopy[mode]) return;
    if (pin) proofPinned = mode;
    proofSection.dataset.proofActive = mode;
    document.querySelectorAll("[data-proof-state]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.proofState === mode));
    });
    document.querySelector("[data-proof-label]").textContent = proofCopy[mode].label;
    document.querySelector("[data-proof-title]").textContent = proofCopy[mode].title;
    document.querySelector("[data-proof-copy]").textContent = proofCopy[mode].copy;
    document.querySelector("[data-proof-list]").replaceChildren(...proofCopy[mode].list.map((item) => {
      const node = document.createElement("li");
      node.textContent = item;
      return node;
    }));
    if (source === "keyboard") markKeyboardChange(proofSection);
  }

  function activateNote(mode, source, pin) {
    if (!noteCopy[mode]) return;
    if (pin) notePinned = mode;
    noteSection.dataset.noteActive = mode;
    document.querySelectorAll("[data-note-field]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.noteField === mode));
    });
    document.querySelector("[data-note-field-title]").textContent = noteCopy[mode].title;
    document.querySelector("[data-note-field-copy]").textContent = noteCopy[mode].copy;
    if (source === "keyboard") markKeyboardChange(noteSection);
  }

  function updateFitMap(source) {
    const count = selectedFit.size;
    const fitMap = document.querySelector("[data-fit-map]");
    fitMap.dataset.count = String(count);
    document.querySelector("[data-fit-count]").textContent = `선택 ${count} / 3`;
    document.querySelectorAll("[data-fit-node]").forEach((node) => node.dataset.selected = String(selectedFit.has(node.dataset.fitNode)));
    const summaries = [
      "가까운 문장을 선택하면, 함께 확인할 지점이 연결됩니다.",
      "선택한 한 지점을 첫 대화에서 구체적으로 확인할 수 있습니다.",
      "두 지점이 연결됐습니다. 무엇부터 볼지 한 행동으로 좁혀봅니다.",
      "세 지점이 연결됐습니다. 맥락·집중·사람 결정을 함께 보는 방식과 가깝습니다."
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

  function activateFlow(mode, source) {
    if (!flowCopy[mode]) return;
    firstFlow.dataset.flowActive = mode;
    document.querySelectorAll("[data-flow-step]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.flowStep === mode));
    });
    document.querySelector("[data-flow-index]").textContent = flowCopy[mode].index;
    document.querySelector("[data-flow-title]").textContent = flowCopy[mode].title;
    document.querySelector("[data-flow-copy]").textContent = flowCopy[mode].copy;
    if (source === "keyboard") markKeyboardChange(firstFlow);
  }

  for (let index = 0; index < 42; index += 1) {
    const dot = document.createElement("i");
    dot.style.left = `${7 + ((index * 47) % 87)}%`;
    dot.style.top = `${8 + ((index * 61) % 84)}%`;
    dot.style.background = tones[index % tones.length];
    dot.style.opacity = String(.18 + (index % 4) * .1);
    noteMatrix.append(dot);
  }

  document.querySelectorAll("[data-operating-card]").forEach((button) => {
    const mode = button.dataset.operatingCard;
    button.addEventListener("pointerenter", () => { if (finePointer.matches) activateOperating(mode, "pointer", false); });
    button.addEventListener("pointerleave", () => { if (!button.matches(":focus-visible")) activateOperating(operatingPinned, "pointer", false); });
    button.addEventListener("focus", () => activateOperating(mode, "keyboard", false));
    button.addEventListener("blur", () => activateOperating(operatingPinned, "keyboard", false));
    button.addEventListener("click", (event) => activateOperating(mode, event.detail === 0 ? "keyboard" : "pointer", true));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateOperating(mode, "keyboard", true);
    });
  });

  document.querySelectorAll("[data-proof-state]").forEach((button) => {
    const mode = button.dataset.proofState;
    button.addEventListener("pointerenter", () => { if (finePointer.matches) activateProof(mode, "pointer", false); });
    button.addEventListener("pointerleave", () => { if (!button.matches(":focus-visible")) activateProof(proofPinned, "pointer", false); });
    button.addEventListener("focus", () => activateProof(mode, "keyboard", false));
    button.addEventListener("blur", () => activateProof(proofPinned, "keyboard", false));
    button.addEventListener("click", (event) => activateProof(mode, event.detail === 0 ? "keyboard" : "pointer", true));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateProof(mode, "keyboard", true);
    });
  });

  document.querySelectorAll("[data-note-field]").forEach((button) => {
    const mode = button.dataset.noteField;
    button.addEventListener("pointerenter", () => { if (finePointer.matches) activateNote(mode, "pointer", false); });
    button.addEventListener("pointerleave", () => { if (!button.matches(":focus-visible")) activateNote(notePinned, "pointer", false); });
    button.addEventListener("focus", () => activateNote(mode, "keyboard", false));
    button.addEventListener("blur", () => activateNote(notePinned, "keyboard", false));
    button.addEventListener("click", (event) => activateNote(mode, event.detail === 0 ? "keyboard" : "pointer", true));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateNote(mode, "keyboard", true);
    });
  });

  document.querySelectorAll("[data-fit-card]").forEach((button) => {
    button.addEventListener("click", (event) => toggleFit(button, event.detail === 0 ? "keyboard" : "pointer"));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleFit(button, "keyboard");
    });
  });

  document.querySelectorAll("[data-flow-step]").forEach((button) => {
    const mode = button.dataset.flowStep;
    button.addEventListener("focus", () => activateFlow(mode, "keyboard"));
    button.addEventListener("click", (event) => activateFlow(mode, event.detail === 0 ? "keyboard" : "pointer"));
    button.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateFlow(mode, "keyboard");
    });
  });

  const depthSections = [...document.querySelectorAll("[data-depth-section]")];
  depthSections.forEach((section) => section.dataset.motionReady = "true");

  buildHeroDots();
  buildMethodDots();
  placeMethodDots("question", "initial");

  document.querySelectorAll("[data-field-signal]").forEach((button) => {
    const mode = button.dataset.fieldSignal;
    button.addEventListener("pointerenter", () => {
      if (finePointer.matches) previewEvidence(mode, "pointer");
    });
    button.addEventListener("pointerleave", () => {
      if (!button.matches(":focus-visible")) clearPreview();
    });
    button.addEventListener("focus", () => previewEvidence(mode, "keyboard"));
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

  evidenceClose.addEventListener("click", () => closeEvidence({ restoreFocus: true }));
  editorial.addEventListener("pointermove", updateProximity, { passive: true });
  editorial.addEventListener("pointerleave", resetProximity);
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
