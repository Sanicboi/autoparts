import { Browser } from "puppeteer";

export const getLowestPrice = async (
  vin: string,
  browser: Browser,
): Promise<number> => {
  let price: number = 0;
  const page = await browser.newPage();
  try {
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
    await page.goto("https://autodoc.ru");
    const input = await page.locator('input[type="search"]').waitHandle();
    await input.focus();

    await input.type(vin);
    await page.keyboard.press("Enter");
    try {
      page.setDefaultTimeout(3000);
      const el = await page.locator("tui-select-option").waitHandle();

      await el.click();
    } catch (e) {}
    page.setDefaultTimeout(30000);
    await page.waitForNetworkIdle();
    const priceBtn = await page.locator("a.card__price-link").waitHandle();
    let textValue: string = await priceBtn.evaluate((el) => el.textContent);
    textValue = textValue.replace(/\D/g, "");
    price = +textValue;
  } catch (error) {
    price = -1;
    console.error(error);
  }
  await page.close();
  return price;
};
