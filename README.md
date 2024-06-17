# AutoDeal Used Cars Scraper

## Overview

This script scrapes used car data from AutoDeal's website using Puppeteer and Cheerio, and saves the data into a MySQL database. It supports scraping multiple pages and extracting various details about the cars and dealers.

## Usage

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/torkzz/AutoDealScraping.git
    cd AutoDealScraping
    ```

2. **Install Dependencies**:
    Make sure you have Node.js and npm installed. Then, install the necessary npm packages:
    ```bash
    npm install
    ```

3. **Set Up Environment Variables**:
    Create a `.env` file in the project root directory and add your MySQL database credentials:
    ```bash
    DB_HOST=your-db-host
    DB_USER=your-db-username
    DB_PASSWORD=your-db-password
    DB_DATABASE=your-db-name
    DB_CONNECTION_LIMIT=10
    ```

4. **Run the Script**:
    ```bash
    node cheerio-used-cars.js
    node cheerio.js
    ```

## Script Details

### Functions

- **scrapeData(url)**: Scrapes data from a given URL.
- **saveDataToMySQL(data)**: Saves the scraped data into a MySQL database.
- **scrapeDataForPages(baseURL, totalPages)**: Scrapes data for multiple pages.

### Environment Variables

- **DB_HOST**: Your MySQL database host.
- **DB_USER**: Your MySQL database username.
- **DB_PASSWORD**: Your MySQL database password.
- **DB_DATABASE**: Your MySQL database name.
- **DB_CONNECTION_LIMIT**: The connection limit for your MySQL database.

## Example Usage

```javascript
const baseURL = "https://www.autodeal.com.ph/used-cars/search/certified-pre-owned+repossessed+used-car-status";
const totalPages = 30;
scrapeDataForPages(baseURL, totalPages);
```

## Disclaimer

This script is intended for educational purposes only. The author is not responsible for any misuse of this script. Use it responsibly and ensure that you are not violating any terms of service of the websites you scrape.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contribution

Feel free to fork this repository, submit issues, and send pull requests. We appreciate all contributions that help improve this script!

## Acknowledgments

This script is inspired by various open-source scraping tools and tutorials available online.
