'use strict';
const utils = require('./utils');

function authenticatedUsersPersistence() {
  return {
    tokenMap: {},
    idMap: {},
    put: function (token, user) {
      this.tokenMap[token] = user;
      this.idMap[user.data.id] = token;
    },
    get: function (token) {
      return token ? this.tokenMap[utils.unquote(token)] : undefined;
    },
    tokenOf: function (user) {
      return user ? this.idMap[user.id] : undefined;
    },
    from: function (req) {
      const token = utils.jwtFrom(req);
      return token ? this.get(token) : undefined;
    }
  };
}

module.exports = authenticatedUsersPersistence;