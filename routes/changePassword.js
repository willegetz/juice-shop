const utils = require('../lib/utils')
const models = require('../models/index')
const cache = require('../data/datacache')
const challenges = cache.challenges

const container = require('../container');
const insecurity = container.build('insecurityNew');

module.exports = function changePassword (authenticatedUsers) {
  return ({ query, headers, connection }, res, next) => {
    const currentPassword = query.current
    const newPassword = query.new
    const repeatPassword = query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send('Password cannot be empty.')
    } else if (newPassword !== repeatPassword) {
      res.status(401).send('New and repeated password do not match.')
    } else {
      const token = headers['authorization'] ? headers['authorization'].substr('Bearer='.length) : null
      const loggedInUser = authenticatedUsers.get(token)
      if (loggedInUser) {
        if (currentPassword && insecurity.hash(currentPassword) !== loggedInUser.data.password) {
          res.status(401).send('Current password is not correct.')
        } else {
          models.User.findByPk(loggedInUser.data.id).then(user => {
            user.updateAttributes({ password: newPassword }).then(user => {
              if (utils.notSolved(challenges.csrfChallenge) && user.id === 3 && !currentPassword) {
                if (user.password === insecurity.hash('slurmCl4ssic')) {
                  utils.solve(challenges.csrfChallenge)
                }
              }
              res.json({ user })
            }).catch(error => {
              next(error)
            })
          }).catch(error => {
            next(error)
          })
        }
      } else {
        next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
      }
    }
  }
}
