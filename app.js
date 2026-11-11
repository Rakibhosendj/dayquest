const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const load=()=>{try{return JSON.parse(localStorage.getItem('dayquest_v1'))||{expenses:[],quests:[],checks:{}}}catch{return{expenses:[],quests:[],checks:{}}}};
let db=load(),period='week',deferredInstall=null,editingExpenseId=null,editingIncomeId=null,collectingIncomeId=null,settlingExpenseId=null;
db.expenseNames=db.expenseNames||['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
db.units=db.units||['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];
db.incomes=Array.isArray(db.incomes)?db.incomes:[];
db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];
db.incomes.forEach(x=>{if(x.source&&!db.incomeHeads.includes(x.source))db.incomeHeads.push(x.source)});
db.profile=db.profile&&typeof db.profile==='object'?db.profile:{name:'',phone:'',openingCash:0,openingBank:0};
const save=()=>{localStorage.setItem('dayquest_v1',JSON.stringify(db));render();if($('reports')?.classList.contains('active'))renderReport()};
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateObj=s=>new Date(s+'T12:00:00');
const fmt=s=>dateObj(s).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
const sum=arr=>arr.reduce((a,x)=>a+Number(x.amount),0);
const expenseSettlements=x=>Array.isArray(x.settlements)?x.settlements:[];
const expenseSettledAmount=x=>x.paymentType==='Due'?sum(expenseSettlements(x)):0;
const expenseOutstanding=x=>x.paymentType==='Due'?Math.max(0,Number(x.amount||0)-expenseSettledAmount(x)):0;
const incomeCollections=x=>Array.isArray(x.collections)?x.collections:[];
const collectedAmount=x=>x.paymentType==='Due'?sum(incomeCollections(x)):0;
const incomeOutstanding=x=>x.paymentType==='Due'?Math.max(0,Number(x.amount||0)-collectedAmount(x)):0;
const incomeReceivedOn=(x,d)=>{let direct=x.paymentType!=='Due'&&x.date===d?Number(x.amount||0):0;let collections=incomeCollections(x).filter(c=>c.date===d).reduce((a,c)=>a+Number(c.amount||0),0);return direct+collections};
const incomeReceivedBetween=(a,b)=>db.incomes.reduce((t,x)=>t+incomeCollections(x).filter(c=>c.date>=a&&c.date<=b).reduce((v,c)=>v+Number(c.amount||0),0)+(x.paymentType!=='Due'&&x.date>=a&&x.date<=b?Number(x.amount||0):0),0);
function calculateBalances(){
 let cash=Number(db.profile?.openingCash||0),bank=Number(db.profile?.openingBank||0);
 const add=(method,amount)=>{if(method==='Bank')bank+=amount;else if(method==='Cash')cash+=amount};
 db.incomes.forEach(x=>{if(x.paymentType==='Due')incomeCollections(x).forEach(c=>add(c.method||'Cash',Number(c.amount||0)));else add(x.paymentType||'Cash',Number(x.amount||0))});
 db.expenses.forEach(x=>{
  if(x.paymentType==='Due'){
   if(x.dueDirection==='owed_to_me')add(x.duePaidFrom||'Cash',-Number(x.amount||0));
   expenseSettlements(x).forEach(t=>{if(x.dueDirection==='i_owe')add(t.method||'Cash',-Number(t.amount||0));else if(x.dueDirection==='owed_to_me')add(t.method||'Cash',Number(t.amount||0))});
  }else add(x.paymentType||'Cash',-Number(x.amount||0));
 });
 return {cash,bank,total:cash+bank};
}
function showBalances(){const b=calculateBalances();[['earnedBalance',b.total],['cashBalance',b.cash],['bankBalance',b.bank],['reportEarnedBalance',b.total],['reportCashBalance',b.cash],['reportBankBalance',b.bank],['profileEarnedBalance',b.total],['profileCashBalance',b.cash],['profileBankBalance',b.bank]].forEach(([id,v])=>{if($(id))$(id).textContent=money(v)});}
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
 const source=$('incomeSource'),sourceValue=source.value;
 source.innerHTML=db.incomeHeads.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
 if(db.incomeHeads.includes(sourceValue))source.value=sourceValue;
 [['incomeHeadFilter','All income heads'],['reportIncomeHeadFilter','All income heads']].forEach(([id,label])=>{
  const select=$(id);if(!select)return;const previous=select.value;
  select.innerHTML=`<option value="all">${label}</option>`+db.incomeHeads.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
  select.value=previous==='all'||db.incomeHeads.includes(previous)?previous:'all';
 });
}
function calcTotal(){let v=(Number($('quantity').value)||0)*(Number($('rate').value)||0);$('calculatedTotal').textContent=money(v)}
$('quantity').oninput=calcTotal;$('rate').oninput=calcTotal;
function updateExpenseDueFields(){let show=$('paymentType').value==='Due',owed=$('dueDirection').value==='owed_to_me';$('dueFields').hidden=!show;$('duePerson').required=show;$('duePaidFromField').hidden=!(show&&owed)}
$('paymentType').onchange=updateExpenseDueFields;$('dueDirection').onchange=updateExpenseDueFields;
$('incomePaymentType').onchange=()=>{let show=$('incomePaymentType').value==='Due';$('incomeDueFields').hidden=!show;$('incomeDuePerson').required=show};
$('incomeAmount').oninput=()=>{$('incomeTotalPreview').textContent=money(Number($('incomeAmount').value)||0)};
$('incomeDate').value=today();$('collectDate').value=today();$('expenseDueActionDate').value=today();
$('addExpenseName').onclick=()=>{let n=prompt('Add an expense name:');if(n&&n.trim()){n=n.trim();if(!db.expenseNames.includes(n))db.expenseNames.push(n);fillChoices();$('expenseName').value=n;localSaveOnly()}};
$('addUnit').onclick=()=>{let n=prompt('Add a unit (e.g. bottle, sack, km):');if(n&&n.trim()){n=n.trim();if(!db.units.includes(n))db.units.push(n);fillChoices();$('unitName').value=n;localSaveOnly()}};
$('addIncomeHead').onclick=()=>{let n=prompt('Add an income head (e.g. Salary, Shop, Rent, Freelance):');if(n&&n.trim()){n=n.trim();if(!db.incomeHeads.includes(n))db.incomeHeads.push(n);fillChoices();$('incomeSource').value=n;localSaveOnly()}};
function localSaveOnly(){localStorage.setItem('dayquest_v1',JSON.stringify(db))}
function resetExpenseForm(){
 editingExpenseId=null;$('expenseForm').reset();$('expenseDate').value=today();$('quantity').value=1;
 $('dueFields').hidden=true;$('duePaidFromField').hidden=true;$('duePerson').required=false;$('expenseFormTitle').textContent='Add expense';
 $('expenseSubmitBtn').textContent='Save expense';$('cancelExpenseEdit').hidden=true;$('expenseEditHint').hidden=true;
 fillChoices();calcTotal();
}
function ensureOption(select,value){
 if(value==null||value==='')return;
 const found=[...select.options].some(o=>o.value===String(value));
 if(!found){const option=document.createElement('option');option.value=String(value);option.textContent=String(value);select.appendChild(option)}
}
function editExpense(id){
 const x=db.expenses.find(item=>item.id===id);if(!x)return;
 editingExpenseId=id;
 if(x.name&&!db.expenseNames.includes(x.name))db.expenseNames.push(x.name);
 if(x.unit&&!db.units.includes(x.unit))db.units.push(x.unit);
 fillChoices();
 ensureOption($('category'),x.category||'Other');
 $('expenseName').value=x.name||db.expenseNames[0];$('paymentType').value=x.paymentType||'Cash';
 $('dueDirection').value=x.dueDirection||'i_owe';$('duePerson').value=x.duePerson||'';$('duePaidFrom').value=x.duePaidFrom||'Cash';
 updateExpenseDueFields();
 const quantity=Number(x.quantity)>0?Number(x.quantity):1;
 $('quantity').value=quantity;$('unitName').value=x.unit||db.units[0];
 $('rate').value=x.rate!=null?Number(x.rate):(Number(x.amount||0)/quantity);
 $('category').value=x.category||'Other';$('expenseDate').value=x.date||today();$('note').value=x.note||'';
 $('expenseFormTitle').textContent='Edit expense';$('expenseSubmitBtn').textContent='Update expense';
 $('cancelExpenseEdit').hidden=false;$('expenseEditHint').hidden=false;calcTotal();
 $('expenseForm').scrollIntoView({behavior:'smooth',block:'start'});
}
$('cancelExpenseEdit').onclick=resetExpenseForm;
$('expenseForm').onsubmit=e=>{e.preventDefault();let quantity=Number($('quantity').value),rate=Number($('rate').value),name=$('expenseName').value,unit=$('unitName').value,paymentType=$('paymentType').value;
 if(!(quantity>0)||!(rate>=0)||!Number.isFinite(quantity)||!Number.isFinite(rate)){alert('Enter a valid quantity and rate.');return}
 if(paymentType==='Due'&&!$('duePerson').value.trim()){alert('Enter the person name for this due.');$('duePerson').focus();return}
 const values={amount:quantity*rate,name,quantity,unit,rate,paymentType,dueDirection:paymentType==='Due'?$('dueDirection').value:null,duePerson:paymentType==='Due'?$('duePerson').value.trim():null,duePaidFrom:paymentType==='Due'&&$('dueDirection').value==='owed_to_me'?$('duePaidFrom').value:null,category:$('category').value,date:$('expenseDate').value,note:$('note').value.trim()};
 if(editingExpenseId){const existing=db.expenses.find(x=>x.id===editingExpenseId);if(existing){const settled=expenseSettledAmount(existing);if(settled>0&&(paymentType!=='Due'||quantity*rate<settled||$('dueDirection').value!==existing.dueDirection)){alert('This due already has payments or collections. Keep the Due type and direction, and set the amount to at least the amount already settled.');return}Object.assign(existing,values)}}
 else db.expenses.unshift({id:crypto.randomUUID(),...values});
 resetExpenseForm();save()};
