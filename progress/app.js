import { missions, labels, validate } from './schema.js';
const stages = [['planning','기획'],['acquisition','데이터 확보'],['validation','데이터 검증'],['development','개발'],['submission','제출'],['review','심사상태']];
const development = {implementation:'구현',hostTest:'호스트 테스트',deviceTest:'기기 테스트',signedBuild:'서명 빌드'};
const $ = id=>document.getElementById(id);
const el = (tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
let data, view='table';
missions.forEach(m=>{const o=el('option',m);o.value=m;$('mission').append(o);});
function badge(status){return el('span',labels[status],`badge ${status}`);}
function platforms(app){return app.platforms.filter(p=>$('platform').value==='all'||$('platform').value===p);}
function stageContent(app,key){
  const value=app[$('cycle').value][key], box=el('div');
  if(key==='development'){
    const details=el('details'), summary=el('summary');
    const unknown=Object.values(value).every(group=>Object.values(group).every(s=>s==='unknown'));summary.textContent=unknown?'미확인 · 상세':'단계별 상세';details.append(summary);
    ['shared',...platforms(app)].forEach(p=>{details.append(el('p',p==='shared'?'공통':p==='ios'?'iOS':'Android','meta'));const list=el('ul');Object.entries(development).forEach(([k,l])=>{const li=el('li');li.append(el('span',l),badge(value[p][k]));list.append(li);});details.append(list);});box.append(details);
  }else if(key==='submission'||key==='review'){
    platforms(app).forEach(p=>{const line=el('div',undefined,'platform-line');line.append(el('span',p==='ios'?'iOS':'Android'),badge(value[p]));box.append(line);});
  }else box.append(badge(value));
  return box;
}
function meta(app){const box=el('div',undefined,'meta');box.append(el('div',`${app.mission} · ${app.platforms.map(p=>p==='ios'?'iOS':'Android').join(' / ')}`));
  if(!app.checkedAt){box.append(el('div','마지막 확인: 미확인'));return box;}
  const date=new Date(app.checkedAt);const t=el('time',new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(date)+' KST');t.dateTime=app.checkedAt;box.append(t);
  if(app.stageChangedAt){const change=el('div','마지막 단계 변경: '+new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(app.stageChangedAt))+' KST');box.append(change);}
  if(Date.now()-date.getTime()>7*24*60*60*1000)box.append(el('div','오래된 자료', 'stale'));return box;}
function render(){
  const apps=data.apps.filter(a=>a.name.toLocaleLowerCase('ko').includes($('search').value.trim().toLocaleLowerCase('ko'))&&($('mission').value==='all'||a.mission===$('mission').value)&&($('platform').value==='all'||a.platforms.includes($('platform').value)));
  $('results').replaceChildren();$('count').textContent=`${apps.length}개 앱`;$('cycle-heading').textContent=$('cycle').value==='initial'?'초기 출시':'현재 업데이트';
  $('table-button').setAttribute('aria-pressed',view==='table');$('board-button').setAttribute('aria-pressed',view==='board');
  $('view-hint').textContent=view==='table'?'개발 칸을 펼치면 구현과 테스트, 서명 빌드를 확인할 수 있습니다.':'각 열은 해당 단계의 확인 기록입니다. 같은 앱이 각 열에 표시되며, 이후 단계로 이전 단계의 완료를 추정하지 않습니다.';
  if(!apps.length){const empty=el('div',undefined,'empty');empty.append(el('h3','일치하는 앱이 없습니다'),el('p','검색어 또는 필터를 변경해 주세요.'));$('results').append(empty);return;}
  if(view==='table'){
    const wrap=el('div',undefined,'table-wrap');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','진행현황 표 · 좌우로 스크롤');const table=el('table');table.append(el('caption',`${$('cycle-heading').textContent} · 제출 및 심사는 플랫폼별 확인 기록`));
    const head=el('thead'),tr=el('tr');['앱 이름',...stages.map(s=>s[1])].forEach(l=>{const th=el('th',l);th.scope='col';tr.append(th);});head.append(tr);table.append(head);
    const body=el('tbody');apps.forEach(a=>{const row=el('tr'),name=el('th',a.name);name.scope='row';name.append(meta(a));row.append(name);stages.forEach(([k])=>{const cell=el('td');cell.append(stageContent(a,k));row.append(cell);});body.append(row);});table.append(body);wrap.append(table);$('results').append(wrap);
  }else{
    const board=el('div',undefined,'board');board.tabIndex=0;board.setAttribute('role','region');board.setAttribute('aria-label','단계별 칸반 · 좌우로 스크롤');stages.forEach(([k,l])=>{const col=el('section',undefined,'column'),heading=el('h3',l);heading.append(el('span',`${apps.length}개`));col.append(heading);apps.forEach(a=>{const card=el('article',undefined,'card');card.append(el('h4',a.name),meta(a));const status=stageContent(a,k);status.className='status';card.append(status);col.append(card);});board.append(col);});$('results').append(board);
  }
}
['search','mission','platform','cycle'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',()=>data&&render()));
['table','board'].forEach(v=>$(v+'-button').addEventListener('click',()=>{view=v;if(data)render();}));
$('reset').addEventListener('click',()=>{$('search').value='';$('mission').value='all';$('platform').value='all';if(data)render();$('search').focus();});
try{const response=await fetch('./status.json',{cache:'no-store'});if(!response.ok)throw new Error();data=validate(await response.json());render();}catch{$('count').textContent='자료 확인 필요';$('results').append(el('div','진행현황 자료를 불러올 수 없습니다. 잠시 후 다시 확인해 주세요.','empty'));}
