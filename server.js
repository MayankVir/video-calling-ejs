const express = require("express")
const app = express();
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const {nanoid} = require("nanoid")
const { ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
const mongoose = require('mongoose');

const {OAuth2Client} = require('google-auth-library');
const cookieParser = require("cookie-parser");
const { strict } = require("assert");
const CLIENT_ID = "401680115319-ljth2d92o4tt9uboa3ffmsnc8fia707f.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);


app.use('/peerjs', peerServer);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

const mongoUri = "mongodb+srv://chatdb:chatdbpassword@cluster0.ztadu.mongodb.net/teamsDb?retryWrites=true&w=majority&ssl=true";

const mongoConnect = async () => {
    await mongoose.connect(mongoUri, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Connected to database");
    }).catch(err => {
        console.log("Database error")
    })
} 

mongoConnect();

const roomSchema = mongoose.Schema({
    id: String,
    participants: [String]
})

const chatMsgSchema = mongoose.Schema({
    id:String,
    content: [{
        name: String,
        timestamp: String,
        message: String
    }]
})


const ChatMsg = mongoose.model('ChatMsg', chatMsgSchema)
const Room = mongoose.model('Room', roomSchema)


app.get('/', (req,res) => {
    res.redirect("home");
    // res.redirect(`/${uuidv4()}`);
})

app.get("/home", (req,res) => {
    res.render("home");
})
const checkAuthenticated = (req,res,next) => {
    let token = req.cookies['session-token'];

    let user = {}
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        // const userid = payload['sub'];  
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(() => {
        req.user = user;
        next();
      })
      .catch(err => {
          res.redirect('/login');
      });
}

const checkAuthenticatedRedirect = (req,res,next) => {
    let token = req.cookies['session-token'];

    let user = {}
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
      }
      verify()
      .then(() => {
        req.user = user;
        res.redirect('/dashboard');
    })
    .catch(err => {
        next();
      });
}

app.get("/dashboard", checkAuthenticated, (req,res) => {
    res.render("dashboard");
})

app.get("/login", checkAuthenticatedRedirect, (req,res) => {
    res.render("login")
})

app.post("/login", (req,res) => {
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];  
      }
      verify()
      .then(() => {
          res.cookie('session-token', token);
          res.send("success");
      })
      .catch(console.error);
})

app.get("/logout", (req,res) => {
    res.clearCookie('session-token');
    res.redirect("/home");
})


app.get("/newRoom", checkAuthenticated, (req, res) => {
    res.redirect(`/${nanoid(5)}`)
})


app.get("/joinRoom", checkAuthenticated, (req, res) => {
    res.redirect(`/${req.query.joinRoomId}`)
})


app.get('/:room', checkAuthenticated, (req,res) => {
    res.render('room', { roomId: req.params.room})
})


io.on('connection', socket => {
    // console.log(socket)
    socket.on('join-room', async (roomId, userId, userEmail) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        const roomData = await Room.find();
        // console.log(roomData)
        if(roomData.length > 0) {
            let flag=false;
            for(let idx=0; idx<roomData.length; idx++) {
                if(roomData[idx]["id"] == roomId) {        
                    // Update the users here
                    const participantsList = roomData[idx]["participants"]
                    participantsList.push(userEmail);
                    // console.log(participantsList);
                    let newDoc = await Room.findOne({id:roomId})
                    newDoc.set({
                        participants: participantsList
                    })
                    await newDoc.save();
                    flag = true;
                    // roomDataLog();
                }
            } 
            if(!flag) {
                await Room.create({
                    id: roomId,
                    participants: [userEmail]
                });
            }
        } 
        else {
            await Room.create({
                id: roomId,
                participants: [userEmail]
            });
        }
        // await roomDataLog();

        socket.on('message', async (msgContent) => {
            io.to(roomId).emit('createMessage', msgContent);
            const allRooms = await ChatMsg.find();
            if(allRooms.length == 0) {
                await ChatMsg.create({
                    id: roomId,
                    content: {
                        name: msgContent["name"],
                        timestamp: msgContent["timestamp"],
                        message: msgContent["message"]
                    }
                });
                console.log("Message inserted in database")
            }
            else {
                let flag=false;
                // console.log(allRooms)
                for(let idx=0; idx<allRooms.length; idx++) {
                    if(allRooms[idx]["id"] == roomId) {        
                        // Update the Chat here
                        const msgList = allRooms[idx]["content"]
                        // console.log(msgList)
                        const newMsg = {
                            name: msgContent["name"],
                            timestamp: msgContent["timestamp"],
                            message: msgContent["message"]
                        }
                        msgList.push(newMsg);
                        // console.log(msgList);
                        let newDoc = await ChatMsg.findOne({id:roomId})
                        newDoc.set({
                            content: msgList
                        })
                        await newDoc.save();
                        flag = true;
                        // roomDataLog();
                    }
                    // console.log("Message updated");
                } 
                if(!flag) {
                    await ChatMsg.create({
                        id: roomId,
                        content: {
                            name: msgContent["name"],
                            timestamp: msgContent["timestamp"],
                            message: msgContent["message"]
                        }
                    });
                }
            }
        })

        
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
    socket.on('give-rooms', async (userEmail)=> {
        const userExistsRoom = await Room.find({
            participants: userEmail
        }).lean();
        // console.log(userExistsRoom)
        socket.emit('take-rooms', userExistsRoom)
    })

    socket.on('give-msgs', async (id) => {
        const chatMsgs = await ChatMsg.find({id: id}).lean();
        socket.emit('take-msgs', chatMsgs[0]["content"]) 
    })

    socket.on('dashboard-message', async ({msgContent, roomId})=> {
        const allRooms = await ChatMsg.find();
        if(allRooms.length == 0) {
            await ChatMsg.create({
                id: roomId,
                content: {
                    name: msgContent["name"],
                    timestamp: msgContent["timestamp"],
                    message: msgContent["message"]
                }
            });
            console.log("Message inserted in database")
        }
        else {
            let flag=false;
            // console.log(allRooms)
            for(let idx=0; idx<allRooms.length; idx++) {
                if(allRooms[idx]["id"] == roomId) {        
                    // Update the Chat here
                    const msgList = allRooms[idx]["content"]
                    // console.log(msgList)
                    const newMsg = {
                        name: msgContent["name"],
                        timestamp: msgContent["timestamp"],
                        message: msgContent["message"]
                    }
                    msgList.push(newMsg);
                    // console.log(msgList);
                    let newDoc = await ChatMsg.findOne({id:roomId})
                    newDoc.set({
                        content: msgList
                    })
                    await newDoc.save();
                    flag = true;
                    // roomDataLog();
                } 
                // console.log("Message updated");
            } 
            if(!flag) {
                await ChatMsg.create({
                    id: roomId,
                    content: {
                        name: msgContent["name"],
                        timestamp: msgContent["timestamp"],
                        message: msgContent["message"]
                    }
                });
            }
        }
        const allChats = await ChatMsg.find({id: roomId});
        socket.emit("db-updated", allChats[0]["content"])
        // console.log(allChats[0]["content"])
    })
})


server.listen(process.env.PORT || 3030);