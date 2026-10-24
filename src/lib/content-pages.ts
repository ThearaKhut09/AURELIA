// Editorial / policy page content with English + Khmer pairs.
export interface LocalizedPage {
  title: string;
  titleKh: string;
  sections: Array<{ heading: string; headingKh: string; body: string; bodyKh: string }>;
}

export const ABOUT_PAGE: LocalizedPage = {
  title: "Our story",
  titleKh: "រឿងរបស់យើង",
  sections: [
    {
      heading: "Born in Phnom Penh",
      headingKh: "កំណើតនៅភ្នំពេញ",
      body: "AURELIA was founded in Phnom Penh by a small team of formulators, perfumers and designers who believed Cambodian botanicals deserved a house of their own. We work with rice from Battambang, jasmine from Kandal, lemongrass from Kampot and moringa from local cooperatives — traceable, fairly bought, and treated with the reverence great ingredients deserve.",
      bodyKh: "AURELIA ត្រូវបានបង្កើតនៅភ្នំពេញ ដោយក្រុមតូចមួយនៃអ្នកបង្កើតរូបមន្ត អ្នកធ្វើក្រអៅ និងអ្នករចនា ដែលជឿថា សារធាតុធម្មជាតិខ្មែរសម្គាល់ថាមានតម្លៃឱ្យមានផ្ទះផ្ទាល់ខ្លួន។ យើងធ្វើការជាមួយអង្ករពីបាត់ដំបង ចាប់ពិសាពីកណ្តាល ស្លឹងស្លុយពីកំពត និងស្លឹងស្លុយពីសាមគ្គីភាពក្នុងស្រុក។",
    },
    {
      heading: "Honest formulas, honest prices",
      headingKh: "រូបមន្តត្រឹមត្រូវ តម្លៃត្រឹមត្រូវ",
      body: "Every formula is made in small batches and tested on human volunteers — never animals. We publish full ingredient lists, we price in USD and KHR with no hidden conversion games, and we would rather sell you one perfect serum than five mediocre ones.",
      bodyKh: "រាល់រូបមន្តផលិតជាក្រុមតូច និងសាកល្បងលើអ្នកស្ម័គ្រចិត្ត — មិនដែលធ្វើលើសត្វទេ។ យើងផ្សាយបញ្ជីសមាសភាគពេញលេញ យើងកំណត់តម្លៃជាដុល្លារ និងរៀលដោយគ្មានការកំណត់លាក់កាំម និងយើងចូលចិត្តលក់ serum តែមួយដ៏ល្អជាងប្រាំដែលមធ្យម។",
    },
    {
      heading: "Made for this climate",
      headingKh: "ផលិតសម្រាប់អាកាសធាតុនេះ",
      body: "Heat, humidity, monsoon rain and relentless sun demand formulas that are light but effective. Everything we make is tested for wear in 35°C and 90% humidity before it earns the AURELIA name.",
      bodyKh: "កម្តៅ ភាពឧស្សាហ៍ ភ្លៀងរដូវមុសូន និងថ្ងៃរះខ្លាំង តម្រូវឱ្យមានរូបមន្តស្រាលប៉ុន្តែមានប្រសិទ្ធភាព។ អ្វីៗដែលយើងផលិតត្រូវបានសាកល្បងក្នុងកម្តៅ 35°C និងភាពសើច 90% មុនពេលដាក់ឈ្មោះ AURELIA។",
    },
  ],
};

