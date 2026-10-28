import type {
  Category,
  LinkItem,
  MenuItem,
  ModifierGroup,
  Order,
  OrderLine,
  OrderStatus,
  ServiceRequest,
  Settings,
  StaffUser,
  Table,
} from "./types";

export const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

export const IMAGES = {
  interior: img("1445116572660-236099ec97a0", 1400),
  interior2: img("1554118811-1e0d58224f24", 1400),
  terrace: img("1559339352-11d035aa65de", 1400),
  spread: img("1606787366850-de6330128bfc", 1400),
};

/* ---------- Modifier group templates ---------- */

const size: ModifierGroup = {
  id: "size",
  name: { en: "Size", ar: "الحجم" },
  min: 1,
  max: 1,
  options: [
    { id: "size_s", name: { en: "Small", ar: "صغير" }, price: 0 },
    { id: "size_m", name: { en: "Medium", ar: "وسط" }, price: 15 },
    { id: "size_l", name: { en: "Large", ar: "كبير" }, price: 30 },
  ],
};

const milk: ModifierGroup = {
  id: "milk",
  name: { en: "Milk", ar: "نوع الحليب" },
  min: 1,
  max: 1,
  options: [
    { id: "milk_full", name: { en: "Full cream", ar: "كامل الدسم" }, price: 0 },
    { id: "milk_skim", name: { en: "Skimmed", ar: "خالي الدسم" }, price: 0 },
    { id: "milk_oat", name: { en: "Oat milk", ar: "حليب الشوفان" }, price: 25 },
    { id: "milk_almond", name: { en: "Almond milk", ar: "حليب اللوز" }, price: 25 },
    { id: "milk_lf", name: { en: "Lactose-free", ar: "خالي اللاكتوز" }, price: 15 },
  ],
};

const coffeeExtras: ModifierGroup = {
  id: "coffee_extras",
  name: { en: "Extras", ar: "إضافات" },
  min: 0,
  max: 3,
  options: [
    { id: "x_shot", name: { en: "Extra shot", ar: "شوت إضافي" }, price: 25 },
    { id: "x_vanilla", name: { en: "Vanilla syrup", ar: "سيروب فانيليا" }, price: 15 },
    { id: "x_caramel", name: { en: "Caramel syrup", ar: "سيروب كراميل" }, price: 15 },
    { id: "x_hazel", name: { en: "Hazelnut syrup", ar: "سيروب بندق" }, price: 15 },
    { id: "x_cream", name: { en: "Whipped cream", ar: "كريمة مخفوقة" }, price: 10 },
  ],
};

const sweetness: ModifierGroup = {
  id: "sweet",
  name: { en: "Sweetness", ar: "السكر" },
  min: 1,
  max: 1,
  options: [
    { id: "sw_none", name: { en: "No sugar", ar: "بدون سكر" }, price: 0 },
    { id: "sw_less", name: { en: "Less sugar", ar: "سكر خفيف" }, price: 0 },
    { id: "sw_norm", name: { en: "Normal", ar: "عادي" }, price: 0 },
    { id: "sw_extra", name: { en: "Extra sweet", ar: "سكر زيادة" }, price: 0 },
  ],
};

const shots: ModifierGroup = {
  id: "shots",
  name: { en: "Shots", ar: "عدد الشوت" },
  min: 1,
  max: 1,
  options: [
    { id: "sh_single", name: { en: "Single", ar: "سينجل" }, price: 0 },
    { id: "sh_double", name: { en: "Double", ar: "دبل" }, price: 25 },
  ],
};

const doneness: ModifierGroup = {
  id: "doneness",
  name: { en: "Doneness", ar: "درجة الاستواء" },
  min: 1,
  max: 1,
  options: [
    { id: "d_med", name: { en: "Medium", ar: "ميديم" }, price: 0 },
    { id: "d_mw", name: { en: "Medium well", ar: "ميديم ويل" }, price: 0 },
    { id: "d_wd", name: { en: "Well done", ar: "ويل دن" }, price: 0 },
  ],
};

const burgerAddons: ModifierGroup = {
  id: "burger_addons",
  name: { en: "Add-ons", ar: "إضافات" },
  min: 0,
  max: 4,
  options: [
    { id: "b_cheddar", name: { en: "Cheddar slice", ar: "شريحة شيدر" }, price: 30 },
    { id: "b_bacon", name: { en: "Beef bacon", ar: "بيكون بقري" }, price: 45 },
    { id: "b_egg", name: { en: "Fried egg", ar: "بيضة مقلية" }, price: 25 },
    { id: "b_jalapeno", name: { en: "Jalapeños", ar: "هالبينو" }, price: 15 },
    { id: "b_onion", name: { en: "Caramelized onions", ar: "بصل مكرمل" }, price: 15 },
  ],
};

const remove: ModifierGroup = {
  id: "remove",
  name: { en: "Remove", ar: "بدون" },
  min: 0,
  max: 4,
  options: [
    { id: "r_onion", name: { en: "No onion", ar: "بدون بصل" }, price: 0 },
    { id: "r_tomato", name: { en: "No tomato", ar: "بدون طماطم" }, price: 0 },
    { id: "r_pickles", name: { en: "No pickles", ar: "بدون مخلل" }, price: 0 },
    { id: "r_sauce", name: { en: "No sauce", ar: "بدون صوص" }, price: 0 },
  ],
};

