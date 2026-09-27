import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import path from 'node:path';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1234','chrome-win64','chrome.exe'),args:['--enable-webgl','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1366,height:768}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const snapshot=()=>page.evaluate(()=>{const g=__blast.game;return {player:{...g.player},convoy:{...g.convoy},time:g.time,score:g.score,cleared:g.cleared,buildings:g.buildings.map(b=>b.hp),pickups:g.pickups.map(p=>p.taken),mode:__blast.mode}});
try{
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('retro')));
 assert.equal(await page.locator('#world').evaluate(e=>e.height),360);
 const buttonBox=await page.locator('#start').boundingBox();assert.ok(buttonBox.y+buttonBox.height<720);
 await page.getByRole('button',{name:'INICIAR OPERACIÓN'}).click();
 await page.keyboard.down('KeyW');await page.waitForTimeout(700);await page.keyboard.up('KeyW');
 await page.keyboard.press('Digit3');await page.keyboard.press('Space');await page.waitForTimeout(200);await page.keyboard.press('Escape');
 const before=await snapshot();assert.ok(before.cleared>0);
 // Programmatic clicks are intentional: the modal blocks mouse access while paused.
 await page.locator('#graphics').evaluate(e=>e.click());
 assert.deepEqual(await snapshot(),before,'HD switch must preserve complete mission state');
 assert.equal(await page.locator('#world').evaluate(e=>e.height),768);
 await page.getByRole('button',{name:'CONTINUAR →'}).click();await page.waitForTimeout(350);
 await page.screenshot({path:'test-results/hd-preserved.png'});
 await page.keyboard.press('Escape');const hd=await snapshot();
 await page.locator('#graphics').evaluate(e=>e.click());assert.deepEqual(await snapshot(),hd);
 await page.getByRole('button',{name:'CONTINUAR →'}).click();await page.waitForTimeout(400);
 await page.screenshot({path:'test-results/retro-game.png'});
 await page.reload({waitUntil:'networkidle'});assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('retro')));
 await page.locator('#graphics').click();await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('retro')),false);
 await page.locator('#graphics').click();
 assert.deepEqual(errors,[]);
 console.log('PASS: N64 default, 360-line rendering, laptop layout, HD and N64 preserve mission state, preference survives reload, no browser errors.');
}finally{await browser.close()}
