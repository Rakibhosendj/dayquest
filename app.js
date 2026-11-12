const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const load=()=>{try{return JSON.parse(localStorage.getItem('dayquest_v1'))||{expenses:[],quests:[],checks:{}}}catch{return{expenses:[],quests:[],checks:{}}}};
let db=load(),period='week',deferredInstall=null,editingExpenseId=null,editingIncomeId=null,collectingIncomeId=null,settlingExpenseId=null,activeSupplierName=null,payingSupplierName=null,purchaseLines=[],editingPurchaseBillId=null,purchaseBillOriginalDate='';
db.expenses=Array.isArray(db.expenses)?db.expenses:[];
db.expenses.forEach(x=>{if(!['family','member','unassigned'].includes(x.costType))x.costType=x.costMember?'member':'unassigned';x.costMember=String(x.costMember||'').trim();if(x.costType==='member'&&!x.costMember)x.costType='unassigned'});
db.expenseNames=db.expenseNames||['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];
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
function normalizePurchaseInventory(){
 db.purchaseBills.forEach(b=>{
  if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);
  (b.lines||[]).forEach(l=>{
   if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product);
   if(!l.id)l.id=crypto.randomUUID();
   if(!['family','member','unassigned'].includes(l.costType))l.costType='unassigned';
   l.costMember=String(l.costMember||'').trim();
   if(l.costType==='member'&&!l.costMember)l.costType='unassigned';
  });
 });
 db.consumptions=db.consumptions.filter(x=>x&&x.billId&&x.lineId&&Number(x.quantity)>0);
}
normalizePurchaseInventory();
db.supplierPayments.forEach(p=>{if(p.supplier&&!db.suppliers.includes(p.supplier))db.suppliers.push(p.supplier)});
if(db.profile.name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===db.profile.name.toLocaleLowerCase()))db.familyMembers.unshift(db.profile.name);
db.familyMembers.forEach(name=>{if(!db.incomePeople.includes(name))db.incomePeople.push(name)});
if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);
db.incomes.forEach(x=>{x.incomeBy=String(x.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(x.incomeBy))db.incomePeople.push(x.incomeBy)});
if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');
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
const billCredit=b=>Math.max(0,Number(b.credit??(Number(b.total||0)-Number(b.cashPaid||0)-Number(b.bankPaid||0))));
const supplierOutstanding=name=>supplierBillBalances(name).reduce((t,row)=>t+row.remaining,0);
const billTotal=b=>Number(b.total||((b.lines||[]).reduce((t,l)=>t+Number(l.amount||Number(l.quantity||0)*Number(l.rate||0)),0)));
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
  toggle.textContent=hidden?'Show menu':'Hide menu';
  toggle.setAttribute('aria-label',hidden?'Show side menu':'Hide side menu');
  toggle.setAttribute('aria-expanded',String(!hidden));
 }else{
  const open=side.classList.contains('open');
  toggle.textContent=open?'Close':'Menu';
  toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  toggle.setAttribute('aria-expanded',String(open));
 }
}
function closeSidebar(){const side=$('sidebar'),backdrop=$('sidebarBackdrop');side?.classList.remove('open');backdrop?.setAttribute('hidden','');syncMenuToggle()}
function setTab(t){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===t));closeSidebar();if(t==='reports')renderReport();if(t==='settings')renderPurchaseCategorySettings()}
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
function fillExpenseCostOptions(selectedValue='family'){
 const select=$('expenseCostFor');if(!select)return;
 const options=[['family','Family (split equally)'],['unassigned','Not assigned (exclude from member totals)']];
 db.familyMembers.forEach(name=>options.push([`member:${name}`,`Only ${name}`]));
 if(String(selectedValue).startsWith('member:')&&!options.some(([value])=>value===selectedValue))options.push([selectedValue,`Only ${String(selectedValue).slice(7)} (not in current family list)`]);
 select.innerHTML=options.map(([value,label])=>`<option value="${esc(value)}">${esc(label)}</option>`).join('');
 select.value=options.some(([value])=>value===selectedValue)?selectedValue:'family';
}
function fillChoices(){
 const currentCostChoice=$('expenseCostFor')?.value||'family';
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
 [['incomeBy','Select person'],['incomePersonFilter','All people'],['reportIncomePersonFilter','All people']].forEach(([id,label])=>{
  const select=$(id);if(!select)return;const previous=select.value;
  select.innerHTML=(id==='incomeBy'?'':'<option value="all">'+label+'</option>')+db.incomePeople.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
  const preferred=(id==='incomeBy'?(db.profile.name||db.incomePeople[0]):'all');
  select.value=db.incomePeople.includes(previous)?previous:(id==='incomeBy'?preferred:'all');
 });
 const supplierSelect=$('purchaseSupplier');if(supplierSelect){const previous=supplierSelect.value;supplierSelect.innerHTML='<option value="">Select supplier</option>'+db.suppliers.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');if(db.suppliers.includes(previous))supplierSelect.value=previous;}
 const purchaseCategory=$('purchaseCategory');if(purchaseCategory){const previous=purchaseCategory.value;purchaseCategory.innerHTML='<option value="">Select purchase category</option>'+db.purchaseCategories.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');purchaseCategory.value=db.purchaseCategories.includes(previous)?previous:'';}
 fillExpenseCostOptions(currentCostChoice);
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
$('addUnit').onclick=()=>{let n=prompt('Add a unit (e.g. bottle, sack, km):');if(n&&n.trim()){n=n.trim();if(!db.units.includes(n))db.units.push(n);fillChoices();$('unitName').value=n;localSaveOnly()}};
$('addIncomeHead').onclick=()=>{let n=prompt('Add an income type (e.g. Salary, Business, Rent, Freelance):');if(n&&n.trim()){n=n.trim();if(!db.incomeHeads.includes(n))db.incomeHeads.push(n);fillChoices();$('incomeSource').value=n;localSaveOnly()}};
$('addIncomePerson').onclick=()=>{let n=prompt('Add the person who earned this income:');if(n&&n.trim()){n=n.trim();if(!db.incomePeople.includes(n))db.incomePeople.push(n);fillChoices();$('incomeBy').value=n;localSaveOnly()}};
function localSaveOnly(){localStorage.setItem('dayquest_v1',JSON.stringify(db))}
function renderProductNameSuggestions(){
 const list=$('productNameSuggestions');if(list)list.innerHTML=db.productNames.map(n=>`<option value="${esc(n)}"></option>`).join('');
 const count=$('productCatalogCount');if(count)count.textContent=`${db.productNames.length} saved product${db.productNames.length===1?'':'s'}`;
}
function defaultPurchaseLine(product=''){
 return {lineId:null,product,spec:'',quantity:1,unit:db.units.includes('pcs')?'pcs':db.units[0],rate:0,amount:0,amountMode:'rate',calcError:'',amountPending:false,costType:'unassigned',costMember:''};
}
$('addNewProduct').onclick=()=>{
 const raw=prompt('Enter the new product name:');if(raw===null)return;
 const name=raw.trim();if(!name){alert('Enter a product name.');return}
 const existing=db.productNames.find(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase());
 const product=existing||name;
 if(!existing)db.productNames.unshift(product);
 let line=purchaseLines.find(item=>!String(item.product||'').trim());
 if(!line){line=defaultPurchaseLine();purchaseLines.push(line)}
 line.product=product;
 renderProductNameSuggestions();renderPurchaseLines();localSaveOnly();
 const nodes=[...$('purchaseLines').querySelectorAll('.pl-product')],target=nodes.find(input=>input.value===product&&input.closest('.purchase-line')?.dataset.lineIndex===String(purchaseLines.indexOf(line)));
 if(target){target.focus();target.select()}
};

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
  r.purchasedNorm+=Number(l.quantity||0)*info.factor;r.purchaseSpend+=Number(l.amount??(Number(l.quantity||0)*Number(l.rate||0)));
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
  <label>Product name <input class="pl-product" list="productNameSuggestions" maxlength="80" value="${esc(line.product||'')}" placeholder="e.g. Soap" required></label>
  <label>Size / specification <input class="pl-spec" maxlength="80" value="${esc(line.spec||'')}" placeholder="e.g. 300 gram (optional)"></label>
  <div class="form-grid"><label>Quantity <input class="pl-quantity" type="number" min="0.001" step="any" value="${Number(line.quantity??1)}" required></label><label>Unit <select class="pl-unit">${units}</select></label></div>
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
  const prop=el.classList.contains('pl-product')?'product':el.classList.contains('pl-spec')?'spec':el.classList.contains('pl-quantity')?'quantity':el.classList.contains('pl-unit')?'unit':el.classList.contains('pl-rate')?'rate':el.classList.contains('pl-amount')?'amount':'amountMode';
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
 updatePurchaseTotals();
}
function currentPurchaseTotal(){return purchaseLines.reduce((t,l)=>t+purchaseLineAmount(l),0)}
function updatePurchaseTotals(){
 purchaseLines.forEach((l,i)=>{
  const node=$('purchaseLines').querySelector(`[data-line-index="${i}"]`);if(!node)return;
  const amountField=node.querySelector('.pl-amount'),quantityField=node.querySelector('.pl-quantity'),rateField=node.querySelector('.pl-rate'),message=node.querySelector('.pl-calc-message');
  if(amountField&&document.activeElement!==amountField)amountField.value=purchaseLineAmount(l);
  if(quantityField&&document.activeElement!==quantityField)quantityField.value=Number(l.quantity??0);
  if(rateField&&document.activeElement!==rateField)rateField.value=Number(l.rate??0);
  if(message)message.textContent=l.calcError||'';
 });
 const total=currentPurchaseTotal(),cash=Number($('purchaseCashPaid').value||0),bank=Number($('purchaseBankPaid').value||0),credit=Math.max(0,total-cash-bank);
 $('purchaseBillTotal').textContent=money(total);$('purchaseCreditTotal').textContent=money(credit);
 const invalid=cash+bank>total+0.000001;$('purchaseCreditTotal').classList.toggle('invalid-total',invalid);$('purchaseBillSubmit').disabled=invalid;
}
function updatePurchaseBillNo(){
 const date=$('purchaseDate').value,field=$('purchaseBillNo');if(!field||!date)return;
 if(editingPurchaseBillId&&date===purchaseBillOriginalDate){const original=db.purchaseBills.find(b=>b.id===editingPurchaseBillId);if(original&&original.billNo){field.value=original.billNo;return}}
 field.value=nextPurchaseBillNo(date,editingPurchaseBillId);
}
function resetPurchaseForm(){editingPurchaseBillId=null;purchaseBillOriginalDate='';$('purchaseBillForm').reset();$('purchaseDate').value=today();$('purchaseBillNo').value='';updatePurchaseBillNo();$('purchaseCategory').value='';$('purchaseCashPaid').value=0;$('purchaseBankPaid').value=0;$('purchaseBillSubmit').textContent='Save purchase bill';$('cancelPurchaseEdit').hidden=true;purchaseLines=[defaultPurchaseLine()];renderPurchaseLines();fillChoices()}
$('purchaseDate').addEventListener('change',updatePurchaseBillNo);
$('addPurchaseLine').onclick=()=>{purchaseLines.push(defaultPurchaseLine());renderPurchaseLines()};
$('purchaseCashPaid').oninput=updatePurchaseTotals;$('purchaseBankPaid').oninput=updatePurchaseTotals;
$('addSupplier').onclick=()=>{let n=prompt('Enter supplier / store name:');if(n&&n.trim()){n=n.trim();if(!db.suppliers.includes(n))db.suppliers.push(n);fillChoices();$('purchaseSupplier').value=n;localSaveOnly()}};
$('purchaseBillForm').onsubmit=e=>{
 e.preventDefault();const supplier=$('purchaseSupplier').value.trim(),category=$('purchaseCategory').value,date=$('purchaseDate').value,cashPaid=Number($('purchaseCashPaid').value||0),bankPaid=Number($('purchaseBankPaid').value||0),total=currentPurchaseTotal();
 const lines=purchaseLines.map(l=>({id:l.lineId||crypto.randomUUID(),product:String(l.product||'').trim(),spec:String(l.spec||'').trim(),quantity:Number(l.quantity),unit:String(l.unit||'pcs'),rate:Number(l.rate),amount:purchaseLineAmount(l),costType:['family','member','unassigned'].includes(l.costType)?l.costType:'unassigned',costMember:String(l.costMember||'').trim()}));
 if(!supplier){alert('Select or add a supplier.');return}
 if(!date){alert('Select the purchase date.');return}
 if(!category){alert('Select a purchase category.');return}
 if(!lines.length||purchaseLines.some(l=>l.calcError)||lines.some(l=>!l.product||!(l.quantity>0)||!(l.rate>=0)||!(l.amount>=0)||!Number.isFinite(l.quantity)||!Number.isFinite(l.rate)||!Number.isFinite(l.amount))){alert('Enter a product name, valid quantity, rate and line amount for every bill line. For amount-based calculation, enter the required quantity or rate first.');return}
 if(cashPaid<0||bankPaid<0||cashPaid+bankPaid>total+0.000001){alert('Cash paid plus bank paid cannot exceed the bill total.');return}
 const old=editingPurchaseBillId?db.purchaseBills.find(b=>b.id===editingPurchaseBillId):null;
 const billNo=old&&date===purchaseBillOriginalDate?String(old.billNo||'').trim():nextPurchaseBillNo(date,editingPurchaseBillId);
 if(!billNo){alert('Could not generate a bill number. Check the purchase date and try again.');return}
 if(db.purchaseBills.some(b=>b.id!==editingPurchaseBillId&&String(b.billNo||'').trim().toLocaleLowerCase()===billNo.toLocaleLowerCase())){alert('This bill number already exists. Please try saving again to generate a unique number.');updatePurchaseBillNo();return}
 const values={supplier,category,billNo,date,lines,total,cashPaid,bankPaid,credit:Math.max(0,total-cashPaid-bankPaid),note:$('purchaseNote').value.trim()};
 if(editingPurchaseBillId){if(old){if(db.supplierPayments.some(p=>p.supplier===old.supplier||p.supplier===supplier)){alert('This bill has supplier payment history. To protect the supplier ledger, it cannot be edited safely.');return}Object.assign(old,values)}}
 else db.purchaseBills.unshift({id:crypto.randomUUID(),...values});
 if(!db.suppliers.includes(supplier))db.suppliers.push(supplier);lines.forEach(l=>{if(!db.productNames.includes(l.product))db.productNames.push(l.product);if(!db.units.includes(l.unit))db.units.push(l.unit)});
 resetPurchaseForm();save();
};
function inventoryAssignmentOptions(selectedValue='unassigned'){
 const options=[['unassigned','Not assigned'],['family','Family (split equally)']];
 db.familyMembers.forEach(name=>options.push([`member:${name}`,`Only ${name}`]));
 if(String(selectedValue).startsWith('member:')&&!options.some(([value])=>value===selectedValue))options.push([selectedValue,`Only ${String(selectedValue).slice(7)}`]);
 return options.map(([value,label])=>`<option value="${esc(value)}" ${value===selectedValue?'selected':''}>${esc(label)}</option>`).join('');
}
function inventoryEntries(){
 const rows=[];
 db.purchaseBills.forEach(b=>(b.lines||[]).forEach(l=>{
  const used=db.consumptions.filter(c=>c.billId===b.id&&c.lineId===l.id).reduce((t,c)=>t+Number(c.quantity||0),0);
  rows.push({bill:b,line:l,used,remaining:Math.max(0,Number(l.quantity||0)-used)});
 }));
 return rows.sort((a,b)=>String(b.bill.date||'').localeCompare(String(a.bill.date||'')));
}
function renderInventory(){
 const list=$('inventoryList');if(!list)return;
 const rows=inventoryEntries();
 const assigned=rows.filter(({line})=>line.costType==='family'||(line.costType==='member'&&line.costMember)).length;
 $('inventoryCount').textContent=`${rows.length} product lots · ${assigned} assigned`;
 list.innerHTML=rows.length?rows.map(({bill,line,used,remaining})=>{
  const amount=Number(line.amount??(Number(line.quantity||0)*Number(line.rate||0)));
  const assignment=line.costType==='family'?'Family · shared':line.costType==='member'?`For ${line.costMember}`:'Not assigned';
  const lineIndex=esc(line.id);
  return `<article class="inventory-row" data-inventory-line="${lineIndex}">
   <div class="inventory-row-head"><div><strong>${esc(line.product)}${line.spec?` · ${esc(line.spec)}`:''}</strong><small>${esc(bill.supplier||'Supplier')} · ${fmt(bill.date)}${bill.billNo?` · Bill #${esc(bill.billNo)}`:''}</small></div><strong>${money(amount)}</strong></div>
   <div class="inventory-row-stats"><span>Purchased <strong>${numberText(line.quantity)} ${esc(line.unit)}</strong></span><span>Used <strong>${numberText(used)} ${esc(line.unit)}</strong></span><span>In stock <strong>${numberText(remaining)} ${esc(line.unit)}</strong></span><span>Cost owner <strong>${esc(assignment)}</strong></span></div>
   <div class="inventory-row-actions"><label>Assign product cost <select data-inventory-assignment>${inventoryAssignmentOptions(line.costType==='member'?`member:${line.costMember||''}`:line.costType||'unassigned')}</select></label><div class="inventory-buttons"><button type="button" class="edit-btn" data-save-inventory-assignment>Save assignment</button><button type="button" class="secondary" data-use-inventory ${remaining<=0.000001?'disabled':''}>Use stock</button></div></div>
  </article>`;
 }).join(''):empty('No inventory yet. Save a purchase bill to add products to your inventory.');
 list.querySelectorAll('[data-save-inventory-assignment]').forEach(button=>button.onclick=()=>{
  const row=button.closest('[data-inventory-line]'),lineId=row?.dataset.inventoryLine,choice=row?.querySelector('[data-inventory-assignment]')?.value;
  const found=db.purchaseBills.flatMap(b=>(b.lines||[]).map(l=>({bill:b,line:l}))).find(x=>x.line.id===lineId);if(!found)return;
  if(String(choice).startsWith('member:')&&!String(choice).slice(7).trim()){alert('Choose a family member for this product.');return}
  found.line.costType=String(choice).startsWith('member:')?'member':choice;
  found.line.costMember=String(choice).startsWith('member:')?String(choice).slice(7):'';
  save();
 });
 list.querySelectorAll('[data-use-inventory]').forEach(button=>button.onclick=()=>{
  const row=button.closest('[data-inventory-line]'),lineId=row?.dataset.inventoryLine;
  const found=db.purchaseBills.flatMap(b=>(b.lines||[]).map(l=>({bill:b,line:l}))).find(x=>x.line.id===lineId);if(!found)return;
  const used=db.consumptions.filter(c=>c.billId===found.bill.id&&c.lineId===lineId).reduce((t,c)=>t+Number(c.quantity||0),0),remaining=Math.max(0,Number(found.line.quantity||0)-used);
  if(remaining<=0.000001)return;
  const raw=prompt(`How much ${found.line.product} stock was used? Available: ${numberText(remaining)} ${found.line.unit}`);if(raw===null)return;
  const quantity=Number(raw);if(!(quantity>0)||!Number.isFinite(quantity)||quantity>remaining+0.000001){alert(`Enter a quantity greater than 0 and no more than ${numberText(remaining)} ${found.line.unit}.`);return}
  db.consumptions.push({id:crypto.randomUUID(),billId:found.bill.id,lineId,quantity,date:today()});save();
 });
}

function supplierBillBalances(supplier){
 const rows=db.purchaseBills.filter(b=>b.supplier===supplier).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id))).map(b=>({bill:b,credit:billCredit(b),paid:0,remaining:billCredit(b)}));
 const payments=db.supplierPayments.filter(p=>p.supplier===supplier).slice().sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
 // Apply each payment only to bills that already existed on that payment date (oldest first).
 payments.forEach(payment=>{let amount=Number(payment.amount||0);rows.filter(r=>r.bill.date<=payment.date&&r.remaining>0).forEach(r=>{if(amount<=0)return;const applied=Math.min(r.remaining,amount);r.paid+=applied;r.remaining-=applied;amount-=applied})});
 return rows;
}
function renderSupplierAccounts(){
 const names=[...new Set([...db.suppliers,...db.purchaseBills.map(b=>b.supplier),...db.supplierPayments.map(p=>p.supplier)].filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 $('supplierList').innerHTML=names.length?names.map(name=>{const bills=db.purchaseBills.filter(b=>b.supplier===name),billed=bills.reduce((t,b)=>t+billTotal(b),0),due=supplierOutstanding(name),paid=db.supplierPayments.filter(p=>p.supplier===name).reduce((t,p)=>t+Number(p.amount||0),0);return `<button type="button" class="supplier-row" data-supplier="${esc(name)}"><span><strong>${esc(name)}</strong><small>${bills.length} bills · Billed ${money(billed)} · Credit paid ${money(paid)}</small></span><span><strong>${money(due)}</strong><small>Outstanding credit</small></span></button>`}).join(''):empty('No supplier accounts yet. Save a purchase bill to create one.');
 $('supplierList').querySelectorAll('[data-supplier]').forEach(btn=>btn.onclick=()=>openSupplierAccount(btn.dataset.supplier));
 $('purchaseBillCount').textContent=`${db.purchaseBills.length} bills`;
 $('purchaseBillList').innerHTML=db.purchaseBills.length?db.purchaseBills.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).map(b=>`<div class="item bill-summary"><div class="item-main"><div class="item-title">${esc(b.supplier)}${b.billNo?` · #${esc(b.billNo)}`:''}</div><div class="item-sub">${fmt(b.date)} · ${esc(b.category||'Uncategorised')} · ${(b.lines||[]).length} products · Cash ${money(b.cashPaid)} · Bank ${money(b.bankPaid)} · Credit ${money(billCredit(b))}</div></div><div class="expense-right"><div class="item-amount">${money(billTotal(b))}</div><div class="item-actions"><button type="button" class="edit-btn" data-open-supplier="${esc(b.supplier)}">Account</button><button type="button" class="edit-btn" data-edit-bill="${esc(b.id)}">Edit</button><button type="button" class="delete" data-delete-bill="${esc(b.id)}" aria-label="Delete purchase bill">×</button></div></div></div>`).join(''):empty('No purchase bills saved yet.');
 $('purchaseBillList').querySelectorAll('[data-open-supplier]').forEach(btn=>btn.onclick=()=>openSupplierAccount(btn.dataset.openSupplier));
 $('purchaseBillList').querySelectorAll('[data-edit-bill]').forEach(btn=>btn.onclick=()=>editPurchaseBill(btn.dataset.editBill));
 $('purchaseBillList').querySelectorAll('[data-delete-bill]').forEach(btn=>btn.onclick=()=>deletePurchaseBill(btn.dataset.deleteBill));
}
function openSupplierAccount(name){
 activeSupplierName=name;$('supplierAccountPanel').hidden=false;$('supplierAccountTitle').textContent=name;$('supplierAccountSubtitle').textContent='Supplier / creditor ledger';
 const bills=db.purchaseBills.filter(b=>b.supplier===name).slice().sort((a,b)=>b.date.localeCompare(a.date)),billed=bills.reduce((t,b)=>t+billTotal(b),0),due=supplierOutstanding(name),allocations=supplierBillBalances(name);
 $('supplierBilledTotal').textContent=money(billed);$('supplierDueTotal').textContent=money(due);$('paySupplierBtn').hidden=due<=0.000001;
 $('supplierAccountBills').innerHTML=bills.length?allocations.slice().reverse().map(({bill,credit,paid,remaining})=>`<article class="supplier-bill"><div class="supplier-bill-head"><div><strong>${fmt(bill.date)}${bill.billNo?` · Bill #${esc(bill.billNo)}`:''}</strong><small>${esc(bill.supplier)} · ${esc(bill.category||'Uncategorised')}</small></div><strong>${money(billTotal(bill))}</strong></div><div class="supplier-product-table"><div class="supplier-product-head"><span>Product</span><span>Qty</span><span>Rate</span><span>Amount</span></div>${(bill.lines||[]).map(l=>`<div class="supplier-product-row"><span><strong>${esc(l.product)}</strong>${l.spec?`<small>${esc(l.spec)}</small>`:''}</span><span>${numberText(l.quantity)} ${esc(l.unit)}</span><span>${money(l.rate)}</span><strong>${money(l.amount??(Number(l.quantity||0)*Number(l.rate||0)))}</strong></div>`).join('')}</div><div class="supplier-bill-foot"><span>Cash ${money(bill.cashPaid)} · Bank ${money(bill.bankPaid)} · Credit ${money(credit)}</span><strong>Credit remaining ${money(remaining)}</strong></div>${bill.note?`<p class="item-sub">${esc(bill.note)}</p>`:''}</article>`).join(''):empty('No bills for this supplier.');
 const payments=db.supplierPayments.filter(p=>p.supplier===name).slice().sort((a,b)=>b.date.localeCompare(a.date));
 $('supplierAccountPayments').innerHTML=payments.length?payments.map(p=>`<div class="breakrow"><span>${fmt(p.date)} · ${esc(p.method||'Cash')}${p.note?` · ${esc(p.note)}`:''}</span><strong>${money(p.amount)}</strong></div>`).join(''):empty('No supplier payments recorded yet.');
 $('supplierAccountPanel').scrollIntoView({behavior:'smooth',block:'start'});
}
$('closeSupplierAccount').onclick=()=>{$('supplierAccountPanel').hidden=true;activeSupplierName=null;$('supplierPaymentForm').hidden=true};
$('paySupplierBtn').onclick=()=>{
 if(!activeSupplierName)return;const due=supplierOutstanding(activeSupplierName);if(due<=0)return;
 payingSupplierName=activeSupplierName;$('supplierPaymentTitle').textContent=`Payment to ${activeSupplierName}`;$('supplierPaymentRemaining').textContent=`Remaining: ${money(due)}`;$('supplierPaymentAmount').value=due.toFixed(2);$('supplierPaymentAmount').max=due.toFixed(2);$('supplierPaymentDate').value=today();$('supplierPaymentMethod').value='Cash';$('supplierPaymentNote').value='';$('supplierPaymentForm').hidden=false;$('supplierPaymentForm').scrollIntoView({behavior:'smooth',block:'center'});
};
$('cancelSupplierPayment').onclick=()=>{payingSupplierName=null;$('supplierPaymentForm').reset();$('supplierPaymentForm').hidden=true};
$('supplierPaymentForm').onsubmit=e=>{
 e.preventDefault();if(!payingSupplierName)return;const amount=Number($('supplierPaymentAmount').value),due=supplierOutstanding(payingSupplierName);if(!(amount>0)||!Number.isFinite(amount)||amount>due+0.000001){alert(`Enter an amount greater than 0 and no more than ${money(due)}.`);return}
 db.supplierPayments.push({id:crypto.randomUUID(),supplier:payingSupplierName,amount,date:$('supplierPaymentDate').value,method:$('supplierPaymentMethod').value,note:$('supplierPaymentNote').value.trim()});payingSupplierName=null;$('supplierPaymentForm').reset();$('supplierPaymentForm').hidden=true;save();if(activeSupplierName)openSupplierAccount(activeSupplierName);
};
function renderProductPurchaseReport(){
 const range=$('productReportPeriod')?.value||'week';
 const end=today();let start;
 if(range==='week')start=startWeek(end);
 else if(range==='month')start=end.slice(0,7)+'-01';
 else start=end.slice(0,4)+'-01-01';
 const catalog=productCatalog();let grandTotal=0,productCount=0;
 const rows=catalog.map(p=>{
  let boughtNorm=0,boughtSpend=0,billIds=new Set(),lineCount=0;
  db.purchaseBills.filter(b=>b.date>=start&&b.date<=end).forEach(b=>(b.lines||[]).forEach(l=>{
   if(productKey(l.product,l.spec,l.unit)===p.key){
    const info=unitInfo(l.unit);
    boughtNorm+=Number(l.quantity||0)*info.factor;
    boughtSpend+=Number(l.amount??(Number(l.quantity||0)*Number(l.rate||0)));
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
 const periodLabel=range==='week'?'This week':range==='month'?'This month':'This year';
 $('productPurchaseReport').innerHTML=`<div class="product-report-summary"><div><span>${periodLabel} purchase cost</span><strong>${money(grandTotal)}</strong></div><div><span>Products purchased</span><strong>${productCount}</strong></div></div>${rows||empty(`No product purchases found for ${periodLabel.toLowerCase()}.`)}`;
}
function editPurchaseBill(id){
 const b=db.purchaseBills.find(x=>x.id===id);if(!b)return;
 const hasSupplierPayments=db.supplierPayments.some(p=>p.supplier===b.supplier);
 if(hasSupplierPayments){alert('This supplier has payment history, so this bill cannot be edited safely without changing the supplier ledger.');return}
 if(db.consumptions.some(c=>c.billId===id)){alert('This bill has stock usage records. Editing it could make the inventory quantity inaccurate, so it is locked.');return}
 editingPurchaseBillId=id;purchaseBillOriginalDate=String(b.date||'');ensureOption($('purchaseSupplier'),b.supplier);$('purchaseSupplier').value=b.supplier;
 const billCategory=b.category||'Uncategorised';if(!db.purchaseCategories.includes(billCategory))db.purchaseCategories.push(billCategory);fillChoices();$('purchaseCategory').value=billCategory;
 $('purchaseBillNo').value=b.billNo||'';$('purchaseDate').value=b.date||today();$('purchaseCashPaid').value=Number(b.cashPaid||0);$('purchaseBankPaid').value=Number(b.bankPaid||0);$('purchaseNote').value=b.note||'';
 purchaseLines=(b.lines||[]).map(l=>({lineId:l.id||null,product:l.product||'',spec:l.spec||'',quantity:Number(l.quantity||0),unit:l.unit||'pcs',rate:Number(l.rate||0),amount:Number(l.amount??(Number(l.quantity||0)*Number(l.rate||0))),amountMode:'rate',calcError:'',amountPending:false,costType:l.costType||'unassigned',costMember:l.costMember||''}));
 purchaseLines.forEach(l=>{if(!db.units.includes(l.unit))db.units.push(l.unit)});renderPurchaseLines();$('purchaseBillSubmit').textContent='Update purchase bill';$('cancelPurchaseEdit').hidden=false;$('purchaseBillForm').scrollIntoView({behavior:'smooth',block:'start'});
}
$('cancelPurchaseEdit').onclick=resetPurchaseForm;
function deletePurchaseBill(id){const b=db.purchaseBills.find(x=>x.id===id);if(!b)return;if(db.supplierPayments.some(p=>p.supplier===b.supplier)){alert('This supplier has payment history. Keep the bill to preserve the supplier ledger.');return}if(db.consumptions.some(c=>c.billId===id)){alert('This bill has stock usage records. It cannot be deleted because that would break the inventory history.');return}if(confirm('Delete this purchase bill?')){db.purchaseBills=db.purchaseBills.filter(x=>x.id!==id);save()}}

function resetExpenseForm(){
 editingExpenseId=null;$('expenseForm').reset();$('expenseDate').value=today();$('quantity').value=1;
 $('dueFields').hidden=true;$('duePaidFromField').hidden=true;$('duePerson').required=false;$('expenseFormTitle').textContent='Add expense';
 $('expenseSubmitBtn').textContent='Save expense';$('cancelExpenseEdit').hidden=true;$('expenseEditHint').hidden=true;
 fillChoices();$('expenseCostFor').value='family';calcTotal();
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
 fillExpenseCostOptions(x.costType==='member'&&x.costMember?`member:${x.costMember}`:x.costType==='family'?'family':'unassigned');
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
 const costChoice=$('expenseCostFor').value;
 const values={amount:quantity*rate,name,quantity,unit,rate,paymentType,costType:costChoice==='family'?'family':costChoice==='unassigned'?'unassigned':'member',costMember:costChoice.startsWith('member:')?costChoice.slice(7):'',dueDirection:paymentType==='Due'?$('dueDirection').value:null,duePerson:paymentType==='Due'?$('duePerson').value.trim():null,duePaidFrom:paymentType==='Due'&&$('dueDirection').value==='owed_to_me'?$('duePaidFrom').value:null,category:$('category').value,date:$('expenseDate').value,note:$('note').value.trim()};
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
 editingIncomeId=null;$('incomeForm').reset();$('incomeDate').value=today();if($('incomeSource').options.length)$('incomeSource').selectedIndex=0;
 const preferred=db.profile.name&&db.incomePeople.includes(db.profile.name)?db.profile.name:(db.incomePeople[0]||'Unassigned');$('incomeBy').value=preferred;
 $('incomeDueFields').hidden=true;$('incomeDuePerson').required=false;
 $('incomeFormTitle').textContent='Add income';$('incomeSubmitBtn').textContent='Save income';$('cancelIncomeEdit').hidden=true;$('incomeEditHint').hidden=true;$('incomeTotalPreview').textContent=money(0);
}
function editIncome(id){
 const x=db.incomes.find(item=>item.id===id);if(!x)return;
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
function deleteIncome(id){if(confirm('Delete this income entry and its collection history?')){if(collectingIncomeId===id)closeCollectForm();if(editingIncomeId===id)resetIncomeForm();db.incomes=db.incomes.filter(x=>x.id!==id);save()}}
$('incomeDateFilter').onchange=render;
$('incomeHeadFilter').onchange=render;
$('incomePersonFilter').onchange=render;
$('reportIncomePersonFilter').onchange=renderReport;
$('productReportPeriod').onchange=renderProductPurchaseReport;
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
 updateProfilePhotoPreview();renderFamilyMembers();
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
 $('recentExpenses').innerHTML=expenseHTML([...db.expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('recentIncome').innerHTML=incomeHTML([...db.incomes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('todayQuests').innerHTML=questHTML(qToday.slice(0,4),false);
 $('expenseCount').textContent=`${db.expenses.length} expenses · ${db.purchaseBills.length} bills`;
 let filtered=db.expenses.filter(x=>( $('expenseFilter').value==='all'||x.category===$('expenseFilter').value)&&(`${x.note} ${x.category}`).toLowerCase().includes($('expenseSearch').value.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
 $('expenseList').innerHTML=expenseHTML(filtered,true);$('questList').innerHTML=questHTML(dayQuests(d),true);renderSupplierAccounts();renderInventory();
 $('questSummary').textContent=`${done}/${qToday.length} completed`;$('incomeCount').textContent=`${db.incomes.length} entries`;
 const incomeFilter=$('incomeDateFilter').value,incomeHead=$('incomeHeadFilter').value,incomePerson=$('incomePersonFilter').value;const incomes=[...db.incomes].filter(x=>(!incomeFilter||x.date===incomeFilter)&&(incomeHead==='all'||(x.source||'Other')===incomeHead)&&(incomePerson==='all'||(x.incomeBy||'Unassigned')===incomePerson)).sort((a,b)=>b.date.localeCompare(a.date));$('incomeList').innerHTML=incomeHTML(incomes,true);
}
function expenseHTML(items,actions){return items.length?items.map(x=>{let title=x.name||x.note||x.category,settled=expenseSettledAmount(x),remaining=expenseOutstanding(x),direction=x.dueDirection==='i_owe'?'I owe':x.dueDirection==='owed_to_me'?'Owed to me':'Old due',dueInfo=x.paymentType==='Due'?[direction,x.duePerson,`Settled ${money(settled)} · Remaining ${money(remaining)}`].filter(Boolean).join(' · '):'',costInfo=x.costType==='family'?'Family · shared':x.costType==='member'?`For ${x.costMember}`:'Not assigned',details=[x.paymentType||'Cash',costInfo,dueInfo,x.quantity?`${x.quantity} ${x.unit||''} × ${money(x.rate||0)}`:x.category,fmt(x.date),x.note].filter(Boolean).join(' · ');let actionLabel=x.dueDirection==='i_owe'?'Pay due':'Collect';return `<div class="item expense-item"><div class="item-main"><div class="item-title">${esc(title)}</div><div class="item-sub">${esc(details)}</div></div><div class="expense-right"><div class="item-amount">${money(x.amount)}</div>${actions?`<div class="item-actions">${x.paymentType==='Due'&&remaining>0&&['i_owe','owed_to_me'].includes(x.dueDirection)?`<button class="collect-btn" onclick="openExpenseDueAction('${x.id}')">${actionLabel}</button>`:''}<button class="edit-btn" onclick="editExpense('${x.id}')" aria-label="Edit ${esc(title)}">Edit</button><button class="delete" onclick="delExpense('${x.id}')" aria-label="Delete ${esc(title)}">×</button></div>`:''}</div></div>`}).join(''):empty('No expenses yet. Add your first one above.') }
function incomeHTML(items,actions){
 if(!items.length)return empty('No income entries for this date. Add your first income above.');
 const groups={};items.forEach(x=>(groups[x.date||'Undated']??=[]).push(x));
 return Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(d=>{
  const rows=groups[d],dayTotal=sum(rows);
  const cards=rows.map(x=>{
   const collected=collectedAmount(x),remaining=incomeOutstanding(x),status=x.paymentType==='Due'?(remaining<=0.000001?'Fully collected':collected>0?'Partially collected':'Due'):x.paymentType||'Cash';
   const details=[`Income by: ${x.incomeBy||'Unassigned'}`,x.paymentType||'Cash',x.duePerson?`Customer: ${x.duePerson}`:'',x.note||'',x.paymentType==='Due'?`Collected ${money(collected)} · Due ${money(remaining)}`:''].filter(Boolean).join(' · ');
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
function renderFamilyCostReport(items,bills=[]){
 const familyMembers=[...new Map(db.familyMembers.map(name=>[name.toLocaleLowerCase(),name])).values()];
 const purchaseLines=bills.flatMap(b=>(b.lines||[]).map(line=>({amount:Number(line.amount??(Number(line.quantity||0)*Number(line.rate||0))),costType:line.costType||'unassigned',costMember:String(line.costMember||'').trim(),product:line.product||'Product'})));
 const familyExpenses=items.filter(x=>x.costType==='family');
 const memberExpenses=items.filter(x=>x.costType==='member'&&x.costMember);
 const unassignedExpenses=items.filter(x=>x.costType!=='family'&&!(x.costType==='member'&&x.costMember));
 const familyPurchases=purchaseLines.filter(x=>x.costType==='family');
 const memberPurchases=purchaseLines.filter(x=>x.costType==='member'&&x.costMember);
 const unassignedPurchases=purchaseLines.filter(x=>x.costType!=='family'&&!(x.costType==='member'&&x.costMember));
 const familyTotal=[...familyExpenses,...familyPurchases].reduce((total,x)=>total+Number(x.amount||0),0);
 const directTotal=[...memberExpenses,...memberPurchases].reduce((total,x)=>total+Number(x.amount||0),0);
 const unassignedTotal=[...unassignedExpenses,...unassignedPurchases].reduce((total,x)=>total+Number(x.amount||0),0);
 const people=[...new Map([...familyMembers,...memberExpenses.map(x=>x.costMember),...memberPurchases.map(x=>x.costMember)].map(name=>[name.toLocaleLowerCase(),name])).values()];
 const totalPaisa=Math.round(familyTotal*100),basePaisa=familyMembers.length?Math.floor(totalPaisa/familyMembers.length):0,remainderPaisa=familyMembers.length?totalPaisa%familyMembers.length:0;
 const directByMember=new Map(people.map(name=>[name,[...memberExpenses,...memberPurchases].filter(x=>x.costMember.toLocaleLowerCase()===name.toLocaleLowerCase()).reduce((total,x)=>total+Number(x.amount||0),0)]));
 const familyShareByMember=new Map(familyMembers.map((name,index)=>[name,(basePaisa+(index<remainderPaisa?1:0))/100]));
 $('familyCostTotal').textContent=money(familyTotal);
 $('familyCostMemberCount').textContent=`Split across ${familyMembers.length} ${familyMembers.length===1?'member':'members'}`;
 $('familyCostPerMember').textContent=familyMembers.length?money(familyTotal/familyMembers.length):'—';
 $('memberDirectCostTotal').textContent=money(directTotal);
 $('unassignedCostTotal').textContent=money(unassignedTotal);
 $('memberCostCount').textContent=`${people.length} ${people.length===1?'member':'members'}`;
 $('memberCostBreakdown').innerHTML=people.map(name=>{
  const direct=directByMember.get(name)||0,share=familyShareByMember.get(name)||0,total=direct+share;
  return `<div class="member-cost-row"><div><strong>${esc(name)}</strong><small>Personal: ${money(direct)} · Family share: ${money(share)}</small></div><strong>${money(total)}</strong></div>`;
 }).join('')||empty('Add family members in Profile to see the member-wise cost breakdown.');
 const notes=[];
 if(!familyMembers.length&&familyTotal>0)notes.push('Add family members in Profile before family costs can be divided.');
 if(unassignedTotal>0)notes.push(`${money(unassignedTotal)} is not included in the family or member totals. Assign unassigned purchase products in Expenses → Inventory and edit unassigned expenses to include them.`);
 $('familyCostNote').textContent=notes.join(' ')||'Member costing includes assigned expense entries and purchased inventory items. Family-assigned costs are divided equally among the current members listed in Profile.';
}
function renderReport(){
 let now=dateObj(today()),start,end,labels=[],days=[];
 if(period==='week'){start=dateObj(startWeek(today()));end=now;for(let i=0;i<7;i++){let x=new Date(start);x.setDate(x.getDate()+i);let s=x.toISOString().slice(0,10);days.push(s);labels.push(x.toLocaleDateString(undefined,{weekday:'short'}))}}
 else{start=new Date(now.getFullYear(),now.getMonth(),1);end=now;let n=now.getDate();for(let i=1;i<=n;i++){let x=new Date(now.getFullYear(),now.getMonth(),i);days.push(x.toISOString().slice(0,10));labels.push(i%5===1||i===n?String(i):'')}}
 let a=start.toISOString().slice(0,10),b=end.toISOString().slice(0,10),items=db.expenses.filter(x=>x.date>=a&&x.date<=b),bills=db.purchaseBills.filter(x=>x.date>=a&&x.date<=b),total=sum(items)+bills.reduce((t,x)=>t+billTotal(x),0);
 $('reportLabel').textContent=period==='week'?'THIS WEEK':'THIS MONTH';$('reportTotal').textContent=money(total);$('reportRange').textContent=`${fmt(a)} – ${fmt(b)}`;
 renderFamilyCostReport(items,bills);
 const selectedIncomePerson=$('reportIncomePersonFilter').value;
 const incomeInScope=db.incomes.filter(x=>selectedIncomePerson==='all'||(x.incomeBy||'Unassigned')===selectedIncomePerson);
 const incomeEntriesInPeriod=incomeInScope.filter(x=>x.date>=a&&x.date<=b);
 const receivedForPeriod=entries=>entries.reduce((total,x)=>total+(x.paymentType==='Due'?incomeCollections(x).filter(c=>c.date>=a&&c.date<=b).reduce((t,c)=>t+Number(c.amount||0),0):(x.date>=a&&x.date<=b?Number(x.amount||0):0)),0);
 const receivedInPeriod=receivedForPeriod(incomeInScope);
 $('reportIncomeTotal').textContent=money(sum(incomeEntriesInPeriod));$('reportIncomeCollected').textContent=money(receivedInPeriod);
 const peopleToShow=selectedIncomePerson==='all'?db.incomePeople:[selectedIncomePerson];
 $('incomePersonBreakdown').innerHTML=peopleToShow.map(person=>{
  const personEntries=db.incomes.filter(x=>(x.incomeBy||'Unassigned')===person),recorded=sum(personEntries.filter(x=>x.date>=a&&x.date<=b));
  const received=receivedForPeriod(personEntries);
  if(!recorded&&!received)return '';
  return `<div class="income-report-row"><div><strong>${esc(person)}</strong><small>Recorded: ${money(recorded)}</small></div><strong>${money(received)}<small> received</small></strong></div>`;
 }).filter(Boolean).join('')||empty('No income by person in the selected period.');
 const typesToShow=db.incomeHeads;
 $('incomeHeadBreakdown').innerHTML=typesToShow.map(type=>{
  const typeEntries=incomeInScope.filter(x=>(x.source||'Other')===type),recorded=sum(typeEntries.filter(x=>x.date>=a&&x.date<=b));
  const received=receivedForPeriod(typeEntries);
  if(!recorded&&!received)return '';
  return `<div class="income-report-row"><div><strong>${esc(type)}</strong><small>Recorded: ${money(recorded)}</small></div><strong>${money(received)}<small> received</small></strong></div>`;
 }).filter(Boolean).join('')||empty('No income by type for this person in the selected period.');showBalances();
 let vals=days.map(d=>sum(items.filter(x=>x.date===d))+bills.filter(x=>x.date===d).reduce((t,x)=>t+billTotal(x),0)),max=Math.max(...vals,1);
 $('reportBars').innerHTML=vals.map((v,i)=>`<div class="bar-wrap"><div class="bar" title="${money(v)}" style="height:${Math.max(v?3:1,v/max*82)}px"></div><span class="bar-label">${labels[i]}</span></div>`).join('');
 let cats={};items.forEach(x=>cats[x.category]=(cats[x.category]||0)+Number(x.amount));bills.forEach(x=>{const cat=x.category||'Uncategorised';cats[cat]=(cats[cat]||0)+billTotal(x)});
 $('categoryBreakdown').innerHTML=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="breakrow"><span>${esc(k)}</span><strong>${money(v)}</strong></div>`).join('')||empty('No expenses in this period.');
 let all=0,done=0;days.forEach(d=>dayQuests(d).forEach(q=>{const state=questCheckState(q,d);all+=state.length;done+=state.filter(Boolean).length}));$('achievementRate').textContent=(all?Math.round(done/all*100):0)+'%';
 renderProductPurchaseReport();renderDueReport();
}
function renderDueReport(){
 let due=db.expenses.filter(x=>x.paymentType==='Due'),iOwe=due.filter(x=>x.dueDirection==='i_owe'&&expenseOutstanding(x)>0),owedExpenses=due.filter(x=>x.dueDirection==='owed_to_me'&&expenseOutstanding(x)>0),incomeDue=db.incomes.filter(x=>x.paymentType==='Due'&&incomeOutstanding(x)>0),legacy=due.filter(x=>!['i_owe','owed_to_me'].includes(x.dueDirection));
 const supplierTotal=db.suppliers.reduce((t,name)=>t+supplierOutstanding(name),0);
 const iOweTotal=iOwe.reduce((t,x)=>t+expenseOutstanding(x),0)+supplierTotal,owedExpenseTotal=owedExpenses.reduce((t,x)=>t+expenseOutstanding(x),0),incomeDueTotal=incomeDue.reduce((t,x)=>t+incomeOutstanding(x),0);
 $('iOweTotal').textContent=money(iOweTotal);$('owedToMeTotal').textContent=money(owedExpenseTotal+incomeDueTotal);
 const grouped=(expenseItems,incomeItems=[])=>{let people={};expenseItems.forEach(x=>{let person=(x.duePerson||'Unknown person').trim()||'Unknown person';people[person]=(people[person]||0)+expenseOutstanding(x)});incomeItems.forEach(x=>{let person=(x.duePerson||'Unknown person').trim()||'Unknown person';people[person]=(people[person]||0)+incomeOutstanding(x)});return Object.entries(people).sort((a,b)=>b[1]-a[1]).map(([person,total])=>`<div class="breakrow"><span>${esc(person)}</span><strong>${money(total)}</strong></div>`).join('')||empty('No dues recorded here yet.')};
 const supplierRows=db.suppliers.map(name=>({name,due:supplierOutstanding(name)})).filter(x=>x.due>0.000001).map(x=>`<button class="breakrow creditor-link" type="button" data-creditor="${esc(x.name)}"><span>${esc(x.name)} · Supplier</span><strong>${money(x.due)}</strong></button>`).join('');
 $('iOweList').innerHTML=[grouped(iOwe),supplierRows].filter(Boolean).join('')||empty('No dues recorded here yet.');$('iOweList').querySelectorAll('[data-creditor]').forEach(btn=>btn.onclick=()=>{setTab('expenses');openSupplierAccount(btn.dataset.creditor)});$('owedToMeList').innerHTML=grouped(owedExpenses,incomeDue);
 $('incomeDueList').innerHTML=incomeDue.length?incomeDue.map(x=>`<div class="breakrow"><span>${esc(x.source)} · ${esc(x.duePerson||'Unknown person')}</span><strong>${money(incomeOutstanding(x))}</strong></div>`).join(''):empty('No outstanding income dues.');
 $('unassignedDueHint').hidden=!legacy.length;$('unassignedDueHint').textContent=legacy.length?`${legacy.length} older Due ${legacy.length===1?'entry is':'entries are'} not assigned to either side. These older records are preserved and excluded from the two totals.`:'';
}
purchaseLines=[defaultPurchaseLine()];renderPurchaseLines();fillChoices();$('purchaseDate').value=today();updatePurchaseBillNo();applyThemeColor(db.settings.themeColor,false);renderPurchaseCategorySettings();
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dayquest-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.expenses)||!Array.isArray(x.quests)||typeof x.checks!=='object')throw Error();if(!Array.isArray(x.incomes))x.incomes=[];if(!Array.isArray(x.purchaseBills))x.purchaseBills=[];if(!Array.isArray(x.supplierPayments))x.supplierPayments=[];if(!Array.isArray(x.suppliers))x.suppliers=[];if(!Array.isArray(x.productNames))x.productNames=[];if(!Array.isArray(x.purchaseCategories))x.purchaseCategories=['Assets','Staples','Fixed Ex.'];if(!x.settings||typeof x.settings!=='object')x.settings={themeColor:'#263b5c'};if(!Array.isArray(x.consumptions))x.consumptions=[];if(!Array.isArray(x.incomeHeads))x.incomeHeads=['Salary','Business','Sales','Freelance','Rent','Gift','Other'];if(!Array.isArray(x.incomePeople))x.incomePeople=[];if(!x.profile||typeof x.profile!=='object')x.profile={name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};if(!Array.isArray(x.familyMembers))x.familyMembers=[];if(confirm('Replace current data with this backup?')){db=x;db.incomes=Array.isArray(db.incomes)?db.incomes:[];db.expenses=Array.isArray(db.expenses)?db.expenses:[];db.expenses.forEach(item=>{if(!['family','member','unassigned'].includes(item.costType))item.costType=item.costMember?'member':'unassigned';item.costMember=String(item.costMember||'').trim();if(item.costType==='member'&&!item.costMember)item.costType='unassigned'});db.purchaseBills=Array.isArray(db.purchaseBills)?db.purchaseBills:[];db.supplierPayments=Array.isArray(db.supplierPayments)?db.supplierPayments:[];db.suppliers=Array.isArray(db.suppliers)?[...new Set(db.suppliers)]:[];db.productNames=Array.isArray(db.productNames)?db.productNames:[];
db.productNames=[...new Map(db.productNames.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);db.consumptions=Array.isArray(db.consumptions)?db.consumptions:[];normalizePurchaseInventory();db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];db.settings=db.settings&&typeof db.settings==='object'?db.settings:{themeColor:'#263b5c'};db.expenseNames=Array.isArray(db.expenseNames)?db.expenseNames:['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];db.units=Array.isArray(db.units)?db.units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];db.purchaseBills.forEach(b=>{if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);(b.lines||[]).forEach(l=>{if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product)})});db.supplierPayments.forEach(p=>{if(p.supplier&&!db.suppliers.includes(p.supplier))db.suppliers.push(p.supplier)});db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];normalizePurchaseBillNumbers();db.profile=db.profile||{name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};db.profile.familyName=String(db.profile.familyName||'');db.profile.photoData=typeof db.profile.photoData==='string'&&db.profile.photoData.startsWith('data:image/')?db.profile.photoData:'';db.familyMembers=Array.isArray(db.familyMembers)?db.familyMembers.map(n=>String(n||'').trim()).filter(Boolean):[];db.familyMembers=[...new Map(db.familyMembers.map(n=>[n.toLocaleLowerCase(),n])).values()];db.incomePeople=Array.isArray(db.incomePeople)?db.incomePeople:[];if(db.profile.name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===db.profile.name.toLocaleLowerCase()))db.familyMembers.unshift(db.profile.name);db.familyMembers.forEach(name=>{if(!db.incomePeople.includes(name))db.incomePeople.push(name)});db.incomes.forEach(item=>{item.incomeBy=String(item.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(item.incomeBy))db.incomePeople.push(item.incomeBy)});if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');fillChoices();loadProfileForm();applyThemeColor(db.settings.themeColor||'#263b5c',false);renderPurchaseCategorySettings();save();alert('Backup restored.')}}catch{alert('That backup file is not valid.')}e.target.value=''};
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
