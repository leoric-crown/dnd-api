const express = require('express')
const router = express.Router()

const ConditionsController = require('../controllers/conditions.controller')
router.get('/', ConditionsController.getAllConditions)

router.delete('/', ConditionsController.deleteAllConditions)

module.exports = router
