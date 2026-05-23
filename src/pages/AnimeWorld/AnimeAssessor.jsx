import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FaSearch, FaPlus, FaTrash, FaBookOpen, FaCrown, FaHourglassHalf, FaExternalLinkAlt, FaRedo } from 'react-icons/fa';
import './AnimeAssessor.css';

// Fallback recommendations in case of Jikan API rate limit or network issues
const FALLBACK_RECOMMENDATIONS = {
    'Battle Shonen Junkie': {
        title: 'Hunter x Hunter (2011)',
        score: 9.04,
        image_url: 'https://cdn.myanimelist.net/images/anime/1337/115025.jpg',
        synopsis: 'Hunter x Hunter is set in a world where Hunters exist to perform all manner of dangerous tasks like capturing criminals and bravely searching for lost treasures in uncharted territories. Twelve-year-old Gon Freecss is determined to become the best Hunter possible in hopes of finding his father, who was a Hunter himself and had long ago abandoned his young son. However, Gon soon realizes the path to achieving his goals is much more challenging than he could have ever imagined.',
        url: 'https://myanimelist.net/anime/11061/Hunter_x_Hunter_2011'
    },
    'Grand Line Explorer': {
        title: 'One Piece',
        score: 8.72,
        image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
        synopsis: 'Gol D. Roger was known as the "Pirate King," the strongest and most infamous being to have sailed the Grand Line. The capture and execution of Roger by the World Government brought a change throughout the world. His last words before his death revealed the existence of the greatest treasure in the world, One Piece. It was this revelation that brought about the Grand Age of Pirates, men who dreamed of finding One Piece—which promises an unlimited amount of riches and fame—and quite possibly the pinnacle of glory and the title of the Pirate King.',
        url: 'https://myanimelist.net/anime/21/One_Piece'
    },
    'Comedic Reliever': {
        title: 'Gintama',
        score: 8.94,
        image_url: 'https://cdn.myanimelist.net/images/anime/10/73274.jpg',
        synopsis: 'Sakata Gintoki is a samurai living in an era when aliens have invaded and taken over feudal Japan. To make ends meet, Gintoki runs a "Yorozuya" (Odd Jobs) business alongside his teenager apprentice Shinpachi Shimura and the super-strong alien girl Kagura. Together, they take on everything from finding lost cats to saving the world, all while barely making rent and causing absolute chaotic comedy wherever they go.',
        url: 'https://myanimelist.net/anime/918/Gintama'
    },
    'Tearjerker Masochist': {
        title: 'Your Lie in April',
        score: 8.65,
        image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        synopsis: 'Kousei Arima is a piano prodigy who loses his ability to hear the sound of his own piano after the death of his abusive mother. Two years later, Kousei has avoided the piano and lives in a monochrome world. Everything changes when he meets Kaori Miyazono, a beautiful, free-spirited violinist whose playing style reflects her manic-depressive personality. Kaori helps Kousei return to the music world and shows him that it should be free and mold-breaking, unlike the structured method his mother taught him.',
        url: 'https://myanimelist.net/anime/23273/Shigatsu_wa_Kimi_no_Uso'
    },
    'Truck-kun\'s Next Victim': {
        title: 'Frieren: Beyond Journey\'s End',
        score: 9.39,
        image_url: 'https://cdn.myanimelist.net/images/anime/1015/138025.jpg',
        synopsis: 'The adventure is over but life goes on for an elven mage on a journey to learn what it means to be human. Elf mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land. But Frieren will long outlive the rest of her former party. How will she come to understand what life means to the humans around her? Decades after their victory, her friend\'s funeral guides her on a new pilgrimage to fulfill their memory.',
        url: 'https://myanimelist.net/anime/52991/Sousou_no_Frieren'
    },
    'Edgelord Mastermind': {
        title: 'Death Note',
        score: 8.62,
        image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
        synopsis: 'A shinigami, as a god of death, can kill any person—provided they see their victim\'s face and write their victim\'s name in a notebook called a Death Note. One day, Ryuk, bored by the shinigami lifestyle and interested in seeing how a human would use a Death Note, drops one into the human realm. High school student and prodigy Light Yagami stumbles upon the Death Note and—since he deplores the state of the world—tests the deadly notebook by writing a criminal\'s name in it.',
        url: 'https://myanimelist.net/anime/1535/Death_Note'
    },
    'Cozy Tea-Drinker': {
        title: 'Yuru Camp△ (Laid-Back Camp)',
        score: 8.28,
        image_url: 'https://cdn.myanimelist.net/images/anime/1160/141019.jpg',
        synopsis: 'Rin Shima loves camping alone along the lakesides that offer a scenic view of Mt. Fuji. Nadeshiko Kagamihara loves riding her bike to places where she can see Mt. Fuji. After the two meet when Nadeshiko gets lost, they decide to take camping trips together, eat cup ramen, and enjoy the quiet solace of nature. A heartwarming, soothing slice-of-life anime that makes you want to wrap yourself in a blanket.',
        url: 'https://myanimelist.net/anime/34798/Yuru_Camp%E2%96%B3'
    },
    'Gundam Pilot Trainee': {
        title: 'Tengen Toppa Gurren Lagann',
        score: 8.63,
        image_url: 'https://cdn.myanimelist.net/images/anime/5/17407.jpg',
        synopsis: 'Simon and Kamina were born and raised in a deep, underground village, hidden from the legendary surface. Kamina is a free-spirited loose cannon bent on making a name for himself, while Simon is a timid young boy with no real aspirations. One day while excavating the earth, Simon stumbles upon a mysterious glowing key-like object. Supported by Kamina, Simon uses this key to pilot a small mecha they call Lagann, which breaches the ceiling of their cave, launching them into an explosive war for the surface of the earth!',
        url: 'https://myanimelist.net/anime/2001/Tengen_Toppa_Gurren_Lagann'
    },
    'Underdog Protagonist': {
        title: 'Haikyu!!',
        score: 8.45,
        image_url: 'https://cdn.myanimelist.net/images/anime/7/76014.jpg',
        synopsis: 'Inspired after watching a championship volleyball match on TV, junior high student Shouyou Hinata revives the volleyball club at his school. Despite Hinata\'s short stature, he possesses an explosive vertical jump. His team manages to make it to a tournament, but is absolutely crushed by the formidable "King of the Court," Tobio Kageyama. Hinata vows to surpass Kageyama, but when he enters Karasuno High School, he discovers his hated rival is now his teammate!',
        url: 'https://myanimelist.net/anime/20583/Haikyuu'
    },
    'Eclectic Wanderer': {
        title: 'Mob Psycho 100',
        score: 8.49,
        image_url: 'https://cdn.myanimelist.net/images/anime/8/80356.jpg',
        synopsis: 'Eighth-grader Shigeo "Mob" Kageyama has tapped into his inner wellspring of psychic prowess at a young age. But the power quickly proves to be a liability when he realizes the potential danger in his skills. Choosing to suppress his power, Mob\'s only present use for his ability is to impress his longtime crush, Tsubomi. In order to learn how to control his abilities, Mob enlists himself under the tutelage of Arataka Reigen, a con artist claiming to be a psychic, who exploits Mob\'s powers for pocket change.',
        url: 'https://myanimelist.net/anime/32182/Mob_Psycho_100'
    }
};

