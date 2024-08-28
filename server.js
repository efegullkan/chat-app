    const express = require("express");
    const http = require('http');
    const app = express();
    const socket = require("socket.io");
    const path = require("path");
    const sequelize = require("./data/db");
    const locals = require("./middlewares/locals");
    const bodyParser = require("body-parser");
    const cookieParser = require("cookie-parser");
    const session = require("express-session");
    const SequelizeStore = require("connect-session-sequelize")(session.Store);
    const csurf = require("csurf");

    // View engine ayarı
    app.set("view engine", "ejs");

    // Statik dosyalar için ayar
    app.use("/static", express.static(path.join(__dirname, "public")));

    // Middleware'ler
    app.use(cookieParser());
    const sessionMiddleware = session({
        secret: "6d7ef16b-e296-4cd3-9783-3234471cdc76",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 30
        },
        store: new SequelizeStore({
            db: sequelize
        })
    })

    app.use(sessionMiddleware)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // CSRF koruma middleware'i
    app.use(csurf());

    // CSRF tokenini view'lere gönderme
    app.use((req, res, next) => {
        res.locals.csrfToken = req.csrfToken();
        next();
    });

    // Locals middleware'i
    app.use(locals);

    // Routerlar
    const authRoutes = require("./routes/authRoutes");
    const mainRoutes = require("./routes/mainRoutes");
    app.use("/", mainRoutes);
    app.use("/account", authRoutes);

    const fileUpload = require("./helpers//file-upload");
    app.post('/upload', fileUpload.upload.single("file"), (req, res) => {
        res.json({ filePath: `/messageFiles/${req.file.filename}` });
    });

    // Sunucuyu başlatma
    const server = app.listen(3000, function() {
        
    });

    // Socket.IO'yu HTTP sunucusuna ekleme


    // DATABASE TANIMLAMALARI
    const User = require("./models/user");
    const Role = require("./models/role");
    const Message = require('./models/messages');

    Role.belongsToMany(User, {through: "userRoles"});
    User.belongsToMany(Role, {through: "userRoles"});

    User.hasMany(Message, { foreignKey: 'senderId' });
    User.hasMany(Message, { foreignKey: 'recipientId' });

    const io = socket(server);



    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });

    io.on('connection', async (socket) => {
        const session = socket.request.session;
        if (session) {
            const userId = session.userId;
            await User.update({ socketId: socket.id }, {
                where: { id: userId }
            });
            await User.update({ isOnline: true, lastActive: null}, {
                where: { id: userId }
            });
            const undeliveredMessages = await Message.findAll({
                where: {
                    recipientId: userId,
                    isDelivered: false,
                }
            });
            undeliveredMessages.forEach(async (msg) => {
                const message = msg.message;
                const filePath = msg.filePath;
                const senderId = msg.senderId;
                const recipientId = msg.recipientId;
                if(filePath){
                    setTimeout(async () => {
                        await io.to(socket.id).emit('chat message', { filePath, senderId, recipientId });
                        msg.isDelivered = true;
                        await msg.save();
                    }, 300);
                }
                else{
                    setTimeout(async () => {
                        await io.to(socket.id).emit('chat message', { message, senderId, recipientId });
                        msg.isDelivered = true;
                        await msg.save();
                    }, 300);
                }
                
            });
            io.emit('user status update', { userId, isOnline: true });

            socket.on('private message', async (data) => {
                const { recipientId, message } = data;
                
                const recipient = await User.findOne({ where: { id: recipientId } });
                const senderId = userId;
                    // Alıcıya mesajı gönder
                    if (recipient.socketId) {
                        // Alıcı aktifse mesajı doğrudan ilet
                        io.to(recipient.socketId).emit('chat message', { message, senderId, recipientId, status: 'send'});
                        io.to(socket.id).emit('chat message', { message, senderId, recipientId, status: 'send' });
                    } else {
                        await Message.create({
                            message,
                            senderId,
                            recipientId,
                            isDelivered: false,
                        });
                        io.to(socket.id).emit('chat message', { message, senderId, recipientId , status: 'not-send'});
                    }
                    
            });

            socket.on('sendMedia', async (data) => {
                const { filePath, type, recipient } = data;
                const senderId = userId;
                const recipientt = await User.findOne({ where: { id: recipient } });
                if(recipientt.socketId){
                    io.to(recipientt.socketId).emit('receiveMedia', {filePath, type, recipient, status: 'send', senderId});
                    io.to(socket.id).emit('receiveMedia', {filePath, type, recipient, status: 'send', senderId});
                }
             else {
                    await Message.create({
                        filePath,
                        senderId,
                        recipientId: recipient,
                        isDelivered: false,
                    });
                    io.to(socket.id).emit('chat message', { filePath, senderId, recipient, status: 'not-send'});
                }
            });

            socket.on('reading message', async (data) => {
                const { readedUser, userId } = data;
                const readedUserDetail = await User.findOne({ where: { id: readedUser } });
                
                io.to(readedUserDetail.socketId).emit('read message', { readedUser, userId});                   
            });
            
            // Handle disconnection
            socket.on('disconnect', async () => {
                await User.update({ socketId: null }, {
                    where: { id: userId }
                });
                await User.update({ isOnline: false, lastActive: new Date()}, {
                    where: { id: userId }
                });
                // Diğer kullanıcılara çevrimdışı olan kullanıcıları güncelleyin
                io.emit('user status update', { userId, isOnline: false, lastActive: new Date()  });
            });
        } else {
            socket.disconnect(); // Disconnect if no session
        }
    });

    // DATABASE OLAYLARI
    const dummyData = require("./data/dummy-data");
    (async () => {
        await sequelize.sync({ force: true });
        await dummyData();
    })();
