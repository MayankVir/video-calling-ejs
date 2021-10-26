// Initialised the socketio with the address of root
const socket = io('/');

// Picking up the div element from HTML in which video element will be appended
const videoGrid = document.getElementById('video-grid1');

//Hardcoded the width and height of the video obtained from the stream
let constraints = {
    width: { ideal: 850 },
    height: { ideal: 500 },
    aspectRatio: { ideal: 1.75 },
}

let currentPeer;

//Initialised the peer object for establishing connection ahead
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})


const peers = {}
let myVideoStream;
const myVideo = document.createElement(`video`);
myVideo.muted = true;

//Displays the time and date on top left of the screen
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let today = new Date();
let date = today.getDate() + " " + monthNames[today.getMonth()] + " " + today.getFullYear();
let time = (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) + " : " + today.getMinutes();
console.log(date + " and " + time);
document.querySelector(".dateAndTime").textContent = time + " | " + date;

setInterval(() => {
    let today = new Date();
    let date = today.getDate() + " " + monthNames[today.getMonth()] + " " + today.getFullYear();
    let time = (today.getHours() < 10 ? "0" + today.getHours() : today.getHours()) + " : " + today.getMinutes() + " : " + today.getSeconds();
    document.querySelector(".dateAndTime").textContent = time + " | " + date;
}, 1000)



const roomDetails = document.querySelector(".roomDetails");
const roomIdLink = document.createElement("h3")
roomIdLink.innerText = ROOM_ID
roomDetails.append(roomIdLink)



// Function takes two properties video and audio and with respect to that returns
// a promise which if resolved will give us the stream else it will give us an error
navigator.mediaDevices.getUserMedia({
    video: constraints,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);


    // The function allows the guest to accept the call made by the host and returns
    // the stream to the host
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
            currentPeer = call.peerConnection;
        })
    })

    // This function is triggered when a new user gets connected and further connectToNewUser
    // function is called
    socket.on('user-connected', (userId) => {
        setTimeout(() => {
            connectToNewUser(userId, stream);
        }, 1000);
    })

    // This socket is trigerred when a new message
    // is to be added in the chatbox
    socket.on('createMessage', msgContent => {
        new Date(parseInt(msgContent["timestamp"])).toUTCString();
        $('.messages').append(`<li class="message"> <b> ${msgContent["name"]} </b> 
        <span class="time">${new Date(parseInt(msgContent["timestamp"])).toUTCString()}</span> <br> ${msgContent["message"]}</li>`)
        // console.log(msgContent)
        scrollToBottom();
    })
})

// This socket is trigerred when any user disconnects
// the call
socket.on('user-disconnected', (userId) => {
    // console.log(userId);
    if (peers[userId]) peers[userId].close();
})

// Peer connection opens when new user joins the meeting
peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id, userEmail);
})


// Function is triggered when the user wants to share the screen
const screenshare = () => {
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "always"
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true
        }
    }).then((stream) => {
        let videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => {
            stopScreenShare(); 
        }
        let sender = currentPeer.getSenders().find((s) => {
            return s.track.kind == videoTrack.kind 
        })
        sender.replaceTrack(videoTrack)
    }).catch((err) => {
        console.log("unable to get display media");
    })
}

// Function is triggered when the user stops sharing the screen
const stopScreenShare = () => {
    let videoTrack = myVideoStream.getVideoTracks()[0]   
    let sender = currentPeer.getSenders().find((s) => {
        return s.track.kind == videoTrack.kind 
    })
    sender.replaceTrack(videoTrack)
}



// Function is triggered when the socket connection is established and 
// the new user is called through peer connection with our stream and 
// in return gives the host it's stream
const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
        currentPeer = call.peerConnection
    })

    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call
}

