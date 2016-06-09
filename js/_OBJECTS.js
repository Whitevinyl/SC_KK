
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

function RangeObj( from, to ) {
    this.from = from || 0;
    this.to = to || 0;
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
function Track(title, tags, duration, uri, id) {
    this.title = title || '';
    this.tags = tags || [];
    this.duration = duration || 0;
    this.uri = uri || '';
    this.id = id || 0;
    this.isPlaying = false;
}

// SLIDER OBJECT //
function RangeSlider(element, min, max, bg, handle1, handle2, setting, labelElement, labelArray) {
    this.element = element;
    this.position = GetElementPosition(element);
    this.min = min;
    this.max = max;
    this.range = element.offsetWidth;
    this.bg = bg;
    this.handle1 = new SliderHandle(handle1,this,0);
    this.handle2 = new SliderHandle(handle2,this,0);
    this.setting = setting;
    this.labelElement = labelElement;
    this.labelArray = labelArray;
}

function SliderHandle(element, parent, value) {
    this.element = element;
    this.parent = parent;
    this.value = value || 0;
}