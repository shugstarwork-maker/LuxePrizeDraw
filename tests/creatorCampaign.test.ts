import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CreatorCampaignDemo } from "../src/components/CreatorCampaignDemo";

test("creator preview discloses fictional identity, stock photo and inactive offer", () => {
  const html = renderToStaticMarkup(createElement(CreatorCampaignDemo));
  assert.ok(html.includes("Amber Vale"));
  assert.ok(html.includes("Fictional placeholder name"));
  assert.ok(html.includes("person pictured is not affiliated"));
  assert.ok(html.includes("No donation or token claiming"));
  assert.match(html, /<button disabled=""/);
  assert.ok(!html.includes("onlyfans.com"));
});
