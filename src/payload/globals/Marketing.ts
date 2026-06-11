import { GlobalConfig } from 'payload';

export const Marketing: GlobalConfig = {
  slug: 'marketing',
  label: 'Promociones y Popups',
  fields: [
    { name: 'enable_popup', type: 'checkbox', defaultValue: false },
    {
      name: 'popup',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData.enable_popup },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'button_text', type: 'text' },
        { name: 'button_link', type: 'text' },
      ],
    },
  ],
};