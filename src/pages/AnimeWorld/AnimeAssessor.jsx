import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FaPlus, FaTrash, FaBookOpen, FaCrown, 
    FaExternalLinkAlt, FaRedo, FaShareAlt, FaCheck, FaSkull,
    FaAnchor, FaSkullCrossbones, FaTimes
} from 'react-icons/fa';
import { 
    SearchIcon, 
    ZapIcon, 
    TelescopeIcon, 
    SparklesIcon 
} from '../../components/icons';
import { animeAudio } from '../../utils/animeAudio';
import './AnimeAssessor.css';

// Fallback recommendations in case of Jikan/AniList rate limit or offline
const FALLBACK_RECOMMENDATIONS = {
    'Battle Shonen Junkie': {
        title: 'Hunter x Hunter (2011)',
        score: 9.04,
        image_url: 'https://cdn.myanimelist.net/images/anime/1337/115025.jpg',
        synopsis: 'Twelve-year-old Gon Freecss sets out to become a Hunter in hopes of finding his legendary father. Alongside Killua, Kurapika, and Leorio, he faces brutal Hunter exams, phantom assassins, and perilous nen training.',
        url: 'https://myanimelist.net/anime/11061/Hunter_x_Hunter_2011'
    },
    'Grand Line Explorer': {
        title: 'One Piece',
        score: 8.72,
        image_url: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
        synopsis: 'Monkey D. Luffy sets sail across the Grand Line to assemble the Straw Hat Pirates and claim the ultimate treasure, the One Piece, to become the King of the Pirates.',
        url: 'https://myanimelist.net/anime/21/One_Piece'
    },
    'Comedic Reliever': {
        title: 'Gintama',
        score: 8.94,
        image_url: 'https://cdn.myanimelist.net/images/anime/10/73274.jpg',
        synopsis: 'In an alien-conquered feudal Japan, silver-haired samurai Gintoki Sakata runs an Odd Jobs agency alongside Shinpachi and Kagura, parodying every known trope while delivering chaotic comedy and sword fights.',
        url: 'https://myanimelist.net/anime/918/Gintama'
    },
    'Tearjerker Masochist': {
        title: 'Your Lie in April',
        score: 8.65,
        image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        synopsis: 'Former piano prodigy Kousei Arima meets free-spirited violinist Kaori Miyazono, who helps him rediscover the vibrant color of music after years of grief and silence.',
        url: 'https://myanimelist.net/anime/23273/Shigatsu_wa_Kimi_no_Uso'
    },
    'Truck-kun\'s Next Victim': {
        title: 'Frieren: Beyond Journey\'s End',
        score: 9.39,
        image_url: 'https://cdn.myanimelist.net/images/anime/1015/138025.jpg',
        synopsis: 'The Demon King has been defeated. Elf mage Frieren begins a quiet pilgrimage to understand the brief lives and memories of the human comrades she outlived.',
        url: 'https://myanimelist.net/anime/52991/Sousou_no_Frieren'
    },
    'Edgelord Mastermind': {
        title: 'Death Note',
        score: 8.62,
        image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
        synopsis: 'Prodigy high school student Light Yagami finds a supernatural notebook that kills anyone whose name is written in it, igniting an intense mental duel with enigmatic detective L.',
        url: 'https://myanimelist.net/anime/1535/Death_Note'
    },
    'Cozy Tea-Drinker': {
        title: 'Yuru Camp△ (Laid-Back Camp)',
        score: 8.28,
        image_url: 'https://cdn.myanimelist.net/images/anime/1160/141019.jpg',
        synopsis: 'Rin Shima and Nadeshiko Kagamihara take serene camping trips across picturesque Japanese lakesides near Mt. Fuji, cooking hot meals and enjoying peaceful nature.',
        url: 'https://myanimelist.net/anime/34798/Yuru_Camp%E2%96%B3'
    },
    'Gundam Pilot Trainee': {
        title: 'Tengen Toppa Gurren Lagann',
        score: 8.63,
        image_url: 'https://cdn.myanimelist.net/images/anime/5/17407.jpg',
        synopsis: 'Diggers Simon and Kamina discover a miniature mecha that breaches the underground cavern roof, launching an unstoppable galactic rebellion powered by sheer human willpower.',
        url: 'https://myanimelist.net/anime/2001/Tengen_Toppa_Gurren_Lagann'
    },
    'Underdog Protagonist': {
        title: 'Haikyu!!',
        score: 8.45,
        image_url: 'https://cdn.myanimelist.net/images/anime/7/76014.jpg',
        synopsis: 'Shouyou Hinata revives his school volleyball club despite his short stature, partnering with former rival genius setter Tobio Kageyama to aim for the Nationals tournament.',
        url: 'https://myanimelist.net/anime/20583/Haikyuu'
    },
    'Eclectic Wanderer': {
        title: 'Mob Psycho 100',
        score: 8.49,
        image_url: 'https://cdn.myanimelist.net/images/anime/8/80356.jpg',
        synopsis: 'Middle-school psychic Mob wants nothing more than to lead a normal life, working for con-artist exorcist Reigen while keeping his apocalyptic emotions under strict check.',
        url: 'https://myanimelist.net/anime/32182/Mob_Psycho_100'
    }
};

