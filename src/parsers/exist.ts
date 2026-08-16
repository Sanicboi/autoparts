import puppeteer, { Browser } from "puppeteer";

export const getLowestPrice = async (vin: string, browser: Browser): Promise<number> => {
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
    await context.setPermission("https://exist.ru", {
      permission: {
        name: "geolocation",
      },
      state: "granted",
    });
    await page.goto("https://exist.ru");

    const inp = await page.locator("input#pcode").waitHandle();
    if (!inp) throw new Error("No input");

    await inp.type(vin);
    const sumbitBtn = await page
      .locator("input.header-search__search-submit-btn")
      .waitHandle();
    if (!sumbitBtn) throw new Error("No button");
      await sumbitBtn.click();

      const textEl = await page
        .locator(".pricerow>.price__wrapper>.price")
        .waitHandle();
      if (!textEl) throw new Error("No text element");
      let textValue = await textEl.evaluate((el) => el.innerHTML);
      textValue = /\/[0-9]/.exec(textValue)!.join("");
      price = +textValue;
  } catch (error) {
    price = -1;
    
  }
  await page.close();
  return price;
};


