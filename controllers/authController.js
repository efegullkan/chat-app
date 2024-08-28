const User = require("../models/user");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const emailService = require("../helpers/send-mail");
const config = require("../config");
const crypto = require("crypto");
const csurf = require("csurf");


exports.get_logout = async function(req, res){
    try {
        await req.session.destroy();
        return res.redirect("/account/login")
    } catch (error) {
        console.log(error)
    }
}

exports.post_reset = async function(req, res){
    const email = req.body.email;
    try {
        const user = await User.findOne({where:{email:email}});
        if(!user){
            req.session.message = { text:"Girdiğiniz email bulunamadı.", class:"warning"};
            return res.redirect("reset-password")
        }
        var token = crypto.randomBytes(32).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + (1000 * 60 * 60);
        await user.save();

        emailService.sendMail({
            from: config.email.from,
            to: email,
            subject: "Şifrenizi Sıfırlayın",
            html:`
            <p>Parolanızı sıfırlamak icin linke <a href="http://localhost:3000/account/new-password/${token}">tıklayınız</a>.</p>
            `
        });

        req.session.message = { text:"Parolanızı sıfırlamak icin e-postanızı kontrol ediniz", class:"success"};
        return res.redirect("login")

    } catch (error) {
        console.log(error)
    }
}

exports.get_reset = async function(req, res){
    const message = await req.session.message;
    delete req.session.message;
    try {
        return res.render("auth/reset-password",{
            message: message
        })
    } catch (error) {
        console.log(error)
    }
}

exports.post_newpassword = async function(req, res){
    const token = req.body.token;
    const userId = req.body.userId;
    const newPassword = req.body.password;
    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration:{
                    [Op.gt] : Date.now()
                },
                id: userId
            }
        });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();
        req.session.message = {text:"Parolanız başarıyla güncellendi, giriş Yapabilirsiniz.", class:"success"};
        return res.redirect("login");
    } catch (error) {
        console.log(error)
    }
}

exports.get_newpassword = async function(req, res){
    const token = req.params.token;

    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration:{
                    [Op.gt] : Date.now()
                }
            }
        });
        if(!user){
            req.session.message = { text:"Bu bağlantı kullanılmış veya hatalı.", class:"warning"};
            res.redirect("/account/login");
        }
        return res.render("auth/new-password",{
            title: "new-password",
            token: token,
            userId: user.id
        })
    } catch (error) {
        console.log(error)
    }
}

exports.post_register = async function(req, res){
    const name = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.findOne({ where:{email:email}});
    if(user){
        req.session.message = { text:"Girdiğiniz email adresi ile daha önce kayıt olunmuş.", class:"warning"};
        return res.redirect("register")
    }
    try {
        const newUser = await User.create({
            fullname: name,
            email: email,
            password: hashedPassword
        });
        await newUser.addRole(2);
        req.session.message = { text:"Başarıyla kayıt oldunuz lütfen hesabınıza giriş yapın", class:"primary"};
        res.redirect("login");
    } catch (error) {
        console.log(error)
    }
}

exports.get_register = async function(req, res){
    try {
        const message = req.session.message || '';
        delete req.session.message;
        return res.render("auth/register", {
            message: message
        })
    } catch (error) {
        console.log(error)
    }
}

exports.post_login = async function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ where: {email: email} });
        if (!user) {
            return res.render("auth/login",{
                message : { text:"Email veya Parola hatalı.", class:"warning"},
                csrfToken: req.csrfToken()
            })
        }

        // parola kontrolü
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const userRoles = await user.getRoles({
                attributes: ["roleName"],
                raw: true
            })
            req.session.roles = userRoles.map((role) => role["roleName"])
            req.session.isAuth = true;
            req.session.fullName = user.fullname;
            req.session.userId = user.id;
            req.session.userImage = user.resim;
            return res.redirect("/");
        }
        return res.render("auth/login",{
            message : { text:"Email veya Parola hatalı.", class:"warning"},
            csrfToken: req.csrfToken()
        })
    } catch (error) {
        console.log(error)
    }
}

exports.get_login = async function(req, res){
    const message = req.session.message || '';
    delete req.session.message;
    try {
        return res.render("auth/login",{
            message: message
        })
    } 
    catch (error) {
        console.log(error)
    }
}
