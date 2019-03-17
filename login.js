module.exports = (req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    if (req.body.email === 'admin@vue.com' && req.body.password === '@Password1') {
      res.status(200).json({})
    } else {
      res.status(401).json({})
    }
  } else {
    next()
  }
}
