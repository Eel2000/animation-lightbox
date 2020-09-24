class Color {
    public r: number = 0;
    public g: number = 0;
    public b: number = 0;
    public alpha: number = 1.0;
    constructor (r:number, g:number, b:number, alpha:number = 1){
        this.r = r;
        this.g = g;
        this.b = b;
        this.alpha = alpha;
    }
    public toString(){
        return `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
    } 
}

class Point2D {
    public x: number;
    public y: number;
    constructor (x:number, y:number){
        this.x = x;
        this.y = y;
    }
    get distance(){
        return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2));
    }
}

class Frame {
    public image : ImageData;
    public layer : ImageData[] = [];
    public prevHistory : ImageData[] = [];
    public nextHistory : ImageData[] = [];

    constructor (image : ImageData){
        this.image = image;
    }
}

class Canvas {
    protected element : HTMLCanvasElement;
    protected id : string;
    protected context : CanvasRenderingContext2D
    public color : Color;
    public scaleRate : number = 0.8;

    get width() :number {return this.element.width / this.scaleRate;}
    get height() : number {return this.element.height / this.scaleRate;}

    public constructor (id :string, color:Color = new Color(0,0,0), scaleRate :number = 1)
    {
        this.id = id;
        this.element = document.getElementById(id) as HTMLCanvasElement;
        this.context = this.element.getContext(`2d`) as CanvasRenderingContext2D;
        this.context.lineCap = "round";
        this.color = color;
        this.scaleRate = scaleRate;
        this.context.scale(this.scaleRate,this.scaleRate);
    }

    /**
     * キャンバスに表示している内容を消去します。
     */
    public clear() {
        this.context.clearRect(0,0, this.width,this.height);
    }

    public getImageData() {
        return this.context.getImageData(0,0,this.width,this.height);
    }

    public putImageData(img : ImageData) {
        return this.context.putImageData(img,0,0);
    }

    private prevX :number;
    private prevY :number;
    public drawLineWithPen(x:number, y:number, isDrawing:boolean){
        let scaledX = x/this.scaleRate;
        let scaledY = y/this.scaleRate;
        if(!isDrawing) {
            this.context.beginPath();
            this.context.moveTo(scaledX,scaledY);
        } else {
            let div = 200;
            let dx = (scaledX - this.prevX) / div;
            let dy = (scaledY - this.prevY) / div;
            let r = this.context.lineWidth/2;
            let dtheta = Math.PI / (90 * div);
            for(let i = 0; i<=div; i++)
            {
                let x = this.prevX + dx*i;
                let y = this.prevY + dy*i;
                this.context.beginPath();
                this.context.moveTo(x,y);
                this.context.arc(x,y, r, 0, 2 * Math.PI, false);
                this.context.stroke();
                this.context.fill();
                this.context.closePath();
            }
            // this.context.lineTo(scaledX,scaledY);
            // this.context.stroke();   
        }
        this.prevX = scaledX;
        this.prevY = scaledY;
    }


    public getCanvasPosition(){
        let rect = this.element.getBoundingClientRect();
        return new Point2D(rect.left,rect.top);
    }

    public setEraser(width:number){
        this.context.globalCompositeOperation = "destination-out";
        this.setPenStyle(width, new Color(0,0,0,1), true);
    }

    public setPenStyle(width:number, color:Color, isEraser: boolean = false) {
        //console.log(`${width}, rgba(${color.r},${color.g},${color.b},${color.alpha})`)
        if(!isEraser) this.context.globalCompositeOperation = "source-over";
        this.context.lineWidth = width*this.scaleRate;
        this.context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.alpha})`;
        this.context.fillStyle = this.context.strokeStyle;
    }
}

/**
 * 実際に描画を行うキャンバスを表すクラス
 */
class MainCanvas extends Canvas {
    //public member
    public frames : Frame[] = [];
    private onionSkins;

    // private member
    private _currentFrameNumber :number = 0;
    private _displayOnionSkins : boolean = true;