export const SHIPPING_PAGE: LocalizedPage = {
  title: "Shipping & Returns",
  titleKh: "ការដឹកជញ្ជូន និងការប្រគល់",
  sections: [
    {
      heading: "Delivery across Cambodia",
      headingKh: "ការដឹកជញ្ជូនពេញកម្ពុជា",
      body: "We deliver to all 25 provinces and the capital. Orders to Phnom Penh typically arrive within 1–2 business days via our courier partners (J&T Express, Cambodia Post, or local couriers depending on your area). Provincial deliveries take 2–5 business days. Shipping is calculated at checkout by province, and free on all orders over $50.",
      bodyKh: "យើងដឹកជញ្ជូនដល់ខេត្តទាំង 25 និងរាជធានី។ ការបញ្ជាទិញទៅភ្នំពេញជាទូទៅមកដល់ក្នុងរយៈពេល 1–2 ថ្ងៃធ្វើការតាមរយៈដៃគូដឹកជញ្ជូនរបស់យើង។ ការដឹកជញ្ជូនតាមខេត្តចំណាយពេល 2–5 ថ្ងៃធ្វើការ។ តម្លៃដឹកជញ្ជូនគណនានៅពេលទូទាត់តាមខេត្ត និងឥតគិតថ្លៃលើការបញ្ជាទិញលើ $50។",
    },
    {
      heading: "Returns within 14 days",
      headingKh: "ការប្រគល់ក្នុងរយៈពេល 14 ថ្ងៃ",
      body: "Unopened products in original packaging may be returned within 14 days of delivery for a full refund. If a product arrives damaged or is not what you ordered, contact us within 48 hours with a photo and we will replace it or refund you immediately — your choice.",
      bodyKh: "ផលិតផលដែលមិនទាន់បើកជាមួយការវេចខ្ចប់ដើម អាចប្រគល់ក្នុងរយៈពេល 14 ថ្ងៃបន្ទាប់ពីទទួលបាន ដើម្បីទទួលប្រាក់វិញពេញលេញ។ ប្រសិនបើផលិតផលមកដល់ខូច ឬមិនមែនជាអ្វីដែលអ្នកបានបញ្ជាទិញ សូមទំនាក់ទំនងយើងក្នុងរយៈពេល 48 ម៉ោង ជាមួយរូបភាព ហើយយើងនឹងជំនួស ឬប្រគល់ប្រាក់ឱ្យអ្នកភ្លាមៗ។",
    },
    {
      heading: "For hygiene reasons",
      headingKh: "សម្រាប់ហេតុផលអនាម័យ",
      body: "Opened skincare and fragrance cannot be returned unless faulty. Fragrance discovery sets are returnable only if all vials are unopened.",
      bodyKh: "គ្រឿងសំអាងសម្បក និងគ្រឿងក្រអៅដែលបានបើកមិនអាចប្រគល់បានទេ លុះត្រាតែមានបញ្ហា។ ឈុតសាកល្បងគ្រឿងក្រអៅអាចប្រគល់បានតែបើស្ករទាំងអស់មិនទាន់បើក។",
    },
  ],
};

export const PRIVACY_PAGE: LocalizedPage = {
  title: "Privacy Policy",
  titleKh: "គោលការណ៍ភាពឯកជន",
  sections: [
    {
      heading: "What we collect",
      headingKh: "អ្វីដែលយើងប្រមូល",
      body: "We collect only what we need to serve you: your name, email, phone number, delivery address, and order history. Payments are processed by ABA PayWay — we never see or store your card PIN, KHQR credentials or full card numbers.",
      bodyKh: "យើងប្រមូលតែអ្វីដែលយើងត្រូវការដើម្បីបម្រើអ្នក៖ ឈ្មោះ អ៊ីមែល លេខទូរស័ព្ទ អាសយដ្ឋានដឹកជញ្ជូន និងប្រវត្តិការបញ្ជាទិញ។ ការទូទាត់ត្រូវបានដំណើរការដោយ ABA PayWay — យើងមិនឃើញ ឬរក្សាទុកព័ត៌មានកាតរបស់អ្នកទេ។",
    },
    {
      heading: "How we use it",
      headingKh: "របៀបប្រើប្រាស់",
      body: "Your data is used to fulfil orders, provide customer support, and — only if you subscribe — send our newsletter. We never sell your data. Analytics are aggregate and anonymous.",
      bodyKh: "ទិន្នន័យរបស់អ្នកត្រូវបានប្រើដើម្បីបំពេញការបញ្ជាទិញ ផ្តល់ជំនួយអតិថិជន និង — តែបើអ្នកជាវ — ផ្ញើព្រឹត្តិបត្រព័ត៌មានរបស់យើង។ យើងមិនលក់ទិន្នន័យរបស់អ្នកទេ។",
    },
    {
      heading: "Your rights",
      headingKh: "សិទ្ធិរបស់អ្នក",
      body: "You may request a copy or deletion of your personal data at any time by emailing hello@aurelia.example. We respond within 7 days.",
      bodyKh: "អ្នកអាចស្នើសុំចម្លង ឬលុបទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកនៅពេលណាមួយតាមរយៈអ៊ីមែល hello@aurelia.example។ យើងឆ្លើយតបក្នុងរយៈពេល 7 ថ្ងៃ។",
    },
  ],
};

