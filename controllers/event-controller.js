'use strict'

const Controller = require('./controller')
const validator = require('../validator')
const jwt = require('jsonwebtoken')
const config = require('../config')
const DB = require('../db')
const ObjectID = require('mongodb').ObjectID

class EventController extends Controller {
  async createEvent (req, res, next) {
    let {name, date} = req.body
    let token = req.headers && req.headers.authorization

    let authorized = await this._auth(token)

    if (!authorized) {
      res.status(403).json({
        errors: [{message: 'Invalid authorization token'}]
      })
      return
    }

    let errors = this._validateCreateEventInput({name, date})

    if (errors.length) {
      res.status(422).json({errors})
      return
    }

    let db = await DB.getInstance()
    let insertRes = await db.collection('events').updateOne({
      _id: new ObjectID()
    }, {
      $set: {name, date}
    }, {
      upsert: true
    })

    if (insertRes.result.upserted) {
      return insertRes.result.upserted[0]._id
    }
  }

  async getEvents (req, res, next) {
    let token = req.headers && req.headers.authorization
    let {offset, limit, from, to} = req.query

    let authorized = await this._auth(token)

    if (!authorized) {
      res.status(403).json({
        errors: [{message: 'Invalid authorization token'}]
      })
      return
    }

    let errors = this._validateGetEventsInput({offset, limit, from, to})

    if (errors.length) {
      res.status(422).json({errors})
      return
    }

    offset = Number(offset)
    limit = Number(limit)

    let db = await DB.getInstance()
    let cursor = await db.collection('events')
      .find()
      .skip(offset)
      .limit(limit)
      .sort({date: 1})

    if (from || to) {
      let filter = {}

      if (from) {
        filter.$gte = (new Date(from)).toISOString()
      }

      if (to) {
        filter.$lte = (new Date(to)).toISOString()
      }

      cursor.filter({
        date: filter
      })
    }

    return cursor.toArray()
  }

  async updateEvent (req, res, next) {
    let token = req.headers && req.headers.authorization
    let {name, date} = req.body
    let {id} = req.params

    let authorized = await this._auth(token)

    if (!authorized) {
      res.status(403).json({
        errors: [{message: 'Invalid authorization token'}]
      })
      return
    }

    let errors = this._validateUpdateEventInput({name, date})

    if (errors.length) {
      res.status(422).json({errors})
      return
    }

    let db = await DB.getInstance()
    let event = await db.collection('events').findOne({
      _id: ObjectID.createFromHexString(id)
    })

    if (!event) {
      res.status(404).json({
        errors: [{message: `Event with id '${id}' is not exist`}]
      })
      return
    }

    await db.collection('events').updateOne({
      _id: event._id
    }, {
      $set: {
        name: name,
        date: new Date(date).toISOString()
      }
    }, {
      upsert: true
    })

    return id
  }

  async removeEvent (req, res, next) {
    let token = req.headers && req.headers.authorization
    let {id} = req.params

    let authorized = await this._auth(token)

    if (!authorized) {
      res.status(403).json({
        errors: [{message: 'Invalid authorization token'}]
      })
      return
    }

    let db = await DB.getInstance()
    let event = await db.collection('events').findOne({
      _id: ObjectID.createFromHexString(id)
    })

    if (!event) {
      res.status(404).json({
        errors: [{message: `Event with id '${id}' is not exist`}]
      })
      return
    }

    await db.collection('events').deleteOne({
      _id: event._id
    })

    return id
  }

  async _auth (token) {
    let {email} = await this._decodeToken(token)

    if (!email) {
      return false
    }

    let db = await DB.getInstance()
    let user = await db.collection('users').findOne({email})

    if (!user || user.token !== token) {
      return false
    }

    return true
  }

  async _decodeToken (token) {
    try {
      return jwt.verify(token, config.secret, {algorithm: 'HS384'})
    } catch (error) {
    }
  }

  _validateCreateEventInput ({name, date}) {
    return this._validateEventData({name, date})
  }

  _validateUpdateEventInput ({name, date}) {
    return this._validateEventData({name, date})
  }

  _validateEventData ({name, date}) {
    let errors = []

    if (validator.isEmpty(name)) {
      errors.push({field: 'name', message: 'Name is required'})
    }

    if (validator.isEmpty(date)) {
      errors.push({field: 'date', message: 'Date is required'})
    }

    if (!validator.isDate(date)) {
      errors.push({field: 'date', message: 'Should be a date string'})
    }

    return errors
  }

  _validateGetEventsInput ({offset, limit, from, to}) {
    let errors = []

    if (!validator.isUint(offset)) {
      errors.push({
        field: 'offset',
        message: 'Should be an integer number and greater or equal zero'
      })
    }

    if (!validator.isUint(limit)) {
      errors.push({
        field: 'limit',
        message: 'Should be an integer number and greater or equal zero'
      })
    }

    if (from && !validator.isDate(from)) {
      errors.push({
        field: 'from',
        message: 'Should be a date string'
      })
    }

    if (to && !validator.isDate(to)) {
      errors.push({
        field: 'to',
        message: 'Should be a date string'
      })
    }

    return errors
  }
}

module.exports = new EventController()
