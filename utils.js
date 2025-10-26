const Jimp = require("jimp");

/**
 * Generates a summary image displaying total countries, top 5 by GDP, and last updated timestamp.
 * @param {number} total - Total number of countries.
 * @param {Array} topCountries - Array of top 5 countries by GDP, each with name and estimated_gdp properties.
 * @param {Date} timestamp - Timestamp for the last update.
 * @returns {Promise<void>} - Resolves when the image is written to disk.
 */
async function generateSummaryImage(total, topCountries, timestamp) {
  const image = await Jimp.create(600, 400, "#ffffff");
  const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
  let num = 1;

  image.print(font, 20, 20, `Total countries recorded: ${total}`);
  image.print(font, 20, 60, `Top 5 by GDP:`);
  topCountries.forEach((c, i) => {
    image.print(font, 40, 90 + i * 20, `${num} ${c.name} - ${c.estimated_gdp}`);
    num++;
  });
  image.print(
    font,
    20,
    220,
    `Updated: ${new Date(timestamp).toLocaleString()}`
  );

  await image.writeAsync("./cache/summary.png");
  console.log("✅ Summary image generated with Jimp");
}

//replace undefine value with null and add missing keys

function replaceUndefined(obj, requiredKeys = []) {
  if (obj && typeof obj === "object") {
    // First, handle existing keys
    for (const key in obj) {
      if (obj[key] === undefined) {
        obj[key] = null;
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map((item) =>
          typeof item === "object" && item !== null
            ? replaceUndefined(item)
            : item === undefined
            ? null
            : item
        );
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        replaceUndefined(obj[key]);
      }
    }

    // Now, ensure all required keys exist
    for (const key of requiredKeys) {
      if (!(key in obj)) {
        obj[key] = null;
      }
    }
  }

  return obj;
}

module.exports = { generateSummaryImage, replaceUndefined };
