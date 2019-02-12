const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

const container = require('../../container');

describe('currentUser', () => {
  const retrieveLoggedInUser = require('../../routes/currentUser')
  let authenticatedUsers;

  beforeEach(() => {
    const testContainer = container.new();

    this.req = { cookies: {}, query: {} }
    this.res = { json: sinon.spy() }

    authenticatedUsers = testContainer.build('authenticatedUsersPersistence');
  })

  it('should return neither ID nor email if no cookie was present in the request headers', () => {
    this.req.cookies.token = ''

    retrieveLoggedInUser(authenticatedUsers)(this.req, this.res)

    expect(this.res.json).to.have.been.calledWith({ user: { id: undefined, email: undefined, lastLoginIp: undefined } })
  })

  it('should return ID and email of user belonging to cookie from the request', () => {
    this.req.cookies.token = 'token12345'
    this.req.query.callback = undefined
    authenticatedUsers.put('token12345', { data: { id: 42, email: 'test@juice-sh.op', lastLoginIp: '0.0.0.0' } })

    retrieveLoggedInUser(authenticatedUsers)(this.req, this.res)


    expect(this.res.json).to.have.been.calledWith({ user: { id: 42, email: 'test@juice-sh.op', lastLoginIp: '0.0.0.0' } })
  })
})
