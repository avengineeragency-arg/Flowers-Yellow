/* =============================================
   ELIZABETH GALAXY — Audio Manager
   Procedural ambient audio via Web Audio API.
   No external audio files required.
   ============================================= */

window.EG = window.EG || {};

EG.Audio = (function () {
    'use strict';

    var ctx = null;        // AudioContext
    var masterGain = null; // Master volume node
    var isPlaying = false;
    var isInitialized = false;
    var nodes = [];        // Track active nodes for cleanup
    var ambientInterval = null;

    /* ---- Helpers ---- */

    /** Create a gain node with initial value */
    function createGain(value) {
        var g = ctx.createGain();
        g.gain.value = value;
        return g;
    }

    /** Generate white noise buffer */
    function createNoiseBuffer(duration) {
        var sampleRate = ctx.sampleRate;
        var length = sampleRate * duration;
        var buffer = ctx.createBuffer(1, length, sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    /* ---- Sound Generators ---- */

    /**
     * Gentle wind — filtered noise that evolves slowly
     */
    function startWind() {
        var noise = ctx.createBufferSource();
        noise.buffer = createNoiseBuffer(4);
        noise.loop = true;

        // Low-pass filter for soft wind character
        var lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 400;
        lpf.Q.value = 1.0;

        // Slow modulation of the filter frequency
        var lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08; // Very slow
        var lfoGain = createGain(150);
        lfo.connect(lfoGain);
        lfoGain.connect(lpf.frequency);
        lfo.start();

        var gain = createGain(0.04); // Very quiet

        noise.connect(lpf);
        lpf.connect(gain);
        gain.connect(masterGain);

        noise.start();

        nodes.push(noise, lfo, lpf, gain, lfoGain);
    }

    /**
     * Deep ambient pad — stacked sine oscillators
     * Creates a warm, evolving harmonic bed
     */
    function startAmbientPad() {
        var fundamentals = [55, 82.5, 110]; // A1, E2, A2 — perfect fifth harmony
        var gains = [0.025, 0.018, 0.012];

        fundamentals.forEach(function (freq, idx) {
            var osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            // Gentle detuning for richness
            var detuneLfo = ctx.createOscillator();
            detuneLfo.type = 'sine';
            detuneLfo.frequency.value = 0.05 + idx * 0.02;
            var detuneGain = createGain(3);
            detuneLfo.connect(detuneGain);
            detuneGain.connect(osc.detune);
            detuneLfo.start();

            var gain = createGain(gains[idx]);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start();

            nodes.push(osc, detuneLfo, gain, detuneGain);
        });
    }

    /**
     * Occasional chime — bell-like tone triggered periodically
     */
    function playChime() {
        if (!ctx || !isPlaying) return;

        // Random pentatonic note
        var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
        var freq = notes[Math.floor(Math.random() * notes.length)];

        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        // Second harmonic for bell character
        var osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2.756; // Slightly inharmonic for bell quality

        var gain = createGain(0);
        var gain2 = createGain(0);

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(masterGain);
        gain2.connect(masterGain);

        var now = ctx.currentTime;
        var attackTime = 0.01;
        var decayTime = 2.5 + Math.random() * 1.5;

        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.025, now + attackTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.008, now + attackTime);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + decayTime * 0.7);

        osc.start(now);
        osc.stop(now + decayTime + 0.1);
        osc2.start(now);
        osc2.stop(now + decayTime * 0.7 + 0.1);
    }

    /**
     * Schedule random chimes at intervals
     */
    function startChimeLoop() {
        function scheduleNext() {
            if (!isPlaying) return;
            var delay = 3000 + Math.random() * 6000; // 3-9 seconds
            ambientInterval = setTimeout(function () {
                playChime();
                scheduleNext();
            }, delay);
        }
        scheduleNext();
    }

    /**
     * Sparkle sound — brief high shimmer for interactions
     */
    function playSparkle() {
        if (!ctx || !isPlaying) return;

        var freq = 1800 + Math.random() * 1200;
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        var gain = createGain(0);
        osc.connect(gain);
        gain.connect(masterGain);

        var now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.015, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    /* ---- Public API ---- */

    return {
        /**
         * Initialize the audio context (must be called from user gesture)
         */
        init: function () {
            if (isInitialized) return;

            try {
                var AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    ctx = new AudioCtx();
                    masterGain = createGain(0.7);
                    masterGain.connect(ctx.destination);
                }
                isInitialized = true;
            } catch (e) {
                console.warn('Audio: Could not initialize AudioContext', e);
            }
        },

        /**
         * Play the background instrumental song (Flores Amarillas)
         */
        playMusic: function () {
            this.init();
            if (ctx && ctx.state === 'suspended') {
                ctx.resume();
            }
            var music = document.getElementById('bg-music');
            if (!music) {
                music = new Audio('media/flores-amarillas.mp3');
                music.loop = true;
            }

            music.volume = 0;
            var playPromise = music.play();
            if (playPromise !== undefined) {
                playPromise.then(function () {
                    isPlaying = true;
                    // Smoothly fade in volume to 0.85
                    var targetVol = 0.85;
                    var cur = 0;
                    var fade = setInterval(function () {
                        cur += 0.05;
                        if (cur >= targetVol) {
                            cur = targetVol;
                            clearInterval(fade);
                        }
                        music.volume = cur;
                    }, 120);
                }).catch(function (err) {
                    console.warn('Music play error:', err);
                });
            }
        },

        /**
         * Toggle background music on/off
         * @returns {boolean} New playing state
         */
        toggle: function () {
            var music = document.getElementById('bg-music');
            if (!music) return false;

            if (music.paused) {
                music.play();
                isPlaying = true;
                return true;
            } else {
                music.pause();
                isPlaying = false;
                return false;
            }
        },

        /**
         * Whether audio is currently playing
         */
        getIsPlaying: function () {
            return isPlaying;
        },

        /**
         * Play a sparkle sound (for interactions)
         */
        playSparkle: playSparkle,

        /**
         * Play a single chime
         */
        playChime: playChime,

        /**
         * Set master volume (0-1)
         */
        setVolume: function (v) {
            if (masterGain) {
                masterGain.gain.linearRampToValueAtTime(
                    Math.max(0, Math.min(1, v)),
                    ctx.currentTime + 0.1
                );
            }
        },

        /**
         * Clean up all audio resources
         */
        dispose: function () {
            isPlaying = false;
            if (ambientInterval) clearTimeout(ambientInterval);
            nodes.forEach(function (n) {
                try { n.disconnect(); } catch (e) { /* ignore */ }
                try { if (n.stop) n.stop(); } catch (e) { /* ignore */ }
            });
            nodes = [];
            if (ctx) {
                try { ctx.close(); } catch (e) { /* ignore */ }
            }
        }
    };

})();
