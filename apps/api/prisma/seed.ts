import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Correct pricing formula (mirrors §7 of the build spec).
 * The seed always computes booking snapshots with this correct version so that
 * historical bookings look right.
 */
function computePricing(args: {
  perHeadPence: number;
  guestCount: number;
  minSpendPence: number;
}) {
  const { perHeadPence, guestCount, minSpendPence } = args;
  const subtotalPence = perHeadPence * guestCount;
  const minSpendTopUpPence = Math.max(0, minSpendPence - subtotalPence);
  const serviceFeePence = Math.round((subtotalPence + minSpendTopUpPence) * 0.1);
  const totalPence = subtotalPence + minSpendTopUpPence + serviceFeePence;
  return { subtotalPence, minSpendTopUpPence, serviceFeePence, totalPence };
}

type ChefSeed = {
  name: string;
  bio: string;
  cuisines: string;
  location: string;
  pricePerHeadPence: number;
  minSpendPence: number;
  menus: Array<{
    name: string;
    description: string;
    serviceStyle: string;
    pricePerHeadPence: number;
  }>;
  reviews: Array<{ rating: number; comment: string; authorName: string }>;
};

const chefSeeds: ChefSeed[] = [
  {
    name: "Marco Rossi",
    bio: "Roman-born chef bringing rustic trattoria classics and fresh handmade pasta to your table.",
    cuisines: "Italian,Mediterranean",
    location: "London",
    pricePerHeadPence: 5500,
    minSpendPence: 45000,
    menus: [
      {
        name: "Trattoria Feast",
        description: "Antipasti, hand-rolled tagliatelle al ragù, tiramisù.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5800,
      },
      {
        name: "Aperitivo Canapés",
        description: "Arancini, bruschetta, prosciutto crostini and spritz pairings.",
        serviceStyle: "Canapés",
        pricePerHeadPence: 4200,
      },
    ],
    reviews: [
      { rating: 5, comment: "The ragù was unbelievable, best pasta I've had at home.", authorName: "Hannah W." },
      { rating: 5, comment: "Marco was warm, professional and left the kitchen spotless.", authorName: "Daniel K." },
      { rating: 4, comment: "Lovely food, ran slightly behind on timing but worth the wait.", authorName: "Sophie L." },
      { rating: 5, comment: "Our guests are still talking about the tiramisù.", authorName: "James P." },
    ],
  },
  {
    name: "Eleni Pappas",
    bio: "Greek island cooking with charcoal-grilled meats, meze and plenty of olive oil and lemon.",
    cuisines: "Greek,Mediterranean",
    location: "London",
    pricePerHeadPence: 4800,
    minSpendPence: 35000,
    menus: [
      {
        name: "Meze Banquet",
        description: "Tzatziki, dolmades, grilled halloumi, lamb souvlaki, baklava.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4800,
      },
      {
        name: "Aegean Seated",
        description: "Three-course plated menu of seafood and slow-cooked lamb.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5300,
      },
      {
        name: "Souvlaki BBQ",
        description: "Charcoal grill spread of skewers, pita and Greek salads.",
        serviceStyle: "BBQ",
        pricePerHeadPence: 4400,
      },
    ],
    reviews: [
      { rating: 5, comment: "Felt like a holiday in Crete. The lamb was perfect.", authorName: "Maria G." },
      { rating: 4, comment: "Great meze spread, would have liked a touch more dessert.", authorName: "Olu A." },
      { rating: 5, comment: "Eleni is a star — friendly and seriously talented.", authorName: "Chris D." },
      { rating: 4, comment: "Solid Greek feast, good value for the group.", authorName: "Bex T." },
      { rating: 5, comment: "Halloumi was charred to perfection.", authorName: "Will S." },
    ],
  },
  {
    name: "Diego Hernández",
    bio: "Modern Mexican cooking — masa ground in-house, smoky salsas and fresh ceviches.",
    cuisines: "Mexican",
    location: "London",
    pricePerHeadPence: 5200,
    minSpendPence: 40000,
    menus: [
      {
        name: "Taqueria Night",
        description: "Build-your-own tacos with carnitas, al pastor and roasted veg.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 5000,
      },
      {
        name: "Chef's Tasting",
        description: "Five plated courses celebrating regional Mexican cuisine.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 6000,
      },
    ],
    reviews: [
      { rating: 5, comment: "The al pastor was incredible, proper restaurant quality.", authorName: "Lauren M." },
      { rating: 4, comment: "Fun interactive taco night, guests loved it.", authorName: "Adam R." },
      { rating: 5, comment: "Best margaritas and salsas I've ever had.", authorName: "Priya S." },
      { rating: 4, comment: "Lots of flavour, a couple of dishes were quite spicy.", authorName: "Nina F." },
    ],
  },
  {
    name: "Aisha Khan",
    bio: "Award-nominated chef serving regional Indian thalis, dosas and slow-cooked curries.",
    cuisines: "Indian",
    location: "London",
    pricePerHeadPence: 4600,
    minSpendPence: 30000,
    menus: [
      {
        name: "Royal Thali",
        description: "Multi-dish thali with biryani, dals, breads and chutneys.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 4600,
      },
      {
        name: "Street Food Buffet",
        description: "Chaat, pakoras, dosas and curries served family-style.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4000,
      },
      {
        name: "Spice Canapés",
        description: "Bite-sized samosas, tikka skewers and mini naans.",
        serviceStyle: "Canapés",
        pricePerHeadPence: 3700,
      },
    ],
    reviews: [
      { rating: 5, comment: "Hands down the best Indian food we've had at home.", authorName: "Tom B." },
      { rating: 5, comment: "Aisha catered for our allergies brilliantly.", authorName: "Grace H." },
      { rating: 4, comment: "Rich, authentic curries — bring an appetite!", authorName: "Sunil V." },
      { rating: 5, comment: "The biryani was worth every penny.", authorName: "Ella J." },
      { rating: 5, comment: "Warm, generous and ridiculously talented.", authorName: "Mo A." },
      { rating: 4, comment: "Great spread, very accommodating chef.", authorName: "Kate W." },
    ],
  },
  {
    name: "Kenji Tanaka",
    bio: "Tokyo-trained sushi chef offering omakase, robata and izakaya-style sharing plates.",
    cuisines: "Japanese",
    location: "London",
    pricePerHeadPence: 8200,
    minSpendPence: 90000,
    menus: [
      {
        name: "Omakase",
        description: "Chef-led sushi tasting using the day's best market fish.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 8500,
      },
      {
        name: "Izakaya Sharing",
        description: "Robata skewers, gyoza, karaage and sashimi platters.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 7000,
      },
    ],
    reviews: [
      { rating: 5, comment: "Restaurant-grade omakase in our living room. Stunning.", authorName: "Victoria L." },
      { rating: 5, comment: "Every piece of nigiri was flawless.", authorName: "Henry C." },
      { rating: 4, comment: "Premium experience, premium price — but worth it.", authorName: "Rachel N." },
      { rating: 5, comment: "Kenji's knife skills were mesmerising.", authorName: "Sam O." },
    ],
  },
  {
    name: "Camille Dubois",
    bio: "Classically trained French chef specialising in bistro dining and elegant plated menus.",
    cuisines: "French",
    location: "London",
    pricePerHeadPence: 6800,
    minSpendPence: 60000,
    menus: [
      {
        name: "Bistro Dinner",
        description: "Coq au vin, gratin dauphinois and crème brûlée.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 6800,
      },
      {
        name: "Champagne Canapés",
        description: "Gougères, foie gras toasts and smoked salmon blinis.",
        serviceStyle: "Canapés",
        pricePerHeadPence: 5500,
      },
    ],
    reviews: [
      { rating: 5, comment: "Elegant, refined and beautifully presented.", authorName: "Isabelle R." },
      { rating: 4, comment: "Lovely classic French cooking, very romantic dinner.", authorName: "George M." },
      { rating: 5, comment: "The crème brûlée alone was worth it.", authorName: "Anna P." },
      { rating: 5, comment: "Camille is the consummate professional.", authorName: "Luke T." },
    ],
  },
  {
    name: "Yusuf Demir",
    bio: "Lebanese and Levantine mezze, charcoal grills and fragrant slow-cooked stews.",
    cuisines: "Lebanese,Mediterranean",
    location: "Manchester",
    pricePerHeadPence: 4400,
    minSpendPence: 28000,
    menus: [
      {
        name: "Levantine Mezze",
        description: "Hummus, baba ganoush, falafel, kibbeh and flatbreads.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4400,
      },
      {
        name: "Charcoal Grill",
        description: "Shish taouk, lamb kofta and grilled vegetables.",
        serviceStyle: "BBQ",
        pricePerHeadPence: 4600,
      },
    ],
    reviews: [
      { rating: 5, comment: "The mezze table looked and tasted incredible.", authorName: "Layla H." },
      { rating: 4, comment: "Generous portions and lovely fresh flavours.", authorName: "Ben K." },
      { rating: 5, comment: "Yusuf made our garden party a hit.", authorName: "Fatima Z." },
    ],
  },
  {
    name: "Sophie Bennett",
    bio: "Seasonal modern British cooking using the best local produce and a nose-to-tail ethos.",
    cuisines: "British",
    location: "London",
    pricePerHeadPence: 6000,
    minSpendPence: 50000,
    menus: [
      {
        name: "Sunday Roast",
        description: "Slow-roast beef, Yorkshire puddings and all the trimmings.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5800,
      },
      {
        name: "Garden Party Buffet",
        description: "Seasonal salads, pies, and a hot carvery station.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 5200,
      },
    ],
    reviews: [
      { rating: 5, comment: "Best roast we've had outside a gastropub.", authorName: "Charlotte D." },
      { rating: 4, comment: "Comforting, hearty and beautifully cooked.", authorName: "Edward F." },
      { rating: 4, comment: "Great seasonal menu, lovely chef.", authorName: "Megan S." },
      { rating: 5, comment: "The Yorkshire puddings were enormous!", authorName: "Paul R." },
    ],
  },
  {
    name: "Niran Suwan",
    bio: "Bangkok street-food specialist bringing bold, fragrant Thai dishes cooked to order.",
    cuisines: "Thai",
    location: "London",
    pricePerHeadPence: 4700,
    minSpendPence: 32000,
    menus: [
      {
        name: "Street Food Feast",
        description: "Pad thai, green curry, satay and mango sticky rice.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4500,
      },
      {
        name: "Royal Thai Seated",
        description: "Refined plated courses of classic Thai cuisine.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5100,
      },
    ],
    reviews: [
      { rating: 5, comment: "Authentic, fresh and full of flavour.", authorName: "Joanna L." },
      { rating: 4, comment: "Loved the satay and the curries.", authorName: "Dev P." },
      { rating: 5, comment: "Niran was friendly and the food was spot on.", authorName: "Hugo B." },
      { rating: 4, comment: "Great Thai feast, slightly mild for us but excellent.", authorName: "Steph M." },
      { rating: 5, comment: "Mango sticky rice was heavenly.", authorName: "Aaron K." },
    ],
  },
  {
    name: "Lucia Conti",
    bio: "Northern Italian cuisine with risottos, fresh pasta and decadent desserts.",
    cuisines: "Italian",
    location: "Manchester",
    pricePerHeadPence: 5000,
    minSpendPence: 38000,
    menus: [
      {
        name: "Risotto & Pasta",
        description: "Saffron risotto, ravioli and panna cotta.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5000,
      },
      {
        name: "Italian Buffet",
        description: "Sharing boards, lasagne and seasonal sides.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4500,
      },
      {
        name: "Cicchetti Canapés",
        description: "Venetian-style small bites and prosecco.",
        serviceStyle: "Canapés",
        pricePerHeadPence: 4000,
      },
    ],
    reviews: [
      { rating: 4, comment: "The risotto was creamy and perfectly seasoned.", authorName: "Marco V." },
      { rating: 5, comment: "Lucia is a wonderful host and brilliant cook.", authorName: "Holly D." },
      { rating: 4, comment: "Great Italian comfort food.", authorName: "Ryan T." },
    ],
  },
  {
    name: "Theo Andreou",
    bio: "Mediterranean sharing menus inspired by Cyprus, Greece and the wider Levant.",
    cuisines: "Mediterranean,Greek",
    location: "London",
    pricePerHeadPence: 5100,
    minSpendPence: 42000,
    menus: [
      {
        name: "Mediterranean Sharing",
        description: "Grilled fish, slow lamb, dips and seasonal salads.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 5100,
      },
      {
        name: "Coastal Seated",
        description: "Plated seafood-forward Mediterranean dinner.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5600,
      },
    ],
    reviews: [
      { rating: 5, comment: "Beautiful sharing feast, everyone went back for seconds.", authorName: "Dom H." },
      { rating: 4, comment: "Fresh, healthy and delicious.", authorName: "Sara L." },
      { rating: 5, comment: "Theo was fantastic with our big group.", authorName: "Nadia R." },
      { rating: 4, comment: "Lovely flavours, great value.", authorName: "Joe M." },
    ],
  },
  {
    name: "Rajiv Mehta",
    bio: "Contemporary Indian fine dining with refined plating and bold regional spices.",
    cuisines: "Indian",
    location: "London",
    pricePerHeadPence: 5400,
    minSpendPence: 46000,
    menus: [
      {
        name: "Modern Indian Tasting",
        description: "Seven plated courses of contemporary Indian cuisine.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5800,
      },
      {
        name: "Curry House Buffet",
        description: "Selection of curries, breads, rice and sides.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4800,
      },
    ],
    reviews: [
      { rating: 5, comment: "Sophisticated and stunning presentation.", authorName: "Imogen P." },
      { rating: 4, comment: "Excellent flavours, a real treat.", authorName: "Karan S." },
      { rating: 5, comment: "Rajiv elevated Indian food to fine dining at home.", authorName: "Beth A." },
      { rating: 5, comment: "Every course was a highlight.", authorName: "Tariq N." },
    ],
  },
  {
    name: "Hana Sato",
    bio: "Japanese home cooking and izakaya plates — comforting, precise and beautifully balanced.",
    cuisines: "Japanese",
    location: "Bristol",
    pricePerHeadPence: 6500,
    minSpendPence: 55000,
    menus: [
      {
        name: "Izakaya Evening",
        description: "Small sharing plates, ramen and yakitori.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 6200,
      },
      {
        name: "Sushi & Sashimi",
        description: "Hand-rolled sushi and fresh sashimi selection.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 7000,
      },
    ],
    reviews: [
      { rating: 5, comment: "Delicate, precise and absolutely delicious.", authorName: "Owen D." },
      { rating: 4, comment: "Lovely izakaya spread, very authentic.", authorName: "Mia L." },
      { rating: 5, comment: "Hana is meticulous and so friendly.", authorName: "Jack R." },
    ],
  },
  {
    name: "Antoine Lefèvre",
    bio: "French Provençal cooking with sun-drenched flavours and rustic elegance.",
    cuisines: "French,Mediterranean",
    location: "London",
    pricePerHeadPence: 7200,
    minSpendPence: 70000,
    menus: [
      {
        name: "Provençal Dinner",
        description: "Bouillabaisse, ratatouille and tarte tatin.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 7200,
      },
      {
        name: "Riviera Canapés",
        description: "Elegant canapés inspired by the Côte d'Azur.",
        serviceStyle: "Canapés",
        pricePerHeadPence: 6000,
      },
    ],
    reviews: [
      { rating: 5, comment: "Transported us straight to the south of France.", authorName: "Florence K." },
      { rating: 4, comment: "Refined and very flavourful.", authorName: "Marcus B." },
      { rating: 5, comment: "Antoine was charming and the food sublime.", authorName: "Yara H." },
      { rating: 4, comment: "Beautiful dinner party, highly recommend.", authorName: "Liam D." },
      { rating: 5, comment: "Best tarte tatin I've ever eaten.", authorName: "Ruth S." },
    ],
  },
  {
    name: "Grace Okafor",
    bio: "Modern British and West African fusion celebrating bold spice and comfort.",
    cuisines: "British,Mediterranean",
    location: "London",
    pricePerHeadPence: 5300,
    minSpendPence: 44000,
    menus: [
      {
        name: "Fusion Feast",
        description: "Jollof-inspired sides, spiced roasts and seasonal veg.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 5300,
      },
      {
        name: "Plated Dinner",
        description: "Three-course modern British dinner with a twist.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5700,
      },
    ],
    reviews: [
      { rating: 5, comment: "Exciting flavours, beautifully executed.", authorName: "Naomi E." },
      { rating: 4, comment: "Great twist on British classics.", authorName: "Simon P." },
      { rating: 5, comment: "Grace is a phenomenal cook and lovely person.", authorName: "Tola A." },
      { rating: 4, comment: "Hearty and full of flavour.", authorName: "Claire M." },
    ],
  },
  {
    name: "Paolo Greco",
    bio: "Southern Italian and Sicilian cooking — seafood, citrus and wood-fired flavours.",
    cuisines: "Italian,Mediterranean",
    location: "London",
    pricePerHeadPence: 5600,
    minSpendPence: 48000,
    menus: [
      {
        name: "Sicilian Seafood",
        description: "Caponata, swordfish and cannoli.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5900,
      },
      {
        name: "Southern Buffet",
        description: "Arancini, pasta alla norma and sharing platters.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 5100,
      },
    ],
    reviews: [
      { rating: 4, comment: "Lovely Sicilian flavours, the cannoli were a hit.", authorName: "Vera L." },
      { rating: 5, comment: "Paolo cooked a feast fit for a celebration.", authorName: "Dan O." },
      { rating: 4, comment: "Great seafood, generous portions.", authorName: "Ines R." },
      { rating: 5, comment: "Truly authentic southern Italian cooking.", authorName: "Felix B." },
    ],
  },
  {
    name: "Mei Lin",
    bio: "Pan-Asian sharing menus blending Thai, Japanese and regional Chinese influences.",
    cuisines: "Thai,Japanese",
    location: "Manchester",
    pricePerHeadPence: 4900,
    minSpendPence: 36000,
    menus: [
      {
        name: "Asian Sharing Feast",
        description: "Dumplings, curries, bao and noodles.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4700,
      },
      {
        name: "Tasting Menu",
        description: "Plated pan-Asian tasting journey.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 5300,
      },
      {
        name: "Bao Canapés",
        description: "Steamed bao and small bites with dipping sauces.",
        serviceStyle: "Canapés",
        pricePerHeadPence: 4100,
      },
    ],
    reviews: [
      { rating: 5, comment: "Such a fun and tasty spread, loved every dish.", authorName: "Pippa H." },
      { rating: 4, comment: "Great variety, the bao were delicious.", authorName: "Ade O." },
      { rating: 5, comment: "Mei was brilliant with our dietary needs.", authorName: "Carmen V." },
    ],
  },
  {
    name: "Omar Haddad",
    bio: "Lebanese feasts with a modern edge — mezze, mixed grills and fragrant desserts.",
    cuisines: "Lebanese",
    location: "London",
    pricePerHeadPence: 4500,
    minSpendPence: 33000,
    menus: [
      {
        name: "Mezze & Grill",
        description: "Full mezze spread with a mixed charcoal grill.",
        serviceStyle: "Buffet",
        pricePerHeadPence: 4500,
      },
      {
        name: "Feast Seated",
        description: "Plated Lebanese sharing dinner.",
        serviceStyle: "Seated & Plated",
        pricePerHeadPence: 4900,
      },
    ],
    reviews: [
      { rating: 5, comment: "Outstanding mezze, the grill was perfect.", authorName: "Zoe M." },
      { rating: 4, comment: "Delicious and very generous.", authorName: "Raef K." },
      { rating: 5, comment: "Omar made our celebration unforgettable.", authorName: "Tess D." },
      { rating: 4, comment: "Fragrant, fresh and full of flavour.", authorName: "Gus P." },
      { rating: 5, comment: "The baklava was the best I've tasted.", authorName: "Lena S." },
    ],
  },
];

