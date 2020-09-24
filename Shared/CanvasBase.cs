using System;
using System.Globalization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace BlazorCanvas.Shared
{
    public enum PenStyle
    {
        Normal,
        Eraser
    }
    
    public class CanvasComponentBase : ComponentBase
    {
        [Inject]
        public IJSRuntime JSRuntime {get;set;}

        protected async Task InitializeCanvas(string id, string onionSkinsIdSuffix)
        {
            await JSRuntime.InvokeVoidAsync("initializeCanvasElements",id,onionSkinsIdSuffix);
        }
    
        protected async Task<(double X,double Y)> GetStartPosition()
        {
            var p = await JSRuntime.InvokeAsync<Point2D>("getCanvasPosition");
            return (p.X,p.Y);
        }
        protected async Task ClearCanvas()
        {
            await JSRuntime.InvokeVoidAsync("clearMainCanvas");
        }
        
        protected async Task SetOnionSkinsPrevFrameCount(int n)
        {
            await JSRuntime.InvokeVoidAsync("setOnionSkinsPrevFrameCount",n);
        }

        protected async Task DrawStart(double x, double y)
        {
            var p = await GetStartPosition();
            await JSRuntime.InvokeVoidAsync("drawStart",x - p.X, y - p.Y);
        }

        protected async Task DrawLine(double x, double y)
        { 
            var p = await GetStartPosition();
            await JSRuntime.InvokeVoidAsync("drawLine", x -p.X,y-p.Y);
        }
        private int _intervalId;
        protected async Task StartAnimation()
        {
            _intervalId = await JSRuntime.InvokeAsync<int>("startAnimation");
        }
        protected async Task StopAnimation()
        {
            await JSRuntime.InvokeVoidAsync("stopAnimation",_intervalId);
        }

        protected async Task AddNewFrame()
        {
            await JSRuntime.InvokeVoidAsync("addNewFrame");
        }

        protected async Task SetCurrentFrameNumber(int n){
            await JSRuntime.InvokeVoidAsync("setCurrentFrameNumber",n);
        }

        protected async Task SaveFrame(int n)
        {
            await JSRuntime.InvokeVoidAsync("saveFrame",n);
        }

        protected async Task Undo()
        {
            await JSRuntime.InvokeVoidAsync("undo");
        }

        protected async Task Redo()
        {
            await JSRuntime.InvokeVoidAsync("redo");
        }

        protected async Task SaveHistory()
        {
            await JSRuntime.InvokeVoidAsync("saveHistory");
        }

        protected async Task SetEraser(double width)
        {
            await JSRuntime.InvokeVoidAsync("setEraser",width);
        }

        protected async Task SetPenStyle(double width,Rgba rgba)
        {
            await JSRuntime.InvokeVoidAsync("setPenStyle",width,rgba);
        }    
    }

    public class Point2D
    {
        public double X {get;set;}
        public double Y {get;set;}

        public double Distance{get;set;}
    }

    public static class Extentions
    {
        static public byte[] ToByteArray(this string str)
        {
            var array = new byte[str.Length/2];
            for(var i=0; i<str.Length; i+=2 )
            {
                var b = str.Substring(i,2);
                byte.TryParse(b,NumberStyles.HexNumber,CultureInfo.CurrentCulture,out array[i/2]);
            }

            return array;
        }

        static public Rgba ToRgba(this byte[] array) => array.Length switch
        {
            3 => new Rgba(array[0], array[1], array[2], 1),
            4 => new Rgba(array[0], array[1], array[2], array[3] / byte.MaxValue),
            _ => new Rgba()
        };
    }

    public class Rgba
    {
        public byte R{get;set;}
        public byte G{get;set;}
        public byte B{get;set;}
        public float Alpha{get;set;}

        public Rgba(byte r =0,byte g=0,byte b=0, float a=1)
        {
            this.R = r;
            this.G = g;
            this.B = b;
            this.Alpha = a;
        }

        public override string ToString() => $"rgba({R},{G},{B},{Alpha})";
    }
}