const GENRE_MAP = {
    'Action': { archetype: 'Battle Shonen Junkie', color: '#b91c1c' },
    'Adventure': { archetype: 'Grand Line Explorer', color: '#c28b38' },
    'Comedy': { archetype: 'Comedic Reliever', color: '#c2410c' },
    'Drama': { archetype: 'Tearjerker Masochist', color: '#1e3a8a' },
    'Fantasy': { archetype: 'Truck-kun\'s Next Victim', color: '#6b21a8' },
    'Mystery': { archetype: 'Edgelord Mastermind', color: '#18181b' },
    'Romance': { archetype: 'Tearjerker Masochist', color: '#be123c' },
    'Sci-Fi': { archetype: 'Gundam Pilot Trainee', color: '#047857' },
    'Slice of Life': { archetype: 'Cozy Tea-Drinker', color: '#0d9488' },
    'Supernatural': { archetype: 'Ghost Buster Apprentice', color: '#475569' },
    'Thriller': { archetype: 'Edgelord Mastermind', color: '#18181b' },
    'Sports': { archetype: 'Underdog Protagonist', color: '#9a3412' }
};

const ROASTS = {
    'Battle Shonen Junkie': {
        roast: "You definitely yell 'BANKAI!' when opening umbrellas and try to execute a Rasengan in the shower. You judge anime solely by how many mountain ranges get vaporized by a single punch. Power scaling is your entire religion, and you've spent 4 hours arguing online about whether Goku beats a literal stick figure.",
        compliment: "Unstoppable heart and boundless hype! You value loyalty, the grind of training arcs, and standing up for your crew. When the chips are down and the orchestral battle theme drops, you know anything is possible!"
    },
    'Grand Line Explorer': {
        roast: "You refuse to watch anything that doesn't demand a 1,000-episode commitment to a mythical island. You have an obsession with maps, flags, boats, and goofy hats, and spend 80% of your day watching theory videos explaining how a panel from 2004 foresaw the end of the universe.",
        compliment: "Your patience and imagination are unmatched! You are in it for the long haul, valuing rich worldbuilding, deep lore, and the unbreakable bond of nakama over cheap dopamine shortcuts."
    },
    'Comedic Reliever': {
        roast: "You treat anime like a high-speed serotonin dispensary. If an episode doesn't break the fourth wall, reference another manga, or pull an absurd facial distortion in the first 90 seconds, you open TikTok. You've laughed at the same gag 50 times in a row.",
        compliment: "You bring pure joy and positive energy! You understand that amidst all the dark fantasy and grim drama, a hearty laugh with lovable weirdos is the best journey of all."
    },
    'Tearjerker Masochist': {
        roast: "You willingly sign up for 24 episodes of agonizing emotional damage just to watch two characters barely hold hands under a cherry blossom tree before one tragically vanishes. You buy tissues in bulk and flinch whenever you hear a violin in a minor key.",
        compliment: "You possess a deeply empathetic and beautiful soul. You appreciate the vulnerable, bitter-sweet poetry of human connection and aren't afraid to feel everything life has to offer."
    },
    'Truck-kun\'s Next Victim': {
        roast: "You've read 45 iterations of 'Reincarnated as a High-Tier Vegetable' and you look both ways before crossing the road, secretly hoping a speeding delivery truck sends you to a fantasy world with cheat stats and elf companions.",
        compliment: "You are a master dreamer and world explorer! You love intricate magic systems, sprawling kingdoms, and imagining limitless horizons beyond our mundane routine."
    },
    'Edgelord Mastermind': {
        roast: "You think you're Light Yagami or Lelouch, but you're actually just dramatically eating potato chips in a pitch-black bedroom. You think happy endings are a sign of weak writing and your favorite phrase is 'all according to my calculations'.",
        compliment: "Sharp, cerebral, and relentlessly analytical! You thrive on high-stakes psychological chess, intricate mystery boxes, and understanding what pushes human nature to its outer edge."
    },
    'Cozy Tea-Drinker': {
        roast: "You watch shows where the climax of season two is whether the characters pitch a tent in the rain or bake strawberry scones. Anything louder than acoustic guitar fingerpicking causes you immediate existential stress.",
        compliment: "You have mastered the art of mindfulness and peace. You appreciate the quiet, healing beauty in ordinary days, finding solace when the rest of the world is screaming."
    },
    'Gundam Pilot Trainee': {
        roast: "You believe multi-ton humanoid steel mechs are the only logical response to complex geopolitical crises. You maintain spreadsheets of thruster wattage and look at a household blender thinking 'could this combine with an interceptor?'",
        compliment: "You love monumental scales, deep tactical strategy, and engineering marvels. You see how vast systems interconnect and believe human grit can pierce the heavens!"
    },
    'Underdog Protagonist': {
        roast: "You get physically teary-eyed watching drawn athletes sweat over a volleyball or track relay. You've definitely attempted a high-speed sprint or spike in public, to the deep concern of bystanders.",
        compliment: "Incredible work ethic and indomitable spirit! You respect sweat, discipline, and training arcs. You know that champions are forged in the quiet hours when nobody is cheering."
    },
    'Eclectic Wanderer': {
        roast: "Your watch history looks like a digital junk drawer. One minute you're watching a cooking tournament in hell, then a mecha tragedy, then a 1980s romance about calligraphy. Do you have a taste or do you just roll a 20-sided die?",
        compliment: "A true open-minded connoisseur of the medium! You refuse to be boxed in, recognizing artistry in every corner of the animated sea. A fearless, versatile voyager!"
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
    { mal_id: 20583, title: 'Haikyu!!', score: 8.4, type: 'TV', year: 2014, images: { jpg: { image_url: 'https://cdn.myanimelist.net/images/anime/7/76014.jpg' } }, genres: [{ name: 'Sports' }] }
];

const AnimeAssessor = ({ onTriggerSfx }) => {
    const [checklist, setChecklist] = useState(() => {
        try {
            const saved = localStorage.getItem('anime-logbook');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [judgingText, setJudgingText] = useState('');
    const [verdict, setVerdict] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [copiedToast, setCopiedToast] = useState(false);

    const searchTimeout = useRef(null);

    // Sync checklist with localStorage
    useEffect(() => {
        try {
            localStorage.setItem('anime-logbook', JSON.stringify(checklist));
        } catch {}
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
                console.warn('Search falling back to offline DB:', err);
                const term = searchTerm.toLowerCase();
                const offlineResults = OFFLINE_ANIME_DB.filter(anime => 
                    anime.title.toLowerCase().includes(term)
                ).slice(0, 5);
                
                if (offlineResults.length > 0) {
                    setSearchResults(offlineResults);
                } else {
                    setErrorMsg('Network busy. Try searching another popular title (e.g. Naruto, One Piece, Attack on Titan)!');
                }
            } finally {
                setLoadingSearch(false);
            }
        }, 500);

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchTerm]);

    const addToLogbook = (anime) => {
        if (checklist.some(item => item.mal_id === anime.mal_id)) {
            setErrorMsg(`"${anime.title}" is already in your Logbook!`);
            return;
        }
        
        animeAudio.playDenDenMushi();

        const itemGenres = anime.genres.map(g => ({ name: g.name }));
        const newLogItem = {
            mal_id: anime.mal_id,
            title: anime.title,
            image_url: anime.images?.jpg?.image_url || '',
            genres: itemGenres,
            score: anime.score || 0
        };

        setChecklist(prev => [newLogItem, ...prev]);
        setSearchTerm('');
        setSearchResults([]);
        setErrorMsg('');
    };

    const removeFromLogbook = (mal_id) => {
        animeAudio.playDenDenMushi();
        setChecklist(prev => prev.filter(item => item.mal_id !== mal_id));
        setErrorMsg('');
    };

    const clearLogbook = () => {
        animeAudio.playDenDenMushi();
        setChecklist([]);
        setVerdict(null);
        setErrorMsg('');
    };

    const runTasteAnalyzer = async () => {
        if (checklist.length < 3) {
            setErrorMsg("You need at least 3 logged anime in your logbook before the Elders will judge your soul!");
            return;
        }

        setAnalyzing(true);
        setErrorMsg('');
        animeAudio.playDonImpact();

        const dramaticPhrases = [
            "SUMMONING THE ELDERS OF THE GRAND LINE...",
            "MEASURING OTAKU CONQUEROR'S HAKI...",
            "POWER LEVEL READINGS: OVER 9,000!!",
            "SIFTING THROUGH SCROLLS OF ANIME SINS...",
            "ENGRAVING OFFICIAL MARINE WANTED BOUNTY..."
        ];

        let index = 0;
        setJudgingText(dramaticPhrases[0]);

        const textInterval = setInterval(() => {
            index++;
            if (index < dramaticPhrases.length) {
                setJudgingText(dramaticPhrases[index]);
                animeAudio.playHakiCharge(index + 1);
            }
        }, 750);

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
                            Page(page: 1, perPage: 8) {
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
                    console.warn("Failed fetching recommendation:", err);
                }
            }

            if (!recommendation) {
                recommendation = FALLBACK_RECOMMENDATIONS[archetype] || FALLBACK_RECOMMENDATIONS['Eclectic Wanderer'];
            }

            // Calculate Authentic One Piece Berry Bounty
            const baseBounty = 1400000000 + (checklist.length * 320000000);
            const genreBonus = dominantGenreName === 'Action' ? 600000000 : 350000000;
            const calculatedBounty = baseBounty + genreBonus;
            const formattedBounty = calculatedBounty.toLocaleString();

            const threatRank = checklist.length >= 8 
                ? 'YONKO EMPEROR' 
                : checklist.length >= 5 
                    ? 'WARLORD OF THE SEA' 
                    : 'SUPER ROOKIE';

            const powerLevel = Math.min(9999, 8800 + checklist.length * 115);

            setVerdict({
                archetype,
                accentColor,
                bountyFormatted: formattedBounty,
                threatRank,
                powerLevel,
                roast: roastText.roast,
                compliment: roastText.compliment,
                recommendation,
                loggedCount: checklist.length
            });

            animeAudio.playBountyFanfare();
            animeAudio.playDonImpact();
            setAnalyzing(false);
        }, 3800);
    };

    const copyBountyCard = () => {
        if (!verdict) return;
        const text = `[GRAND LINE BOUNTY ISSUED]\nARCHETYPE: ${verdict.archetype}\nBOUNTY: ฿ ${verdict.bountyFormatted}\nTHREAT RANK: ${verdict.threatRank}\nPOWER LEVEL: ${verdict.powerLevel} / 9999\n\nTHE ROAST:\n"${verdict.roast}"\n\nNEXT TARGET ON LOG POSE:\n${verdict.recommendation.title} (Score: ${verdict.recommendation.score}/10)\n\nAssessed at Naveen's Portfolio Grand Line!`;
        
        navigator.clipboard.writeText(text);
        animeAudio.playDenDenMushi();
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 3000);
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
                        Every sailor has a logbook, but only true pirates are judged by the Grand Line. Search and log at least <strong style={{ color: 'var(--manga-red)' }}>3 anime</strong> you have completed to summon the Elders and receive your official Marine Bounty!
                    </p>
                </div>

                {/* ── SEARCH PANEL ── */}
                <div className="aw-assessor-search-panel">
                    <div className="aw-assessor-search-box">
                        <SearchIcon size={22} className="aw-search-icon" />
                        <input
                            type="text"
                            placeholder="Search completed anime (e.g., Naruto, Death Note, Frieren)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="aw-assessor-search-input"
                        />
                        {loadingSearch && <div className="aw-spinner" />}
                    </div>

                    {/* Search Results Dropdown */}
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
                                        <button className="aw-add-btn" title="Add to Logbook">
                                            <FaPlus />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Alerts */}
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
                        <h3><FaBookOpen /> YOUR SHIP'S LOGBOOK ({checklist.length})</h3>
                        {checklist.length > 0 && (
                            <button className="aw-clear-all-btn" onClick={clearLogbook}>
                                <FaTrash /> Clear Logbook
                            </button>
                        )}
                    </div>

                    {checklist.length === 0 ? (
                        <div className="aw-logbook-empty">
                            <p><FaBookOpen style={{ marginRight: 8, opacity: 0.7 }} /> Your logbook is blank, sailor! Search and log your watched anime above to start your assessment.</p>
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
                                        <FaTimes />
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
                                <span className="aw-judge-btn-inner" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                    <ZapIcon size={24} className="aw-judge-zap" /> SUMMON THE ELDERS <ZapIcon size={24} className="aw-judge-zap" />
                                </span>
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
                                <div className="aw-shaking-skull">
                                    <FaSkull className="aw-shaking-skull-svg" />
                                </div>
                                <h2 className="aw-judgement-impact-text">{judgingText}</h2>
                                <div className="aw-judgement-progress-bar">
                                    <motion.div 
                                        className="aw-judgement-progress-fill"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 3.8, ease: "easeInOut" }}
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
                            transition={{ type: 'spring', damping: 18 }}
                        >
                            {/* Official Generated Wanted Poster for the User */}
                            <div className="aw-user-wanted-poster">
                                <div className="aw-poster-anchor-seal">
                                    <FaAnchor className="aw-seal-anchor-icon" /> WORLD GOVERNMENT
                                </div>
                                <div className="aw-user-wanted-title">WANTED</div>
                                <div className="aw-user-wanted-sub">DEAD OR ALIVE</div>

                                <div className="aw-user-archetype-box">
                                    <div className="aw-archetype-emblem">
                                        <SparklesIcon size={28} className="aw-sparkles-svg" />
                                    </div>
                                    <h2 className="aw-verdict-archetype" style={{ color: verdict.accentColor }}>
                                        {verdict.archetype}
                                    </h2>
                                    <span className="aw-user-threat-badge">{verdict.threatRank}</span>
                                </div>

                                <div className="aw-user-bounty-strip">
                                    <span className="aw-berry-symbol">฿</span>
                                    <span className="aw-user-bounty-val">{verdict.bountyFormatted}</span>
                                    <span className="aw-dash-stamp">-</span>
                                </div>

                                <div className="aw-user-scouter-row">
                                    <span className="aw-scouter-metric">
                                        <ZapIcon size={16} className="aw-zap-inline" style={{ color: 'var(--manga-gold)', marginRight: 6 }} /> POWER LEVEL: <strong>{verdict.powerLevel} / 9999</strong>
                                    </span>
                                    <span className="aw-scouter-metric">
                                        <FaBookOpen style={{ marginRight: 6 }} /> LOGGED: <strong>{verdict.loggedCount} ANIME</strong>
                                    </span>
                                </div>
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
                                    <div className="aw-speech-bubble bubble-right" style={{ boxShadow: `-8px 8px 0 ${verdict.accentColor}` }}>
                                        <span className="aw-mood-tag" style={{ color: 'var(--manga-blue)' }}>[THE SALUTE]</span>
                                        <p className="aw-speech-text">"{verdict.compliment}"</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation Card */}
                            <div className="aw-verdict-recommendation-sec">
                                <div className="aw-rec-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TelescopeIcon size={24} className="aw-rec-telescope" style={{ color: 'var(--manga-yellow)' }} /> NEXT DESTINATION ON THE LOG POSE
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

                            {/* Share & Actions */}
                            <div className="aw-verdict-actions">
                                <button className="aw-share-bounty-btn" onClick={copyBountyCard}>
                                    {copiedToast ? <FaCheck /> : <FaShareAlt />}
                                    <span>{copiedToast ? 'BOUNTY COPIED TO SCROLL!' : 'SHARE BOUNTY CARD'}</span>
                                </button>
                                <button className="aw-rejudge-btn" onClick={runTasteAnalyzer}>
                                    <FaRedo /> Re-examine Scrolls
                                </button>
                                <button className="aw-rejudge-btn reset-btn" onClick={clearLogbook}>
                                    <FaTrash style={{ marginRight: 6 }} /> Clear Logbook
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
