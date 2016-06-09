
//-------------------------------------------------------------------------------------------
//  OBJECTS
//-------------------------------------------------------------------------------------------


function Point( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}

function Point3D( x, y, z ) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

function Vector( x, y ) {
    this.x = x || 0;
    this.y = y || 0;
}

function Size( w, h ) {
    this.w = w || 0;
    this.h = h || 0;
}

function RGBA( r, g, b, a ) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = a;

    this.toString = function() {
        return "rgba("+this.R+","+this.G+","+this.B+",1)";
    };

    this.clone = function () {
        return new RGBA(this.R, this.G, this.B, this.A);
    };
}

function Alpha(a) {
    this.A = a;
}

function Particle(point,vector) {
    this.Position = point || new Point();
    this.Vector = vector || new Vector();
    this.Active = false;
}

// TRACK OBJECT //
function Track(title, tags, duration, uri) {
    this.title = title || '';
    this.tags = tags || [];
    this.duration = duration || 0;
    this.uri = uri || '';
}

// SLIDER OBJECT //
function RangeSlider(element, min, max, handle1, handle2) {
    this.element = element;
    this.min = min;
    this.max = max;
    this.handle1 = new SliderHandle(handle1,this);
    this.handle2 = new SliderHandle(handle2,this);
}

function SliderHandle(element, parent) {
    this.element = element;
    this.parent = parent;
}