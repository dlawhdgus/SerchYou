const config = require('../config.json')
const axios = require('axios')
const championDB = require('../models/champions')
const userDB_Create = require('../models/users/create')
const userDB_Read = require('../models/users/read')
const userDB_Update = require('../models/users/update')
const date = new Date()

module.exports.GetUserData = async (username) => {
    try {
        const useruri = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${config.API_CONNECT_KEY}`
        const puuid = await axios.get(useruri)
        return puuid.data
    } catch (e) {
        throw e
    }
}

module.exports.GetRankData = async (encrptedSummonerId) => {
    try {
        const RankDataUri = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encrptedSummonerId}?api_key=${config.API_CONNECT_KEY}`
        const RankData = await axios.get(RankDataUri)
        return RankData
    } catch (e) {
        throw e
    }
}

module.exports.GetNormalMatchId = async (puuid) => {
    try {
        const MatchIdsUri = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=normal&start=0&count=10&api_key=${config.API_CONNECT_KEY}`
        const result = await axios.get(MatchIdsUri)
        return result.data
    } catch (e) {
        throw e
    }
}

module.exports.GetRankedMatchId = async (puuid) => {
    try {
        const MatchIdsUri = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=10&api_key=${config.API_CONNECT_KEY}`
        const result = await axios.get(MatchIdsUri)
        return result.data
    } catch (e) {
        throw e
    }
}

module.exports.GetMatchData = async (MatchId, i) => {
    try {
        if (!MatchId[i]) {
            return null
        } else {
            const MatchDataUri = `https://asia.api.riotgames.com/lol/match/v5/matches/${MatchId[i]}?api_key=${config.API_CONNECT_KEY}`
            const MatchDataResult = await axios.get(MatchDataUri)
            return MatchDataResult.data.info
        }
    } catch (e) {
        throw e
    }
}

module.exports.GetUserChampionsLevelData = async (encrptedSummonerId, ChampID) => {
    try {
        const ChampionLevelUri = `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encrptedSummonerId}/by-champion/${ChampID}?api_key=${config.API_CONNECT_KEY}`
        const ChampionsLevelData = await axios.get(ChampionLevelUri)
        if (ChampionsLevelData) return ChampionsLevelData
    } catch (e) {
        return
    }
}

module.exports.UserDataTemplate = async (username) => {
    try {
        const userdata = await userDB_Read.ReadData(username)

        if (!userdata) {
            const userdatas = await this.UserAllDataTemplate(username, userdata)
            return userdatas
        } else {
            const TimeFilter = userdata.createAt
            if (TimeFilter.setMinutes(TimeFilter.getMinutes() + 10) > date.getTime()) {
                return userdata
            } else {
                const userdatas = await this.UserAllDataTemplate(username, userdata)
                return userdatas
            }
        }
    } catch (e) {
        throw e
    }
}

