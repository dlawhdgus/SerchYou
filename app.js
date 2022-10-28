const config = require('./config')
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js')
const EmbedViews = require('./embeds')
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

client.on('messageCreate', async msg => {
    try {
        const content = msg.content
        const CommandFilter = content.startsWith(config.PERFIX)
        const EmbedSendTemplate = (EmbedName) => {
            msg.channel.send({ embeds: [EmbedName] })
        }
        if (CommandFilter) {
            const username = content.split('!')[1]
            const ContentFilter = username.split(' ')[1]

            if (username === '봇 사용법') {
                const HelpCommand = EmbedViews.helper()
                EmbedSendTemplate(HelpCommand)
            }
            else if (ContentFilter === '전적' || ContentFilter === 'wjswjr') {
                msg.channel.send(`*계 산 중*`)
                const user = await EmbedViews.RecentGames(username)
                EmbedSendTemplate(user)
            }
            else if (ContentFilter === 'vs') {
                msg.channel.send(`*계 산 중*`)
                const PlayerDiffEmbed = await EmbedViews.DiffUsers(username)
                EmbedSendTemplate(PlayerDiffEmbed)
            } else {
                const UserProfile = await EmbedViews.UserProfile(username)
                EmbedSendTemplate(UserProfile)
            }
        }
    } catch (e) {
        const NotFoundError = EmbedViews.NotFoundError()
        const ServerError = EmbedViews.ServerError()
        if (e.response) {
            if (e.response.data.status.status_code === 404) msg.channel.send({embeds : [NotFoundError]})
        }
        else msg.channel.send({embeds : [ServerError]})
    }
})

client.login(config.DISCORD_KEY)