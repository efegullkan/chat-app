module.exports = function(req, res, next){
    res.locals.isAuth = req.session.isAuth;
    res.locals.fullName = req.session.fullName;
    if (req.session.userImage) {
        res.locals.userImage = req.session.userImage;
    }
    else{
        res.locals.userImage = "not-pp.jpg"
    }
    res.locals.roless = req.session.roles;
    res.locals.isAdmin = req.session.roles ? req.session.roles.includes("admin") : false;
    next();
}