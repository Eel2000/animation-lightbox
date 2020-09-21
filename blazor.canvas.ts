class Color {
    public R: number = 0;
    public G: number = 0;
    public B: number = 0;
    public Alpha: number = 1.0;
    public toString = () : string => {
        return `rgba(${this.R},${this.G},${this.B},${this.Alpha})`
    } 
}

const ImageList : ImageData[] = [];

class InternalImageData {
    public data: Uint8ClampedArray;
    public width: number;
    public height: number;
    //private originData : ImageData;
    public constructor(imageData: ImageData){
        this.data = imageData.data;
        this.width = imageData.width;
        this.height = imageData.height;
        //this.originData = imageData;
    }
}

class Canvas {
    public Element : HTMLCanvasElement;
    public Id : string;
    public Context : CanvasRenderingContext2D
    public constructor (id :string)
    {
        this.Id = id;
        this.Element = document.getElementById(id) as HTMLCanvasElement;
        this.Context = this.Element.getContext(`2d`);
    }
}
var canvas: Canvas;

function setCanvasElement(id: string) {
    canvas = new Canvas(id);
    ImageList.push(canvas.Context.getImageData(0,0,canvas.Element.width,canvas.Element.height));
    //console.log(`${canvas.Element.offsetLeft},${canvas.Element.offsetTop}`);
}

function getCanvasPosition(){
    const rect = canvas.Element.getBoundingClientRect();
    const p:[number,number] = [rect.left, rect.top]
    return p;
}

function drawStart(x:number,y:number){
    canvas.Context.beginPath();
    canvas.Context.moveTo(x,y);
}

function drawLine(x:number, y:number){
    canvas.Context.lineTo(x,y);
    canvas.Context.stroke();
}

function drawEnd(x:number,y:number){
    canvas.Context.lineTo(x,y);
    canvas.Context.stroke();
    canvas.Context.closePath();
}

function saveImageData(n: number){
    const img = canvas.Context.getImageData(0,0,canvas.Element.width,canvas.Element.height);
    ImageList[n] = img
    
    return ImageList.length;
}

function createNewFrame(currentFrame : number){
    var ret = saveImageData(currentFrame);
    clearCanvas();
    return ret+1;
}

function setImageData(n: number){
    canvas.Context.putImageData(ImageList[n],0,0);
}

function clearCanvas(){
    canvas.Context.clearRect(0,0,canvas.Element.width,canvas.Element.height);
}

var animationCounter = 0;
function animate(handle :TimerHandler){
    if (animationCounter  > ImageList.length  -1){
        animationCounter = 0;
    }
    
    canvas.Context.putImageData(ImageList[animationCounter],0,0);
    animationCounter++;
}

function startAnimation(){
    console.log("Start Animation");
    return window.setInterval(animate,1/8 * 1000);
}

function stopAnimation(intervalId :number){
    console.log(`Stop Animation counter:${animationCounter}`);
    window.clearInterval(intervalId);
    return animationCounter-1;
}