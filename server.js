'use strict'

const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const compression = require('compression')
const helmet = require('helmet')
const config = require('./config')
const routes = require('./routes/routes')

const app = express()

app.use(helmet())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(morgan('tiny'))
app.disable('x-powered-by')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json({limit: '100mb'}))
app.use(compression({threshold: 0}))
app.use('/api', routes)

app.listen(config.port, () => {
  console.log('Server started on port: ', config.port)
})
