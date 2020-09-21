class Color {
    constructor() {
        this.R = 0;
        this.G = 0;
        this.B = 0;
        this.Alpha = 1.0;
        this.toString = () => {
            return `rgba(${this.R},${this.G},${this.B},${this.Alpha})`;
        };
    }
}
const ImageList = [];
class InternalImageData {
    constructor(imageData) {
        this.data = imageData.data;
        this.width = imageData.width;
        this.height = imageData.height;
    }
}
class Canvas {
    constructor(id) {
        this.Id = id;
        this.Element = document.getElementById(id);
        this.Context = this.Element.getContext(`2d`);
    }
}
var canvas;
function setCanvasElement(id) {
    canvas = new Canvas(id);
    ImageList.push(canvas.Context.getImageData(0, 0, canvas.Element.width, canvas.Element.height));
}
function getCanvasPosition() {
    const rect = canvas.Element.getBoundingClientRect();
    const p = [rect.left, rect.top];
    return p;
}
function drawStart(x, y) {
    canvas.Context.beginPath();
    canvas.Context.moveTo(x, y);
}
function drawLine(x, y) {
    canvas.Context.lineTo(x, y);
    canvas.Context.stroke();
}
function drawEnd(x, y) {
    canvas.Context.lineTo(x, y);
    canvas.Context.stroke();
    canvas.Context.closePath();
}
function saveImageData(n) {
    const img = canvas.Context.getImageData(0, 0, canvas.Element.width, canvas.Element.height);
    ImageList[n] = img;
    return ImageList.length;
}
function createNewFrame(currentFrame) {
    var ret = saveImageData(currentFrame);
    clearCanvas();
    return ret + 1;
}
function setImageData(n) {
    canvas.Context.putImageData(ImageList[n], 0, 0);
}
function clearCanvas() {
    canvas.Context.clearRect(0, 0, canvas.Element.width, canvas.Element.height);
}
var animationCounter = 0;
function animate(handle) {
    if (animationCounter > ImageList.length - 1) {
        animationCounter = 0;
    }
    canvas.Context.putImageData(ImageList[animationCounter], 0, 0);
    animationCounter++;
}
function startAnimation() {
    console.log("Start Animation");
    return window.setInterval(animate, 1 / 8 * 1000);
}
function stopAnimation(intervalId) {
    console.log(`Stop Animation counter:${animationCounter}`);
    window.clearInterval(intervalId);
    return animationCounter - 1;
}
//# sourceMappingURL=blazor.canvas.js.map