
// INIT //
var SCLibrary;
var FilterStyles = ['Any', 'Uplifting', 'Quirky', 'Dramatic', 'Indie', 'Pop', 'Orchestral', 'Ambient', 'Piano', 'Epic', 'Vocal', 'Cinematic'];
var FilterStyleButtons = [];
var TrackElements = [];
var CurrentStyle = 1;

var Sliders = [];

var LoopTime = 2000;

var Defaults = {
    "style": 1
};




//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------


function Init() {

    // SETUP SOUNDCLOUD //
    SoundCloudInit();

    // SETUP INTERACTION //
    InteractionSetup();

    // SETUP FILTERS //
    FilterSetup();

    // DONE, START LOOP //
    setTimeout(function(){ CheckLoop(); },LoopTime);
}


//-------------------------------------------------------------------------------------------
//  FILTER CHECK LOOP
//-------------------------------------------------------------------------------------------


function CheckLoop() {
    FilterCheck();
    setTimeout(function(){ CheckLoop(); },LoopTime);
}

function FilterCheck() {

}

function FilterSetup() {

    // FILTER STYLES //
    var styles = document.getElementById("sc-filter-style-inner");
    for (var i=0; i< FilterStyles.length; i++) {
        var div = document.createElement("div");
        var span = document.createElement("span");
        var node = document.createTextNode(FilterStyles[i]);
        span.className = "sc-roll";
        if (i === CurrentStyle) {
            span.className = "sc-roll sc-filter-style-underline";
        }
        span.alt = i;
        span.appendChild(node);
        div.appendChild(span);
        styles.appendChild(div);

        FilterStyleButtons.push(span);
        span.onclick = function(e) {StyleSelected(e);};
    }

    // TEMPO //
    SliderSetup(document.getElementById("sc-filter-tempo"), 0, 10);

    // RESET BUTTON //
    var reset = document.getElementById("sc-reset");
    reset.onclick = function() {FilterReset();};
}


function ResetStyle() {
    for (var i=0; i< FilterStyleButtons.length; i++) {
        FilterStyleButtons[i].className = "sc-roll";
    }
    FilterStyleButtons[CurrentStyle].className = "sc-roll sc-filter-style-underline";
}

//-------------------------------------------------------------------------------------------
//  SLIDER
//-------------------------------------------------------------------------------------------


function SliderSetup(element, min, max) {

    var children = element.childNodes;
    var sliderObj = new RangeSlider(element, min, max, children[1], children[2]);

    sliderObj.handle1.element.onmousedown = function(e) {HandleStart(e,sliderObj.handle1);};
    sliderObj.handle2.element.onmousedown = function(e) {HandleStart(e,sliderObj.handle2);};

    Sliders.push(sliderObj);
}












