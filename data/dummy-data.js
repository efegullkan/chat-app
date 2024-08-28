const slugField = require("../helpers/slugfield");
const User = require("../models/user");
const Role = require("../models/role");
const bcrypt = require("bcryptjs");

async function populate() {
    const count = await User.count();

    if(count == 0) { 
        const users = await User.bulkCreate([
            {
                fullname: "User1",
                password: await bcrypt.hash("123456", 10),
                email: "info@user1.com",
                resim: "men.png"
            },
            {
                fullname: "User2",
                password: await bcrypt.hash("123456", 10),
                email: "info@User2.com",
                resim: "men.png"
            },
            {
                fullname: "User3",
                password: await bcrypt.hash("123456", 10),
                email: "info@User3.com",
                resim: "woman.png"
            },
            {
                fullname: "User4",
                password: await bcrypt.hash("123456", 10),
                email: "info@User4.com",
                resim: "men.png"
            }
        ]);

        const roles = await Role.bulkCreate([
            {roleName: "admin"},
            {roleName: "user"}
        ])
        await users[0].addRole(roles[0]);
        await users[1].addRole(roles[1]);
        await users[2].addRole(roles[1]);
        await users[3].addRole(roles[1]);
        await users[3].addRole(roles[0]);
    }
}

module.exports = populate;