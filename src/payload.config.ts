import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'path';
import { fileURLToPath } from 'url';

// Rutas relativas estrictas para evitar el fallo del loader ESM
import { Users } from './payload/collections/Users';
import { Media } from './payload/collections/Media';
import { Products } from './payload/collections/Products';
import { Drops } from './payload/collections/Drops';
import { Orders } from './payload/collections/Orders';
import { Coupons } from './payload/collections/Coupons';
import { Customers } from './payload/collections/Customers';

import { HomePage } from './payload/globals/HomePage';
import { Settings } from './payload/globals/Settings';
import { Marketing } from './payload/globals/Marketing';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- Style Season Admin',
      icons: [{ url: '/favicon.ico' }],
    },
  },
  collections: [Users, Media, Products, Drops, Orders, Coupons, Customers],
  globals: [HomePage, Settings, Marketing],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'sa-east-1',
        forcePathStyle: true,
      },
    }),
  ],
});