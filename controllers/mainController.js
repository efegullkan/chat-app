const User = require("../models/user");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const emailService = require("../helpers/send-mail");
const config = require("../config");
const crypto = require("crypto");
const csurf = require("csurf");



exports.post_user_settings = async function(req, res){
    try {
        const fullname = req.body.fullname;
        const userid = req.session.userId;
        const user = await User.findByPk(userid);
        if (Array.isArray(fullname)) {
            user.fullname = fullname.join(" ");
            req.session.fullName = fullname.join(" "); // Diziyi boşluk ile birleştir
        } else {
            user.fullname = String(fullname);
            req.session.fullName = String(fullname); // Dizi değilse, sadece stringe dönüştür
        }
        
        if (req.file) {
            req.session.userImage = req.file.filename
            user.resim = req.file.filename
        }
        await user.save();
        return res.render("main/settings",{
            user: user
        })
    } 
    catch (error) {
        
    }
}

exports.get_user_settings = async function(req, res){
    try {
        const userid = req.session.userId;
        const user = await User.findByPk(userid);
        return res.render("main/settings",{
            user: user
        })
    } 
    catch (error) {
        
    }
}

exports.get_user_chat = async function(req, res){
    try {
        const userid = req.params.userid;
        if (userid) {
            const users = await User.findAll({
                attributes: {
                    exclude: ['email', 'password', 'resetToken', 'resetTokenExpiration']
                },
                where: {
                  id: {
                    [Op.ne]: req.session.userId
                  }
                }
              });
            const user = await User.findByPk(userid);
            let userStatus;
            if (user) {
                if (user.isOnline){
                    userStatus = "online"
                }
                else{
                    if (user.lastActive) {
                        const now = new Date();
                        const diffInSeconds  = Math.floor((now - user.lastActive) / 1000); // farkı saniye cinsinden hesapla
            
                       
                        if (diffInSeconds < 60) {
                            userStatus = `${diffInSeconds} saniye önce aktifti`;
                        } else if (diffInSeconds < 3600) {
                            userStatus = `${Math.floor(diffInSeconds / 60)} dakika önce aktifti`;
                        } else if (diffInSeconds < 86400) {
                            userStatus = `${Math.floor(diffInSeconds / 3600)} saat önce aktifti`;
                        } else {
                            userStatus = `${Math.floor(diffInSeconds / 86400)} gün önce aktifti`;
                        }
                    } else {
                        userStatus = 'offline'
                    }
                   
                }
            }
            
            
            const userr = user || '';
            return res.render("main/index",{
                users: users,
                user: userr,
                userId: req.session.userId,
                userStatus: userStatus
            })
        } else {
            res.redirect('/')
        }
        
    } 
    catch (error) {
        
    }
}

exports.get_index = async function(req, res){
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ['email', 'password', 'resetToken', 'resetTokenExpiration']
            },
            where: {
              id: {
                [Op.ne]: req.session.userId
              }
            }
          });
        return res.render("main/index",{
            users: users,
            user: '',
            userId: req.session.userId
        })
    } 
    catch (error) {
        
    }
}