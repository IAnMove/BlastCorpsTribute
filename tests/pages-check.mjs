// Run after `npm run build`. Serves only dist under a repository-like subpath.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';

const root=path.resolve('dist');
const prefix='/github-pages-test/';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(!pathname.startsWith(prefix)){res.writeHead(404).end();return}
  const file=path.resolve(root,decodeURIComponent(pathname.slice(prefix.length))||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  try{const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404).end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
  const executablePath=process.env.BROWSER_PATH||(process.platform==='win32'?path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1234','chrome-win64','chrome.exe'):undefined);
  browser=await chromium.launch({headless:true,executablePath,args:['--enable-webgl','--ignore-gpu-blocklist']});
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}`,{waitUntil:'networkidle'});
  await page.locator('#loading').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(()=>typeof window.__blast),'undefined','Production must exclude the development inspection API');
  await page.getByRole('button',{name:'INICIAR OPERACIÓN'}).click();
  await page.locator('#hud').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.getElementById('timer').textContent!=='00:00');
  await page.getByRole('button',{name:'Cambiar a gráficos HD'}).click();
  await page.getByRole('button',{name:'Cambiar a gráficos N64'}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS: production game boots, runs and switches graphics under a GitHub Pages subpath; no missing assets or browser errors.');
}finally{
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