export const TERMS_PAGE: LocalizedPage = {
  title: "Terms of Service",
  titleKh: "លក្ខខណ្ឌសេវាកម្ម",
  sections: [
    {
      heading: "Orders and pricing",
      headingKh: "ការបញ្ជាទិញ និងតម្លៃ",
      body: "All prices are shown in USD with approximate KHR equivalents; the USD amount is the amount charged. Orders are accepted upon successful payment confirmation via ABA PayWay. We reserve the right to cancel orders with pricing errors, with a full refund.",
      bodyKh: "តម្លៃទាំងអស់បង្ហាញជាដុល្លារ ជាមួយតម្លៃរៀលប៉ាន់ស្មាន។ ការបញ្ជាទិញត្រូវបានទទួលនៅពេលការទូទាត់ជោគជ័យតាមរយៈ ABA PayWay។ យើងមានសិទ្ធិលុបចោលការបញ្ជាទិញដែលមានកំហុសតម្លៃ ដោយប្រគល់ប្រាក់ពេញលេញ។",
    },
    {
      heading: "Delivery",
      headingKh: "ការដឹកជញ្ជូន",
      body: "Delivery times are estimates, not guarantees. Risk passes to you on delivery. Please inspect your parcel on arrival and report damage within 48 hours.",
      bodyKh: "រយៈពេលដឹកជញ្ជូនគឺជាការប៉ាន់ស្មាន មិនមែនការធានាទេ។ សូមពិនិត្យពាក្យដែលអ្នកទទួលបាន និងរាយការណ៍ភាពខូចខាតក្នុងរយៈពេល 48 ម៉ោង។",
    },
    {
      heading: "Liability",
      headingKh: "ការទទួលខុសត្រូវ",
      body: "Our products are cosmetic goods. Discontinue use if irritation occurs and consult a doctor. Our liability is limited to the value of your order.",
      bodyKh: "ផលិតផលរបស់យើងជាទំនិញក្រឡេកមើល។ បញ្ឈប់ការប្រើប្រាស់ប្រសិនបើមានការរលាក ហើយពិគ្រោះជាមួយវេជ្ជបណ្ឌិត។ ការទទួលខុសត្រូវរបស់យើងមានកម្រិតត្រឹមតម្លៃការបញ្ជាទិញរបស់អ្នក។",
    },
  ],
};

