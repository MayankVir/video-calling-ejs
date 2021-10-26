# [Hola👋- Video Calling application 🎥]( https://meet-n-greet.herokuapp.com/home  )

#### Hola👋 -  A video conferencing and web chat application using WebRTC, Javascript and Web-sockets with unique features such as Be Right Back, Scratchy Pad and Messaging!

<!-- ![alt text](https://github.com/ankita1964/MS_Teams_Clone/blob/master/Screenshot%202021-07-10%20at%201.43.44%20AM.png "Video Calling")   -->
<img width="1440" alt="Screenshot 2021-07-13 at 2 59 51 AM" src="https://user-images.githubusercontent.com/58811776/125358799-03df7b80-e387-11eb-94b0-4544835321b0.png">

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
### The Method - Agile Methodology!  
- [x] **Planning** 📝
- [x] **Designing** ✍️
- [x] **Developing** 👩‍💻
- [x] **Testing** ⚠️
- [x] **Debugging** 🔄
- [x] **Mentor Feedback** 👨‍🏫

     ![image](https://user-images.githubusercontent.com/58811776/125402550-2a76d400-e3d2-11eb-9e40-b9f916597e6c.png)


------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Languages Used:
- **Backend**- NodeJs, ExpressJs
- **Database**- MongoDb & Local Storage
- **Frontend**- EJS, CSS, JavaScript   

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Demo
-   `Open` https://meet-n-greet.herokuapp.com
-   `Pick` your personal Room name and `Join To Room`
-   `Allow` to use the camera and microphone
-   `Share` the Room URL and `Wait` someone to join for video conference

## Quick Setup
-   You will need to have [Node.js](https://nodejs.org/en/blog/release/v12.22.1/) installed
-   Fork this repository and Clone this repo

## Installing Libraries
- Run `npm i` to install all necessary packages

## Start the server

```js
npm start
```

-  Open http://localhost:3030 in browser

---

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Features
- Entirely browser based
- Unlimited number of conference rooms without call time limitation
- WebCam Streaming
- Audio Streaming
- Hassle Free Login
- Direct peer-to-peer connection ensures lowest latency all thanks to webrtc
- Cool UI Design
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## What makes Hola 👋 different?

🔴 The Be Right Back Button 🔙 - Want to leave the meeting for a couple of meetings along with informing everyone? Worry not! Just Press the BRB button our application which automatically turns off user's video and audio and displays "Be Right Back" on the user's video!

🔴 Scratchy Pad 🗒️ - Felt the need of jotting down important points during an online mat without switching tabs or arranging a pen and paper, you are good to go then! The application offers scratchy notepad, your own personal digital notebook, where you can write anything and everything during the meeting!

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Work flow of Project:

   ![image](https://user-images.githubusercontent.com/58811776/125174687-d8249000-e1e4-11eb-9b70-94c73a8927a0.png)
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
## Client Side
- Browser sends request for authentication to server 
- An ID token is generated which is used to authorise the client
- The browser sends a connection request to open a socket connection 
- The streams of different users are transferred over PeerToPeer Connection over Internet
- The clients receives the video streams and responds with it's own stream
 
   ![image](https://user-images.githubusercontent.com/58811776/125208432-e390bd80-e2af-11eb-9dac-678b0e6fc70d.png).
   
## Server Side
- The servers receives authentication request from the client 
- It authorises the user using Google Authentication and generates an ID token
- Next Step, The server receives a socket opening connection request and user joins the room
- The stream of the user is transferred over PeerToPeer connection via server
- The chat messages and the room details are stored in MongoDB Database 
- The Dashboard of the application displays the previous calls and text messages

     ![image](https://user-images.githubusercontent.com/58811776/125208422-d7a4fb80-e2af-11eb-95dc-a7c4e418a734.png)
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Future Improvements 🎯
- Making it mobile and tablet responsive
- Implementing Emoji Picker in chat and Raise Hand Feature
- Implementing Sharing File Feature
- Extending the application to enable 5+ people
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# References 📚
- Web Dev Simplified
- Clever Programmer
- Font Awesome
- Traversy Media
- Hitesh Chaudhary
- Dev Ed
- CodeWithHarry
