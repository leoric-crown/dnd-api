const express = require('express')
const router = express.Router()

const ConditionsController = require('../controllers/conditions.controller')

router.post('/', ConditionsController.createCondition)

router.get('/', ConditionsController.getAllConditions)

router.get('/:conditionId', ConditionsController.getCondition)

router.patch('/:conditionId', ConditionsController.patchCondition)

router.delete('/:conditionId', ConditionsController.deleteCondition)

router.delete('/', ConditionsController.deleteAllConditions)

module.exports = router
