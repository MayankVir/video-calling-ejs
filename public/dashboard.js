const socket = io('/');
const chatRooms = document.querySelector(".chatRooms")
const fetchData = () => {
    socket.emit('give-rooms', localStorage.getItem("email"));
    socket.on('take-rooms', async (roomData) => {
    // SHow all the room here left side
        await roomData.forEach( eachRoom => {
            const roomEle = document.createElement('div');
            roomEle.setAttribute("id", eachRoom["id"]);
            roomEle.setAttribute("onClick", `showMsgs(${eachRoom["id"]})`);
            roomEle.setAttribute("class", "room");
            eachRoom["participants"].forEach( eachPart => {
            const p_name = document.createElement("h3")
            p_name.innerText = eachPart;
            roomEle.appendChild(p_name);
            })
            chatRooms.appendChild(roomEle)
        })
    })
}

let roomId;

const showMsgs = async (id) => {
    const parent = document.querySelector(".messages")
    while (parent.firstChild) {
        parent.firstChild.remove()
    }
    roomId = id.id
    socket.emit("give-msgs", (id.id))
    document.querySelector(".meetingAgain").style.opacity = "1";
}

const meeting = () => {
    document.querySelector(".meetingAgain").href = `/${roomId}`;
}

socket.on('take-msgs', (allMsgs)=> {
    const messages = document.querySelector(".messages")
    messages.scrollTop = messages.scrollHeight;
    allMsgs.forEach( eachMsg => {
      const msgBox = document.createElement("div");
      msgBox.setAttribute("class", "msgBox")
      const userHeadingAndTime = document.createElement("div");
      userHeadingAndTime.setAttribute("class", "nameAndTime")
      const userHeading = document.createElement("h4");
      const userTime = document.createElement("p");
      userTime.setAttribute("class", "time")
      const userMsg = document.createElement("div")
    //   userMsg.style.wordWrap = "break-word"
    //   userMsg.style.overflowWrap = "auto"
      userHeading.innerText = eachMsg["name"]
      userHeadingAndTime.append(userHeading)
      userTime.innerText = new Date(parseInt(eachMsg["timestamp"])).toUTCString()
      userHeadingAndTime.append(userTime)
      msgBox.append(userHeadingAndTime)
      userMsg.innerText = eachMsg["message"]
      msgBox.append(userMsg);
      messages.append(msgBox);
    })
})

socket.on('createMessage', msgContent => {
    // $('.messages').append(`<li class="message"> <b> User </b> </br> ${message}</li>`)
    console.log(msgContent)
    scrollToBottom();
})

socket.on('db-updated', (allMsgs) => {
    const messages = document.querySelector(".messages")
    // messages.innerHTML.reload;
    while (messages.firstChild) {
        messages.firstChild.remove()
    }
    allMsgs.forEach( eachMsg => {
        const msgBox = document.createElement("div");
        msgBox.setAttribute("class", "msgBox")
        const userHeadingAndTime = document.createElement("div");
        userHeadingAndTime.setAttribute("class", "nameAndTime")
        const userHeading = document.createElement("h4");
        const userTime = document.createElement("p");
        userTime.setAttribute("class", "time")
        const userMsg = document.createElement("div")
      //   userMsg.style.wordWrap = "break-word"
      //   userMsg.style.overflowWrap = "auto"
        userHeading.innerText = eachMsg["name"]
        userHeadingAndTime.append(userHeading)
        userTime.innerText = new Date(parseInt(eachMsg["timestamp"])).toUTCString()
        userHeadingAndTime.append(userTime)
        msgBox.append(userHeadingAndTime)
        userMsg.innerText = eachMsg["message"]
        msgBox.append(userMsg);
        messages.append(msgBox);
    })
})

let text = $('input');

$('html').keydown( (e) => {
    if(e.which == 13 && text.val().length !== 0) {
        const msgContent = {
            name: localStorage.getItem("name"),
            timestamp: Date.now(),
            message: text.val()
        }
        // const msgRoom = [msgContent, roomI]
        socket.emit('dashboard-message', {msgContent, roomId});
        text.val('');
        // document.getElementsByClassName("messages").innerHTML.reload;
        // console.log(roomId);
    }
});



function signOut() {
    localStorage.clear();
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
    console.log("User signed out.");
    });
}