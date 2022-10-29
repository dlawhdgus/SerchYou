const { connection } = require('mongoose')
const UsersColl = connection.collection('users')

exports.UserMatchIdsInsert = async (RankMatchIds, NormalMatchIds) => {
    if(RankMatchIds && NormalMatchIds) {
        const MatchId = await UsersColl.insertOne({RankMatchIds : RankMatchIds, NormalMatchIds : NormalMatchIds})
        return true
    } else if (NormalMatchIds) {
        const MatchId = await UsersColl.insertOne({NormalMatchIds : NormalMatchIds})
        return true
    } else {
        return false
    }
}