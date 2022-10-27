const config = require('./config')
const axios = require('axios')
const Discord = require('discord.js')
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
})

client.once('ready', () => {
    console.log('ready')
})

const GetPuuid = async (username) => {
    try {
        const useruri = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${username}?api_key=${config.API_CONNECT_KEY}`
        const puuid = await axios.get(useruri)
        return puuid.data
    } catch (e) {
        throw e
    }
}

const GetRankData = async (encrptedSummonerId) => {
    try {
        const RankDataUri = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encrptedSummonerId}?api_key=${config.API_CONNECT_KEY}`
        const RankData = await axios.get(RankDataUri)
        return RankData
    } catch (e) {
        throw e
    }
}

const GetNormalMatchId = async (puuid) => {
    try {
        const MatchIdsUri = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=normal&start=0&count=10&api_key=${config.API_CONNECT_KEY}`
        const result = await axios.get(MatchIdsUri)
        return result.data
    } catch (e) {
        throw e
    }
}

const GetRankedMatchId = async (puuid) => {
    try {
        const MatchIdsUri = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?type=ranked&start=0&count=10&api_key=${config.API_CONNECT_KEY}`
        const result = await axios.get(MatchIdsUri)
        return result.data
    } catch (e) {
        throw e
    }
}

const GetMatchData = async (MatchId, i) => {
    try {
        const MatchDataUri = `https://asia.api.riotgames.com/lol/match/v5/matches/${MatchId[i]}?api_key=${config.API_CONNECT_KEY}`
        const MatchDataResult = await axios.get(MatchDataUri)
        return MatchDataResult.data.info
    } catch (e) {
        throw e
    }
}

const UserDataTemplate = async (username) => {
    try {
        const Gamesusername = username.split(' ')[0]
        const puuidResponse = await GetPuuid(Gamesusername)
        const NormalMatchIds = await GetNormalMatchId(puuidResponse.puuid)
        const RankedMatchIds = await GetRankedMatchId(puuidResponse.puuid)
        
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
            MatchData[i] = await GetMatchData(NormalMatchIds, i)
            RankMatchData[i] = await GetMatchData(RankedMatchIds, i)

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
        console.log(user)
        
        return user
    } catch (e) {
        throw e
    }
}
const NotFoundErrorEmbed = new EmbedBuilder()
    .setTitle('Error')
    .setDescription('소환사가 없습니다.')
    .setColor(0xFF0000)

const ErrorEmbed = new EmbedBuilder()
    .setTitle('Error')
    .setDescription('server error')
    .setColor(0xFF0000)

