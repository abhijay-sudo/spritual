import {defineConfig, devices} from '@playwright/test';

// These are browser-engine/device emulations, not claims of physical-device QA.
export default defineConfig({
  testDir:'./collections/ramayana', testMatch:'devices.spec.ts', workers:1, retries:0,
  reporter:[['list'],['json',{outputFile:'../docs/qa/ramayana-release-2026-10-27/device-results.json'}]],
  outputDir:'../test-results/ramayana-devices',
  use:{baseURL:'http://127.0.0.1:4194',serviceWorkers:'block',trace:'retain-on-failure'},
  projects:[
    {name:'iphone-webkit',use:{...devices['iPhone 13'],browserName:'webkit'}},
    {name:'android-chrome',use:{...devices['Pixel 7'],browserName:'chromium',channel:'chrome'}},
    {name:'desktop-chrome',use:{browserName:'chromium',channel:'chrome',viewport:{width:1440,height:1000}}},
    {name:'desktop-webkit',use:{browserName:'webkit',viewport:{width:1440,height:1000}}}
  ],
  webServer:{command:'node website/serve.mjs --welcome-preview',cwd:'..',url:'http://127.0.0.1:4194',reuseExistingServer:true}
});
