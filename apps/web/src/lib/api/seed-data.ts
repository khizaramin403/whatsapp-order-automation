import type {
  Restaurant,
  User,
  MenuCategory,
  MenuItem,
  MenuTranslation,
  Order,
  OrderEvent,
  Customer,
} from "@app/shared";

export const RESTAURANT_ID = "rest-pc-001";

// 1. One Hotel / Restaurant
export const seedRestaurant: Restaurant = {
  id: RESTAURANT_ID,
  name: "Pearl Continental Hotel & Suites",
  timezone: "Asia/Karachi",
  currency: "PKR",
  default_language: "en",
  delivery_fee: 15000, // 150.00 PKR
  minimum_order: 50000, // 500.00 PKR
  is_active: true,
  delivery_area: "Gulberg, DHA Phase 1-5, Model Town, Cantt, Mall Road",
  payment_account: "Meezan Bank - IBAN: PK36MEZN00012345678901 - Title: Pearl Continental Food Ops",
  payment_instructions:
    "Please transfer the total amount via Raast or Online Banking and upload the screenshot here. / يرجى تحويل المبلغ عبر الحساب البنكي وإرسال الإشعار.",
  bot_welcome_en: "Welcome to Pearl Continental Hotel & Suites! How may we delight you today?",
  bot_welcome_ar: "مرحباً بكم في فندق بيرل كونتيننتال! كيف يمكننا خدمتكم اليوم؟",
  bot_welcome_ur: "Pearl Continental mein khush-aamdeed! Aaj aap kya mangwana pasand karein ge?",
  bot_payment_en: "Thank you for your order! Please transfer the total to our bank account and send us the payment screenshot.",
  bot_payment_ar: "شكراً لطلبكم! يرجى تحويل إجمالي المبلغ لحسابنا البنكي وإرسال صورة الإشعار هنا.",
  bot_payment_ur: "Aap ke order ka shukriya! Barah-e-karam raqam hamaray bank account mein transfer kar ke screenshot yahan bheinjein.",
  email_notifications: true,
  daily_summary_email: true,
  push_notifications: true,
  sound_notifications: true,
  notification_email: "orders@pearlcontinental.mock",
  open_hours: {
    monday: { open: "11:00", close: "23:30" },
    tuesday: { open: "11:00", close: "23:30" },
    wednesday: { open: "11:00", close: "23:30" },
    thursday: { open: "11:00", close: "23:30" },
    friday: { open: "13:00", close: "00:00" },
    saturday: { open: "11:00", close: "00:00" },
    sunday: { open: "11:00", close: "23:30" },
  },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-11-20T10:00:00.000Z",
};

// 2. The 4 Staff Roles (Section 10.3)
export const seedUsers: User[] = [
  {
    id: "user-owner-01",
    restaurant_id: RESTAURANT_ID,
    name: "Ali Raza",
    email: "ali@pearlcontinental.mock",
    role: "owner",
    language: "en",
    avatar_key: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "user-mgr-01",
    restaurant_id: RESTAURANT_ID,
    name: "Tariq Khan",
    email: "tariq@pearlcontinental.mock",
    role: "manager",
    language: "en",
    avatar_key: null,
    is_active: true,
    created_at: "2026-01-15T00:00:00.000Z",
  },
  {
    id: "user-chef-01",
    restaurant_id: RESTAURANT_ID,
    name: "Chef Bilal Ahmed",
    email: "bilal@pearlcontinental.mock",
    role: "chef",
    language: "ur-Latn",
    avatar_key: null,
    is_active: true,
    created_at: "2026-02-01T00:00:00.000Z",
  },
  {
    id: "user-rider-01",
    restaurant_id: RESTAURANT_ID,
    name: "Hamza Malik",
    email: "hamza@pearlcontinental.mock",
    role: "rider",
    language: "ur-Latn",
    avatar_key: null,
    is_active: true,
    created_at: "2026-02-10T00:00:00.000Z",
  },
];

