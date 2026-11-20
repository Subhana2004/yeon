/** Run with Node 22+, Playwright 1.56.1, axe-core 4 and installed Chromium. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("../", import.meta.url)),
  output = resolve(root, "artifacts/index-reader");
const require = createRequire(import.meta.url);
const types = {
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = resolve(
    root,
    "." + (path.endsWith("/") ? path + "index.html" : path),
  );
  if (!file.startsWith(resolve(root) + sep)) {
    res.writeHead(404).end();
    return;
  }
  try {
    const bytes = await readFile(file);
    res
      .writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
      })
      .end(bytes);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + server.address().port + "/app-index/";
const browser = await chromium.launch();
await mkdir(output, { recursive: true });
const errors = [],
  violations = [],
  widths = [1440, 1280, 1024, 768, 430, 390, 360, 320];
const routes = [
  "explore",
  "dna",
  "dna?lab=arbor",
  "compare",
  "radar",
  "constellation",
  "doors",
  "fit",
  "faceoff",
  "tools",
  "paper?id=dpr",
  "opportunity?id=reading-placement",
  "sources",
];
const page = await browser.newPage();
page.on("pageerror", (e) => errors.push(e.message));
const go = async (hash) => {
  await page.goto(base + "#" + hash);
  await page.waitForFunction(
    () => document.title.includes("· YEON") && !!document.querySelector("h1"),
  );
  await page.evaluate(() => document.fonts.ready);
};
const ready = async () => {
  await page.waitForTimeout(70);
};
const accessibility = async (label) => {
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const v = await page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
      },
    });
    return r.violations.map((v) => ({
      rule: v.id,
      nodes: v.nodes.map((n) => n.target),
    }));
  });
  if (v.length) violations.push({ label, v });
};
try {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await go(route);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "overflow " + width + " " + route,
      );
      if ([1440, 390].includes(width)) await accessibility(width + " " + route);
      if (
        route === "explore" ||
        ([1440, 768, 390].includes(width) &&
          [
            "dna?lab=arbor",
            "constellation",
            "faceoff",
            "fit",
            "compare",
            "doors",
            "radar",
          ].includes(route))
      )
        await page.screenshot({
          path: resolve(output, route.split("?")[0] + "-" + width + ".png"),
        });
    }
    console.log("PASS 13 routes at " + width + "px");
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await go("dna");
  assert.equal(await page.locator(".ld-item").count(), 8);
  await page.locator('[name="institution"]').selectOption("Sample Institute A");
  await ready();
  assert.equal(await page.locator(".ld-item").count(), 3);
  await page.locator('[name="department"]').selectOption("School of Computing");
  await ready();
  assert.equal(await page.locator(".ld-item").count(), 2);
  await page.getByRole("searchbox").fill("arbor");
  await ready();
  assert.equal(await page.locator(".ld-item").count(), 1);
  await page.locator(".ld-open").click();
  await ready();
  assert.match(await page.locator("h1").innerText(), /Arbor/);
  await page.getByRole("link", { name: "← Lab directory" }).click();
  await ready();
  assert.match(await page.locator("h1").innerText(), /Find the lab/i);
  await go("dna?mode=researchers");
  assert.match(await page.locator("main").innerText(), /No verified professors/);
  await go("explore");
  await page.getByRole("link", { name: "Vision", exact: true }).click();
  await ready();
  assert.equal(await page.locator(".labrow").count(), 4);
  await page.getByRole("searchbox").fill("prism");
  assert.equal(await page.locator(".labrow").count(), 1);
  await page.locator(".labrow h3 a").click();
  await ready();
  assert.match(await page.locator("h1").innerText(), /Prism/);
  await page.locator("summary").first().click();
  assert.ok(await page.locator("details[open]").count());
  await page.getByRole("link", { name: "Compare labs", exact: true }).click();
  await ready();
  assert.equal(await page.locator("[name=a]").inputValue(), "prism");
  await page.locator("[name=b]").selectOption("horizon");
  await ready();
  assert.match(await page.locator(".finding").innerText(), /vision/i);
  await page.goBack();
  await page.goBack();
  await page.goBack();
  await ready();
  assert.equal(await page.getByRole("searchbox").inputValue(), "prism");
  await go("explore");
  await page.getByRole("searchbox").fill("Passage Retrieval");
  await page.locator(".paper h3 a").click();
  await ready();
  await page.getByRole("link", { name: "Inspect connections" }).click();
  await ready();
  await page.locator('[data-node="lab-mosaic"]').first().click();
  await ready();
  assert.match(
    await page.locator(".inspector").innerText(),
    /Editorial background/,
  );
  await page.getByRole("link", { name: "Open lab dossier" }).click();
  await ready();
  await page.getByRole("link", { name: "Compare related approaches" }).click();
  await ready();
  await page.locator("[name=b]").selectOption("lexical");
  await ready();
  assert.match(await page.locator(".matrix").innerText(), /Exact terms/);
  await page.locator("[name=problem]").selectOption("alignment");
  await ready();
  assert.match(await page.locator(".matrix").innerText(), /captions/);
  await go("fit");
  await page.getByLabel("Language", { exact: true }).check();
  await ready();
  await page.getByText("Technical interests", { exact: true }).click();
  await page.getByLabel("Evidence checking", { exact: true }).check();
  await ready();
  await page.locator(".fitresult summary").first().click();
  assert.match(
    await page.locator(".fitresult details[open]").innerText(),
    /V4 dossier/,
  );
  await page.getByRole("button", { name: "Save interests to Radar" }).click();
  await page.getByRole("link", { name: "Explore Open Doors" }).click();
  await ready();
  assert.equal(await page.locator("[name=area]").inputValue(), "Language");
  await page.getByRole("link", { name: "View fictional example" }).click();
  await ready();
  await page.locator(".opportunity h2 a").click();
  await ready();
  assert.match(await page.locator("main").innerText(), /Unverified/);
  await go("radar?show=saved");
  assert.match(
    await page.locator(".followlist").innerText(),
    /Evidence checking/,
  );
  await go("explore");
  await page.getByRole("searchbox").fill("mosaic");
  await page.getByRole("link", { name: "Find in Radar" }).click();
  await ready();
  await page
    .getByRole("button", { name: "Follow Mosaic", exact: true })
    .click();
  await page.reload();
  await ready();
  assert.equal(
    await page
      .getByRole("button", { name: "Unfollow Mosaic" })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("[name=show]").selectOption("saved");
  await ready();
  assert.match(await page.locator(".event").innerText(), /Reliability/);
  await go("constellation");
  await page.locator("[name=type]").selectOption("Method");
  await ready();
  await page.locator("[data-zoom=in]").click();
  assert.match(await page.locator("#plot").getAttribute("transform"), /1.2/);
  await page.locator("[data-zoom=reset]").click();
  await page.locator("[name=layout]").selectOption("list");
  await ready();
  await page.locator("[data-node]").first().focus();
  await page.keyboard.press("Enter");
  await ready();
  assert.match(
    await page.locator(".inspector").innerText(),
    /fictional methodology/,
  );
  const statuses = await page.evaluate(async () => {
    const { availableStatus, verifiedRecord } =
      await import("./data/opportunities.js");
    const v = {
      kind: "public",
      status: "Open",
      verified: "2026-01-01",
      url: "https://example.org/notice",
      deadline: "2026-06-01",
    };
    return [
      availableStatus(v, "2026-06-01"),
      availableStatus(v, "2026-06-02"),
      verifiedRecord({ ...v, url: null }),
      availableStatus({ ...v, verified: null }, "2026-05-01"),
    ];
  });
  assert.deepEqual(statuses, ["Open", "Expired", false, "Unknown"]);
  await go("doors?mode=sample&status=Expired");
  assert.match(await page.locator("main").innerText(), /No example matches/);
  await go("explore");
  await page.getByRole("searchbox").fill("xxxxxx");
  assert.match(await page.locator("#results").innerText(), /No matching/);
  await page.getByRole("link", { name: "Clear filters" }).click();
  await page.setViewportSize({ width: 320, height: 760 });
  await go("explore");
  await page.locator("#menu").focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("#menu").getAttribute("aria-expanded"),
    "false",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".button")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
    "0s",
  );
  await go("dna?lab=unknown");
  assert.match(await page.locator("h1").innerText(), /unavailable/);
  await writeFile(
    resolve(output, "checks.json"),
    JSON.stringify({ widths, routes, errors, violations }, null, 2),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(violations, []);
  console.log(
    "PASS four cross-feature journeys, saved choices, filters, history, keyboard, graph and reduced motion; zero axe violations in 26 route/viewport scans.",
  );
} finally {
  await browser.close();
  server.closeAllConnections();
  server.close();
}
