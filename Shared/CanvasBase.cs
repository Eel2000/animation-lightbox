using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace BlazorCanvas.Shared
{
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
            //Console.WriteLine($"{p.X},{p.Y}");
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
            //Console.WriteLine("Undo called");
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
    }

    public class Point2D
    {
        public double X {get;set;}
        public double Y {get;set;}

        public double Distance{get;set;}
    }
}