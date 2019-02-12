const utils = require('../lib/utils')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges

const container = require('../container');
const insecurity = container.build('insecurityNew');

module.exports = function retrieveBasket () {
  return (req, res, next) => {
    const id = req.params.id
    models.Basket.find({ where: { id }, include: [ { model: models.Product, paranoid: false } ] })
      .then(basket => {
        /* jshint eqeqeq:false */
        if (utils.notSolved(challenges.basketAccessChallenge)) {
          const user = insecurity.authenticatedUsers.from(req)
          if (user && id && id !== 'undefined' && user.bid != id) { // eslint-disable-line eqeqeq
            utils.solve(challenges.basketAccessChallenge)
          }
        }
        res.json(utils.queryResultToJson(basket))
      }).catch(error => {
        next(error)
      })
  }
}
