const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const load=()=>{try{return JSON.parse(localStorage.getItem('dayquest_v1'))||{expenses:[],quests:[],checks:{}}}catch{return{expenses:[],quests:[],checks:{}}}};
let db=load(),period='week',deferredInstall=null;
db.expenseNames=db.expenseNames||['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
db.units=db.units||['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];
const save=()=>{localStorage.setItem('dayquest_v1',JSON.stringify(db));render()};
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateObj=s=>new Date(s+'T12:00:00');
const fmt=s=>dateObj(s).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
const sum=arr=>arr.reduce((a,x)=>a+Number(x.amount),0);
const startWeek=d=>{let x=dateObj(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toISOString().slice(0,10)};
function dayQuests(d){return db.quests.filter(q=>q.repeat==='daily'||q.date===d)}
function completed(q,d){return !!(db.checks[d]||{})[q.id]}
function setTab(t){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===t));if(t==='reports')renderReport()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setTab(b.dataset.go));
$('todayDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
$('expenseDate').value=today();
function fillChoices(){
 $('expenseName').innerHTML=db.expenseNames.map(n=>`<option>${esc(n)}</option>`).join('');
 $('unitName').innerHTML=db.units.map(n=>`<option>${esc(n)}</option>`).join('');
}
function calcTotal(){let v=(Number($('quantity').value)||0)*(Number($('rate').value)||0);$('calculatedTotal').textContent=money(v)}
$('quantity').oninput=calcTotal;$('rate').oninput=calcTotal;
$('paymentType').onchange=()=>{let show=$('paymentType').value==='Due';$('dueFields').hidden=!show;$('duePerson').required=show};
$('addExpenseName').onclick=()=>{let n=prompt('Add an expense name:');if(n&&n.trim()){n=n.trim();if(!db.expenseNames.includes(n))db.expenseNames.push(n);fillChoices();$('expenseName').value=n;localSaveOnly()}};
$('addUnit').onclick=()=>{let n=prompt('Add a unit (e.g. bottle, sack, km):');if(n&&n.trim()){n=n.trim();if(!db.units.includes(n))db.units.push(n);fillChoices();$('unitName').value=n;localSaveOnly()}};
function localSaveOnly(){localStorage.setItem('dayquest_v1',JSON.stringify(db))}
$('expenseForm').onsubmit=e=>{e.preventDefault();let quantity=Number($('quantity').value),rate=Number($('rate').value),name=$('expenseName').value,unit=$('unitName').value,paymentType=$('paymentType').value;
 if(!(quantity>0)||!(rate>=0)){alert('Enter a valid quantity and rate.');return}
 if(paymentType==='Due'&&!$('duePerson').value.trim()){alert('Enter the person name for this due.');$('duePerson').focus();return}
 db.expenses.unshift({id:crypto.randomUUID(),amount:quantity*rate,name,quantity,unit,rate,paymentType,dueDirection:paymentType==='Due'?$('dueDirection').value:null,duePerson:paymentType==='Due'?$('duePerson').value.trim():null,category:$('category').value,date:$('expenseDate').value,note:$('note').value.trim()});
 e.target.reset();$('expenseDate').value=today();$('quantity').value=1;$('dueFields').hidden=true;$('duePerson').required=false;fillChoices();calcTotal();save()};
$('questForm').onsubmit=e=>{e.preventDefault();db.quests.push({id:crypto.randomUUID(),title:$('questTitle').value.trim(),repeat:$('questRepeat').value,date:today()});e.target.reset();save()};
function toggleQuest(id){db.checks[today()]??={};db.checks[today()][id]=!db.checks[today()][id];save()}
function delExpense(id){if(confirm('Delete this expense?')){db.expenses=db.expenses.filter(x=>x.id!==id);save()}}
function delQuest(id){if(confirm('Delete this quest?')){db.quests=db.quests.filter(x=>x.id!==id);Object.values(db.checks).forEach(v=>delete v[id]);save()}}
function empty(msg){return `<div class="empty">${msg}</div>`}
function render(){
 let d=today(),exToday=db.expenses.filter(x=>x.date===d),qToday=dayQuests(d),done=qToday.filter(q=>completed(q,d)).length;
 $('todayTotal').textContent=money(sum(exToday));$('questProgress').textContent=`${done}/${qToday.length}`;$('questBar').style.width=(qToday.length?done/qToday.length*100:0)+'%';$('todayQuestLabel').textContent=`${done} quests done`;
 let ws=startWeek(d),ms=d.slice(0,7);$('weekTotal').textContent=money(sum(db.expenses.filter(x=>x.date>=ws&&x.date<=d)));$('monthTotal').textContent=money(sum(db.expenses.filter(x=>x.date.startsWith(ms))));
 $('recentExpenses').innerHTML=expenseHTML([...db.expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('todayQuests').innerHTML=questHTML(qToday.slice(0,4),false);
 $('expenseCount').textContent=`${db.expenses.length} entries`;
 let filtered=db.expenses.filter(x=>( $('expenseFilter').value==='all'||x.category===$('expenseFilter').value)&&(`${x.note} ${x.category}`).toLowerCase().includes($('expenseSearch').value.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
 $('expenseList').innerHTML=expenseHTML(filtered,true);$('questList').innerHTML=questHTML(dayQuests(d),true);
 $('questSummary').textContent=`${done}/${qToday.length} completed`;
}
function expenseHTML(items,del){return items.length?items.map(x=>{let title=x.name||x.note||x.category,dueInfo=x.paymentType==='Due'?[x.dueDirection==='i_owe'?'I owe':x.dueDirection==='owed_to_me'?'Owed to me':'Old due',x.duePerson].filter(Boolean).join(' · '):'',details=[x.paymentType||'Cash',dueInfo,x.quantity?`${x.quantity} ${x.unit||''} × ${money(x.rate||0)}`:x.category,fmt(x.date),x.note].filter(Boolean).join(' · ');return `<div class="item"><div class="item-main"><div class="item-title">${esc(title)}</div><div class="item-sub">${esc(details)}</div></div><div class="item-amount">${money(x.amount)}</div>${del?`<button class="delete" onclick="delExpense('${x.id}')">×</button>`:''}</div>`}).join(''):empty('No expenses yet. Add your first one above.') }
function questHTML(items,del){return items.length?items.map(q=>`<div class="item ${completed(q,today())?'done':''}"><input class="check" type="checkbox" ${completed(q,today())?'checked':''} onchange="toggleQuest('${q.id}')"><div class="item-main"><div class="item-title">${esc(q.title)}</div><div class="item-sub">${q.repeat==='daily'?'Repeats daily':'Today only'}</div></div>${del?`<button class="delete" onclick="delQuest('${q.id}')">×</button>`:''}</div>`).join(''):empty('No quests for today. Add a small goal to get started.')}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('expenseSearch').oninput=render;$('expenseFilter').onchange=render;
document.querySelectorAll('.period').forEach(b=>b.onclick=()=>{period=b.dataset.period;document.querySelectorAll('.period').forEach(x=>x.classList.toggle('active',x===b));renderReport()});
function renderReport(){
 let now=dateObj(today()),start,end,labels=[],days=[];
 if(period==='week'){start=dateObj(startWeek(today()));end=now;for(let i=0;i<7;i++){let x=new Date(start);x.setDate(x.getDate()+i);let s=x.toISOString().slice(0,10);days.push(s);labels.push(x.toLocaleDateString(undefined,{weekday:'short'}))}}
 else{start=new Date(now.getFullYear(),now.getMonth(),1);end=now;let n=now.getDate();for(let i=1;i<=n;i++){let x=new Date(now.getFullYear(),now.getMonth(),i);days.push(x.toISOString().slice(0,10));labels.push(i%5===1||i===n?String(i):'')}}
 let a=start.toISOString().slice(0,10),b=end.toISOString().slice(0,10),items=db.expenses.filter(x=>x.date>=a&&x.date<=b),total=sum(items);
 $('reportLabel').textContent=period==='week'?'THIS WEEK':'THIS MONTH';$('reportTotal').textContent=money(total);$('reportRange').textContent=`${fmt(a)} – ${fmt(b)}`;
 let vals=days.map(d=>sum(items.filter(x=>x.date===d))),max=Math.max(...vals,1);
 $('reportBars').innerHTML=vals.map((v,i)=>`<div class="bar-wrap"><div class="bar" title="${money(v)}" style="height:${Math.max(v?3:1,v/max*82)}px"></div><span class="bar-label">${labels[i]}</span></div>`).join('');
 let cats={};items.forEach(x=>cats[x.category]=(cats[x.category]||0)+Number(x.amount));
 $('categoryBreakdown').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="breakrow"><span>${esc(k)}</span><strong>${money(v)}</strong></div>`).join('')||empty('No expenses in this period.');
 let all=0,done=0;days.forEach(d=>dayQuests(d).forEach(q=>{all++;if(completed(q,d))done++}));$('achievementRate').textContent=(all?Math.round(done/all*100):0)+'%';
 renderDueReport();
}
function renderDueReport(){
 let due=db.expenses.filter(x=>x.paymentType==='Due'),iOwe=due.filter(x=>x.dueDirection==='i_owe'),owed=due.filter(x=>x.dueDirection==='owed_to_me'),legacy=due.filter(x=>!['i_owe','owed_to_me'].includes(x.dueDirection));
 $('iOweTotal').textContent=money(sum(iOwe));$('owedToMeTotal').textContent=money(sum(owed));
 const grouped=items=>{let people={};items.forEach(x=>{let person=(x.duePerson||'Unknown person').trim()||'Unknown person';people[person]=(people[person]||0)+Number(x.amount||0)});return Object.entries(people).sort((a,b)=>b[1]-a[1]).map(([person,total])=>`<div class="breakrow"><span>${esc(person)}</span><strong>${money(total)}</strong></div>`).join('')||empty('No dues recorded here yet.')};
 $('iOweList').innerHTML=grouped(iOwe);$('owedToMeList').innerHTML=grouped(owed);
 $('unassignedDueHint').hidden=!legacy.length;$('unassignedDueHint').textContent=legacy.length?`${legacy.length} older Due ${legacy.length===1?'entry is':'entries are'} not assigned to either side. Edit them by adding a new correctly labelled Due entry; these older records are preserved and excluded from the two totals.`:'';
}
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dayquest-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.expenses)||!Array.isArray(x.quests)||typeof x.checks!=='object')throw Error();if(confirm('Replace current data with this backup?')){db=x;save();alert('Backup restored.')}}catch{alert('That backup file is not valid.')}e.target.value=''};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').hidden=false});
$('installBtn').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null;$('installBtn').hidden=true}};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
fillChoices();calcTotal();$('dueFields').hidden=true;render();