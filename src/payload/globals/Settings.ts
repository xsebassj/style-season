import { GlobalConfig } from 'payload';

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Configuración Tienda',
  fields: [
    { type: 'row', fields: [
      { name: 'shipping_flat_rate', type: 'number', required: true, defaultValue: 6500 },
      { name: 'free_shipping_threshold', type: 'number', required: true, defaultValue: 150000 },
    ]},
    { type: 'row', fields: [
      { name: 'whatsapp_number', type: 'text', required: true },
      { name: 'instagram_url', type: 'text' },
    ]},
    { name: 'footer_text', type: 'textarea' },
  ],
};