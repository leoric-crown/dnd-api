const express = require('express')
const router = express.Router()
const multer = require('multer')
const CharactersController = require('../controllers/characters.controller')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime()+file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get('/', CharactersController.getAllCharacters)

router.get('/:userId', CharactersController.getUserCharacters)

router.get('/:characterId', CharactersController.getCharacter)

router.post('/', upload.single('characterPic'), CharactersController.createCharacter)

router.patch('/:characterId', CharactersController.patchCharacter)

router.delete('/:characterId', CharactersController.deleteCharacter)

router.delete('/', CharactersController.deleteAllCharacters)

module.exports = router
