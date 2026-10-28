"use client";

import { useDevice, useVenue } from "./store";
import type { Allergen, L10n, Lang, OrderStatus, Tag } from "./types";

const dict = {
  orderNow: { en: "Order Now", ar: "اطلب الآن" },
  orderNowSub: { en: "Browse the menu & order from your table", ar: "تصفح المنيو واطلب من طاولتك" },
  openNow: { en: "Open now", ar: "مفتوح الآن" },
  closesAt: { en: "Closes", ar: "يغلق" },
  table: { en: "Table", ar: "طاولة" },
  youAreAt: { en: "You're at table", ar: "أنت على طاولة" },
  searchMenu: { en: "Search the menu…", ar: "ابحث في المنيو…" },
  popular: { en: "Most loved", ar: "الأكثر طلبًا" },
  soldOut: { en: "Sold out", ar: "نفدت الكمية" },
  add: { en: "Add", ar: "أضف" },
  addToOrder: { en: "Add to order", ar: "أضف للطلب" },
  required: { en: "Required", ar: "إجباري" },
  optional: { en: "Optional", ar: "اختياري" },
  chooseUpTo: { en: "Choose up to", ar: "اختر حتى" },
  chooseOne: { en: "Choose 1", ar: "اختر ١" },
  specialRequest: { en: "Special request", ar: "طلب خاص" },
  specialPlaceholder: { en: "E.g. no ice, sauce on the side…", ar: "مثال: بدون ثلج، الصوص على الجانب…" },
  allergens: { en: "Allergens", ar: "مسببات الحساسية" },
  kcal: { en: "kcal", ar: "سعرة" },
  min: { en: "min", ar: "دقيقة" },
  viewOrder: { en: "View order", ar: "عرض الطلب" },
  items: { en: "items", ar: "أصناف" },
  item: { en: "item", ar: "صنف" },
  yourOrder: { en: "Your order", ar: "طلبك" },
  emptyCart: { en: "Your order is empty", ar: "طلبك فارغ" },
  emptyCartSub: { en: "Add something delicious from the menu.", ar: "أضف شيئًا لذيذًا من المنيو." },
  backToMenu: { en: "Back to menu", ar: "العودة للمنيو" },
  dineIn: { en: "Dine-in", ar: "داخل المكان" },
  takeaway: { en: "Takeaway", ar: "تيك أواي" },
  selectTable: { en: "Select your table", ar: "اختر طاولتك" },
  yourName: { en: "Your name", ar: "اسمك" },
  phone: { en: "Mobile number", ar: "رقم الموبايل" },
  optionalField: { en: "(optional)", ar: "(اختياري)" },
  orderNotes: { en: "Notes for the kitchen", ar: "ملاحظات للمطبخ" },
  payment: { en: "Payment", ar: "الدفع" },
  payCounter: { en: "Pay at counter / cash", ar: "الدفع عند الكاشير / كاش" },
  payCard: { en: "Card at the table", ar: "بطاقة على الطاولة" },
  payOnline: { en: "Pay online now", ar: "ادفع أونلاين الآن" },
  comingSoon: { en: "Phase 2", ar: "قريبًا" },
  subtotal: { en: "Subtotal", ar: "المجموع الفرعي" },
  service: { en: "Service", ar: "الخدمة" },
  vat: { en: "VAT", ar: "ضريبة القيمة المضافة" },
  total: { en: "Total", ar: "الإجمالي" },
  placeOrder: { en: "Place order", ar: "تأكيد الطلب" },
  addToOpen: { en: "Add to my open order", ar: "أضف لطلبي المفتوح" },
  addToOpenSub: { en: "Send these items to the kitchen as part of order", ar: "أرسل هذه الأصناف للمطبخ ضمن الطلب" },
  orderNumber: { en: "Order", ar: "طلب رقم" },
  thanks: { en: "Thank you! Your order is in.", ar: "شكرًا! تم استلام طلبك." },
  estReady: { en: "Estimated ready in", ar: "الوقت المتوقع" },
  orderMore: { en: "Order more", ar: "اطلب المزيد" },
  callWaiter: { en: "Call waiter", ar: "نداء الويتر" },
  requestBill: { en: "Request the bill", ar: "طلب الحساب" },
  needHelp: { en: "Need anything?", ar: "تحتاج شيئًا؟" },
  waiterOnWay: { en: "A team member is on the way", ar: "أحد أفراد الفريق في الطريق إليك" },
  billOnWay: { en: "Your bill is on its way", ar: "الحساب في الطريق إليك" },
  paid: { en: "Paid", ar: "مدفوع" },
  unpaid: { en: "Payment due", ar: "لم يُدفع" },
  myOrders: { en: "My orders", ar: "طلباتي" },
  closedForOrders: { en: "Online ordering is paused right now. Please ask our team.", ar: "الطلب الإلكتروني متوقف حاليًا. يرجى سؤال الفريق." },
  noResults: { en: "Nothing matches your search", ar: "لا توجد نتائج" },
  breakfastOnly: { en: "Served 8 AM – 1 PM", ar: "يُقدم من ٨ ص حتى ١ م" },
  eveningOnly: { en: "Served after 5 PM", ar: "يُقدم بعد ٥ م" },
  promoTitle: { en: "Breakfast is served", ar: "الفطور جاهز" },
  promoSub: { en: "Any breakfast + hot coffee for EGP 199 until 1 PM", ar: "أي فطور + قهوة ساخنة بـ ١٩٩ ج.م حتى ١ ظهرًا" },
  nameRequired: { en: "Name and mobile are required for takeaway", ar: "الاسم ورقم الموبايل مطلوبان للتيك أواي" },
  tableRequired: { en: "Please select your table", ar: "يرجى اختيار الطاولة" },
  processing: { en: "Processing payment…", ar: "جاري معالجة الدفع…" },
  cardNumber: { en: "Card number", ar: "رقم البطاقة" },
  payNow: { en: "Pay", ar: "ادفع" },
  securePay: { en: "Secured by", ar: "مؤمن بواسطة" },
  hours: { en: "Opening hours", ar: "مواعيد العمل" },
  poweredBy: { en: "Powered by", ar: "مدعوم من" },
  pickupAt: { en: "Pick up at the counter", ar: "استلم من الكاشير" },
  servedTo: { en: "We'll bring it to table", ar: "سنحضره إلى طاولة" },
  cancelled: { en: "This order was cancelled", ar: "تم إلغاء هذا الطلب" },
} satisfies Record<string, L10n>;