client.on('messageCreate', async msg => {
    try {
        const content = msg.content
        const CommandFilter = content.startsWith(config.PERFIX)
        if (CommandFilter) {
            const username = content.split('!')[1]
            const ContentFilter = username.split(' ')[1]
            if (username === '봇 사용법') {
                const help = new EmbedBuilder()
                    .setTitle('사용법')
                    .setDescription(`
                ${Discord.bold('1. !닉네임')}
                *사용자의 정보를 보여줍니다.*
                ${Discord.bold('2. !닉네임 전적')}
                *사용자의 최근 10판 전적을 보여줍니다.*
                ${Discord.bold('3. !닉네임 vs 닉네임')}
                *두 사용자의 최근 10판의 승률과 Kda를 보여줍니다.*


                닉네임에 공백 X
                `)
                msg.channel.send({ embeds: [help] })
            }
            else if (ContentFilter === '전적' || ContentFilter === 'wjswjr') {
                msg.channel.send(`*계 산 중*`)
                const User = await UserDataTemplate(username)
                const UserGames = new EmbedBuilder()
                    .setAuthor({ name: `${User.username}`, iconURL: `${User.IconUri}` })
                    .setTitle('승 / 패   KDA   게임모드   끝난시간')
                    .setDescription(`
                    ${User.Win[0]} ${String(User.Kda[0])} ${User.GameModeKorean[0]} ${User.EndDate[0].toLocaleString()}
                    ${User.Win[1]} ${String(User.Kda[1])} ${User.GameModeKorean[1]} ${User.EndDate[1].toLocaleString()}
                    ${User.Win[2]} ${String(User.Kda[2])} ${User.GameModeKorean[2]} ${User.EndDate[2].toLocaleString()}
                    ${User.Win[3]} ${String(User.Kda[3])} ${User.GameModeKorean[3]} ${User.EndDate[3].toLocaleString()}
                    ${User.Win[4]} ${String(User.Kda[4])} ${User.GameModeKorean[4]} ${User.EndDate[4].toLocaleString()}
                    ${User.Win[5]} ${String(User.Kda[5])} ${User.GameModeKorean[5]} ${User.EndDate[5].toLocaleString()}
                    ${User.Win[6]} ${String(User.Kda[6])} ${User.GameModeKorean[6]} ${User.EndDate[6].toLocaleString()}
                    ${User.Win[7]} ${String(User.Kda[7])} ${User.GameModeKorean[7]} ${User.EndDate[7].toLocaleString()}
                    ${User.Win[8]} ${String(User.Kda[8])} ${User.GameModeKorean[8]} ${User.EndDate[8].toLocaleString()}
                    ${User.Win[9]} ${String(User.Kda[9])} ${User.GameModeKorean[9]} ${User.EndDate[9].toLocaleString()}
                    `)
                    .setColor(0xFF00FF)
                msg.channel.send({ embeds: [UserGames] })
            }
            else if (ContentFilter === 'vs') {
                msg.channel.send(`*계 산 중*`)
                const player1Username = username.split(' ')[0]
                const player2Username = username.split(' ')[2]
                
                const Player1Data = await UserDataTemplate(player1Username)
                const Player2Data = await UserDataTemplate(player2Username)
                console.log(Player1Data)
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
                console.log(Player1KdaRate)
                const Player2KdaRate = Player2Kdacount / 10
                console.log(Player2KdaRate)

                const PlayerDiffembed = new EmbedBuilder()
                    .setTitle(`${Player1Data.username}      VS      ${Player2Data.username}`)
                    .setDescription(`승률
                    ${Player1WinRate}% ${Player2WinRate}%
                    KDA
                    ${Player1KdaRate} ${Player2KdaRate}
                    `)
                    .setColor(0x0F0F0F)
                msg.channel.send({ embeds: [PlayerDiffembed] })
            } else {
                const puuidResponse = await GetPuuid(username)
                const UserData = puuidResponse
                const RankData = await GetRankData(UserData.id)
                const IconId = UserData.profileIconId
                const IconUri = `http://ddragon.leagueoflegends.com/cdn/12.20.1/img/profileicon/${IconId}.png`
                const level = puuidResponse.summonerLevel

                if (isEmptyArr(RankData.data[0])) {
                    const UserProfileEmbed = new EmbedBuilder()
                        .setTitle(UserData.name)
                        .setThumbnail(IconUri)
                        .setDescription(`Level : ${level}
                        랭크 정보가 없습니다.`)
                        .setColor(0xFFFFFF)
                    msg.channel.send({ embeds: [UserProfileEmbed] })
                }
                else {
                    const Tier = RankData.data[0].tier
                    const rank = RankData.data[0].rank
                    const wins = RankData.data[0].wins
                    const losses = RankData.data[0].losses
                    const games = Number(wins) + Number(losses)
                    const UserProfileEmbed = new EmbedBuilder()
                        .setTitle(UserData.name)
                        .setThumbnail(IconUri)
                        .setDescription(`Level : ${level}
                            개인/2인 랭크
                            ${Tier} ${rank}
                            ${games}전 ${wins}승 ${losses}패`)
                        .setColor(0xFFFFFF)
                    msg.channel.send({ embeds: [UserProfileEmbed] })
                }
                function isEmptyArr(arr) {
                    if (Array.isArray(arr) && arr.length === 0) return true
                    else return false
                }
            }
        }
    } catch (e) {
        if (e.response) {
            if (e.response.data.status.status_code === 404) msg.channel.send({ embeds: [NotFoundErrorEmbed] })
        }
        else msg.channel.send({ embeds: [ErrorEmbed] })
    }
})

client.login(config.DISCORD_KEY)