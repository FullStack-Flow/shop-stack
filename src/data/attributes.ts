import type { Attribute } from '@/types/attributes';

export const mockAttributes: Attribute[] = [
  {
    id: '1',
    name: 'Color',
    slug: 'color',
    values: [
      { id: '1', name: 'Red', slug: 'red', value: '#FF0000' },
      { id: '2', name: 'Blue', slug: 'blue', value: '#0000FF' },
      { id: '3', name: 'Green', slug: 'green', value: '#00FF00' },
      { id: '4', name: 'Black', slug: 'black', value: '#000000' },
    ],
    type: 'color',
  },
  {
    id: '2',
    name: 'Size',
    slug: 'size',
    values: [
      { id: '5', name: 'S', slug: 's', value: 'S' },
      { id: '6', name: 'M', slug: 'm', value: 'M' },
      { id: '7', name: 'L', slug: 'l', value: 'L' },
      { id: '8', name: 'XL', slug: 'xl', value: 'XL' },
    ],
    type: 'label',
  },
  {
    id: '3',
    name: 'Material',
    slug: 'material',
    values: [
      { id: '9', name: 'Cotton', slug: 'cotton', value: 'Cotton' },
      { id: '10', name: 'Polyester', slug: 'polyester', value: 'Polyester' },
      { id: '11', name: 'Wool', slug: 'wool', value: 'Wool' },
    ],
    type: 'select',
  },
];
