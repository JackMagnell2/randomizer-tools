window.wheelHelper = {
    canvas: null,
    ctx: null,
    entries: [],
    totalWeight: 0,
    colors: [
        "#c0392b", "#2c3e50", "#f1c40f", "#27ae60", "#2980b9", 
        "#8e44ad", "#e67e22", "#16a085", "#7f8c8d", "#d35400"
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

    // Initializes canvas and audio context
    init: function (canvasId, dotNetReference) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext("2d");
        this.dotNetRef = dotNetReference;
        
        try {
            this.tickAudio = new Audio('sounds/tick.mp3');
            this.winAudio = new Audio('sounds/win.mp3');
        } catch (e) { }

        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    // Handles responsive resizing
    resize: function() {
        if(!this.canvas || !this.canvas.parentElement) return;
        var rect = this.canvas.parentElement.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.width * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.logicalWidth = rect.width;
        this.logicalHeight = rect.width;

        this.draw();
    },

    // Updates entries list
    setEntries: function (entriesList) {
        if (!Array.isArray(entriesList)) return;
        this.entries = entriesList;
        this.totalWeight = this.entries.reduce((sum, entry) => sum + (entry.weight || 0), 0);
        this.draw();
    },

    // Main drawing loop
    draw: function () {
        if (!this.ctx) return;

        var baseSize = this.logicalWidth;
        var outsideRadius = baseSize / 2 - 35; 
        var insideRadius = 0;
        var centerX = baseSize / 2;
        var centerY = baseSize / 2;

        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);
        
        this.drawCasinoBezel(centerX, centerY, outsideRadius + 15);

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#ecf0f1"; 

        if (this.entries.length === 0) {
            this.drawEmptyWheel(centerX, centerY, outsideRadius);
            return;
        }

        let currentAngle = this.startAngle;
        let safeTotal = this.totalWeight || 1;

        for (var i = 0; i < this.entries.length; i++) {
            var weight = this.entries[i].weight || 0;
            var sliceArc = (weight / safeTotal) * (Math.PI * 2);
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

    // Renders text on slices with collision detection
    drawSliceText: function(text, angle, arc, centerX, centerY, outsideRadius, baseSize, count) {
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        var textAngle = angle + arc / 2;
        this.ctx.rotate(textAngle);
        this.ctx.translate(outsideRadius - 30, 0); 
        this.ctx.textAlign = "right";
        this.ctx.fillStyle = "white";
        this.ctx.shadowColor = "rgba(0,0,0,0.8)";
        this.ctx.shadowBlur = 4;
        this.ctx.textBaseline = "middle";
        
        if (text.length > 15) text = text.substring(0, 15) + "...";
        
        var maxFont = baseSize / 22; 
        if (count === 1) maxFont = baseSize / 10;
        
        var hubRadius = 45; 
        var availableWidth = outsideRadius - 30 - hubRadius;

        this.ctx.font = 'bold ' + maxFont + 'px Helvetica, Arial';
        
        var width = this.ctx.measureText(text).width;
        while (width > availableWidth) {
            maxFont--;
            if (maxFont < 8) break;
            this.ctx.font = 'bold ' + maxFont + 'px Helvetica, Arial';
            width = this.ctx.measureText(text).width;
        }
        
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    },

    // Draws casino bezel graphics
    drawCasinoBezel: function(centerX, centerY, radius) {
        this.ctx.save();
        var gradient = this.ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        gradient.addColorStop(0, '#f1c40f');
        gradient.addColorStop(0.5, '#f39c12');
        gradient.addColorStop(1, '#f1c40f');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.shadowColor = "rgba(0,0,0,0.5)";
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#2c3e50"; 
        this.ctx.fill();

        var totalLights = 24;
        var step = (Math.PI * 2) / totalLights;
        for(var i = 0; i < totalLights; i++) {
            var a = i * step + this.startAngle; 
            var lx = centerX + Math.cos(a) * (radius - 7.5);
            var ly = centerY + Math.sin(a) * (radius - 7.5);
            this.ctx.beginPath();
            this.ctx.arc(lx, ly, 4, 0, 2 * Math.PI);
            this.ctx.fillStyle = (i % 2 === 0) ? "#fff" : "#ffeb3b"; 
            this.ctx.fill();
        }
        this.ctx.restore();
    },

    // Draws empty state placeholder
    drawEmptyWheel: function(centerX, centerY, radius) {
        var segments = 8;
        var arc = Math.PI * 2 / segments;
        for (var i = 0; i < segments; i++) {
            var angle = this.startAngle + i * arc;
            this.ctx.fillStyle = (i % 2 === 0) ? "#34495e" : "#2c3e50"; 
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.fill();
            this.ctx.stroke();
        }
        this.drawCenterHub(centerX);
        this.drawPointer(centerX, radius);
    },

    // Draws center hub graphics
    drawCenterHub: function(centerX) {
        this.ctx.save();
        var gradient = this.ctx.createLinearGradient(centerX - 25, centerX - 25, centerX + 25, centerX + 25);
        gradient.addColorStop(0, '#bdc3c7');
        gradient.addColorStop(1, '#2c3e50');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerX, 30, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerX, 12, 0, 2 * Math.PI);
        this.ctx.fillStyle = "#f1c40f"; 
        this.ctx.fill();
        this.ctx.restore();
    },

    // Draws pointer arrow
    drawPointer: function(centerX, radius) {
        this.ctx.save();
        this.ctx.translate(centerX, 5);
        this.ctx.rotate(this.arrowOffset);
        this.ctx.translate(-centerX, -5);
        this.arrowOffset *= 0.9; 

        this.ctx.fillStyle = "#e74c3c"; 
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = "rgba(0,0,0,0.3)";
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, -10); 
        this.ctx.lineTo(centerX + 20, -10);
        this.ctx.lineTo(centerX, 60); 
        this.ctx.fill();
        this.ctx.strokeStyle = "#f1c40f";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.restore();
    },

    // Starts spin animation
    spin: function () {
        if(this.isSpinning || this.entries.length === 0) return;
        this.isSpinning = true;
        this.spinArcStart = Math.random() * 20 + 30; 
        this.spinTime = 0;
        this.spinTimeTotal = Math.random() * 3000 + 6000; 
        this.lastIndex = -1; 
        this.rotateWheel();
    },

    // Loops animation frame
    rotateWheel: function () {
        this.spinTime += 30;
        if (this.spinTime >= this.spinTimeTotal) {
            this.stopRotateWheel();
            return;
        }
        
        var spinAngle = this.spinArcStart - this.easeOut(this.spinTime, 0, this.spinArcStart, this.spinTimeTotal);
        this.startAngle += (spinAngle * Math.PI / 180);
        
        var degrees = this.startAngle * 180 / Math.PI + 90;
        var pointerAngle = (Math.PI * 1.5 - (this.startAngle % (Math.PI * 2)));
        pointerAngle = (pointerAngle % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
        
        var currentAngleSum = 0;
        var currentIndex = 0;
        var safeTotal = this.totalWeight || 1;

        for(var i=0; i<this.entries.length; i++) {
            var arc = (this.entries[i].weight / safeTotal) * (Math.PI * 2);
            currentAngleSum += arc;
            if(pointerAngle < currentAngleSum) {
                currentIndex = i;
                break;
            }
        }

        if (this.lastIndex !== -1 && this.lastIndex !== currentIndex) {
            if(this.tickAudio) {
                this.tickAudio.currentTime = 0;
                this.tickAudio.play().catch(()=>{});
            }
            this.arrowOffset = -0.3;
        }
        this.lastIndex = currentIndex;

        this.draw();
        this.spinTimeout = setTimeout(() => this.rotateWheel(), 30);
    },

    // Stops spin and selects winner
    stopRotateWheel: function () {
        clearTimeout(this.spinTimeout);
        
        var currentRotation = this.startAngle % (Math.PI * 2);
        if (currentRotation < 0) currentRotation += Math.PI * 2;
        var pointerAngle = (Math.PI * 1.5 - currentRotation);
        pointerAngle = (pointerAngle % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);

        var winnerIndex = -1;
        var currentAngleSum = 0;
        var safeTotal = this.totalWeight || 1;

        for (var i = 0; i < this.entries.length; i++) {
            var arc = (this.entries[i].weight / safeTotal) * (Math.PI * 2);
            currentAngleSum += arc;
            if (pointerAngle < currentAngleSum) {
                winnerIndex = i;
                break;
            }
        }

        if (winnerIndex === -1) winnerIndex = this.entries.length - 1;
        
        this.isSpinning = false;
        var winnerName = this.entries[winnerIndex].name;
        
        if (this.winAudio) {
            this.winAudio.currentTime = 0;
            this.winAudio.play().catch(()=>{});
        }

        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: this.colors });
        }
        
        if(this.dotNetRef) {
            this.dotNetRef.invokeMethodAsync('OnSpinFinished', winnerName);
        }
    },

    // Deceleration physics
    easeOut: function (t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }
};