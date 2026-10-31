import {defineConfig} from '@playwright/test';
const publicBuild=Boolean(process.env.WELCOME_PUBLIC);
const localURL=`http://127.0.0.1:${publicBuild?'4190':'4194'}`;
export default defineConfig({
  testDir:'./welcome-preview/tests',workers:1,retries:0,reporter:'list',
  outputDir:'../test-results/welcome-preview',
  use:{baseURL:process.env.WEBSITE_URL||localURL,browserName:'chromium',channel:process.env.WELCOME_CHROME?'chrome':undefined,viewport:{width:390,height:844},reducedMotion:'no-preference',serviceWorkers:'block',trace:'retain-on-failure'},
  webServer:process.env.WEBSITE_URL?undefined:{command:`node website/serve.mjs${publicBuild?'':' --welcome-preview'}`,cwd:'..',url:localURL,reuseExistingServer:true},
});
