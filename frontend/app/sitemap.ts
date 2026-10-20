import type { MetadataRoute } from 'next';
import { fetchApi } from '../lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface ApiItem {
  slug: string;
  updated_at?: string;
  children?: ApiItem[];
}

function flattenCategories(categories: ApiItem[]): ApiItem[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children || [])]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/cart`, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/register`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const [productsRes, categoriesRes, blogsRes] = await Promise.all([
      fetchApi('/products?per_page=100'),
      fetchApi('/categories'),
      fetchApi('/blogs?per_page=100'),
    ]);

    const products: ApiItem[] = productsRes?.data || [];
    const categories = flattenCategories(categoriesRes?.data || []);
    const blogs: ApiItem[] = blogsRes?.data || [];

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/products?category=${category.slug}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
