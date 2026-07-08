import puppeteer, { Browser } from "puppeteer";

export const getLowestPrices = async (vin: string[]): Promise<number[]> => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  let prices: number[] = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    await page.setUserAgent({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    });
    await page.setGeolocation({
      latitude: 55.77758725976762,
      longitude: 37.518114508219824,
    });
    const context = browser.defaultBrowserContext();
    await context.setPermission("https://exist.ru", {
      permission: {
        name: "geolocation",
      },
      state: "granted",
    });

    for (const num of vin) {
      await page.goto("https://exist.ru");

      const inp = await page.waitForSelector("input#pcode");
      if (!inp) throw new Error("No input");

      await inp.type(num);
      const sumbitBtn = await page.waitForSelector(
        "input.header-search__search-submit-btn",
      );
      if (!sumbitBtn) throw new Error("No button");
      await sumbitBtn.click();

      const textEl = await page.waitForSelector(
        ".pricerow>.price__wrapper>.price",
      );
      if (!textEl) continue;
      let textValue = await textEl.evaluate((el) => el.innerHTML);
      textValue = /\/[0-9]/.exec(textValue)!.join("");
      prices.push(+textValue);
    }
  } catch (error) {
    prices = [];
  }

  await browser.close();
  return prices;
};
