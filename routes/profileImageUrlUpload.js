const fs = require('fs')
const models = require('../models/index')
const request = require('request')

module.exports = function profileImageUrlUpload (authenticatedUsers) {
  return (req, res, next) => {
    if (req.body.imageUrl !== undefined) {
      const url = req.body.imageUrl
      if (url.match(/(.)*solve\/challenges\/server-side(.)*/) !== null) {
        req.app.locals.abused_ssrf_bug = true
      }
      const loggedInUser = authenticatedUsers.get(req.cookies.token)
      if (loggedInUser) {
        request
          .get(url)
          .on('error', function (err) {
            console.log(err)
          })
          .pipe(fs.createWriteStream('frontend/dist/frontend/assets/public/images/uploads/' + loggedInUser.data.id + '.jpg'))
        models.User.findByPk(loggedInUser.data.id).then(user => {
          return user.updateAttributes({ profileImage: loggedInUser.data.id + '.jpg' })
        }).catch(error => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
      }
    }
    res.location('/profile')
    res.redirect('/profile')
  }
}
