const config = require('../config.json')
const axios = require('axios')

module.exports.GetPuuid = async (username) => {
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
        const MatchDataUri = `https://asia.api.riotgames.com/lol/match/v5/matches/${MatchId[i]}?api_key=${config.API_CONNECT_KEY}`
        const MatchDataResult = await axios.get(MatchDataUri)
        return MatchDataResult.data.info
    } catch (e) {
        throw e
    }
}

module.exports.UserDataTemplate = async (username) => {
    try {
        const Gamesusername = username.split(' ')[0]
        const puuidResponse = await this.GetPuuid(Gamesusername)
        const NormalMatchIds = await this.GetNormalMatchId(puuidResponse.puuid)
        const RankedMatchIds = await this.GetRankedMatchId(puuidResponse.puuid)

        const MatchData = []
        const RankMatchData = []

        const Kda_float = []
        const Kda = []
        const KdaDiff = []

        const Win_bool = []
        const Win = []

        const GameMode = []
        const GameModeKorean = []

        const EndDate = []
        const EndTimeStamp = []

        const ChampionName = []
        const ChampionIconUri = []

        const IconId = puuidResponse.profileIconId
        const IconUri = `http://ddragon.leagueoflegends.com/cdn/12.20.1/img/profileicon/${IconId}.png`

        for (let i = 0; i < 10; i++) {
            MatchData[i] = await this.GetMatchData(NormalMatchIds, i)
            RankMatchData[i] = await this.GetMatchData(RankedMatchIds, i)

            if (MatchData[i].gameEndTimestamp > RankMatchData[i].gameEndTimestamp) {
                GameMode[i] = MatchData[i].gameMode
                if (GameMode[i] === 'CLASSIC') GameModeKorean[i] = '일반'
                else if (GameMode[i] === 'URF') GameModeKorean[i] = '우르프'
                else if (GameMode[i] === 'ARAM') GameModeKorean[i] = '칼바람'
                else if (GameMode[i] === 'ULTBOOK') GameModeKorean[i] = '궁국기 주문서'
                else if (GameMode[i] === 'TUTORIAL') GameModeKorean[i] = '튜토리얼'
                else if (GameMode[i] === 'ONEFORALL') GameModeKorean[i] = '단일 챔피언'
                else GameModeKorean[i] = '잘못된 맵'

                for (let j = 0; j < 10; j++) {
                    if (MatchData[i].participants[j].summonerName === puuidResponse.name) {
                        Win_bool[i] = MatchData[i].participants[j].win
                        Kda_float[i] = (MatchData[i].participants[j].kills + MatchData[i].participants[j].assists) / MatchData[i].participants[j].deaths
                        ChampionName[i] = MatchData[i].participants[j].championName
                    }
                    if (Win_bool[i] === true) Win[i] = '승'
                    else Win[i] = '패'
                    Kda[i] = Number.parseFloat(Math.round(Kda_float[i] * 100) / 100).toFixed(2)
                    KdaDiff[i] = Math.round(Kda_float[i] * 100) / 100
                    EndTimeStamp[i] = MatchData[i].gameEndTimestamp
                    EndDate[i] = new Date(EndTimeStamp[i])
                    ChampionIconUri[i] = `http://ddragon.leagueoflegends.com/cdn/12.20.1/img/champion/${ChampionName[i]}.png`
                }
            } else {
                GameMode[i] = RankMatchData[i].gameMode
                if (GameMode[i] === 'CLASSIC') GameModeKorean[i] = '개인/2인 랭크'
                else GameModeKorean[i] = '잘못된 맵'
                for (let j = 0; j < 10; j++) {
                    if (RankMatchData[i].participants[j].summonerName === puuidResponse.name) {
                        Win_bool[i] = RankMatchData[i].participants[j].win
                        Kda_float[i] = (RankMatchData[i].participants[j].kills + RankMatchData[i].participants[j].assists) / RankMatchData[i].participants[j].deaths
                        ChampionName[i] = RankMatchData[i].participants[j].championName
                    }
                    if (Win_bool[i] === true) Win[i] = '승'
                    else Win[i] = '패'
                    Kda[i] = Number.parseFloat(Math.round(Kda_float[i] * 100) / 100).toFixed(2)
                    KdaDiff[i] = Math.round(Kda_float[i] * 100) / 100
                    EndTimeStamp[i] = RankMatchData[i].gameEndTimestamp
                    EndDate[i] = new Date(EndTimeStamp[i])
                    ChampionIconUri[i] = `http://ddragon.leagueoflegends.com/cdn/12.20.1/img/champion/${ChampionName[i]}.png`
                }
            }

        }

        const user = {
            username: puuidResponse.name,
            Win: Win,
            Kda: Kda,
            GameModeKorean: GameModeKorean,
            EndDate: EndDate,
            IconUri: IconUri,
            KdaDiff: KdaDiff
        }

        return user
    } catch (e) {
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
            Player1Username: Player1Data.username,
            Player1WinRate: Player1WinRate,
            Player1KdaRate: Player1KdaRate
        },
        Player2: {
            Player2Username: Player2Data.username,
            Player2WinRate: Player2WinRate,
            Player2KdaRate: Player2KdaRate
        }
    }

    return Players
}