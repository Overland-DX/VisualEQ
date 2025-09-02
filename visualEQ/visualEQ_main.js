// -----------------------------------------------------------
// Credit: The method for connecting to the audio stream via
// Stream.Fallback.Player.Amplification was first demonstrated
// in the "Peakmeter" plugin by Highpoint. Thanks!
// -----------------------------------------------------------

(() => {
    // ===================================================================================
    // VisualEQ v1.5.1 :: CONFIGURATION
    // ===================================================================================

    // -----------------------------------------------------------------------------------
    // SECTION 0: SERVER OWNER DEFAULTS (NEW)
    // -----------------------------------------------------------------------------------
    // This section allows the server owner to set the default appearance and behavior
    // for first-time users or users who have not saved their own settings yet.
    // Once a user changes a setting in the settings modal, their choice will be saved
    // and will override these defaults.
    const SERVER_OWNER_DEFAULTS = {
        // Should the plugin be enabled by default for new users?
        // Options: true (on), false (off)
        DEFAULT_PLUGIN_ENABLED: true,

        // Default theme for the visualizer.
        // IMPORTANT: You must use the exact theme name from the 'EQ_THEMES' list below.
        // Example: 'Sunset', 'Server Themecolor', 'Green', 'Synthwave'
        DEFAULT_THEME_NAME: 'Server Themecolor',

        // Default visualizer mode.
        // Options: 'Bars', 'LED', 'Spectrum'
        DEFAULT_VISUALIZER_MODE: 'Spectrum',

        // Should the peak meter be active by default? (for 'Bars' and 'LED' modes)
        // Options: true (on), false (off)
        DEFAULT_SHOW_PEAK_METER: true,

        // Should the grid and frequency labels be shown by default? (for 'Spectrum' mode)
        // Options: true (on), false (off)
        DEFAULT_SHOW_SPECTRUM_GRID: true
    };


    // This section contains all the settings for the plugin. It is divided into two parts:
    // 1. User-Configurable Settings: Safe to tweak for visual adjustments.
    // 2. Core Plugin Settings: Advanced settings that affect the plugin's logic.
    //    Only change these if you know what you are doing.
    // -----------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------
    // SECTION 1: USER-CONFIGURABLE SETTINGS (Safe to Tweak)
    // -----------------------------------------------------------------------------------

    // --- General Layout ---
    const MOBILE_BREAKPOINT = 769; // The screen width (in pixels) below which the plugin will deactivate.
  
	// --- Row Scaling and Positioning (Reimplemented & Expanded) ---
	const TP_ROW_SCALE = '0.6';          // The size scale of the TP/TA row (top).
	const PS_ROW_SCALE = '0.8';          // The size scale of the PS row (middle).
	const PTY_ROW_SCALE = '0.8';         // The size scale of the PTY row (bottom).

	// Use these to fine-tune the vertical position.
	const TP_ROW_VERTICAL_OFFSET = '-15px'; // Adjusts the vertical position of the TP/TA row.
	const PS_ROW_VERTICAL_OFFSET = '-2px';  // Adjusts the vertical position of the PS row.
	const PTY_ROW_VERTICAL_OFFSET = '7px'; // Adjusts the vertical position of the PTY row.


    // --- Settings Modal ---
    const MODAL_TOP_POSITION = '50%'; // Vertical position of the settings window.
    const MODAL_LEFT_POSITION = '50%'; // Horizontal position of the settings window.
    const SETTINGS_BUTTON_SCALE = '0.6'; // The size of the settings gear icon.
    const MODAL_TEXT_SCALE = '0.7'; // The base text size inside the settings window.

    // --- Visualizer Physics & Appearance ---
    const SENSITIVITY_DEFAULT = 0.8; // The default vertical sensitivity of the visualizer.
    const SENSITIVITY_MIN = 0.5; // The minimum value for the sensitivity slider.
    const SENSITIVITY_MAX = 1.5; // The maximum value for the sensitivity slider.

    const FALL_SPEED = 120; // How quickly the bars fall (higher value = faster fall).
    const HORIZONTAL_MARGIN = 5; // The space (in pixels) on the left and right edges of the visualizer.
    const BAR_SPACING = 2; // The space (in pixels) between each bar in 'Bars' and 'LED' mode.
    const CORNER_RADIUS = 2; // The corner roundness for 'Bars' mode. Set to 0 for sharp corners.
	
	
	// --- Visualizer Modes ---
	// Server owner can safely remove modes from this list to limit user choices.
	// IMPORTANT: Do not change the order or add new names without adding a corresponding drawMode... function.
	// Default: ['Bars', 'LED', 'Spectrum', 'Waveform', 'Circle', 'Mirrored Bars']
	const VISUALIZER_MODES = ['Bars', 'LED', 'Spectrum', 'Waveform', 'Circle', 'Mirrored Bars'];

	// --- Peak Meter ---
	const PEAK_HOLD_TIME = 500; // How long the peak line should "hold" at the top (in milliseconds). Default: 500
	const PEAK_FALL_SPEED = 50; // How quickly the peak line falls after holding (lower value = slower). Default: 50
	const PEAK_BAR_HEIGHT = 2;  // The thickness (in pixels) of the peak line. Default: 2

	// --- LED Mode Specific ---
	const LED_BLOCK_COUNT = 18;    // The number of vertical LED blocks in each bar for 'LED' mode. Default: 18
	const LED_BLOCK_SPACING = 2;   // The space (in pixels) between each vertical LED block. Default: 2

	// --- Waveform Mode Specific ---
	const WAVEFORM_GLOW_SIZE = 5;     // Size of the "neon glow" effect. Set to 0 to disable. Default: 5
	const WAVEFORM_DURATION = 5;      // NY: How many seconds of audio history to show. Default: 5

	// --- Circle Mode Specific (3-Panel Layout) ---
	const CIRCLE_PANEL_RADIUS = 5;      // The inner radius of each of the three circles. Default: 35
	const CIRCLE_PANEL_LINE_WIDTH = 2;   // The thickness of the pulsating lines. Default: 2
	const CIRCLE_PANEL_BAR_LENGTH = 8; // Multiplier for the length of the pulsating lines. 1.0 is normal, 1.5 is 50% longer. Default: 1.2
	const CIRCLE_PEAK_LINE_WIDTH = 0.6;  // The thickness of the peak meter arc. Default: 0.6
	const CIRCLE_PEAK_ARC_SIZE = 0.03;   // The length of the peak meter arc (in radians). Default: 0.03

	// --- Circle Mode Text Labels ---
	const CIRCLE_LABEL_SCALE = 0.8;          // The size scale of the text labels. 1.0 is normal, 0.8 is smaller. Default: 0.8
	const CIRCLE_LABEL_BASE_FONT_SIZE = 12;  // The base font size for the labels (in pixels). Default: 12
	const CIRCLE_LABEL_BOTTOM_OFFSET = 2;    // The distance of the labels from the bottom edge (in pixels). Default: 2
  

    // --- Color Themes ---
    // You can easily add your own themes here.
    // - For a solid color, use one color in the 'colors' array: { name: 'My Color', colors: ['#ff00ff'] }
    // - For a gradient, use two or more colors: { name: 'My Gradient', colors: ['#ff00ff', '#00ffff'] }
    const EQ_THEMES = [
        { name: 'Server Themecolor', colors: [] }, // Special theme that uses the server's --color-4 variable.

        // Solid Colors
        { name: 'Red', colors: ['#ff3b30'] },
        { name: 'Orange', colors: ['#ff9500'] },
        { name: 'Yellow', colors: ['#ffcc00'] },
        { name: 'Green', colors: ['#34c759'] },
        { name: 'Mint', colors: ['#63E6BE'] },
        { name: 'Teal', colors: ['#5ac8fa'] },
        { name: 'Blue', colors: ['#007aff'] },
        { name: 'Indigo', colors: ['#5856d6'] },
        { name: 'Pink', colors: ['#ff2d55'] },
        { name: 'White', colors: ['#ffffff'] },

        // Gradients
        { name: 'Sunset', colors: ['#FFD166', '#EF476F', '#8338EC'] },
        { name: 'Oceanic', colors: ['#48BFE3', '#5390D9', '#64DFDF'] },
        { name: 'Synthwave', colors: ['#F72585', '#7209B7', '#3A0CA3'] },
        { name: 'Forest', colors: ['#9EF01A', '#38B000', '#004B23'] },
        { name: 'Inferno', colors: ['#FEE440', '#F15152', '#D80032'] },
        { name: 'Galaxy', colors: ['#1D2D50', '#6C4AB6', '#B931FC'] },
        { name: 'Rainbow', colors: ['#d90429', '#ffc300', '#0077b6'] },
        { name: 'Glacier', colors: ['#FFFFFF', '#A2D2FF'] },
        { name: 'Jungle', colors: ['#55A630', '#F3DE2C'] },
        { name: 'Lava', colors: ['#540B0E', '#E07A5F'] }
    ];

    // -----------------------------------------------------------------------------------
    // SECTION 2: CORE PLUGIN SETTINGS (Advanced users only)
    // -----------------------------------------------------------------------------------

    // --- Core Audio Processing ---
    const MINIMUM_BAR_HEIGHT = 2; // The minimum visible height of a bar to prevent it from disappearing completely.
    const NOISE_GATE_THRESHOLD = 1.0; // Audio values below this will be treated as silence. Helps reduce background noise flicker.

    // --- Analyser Quality ---
    // These are the specific FFT (Fast Fourier Transform) sizes for the Web Audio API.
    // Changing these values without understanding the API can break the visualizer.
    const FFT_SIZES = {
        Low: 1024,
        Medium: 4096,
        High: 8192
    };


    const PLUGIN_VERSION = 'v1.5.1';
    const GITHUB_URL = 'https://github.com/Overland-DX/VisualEQ.git';

    let currentFftSize = FFT_SIZES.Medium;
    let SENSITIVITY = SENSITIVITY_DEFAULT;
    let audioContext, analyser, dataArray;
    let eqCanvas, eqCtx;
    let showPeakMeter = true;
    let peakHeights = [];
    let peakHoldTimers = [];
    let currentBarHeights = [];
    let animationFrameId = null;
    let lastFrameTime = 0;
    let resizeTimeout;
    let currentVisualizerMode = 'Bars';
    let showSpectrumGrid = true;
    let isEqLayoutActive = false;
    let originalFlagsContainerRef = null;
    let settingsButtonRef = null;
    let currentThemeIndex = 0;
	let smoothedTimeData = null;
    let ptyElementRef = null;
    let flagsElementRef = null;
    let visualEqContainerRef = null;
	let lastWaveformY = null;
	let waveformHistory = [];

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
    addVisualEQToggle();

    const storedState = localStorage.getItem('visualeqEnabled');
    const isEnabled = storedState === null ?
        SERVER_OWNER_DEFAULTS.DEFAULT_PLUGIN_ENABLED :
        (storedState !== 'false');

    if (!isEnabled) {
        console.log("VisualEQ is disabled via side menu setting.");
        return;
    }

    const storedThemeIndex = localStorage.getItem('visualeqThemeIndex');
    let defaultThemeIndex = EQ_THEMES.findIndex(theme => theme.name === SERVER_OWNER_DEFAULTS.DEFAULT_THEME_NAME);
    if (defaultThemeIndex === -1) defaultThemeIndex = 0;
    currentThemeIndex = storedThemeIndex !== null ? parseInt(storedThemeIndex, 10) : defaultThemeIndex;

    const storedMode = localStorage.getItem('visualeqMode');
    currentVisualizerMode = storedMode !== null ? storedMode : SERVER_OWNER_DEFAULTS.DEFAULT_VISUALIZER_MODE;

    const storedFftSize = localStorage.getItem('visualeqFftSize');
    currentFftSize = storedFftSize !== null ? parseInt(storedFftSize, 10) : FFT_SIZES.Medium;
    if (currentFftSize === 2048) {
        currentFftSize = 4096;
        localStorage.setItem('visualeqFftSize', currentFftSize);
    }

    const storedPeak = localStorage.getItem('visualeqShowPeak');
    showPeakMeter = storedPeak !== null ? (storedPeak === 'true') : SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_PEAK_METER;

    const storedGrid = localStorage.getItem('visualeqShowGrid');
    showSpectrumGrid = storedGrid !== null ? (storedGrid === 'true') : SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_SPECTRUM_GRID;
	
	const storedSensitivity = localStorage.getItem('visualeqSensitivity');
    SENSITIVITY = storedSensitivity !== null ? parseFloat(storedSensitivity) : SENSITIVITY_DEFAULT;

    injectPluginStyles();
    settingsButtonRef = createSettingsButton();
    createSettingsModal();
    
    const waitForLogoAndInit = () => {
        const timeout = setTimeout(() => {
            console.warn('VisualEQ: Timeout waiting for logo plugin. Running layout anyway.');
            observer.disconnect();
            setupVisualEQLayout();
        }, 3000);

        const observer = new MutationObserver((mutations, obs) => {
            const logoElement = document.getElementById('logo-container-desktop');
            if (logoElement) {
                console.log('VisualEQ: Logo detected. Building final layout.');
                clearTimeout(timeout);
                obs.disconnect();
                setTimeout(setupVisualEQLayout, 50); 
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    waitForLogoAndInit();
}

function addVisualEQToggle() {
    const anchorElement = document.getElementById("imperial-units");

    if (!anchorElement) {
        console.warn("VisualEQ: Could not find the 'imperial-units' anchor element.");
        return;
    }

    const id = "visualeq-enable-toggle";
    const label = "Hide VisualEQ";

    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    wrapper.innerHTML = `
    <div class="switch flex-container flex-phone flex-phone-column flex-phone-center">
        <input type="checkbox" tabindex="0" id="${id}" aria-label="${label}" />
        <label for="${id}"></label>
        <span class="text-smaller text-uppercase text-bold color-4 p-10">${label.toUpperCase()}</span>
    </div>
    `;

    anchorElement.closest('.form-group').insertAdjacentElement("afterend", wrapper);

    const storedState = localStorage.getItem('visualeqEnabled');
    const isEnabled = storedState === null ? SERVER_OWNER_DEFAULTS.DEFAULT_PLUGIN_ENABLED : (storedState !== 'false');

    document.getElementById(id).checked = !isEnabled;

    document.getElementById(id).addEventListener("change", function () {
		
        const shouldBeEnabled = !this.checked;
        localStorage.setItem("visualeqEnabled", shouldBeEnabled);
        window.location.reload();
    });
}

function setupVisualEQLayout() {
    if (isEqLayoutActive) return;

    const psContainer = document.getElementById('ps-container');
    const flagsContainer = document.getElementById('flags-container-desktop');
    const playButtonBlock = document.querySelector('.playbutton')?.closest('div[class*="panel-10"]');
    const logoBlock = document.getElementById('logo-container-desktop')?.closest('.panel-30');
    const mainParentContainer = flagsContainer.parentNode;

    if (!psContainer || !flagsContainer || !playButtonBlock || !mainParentContainer) {
        console.error('VisualEQ: Kunne ikke finne et eller flere kjerneelementer for ombygging.');
        return;
    }

    const originalPsTextElement = document.getElementById('data-ps');
    const psTextElement = originalPsTextElement.cloneNode(true);
    psTextElement.id = 'data-ps-desktop-clone';

    const ptyElement = flagsContainer.querySelector('h2');
    const flagsRowElement = flagsContainer.querySelector('h3');

    if (psTextElement && ptyElement && flagsRowElement) {
        const originalTooltipText = psContainer.getAttribute('data-tooltip');
        flagsContainer.innerHTML = '';
        
        const psWrapper = document.createElement('div');
        psWrapper.style.position = 'relative';
        psWrapper.appendChild(psTextElement);

        if (originalTooltipText) {
            const tooltipOverlay = document.createElement('span');
            tooltipOverlay.className = 'overlay tooltip';
            tooltipOverlay.setAttribute('data-tooltip', originalTooltipText);
            psWrapper.appendChild(tooltipOverlay);

            psWrapper.style.cursor = 'pointer';
            psWrapper.addEventListener('click', () => {
                document.getElementById('ps-container')?.click();
            });
        }

        flagsContainer.appendChild(flagsRowElement);
        flagsContainer.appendChild(psWrapper);
        flagsContainer.appendChild(ptyElement);
        
        flagsContainer.style.position = 'relative';
        forceStyle(flagsRowElement, {
            position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center',
            transform: `scale(${TP_ROW_SCALE}) translateY(${TP_ROW_VERTICAL_OFFSET})`
        });
        forceStyle(psWrapper, {
            position: 'absolute', top: '50%', left: 0, right: 0, textAlign: 'center',
            transform: `translateY(-50%) scale(${PS_ROW_SCALE}) translateY(${PS_ROW_VERTICAL_OFFSET})`
        });
		forceStyle(psTextElement, { fontWeight: 'bold' });
        forceStyle(ptyElement, {
            position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center',
            transform: `scale(${PTY_ROW_SCALE}) translateY(${PTY_ROW_VERTICAL_OFFSET})`,
            display: 'block'
        });

        new MutationObserver(() => {
            const hasPsText = originalPsTextElement.textContent.trim().length > 0;
            psTextElement.textContent = originalPsTextElement.textContent;
            psTextElement.style.visibility = hasPsText ? 'visible' : 'hidden';
            if (psTextElement.style.minHeight === '') psTextElement.style.minHeight = '20px';
        }).observe(originalPsTextElement, { childList: true, characterData: true, subtree: true });
    }
    
    const newPanelRow = document.createElement('div');
    newPanelRow.className = 'flex-container';
    newPanelRow.style.setProperty('align-items', 'flex-end', 'important');
    newPanelRow.style.width = '100%';

    visualEqContainerRef = document.createElement('div');
    visualEqContainerRef.className = 'panel-eq-container flex-center'; 
    
    eqCanvas = document.createElement('canvas');
    eqCtx = eqCanvas.getContext('2d');
    visualEqContainerRef.appendChild(eqCanvas);
	visualEqContainerRef.appendChild(settingsButtonRef);
	const actualButton = settingsButtonRef.querySelector('button');
	if (actualButton) {
		visualEqContainerRef.onmouseover = () => { actualButton.style.opacity = '1'; };
		visualEqContainerRef.onmouseout = () => { actualButton.style.opacity = '0'; };
	}

    newPanelRow.appendChild(playButtonBlock);
    newPanelRow.appendChild(flagsContainer);
    if (logoBlock) {
        newPanelRow.appendChild(logoBlock);
    }
    newPanelRow.appendChild(visualEqContainerRef);

    mainParentContainer.innerHTML = ''; 
    mainParentContainer.appendChild(newPanelRow);
    
    psContainer.style.display = 'none';
    document.body.appendChild(psContainer);

    const targetHeight = '90px';
    
    forceStyle(playButtonBlock, { height: targetHeight, flex: '0 0 auto' });
    playButtonBlock.style.setProperty('margin-left', '10px', 'important');
    playButtonBlock.style.setProperty('margin-right', '10px', 'important');

    forceStyle(flagsContainer, { height: targetHeight, flex: '1 1 auto' });
    flagsContainer.style.setProperty('margin-right', '20px', 'important');

    if (logoBlock) {
        forceStyle(logoBlock, { height: targetHeight, flex: '0 0 5%' });
        logoBlock.style.setProperty('margin-right', '10px', 'important');
    }

    forceStyle(visualEqContainerRef, {
        height: targetHeight,
        flex: '0 0 31.4%',
        overflow: 'hidden'
    });
    visualEqContainerRef.style.setProperty('margin-right', '10px', 'important');
    
    setTimeout(() => {
        if (eqCanvas && visualEqContainerRef) {
            eqCanvas.width = visualEqContainerRef.offsetWidth;
            eqCanvas.height = visualEqContainerRef.offsetHeight;
        }
    }, 150);

    isEqLayoutActive = true;

    if (typeof initTooltips === 'function') {
        initTooltips();
    }
}

    // ────────────────────────────────────────────────────────────
    // UI-ELEMENTER
    // ────────────────────────────────────────────────────────────
	
function injectPluginStyles() {
    if (document.getElementById('visualeq-plugin-styles')) return;

    const pluginStyles = document.createElement('style');
    pluginStyles.id = 'visualeq-plugin-styles';
    pluginStyles.innerHTML = `
      /* VÅR UNIKE TOOLTIP-KLASSE */
      .visualeq-tooltip-text {
          position: absolute;
          background-color: var(--color-2);
          border: 2px solid var(--color-3);
          color: var(--color-text);
          text-align: center;
          font-size: 14px;
          border-radius: 15px;
          padding: 5px 25px;
          z-index: 10001; /* Høyere enn modalen */
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none; 
      }

      /* Resten av stilene for modal-vinduet */
      #visualeq-sensitivity-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 6px; background: var(--color-2, #555); border-radius: 3px; outline: none; padding: 0; margin-top: 0.6em; }
      #visualeq-sensitivity-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; background: var(--color-4, #E6C269); border-radius: 50%; cursor: pointer; border: 2px solid var(--color-1, #111); transition: transform 0.2s ease; }
      #visualeq-sensitivity-slider::-moz-range-thumb { width: 18px; height: 18px; background: var(--color-4, #E6C269); border-radius: 50%; cursor: pointer; border: 2px solid var(--color-1, #111); transition: transform 0.2s ease; }
      #visualeq-sensitivity-slider:hover::-webkit-slider-thumb { transform: scale(1.1); }
      #visualeq-sensitivity-slider:hover::-moz-range-thumb { transform: scale(1.1); }
      .visualeq-modal-content { background: var(--color-1, #121010); color: var(--color-3, #FFF); border: 1px solid var(--color-2, #333); }
      .visualeq-modal-content .header { background: var(--color-2, #2A2A2A); padding: 10px 15px; border-bottom: 1px solid var(--color-2, #333); }
      .visualeq-modal-content h2 { color: var(--color-4, #FFF); font-size: 1.5em; margin: 0; }
      .visualeq-modal-content .header a { color: var(--color-4, #FFF); opacity: 0.6; }
      .visualeq-modal-content select { width: 100%; padding: 0.8em; background: var(--color-2, #333); color: var(--color-3, #FFF); border: 1px solid var(--color-1, #444); border-radius: 4px; font-size: 1em; }
      .visualeq-modal-content label { display: block; margin-bottom: 0.6em; font-weight: bold; color: var(--color-4, #E6C269); text-transform: uppercase; font-size: 0.9em; }
      .visualeq-modal-content .help-section hr { border: none; border-top: 1px solid var(--color-2, #444); opacity: 0.8; margin: 2em 0; }
      .visualeq-modal-content .help-section p { color: var(--color-3, #FFF); opacity: 0.8; }
      #fmdx-modal-close-visualeq { background: var(--color-2, rgba(255,255,255,0.1)); color: var(--color-3, #FFF); transition: background-color 0.2s, transform 0.2s; }
      #fmdx-modal-close-visualeq:hover { background: var(--color-4, #E6C269); color: var(--color-1, #111); transform: rotate(90deg); }
      .visualeq-checkbox-container { display: flex; align-items: center; justify-content: space-between; margin-top: 1.5em; padding: 0.8em; background-color: var(--color-2, #2A2A2A); border-radius: 4px; border: 1px solid var(--color-1, #444); }
      .visualeq-checkbox-container label { color: var(--color-4, #E6C269); text-transform: uppercase; font-size: 0.9em; margin-bottom: 0; }
      .visualeq-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
      .visualeq-switch input { display: none; }
      .visualeq-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-1, #ccc); transition: .4s; border-radius: 24px; }
      .visualeq-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
      input:checked + .visualeq-slider { background-color: var(--color-4, #2196F3); }
      input:checked + .visualeq-slider:before { transform: translateX(20px); }
    `;
    document.head.appendChild(pluginStyles);
}
	
function createSettingsButton() {
    const wrapper = document.createElement('div');
    forceStyle(wrapper, {
        position: 'absolute', top: '5px', right: '5px', zIndex: '10',
        cursor: 'pointer', width: '30px', height: '30px'
    });

    let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--container-border-color').trim() || 'white';
    const settingsButton = document.createElement('button');
    settingsButton.id = 'fmdx-settings-btn';
    settingsButton.innerHTML = '⚙️';
    forceStyle(settingsButton, {
        background: 'rgba(0,0,0,0.5)', border: `1px solid ${borderColor}`, color: 'white',
        borderRadius: '50%', cursor: 'pointer', width: '24px', height: '24px',
        fontSize: '16px', lineHeight: '22px', padding: '0', textAlign: 'center',
        transform: `scale(${SETTINGS_BUTTON_SCALE})`, opacity: '0', transition: 'opacity 0.2s ease-in-out'
    });

    settingsButton.onclick = () => {
        document.getElementById('fmdx-settings-modal-overlay').style.display = 'block';
        checkForUpdates();
    };

    let tooltipText = document.querySelector('.visualeq-tooltip-text');
    if (!tooltipText) {
        tooltipText = document.createElement('div');
        tooltipText.className = 'visualeq-tooltip-text';
        document.body.appendChild(tooltipText);
    }

    wrapper.addEventListener('mouseover', () => {
        tooltipText.textContent = 'VisualEQ Settings';

        const btnRect = wrapper.getBoundingClientRect();
        const tipRect = tooltipText.getBoundingClientRect();
        let top = btnRect.top - tipRect.height - 10;
        let left = btnRect.left + (btnRect.width / 2) - (tipRect.width / 2);
        if (left < 0) left = 5;
        tooltipText.style.top = `${top}px`;
        tooltipText.style.left = `${left}px`;
        tooltipText.style.opacity = '1';
    });

    wrapper.addEventListener('mouseout', () => {
        tooltipText.style.opacity = '0';
    });

    wrapper.appendChild(settingsButton);
    return wrapper;
}

function teardownVisualEQLayout() {
    if (!isEqLayoutActive) return;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    analyser = null;

    const originalPsContainer = document.getElementById('ps-container');
    const flagsContainer = originalFlagsContainerRef;
    const ptyEl = ptyElementRef;
    const flagsEl = flagsElementRef;
    const ourContainer = visualEqContainerRef;
    const playButtonBlock = document.querySelector('.playbutton').closest('div[style*="width: 86.5px"]');

    if (!originalPsContainer || !flagsContainer || !ptyEl || !flagsEl || !ourContainer || !playButtonBlock) {
        console.error("Teardown: Kunne ikke finne alle nødvendige elementer for å gjenopprette layout.");
        return;
    }

    originalPsContainer.removeAttribute('style'); 
    const psTextElement = document.getElementById('data-ps');
    if(psTextElement) {
        originalPsContainer.appendChild(psTextElement);
        psTextElement.removeAttribute('data-tooltip');
        psTextElement.classList.remove('tooltip');
        psTextElement.style.cursor = '';
    }

    flagsContainer.innerHTML = '';
    flagsEl.removeAttribute('style');
    ptyEl.removeAttribute('style');
    flagsContainer.appendChild(ptyEl);
    flagsContainer.appendChild(flagsEl);
    flagsContainer.removeAttribute('style');


    const psBlock = document.createElement('div');
    psBlock.className = 'panel-75';
    psBlock.appendChild(playButtonBlock);
    psBlock.appendChild(flagsContainer);
    psBlock.appendChild(originalPsContainer);

    const parent = ourContainer.parentNode;
    parent.insertBefore(psBlock, ourContainer);
    parent.removeChild(ourContainer); 
    parent.removeAttribute('style');

    ptyElementRef = null;
    flagsElementRef = null;
    visualEqContainerRef = null;
    originalFlagsContainerRef = null;
    isEqLayoutActive = false;
    console.log("VisualEQ: Layout deaktivert og original struktur gjenopprettet.");
}

function createSettingsModal() {
    if (document.getElementById('fmdx-settings-modal-overlay')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'fmdx-settings-modal-overlay';
    forceStyle(modalOverlay, { display: 'none', position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: '9999' });

    const modalContent = document.createElement('div');
    modalContent.className = 'visualeq-modal-content';
    forceStyle(modalContent, {
        position: 'absolute', top: MODAL_TOP_POSITION, left: MODAL_LEFT_POSITION,
        transform: 'translate(-50%, -50%)', 
        padding: '0', borderRadius: '8px',
        width: '340px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', fontSize: `calc(1rem * ${MODAL_TEXT_SCALE})`
    });
    
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2>EQ Settings</h2>
          <a href="${GITHUB_URL}" target="_blank" style="text-decoration: none; cursor: pointer;">
            <p id="visualeq-version-info" style="margin: 4px 0 0; font-size: 0.9em;">VisualEQ ${PLUGIN_VERSION}</p>
          </a>
        </div>
      </div>`;
    
    const closeButton = document.createElement('button');
    closeButton.id = 'fmdx-modal-close-visualeq';
    closeButton.innerHTML = '&times;';
    forceStyle(closeButton, {
        position: 'absolute', top: '15px', right: '15px',
        border: 'none', cursor: 'pointer', borderRadius: '50%',
        width: '30px', height: '30px', fontSize: '1.8em',
        lineHeight: '30px', padding: '0', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
    });
    
    const scrollableArea = document.createElement('div');
    forceStyle(scrollableArea, { overflowY: 'auto', padding: '25px', flex: '1 1 auto' });

    const themeSelect = document.createElement('select');
    EQ_THEMES.forEach((theme, index) => themeSelect.innerHTML += `<option value="${index}" ${index === currentThemeIndex ? 'selected' : ''}>${theme.name}</option>`);
    themeSelect.onchange = () => { currentThemeIndex = parseInt(themeSelect.value, 10); localStorage.setItem('visualeqThemeIndex', currentThemeIndex); };
    
    const qualitySelect = document.createElement('select');
    Object.keys(FFT_SIZES).forEach(key => qualitySelect.innerHTML += `<option value="${FFT_SIZES[key]}" ${FFT_SIZES[key] === currentFftSize ? 'selected' : ''}>${key}</option>`);
    
    const peakMeterContainer = document.createElement('div');
    peakMeterContainer.className = 'visualeq-checkbox-container';
    peakMeterContainer.innerHTML = `
      <label for="visualeq-peak-toggle">Show Peak Meter</label>
      <label class="visualeq-switch">
        <input type="checkbox" id="visualeq-peak-toggle-input" ${showPeakMeter ? 'checked' : ''}>
        <span class="visualeq-slider"></span>
      </label>`;
    peakMeterContainer.querySelector('#visualeq-peak-toggle-input').onchange = (e) => {
        showPeakMeter = e.target.checked;
        localStorage.setItem('visualeqShowPeak', showPeakMeter);
    };

    const gridToggleContainer = document.createElement('div');
    gridToggleContainer.className = 'visualeq-checkbox-container';
    gridToggleContainer.innerHTML = `
      <label for="visualeq-grid-toggle-input">Show Grid & Labels</label>
      <label class="visualeq-switch">
        <input type="checkbox" id="visualeq-grid-toggle-input" ${showSpectrumGrid ? 'checked' : ''}>
        <span class="visualeq-slider"></span>
      </label>`;
    gridToggleContainer.querySelector('#visualeq-grid-toggle-input').onchange = (e) => {
        showSpectrumGrid = e.target.checked;
        localStorage.setItem('visualeqShowGrid', showSpectrumGrid);
    };

    const modeSelect = document.createElement('select');
    VISUALIZER_MODES.forEach(mode => {
      modeSelect.innerHTML += `<option value="${mode}" ${mode === currentVisualizerMode ? 'selected' : ''}>${mode}</option>`;
    });

    const handleModeChange = (selectedMode) => {
        currentVisualizerMode = selectedMode;
        localStorage.setItem('visualeqMode', currentVisualizerMode);
        gridToggleContainer.style.display = (selectedMode === 'Spectrum') ? 'flex' : 'none';
    };
    
    modeSelect.onchange = (e) => handleModeChange(e.target.value);
    handleModeChange(currentVisualizerMode); 

	qualitySelect.onchange = () => {
		const newFftSize = parseInt(qualitySelect.value, 10);
		localStorage.setItem('visualeqFftSize', newFftSize);
		currentFftSize = newFftSize;
		startOrRestartEQ();
	};

    const sensitivitySlider = document.createElement('input');
    sensitivitySlider.id = 'visualeq-sensitivity-slider';
    Object.assign(sensitivitySlider, { type: 'range', min: SENSITIVITY_MIN, max: SENSITIVITY_MAX, step: 0.1, value: SENSITIVITY });

    const sensLabelEl = document.createElement('label');
    sensLabelEl.htmlFor = 'sensitivity';
    sensLabelEl.innerHTML = `Sensitivity <span>(${SENSITIVITY.toFixed(1)})</span>`;
    
    sensitivitySlider.oninput = () => {
        SENSITIVITY = parseFloat(sensitivitySlider.value);
        sensLabelEl.querySelector('span').textContent = `(${SENSITIVITY.toFixed(1)})`;
        localStorage.setItem('visualeqSensitivity', SENSITIVITY);
    };
    
    const sensitivityContainer = document.createElement('div');
    forceStyle(sensitivityContainer, { marginTop: '1.5em' });
    sensitivityContainer.append(sensLabelEl, sensitivitySlider);

    const helpSection = document.createElement('div');
    helpSection.className = 'help-section';
    helpSection.innerHTML = `
        <hr>
        <h4 style="margin: 0 0 0.8em 0; font-size: 1.2em; color: var(--color-4);">Tips</h4>
		<p style="margin: 0.8em 0; font-size: 1em;"><strong>Theme:</strong> Changes the color scheme of the audio visualizer.</p>
        <p style="margin: 0.8em 0; font-size: 1em;"><strong>Visualizer Mode:</strong> Changes the visual style of the analyzer (Bars, LED, Spectrum, Waveform, Circle, Mirrored Bars).</p>
        <p style="margin: 0.8em 0; font-size: 1em;"><strong>Analyser Quality:</strong> Higher values provide more detail but may use more CPU.</p>
        <p style="margin: 0.8em 0; font-size: 1em;"><strong>Peak Meter:</strong> Displays a line indicating the highest recent audio level for each band (Bars & LED mode).</p>
        <p style="margin: 0.8em 0; font-size: 1em;"><strong>Sensitivity:</strong> Controls the vertical amplification of the visualizer.</p>
    `;

    const createControlSection = (label, controlElement, marginTop = '0') => {
        const container = document.createElement('div');
        const labelEl = document.createElement('label');
        labelEl.innerHTML = label;
        forceStyle(container, { marginTop });
        container.append(labelEl, controlElement);
        return container;
    };
    
    scrollableArea.append(
        createControlSection('Theme', themeSelect),
        createControlSection('Visualizer Mode', modeSelect, '1.5em'),
        gridToggleContainer, 
        createControlSection('Analyser Quality', qualitySelect, '1.5em'),
        peakMeterContainer,
        sensitivityContainer, 
        helpSection
    );
    
    modalContent.append(header, scrollableArea);
    header.append(closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const closeModal = () => modalOverlay.style.display = 'none';
    modalOverlay.onclick = (e) => { if (e.target === modalOverlay) closeModal(); };
    closeButton.onclick = closeModal;

    const versionInfoElement = document.getElementById('visualeq-version-info');
    let tooltipTextElement = document.querySelector('.visualeq-tooltip-text');
    if (!tooltipTextElement) {
        tooltipTextElement = document.createElement('div');
        tooltipTextElement.className = 'visualeq-tooltip-text';
        document.body.appendChild(tooltipTextElement);
    }

    if (versionInfoElement) {
        versionInfoElement.addEventListener('mouseover', () => {
            tooltipTextElement.textContent = 'View VisualEQ on GitHub';
            const pRect = versionInfoElement.getBoundingClientRect();
            const tipRect = tooltipTextElement.getBoundingClientRect();
            let top = pRect.top - tipRect.height - 10;
            let left = pRect.left + (pRect.width / 2) - (tipRect.width / 2);
            if (left < 0) left = 5;
            tooltipTextElement.style.top = `${top}px`;
            tooltipTextElement.style.left = `${left}px`;
            tooltipTextElement.style.opacity = '1';
        });
        versionInfoElement.addEventListener('mouseout', () => {
            tooltipTextElement.style.opacity = '0';
        });
    }
}

async function checkForUpdates() {
    try {
        const match = GITHUB_URL.match(/github\.com\/(.*)\/(.*)\.git/);
        if (!match) return; 

        const owner = match[1];
        const repo = match[2];

        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/visualeq.js`;

        const response = await fetch(apiUrl, {
            headers: { 'Accept': 'application/vnd.github.v3.raw' }
        });
        
        if (!response.ok) {
            console.log('VisualEQ: GitHub API request failed.', response.status);
            return;
        }

        const scriptContent = await response.text();
        
        const versionRegex = /version:\s*['"]([\d\.]+)['"]/;
        const versionMatch = scriptContent.match(versionRegex);

        if (versionMatch && versionMatch[1]) {
            const latestVersion = versionMatch[1];

            if (compareVersions(latestVersion, PLUGIN_VERSION) > 0) {
                const versionElement = document.getElementById('visualeq-version-info');
                if (versionElement) {
                    if (!versionElement.textContent.includes('New version available')) {
                        versionElement.innerHTML += ` <span style="color: var(--color-4, #ffcc00); opacity: 0.8;">(New version available: v${latestVersion})</span>`;
                    }
                }
            }
        }
    } catch (error) {
        console.log('VisualEQ: Could not check for updates via GitHub API.', error);
    }
}

function compareVersions(v1, v2) {
    const parts1 = v1.replace('v', '').split('.').map(Number);
    const parts2 = v2.replace('v', '').split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;  
        if (p1 < p2) return -1; 
    }
    return 0; 
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
    
    audioContext = Stream.Fallback.Audio;
    if (audioContext.state === 'suspended') audioContext.resume();
    
    const liveAudioPlayer = Stream.Fallback.Player;
    if (analyser) try { liveAudioPlayer.Amplification.disconnect(analyser); } catch (e) {}

    analyser = audioContext.createAnalyser();
    Object.assign(analyser, { fftSize: currentFftSize, smoothingTimeConstant: 0.6 });
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    if (currentBarHeights.length !== 20) {
      currentBarHeights = new Array(20).fill(0);
      peakHeights = new Array(20).fill(0);
      peakHoldTimers = new Array(20).fill(0);
    }
    
    liveAudioPlayer.Amplification.connect(analyser);
    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(drawEQ);
}

const bandRanges_20_bands_definition = [
    // Sub-Bass & Bass
    { start: 2, end: 3 },     // ~60 Hz
    { start: 4, end: 5 },     // ~100 Hz
    { start: 7, end: 8 },     // ~150 Hz
    { start: 10, end: 12 },   // ~220 Hz
    // Low Mids
    { start: 15, end: 18 },   // ~350 Hz
    { start: 22, end: 26 },   // ~500 Hz
    { start: 30, end: 35 },   // ~700 Hz
    { start: 40, end: 46 },   // ~900 Hz
    // Midrange
    { start: 50, end: 58 },   // ~1.2 kHz
    { start: 65, end: 75 },   // ~1.5 kHz
    { start: 82, end: 94 },   // ~2.0 kHz
    { start: 105, end: 120 }, // ~2.5 kHz
    // Upper Mids
    { start: 135, end: 150 }, // ~3.2 kHz
    { start: 165, end: 180 }, // ~4.0 kHz
    { start: 200, end: 220 }, // ~5.0 kHz
    { start: 240, end: 265 }, // ~6.0 kHz
    // Treble / Presence
    { start: 300, end: 330 }, // ~7.5 kHz
    { start: 380, end: 420 }, // ~9.5 kHz
    { start: 480, end: 520 }, // ~12 kHz
    { start: 580, end: 640 }  // ~15 kHz
];

function calculateBandLevels(numBands) {
  if (!dataArray || !audioContext) return new Array(numBands).fill(0);

  if (numBands === 20) {
    const definition = bandRanges_20_bands_definition;
    if (dataArray.length < 801) { 
        const scale = dataArray.length / 801;
        return definition.map(range => {
            let sum = 0;
            const start = Math.floor(range.start * scale);
            const end = Math.floor(range.end * scale);
            for (let i = start; i <= end; i++) sum += dataArray[i] || 0;
            return sum / ((end - start + 1) || 1);
        });
    }
    return definition.map(range => {
      let sum = 0;
      for (let i = range.start; i <= range.end; i++) sum += dataArray[i] || 0;
      return sum / ((range.end - range.start + 1) || 1);
    });
  }
  
  const levels = [];
  const targetFrequencyCutoff = 16000;
  const maxPossibleFrequency = audioContext.sampleRate / 2;
  const maxIndex = Math.min(
      dataArray.length - 1,
      Math.floor((targetFrequencyCutoff / maxPossibleFrequency) * dataArray.length)
  );

  let lastIndex = 1;
  for (let i = 0; i < numBands; i++) {
    let endIndex = Math.floor(Math.pow(maxIndex, (i + 1) / numBands));
    const startIndex = Math.max(lastIndex, 1);
    if (endIndex < startIndex) { endIndex = startIndex; }
    
    let sum = 0;
    let count = 0;
    if (startIndex <= endIndex && startIndex < dataArray.length) {
        for (let j = startIndex; j <= endIndex; j++) {
            sum += dataArray[j] || 0;
            count++;
        }
    }
    levels.push(count > 0 ? sum / count : 0);
    lastIndex = endIndex + 1;
  }
  return levels;
}

function drawEQ(currentTime) {
    if (!analyser || (audioContext && audioContext.state !== 'running')) {
        if (currentBarHeights.every(h => h === 0) && peakHeights.every(h => h === 0)) {
            animationFrameId = null;
            return;
        }
    }
    
    const deltaTime = (currentTime - (lastFrameTime || currentTime)) / 1000;
    lastFrameTime = currentTime;
    
    let bandLevels;
    if (currentVisualizerMode !== 'Waveform') {
        if (analyser && audioContext && audioContext.state === 'running') {
            analyser.getByteFrequencyData(dataArray);
            const numBands = (currentVisualizerMode === 'Spectrum' || currentVisualizerMode === 'Circle') ? 60 : 20;
            bandLevels = calculateBandLevels(numBands);
        } else {
            const numBands = (currentVisualizerMode === 'Spectrum' || currentVisualizerMode === 'Circle') ? 60 : 20;
            bandLevels = new Array(numBands).fill(0);
        }
    }
    
    eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);

    switch (currentVisualizerMode) {
        case 'LED':
            drawModeLed(bandLevels, deltaTime);
            break;
        case 'Spectrum':
            drawModeSpectrum(bandLevels);
            break;
        case 'Waveform':
            drawModeWaveform(deltaTime);
            break;
        case 'Circle':
            drawModeCircle(bandLevels, deltaTime);
            break;
        case 'Mirrored Bars':
            drawModeMirroredBars(bandLevels, deltaTime);
            break;
        case 'Bars':
        default:
            drawModeBars(bandLevels, deltaTime);
            break;
    }
    
    animationFrameId = requestAnimationFrame(drawEQ);
}

function drawModeBars(bandLevels, deltaTime) {
  const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
  const barWidth = (totalDrawingWidth - (BAR_SPACING * (bandLevels.length - 1))) / bandLevels.length;
  const activeTheme = EQ_THEMES[currentThemeIndex];
  let fillStyle;
  if (activeTheme.name === 'Server Themecolor') { fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00'; } 
  else if (activeTheme.colors.length === 1) { fillStyle = activeTheme.colors[0]; } 
  else {
      const gradient = eqCtx.createLinearGradient(0, eqCanvas.height, 0, 0);
      activeTheme.colors.forEach((c, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1), c));
      fillStyle = gradient;
  }

  bandLevels.forEach((level, i) => {
    let targetHeight = (level / 255) * eqCanvas.height * SENSITIVITY;
    if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;
    
    currentBarHeights[i] = targetHeight > currentBarHeights[i] ? targetHeight : Math.max(0, currentBarHeights[i] - (FALL_SPEED * deltaTime));
    
    const finalVisibleHeight = MINIMUM_BAR_HEIGHT + currentBarHeights[i];
    const x = HORIZONTAL_MARGIN + i * (barWidth + BAR_SPACING);
    const y = eqCanvas.height - finalVisibleHeight;
    
    eqCtx.fillStyle = fillStyle;
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

    if (showPeakMeter) {
        if (currentBarHeights[i] >= peakHeights[i]) {
            peakHeights[i] = currentBarHeights[i];
            peakHoldTimers[i] = performance.now();
        } else {
            if (performance.now() - peakHoldTimers[i] > PEAK_HOLD_TIME) {
            peakHeights[i] = Math.max(0, peakHeights[i] - (PEAK_FALL_SPEED * deltaTime));
            }
        }
        if (peakHeights[i] > 0) {
            const peakY = eqCanvas.height - peakHeights[i] - PEAK_BAR_HEIGHT;
            if (peakY < y - PEAK_BAR_HEIGHT) {
                eqCtx.fillStyle = fillStyle;
                eqCtx.fillRect(x, peakY, barWidth, PEAK_BAR_HEIGHT);
                eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                eqCtx.fillRect(x, peakY, barWidth, PEAK_BAR_HEIGHT);
            }
        }
    }
  });
}

function drawModeLed(bandLevels, deltaTime) {
  const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
  const barWidth = (totalDrawingWidth - (BAR_SPACING * (bandLevels.length - 1))) / bandLevels.length;
  const activeTheme = EQ_THEMES[currentThemeIndex];

  const totalBlockHeight = eqCanvas.height - (LED_BLOCK_SPACING * (LED_BLOCK_COUNT - 1));
  const blockHeight = totalBlockHeight / LED_BLOCK_COUNT;

  bandLevels.forEach((level, i) => {
    let targetHeight = (level / 255) * eqCanvas.height * SENSITIVITY;
    if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;
    
    currentBarHeights[i] = targetHeight > currentBarHeights[i] ? targetHeight : Math.max(0, currentBarHeights[i] - (FALL_SPEED * deltaTime));

    const litBlocks = Math.ceil((currentBarHeights[i] / eqCanvas.height) * LED_BLOCK_COUNT);
    const x = HORIZONTAL_MARGIN + i * (barWidth + BAR_SPACING);
    
    if (litBlocks === 0) {
        const y = eqCanvas.height - (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
        eqCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
        eqCtx.fillRect(x, y, barWidth, blockHeight);
    }

    for (let j = 0; j < LED_BLOCK_COUNT; j++) {
      if (j < litBlocks) {
        const y = eqCanvas.height - (j + 1) * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
        let color;
        const percent = j / LED_BLOCK_COUNT;
        if(activeTheme.colors.length >= 3) {
            if(percent > 0.8) color = activeTheme.colors[2];
            else if (percent > 0.5) color = activeTheme.colors[1];
            else color = activeTheme.colors[0];
        } else if (activeTheme.colors.length === 2) {
            color = percent > 0.6 ? activeTheme.colors[1] : activeTheme.colors[0];
        } else if (activeTheme.colors.length === 1) {
            color = activeTheme.colors[0];
        } else {
            color = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
        }
        eqCtx.fillStyle = color;
        eqCtx.fillRect(x, y, barWidth, blockHeight);
      }
    }
    
    if (showPeakMeter) {
        if (currentBarHeights[i] >= peakHeights[i]) {
            peakHeights[i] = currentBarHeights[i];
            peakHoldTimers[i] = performance.now();
        } else {
            if (performance.now() - peakHoldTimers[i] > PEAK_HOLD_TIME) {
            peakHeights[i] = Math.max(0, peakHeights[i] - (PEAK_FALL_SPEED * deltaTime));
            }
        }
        const peakBlock = Math.ceil((peakHeights[i] / eqCanvas.height) * LED_BLOCK_COUNT);
        if (peakBlock > 0 && peakBlock > litBlocks) {
            const peakY = eqCanvas.height - (peakBlock) * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
            const peakColor = activeTheme.colors[activeTheme.colors.length -1] || '#ff0000';
            eqCtx.fillStyle = peakColor;
            eqCtx.fillRect(x, peakY, barWidth, blockHeight);
            eqCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            eqCtx.fillRect(x, peakY, barWidth, blockHeight);
        }
    }
  });
}

function drawSpectrumGrid(bandLevels) {
    eqCtx.save();

    const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
    const spacing = totalDrawingWidth / (bandLevels.length - 1);

    eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    eqCtx.lineWidth = 0.5;
    eqCtx.setLineDash([4, 4]);

    for (let i = 1; i <= 3; i++) {
        const y = eqCanvas.height * (i * 0.25);
        eqCtx.beginPath();
        eqCtx.moveTo(0, y);
        eqCtx.lineTo(eqCanvas.width, y);
        eqCtx.stroke();
    }

    const bandsPerZone = 6;
    for (let i = bandsPerZone; i < bandLevels.length; i += bandsPerZone) {
        const x = HORIZONTAL_MARGIN + i * spacing;
        eqCtx.beginPath();
        eqCtx.moveTo(x, 0);
        eqCtx.lineTo(x, eqCanvas.height);
        eqCtx.stroke();
    }
    
    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    eqCtx.font = '10px Arial';
    eqCtx.setLineDash([]);
    eqCtx.textAlign = 'center';

    eqCtx.textAlign = 'left';
    eqCtx.textBaseline = 'bottom';
    for (let i = 1; i <= 3; i++) {
        const y = eqCanvas.height * (i * 0.25);
        const text = `${100 - (i * 25)}%`;
        eqCtx.fillText(text, 5, y - 2);
    }

    const freqLabels = ['125', '250', '500', '1k', '2k', '4k', '6k', '8k', '12k'];
    eqCtx.textAlign = 'center';
    
    for (let i = 0; i < freqLabels.length; i++) {
        const bandIndex = (i + 1) * bandsPerZone;
        const x = HORIZONTAL_MARGIN + bandIndex * spacing;
        
        if ((i + 1) % 2 === 0) { 
            eqCtx.textBaseline = 'top';
            eqCtx.fillText(freqLabels[i], x, 5);
        } else { 
            eqCtx.textBaseline = 'bottom';
            eqCtx.fillText(freqLabels[i], x, eqCanvas.height - 5);
        }
    }
    
    eqCtx.restore();
}

function drawModeSpectrum(bandLevels) {
  if (showSpectrumGrid) {
    drawSpectrumGrid(bandLevels);
  }

  const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
  const spacing = totalDrawingWidth / (bandLevels.length - 1);
  const activeTheme = EQ_THEMES[currentThemeIndex];
  let strokeStyle;
  
  if (activeTheme.name === 'Server Themecolor') { strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00'; } 
  else if (activeTheme.colors.length === 1) { strokeStyle = activeTheme.colors[0]; } 
  else {
      const gradient = eqCtx.createLinearGradient(0, 0, eqCanvas.width, 0);
      activeTheme.colors.forEach((c, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1), c));
      strokeStyle = gradient;
  }

  eqCtx.strokeStyle = strokeStyle;
  eqCtx.lineWidth = 2;
  eqCtx.beginPath();
  
  bandLevels.forEach((level, i) => {
    let targetHeight = (level / 255) * eqCanvas.height * SENSITIVITY;
    if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;
    
    const x = HORIZONTAL_MARGIN + i * spacing;
    const y = eqCanvas.height - targetHeight;
    
    if (i === 0) {
        eqCtx.moveTo(x, y);
    } else {
        eqCtx.lineTo(x, y);
    }
  });
  
  eqCtx.stroke();
}

function drawModeWaveform(deltaTime) {
    const timeDataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeDataArray);

    const centerY = eqCanvas.height / 2;
    const currentSample = timeDataArray[Math.floor(timeDataArray.length / 2)];
    const amplitude = (currentSample - 128) * SENSITIVITY;
    const newY = { top: centerY + amplitude, bottom: centerY - amplitude };

    waveformHistory.push({ ...newY, timestamp: performance.now() });

    const historyDurationMs = WAVEFORM_DURATION * 1000;
    const cutoffTime = performance.now() - historyDurationMs;

    while (waveformHistory.length > 2 && waveformHistory[0].timestamp < cutoffTime) {
        waveformHistory.shift();
    }

    eqCtx.save();
    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    eqCtx.font = '10px Arial';
    eqCtx.textAlign = 'center';
    
    for (let i = 1; i < WAVEFORM_DURATION; i++) {
        const x = eqCanvas.width * (i / WAVEFORM_DURATION);
        eqCtx.beginPath();
        eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        eqCtx.setLineDash([2, 4]);
        eqCtx.moveTo(x, 0);
        eqCtx.lineTo(x, eqCanvas.height);
        eqCtx.stroke();
        eqCtx.fillText(`-${WAVEFORM_DURATION - i}s`, x, eqCanvas.height - 5);
    }
    eqCtx.restore();

    const activeTheme = EQ_THEMES[currentThemeIndex];
    let strokeStyle;
    if (activeTheme.name === 'Server Themecolor') {
        strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
    } else if (activeTheme.colors.length === 1) {
        strokeStyle = activeTheme.colors[0];
    } else {
        const gradient = eqCtx.createLinearGradient(0, 0, eqCanvas.width, 0);
        activeTheme.colors.forEach((c, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1), c));
        strokeStyle = gradient;
    }
    
    eqCtx.strokeStyle = strokeStyle;
    eqCtx.lineWidth = 2;
    if (WAVEFORM_GLOW_SIZE > 0) {
        eqCtx.shadowBlur = WAVEFORM_GLOW_SIZE;
        eqCtx.shadowColor = strokeStyle;
    }

    const sliceWidth = eqCanvas.width / (waveformHistory.length - 1);

    eqCtx.beginPath();
    for (let i = 0; i < waveformHistory.length; i++) {
        const x = i * sliceWidth;
        const y = waveformHistory[i].top;
        if (i === 0) {
            eqCtx.moveTo(x, y);
        } else {
            eqCtx.lineTo(x, y);
        }
    }
    eqCtx.stroke();

    eqCtx.beginPath();
    for (let i = 0; i < waveformHistory.length; i++) {
        const x = i * sliceWidth;
        const y = waveformHistory[i].bottom;
        if (i === 0) {
            eqCtx.moveTo(x, y);
        } else {
            eqCtx.lineTo(x, y);
        }
    }
    eqCtx.stroke();

    eqCtx.shadowBlur = 0;
}

function drawModeCircle(bandLevels, deltaTime) {
    const numBars = 60;
    
    const bandsPerPanel = numBars / 3;
    const bassBands = bandLevels.slice(0, bandsPerPanel);
    const midBands = bandLevels.slice(bandsPerPanel, bandsPerPanel * 2);
    const trebleBands = bandLevels.slice(bandsPerPanel * 2, numBars);

    if (currentBarHeights.length !== numBars) {
        currentBarHeights = new Array(numBars).fill(0);
        peakHeights = new Array(numBars).fill(0);
        peakHoldTimers = new Array(numBars).fill(0);
    }

    const panelWidth = eqCanvas.width / 3;
    const panelCenterY = eqCanvas.height / 2 - 5; 
    const panelPositions = [
        { x: panelWidth * 0.5, y: panelCenterY, label: "Bass" },
        { x: panelWidth * 1.5, y: panelCenterY, label: "Midrange" },
        { x: panelWidth * 2.5, y: panelCenterY, label: "Treble" }
    ];

    eqCtx.save();
    eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    eqCtx.lineWidth = 1;
    eqCtx.beginPath();
    eqCtx.moveTo(panelWidth, 10);
    eqCtx.lineTo(panelWidth, eqCanvas.height - 10);
    eqCtx.stroke();
    eqCtx.beginPath();
    eqCtx.moveTo(panelWidth * 2, 10);
    eqCtx.lineTo(panelWidth * 2, eqCanvas.height - 10);
    eqCtx.stroke();

    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const finalFontSize = CIRCLE_LABEL_BASE_FONT_SIZE * CIRCLE_LABEL_SCALE;
    eqCtx.font = `${finalFontSize}px Arial`;
    eqCtx.textAlign = 'center';
    eqCtx.textBaseline = 'bottom';
    panelPositions.forEach(panel => {
        eqCtx.fillText(panel.label, panel.x, eqCanvas.height - CIRCLE_LABEL_BOTTOM_OFFSET); 
    });
    eqCtx.restore();


    const activeTheme = EQ_THEMES[currentThemeIndex];
    
    let bassColor, midColor, trebleColor, peakColor;

    if (activeTheme.name === 'Server Themecolor') {
        const serverColor = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
        bassColor = midColor = trebleColor = peakColor = serverColor;
    } else if (activeTheme.colors.length >= 3) {
        bassColor = activeTheme.colors[0];
        midColor = activeTheme.colors[1];
        trebleColor = activeTheme.colors[2];
        peakColor = activeTheme.colors[0];
    } else {
        const singleColor = activeTheme.colors[0] || '#ffffff';
        bassColor = midColor = trebleColor = peakColor = singleColor;
    }

    const drawPanel = (bands, panel, color, offset) => {
        eqCtx.strokeStyle = color;
        const maxBarLength = CIRCLE_PANEL_RADIUS * CIRCLE_PANEL_BAR_LENGTH; 
        bands.forEach((level, i) => {
            const barIndex = i + offset;
            let targetHeight = (level / 255) * maxBarLength * SENSITIVITY;
            if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;
            
            currentBarHeights[barIndex] = targetHeight > currentBarHeights[barIndex] ? targetHeight : Math.max(0, currentBarHeights[barIndex] - (FALL_SPEED * deltaTime));

            const angle = (i / bands.length) * 2 * Math.PI - (Math.PI / 2);
            const barLength = currentBarHeights[barIndex];

            if (barLength > 0) {
                const x1 = panel.x + CIRCLE_PANEL_RADIUS * Math.cos(angle);
                const y1 = panel.y + CIRCLE_PANEL_RADIUS * Math.sin(angle);
                const x2 = panel.x + (CIRCLE_PANEL_RADIUS + barLength) * Math.cos(angle);
                const y2 = panel.y + (CIRCLE_PANEL_RADIUS + barLength) * Math.sin(angle);

                eqCtx.beginPath();
                eqCtx.moveTo(x1, y1);
                eqCtx.lineTo(x2, y2);
                eqCtx.lineWidth = CIRCLE_PANEL_LINE_WIDTH;
                eqCtx.stroke();
            }

            if (showPeakMeter) {
                if (currentBarHeights[barIndex] >= peakHeights[barIndex]) {
                    peakHeights[barIndex] = currentBarHeights[barIndex];
                    peakHoldTimers[barIndex] = performance.now();
                } else {
                    if (performance.now() - peakHoldTimers[barIndex] > PEAK_HOLD_TIME) {
                        peakHeights[barIndex] = Math.max(0, peakHeights[barIndex] - (PEAK_FALL_SPEED * deltaTime));
                    }
                }

                if (peakHeights[barIndex] > 0) {
                    const peakRadius = CIRCLE_PANEL_RADIUS + peakHeights[barIndex];
                    const startAngle = angle - CIRCLE_PEAK_ARC_SIZE / 2;
                    const endAngle = angle + CIRCLE_PEAK_ARC_SIZE / 2;

                    eqCtx.strokeStyle = peakColor; 
                    eqCtx.beginPath();
                    eqCtx.arc(panel.x, panel.y, peakRadius, startAngle, endAngle);
                    eqCtx.lineWidth = CIRCLE_PEAK_LINE_WIDTH;
                    eqCtx.stroke();

                    eqCtx.strokeStyle = color;
                }
            }
        });
    };

    drawPanel(bassBands, panelPositions[0], bassColor, 0);
    drawPanel(midBands, panelPositions[1], midColor, bandsPerPanel);
    drawPanel(trebleBands, panelPositions[2], trebleColor, bandsPerPanel * 2);
}

function drawModeMirroredBars(bandLevels, deltaTime) {
    const numBars = 20;
    const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
    const barWidth = (totalDrawingWidth / 2 - (BAR_SPACING * (numBars / 2 - 1))) / (numBars / 2);
    const centerX = eqCanvas.width / 2;

    const activeTheme = EQ_THEMES[currentThemeIndex];
    let fillStyle;
    if (activeTheme.name === 'Server Themecolor') { fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00'; } 
    else if (activeTheme.colors.length === 1) { fillStyle = activeTheme.colors[0]; } 
    else {
        const gradient = eqCtx.createLinearGradient(0, eqCanvas.height, 0, 0);
        activeTheme.colors.forEach((c, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1), c));
        fillStyle = gradient;
    }
    
    bandLevels.forEach((level, i) => {
        let targetHeight = (level / 255) * eqCanvas.height * SENSITIVITY;
        if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;
        
        currentBarHeights[i] = targetHeight > currentBarHeights[i] ? targetHeight : Math.max(0, currentBarHeights[i] - (FALL_SPEED * deltaTime));
        
        const finalVisibleHeight = MINIMUM_BAR_HEIGHT + currentBarHeights[i];
        const y = eqCanvas.height - finalVisibleHeight;

        if (i < numBars / 2) {
            eqCtx.fillStyle = fillStyle;
            const x_left = centerX - (i + 1) * (barWidth + BAR_SPACING);
            eqCtx.fillRect(x_left, y, barWidth, finalVisibleHeight);
            const x_right = centerX + i * (barWidth + BAR_SPACING);
            eqCtx.fillRect(x_right, y, barWidth, finalVisibleHeight);
        }

        if (showPeakMeter) {
            if (currentBarHeights[i] >= peakHeights[i]) {
                peakHeights[i] = currentBarHeights[i];
                peakHoldTimers[i] = performance.now();
            } else {
                if (performance.now() - peakHoldTimers[i] > PEAK_HOLD_TIME) {
                    peakHeights[i] = Math.max(0, peakHeights[i] - (PEAK_FALL_SPEED * deltaTime));
                }
            }

            if (peakHeights[i] > 0 && i < numBars / 2) {
                const peakY = eqCanvas.height - peakHeights[i] - PEAK_BAR_HEIGHT;
                if (peakY < y - PEAK_BAR_HEIGHT) {
                    const x_left = centerX - (i + 1) * (barWidth + BAR_SPACING);
                    eqCtx.fillStyle = fillStyle;
                    eqCtx.fillRect(x_left, peakY, barWidth, PEAK_BAR_HEIGHT);
                    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    eqCtx.fillRect(x_left, peakY, barWidth, PEAK_BAR_HEIGHT);

                    const x_right = centerX + i * (barWidth + BAR_SPACING);
                    eqCtx.fillStyle = fillStyle;
                    eqCtx.fillRect(x_right, peakY, barWidth, PEAK_BAR_HEIGHT);
                    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    eqCtx.fillRect(x_right, peakY, barWidth, PEAK_BAR_HEIGHT);
                }
            }
        }
    });
}

setInterval(() => {
    const isEnabled = localStorage.getItem('visualeqEnabled') !== 'false';
    if (!isEnabled) {
        return; 
    }

    if (currentFftSize === FFT_SIZES.OFF) {
        return;
    }

    if (animationFrameId !== null) {
        if (!Stream || !Stream.Fallback || !Stream.Fallback.Audio || Stream.Fallback.Audio.state !== 'running') {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            analyser = null;
            if (isEqLayoutActive) showStandbyText();
            console.log("VisualEQ Watchdog: Audio stream stopped. Resetting.");
        }
        return;
    }

    if (Stream && Stream.Fallback && Stream.Fallback.Audio && Stream.Fallback.Audio.state === 'running') {
        console.log("VisualEQ Watchdog: Audio stream is active. Starting visualizer.");
        if (!isEqLayoutActive) {
            setupVisualEQLayout();
        } else {
            startOrRestartEQ();
        }
    }
}, 1000);
})();
