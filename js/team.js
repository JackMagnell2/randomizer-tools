window.teamHelper = {
    audioShuffle: null,
    audioWin: null,

    // Initialize audio resources
    init: function () {
        try {
            this.audioShuffle = new Audio('sounds/shuffle-cards.mp3'); 
            this.audioWin = new Audio('sounds/ding.mp3');
        } catch (e) { }
    },

    // Trigger generation audio
    animateGenerate: function () {
        if (this.audioShuffle) {
            this.audioShuffle.currentTime = 0;
            this.audioShuffle.play().catch(() => {});
        }
        
        setTimeout(() => {
            if (this.audioWin) {
                this.audioWin.currentTime = 0;
                this.audioWin.play().catch(() => {});
            }
        }, 900);
    }
};
