window.wheelHelper = {
    canvas: null,
    ctx: null,
    entries: [], 
    totalWeight: 0,
    colors: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
        "#E7E9ED", "#5352ed", "#ff4757", "#2ed573", "#1e90ff", "#ffa502",
        "#DAF7A6", "#FFC300", "#C70039", "#900C3F", "#581845"
    ],
    startAngle: 0,
    spinTimeout: null,
    spinArcStart: 10,
    spinTime: 0,
    spinTimeTotal: 0,
    dotNetRef: null,
    isSpinning: false,
    tickAudio: null,
    winAudio: null,
    lastIndex: -1,
    arrowOffset: 0,

    // Initializes canvas, audio context, and resize listeners
    init: function (canvasId, dotNetReference) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.dotNetRef = dotNetReference;
        
        this.tickAudio = new Audio('sounds/tick.mp3');
        this.winAudio = new Audio('sounds/win.mp3');
        this.tickAudio.playbackRate = 1; 

        var dpr = window.devicePixelRatio || 1;
        var rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.width * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.logicalWidth = rect.width;
        this.logicalHeight = rect.width;

        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
        
        this.resize(); 
    },

    // Handles responsive resizing of the canvas
    resize: function() {
        if(!this.canvas) return;
        var container = this.canvas.parentElement;
        var newWidth = container.clientWidth;
        
        var dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = newWidth + "px";
        this.canvas.style.height = newWidth + "px";
        this.canvas.width = newWidth * dpr;
        this.canvas.height = newWidth * dpr;
        this.ctx.scale(dpr, dpr);
        this.logicalWidth = newWidth;
        this.logicalHeight = newWidth;

        this.draw();
    },

    // Updates the list of entries and recalculates total weight
    setEntries: function (entriesList) {
        if (!Array.isArray(entriesList)) return;
        this.entries = entriesList;
        this.totalWeight = this.entries.reduce((sum, entry) => sum + entry.weight, 0);
        this.draw();
    },

    // Main rendering loop for weighted slices
    draw: function () {
        if (!this.canvas) return;

        var baseSize = this.logicalWidth;
        var outsideRadius = baseSize / 2 - 25; 
        var insideRadius = 0;
        var centerX = baseSize / 2;
        var centerY = baseSize / 2;

        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;

        if (this.entries.length === 0) {
            this.drawEmptyWheel(centerX, centerY, outsideRadius, insideRadius);
            return;
        }

        if (this.entries.length === 1) {
            this.drawSingleEntry(centerX, centerY, outsideRadius, baseSize);
            return;
        }

        let currentAngle = this.startAngle;

        for (var i = 0; i < this.entries.length; i++) {
            var sliceArc = (this.entries[i].weight / this.totalWeight) * (Math.PI * 2);
            var endAngle = currentAngle + sliceArc;

            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, outsideRadius, currentAngle, endAngle, false);
            this.ctx.arc(centerX, centerY, insideRadius, endAngle, currentAngle, true);
            this.ctx.lineTo(centerX + Math.cos(currentAngle) * outsideRadius, centerY + Math.sin(currentAngle) * outsideRadius);
            this.ctx.fill();
            this.ctx.stroke();

            this.drawSliceText(this.entries[i].name, currentAngle, sliceArc, centerX, centerY, outsideRadius, baseSize, this.entries.length);

            currentAngle = endAngle;
        }

        this.drawCenterHub(centerX);
        this.drawPointer(centerX, outsideRadius);
    },

    // Helper to draw the empty wheel state
    drawEmptyWheel: function(centerX, centerY, outsideRadius, insideRadius) {
        var dummySegments = 8;
        var dummyArc = Math.PI * 2 / dummySegments;
        for (var i = 0; i < dummySegments; i++) {
            var angle = this.startAngle + i * dummyArc;
            this.ctx.fillStyle = (i % 2 === 0) ? "#f0f0f0" : "#e0e0e0";
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, outsideRadius, angle, angle + dummyArc, false);
            this.ctx.arc(centerX, centerY, insideRadius, angle + dummyArc, angle, true);
            this.ctx.lineTo(centerX + Math.cos(angle) * outsideRadius, centerY + Math.sin(angle) * outsideRadius);
            this.ctx.fill();
            this.ctx.stroke();
        }
        this.drawCenterHub(centerX);
        this.drawPointer(centerX, outsideRadius);
    },

    // Helper to draw a single entry wheel
    drawSingleEntry: function(centerX, centerY, outsideRadius, baseSize) {
        this.ctx.fillStyle = this.colors[0];
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, outsideRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.drawCenterHub(centerX);
        
        // Draw text using standard slice logic so it aligns to the side
        this.drawSliceText(this.entries[0].name, 0, Math.PI * 2, centerX, centerY, outsideRadius, baseSize, 1);

        this.drawPointer(centerX, outsideRadius);
    },

    // Helper to draw text on a slice
    drawSliceText: function(text, angle, arc, centerX, centerY, outsideRadius, baseSize, totalEntries) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        var textAngle = angle + arc / 2;
        this.ctx.rotate(textAngle);
        this.ctx.translate(outsideRadius - 30, 0); 
        this.ctx.textAlign = "right";
        this.ctx.fillStyle = "white";
        this.ctx.shadowColor = "rgba(0,0,0,0.5)";
        this.ctx.shadowBlur = 4;
        this.ctx.textBaseline = "middle";
        
        if (text.length > 15) text = text.substring(0, 15) + "...";
        var maxFont = baseSize / 22; 
        if (totalEntries > 12) maxFont = baseSize / 28;
        var minFont = 10;
        
        // Allow single entry to be larger, but keep it aligned
        if (totalEntries === 1) maxFont = baseSize / 12;

        var radiusSpace = outsideRadius - 30 - (outsideRadius * 0.25);
        
        this.ctx.font = 'bold ' + maxFont + 'px Helvetica, Arial';
        var width = this.ctx.measureText(text).width;
        var currentFont = maxFont;
        while (width > radiusSpace && currentFont > minFont) {
            currentFont -= 1;
            this.ctx.font = 'bold ' + currentFont + 'px Helvetica, Arial';
            width = this.ctx.measureText(text).width;
        }
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    },

    // Draws the center decorative hub
    drawCenterHub: function(centerX) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerX, 25, 0, 2 * Math.PI);
        this.ctx.fillStyle = "white";
        this.ctx.shadowColor = "rgba(0,0,0,0.2)";
        this.ctx.shadowBlur = 5;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerX, 10, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#ffce00"; 
        this.ctx.fill();
        this.ctx.restore();
    },

    // Draws the top pointer arrow
    drawPointer: function(centerX, radius) {
        this.ctx.save();
        
        this.ctx.translate(centerX, 5);
        this.ctx.rotate(this.arrowOffset);
        this.ctx.translate(-centerX, -5);

        this.arrowOffset *= 0.9;

        this.ctx.fillStyle = "#333";
        this.ctx.shadowColor = "rgba(0,0,0,0.3)";
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 25, 5); 
        this.ctx.lineTo(centerX + 25, 5);
        this.ctx.lineTo(centerX, 55); 
        this.ctx.fill();
        this.ctx.restore();
    },

    // Starts the spin animation
    spin: function () {
        if(this.isSpinning || this.entries.length === 0) return;
        this.isSpinning = true;
        this.spinArcStart = Math.random() * 20 + 30; 
        this.spinTime = 0;
        this.spinTimeTotal = Math.random() * 3000 + 6000; 
        this.lastIndex = -1; 
        this.rotateWheel();
    },

    // Loops the animation frame
    rotateWheel: function () {
        this.spinTime += 30;
        if (this.spinTime >= this.spinTimeTotal) {
            this.stopRotateWheel();
            return;
        }
        
        var spinAngle = this.spinArcStart - this.easeOut(this.spinTime, 0, this.spinArcStart, this.spinTimeTotal);
        this.startAngle += (spinAngle * Math.PI / 180);
        
        var degrees = this.startAngle * 180 / Math.PI + 90;
        var currentIndex = 0;
        var currentAngleSum = 0;
        
        // Calculate current slice for weighted list
        var normalizedRotation = (this.startAngle % (Math.PI * 2));
        if (normalizedRotation < 0) normalizedRotation += Math.PI * 2;
        var pointerAngle = (Math.PI * 1.5 - normalizedRotation);
        pointerAngle = (pointerAngle % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);

        for(var i=0; i<this.entries.length; i++) {
            var sliceArc = (this.entries[i].weight / this.totalWeight) * (Math.PI * 2);
            currentAngleSum += sliceArc;
            if(pointerAngle < currentAngleSum) {
                currentIndex = i;
                break;
            }
        }

        if (this.lastIndex !== -1 && this.lastIndex !== currentIndex) {
            this.playTick();
            this.arrowOffset = -0.3;
        }
        this.lastIndex = currentIndex;

        this.draw();
        this.spinTimeout = setTimeout(() => this.rotateWheel(), 30);
    },

    // Plays audio tick
    playTick: function() {
        if (this.tickAudio) {
            this.tickAudio.currentTime = 0;
            this.tickAudio.play().catch(e => {}); 
        }
    },

    // Ends rotation and determines winner based on final angle and weights
    stopRotateWheel: function () {
        clearTimeout(this.spinTimeout);
        
        var currentRotation = this.startAngle % (Math.PI * 2);
        if (currentRotation < 0) currentRotation += Math.PI * 2;

        var pointerAngleOnWheel = (Math.PI * 1.5 - currentRotation);
        pointerAngleOnWheel = (pointerAngleOnWheel % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);

        var winnerIndex = -1;
        var currentSliceEndAngle = 0;

        for (var i = 0; i < this.entries.length; i++) {
            var sliceArc = (this.entries[i].weight / this.totalWeight) * (Math.PI * 2);
            currentSliceEndAngle += sliceArc;

            if (pointerAngleOnWheel < currentSliceEndAngle) {
                winnerIndex = i;
                break;
            }
        }

        if (winnerIndex === -1) winnerIndex = this.entries.length - 1;
        
        this.isSpinning = false;
        var winnerName = this.entries[winnerIndex].name;
        
        if (this.winAudio) {
            this.winAudio.currentTime = 0;
            this.winAudio.play().catch(e => {});
        }

        this.fireConfetti();
        this.dotNetRef.invokeMethodAsync('OnSpinFinished', winnerName);
    },

    // Easing math for deceleration
    easeOut: function (t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    },

    // Triggers confetti effect
    fireConfetti: function() {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: this.colors
            });
        }
    }
};