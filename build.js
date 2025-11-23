#!/usr/bin/env node
/**
 * Custom build script that bypasses vite CLI binary permission issues
 * Works reliably on Vercel and local environments
 */

const { build } = require('vite');
const path = require('path');

async function viteBuild() {
  try {
    console.log('🏗️  Starting Vite build...');
    await build({
      root: process.cwd(),
      logLevel: 'info'
    });
    console.log('✅ Build completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

viteBuild();
