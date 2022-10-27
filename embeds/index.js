const Discord = require('discord.js')
const { EmbedBuilder } = require('discord.js')
const GetApiData = require('../modules')

module.exports.helper = () => {
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

    return help
}

module.exports.NotFoundError = () => {
    const NotFoundError = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('소환사가 없습니다.')
        .setColor(0xFF0000)

    return NotFoundError
}

module.exports.ServerError = () => {
    const ServerError = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('server error')
        .setColor(0xFF0000)

    return ServerError
}

module.exports.DiffUsers = async (username) => {
    const player1Username = username.split(' ')[0]
    const player2Username = username.split(' ')[2]
    const player = await GetApiData.DiffPlayers(player1Username, player2Username)

    const PlayerDiffembed = new EmbedBuilder()
        .setTitle(`${player.Player1.Player1Username}      VS      ${player.Player2.Player2Username}`)
        .setDescription(`승률
        ${player.Player1.Player1WinRate}% ${player.Player2.Player2WinRate}%
        KDA
        ${player.Player1.Player1KdaRate} ${player.Player2.Player2KdaRate}
        `)
        .setColor(0x0F0F0F)

    return PlayerDiffembed
}

module.exports.UserProfile = async (username) => {
    const puuidResponse = await GetApiData.GetPuuid(username)
    const UserData = puuidResponse
    const RankData = await GetApiData.GetRankData(UserData.id)
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

        return UserProfileEmbed
    } else {
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

        return UserProfileEmbed
    }

    function isEmptyArr(arr) {
        if (Array.isArray(arr) && arr.length === 0) return true
        else return false
    }

}

module.exports.RecentGames = async (username) => {
    const User = await GetApiData.UserDataTemplate(username)
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
    return UserGames
}