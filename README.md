# VisualEQ for fm-dx-webserver

![Version](https://img.shields.io/badge/version-1.0-blue)
![Compatibility](https://img.shields.io/badge/fm--dx--webserver-v1.3.9-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

A customizable 20-band visual equalizer and UI enhancement plugin for the fm-dx webserver. VisualEQ replaces the standard flags container with a dynamic audio spectrum analyzer and provides a comprehensive settings modal to tailor the experience to your liking.

---

### Screenshot


<img width="2106" height="622" alt="bilde" src="https://github.com/user-attachments/assets/951dd17e-10e2-4080-8863-e6076dd296bd" />


---

> **Disclaimer: Early Release**
> This is an early version of VisualEQ. While it has been tested for core functionality, bugs may still be present. Please use it with this in mind and feel free to report any issues you encounter by opening an issue on this GitHub page.

## Features

VisualEQ is designed to be highly customizable and user-friendly. All your settings are automatically saved in your browser's local storage.

*   **20-Band Spectrum Analyzer:** A detailed and responsive audio visualizer that gives you insight into the audio spectrum.
*   **Dynamic PTY Relocation:** The PTY (Program Type) and TP/TA flags are cleanly relocated above the station name for a more integrated look.
*   **Comprehensive Settings Modal:** A single, clean settings panel gives you full control.
    *   **Customizable Themes:** Choose from several pre-defined color themes (Classic, Ocean, Fire, Matrix, Synth) for the equalizer.
    *   **Adjustable Analyser Quality:** Select the FFT size (Low, Medium, High, Ultra) to balance between frequency detail and CPU performance. You can also turn the visualizer off completely.
    *   **Real-time Sensitivity Control:** Use a simple slider to adjust the vertical amplification of the equalizer bars in real-time.
*   **Persistent Settings:** All your choices for theme, quality, and sensitivity are automatically saved and remembered for your next visit.

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

This project is licensed under the MIT License.
