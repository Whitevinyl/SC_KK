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
    sc.addEventListener('touchstart', function(event) {
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            mousePress(event.targetTouches[0]);
        }
    }, false);
    sc.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            mouseMove(event.targetTouches[0]);
        }
    }, false);
    sc.addEventListener('touchend', function(event) {
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            mouseRelease(event.targetTouches[0]);
        }
    }, false);
}


//-------------------------------------------------------------------------------------------
//  MAIN CLICK INTERACTION
//-------------------------------------------------------------------------------------------


// DOWN //
function mousePress(event) {
    mouseIsDown = true;
    mouseX = event.pageX;
    mouseY = event.pageY;

    console.log(""+mouseX + " | "+mouseY);
    console.log(GetAppPosition());
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
        console.log("dragging");
        var parentEl = SelectedHandle.parent.element;
        var el = SelectedHandle.element;
        var parentPos = GetElementPosition(parentEl);

        el.style.left = "" + ((mouseX - (el.offsetWidth/2)) - parentPos.x) + "px";

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

    SelectedHandle = obj;
    console.log(SelectedHandle);
}


function rolloverCheck() {
    //playOver = hudCheck(dx - (32*units),dy + (8*units) + (midType*0.9),64*units,64*units);
}


function hudCheck(x,y,w,h) { // IS CURSOR WITHIN GIVEN BOUNDARIES
    var mx = mouseX;
    var my = mouseY;
    return (mx>x && mx<(x+w) && my>y && my<(y+h));
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