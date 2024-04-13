require("dotenv").config(); // Load environment variables from .env file
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
    articleData.title = $(element).find("h3").text().trim();

    // Extracting text content from the <h4> tag inside <a> inside <h3> inside <article>
    articleData.price = $(element).find("h4").text().trim();

    // Extracting kilometers from the <span> tag inside <div> inside <article>
    const kmAndTransmission = $(element).find(".padbottom20.margintop5 span");
    articleData.kilometers = $(kmAndTransmission[0]).text().trim();
    articleData.transmission = $(kmAndTransmission[1]).text().trim();

    // Extracting fuel type from the <span> tag inside <div> inside <article>
    articleData.fuelType = $(kmAndTransmission[2]).text().trim();

    // Extracting dealer information
    const dealerInfo = $(element).find(".vcard.padbottom20");
    articleData.dealerName = $(dealerInfo).find(".fn").text().trim();
    articleData.dealerLogo = $(dealerInfo).find(".avatar").attr("src");
    articleData.dealerLocation = $(dealerInfo)
      .find(".adr .locality small")
      .text()
      .trim();
    articleData.dealerType = $(dealerInfo).find(".adr small").text().trim();

    // Extracting contact link
    articleData.contactLink = $(element).find("a[href*=inquire]").attr("href");

    // Check if the link is /used-cars/car-advisor
    if (articleData.link !== "/used-cars/car-advisor") {
      // Push articleData into articles array
      articles.push(articleData);
    }
  });

  console.log("Scraped data:");
  console.log(articles);
  await saveDataToMySQL(articles); // Save the scraped data into MySQL

  await browser.close();
}

async function saveDataToMySQL(data) {
  // Create a MySQL connection pool
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    queueLimit: 0,
  });

  try {
    // Loop through each car's data
    for (const car of data) {
      // Replace undefined values with null
      const {
        link,
        title,
        price,
        kilometers,
        transmission,
        fuelType,
        dealerName,
        dealerLogo,
        dealerLocation,
        dealerType,
        contactLink,
      } = car;
      const values = [
        link,
        title,
        price,
        kilometers,
        transmission,
        fuelType,
        dealerName,
        dealerLogo,
        dealerLocation,
        dealerType,
        contactLink,
      ].map((val) => (val === undefined ? null : val));

      // Check if the car already exists in the database
      const [rows] = await pool.execute(
        "SELECT COUNT(*) AS count FROM used_cars WHERE link = ?",
        [link]
      );

      // Check if rows contain data
      if (Array.isArray(rows) && rows.length > 0) {
        const count = rows[0].count;

        if (count === 0) {
          // Car does not exist in the database, insert it
          await pool.execute(
            "INSERT INTO used_cars (link, title, price, kilometers, transmission, fuel_type, dealer_name, dealer_logo, dealer_location, dealer_type, contact_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            values
          );
          console.log("Inserted car:", title);
        } else {
          console.log("Car already exists, skipping insertion:", link);
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
  for (let page = 17; page <= totalPages; page++) {
    const url = `${baseURL}/page-${page}?sort-by=most-recent`;
    console.log(url);
    await scrapeData(url);
  }
}

const baseURL =
  "https://www.autodeal.com.ph/used-cars/search/certified-pre-owned+repossessed+used-car-status";
const totalPages = 30;

scrapeDataForPages(baseURL, totalPages);
