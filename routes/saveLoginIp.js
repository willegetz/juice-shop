const utils = require('../lib/utils')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges

module.exports = function saveLoginIp (authenticatedUsers) {
  return (req, res, next) => {
    var loggedInUser = authenticatedUsers.from(req)
    if (loggedInUser !== undefined) {
      var lastLoginIp = req.headers['true-client-ip']
      if (utils.notSolved(challenges.httpHeaderXssChallenge) && lastLoginIp === '<iframe src="javascript:alert(`xss`)>') {
        utils.solve(challenges.httpHeaderXssChallenge)
      }
      if (lastLoginIp === undefined) {
        lastLoginIp = req.connection.remoteAddress
      }
      models.User.findByPk(loggedInUser.data.id).then(user => {
        user.updateAttributes({ lastLoginIp: lastLoginIp }).then(user => {
          res.json(user)
        }).catch(error => {
          next(error)
        })
      }).catch(error => {
        next(error)
      })
    } else {
      res.sendStatus(401)
    }
  }
}
