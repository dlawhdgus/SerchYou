const config = require('./config')
const { Client, GatewayIntentBits } = require('discord.js')
const EmbedViews = require('./embeds')
const DBConnect = require('./db_connect')
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
    if (DBConnect.connectstring) console.log('DB Connected!!')
})

client.on('messageCreate', async msg => {
    try {
        const content = msg.content
        const CommandFilter = '<@1034353521061007402>'

        const EmbedSendTemplate = (EmbedName) => {
            msg.channel.send({ embeds: [EmbedName] })
        }

        if (CommandFilter) {
            const CommandContent = content.split(' ')
            const username = content.split('"')

            if (msg.author.id === '1034353521061007402') {
                return
            } else {
                if (!(CommandContent[0] === '<@1034353521061007402>')) {
                    return
                } else {
                    if (String(CommandContent) === CommandFilter) {
                        const HelpCommand = EmbedViews.helper()
                        EmbedSendTemplate(HelpCommand)
                    } else if (CommandContent[2] === '전적' || CommandContent[2] === 'wjswjr') {
                        msg.channel.send(`*계 산 중*`)
                        const user = await EmbedViews.RecentGames(username[1])
                        EmbedSendTemplate(user)
                    } else if (CommandContent[2] === 'vs') {
                        msg.channel.send(`*계 산 중*`)
                        const PlayerDiffEmbed = await EmbedViews.DiffUsers(username)
                        EmbedSendTemplate(PlayerDiffEmbed)
                    } else if (username[2]) {
                        const champions = await EmbedViews.ChampionsLevel(username)
                        EmbedSendTemplate(champions)
                    } else if (username[1]) {
                        const UserProfile = await EmbedViews.UserProfile(username[1])
                        EmbedSendTemplate(UserProfile)
                    } else {
                        const WrongCommand = EmbedViews.WrongCommand()
                        EmbedSendTemplate(WrongCommand)
                    }
                }
            }
        }
        else return
    } catch (e) {
        console.log(e)
        const NotFoundError = EmbedViews.NotFoundError()
        const ServerError = EmbedViews.ServerError()
        if (e.response) {
            if (e.response.data.status.status_code === 404) msg.channel.send({ embeds: [NotFoundError] })
        }
        else msg.channel.send({ embeds: [ServerError] })
    }
})

client.login(config.DISCORD_KEY)