async function main() {
  // Wipe in FK-safe order so autoincrement IDs are predictable on each run.
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.chef.deleteMany();
  await prisma.customer.deleteMany();

  const customersData = [
    { name: "Alice Johnson", email: "alice@example.com" },
    { name: "Bob Smith", email: "bob@example.com" },
    { name: "Priya Patel", email: "priya@example.com" },
    { name: "Tom Williams", email: "tom@example.com" },
  ];

  for (const c of customersData) {
    await prisma.customer.create({ data: c });
  }

  // Insert chefs (and their menus + reviews) in order so chef ids are 1..18.
  for (const chef of chefSeeds) {
    await prisma.chef.create({
      data: {
        name: chef.name,
        bio: chef.bio,
        cuisines: chef.cuisines,
        location: chef.location,
        pricePerHeadPence: chef.pricePerHeadPence,
        minSpendPence: chef.minSpendPence,
        imageUrl: "", // set below once we know the id
        active: true,
      },
    });
  }

  // Backfill deterministic image URLs keyed by id.
  const allChefs = await prisma.chef.findMany({ orderBy: { id: "asc" } });
  for (const chef of allChefs) {
    await prisma.chef.update({
      where: { id: chef.id },
      data: { imageUrl: `https://picsum.photos/seed/chef${chef.id}/400/300` },
    });
  }

  // Menus & reviews, inserted in chef order.
  for (let i = 0; i < chefSeeds.length; i++) {
    const chefId = allChefs[i].id;
    const seed = chefSeeds[i];
    for (const menu of seed.menus) {
      await prisma.menu.create({ data: { ...menu, chefId } });
    }
    for (const review of seed.reviews) {
      await prisma.review.create({ data: { ...review, chefId } });
    }
  }

  // Helper to look up a chef's base price + min spend for booking pricing.
  const chefById = new Map(allChefs.map((c) => [c.id, c]));

  type BookingSeed = {
    customerId: number;
    chefId: number;
    menuId?: number;
    perHeadPence: number;
    eventDate: string;
    guestCount: number;
    status: string;
    dietaryNotes?: string;
  };

  // ~12 bookings, inserted in order so ids are sequential & predictable.
  // - Alice (1) owns bookings 1 & 2; Bob (2) owns booking 3 (IDOR demo).
  // - Chef 3 confirmed on 2026-07-15 (availability/double-booking demo).
  // - Mixed statuses, dates spread July–Sept 2026, some dietary notes.
  const bookingSeeds: BookingSeed[] = [
    // 1 — Alice
    {
      customerId: 1,
      chefId: 1,
      perHeadPence: chefById.get(1)!.pricePerHeadPence,
      eventDate: "2026-07-04",
      guestCount: 10,
      status: "confirmed",
      dietaryNotes: "2 vegetarian, 1 nut allergy",
    },
    // 2 — Alice
    {
      customerId: 1,
      chefId: 5,
      perHeadPence: chefById.get(5)!.pricePerHeadPence,
      eventDate: "2026-08-22",
      guestCount: 8,
      status: "pending",
    },
    // 3 — Bob
    {
      customerId: 2,
      chefId: 2,
      perHeadPence: chefById.get(2)!.pricePerHeadPence,
      eventDate: "2026-07-19",
      guestCount: 12,
      status: "confirmed",
      dietaryNotes: "1 gluten free",
    },
    // 4 — Bob
    {
      customerId: 2,
      chefId: 8,
      perHeadPence: chefById.get(8)!.pricePerHeadPence,
      eventDate: "2026-09-05",
      guestCount: 6,
      status: "confirmed",
    },
    // 5 — Chef 3 confirmed on 2026-07-15 (availability demo)
    {
      customerId: 3,
      chefId: 3,
      perHeadPence: chefById.get(3)!.pricePerHeadPence,
      eventDate: "2026-07-15",
      guestCount: 14,
      status: "confirmed",
    },
    // 6 — Priya
    {
      customerId: 3,
      chefId: 11,
      perHeadPence: chefById.get(11)!.pricePerHeadPence,
      eventDate: "2026-08-08",
      guestCount: 9,
      status: "pending",
      dietaryNotes: "vegetarian table of 4",
    },
    // 7 — Tom
    {
      customerId: 4,
      chefId: 6,
      perHeadPence: chefById.get(6)!.pricePerHeadPence,
      eventDate: "2026-07-26",
      guestCount: 20,
      status: "confirmed",
    },
    // 8 — Tom
    {
      customerId: 4,
      chefId: 14,
      perHeadPence: chefById.get(14)!.pricePerHeadPence,
      eventDate: "2026-09-19",
      guestCount: 5,
      status: "cancelled",
    },
    // 9 — Alice (3rd booking, keeps ids 1&2 for the IDOR demo intact)
    {
      customerId: 1,
      chefId: 9,
      perHeadPence: chefById.get(9)!.pricePerHeadPence,
      eventDate: "2026-09-12",
      guestCount: 16,
      status: "confirmed",
    },
    // 10 — Priya
    {
      customerId: 3,
      chefId: 4,
      perHeadPence: chefById.get(4)!.pricePerHeadPence,
      eventDate: "2026-08-15",
      guestCount: 11,
      status: "confirmed",
      dietaryNotes: "no pork",
    },
    // 11 — Bob
    {
      customerId: 2,
      chefId: 16,
      perHeadPence: chefById.get(16)!.pricePerHeadPence,
      eventDate: "2026-07-11",
      guestCount: 7,
      status: "confirmed",
    },
    // 12 — Tom
    {
      customerId: 4,
      chefId: 12,
      perHeadPence: chefById.get(12)!.pricePerHeadPence,
      eventDate: "2026-08-29",
      guestCount: 4,
      status: "pending",
    },
  ];

  for (const b of bookingSeeds) {
    const chef = chefById.get(b.chefId)!;
    const pricing = computePricing({
      perHeadPence: b.perHeadPence,
      guestCount: b.guestCount,
      minSpendPence: chef.minSpendPence,
    });
    await prisma.booking.create({
      data: {
        customerId: b.customerId,
        chefId: b.chefId,
        menuId: b.menuId ?? null,
        eventDate: new Date(`${b.eventDate}T00:00:00.000Z`),
        guestCount: b.guestCount,
        status: b.status,
        dietaryNotes: b.dietaryNotes ?? null,
        perHeadPence: b.perHeadPence,
        subtotalPence: pricing.subtotalPence,
        minSpendTopUpPence: pricing.minSpendTopUpPence,
        serviceFeePence: pricing.serviceFeePence,
        totalPence: pricing.totalPence,
      },
    });
  }

  const [customerCount, chefCount, menuCount, reviewCount, bookingCount] =
    await Promise.all([
      prisma.customer.count(),
      prisma.chef.count(),
      prisma.menu.count(),
      prisma.review.count(),
      prisma.booking.count(),
    ]);

  console.log("Seed complete:");
  console.log(`  Customers: ${customerCount}`);
  console.log(`  Chefs:     ${chefCount}`);
  console.log(`  Menus:     ${menuCount}`);
  console.log(`  Reviews:   ${reviewCount}`);
  console.log(`  Bookings:  ${bookingCount}`);
  console.log("");
  console.log("Login customer ids (x-customer-id):");
  console.log("  1 = Alice Johnson  (owns bookings 1 & 2)");
  console.log("  2 = Bob Smith      (owns booking 3)");
  console.log("  3 = Priya Patel");
  console.log("  4 = Tom Williams");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
