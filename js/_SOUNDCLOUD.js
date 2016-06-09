
// INIT //
var SC;
var ClientID = "7258ff07f16ddd167b55b8f9b9a3ed33";
var UserID = 2101843;

var TrackList = [];
var FilteredTracks = [];
var TrackNo = 200;
var Pagination = 0;
var PlayingTrack = null;
var CurrentTrack = null;
var PlayingIcon = null;
var PlayList = [];
var PlayListIndex = 0;
var SCVolume = 1;

//-------------------------------------------------------------------------------------------
//  INITIALISE
//-------------------------------------------------------------------------------------------


function SoundCloudInit() {
    SC.initialize({
        client_id: ClientID
    });
    GetTracks(UserID);
}


//-------------------------------------------------------------------------------------------
//  QUERY
//-------------------------------------------------------------------------------------------


function GetTracks(id) {
    TrackList = [];
    Pagination = 0;

    // GET USER TRACK NUMBER AND START THE QUERY //
    GetUser(id);
}


function Query(id,offset) {
    SC.get('/users/'+id+'/tracks', {
        offset:offset,
        limit: 200

    }).then(function(tracks) {
        if (tracks) {
            var trackID = 0;

            tracks.forEach(function(track) {

                // ADD NEW TRACK OBJECT TO TRACKLIST //
                var trackObject = new Track(FormatTitle(track.title),FormatTags(track.tag_list),track.duration,track.uri,trackID);
                TrackList.push(trackObject);
                trackID += 1;
            });

            // SEARCH COMPLETE - NOW WHAT? //
            if (Pagination < Math.floor(TrackNo/200)) {

                // AGAIN, NEXT PAGE //
                Pagination += 1;
                Query(id,200 * Pagination);

            } else {

                // DONE //
                var filtered = [];
                //filtered = FilterTagsOr(TrackList,["keith kenniff","helios"]);
                //filtered = FilterDuration(TrackList,0,0.5);
                //filtered = FilterSearch(TrackList,"uplifting");
                //console.log(filtered);
                //console.log(TrackList);

                //AddTracksToPage(filtered);
                Filter();
            }
        }
    });
}


// GET USER & TRACK NUMBER //
function GetUser(id) {
    SC.get('/users/'+id, {}).then(function(user) {
        if (user) {
            TrackNo = user.track_count;
            // START THE QUERY //
            Query(id,0);
        }
    });
}


