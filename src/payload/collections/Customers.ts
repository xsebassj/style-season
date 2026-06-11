import { CollectionConfig } from 'payload';

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true },
    { name: 'full_name', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'total_spent', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  ],
};