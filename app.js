const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const load=()=>{try{return JSON.parse(localStorage.getItem('dayquest_v1'))||{expenses:[],quests:[],checks:{}}}catch{return{expenses:[],quests:[],checks:{}}}};
let db=load(),deferredInstall=null,editingExpenseId=null,editingIncomeId=null,collectingIncomeId=null,settlingExpenseId=null,activeSupplierName=null,payingSupplierName=null,purchaseLines=[],editingPurchaseBillId=null,purchaseBillOriginalDate='',salesMemoLines=[],editingSalesMemoId=null;
db.expenses=Array.isArray(db.expenses)?db.expenses:[];
db.expenses.forEach(x=>{if(!['family','member','unassigned','members'].includes(x.costType))x.costType=x.costMember?'member':'unassigned';x.costMember=String(x.costMember||'').trim();if(x.costType==='member'&&!x.costMember)x.costType='unassigned'});
db.expenseNames=db.expenseNames||['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];
db.productTypes=Array.isArray(db.productTypes)&&db.productTypes.length?db.productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];
db.productTypes=[...new Map(db.productTypes.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);
db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.themeColor||'')))db.settings.themeColor='#263b5c';
db.units=db.units||['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];
db.incomes=Array.isArray(db.incomes)?db.incomes:[];
db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];
db.incomes.forEach(x=>{if(x.source&&!db.incomeHeads.includes(x.source))db.incomeHeads.push(x.source)});
db.profile=db.profile&&typeof db.profile==='object'?db.profile:{name:'',phone:'',openingCash:0,openingBank:0};
db.profile.familyName=String(db.profile.familyName||'');
db.profile.photoData=typeof db.profile.photoData==='string'&&db.profile.photoData.startsWith('data:image/')?db.profile.photoData:'';
db.familyMembers=Array.isArray(db.familyMembers)?db.familyMembers.map(n=>String(n||'').trim()).filter(Boolean):[];
db.familyMembers=[...new Map(db.familyMembers.map(n=>[n.toLocaleLowerCase(),n])).values()];
db.guestPeople=Array.isArray(db.guestPeople)?db.guestPeople.map(n=>String(n||'').trim()).filter(Boolean):[];
db.guestPeople=[...new Map(db.guestPeople.map(n=>[n.toLocaleLowerCase(),n])).values()];
db.guests=Array.isArray(db.guests)?db.guests.filter(g=>g&&Array.isArray(g.members)&&g.members.length&&/^\d{4}-\d{2}-\d{2}$/.test(String(g.entryDate||''))):[];
db.guests.forEach(g=>{g.id=g.id||crypto.randomUUID();g.members=uniquePeople(g.members);g.outDate=String(g.outDate||'');if(g.outDate&&g.outDate<g.entryDate)g.outDate='';g.purpose=String(g.purpose||'');g.members.forEach(n=>{if(!db.guestPeople.some(x=>x.toLocaleLowerCase()===n.toLocaleLowerCase())&&!db.familyMembers.some(x=>x.toLocaleLowerCase()===n.toLocaleLowerCase()))db.guestPeople.push(n)})});
function uniquePeople(names){return [...new Map((names||[]).map(n=>String(n||'').trim()).filter(Boolean).map(n=>[n.toLocaleLowerCase(),n])).values()]}
function assignablePeople(){return uniquePeople([...db.familyMembers,...db.guestPeople])}
function assignedMembers(item){
 if(Array.isArray(item?.costMembers))return uniquePeople(item.costMembers);
 if(item?.costType==='family')return db.familyMembers.slice();
 if(item?.costType==='member'&&String(item.costMember||'').trim())return [String(item.costMember).trim()];
 return [];
}
function setAssignedMembers(item,names){
 const clean=uniquePeople(names);item.costMembers=clean;item.costType=clean.length?'members':'unassigned';item.costMember=clean.length===1?clean[0]:'';
}
function normalizeMemberAssignments(){
 db.expenses.forEach(x=>{if(!Array.isArray(x.costMembers))setAssignedMembers(x,assignedMembers(x));else setAssignedMembers(x,x.costMembers)});
 db.purchaseBills.forEach(b=>(b.lines||[]).forEach(l=>{if(!Array.isArray(l.costMembers))setAssignedMembers(l,assignedMembers(l));else setAssignedMembers(l,l.costMembers)}));
}
db.incomePeople=Array.isArray(db.incomePeople)?db.incomePeople:[];
db.purchaseBills=Array.isArray(db.purchaseBills)?db.purchaseBills:[];
// Purchase bill numbers use MM-YYYY-N and remain unique across the entire bill register.
function purchaseBillPrefix(date){
 const match=/^(\d{4})-(\d{2})-\d{2}$/.exec(String(date||''));
 if(!match)return purchaseBillPrefix(today());
 return `${match[2]}-${match[1]}`;
}
function nextPurchaseBillNo(date,excludingId=null,reserved=new Set()){
 const prefix=purchaseBillPrefix(date),used=new Set([...reserved].map(value=>String(value||'').trim().toLocaleLowerCase()));
 let highest=0;
 db.purchaseBills.forEach(b=>{
  if(excludingId&&b.id===excludingId)return;
  const value=String(b.billNo||'').trim();if(!value)return;
  used.add(value.toLocaleLowerCase());
  const match=new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}-(\\d+)$`,'i').exec(value);
  if(match)highest=Math.max(highest,Number(match[1])||0);
 });
 let sequence=highest+1,candidate=`${prefix}-${sequence}`;
 while(used.has(candidate.toLocaleLowerCase())){sequence++;candidate=`${prefix}-${sequence}`}
 return candidate;
}
function normalizePurchaseBillNumbers(){
 let changed=false;const used=new Set();
 const ordered=db.purchaseBills.slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.id||'').localeCompare(String(b.id||'')));
 ordered.forEach(b=>{
  const existing=String(b.billNo||'').trim(),key=existing.toLocaleLowerCase();
  if(existing&&!used.has(key)){if(b.billNo!==existing){b.billNo=existing;changed=true}used.add(key);return}
  b.billNo=nextPurchaseBillNo(b.date,null,used);used.add(b.billNo.toLocaleLowerCase());changed=true;
 });
 return changed;
}
const purchaseBillNumbersMigrated=normalizePurchaseBillNumbers();
if(purchaseBillNumbersMigrated)localStorage.setItem('dayquest_v1',JSON.stringify(db));
db.supplierPayments=Array.isArray(db.supplierPayments)?db.supplierPayments:[];
db.suppliers=Array.isArray(db.suppliers)?[...new Set(db.suppliers)]:[];
db.productNames=Array.isArray(db.productNames)?db.productNames:[];
db.productNames=[...new Map(db.productNames.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);
db.consumptions=Array.isArray(db.consumptions)?db.consumptions:[];
db.productions=Array.isArray(db.productions)?db.productions:[];
function normalizePurchaseInventory(){
 db.purchaseBills.forEach(b=>{
  if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);
  (b.lines||[]).forEach(l=>{
   if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product);
   l.productType=String(l.productType||'Other').trim()||'Other';
   if(!db.productTypes.some(name=>name.toLocaleLowerCase()===l.productType.toLocaleLowerCase()))db.productTypes.push(l.productType);
   if(!l.id)l.id=crypto.randomUUID();
   if(!['family','member','unassigned','members'].includes(l.costType))l.costType='unassigned';
   l.costMember=String(l.costMember||'').trim();
   if(l.costType==='member'&&!l.costMember)l.costType='unassigned';
  });
 });
 db.consumptions=db.consumptions.filter(x=>x&&x.billId&&x.lineId&&Number(x.quantity)>0);
}
normalizePurchaseInventory();
db.supplierPayments.forEach(p=>{if(p.supplier&&!db.suppliers.includes(p.supplier))db.suppliers.push(p.supplier)});
if(db.profile.name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===db.profile.name.toLocaleLowerCase()))db.familyMembers.unshift(db.profile.name);
normalizeMemberAssignments();
db.familyMembers.forEach(name=>{if(!db.incomePeople.includes(name))db.incomePeople.push(name)});
if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);
db.incomes.forEach(x=>{x.incomeBy=String(x.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(x.incomeBy))db.incomePeople.push(x.incomeBy)});
if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');
const save=()=>{localStorage.setItem('dayquest_v1',JSON.stringify(db));updateAppBrand();render();if($('reports')?.classList.contains('active'))renderReport()};
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
const expenseOutstandingAt=(x,asOf)=>x.paymentType==='Due'?Math.max(0,Number(x.amount||0)-expenseSettlements(x).filter(s=>!s.date||String(s.date)<=asOf).reduce((t,s)=>t+Number(s.amount||0),0)):0;
const incomeOutstandingAt=(x,asOf)=>x.paymentType==='Due'?Math.max(0,Number(x.amount||0)-incomeCollections(x).filter(c=>!c.date||String(c.date)<=asOf).reduce((t,c)=>t+Number(c.amount||0),0)):0;
const incomeReceivedOn=(x,d)=>{let direct=x.paymentType!=='Due'&&x.date===d?Number(x.amount||0):0;let collections=incomeCollections(x).filter(c=>c.date===d).reduce((a,c)=>a+Number(c.amount||0),0);return direct+collections};
const incomeReceivedBetween=(a,b)=>db.incomes.reduce((t,x)=>t+incomeCollections(x).filter(c=>c.date>=a&&c.date<=b).reduce((v,c)=>v+Number(c.amount||0),0)+(x.paymentType!=='Due'&&x.date>=a&&x.date<=b?Number(x.amount||0):0),0);
const billCredit=b=>Math.max(0,Number(b.credit??(billTotal(b)-Number(b.cashPaid||0)-Number(b.bankPaid||0))));
const supplierOutstanding=name=>supplierBillBalances(name).reduce((t,row)=>t+row.remaining,0);
function purchaseLineBaseAmount(line){return Math.max(0,Number(line.amount??(Number(line.quantity||0)*Number(line.rate||0)))||0)}
function billLineSubtotal(bill){return (bill.lines||[]).reduce((total,line)=>total+purchaseLineBaseAmount(line),0)}
function billTotal(bill){
 const calculated=Math.max(0,billLineSubtotal(bill)+Number(bill.transitCost||0)-Number(bill.discount||0));
 const stored=Number(bill.total);
 // Older imported bills can contain a zero placeholder even when their line values are present.
 if(bill.total!==undefined&&bill.total!==null&&Number.isFinite(stored)&&(stored>0||calculated===0))return Math.max(0,stored);
 return calculated;
}
function purchaseBillLineCosts(bill){
 const lines=bill.lines||[],subtotal=billLineSubtotal(bill),total=billTotal(bill),weights=lines.map(line=>purchaseLineBaseAmount(line));
 const weightTotal=weights.reduce((a,b)=>a+b,0),fallback=weightTotal>0?weights:lines.map(line=>Math.max(0,Number(line.quantity||0)));
 const denominator=fallback.reduce((a,b)=>a+b,0);let allocated=0;const map=new Map();
 lines.forEach((line,index)=>{
  let amount=0;
  if(index===lines.length-1)amount=roundPurchaseAmount(total-allocated);
  else if(denominator>0)amount=roundPurchaseAmount(total*fallback[index]/denominator);
  allocated+=amount;map.set(line.id||String(index),Math.max(0,amount));
 });
 return map;
}
function purchaseLineCost(bill,line){const index=(bill.lines||[]).indexOf(line);return purchaseBillLineCosts(bill).get(line.id||String(index))??purchaseLineBaseAmount(line)}
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
 // Purchase bills reduce only the portions actually paid from cash or bank.
 db.purchaseBills.forEach(b=>{add('Cash',-Number(b.cashPaid||0));add('Bank',-Number(b.bankPaid||0))});
 // Supplier credit reduces balances only when a later payment is recorded.
 db.supplierPayments.forEach(p=>add(p.method||'Cash',-Number(p.amount||0)));
 return {cash,bank,total:cash+bank};
}
function showBalances(){const b=calculateBalances();[['earnedBalance',b.total],['cashBalance',b.cash],['bankBalance',b.bank],['reportEarnedBalance',b.total],['reportCashBalance',b.cash],['reportBankBalance',b.bank],['profileEarnedBalance',b.total],['profileCashBalance',b.cash],['profileBankBalance',b.bank]].forEach(([id,v])=>{if($(id))$(id).textContent=money(v)});}
const startWeek=d=>{let x=dateObj(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toISOString().slice(0,10)};
function dayQuests(d){return db.quests.filter(q=>q.repeat==='daily'||q.date===d)}
function completed(q,d){return !!(db.checks[d]||{})[q.id]}
const SIDEBAR_PREF_KEY='dayquest_sidebar_hidden_v1';
if(localStorage.getItem(SIDEBAR_PREF_KEY)==='1')$('appLayout')?.classList.add('sidebar-collapsed');
function syncMenuToggle(){
 const side=$('sidebar'),toggle=$('menuToggle');if(!side||!toggle)return;
 if(window.innerWidth>=760){
  const hidden=$('appLayout')?.classList.contains('sidebar-collapsed');
  toggle.setAttribute('aria-label',hidden?'Show side menu':'Hide side menu');
  toggle.setAttribute('title',hidden?'Show side menu':'Hide side menu');
  toggle.setAttribute('aria-expanded',String(!hidden));
 }else{
  const open=side.classList.contains('open');
  toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  toggle.setAttribute('title',open?'Close navigation':'Open navigation');
  toggle.setAttribute('aria-expanded',String(open));
 }
}
function closeSidebar(){const side=$('sidebar'),backdrop=$('sidebarBackdrop');side?.classList.remove('open');backdrop?.setAttribute('hidden','');syncMenuToggle()}
function setTab(t){
 const tabs=[...document.querySelectorAll('.tab')];
 tabs.forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===t));
 const activeTab=tabs.find(b=>b.dataset.tab===t),activeGroup=activeTab?.closest('.side-group')||(t==='reports'?document.querySelector('[data-side-group="reports"]'):null);
 document.querySelectorAll('.side-group').forEach(group=>group.classList.toggle('has-active',group===activeGroup));
 if(t!=='reports')document.querySelectorAll('[data-report-go]').forEach(item=>item.classList.remove('active'));
 if(activeGroup)activeGroup.open=true;
 closeSidebar();
 if(t==='reports'){renderReport();if(!document.querySelector('[data-report-go].active'))activateReportSection('members')}
 if(t==='settings')renderPurchaseCategorySettings();
 if(t==='payExpenseDue')renderExpenseDueList();
 if(t==='inventory')renderInventory();
 if(t==='production'){fillProductionOptions();renderProductionList();renderProductionInputs()}
 if(t==='supplierAccounts'||t==='purchaseBills')renderSupplierAccounts();
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setTab(b.dataset.go));
$('menuToggle').onclick=()=>{
 if(window.innerWidth>=760){
  const hidden=$('appLayout').classList.toggle('sidebar-collapsed');
  try{localStorage.setItem(SIDEBAR_PREF_KEY,hidden?'1':'0')}catch{}
  syncMenuToggle();return;
 }
 const open=!$('sidebar').classList.contains('open');
 $('sidebar').classList.toggle('open',open);$('sidebarBackdrop').hidden=!open;syncMenuToggle();
};
$('sidebarBackdrop').onclick=closeSidebar;
window.addEventListener('resize',()=>{closeSidebar();syncMenuToggle()});
syncMenuToggle();
$('todayDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
$('expenseDate').value=today();
function renderExpenseMemberOptions(selectedNames=[]){
 const list=$('expenseCostMembers');if(!list)return;
 const selected=new Set(uniquePeople(selectedNames).map(n=>n.toLocaleLowerCase()));
 const names=assignablePeople();
 list.innerHTML=names.map(name=>`<label class="member-check"><input type="checkbox" value="${esc(name)}" ${selected.has(name.toLocaleLowerCase())?'checked':''}><span>${esc(name)}${db.guestPeople.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())?' · Guest':''}</span></label>`).join('')||'<span class="muted">Add family members in Profile or guest names below.</span>';
}
function selectedExpenseMembers(){return [...($('expenseCostMembers')?.querySelectorAll('input[type=checkbox]:checked')||[])].map(input=>input.value)}
function fillGuestMemberOptions(selectedNames=[]){
 const list=$('guestMemberOptions');if(!list)return;
 const selected=new Set(uniquePeople(selectedNames).map(n=>n.toLocaleLowerCase()));
 const names=assignablePeople();
 list.innerHTML=names.map(name=>`<label class="member-check"><input type="checkbox" value="${esc(name)}" ${selected.has(name.toLocaleLowerCase())?'checked':''}><span>${esc(name)}${db.guestPeople.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())?' · Guest':''}</span></label>`).join('')||'<span class="muted">Add a guest name first.</span>';
}
function selectedGuestMembers(){return [...($('guestMemberOptions')?.querySelectorAll('input[type=checkbox]:checked')||[])].map(input=>input.value)}
function fillChoices(){
 const currentCostMembers=selectedExpenseMembers();
 $('expenseName').innerHTML=db.expenseNames.map(n=>`<option>${esc(n)}</option>`).join('');
 $('unitName').innerHTML=db.units.map(n=>`<option>${esc(n)}</option>`).join('');
 const source=$('incomeSource'),sourceValue=source.value;
 source.innerHTML=db.incomeHeads.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
 if(db.incomeHeads.includes(sourceValue))source.value=sourceValue;
 [['incomeHeadFilter','All income types']].forEach(([id,label])=>{
  const select=$(id);if(!select)return;const previous=select.value;
  select.innerHTML=`<option value="all">${label}</option>`+db.incomeHeads.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
  select.value=previous==='all'||db.incomeHeads.includes(previous)?previous:'all';
 });
 [['incomeBy','Select person'],['salesMemoBy','Select person'],['incomePersonFilter','All people'],['reportIncomePersonFilter','All people']].forEach(([id,label])=>{
  const select=$(id);if(!select)return;const previous=select.value;
  const personSelect=id==='incomeBy'||id==='salesMemoBy';
  select.innerHTML=(personSelect?'':'<option value="all">'+label+'</option>')+db.incomePeople.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
  const preferred=(personSelect?(db.profile.name||db.incomePeople[0]):'all');
  select.value=db.incomePeople.includes(previous)?previous:(personSelect?preferred:'all');
 });
 const supplierSelect=$('purchaseSupplier');if(supplierSelect){const previous=supplierSelect.value;supplierSelect.innerHTML='<option value="">Select supplier</option>'+db.suppliers.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');if(db.suppliers.includes(previous))supplierSelect.value=previous;}
 const purchaseCategory=$('purchaseCategory');if(purchaseCategory){const previous=purchaseCategory.value;purchaseCategory.innerHTML='<option value="">Select purchase category</option>'+db.purchaseCategories.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');purchaseCategory.value=db.purchaseCategories.includes(previous)?previous:'';}
 renderExpenseMemberOptions(currentCostMembers);
 fillGuestMemberOptions(selectedGuestMembers());
 renderProductNameSuggestions();

}
function calcTotal(){let v=(Number($('quantity').value)||0)*(Number($('rate').value)||0);$('calculatedTotal').textContent=money(v)}
$('quantity').oninput=calcTotal;$('rate').oninput=calcTotal;
function updateExpenseDueFields(){let show=$('paymentType').value==='Due',owed=$('dueDirection').value==='owed_to_me';$('dueFields').hidden=!show;$('duePerson').required=show;$('duePaidFromField').hidden=!(show&&owed)}
$('paymentType').onchange=updateExpenseDueFields;$('dueDirection').onchange=updateExpenseDueFields;
$('incomePaymentType').onchange=()=>{let show=$('incomePaymentType').value==='Due';$('incomeDueFields').hidden=!show;$('incomeDuePerson').required=show};
$('incomeAmount').oninput=()=>{$('incomeTotalPreview').textContent=money(Number($('incomeAmount').value)||0)};
$('incomeDate').value=today();$('collectDate').value=today();$('expenseDueActionDate').value=today();
$('addExpenseName').onclick=()=>{let n=prompt('Add an expense name:');if(n&&n.trim()){n=n.trim();if(!db.expenseNames.includes(n))db.expenseNames.push(n);fillChoices();$('expenseName').value=n;localSaveOnly()}};
function addUnitName(select,afterAdd){
 let n=prompt('Add a unit name (e.g. bottle, sack, jar, metre):');if(!n||!n.trim())return;
 n=n.trim();const existing=db.units.find(value=>value.toLocaleLowerCase()===n.toLocaleLowerCase());if(existing)n=existing;else db.units.push(n);
 fillChoices();if(typeof afterAdd==='function')afterAdd(n);else if(select){if(select.tagName==='SELECT'){select.innerHTML=db.units.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');select.value=n}else select.value=n}
 localSaveOnly();
}
$('addUnit').onclick=()=>addUnitName($('unitName'),n=>{$('unitName').value=n});
$('addProductionUnit').onclick=()=>addUnitName($('productionUnit'),n=>{fillProductionOptions();$('productionUnit').value=n});
$('addIncomeHead').onclick=()=>{let n=prompt('Add an income type (e.g. Salary, Business, Rent, Freelance):');if(n&&n.trim()){n=n.trim();if(!db.incomeHeads.includes(n))db.incomeHeads.push(n);fillChoices();$('incomeSource').value=n;localSaveOnly()}};
$('addIncomePerson').onclick=()=>{let n=prompt('Add the person who earned this income:');if(n&&n.trim()){n=n.trim();if(!db.incomePeople.includes(n))db.incomePeople.push(n);fillChoices();$('incomeBy').value=n;localSaveOnly()}};
function localSaveOnly(){localStorage.setItem('dayquest_v1',JSON.stringify(db))}
function renderProductNameSuggestions(){
 const list=$('productNameSuggestions');if(list)list.innerHTML=db.productNames.map(n=>`<option value="${esc(n)}"></option>`).join('');
 const count=$('productCatalogCount');if(count)count.textContent=`${db.productNames.length} saved product${db.productNames.length===1?'':'s'}`;
}
function defaultPurchaseLine(product=''){
 return {lineId:null,product,productType:db.productTypes.includes('Other')?'Other':db.productTypes[0],spec:'',quantity:1,unit:db.units.includes('pcs')?'pcs':db.units[0],rate:0,amount:0,amountMode:'rate',calcError:'',amountPending:false,costType:'unassigned',costMember:''};
}
function addNewPurchaseProduct(index){
 const raw=prompt('Enter the new product name:');if(raw===null)return;
 const name=raw.trim();if(!name){alert('Enter a product name.');return}
 const existing=db.productNames.find(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase());
 const product=existing||name;
 if(!existing)db.productNames.unshift(product);
 const targetIndex=Number(index);
 if(!Number.isInteger(targetIndex)||targetIndex<0||!purchaseLines[targetIndex])return;
 purchaseLines[targetIndex].product=product;
 renderProductNameSuggestions();renderPurchaseLines();localSaveOnly();
 const target=$('purchaseLines').querySelector(`[data-line-index="${targetIndex}"] .pl-product`);
 if(target){target.focus();target.select()}
}
function addProductTypeToPurchaseLine(index){
 const line=purchaseLines[index];if(!line)return;
 const raw=prompt('Enter a product type (for example: Medicine, Grocery, Household):');if(raw===null)return;
 const name=raw.trim();if(!name){alert('Enter a product type.');return}
 const existing=db.productTypes.find(item=>item.toLocaleLowerCase()===name.toLocaleLowerCase());
 if(existing){line.productType=existing;alert('That product type already exists, so it has been selected for this line.')}
 else{db.productTypes.push(name);line.productType=name}
 renderPurchaseLines();localSaveOnly();
 const target=$('purchaseLines').querySelector(`[data-line-index="${index}"] .pl-product-type`);
 if(target)target.focus();
}

// Purchase bills, supplier creditor accounts and product purchase reporting
function unitInfo(unit){
 const u=String(unit||'pcs').trim().toLowerCase();
 if(['g','gram','grams'].includes(u))return {family:'mass',factor:1};
 if(['kg','kilogram','kilograms'].includes(u))return {family:'mass',factor:1000};
 if(['mg','milligram','milligrams'].includes(u))return {family:'mass',factor:0.001};
 if(['ml','millilitre','milliliter','millilitres','milliliters'].includes(u))return {family:'volume',factor:1};
 if(['l','litre','liter','litres','liters'].includes(u))return {family:'volume',factor:1000};
 if(['pc','pcs','piece','pieces'].includes(u))return {family:'count:pcs',factor:1};
 return {family:'unit:'+u,factor:1};
}
function productKey(product,spec,unit){const info=unitInfo(unit);return [String(product||'').trim().toLowerCase(),String(spec||'').trim().toLowerCase(),info.family].join('::')}
function productCatalog(){
 const map=new Map();
 db.purchaseBills.forEach(b=>(b.lines||[]).forEach(l=>{
  const product=String(l.product||'').trim(),spec=String(l.spec||'').trim(),unit=String(l.unit||'pcs'),info=unitInfo(unit);if(!product)return;
  const key=productKey(product,spec,unit);let r=map.get(key);
  if(!r){r={key,product,spec,family:info.family,unit,units:[],purchasedNorm:0,purchaseSpend:0};map.set(key,r)}
  if(!r.units.includes(unit))r.units.push(unit);
  r.purchasedNorm+=Number(l.quantity||0)*info.factor;r.purchaseSpend+=purchaseLineCost(b,l);
 }));
 map.forEach(r=>{r.avgUnitCost=r.purchasedNorm>0?r.purchaseSpend/r.purchasedNorm:0;r.preferredUnit=r.unit});
 return [...map.values()].sort((a,b)=>a.product.localeCompare(b.product)||a.spec.localeCompare(b.spec));
}
function roundPurchaseAmount(value){return Math.round((Number(value||0)+Number.EPSILON)*100)/100}
function purchaseLineAmount(line){
 const amount=Number(line.amount);
 return Number.isFinite(amount)?Math.max(0,amount):roundPurchaseAmount(Math.max(0,Number(line.quantity||0))*Math.max(0,Number(line.rate||0)));
}
function purchaseLineTemplate(line,index){
 const units=db.units.map(u=>`<option value="${esc(u)}" ${line.unit===u?'selected':''}>${esc(u)}</option>`).join('');
 const amountMode=line.amountMode==='quantity'?'quantity':'rate';
 return `<div class="purchase-line" data-line-index="${index}">
  <div class="purchase-line-top"><strong>Product ${index+1}</strong><button type="button" class="delete remove-purchase-line" data-index="${index}" ${purchaseLines.length===1?'disabled':''}>Remove</button></div>
  <div class="purchase-line-field-row"><label>Product name <input class="pl-product" list="productNameSuggestions" maxlength="80" value="${esc(line.product||'')}" placeholder="e.g. Soap" required></label><button type="button" class="mini-add pl-add-product" data-index="${index}" aria-label="Add product">＋ Add</button></div>
  <div class="purchase-line-field-row"><label>Product type <select class="pl-product-type" required>${db.productTypes.map(type=>`<option value="${esc(type)}" ${String(line.productType||'Other').toLocaleLowerCase()===type.toLocaleLowerCase()?'selected':''}>${esc(type)}</option>`).join('')}</select></label><button type="button" class="mini-add pl-add-product-type" data-index="${index}">＋ Add</button></div>
  <label>Size / specification <input class="pl-spec" maxlength="80" value="${esc(line.spec||'')}" placeholder="e.g. 300 gram (optional)"></label>
  <div class="form-grid"><label>Quantity <input class="pl-quantity" type="number" min="0.001" step="any" value="${Number(line.quantity??1)}" required></label><label>Unit <span class="select-add"><select class="pl-unit">${units}</select><button type="button" class="mini-add pl-add-unit" data-index="${index}">＋ Add</button></span></label></div>
  <div class="form-grid"><label>Rate per unit <input class="pl-rate" type="number" min="0" step="any" value="${Number(line.rate||0)}" required></label><label>Line amount <input class="pl-amount" type="number" min="0" step="any" value="${purchaseLineAmount(line)}" required></label></div>
  <label class="pl-amount-mode-label">When line amount is entered, calculate automatically <select class="pl-amount-mode"><option value="rate" ${amountMode==='rate'?'selected':''}>Rate per unit</option><option value="quantity" ${amountMode==='quantity'?'selected':''}>Quantity</option></select><small>Choose whether DayQuest should calculate the rate or quantity from the line amount.</small></label>
  <p class="pl-calc-message" role="status" aria-live="polite">${esc(line.calcError||'')}</p>
 </div>`;
}
function applyPurchaseLineAmount(index){
 const line=purchaseLines[index];if(!line)return;
 const amount=Math.max(0,Number(line.amount)||0);
 if(line.amountMode==='quantity'){
  const rate=Number(line.rate||0);
  if(rate>0&&Number.isFinite(rate)){
   line.quantity=Number((amount/rate).toFixed(6));line.calcError='';line.amountPending=false;
  }else{
   line.calcError='Enter a rate per unit first; then the quantity will be calculated.';line.amountPending=true;
  }
 }else{
  const quantity=Number(line.quantity||0);
  if(quantity>0&&Number.isFinite(quantity)){
   line.rate=Number((amount/quantity).toFixed(6));line.calcError='';line.amountPending=false;
  }else{
   line.calcError='Enter a quantity greater than zero first; then the rate will be calculated.';line.amountPending=true;
  }
 }
}
function renderPurchaseLines(){
 $('purchaseLines').innerHTML=purchaseLines.map(purchaseLineTemplate).join('');
 $('purchaseLines').querySelectorAll('.purchase-line').forEach((node,index)=>node.querySelectorAll('input,select').forEach(el=>{
  const prop=el.classList.contains('pl-product')?'product':el.classList.contains('pl-product-type')?'productType':el.classList.contains('pl-spec')?'spec':el.classList.contains('pl-quantity')?'quantity':el.classList.contains('pl-unit')?'unit':el.classList.contains('pl-rate')?'rate':el.classList.contains('pl-amount')?'amount':'amountMode';
  const handle=()=>{
   const line=purchaseLines[index];if(!line)return;
   if(prop==='amountMode'){
    line.amountMode=el.value;
    if(purchaseLineAmount(line)>0)applyPurchaseLineAmount(index);else{line.calcError='';line.amountPending=false;}
   }else if(prop==='amount'){
    line.amount=Math.max(0,Number(el.value)||0);applyPurchaseLineAmount(index);
   }else if(prop==='quantity'||prop==='rate'){
    line[prop]=Number(el.value)||0;
    if(line.amountPending)applyPurchaseLineAmount(index);
    else {line.amount=roundPurchaseAmount(Math.max(0,Number(line.quantity||0))*Math.max(0,Number(line.rate||0)));line.calcError=''}
   }else line[prop]=el.value;
   updatePurchaseTotals();
  };
  el.addEventListener('input',handle);
  el.addEventListener('change',handle);
 }));
 $('purchaseLines').querySelectorAll('.remove-purchase-line').forEach(btn=>btn.onclick=()=>{if(purchaseLines.length>1){purchaseLines.splice(Number(btn.dataset.index),1);renderPurchaseLines();updatePurchaseTotals()}});
 $('purchaseLines').querySelectorAll('.pl-add-product').forEach(btn=>btn.onclick=()=>addNewPurchaseProduct(Number(btn.dataset.index)));
 $('purchaseLines').querySelectorAll('.pl-add-product-type').forEach(btn=>btn.onclick=()=>addProductTypeToPurchaseLine(Number(btn.dataset.index)));
 $('purchaseLines').querySelectorAll('.pl-add-unit').forEach(btn=>btn.onclick=()=>{
  const index=Number(btn.dataset.index),node=btn.closest('.purchase-line');if(!node||!purchaseLines[index])return;
  addUnitName(node.querySelector('.pl-unit'),name=>{purchaseLines[index].unit=name;renderPurchaseLines()});
 });
 updatePurchaseTotals();
}
function currentPurchaseSubtotal(){return roundPurchaseAmount(purchaseLines.reduce((t,l)=>t+purchaseLineAmount(l),0))}
function currentPurchaseTotal(){return Math.max(0,roundPurchaseAmount(currentPurchaseSubtotal()+Number($('purchaseTransitCost')?.value||0)-Number($('purchaseDiscount')?.value||0)))}
function updatePurchaseTotals(){
 purchaseLines.forEach((l,i)=>{
  const node=$('purchaseLines').querySelector(`[data-line-index="${i}"]`);if(!node)return;
  const amountField=node.querySelector('.pl-amount'),quantityField=node.querySelector('.pl-quantity'),rateField=node.querySelector('.pl-rate'),message=node.querySelector('.pl-calc-message');
  if(amountField&&document.activeElement!==amountField)amountField.value=purchaseLineAmount(l);
  if(quantityField&&document.activeElement!==quantityField)quantityField.value=Number(l.quantity??0);
  if(rateField&&document.activeElement!==rateField)rateField.value=Number(l.rate??0);
  if(message)message.textContent=l.calcError||'';
 });
 const subtotal=currentPurchaseSubtotal(),transit=Math.max(0,Number($('purchaseTransitCost')?.value||0)),discount=Math.max(0,Number($('purchaseDiscount')?.value||0)),total=currentPurchaseTotal(),cash=Number($('purchaseCashPaid').value||0),bank=Number($('purchaseBankPaid').value||0),credit=Math.max(0,total-cash-bank);
 if($('purchaseSubtotal'))$('purchaseSubtotal').textContent=money(subtotal);$('purchaseBillTotal').textContent=money(total);$('purchaseCreditTotal').textContent=money(credit);
 const invalid=cash+bank>total+0.000001||discount>subtotal+transit+0.000001;$('purchaseCreditTotal').classList.toggle('invalid-total',invalid);$('purchaseBillSubmit').disabled=invalid;
 if($('purchaseAdjustmentPreview'))$('purchaseAdjustmentPreview').textContent=`${money(subtotal)} + ${money(transit)} transit − ${money(discount)} discount`;
}

function updatePurchaseBillNo(){
 const date=$('purchaseDate').value,field=$('purchaseBillNo');if(!field||!date)return;
 if(editingPurchaseBillId&&date===purchaseBillOriginalDate){const original=db.purchaseBills.find(b=>b.id===editingPurchaseBillId);if(original&&original.billNo){field.value=original.billNo;return}}
 field.value=nextPurchaseBillNo(date,editingPurchaseBillId);
}
function resetPurchaseForm(){editingPurchaseBillId=null;purchaseBillOriginalDate='';$('purchaseBillForm').reset();$('purchaseDate').value=today();$('purchaseBillNo').value='';updatePurchaseBillNo();$('purchaseCategory').value='';$('purchaseCashPaid').value=0;$('purchaseBankPaid').value=0;if($('purchaseTransitCost'))$('purchaseTransitCost').value=0;if($('purchaseDiscount'))$('purchaseDiscount').value=0;$('purchaseBillSubmit').textContent='Save purchase bill';$('cancelPurchaseEdit').hidden=true;purchaseLines=[defaultPurchaseLine()];renderPurchaseLines();fillChoices()}
$('purchaseDate').addEventListener('change',updatePurchaseBillNo);
$('addPurchaseLine').onclick=()=>{purchaseLines.push(defaultPurchaseLine());renderPurchaseLines()};
$('purchaseCashPaid').oninput=updatePurchaseTotals;$('purchaseBankPaid').oninput=updatePurchaseTotals;$('purchaseTransitCost').oninput=updatePurchaseTotals;$('purchaseDiscount').oninput=updatePurchaseTotals;
$('addSupplier').onclick=()=>{let n=prompt('Enter supplier / store name:');if(n&&n.trim()){n=n.trim();if(!db.suppliers.includes(n))db.suppliers.push(n);fillChoices();$('purchaseSupplier').value=n;localSaveOnly()}};
$('purchaseBillForm').onsubmit=e=>{
 e.preventDefault();const supplier=$('purchaseSupplier').value.trim(),category=$('purchaseCategory').value,date=$('purchaseDate').value,cashPaid=Number($('purchaseCashPaid').value||0),bankPaid=Number($('purchaseBankPaid').value||0),subtotal=currentPurchaseSubtotal(),transitCost=Math.max(0,Number($('purchaseTransitCost').value||0)),discount=Math.max(0,Number($('purchaseDiscount').value||0)),total=currentPurchaseTotal();
 const lines=purchaseLines.map(l=>({id:l.lineId||crypto.randomUUID(),product:String(l.product||'').trim(),productType:String(l.productType||'Other').trim()||'Other',spec:String(l.spec||'').trim(),quantity:Number(l.quantity),unit:String(l.unit||'pcs'),rate:Number(l.rate),amount:purchaseLineAmount(l),costType:['family','member','unassigned','members'].includes(l.costType)?l.costType:'unassigned',costMember:String(l.costMember||'').trim(),costMembers:Array.isArray(l.costMembers)?uniquePeople(l.costMembers):[]}));
 if(!supplier){alert('Select or add a supplier.');return}
 if(!date){alert('Select the purchase date.');return}
 if(!category){alert('Select a purchase category.');return}
 if(!lines.length||purchaseLines.some(l=>l.calcError)||lines.some(l=>!l.product||!l.productType||!(l.quantity>0)||!(l.rate>=0)||!(l.amount>=0)||!Number.isFinite(l.quantity)||!Number.isFinite(l.rate)||!Number.isFinite(l.amount))){alert('Enter a product name, product type, valid quantity, rate and line amount for every bill line. For amount-based calculation, enter the required quantity or rate first.');return}
 if(transitCost<0||discount<0||discount>subtotal+transitCost+0.000001){alert('Transit cost and discount must be valid, and discount cannot exceed the adjusted purchase subtotal.');return}
 if(cashPaid<0||bankPaid<0||cashPaid+bankPaid>total+0.000001){alert('Cash paid plus bank paid cannot exceed the bill total.');return}
 const old=editingPurchaseBillId?db.purchaseBills.find(b=>b.id===editingPurchaseBillId):null;
 const billNo=old&&date===purchaseBillOriginalDate?String(old.billNo||'').trim():nextPurchaseBillNo(date,editingPurchaseBillId);
 if(!billNo){alert('Could not generate a bill number. Check the purchase date and try again.');return}
 if(db.purchaseBills.some(b=>b.id!==editingPurchaseBillId&&String(b.billNo||'').trim().toLocaleLowerCase()===billNo.toLocaleLowerCase())){alert('This bill number already exists. Please try saving again to generate a unique number.');updatePurchaseBillNo();return}
 const values={supplier,category,billNo,date,lines,subtotal,transitCost,discount,total,cashPaid,bankPaid,credit:Math.max(0,total-cashPaid-bankPaid),note:$('purchaseNote').value.trim()};
 if(editingPurchaseBillId){if(old){if(db.supplierPayments.some(p=>p.supplier===old.supplier||p.supplier===supplier)){alert('This bill has supplier payment history. To protect the supplier ledger, it cannot be edited safely.');return}Object.assign(old,values)}}
 else db.purchaseBills.unshift({id:crypto.randomUUID(),...values});
 if(!db.suppliers.includes(supplier))db.suppliers.push(supplier);lines.forEach(l=>{if(!db.productNames.includes(l.product))db.productNames.push(l.product);if(!db.productTypes.some(type=>type.toLocaleLowerCase()===l.productType.toLocaleLowerCase()))db.productTypes.push(l.productType);if(!db.units.includes(l.unit))db.units.push(l.unit)});
 resetPurchaseForm();save();
};
function inventoryMemberChecks(line){
 const selected=new Set(assignedMembers(line).map(n=>n.toLocaleLowerCase()));
 return assignablePeople().map(name=>`<label class="member-check"><input type="checkbox" value="${esc(name)}" ${selected.has(name.toLocaleLowerCase())?'checked':''}><span>${esc(name)}${db.guestPeople.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())?' · Guest':''}</span></label>`).join('')||'<span class="muted">Add members or guests first.</span>';
}
function stockRefKey(billId,lineId){return `${billId}::${lineId}`}
function stockSourceRecords(){
 const records=[];
 db.purchaseBills.forEach(bill=>(bill.lines||[]).forEach(line=>records.push({
  billId:bill.id,lineId:line.id,stockRef:stockRefKey(bill.id,line.id),sourceType:'purchase',source:bill,ownerItem:line,bill,line,
  product:String(line.product||''),productType:String(line.productType||'Other'),spec:String(line.spec||''),unit:String(line.unit||'pcs'),quantity:Number(line.quantity||0),date:String(bill.date||''),amount:purchaseLineCost(bill,line),costMembers:assignedMembers(line)
 })));
 db.productions.forEach(production=>records.push({
  billId:`production:${production.id}`,lineId:'output',stockRef:stockRefKey(`production:${production.id}`,'output'),sourceType:'production',source:production,ownerItem:production,
  bill:{id:`production:${production.id}`,date:production.date,supplier:'In-house production',billNo:production.productionNo,category:'Production'},
  line:{id:'output',product:production.product,productType:production.productType||'Other',spec:production.spec||'',quantity:Number(production.quantity||0),unit:production.unit||'pcs',rate:Number(production.unitCost||0),amount:Number(production.totalCost||0),costMembers:production.costMembers||[]},
  product:String(production.product||''),productType:String(production.productType||'Other'),spec:String(production.spec||''),unit:String(production.unit||'pcs'),quantity:Number(production.quantity||0),date:String(production.date||''),amount:Number(production.totalCost||0),costMembers:uniquePeople(production.costMembers||[])
 }));
 return records;
}
function resolveStockSource(billId,lineId){return stockSourceRecords().find(record=>record.billId===billId&&record.lineId===lineId)||null}
function usedStockQuantity(record,{excludeMemoId=null,excludeProductionId=null,asOfDate=null}={}){
 return db.consumptions.filter(c=>c.billId===record.billId&&c.lineId===record.lineId&&(!excludeMemoId||c.salesMemoId!==excludeMemoId)&&(!excludeProductionId||c.productionId!==excludeProductionId)&&(!asOfDate||!c.date||String(c.date)<=asOfDate)).reduce((total,c)=>total+Number(c.quantity||0),0);
}
function inventoryEntries(){
 return stockSourceRecords().map(record=>{
  const entries=db.consumptions.filter(c=>c.billId===record.billId&&c.lineId===record.lineId),used=entries.reduce((t,c)=>t+Number(c.quantity||0),0),sold=entries.filter(c=>c.salesMemoId).reduce((t,c)=>t+Number(c.quantity||0),0);
  return {...record,used,sold,otherUsed:Math.max(0,used-sold),remaining:Math.max(0,record.quantity-used)};
 }).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||a.product.localeCompare(b.product));
}
function renderInventory(){
 const list=$('inventoryList');if(!list)return;
 const rows=inventoryEntries(),assigned=rows.filter(record=>record.costMembers.length>0).length;
 $('inventoryCount').textContent=`${rows.length} product lots · ${assigned} assigned`;
 list.innerHTML=rows.length?rows.map(record=>{
  const {bill,line,used,sold,otherUsed,remaining,amount,costMembers,stockRef,sourceType}=record;
  const assignment=costMembers.length?costMembers.join(', '):'Not assigned',domId=encodeURIComponent(stockRef);
  return `<article class="inventory-row" id="inventory-record-${domId}" data-inventory-ref="${esc(stockRef)}">
   <div class="inventory-row-head"><div><strong>${esc(record.product)}${record.spec?` · ${esc(record.spec)}`:''}</strong><small>${esc(record.productType||'Other')} · ${sourceType==='production'?'Production batch':esc(bill.supplier||'Supplier')} · ${fmt(record.date)}${bill.billNo?` · ${sourceType==='production'?'Production':'Bill'} #${esc(bill.billNo)}`:''}</small></div><strong>${money(amount)}</strong></div>
   <div class="inventory-row-stats"><span>Added <strong>${numberText(record.quantity)} ${esc(record.unit)}</strong></span><span>Sold <strong>${numberText(sold)} ${esc(record.unit)}</strong></span><span>Other used <strong>${numberText(otherUsed)} ${esc(record.unit)}</strong></span><span>In stock <strong>${numberText(remaining)} ${esc(record.unit)}</strong></span><span>Cost owner <strong>${esc(assignment)}</strong></span>${sourceType==='production'?`<span>Unit cost <strong>${money(Number(record.quantity)>0?amount/record.quantity:0)}</strong></span>`:''}</div>
   <div class="inventory-row-actions"><div><strong class="assignment-label">Assign product cost (select one or more)</strong><div class="member-check-list" data-inventory-members>${inventoryMemberChecks(line)}</div></div><div class="inventory-buttons"><button type="button" class="edit-btn" data-save-inventory-assignment>Save assignment</button><button type="button" class="secondary" data-use-inventory ${remaining<=0.000001?'disabled':''}>Use stock</button></div></div>
  </article>`;
 }).join(''):empty('No inventory yet. Save a purchase bill or production batch to add products to your inventory.');
 list.querySelectorAll('[data-save-inventory-assignment]').forEach(button=>button.onclick=()=>{
  const row=button.closest('[data-inventory-ref]'),[billId,lineId]=String(row?.dataset.inventoryRef||'').split('::'),record=resolveStockSource(billId,lineId);if(!record)return;
  const members=[...(row?.querySelectorAll('[data-inventory-members] input:checked')||[])].map(input=>input.value);
  setAssignedMembers(record.ownerItem,members);save();
 });
 list.querySelectorAll('[data-use-inventory]').forEach(button=>button.onclick=()=>{
  const row=button.closest('[data-inventory-ref]'),[billId,lineId]=String(row?.dataset.inventoryRef||'').split('::'),record=resolveStockSource(billId,lineId);if(!record)return;
  const used=usedStockQuantity(record),remaining=Math.max(0,record.quantity-used);if(remaining<=0.000001)return;
  const raw=prompt(`How much ${record.product} stock was used? Available: ${numberText(remaining)} ${record.unit}`);if(raw===null)return;
  const quantity=Number(raw);if(!(quantity>0)||!Number.isFinite(quantity)||quantity>remaining+0.000001){alert(`Enter a quantity greater than 0 and no more than ${numberText(remaining)} ${record.unit}.`);return}
  db.consumptions.push({id:crypto.randomUUID(),billId,lineId,quantity,date:today()});save();
 });
}

// Production: consume existing inventory lots by FIFO and create a new finished-goods lot.
let productionInputs=[];
function productionPrefix(date){const m=/^(\d{4})-(\d{2})-\d{2}$/.exec(String(date||''));return m?`PR-${m[2]}-${m[1]}`:`PR-${today().slice(5,7)}-${today().slice(0,4)}`}
function nextProductionNo(date){
 const prefix=productionPrefix(date);let highest=0;
 db.productions.forEach(p=>{const re=new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}-(\\d+)$`,'i'),m=re.exec(String(p.productionNo||''));if(m)highest=Math.max(highest,Number(m[1])||0)});
 let n=highest+1,value=`${prefix}-${n}`,used=new Set(db.productions.map(p=>String(p.productionNo||'').toLowerCase()));while(used.has(value.toLowerCase())){n++;value=`${prefix}-${n}`}return value;
}
function defaultProductionInput(){return {product:'',unit:'',quantity:1}}
function productionBucketOptions(date){return [...buildSalesStockBuckets(null,date).values()].filter(bucket=>bucket.available>0.000001).sort((a,b)=>a.product.localeCompare(b.product)||a.unit.localeCompare(b.unit))}
function productionInputTemplate(input,index,buckets){
 const selected=input.product?salesStockValue(input.product,input.unit):'';
 const options=buckets.map(bucket=>`<option value="${esc(salesStockValue(bucket.product,bucket.unit))}" ${selected===salesStockValue(bucket.product,bucket.unit)?'selected':''}>${esc(bucket.product)} (${esc(bucket.unit)}) · Available ${numberText(bucket.available)}</option>`).join('');
 const available=buckets.find(bucket=>bucket.product.toLocaleLowerCase()===String(input.product||'').toLocaleLowerCase()&&bucket.unit.toLocaleLowerCase()===String(input.unit||'').toLocaleLowerCase())?.available||0;
 return `<div class="production-input-line" data-production-input="${index}">
  <div class="production-input-head"><strong>Material ${index+1}</strong><button type="button" class="delete remove-production-input" data-index="${index}" ${productionInputs.length===1?'disabled':''}>Remove</button></div>
  <label>Inventory product <select class="production-input-product" required><option value="">${buckets.length?'Select available inventory product':'No available inventory stock'}</option>${options}${input.product&&!buckets.some(bucket=>bucket.product.toLocaleLowerCase()===input.product.toLocaleLowerCase()&&bucket.unit.toLocaleLowerCase()===input.unit.toLocaleLowerCase())?`<option value="${esc(selected)}" selected>${esc(input.product)} (${esc(input.unit)}) · No stock on production date</option>`:''}</select></label>
  <label>Quantity to use${input.unit?` (${esc(input.unit)})`:''} <input class="production-input-quantity" type="number" min="0.001" step="any" value="${Number(input.quantity||1)}" required></label>
  <small class="production-input-stock">${input.product?`Available on ${fmt($('productionDate').value)}: ${numberText(available)} ${esc(input.unit)}`:'Select a product to see available stock and material cost.'}</small>
 </div>`;
}
function renderProductionInputs(){
 const buckets=productionBucketOptions($('productionDate').value||today());
 $('productionInputs').innerHTML=productionInputs.map((input,index)=>productionInputTemplate(input,index,buckets)).join('');
 $('productionInputs').querySelectorAll('.production-input-line').forEach((node,index)=>{
  const select=node.querySelector('.production-input-product'),quantity=node.querySelector('.production-input-quantity');
  select.addEventListener('change',()=>{const decoded=decodeSalesStockValue(select.value);productionInputs[index].product=decoded.product;productionInputs[index].unit=decoded.unit;updateProductionPreview();renderProductionInputs()});
  quantity.addEventListener('input',()=>{productionInputs[index].quantity=Number(quantity.value||0);updateProductionPreview()});
 });
 $('productionInputs').querySelectorAll('.remove-production-input').forEach(button=>button.onclick=()=>{if(productionInputs.length>1){productionInputs.splice(Number(button.dataset.index),1);renderProductionInputs();updateProductionPreview()}});
 updateProductionPreview();
}
function allocateProductionMaterials(inputs,date){
 const buckets=buildSalesStockBuckets(null,date),consumptions=[],summaries=[],owners=[];let ingredientCost=0;
 for(const input of inputs){
  if(!input.product||!input.unit||!(Number(input.quantity)>0))return {error:'Select each inventory product and enter a quantity greater than zero.'};
  const bucket=buckets.get(salesStockKey(input.product,input.unit));if(!bucket)return {error:`${input.product} (${input.unit}) is not available in Inventory on the selected production date.`};
  let remaining=Number(input.quantity),lineCost=0;
  for(const lot of bucket.lots){
   if(remaining<=0.000001)break;if(lot.remaining<=0.000001)continue;
   const take=Math.min(remaining,lot.remaining),cost=take*Number(lot.costPerUnit||0);
   lot.remaining-=take;remaining-=take;lineCost+=cost;ingredientCost+=cost;
   lot.costMembers.forEach(name=>owners.push(name));
   consumptions.push({billId:lot.billId,lineId:lot.lineId,quantity:Number(take.toFixed(6))});
  }
  if(remaining>0.000001)return {error:`Not enough ${input.product} stock. Available: ${numberText(bucket.available)} ${input.unit}; requested: ${numberText(input.quantity)} ${input.unit}.`};
  summaries.push({product:input.product,unit:input.unit,quantity:Number(input.quantity),cost:roundPurchaseAmount(lineCost)});
 }
 return {consumptions,summaries,ingredientCost:roundPurchaseAmount(ingredientCost),costMembers:uniquePeople(owners)};
}
function updateProductionPreview(){
 if(!$('productionForm'))return;
 const date=$('productionDate').value||today(),allocation=allocateProductionMaterials(productionInputs,date),electricity=Math.max(0,Number($('productionElectricityCost').value||0)),transit=Math.max(0,Number($('productionTransitCost').value||0)),quantity=Math.max(0,Number($('productionQuantity').value||0));
 const materials=allocation.error?0:allocation.ingredientCost,total=roundPurchaseAmount(materials+electricity+transit),unitCost=quantity>0?total/quantity:0;
 $('productionMaterialCost').textContent=money(materials);$('productionTotalCost').textContent=money(total);$('productionUnitCost').textContent=money(unitCost);
 $('productionCostHint').textContent=allocation.error?allocation.error:`Material cost ${money(materials)} + Electricity ${money(electricity)} + Transit ${money(transit)} = Total ${money(total)}. The total is saved as the finished product's inventory value.`;
 $('productionCostHint').classList.toggle('validation-hint',!!allocation.error);
 $('productionSubmit').disabled=!!allocation.error||!productionInputs.length||!(quantity>0);
}
function fillProductionOptions(){
 const type=$('productionProductType');if(type){const prior=type.value;type.innerHTML=db.productTypes.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');if(db.productTypes.includes(prior))type.value=prior;else if(db.productTypes.includes('Other'))type.value='Other'}
 const unit=$('productionUnit');if(unit){const prior=unit.value;unit.innerHTML=db.units.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');if(db.units.includes(prior))unit.value=prior;else if(db.units.includes('pcs'))unit.value='pcs'}
}
function resetProductionForm(){
 $('productionForm').reset();$('productionDate').value=today();$('productionNo').value=nextProductionNo(today());$('productionQuantity').value=1;$('productionElectricityCost').value=0;$('productionTransitCost').value=0;fillProductionOptions();productionInputs=[defaultProductionInput()];renderProductionInputs();
}
function renderProductionList(){
 const list=$('productionList');if(!list)return;
 const batches=db.productions.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 $('productionCount').textContent=`${batches.length} ${batches.length===1?'batch':'batches'}`;
 list.innerHTML=batches.length?batches.map(batch=>{
  const inputs=(batch.inputs||[]).map(item=>`${esc(item.product)} ${numberText(item.quantity)} ${esc(item.unit)} (${money(item.cost)})`).join(' · ');
  return `<article class="production-batch" data-production-id="${esc(batch.id)}"><div class="production-batch-head"><div><strong>${esc(batch.product)}${batch.spec?` · ${esc(batch.spec)}`:''}</strong><small>${esc(batch.productionNo||'Production')} · ${fmt(batch.date)} · Produced ${numberText(batch.quantity)} ${esc(batch.unit)}</small></div><strong>${money(batch.totalCost)}</strong></div><div class="production-batch-grid"><span>Materials<strong>${money(batch.ingredientCost)}</strong></span><span>Electricity<strong>${money(batch.electricityCost)}</strong></span><span>Transit<strong>${money(batch.transitCost)}</strong></span><span>Cost per unit<strong>${money(batch.unitCost)}</strong></span></div><small class="production-batch-materials">Used: ${inputs||'No materials recorded'}</small><div class="production-batch-actions"><button type="button" class="edit-btn" data-open-production-stock>Open Inventory</button><button type="button" class="delete" data-delete-production>Delete batch</button></div></article>`;
 }).join(''):empty('No production batches yet. Select inventory materials and save your first finished product batch.');
 list.querySelectorAll('[data-open-production-stock]').forEach(button=>button.onclick=()=>{const batch=button.closest('[data-production-id]');openInventoryLine(stockRefKey(`production:${batch.dataset.productionId}`,'output'))});
 list.querySelectorAll('[data-delete-production]').forEach(button=>button.onclick=()=>deleteProduction(button.closest('[data-production-id]')?.dataset.productionId));
}
function deleteProduction(id){
 const batch=db.productions.find(item=>item.id===id);if(!batch)return;
 const outputRef=`production:${id}`;
 if(db.consumptions.some(c=>c.billId===outputRef&&c.lineId==='output')){alert('This produced stock has been used or sold. The batch cannot be deleted because that would break inventory history.');return}
 if(!confirm(`Delete production ${batch.productionNo||''}? Ingredient quantities will be returned to inventory.`))return;
 db.consumptions=db.consumptions.filter(c=>c.productionId!==id);db.productions=db.productions.filter(item=>item.id!==id);save();
}
$('productionDate').addEventListener('change',()=>{$('productionNo').value=nextProductionNo($('productionDate').value);renderProductionInputs()});
$('addProductionInput').onclick=()=>{let index=productionInputs.findIndex(input=>!String(input.product||'').trim());if(index<0){productionInputs.push(defaultProductionInput());index=productionInputs.length-1}renderProductionInputs();$('productionForm').scrollIntoView({behavior:'smooth',block:'start'});$('productionInputs').querySelectorAll('.production-input-product')[index]?.focus()};
['productionQuantity','productionElectricityCost','productionTransitCost'].forEach(id=>$(id).addEventListener('input',updateProductionPreview));
$('productionForm').onsubmit=e=>{
 e.preventDefault();const date=$('productionDate').value,productionNo=$('productionNo').value,product=$('productionProduct').value.trim(),productType=$('productionProductType').value||'Other',spec=$('productionProductSize').value.trim(),quantity=Number($('productionQuantity').value),unit=$('productionUnit').value,electricityCost=Number($('productionElectricityCost').value||0),transitCost=Number($('productionTransitCost').value||0);
 if(!date||!product||!unit||!(quantity>0)||!Number.isFinite(quantity)){alert('Enter a production date, finished product name, positive quantity and unit.');return}
 if(!Number.isFinite(electricityCost)||!Number.isFinite(transitCost)||electricityCost<0||transitCost<0){alert('Electricity and transit costs must be zero or greater.');return}
 if(!productionInputs.length||productionInputs.some(input=>!input.product||!(Number(input.quantity)>0))){alert('Add at least one inventory material with a valid quantity.');return}
 const allocation=allocateProductionMaterials(productionInputs,date);if(allocation.error){alert(allocation.error);return}
 const totalCost=roundPurchaseAmount(allocation.ingredientCost+electricityCost+transitCost),id=crypto.randomUUID();
 if(db.productions.some(item=>String(item.productionNo||'').toLocaleLowerCase()===productionNo.toLocaleLowerCase())){alert('This production number already exists. Please refresh the form and try again.');$('productionNo').value=nextProductionNo(date);return}
 const batch={id,productionNo,date,product,productType,spec,quantity,unit,ingredientCost:allocation.ingredientCost,electricityCost,transitCost,totalCost,unitCost:quantity>0?totalCost/quantity:0,inputs:allocation.summaries,costMembers:allocation.costMembers,overheadMembers:allocation.costMembers.slice(),overheadCost:roundPurchaseAmount(electricityCost+transitCost)};
 db.productions.unshift(batch);
 allocation.consumptions.forEach(item=>db.consumptions.push({id:crypto.randomUUID(),...item,productionId:id,productionNo,date}));
 if(!db.productNames.some(name=>name.toLocaleLowerCase()===product.toLocaleLowerCase())){db.productNames.push(product);renderProductNameSuggestions()}
 if(!db.productTypes.some(name=>name.toLocaleLowerCase()===productType.toLocaleLowerCase()))db.productTypes.push(productType);
 if(!db.units.includes(unit))db.units.push(unit);
 resetProductionForm();save();
};

function supplierBillBalances(supplier){
 const rows=db.purchaseBills.filter(b=>b.supplier===supplier).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id))).map(b=>({bill:b,credit:billCredit(b),paid:0,remaining:billCredit(b)}));
 const payments=db.supplierPayments.filter(p=>p.supplier===supplier).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
 // Apply each payment only to bills that already existed on that payment date (oldest first).
 payments.forEach(payment=>{let amount=Number(payment.amount||0)+Number(payment.discount||0);rows.filter(r=>r.bill.date<=payment.date&&r.remaining>0).forEach(r=>{if(amount<=0)return;const applied=Math.min(r.remaining,amount);r.paid+=applied;r.remaining-=applied;amount-=applied})});
 return rows;
}
function renderSupplierAccounts(){
 const names=[...new Set([...db.suppliers,...db.purchaseBills.map(b=>b.supplier),...db.supplierPayments.map(p=>p.supplier)].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 $('supplierList').innerHTML=names.length?names.map(name=>{const bills=db.purchaseBills.filter(b=>b.supplier===name),billed=bills.reduce((t,b)=>t+billTotal(b),0),due=supplierOutstanding(name),paid=db.supplierPayments.filter(p=>p.supplier===name).reduce((t,p)=>t+Number(p.amount||0),0),discounts=db.supplierPayments.filter(p=>p.supplier===name).reduce((t,p)=>t+Number(p.discount||0),0);return `<button type="button" class="supplier-row" data-supplier="${esc(name)}"><span><strong>${esc(name)}</strong><small>${bills.length} bills · Billed ${money(billed)} · Paid ${money(paid)} · Discount ${money(discounts)}</small></span><span><strong>${money(due)}</strong><small>Outstanding credit</small></span></button>`}).join(''):empty('No supplier accounts yet. Save a purchase bill to create one.');
 $('supplierList').querySelectorAll('[data-supplier]').forEach(btn=>btn.onclick=()=>openSupplierAccount(btn.dataset.supplier));
 $('purchaseBillCount').textContent=`${db.purchaseBills.length} bills`;
 $('purchaseBillList').innerHTML=db.purchaseBills.length?db.purchaseBills.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(b=>{
  const billId=esc(b.id),products=(b.lines||[]).map(line=>{
   const lineId=esc(line.id),used=db.consumptions.filter(c=>c.billId===b.id&&c.lineId===line.id).reduce((t,c)=>t+Number(c.quantity||0),0),remaining=Math.max(0,Number(line.quantity||0)-used),amount=purchaseLineCost(b,line),owners=assignedMembers(line);
   return `<article class="purchase-bill-line" id="purchase-bill-line-${lineId}"><div class="purchase-bill-line-head"><strong>${esc(line.product||'Product')}${line.spec?` · ${esc(line.spec)}`:''}</strong><strong>${money(amount)}</strong></div><small>${esc(line.productType||'Other')} · ${numberText(line.quantity)} ${esc(line.unit||'pcs')} × ${money(line.rate||0)}</small><div class="purchase-bill-stock"><span>Purchased <strong>${numberText(line.quantity)} ${esc(line.unit||'pcs')}</strong></span><span>Used <strong>${numberText(used)} ${esc(line.unit||'pcs')}</strong></span><span>In stock <strong>${numberText(remaining)} ${esc(line.unit||'pcs')}</strong></span><span>Assigned to <strong>${esc(owners.length?owners.join(', '):'Not assigned')}</strong></span></div><button type="button" class="edit-btn" data-view-inventory-line="${esc(stockRefKey(b.id,line.id))}">Open inventory record</button></article>`;
  }).join('');
  return `<article class="purchase-bill-card" id="purchase-bill-${billId}"><div class="item bill-summary"><div class="item-main"><div class="item-title">${esc(b.supplier)}${b.billNo?` · #${esc(b.billNo)}`:''}</div><div class="item-sub">${fmt(b.date)} · ${esc(b.category||'Uncategorised')} · ${(b.lines||[]).length} products · Transit ${money(b.transitCost)} · Discount ${money(b.discount)} · Cash ${money(b.cashPaid)} · Bank ${money(b.bankPaid)} · Credit ${money(billCredit(b))}</div></div><div class="expense-right"><div class="item-amount">${money(billTotal(b))}</div><div class="item-actions"><button type="button" class="edit-btn" data-open-supplier="${esc(b.supplier)}">Account</button><button type="button" class="edit-btn" data-edit-bill="${billId}">Edit</button><button type="button" class="delete" data-delete-bill="${billId}" aria-label="Delete purchase bill">×</button></div></div></div><details class="purchase-bill-details" id="purchase-bill-detail-${billId}"><summary>View bill products & inventory</summary><div class="purchase-bill-products">${products||empty('No products on this bill.')}</div></details></article>`;
 }).join(''):empty('No purchase bills saved yet.');
 $('purchaseBillList').querySelectorAll('[data-open-supplier]').forEach(btn=>btn.onclick=()=>openSupplierAccount(btn.dataset.openSupplier));
 $('purchaseBillList').querySelectorAll('[data-edit-bill]').forEach(btn=>btn.onclick=()=>editPurchaseBill(btn.dataset.editBill));
 $('purchaseBillList').querySelectorAll('[data-delete-bill]').forEach(btn=>btn.onclick=()=>deletePurchaseBill(btn.dataset.deleteBill));
 $('purchaseBillList').querySelectorAll('[data-view-inventory-line]').forEach(btn=>btn.onclick=()=>openInventoryLine(btn.dataset.viewInventoryLine));
}
function openSupplierAccount(name){
 setTab('supplierAccounts');
 activeSupplierName=name;$('supplierAccountPanel').hidden=false;$('supplierAccountTitle').textContent=name;$('supplierAccountSubtitle').textContent='Supplier / creditor ledger';
 const bills=db.purchaseBills.filter(b=>b.supplier===name).slice().sort((a,b)=>b.date.localeCompare(a.date)),billed=bills.reduce((t,b)=>t+billTotal(b),0),due=supplierOutstanding(name),allocations=supplierBillBalances(name);
 $('supplierBilledTotal').textContent=money(billed);$('supplierDueTotal').textContent=money(due);$('paySupplierBtn').hidden=due<=0.000001;
 $('supplierAccountBills').innerHTML=bills.length?allocations.slice().reverse().map(({bill,credit,paid,remaining})=>`<article class="supplier-bill"><div class="supplier-bill-head"><div><strong>${fmt(bill.date)}${bill.billNo?` · Bill #${esc(bill.billNo)}`:''}</strong><small>${esc(bill.supplier)} · ${esc(bill.category||'Uncategorised')}</small></div><strong>${money(billTotal(bill))}</strong></div><div class="supplier-product-table"><div class="supplier-product-head"><span>Product</span><span>Qty</span><span>Rate</span><span>Amount</span></div>${(bill.lines||[]).map(l=>`<div class="supplier-product-row"><span><strong>${esc(l.product)}</strong><small>${esc(l.productType||'Other')}${l.spec?` · ${esc(l.spec)}`:''}</small></span><span>${numberText(l.quantity)} ${esc(l.unit)}</span><span>${money(l.rate)}</span><strong>${money(purchaseLineCost(bill,l))}</strong></div>`).join('')}</div><div class="supplier-bill-foot"><span>Cash ${money(bill.cashPaid)} · Bank ${money(bill.bankPaid)} · Transit ${money(bill.transitCost)} · Discount ${money(bill.discount)} · Credit ${money(credit)}</span><strong>Credit remaining ${money(remaining)}</strong></div>${bill.note?`<p class="item-sub">${esc(bill.note)}</p>`:''}</article>`).join(''):empty('No bills for this supplier.');
 const payments=db.supplierPayments.filter(p=>p.supplier===name).slice().sort((a,b)=>b.date.localeCompare(a.date));
 $('supplierAccountPayments').innerHTML=payments.length?payments.map(p=>`<div class="breakrow"><span>${fmt(p.date)} · ${esc(p.method||'Cash')} paid ${money(p.amount)} · Discount ${money(p.discount||0)}${p.note?` · ${esc(p.note)}`:''}</span><strong>${money(Number(p.amount||0)+Number(p.discount||0))} settled</strong></div>`).join(''):empty('No supplier payments recorded yet.');
 $('supplierAccountPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
$('closeSupplierAccount').onclick=()=>{$('supplierAccountPanel').hidden=true;activeSupplierName=null;$('supplierPaymentForm').hidden=true};
$('paySupplierBtn').onclick=()=>{
 if(!activeSupplierName)return;const due=supplierOutstanding(activeSupplierName);if(due<=0)return;
 payingSupplierName=activeSupplierName;$('supplierPaymentTitle').textContent=`Payment to ${activeSupplierName}`;$('supplierPaymentRemaining').textContent=`Remaining: ${money(due)}`;$('supplierPaymentAmount').value=due.toFixed(2);$('supplierPaymentAmount').max=due.toFixed(2);$('supplierPaymentDiscount').value='0';$('supplierPaymentDate').value=today();$('supplierPaymentMethod').value='Cash';$('supplierPaymentNote').value='';updateSupplierPaymentPreview();$('supplierPaymentForm').hidden=false;$('supplierPaymentForm').scrollIntoView({behavior:'smooth',block:'center'});
};
$('cancelSupplierPayment').onclick=()=>{payingSupplierName=null;$('supplierPaymentForm').reset();$('supplierPaymentForm').hidden=true};
function updateSupplierPaymentPreview(){
 const paid=Math.max(0,Number($('supplierPaymentAmount')?.value||0)),discount=Math.max(0,Number($('supplierPaymentDiscount')?.value||0));
 if($('supplierPaymentSettlementTotal'))$('supplierPaymentSettlementTotal').textContent=money(paid+discount);
}
$('supplierPaymentAmount').addEventListener('input',updateSupplierPaymentPreview);
$('supplierPaymentDiscount').addEventListener('input',updateSupplierPaymentPreview);
$('supplierPaymentForm').onsubmit=e=>{
 e.preventDefault();if(!payingSupplierName)return;
 const amount=Number($('supplierPaymentAmount').value||0),discount=Number($('supplierPaymentDiscount').value||0),settlement=amount+discount,due=supplierOutstanding(payingSupplierName);
 if(!Number.isFinite(amount)||!Number.isFinite(discount)||amount<0||discount<0||settlement<=0||settlement>due+0.000001){alert(`Enter a cash/bank payment and/or discount greater than 0. Their combined value cannot exceed ${money(due)}.`);return}
 db.supplierPayments.push({id:crypto.randomUUID(),supplier:payingSupplierName,amount,discount,date:$('supplierPaymentDate').value,method:$('supplierPaymentMethod').value,note:$('supplierPaymentNote').value.trim()});
 payingSupplierName=null;$('supplierPaymentForm').reset();$('supplierPaymentForm').hidden=true;save();if(activeSupplierName)openSupplierAccount(activeSupplierName);
};

function renderProductPurchaseReport(from=$('productReportFromDate')?.value||'',to=$('productReportToDate')?.value||''){

 const typeReport=$('productTypePurchaseReport');
 const productReport=$('productPurchaseReport');
 if(!from||!to){
  const message=empty('Choose both a From date and a To date to view purchase costs.');
  if(typeReport)typeReport.innerHTML=message;
  if(productReport)productReport.innerHTML=message;
  return;
 }
 if(from>to){
  const message=empty('Invalid date range: the From date must be on or before the To date.');
  if(typeReport)typeReport.innerHTML=message;
  if(productReport)productReport.innerHTML=message;
  return;
 }
 const periodBills=db.purchaseBills.filter(b=>String(b.date||'')>=from&&String(b.date||'')<=to);
 const rangeLabel=`${fmt(from)} – ${fmt(to)}`;
 const typeTotals=new Map();let typeGrandTotal=0;
 periodBills.forEach(b=>(b.lines||[]).forEach(l=>{
  const type=String(l.productType||'Other').trim()||'Other';
  const key=type.toLocaleLowerCase();
  const amount=purchaseLineCost(b,l);
  let row=typeTotals.get(key);
  if(!row){row={type,amount:0,products:new Set(),bills:new Set(),lines:0};typeTotals.set(key,row)}
  row.amount+=amount;row.lines++;row.bills.add(b.id);if(String(l.product||'').trim())row.products.add(String(l.product).trim());typeGrandTotal+=amount;
 }));
 const typeRows=[...typeTotals.values()].sort((a,b)=>b.amount-a.amount||a.type.localeCompare(b.type)).map(row=>{
  const share=typeGrandTotal>0?row.amount/typeGrandTotal*100:0;
  return `<article class="product-report-row"><div class="product-report-title"><strong>${esc(row.type)}</strong><strong>${money(row.amount)}</strong></div><div class="product-report-grid"><span>Different products<strong>${row.products.size}</strong></span><span>Purchase lines<strong>${row.lines}</strong></span><span>Purchase bills<strong>${row.bills.size}</strong></span><span>Share of purchase cost<strong>${share.toFixed(1)}%</strong></span></div></article>`;
 }).join('');
 $('productTypePurchaseReport').innerHTML=`<div class="product-report-summary"><div><span>Product purchase cost · ${esc(rangeLabel)}</span><strong>${money(typeGrandTotal)}</strong></div><div><span>Product types purchased</span><strong>${typeTotals.size}</strong></div></div>${typeRows||empty(`No product purchases found from ${esc(fmt(from))} to ${esc(fmt(to))}.`)}`;
 const catalog=productCatalog();let grandTotal=0,productCount=0;
 const rows=catalog.map(p=>{
  let boughtNorm=0,boughtSpend=0,billIds=new Set(),lineCount=0;
  periodBills.forEach(b=>(b.lines||[]).forEach(l=>{
   if(productKey(l.product,l.spec,l.unit)===p.key){
    const info=unitInfo(l.unit);
    boughtNorm+=Number(l.quantity||0)*info.factor;
    boughtSpend+=purchaseLineCost(b,l);
    billIds.add(b.id);lineCount++;
   }
  }));
  if(!boughtNorm&&!boughtSpend)return '';
  productCount++;grandTotal+=boughtSpend;
  const qty=boughtNorm/unitInfo(p.unit).factor;
  const avgRate=qty>0?boughtSpend/qty:0;
  const fmtQty=`${numberText(qty)} ${esc(p.unit)}`;
  return `<article class="product-report-row"><div class="product-report-title"><strong>${esc(p.product)}${p.spec?` · ${esc(p.spec)}`:''}</strong><strong>${money(boughtSpend)}</strong></div><div class="product-report-grid"><span>Quantity bought<strong>${fmtQty}</strong></span><span>Total product cost<strong>${money(boughtSpend)}</strong></span><span>Average purchase rate<strong>${money(avgRate)} / ${esc(p.unit)}</strong></span><span>Purchase bills<strong>${billIds.size} (${lineCount} lines)</strong></span></div></article>`;
 }).filter(Boolean).join('');
 $('productPurchaseReport').innerHTML=`<div class="product-report-summary"><div><span>Purchase cost · ${esc(rangeLabel)}</span><strong>${money(grandTotal)}</strong></div><div><span>Products purchased</span><strong>${productCount}</strong></div></div>${rows||empty(`No product purchases found from ${esc(fmt(from))} to ${esc(fmt(to))}.`)}`;
}
function editPurchaseBill(id){
 const b=db.purchaseBills.find(x=>x.id===id);if(!b)return;
 setTab('purchaseBills');
 const hasSupplierPayments=db.supplierPayments.some(p=>p.supplier===b.supplier);
 if(hasSupplierPayments){alert('This supplier has payment history, so this bill cannot be edited safely without changing the supplier ledger.');return}
 if(db.consumptions.some(c=>c.billId===id)){alert('This bill has stock usage records. Editing it could make the inventory quantity inaccurate, so it is locked.');return}
 editingPurchaseBillId=id;purchaseBillOriginalDate=String(b.date||'');ensureOption($('purchaseSupplier'),b.supplier);$('purchaseSupplier').value=b.supplier;
 const billCategory=b.category||'Uncategorised';if(!db.purchaseCategories.includes(billCategory))db.purchaseCategories.push(billCategory);fillChoices();$('purchaseCategory').value=billCategory;
 $('purchaseBillNo').value=b.billNo||'';$('purchaseDate').value=b.date||today();$('purchaseCashPaid').value=Number(b.cashPaid||0);$('purchaseBankPaid').value=Number(b.bankPaid||0);$('purchaseTransitCost').value=Number(b.transitCost||0);$('purchaseDiscount').value=Number(b.discount||0);$('purchaseNote').value=b.note||'';
 purchaseLines=(b.lines||[]).map(l=>({lineId:l.id||null,product:l.product||'',productType:l.productType||'Other',spec:l.spec||'',quantity:Number(l.quantity||0),unit:l.unit||'pcs',rate:Number(l.rate||0),amount:Number(l.amount??(Number(l.quantity||0)*Number(l.rate||0))),amountMode:'rate',calcError:'',amountPending:false,costType:l.costType||'unassigned',costMember:l.costMember||'',costMembers:assignedMembers(l)}));
 purchaseLines.forEach(l=>{if(!db.units.includes(l.unit))db.units.push(l.unit)});renderPurchaseLines();$('purchaseBillSubmit').textContent='Update purchase bill';$('cancelPurchaseEdit').hidden=false;$('purchaseBillForm').scrollIntoView({behavior:'smooth',block:'start'});
}
$('cancelPurchaseEdit').onclick=resetPurchaseForm;
function deletePurchaseBill(id){const b=db.purchaseBills.find(x=>x.id===id);if(!b)return;if(db.supplierPayments.some(p=>p.supplier===b.supplier)){alert('This supplier has payment history. Keep the bill to preserve the supplier ledger.');return}if(db.consumptions.some(c=>c.billId===id)){alert('This bill has stock usage records. It cannot be deleted because that would break the inventory history.');return}if(confirm('Delete this purchase bill?')){db.purchaseBills=db.purchaseBills.filter(x=>x.id!==id);save()}}

function resetExpenseForm(){
 editingExpenseId=null;$('expenseForm').reset();$('expenseDate').value=today();$('quantity').value=1;
 $('dueFields').hidden=true;$('duePaidFromField').hidden=true;$('duePerson').required=false;$('expenseFormTitle').textContent='Add expense';
 $('expenseSubmitBtn').textContent='Save expense';$('cancelExpenseEdit').hidden=true;$('expenseEditHint').hidden=true;
 fillChoices();renderExpenseMemberOptions([]);calcTotal();
}
function ensureOption(select,value){
 if(value==null||value==='')return;
 const found=[...select.options].some(o=>o.value===String(value));
 if(!found){const option=document.createElement('option');option.value=String(value);option.textContent=String(value);select.appendChild(option)}
}
function editExpense(id){
 const x=db.expenses.find(item=>item.id===id);if(!x)return;
 setTab('expenseEntries');
 editingExpenseId=id;
 if(x.name&&!db.expenseNames.includes(x.name))db.expenseNames.push(x.name);
 if(x.unit&&!db.units.includes(x.unit))db.units.push(x.unit);
 fillChoices();
 renderExpenseMemberOptions(assignedMembers(x));
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
 const costMembers=selectedExpenseMembers();
 const values={amount:quantity*rate,name,quantity,unit,rate,paymentType,costType:costMembers.length?'members':'unassigned',costMember:costMembers.length===1?costMembers[0]:'',costMembers,dueDirection:paymentType==='Due'?$('dueDirection').value:null,duePerson:paymentType==='Due'?$('duePerson').value.trim():null,duePaidFrom:paymentType==='Due'&&$('dueDirection').value==='owed_to_me'?$('duePaidFrom').value:null,category:$('category').value,date:$('expenseDate').value,note:$('note').value.trim()};
 if(editingExpenseId){const existing=db.expenses.find(x=>x.id===editingExpenseId);if(existing){const settled=expenseSettledAmount(existing);if(settled>0&&(paymentType!=='Due'||quantity*rate<settled||$('dueDirection').value!==existing.dueDirection)){alert('This due already has payments or collections. Keep the Due type and direction, and set the amount to at least the amount already settled.');return}Object.assign(existing,values)}}
 else db.expenses.unshift({id:crypto.randomUUID(),...values});
 resetExpenseForm();save()};
function openExpenseDueAction(id){
 const x=db.expenses.find(item=>item.id===id);if(!x||expenseOutstanding(x)<=0)return;
 setTab('payExpenseDue');
 settlingExpenseId=id;const action=x.dueDirection==='i_owe'?'Pay due':'Collect due';
 $('expenseDueActionLabel').textContent=`${action}: ${x.duePerson||'Unknown person'} · ${x.name||x.category||'Expense'}`;
 $('expenseDueRemaining').textContent=`Remaining: ${money(expenseOutstanding(x))}`;$('expenseDueActionAmount').value=expenseOutstanding(x).toFixed(2);$('expenseDueActionAmount').max=expenseOutstanding(x).toFixed(2);
 $('expenseDueActionDate').value=today();$('expenseDueActionMethod').value='Cash';$('expenseDueActionNote').value='';$('expenseDueActionSubmit').textContent=action;
 $('expenseDueActionForm').hidden=false;$('expenseDueActionForm').scrollIntoView({behavior:'smooth',block:'center'});
}
function renderExpenseDueList(){
 const list=$('expenseDueList');if(!list)return;
 const items=db.expenses.filter(x=>x.paymentType==='Due'&&expenseOutstanding(x)>0.000001&&['i_owe','owed_to_me'].includes(x.dueDirection)).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
 list.innerHTML=items.length?items.map(x=>{
  const action=x.dueDirection==='i_owe'?'Pay due':'Collect due';
  const label=x.dueDirection==='i_owe'?'I owe':'Owed to me';
  return `<article class="item due-action-row"><div class="item-main"><div class="item-title">${esc(x.name||x.category||'Expense')} · ${esc(x.duePerson||'Unknown person')}</div><div class="item-sub">${esc(label)} · ${fmt(x.date)} · ${esc(x.paymentType||'Due')}</div></div><div class="expense-right"><div class="item-amount">${money(expenseOutstanding(x))}</div><button type="button" class="collect-btn" data-settle-expense="${esc(x.id)}">${action}</button></div></article>`;
 }).join(''):empty('No outstanding expense dues.');
 list.querySelectorAll('[data-settle-expense]').forEach(button=>button.onclick=()=>openExpenseDueAction(button.dataset.settleExpense));
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

function salesStockKey(product,unit){return `${String(product||'').trim().toLocaleLowerCase()}|||${String(unit||'pcs').trim().toLocaleLowerCase()}`}
function salesStockValue(product,unit){return encodeURIComponent(JSON.stringify([product,unit]))}
function decodeSalesStockValue(value){try{const parsed=JSON.parse(decodeURIComponent(value));return Array.isArray(parsed)?{product:String(parsed[0]||''),unit:String(parsed[1]||'pcs')}:{product:'',unit:'pcs'}}catch{return {product:'',unit:'pcs'}}}
function buildSalesStockBuckets(excludeMemoId=null,asOfDate=null){
 const buckets=new Map(),lots=[];
 stockSourceRecords().forEach(record=>{
  if(asOfDate&&String(record.date||'')>asOfDate)return;
  const used=usedStockQuantity(record,{excludeMemoId,asOfDate});
  const remaining=Math.max(0,Number(record.quantity||0)-used);if(remaining<=0.000001)return;
  lots.push({billId:record.billId,lineId:record.lineId,product:record.product,unit:record.unit,remaining,date:record.date,costPerUnit:record.quantity>0?record.amount/record.quantity:0,costMembers:record.costMembers,sourceType:record.sourceType});
 });
 lots.sort((a,b)=>a.date.localeCompare(b.date)||String(a.billId).localeCompare(String(b.billId)));
 lots.forEach(lot=>{
  const key=salesStockKey(lot.product,lot.unit);let bucket=buckets.get(key);
  if(!bucket){bucket={key,product:lot.product,unit:lot.unit,available:0,lots:[]};buckets.set(key,bucket)}
  bucket.available+=lot.remaining;bucket.lots.push(lot);
 });
 return buckets;
}

function defaultSalesMemoLine(){return {product:'',unit:'pcs',quantity:1,rate:0}}
function salesMemoLineAmount(line){return Math.round((Number(line.quantity||0)*Number(line.rate||0))*100)/100}
function salesMemoLineTemplate(line,index,buckets){
 const selectedKey=line.product?salesStockKey(line.product,line.unit):'';
 const options=[...buckets.values()].map(bucket=>`<option value="${salesStockValue(bucket.product,bucket.unit)}" ${bucket.key===selectedKey?'selected':''}>${esc(bucket.product)} · ${numberText(bucket.available)} ${esc(bucket.unit)} available</option>`).join('');
 return `<article class="sales-memo-line" data-sales-line="${index}">
  <div class="sales-memo-line-head"><strong>Product ${index+1}</strong><button type="button" class="delete sm-remove-line" ${salesMemoLines.length===1?'disabled':''}>Remove</button></div>
  <label>Product <select class="sm-product" required><option value="">Select available inventory</option>${options}</select></label>
  <div class="form-grid"><label>Quantity <input class="sm-quantity" type="number" min="0.000001" step="any" value="${Number(line.quantity||1)}" required></label><label>Unit <input class="sm-unit" value="${esc(line.unit||'pcs')}" readonly></label></div>
  <div class="form-grid"><label>Sale rate per unit <input class="sm-rate" type="number" min="0.01" step="any" value="${Number(line.rate||0)}" required></label><div class="sales-line-amount"><span>Line amount</span><strong>${money(salesMemoLineAmount(line))}</strong></div></div>
 </article>`;
}
function renderSalesMemoLines(){
 const wrap=$('salesMemoLines');if(!wrap)return;
 const buckets=buildSalesStockBuckets(editingSalesMemoId,$('salesMemoDate')?.value||today());
 wrap.innerHTML=salesMemoLines.map((line,index)=>salesMemoLineTemplate(line,index,buckets)).join('');
 wrap.querySelectorAll('.sales-memo-line').forEach((node,index)=>{
  const line=salesMemoLines[index];if(!line)return;
  const product=node.querySelector('.sm-product'),quantity=node.querySelector('.sm-quantity'),rate=node.querySelector('.sm-rate');
  product.onchange=()=>{const selected=decodeSalesStockValue(product.value);line.product=selected.product;line.unit=selected.unit;node.querySelector('.sm-unit').value=selected.unit;updateSalesMemoTotals();};
  quantity.oninput=()=>{line.quantity=Number(quantity.value)||0;updateSalesMemoTotals()};
  rate.oninput=()=>{line.rate=Number(rate.value)||0;updateSalesMemoTotals()};
  node.querySelector('.sm-remove-line').onclick=()=>{if(salesMemoLines.length<=1)return;salesMemoLines.splice(index,1);renderSalesMemoLines();updateSalesMemoTotals()};
 });
 updateSalesMemoTotals();
}
function updateSalesMemoTotals(){
 const total=salesMemoLines.reduce((t,line)=>t+salesMemoLineAmount(line),0);
 if($('salesMemoTotal'))$('salesMemoTotal').textContent=money(total);
 document.querySelectorAll('.sales-memo-line').forEach((node,index)=>{const strong=node.querySelector('.sales-line-amount strong');if(strong&&salesMemoLines[index])strong.textContent=money(salesMemoLineAmount(salesMemoLines[index]))});
}
function nextSalesMemoNo(date,excludeId=null){
 const match=/^(\d{4})-(\d{2})-\d{2}$/.exec(String(date||''));if(!match)return '';
 const prefix=`SM-${match[2]}-${match[1]}`,used=new Set();let highest=0;
 db.incomes.forEach(item=>{if(excludeId&&item.id===excludeId)return;const value=String(item.salesMemo?.memoNo||'').trim();if(!value)return;used.add(value.toLocaleLowerCase());const found=new RegExp(`^${prefix}-(\\d+)$`,'i').exec(value);if(found)highest=Math.max(highest,Number(found[1])||0)});
 let sequence=highest+1,candidate=`${prefix}-${sequence}`;while(used.has(candidate.toLocaleLowerCase())){sequence++;candidate=`${prefix}-${sequence}`}return candidate;
}
function resetSalesMemoForm(){
 editingSalesMemoId=null;salesMemoLines=[defaultSalesMemoLine()];$('salesMemoForm').reset();$('salesMemoDate').value=today();$('salesMemoNo').value=nextSalesMemoNo(today());
 const preferred=db.profile.name&&db.incomePeople.includes(db.profile.name)?db.profile.name:(db.incomePeople[0]||'');$('salesMemoBy').value=preferred;
 $('salesMemoFormTitle').textContent='Create sales memo';$('salesMemoSubmit').textContent='Save sales memo';$('cancelSalesMemoEdit').hidden=true;$('salesMemoEditHint').hidden=true;
 renderSalesMemoLines();
}
function openSalesMemoForm(){resetSalesMemoForm();$('salesMemoWrap').hidden=false;$('salesMemoForm').scrollIntoView({behavior:'smooth',block:'start'});}
$('toggleSalesMemoForm').onclick=()=>{if($('salesMemoWrap').hidden)openSalesMemoForm();else{$('salesMemoWrap').hidden=true;resetSalesMemoForm()}};
$('addSalesMemoLine').onclick=()=>{salesMemoLines.push(defaultSalesMemoLine());renderSalesMemoLines()};
$('salesMemoDate').onchange=()=>{
 const old=editingSalesMemoId?db.incomes.find(x=>x.id===editingSalesMemoId):null;
 $('salesMemoNo').value=old&&old.date===$('salesMemoDate').value&&old.salesMemo.memoNo?old.salesMemo.memoNo:nextSalesMemoNo($('salesMemoDate').value,editingSalesMemoId);
 renderSalesMemoLines();
};
$('cancelSalesMemoEdit').onclick=()=>{resetSalesMemoForm();$('salesMemoWrap').hidden=true};
function editSalesMemo(id){
 const x=db.incomes.find(item=>item.id===id&&item.salesMemo);if(!x)return;
 editingSalesMemoId=id;$('salesMemoWrap').hidden=false;
 $('salesMemoCustomer').value=x.salesMemo.customerName||'';$('salesMemoPhone').value=x.salesMemo.customerPhone||'';$('salesMemoAddress').value=x.salesMemo.customerAddress||'';
 $('salesMemoDate').value=x.date||today();$('salesMemoNo').value=x.salesMemo.memoNo||nextSalesMemoNo(x.date,id);$('salesMemoBy').value=x.incomeBy||db.profile.name||db.incomePeople[0]||'';
 $('salesMemoPayment').value=x.paymentType||'Cash';$('salesMemoNote').value=x.note||'';
 salesMemoLines=(x.salesMemo.items||[]).map(item=>({product:item.product||'',unit:item.unit||'pcs',quantity:Number(item.quantity||0),rate:Number(item.rate||0)}));
 if(!salesMemoLines.length)salesMemoLines=[defaultSalesMemoLine()];
 $('salesMemoFormTitle').textContent=`Edit sales memo ${x.salesMemo.memoNo||''}`;$('salesMemoSubmit').textContent='Update sales memo';$('cancelSalesMemoEdit').hidden=false;$('salesMemoEditHint').hidden=false;
 renderSalesMemoLines();$('salesMemoForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function allocateSalesStock(items,excludeMemoId=null){
 const buckets=buildSalesStockBuckets(excludeMemoId,$('salesMemoDate').value),consumptions=[];
 for(const item of items){
  const bucket=buckets.get(salesStockKey(item.product,item.unit));if(!bucket)return {error:`${item.product} (${item.unit}) is no longer available in Inventory.`};
  let remaining=Number(item.quantity||0);
  for(const lot of bucket.lots){if(remaining<=0.000001)break;if(lot.remaining<=0.000001)continue;const take=Math.min(remaining,lot.remaining);lot.remaining-=take;remaining-=take;consumptions.push({billId:lot.billId,lineId:lot.lineId,quantity:Number(take.toFixed(6))})}
  if(remaining>0.000001)return {error:`Not enough stock for ${item.product}. Available: ${numberText(bucket.available)} ${item.unit}; requested: ${numberText(item.quantity)} ${item.unit}.`};
 }
 return {consumptions};
}
$('salesMemoForm').onsubmit=e=>{
 e.preventDefault();
 const date=$('salesMemoDate').value,customerName=$('salesMemoCustomer').value.trim(),incomeBy=$('salesMemoBy').value.trim(),paymentType=$('salesMemoPayment').value;
 const items=salesMemoLines.map(line=>({product:String(line.product||'').trim(),unit:String(line.unit||'pcs').trim()||'pcs',quantity:Number(line.quantity),rate:Number(line.rate),amount:salesMemoLineAmount(line)}));
 if(!date||!customerName||!incomeBy){alert('Enter the sales date, customer name and person who prepared the memo.');return}
 if(!items.length||items.some(item=>!item.product||!(item.quantity>0)||!(item.rate>0)||!Number.isFinite(item.quantity)||!Number.isFinite(item.rate)||!(item.amount>0))){alert('Select an inventory product and enter a valid quantity and sale rate for every line.');return}
 const old=editingSalesMemoId?db.incomes.find(x=>x.id===editingSalesMemoId):null;
 if(old&&incomeCollections(old).length&&(paymentType!=='Due'||items.reduce((t,x)=>t+x.amount,0)<collectedAmount(old)-0.000001)){alert('This sales memo already has collections. Keep it as Due and set the memo total to at least the amount already collected.');return}
 const allocated=allocateSalesStock(items,editingSalesMemoId);if(allocated.error){alert(allocated.error);return}
 const amount=items.reduce((t,item)=>t+item.amount,0);
 const memoNo=old&&date===old.date&&old.salesMemo.memoNo?String(old.salesMemo.memoNo):nextSalesMemoNo(date,editingSalesMemoId);
 if(!memoNo){alert('Select a valid sales date to generate the memo number.');return}
 if(db.incomes.some(x=>x.id!==editingSalesMemoId&&String(x.salesMemo?.memoNo||'').toLocaleLowerCase()===memoNo.toLocaleLowerCase())){alert('This sales memo number already exists. Please save again to generate a new number.');return}
 const id=old?old.id:crypto.randomUUID();
 const values={source:'Sales',incomeBy,amount,paymentType,duePerson:paymentType==='Due'?customerName:null,date,note:$('salesMemoNote').value.trim(),salesMemo:{memoNo,customerName,customerPhone:$('salesMemoPhone').value.trim(),customerAddress:$('salesMemoAddress').value.trim(),items}};
 db.consumptions=db.consumptions.filter(c=>c.salesMemoId!==id);
 allocated.consumptions.forEach(c=>db.consumptions.push({id:crypto.randomUUID(),...c,salesMemoId:id,salesMemoNo:memoNo,date}));
 if(old){Object.assign(old,values);if(paymentType!=='Due')old.collections=[]}else db.incomes.unshift({id,...values,collections:[]});
 if(!db.incomeHeads.includes('Sales'))db.incomeHeads.push('Sales');if(!db.incomePeople.includes(incomeBy))db.incomePeople.push(incomeBy);
 resetSalesMemoForm();$('salesMemoWrap').hidden=true;save();
};
function renderSalesMemoList(){
 const list=$('salesMemoList');if(!list)return;
 const memos=db.incomes.filter(x=>x.salesMemo).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 $('salesMemoCount').textContent=`${memos.length} ${memos.length===1?'memo':'memos'}`;
 list.innerHTML=memos.length?memos.map(x=>{
  const memo=x.salesMemo,remaining=incomeOutstanding(x),status=x.paymentType==='Due'?(remaining<=0.000001?'Paid':collectedAmount(x)>0?'Partly paid':'Due'):x.paymentType;
  const count=(memo.items||[]).length;
  return `<article class="sales-memo-row"><div class="item-main"><strong>${esc(memo.memoNo||'Sales memo')}</strong><small>${fmt(x.date)} · ${esc(memo.customerName||'Customer')} · ${count} product ${count===1?'line':'lines'} · ${esc(status||'Paid')}</small></div><strong class="sales-memo-total">${money(x.amount)}</strong><div class="sales-memo-actions"><button type="button" class="edit-btn" data-print-sales="${esc(x.id)}">Print</button><button type="button" class="edit-btn" data-edit-sales="${esc(x.id)}">Edit</button><button type="button" class="delete" data-delete-sales="${esc(x.id)}" aria-label="Delete sales memo ${esc(memo.memoNo||'')}">×</button></div></article>`;
 }).join(''):empty('No sales memos yet. Select New sales memo to record a product sale.');
 list.querySelectorAll('[data-print-sales]').forEach(button=>button.onclick=()=>printSalesMemo(button.dataset.printSales));
 list.querySelectorAll('[data-edit-sales]').forEach(button=>button.onclick=()=>editSalesMemo(button.dataset.editSales));
 list.querySelectorAll('[data-delete-sales]').forEach(button=>button.onclick=()=>deleteIncome(button.dataset.deleteSales));
}
function printSalesMemo(id){
 const x=db.incomes.find(item=>item.id===id&&item.salesMemo);if(!x)return;
 const popup=window.open('','_blank','width=900,height=800');if(!popup){alert('Please allow pop-ups to print the sales memo.');return}
 const memo=x.salesMemo,brand=db.profile.familyName||'DayQuest',seller=db.profile.name||brand,phone=db.profile.phone||'',items=(memo.items||[]).map((item,index)=>`<tr><td>${index+1}</td><td>${esc(item.product)}</td><td class="num">${numberText(item.quantity)} ${esc(item.unit||'pcs')}</td><td class="num">${money(item.rate)}</td><td class="num">${money(item.amount)}</td></tr>`).join('');
 const paid=x.paymentType==='Due'?collectedAmount(x):Number(x.amount||0),due=x.paymentType==='Due'?incomeOutstanding(x):0;
 popup.document.open();popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(memo.memoNo||'Sales Memo')}</title><style>@page{size:A4;margin:16mm}*{box-sizing:border-box}body{font:14px Arial,sans-serif;color:#172033;margin:0}.sheet{max-width:780px;margin:0 auto}.head{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #263b5c;padding-bottom:16px}.brand{font-size:22px;font-weight:800;color:#263b5c}.sub{color:#687386;font-size:11px;margin-top:5px}.memo-title{text-align:right}.memo-title h1{font-size:24px;margin:0 0 7px}.memo-title strong{font-size:14px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;margin:18px 0 22px;font-size:12px}.meta div{padding:7px 0;border-bottom:1px solid #edf0f4}.meta b{display:block;font-size:10px;color:#7b8798;margin-bottom:4px;text-transform:uppercase}.table{width:100%;border-collapse:collapse;font-size:12px}.table th{background:#f0f3f8;text-align:left;color:#536176}.table th,.table td{padding:10px 8px;border-bottom:1px solid #e7ebf1}.num{text-align:right;white-space:nowrap}.total-box{margin:18px 0 0 auto;width:270px}.total-box div{display:flex;justify-content:space-between;padding:7px 0;font-size:12px}.total-box .grand{font-size:17px;font-weight:800;border-top:2px solid #263b5c;margin-top:5px;padding-top:11px}.note{margin-top:18px;color:#667286;font-size:11px}.sign{display:flex;justify-content:space-between;gap:70px;margin-top:68px}.sign div{border-top:1px solid #8b95a5;padding-top:8px;width:45%;text-align:center;font-size:11px;color:#637087}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><main class="sheet"><header class="head"><div><div class="brand">${esc(brand)}</div><div class="sub">${esc(seller)}${phone?` · ${esc(phone)}`:''}</div></div><div class="memo-title"><h1>SALES MEMO</h1><strong>${esc(memo.memoNo||'')}</strong></div></header><section class="meta"><div><b>Customer</b>${esc(memo.customerName||'Walk-in customer')}</div><div><b>Memo date</b>${fmt(x.date)}</div><div><b>Phone</b>${esc(memo.customerPhone||'—')}</div><div><b>Prepared by</b>${esc(x.incomeBy||seller)}</div><div style="grid-column:1/-1"><b>Address</b>${esc(memo.customerAddress||'—')}</div></section><table class="table"><thead><tr><th>#</th><th>Product</th><th class="num">Quantity</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead><tbody>${items}</tbody></table><section class="total-box"><div><span>Payment method</span><strong>${esc(x.paymentType||'Cash')}</strong></div><div><span>Received</span><strong>${money(paid)}</strong></div>${due?`<div><span>Balance due</span><strong>${money(due)}</strong></div>`:''}<div class="grand"><span>Total</span><strong>${money(x.amount)}</strong></div></section>${x.note?`<p class="note">Note: ${esc(x.note)}</p>`:''}<section class="sign"><div>Customer signature</div><div>Authorized signature</div></section></main><script>window.addEventListener('load',()=>window.print());<\/script></body></html>`);popup.document.close();popup.focus();
}

function resetIncomeForm(){
 editingIncomeId=null;$('incomeForm').reset();$('incomeDate').value=today();if($('incomeSource').options.length)$('incomeSource').selectedIndex=0;
 const preferred=db.profile.name&&db.incomePeople.includes(db.profile.name)?db.profile.name:(db.incomePeople[0]||'Unassigned');$('incomeBy').value=preferred;
 $('incomeDueFields').hidden=true;$('incomeDuePerson').required=false;
 $('incomeFormTitle').textContent='Add income';$('incomeSubmitBtn').textContent='Save income';$('cancelIncomeEdit').hidden=true;$('incomeEditHint').hidden=true;$('incomeTotalPreview').textContent=money(0);
}
function editIncome(id){
 const x=db.incomes.find(item=>item.id===id);if(!x)return;if(x.salesMemo){editSalesMemo(id);return;}
 editingIncomeId=id;ensureOption($('incomeSource'),x.source||'Other');$('incomeSource').value=x.source||'Other';
 const earner=x.incomeBy||'Unassigned';ensureOption($('incomeBy'),earner);$('incomeBy').value=earner;
 $('incomeAmount').value=Number(x.amount||0);$('incomePaymentType').value=x.paymentType||'Cash';
 $('incomeDuePerson').value=x.duePerson||'';$('incomeDueFields').hidden=$('incomePaymentType').value!=='Due';$('incomeDuePerson').required=$('incomePaymentType').value==='Due';
 $('incomeDate').value=x.date||today();$('incomeNote').value=x.note||'';$('incomeTotalPreview').textContent=money(x.amount||0);
 $('incomeFormTitle').textContent='Edit income';$('incomeSubmitBtn').textContent='Update income';$('cancelIncomeEdit').hidden=false;$('incomeEditHint').hidden=false;
 $('incomeForm').scrollIntoView({behavior:'smooth',block:'start'});
}
$('cancelIncomeEdit').onclick=resetIncomeForm;
$('incomeForm').onsubmit=e=>{
 e.preventDefault();const source=$('incomeSource').value.trim(),incomeBy=$('incomeBy').value.trim(),amount=Number($('incomeAmount').value),paymentType=$('incomePaymentType').value,duePerson=$('incomeDuePerson').value.trim();
 if(!source||!incomeBy||!(amount>0)||!Number.isFinite(amount)){alert('Select an income type, the person who earned it, and a valid amount.');return}
 if(paymentType==='Due'&&!duePerson){alert('Enter the customer or person who owes you.');$('incomeDuePerson').focus();return}
 if(!db.incomePeople.includes(incomeBy))db.incomePeople.push(incomeBy);
 const values={source,incomeBy,amount,paymentType,duePerson:paymentType==='Due'?duePerson:null,date:$('incomeDate').value,note:$('incomeNote').value.trim()};
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
function deleteIncome(id){const item=db.incomes.find(x=>x.id===id);if(!item)return;const message=item.salesMemo?'Delete this sales memo and its collection history? Sold inventory quantities will be returned to stock.':'Delete this income entry and its collection history?';if(confirm(message)){if(collectingIncomeId===id)closeCollectForm();if(editingIncomeId===id)resetIncomeForm();if(editingSalesMemoId===id){resetSalesMemoForm();$('salesMemoWrap').hidden=true}if(item.salesMemo)db.consumptions=db.consumptions.filter(c=>c.salesMemoId!==id);db.incomes=db.incomes.filter(x=>x.id!==id);save()}}
$('incomeDateFilter').onchange=render;
$('incomeHeadFilter').onchange=render;
$('incomePersonFilter').onchange=render;
$('reportIncomePersonFilter').onchange=renderReport;
$('productReportFromDate').onchange=renderReport;
$('productReportToDate').onchange=renderReport;
$('memberProductFilter').onchange=renderReport;
function activateReportSection(key){
 const known=['members','production','cost','income','creditors','debitors','assets','purchase'];
 const selected=key==='all'?'all':(known.includes(key)?key:'members');
 document.querySelectorAll('[data-report-go]').forEach(item=>item.classList.toggle('active',item.dataset.reportGo===selected));
 document.querySelectorAll('[data-report-pane]').forEach(pane=>{pane.hidden=selected!=='all'&&pane.dataset.reportPane!==selected});
 const group=document.querySelector('[data-side-group="reports"]');if(group){group.open=true;group.classList.add('has-active')}
 const target=selected==='all'?document.querySelector('[data-report-pane="purchase"]'):document.querySelector(`[data-report-pane="${selected}"]`);
 if(target&&$('reports')?.classList.contains('active'))target.scrollIntoView({behavior:'smooth',block:'start'});
}
document.querySelectorAll('[data-report-go]').forEach(button=>button.addEventListener('click',()=>{
 setTab('reports');activateReportSection(button.dataset.reportGo);
}));
function applyThemeColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const normalized=String(color).toLowerCase();document.documentElement.style.setProperty('--accent-color',normalized);
 const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=normalized;
 if($('themeColorInput'))$('themeColorInput').value=normalized;
 if($('themeColorValue'))$('themeColorValue').textContent=normalized.toUpperCase();
 if(persist){db.settings=db.settings||{};db.settings.themeColor=normalized;localSaveOnly()}
}
function renderPurchaseCategorySettings(){
 const list=$('purchaseCategoryList');if(!list)return;
 list.innerHTML=db.purchaseCategories.map((name,index)=>`<div class="category-setting-row"><span><strong>${esc(name)}</strong><small>Used on purchase bills and reports</small></span><div><button type="button" class="edit-btn" data-rename-category="${index}">Rename</button><button type="button" class="delete" data-delete-category="${index}" aria-label="Delete ${esc(name)}">×</button></div></div>`).join('')||empty('No purchase categories. Add one above.');
 list.querySelectorAll('[data-rename-category]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.renameCategory),old=db.purchaseCategories[index];if(!old)return;
  const raw=prompt('Rename purchase category:',old);if(raw===null)return;const next=raw.trim();if(!next){alert('Category name cannot be empty.');return}
  if(db.purchaseCategories.some((name,i)=>i!==index&&name.toLowerCase()===next.toLowerCase())){alert('That purchase category already exists.');return}
  db.purchaseBills.forEach(b=>{if((b.category||'Uncategorised')===old)b.category=next});db.purchaseCategories[index]=next;fillChoices();renderPurchaseCategorySettings();save();
 });
 list.querySelectorAll('[data-delete-category]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.deleteCategory),name=db.purchaseCategories[index];if(!name)return;
  if(db.purchaseBills.some(b=>(b.category||'Uncategorised')===name)){alert('This category is used by saved purchase bills. Rename it instead, or move those bills to another category before deleting.');return}
  if(confirm(`Delete the purchase category “${name}”?`)){db.purchaseCategories.splice(index,1);fillChoices();renderPurchaseCategorySettings();save()}
 });
}
$('themeColorInput').oninput=e=>applyThemeColor(e.target.value);
document.querySelectorAll('[data-theme-color]').forEach(button=>button.onclick=()=>applyThemeColor(button.dataset.themeColor));
$('addPurchaseCategoryForm').onsubmit=e=>{
 e.preventDefault();const name=$('newPurchaseCategory').value.trim();if(!name)return;
 if(db.purchaseCategories.some(item=>item.toLowerCase()===name.toLowerCase())){alert('That purchase category already exists.');return}
 db.purchaseCategories.push(name);$('newPurchaseCategory').value='';fillChoices();renderPurchaseCategorySettings();save();
};
$('clearIncomeDate').onclick=()=>{$('incomeDateFilter').value='';render()};
function updateProfilePhotoPreview(){
 const image=$('profilePhotoPreview'),fallback=$('profilePhotoFallback'),photo=db.profile.photoData||'';
 if(image){image.src=photo;image.hidden=!photo}
 if(fallback){fallback.hidden=!!photo;fallback.textContent=(db.profile.name||db.profile.familyName||'DQ').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'DQ'}
}
function updateAppBrand(){
 const familyName=String($('familyName')?.value ?? db.profile?.familyName ?? '').trim();
 const title=familyName?`${familyName} DayQuest`:'DayQuest';
 const sideTitle=$('sidebarBrandTitle'),sideSubtitle=$('sidebarBrandSubtitle');
 if(sideTitle)sideTitle.textContent=title;
 if(sideSubtitle)sideSubtitle.textContent=familyName?'Family dashboard':'Personal dashboard';
 document.title=title;
 const authTitle=$('authTitle');if(authTitle)authTitle.textContent=title;
}
function renderFamilyMembers(){
 const list=$('familyMemberList');if(!list)return;
 list.innerHTML=db.familyMembers.map((name,index)=>`<div class="family-member-row"><span class="family-member-avatar">${esc(name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase())}</span><span class="family-member-name"><strong>${esc(name)}</strong><small>Available in Income By</small></span><button type="button" class="delete" data-remove-family-member="${index}" aria-label="Remove ${esc(name)}">×</button></div>`).join('')||empty('No family members added yet.');
 list.querySelectorAll('[data-remove-family-member]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.removeFamilyMember),name=db.familyMembers[index];if(!name)return;
  if(!confirm(`Remove ${name} from the family member list? Past income records will keep this person's name.`))return;
  db.familyMembers.splice(index,1);renderFamilyMembers();fillChoices();save();
 });
}
function loadProfileForm(){
 $('profileName').value=db.profile.name||'';$('profilePhone').value=db.profile.phone||'';$('familyName').value=db.profile.familyName||'';
 $('openingCash').value=Number(db.profile.openingCash||0);$('openingBank').value=Number(db.profile.openingBank||0);
 updateAppBrand();updateProfilePhotoPreview();renderFamilyMembers();
}
$('profilePhotoInput').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 if(!file.type.startsWith('image/')){alert('Choose an image file.');e.target.value='';return}
 if(file.size>10*1024*1024){alert('Choose an image smaller than 10 MB.');e.target.value='';return}
 const objectUrl=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{
  try{
   const max=480,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);
   db.profile.photoData=canvas.toDataURL('image/jpeg',0.82);updateProfilePhotoPreview();localSaveOnly();
  }catch{alert('Could not process this image. Try another photo.')}
  URL.revokeObjectURL(objectUrl);
 };
 img.onerror=()=>{URL.revokeObjectURL(objectUrl);alert('Could not open this image. Try another photo.')};img.src=objectUrl;
};
$('removeProfilePhoto').onclick=()=>{db.profile.photoData='';$('profilePhotoInput').value='';updateProfilePhotoPreview();localSaveOnly()};
$('familyName').addEventListener('input',updateAppBrand);
$('addFamilyMember').onclick=()=>{
 const input=$('newFamilyMember'),name=input.value.trim();if(!name){alert('Enter a family member name.');input.focus();return}
 if(db.familyMembers.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())){alert('This family member is already listed.');return}
 db.familyMembers.push(name);if(!db.incomePeople.includes(name))db.incomePeople.push(name);
 input.value='';renderFamilyMembers();fillChoices();save();
};
$('profileForm').onsubmit=e=>{
 e.preventDefault();const openingCash=Number($('openingCash').value),openingBank=Number($('openingBank').value);
 if(!Number.isFinite(openingCash)||openingCash<0||!Number.isFinite(openingBank)||openingBank<0){alert('Opening balances must be zero or greater.');return}
 const name=$('profileName').value.trim();
 db.profile={...db.profile,name,phone:$('profilePhone').value.trim(),familyName:$('familyName').value.trim(),openingCash,openingBank};
 if(name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase()))db.familyMembers.unshift(name);
 if(name&&!db.incomePeople.includes(name))db.incomePeople.unshift(name);
 fillChoices();renderFamilyMembers();updateProfilePhotoPreview();save();alert('Family profile and starting balances saved.');
};

