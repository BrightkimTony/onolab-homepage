(() => {
  "use strict";

  const palette = Object.freeze(["#38263F", "#51415A", "#705975", "#F4F1E8", "#FBFAF5"]);
  const query = new URLSearchParams(window.location.search);
  const forcedReduced = query.get("motion") === "reduce" || document.documentElement.dataset.motion === "reduce";
  const forcedFallback = query.get("forceGalaxyFallback") === "1";
  const reducedMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  const nrankStatusCopy = Object.freeze({
    public: "nRank 공개 연결 전 · 이 화면은 결과를 저장하지 않음",
    ready: "nRank 로컬 진단 화면 열기 가능 · 실자료 연결 여부는 다음 화면에서 확인 · 저장 안 됨",
    unavailable: "nRank 로컬 진단 연결 안 됨 · 결과 저장 안 됨",
  });

  function isLoopbackHostname(hostname) {
    return new Set(["127.0.0.1", "localhost", "[::1]", "::1"]).has(String(hostname || "").toLowerCase());
  }

  function probeNrankStatic(localUrl) {
    return new Promise((resolve) => {
      if (typeof Image !== "function") {
        resolve(false);
        return;
      }

      let settled = false;
      let timeoutId = 0;
      const image = new Image();
      const probeUrl = new URL("/favicon.svg", localUrl).href;
      const cleanup = () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        image.removeEventListener("load", onLoad);
        image.removeEventListener("error", onError);
        image.removeEventListener("abort", onAbort);
        image.src = "";
      };
      const finish = (available) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(available);
      };
      const onLoad = () => finish(true);
      const onError = () => finish(false);
      const onAbort = () => finish(false);

      image.addEventListener("load", onLoad);
      image.addEventListener("error", onError);
      image.addEventListener("abort", onAbort);
      timeoutId = window.setTimeout(() => finish(false), 2000);
      image.src = probeUrl;
    });
  }

  function setupNrankEntry() {
    const cta = document.querySelector("[data-primary-cta]");
    const status = document.querySelector("[data-nrank-status]");
    if (!cta || !status) return;

    const publicFallback = "#brand-check";
    const localUrl = cta.dataset.nrankLocalUrl || "";
    const setConnection = (href, message, state) => {
      cta.setAttribute("href", href);
      cta.dataset.nrankReady = state === "ready" ? "true" : "false";
      status.dataset.nrankState = state;
      status.textContent = message;
    };

    setConnection(publicFallback, nrankStatusCopy.public, "public");
    if (!isLoopbackHostname(window.location.hostname)) return;

    let parsedUrl;
    try {
      parsedUrl = new URL(localUrl);
    } catch {
      setConnection(publicFallback, nrankStatusCopy.unavailable, "unavailable");
      return;
    }
    if (parsedUrl.protocol !== "http:" || !isLoopbackHostname(parsedUrl.hostname)) {
      setConnection(publicFallback, nrankStatusCopy.unavailable, "unavailable");
      return;
    }

    probeNrankStatic(parsedUrl.href).then((available) => {
      if (available) setConnection(localUrl, nrankStatusCopy.ready, "ready");
      else setConnection(publicFallback, nrankStatusCopy.unavailable, "unavailable");
    });
  }

  function hexToRgb(hex) {
    const match = hex.replace("#", "").match(/../g);
    return match.map((channel) => parseInt(channel, 16) / 255);
  }

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "SHADER_COMPILE_FAILED";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl) {
    const vertexSource = `
      precision highp float;
      attribute vec3 aPosition;
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      uniform float uGather;
      uniform float uAspect;
      uniform vec2 uPointer;
      varying vec3 vColor;
      varying float vAlpha;

      mat2 rotate2d(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      void main() {
        vec3 p = aPosition;
        float radius = length(p.xz);
        float loose = 1.0 - uGather;
        p.xz = rotate2d(loose * (0.45 + radius * 0.07)) * p.xz;
        p.xz *= 1.0 + loose * 0.34;
        p.x += sin(aPhase * 2.3) * loose * 0.65;
        p.z += cos(aPhase * 1.7) * loose * 0.65;
        p.y += sin(aPhase * 3.1) * loose * 1.15;

        float drift = uTime * (0.025 + 0.018 / (1.0 + radius));
        p.xz = rotate2d(drift) * p.xz;
        p.yz = rotate2d(0.63 + uPointer.y * 0.08) * p.yz;
        p.xz = rotate2d(uPointer.x * 0.08) * p.xz;
        p.y += sin(aPhase + uTime * 0.28) * 0.015;

        float depth = max(4.5, p.z + 9.4);
        float perspective = 2.18 / depth;
        vec2 projected = vec2(p.x * perspective / max(uAspect, 1.0), p.y * perspective);
        gl_Position = vec4(projected, 0.0, 1.0);
        float pulse = 0.9 + 0.12 * sin(aPhase * 1.7 + uTime * 0.65);
        gl_PointSize = clamp(aSize * pulse * (10.5 / depth), 1.0, 7.0);
        vColor = aColor;
        float edge = 1.0 - smoothstep(0.72, 0.98, max(abs(projected.x), abs(projected.y)));
        vAlpha = mix(0.42, 0.88, clamp(aSize / 4.0, 0.0, 1.0)) * mix(0.28, 1.0, uGather) * edge;
      }
    `;
    const fragmentSource = `
      precision mediump float;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 point = gl_PointCoord - vec2(0.5);
        float distanceFromCenter = length(point);
        float glow = smoothstep(0.5, 0.03, distanceFromCenter);
        float alpha = glow * vAlpha;
        gl_FragColor = vec4(vColor * alpha, alpha);
      }
    `;
    const program = gl.createProgram();
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "PROGRAM_LINK_FAILED");
    }
    return program;
  }

  function randomGaussian() {
    const u = Math.max(0.0001, Math.random());
    const v = Math.max(0.0001, Math.random());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function createGalaxyData(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colorStops = palette.map(hexToRgb);
    const spiralCount = Math.floor(count * 0.83);
    const ringCount = count - spiralCount;

    for (let index = 0; index < count; index += 1) {
      let radius;
      let angle;
      let x;
      let y;
      let z;
      if (index < spiralCount) {
        radius = Math.pow(Math.random(), 0.72) * 4.65;
        const arm = index % 4;
        angle = arm * Math.PI * 0.5 + radius * 1.62 + randomGaussian() * (0.09 + radius * 0.035);
        x = Math.cos(angle) * radius + randomGaussian() * 0.07 * (1 + radius * 0.18);
        z = Math.sin(angle) * radius + randomGaussian() * 0.07 * (1 + radius * 0.18);
        y = randomGaussian() * (0.035 + radius * 0.018);
      } else {
        const ringIndex = index - spiralCount;
        angle = (ringIndex / ringCount) * Math.PI * 2 + randomGaussian() * 0.018;
        radius = 4.05 + randomGaussian() * 0.05;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
        y = randomGaussian() * 0.025;
      }

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      const core = Math.max(0, 1 - radius / 1.25);
      const outer = Math.min(1, radius / 4.4);
      const light = 0.06 + outer * 0.36 - core * 0.06;
      const stopIndex = Math.min(colorStops.length - 2, Math.floor(outer * (colorStops.length - 1)));
      const from = colorStops[Math.max(0, stopIndex)];
      const to = colorStops[Math.max(1, stopIndex + 1)];
      for (let channel = 0; channel < 3; channel += 1) {
        colors[index * 3 + channel] = from[channel] + (to[channel] - from[channel]) * light;
      }
      sizes[index] = index >= spiralCount ? 2.2 + Math.random() * 1.1 : 1.1 + Math.random() * 2.8 + core * 2.4;
      phases[index] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, sizes, phases };
  }

  function bindAttribute(gl, program, name, data, size, buffers) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const location = gl.getAttribLocation(program, name);
    if (location >= 0) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    }
    buffers[name] = buffer;
  }

  function initGalaxy(host, canvas, scene) {
    if (forcedFallback) throw new Error("FORCED_GALAXY_FALLBACK");
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WEBGL_UNAVAILABLE");

    const program = createProgram(gl);
    scene.gl = gl;
    scene.program = program;
    gl.useProgram(program);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    scene.count = Math.min(window.innerWidth, window.innerHeight) < 700 ? 4200 : 7600;
    const data = createGalaxyData(scene.count);
    bindAttribute(gl, program, "aPosition", data.positions, 3, scene.buffers);
    bindAttribute(gl, program, "aColor", data.colors, 3, scene.buffers);
    bindAttribute(gl, program, "aSize", data.sizes, 1, scene.buffers);
    bindAttribute(gl, program, "aPhase", data.phases, 1, scene.buffers);
    ["uTime", "uGather", "uAspect", "uPointer"].forEach((name) => {
      scene.uniforms[name] = gl.getUniformLocation(program, name);
    });
    resizeCanvas(canvas, scene);
    host.dataset.galaxyState = "active";
    host.dataset.galaxyGather = "0.000";
    renderFrame(canvas, scene, performance.now(), true);
  }

  function resizeCanvas(canvas, scene) {
    if (!scene.gl) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.35 : 1.7);
    const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      scene.gl.viewport(0, 0, width, height);
    }
  }

  function renderFrame(canvas, scene, now, force = false) {
    if (!scene.gl || (!force && (!scene.motion || !scene.visible))) return;
    const assemblyDelta = scene.lastTime ? Math.max(0, (now - scene.lastTime) / 1000) : 0;
    const delta = scene.lastTime ? Math.max(0, Math.min(0.05, (now - scene.lastTime) / 1000)) : 0;
    scene.lastTime = now;
    scene.elapsed += delta;
    if (scene.motion && scene.visible) scene.assemblyElapsed += assemblyDelta;
    const progress = scene.motion ? Math.min(1, scene.assemblyElapsed / 2.8) : 1;
    const gather = progress * progress * (3 - 2 * progress);
    scene.pointer.x += (scene.pointer.targetX - scene.pointer.x) * Math.min(1, delta * 2);
    scene.pointer.y += (scene.pointer.targetY - scene.pointer.y) * Math.min(1, delta * 2);

    const gl = scene.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(scene.program);
    gl.uniform1f(scene.uniforms.uTime, scene.elapsed);
    gl.uniform1f(scene.uniforms.uGather, gather);
    gl.uniform1f(scene.uniforms.uAspect, canvas.width / canvas.height);
    gl.uniform2f(scene.uniforms.uPointer, scene.pointer.x, scene.pointer.y);
    gl.drawArrays(gl.POINTS, 0, scene.count);
    scene.renderCount += 1;
    scene.host.dataset.galaxyGather = gather.toFixed(3);
    scene.host.dataset.galaxyFrames = String(scene.renderCount);
  }

  function scheduleFrame(canvas, scene) {
    if (scene.frame || !scene.gl || !scene.motion || !scene.visible) return;
    const loop = (now) => {
      scene.frame = 0;
      renderFrame(canvas, scene, now);
      if (scene.motion && scene.visible) scene.frame = window.requestAnimationFrame(loop);
    };
    scene.frame = window.requestAnimationFrame(loop);
  }

  function stopFrame(scene) {
    if (scene.frame) window.cancelAnimationFrame(scene.frame);
    scene.frame = 0;
  }

  function setupGalaxy() {
    const host = document.querySelector("[data-galaxy-hero]");
    if (!host) return;
    const canvas = host.querySelector("[data-galaxy-canvas]");
    const toggle = host.querySelector("[data-galaxy-toggle]");
    const status = host.querySelector("[data-galaxy-status]");
    if (!canvas || !toggle || !status) return;

    const scene = {
      host,
      gl: null,
      program: null,
      uniforms: {},
      buffers: {},
      count: 0,
      frame: 0,
      lastTime: 0,
      elapsed: 0,
      assemblyElapsed: 0,
      renderCount: 0,
      motion: !forcedReduced && !reducedMotion.matches,
      reduced: forcedReduced || reducedMotion.matches,
      userPaused: false,
      visible: !document.hidden,
      pointer: { x: 0, y: 0, targetX: 0, targetY: 0 },
    };

    const setStatus = (message) => {
      status.textContent = message;
    };

    const useFallback = () => {
      stopFrame(scene);
      scene.gl = null;
      host.dataset.galaxyState = "fallback";
      host.dataset.galaxyMotion = "static";
      toggle.disabled = true;
      toggle.setAttribute("aria-pressed", "true");
      toggle.textContent = "정적 장면";
      setStatus("정적인 은하 장면으로 보여드립니다.");
    };

    const applyMotion = () => {
      if (!scene.gl) return;
      scene.motion = !scene.reduced && !scene.userPaused;
      host.dataset.galaxyMotion = scene.reduced ? "reduced" : scene.motion ? "playing" : "paused";
      toggle.disabled = scene.reduced;
      toggle.setAttribute("aria-pressed", String(!scene.motion));
      toggle.textContent = scene.reduced ? "움직임 제한됨" : scene.motion ? "움직임 멈추기" : "움직임 켜기";
      if (scene.motion) {
        setStatus("입자가 은하로 모이고 있습니다.");
        scheduleFrame(canvas, scene);
      } else {
        stopFrame(scene);
        renderFrame(canvas, scene, performance.now(), true);
        setStatus(scene.reduced ? "움직임을 줄인 정적인 은하 장면입니다." : "은하 움직임을 잠시 멈췄습니다.");
      }
    };

    toggle.addEventListener("click", () => {
      if (scene.reduced || !scene.gl) return;
      scene.userPaused = !scene.userPaused;
      applyMotion();
    });

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      useFallback();
    });

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      scene.pointer.targetX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      scene.pointer.targetY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    }, { passive: true });

    window.addEventListener("resize", () => {
      resizeCanvas(canvas, scene);
      if (!scene.motion) renderFrame(canvas, scene, performance.now(), true);
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      scene.visible = !document.hidden;
      if (!scene.visible) stopFrame(scene);
      else if (scene.motion) scheduleFrame(canvas, scene);
      else renderFrame(canvas, scene, performance.now(), true);
    });

    window.addEventListener("pagehide", () => stopFrame(scene));

    if (typeof window.IntersectionObserver === "function") {
      const observer = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          scene.visible = entry.isIntersecting && !document.hidden;
          if (scene.visible && scene.motion) scheduleFrame(canvas, scene);
          else if (!scene.visible) stopFrame(scene);
        });
      }, { threshold: 0.02 });
      observer.observe(host);
    }

    const reducedListener = (event) => {
      scene.reduced = forcedReduced || event.matches;
      if (!scene.reduced && !scene.userPaused) scene.assemblyElapsed = Math.max(scene.assemblyElapsed, 2.8);
      applyMotion();
    };
    if (typeof reducedMotion.addEventListener === "function") reducedMotion.addEventListener("change", reducedListener);
    else if (typeof reducedMotion.addListener === "function") reducedMotion.addListener(reducedListener);

    try {
      initGalaxy(host, canvas, scene);
      applyMotion();
    } catch {
      useFallback();
    }
  }

  function setupQuest() {
    const quest = document.querySelector("[data-quest]");
    if (!quest) return;
    const audienceTabs = [...quest.querySelectorAll("[data-quest-audience]")];
    const choices = [...quest.querySelectorAll("[data-quest-choice]")];
    const nextButton = quest.querySelector("[data-quest-next]");
    const resultMark = quest.querySelector("[data-quest-result-mark]");
    const resultCode = quest.querySelector("[data-quest-result-code]");
    const resultTitle = quest.querySelector("[data-quest-result-title]");
    const resultDescription = quest.querySelector("[data-quest-result-description]");
    if (!audienceTabs.length || !choices.length || !nextButton || !resultMark || !resultCode || !resultTitle || !resultDescription) return;

    const resultCopy = Object.freeze({
      search: ["#587047", "검색 노출 확인", "검색에서 먼저 확인할 범위와 다음 점검 한 가지를 봅니다."],
      brand: ["#E85D45", "브랜드 정리", "브랜드가 지킬 기준과 손님에게 건넬 쉬운 설명을 봅니다."],
      content: ["#D9A83E", "콘텐츠 기획", "먼저 보여줄 장면과 한 문장으로 전할 내용을 봅니다."],
      experiment: ["#4656B8", "마케팅 실험", "비용과 범위를 확인한 뒤 작은 변화로 시험할 자리를 봅니다."],
    });
    let selectedChoice = choices.find((choice) => choice.getAttribute("aria-selected") === "true") || choices[0];

    function selectAudience(tab, focus = false) {
      audienceTabs.forEach((candidate) => {
        const selected = candidate === tab;
        candidate.setAttribute("aria-selected", String(selected));
        candidate.tabIndex = selected ? 0 : -1;
      });
      quest.dataset.questAudience = tab.dataset.questAudience;
      if (focus) tab.focus();
    }

    function selectChoice(choice) {
      selectedChoice = choice;
      choices.forEach((candidate) => candidate.setAttribute("aria-selected", String(candidate === choice)));
      const copy = resultCopy[choice.dataset.questChoice];
      if (!copy) return;
      resultMark.style.setProperty("--quest-color", copy[0]);
      resultCode.textContent = copy[0];
      resultTitle.textContent = copy[1];
      resultDescription.textContent = copy[2];
    }

    audienceTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectAudience(tab));
      tab.addEventListener("keydown", (event) => {
        const directions = { ArrowLeft: -1, ArrowRight: 1, Home: 0, End: audienceTabs.length - 1 };
        if (!(event.key in directions)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? directions.End : (index + directions[event.key] + audienceTabs.length) % audienceTabs.length;
        selectAudience(audienceTabs[nextIndex], true);
      });
    });

    choices.forEach((choice) => choice.addEventListener("click", () => selectChoice(choice)));
    selectAudience(audienceTabs.find((tab) => tab.getAttribute("aria-selected") === "true") || audienceTabs[0]);
    selectChoice(selectedChoice);

    nextButton.addEventListener("click", () => {
      const targetId = selectedChoice.dataset.questChoice === "search" ? "brand-check" : "method";
      const target = document.getElementById(targetId);
      if (!target) return;
      const primaryCta = document.querySelector("[data-primary-cta]");
      if (selectedChoice.dataset.questChoice === "search" && primaryCta?.dataset.nrankReady === "true") {
        primaryCta.click();
        return;
      }
      const reduced = forcedReduced || reducedMotion.matches || document.documentElement.dataset.motion === "reduce";
      target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  }

  setupGalaxy();
  setupNrankEntry();
  setupQuest();
})();
