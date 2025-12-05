window.diceHelper = {
    dotNetRef: null,
    audioShake: null,
    audioLand: null,
    dieStates: [],

    faceRotations: {
        1: [0, 0],
        2: [-90, 0],
        3: [0, 90],  
        4: [0, -90], 
        5: [90, 0],
        6: [180, 0]
    },

    // Initializes audio and references
    init: function (dotNetReference) {
        this.dotNetRef = dotNetReference;
        this.dieStates = []; 
        
        try {
            this.audioShake = new Audio('sounds/dice-shake.mp3'); 
            this.audioLand = new Audio('sounds/dice-land.mp3');
        } catch (e) {
            console.error("Audio init failed", e);
        }
    },

    // Instantly sets dice rotation without animation
    resetDice: function (results) {
        if (!Array.isArray(results)) return;

        this.dieStates = []; 

        results.forEach((resultValue, index) => {
            const dieCube = document.getElementById(`die-cube-${index}`);
            if (!dieCube) return;

            const target = this.faceRotations[resultValue];
            
            this.dieStates.push({ x: target[0], y: target[1] });

            dieCube.style.transition = 'none';
            dieCube.style.transform = `rotateX(${target[0]}deg) rotateY(${target[1]}deg)`;

            void dieCube.offsetWidth;
            dieCube.style.transition = '';
        });
    },

    // Animates the dice using cumulative rotation
    rollDice: function (results, heldStates) {
        if (!Array.isArray(results)) return;

        if (this.audioShake) {
            this.audioShake.currentTime = 0;
            this.audioShake.play().catch(() => {});
        }

        let completedCount = 0;
        
        const activeDiceCount = results.filter((_, i) => !heldStates || !heldStates[i]).length;
        
        if (activeDiceCount === 0) {
            this.finishRoll();
            return;
        }

        const totalDice = results.length;

        while (this.dieStates.length < totalDice) {
            this.dieStates.push({ x: 0, y: 0 });
        }

        results.forEach((resultValue, index) => {
            const dieCube = document.getElementById(`die-cube-${index}`);
            if (!dieCube) return;

            if (heldStates && heldStates[index]) {
                return; 
            }

            const target = this.faceRotations[resultValue];
            const current = this.dieStates[index];

            const minSpins = 2;
            const variance = Math.floor(Math.random() * 3);
            const totalSpins = minSpins + variance;

            let xOffset = target[0] - (current.x % 360);
            if (xOffset < 0) xOffset += 360;
            
            let yOffset = target[1] - (current.y % 360);
            if (yOffset < 0) yOffset += 360;

            const nextX = current.x + xOffset + (totalSpins * 360);
            const nextY = current.y + yOffset + (totalSpins * 360);

            this.dieStates[index] = { x: nextX, y: nextY };

            dieCube.style.transform = `rotateX(${nextX}deg) rotateY(${nextY}deg)`;

            const onTransitionEnd = (e) => {
                if (e.propertyName !== 'transform') return; 
                
                dieCube.removeEventListener('transitionend', onTransitionEnd);
                completedCount++;

                if (completedCount === activeDiceCount) {
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
