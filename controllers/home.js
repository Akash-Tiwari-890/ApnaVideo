module.exports.home= (req,res)=>{
    res.render("Home/home");
};

module.exports.link =   (req,res)=>{
    res.render("Home/link");
   
};

module.exports.loby =  (req, res) => {
    const meetingCode = req.query.meetingCode;
     const guestuser   = req.query.guest
     console.log(guestuser);

    res.render("Home/lobby", { meetingCode: meetingCode  , guestuser : guestuser});
}

module.exports.call =   (req, res) => {
    const meetingCode = req.params.meetingCode;
    res.render('Home/call', { meetingCode });
}