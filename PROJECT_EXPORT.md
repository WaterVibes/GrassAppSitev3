# GrassApp Project Export

## Project Overview
This is a Vite-based web application for the GrassApp website. The project uses modern web technologies including Three.js for 3D visualization and follows a clean, organized structure.

## Project Structure
```
grassapp/
├── src/
│   ├── js/
│   │   └── scripts.js
│   └── css/
│       └── styles.css
├── public/
│   ├── js/
│   ├── img/
│   └── css/
├── dist/
├── .github/
├── node_modules/
├── vite.config.js
├── CNAME
├── .nojekyll
└── README.md
```

## Key Files

### Configuration Files

#### vite.config.js
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    copyPublicDir: true
  },
  resolve: {
    alias: {
      'three': 'three',
      '@tweenjs/tween.js': '@tweenjs/tween.js'
    }
  },
  publicDir: 'public',
  server: {
    watch: {
      usePolling: true
    },
    fs: {
      strict: false,
      allow: ['..']
    }
  }
});
```

### Source Files

#### src/js/scripts.js
```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as TWEEN from '@tweenjs/tween.js';

// Initialize loading screen
const loadingScreen = document.querySelector('.loading-screen');
const loadingProgress = document.querySelector('.loading-progress');

// Initialize scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Set up controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Set initial camera position
camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// District selection function
window.selectDistrict = function(district) {
    console.log('Selected district:', district);
    // Add district-specific logic here
};

// Info cards function
window.showInfoCards = function(type) {
    console.log('Showing info cards for:', type);
    // Add info cards logic here
};

// Update loading progress
function updateLoadingProgress(progress) {
    if (loadingProgress) {
        loadingProgress.style.width = `${progress}%`;
        if (progress === 100) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }, 500);
        }
    }
}

// Simulate initial loading
let progress = 0;
const loadingInterval = setInterval(() => {
    progress += 10;
    updateLoadingProgress(progress);
    if (progress >= 100) {
        clearInterval(loadingInterval);
    }
}, 200);
```

#### src/css/styles.css
```css
/* Base styles */
body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    overflow: hidden;
}

/* Loading screen */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-content {
    text-align: center;
}

.loading-bar {
    width: 200px;
    height: 4px;
    background: #333;
    margin-top: 20px;
    border-radius: 2px;
    overflow: hidden;
}

.loading-progress {
    width: 0%;
    height: 100%;
    background: #4CAF50;
    transition: width 0.3s ease;
}

/* Error screen */
.error-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1001;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
}

.error-screen.hidden {
    display: none;
}

.error-content {
    text-align: center;
    padding: 20px;
}

/* Navigation */
.nav-panel {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    border-radius: 10px;
    z-index: 100;
}

.nav-section {
    margin-bottom: 20px;
}

.nav-section h3 {
    color: white;
    margin: 0 0 10px 0;
}

.button-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.nav-button {
    background: #4CAF50;
    border: none;
    padding: 8px 16px;
    color: white;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.nav-button:hover {
    background: #45a049;
}

/* Logo */
.top-logo {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 100;
}

.top-logo img {
    height: 60px;
    width: auto;
}
```

### Public Assets
The public directory contains all static assets:
- `public/js/` - JavaScript files
- `public/img/` - Image assets
- `public/css/` - CSS files

## Development Setup
1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Dependencies
The project uses the following key dependencies:
- Vite (Build tool)
- Three.js (3D visualization)
- Tween.js (Animation)
- Poppins (Font)

## Deployment
The project is configured for GitHub Pages deployment with a custom domain (thegrassapp.com).

## Important Notes
1. The project uses Vite as the build tool
2. Custom domain is configured via CNAME file
3. GitHub Pages deployment is enabled
4. Jekyll processing is disabled via .nojekyll file
5. The project includes a 3D visualization using Three.js
6. Loading screen and error handling are implemented
7. Responsive design with mobile-friendly navigation

## Environment Variables
No sensitive environment variables are stored in the repository. Any required environment variables should be added to a `.env` file locally.

## Build and Deployment Process
1. The project is built using Vite
2. Built files are output to the `dist` directory
3. GitHub Pages serves the contents of the `dist` directory
4. Custom domain is configured via DNS settings and CNAME file

## Additional Resources
- Vite Documentation: https://vitejs.dev/
- GitHub Pages Documentation: https://docs.github.com/en/pages
- Three.js Documentation: https://threejs.org/docs/
- Tween.js Documentation: https://github.com/tweenjs/tween.js/ 