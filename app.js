(() => {
  "use strict";

  const STORAGE_KEY = "learning-hub:v1";
  const MANIFEST_URL = "./manifest.json";

  const TYPE_LABELS = {
    skill: "技能",
    article: "文章",
    video: "视频",
    doc: "文档",
    repo: "仓库",
  };

  const TYPE_COLORS = {
    skill: "#EAF6FF",
    article: "#EEF8E8",
    video: "#FFF8D8",
    doc: "#FCEBF1",
    repo: "#F0EDFF",
  };

  const TYPE_ORDER = ["skill", "article", "video", "doc", "repo"];

  const ROUGH_BASE = {
    roughness: 1,
    bowing: 0.7,
    stroke: "#142A49",
    strokeWidth: 1.7,
    fill: "transparent",
    fillStyle: "solid",
    disableMultiStroke: true,
  };

  const ICONS = {
    skill: `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,3 14.4,9.2 21,9.4 16,13.6 17.8,20 12,16.6 6.2,20 8,13.6 3,9.4 9.6,9.2" fill="currentFill" stroke="#142A49" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
    article: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3.5" width="14" height="17" rx="1.2" fill="currentFill" stroke="#142A49" stroke-width="1.7"/><path d="M8 8h8M8 12h8M8 16h5" stroke="#142A49" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    video: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="1.4" fill="currentFill" stroke="#142A49" stroke-width="1.7"/><path d="M10 9.2v5.6L15.2 12z" fill="#142A49"/></svg>`,
    doc: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5h7l5 5V19.5H7z" fill="currentFill" stroke="#142A49" stroke-width="1.7" stroke-linejoin="round"/><path d="M14 4.5V10h5" fill="none" stroke="#142A49" stroke-width="1.7"/></svg>`,
    repo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h15v12h-15z" fill="currentFill" stroke="#142A49" stroke-width="1.7"/><path d="M4.5 7.5l2.6-3h7.2l2.7 3" fill="currentFill" stroke="#142A49" stroke-width="1.7" stroke-linejoin="round"/></svg>`,
  };

  const el = {
    status: document.getElementById("status"),
    stats: document.getElementById("stats"),
    updatedAt: document.getElementById("updated-at"),
    board: document.getElementById("board"),
    timeline: document.getElementById("timeline"),
    resultCount: document.getElementById("result-count"),
    filterType: document.getElementById("filter-type"),
    filterCategory: document.getElementById("filter-category"),
    filterRound: document.getElementById("filter-round"),
    filterRead: document.getElementById("filter-read"),
    filterApplied: document.getElementById("filter-applied"),
    sortBy: document.getElementById("sort-by"),
    search: document.getElementById("search"),
    btnReset: document.getElementById("btn-reset"),
    btnExport: document.getElementById("btn-export"),
    btnCards: document.getElementById("btn-view-cards"),
    btnTimeline: document.getElementById("btn-view-timeline"),
  };

  const state = {
    manifest: null,
    local: loadLocal(),
    view: "cards",
    filters: {
      type: "all",
      category: "all",
      round: "all",
      read: "all",
      applied: "all",
      query: "",
      sort: "score",
    },
  };

  let searchTimer = 0;
  let resizeObserver = null;

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: {} };
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object"
        ? { items: parsed.items || {} }
        : { items: {} };
    } catch {
      return { items: {} };
    }
  }

  function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.local));
  }

  function isScored(value) {
    return value != null && value !== "" && !Number.isNaN(Number(value));
  }

  function formatScore(value) {
    if (!isScored(value)) return "未评分";
    const n = Number(value);
    return Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
  }

  function formatDate(value) {
    if (!value) return "";
    const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
    return String(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function seedFrom(text) {
    let h = 2166136261;
    const s = String(text);
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) || 1;
  }

  function mergedItem(item) {
    const local = state.local.items[item.id] || {};
    return {
      ...item,
      read: local.read != null ? Boolean(local.read) : Boolean(item.read),
      applied: local.applied != null ? Boolean(local.applied) : Boolean(item.applied),
      effect: local.effect != null ? local.effect : item.effect || "",
    };
  }

  function patchItem(id, patch) {
    const current = state.local.items[id] || {};
    state.local.items[id] = { ...current, ...patch };
    saveLocal();
  }

  function typeLabel(type) {
    return TYPE_LABELS[type] || type || "其他";
  }

  function typeIcon(type) {
    const svg = (ICONS[type] || ICONS.doc).replaceAll(
      "currentFill",
      TYPE_COLORS[type] || "#FFFEF8"
    );
    return svg;
  }

  function uniqueSorted(values, order) {
    const set = [...new Set(values.filter(Boolean))];
    if (order) {
      set.sort((a, b) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia === -1 && ib === -1) return String(a).localeCompare(String(b), "zh");
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      return set;
    }
    return set.sort((a, b) => String(a).localeCompare(String(b), "zh"));
  }

  function fillSelect(select, options, allLabel) {
    const html = [`<option value="all">${escapeHtml(allLabel)}</option>`]
      .concat(
        options.map(
          (opt) =>
            `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`
        )
      )
      .join("");
    select.innerHTML = html;
  }

  function showStatus(message, isError) {
    el.status.hidden = !message;
    el.status.textContent = message || "";
    el.status.classList.toggle("is-error", Boolean(isError));
  }

  function computeStats(items) {
    const merged = items.map(mergedItem);
    const scored = merged.filter((item) => isScored(item.score));
    const avg = scored.length
      ? scored.reduce((sum, item) => sum + Number(item.score), 0) / scored.length
      : null;
    return {
      total: merged.length,
      read: merged.filter((item) => item.read).length,
      applied: merged.filter((item) => item.applied).length,
      avg,
    };
  }

  function renderStats() {
    const items = state.manifest.items || [];
    const stats = computeStats(items);
    const blocks = [
      { label: "总数", value: stats.total, tone: "blue", mark: false },
      { label: "已读", value: stats.read, tone: "green", mark: false },
      { label: "已应用", value: stats.applied, tone: "pink", mark: false },
      {
        label: "平均分",
        value: stats.avg == null ? "未评分" : formatScore(stats.avg),
        tone: "yellow",
        mark: true,
      },
    ];
    el.stats.innerHTML = blocks
      .map(
        (block, index) => `
        <article class="stat" data-tone="${block.tone}" data-rough data-seed="${30 + index}">
          <p class="stat-label">${block.label}</p>
          <p class="stat-value${block.mark ? " is-mark" : ""}">${escapeHtml(block.value)}</p>
        </article>`
      )
      .join("");
  }

  function itemText(item) {
    const tags = Array.isArray(item.tags) ? item.tags.join(" ") : "";
    return [
      item.title,
      item.summary,
      item.source,
      item.reason,
      item.notes,
      item.effect,
      item.category,
      item.type,
      tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function filteredItems() {
    const { type, category, round, read, applied, query, sort } = state.filters;
    const q = query.trim().toLowerCase();
    let list = (state.manifest.items || []).map(mergedItem);

    if (type !== "all") list = list.filter((item) => item.type === type);
    if (category !== "all") list = list.filter((item) => item.category === category);
    if (round !== "all") list = list.filter((item) => String(item.round) === String(round));
    if (read === "yes") list = list.filter((item) => item.read);
    if (read === "no") list = list.filter((item) => !item.read);
    if (applied === "yes") list = list.filter((item) => item.applied);
    if (applied === "no") list = list.filter((item) => !item.applied);
    if (q) list = list.filter((item) => itemText(item).includes(q));

    list.sort((a, b) => compareItems(a, b, sort));
    return list;
  }

  function compareItems(a, b, sort) {
    if (sort === "date") {
      const da = a.date || "";
      const db = b.date || "";
      if (da !== db) return db.localeCompare(da);
      return String(a.title || "").localeCompare(String(b.title || ""), "zh");
    }

    const key = sort === "quality" || sort === "relevance" ? sort : "score";
    const av = isScored(a[key]) ? Number(a[key]) : null;
    const bv = isScored(b[key]) ? Number(b[key]) : null;
    if (av == null && bv == null) {
      return String(a.title || "").localeCompare(String(b.title || ""), "zh");
    }
    if (av == null) return 1;
    if (bv == null) return -1;
    if (bv !== av) return bv - av;
    return String(a.title || "").localeCompare(String(b.title || ""), "zh");
  }

  function meterHtml(label, value, id) {
    if (!isScored(value)) {
      return `
        <div class="meter">
          <div class="meter-head">
            <span>${escapeHtml(label)}</span>
            <span>未评分</span>
          </div>
        </div>`;
    }
    const n = Number(value);
    const ratio = Math.max(0, Math.min(1, n / 10));
    return `
      <div class="meter">
        <div class="meter-head">
          <span>${escapeHtml(label)}</span>
          <span>${escapeHtml(formatScore(n))}</span>
        </div>
        <div class="meter-track" data-rough data-bar="${ratio}" data-seed="${seedFrom(id + label)}"></div>
      </div>`;
  }

  function cardHtml(item) {
    const reason = item.reason
      ? `<p class="reason">推荐：${escapeHtml(item.reason)}</p>`
      : "";
    const notes = item.notes
      ? `<p class="notes">${escapeHtml(item.notes)}</p>`
      : "";
    const url = item.url || "#";
    return `
      <article class="card" data-type="${escapeHtml(item.type || "doc")}" data-id="${escapeHtml(item.id)}" data-rough data-seed="${seedFrom(item.id)}">
        <div class="card-body">
          <div class="card-top">
            <div class="meta-left">
              <span class="type-tag">${typeIcon(item.type)} ${escapeHtml(typeLabel(item.type))}</span>
              <span>${escapeHtml(item.category || "")}</span>
            </div>
            <div class="meta-right">
              <span>${escapeHtml(item.source || "")}</span>
              <span>${escapeHtml(item.date || "")}</span>
            </div>
          </div>
          <h3 class="card-title">
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || "未命名")}</a>
          </h3>
          <p class="summary">${escapeHtml(item.summary || "")}</p>
          ${reason}
          <div class="meters">
            ${meterHtml("质量", item.quality, item.id)}
            ${meterHtml("相关度", item.relevance, item.id)}
          </div>
          <div class="score-row">
            <span class="score-badge">综合分 ${escapeHtml(formatScore(item.score))}</span>
            <span class="round-badge">第 ${escapeHtml(item.round ?? "—")} 轮</span>
          </div>
          <div class="checks">
            <label>
              <input type="checkbox" data-field="read" ${item.read ? "checked" : ""}>
              已读
            </label>
            <label>
              <input type="checkbox" data-field="applied" ${item.applied ? "checked" : ""}>
              已应用
            </label>
          </div>
          <label class="effect-label">
            效果批注
            <div class="effect-wrap" data-rough data-seed="${seedFrom(item.id + "-effect")}">
              <input class="effect-input" type="text" data-field="effect" value="${escapeHtml(item.effect || "")}" placeholder="实践后写下效果…">
            </div>
          </label>
          ${notes}
        </div>
      </article>`;
  }

  function renderBoard() {
    const items = filteredItems();
    const total = (state.manifest.items || []).length;
    el.resultCount.textContent = `显示 ${items.length} / ${total} 条`;

    if (state.view === "cards") {
      if (!items.length) {
        el.board.innerHTML = `<div class="empty" data-rough data-seed="99"><p>没有符合条件的条目。</p></div>`;
      } else {
        el.board.innerHTML = `<div class="cards">${items.map(cardHtml).join("")}</div>`;
      }
    }

    renderTimeline(items);
  }

  function renderTimeline(visibleItems) {
    const rounds = state.manifest.rounds || [];
    const byId = new Map((state.manifest.items || []).map((item) => [item.id, mergedItem(item)]));
    const visibleIds = new Set(visibleItems.map((item) => item.id));

    if (!rounds.length) {
      el.timeline.innerHTML = `<div class="empty" data-rough data-seed="98"><p>还没有轮次记录。</p></div>`;
      return;
    }

    const html = rounds
      .map((round, index) => {
        const picked = (round.picked || [])
          .map((id) => byId.get(id))
          .filter(Boolean)
          .filter((item) => visibleIds.has(item.id));
        const pickedSet = new Set(round.picked || []);
        const others = visibleItems.filter(
          (item) => Number(item.round) === Number(round.id) && !pickedSet.has(item.id)
        );

        const pickedHtml = picked.length
          ? `<p class="round-group-title"><span class="marker">本轮挑选</span></p>
             <div class="picked-list">${picked.map((item) => miniCardHtml(item, true)).join("")}</div>`
          : "";

        const othersTitle = picked.length ? "本轮其他条目" : "本轮条目";
        const othersHtml = others.length
          ? `<p class="round-group-title">${
              picked.length ? othersTitle : `<span class="marker">${othersTitle}</span>`
            }</p>
             <div class="round-items">${others.map((item) => miniCardHtml(item, false)).join("")}</div>`
          : picked.length
            ? ""
            : `<p class="muted">本轮暂无条目。</p>`;

        return `
          <article class="round">
            <div class="round-dot" data-rough data-seed="${60 + index}">${escapeHtml(round.id)}</div>
            <div class="round-panel" data-rough data-seed="${80 + index}">
              <h2>第 ${escapeHtml(round.id)} 轮 · ${escapeHtml(round.date || "")}</h2>
              <p class="round-topic">${escapeHtml(round.topic || "（无主题）")}</p>
              ${pickedHtml}
              ${othersHtml}
            </div>
          </article>`;
      })
      .join("");

    el.timeline.innerHTML = `
      <div class="timeline" data-line data-rough data-seed="70">
        ${html}
      </div>`;
  }

  function miniCardHtml(item, picked) {
    const url = item.url || "#";
    return `
      <article class="mini-card${picked ? " is-picked" : ""}" data-type="${escapeHtml(item.type || "doc")}" data-rough data-seed="${seedFrom("mini-" + item.id)}">
        <div class="meta-left">
          <span class="type-tag">${typeIcon(item.type)} ${escapeHtml(typeLabel(item.type))}</span>
          <span>${escapeHtml(item.source || "")}</span>
        </div>
        <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title || "未命名")}</a></h3>
        <p>${escapeHtml(item.summary || "")}</p>
      </article>`;
  }

  function setView(view) {
    state.view = view;
    el.board.classList.toggle("is-hidden", view !== "cards");
    el.timeline.classList.toggle("is-hidden", view !== "timeline");
    el.btnCards.classList.toggle("is-active", view === "cards");
    el.btnTimeline.classList.toggle("is-active", view === "timeline");
    el.btnCards.setAttribute("aria-pressed", String(view === "cards"));
    el.btnTimeline.setAttribute("aria-pressed", String(view === "timeline"));
    scheduleDraw();
  }

  function isVisibleBox(node) {
    if (!(node instanceof HTMLElement)) return false;
    if (node.closest(".is-hidden")) return false;
    const rect = node.getBoundingClientRect();
    return rect.width >= 4 && rect.height >= 4;
  }

  function ensureOverlay(node) {
    let svg = node.querySelector(":scope > .rough-overlay");
    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add("rough-overlay");
      node.insertBefore(svg, node.firstChild);
    }
    return svg;
  }

  function drawRough() {
    if (typeof rough === "undefined") return;
    document.body.classList.add("js-rough");

    document.querySelectorAll("[data-rough]").forEach((node) => {
      if (!isVisibleBox(node)) {
        const old = node.querySelector(":scope > .rough-overlay");
        if (old) old.remove();
        return;
      }

      const width = node.clientWidth;
      const height = node.clientHeight;
      const svg = ensureOverlay(node);
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.replaceChildren();

      const rc = rough.svg(svg);
      const seed = Number(node.dataset.seed) || 1;
      const pad = 1.5;

      if (node.hasAttribute("data-line")) {
        const dots = [...node.querySelectorAll(".round-dot")];
        if (dots.length) {
          const parentRect = node.getBoundingClientRect();
          const first = dots[0].getBoundingClientRect();
          const last = dots[dots.length - 1].getBoundingClientRect();
          const x = first.left + first.width / 2 - parentRect.left;
          const y1 = first.top + first.height / 2 - parentRect.top;
          const y2 = last.top + last.height / 2 - parentRect.top;
          svg.appendChild(
            rc.line(x, y1, x, Math.max(y1 + 8, y2), {
              ...ROUGH_BASE,
              seed,
              strokeWidth: 2,
              bowing: 0.4,
            })
          );
        }
        return;
      }

      if (node.hasAttribute("data-bar")) {
        svg.appendChild(
          rc.rectangle(pad, pad, width - pad * 2, height - pad * 2, {
            ...ROUGH_BASE,
            seed,
            strokeWidth: 1.3,
          })
        );
        const ratio = Number(node.dataset.bar);
        const fillWidth = Math.max(6, (width - pad * 2) * ratio);
        svg.appendChild(
          rc.rectangle(pad, pad, fillWidth, height - pad * 2, {
            ...ROUGH_BASE,
            seed: seed + 7,
            stroke: "#142A49",
            strokeWidth: 1.1,
            fill: "#142A49",
            fillStyle: "hachure",
            fillWeight: 1.1,
            hachureGap: 3.6,
            hachureAngle: -50,
          })
        );
        return;
      }

      svg.appendChild(
        rc.rectangle(pad, pad, Math.max(4, width - pad * 2), Math.max(4, height - pad * 2), {
          ...ROUGH_BASE,
          seed,
        })
      );
    });
  }

  function scheduleDraw() {
    requestAnimationFrame(() => requestAnimationFrame(drawRough));
  }

  function renderAll() {
    renderStats();
    renderBoard();
    scheduleDraw();
  }

  function populateFilters() {
    const items = state.manifest.items || [];
    const types = uniqueSorted(
      items.map((item) => item.type),
      TYPE_ORDER
    ).map((value) => ({ value, label: typeLabel(value) }));
    const categories = uniqueSorted(items.map((item) => item.category)).map((value) => ({
      value,
      label: value,
    }));
    const rounds = uniqueSorted(items.map((item) => String(item.round))).map((value) => ({
      value,
      label: `第 ${value} 轮`,
    }));

    fillSelect(el.filterType, types, "全部类型");
    fillSelect(el.filterCategory, categories, "全部分类");
    fillSelect(el.filterRound, rounds, "全部轮次");
  }

  function resetFilters() {
    state.filters = {
      type: "all",
      category: "all",
      round: "all",
      read: "all",
      applied: "all",
      query: "",
      sort: "score",
    };
    el.filterType.value = "all";
    el.filterCategory.value = "all";
    el.filterRound.value = "all";
    el.filterRead.value = "all";
    el.filterApplied.value = "all";
    el.sortBy.value = "score";
    el.search.value = "";
    renderAll();
  }

  function buildUpdatedManifest() {
    const cloned = JSON.parse(JSON.stringify(state.manifest));
    cloned.updatedAt = new Date().toISOString();
    cloned.items = (cloned.items || []).map((item) => {
      const merged = mergedItem(item);
      return {
        ...item,
        read: merged.read,
        applied: merged.applied,
        effect: merged.effect,
      };
    });
    return cloned;
  }

  function exportManifest() {
    const data = buildUpdatedManifest();
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "manifest.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    el.filterType.addEventListener("change", () => {
      state.filters.type = el.filterType.value;
      renderAll();
    });
    el.filterCategory.addEventListener("change", () => {
      state.filters.category = el.filterCategory.value;
      renderAll();
    });
    el.filterRound.addEventListener("change", () => {
      state.filters.round = el.filterRound.value;
      renderAll();
    });
    el.filterRead.addEventListener("change", () => {
      state.filters.read = el.filterRead.value;
      renderAll();
    });
    el.filterApplied.addEventListener("change", () => {
      state.filters.applied = el.filterApplied.value;
      renderAll();
    });
    el.sortBy.addEventListener("change", () => {
      state.filters.sort = el.sortBy.value;
      renderAll();
    });
    el.search.addEventListener("input", () => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        state.filters.query = el.search.value;
        renderAll();
      }, 120);
    });
    el.btnReset.addEventListener("click", resetFilters);
    el.btnExport.addEventListener("click", exportManifest);
    el.btnCards.addEventListener("click", () => setView("cards"));
    el.btnTimeline.addEventListener("click", () => setView("timeline"));

    el.board.addEventListener("change", onItemEdit);
    el.board.addEventListener("input", onItemEdit);

    window.addEventListener("resize", scheduleDraw);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleDraw);
    }
  }

  function onItemEdit(event) {
    const field = event.target.dataset.field;
    if (!field) return;
    const card = event.target.closest("[data-id]");
    if (!card) return;
    const id = card.dataset.id;

    if (field === "read" || field === "applied") {
      if (event.type !== "change") return;
      patchItem(id, { [field]: event.target.checked });
      if (
        (field === "read" && state.filters.read !== "all") ||
        (field === "applied" && state.filters.applied !== "all")
      ) {
        renderAll();
      } else {
        renderStats();
        scheduleDraw();
      }
      return;
    }

    if (field === "effect") {
      patchItem(id, { effect: event.target.value });
    }
  }

  function observeResize() {
    if (typeof ResizeObserver === "undefined") return;
    resizeObserver = new ResizeObserver(() => scheduleDraw());
    resizeObserver.observe(document.body);
    if (el.board) resizeObserver.observe(el.board);
    if (el.timeline) resizeObserver.observe(el.timeline);
  }

  async function init() {
    bindEvents();
    observeResize();
    showStatus("正在读取 manifest.json…", false);

    try {
      const response = await fetch(MANIFEST_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.items)) {
        throw new Error("manifest.json 缺少 items 数组");
      }
      state.manifest = data;
      showStatus("");
      el.updatedAt.textContent = data.updatedAt
        ? `最近更新 ${formatDate(data.updatedAt)}`
        : "";
      populateFilters();
      renderAll();
    } catch (error) {
      showStatus(
        `无法读取 manifest.json（${error.message}）。请用本地 HTTP 服务打开，而不是直接双击文件。`,
        true
      );
    }
  }

  init();
})();
