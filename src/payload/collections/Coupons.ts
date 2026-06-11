import { CollectionConfig } from 'payload';

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: { useAsTitle: 'code' },
  fields: [
    { type: 'row', fields: [
      { name: 'code', type: 'text', required: true, unique: true },
      { name: 'type', type: 'select', options: ['percentage', 'fixed'], required: true },
    ]},
    { type: 'row', fields: [
      { name: 'value', type: 'number', required: true, min: 0 },
      { name: 'usage_limit', type: 'number', admin: { description: 'Dejar vacío para uso ilimitado' } },
    ]},
    { name: 'times_used', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'expiry_date', type: 'date' },
  ],
};