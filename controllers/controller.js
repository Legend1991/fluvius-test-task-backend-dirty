'use strict'

class Controller {
  call (method) {
    return async (req, res, next) => {
      try {
        let result = await this[method](req, res)
        if (result) {
          res.json({result})
        }
      } catch (error) {
        res.status(500).json({errors: [{message: error.message}]})
      }
    }
  }
}

module.exports = Controller
