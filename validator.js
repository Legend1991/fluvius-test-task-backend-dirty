const validator = require('validator')

class Validator {
  isEmail (arg) {
    if (this.isEmpty(arg)) {
      return false
    }

    arg = this._toString(arg)

    return validator.isEmail(arg)
  }

  isEmpty (arg) {
    if (!arg) {
      return true
    }

    arg = this._toString(arg)

    if (arg.length === 0) {
      return true
    }

    return false
  }

  isDate (arg) {
    if (this.isEmpty(arg)) {
      return false
    }

    arg = this._toString(arg)

    return (new Date(arg)).toString() !== 'Invalid Date'
  }

  isNumeric (arg) {
    return !isNaN(parseFloat(arg)) && isFinite(arg)
  }

  isUnsigned (arg) {
    if (!this.isNumeric(arg)) {
      return false
    }

    return arg >= 0
  }

  isUint (arg) {
    if (!this.isUnsigned(arg)) {
      return false
    }

    arg = Number(arg)

    return Number.isInteger(arg)
  }

  _toString (arg) {
    return String(arg).trim()
  }
}

module.exports = new Validator()
