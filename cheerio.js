const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mysql = require("mysql2/promise");

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
  await saveDataToMySQL(articles); // Save the scraped data into MySQL

  await browser.close();
}

async function saveDataToMySQL(data) {
  // Create a MySQL connection pool
  const pool = mysql.createPool({
    host: "192.168.1.101",
    user: "root",
    password: "casaos",
    database: "continuum",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    // Loop through each article data
    for (const article of data) {
      // Check if the article already exists in the database
      const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM cars WHERE link = ?",
        [article.link]
      );

      // Check if rows is iterable and contains data
      if (Array.isArray(rows) && rows.length > 0) {
        const count = rows[0].count;

        if (count === 0) {
          // Article does not exist in the database, insert it
          await pool.execute(
            "INSERT INTO cars (link, title, price, brandLink, variants, brandLogoSrc) VALUES (?, ?, ?, ?, ?, ?)",
            [
              article.link,
              article.title,
              article.price,
              article.brandLink,
              article.variants,
              article.brandLogoSrc,
            ]
          );
          console.log("Inserted article:", article.title);
        } else {
          console.log(
            "Article already exists, skipping insertion:",
            article.link
          );
        }
      } else {
        console.log("Error: No rows returned from database query.");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the connection pool
    pool.end();
  }
}

async function scrapeDataForPages(baseURL, totalPages) {
  for (let page = 1; page <= totalPages; page++) {
    const url = `${baseURL}&page=${page}`;
    await scrapeData(url);
  }
}

const baseURL = "https://www.autodeal.com.ph/cars/search?sort-by=alphabetical";
const totalPages = 17;

scrapeDataForPages(baseURL, totalPages);
