import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import * as TWEEN from '@tweenjs/tween.js';

// Global variables
let scene, camera, renderer, labelRenderer, controls;
let currentCardIndex = 0;

// Make functions available globally immediately
window.selectDistrict = selectDistrictImpl;
window.showPage = showPageImpl;

// Get loading elements
const loadingScreen = document.querySelector('.loading-screen');
const loadingProgress = document.querySelector('.loading-progress');
const topLogo = document.querySelector('.top-logo');
const navPanel = document.querySelector('.nav-panel');

// Add initial hidden state for UI elements at the start of the file
const style = document.createElement('style');
style.textContent = `
    .nav-panel, .top-left-logo {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
    .nav-panel.visible, .top-left-logo.visible {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        transition: opacity 0.5s ease !important;
    }
    .top-left-logo {
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 1000;
        cursor: pointer;
        transition: transform 0.3s ease;
    }
    .top-left-logo:hover {
        transform: scale(1.05);
    }
    .top-left-logo img {
        width: 150px;
        height: auto;
        filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.2));
    }
`;
document.head.appendChild(style);

// Create and add the top-left logo
const topLeftLogo = document.createElement('a');
topLeftLogo.href = 'https://www.instagram.com/thegrassapp';
topLeftLogo.target = '_blank';
topLeftLogo.className = 'top-left-logo';
topLeftLogo.innerHTML = '<img src="./img/Logo.png" alt="GrassApp Logo">';
document.body.appendChild(topLeftLogo);

// Initialize scene and camera
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);

// Set initial camera position from intro marker
const introMarkerData = {
    camera: {
        x: "196.97",
        y: "156.96",
        z: "630.37"
    },
    target: {
        x: "191.44",
        y: "154.81",
        z: "622.32"
    }
};

// Set initial camera position with correct orientation
camera.position.set(
    parseFloat(introMarkerData.camera.x),
    parseFloat(introMarkerData.camera.y),
    parseFloat(introMarkerData.camera.z)
);

// Set initial camera target
const initialTarget = new THREE.Vector3(
    parseFloat(introMarkerData.target.x),
    parseFloat(introMarkerData.target.y),
    parseFloat(introMarkerData.target.z)
);
camera.lookAt(initialTarget);

// Update fog settings for better visibility
const fogColor = 0x000000;
const fogNear = 2000;  // Pushed back significantly from 800
const fogFar = 3000;   // Pushed back significantly from 1500
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

// Enhanced fog update function with reduced intensity
function updateFog() {
    const distanceFromCenter = Math.sqrt(
        camera.position.x * camera.position.x + 
        camera.position.z * camera.position.z
    );
    
    const heightFactor = Math.max(0, Math.min(1, camera.position.y / 2000));
    const distanceFactor = Math.max(0, Math.min(1, distanceFromCenter / 2000));
    const fogFactor = Math.max(heightFactor, distanceFactor);
    
    if (fogFactor > 0.5) {
        const intensity = (fogFactor - 0.5) / 0.5;
        scene.fog.near = 2000 - (intensity * 500);
        scene.fog.far = 3000 - (intensity * 500);
    } else {
        scene.fog.near = 2500;
        scene.fog.far = 3500;
    }
}

// Initialize renderer
renderer = new THREE.WebGLRenderer({ 
    antialias: window.devicePixelRatio === 1,  // Only use antialiasing on non-mobile
    alpha: true,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
    canvas: document.createElement('canvas')
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.shadowMap.enabled = false;  // Disable shadows for better performance
document.body.appendChild(renderer.domElement);

// Initialize CSS2D renderer for labels
labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'auto';
document.body.appendChild(labelRenderer.domElement);

// Add lights for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

// Add multiple directional lights for better coverage
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight1.position.set(1000, 1000, 1000);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight2.position.set(-1000, 1000, -1000);
scene.add(directionalLight2);

const directionalLight3 = new THREE.DirectionalLight(0xffffff, 1.2);
directionalLight3.position.set(0, 1000, 0);
scene.add(directionalLight3);

// Add more directional lights for comprehensive coverage
const directionalLight4 = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight4.position.set(1000, 1000, -1000);
scene.add(directionalLight4);

const directionalLight5 = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight5.position.set(-1000, 1000, 1000);
scene.add(directionalLight5);

// Remove old point lights and add new ones at strategic positions with increased intensity
const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 2500);
pointLight1.position.set(500, 1000, 500);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 2500);
pointLight2.position.set(-500, 1000, -500);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xffffff, 1.2, 2500);
pointLight3.position.set(0, 1000, 0);
scene.add(pointLight3);

