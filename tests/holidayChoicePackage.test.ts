import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuxuryHolidaysSection, HOLIDAY_PACKAGE } from '../src/components/LuxuryHolidaysSection';
test('destinations are examples for one proposed package with spending money included in total', () => {
 const html=renderToStaticMarkup(createElement(LuxuryHolidaysSection));
 assert.equal(HOLIDAY_PACKAGE.proposedValueGBP,50000); assert.equal(HOLIDAY_PACKAGE.spendingMoneyGBP,25000);
 for(const text of ['Luxe Holiday Package of Your Choice','£25,000 spending money','Five-star hotel','Limousine transfers','Business-class flights','not separate prizes','not independently verified','Pending approval']) assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/1p preview|£5,000 Luxury Shopping Budget/);
});
