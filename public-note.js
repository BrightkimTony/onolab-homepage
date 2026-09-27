(function attachPublicNote(root, factory) {
  const contract = factory();
  if (typeof module === "object" && module.exports) module.exports = contract;
  if (!root) return;
  root.ONOLAB_PUBLIC_NOTE = Object.freeze(contract);
  if (!root.document) return;
  const start = () => contract.mountFromSameOrigin(root);
  if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})(typeof globalThis !== "undefined" ? globalThis : this, function createPublicNoteContract() {
  "use strict";

  const VERSION = "onolab.note-public-release.v1";
  const SNAPSHOT_KEYS = Object.freeze(["version", "generatedAt", "items"]);
  const ITEM_KEYS = Object.freeze([
    "slug", "title", "summary", "bodySections", "area", "category", "asOf",
    "sources", "limitations", "nextAction", "publishedAt",
  ]);
  const SOURCE_KEYS = Object.freeze(["label"]);
  const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
  const FORBIDDEN = /(?:https?:\/\/|file:|\/Users\/|(?:^|\s)(?:\.\.\/|[A-Za-z]:\\)|Bearer\s|PRIVATE KEY|service_role|sb_secret_|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:api[_-]?key|token|password|cookie|credential|tenant(?:Id|Ref)|brand(?:Id|Ref)|receipt|sha256|nonce|requestRef|candidateSha|contentSnapshot|internal[_-]?id)\b)/iu;
  const NOT_FOUND = Object.freeze({ status: 404, message: "요청한 기록을 찾을 수 없습니다." });

  function fail() {
    throw new TypeError("공개 기록을 표시할 수 없습니다.");
  }

  function exact(value, keys) {
    if (!value || typeof value !== "object" || Array.isArray(value) ||
        Object.getPrototypeOf(value) !== Object.prototype) fail();
    const actual = Object.keys(value).sort();
    const expected = [...keys].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) fail();
    return value;
  }

  function text(value, max) {
    if (typeof value !== "string" || !value.trim() || value.length > max ||
        /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value) || FORBIDDEN.test(value)) fail();
    return value.trim();
  }

  function dateTime(value) {
    if (typeof value !== "string" || !ISO.test(value) || !Number.isFinite(Date.parse(value))) fail();
    return value;
  }

  function source(value) {
    const item = exact(value, SOURCE_KEYS);
    return Object.freeze({ label: text(item.label, 160) });
  }

  function note(value) {
    const item = exact(value, ITEM_KEYS);
    if (typeof item.slug !== "string" || item.slug.length > 96 || !SLUG.test(item.slug)) fail();
    if (!Array.isArray(item.bodySections) || item.bodySections.length < 1 || item.bodySections.length > 8) fail();
    if (!Array.isArray(item.sources) || item.sources.length < 1 || item.sources.length > 8) fail();
    return Object.freeze({
      slug: item.slug,
      title: text(item.title, 140),
      summary: text(item.summary, 320),
      bodySections: Object.freeze(item.bodySections.map((section) => text(section, 1200))),
      area: text(item.area, 80),
      category: text(item.category, 80),
      asOf: dateTime(item.asOf),
      sources: Object.freeze(item.sources.map(source)),
      limitations: text(item.limitations, 500),
      nextAction: text(item.nextAction, 320),
      publishedAt: dateTime(item.publishedAt),
    });
  }

  function normalizeSnapshot(value) {
    const snapshot = exact(value, SNAPSHOT_KEYS);
    if (snapshot.version !== VERSION) fail();
    const generatedAt = dateTime(snapshot.generatedAt);
    if (!Array.isArray(snapshot.items) || snapshot.items.length > 50) fail();
    const items = snapshot.items.map(note);
    const slugs = new Set();
    let previous = null;
    for (const item of items) {
      if (slugs.has(item.slug)) fail();
      slugs.add(item.slug);
      if (previous && (item.publishedAt > previous.publishedAt ||
          (item.publishedAt === previous.publishedAt && item.slug < previous.slug))) fail();
      if (Date.parse(item.publishedAt) > Date.parse(generatedAt)) fail();
      previous = item;
    }
    return Object.freeze({ version: VERSION, generatedAt, items: Object.freeze(items) });
  }

  function resolveView(snapshotValue, requestedSlug) {
    const snapshot = normalizeSnapshot(snapshotValue);
    if (requestedSlug) {
      if (!SLUG.test(requestedSlug)) return Object.freeze({ mode: "not_found", hidden: false, ...NOT_FOUND, items: Object.freeze([]), selected: null });
      const selected = snapshot.items.find((item) => item.slug === requestedSlug) || null;
      if (!selected) return Object.freeze({ mode: "not_found", hidden: false, ...NOT_FOUND, items: Object.freeze([]), selected: null });
      return Object.freeze({ mode: "detail", hidden: false, status: 200, message: "", items: snapshot.items, selected });
    }
    if (snapshot.items.length === 0) {
      return Object.freeze({ mode: "empty", hidden: true, status: 200, message: "", items: snapshot.items, selected: null });
    }
    return Object.freeze({ mode: "list", hidden: false, status: 200, message: "", items: snapshot.items, selected: snapshot.items[0] });
  }

  function clear(node) {
    while (node && node.firstChild) node.removeChild(node.firstChild);
  }

  function setText(document, target, value) {
    if (!target) return;
    clear(target);
    target.append(document.createTextNode(value));
  }

  function render(root, snapshot, requestedSlug, options = {}) {
    const document = root.ownerDocument;
    const view = resolveView(snapshot, requestedSlug);
    const links = [...document.querySelectorAll("[data-public-note-link]")];
    const workspace = root.querySelector("[data-public-note-workspace]");
    const status = root.querySelector("[data-public-note-status]");
    const list = root.querySelector("[data-public-note-list]");
    const detail = root.querySelector("[data-public-note-detail]");
    clear(list);

    if (view.hidden) {
      root.hidden = true;
      links.forEach((link) => { link.hidden = true; });
      return view;
    }

    root.hidden = false;
    links.forEach((link) => { link.hidden = view.mode === "not_found"; });
    if (view.mode === "not_found") {
      workspace.hidden = true;
      status.hidden = false;
      status.setAttribute("role", "status");
      setText(document, status, view.message);
      return view;
    }

    status.hidden = true;
    workspace.hidden = false;
    for (const item of view.items) {
      const button = document.createElement("button");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      button.type = "button";
      button.setAttribute("aria-current", String(item.slug === view.selected.slug));
      setText(document, title, item.title);
      setText(document, meta, `${item.area} · ${item.category}`);
      button.append(title, meta);
      button.addEventListener("click", () => {
        render(root, snapshot, item.slug, { focusHeading: true });
      });
      list.append(button);
    }

    const selected = view.selected;
    setText(document, root.querySelector("[data-public-note-meta]"), `${selected.area} · ${selected.category} · ${selected.publishedAt.slice(0, 10).replaceAll("-", ".")}`);
    const heading = root.querySelector("[data-public-note-heading]");
    setText(document, heading, selected.title);
    setText(document, root.querySelector("[data-public-note-summary]"), selected.summary);
    const sections = root.querySelector("[data-public-note-sections]");
    clear(sections);
    selected.bodySections.forEach((section) => {
      const paragraph = document.createElement("p");
      setText(document, paragraph, section);
      sections.append(paragraph);
    });
    setText(document, root.querySelector("[data-public-note-sources]"), selected.sources.map((item) => item.label).join(" · "));
    setText(document, root.querySelector("[data-public-note-limitations]"), selected.limitations);
    setText(document, root.querySelector("[data-public-note-next-action]"), selected.nextAction);
    if (options.focusHeading) heading.focus({ preventScroll: true });
    return view;
  }

  async function mountFromSameOrigin(root) {
    const section = root.document.querySelector("[data-public-note-root]");
    if (!section) return;
    const requestedSlug = new URL(root.location.href).searchParams.get("note") || "";
    try {
      const snapshotUrl = new URL("./public-note-release.json", root.location.href);
      if (snapshotUrl.origin !== root.location.origin) fail();
      const response = await root.fetch(snapshotUrl.href, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) fail();
      const snapshot = await response.json();
      render(section, snapshot, requestedSlug);
    } catch (_error) {
      const empty = { version: VERSION, generatedAt: "2026-08-01T00:00:00.000Z", items: [] };
      render(section, empty, requestedSlug);
    }
  }

  return Object.freeze({ VERSION, normalizeSnapshot, resolveView, render, mountFromSameOrigin });
});