// Function is triggered to add the video stream on the screen
const addVideoStream = (video, stream) => {
    const outerVideo = document.createElement("div")
    outerVideo.classList.add("outerVideo")
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    outerVideo.append(video);
    const brb = document.createElement("h2");
    brb.innerText = "Be Right Back"
    brb.classList.add("brbCenter")
    outerVideo.append(brb);
    videoGrid.append(outerVideo)
    let videoParent = document.getElementById("video-grid1")
    let childVideos = videoParent.getElementsByTagName('video');
    if(childVideos.length == 2) {
        childVideos[0].style.width = "450px"
        childVideos[0].style.height = "265px"
        childVideos[0].style.marginRight = "25px"

        childVideos[1].style.width = "750px"
        childVideos[1].style.width = "450px"
        // if (people == 1) people++
    }
}

// Captures the text value from the input tab in the chatbox
let text = $('input');

$('html').keydown( (e) => {
    if(e.which == 13 && text.val().length !== 0) {
        const msgContent = {
            name: localStorage.getItem("name"),
            timestamp: Date.now(),
            message: text.val()
        }
        socket.emit('message', msgContent);
        text.val('');
    }
});

const scrollToBottom = () => {
    let d = $('.messages');
    d.scrollTop(d.prop("scrollHeight"));
}

// Function toggles the mute/unmute functionality
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setMuteButton();
    } else {
        setUnmuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}


// Function sets the mute button to unmute
const setUnmuteButton = () => {
    const ele = `<i class="fas fa-microphone"></i>`;
    document.querySelector(".audio").innerHTML = ele;
    document.querySelector(".audio").style.backgroundColor = "transparent";
}

// Function sets the unmute button to mute
const setMuteButton = () => {
    const ele = `<i class="fas fa-microphone-slash"></i>`;
    document.querySelector(".audio").innerHTML = ele;
    document.querySelector(".audio").style.backgroundColor = "#e63023";
}

// Function toggles the Video play/stop functionality
const playStopVideo = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        stopButton();
    } else {
        playButton();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

// Function sets the video off to on
const playButton = () => {
    const ele = `<i class="fas fa-video"></i>`;
    document.querySelector(".video").innerHTML = ele;
    document.querySelector("video").style.opacity = "1";
    document.querySelector(".video").style.backgroundColor = "transparent";

}

// Function sets the video on to off
const stopButton = () => {
    const ele = `<i class="fas fa-video-slash"></i>`;
    let videoElement = document.querySelector("video");
    videoElement.style.opacity = "0.5";
    // document.querySelector("h3").style.opacity = "1";
    document.querySelector(".video").innerHTML = ele;
    document.querySelector(".video").style.backgroundColor = "#e63023";
}

if (document.querySelector(".tile").length == 2) {
    document.querySelector("h3").style.marginLeft = "3em"
}

// Function toggles the Be Right Back functionality
let brbToggle = false;
const brbButton = () => {
    if (brbToggle == false) {
        const enabled1 = myVideoStream.getVideoTracks()[0].enabled;
        if (enabled1) {
            myVideoStream.getVideoTracks()[0].enabled = false;
            let videoElement = document.querySelector("video");
            videoElement.style.opacity = "0.5";
            document.querySelector(".brbCenter").style.opacity = "1";
            stopButton();
        }

        const enabled2 = myVideoStream.getAudioTracks()[0].enabled;
        if (enabled2) {
            myVideoStream.getAudioTracks()[0].enabled = false;
            setMuteButton();
        }

        document.querySelector(".brb").style.background = "#e63023";
        brbToggle = true;
    }
    else {
        const enabled1 = myVideoStream.getVideoTracks()[0].enabled;
        if (!enabled1) {
            myVideoStream.getVideoTracks()[0].enabled = true;
            document.querySelector("video").style.opacity = "1";
            document.querySelector(".brbCenter").style.opacity = "0";
            playButton();
        }

        const enabled2 = myVideoStream.getAudioTracks()[0].enabled;
        if (!enabled2) {
            myVideoStream.getAudioTracks()[0].enabled = true;
            setUnmuteButton();
        }
        document.querySelector(".brb").style.background = "transparent";
        brbToggle = false;
    }
}