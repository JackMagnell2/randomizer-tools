window.wheelHelper = {
    canvas: null,
    ctx: null,
    names: [],
    colors: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
        "#E7E9ED", "#5352ed", "#ff4757", "#2ed573", "#1e90ff", "#ffa502"
    ],
    startAngle: 0,
    arc: 0,
    spinTimeout: null,
    spinArcStart: 10,
    spinTime: 0,
    spinTimeTotal: 0,
    ctx: null,
    dotNetRef: null,

    init: function (canvasId, dotNetReference) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.dotNetRef = dotNetReference;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize: function() {
        if(!this.canvas) return;

        var container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientWidth;
        this.draw();
    },

    setNames: function (namesList) {
        this.names = namesList;
        this.arc = Math.PI * 2 / this.names.length;
        this.draw();
    },

    draw: function () {
        if (!this.canvas || !this.names.length) return;
        
        var baseSize = this.canvas.width;
        // Use a dynamic radius to fill the space better
        var outsideRadius = baseSize / 2 - 10; 
        var insideRadius = baseSize / 5;
        var centerX = baseSize / 2;
        var centerY = baseSize / 2;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.lineWidth = 2;
        // Dynamic font size based on number of names
        var fontSize = baseSize / 15;
        if (this.names.length > 10) fontSize = baseSize / 25;
        this.ctx.font = 'bold ' + fontSize + 'px Helvetica, Arial';
        this.ctx.textBaseline = 'middle';

        for (var i = 0; i < this.names.length; i++) {
            var angle = this.startAngle + i * this.arc;
            this.ctx.fillStyle = this.colors[i % this.colors.length];

            // Draw Slice
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, outsideRadius, angle, angle + this.arc, false);
            this.ctx.arc(centerX, centerY, insideRadius, angle + this.arc, angle, true);
            this.ctx.stroke();
            this.ctx.fill();

            // Draw Text
            this.ctx.save();
            this.ctx.fillStyle = "white";
            
            this.ctx.translate(centerX, centerY);

            this.ctx.rotate(angle + this.arc / 2);

            this.ctx.translate(outsideRadius * 0.85, 0); 

            this.ctx.rotate(Math.PI); 

            var text = this.names[i];
            if (text.length > 15) text = text.substring(0, 14) + "...";
            
            // Draw text aligned to the right
            this.ctx.textAlign = "left"; 
            this.ctx.fillText(text, 0, 0);
            
            this.ctx.restore();
        }

        // Draw the pointer
        this.drawPointer(centerX, outsideRadius);
    },

    drawPointer: function(centerX, radius) {
        this.ctx.fillStyle = "#333";
        this.ctx.beginPath();

        this.ctx.moveTo(centerX - 15, 10);
        this.ctx.lineTo(centerX + 15, 10);
        this.ctx.lineTo(centerX, 35);
        this.ctx.fill();
    },

    spin: function (winnerIndex) {
        this.spinArcStart = Math.random() * 10 + 10;
        this.spinTime = 0;
        this.spinTimeTotal = Math.random() * 3 + 4 * 1000; // Spin between 4 and 7 seconds
        
        // Calculate target logic
        this.rotateWheel();
    },

    rotateWheel: function () {
        this.spinTime += 30;
        if (this.spinTime >= this.spinTimeTotal) {
            this.stopRotateWheel();
            return;
        }
        var spinAngle = this.spinArcStart - this.easeOut(this.spinTime, 0, this.spinArcStart, this.spinTimeTotal);
        this.startAngle += (spinAngle * Math.PI / 180);
        this.draw();
        this.spinTimeout = setTimeout(() => this.rotateWheel(), 30);
    },

    stopRotateWheel: function () {
        clearTimeout(this.spinTimeout);
        var degrees = this.startAngle * 180 / Math.PI + 90;
        var arcd = this.arc * 180 / Math.PI;
        var index = Math.floor((360 - degrees % 360) / arcd);
        this.ctx.save();
        
        // Notify Blazor who the winner is based on the visual stop
        var winnerName = this.names[index];
        this.dotNetRef.invokeMethodAsync('OnSpinFinished', winnerName);
        this.ctx.restore();
    },

    easeOut: function (t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }
};