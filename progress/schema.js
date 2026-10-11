export const missions = ['신규 시험앱','기존 시험앱 개선','Drawly/Joyo','반도체 앱','단어장 플랫폼','유료 Pro 파일럿'];
export const labels = {unknown:'미확인',pending:'미착수',progress:'진행 중',complete:'완료',blocked:'보류',na:'해당 없음',submitted:'제출 완료',reviewing:'심사 중',approved:'승인',rejected:'수정 필요',released:'출시됨'};
export function statusLabel(status,stage) {
  if (status==='pending' && stage==='submission') return '제출 전';
  if (status==='pending' && stage==='review') return '심사 대기';
  return labels[status];
}
const common = ['unknown','pending','progress','complete','blocked','na'];
const exact = (value,keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).sort().join('|') === [...keys].sort().join('|');
const statuses = (value,keys,allowed) => exact(value,keys) && keys.every(k => allowed.includes(value[k]));
export function validDate(value) {
  if (value === null) return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(+date) && date.toISOString().replace('.000Z','Z') === value && +date <= Date.now();
}
function cycle(c) {
  return exact(c,['planning','acquisition','validation','development','submission','review']) && ['planning','acquisition','validation'].every(k=>common.includes(c[k])) && exact(c.development,['shared','ios','android']) && ['shared','ios','android'].every(p=>statuses(c.development[p],['implementation','hostTest','deviceTest','signedBuild'],common)) && statuses(c.submission,['ios','android'],['unknown','pending','submitted','blocked','na']) && statuses(c.review,['ios','android'],['unknown','pending','reviewing','approved','rejected','released','na']);
}
export function validate(data) {
  if (!exact(data,['schemaVersion','apps']) || data.schemaVersion!==1 || !Array.isArray(data.apps) || data.apps.length>5000) throw new Error('invalid data');
  const names = new Set();
  for (const app of data.apps) {
    if (!exact(app,['name','mission','platforms','checkedAt','stageChangedAt','initial','update']) || typeof app.name !== 'string' || !app.name.trim() || app.name.length>160 || !/^[\p{L}\p{N}\p{Zs}().,+&!\-\/]+$/u.test(app.name) || /(?:https?|www\.|github|gitlab|token|secret|password|api.?key|\/Users\/|[a-f0-9]{40})/i.test(app.name) || names.has(app.name) || !missions.includes(app.mission) || !Array.isArray(app.platforms) || !app.platforms.length || new Set(app.platforms).size!==app.platforms.length || !app.platforms.every(p=>['ios','android'].includes(p)) || !validDate(app.checkedAt) || !validDate(app.stageChangedAt) || !cycle(app.initial) || !cycle(app.update)) throw new Error('invalid app');
    if (app.checkedAt === null && [app.initial,app.update].some(c=>JSON.stringify(c).match(/"(pending|progress|complete|blocked|submitted|reviewing|approved|rejected|released)"/))) throw new Error('verification date required');
    for (const c of [app.initial,app.update]) for (const p of ['ios','android']) if (!app.platforms.includes(p) && (c.submission[p]!=='na' || c.review[p]!=='na')) throw new Error('unsupported platform');
    if (app.stageChangedAt !== null && (app.checkedAt === null || app.stageChangedAt > app.checkedAt)) throw new Error('change date after verification');
    names.add(app.name);
  }
  return data;
}