    // getter/setter
    get displayOnionSkins(){return this._displayOnionSkins; }
    set displayOnionSkins(value : boolean){
        this._displayOnionSkins = value;
        if(value) this.setOnionSkins();
        else this.onionSkins.clear();
    }

    get currentFrameNumber() {return this._currentFrameNumber};
    set currentFrameNumber(value : number){
        this._currentFrameNumber = value;
        this.onionSkins.currentFrame = value;
        this.putImageData(this.frames[value].image);
        if(this._displayOnionSkins) this.setOnionSkins();
    }

    get onionSkinsPrevFrameCount() { return this.onionSkins.previousFrameCount}
    set onionSkinsPrevFrameCount(value :number) {
        this.onionSkins.previousFrameCount = value;
        if (this._displayOnionSkins) this.setOnionSkins();
    }
    get onionSkinsNextFrameCount() { return this.onionSkins.nextFrameCount}
    set onionSkinsNextFrameCount(value :number) {
        this.onionSkins.nextFrameCount = value;
        if (this._displayOnionSkins) this.setOnionSkins();
    }

    /**
     * 現在有効になっているフレームを返します。
     */
    get currentFrame() { return this.frames[this.currentFrameNumber];}

    // constructor
    public constructor (id :string, onionSkinsIdSuffix :string, scaleRate : number = 1,color = new Color(0, 0, 0)){
        super(id,color,scaleRate);
        this.onionSkins = new this.OnionSkins(`${id}${onionSkinsIdSuffix}`,color,scaleRate);
        this.frames.push(new Frame(this.getImageData()));
        //this.frames[0].prevHistory.push(this.getImageData());
    }

    public drawLineWithPen(x : number,y : number,isDrawing :boolean){
        //if(isDrawing) this.prevHistory.push(this.getImageData());
        super.drawLineWithPen(x,y,isDrawing);
    }

    private _allowSaveCount = 50;
    public undo(){
        if(this.currentFrame.prevHistory.length > 0) {
            let prev = this.currentFrame.prevHistory.pop() ?? new ImageData(this.width,this.height) ;
            this.currentFrame.nextHistory.push(this.getImageData());
            this.putImageData(prev);      
        }
    }

    public redo(){
        if(this.currentFrame.nextHistory.length > 0){
            let next = this.currentFrame.nextHistory.pop() ?? new ImageData(this.width,this.height);
            this.currentFrame.prevHistory.push(this.getImageData());
            this.putImageData(next);
        }
    }

    public saveHistory(){
        this.currentFrame.prevHistory.push(this.getImageData());
        if(this.currentFrame.prevHistory.length > this._allowSaveCount) {
            // 許容する保存数を超えたら破棄する
            this.currentFrame.prevHistory.shift();
        }
            // 新しく履歴が追加された時、前方方向の履歴は削除する。
        this.currentFrame.nextHistory = [];
    }

    // public methods
    public setOnionSkins(){
        if(this._displayOnionSkins) this.onionSkins.setOnionSkins(this.frames.map((f) => {return f.image;}));
    }

    public addNewFrames(){
        this.frames.push(new Frame(new ImageData(this.width,this.height)));
    }

    public addFrame(img : ImageData){
        this.frames.push(new Frame(new ImageData(this.width,this.height)));
    }

    public insertFrame(img : ImageData, n : number){
        this.frames.splice(n,0,new Frame(img));
    }

    public clearOnionSkinsCanvas(){
        this.onionSkins.clear();
    }

    /**
     * キャンバスの表示内容を指定したフレームへ保存します。
     * @param n 保存するフレームの番号(0-) 未指定の場合、現在表示しているフレームへ保存します。
     */
    public saveFrame(n : number = this._currentFrameNumber){
        this.frames[n].image = this.getImageData();
    }

    /**
     * 選択したフレームをキャンバスに表示します。
     * @param n 表示するフレームの番号(0～)
     */
    public selectDispFrame(n :number = this._currentFrameNumber){
        this.putImageData(this.frames[n].image);
    }

