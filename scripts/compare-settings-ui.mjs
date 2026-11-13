import { build } from "esbuild";
import { resolve } from "node:path";
import assert from 'node:assert/strict';
const argument = process.argv.indexOf("--baseline");
assert.ok(argument >= 0 && process.argv[argument + 1], "Usage: node scripts/compare-settings-ui.mjs --baseline <source snapshot>");
const baseline = resolve(process.argv[argument + 1]);
const candidate = process.cwd();
const host=`
export class TestEl {
 constructor(tag='div',options={}) { this.tag=tag;this.attrs={...options.attr};this.text=options.text??'';this.classes=new Set((options.cls??'').split(' ').filter(Boolean));this.children=[];this.listeners={};this.style={};this.value='';this.disabled=false;this.open=false;this.checked=false;this.ownerDocument={body:{classList:{contains:()=>false}},querySelectorAll:()=>[]};this.classList={contains:(c)=>this.classes.has(c),toggle:(c,on)=>this.toggleClass(c,on)}; }
 createEl(tag,options={}) { const child=new TestEl(tag,options);this.appendChild(child);return child; }
 createDiv(options={}) { return this.createEl('div',options); }
 createSpan(options={}) { return this.createEl('span',options); }
 appendChild(child) { if(child.parentElement) child.parentElement.children=child.parentElement.children.filter(c=>c!==child);child.parentElement=this;this.children.push(child);return child; }
 insertBefore(child,before) { if(child.parentElement) child.parentElement.children=child.parentElement.children.filter(c=>c!==child);child.parentElement=this;this.children.splice(this.children.indexOf(before),0,child); }
 get firstChild() { return this.children[0]; } get childElementCount() { return this.children.length; }
 addClass(...names) { names.forEach(n=>this.classes.add(n)); } removeClass(...names) { names.forEach(n=>this.classes.delete(n)); }
 toggleClass(name,on) { if(on)this.classes.add(name);else this.classes.delete(name); }
 setText(text) {this.text=text;} setAttribute(name,value) {this.attrs[name]=value;} removeAttribute(name) {delete this.attrs[name];}
 addEventListener(name,callback) { this.listeners[name]=callback; }
 empty() {this.children=[];this.text='';} closest() {return this.parentElement;} focus(){this.focused=true;} select(){this.selected=true;}
 snapshot() {return {tag:this.tag,attrs:this.attrs,text:this.text,classes:[...this.classes],style:this.style,value:this.value,disabled:this.disabled,open:this.open,checked:this.checked,title:this.title,ariaLabel:this.ariaLabel,children:this.children.map(c=>c.snapshot())};}
}
class Control {
 constructor(el) {this.inputEl=el;this.buttonEl=el;} setButtonText(v) {this.inputEl.text=v;return this;} setName(v) {this.inputEl.text=v;return this;}
 setValue(v) {this.inputEl.value=v;return this;} setPlaceholder(v) {this.inputEl.attrs.placeholder=v;return this;} setDisabled(v) {this.inputEl.disabled=v;return this;}
 setCta(){this.inputEl.addClass('mod-cta');return this;} addOption(value,text){this.inputEl.createEl('option',{text,attr:{value}});return this;}
 onChange(cb) {this.inputEl.onchange=cb;return this;} onClick(cb) {this.inputEl.onclick=cb;return this;}
}
export class Setting {
 constructor(parent) {this.settingEl=parent.createDiv({cls:'setting-item'});this.nameEl=this.settingEl.createDiv({cls:'setting-item-name'});this.descEl=this.settingEl.createDiv({cls:'setting-item-description'});this.controlEl=this.settingEl.createDiv({cls:'setting-item-control'});}
 setName(v){this.nameEl.text=v;return this;} setDesc(v){this.descEl.text=v;return this;}
 addButton(cb){cb(new Control(this.controlEl.createEl('button')));return this;}
 addText(cb){cb(new Control(this.controlEl.createEl('input')));return this;}
 addDropdown(cb){cb(new Control(this.controlEl.createEl('select')));return this;}
 addToggle(cb){cb(new Control(this.controlEl.createEl('input',{attr:{type:'checkbox'}})));return this;}
}
export const openedModals=[];export const notices=[];
export class Modal {constructor(app){this.app=app;this.shell=new TestEl('div',{cls:'modal'});this.contentEl=this.shell.createDiv();}open(){openedModals.push(this);this.onOpen();return this;}close(){this.closed=true;}}
export class Notice {constructor(message){notices.push(message);}}
export class PluginSettingTab {constructor(app,plugin){this.app=app;this.plugin=plugin;}}
export class App{} export class Plugin{} export class ItemView{} export class SuggestModal{} export class Component{} export class WorkspaceLeaf{} export class TFile{} export class TFolder{}
export const Platform={isMobile:false};export const MarkdownRenderer={};export function requestUrl(){throw Error('unexpected network');}export function setIcon(el,icon){el.icon=icon;}
`;
async function load(root) {
 const result=await build({stdin:{contents:`export { DiaryObsidianSettingTab as Tab } from './src/settings.ts';export {LOCALE_OPTIONS,setLocale,t} from './src/i18n.ts';export {TestEl,openedModals,notices} from 'obsidian';`,resolveDir:root,loader:'ts'},bundle:true,write:false,format:'esm',platform:'node',plugins:[{name:'host',setup(builder){builder.onResolve({filter:/^obsidian$/},()=>({path:'obsidian',namespace:'host'}));builder.onLoad({filter:/.*/,namespace:'host'},()=>({contents:host,loader:'js'}));}}]});
 return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const before=await load(baseline);const after=await load(candidate);
function fixture(api,calendars,caches=[]) {
 const events=[];
 const plugin={settings:{externalCalendars:structuredClone(calendars),externalCalendarCaches:structuredClone(caches)},async saveSettings(){events.push('save');},async refreshExternalCalendar(id){events.push(['refresh',id]);return true;},async refreshAllExternalCalendars(){events.push('refresh-all');return {refreshed:1,failed:0};}};
 const app={};plugin.app=app;
 const tab=new api.Tab(app,plugin);const root=new api.TestEl();tab.renderExternalCalendars(root);
 return {api,root,plugin,events};
}
const feed={id:'feed',name:'Work',url:'webcal://calendar.example/test.ics',color:'#123456',enabled:true,refreshMinutes:60,includeDescriptions:false,showInYearly:true,showInMonthly:true,showInMonthlyList:false,showInSidebar:true};
const states=[[],[feed],[{...feed,enabled:false,refreshMinutes:null}],[feed,{...feed,id:'other',name:'Other'}]];
let compared=0;
for(const locale of before.LOCALE_OPTIONS) {
 before.setLocale(locale.value);after.setLocale(locale.value);
 for(const calendars of states) for(const error of [false,true]) {
  const caches=error?[{calendarId:'feed',fetchedAt:'2026-11-14T00:00:00Z',events:[{}],lastError:{occurredAt:'2026-11-14T01:00:00Z',message:'Read error'}}]:[];
  const a=fixture(before,calendars,caches);const b=fixture(after,calendars,caches);
  assert.deepEqual(b.root.snapshot(),a.root.snapshot(),locale.value+' settings DOM');compared++;
 }
}
function nodes(root,predicate) {return [root,...root.children.flatMap(c=>nodes(c,predicate))].filter(predicate);}
function button(root,text) {return nodes(root,n=>n.tag==='button'&&(n.text===text||n.children.some(c=>c.text===text)))[0];}
// Exercise row callbacks and the add/edit editor against original action order and exact modal DOM.
before.setLocale('en');after.setLocale('en');
for(const action of ['settings.externalCalendarDisable','settings.externalCalendarRefresh','settings.externalCalendarRemove','settings.externalCalendarEdit','settings.externalCalendarAdd','settings.externalCalendarRefreshAll']) {
 const a=fixture(before,[feed]);const b=fixture(after,[feed]);
 const click=async(host)=>{await button(host.root,host.api.t(action)).onclick();};
 await click(a);await click(b);
 assert.deepEqual(b.events,a.events,action+' action order');assert.deepEqual(b.plugin.settings,a.plugin.settings,action+' mutations');assert.deepEqual(b.root.snapshot(),a.root.snapshot(),action+' rerender DOM');
 if(action.endsWith('Edit')||action.endsWith('Add')) {
  const am=before.openedModals.at(-1);const bm=after.openedModals.at(-1);assert.deepEqual(bm.contentEl.snapshot(),am.contentEl.snapshot(),action+' modal DOM');
  am.urlInput.value='http://invalid';bm.urlInput.value='http://invalid';am.updateState();bm.updateState();assert.deepEqual(bm.contentEl.snapshot(),am.contentEl.snapshot(),action+' validation');
  am.urlInput.value='https://calendar.example/new.ics';bm.urlInput.value='https://calendar.example/new.ics';am.nameInput.value='Changed';bm.nameInput.value='Changed';
  const originalDate=Date.now;const originalRandom=Math.random;Date.now=()=>1794614400000;Math.random=()=>0.5;
  try{await am.handleSave();await bm.handleSave();}finally{Date.now=originalDate;Math.random=originalRandom;}
  assert.deepEqual(b.plugin.settings,a.plugin.settings,action+' saved fields');assert.deepEqual(b.events,a.events,action+' saved order');assert.equal(bm.closed,am.closed);
 }
}
console.log(JSON.stringify({settingsDomComparisons:compared,locales:before.LOCALE_OPTIONS.length,actionsCompared:6,modalCases:2,validationAndSaveCompared:true}));
