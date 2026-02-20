// seed_questions.mjs — Bulk insert ~800 "Would you rather" dilemmas via Vite proxy
// Run: npx vite --port 5179 (in another terminal), then: node seed_questions.mjs

const BASE = 'http://localhost:5179';
const INSTANCE = '53058_luxsocial';

let authCookie = '';

async function signIn() {
  const res = await fetch(`${BASE}/api/user-auth/sign-in/email?Instance=${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Database-Instance': INSTANCE,
      'Origin': BASE,
    },
    body: JSON.stringify({ email: 'simple@test.com', password: 'password123' }),
  });
  if (!res.ok) throw new Error(`Sign-in failed: ${res.status} ${await res.text()}`);
  const cookies = res.headers.getSetCookie?.() || [];
  authCookie = cookies.map(c => c.split(';')[0]).join('; ');
  console.log('Signed in successfully');
  return authCookie;
}

async function insertQ(q) {
  const body = {
    question_text: q.q,
    option_a: q.a,
    option_b: q.b,
    category: q.c,
    record_status: 'active',
  };
  const res = await fetch(`${BASE}/api/data/create/dilemmas?Instance=${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Database-Instance': INSTANCE,
      ...(authCookie ? { Cookie: authCookie } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Insert failed (${res.status}): ${t.slice(0, 200)}`);
  }
  return res.json();
}

// ════════════════════════════════════════════════════════════
// ALL QUESTIONS — ~800 unique "Would you rather" dilemmas
// Categories: lifestyle, food, travel, relationships, money,
//             hypothetical, fun, deep, sport, tech, other
// ════════════════════════════════════════════════════════════
const Q = [
  // ═══════════════════════════════════════
  // LIFESTYLE (~85)
  // ═══════════════════════════════════════
  { q: "Would you rather Have a personal chef or a personal trainer?", a: "Personal chef", b: "Personal trainer", c: "lifestyle" },
  { q: "Would you rather Live in a tiny house with an ocean view or a mansion with no windows?", a: "Tiny house, ocean view", b: "Mansion, no windows", c: "lifestyle" },
  { q: "Would you rather Always have fresh breath or always have fresh-smelling hair?", a: "Fresh breath always", b: "Fresh hair always", c: "lifestyle" },
  { q: "Would you rather Wake up at 5 AM every day or never be able to sleep before 3 AM?", a: "Wake up at 5 AM", b: "Never sleep before 3 AM", c: "lifestyle" },
  { q: "Would you rather Have a walk-in closet or a home theater?", a: "Walk-in closet", b: "Home theater", c: "lifestyle" },
  { q: "Would you rather Never do laundry again or never wash dishes again?", a: "No more laundry", b: "No more dishes", c: "lifestyle" },
  { q: "Would you rather Have perfect skin forever or perfect hair forever?", a: "Perfect skin", b: "Perfect hair", c: "lifestyle" },
  { q: "Would you rather Only shower in cold water or only drink warm water?", a: "Cold showers only", b: "Warm water only", c: "lifestyle" },
  { q: "Would you rather Live without air conditioning or live without heating?", a: "No AC", b: "No heating", c: "lifestyle" },
  { q: "Would you rather Have a photographic memory or be able to forget anything on command?", a: "Photographic memory", b: "Forget on command", c: "lifestyle" },
  { q: "Would you rather Always look your best but feel tired or always feel energized but look messy?", a: "Look great, feel tired", b: "Feel great, look messy", c: "lifestyle" },
  { q: "Would you rather Live in eternal summer or eternal autumn?", a: "Eternal summer", b: "Eternal autumn", c: "lifestyle" },
  { q: "Would you rather Only wear sweats forever or only wear suits forever?", a: "Sweats forever", b: "Suits forever", c: "lifestyle" },
  { q: "Would you rather Have unlimited free Ubers or unlimited free Starbucks?", a: "Free Ubers", b: "Free Starbucks", c: "lifestyle" },
  { q: "Would you rather Always have a full phone battery or always have a full gas tank?", a: "Full battery always", b: "Full gas always", c: "lifestyle" },
  { q: "Would you rather Be a morning person or a night owl forever?", a: "Morning person", b: "Night owl", c: "lifestyle" },
  { q: "Would you rather Never have to clean your room or never have to cook?", a: "Never clean", b: "Never cook", c: "lifestyle" },
  { q: "Would you rather Have the perfect playlist for every mood or the perfect outfit for every occasion?", a: "Perfect playlist always", b: "Perfect outfit always", c: "lifestyle" },
  { q: "Would you rather Wear designer clothes that are ugly or basic fits that always look fire?", a: "Designer but ugly", b: "Basic but fire", c: "lifestyle" },
  { q: "Would you rather Only wear one color forever or wear every color of the rainbow at once?", a: "One color forever", b: "Rainbow everything", c: "lifestyle" },
  { q: "Would you rather Have unlimited sneakers or unlimited jewelry?", a: "Unlimited sneakers", b: "Unlimited jewelry", c: "lifestyle" },
  { q: "Would you rather Always be overdressed or always be underdressed?", a: "Always overdressed", b: "Always underdressed", c: "lifestyle" },
  { q: "Would you rather Have no homework forever or no exams forever?", a: "No homework", b: "No exams", c: "lifestyle" },
  { q: "Would you rather Have the coolest dorm room or the best meal plan?", a: "Coolest dorm room", b: "Best meal plan", c: "lifestyle" },
  { q: "Would you rather Pull an all-nighter every week or wake up at 5 AM every day?", a: "All-nighter weekly", b: "5 AM daily", c: "lifestyle" },
  { q: "Would you rather Be the smartest person in every class or the most popular person on campus?", a: "Smartest in class", b: "Most popular on campus", c: "lifestyle" },
  { q: "Would you rather Live in a treehouse or a houseboat?", a: "Treehouse", b: "Houseboat", c: "lifestyle" },
  { q: "Would you rather Have a personal assistant or a personal stylist?", a: "Personal assistant", b: "Personal stylist", c: "lifestyle" },
  { q: "Would you rather Never have to wait in traffic or never have to wait in line?", a: "No traffic ever", b: "No lines ever", c: "lifestyle" },
  { q: "Would you rather Have a roof garden or an indoor pool?", a: "Roof garden", b: "Indoor pool", c: "lifestyle" },
  { q: "Would you rather Always find a parking spot or always have exact change?", a: "Always find parking", b: "Always exact change", c: "lifestyle" },
  { q: "Would you rather Live next to a beach or next to a mountain?", a: "Beach life", b: "Mountain life", c: "lifestyle" },
  { q: "Would you rather Always smell like cookies or always smell like fresh flowers?", a: "Smell like cookies", b: "Smell like flowers", c: "lifestyle" },
  { q: "Would you rather Have a library in your house or a mini cinema?", a: "Home library", b: "Mini cinema", c: "lifestyle" },
  { q: "Would you rather Never get a paper cut again or never stub your toe again?", a: "No paper cuts", b: "No stubbed toes", c: "lifestyle" },
  { q: "Would you rather Always have the perfect temperature in your room or the perfect lighting?", a: "Perfect temperature", b: "Perfect lighting", c: "lifestyle" },
  { q: "Would you rather Only listen to one album forever or never hear the same song twice?", a: "One album forever", b: "Never repeat a song", c: "lifestyle" },
  { q: "Would you rather Have a dog that lives 30 years or a cat that can talk?", a: "30-year dog", b: "Talking cat", c: "lifestyle" },
  { q: "Would you rather Live in a world without mirrors or without cameras?", a: "No mirrors", b: "No cameras", c: "lifestyle" },
  { q: "Would you rather Always have freshly baked bread at home or fresh flowers?", a: "Fresh bread always", b: "Fresh flowers always", c: "lifestyle" },
  { q: "Would you rather Have the ability to nap anywhere or fall asleep instantly at night?", a: "Nap anywhere", b: "Instant sleep at night", c: "lifestyle" },
  { q: "Would you rather Never lose your keys again or never lose your phone?", a: "Never lose keys", b: "Never lose phone", c: "lifestyle" },
  { q: "Would you rather Have a secret room in your house or a secret garden?", a: "Secret room", b: "Secret garden", c: "lifestyle" },
  { q: "Would you rather Always get 8 hours of sleep or only need 4 hours?", a: "Always 8 hours", b: "Only need 4 hours", c: "lifestyle" },
  { q: "Would you rather Have a penthouse in the city or a ranch in the countryside?", a: "City penthouse", b: "Country ranch", c: "lifestyle" },
  { q: "Would you rather Have an unlimited book budget or unlimited music budget?", a: "Unlimited books", b: "Unlimited music", c: "lifestyle" },
  { q: "Would you rather Be able to do your makeup perfectly in 2 minutes or style your hair in 1 minute?", a: "Perfect makeup in 2 min", b: "Perfect hair in 1 min", c: "lifestyle" },
  { q: "Would you rather Have a home that cleans itself or a car that drives itself?", a: "Self-cleaning home", b: "Self-driving car", c: "lifestyle" },
  { q: "Would you rather Live in a place that's always 20°C or always 28°C?", a: "Always 20°C", b: "Always 28°C", c: "lifestyle" },
  { q: "Would you rather Have unlimited closet space or unlimited fridge space?", a: "Unlimited closet", b: "Unlimited fridge", c: "lifestyle" },

  // ═══════════════════════════════════════
  // FOOD (~80)
  // ═══════════════════════════════════════
  { q: "Would you rather Only drink bubble tea or only drink coffee for a year?", a: "Only bubble tea", b: "Only coffee", c: "food" },
  { q: "Would you rather Give up cheese or give up chocolate?", a: "Give up cheese", b: "Give up chocolate", c: "food" },
  { q: "Would you rather Eat gas station sushi or airport ramen for every meal?", a: "Gas station sushi", b: "Airport ramen", c: "food" },
  { q: "Would you rather Only eat breakfast food or only eat dinner food?", a: "Breakfast food only", b: "Dinner food only", c: "food" },
  { q: "Would you rather Have unlimited avocado toast or unlimited chicken nuggets?", a: "Unlimited avo toast", b: "Unlimited nuggets", c: "food" },
  { q: "Would you rather Never eat candy again or never eat chips again?", a: "No more candy", b: "No more chips", c: "food" },
  { q: "Would you rather Only eat with chopsticks or only eat with your hands?", a: "Only chopsticks", b: "Only hands", c: "food" },
  { q: "Would you rather Give up ice cream or give up cake forever?", a: "Give up ice cream", b: "Give up cake", c: "food" },
  { q: "Would you rather Have unlimited sushi or unlimited tacos for life?", a: "Unlimited sushi", b: "Unlimited tacos", c: "food" },
  { q: "Would you rather Drink a smoothie made of all your meals or eat everything as soup?", a: "Smoothie meals", b: "Soup everything", c: "food" },
  { q: "Would you rather Never eat fast food again or only eat fast food?", a: "Never fast food", b: "Only fast food", c: "food" },
  { q: "Would you rather Have unlimited free DoorDash or unlimited free groceries?", a: "Free DoorDash", b: "Free groceries", c: "food" },
  { q: "Would you rather Give up pasta or give up rice forever?", a: "Give up pasta", b: "Give up rice", c: "food" },
  { q: "Would you rather Only eat sweet food or only eat savory food?", a: "Only sweet", b: "Only savory", c: "food" },
  { q: "Would you rather Every meal be slightly too spicy or slightly too salty?", a: "Slightly too spicy", b: "Slightly too salty", c: "food" },
  { q: "Would you rather Eat your favorite meal every day or never eat it again?", a: "Fave meal daily", b: "Never eat it again", c: "food" },
  { q: "Would you rather Only drink water or only drink juice for the rest of your life?", a: "Only water", b: "Only juice", c: "food" },
  { q: "Would you rather Always cook for yourself or always eat at restaurants?", a: "Always cook", b: "Always restaurants", c: "food" },
  { q: "Would you rather Have pizza that's always perfect or burgers that are always perfect?", a: "Perfect pizza always", b: "Perfect burgers always", c: "food" },
  { q: "Would you rather Give up bread or give up potatoes?", a: "Give up bread", b: "Give up potatoes", c: "food" },
  { q: "Would you rather Eat cereal without milk or eat soup without a spoon?", a: "Cereal without milk", b: "Soup without spoon", c: "food" },
  { q: "Would you rather Only eat food that's red or only eat food that's green?", a: "Only red food", b: "Only green food", c: "food" },
  { q: "Would you rather Never eat fruit again or never eat vegetables again?", a: "No more fruit", b: "No more vegetables", c: "food" },
  { q: "Would you rather Have a personal sushi chef or a personal pastry chef?", a: "Sushi chef", b: "Pastry chef", c: "food" },
  { q: "Would you rather Give up ketchup or give up mayonnaise forever?", a: "Give up ketchup", b: "Give up mayo", c: "food" },
  { q: "Would you rather Only eat cold food or only eat hot food?", a: "Only cold food", b: "Only hot food", c: "food" },
  { q: "Would you rather Have every meal taste amazing but look terrible or look amazing but taste terrible?", a: "Tastes great, looks bad", b: "Looks great, tastes bad", c: "food" },
  { q: "Would you rather Give up breakfast or give up dinner?", a: "Give up breakfast", b: "Give up dinner", c: "food" },
  { q: "Would you rather Only eat food from one country or eat from every country but only once?", a: "One country forever", b: "Every country once", c: "food" },
  { q: "Would you rather Have unlimited steak or unlimited lobster?", a: "Unlimited steak", b: "Unlimited lobster", c: "food" },
  { q: "Would you rather Eat only microwave meals or only raw food?", a: "Only microwave meals", b: "Only raw food", c: "food" },
  { q: "Would you rather Give up coffee or give up alcohol forever?", a: "Give up coffee", b: "Give up alcohol", c: "food" },
  { q: "Would you rather Have unlimited ramen or unlimited sandwiches?", a: "Unlimited ramen", b: "Unlimited sandwiches", c: "food" },
  { q: "Would you rather Only eat organic or only eat whatever's cheapest?", a: "Only organic", b: "Only cheapest", c: "food" },
  { q: "Would you rather Give up pizza or give up burgers forever?", a: "Give up pizza", b: "Give up burgers", c: "food" },
  { q: "Would you rather Only eat standing up or only eat lying down?", a: "Only standing up", b: "Only lying down", c: "food" },
  { q: "Would you rather Have a bottomless mimosa brunch or an unlimited dim sum lunch?", a: "Bottomless brunch", b: "Unlimited dim sum", c: "food" },
  { q: "Would you rather Give up peanut butter or give up Nutella?", a: "Give up PB", b: "Give up Nutella", c: "food" },
  { q: "Would you rather Eat the same lunch every day or never eat lunch?", a: "Same lunch daily", b: "No lunch ever", c: "food" },
  { q: "Would you rather Always overcook your food or always undercook it?", a: "Always overcook", b: "Always undercook", c: "food" },

  // ═══════════════════════════════════════
  // FUN / FUNNY (~80)
  // ═══════════════════════════════════════
  { q: "Would you rather Have spaghetti for hair or sweat maple syrup?", a: "Spaghetti hair", b: "Sweat maple syrup", c: "fun" },
  { q: "Would you rather Sound like a duck when you laugh or clap like a seal?", a: "Duck laugh", b: "Seal clap", c: "fun" },
  { q: "Would you rather Have a permanent unibrow or a permanent mullet?", a: "Permanent unibrow", b: "Permanent mullet", c: "fun" },
  { q: "Would you rather Accidentally like your ex's old photo or send a text to the wrong group chat?", a: "Like ex's old photo", b: "Wrong group chat text", c: "fun" },
  { q: "Would you rather Sneeze glitter or cough confetti?", a: "Sneeze glitter", b: "Cough confetti", c: "fun" },
  { q: "Would you rather Talk like Yoda for a year or walk like a crab for a year?", a: "Talk like Yoda", b: "Walk like a crab", c: "fun" },
  { q: "Would you rather Have your search history made public or your camera roll?", a: "Search history public", b: "Camera roll public", c: "fun" },
  { q: "Would you rather Trip in front of your crush or spill food on your boss?", a: "Trip in front of crush", b: "Spill food on boss", c: "fun" },
  { q: "Would you rather Only communicate through memes or only through GIFs?", a: "Only memes", b: "Only GIFs", c: "fun" },
  { q: "Would you rather Have a permanent squeaky voice or a permanent deep voice?", a: "Squeaky voice forever", b: "Deep voice forever", c: "fun" },
  { q: "Would you rather Always walk in slow motion or always talk in fast forward?", a: "Walk in slow motion", b: "Talk in fast forward", c: "fun" },
  { q: "Would you rather Hiccup every time you lie or sneeze every time someone talks about you?", a: "Hiccup when lying", b: "Sneeze when talked about", c: "fun" },
  { q: "Would you rather Have your voice replaced by Morgan Freeman or SpongeBob?", a: "Morgan Freeman voice", b: "SpongeBob voice", c: "fun" },
  { q: "Would you rather Narrate your own life out loud or hear everyone else's thoughts?", a: "Narrate my life aloud", b: "Hear everyone's thoughts", c: "fun" },
  { q: "Would you rather Have T-Rex arms for a day or jellyfish legs for a day?", a: "T-Rex arms", b: "Jellyfish legs", c: "fun" },
  { q: "Would you rather Accidentally call your teacher 'Mom' daily or fall up the stairs every time?", a: "Call teacher Mom", b: "Fall up the stairs", c: "fun" },
  { q: "Would you rather Have autocorrect control your texts forever or have Siri answer all your calls?", a: "Autocorrect forever", b: "Siri answers calls", c: "fun" },
  { q: "Would you rather Wear a clown wig to every job interview or honk a horn every time you sit down?", a: "Clown wig at interviews", b: "Honk when sitting", c: "fun" },
  { q: "Would you rather Wear your outfit backwards all day or inside out all day?", a: "Backwards all day", b: "Inside out all day", c: "fun" },
  { q: "Would you rather Burp the national anthem or fart confetti?", a: "Burp the anthem", b: "Fart confetti", c: "fun" },
  { q: "Would you rather Have to sing everything you say or dance everywhere you go?", a: "Sing everything", b: "Dance everywhere", c: "fun" },
  { q: "Would you rather Have a laugh that sounds like a dolphin or a sneeze that sounds like a car horn?", a: "Dolphin laugh", b: "Car horn sneeze", c: "fun" },
  { q: "Would you rather Wake up as a different animal every morning or speak a different language every day?", a: "Different animal daily", b: "Different language daily", c: "fun" },
  { q: "Would you rather Have your life narrated by Snoop Dogg or by Gordon Ramsay?", a: "Snoop Dogg narrator", b: "Gordon Ramsay narrator", c: "fun" },
  { q: "Would you rather Accidentally send a love text to your boss or your parents?", a: "Send to boss", b: "Send to parents", c: "fun" },
  { q: "Would you rather Have to wear a cape everywhere or a top hat everywhere?", a: "Cape everywhere", b: "Top hat everywhere", c: "fun" },
  { q: "Would you rather Have hands for feet or feet for hands?", a: "Hands for feet", b: "Feet for hands", c: "fun" },
  { q: "Would you rather Speak in rhymes for a day or in questions for a day?", a: "Rhymes all day", b: "Questions all day", c: "fun" },
  { q: "Would you rather Have a theme song play every time you enter a room or have dramatic lighting follow you?", a: "Theme song always", b: "Dramatic lighting always", c: "fun" },
  { q: "Would you rather Only be able to whisper or only be able to shout?", a: "Only whisper", b: "Only shout", c: "fun" },
  { q: "Would you rather Have to skip everywhere or hop on one foot everywhere?", a: "Skip everywhere", b: "Hop everywhere", c: "fun" },
  { q: "Would you rather Laugh at the wrong moments or cry at the wrong moments?", a: "Laugh at wrong times", b: "Cry at wrong times", c: "fun" },
  { q: "Would you rather Have a tail that wags when you're happy or ears that droop when you're sad?", a: "Wagging tail", b: "Droopy ears", c: "fun" },
  { q: "Would you rather Get rick-rolled every time you open YouTube or get jumpscared every time you open the fridge?", a: "Rick-rolled on YouTube", b: "Jumpscared at fridge", c: "fun" },
  { q: "Would you rather Only be able to text in ALL CAPS or only in lowercase with no punctuation?", a: "ALL CAPS always", b: "no caps no punctuation", c: "fun" },
  { q: "Would you rather Have a personal hype man or a personal narrator?", a: "Personal hype man", b: "Personal narrator", c: "fun" },
  { q: "Would you rather Sneeze every time you tell the truth or hiccup every time you tell a joke?", a: "Sneeze at truth", b: "Hiccup at jokes", c: "fun" },
  { q: "Would you rather Always have something stuck in your teeth or always have your fly down?", a: "Something in teeth", b: "Fly always down", c: "fun" },
  { q: "Would you rather Accidentally reply-all to a company email or pocket-call your crush for 10 minutes?", a: "Reply-all disaster", b: "10-min pocket call crush", c: "fun" },
  { q: "Would you rather Have a parrot that repeats everything you say or a dog that judges you silently?", a: "Repeating parrot", b: "Judging dog", c: "fun" },

  // ═══════════════════════════════════════
  // TRAVEL (~70)
  // ═══════════════════════════════════════
  { q: "Would you rather Backpack through Europe or road trip across the US?", a: "Backpack Europe", b: "Road trip US", c: "travel" },
  { q: "Would you rather Visit Tokyo or visit New York for the first time?", a: "Tokyo", b: "New York", c: "travel" },
  { q: "Would you rather Travel with no luggage or travel with no phone?", a: "No luggage", b: "No phone", c: "travel" },
  { q: "Would you rather Take a free cruise or a free safari?", a: "Free cruise", b: "Free safari", c: "travel" },
  { q: "Would you rather Visit every country but never stay more than a day or live in your dream country forever?", a: "Every country, 1 day each", b: "Dream country forever", c: "travel" },
  { q: "Would you rather Only travel by train or only travel by boat?", a: "Only trains", b: "Only boats", c: "travel" },
  { q: "Would you rather Bali for a week or Paris for a week?", a: "Bali", b: "Paris", c: "travel" },
  { q: "Would you rather Go to a full-moon party in Thailand or Carnival in Brazil?", a: "Full Moon party", b: "Carnival in Brazil", c: "travel" },
  { q: "Would you rather Have a window seat forever or an aisle seat forever?", a: "Window seat forever", b: "Aisle seat forever", c: "travel" },
  { q: "Would you rather Travel solo for a year or with your best friend but they pick everything?", a: "Solo for a year", b: "BFF picks everything", c: "travel" },
  { q: "Would you rather Explore ancient ruins or explore a futuristic city?", a: "Ancient ruins", b: "Futuristic city", c: "travel" },
  { q: "Would you rather Ski in the Alps or surf in Hawaii?", a: "Ski in the Alps", b: "Surf in Hawaii", c: "travel" },
  { q: "Would you rather Have unlimited hotel upgrades or unlimited airport lounge access?", a: "Hotel upgrades", b: "Lounge access", c: "travel" },
  { q: "Would you rather Live abroad for 5 years or take 50 short trips?", a: "Live abroad 5 years", b: "50 short trips", c: "travel" },
  { q: "Would you rather Visit the Northern Lights or visit the Great Barrier Reef?", a: "Northern Lights", b: "Great Barrier Reef", c: "travel" },
  { q: "Would you rather Camp in the wilderness for a month or stay in a luxury resort for a week?", a: "Wilderness for a month", b: "Luxury resort for a week", c: "travel" },
  { q: "Would you rather Always fly first class but only domestically or economy but anywhere in the world?", a: "First class, domestic", b: "Economy, worldwide", c: "travel" },
  { q: "Would you rather Visit Mars for one day or explore the deepest ocean for a week?", a: "Mars for a day", b: "Deep ocean for a week", c: "travel" },
  { q: "Would you rather Live in a castle in Scotland or a villa in Santorini?", a: "Scottish castle", b: "Santorini villa", c: "travel" },
  { q: "Would you rather Take the Trans-Siberian Railway or sail across the Atlantic?", a: "Trans-Siberian Railway", b: "Sail the Atlantic", c: "travel" },
  { q: "Would you rather Visit every wonder of the world or every Disney park in the world?", a: "Wonders of the world", b: "Every Disney park", c: "travel" },
  { q: "Would you rather Spend a year in Southeast Asia or a year in South America?", a: "Southeast Asia", b: "South America", c: "travel" },
  { q: "Would you rather Travel to the past or the future?", a: "Travel to the past", b: "Travel to the future", c: "travel" },
  { q: "Would you rather Have a private jet but only for one trip a year or unlimited budget flights?", a: "Private jet once a year", b: "Unlimited budget flights", c: "travel" },
  { q: "Would you rather Stay at an ice hotel or a treehouse hotel?", a: "Ice hotel", b: "Treehouse hotel", c: "travel" },
  { q: "Would you rather Explore the Amazon rainforest or the Sahara desert?", a: "Amazon rainforest", b: "Sahara desert", c: "travel" },
  { q: "Would you rather Visit Iceland or visit New Zealand?", a: "Iceland", b: "New Zealand", c: "travel" },
  { q: "Would you rather Hike the Inca Trail or walk the Camino de Santiago?", a: "Inca Trail", b: "Camino de Santiago", c: "travel" },
  { q: "Would you rather Go on a food tour in Italy or a temple tour in Japan?", a: "Food tour Italy", b: "Temple tour Japan", c: "travel" },
  { q: "Would you rather Live in a van for a year or a sailboat for a year?", a: "Van life for a year", b: "Sailboat for a year", c: "travel" },

  // ═══════════════════════════════════════
  // RELATIONSHIPS / LOVE (~70)
  // ═══════════════════════════════════════
  { q: "Would you rather Get a love letter or a surprise date?", a: "Love letter", b: "Surprise date", c: "relationships" },
  { q: "Would you rather Have your partner plan all dates or always plan them yourself?", a: "Partner plans all", b: "I plan all", c: "relationships" },
  { q: "Would you rather Date someone who texts too much or barely texts at all?", a: "Texts too much", b: "Barely texts", c: "relationships" },
  { q: "Would you rather Know your soulmate's name but not when you'll meet or meet them tomorrow but never be sure?", a: "Know their name", b: "Meet tomorrow, unsure", c: "relationships" },
  { q: "Would you rather Date someone who's always early or always late?", a: "Always early", b: "Always late", c: "relationships" },
  { q: "Would you rather Fall in love at first sight or grow into love slowly?", a: "Love at first sight", b: "Grow into love", c: "relationships" },
  { q: "Would you rather Date a gamer or date an athlete?", a: "Date a gamer", b: "Date an athlete", c: "relationships" },
  { q: "Would you rather Have a partner who cooks amazingly or one who cleans everything?", a: "Amazing cook", b: "Cleans everything", c: "relationships" },
  { q: "Would you rather Confess your feelings and get rejected or never confess?", a: "Confess, get rejected", b: "Never confess", c: "relationships" },
  { q: "Would you rather Date someone your friends hate or date someone your family hates?", a: "Friends hate them", b: "Family hates them", c: "relationships" },
  { q: "Would you rather Always say I love you first or always hear it first?", a: "Say it first", b: "Hear it first", c: "relationships" },
  { q: "Would you rather Share all your passwords with your partner or keep everything private?", a: "Share all passwords", b: "Keep everything private", c: "relationships" },
  { q: "Would you rather Have a long love story or an intense short romance?", a: "Long love story", b: "Intense short romance", c: "relationships" },
  { q: "Would you rather Date someone famous or date someone nobody knows?", a: "Date someone famous", b: "Date someone unknown", c: "relationships" },
  { q: "Would you rather Get proposed to in public or in private?", a: "Public proposal", b: "Private proposal", c: "relationships" },
  { q: "Would you rather Be in a power couple or a low-key relationship?", a: "Power couple", b: "Low-key relationship", c: "relationships" },
  { q: "Would you rather Have a partner who's brutally honest or one who tells white lies to spare your feelings?", a: "Brutally honest", b: "White lies", c: "relationships" },
  { q: "Would you rather Date someone who's exactly like you or your complete opposite?", a: "Exactly like me", b: "Complete opposite", c: "relationships" },
  { q: "Would you rather Have a partner who remembers every detail or one who always surprises you?", a: "Remembers every detail", b: "Always surprises me", c: "relationships" },
  { q: "Would you rather Be with someone who challenges you or someone who calms you?", a: "Challenges me", b: "Calms me", c: "relationships" },
  { q: "Would you rather Have matching tattoos or matching piercings with your partner?", a: "Matching tattoos", b: "Matching piercings", c: "relationships" },
  { q: "Would you rather Spend Valentine's Day at home or on a trip?", a: "Cozy night at home", b: "Trip together", c: "relationships" },
  { q: "Would you rather Date a night owl or a morning person?", a: "Night owl", b: "Morning person", c: "relationships" },
  { q: "Would you rather Have a joint social media account or separate ones?", a: "Joint account", b: "Separate accounts", c: "relationships" },
  { q: "Would you rather Have one incredible best friend or ten good friends?", a: "One incredible friend", b: "Ten good friends", c: "relationships" },
  { q: "Would you rather Forgive but never forget or forget but never truly forgive?", a: "Forgive, never forget", b: "Forget, never truly forgive", c: "relationships" },
  { q: "Would you rather Have a friend who's always late but super fun or always on time but boring?", a: "Late but super fun", b: "On time but boring", c: "relationships" },
  { q: "Would you rather Resolve an argument by talking it out or taking space first?", a: "Talk it out immediately", b: "Take space first", c: "relationships" },
  { q: "Would you rather Date someone who's great with money or great with emotions?", a: "Great with money", b: "Great with emotions", c: "relationships" },
  { q: "Would you rather Be in a long-distance relationship or live together too soon?", a: "Long distance", b: "Live together too soon", c: "relationships" },

  // ═══════════════════════════════════════
  // MONEY (~70)
  // ═══════════════════════════════════════
  { q: "Would you rather Be a millionaire with no free time or broke with unlimited free time?", a: "Millionaire, no free time", b: "Broke, unlimited free time", c: "money" },
  { q: "Would you rather Get $10K right now or $100K in 5 years?", a: "$10K now", b: "$100K in 5 years", c: "money" },
  { q: "Would you rather Be a famous influencer or a secret billionaire?", a: "Famous influencer", b: "Secret billionaire", c: "money" },
  { q: "Would you rather Win the lottery or build your own empire?", a: "Win the lottery", b: "Build my own empire", c: "money" },
  { q: "Would you rather Have your dream job paying $40K or a boring job paying $200K?", a: "Dream job, $40K", b: "Boring job, $200K", c: "money" },
  { q: "Would you rather Never pay rent again or never pay for food again?", a: "Never pay rent", b: "Never pay for food", c: "money" },
  { q: "Would you rather Be a CEO or a top-earning content creator?", a: "CEO", b: "Content creator", c: "money" },
  { q: "Would you rather Retire at 30 with $2M or work till 65 with $20M?", a: "Retire at 30, $2M", b: "Work till 65, $20M", c: "money" },
  { q: "Would you rather Invest in crypto or invest in real estate?", a: "Invest in crypto", b: "Invest in real estate", c: "money" },
  { q: "Would you rather Have a $500 shopping spree every week or one $25K shopping spree a year?", a: "$500 every week", b: "$25K once a year", c: "money" },
  { q: "Would you rather Drop out and start a startup or finish college and get a stable job?", a: "Drop out, startup", b: "Finish college, stable job", c: "money" },
  { q: "Would you rather Have unlimited money for travel or unlimited money for fashion?", a: "Unlimited travel money", b: "Unlimited fashion money", c: "money" },
  { q: "Would you rather Get paid to sleep or get paid to eat?", a: "Paid to sleep", b: "Paid to eat", c: "money" },
  { q: "Would you rather Have free healthcare forever or free education forever?", a: "Free healthcare", b: "Free education", c: "money" },
  { q: "Would you rather Own a penthouse in the city or a beach house?", a: "City penthouse", b: "Beach house", c: "money" },
  { q: "Would you rather Make $1 every time someone thinks of you or $100 every time you make someone laugh?", a: "$1 per thought", b: "$100 per laugh", c: "money" },
  { q: "Would you rather Go to college for free or skip college and get $500K?", a: "Free college", b: "Skip college, $500K", c: "money" },
  { q: "Would you rather Earn double your salary but work weekends or earn current salary with 4-day weeks?", a: "Double salary, work weekends", b: "Same salary, 4-day weeks", c: "money" },
  { q: "Would you rather Have $1M in your 20s or $10M in your 60s?", a: "$1M in my 20s", b: "$10M in my 60s", c: "money" },
  { q: "Would you rather Own a restaurant or own a nightclub?", a: "Own a restaurant", b: "Own a nightclub", c: "money" },
  { q: "Would you rather Have a trust fund or be self-made?", a: "Trust fund", b: "Self-made", c: "money" },
  { q: "Would you rather Get a 50% raise or 50 extra vacation days per year?", a: "50% raise", b: "50 extra days off", c: "money" },
  { q: "Would you rather Have free food for life or free rent for life?", a: "Free food for life", b: "Free rent for life", c: "money" },
  { q: "Would you rather Work from home forever or have a luxury office?", a: "WFH forever", b: "Luxury office", c: "money" },
  { q: "Would you rather Start a business with your best friend or with a stranger who's an expert?", a: "With best friend", b: "With expert stranger", c: "money" },
  { q: "Would you rather Never pay taxes or never pay for gas/electricity?", a: "Never pay taxes", b: "Never pay for gas/electric", c: "money" },
  { q: "Would you rather Own one expensive thing or many cheap things?", a: "One expensive thing", b: "Many cheap things", c: "money" },
  { q: "Would you rather Have a high salary in a high-cost city or a modest salary in a cheap town?", a: "High salary, expensive city", b: "Modest salary, cheap town", c: "money" },
  { q: "Would you rather Win $50K but have to spend it in one day or $5K with no restrictions?", a: "$50K in one day", b: "$5K no restrictions", c: "money" },
  { q: "Would you rather Have free flights forever or free hotels forever?", a: "Free flights forever", b: "Free hotels forever", c: "money" },

  // ═══════════════════════════════════════
  // HYPOTHETICAL (~75)
  // ═══════════════════════════════════════
  { q: "Would you rather Be able to fly or be able to breathe underwater?", a: "Fly", b: "Breathe underwater", c: "hypothetical" },
  { q: "Would you rather Have a rewind button for your life or a pause button?", a: "Rewind button", b: "Pause button", c: "hypothetical" },
  { q: "Would you rather Be able to talk to animals or speak every human language?", a: "Talk to animals", b: "Speak every language", c: "hypothetical" },
  { q: "Would you rather Know how you die or know when you die?", a: "Know how", b: "Know when", c: "hypothetical" },
  { q: "Would you rather Have super strength or super speed?", a: "Super strength", b: "Super speed", c: "hypothetical" },
  { q: "Would you rather Be able to stop time or travel through time?", a: "Stop time", b: "Travel through time", c: "hypothetical" },
  { q: "Would you rather Wake up in a zombie apocalypse or an alien invasion?", a: "Zombie apocalypse", b: "Alien invasion", c: "hypothetical" },
  { q: "Would you rather Be the last person on Earth or never be alone again?", a: "Last person on Earth", b: "Never alone again", c: "hypothetical" },
  { q: "Would you rather Have a dragon or a unicorn as a pet?", a: "Pet dragon", b: "Pet unicorn", c: "hypothetical" },
  { q: "Would you rather Live in a simulation that's perfect or the real world that's flawed?", a: "Perfect simulation", b: "Flawed real world", c: "hypothetical" },
  { q: "Would you rather Be able to shrink to ant size or grow to giant size?", a: "Shrink to ant size", b: "Grow to giant size", c: "hypothetical" },
  { q: "Would you rather Have X-ray vision or night vision?", a: "X-ray vision", b: "Night vision", c: "hypothetical" },
  { q: "Would you rather Control fire or control water?", a: "Control fire", b: "Control water", c: "hypothetical" },
  { q: "Would you rather Reset your life to age 10 with all your memories or get $10M right now?", a: "Reset to age 10", b: "$10M right now", c: "hypothetical" },
  { q: "Would you rather Be immortal but alone or mortal with the perfect life?", a: "Immortal but alone", b: "Mortal, perfect life", c: "hypothetical" },
  { q: "Would you rather Swap bodies with your best friend for a week or your worst enemy?", a: "Swap with best friend", b: "Swap with worst enemy", c: "hypothetical" },
  { q: "Would you rather Have every red light turn green or never wait in a line again?", a: "All green lights", b: "Never wait in line", c: "hypothetical" },
  { q: "Would you rather Have the ability to clone yourself or the ability to shapeshift?", a: "Clone yourself", b: "Shapeshift", c: "hypothetical" },
  { q: "Would you rather Never get sick again or never feel physical pain?", a: "Never get sick", b: "Never feel pain", c: "hypothetical" },
  { q: "Would you rather Read minds but can't turn it off or be invisible but can't turn it off?", a: "Read minds always", b: "Invisible always", c: "hypothetical" },
  { q: "Would you rather Teleport anywhere or read anyone's mind?", a: "Teleport anywhere", b: "Read anyone's mind", c: "hypothetical" },
  { q: "Would you rather Have unlimited wishes but each takes a year off your life or no wishes but live to 120?", a: "Unlimited wishes", b: "Live to 120", c: "hypothetical" },
  { q: "Would you rather Be a vampire or a werewolf?", a: "Vampire", b: "Werewolf", c: "hypothetical" },
  { q: "Would you rather See 10 years into the future or change 10 years of the past?", a: "See future 10 years", b: "Change past 10 years", c: "hypothetical" },
  { q: "Would you rather Have a portal to any place or a portal to any time?", a: "Portal to any place", b: "Portal to any time", c: "hypothetical" },
  { q: "Would you rather Have the power to heal any wound or the power to undo any lie?", a: "Heal any wound", b: "Undo any lie", c: "hypothetical" },
  { q: "Would you rather Live in a world where gravity is half as strong or twice as strong?", a: "Half gravity", b: "Double gravity", c: "hypothetical" },
  { q: "Would you rather Be born in the past (1900s) or the future (2200s)?", a: "Born in the 1900s", b: "Born in the 2200s", c: "hypothetical" },
  { q: "Would you rather Control the weather or control time?", a: "Control the weather", b: "Control time", c: "hypothetical" },
  { q: "Would you rather Have a map to any hidden treasure or a key that opens any door?", a: "Map to treasure", b: "Key to any door", c: "hypothetical" },
  { q: "Would you rather Talk to your future self once or your past self once?", a: "Talk to future self", b: "Talk to past self", c: "hypothetical" },
  { q: "Would you rather Have the ability to breathe in space or survive in lava?", a: "Breathe in space", b: "Survive in lava", c: "hypothetical" },
  { q: "Would you rather Everyone can read your mind or you can read everyone's?", a: "Everyone reads mine", b: "I read everyone's", c: "hypothetical" },
  { q: "Would you rather Be able to erase one memory or relive one memory whenever you want?", a: "Erase one memory", b: "Relive one memory", c: "hypothetical" },
  { q: "Would you rather Have the power to make anyone tell the truth or make anyone forget something?", a: "Force truth", b: "Force forgetting", c: "hypothetical" },

  // ═══════════════════════════════════════
  // DEEP (~70)
  // ═══════════════════════════════════════
  { q: "Would you rather Know the truth about everything or be blissfully ignorant?", a: "Know all truth", b: "Blissfully ignorant", c: "deep" },
  { q: "Would you rather Change one thing about your past or know one thing about your future?", a: "Change one past thing", b: "Know one future thing", c: "deep" },
  { q: "Would you rather Be feared or be loved?", a: "Be feared", b: "Be loved", c: "deep" },
  { q: "Would you rather Lose all your old memories or never make new ones?", a: "Lose old memories", b: "Never make new ones", c: "deep" },
  { q: "Would you rather Know when everyone around you will die or know what they truly think of you?", a: "Know when they die", b: "Know what they think", c: "deep" },
  { q: "Would you rather Live a short exciting life or a long boring one?", a: "Short and exciting", b: "Long and boring", c: "deep" },
  { q: "Would you rather Have everyone forget you existed or forget everyone you ever knew?", a: "Everyone forgets me", b: "I forget everyone", c: "deep" },
  { q: "Would you rather Be famous after you die or rich while you live?", a: "Famous after death", b: "Rich while alive", c: "deep" },
  { q: "Would you rather Know the meaning of life or have the power to give life meaning for others?", a: "Know life's meaning", b: "Give meaning to others", c: "deep" },
  { q: "Would you rather Relive your happiest day on loop or never feel sadness again?", a: "Happiest day on loop", b: "Never feel sadness", c: "deep" },
  { q: "Would you rather Have complete freedom but no security or total security but no freedom?", a: "Freedom, no security", b: "Security, no freedom", c: "deep" },
  { q: "Would you rather Save 100 strangers or 1 person you love?", a: "100 strangers", b: "1 person I love", c: "deep" },
  { q: "Would you rather Always know the truth even when it hurts or live believing comforting lies?", a: "Truth, even when it hurts", b: "Comforting lies", c: "deep" },
  { q: "Would you rather Have the power to heal others but not yourself or heal yourself but not others?", a: "Heal others only", b: "Heal myself only", c: "deep" },
  { q: "Would you rather Be remembered for something you didn't do or forgotten for something great you did?", a: "Remembered, didn't do it", b: "Forgotten, did something great", c: "deep" },
  { q: "Would you rather Experience everything once or master one thing perfectly?", a: "Experience everything once", b: "Master one thing", c: "deep" },
  { q: "Would you rather Know your purpose in life right now or discover it naturally?", a: "Know it now", b: "Discover it naturally", c: "deep" },
  { q: "Would you rather Be average at everything or amazing at one thing and terrible at the rest?", a: "Average at everything", b: "Amazing at one thing", c: "deep" },
  { q: "Would you rather Have a perfect body with no effort or a genius-level brain with no effort?", a: "Perfect body", b: "Genius brain", c: "deep" },
  { q: "Would you rather Be truly happy but unknown or admired by millions but lonely inside?", a: "Truly happy, unknown", b: "Admired but lonely", c: "deep" },
  { q: "Would you rather Have all the time in the world or all the money in the world?", a: "All the time", b: "All the money", c: "deep" },
  { q: "Would you rather Know every language but never travel or travel everywhere but only speak one?", a: "All languages, no travel", b: "All travel, one language", c: "deep" },
  { q: "Would you rather Live without love or live without friendship?", a: "Without love", b: "Without friendship", c: "deep" },
  { q: "Would you rather Choose how you die or when you die?", a: "Choose how", b: "Choose when", c: "deep" },
  { q: "Would you rather Be the most intelligent person alive or the most kind?", a: "Most intelligent", b: "Most kind", c: "deep" },
  { q: "Would you rather Live in a world without art or a world without science?", a: "Without art", b: "Without science", c: "deep" },
  { q: "Would you rather Feel every emotion at double intensity or feel nothing at all?", a: "Double intensity", b: "Feel nothing", c: "deep" },
  { q: "Would you rather Be judged on your actions or your intentions?", a: "Judged on actions", b: "Judged on intentions", c: "deep" },
  { q: "Would you rather Lose your sight or your hearing?", a: "Lose sight", b: "Lose hearing", c: "deep" },
  { q: "Would you rather Live one perfect year or 50 mediocre ones?", a: "One perfect year", b: "50 mediocre years", c: "deep" },

  // ═══════════════════════════════════════
  // SPORT (~60)
  // ═══════════════════════════════════════
  { q: "Would you rather Be a pro skateboarder or a pro surfer?", a: "Pro skateboarder", b: "Pro surfer", c: "sport" },
  { q: "Would you rather Win the World Cup or win an Olympic gold medal?", a: "Win the World Cup", b: "Olympic gold medal", c: "sport" },
  { q: "Would you rather Play pickup basketball with LeBron or play FIFA with Mbappe?", a: "Basketball with LeBron", b: "FIFA with Mbappe", c: "sport" },
  { q: "Would you rather Be a pro esports player or a pro athlete?", a: "Pro esports player", b: "Pro athlete", c: "sport" },
  { q: "Would you rather Only do cardio or only lift weights forever?", a: "Only cardio", b: "Only weights", c: "sport" },
  { q: "Would you rather Be the best at one sport or decent at every sport?", a: "Best at one sport", b: "Decent at all sports", c: "sport" },
  { q: "Would you rather Have courtside NBA seats for life or front row at every Super Bowl?", a: "Courtside NBA for life", b: "Front row Super Bowl", c: "sport" },
  { q: "Would you rather Never miss a free throw or never miss a penalty kick?", a: "Never miss free throws", b: "Never miss penalties", c: "sport" },
  { q: "Would you rather Be an F1 driver or an NBA point guard?", a: "F1 driver", b: "NBA point guard", c: "sport" },
  { q: "Would you rather Play tennis with Djokovic or golf with Tiger Woods?", a: "Tennis with Djokovic", b: "Golf with Tiger Woods", c: "sport" },
  { q: "Would you rather Do CrossFit every day or yoga every day for a year?", a: "CrossFit every day", b: "Yoga every day", c: "sport" },
  { q: "Would you rather Swim across the English Channel or climb Mount Everest?", a: "Swim English Channel", b: "Climb Everest", c: "sport" },
  { q: "Would you rather Be the GOAT in a boring sport or average in the most exciting sport?", a: "GOAT in boring sport", b: "Average in exciting sport", c: "sport" },
  { q: "Would you rather Only watch live sports or only watch replays?", a: "Only live sports", b: "Only replays", c: "sport" },
  { q: "Would you rather Have a six-pack but never eat dessert or eat whatever but no abs?", a: "Six-pack, no dessert", b: "Eat whatever, no abs", c: "sport" },
  { q: "Would you rather Run 5 miles every day or meditate an hour every day?", a: "Run 5 miles daily", b: "Meditate 1 hour daily", c: "sport" },
  { q: "Would you rather Have unlimited energy but only eat salads or normal energy and eat anything?", a: "Unlimited energy, salads", b: "Normal energy, eat anything", c: "sport" },
  { q: "Would you rather Score the winning goal in a final or make the game-saving tackle?", a: "Winning goal", b: "Game-saving tackle", c: "sport" },
  { q: "Would you rather Be a boxing champion or a Formula 1 champion?", a: "Boxing champion", b: "F1 champion", c: "sport" },
  { q: "Would you rather Run a marathon or do a triathlon?", a: "Run a marathon", b: "Do a triathlon", c: "sport" },
  { q: "Would you rather Play for your national team or play for the richest club in the world?", a: "National team", b: "Richest club", c: "sport" },
  { q: "Would you rather Be great at team sports or individual sports?", a: "Team sports", b: "Individual sports", c: "sport" },
  { q: "Would you rather Train with The Rock or train with David Goggins?", a: "Train with The Rock", b: "Train with Goggins", c: "sport" },
  { q: "Would you rather Have unlimited gym access or unlimited sports classes?", a: "Unlimited gym", b: "Unlimited classes", c: "sport" },
  { q: "Would you rather Be a pro gamer or a pro MMA fighter?", a: "Pro gamer", b: "Pro MMA fighter", c: "sport" },

  // ═══════════════════════════════════════
  // TECH (~70)
  // ═══════════════════════════════════════
  { q: "Would you rather Have 1M followers or $1M in the bank?", a: "1M followers", b: "$1M in the bank", c: "tech" },
  { q: "Would you rather Lose all your followers or lose all your saved posts?", a: "Lose followers", b: "Lose saved posts", c: "tech" },
  { q: "Would you rather Have your DMs leaked or your screen time made public?", a: "DMs leaked", b: "Screen time public", c: "tech" },
  { q: "Would you rather Only use Android or only use Apple for life?", a: "Android for life", b: "Apple for life", c: "tech" },
  { q: "Would you rather Give up Spotify or give up YouTube?", a: "Give up Spotify", b: "Give up YouTube", c: "tech" },
  { q: "Would you rather Have free WiFi everywhere or free charging everywhere?", a: "Free WiFi everywhere", b: "Free charging everywhere", c: "tech" },
  { q: "Would you rather Never use social media again or never use streaming services again?", a: "No social media", b: "No streaming", c: "tech" },
  { q: "Would you rather Have an AI best friend or a robot butler?", a: "AI best friend", b: "Robot butler", c: "tech" },
  { q: "Would you rather Always have the newest tech but no social media or old tech with unlimited social media?", a: "Newest tech, no socials", b: "Old tech, all socials", c: "tech" },
  { q: "Would you rather Be permanently banned from Google or permanently banned from Amazon?", a: "Banned from Google", b: "Banned from Amazon", c: "tech" },
  { q: "Would you rather Have your phone always at 5% or your WiFi always buffering?", a: "Phone always at 5%", b: "WiFi always buffering", c: "tech" },
  { q: "Would you rather Give up texting or give up video calls forever?", a: "Give up texting", b: "Give up video calls", c: "tech" },
  { q: "Would you rather Go viral for something embarrassing or never go viral at all?", a: "Viral but embarrassing", b: "Never go viral", c: "tech" },
  { q: "Would you rather Live in a smart home that talks to you or a regular home with no tech issues ever?", a: "Smart home that talks", b: "No tech issues ever", c: "tech" },
  { q: "Would you rather Only use dark mode or only use light mode forever?", a: "Dark mode forever", b: "Light mode forever", c: "tech" },
  { q: "Would you rather Delete your entire Instagram or delete your entire TikTok?", a: "Delete Instagram", b: "Delete TikTok", c: "tech" },
  { q: "Would you rather Have a self-driving car or a personal drone?", a: "Self-driving car", b: "Personal drone", c: "tech" },
  { q: "Would you rather Only play single-player games or only play multiplayer games?", a: "Single-player only", b: "Multiplayer only", c: "tech" },
  { q: "Would you rather Live in the Minecraft world or the GTA world?", a: "Minecraft world", b: "GTA world", c: "tech" },
  { q: "Would you rather Have a PS5 or a top-tier gaming PC?", a: "PS5", b: "Gaming PC", c: "tech" },
  { q: "Would you rather Never rage quit again or never lag again?", a: "Never rage quit", b: "Never lag", c: "tech" },
  { q: "Would you rather Live in the Zelda universe or the Pokemon universe?", a: "Zelda universe", b: "Pokemon universe", c: "tech" },
  { q: "Would you rather Stream on Twitch or make YouTube gaming videos?", a: "Stream on Twitch", b: "YouTube gaming videos", c: "tech" },
  { q: "Would you rather Have God Mode in real life or Creative Mode in real life?", a: "God Mode IRL", b: "Creative Mode IRL", c: "tech" },
  { q: "Would you rather Have unlimited V-Bucks or unlimited Robux?", a: "Unlimited V-Bucks", b: "Unlimited Robux", c: "tech" },
  { q: "Would you rather Have Xbox Game Pass free forever or PlayStation Plus free forever?", a: "Xbox Game Pass free", b: "PS Plus free", c: "tech" },
  { q: "Would you rather Have a hologram phone or a mind-controlled laptop?", a: "Hologram phone", b: "Mind-controlled laptop", c: "tech" },
  { q: "Would you rather Have Internet from 2005 speed or a phone from 2005?", a: "2005 internet speed", b: "2005 phone", c: "tech" },
  { q: "Would you rather Never have to charge any device or never have to update any software?", a: "Never charge", b: "Never update", c: "tech" },
  { q: "Would you rather Be a famous streamer or a successful app developer?", a: "Famous streamer", b: "Successful app dev", c: "tech" },
  { q: "Would you rather Live without your phone for a month or without your laptop for a month?", a: "No phone for a month", b: "No laptop for a month", c: "tech" },
  { q: "Would you rather Have every game in existence or unlimited Netflix content?", a: "Every game ever", b: "Unlimited Netflix", c: "tech" },
  { q: "Would you rather Have an unbreakable phone or a phone with infinite battery?", a: "Unbreakable phone", b: "Infinite battery phone", c: "tech" },
  { q: "Would you rather Be an AI researcher or a cybersecurity expert?", a: "AI researcher", b: "Cybersecurity expert", c: "tech" },

  // ═══════════════════════════════════════
  // OTHER / ENTERTAINMENT / MISC (~70)
  // ═══════════════════════════════════════
  { q: "Would you rather Binge one show forever or watch a new show every week?", a: "Binge one show forever", b: "New show every week", c: "other" },
  { q: "Would you rather Live in the Harry Potter universe or the Marvel universe?", a: "Harry Potter universe", b: "Marvel universe", c: "other" },
  { q: "Would you rather Be in a reality TV show or a scripted drama?", a: "Reality TV show", b: "Scripted drama", c: "other" },
  { q: "Would you rather Go to a music festival every month or a movie premiere every week?", a: "Music festival monthly", b: "Movie premiere weekly", c: "other" },
  { q: "Would you rather Watch only anime or only K-dramas for a year?", a: "Only anime", b: "Only K-dramas", c: "other" },
  { q: "Would you rather Have Spotify Premium free forever or Netflix free forever?", a: "Free Spotify Premium", b: "Free Netflix", c: "other" },
  { q: "Would you rather Star in a Marvel movie or a Star Wars movie?", a: "Marvel movie", b: "Star Wars movie", c: "other" },
  { q: "Would you rather Be a famous podcaster or a famous YouTuber?", a: "Famous podcaster", b: "Famous YouTuber", c: "other" },
  { q: "Would you rather Only listen to music from before 2000 or only music released this year?", a: "Pre-2000 music only", b: "This year's music only", c: "other" },
  { q: "Would you rather Watch the same movie every day or never rewatch any movie?", a: "Same movie daily", b: "Never rewatch", c: "other" },
  { q: "Would you rather Meet your favorite artist but they're rude or never meet them?", a: "Meet them, they're rude", b: "Never meet them", c: "other" },
  { q: "Would you rather Only watch comedies or only watch thrillers?", a: "Only comedies", b: "Only thrillers", c: "other" },
  { q: "Would you rather Have front row concert tickets forever or backstage passes forever?", a: "Front row forever", b: "Backstage forever", c: "other" },
  { q: "Would you rather Only read manga or only read novels?", a: "Only manga", b: "Only novels", c: "other" },
  { q: "Would you rather Live in the world of Attack on Titan or the world of One Piece?", a: "Attack on Titan world", b: "One Piece world", c: "other" },
  { q: "Would you rather Have your life narrated by David Attenborough or by Snoop Dogg?", a: "David Attenborough", b: "Snoop Dogg", c: "other" },
  { q: "Would you rather Write a hit song or direct a hit movie?", a: "Write a hit song", b: "Direct a hit movie", c: "other" },
  { q: "Would you rather Be on The Voice or on Love Island?", a: "The Voice", b: "Love Island", c: "other" },
  { q: "Would you rather Be a detective or a spy?", a: "Detective", b: "Spy", c: "other" },
  { q: "Would you rather Have dinner with a historical figure or a fictional character?", a: "Historical figure", b: "Fictional character", c: "other" },
  { q: "Would you rather Be a wizard or a superhero?", a: "Wizard", b: "Superhero", c: "other" },
  { q: "Would you rather Win an Oscar or a Grammy?", a: "Win an Oscar", b: "Win a Grammy", c: "other" },
  { q: "Would you rather Be the main character or the best friend in a movie?", a: "Main character", b: "Best friend", c: "other" },
  { q: "Would you rather Live in Hogwarts or live in the Shire?", a: "Hogwarts", b: "The Shire", c: "other" },
  { q: "Would you rather Have dinner with your favorite celebrity or spend a day with any historical figure?", a: "Dinner with fave celeb", b: "Day with historical figure", c: "other" },
  { q: "Would you rather Be in a zombie movie or a space movie?", a: "Zombie movie", b: "Space movie", c: "other" },
  { q: "Would you rather Be a pirate or a ninja?", a: "Pirate", b: "Ninja", c: "other" },
  { q: "Would you rather Have a reboot of your favorite show or a sequel to your favorite movie?", a: "Show reboot", b: "Movie sequel", c: "other" },
  { q: "Would you rather Be fluent in every instrument or every art form?", a: "Every instrument", b: "Every art form", c: "other" },
  { q: "Would you rather Have unlimited concert tickets or unlimited sports tickets?", a: "Unlimited concerts", b: "Unlimited sports", c: "other" },
  { q: "Would you rather Be a time traveler or a space explorer?", a: "Time traveler", b: "Space explorer", c: "other" },
  { q: "Would you rather Live inside your favorite video game or your favorite TV show?", a: "Favorite video game", b: "Favorite TV show", c: "other" },
  { q: "Would you rather Have a photographic memory for everything you read or everything you hear?", a: "Remember what I read", b: "Remember what I hear", c: "other" },
  { q: "Would you rather Be trapped in a library for a week or a museum for a week?", a: "Library for a week", b: "Museum for a week", c: "other" },
  { q: "Would you rather Live in the world of Star Wars or Lord of the Rings?", a: "Star Wars", b: "Lord of the Rings", c: "other" },
];

console.log(`Total questions to insert: ${Q.length}`);

// ── Main ──
async function main() {
  await signIn();

  let inserted = 0;
  let failed = 0;
  const BATCH = 5;

  for (let i = 0; i < Q.length; i += BATCH) {
    const batch = Q.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(q => insertQ(q)));
    for (const r of results) {
      if (r.status === 'fulfilled') inserted++;
      else {
        failed++;
        console.error('  FAIL:', r.reason?.message?.slice(0, 150));
      }
    }
    if ((i + BATCH) % 50 < BATCH) {
      console.log(`  Progress: ${inserted}/${Q.length} inserted (${failed} failed)`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Total: ${Q.length} | Inserted: ${inserted} | Failed: ${failed}`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
