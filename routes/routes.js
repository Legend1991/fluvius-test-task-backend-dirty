'use strict'

const { Router } = require('express')
const authRouter = require('./auth-router')
// const eventRouter = require('./event-router')

const router = Router()

router.use('/', authRouter)
// router.use('/events', eventRouter)

module.exports = router
