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

// Info sections data
const infoSections = {
    about: {
        title: 'About GrassApp',
        content: 'GrassApp is a marketplace platform connecting medical patients, headshops, and delivery drivers. We provide a seamless, secure, and fast way to get non-tobacco products like bongs, rolling papers, lighters, snacks, and beverages delivered to your door. GrassApp is not a direct seller; we simply facilitate the connection between buyers and sellers.'
    },
    medical: {
        title: 'Medical Patients',
        content: 'GrassApp makes it easy for medical patients to connect with licensed dispensaries for quick and secure delivery. All transactions are handled securely, and we prioritize patient privacy and convenience.'
    },
    partner: {
        title: 'Partner with Us',
        content: 'Are you a headshop or small business looking to expand your reach? Partner with GrassApp to offer your products for local delivery. From glassware to snacks, we help you connect with your community and increase your sales without the hassle of managing your own delivery network.'
    },
    driver: {
        title: 'Become a Delivery Driver',
        content: 'Join our network of independent drivers and earn on your own schedule. Whether you\'re delivering bongs, rolling papers, or just a bag of chips, GrassApp makes it easy to pick up and deliver orders in your area.'
    },
    headshops: {
        title: 'Headshops',
        content: 'GrassApp connects local headshops with customers who want the convenience of delivery. We legally deliver non-tobacco products like bongs, glass pipes, rolling papers, lighters, grinders, snacks, and beverages. Headshops can reach a broader audience without worrying about compliance issues or delivery logistics.'
    }
};

// Create navigation panel
function createNavigationPanel() {
    const navPanel = document.createElement('div');
    navPanel.className = 'nav-panel';

    Object.keys(infoSections).forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'nav-section';

        const title = document.createElement('h3');
        title.textContent = infoSections[section].title;

        const button = document.createElement('button');
        button.className = 'nav-button';
        button.textContent = 'Learn More';
        button.onclick = () => showInfoCards(section);

        sectionDiv.appendChild(title);
        sectionDiv.appendChild(button);
        navPanel.appendChild(sectionDiv);
    });

    document.body.appendChild(navPanel);
}

// Info cards function
window.showInfoCards = function(type) {
    const section = infoSections[type];
    if (!section) return;

    // Create or update info card
    let infoCard = document.querySelector('.info-card');
    if (!infoCard) {
        infoCard = document.createElement('div');
        infoCard.className = 'info-card';
        document.body.appendChild(infoCard);
    }

    // Update content with animation
    infoCard.innerHTML = `
        <h2>${section.title}</h2>
        <p>${section.content}</p>
        <button class="close-button">×</button>
    `;

    // Add close button functionality
    const closeButton = infoCard.querySelector('.close-button');
    closeButton.onclick = () => {
        infoCard.style.opacity = '0';
        setTimeout(() => {
            infoCard.style.display = 'none';
        }, 300);
    };

    // Show card with animation
    infoCard.style.display = 'block';
    setTimeout(() => {
        infoCard.style.opacity = '1';
    }, 10);
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
                    createNavigationPanel(); // Create navigation panel after loading
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