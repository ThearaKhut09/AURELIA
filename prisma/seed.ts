/**
 * AURELIA seed — sample catalogue, users, reviews and one demo order.
 * Run: npm run db:seed
 */
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const dec = (n: number): Prisma.Decimal => new Prisma.Decimal(n.toFixed(2));

async function main() {
  // ── Users ────────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@aurelia.test";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Aurelia#2026";
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: "AURELIA Admin",
      role: "ADMIN",
      phone: "012 345 678",
    },
  });

  const customer = await db.user.upsert({
    where: { email: "sokha@example.com" },
    update: {},
    create: {
      email: "sokha@example.com",
      passwordHash: await bcrypt.hash("Sokha#2026", 12),
      name: "Chan Sokha",
      phone: "092 111 222",
      addresses: {
        create: {
          label: "Home",
          line1: "Street 288, BKK1",
          city: "Chamkarmon, Phnom Penh",
          province: "Phnom Penh",
          phone: "092 111 222",
          isDefault: true,
        },
      },
    },
  });

  // ── Products ─────────────────────────────────────────────────────────────
  type Seed = {
    slug: string;
    name: string;
    description: string;
    ingredients: string;
    howToUse: string;
    category: "skincare" | "fragrance" | "rituals";
    skinTypes?: string;
    concerns?: string;
    images: string[];
    basePriceUsd: number;
    compareAtUsd?: number;
    stock: number;
    isFeatured?: boolean;
    variants: { name: string; sku: string; priceUsd: number; stock: number }[];
  };

  const catalogue: Seed[] = [
    {
      slug: "rice-water-gentle-cleanser",
      name: "Rice Water Gentle Cleanser",
      description:
        "A cloud-soft gel-cream cleanser built on fermented Cambodian white rice water. It lifts away sunscreen, sebum and city dust without stripping the skin barrier, leaving the face calm, plump and comfortable. Suitable for daily use, morning and evening.",
      ingredients:
        "Oryza Sativa (Rice) Water, Glycerin, Coco-Glucoside, Panthenol, Niacinamide, Allantoin, Centella Asiatica Extract, Sodium Hyaluronate, Citric Acid.",
      howToUse:
        "Massage a small amount over damp skin for 30–60 seconds, then rinse with lukewarm water. Follow with toner and serum. Use morning and evening.",
      category: "skincare",
      skinTypes: "normal,dry,sensitive,combination",
      concerns: "hydration,soothing",
      images: ["/products/rice-water-cleanser.svg"],
      basePriceUsd: 26,
      stock: 40,
      isFeatured: true,
      variants: [
        { name: "150 ml", sku: "AUR-SK-CLN-150", priceUsd: 26, stock: 25 },
        { name: "250 ml", sku: "AUR-SK-CLN-250", priceUsd: 36, stock: 15 },
      ],
    },
    {
      slug: "jasmine-dew-hydrating-serum",
      name: "Jasmine Dew Hydrating Serum",
      description:
        "Three molecular weights of hyaluronic acid meet jasmine water distilled from Phnom Penh gardens and 5% niacinamide. The serum floods thirsty skin with weightless moisture while refining the look of pores and evening tone over weeks of use.",
      ingredients:
        "Jasminum Sambac Flower Water, Sodium Hyaluronate (LMW/MMW/HMW), Niacinamide 5%, Panthenol, Beta-Glucan, Trehalose, Green Tea Extract, Allantoin.",
      howToUse:
        "After cleansing, press 3–4 drops into damp skin morning and evening before moisturiser. Layer under SPF in the daytime.",
      category: "skincare",
      skinTypes: "normal,dry,oily,combination,sensitive",
      concerns: "hydration,brightening",
      images: ["/products/jasmine-dew-serum.svg"],
      basePriceUsd: 48,
      stock: 30,
      isFeatured: true,
      variants: [{ name: "30 ml", sku: "AUR-SK-SER-030", priceUsd: 48, stock: 30 }],
    },
    {
      slug: "moringa-recovery-cream",
      name: "Moringa Recovery Cream",
      description:
        "A cushioning barrier cream with moringa oil pressed from Kandal province, ceramides and squalane. It seals in moisture overnight and comforts skin stressed by sun, air-conditioning and traffic. Rich, but never greasy.",
      ingredients:
        "Moringa Oleifera Seed Oil, Ceramide NP/AP/EOP, Squalane, Shea Butter, Cholesterol, Madecassoside, Tocopherol, Bisabolol.",
      howToUse:
        "Warm a pea-sized amount between fingertips and press over face and neck as the final step of your routine, morning and evening.",
      category: "skincare",
      skinTypes: "dry,normal,sensitive",
      concerns: "hydration,soothing,anti-aging",
      images: ["/products/moringa-recovery-cream.svg"],
      basePriceUsd: 42,
      stock: 26,
      variants: [{ name: "50 ml", sku: "AUR-SK-CRM-050", priceUsd: 42, stock: 26 }],
    },
    {
      slug: "palm-sugar-enzyme-mask",
      name: "Palm Sugar Enzyme Mask",
      description:
        "A weekly resurfacing ritual with palm-sugar-derived AHAs and papaya enzyme. Five minutes dissolves dullness and softens texture — skin emerges glassy, smooth and light-reflective, with none of the sting of harsh scrubs.",
      ingredients:
        "Glycolic Acid (Palm Sugar Derived), Papain, Lactic Acid, Honey, Kaolin, Glycerin, Aloe Barbadensis Leaf Juice, Chamomile Extract.",
      howToUse:
        "Apply a thin layer to clean, dry skin once or twice weekly. Leave 5–10 minutes, then rinse. Do not use on the same night as retinoids.",
      category: "skincare",
      skinTypes: "normal,oily,combination",
      concerns: "brightening,anti-aging",
      images: ["/products/palm-sugar-enzyme-mask.svg"],
      basePriceUsd: 34,
      stock: 22,
      variants: [{ name: "75 ml", sku: "AUR-SK-MSK-075", priceUsd: 34, stock: 22 }],
    },
    {
      slug: "frangipani-silk-spf-40",
      name: "Frangipani Silk Sheer SPF 40",
      description:
        "An invisible-finish mineral-hybrid sunscreen made for the Cambodian sun. Broad-spectrum SPF 40 PA+++ in a silky, weightless fluid that leaves zero white cast and sits beautifully under make-up, with frangipani extract to soothe heat-stressed skin.",
      ingredients:
        "Zinc Oxide 8%, Homosalate, Plumeria Rubra (Frangipani) Flower Extract, Niacinamide, Squalane, Dimethicone, Tocopherol, Glycerin.",
      howToUse:
        "Apply two finger-lengths as the final morning step. Reapply every two hours of direct sun. Remove with the Rice Water Gentle Cleanser.",
      category: "skincare",
      skinTypes: "normal,oily,dry,combination,sensitive",
      concerns: "soothing,anti-aging",
      images: ["/products/frangipani-silk-spf.svg"],
      basePriceUsd: 32,
      stock: 45,
      isFeatured: true,
      variants: [{ name: "50 ml", sku: "AUR-SK-SPF-050", priceUsd: 32, stock: 45 }],
    },
    {
      slug: "lemongrass-balancing-toner",
      name: "Lemongrass Balancing Toner",
      description:
        "A barely-there essence toner distilled with Kampot lemongrass and PHA. It sweeps away the last traces of cleanser, dials oil production down and preps skin to drink in everything that follows. Fresh, faintly citrus, instantly comfortable.",
      ingredients:
        "Cymbopogon Citratus (Lemongrass) Water, Gluconolactone (PHA 3%), Panthenol, Zinc PCA, Willow Bark Extract, Sodium PCA, Allantoin.",
      howToUse:
        "After cleansing, sweep over face and neck with palms or a cotton pad, morning and evening. Follow with serum.",
      category: "skincare",
      skinTypes: "oily,combination,normal",
      concerns: "hydration,brightening",
      images: ["/products/lemongrass-toner.svg"],
      basePriceUsd: 28,
      stock: 34,
      variants: [{ name: "200 ml", sku: "AUR-SK-TON-200", priceUsd: 28, stock: 34 }],
    },
    {
      slug: "angkor-dawn-edp",
      name: "Angkor Dawn — Eau de Parfum № 1",
      description:
        "The first light over the lotus ponds of Angkor Wat: dewy frangipani, crushed kaffir lime leaf and a breath of incense resting on sandalwood and white musk. A luminous, glowing eau de parfum for mornings that deserve ceremony. 12% parfum concentration.",
      ingredients:
        "Alcohol Denat., Parfum, Aqua, Limonene, Linalool, Citral, Geraniol — Frangipani Absolute, Kaffir Lime Leaf, Frankincense, Sandalwood, White Musk Accord.",
      howToUse:
        "Spray onto pulse points — wrists, neck, behind the ears — on clean, moisturised skin. Do not rub. Layer with Rice & Rain for depth.",
      category: "fragrance",
      concerns: "",
      images: ["/products/angkor-dawn-edp.svg"],
      basePriceUsd: 95,
      stock: 18,
      isFeatured: true,
      variants: [
        { name: "50 ml", sku: "AUR-FR-E01-050", priceUsd: 95, stock: 12 },
        { name: "100 ml", sku: "AUR-FR-E01-100", priceUsd: 148, stock: 6 },
      ],
    },
    {
      slug: "mekong-dusk-edp",
      name: "Mekong Dusk — Eau de Parfum № 2",
      description:
        "The river at the golden hour: smoked tea, ripe mango and ylang drifting over vetiver, ambrette and river-stone amber. Warm, unhurried and quietly magnetic — an evening signature that lingers on skin until midnight. 14% parfum concentration.",
      ingredients:
        "Alcohol Denat., Parfum, Aqua, Benzyl Salicylate, Linalool, Coumarin — Smoked Black Tea, Mango Pulp, Ylang-Ylang, Vetiver Haiti, Ambrette Seed, Amber Accord.",
      howToUse:
        "Spray onto pulse points on moisturised skin. For a softer veil, mist once into the air and walk through.",
      category: "fragrance",
      concerns: "",
      images: ["/products/mekong-dusk-edp.svg"],
      basePriceUsd: 95,
      stock: 16,
      variants: [
        { name: "50 ml", sku: "AUR-FR-E02-050", priceUsd: 95, stock: 12 },
        { name: "100 ml", sku: "AUR-FR-E02-100", priceUsd: 148, stock: 4 },
      ],
    },
    {
      slug: "rice-and-rain-edp",
      name: "Rice & Rain — Eau de Parfum № 3",
      description:
        "Green rice paddies under monsoon clouds: sticky rice steam, violet leaf, rain-washed iris and a whisper of bamboo. A meditative, mineral eau de parfum — quiet confidence bottled for people who don't need to raise their voice. 12% parfum concentration.",
      ingredients:
        "Alcohol Denat., Parfum, Aqua, Alpha-Isomethyl Ionone, Geraniol — Cooked Rice Accord, Violet Leaf Absolute, Orris Butter, Bamboo, Rain Accord, Cedarwood.",
      howToUse:
        "Spray onto pulse points. Excellent unisex signature; pairs beautifully with Angkor Dawn as a layered accord.",
      category: "fragrance",
      concerns: "",
      images: ["/products/rice-and-rain-edp.svg"],
      basePriceUsd: 88,
      stock: 20,
      variants: [
        { name: "50 ml", sku: "AUR-FR-E03-050", priceUsd: 88, stock: 15 },
        { name: "100 ml", sku: "AUR-FR-E03-100", priceUsd: 138, stock: 5 },
      ],
    },
    {
      slug: "discovery-set-three-rituals",
      name: "The Discovery Set — Three Rituals",
      description:
        "All three eaux de parfum in travel-sized 2 ml sprays, presented in a letterpressed card sleeve. Two weeks of wear to find the one that is unmistakably yours. The perfect first step into the house of AURELIA — and the price is credited towards your first full bottle.",
      ingredients:
        "Three 2 ml Eau de Parfum sprays: Angkor Dawn, Mekong Dusk, Rice & Rain.",
      howToUse:
        "Wear each fragrance on a different day, on moisturised skin. Note your favourite — we credit this set against any 50 ml bottle.",
      category: "rituals",
      concerns: "",
      images: ["/products/discovery-set.svg"],
      basePriceUsd: 24,
      stock: 60,
      isFeatured: true,
      variants: [{ name: "3 × 2 ml", sku: "AUR-FR-DSC-003", priceUsd: 24, stock: 60 }],
    },
    {
      slug: "frangipani-smoke-candle",
      name: "Frangipani & Smoke Candle",
      description:
        "Hand-poured coconut-soy wax with a braided cotton wick, filling the room with frangipani blossom, palo santo and warm ember smoke. Forty-eight hours of quiet luxury in a reusable ceramic vessel glazed in sage.",
      ingredients:
        "Coconut-Soy Wax Blend, Frangipani Absolute, Palo Santo Oil, Vetiver, Clove Leaf, Cotton Wick. 240 g. Burn time ≈ 48 hours.",
      howToUse:
        "Trim the wick to 5 mm before each burn. Burn no longer than 4 hours at a time. Never leave unattended.",
      category: "rituals",
      concerns: "",
      images: ["/products/frangipani-candle.svg"],
      basePriceUsd: 38,
      stock: 28,
      variants: [{ name: "240 g", sku: "AUR-RT-CND-240", priceUsd: 38, stock: 28 }],
    },
    {
      slug: "jasmine-hair-body-mist",
      name: "Jasmine Hair & Body Mist",
      description:
        "A featherlight, alcohol-light mist of jasmine sambac, green tea and musk, gentle enough for hair and scented enough for the nape of the neck. Keep one in your bag, one on your dresser — the signature of long afternoons in Phnom Penh.",
      ingredients:
        "Aqua, Jasminum Sambac Flower Water, Glycerin, Parfum, Panthenol, Propanediol, Silk Amino Acids, Phenoxyethanol.",
      howToUse:
        "Mist 20–30 cm from hair and body whenever the day calls for it. Safe for colour-treated hair.",
      category: "rituals",
      concerns: "",
      images: ["/products/jasmine-body-mist.svg"],
      basePriceUsd: 26,
      stock: 38,
      variants: [{ name: "100 ml", sku: "AUR-RT-MST-100", priceUsd: 26, stock: 38 }],
    },
  ];

  for (const c of catalogue) {
    const product = await db.product.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        ingredients: c.ingredients,
        howToUse: c.howToUse,
        category: c.category,
        skinTypes: c.skinTypes ?? "",
        concerns: c.concerns ?? "",
        images: c.images,
        basePriceUsd: dec(c.basePriceUsd),
        stock: c.stock,
        isFeatured: c.isFeatured ?? false,
        variants: {
          create: c.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            priceUsd: dec(v.priceUsd),
            stock: v.stock,
          })),
        },
      },
    });

    const reviewSeeds: { author: string; rating: number; comment: string }[] = [
      {
        author: "Dara P.",
        rating: 5,
        comment:
          "Beautiful quality and beautifully packaged. Delivery to Daun Penh took one day. This has replaced everything else on my shelf.",
      },
      {
        author: "Sreymom C.",
        rating: 5,
        comment: "Finally skincare that understands this climate. Lightweight but it really works.",
      },
      {
        author: "Vuthy L.",
        rating: 4,
        comment: "Excellent. Would love a larger size — I go through it quickly because I use it every day.",
      },
    ];
    const existing = await db.review.count({ where: { productId: product.id } });
    if (existing === 0) {
      await db.review.createMany({
        data: reviewSeeds.map((r) => ({ ...r, productId: product.id })),
      });
    }
  }

  // ── One demo order (analytics don't look empty) ─────────────────────────
  const orderExists = await db.order.findUnique({ where: { tranId: "AUR-DEMO-1001" } });
  if (!orderExists) {
    const serum = await db.product.findUnique({
      where: { slug: "jasmine-dew-hydrating-serum" },
      include: { variants: true },
    });
    if (serum) {
      await db.order.create({
        data: {
          tranId: "AUR-DEMO-1001",
          userId: customer.id,
          status: "DELIVERED",
          paymentStatus: "PAID",
          subtotalUsd: dec(48),
          shippingUsd: dec(0),
          vatUsd: dec(4.8),
          totalUsd: dec(52.8),
          totalKhrDisplay: "៛216,480",
          paymentMethod: "payway",
          paymentOption: "abapay_khqr",
          paywayTranId: "AUR-DEMO-1001",
          contactName: "Chan Sokha",
          contactEmail: "sokha@example.com",
          contactPhone: "092 111 222",
          shippingAddress: {
            line1: "Street 288, BKK1",
            city: "Chamkarmon, Phnom Penh",
            province: "Phnom Penh",
            phone: "092 111 222",
          },
          items: {
            create: {
              productId: serum.id,
              variantId: serum.variants[0]?.id,
              name: serum.name,
              variantName: serum.variants[0]?.name,
              priceUsd: dec(48),
              quantity: 1,
              image: "/products/jasmine-dew-serum.svg",
            },
          },
          payments: {
            create: {
              provider: "payway",
              tranId: "AUR-DEMO-1001",
              amountUsd: dec(52.8),
              status: "APPROVED",
            },
          },
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`  admin    : ${admin.email} / (password from SEED_ADMIN_PASSWORD)`);
  console.log(`  customer : ${customer.email} / Sokha#2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
