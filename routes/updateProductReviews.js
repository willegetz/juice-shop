const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')

module.exports = function productReviews (authenticatedUsers) {
  return (req, res, next) => {
    const id = req.body.id
    const user = authenticatedUsers.from(req)
    db.reviews.update(
      { _id: id },
      { '$set': { message: req.body.message } },
      { multi: true }
    ).then(
      result => {
        if (result.modified > 1 && utils.notSolved(challenges.noSqlReviewsChallenge)) {
          // More than one Review was modified => challange solved
          utils.solve(challenges.noSqlReviewsChallenge)
        }
        if (user && user.data && result.original[0].author !== user.data.email && utils.notSolved(challenges.forgedReviewChallenge && result.modified === 1)) {
          utils.solve(challenges.forgedReviewChallenge)
        }
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}
