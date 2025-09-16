module.exports.home= (req,res)=>{
    res.render("/home/home.ejs");
};

module.exports.link =   (req,res)=>{
    res.render("./home/link.ejs");
   
};

module.exports.loby =  (req, res) => {
    const meetingCode = req.query.meetingCode;
     const guestuser   = req.query.guest
     console.log(guestuser);

    res.render("./home/lobby.ejs", { meetingCode: meetingCode  , guestuser : guestuser});
}

module.exports.call =   (req, res) => {
    const meetingCode = req.params.meetingCode;
    res.render('./home/call.ejs', { meetingCode });
}