function openExpenseDueAction(id){
 const x=db.expenses.find(item=>item.id===id);if(!x||expenseOutstanding(x)<=0)return;
 settlingExpenseId=id;const action=x.dueDirection==='i_owe'?'Pay due':'Collect due';
 $('expenseDueActionLabel').textContent=`${action}: ${x.duePerson||'Unknown person'} · ${x.name||x.category||'Expense'}`;
 $('expenseDueRemaining').textContent=`Remaining: ${money(expenseOutstanding(x))}`;$('expenseDueActionAmount').value=expenseOutstanding(x).toFixed(2);$('expenseDueActionAmount').max=expenseOutstanding(x).toFixed(2);
 $('expenseDueActionDate').value=today();$('expenseDueActionMethod').value='Cash';$('expenseDueActionNote').value='';$('expenseDueActionSubmit').textContent=action;
 $('expenseDueActionForm').hidden=false;$('expenseDueActionForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function closeExpenseDueAction(){settlingExpenseId=null;$('expenseDueActionForm').reset();$('expenseDueActionDate').value=today();$('expenseDueActionForm').hidden=true}
$('cancelExpenseDueAction').onclick=closeExpenseDueAction;
$('expenseDueActionForm').onsubmit=e=>{
 e.preventDefault();const x=db.expenses.find(item=>item.id===settlingExpenseId);if(!x)return closeExpenseDueAction();
 const amount=Number($('expenseDueActionAmount').value),remaining=expenseOutstanding(x);
 if(!(amount>0)||!Number.isFinite(amount)||amount>remaining+0.000001){alert(`Enter an amount greater than 0 and no more than ${money(remaining)}.`);return}
 x.settlements=expenseSettlements(x);x.settlements.push({id:crypto.randomUUID(),amount,date:$('expenseDueActionDate').value,method:$('expenseDueActionMethod').value,note:$('expenseDueActionNote').value.trim()});
 closeExpenseDueAction();save();
};

function resetIncomeForm(){
 editingIncomeId=null;$('incomeForm').reset();$('incomeDate').value=today();if($('incomeSource').options.length)$('incomeSource').selectedIndex=0;$('incomeDueFields').hidden=true;$('incomeDuePerson').required=false;
 $('incomeFormTitle').textContent='Add income';$('incomeSubmitBtn').textContent='Save income';$('cancelIncomeEdit').hidden=true;$('incomeEditHint').hidden=true;$('incomeTotalPreview').textContent=money(0);
}
function editIncome(id){
 const x=db.incomes.find(item=>item.id===id);if(!x)return;
 editingIncomeId=id;ensureOption($('incomeSource'),x.source||'Other');$('incomeSource').value=x.source||'Other';$('incomeAmount').value=Number(x.amount||0);$('incomePaymentType').value=x.paymentType||'Cash';
 $('incomeDuePerson').value=x.duePerson||'';$('incomeDueFields').hidden=$('incomePaymentType').value!=='Due';$('incomeDuePerson').required=$('incomePaymentType').value==='Due';
 $('incomeDate').value=x.date||today();$('incomeNote').value=x.note||'';$('incomeTotalPreview').textContent=money(x.amount||0);
 $('incomeFormTitle').textContent='Edit income';$('incomeSubmitBtn').textContent='Update income';$('cancelIncomeEdit').hidden=false;$('incomeEditHint').hidden=false;
 $('incomeForm').scrollIntoView({behavior:'smooth',block:'start'});
}
$('cancelIncomeEdit').onclick=resetIncomeForm;
$('incomeForm').onsubmit=e=>{
 e.preventDefault();const source=$('incomeSource').value.trim(),amount=Number($('incomeAmount').value),paymentType=$('incomePaymentType').value,duePerson=$('incomeDuePerson').value.trim();
 if(!source||!(amount>0)||!Number.isFinite(amount)){alert('Enter an income source and a valid amount.');return}
 if(paymentType==='Due'&&!duePerson){alert('Enter the customer or person who owes you.');$('incomeDuePerson').focus();return}
 const values={source,amount,paymentType,duePerson:paymentType==='Due'?duePerson:null,date:$('incomeDate').value,note:$('incomeNote').value.trim()};
 if(editingIncomeId){const existing=db.incomes.find(x=>x.id===editingIncomeId);if(existing){const hadCollections=incomeCollections(existing).length>0;if(hadCollections&&(values.paymentType!=='Due'||amount<collectedAmount(existing))){alert('This income already has collections. Keep it as Due and set the amount to at least the amount already collected.');return}Object.assign(existing,values);if(paymentType!=='Due')existing.collections=[]}}
 else db.incomes.unshift({id:crypto.randomUUID(),...values,collections:[]});
 resetIncomeForm();save();
};
function openCollectIncome(id){
 const x=db.incomes.find(item=>item.id===id);if(!x||incomeOutstanding(x)<=0)return;
 collectingIncomeId=id;$('collectIncomeLabel').textContent=`${x.source} · ${x.duePerson||'Customer'}`;$('collectDueRemaining').textContent=`Remaining: ${money(incomeOutstanding(x))}`;
 $('collectAmount').value=incomeOutstanding(x).toFixed(2);$('collectAmount').max=incomeOutstanding(x).toFixed(2);$('collectDate').value=today();$('collectMethod').value='Cash';$('collectNote').value='';$('incomeCollectForm').hidden=false;
 $('incomeCollectForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function closeCollectForm(){collectingIncomeId=null;$('incomeCollectForm').reset();$('collectDate').value=today();$('incomeCollectForm').hidden=true}
$('cancelCollect').onclick=closeCollectForm;
$('incomeCollectForm').onsubmit=e=>{
 e.preventDefault();const x=db.incomes.find(item=>item.id===collectingIncomeId);if(!x)return closeCollectForm();
 const amount=Number($('collectAmount').value),remaining=incomeOutstanding(x);
 if(!(amount>0)||!Number.isFinite(amount)||amount>remaining+0.000001){alert(`Enter an amount greater than 0 and no more than ${money(remaining)}.`);return}
 x.collections=incomeCollections(x);x.collections.push({id:crypto.randomUUID(),amount,date:$('collectDate').value,method:$('collectMethod').value,note:$('collectNote').value.trim()});
 closeCollectForm();save();
};
function deleteIncome(id){if(confirm('Delete this income entry and its collection history?')){if(collectingIncomeId===id)closeCollectForm();if(editingIncomeId===id)resetIncomeForm();db.incomes=db.incomes.filter(x=>x.id!==id);save()}}
$('incomeDateFilter').onchange=render;
$('incomeHeadFilter').onchange=render;
$('reportIncomeHeadFilter').onchange=renderReport;
$('clearIncomeDate').onclick=()=>{$('incomeDateFilter').value='';render()};
function loadProfileForm(){ $('profileName').value=db.profile.name||'';$('profilePhone').value=db.profile.phone||'';$('openingCash').value=Number(db.profile.openingCash||0);$('openingBank').value=Number(db.profile.openingBank||0)}
$('profileForm').onsubmit=e=>{e.preventDefault();const openingCash=Number($('openingCash').value),openingBank=Number($('openingBank').value);if(!Number.isFinite(openingCash)||openingCash<0||!Number.isFinite(openingBank)||openingBank<0){alert('Opening balances must be zero or greater.');return}db.profile={name:$('profileName').value.trim(),phone:$('profilePhone').value.trim(),openingCash,openingBank};save();alert('Profile and starting balances saved.')};

$('questForm').onsubmit=e=>{
 e.preventDefault();
 const title=$('questTitle').value.trim(),times=Math.max(1,Math.min(30,Math.floor(Number($('questTimes').value)||1))),eachTime=Number($('questEachTime').value);
 if(!title||!(eachTime>0)||!Number.isFinite(eachTime)){alert('Enter a quest name and a valid Each Time value greater than 0.');return}
 db.quests.push({id:crypto.randomUUID(),title,repeat:$('questRepeat').value,date:today(),times,eachTime});
 e.target.reset();$('questTitle').value='Namaz';$('questTimes').value=5;$('questEachTime').value=2;save()
};
function questCheckState(q,d){
 const count=Math.max(1,Math.min(30,Math.floor(Number(q.times)||1))),state=(db.checks[d]||{})[q.id];
 if(Array.isArray(state))return Array.from({length:count},(_,i)=>!!state[i]);
 return Array(count).fill(state===true);
}
function questCheckedCount(q,d){return questCheckState(q,d).filter(Boolean).length}
function questAchieved(q,d){return questCheckedCount(q,d)*Number(q.eachTime??1)}
function questTarget(q){return Math.max(1,Math.min(30,Math.floor(Number(q.times)||1)))*Number(q.eachTime??1)}
function numberText(n){return Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}
function completed(q,d){const state=questCheckState(q,d);return state.every(Boolean)}
function toggleQuest(id,index){
 const q=db.quests.find(x=>x.id===id);if(!q)return;
 db.checks[today()]??={};const state=questCheckState(q,today());
 if(index<0||index>=state.length)return;
 state[index]=!state[index];db.checks[today()][id]=state;save()
}
function delExpense(id){if(confirm('Delete this expense?')){if(editingExpenseId===id)resetExpenseForm();if(settlingExpenseId===id)closeExpenseDueAction();db.expenses=db.expenses.filter(x=>x.id!==id);save()}}
function delQuest(id){if(confirm('Delete this quest?')){db.quests=db.quests.filter(x=>x.id!==id);Object.values(db.checks).forEach(v=>delete v[id]);save()}}
function empty(msg){return `<div class="empty">${msg}</div>`}
function render(){
 let d=today(),exToday=db.expenses.filter(x=>x.date===d),qToday=dayQuests(d),done=qToday.filter(q=>completed(q,d)).length;
 $('todayTotal').textContent=money(sum(exToday));$('questProgress').textContent=`${done}/${qToday.length}`;$('questBar').style.width=(qToday.length?done/qToday.length*100:0)+'%';$('todayQuestLabel').textContent=`${done} quests done`;
 let ws=startWeek(d),ms=d.slice(0,7);$('weekTotal').textContent=money(sum(db.expenses.filter(x=>x.date>=ws&&x.date<=d)));$('monthTotal').textContent=money(sum(db.expenses.filter(x=>x.date.startsWith(ms))));
 $('todayIncome').textContent=money(db.incomes.reduce((t,x)=>t+incomeReceivedOn(x,d),0));$('monthIncome').textContent=money(incomeReceivedBetween(ms+'-01',d));showBalances();
 $('recentExpenses').innerHTML=expenseHTML([...db.expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('recentIncome').innerHTML=incomeHTML([...db.incomes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('todayQuests').innerHTML=questHTML(qToday.slice(0,4),false);
 $('expenseCount').textContent=`${db.expenses.length} entries`;
 let filtered=db.expenses.filter(x=>( $('expenseFilter').value==='all'||x.category===$('expenseFilter').value)&&(`${x.note} ${x.category}`).toLowerCase().includes($('expenseSearch').value.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
 $('expenseList').innerHTML=expenseHTML(filtered,true);$('questList').innerHTML=questHTML(dayQuests(d),true);
 $('questSummary').textContent=`${done}/${qToday.length} completed`;$('incomeCount').textContent=`${db.incomes.length} entries`;
 const incomeFilter=$('incomeDateFilter').value,incomeHead=$('incomeHeadFilter').value;const incomes=[...db.incomes].filter(x=>(!incomeFilter||x.date===incomeFilter)&&(incomeHead==='all'||(x.source||'Other')===incomeHead)).sort((a,b)=>b.date.localeCompare(a.date));$('incomeList').innerHTML=incomeHTML(incomes,true);
}
function expenseHTML(items,actions){return items.length?items.map(x=>{let title=x.name||x.note||x.category,settled=expenseSettledAmount(x),remaining=expenseOutstanding(x),direction=x.dueDirection==='i_owe'?'I owe':x.dueDirection==='owed_to_me'?'Owed to me':'Old due',dueInfo=x.paymentType==='Due'?[direction,x.duePerson,`Settled ${money(settled)} · Remaining ${money(remaining)}`].filter(Boolean).join(' · '):'',details=[x.paymentType||'Cash',dueInfo,x.quantity?`${x.quantity} ${x.unit||''} × ${money(x.rate||0)}`:x.category,fmt(x.date),x.note].filter(Boolean).join(' · ');let actionLabel=x.dueDirection==='i_owe'?'Pay due':'Collect';return `<div class="item expense-item"><div class="item-main"><div class="item-title">${esc(title)}</div><div class="item-sub">${esc(details)}</div></div><div class="expense-right"><div class="item-amount">${money(x.amount)}</div>${actions?`<div class="item-actions">${x.paymentType==='Due'&&remaining>0&&['i_owe','owed_to_me'].includes(x.dueDirection)?`<button class="collect-btn" onclick="openExpenseDueAction('${x.id}')">${actionLabel}</button>`:''}<button class="edit-btn" onclick="editExpense('${x.id}')" aria-label="Edit ${esc(title)}">Edit</button><button class="delete" onclick="delExpense('${x.id}')" aria-label="Delete ${esc(title)}">×</button></div>`:''}</div></div>`}).join(''):empty('No expenses yet. Add your first one above.') }
function incomeHTML(items,actions){
 if(!items.length)return empty('No income entries for this date. Add your first income above.');
 const groups={};items.forEach(x=>(groups[x.date||'Undated']??=[]).push(x));
 return Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(d=>{
  const rows=groups[d],dayTotal=sum(rows);
  const cards=rows.map(x=>{
   const collected=collectedAmount(x),remaining=incomeOutstanding(x),status=x.paymentType==='Due'?(remaining<=0.000001?'Fully collected':collected>0?'Partially collected':'Due'):x.paymentType||'Cash';
   const details=[x.paymentType||'Cash',x.duePerson?`From ${x.duePerson}`:'',x.note||'',x.paymentType==='Due'?`Collected ${money(collected)} · Due ${money(remaining)}`:''].filter(Boolean).join(' · ');
   const collectionHistory=incomeCollections(x).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(c=>`${fmt(c.date)}: ${money(c.amount)} (${c.method||'Cash'})`).join(' | ');
   return `<div class="item income-item"><div class="item-main"><div class="item-title">${esc(x.source||'Income')}</div><div class="item-sub">${esc(details||status)}${collectionHistory?`<br>Collections: ${esc(collectionHistory)}`:''}</div><span class="income-status ${remaining>0?'is-due':'is-paid'}">${esc(status)}</span></div><div class="income-right"><div class="item-amount">${money(x.amount)}</div>${actions?`<div class="item-actions">${remaining>0?`<button class="collect-btn" onclick="openCollectIncome('${x.id}')">Collect</button>`:''}<button class="edit-btn" onclick="editIncome('${x.id}')">Edit</button><button class="delete" onclick="deleteIncome('${x.id}')" aria-label="Delete ${esc(x.source||'income')}">×</button></div>`:''}</div></div>`;
  }).join('');
  return `<div class="income-date-group"><div class="income-date-head"><strong>${d==='Undated'?'Undated':fmt(d)}</strong><span>${rows.length} ${rows.length===1?'entry':'entries'} · ${money(dayTotal)}</span></div>${cards}</div>`;
 }).join('');
}

function questHTML(items,del){return items.length?items.map(q=>{
 const d=today(),state=questCheckState(q,d),checked=state.filter(Boolean).length,achieved=questAchieved(q,d),target=questTarget(q);
 return `<div class="quest-item ${completed(q,d)?'done':''}">
  <div class="quest-item-head"><div class="item-main"><div class="item-title">${esc(q.title)}</div><div class="item-sub">${q.repeat==='daily'?'Repeats daily':'Today only'} · Each Time: ${numberText(Number(q.eachTime??1))}</div></div>
   <div class="quest-score"><strong>Total achieved: ${numberText(achieved)} / ${numberText(target)}</strong><span>${checked} / ${state.length} times checked</span></div>
   ${del?`<button class="delete" onclick="delQuest('${q.id}')" aria-label="Delete ${esc(q.title)}">×</button>`:''}
  </div>
  <div class="quest-checks">${state.map((isChecked,i)=>`<label class="quest-check"><input class="check" type="checkbox" ${isChecked?'checked':''} aria-label="${esc(q.title)} time ${i+1}" onchange="toggleQuest('${q.id}',${i})"><span>Time ${i+1}</span></label>`).join('')}</div>
 </div>`
 }).join(''):empty('No quests for today. Add a small goal to get started.')}

function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('expenseSearch').oninput=render;$('expenseFilter').onchange=render;
document.querySelectorAll('.period').forEach(b=>b.onclick=()=>{period=b.dataset.period;document.querySelectorAll('.period').forEach(x=>x.classList.toggle('active',x===b));renderReport()});
function renderReport(){
 let now=dateObj(today()),start,end,labels=[],days=[];
 if(period==='week'){start=dateObj(startWeek(today()));end=now;for(let i=0;i<7;i++){let x=new Date(start);x.setDate(x.getDate()+i);let s=x.toISOString().slice(0,10);days.push(s);labels.push(x.toLocaleDateString(undefined,{weekday:'short'}))}}
 else{start=new Date(now.getFullYear(),now.getMonth(),1);end=now;let n=now.getDate();for(let i=1;i<=n;i++){let x=new Date(now.getFullYear(),now.getMonth(),i);days.push(x.toISOString().slice(0,10));labels.push(i%5===1||i===n?String(i):'')}}
 let a=start.toISOString().slice(0,10),b=end.toISOString().slice(0,10),items=db.expenses.filter(x=>x.date>=a&&x.date<=b),total=sum(items);
 $('reportLabel').textContent=period==='week'?'THIS WEEK':'THIS MONTH';$('reportTotal').textContent=money(total);$('reportRange').textContent=`${fmt(a)} – ${fmt(b)}`;
 const selectedIncomeHead=$('reportIncomeHeadFilter').value;
 const incomeInScope=db.incomes.filter(x=>selectedIncomeHead==='all'||(x.source||'Other')===selectedIncomeHead);
 const incomeEntriesInPeriod=incomeInScope.filter(x=>x.date>=a&&x.date<=b);
 const receivedInPeriod=incomeInScope.reduce((total,x)=>total+(x.paymentType==='Due'?incomeCollections(x).filter(c=>c.date>=a&&c.date<=b).reduce((t,c)=>t+Number(c.amount||0),0):(x.date>=a&&x.date<=b?Number(x.amount||0):0)),0);
 $('reportIncomeTotal').textContent=money(sum(incomeEntriesInPeriod));$('reportIncomeCollected').textContent=money(receivedInPeriod);
 const headsToShow=selectedIncomeHead==='all'?db.incomeHeads:[selectedIncomeHead];
 $('incomeHeadBreakdown').innerHTML=headsToShow.map(head=>{
  const headEntries=db.incomes.filter(x=>(x.source||'Other')===head),recorded=sum(headEntries.filter(x=>x.date>=a&&x.date<=b));
  const received=headEntries.reduce((total,x)=>total+(x.paymentType==='Due'?incomeCollections(x).filter(c=>c.date>=a&&c.date<=b).reduce((t,c)=>t+Number(c.amount||0),0):(x.date>=a&&x.date<=b?Number(x.amount||0):0)),0);
  if(!recorded&&!received)return '';
  return `<div class="income-report-row"><div><strong>${esc(head)}</strong><small>Recorded: ${money(recorded)}</small></div><strong>${money(received)}<small> received</small></strong></div>`;
 }).filter(Boolean).join('')||empty('No income for this head in the selected period.');showBalances();
 let vals=days.map(d=>sum(items.filter(x=>x.date===d))),max=Math.max(...vals,1);
 $('reportBars').innerHTML=vals.map((v,i)=>`<div class="bar-wrap"><div class="bar" title="${money(v)}" style="height:${Math.max(v?3:1,v/max*82)}px"></div><span class="bar-label">${labels[i]}</span></div>`).join('');
 let cats={};items.forEach(x=>cats[x.category]=(cats[x.category]||0)+Number(x.amount));
 $('categoryBreakdown').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="breakrow"><span>${esc(k)}</span><strong>${money(v)}</strong></div>`).join('')||empty('No expenses in this period.');
 let all=0,done=0;days.forEach(d=>dayQuests(d).forEach(q=>{const state=questCheckState(q,d);all+=state.length;done+=state.filter(Boolean).length}));$('achievementRate').textContent=(all?Math.round(done/all*100):0)+'%';
 renderDueReport();
}
function renderDueReport(){
 let due=db.expenses.filter(x=>x.paymentType==='Due'),iOwe=due.filter(x=>x.dueDirection==='i_owe'&&expenseOutstanding(x)>0),owedExpenses=due.filter(x=>x.dueDirection==='owed_to_me'&&expenseOutstanding(x)>0),incomeDue=db.incomes.filter(x=>x.paymentType==='Due'&&incomeOutstanding(x)>0),legacy=due.filter(x=>!['i_owe','owed_to_me'].includes(x.dueDirection));
 const iOweTotal=iOwe.reduce((t,x)=>t+expenseOutstanding(x),0),owedExpenseTotal=owedExpenses.reduce((t,x)=>t+expenseOutstanding(x),0),incomeDueTotal=incomeDue.reduce((t,x)=>t+incomeOutstanding(x),0);
 $('iOweTotal').textContent=money(iOweTotal);$('owedToMeTotal').textContent=money(owedExpenseTotal+incomeDueTotal);
 const grouped=(expenseItems,incomeItems=[])=>{let people={};expenseItems.forEach(x=>{let person=(x.duePerson||'Unknown person').trim()||'Unknown person';people[person]=(people[person]||0)+expenseOutstanding(x)});incomeItems.forEach(x=>{let person=(x.duePerson||'Unknown person').trim()||'Unknown person';people[person]=(people[person]||0)+incomeOutstanding(x)});return Object.entries(people).sort((a,b)=>b[1]-a[1]).map(([person,total])=>`<div class="breakrow"><span>${esc(person)}</span><strong>${money(total)}</strong></div>`).join('')||empty('No dues recorded here yet.')};
 $('iOweList').innerHTML=grouped(iOwe);$('owedToMeList').innerHTML=grouped(owedExpenses,incomeDue);
 $('incomeDueList').innerHTML=incomeDue.length?incomeDue.map(x=>`<div class="breakrow"><span>${esc(x.source)} · ${esc(x.duePerson||'Unknown person')}</span><strong>${money(incomeOutstanding(x))}</strong></div>`).join(''):empty('No outstanding income dues.');
 $('unassignedDueHint').hidden=!legacy.length;$('unassignedDueHint').textContent=legacy.length?`${legacy.length} older Due ${legacy.length===1?'entry is':'entries are'} not assigned to either side. These older records are preserved and excluded from the two totals.`:'';
}
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dayquest-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.expenses)||!Array.isArray(x.quests)||typeof x.checks!=='object')throw Error();if(!Array.isArray(x.incomes))x.incomes=[];if(!Array.isArray(x.incomeHeads))x.incomeHeads=['Salary','Business','Sales','Freelance','Rent','Gift','Other'];if(!x.profile||typeof x.profile!=='object')x.profile={name:'',phone:'',openingCash:0,openingBank:0};if(confirm('Replace current data with this backup?')){db=x;db.incomes=Array.isArray(db.incomes)?db.incomes:[];db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];db.profile=db.profile||{name:'',phone:'',openingCash:0,openingBank:0};fillChoices();loadProfileForm();save();alert('Backup restored.')}}catch{alert('That backup file is not valid.')}e.target.value=''};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installBtn').hidden=false});
$('installBtn').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null;$('installBtn').hidden=true}};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
// Simple local login for the static GitHub Pages app. This is a device-level screen,
// not server-side authentication; finance data remains in the existing local database.
const AUTH_KEY='dayquest_auth_v1',SESSION_KEY='dayquest_session_v1';
const bytesToBase64=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
const base64ToBytes=value=>Uint8Array.from(atob(value),c=>c.charCodeAt(0));
async function passwordDigest(password,salt){
 if(!window.crypto?.subtle)throw new Error('Secure password storage is unavailable. Open DayQuest using its HTTPS GitHub Pages address.');
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},material,256);
 return bytesToBase64(bits);
}
function showAuthView(view,message=''){
 $('authScreen').hidden=false;$('appShell').hidden=true;
 $('authSetupView').hidden=view!=='setup';$('authLoginView').hidden=view!=='login';$('authMessage').textContent=message;
}
function startAppSession(username){
 sessionStorage.setItem(SESSION_KEY,'active');$('authScreen').hidden=true;$('appShell').hidden=false;
 $('userGreeting').textContent=`Signed in: ${username}`;$('authMessage').textContent='';
}
async function initAuth(){
 let saved=null;try{saved=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{}
 if(saved&&sessionStorage.getItem(SESSION_KEY)==='active'){startAppSession(saved.username||'User');return}
 if(saved){$('loginUsername').value=saved.username||'';showAuthView('login')}else showAuthView('setup');
}
$('authSetupForm').onsubmit=async e=>{
 e.preventDefault();const username=$('setupUsername').value.trim(),password=$('setupPassword').value,confirmPassword=$('setupPasswordConfirm').value;
 if(!username){$('authMessage').textContent='Please choose a username.';return}
 if(password.length<8){$('authMessage').textContent='Use a password with at least 8 characters.';return}
 if(password!==confirmPassword){$('authMessage').textContent='The passwords do not match.';return}
 const submit=$('authSetupForm').querySelector('button');if(submit)submit.disabled=true;
 try{const salt=crypto.getRandomValues(new Uint8Array(16));const hash=await passwordDigest(password,salt);const record={username,salt:bytesToBase64(salt),hash};localStorage.setItem(AUTH_KEY,JSON.stringify(record));$('setupPassword').value='';$('setupPasswordConfirm').value='';startAppSession(username)}
 catch(err){$('authMessage').textContent=err.message||'Could not create the login on this browser.'}
 finally{if(submit)submit.disabled=false}
};
$('authLoginForm').onsubmit=async e=>{
 e.preventDefault();const username=$('loginUsername').value.trim(),password=$('loginPassword').value;
 let saved=null;try{saved=JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{}
 if(!saved){showAuthView('setup','Create a login to protect this browser session.');return}
 const submit=$('authLoginForm').querySelector('button');if(submit)submit.disabled=true;
 try{const hash=await passwordDigest(password,base64ToBytes(saved.salt));if(username.toLowerCase()!==String(saved.username||'').toLowerCase()||hash!==saved.hash){$('authMessage').textContent='Incorrect username or password.';return}$('loginPassword').value='';startAppSession(saved.username||username)}
 catch(err){$('authMessage').textContent=err.message||'Unable to verify the password.'}
 finally{if(submit)submit.disabled=false}
};
$('logoutBtn').onclick=()=>{sessionStorage.removeItem(SESSION_KEY);$('loginPassword').value='';const saved=JSON.parse(localStorage.getItem(AUTH_KEY)||'null');$('loginUsername').value=saved?.username||'';showAuthView('login','You have been logged out.')};
$('resetLocalLogin').onclick=()=>{if(confirm('Reset the login for this browser? Your DayQuest expenses, income and quests will not be deleted.')){localStorage.removeItem(AUTH_KEY);sessionStorage.removeItem(SESSION_KEY);$('loginPassword').value='';$('setupUsername').value='';$('setupPassword').value='';$('setupPasswordConfirm').value='';showAuthView('setup','Create a new local login. Your saved DayQuest records are kept.')}};
fillChoices();loadProfileForm();calcTotal();$('dueFields').hidden=true;$('duePaidFromField').hidden=true;$('incomeDueFields').hidden=true;$('expenseDueActionForm').hidden=true;$('incomeCollectForm').hidden=true;$('incomeTotalPreview').textContent=money(0);render();initAuth();
