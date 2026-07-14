const root = document.documentElement;
const header = document.querySelector(".site-header");
const tabs = [...document.querySelectorAll(".stage-tab")];
const stageImages = [...document.querySelectorAll("[data-stage-image]")];
const stageCopies = [...document.querySelectorAll("[data-stage-copy]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (reduceMotion) document.body.classList.add("no-motion");

let revealObserver = null;

function observeRevealTargets(scope = document) {
  const targets = [...scope.querySelectorAll(".work-card, .path-card, .insight-card")];

  if (!revealObserver) {
    for (const target of targets) target.classList.add("is-visible");
    return;
  }

  for (const target of targets) revealObserver.observe(target);
}

function updateHeader() {
  if (!header) return;
  header.dataset.scrolled = window.scrollY > 12 ? "true" : "false";
}

function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  root.style.setProperty("--scroll-progress", String(Math.min(1, Math.max(0, progress))));
}

function setStage(id) {
  for (const tab of tabs) tab.classList.toggle("is-active", tab.dataset.stage === id);
  for (const image of stageImages) image.classList.toggle("is-active", image.dataset.stageImage === id);
  for (const copy of stageCopies) copy.classList.toggle("is-active", copy.dataset.stageCopy === id);
}

for (const tab of tabs) {
  tab.addEventListener("click", () => setStage(tab.dataset.stage));
}

if (!reduceMotion && finePointer) {
  window.addEventListener(
    "pointermove",
    (event) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    },
    { passive: true },
  );
}

if ("IntersectionObserver" in window && !reduceMotion) {
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18 },
  );
}

observeRevealTargets();

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizePublishedInsight(value) {
  if (!value || typeof value !== "object") return null;

  const slug = cleanText(value.slug, 160);
  const title = cleanText(value.title, 160);
  const summary = cleanText(value.summary, 500);
  const area = cleanText(value.area, 80);
  const category = cleanText(value.category, 80);
  const publishedAt = cleanText(value.published_at, 40);
  const publishedDate = new Date(publishedAt);

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !title ||
    !summary ||
    !area ||
    !category ||
    Number.isNaN(publishedDate.getTime())
  ) {
    return null;
  }

  return { slug, title, summary, area, category, publishedAt, publishedDate };
}

function formatPublishedDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function createPublishedInsightCard(insight, index) {
  const card = document.createElement("a");
  card.className = `insight-card published-insight-card${index === 0 ? " insight-featured published-insight-featured" : ""}`;
  card.href = new URL(`/insights/${encodeURIComponent(insight.slug)}`, "https://app.onolab.kr").href;
  card.setAttribute("aria-label", `${insight.title} 인사이트 읽기`);

  const top = document.createElement("div");
  top.className = "published-insight-top";

  const number = document.createElement("span");
  number.className = "published-insight-number";
  number.textContent = String(index + 1).padStart(2, "0");

  const meta = document.createElement("span");
  meta.className = "published-insight-meta";
  meta.textContent = `${insight.area} · ${insight.category}`;
  top.append(number, meta);

  const label = document.createElement("span");
  label.className = "published-insight-label";
  label.textContent = index === 0 ? "LATEST FIELD NOTE" : "PUBLISHED INSIGHT";

  const title = document.createElement("h3");
  title.textContent = insight.title;

  const summary = document.createElement("p");
  summary.textContent = insight.summary;

  const footer = document.createElement("div");
  footer.className = "published-insight-footer";

  const time = document.createElement("time");
  time.dateTime = insight.publishedAt;
  time.textContent = formatPublishedDate(insight.publishedDate);

  const callToAction = document.createElement("span");
  callToAction.className = "published-insight-cta";
  callToAction.textContent = "읽기";
  callToAction.setAttribute("aria-hidden", "true");
  footer.append(time, callToAction);

  card.append(top, label, title, summary, footer);
  return card;
}

async function hydratePublishedInsights() {
  const grid = document.querySelector("[data-published-insights]");
  const config = window.ONOLAB_PUBLIC_DATA;
  if (!grid || !config?.url || !config?.anonKey) return;

  const endpoint = new URL("/rest/v1/onolab_insights", config.url);
  endpoint.search = new URLSearchParams({
    select: "slug,title,summary,area,category,published_at",
    status: "eq.published",
    order: "published_at.desc",
    limit: "3",
  }).toString();

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 4500);

  try {
    const response = await fetch(endpoint, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return;
    const values = await response.json();
    if (!Array.isArray(values) || values.length === 0) return;

    const insights = values
      .slice(0, 3)
      .map(normalizePublishedInsight)
      .filter(Boolean);
    if (insights.length === 0) return;

    const fragment = document.createDocumentFragment();
    for (const [index, insight] of insights.entries()) {
      fragment.append(createPublishedInsightCard(insight, index));
    }

    grid.replaceChildren(fragment);
    grid.dataset.mode = "published";
    grid.dataset.count = String(insights.length);
    observeRevealTargets(grid);
  } catch {
    // The designed platform cards remain visible when public data is unavailable.
  } finally {
    window.clearTimeout(timeoutId);
  }
}

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    updateScrollProgress();
  },
  { passive: true },
);

updateHeader();
updateScrollProgress();
hydratePublishedInsights();
