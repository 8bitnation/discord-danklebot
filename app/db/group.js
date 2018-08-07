'use strict'

const { Model } = require('objection')

class Group extends Model {
    static get tableName() {
        return 'group'
    }

    async $beforeUpdate(context) {
        await super.$beforeUpdate(context)
        this.updated_at = new Date().toISOString()
    }
}

module.exports = Group