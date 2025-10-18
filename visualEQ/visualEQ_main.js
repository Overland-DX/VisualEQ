// -----------------------------------------------------------
// Credit: The method for connecting to the audio stream via
// Stream.Fallback.Player.Amplification was first demonstrated
// in the "Peakmeter" plugin by Highpoint. Thanks!
// -----------------------------------------------------------

(() => {
    // ===================================================================================
    // VisualEQ v1.7.0 :: CONFIGURATION
    // ===================================================================================

    // -----------------------------------------------------------------------------------
    // SECTION 0: SERVER OWNER DEFAULTS
    // -----------------------------------------------------------------------------------
    // This section allows the server owner to set the default appearance and behavior
    // for first-time users or users who have not saved their own settings yet.
    // Once a user changes a setting in the settings modal, their choice will be saved
    // and will override these defaults.
	const SERVER_OWNER_DEFAULTS = {
        // ===================================================================================
        // SECTION A: GENERAL DEFAULTS
        // ===================================================================================

        // Should the plugin be enabled by default for new users?
        // Valid options: true, false
        DEFAULT_PLUGIN_ENABLED: true,

		// Should the settings button be hidden by default?
        // Valid options: true, false
        DEFAULT_DISABLE_SETTINGS: false,

        // Default theme for the visualizer.
        // IMPORTANT: The name must exactly match a theme name from the 'EQ_THEMES' list below.
        DEFAULT_THEME_NAME: 'Server Themecolor',

        // Default visualizer mode shown to first-time users.
        // Valid options: 'Bars', 'LED', 'Spectrum', 'Waveform', 'Circle', 'Mirrored Bars', '10-Band EQ + VU', '10-Band EQ + VU LED'
        DEFAULT_VISUALIZER_MODE: 'Bars',


        // ===================================================================================
        // SECTION B: MODE-SPECIFIC DEFAULTS
        // ===================================================================================

        // Should the "Peak Meter" (the top-most line/dot) be shown by default?
        // Applies to modes: 'Bars', 'LED', 'Circle', 'Mirrored Bars'.
        // Valid options: true, false
        DEFAULT_SHOW_PEAK_METER: true,

        // Should the grid and frequency labels (Hz) be shown in 'Spectrum' mode?
        // Valid options: true, false
        DEFAULT_SHOW_SPECTRUM_GRID: true,
        
        // Should the background grid be shown in 'Bars' and 'LED' mode?
        // Valid options: true, false
        DEFAULT_SHOW_BARS_GRID: true,

        // Should the background grid be shown in 'Waveform' mode?
        // Valid options: true, false
        DEFAULT_SHOW_WAVEFORM_GRID: true,

		// This adds the background, dB scale, titles, and separator.
        // Applies to modes: '10-Band EQ + VU', '10-Band EQ + VU LED'.
        // Valid options: true, false
        DEFAULT_SHOW_10BandVu_GRID: true,

        // Default "Neon Glow" effect for 'Waveform' mode.
        // Recommended to be 0 for best performance, especially on mobile devices.
        // Valid options: 0 (off), 1-10 (glow intensity)
        DEFAULT_WAVEFORM_GLOW: 0,


        // ===================================================================================
        // SECTION C: ADVANCED SENSITIVITY BASE-TUNING
        // ===================================================================================
        // Because the audio source level can vary greatly between different servers, you can
        // pre-adjust a "base sensitivity" for specific modes here. These values act as a 
        // multiplier on top of the user's own sensitivity slider.
        // A value of 1.0 is neutral (no change). 2.0 provides double the visual output.
		
        // Boosts the 'Waveform' mode, which often appears weaker than other modes.
        // Recommended value: between 0.1 and 2.5
		WAVEFORM_SENSITIVITY_BOOST: 0.8, 

        // Boosts the 'Circle' mode for a more distinct pulse effect.
        // Recommended value: between 0.1 and 1.8
        CIRCLE_SENSITIVITY_BOOST: 0.6,

        // ===================================================================================
        // VU METER CONFIG (FOR '10-Band EQ + VU' & '10-Band EQ + VU LED' MODE)
        // ===================================================================================
         VU_METER_CONFIG: {
            // Audio levels below this threshold will be ignored (reduces noise).
            // Recommended: 0.5 to 5.0
            NOISE_GATE: 1.0,

            // A general gain applied to the signal before the exponential curve.
            // This acts as the default sensitivity for the VU Meter slider.
            // Recommended: 0.2 to 0.6
            AMPLIFICATION: 0.2,

            // The "magic" value. Values above 1.0 make the movement exponential.
            // Recommended: 1.8 to 2.2
            RISE_EXPONENT: 1.6,

            // Exaggerates the difference between L and R for a more pronounced stereo effect.
            // 1.0 = No exaggeration. 1.5 = 50% extra separation.
            // Recommended: 1.2 to 3.0
            STEREO_EXAGGERATION: 2.0
			
        }
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
	const PLUGIN_LOAD_DELAY = 1000; // Milliseconds to wait after the page is fully loaded before starting the plugin.
  
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
    const SENSITIVITY_MIN = 0.1; // The minimum value for the sensitivity slider.
    const SENSITIVITY_MAX = 1.9; // The maximum value for the sensitivity slider.

    const FALL_SPEED = 120; // How quickly the bars fall (higher value = faster fall).
    const HORIZONTAL_MARGIN = 5; // The space (in pixels) on the left and right edges of the visualizer.
    const BAR_SPACING = 2; // The space (in pixels) between each bar in 'Bars' and 'LED' mode.
    const CORNER_RADIUS = 2; // The corner roundness for 'Bars' mode. Set to 0 for sharp corners.
	
	
	// --- Visualizer Modes ---
	// Server owner can safely remove modes from this list to limit user choices.
	// IMPORTANT: Do not change the order or add new names without adding a corresponding drawMode... function.
	// Default: ['Bars', 'LED', 'Spectrum', 'Waveform', 'Circle', 'Mirrored Bars', '10-Band EQ + VU', '10-Band EQ + VU LED']
	const VISUALIZER_MODES = ['Bars', 'LED', 'Spectrum', 'Waveform', 'Circle', 'Mirrored Bars', '10-Band EQ + VU', '10-Band EQ + VU LED'];

	// --- Peak Meter ---
	const PEAK_HOLD_TIME = 500; // How long the peak line should "hold" at the top (in milliseconds). Default: 500
	const PEAK_FALL_SPEED = 50; // How quickly the peak line falls after holding (lower value = slower). Default: 50
	const PEAK_BAR_HEIGHT = 2;  // The thickness (in pixels) of the peak line. Default: 2

	// --- LED Mode Specific ---
	const LED_BLOCK_COUNT = 18;    // The number of vertical LED blocks in each bar for 'LED' mode. Default: 18
	const LED_BLOCK_SPACING = 2;   // The space (in pixels) between each vertical LED block. Default: 2

	// --- Waveform Mode Specific ---
	const WAVEFORM_GLOW_DEFAULT = 0;   // The default "neon glow" size.
	const WAVEFORM_DURATION_DEFAULT = 5; // Default duration in seconds.
	const WAVEFORM_DURATION_MIN = 2;     // Minimum duration for the slider.
	const WAVEFORM_DURATION_MAX = 10;    // Maximum duration for the slider.

	// --- Circle Mode Specific (3-Panel Layout) ---
	const CIRCLE_PANEL_RADIUS = 5;      // The inner radius of each of the three circles. Default: 35
	const CIRCLE_PANEL_LINE_WIDTH = 2;   // The thickness of the pulsating lines. Default: 2
	const CIRCLE_PEAK_LINE_WIDTH = 0.8;  // The thickness of the peak meter arc. Default: 0.8
	const CIRCLE_PEAK_ARC_SIZE = 0.06;   // The length of the peak meter arc (in radians). Default: 0.06

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
	
	const DEFAULT_THEME_INDEX = EQ_THEMES.findIndex(theme => theme.name === SERVER_OWNER_DEFAULTS.DEFAULT_THEME_NAME) || 0;

    // -----------------------------------------------------------------------------------
    // SECTION 2: CORE PLUGIN SETTINGS (Advanced users only)
    // -----------------------------------------------------------------------------------

    // --- Core Audio Processing ---
    const MINIMUM_BAR_HEIGHT = 2; // The minimum visible height of a bar to prevent it from disappearing completely.
    const NOISE_GATE_THRESHOLD = 1.0; // Audio values below this will be treated as silence. Helps reduce background noise flicker.


    // =================================================================
    // ADVANCED EQ BAND TUNING
    // =================================================================
    // This section allows for fine-tuning the visual response of each EQ bar.
    // The arrays for each mode (10-band and 20-band) must have the same number of elements.

    // --- TUNING FOR 10-BAND MODES ('10-Band EQ + VU', '10-Band EQ + VU LED') ---

    // The center frequency (in Hz) for each EQ bar. This determines which part
    // of the audio spectrum each bar represents.
    const centerFrequencies_10_bands = [
        32, 64, 128, 256, 512, 1028, 2048, 4098, 8196, 12000
    ];

    // A pre-amplifier gain for each band. This is the main tool for balancing the visualizer.
    // - Values < 1.0 will tame over-active bands (like bass).
    // - Values > 1.0 will boost weaker bands (like treble).
    // - 1.0 = no change.
    const preAmpGains_10_bands = [
        0.95, 0.95, 0.95, 0.85, 0.95, 1.0, 1.0, 1.0, 1.0, 1.0
    ];

    // A noise gate threshold (0-255) for each band. Audio signals below this value will be ignored.
    // Increase this value for a band if it's flickering or always slightly active on quiet audio.
    const floorLevels_10_bands = [
        10, 10, 10, 10, 8, 5, 5, 5, 5, 5
    ];

    // --- TUNING FOR 20-BAND MODES ('Bars', 'LED', 'Mirrored Bars', 'Circle') ---

    // The center frequency (in Hz) for each of the 20 EQ bars.
	const centerFrequencies_20_bands = [
		32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1028, 1542, 2048, 3072, 4098, 6147, 8196, 10000, 12000, 14000
	];

    // Pre-amplifier gain for each of the 20 bands.
    const preAmpGains_20_bands = [
        0.95, 0.95, 0.95, 0.95, 0.95, 1.0, 1.05, 1.10, 1.10, 1.10, 1.10, 1.15, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.8
    ];

    // Noise gate threshold (0-255) for each of the 20 bands.
	const floorLevels_20_bands = [
		20, 25, 20, 20, 20, 18, 15, 12, 10, 8, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
	];

    // --- Analyser Quality ---
    // These are the specific FFT (Fast Fourier Transform) sizes for the Web Audio API.
    // Changing these values without understanding the API can break the visualizer.
    const FFT_SIZES = {
        Low: 1024,
        Medium: 4096,
        High: 8192
    };


    const PLUGIN_VERSION = 'v1.7.0';
    const GITHUB_URL = 'https://github.com/Overland-DX/VisualEQ.git';

    let currentFftSize = FFT_SIZES.Medium;
    let SENSITIVITY = SENSITIVITY_DEFAULT;
    let audioContext, channelSplitter, analyserLeft, analyserRight, dataArrayLeft, dataArrayRight;
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
    let settingsButtonRef = null;
    let currentThemeIndex = 0;
	let showWaveformGrid = true;
	let waveformDuration = WAVEFORM_DURATION_DEFAULT;
	let isWaveformStereo = true;
    let visualEqContainerRef = null;
	let cachedFillStyle = null;
	let cachedLedColors = []; 
	let cachedLedPeakColor = '';
	let gridCanvas = null;
	let gridCtx = null;
	let cachedWaveformStrokeStyle = null;
	let waveformHistoryBuffer = [];
	let waveformHistoryIndex = 0;
	const WAVEFORM_BUFFER_SIZE = 1024;
	const TARGET_FPS = 60;
	const TARGET_INTERVAL = 1000 / TARGET_FPS;
	let timeSinceLastSample = 0;
	let latestBandLevels = [];
	let cachedCircleColors = {};
	let showBarsGrid = true;
	let waveformGlowSize = WAVEFORM_GLOW_DEFAULT; 
	let vuMeterSensitivity = SERVER_OWNER_DEFAULTS.VU_METER_CONFIG.AMPLIFICATION;
	let show10BandVuGrid = SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_10BandVu_GRID;
	let leftVuLevel = 0; 
	let rightVuLevel = 0;
	let peakVuLevels = [0, 0];
	let peakVuHoldTimers = [0, 0];
	let latestLeftVuLevel = 0;
	let latestRightVuLevel = 0;
	
	

    // ────────────────────────────────────────────────────────────
    // INITIALISERING
    // ────────────────────────────────────────────────────────────
    window.addEventListener("load", () => {
        if (window.innerWidth < MOBILE_BREAKPOINT) return;

        setTimeout(setupPlugin, PLUGIN_LOAD_DELAY);

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

const SETTINGS_STORAGE_KEY = 'visualeq_settings';

function loadAllSettings() {
    try {
        const settingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return settingsJson ? JSON.parse(settingsJson) : { global: {}, modes: {} };
    } catch (e) {
        console.error("VisualEQ: Kunne ikke parse lagrede innstillinger.", e);
        return { global: {}, modes: {} };
    }
}

function saveAllSettings(settings) {
    if (SERVER_OWNER_DEFAULTS.DEFAULT_DISABLE_SETTINGS) {
        return;
    }
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("VisualEQ: Kunne ikke lagre innstillinger.", e);
    }
}

function saveSettingForMode(mode, key, value) {
    const settings = loadAllSettings();
    
    if (!settings.modes) settings.modes = {};
    if (!settings.modes[mode]) settings.modes[mode] = {};

    settings.modes[mode][key] = value;
    saveAllSettings(settings);
}

function saveGlobalSetting(key, value) {
    const settings = loadAllSettings();
    if (!settings.global) settings.global = {};
    
    settings.global[key] = value;
    saveAllSettings(settings);
}

function cleanupOldSettings() {
    const LAST_RUN_VERSION_KEY = 'visualeq_last_run_version';
    const storedVersion = localStorage.getItem(LAST_RUN_VERSION_KEY);

    if (storedVersion !== PLUGIN_VERSION) {
        console.log(`VisualEQ: Oppgraderer fra versjon ${storedVersion || 'ukjent'} til ${PLUGIN_VERSION}. Renser gamle innstillinger.`);

        const oldSettingKeys = [
            'themeIndex', 'sensitivity', 'showPeak', 'showGrid', 
            'showBarsGrid', 'waveformStereo', 'waveformGrid', 
            'waveformDuration', 'waveformGlow'
        ];

        VISUALIZER_MODES.forEach(mode => {
            oldSettingKeys.forEach(key => {
                localStorage.removeItem(`visualeq_${mode}_${key}`);
            });
        });

        localStorage.removeItem('visualeqEnabled');
        localStorage.removeItem('visualeqMode');
        localStorage.removeItem('visualeqFftSize');

        console.log("VisualEQ: Gamle innstillinger er fjernet.");

        localStorage.setItem(LAST_RUN_VERSION_KEY, PLUGIN_VERSION);
    }
}

function setupPlugin() {
    addVisualEQToggle();
	cleanupOldSettings();

    const VISIBILITY_STORAGE_KEY = 'visualeq_enabled_state';
    const storedVisibility = localStorage.getItem(VISIBILITY_STORAGE_KEY);

    const isEnabled = storedVisibility !== null
        ? (storedVisibility === 'true')
        : SERVER_OWNER_DEFAULTS.DEFAULT_PLUGIN_ENABLED;

    if (!isEnabled) {
        console.log("VisualEQ is disabled via side menu setting.");
        return;
    }

    const disableSettings = SERVER_OWNER_DEFAULTS.DEFAULT_DISABLE_SETTINGS;
    const allSettings = loadAllSettings();

    if (disableSettings) {
        currentVisualizerMode = SERVER_OWNER_DEFAULTS.DEFAULT_VISUALIZER_MODE;
        currentThemeIndex = DEFAULT_THEME_INDEX;
        SENSITIVITY = SENSITIVITY_DEFAULT;
        showPeakMeter = SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_PEAK_METER;
        showSpectrumGrid = SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_SPECTRUM_GRID;
        showBarsGrid = SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_BARS_GRID;
        isWaveformStereo = true;
        showWaveformGrid = SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_WAVEFORM_GRID;
        waveformDuration = WAVEFORM_DURATION_DEFAULT;
        waveformGlowSize = SERVER_OWNER_DEFAULTS.DEFAULT_WAVEFORM_GLOW;
        currentFftSize = FFT_SIZES.Medium;
    } else {
        currentVisualizerMode = allSettings.global?.lastMode ?? SERVER_OWNER_DEFAULTS.DEFAULT_VISUALIZER_MODE;
        
        const modeSettings = allSettings.modes?.[currentVisualizerMode] || {};

        currentThemeIndex = modeSettings.themeIndex ?? DEFAULT_THEME_INDEX;
        SENSITIVITY = modeSettings.sensitivity ?? SENSITIVITY_DEFAULT;
        showPeakMeter = modeSettings.showPeak ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_PEAK_METER;
        showSpectrumGrid = modeSettings.showGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_SPECTRUM_GRID;
        showBarsGrid = modeSettings.showBarsGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_BARS_GRID;
        isWaveformStereo = modeSettings.waveformStereo ?? true;
        showWaveformGrid = modeSettings.waveformGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_WAVEFORM_GRID;
        waveformDuration = modeSettings.waveformDuration ?? WAVEFORM_DURATION_DEFAULT;
        waveformGlowSize = modeSettings.waveformGlow ?? SERVER_OWNER_DEFAULTS.DEFAULT_WAVEFORM_GLOW;

        currentFftSize = allSettings.global?.fftSize ?? FFT_SIZES.Medium;
        
        if (currentFftSize === 2048) {
            currentFftSize = 4096;
            saveGlobalSetting('fftSize', currentFftSize);
        }
    }

    injectPluginStyles();

    if (!disableSettings) {
        settingsButtonRef = createSettingsButton();
        createSettingsModal();
    } else {
        settingsButtonRef = document.createElement('div');
    }

    gridCanvas = document.createElement('canvas');
    gridCtx = gridCanvas.getContext('2d');

    const initialY = { top: 0, bottom: 0 };
    waveformHistoryBuffer = new Array(WAVEFORM_BUFFER_SIZE).fill(initialY);
    
    const waitForLogoAndInit = () => {
        const timeout = setTimeout(() => {
            console.warn('VisualEQ: Timeout waiting for logo plugin. Running layout anyway.');
            observer.disconnect();
            setupVisualEQLayout();
        }, 3000);

        const observer = new MutationObserver((mutations, obs) => {
            const logoElement = document.getElementById('logo-container-desktop') || document.getElementById('logo-container');
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

    setInterval(() => {
        const isStreamRunning = Stream && Stream.Fallback && Stream.Fallback.Audio && Stream.Fallback.Audio.state === 'running';

        if (isStreamRunning) {
            if (animationFrameId === null) {
                console.log("VisualEQ Watchdog: Audio stream is active. Starting visualizer.");
                if (!isEqLayoutActive) {
                    setupVisualEQLayout();
                } else {
                    startOrRestartEQ();
                }
            }
        } else {
            if (animationFrameId !== null) {
                console.log("VisualEQ Watchdog: Audio stream stopped. Resetting.");
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                if (isEqLayoutActive) showStandbyText();
            } 
            else if (isEqLayoutActive) {
                showStandbyText();
            }
        }
    }, 1000);
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

    const VISIBILITY_STORAGE_KEY = 'visualeq_enabled_state';
    const storedVisibility = localStorage.getItem(VISIBILITY_STORAGE_KEY);
    
    const isEnabled = storedVisibility !== null
        ? (storedVisibility === 'true')
        : SERVER_OWNER_DEFAULTS.DEFAULT_PLUGIN_ENABLED;

    document.getElementById(id).checked = !isEnabled;

    document.getElementById(id).addEventListener("change", function () {
        const shouldBeEnabled = !this.checked;

        localStorage.setItem(VISIBILITY_STORAGE_KEY, shouldBeEnabled);

        window.location.reload();
    });
}

function setupVisualEQLayout() {
    if (isEqLayoutActive) return;

    const psContainer = document.getElementById('ps-container');
    const flagsContainer = document.getElementById('flags-container-desktop');
    const playButtonBlock = document.querySelector('.playbutton')?.closest('div[class*="panel-10"]');
    const logoContainer = document.getElementById('logo-container-desktop') || document.getElementById('logo-container');
    const logoBlock = logoContainer?.closest('div[class*="panel-"]');
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
			drawBarsGridToBuffer(); 
            drawWaveformGrid(); 
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
      .visualeq-tooltip-text {
          top: 0;
          left: 0;
          position: absolute;
          background-color: var(--color-2);
          border: 2px solid var(--color-3);
          color: var(--color-text);
          text-align: center;
          font-size: 14px;
          border-radius: 15px;
          padding: 5px 25px;
          z-index: 10001;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none; 
      }

      .visualeq-range-slider { 
          -webkit-appearance: none; 
          appearance: none; 
          width: 100%; 
          height: 14px; 
          background: var(--color-2, #555); 
          border-radius: 7px; 
          outline: none; 
          padding: 0; 
          margin-top: 0.6em; 
      }

      .visualeq-range-slider::-webkit-slider-thumb { 
          -webkit-appearance: none; 
          appearance: none; 
          width: 28px; 
          height: 28px; 
          background-color: var(--color-4, #E6C269); 
          background-image: none !important;
          border-radius: 50%; 
          cursor: pointer; 
          border: 3px solid var(--color-1, #111); 
          transition: transform 0.2s ease; 
      }

      .visualeq-range-slider::-moz-range-thumb { 
          width: 28px;
          height: 28px;
          background-color: var(--color-4, #E6C269); 
          background-image: none !important; 
          border-radius: 50%; 
          cursor: pointer; 
          border: 3px solid var(--color-1, #111); 
          transition: transform 0.2s ease; 
      }

	  .visualeq-range-slider { 
          -webkit-appearance: none; 
          appearance: none; 
          width: 100%; 
          height: 14px; 
          background: var(--color-2, #555);
          border-radius: 7px; 
          outline: none; 
          padding: 0; 
          margin-top: 0.6em;
          pointer-events: none;
      }

      .visualeq-range-slider::-webkit-slider-thumb { 
          -webkit-appearance: none; 
          appearance: none; 
          width: 28px; 
          height: 28px; 
          background-color: var(--color-4, #E6C269); 
          background-image: none !important;
          border-radius: 50%; 
          cursor: pointer; 
          border: 3px solid var(--color-1, #111); 
          transition: transform 0.2s ease;
          pointer-events: auto;
      }

      .visualeq-range-slider::-moz-range-thumb { 
          width: 28px;
          height: 28px;
          background-color: var(--color-4, #E6C269); 
          background-image: none !important; 
          border-radius: 50%; 
          cursor: pointer; 
          border: 3px solid var(--color-1, #111); 
          transition: transform 0.2s ease;
          pointer-events: auto;
      }

      .visualeq-range-slider:hover::-webkit-slider-thumb { 
		  transform: scale(1.1); 
	  }

      .visualeq-range-slider:hover::-moz-range-thumb {
		  transform: scale(1.1); 
	  }

      .visualeq-modal-content {
          background: var(--color-1, #121010);
          color: var(--color-3, #FFF);
          border: 1px solid var(--color-2, #333);
      }

      .visualeq-modal-content .header {
          background: var(--color-2, #2A2A2A);
          padding: 10px 15px;
          border-bottom: 1px solid var(--color-2, #333);
      }

      #fmdx-modal-close-visualeq {
          background: var(--color-4, rgba(255,255,255,0.1));
          color: var(--color-1, #FFF);
          transition: background-color 0.2s, transform 0.2s;
      }

      #fmdx-modal-close-visualeq:hover {
          background: var(--color-5, #E6C269);
          color: var(--color-1, #111);
          transform: rotate(90deg);
      }

      .visualeq-modal-content h2 {
          color: var(--color-5, #FFF);
          font-size: 2em;
          margin: 0;
      }

      .visualeq-modal-content .header a {
          color: var(--color-5, #FFF);
          opacity: 0.8;
      }

      .visualeq-modal-content label {
          display: block;
          margin-bottom: 0.6em;
          font-weight: bold;
          color: var(--color-5, #E6C269);
          text-transform: uppercase;
          font-size: 0.9em;
      }

      #visualeq-mode-settings-header h4 {
          color: var(--color-4, #E6C269);
          margin-top: 1.5em;
          margin-bottom: 0;
          font-size: 0.9em;
          text-transform: uppercase;
          opacity: 0.8;
      }

      .visualeq-modal-content .help-section hr {
          border: none;
          border-top: 1px solid var(--color-4, #444);
          opacity: 0.5;
          margin: 2em 0;
      }

      .visualeq-modal-content .help-section p {
          color: var(--color-5, #FFF);
          opacity: 0.8; /* Justert fra 2 */
      }

      .visualeq-modal-content select {
          width: 100%;
          padding: 0.8em;
          background: var(--color-2, #333);
          color: var(--color-5, #FFF);
          border: 1px solid var(--color-1, #444);
          border-radius: 12px;
          font-size: 1em;
      }

      .visualeq-checkbox-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5em;
          padding: 0.8em;
          background-color: var(--color-2, #2A2A2A);
          border-radius: 12px;
          border: 1px solid var(--color-1, #444);
      }

      .visualeq-checkbox-container label {
          color: var(--color-4, #E6C269);
          text-transform: uppercase;
          font-size: 0.9em;
          margin-bottom: 0;
      }

      .visualeq-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
      }

      .visualeq-switch input {
          opacity: 0;
          width: 0;
          height: 0;
      }

      .visualeq-switch .visualeq-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-1, #ccc);
          transition: .4s;
          border-radius: 24px;
      }

      .visualeq-switch .visualeq-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
      }

      .visualeq-switch input:checked + .visualeq-slider {
          background-color: var(--color-4, #2196F3);
      }
      .visualeq-switch input:checked + .visualeq-slider:before {
          transform: translateX(20px);
      }

    `;
    document.head.appendChild(pluginStyles);
}
	
function createSettingsButton() {
    const wrapper = document.createElement('div');
    forceStyle(wrapper, {
        position: 'absolute', top: '-4px', right: '10px', zIndex: '10',
        cursor: 'pointer', width: '30px', height: '30px'
    });

    let borderColor = getComputedStyle(document.documentElement).getPropertyValue('--container-border-color').trim() || 'white';
    const settingsButton = document.createElement('button');
    settingsButton.id = 'fmdx-settings-btn';
    settingsButton.innerHTML = '⚙️';
    forceStyle(settingsButton, {
        background: 'rgba(0,0,0,0.5)', border: `1px solid ${borderColor}`, color: 'white',
        borderRadius: '50%', cursor: 'pointer', width: '40px', height: '40px',
        fontSize: '28px', lineHeight: '22px', padding: '0', textAlign: 'center',
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

function updateCachedStyles() {
    if (!eqCtx) return;

    const activeTheme = EQ_THEMES[currentThemeIndex];

    if (activeTheme.name === 'Server Themecolor') {
        cachedFillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
    } else if (activeTheme.colors.length === 1) {
        cachedFillStyle = activeTheme.colors[0];
    } else {
        const gradient = eqCtx.createLinearGradient(0, eqCanvas.height, 0, 0);
        activeTheme.colors.forEach((c, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1), c));
        cachedFillStyle = gradient;
    }

    cachedLedColors = [];
    for (let j = 0; j < LED_BLOCK_COUNT; j++) {
        let color;
        const percent = j / LED_BLOCK_COUNT;
        if (activeTheme.colors.length >= 3) {
            if (percent > 0.8) color = activeTheme.colors[2];
            else if (percent > 0.5) color = activeTheme.colors[1];
            else color = activeTheme.colors[0];
        } else if (activeTheme.colors.length === 2) {
            color = percent > 0.6 ? activeTheme.colors[1] : activeTheme.colors[0];
        } else if (activeTheme.colors.length === 1) {
            color = activeTheme.colors[0];
        } else {
            color = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
        }
        cachedLedColors.push(color);
    }
    cachedLedPeakColor = activeTheme.colors[activeTheme.colors.length - 1] || '#ff0000';
    
    let cachedStrokeStyle;
    if (activeTheme.name === 'Server Themecolor') {
        cachedStrokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
    } else if (activeTheme.colors.length === 1) {
        cachedStrokeStyle = activeTheme.colors[0];
    } else {
        const gradient = eqCtx.createLinearGradient(0, 0, eqCanvas.width, 0);
        activeTheme.colors.forEach((c, i) => gradient.addColorStop(i / (activeTheme.colors.length - 1), c));
        cachedStrokeStyle = gradient;
    }
    cachedWaveformStrokeStyle = cachedStrokeStyle;

    if (activeTheme.name === 'Server Themecolor') {
        const serverColor = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
        cachedCircleColors = { bass: serverColor, mid: serverColor, treble: serverColor, peak: serverColor };
    } else if (activeTheme.colors.length >= 3) {
        cachedCircleColors = { 
            bass: activeTheme.colors[0], 
            mid: activeTheme.colors[1], 
            treble: activeTheme.colors[2], 
            peak: activeTheme.colors[0] 
        };
    } else {
        const singleColor = activeTheme.colors[0] || '#ffffff';
        cachedCircleColors = { bass: singleColor, mid: singleColor, treble: singleColor, peak: singleColor };
    }
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
        <div>
            <h2 style="margin: 0 0 4px 0;">EQ Settings</h2>
            <a href="${GITHUB_URL}" target="_blank" style="text-decoration: none; cursor: pointer;">
                <span id="visualeq-version-info" style="font-size: 0.9em;">VisualEQ ${PLUGIN_VERSION}</span>
            </a>
        </div>`;

    const closeButton = document.createElement('button');
    closeButton.id = 'fmdx-modal-close-visualeq';
    closeButton.innerHTML = '&times;';
    forceStyle(closeButton, { position: 'absolute', top: '15px', right: '15px', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px', fontSize: '1.8em', lineHeight: '30px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' });

    const scrollableArea = document.createElement('div');
    forceStyle(scrollableArea, { overflowY: 'auto', padding: '15px 25px 25px', flex: '1 1 auto' });

    const sliderTooltip = document.createElement('div');
    sliderTooltip.className = 'visualeq-tooltip-text';
    forceStyle(sliderTooltip, { transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: '10002', opacity: '0' });
    
    const modeSelect = document.createElement('select');
    modeSelect.id = 'visualeq-mode-select';
    VISUALIZER_MODES.forEach(mode => { modeSelect.innerHTML += `<option value="${mode}" ${mode === currentVisualizerMode ? 'selected' : ''}>${mode}</option>`; });

    const themeSelect = document.createElement('select');
    themeSelect.id = 'visualeq-theme-select';
    EQ_THEMES.forEach((theme, index) => { themeSelect.innerHTML += `<option value="${index}" ${index === currentThemeIndex ? 'selected' : ''}>${theme.name}</option>`; });

    const modeSettingsHeader = document.createElement('div');
    modeSettingsHeader.id = 'visualeq-mode-settings-header';
    modeSettingsHeader.style.display = 'none';
    modeSettingsHeader.innerHTML = `<h4>Current Mode Settings</h4><hr style="opacity: 0.2; margin-top: 5px;">`;

    const qualitySelect = document.createElement('select');
    qualitySelect.id = 'visualeq-quality-select';
    Object.keys(FFT_SIZES).forEach(key => { qualitySelect.innerHTML += `<option value="${FFT_SIZES[key]}" ${FFT_SIZES[key] === currentFftSize ? 'selected' : ''}>${key}</option>`; });

    const sensitivitySlider = document.createElement('input');
    sensitivitySlider.id = 'visualeq-sensitivity-slider';
    sensitivitySlider.className = 'visualeq-range-slider';
    Object.assign(sensitivitySlider, { type: 'range', min: SENSITIVITY_MIN, max: SENSITIVITY_MAX, step: 0.1, value: SENSITIVITY });

    const sensLabelEl = document.createElement('label');
    sensLabelEl.id = 'visualeq-sensitivity-label';
    sensLabelEl.htmlFor = 'sensitivity';
    sensLabelEl.innerHTML = `Sensitivity <span>(${SENSITIVITY.toFixed(1)})</span>`;

    const vuSensitivitySlider = document.createElement('input');
    vuSensitivitySlider.id = 'visualeq-vu-sensitivity-slider';
    vuSensitivitySlider.className = 'visualeq-range-slider';
    Object.assign(vuSensitivitySlider, { type: 'range', min: 0.1, max: 1.2, step: 0.05, value: vuMeterSensitivity });

    const vuSensLabelEl = document.createElement('label');
    vuSensLabelEl.id = 'visualeq-vu-sensitivity-label';
    vuSensLabelEl.innerHTML = `VU Meter Sensitivity <span>(${vuMeterSensitivity.toFixed(2)})</span>`;

    const vuSensitivityContainer = document.createElement('div');
    forceStyle(vuSensitivityContainer, { marginTop: '1.5em', display: 'none' });
    vuSensitivityContainer.append(vuSensLabelEl, vuSensitivitySlider);

    const waveformDurationSlider = document.createElement('input');
    waveformDurationSlider.id = 'visualeq-duration-slider';
    waveformDurationSlider.className = 'visualeq-range-slider';
    Object.assign(waveformDurationSlider, { type: 'range', min: WAVEFORM_DURATION_MIN, max: WAVEFORM_DURATION_MAX, step: 0.5, value: waveformDuration });

    const waveDurationLabelEl = document.createElement('label');
    waveDurationLabelEl.htmlFor = 'duration';
    waveDurationLabelEl.innerHTML = `Duration <span>(${waveformDuration.toFixed(1)}s)</span>`;

    const waveformGlowSlider = document.createElement('input');
    waveformGlowSlider.id = 'visualeq-glow-slider';
    waveformGlowSlider.className = 'visualeq-range-slider';
    Object.assign(waveformGlowSlider, { type: 'range', min: 0, max: 10, step: 1, value: waveformGlowSize });

    const waveGlowLabelEl = document.createElement('label');
    waveGlowLabelEl.id = 'visualeq-glow-label';
    waveGlowLabelEl.htmlFor = 'glow';
    waveGlowLabelEl.innerHTML = `Neon Glow <span>(${waveformGlowSize === 0 ? 'Off' : waveformGlowSize})</span>`;

    const peakMeterContainer = document.createElement('div');
    peakMeterContainer.className = 'visualeq-checkbox-container';
    peakMeterContainer.innerHTML = `<label>Show Peak Meter</label><label class="visualeq-switch"><input type="checkbox" id="visualeq-peak-toggle-input"><span class="visualeq-slider"></span></label>`;
    
    const gridToggleContainer = document.createElement('div');
    gridToggleContainer.className = 'visualeq-checkbox-container';
    gridToggleContainer.innerHTML = `<label>Show Grid & Labels</label><label class="visualeq-switch"><input type="checkbox" id="visualeq-grid-toggle-input"><span class="visualeq-slider"></span></label>`;

    const barsGridToggleContainer = document.createElement('div');
    barsGridToggleContainer.className = 'visualeq-checkbox-container';
    barsGridToggleContainer.innerHTML = `<label>Show Background Grid</label><label class="visualeq-switch"><input type="checkbox" id="visualeq-bars-grid-toggle-input"><span class="visualeq-slider"></span></label>`;
    
    const waveformStereoContainer = document.createElement('div');
    waveformStereoContainer.className = 'visualeq-checkbox-container';
    waveformStereoContainer.innerHTML = `<label>Stereo View</label><label class="visualeq-switch"><input type="checkbox" id="visualeq-wave-stereo-toggle-input"><span class="visualeq-slider"></span></label>`;
    
    const waveformGridContainer = document.createElement('div');
    waveformGridContainer.className = 'visualeq-checkbox-container';
    waveformGridContainer.innerHTML = `<label>Show Background Grid</label><label class="visualeq-switch"><input type="checkbox" id="visualeq-wave-grid-toggle-input"><span class="visualeq-slider"></span></label>`;
    
    const proDesignToggleContainer = document.createElement('div');
    proDesignToggleContainer.className = 'visualeq-checkbox-container';
    proDesignToggleContainer.innerHTML = `<label>Show VU+ Grid</label><label class="visualeq-switch"><input type="checkbox" id="visualeq-pro-design-toggle-input"><span class="visualeq-slider"></span></label>`;

    const waveformDurationContainer = document.createElement('div');
    forceStyle(waveformDurationContainer, { marginTop: '1.5em' });
    waveformDurationContainer.append(waveDurationLabelEl, waveformDurationSlider);

    const waveformGlowContainer = document.createElement('div');
    forceStyle(waveformGlowContainer, { marginTop: '1.5em' });
    waveformGlowContainer.append(waveGlowLabelEl, waveformGlowSlider);

    const helpSection = document.createElement('div');
    helpSection.className = 'help-section';

    const modeHelpTexts = {
        'Bars': "<strong>Bars:</strong> A classic visualizer. The 'Peak Meter' shows the highest audio level reached for each frequency band. The 'Background Grid' provides a reference for the volume level.",
        'LED': "<strong>LED:</strong> Simulates a physical LED display. The 'Peak Meter' keeps the top-most LED block lit for a short duration. The 'Background Grid' helps indicate the overall level.",
        'Spectrum': "<strong>Spectrum:</strong> Draws a smooth graph of the audio frequencies. 'Grid & Labels' helps you visualize the frequency ranges (Hz).",
        'Waveform': "<strong>Waveform:</strong> Displays the audio signal over time. 'Duration' controls how much history is shown, and 'Neon Glow' adds a visual effect.",
        'Circle': "<strong>Circle:</strong> Splits the frequencies into Bass, Midrange, and Treble, each represented by a pulsating circle.",
        'Mirrored Bars': "<strong>Mirrored Bars:</strong> Similar to 'Bars', but mirrored from the center for a symmetrical effect.",
        '10-Band EQ + VU': "<strong>10-Band EQ + VU:</strong> A new view combining a precise 10-band equalizer with a classic stereo VU meter.",
        '10-Band EQ + VU LED': "<strong>10-Band EQ + VU LED:</strong> Combines the precise 10-band audio processing and stereo VU meter with a classic LED block display."
    };

    const updateHelpSection = (mode) => {
        const modeSpecificText = modeHelpTexts[mode] || "Select a mode to see specific tips.";
        helpSection.innerHTML = `
            <hr>
            <h4 style="margin: 0 0 0.8em 0; font-size: 1.2em; color: var(--color-4);">Tips</h4>
            <p style="margin: 0.8em 0; font-size: 1em;">${modeSpecificText}</p>
            <p style="margin: 0.8em 0; font-size: 1em;"><strong>General:</strong> All settings are saved separately for each visualizer mode.</p>
            <p style="margin: 0.8em 0; font-size: 1em;"><strong>Analyser Quality:</strong> Higher values provide more detail but may require more CPU.</p>
        `;
    };

    const updateSliderFill = (slider) => {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percentage = (val - min) * 100 / (max - min);
        const color1 = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#E6C269';
        const color2 = getComputedStyle(document.documentElement).getPropertyValue('--color-2').trim() || '#333';
        slider.style.background = `linear-gradient(to right, ${color1} ${percentage}%, ${color2} ${percentage}%)`;
    };

    const updateTooltipPosition = (slider) => {
        const rect = slider.getBoundingClientRect();
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percentage = (val - min) / (max - min);
        const thumbWidth = 28;
        const left = rect.left + (rect.width - thumbWidth) * percentage + (thumbWidth / 2);
        const top = rect.top - 50;
        sliderTooltip.style.top = `${top}px`;
        sliderTooltip.style.left = `${left}px`;
        
        if (slider.id === 'visualeq-sensitivity-slider') {
            sliderTooltip.textContent = val.toFixed(1);
        } else if (slider.id === 'visualeq-vu-sensitivity-slider') {
            sliderTooltip.textContent = val.toFixed(2);
        } else if (slider.id === 'visualeq-duration-slider') {
            sliderTooltip.textContent = `${val.toFixed(1)}s`;
        } else if (slider.id === 'visualeq-glow-slider') {
            sliderTooltip.textContent = val === 0 ? 'Off' : val;
        }
    };

    const attachSliderEvents = (slider) => {
        const showTooltip = () => { sliderTooltip.style.opacity = '1'; updateTooltipPosition(slider); };
        const hideTooltip = () => { sliderTooltip.style.opacity = '0'; };
        slider.addEventListener('mouseenter', showTooltip);
        slider.addEventListener('mousedown', showTooltip);
        slider.addEventListener('mouseleave', hideTooltip);
        slider.addEventListener('mouseup', hideTooltip);
        slider.addEventListener('input', () => { updateSliderFill(slider); updateTooltipPosition(slider); });
        updateSliderFill(slider);
    };

    const handleModeChange = (selectedMode) => {
        currentVisualizerMode = selectedMode;
        saveGlobalSetting('lastMode', currentVisualizerMode);

        let requiredBands = 0;
        switch (selectedMode) {
            case '10-Band EQ + VU':
            case '10-Band EQ + VU LED':
                requiredBands = 10;
                break;
            case 'Spectrum': case 'Circle': requiredBands = 60; break;
            case 'Waveform': requiredBands = 0; break;
            default: requiredBands = 20; break;
        }

        if (requiredBands > 0) {
            currentBarHeights = new Array(requiredBands).fill(0);
            peakHeights = new Array(requiredBands).fill(0);
            peakHoldTimers = new Array(requiredBands).fill(0);
            latestBandLevels = new Array(requiredBands).fill(0);
        }

        const allSettings = loadAllSettings();
        const modeSettings = allSettings.modes?.[selectedMode] || {};

        currentThemeIndex = modeSettings.themeIndex ?? DEFAULT_THEME_INDEX;
        SENSITIVITY = modeSettings.sensitivity ?? SENSITIVITY_DEFAULT;
        showPeakMeter = modeSettings.showPeak ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_PEAK_METER;
        showSpectrumGrid = modeSettings.showGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_SPECTRUM_GRID;
        showBarsGrid = modeSettings.showBarsGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_BARS_GRID;
        isWaveformStereo = modeSettings.waveformStereo ?? true;
        showWaveformGrid = modeSettings.waveformGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_WAVEFORM_GRID;
        waveformDuration = modeSettings.waveformDuration ?? WAVEFORM_DURATION_DEFAULT;
        waveformGlowSize = modeSettings.waveformGlow ?? SERVER_OWNER_DEFAULTS.DEFAULT_WAVEFORM_GLOW;
        vuMeterSensitivity = modeSettings.vuSensitivity ?? SERVER_OWNER_DEFAULTS.VU_METER_CONFIG.AMPLIFICATION;
        show10BandVuGrid = modeSettings.show10BandVuGrid ?? SERVER_OWNER_DEFAULTS.DEFAULT_SHOW_10BandVu_GRID;

        updateModalUI();
        updateCachedStyles();

        const modeHeaderEl = document.getElementById('visualeq-mode-settings-header');
        const modeHeaderText = modeHeaderEl.querySelector('h4');
        modeHeaderText.textContent = `${selectedMode} Settings`;
        modeHeaderEl.style.display = 'block';
        
        const isVuMode = ['10-Band EQ + VU', '10-Band EQ + VU LED'].includes(selectedMode);
        peakMeterContainer.style.display = ['Bars', 'LED', 'Circle', 'Mirrored Bars'].includes(selectedMode) || isVuMode ? 'flex' : 'none';
        gridToggleContainer.style.display = (selectedMode === 'Spectrum') ? 'flex' : 'none';
        barsGridToggleContainer.style.display = ['Bars', 'LED'].includes(selectedMode) ? 'flex' : 'none';
        const isWaveform = selectedMode === 'Waveform';
        waveformStereoContainer.style.display = isWaveform ? 'flex' : 'none';
        waveformGridContainer.style.display = isWaveform ? 'flex' : 'none';
        waveformDurationContainer.style.display = isWaveform ? 'block' : 'none';
        waveformGlowContainer.style.display = isWaveform ? 'block' : 'none';
        vuSensitivityContainer.style.display = isVuMode ? 'block' : 'none';
        proDesignToggleContainer.style.display = isVuMode ? 'flex' : 'none';
        
        if (['Bars', 'LED'].includes(selectedMode)) { drawBarsGridToBuffer(); } 
        else if (selectedMode === 'Waveform') { drawWaveformGrid(); } 
        else { if (gridCtx && gridCanvas) { gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height); } }
        updateHelpSection(selectedMode);
    };

    const updateModalUI = () => {
        modeSelect.value = currentVisualizerMode;
        themeSelect.value = currentThemeIndex;
        sensitivitySlider.value = SENSITIVITY;
        sensLabelEl.querySelector('span').textContent = `(EQ: ${SENSITIVITY.toFixed(1)})`;
        waveformDurationSlider.value = waveformDuration;
        waveDurationLabelEl.querySelector('span').textContent = `(${waveformDuration.toFixed(1)}s)`;
        waveformGlowSlider.value = waveformGlowSize;
        waveGlowLabelEl.querySelector('span').textContent = `(${waveformGlowSize === 0 ? 'Off' : waveformGlowSize})`;
        vuSensitivitySlider.value = vuMeterSensitivity;
        vuSensLabelEl.querySelector('span').textContent = `(${vuMeterSensitivity.toFixed(2)})`;

        updateSliderFill(sensitivitySlider);
        updateSliderFill(waveformDurationSlider);
        updateSliderFill(waveformGlowSlider);
        updateSliderFill(vuSensitivitySlider);

        proDesignToggleContainer.querySelector('input').checked = show10BandVuGrid;
        peakMeterContainer.querySelector('input').checked = showPeakMeter;
        gridToggleContainer.querySelector('input').checked = showSpectrumGrid;
        barsGridToggleContainer.querySelector('input').checked = showBarsGrid;
        waveformStereoContainer.querySelector('input').checked = isWaveformStereo;
        waveformGridContainer.querySelector('input').checked = showWaveformGrid;
    };

    modeSelect.onchange = (e) => handleModeChange(e.target.value);

	const handleThemeChange = (event) => {
		currentThemeIndex = parseInt(event.target.value, 10);
		saveSettingForMode(currentVisualizerMode, 'themeIndex', currentThemeIndex);
		updateCachedStyles();
	};

	const handleSensitivityChange = (event) => {
		SENSITIVITY = parseFloat(event.target.value);
		sensLabelEl.querySelector('span').textContent = `(EQ: ${SENSITIVITY.toFixed(1)})`;
		saveSettingForMode(currentVisualizerMode, 'sensitivity', SENSITIVITY);
	};

	const handleVuSensitivityChange = (event) => {
		vuMeterSensitivity = parseFloat(event.target.value);
		vuSensLabelEl.querySelector('span').textContent = `(${vuMeterSensitivity.toFixed(2)})`;
		saveSettingForMode(currentVisualizerMode, 'vuSensitivity', vuMeterSensitivity);
	};

	const handleProDesignToggle = (event) => {
		show10BandVuGrid = event.target.checked;
		saveSettingForMode(currentVisualizerMode, 'show10BandVuGrid', show10BandVuGrid);
	};

	const handleWaveformDurationChange = (event) => {
		waveformDuration = parseFloat(event.target.value);
		waveDurationLabelEl.querySelector('span').textContent = `(${waveformDuration.toFixed(1)}s)`;
		saveSettingForMode(currentVisualizerMode, 'waveformDuration', waveformDuration);
		drawWaveformGrid();
	};

	const handleWaveformGlowChange = (event) => {
		waveformGlowSize = parseInt(event.target.value, 10);
		waveGlowLabelEl.querySelector('span').textContent = `(${waveformGlowSize === 0 ? 'Off' : waveformGlowSize})`;
		saveSettingForMode(currentVisualizerMode, 'waveformGlow', waveformGlowSize);
	};

	const handlePeakMeterToggle = (event) => {
		showPeakMeter = event.target.checked;
		saveSettingForMode(currentVisualizerMode, 'showPeak', showPeakMeter);
	};

	const handleSpectrumGridToggle = (event) => {
		showSpectrumGrid = event.target.checked;
		saveSettingForMode(currentVisualizerMode, 'showGrid', showSpectrumGrid);
	};

	const handleBarsGridToggle = (event) => {
		showBarsGrid = event.target.checked;
		saveSettingForMode(currentVisualizerMode, 'showBarsGrid', showBarsGrid);
		drawBarsGridToBuffer();
	};

	const handleWaveformStereoToggle = (event) => {
		isWaveformStereo = event.target.checked;
		saveSettingForMode(currentVisualizerMode, 'waveformStereo', isWaveformStereo);
	};

	const handleWaveformGridToggle = (event) => {
		showWaveformGrid = event.target.checked;
		saveSettingForMode(currentVisualizerMode, 'waveformGrid', showWaveformGrid);
		drawWaveformGrid();
	};

	const handleQualityChange = (event) => {
		const newFftSize = parseInt(event.target.value, 10);
		saveGlobalSetting('fftSize', newFftSize);
		currentFftSize = newFftSize;
		startOrRestartEQ();
	};

	themeSelect.onchange = handleThemeChange;
	sensitivitySlider.addEventListener('input', handleSensitivityChange);
	vuSensitivitySlider.addEventListener('input', handleVuSensitivityChange);
	proDesignToggleContainer.querySelector('input').onchange = handleProDesignToggle;
	waveformDurationSlider.addEventListener('input', handleWaveformDurationChange);
	waveformGlowSlider.addEventListener('input', handleWaveformGlowChange);
	peakMeterContainer.querySelector('input').onchange = handlePeakMeterToggle;
	gridToggleContainer.querySelector('input').onchange = handleSpectrumGridToggle;
	barsGridToggleContainer.querySelector('input').onchange = handleBarsGridToggle;
	waveformStereoContainer.querySelector('input').onchange = handleWaveformStereoToggle;
	waveformGridContainer.querySelector('input').onchange = handleWaveformGridToggle;
	qualitySelect.onchange = handleQualityChange;

	const createControlSection = (label, controlElement, marginTop = '0') => {
		const container = document.createElement('div');
		const labelElement = document.createElement('label');
    
		labelElement.innerHTML = label;
		container.append(labelElement, controlElement);
    
		forceStyle(container, { marginTop });
		return container;
	};
   const sensitivityContainer = document.createElement('div');
    forceStyle(sensitivityContainer, { marginTop: '1.5em' });
    sensitivityContainer.append(sensLabelEl, sensitivitySlider);
    
    scrollableArea.append(
        createControlSection('Visualizer Mode', modeSelect),
        modeSettingsHeader,
        createControlSection('Theme', themeSelect, '1.em'),
		createControlSection('Analyser Quality', qualitySelect, '1.em'),
        peakMeterContainer,
        proDesignToggleContainer,
        gridToggleContainer,
        barsGridToggleContainer,
        waveformStereoContainer,
        waveformGridContainer,
        waveformDurationContainer,
        waveformGlowContainer,
        sensitivityContainer,
        vuSensitivityContainer,
        helpSection
    );
    
    modalContent.append(header, scrollableArea);
    header.append(closeButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(sliderTooltip);
    document.body.appendChild(modalOverlay);

    attachSliderEvents(sensitivitySlider);
    attachSliderEvents(vuSensitivitySlider);
    attachSliderEvents(waveformDurationSlider);
    attachSliderEvents(waveformGlowSlider);

    handleModeChange(currentVisualizerMode);

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
  
function drawVersionText() {
    if (!eqCtx || !eqCanvas) return;

    let textColor = getComputedStyle(document.documentElement).getPropertyValue('--regular-text-color').trim() || 'white';
    
    eqCtx.save(); 
    eqCtx.fillStyle = textColor;
    eqCtx.globalAlpha = 0.5; 
    eqCtx.font = "10px Arial";
    eqCtx.textAlign = "left";
    eqCtx.textBaseline = "top";
    eqCtx.fillText(`VisualEQ ${PLUGIN_VERSION}`, 5, 5);
    eqCtx.restore(); 
}

function showStandbyText() {
    if (!eqCtx || !eqCanvas) return;

    eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);

    drawVersionText();

    let textColor = getComputedStyle(document.documentElement).getPropertyValue('--regular-text-color').trim() || 'white';

    eqCtx.fillStyle = textColor;
    eqCtx.font = "16px Arial";
    eqCtx.textAlign = "center";
    eqCtx.textBaseline = "middle";
    eqCtx.fillText("Standby", eqCanvas.width / 2, eqCanvas.height / 2);

    eqCtx.font = "12px Arial";
    eqCtx.fillText("No active audio stream", eqCanvas.width / 2, eqCanvas.height / 2 + 22);
}

function startOrRestartEQ() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    
    audioContext = Stream.Fallback.Audio;
    if (audioContext.state === 'suspended') audioContext.resume();
    
    const liveAudioPlayer = Stream.Fallback.Player;
    
    if (channelSplitter) {
        try { liveAudioPlayer.Amplification.disconnect(channelSplitter); } catch (e) {}
    } else if (analyserLeft) { 
        try { liveAudioPlayer.Amplification.disconnect(analyserLeft); } catch (e) {}
    }

    channelSplitter = audioContext.createChannelSplitter(2);

    analyserLeft = audioContext.createAnalyser();
    Object.assign(analyserLeft, { fftSize: currentFftSize, smoothingTimeConstant: 0.6 });
    dataArrayLeft = new Uint8Array(analyserLeft.frequencyBinCount);

    analyserRight = audioContext.createAnalyser();
    Object.assign(analyserRight, { fftSize: currentFftSize, smoothingTimeConstant: 0.6 });
    dataArrayRight = new Uint8Array(analyserRight.frequencyBinCount);
    
    liveAudioPlayer.Amplification.connect(channelSplitter);
    channelSplitter.connect(analyserLeft, 0);
    channelSplitter.connect(analyserRight, 1);
    
    if (currentBarHeights.length !== 20) {
      currentBarHeights = new Array(20).fill(0);
      peakHeights = new Array(20).fill(0);
      peakHoldTimers = new Array(20).fill(0);
    }
    
	updateCachedStyles();

    if (['Bars', 'LED'].includes(currentVisualizerMode)) {
        drawBarsGridToBuffer();
    } else if (currentVisualizerMode === 'Waveform') {
        drawWaveformGrid();
		showStandbyText();
    } else {
        if (gridCtx && gridCanvas) {
            gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        }
    }

    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(drawEQ);
}

function calculatePeakMethodLevels(frequencyData, sensitivity, centerFrequencies, floorLevels, preAmpGains) {
    if (!audioContext || !analyserLeft) return [];

    const nyquist = audioContext.sampleRate / 2;
    const binCount = analyserLeft.frequencyBinCount;
    const levels = [];

    centerFrequencies.forEach((freq, bandIndex) => {
        const targetBin = Math.floor((freq / nyquist) * binCount);
        const windowSize = 2;
        const startIndex = Math.max(0, targetBin - windowSize);
        const endIndex = Math.min(binCount - 1, targetBin + windowSize);

        let peakValue = 0;
        for (let i = startIndex; i <= endIndex; i++) {
            if (frequencyData[i] > peakValue) {
                peakValue = frequencyData[i];
            }
        }
        
        const balancedPeak = peakValue * (preAmpGains[bandIndex] || 1.0);
        const floor = floorLevels[bandIndex] || 5;

        let finalValue = 0;
        if (balancedPeak > floor) {
            const normalizedSignal = (balancedPeak - floor) / (255 - floor);
            const exponent = 1 / sensitivity;
            const curvedSignal = Math.pow(normalizedSignal, exponent);
            finalValue = curvedSignal * 255;
        }

        levels.push(Math.max(0, Math.min(finalValue, 255)));
    });

    return levels;
}

function interpolateBands(sourceBands, targetCount) {
    if (!sourceBands || sourceBands.length < 2) return new Array(targetCount).fill(0);

    const newBands = [];
    const sourceLen = sourceBands.length;

    for (let i = 0; i < targetCount; i++) {
        const virtualIndex = i * (sourceLen - 1) / (targetCount - 1);
        
        const index1 = Math.floor(virtualIndex);
        const index2 = Math.ceil(virtualIndex);
        const blend = virtualIndex - index1;
        const val1 = sourceBands[index1];
        const val2 = sourceBands[index2];
        const interpolatedValue = val1 * (1 - blend) + val2 * blend;
        
        newBands.push(interpolatedValue);
    }

    return newBands;
}

function updateBarHeights(bandLevels, deltaTime) {
    if (!bandLevels || bandLevels.length === 0) return;

    const requiredSize = bandLevels.length;
    if (currentBarHeights.length !== requiredSize) {
        currentBarHeights = new Array(requiredSize).fill(0);
        peakHeights = new Array(requiredSize).fill(0);
        peakHoldTimers = new Array(requiredSize).fill(0);
    }

    const isLegacyMode = ['Spectrum', 'Circle'].includes(currentVisualizerMode);

    bandLevels.forEach((level, i) => {
        let targetHeight;

        if (isLegacyMode) {
            targetHeight = (level / 255) * eqCanvas.height * SENSITIVITY;
        } else {
            const normalizedLevel = level / 255;
            const exponent = 1 / SENSITIVITY; 
            const curvedLevel = Math.pow(normalizedLevel, exponent);
            targetHeight = curvedLevel * eqCanvas.height;
        }

        if (targetHeight < NOISE_GATE_THRESHOLD) targetHeight = 0;

        currentBarHeights[i] = targetHeight > currentBarHeights[i] 
            ? targetHeight 
            : Math.max(0, currentBarHeights[i] - (FALL_SPEED * deltaTime));

        if (showPeakMeter) {
            if (currentBarHeights[i] >= peakHeights[i]) {
                peakHeights[i] = currentBarHeights[i];
                peakHoldTimers[i] = performance.now();
            } else {
                if (performance.now() - peakHoldTimers[i] > PEAK_HOLD_TIME) {
                    peakHeights[i] = Math.max(0, peakHeights[i] - (PEAK_FALL_SPEED * deltaTime));
                }
            }
        }
    });
}

function drawEQ(currentTime) {
    let deltaTimeMs = currentTime - (lastFrameTime || currentTime);
    if (deltaTimeMs > 1000) deltaTimeMs = 16.67;
    lastFrameTime = currentTime;
    timeSinceLastSample += deltaTimeMs;

    if (timeSinceLastSample >= TARGET_INTERVAL) {
        timeSinceLastSample %= TARGET_INTERVAL;
        if (analyserLeft && analyserRight && audioContext.state === 'running') {
            if (currentVisualizerMode !== 'Waveform') {
                analyserLeft.getByteFrequencyData(dataArrayLeft);
                analyserRight.getByteFrequencyData(dataArrayRight);
                
                const combinedDataArray = new Uint8Array(dataArrayLeft.length);
                for (let i = 0; i < dataArrayLeft.length; i++) {
                    combinedDataArray[i] = (dataArrayLeft[i] + dataArrayRight[i]) / 2;
                }
                
                const isVuMode = ['10-Band EQ + VU', '10-Band EQ + VU LED'].includes(currentVisualizerMode);
                const isBarMode = ['Bars', 'LED', 'Mirrored Bars'].includes(currentVisualizerMode);
                const isGraphMode = ['Spectrum', 'Circle'].includes(currentVisualizerMode);

                if (isVuMode) {
                    const vuLevels = processVuMeterLevels(dataArrayLeft, dataArrayRight);
                    latestLeftVuLevel = vuLevels.left;
                    latestRightVuLevel = vuLevels.right;
                    
                    latestBandLevels = calculatePeakMethodLevels(
                        combinedDataArray, SENSITIVITY,
                        centerFrequencies_10_bands, floorLevels_10_bands, preAmpGains_10_bands
                    );
                } else if (isBarMode) {
                    latestBandLevels = calculatePeakMethodLevels(
                        combinedDataArray, SENSITIVITY,
                        centerFrequencies_20_bands, floorLevels_20_bands, preAmpGains_20_bands
                    );
                } else if (isGraphMode) {
                    const sourceBands = calculatePeakMethodLevels(
                        combinedDataArray, SENSITIVITY,
                        centerFrequencies_20_bands, floorLevels_20_bands, preAmpGains_20_bands
                    );
                    latestBandLevels = interpolateBands(sourceBands, 80);
                }

            } else {
                analyserLeft.getByteTimeDomainData(dataArrayLeft);
                analyserRight.getByteTimeDomainData(dataArrayRight);
                const centerY = eqCanvas.height / 2;
                let newY;
                const effectiveSensitivity = SENSITIVITY * SERVER_OWNER_DEFAULTS.WAVEFORM_SENSITIVITY_BOOST;
                if (isWaveformStereo) {
                    const leftSample = dataArrayLeft[Math.floor(dataArrayLeft.length / 2)];
                    const rightSample = dataArrayRight[Math.floor(dataArrayRight.length / 2)];
                    newY = { 
                        top: centerY - (leftSample - 128) * effectiveSensitivity, 
                        bottom: centerY - (rightSample - 128) * effectiveSensitivity 
                    };
                } else {
                    const monoSample = (dataArrayLeft[Math.floor(dataArrayLeft.length / 2)] + dataArrayRight[Math.floor(dataArrayRight.length / 2)]) / 2;
                    newY = { 
                        top: centerY - (monoSample - 128) * effectiveSensitivity, 
                        bottom: centerY + (monoSample - 128) * effectiveSensitivity 
                    };
                }
                waveformHistoryBuffer[waveformHistoryIndex] = newY;
                waveformHistoryIndex = (waveformHistoryIndex + 1) % WAVEFORM_BUFFER_SIZE;
            }
        }
    }

    const deltaTimeSec = deltaTimeMs / 1000;
    if (currentVisualizerMode !== 'Waveform') {
        if (latestBandLevels && latestBandLevels.length > 0) {
            updateBarHeights(latestBandLevels, deltaTimeSec);
        }
        if (['10-Band EQ + VU', '10-Band EQ + VU LED'].includes(currentVisualizerMode)) {
            applyVuMeterPhysics(latestLeftVuLevel, latestRightVuLevel, deltaTimeSec);
        }
    }

    eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);
    switch (currentVisualizerMode) {
        case 'LED': drawModeLed(); break;
        case 'Spectrum': drawModeSpectrum(); break;
        case 'Waveform': drawModeWaveform(); break;
        case 'Circle': drawModeCircle(); break;
        case 'Mirrored Bars': drawModeMirroredBars(); break;
        case '10-Band EQ + VU': drawMode10BandVu(); break;
        case '10-Band EQ + VU LED': drawMode10BandVuLed(); break;
        case 'Bars': default: drawModeBars(); break;
    }
    animationFrameId = requestAnimationFrame(drawEQ);
}

function drawBarsGridToBuffer() {
    if (!gridCtx || !gridCanvas || !eqCanvas || !isEqLayoutActive) return;

    gridCanvas.width = eqCanvas.width;
    gridCanvas.height = eqCanvas.height;

    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (!showBarsGrid) return;

    const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
    const numBars = 20; 
    const barWidth = (totalDrawingWidth - (BAR_SPACING * (numBars - 1))) / numBars;
    
    gridCtx.save();
    gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    gridCtx.lineWidth = 0.5;

    for (let i = 1; i <= 5; i++) {
        const y = eqCanvas.height * (i / 6);
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(eqCanvas.width, y);
        gridCtx.stroke();
    }

    for (let i = 0; i < numBars - 1; i++) {
        const lineX = HORIZONTAL_MARGIN + (i * (barWidth + BAR_SPACING)) + barWidth + (BAR_SPACING / 2);
        gridCtx.beginPath();
        gridCtx.moveTo(lineX, 0);
        gridCtx.lineTo(lineX, eqCanvas.height);
        gridCtx.stroke();
    }

    gridCtx.restore();
}

function drawModeBars() {
  if (showBarsGrid) {
    eqCtx.drawImage(gridCanvas, 0, 0);
  }

  const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
  const barWidth = (totalDrawingWidth - (BAR_SPACING * (currentBarHeights.length - 1))) / currentBarHeights.length;

  for (let i = 0; i < currentBarHeights.length; i++) {
    const finalVisibleHeight = MINIMUM_BAR_HEIGHT + currentBarHeights[i];
    const x = HORIZONTAL_MARGIN + i * (barWidth + BAR_SPACING);
    const y = eqCanvas.height - finalVisibleHeight;
    
    eqCtx.fillStyle = cachedFillStyle;
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
        if (peakHeights[i] >= currentBarHeights[i]) {

            const peakY = eqCanvas.height - peakHeights[i] - PEAK_BAR_HEIGHT;

            eqCtx.fillStyle = cachedLedPeakColor;
            eqCtx.fillRect(x, peakY, barWidth, PEAK_BAR_HEIGHT);
            eqCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            eqCtx.fillRect(x, peakY, barWidth, PEAK_BAR_HEIGHT);
        }
    }
  }
}

function drawModeLed() {
  if (showBarsGrid) {
    eqCtx.drawImage(gridCanvas, 0, 0);
  }

  const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
  const barWidth = (totalDrawingWidth - (BAR_SPACING * (currentBarHeights.length - 1))) / currentBarHeights.length;
  const totalBlockHeight = eqCanvas.height - (LED_BLOCK_SPACING * (LED_BLOCK_COUNT - 1));
  const blockHeight = totalBlockHeight / LED_BLOCK_COUNT;

  for (let i = 0; i < currentBarHeights.length; i++) {
    const litBlocks = Math.ceil((currentBarHeights[i] / eqCanvas.height) * LED_BLOCK_COUNT);
    const x = HORIZONTAL_MARGIN + i * (barWidth + BAR_SPACING);
    
    if (litBlocks === 0) {
        const y = eqCanvas.height - (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
        eqCtx.fillStyle = 'rgba(128, 128, 128, 0.15)';
        eqCtx.fillRect(x, y, barWidth, blockHeight);
    }

    for (let j = 0; j < litBlocks; j++) {
        const y = eqCanvas.height - (j + 1) * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
        eqCtx.fillStyle = cachedLedColors[j];
        eqCtx.fillRect(x, y, barWidth, blockHeight);
    }
    
    if (showPeakMeter) {
        const peakBlock = Math.max(1, Math.ceil((peakHeights[i] / eqCanvas.height) * LED_BLOCK_COUNT));

        if (peakBlock >= litBlocks) {
            const peakY = eqCanvas.height - (peakBlock) * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
            eqCtx.fillStyle = cachedLedPeakColor;
            eqCtx.fillRect(x, peakY, barWidth, blockHeight);
            eqCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            eqCtx.fillRect(x, peakY, barWidth, blockHeight);
        }
    }
  }
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

    const bandsPerZone = 8;
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

function drawModeSpectrum() { 
  if (!latestBandLevels || latestBandLevels.length === 0) return;

  if (showSpectrumGrid) {
    drawSpectrumGrid(latestBandLevels);
  }

  const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
  const spacing = totalDrawingWidth / (latestBandLevels.length - 1);
  
  eqCtx.strokeStyle = cachedWaveformStrokeStyle;
  eqCtx.lineWidth = 2;
  eqCtx.beginPath();
  
  
  latestBandLevels.forEach((level, i) => {
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
  eqCtx.shadowBlur = 0;
}

function drawWaveformGrid() {
    if (!gridCtx || !gridCanvas || !eqCanvas) return;

    gridCanvas.width = eqCanvas.width;
    gridCanvas.height = eqCanvas.height;

    gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    if (!showWaveformGrid) return;

    gridCtx.save();
    gridCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    gridCtx.font = '10px Arial';
    gridCtx.textAlign = 'center';
    for (let i = 1; i < waveformDuration; i++) {
        const x = gridCanvas.width * (i / waveformDuration);
        gridCtx.beginPath();
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        gridCtx.setLineDash([2, 4]);
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, gridCanvas.height);
        gridCtx.stroke();
        gridCtx.fillText(`-${Math.round(waveformDuration - i)}s`, x, gridCanvas.height - 5);
    }
    gridCtx.restore();
}

function drawModeWaveform() {
    if (showWaveformGrid) {
        if (gridCanvas.width !== eqCanvas.width || gridCanvas.height !== eqCanvas.height) {
            drawWaveformGrid();
        }
        eqCtx.drawImage(gridCanvas, 0, 0);
    }

    eqCtx.strokeStyle = cachedWaveformStrokeStyle;
    eqCtx.lineWidth = 2;
    
if (waveformGlowSize > 0) {
    eqCtx.shadowBlur = waveformGlowSize;
    
    const activeTheme = EQ_THEMES[currentThemeIndex];
    let glowColor = cachedWaveformStrokeStyle; 

    if (activeTheme.colors.length > 1) {
        glowColor = activeTheme.colors[0]; 
    } else if (activeTheme.name === 'Server Themecolor') {
        glowColor = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#00ff00';
    }

    eqCtx.shadowColor = glowColor;
}
    
    const historyPointsToDraw = Math.floor(TARGET_FPS * waveformDuration);
    if (historyPointsToDraw <= 1) return;

    const sliceWidth = eqCanvas.width / (historyPointsToDraw - 1);

    eqCtx.beginPath();
    for (let i = 0; i < historyPointsToDraw; i++) {
        const bufferIdx = (waveformHistoryIndex - historyPointsToDraw + i + WAVEFORM_BUFFER_SIZE) % WAVEFORM_BUFFER_SIZE;
        const point = waveformHistoryBuffer[bufferIdx];
        const x = i * sliceWidth;
        if (i === 0) eqCtx.moveTo(x, point.top);
        else eqCtx.lineTo(x, point.top);
    }
    eqCtx.stroke();

    eqCtx.beginPath();
    for (let i = 0; i < historyPointsToDraw; i++) {
        const bufferIdx = (waveformHistoryIndex - historyPointsToDraw + i + WAVEFORM_BUFFER_SIZE) % WAVEFORM_BUFFER_SIZE;
        const point = waveformHistoryBuffer[bufferIdx];
        const x = i * sliceWidth;
        if (i === 0) eqCtx.moveTo(x, point.bottom);
        else eqCtx.lineTo(x, point.bottom);
    }
    eqCtx.stroke();
    
    eqCtx.shadowBlur = 0;
}

function drawModeCircle() {
    const numBars = 60;
    if (currentBarHeights.length < numBars) return;

    const bandsPerPanel = numBars / 3;

    const panelWidth = eqCtx.canvas.width / 3;
    const panelCenterY = eqCtx.canvas.height / 2 - 5; 
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
    eqCtx.lineTo(panelWidth, eqCtx.canvas.height - 10);
    eqCtx.stroke();
    eqCtx.beginPath();
    eqCtx.moveTo(panelWidth * 2, 10);
    eqCtx.lineTo(panelWidth * 2, eqCtx.canvas.height - 10);
    eqCtx.stroke();
    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const finalFontSize = CIRCLE_LABEL_BASE_FONT_SIZE * CIRCLE_LABEL_SCALE;
    eqCtx.font = `${finalFontSize}px Arial`;
    eqCtx.textAlign = 'center';
    eqCtx.textBaseline = 'bottom';
    panelPositions.forEach(panel => {
        eqCtx.fillText(panel.label, panel.x, eqCtx.canvas.height - CIRCLE_LABEL_BOTTOM_OFFSET); 
    });
    eqCtx.restore();

    const drawPanel = (panel, color, peakColor, startIndex) => {
        const boost = SERVER_OWNER_DEFAULTS.CIRCLE_SENSITIVITY_BOOST;

        eqCtx.strokeStyle = color;
        eqCtx.lineWidth = CIRCLE_PANEL_LINE_WIDTH;
        eqCtx.beginPath(); 

        for (let i = 0; i < bandsPerPanel; i++) {
            const barIndex = startIndex + i;
            const barLength = (currentBarHeights[barIndex] || 0) * boost;
            if (barLength > 0) {
                const angle = (i / bandsPerPanel) * 2 * Math.PI - (Math.PI / 2);
                const x1 = panel.x + CIRCLE_PANEL_RADIUS * Math.cos(angle);
                const y1 = panel.y + CIRCLE_PANEL_RADIUS * Math.sin(angle);
                const x2 = panel.x + (CIRCLE_PANEL_RADIUS + barLength) * Math.cos(angle);
                const y2 = panel.y + (CIRCLE_PANEL_RADIUS + barLength) * Math.sin(angle);
                eqCtx.moveTo(x1, y1);
                eqCtx.lineTo(x2, y2);
            }
        }
        eqCtx.stroke();

        if (showPeakMeter) {
            eqCtx.strokeStyle = peakColor;
            eqCtx.lineWidth = CIRCLE_PEAK_LINE_WIDTH;

            for (let i = 0; i < bandsPerPanel; i++) {
                const barIndex = startIndex + i;
                const peakLength = (peakHeights[barIndex] || 0) * boost;

                if (peakLength > 0) {
                    const angle = (i / bandsPerPanel) * 2 * Math.PI - (Math.PI / 2);
                    const peakRadius = CIRCLE_PANEL_RADIUS + peakLength;
                    const startAngle = angle - CIRCLE_PEAK_ARC_SIZE / 2;
                    const endAngle = angle + CIRCLE_PEAK_ARC_SIZE / 2;
                    
                    eqCtx.beginPath();
                    eqCtx.arc(panel.x, panel.y, peakRadius, startAngle, endAngle);
                    eqCtx.stroke();
                }
            }
        }
    };

    drawPanel(panelPositions[0], cachedCircleColors.bass, cachedCircleColors.peak, 0);
    drawPanel(panelPositions[1], cachedCircleColors.mid, cachedCircleColors.peak, bandsPerPanel);
    drawPanel(panelPositions[2], cachedCircleColors.treble, cachedCircleColors.peak, bandsPerPanel * 2);
}

function drawModeMirroredBars() {
    const numBars = 20;
    const totalDrawingWidth = eqCanvas.width - (HORIZONTAL_MARGIN * 2);
    const barWidth = (totalDrawingWidth / 2 - (BAR_SPACING * (numBars / 2 - 1))) / (numBars / 2);
    const centerX = eqCanvas.width / 2;
    
    for (let i = 0; i < numBars / 2; i++) {
        const finalVisibleHeight = MINIMUM_BAR_HEIGHT + currentBarHeights[i];
        const y = eqCanvas.height - finalVisibleHeight;

        eqCtx.fillStyle = cachedFillStyle;
        const x_left = centerX - (i + 1) * (barWidth + BAR_SPACING);
        eqCtx.fillRect(x_left, y, barWidth, finalVisibleHeight);
        const x_right = centerX + i * (barWidth + BAR_SPACING);
        eqCtx.fillRect(x_right, y, barWidth, finalVisibleHeight);

        if (showPeakMeter && peakHeights[i] > 0) {
            const peakY = eqCanvas.height - peakHeights[i] - PEAK_BAR_HEIGHT;
            if (peakY < y - PEAK_BAR_HEIGHT) {
                eqCtx.fillStyle = cachedFillStyle;
                eqCtx.fillRect(x_left, peakY, barWidth, PEAK_BAR_HEIGHT);
                eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                eqCtx.fillRect(x_left, peakY, barWidth, PEAK_BAR_HEIGHT);

                eqCtx.fillStyle = cachedFillStyle;
                eqCtx.fillRect(x_right, peakY, barWidth, PEAK_BAR_HEIGHT);
                eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                eqCtx.fillRect(x_right, peakY, barWidth, PEAK_BAR_HEIGHT);
            }
        }
    }
}

function applyVuMeterPhysics(leftLevel, rightLevel, deltaTime) {
    const levels = [leftLevel, rightLevel];
    
    levels.forEach((level, i) => {
        let targetHeight = (level / 255) * eqCanvas.height;
        if (targetHeight > eqCanvas.height) targetHeight = eqCanvas.height;

        const currentLevel = (i === 0) ? leftVuLevel : rightVuLevel;
        const newLevel = targetHeight > currentLevel
            ? targetHeight
            : Math.max(0, currentLevel - (FALL_SPEED * 1.5 * deltaTime));

        if (i === 0) leftVuLevel = newLevel;
        else rightVuLevel = newLevel;

        if (showPeakMeter) {
            if (newLevel >= peakVuLevels[i]) {
                peakVuLevels[i] = newLevel;
                peakVuHoldTimers[i] = performance.now();
            } else {
                if (performance.now() - peakVuHoldTimers[i] > PEAK_HOLD_TIME) {
                    peakVuLevels[i] = Math.max(0, peakVuLevels[i] - (PEAK_FALL_SPEED * deltaTime));
                }
            }
        }
    });
}

function processVuMeterLevels(dataArrayLeft, dataArrayRight) {
    const config = SERVER_OWNER_DEFAULTS.VU_METER_CONFIG;

    const binCount = dataArrayLeft.length;
    const startBin = Math.floor(binCount * 0.01);
    const endBin = Math.floor(binCount * 0.5);

    let sumLeft = 0, sumRight = 0;
    for (let i = startBin; i < endBin; i++) {
        sumLeft += dataArrayLeft[i];
        sumRight += dataArrayRight[i];
    }

    const divisor = endBin - startBin;
    let levelLeft = sumLeft / divisor;
    let levelRight = sumRight / divisor;

    const totalLevel = levelLeft + levelRight;
    if (totalLevel > 1) {
        const difference = levelLeft - levelRight;
        const exaggerationFactor = (Math.abs(difference) / totalLevel) * config.STEREO_EXAGGERATION;
        
        if (levelLeft > levelRight) {
            levelLeft *= (1 + exaggerationFactor);
            levelRight *= (1 - exaggerationFactor);
        } else {
            levelRight *= (1 + exaggerationFactor);
            levelLeft *= (1 - exaggerationFactor);
        }
    }
    
    const applyCurve = (level) => {
        if (level < config.NOISE_GATE) return 0;
        let processed = Math.pow(level * vuMeterSensitivity, config.RISE_EXPONENT);
        return Math.min(processed, 255);
    };

    return {
        left: applyCurve(levelLeft),
        right: applyCurve(levelRight)
    };
}

function drawMode10BandVu() {
    const vuMeterSectionWidth = eqCanvas.width * 0.25;
    const eqSectionWidth = eqCanvas.width - vuMeterSectionWidth;
    const numBands = 10;

    const drawBackground = () => {
        const centerX = eqCanvas.width / 2;
        const centerY = eqCanvas.height / 2;
        const backgroundGradient = eqCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, eqCanvas.width * 0.8);
        backgroundGradient.addColorStop(0, '#2a2a2a');
        backgroundGradient.addColorStop(1, '#1a1a1a');
        eqCtx.fillStyle = backgroundGradient;
        eqCtx.fillRect(0, 0, eqCanvas.width, eqCanvas.height);
    };

    const drawGridAndScale = () => {
        eqCtx.save();
        eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        eqCtx.font = 'bold 9px Arial';
        eqCtx.textAlign = 'left';
        eqCtx.textBaseline = 'middle';
        const levels = [0.25, 0.50, 0.75];
        const labels = ['-18', '-9', '0'];
        levels.forEach((level, index) => {
            const y = eqCanvas.height * (1 - level);
            eqCtx.beginPath();
            eqCtx.setLineDash([2, 4]);
            eqCtx.moveTo(25, y);
            eqCtx.lineTo(eqCanvas.width, y);
            eqCtx.stroke();
            eqCtx.fillText(labels[index], 5, y);
        });
        eqCtx.strokeStyle = 'rgba(255, 50, 50, 0.2)';
        eqCtx.beginPath();
        eqCtx.moveTo(25, 2);
        eqCtx.lineTo(eqCanvas.width, 2);
        eqCtx.stroke();
        eqCtx.fillStyle = 'rgba(255, 50, 50, 0.5)';
        eqCtx.fillText('PEAK', 5, 6);
        eqCtx.restore();
    };

    const applyGlossEffect = (x, y, width, height) => {
        const glossGradient = eqCtx.createLinearGradient(x, 0, x + width, 0);
        glossGradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        glossGradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.2)');
        glossGradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.2)');
        glossGradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        eqCtx.fillStyle = glossGradient;
        eqCtx.fillRect(x, y, width, height);
    };

    let eqStartX = HORIZONTAL_MARGIN;
    let totalDrawingWidth = eqSectionWidth - (HORIZONTAL_MARGIN * 2);

    if (show10BandVuGrid) {
        drawBackground();
        drawGridAndScale();
        eqStartX = HORIZONTAL_MARGIN + 20;
        totalDrawingWidth = eqSectionWidth - (HORIZONTAL_MARGIN * 2) - 15;
    }

    const barWidth = (totalDrawingWidth - (BAR_SPACING * (numBands - 1))) / numBands;
    for (let i = 0; i < numBands; i++) {
        const finalVisibleHeight = MINIMUM_BAR_HEIGHT + currentBarHeights[i];
        const x = eqStartX + i * (barWidth + BAR_SPACING);
        const y = eqCanvas.height - finalVisibleHeight;

        eqCtx.fillStyle = cachedFillStyle;
        eqCtx.fillRect(x, y, barWidth, finalVisibleHeight);

        applyGlossEffect(x, y, barWidth, finalVisibleHeight);

        if (showPeakMeter && peakHeights[i] > currentBarHeights[i]) {
            const peakY = eqCanvas.height - peakHeights[i] - PEAK_BAR_HEIGHT;
            eqCtx.fillStyle = cachedLedPeakColor;
            eqCtx.fillRect(x, peakY, barWidth, PEAK_BAR_HEIGHT);
        }
    }

    const originalVuBarWidth = (vuMeterSectionWidth - HORIZONTAL_MARGIN - BAR_SPACING) / 2;
    const vuBarWidth = originalVuBarWidth * 0.70;
    const totalVuContentWidth = (vuBarWidth * 2) + BAR_SPACING;
    const totalPadding = vuMeterSectionWidth - totalVuContentWidth;
    const leftVuX = eqSectionWidth + (totalPadding / 2);
    const rightVuX = leftVuX + vuBarWidth + BAR_SPACING;
    const vuGradient = eqCtx.createLinearGradient(0, eqCanvas.height, 0, 0);
    const green = '#34c759', yellow = '#ffcc00', red = '#ff3b30';
    vuGradient.addColorStop(0, green); vuGradient.addColorStop(0.5, green); vuGradient.addColorStop(0.8, yellow); vuGradient.addColorStop(1, red);

    const drawVuBar = (x, height) => {
        const y = eqCanvas.height - height;
        eqCtx.fillStyle = vuGradient;
        eqCtx.fillRect(x, y, vuBarWidth, height);
        
        applyGlossEffect(x, y, vuBarWidth, height);
    };
    drawVuBar(leftVuX, leftVuLevel);
    drawVuBar(rightVuX, rightVuLevel);

    if (showPeakMeter) {
        const vuPeakColor = getComputedStyle(document.documentElement).getPropertyValue('--color-5').trim() || '#E6C269';
        eqCtx.fillStyle = vuPeakColor;
        const leftPeakY = eqCanvas.height - peakVuLevels[0] - PEAK_BAR_HEIGHT;
        if (peakVuLevels[0] > 0) eqCtx.fillRect(leftVuX, leftPeakY, vuBarWidth, PEAK_BAR_HEIGHT);
        const rightPeakY = eqCanvas.height - peakVuLevels[1] - PEAK_BAR_HEIGHT;
        if (peakVuLevels[1] > 0) eqCtx.fillRect(rightVuX, rightPeakY, vuBarWidth, PEAK_BAR_HEIGHT);
    }

    if (show10BandVuGrid) {
        const separatorX = eqSectionWidth;
        const vuCenterX = eqSectionWidth + (vuMeterSectionWidth / 2);
        eqCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        eqCtx.fillRect(separatorX - 1, 0, 2, eqCanvas.height);
        eqCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        eqCtx.fillRect(separatorX, 0, 0.5, eqCanvas.height);
        eqCtx.font = 'bold 12px Arial';
        eqCtx.textAlign = 'center';
        eqCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        eqCtx.fillText('VU+', vuCenterX, 12);
    }

    eqCtx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    eqCtx.font = 'bold 12px Arial';
    eqCtx.textAlign = 'center';
    eqCtx.fillText('L', leftVuX + vuBarWidth / 2, eqCanvas.height - 5);
    eqCtx.fillText('R', rightVuX + vuBarWidth / 2, eqCanvas.height - 5);
}

function drawMode10BandVuLed() {
    const vuMeterSectionWidth = eqCanvas.width * 0.25;
    const eqSectionWidth = eqCanvas.width - vuMeterSectionWidth;
    const numBands = 10;
    const drawBackground = () => {
        const centerX = eqCanvas.width / 2;
        const centerY = eqCanvas.height / 2;
        const backgroundGradient = eqCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, eqCanvas.width * 0.8);
        backgroundGradient.addColorStop(0, '#2a2a2a');
        backgroundGradient.addColorStop(1, '#1a1a1a');
        eqCtx.fillStyle = backgroundGradient;
        eqCtx.fillRect(0, 0, eqCanvas.width, eqCanvas.height);
    };

    const drawGridAndScale = () => {
        eqCtx.save();
        eqCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        eqCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        eqCtx.font = 'bold 9px Arial';
        eqCtx.textAlign = 'left';
        eqCtx.textBaseline = 'middle';
        const levels = [0.25, 0.50, 0.75];
        const labels = ['-18', '-9', '0'];
        levels.forEach((level, index) => {
            const y = eqCanvas.height * (1 - level);
            eqCtx.beginPath();
            eqCtx.setLineDash([2, 4]);
            eqCtx.moveTo(25, y);
            eqCtx.lineTo(eqCanvas.width, y);
            eqCtx.stroke();
            eqCtx.fillText(labels[index], 5, y);
        });
        eqCtx.strokeStyle = 'rgba(255, 50, 50, 0.2)';
        eqCtx.beginPath();
        eqCtx.moveTo(25, 2);
        eqCtx.lineTo(eqCanvas.width, 2);
        eqCtx.stroke();
        eqCtx.fillStyle = 'rgba(255, 50, 50, 0.5)';
        eqCtx.fillText('PEAK', 5, 6);
        eqCtx.restore();
    };

    const applyGlossEffect = (x, y, width, height) => {
        const glossGradient = eqCtx.createLinearGradient(x, 0, x + width, 0);
        glossGradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        glossGradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.2)');
        glossGradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.2)');
        glossGradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
        eqCtx.fillStyle = glossGradient;
        eqCtx.fillRect(x, y, width, height);
    };

    let eqStartX = HORIZONTAL_MARGIN;
    let totalDrawingWidth = eqSectionWidth - (HORIZONTAL_MARGIN * 2);

    if (show10BandVuGrid) {
        drawBackground();
        drawGridAndScale();
        eqStartX = HORIZONTAL_MARGIN + 20;
        totalDrawingWidth = eqSectionWidth - (HORIZONTAL_MARGIN * 2) - 15;
    }

    const eqBarWidth = (totalDrawingWidth - (BAR_SPACING * (numBands - 1))) / numBands;
    const totalBlockHeight = eqCanvas.height - (LED_BLOCK_SPACING * (LED_BLOCK_COUNT - 1));
    const blockHeight = totalBlockHeight / LED_BLOCK_COUNT;

    for (let i = 0; i < numBands; i++) {
        const x = eqStartX + i * (eqBarWidth + BAR_SPACING);
        const litBlocks = Math.ceil((currentBarHeights[i] / eqCanvas.height) * LED_BLOCK_COUNT);

        for (let j = 0; j < litBlocks; j++) {
            const y = eqCanvas.height - (j + 1) * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
            eqCtx.fillStyle = cachedLedColors[j] || cachedFillStyle;
            eqCtx.fillRect(x, y, eqBarWidth, blockHeight);
            applyGlossEffect(x, y, eqBarWidth, blockHeight);
        }

        if (showPeakMeter) {
            const peakBlock = Math.max(1, Math.ceil((peakHeights[i] / eqCanvas.height) * LED_BLOCK_COUNT));
            if (peakBlock >= litBlocks) {
                const peakY = eqCanvas.height - peakBlock * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
                eqCtx.fillStyle = cachedLedPeakColor;
                eqCtx.fillRect(x, peakY, eqBarWidth, blockHeight);
                applyGlossEffect(x, peakY, eqBarWidth, blockHeight);
            }
        }
    }

    const originalVuBarWidth = (vuMeterSectionWidth - HORIZONTAL_MARGIN - BAR_SPACING) / 2;
    const vuBarWidth = originalVuBarWidth * 0.70;
    const totalVuContentWidth = (vuBarWidth * 2) + BAR_SPACING;
    const totalPadding = vuMeterSectionWidth - totalVuContentWidth;
    const leftVuX = eqSectionWidth + (totalPadding / 2);
    const rightVuX = leftVuX + vuBarWidth + BAR_SPACING;

    const drawVuBarAsLed = (x, level) => {
        const litBlocks = Math.ceil((level / eqCanvas.height) * LED_BLOCK_COUNT);
        for (let j = 0; j < litBlocks; j++) {
            const y = eqCanvas.height - (j + 1) * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
            const percentage = j / LED_BLOCK_COUNT;
            if (percentage > 0.85) eqCtx.fillStyle = '#ff3b30';
            else if (percentage > 0.65) eqCtx.fillStyle = '#ffcc00';
            else eqCtx.fillStyle = '#34c759';
            eqCtx.fillRect(x, y, vuBarWidth, blockHeight);
            applyGlossEffect(x, y, vuBarWidth, blockHeight);
        }
    };

    drawVuBarAsLed(leftVuX, leftVuLevel);
    drawVuBarAsLed(rightVuX, rightVuLevel);

    if (showPeakMeter) {
        const vuPeakColor = getComputedStyle(document.documentElement).getPropertyValue('--color-5').trim() || '#E6C269';
        const leftPeakBlock = Math.max(1, Math.ceil((peakVuLevels[0] / eqCanvas.height) * LED_BLOCK_COUNT));
        const rightPeakBlock = Math.max(1, Math.ceil((peakVuLevels[1] / eqCanvas.height) * LED_BLOCK_COUNT));
        
        const leftPeakY = eqCanvas.height - leftPeakBlock * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
        if (peakVuLevels[0] > 0) {
            eqCtx.fillStyle = vuPeakColor;
            eqCtx.fillRect(leftVuX, leftPeakY, vuBarWidth, blockHeight);
            applyGlossEffect(leftVuX, leftPeakY, vuBarWidth, blockHeight);
        }
        
        const rightPeakY = eqCanvas.height - rightPeakBlock * (blockHeight + LED_BLOCK_SPACING) + LED_BLOCK_SPACING;
        if (peakVuLevels[1] > 0) {
            eqCtx.fillStyle = vuPeakColor;
            eqCtx.fillRect(rightVuX, rightPeakY, vuBarWidth, blockHeight);
            applyGlossEffect(rightVuX, rightPeakY, vuBarWidth, blockHeight);
        }
    }

    if (show10BandVuGrid) {
        const separatorX = eqSectionWidth;
        const vuCenterX = eqSectionWidth + (vuMeterSectionWidth / 2);
        eqCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        eqCtx.fillRect(separatorX - 1, 0, 2, eqCanvas.height);
        eqCtx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        eqCtx.fillRect(separatorX, 0, 0.5, eqCanvas.height);
        eqCtx.font = 'bold 12px Arial';
        eqCtx.textAlign = 'center';
        eqCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        eqCtx.fillText('VU+', vuCenterX, 12);
    }

    eqCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    eqCtx.font = 'bold 12px Arial';
    eqCtx.textAlign = 'center';
    eqCtx.fillText('L', leftVuX + vuBarWidth / 2, eqCanvas.height - 5);
    eqCtx.fillText('R', rightVuX + vuBarWidth / 2, eqCanvas.height - 5);
}
})();