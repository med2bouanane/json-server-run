const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const server = express()

// const server = jsonServer.create()

const router = jsonServer.router('./db.json')

// server.use(jsonServer.defaults());
// app.use(cors())
server.use(cors())
server.use(bodyParser.urlencoded({extended: true}))
server.use(bodyParser.json())

const userdb = JSON.parse(fs.readFileSync('./users.json', 'UTF-8'))

const SECRET_KEY = '123456789'
const expiresIn = 60 * 1//'1h'

// Create a token from a payload 
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn })
}

// Verify the token 
function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY, (err, decode) => decode !== undefined ? decode : err)
}

// Check if the user exists in database
function isAuthenticated({ email, password }) {
    return userdb.users.findIndex(user => user.email === email && user.password === password) !== -1
}

  server.post('/signup', (req, res) => {
  console.log('req -------------->',JSON.stringify(req.body) )
    const userReq = req.body
    console.log('req -------------->',userReq )
    if (userdb.users.findIndex(user => user.email === userReq.email) === -1) {
    const access_token = createToken({email:userReq.email, password:userReq.password})
    res.status(200).json({access_token})
    userReq.id = Date.now()
    userdb.users.push(userReq)
      return
    }
      const status = 500
      const message = 'This email already exists'
      res.status(status).json({status, message})
  })


server.post('/auth/login', (req, res) => {
  console.log('req -------------->',JSON.stringify(req.body) )
    const {email, password} = req.body
    if (isAuthenticated({email, password}) === false) {
      const status = 401
      const message = 'Incorrect email or password'
      res.status(status).json({status, message})
      return
    }
    const access_token = createToken({email, password})
    res.status(200).json({access_token})
  })

server.post('/upload', upload.array('test', 12), function (req, res, next) {
  // req.files is array of `files` files
  // req.body will contain the text fields, if there were any
  console.log('files -------------->')//,JSON.stringify(req.files) )
})
  server.use('/',  (req, res, next) => {
    // server.use(/^(?!\/auth).*$/,  (req, res, next) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
      const status = 401
      const message = 'Bad authorization header'
      res.status(status).json({status, message})
      return
    }
    try {
       verifyToken(req.headers.authorization.split(' ')[1])
       next()
    } catch (err) {
      const status = 401
      const message = 'Error: access_token is not valid'
      res.status(status).json({status, message})
    }
  })


server.get('/users', (req, res) => {
    console.log('req -------------->',userdb.users)
    res.status(200).json(userdb.users)
  })
  // server.use(router)
  server.use('/', jsonServer.defaults(), router);

server.listen(3000, () => {
  console.log('Run Auth API Server')
})