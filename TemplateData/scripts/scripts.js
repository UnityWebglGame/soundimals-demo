/**
 * Unity WebGL Template - PWA
 * Main JavaScript functionality for Unity WebGL game integration
 * 
 * This script provides responsive canvas sizing for both desktop and mobile devices,
 * with mobile devices adapting to match the device orientation.
 */

//-----------------------------------------------------------------------------
// Configuration and Variables
//-----------------------------------------------------------------------------

// DOM element references
let container;
let canvas;
let loadingBar;
let progressBarFull;
let warningBanner;

//-----------------------------------------------------------------------------
// Initialization Functions
//-----------------------------------------------------------------------------

/**
 * Initialize DOM elements and setup canvas
 */
function InitializeDOM() {
  // Get DOM elements
  container = document.querySelector("#unity-container");
  canvas = document.querySelector("#unity-canvas");
  loadingBar = document.querySelector("#unity-loading-bar");
  progressBarFull = document.querySelector("#unity-progress-bar-full");
  warningBanner = document.querySelector("#unity-warning");

  // Set initial canvas dimensions from Unity template variables
  canvas.width = 750;
  canvas.height = 1334;

  // Store original dimensions for reference
  canvas.originalWidth = 750;
  canvas.originalHeight = 1334;

  // Detect device type
  canvas.isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Setup canvas based on device type
  if (canvas.isMobileDevice) {
    setupMobileCanvas();
  } else {
    setupDesktopCanvas();
  }
}

//-----------------------------------------------------------------------------
// Desktop Canvas Handling
//-----------------------------------------------------------------------------

/**
 * Setup desktop canvas with responsive sizing
 */
function setupDesktopCanvas() {
  // Add resize event listener
  window.addEventListener('resize', adjustDesktopCanvasSize);

  // Initial size adjustment
  adjustDesktopCanvasSize();
}

/**
 * Adjust canvas size for desktop browsers
 * - Maintains aspect ratio
 * - Maximum size: original dimensions
 * - Minimum size: half of original dimensions
 */
function adjustDesktopCanvasSize() {
  const originalWidth = canvas.originalWidth;
  const originalHeight = canvas.originalHeight;
  const aspectRatio = originalWidth / originalHeight;

  // Get available space
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Calculate dimensions to maintain aspect ratio
  let canvasWidth, canvasHeight;

  if (windowWidth / windowHeight > aspectRatio) {
    // Window is wider than needed
    canvasHeight = Math.min(windowHeight, originalHeight);
    canvasWidth = canvasHeight * aspectRatio;
  } else {
    // Window is taller than needed
    canvasWidth = Math.min(windowWidth, originalWidth);
    canvasHeight = canvasWidth / aspectRatio;
  }

  // Enforce minimum size (half of original)
  const minWidth = originalWidth / 2;
  const minHeight = originalHeight / 2;

  if (canvasWidth < minWidth) {
    canvasWidth = minWidth;
    canvasHeight = minWidth / aspectRatio;
  }

  if (canvasHeight < minHeight) {
    canvasHeight = minHeight;
    canvasWidth = minHeight * aspectRatio;
  }

  // Apply CSS dimensions
  applyCanvasDimensions(canvasWidth, canvasHeight);
}

//-----------------------------------------------------------------------------
// Mobile Canvas Handling
//-----------------------------------------------------------------------------

/**
 * Setup mobile canvas with orientation handling
 */
function setupMobileCanvas() {
  // Setup mobile viewport
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
  document.getElementsByTagName('head')[0].appendChild(meta);

  // Prepare portrait and landscape dimensions
  setupOrientationDimensions();

  // Listen for orientation changes
  window.addEventListener('orientationchange', adjustMobileCanvasSize);
  window.addEventListener('resize', adjustMobileCanvasSize);

  // Initial size adjustment
  adjustMobileCanvasSize();
}

/**
 * Setup portrait and landscape dimensions based on original canvas size
 */
