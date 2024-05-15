const router = require('express').Router();
const FileSchema = require('../models/FileSchema')

router.get('/:uuid', async (req,res) => {
    try {
        const file = await FileSchema.findOne({ uuid: req.params.uuid });
        if(!file) {
            return res.render('download', { error: 'Link Expired...' });
        }
        return res.render('download', { 
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadpath: file.downloadpath,
            downloadLink: `${process.env.APP_BASE_URL}/f/download/${file.uuid}`
         });
        } catch(err){
        console.log(err.message);
        return res.render('download', { error: 'Unable to fetch files...' });
    }
});

module.exports = router;