function renderGuestMemberControls(){fillGuestMemberOptions(selectedGuestMembers());renderExpenseMemberOptions(selectedExpenseMembers())}
$('addGuestName').onclick=()=>{
 const input=$('newGuestName'),name=input.value.trim();if(!name){alert('Enter a guest name.');input.focus();return}
 if(assignablePeople().some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())){alert('That name is already available in the member list.');return}
 db.guestPeople.push(name);input.value='';renderGuestMemberControls();fillChoices();save();
};
$('guestForm').onsubmit=e=>{
 e.preventDefault();const members=selectedGuestMembers(),entryDate=$('guestEntryDate').value,purpose=$('guestPurpose').value.trim();
 if(!members.length){alert('Select at least one guest member.');return}
 if(!entryDate){alert('Choose the guest entry date.');return}
 db.guests.unshift({id:crypto.randomUUID(),entryDate,outDate:'',members,purpose});
 $('guestForm').reset();$('guestEntryDate').value=today();fillGuestMemberOptions([]);renderGuestReport();save();
};
$('guestEntryDate').value=today();

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
 let d=today(),exToday=db.expenses.filter(x=>x.date===d),billsToday=db.purchaseBills.filter(x=>x.date===d),qToday=dayQuests(d),done=qToday.filter(q=>completed(q,d)).length;
 $('todayTotal').textContent=money(sum(exToday)+billsToday.reduce((t,b)=>t+billTotal(b),0));$('questProgress').textContent=`${done}/${qToday.length}`;$('questBar').style.width=(qToday.length?done/qToday.length*100:0)+'%';$('todayQuestLabel').textContent=`${done} quests done`;
 let ws=startWeek(d),ms=d.slice(0,7);$('weekTotal').textContent=money(sum(db.expenses.filter(x=>x.date>=ws&&x.date<=d))+db.purchaseBills.filter(b=>b.date>=ws&&b.date<=d).reduce((t,b)=>t+billTotal(b),0));$('monthTotal').textContent=money(sum(db.expenses.filter(x=>x.date.startsWith(ms)))+db.purchaseBills.filter(b=>b.date.startsWith(ms)).reduce((t,b)=>t+billTotal(b),0));
 $('todayIncome').textContent=money(db.incomes.reduce((t,x)=>t+incomeReceivedOn(x,d),0));$('monthIncome').textContent=money(incomeReceivedBetween(ms+'-01',d));showBalances();
 renderRecentExpenses();
 $('recentIncome').innerHTML=incomeHTML([...db.incomes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('todayQuests').innerHTML=questHTML(qToday.slice(0,4),false);
 $('expenseCount').textContent=`${db.expenses.length} expenses · ${db.purchaseBills.length} bills`;
 let filtered=db.expenses.filter(x=>( $('expenseFilter').value==='all'||x.category===$('expenseFilter').value)&&(`${x.note} ${x.category}`).toLowerCase().includes($('expenseSearch').value.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
 $('expenseList').innerHTML=expenseHTML(filtered,true);$('questList').innerHTML=questHTML(dayQuests(d),true);renderSupplierAccounts();renderInventory();renderProductionList();renderExpenseDueList();renderGuestReport();
 $('questSummary').textContent=`${done}/${qToday.length} completed`;$('incomeCount').textContent=`${db.incomes.length} entries`;
 const incomeFilter=$('incomeDateFilter').value,incomeHead=$('incomeHeadFilter').value,incomePerson=$('incomePersonFilter').value;const incomes=[...db.incomes].filter(x=>(!incomeFilter||x.date===incomeFilter)&&(incomeHead==='all'||(x.source||'Other')===incomeHead)&&(incomePerson==='all'||(x.incomeBy||'Unassigned')===incomePerson)).sort((a,b)=>b.date.localeCompare(a.date));$('incomeList').innerHTML=incomeHTML(incomes,true);renderSalesMemoList();
}
function renderRecentExpenses(){
 const rows=[];
 db.expenses.forEach(expense=>rows.push({kind:'expense',date:String(expense.date||''),expense}));
 db.purchaseBills.forEach(bill=>(bill.lines||[]).forEach(line=>rows.push({kind:'purchase',date:String(bill.date||''),bill,line})));
 rows.sort((a,b)=>b.date.localeCompare(a.date)||String(b.bill?.id||b.expense?.id||'').localeCompare(String(a.bill?.id||a.expense?.id||'')));
 const recent=rows.slice(0,6),list=$('recentExpenses');
 list.innerHTML=recent.length?recent.map(item=>{
  if(item.kind==='purchase'){
   const {bill,line}=item,amount=purchaseLineCost(bill,line);
   return `<button type="button" class="recent-purchase-row" data-recent-purchase="${esc(bill.id)}" data-recent-line="${esc(line.id)}" aria-label="Open ${esc(line.product||'Product')} bill and inventory"><span class="recent-purchase-main"><strong>${esc(line.product||'Product')}</strong><small>${fmt(item.date)} · ${numberText(line.quantity)} ${esc(line.unit||'pcs')} · Purchase</small></span><strong class="recent-purchase-cost">${money(amount)}</strong></button>`;
  }
  const x=item.expense,title=x.name||x.note||x.category||'Expense';
  return `<div class="item expense-item"><div class="item-main"><div class="item-title">${esc(title)}</div><div class="item-sub">${fmt(item.date)} · Expense${x.note&&x.note!==title?` · ${esc(x.note)}`:''}</div></div><div class="item-amount">${money(x.amount)}</div></div>`;
 }).join(''):empty('No expenses or purchase products yet.');
 list.querySelectorAll('[data-recent-purchase]').forEach(button=>button.onclick=()=>openRecentPurchase(button.dataset.recentPurchase,button.dataset.recentLine));
}
function openRecentPurchase(billId,lineId){
 setTab('purchaseBills');
 const details=document.getElementById(`purchase-bill-detail-${billId}`);if(details)details.open=true;
 const target=document.getElementById(`purchase-bill-line-${lineId}`)||document.getElementById(`purchase-bill-${billId}`);
 document.querySelectorAll('.recent-purchase-target').forEach(el=>el.classList.remove('recent-purchase-target'));
 target?.classList.add('recent-purchase-target');target?.scrollIntoView({behavior:'smooth',block:'center'});
}
function openInventoryLine(stockRef){
 setTab('inventory');
 let key=String(stockRef||'');if(!key.includes('::')){const record=stockSourceRecords().find(item=>item.lineId===key);if(record)key=record.stockRef}
 const target=document.getElementById(`inventory-record-${encodeURIComponent(key)}`);
 document.querySelectorAll('.recent-purchase-target').forEach(el=>el.classList.remove('recent-purchase-target'));
 target?.classList.add('recent-purchase-target');target?.scrollIntoView({behavior:'smooth',block:'center'});
}
function expenseHTML(items,actions){return items.length?items.map(x=>{let title=x.name||x.note||x.category,settled=expenseSettledAmount(x),remaining=expenseOutstanding(x),direction=x.dueDirection==='i_owe'?'I owe':x.dueDirection==='owed_to_me'?'Owed to me':'Old due',dueInfo=x.paymentType==='Due'?[direction,x.duePerson,`Settled ${money(settled)} · Remaining ${money(remaining)}`].filter(Boolean).join(' · '):'',owners=assignedMembers(x),costInfo=owners.length>1?`Shared by ${owners.join(', ')}`:owners.length?`For ${owners[0]}`:'Not assigned',details=[x.paymentType||'Cash',costInfo,dueInfo,x.quantity?`${x.quantity} ${x.unit||''} × ${money(x.rate||0)}`:x.category,fmt(x.date),x.note].filter(Boolean).join(' · ');let actionLabel=x.dueDirection==='i_owe'?'Pay due':'Collect';return `<div class="item expense-item"><div class="item-main"><div class="item-title">${esc(title)}</div><div class="item-sub">${esc(details)}</div></div><div class="expense-right"><div class="item-amount">${money(x.amount)}</div>${actions?`<div class="item-actions">${x.paymentType==='Due'&&remaining>0&&['i_owe','owed_to_me'].includes(x.dueDirection)?`<button class="collect-btn" onclick="openExpenseDueAction('${x.id}')">${actionLabel}</button>`:''}<button class="edit-btn" onclick="editExpense('${x.id}')" aria-label="Edit ${esc(title)}">Edit</button><button class="delete" onclick="delExpense('${x.id}')" aria-label="Delete ${esc(title)}">×</button></div>`:''}</div></div>`}).join(''):empty('No expenses yet. Add your first one above.') }
function incomeHTML(items,actions){
 if(!items.length)return empty('No income entries for this date. Add your first income above.');
 const groups={};items.forEach(x=>(groups[x.date||'Undated']??=[]).push(x));
 return Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(d=>{
  const rows=groups[d],dayTotal=sum(rows);
  const cards=rows.map(x=>{
   const collected=collectedAmount(x),remaining=incomeOutstanding(x),status=x.paymentType==='Due'?(remaining<=0.000001?'Fully collected':collected>0?'Partially collected':'Due'):x.paymentType||'Cash';
   const memo=x.salesMemo,details=[memo?`Customer: ${memo.customerName||'Customer'}`:'',memo?`${(memo.items||[]).length} product lines`:'',`Income by: ${x.incomeBy||'Unassigned'}`,x.paymentType||'Cash',x.duePerson?`Customer due: ${x.duePerson}`:'',x.note||'',x.paymentType==='Due'?`Collected ${money(collected)} · Due ${money(remaining)}`:''].filter(Boolean).join(' · ');
   const collectionHistory=incomeCollections(x).slice().sort((a,b)=>b.date.localeCompare(a.date)).map(c=>`${fmt(c.date)}: ${money(c.amount)} (${c.method||'Cash'})`).join(' | ');
   const title=memo?`Sales memo · ${memo.memoNo||''}`:(x.source||'Income');
   return `<div class="item income-item"><div class="item-main"><div class="item-title">${esc(title)}</div><div class="item-sub">${esc(details||status)}${collectionHistory?`<br>Collections: ${esc(collectionHistory)}`:''}</div><span class="income-status ${remaining>0?'is-due':'is-paid'}">${esc(status)}</span></div><div class="income-right"><div class="item-amount">${money(x.amount)}</div>${actions?`<div class="item-actions">${memo?`<button class="edit-btn" onclick="printSalesMemo('${x.id}')">Print memo</button>`:''}${remaining>0?`<button class="collect-btn" onclick="openCollectIncome('${x.id}')">Collect</button>`:''}<button class="edit-btn" onclick="editIncome('${x.id}')">Edit</button><button class="delete" onclick="deleteIncome('${x.id}')" aria-label="Delete ${esc(title)}">×</button></div>`:''}</div></div>`;
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
function renderFamilyCostReport(items,bills=[],rangeStart='',rangeEnd=''){
 const familyMembers=uniquePeople(db.familyMembers);
 const purchaseLines=bills.flatMap(b=>(b.lines||[]).map(line=>({amount:purchaseLineCost(b,line),costMembers:assignedMembers(line),product:line.product||'Product'})));
 const expenseRows=items.map(x=>({amount:Number(x.amount||0),costMembers:assignedMembers(x),title:x.name||x.category||'Expense'}));
 const productionOverheads=db.productions.filter(p=>(!rangeStart||p.date>=rangeStart)&&(!rangeEnd||p.date<=rangeEnd)&&Number(p.overheadCost||0)>0).map(p=>({amount:Number(p.overheadCost||0),costMembers:uniquePeople(p.overheadMembers||[]),product:`Production overhead · ${p.product||'Product'}`}));
 const allRows=[...expenseRows,...purchaseLines,...productionOverheads];
 const sharedRows=allRows.filter(x=>x.costMembers.length>1),directRows=allRows.filter(x=>x.costMembers.length===1),unassignedRows=allRows.filter(x=>x.costMembers.length===0);
 const familyTotal=sharedRows.reduce((total,x)=>total+x.amount,0);
 const directTotal=directRows.reduce((total,x)=>total+x.amount,0);
 const unassignedTotal=unassignedRows.reduce((total,x)=>total+x.amount,0);
 const guestsInRange=db.guests.filter(g=>guestOverlapsRange(g,rangeStart,rangeEnd));
 const guestNames=guestsInRange.flatMap(g=>g.members);
 const people=uniquePeople([...familyMembers,...guestNames,...allRows.flatMap(x=>x.costMembers)]);
 const directByMember=new Map(people.map(name=>[name,directRows.filter(x=>x.costMembers[0].toLocaleLowerCase()===name.toLocaleLowerCase()).reduce((total,x)=>total+x.amount,0)]));
 const sharedByMember=new Map(people.map(name=>[name,sharedRows.reduce((total,x)=>{const match=x.costMembers.find(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase());return total+(match?x.amount/x.costMembers.length:0)},0)]));
 const allocatedMembers=new Set(sharedRows.flatMap(x=>x.costMembers.map(n=>n.toLocaleLowerCase())));
 const averageSharedShare=allocatedMembers.size?sharedRows.reduce((t,x)=>t+x.amount,0)/allocatedMembers.size:0;
 $('familyCostTotal').textContent=money(familyTotal);
 $('familyCostMemberCount').textContent=`Shared across ${allocatedMembers.size} selected ${allocatedMembers.size===1?'person':'people'}`;
 $('familyCostPerMember').textContent=allocatedMembers.size?money(averageSharedShare):'—';
 $('memberDirectCostTotal').textContent=money(directTotal);
 $('unassignedCostTotal').textContent=money(unassignedTotal);
 $('memberCostCount').textContent=`${people.length} ${people.length===1?'person':'people'}`;
 $('memberCostBreakdown').innerHTML=people.map(name=>{
  const direct=directByMember.get(name)||0,share=sharedByMember.get(name)||0,total=direct+share;
  const guestStay=guestsInRange.find(g=>g.members.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase()));
  const guestLabel=guestStay?`Guest · ${fmt(guestStay.entryDate)} – ${guestStay.outDate?fmt(guestStay.outDate):'Not left yet'}`:'';
  return `<div class="member-cost-row"><div><strong>${esc(name)}</strong><small>${guestLabel?esc(guestLabel)+' · ':''}Personal: ${money(direct)} · Shared: ${money(share)}</small></div><strong>${money(total)}</strong></div>`;
 }).join('')||empty('Add family members in Profile to see the member-wise cost breakdown.');
 renderMemberProductConsumptionReport(rangeStart,rangeEnd,people);
 const notes=[];
 if(!people.length&&familyTotal>0)notes.push('Add people before allocating shared costs.');
 if(unassignedTotal>0)notes.push(`${money(unassignedTotal)} is not included in member totals. Assign expenses or inventory products to one or more people.`);
 $('familyCostNote').textContent=notes.join(' ')||'Expenses and landed purchase costs are divided equally among their selected people. Production materials are already included at purchase; only production electricity and transit overhead are added again, allocated to the people assigned to the consumed materials.';
}
function renderMemberProductConsumptionReport(rangeStart,rangeEnd,reportPeople=[]){
 const select=$('memberProductFilter'),list=$('memberProductConsumption'),hint=$('memberConsumptionHint');
 if(!select||!list)return;
 const owners=uniquePeople([...reportPeople,...assignablePeople(),...inventoryEntries().flatMap(record=>record.costMembers)]);
 const previous=select.value||'all';
 select.innerHTML=`<option value="all">All assigned members</option>${owners.map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}`;
 select.value=previous==='all'||owners.some(name=>name.toLocaleLowerCase()===previous.toLocaleLowerCase())?previous:'all';
 const selected=select.value==='all'?'':select.value;
 const movements=db.consumptions.filter(entry=>{
  const date=String(entry.date||'');return date&&date>=rangeStart&&date<=rangeEnd&&Number(entry.quantity||0)>0;
 }).map(entry=>{
  const record=resolveStockSource(entry.billId,entry.lineId);if(!record)return null;
  const costMembers=uniquePeople(record.costMembers||[]);
  if(selected&&!costMembers.some(name=>name.toLocaleLowerCase()===selected.toLocaleLowerCase()))return null;
  const sourceQuantity=Number(record.quantity||0),unitCost=sourceQuantity>0?Number(record.amount||0)/sourceQuantity:0;
  const fullCost=Number(entry.quantity||0)*unitCost;
  const memberShare=costMembers.length?fullCost/costMembers.length:fullCost;
  let movementType='Manual stock use',reference='';
  if(entry.salesMemoId){const memo=db.incomes.find(item=>item.id===entry.salesMemoId);movementType='Sales memo';reference=memo?.salesMemo?.memoNo||memo?.source||''}
  else if(entry.productionId){const batch=db.productions.find(item=>item.id===entry.productionId);movementType='Production material';reference=batch?.productionNo||batch?.product||''}
  return {entry,record,costMembers,unitCost,fullCost,memberShare,movementType,reference};
 }).filter(Boolean).sort((a,b)=>String(b.entry.date||'').localeCompare(String(a.entry.date||''))||a.record.product.localeCompare(b.record.product));
 const attributedTotal=movements.reduce((total,row)=>total+(selected?row.memberShare:row.fullCost),0);
 const entryCount=movements.length;
 const targetLabel=selected?selected:'All products';
 if(hint)hint.textContent=`${targetLabel} · ${fmt(rangeStart)} – ${fmt(rangeEnd)}. Cost uses each inventory lot's landed/unit cost. This activity detail is not added again to the Cost totals above; purchase and production costs are already counted at their source.`;
 if(!movements.length){list.innerHTML=empty(selected?`No product stock consumption for ${esc(selected)} from ${esc(fmt(rangeStart))} to ${esc(fmt(rangeEnd))}.`:`No product stock consumption from ${esc(fmt(rangeStart))} to ${esc(fmt(rangeEnd))}.`);return}
 const rows=movements.map(row=>{
  const qty=`${numberText(row.entry.quantity)} ${esc(row.record.unit)}`;
  const useLabel=row.reference?`${row.movementType} · ${row.reference}`:row.movementType;
  const ownerLabel=row.costMembers.length?row.costMembers.join(', '):'Not assigned';
  const displayedCost=selected?row.memberShare:row.fullCost;
  return `<article class="member-consumption-row"><div class="member-consumption-head"><div><strong>${esc(row.record.product)}${row.record.spec?` · ${esc(row.record.spec)}`:''}</strong><small>${esc(fmt(row.entry.date))} · ${esc(useLabel)}</small></div><strong>${money(displayedCost)}</strong></div><div class="member-consumption-meta"><span>Quantity <strong>${qty}</strong></span><span>Unit cost <strong>${money(row.unitCost)}</strong></span><span>Full cost <strong>${money(row.fullCost)}</strong></span><span>${selected?'Member share':'Assigned to'} <strong>${selected?money(row.memberShare):esc(ownerLabel)}</strong></span></div></article>`;
 }).join('');
 list.innerHTML=`<div class="member-consumption-summary"><span>${entryCount} consumption ${entryCount===1?'entry':'entries'}</span><strong>${selected?'Member allocated cost':'Total consumption value'}: ${money(attributedTotal)}</strong></div>${rows}`;
}

function guestOverlapsRange(guest,start,end){
 if(!start||!end)return true;
 const guestEnd=guest.outDate||end;
 return String(guest.entryDate||'')<=end&&guestEnd>=start;
}
function guestStayCosts(guest,rangeStart='',rangeEnd=''){
 const start=[guest.entryDate,rangeStart||guest.entryDate].sort().at(-1);
 const actualEnd=guest.outDate||rangeEnd||today();
 const end=[actualEnd,rangeEnd||actualEnd].sort()[0];
 if(start>end)return {purposeCost:0,sharedFamilyCost:0,guestShareOfFamily:0};
 const names=new Set(guest.members.map(n=>n.toLocaleLowerCase()));
 const expenseRows=db.expenses.filter(x=>x.date>=start&&x.date<=end).map(x=>({date:x.date,amount:Number(x.amount||0),members:assignedMembers(x)}));
 const productRows=db.purchaseBills.filter(b=>b.date>=start&&b.date<=end).flatMap(b=>(b.lines||[]).map(l=>({date:b.date,amount:purchaseLineCost(b,l),members:assignedMembers(l)})));
 const productionRows=db.productions.filter(p=>p.date>=start&&p.date<=end&&Number(p.overheadCost||0)>0).map(p=>({date:p.date,amount:Number(p.overheadCost||0),members:uniquePeople(p.overheadMembers||[])}));
 let purposeCost=0,sharedFamilyCost=0,guestShareOfFamily=0;
 [...expenseRows,...productRows,...productionRows].forEach(row=>{
  if(row.members.length===1&&names.has(row.members[0].toLocaleLowerCase()))purposeCost+=row.amount;
  if(row.members.length>1){sharedFamilyCost+=row.amount;row.members.forEach(name=>{if(names.has(name.toLocaleLowerCase()))guestShareOfFamily+=row.amount/row.members.length})}
 });
 return {purposeCost,sharedFamilyCost,guestShareOfFamily};
}
function renderGuestReport(rangeStart='',rangeEnd=''){
 const list=$('guestStayList'),report=$('guestReport');if(!list||!report)return;
 list.innerHTML=db.guests.slice().sort((a,b)=>String(b.entryDate).localeCompare(String(a.entryDate))).map(g=>`<article class="guest-row" data-guest-id="${esc(g.id)}"><div class="guest-row-head"><div><strong>${esc(g.members.join(', '))}</strong><small>Entry: ${fmt(g.entryDate)} · ${g.purpose?`Purpose: ${esc(g.purpose)}`:'No purpose noted'}</small></div><span class="guest-status ${g.outDate?'guest-left':'guest-staying'}">${g.outDate?'Left':'Staying'}</span></div><div class="guest-out-control"><label>Guest out date <input type="date" data-guest-out value="${esc(g.outDate||'')}" min="${esc(g.entryDate)}"></label><button type="button" class="edit-btn" data-save-guest-out>Update out date</button></div></article>`).join('')||empty('No guest entries yet. Add guest names, select one or more people, and save their entry date.');
 list.querySelectorAll('[data-save-guest-out]').forEach(button=>button.onclick=()=>{
  const row=button.closest('[data-guest-id]'),g=db.guests.find(x=>x.id===row?.dataset.guestId);if(!g)return;
  const outDate=row.querySelector('[data-guest-out]').value;
  if(outDate&&outDate<g.entryDate){alert('Guest out date cannot be earlier than the entry date.');return}
  g.outDate=outDate;save();
 });
 const filteredGuests=db.guests.filter(g=>guestOverlapsRange(g,rangeStart,rangeEnd));
 report.innerHTML=filteredGuests.slice().sort((a,b)=>String(b.entryDate).localeCompare(String(a.entryDate))).map(g=>{
  const costs=guestStayCosts(g,rangeStart,rangeEnd);
  return `<article class="guest-report-row"><div><strong>${esc(g.members.join(', '))}</strong><small>Entry date: ${fmt(g.entryDate)} · Out date: ${g.outDate?fmt(g.outDate):'Still staying'} · Purpose: ${esc(g.purpose||'Not specified')}</small></div><div class="guest-report-costs"><span>Guest purpose cost<strong>${money(costs.purposeCost)}</strong></span><span>Family cost in selected stay range<strong>${money(costs.sharedFamilyCost)}</strong></span><span>Guest share of family cost<strong>${money(costs.guestShareOfFamily)}</strong></span></div></article>`;
 }).join('')||empty('No guest stays overlap the selected report date range.');
}

function renderProductionReport(from,to){
 const list=$('productionReportList');if(!list)return;
 const batches=db.productions.filter(batch=>String(batch.date||'')>=from&&String(batch.date||'')<=to).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const totalCost=batches.reduce((total,batch)=>total+Number(batch.totalCost||0),0);
 const totalsByUnit=new Map();batches.forEach(batch=>{const unit=String(batch.unit||'pcs');totalsByUnit.set(unit,(totalsByUnit.get(unit)||0)+Number(batch.quantity||0))});
 $('productionReportBatchCount').textContent=String(batches.length);
 $('productionReportQuantity').textContent=totalsByUnit.size?[...totalsByUnit].map(([unit,quantity])=>`${numberText(quantity)} ${unit}`).join(' · '):'0';
 $('productionReportUnitLabel').textContent=totalsByUnit.size>1?'Output quantity by unit':'Output quantity';
 $('productionReportCost').textContent=money(totalCost);
 list.innerHTML=batches.length?batches.map(batch=>{
  const materials=(batch.inputs||[]).map(item=>`${esc(item.product)} · ${numberText(item.quantity)} ${esc(item.unit||'pcs')} · ${money(item.cost)}`).join('<br>');
  return `<article class="production-batch"><div class="production-batch-head"><div><strong>${esc(batch.product)}${batch.spec?` · ${esc(batch.spec)}`:''}</strong><small>${esc(batch.productionNo||'Production')} · ${fmt(batch.date)} · Produced ${numberText(batch.quantity)} ${esc(batch.unit||'pcs')}</small></div><strong>${money(batch.totalCost)}</strong></div><div class="production-batch-grid"><span>Materials<strong>${money(batch.ingredientCost)}</strong></span><span>Electricity<strong>${money(batch.electricityCost)}</strong></span><span>Transit<strong>${money(batch.transitCost)}</strong></span><span>Cost per ${esc(batch.unit||'unit')}<strong>${money(batch.unitCost)}</strong></span></div><small class="production-batch-materials">Materials used:<br>${materials||'No materials recorded'}</small></article>`;
 }).join(''):empty('No production batches in the selected date range.');
}
function renderAssetsReport(from,to){
 const list=$('assetPurchaseReportList');if(!list)return;
 const bills=db.purchaseBills.filter(b=>String(b.date||'')>=from&&String(b.date||'')<=to&&(String(b.category||'').toLocaleLowerCase()==='assets'));
 const rows=bills.flatMap(b=>(b.lines||[]).map(line=>({bill:b,line,amount:purchaseLineCost(b,line)})));
 const total=rows.reduce((sum,row)=>sum+row.amount,0);
 $('assetPurchaseTotal').textContent=money(total);$('assetPurchaseLines').textContent=String(rows.length);$('assetPurchaseBills').textContent=String(bills.length);
 list.innerHTML=rows.length?rows.sort((a,b)=>String(b.bill.date||'').localeCompare(String(a.bill.date||''))).map(({bill,line,amount})=>`<article class="asset-report-row"><div><strong>${esc(line.product||'Asset')}${line.spec?` · ${esc(line.spec)}`:''}</strong><small>${fmt(bill.date)} · ${esc(bill.supplier||'Supplier')} · Bill ${esc(bill.billNo||'')}</small><small>${numberText(line.quantity)} ${esc(line.unit||'pcs')} · ${esc(line.productType||'Other')}</small></div><strong>${money(amount)}</strong></article>`).join(''):empty('No purchase bills with category Assets in the selected date range.');
}

function renderReport(){
 const from=$('productReportFromDate')?.value||'',to=$('productReportToDate')?.value||'';
 const hint=$('reportDateHint');
 const reportOutputs=['productTypePurchaseReport','productPurchaseReport','supplierCreditorReport','iOweList','owedToMeList','incomeDueList','categoryBreakdown','memberCostBreakdown','memberProductConsumption','guestReport','incomePersonBreakdown','incomeHeadBreakdown','productionReportList','assetPurchaseReportList'];
 if(!from||!to||from>to){
  const message=!from||!to?'Choose both a From date and a To date to view reports.':'Invalid date range: the From date must be on or before the To date.';
  if(hint){hint.textContent=message;hint.classList.add('date-range-error')}
  reportOutputs.forEach(id=>{const node=$(id);if(node)node.innerHTML=empty(message)});
  ['reportTotal','reportIncomeTotal','reportIncomeCollected','familyCostTotal','familyCostPerMember','memberDirectCostTotal','unassignedCostTotal','iOweExpenseTotal','owedToMeExpenseTotal','incomeDueTotal','productionReportCost','assetPurchaseTotal'].forEach(id=>{if($(id))$(id).textContent=money(0)});
  ['productionReportBatchCount','productionReportQuantity','assetPurchaseLines','assetPurchaseBills'].forEach(id=>{if($(id))$(id).textContent='0'});
  if($('reportRange'))$('reportRange').textContent=message;
  if($('reportBars'))$('reportBars').innerHTML='';
  return;
 }
 if(hint){hint.textContent='Both dates are included. All report sections use this date range. Creditor and debtor balances are shown as of the To date.';hint.classList.remove('date-range-error')}
 const days=[];let cursor=dateObj(from),last=dateObj(to);
 while(cursor<=last){days.push(cursor.toISOString().slice(0,10));cursor.setDate(cursor.getDate()+1)}
 const items=db.expenses.filter(x=>String(x.date||'')>=from&&String(x.date||'')<=to);
 const bills=db.purchaseBills.filter(x=>String(x.date||'')>=from&&String(x.date||'')<=to);
 const total=sum(items)+bills.reduce((t,x)=>t+billTotal(x),0);
 $('reportLabel').textContent='TOTAL COST · SELECTED DATE RANGE';$('reportTotal').textContent=money(total);$('reportRange').textContent=`${fmt(from)} – ${fmt(to)}`;
 renderFamilyCostReport(items,bills,from,to);
 renderGuestReport(from,to);
 renderProductionReport(from,to);
 renderAssetsReport(from,to);
 const selectedIncomePerson=$('reportIncomePersonFilter').value;
 const incomeInScope=db.incomes.filter(x=>selectedIncomePerson==='all'||(x.incomeBy||'Unassigned')===selectedIncomePerson);
 const incomeEntriesInPeriod=incomeInScope.filter(x=>x.date>=from&&x.date<=to);
 const receivedForPeriod=entries=>entries.reduce((total,x)=>total+(x.paymentType==='Due'?incomeCollections(x).filter(c=>c.date>=from&&c.date<=to).reduce((t,c)=>t+Number(c.amount||0),0):(x.date>=from&&x.date<=to?Number(x.amount||0):0)),0);
 const receivedInPeriod=receivedForPeriod(incomeInScope);
 $('reportIncomeTotal').textContent=money(sum(incomeEntriesInPeriod));$('reportIncomeCollected').textContent=money(receivedInPeriod);
 const peopleToShow=selectedIncomePerson==='all'?db.incomePeople:[selectedIncomePerson];
 $('incomePersonBreakdown').innerHTML=peopleToShow.map(person=>{
  const personEntries=db.incomes.filter(x=>(x.incomeBy||'Unassigned')===person),recorded=sum(personEntries.filter(x=>x.date>=from&&x.date<=to));
  const received=receivedForPeriod(personEntries);
  if(!recorded&&!received)return '';
  return `<div class="income-report-row"><div><strong>${esc(person)}</strong><small>Recorded: ${money(recorded)}</small></div><strong>${money(received)}<small> received</small></strong></div>`;
 }).filter(Boolean).join('')||empty('No income by person in the selected date range.');
 const typesToShow=db.incomeHeads;
 $('incomeHeadBreakdown').innerHTML=typesToShow.map(type=>{
  const typeEntries=incomeInScope.filter(x=>(x.source||'Other')===type),recorded=sum(typeEntries.filter(x=>x.date>=from&&x.date<=to));
  const received=receivedForPeriod(typeEntries);
  if(!recorded&&!received)return '';
  return `<div class="income-report-row"><div><strong>${esc(type)}</strong><small>Recorded: ${money(recorded)}</small></div><strong>${money(received)}<small> received</small></strong></div>`;
 }).filter(Boolean).join('')||empty('No income by type in the selected date range.');
 showBalances();
 // Use daily bars for shorter selections and monthly totals for longer ranges.
 let chartBuckets=[];
 if(days.length<=31){chartBuckets=days.map(d=>({key:d,label:dateObj(d).toLocaleDateString(undefined,{day:'numeric',month:'short'}),from:d,to:d}))}
 else{
  const seen=new Set();days.forEach(d=>{const key=d.slice(0,7);if(seen.has(key))return;seen.add(key);const [y,m]=key.split('-').map(Number);const monthStart=`${key}-01`;const monthEnd=new Date(y,m,0,12).toISOString().slice(0,10);chartBuckets.push({key,label:dateObj(monthStart).toLocaleDateString(undefined,{month:'short',year:'2-digit'}),from:monthStart<from?from:monthStart,to:monthEnd>to?to:monthEnd})});
 }
 const vals=chartBuckets.map(bucket=>sum(items.filter(x=>x.date>=bucket.from&&x.date<=bucket.to))+bills.filter(x=>x.date>=bucket.from&&x.date<=bucket.to).reduce((t,x)=>t+billTotal(x),0));
 const max=Math.max(...vals,1);
 $('reportBars').innerHTML=vals.map((v,i)=>`<div class="bar-wrap"><div class="bar" title="${esc(chartBuckets[i].label)} · ${money(v)}" style="height:${Math.max(v?3:1,v/max*82)}px"></div><span class="bar-label">${esc(chartBuckets[i].label)}</span></div>`).join('');
 let cats={};items.forEach(x=>cats[x.category]=(cats[x.category]||0)+Number(x.amount));bills.forEach(x=>{const cat=x.category||'Uncategorised';cats[cat]=(cats[cat]||0)+billTotal(x)});
 $('categoryBreakdown').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="breakrow"><span>${esc(k)}</span><strong>${money(v)}</strong></div>`).join('')||empty('No costs in this date range.');
 let all=0,done=0;days.forEach(d=>dayQuests(d).forEach(q=>{const state=questCheckState(q,d);all+=state.length;done+=state.filter(Boolean).length}));$('achievementRate').textContent=(all?Math.round(done/all*100):0)+'%';
 renderProductPurchaseReport(from,to);renderDueReport(from,to);
}

function supplierBillBalancesAt(supplier,asOf){
 const rows=db.purchaseBills.filter(b=>b.supplier===supplier&&String(b.date||'')<=asOf).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id))).map(b=>({bill:b,credit:billCredit(b),paid:0,remaining:billCredit(b)}));
 const payments=db.supplierPayments.filter(p=>p.supplier===supplier&&String(p.date||'')<=asOf).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
 payments.forEach(payment=>{let amount=Number(payment.amount||0)+Number(payment.discount||0);rows.filter(r=>r.bill.date<=payment.date&&r.remaining>0).forEach(r=>{if(amount<=0)return;const applied=Math.min(r.remaining,amount);r.paid+=applied;r.remaining-=applied;amount-=applied})});
 return rows;
}
function renderDueReport(from,to){
 const asOf=to;
 const due=db.expenses.filter(x=>x.paymentType==='Due'&&String(x.date||'')<=asOf);
 const iOwe=due.filter(x=>x.dueDirection==='i_owe'&&expenseOutstandingAt(x,asOf)>0),owedExpenses=due.filter(x=>x.dueDirection==='owed_to_me'&&expenseOutstandingAt(x,asOf)>0);
 const incomeDue=db.incomes.filter(x=>x.paymentType==='Due'&&String(x.date||'')<=asOf&&incomeOutstandingAt(x,asOf)>0),legacy=due.filter(x=>!['i_owe','owed_to_me'].includes(x.dueDirection));
 const supplierNames=[...new Set([...db.suppliers,...db.purchaseBills.map(b=>b.supplier),...db.supplierPayments.map(p=>p.supplier)].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const supplierRows=supplierNames.map(name=>{
  const allocations=supplierBillBalancesAt(name,asOf),balance=allocations.reduce((t,row)=>t+row.remaining,0);
  const periodBills=db.purchaseBills.filter(b=>b.supplier===name&&b.date>=from&&b.date<=to);
  const periodPayments=db.supplierPayments.filter(p=>p.supplier===name&&p.date>=from&&p.date<=to).reduce((t,p)=>t+Number(p.amount||0)+Number(p.discount||0),0);
  const periodCredit=periodBills.reduce((t,b)=>t+billCredit(b),0);
  if(balance<=0.000001&&!periodBills.length&&!periodPayments)return '';
  return `<button class="supplier-creditor-report-row" type="button" data-creditor="${esc(name)}"><span class="supplier-creditor-main"><strong>${esc(name)}</strong><small>${allocations.length} bills by ${fmt(asOf)} · Credit in range ${money(periodCredit)} · Payments / discounts in range ${money(periodPayments)}</small></span><span class="supplier-creditor-balance"><strong>${money(balance)}</strong><small>Outstanding at ${fmt(asOf)}</small></span></button>`;
 }).filter(Boolean).join('');
 $('supplierCreditorReport').innerHTML=supplierRows||empty(`No supplier credits or payments to show by ${fmt(asOf)}.`);
 $('supplierCreditorReport').querySelectorAll('[data-creditor]').forEach(btn=>btn.onclick=()=>{setTab('supplierAccounts');openSupplierAccount(btn.dataset.creditor)});
 const supplierTotal=supplierNames.reduce((t,name)=>t+supplierBillBalancesAt(name,asOf).reduce((v,row)=>v+row.remaining,0),0);
 const expenseOweTotal=iOwe.reduce((t,x)=>t+expenseOutstandingAt(x,asOf),0);
 const owedExpenseTotal=owedExpenses.reduce((t,x)=>t+expenseOutstandingAt(x,asOf),0);
 const incomeDueAmount=incomeDue.reduce((t,x)=>t+incomeOutstandingAt(x,asOf),0);
 $('iOweTotal').textContent=money(supplierTotal+expenseOweTotal);$('iOweExpenseTotal').textContent=money(expenseOweTotal);
 $('owedToMeTotal').textContent=money(owedExpenseTotal+incomeDueAmount);$('owedToMeExpenseTotal').textContent=money(owedExpenseTotal);$('incomeDueTotal').textContent=money(incomeDueAmount);
 $('creditorAsOfLabel').textContent=`Balance at ${fmt(asOf)}`;$('debitorAsOfLabel').textContent=`Balance at ${fmt(asOf)}`;
 const grouped=expenseItems=>{let people={};expenseItems.forEach(x=>{const person=(x.duePerson||'Unknown person').trim()||'Unknown person';people[person]=(people[person]||0)+expenseOutstandingAt(x,asOf)});return Object.entries(people).sort((a,b)=>b[1]-a[1]).map(([person,total])=>`<div class="breakrow"><span>${esc(person)}</span><strong>${money(total)}</strong></div>`).join('')||empty('No expense dues recorded by this date.')};
 $('iOweList').innerHTML=grouped(iOwe);
 $('owedToMeList').innerHTML=grouped(owedExpenses);
 $('incomeDueList').innerHTML=incomeDue.length?incomeDue.map(x=>`<div class="breakrow"><span>${esc(x.source||'Income')} · ${esc(x.duePerson||'Unknown person')}<small>Entry: ${fmt(x.date)}</small></span><strong>${money(incomeOutstandingAt(x,asOf))}</strong></div>`).join(''):empty('No income due to collect by this date.');
 $('unassignedDueHint').hidden=!legacy.length;$('unassignedDueHint').textContent=legacy.length?`${legacy.length} older Due ${legacy.length===1?'entry is':'entries are'} not assigned to either side. These older records are preserved and excluded from creditor and debtor totals.`:'';
}

activateReportSection('members');purchaseLines=[defaultPurchaseLine()];renderPurchaseLines();fillChoices();$('purchaseDate').value=today();updatePurchaseBillNo();productionInputs=[defaultProductionInput()];fillProductionOptions();resetProductionForm();applyThemeColor(db.settings.themeColor,false);renderPurchaseCategorySettings();
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dayquest-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.expenses)||!Array.isArray(x.quests)||typeof x.checks!=='object')throw Error();if(!Array.isArray(x.incomes))x.incomes=[];if(!Array.isArray(x.purchaseBills))x.purchaseBills=[];if(!Array.isArray(x.supplierPayments))x.supplierPayments=[];if(!Array.isArray(x.suppliers))x.suppliers=[];if(!Array.isArray(x.productNames))x.productNames=[];if(!Array.isArray(x.productTypes))x.productTypes=['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];if(!Array.isArray(x.purchaseCategories))x.purchaseCategories=['Assets','Staples','Fixed Ex.'];if(!x.settings||typeof x.settings!=='object')x.settings={themeColor:'#263b5c'};if(!Array.isArray(x.consumptions))x.consumptions=[];if(!Array.isArray(x.productions))x.productions=[];if(!Array.isArray(x.incomeHeads))x.incomeHeads=['Salary','Business','Sales','Freelance','Rent','Gift','Other'];if(!Array.isArray(x.incomePeople))x.incomePeople=[];if(!x.profile||typeof x.profile!=='object')x.profile={name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};if(!Array.isArray(x.familyMembers))x.familyMembers=[];if(!Array.isArray(x.guestPeople))x.guestPeople=[];if(!Array.isArray(x.guests))x.guests=[];if(confirm('Replace current data with this backup?')){db=x;db.incomes=Array.isArray(db.incomes)?db.incomes:[];db.expenses=Array.isArray(db.expenses)?db.expenses:[];db.expenses.forEach(item=>{item.costMember=String(item.costMember||'').trim()});db.purchaseBills=Array.isArray(db.purchaseBills)?db.purchaseBills:[];db.supplierPayments=Array.isArray(db.supplierPayments)?db.supplierPayments:[];db.suppliers=Array.isArray(db.suppliers)?[...new Set(db.suppliers)]:[];db.productNames=Array.isArray(db.productNames)?db.productNames:[];
db.productNames=[...new Map(db.productNames.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);db.productTypes=Array.isArray(db.productTypes)&&db.productTypes.length?db.productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];db.productTypes=[...new Map(db.productTypes.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);db.consumptions=Array.isArray(db.consumptions)?db.consumptions:[];db.productions=Array.isArray(db.productions)?db.productions.filter(p=>p&&p.id&&p.product&&Number(p.quantity)>0):[];normalizePurchaseInventory();db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];db.settings=db.settings&&typeof db.settings==='object'?db.settings:{themeColor:'#263b5c'};db.expenseNames=Array.isArray(db.expenseNames)?db.expenseNames:['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];db.units=Array.isArray(db.units)?db.units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];db.purchaseBills.forEach(b=>{if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);(b.lines||[]).forEach(l=>{if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product)})});db.supplierPayments.forEach(p=>{if(p.supplier&&!db.suppliers.includes(p.supplier))db.suppliers.push(p.supplier)});db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];normalizePurchaseBillNumbers();db.profile=db.profile||{name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};db.profile.familyName=String(db.profile.familyName||'');db.profile.photoData=typeof db.profile.photoData==='string'&&db.profile.photoData.startsWith('data:image/')?db.profile.photoData:'';db.familyMembers=Array.isArray(db.familyMembers)?db.familyMembers.map(n=>String(n||'').trim()).filter(Boolean):[];db.familyMembers=[...new Map(db.familyMembers.map(n=>[n.toLocaleLowerCase(),n])).values()];db.guestPeople=Array.isArray(db.guestPeople)?db.guestPeople.map(n=>String(n||'').trim()).filter(Boolean):[];db.guestPeople=[...new Map(db.guestPeople.map(n=>[n.toLocaleLowerCase(),n])).values()];db.guests=Array.isArray(db.guests)?db.guests.filter(g=>g&&Array.isArray(g.members)&&g.members.length&&/^\d{4}-\d{2}-\d{2}$/.test(String(g.entryDate||''))):[];db.guests.forEach(g=>{g.id=g.id||crypto.randomUUID();g.members=uniquePeople(g.members);g.outDate=String(g.outDate||'');if(g.outDate&&g.outDate<g.entryDate)g.outDate='';g.purpose=String(g.purpose||'');g.members.forEach(n=>{if(!assignablePeople().some(x=>x.toLocaleLowerCase()===String(n).toLocaleLowerCase()))db.guestPeople.push(String(n).trim())})});db.incomePeople=Array.isArray(db.incomePeople)?db.incomePeople:[];if(db.profile.name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===db.profile.name.toLocaleLowerCase()))db.familyMembers.unshift(db.profile.name);normalizeMemberAssignments();db.familyMembers.forEach(name=>{if(!db.incomePeople.includes(name))db.incomePeople.push(name)});db.incomes.forEach(item=>{item.incomeBy=String(item.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(item.incomeBy))db.incomePeople.push(item.incomeBy)});if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');fillChoices();loadProfileForm();applyThemeColor(db.settings.themeColor||'#263b5c',false);renderPurchaseCategorySettings();save();alert('Backup restored.')}}catch{alert('That backup file is not valid.')}e.target.value=''};
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
const reportToday=today();$('productReportFromDate').value=reportToday.slice(0,7)+'-01';$('productReportToDate').value=reportToday;fillChoices();loadProfileForm();calcTotal();$('dueFields').hidden=true;$('duePaidFromField').hidden=true;$('incomeDueFields').hidden=true;$('salesMemoWrap').hidden=true;resetSalesMemoForm();$('expenseDueActionForm').hidden=true;$('incomeCollectForm').hidden=true;$('incomeTotalPreview').textContent=money(0);render();initAuth();
