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
    //sc.addEventListener("mousedown", mousePress, false);
    sc.addEventListener("mouseup", mouseRelease, false);
    sc.addEventListener("mousemove", mouseMove, false);


    // TOUCH //
    /*sc.addEventListener('touchstart', function(event) {

        //console.log(event.target);
        /!*if (event.targetTouches.length == 1) {
            mousePress(event.targetTouches[0]);
        }*!/
        //event.preventDefault();
    }, false);*/

    sc.addEventListener('touchmove', function(event) {

        if (event.targetTouches.length == 1) {
            mouseMove(event.targetTouches[0]);
        }
        //event.preventDefault();
    }, false);
    sc.addEventListener('touchend', function(event) {

        mouseRelease(event);
        if (event.targetTouches.length == 1) {
            mouseRelease(event.targetTouches[0]);
        }
        //event.preventDefault();

    }, false);


    // SCROLL & RESIZE //
    window.addEventListener("scroll", function(event) {
        if (mouseIsDown) {
            event.preventDefault();
        }
    }, false);
    window.addEventListener("resize", UpdatePosition, false);
}


//-------------------------------------------------------------------------------------------
//  MAIN CLICK INTERACTION
//-------------------------------------------------------------------------------------------


// DOWN //
function mousePress(event) {
    var touch = event;
    if (event.targetTouches) {
        touch = event.targetTouches[0];
    }


    mouseIsDown = true;
    mouseX = touch.pageX;
    mouseY = touch.pageY;
}


// UP //
function mouseRelease(event) {

    if (SCPlayerVolumePos === 0 && SelectedHandle === null) {
        VolumeContract();
    }
    mouseIsDown = false;
    SelectedHandle = null;


}


