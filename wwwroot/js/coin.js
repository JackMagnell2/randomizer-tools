window.coinHelper = {
    audioFlip: null,
    audioWin: null,
    dotNetRef: null,
    coinElement: null,

    // Initializes audio and element references
    init: function (dotNetReference, elementId) {
        this.dotNetRef = dotNetReference;
        this.coinElement = document.getElementById(elementId);
        
        try {
            this.audioFlip = new Audio('sounds/coin-flip.mp3');
            this.audioWin = new Audio('sounds/coin-drop.mp3');
        } catch (e) {
            console.error("Audio initialization failed", e);
        }
    },

    // Triggers the flip animation and audio
    animateFlip: function (isHeads) {
        if (!this.coinElement) return;

        // Prevent any transform transition from running after the animation (Safari on mobile)
        this.coinElement.style.transition = 'none';
        this.coinElement.classList.remove("flipping", "heads", "tails");
        
        void this.coinElement.offsetWidth;

        if (this.audioFlip) {
            this.audioFlip.currentTime = 0;
            this.audioFlip.play().catch(e => console.log(e));
        }

        this.coinElement.classList.add("flipping");
        this.coinElement.classList.add(isHeads ? "heads" : "tails");

        const onAnimationEnd = () => {
            this.coinElement.removeEventListener('animationend', onAnimationEnd);
            this.finishFlip(isHeads);
        };

        this.coinElement.addEventListener('animationend', onAnimationEnd);
    },

    // Finalizes the flip and notifies Blazor
    finishFlip: function (isHeads) {
        if (!this.coinElement) return;

        this.coinElement.classList.remove("flipping");
        this.coinElement.style.transition = 'none';
        this.coinElement.classList.remove("heads", "tails");
        this.coinElement.classList.add(isHeads ? "heads" : "tails");
        
        if (this.audioWin) {
            this.audioWin.currentTime = 0;
            this.audioWin.play().catch(e => console.log(e));
        }

        if (navigator.vibrate) {
            navigator.vibrate(15);
        }

        if (this.dotNetRef) {
            this.dotNetRef.invokeMethodAsync('OnFlipFinished');
        }
    }
};