const side: ModifierGroup = {
  id: "side",
  name: { en: "Choose a side", ar: "اختر الطبق الجانبي" },
  min: 1,
  max: 1,
  options: [
    { id: "s_fries", name: { en: "Fries", ar: "بطاطس" }, price: 0 },
    { id: "s_sweet", name: { en: "Sweet potato fries", ar: "بطاطا حلوة" }, price: 30 },
    { id: "s_salad", name: { en: "Side salad", ar: "سلطة جانبية" }, price: 0 },
  ],
};

const pizzaSize: ModifierGroup = {
  id: "pizza_size",
  name: { en: "Size", ar: "الحجم" },
  min: 1,
  max: 1,
  options: [
    { id: "p_25", name: { en: "25 cm", ar: "٢٥ سم" }, price: 0 },
    { id: "p_32", name: { en: "32 cm", ar: "٣٢ سم" }, price: 70 },
  ],
};

const protein: ModifierGroup = {
  id: "protein",
  name: { en: "Add protein", ar: "إضافة بروتين" },
  min: 0,
  max: 1,
  options: [
    { id: "pr_chicken", name: { en: "Grilled chicken", ar: "دجاج مشوي" }, price: 60 },
    { id: "pr_shrimp", name: { en: "Shrimp", ar: "جمبري" }, price: 90 },
    { id: "pr_steak", name: { en: "Steak strips", ar: "شرائح ستيك" }, price: 110 },
  ],
};

const breakfastExtras: ModifierGroup = {
  id: "bf_extras",
  name: { en: "Make it extra", ar: "إضافات" },
  min: 0,
  max: 3,
  options: [
    { id: "bf_maple", name: { en: "Maple syrup", ar: "شراب القيقب" }, price: 15 },
    { id: "bf_nutella", name: { en: "Nutella", ar: "نوتيلا" }, price: 30 },
    { id: "bf_berries", name: { en: "Fresh berries", ar: "توت طازج" }, price: 35 },
    { id: "bf_icecream", name: { en: "Ice cream scoop", ar: "بولة آيس كريم" }, price: 40 },
  ],
};

const juiceSize: ModifierGroup = {
  id: "juice_size",
  name: { en: "Size", ar: "الحجم" },
  min: 1,
  max: 1,
  options: [
    { id: "j_reg", name: { en: "Regular", ar: "عادي" }, price: 0 },
    { id: "j_lg", name: { en: "Large", ar: "كبير" }, price: 25 },
  ],
};

const dessertAddon: ModifierGroup = {
  id: "dessert_add",
  name: { en: "Add on", ar: "إضافة" },
  min: 0,
  max: 1,
  options: [
    { id: "da_ice", name: { en: "Vanilla ice cream", ar: "آيس كريم فانيليا" }, price: 40 },
    { id: "da_cream", name: { en: "Fresh cream", ar: "كريمة طازجة" }, price: 20 },
  ],
};

/* ---------- Categories ---------- */

export const seedCategories: Category[] = [
  { id: "hot", name: { en: "Hot Coffee", ar: "قهوة ساخنة" }, icon: "☕", active: true },
  { id: "iced", name: { en: "Iced & Cold", ar: "مشروبات باردة" }, icon: "🧊", active: true },
  { id: "breakfast", name: { en: "Breakfast", ar: "الفطور" }, icon: "🥞", active: true },
  { id: "bowls", name: { en: "Salads & Bowls", ar: "سلطات وبولز" }, icon: "🥗", active: true },
  { id: "mains", name: { en: "Burgers & Mains", ar: "برجر وأطباق رئيسية" }, icon: "🍔", active: true },
  { id: "pizza", name: { en: "Pizza & Pasta", ar: "بيتزا وباستا" }, icon: "🍕", active: true },
  { id: "desserts", name: { en: "Desserts", ar: "الحلويات" }, icon: "🍰", active: true },
  { id: "fresh", name: { en: "Juices & Smoothies", ar: "عصائر وسموذي" }, icon: "🍊", active: true },
];

/* ---------- Menu items ---------- */

type Seed = Omit<MenuItem, "available" | "schedule" | "prepMinutes" | "calories"> &
  Partial<Pick<MenuItem, "available" | "schedule" | "prepMinutes" | "calories">>;