    /**
     * オニオンスキン
     */
    private OnionSkins = class OnionSkins extends Canvas {
        public displayCount : number = 2;
        public currentFrame : number;
    
        public previousFrameColor : Color = new Color(255,0,255);
        public nextFrameColor : Color = new Color(0,255,255)

        public previousFrameCount : number = 3;
        public nextFrameCount : number = 3;

        public setOnionSkins(frames: ImageData[]){
            this.clear();
            this.setPrevOnionSkins(frames);
            this.setNextOnionSkins(frames);
        }

        private setPrevOnionSkins(frames: ImageData[]){
            this.setOnionSkinsInternal(this.currentFrame - this.previousFrameCount, this.currentFrame, this.previousFrameColor, frames,true);
        }

        private setNextOnionSkins(frames: ImageData[]){
            this.setOnionSkinsInternal(this.currentFrame+1, this.nextFrameCount + this.currentFrame + 1, this.nextFrameColor, frames,false);
        }

        private setOnionSkinsInternal(start:number, end:number, color:Color, frames: ImageData[], isPrev:boolean){
            let startNum = Math.max(start, 0);
            let endNum = Math.min(end,frames.length);
            for(let i= startNum; i< endNum; i++) {
                let imageData = new ImageData(frames[i].data.slice(),frames[i].width,frames[i].height);
                for(let j=0;j<imageData.data.length; j+=4) {
                    imageData.data[j] = color.r;
                    imageData.data[j+1] = color.g;
                    imageData.data[j+2] = color.b;
                    // 現在のフレームから遠いフレームは透過度を強くして表示を薄くする
                    if(isPrev)
                        imageData.data[j+3] = imageData.data[j+3] * (i+1) / (endNum+1);
                    else
                        imageData.data[j+3] = imageData.data[j+3] * (startNum+1) / (i+1);          
                }
                window.createImageBitmap(imageData).then(
                    (img) => {
                        // scale()で設定した倍率分、imageがさらに縮小されるので、倍率で割る？
                        this.context.drawImage(img,0,0,this.width/this.scaleRate,this.height/this.scaleRate);
                    }
                ).catch(() => {
                    console.log(`${i} Error`)});
            }
        }
    }
}

// ------ For JSInterop ------
let mainCanvas: MainCanvas;

/**
 * 
 * @param id id of the main <canvas> element 
 */
function initializeCanvasElements(id: string, onionSkinsSuffix: string) {
    mainCanvas = new MainCanvas(id, onionSkinsSuffix,1/1.5);
}

function getCanvasPosition(){
    return mainCanvas.getCanvasPosition();
}

function clearMainCanvas(){
    mainCanvas.clear();
}

function setEraser(w:number){
    mainCanvas.setEraser(w);
}

function setPenStyle(w:number,color: Color){
    mainCanvas.setPenStyle(w,color);
}

function drawStart(x:number,y:number){
    mainCanvas.drawLineWithPen(x,y,false);
}

function drawLine(x:number, y:number){
    mainCanvas.drawLineWithPen(x,y,true);
}

function setCurrentFrameNumber(currentFrameNum :number){
    mainCanvas.currentFrameNumber = currentFrameNum;
}

function setOnionSkinsPrevFrameCount(n :number){
    mainCanvas.onionSkinsPrevFrameCount = n;
}

function addNewFrame(){
    mainCanvas.addNewFrames();
}

function saveFrame(n : number){
    mainCanvas.saveFrame(n);
}

function saveHistory(){
    mainCanvas.saveHistory();
}

function undo(){
    mainCanvas.undo();
}

function redo(){
    mainCanvas.redo();
}

function startAnimation(){
    console.log("Start Animation");
    mainCanvas.clear();
    mainCanvas.clearOnionSkinsCanvas();

    let counter = 0;
    return window.setInterval(() => {
        if (counter  > mainCanvas.frames.length  - 1){
            counter = 0;
        }
        
        mainCanvas.putImageData(mainCanvas.frames[counter].image);
        counter++;
    },1/8 * 1000);
}

function stopAnimation(intervalId :number){
    console.log(`Stop Animation`);
    window.clearInterval(intervalId);
    mainCanvas.putImageData(mainCanvas.currentFrame.image);
    mainCanvas.setOnionSkins();
}