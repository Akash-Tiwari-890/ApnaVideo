if(process.env.NODE_ENV !="production"){//WHEN WE ARE AT NOT AT PRODUCTION THAN WE CAN USE ENV FILE OTHERIWISE WE WI;L NOT USE IT
    require('dotenv').config();
}//if the node env is not production then only we will load the .env file


const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const http = require('http');
const { Server } = require("socket.io");
const  session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash"); 
// const MONGO_URL ="mongodb://127.0.0.1:27017/apnavideo";
const dburl =  process.env.ATLASDB_URL;
console.log(dburl);
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");    

const apnavideo = require("./routes/home.js")
main().then(()=>{
    console.log("connected to mongo db");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dburl);
}

const server = http.createServer(app);
const io = new Server(server);

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.static("public"));
app.engine("ejs" , ejsMate);


const store = MongoStore.create({
    mongoUrl: dburl, // Use the same MongoDB URL as above
    crypto :{
        secret: process.env.SECRET ,
       
    },
    touchAfter: 24 * 3600, // How often to update the session in the database (in seconds)
});



store.on("error" , ()=>{
    console.log('ERROR IN MONGOSTORE', err)
})


const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*3,
        maxAge:1000*60*60*24*3,
       
    }

}





app.use(session(sessionOptions));
io.engine.use(session (sessionOptions)); // Socket.IO
app.use(flash());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user; 
    res.locals.success = req.flash("success");
    console.log(res.locals.success);
    res.locals.error = req.flash("error");
    next();
})

app.use("/apnavideo" , apnavideo )



app.get("/", (req, res) => {
    console.log("Root path (/) hit! Redirecting to /listings.");
    res.redirect("/apnavideo"); // This sends the user's browser to the /listings URL
});

// Route handlers

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected with ID: ${socket.id}`);


    socket.on('join-lobby', (data) => {
        const { meetingCode, username } = data;
        
        // 1. Join the room first
        socket.join(meetingCode);
 
        console.log(`User ${username} joined room: ${meetingCode}`);
        
        // 2. Get list of users now that the user has joined
        const roomUsers = io.sockets.adapter.rooms.get(meetingCode);
        console.log('Current room users:', roomUsers);
        const otherUsers = Array.from(roomUsers).filter(id => id !== socket.id);
        console.log(otherUsers);
        
        // 3. Notify the joining user of existing users
        socket.emit('room-users', { users: otherUsers });

        // 4. Notify other users that a new user has joined
        socket.to(meetingCode).emit('user-joined', { userId: socket.id });
    });

     socket.on('chat message', (msg , username) => {
         io.emit('chat message', msg , username);
    console.log('message: ' + msg  , username);
  });

 // ... existing code
socket.on('send_caption', (data) => {
    const { text, username } = data;
    // Find the room the user is in. The `rooms` Set will contain their socket ID and the meeting code.
    const userRoomId = Array.from(socket.rooms).find(room => room !== socket.id);
    
    if (userRoomId) {
        // Broadcast the caption to everyone in that room, excluding the sender
        socket.to(userRoomId).emit('receive_caption', { text, username });
        console.log(`Caption from ${username} in room ${userRoomId}: ${text}`);
    }
});

// Handle WebRTC signaling events
    socket.on('offer', ({ offer, targetUserId }) => {
        io.to(targetUserId).emit('offer', { offer, sourceUserId: socket.id });
    });

    socket.on('answer', ({ answer, targetUserId }) => {
        io.to(targetUserId).emit('answer', { answer, sourceUserId: socket.id });
    });

    socket.on('ice-candidate', ({ candidate, targetUserId }) => {
        io.to(targetUserId).emit('ice-candidate', { candidate, sourceUserId: socket.id });
    });

    // Handle user disconnects
    socket.on('disconnecting', () => {
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        rooms.forEach(room => {
            // Emit 'user-left' to all other users in that room
            socket.to(room).emit('user-left', { userId: socket.id });
        });
        console.log(`User disconnected with ID: ${socket.id}`);
    });
});

server.listen(8000 , ()=>{
    console.log("Server is listening on port 8000");
});