const GENRE_MAP = {
    'Action': { archetype: 'Battle Shonen Junkie', color: 'var(--manga-red)' },
    'Adventure': { archetype: 'Grand Line Explorer', color: 'var(--manga-yellow)' },
    'Comedy': { archetype: 'Comedic Reliever', color: '#f39c12' },
    'Drama': { archetype: 'Tearjerker Masochist', color: 'var(--manga-blue)' },
    'Fantasy': { archetype: 'Truck-kun\'s Next Victim', color: '#8e44ad' },
    'Mystery': { archetype: 'Edgelord Mastermind', color: 'var(--manga-ink)' },
    'Romance': { archetype: 'Tearjerker Masochist', color: '#e056fd' },
    'Sci-Fi': { archetype: 'Gundam Pilot Trainee', color: '#27ae60' },
    'Slice of Life': { archetype: 'Cozy Tea-Drinker', color: '#1abc9c' },
    'Supernatural': { archetype: 'Ghost Buster Apprentice', color: '#7f8c8d' },
    'Thriller': { archetype: 'Edgelord Mastermind', color: 'var(--manga-ink)' },
    'Sports': { archetype: 'Underdog Protagonist', color: '#d35400' }
};

const ROASTS = {
    'Battle Shonen Junkie': {
        roast: "You probably yell 'Bankai!' when opening umbrellas and try to execute a Rasengan in the shower. You judge anime solely by how many craters a character can make in a mountain with one punch. Power scaling is your absolute religion, and you've spent hours arguing online about whether Goku could beat a literally omnipotent drawing of a stick figure.",
        compliment: "But honestly? You've got pure heart and boundless hype! You value loyalty, hard work, and the absolute power of standing up for your crew. When the chips are down, you know that the power of friendship (accompanied by a legendary soundtrack) can overcome literally anything."
    },
    'Grand Line Explorer': {
        roast: "You refuse to watch anything that doesn't involve a 100+ episode slow-burn journey to a legendary treasure. You have an unhealthy obsession with maps, flags, boats, and characters wearing oddly-shaped hats. You also spend 80% of your day watching theory videos explaining how a single panel from 15 years ago foresaw the end of the universe.",
        compliment: "Your sense of wonder and patience is unmatched! You're in it for the long haul, valuing rich worldbuilding, deep-rooted lore, and the tight bond of nakama made along the way over any cheap, high-speed shortcuts."
    },
    'Comedic Reliever': {
        roast: "You treat anime as a high-speed serotonin dispenser. If a character doesn't pull a hyper-exaggerated face, break the fourth wall, or reference another popular manga within the first two minutes of an episode, you lose interest and open TikTok. You've probably laughed at the exact same toilet-humor gag 50 times in a row.",
        compliment: "You bring pure, unfiltered joy! You don't take things too seriously and have a phenomenal sense of humor. You understand that sometimes, amidst all the dark fantasy and serious drama, a hearty laugh with quirky, ridiculous characters is the best adventure of all."
    },
    'Tearjerker Masochist': {
        roast: "You willingly subject yourself to 24 episodes of agonizing slow-burn emotional damage just to watch two characters barely hold hands under a cherry blossom tree before one of them disappears. You buy tissues in bulk and have a physical, visceral reaction whenever you hear a violin or a piano key played in a minor chord.",
        compliment: "You possess a deeply empathetic and beautiful soul. You value rich character connections, genuine vulnerability, and raw human emotion. Your heart is massive, and you aren't afraid to feel all the beautiful, bittersweet weight that life and storytelling have to offer."
    },
    'Truck-kun\'s Next Victim': {
        roast: "You've read 50 variations of 'Reincarnated as a High-Tier Slime' and you actively find yourself looking both ways before crossing the road, slightly hoping a speeding delivery truck hits you to send you to a fantasy world with cheat codes and a harem. You'd rather gather herbs in a forest than work a real-world job.",
        compliment: "You possess a brilliant imagination and an escape artist's spirit! You love intricate magic systems, epic high-fantasy worldbuilding, and dreaming of the limitless possibilities that lie beyond our mundane everyday reality."
    },
    'Edgelord Mastermind': {
        roast: "You think you're Light Yagami or Lelouch, but you're actually just eating potato chips dramatically in your dark bedroom. You think happy endings are a sign of weak, childish writing and write essay-length Reddit posts analyzing 'moral gray areas'. Your favorite phrase is 'according to my calculations'.",
        compliment: "You have a sharp, highly analytical mind! You love high-stakes intellectual chess matches, complex mystery boxes, and parsing the complicated, grey motivations that drive humans when their backs are against the wall."
    },
    'Cozy Tea-Drinker': {
        roast: "You watch anime where the high-stakes climax of the season is a group of high school girls trying a new bakery or setting up a tent in the cold. You have an extremely low tolerance for conflict, and anything louder than a soft sigh or acoustic guitar strums gives you immediate existential stress.",
        compliment: "You appreciate the quiet, beautiful, and healing moments of everyday life. You know how to slow down, practice self-care, and find magic in the ordinary. A true master of cozy vibes and finding peace in a chaotic world."
    },
    'Gundam Pilot Trainee': {
        roast: "You think massive human-controlled steel robots are the only valid solution to complex geopolitical crises. You write essay-long complaints about 3D CGI mecha models and probably have a spreadsheet of thruster specs and power sources. You look at a toaster and think: 'Could this combine with an aircraft?'",
        compliment: "You love epic scales, high-concept political intrigue, and engineering marvels. You see the complex systems that make the universe tick, and you believe that human willpower can pierce through even the most crushing mechanical odds!"
    },
    'Underdog Protagonist': {
        roast: "You get physically hyped watching cartoon characters sweat over a volleyball or run around a high school track. You've probably cried when a drawing of a baseball didn't cross a digital plate, and you've definitely tried to execute a high-speed run or spike in public, to the deep concern of bystanders.",
        compliment: "You have unmatched work ethic and passion! You believe in the beauty of training arcs, sweat, tears, and never giving up on your dreams, no matter how intimidating the opponent. Your grit and drive are genuinely inspiring!"
    },
    'Eclectic Wanderer': {
        roast: "Your watch list looks like a digital junk drawer. One minute you're watching a cooking battle in hell, the next a heavy mecha tragedy, and then a slow-burn romance about calligraphy. Do you actually have a taste preference, or are you just rolling a 20-sided die to choose your next series?",
        compliment: "You are a true open-minded connoisseur of the medium! You refuse to be boxed in by arbitrary labels, recognizing and appreciating the artistic merit in every single corner of the anime seas. A versatile, brave navigator of all genres!"
    }
};