module.exports.UserAllDataTemplate = async (username, userdata) => {
    const puuidResponse = await this.GetUserData(username)
    const RankedMatchIds = await this.GetRankedMatchId(puuidResponse.puuid)
    const NormalMatchIds = await this.GetNormalMatchId(puuidResponse.puuid)


    if (!userdata) {
        if (RankedMatchIds && NormalMatchIds) {
            const InsertIds = await userDB_Create.InsertIds(username, RankedMatchIds, NormalMatchIds)
        } else if (NormalMatchIds) {
            const InsertNormalIds = await userDB_Create.InsertIds(username, NormalMatchIds)
        } else {
            return false
        }
    } else {
        if (RankedMatchIds && NormalMatchIds) {
            const UpdateIds = await userDB_Update.UpdateIds(username, RankedMatchIds, NormalMatchIds)
        } else if (NormalMatchIds) {
            const UpdateIds = await userDB_Update.UpdateNormalIds(username, RankedMatchIds, NormalMatchIds)
        } else {
            return false
        }
    }

    const NormalMatchData = []
    const RankedMatchData = []

    for (let i = 0; i < userdata.NormalMatchIds.length; i++) {
        RankedMatchData[i] = await this.GetMatchData(userdata.RankMatchIds, i)
        NormalMatchData[i] = await this.GetMatchData(userdata.NormalMatchIds, i)
    }

    if (!userdata) {
        const InsertMatchData = await userDB_Create.InsertDatas(username, RankedMatchData, NormalMatchData)
    } else {
        const UpdateMatchData = await userDB_Update.UpdateDatas(username, RankedMatchData, NormalMatchData)
    }
    const user = await userDB_Read.ReadData(username)

    const GameMode = []
    const NormalMatch = []
    const RankMatch = []

    const Win = []
    const Kda_float = []
    const KdaDiff = []
    const Kda = []
    const EndTime = []
    const IconId = puuidResponse.profileIconId
    const IconUri = `http://ddragon.leagueoflegends.com/cdn/12.20.1/img/profileicon/${IconId}.png`

    for (let i = 0; i < 10; i++) {
        NormalMatch[i] = user.NormalData[i]
        RankMatch[i] = user.RankData[i]
        if (NormalMatch[i].gameEndTimestamp > RankMatch[i].gameEndTimestamp) {

            GameMode[i] = user.NormalData[i].gameMode
            if (GameMode[i] === 'CLASSIC') GameMode[i] = '일반'
            else if (GameMode[i] === 'URF') GameMode[i] = '우르프'
            else if (GameMode[i] === 'ARAM') GameMode[i] = '칼바람'
            else if (GameMode[i] === 'ULTBOOK') GameMode[i] = '궁국기 주문서'
            else if (GameMode[i] === 'TUTORIAL') GameMode[i] = '튜토리얼'
            else if (GameMode[i] === 'ONEFORALL') GameMode[i] = '단일 챔피언'
            else GameMode[i] = '잘못된 맵'

            for (let j = 0; j < 10; j++) {
                if (NormalMatch[i].participants[j].summonerName === puuidResponse.name) {
                    if (NormalMatch[i].participants[j].win) Win[i] = '승'
                    else Win[i] = '패'
                    Kda_float[i] = (NormalMatch[i].participants[j].kills + NormalMatch[i].participants[j].assists) / NormalMatch[i].participants[j].deaths
                    Kda[i] = Number.parseFloat(Math.round(Kda_float[i] * 100) / 100).toFixed(2)
                    KdaDiff[i] = Math.round(Kda_float[i] * 100) / 100
                }
            }

            EndTime[i] = new Date(NormalMatch[i].gameEndTimestamp)

        } else {
            GameMode[i] = user.RankData[i].gameMode
            if (GameMode[i] === 'CLASSIC') GameMode[i] = '개인/2인 랭크'
            else GameMode[i] = '잘못된 맵'

            for (let j = 0; j < 10; j++) {
                if (NormalMatch[i].participants[j].summonerName === puuidResponse.name) {
                    if (NormalMatch[i].participants[j].win) Win[i] = '승'
                    else Win[i] = '패'
                    Kda_float[i] = (NormalMatch[i].participants[j].kills + NormalMatch[i].participants[j].assists) / NormalMatch[i].participants[j].deaths
                    Kda[i] = Number.parseFloat(Math.round(Kda_float[i] * 100) / 100).toFixed(2)
                    KdaDiff[i] = Math.round(Kda_float[i] * 100) / 100
                }
            }

            EndTime[i] = new Date(NormalMatch[i].gameEndTimestamp)
        }
        if (Kda[i] === 'Infinity') Kda[i] = 'Perfect'
    }
    const RecentUserRecode = {
        name: puuidResponse.name,
        Win: Win,
        Kda: Kda,
        GameMode: GameMode,
        EndTime: EndTime,
        userIcon: IconUri,
        KdaDiff: KdaDiff
    }

    const RecentGame = await userDB_Create.InsertGames(username, RecentUserRecode)
    const recentgame = RecentGame.RecentRecode
    return recentgame
}

