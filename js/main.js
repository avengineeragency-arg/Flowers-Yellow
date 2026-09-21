/* =============================================
   ELIZABETH GALAXY — Main Orchestrator
   Initializes the full Three.js experience,
   connects all modules, runs the animation loop.
   ============================================= */

window.EG = window.EG || {};

(function () {
    'use strict';

    // MathUtils compatibility shim
    var mathLerp = (THREE.MathUtils && THREE.MathUtils.lerp)
        || (THREE.Math && THREE.Math.lerp)
        || function (a, b, t) { return a + (b - a) * t; };

    /* ===========================================
       QUALITY DETECTION
       =========================================== */
    /* ===========================================
       QUALITY DETECTION
       =========================================== */
    var QUALITY_PRESETS = {
        LOW:    { flowers: 160, spiral: 4000,  stars: 2000, dust: 800,  petals: 40, pixelRatio: 1.0,  bloom: true,  bloomStrength: 0.8 },
        MEDIUM: { flowers: 300, spiral: 7500,  stars: 3500, dust: 1400, petals: 65, pixelRatio: 1.5,  bloom: true,  bloomStrength: 1.0 },
        HIGH:   { flowers: 480, spiral: 10000, stars: 5000, dust: 2200, petals: 90, pixelRatio: 2.0, bloom: true,  bloomStrength: 1.1 }
    };

    function detectQuality() {
        var w = window.innerWidth;
        var isMobile = w < 768 || ('ontouchstart' in window && w < 1024);
        var isTablet = w >= 768 && w < 1200 && ('ontouchstart' in window);

        if (isMobile) return 'LOW';
        if (isTablet) return 'MEDIUM';
        return 'HIGH';
    }

    /* ===========================================
       WEBGL AVAILABILITY CHECK
       =========================================== */
    function isWebGLAvailable() {
        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    /* ===========================================
       MAIN INITIALIZATION
       =========================================== */
    function init() {

        // --- WebGL Fallback ---
        if (!isWebGLAvailable()) {
            document.getElementById('preloader').style.display = 'none';
            var fallback = document.getElementById('fallback');
            fallback.classList.remove('hidden');
            fallback.style.opacity = '1';
            fallback.style.display = 'flex';
            return;
        }

        // --- Quality ---
        var qualityLevel = detectQuality();
        var Q = QUALITY_PRESETS[qualityLevel];
        console.log('Elizabeth Galaxy — Quality:', qualityLevel);

        // --- DOM Elements ---
        var container       = document.getElementById('canvas-container');
        var preloader       = document.getElementById('preloader');
        var introScreen     = document.getElementById('intro-screen');
        var discoverSection = document.getElementById('discover-section');
        var discoverBtn     = document.getElementById('discover-btn');
        var message1        = document.getElementById('message-1');
        var messageFinal    = document.getElementById('message-final');
        var audioToggle     = document.getElementById('audio-toggle');
        var audioBtn        = document.getElementById('audio-btn');

        // --- Scene ---
        var scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020208);
        scene.fog = new THREE.FogExp2(0x020208, 0.007);

        // --- Camera ---
        var isPortrait = (window.innerWidth / window.innerHeight) < 1.0;
        var camera = new THREE.PerspectiveCamera(
            isPortrait ? 65 : 52,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );
        camera.position.set(0, 4.2, 13);
        camera.lookAt(0, -0.2, -2.5);

        // --- Renderer ---
        var pixelRatio = Math.min(window.devicePixelRatio, Q.pixelRatio);
        var renderer = new THREE.WebGLRenderer({
            antialias: qualityLevel !== 'LOW',
            alpha: false,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(pixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        container.appendChild(renderer.domElement);

        // --- Post-Processing ---
        var composer = null;
        var bloomPass = null;

        if (Q.bloom && THREE.EffectComposer) {
            composer = new THREE.EffectComposer(renderer);

            var renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);

            bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.55,            // strength: elegant and restrained
                0.35,            // radius
                0.85             // threshold: only bright celestial highlights bloom
            );
            composer.addPass(bloomPass);
        }

        // --- Lighting ---
        var ambientLight = new THREE.AmbientLight(0x353055, 0.45);
        scene.add(ambientLight);

        // Main golden point light at galaxy center
        var centerLight = new THREE.PointLight(0xFFD700, 2.0, 70, 1.2);
        centerLight.position.set(0.6, -0.4, -2.5);
        scene.add(centerLight);

        // Secondary soft directional light
        var dirLight = new THREE.DirectionalLight(0x99AAFF, 0.35);
        dirLight.position.set(-8, 12, 8);
        scene.add(dirLight);

        // Warm fill for foreground flowers
        var fillLight = new THREE.PointLight(0xFFBB55, 0.65, 30, 2);
        fillLight.position.set(0, 1, 9);
        scene.add(fillLight);

        // --- Create 3D Content ---

        // Flower Galaxy (tilted spiral)
        var galaxy = EG.Flowers.createGalaxy({
            count: Q.flowers,
            maxRadius: 20,
            tightness: 0.55,
            arms: 2,
            scatter: 0.35,
            ySpread: 0.6
        });
        galaxy.group.rotation.x = 0.52;
        galaxy.group.rotation.z = -0.12;
        galaxy.group.position.set(0.6, -0.6, -2.5);
        scene.add(galaxy.group);

        // Foreground flowers (framing camera in world space)
        if (galaxy.foregroundGroup) {
            scene.add(galaxy.foregroundGroup);
        }

        // Golden Spiral particles (matching galaxy shape)
        var goldenSpiral = EG.Particles.createGoldenSpiral(Q.spiral || 8000, {
            maxRadius: 20,
            tightness: 0.55,
            arms: 2
        });
        goldenSpiral.points.rotation.x = 0.52;
        goldenSpiral.points.rotation.z = -0.12;
        goldenSpiral.points.position.set(0.6, -0.6, -2.5);
        scene.add(goldenSpiral.points);

        // Distant mini whirlpool galaxy (top-left background)
        var miniGalaxy = EG.Particles.createMiniGalaxy();
        scene.add(miniGalaxy.sprite);

        // Starfield
        var starfield = EG.Particles.createStarfield(Q.stars);
        scene.add(starfield.points);

        // Golden Dust
        var dust = EG.Particles.createDust(Q.dust);
        scene.add(dust.points);

        // Petal Particles
        var petals = EG.Particles.createPetals(Q.petals);
        scene.add(petals.points);

        // Burst particles (for click effects)
        var burstSystem = EG.Particles.createBurstSystem();
        scene.add(burstSystem.points);

        // Nebula
        var nebula = EG.Particles.createNebula();
        scene.add(nebula.group);

        // --- Interaction ---
        EG.Interaction.init(renderer.domElement);
        EG.Interaction.initCursor();

        // --- State Machine ---
        var STATE = {
            PRELOADING: 'PRELOADING',
            SCENE_READY: 'SCENE_READY',
            DISCOVERING: 'DISCOVERING',
            MESSAGE_1: 'MESSAGE_1',
            SCENE_2: 'SCENE_2',
            FINAL: 'FINAL',
            COMPLETE: 'COMPLETE'
        };

        var currentState = STATE.PRELOADING;

        // --- Elements for Timelines ---
        var elements = {
            preloader: preloader,
            introScreen: introScreen,
            discoverSection: discoverSection,
            message1: message1,
            messageFinal: messageFinal
        };

        // Start experience: Preloader -> Landing reveal
        function startExperience() {
            EG.Animations.createPreloaderTimeline(elements, function () {
                currentState = STATE.SCENE_READY;
            });
        }

        setTimeout(startExperience, 600);

        // --- Controls (for interactive zoom in/out and orbit) ---
        var controls = null;
        if (THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 5;
            controls.maxDistance = 50;
            controls.enablePan = false;
            controls.maxPolarAngle = Math.PI / 2 + 0.25;
            controls.enabled = false; // Enabled after final transition
        }

        var isFinalState = false;
        var targetZoom = 13;

        // Mouse wheel zoom anytime
        window.addEventListener('wheel', function (e) {
            if (controls && controls.enabled) return;
            targetZoom += e.deltaY * 0.015;
            targetZoom = Math.max(5.0, Math.min(45.0, targetZoom));
        }, { passive: true });

        // --- Discover Button Click ---
        discoverBtn.addEventListener('click', function () {
            if (currentState !== STATE.SCENE_READY) return;
            currentState = STATE.DISCOVERING;

            // Play background music (Flores Amarillas instrumental)
            EG.Audio.playMusic();

            // Show audio toggle
            audioToggle.classList.remove('hidden');
            gsap.to(audioToggle, {
                opacity: 1,
                duration: 1.0,
                delay: 2.0,
                ease: 'power2.out'
            });

            // Burst effect from center
            burstSystem.burst(new THREE.Vector3(0, 0, 0), 50);

            // Play sparkle sound
            EG.Audio.playSparkle();

            // Reveal Message 1 -> Final Message ("Este pequeño universo es para ti") -> Grand Galaxy Zoom-out
            EG.Animations.createDiscoverTimeline(elements, camera, bloomPass, galaxy, function () {
                currentState = STATE.MESSAGE_1;

                EG.Animations.createFinalMomentTimeline(elements, camera, galaxy, bloomPass, function () {
                    currentState = STATE.COMPLETE;
                    isFinalState = true;

                    // Enable full interactive zoom & orbit exploration
                    if (controls) {
                        controls.enabled = true;
                        controls.autoRotate = true;
                        controls.autoRotateSpeed = 0.35;
                        controls.target.set(0, 0, -2);
                        controls.update();
                    }
                });
            });
        });

        // --- Audio Toggle ---
        audioBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var playing = EG.Audio.toggle();
            var iconOn = audioBtn.querySelector('.audio-icon-on');
            var iconOff = audioBtn.querySelector('.audio-icon-off');
            if (playing) {
                iconOn.style.display = 'inline';
                iconOff.style.display = 'none';
            } else {
                iconOn.style.display = 'none';
                iconOff.style.display = 'inline';
            }
        });

        // --- Mouse Parallax (applied to camera in animation loop) ---
        var parallaxIntensity = { value: 0.3 };

        // --- Animation Loop ---
        var clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);

            var delta = Math.min(clock.getDelta(), 0.05); // cap delta
            var elapsed = clock.getElapsedTime();

            // Update controls or parallax
            var mouse = EG.Interaction.getMouse();
            if (controls && controls.enabled) {
                controls.update();
            } else {
                // Mouse parallax on camera
                var px = mouse.x * parallaxIntensity.value;
                var py = mouse.y * parallaxIntensity.value * 0.5;

                // Apply parallax as offset (don't override GSAP-driven position)
                camera.rotation.y = mathLerp(camera.rotation.y, -px * 0.05, 0.03);
                camera.rotation.x = mathLerp(camera.rotation.x, py * 0.05, 0.03);

                // Galaxy tilt from mouse
                var targetRotY = mouse.x * 0.04;
                var targetRotX = 0.52 + mouse.y * 0.02;
                if (galaxy.group) {
                    galaxy.group.rotation.y = mathLerp(galaxy.group.rotation.y, targetRotY, 0.02);
                    galaxy.group.rotation.x = mathLerp(galaxy.group.rotation.x, targetRotX, 0.02);
                }
                if (goldenSpiral.points) {
                    goldenSpiral.points.rotation.y = galaxy.group.rotation.y;
                    goldenSpiral.points.rotation.x = galaxy.group.rotation.x;
                }
            }

            // Update galaxy flowers
            galaxy.update(elapsed);

            // Update particle systems
            goldenSpiral.update(elapsed);
            if (goldenSpiral.setElevation) {
                goldenSpiral.setElevation(galaxy.elevation.value);
            }
            miniGalaxy.update(elapsed);
            starfield.update(elapsed);
            dust.update(elapsed);
            petals.update(elapsed);
            burstSystem.update(delta);
            nebula.update(elapsed);

            // Center light gentle pulse
            centerLight.intensity = 2.0 + Math.sin(elapsed * 0.5) * 0.3;

            // Render
            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        }

        animate();

        // --- Window Resize ---
        function onResize() {
            var w = window.innerWidth;
            var h = window.innerHeight;

            camera.aspect = w / h;
            camera.fov = (camera.aspect < 1.0) ? 65 : 52;
            camera.updateProjectionMatrix();

            renderer.setSize(w, h);

            if (composer) {
                composer.setSize(w, h);
            }

            // Update quality if device changed significantly
            var newQuality = detectQuality();
            if (newQuality !== qualityLevel) {
                // Just update pixel ratio dynamically
                var newRatio = Math.min(window.devicePixelRatio, QUALITY_PRESETS[newQuality].pixelRatio);
                renderer.setPixelRatio(newRatio);
            }
        }

        window.addEventListener('resize', onResize);

        // Also handle orientation change
        window.addEventListener('orientationchange', function () {
            setTimeout(onResize, 100);
        });

        // --- Hover effects on flowers (raycasting) ---
        // Simplified: make discover button and overlays interactive
        // Full raycasting for flowers would be expensive; instead we use the
        // existing mouse parallax and particle effects for immersion.

        // Store reference for debugging
        EG.app = {
            scene: scene,
            camera: camera,
            renderer: renderer,
            composer: composer,
            bloomPass: bloomPass,
            galaxy: galaxy,
            quality: qualityLevel
        };
    }

    // --- Boot ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
