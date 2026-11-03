import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./collections/ramayana',testMatch:['collection.spec.ts','continuity.spec.ts'],workers:1,retries:0,reporter:'list',
  outputDir:'../test-results/ramayana-collection',
  use:{baseURL:'http://127.0.0.1:4194',browserName:'chromium',channel:'chrome',serviceWorkers:'block',trace:'retain-on-failure'},
  webServer:{command:'node website/serve.mjs --welcome-preview',cwd:'..',url:'http://127.0.0.1:4194',reuseExistingServer:true}
});
