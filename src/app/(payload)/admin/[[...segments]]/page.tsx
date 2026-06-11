import configPromise from '@/payload.config';
import { RootPage } from '@payloadcms/next/views';
import { importMap } from '../importMap.js';

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export default function Page({ params, searchParams }: Args) {
  // Llamada funcional nativa de Payload 3
  return RootPage({ config: configPromise, importMap, params, searchParams });
}