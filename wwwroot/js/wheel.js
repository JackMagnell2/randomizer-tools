window.wheelHelper = {
    canvas: null,
    ctx: null,
    names: [],
    colors: [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
        "#E7E9ED", "#5352ed", "#ff4757", "#2ed573", "#1e90ff", "#ffa502",
        "#DAF7A6", "#FFC300", "#C70039", "#900C3F", "#581845"
    ],
    startAngle: 0,
    arc: 0,
    spinTimeout: null,
    spinArcStart: 10,
    spinTime: 0,
    spinTimeTotal: 0,
    dotNetRef: null,
    isSpinning: false,

    init: function (canvasId, dotNetReference) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.dotNetRef = dotNetReference;
        
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

    setNames: function (namesList) {
        if (!Array.isArray(namesList)) {
            return;
        }
        this.names = namesList;
        this.arc = Math.PI * 2 / this.names.length;
        this.draw();
    },

    draw: function () {
        if (!this.canvas || !this.names.length) return;

        var baseSize = this.logicalWidth;
        var outsideRadius = baseSize / 2 - 15;
        var insideRadius = 0;
        var centerX = baseSize / 2;
        var centerY = baseSize / 2;

        this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;

        for (var i = 0; i < this.names.length; i++) {
            var angle = this.startAngle + i * this.arc;
            
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, outsideRadius, angle, angle + this.arc, false);
            this.ctx.arc(centerX, centerY, insideRadius, angle + this.arc, angle, true);
            this.ctx.lineTo(centerX + Math.cos(angle) * outsideRadius, centerY + Math.sin(angle) * outsideRadius);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.save();
            
            this.ctx.translate(centerX, centerY);
            
            var textAngle = angle + this.arc / 2;
            this.ctx.rotate(textAngle);
            
            this.ctx.translate(outsideRadius - 10, 0); 

            this.ctx.fillStyle = "white";
            this.ctx.shadowColor = "rgba(0,0,0,0.5)";
            this.ctx.shadowBlur = 4;
            this.ctx.textBaseline = "middle";
            this.ctx.textAlign = "right";

            var text = this.names[i];
            
            var maxFont = baseSize / 15;
            var minFont = 10;
            var radiusSpace = outsideRadius - insideRadius - 30;
            
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
        }

        this.drawPointer(centerX, outsideRadius);
    },

    drawPointer: function(centerX, radius) {
        this.ctx.save();
        this.ctx.fillStyle = "#333";
        this.ctx.shadowColor = "rgba(0,0,0,0.3)";
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, 5); 
        this.ctx.lineTo(centerX + 20, 5);
        this.ctx.lineTo(centerX, 45);
        this.ctx.fill();
        this.ctx.restore();
    },

    spin: function () {
        if(this.isSpinning) return;
        this.isSpinning = true;
        this.spinArcStart = Math.random() * 10 + 10;
        this.spinTime = 0;
        this.spinTimeTotal = Math.random() * 3000 + 4 * 1000; 
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
        
        this.isSpinning = false;
        var winnerName = this.names[index];
        
        this.fireConfetti();
        
        this.dotNetRef.invokeMethodAsync('OnSpinFinished', winnerName);
    },

    easeOut: function (t, b, c, d) {
        var ts = (t /= d) * t;
        var tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    },

    fireConfetti: function() {
        var baseSize = this.logicalWidth;
        this.ctx.save();
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.fillRect(0,0, baseSize, baseSize);
        this.ctx.restore();
        setTimeout(() => this.draw(), 100);
    }
};