const items: Seed[] = [
  // Hot coffee
  {
    id: "espresso", categoryId: "hot", price: 75, image: img("1559496417-e7f25cb247f3"),
    name: { en: "Espresso", ar: "إسبريسو" },
    description: { en: "Single-origin Ethiopian beans, bright and chocolatey with a velvety crema.", ar: "حبوب إثيوبية أحادية المصدر، طعم مشرق مع لمسة شوكولاتة وكريما ناعمة." },
    tags: [], allergens: [], calories: 5, prepMinutes: 3, modifierGroups: [shots, sweetness],
  },
  {
    id: "cappuccino", categoryId: "hot", price: 115, image: img("1572442388796-11668a67e53d"),
    name: { en: "Cappuccino", ar: "كابتشينو" },
    description: { en: "Double espresso, steamed milk and a thick cloud of micro-foam.", ar: "دبل إسبريسو مع حليب مبخر ورغوة كثيفة." },
    tags: ["popular"], allergens: ["dairy"], calories: 130, prepMinutes: 4, modifierGroups: [size, milk, coffeeExtras, sweetness],
  },
  {
    id: "flatwhite", categoryId: "hot", price: 120, image: img("1509042239860-f550ce710b93"),
    name: { en: "Flat White", ar: "فلات وايت" },
    description: { en: "Ristretto shots with silky, thin-textured milk. Strong and smooth.", ar: "شوتات ريستريتو مع حليب حريري. قوي وناعم." },
    tags: [], allergens: ["dairy"], calories: 110, prepMinutes: 4, modifierGroups: [milk, coffeeExtras, sweetness],
  },
  {
    id: "spanish", categoryId: "hot", price: 135, image: img("1541167760496-1628856ab772"),
    name: { en: "Spanish Latte", ar: "سبانش لاتيه" },
    description: { en: "Our signature: espresso, condensed milk and steamed milk. Sweet and creamy.", ar: "مشروبنا المميز: إسبريسو مع حليب مكثف وحليب مبخر. حلو وكريمي." },
    tags: ["popular", "chef"], allergens: ["dairy"], calories: 220, prepMinutes: 4, modifierGroups: [size, milk, coffeeExtras],
  },
  {
    id: "americano", categoryId: "hot", price: 90, image: img("1514432324607-a09d9b4aefdd"),
    name: { en: "Americano", ar: "أمريكانو" },
    description: { en: "Espresso lengthened with hot water. Clean, bold, simple.", ar: "إسبريسو مع ماء ساخن. طعم نظيف وقوي." },
    tags: [], allergens: [], calories: 10, prepMinutes: 3, modifierGroups: [size, sweetness],
  },
  {
    id: "matcha", categoryId: "hot", price: 145, image: img("1515823064-d6e0c04616a7"),
    name: { en: "Matcha Latte", ar: "ماتشا لاتيه" },
    description: { en: "Ceremonial-grade Uji matcha whisked with steamed milk.", ar: "ماتشا ياباني فاخر مخفوق مع حليب مبخر." },
    tags: ["new"], allergens: ["dairy"], calories: 160, prepMinutes: 5, modifierGroups: [size, milk, sweetness],
  },
  {
    id: "chai", categoryId: "hot", price: 120, image: img("1517487881594-2787fef5ebf7"),
    name: { en: "Chai Latte", ar: "شاي لاتيه" },
    description: { en: "House-brewed spiced chai with cinnamon, cardamom and steamed milk.", ar: "شاي متبل بالقرفة والهيل مع حليب مبخر." },
    tags: ["vegetarian"], allergens: ["dairy"], calories: 180, prepMinutes: 4, modifierGroups: [size, milk, sweetness],
  },

  // Iced
  {
    id: "iced_spanish", categoryId: "iced", price: 145, image: img("1461023058943-07fcbe16d735"),
    name: { en: "Iced Spanish Latte", ar: "آيس سبانش لاتيه" },
    description: { en: "Our best-seller over ice. Espresso, condensed milk, cold milk.", ar: "الأكثر مبيعًا مع الثلج. إسبريسو وحليب مكثف وحليب بارد." },
    tags: ["popular"], allergens: ["dairy"], calories: 240, prepMinutes: 4, modifierGroups: [size, milk, coffeeExtras],
  },
  {
    id: "iced_caramel", categoryId: "iced", price: 150, image: img("1558857563-b371033873b8"),
    name: { en: "Iced Caramel Macchiato", ar: "آيس كراميل ماكياتو" },
    description: { en: "Vanilla milk, espresso layered on top and a buttery caramel drizzle.", ar: "حليب بالفانيليا مع إسبريسو وصوص كراميل بالزبدة." },
    tags: [], allergens: ["dairy"], calories: 260, prepMinutes: 4, modifierGroups: [size, milk, coffeeExtras],
  },
  {
    id: "freakshake", categoryId: "iced", price: 165, image: img("1563805042-7684c019e1cb"),
    name: { en: "Chocolate Freakshake", ar: "فريك شيك شوكولاتة" },
    description: { en: "Thick chocolate shake, whipped cream, cookie crumble and fudge.", ar: "ميلك شيك شوكولاتة كثيف مع كريمة وكوكيز وصوص فدج." },
    tags: ["new"], allergens: ["dairy", "gluten"], calories: 620, prepMinutes: 5, modifierGroups: [],
  },
  {
    id: "peach_tea", categoryId: "iced", price: 95, image: img("1556679343-c7306c1976bc"),
    name: { en: "Iced Peach Tea", ar: "آيس تي بالخوخ" },
    description: { en: "Cold-brewed black tea, peach purée, fresh lemon.", ar: "شاي أسود مخمر على البارد مع هريس الخوخ والليمون." },
    tags: ["vegan"], allergens: [], calories: 90, prepMinutes: 2, modifierGroups: [juiceSize, sweetness],
  },
  {
    id: "mojito", categoryId: "iced", price: 110, image: img("1544145945-f90425340c7e"),
    name: { en: "Passion Mojito", ar: "موهيتو باشن فروت" },
    description: { en: "Passion fruit, fresh mint, lime and sparkling soda.", ar: "باشن فروت مع نعناع طازج وليمون وصودا." },
    tags: ["vegan"], allergens: [], calories: 120, prepMinutes: 3, modifierGroups: [sweetness],
  },

  // Breakfast
  {
    id: "french_toast", categoryId: "breakfast", price: 175, image: img("1484723091739-30a097e8f929"),
    name: { en: "Brioche French Toast", ar: "فرنش توست بريوش" },
    description: { en: "Thick brioche, banana, blueberries, mascarpone and maple.", ar: "بريوش سميك مع موز وتوت ومسكربوني وشراب القيقب." },
    tags: ["vegetarian"], allergens: ["gluten", "dairy", "eggs"], calories: 540, prepMinutes: 10, schedule: "breakfast", modifierGroups: [breakfastExtras],
  },
  {
    id: "pancakes", categoryId: "breakfast", price: 185, image: img("1528207776546-365bb710ee93"),
    name: { en: "Blueberry Pancakes", ar: "بان كيك بالتوت" },
    description: { en: "Three fluffy buttermilk pancakes, blueberry compote, banana, honey butter.", ar: "ثلاث قطع بان كيك هشة مع كومبوت التوت وموز وزبدة بالعسل." },
    tags: ["popular", "vegetarian"], allergens: ["gluten", "dairy", "eggs"], calories: 610, prepMinutes: 12, schedule: "breakfast", modifierGroups: [breakfastExtras],
  },
  {
    id: "benedict", categoryId: "breakfast", price: 195, image: img("1608039829572-78524f79c4c7"),
    name: { en: "Eggs Benedict", ar: "إيجز بنديكت" },
    description: { en: "Poached eggs, smoked turkey, toasted muffin and hollandaise.", ar: "بيض بوشيه مع تركي مدخن على مافن محمص وصوص هولنديز." },
    tags: ["chef"], allergens: ["gluten", "dairy", "eggs"], calories: 520, prepMinutes: 12, schedule: "breakfast", modifierGroups: [],
  },
  {
    id: "egg_toast", categoryId: "breakfast", price: 165, image: img("1525351484163-7529414344d8"),
    name: { en: "Sunny Egg Sourdough", ar: "توست ساوردو بالبيض" },
    description: { en: "Sourdough, smashed avocado, sunny-side egg, chili flakes.", ar: "خبز ساوردو مع أفوكادو مهروس وبيضة عيون وشطة مجروشة." },
    tags: ["vegetarian"], allergens: ["gluten", "eggs"], calories: 430, prepMinutes: 8, schedule: "breakfast", modifierGroups: [],
  },
  {
    id: "croissant", categoryId: "breakfast", price: 70, image: img("1555507036-ab1f4038808a"),
    name: { en: "Butter Croissant", ar: "كرواسون بالزبدة" },
    description: { en: "Baked every morning with French butter. Flaky and golden.", ar: "يُخبز كل صباح بالزبدة الفرنسية. هش وذهبي." },
    tags: ["vegetarian"], allergens: ["gluten", "dairy"], calories: 290, prepMinutes: 2, modifierGroups: [],
  },
  {
    id: "parfait", categoryId: "breakfast", price: 120, image: img("1488477181946-6428a0291777"),
    name: { en: "Greek Yogurt Parfait", ar: "بارفيه زبادي يوناني" },
    description: { en: "Greek yogurt, house granola, strawberries and honey.", ar: "زبادي يوناني مع جرانولا منزلية وفراولة وعسل." },
    tags: ["vegetarian"], allergens: ["dairy", "nuts"], calories: 320, prepMinutes: 3, modifierGroups: [],
  },

  // Bowls
  {
    id: "buddha", categoryId: "bowls", price: 210, image: img("1512621776951-a57141f2eefd"),
    name: { en: "Rainbow Buddha Bowl", ar: "بودا بول ملون" },
    description: { en: "Avocado, chickpeas, roasted sweet potato, greens, tahini dressing.", ar: "أفوكادو وحمص وبطاطا حلوة مشوية وخضار مع صوص الطحينة." },
    tags: ["vegan"], allergens: ["soy"], calories: 480, prepMinutes: 8, modifierGroups: [protein],
  },
  {
    id: "chicken_bowl", categoryId: "bowls", price: 235, image: img("1546069901-ba9599a7e63c"),
    name: { en: "Grilled Chicken Bowl", ar: "بول دجاج مشوي" },
    description: { en: "Herb chicken, quinoa, corn, cherry tomato, greens, lemon dressing.", ar: "دجاج بالأعشاب مع كينوا وذرة وطماطم شيري وصوص الليمون." },
    tags: ["popular"], allergens: [], calories: 520, prepMinutes: 10, modifierGroups: [],
  },
  {
    id: "steak_salad", categoryId: "bowls", price: 275, image: img("1504674900247-0877df9cc836"),
    name: { en: "Steak & Greens", ar: "سلطة ستيك" },
    description: { en: "Sliced sirloin, rocket, cashews, chili-lime vinaigrette.", ar: "شرائح ستيك مع جرجير وكاجو وصوص الليمون والشطة." },
    tags: ["spicy"], allergens: ["nuts"], calories: 560, prepMinutes: 14, modifierGroups: [doneness],
  },

  // Mains
  {
    id: "signature_burger", categoryId: "mains", price: 265, image: img("1568901346375-23c9450c58cd"),
    name: { en: "Café X Signature Burger", ar: "برجر كافيه إكس المميز" },
    description: { en: "200g Angus beef, aged cheddar, house sauce, brioche bun.", ar: "لحم أنجس ٢٠٠ جم مع شيدر معتق وصوص خاص وخبز بريوش." },
    tags: ["popular", "chef"], allergens: ["gluten", "dairy", "eggs"], calories: 880, prepMinutes: 15, modifierGroups: [doneness, side, burgerAddons, remove],
  },
  {
    id: "smash", categoryId: "mains", price: 295, image: img("1572802419224-296b0aeee0d9"),
    name: { en: "Double Smash Burger", ar: "دبل سماش برجر" },
    description: { en: "Two crispy smashed patties, American cheese, pickles, onions.", ar: "قطعتين لحم سماش مقرمش مع جبنة أمريكية ومخلل وبصل." },
    tags: ["new"], allergens: ["gluten", "dairy"], calories: 960, prepMinutes: 14, modifierGroups: [side, burgerAddons, remove],
  },
  {
    id: "crispy_chicken", categoryId: "mains", price: 240, image: img("1626082927389-6cd097cdc6ec"),
    name: { en: "Crispy Fried Chicken", ar: "فراخ كرسبي" },
    description: { en: "Buttermilk-brined chicken, spicy honey glaze, slaw.", ar: "دجاج متبل باللبن مع صوص العسل الحار وكول سلو." },
    tags: ["spicy"], allergens: ["gluten", "dairy"], calories: 820, prepMinutes: 16, modifierGroups: [side],
  },
  {
    id: "steak_frites", categoryId: "mains", price: 420, image: img("1600891964092-4316c288032e"),
    name: { en: "Steak Frites", ar: "ستيك مع بطاطس" },
    description: { en: "250g ribeye, peppercorn sauce, hand-cut fries.", ar: "ريب آي ٢٥٠ جم مع صوص الفلفل الأسود وبطاطس مقطعة يدويًا." },
    tags: ["chef"], allergens: ["dairy"], calories: 980, prepMinutes: 20, schedule: "evening", modifierGroups: [doneness],
  },
  {
    id: "club", categoryId: "mains", price: 195, image: img("1528735602780-2552fd46c7af"),
    name: { en: "Classic Club Sandwich", ar: "كلوب ساندوتش" },
    description: { en: "Triple-decker with chicken, turkey, egg, cheddar and fries.", ar: "ثلاث طبقات مع دجاج وتركي وبيض وشيدر وبطاطس." },
    tags: [], allergens: ["gluten", "dairy", "eggs"], calories: 760, prepMinutes: 10, modifierGroups: [remove],
  },
  {
    id: "wraps", categoryId: "mains", price: 185, image: img("1562059390-a761a084768e"),
    name: { en: "Chicken Shawarma Wraps", ar: "راب شاورما دجاج" },
    description: { en: "Two wraps, garlic toum, pickles, fries on the side.", ar: "قطعتين راب مع ثومية ومخلل وبطاطس." },
    tags: ["popular"], allergens: ["gluten"], calories: 690, prepMinutes: 10, modifierGroups: [remove],
  },

  // Pizza & pasta
  {
    id: "margherita", categoryId: "pizza", price: 215, image: img("1585238342024-78d387f4a707"),
    name: { en: "Margherita", ar: "بيتزا مارجريتا" },
    description: { en: "San Marzano tomato, fior di latte, basil, olive oil.", ar: "صلصة طماطم سان مارزانو مع موتزاريلا طازجة وريحان." },
    tags: ["vegetarian"], allergens: ["gluten", "dairy"], calories: 780, prepMinutes: 14, modifierGroups: [pizzaSize],
  },
  {
    id: "bbq_pizza", categoryId: "pizza", price: 255, image: img("1565299624946-b28f40a0ae38"),
    name: { en: "BBQ Chicken Pizza", ar: "بيتزا دجاج باربكيو" },
    description: { en: "Smoky BBQ sauce, chicken, red onion, mozzarella, coriander.", ar: "صوص باربكيو مدخن مع دجاج وبصل أحمر وموتزاريلا." },
    tags: [], allergens: ["gluten", "dairy"], calories: 890, prepMinutes: 15, modifierGroups: [pizzaSize],
  },
  {
    id: "arrabbiata", categoryId: "pizza", price: 190, image: img("1621996346565-e3dbc646d9a9"),
    name: { en: "Penne Arrabbiata", ar: "بيني أرابياتا" },
    description: { en: "Spicy tomato and garlic sauce, parmesan, fresh parsley.", ar: "صلصة طماطم حارة بالثوم مع بارميزان وبقدونس." },
    tags: ["spicy", "vegetarian"], allergens: ["gluten", "dairy"], calories: 640, prepMinutes: 12, modifierGroups: [protein],
  },
  {
    id: "alfredo", categoryId: "pizza", price: 225, image: img("1551183053-bf91a1d81141"),
    name: { en: "Fettuccine Alfredo", ar: "فيتوتشيني ألفريدو" },
    description: { en: "Creamy parmesan sauce, mushrooms, black pepper.", ar: "صوص بارميزان كريمي مع مشروم وفلفل أسود." },
    tags: [], allergens: ["gluten", "dairy"], calories: 820, prepMinutes: 13, available: false, modifierGroups: [protein],
  },

  // Desserts
  {
    id: "tiramisu", categoryId: "desserts", price: 135, image: img("1571877227200-a0d98ea607e9"),
    name: { en: "Tiramisu", ar: "تيراميسو" },
    description: { en: "Espresso-soaked ladyfingers, mascarpone cream, cocoa.", ar: "بسكويت مغموس بالإسبريسو مع كريمة مسكربوني وكاكاو." },
    tags: ["popular"], allergens: ["gluten", "dairy", "eggs"], calories: 450, prepMinutes: 2, modifierGroups: [],
  },
  {
    id: "brownie", categoryId: "desserts", price: 115, image: img("1606313564200-e75d5e30476c"),
    name: { en: "Molten Brownie", ar: "براوني ساخن" },
    description: { en: "Warm fudge brownie, gooey center, sea salt.", ar: "براوني دافئ بقلب سائل ورشة ملح." },
    tags: [], allergens: ["gluten", "dairy", "eggs"], calories: 510, prepMinutes: 6, modifierGroups: [dessertAddon],
  },
  {
    id: "raspberry_cake", categoryId: "desserts", price: 140, image: img("1565958011703-44f9829ba187"),
    name: { en: "Raspberry Layer Cake", ar: "كيك التوت الأحمر" },
    description: { en: "Vanilla sponge, raspberry jam, light cream cheese frosting.", ar: "كيك فانيليا مع مربى التوت وكريمة الجبن الخفيفة." },
    tags: ["new"], allergens: ["gluten", "dairy", "eggs"], calories: 480, prepMinutes: 2, modifierGroups: [],
  },
  {
    id: "fudge_cake", categoryId: "desserts", price: 130, image: img("1578985545062-69928b1d9587"),
    name: { en: "Chocolate Fudge Cake", ar: "كيك شوكولاتة فدج" },
    description: { en: "Rich dark chocolate layers with ganache.", ar: "طبقات شوكولاتة داكنة غنية مع جاناش." },
    tags: [], allergens: ["gluten", "dairy", "eggs"], calories: 560, prepMinutes: 2, modifierGroups: [dessertAddon],
  },
  {
    id: "donuts", categoryId: "desserts", price: 65, image: img("1551024601-bec78aea704b"),
    name: { en: "Glazed Donut", ar: "دونتس" },
    description: { en: "Daily-made donut with rotating glazes and sprinkles.", ar: "دونتس طازج يوميًا بنكهات متنوعة." },
    tags: [], allergens: ["gluten", "dairy", "eggs"], calories: 310, prepMinutes: 1, modifierGroups: [],
  },
  {
    id: "cookies", categoryId: "desserts", price: 55, image: img("1558961363-fa8fdf82db35"),
    name: { en: "Chunky Cookie", ar: "كوكيز بالشوكولاتة" },
    description: { en: "Brown-butter cookie with dark chocolate chunks.", ar: "كوكيز بالزبدة البنية وقطع الشوكولاتة الداكنة." },
    tags: [], allergens: ["gluten", "dairy", "eggs", "nuts"], calories: 280, prepMinutes: 1, modifierGroups: [],
  },

  // Fresh
  {
    id: "orange", categoryId: "fresh", price: 85, image: img("1600271886742-f049cd451bba"),
    name: { en: "Fresh Orange Juice", ar: "عصير برتقال فريش" },
    description: { en: "Squeezed to order. Nothing added.", ar: "يُعصر عند الطلب. بدون إضافات." },
    tags: ["vegan"], allergens: [], calories: 140, prepMinutes: 3, modifierGroups: [juiceSize, sweetness],
  },
  {
    id: "berry_smoothie", categoryId: "fresh", price: 125, image: img("1505252585461-04db1eb84625"),
    name: { en: "Berry Blast Smoothie", ar: "سموذي التوت" },
    description: { en: "Strawberry, blueberry, banana, yogurt and honey.", ar: "فراولة وتوت أزرق وموز وزبادي وعسل." },
    tags: ["vegetarian"], allergens: ["dairy"], calories: 260, prepMinutes: 4, modifierGroups: [juiceSize],
  },
];

