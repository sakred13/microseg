const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const companion = require('@uppy/companion')

const app = express()
const HOST_URL = process.env.HOST_URL;

app.use(bodyParser.json())
app.use(session({
  secret: 'some-secret',
  resave: true,
  saveUninitialized: true,
}))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  next()
})

// Routes
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/plain')
  res.send('Welcome to Companion')
})

// initialize uppy
const companionOptions = {
  providerOptions: {
    drive: {
      key: '848148244825-4sepur31cfcrkc1skh6mt8fiaighv3b2.apps.googleusercontent.com',
      secret: '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',
    },
    dropbox: {
      key: '2ylh7cmi8fvh3wk',
      secret: '20byyrz4usxwoxz',
    },
    onedrive: {
      key: 'f85bb582-efc7-4b3e-8d2b-96319b3dbd48',
      secret: 'f8cdef31-a31e-4b4a-93e4-5f571e91255a',
    }
    // you can also add options for additional providers here
  },
  server: {
    host: `${HOST_URL}:3020`,
    protocol: 'http',
  },
  filePath: 'uploads',
  secret: 'some-secret',
  debug: true,
}

const { app: companionApp } = companion.app(companionOptions)
app.use(companionApp)

// handle 404
app.use((req, res) => {
  return res.status(404).json({ message: 'Not Found' })
})

// handle server errors
app.use((err, req, res) => {
  console.error('\x1b[31m', err.stack, '\x1b[0m')
  res.status(err.status || 500).json({ message: err.message, error: err })
})

companion.socket(app.listen(3020))

console.log('Welcome to Companion!')
console.log(`Listening on http://0.0.0.0:${3020}`)
