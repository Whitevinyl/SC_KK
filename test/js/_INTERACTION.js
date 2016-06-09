//-------------------------------------------------------------------------------------------
//  SETUP
//-------------------------------------------------------------------------------------------

var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;
var Drag = {};
var SelectedHandle;

function InteractionSetup() {
    var sc = document.getElementById("sc-library");
    SCLibrary = sc;

    // MOUSE //
    sc.addEventListener("mousedown", mousePress, false);
    sc.addEventListener("mouseup", mouseRelease, false);
    sc.addEventListener("mousemove", mouseMove, false);


    // TOUCH //
    /*sc.addEventListener('touchstart', function(event) {

        if (event.targetTouches.length == 1) {
            mousePress(event.targetTouches[0]);
        }
        event.preventDefault();
    }, false);*/
    sc.addEventListener('touchmove', function(event) {

        if (event.targetTouches.length == 1) {
            mouseMove(event.targetTouches[0]);
        }
        //event.preventDefault();
    }, false);
    sc.addEventListener('touchend', function(event) {

        if (event.targetTouches.length == 1) {
            mouseRelease(event.targetTouches[0]);
        }
        //event.preventDefault();
    }, false);


    // SCROLL & RESIZE //
    //window.addEventListener("scroll", UpdatePosition, false);
    window.addEventListener("resize", UpdatePosition, false);
}


//-------------------------------------------------------------------------------------------
//  MAIN CLICK INTERACTION
//-------------------------------------------------------------------------------------------


// DOWN //
function mousePress(event) {
    //console.log("touch");
    mouseIsDown = true;
    mouseX = event.pageX;
    mouseY = event.pageY;
}


// UP //
function mouseRelease(event) {
    mouseIsDown = false;
    SelectedHandle = null;
}


// MOVE //
function mouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

    if (mouseIsDown && SelectedHandle) {

        var startValue = SelectedHandle.value;

        var parentEl = SelectedHandle.parent.element;
        var el = SelectedHandle.element;

        var parentPos = SelectedHandle.parent.position;
        var pixelRange = parentEl.offsetWidth - el.offsetWidth;

        // Calculate screen position
        var xPos = ((mouseX - (el.offsetWidth/2)) - parentPos.x);
        xPos = ValueInRange(xPos, 0, pixelRange);
        SelectedHandle.value = Math.round(LinearValue(0, pixelRange, SelectedHandle.parent.min, SelectedHandle.parent.max, xPos));

        // Adjust for not overlapping with other slider //
        if (SelectedHandle === SelectedHandle.parent.handle1) {
            if (SelectedHandle.value >= SelectedHandle.parent.handle2.value) {
                SelectedHandle.value = SelectedHandle.parent.handle2.value-1;
            }
            SelectedHandle.parent.setting.from = SelectedHandle.value; // FROM
        } else {
            if (SelectedHandle.value <= SelectedHandle.parent.handle1.value) {
                SelectedHandle.value = SelectedHandle.parent.handle1.value+1;
            }
            SelectedHandle.parent.setting.to = SelectedHandle.value; // TO
        }

        // set final position //
        xPos = LinearPosition(0, pixelRange, SelectedHandle.parent.min, SelectedHandle.parent.max, SelectedHandle.value);
        el.style.left = "" + xPos + "px";

        SliderBG(SelectedHandle.parent);
        SliderLabel(SelectedHandle.parent);

        // schedule update if value changed //
        if (SelectedHandle.value !== startValue) {
            FilterFromLoop = true;
        }

    }
}

function SliderBG(slider) {
    var h1 = GetElementLocalPosition(slider.handle1.element).x;
    var h2 = GetElementLocalPosition(slider.handle2.element).x;

    var width = h2 - h1;
    var handleWidth = slider.handle1.element.offsetWidth;

    slider.bg.style.left = ""+ (h1 + (handleWidth*0.5))+ "px";
    slider.bg.style.width = ""+ width + "px";
}