export const seedItems: MenuItem[] = items.map((i) => ({
  available: true,
  schedule: "all_day",
  prepMinutes: 8,
  calories: 300,
  ...i,
}));

/* ---------- Tables ---------- */

const token = (n: number) =>
  "tbl_" + ((n * 2654435761) >>> 0).toString(36).padStart(7, "0").slice(0, 7);

export const seedTables: Table[] = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `t${i + 1}`,
    label: `${i + 1}`,
    token: token(i + 1),
    zone: (i < 6 ? "Indoor" : "Window") as Table["zone"],
    seats: i % 3 === 0 ? 2 : 4,
    active: true,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `t${i + 11}`,
    label: `T${i + 1}`,
    token: token(i + 11),
    zone: "Terrace" as const,
    seats: i % 2 ? 6 : 4,
    active: i !== 5,
  })),
  { id: "bar", label: "Bar", token: token(99), zone: "Counter", seats: 6, active: true },
];

/* ---------- Link tree ---------- */

export const seedLinks: LinkItem[] = [
  { id: "l1", icon: "instagram", label: { en: "Instagram", ar: "إنستجرام" }, url: "https://instagram.com/", active: true, clicks: 1284 },
  { id: "l2", icon: "tiktok", label: { en: "TikTok", ar: "تيك توك" }, url: "https://tiktok.com/", active: true, clicks: 642 },
  { id: "l3", icon: "whatsapp", label: { en: "WhatsApp us", ar: "راسلنا واتساب" }, url: "https://wa.me/201000000000", active: true, clicks: 418 },
  { id: "l4", icon: "maps", label: { en: "Find us on Google Maps", ar: "موقعنا على الخريطة" }, url: "https://maps.google.com/", active: true, clicks: 377 },
  { id: "l5", icon: "delivery", label: { en: "Order delivery", ar: "اطلب توصيل" }, url: "https://example.com/delivery", active: true, clicks: 203 },
  { id: "l6", icon: "facebook", label: { en: "Facebook", ar: "فيسبوك" }, url: "https://facebook.com/", active: false, clicks: 96 },
  { id: "l7", icon: "phone", label: { en: "Call to reserve", ar: "اتصل للحجز" }, url: "tel:+201000000000", active: true, clicks: 155 },
];

