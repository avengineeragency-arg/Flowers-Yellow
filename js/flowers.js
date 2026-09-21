/* =============================================
   ELIZABETH GALAXY — Flower System v2
   Canvas-rendered flower textures used as sprites,
   distributed in a spiral galaxy formation.
   ============================================= */

window.EG = window.EG || {};

EG.Flowers = (function () {
    'use strict';

    var GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

    /* ===========================================
       CANVAS FLOWER TEXTURE DRAWING
       Draws a realistic-looking 5/6-petal yellow
       flower on a canvas with glow, gradients,
       center detail, and petal veins.
       =========================================== */

    /**
     * Draw a soft radial glow behind the flower
     */
    function drawGlow(ctx, cx, cy, radius) {
        var grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.1);
        grad.addColorStop(0, 'rgba(255, 210, 0, 0.35)');
        grad.addColorStop(0.35, 'rgba(255, 190, 0, 0.15)');
        grad.addColorStop(0.65, 'rgba(255, 170, 0, 0.05)');
        grad.addColorStop(1, 'rgba(255, 150, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw realistic stem with subtle curvature, shading, sepals, and leaves
     */
    function drawStem(ctx, startX, startY, endX, endY, curveOffset, hasLeaves) {
        ctx.save();

        var cpX = (startX + endX) / 2 + curveOffset;
        var cpY = (startY + endY) / 2;

        // Stem shadow / thickness
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.strokeStyle = 'rgba(18, 38, 10, 0.85)';
        ctx.lineWidth = 6.0;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Main green stem
        var stemGrad = ctx.createLinearGradient(startX, startY, endX, endY);
        stemGrad.addColorStop(0, '#558F35');
        stemGrad.addColorStop(0.3, '#437628');
        stemGrad.addColorStop(0.7, '#2F561C');
        stemGrad.addColorStop(1, '#1A330E');
        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 4.2;
        ctx.stroke();

        // Stem highlight line (subtle light reflection)
        ctx.beginPath();
        ctx.moveTo(startX + 0.8, startY);
        ctx.quadraticCurveTo(cpX + 0.8, cpY, endX + 0.8, endY);
        ctx.strokeStyle = 'rgba(190, 240, 140, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Receptacle / Calyx (sépalos) under the flower
        ctx.fillStyle = '#3E7024';
        for (var s = -3; s <= 3; s++) {
            var sx = startX + s * 6;
            var sy = startY + Math.abs(s) * 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(sx + s * 4, sy + 18, sx, sy + 25);
            ctx.quadraticCurveTo(startX, sy + 12, startX, startY);
            ctx.fill();
        }

        // Delicate leaves branching from stem
        if (hasLeaves) {
            var l1X = startX * 0.65 + endX * 0.35 + curveOffset * 0.4;
            var l1Y = startY * 0.65 + endY * 0.35;
            drawLeaf(ctx, l1X, l1Y, -0.65, 52, 14);

            var l2X = startX * 0.35 + endX * 0.65 + curveOffset * 0.4;
            var l2Y = startY * 0.35 + endY * 0.65;
            drawLeaf(ctx, l2X, l2Y, 0.72, 44, 11);
        }

        ctx.restore();
    }

    /**
     * Draw a slender, realistic leaf
     */
    function drawLeaf(ctx, x, y, angle, length, width) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-width * 0.6, length * 0.3, -width * 0.8, length * 0.7, 0, length);
        ctx.bezierCurveTo(width * 0.8, length * 0.7, width * 0.6, length * 0.3, 0, 0);
        ctx.closePath();

        var lGrad = ctx.createLinearGradient(0, 0, 0, length);
        lGrad.addColorStop(0, '#558F35');
        lGrad.addColorStop(0.5, '#3F7024');
        lGrad.addColorStop(1, '#234412');
        ctx.fillStyle = lGrad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(25, 50, 15, 0.5)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Main leaf vein
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, length * 0.85);
        ctx.strokeStyle = 'rgba(190, 240, 130, 0.45)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Draw a single petal using bezier curves
     */
    function drawPetal(ctx, cx, cy, angle, petalLength, petalWidth, colorVariant) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // Ambient occlusion shadow under each petal so overlaps are clearly distinct
        ctx.save();
        ctx.shadowColor = 'rgba(40, 15, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 3;

        // Petal shape — rounded cosmos/buttercup style with gentle tip curve
        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Left curve
        ctx.bezierCurveTo(
            -petalWidth * 1.05, -petalLength * 0.25,
            -petalWidth * 0.98, -petalLength * 0.82,
            -petalWidth * 0.25, -petalLength * 0.98
        );
        // Tip curve
        ctx.bezierCurveTo(
            -petalWidth * 0.1, -petalLength * 1.02,
            petalWidth * 0.1,  -petalLength * 1.02,
            petalWidth * 0.25, -petalLength * 0.98
        );
        // Right curve
        ctx.bezierCurveTo(
            petalWidth * 0.98, -petalLength * 0.82,
            petalWidth * 1.05, -petalLength * 0.25,
            0, 0
        );
        ctx.closePath();

        // Petal gradient: deep amber base -> rich golden body -> soft warm tip
        var grad = ctx.createLinearGradient(0, 0, 0, -petalLength);
        if (colorVariant === 1) {
            grad.addColorStop(0, '#B35E00');
            grad.addColorStop(0.12, '#D97706');
            grad.addColorStop(0.35, '#F59E0B');
            grad.addColorStop(0.7, '#FBBF24');
            grad.addColorStop(0.95, '#FDE68A');
            grad.addColorStop(1, '#FEF3C7');
        } else if (colorVariant === 2) {
            grad.addColorStop(0, '#9A3412');
            grad.addColorStop(0.12, '#C2410C');
            grad.addColorStop(0.35, '#EA580C');
            grad.addColorStop(0.7, '#F59E0B');
            grad.addColorStop(0.95, '#FCD34D');
            grad.addColorStop(1, '#FFFBEB');
        } else {
            grad.addColorStop(0, '#A16207');
            grad.addColorStop(0.12, '#CA8A04');
            grad.addColorStop(0.35, '#EAB308');
            grad.addColorStop(0.7, '#FACC15');
            grad.addColorStop(0.95, '#FEF08A');
            grad.addColorStop(1, '#FEF9C3');
        }

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore(); // Remove shadow

        // Crisp petal outline for distinct definition
        ctx.strokeStyle = 'rgba(140, 75, 0, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Delicate petal vein lines
        ctx.strokeStyle = 'rgba(160, 85, 0, 0.22)';
        ctx.lineWidth = 0.9;

        // Center vein
        ctx.beginPath();
        ctx.moveTo(0, -petalLength * 0.08);
        ctx.bezierCurveTo(0, -petalLength * 0.4, 0, -petalLength * 0.7, 0, -petalLength * 0.92);
        ctx.stroke();

        // Left vein
        ctx.beginPath();
        ctx.moveTo(-petalWidth * 0.1, -petalLength * 0.12);
        ctx.bezierCurveTo(-petalWidth * 0.35, -petalLength * 0.4, -petalWidth * 0.5, -petalLength * 0.7, -petalWidth * 0.3, -petalLength * 0.88);
        ctx.stroke();

        // Right vein
        ctx.beginPath();
        ctx.moveTo(petalWidth * 0.1, -petalLength * 0.12);
        ctx.bezierCurveTo(petalWidth * 0.35, -petalLength * 0.4, petalWidth * 0.5, -petalLength * 0.7, petalWidth * 0.3, -petalLength * 0.88);
        ctx.stroke();

        // Subtle warm highlight on the petal body
        var hlGrad = ctx.createLinearGradient(0, -petalLength * 0.3, 0, -petalLength * 0.85);
        hlGrad.addColorStop(0, 'rgba(255, 255, 230, 0)');
        hlGrad.addColorStop(0.5, 'rgba(255, 255, 220, 0.15)');
        hlGrad.addColorStop(1, 'rgba(255, 255, 230, 0)');
        ctx.fillStyle = hlGrad;
        ctx.fill();

        ctx.restore();
    }

    /**
     * Draw the flower center (stamen / disc floret)
     */
    function drawCenter(ctx, cx, cy, radius) {
        // Outer dark amber/brown ring
        var ringGrad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
        ringGrad.addColorStop(0, '#78350F');
        ringGrad.addColorStop(0.4, '#92400E');
        ringGrad.addColorStop(0.75, '#B45309');
        ringGrad.addColorStop(1, '#D97706');
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = ringGrad;
        ctx.fill();

        // Center outline
        ctx.strokeStyle = 'rgba(60, 25, 5, 0.6)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Inner warm amber center
        var innerGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius * 0.6);
        innerGrad.addColorStop(0, '#FEF08A');
        innerGrad.addColorStop(0.5, '#F59E0B');
        innerGrad.addColorStop(1, '#92400E');
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = innerGrad;
        ctx.fill();

        // Stamen pollen dots (golden beads around center)
        for (var j = 0; j < 16; j++) {
            var da = (j / 16) * Math.PI * 2 + (j % 2) * 0.1;
            var dr = radius * (0.45 + (j % 3) * 0.18);
            var px = cx + Math.cos(da) * dr;
            var py = cy + Math.sin(da) * dr;

            ctx.beginPath();
            ctx.arc(px, py, 1.4, 0, Math.PI * 2);
            ctx.fillStyle = (j % 2 === 0) ? '#FEF08A' : '#F59E0B';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(px, py, 0.7, 0, Math.PI * 2);
            ctx.fillStyle = '#78350F';
            ctx.fill();
        }
    }

    /* ===========================================
       CREATE FLOWER TEXTURE WITH STEM & LEAVES
       Full flower with slender stem on 512x768 canvas.
       =========================================== */
    function createFlowerTexture(config) {
        config = config || {};
        var width = config.width || 512;
        var height = config.height || 768;
        var petalCount = config.petals || 8;
        var colorVariant = config.colorVariant || 0;
        var rotation = config.rotation || 0;
        var stemCurve = config.stemCurve !== undefined ? config.stemCurve : 18;
        var hasLeaves = config.hasLeaves !== false;

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');

        var cx = width / 2;
        var cy = 230; // Flower head in the upper portion
        var flowerRadius = width * 0.36;

        // 1. Draw stem first (behind petals)
        var stemEndX = cx + stemCurve;
        var stemEndY = height - 10;
        drawStem(ctx, cx, cy + 8, stemEndX, stemEndY, stemCurve * 0.5, hasLeaves);

        // 2. Draw petals on top of stem
        var petalLength = flowerRadius * 0.92;
        var petalWidth = flowerRadius * 0.34;

        // Layer 1: Back petals (offset in angle)
        for (var k = 0; k < petalCount; k++) {
            var backAngle = (k / petalCount) * Math.PI * 2 + rotation + Math.PI / petalCount;
            drawPetal(ctx, cx, cy, backAngle, petalLength * 0.85, petalWidth * 0.8, (colorVariant + 1) % 3);
        }

        // Layer 2: Main foreground petals
        for (var i = 0; i < petalCount; i++) {
            var angle = (i / petalCount) * Math.PI * 2 + rotation;
            drawPetal(ctx, cx, cy, angle, petalLength, petalWidth, colorVariant);
        }

        // 3. Center stamen
        drawCenter(ctx, cx, cy, flowerRadius * 0.18);

        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return { texture: texture, canvas: canvas };
    }

    /* ===========================================
       CREATE PETAL TEXTURE
       Single petal for floating petal particles
       =========================================== */
    function createPetalTexture(size) {
        size = size || 64;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');

        var cx = size / 2;
        var cy = size / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy + size * 0.4);
        ctx.bezierCurveTo(
            cx - size * 0.3, cy,
            cx - size * 0.2, cy - size * 0.35,
            cx, cy - size * 0.4
        );
        ctx.bezierCurveTo(
            cx + size * 0.2, cy - size * 0.35,
            cx + size * 0.3, cy,
            cx, cy + size * 0.4
        );

        var grad = ctx.createLinearGradient(cx, cy + size * 0.4, cx, cy - size * 0.4);
        grad.addColorStop(0, '#E8A800');
        grad.addColorStop(0.4, '#FFD54F');
        grad.addColorStop(1, '#FFF8E1');
        ctx.fillStyle = grad;
        ctx.fill();

        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    /* ===========================================
       GALAXY CENTER GLOW TEXTURE
       Large radial glow for the spiral center
       =========================================== */
    function createGalaxyCenterTexture(size) {
        size = size || 512;
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');

        var cx = size / 2;
        var cy = size / 2;

        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.5);
        grad.addColorStop(0, 'rgba(255, 220, 80, 0.6)');
        grad.addColorStop(0.15, 'rgba(255, 200, 40, 0.35)');
        grad.addColorStop(0.35, 'rgba(255, 180, 0, 0.15)');
        grad.addColorStop(0.6, 'rgba(255, 150, 0, 0.05)');
        grad.addColorStop(1, 'rgba(255, 130, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);

        var texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    /* ===========================================
       FLOWER GALAXY — Sprite-based
       Creates the main spiral galaxy of flowers
       using THREE.Sprite for each flower.
       =========================================== */
    function createGalaxy(config) {
        config = config || {};
        var count = config.count || 300;
        var maxRadius = config.maxRadius || 18;
        var spiralTightness = config.tightness || 0.55;
        var armCount = config.arms || 2;
        var armScatter = config.scatter || 0.35;
        var ySpread = config.ySpread || 0.6;

        var group = new THREE.Group();

        // --- Generate flower textures (512x768 with stem and leaves) ---
        var textures = [
            createFlowerTexture({ petals: 8, colorVariant: 0, rotation: 0,    stemCurve: 18,  hasLeaves: true }),
            createFlowerTexture({ petals: 8, colorVariant: 1, rotation: 0.25, stemCurve: -22, hasLeaves: true }),
            createFlowerTexture({ petals: 8, colorVariant: 2, rotation: 0.15, stemCurve: 28,  hasLeaves: true }),
            createFlowerTexture({ petals: 7, colorVariant: 0, rotation: 0.45, stemCurve: -12, hasLeaves: true }),
        ];

        // Create sprite materials (NORMAL BLENDING: crisp, defined, opaque flowers!)
        var materials = textures.map(function (t) {
            return new THREE.SpriteMaterial({
                map: t.texture,
                transparent: true,
                blending: THREE.NormalBlending,
                depthWrite: true,
                depthTest: true,
                alphaTest: 0.12,
                opacity: 1.0
            });
        });

        // --- Galaxy center glow ---
        var centerGlowTex = createGalaxyCenterTexture(512);
        var centerGlowMat = new THREE.SpriteMaterial({
            map: centerGlowTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.45
        });
        var centerGlow = new THREE.Sprite(centerGlowMat);
        centerGlow.scale.set(14, 14, 1);
        centerGlow.position.set(0, 0.2, 0);
        group.add(centerGlow);

        // Second, larger, dimmer glow
        var outerGlow = new THREE.Sprite(centerGlowMat.clone());
        outerGlow.material.opacity = 0.2;
        outerGlow.scale.set(28, 28, 1);
        outerGlow.position.set(0, 0.1, 0);
        group.add(outerGlow);

        // --- Distribute flowers in spiral ---
        var sprites = [];
        var flowerData = [];

        function gaussRandom() {
            // Box-Muller transform for gaussian distribution
            var u1 = Math.random();
            var u2 = Math.random();
            return Math.sqrt(-2 * Math.log(Math.max(u1, 0.0001))) * Math.cos(2 * Math.PI * u2);
        }

        for (var i = 0; i < count; i++) {
            // Spiral arm assignment
            var arm = i % armCount;
            var armOffset = (arm / armCount) * Math.PI * 2;

            // Radial position (biased toward center)
            var t = Math.pow(Math.random(), 0.6);
            var radius = t * maxRadius;

            // Spiral angle
            var spiralAngle = radius * spiralTightness + armOffset;

            // Scatter perpendicular to arm
            var scatter = armScatter * radius * 0.6;
            var sx = gaussRandom() * scatter;
            var sz = gaussRandom() * scatter;

            var x = Math.cos(spiralAngle) * radius + sx;
            var z = Math.sin(spiralAngle) * radius + sz;
            var y = gaussRandom() * ySpread * Math.max(0.15, 1 - t * 0.7);

            // Flower size: bigger near center, smaller at edges
            var sizeBase = 0.5 + Math.random() * 0.6;
            var sizeFactor = 1.2 - t * 0.5;
            var flowerSize = sizeBase * sizeFactor;

            // Random texture variant
            var matIndex = Math.floor(Math.random() * materials.length);
            var sprite = new THREE.Sprite(materials[matIndex]);
            sprite.position.set(x, y, z);
            sprite.scale.set(flowerSize, flowerSize * 1.5, 1);

            group.add(sprite);
            sprites.push(sprite);

            flowerData.push({
                basePos: new THREE.Vector3(x, y, z),
                baseScale: flowerSize,
                phase: Math.random() * Math.PI * 2,
                speed: 0.2 + Math.random() * 0.3,
                radius: radius
            });
        }

        // --- Foreground flowers (framing camera in world space, stems planted down) ---
        var foregroundGroup = new THREE.Group();
        var foregroundFlowers = [];
        var fgPositions = [
            // Bottom-left corner (large, close, stems planted downward)
            { x: -5.4, y: -1.4, z: 10.2, s: 3.8 },
            { x: -4.2, y: -0.9, z: 9.6,  s: 3.2 },
            { x: -3.2, y: -1.6, z: 9.8,  s: 2.8 },
            { x: -2.1, y: -2.0, z: 9.2,  s: 2.4 },
            { x: -1.1, y: -2.6, z: 8.8,  s: 2.1 },

            // Bottom-center
            { x: 0.2,  y: -2.8, z: 8.6,  s: 1.9 },
            { x: 1.4,  y: -2.5, z: 8.9,  s: 2.2 },

            // Bottom-right corner (large, close, stems planted downward)
            { x: 2.8,  y: -1.9, z: 9.4,  s: 2.6 },
            { x: 4.3,  y: -1.2, z: 9.8,  s: 3.4 },
            { x: 5.5,  y: -1.7, z: 10.2, s: 3.6 },

            // Mid-ground framing depth
            { x: -4.5, y: 0.3,  z: 7.2,  s: 2.3 },
            { x: -3.2, y: 0.0,  z: 6.8,  s: 1.9 },
            { x: 3.6,  y: -0.3, z: 6.5,  s: 2.0 },
            { x: 4.8,  y: 0.2,  z: 7.0,  s: 2.4 },
        ];

        fgPositions.forEach(function (fp, idx) {
            var matIndex = idx % materials.length;
            var sprite = new THREE.Sprite(materials[matIndex]);
            sprite.position.set(fp.x, fp.y, fp.z);
            sprite.scale.set(fp.s, fp.s * 1.5, 1);
            foregroundGroup.add(sprite);
            foregroundFlowers.push(sprite);

            flowerData.push({
                basePos: new THREE.Vector3(fp.x, fp.y, fp.z),
                baseScale: fp.s,
                phase: Math.random() * Math.PI * 2,
                speed: 0.15 + Math.random() * 0.2,
                radius: 0,
                isForeground: true
            });
        });

        // --- Animation State ---
        var elevation = { value: 0 };
        var spiralProgress = { value: 0 };
        var breatheIntensity = { value: 1.0 };

        /**
         * Per-frame update
         */
        function update(time) {
            var allSprites = sprites.concat(foregroundFlowers);
            for (var i = 0; i < allSprites.length; i++) {
                var sp = allSprites[i];
                var fd = flowerData[i];
                if (!fd) continue;

                var t2 = time * fd.speed;
                var p = fd.phase;

                // Gentle sway
                var swayX = Math.sin(t2 + p) * 0.05 * breatheIntensity.value;
                var swayY = Math.cos(t2 * 0.7 + p) * 0.03 * breatheIntensity.value;
                var swayZ = Math.sin(t2 * 0.5 + p + 1.3) * 0.05 * breatheIntensity.value;

                sp.position.x = fd.basePos.x + swayX;
                sp.position.y = fd.basePos.y + swayY + elevation.value;
                sp.position.z = fd.basePos.z + swayZ;

                // Spiral animation (final scene)
                if (spiralProgress.value > 0 && !fd.isForeground) {
                    var sp2 = spiralProgress.value;
                    var spiralAngle2 = fd.phase + time * 0.3 * sp2;
                    var spiralRadius = fd.radius * (1 - sp2 * 0.6);
                    var spiralY = sp.position.y + sp2 * fd.radius * 0.4;

                    sp.position.x += (Math.cos(spiralAngle2) * spiralRadius - sp.position.x) * sp2 * 0.3;
                    sp.position.z += (Math.sin(spiralAngle2) * spiralRadius - sp.position.z) * sp2 * 0.3;
                    sp.position.y += (spiralY - sp.position.y) * sp2 * 0.3;
                }

                // Gentle scale pulse
                var pulse = fd.baseScale + Math.sin(t2 * 0.4 + p) * 0.03;
                sp.scale.set(pulse, pulse * 1.5, 1);
            }

            // Center glow pulse
            var glowPulse = 0.45 + Math.sin(time * 0.3) * 0.08;
            centerGlow.material.opacity = glowPulse;
            centerGlow.material.rotation = time * 0.02;
            outerGlow.material.rotation = -time * 0.01;
        }

        return {
            group: group,
            foregroundGroup: foregroundGroup,
            sprites: sprites,
            foregroundFlowers: foregroundFlowers,
            flowerData: flowerData,
            materials: materials,
            update: update,
            elevation: elevation,
            spiralProgress: spiralProgress,
            breatheIntensity: breatheIntensity,
            getCenterPosition: function () { return new THREE.Vector3(0, 0, 0); },
            setOpacity: function (val) {
                materials.forEach(function (m) { m.opacity = val; });
            }
        };
    }

    // --- Module API ---
    return {
        createGalaxy: createGalaxy,
        createFlowerTexture: createFlowerTexture,
        createPetalTexture: createPetalTexture
    };

})();
