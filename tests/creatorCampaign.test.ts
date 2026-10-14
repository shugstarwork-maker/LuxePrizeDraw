import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CreatorCampaignCard, CreatorCampaignDemo } from "../src/components/CreatorCampaignDemo";

test("creator preview discloses fictional identity, stock photo and inactive offer", () => {
  const html = renderToStaticMarkup(createElement(CreatorCampaignDemo));
  assert.ok(html.includes("Amber Vale"));
  assert.ok(html.includes("Fictional placeholder name"));
  assert.ok(html.includes("person pictured is not affiliated"));
  assert.ok(html.includes("No donation or token claiming"));
  assert.match(html, /<button disabled=""/);
  assert.ok(!html.includes("onlyfans.com"));
});

test("homepage campaign card links to demo and disclaims platform endorsement", () => {
  const html = renderToStaticMarkup(createElement(CreatorCampaignCard));
  assert.ok(html.includes('href="/creator-campaigns"'));
  assert.ok(html.includes("OnlyFans Creator Charity Campaign"));
  assert.ok(html.includes("Not sponsored or endorsed by OnlyFans"));
  assert.ok(html.includes("fictional placeholder"));
});