const OFFLINE_ANIME_DB = [
    { mal_id: 21, title: 'One Piece', score: 8.7, type: 'TV', year: 1999, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg' } }, genres: [{ name: 'Action' }, { name: 'Adventure' }, { name: 'Fantasy' }] },
    { mal_id: 11061, title: 'Hunter x Hunter (2011)', score: 9.0, type: 'TV', year: 2011, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1337/115025.jpg' } }, genres: [{ name: 'Action' }, { name: 'Adventure' }, { name: 'Fantasy' }] },
    { mal_id: 20, title: 'Naruto', score: 8.0, type: 'TV', year: 2002, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/13/17405.jpg' } }, genres: [{ name: 'Action' }, { name: 'Adventure' }] },
    { mal_id: 5114, title: 'Fullmetal Alchemist: Brotherhood', score: 9.1, type: 'TV', year: 2009, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1208/94745.jpg' } }, genres: [{ name: 'Action' }, { name: 'Adventure' }, { name: 'Drama' }] },
    { mal_id: 1535, title: 'Death Note', score: 8.6, type: 'TV', year: 2006, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg' } }, genres: [{ name: 'Drama' }, { name: 'Mystery' }, { name: 'Thriller' }] },
    { mal_id: 16498, title: 'Attack on Titan', score: 8.5, type: 'TV', year: 2013, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' } }, genres: [{ name: 'Action' }, { name: 'Drama' }] },
    { mal_id: 9253, title: 'Steins;Gate', score: 9.1, type: 'TV', year: 2011, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1935/127974.jpg' } }, genres: [{ name: 'Drama' }, { name: 'Sci-Fi' }, { name: 'Thriller' }] },
    { mal_id: 32281, title: 'Your Name.', score: 8.8, type: 'Movie', year: 2016, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg' } }, genres: [{ name: 'Drama' }, { name: 'Romance' }] },
    { mal_id: 38000, title: 'Demon Slayer: Kimetsu no Yaiba', score: 8.5, type: 'TV', year: 2019, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg' } }, genres: [{ name: 'Action' }, { name: 'Fantasy' }] },
    { mal_id: 40748, title: 'Jujutsu Kaisen', score: 8.6, type: 'TV', year: 2020, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' } }, genres: [{ name: 'Action' }, { name: 'Fantasy' }] },
    { mal_id: 23273, title: 'Your Lie in April', score: 8.6, type: 'TV', year: 2014, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/3/67177.jpg' } }, genres: [{ name: 'Drama' }, { name: 'Romance' }] },
    { mal_id: 20583, title: 'Haikyu!!', score: 8.4, type: 'TV', year: 2014, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/7/76014.jpg' } }, genres: [{ name: 'Sports' }] },
    { mal_id: 52991, title: 'Frieren: Beyond Journey\'s End', score: 9.3, type: 'TV', year: 2023, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1015/138025.jpg' } }, genres: [{ name: 'Adventure' }, { name: 'Drama' }, { name: 'Fantasy' }] },
    { mal_id: 34798, title: 'Yuru Camp△', score: 8.2, type: 'TV', year: 2018, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/1160/141019.jpg' } }, genres: [{ name: 'Slice of Life' }] },
    { mal_id: 918, title: 'Gintama', score: 8.9, type: 'TV', year: 2006, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/10/73274.jpg' } }, genres: [{ name: 'Action' }, { name: 'Comedy' }, { name: 'Sci-Fi' }] }
];

const AnimeAssessor = () => {
    // Checklist initialized from localStorage
    const [checklist, setChecklist] = useState(() => {
        const saved = localStorage.getItem('anime-logbook');
        return saved ? JSON.parse(saved) : [];
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [judgingText, setJudgingText] = useState('');
    const [verdict, setVerdict] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const searchTimeout = useRef(null);

    // Sync checklist with localStorage
    useEffect(() => {
        localStorage.setItem('anime-logbook', JSON.stringify(checklist));
        // Reset verdict when checklist changes so they can run the analyzer again
        if (verdict) setVerdict(null);
    }, [checklist]);

    // Handle debounced search when searchTerm changes
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        setLoadingSearch(true);
        setErrorMsg('');

        searchTimeout.current = setTimeout(async () => {
            try {
                const query = `
                    query ($search: String) {
                        Page(page: 1, perPage: 5) {
                            media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                                id
                                title { romaji english }
                                coverImage { large }
                                genres
                                averageScore
                                format
                                seasonYear
                            }
                        }
                    }
                `;
                const variables = { search: searchTerm };
                const response = await fetch('https://graphql.anilist.co', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ query, variables })
                });

                if (!response.ok) throw new Error('AniList API request failed');
                const result = await response.json();
                
                const mappedResults = (result.data?.Page?.media || []).map(media => ({
                    mal_id: media.id,
                    title: media.title.english || media.title.romaji,
                    type: media.format,
                    year: media.seasonYear,
                    score: media.averageScore ? (media.averageScore / 10).toFixed(1) : 0,
                    images: { jpg: { image_url: media.coverImage.large } },
                    genres: media.genres.map(g => ({ name: g }))
                }));
                
                setSearchResults(mappedResults);
            } catch (err) {
                console.error('Search error:', err);
                // Fallback to offline DB if AniList API is rate limited or timing out
                const term = searchTerm.toLowerCase();
                const offlineResults = OFFLINE_ANIME_DB.filter(anime => 
                    anime.title.toLowerCase().includes(term)
                ).slice(0, 5);
                
                if (offlineResults.length > 0) {
                    setSearchResults(offlineResults);
                    setErrorMsg('AniList API is slow. Using offline emergency logbook! Some results may be limited.');
                } else {
                    setErrorMsg('Failed to fetch anime and not found in emergency logbook. Try again in a moment!');
                }
            } finally {
                setLoadingSearch(false);
            }
        }, 600); // 600ms debounce to prevent API abuse

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchTerm]);

    const addToLogbook = (anime) => {
        if (checklist.some(item => item.mal_id === anime.mal_id)) {
            setErrorMsg(`"${anime.title}" is already in your Logbook!`);
            return;
        }
        
        // Extract genres
        const itemGenres = anime.genres.map(g => ({ name: g.name }));

        const newLogItem = {
            mal_id: anime.mal_id,
            title: anime.title,
            image_url: anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url || '',
            genres: itemGenres,
            score: anime.score || 0
        };

        setChecklist(prev => [newLogItem, ...prev]);
        setSearchTerm('');
        setSearchResults([]);
        setErrorMsg('');
    };

    const removeFromLogbook = (mal_id) => {
        setChecklist(prev => prev.filter(item => item.mal_id !== mal_id));
        setErrorMsg('');
    };

    const clearLogbook = () => {
        setChecklist([]);
        setVerdict(null);
        setErrorMsg('');
    };

    const runTasteAnalyzer = async () => {
        if (checklist.length < 3) {
            setErrorMsg("You need at least 3 logged anime in your logbook before the elders will judge your taste!");
            return;
        }

        setAnalyzing(true);
        setErrorMsg('');

        // Dramatic phrases to display while judging
        const dramaticPhrases = [
            "SUMMONING THE ELDERS OF THE GRAND LINE...",
            "SIFTING THROUGH THE SCROLLS OF YOUR SINS...",
            "TALLYING THE POWER LEVELS...",
            "UNLEASHING THE CONQUEROR'S HAKI...",
            "PREPARING THE ULTIMATE VERDICT..."
        ];

        let index = 0;
        setJudgingText(dramaticPhrases[0]);

        const textInterval = setInterval(() => {
            index++;
            if (index < dramaticPhrases.length) {
                setJudgingText(dramaticPhrases[index]);
            }
        }, 800);

        // Run the judging logic after 4 seconds of dramatic build-up
        setTimeout(async () => {
            clearInterval(textInterval);
            
            // 1. Tally Genres
            const genreTally = {};
            checklist.forEach(anime => {
                anime.genres.forEach(g => {
                    genreTally[g.name] = (genreTally[g.name] || 0) + 1;
                });
            });

            // Find dominant genre
            let dominantGenreName = null;
            let maxCount = 0;
            
            Object.entries(genreTally).forEach(([genreName, count]) => {
                if (count > maxCount) {
                    maxCount = count;
                    dominantGenreName = genreName;
                }
            });

            // Map dominant genre to archetype
            const genreInfo = GENRE_MAP[dominantGenreName];
            const archetype = genreInfo ? genreInfo.archetype : 'Eclectic Wanderer';
            const accentColor = genreInfo ? genreInfo.color : '#8e44ad';
            const roastText = ROASTS[archetype] || ROASTS['Eclectic Wanderer'];

            // 2. Fetch Recommendation from AniList
            let recommendation = null;

            if (dominantGenreName) {
                try {
                    const query = `
                        query ($genre: String, $notIn: [Int]) {
                            Page(page: 1, perPage: 10) {
                                media(genre: $genre, type: ANIME, sort: SCORE_DESC, id_not_in: $notIn, isAdult: false) {
                                    id
                                    title { romaji english }
                                    coverImage { large }
                                    description(asHtml: false)
                                    averageScore
                                    siteUrl
                                }
                            }
                        }
                    `;
                    const variables = { 
                        genre: dominantGenreName,
                        notIn: checklist.map(item => item.mal_id)
                    };
                    const response = await fetch('https://graphql.anilist.co', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ query, variables })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        const resultsList = result.data?.Page?.media || [];

                        if (resultsList.length > 0) {
                            const recAnime = resultsList[0];
                            let cleanDesc = recAnime.description || 'No synopsis available.';
                            // Strip HTML tags using regex
                            cleanDesc = cleanDesc.replace(/<br><br>/g, '\n').replace(/<[^>]*>?/gm, '');

                            recommendation = {
                                title: recAnime.title.english || recAnime.title.romaji,
                                score: recAnime.averageScore ? (recAnime.averageScore / 10).toFixed(1) : 0,
                                image_url: recAnime.coverImage.large || '',
                                synopsis: cleanDesc,
                                url: recAnime.siteUrl || 'https://anilist.co'
                            };
                        }
                    }
                } catch (err) {
                    console.warn("Failed fetching live recommendation from AniList:", err);
                }
            }

            // Fallback recommendation if live fetch failed or returned nothing
            if (!recommendation) {
                recommendation = FALLBACK_RECOMMENDATIONS[archetype] || FALLBACK_RECOMMENDATIONS['Eclectic Wanderer'];
            }

            // Set final verdict state
            setVerdict({
                archetype,
                accentColor,
                roast: roastText.roast,
                compliment: roastText.compliment,
                recommendation
            });

            setAnalyzing(false);
        }, 4000);
    };

    return (
        <section className="aw-section aw-assessor-section">
            <div className="aw-manga-header">
                <h2 className="aw-manga-heading">TASTE TESTER</h2>
                <div className="aw-ink-slash" />
            </div>

            <div className="aw-assessor-container">
                <div className="aw-assessor-intro">
                    <p className="aw-assessor-desc">
                        Every sailor has a logbook, but only true pirates are judged by their voyages. Log at least <strong style={{ color: 'var(--manga-red)' }}>3 anime</strong> you have completed below, and let our Grand Line algorithm assess your otaku archetype!
                    </p>
                </div>

                {/* ── SEARCH PANEL ── */}
                <div className="aw-assessor-search-panel">
                    <div className="aw-assessor-search-box">
                        <FaSearch className="aw-search-icon" />
                        <input
                            type="text"
                            placeholder="Search and log watched anime (e.g., Naruto, Death Note, Frieren)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="aw-assessor-search-input"
                        />
                        {loadingSearch && <div className="aw-spinner" />}
                    </div>

                    {/* Search Results Autocomplete */}
                    <AnimatePresence>
                        {searchResults.length > 0 && (
                            <motion.div 
                                className="aw-search-results-dropdown"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {searchResults.map(anime => (
                                    <div 
                                        key={anime.mal_id} 
                                        className="aw-search-result-item"
                                        onClick={() => addToLogbook(anime)}
                                    >
                                        <img 
                                            src={anime.images?.jpg?.image_url} 
                                            alt={anime.title} 
                                            className="aw-search-result-thumb" 
                                        />
                                        <div className="aw-search-result-info">
                                            <span className="aw-result-title">{anime.title}</span>
                                            <span className="aw-result-meta">
                                                {anime.type ? `${anime.type} ` : ''} 
                                                {anime.year ? `• ${anime.year} ` : ''} 
                                                {anime.score ? `• ⭐ ${anime.score}` : ''}
                                            </span>
                                        </div>
                                        <button className="aw-add-btn">
                                            <FaPlus />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error Alerts */}
                    <AnimatePresence>
                        {errorMsg && (
                            <motion.div 
                                className="aw-assessor-error"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                {errorMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── LOGBOOK DISPLAY ── */}
                <div className="aw-logbook-panel">
                    <div className="aw-logbook-header">
                        <h3><FaBookOpen /> YOUR SHIPS LOGBOOK ({checklist.length})</h3>
                        {checklist.length > 0 && (
                            <button className="aw-clear-all-btn" onClick={clearLogbook}>
                                <FaTrash /> Clear Logbook
                            </button>
                        )}
                    </div>

                    {checklist.length === 0 ? (
                        <div className="aw-logbook-empty">
                            <p>⚓ Your logbook is blank, sailor! Search and log your watched anime above to start your assessment.</p>
                        </div>
                    ) : (
                        <div className="aw-logbook-grid">
                            {checklist.map(anime => (
                                <motion.div 
                                    key={anime.mal_id} 
                                    className="aw-logbook-stamp"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <button 
                                        className="aw-stamp-remove" 
                                        onClick={() => removeFromLogbook(anime.mal_id)}
                                        title="Remove from Logbook"
                                    >
                                        ✕
                                    </button>
                                    <img src={anime.image_url} alt={anime.title} className="aw-stamp-img" />
                                    <div className="aw-stamp-label">
                                        <span className="aw-stamp-title">{anime.title}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {checklist.length > 0 && !verdict && !analyzing && (
                        <div className="aw-judge-trigger-container">
                            <button 
                                className={`aw-judge-btn ${checklist.length < 3 ? 'disabled' : ''}`}
                                onClick={runTasteAnalyzer}
                                disabled={checklist.length < 3}
                            >
                                <span className="aw-judge-btn-inner">SUMMON THE ELDERS</span>
                            </button>
                            {checklist.length < 3 && (
                                <span className="aw-judge-hint">Log {3 - checklist.length} more anime to trigger analysis</span>
                            )}
                        </div>
                    )}
                </div>

                {/* ── THE JUDGEMENT LOADING SCREEN ── */}
                <AnimatePresence>
                    {analyzing && (
                        <motion.div 
                            className="aw-judgement-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="aw-judgement-loading-box">
                                <div className="aw-judgement-speedlines" />
                                <div className="aw-shaking-skull">☠️</div>
                                <h2 className="aw-judgement-impact-text">{judgingText}</h2>
                                <div className="aw-judgement-progress-bar">
                                    <motion.div 
                                        className="aw-judgement-progress-fill"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 4, ease: "easeInOut" }}
                                    />
                                </div>
                                <p className="aw-judgement-loading-sub">A true pirate faces their verdict head-on...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── THE VERDICT STAGE ── */}
                <AnimatePresence>
                    {verdict && !analyzing && (
                        <motion.div 
                            className="aw-verdict-board"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 15 }}
                        >
                            <div className="aw-verdict-title-box">
                                <div className="aw-verdict-badge">VERDICT RECEIVED</div>
                                <h2 className="aw-verdict-archetype" style={{ textShadow: `4px 4px 0 ${verdict.accentColor}, 6px 6px 0 var(--manga-ink)` }}>
                                    {verdict.archetype}
                                </h2>
                            </div>

                            {/* Speeches & Roasts */}
                            <div className="aw-verdict-panels">
                                <div className="aw-verdict-panel aw-verdict-roast">
                                    <div className="aw-speech-bubble bubble-left">
                                        <span className="aw-mood-tag" style={{ color: verdict.accentColor }}>[THE ROAST]</span>
                                        <p className="aw-speech-text">"{verdict.roast}"</p>
                                    </div>
                                </div>

                                <div className="aw-verdict-panel aw-verdict-compliment">
                                    <div className="aw-speech-bubble bubble-right" style={{ boxShadow: `-10px 10px 0 ${verdict.accentColor}` }}>
                                        <span className="aw-mood-tag" style={{ color: 'var(--manga-blue)' }}>[THE SALUTE]</span>
                                        <p className="aw-speech-text">"{verdict.compliment}"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation Card */}
                            <div className="aw-verdict-recommendation-sec">
                                <div className="aw-rec-header">
                                    <FaCrown style={{ color: 'var(--manga-yellow)' }} /> NEXT DESTINATION ON THE LOG POSE
                                </div>

                                <div className="aw-rec-manga-card">
                                    <div className="aw-rec-poster-panel">
                                        <img src={verdict.recommendation.image_url} alt={verdict.recommendation.title} className="aw-rec-poster" />
                                        <div className="aw-manga-overlay" />
                                        <div className="aw-rec-score-badge">PWR: {verdict.recommendation.score}/10</div>
                                    </div>
                                    <div className="aw-rec-info-panel">
                                        <h4 className="aw-rec-title">{verdict.recommendation.title}</h4>
                                        <p className="aw-rec-synopsis">{verdict.recommendation.synopsis}</p>
                                        <a 
                                            href={verdict.recommendation.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="aw-rec-link-btn"
                                        >
                                            Inspect target <FaExternalLinkAlt style={{ marginLeft: 6, fontSize: '0.9rem' }} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Reset / Continue */}
                            <div className="aw-verdict-actions">
                                <button className="aw-rejudge-btn" onClick={runTasteAnalyzer}>
                                    <FaRedo /> Re-examine scrolls
                                </button>
                                <button className="aw-rejudge-btn reset-btn" onClick={clearLogbook}>
                                    ⚓ Clear Logbook and restart
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default AnimeAssessor;
