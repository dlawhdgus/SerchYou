const { connection } = require('mongoose')
const ChampionsColl = connection.collection('champions')

exports.ChampionData = async (championName) => {
    const ChampionData = await ChampionsColl.findOne({KoName : championName})
    return ChampionData
}

