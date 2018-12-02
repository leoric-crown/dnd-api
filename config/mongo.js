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
      const conditionNames = conditions.map(condition => {
        return condition.name
      })
      const matches = await Condition.find({ name: { $in: conditionNames }})
      const matchNames = matches.map(match => {
        return match.name
      })
      const getNewConditions = conditions.map(async (condition) => {
        if (!matchNames.includes(condition.name)) {
          const conditionResponse = await fetch(condition.url)
          const fetchedCondition = await conditionResponse.json()
          return new Condition({
            _id: new mongoose.Types.ObjectId(),
            name: fetchedCondition.name,
            desc: fetchedCondition.desc,
            fromApi: true
          })
        }
      })
      const newConditions = await Promise.all(getNewConditions)

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
        console.log(chalk.yellow.bold('No new Conditions found!'))
      }
    return
    }
  }
  catch (err) {
    console.log(err)
  }
}

module.exports = fetchConditions