/* ---------- Staff ---------- */

export const seedStaff: StaffUser[] = [
  { id: "u1", name: "Omar Khaled", email: "omar@cafex.demo", role: "owner", active: true, lastActive: 0, color: "#8f4e18" },
  { id: "u2", name: "Mariam Adel", email: "mariam@cafex.demo", role: "manager", active: true, lastActive: 0, color: "#4f7a5a" },
  { id: "u3", name: "Youssef Samir", email: "youssef@cafex.demo", role: "cashier", active: true, lastActive: 0, color: "#3d5a80" },
  { id: "u4", name: "Hana Mostafa", email: "hana@cafex.demo", role: "waiter", active: true, lastActive: 0, color: "#9a4c7e" },
  { id: "u5", name: "Karim Fathy", email: "karim@cafex.demo", role: "kitchen", active: true, lastActive: 0, color: "#b5651d" },
  { id: "u6", name: "Nour Ibrahim", email: "nour@cafex.demo", role: "kitchen", active: false, lastActive: 0, color: "#6b6b6b" },
];

/* ---------- Settings ---------- */

export const seedSettings: Settings = {
  venueName: "Café X",
  tagline: { en: "Coffee · Kitchen · Good company", ar: "قهوة · مطبخ · صحبة حلوة" },
  address: { en: "12 El Gezira St, Zamalek, Cairo", ar: "١٢ شارع الجزيرة، الزمالك، القاهرة" },
  phone: "+20 100 000 0000",
  currency: "EGP",
  taxPercent: 14,
  servicePercent: 12,
  serviceOnTakeaway: false,
  acceptingOrders: true,
  requirePhoneTakeaway: true,
  paymentFlow: "pay_after",
  brandColor: "#c8742f",
  coverImage: IMAGES.interior,
  defaultLang: "en",
  hours: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => ({
    day,
    open: "08:00",
    close: day === "Thu" || day === "Fri" ? "02:00" : "00:00",
    closed: false,
  })),
  payments: { cash: true, cardAtTable: true, online: false, provider: "Paymob" },
  soundAlerts: true,
};

