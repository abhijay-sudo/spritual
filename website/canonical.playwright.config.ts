import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'canonical-preview.spec.ts',workers:1,use:{baseURL:'http://127.0.0.1:4191',browserName:'chromium'},reporter:'list'});
