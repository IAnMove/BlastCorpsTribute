import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import path from 'node:path';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||path.join(process.env.LOCALAPPDATA,'ms-playwright','chromium-1234','chrome-win64','chrome.exe')});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.mission-tab').count(),7);
 for(const [index,name] of [[3,'MUELLES'],[4,'REFINERÍA'],[5,'CAÑÓN'],[6,'CENTRAL']]){
  if(index>3)await page.evaluate(()=>__blast.menu());
  await page.getByRole('button',{name:`0${index+1} / ${name}`,exact:true}).click();
  await page.getByRole('button',{name:'INICIAR OPERACIÓN'}).click();await page.waitForTimeout(650);
  assert.equal(await page.evaluate(()=>__blast.game.index),index);
  await page.screenshot({path:`test-results/campaign-${index+1}-n64.png`});
  // Move into range; use the real keyboard interaction to open the gate.
  await page.evaluate(()=>{const c=__blast.game.consoles[0];Object.assign(__blast.game.player,{x:c.x,z:c.z,speed:0});});
  await page.locator('.interaction-prompt').waitFor({state:'visible'});
  await page.keyboard.press('KeyE');
  assert.equal(await page.evaluate(()=>__blast.game.consoles[0].active),true);
  assert.ok(await page.evaluate(()=>__blast.game.buildings.filter(b=>b.lockedBy===__blast.game.consoles[0].id).every(b=>b.destroyed)));
  await page.locator('#graphics').click();await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>__blast.game.consoles[0].active),true);
  await page.screenshot({path:`test-results/campaign-${index+1}-hd.png`});
  await page.locator('#graphics').click();
 }
 await page.evaluate(()=>__blast.menu());await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'07 / CENTRAL',exact:true}).click();
 await page.screenshot({path:'test-results/campaign-menu-mobile.png'});
 await page.getByRole('button',{name:'INICIAR OPERACIÓN'}).click();
 await page.evaluate(()=>{const c=__blast.game.consoles[0];Object.assign(__blast.game.player,{x:c.x,z:c.z,speed:0});});
 await page.getByRole('button',{name:'Activar terminal',exact:true}).click();
 assert.equal(await page.evaluate(()=>__blast.game.consoles[0].active),true);
 assert.deepEqual(errors,[]);
 console.log('PASS: seven mission buttons, all four campaign maps in N64 and HD, E activates gates, graphics preserve objectives, mobile mission selection and touch terminal.');
}finally{await browser.close()}