/* ---------- Demo orders ---------- */

export function priceLine(item: MenuItem, qty: number, optionIds: string[], notes = ""): OrderLine {
  const mods = item.modifierGroups.flatMap((g) => g.options).filter((o) => optionIds.includes(o.id));
  return {
    lineId: Math.random().toString(36).slice(2, 9),
    itemId: item.id,
    name: item.name,
    unitPrice: item.price + mods.reduce((s, m) => s + m.price, 0),
    quantity: qty,
    modifiers: mods.map((m) => ({ id: m.id, name: m.name, price: m.price })),
    notes,
  };
}

export function totals(lines: OrderLine[], s: Settings, type: "dine_in" | "takeaway") {
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const service = type === "dine_in" || s.serviceOnTakeaway ? Math.round(subtotal * s.servicePercent) / 100 : 0;
  const tax = Math.round((subtotal + service) * s.taxPercent) / 100;
  return { subtotal, service, tax, total: Math.round((subtotal + service + tax) * 100) / 100 };
}

const byId = (id: string) => seedItems.find((i) => i.id === id)!;

export function seedOrders(now: number): Order[] {
  const min = 60_000;
  const specs: {
    n: number; ago: number; status: OrderStatus; type: "dine_in" | "takeaway"; table?: string; name?: string;
    lines: [string, number, string[], string?][]; paid?: boolean; notes?: string;
  }[] = [
    { n: 31, ago: 2, status: "received", type: "dine_in", table: "7", lines: [["iced_spanish", 2, ["size_m", "milk_oat"]], ["pancakes", 1, ["bf_berries"]]], notes: "Birthday table, candle on pancakes please 🎂" },
    { n: 30, ago: 4, status: "received", type: "takeaway", name: "Sara", lines: [["cappuccino", 1, ["size_l", "milk_almond", "sw_less"]], ["croissant", 2, []]] },
    { n: 29, ago: 9, status: "preparing", type: "dine_in", table: "T2", lines: [["signature_burger", 2, ["d_mw", "s_fries", "b_bacon", "r_onion"]], ["mojito", 2, ["sw_less"]]] },
    { n: 28, ago: 13, status: "preparing", type: "dine_in", table: "3", lines: [["buddha", 1, ["pr_chicken"], "Dressing on the side"], ["orange", 1, ["j_lg", "sw_none"]]] },
    { n: 27, ago: 16, status: "ready", type: "takeaway", name: "Ahmed", lines: [["smash", 1, ["s_sweet", "b_jalapeno"]], ["peach_tea", 1, ["j_reg", "sw_norm"]]], paid: true },
    { n: 26, ago: 22, status: "ready", type: "dine_in", table: "9", lines: [["margherita", 1, ["p_32"]], ["arrabbiata", 1, []], ["tiramisu", 2, []]] },
    { n: 25, ago: 38, status: "served", type: "dine_in", table: "1", lines: [["benedict", 2, []], ["flatwhite", 2, ["milk_full", "sw_none"]]], paid: true },
    { n: 24, ago: 51, status: "served", type: "dine_in", table: "T4", lines: [["chicken_bowl", 1, []], ["matcha", 1, ["size_m", "milk_oat", "sw_less"]]] },
    { n: 23, ago: 64, status: "served", type: "takeaway", name: "Laila", lines: [["spanish", 3, ["size_m", "milk_full"]]], paid: true },
    { n: 22, ago: 80, status: "cancelled", type: "dine_in", table: "5", lines: [["steak_frites", 1, ["d_med"]]] },
  ];
  const s = seedSettings;
  return specs.map((o) => {
    const lines = o.lines.map(([id, q, mods, notes]) => priceLine(byId(id), q, mods, notes ?? ""));
    const t = totals(lines, s, o.type);
    const createdAt = now - o.ago * min;
    const flow: OrderStatus[] = ["received", "preparing", "ready", "served"];
    const upto = o.status === "cancelled" ? 0 : flow.indexOf(o.status);
    const history = flow.slice(0, upto + 1).map((st, i) => ({ status: st, at: createdAt + i * Math.min(6, o.ago / 3) * min }));
    if (o.status === "cancelled") history.push({ status: "cancelled", at: createdAt + 3 * min });
    return {
      id: `ord_${o.n}`,
      number: o.n,
      type: o.type,
      tableLabel: o.table,
      customerName: o.name,
      customerPhone: o.type === "takeaway" ? "+20 10 1234 5678" : undefined,
      notes: o.notes,
      items: lines,
      ...t,
      status: o.status,
      paymentStatus: o.paid ? "paid" : "unpaid",
      paymentMethod: o.paid ? "card" : undefined,
      createdAt,
      updatedAt: history[history.length - 1].at,
      history,
      cancelReason: o.status === "cancelled" ? "Item out of stock" : undefined,
    } satisfies Order;
  });
}

export function seedRequests(now: number): ServiceRequest[] {
  return [{ id: "rq1", tableLabel: "4", kind: "bill", at: now - 90_000, resolved: false }];
}

/* ---------- Deterministic history for reports ---------- */

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

export function salesHistory(days: number) {
  const r = rng(42);
  const out: { date: Date; revenue: number; orders: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const weekend = d.getDay() === 4 || d.getDay() === 5;
    const orders = Math.round((weekend ? 150 : 105) + r() * 40);
    out.push({ date: d, orders, revenue: Math.round(orders * (265 + r() * 70)) });
  }
  return out;
}

export const HOURLY = [
  { h: "8", v: 14 }, { h: "9", v: 26 }, { h: "10", v: 31 }, { h: "11", v: 22 }, { h: "12", v: 18 },
  { h: "13", v: 27 }, { h: "14", v: 33 }, { h: "15", v: 21 }, { h: "16", v: 17 }, { h: "17", v: 19 },
  { h: "18", v: 24 }, { h: "19", v: 36 }, { h: "20", v: 42 }, { h: "21", v: 39 }, { h: "22", v: 28 },
  { h: "23", v: 16 },
];
