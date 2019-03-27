const fetchConditions = require('./config/mongo')
const Server = require('./api/server');
const mongoose = require('mongoose')
require('dotenv').config()
const config = require('./config/main')
const mongoConfig = require('./config/mongo')
const chalk = require('chalk')
const fs = require('fs')
const download = require('image-downloader')
const defaultPicUrl = 'https://vignette.wikia.nocookie.net/forgottenrealms/images/d/da/Half-orc_PHB5e.jpg'

const createUploadsFolder = async () => {
    fs.mkdirSync('./uploads')
    try {
        await download.image({
            url: defaultPicUrl,
            dest: './uploads/characterPicDefault.jpg'
        })
        console.log(chalk.bold.green('Created /uploads folder and downloaded default pic'))
    } catch (err) {
        console.log(chalk.bold.red('Error getting fetching default pic'))
        console.log(err)
    }
}
if (!fs.existsSync('./uploads')) {
    createUploadsFolder()
}

mongoose.connect(
    config.dbpath,
    { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false },
);

mongoose.connection.once('open', () => {
    fetchConditions()
    console.log(chalk.bold.magenta(`Succesfully Connected to MongoDB at ${config.dbpath}`))
    new Server(config, chalk).start();
});

mongoose.connection.on('error', (err) => {
    console.log(chalk.bold.red(`Error connecting to MongoDB at ${config.dbpath}`))
    process.exit()
});

console.log(process.env)
