const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const http = require('http');
const { Server } = require("socket.io");
const  session = require("express-session");
const flash = require("connect-flash"); 
const MONGO_URL ="mongodb://127.0.0.1:27017/apnavideo";
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");    
main().then(()=>{
    console.log("connected to mongo db");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const server = http.createServer(app);
const io = new Server(server);

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.static("public"));
app.engine("ejs" , ejsMate);
const sessionOptions={
    secret:"mysupersecret",
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


// Route handlers
app.get("/apnavideo" , (req,res)=>{
    res.render("Home/home");
});

app.get("/apnavideo/register" , (req,res)=>{
    res.render("users/signup");
});

app.get("/apnavideoconfrencing/login" , (req,res)=>{
    res.render("users/login");
});

app.get("/apnavideo/link"  , isLoggedIn ,   (req,res)=>{
    res.render("Home/link");
   
});

app.get("/apnavideo/loby", isLoggedIn ,  (req, res) => {
    const meetingCode = req.query.meetingCode;
     const guestuser   = req.query.guest
     console.log(guestuser);

    res.render("Home/lobby", { meetingCode: meetingCode  , guestuser : guestuser});
});

app.get('/apnavideo/call/:meetingCode', isLoggedIn , (req, res) => {
    const meetingCode = req.params.meetingCode;
    res.render('Home/call', { meetingCode });
});



app.post("/apnavideo/register" , async(req,res)=>{
    console.log(req.body);
    let {username , email , password} = req.body;
    const user = new User({username , email}); 
   const reguser =  await User.register(user , password ) 
   console.log(reguser);
   req.login(reguser , (err)=>{
    if(err){
        return next(err);
    }
    req.flash("success"  , "User Registered Sucesfully");
     res.redirect("/apnavideo") 
        
   })
  
});

app.post("/apnavideo/login", passport.authenticate('local', { failureredirect: "/login", failureFlash: true }), async (req, res) => {
    req.flash("success" , "Welcome Back to apnavideo confrencing");
    res.redirect("/apnavideo" );    
});



app.get("/apnavideo/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged Out Successfully"); // ✅ Still inside session context
    res.redirect("/apnavideo");
  });
});






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

// ... existing code

  
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