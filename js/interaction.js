/* =============================================
   ELIZABETH GALAXY — Interaction Manager
   Mouse/touch tracking, custom cursor, parallax.
   ============================================= */

window.EG = window.EG || {};

EG.Interaction = (function () {
    'use strict';

    /* ---- State ---- */
    var mouse = { x: 0, y: 0 };          // Raw normalized (-1 to 1)
    var smoothMouse = { x: 0, y: 0 };    // Smoothly interpolated
    var rawPixel = { x: 0, y: 0 };       // Pixel coords
    var isTouch = false;
    var cursorEl = null;
    var cursorDot = null;
    var cursorRing = null;
    var hoverables = [];
    var enabled = true;

    // Smooth interpolation factor (lower = smoother)
    var LERP_FACTOR = 0.08;

    /* ---- Internal ---- */

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function onMouseMove(e) {
        rawPixel.x = e.clientX;
        rawPixel.y = e.clientY;
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    function onTouchMove(e) {
        if (e.touches.length > 0) {
            rawPixel.x = e.touches[0].clientX;
            rawPixel.y = e.touches[0].clientY;
            mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }

    function onTouchStart(e) {
        if (e.touches.length > 0) {
            rawPixel.x = e.touches[0].clientX;
            rawPixel.y = e.touches[0].clientY;
            mouse.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
    }

    /**
     * Check if cursor is over any hoverable element
     */
    function checkHover() {
        if (isTouch || !cursorEl) return;

        var hovering = false;
        for (var i = 0; i < hoverables.length; i++) {
            var el = hoverables[i];
            if (!el || !el.getBoundingClientRect) continue;
            var rect = el.getBoundingClientRect();
            if (
                rawPixel.x >= rect.left &&
                rawPixel.x <= rect.right &&
                rawPixel.y >= rect.top &&
                rawPixel.y <= rect.bottom
            ) {
                hovering = true;
                break;
            }
        }

        if (hovering) {
            cursorEl.classList.add('hovering');
        } else {
            cursorEl.classList.remove('hovering');
        }
    }

    /* ---- Public API ---- */

    return {
        /**
         * Initialize interaction tracking
         * @param {HTMLElement} rendererDom - The canvas element
         */
        init: function (rendererDom) {
            // Detect touch device
            isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            // Mouse events
            window.addEventListener('mousemove', onMouseMove, { passive: true });

            // Touch events
            if (isTouch) {
                window.addEventListener('touchmove', onTouchMove, { passive: true });
                window.addEventListener('touchstart', onTouchStart, { passive: true });
            }
        },

        /**
         * Initialize custom cursor (desktop only)
         */
        initCursor: function () {
            if (isTouch) {
                // Hide cursor element on touch devices
                var el = document.getElementById('custom-cursor');
                if (el) el.style.display = 'none';
                return;
            }

            cursorEl = document.getElementById('custom-cursor');
            cursorDot = cursorEl ? cursorEl.querySelector('.cursor-dot') : null;
            cursorRing = cursorEl ? cursorEl.querySelector('.cursor-ring') : null;

            // Register hoverable elements
            hoverables = Array.prototype.slice.call(
                document.querySelectorAll('button, .premium-btn, a, [data-hover]')
            );
        },

        /**
         * Update smooth mouse + cursor position (call every frame)
         */
        update: function () {
            if (!enabled) return;

            // Smooth interpolation for parallax
            smoothMouse.x = lerp(smoothMouse.x, mouse.x, LERP_FACTOR);
            smoothMouse.y = lerp(smoothMouse.y, mouse.y, LERP_FACTOR);

            // Update custom cursor position
            if (cursorEl && !isTouch) {
                cursorEl.style.transform =
                    'translate3d(' + rawPixel.x + 'px, ' + rawPixel.y + 'px, 0)';
                checkHover();
            }
        },

        /**
         * Get smoothed mouse position (for parallax)
         * @returns {{ x: number, y: number }} Normalized -1 to 1
         */
        getMouse: function () {
            return { x: smoothMouse.x, y: smoothMouse.y };
        },

        /**
         * Get raw (non-interpolated) mouse position
         * @returns {{ x: number, y: number }} Normalized -1 to 1
         */
        getRawMouse: function () {
            return { x: mouse.x, y: mouse.y };
        },

        /**
         * Get raw pixel coordinates
         * @returns {{ x: number, y: number }}
         */
        getPixel: function () {
            return { x: rawPixel.x, y: rawPixel.y };
        },

        /**
         * Whether the device is a touch device
         */
        isTouchDevice: function () {
            return isTouch;
        },

        /**
         * Re-scan for hoverable elements (call after DOM changes)
         */
        refreshHoverables: function () {
            hoverables = Array.prototype.slice.call(
                document.querySelectorAll('button, .premium-btn, a, [data-hover]')
            );
        },

        /**
         * Enable/disable interaction updates
         */
        setEnabled: function (val) {
            enabled = !!val;
        },

        /**
         * Clean up event listeners
         */
        dispose: function () {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchstart', onTouchStart);
        }
    };

})();