function SliderLabel(slider) {
    var x = GetElementLocalPosition(slider.bg).x;
    var w = slider.bg.offsetWidth;

    slider.labelElement.style.left = ""+ (x + (w*0.5) - 200) + "px";

    SetElementText(slider.labelElement, "" + slider.labelArray[slider.handle1.value] + " to " + slider.labelArray[slider.handle2.value]);

    /*while( slider.labelElement.firstChild ) {
        slider.labelElement.removeChild( slider.labelElement.firstChild );
    }
    slider.labelElement.appendChild( document.createTextNode("" + slider.labelArray[slider.handle1.value] + " to " + slider.labelArray[slider.handle2.value] ) );*/
}

function SetElementText(element, text) {
    while( element.firstChild ) {
        element.removeChild( element.firstChild );
    }
    element.appendChild( document.createTextNode("" + text ) );
}

// RESIZE & SCROLL //
function UpdatePosition() {
    for (var i=0; i<Sliders.length; i++) {
        var slider = Sliders[i];
        var handle1 = slider.handle1;
        var handle2 = slider.handle2;

        slider.position = GetElementPosition(slider.element);
        var pixelRange = slider.element.offsetWidth - handle1.element.offsetWidth;

        handle1.element.style.left = "" +  LinearPosition(0, pixelRange, slider.min, slider.max, handle1.value) + "px";
        handle2.element.style.left = "" +  LinearPosition(0, pixelRange, slider.min, slider.max, handle2.value) + "px";
        SliderBG(slider);
        SliderLabel(slider);
    }
}


//-------------------------------------------------------------------------------------------
//  INDIVIDUAL CLICK FUNCTIONS
//-------------------------------------------------------------------------------------------

// CLICK EVENT FOR STYLES //
function StyleSelected(e) {
    for (var i=0; i< FilterStyleButtons.length; i++) {
        FilterStyleButtons[i].className = "sc-roll";
    }
    e.target.className = "sc-roll sc-filter-style-underline";
    CurrentStyle = e.target.alt;
    Filter();
}

function HandleStart(e,obj) {
    //e.preventDefault();
    SelectedHandle = obj;
    mousePress(e);
}


function rolloverCheck() {
    //playOver = hudCheck(dx - (32*units),dy + (8*units) + (midType*0.9),64*units,64*units);
}


function hudCheck(x,y,w,h) { // IS CURSOR WITHIN GIVEN BOUNDARIES
    var mx = mouseX;
    var my = mouseY;
    return (mx>x && mx<(x+w) && my>y && my<(y+h));
}



function KeywordUpdate(keystring) {
    KeyWords = [];

    if (keystring!=="") {
        var keywords = keystring.split(" ");

        for (var i=0; i<keywords.length; i++) {
            if (keywords[i]!=="") {
                KeyWords.push(keywords[i]);
            }
        }
    }
    FilterFromLoop = true;
}





function GetAppPosition() {
    return GetElementPosition(SCLibrary);
}

function GetElementPosition(element) {
    var xPos = 0;
    var yPos = 0;

    while (element) {
        xPos += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPos += (element.offsetTop - element.scrollTop + element.clientTop);

        // go up the chain and loop
        element = element.offsetParent;
    }

    return new Point(xPos,yPos);
}

function GetElementLocalPosition(element) {
    var xPos = 0;
    var yPos = 0;


    xPos += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    yPos += (element.offsetTop - element.scrollTop + element.clientTop);


    return new Point(xPos,yPos);
}

function ValueInRange(value, min, max) {
    if (value < min) {
        value = min;
    }
    if (value > max) {
        value = max;
    }
    return value;
}

function LinearValue(minpos,maxpos,minval,maxval,position) {
    var scale = (maxval - minval) / (maxpos - minpos);
    return (position - minpos) * scale + minval;
}

function LinearPosition(minpos,maxpos,minval,maxval,value) {
    var scale = (maxval - minval) / (maxpos - minpos);
    return minpos + (value - minval) / scale;
}