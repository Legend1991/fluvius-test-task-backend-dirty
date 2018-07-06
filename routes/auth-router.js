'use strict'

const {Router} = require('express')
const controller = require('../controllers/auth-controller')

const router = Router()

router.post('/login', controller.call('login'))

module.exports = router
