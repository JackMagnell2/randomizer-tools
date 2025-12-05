window.shufflerHelper = {
    audioShuffle: null,
    audioWin: null,

    // Initialize audio
    init: function () {
        try {
            // Reusing the same generic sounds for consistency
            this.audioShuffle = new Audio('sounds/shuffle-cards.mp3'); 
            this.audioWin = new Audio('sounds/ding.mp3');
        } catch (e) { }
    },

    // Play shuffle start sound
    playShuffle: function () {
        if (this.audioShuffle) {
            this.audioShuffle.currentTime = 0;
            this.audioShuffle.play().catch(() => {});
        }
    },

    // Play result sound
    playWin: function () {
        if (this.audioWin) {
            this.audioWin.currentTime = 0;
            this.audioWin.play().catch(() => {});
        }
    }
};