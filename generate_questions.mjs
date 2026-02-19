// generate_questions.mjs — Insert 200+ unique "Would you rather" dilemmas
// into the NoCodeBackend for Social Dilemma's app.

const BASE = 'http://localhost:3000';
const INSTANCE = '53058_luxsocial';

// ── All 210 new questions ──────────────────────────────────────────────
const questions = [
  // ─── LIFESTYLE (18) ───
  { question_text: "Would you rather Have a personal chef or a personal trainer?", option_a: "Personal chef", option_b: "Personal trainer", category: "Lifestyle" },
  { question_text: "Would you rather Live in a tiny house with an ocean view or a mansion with no windows?", option_a: "Tiny house, ocean view", option_b: "Mansion, no windows", category: "Lifestyle" },
  { question_text: "Would you rather Always have fresh breath or always have fresh-smelling hair?", option_a: "Fresh breath always", option_b: "Fresh hair always", category: "Lifestyle" },
  { question_text: "Would you rather Wake up at 5 AM every day or never be able to sleep before 3 AM?", option_a: "Wake up at 5 AM", option_b: "Never sleep before 3 AM", category: "Lifestyle" },
  { question_text: "Would you rather Have a walk-in closet or a home theater?", option_a: "Walk-in closet", option_b: "Home theater", category: "Lifestyle" },
  { question_text: "Would you rather Never do laundry again or never wash dishes again?", option_a: "No more laundry", option_b: "No more dishes", category: "Lifestyle" },
  { question_text: "Would you rather Have perfect skin forever or perfect hair forever?", option_a: "Perfect skin", option_b: "Perfect hair", category: "Lifestyle" },
  { question_text: "Would you rather Only shower in cold water or only drink warm water?", option_a: "Cold showers only", option_b: "Warm water only", category: "Lifestyle" },
  { question_text: "Would you rather Live without air conditioning or live without heating?", option_a: "No AC", option_b: "No heating", category: "Lifestyle" },
  { question_text: "Would you rather Have a photographic memory or be able to forget anything on command?", option_a: "Photographic memory", option_b: "Forget on command", category: "Lifestyle" },
  { question_text: "Would you rather Always look your best but feel tired or always feel energized but look messy?", option_a: "Look great, feel tired", option_b: "Feel great, look messy", category: "Lifestyle" },
  { question_text: "Would you rather Live in eternal summer or eternal autumn?", option_a: "Eternal summer", option_b: "Eternal autumn", category: "Lifestyle" },
  { question_text: "Would you rather Only wear sweats forever or only wear suits forever?", option_a: "Sweats forever", option_b: "Suits forever", category: "Lifestyle" },
  { question_text: "Would you rather Have unlimited free Ubers or unlimited free Starbucks?", option_a: "Free Ubers", option_b: "Free Starbucks", category: "Lifestyle" },
  { question_text: "Would you rather Always have a full phone battery or always have a full gas tank?", option_a: "Full battery always", option_b: "Full gas always", category: "Lifestyle" },
  { question_text: "Would you rather Be a morning person or a night owl forever?", option_a: "Morning person", option_b: "Night owl", category: "Lifestyle" },
  { question_text: "Would you rather Never have to clean your room or never have to cook?", option_a: "Never clean", option_b: "Never cook", category: "Lifestyle" },
  { question_text: "Would you rather Have the perfect playlist for every mood or the perfect outfit for every occasion?", option_a: "Perfect playlist always", option_b: "Perfect outfit always", category: "Lifestyle" },

  // ─── FOOD (18) ───
  { question_text: "Would you rather Only drink bubble tea or only drink coffee for a year?", option_a: "Only bubble tea", option_b: "Only coffee", category: "Food" },
  { question_text: "Would you rather Give up cheese or give up chocolate?", option_a: "Give up cheese", option_b: "Give up chocolate", category: "Food" },
  { question_text: "Would you rather Eat gas station sushi or airport ramen for every meal?", option_a: "Gas station sushi", option_b: "Airport ramen", category: "Food" },
  { question_text: "Would you rather Only eat breakfast food or only eat dinner food?", option_a: "Breakfast food only", option_b: "Dinner food only", category: "Food" },
  { question_text: "Would you rather Have unlimited avocado toast or unlimited chicken nuggets?", option_a: "Unlimited avo toast", option_b: "Unlimited nuggets", category: "Food" },
  { question_text: "Would you rather Never eat candy again or never eat chips again?", option_a: "No more candy", option_b: "No more chips", category: "Food" },
  { question_text: "Would you rather Only eat with chopsticks or only eat with your hands?", option_a: "Only chopsticks", option_b: "Only hands", category: "Food" },
  { question_text: "Would you rather Give up ice cream or give up cake forever?", option_a: "Give up ice cream", option_b: "Give up cake", category: "Food" },
  { question_text: "Would you rather Have unlimited sushi or unlimited tacos for life?", option_a: "Unlimited sushi", option_b: "Unlimited tacos", category: "Food" },
  { question_text: "Would you rather Only eat Chick-fil-A or only eat Chipotle?", option_a: "Only Chick-fil-A", option_b: "Only Chipotle", category: "Food" },
  { question_text: "Would you rather Drink a smoothie made of all your meals or eat everything as soup?", option_a: "Smoothie meals", option_b: "Soup everything", category: "Food" },
  { question_text: "Would you rather Never eat fast food again or only eat fast food?", option_a: "Never fast food", option_b: "Only fast food", category: "Food" },
  { question_text: "Would you rather Have unlimited free DoorDash or unlimited free groceries?", option_a: "Free DoorDash", option_b: "Free groceries", category: "Food" },
  { question_text: "Would you rather Give up pasta or give up rice forever?", option_a: "Give up pasta", option_b: "Give up rice", category: "Food" },
  { question_text: "Would you rather Only eat sweet food or only eat savory food?", option_a: "Only sweet", option_b: "Only savory", category: "Food" },
  { question_text: "Would you rather Every meal be slightly too spicy or slightly too salty?", option_a: "Slightly too spicy", option_b: "Slightly too salty", category: "Food" },
  { question_text: "Would you rather Eat your favorite meal every day or never eat it again?", option_a: "Fave meal daily", option_b: "Never eat it again", category: "Food" },
  { question_text: "Would you rather Only drink water or only drink juice for the rest of your life?", option_a: "Only water", option_b: "Only juice", category: "Food" },

  // ─── FUNNY (18) ───
  { question_text: "Would you rather Have spaghetti for hair or sweat maple syrup?", option_a: "Spaghetti hair", option_b: "Sweat maple syrup", category: "Funny" },
  { question_text: "Would you rather Sound like a duck when you laugh or clap like a seal?", option_a: "Duck laugh", option_b: "Seal clap", category: "Funny" },
  { question_text: "Would you rather Have a permanent unibrow or a permanent mullet?", option_a: "Permanent unibrow", option_b: "Permanent mullet", category: "Funny" },
  { question_text: "Would you rather Accidentally like your ex's old photo or send a text to the wrong group chat?", option_a: "Like ex's old photo", option_b: "Wrong group chat text", category: "Funny" },
  { question_text: "Would you rather Sneeze glitter or cough confetti?", option_a: "Sneeze glitter", option_b: "Cough confetti", category: "Funny" },
  { question_text: "Would you rather Talk like Yoda for a year or walk like a crab for a year?", option_a: "Talk like Yoda", option_b: "Walk like a crab", category: "Funny" },
  { question_text: "Would you rather Have your search history made public or your camera roll?", option_a: "Search history public", option_b: "Camera roll public", category: "Funny" },
  { question_text: "Would you rather Trip in front of your crush or spill food on your boss?", option_a: "Trip in front of crush", option_b: "Spill food on boss", category: "Funny" },
  { question_text: "Would you rather Only communicate through memes or only through GIFs?", option_a: "Only memes", option_b: "Only GIFs", category: "Funny" },
  { question_text: "Would you rather Have a permanent squeaky voice or a permanent deep voice?", option_a: "Squeaky voice forever", option_b: "Deep voice forever", category: "Funny" },
  { question_text: "Would you rather Always walk in slow motion or always talk in fast forward?", option_a: "Walk in slow motion", option_b: "Talk in fast forward", category: "Funny" },
  { question_text: "Would you rather Hiccup every time you lie or sneeze every time someone talks about you?", option_a: "Hiccup when lying", option_b: "Sneeze when talked about", category: "Funny" },
  { question_text: "Would you rather Have your voice replaced by Morgan Freeman or Spongebob?", option_a: "Morgan Freeman voice", option_b: "SpongeBob voice", category: "Funny" },
  { question_text: "Would you rather Narrate your own life out loud or hear everyone else's thoughts?", option_a: "Narrate my life aloud", option_b: "Hear everyone's thoughts", category: "Funny" },
  { question_text: "Would you rather Have T-Rex arms for a day or jellyfish legs for a day?", option_a: "T-Rex arms", option_b: "Jellyfish legs", category: "Funny" },
  { question_text: "Would you rather Accidentally call your teacher 'Mom' daily or fall up the stairs every time?", option_a: "Call teacher Mom", option_b: "Fall up the stairs", category: "Funny" },
  { question_text: "Would you rather Have autocorrect control your texts forever or have Siri answer all your calls?", option_a: "Autocorrect forever", option_b: "Siri answers calls", category: "Funny" },
  { question_text: "Would you rather Wear a clown wig to every job interview or honk a horn every time you sit down?", option_a: "Clown wig at interviews", option_b: "Honk when sitting", category: "Funny" },

  // ─── TRAVEL (17) ───
  { question_text: "Would you rather Backpack through Europe or road trip across the US?", option_a: "Backpack Europe", option_b: "Road trip US", category: "Travel" },
  { question_text: "Would you rather Visit Tokyo or visit New York for the first time?", option_a: "Tokyo", option_b: "New York", category: "Travel" },
  { question_text: "Would you rather Travel with no luggage or travel with no phone?", option_a: "No luggage", option_b: "No phone", category: "Travel" },
  { question_text: "Would you rather Take a free cruise or a free safari?", option_a: "Free cruise", option_b: "Free safari", category: "Travel" },
  { question_text: "Would you rather Visit every country but never stay more than a day or live in your dream country but never leave?", option_a: "Every country, one day each", option_b: "Dream country forever", category: "Travel" },
  { question_text: "Would you rather Only travel by train or only travel by boat?", option_a: "Only trains", option_b: "Only boats", category: "Travel" },
  { question_text: "Would you rather Bali for a week or Paris for a week?", option_a: "Bali", option_b: "Paris", category: "Travel" },
  { question_text: "Would you rather Go to a full-moon party in Thailand or Carnival in Brazil?", option_a: "Full Moon party", option_b: "Carnival in Brazil", category: "Travel" },
  { question_text: "Would you rather Have a window seat forever or an aisle seat forever?", option_a: "Window seat forever", option_b: "Aisle seat forever", category: "Travel" },
  { question_text: "Would you rather Travel solo for a year or with your best friend but they pick everything?", option_a: "Solo for a year", option_b: "BFF picks everything", category: "Travel" },
  { question_text: "Would you rather Explore ancient ruins or explore a futuristic city?", option_a: "Ancient ruins", option_b: "Futuristic city", category: "Travel" },
  { question_text: "Would you rather Ski in the Alps or surf in Hawaii?", option_a: "Ski in the Alps", option_b: "Surf in Hawaii", category: "Travel" },
  { question_text: "Would you rather Have unlimited hotel upgrades or unlimited airport lounge access?", option_a: "Hotel upgrades", option_b: "Lounge access", category: "Travel" },
  { question_text: "Would you rather Live abroad for 5 years or take 50 short trips?", option_a: "Live abroad 5 years", option_b: "50 short trips", category: "Travel" },
  { question_text: "Would you rather Visit the Northern Lights or visit the Great Barrier Reef?", option_a: "Northern Lights", option_b: "Great Barrier Reef", category: "Travel" },
  { question_text: "Would you rather Camp in the wilderness for a month or stay in a luxury resort for a week?", option_a: "Wilderness for a month", option_b: "Luxury resort for a week", category: "Travel" },
  { question_text: "Would you rather Always have aisle seats but free flights or always pay but pick your seat?", option_a: "Free flights, aisle only", option_b: "Pay but pick seat", category: "Travel" },

  // ─── TECH (18) ───
  { question_text: "Would you rather Have 1M followers or $1M in the bank?", option_a: "1M followers", option_b: "$1M in the bank", category: "Tech" },
  { question_text: "Would you rather Lose all your followers or lose all your saved posts?", option_a: "Lose followers", option_b: "Lose saved posts", category: "Tech" },
  { question_text: "Would you rather Have your DMs leaked or your screen time made public?", option_a: "DMs leaked", option_b: "Screen time public", category: "Tech" },
  { question_text: "Would you rather Only use Android or only use Apple for life?", option_a: "Android for life", option_b: "Apple for life", category: "Tech" },
  { question_text: "Would you rather Give up Spotify or give up YouTube?", option_a: "Give up Spotify", option_b: "Give up YouTube", category: "Tech" },
  { question_text: "Would you rather Have free WiFi everywhere or free charging everywhere?", option_a: "Free WiFi everywhere", option_b: "Free charging everywhere", category: "Tech" },
  { question_text: "Would you rather Never use social media again or never use streaming services again?", option_a: "No social media", option_b: "No streaming", category: "Tech" },
  { question_text: "Would you rather Have an AI best friend or a robot butler?", option_a: "AI best friend", option_b: "Robot butler", category: "Tech" },
  { question_text: "Would you rather Always have the newest tech but no social media or old tech with unlimited social media?", option_a: "Newest tech, no socials", option_b: "Old tech, all socials", category: "Tech" },
  { question_text: "Would you rather Be permanently banned from Google or permanently banned from Amazon?", option_a: "Banned from Google", option_b: "Banned from Amazon", category: "Tech" },
  { question_text: "Would you rather Have your phone always at 5% or your WiFi always buffering?", option_a: "Phone always at 5%", option_b: "WiFi always buffering", category: "Tech" },
  { question_text: "Would you rather Give up texting or give up video calls forever?", option_a: "Give up texting", option_b: "Give up video calls", category: "Tech" },
  { question_text: "Would you rather Go viral for something embarrassing or never go viral at all?", option_a: "Viral but embarrassing", option_b: "Never go viral", category: "Tech" },
  { question_text: "Would you rather Have Elon Musk's money or Mark Zuckerberg's data?", option_a: "Elon's money", option_b: "Zuck's data", category: "Tech" },
  { question_text: "Would you rather Live in a smart home that talks to you or a regular home with no tech issues ever?", option_a: "Smart home that talks", option_b: "Regular home, no issues", category: "Tech" },
  { question_text: "Would you rather Only use dark mode or only use light mode forever?", option_a: "Dark mode forever", option_b: "Light mode forever", category: "Tech" },
  { question_text: "Would you rather Delete your entire Instagram or delete your entire TikTok?", option_a: "Delete Instagram", option_b: "Delete TikTok", category: "Tech" },
  { question_text: "Would you rather Have a self-driving car or a personal drone?", option_a: "Self-driving car", option_b: "Personal drone", category: "Tech" },

  // ─── SPORTS (17) ───
  { question_text: "Would you rather Be a pro skateboarder or a pro surfer?", option_a: "Pro skateboarder", option_b: "Pro surfer", category: "Sports" },
  { question_text: "Would you rather Win the World Cup or win an Olympic gold medal?", option_a: "Win the World Cup", option_b: "Olympic gold medal", category: "Sports" },
  { question_text: "Would you rather Play pickup basketball with LeBron or play FIFA with Mbappe?", option_a: "Basketball with LeBron", option_b: "FIFA with Mbappe", category: "Sports" },
  { question_text: "Would you rather Run a sub-4-minute mile or bench press 400 lbs?", option_a: "Sub-4-minute mile", option_b: "Bench 400 lbs", category: "Sports" },
  { question_text: "Would you rather Be a pro esports player or a pro athlete?", option_a: "Pro esports player", option_b: "Pro athlete", category: "Sports" },
  { question_text: "Would you rather Only do cardio or only lift weights forever?", option_a: "Only cardio", option_b: "Only weights", category: "Sports" },
  { question_text: "Would you rather Be the best at one sport or decent at every sport?", option_a: "Best at one sport", option_b: "Decent at all sports", category: "Sports" },
  { question_text: "Would you rather Have courtside NBA seats for life or front row at the Super Bowl every year?", option_a: "Courtside NBA for life", option_b: "Front row Super Bowl", category: "Sports" },
  { question_text: "Would you rather Never miss a free throw or never miss a penalty kick?", option_a: "Never miss free throws", option_b: "Never miss penalties", category: "Sports" },
  { question_text: "Would you rather Box against a kangaroo or wrestle a bear cub?", option_a: "Box a kangaroo", option_b: "Wrestle a bear cub", category: "Sports" },
  { question_text: "Would you rather Be an F1 driver or an NBA point guard?", option_a: "F1 driver", option_b: "NBA point guard", category: "Sports" },
  { question_text: "Would you rather Play tennis with Djokovic or golf with Tiger Woods?", option_a: "Tennis with Djokovic", option_b: "Golf with Tiger", category: "Sports" },
  { question_text: "Would you rather Always win at arm wrestling or always win at rock climbing?", option_a: "Win at arm wrestling", option_b: "Win at rock climbing", category: "Sports" },
  { question_text: "Would you rather Do CrossFit every day or yoga every day for a year?", option_a: "CrossFit every day", option_b: "Yoga every day", category: "Sports" },
  { question_text: "Would you rather Swim across the English Channel or climb Mount Everest?", option_a: "Swim English Channel", option_b: "Climb Everest", category: "Sports" },
  { question_text: "Would you rather Be the GOAT in a boring sport or average in the most exciting sport?", option_a: "GOAT in boring sport", option_b: "Average in exciting sport", category: "Sports" },
  { question_text: "Would you rather Only watch live sports or only watch replays?", option_a: "Only live sports", option_b: "Only replays", category: "Sports" },

  // ─── ENTERTAINMENT (18) ───
  { question_text: "Would you rather Binge one show forever or watch a new show every week?", option_a: "Binge one show forever", option_b: "New show every week", category: "Entertainment" },
  { question_text: "Would you rather Live in the Harry Potter universe or the Marvel universe?", option_a: "Harry Potter universe", option_b: "Marvel universe", category: "Entertainment" },
  { question_text: "Would you rather Be in a reality TV show or a scripted drama?", option_a: "Reality TV show", option_b: "Scripted drama", category: "Entertainment" },
  { question_text: "Would you rather Go to a music festival every month or a movie premiere every week?", option_a: "Music festival monthly", option_b: "Movie premiere weekly", category: "Entertainment" },
  { question_text: "Would you rather Watch only anime or only K-dramas for a year?", option_a: "Only anime", option_b: "Only K-dramas", category: "Entertainment" },
  { question_text: "Would you rather Have Spotify Premium free forever or Netflix free forever?", option_a: "Free Spotify Premium", option_b: "Free Netflix", category: "Entertainment" },
  { question_text: "Would you rather Star in a Marvel movie or a Star Wars movie?", option_a: "Marvel movie", option_b: "Star Wars movie", category: "Entertainment" },
  { question_text: "Would you rather Be a famous podcaster or a famous YouTuber?", option_a: "Famous podcaster", option_b: "Famous YouTuber", category: "Entertainment" },
  { question_text: "Would you rather Only listen to music from before 2000 or only music released this year?", option_a: "Pre-2000 music only", option_b: "This year's music only", category: "Entertainment" },
  { question_text: "Would you rather Watch the same movie every day or never rewatch any movie?", option_a: "Same movie daily", option_b: "Never rewatch", category: "Entertainment" },
  { question_text: "Would you rather Meet your favorite artist but they're rude or never meet them?", option_a: "Meet them, they're rude", option_b: "Never meet them", category: "Entertainment" },
  { question_text: "Would you rather Only watch comedies or only watch thrillers?", option_a: "Only comedies", option_b: "Only thrillers", category: "Entertainment" },
  { question_text: "Would you rather Have front row concert tickets forever or backstage passes forever?", option_a: "Front row forever", option_b: "Backstage forever", category: "Entertainment" },
  { question_text: "Would you rather Be on The Voice or on Love Island?", option_a: "The Voice", option_b: "Love Island", category: "Entertainment" },
  { question_text: "Would you rather Only read manga or only read novels?", option_a: "Only manga", option_b: "Only novels", category: "Entertainment" },
  { question_text: "Would you rather Live in the world of Attack on Titan or the world of One Piece?", option_a: "Attack on Titan world", option_b: "One Piece world", category: "Entertainment" },
  { question_text: "Would you rather Have your life narrated by David Attenborough or by Snoop Dogg?", option_a: "David Attenborough", option_b: "Snoop Dogg", category: "Entertainment" },
  { question_text: "Would you rather Write a hit song or direct a hit movie?", option_a: "Write a hit song", option_b: "Direct a hit movie", category: "Entertainment" },

  // ─── LOVE (18) ───
  { question_text: "Would you rather Get a love letter or a surprise date?", option_a: "Love letter", option_b: "Surprise date", category: "Love" },
  { question_text: "Would you rather Have your partner plan all dates or always plan them yourself?", option_a: "Partner plans all", option_b: "I plan all", category: "Love" },
  { question_text: "Would you rather Date someone who texts too much or barely texts at all?", option_a: "Texts too much", option_b: "Barely texts", category: "Love" },
  { question_text: "Would you rather Know your soulmate's name but not when you'll meet or meet them tomorrow but never know for sure?", option_a: "Know their name", option_b: "Meet tomorrow, unsure", category: "Love" },
  { question_text: "Would you rather Have your crush follow you back or get their number?", option_a: "Follow back", option_b: "Get their number", category: "Love" },
  { question_text: "Would you rather Date someone who's always early or always late?", option_a: "Always early", option_b: "Always late", category: "Love" },
  { question_text: "Would you rather Fall in love at first sight or grow into love slowly?", option_a: "Love at first sight", option_b: "Grow into love", category: "Love" },
  { question_text: "Would you rather Date a gamer or date an athlete?", option_a: "Date a gamer", option_b: "Date an athlete", category: "Love" },
  { question_text: "Would you rather Have a partner who cooks amazingly or one who cleans everything?", option_a: "Amazing cook", option_b: "Cleans everything", category: "Love" },
  { question_text: "Would you rather Confess your feelings and get rejected or never confess?", option_a: "Confess and get rejected", option_b: "Never confess", category: "Love" },
  { question_text: "Would you rather Date someone your friends hate or date someone your family hates?", option_a: "Friends hate them", option_b: "Family hates them", category: "Love" },
  { question_text: "Would you rather Have a partner who's super jealous or super chill about everything?", option_a: "Super jealous", option_b: "Super chill", category: "Love" },
  { question_text: "Would you rather Always say I love you first or always hear it first?", option_a: "Say it first", option_b: "Hear it first", category: "Love" },
  { question_text: "Would you rather Share all your passwords with your partner or keep everything private?", option_a: "Share all passwords", option_b: "Keep everything private", category: "Love" },
  { question_text: "Would you rather Have a long love story or an intense short romance?", option_a: "Long love story", option_b: "Intense short romance", category: "Love" },
  { question_text: "Would you rather Date someone famous or date someone nobody knows?", option_a: "Date someone famous", option_b: "Date someone unknown", category: "Love" },
  { question_text: "Would you rather Get proposed to in public or in private?", option_a: "Public proposal", option_b: "Private proposal", category: "Love" },
  { question_text: "Would you rather Be in a power couple or a low-key relationship?", option_a: "Power couple", option_b: "Low-key relationship", category: "Love" },

  // ─── MONEY (17) ───
  { question_text: "Would you rather Be a millionaire with no free time or broke with unlimited free time?", option_a: "Millionaire, no free time", option_b: "Broke, unlimited free time", category: "Money" },
  { question_text: "Would you rather Get $10K right now or $100K in 5 years?", option_a: "$10K now", option_b: "$100K in 5 years", category: "Money" },
  { question_text: "Would you rather Be a famous influencer or a secret billionaire?", option_a: "Famous influencer", option_b: "Secret billionaire", category: "Money" },
  { question_text: "Would you rather Win the lottery or build your own empire?", option_a: "Win the lottery", option_b: "Build my own empire", category: "Money" },
  { question_text: "Would you rather Have your dream job paying $40K or a boring job paying $200K?", option_a: "Dream job, $40K", option_b: "Boring job, $200K", category: "Money" },
  { question_text: "Would you rather Never pay rent again or never pay for food again?", option_a: "Never pay rent", option_b: "Never pay for food", category: "Money" },
  { question_text: "Would you rather Be a CEO or a top-earning content creator?", option_a: "CEO", option_b: "Content creator", category: "Money" },
  { question_text: "Would you rather Retire at 30 with $2M or work till 65 with $20M?", option_a: "Retire at 30, $2M", option_b: "Work till 65, $20M", category: "Money" },
  { question_text: "Would you rather Invest in crypto or invest in real estate?", option_a: "Invest in crypto", option_b: "Invest in real estate", category: "Money" },
  { question_text: "Would you rather Have a $500 shopping spree every week or one $25K shopping spree a year?", option_a: "$500 every week", option_b: "$25K once a year", category: "Money" },
  { question_text: "Would you rather Drop out and start a startup or finish college and get a stable job?", option_a: "Drop out, start a startup", option_b: "Finish college, stable job", category: "Money" },
  { question_text: "Would you rather Have unlimited money for travel or unlimited money for fashion?", option_a: "Unlimited travel money", option_b: "Unlimited fashion money", category: "Money" },
  { question_text: "Would you rather Have a sugar parent or be self-made?", option_a: "Sugar parent", option_b: "Self-made", category: "Money" },
  { question_text: "Would you rather Get paid to sleep or get paid to eat?", option_a: "Paid to sleep", option_b: "Paid to eat", category: "Money" },
  { question_text: "Would you rather Have free healthcare forever or free education forever?", option_a: "Free healthcare", option_b: "Free education", category: "Money" },
  { question_text: "Would you rather Own a penthouse in the city or a beach house?", option_a: "City penthouse", option_b: "Beach house", category: "Money" },
  { question_text: "Would you rather Make $1 every time someone thinks of you or $100 every time you make someone laugh?", option_a: "$1 per thought", option_b: "$100 per laugh", category: "Money" },

  // ─── HYPOTHETICAL (18) ───
  { question_text: "Would you rather Be able to fly or be able to breathe underwater?", option_a: "Fly", option_b: "Breathe underwater", category: "Hypothetical" },
  { question_text: "Would you rather Have a rewind button for your life or a pause button?", option_a: "Rewind button", option_b: "Pause button", category: "Hypothetical" },
  { question_text: "Would you rather Be able to talk to animals or speak every human language?", option_a: "Talk to animals", option_b: "Speak every language", category: "Hypothetical" },
  { question_text: "Would you rather Know how you die or know when you die?", option_a: "Know how", option_b: "Know when", category: "Hypothetical" },
  { question_text: "Would you rather Have super strength or super speed?", option_a: "Super strength", option_b: "Super speed", category: "Hypothetical" },
  { question_text: "Would you rather Be able to stop time or travel through time?", option_a: "Stop time", option_b: "Travel through time", category: "Hypothetical" },
  { question_text: "Would you rather Wake up in a zombie apocalypse or an alien invasion?", option_a: "Zombie apocalypse", option_b: "Alien invasion", category: "Hypothetical" },
  { question_text: "Would you rather Be the last person on Earth or never be alone again?", option_a: "Last person on Earth", option_b: "Never alone again", category: "Hypothetical" },
  { question_text: "Would you rather Have a dragon or a unicorn as a pet?", option_a: "Pet dragon", option_b: "Pet unicorn", category: "Hypothetical" },
  { question_text: "Would you rather Live in a simulation that's perfect or the real world that's flawed?", option_a: "Perfect simulation", option_b: "Flawed real world", category: "Hypothetical" },
  { question_text: "Would you rather Be able to shrink to ant size or grow to giant size?", option_a: "Shrink to ant size", option_b: "Grow to giant size", category: "Hypothetical" },
  { question_text: "Would you rather Have X-ray vision or night vision?", option_a: "X-ray vision", option_b: "Night vision", category: "Hypothetical" },
  { question_text: "Would you rather Control fire or control water?", option_a: "Control fire", option_b: "Control water", category: "Hypothetical" },
  { question_text: "Would you rather Reset your life to age 10 with all your memories or get $10M right now?", option_a: "Reset to age 10", option_b: "$10M right now", category: "Hypothetical" },
  { question_text: "Would you rather Be immortal but alone or mortal with the perfect life?", option_a: "Immortal but alone", option_b: "Mortal, perfect life", category: "Hypothetical" },
  { question_text: "Would you rather Swap bodies with your best friend for a week or your worst enemy?", option_a: "Swap with best friend", option_b: "Swap with worst enemy", category: "Hypothetical" },
  { question_text: "Would you rather Have every red light turn green or never wait in a line again?", option_a: "All green lights", option_b: "Never wait in line", category: "Hypothetical" },
  { question_text: "Would you rather Have the ability to clone yourself or the ability to shapeshift?", option_a: "Clone yourself", option_b: "Shapeshift", category: "Hypothetical" },

  // ─── DEEP (18) ───
  { question_text: "Would you rather Know the truth about everything or be blissfully ignorant?", option_a: "Know all truth", option_b: "Blissfully ignorant", category: "Deep" },
  { question_text: "Would you rather Change one thing about your past or know one thing about your future?", option_a: "Change one past thing", option_b: "Know one future thing", category: "Deep" },
  { question_text: "Would you rather Be feared or be loved?", option_a: "Be feared", option_b: "Be loved", category: "Deep" },
  { question_text: "Would you rather Lose all your old memories or never make new ones?", option_a: "Lose old memories", option_b: "Never make new ones", category: "Deep" },
  { question_text: "Would you rather Know when everyone around you will die or know what they truly think of you?", option_a: "Know when they die", option_b: "Know what they think", category: "Deep" },
  { question_text: "Would you rather Live a short exciting life or a long boring one?", option_a: "Short and exciting", option_b: "Long and boring", category: "Deep" },
  { question_text: "Would you rather Have everyone forget you existed or forget everyone you ever knew?", option_a: "Everyone forgets me", option_b: "I forget everyone", category: "Deep" },
  { question_text: "Would you rather Be famous after you die or rich while you live?", option_a: "Famous after death", option_b: "Rich while alive", category: "Deep" },
  { question_text: "Would you rather Know the meaning of life or have the power to give life meaning for others?", option_a: "Know life's meaning", option_b: "Give meaning to others", category: "Deep" },
  { question_text: "Would you rather Relive your happiest day on loop or never feel sadness again?", option_a: "Happiest day on loop", option_b: "Never feel sadness", category: "Deep" },
  { question_text: "Would you rather Have complete freedom but no security or total security but no freedom?", option_a: "Freedom, no security", option_b: "Security, no freedom", category: "Deep" },
  { question_text: "Would you rather Save 100 strangers or 1 person you love?", option_a: "100 strangers", option_b: "1 person I love", category: "Deep" },
  { question_text: "Would you rather Always know the truth even when it hurts or live believing comforting lies?", option_a: "Truth even when it hurts", option_b: "Comforting lies", category: "Deep" },
  { question_text: "Would you rather Have the power to heal others but not yourself or heal yourself but not others?", option_a: "Heal others only", option_b: "Heal myself only", category: "Deep" },
  { question_text: "Would you rather Be remembered for something you didn't do or forgotten for something amazing you did?", option_a: "Remembered, didn't do it", option_b: "Forgotten, did something great", category: "Deep" },
  { question_text: "Would you rather Experience everything once or master one thing perfectly?", option_a: "Experience everything once", option_b: "Master one thing", category: "Deep" },
  { question_text: "Would you rather Know your purpose in life right now or discover it naturally?", option_a: "Know it now", option_b: "Discover it naturally", category: "Deep" },
  { question_text: "Would you rather Be average at everything or amazing at one thing and terrible at the rest?", option_a: "Average at everything", option_b: "Amazing at one thing", category: "Deep" },

  // ─── GAMING (17) ───
  { question_text: "Would you rather Only play single-player games or only play multiplayer games?", option_a: "Single-player only", option_b: "Multiplayer only", category: "Gaming" },
  { question_text: "Would you rather Live in the Minecraft world or the GTA world?", option_a: "Minecraft world", option_b: "GTA world", category: "Gaming" },
  { question_text: "Would you rather Have a PS5 or a top-tier gaming PC?", option_a: "PS5", option_b: "Gaming PC", category: "Gaming" },
  { question_text: "Would you rather Play only mobile games or only console games forever?", option_a: "Mobile games only", option_b: "Console games only", category: "Gaming" },
  { question_text: "Would you rather Be a pro Valorant player or a pro Call of Duty player?", option_a: "Pro Valorant", option_b: "Pro Call of Duty", category: "Gaming" },
  { question_text: "Would you rather Have unlimited V-Bucks or unlimited Robux?", option_a: "Unlimited V-Bucks", option_b: "Unlimited Robux", category: "Gaming" },
  { question_text: "Would you rather Never rage quit again or never lag again?", option_a: "Never rage quit", option_b: "Never lag", category: "Gaming" },
  { question_text: "Would you rather Play every game on easy mode or only on the hardest difficulty?", option_a: "Easy mode forever", option_b: "Hardest difficulty forever", category: "Gaming" },
  { question_text: "Would you rather Live in the Zelda universe or the Pokemon universe?", option_a: "Zelda universe", option_b: "Pokemon universe", category: "Gaming" },
  { question_text: "Would you rather Stream on Twitch or make YouTube gaming videos?", option_a: "Stream on Twitch", option_b: "YouTube gaming videos", category: "Gaming" },
  { question_text: "Would you rather Have God Mode in real life or Creative Mode in real life?", option_a: "God Mode IRL", option_b: "Creative Mode IRL", category: "Gaming" },
  { question_text: "Would you rather Only play retro games or only play VR games?", option_a: "Retro games only", option_b: "VR games only", category: "Gaming" },
  { question_text: "Would you rather Be the best at Fortnite or the best at League of Legends?", option_a: "Best at Fortnite", option_b: "Best at League of Legends", category: "Gaming" },
  { question_text: "Would you rather Have a gaming room or a home gym?", option_a: "Gaming room", option_b: "Home gym", category: "Gaming" },
  { question_text: "Would you rather Play Hogwarts Legacy forever or Elden Ring forever?", option_a: "Hogwarts Legacy forever", option_b: "Elden Ring forever", category: "Gaming" },
  { question_text: "Would you rather Win every online match but can't play with friends or lose every match but always play with friends?", option_a: "Win every match alone", option_b: "Lose with friends", category: "Gaming" },
  { question_text: "Would you rather Have Xbox Game Pass free forever or PlayStation Plus free forever?", option_a: "Xbox Game Pass free", option_b: "PS Plus free", category: "Gaming" },

  // ─── FASHION & STYLE (bonus - 5) ───
  { question_text: "Would you rather Wear designer clothes but they're ugly or wear basic fits but always look fire?", option_a: "Designer but ugly", option_b: "Basic but fire", category: "Lifestyle" },
  { question_text: "Would you rather Only wear one color forever or wear every color of the rainbow at once?", option_a: "One color forever", option_b: "Rainbow everything", category: "Lifestyle" },
  { question_text: "Would you rather Have unlimited sneakers or unlimited jewelry?", option_a: "Unlimited sneakers", option_b: "Unlimited jewelry", category: "Lifestyle" },
  { question_text: "Would you rather Always overdressed or always underdressed?", option_a: "Always overdressed", option_b: "Always underdressed", category: "Lifestyle" },
  { question_text: "Would you rather Wear your outfit backwards all day or inside out all day?", option_a: "Backwards all day", option_b: "Inside out all day", category: "Funny" },

  // ─── SCHOOL & COLLEGE (bonus - 5) ───
  { question_text: "Would you rather Have no homework forever or no exams forever?", option_a: "No homework", option_b: "No exams", category: "Lifestyle" },
  { question_text: "Would you rather Go to college for free or skip college and get $500K?", option_a: "Free college", option_b: "Skip college, $500K", category: "Money" },
  { question_text: "Would you rather Have the coolest dorm room or the best meal plan?", option_a: "Coolest dorm room", option_b: "Best meal plan", category: "Lifestyle" },
  { question_text: "Would you rather Pull an all-nighter every week or wake up at 5 AM every day?", option_a: "All-nighter weekly", option_b: "5 AM daily", category: "Lifestyle" },
  { question_text: "Would you rather Be the smartest person in every class or the most popular person on campus?", option_a: "Smartest in class", option_b: "Most popular on campus", category: "Lifestyle" },

  // ─── FITNESS & HEALTH (bonus - 5) ───
  { question_text: "Would you rather Have a six-pack but never eat dessert or eat whatever but no abs?", option_a: "Six-pack, no dessert", option_b: "Eat whatever, no abs", category: "Sports" },
  { question_text: "Would you rather Run 5 miles every day or meditate an hour every day?", option_a: "Run 5 miles daily", option_b: "Meditate 1 hour daily", category: "Sports" },
  { question_text: "Would you rather Have unlimited energy but only eat salads or normal energy and eat anything?", option_a: "Unlimited energy, salads", option_b: "Normal energy, eat anything", category: "Sports" },
  { question_text: "Would you rather Never get sick again or never feel physical pain?", option_a: "Never get sick", option_b: "Never feel pain", category: "Hypothetical" },
  { question_text: "Would you rather Have a perfect body with no effort or a genius-level brain with no effort?", option_a: "Perfect body", option_b: "Genius brain", category: "Deep" },
];

