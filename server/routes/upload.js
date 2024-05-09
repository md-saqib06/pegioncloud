const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const QRCode = require('qrcode')
const archiver = require('archiver');
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
        
        const zipFileName = `./uploads/${shortURL}/pegioncloud-${shortURL}.tar.gz`;
        const output = fs.createWriteStream(zipFileName);
        const newArchive = archiver('tar', {
            zlib: { level: 9 }
        });

        newArchive.on('error', (req, res) => {
            console.log(err);
        });
        newArchive.pipe(output);
        
        files.forEach(async (File) => {
            let fileName = File.originalname;
            let newPath = dir + fileName;

            fs.rename(File.path, newPath, (err) => {
                if (err) {
                    console.log('Unable to move file!\n' + err.message);
                }
                console.log(`File moved succesfully to ${newPath}`);
            });
            
            // Append files to archive
            newArchive.append(fs.createReadStream(newPath), { name:fileName });
            
            // Store in database
            const file = new FileSchema({
                filename: File.filename,
                downloadpath: zipFileName,
                path: newPath,
                size: File.size,
                uuid: shortURL
            });
            file.save();
        });

        files.forEach((File) => {

        });

        newArchive.finalize();
        // Response -> Download link & QR
        let responseURL = `${process.env.APP_BASE_URL}/f/${shortURL}`;
        // console.log(responseURL);
        QRCode.toString(responseURL,{type:'terminal'}, function (err, url) {
            console.log(url)
          })
        return res.json({ downloadURL: responseURL });
    });
});

router.post('/mail', async (req,res) => {
    const { uuid, senderMail, receiverMail } = req.body;
    // Validate Request
    if(!uuid || !senderMail || !receiverMail) {
        return res.status(422).send({ error: 'All fields are required!' });
    }

    // Fetch Data from Database
    FileSchema.findOne({ uuid: uuid }).then(file => {
    
        if(file.sender) {
            return res.status(422).send({ error: 'Email already sent!' });
        }
        file.sender = senderMail;
        file.receiver = receiverMail;
        // Send Mail
        const sendMail = require('../services/emailService');
        sendMail({ 
            from: senderMail,
            to: receiverMail,
            subject: "PegionCloud File Sharing Service",
            text: `${senderMail} shared a file with you`,
            html: require('../services/emailTemplate')({ 
                senderMail: senderMail, 
                downloadLink: `${process.env.APP_BASE_URL}/f/${file.uuid}`,
                size: parseInt(file.size)/1000 + ' KB',
                expires: '24 hours'
             })
         });
        }).catch(err=>{ error: "Unable to send Mail" });
    return res.send({ success: true });
});

module.exports = router;