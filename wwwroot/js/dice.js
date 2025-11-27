window.diceHelper = {
    dotNetRef: null,
    audioShake: null,
    audioLand: null,
    diceContainer: null,

    faceRotations: {
        1: [0, 0],
        2: [-90, 0],
        3: [0, -90],
        4: [0, 90],
        5: [90, 0],
        6: [180, 0]
    },

    // Initializes audio and references
    init: function (dotNetReference) {
        this.dotNetRef = dotNetReference;
        
        try {
            this.audioShake = new Audio('sounds/dice-shake.mp3'); 
            this.audioLand = new Audio('sounds/dice-land.mp3');
        } catch (e) {
            console.error("Audio init failed", e);
        }
    },

    // Animates the dice to the specific result values
    rollDice: function (results) {
        if (!Array.isArray(results)) return;

        if (this.audioShake) {
            this.audioShake.currentTime = 0;
            this.audioShake.play().catch(() => {});
        }

        let completedCount = 0;
        const totalDice = results.length;

        results.forEach((resultValue, index) => {
            const dieCube = document.getElementById(`die-cube-${index}`);
            if (!dieCube) return;

            const targetRotation = this.faceRotations[resultValue];
            
            const xSpins = (Math.floor(Math.random() * 3) + 2) * 360;
            const ySpins = (Math.floor(Math.random() * 3) + 2) * 360;

            const finalX = targetRotation[0] + xSpins;
            const finalY = targetRotation[1] + ySpins;

            dieCube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

            const onTransitionEnd = (e) => {
                if (e.propertyName !== 'transform') return; 
                
                dieCube.removeEventListener('transitionend', onTransitionEnd);
                completedCount++;

                if (completedCount === totalDice) {
                    this.finishRoll();
                }
            };

            dieCube.addEventListener('transitionend', onTransitionEnd);
        });
    },

    // Finalizes the roll event
    finishRoll: function () {
        if (this.audioLand) {
            this.audioLand.currentTime = 0;
            this.audioLand.play().catch(() => {});
        }
        
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }

        if (this.dotNetRef) {
            this.dotNetRef.invokeMethodAsync('OnRollFinished');
        }
    }
};