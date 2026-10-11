import { missions, labels, validate, statusLabel } from './schema.js';
const stages=[['planning','기획'],['acquisition','확보'],['validation','검증'],['development','개발'],['submission','제출'],['review','심사']];
const development={implementation:'구현',hostTest:'호스트 테스트',deviceTest:'기기 테스트',signedBuild:'서명 빌드'};
const symbols={unknown:'?',pending:'○',progress:'●',complete:'✓',blocked:'!',na:'−',submitted:'↑',reviewing:'◷',approved:'✓',rejected:'!',released:'★'};
const $=id=>document.getElementById(id);
const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const platformName=p=>p==='shared'?'공통':p==='ios'?'iOS':'Android';
let data,view='table';const expanded=new Set();
const legend=document.querySelector('.legend');legend.addEventListener('toggle',()=>legend.querySelector('summary').setAttribute('aria-expanded',String(legend.open)));
missions.forEach(m=>{const o=el('option',m);o.value=m;$('mission').append(o);});
Object.entries(symbols).forEach(([s,g])=>{const item=el('span',undefined,'legend-item');item.append(el('b',g),el('span',s==='pending'?'미착수 / 제출 전 / 심사 대기':labels[s]));$('legend-items').append(item);});
function badge(s,stage){return el('span',statusLabel(s,stage),`badge ${s}`);}
function glyph(s,label){const stage=label.includes('제출')?'submission':label.includes('심사')?'review':undefined;const text=statusLabel(s,stage);const n=el('span',symbols[s],`glyph ${s}`);n.setAttribute('role','img');n.setAttribute('aria-label',`${label}: ${text}`);n.title=`${label}: ${text}`;return n;}
function platforms(app){return app.platforms.filter(p=>$('platform').value==='all'||$('platform').value===p);}
function developmentState(app){const c=app[$('cycle').value].development;const values=['shared',...platforms(app)].flatMap(p=>Object.values(c[p]));return values.every(s=>s===values[0])?values[0]:'mixed';}
function compact(app,key,label){const c=app[$('cycle').value],box=el('div',undefined,'compact-state');
 if(key==='submission'||key==='review'){platforms(app).forEach(p=>{const line=el('span',undefined,'platform-symbol');line.append(el('small',p==='ios'?'i':'a'),glyph(c[key][p],`${platformName(p)} ${label}`));box.append(line);});}
 else if(key==='development'){const s=developmentState(app);if(s==='mixed'){const n=el('span','≋','glyph mixed');n.setAttribute('role','img');n.setAttribute('aria-label','개발: 세부 상태');n.title='개발: 세부 상태';box.append(n);}else box.append(glyph(s,label));}
 else box.append(glyph(c[key],label));return box;
}
function wide(app,key){const c=app[$('cycle').value],box=el('div',undefined,'wide-state');
 if(key==='submission'||key==='review')platforms(app).forEach(p=>{const line=el('div',undefined,'platform-line');line.append(el('span',platformName(p)),badge(c[key][p],key));box.append(line);});
 else if(key==='development'){const s=developmentState(app);box.append(s==='mixed'?el('span','세부 상태','badge'):badge(s));}
 else box.append(badge(c[key]));return box;
}
function timestamp(value){return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value))+' KST';}
function detail(app,id){const area=el('div',undefined,'app-detail');area.id=id;area.dataset.key=app.name+'|'+(id.startsWith('board-')?id.split('-')[2]:'table');area.hidden=!expanded.has(area.dataset.key);area.setAttribute('role','region');area.setAttribute('aria-label',`${app.name} 상세`);
 area.append(el('h3',app.name));area.append(el('p',app.mission+' · '+app.platforms.map(platformName).join(' / '),'detail-meta'));
 const times=el('div',undefined,'detail-meta');times.append(el('p','확인 '+(app.checkedAt?timestamp(app.checkedAt):'미확인')));if(app.stageChangedAt)times.append(el('p','단계 변경 '+timestamp(app.stageChangedAt)));if(app.checkedAt&&Date.now()-new Date(app.checkedAt)>7*86400000)times.append(el('p','오래된 자료','stale'));area.append(times);
 const cycles=el('div',undefined,'detail-cycles');for(const [cycle,title] of [['initial','초기 출시'],['update','현재 개선판']]){const block=el('section');block.append(el('h4',title));const c=app[cycle];const short=el('div',undefined,'detail-stages');for(const [k,l] of stages.filter(([k])=>k!=='development')){const item=el('div');item.append(el('h5',l));if(k==='submission'||k==='review')app.platforms.forEach(p=>{const line=el('div',undefined,'platform-line');line.append(el('span',platformName(p)),badge(c[k][p],k));item.append(line);});else item.append(badge(c[k],k));short.append(item);}block.append(short);
 const dev=el('div',undefined,'detail-development');for(const p of ['shared',...app.platforms]){const group=el('div');group.append(el('h5',platformName(p)+' 개발'));const list=el('ul');for(const [k,l] of Object.entries(development)){const li=el('li');li.append(el('span',l),badge(c.development[p][k]));list.append(li);}group.append(list);dev.append(group);}block.append(dev);cycles.append(block);}area.append(cycles);return area;
}
function toggle(app,area,button){const open=!expanded.has(area.dataset.key);if(open)expanded.add(area.dataset.key);else expanded.delete(area.dataset.key);area.hidden=!open;button.setAttribute('aria-expanded',String(open));}
function appButton(app,area){const b=el('button',undefined,'app-button');b.append(el('span',app.name,'app-name'));b.type='button';b.setAttribute('aria-label',`${app.name} 상세`);b.setAttribute('aria-expanded',String(expanded.has(area.dataset.key)));b.setAttribute('aria-controls',area.id);b.addEventListener('click',()=>toggle(app,area,b));return b;}
function render(){const apps=data.apps.filter(a=>a.name.toLocaleLowerCase('ko').includes($('search').value.trim().toLocaleLowerCase('ko'))&&($('mission').value==='all'||a.mission===$('mission').value)&&($('platform').value==='all'||a.platforms.includes($('platform').value)));
 $('results').replaceChildren();$('count').textContent=`${apps.length}개 앱`;$('cycle-heading').textContent=$('cycle').value==='initial'?'초기 출시':'현재 개선판';$('table-button').setAttribute('aria-pressed',view==='table');$('board-button').setAttribute('aria-pressed',view==='board');
 if(!apps.length){$('results').append(el('div','검색 결과 없음','empty'));return;}
 if(view==='table'){const wrap=el('div',undefined,'table-wrap'),table=el('table');table.setAttribute('aria-label',$('cycle-heading').textContent+' 앱 진행현황');const head=el('thead'),hr=el('tr');['앱 이름',...stages.map(s=>s[1])].forEach(l=>{const th=el('th',l);th.scope='col';hr.append(th);});head.append(hr);table.append(head);const body=el('tbody');apps.forEach((a,i)=>{const row=el('tr',undefined,'app-row'),name=el('th');name.scope='row';const area=detail(a,'detail-'+i),button=appButton(a,area);name.append(button,el('div',a.mission,'desktop-meta'));row.append(name);stages.forEach(([k,l])=>{const cell=el('td');cell.append(compact(a,k,l),wide(a,k));row.append(cell);});row.addEventListener('click',e=>{if(!e.target.closest('button'))toggle(a,area,button);});const detailRow=el('tr',undefined,'detail-row'),cell=el('td');cell.colSpan=7;cell.append(area);detailRow.append(cell);body.append(row,detailRow);});table.append(body);wrap.append(table);$('results').append(wrap);}
 else{const board=el('div',undefined,'board');stages.forEach(([k,l],j)=>{const col=el('section',undefined,'column');col.append(el('h3',l));apps.forEach((a,i)=>{const card=el('article',undefined,'card'),area=detail(a,`board-detail-${j}-${i}`),button=appButton(a,area);card.append(button,compact(a,k,l),wide(a,k),area);col.append(card);});board.append(col);});$('results').append(board);}
}
['search','mission','platform','cycle'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>data&&render()));
['table','board'].forEach(v=>$(v+'-button').addEventListener('click',()=>{view=v;if(data)render();}));
$('reset').addEventListener('click',()=>{$('search').value='';$('mission').value='all';$('platform').value='all';if(data)render();$('search').focus();});
try{const response=await fetch('./status.json',{cache:'no-store'});if(!response.ok)throw new Error();data=validate(await response.json());render();}catch{$('count').textContent='';$('results').append(el('div','자료 확인 필요','empty'));}
