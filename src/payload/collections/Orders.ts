import { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: { useAsTitle: 'order_number', defaultColumns: ['order_number', 'status', 'total', 'createdAt'] },
  access: {
    create: () => false, // Solo creadas por el Webhook del servidor
    update: ({ req: { user } }) => !!user, // Solo admin edita el tracking
    delete: () => false,
  },
  fields: [
    { type: 'row', fields: [
      { name: 'order_number', type: 'text', required: true, unique: true },
      { name: 'status', type: 'select', options: ['pending', 'paid', 'packing', 'shipped', 'cancelled'], defaultValue: 'pending', required: true },
    ]},
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { type: 'row', fields: [
          { name: 'product', type: 'relationship', relationTo: 'products', required: true },
          { name: 'size', type: 'text', required: true },
          { name: 'quantity', type: 'number', required: true },
          { name: 'price_locked', type: 'number', required: true },
        ]}
      ],
    },
    { type: 'row', fields: [
      { name: 'total', type: 'number', required: true },
      { name: 'payment_id', type: 'text' },
    ]},
    {
      name: 'shipping_info',
      type: 'group',
      fields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'dni', type: 'text', required: true },
        { name: 'address', type: 'text', required: true },
        { name: 'city', type: 'text', required: true },
        { name: 'province', type: 'text', required: true },
        { name: 'zip_code', type: 'text', required: true },
        { name: 'tracking_url', type: 'text' },
      ],
    },
  ],
};
