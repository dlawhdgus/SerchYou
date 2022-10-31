const config = require('../config.json')
const axios = require('axios')
const championDB = require('../models/champions/db')
const userDB = require('../models/users/db')

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
        if(!MatchId[i]) {
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
        const Gamesusername = username.split(' ')[0]
        const UserData = await userDB.TimeFilterUserData(Gamesusername)
        if(UserData) {
            const recentgame = UserData.RecentRecode
            return recentgame
        } else {
            const puuidResponse = await this.GetUserData(Gamesusername)
            const RankedMatchIds = await this.GetRankedMatchId(puuidResponse.puuid)
            const NormalMatchIds = await this.GetNormalMatchId(puuidResponse.puuid)
    
            const InsertMatchId = await userDB.InsertUserMatchIds(Gamesusername, RankedMatchIds, NormalMatchIds)
            const userdata = await userDB.ShowUserData(Gamesusername)
    
            const NormalMatchData = []
            const RankedMatchData = []
    
            for(let i = 0; i<userdata.NormalMatchIds.length; i++) {
                RankedMatchData[i] = await this.GetMatchData(userdata.RankMatchIds,i)
                NormalMatchData[i] = await this.GetMatchData(userdata.NormalMatchIds,i)
            }
            
            const InsertMatchData = await userDB.InsertUserMatchData(Gamesusername, RankedMatchData, NormalMatchData)
            const user = await userDB.User(Gamesusername)
            
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
            
            for(let i = 0; i< 10; i++) {
                NormalMatch[i] = user.NormalData[i]
                RankMatch[i] = user.RankData[i]
                if(NormalMatch[i].gameEndTimestamp > RankMatch[i].gameEndTimestamp) {
    
                    GameMode[i] = user.NormalData[i].gameMode
                    if (GameMode[i] === 'CLASSIC') GameMode[i] = '일반'
                    else if (GameMode[i] === 'URF') GameMode[i] = '우르프'
                    else if (GameMode[i] === 'ARAM') GameMode[i] = '칼바람'
                    else if (GameMode[i] === 'ULTBOOK') GameMode[i] = '궁국기 주문서'
                    else if (GameMode[i] === 'TUTORIAL') GameMode[i] = '튜토리얼'
                    else if (GameMode[i] === 'ONEFORALL') GameMode[i] = '단일 챔피언'
                    else GameMode[i] = '잘못된 맵'
    
                    for(let j = 0; j < 10; j++) {
                        if(NormalMatch[i].participants[j].summonerName === puuidResponse.name) {
                            if(NormalMatch[i].participants[j].win) Win[i] = '승'
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
    
                    for(let j = 0; j < 10; j++) {
                        if(NormalMatch[i].participants[j].summonerName === puuidResponse.name) {
                            if(NormalMatch[i].participants[j].win) Win[i] = '승'
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
                name : puuidResponse.name,
                Win : Win,
                Kda : Kda,
                GameMode : GameMode,
                EndTime : EndTime,
                userIcon : IconUri,
                KdaDiff : KdaDiff
            }
            
            const RecentGame = await userDB.InsertRecentRecode(Gamesusername, RecentUserRecode)
            const recentgame = RecentGame.RecentRecode
            return recentgame
        }

    } catch (e) {
        console.log(e)
        throw e
    }
}

module.exports.DiffPlayers = async (player1Username, player2Username) => {
    const Player1Data = await this.UserDataTemplate(player1Username)
    const Player2Data = await this.UserDataTemplate(player2Username)

    let Player1Wincount = 0
    let Player2Wincount = 0

    let Player1Kdacount = 0
    let Player2Kdacount = 0

    for (let i = 0; i < 10; i++) {
        if (Player1Data.Win[i] === '승') Player1Wincount++
        if (Player2Data.Win[i] === '승') Player2Wincount++
        Player1Kdacount += Player1Data.KdaDiff[i]
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
}

module.exports.UserChampionsLevel = async (username) => {
    try {
        const GameUsername = username.split(' ')[0]
        const championName = username.split(' ')[1]

        const UserData = await this.GetUserData(GameUsername)
        const championData = await championDB.ChampionData(championName)
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
    } catch (e) {
        throw e
    }
}   