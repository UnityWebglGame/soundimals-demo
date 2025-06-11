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
  canvas.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  canvas.isAndroid = /Android/i.test(navigator.userAgent);

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
  // Setup mobile viewport with iOS specific handling
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  
  if (canvas.isIOS) {
    // iOS specific viewport to handle safe areas and prevent zooming
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  } else {
    // Android and other mobile devices
    meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
  }
  
  document.getElementsByTagName('head')[0].appendChild(meta);

  // Add iOS specific CSS variables for safe areas
  if (canvas.isIOS) {
    const style = document.createElement('style');
    style.textContent = `
      body {
        padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
        margin: 0;
        background-color: #fff;
      }
      #unity-container {
        position: relative;
        width: 100vw;
        height: 100vh;
        background-color: #fff;
      }
    `;
    document.head.appendChild(style);
  }

  // Listen for orientation changes
  window.addEventListener('orientationchange', adjustMobileCanvasSize);
  window.addEventListener('resize', adjustMobileCanvasSize);
  
  // Listen for visual viewport changes (better keyboard detection)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', adjustMobileCanvasSize);
  }

  // iOS specific handling for orientation and safe areas
  if (canvas.isIOS) {
    window.addEventListener('orientationchange', function() {
      // Delay adjustment for iOS orientation change
      setTimeout(adjustMobileCanvasSize, 500);
    });
    
    // iOS specific keyboard handling
    setupIOSKeyboardHandling();
  }

  // Initial size adjustment
  adjustMobileCanvasSize();
}

/**
 * Setup iOS specific keyboard handling to prevent layout shifts
 */
function setupIOSKeyboardHandling() {
  let keyboardVisible = false;
  let originalViewportHeight = window.innerHeight;
  
  // Store original container styles
  const container = document.querySelector('#unity-container');
  const originalContainerStyles = {
    position: container.style.position,
    top: container.style.top,
    left: container.style.left,
    transform: container.style.transform,
    height: container.style.height
  };

  // Listen for viewport changes (better iOS keyboard detection)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function() {
      const currentHeight = window.visualViewport.height;
      const heightDiff = originalViewportHeight - currentHeight;
      
      if (heightDiff > 150 && !keyboardVisible) {
        // Keyboard appeared
        keyboardVisible = true;
        lockCanvasPosition();
      } else if (heightDiff <= 50 && keyboardVisible) {
        // Keyboard disappeared
        keyboardVisible = false;
        unlockCanvasPosition();
      }
    });
  }
  
  // Fallback for older iOS versions
  window.addEventListener('resize', function() {
    const currentHeight = window.innerHeight;
    const heightDiff = originalViewportHeight - currentHeight;
    
    if (heightDiff > 150 && !keyboardVisible) {
      keyboardVisible = true;
      lockCanvasPosition();
    } else if (heightDiff <= 50 && keyboardVisible) {
      keyboardVisible = false;
      unlockCanvasPosition();
    }
  });

  function lockCanvasPosition() {
    // Add CSS class to trigger keyboard-specific styles
    document.body.classList.add('ios-keyboard-open');
    
    // Prevent any layout changes when keyboard appears
    if (container) {
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100vw';
      container.style.height = `${originalViewportHeight}px`;
      container.style.transform = 'none';
      container.style.overflow = 'hidden';
    }
    
    // Ensure canvas stays in original position
    if (canvas) {
      canvas.style.position = 'absolute';
      canvas.style.top = '50%';
      canvas.style.left = '50%';
      canvas.style.transform = 'translate(-50%, -50%)';
    }
    
    // Prevent scroll on the body
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  function unlockCanvasPosition() {
    // Remove CSS class
    document.body.classList.remove('ios-keyboard-open');
    
    // Restore normal behavior when keyboard disappears
    if (container) {
      container.style.position = originalContainerStyles.position || 'fixed';
      container.style.top = originalContainerStyles.top || '0';
      container.style.left = originalContainerStyles.left || '0';
      container.style.transform = originalContainerStyles.transform || 'none';
      container.style.height = '100vh';
    }
    
    // Restore scroll behavior
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    // Re-adjust canvas size
    setTimeout(adjustMobileCanvasSize, 100);
  }
}

/**
 * Adjust canvas size for mobile devices
 * - Directly matches device orientation (portrait or landscape)
 * - Fills the screen while maintaining aspect ratio
 * - Prevents resizing when virtual keyboard appears
 * - Handles iOS safe areas properly
 */