function setupOrientationDimensions() {
  if (canvas.originalWidth > canvas.originalHeight) {
    // Original is landscape
    canvas.landscapeWidth = canvas.originalWidth;
    canvas.landscapeHeight = canvas.originalHeight;
    canvas.portraitWidth = canvas.originalHeight;
    canvas.portraitHeight = canvas.originalWidth;
  } else {
    // Original is portrait
    canvas.landscapeWidth = canvas.originalHeight;
    canvas.landscapeHeight = canvas.originalWidth;
    canvas.portraitWidth = canvas.originalWidth;
    canvas.portraitHeight = canvas.originalHeight;
  }
}

/**
 * Adjust canvas size for mobile devices
 * - Directly matches device orientation (portrait or landscape)
 * - Fills the screen while maintaining aspect ratio
 */
function adjustMobileCanvasSize() {
  // Get available space
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;


  // Use landscape dimensions (e.g., 1334x750)
  canvas.originalWidth = 750;
  canvas.originalHeight = 1334;

  // Calculate scaling to fit the screen
  const aspectRatio = canvas.width / canvas.height;
  let canvasWidth, canvasHeight;


  // Landscape mode - fill height
  canvasHeight = windowHeight;
  canvasWidth = canvasHeight * aspectRatio;

  // If width exceeds screen, adjust to fit width
  if (canvasWidth > windowWidth) {
    canvasWidth = windowWidth;
    canvasHeight = canvasWidth / aspectRatio;
  }



  // Apply CSS dimensions
  applyCanvasDimensions(canvasWidth, canvasHeight);
}

//-----------------------------------------------------------------------------
// Shared Utility Functions
//-----------------------------------------------------------------------------

/**
 * Apply dimensions to canvas and center it
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 */
function applyCanvasDimensions(width, height) {

  if (canvas.isMobileDevice) {
    canvas.width = width * 2;
    canvas.height = height * 2;
  }

  // Apply CSS dimensions
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;


  // Center the canvas
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
}

/**
 * Shows a temporary message banner/ribbon for a few seconds,
 * or a permanent error message on top of the canvas if type=='error'.
 * @param {string} msg - Message to display
 * @param {string} type - Message type ('error' or 'warning')
 */
function unityShowBanner(msg, type) {
  function updateBannerVisibility() {
    warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
  }

  const div = document.createElement('div');
  div.innerHTML = msg;
  warningBanner.appendChild(div);

  if (type == 'error') {
    div.style = 'background: red; padding: 10px;';
  } else if (type == 'warning') {
    div.style = 'background: yellow; padding: 10px;';
    setTimeout(function () {
      warningBanner.removeChild(div);
      updateBannerVisibility();
    }, 5000);
  }

  updateBannerVisibility();
}

//-----------------------------------------------------------------------------
// Unity Loading and Initialization
//-----------------------------------------------------------------------------

/**
 * Load Unity game
 */
function loadUnityGame() {
  const buildUrl = "Build";
  const loaderUrl = buildUrl + "/soundimals-demo.loader.js";

  // Unity build configuration
  const config = {
    arguments: [],
    dataUrl: buildUrl + "/soundimals-demo.data.unityweb",
    frameworkUrl: buildUrl + "/soundimals-demo.framework.js.unityweb",
    codeUrl: buildUrl + "/soundimals-demo.wasm.unityweb",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "Penpeer co. ltd.",
    productName: "GameCore",
    productVersion: "0.0.8",
    showBanner: unityShowBanner
  };

// By default Unity keeps WebGL canvas render target size matched with
// the DOM size of the canvas element (scaled by window.devicePixelRatio)
// config.matchWebGLToCanvasSize = false;

// Set background if available

// Show loading bar
loadingBar.style.display = "block";

// Load Unity script
const script = document.createElement("script");
script.src = loaderUrl;
script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    progressBarFull.style.width = 100 * progress + "%";
  }).then((unityInstance) => {
    loadingBar.style.display = "none";
  }).catch((message) => {
    alert(message);
  });
};

document.body.appendChild(script);
}

//-----------------------------------------------------------------------------
// Initialize on page load
//-----------------------------------------------------------------------------
window.addEventListener("load", function () {
  InitializeDOM();
  loadUnityGame();
});
