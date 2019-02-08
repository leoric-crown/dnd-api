const Server = require('./api/server');
const mongoose = require('mongoose')
require('dotenv').config()
const config = require('./config/main')
const mongoConfig = require('./config/mongo')
const chalk = require('chalk')

new Server(config, chalk).start();

mongoose.connect(
    config.dbpath,
    { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
);

mongoose.connection.once('open', () => {
    console.log(chalk.bold.magenta(`Succesfully Connected to MongoDB at ${config.dbpath}`))
});

console.log('testing ssh')
mongoose.connection.on('error', (err) => {
    console.log(chalk.bold.red(`Error connecting to MongoDB at ${config.dbpath}`))
    process.exit()
});
