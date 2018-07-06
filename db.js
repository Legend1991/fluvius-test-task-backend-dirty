const config = require('./config')
const MongoClient = require('mongodb').MongoClient

class DB {
  static async getInstance () {
    if (!DB._db) {
      let client = await MongoClient.connect(config.db.url, {useNewUrlParser: true})
      DB._db = client.db(config.db.name)
    }

    return DB._db
  }
}

module.exports = DB
