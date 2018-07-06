'use strict'

const Controller = require('./controller')
const validator = require('../validator')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const config = require('../config')
const DB = require('../db')

class AuthController extends Controller {
  async login (req, res) {
    const { email = '', password = '' } = req.body

    if (!validator.isEmail(email)) {
      return res.status(422).json({
        errors: [{field: 'email', message: 'Bad email format'}]
      })
    }

    let user = await DB.getInstance().collection('users').findOne({email})

    if (!user || !(await this._verifyPassword(user.passwordHash, password))) {
      return res.status(422).json({
        errors: [
          {field: 'email', message: 'Wrong email or password'},
          {field: 'password', message: 'Wrong email or password'}
        ]
      })
    }

    let token = await this._generateToken({email})

    await DB.getInstance().collection('users').updateOne({
      email: email
    }, {
      $set: {
        token: token
      }
    })

    return token
  }

  async _verifyPassword (hash, password) {
    return argon2.verify(hash, password)
  }

  async _generateToken (data) {
    return jwt.sign(data, config.secret, {expiresIn: '1d', algorithm: 'HS384'})
  }
}

module.exports = new AuthController()
