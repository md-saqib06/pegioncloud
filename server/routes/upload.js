const router = require('express').Router();
const multer = require('multer');
const { v4: uuid4 } = require('uuid');
const fs = require('fs');

const randomString = require("randomstring");
const FileSchema = require('../models/FileSchema');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

let upload = multer({
    storage,
    limit: {
        fileSize: 1024 * 1024 * 100 // 100MB
    }
})
// .array('uploadFile', 10);

router.post('/', (req, res) => {
    // Store file
    upload.array('uploadFile', 10)(req, res, async (err) => {


        // Data Validation
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            res.status(500).send({ error: { message: `Multer uploading error: ${err.message}` } }).end();
            return;
        } else if (err) {
            // An unknown error occurred when uploading.
            if (err.name == 'ExtensionError') {
                res.status(413).send({ error: { message: err.message } }).end();
            } else {
                res.status(500).send({ error: { message: `unknown uploading error: ${err.message}` } }).end();
            }
            return;
        }

        // Retrieve uploaded files
        let shortURL = randomString.generate(8);
        let dir = `./uploads/${shortURL}/`;
        let files = req.files;

        fs.mkdir(dir, (err) => {
            if (err) {
                console.log('Unable to create directory!');
            }
            console.log(`${shortURL} Directory Created Succesfully`);
        });

        files.forEach(async (File) => {
            let fileName = File.originalname;
            let newPath = dir + fileName;
            fs.rename(File.path, newPath, (err) => {
                if (err) {
                    console.log('Unable to move file!\n' + err.message);
                }
                console.log(`File moved succesfully to ${newPath}`);
            });

            // console.log("OriginalName: " + fileName);
            // console.log("Path: " + File.path);
            // console.log("Debug: " + File);

            // Store in database
            const file = new FileSchema({
                filename: File.filename,
                path: newPath,
                size: File.size,
                uuid: uuid4()
            });
            file.save();
        });

        // Response -> Download link & QR
        let responseURL = `${process.env.APP_BASE_URL}/f/${shortURL}`;
        // console.log(responseURL);
        return res.json({ downloadURL: responseURL });
    });
});

module.exports = router;