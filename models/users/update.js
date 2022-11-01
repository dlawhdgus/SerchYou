const { connection } = require('mongoose')
const UsersColl = connection.collection('users')
const date = new Date()

exports.UpdateIds = async (username, RankMatchIds, NormalMatchIds) => {
    const MatchId = await UsersColl.updateOne({ username: username }, { $set: { RankMatchIds: RankMatchIds, NormalMatchIds: NormalMatchIds, createAt: date } })
}
exports.UpdateNormalIds = async (username, NormalMatchIds) => {
    const MatchId = await UsersColl.updateOne({ username: username }, { $set: { NormalMatchIds: NormalMatchIds } })
}
exports.UpdateDatas = async (username, RankData, NormalData) => {
    const UpdateMatchData = await UsersColl.updateOne({ username: username }, { $set: { RankData: RankData, NormalData: NormalData } })
}