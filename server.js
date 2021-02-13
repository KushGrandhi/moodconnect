const express = require("express");
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use((req, res, next) => {
    res.append("Access-Control-Allow-Origin", ["*"]);
    res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.append("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.raw());
app.use(express.text());

let rooms = [];
let users = [];
let moodsMappedWithUsers = [];


io.on('connection', function (socket) {
    console.log('client connected...');

    socket.on("online", (name) => {
        const obj = new Object();
        obj.name = name
        obj.socket = socket;
        console.log("Oushing new user :", obj)
        users.push(obj);
    });

    socket.on("connect similar moods", (data) => {

    })

    socket.on('join', function (data) {
        console.log(data);
    });

    // webrtc application part
    socket.on("join room", (data) => {
        roomID = data.roomID;
        const mood = data.mood;
        // if (rooms[roomID]) {
        //     rooms[roomID].push({ id: socket.id, mood: mood });
        // } else {
        //     rooms[roomID] = [{ id: socket.id, mood: mood }];
        // }
        // const otherUser = rooms[roomID].find(id => id !== socket.id);
        // if (otherUser) {
        //     socket.emit("other user", otherUser);
        //     socket.to(otherUser).emit("user joined", socket.id);
        // }
        var otherUser = null;
        if (moodsMappedWithUsers[mood]) {
            otherUser = moodsMappedWithUsers[mood][0];
        } else {
            moodsMappedWithUsers[mood] = [];
            moodsMappedWithUsers[mood].push(socket.id)
        }

        if (otherUser) {
            socket.emit("other user", otherUser);
            socket.to(otherUser).emit("user joined", socket.id);
        }
    });
    socket.on("error", (err) => {
        console.log("Caught server socket error: ")
        // console.log(err.stack)
    })

    socket.on("offer", payload => {
        io.to(payload.target).emit("offer", payload);
    });

    socket.on("answer", payload => {
        io.to(payload.target).emit("answer", payload);
    });

    socket.on("ice-candidate", incoming => {
        io.to(incoming.target).emit("ice-candidate", incoming.candidate);
    });
})


var count = 0;
// we can replace name with some kind of unique ID whch can be stored in window object of the client
async function handleMessage(message, name) {
    count++;
    if (count === 5) {  //mocking mood found 
        var mood = "sad";
        count = 0;
        // if (moodsMappedWithUsers[mood]) {
        //     // there is a peer with similar mood so connect with them right now
        //     moodsMappedWithUsers[mood].push(name);
        //     // const user1Name = moodsMappedWithUsers[mood][0];
        //     // const user1Socket = findSocketByUser(user1Name);
        //     // const user2Name = name;
        //     // const user2Socket = findSocketByUser(user2Name);
        //     // user1Socket.emit("start signalling", user2Name);
        // } else {
        //     // there is no peer with similar mood so let them wait for another peer to come
        //     const newMoodArray = [name];
        //     moodsMappedWithUsers[mood] = newMoodArray;
        // }
        const foundUsers = await findSocketByUser(name);
        const foundUser = foundUsers[0];
        if (foundUser) {
            foundUser.socket.emit("set mood", mood);
        }
    }
    return `Response ${count}`


}

app.get("/", (req, res) => {
    res.send("Hi the server is open to requests!");
})

app.post("/", async (req, res) => {
    const body = JSON.parse(req.body);
    console.log("BODY IS ", body);
    const responseMessage = await handleMessage(body.message, body.user);
    res.send(responseMessage);
})

// app.listen(8000, () => console.log("Server is started!!"))
server.listen(8000, () => console.log("Server is started!!"));


async function findSocketByUser(name) {
    let foundUser = null;
    foundUser = users.filter((user) => user.name == name)
    return foundUser;
}