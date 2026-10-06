import fs from 'node:fs';
import {countries} from './content.mjs';
fs.mkdirSync('assets/flags',{recursive:true});
const results = await Promise.allSettled(countries.map(async c=>{
  const file=`assets/flags/${c.flag}.svg`;
  if(fs.existsSync(file))return;
  const response=await fetch(`https://flagcdn.com/${c.flag}.svg`,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw new Error(`${c.flag}: ${response.status}`);
  const svg=await response.text();
  if(!svg.includes('<svg'))throw new Error(`Invalid flag: ${c.flag}`);
  fs.writeFileSync(file,svg);
}));
const errors=results.filter(r=>r.status==='rejected');
if(errors.length){errors.forEach(r=>console.error(r.reason.message));process.exitCode=1;}
if(!fs.existsSync('assets/manrope.ttf')){
  const response=await fetch('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap',{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});
  const css=await response.text();
  const urls=[...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]);
  if(!urls.length)throw new Error('No font URL returned');
  const font=await fetch(urls.at(-1));
  if(!font.ok)throw new Error('Font download failed');
  fs.writeFileSync('assets/manrope.ttf',Buffer.from(await font.arrayBuffer()));
}
const logo=fs.readFileSync('assets/genesis-logo.png').toString('base64');
fs.writeFileSync('assets/favicon.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="125 270 560 560"><image width="768" height="1112" href="data:image/png;base64,${logo}"/></svg>`);
console.log(`Prepared ${countries.length} local flags, font and branded favicon.`);