export type DictKey = keyof typeof dict;

export const statusLabel: Record<OrderStatus, L10n> = {
  received: { en: "Received", ar: "تم الاستلام" },
  preparing: { en: "Preparing", ar: "قيد التحضير" },
  ready: { en: "Ready", ar: "جاهز" },
  served: { en: "Served", ar: "تم التقديم" },
  cancelled: { en: "Cancelled", ar: "ملغي" },
};

export const statusHint: Record<OrderStatus, L10n> = {
  received: { en: "The team has your order and will start it shortly.", ar: "استلم الفريق طلبك وسيبدأ تحضيره قريبًا." },
  preparing: { en: "Our baristas and chefs are on it.", ar: "فريق الباريستا والمطبخ يحضّر طلبك الآن." },
  ready: { en: "Your order is ready!", ar: "طلبك جاهز!" },
  served: { en: "Enjoy your meal ☕", ar: "بالهنا والشفا ☕" },
  cancelled: { en: "Please speak to our team.", ar: "يرجى التحدث مع الفريق." },
};

export const tagLabel: Record<Tag, L10n> = {
  popular: { en: "Popular", ar: "مشهور" },
  new: { en: "New", ar: "جديد" },
  spicy: { en: "Spicy", ar: "حار" },
  vegan: { en: "Vegan", ar: "نباتي صرف" },
  vegetarian: { en: "Vegetarian", ar: "نباتي" },
  chef: { en: "Chef's pick", ar: "اختيار الشيف" },
};

export const allergenLabel: Record<Allergen, L10n> = {
  dairy: { en: "Dairy", ar: "ألبان" },
  gluten: { en: "Gluten", ar: "جلوتين" },
  eggs: { en: "Eggs", ar: "بيض" },
  nuts: { en: "Nuts", ar: "مكسرات" },
  soy: { en: "Soy", ar: "صويا" },
  fish: { en: "Fish", ar: "أسماك" },
};

export function money(n: number, lang: Lang, currency = "EGP") {
  const v = Math.round(n * 100) / 100;
  if (lang === "ar") {
    const sym = currency === "EGP" ? "ج.م" : currency;
    return `${v.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ${sym}`;
  }
  return `${currency} ${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function useT() {
  const lang = useDevice((s) => s.lang);
  const currency = useVenue((s) => s.settings.currency);
  return {
    lang,
    t: (k: DictKey) => dict[k][lang],
    L: (v: L10n) => v[lang] || v.en,
    m: (n: number) => money(n, lang, currency),
    n: (n: number) => (lang === "ar" ? n.toLocaleString("ar-EG") : String(n)),
  };
}
