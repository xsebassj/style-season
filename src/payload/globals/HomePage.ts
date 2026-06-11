
import { GlobalConfig } from 'payload';

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Diseño - Home',
  fields: [
    { name: 'marquee_text', type: 'text', required: true, defaultValue: 'ENVÍO GRATIS SUPERANDO LOS $150.000' },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'subtitle', type: 'text', required: true },
        { name: 'show_countdown', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'category_banners',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'button_text', type: 'text', required: true },
        { name: 'link', type: 'text', required: true },
      ],
    },
  ],
};