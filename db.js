const config = require('./config')
const MongoClient = require('mongodb').MongoClient
const argon2 = require('argon2')

class DB {
  static async getInstance () {
    if (!DB._db) {
      let client = await MongoClient.connect(config.db.url, {useNewUrlParser: true})
      DB._db = client.db(config.db.name)

      await DB._db.collection('users').updateOne({
        email: config.defaultUser.email
      }, {
        $set: {
          email: config.defaultUser.email,
          passwordHash: await argon2.hash(config.defaultUser.password)
        }
      }, {
        upsert: true
      })
    }

    return DB._db
  }
}

module.exports = DB