// Add point lights at corners for better edge lighting
const pointLight4 = new THREE.PointLight(0xffffff, 1.0, 2500);
pointLight4.position.set(500, 1000, -500);
scene.add(pointLight4);

const pointLight5 = new THREE.PointLight(0xffffff, 1.0, 2500);
pointLight5.position.set(-500, 1000, 500);
scene.add(pointLight5);

// Function to check if device is mobile
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Initialize controls with essential settings only
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;  // Reduced for more stable movement
controls.screenSpacePanning = false;
controls.enablePan = false;
controls.rotateSpeed = 0.5;  // Fixed rotation speed
controls.zoomSpeed = 0.6;  // Fixed zoom speed
controls.minDistance = 250;
controls.maxDistance = 1000;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minPolarAngle = Math.PI / 6;
controls.target.copy(initialTarget);

// Define districts and pages arrays with corrected paths
const districts = [
    {
        name: 'innerHarbor',
        markerFile: './optimized_markers/marker_baltimore_inner_harbor_1735995279779.json'
    },
    {
        name: 'canton',
        markerFile: './optimized_markers/marker_canton_1735995578767.json'
    },
    {
        name: 'fellsPoint',
        markerFile: './optimized_markers/marker_fells_point_1735995790884.json'
    },
    {
        name: 'federalHill',
        markerFile: './optimized_markers/marker_federal_hill_1735995980501.json'
    },
    {
        name: 'mountVernon',
        markerFile: './optimized_markers/marker_mount_vernon_1735996124326.json'
    }
];

const pages = [
    {
        name: 'aboutUs',
        markerFile: './optimized_markers/marker_about_us_1735994495867.json'
    },
    {
        name: 'medicalPatient',
        markerFile: './optimized_markers/marker_medical_patient_1735994718056.json'
    },
    {
        name: 'partnerWithUs',
        markerFile: './optimized_markers/marker_partner_with_us_1735994991665.json'
    },
    {
        name: 'deliveryDriver',
        markerFile: './optimized_markers/marker_delivery_driver_1735995071394.json'
    }
];

// Add this after the districts and pages arrays
let autoMoveEnabled = true;
let currentMarkerIndex = 0;
const allMarkers = [...districts, ...pages];

async function startAutoMove() {
    if (!autoMoveEnabled) return;
    
    const markerData = await loadMarkerData(allMarkers[currentMarkerIndex].markerFile);
    
    if (markerData) {
        // Get the next marker data ready
        const nextIndex = (currentMarkerIndex + 1) % allMarkers.length;
        const nextMarkerData = await loadMarkerData(allMarkers[nextIndex].markerFile);
        
        if (nextMarkerData) {
            transitionCamera(markerData, () => {
                // Immediately start moving to the next marker
                currentMarkerIndex = nextIndex;
                startAutoMove();
            }, 5000); // Reduced duration for more continuous movement
        }
    }
}

