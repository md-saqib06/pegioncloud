const router = require('express').Router();
const FileSchema = require('../models/FileSchema')

router.get('/:uuid', async (req,res) => {
        const file = await FileSchema.findOne({ uuid: req.params.uuid });
        if(!file) {
            return res.sendFile(path.join(__dirname, '../../client/views/download.html'));
        }
        const filePath = `${__dirname}/../${file.downloadpath}`;
        res.download(filePath);
});

module.exports = router;