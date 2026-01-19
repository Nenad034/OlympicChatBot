// ===================================
// Olympic Travel Knowledge Base
// Static + Dynamic Data Integration
// ===================================

/**
 * Static Olympic Travel knowledge base
 * This data is always available even if scraping fails
 */
export const OLYMPIC_KNOWLEDGE_BASE = {
    contact: {
        offices: [
            {
                city: 'Beograd',
                address: 'Makedonska 30',
                phones: ['+381 11 655 0 020', '+381 11 655 0 040', '+381 11 655 7 289', '+381 11 655 7 297'],
                email: 'info@olympic.rs'
            },
            {
                city: 'Kragujevac',
                address: 'Karađorđeva 20',
                phones: ['+381 34 617 6 020'],
                email: 'info@olympic.rs'
            }
        ],
        website: 'www.olympic.rs',
        email: 'info@olympic.rs'
    },

    destinations: {
        letovanje: [
            {
                country: 'Grčka',
                regions: ['Tasos', 'Halkidiki', 'Krit', 'Rodos', 'Krf'],
                hotels: [
                    'Halkidiki: Hotel Potidea Palace 4*',
                    'Tasos: Hotel Alexandra Golden Boutique 5*',
                    'Krit: Hotel Grecotel Amirandes 5*'
                ],
                description: 'Kristalno čisto more, prelepe plaže',
                season: '2026'
            },
            {
                country: 'Turska',
                regions: ['Antalija', 'Belek', 'Side', 'Alanja', 'Bodrum', 'Fetije', 'Kušadasi', 'Marmaris'],
                hotels: [
                    'Antalija: Hotel Akra 5*',
                    'Belek: Maxx Royal Belek Golf Resort 5*',
                    'Bodrum: Vogue Hotel Supreme 5*',
                    'Alanja: Hotel Long Beach Resort 5*'
                ],
                description: 'All-inclusive hoteli, bogat sadržaj',
                season: '2026'
            },
            {
                country: 'Egipat',
                regions: ['Hurghada', 'Sharm El Sheikh'],
                description: 'Crveno more, ronjenje, piramide',
                season: '2026'
            },
            {
                country: 'Tunis',
                regions: ['Hammamet', 'Sousse', 'Port El Kantaoui', 'Mahdia', 'Djerba', 'Monastir'],
                description: 'Egzotika i orijentalizam',
                season: '2026'
            },
            {
                country: 'Hrvatska',
                regions: ['Dalmacija', 'Istra', 'Kvarner'],
                description: 'Blizina, kultura, čisto more',
                season: '2026'
            },
            {
                country: 'Crna Gora',
                regions: ['Budva', 'Bečići', 'Sveti Stefan', 'Petrovac', 'Herceg Novi', 'Kotor'],
                hotels: [
                    'Budva: Hotel Avala Resort & Villas 4*',
                    'Budva: Hotel Mogren 3*',
                    'Budva: Hotel Budva 4*',
                    'Budva: Hotel Bracera 4*',
                    'Bečići: Hotel Splendid Conference & Spa Resort 5*',
                    'Bečići: Hotel Mediteran 4*',
                    'Bečići: Hotel Iberostar Bellevue 4*',
                    'Sveti Stefan: Hotel Aman Resort 5*',
                    'Petrovac: Hotel Ami Budva Riviera 5*',
                    'Petrovac: Hotel Vile Oliva 4*',
                    'Petrovac: Hotel Castellastva 4*',
                    'Herceg Novi: Hotel Lazure Marina & Hotel 5*'
                ],
                description: 'Mediteranski šarm, najbliže destinacije. Imamo vrhunsku ponudu hotela svih kategorija.',
                season: '2026'
            },
            {
                country: 'Albanija',
                regions: ['Drač', 'Saranda', 'Vlora'],
                description: 'Povoljne cene, netaknuta priroda',
                season: '2026'
            },
            {
                country: 'Bugarska',
                regions: ['Sunčev breg', 'Zlatni pijasci', 'Nesebar'],
                description: 'Porodični odmor, povoljne cene',
                season: '2026'
            },
            {
                country: 'Kipar',
                regions: ['Aja Napa', 'Larnaka', 'Limasol', 'Pafos', 'Protaras'],
                description: 'Mediteranska lepota, bogata istorija',
                season: '2026'
            }
        ],

        zimovanje: [
            {
                country: 'Srbija',
                resorts: ['Kopaonik (najmoderniji ski centar)', 'Zlatibor', 'Stara Planina'],
                description: 'Domaće planine, odličan kvalitet',
                season: '2026'
            },
            {
                country: 'Bugarska',
                resorts: ['Bansko', 'Borovets', 'Pamporovo'],
                description: 'Odličan odnos cene i kvaliteta',
                season: '2026'
            },
            {
                country: 'Austrija',
                resorts: ['Innsbruck', 'Sölden', 'Ischgl'],
                description: 'Vrhunske staze',
                season: '2026'
            },
            {
                country: 'Italija',
                resorts: ['Dolomiti', 'Cortina d\'Ampezzo'],
                description: 'Ski sa stilom',
                season: '2026'
            },
            {
                country: 'Francuska',
                resorts: ['Chamonix', 'Val d\'Isère'],
                description: 'Svetski poznata odmarališta',
                season: '2026'
            },
            {
                country: 'Slovenija',
                resorts: ['Kranjska Gora', 'Vogel'],
                description: 'Blizu i pristupačno',
                season: '2026'
            },
            {
                country: 'BiH',
                resorts: ['Jahorina', 'Bjelašnica'],
                description: 'Kvalitet po povoljnim cenama',
                season: '2026'
            }
        ]
    },

    services: [
        'Avio karte za sve destinacije',
        'Wellness & Spa aranžmani',
        'Organizovana putovanja sa vodičem',
        'Nova Godina 2026 - specijalne ponude',
        'Individualni i grupni aranžmani',
        'Paket aranžmani avionom',
        'Smeštaj sopstveni prevoz',
        'Putovanja'
    ],

    specialOffers: [
        {
            title: 'Rani Buking 2026',
            description: 'Rezervišite na vreme i ostvarite popuste',
            destinations: ['Crna Gora', 'Grčka', 'Turska', 'Tunis', 'Egipat', 'Hrvatska', 'Bugarska']
        },
        {
            title: 'Wellness & Spa 2026',
            description: 'Opuštanje i relaksacija na najlepšim destinacijama',
            type: 'Wellness'
        }
    ],

    advantages: [
        'Dugogodišnje iskustvo (osnovan 1959)',
        'Najbolje cene na tržištu',
        'Pouzdanost i sigurnost',
        'Stručan tim',
        'Velika ponuda destinacija',
        '24/7 podrška tokom putovanja'
    ]
};