// Function to load marker data
async function loadMarkerData(markerFile) {
    try {
        const response = await fetch(markerFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        return {
            camera: data.camera ? {
                x: data.camera.x || "0",
                y: data.camera.y || "0",
                z: data.camera.z || "0"
            } : null,
            target: data.target ? {
                x: data.target.x || "0",
                y: data.target.y || "0",
                z: data.target.z || "0"
            } : null
        };
    } catch (error) {
        console.error(`Error loading marker data from ${markerFile}:`, error);
        return null;
    }
}

// Unified camera transition function for both districts and pages
async function transitionCamera(markerData, onComplete = null, duration = 3000) {
    if (!markerData || !markerData.camera || !markerData.target) {
        console.error('Invalid marker data for camera transition');
        return;
    }

    const targetPos = new THREE.Vector3(
        parseFloat(markerData.target.x),
        parseFloat(markerData.target.y),
        parseFloat(markerData.target.z)
    );
    const cameraPos = new THREE.Vector3(
        parseFloat(markerData.camera.x),
        parseFloat(markerData.camera.y),
        parseFloat(markerData.camera.z)
    );
    
    new TWEEN.Tween({
        cx: camera.position.x,
        cy: camera.position.y,
        cz: camera.position.z,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z
    })
    .to({
        cx: cameraPos.x,
        cy: cameraPos.y,
        cz: cameraPos.z,
        tx: targetPos.x,
        ty: targetPos.y,
        tz: targetPos.z
    }, duration)
    .easing(TWEEN.Easing.Sinusoidal.InOut) // Changed to Sinusoidal for smoother continuous movement
    .onUpdate((coords) => {
        camera.position.set(coords.cx, coords.cy, coords.cz);
        controls.target.set(coords.tx, coords.ty, coords.tz);
    })
    .onComplete(() => {
        if (onComplete) onComplete();
    })
    .start();
}

// Modify the selectDistrictImpl and showPageImpl functions to disable auto-move
async function selectDistrictImpl(districtName) {
    autoMoveEnabled = false; // Disable auto-move when user selects a district
    removeExistingInfoCard();
    
    const district = districts.find(d => d.name === districtName);
    if (!district) {
        console.error('District not found:', districtName);
        return;
    }

    try {
        const markerData = await loadMarkerData(district.markerFile);
        transitionCamera(markerData);
    } catch (error) {
        console.error('Error moving camera to district:', districtName, error);
    }
}

async function showPageImpl(pageName) {
    autoMoveEnabled = false; // Disable auto-move when user selects a page
    removeExistingInfoCard();

    const page = pages.find(p => p.name === pageName);
    if (!page) {
        console.error('Page not found:', pageName);
        return;
    }

    try {
        const markerData = await loadMarkerData(page.markerFile);
        transitionCamera(markerData, () => showInfoCard(pageName));
    } catch (error) {
        console.error('Error moving camera to page:', pageName, error);
    }
}

// Add page content data with multiple cards per page
const pageContent = {
    aboutUs: {
        cards: [
            {
                title: "Who We Are",
                content: "GrassApp is revolutionizing cannabis delivery in Baltimore, creating a seamless bridge between trusted dispensaries and the community. We're not just delivering products—we're delivering peace of mind.",
                icon: '<img src="./img/Logo.png" class="card-logo" alt="GrassApp Logo" style="width: 300px; height: auto; margin: 20px auto;" />',
                features: [
                    { icon: '🌟', text: 'Safe & Seamless Delivery' },
                    { icon: '🤝', text: 'Community-Focused' },
                    { icon: '🔒', text: 'Secure & Discreet' },
                    { icon: '📱', text: 'User-Friendly Platform' }
                ],
                stats: [
                    { number: '24/7', label: 'Customer Support' },
                    { number: '30min', label: 'Average Delivery Time' },
                    { number: '100%', label: 'Licensed Partners' }
                ],
                highlight: "Founded in Baltimore, our mission is rooted in uplifting communities, providing responsible access to cannabis, and celebrating the unique spirit of the people we serve.",
                cta: {
                    text: "Join the GrassApp Community",
                    link: "https://www.instagram.com/thegrassapp"
                }
            }
        ]
    },
    medicalPatient: {
        cards: [
            {
                title: "How to Get Your Medical Cannabis Card",
                content: "Before GrassApp's delivery services launch, here's how to get your medical cannabis card in Maryland:",
                icon: '💊',
                features: [
                    { icon: '📝', text: 'Register at Maryland OneStop Portal' },
                    { icon: '👨‍⚕️', text: 'Get Certified by a Provider' },
                    { icon: '💳', text: 'Receive Your MMCC ID Card' },
                    { icon: '✅', text: 'Visit Any Licensed Dispensary' }
                ],
                cta: {
                    text: "Register at Maryland OneStop",
                link: "https://onestop.md.gov/public_profiles/adult-patient-registration-601c0fd9f9d7557af267e1e1"
                }
            },
            {
                title: "Coming Soon: GrassApp Delivery",
                content: "While we prepare to launch our delivery services, we're here to guide you through the process of becoming a medical cannabis patient. Stay tuned for updates on our launch!",
                icon: '🚀',
                features: [
                    { icon: '📱', text: 'Easy-to-use Mobile App' },
                    { icon: '🏃', text: 'Fast Delivery Service' },
                    { icon: '🔒', text: 'Secure Transactions' },
                    { icon: '💯', text: 'Licensed Dispensary Partners' }
                ]
            }
        ]
    },
    partnerWithUs: {
        cards: [
            {
                title: "Transform Your Business with GrassApp",
                content: "Join Baltimore's premier cannabis delivery network and revolutionize your business reach. Our cutting-edge platform connects you with a growing community of verified medical cannabis patients, offering unparalleled market expansion opportunities.",
                icon: '🌟',
                features: [
                    { icon: '📈', text: 'Expand Your Customer Base' },
                    { icon: '🔄', text: 'Real-Time Inventory Sync' },
                    { icon: '🛡️', text: 'Enterprise-Grade Security' },
                    { icon: '📱', text: 'Seamless Integration' }
                ],
                stats: [
                    { number: '24/7', label: 'Technical Support' },
                    { number: '100%', label: 'Digital Coverage' },
                    { number: '0%', label: 'Integration Cost' }
                ],
                highlight: "Be part of Baltimore's fastest-growing cannabis delivery network. Our platform is designed to enhance your business while maintaining the highest standards of compliance and security.",
                cta: {
                    text: "Contact Us",
                    link: "mailto:contact@thegrassapp.com"
                }
            },
            {
                title: "Exclusive Partnership Benefits",
                content: "Experience the power of GrassApp's state-of-the-art delivery infrastructure. Our platform seamlessly integrates with your existing systems, providing comprehensive business solutions and real-time analytics.",
                icon: '💎',
                features: [
                    { icon: '📊', text: 'Business Analytics' },
                    { icon: '🚀', text: 'Priority Delivery' },
                    { icon: '💰', text: 'Revenue Growth' },
                    { icon: '🤝', text: 'Dedicated Support' }
                ],
                stats: [
                    { number: '30min', label: 'Average Delivery' },
                    { number: '99.9%', label: 'Platform Uptime' },
                    { number: '100%', label: 'Secure Payments' }
                ],
                cta: {
                    text: "Contact Us",
                    link: "mailto:contact@thegrassapp.com"
                }
            }
        ]
    },
    deliveryDriver: {
        cards: [
            {
                title: "Become a Medical Cannabis Caregiver",
                content: "To prepare for GrassApp's launch, you'll need to register as a medical cannabis caregiver in Maryland. Here's what you need to know:",
                icon: '📋',
                features: [
                    { icon: '✅', text: 'Register at Maryland OneStop Portal' },
                    { icon: '📄', text: 'Complete Background Check' },
                    { icon: '💳', text: 'Obtain MMCC Caregiver ID' },
                    { icon: '🚗', text: 'Valid Driver\'s License Required' }
                ],
                cta: {
                    text: "Start Caregiver Registration",
                link: "https://onestop.md.gov/public_profiles/caregiver-registration-601c0fd5f9d7557af267cee1"
                }
            },
            {
                title: "Join GrassApp as a Driver",
                content: "Once you're registered as a caregiver, you'll be ready to join GrassApp when we launch. Benefits include:",
                icon: '🚗',
                features: [
                    { icon: '💰', text: 'Competitive Pay' },
                    { icon: '⏰', text: 'Flexible Hours' },
                    { icon: '📱', text: 'User-Friendly App' },
                    { icon: '🛡️', text: 'Insurance Coverage' }
                ]
            }
        ]
    }
};

// Update showInfoCard function with better transition handling
function showInfoCard(pageName) {
    removeExistingInfoCard();

    const pageInfo = pageContent[pageName];
    if (!pageInfo || !pageInfo.cards || !pageInfo.cards.length) return;

    const cardInfo = pageInfo.cards[currentCardIndex];

    // Create card container
    const card = document.createElement('div');
    card.className = `info-card ${pageName}-card`;
    if (pageName === 'aboutUs') card.classList.add('about-us-card');
    
    // Create and append icon/logo
    if (cardInfo.icon) {
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        iconContainer.innerHTML = cardInfo.icon;
        card.appendChild(iconContainer);
    }

    // Create and append title
    const title = document.createElement('h2');
    title.textContent = cardInfo.title;
    card.appendChild(title);

    // Create content container
    const content = document.createElement('div');
    content.className = 'info-card-content';
    
    // Add main content
    const mainContent = document.createElement('p');
    mainContent.textContent = cardInfo.content;
    content.appendChild(mainContent);

    // Add highlight section for About Us
    if (cardInfo.highlight) {
        const highlight = document.createElement('div');
        highlight.className = 'about-us-highlight';
        highlight.textContent = cardInfo.highlight;
        content.appendChild(highlight);
    }

    // Add features section
    if (cardInfo.features) {
        const featureList = document.createElement('div');
        featureList.className = 'feature-list';
        
        cardInfo.features.forEach(feature => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.innerHTML = `
                <span class="feature-icon">${feature.icon}</span>
                <span>${feature.text}</span>
            `;
            featureList.appendChild(featureItem);
        });
        
        content.appendChild(featureList);
    }

    // Add stats section for About Us
    if (cardInfo.stats) {
        const statsContainer = document.createElement('div');
        statsContainer.className = 'about-us-stats';
        
        cardInfo.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-number">${stat.number}</div>
                <div class="stat-label">${stat.label}</div>
            `;
            statsContainer.appendChild(statItem);
        });
        
        content.appendChild(statsContainer);
    }

    // Add CTA button
    if (cardInfo.cta) {
        const ctaButton = document.createElement('a');
        ctaButton.href = cardInfo.cta.link;
        ctaButton.className = 'cta-button';
        ctaButton.textContent = cardInfo.cta.text;
        content.appendChild(ctaButton);
    }

    card.appendChild(content);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'close-button';
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        card.classList.remove('visible');
        setTimeout(() => card.remove(), 300);
    };
    card.appendChild(closeBtn);

    // Add to document and animate
    document.body.appendChild(card);
    
    // Force reflow before adding visible class
    card.offsetHeight;
    
    // Add visible class in next frame
    requestAnimationFrame(() => {
        card.classList.add('visible');
    });
}

// Update removeExistingInfoCard function
function removeExistingInfoCard() {
    const existingCard = document.querySelector('.info-card');
    if (existingCard) {
        existingCard.classList.remove('visible');
        setTimeout(() => existingCard.remove(), 300);
    }
}

// Add state tracking for first selection
let hasFirstSelection = false;

// Update collapseNavPanel function with correct styling to match image
function collapseNavPanel() {
    const navPanel = document.querySelector('.nav-panel');
    if (!navPanel) return;

    // Add CSS for panel animation with click behavior
    const style = document.createElement('style');
    style.textContent = `
        .nav-panel, .top-left-logo {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: visibility 0s, opacity 0.5s ease !important;
        }
        .nav-panel.visible, .top-left-logo.visible {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transition: visibility 0s, opacity 0.5s ease !important;
        }
        .nav-panel.collapsed {
            transform: translate(calc(100% - 60px), -50%);
            pointer-events: none;
            touch-action: none;
            background: transparent;
            border: none;
            box-shadow: none;
            visibility: hidden;
            overflow: hidden;
        }
        .nav-panel.collapsed * {
            pointer-events: none;
            touch-action: none;
            visibility: hidden;
        }
        .nav-panel.collapsed .nav-button {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            touch-action: none;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .nav-panel.collapsed .nav-section h3 {
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }
        .nav-panel.collapsed .nav-panel-clickable {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            pointer-events: auto;
            cursor: pointer;
            touch-action: manipulation;
            z-index: 1001;
            background: rgb(0, 0, 0);
            border-radius: 50%;
            border: 2px solid rgba(0, 255, 0, 0.5);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
            visibility: visible !important;
            overflow: hidden;
        }
        .nav-panel.collapsed .nav-panel-clickable::before {
            content: '☰';
            color: rgba(0, 255, 0, 0.8);
            font-size: 24px;
            transition: all 0.3s ease;
            visibility: visible !important;
        }
        .nav-panel.collapsed .nav-panel-clickable:hover {
            background: rgb(0, 0, 0);
            border-color: rgba(0, 255, 0, 0.8);
            transform: translateY(-50%) scale(1.1);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
        }
        .nav-panel.collapsed .nav-panel-clickable:hover::before {
            color: rgba(0, 255, 0, 1);
        }
        @media (max-width: 768px) {
            .nav-panel {
                width: 55%;
                padding: 10px;
                margin: 10px 0;
                height: auto;
                max-height: 100vh;
                overflow: hidden;
            }
            .nav-panel.collapsed {
                transform: translate(calc(100% - 50px), -50%);
            }
            .nav-panel.collapsed .nav-button,
            .nav-panel.collapsed .nav-section h3 {
                display: none;
            }
            .nav-panel.collapsed .nav-panel-clickable {
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // Add clickable area for collapsed panel
    const clickableArea = document.createElement('div');
    clickableArea.className = 'nav-panel-clickable';
    navPanel.appendChild(clickableArea);

    // Add touch/click behavior for panel expansion
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    clickableArea.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        e.stopPropagation();
    }, { passive: false });

    clickableArea.addEventListener('touchmove', (e) => {
        if (navPanel.classList.contains('collapsed')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, { passive: false });

    clickableArea.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        const touchDistance = Math.sqrt(
            Math.pow(touchEndX - touchStartX, 2) + 
            Math.pow(touchEndY - touchStartY, 2)
        );

        // If it's a quick tap (less than 200ms) and minimal movement (less than 10px)
        if (touchDuration < 200 && touchDistance < 10) {
            if (navPanel.classList.contains('collapsed')) {
                navPanel.classList.remove('collapsed');
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }, { passive: false });

    // Add click handler for desktop
    clickableArea.addEventListener('click', (e) => {
        if (navPanel.classList.contains('collapsed')) {
            navPanel.classList.remove('collapsed');
            e.preventDefault();
            e.stopPropagation();
        }
    });

    // Add click/touch handler to collapse panel when clicking/touching outside
    document.addEventListener('click', (e) => {
        const navPanel = document.querySelector('.nav-panel');
        if (navPanel && !navPanel.contains(e.target)) {
            navPanel.classList.add('collapsed');
        }
    });

    document.addEventListener('touchstart', (e) => {
        const navPanel = document.querySelector('.nav-panel');
        if (navPanel && !navPanel.contains(e.target)) {
            navPanel.classList.add('collapsed');
        }
    }, { passive: true });
}

// Update button click handlers
document.addEventListener('DOMContentLoaded', () => {
    const navPanel = document.querySelector('.nav-panel');
    if (navPanel) {
        // Get the sections
        const sections = Array.from(navPanel.children);
        
        // Find the Pages and Districts sections
        const pagesSection = sections.find(section => 
            section.querySelector('h3')?.textContent.trim() === 'PAGES'
        );
        const districtsSection = sections.find(section => 
            section.querySelector('h3')?.textContent.trim() === 'DISTRICTS'
        );

        // If both sections exist, reorder them
        if (pagesSection && districtsSection) {
            navPanel.innerHTML = '';
            navPanel.appendChild(pagesSection);
            navPanel.appendChild(districtsSection);
        }
    }
    
    // Initialize nav panel collapse functionality
    collapseNavPanel();
    
    // Handle all navigation buttons
    const allButtons = document.querySelectorAll('.nav-button');
    allButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const navPanel = document.querySelector('.nav-panel');
            if (navPanel && !navPanel.classList.contains('collapsed')) {
                // Force immediate collapse
                requestAnimationFrame(() => {
                    navPanel.classList.add('collapsed');
                });
            }
        });
    });

    // Don't start with panel collapsed
    // Removed: if (navPanel) { navPanel.classList.add('collapsed'); }
});