// 3. Menu Categories (3 categories)
export const seedCategories: MenuCategory[] = [
  {
    id: "cat-01",
    restaurant_id: RESTAURANT_ID,
    sort_order: 1,
    name: "Main Dishes",
    translations: [
      {
        id: "trans-cat-01-en",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-01",
        language: "en",
        name: "Main Dishes",
        description: "Signature rice, curries and grilled delicacies",
        aliases: ["mains", "curry", "rice"],
      },
      {
        id: "trans-cat-01-ar",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-01",
        language: "ar",
        name: "الأطباق الرئيسية",
        description: "أطباق الأرز والإيدام والمشاوي الفاخرة",
        aliases: ["اطباق رئيسية", "ارز", "مشاوي"],
      },
      {
        id: "trans-cat-01-ur",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-01",
        language: "ur-Latn",
        name: "Khaas Pakwaan",
        description: "Biryani, karahi aur lazeez salan",
        aliases: ["khaas pakwaan", "salan", "chawal"],
      },
    ],
  },
  {
    id: "cat-02",
    restaurant_id: RESTAURANT_ID,
    sort_order: 2,
    name: "Breads & Sides",
    translations: [
      {
        id: "trans-cat-02-en",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-02",
        language: "en",
        name: "Breads & Sides",
        description: "Freshly baked tandoori naans, dips and fresh salads",
        aliases: ["breads", "naan", "sides", "roti"],
      },
      {
        id: "trans-cat-02-ar",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-02",
        language: "ar",
        name: "الخبز والمقبلات",
        description: "خبز تنور طازج والمقبلات والسلطات",
        aliases: ["خبز", "مقبلات", "سلطات"],
      },
      {
        id: "trans-cat-02-ur",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-02",
        language: "ur-Latn",
        name: "Roti Aur Chatni",
        description: "Taza naan, roghani roti aur chatpate laawazmaat",
        aliases: ["roti", "naan", "raita", "salad"],
      },
    ],
  },
  {
    id: "cat-03",
    restaurant_id: RESTAURANT_ID,
    sort_order: 3,
    name: "Desserts & Beverages",
    translations: [
      {
        id: "trans-cat-03-en",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-03",
        language: "en",
        name: "Desserts & Beverages",
        description: "Traditional sweets, karak chai and chilled refreshments",
        aliases: ["desserts", "sweets", "drinks", "beverages"],
      },
      {
        id: "trans-cat-03-ar",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-03",
        language: "ar",
        name: "الحلويات والمشروبات",
        description: "حلويات شرقية أصيلة وشاي كرك ومشروبات باردة",
        aliases: ["حلويات", "مشروبات", "عصائر", "شاي"],
      },
      {
        id: "trans-cat-03-ur",
        restaurant_id: RESTAURANT_ID,
        entity_type: "category",
        entity_id: "cat-03",
        language: "ur-Latn",
        name: "Meetha Aur Mashroobaat",
        description: "Mithaiyan, garam karak chai aur thanday sharbat",
        aliases: ["meetha", "mithai", "chai", "sharbat"],
      },
    ],
  },
];

// Helper to construct menu item with 3 language translations
function createMenuItem(
  id: string,
  categoryId: string,
  priceMinor: number,
  imageUrl: string | null,
  sortOrder: number,
  translationsData: {
    en: { name: string; desc: string; aliases: string[] };
    ar: { name: string; desc: string; aliases: string[] };
    ur: { name: string; desc: string; aliases: string[] };
  }
): MenuItem {
  const translations: MenuTranslation[] = [
    {
      id: `trans-${id}-en`,
      restaurant_id: RESTAURANT_ID,
      entity_type: "item",
      entity_id: id,
      language: "en",
      name: translationsData.en.name,
      description: translationsData.en.desc,
      aliases: translationsData.en.aliases,
    },
    {
      id: `trans-${id}-ar`,
      restaurant_id: RESTAURANT_ID,
      entity_type: "item",
      entity_id: id,
      language: "ar",
      name: translationsData.ar.name,
      description: translationsData.ar.desc,
      aliases: translationsData.ar.aliases,
    },
    {
      id: `trans-${id}-ur`,
      restaurant_id: RESTAURANT_ID,
      entity_type: "item",
      entity_id: id,
      language: "ur-Latn",
      name: translationsData.ur.name,
      description: translationsData.ur.desc,
      aliases: translationsData.ur.aliases,
    },
  ];

  return {
    id,
    restaurant_id: RESTAURANT_ID,
    category_id: categoryId,
    price: priceMinor,
    image_url: imageUrl,
    is_available: true,
    sort_order: sortOrder,
    name: translationsData.en.name,
    translations,
  };
}

