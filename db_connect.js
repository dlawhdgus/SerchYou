const config = require('./config.json')
const mongoose = require('mongoose')

mongoose.connect(config.DBCONNECTSTRING,
    {
        dbName: 'db'
    }
)

const db = mongoose.connection

exports.connectstring = db.once("opne", () => {})

db.on("error", (e) => {return e})