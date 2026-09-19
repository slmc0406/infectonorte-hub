import { MetadataRoute } from 'next';
import { getAllPublicResources } from '@/data/resources';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.infectonorte.com';
  const staticRoutes = ['', '/biblioteca', '/academia', '/instituciones', '/solicitar-contenido'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
  const resourceRoutes = getAllPublicResources().map((r) => ({
    url: `${base}/${r.typePath}/${r.slug}`,
    lastModified: new Date(r.lastReviewedAt),
  }));
  return [...staticRoutes, ...resourceRoutes];
}