// 4. 15 Menu Items across the 3 categories
export const seedMenuItems: MenuItem[] = [
  // Category 1: Main Dishes
  createMenuItem(
    "item-01",
    "cat-01",
    58000, // Rs 580
    "/images/biryani.jpg",
    1,
    {
      en: {
        name: "Special Chicken Biryani",
        desc: "Aromatic basmati rice cooked with tender marinated chicken and saffron",
        aliases: ["biryani", "chicken biryani", "special biryani"],
      },
      ar: {
        name: "برياني دجاج خاص",
        desc: "أرز بسمتي فاخر مطبوخ مع قطع الدجاج المتبلة والزعفران",
        aliases: ["برياني", "برياني دجاج", "رز دجاج"],
      },
      ur: {
        name: "Khaas Chicken Biryani",
        desc: "Zafrani basmati chawal lazeez murgh ke gosht ke sath",
        aliases: ["biryani", "murgh biryani", "special biryani"],
      },
    }
  ),
  createMenuItem(
    "item-02",
    "cat-01",
    165000, // Rs 1,650
    "/images/mutton-karahi.jpg",
    2,
    {
      en: {
        name: "Shinwari Mutton Karahi (Half Kg)",
        desc: "Fresh lamb wok-cooked with tomatoes, green chillies and fresh ginger",
        aliases: ["karahi", "mutton karahi", "shinwari karahi"],
      },
      ar: {
        name: "كراهي لحم ضأن شينواري",
        desc: "لحم ضأن طازج مطهو في مقلاة الووك مع الطماطم والفلفل والزنجبيل",
        aliases: ["كراهي", "لحم ضان", "مقلقل"],
      },
      ur: {
        name: "Shinwari Mutton Karahi",
        desc: "Taza bakray ka gosht tamatar aur desi masalon mein pakaya gaya",
        aliases: ["mutton karahi", "gosht karahi", "shinwari"],
      },
    }
  ),
  createMenuItem(
    "item-03",
    "cat-01",
    42000, // Rs 420
    "/images/chicken-tikka.jpg",
    3,
    {
      en: {
        name: "Charcoal Chicken Tikka (Breast/Leg)",
        desc: "Traditional smoky char-grilled quarter chicken marinated in yogurt and spices",
        aliases: ["tikka", "chicken tikka", "bbq tikka"],
      },
      ar: {
        name: "تكا دجاج على الفحم",
        desc: "ربع دجاجة مشوية على الفحم متبلة بالزبادي والبهارات الشرقية",
        aliases: ["تكا", "تكا دجاج", "مشاوي دجاج"],
      },
      ur: {
        name: "Koyla Chicken Tikka",
        desc: "Koyle par seki hui lazeez dahi masalay wali tikka boti",
        aliases: ["chicken tikka", "tikka", "bbq"],
      },
    }
  ),
  createMenuItem(
    "item-04",
    "cat-01",
    48000, // Rs 480
    "/images/seekh-kabab.jpg",
    4,
    {
      en: {
        name: "Beef Seekh Kabab (4 Skewers)",
        desc: "Minced prime beef skewers infused with herbs, coriander and spices",
        aliases: ["seekh kabab", "kabab", "kebab", "beef kabab"],
      },
      ar: {
        name: "كباب لحم سيخ (٤ أسياخ)",
        desc: "لحم بقري مفروم مشوي على السيخ بنكهة الكزبرة والبهارات",
        aliases: ["كباب", "كباب سيخ", "كباب لحم"],
      },
      ur: {
        name: "Beef Seekh Kabab (4 Seekhein)",
        desc: "Bare gosht ka qeema khas desi masalon ke sath buniya gaya",
        aliases: ["seekh kabab", "kabab", "beef kabab"],
      },
    }
  ),
  createMenuItem(
    "item-05",
    "cat-01",
    95000, // Rs 950
    "/images/butter-chicken.jpg",
    5,
    {
      en: {
        name: "Royal Butter Chicken",
        desc: "Boneless grilled tandoori chicken simmered in creamy velvety tomato gravy",
        aliases: ["butter chicken", "murgh makhani", "makhani"],
      },
      ar: {
        name: "دجاج بالزبدة ملكي",
        desc: "قطع دجاج مسحب في صلصة الطماطم الغنية بالزبدة والقشطة",
        aliases: ["دجاج بالزبدة", "بتر تشيكن", "مكهاني"],
      },
      ur: {
        name: "Shahi Makhani Murgh",
        desc: "Boneless murgh makkhan aur malai ki graviy mein tayaar",
        aliases: ["butter chicken", "makhani murgh"],
      },
    }
  ),
  createMenuItem(
    "item-06",
    "cat-01",
    38000, // Rs 380
    "/images/daal-makhani.jpg",
    6,
    {
      en: {
        name: "Slow-Cooked Daal Makhani",
        desc: "Black lentils and red kidney beans simmered overnight with butter and cream",
        aliases: ["daal", "daal makhani", "lentils"],
      },
      ar: {
        name: "دال مخاني مطبوخة ببطء",
        desc: "عدس أسود مطهو على نار هادئة بالزبدة والقشطة الطازجة",
        aliases: ["دال", "دال مخاني", "عدس"],
      },
      ur: {
        name: "Dum Daal Makhani",
        desc: "Kaali daal aur rajma makkhan ke tarke ke sath",
        aliases: ["daal makhani", "daal"],
      },
    }
  ),

  // Category 2: Breads & Sides
  createMenuItem(
    "item-07",
    "cat-02",
    12000, // Rs 120
    "/images/garlic-naan.jpg",
    7,
    {
      en: {
        name: "Garlic Butter Naan",
        desc: "Oven-baked flatbread brushed with crushed garlic and melted butter",
        aliases: ["garlic naan", "naan", "garlic bread"],
      },
      ar: {
        name: "نان بالثوم والزبدة",
        desc: "خبز تنور طازج مدهون بالثوم المفروم والزبدة الذائبة",
        aliases: ["نان ثوم", "خبز ثوم", "نان بالثوم"],
      },
      ur: {
        name: "Garlic Butter Naan",
        desc: "Tandoori naan lehsan aur makkhan ke sath",
        aliases: ["garlic naan", "lehsan naan"],
      },
    }
  ),
  createMenuItem(
    "item-08",
    "cat-02",
    10000, // Rs 100
    "/images/roghani-naan.jpg",
    8,
    {
      en: {
        name: "Special Roghani Naan",
        desc: "Soft pillow-like naan topped with toasted sesame seeds and milk glaze",
        aliases: ["roghani naan", "sesame naan"],
      },
      ar: {
        name: "نان روغني بالسمسم",
        desc: "خبز رطب وهش مغطى بحبوب السمسم المحمصة",
        aliases: ["نان روغني", "خبز سمسم"],
      },
      ur: {
        name: "Khaas Roghani Naan",
        desc: "Narm o mulaim naan til aur doodh ki polish ke sath",
        aliases: ["roghani naan", "til wala naan"],
      },
    }
  ),
  createMenuItem(
    "item-09",
    "cat-02",
    4000, // Rs 40
    "/images/tandoori-roti.jpg",
    9,
    {
      en: {
        name: "Crispy Tandoori Roti",
        desc: "Whole wheat rustic flatbread baked in the clay oven",
        aliases: ["roti", "tandoori roti", "chapati"],
      },
      ar: {
        name: "خبز روتي التنور",
        desc: "خبز القمح الكامل الكلاسيكي المخبوز في التنور",
        aliases: ["خبز روتي", "روتي تنور"],
      },
      ur: {
        name: "Tandoori Roti",
        desc: "Gandam ka garam tandoori phulka",
        aliases: ["tandoori roti", "saada roti"],
      },
    }
  ),
  createMenuItem(
    "item-10",
    "cat-02",
    15000, // Rs 150
    "/images/salad-raita.jpg",
    10,
    {
      en: {
        name: "Zeera Raita & Kachumber Salad",
        desc: "Chilled cumin yogurt dip paired with freshly diced cucumber, onions and mint",
        aliases: ["raita", "salad", "kachumber"],
      },
      ar: {
        name: "سلطة كتشومبر مع رايتا الكمون",
        desc: "زبادي بارد بالكمون والنعناع مع سلطة خيار وبصل وطماطم",
        aliases: ["رايتا", "سلطة", "زبادي"],
      },
      ur: {
        name: "Zeera Raita Aur Kachumber Salad",
        desc: "Thanda dahi ka raita aur taza kati hui salaad",
        aliases: ["raita", "salad", "dahi"],
      },
    }
  ),
  createMenuItem(
    "item-11",
    "cat-02",
    32000, // Rs 320
    "/images/hummus.jpg",
    11,
    {
      en: {
        name: "Traditional Hummus with Pita",
        desc: "Smooth creamy chickpea dip blended with tahini, olive oil and warm pita bread",
        aliases: ["hummus", "chickpea dip", "pita"],
      },
      ar: {
        name: "حمص شامي فاخر مع خبز بيتا",
        desc: "مسبحة حمص ناعمة بالطحينة وزيت الزيتون البكر مع خبز ساخن",
        aliases: ["حمص", "مقبلات حمص"],
      },
      ur: {
        name: "Hummus Aur Pita Bread",
        desc: "Safaid chanay aur zaitoon ke tail ki lazeez chatni pita roti ke sath",
        aliases: ["hummus", "pita bread"],
      },
    }
  ),

  // Category 3: Desserts & Beverages
  createMenuItem(
    "item-12",
    "cat-03",
    22000, // Rs 220
    "/images/gulab-jamun.jpg",
    12,
    {
      en: {
        name: "Warm Gulab Jamun (2 Pieces)",
        desc: "Deep-fried milk dumplings soaked in cardamom and rosewater sugar syrup",
        aliases: ["gulab jamun", "sweet", "dessert"],
      },
      ar: {
        name: "جلاب جامون دافئ (قطعتان)",
        desc: "كرات الحليب المقلية والمغمورة في قطر الهيل وماء الورد",
        aliases: ["جلاب جامون", "حلوى هندية"],
      },
      ur: {
        name: "Garam Gulab Jamun (Do Adad)",
        desc: "Elaichi ke sheeray mein doobay khoyay ke gulab jamun",
        aliases: ["gulab jamun", "meetha"],
      },
    }
  ),
  createMenuItem(
    "item-13",
    "cat-03",
    28000, // Rs 280
    "/images/kheer.jpg",
    13,
    {
      en: {
        name: "Shahi Matka Kheer",
        desc: "Slow-cooked rice pudding infused with saffron, garnished with pistachios and almonds",
        aliases: ["kheer", "matka kheer", "pudding"],
      },
      ar: {
        name: "خير ملكي في إناء فخاري",
        desc: "مهلبية أرز تقليدية بالزعفران ومزينة بالفستق واللوز",
        aliases: ["خير", "مهلبية", "رز بالحليب"],
      },
      ur: {
        name: "Shahi Matka Kheer",
        desc: "Zafran, pista aur badaam se saji hui tandi kheer",
        aliases: ["shahi kheer", "kheer", "firni"],
      },
    }
  ),
  createMenuItem(
    "item-14",
    "cat-03",
    14000, // Rs 140
    "/images/chai.jpg",
    14,
    {
      en: {
        name: "Karak Doodh Patti Chai",
        desc: "Strong aromatic tea brewed directly in rich milk with crushed green cardamom",
        aliases: ["chai", "tea", "karak chai", "doodh patti"],
      },
      ar: {
        name: "شاي كرك أصيل بالحليب والهيل",
        desc: "شاي أسود ثقيل مطهو بالحليب المركز وحبات الهيل الأخضر",
        aliases: ["شاي كرك", "شاي حليب", "كرك"],
      },
      ur: {
        name: "Karak Doodh Patti Chai",
        desc: "Elaichi ke sath paki hui garam karak chai",
        aliases: ["karak chai", "doodh patti", "chai"],
      },
    }
  ),
  createMenuItem(
    "item-15",
    "cat-03",
    26000, // Rs 260
    "/images/mango-lassi.jpg",
    15,
    {
      en: {
        name: "Alphonso Mango Lassi",
        desc: "Sweet and creamy chilled yogurt beverage blended with ripe mango pulp",
        aliases: ["mango lassi", "lassi", "mango shake"],
      },
      ar: {
        name: "لاسي مانجو بارد",
        desc: "شراب الزبادي المثلج المخفوق مع لب المانجو الطبيعي",
        aliases: ["لاسي مانجو", "عصير مانجو"],
      },
      ur: {
        name: "Aam Ki Meethi Lassi",
        desc: "Taza meethay aam aur dahi ki thandi lassi",
        aliases: ["mango lassi", "aam lassi"],
      },
    }
  ),
];

