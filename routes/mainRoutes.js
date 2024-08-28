const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const csrf = require("../middlewares/csrf");
const auth = require("../middlewares/auth");
const imageUpload = require("../helpers/image-upload");

router.post("/settings", auth, imageUpload.upload.single("resim"), mainController.post_user_settings);

router.get("/settings", auth, mainController.get_user_settings);

router.get("/:userid", auth, mainController.get_user_chat);

router.get("/", auth, mainController.get_index);


module.exports = router;