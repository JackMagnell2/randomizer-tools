window.magic8Helper = {
    ballEl: null,
    audio: null,

    // Initializes helper with element id
    init: function (elementId) {
        this.ballEl = document.getElementById(elementId);
        try {
            this.audio = new Audio('sounds/tick.mp3');
        } catch (e) { }
    },

    // Triggers shake animation and sound
    shake: function (elementId, playSound) {
        if (!this.ballEl || this.ballEl.id !== elementId) {
            this.init(elementId);
        }

        if (playSound && this.audio) {
            this.audio.currentTime = 0;
            this.audio.play().catch(() => { });
        }

        if (this.ballEl) {
            this.ballEl.classList.remove('shake');
            void this.ballEl.offsetWidth;
            this.ballEl.classList.add('shake');
            setTimeout(() => this.ballEl.classList.remove('shake'), 700);
        }
    }
};
