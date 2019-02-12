const models = require('../models/index')

module.exports = function updateUserProfile (authenticatedUsers) {
  return (req, res, next) => {
    const loggedInUser = authenticatedUsers.get(req.cookies.token)
    if (loggedInUser) {
      models.User.findByPk(loggedInUser.data.id).then(user => {
        return user.updateAttributes({ username: req.body.username })
      }).catch(error => {
        next(error)
      })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
