const root = document.documentElement;
const header = document.querySelector(".site-header");
const tabs = [...document.querySelectorAll(".stage-tab")];
const stageImages = [...document.querySelectorAll("[data-stage-image]")];
const stageCopies = [...document.querySelectorAll("[data-stage-copy]")];
const revealTargets = [
  ...document.querySelectorAll(".work-card, .path-card, .insight-card"),
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (reduceMotion) document.body.classList.add("no-motion");

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
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.18 },
  );

  for (const target of revealTargets) observer.observe(target);
} else {
  for (const target of revealTargets) target.classList.add("is-visible");
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
