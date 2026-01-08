import type { Brand } from '@/types/brands';

export const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'Nike',
    slug: 'nike',
    website: 'https://nike.com',
    logo: 'https://placehold.co/100?text=Nike',
    description: 'Just do it.',
  },
  {
    id: '2',
    name: 'Adidas',
    slug: 'adidas',
    website: 'https://adidas.com',
    logo: 'https://placehold.co/100?text=Adidas',
    description: 'Impossible is nothing.',
  },
  {
    id: '3',
    name: 'Puma',
    slug: 'puma',
    website: 'https://puma.com',
    logo: 'https://placehold.co/100?text=Puma',
    description: 'Forever Faster.',
  },
];
