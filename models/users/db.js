const { connection } = require('mongoose')
const UsersColl = connection.collection('users')
const date = new Date()

exports.ShowUserData = async (username) => {
    const Userdata = await UsersColl.findOne({ username : username })
    return Userdata
}

exports.InsertUserMatchIds = async (username, RankMatchIds, NormalMatchIds) => {
    const user = await this.ShowUserData(username)
    if(!user) {
        if(RankMatchIds && NormalMatchIds) {
            const MatchId = await UsersColl.insertOne({username : username, RankMatchIds : RankMatchIds, NormalMatchIds : NormalMatchIds, createAt : date})
            return true
        } else if (NormalMatchIds) {
            const MatchId = await UsersColl.insertOne({NormalMatchIds : NormalMatchIds})
            return true
        } else {
            return false
        }
    } else {
        const TimeFilter = user.createAt
        if(TimeFilter.setDate(TimeFilter.getMinutes()+10) < date) {
            if(RankMatchIds && NormalMatchIds) {
                const MatchId = await UsersColl.updateOne({username : username},{$set : { RankMatchIds : RankMatchIds, NormalMatchIds : NormalMatchIds, createAt : date }})
                return true
            } else if (NormalMatchIds) {
                const MatchId = await UsersColl.updateOne({username : username}, {$set : {NormalMatchIds : NormalMatchIds}})
                return true
            } else {
                return false
            }
        } else {
            return true
        }
    }
}

exports.InsertUserMatchData = async (username, RankData, NormalData) => {
    const user = await this.ShowUserData(username)
    const TimeFilter = user.createAt
    if(TimeFilter.setDate(TimeFilter.getMinutes()+10) < 10) {
        const MatchData = await UsersColl.insertOne({username : username, RankData : RankData, NormalData : NormalData})
    } else {
        const UpdateMatchData = await UsersColl.updateOne({username : username}, {$set : {RankData : RankData, NormalData : NormalData}})
    }
}

exports.User = async (username) => {
    const Userdata = await UsersColl.findOne({ username : username })
    return Userdata
}