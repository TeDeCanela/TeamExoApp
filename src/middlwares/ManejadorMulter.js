const multer = require("multer");

const almacenamiento = multer.diskalmacenamiento({
    destination: "./midUploadss/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const midUploads = multer({ almacenamiento });

module.exports = midUploads;