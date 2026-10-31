import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:['canonical-preview.spec.ts','council-*.spec.ts'],workers:1,use:{baseURL:process.env.QA_BASE_URL||'http://127.0.0.1:4191',browserName:process.env.QA_BROWSER==='webkit'?'webkit':'chromium'},reporter:'list'});
