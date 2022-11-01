const { connection } = require('mongoose')
const UsersColl = connection.collection('users')
const date = new Date()

exports.ReadData = async (username) => {
    const Userdata = await UsersColl.findOne({ username: username })
    return Userdata
}
exports.User = async (username) => {
    const Userdata = await UsersColl.findOne({ username: username })
    return Userdata
}