export const FAQ_ITEMS: Array<{ q: string; qKh: string; a: string; aKh: string }> = [
  {
    q: "How do I pay?",
    qKh: "ខ្ញុំអាចទូទាត់ដោយរបៀបណា?",
    a: "All payments are processed securely by ABA PayWay. You can pay with ABA PAY in the ABA Mobile app, with KHQR from any Cambodian bank (ACLEDA, Wing, Canadia, CPB and more), or with Visa / Mastercard / UnionPay cards.",
    aKh: "ការទូទាត់ទាំងអស់ត្រូវបានដំណើរការដោយសុវត្ថិភាពដោយ ABA PayWay។ អ្នកអាចទូទាត់ជាមួយ ABA PAY ក្នុងកម្មវិធី ABA Mobile ជាមួយ KHQR ពីធនាគារកម្ពុជាណាមួយ ឬជាមួយកាត Visa / Mastercard / UnionPay។",
  },
  {
    q: "Which currency will I be charged in?",
    qKh: "ខ្ញុំនឹងត្រូវបង់ជារូបិយប័ណ្ណណា?",
    a: "Transactions are charged in US dollars (USD), which is the standard for online payments in Cambodia. We display approximate Khmer riel equivalents everywhere for convenience, using a fixed reference rate.",
    aKh: "ការទូទាត់ត្រូវបានគិតជាដុល្លារអាមេរិក (USD) ដែលជាតម្លៃស្តង់ដារសម្រាប់ការទូទាត់អនឡាញនៅកម្ពុជា។ យើងបង្ហាញតម្លៃរៀលប៉ាន់ស្មាននៅគ្រប់ទីកន្លែងសម្រាប់ភាពងាយស្រួល។",
  },
  {
    q: "How long does delivery take?",
    qKh: "ការដឹកជញ្ជូនចំណាយពេលប៉ុន្មាន?",
    a: "Phnom Penh: 1–2 business days. Provinces: 2–5 business days. You will receive a tracking update by phone or Telegram when your order ships.",
    aKh: "ភ្នំពេញ៖ 1–2 ថ្ងៃធ្វើការ។ ខេត្ត៖ 2–5 ថ្ងៃធ្វើការ។ អ្នកនឹងទទួលបានព័ត៌មានតាមដានតាមទូរស័ព្ទ ឬ Telegram ពេលការបញ្ជាទិញត្រូវបានដឹកជញ្ជូន។",
  },
  {
    q: "Are your products tested on animals?",
    qKh: "ផលិតផលរបស់អ្នកសាកល្បងលើសត្វទេ?",
    a: "No. We never test on animals, and our suppliers sign the same commitment. Products are tested on human volunteers under dermatological supervision.",
    aKh: "ទេ។ យើងមិនដែលសាកល្បងលើសត្វទេ ហើយអ្នកផ្គត់ផ្គង់របស់យើងក៏ចុះហត្ថលេខាលើការប្តេជ្ញាចិត្តដូចគ្នាដែរ។ ផលិតផលត្រូវបានសាកល្បងលើអ្នកស្ម័គ្រចិត្តក្រោមការឃ្លាំមើលពីអ្នកជំនាញសម្បក។",
  },
  {
    q: "Can I try the fragrances before buying a full bottle?",
    qKh: "ខ្ញុំអាចសាកល្បងគ្រឿងក្រអៅមុនទិញដប់ពេញទេ?",
    a: "Yes — the Discovery Set contains all three eaux de parfum in 2 ml sprays, and its full price is credited towards your first 50 ml bottle.",
    aKh: "បាទ/ចាស — ឈុត Discovery មានគ្រឿងក្រអៅទាំងបីក្នុងខ្នាត 2 ml ហើយតម្លៃពេញលេញនឹងត្រូវបានគណនាក្នុងការទិញដប់ 50 ml ដំបូងរបស់អ្នក។",
  },
  {
    q: "Do you ship outside Cambodia?",
    qKh: "តើអ្នកដឹកជញ្ជូនក្រៅកម្ពុជាទេ?",
    a: "Not yet — we are focused on serving Cambodia perfectly first. Regional shipping is on our roadmap.",
    aKh: "មិនទាន់ — យើងផ្តោតលើការបម្រើកម្ពុជាឱ្យបានល្អឥតខ្ចោះជាដំបូង។ ការដឹកជញ្ជូនតំបន់គឺក្នុងផែនការរបស់យើង។",
  },
];
