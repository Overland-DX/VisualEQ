# VisualEQ for fm-dx-webserver

![Version](https://img.shields.io/badge/version-1.6.0-blue)
![Compatibility](https://img.shields.io/badge/fm--dx--webserver-v1.3.9-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A feature-rich audio visualizer and UI enhancement plugin for the fm-dx webserver. VisualEQ replaces the standard flags container with a dynamic audio visualizer, offering six distinct modes, deep customization, and per-mode profiles to create your perfect listening experience.
What's New in v1.6?

This version represents a major overhaul, moving VisualEQ from a single equalizer to a multi-mode visualization tool.

    Multi-Mode Visualizer: Choose between six unique visualizer modes: Bars, LED, Spectrum, Waveform, Circle, and Mirrored Bars.

    Per-Mode Settings Profiles: Your preferences for themes, sensitivity, and mode-specific options are now saved individually for each
    visualizer mode.

    Expanded Customization: New controls have been added, including a Neon Glow effect for Waveform mode and toggleable background grids
    for several modes.

    UI and Performance Enhancements: Countless small fixes and optimizations for a smoother experience.

---

Screenshots
<!-- Add your new screenshots here! It's a good idea to show off the new modes like Waveform and Circle. -->
<img width="2106" height="602" alt="bilde" src="https://github.com/user-attachments/assets/051e1535-6062-4300-8c24-a988fba7e3ce" />
<br>

---

<img width="2125" height="628" alt="bilde" src="https://github.com/user-attachments/assets/7f40acea-78bc-4ecf-87e6-1cc40d85a427" />
<br>

---

<img width="1795" height="539" alt="bilde" src="https://github.com/user-attachments/assets/abb4d81f-6885-4f01-8882-a82efe810d05" />
<br>

---
Core Features

VisualEQ is designed for flexibility, automatically saving all your choices in your browser's local storage.

    Six Unique Visualizer Modes:

        Bars: A classic frequency-band visualizer.

        LED: Simulates a physical LED-style display.

        Spectrum: A smooth, flowing graph of the audio spectrum.

        Waveform: A real-time oscilliscope view of the audio signal.

        Circle: Splits frequencies into Bass, Mid, and Treble in a three-panel radial display.

        Mirrored Bars: A symmetrical version of the classic Bars mode.

    Comprehensive Settings Modal: A single, clean panel gives you full control.

        Theme Selection: Choose from a wide variety of solid colors and gradients, or select "Server Themecolor" to automatically match 
        your fm-dx-webserver theme.

        Per-Mode Customization: Fine-tune each mode with specific options like Show Peak Meter, Background Grids, Stereo View,
        Waveform Duration, and Neon Glow.

        Global Controls: Adjust the master Sensitivity of the visualizer and the Analyser Quality (FFT size) to balance
        detail and performance.

    Persistent Profiles: All your settings for themes, quality, sensitivity, and mode-specific toggles are saved automatically
    and reloaded on your next visit.

    Seamless UI Integration: The PTY (Program Type) and TP/TA flags are cleanly relocated above the station name for a modern, 
    integrated look.

Performance Considerations

VisualEQ utilizes your browser's rendering and audio processing capabilities, which can consume CPU resources. The Waveform mode, in particular, can be more demanding due to the continuous drawing of audio history.

If you experience performance issues, consider lowering the Analyser Quality in the settings or using a less demanding mode like Bars or LED.
Project Status

VisualEQ is now considered feature-complete. Future development will primarily focus on bug fixes, performance optimizations, and maintaining compatibility with future versions of the fm-dx-webserver.

Please continue to report any bugs by opening an issue on this GitHub page.
<br>
## Installation

1.  Download the `visualeq.js` and `/visualEQ/visualEQ_main.js` file from this repository.
2.  Place the file into the `/plugins/` directory of your fm-dx-webserver installation.
3.  Restart the fm-dx-webserver. And activate the plugin in Admin Panel.

## How to Use

1.  Hover your mouse over the equalizer display area.
2.  A small gear icon (⚙️) will appear in the top-right corner.
3.  Click the gear icon to open the settings, where you can customize all available options.

## Compatibility

This plugin has been developed and tested exclusively on **fm-dx-webserver v1.3.9**. It may work on other versions, but compatibility is not guaranteed.

## Credits & Acknowledgements

This project was made possible by building upon the work of others and with the help of modern tools.

*   **Highpoint's Peakmeter Plugin:** The core method for connecting to the webserver's audio stream was first demonstrated in the "Peakmeter" plugin by Highpoint. This was instrumental for the creation of VisualEQ.
*   **Google's Gemini:** This plugin was developed with significant assistance from the Gemini AI model for code generation, debugging, refinement, and documentation.

## License

This project is licensed under the MIT License. This is a permissive license that allows for reuse within proprietary software provided that all copies of the licensed software include a copy of the MIT License terms and the copyright notice.

For the full license text, please see the [LICENSE](LICENSE) file included in this repository.