console.log(`Total questions prepared: ${questions.length}`);

// ── helpers ────────────────────────────────────────────────────────────
async function signIn() {
  const res = await fetch(`${BASE}/api/user-auth/sign-in/email?Instance=${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3000',
      'X-Database-Instance': INSTANCE,
    },
    body: JSON.stringify({ email: 'simple@test.com', password: 'password123' }),
  });
  if (!res.ok) throw new Error(`Sign-in failed: ${res.status} ${await res.text()}`);
  // Grab cookies from set-cookie header
  const cookies = res.headers.getSetCookie?.() || [];
  const cookieStr = cookies.map(c => c.split(';')[0]).join('; ');
  const data = await res.json();
  console.log('Signed in successfully. User:', data?.user?.email || data?.email || 'ok');
  return cookieStr;
}

async function insertQuestion(q, cookie) {
  const body = {
    question_text: q.question_text,
    option_a: q.option_a,
    option_b: q.option_b,
    category: q.category,
    is_mystery: 0,
    record_status: 'active',
    votes_a_count: 0,
    votes_b_count: 0,
    total_votes: 0,
    is_featured: 0,
  };
  const res = await fetch(
    `${BASE}/api/data/create/dilemmas?Instance=${INSTANCE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
        'X-Database-Instance': INSTANCE,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Insert failed (${res.status}): ${errText}`);
  }
  return res.json();
}

// ── main ──────────────────────────────────────────────────────────────
async function main() {
  const cookie = await signIn();

  let inserted = 0;
  let failed = 0;
  const BATCH = 5; // concurrent inserts

  for (let i = 0; i < questions.length; i += BATCH) {
    const batch = questions.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(q => insertQuestion(q, cookie))
    );
    for (const r of results) {
      if (r.status === 'fulfilled') {
        inserted++;
      } else {
        failed++;
        console.error('  FAIL:', r.reason?.message?.slice(0, 120));
      }
    }
    // Progress every 25
    if ((i + BATCH) % 25 < BATCH) {
      console.log(`  Progress: ${inserted} inserted, ${failed} failed out of ${Math.min(i + BATCH, questions.length)} attempted`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total prepared : ${questions.length}`);
  console.log(`Inserted       : ${inserted}`);
  console.log(`Failed         : ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
