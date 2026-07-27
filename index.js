const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("https://news.ycombinator.com/newest", {
    waitUntil: "domcontentloaded",
  });

  const timestamps = [];

  while (timestamps.length < 100) {
    await page.waitForSelector("tr.athing");

    // Get Unix timestamps from the current page
    const pageTimestamps = await page.$$eval("span.age", (elements) =>
      elements.map((element) => Number(element.getAttribute("title").split(" ")[0]))
    );

    timestamps.push(...pageTimestamps);

    if (timestamps.length >= 100) {
      break;
    }

    const moreLink = page.locator("a.morelink");

    if (!(await moreLink.count())) {
      break;
    }

    await Promise.all([
      page.waitForLoadState("domcontentloaded"),
      moreLink.click(),
    ]);
  }

  const first100 = timestamps.slice(0, 100);

  if (first100.length !== 100) {
    throw new Error(
      `Expected 100 articles, but found ${first100.length}.`
    );
  }

  for (let i = 1; i < first100.length; i++) {
    // Newest articles have larger Unix timestamps
    if (first100[i] > first100[i - 1]) {
      throw new Error(
        `Articles are not sorted correctly at positions ${i} and ${i + 1}.`
      );
    }
  }

  console.log("✅ Success! The first 100 articles are sorted from newest to oldest.");

  await browser.close();
}

(async () => {
  try {
    await sortHackerNewsArticles();
  } catch (error) {
    console.error("❌ Validation failed:");
    console.error(error);
    process.exit(1);
  }
})();