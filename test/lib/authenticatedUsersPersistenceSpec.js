'use strict';

const chai = require('chai');
const expect = chai.expect;
const container = require('../../container');

describe('authenticatedUsers', () => {
    const authenticatedUsers = container.build('authenticatedUsersPersistence');

    it('returns user by associated token', () => {
        authenticatedUsers.put('11111', { data: { id: 1 } });

        expect(authenticatedUsers.get('11111')).to.deep.equal({ data: { id: 1 } });
    });

    it('returns undefined if no token is passed in', () => {
        expect(authenticatedUsers.get(undefined)).to.equal(undefined);
        expect(authenticatedUsers.get(null)).to.equal(undefined);
    });

    it('returns token by associated user', () => {
        authenticatedUsers.put('11111', { data: { id: 1 } });

        expect(authenticatedUsers.tokenOf({ id: 1 })).to.equal('11111');
    });

    it('returns undefined if no user is passed in', () => {
        expect(authenticatedUsers.tokenOf(undefined)).to.equal(undefined);
        expect(authenticatedUsers.tokenOf(null)).to.equal(undefined);
    });

    it('returns user by associated token from request', () => {
        authenticatedUsers.put('11111', { data: { id: 1 } });

        expect(authenticatedUsers.from({ headers: { authorization: 'Bearer 11111' } })).to.deep.equal({ data: { id: 1 } });
    });

    it('returns undefined if no token is present in request', () => {
        expect(authenticatedUsers.from({ headers: {} })).to.equal(undefined);
        expect(authenticatedUsers.from({})).to.equal(undefined);
    });
});