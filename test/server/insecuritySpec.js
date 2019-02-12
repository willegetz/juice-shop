'use strict';

const chai = require('chai');
const container = require('../../container');
const expect = chai.expect;

describe('insecurity', () => {
  let insecurity;
  let z85;
  beforeEach(function () {
    const testContainer = container.new();

    insecurity = testContainer.build('insecurityNew');
    z85 = container.build('z85');
  });

  describe('cutOffPoisonNullByte', () => {
    it('returns string unchanged if it contains no null byte', function () {
      const fileName = 'file.exe.pdf';

      const actualCleansedFileName = insecurity.cutOffPoisonNullByte(fileName);

      return expect(actualCleansedFileName).to.equal(fileName);
    });

    it('returns string up to null byte', function () {
      const fileNameWithNullByte = 'file.exe%00.pdf';
      const excpectedCleansedFileName = 'file.exe';

      const actualCleansedFileName = insecurity.cutOffPoisonNullByte(fileNameWithNullByte);

      return expect(actualCleansedFileName).to.equal(excpectedCleansedFileName);
    });
  });

  describe('userEmailFrom', () => {
    it('returns content of "x-user-email" header if present', () => {
      const headers = { headers: { 'x-user-email': 'test@bla.blubb' } };

      const actualEmail = insecurity.userEmailFrom(headers);
      const expectedEmail = 'test@bla.blubb';

      expect(actualEmail).to.equal(expectedEmail);
    });

    it('returns undefined if header "x-user-email" is not present', () => {
      const headersWithoutContent = { headers: {} };
      const emptyObjectForHeaders = {};

      const undefinedEmailFromHeadersWithoutContent = insecurity.userEmailFrom(headersWithoutContent);
      const undefinedEmailFromEmptyHeadersObject = insecurity.userEmailFrom(emptyObjectForHeaders);

      const expectedUndefinedEmail = undefined;

      expect(undefinedEmailFromHeadersWithoutContent).to.equal(expectedUndefinedEmail);
      expect(undefinedEmailFromEmptyHeadersObject).to.equal(expectedUndefinedEmail);
    });
  });

  describe('generateCoupon', () => {
    it('returns base85-encoded month, year and discount as coupon code', () => {
      const couponDate = new Date('1980-01-01T00:00:00');

      const actualCouponEncoded = insecurity.generateCoupon(20, couponDate);
      const expectedCouponEncoded = 'n<MiifFb4l';

      const actualCouponDecoded = z85.decode(actualCouponEncoded);
      const expectedCouponDecoded = 'JAN80-20';

      expect(actualCouponEncoded).to.equal(expectedCouponEncoded);
      expect(actualCouponDecoded.toString()).to.equal(expectedCouponDecoded);
    });

    it('uses current month and year if not specified', () => {
      const coupon20Percent = insecurity.generateCoupon(20);

      const expected20PercentCoupon = insecurity.generateCoupon(20, new Date());

      expect(coupon20Percent).to.equal(expected20PercentCoupon);
    });

    it('does not encode day of month or time into coupon code', () => {
      const coupon = insecurity.generateCoupon(10, new Date('December 01, 1999'));

      const december01WithTimestamp = insecurity.generateCoupon(10, new Date('December 01, 1999 01:00:00'));
      const december02NoTimestamp = insecurity.generateCoupon(10, new Date('December 02, 1999'));
      const december31WithTimestamp = insecurity.generateCoupon(10, new Date('December 31, 1999 23:59:59'));

      expect(coupon).to.equal(december01WithTimestamp);
      expect(coupon).to.equal(december02NoTimestamp);
      expect(coupon).to.equal(december31WithTimestamp);
    });
  });

  describe('discountFromCoupon', () => {
    it('returns undefined when not passing in a coupon code', () => {
      const undefinedCouponCode = insecurity.discountFromCoupon(undefined);
      const nullCouponCode = insecurity.discountFromCoupon(null);

      expect(undefinedCouponCode).to.equal(undefined);
      expect(nullCouponCode).to.equal(undefined);
    });

    it('returns undefined for malformed coupon code', () => {
      const emptyStringCouponCode = insecurity.discountFromCoupon('');
      const letterXCouponCode = insecurity.discountFromCoupon('x');
      const underscoresCouponCode = insecurity.discountFromCoupon('___');

      expect(emptyStringCouponCode).to.equal(undefined);
      expect(letterXCouponCode).to.equal(undefined);
      expect(underscoresCouponCode).to.equal(undefined);
    });

    it('returns undefined for coupon code not according to expected pattern', () => {
      const wordForCouponCode = insecurity.discountFromCoupon(z85.encode('Test'));
      const invalidMonthAndYear = insecurity.discountFromCoupon(z85.encode('XXX00-10'));
      const tooManyNumbersDiscountPercent = insecurity.discountFromCoupon(z85.encode('DEC18-999'));
      const notEnoughNumbersDiscountPercent = insecurity.discountFromCoupon(z85.encode('DEC18-1'));
      const fourDigitsForYear = insecurity.discountFromCoupon(z85.encode('DEC2018-10'));

      expect(wordForCouponCode).to.equal(undefined);
      expect(invalidMonthAndYear).to.equal(undefined);
      expect(tooManyNumbersDiscountPercent).to.equal(undefined);
      expect(notEnoughNumbersDiscountPercent).to.equal(undefined);
      expect(fourDigitsForYear).to.equal(undefined);
    });

    it('returns undefined for expired coupon code', () => {
      const expiredCoupon = insecurity.discountFromCoupon(z85.encode('SEP14-50'));

      expect(expiredCoupon).to.equal(undefined);
    });

    it('returns discount from valid coupon code', () => {
      const valid5Percent = insecurity.discountFromCoupon(insecurity.generateCoupon(5));
      const valid10Percent = insecurity.discountFromCoupon(insecurity.generateCoupon(10));
      const valid99Percent = insecurity.discountFromCoupon(insecurity.generateCoupon(99));

      expect(valid5Percent).to.equal(5);
      expect(valid10Percent).to.equal(10);
      expect(valid99Percent).to.equal(99);
    });
  });
});