module.exports.DiffPlayers = async (player1Username, player2Username) => {
    const Player1Data = await this.UserDataTemplate(player1Username)
    const Player2Data = await this.UserDataTemplate(player2Username)

    let Player1Wincount = 0
    let Player2Wincount = 0

    let Player1Kdacount = 0
    let Player2Kdacount = 0

    if(Player1Data.RecentRecode && !Player2Data.RecentRecode){
        for (let i = 0; i < 10; i++) {
            if (Player1Data.RecentRecode.Win[i] === '승') Player1Wincount++
            if (Player2Data.Win[i] === '승') Player2Wincount++
            if (Player1Data.RecentRecode.KdaDiff[i] === Infinity) {
                i++
            }
            Player1Kdacount += Player1Data.RecentRecode.KdaDiff[i]
            if (Player2Data.KdaDiff[i] === Infinity) {
                i++
            }
            Player2Kdacount += Player2Data.KdaDiff[i]
        }
    
        const Player1WinRate = Player1Wincount / 10 * 100
        const Player2WinRate = Player2Wincount / 10 * 100
    
        const Player1KdaRate = Number.parseFloat(Player1Kdacount / 10).toFixed(2)
        const Player2KdaRate = Number.parseFloat(Player2Kdacount / 10).toFixed(2)
    
        const Players = {
            Player1: {
                Player1Username: Player1Data.RecentRecode.name,
                Player1WinRate: Player1WinRate,
                Player1KdaRate: Player1KdaRate
            },
            Player2: {
                Player2Username: Player2Data.name,
                Player2WinRate: Player2WinRate,
                Player2KdaRate: Player2KdaRate
            }
        }
        return Players
    } else if(Player2Data.RecentRecode && !Player1Data.RecentRecode){
        for (let i = 0; i < 10; i++) {
            if (Player1Data.Win[i] === '승') Player1Wincount++
            if (Player2Data.RecentRecode.Win[i] === '승') Player2Wincount++
            if (Player1Data.KdaDiff[i] === Infinity) {
                i++
            }
            Player1Kdacount += Player1Data.KdaDiff[i]
            if (Player2Data.RecentRecode.KdaDiff[i] === Infinity) {
                i++
            }
            Player2Kdacount += Player2Data.RecentRecode.KdaDiff[i]
        }
    
        const Player1WinRate = Player1Wincount / 10 * 100
        const Player2WinRate = Player2Wincount / 10 * 100
    
        const Player1KdaRate = Number.parseFloat(Player1Kdacount / 10).toFixed(2)
        const Player2KdaRate = Number.parseFloat(Player2Kdacount / 10).toFixed(2)
    
        const Players = {
            Player1: {
                Player1Username: Player1Data.name,
                Player1WinRate: Player1WinRate,
                Player1KdaRate: Player1KdaRate
            },
            Player2: {
                Player2Username: Player2Data.RecentRecode.name,
                Player2WinRate: Player2WinRate,
                Player2KdaRate: Player2KdaRate
            }
        }
        return Players
    } else if(!Player2Data.RecentRecode && !Player1Data.RecentRecode){
        for (let i = 0; i < 10; i++) {
            if (Player1Data.Win[i] === '승') Player1Wincount++
            if (Player2Data.Win[i] === '승') Player2Wincount++
            if (Player1Data.KdaDiff[i] === Infinity) {
                i++
            }
            Player1Kdacount += Player1Data.KdaDiff[i]
            if (Player2Data.KdaDiff[i] === Infinity) {
                i++
            }
            Player2Kdacount += Player2Data.KdaDiff[i]
        }
    
        const Player1WinRate = Player1Wincount / 10 * 100
        const Player2WinRate = Player2Wincount / 10 * 100
    
        const Player1KdaRate = Number.parseFloat(Player1Kdacount / 10).toFixed(2)
        const Player2KdaRate = Number.parseFloat(Player2Kdacount / 10).toFixed(2)
    
        const Players = {
            Player1: {
                Player1Username: Player1Data.name,
                Player1WinRate: Player1WinRate,
                Player1KdaRate: Player1KdaRate
            },
            Player2: {
                Player2Username: Player2Data.name,
                Player2WinRate: Player2WinRate,
                Player2KdaRate: Player2KdaRate
            }
        }
        return Players
    } else {
        for (let i = 0; i < 10; i++) {
            if (Player1Data.RecentRecode.Win[i] === '승') Player1Wincount++
            if (Player2Data.RecentRecode.Win[i] === '승') Player2Wincount++
            if (Player1Data.RecentRecode.KdaDiff[i] === Infinity) {
                i++
            }
            Player1Kdacount += Player1Data.RecentRecode.KdaDiff[i]
            if (Player2Data.RecentRecode.KdaDiff[i] === Infinity) {
                i++
            }
            Player2Kdacount += Player2Data.RecentRecode.KdaDiff[i]
        }
    
        const Player1WinRate = Player1Wincount / 10 * 100
        const Player2WinRate = Player2Wincount / 10 * 100
    
        const Player1KdaRate = Number.parseFloat(Player1Kdacount / 10).toFixed(2)
        const Player2KdaRate = Number.parseFloat(Player2Kdacount / 10).toFixed(2)
    
        const Players = {
            Player1: {
                Player1Username: Player1Data.RecentRecode.name,
                Player1WinRate: Player1WinRate,
                Player1KdaRate: Player1KdaRate
            },
            Player2: {
                Player2Username: Player2Data.RecentRecode.name,
                Player2WinRate: Player2WinRate,
                Player2KdaRate: Player2KdaRate
            }
        }
        return Players 
    }

}

module.exports.UserChampionsLevel = async (username) => {
    try {
        const GameUsername = username[1]
        const championName = username[2].split(' ')[1]

        const UserData = await this.GetUserData(GameUsername)
        const championData = await championDB.GetData(championName)
        if (!championData) {
            const ChampionData = {
                name: '챔피언 정보가 없습니다.'
            }
            return ChampionData
        } else {
            const SummonerId = UserData.id
            const ChampionsLevelData = await this.GetUserChampionsLevelData(SummonerId, championData.ChampionId)

            if (ChampionsLevelData) {
                const championDataALL = ChampionsLevelData.data
                const ChampionData = {
                    name: championData.KoName,
                    level: championDataALL.championLevel,
                    point: championDataALL.championPoints,
                    ChampIconUri: championData.ChampionIconUri
                }
                return ChampionData
            } else {
                const ChampionData = {
                    name: championData.KoName,
                    champKoreanName: championName,
                    ChampIconUri: championData.ChampionIconUri
                }
                return ChampionData
            }
        }
    } catch (e) {
        throw e
    }
}   