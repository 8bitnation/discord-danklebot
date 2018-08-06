'use strict'

const logger = require('./util/logger')
const Discord = require('discord.js')
const client = new Discord.Client()
const { format } = require('util')

const Token = require('./db/token')
const User = require('./db/user')
const Group = require('./db/group')

/**
 * look for every _lfg channel and add it to the possible target list
 */
async function syncChannels() {
    
}

function lfgChannels() {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return []

    const lfg = guild.channels.findAll( ch => ch.name.endsWith('_lfg'))

    return lfg

}

/**
 * Get a list of platforms the user is enrolled to
 * @param {*} user_id 
 */
function platforms(user_id) {
    // should probably get these from the DB
    return [
        { id: 1, name: 'Playstation', code: 'PS' },
        { id: 2, name: 'Xbox', code: 'XB' },
        { id: 3, name: 'PC', code: 'PC' },
        { id: 4, name: 'Nintendo', code: 'N' }
    ]
}

/**
 * 
 */
async function games(user_id) {
    const guild = client.guilds.get(process.env.DISCORD_GUILD)
    if(!guild) return []

    const member = await guild.fetchMember(user_id)


}

/**
 * we have to be able to test this async, so we explicitly define and export it
 */
async function messageHandler(msg) {
    if(['/team', '!team'].some( cmd => msg.content.startsWith(cmd)) ) {
        // process the message
        logger.info('message received: %s %s', msg.id, msg.content)
        try {
            await msg.delete()
        } catch(err) {
            logger.error('failed to remove message: %s', msg.id)
        }

        // ignore anything not from a guild
        if(!msg.member || !msg.channel) return

        try {
            // create a token
            const user = await User.query().upsertGraph({
                id: msg.author.id,
                name: msg.member.nickname || msg.author.username
            }, { insertMissing: true })
            const group = await Group.query().upsertGraph({
                id: msg.channel.id,
                name: msg.channel.name
            }, { insertMissing: true })
            const token = await Token.query().insert({
                user_id: user.id,
                group_id: group.id
            })

            await msg.author.send('Please click on the following link to use the team tool: ' + 
                process.env.HOST_URL + '/auth/' + token.id )
        } catch(err) {
            logger.error('something went wrong when dealing with message: %s', msg.id, err)
        }   

    } 
}

client.on('message', messageHandler)

function login(token) {

    const p = new Promise((resolve, reject) => {
        client.once('ready', () => {
            logger.info(`Logged in as ${client.user.tag}`)
            // if no guild is specified, get the first one
            if(!process.env.DISCORD_GUILD) {
                const g = client.guilds.first()
                process.env.DISCORD_GUILD = g.id
            }
        
            const guild = client.guilds.get(process.env.DISCORD_GUILD)
            if(!guild) {
                return reject(format('unable to find guild ID %s', process.env.DISCORD_GUILD))
            }
        
            logger.info('managing guild: %s', guild.name)
            resolve(guild)
        })
    })

    client.login(token)
    return p
}

module.exports = { login, messageHandler, syncChannels, platforms, games, lfgChannels }