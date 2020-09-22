class Color {
    public r: number = 0;
    public g: number = 0;
    public b: number = 0;
    public alpha: number = 1.0;
    constructor (r:number, g:number, b:number, alpha:number = 255){
        this.r = r;
        this.g = g;
        this.b = b;
        this.alpha = alpha;
    }
    public toString = () : string => {
        return `rgba(${this.r},${this.g},${this.b},${this.alpha})`
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
    public element : HTMLCanvasElement;
    public id : string;
    public context : CanvasRenderingContext2D
    public color : Color;
    public constructor (id :string,color:Color = new Color(0,0,0))
    {
        this.id = id;
        this.element = document.getElementById(id) as HTMLCanvasElement;
        this.context = this.element.getContext(`2d`);
        this.color = color;
    }

    get width() :number {return this.element.width;}
    get height() : number {return this.element.height;}

    public clear() {
        this.context.clearRect(0,0, this.width,this.height);
    }

    public getImageData() {
        return this.context.getImageData(0,0,this.width,this.height);
    }
}

/// [0] : 編集用のcanvas
/// [1] : 前フレームのcanvas
/// [2] : 前々フレームのcanvas
var canvas: Canvas[] = [];

function setCanvasElement(id: string) {
    canvas.push(new Canvas(id));
    canvas.push(new Canvas(id+`-prev`, new Color(255,0,255)));
    canvas.push(new Canvas(id+`-prev2`, new Color(0,255,255)));
    ImageList.push(canvas[0].getImageData());
    //console.log(`${canvas.element.offsetLeft},${canvas.element.offsetTop}`);
}

function getCanvasPosition(canvasNumber : number = 0){
    const rect = canvas[canvasNumber].element.getBoundingClientRect();
    const p:[number,number] = [rect.left, rect.top]
    return p;
}

function clearCanvas(canvasNumber : number = 0){
    canvas[canvasNumber].clear();
}

function drawStart(x:number,y:number,canvasNumber:number = 0){
    canvas[canvasNumber].context.beginPath();
    canvas[canvasNumber].context.moveTo(x,y);
}

function drawLine(x:number, y:number,canvasNumber:number = 0){
    canvas[canvasNumber].context.lineTo(x,y);
    canvas[canvasNumber].context.stroke();
}

function drawEnd(x:number,y:number,canvasNumber:number = 0){
    canvas[canvasNumber].context.lineTo(x,y);
    canvas[canvasNumber].context.stroke();
    canvas[canvasNumber].context.closePath();
}

function saveImageData(n: number,canvasNumber:number = 0){
    const img = canvas[canvasNumber].getImageData();
    ImageList[n] = img
    
    return ImageList.length;
}

function createNewFrame(currentFrame : number){
    let ret = saveImageData(currentFrame);
    setPreviousFrame(ret,1);
    setPreviousFrame(ret,2);
    canvas[0].clear();
    return ret+1;
}

function setImageData(n: number, canvasNumber:number = 0){
    canvas[canvasNumber].context.putImageData(ImageList[n],0,0);
    setPreviousFrame(n,1);
    setPreviousFrame(n,2);
}

function setPreviousFrame(n: number,times: number = 1){
    canvas[times].clear();
    console.log(`${n},${ImageList.length}`);
    if (n-times > ImageList.length || n<times) return;
    let prevImagedata = new ImageData(ImageList[n-times].data.slice(),ImageList[n-times].width,ImageList[n-times].height);
    let prevData = prevImagedata.data;
    for(var i=0;i<prevData.length; i+=4 ){
        prevData[i] = canvas[times].color.r;
        prevData[i+1] = canvas[times].color.g;
        prevData[i+2] = canvas[times].color.b;
        //prevData[i+3] = canvas[times].color.alpha;
    }
    canvas[times].context.putImageData(prevImagedata,0,0);
}

var animationCounter = 0;
function animate(handle :TimerHandler){
    if (animationCounter  > ImageList.length  -1){
        animationCounter = 0;
    }
    
    canvas[0].context.putImageData(ImageList[animationCounter],0,0);
    animationCounter++;
}

function startAnimation(){
    console.log("Start Animation");
    for(let i=0;i<canvas.length;i++){
        canvas[i].clear();
    }
    return window.setInterval(animate,1/8 * 1000);
}

function stopAnimation(intervalId :number){
    console.log(`Stop Animation counter:${animationCounter}`);
    window.clearInterval(intervalId);
    setPreviousFrame(animationCounter-1,1);
    setPreviousFrame(animationCounter-2,2);
    return animationCounter-1;
}