'use strict'
/* eslint-disable no-await-in-loop */

const db = require('../../app/db')
const { Group, Token, User, Event } = db
const config = Object.assign({}, require('../../app/db/config'))
config.connection.filename = 'db/test.sqlite'

async function init() {

    // sanity check that we are not going to initialise the production DB
    const knex = db(config)
    if(knex.client.config.connection.filename !== config.connection.filename)
        throw new Error('not running against the test database!')

    while( (await knex.migrate.currentVersion()) !== 'none') {
        await knex.migrate.rollback()
    }
    await knex.migrate.latest()

    return knex
}

async function createToken(opts) {

    const token = Object.assign({}, opts)

    if(!token.user_id) {
        const user = await createUser()
        token.user_id = user.id
    }

    return db.Token.query().insert(token)
}

function createGroup(opts) {
    const group = Object.assign({
        id: 'test-group-1',
        name: 'test-group'
    }, opts)

    if(!group.channels) {
        group.channels = [ { id: 'c' + group.id, name: group.name + '_lfg' } ]
    }

    return db.Group.query().insertGraph(group)

}

function createUser(opts) {
    const user = Object.assign({
        id: 'test-user-1',
        name: 'test-user'
    }, opts)

    return db.User.query().insertGraph(user, { relate: true, unrelate: true })
}

module.exports = { 
    init, createGroup, createToken, 
    createUser, Group, User, Token, Event
}

