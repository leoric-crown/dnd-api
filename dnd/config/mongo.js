const mongoose = require('mongoose')
const MongoSetting = require('../api/models/mongoSetting.model')
const Condition = require('../api/models/condition.model')
const fetch = require('node-fetch')
const chalk = require('chalk')

const fetchConditions = async () => {
  try {
    const haveFetched = await MongoSetting.findOne({ name: 'haveFetchedConditions' }).exec()
    if(haveFetched) {
      console.log(chalk.yellow.bold('Conditions have already been fetched, no need to fetch again.'))
      return
    }
    else{
      const response = await fetch('http://www.dnd5eapi.co/api/conditions/')
      const result = await response.json()
      const conditions = result.results
      const newConditions = new Array()
      for(var k = 0; k < conditions.length; k++) {
        const exists = await Condition.find({ name: conditions[k].name }).exec()
        if(exists.length === 0) {
          var conditionResponse = await fetch(conditions[k].url)
          var fetchCondition = await conditionResponse.json()
          const newCondition = new Condition({
            _id: new mongoose.Types.ObjectId(),
            name: fetchCondition.name,
            desc: fetchCondition.desc,
            fromApi: true
          })
          newConditions.push(newCondition)
        }
      }
      if(newConditions.length > 0) {
        console.log(chalk.yellow.bold(`${newConditions.length} new Conditions fetched!`))
        await Condition.insertMany(newConditions)
        const mongoSetting = new MongoSetting({
          _id: new mongoose.Types.ObjectId(),
          name: 'haveFetchedConditions',
          value: true
        })
        await mongoSetting.save()
        console.log(chalk.green.bold('Conditions successfully saved!'))
        return
      } else {
        console.log(chalk.orange.bold('No new Conditions found!'))
      }
    return
    }
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = fetchConditions
