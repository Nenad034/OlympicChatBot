// ===================================
// Olympic Travel Web Scraper
// Automatically fetches real data from olympic.rs
// ===================================

import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';

// ===================================
// Configuration
// ===================================

const OLYMPIC_BASE_URL = 'https://www.olympic.rs';
const SCRAPE_INTERVAL = '0 */6 * * *'; // Every 6 hours
const REQUEST_TIMEOUT = 10000; // 10 seconds

// ===================================
// Data Storage
// ===================================

let olympicData = {
    destinations: [],
    hotels: [],
    offers: [],
    contact: {},
    lastUpdated: null
};

// ===================================
// Scraping Functions
// ===================================

/**
 * Fetch HTML content from a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - HTML content
 */
async function fetchHTML(url) {
    try {
        const response = await axios.get(url, {
            timeout: REQUEST_TIMEOUT,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error.message);
        return null;
    }
}

/**
 * Scrape homepage for general information
 */
async function scrapeHomepage() {
    console.log('📄 Scraping Olympic Travel homepage...');

    const html = await fetchHTML(OLYMPIC_BASE_URL);
    if (!html) return;

    const $ = cheerio.load(html);

    // Extract contact information
    olympicData.contact = {
        phone: [],
        email: [],
        address: []
    };

    // Find phone numbers
    $('a[href^="tel:"]').each((i, el) => {
        const phone = $(el).text().trim();
        if (phone && !olympicData.contact.phone.includes(phone)) {
            olympicData.contact.phone.push(phone);
        }
    });

    // Find emails
    $('a[href^="mailto:"]').each((i, el) => {
        const email = $(el).attr('href').replace('mailto:', '').trim();
        if (email && !olympicData.contact.email.includes(email)) {
            olympicData.contact.email.push(email);
        }
    });

    // Find addresses
    $('address, .address, [class*="address"]').each((i, el) => {
        const address = $(el).text().trim();
        if (address && address.length > 10) {
            olympicData.contact.address.push(address);
        }
    });

    console.log('✅ Homepage scraped successfully');
}

/**
 * Scrape destinations page
 */
async function scrapeDestinations() {
    console.log('🌍 Scraping destinations...');

    const destinationUrls = [
        `${OLYMPIC_BASE_URL}/letovanje`,
        `${OLYMPIC_BASE_URL}/zimovanje`,
        `${OLYMPIC_BASE_URL}/destinacije`
    ];

    for (const url of destinationUrls) {
        const html = await fetchHTML(url);
        if (!html) continue;

        const $ = cheerio.load(html);

        // Extract destination names and descriptions
        $('.destination, .offer-item, .box-teaser, .category-box, [class*="destination"]').each((i, el) => {
            const name = $(el).find('h2, h3, h4, .title, .box-title, [class*="title"]').first().text().trim();
            const description = $(el).find('p, .description, .box-content, [class*="description"]').first().text().trim();
            const price = $(el).find('.price, .box-price, [class*="price"]').first().text().trim();

            if (name && name.length > 2) {
                olympicData.destinations.push({
                    name,
                    description: description || 'Informacije dostupne na sajtu',
                    price: price || 'Cena na upit',
                    category: url.includes('letovanje') ? 'Letovanje' : url.includes('zimovanje') ? 'Zimovanje' : 'Ostalo'
                });
            }
        });
    }

    console.log(`✅ Found ${olympicData.destinations.length} destinations`);
}

/**
 * Scrape hotels information
 */
async function scrapeHotels() {
    console.log('🏨 Scraping hotels...');

    const hotelUrls = [
        `${OLYMPIC_BASE_URL}/hoteli`,
        `${OLYMPIC_BASE_URL}/smestaj`
    ];

    for (const url of hotelUrls) {
        const html = await fetchHTML(url);
        if (!html) continue;

        const $ = cheerio.load(html);

        // Extract hotel information
        $('.hotel, .accommodation, .hotel-item, .object-item, [class*="hotel"]').each((i, el) => {
            const name = $(el).find('h2, h3, h4, .title, .object-title, [class*="title"]').first().text().trim();
            const location = $(el).find('.location, .object-location, [class*="location"]').first().text().trim();
            const stars = $(el).find('.stars, [class*="star"]').text().match(/\d+/) ? $(el).find('.stars, [class*="star"]').text().match(/\d+/)[0] : 0;
            const price = $(el).find('.price, .object-price, [class*="price"]').first().text().trim();

            if (name && name.length > 2) {
                olympicData.hotels.push({
                    name,
                    location: location || 'Lokacija na upit',
                    stars: stars || 'N/A',
                    price: price || 'Cena na upit'
                });
            }
        });
    }

    console.log(`✅ Found ${olympicData.hotels.length} hotels`);
}

/**
 * Scrape special offers
 */
async function scrapeOffers() {
    console.log('🎁 Scraping special offers...');

    const html = await fetchHTML(`${OLYMPIC_BASE_URL}/ponude`);
    if (!html) return;

    const $ = cheerio.load(html);

    // Extract offers
    $('.offer, .special-offer, [class*="offer"]').each((i, el) => {
        const title = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim();
        const description = $(el).find('p, .description').first().text().trim();
        const validUntil = $(el).find('[class*="valid"], [class*="date"]').first().text().trim();

        if (title && title.length > 2) {
            olympicData.offers.push({
                title,
                description: description || 'Detalji na sajtu',
                validUntil: validUntil || 'Ograničeno vreme'
            });
        }
    });

    console.log(`✅ Found ${olympicData.offers.length} special offers`);
}

/**
 * Main scraping function - scrapes all data
 */
export async function scrapeOlympicTravel() {
    console.log('\n🚀 Starting Olympic Travel data scraping...\n');

    // Reset data
    olympicData = {
        destinations: [],
        hotels: [],
        offers: [],
        contact: {},
        lastUpdated: null
    };

    try {
        // Scrape all sections
        await scrapeHomepage();
        await scrapeDestinations();
        await scrapeHotels();
        await scrapeOffers();

        // Update timestamp
        olympicData.lastUpdated = new Date().toISOString();

        console.log('\n✅ Scraping completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Destinations: ${olympicData.destinations.length}`);
        console.log(`   - Hotels: ${olympicData.hotels.length}`);
        console.log(`   - Offers: ${olympicData.offers.length}`);
        console.log(`   - Last updated: ${olympicData.lastUpdated}\n`);

        return olympicData;

    } catch (error) {
        console.error('❌ Error during scraping:', error);
        return null;
    }
}

/**
 * Get current Olympic Travel data
 * @returns {Object} - Current scraped data
 */
export function getOlympicData() {
    return olympicData;
}

/**
 * Format scraped data for AI context
 * @returns {string} - Formatted data string
 */
export function formatDataForAI() {
    if (!olympicData.lastUpdated) {
        return 'Podaci sa sajta još nisu učitani.';
    }

    let formatted = `OLYMPIC TRAVEL - AŽURIRANI PODACI SA SAJTA (${olympicData.lastUpdated})\n\n`;

    // Contact info
    if (olympicData.contact.phone?.length > 0) {
        formatted += `KONTAKT TELEFONI:\n`;
        olympicData.contact.phone.forEach(phone => {
            formatted += `- ${phone}\n`;
        });
        formatted += '\n';
    }

    if (olympicData.contact.email?.length > 0) {
        formatted += `EMAIL:\n`;
        olympicData.contact.email.forEach(email => {
            formatted += `- ${email}\n`;
        });
        formatted += '\n';
    }

    // Destinations
    if (olympicData.destinations.length > 0) {
        formatted += `DESTINACIJE (${olympicData.destinations.length}):\n`;
        olympicData.destinations.slice(0, 20).forEach(dest => {
            formatted += `- ${dest.name} (${dest.category})`;
            if (dest.price) formatted += ` - ${dest.price}`;
            formatted += '\n';
        });
        formatted += '\n';
    }

    // Hotels
    if (olympicData.hotels.length > 0) {
        formatted += `HOTELI (${olympicData.hotels.length}):\n`;
        olympicData.hotels.slice(0, 20).forEach(hotel => {
            formatted += `- ${hotel.name}`;
            if (hotel.location) formatted += ` - ${hotel.location}`;
            if (hotel.stars) formatted += ` (${hotel.stars}*)`;
            formatted += '\n';
        });
        formatted += '\n';
    }

    // Offers
    if (olympicData.offers.length > 0) {
        formatted += `SPECIJALNE PONUDE (${olympicData.offers.length}):\n`;
        olympicData.offers.forEach(offer => {
            formatted += `- ${offer.title}`;
            if (offer.validUntil) formatted += ` (${offer.validUntil})`;
            formatted += '\n';
        });
        formatted += '\n';
    }

    return formatted;
}

/**
 * Initialize automatic scraping with cron job
 */
export function initializeAutoScraping() {
    console.log('⏰ Setting up automatic scraping...');
    console.log(`   Interval: Every 6 hours`);

    // Initial scrape
    scrapeOlympicTravel();

    // Schedule periodic scraping
    cron.schedule(SCRAPE_INTERVAL, () => {
        console.log('⏰ Scheduled scraping triggered');
        scrapeOlympicTravel();
    });

    console.log('✅ Automatic scraping initialized');
}
