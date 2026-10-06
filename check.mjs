import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {site,countries,universities,programmeTypes,ceoSections} from './content.mjs';

const files=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
const html=Object.fromEntries(files.map(f=>[f,fs.readFileSync(f,'utf8')]));
const ids=Object.fromEntries(files.map(f=>[f,new Set([...html[f].matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]))]));
let references=0;
for(const file of files){
  const source=html[file];
  assert.equal((source.match(/<h1[ >]/g)||[]).length,1,`${file}: expected one h1`);
  assert.match(source,/<title>[^<]+Genesis Educare<\/title>/,`${file}: missing title`);
  assert.match(source,/<meta name="description" content="[^"]+">/,`${file}: missing description`);
  assert.ok(source.includes('id="main"'),`${file}: missing main landmark`);
  assert.equal(source,fs.readFileSync(path.join('dist',file),'utf8'),`${file}: dist differs`);
  const usedIds=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(usedIds.length,new Set(usedIds).size,`${file}: duplicate id`);
  for(const img of source.matchAll(/<img\b[^>]*>/g))assert.match(img[0],/\balt="[^"]*"/,`${file}: missing image alternative`);
  for(const [,raw] of source.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(?:https?:|mailto:|tel:|data:)/.test(raw))continue;
    references++;
    const url=new URL(raw,`http://localhost/${file}`);
    const target=decodeURIComponent(url.pathname).slice(1)||'index.html';
    assert.ok(fs.existsSync(target),`${file}: missing ${raw}`);
    if(url.hash && ids[target])assert.ok(ids[target].has(url.hash.slice(1)),`${file}: missing anchor ${raw}`);
  }
}
for(const c of countries){assert.ok(html[`${c.slug}.html`],`No country page: ${c.name}`);assert.ok(fs.existsSync(`assets/flags/${c.flag}.svg`));}
for(const p of programmeTypes)assert.ok(html[`${p.slug}.html`]);
for(const number of site.phones){assert.ok(html['contact.html'].includes(`tel:+${number}`));assert.ok(html['contact.html'].includes(`https://wa.me/${number}`));}
assert.ok(html['contact.html'].includes(`mailto:${site.email}`));
for(const s of ceoSections)for(const p of s.paras)assert.ok(html['ceo-message.html'].includes(p),'Missing CEO paragraph');
assert.ok(html['programmes.html'].includes('assets/programme-audience.png'),'Missing requested photo');
assert.equal((html['success.html'].match(/class="success-card"/g)||[]).length,2,'Duplicate or missing student story');
for(const u of universities)assert.ok(html['universities.html'].includes(u.url));
assert.ok(!/98\.3%|12,000\+|14 years|96%|97%/.test(html['index.html']),'Reference-site claims must not carry over');
const font=fs.readFileSync('assets/manrope.ttf');assert.equal(font.readUInt32BE(0),0x00010000,'Invalid TrueType header');
for(const [,asset]of fs.readFileSync('styles.css','utf8').matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))assert.ok(fs.existsSync(asset),`Missing CSS asset: ${asset}`);

