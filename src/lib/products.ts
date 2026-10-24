// Product queries + serialisable DTOs (Prisma Decimal must not cross the
// server→client boundary).
import { Prisma, type PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

export interface VariantDTO {
  id: string;
  name: string;
  sku: string;
  priceUsd: number;
  stock: number;
}

export interface ReviewDTO {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  ingredients: string;
  howToUse: string;
  category: string;
  skinTypes: string[];
  concerns: string[];
  images: string[];
  basePriceUsd: number;
  compareAtUsd: number | null;
  stock: number;
  isFeatured: boolean;
  variants: VariantDTO[];
  reviews: ReviewDTO[];
  reviewsCount: number;
  reviewsAvg: number | null;
}

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { variants: true; reviews: true };
}>;

export function toProductDTO(p: ProductWithRelations): ProductDTO {
  const reviews = p.reviews
    .filter((r) => r.isApproved)
    .sort((a, b) => +b.createdAt - +a.createdAt)
    .map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    ingredients: p.ingredients,
    howToUse: p.howToUse,
    category: p.category,
    skinTypes: p.skinTypes ? p.skinTypes.split(",").filter(Boolean) : [],
    concerns: p.concerns ? p.concerns.split(",").filter(Boolean) : [],
    images: Array.isArray(p.images) ? (p.images as string[]) : [],
    basePriceUsd: Number(p.basePriceUsd),
    compareAtUsd: p.compareAtUsd ? Number(p.compareAtUsd) : null,
    stock: p.stock,
    isFeatured: p.isFeatured,
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      priceUsd: Number(v.priceUsd),
      stock: v.stock,
    })),
    reviews,
    reviewsCount: reviews.length,
    reviewsAvg: avg,
  };
}

export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

export interface ProductQuery {
  category?: string;
  skinType?: string;
  concern?: string;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export async function queryProducts(q: ProductQuery): Promise<{
  items: ProductDTO[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const pageSize = q.pageSize ?? 12;
  const page = Math.max(1, q.page ?? 1);

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (q.category && q.category !== "all") where.category = q.category;
  if (q.skinType) where.skinTypes = { contains: q.skinType };
  if (q.concern) where.concerns = { contains: q.concern };
  if (q.maxPrice && q.maxPrice > 0) {
    where.basePriceUsd = { lte: new Prisma.Decimal(q.maxPrice) };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[];
  switch (q.sort) {
    case "newest":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "price-asc":
      orderBy = [{ basePriceUsd: "asc" }];
      break;
    case "price-desc":
      orderBy = [{ basePriceUsd: "desc" }];
      break;
    default:
      orderBy = [{ isFeatured: "desc" }, { createdAt: "desc" }];
  }

  const [rows, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      include: { variants: true, reviews: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    items: rows.map(toProductDTO),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const p = await db.product.findUnique({
    where: { slug },
    include: { variants: true, reviews: true },
  });
  if (!p || !p.isActive) return null;
  return toProductDTO(p);
}

export async function getFeaturedProducts(limit = 3): Promise<ProductDTO[]> {
  const rows = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ createdAt: "asc" }],
    take: limit,
    include: { variants: true, reviews: true },
  });
  return rows.map(toProductDTO);
}

/** Bestsellers: most-ordered items on paid orders, falling back to featured. */
export async function getBestsellers(limit = 4): Promise<ProductDTO[]> {
  const top = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    where: { order: { paymentStatus: "PAID" } },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  if (top.length >= limit) {
    const rows = await db.product.findMany({
      where: { isActive: true, id: { in: top.map((t) => t.productId) } },
      include: { variants: true, reviews: true },
    });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return top
      .map((t) => byId.get(t.productId))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map(toProductDTO);
  }

  const featured = await getFeaturedProducts(limit);
  if (featured.length >= limit) return featured;

  const rows = await db.product.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: "asc" }],
    take: limit,
    include: { variants: true, reviews: true },
  });
  const merged = [...featured];
  for (const row of rows) {
    if (merged.length >= limit) break;
    if (!merged.some((m) => m.id === row.id)) merged.push(toProductDTO(row));
  }
  return merged;
}

export async function getRelatedProducts(
  product: ProductDTO,
  limit = 4,
): Promise<ProductDTO[]> {
  const rows = await db.product.findMany({
    where: { isActive: true, category: product.category, id: { not: product.id } },
    take: limit,
    include: { variants: true, reviews: true },
  });
  if (rows.length >= limit) return rows.map(toProductDTO);
  const extra = await db.product.findMany({
    where: { isActive: true, id: { notIn: [product.id, ...rows.map((r) => r.id)] } },
    take: limit - rows.length,
    include: { variants: true, reviews: true },
  });
  return [...rows, ...extra].map(toProductDTO);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
