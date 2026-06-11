import configPromise from '@/payload.config'
import '@payloadcms/next/css'
import React from 'react'

import type { ServerFunctionClient } from 'payload'
import {
  RootLayout,
  handleServerFunctions,
} from '@payloadcms/next/layouts'

import { importMap } from './admin/importMap.js'

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'

  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  })
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RootLayout
      config={configPromise}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}