// 5. Realistic Customers with English, Arabic, and Roman Urdu names
export const seedCustomers: Customer[] = [
  {
    id: "cust-01",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234501",
    name: "Zubair Al-Mansoor",
    language: "ar",
    last_address: "Apartment 4B, Executive Residency, Gulberg III, Lahore",
  },
  {
    id: "cust-02",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234502",
    name: "Fatima Zahra",
    language: "ur-Latn",
    last_address: "House 18, Street 4, Sector W, DHA Phase 3, Lahore",
  },
  {
    id: "cust-03",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234503",
    name: "Usman Qureshi",
    language: "en",
    last_address: "Villa 92, Block B, Model Town, Lahore",
  },
  {
    id: "cust-04",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234504",
    name: "Ahmed Al-Harbi",
    language: "ar",
    last_address: "Penthouse 12, Gold Crest Mall, DHA Phase 4, Lahore",
  },
  {
    id: "cust-05",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234505",
    name: "Sana Mir",
    language: "ur-Latn",
    last_address: "House 77, Sarwar Road, Cantt, Lahore",
  },
  {
    id: "cust-06",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234506",
    name: "Muhammad Tariq",
    language: "en",
    last_address: "Office 301, Pace Tower, Gulberg II, Lahore",
  },
  {
    id: "cust-07",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234507",
    name: "Ayesha Bibi",
    language: "ur-Latn",
    last_address: "Flat 3, Sector J, DHA Phase 5, Lahore",
  },
  {
    id: "cust-08",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234508",
    name: "Khalid Bin Waleed",
    language: "ar",
    last_address: "House 104, Sector Y, DHA Phase 3, Lahore",
  },
  {
    id: "cust-09",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234509",
    name: "Maryam Siddiqui",
    language: "en",
    last_address: "House 45, Street 12, Cavalry Ground, Lahore",
  },
  {
    id: "cust-10",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234510",
    name: "Omar Farooq",
    language: "ar",
    last_address: "Suite 502, Pearl Continental Hotel, Mall Road",
  },
  {
    id: "cust-11",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234511",
    name: "Zainab Naeem",
    language: "ur-Latn",
    last_address: "House 211, Block C, Gulberg III, Lahore",
  },
  {
    id: "cust-12",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234512",
    name: "Bilal Mustafa",
    language: "en",
    last_address: "House 55, Street 2, Sector C, DHA Phase 1, Lahore",
  },
  {
    id: "cust-13",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234513",
    name: "Huda Al-Qahtani",
    language: "ar",
    last_address: "Royal Villa 7, Askari 10, Airport Road, Lahore",
  },
  {
    id: "cust-14",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234514",
    name: "Hamza Rasheed",
    language: "ur-Latn",
    last_address: "House 89, Main Boulevard, Model Town, Lahore",
  },
  {
    id: "cust-15",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234515",
    name: "Saad Javed",
    language: "en",
    last_address: "House 12B, Zafar Ali Road, Gulberg V, Lahore",
  },
  {
    id: "cust-16",
    restaurant_id: RESTAURANT_ID,
    phone: "+923001234516",
    name: "Farhan Saeed",
    language: "ur-Latn",
    last_address: "House 40, Sector G, DHA Phase 5, Lahore",
  },
];

