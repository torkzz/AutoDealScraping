const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

async function scrapeData(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // Get the HTML content of the entire page body
  const bodyHTML = await page.content();

  // Load the HTML content into Cheerio
  const $ = cheerio.load(bodyHTML);

  // Extract data using Cheerio selectors
  const articles = [];

  $("article").each((index, element) => {
    const articleData = {};

    // Extracting href attribute from the <a> tag inside <article>
    articleData.link = $(element).find("a").attr("href");

    // Extracting text content from the <a> tag inside <h5> inside <article>
    articleData.title = $(element).find("h5 a").text().trim();

    // Extracting text content from the <span> tag inside <div> inside <article>
    articleData.price = $(element).find(".display-flex span").text().trim();

    // Extracting href attribute from the <a> tag inside <div> inside <article>
    articleData.brandLink = $(element).find(".display-flex a").attr("href");

    // Extracting text content from the <small> tag inside <a> inside <div> inside <article>
    articleData.variants = $(element).find(".darklink small").text().trim();

    // Extracting source URL from the <img> tag inside <a> inside <div> inside <article>
    articleData.brandLogoSrc = $(element)
      .find(".display-flex a img")
      .attr("data-src");

    articles.push(articleData);
  });

  console.log("Scraped data:");
  console.log(articles);

  await browser.close();
}

scrapeData(
  "https://www.autodeal.com.ph/cars/search?sort-by=alphabetical&page=1"
);