/**
 * Format knowledge base for AI context
 * @returns {string} - Formatted knowledge base
 */
export function formatKnowledgeBaseForAI() {
    let formatted = `OLYMPIC TRAVEL - KOMPLETNA BAZA ZNANJA\n\n`;

    // Contact Information
    formatted += `KONTAKT INFORMACIJE:\n`;
    OLYMPIC_KNOWLEDGE_BASE.contact.offices.forEach(office => {
        formatted += `\n${office.city}:\n`;
        formatted += `  Adresa: ${office.address}\n`;
        formatted += `  Telefoni: ${office.phones.join(', ')}\n`;
        formatted += `  Email: ${office.email}\n`;
    });
    formatted += `  Website: ${OLYMPIC_KNOWLEDGE_BASE.contact.website}\n\n`;

    // Summer Destinations
    formatted += `LETOVANJE 2026:\n`;
    OLYMPIC_KNOWLEDGE_BASE.destinations.letovanje.forEach(dest => {
        formatted += `\n${dest.country}:\n`;
        formatted += `  Regioni: ${dest.regions.join(', ')}\n`;
        formatted += `  Opis: ${dest.description}\n`;
    });
    formatted += `\n`;

    // Winter Destinations
    formatted += `ZIMOVANJE 2026:\n`;
    OLYMPIC_KNOWLEDGE_BASE.destinations.zimovanje.forEach(dest => {
        formatted += `\n${dest.country}:\n`;
        formatted += `  Ski centri: ${dest.resorts.join(', ')}\n`;
        formatted += `  Opis: ${dest.description}\n`;
    });
    formatted += `\n`;

    // Services
    formatted += `DODATNE USLUGE:\n`;
    OLYMPIC_KNOWLEDGE_BASE.services.forEach(service => {
        formatted += `- ${service}\n`;
    });
    formatted += `\n`;

    // Special Offers
    formatted += `SPECIJALNE PONUDE:\n`;
    OLYMPIC_KNOWLEDGE_BASE.specialOffers.forEach(offer => {
        formatted += `\n${offer.title}:\n`;
        formatted += `  ${offer.description}\n`;
        if (offer.destinations) {
            formatted += `  Destinacije: ${offer.destinations.join(', ')}\n`;
        }
    });
    formatted += `\n`;

    // Advantages
    formatted += `PREDNOSTI OLYMPIC TRAVEL:\n`;
    OLYMPIC_KNOWLEDGE_BASE.advantages.forEach(advantage => {
        formatted += `- ${advantage}\n`;
    });

    return formatted;
}