// Placeholder SVG data URL for payment proof screenshots
export const PLACEHOLDER_PAYMENT_PROOF_DATA_URL =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'><rect width='400' height='600' fill='%23F4ECDC'/><rect x='20' y='20' width='360' height='560' rx='12' fill='%23FFFFFF' stroke='%23C7A667' stroke-width='2'/><text x='200' y='70' font-family='sans-serif' font-size='18' font-weight='bold' fill='%2310202D' text-anchor='middle'>Meezan Bank Raast</text><text x='200' y='95' font-family='sans-serif' font-size='12' fill='%232F7D5B' text-anchor='middle'>Transaction Successful ✓</text><line x1='40' y1='120' x2='360' y2='120' stroke='%23E2E5E9'/><text x='50' y='160' font-family='sans-serif' font-size='13' fill='%235F6C79'>Date &amp; Time:</text><text x='350' y='160' font-family='sans-serif' font-size='13' font-weight='bold' fill='%2310202D' text-anchor='end'>Today</text><text x='50' y='200' font-family='sans-serif' font-size='13' fill='%235F6C79'>Recipient:</text><text x='350' y='200' font-family='sans-serif' font-size='12' font-weight='bold' fill='%2310202D' text-anchor='end'>Pearl Continental Food Ops</text><text x='50' y='240' font-family='sans-serif' font-size='13' fill='%235F6C79'>Amount Transferred:</text><text x='350' y='240' font-family='sans-serif' font-size='18' font-weight='bold' fill='%2310202D' text-anchor='end'>Rs. Verified</text><text x='50' y='280' font-family='sans-serif' font-size='13' fill='%235F6C79'>Ref / TID:</text><text x='350' y='280' font-family='sans-serif' font-size='11' fill='%234A5865' text-anchor='end'>PK-RAAST-89214710</text><rect x='50' y='320' width='300' height='80' rx='8' fill='%23E6F2EC'/><text x='200' y='355' font-family='sans-serif' font-size='13' font-weight='bold' fill='%231F5C42' text-anchor='middle'>CONFIRMED BY BANK</text><text x='200' y='375' font-family='sans-serif' font-size='11' fill='%231F5C42' text-anchor='middle'>Funds credited to merchant account</text><text x='200' y='540' font-family='sans-serif' font-size='10' fill='%23A9B4BE' text-anchor='middle'>Payment screenshot proof</text></svg>";

