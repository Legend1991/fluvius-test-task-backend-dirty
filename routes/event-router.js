'use strict'

const {Router} = require('express')
const controller = require('../controllers/event-controller')

const router = Router()

router.post('/', controller.call('createEvent'))
router.get('/', controller.call('getEvents'))
router.put('/:id', controller.call('updateEvent'))
router.delete('/:id', controller.call('removeEvent'))

module.exports = router
