window.numberHelper = {
    dotNetRef: null,
    audioTick: null,
    audioLand: null,

    // Initializes audio and reference
    init: function (dotNetReference) {
        this.dotNetRef = dotNetReference;
        try {
            this.audioTick = new Audio('sounds/slot-roll.wav'); 
            this.audioTick.volume = 0.3;
            this.audioLand = new Audio('sounds/slot-win.mp3');
        } catch (e) { }
    },

    // Main animation function
    rollNumbers: function (finalResults, min, max) {
        if (!Array.isArray(finalResults)) return;

        const duration = 1500;
        const intervalTime = 50;
        const totalSteps = duration / intervalTime;
        let step = 0;

        if (this.audioTick) {
            this.audioTick.currentTime = 0;
            this.audioTick.loop = true;
            this.audioTick.play().catch(()=>{});
        }

        const interval = setInterval(() => {
            step++;

            finalResults.forEach((_, index) => {
                const element = document.getElementById(`num-slot-${index}`);
                if (element) {

                    const randomVal = Math.floor(Math.random() * (max - min + 1)) + min;
                    element.innerText = randomVal;
                    element.style.opacity = 0.7;
                    element.style.transform = `scale(0.95)`;
                }
            });

            if (step >= totalSteps) {
                clearInterval(interval);
                this.finishRoll(finalResults);
            }
        }, intervalTime);
    },

    // Finalize state
    finishRoll: function (finalResults) {

        if (this.audioTick) {
            this.audioTick.pause();
            this.audioTick.currentTime = 0;
        }

        if (this.audioLand) {
            this.audioLand.currentTime = 0;
            this.audioLand.play().catch(()=>{});
        }

        finalResults.forEach((val, index) => {
            const element = document.getElementById(`num-slot-${index}`);
            if (element) {
                element.innerText = val;
                element.style.opacity = 1;
                element.style.transform = `scale(1.1)`;
                setTimeout(() => element.style.transform = `scale(1)`, 200);
            }
        });

        if (this.dotNetRef) {
            this.dotNetRef.invokeMethodAsync('OnGenerateFinished', finalResults);
        }
    }
};
