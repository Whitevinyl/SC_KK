
// INIT //
var SCLibrary;
var FilterStyles = ['Any', 'Uplifting', 'Quirky', 'Dramatic', 'Indie', 'Pop', 'Orchestral', 'Ambient', 'Piano', 'Epic', 'Vocal', 'Cinematic'];
var FilterStyleButtons = [];
var TrackElements = [];
var PlaylistElements = [];
var TWEEN;


var Defaults = {
    "style": 1,
    "durationFrom": 1,
    "durationTo": 8,
    "tempoFrom": 0,
    "tempoTo": 3,
    "keywords": []
};
var CurrentStyle = Defaults.style;
var Duration = new RangeObj(Defaults.durationFrom, Defaults.durationTo);
var Tempo = new RangeObj(Defaults.tempoFrom, Defaults.tempoTo);
var KeyWords = Defaults.keywords;

var TempoArray = ["Slow", "Slow-Mid", "Mid", "Mid-Fast", "Fast"];
var DurationArray = ["0:00", "1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00"];
var NoTracks = "No tracks found matching these filter settings.";

var Sliders = [];

var LoopTime = 1000;
var FilterFromLoop = false;

var SCPlayer;
var SCPlayerPanel;
var SCPlayerSource;
var SCPlayerTitle;
var SCPlayerTime;
var SCPlayerIcon;
var SCPlayerIconPolygon;
var SCPlayerPrev;
var SCPlayerNext;
var SCPlayerVolume;
var SCPlayerVolumeSlider;
var SCPlayerVolumeSliderHandle;
var SCPlaylistStatus;
var SCPlaylistButton;
var SCPlaylist;

var SCPlayerPos = -80;
var SCPlayerVolumePos = -120;
var SCPlaylistPos = 0;

var SCAudioPlaying = false;


var SCTracklistPlayIcons = [];
var SCTracklistAddIcons = [];
var SCPlaylistPlayIcons = [];
var SCPlaylistAddIcons = [];



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

    // SETUP PLAYER //
    PlayerSetup();

    // DONE, START LOOP //
    setTimeout(function(){ CheckLoop(); },LoopTime);
    setTimeout(function(){ DurationLoop(); },500);
    SCLoop();
}


//-------------------------------------------------------------------------------------------
//  LOOP
//-------------------------------------------------------------------------------------------


function SCLoop() {
    if (TWEEN) {
        TWEEN.update();
    }
    requestAnimationFrame(SCLoop);
}

function DurationLoop() {
    PlayerTime();
    setTimeout(function(){ DurationLoop(); },500);
}


//-------------------------------------------------------------------------------------------
//  FILTER CHECK LOOP
//-------------------------------------------------------------------------------------------


function CheckLoop() {
    FilterCheck();
    setTimeout(function(){ CheckLoop(); },LoopTime);
}


function FilterCheck() {
    if (FilterFromLoop) {
        Filter();
        FilterFromLoop = false;
    }
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
        span.onclick = function(e) {StyleSelected(e); e.preventDefault();};
    }

    // TEMPO //
    SliderSetup(document.getElementById("sc-filter-tempo"), 0, 4, Tempo.from, Tempo.to, Tempo, TempoArray);

    // DURATION //
    SliderSetup(document.getElementById("sc-filter-duration"), 0, 8, Duration.from, Duration.to, Duration, DurationArray);

    // KEYWORDS //
    var keywordInput = document.getElementById("sc-search-input");
    keywordInput.addEventListener(
        'input',
        function() {
        KeywordUpdate(keywordInput.value);
    }
);


    // RESET BUTTON //
    var reset = document.getElementById("sc-reset");
    reset.onclick = function(e) {FilterReset(); e.preventDefault();};
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


function SliderSetup(element, min, max, value1, value2, setting, labelArray) {

    var children = element.childNodes;

    var sliderObj = new RangeSlider(element, min, max, children[1], children[2], children[3], setting, children[4], labelArray);

    sliderObj.handle1.element.onmousedown = function(e) { console.log("clickstart"); HandleStart(e,sliderObj.handle1);};
    sliderObj.handle2.element.onmousedown = function(e) { console.log("clickstart"); HandleStart(e,sliderObj.handle2);};
    sliderObj.handle1.element.addEventListener("touchstart", function(e) {
        HandleStart(e,sliderObj.handle1);
        e.preventDefault();
    }, false);
    sliderObj.handle2.element.addEventListener("touchstart", function(e) {
        HandleStart(e,sliderObj.handle2);
        e.preventDefault();
    }, false);


    sliderObj.handle1.element.ondragstart = function() { return false; };
    sliderObj.handle2.element.ondragstart = function() { return false; };
    sliderObj.handle1.value = value1;
    sliderObj.handle2.value = value2;

    sliderObj.range = sliderObj.element.offsetWidth - sliderObj.handle1.element.offsetWidth;
    sliderObj.handle1.element.style.left = "" +  LinearPosition(0, sliderObj.range, min, max, value1) + "px";
    sliderObj.handle2.element.style.left = "" +  LinearPosition(0, sliderObj.range, min, max, value2) + "px";
    SliderBG(sliderObj);
    SliderLabel(sliderObj);

    Sliders.push(sliderObj);
}



//-------------------------------------------------------------------------------------------
//  PLAYER SETUP
//-------------------------------------------------------------------------------------------

function PlayerSetup() {
    SCPlayerPanel = document.getElementById("sc-player");
    SCPlayer = document.getElementById("sc-player-audio");
    SCPlayerSource = document.getElementById("sc-player-source");
    SCPlayerTitle = document.getElementById("sc-player-title");
    SCPlayerTime = document.getElementById("sc-player-time");
    SCPlayerIcon = document.getElementById("sc-player-icon");
    SCPlayerIconPolygon = document.getElementById("sc-player-icon-polygon");
    SCPlayerPrev = document.getElementById("sc-player-prev");
    SCPlayerNext = document.getElementById("sc-player-next");
    SCPlayerVolume = document.getElementById("sc-player-volume");
    SCPlayerVolumeSlider = document.getElementById("sc-player-volume-slider");
    SCPlayerVolumeSliderHandle = document.getElementById("sc-player-volume-slider-handle");
    SCPlaylistStatus = document.getElementById("sc-playlist-status");
    SCPlaylistButton = document.getElementById("sc-playlist-button");
    SCPlaylist = document.getElementById("sc-playlist");

    SCPlayerIcon.onclick = function() {LoadTrack(CurrentTrack);};
    SCPlayerPrev.onclick = function() {PlayListPrev();};
    SCPlayerNext.onclick = function() {PlayListNext();};
    SCPlayerVolume.onclick = function() {VolumeExpand();};
    SCPlaylistButton.onclick = function() {OpenClosePlaylist();};


    SCPlayerVolumeSliderHandle.onmousedown = function(e) { console.log("clickstart"); VolumeStart(e);};
    SCPlayerVolumeSliderHandle.addEventListener("touchstart", function(e) {
        VolumeStart(e);
        e.preventDefault();
    }, false);
    SCPlayerVolumeSliderHandle.ondragstart = function() { return false; };

    SCPlaylistPos = -window.innerWidth;


    SCPlayer.onplaying = function() { TogglePlay(); };
    SCPlayer.onended = function() { PlayerEnded(); };
    UpdateNextPrev();
}


function TogglePlay() {
    SCAudioPlaying = !SCAudioPlaying;
}





