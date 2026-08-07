import puppeteer from "puppeteer";

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
    await context.setPermission("https://autodoc.ru", {
      permission: {
        name: "geolocation",
      },
      state: "granted",
    });

    for (const num of vin) {
      await page.goto("https://autodoc.ru");

      const input = await page.locator("#tui_11786115748515").waitHandle();
      input.type(String(num));

      const button = await page.locator(".search-button").waitHandle();
      button.click();

      await page.waitForNavigation();

      const priceBtn = await page.locator("a.card__price-link").waitHandle();
      let textValue: string = await priceBtn.evaluate((el) => el.textContent);
      textValue = /\/[0-9]/.exec(textValue)!.join("");
      prices.push(+textValue);
    }
  } catch (error) {
    prices = [];
  }
  await browser.close();
  return prices;
};