// MOVE //
function mouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

    if (mouseIsDown) {

        event.preventDefault();
        ClearSelection();

        if (SelectedHandle) {

            if (SelectedHandle!==SCPlayerVolumeSliderHandle) {
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
            } else {

                var vPixelRange = 95;
                var yPos = (mouseY - (SelectedHandle.offsetWidth/2)) - (window.innerHeight - 45 - vPixelRange + window.scrollY);
                yPos = ValueInRange(yPos, 0, vPixelRange);

                SelectedHandle.style.top = "" + (yPos + 5) + "px";
                SCVolume = (vPixelRange - yPos)/vPixelRange;

                SCPlayer.volume = SCVolume;
            }
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

function ClearSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
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
    if (!mouseIsDown) {
        SelectedHandle = obj;
        mousePress(e);
    }
}

function VolumeStart(e) {
    if (!mouseIsDown) {
        SelectedHandle = SCPlayerVolumeSliderHandle;
        mousePress(e);
    }
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


//-------------------------------------------------------------------------------------------
//  PLAYER
//-------------------------------------------------------------------------------------------


function TrackButton(trackObject,button) {

    // icon //
    //button.childNodes[0].childNodes[0].setAttribute("points","2,2 18,2 18,18 2,18");

    var IDPlaylist = [];
    var array = PlayList;
    var length = array.length;
    for (var i=0; i<length; i++) {
        IDPlaylist.push(array[i].id);
    }

    var index = IDPlaylist.indexOf(trackObject.id);
    if (index!== -1) {
        PlayListIndex = index;
        PlaylistStatus();
    }

    LoadTrack(trackObject);
    PlayingIcon = button.childNodes[0].childNodes[0];
}

function LoadTrack(trackObject) {

    if (PlayingTrack === trackObject) {
        StopTrack();
    } else {

        // change other playing tracks icon back to triangle //
        if (PlayingIcon!==null) {
            //PlayingIcon.setAttribute("points","3,1 17,10 3,19");
        }

        PlayingTrack = trackObject;
        CurrentTrack = trackObject;
        SCPlayerSource.src = "" + trackObject.uri + "/stream?client_id=" + ClientID;
        SCPlayer.load();


        SCPlayerIconPolygon.setAttribute("points","3,2 27,2 27,28 3,28");


        PlayerTitle(trackObject.title);
        UpdatePlayIcons();

        if (SCPlayerPos<0) {
            ValTo(SCPlayerPos,0,0.4,UpdatePlayerPos);
        }
    }

}

function StopTrack() {
    SCPlayer.pause();
    PlayerDisplay();
    if (PlayingIcon) {
        //PlayingIcon.setAttribute("points","3,1 17,10 3,19");
    }
    SCPlayerIconPolygon.setAttribute("points","4,1 26,15 4,29");
    PlayingTrack = null;
    UpdatePlayIcons();
}

function PlayerEnded() {

    // NEXT TRACK //
    if (PlayList.length>1 && PlayListIndex < (PlayList.length-1)) {
        PlayListIndex += 1;
        LoadTrack(PlayList[PlayListIndex]);
    }
    // STOP //
    else {
        if (PlayList.length>1) {
            CurrentTrack = PlayList[0];
        }
        StopTrack();

        PlayListIndex = 0;
    }

    UpdateNextPrev();
}

function PlayerDisplay() {
    SCPlayerTime.innerHTML = SecondsToTime(CurrentTrack.duration);
    SCPlayerTitle.innerHTML = CurrentTrack.title;
}

function PlayerTitle(title) {
    SCPlayerTitle.innerHTML = title;
}

function PlayerTime() {
    if (PlayingTrack) {
        SCPlayerTime.innerHTML = SecondsToTime(PlayingTrack.duration - (SCPlayer.currentTime*1000));
    }
}

function PlaylistStatus() {
    SCPlaylistStatus.innerHTML = "" + (PlayListIndex+1) + "/" + PlayList.length;
}

function UpdatePlayerPos(y) {
    SCPlayerPos = y;
    SCPlayerPanel.style.bottom = ""+y+"px";
}

function UpdatePlayerVolumePos(y) {
    SCPlayerVolumePos = y;
    SCPlayerVolumeSlider.style.bottom = ""+y+"px";
}

function UpdatePlaylistPos(x) {
    SCPlaylistPos = x;
    SCPlaylist.style.right = ""+x+"px";
}

function VolumeExpand() {
    ValTo(SCPlayerVolumePos,0,0.1,UpdatePlayerVolumePos);
}

function VolumeContract() {
    ValTo(SCPlayerVolumePos,-200,0.1,UpdatePlayerVolumePos);
}

function UpdatePlayIcons() {

    var i, index, array, length;
    var IDFiltered = [];
    var IDPlaylist = [];

    array = FilteredTracks;
    length = array.length;
    for (i=0; i<length; i++) {
        IDFiltered.push(array[i].id);
    }

    for (i=0; i<length; i++) {
        if (PlayingTrack!==null && array[i].id === PlayingTrack.id) {
            SCTracklistPlayIcons[i].childNodes[0].childNodes[0].setAttribute("points","2,2 18,2 18,18 2,18");
        } else {
            SCTracklistPlayIcons[i].childNodes[0].childNodes[0].setAttribute("points","3,1 17,10 3,19");
        }
    }

    array = PlayList;
    length = array.length;
    for (i=0; i<length; i++) {
        IDPlaylist.push(array[i].id);
    }

    for (i=0; i<length; i++) {
        if (PlayingTrack!==null && array[i].id === PlayingTrack.id) {
            SCPlaylistPlayIcons[i].childNodes[0].childNodes[0].setAttribute("points","2,2 18,2 18,18 2,18");
        } else {
            SCPlaylistPlayIcons[i].childNodes[0].childNodes[0].setAttribute("points","3,1 17,10 3,19");
        }
    }

}

function UpdateAddIcons() {
    var i, length, array;
    var IDList = [];

    length = PlayList.length;
    for (i=0; i<length; i++) {
        IDList.push(PlayList[i].id);
    }

    array = FilteredTracks;
    length = array.length;
    for (i=0; i<length; i++) {
        var index = IDList.indexOf(array[i].id);
        if (index !== -1) {
            SCTracklistAddIcons[i].childNodes[0].childNodes[0].setAttribute("d","M 0 10 L 20 10");
        } else {
            SCTracklistAddIcons[i].childNodes[0].childNodes[0].setAttribute("d","M 0 10 L 20 10 M 10 0 L 10 20");
        }
    }
}

//-------------------------------------------------------------------------------------------
//  PLAYLIST
//-------------------------------------------------------------------------------------------

function AddToPlayList(trackObject) {
        PlayList.push(trackObject);
        UpdateNextPrev();
        console.log(PlayList);

        if (SCPlayerPos<0) {
            ValTo(SCPlayerPos,0,0.4,UpdatePlayerPos);
            CurrentTrack = trackObject;
            PlayerDisplay();
        }

        AddPlaylistToPage();
}

function RemoveFromPlayList(trackObject) {

    for (var i=0; i<PlayList.length; i++) {
        if (PlayList[i].id === trackObject.id) {

            // REMOVE //
            PlayList.splice(i, 1);
            UpdateNextPrev();
            console.log(PlayList);
            PlayerDisplay();
            AddPlaylistToPage();
            break;
        }
    }

}

function AddRemovePlayList(trackObject) {

    var newTrack = true;
    for (var i=0; i<PlayList.length; i++) {
        if (PlayList[i].id === trackObject.id) {

            // REMOVE //
            newTrack = false;
            RemoveFromPlayList(trackObject);
        }
    }

    // ADD //
    if (newTrack) {
        AddToPlayList(trackObject);
    }
}

function UpPlaylist(trackObject) {
    var IDList = [];
    var length = PlayList.length;
    for (var i=0; i<length; i++) {
        IDList.push(PlayList[i].id);
    }

    var index = IDList.indexOf(trackObject.id);
    if (index !== -1 && index>0) {
        var mover = PlayList[index];
        PlayList[index] = PlayList[index - 1];
        PlayList[index - 1] = mover;
        UpdateNextPrev();
        PlayerDisplay();
        AddPlaylistToPage();
    }
}

function DownPlaylist(trackObject) {
    var IDList = [];
    var length = PlayList.length;
    for (var i=0; i<length; i++) {
        IDList.push(PlayList[i].id);
    }

    var index = IDList.indexOf(trackObject.id);
    if (index !== -1 && index < (PlayList.length-1)) {
        var mover = PlayList[index];
        PlayList[index] = PlayList[index + 1];
        PlayList[index + 1] = mover;
        UpdateNextPrev();
        PlayerDisplay();
        AddPlaylistToPage();
    }
}

function PlayListPrev() {
    if (PlayListIndex>0) {
        PlayListIndex -= 1;

        UpdateNextPrev();

        if (PlayingTrack) {
            LoadTrack(PlayList[PlayListIndex]);
        } else {
            CurrentTrack = PlayList[PlayListIndex];
            PlayerDisplay();
        }
    }
}

function PlayListNext() {
    if (PlayListIndex < (PlayList.length-1)) {
        PlayListIndex += 1;

        UpdateNextPrev();

        if (PlayingTrack) {
            LoadTrack(PlayList[PlayListIndex]);
        } else {
            CurrentTrack = PlayList[PlayListIndex];
            PlayerDisplay();
        }
    }
}

function UpdateNextPrev() {

    if (PlayListIndex===0) {
        SCPlayerPrev.className = "sc-player-control sc-inactive";
    }
    else if (PlayListIndex > 0) {
        SCPlayerPrev.className = "sc-player-control sc-roll";
    }

    if (PlayListIndex < (PlayList.length-1)) {
        SCPlayerNext.className = "sc-player-control sc-roll";
    }
    else if (PlayListIndex >= (PlayList.length-1)) {
        SCPlayerNext.className = "sc-player-control sc-inactive";
    }

    PlaylistStatus();
}

function OpenPlaylist() {
    ValTo(SCPlaylistPos,0,0.4,UpdatePlaylistPos);
}

function ClosePlaylist() {
    ValTo(SCPlaylistPos,-window.innerWidth,0.4,UpdatePlaylistPos);
}

function OpenClosePlaylist() {
    if (SCPlaylistPos === 0) {
        ClosePlaylist();
        SCPlaylistButton.innerHTML = "SHOW PLAYLIST";
    } else {
        OpenPlaylist();
        SCPlaylistButton.innerHTML = "HIDE PLAYLIST";
    }
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

function GetElementLevelPosition(element,levels) {
    var xPos = 0;
    var yPos = 0;

    while (levels>0) {
        xPos += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPos += (element.offsetTop - element.scrollTop + element.clientTop);

        // go up the chain and loop
        element = element.offsetParent;
        levels -= 1;
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