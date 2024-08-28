module.exports = (req, res, next) => {
    if (!req.session.isAuth) {
        return res.redirect("/account/login?returnUrl=" + req.originalUrl);
    }

    if(!req.session.roles.includes("admin")){
        req.session.message = {text: "Yetkili bir kullanıcı ile oturum acınız", class: "warning"};
        return res.redirect("/account/login?returnUrl=" + req.originalUrl);
    }
    next();
}