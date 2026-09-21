/* =============================================
   ELIZABETH GALAXY — Particle Systems v2
   Enhanced starfield, golden spiral particles,
   rich nebula, atmospheric dust, floating petals.
   ============================================= */

window.EG = window.EG || {};

EG.Particles = (function () {
    'use strict';

    /* ===========================================
       STARFIELD — Dense multi-layer stars
       =========================================== */
    function createStarfield(count) {
        count = count || 4000;

        var positions = new Float32Array(count * 3);
        var sizes = new Float32Array(count);
        var colors = new Float32Array(count * 3);
        var speeds = new Float32Array(count);

        var spread = 250;

        for (var i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 2] = -Math.random() * spread; // Mostly behind

            // Star size: mostly tiny, few large
            var r = Math.random();
            sizes[i] = r < 0.95 ? (0.2 + Math.random() * 0.8) : (1.5 + Math.random() * 2.0);

            // Star color: mostly white/blue, some warm
            var warmth = Math.random();
            if (warmth < 0.7) {
                // Cool white/blue
                colors[i * 3]     = 0.85 + Math.random() * 0.15;
                colors[i * 3 + 1] = 0.88 + Math.random() * 0.12;
                colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
            } else if (warmth < 0.85) {
                // Warm yellow
                colors[i * 3]     = 1.0;
                colors[i * 3 + 1] = 0.85 + Math.random() * 0.1;
                colors[i * 3 + 2] = 0.5 + Math.random() * 0.2;
            } else {
                // Blue
                colors[i * 3]     = 0.6 + Math.random() * 0.2;
                colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
                colors[i * 3 + 2] = 1.0;
            }

            speeds[i] = 0.1 + Math.random() * 0.5;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

        var mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: [
                'attribute float aSize;',
                'attribute vec3 aColor;',
                'attribute float aSpeed;',
                'uniform float uTime;',
                'uniform float uPixelRatio;',
                'varying float vAlpha;',
                'varying vec3 vColor;',
                'void main() {',
                '    vColor = aColor;',
                '    float twinkle = sin(uTime * aSpeed * 2.0 + position.x * 5.0 + position.y * 3.0) * 0.4 + 0.6;',
                '    vAlpha = twinkle;',
                '    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
                '    gl_PointSize = aSize * uPixelRatio * (120.0 / -mvPosition.z);',
                '    gl_PointSize = clamp(gl_PointSize, 0.3, 6.0);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying float vAlpha;',
                'varying vec3 vColor;',
                'void main() {',
                '    float d = length(gl_PointCoord - vec2(0.5));',
                '    if (d > 0.5) discard;',
                '    float core = smoothstep(0.5, 0.05, d);',
                '    float glow = smoothstep(0.5, 0.2, d) * 0.5;',
                '    float alpha = (core + glow) * vAlpha;',
                '    gl_FragColor = vec4(vColor, alpha);',
                '}'
            ].join('\n'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        var points = new THREE.Points(geo, mat);
        points.frustumCulled = false;

        return {
            points: points,
            update: function (time) { mat.uniforms.uTime.value = time; }
        };
    }

    /* ===========================================
       GOLDEN SPIRAL PARTICLES
       Thousands of golden points following the
       same spiral pattern as the flower galaxy,
       creating the dense glowing spiral effect.
       =========================================== */
    function createGoldenSpiral(count, config) {
        count = count || 8000;
        config = config || {};
        var maxRadius = config.maxRadius || 18;
        var tightness = config.tightness || 0.55;
        var arms = config.arms || 2;

        var positions = new Float32Array(count * 3);
        var sizes = new Float32Array(count);
        var phases = new Float32Array(count);

        for (var i = 0; i < count; i++) {
            var arm = i % arms;
            var armOffset = (arm / arms) * Math.PI * 2;

            var t = Math.pow(Math.random(), 0.5);
            var radius = t * maxRadius;
            var angle = radius * tightness + armOffset;

            var scatter = radius * 0.45;
            var sx = (Math.random() - 0.5) * scatter;
            var sz = (Math.random() - 0.5) * scatter;

            positions[i * 3]     = Math.cos(angle) * radius + sx;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8 * (1 - t * 0.5);
            positions[i * 3 + 2] = Math.sin(angle) * radius + sz;

            // Bigger near center, tiny at edges
            sizes[i] = (1.0 + Math.random() * 2.0) * (1.3 - t * 0.8);
            phases[i] = Math.random() * Math.PI * 2;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

        var mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uElevation: { value: 0 }
            },
            vertexShader: [
                'attribute float aSize;',
                'attribute float aPhase;',
                'uniform float uTime;',
                'uniform float uPixelRatio;',
                'uniform float uElevation;',
                'varying float vAlpha;',
                'void main() {',
                '    vec3 pos = position;',
                '    pos.x += sin(uTime * 0.15 + aPhase) * 0.15;',
                '    pos.y += cos(uTime * 0.12 + aPhase * 1.3) * 0.1 + uElevation;',
                '    pos.z += sin(uTime * 0.1 + aPhase * 0.7) * 0.12;',
                '    float pulse = sin(uTime * 0.5 + aPhase) * 0.25 + 0.75;',
                '    vAlpha = pulse * 0.7;',
                '    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
                '    gl_PointSize = aSize * uPixelRatio * (60.0 / -mvPosition.z) * pulse;',
                '    gl_PointSize = clamp(gl_PointSize, 0.2, 8.0);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying float vAlpha;',
                'void main() {',
                '    float d = length(gl_PointCoord - vec2(0.5));',
                '    if (d > 0.5) discard;',
                '    float core = smoothstep(0.5, 0.0, d);',
                '    float glow = smoothstep(0.5, 0.15, d) * 0.4;',
                '    float alpha = (core + glow) * vAlpha;',
                '    vec3 color = mix(vec3(1.0, 0.75, 0.15), vec3(1.0, 0.92, 0.6), core);',
                '    gl_FragColor = vec4(color, alpha);',
                '}'
            ].join('\n'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        var points = new THREE.Points(geo, mat);
        points.frustumCulled = false;

        return {
            points: points,
            update: function (time) { mat.uniforms.uTime.value = time; },
            setElevation: function (v) { mat.uniforms.uElevation.value = v; }
        };
    }

    /* ===========================================
       ATMOSPHERIC DUST
       Warm golden particles floating everywhere
       =========================================== */
    function createDust(count) {
        count = count || 2000;

        var positions = new Float32Array(count * 3);
        var sizes = new Float32Array(count);
        var phases = new Float32Array(count);
        var spread = 60;

        for (var i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
            sizes[i] = 0.3 + Math.random() * 1.2;
            phases[i] = Math.random() * Math.PI * 2;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

        var mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: [
                'attribute float aSize;',
                'attribute float aPhase;',
                'uniform float uTime;',
                'uniform float uPixelRatio;',
                'varying float vAlpha;',
                'void main() {',
                '    vec3 pos = position;',
                '    pos.x += sin(uTime * 0.12 + aPhase) * 1.0;',
                '    pos.y += cos(uTime * 0.08 + aPhase * 1.3) * 0.6;',
                '    pos.z += sin(uTime * 0.1 + aPhase * 0.7) * 0.8;',
                '    float pulse = sin(uTime * 0.25 + aPhase) * 0.3 + 0.7;',
                '    vAlpha = pulse * 0.45;',
                '    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
                '    gl_PointSize = aSize * uPixelRatio * (50.0 / -mvPosition.z) * pulse;',
                '    gl_PointSize = clamp(gl_PointSize, 0.2, 5.0);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying float vAlpha;',
                'void main() {',
                '    float d = length(gl_PointCoord - vec2(0.5));',
                '    if (d > 0.5) discard;',
                '    float alpha = smoothstep(0.5, 0.0, d) * vAlpha;',
                '    gl_FragColor = vec4(1.0, 0.85, 0.3, alpha);',
                '}'
            ].join('\n'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        var points = new THREE.Points(geo, mat);
        points.frustumCulled = false;

        return {
            points: points,
            update: function (time) { mat.uniforms.uTime.value = time; }
        };
    }

    /* ===========================================
       FLOATING PETALS
       Larger petal shapes drifting across the view
       =========================================== */
    function createPetals(count) {
        count = count || 80;

        var positions = new Float32Array(count * 3);
        var sizes = new Float32Array(count);
        var phases = new Float32Array(count);
        var spread = 50;

        for (var i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.7;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
            sizes[i] = 2.5 + Math.random() * 5.0;
            phases[i] = Math.random() * Math.PI * 2;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

        var mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: [
                'attribute float aSize;',
                'attribute float aPhase;',
                'uniform float uTime;',
                'uniform float uPixelRatio;',
                'varying float vAlpha;',
                'varying float vPhase;',
                'void main() {',
                '    vec3 pos = position;',
                '    pos.x += sin(uTime * 0.06 + aPhase) * 3.0;',
                '    pos.y += cos(uTime * 0.04 + aPhase * 1.5) * 2.0 + uTime * 0.08;',
                '    pos.z += sin(uTime * 0.05 + aPhase * 0.8) * 2.0;',
                '    pos.y = mod(pos.y + 25.0, 50.0) - 25.0;',
                '    vAlpha = sin(uTime * 0.15 + aPhase) * 0.15 + 0.4;',
                '    vPhase = aPhase;',
                '    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
                '    gl_PointSize = aSize * uPixelRatio * (45.0 / -mvPosition.z);',
                '    gl_PointSize = clamp(gl_PointSize, 0.5, 15.0);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying float vAlpha;',
                'varying float vPhase;',
                'void main() {',
                '    vec2 uv = gl_PointCoord - vec2(0.5);',
                '    // Rotate UV for tumbling effect',
                '    float c = cos(vPhase * 3.0);',
                '    float s = sin(vPhase * 3.0);',
                '    vec2 ruv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);',
                '    float d = length(ruv * vec2(1.0, 1.8));',
                '    if (d > 0.45) discard;',
                '    float alpha = smoothstep(0.45, 0.1, d) * vAlpha;',
                '    vec3 color = mix(vec3(1.0, 0.82, 0.25), vec3(1.0, 0.93, 0.6), smoothstep(0.0, 0.4, d));',
                '    gl_FragColor = vec4(color, alpha);',
                '}'
            ].join('\n'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        var points = new THREE.Points(geo, mat);
        points.frustumCulled = false;

        return {
            points: points,
            update: function (time) { mat.uniforms.uTime.value = time; }
        };
    }

    /* ===========================================
       NEBULA BACKGROUND
       Rich colorful nebula using canvas-textured
       meshes for deep space atmosphere.
       =========================================== */
    function createNebula() {
        var group = new THREE.Group();

        function makeNebulaTexture(config) {
            var size = config.size || 512;
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');

            var cx = size / 2;
            var cy = size / 2;
            var r = size / 2;

            // Multiple overlapping gradients for richness
            config.layers.forEach(function (layer) {
                var ox = cx + (layer.offsetX || 0) * size;
                var oy = cy + (layer.offsetY || 0) * size;
                var grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, r * (layer.scale || 1));
                grad.addColorStop(0, layer.inner);
                grad.addColorStop(0.4, layer.mid || layer.inner.replace(/[\d.]+\)$/, '0.05)'));
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, size, size);
            });

            var texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            return texture;
        }

        var nebulaConfigs = [
            // Deep blue-violet nebula (upper right)
            {
                pos: [25, 15, -80], scale: 70, rotSpeed: 0.002,
                layers: [
                    { inner: 'rgba(30, 20, 90, 0.3)', mid: 'rgba(15, 10, 60, 0.1)', scale: 1, offsetX: 0.1, offsetY: -0.1 },
                    { inner: 'rgba(60, 30, 120, 0.2)', scale: 0.7, offsetX: -0.1, offsetY: 0.05 },
                    { inner: 'rgba(100, 50, 180, 0.08)', scale: 0.5, offsetX: 0.15, offsetY: 0 },
                ]
            },
            // Blue nebula
            {
                pos: [-30, 10, -90], scale: 60, rotSpeed: -0.0015,
                layers: [
                    { inner: 'rgba(15, 40, 100, 0.25)', mid: 'rgba(8, 20, 55, 0.08)', scale: 1, offsetX: 0, offsetY: 0 },
                    { inner: 'rgba(30, 60, 140, 0.12)', scale: 0.6, offsetX: 0.1, offsetY: -0.1 },
                ]
            },
            // Warm golden nebula (near center, subtle)
            {
                pos: [0, -5, -50], scale: 45, rotSpeed: 0.003,
                layers: [
                    { inner: 'rgba(80, 50, 10, 0.2)', mid: 'rgba(40, 25, 5, 0.06)', scale: 1, offsetX: 0, offsetY: 0.1 },
                    { inner: 'rgba(120, 70, 10, 0.08)', scale: 0.5, offsetX: -0.1, offsetY: 0 },
                ]
            },
            // Deep purple (lower)
            {
                pos: [-20, -15, -70], scale: 55, rotSpeed: 0.001,
                layers: [
                    { inner: 'rgba(40, 10, 70, 0.22)', mid: 'rgba(20, 5, 40, 0.07)', scale: 1, offsetX: 0, offsetY: 0 },
                    { inner: 'rgba(70, 20, 110, 0.1)', scale: 0.6, offsetX: 0.1, offsetY: 0.1 },
                ]
            },
            // Magenta accent
            {
                pos: [35, 5, -100], scale: 50, rotSpeed: -0.002,
                layers: [
                    { inner: 'rgba(60, 15, 50, 0.18)', mid: 'rgba(30, 8, 25, 0.05)', scale: 1, offsetX: -0.05, offsetY: 0 },
                ]
            },
            // Very large dim blue (atmosphere)
            {
                pos: [0, 0, -120], scale: 120, rotSpeed: 0.0005,
                layers: [
                    { inner: 'rgba(10, 15, 40, 0.15)', scale: 1, offsetX: 0, offsetY: 0 },
                ]
            },
        ];

        var meshes = [];

        nebulaConfigs.forEach(function (cfg) {
            var texture = makeNebulaTexture(cfg);
            var mat = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                side: THREE.DoubleSide
            });

            var geo = new THREE.PlaneGeometry(cfg.scale, cfg.scale);
            var mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
            mesh.rotation.z = Math.random() * Math.PI;
            mesh.userData.rotSpeed = cfg.rotSpeed;

            group.add(mesh);
            meshes.push(mesh);
        });

        return {
            group: group,
            update: function (time) {
                meshes.forEach(function (m) {
                    m.rotation.z += m.userData.rotSpeed * 0.03;
                });
            }
        };
    }

    /* ===========================================
       BURST PARTICLES (click interaction)
       =========================================== */
    function createBurstSystem() {
        var MAX = 200;
        var positions = new Float32Array(MAX * 3);
        var velocities = new Float32Array(MAX * 3);
        var lifetimes = new Float32Array(MAX);
        var ages = new Float32Array(MAX);
        var activeCount = 0;

        // Initialize offscreen
        for (var i = 0; i < MAX; i++) {
            positions[i * 3 + 1] = -1000;
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        var mat = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 1.8,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        var points = new THREE.Points(geo, mat);
        points.frustumCulled = false;

        function burst(origin, count) {
            count = Math.min(count || 40, MAX);
            activeCount = count;
            for (var i = 0; i < count; i++) {
                var theta = Math.random() * Math.PI * 2;
                var phi = Math.random() * Math.PI;
                var speed = 0.03 + Math.random() * 0.08;
                positions[i * 3]     = origin.x;
                positions[i * 3 + 1] = origin.y;
                positions[i * 3 + 2] = origin.z;
                velocities[i * 3]     = Math.sin(phi) * Math.cos(theta) * speed;
                velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
                velocities[i * 3 + 2] = Math.cos(phi) * speed;
                lifetimes[i] = 1.5 + Math.random() * 1.5;
                ages[i] = 0;
            }
            geo.attributes.position.needsUpdate = true;
        }

        function update(delta) {
            if (activeCount <= 0) return;
            var alive = false;
            for (var i = 0; i < activeCount; i++) {
                ages[i] += delta;
                if (ages[i] >= lifetimes[i]) {
                    positions[i * 3 + 1] = -1000;
                } else {
                    alive = true;
                    positions[i * 3]     += velocities[i * 3];
                    positions[i * 3 + 1] += velocities[i * 3 + 1];
                    positions[i * 3 + 2] += velocities[i * 3 + 2];
                    velocities[i * 3]     *= 0.97;
                    velocities[i * 3 + 1] *= 0.97;
                    velocities[i * 3 + 2] *= 0.97;
                    velocities[i * 3 + 1] += 0.0004;
                }
            }
            mat.opacity = alive ? 0.9 : 0;
            geo.attributes.position.needsUpdate = true;
            if (!alive) activeCount = 0;
        }

        return { points: points, burst: burst, update: update };
    }

    /* ===========================================
       INTRO PARTICLES — expanding golden burst
       =========================================== */
    function createIntroParticles(count) {
        count = count || 500;

        var positions = new Float32Array(count * 3);
        var velocities = [];
        for (var i = 0; i < count; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            var theta = Math.random() * Math.PI * 2;
            var phi = Math.random() * Math.PI;
            var speed = 0.005 + Math.random() * 0.025;
            velocities.push({
                x: Math.sin(phi) * Math.cos(theta) * speed,
                y: Math.sin(phi) * Math.sin(theta) * speed,
                z: Math.cos(phi) * speed * 0.5
            });
        }

        var geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        var mat = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 1.5,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        var points = new THREE.Points(geo, mat);
        points.frustumCulled = false;
        var started = false;

        return {
            points: points,
            material: mat,
            start: function () { started = true; },
            update: function () {
                if (!started) return;
                var pos = geo.attributes.position.array;
                for (var i = 0; i < count; i++) {
                    pos[i * 3]     += velocities[i].x;
                    pos[i * 3 + 1] += velocities[i].y;
                    pos[i * 3 + 2] += velocities[i].z;
                }
                geo.attributes.position.needsUpdate = true;
            }
        };
    }

    /* ===========================================
       DISTANT SPIRAL GALAXY (top-left background)
       =========================================== */
    function createMiniGalaxy() {
        var size = 256;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');
        var cx = size / 2;
        var cy = size / 2;

        // Radial glow
        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.45);
        grad.addColorStop(0, 'rgba(255, 240, 200, 0.95)');
        grad.addColorStop(0.12, 'rgba(255, 210, 120, 0.7)');
        grad.addColorStop(0.35, 'rgba(130, 150, 230, 0.35)');
        grad.addColorStop(0.7, 'rgba(60, 70, 160, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        // Spiral arms drawing
        ctx.save();
        ctx.translate(cx, cy);
        for (var arm = 0; arm < 2; arm++) {
            var armOffset = arm * Math.PI;
            for (var i = 0; i < 350; i++) {
                var t = i / 350;
                var r = Math.pow(t, 0.75) * (size * 0.4);
                var a = t * 6.2 + armOffset;
                var scatter = (Math.random() - 0.5) * r * 0.25;
                var px = Math.cos(a) * r + scatter;
                var py = (Math.sin(a) * r + scatter) * 0.55; // Tilted ellipse

                var pGrad = ctx.createRadialGradient(px, py, 0, px, py, 2);
                var alpha = (1 - t * 0.65) * (0.35 + Math.random() * 0.45);
                pGrad.addColorStop(0, 'rgba(255, 235, 190, ' + alpha + ')');
                pGrad.addColorStop(1, 'rgba(100, 140, 240, 0)');
                ctx.fillStyle = pGrad;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        var texture = new THREE.CanvasTexture(canvas);
        var mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.85
        });
        var sprite = new THREE.Sprite(mat);
        sprite.position.set(-28, 17, -70);
        sprite.scale.set(24, 16, 1);
        sprite.material.rotation = -0.45;

        return {
            sprite: sprite,
            update: function (time) {
                sprite.material.rotation = -0.45 + Math.sin(time * 0.05) * 0.02;
            }
        };
    }

    /* ---- Module API ---- */
    return {
        createStarfield: createStarfield,
        createGoldenSpiral: createGoldenSpiral,
        createDust: createDust,
        createPetals: createPetals,
        createNebula: createNebula,
        createMiniGalaxy: createMiniGalaxy,
        createBurstSystem: createBurstSystem,
        createIntroParticles: createIntroParticles
    };

})();
