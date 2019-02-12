'use strict'

const chai = require('chai')
const container = require('../../container');
const expect = chai.expect

describe('insecurity', () => {
  let insecurity;

  beforeEach(function () {
    const testContainer = container.new();

    insecurity = testContainer.build('insecurityNew');
  });

  describe('cutOffPoisonNullByte', () => {
    it('returns string unchanged if it contains no null byte', function () {
      const fileName = 'file.exe.pdf';

      const cleansedFileName = insecurity.cutOffPoisonNullByte(fileName);

      return expect(cleansedFileName).to.equal(fileName);
    })

    it('returns string up to null byte', function () {
      const fileNameWithNullByte = 'file.exe%00.pdf';
      const excpectedCleansedFileName = 'file.exe';

      const actualCleansedFileName = insecurity.cutOffPoisonNullByte(fileNameWithNullByte);

      return expect(actualCleansedFileName).to.equal(excpectedCleansedFileName);
    })
  })

  describe('userEmailFrom', () => {
    it('returns content of "x-user-email" header if present', () => {
      expect(insecurity.userEmailFrom({ headers: { 'x-user-email': 'test@bla.blubb' } })).to.equal('test@bla.blubb')
    })

    it('returns undefined if header "x-user-email" is not present', () => {
      expect(insecurity.userEmailFrom({ headers: {} })).to.equal(undefined)
      expect(insecurity.userEmailFrom({})).to.equal(undefined)
    })
  })

  describe('generateCoupon', () => {
    const z85 = require('z85')

    it('returns base85-encoded month, year and discount as coupon code', () => {
      const couponDate = new Date('1980-01-01T00:00:00');

      const actualCouponEncoded = insecurity.generateCoupon(20, couponDate);
      const expectedCouponEncoded = 'n<MiifFb4l';

      const actualCouponDecoded = z85.decode(actualCouponEncoded);
      const expectedCouponDecoded = 'JAN80-20';

      expect(actualCouponEncoded).to.equal(expectedCouponEncoded);
      expect(actualCouponDecoded.toString()).to.equal(expectedCouponDecoded);
    })

    it('uses current month and year if not specified', () => {
      const coupon = insecurity.generateCoupon(20)
      expect(coupon).to.equal(insecurity.generateCoupon(20, new Date()))
    })

    it('does not encode day of month or time into coupon code', () => {
      const coupon = insecurity.generateCoupon(10, new Date('December 01, 1999'))
      expect(coupon).to.equal(insecurity.generateCoupon(10, new Date('December 01, 1999 01:00:00')))
      expect(coupon).to.equal(insecurity.generateCoupon(10, new Date('December 02, 1999')))
      expect(coupon).to.equal(insecurity.generateCoupon(10, new Date('December 31, 1999 23:59:59')))
    })
  })

  describe('discountFromCoupon', () => {
    const z85 = require('z85')

    it('returns undefined when not passing in a coupon code', () => {
      expect(insecurity.discountFromCoupon(undefined)).to.equal(undefined)
      expect(insecurity.discountFromCoupon(null)).to.equal(undefined)
    })

    it('returns undefined for malformed coupon code', () => {
      expect(insecurity.discountFromCoupon('')).to.equal(undefined)
      expect(insecurity.discountFromCoupon('x')).to.equal(undefined)
      expect(insecurity.discountFromCoupon('___')).to.equal(undefined)
    })

    it('returns undefined for coupon code not according to expected pattern', () => {
      expect(insecurity.discountFromCoupon(z85.encode('Test'))).to.equal(undefined)
      expect(insecurity.discountFromCoupon(z85.encode('XXX00-10'))).to.equal(undefined)
      expect(insecurity.discountFromCoupon(z85.encode('DEC18-999'))).to.equal(undefined)
      expect(insecurity.discountFromCoupon(z85.encode('DEC18-1'))).to.equal(undefined)
      expect(insecurity.discountFromCoupon(z85.encode('DEC2018-10'))).to.equal(undefined)
    })

    it('returns undefined for expired coupon code', () => {
      expect(insecurity.discountFromCoupon(z85.encode('SEP14-50'))).to.equal(undefined)
    })

    it('returns discount from valid coupon code', () => {
      expect(insecurity.discountFromCoupon(insecurity.generateCoupon(5))).to.equal(5)

      expect(insecurity.discountFromCoupon(insecurity.generateCoupon(10))).to.equal(10)
      expect(insecurity.discountFromCoupon(insecurity.generateCoupon(99))).to.equal(99)
    })
  })
})
