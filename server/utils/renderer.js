// Node.js Modules
import express from 'express'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import _ from 'underscore'

// Required for initializing Express app in Cloud Code.
const app = express()

// Global app configuration section
app.set('views', 'server/views')
app.set('view engine', 'jade')
app.use(bodyParser())
app.use(methodOverride())

app.locals._ = _

export default app
