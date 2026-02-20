// seed_questions_batch2.mjs — Second batch of ~420 more questions
// Run after batch 1: node seed_questions_batch2.mjs

const BASE = 'http://localhost:5179';
const INSTANCE = '53058_luxsocial';
let authCookie = '';

async function signIn() {
  const res = await fetch(`${BASE}/api/user-auth/sign-in/email?Instance=${INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Database-Instance': INSTANCE, 'Origin': BASE },
    body: JSON.stringify({ email: 'simple@test.com', password: 'password123' }),
  });
  if (!res.ok) throw new Error(`Sign-in failed: ${res.status}`);
  const cookies = res.headers.getSetCookie?.() || [];
  authCookie = cookies.map(c => c.split(';')[0]).join('; ');
  console.log('Signed in successfully');
}

async function insertQ(q) {
  const res = await fetch(`${BASE}/api/data/create/dilemmas?Instance=${INSTANCE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Database-Instance': INSTANCE, Cookie: authCookie },
    body: JSON.stringify({ question_text: q.q, option_a: q.a, option_b: q.b, category: q.c, record_status: 'active' }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Insert failed (${res.status}): ${t.slice(0, 150)}`); }
  return res.json();
}

const Q = [
  // ═══════════════════════════════════════
  // LIFESTYLE batch 2 (~40)
  // ═══════════════════════════════════════
  { q: "Would you rather Have a window that shows any view in the world or a door that opens to any room?", a: "Any view window", b: "Any room door", c: "lifestyle" },
  { q: "Would you rather Never have to do taxes again or never have to grocery shop again?", a: "No more taxes", b: "No more grocery shopping", c: "lifestyle" },
  { q: "Would you rather Always find money in your pocket or always find a good parking spot?", a: "Money in pocket", b: "Good parking", c: "lifestyle" },
  { q: "Would you rather Have a personal DJ or a personal photographer following you around?", a: "Personal DJ", b: "Personal photographer", c: "lifestyle" },
  { q: "Would you rather Live in a castle with no heating or a modern apartment with no view?", a: "Castle, no heating", b: "Apartment, no view", c: "lifestyle" },
  { q: "Would you rather Only use cash for everything or only use digital payments?", a: "Cash only", b: "Digital only", c: "lifestyle" },
  { q: "Would you rather Have a bathtub that always has the perfect temperature or a bed that always feels brand new?", a: "Perfect bath always", b: "Brand new bed always", c: "lifestyle" },
  { q: "Would you rather Never get stuck in traffic or never wait for a delivery?", a: "No traffic ever", b: "Instant delivery", c: "lifestyle" },
  { q: "Would you rather Have a closet that organizes itself or a fridge that never runs out?", a: "Self-organizing closet", b: "Infinite fridge", c: "lifestyle" },
  { q: "Would you rather Live above a bakery or above a flower shop?", a: "Above a bakery", b: "Above a flower shop", c: "lifestyle" },
  { q: "Would you rather Have a commute of 5 minutes or work from anywhere but no home?", a: "5-min commute", b: "Work from anywhere, no home", c: "lifestyle" },
  { q: "Would you rather Live without mirrors for a year or without clocks for a year?", a: "No mirrors for a year", b: "No clocks for a year", c: "lifestyle" },
  { q: "Would you rather Always have perfect nails or always have perfect eyebrows?", a: "Perfect nails", b: "Perfect eyebrows", c: "lifestyle" },
  { q: "Would you rather Never lose a sock in the laundry or never have a tangled charger?", a: "Never lose socks", b: "Never tangled charger", c: "lifestyle" },
  { q: "Would you rather Have a house that floats on water or one that's underground?", a: "Floating house", b: "Underground house", c: "lifestyle" },
  { q: "Would you rather Only shop at thrift stores or only shop at luxury stores?", a: "Only thrift stores", b: "Only luxury stores", c: "lifestyle" },
  { q: "Would you rather Live in a world without Mondays or without alarm clocks?", a: "No Mondays", b: "No alarm clocks", c: "lifestyle" },
  { q: "Would you rather Have the ability to cook any dish perfectly or clean any mess instantly?", a: "Cook perfectly", b: "Clean instantly", c: "lifestyle" },
  { q: "Would you rather Always know what to wear or always know what to say?", a: "Always know what to wear", b: "Always know what to say", c: "lifestyle" },
  { q: "Would you rather Have a home gym or a home spa?", a: "Home gym", b: "Home spa", c: "lifestyle" },

  // ═══════════════════════════════════════
  // FOOD batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Eat only street food for a year or only fine dining for a year?", a: "Street food only", b: "Fine dining only", c: "food" },
  { q: "Would you rather Give up sugar or give up salt forever?", a: "Give up sugar", b: "Give up salt", c: "food" },
  { q: "Would you rather Have a magical fridge that refills itself or a magical oven that cooks anything in 1 minute?", a: "Self-refilling fridge", b: "1-minute magic oven", c: "food" },
  { q: "Would you rather Eat a live bug or drink a glass of expired milk?", a: "Live bug", b: "Expired milk", c: "food" },
  { q: "Would you rather Give up cooking with oil or cooking with butter?", a: "No oil", b: "No butter", c: "food" },
  { q: "Would you rather Only eat food you grow yourself or only eat food from restaurants?", a: "Grow it myself", b: "Restaurant only", c: "food" },
  { q: "Would you rather Have unlimited free groceries at one store or 50% off at any store?", a: "Free at one store", b: "50% off everywhere", c: "food" },
  { q: "Would you rather Only eat tiny portions of gourmet food or huge portions of average food?", a: "Tiny gourmet portions", b: "Huge average portions", c: "food" },
  { q: "Would you rather Never eat out again or never cook at home again?", a: "Never eat out", b: "Never cook at home", c: "food" },
  { q: "Would you rather Have your drinks always be the perfect temperature or your food always be perfectly seasoned?", a: "Perfect drink temp", b: "Perfect seasoning", c: "food" },
  { q: "Would you rather Only eat vegan for a year or only eat meat for a year?", a: "Vegan for a year", b: "Only meat for a year", c: "food" },
  { q: "Would you rather Give up all fried food or all baked food?", a: "Give up fried", b: "Give up baked", c: "food" },
  { q: "Would you rather Have unlimited snacks or unlimited drinks?", a: "Unlimited snacks", b: "Unlimited drinks", c: "food" },
  { q: "Would you rather Only eat food that's the same color as your outfit or food that matches your mood?", a: "Matches outfit color", b: "Matches mood", c: "food" },
  { q: "Would you rather Be an amazing baker or an amazing grill master?", a: "Amazing baker", b: "Amazing grill master", c: "food" },
  { q: "Would you rather Have every meal be a surprise or plan every meal a week in advance?", a: "Every meal a surprise", b: "Plan week in advance", c: "food" },
  { q: "Would you rather Give up all condiments or give up all spices?", a: "No condiments", b: "No spices", c: "food" },
  { q: "Would you rather Only eat room temperature food or food that's way too hot?", a: "Room temp only", b: "Way too hot only", c: "food" },
  { q: "Would you rather Have unlimited matcha or unlimited espresso?", a: "Unlimited matcha", b: "Unlimited espresso", c: "food" },
  { q: "Would you rather Only eat with tiny utensils or comically large utensils?", a: "Tiny utensils", b: "Comically large utensils", c: "food" },

  // ═══════════════════════════════════════
  // FUN batch 2 (~40)
  // ═══════════════════════════════════════
  { q: "Would you rather Your life have a laugh track or dramatic background music?", a: "Laugh track", b: "Dramatic music", c: "fun" },
  { q: "Would you rather Have googly eyes that never come off or squeaky shoes that never stop?", a: "Googly eyes forever", b: "Squeaky shoes forever", c: "fun" },
  { q: "Would you rather Every photo of you has a photobomb or every video has a blooper reel?", a: "Always photobombed", b: "Always has bloopers", c: "fun" },
  { q: "Would you rather Swap hands with your feet for a day or swap your voice with a baby's?", a: "Swap hands and feet", b: "Baby voice for a day", c: "fun" },
  { q: "Would you rather Smell like garlic for a week or taste garlic in everything for a week?", a: "Smell like garlic", b: "Taste garlic in everything", c: "fun" },
  { q: "Would you rather Have your thoughts appear as speech bubbles or your emotions shown as emojis above your head?", a: "Thought bubbles", b: "Emoji emotions", c: "fun" },
  { q: "Would you rather Be followed by 10 ducks everywhere or have a raccoon that steals your stuff?", a: "10 ducks following", b: "Thieving raccoon", c: "fun" },
  { q: "Would you rather Accidentally like all your crush's posts or accidentally unfriend your boss?", a: "Like all crush's posts", b: "Unfriend boss", c: "fun" },
  { q: "Would you rather Have hands that are always sticky or feet that are always cold?", a: "Always sticky hands", b: "Always cold feet", c: "fun" },
  { q: "Would you rather Have a voice that auto-tunes or a walk that has a beat?", a: "Auto-tune voice", b: "Walk with a beat", c: "fun" },
  { q: "Would you rather Turn into a cat for weekends or a bird for Mondays?", a: "Cat on weekends", b: "Bird on Mondays", c: "fun" },
  { q: "Would you rather Have to speak in movie quotes or song lyrics for a whole day?", a: "Movie quotes all day", b: "Song lyrics all day", c: "fun" },
  { q: "Would you rather Always have the wrong autocorrect or always typo the last word of every sentence?", a: "Wrong autocorrect", b: "Typo last word always", c: "fun" },
  { q: "Would you rather Be haunted by a friendly ghost or have a pet that can roast you?", a: "Friendly ghost", b: "Roasting pet", c: "fun" },
  { q: "Would you rather Have your hair change color with your mood or your eyes glow in the dark?", a: "Mood hair color", b: "Glow-in-dark eyes", c: "fun" },
  { q: "Would you rather Every time you high-five someone there's an explosion effect or every time you clap it thunders?", a: "Explosion high-fives", b: "Thunder claps", c: "fun" },
  { q: "Would you rather Have to moonwalk everywhere or do the robot when standing still?", a: "Moonwalk everywhere", b: "Robot when standing still", c: "fun" },
  { q: "Would you rather Your ringtone be a scream or your alarm be an air horn?", a: "Scream ringtone", b: "Air horn alarm", c: "fun" },
  { q: "Would you rather Have confetti fall every time you make a decision or a drumroll before every sentence?", a: "Confetti decisions", b: "Drumroll sentences", c: "fun" },
  { q: "Would you rather Have a tail you can't hide or wings too small to fly?", a: "Visible tail", b: "Tiny useless wings", c: "fun" },

  // ═══════════════════════════════════════
  // TRAVEL batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Take a helicopter tour of a city or a hot air balloon ride over countryside?", a: "Helicopter city tour", b: "Hot air balloon countryside", c: "travel" },
  { q: "Would you rather Visit every capital city in the world or every beach in the world?", a: "Every capital city", b: "Every beach", c: "travel" },
  { q: "Would you rather Travel back to ancient Rome or ancient Egypt?", a: "Ancient Rome", b: "Ancient Egypt", c: "travel" },
  { q: "Would you rather Have a year-long trip with a small budget or a two-week trip with unlimited budget?", a: "Year, small budget", b: "2 weeks, unlimited", c: "travel" },
  { q: "Would you rather Ride the Orient Express or fly on a private jet?", a: "Orient Express", b: "Private jet", c: "travel" },
  { q: "Would you rather Visit Machu Picchu or the Pyramids of Giza?", a: "Machu Picchu", b: "Pyramids of Giza", c: "travel" },
  { q: "Would you rather Spend a summer in Barcelona or a winter in Lapland?", a: "Summer in Barcelona", b: "Winter in Lapland", c: "travel" },
  { q: "Would you rather Roadtrip along Route 66 or drive the Amalfi Coast?", a: "Route 66", b: "Amalfi Coast", c: "travel" },
  { q: "Would you rather Go bungee jumping in New Zealand or skydiving in Dubai?", a: "Bungee in NZ", b: "Skydive in Dubai", c: "travel" },
  { q: "Would you rather Visit all 7 continents in a month or spend a month in your dream destination?", a: "7 continents in a month", b: "1 month dream destination", c: "travel" },
  { q: "Would you rather Travel only by night or only by day?", a: "Only night travel", b: "Only day travel", c: "travel" },
  { q: "Would you rather Have a map that shows hidden gems or a guide who knows all the locals?", a: "Hidden gems map", b: "Local-connected guide", c: "travel" },
  { q: "Would you rather Visit Dubai or visit Singapore?", a: "Dubai", b: "Singapore", c: "travel" },
  { q: "Would you rather Volunteer abroad for a year or intern abroad for 6 months?", a: "Volunteer 1 year", b: "Intern 6 months", c: "travel" },
  { q: "Would you rather See the cherry blossoms in Japan or the tulips in the Netherlands?", a: "Cherry blossoms, Japan", b: "Tulips, Netherlands", c: "travel" },
  { q: "Would you rather Take a gondola ride in Venice or a tuk-tuk ride in Bangkok?", a: "Gondola in Venice", b: "Tuk-tuk in Bangkok", c: "travel" },
  { q: "Would you rather Spend a night in an underwater hotel or a space station?", a: "Underwater hotel", b: "Space station", c: "travel" },
  { q: "Would you rather Travel with a massive suitcase or just a backpack?", a: "Massive suitcase", b: "Just a backpack", c: "travel" },
  { q: "Would you rather Visit Petra in Jordan or Angkor Wat in Cambodia?", a: "Petra, Jordan", b: "Angkor Wat, Cambodia", c: "travel" },
  { q: "Would you rather Fly to 100 airports but never leave them or visit 10 countries properly?", a: "100 airports, stay inside", b: "10 countries properly", c: "travel" },

  // ═══════════════════════════════════════
  // RELATIONSHIPS batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Have a partner who's an amazing listener or an amazing storyteller?", a: "Amazing listener", b: "Amazing storyteller", c: "relationships" },
  { q: "Would you rather Be with someone who surprises you or someone predictable and reliable?", a: "Full of surprises", b: "Predictable and reliable", c: "relationships" },
  { q: "Would you rather Have a partner who loves traveling or one who loves staying home?", a: "Loves traveling", b: "Loves staying home", c: "relationships" },
  { q: "Would you rather Be set up by friends or meet someone organically?", a: "Set up by friends", b: "Meet organically", c: "relationships" },
  { q: "Would you rather Have matching energy levels or complementary ones?", a: "Matching energy", b: "Complementary energy", c: "relationships" },
  { q: "Would you rather Date someone who's the life of the party or the quiet one in the corner?", a: "Life of the party", b: "Quiet in the corner", c: "relationships" },
  { q: "Would you rather Have a 'we met' story that's embarrassing but funny or romantic but boring?", a: "Embarrassing but funny", b: "Romantic but boring", c: "relationships" },
  { q: "Would you rather Have weekly date nights or one big trip per year?", a: "Weekly date nights", b: "One big trip a year", c: "relationships" },
  { q: "Would you rather Date someone who's always hot or always cold (temperature)?", a: "Always too hot", b: "Always too cold", c: "relationships" },
  { q: "Would you rather Have a partner who cooks well but is messy or one who cleans well but burns everything?", a: "Cooks well, messy", b: "Cleans well, can't cook", c: "relationships" },
  { q: "Would you rather Always agree with your partner or have healthy debates?", a: "Always agree", b: "Healthy debates", c: "relationships" },
  { q: "Would you rather Your partner give you flowers or write you a poem?", a: "Flowers", b: "Poem", c: "relationships" },
  { q: "Would you rather Have a partner who's a dog person or a cat person?", a: "Dog person", b: "Cat person", c: "relationships" },
  { q: "Would you rather Have one lifelong best friend or many close friends?", a: "One lifelong BFF", b: "Many close friends", c: "relationships" },
  { q: "Would you rather Be friends with someone who always makes you laugh or always gives great advice?", a: "Always makes me laugh", b: "Always gives great advice", c: "relationships" },
  { q: "Would you rather Have a friend who's always positive or always realistic?", a: "Always positive friend", b: "Always realistic friend", c: "relationships" },
  { q: "Would you rather Live with your best friend or live alone?", a: "Live with bestie", b: "Live alone", c: "relationships" },
  { q: "Would you rather Have a friend group of 3 or a friend group of 15?", a: "Tight 3-person group", b: "Big 15-person group", c: "relationships" },
  { q: "Would you rather Have a sibling who's your best friend or a best friend who feels like a sibling?", a: "Sibling best friend", b: "Best friend like sibling", c: "relationships" },
  { q: "Would you rather Have a partner who remembers all dates or one who always plans surprises?", a: "Remembers all dates", b: "Plans surprises", c: "relationships" },

  // ═══════════════════════════════════════
  // MONEY batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Win $1M but can't invest it or win $100K and can invest however you want?", a: "$1M, can't invest", b: "$100K, invest freely", c: "money" },
  { q: "Would you rather Be an employee at your dream company or the CEO of a boring company?", a: "Employee at dream company", b: "CEO of boring company", c: "money" },
  { q: "Would you rather Have a 6-figure salary with high stress or a 5-figure salary with no stress?", a: "6 figures, high stress", b: "5 figures, no stress", c: "money" },
  { q: "Would you rather Get $1 every time you walk a step or $10 every time you make someone smile?", a: "$1 per step", b: "$10 per smile", c: "money" },
  { q: "Would you rather Inherit a business you don't like or start from scratch in a field you love?", a: "Inherit boring business", b: "Start from scratch", c: "money" },
  { q: "Would you rather Have a free house but no car or a free car but no house?", a: "Free house, no car", b: "Free car, no house", c: "money" },
  { q: "Would you rather Be paid in experiences or in money?", a: "Paid in experiences", b: "Paid in money", c: "money" },
  { q: "Would you rather Own a chain of coffee shops or a tech startup?", a: "Coffee shop chain", b: "Tech startup", c: "money" },
  { q: "Would you rather Get a bonus every month or one massive bonus per year?", a: "Monthly bonus", b: "One yearly bonus", c: "money" },
  { q: "Would you rather Have your student debt erased or get a free house?", a: "Student debt erased", b: "Free house", c: "money" },
  { q: "Would you rather Earn money while you sleep or earn double while you work?", a: "Earn while sleeping", b: "Double while working", c: "money" },
  { q: "Would you rather Own a yacht or own a private island?", a: "Own a yacht", b: "Own a private island", c: "money" },
  { q: "Would you rather Have a credit card with no limit but it's visible to everyone or one with a $5K limit and total privacy?", a: "No limit, public", b: "$5K limit, private", c: "money" },
  { q: "Would you rather Have free childcare or free elder care?", a: "Free childcare", b: "Free elder care", c: "money" },
  { q: "Would you rather Flip houses for a living or trade stocks?", a: "Flip houses", b: "Trade stocks", c: "money" },
  { q: "Would you rather Have a $200K salary in a boring job or a $80K salary as a travel blogger?", a: "$200K boring job", b: "$80K travel blogger", c: "money" },
  { q: "Would you rather Pay off all your debt or get $50K cash right now?", a: "Pay off all debt", b: "$50K cash now", c: "money" },
  { q: "Would you rather Have a fully funded retirement or unlimited vacation budget now?", a: "Funded retirement", b: "Unlimited vacation now", c: "money" },
  { q: "Would you rather Live frugally and retire at 40 or live large and work till 70?", a: "Frugal, retire at 40", b: "Live large, work till 70", c: "money" },
  { q: "Would you rather Receive $10K every birthday or $1K every month?", a: "$10K every birthday", b: "$1K every month", c: "money" },

  // ═══════════════════════════════════════
  // HYPOTHETICAL batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Have perfect luck or perfect memory?", a: "Perfect luck", b: "Perfect memory", c: "hypothetical" },
  { q: "Would you rather Be able to communicate with plants or with machines?", a: "Communicate with plants", b: "Communicate with machines", c: "hypothetical" },
  { q: "Would you rather Live in a world where everyone can fly or everyone can read minds?", a: "Everyone can fly", b: "Everyone reads minds", c: "hypothetical" },
  { q: "Would you rather Have the ability to pause reality or rewind it 10 seconds?", a: "Pause reality", b: "Rewind 10 seconds", c: "hypothetical" },
  { q: "Would you rather Wake up each day in a random country or wake up as a random person?", a: "Random country daily", b: "Random person daily", c: "hypothetical" },
  { q: "Would you rather Have a pet that can talk or a car that can fly?", a: "Talking pet", b: "Flying car", c: "hypothetical" },
  { q: "Would you rather See in the dark like a cat or hear like a bat?", a: "See in the dark", b: "Hear like a bat", c: "hypothetical" },
  { q: "Would you rather Have the power to duplicate objects or the power to shrink them?", a: "Duplicate objects", b: "Shrink objects", c: "hypothetical" },
  { q: "Would you rather Live in a world without lying or a world without crime?", a: "No lying", b: "No crime", c: "hypothetical" },
  { q: "Would you rather Be immune to all diseases or immune to all injuries?", a: "Immune to diseases", b: "Immune to injuries", c: "hypothetical" },
  { q: "Would you rather Have a pause button for conversations or an undo button for actions?", a: "Pause conversations", b: "Undo actions", c: "hypothetical" },
  { q: "Would you rather Breathe fire or shoot ice from your hands?", a: "Breathe fire", b: "Shoot ice", c: "hypothetical" },
  { q: "Would you rather Have a robot that does your chores or a clone that goes to school/work for you?", a: "Chore robot", b: "Work/school clone", c: "hypothetical" },
  { q: "Would you rather Know every secret in the world or have everyone know your secrets?", a: "Know all secrets", b: "Everyone knows mine", c: "hypothetical" },
  { q: "Would you rather Live to 200 but look old at 30 or live to 60 but look 25 forever?", a: "Live to 200, look old", b: "Live to 60, look 25", c: "hypothetical" },
  { q: "Would you rather Have the power to make anyone sleep or anyone wake up?", a: "Make anyone sleep", b: "Make anyone wake up", c: "hypothetical" },
  { q: "Would you rather Absorb information by touching books or by eating food?", a: "Touch books to learn", b: "Eat food to learn", c: "hypothetical" },
  { q: "Would you rather Have a superpower that only works on Tuesdays or one that works always but at 10% power?", a: "Full power on Tuesdays", b: "10% power always", c: "hypothetical" },
  { q: "Would you rather Be able to summon any object you've lost or predict 1 minute into the future?", a: "Summon lost objects", b: "Predict 1 minute ahead", c: "hypothetical" },
  { q: "Would you rather Have unbreakable bones or unlimited stamina?", a: "Unbreakable bones", b: "Unlimited stamina", c: "hypothetical" },

  // ═══════════════════════════════════════
  // DEEP batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Have all the answers but no one believes you or have people believe everything you say but often be wrong?", a: "All answers, no one believes", b: "Always believed, often wrong", c: "deep" },
  { q: "Would you rather Know the date of your death or the cause of your death?", a: "Know the date", b: "Know the cause", c: "deep" },
  { q: "Would you rather Have a meaningful job that pays little or a meaningless job that pays well?", a: "Meaningful, low pay", b: "Meaningless, high pay", c: "deep" },
  { q: "Would you rather Be the wisest person in the room or the happiest?", a: "Wisest", b: "Happiest", c: "deep" },
  { q: "Would you rather Live in a world without music or without color?", a: "Without music", b: "Without color", c: "deep" },
  { q: "Would you rather Know your true calling in life or your true love?", a: "True calling", b: "True love", c: "deep" },
  { q: "Would you rather Have everyone understand you perfectly or understand everyone perfectly?", a: "Everyone understands me", b: "I understand everyone", c: "deep" },
  { q: "Would you rather Achieve greatness alone or achieve something small as a team?", a: "Greatness alone", b: "Small thing as a team", c: "deep" },
  { q: "Would you rather Be someone people admire or someone people trust?", a: "Admired", b: "Trusted", c: "deep" },
  { q: "Would you rather Have the power to end all wars or end all poverty?", a: "End all wars", b: "End all poverty", c: "deep" },
  { q: "Would you rather Forget your greatest achievement or your greatest failure?", a: "Forget greatest achievement", b: "Forget greatest failure", c: "deep" },
  { q: "Would you rather Be genuinely content with little or constantly striving for more?", a: "Content with little", b: "Constantly striving", c: "deep" },
  { q: "Would you rather Know everyone's true intentions or never be deceived?", a: "Know true intentions", b: "Never be deceived", c: "deep" },
  { q: "Would you rather Change the world but be forgotten or be remembered forever but change nothing?", a: "Change world, be forgotten", b: "Remembered, change nothing", c: "deep" },
  { q: "Would you rather Have wisdom beyond your years or youthful energy forever?", a: "Wisdom beyond years", b: "Youthful energy forever", c: "deep" },
  { q: "Would you rather Be right all the time or be kind all the time?", a: "Right all the time", b: "Kind all the time", c: "deep" },
  { q: "Would you rather Live a life of passion with hardship or a life of comfort with boredom?", a: "Passion with hardship", b: "Comfort with boredom", c: "deep" },
  { q: "Would you rather Have the respect of your enemies or the love of your friends?", a: "Respect of enemies", b: "Love of friends", c: "deep" },
  { q: "Would you rather Know yourself completely or know the universe completely?", a: "Know myself", b: "Know the universe", c: "deep" },
  { q: "Would you rather Be brave in one moment that matters or courageous in everyday life?", a: "Brave in one big moment", b: "Courageous every day", c: "deep" },

  // ═══════════════════════════════════════
  // SPORT batch 2 (~30)
  // ═══════════════════════════════════════
  { q: "Would you rather Be a professional dancer or a professional martial artist?", a: "Professional dancer", b: "Professional martial artist", c: "sport" },
  { q: "Would you rather Compete in the Olympics or in the World Cup?", a: "Olympics", b: "World Cup", c: "sport" },
  { q: "Would you rather Be the fastest person alive or the strongest?", a: "Fastest alive", b: "Strongest alive", c: "sport" },
  { q: "Would you rather Coach a championship team or play on one?", a: "Coach champions", b: "Play on champions", c: "sport" },
  { q: "Would you rather Always win but never enjoy the sport or enjoy every game but never win?", a: "Always win, no joy", b: "Always enjoy, never win", c: "sport" },
  { q: "Would you rather Be a pro rock climber or a pro scuba diver?", a: "Pro rock climber", b: "Pro scuba diver", c: "sport" },
  { q: "Would you rather Have the stamina of a marathon runner or the power of a sprinter?", a: "Marathon stamina", b: "Sprint power", c: "sport" },
  { q: "Would you rather Hit a grand slam in baseball or score a hat trick in soccer?", a: "Grand slam", b: "Hat trick", c: "sport" },
  { q: "Would you rather Be a gymnast or a figure skater?", a: "Gymnast", b: "Figure skater", c: "sport" },
  { q: "Would you rather Own a sports team or be a legendary player?", a: "Own a team", b: "Be a legend", c: "sport" },
  { q: "Would you rather Train at altitude for 3 months or train underwater for 1 month?", a: "Altitude 3 months", b: "Underwater 1 month", c: "sport" },
  { q: "Would you rather Watch sports in a stadium or on a massive screen at home?", a: "Stadium", b: "Massive screen at home", c: "sport" },
  { q: "Would you rather Break a world record in a weird sport or medal in a popular one?", a: "World record, weird sport", b: "Medal, popular sport", c: "sport" },
  { q: "Would you rather Play in the Premier League or the NBA?", a: "Premier League", b: "NBA", c: "sport" },
  { q: "Would you rather Be an extreme sports athlete or an endurance athlete?", a: "Extreme sports", b: "Endurance athlete", c: "sport" },

  // ═══════════════════════════════════════
  // TECH batch 2 (~30)
  // ═══════════════════════════════════════
  { q: "Would you rather Have a brain chip that gives you perfect memory or one that lets you learn any skill instantly?", a: "Perfect memory chip", b: "Instant skill chip", c: "tech" },
  { q: "Would you rather Have smart glasses or smart contact lenses?", a: "Smart glasses", b: "Smart contacts", c: "tech" },
  { q: "Would you rather Be the world's best hacker or the world's best programmer?", a: "Best hacker", b: "Best programmer", c: "tech" },
  { q: "Would you rather Have a robot dog or a robot cat?", a: "Robot dog", b: "Robot cat", c: "tech" },
  { q: "Would you rather Live in a world where AI runs everything or humans do everything manually?", a: "AI runs everything", b: "Humans do everything", c: "tech" },
  { q: "Would you rather Have a teleporter or a time machine app on your phone?", a: "Teleporter app", b: "Time machine app", c: "tech" },
  { q: "Would you rather Delete all your social media history or start fresh with zero followers?", a: "Delete all history", b: "Start fresh, zero followers", c: "tech" },
  { q: "Would you rather Have a phone that projects holograms or one that reads your thoughts?", a: "Hologram phone", b: "Thought-reading phone", c: "tech" },
  { q: "Would you rather Live with technology from 2030 or 1990?", a: "2030 technology", b: "1990 technology", c: "tech" },
  { q: "Would you rather Have your dream app built for free or get $100K to build it yourself?", a: "Dream app built free", b: "$100K to build it", c: "tech" },
  { q: "Would you rather Always have the fastest internet or always have the latest phone?", a: "Fastest internet", b: "Latest phone", c: "tech" },
  { q: "Would you rather Have a VR headset that feels 100% real or a drone with perfect stealth?", a: "100% real VR", b: "Perfect stealth drone", c: "tech" },
  { q: "Would you rather Code in only one programming language forever or speak only one human language forever?", a: "One programming language", b: "One human language", c: "tech" },
  { q: "Would you rather Have notifications for everything or no notifications at all?", a: "Notifications for everything", b: "No notifications ever", c: "tech" },
  { q: "Would you rather Be famous on a platform that dies in 5 years or unknown on one that lasts forever?", a: "Famous on dying platform", b: "Unknown on eternal platform", c: "tech" },

  // ═══════════════════════════════════════
  // OTHER / MISC batch 2 (~35)
  // ═══════════════════════════════════════
  { q: "Would you rather Be a world-class chef or a world-class musician?", a: "World-class chef", b: "World-class musician", c: "other" },
  { q: "Would you rather Host a talk show or star in an action movie?", a: "Host a talk show", b: "Star in action movie", c: "other" },
  { q: "Would you rather Have the ability to paint masterpieces or write bestselling novels?", a: "Paint masterpieces", b: "Write bestsellers", c: "other" },
  { q: "Would you rather Be a famous chef or a famous fashion designer?", a: "Famous chef", b: "Famous designer", c: "other" },
  { q: "Would you rather Discover a new species or discover a new planet?", a: "New species", b: "New planet", c: "other" },
  { q: "Would you rather Solve one unsolved mystery or prevent one future disaster?", a: "Solve a mystery", b: "Prevent a disaster", c: "other" },
  { q: "Would you rather Have the world's best singing voice or the world's best dance moves?", a: "Best singing voice", b: "Best dance moves", c: "other" },
  { q: "Would you rather Be an astronaut or a deep-sea explorer?", a: "Astronaut", b: "Deep-sea explorer", c: "other" },
  { q: "Would you rather Be the funniest person alive or the most charming?", a: "Funniest person", b: "Most charming person", c: "other" },
  { q: "Would you rather Have dinner with Einstein or Leonardo da Vinci?", a: "Dinner with Einstein", b: "Dinner with da Vinci", c: "other" },
  { q: "Would you rather Invent something that changes the world or create art that changes the world?", a: "World-changing invention", b: "World-changing art", c: "other" },
  { q: "Would you rather Be a famous historian or a famous futurist?", a: "Famous historian", b: "Famous futurist", c: "other" },
  { q: "Would you rather Win a Nobel Prize or an Oscar?", a: "Nobel Prize", b: "Oscar", c: "other" },
  { q: "Would you rather Be a master of persuasion or a master of observation?", a: "Master of persuasion", b: "Master of observation", c: "other" },
  { q: "Would you rather Have a photographic memory for faces or for places?", a: "Remember all faces", b: "Remember all places", c: "other" },
  { q: "Would you rather Be an incredible sculptor or an incredible photographer?", a: "Incredible sculptor", b: "Incredible photographer", c: "other" },
  { q: "Would you rather Have your own holiday named after you or a star named after you?", a: "Holiday named after me", b: "Star named after me", c: "other" },
  { q: "Would you rather Be a legendary comedian or a legendary author?", a: "Legendary comedian", b: "Legendary author", c: "other" },
  { q: "Would you rather Understand all animals or all babies?", a: "Understand animals", b: "Understand babies", c: "other" },
  { q: "Would you rather Speak at TED or perform at Coachella?", a: "Speak at TED", b: "Perform at Coachella", c: "other" },
];

console.log(`Batch 2 — Total questions to insert: ${Q.length}`);

async function main() {
  await signIn();
  let inserted = 0, failed = 0;
  const BATCH = 5;
  for (let i = 0; i < Q.length; i += BATCH) {
    const batch = Q.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(q => insertQ(q)));
    for (const r of results) {
      if (r.status === 'fulfilled') inserted++;
      else { failed++; console.error('  FAIL:', r.reason?.message?.slice(0, 150)); }
    }
    if ((i + BATCH) % 50 < BATCH) console.log(`  Progress: ${inserted}/${Q.length} inserted (${failed} failed)`);
  }
  console.log(`\n=== BATCH 2 DONE ===`);
  console.log(`Total: ${Q.length} | Inserted: ${inserted} | Failed: ${failed}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
