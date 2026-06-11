import { CollectionConfig } from 'payload';

export const Drops: CollectionConfig = {
  slug: 'drops',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'launch_date', 'is_active'] },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'is_active', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Activar contador en la Home' } },
    { name: 'launch_date', type: 'date', admin: { position: 'sidebar' } },
    { name: 'hero_image', type: 'upload', relationTo: 'media', required: true },
    { name: 'description', type: 'richText' },
  ],
};