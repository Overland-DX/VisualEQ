// VisualEQ - Combined PTY Relocation and 20-Band Equalizer
// -----------------------------------------------------------
// Credit: The method for connecting to the audio stream via
// Stream.Fallback.Player.Amplification was first demonstrated
// in the "Peakmeter" plugin by Highpoint. Thanks!
// -----------------------------------------------------------

(() => {
  // ────────────────────────────────────────────────────────────
  // Settings
  // ────────────────────────────────────────────────────────────
  const PLUGIN_VERSION = 'v1.0'; 
  const GITHUB_URL = 'https://github.com/Overland-DX/VisualEQ.git'; // Sett inn din GitHub URL her

  const MOBILE_BREAKPOINT = 769;
  const INACTIVE_RDS_OPACITY = '0.4';
  const TP_ROW_SCALE = '0.6';
  const SWAP_PTY_AND_TP_ROW = true;

  const MODAL_TOP_POSITION = '50%';
  const MODAL_LEFT_POSITION = '50%';
  const SETTINGS_BUTTON_SCALE = '0.6';
  const MODAL_TEXT_SCALE = '0.7';

  const SENSITIVITY_DEFAULT = 0.8;
  const SENSITIVITY_MIN = 0.5;
  const SENSITIVITY_MAX = 1.5;

  const MINIMUM_BAR_HEIGHT = 2;
  const HORIZONTAL_MARGIN = 5;
  const BAR_SPACING = 2;
  const CORNER_RADIUS = 2;
  const FALL_SPEED = 120;
  const NOISE_GATE_THRESHOLD = 1.0;
  
  const EQ_THEMES = [
    { name: 'Classic', colors: ['#00ff00', '#ffff00', '#ff0000'] },
    { name: 'Ocean',   colors: ['#00ffff', '#0088ff'] },
    { name: 'Fire',    colors: ['#ffff00', '#ff8800', '#ff0000'] },
    { name: 'Matrix',  colors: ['#004400', '#00ff00'] },
    { name: 'Synth',   colors: ['#ff00ff', '#00ffff'] }
  ];
  let currentThemeIndex = 0;
  
  const FFT_SIZES = {
    OFF: 0,
    Low: 1024,
    Medium: 2048,
    High: 4096,
    Ultra: 8192
  };
  let currentFftSize = FFT_SIZES.Medium;
  let SENSITIVITY = SENSITIVITY_DEFAULT;
  let audioContext, analyser, dataArray;
  let eqCanvas, eqCtx;
  let currentBarHeights = [];
  let animationFrameId = null;
  let lastFrameTime = 0;
  let resizeTimeout;

  // ────────────────────────────────────────────────────────────
  // INITIALISERING
  // ────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    if (window.innerWidth < MOBILE_BREAKPOINT) return;
    setTimeout(setupPlugin, 500); 
    setupResizeListener();
  });

  const forceStyle = (el, styles) => {
    if (!el) return;
    Object.assign(el.style, styles);
  };

  function setupResizeListener() {
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (window.innerWidth < MOBILE_BREAKPOINT) window.location.reload();
      }, 250);
    });
  }

  // ────────────────────────────────────────────────────────────
  // HOVEDOPPSETT
  // ────────────────────────────────────────────────────────────
  function setupPlugin() {
    currentThemeIndex = parseInt(localStorage.getItem('visualeqThemeIndex') || '0', 10);
    currentFftSize = parseInt(localStorage.getItem('visualeqFftSize') || FFT_SIZES.Medium, 10);
    SENSITIVITY = parseFloat(localStorage.getItem('visualeqSensitivity') || SENSITIVITY_DEFAULT);

    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      #fmdx-settings-btn:hover { transform: scale(${SETTINGS_BUTTON_SCALE * 1.1}) !important; }
      #fmdx-modal-close:hover { background-color: rgba(255,255,255,0.2) !important; }
    `;
    document.head.appendChild(styleTag);

    document.body.addEventListener('click', (event) => {
      if (event.target.closest('.playbutton')) setTimeout(startOrRestartEQ, 500);
    });
    
    const originalEqContainer = document.getElementById("flags-container-desktop");
    const psContainer = document.getElementById("ps-container");
    if (!originalEqContainer || !psContainer) return;
    
    const ptyElement = originalEqContainer.querySelector(".data-pty");
    const flagsElement = originalEqContainer.querySelector("h3");
    if (!ptyElement || !flagsElement) return;

    psContainer.append(ptyElement, flagsElement);
    forceStyle(psContainer, { position: "relative" });

    const ptyTop = SWAP_PTY_AND_TP_ROW ? { bottom: "0px" } : { top: "0px" };
    const flagsTop = SWAP_PTY_AND_TP_ROW ? { top: "-10px", transformOrigin: 'top center' } : { bottom: "-10px", transformOrigin: 'bottom center' };
    Object.assign(ptyElement.style, { position: "absolute", left: "0", right: "0", margin: "0", textAlign: "center", ...ptyTop });
    Object.assign(flagsElement.style, { position: "absolute", left: "0", right: "0", margin: "0", textAlign: "center", transform: `scale(${TP_ROW_SCALE})`, ...flagsTop });
    if (flagsElement.querySelector(".stereo-container")) forceStyle(flagsElement.querySelector(".stereo-container"), { position: "relative", top: "17px" });

    const newEqContainer = document.createElement('div');
    Object.assign(newEqContainer, { className: originalEqContainer.className, style: originalEqContainer.style.cssText });
    originalEqContainer.replaceWith(newEqContainer);
    
    forceStyle(newEqContainer, { height: `${psContainer.offsetHeight}px`, padding: '0', overflow: 'hidden', position: 'relative' });
    
    eqCanvas = document.createElement('canvas');
    eqCtx = eqCanvas.getContext('2d');
    eqCanvas.width = newEqContainer.offsetWidth;
    eqCanvas.height = newEqContainer.offsetHeight;
    newEqContainer.appendChild(eqCanvas);
    
    const rdsIndicator = document.createElement('span');
    rdsIndicator.textContent = 'RDS';
    rdsIndicator.className = 'data-tp';
    forceStyle(rdsIndicator, { display: 'inline', margin: '0 15px', opacity: INACTIVE_RDS_OPACITY });
    flagsElement.querySelector('.data-ms')?.after(rdsIndicator);
    
    const psTextElement = document.getElementById('data-ps');
    if (psTextElement) {
        new MutationObserver(() => {
            forceStyle(rdsIndicator, { opacity: psTextElement.textContent.trim() ? '1' : INACTIVE_RDS_OPACITY });
        }).observe(psTextElement, { childList: true, characterData: true, subtree: true });
    }
    
    const settingsButton = createSettingsButton();
    newEqContainer.append(settingsButton);
    newEqContainer.onmouseover = () => forceStyle(settingsButton, { opacity: '1' });
    newEqContainer.onmouseout = () => forceStyle(settingsButton, { opacity: '0' });

    createSettingsModal();
    startOrRestartEQ();
  }

  // ────────────────────────────────────────────────────────────
  // UI-ELEMENTER
  // ────────────────────────────────────────────────────────────
  function createSettingsButton() {
    let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--container-border-color').trim() || 'white';
    const settingsButton = document.createElement('button');
    settingsButton.id = 'fmdx-settings-btn';
    settingsButton.innerHTML = '⚙️';
    forceStyle(settingsButton, {
        position: 'absolute', top: '5px', right: '5px', zIndex: '10',
        background: 'rgba(0,0,0,0.5)', border: `1px solid ${borderColor}`,
        color: 'white', borderRadius: '50%', cursor: 'pointer',
        width: '24px', height: '24px', fontSize: '16px', lineHeight: '22px',
        padding: '0', textAlign: 'center', opacity: '0', 
        transform: `scale(${SETTINGS_BUTTON_SCALE})`,
        transition: 'opacity 0.2s, transform 0.2s ease-in-out'
    });
    settingsButton.onclick = () => document.getElementById('fmdx-settings-modal-overlay').style.display = 'block';
    return settingsButton;
  }

  function createSettingsModal() {
    if (document.getElementById('fmdx-settings-modal-overlay')) return;

    let textColor = getComputedStyle(document.documentElement).getPropertyValue('--regular-text-color').trim() || 'white';
    let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--container-border-color').trim() || 'white';
    let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--container-background-color').trim() || 'rgba(30,30,30,0.95)';
    let bodyBg = getComputedStyle(document.documentElement).getPropertyValue('--body-background-color').trim() || '#333';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'fmdx-settings-modal-overlay';
    forceStyle(modalOverlay, { display: 'none', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999' });

    const modalContent = document.createElement('div');
    forceStyle(modalContent, {
        position: 'absolute', top: MODAL_TOP_POSITION, left: MODAL_LEFT_POSITION,
        transform: 'translate(-50%, -50%)', background: bgColor,
        border: `1px solid ${borderColor}`, padding: '0', borderRadius: '8px',
        width: '340px', height: '480px', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', fontSize: `calc(1rem * ${MODAL_TEXT_SCALE})`
    });
    
    const header = document.createElement('div');
    // HER ER ENDRINGEN: <p> er byttet ut med <a>
    header.innerHTML = `
      <div>
        <h2 style="margin: 0; color: ${textColor}; font-size: 1.5em;">EQ Settings</h2>
        <a href="${GITHUB_URL}" target="_blank" style="text-decoration: none; color: inherit; cursor: pointer;">
          <p style="margin: 4px 0 0; color: ${textColor}; font-size: 0.9em; opacity: 0.6;">VisualEQ ${PLUGIN_VERSION}</p>
        </a>
      </div>`;
    forceStyle(header, { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: `1px solid ${borderColor}`, flexShrink: '0' });

    const closeButton = document.createElement('button');
    closeButton.id = 'fmdx-modal-close';
    closeButton.innerHTML = '&times;';
    forceStyle(closeButton, {
        position: 'absolute', top: '10px', right: '10px',
        background: 'rgba(255,255,255,0.1)', border: 'none',
        color: textColor, cursor: 'pointer', borderRadius: '50%',
        width: '30px', height: '30px', fontSize: '1.8em',
        lineHeight: '30px', padding: '0', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'background-color 0.2s'
    });
    
    const scrollableArea = document.createElement('div');
    forceStyle(scrollableArea, { overflowY: 'auto', padding: '20px 25px', flex: '1 1 auto' });
    
    const themeSelect = document.createElement('select');
    EQ_THEMES.forEach((theme, index) => themeSelect.innerHTML += `<option value="${index}" ${index === currentThemeIndex ? 'selected' : ''}>${theme.name}</option>`);
    forceStyle(themeSelect, { width: '100%', padding: '0.6em', background: bodyBg, color: textColor, border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '1em' });
    themeSelect.onchange = () => { currentThemeIndex = parseInt(themeSelect.value, 10); localStorage.setItem('visualeqThemeIndex', currentThemeIndex); };
    
    const qualitySelect = document.createElement('select');
    Object.keys(FFT_SIZES).forEach(key => qualitySelect.innerHTML += `<option value="${FFT_SIZES[key]}" ${FFT_SIZES[key] === currentFftSize ? 'selected' : ''}>${key}</option>`);
    forceStyle(qualitySelect, { width: '100%', padding: '0.6em', background: bodyBg, color: textColor, border: `1px solid ${borderColor}`, borderRadius: '4px', fontSize: '1em' });
    qualitySelect.onchange = () => { currentFftSize = parseInt(qualitySelect.value, 10); localStorage.setItem('visualeqFftSize', currentFftSize); startOrRestartEQ(); };
    
    const sensitivitySlider = document.createElement('input');
    Object.assign(sensitivitySlider, { type: 'range', min: SENSITIVITY_MIN, max: SENSITIVITY_MAX, step: 0.1, value: SENSITIVITY });
    forceStyle(sensitivitySlider, { width: '100%', marginTop: '0.6em' });
    
    const helpSection = document.createElement('div');
    helpSection.innerHTML = `
        <hr style="border: none; border-top: 1px solid ${borderColor}; opacity: 0.5; margin: 2em 0;">
        <h4 style="margin: 0 0 0.8em 0; font-size: 1.2em;">Help</h4>
        <p style="margin: 0.8em 0; font-size: 1em; opacity: 0.8;"><strong>Sensitivity:</strong> Controls the vertical amplification of the bars.</p>
        <p style="margin: 0.8em 0; font-size: 1em; opacity: 0.8;"><strong>Analyser Quality:</strong> Higher values provide more detail but may use more CPU. 'OFF' disables the visualizer.</p>
        <p style="margin: 0.8em 0; font-size: 1em; opacity: 0.8;"><strong>Theme:</strong> Changes the color scheme of the audio visualizer.</p>
    `;

    const createControlSection = (label, controlElement, marginTop = '0') => {
        const container = document.createElement('div');
        const labelEl = document.createElement('label');
        labelEl.innerHTML = label;
        forceStyle(labelEl, { display: 'block', marginBottom: '0.6em', fontWeight: 'bold' });
        forceStyle(container, { marginTop });
        container.append(labelEl, controlElement);
        return container;
    };
    
    const sensLabelEl = document.createElement('label');
    sensLabelEl.htmlFor = 'sensitivity';
    sensLabelEl.innerHTML = `Sensitivity <span>(${SENSITIVITY.toFixed(1)})</span>`;
    forceStyle(sensLabelEl, { display: 'block', marginBottom: '0.6em', fontWeight: 'bold' });
    sensitivitySlider.oninput = () => {
        SENSITIVITY = parseFloat(sensitivitySlider.value);
        sensLabelEl.querySelector('span').textContent = `(${SENSITIVITY.toFixed(1)})`;
        localStorage.setItem('visualeqSensitivity', SENSITIVITY);
    };
    
    const sensitivityContainer = document.createElement('div');
    forceStyle(sensitivityContainer, { marginTop: '1.5em' });
    sensitivityContainer.append(sensLabelEl, sensitivitySlider);
    
    scrollableArea.append(
        createControlSection('Theme', themeSelect),
        createControlSection('Analyser Quality', qualitySelect, '1.5em'),
        sensitivityContainer,
        helpSection
    );
    
    modalContent.append(header, scrollableArea, closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const closeModal = () => modalOverlay.style.display = 'none';
    modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
    closeButton.onclick = closeModal;
  }

  // ────────────────────────────────────────────────────────────
  // EQUALIZER-LOGIKK
  // ────────────────────────────────────────────────────────────
  function showStandbyText() {
    if (!eqCtx || !eqCanvas) return;
    eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);
    let textColor = getComputedStyle(document.documentElement).getPropertyValue('--regular-text-color').trim() || 'white';
    Object.assign(eqCtx, { fillStyle: textColor, font: "16px Arial", textAlign: "center", textBaseline: "middle" });
    eqCtx.fillText("Standby", eqCanvas.width / 2, eqCanvas.height / 2);
  }

  function startOrRestartEQ() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;

    if (currentFftSize === FFT_SIZES.OFF) { showStandbyText(); return; }
    
    if (typeof Stream === 'undefined' || !Stream.Fallback?.Player?.Amplification) { setTimeout(startOrRestartEQ, 500); return; }
    
    audioContext = Stream.Fallback.Audio;
    if (audioContext.state === 'suspended') audioContext.resume();
    
    const liveAudioPlayer = Stream.Fallback.Player;
    if (analyser) try { liveAudioPlayer.Amplification.disconnect(analyser); } catch (e) {}

    analyser = audioContext.createAnalyser();
    Object.assign(analyser, { fftSize: currentFftSize, smoothingTimeConstant: 0.6 });
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    if (currentBarHeights.length === 0) currentBarHeights = new Array(20).fill(0);
    
    liveAudioPlayer.Amplification.connect(analyser);
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(drawEQ);
  }

  const bandRanges = [ { start: 1, end: 1 }, { start: 2, end: 3 }, { start: 4, end: 5 }, { start: 6, end: 8 }, { start: 9, end: 12 }, { start: 13, end: 17 }, { start: 18, end: 24 }, { start: 25, end: 33 }, { start: 34, end: 45 }, { start: 46, end: 62 }, { start: 63, end: 84 }, { start: 85, end: 112 }, { start: 113, end: 148 }, { start: 149, end: 195 }, { start: 196, end: 256 }, { start: 257, end: 330 }, { start: 331, end: 420 }, { start: 421, end: 530 }, { start: 531, end: 660 }, { start: 661, end: 800 } ];

  function calculateBandLevels() {
    if (!dataArray) return new Array(20).fill(0);
    return bandRanges.map(range => {
      let sum = 0;
      for (let i = range.start; i <= range.end; i++) sum += dataArray[i];
      return sum / (range.end - range.start + 1);
    });
  }
  
  function drawEQ(currentTime) {
    if (!analyser || audioContext.state !== 'running') {
        // La animasjonen fortsette å falle selv om context ikke kjører
        if (currentBarHeights.every(h => h === 0)) {
            animationFrameId = null;
            return;
        }
    }
    
    const deltaTime = (currentTime - (lastFrameTime || currentTime)) / 1000;
    lastFrameTime = currentTime;
    
    let bandLevels = new Array(20).fill(0);
    if (analyser && audioContext.state === 'running') {
        analyser.getByteFrequencyData(dataArray);
        bandLevels = calculateBandLevels();
    }
    
    eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);
    const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
    const barWidth = (totalDrawingWidth - (BAR_SPACING * (bandRanges.length - 1))) / bandRanges.length;
    
    const activeTheme = EQ_THEMES[currentThemeIndex];
    const gradient = eqCtx.createLinearGradient(0, eqCanvas.height, 0, 0);
    activeTheme.colors.forEach((color, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1) || 1, color));
    eqCtx.fillStyle = gradient;
    
    bandLevels.forEach((level, i) => {
      let targetHeight = (level / 255) * eqCanvas.height * SENSITIVITY;
      if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;
      
      if (targetHeight > currentBarHeights[i]) {
        currentBarHeights[i] = targetHeight;
      } else {
        currentBarHeights[i] = Math.max(0, currentBarHeights[i] - (FALL_SPEED * deltaTime));
      }
      
      const finalVisibleHeight = MINIMUM_BAR_HEIGHT + (currentBarHeights[i] || 0);
      const x = HORIZONTAL_MARGIN + i * (barWidth + BAR_SPACING);
      const y = eqCanvas.height - finalVisibleHeight;
      
      eqCtx.beginPath();
      eqCtx.moveTo(x + CORNER_RADIUS, y);
      eqCtx.lineTo(x + barWidth - CORNER_RADIUS, y);
      eqCtx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + CORNER_RADIUS);
      eqCtx.lineTo(x + barWidth, eqCanvas.height);
      eqCtx.lineTo(x, eqCanvas.height);
      eqCtx.lineTo(x, y + CORNER_RADIUS);
      eqCtx.quadraticCurveTo(x, y, x + CORNER_RADIUS, y);
      eqCtx.closePath();
      eqCtx.fill();
    });
    
    animationFrameId = requestAnimationFrame(drawEQ);
  }
})();