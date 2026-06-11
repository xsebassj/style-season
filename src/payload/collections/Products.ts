import { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'price', 'drop'] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Información Básica',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'slug', type: 'text', required: true, unique: true },
            { name: 'category', type: 'select', options: ['Buzos', 'Remeras', 'Pantalones', 'Accesorios'], required: true },
            { name: 'drop', type: 'relationship', relationTo: 'drops', hasMany: false },
            { name: 'description', type: 'richText' },
          ],
        },
        {
          label: 'Precios e Imágenes',
          fields: [
            { type: 'row', fields: [
              { name: 'price', type: 'number', required: true, admin: { description: 'Precio ARS' } },
              { name: 'compare_at_price', type: 'number', admin: { description: 'Precio tachado ARS (Opcional)' } },
            ]},
            { name: 'main_image', type: 'upload', relationTo: 'media', required: true },
            { name: 'gallery', type: 'array', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
          ],
        },
        {
          label: 'Variantes y Stock',
          fields: [
            {
              name: 'variants',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [
                { type: 'row', fields: [
                  { name: 'size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL', 'U'], required: true },
                  { name: 'stock', type: 'number', required: true, min: 0, defaultValue: 0 },
                  { name: 'sku', type: 'text', required: true },
                ]},
              ],
            },
          ],
        },
      ],
    },
  ],
};