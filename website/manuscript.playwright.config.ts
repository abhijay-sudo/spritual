import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'manuscript-release.spec.ts',workers:1,retries:0,use:{baseURL:'http://127.0.0.1:4190',browserName:'chromium',headless:true},reporter:'list'});
