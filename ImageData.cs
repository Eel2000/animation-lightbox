using System;
using System.Collections.Generic;

namespace BlazorCanvas
{
    ///
    ///For "getImageData()" and "putImageData()" in JavaScript
    public class ImageData
    {
        public Memory<byte> Data{get;set;}

        public long Width{get;set;} = 0;
        public long Height{get;set;} = 0;
    }
}
