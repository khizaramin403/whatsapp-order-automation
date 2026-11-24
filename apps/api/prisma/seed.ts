import {
  PrismaClient,
  Role,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/whatsapp_orders?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Deterministic UUIDs for demo data to enable completely safe, idempotent re-runs
const DEMO_RESTAURANT_ID = "00000000-0000-4000-8000-000000000001";
const SUPER_ADMIN_EMAIL = "superadmin@demo.local";
const DEMO_PASSWORD_PLAIN = "Password123!";

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Reset existing demo data safely without affecting any real or other tenants' data
  console.log("🧹 Cleaning up prior demo data...");
  await prisma.restaurant.deleteMany({
    where: { id: DEMO_RESTAURANT_ID },
  });
  await prisma.user.deleteMany({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  // 2. Hash common development password with bcrypt (cost 10)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD_PLAIN, 10);

  // 3. Create demo hotel / restaurant
  console.log("🏨 Creating demo hotel (PKR, Asia/Karachi)...");
  const demoHotel = await prisma.restaurant.create({
    data: {
      id: DEMO_RESTAURANT_ID,
      name: "Grand Continental Hotel & Suites",
      timezone: "Asia/Karachi",
      currency: "PKR",
      default_language: "en",
      open_hours: {
        monday: { open: "09:00", close: "23:00" },
        tuesday: { open: "09:00", close: "23:00" },
        wednesday: { open: "09:00", close: "23:00" },
        thursday: { open: "09:00", close: "23:00" },
        friday: { open: "14:00", close: "23:30" },
        saturday: { open: "09:00", close: "23:30" },
        sunday: { open: "09:00", close: "23:00" },
      },
      delivery_fee: 15000, // Rs 150.00 in minor units
      minimum_order: 50000, // Rs 500.00 in minor units
      delivery_area: "Gulberg, DHA Phase 1-6, Model Town, Cantt (within 12km)",
      payment_account: "Meezan Bank - PK36MEZN00012345678901 (Title: Grand Continental Suites)",
      payment_instructions: "Transfer payment to Meezan Bank and send the transaction screenshot here.",
      bot_welcome_en: "Welcome to Grand Continental Hotel! How can we assist you with your order today?",
      bot_welcome_ar: "مرحباً بكم في فندق جراند كونتيننتال! كيف يمكننا مساعدتكم اليوم؟",
      bot_welcome_ur: "Grand Continental Hotel mein khushamdeed! Aaj hum aap ki kya khidmat kar saktay hain?",
      bot_payment_en: "Please transfer the order amount to Meezan Bank PK36MEZN00012345678901 and send a screenshot here.",
      bot_payment_ar: "يرجى تحويل المبلغ إلى بنك ميزان PK36MEZN00012345678901 وإرسال لقطة الشاشة هنا.",
      bot_payment_ur: "Barah-e-karam raqam Meezan Bank PK36MEZN00012345678901 par bhaijen aur screenshot yahan share karen.",
      email_notifications: true,
      daily_summary_email: true,
      push_notifications: true,
      sound_notifications: true,
      notification_email: "orders@grandcontinental.local",
      is_active: true,
    },
  });

  // 4. Create WhatsApp Cloud API configuration for demo hotel
  await prisma.restaurantWhatsapp.create({
    data: {
      restaurant_id: demoHotel.id,
      phone_number_id: "109876543210987",
      waba_id: "987654321098765",
      access_token_enc: "enc_demo_whatsapp_access_token_v1_mock",
    },
  });

  // 5. Create Staff Users: super_admin, owner, manager, chef, rider
  console.log("👥 Creating demo staff users...");
  const superAdmin = await prisma.user.create({
    data: {
      id: "00000000-0000-4000-8000-000000000010",
      restaurant_id: null, // super_admin has no restaurant
      name: "Super Administrator",
      email: SUPER_ADMIN_EMAIL,
      password_hash: passwordHash,
      role: Role.super_admin,
      language: "en",
      is_active: true,
    },
  });

  const owner = await prisma.user.create({
    data: {
      id: "00000000-0000-4000-8000-000000000011",
      restaurant_id: demoHotel.id,
      name: "Tariq Mahmood",
      email: "owner@demo.local",
      password_hash: passwordHash,
      role: Role.owner,
      language: "en",
      is_active: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      id: "00000000-0000-4000-8000-000000000012",
      restaurant_id: demoHotel.id,
      name: "Ayesha Khan",
      email: "manager@demo.local",
      password_hash: passwordHash,
      role: Role.manager,
      language: "en",
      is_active: true,
    },
  });

  const chef = await prisma.user.create({
    data: {
      id: "00000000-0000-4000-8000-000000000013",
      restaurant_id: demoHotel.id,
      name: "Bilal Ahmed",
      email: "chef@demo.local",
      password_hash: passwordHash,
      role: Role.chef,
      language: "ur-Latn",
      is_active: true,
    },
  });

  const rider = await prisma.user.create({
    data: {
      id: "00000000-0000-4000-8000-000000000014",
      restaurant_id: demoHotel.id,
      name: "Usman Ali",
      email: "rider@demo.local",
      password_hash: passwordHash,
      role: Role.rider,
      language: "ur-Latn",
      is_active: true,
    },
  });

  // Notification settings defaults
  await prisma.notificationSetting.createMany({
    data: [
      {
        restaurant_id: demoHotel.id,
        user_id: owner.id,
        email_on_new_order: true,
        daily_summary: true,
      },
      {
        restaurant_id: demoHotel.id,
        user_id: manager.id,
        email_on_new_order: true,
        daily_summary: false,
      },
      {
        restaurant_id: demoHotel.id,
        user_id: chef.id,
        email_on_new_order: false,
        daily_summary: false,
      },
      {
        restaurant_id: demoHotel.id,
        user_id: rider.id,
        email_on_new_order: false,
        daily_summary: false,
      },
    ],
  });

  // 6. Menu Categories and Items with 3-language translations and aliases
  console.log("🍽️  Creating menu categories, 15 items, and multi-language translations...");

  const categoriesData = [
    {
      id: "00000000-0000-4000-8000-000000000101",
      sort_order: 1,
      translations: {
        en: { name: "Starters & Appetizers", desc: "Crispy appetizers and warm soups to begin your meal", aliases: ["starter", "starters", "appetizer", "appetizers", "soup"] },
        ar: { name: "المقبلات والشوربات", desc: "مقبلات مقرمشة وشوربات دافئة لبداية وجبتك", aliases: ["مقبلات", "شوربة", "شربة"] },
        "ur-Latn": { name: "Starters aur Shuruat", desc: "Khanay se pehle taaza kurkuray appetizers aur soup", aliases: ["starter", "starters", "shuruat", "soup"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000102",
      sort_order: 2,
      translations: {
        en: { name: "Main Course & Biryani", desc: "Traditional aromatic curries, gravies and basmati rice", aliases: ["main", "mains", "curry", "biryani", "rice", "salan"] },
        ar: { name: "الأطباق الرئيسية والبرياني", desc: "أطباق كاري تقليدية غنية وأرز برياني فاخر", aliases: ["رئيسي", "برياني", "ارز", "كاري"] },
        "ur-Latn": { name: "Khaas Khanay aur Biryani", desc: "Zaiqedaar salan, handi aur dum biryani", aliases: ["main", "biryani", "chawal", "salan", "handi"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000103",
      sort_order: 3,
      translations: {
        en: { name: "Barbecue & Grills", desc: "Charcoal flame-grilled tikkas, kebabs and chops", aliases: ["bbq", "barbecue", "grill", "kebab", "tikka", "grills"] },
        ar: { name: "مشويات وكباب على الفحم", desc: "مشويات على الفحم بنكهة الشواء الأصيلة", aliases: ["مشويات", "مشوي", "كباب", "تكة"] },
        "ur-Latn": { name: "BBQ aur Tikka Kabab", desc: "Koylun ki aanch par banay taaza tikkay aur seekhen", aliases: ["bbq", "tikka", "kabab", "kebab", "boti"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000104",
      sort_order: 4,
      translations: {
        en: { name: "Desserts & Beverages", desc: "Traditional sweet delicacies and chilled beverages", aliases: ["dessert", "desserts", "sweet", "drinks", "beverages", "drink"] },
        ar: { name: "الحلويات والمشروبات", desc: "حلويات شرقية تقليدية وعصائر ومشروبات مثلجة", aliases: ["حلويات", "مشروبات", "عصير", "حلوى"] },
        "ur-Latn": { name: "Meetha aur Mashroobaat", desc: "Desi meetha aur thanday sharbat", aliases: ["meetha", "mithai", "drink", "drinks", "sharbat"] },
      },
    },
  ];

  for (const cat of categoriesData) {
    await prisma.menuCategory.create({
      data: {
        id: cat.id,
        restaurant_id: demoHotel.id,
        sort_order: cat.sort_order,
      },
    });

    for (const [lang, trans] of Object.entries(cat.translations)) {
      await prisma.menuTranslation.create({
        data: {
          restaurant_id: demoHotel.id,
          entity_type: "category",
          entity_id: cat.id,
          language: lang,
          name: trans.name,
          description: trans.desc,
          aliases: trans.aliases,
        },
      });
    }
  }

  // 15 menu items
  const itemsData = [
    // Category 1: Starters (4 items)
    {
      id: "00000000-0000-4000-8000-000000000201",
      category_id: "00000000-0000-4000-8000-000000000101",
      price: 35000, // Rs 350.00
      image_url: "/images/menu/chicken_corn_soup.jpg",
      sort_order: 1,
      translations: {
        en: { name: "Chicken Corn Soup", desc: "Classic thick chicken broth with sweet corn kernels and egg drop", aliases: ["chicken corn soup", "corn soup", "soup", "chinese soup"] },
        ar: { name: "شوربة الذرة بالدجاج", desc: "شوربة ساخنة كلاسيكية بقطع الدجاج والذرة الحلوة", aliases: ["شوربة دجاج", "شوربة ذرة", "شوربة"] },
        "ur-Latn": { name: "Chicken Corn Soup", desc: "Garam aur garhi chicken soup makkai aur anday ke sath", aliases: ["chicken corn soup", "corn soup", "soup"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000202",
      category_id: "00000000-0000-4000-8000-000000000101",
      price: 28000, // Rs 280.00
      image_url: "/images/menu/dahi_bhallay.jpg",
      sort_order: 2,
      translations: {
        en: { name: "Lahori Dahi Bhallay", desc: "Fluffy lentil fritters in spiced yogurt with mint and tamarind chutneys", aliases: ["dahi bhallay", "dahi bhalla", "dahi baray", "chaat", "bhallay"] },
        ar: { name: "داهي بهالي لاهوري", desc: "زلابية العدس المقرمشة مغطاة بالزبادي المتبل وصلصة التمر الهندي", aliases: ["داهي بهالي", "مقبلات زبادي"] },
        "ur-Latn": { name: "Lahori Dahi Bhallay", desc: "Meethay dahi aur imli podina chatni mein doobay taaza bhallay", aliases: ["dahi bhallay", "dahi bhalay", "chaat", "bhallay"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000203",
      category_id: "00000000-0000-4000-8000-000000000101",
      price: 75000, // Rs 750.00
      image_url: "/images/menu/finger_fish.jpg",
      sort_order: 3,
      translations: {
        en: { name: "Crispy Finger Fish", desc: "Golden fried seasoned fish fillets served with homemade tartar dip", aliases: ["finger fish", "crispy fish", "fried fish", "fish"] },
        ar: { name: "أصابع السمك المقرمشة", desc: "أصابع سمك مقلية مقرمشة تقدم مع صلصة التارتار اللذيذة", aliases: ["اصابع سمك", "سمك مقلي", "سمك"] },
        "ur-Latn": { name: "Crispy Finger Fish", desc: "Kurkuri tali hui machhli homemade tartar sauce ke sath", aliases: ["finger fish", "machli", "fried fish", "fish"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000204",
      category_id: "00000000-0000-4000-8000-000000000101",
      price: 32000, // Rs 320.00
      image_url: "/images/menu/spring_rolls.jpg",
      sort_order: 4,
      translations: {
        en: { name: "Vegetable Spring Rolls", desc: "Crisp pastry rolls loaded with sauteed vegetables and sweet chili sauce", aliases: ["spring rolls", "spring roll", "veg rolls", "rolls"] },
        ar: { name: "سبرينغ رول بالخضار", desc: "لفائف مقرمشة محشوة بالخضار الطازجة مع صلصة الفلفل الحلو", aliases: ["سبرينغ رول", "لفائف خضار"] },
        "ur-Latn": { name: "Vegetable Spring Rolls", desc: "Sabziyon se bharay kurkuray rolls sweet chili sauce ke sath", aliases: ["spring rolls", "veg roll", "rolls"] },
      },
    },

    // Category 2: Main Course & Biryani (5 items)
    {
      id: "00000000-0000-4000-8000-000000000205",
      category_id: "00000000-0000-4000-8000-000000000102",
      price: 58000, // Rs 580.00
      image_url: "/images/menu/chicken_dum_biryani.jpg",
      sort_order: 1,
      translations: {
        en: { name: "Special Chicken Dum Biryani", desc: "Aromatic basmati rice cooked on steam with spiced marinated chicken and saffron", aliases: ["chicken biryani", "biryani", "dum biryani", "biryani chicken", "baryani"] },
        ar: { name: "برياني دجاج دوم خاص", desc: "أرز بسمتي فاخر مطهو على البخار مع قطع الدجاج المتبلة والزعفران", aliases: ["برياني دجاج", "برياني", "ارز برياني"] },
        "ur-Latn": { name: "Special Chicken Dum Biryani", desc: "Khushbudar basmati chawal aur zafrani chicken dum biryani raita ke sath", aliases: ["chicken biryani", "biryani", "baryani", "dum biryani"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000206",
      category_id: "00000000-0000-4000-8000-000000000102",
      price: 145000, // Rs 1,450.00
      image_url: "/images/menu/mutton_kunna.jpg",
      sort_order: 2,
      translations: {
        en: { name: "Chinioti Mutton Kunna", desc: "Authentic slow-simmered tender mutton prepared in a traditional earthenware pot", aliases: ["mutton kunna", "kunna gosht", "kunna", "mutton"] },
        ar: { name: "لحم كونا ضأن شينيوتي", desc: "لحم ضأن طري مطبوخ على نار هادئة في وعاء فخاري تقليدي", aliases: ["لحم كونا", "كونا", "لحم ضان"] },
        "ur-Latn": { name: "Chinioti Mutton Kunna", desc: "Matti ki handi mein dheemi aanch par paka hua naram mutton", aliases: ["mutton kunna", "kunna", "gosht", "kunna gosht"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000207",
      category_id: "00000000-0000-4000-8000-000000000102",
      price: 95000, // Rs 950.00
      image_url: "/images/menu/chicken_karahi.jpg",
      sort_order: 3,
      translations: {
        en: { name: "Desi Chicken Karahi (Half)", desc: "Wok-cooked fresh chicken in tomato, green chili and ginger gravy", aliases: ["chicken karahi", "karahi", "karai", "chicken karai"] },
        ar: { name: "دجاج كراهي محلي (نصف)", desc: "دجاج طازج مطهو في مقلاة خاصة مع الطماطم والزنجبيل والفلفل الأخضر", aliases: ["كراهي دجاج", "كراهي", "دجاج مقلي"] },
        "ur-Latn": { name: "Desi Chicken Karahi (Half)", desc: "Tamatar, hari mirch aur adrak mein bani lahori chicken karahi", aliases: ["chicken karahi", "karahi", "karai"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000208",
      category_id: "00000000-0000-4000-8000-000000000102",
      price: 45000, // Rs 450.00
      image_url: "/images/menu/daal_makhani.jpg",
      sort_order: 4,
      translations: {
        en: { name: "Royal Daal Makhani", desc: "Whole black lentils slow-cooked overnight with creamy dairy butter and mild spices", aliases: ["daal makhani", "dal makhani", "daal", "makhani daal"] },
        ar: { name: "دال مخاني ملكي بالزبدة", desc: "عدس أسود مطهو بعناية مع الزبدة والكريمة الغنية والتوابل الهادئة", aliases: ["دال مخاني", "دال", "عدس"] },
        "ur-Latn": { name: "Royal Daal Makhani", desc: "Makkhan aur taaza cream mein dheemi aanch par paki kaali daal", aliases: ["daal makhani", "dal makhni", "daal"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000209",
      category_id: "00000000-0000-4000-8000-000000000102",
      price: 9000, // Rs 90.00
      image_url: "/images/menu/garlic_naan.jpg",
      sort_order: 5,
      translations: {
        en: { name: "Tandoori Garlic Naan", desc: "Clay oven baked soft leavened bread brushed with garlic butter and fresh coriander", aliases: ["garlic naan", "naan", "roti", "garlic bread"] },
        ar: { name: "خبز نان بالتندور والثوم", desc: "خبز نان طازج مخبوز في التندور ومدهون بزبدة الثوم والكزبرة", aliases: ["نان ثوم", "خبز نان", "نان"] },
        "ur-Latn": { name: "Tandoori Garlic Naan", desc: "Tandoor ka taaza paka garlic butter aur dhaniye wala naan", aliases: ["garlic naan", "naan", "roti"] },
      },
    },

    // Category 3: BBQ & Grills (3 items)
    {
      id: "00000000-0000-4000-8000-000000000210",
      category_id: "00000000-0000-4000-8000-000000000103",
      price: 62000, // Rs 620.00
      image_url: "/images/menu/seekh_kabab.jpg",
      sort_order: 1,
      translations: {
        en: { name: "Chicken Seekh Kabab (4 pcs)", desc: "Succulent minced chicken skewers seasoned with special spices and char-grilled", aliases: ["seekh kabab", "chicken seekh", "kabab", "kebab", "seekh"] },
        ar: { name: "كباب دجاج سيخ (4 قطع)", desc: "أسياخ كباب دجاج مفروم ومتبل بالبهارات ومشوي على الفحم", aliases: ["كباب دجاج", "سيخ كباب", "كباب"] },
        "ur-Latn": { name: "Chicken Seekh Kabab (4 pcs)", desc: "Koylun par bhuni hui lazeez masaledaar chicken seekhen", aliases: ["seekh kabab", "kabab", "chicken seekh", "kebab"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000211",
      category_id: "00000000-0000-4000-8000-000000000103",
      price: 165000, // Rs 1,650.00
      image_url: "/images/menu/mutton_chops.jpg",
      sort_order: 2,
      translations: {
        en: { name: "Mutton Chops Grill (4 pcs)", desc: "Juicy prime mutton ribs marinated in raw papaya and roasted spices, charcoal broiled", aliases: ["mutton chops", "chops", "chaanp", "chanp", "grill chops"] },
        ar: { name: "ريش ضأن مشوية (4 قطع)", desc: "ريش لحم ضأن طرية متبلة بالبهارات ومشوية على الجمر", aliases: ["ريش ضان", "ريش مشوية", "ريش"] },
        "ur-Latn": { name: "Mutton Chops Grill (4 pcs)", desc: "Masaledaar koyla grill mutton chaanpein taaza raita ke sath", aliases: ["mutton chaanp", "chaanp", "chanp", "chops"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000212",
      category_id: "00000000-0000-4000-8000-000000000103",
      price: 78000, // Rs 780.00
      image_url: "/images/menu/malai_boti.jpg",
      sort_order: 3,
      translations: {
        en: { name: "Creamy Chicken Malai Boti", desc: "Tender boneless chicken cubes marinated in fresh cream, yogurt, white pepper and herbs", aliases: ["malai boti", "chicken malai boti", "boti", "creamy boti"] },
        ar: { name: "دجاج مالاي بوتي بالكريمة", desc: "مكعبات دجاج طرية متبلة بالكريمة الغنية والزبادي والبهارات البيضاء", aliases: ["مالاي بوتي", "دجاج مالاي", "شيش طاووق"] },
        "ur-Latn": { name: "Creamy Chicken Malai Boti", desc: "Naram aur malai se bhari paki hui chicken boti platter", aliases: ["malai boti", "chicken boti", "boti"] },
      },
    },

    // Category 4: Desserts & Beverages (3 items)
    {
      id: "00000000-0000-4000-8000-000000000213",
      category_id: "00000000-0000-4000-8000-000000000104",
      price: 25000, // Rs 250.00
      image_url: "/images/menu/shahi_kheer.jpg",
      sort_order: 1,
      translations: {
        en: { name: "Traditional Shahi Kheer", desc: "Slow-reduced milk and rice pudding flavored with cardamom and garnished with pistachios", aliases: ["kheer", "shahi kheer", "pudding", "rice pudding", "meetha"] },
        ar: { name: "أرز بالحليب شاهي ملكي", desc: "حلوى الأرز بالحليب التقليدية المتبلة بالهيل والمزينة بالفستق", aliases: ["مهلبية", "خير", "ارز بحليب"] },
        "ur-Latn": { name: "Traditional Shahi Kheer", desc: "Pistay aur badaam se saji dheemi aanch par paki shahi kheer", aliases: ["kheer", "shahi kheer", "meetha"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000214",
      category_id: "00000000-0000-4000-8000-000000000104",
      price: 20000, // Rs 200.00
      image_url: "/images/menu/gulab_jamun.jpg",
      sort_order: 2,
      translations: {
        en: { name: "Warm Gulab Jamun (2 pcs)", desc: "Deep golden fried milk solid dumplings soaked in rose and cardamom sugar syrup", aliases: ["gulab jamun", "jamun", "sweet", "mithai"] },
        ar: { name: "غلاب جامون دافئ (قطعتين)", desc: "كرات الحليب المقلية الذهبية المغطاة بشراب ماء الورد والهيل", aliases: ["غلاب جامون", "حلويات شرقية"] },
        "ur-Latn": { name: "Garam Gulab Jamun (2 pcs)", desc: "Ilaichi aur gulab ke sheerey mein garam gulab jamun", aliases: ["gulab jamun", "jamun", "meetha", "mithai"] },
      },
    },
    {
      id: "00000000-0000-4000-8000-000000000215",
      category_id: "00000000-0000-4000-8000-000000000104",
      price: 22000, // Rs 220.00
      image_url: "/images/menu/mint_lemonade.jpg",
      sort_order: 3,
      translations: {
        en: { name: "Chilled Mint Lemonade", desc: "Fresh lemon juice blended with crushed mint leaves, black salt and ice", aliases: ["mint lemonade", "lemonade", "mint margarita", "margarita", "drink"] },
        ar: { name: "عصير ليموناضة بالنعناع المثلج", desc: "عصير ليمون منعش مخلوط بالنعناع الطازج والثلج المجروش", aliases: ["ليمون بالنعناع", "عصير نعناع", "ليموناضة"] },
        "ur-Latn": { name: "Chilled Mint Lemonade", desc: "Taaza podina, lemoo aur barf se bana thanda mashroob", aliases: ["mint lemonade", "lemonade", "podina sharbat", "drink"] },
      },
    },
  ];

  for (const item of itemsData) {
    await prisma.menuItem.create({
      data: {
        id: item.id,
        restaurant_id: demoHotel.id,
        category_id: item.category_id,
        price: item.price,
        image_url: item.image_url,
        is_available: true,
        sort_order: item.sort_order,
      },
    });

    for (const [lang, trans] of Object.entries(item.translations)) {
      await prisma.menuTranslation.create({
        data: {
          restaurant_id: demoHotel.id,
          entity_type: "item",
          entity_id: item.id,
          language: lang,
          name: trans.name,
          description: trans.desc,
          aliases: trans.aliases,
        },
      });
    }
  }

  // 7. Customers (12 realistic Pakistani customers with E.164 phone numbers)
  console.log("📱 Creating demo customers with E.164 numbers...");
  const customersData = [
    { id: "00000000-0000-4000-8000-000000000301", phone: "+923001234001", name: "Hamza Tariq", language: "en", last_address: "House 42, Street 8, Phase 5 DHA, Lahore" },
    { id: "00000000-0000-4000-8000-000000000302", phone: "+923001234002", name: "Fatima Zahra", language: "ur-Latn", last_address: "Flat 3B, Gulberg Heights, Main Boulevard, Lahore" },
    { id: "00000000-0000-4000-8000-000000000303", phone: "+923001234003", name: "Ahmed Raza", language: "en", last_address: "House 112-C, Model Town, Lahore" },
    { id: "00000000-0000-4000-8000-000000000304", phone: "+923001234004", name: "Zainab Bibi", language: "ar", last_address: "Villa 7, Askari 10, Cantt, Lahore" },
    { id: "00000000-0000-4000-8000-000000000305", phone: "+923001234005", name: "Omar Farooq", language: "en", last_address: "Plaza 15, Sector Y, DHA Phase 3, Lahore" },
    { id: "00000000-0000-4000-8000-000000000306", phone: "+923001234006", name: "Sana Mir", language: "ur-Latn", last_address: "House 54, Block G, Johar Town, Lahore" },
    { id: "00000000-0000-4000-8000-000000000307", phone: "+923001234007", name: "Ali Hassan", language: "en", last_address: "Apartment 402, Al-Hafeez Heights, Gulberg III, Lahore" },
    { id: "00000000-0000-4000-8000-000000000308", phone: "+923001234008", name: "Maryam Nawaz", language: "ar", last_address: "House 18-A, Street 3, Cavalry Ground, Lahore" },
    { id: "00000000-0000-4000-8000-000000000309", phone: "+923001234009", name: "Mustafa Kamal", language: "ur-Latn", last_address: "Bungalow 99, Sector J, DHA Phase 6, Lahore" },
    { id: "00000000-0000-4000-8000-000000000310", phone: "+923001234010", name: "Hira Mani", language: "en", last_address: "House 23, Block K, Model Town, Lahore" },
    { id: "00000000-0000-4000-8000-000000000311", phone: "+923001234011", name: "Bilal Siddiqui", language: "ur-Latn", last_address: "Flat 12, Mall View Residency, Mall Road, Lahore" },
    { id: "00000000-0000-4000-8000-000000000312", phone: "+923001234012", name: "Ayesha Noor", language: "en", last_address: "House 67, Street 14, Phase 4 DHA, Lahore" },
  ];

  for (const cust of customersData) {
    await prisma.customer.create({
      data: {
        id: cust.id,
        restaurant_id: demoHotel.id,
        phone: cust.phone,
        name: cust.name,
        language: cust.language,
        last_address: cust.last_address,
      },
    });
  }

  // 8. Sample Orders (~41 orders across all statuses, types and payment methods)
  console.log("📦 Creating 41 sample orders with items, timelines and payment proofs...");

  const now = new Date();
  const getPastTime = (hoursAgo: number, minutesAgo: number = 0) => {
    return new Date(now.getTime() - (hoursAgo * 60 + minutesAgo) * 60 * 1000);
  };

  // Order specifications covering all 9 statuses:
  // PENDING (5), ACCEPTED (5), PREPARING (5), READY (5), OUT_FOR_DELIVERY (5), DELIVERED (6), COMPLETED (4), CANCELLED (3), REJECTED (3)
  const ordersConfig: Array<{
    num: string;
    customerIndex: number;
    type: OrderType;
    status: OrderStatus;
    payment_method: PaymentMethod;
    payment_status: PaymentStatus;
    hasProof: boolean;
    hoursAgo: number;
    itemIndices: Array<{ idx: number; qty: number }>;
  }> = [
    // PENDING (5 orders)
    { num: "1001", customerIndex: 0, type: OrderType.delivery, status: OrderStatus.PENDING, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 0.2, itemIndices: [{ idx: 4, qty: 2 }, { idx: 14, qty: 2 }] }, // Biryani + Mint Lemonade
    { num: "1002", customerIndex: 1, type: OrderType.delivery, status: OrderStatus.PENDING, payment_method: PaymentMethod.online, payment_status: PaymentStatus.pending_check, hasProof: true, hoursAgo: 0.4, itemIndices: [{ idx: 5, qty: 1 }, { idx: 8, qty: 3 }] }, // Kunna + Naan
    { num: "1003", customerIndex: 2, type: OrderType.dine_in, status: OrderStatus.PENDING, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 0.5, itemIndices: [{ idx: 6, qty: 1 }, { idx: 8, qty: 4 }] }, // Karahi + Naan
    { num: "1004", customerIndex: 3, type: OrderType.delivery, status: OrderStatus.PENDING, payment_method: PaymentMethod.online, payment_status: PaymentStatus.pending_check, hasProof: true, hoursAgo: 0.7, itemIndices: [{ idx: 9, qty: 1 }, { idx: 11, qty: 1 }] }, // Seekh Kabab + Malai Boti
    { num: "1005", customerIndex: 4, type: OrderType.pickup, status: OrderStatus.PENDING, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 0.9, itemIndices: [{ idx: 0, qty: 2 }, { idx: 3, qty: 1 }] }, // Soup + Spring Rolls

    // ACCEPTED (5 orders)
    { num: "1006", customerIndex: 5, type: OrderType.delivery, status: OrderStatus.ACCEPTED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 1.1, itemIndices: [{ idx: 4, qty: 1 }, { idx: 9, qty: 1 }] },
    { num: "1007", customerIndex: 6, type: OrderType.delivery, status: OrderStatus.ACCEPTED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 1.2, itemIndices: [{ idx: 10, qty: 1 }, { idx: 8, qty: 2 }] },
    { num: "1008", customerIndex: 7, type: OrderType.dine_in, status: OrderStatus.ACCEPTED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 1.3, itemIndices: [{ idx: 6, qty: 1 }, { idx: 12, qty: 2 }] },
    { num: "1009", customerIndex: 8, type: OrderType.delivery, status: OrderStatus.ACCEPTED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 1.4, itemIndices: [{ idx: 7, qty: 1 }, { idx: 8, qty: 2 }] },
    { num: "1010", customerIndex: 9, type: OrderType.pickup, status: OrderStatus.ACCEPTED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 1.5, itemIndices: [{ idx: 2, qty: 1 }, { idx: 14, qty: 1 }] },

    // PREPARING (5 orders)
    { num: "1011", customerIndex: 10, type: OrderType.delivery, status: OrderStatus.PREPARING, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 1.7, itemIndices: [{ idx: 4, qty: 2 }, { idx: 14, qty: 2 }] },
    { num: "1012", customerIndex: 11, type: OrderType.delivery, status: OrderStatus.PREPARING, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 1.8, itemIndices: [{ idx: 5, qty: 1 }, { idx: 8, qty: 3 }, { idx: 12, qty: 1 }] },
    { num: "1013", customerIndex: 0, type: OrderType.dine_in, status: OrderStatus.PREPARING, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 2.0, itemIndices: [{ idx: 6, qty: 1 }, { idx: 8, qty: 2 }] },
    { num: "1014", customerIndex: 1, type: OrderType.delivery, status: OrderStatus.PREPARING, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 2.2, itemIndices: [{ idx: 11, qty: 1 }, { idx: 9, qty: 1 }] },
    { num: "1015", customerIndex: 2, type: OrderType.delivery, status: OrderStatus.PREPARING, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 2.4, itemIndices: [{ idx: 4, qty: 3 }] },

    // READY (5 orders)
    { num: "1016", customerIndex: 3, type: OrderType.delivery, status: OrderStatus.READY, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 2.6, itemIndices: [{ idx: 4, qty: 1 }, { idx: 14, qty: 1 }] },
    { num: "1017", customerIndex: 4, type: OrderType.delivery, status: OrderStatus.READY, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 2.8, itemIndices: [{ idx: 6, qty: 1 }, { idx: 8, qty: 4 }] },
    { num: "1018", customerIndex: 5, type: OrderType.dine_in, status: OrderStatus.READY, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 3.0, itemIndices: [{ idx: 9, qty: 2 }, { idx: 8, qty: 2 }] },
    { num: "1019", customerIndex: 6, type: OrderType.pickup, status: OrderStatus.READY, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 3.2, itemIndices: [{ idx: 0, qty: 1 }, { idx: 3, qty: 1 }] },
    { num: "1020", customerIndex: 7, type: OrderType.delivery, status: OrderStatus.READY, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 3.4, itemIndices: [{ idx: 10, qty: 1 }, { idx: 14, qty: 2 }] },

    // OUT_FOR_DELIVERY (5 orders)
    { num: "1021", customerIndex: 8, type: OrderType.delivery, status: OrderStatus.OUT_FOR_DELIVERY, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 3.6, itemIndices: [{ idx: 4, qty: 2 }, { idx: 13, qty: 2 }] },
    { num: "1022", customerIndex: 9, type: OrderType.delivery, status: OrderStatus.OUT_FOR_DELIVERY, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 3.8, itemIndices: [{ idx: 5, qty: 1 }, { idx: 8, qty: 2 }] },
    { num: "1023", customerIndex: 10, type: OrderType.delivery, status: OrderStatus.OUT_FOR_DELIVERY, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 4.0, itemIndices: [{ idx: 11, qty: 1 }, { idx: 14, qty: 1 }] },
    { num: "1024", customerIndex: 11, type: OrderType.delivery, status: OrderStatus.OUT_FOR_DELIVERY, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 4.2, itemIndices: [{ idx: 6, qty: 1 }, { idx: 8, qty: 3 }] },
    { num: "1025", customerIndex: 0, type: OrderType.delivery, status: OrderStatus.OUT_FOR_DELIVERY, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.pending, hasProof: false, hoursAgo: 4.5, itemIndices: [{ idx: 4, qty: 1 }, { idx: 9, qty: 1 }] },

    // DELIVERED (6 orders)
    { num: "1026", customerIndex: 1, type: OrderType.delivery, status: OrderStatus.DELIVERED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.verified, hasProof: false, hoursAgo: 5.0, itemIndices: [{ idx: 4, qty: 1 }, { idx: 14, qty: 1 }] },
    { num: "1027", customerIndex: 2, type: OrderType.delivery, status: OrderStatus.DELIVERED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 6.0, itemIndices: [{ idx: 5, qty: 1 }, { idx: 8, qty: 4 }] },
    { num: "1028", customerIndex: 3, type: OrderType.delivery, status: OrderStatus.DELIVERED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.verified, hasProof: false, hoursAgo: 7.5, itemIndices: [{ idx: 6, qty: 1 }, { idx: 8, qty: 2 }] },
    { num: "1029", customerIndex: 4, type: OrderType.delivery, status: OrderStatus.DELIVERED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 9.0, itemIndices: [{ idx: 10, qty: 1 }, { idx: 12, qty: 2 }] },
    { num: "1030", customerIndex: 5, type: OrderType.delivery, status: OrderStatus.DELIVERED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.verified, hasProof: false, hoursAgo: 12.0, itemIndices: [{ idx: 4, qty: 3 }] },
    { num: "1031", customerIndex: 6, type: OrderType.delivery, status: OrderStatus.DELIVERED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 16.0, itemIndices: [{ idx: 11, qty: 2 }, { idx: 8, qty: 4 }] },

    // COMPLETED (4 dine_in / pickup orders)
    { num: "1032", customerIndex: 7, type: OrderType.dine_in, status: OrderStatus.COMPLETED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.verified, hasProof: false, hoursAgo: 8.0, itemIndices: [{ idx: 6, qty: 1 }, { idx: 8, qty: 2 }, { idx: 14, qty: 2 }] },
    { num: "1033", customerIndex: 8, type: OrderType.dine_in, status: OrderStatus.COMPLETED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 10.5, itemIndices: [{ idx: 4, qty: 2 }, { idx: 12, qty: 2 }] },
    { num: "1034", customerIndex: 9, type: OrderType.pickup, status: OrderStatus.COMPLETED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.verified, hasProof: false, hoursAgo: 14.0, itemIndices: [{ idx: 0, qty: 2 }, { idx: 3, qty: 2 }] },
    { num: "1035", customerIndex: 10, type: OrderType.pickup, status: OrderStatus.COMPLETED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.verified, hasProof: true, hoursAgo: 18.0, itemIndices: [{ idx: 9, qty: 1 }, { idx: 14, qty: 1 }] },

    // CANCELLED (3 orders)
    { num: "1036", customerIndex: 11, type: OrderType.delivery, status: OrderStatus.CANCELLED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.failed, hasProof: false, hoursAgo: 6.5, itemIndices: [{ idx: 4, qty: 1 }] },
    { num: "1037", customerIndex: 0, type: OrderType.delivery, status: OrderStatus.CANCELLED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.failed, hasProof: false, hoursAgo: 11.0, itemIndices: [{ idx: 6, qty: 1 }] },
    { num: "1038", customerIndex: 1, type: OrderType.pickup, status: OrderStatus.CANCELLED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.failed, hasProof: false, hoursAgo: 20.0, itemIndices: [{ idx: 2, qty: 1 }] },

    // REJECTED (3 orders)
    { num: "1039", customerIndex: 2, type: OrderType.delivery, status: OrderStatus.REJECTED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.not_received, hasProof: true, hoursAgo: 7.0, itemIndices: [{ idx: 5, qty: 1 }, { idx: 8, qty: 2 }] },
    { num: "1040", customerIndex: 3, type: OrderType.delivery, status: OrderStatus.REJECTED, payment_method: PaymentMethod.cod, payment_status: PaymentStatus.not_received, hasProof: false, hoursAgo: 15.0, itemIndices: [{ idx: 10, qty: 2 }] },
    { num: "1041", customerIndex: 4, type: OrderType.delivery, status: OrderStatus.REJECTED, payment_method: PaymentMethod.online, payment_status: PaymentStatus.not_received, hasProof: false, hoursAgo: 22.0, itemIndices: [{ idx: 4, qty: 1 }] },
  ];

  for (let i = 0; i < ordersConfig.length; i++) {
    const cfg = ordersConfig[i];
    const customer = customersData[cfg.customerIndex];
    const orderCreatedAt = getPastTime(cfg.hoursAgo);

    // Calculate subtotal from items
    let subtotal = 0;
    const itemsToCreate = cfg.itemIndices.map((itemSpec) => {
      const menuItem = itemsData[itemSpec.idx];
      const itemTotal = menuItem.price * itemSpec.qty;
      subtotal += itemTotal;
      return {
        restaurant_id: demoHotel.id,
        menu_item_id: menuItem.id,
        name_snapshot: menuItem.translations.en.name,
        price_snapshot: menuItem.price,
        qty: itemSpec.qty,
      };
    });

    const deliveryFee = cfg.type === OrderType.delivery ? demoHotel.delivery_fee : 0;
    const total = subtotal + deliveryFee;

    const orderId = `00000000-0000-4000-8000-${String(1000 + i + 1).padStart(12, "0")}`;

    const order = await prisma.order.create({
      data: {
        id: orderId,
        restaurant_id: demoHotel.id,
        customer_id: customer.id,
        number: cfg.num,
        type: cfg.type,
        status: cfg.status,
        payment_method: cfg.payment_method,
        payment_status: cfg.payment_status,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        address: cfg.type === OrderType.delivery ? customer.last_address : null,
        created_at: orderCreatedAt,
        updated_at: orderCreatedAt,
        items: {
          create: itemsToCreate,
        },
      },
    });

    // Create payment proof if online order with proof
    if (cfg.hasProof) {
      await prisma.paymentProof.create({
        data: {
          restaurant_id: demoHotel.id,
          order_id: order.id,
          storage_key: `proofs/2026/11/order_${cfg.num}_payment_screenshot.jpg`,
          created_at: new Date(orderCreatedAt.getTime() + 2 * 60 * 1000), // 2 mins after order
        },
      });
    }

    // Create timeline events according to the status progression
    const events: Array<{ status: OrderStatus; byUserId: string | null; note?: string; minsDelta: number }> = [
      { status: OrderStatus.PENDING, byUserId: null, note: "Order placed via WhatsApp bot", minsDelta: 0 },
    ];

    if (cfg.status === OrderStatus.ACCEPTED || cfg.status === OrderStatus.PREPARING || cfg.status === OrderStatus.READY || cfg.status === OrderStatus.OUT_FOR_DELIVERY || cfg.status === OrderStatus.DELIVERED || cfg.status === OrderStatus.COMPLETED) {
      events.push({ status: OrderStatus.ACCEPTED, byUserId: manager.id, note: "Order accepted by staff", minsDelta: 4 });
    }

    if (cfg.status === OrderStatus.PREPARING || cfg.status === OrderStatus.READY || cfg.status === OrderStatus.OUT_FOR_DELIVERY || cfg.status === OrderStatus.DELIVERED || cfg.status === OrderStatus.COMPLETED) {
      events.push({ status: OrderStatus.PREPARING, byUserId: chef.id, note: "Kitchen started preparing food", minsDelta: 10 });
    }

    if (cfg.status === OrderStatus.READY || cfg.status === OrderStatus.OUT_FOR_DELIVERY || cfg.status === OrderStatus.DELIVERED || cfg.status === OrderStatus.COMPLETED) {
      events.push({ status: OrderStatus.READY, byUserId: chef.id, note: "Kitchen marked order ready for dispatch", minsDelta: 28 });
    }

    if (cfg.status === OrderStatus.OUT_FOR_DELIVERY || cfg.status === OrderStatus.DELIVERED) {
      events.push({ status: OrderStatus.OUT_FOR_DELIVERY, byUserId: rider.id, note: "Rider picked up parcel for delivery", minsDelta: 34 });
    }

    if (cfg.status === OrderStatus.DELIVERED) {
      events.push({ status: OrderStatus.DELIVERED, byUserId: rider.id, note: "Successfully delivered to customer", minsDelta: 52 });
    }

    if (cfg.status === OrderStatus.COMPLETED) {
      events.push({ status: OrderStatus.COMPLETED, byUserId: manager.id, note: "Order completed and settled", minsDelta: 35 });
    }

    if (cfg.status === OrderStatus.CANCELLED) {
      events.push({ status: OrderStatus.CANCELLED, byUserId: manager.id, note: "Cancelled upon customer request", minsDelta: 8 });
    }

    if (cfg.status === OrderStatus.REJECTED) {
      events.push({ status: OrderStatus.REJECTED, byUserId: manager.id, note: "Rejected: invalid screenshot / unverified payment", minsDelta: 6 });
    }

    for (const ev of events) {
      await prisma.orderEvent.create({
        data: {
          restaurant_id: demoHotel.id,
          order_id: order.id,
          status: ev.status,
          by_user_id: ev.byUserId,
          note: ev.note,
          created_at: new Date(orderCreatedAt.getTime() + ev.minsDelta * 60 * 1000),
        },
      });
    }
  }

  // 9. Sample Conversations and Messages for a customer
  console.log("💬 Creating sample bot conversations and messages...");
  const activeCustomer = customersData[0];
  await prisma.conversation.create({
    data: {
      id: "00000000-0000-4000-8000-000000000401",
      restaurant_id: demoHotel.id,
      customer_id: activeCustomer.id,
      state: "CONFIRMED",
      cart_json: {
        items: [{ id: itemsData[4].id, name: "Chicken Dum Biryani", qty: 2, price: 58000 }],
        type: "delivery",
        payment_method: "cod",
      },
      updated_at: now,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        restaurant_id: demoHotel.id,
        customer_id: activeCustomer.id,
        wa_message_id: "wamid.HBgMOTIzMDAxMjM0MDAxFQIAEhggQ0RFNjM4QjExQ0M0NTY3OEQwOTgz",
        direction: "inbound",
        type: "text",
        body: "Hello, I want to order dinner",
        created_at: getPastTime(0.5),
      },
      {
        restaurant_id: demoHotel.id,
        customer_id: activeCustomer.id,
        wa_message_id: "wamid.HBgMOTIzMDAxMjM0MDAxFQIAERggODExODFEMDMzNTk2Mzg5MjQzREY2",
        direction: "outbound",
        type: "interactive",
        body: "Welcome to Grand Continental Hotel! How can we assist you with your order today?",
        created_at: getPastTime(0.48),
      },
      {
        restaurant_id: demoHotel.id,
        customer_id: activeCustomer.id,
        wa_message_id: "wamid.HBgMOTIzMDAxMjM0MDAxFQIAEhggNDk5QTgzODkxM0MzM0IyMUJCOEQ5",
        direction: "inbound",
        type: "text",
        body: "2 Chicken Dum Biryani please",
        created_at: getPastTime(0.3),
      },
      {
        restaurant_id: demoHotel.id,
        customer_id: activeCustomer.id,
        wa_message_id: "wamid.HBgMOTIzMDAxMjM0MDAxFQIAERggQTQxOTk5MTk5MUMyMzkwOUI4Rjg0",
        direction: "outbound",
        type: "text",
        body: "Your order #1001 has been placed! Total: Rs 1,310.00 (including Rs 150.00 delivery fee).",
        created_at: getPastTime(0.2),
      },
    ],
  });

  // 10. Print Development Logins Table
  console.log("\n" + "=".repeat(76));
  console.log("  🚀 DEVELOPMENT LOGINS (Dev-only passwords hashed with bcrypt)");
  console.log("=".repeat(76));
  console.log("  Role          Name                    Email                   Password");
  console.log("  " + "-".repeat(72));
  console.log(`  super_admin   ${superAdmin.name.padEnd(23)} ${superAdmin.email.padEnd(23)} ${DEMO_PASSWORD_PLAIN}`);
  console.log(`  owner         ${owner.name.padEnd(23)} ${owner.email.padEnd(23)} ${DEMO_PASSWORD_PLAIN}`);
  console.log(`  manager       ${manager.name.padEnd(23)} ${manager.email.padEnd(23)} ${DEMO_PASSWORD_PLAIN}`);
  console.log(`  chef          ${chef.name.padEnd(23)} ${chef.email.padEnd(23)} ${DEMO_PASSWORD_PLAIN}`);
  console.log(`  rider         ${rider.name.padEnd(23)} ${rider.email.padEnd(23)} ${DEMO_PASSWORD_PLAIN}`);
  console.log("=".repeat(76));
  console.log("  Hotel: " + demoHotel.name + ` (ID: ${demoHotel.id})`);
  console.log("  Total Menu Categories: " + categoriesData.length);
  console.log("  Total Menu Items:      " + itemsData.length);
  console.log("  Total Sample Orders:   " + ordersConfig.length);
  console.log("=".repeat(76) + "\n");

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