// 6. Generate 40 orders across all statuses, mix of delivery / dine-in, COD / online
export function generateSeedOrders(): Order[] {
  const orders: Order[] = [];

  interface OrderSeedConfig {
    num: number;
    status: Order["status"];
    type: Order["type"];
    paymentMethod: Order["payment_method"];
    paymentStatus: Order["payment_status"];
    custIdx: number;
    itemIndices: number[]; // indices in seedMenuItems
    minutesAgo: number;
    hasProof?: boolean;
    tableNote?: string;
  }

  const configs: OrderSeedConfig[] = [
    // 6 PENDING
    { num: 1001, status: "PENDING", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 0, itemIndices: [0, 6, 9], minutesAgo: 3 },
    { num: 1002, status: "PENDING", type: "delivery", paymentMethod: "online", paymentStatus: "pending_check", custIdx: 1, itemIndices: [1, 7, 13], minutesAgo: 7, hasProof: true },
    { num: 1003, status: "PENDING", type: "dine_in", paymentMethod: "cod", paymentStatus: "pending", custIdx: 2, itemIndices: [2, 6, 14], minutesAgo: 10, tableNote: "Table 4, Terrace Hall" },
    { num: 1004, status: "PENDING", type: "delivery", paymentMethod: "online", paymentStatus: "pending", custIdx: 3, itemIndices: [4, 7, 11], minutesAgo: 12 },
    { num: 1005, status: "PENDING", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 4, itemIndices: [0, 3, 13], minutesAgo: 15 },
    { num: 1006, status: "PENDING", type: "dine_in", paymentMethod: "online", paymentStatus: "pending_check", custIdx: 5, itemIndices: [1, 6, 12], minutesAgo: 18, hasProof: true, tableNote: "Table 8, Executive Lounge" },

    // 6 ACCEPTED
    { num: 1007, status: "ACCEPTED", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 6, itemIndices: [0, 6, 13], minutesAgo: 22 },
    { num: 1008, status: "ACCEPTED", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 7, itemIndices: [2, 7, 9], minutesAgo: 25, hasProof: true },
    { num: 1009, status: "ACCEPTED", type: "dine_in", paymentMethod: "cod", paymentStatus: "pending", custIdx: 8, itemIndices: [3, 6, 14], minutesAgo: 28, tableNote: "Table 2, Main Dining" },
    { num: 1010, status: "ACCEPTED", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 9, itemIndices: [4, 7, 11], minutesAgo: 30 },
    { num: 1011, status: "ACCEPTED", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 10, itemIndices: [1, 8, 12], minutesAgo: 33, hasProof: true },
    { num: 1012, status: "ACCEPTED", type: "dine_in", paymentMethod: "cod", paymentStatus: "pending", custIdx: 11, itemIndices: [0, 9, 13], minutesAgo: 36, tableNote: "Table 11, Garden Patio" },

    // 6 PREPARING
    { num: 1013, status: "PREPARING", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 12, itemIndices: [0, 2, 6], minutesAgo: 40 },
    { num: 1014, status: "PREPARING", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 13, itemIndices: [1, 7, 14], minutesAgo: 42, hasProof: true },
    { num: 1015, status: "PREPARING", type: "dine_in", paymentMethod: "cod", paymentStatus: "pending", custIdx: 14, itemIndices: [4, 6, 11], minutesAgo: 45, tableNote: "Table 5, Royal Dining" },
    { num: 1016, status: "PREPARING", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 15, itemIndices: [3, 7, 9], minutesAgo: 48 },
    { num: 1017, status: "PREPARING", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 0, itemIndices: [0, 8, 13], minutesAgo: 50, hasProof: true },
    { num: 1018, status: "PREPARING", type: "dine_in", paymentMethod: "online", paymentStatus: "verified", custIdx: 1, itemIndices: [2, 6, 12], minutesAgo: 54, hasProof: true, tableNote: "Table 7, Poolside" },

    // 5 READY
    { num: 1019, status: "READY", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 2, itemIndices: [0, 6, 13], minutesAgo: 58 },
    { num: 1020, status: "READY", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 3, itemIndices: [1, 7, 9], minutesAgo: 62, hasProof: true },
    { num: 1021, status: "READY", type: "dine_in", paymentMethod: "cod", paymentStatus: "pending", custIdx: 4, itemIndices: [4, 6, 14], minutesAgo: 65, tableNote: "Table 3, Corner Booth" },
    { num: 1022, status: "READY", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 5, itemIndices: [3, 8, 11], minutesAgo: 68 },
    { num: 1023, status: "READY", type: "dine_in", paymentMethod: "online", paymentStatus: "verified", custIdx: 6, itemIndices: [0, 2, 12], minutesAgo: 72, hasProof: true, tableNote: "Table 14, Terrace" },

    // 5 OUT_FOR_DELIVERY
    { num: 1024, status: "OUT_FOR_DELIVERY", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 7, itemIndices: [0, 6, 13], minutesAgo: 80 },
    { num: 1025, status: "OUT_FOR_DELIVERY", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 8, itemIndices: [1, 7, 9], minutesAgo: 85, hasProof: true },
    { num: 1026, status: "OUT_FOR_DELIVERY", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 9, itemIndices: [2, 6, 14], minutesAgo: 90 },
    { num: 1027, status: "OUT_FOR_DELIVERY", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 10, itemIndices: [4, 7, 11], minutesAgo: 95, hasProof: true },
    { num: 1028, status: "OUT_FOR_DELIVERY", type: "delivery", paymentMethod: "cod", paymentStatus: "pending", custIdx: 11, itemIndices: [3, 8, 12], minutesAgo: 100 },

    // 8 DELIVERED (Order History)
    { num: 1029, status: "DELIVERED", type: "delivery", paymentMethod: "cod", paymentStatus: "verified", custIdx: 12, itemIndices: [0, 6], minutesAgo: 130 },
    { num: 1030, status: "DELIVERED", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 13, itemIndices: [1, 7, 13], minutesAgo: 160, hasProof: true },
    { num: 1031, status: "DELIVERED", type: "delivery", paymentMethod: "cod", paymentStatus: "verified", custIdx: 14, itemIndices: [2, 8, 9], minutesAgo: 190 },
    { num: 1032, status: "DELIVERED", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 15, itemIndices: [4, 6, 14], minutesAgo: 220, hasProof: true },
    { num: 1033, status: "DELIVERED", type: "delivery", paymentMethod: "cod", paymentStatus: "verified", custIdx: 0, itemIndices: [0, 3, 11], minutesAgo: 250 },
    { num: 1034, status: "DELIVERED", type: "delivery", paymentMethod: "online", paymentStatus: "verified", custIdx: 1, itemIndices: [1, 7, 12], minutesAgo: 290, hasProof: true },
    { num: 1035, status: "DELIVERED", type: "delivery", paymentMethod: "cod", paymentStatus: "verified", custIdx: 2, itemIndices: [2, 6, 13], minutesAgo: 320 },
    { num: 1036, status: "DELIVERED", type: "delivery", paymentMethod: "cod", paymentStatus: "verified", custIdx: 3, itemIndices: [0, 8, 9], minutesAgo: 360 },

    // 2 COMPLETED (Dine-in History)
    { num: 1037, status: "COMPLETED", type: "dine_in", paymentMethod: "cod", paymentStatus: "verified", custIdx: 4, itemIndices: [0, 2, 6, 13], minutesAgo: 140, tableNote: "Table 1, Window Side" },
    { num: 1038, status: "COMPLETED", type: "dine_in", paymentMethod: "online", paymentStatus: "verified", custIdx: 5, itemIndices: [1, 7, 14], minutesAgo: 200, hasProof: true, tableNote: "Table 6, Courtyard" },

    // 2 CANCELLED
    { num: 1039, status: "CANCELLED", type: "delivery", paymentMethod: "cod", paymentStatus: "failed", custIdx: 6, itemIndices: [0, 6], minutesAgo: 180 },
    { num: 1040, status: "CANCELLED", type: "delivery", paymentMethod: "online", paymentStatus: "not_received", custIdx: 7, itemIndices: [4, 7], minutesAgo: 240 },

    // 2 REJECTED
    { num: 1041, status: "REJECTED", type: "delivery", paymentMethod: "cod", paymentStatus: "failed", custIdx: 8, itemIndices: [1, 6], minutesAgo: 300 },
    { num: 1042, status: "REJECTED", type: "delivery", paymentMethod: "online", paymentStatus: "not_received", custIdx: 9, itemIndices: [2, 8], minutesAgo: 340 },
  ];

  const now = Date.now();

  for (const cfg of configs) {
    const cust = seedCustomers[cfg.custIdx % seedCustomers.length];
    const orderId = `order-${cfg.num}`;
    const createdAt = new Date(now - cfg.minutesAgo * 60 * 1000).toISOString();

    const selectedItems = cfg.itemIndices.map((idx, itemIdx) => {
      const menuItem = seedMenuItems[idx % seedMenuItems.length];
      return {
        id: `oi-${cfg.num}-${itemIdx + 1}`,
        order_id: orderId,
        menu_item_id: menuItem.id,
        name_snapshot: menuItem.name || "Special Item",
        price_snapshot: menuItem.price,
        qty: itemIdx === 0 ? 2 : 1,
      };
    });

    const subtotal = selectedItems.reduce((acc, it) => acc + it.price_snapshot * it.qty, 0);
    const deliveryFee = cfg.type === "delivery" ? seedRestaurant.delivery_fee : 0;
    const total = subtotal + deliveryFee;

    // Timeline events
    const events: OrderEvent[] = [
      {
        id: `evt-${cfg.num}-1`,
        order_id: orderId,
        status: "PENDING",
        by_user_id: null,
        by_user_name: "Customer (WhatsApp Bot)",
        note: "Order placed via WhatsApp",
        created_at: createdAt,
      },
    ];

    if (cfg.status !== "PENDING") {
      events.push({
        id: `evt-${cfg.num}-2`,
        order_id: orderId,
        status: cfg.status === "REJECTED" ? "REJECTED" : "ACCEPTED",
        by_user_id: "user-mgr-01",
        by_user_name: "Tariq Khan (Manager)",
        note: cfg.status === "REJECTED" ? "Kitchen at capacity" : "Order accepted",
        created_at: new Date(new Date(createdAt).getTime() + 3 * 60 * 1000).toISOString(),
      });
    }

    if (["PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(cfg.status)) {
      events.push({
        id: `evt-${cfg.num}-3`,
        order_id: orderId,
        status: "PREPARING",
        by_user_id: "user-chef-01",
        by_user_name: "Chef Bilal Ahmed",
        note: "Food is being prepared",
        created_at: new Date(new Date(createdAt).getTime() + 8 * 60 * 1000).toISOString(),
      });
    }

    if (["READY", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(cfg.status)) {
      events.push({
        id: `evt-${cfg.num}-4`,
        order_id: orderId,
        status: "READY",
        by_user_id: "user-chef-01",
        by_user_name: "Chef Bilal Ahmed",
        note: "Food packed and ready",
        created_at: new Date(new Date(createdAt).getTime() + 22 * 60 * 1000).toISOString(),
      });
    }

    if (["OUT_FOR_DELIVERY", "DELIVERED"].includes(cfg.status)) {
      events.push({
        id: `evt-${cfg.num}-5`,
        order_id: orderId,
        status: "OUT_FOR_DELIVERY",
        by_user_id: "user-rider-01",
        by_user_name: "Hamza Malik (Rider)",
        note: "Out on motorbike for delivery",
        created_at: new Date(new Date(createdAt).getTime() + 28 * 60 * 1000).toISOString(),
      });
    }

    if (cfg.status === "DELIVERED") {
      events.push({
        id: `evt-${cfg.num}-6`,
        order_id: orderId,
        status: "DELIVERED",
        by_user_id: "user-rider-01",
        by_user_name: "Hamza Malik (Rider)",
        note: "Delivered to customer doorstep",
        created_at: new Date(new Date(createdAt).getTime() + 45 * 60 * 1000).toISOString(),
      });
    }

    if (cfg.status === "COMPLETED") {
      events.push({
        id: `evt-${cfg.num}-6`,
        order_id: orderId,
        status: "COMPLETED",
        by_user_id: "user-mgr-01",
        by_user_name: "Tariq Khan (Manager)",
        note: "Dine-in meal completed",
        created_at: new Date(new Date(createdAt).getTime() + 40 * 60 * 1000).toISOString(),
      });
    }

    const paymentProofs = cfg.hasProof
      ? [
          {
            id: `proof-${cfg.num}`,
            order_id: orderId,
            storage_key: PLACEHOLDER_PAYMENT_PROOF_DATA_URL,
            created_at: createdAt,
          },
        ]
      : [];

    orders.push({
      id: orderId,
      restaurant_id: RESTAURANT_ID,
      customer_id: cust.id,
      number: `#${cfg.num}`,
      type: cfg.type,
      status: cfg.status,
      payment_method: cfg.paymentMethod,
      payment_status: cfg.paymentStatus,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address: cfg.type === "delivery" ? cust.last_address : (cfg.tableNote || "Table Dine-in"),
      scheduled_for: null,
      created_at: createdAt,
      updated_at: createdAt,
      customer: cust,
      items: selectedItems,
      events,
      payment_proofs: paymentProofs,
    });
  }

  return orders;
}
