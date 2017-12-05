'use strict'

if (!global._babelPolyfill) require('babel-polyfill')

import bodyparser from 'body-parser'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import path from 'path'

import { sendBoxSummary } from './jobs'

dotenv.config()

const app = express()

app.use(morgan('combined'))
app.use(bodyparser.urlencoded({ extended: true }))

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '../public')))

app.get('*', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.post('/summary', function(req, res) {
	const updateDiff = req.body['update-diff'] === 'true'

	sendBoxSummary(updateDiff).then(
		result => res.status(200).send(result),
		() => res.status(500).end()
	)
})

var port = process.env.PORT || 1337
var httpServer = require('http').createServer(app)
httpServer.listen(port, function() {
	console.log('balderton-mailer running on port ' + port + '.')
})
