const utils = require('../lib/utils')
const models = require('../models/index')

module.exports = function retrieveUserList (authenticatedUsers) {
  return (req, res, next) => {
    models.User.findAll().then(users => {
      const usersWithLoginStatus = utils.queryResultToJson(users)
      usersWithLoginStatus.data.forEach(user => {
        user.token = authenticatedUsers.tokenOf(user)
        user.password = user.password ? user.password.replace(/./g, '*') : null
      })
      res.json(usersWithLoginStatus)
    }).catch(error => {
      next(error)
    })
  }
}
