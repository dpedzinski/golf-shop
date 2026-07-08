import { Product } from './types';

export const CATEGORIES = [
  'Drivers', 'Fairway Woods', 'Hybrids', 'Iron Sets', 'Wedges', 'Putters', 
  'Golf Balls', 'Apparel', 'Golf Shoes', 'Bags', 'Tech & GPS', 'Training Aids', 'Accessories'
];

// High-quality realistic golf images from Unsplash
const IMAGES = {
  driver: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?w=600&h=600&fit=crop',
  wood: 'https://images.unsplash.com/photo-1592916314725-54d3b3b07b4a?w=600&h=600&fit=crop',
  irons: 'https://images.unsplash.com/photo-1593111774240-d529f12cb416?w=600&h=600&fit=crop',
  wedge: 'https://images.unsplash.com/photo-1622228635634-125c756d31af?w=600&h=600&fit=crop',
  putter: 'https://images.unsplash.com/photo-1525598912003-663126343e1f?w=600&h=600&fit=crop',
  balls: 'https://images.unsplash.com/photo-1551064711-37179f4d1c93?w=600&h=600&fit=crop',
  apparel: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
  bag: 'https://images.unsplash.com/photo-1593111774661-084b1571828c?w=600&h=600&fit=crop',
  shoes: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&h=600&fit=crop',
  tech: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=600&h=600&fit=crop',
  training: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=600&fit=crop'
};

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'LaunchMax Carbon Driver',
    brand: 'Apex Canyon Golf',
    category: 'Drivers',
    price: 459.99,
    msrp: 499.99,
    shortDescription: 'Premium adjustable driver built for ball speed and stable misses.',
    description: 'A premium adjustable driver built for ball speed, launch tuning, and stable misses. It uses a lightweight crown, reinforced sole frame, variable-thickness titanium face, an eight-position hosel, and rear weight track to help golfers tune launch and shot shape.',
    badges: ['Best for Forgiveness', 'Top Seller'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who want easier launch, forgiveness across the face, and help reducing a fade or slice.',
    tradeoff: 'Adjustability is helpful, but beginners may need guidance choosing loft, shaft flex, and weight settings.',
    reviews: {
      rating: 4.45,
      count: 190,
      positiveSample: 'Ball speed stayed strong on slight toe strikes and the adjustable weight helped me reduce my fade.',
      negativeSample: 'The adjustability helps, but the headcover is tighter than it needs to be.'
    },
    imageUrl: IMAGES.driver
  },
  {
    id: 'p2',
    name: 'SpeedCrest LS Driver',
    brand: 'Meridian Tour Labs',
    category: 'Drivers',
    price: 549.99,
    shortDescription: 'Low-spin adjustable driver for strong ball flight and distance control.',
    description: 'A low-spin adjustable driver for players who want stronger ball flight, distance control, and stability without an oversized look. Positioned for players who generate enough launch but want to reduce spin and tighten dispersion.',
    badges: ['Better Player Fit', 'Low Spin'],
    stockStatus: 'Low Stock',
    targetPlayer: 'Players who want lower spin or a more penetrating flight.',
    tradeoff: 'It may not be the easiest option for golfers who already hit the ball low.',
    reviews: {
      rating: 4.6,
      count: 85,
      positiveSample: 'The flight was flatter and more controlled.',
      negativeSample: 'I needed the right shaft to keep launch high enough.'
    },
    imageUrl: IMAGES.driver
  },
  {
    id: 'p3',
    name: 'DrawPeak Max Driver',
    brand: 'NorthLake Forge',
    category: 'Drivers',
    price: 399.99,
    shortDescription: 'Draw-biased driver designed to fight a slice.',
    description: 'A draw-biased driver designed for golfers who fight a slice or fade and want help turning the ball over. Confidence-building, forgiving, and easy to launch.',
    badges: ['Beginner Friendly', 'High Launch'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who fight a slice or fade.',
    tradeoff: 'Players who already draw the ball may see too much left bias.',
    reviews: {
      rating: 4.3,
      count: 120,
      positiveSample: 'It helped my fade turn into a straighter flight without feeling too closed at address.',
      negativeSample: 'A bit loud at impact compared to carbon drivers.'
    },
    imageUrl: IMAGES.driver
  },
  {
    id: 'p4',
    name: 'FlightDeck 3-Wood',
    brand: 'Apex Canyon Golf',
    category: 'Fairway Woods',
    price: 249.99,
    shortDescription: 'Strong carry distance and easy launch from tee or turf.',
    description: 'A fairway wood designed for strong carry distance, easy launch, and confidence from the tee or turf.',
    badges: ['High Launch'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who want a reliable long club when driver is too risky.',
    tradeoff: 'A shallow face can take practice for players who mostly hit fairway woods off the tee.',
    reviews: {
      rating: 4.5,
      count: 112,
      positiveSample: 'Strong carry distance with enough height to hold a green on long approaches.'
    },
    imageUrl: IMAGES.wood
  },
  {
    id: 'p5',
    name: 'EasyLaunch 7-Wood',
    brand: 'NorthLake Forge',
    category: 'Fairway Woods',
    price: 229.99,
    shortDescription: 'High-launch fairway wood for easier long approaches.',
    description: 'A high-launch fairway wood for golfers who want an easier alternative to long irons or lower-loft hybrids.',
    badges: ['Beginner Friendly'],
    stockStatus: 'In Stock',
    targetPlayer: 'Players who need height and forgiveness more than maximum distance.',
    tradeoff: 'It may fly too high for players who prefer a flatter, wind-piercing trajectory.',
    reviews: {
      rating: 4.7,
      count: 89,
      positiveSample: 'The ball launches high and lands soft, which made long par 3s feel easier.'
    },
    imageUrl: IMAGES.wood
  },
  {
    id: 'p6',
    name: 'RescueArc 3-Hybrid',
    brand: 'Apex Canyon Golf',
    category: 'Hybrids',
    price: 199.99,
    shortDescription: 'Forgiving hybrid to replace difficult long irons.',
    description: 'A forgiving hybrid designed to replace difficult long irons and help golfers launch the ball from fairway, tee, or light rough.',
    badges: ['Best Value'],
    stockStatus: 'In Stock',
    targetPlayer: 'Mid- to high-handicap golfers who need a reliable long approach option.',
    tradeoff: 'Golfers who hook hybrids may need a more neutral or less draw-biased model.',
    reviews: {
      rating: 4.4,
      count: 156,
      positiveSample: 'The shape sits square and gives me confidence on longer approach shots.'
    },
    imageUrl: IMAGES.irons
  },
  {
    id: 'p7',
    name: 'VX Forged Cavity Iron Set',
    brand: 'NorthLake Forge',
    category: 'Iron Sets',
    price: 849.99,
    msrp: 999.99,
    shortDescription: 'Forged cavity-style irons for skilled ball strikers.',
    description: 'A forged cavity-style iron set for skilled ball strikers who want compact control, clean shaping, and a soft feel while still getting practical forgiveness.',
    badges: ['Better Player Fit', 'Soft Feel'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who care about feedback, turf interaction, and consistent gapping.',
    tradeoff: 'Excellent feel and control, but less forgiving than larger game-improvement irons.',
    reviews: {
      rating: 4.24,
      count: 38,
      positiveSample: 'Distances are predictable and the short irons look clean behind the ball.',
      negativeSample: 'Feel is excellent, but the stronger lofts created a larger gap into my wedges.'
    },
    imageUrl: IMAGES.irons
  },
  {
    id: 'p8',
    name: 'GrainFlow Players Iron Set',
    brand: 'Apex Canyon Golf',
    category: 'Iron Sets',
    price: 799.99,
    shortDescription: 'Balanced iron set for improving golfers wanting distance and launch.',
    description: 'A balanced iron set for improving golfers who want distance, launch, and enough forgiveness without losing a clean look behind the ball.',
    badges: ['Best Value', 'Top Seller'],
    stockStatus: 'In Stock',
    targetPlayer: 'Players moving from beginner clubs into a more capable set.',
    tradeoff: 'Strong all-around fit for many golfers, but custom fit may be needed for unusual height.',
    reviews: {
      rating: 4.66,
      count: 266,
      positiveSample: 'Distances are predictable and the short irons look clean behind the ball.',
      negativeSample: 'Great set, but custom length orders would make it better for taller players.'
    },
    imageUrl: IMAGES.irons
  },
  {
    id: 'p9',
    name: 'MaxForgive Graphite Iron Set',
    brand: 'Apex Canyon Golf',
    category: 'Iron Sets',
    price: 699.99,
    shortDescription: 'Game-improvement irons with lighter graphite shafts.',
    description: 'A game-improvement iron set designed for golfers who want easier launch, more forgiveness, lighter graphite shafts, and better consistency on mishits.',
    badges: ['Beginner Friendly', 'High Launch'],
    stockStatus: 'In Stock',
    targetPlayer: 'Beginners, seniors, slower swing-speed players, and high-handicap golfers.',
    tradeoff: 'It may not offer the compact look or shot-shaping control preferred by lower-handicap players.',
    reviews: {
      rating: 4.8,
      count: 310,
      positiveSample: 'The set gives me more launch in the long irons without looking bulky.'
    },
    imageUrl: IMAGES.irons
  },
  {
    id: 'p10',
    name: 'TourGrind Satin Wedge',
    brand: 'NorthLake Forge',
    category: 'Wedges',
    price: 139.99,
    shortDescription: 'Scoring wedge engineered for spin consistency and turf versatility.',
    description: 'A scoring wedge engineered for spin consistency, bunker help, and turf versatility. Useful for players who want confidence inside 100 yards.',
    badges: ['Versatile'],
    stockStatus: 'In Stock',
    targetPlayer: 'Players who want predictable partial shots and better control.',
    tradeoff: 'Great versatility for many players, but bounce and grind must match the player’s swing and turf conditions.',
    reviews: {
      rating: 4.67,
      count: 592,
      positiveSample: 'Easy to open the face without the leading edge sitting too high.',
      negativeSample: 'The wide sole is great in sand but less versatile on firm turf.'
    },
    imageUrl: IMAGES.wedge
  },
  {
    id: 'p11',
    name: 'SandSaver Wide Sole Wedge',
    brand: 'Apex Canyon Golf',
    category: 'Wedges',
    price: 119.99,
    shortDescription: 'Wide-sole wedge for extra help from bunkers and soft turf.',
    description: 'A wide-sole wedge designed for golfers who need extra help from bunkers, fluffy lies, and softer turf.',
    badges: ['Game Improvement'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who struggle with chunked chips or leaving bunker shots short.',
    tradeoff: 'Excellent for sand and soft turf, but not ideal for every tight-lie shot.',
    reviews: {
      rating: 4.28,
      count: 58,
      positiveSample: 'Spin is predictable on partial shots and the sole works well from both sand and fairway.',
      negativeSample: 'Plenty of spin, but the raw-style finish marks up quickly.'
    },
    imageUrl: IMAGES.wedge
  },
  {
    id: 'p12',
    name: 'LineLock Mallet Putter',
    brand: 'Meridian Tour Labs',
    category: 'Putters',
    price: 249.99,
    shortDescription: 'Stable mallet putter for alignment help and face stability.',
    description: 'A stable mallet putter designed for alignment help, face stability, and confidence on short putts.',
    badges: ['High MOI'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who struggle with aim, distance control, or starting putts on line.',
    tradeoff: 'Golfers who prefer a traditional blade look may find the head shape too large.',
    reviews: {
      rating: 4.6,
      count: 145,
      positiveSample: 'Distance control improved right away on long lag putts.'
    },
    imageUrl: IMAGES.putter
  },
  {
    id: 'p13',
    name: 'GrainRoll Blade Putter',
    brand: 'NorthLake Forge',
    category: 'Putters',
    price: 299.99,
    shortDescription: 'Soft-feeling blade putter for classic shaping and feedback.',
    description: 'A soft-feeling blade putter for golfers who prefer classic shaping, feedback, and distance control.',
    badges: ['Classic Look'],
    stockStatus: 'Low Stock',
    targetPlayer: 'Players with an arcing stroke or those who like a compact head behind the ball.',
    tradeoff: 'Less stable on mishits than a larger mallet.',
    reviews: {
      rating: 4.5,
      count: 92,
      positiveSample: 'The face has a soft feel without making putts come off slow.'
    },
    imageUrl: IMAGES.putter
  },
  {
    id: 'p14',
    name: 'TourCore Urethane Golf Balls',
    brand: 'Vantage Core Golf',
    category: 'Golf Balls',
    price: 49.99,
    shortDescription: 'Direct-to-player urethane golf ball for budget-conscious golfers.',
    description: 'A direct-to-player urethane golf ball for budget-conscious golfers who want tour-style performance without paying top-tier pricing.',
    badges: ['Best Value', 'Soft Feel'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who want spin control and soft feel but still care about price.',
    tradeoff: 'Strong performance value, but durability may be a concern for frequent bunker or wedge play.',
    reviews: {
      rating: 4.02,
      count: 395,
      positiveSample: 'Good driver distance and a soft enough feel on chips around the green.',
      negativeSample: 'Great value, but the cover scuffed faster after bunker shots.'
    },
    imageUrl: IMAGES.balls
  },
  {
    id: 'p15',
    name: 'SpinHalo Tour Golf Balls',
    brand: 'Vantage Core Golf',
    category: 'Golf Balls',
    price: 31.99,
    shortDescription: 'Value-forward performance ball with visible color options.',
    description: 'A value-forward performance ball for golfers who want visible color options, solid distance, and greenside control.',
    badges: ['Best Value'],
    stockStatus: 'In Stock',
    targetPlayer: 'Players who lose balls often but still want a premium-feeling ball.',
    tradeoff: 'Great value and visibility, but matte finishes may need more cleaning.',
    reviews: {
      rating: 4.45,
      count: 745,
      positiveSample: 'The color is easy to track and the cover held up for the whole round.',
      negativeSample: 'Easy to see in flight, but the matte color picked up dirt quickly.'
    },
    imageUrl: IMAGES.balls
  },
  {
    id: 'p16',
    name: 'TrueFeel Low Compression Balls',
    brand: 'Meridian Tour Labs',
    category: 'Golf Balls',
    price: 24.99,
    shortDescription: 'Low-compression golf ball for a softer feel and easier launch.',
    description: 'A low-compression golf ball for golfers who want a softer feel, easier launch, and better comfort at moderate or slower swing speeds.',
    badges: ['Soft Feel'],
    stockStatus: 'In Stock',
    targetPlayer: 'Players who prioritize feel over maximum spin.',
    tradeoff: 'Higher-speed players may prefer a firmer or lower-spin tour-style ball.',
    reviews: {
      rating: 4.3,
      count: 210,
      positiveSample: 'The ball felt soft on irons and chips without feeling dead off the driver.'
    },
    imageUrl: IMAGES.balls
  },
  {
    id: 'p17',
    name: 'BreezeKnit Performance Polo',
    brand: 'Silverleaf Performance',
    category: 'Apparel',
    price: 94.99,
    shortDescription: 'Breathable stretch golf polo for humid rounds.',
    description: 'A breathable stretch golf polo for humid rounds, range sessions, and clean clubhouse style. Lightweight, flexible, and polished.',
    badges: ['Breathable'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers looking for lightweight, flexible, and polished apparel.',
    tradeoff: 'Great comfort and breathability, but customers should check fit and washing guidance.',
    reviews: {
      rating: 4.47,
      count: 85,
      positiveSample: 'Comfortable collar and the fit works tucked or untucked.',
      negativeSample: 'Breathes well, but the collar needed reshaping after washing.'
    },
    imageUrl: IMAGES.apparel
  },
  {
    id: 'p18',
    name: 'StormShield Rain Jacket',
    brand: 'Silverleaf Performance',
    category: 'Apparel',
    price: 189.99,
    shortDescription: 'Rain jacket for weather protection without restricting the swing.',
    description: 'A rain jacket for golfers who need weather protection without restricting the swing. Features stretch, packability, and water resistance.',
    badges: ['Waterproof'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who need weather protection without restricting the swing.',
    tradeoff: 'Rain protection should be explained accurately; do not exaggerate waterproof claims.',
    reviews: {
      rating: 4.6,
      count: 124,
      positiveSample: 'Enough stretch to swing freely and easy to pack into the bag.'
    },
    imageUrl: IMAGES.apparel
  },
  {
    id: 'p19',
    name: 'FeatherStand Carry Bag',
    brand: 'Silverleaf Performance',
    category: 'Bags',
    price: 159.99,
    shortDescription: 'Lightweight stand bag for walking golfers.',
    description: 'A lightweight stand bag for walking golfers who want useful storage without extra bulk. Features smart pocket layout and comfortable carry straps.',
    badges: ['Walking Favorite', 'Lightweight'],
    stockStatus: 'Low Stock',
    targetPlayer: 'Walking golfers who want useful storage without extra bulk.',
    tradeoff: 'Lightweight bags are easier to carry but may have less structure or storage than larger cart bags.',
    reviews: {
      rating: 4.20,
      count: 61,
      positiveSample: 'Plenty of pocket space without making the bag feel awkward to carry.',
      negativeSample: 'Great organization, although the stand legs can click on bumpy cart paths.'
    },
    imageUrl: IMAGES.bag
  },
  {
    id: 'p20',
    name: 'Fourteen-Way Cart Bag',
    brand: 'Stonebridge Carry Co.',
    category: 'Bags',
    price: 249.99,
    shortDescription: 'Cart bag with 14-way dividers and easy pocket access.',
    description: 'A cart bag for golfers who ride often and want club organization, storage, and easy access to pockets.',
    badges: ['Maximum Storage'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who ride often and want club organization and storage.',
    tradeoff: 'Excellent organization, but less ideal for golfers who usually walk.',
    reviews: {
      rating: 4.8,
      count: 342,
      positiveSample: 'The dividers keep clubs from tangling and the cooler pocket is actually useful.'
    },
    imageUrl: IMAGES.bag
  },
  {
    id: 'p21',
    name: 'GripCloud Spikeless Shoe',
    brand: 'Driftline Athletic',
    category: 'Golf Shoes',
    price: 139.99,
    shortDescription: 'Spikeless golf shoe for waterproof stability and walking comfort.',
    description: 'A spikeless golf shoe designed for waterproof stability, walking comfort, and off-course versatility.',
    badges: ['Walking Favorite'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who walk often, practice frequently, or want a versatile shoe.',
    tradeoff: 'Great walking comfort, but customers should check width and sizing carefully.',
    reviews: {
      rating: 4.02,
      count: 863,
      positiveSample: 'Lightweight feel with more stability than a normal sneaker.',
      negativeSample: 'Stable shoe, though the sizing runs about a half-size narrow.'
    },
    imageUrl: IMAGES.shoes
  },
  {
    id: 'p22',
    name: 'TourSpike Waterproof Shoe',
    brand: 'Silverleaf Performance',
    category: 'Golf Shoes',
    price: 189.99,
    shortDescription: 'Spiked waterproof golf shoe for traction and stability.',
    description: 'A spiked waterproof golf shoe for players who want traction, structure, and stability in wet or uneven conditions.',
    badges: ['Waterproof', 'Maximum Traction'],
    stockStatus: 'In Stock',
    targetPlayer: 'Early-morning golfers, wet climates, and players who want more grip.',
    tradeoff: 'Spiked shoes may feel less casual off the course than spikeless shoes.',
    reviews: {
      rating: 4.5,
      count: 215,
      positiveSample: 'Lightweight feel with more stability than a normal sneaker.'
    },
    imageUrl: IMAGES.shoes
  },
  {
    id: 'p23',
    name: 'PinTrace Slope Rangefinder',
    brand: 'Cobalt Rangeworks',
    category: 'Tech & GPS',
    price: 299.99,
    shortDescription: 'Compact rangefinder with fast yardages and slope functionality.',
    description: 'A compact rangefinder for players who want fast yardages, simple target lock, slope functionality, and confident club selection.',
    badges: ['Tournament Legal (when slope off)'],
    stockStatus: 'In Stock',
    targetPlayer: 'Players who want quick yardages without a complicated GPS interface.',
    tradeoff: 'Great for fast pin yardages, but customers who want hole maps may prefer GPS.',
    reviews: {
      rating: 4.02,
      count: 560,
      positiveSample: 'Compact enough for a pocket and yardages matched my playing partner’s laser.',
      negativeSample: 'Yardages are quick, but the case clip feels basic.'
    },
    imageUrl: IMAGES.tech
  },
  {
    id: 'p24',
    name: 'CourseMap GPS Handheld',
    brand: 'Cobalt Rangeworks',
    category: 'Tech & GPS',
    price: 199.99,
    shortDescription: 'GPS device for course maps, hazards, and layup yardages.',
    description: 'A GPS device for golfers who want course maps, hazards, layup yardages, and front-middle-back green distances.',
    badges: ['Course Maps'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who want course context and shot planning over simple lasers.',
    tradeoff: 'GPS tools provide course context, while lasers provide precise target yardage.',
    reviews: {
      rating: 4.3,
      count: 180,
      positiveSample: 'Locks onto flags quickly and the slope toggle is simple to use.'
    },
    imageUrl: IMAGES.tech
  },
  {
    id: 'p25',
    name: 'TempoGate Putting Trainer',
    brand: 'Cobalt Rangeworks',
    category: 'Training Aids',
    price: 49.99,
    shortDescription: 'Putting trainer for better start line and face control.',
    description: 'A putting trainer for golfers who want better start line, face control, and repeatable putting practice.',
    badges: ['Practice Essential'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers looking for home practice, office practice, and short focused putting sessions.',
    tradeoff: 'Works best on a flat surface and does not replace on-course green-reading practice.',
    reviews: {
      rating: 4.7,
      count: 320,
      positiveSample: 'Simple setup and the feedback is obvious after only a few putts.'
    },
    imageUrl: IMAGES.putter
  },
  {
    id: 'p26',
    name: 'ImpactBoard Strike Mat',
    brand: 'Cobalt Rangeworks',
    category: 'Training Aids',
    price: 129.99,
    shortDescription: 'Portable training aid for improving strike feedback.',
    description: 'A portable training aid for golfers building repeatable practice habits and improving strike feedback.',
    badges: ['Swing Feedback'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers wanting home practice, range work, and quick feedback sessions.',
    tradeoff: 'Helpful for practice feedback, but review count is low and it should not be oversold.',
    reviews: {
      rating: 4.44,
      count: 9,
      positiveSample: 'Simple setup and the feedback is obvious after only a few putts.',
      negativeSample: 'Useful feedback, but it works best on a flat surface.'
    },
    imageUrl: IMAGES.training
  },
  {
    id: 'p27',
    name: 'Magnetic Towel and Brush Kit',
    brand: 'Stonebridge Carry Co.',
    category: 'Accessories',
    price: 29.99,
    shortDescription: 'Practical towel and brush kit for clean grooves and dry grips.',
    description: 'A practical towel and brush kit for golfers who want clean grooves, dry grips, and better organization during a round.',
    badges: ['Best Value'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who want an easy add-on for club care.',
    tradeoff: 'Useful accessory, but not a substitute for full club cleaning tools.',
    reviews: {
      rating: 4.8,
      count: 512,
      positiveSample: 'The magnet is stronger than expected and the towel dries quickly.'
    },
    imageUrl: IMAGES.bag
  },
  {
    id: 'p28',
    name: 'Alignment Stick Pro Pack',
    brand: 'Vantage Core Golf',
    category: 'Accessories',
    price: 19.99,
    shortDescription: 'Simple practice accessory for alignment and swing path.',
    description: 'A simple practice accessory for alignment, swing path, setup, putting gates, and range drills.',
    badges: ['Practice Essential'],
    stockStatus: 'In Stock',
    targetPlayer: 'Golfers who want affordable practice structure.',
    tradeoff: 'Effective only when customers use drills consistently.',
    reviews: {
      rating: 4.6,
      count: 890,
      positiveSample: 'Practical kit that saves time during practice and keeps small items organized.'
    },
    imageUrl: IMAGES.training
  }
];

export const getProductsByCategory = (category: string) => {
  return PRODUCTS.filter(p => p.category === category);
};

export const getProductById = (id: string) => {
  return PRODUCTS.find(p => p.id === id);
};