// Remove any hover-based expansion
function toggleNavPanel() {
    const navPanel = document.querySelector('.nav-panel');
    if (!navPanel) return;
    
    if (navPanel.classList.contains('collapsed')) {
        navPanel.classList.remove('collapsed');
    } else {
        navPanel.classList.add('collapsed');
    }
}

try {
    // Initialize loaders
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.158.0/examples/jsm/libs/draco/');
    dracoLoader.preload();
    dracoLoader.setDecoderConfig({ type: 'js' });

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    // Load the model
    const modelPath = 'models/baltimore_city_optimized_v2.glb';
    console.log('Starting to load model from:', modelPath);
    gltfLoader.load(
        modelPath,
        (gltf) => {
            console.log('Model loaded successfully');
            const model = gltf.scene;
            
            // Set model orientation to match the top-down view
            model.scale.set(1, 1, 1);
            model.rotation.y = Math.PI;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            scene.add(model);

            // Hide loading screen first
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                
                // Show UI elements after loading screen starts fading
                setTimeout(() => {
                    const navPanel = document.querySelector('.nav-panel');
                    const topLogo = document.querySelector('.top-left-logo');
                    
                    if (navPanel) {
                        // Add animation styles for nav panel
                        const animStyle = document.createElement('style');
                        animStyle.textContent = `
                            @keyframes slideInFromRight {
                                0% {
                                    transform: translate(100%, -50%);
                                    opacity: 0;
                                }
                                100% {
                                    transform: translate(0, -50%);
                                    opacity: 1;
                                }
                            }
                            .nav-panel.visible {
                                animation: slideInFromRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                            }
                        `;
                        document.head.appendChild(animStyle);
                        
                        // Add a slight delay for the nav panel to create a sequence
                        setTimeout(() => {
                            navPanel.classList.add('visible');
                        }, 300);
                    }
                    
                    if (topLogo) {
                        requestAnimationFrame(() => {
                            topLogo.classList.add('visible');
                        });
                    }
                    // Start automatic camera movement
                    startAutoMove();
                }, 1000);
            }
        },
        (progress) => {
            if (loadingProgress) {
                const percent = (progress.loaded / progress.total) * 100;
                console.log('Loading progress:', percent + '%');
                loadingProgress.style.width = `${percent}%`;
            }
        },
        (error) => {
            console.error('Detailed error loading model:', {
                message: error.message,
                stack: error.stack,
                type: error.type,
                url: error.target?.responseURL || 'No URL available'
            });
            showError('Failed to load 3D model', error.message);
        }
    );

    // Simplified animation loop
    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        controls.update(); // Only one update per frame
        updateFog();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    }
    animate();

    // Handle window resize with mobile optimizations
    function onWindowResize() {
        const isMobile = isMobileDevice();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Update controls for mobile
        controls.panSpeed = isMobile ? 0.3 : 0.5;
        controls.minDistance = isMobile ? 50 : 100;
        controls.maxDistance = isMobile ? 1000 : 1500;

        // Adjust any existing info cards
        const existingCard = document.querySelector('.info-card');
        if (existingCard) {
            if (isMobile) {
                existingCard.style.right = '';
                existingCard.style.top = '';
                existingCard.style.transform = 'none';
                existingCard.style.width = '100%';
                existingCard.style.bottom = '0';
                existingCard.style.borderRadius = '20px 20px 0 0';
            } else {
                existingCard.style.bottom = '';
                existingCard.style.right = '20px';
                existingCard.style.top = '50%';
                existingCard.style.transform = 'translateY(-50%)';
                existingCard.style.width = '350px';
                existingCard.style.borderRadius = '20px';
            }
        }
    }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('orientationchange', () => {
        setTimeout(onWindowResize, 100);
    });

} catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to initialize the application', error.message);
}

// Error handling function
function showError(message, details) {
    console.error(message, details);
    const errorFallback = document.getElementById('error-fallback');
    if (errorFallback) {
        const errorMessage = errorFallback.querySelector('.error-message');
        const errorDetails = errorFallback.querySelector('.error-details');
        
        if (errorMessage) errorMessage.textContent = message;
        if (errorDetails) errorDetails.textContent = details;
        
        errorFallback.classList.remove('hidden');
    }
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
} 