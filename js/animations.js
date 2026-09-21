/* =============================================
   ELIZABETH GALAXY — Animation Timelines
   GSAP-driven cinematic sequences for each phase.
   ============================================= */

window.EG = window.EG || {};

EG.Animations = (function () {
    'use strict';

    /* ---- Utility: reveal text lines one by one ---- */
    function revealTextLines(container, opts) {
        opts = opts || {};
        var duration = opts.duration || 1.0;
        var stagger = opts.stagger || 0.45;
        var delay = opts.delay || 0;
        var ease = opts.ease || 'power3.out';

        var lines = container.querySelectorAll('.msg-title, .msg-title-sm, .msg-line, .msg-closing, .msg-signature');

        var tl = gsap.timeline({ delay: delay });

        tl.set(container, {
            display: 'flex',
            opacity: 1,
            onStart: function () {
                container.classList.remove('hidden');
            }
        });

        tl.fromTo(lines, {
            opacity: 0,
            y: 20
        }, {
            opacity: 1,
            y: 0,
            duration: duration,
            stagger: stagger,
            ease: ease
        }, '+=0.1');

        return tl;
    }

    /* ---- Utility: fade out a container ---- */
    function fadeOutContainer(container, duration) {
        duration = duration || 1.0;
        return gsap.to(container, {
            opacity: 0,
            duration: duration,
            ease: 'power2.inOut',
            onComplete: function () {
                container.style.display = 'none';
                container.classList.add('hidden');
            }
        });
    }

    /* ===========================================
       PRELOADER → LANDING REVEAL
       1. Preloader fades out
       2. 3D Scene is visible
       3. Landing text + Discover button animate in
       =========================================== */
    function createPreloaderTimeline(elements, onComplete) {
        var tl = gsap.timeline({
            onComplete: onComplete || function () {}
        });

        // Fade out preloader
        tl.to(elements.preloader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: function () {
                elements.preloader.style.display = 'none';
            }
        });

        // Show discover / landing section
        tl.set(elements.discoverSection, {
            display: 'flex',
            opacity: 1,
            onComplete: function () {
                elements.discoverSection.classList.remove('hidden');
            }
        });

        // Animate subtitle
        var sub = elements.discoverSection.querySelector('.discover-subtitle');
        var title = elements.discoverSection.querySelector('.discover-title');
        var btn = elements.discoverSection.querySelector('.premium-btn');

        if (sub) {
            tl.to(sub, {
                opacity: 1,
                y: 0,
                duration: 1.0,
                ease: 'power3.out'
            }, '+=0.2');
        }

        if (title) {
            tl.to(title, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: 'power3.out'
            }, '-=0.6');
        }

        if (btn) {
            tl.to(btn, {
                opacity: 1,
                y: 0,
                duration: 1.0,
                ease: 'power3.out'
            }, '-=0.6');
        }

        return tl;
    }

    /* ===========================================
       DISCOVER CLICK → REVEAL GALAXY & STORY
       1. Landing text & button fade out immediately
       2. Camera glides gracefully forward
       3. First message appears promptly at 0.8s
       =========================================== */
    function createDiscoverTimeline(elements, camera, bloomPass, galaxy, onComplete) {
        var tl = gsap.timeline({
            onComplete: onComplete || function () {}
        });

        // 1. Fade out discover section promptly (0.5s)
        tl.to(elements.discoverSection, {
            opacity: 0,
            y: -15,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: function () {
                elements.discoverSection.style.display = 'none';
            }
        });

        // 2. Camera glides gracefully forward into the galaxy
        tl.to(camera.position, {
            x: 0.3,
            y: 3.5,
            z: 11.2,
            duration: 3.0,
            ease: 'power2.out'
        }, 0.2);

        // 3. Bloom pulse
        if (bloomPass) {
            tl.to(bloomPass, {
                strength: 0.85,
                duration: 1.2,
                ease: 'power2.in'
            }, 0.3);
            tl.to(bloomPass, {
                strength: 0.55,
                duration: 1.8,
                ease: 'power2.out'
            }, 1.5);
        }

        // 4. Reveal Message 1 PROMPTLY at 0.8s during the glide!
        var msg1Tl = revealTextLines(elements.message1, {
            duration: 1.0,
            stagger: 0.5,
            delay: 0
        });
        tl.add(msg1Tl, 0.8);

        return tl;
    }

    /* ===========================================
       FINAL MOMENT & GRAND GALAXY ZOOM-OUT
       1. Message 1 fades out
       2. Final Message: "Este pequeño universo es para ti."
       3. Final Message fades out
       4. Camera pulls back to reveal the ENTIRE flower galaxy
       =========================================== */
    function createFinalMomentTimeline(elements, camera, galaxy, bloomPass, onComplete) {
        var tl = gsap.timeline({
            delay: 7.5,  // Give user 7.5s to comfortably read message 1
            onComplete: onComplete || function () {}
        });

        // 1. Fade out message 1
        tl.add(function () {
            fadeOutContainer(elements.message1, 1.2);
        });

        tl.to({}, { duration: 1.2 });

        // 2. Show final message: "Este pequeño universo es para ti."
        var finalTl = revealTextLines(elements.messageFinal, {
            duration: 1.2,
            stagger: 0.5,
            delay: 0
        });
        tl.add(finalTl);

        // 3. Hold final message for 6 seconds
        tl.to({}, { duration: 6.0 });

        // 4. Fade out final message
        tl.add(function () {
            fadeOutContainer(elements.messageFinal, 1.5);
        });

        tl.to({}, { duration: 1.5 });

        // 5. GRAND FINAL TRANSITION: Camera pulls way back to reveal the full galaxy!
        var isPortrait = camera.aspect < 1.0;
        tl.to(camera.position, {
            x: 0,
            y: isPortrait ? 16 : 14,
            z: isPortrait ? 36 : 32,
            duration: 7.0,
            ease: 'power2.inOut'
        });

        // Flowers elevate and form ethereal spiral
        tl.to(galaxy.elevation, {
            value: 4.0,
            duration: 6.5,
            ease: 'power2.inOut'
        }, '-=6.5');

        tl.to(galaxy.spiralProgress, {
            value: 0.8,
            duration: 6.5,
            ease: 'power2.inOut'
        }, '-=6.5');

        // Celestial bloom flare during galaxy reveal
        if (bloomPass) {
            tl.to(bloomPass, {
                strength: 1.0,
                duration: 2.5,
                ease: 'power2.in'
            }, '-=5.0');

            tl.to(bloomPass, {
                strength: 0.6,
                duration: 3.5,
                ease: 'power2.out'
            }, '-=2.5');
        }

        return tl;
    }

    /* ---- Module Public API ---- */
    return {
        createPreloaderTimeline: createPreloaderTimeline,
        createDiscoverTimeline: createDiscoverTimeline,
        createFinalMomentTimeline: createFinalMomentTimeline,
        revealTextLines: revealTextLines,
        fadeOutContainer: fadeOutContainer
    };

})();
