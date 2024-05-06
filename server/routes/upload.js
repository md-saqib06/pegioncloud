const router = require('express').Router();
const multer = require('multer');
const { v4: uuid4 } = require('uuid');

const FileSchema = require('../models/FileSchema');

const storage = multer.diskStorage({
    destination: (req, files, cb) => {
        cb(null, './uploads')
    },
    filename: (req, files, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, files.filename + '-' + uniqueSuffix)
    }
});

let upload = multer({
    storage,
    limit: {
        fileSize: 1024*1024*100
    }
}).single('uploadFile');

router.post('/', (req, res) => {
    // Store file
    upload(req, res, async (err) => {
        // Data Validation
        if (!req.file) {
            console.log('All feilds are required!');
            return res.json({ error: 'All feilds are required!' });
        }
        
        if(err) {
            console.log(err.message)
            return res.status(500).send({error: err.message});
        }

        // Store in database
        console.log(req.file.filename);
        console.log(req.file.path);
        console.log(req.file.size);

        const file = new FileSchema({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            uuid: uuid4()
        });
        console.log("New Schema object created!");

        // Response -> Download link & QR
        const response = await file.save();
        let responseURL = `${process.env.APP_BASE_URL}/files/${response.uuid}`;
        console.log(response);
        console.log(responseURL);
        return res.json({ file: responseURL});
        // http://localhost:3000/files/a618b3bf-f67f-4c27-ad2f-713a01195c6b
        // TODO: Make the link smaller
    });
    


});

module.exports = router;