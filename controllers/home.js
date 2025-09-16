module.exports.home= (req,res)=>{
    res.render("home/home");
};

module.exports.link =   (req,res)=>{
    res.render("home/link");
   
};

module.exports.loby =  (req, res) => {
    const meetingCode = req.query.meetingCode;
     const guestuser   = req.query.guest
     console.log(guestuser);

    res.render("home/lobby", { meetingCode: meetingCode  , guestuser : guestuser});
}

module.exports.call =   (req, res) => {
    const meetingCode = req.params.meetingCode;
    res.render('home/call', { meetingCode });
}