// SEPARATE TAGS INTO ARRAY OF STRINGS //
function FormatTags(tags) {
    if (tags && tags.length) {
        var formatted = tags.match(/\w+|"[^"]+"/g), i = formatted.length;
        while(i--){
            formatted[i] = formatted[i].replace(/"/g,"");
        }
        return formatted;
    }
    return [];
}

// STRIP QUOTES FROM TITLE //
function FormatTitle(title) {
    return title.replace(/['"]+/g, '');
}

//-------------------------------------------------------------------------------------------
//  FILTERING
//-------------------------------------------------------------------------------------------

// MASTER FILTER //
function Filter() {
    var filtered = TrackList;

    // Filter the Style //
    if (CurrentStyle!==0) {
        filtered = FilterSearch(filtered,FilterStyles[CurrentStyle]);
    }

    filtered = FilterDuration(filtered,Duration.from,Duration.to);

    if (KeyWords.length) {
        filtered = FilterMultiSearch(filtered,KeyWords);
    }

    SetElementText(document.getElementById("sc-result-count"), ""+filtered.length+" tracks found");

    if (filtered.length) {
        SetElementText(document.getElementById("sc-results-none"), "");
    } else {
        SetElementText(document.getElementById("sc-results-none"), NoTracks);
    }

    AddTracksToPage(filtered);
}

// RESET ALL FILTERS //
function FilterReset() {
    CurrentStyle = Defaults.style;
    Duration.from = Defaults.durationFrom;
    Duration.to = Defaults.durationTo;
    Tempo.from = Defaults.tempoFrom;
    Tempo.to = Defaults.tempoTo;
    KeyWords = Defaults.keywords;

    for (var i=0; i<Sliders.length; i++) {
        Sliders[i].handle1.value = Sliders[i].setting.from;
        Sliders[i].handle2.value = Sliders[i].setting.to;
    }
    document.getElementById("sc-search-input").value = "";

    UpdatePosition();
    ResetStyle();
    Filter();
}


// TAGS //
// Return all tracks containing at least one of these tags //
function FilterTagsOr(array, terms) {
    var filtered = [];
    for (var i=0; i<array.length; i++) {
        var track = array[i];
        for (var h=0; h<terms.length; h++) {
            if (track.tags.indexOf(terms[h]) !== -1) {
                filtered.push(track);
                break;
            }
        }
    }
    return filtered;
}


// TAGS //
// Return all tracks containing all of these tags //
function FilterTagsAnd(array, terms) {
    var filtered = array;
    for (var j=0; j<terms.length; j++) {
        filtered = FilterTagsOr(filtered,[terms[j]]);
    }
    return filtered;
}


// DURATION //
// Return all tracks within this duration range //
function FilterDuration(array, from, to) {
    var filtered = [];
    for (var i=0; i<array.length; i++) {
        var track = array[i];
        if (track.duration > (from*60000) && track.duration < (to*60000)) {
            filtered.push(track);
        }
    }
    return filtered;
}


// SEARCH //
// Return all tracks with search term in tags, or title //
function FilterSearch(array, term) {
    term = term.toLowerCase();
    var filtered = [];
    for (var i=0; i<array.length; i++) {
        var track = array[i];

        // SEARCH TITLE //
        if (track.title.toLowerCase().indexOf(term) !== -1) {
            filtered.push(track);
            continue;
        }

        // SEARCH IN TAGS //
        for (var h=0; h<track.tags.length; h++) {
            if (track.tags[h].toLowerCase().indexOf(term) !== -1) {
                filtered.push(track);
                break;
            }
        }
    }
    return filtered;
}

// Return all tracks with search term in tags, or title //
function FilterMultiSearch(array, terms) {
    var filtered = [];

    track:
    for (var i=0; i<array.length; i++) {
        var track = array[i];

        for (var j=0; j<terms.length; j++) {
            var term = terms[j].toLowerCase();

            // SEARCH TITLE //
            if (track.title.toLowerCase().indexOf(term) !== -1) {
                filtered.push(track);
                continue track;
            }

            // SEARCH IN TAGS //
            for (var h = 0; h < track.tags.length; h++) {
                if (track.tags[h].toLowerCase().indexOf(term) !== -1) {
                    filtered.push(track);
                    continue track;
                }
            }

        }
    }
    return filtered;
}


// SEARCH //
// Return all tracks with search term in title //
function FilterSearchTitle(array, term) {
    term = term.toLowerCase();
    var filtered = [];
    for (var i=0; i<array.length; i++) {
        var track = array[i];
        if (track.title.toLowerCase().indexOf(term) !== -1) {
            filtered.push(track);
        }
    }
    return filtered;
}

// SEARCH //
// Return all tracks with search term in tags //
function FilterSearchTags(array, term) {
    term = term.toLowerCase();
    var filtered = [];
    for (var i=0; i<array.length; i++) {
        var track = array[i];
        for (var h=0; h<track.tags.length; h++) {
            if (track.tags[h].toLowerCase().indexOf(term) !== -1) {
                filtered.push(track);
                break;
            }
        }
    }
    return filtered;
}



//-------------------------------------------------------------------------------------------
//  DOM
//-------------------------------------------------------------------------------------------


function AddTracksToPage(filtered) {
    FilteredTracks = filtered;
    var results = document.getElementById("sc-results");
    ClearTracksFromPage(results);

    for (var i=0; i<filtered.length; i++) {


        // Track Container //
        var container = document.createElement("div");
        container.className = "sc-track-container";


        // Play Button //
        var playButton = document.createElement("div");
        var playImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        playImg.setAttribute("width","20");
        playImg.setAttribute("height","20");
        if (filtered[i].id === PlayingTrack) {
            poly.setAttribute("points","2,2 18,2 18,18 2,18");
            PlayingIcon = poly;
        } else {
            poly.setAttribute("points","3,1 17,10 3,19");
        }
        poly.setAttribute("style","fill:currentColor;");
        playButton.className = "sc-roll sc-track-button";
        playImg.className = "sc-svg";
        playImg.appendChild(poly);
        playButton.appendChild(playImg);
        container.appendChild(playButton);
        (function (n) {
            //var uri = "" + filtered[n].uri + "/stream?client_id=" + ClientID;
            playButton.onclick = function() {TrackButton(filtered[n],this);};
        }(i));
        SCTracklistPlayIcons.push(playButton);

        // Title //
        var title = document.createElement("div");
        var titleSpan = document.createElement("span");
        var titleNode = document.createTextNode(filtered[i].title);
        title.className = "sc-track-title sc-text-track";
        //titleSpan.className = "sc-roll";
        titleSpan.appendChild(titleNode);
        title.appendChild(titleSpan);
        container.appendChild(title);


        // Duration //
        var duration = document.createElement("div");
        var durationSpan = document.createElement("span");
        var durationNode = document.createTextNode(SecondsToTime(filtered[i].duration));
        duration.className = "sc-track-duration sc-text-number";
        durationSpan.appendChild(durationNode);
        duration.appendChild(durationSpan);
        container.appendChild(duration);


        // Add Button //
        var addButton = document.createElement("div");
        addButton.className = "sc-roll sc-track-add";
        var addImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        addImg.setAttribute("width","20");
        addImg.setAttribute("height","20");
        path.setAttribute("d","M 0 10 L 20 10 M 10 0 L 10 20");
        path.setAttribute("style","stroke:currentColor;stroke-width:2");
        addImg.className = "sc-svg";
        addImg.appendChild(path);
        addButton.appendChild(addImg);
        container.appendChild(addButton);
        (function (n) {
            //var uri = "" + filtered[n].uri + "/stream?client_id=" + ClientID;
            addButton.onclick = function() {AddRemovePlayList(filtered[n]);};
        }(i));
        SCTracklistAddIcons.push(addButton);

        // Done, add this to the track list //
        results.appendChild(container);
        TrackElements.push(container);
    }
    FadeInTracks();
    UpdateAddIcons();
    UpdatePlayIcons();
}


function ClearTracksFromPage(parent) {
    if (TrackElements.length) {
        for (var i=0; i<TrackElements.length; i++) {
            parent.removeChild(TrackElements[i]);
        }
    }
    TrackElements = [];
    SCTracklistPlayIcons = [];
    SCTracklistAddIcons = [];
    PlayingIcon = null;
}


function FadeInTracks() {
    if (TrackElements.length) {
        for (var i=0; i<TrackElements.length; i++) {
            // only fade first 30 //
            if (i<20) {
                FadeTimeout(i);
            } else {
                TrackElements[i].style.opacity = "1";
            }

        }
    }
}

function FadeTimeout(n) {
    setTimeout(function () {
        if (TrackElements[n]) {
            TrackElements[n].style.opacity = "1";
        }
    }, 50 * n);
}

function AddPlaylistToPage() {
    var playlist = document.getElementById("sc-playlist-container");
    ClearPlaylistFromPage(playlist);

    for (var i=0; i<PlayList.length; i++) {


        // Track Container //
        var container = document.createElement("div");
        container.className = "sc-track-container2";


        // Play Button //
        var playButton = document.createElement("div");
        var playImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        playImg.setAttribute("width","20");
        playImg.setAttribute("height","20");
        if (PlayList[i].id === PlayingTrack) {
            poly.setAttribute("points","2,2 18,2 18,18 2,18");
            PlayingIcon = poly;
        } else {
            poly.setAttribute("points","3,1 17,10 3,19");
        }
        poly.setAttribute("style","fill:currentColor;");
        playButton.className = "sc-roll sc-track-button2";
        playImg.className = "sc-svg";
        playImg.appendChild(poly);
        playButton.appendChild(playImg);
        container.appendChild(playButton);
        (function (n) {
            playButton.onclick = function() {TrackButton(PlayList[n],this);};
        }(i));
        SCPlaylistPlayIcons.push(playButton);

        // Title //
        var title = document.createElement("div");
        var titleSpan = document.createElement("span");
        var titleNode = document.createTextNode(PlayList[i].title);
        title.className = "sc-track-title2 sc-text-number";
        titleSpan.appendChild(titleNode);
        title.appendChild(titleSpan);
        container.appendChild(title);


        // Up Button //
        var upButton = document.createElement("div");
        var upImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var upPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        upImg.setAttribute("width","20");
        upImg.setAttribute("height","20");
        upPoly.setAttribute("points","5,12 10,5 15,12");
        upPoly.setAttribute("style","fill:currentColor;");
        upButton.className = "sc-roll sc-playlist-pos sc-playlist-up";
        upImg.className = "sc-svg";
        upImg.appendChild(upPoly);
        upButton.appendChild(upImg);
        container.appendChild(upButton);
        (function (n) {
            upButton.onclick = function() {UpPlaylist(PlayList[n]);};
        }(i));

        // Down Button //
        var downButton = document.createElement("div");
        var downImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var downPoly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        downImg.setAttribute("width","20");
        downImg.setAttribute("height","20");
        downPoly.setAttribute("points","5,8 10,15 15,8");
        downPoly.setAttribute("style","fill:currentColor;");
        downButton.className = "sc-roll sc-playlist-pos sc-playlist-down";
        downImg.className = "sc-svg";
        downImg.appendChild(downPoly);
        downButton.appendChild(downImg);
        container.appendChild(downButton);
        (function (n) {
            downButton.onclick = function() {DownPlaylist(PlayList[n]);};
        }(i));


        // Add Button //
        var addButton = document.createElement("div");
        addButton.className = "sc-roll sc-track-add2";
        var addImg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        addImg.setAttribute("width","20");
        addImg.setAttribute("height","20");
        path.setAttribute("d","M 0 10 L 20 10");
        path.setAttribute("style","stroke:currentColor;stroke-width:2");
        addImg.className = "sc-svg";
        addImg.appendChild(path);
        addButton.appendChild(addImg);
        container.appendChild(addButton);
        (function (n) {
            //var uri = "" + filtered[n].uri + "/stream?client_id=" + ClientID;
            addButton.onclick = function() {AddRemovePlayList(PlayList[n]);};
        }(i));



        // Done, add this to the track list //
        playlist.appendChild(container);
        PlaylistElements.push(container);
    }
    UpdateAddIcons();
    UpdatePlayIcons();
}

function ClearPlaylistFromPage(parent) {
    if (PlaylistElements.length) {
        for (var i=0; i<PlaylistElements.length; i++) {
            parent.removeChild(PlaylistElements[i]);
        }
    }
    PlaylistElements = [];
    SCPlaylistPlayIcons = [];
    SCPlaylistAddIcons = [];
}

//-------------------------------------------------------------------------------------------
//  MATHS
//-------------------------------------------------------------------------------------------


function SecondsToTime(secs) {
    secs = Math.round(secs/1000);
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var string = ""+seconds;
    if (seconds<10) {
        string = "0"+string;
    }

    string = ""+minutes+":"+string;
    if (hours>0) {
        if (minutes<10) {
            string = "0"+string;
        }
        string = ""+hours+":"+string;
    }

    return string;
}