function adjustMobileCanvasSize() {
  // Use visual viewport if available (better for mobile)
  const visualViewport = window.visualViewport;
  let windowWidth, windowHeight;
  
  if (visualViewport) {
    windowWidth = visualViewport.width;
    windowHeight = visualViewport.height;
  } else {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }

  // iOS specific adjustments for safe areas
  if (canvas.isIOS) {
    // Get safe area insets if available
    const safeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '0');
    const safeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0');
    const safeAreaLeft = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal') || '0');
    const safeAreaRight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar') || '0');
    
    // Adjust for safe areas
    windowWidth = windowWidth - safeAreaLeft - safeAreaRight;
    windowHeight = windowHeight - safeAreaTop - safeAreaBottom;
    
    // For iOS, use screen dimensions to avoid issues with browser UI
    if (!canvas.initialScreenHeight) {
      windowWidth = Math.min(windowWidth, window.screen.width);
      windowHeight = Math.min(windowHeight, window.screen.height);
    }
  }

  // Store initial screen dimensions to prevent keyboard resize
  if (!canvas.initialScreenHeight) {
    canvas.initialScreenHeight = window.screen.height;
    canvas.initialScreenWidth = window.screen.width;
    canvas.initialWindowHeight = windowHeight;
    canvas.initialWindowWidth = windowWidth;
  }

  // Check if virtual keyboard is likely open (significant height reduction)
  const heightReduction = canvas.initialWindowHeight - windowHeight;
  const isKeyboardOpen = heightReduction > 150; // threshold for keyboard detection

  // Handle keyboard differently for iOS and Android
  if (isKeyboardOpen) {
    if (canvas.isIOS) {
      // For iOS, completely ignore viewport changes when keyboard is open
      // Always use the initial screen dimensions to prevent any layout shifts
      windowWidth = canvas.initialWindowWidth;
      windowHeight = canvas.initialWindowHeight;
      
      // Additionally, force the container to maintain its position
      const container = canvas.parentElement;
      if (container) {
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.transform = 'none';
      }
    } else {
      // Android logic (existing)
      windowWidth = canvas.initialWindowWidth;
      windowHeight = canvas.initialWindowHeight;
    }
  }

  // Use portrait dimensions (750x1334)
  canvas.originalWidth = 750;
  canvas.originalHeight = 1334;

  // Calculate scaling to fit the screen while maintaining aspect ratio
  const aspectRatio = canvas.originalWidth / canvas.originalHeight;
  let canvasWidth, canvasHeight;

  // Check if we should fill by width or height
  const screenAspectRatio = windowWidth / windowHeight;
  
  if (screenAspectRatio > aspectRatio) {
    // Screen is wider - fit by height
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * aspectRatio;
  } else {
    // Screen is taller - fit by width
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
  // Set canvas resolution for mobile devices
  if (canvas.isMobileDevice) {
    canvas.width = width * (canvas.isIOS ? 2.0 : 3.4);
    canvas.height = height * (canvas.isIOS ? 2.0 : 3.4);
  }

  // Apply CSS dimensions
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // Ensure the container fills the screen and removes black borders
  const container = canvas.parentElement;
  if (container && canvas.isMobileDevice) {
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.margin = '0';
    container.style.padding = '0';
    container.style.backgroundColor = '#000';
    container.style.overflow = 'hidden';
    
    // For iOS, handle safe areas
    if (canvas.isIOS) {
      container.style.paddingTop = 'env(safe-area-inset-top)';
      container.style.paddingBottom = 'env(safe-area-inset-bottom)';
      container.style.paddingLeft = 'env(safe-area-inset-left)';
      container.style.paddingRight = 'env(safe-area-inset-right)';
    }
  }

  // Center the canvas
  canvas.style.position = 'absolute';
  canvas.style.left = '50%';
  canvas.style.top = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  canvas.style.backgroundColor = '#000';
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
// Resource Preloading and Optimization
//-----------------------------------------------------------------------------

/**
 * Preload critical Unity resources for faster loading
 */
function preloadUnityResources() {
  const buildUrl = "Build";
  const criticalResources = [
    buildUrl + "/soundimals-demo.loader.js",
    buildUrl + "/soundimals-demo.framework.js.unityweb",
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'script';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

//-----------------------------------------------------------------------------
// Unity Loading and Initialization
//-----------------------------------------------------------------------------

/**
 * Load Unity game with optimized loading strategy
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
    companyName: "chfn",
    productName: "soundimals",
    productVersion: "0.1.1",
    showBanner: unityShowBanner,
    // Performance optimizations
    printErr: function(message) {
      console.warn(message);
    }
  };

// By default Unity keeps WebGL canvas render target size matched with
// the DOM size of the canvas element (scaled by window.devicePixelRatio)
// config.matchWebGLToCanvasSize = false;

// Set background if available

// Show loading bar
if (loadingBar) {
  loadingBar.style.display = "block";
  loadingBar.style.visibility = "visible";
}

// Load Unity script
const script = document.createElement("script");
script.src = loaderUrl;
script.onload = () => {
  createUnityInstance(canvas, config, (progress) => {
    // Update progress bar
    if (progressBarFull) {
      progressBarFull.style.width = 100 * progress + "%";
    }
  }).then((unityInstance) => {
    // Hide loading bar when Unity is fully loaded
    if (loadingBar) {
      loadingBar.style.display = "none";
    }
    // Add loaded class to body
    document.body.classList.add('unity-loaded');
  }).catch((message) => {
    // Hide loading bar on error
    if (loadingBar) {
      loadingBar.style.display = "none";
    }
    alert(message);
  });
};

document.body.appendChild(script);
}

//-----------------------------------------------------------------------------
// Initialize on page load with optimizations
//-----------------------------------------------------------------------------
window.addEventListener("DOMContentLoaded", function () {
  // Initialize DOM early
  InitializeDOM();
  
  // Start preloading resources immediately
  preloadUnityResources();
});

window.addEventListener("load", function () {
  // Load Unity game after all resources are ready
  loadUnityGame();
});