// Run the actual interaction script against a small DOM fixture. This does not use a browser.
class Element {
  constructor({dataset={},value='',text=''}={}){this.dataset=dataset;this.value=value;this.textContent=text;this.hidden=false;this.handlers={};this.attrs={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,v)=>v?this.classes.add(x):this.classes.delete(x),contains:x=>this.classes.has(x)};}
  addEventListener(n,fn){(this.handlers[n]??=[]).push(fn);}
  setAttribute(n,v){this.attrs[n]=v;}
  getAttribute(n){return this.attrs[n];}
  fire(n){for(const fn of this.handlers[n]||[])fn({preventDefault(){},target:this});}
  focus(){}
}
const rootCards=countries.map(c=>new Element({dataset:{country:c.slug,region:c.region,search:`${c.name} ${c.region}`.toLowerCase()}}));
const filters=['All','Asia','Europe','Americas','Oceania'].map(f=>new Element({dataset:{filter:f}}));
const search=new Element(),empty=new Element(),status=new Element(),reset=new Element();
const browser={querySelectorAll:s=>s==='[data-country]'?rootCards:filters,querySelector:s=>({'[data-search-input]':search,'.empty-state':empty,'.filter-status':status,'[data-reset]':reset}[s]??null)};
const input=(value='',text='')=>Object.assign(new Element({value}),{selectedOptions:[{text}],options:[],setCustomValidity(message){this.validityMessage=message;},reportValidity(){return !this.validityMessage;}});
const elements={name:input('Website QA'),phone:input('+8801700000000'),email:input('qa@example.com'),destination:input('china','China'),programme:input('postgraduate','Postgraduate / Master’s'),message:input('Please help compare courses & scholarships.'),adviser:input('8801805486172')};
elements.namedItem=name=>elements[name];
const form=Object.assign(new Element(),{elements,reportValidity:()=>true});
const formStatus=new Element(),fallback=new Element(),menu=new Element(),navigation=new Element();menu.setAttribute('aria-expanded','false');
const poster=new Element({dataset:{lightbox:'assets/success-arafat.png',caption:'Arafat Hossain Rafi — China student visa success'}});
const dialogImage=new Element(),caption=new Element(),close=new Element();
const dialog=Object.assign(new Element(),{open:false,showModal(){this.open=true;},close(){this.open=false;},querySelector:s=>({'img':dialogImage,'p':caption,'.lightbox-close':close}[s])});
const deadline=new Element({dataset:{intakeDeadline:'2000-01-01T00:00:00+06:00'}});
let opened;
const document={querySelector:s=>({'.menu-toggle':menu,'#main-nav':navigation,'#enquiry-form':form,'#form-status':formStatus,'#whatsapp-fallback':fallback,'#image-lightbox':dialog}[s]??null),querySelectorAll:s=>({'[data-filter-browser]':[browser],'[data-lightbox]':[poster],'[data-intake-deadline]':[deadline]}[s]??[]),addEventListener(){}};
vm.runInNewContext(fs.readFileSync('app.js','utf8'),{document,window:{open:(...args)=>{opened=args;}},location:{search:''},matchMedia:()=>({matches:false,addEventListener(){}}),URLSearchParams,FormData:class{constructor(form){this.form=form;}get(k){return this.form.elements[k]?.value;}},Date});
assert.equal(rootCards.filter(c=>!c.hidden).length,18);
filters[1].fire('click');assert.equal(rootCards.filter(c=>!c.hidden).length,4,'Asia filter');
search.value='china';search.fire('input');assert.equal(rootCards.filter(c=>!c.hidden).length,1,'Combined region and search');
search.value='no such country';search.fire('input');assert.equal(rootCards.filter(c=>!c.hidden).length,0);assert.equal(empty.hidden,false,'Empty state');
reset.fire('click');assert.equal(rootCards.filter(c=>!c.hidden).length,18,'Filter reset');
menu.fire('click');assert.equal(menu.getAttribute('aria-expanded'),'true');menu.fire('click');assert.equal(menu.getAttribute('aria-expanded'),'false');
form.fire('submit');assert.equal(new URL(opened[0]).hostname,'wa.me');assert.equal(new URL(opened[0]).pathname,'/8801805486172');
const message=new URL(opened[0]).searchParams.get('text');assert.ok(message.includes('Website QA'));assert.ok(message.includes('China'));assert.ok(message.includes('courses & scholarships.'));assert.ok(message.includes('Postgraduate / Master’s'));assert.equal(fallback.hidden,false);assert.match(formStatus.textContent,/prepared/);
elements.name.value='   ';form.fire('submit');assert.equal(elements.name.validityMessage,'Please enter your name.');elements.name.fire('input');assert.equal(elements.name.validityMessage,'');
poster.fire('click');assert.equal(dialog.open,true);assert.equal(dialogImage.src,'assets/success-arafat.png');close.fire('click');assert.equal(dialog.open,false);
assert.ok(deadline.classes.has('expired'));assert.match(deadline.textContent,/current intake availability/);
console.log(`PASS: ${files.length} pages, ${references} local links/assets, ${countries.length} destinations, ${universities.length} university options.`);
console.log('PASS: region/search filters, empty state/reset, menu state, enquiry encoding and contact routing, form name validation, image viewer, expired intake handling.');
console.log('Browser rendering and device-layout checks are not covered by these static and DOM-fixture checks.');
