(function () {
  "use strict";

  const root = document.querySelector("[data-entry-diagnosis]");
  if (!root) return;

  const form = root.querySelector("[data-entry-form]");
  const submitButton = form.querySelector('button[type="submit"]');
  const result = root.querySelector("[data-entry-result]");
  const resultGrid = root.querySelector("[data-entry-result-grid]");
  const stateLabel = root.querySelector("[data-entry-result-state]");
  const brandOutput = root.querySelector("[data-entry-result-brand]");
  const keywordOutput = root.querySelector("[data-entry-result-keyword]");
  const boundary = root.querySelector("[data-entry-result-boundary]");
  const resultAction = root.querySelector("[data-entry-result-action]");
  const formError = root.querySelector("[data-entry-form-error]");
  const resetButton = root.querySelector("[data-entry-reset]");
  const dialog = root.querySelector("[data-entry-room-dialog]");
  const roomBrand = root.querySelector("[data-entry-room-brand]");
  const serviceStatus = root.querySelector("[data-entry-service-status]");
  const example = root.querySelector("[data-entry-example]");
  const exampleTrigger = root.querySelector("[data-entry-example-trigger]");
  const examplePreview = root.querySelector("[data-entry-example-preview]");
  const exampleClose = root.querySelector("[data-entry-example-close]");
  const exampleApply = root.querySelector("[data-entry-example-apply]");
  const defaultSubmitLabel = submitButton.textContent;
  let dialogOpener = null;
  let examplePinned = false;

  const safeText = (value, max) =>
    String(value || "").normalize("NFC").trim().replace(/\s+/g, " ").slice(0, max);

  const statusCopy = Object.freeze({
    READY: Object.freeze({
      label: "조회 완료",
      action: "확인 결과로 다음 점검 항목 보기",
      actionType: "room"
    }),
    PARTIAL: Object.freeze({
      label: "일부 범위 확인",
      action: "확인 결과로 다음 점검 항목 보기",
      actionType: "room"
    }),
    NOT_MEASURED: Object.freeze({
      label: "확인 가능한 자료 없음",
      action: "입력을 바꿔 다시 확인하기",
      actionType: "retry"
    }),
    PREVIEW_ONLY: Object.freeze({
      label: "예시 화면 · 실제 조회 결과 아님",
      action: "이용 흐름 살펴보기",
      actionType: "room"
    }),
    RATE_LIMITED: Object.freeze({
      label: "잠시 뒤 다시 시도",
      action: "다시 확인하기",
      actionType: "retry"
    }),
    INVALID_INPUT: Object.freeze({
      label: "입력 확인 필요",
      action: "다시 입력하기",
      actionType: "retry"
    }),
    NOT_CONNECTED: Object.freeze({
      label: "현재 조회할 수 없음",
      action: "다시 확인하기",
      actionType: "retry"
    }),
    TEMPORARILY_UNAVAILABLE: Object.freeze({
      label: "현재 자료를 불러올 수 없음",
      action: "다시 확인하기",
      actionType: "retry"
    }),
    FORBIDDEN: Object.freeze({
      label: "요청 확인 필요",
      action: "다시 확인하기",
      actionType: "retry"
    })
  });

  function setServiceStatus(text, state) {
    if (!serviceStatus) return;
    serviceStatus.textContent = text;
    serviceStatus.dataset.state = state;
  }

  function showExamplePreview({ pinned = false } = {}) {
    if (!examplePreview || !exampleTrigger) return;
    examplePinned = pinned || examplePinned;
    examplePreview.hidden = false;
    root.dataset.exampleOpen = "true";
    form.setAttribute("inert", "");
    exampleTrigger.setAttribute("aria-expanded", "true");
  }

  function hideExamplePreview({ restoreFocus = false } = {}) {
    if (!examplePreview || !exampleTrigger) return;
    examplePinned = false;
    if (restoreFocus) exampleTrigger.focus({ preventScroll: true });
    examplePreview.hidden = true;
    delete root.dataset.exampleOpen;
    form.removeAttribute("inert");
    exampleTrigger.setAttribute("aria-expanded", "false");
  }

  function applyExample() {
    form.elements.namedItem("brand").value = "김밥천국";
    form.elements.namedItem("keyword").value = "부산 김밥";
    form.elements.namedItem("region").value = "부산 수영구";
    hideExamplePreview();
    form.elements.namedItem("brand").focus({ preventScroll: true });
  }

  function toggleExamplePreview() {
    if (!examplePreview || !exampleTrigger) return;
    if (!examplePreview.hidden && examplePinned) {
      hideExamplePreview({ restoreFocus: true });
      return;
    }
    showExamplePreview({ pinned: true });
    exampleClose?.focus({ preventScroll: true });
  }

  async function checkAdmission() {
    try {
      const [health, readiness] = await Promise.all([
        fetch("/healthz", { headers: { accept: "application/json" } }),
        fetch("/readyz", { headers: { accept: "application/json" } })
      ]);
      if (health.ok && readiness.ok) {
        setServiceStatus("지금 검색 상태를 확인할 수 있습니다.", "ready");
        return;
      }
      if (health.ok && readiness.status === 503) {
        setServiceStatus("입력 방법은 볼 수 있지만, 현재 검색 자료는 조회할 수 없습니다.", "hold");
        return;
      }
      setServiceStatus("지금은 조회할 수 없습니다. 잠시 뒤 다시 확인해 주세요.", "hold");
    } catch {
      setServiceStatus("조회 가능 여부를 확인하지 못했습니다. 잠시 뒤 다시 시도해 주세요.", "hold");
    }
  }

  function plainObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }

  function failureProjection(query, status = "TEMPORARILY_UNAVAILABLE") {
    return {
      status,
      query,
      observation: [],
      finding: [],
      recommendation: [],
      evidence: [],
      nextStep: status === "NOT_CONNECTED"
        ? "현재는 조회할 수 없습니다. 잠시 뒤 다시 확인해 주세요."
        : "잠시 뒤 다시 확인해 주세요.",
      limitation: "확인된 자료가 없으면 순위나 성과를 추정해 표시하지 않습니다."
    };
  }

  function validateProjection(value, fallbackQuery) {
    if (!plainObject(value) || !statusCopy[value.status]) {
      return failureProjection(fallbackQuery);
    }
    const query = plainObject(value.query) ? {
      brand: safeText(value.query.brand, 60),
      keyword: safeText(value.query.keyword, 60),
      region: value.query.region === null ? null : safeText(value.query.region, 60)
    } : fallbackQuery;
    const arrays = ["observation", "finding", "recommendation", "evidence"];
    if (arrays.some((key) => !Array.isArray(value[key]) || value[key].length > 12)) {
      return failureProjection(query, value.status);
    }
    return {
      status: value.status,
      query,
      observation: value.observation,
      finding: value.finding,
      recommendation: value.recommendation,
      evidence: value.evidence,
      nextStep: safeText(value.nextStep, 600),
      limitation: safeText(value.limitation, 600)
    };
  }

  function card(label, title, detail) {
    return [
      label,
      safeText(title, 240) || "아직 확인된 내용이 없습니다.",
      safeText(detail, 360) || "확인되지 않은 내용을 임의로 채우지 않습니다."
    ];
  }

  function cardsFor(projection) {
    const observed = projection.observation.find((item) => item?.state === "attention") ||
      projection.observation.find((item) => item?.state === "confirmed") ||
      projection.observation[0];
    const finding = projection.finding[0];
    const recommendation = projection.recommendation[0];
    const evidence = projection.evidence[0];
    if (!observed && !finding && !recommendation && !evidence) {
      return [
        card("이번 조회 결과", "확인할 수 있는 검색 자료가 없습니다.", "자료가 없는 상태를 실제 결과처럼 표시하지 않습니다."),
        card("조회 조건과 한계", "순위·노출·경쟁 상태를 판단할 수 없습니다.", "확인된 자료가 없으면 결과를 추정하지 않습니다."),
        card("다음 점검 항목", projection.nextStep, "조회가 가능해지면 같은 매장명과 검색어로 다시 확인합니다."),
        card("근거와 확인 시각", "확인된 출처 없음", "근거가 없으면 순위나 성과를 예측하지 않습니다.")
      ];
    }
    return [
      card(
        "이번 조회 결과",
        observed?.statement,
        Array.isArray(observed?.limitations) ? observed.limitations[0] : projection.limitation
      ),
      card(
        "조회 조건과 한계",
        finding?.statement,
        finding ? "이번 조회에서 확인된 내용과 확인하지 못한 범위를 함께 표시합니다." : projection.limitation
      ),
      card(
        "다음 점검 항목",
        recommendation?.do || projection.nextStep,
        recommendation?.notPromised || projection.limitation
      ),
      card(
        "근거와 확인 시각",
        evidence?.source,
        evidence ? `${safeText(evidence.measurement, 160)} · ${safeText(evidence.limit, 180)}` : projection.limitation
      )
    ];
  }

  function renderCards(cards) {
    resultGrid.replaceChildren(...cards.map(([label, title, detail]) => {
      const article = document.createElement("article");
      article.className = "entry-result-card";
      const index = document.createElement("span");
      const heading = document.createElement("h4");
      const copy = document.createElement("p");
      index.textContent = label;
      heading.textContent = title;
      copy.textContent = detail;
      article.append(index, heading, copy);
      return article;
    }));
  }

  function renderProjection(projection) {
    const copy = statusCopy[projection.status] || statusCopy.TEMPORARILY_UNAVAILABLE;
    const query = projection.query || { brand: "입력한 브랜드", keyword: "입력한 검색어" };
    brandOutput.textContent = safeText(query.brand, 60);
    keywordOutput.textContent = `“${safeText(query.keyword, 60)}”`;
    stateLabel.textContent = copy.label;
    boundary.textContent = projection.limitation || projection.nextStep;
    resultAction.textContent = copy.action;
    resultAction.dataset.actionType = copy.actionType;
    roomBrand.textContent = safeText(query.brand, 60);
    renderCards(cardsFor(projection));
    form.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function showForm() {
    result.hidden = true;
    form.hidden = false;
    formError.hidden = true;
    form.querySelector("input").focus({ preventScroll: true });
  }

  async function submitDiagnosis(event) {
    event.preventDefault();
    const data = new FormData(form);
    const query = {
      brand: safeText(data.get("brand"), 60),
      keyword: safeText(data.get("keyword"), 60),
      region: safeText(data.get("region"), 60) || null
    };
    if (!query.brand || !query.keyword) {
      formError.textContent = "매장명과 손님이 검색할 말을 모두 입력해 주세요.";
      formError.hidden = false;
      form.querySelector("input:invalid")?.focus({ preventScroll: true });
      return;
    }

    formError.hidden = true;
    root.setAttribute("aria-busy", "true");
    submitButton.disabled = true;
    submitButton.textContent = "확인 중…";
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch("/api/entry-diagnosis", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify(query),
        signal: controller.signal
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : failureProjection(query);
      renderProjection(validateProjection(payload, query));
    } catch {
      renderProjection(failureProjection(query));
    } finally {
      window.clearTimeout(timer);
      root.removeAttribute("aria-busy");
      submitButton.disabled = false;
      submitButton.textContent = defaultSubmitLabel;
    }
  }

  form.addEventListener("submit", submitDiagnosis);
  resetButton.addEventListener("click", showForm);

  if (example && exampleTrigger && examplePreview) {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    example.addEventListener("pointerenter", () => {
      if (finePointer.matches) showExamplePreview();
    });
    example.addEventListener("pointerleave", () => {
      if (finePointer.matches && !examplePinned && !example.contains(document.activeElement)) {
        hideExamplePreview();
      }
    });
    example.addEventListener("focusin", () => showExamplePreview());
    example.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (!examplePinned && !example.contains(document.activeElement)) hideExamplePreview();
      }, 0);
    });
    exampleTrigger.addEventListener("click", toggleExamplePreview);
    exampleTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleExamplePreview();
      }
    });
    exampleClose?.addEventListener("click", () => hideExamplePreview({ restoreFocus: true }));
    exampleApply?.addEventListener("click", applyExample);
    example.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !examplePreview.hidden) {
        event.preventDefault();
        hideExamplePreview({ restoreFocus: true });
      }
    });
  }

  resultAction.addEventListener("click", () => {
    if (resultAction.dataset.actionType === "retry") {
      showForm();
      return;
    }
    dialogOpener = resultAction;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });

  root.querySelectorAll("[data-entry-dialog-close]").forEach((button) => {
    button.addEventListener("click", () => {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      if (!dialog.open) dialogOpener?.focus({ preventScroll: true });
    });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    dialogOpener?.focus({ preventScroll: true });
  });

  checkAdmission();
})();
