const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const config = require('../../config/main')

console.log('secret: ', config.awsSecret, 'key', config.awsKey)

aws.config.update({
    secretAccessKey: config.awsSecret,
    accessKeyId: config.awsKey,
    region: 'us-east-1'
})
const s3 = new aws.S3()

const upload = multer({
    storage: multerS3({
        s3,
        acl: 'public-read',
        bucket: 'dnd-turntracker-aws',
        key: (req, file, cb) => {
            console.log('Uploading file to AWS:', file)
            cb(null, Date.now() + file.originalname)
        }
    })
    // limits: {
    //     fileSize: 1024 * 1024 * 5
    // },
    // fileFilter: (req, file, cb) => {
    //     if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
    //         cb(null, true)
    //     } else {
    //         cb(null, false)
    //     }
    // }
})

module.exports = {
    upload
}