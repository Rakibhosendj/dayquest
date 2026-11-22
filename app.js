const $=id=>document.getElementById(id), today=()=>new Date().toISOString().slice(0,10);
const appPageHistory=[];
let adminCloudUnlocked=false;
const ADMIN_PASSWORD_ITERATIONS=310000;
const SIDE_MENU_DEFAULT_ORDER=['home','expenses','inventory','budget','production','supplierAccounts','outstanding','loans','income','meals','quests','reports','profile','settings'];
function normalizeSideMenuOrder(value){
 const valid=new Set(SIDE_MENU_DEFAULT_ORDER);
 const picked=Array.isArray(value)?value.filter(key=>valid.has(key)):[];
 return [...new Set(picked),...SIDE_MENU_DEFAULT_ORDER.filter(key=>!picked.includes(key))];
}
const DEFAULT_PRODUCT_DICTIONARY=[{"english":"Rice","bangla":"চাল"},{"english":"Miniket Rice","bangla":"মিনিকেট চাল"},{"english":"Nazirshail Rice","bangla":"নাজিরশাইল চাল"},{"english":"Basmati Rice","bangla":"বাসমতী চাল"},{"english":"Brown Rice","bangla":"লাল চাল"},{"english":"Flattened Rice (Chira)","bangla":"চিড়া"},{"english":"Puffed Rice (Muri)","bangla":"মুড়ি"},{"english":"Wheat Flour (Atta)","bangla":"আটা"},{"english":"All-purpose Flour (Maida)","bangla":"ময়দা"},{"english":"Semolina (Suji)","bangla":"সুজি"},{"english":"Vermicelli (Shemai)","bangla":"সেমাই"},{"english":"Lentils (Dal)","bangla":"ডাল"},{"english":"Red Lentils (Masoor Dal)","bangla":"মসুর ডাল"},{"english":"Yellow Split Peas (Moong Dal)","bangla":"মুগ ডাল"},{"english":"Chickpeas (Chhola)","bangla":"ছোলা"},{"english":"Black Gram (Mashkalai Dal)","bangla":"মাষকলাই ডাল"},{"english":"Peas","bangla":"মটরশুঁটি"},{"english":"Soybean Oil","bangla":"সয়াবিন তেল"},{"english":"Mustard Oil","bangla":"সরিষার তেল"},{"english":"Palm Oil","bangla":"পাম তেল"},{"english":"Ghee","bangla":"ঘি"},{"english":"Salt","bangla":"লবণ"},{"english":"Sugar","bangla":"চিনি"},{"english":"Jaggery","bangla":"গুড়"},{"english":"Tea","bangla":"চা"},{"english":"Coffee","bangla":"কফি"},{"english":"Milk","bangla":"দুধ"},{"english":"Powdered Milk","bangla":"গুঁড়া দুধ"},{"english":"Yogurt","bangla":"দই"},{"english":"Butter","bangla":"মাখন"},{"english":"Cheese","bangla":"পনির"},{"english":"Eggs","bangla":"ডিম"},{"english":"Chicken","bangla":"মুরগি"},{"english":"Beef","bangla":"গরুর মাংস"},{"english":"Mutton","bangla":"খাসির মাংস"},{"english":"Fish","bangla":"মাছ"},{"english":"Hilsa Fish","bangla":"ইলিশ মাছ"},{"english":"Rohu Fish","bangla":"রুই মাছ"},{"english":"Tilapia Fish","bangla":"তেলাপিয়া মাছ"},{"english":"Prawns","bangla":"চিংড়ি"},{"english":"Dried Fish","bangla":"শুঁটকি"},{"english":"Potato","bangla":"আলু"},{"english":"Onion","bangla":"পেঁয়াজ"},{"english":"Garlic","bangla":"রসুন"},{"english":"Ginger","bangla":"আদা"},{"english":"Tomato","bangla":"টমেটো"},{"english":"Green Chilli","bangla":"কাঁচা মরিচ"},{"english":"Red Chilli Powder","bangla":"মরিচ গুঁড়া"},{"english":"Turmeric Powder","bangla":"হলুদ গুঁড়া"},{"english":"Cumin","bangla":"জিরা"},{"english":"Coriander","bangla":"ধনিয়া"},{"english":"Cinnamon","bangla":"দারুচিনি"},{"english":"Cardamom","bangla":"এলাচ"},{"english":"Cloves","bangla":"লবঙ্গ"},{"english":"Bay Leaf","bangla":"তেজপাতা"},{"english":"Black Pepper","bangla":"গোলমরিচ"},{"english":"Brinjal (Eggplant)","bangla":"বেগুন"},{"english":"Cucumber","bangla":"শসা"},{"english":"Carrot","bangla":"গাজর"},{"english":"Cauliflower","bangla":"ফুলকপি"},{"english":"Cabbage","bangla":"বাঁধাকপি"},{"english":"Pumpkin","bangla":"মিষ্টি কুমড়া"},{"english":"Bottle Gourd","bangla":"লাউ"},{"english":"Spinach","bangla":"পালং শাক"},{"english":"Red Amaranth","bangla":"লাল শাক"},{"english":"Coriander Leaves","bangla":"ধনেপাতা"},{"english":"Lemon","bangla":"লেবু"},{"english":"Green Banana","bangla":"কাঁচা কলা"},{"english":"Banana","bangla":"কলা"},{"english":"Mango","bangla":"আম"},{"english":"Jackfruit","bangla":"কাঁঠাল"},{"english":"Apple","bangla":"আপেল"},{"english":"Orange","bangla":"কমলা"},{"english":"Papaya","bangla":"পেঁপে"},{"english":"Bread","bangla":"পাউরুটি"},{"english":"Biscuits","bangla":"বিস্কুট"},{"english":"Noodles","bangla":"নুডলস"},{"english":"Pasta","bangla":"পাস্তা"},{"english":"Tomato Sauce","bangla":"টমেটো সস"},{"english":"Chips","bangla":"চিপস"},{"english":"Dates","bangla":"খেজুর"},{"english":"Peanuts","bangla":"চিনাবাদাম"},{"english":"Bathing Soap","bangla":"গোসলের সাবান"},{"english":"Laundry Detergent","bangla":"কাপড় কাচার ডিটারজেন্ট"},{"english":"Dishwashing Liquid","bangla":"বাসন ধোয়ার তরল"},{"english":"Dishwashing Bar","bangla":"বাসন ধোয়ার সাবান"},{"english":"Shampoo","bangla":"শ্যাম্পু"},{"english":"Toothpaste","bangla":"টুথপেস্ট"},{"english":"Toothbrush","bangla":"টুথব্রাশ"},{"english":"Tissue Paper","bangla":"টিস্যু পেপার"},{"english":"Toilet Cleaner","bangla":"টয়লেট ক্লিনার"},{"english":"Floor Cleaner","bangla":"মেঝে পরিষ্কারের তরল"},{"english":"Phenyl","bangla":"ফিনাইল"},{"english":"Drinking Water","bangla":"পানীয় জল"},{"english":"LPG Gas","bangla":"এলপিজি গ্যাস"},{"english":"Matchbox","bangla":"দেশলাই"},{"english":"Mosquito Coil","bangla":"মশার কয়েল"},{"english":"Light Bulb","bangla":"বৈদ্যুতিক বাল্ব"},{"english":"Battery","bangla":"ব্যাটারি"},{"english":"Candle","bangla":"মোমবাতি"},{"english":"Baby Diaper","bangla":"শিশুর ডায়াপার"},{"english":"Sanitary Napkin","bangla":"স্যানিটারি ন্যাপকিন"},{"english":"Garbage Bag","bangla":"ময়লার ব্যাগ"}];
function normalizeProductDictionary(entries){
 const source=Array.isArray(entries)?entries:DEFAULT_PRODUCT_DICTIONARY;
 const seen=new Set();
 return source.map(item=>({english:String(item?.english??item?.en??'').trim(),bangla:String(item?.bangla??item?.bn??'').trim(),meal:item?.meal!==false})).filter(item=>{
  if(!item.english||!item.bangla)return false;
  const key=item.english.toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true;
 });
}
const load=()=>{try{return JSON.parse(localStorage.getItem('dayquest_v1'))||{expenses:[],quests:[],checks:{}}}catch{return{expenses:[],quests:[],checks:{}}}};
let db=load(),deferredInstall=null,editingExpenseId=null,editingIncomeId=null,collectingIncomeId=null,settlingExpenseId=null,activeSupplierName=null,payingSupplierName=null,purchaseLines=[],editingPurchaseBillId=null,purchaseBillOriginalDate='',salesMemoLines=[],editingSalesMemoId=null,editingQuickActionId=null,editingLoanId=null,settlingLoanId=null;
db.sideMenuOrder=normalizeSideMenuOrder(db.sideMenuOrder);
let quickActionMode='add';
db.expenses=Array.isArray(db.expenses)?db.expenses:[];
db.expenses.forEach(x=>{if(!['family','member','unassigned','members'].includes(x.costType))x.costType=x.costMember?'member':'unassigned';x.costMember=String(x.costMember||'').trim();if(x.costType==='member'&&!x.costMember)x.costType='unassigned'});
db.expenseNames=db.expenseNames||['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
db.quickActions=Array.isArray(db.quickActions)?db.quickActions:[];
db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];
db.productTypes=Array.isArray(db.productTypes)&&db.productTypes.length?db.productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];
db.productTypes=[...new Map(db.productTypes.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);
db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
db.settings.notificationPreferences={dailyQuest:true,expenseDue:true,incomeDue:true,loanGiven:true,loanTaken:true,enabled:false,...(db.settings.notificationPreferences&&typeof db.settings.notificationPreferences==='object'?db.settings.notificationPreferences:{})};
if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.themeColor||'')))db.settings.themeColor='#263b5c';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.backgroundColor||'')))db.settings.backgroundColor='#f3f5f9';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.sideMenuColor||'')))db.settings.sideMenuColor='#111d30';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.topBarColor||'')))db.settings.topBarColor='#101827';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.quickButtonColor||'')))db.settings.quickButtonColor='#ee7d2f';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.backgroundColor||'')))db.settings.backgroundColor='#f3f5f9';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.sideMenuColor||'')))db.settings.sideMenuColor='#111d30';if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.topBarColor||'')))db.settings.topBarColor='#101827';
if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.quickButtonColor||'')))db.settings.quickButtonColor='#ee7d2f';
if(typeof db.settings.quickButtonVibration!=='boolean')db.settings.quickButtonVibration=true;
db.productDictionary=normalizeProductDictionary(db.productDictionary);if(!db.settings.mealDictionaryDefaultsApplied){db.productDictionary.forEach(item=>item.meal=true);db.settings.mealDictionaryDefaultsApplied=true;}
if(typeof db.settings.requireSupplierForDuePurchase!=='boolean')db.settings.requireSupplierForDuePurchase=true;if(typeof db.settings.allowPurchaseBillEdits!=='boolean')db.settings.allowPurchaseBillEdits=true;
db.units=Array.isArray(db.units)&&db.units.length?db.units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];
db.units=[...new Map(db.units.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);
db.incomes=Array.isArray(db.incomes)?db.incomes:[];
db.loans=Array.isArray(db.loans)?db.loans:[];
db.loans.forEach(loan=>{loan.id=String(loan.id||crypto.randomUUID());loan.type=loan.type==='taken'?'taken':'given';loan.party=String(loan.party||'').trim();loan.amount=Math.max(0,Number(loan.amount)||0);loan.method=loan.method==='Bank'?'Bank':'Cash';loan.date=String(loan.date||'');loan.dueDate=String(loan.dueDate||'');loan.note=String(loan.note||'');loan.settlements=Array.isArray(loan.settlements)?loan.settlements:[];loan.installmentFrequency=['weekly','fortnightly','monthly'].includes(loan.installmentFrequency)?loan.installmentFrequency:'monthly';loan.installments=Array.isArray(loan.installments)?loan.installments:[];if(!loan.installments.length&&loan.dueDate)loan.installments=[{id:'legacy-'+loan.id,dueDate:loan.dueDate,amount:loan.amount}];loan.installments=loan.installments.map((item,index)=>({id:String(item.id||('installment-'+(index+1)+'-'+loan.id)),dueDate:String(item.dueDate||''),amount:Math.max(0,Number(item.amount)||0)})).filter(item=>item.dueDate&&item.amount>0);if(loan.installments.length)loan.dueDate=loan.installments[loan.installments.length-1].dueDate;loan.installmentCount=Math.max(1,Math.floor(Number(loan.installmentCount)||loan.installments.length||1))});
db.loans=Array.isArray(db.loans)?db.loans:[];
db.loans.forEach(loan=>{loan.id=String(loan.id||crypto.randomUUID());loan.type=loan.type==='taken'?'taken':'given';loan.party=String(loan.party||'').trim();loan.amount=Math.max(0,Number(loan.amount)||0);loan.method=loan.method==='Bank'?'Bank':'Cash';loan.date=String(loan.date||'');loan.dueDate=String(loan.dueDate||'');loan.note=String(loan.note||'');loan.settlements=Array.isArray(loan.settlements)?loan.settlements:[]});
db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];
db.incomes.forEach(x=>{if(x.source&&!db.incomeHeads.includes(x.source))db.incomeHeads.push(x.source)});
db.profile=db.profile&&typeof db.profile==='object'?db.profile:{name:'',phone:'',address:'',openingCash:0,openingBank:0};
db.profile.address=String(db.profile.address||'');
db.profile.phone=String(db.profile.phone||'');db.profile.phone2=String(db.profile.phone2||'');
db.profile.familyName=String(db.profile.familyName||'');
db.profile.photoData=typeof db.profile.photoData==='string'&&db.profile.photoData.startsWith('data:image/')?db.profile.photoData:'';
['country','division','district','subDistrict','village','road','religion','gender','birthDate'].forEach(field=>db.profile[field]=String(db.profile[field]||''));
db.familyMembers=Array.isArray(db.familyMembers)?db.familyMembers.map(n=>String(n||'').trim()).filter(Boolean):[];
db.familyMembers=[...new Map(db.familyMembers.map(n=>[n.toLocaleLowerCase(),n])).values()];
db.guestPeople=Array.isArray(db.guestPeople)?db.guestPeople.map(n=>String(n||'').trim()).filter(Boolean):[];
db.guestPeople=[...new Map(db.guestPeople.map(n=>[n.toLocaleLowerCase(),n])).values()];
db.guestRelations=db.guestRelations&&typeof db.guestRelations==='object'&&!Array.isArray(db.guestRelations)?db.guestRelations:{};
db.guests=Array.isArray(db.guests)?db.guests.filter(g=>g&&Array.isArray(g.members)&&g.members.length&&/^\d{4}-\d{2}-\d{2}$/.test(String(g.entryDate||''))):[];db.guests.forEach(g=>{g.relation=String(g.relation||'')});
db.guests.forEach(g=>{g.id=g.id||crypto.randomUUID();g.members=uniquePeople(g.members);g.outDate=String(g.outDate||'');if(g.outDate&&g.outDate<g.entryDate)g.outDate='';g.purpose=String(g.purpose||'');g.relation=String(g.relation||'');g.members.forEach(n=>{if(!db.guestPeople.some(x=>x.toLocaleLowerCase()===n.toLocaleLowerCase())&&!db.familyMembers.some(x=>x.toLocaleLowerCase()===n.toLocaleLowerCase()))db.guestPeople.push(n)})});
function uniquePeople(names){return [...new Map((names||[]).map(n=>String(n||'').trim()).filter(Boolean).map(n=>[n.toLocaleLowerCase(),n])).values()]}
function assignablePeople(){return uniquePeople([...db.familyMembers,...db.guestPeople])}
function memberProfileKey(name){return String(name||'').trim().toLocaleLowerCase()}
function composeMemberAddress(p){return [p?.road,p?.village,p?.subDistrict,p?.district,p?.division,p?.country].map(v=>String(v||'').trim()).filter(Boolean).join(', ')}

const BD_LOCATION_DATA_URL='https://iqbalhasandev.github.io/bangladesh-geo-json/bangladesh-geo.json';
let bdLocationTree=null;
function locationName(item){const value=item?.name;return String(typeof value==='object'?(value.en||value.local||''):(value||item?.name_en||'')).trim()}
function locationChildren(list){return Array.isArray(list)?list:[]}
async function loadBangladeshLocations(){
 if(bdLocationTree)return bdLocationTree;
 try{
  const cached=localStorage.getItem('dayquest-bd-location-tree-v1');
  if(cached){const parsed=JSON.parse(cached);if(Array.isArray(parsed)&&parsed.length){bdLocationTree=parsed;return parsed}}
 }catch{}
 try{
  const response=await fetch(BD_LOCATION_DATA_URL,{cache:'force-cache'});
  if(!response.ok)throw new Error('Location data unavailable');
  const data=await response.json();
  const tree=Array.isArray(data)?data:(Array.isArray(data.divisions)?data.divisions:[]);
  if(tree.length){bdLocationTree=tree;try{localStorage.setItem('dayquest-bd-location-tree-v1',JSON.stringify(tree))}catch{}}
 }catch(error){console.warn('Bangladesh location list could not be loaded; manual address entry remains available.',error)}
 return bdLocationTree||[];
}
function setLocationOptions(inputId,values){
 const input=$(inputId);if(!input)return;
 const listId=input.getAttribute('list'),list=listId?$(listId):null;if(!list)return;
 list.innerHTML=[...new Set(values.map(v=>String(v||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b)).map(v=>`<option value="${esc(v)}"></option>`).join('');
}
function attachAddressCascade(prefix){
 const country=$(prefix+'Country'),division=$(prefix+'Division'),district=$(prefix+'District'),subDistrict=$(prefix+'SubDistrict');
 if(!country||!division||!district||!subDistrict)return;
 const update=async()=>{
  const tree=await loadBangladeshLocations();
  const isBangladesh=/^bangladesh$/i.test(country.value.trim());
  if(!isBangladesh){setLocationOptions(division.id,[]);setLocationOptions(district.id,[]);setLocationOptions(subDistrict.id,[]);return}
  const divisions=tree.map(locationName).filter(Boolean);
  setLocationOptions(division.id,divisions);
  const selectedDivision=tree.find(x=>locationName(x).toLocaleLowerCase()===division.value.trim().toLocaleLowerCase());
  const districts=locationChildren(selectedDivision?.districts);
  setLocationOptions(district.id,districts.map(locationName));
  const selectedDistrict=districts.find(x=>locationName(x).toLocaleLowerCase()===district.value.trim().toLocaleLowerCase());
  setLocationOptions(subDistrict.id,locationChildren(selectedDistrict?.upazilas).map(locationName));
 };
 country.addEventListener('change',update);country.addEventListener('input',update);
 division.addEventListener('change',()=>{district.value='';subDistrict.value='';update()});
 division.addEventListener('input',()=>{district.value='';subDistrict.value='';update()});
 district.addEventListener('change',()=>{subDistrict.value='';update()});
 district.addEventListener('input',()=>{subDistrict.value='';update()});
 update();
}
function initializeAddressCascades(){
 ['signup','profile','memberProfile'].forEach(attachAddressCascade);
}
function ensureMemberProfile(name){
 const key=memberProfileKey(name);if(!key)return null;
 db.memberProfiles=db.memberProfiles&&typeof db.memberProfiles==='object'&&!Array.isArray(db.memberProfiles)?db.memberProfiles:{};
 const p=db.memberProfiles[key]&&typeof db.memberProfiles[key]==='object'?db.memberProfiles[key]:{};
 db.memberProfiles[key]={fullName:String(name).trim(),phone:'',phone2:'',email:'',gender:'',religion:'',birthDate:'',relation:'',occupation:'',country:'',division:'',district:'',subDistrict:'',village:'',road:'',notes:'',photoData:'',...p};
 db.memberProfiles[key].photoData=typeof db.memberProfiles[key].photoData==='string'&&db.memberProfiles[key].photoData.startsWith('data:image/')?db.memberProfiles[key].photoData:'';
 return db.memberProfiles[key];
}
function ensureAccountHolderMember(){
 const name=String(db.profile?.name||'').trim();if(!name)return;
 db.familyMembers=uniquePeople([name,...(db.familyMembers||[])]);
 db.incomePeople=uniquePeople([name,...(db.incomePeople||[])]);
 const p=ensureMemberProfile(name);Object.assign(p,{phone:p.phone||db.profile.phone||'',phone2:p.phone2||db.profile.phone2||'',gender:p.gender||db.profile.gender||'',religion:p.religion||db.profile.religion||'',birthDate:p.birthDate||db.profile.birthDate||'',country:p.country||db.profile.country||'',division:p.division||db.profile.division||'',district:p.district||db.profile.district||'',subDistrict:p.subDistrict||db.profile.subDistrict||'',village:p.village||db.profile.village||'',road:p.road||db.profile.road||'',photoData:p.photoData||db.profile.photoData||''});
}
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
db.budgetPlans=db.budgetPlans&&typeof db.budgetPlans==='object'&&!Array.isArray(db.budgetPlans)?db.budgetPlans:{};
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
db.supplierDetails=db.supplierDetails&&typeof db.supplierDetails==='object'&&!Array.isArray(db.supplierDetails)?db.supplierDetails:{};
db.quickSuppliers=Array.isArray(db.quickSuppliers)?[...new Set(db.quickSuppliers.filter(name=>db.suppliers.includes(name)))]:[];
db.mealPlan=db.mealPlan&&typeof db.mealPlan==='object'?db.mealPlan:{};db.mealPlan.defaultCount=Math.max(0,Math.floor(Number(db.mealPlan.defaultCount??3)||0));db.mealPlan.dateCounts=db.mealPlan.dateCounts&&typeof db.mealPlan.dateCounts==='object'?db.mealPlan.dateCounts:{};db.mealPlan.memberStatus=db.mealPlan.memberStatus&&typeof db.mealPlan.memberStatus==='object'?db.mealPlan.memberStatus:{};db.mealPlan.memberCounts=db.mealPlan.memberCounts&&typeof db.mealPlan.memberCounts==='object'?db.mealPlan.memberCounts:{};db.mealPlan.memberChecks=db.mealPlan.memberChecks&&typeof db.mealPlan.memberChecks==='object'?db.mealPlan.memberChecks:{};db.mealPlan.personDates=db.mealPlan.personDates&&typeof db.mealPlan.personDates==='object'?db.mealPlan.personDates:{};db.mealPlan.guestStatus=db.mealPlan.guestStatus&&typeof db.mealPlan.guestStatus==='object'?db.mealPlan.guestStatus:{};db.mealPlan.guestAssignments=db.mealPlan.guestAssignments&&typeof db.mealPlan.guestAssignments==='object'?db.mealPlan.guestAssignments:{};db.mealPlan.guestChecks=db.mealPlan.guestChecks&&typeof db.mealPlan.guestChecks==='object'?db.mealPlan.guestChecks:{};db.mealPlan.costPerMeal=Math.max(0,Number(db.mealPlan.costPerMeal)||0);
db.productNames=Array.isArray(db.productNames)?db.productNames:[];
db.productNames=[...new Map(db.productNames.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);
db.consumptions=Array.isArray(db.consumptions)?db.consumptions:[];
db.productions=Array.isArray(db.productions)?db.productions:[];
function normalizePurchaseInventory(){
 db.purchaseBills.forEach(b=>{
  if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);
  (b.lines||[]).forEach(l=>{
   if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product);
   l.category=String(l.category||b.category||'Staples').trim()||'Staples';
   if(!db.purchaseCategories.some(name=>name.toLocaleLowerCase()===l.category.toLocaleLowerCase()))db.purchaseCategories.push(l.category);
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
db.memberProfiles=db.memberProfiles&&typeof db.memberProfiles==='object'&&!Array.isArray(db.memberProfiles)?db.memberProfiles:{};
ensureAccountHolderMember();
normalizeMemberAssignments();
db.familyMembers.forEach(name=>{if(!db.incomePeople.includes(name))db.incomePeople.push(name)});
if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);
db.incomes.forEach(x=>{x.incomeBy=String(x.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(x.incomeBy))db.incomePeople.push(x.incomeBy)});
if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');
db.quickActions=db.quickActions.filter(action=>action&&typeof action==='object'&&String(action.name||'').trim()&&Number(action.rate)>0);
db.quickActions.forEach(action=>{
 action.id=String(action.id||crypto.randomUUID());action.name=String(action.name||'').trim();action.type=action.type==='income'?'income':'expense';action.rate=Number(action.rate||0);action.paymentType=action.paymentType==='Bank'?'Bank':'Cash';
 if(action.type==='income'){
  action.incomeType=String(action.incomeType||'Other');action.incomeBy=String(action.incomeBy||'Unassigned');
  if(!db.incomeHeads.includes(action.incomeType))db.incomeHeads.push(action.incomeType);if(!db.incomePeople.includes(action.incomeBy))db.incomePeople.push(action.incomeBy);
 }else{
  action.category=String(action.category||'Other');action.costMembers=uniquePeople(action.costMembers||[]);
  if(!db.expenseNames.some(name=>name.toLocaleLowerCase()===action.name.toLocaleLowerCase()))db.expenseNames.push(action.name);
 }
});
let pendingSaveAction=null;
function notifySaveButtonSuccess(){
 const action=pendingSaveAction;if(!action||action.saved||Date.now()-action.time>20000)return;
 action.saved=true;queueMicrotask(()=>{if(pendingSaveAction!==action||action.noticeShown)return;action.noticeShown=true;pendingSaveAction=null;window.alert('Saved successfully.')});
}
const save=()=>{localStorage.setItem('dayquest_v1',JSON.stringify(db));queueCloudSave();updateAppBrand();render();renderReport();notifySaveButtonSuccess()};
const money=n=>'৳'+Number(n||0).toLocaleString('en-BD',{minimumFractionDigits:2,maximumFractionDigits:2});
const dateObj=s=>new Date(s+'T12:00:00');
const fmt=s=>{if(!s)return '';const d=dateObj(s);if(Number.isNaN(d.getTime()))return String(s);const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return String(d.getDate()).padStart(2,'0')+'-'+months[d.getMonth()]+'-'+d.getFullYear()};
const dateValueDescriptor=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
function parseDQTypedDate(raw){
 const value=String(raw||'').trim();if(!value)return '';
 let day=0,month=0,year=0,match;
 if((match=value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){year=Number(match[1]);month=Number(match[2]);day=Number(match[3])}
 else if((match=value.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/))){day=Number(match[1]);month=Number(match[2]);year=Number(match[3])}
 else if((match=value.match(/^(\d{1,2})[\s/-]([a-z]{3,9})[\s,-]+(\d{4})$/i))){
  day=Number(match[1]);year=Number(match[3]);
  const months=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  month=months.indexOf(match[2].slice(0,3).toLowerCase())+1;
 }else return null;
 const date=new Date(Date.UTC(year,month-1,day));
 if(year<1000||year>9999||date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day)return null;
 return String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(day).padStart(2,'0');
}
function syncDQDateDisplay(input){
 const entry=input.parentElement?.querySelector(':scope > .dq-date-entry');if(!entry)return;
 const value=dateValueDescriptor?.get?dateValueDescriptor.get.call(input):input.value;
 entry.value=value?fmt(value):'';
 entry.setCustomValidity('');
 entry.classList.remove('is-invalid');
}
function commitDQTypedDate(input,entry){
 const raw=entry.value.trim();
 if(!raw){
  if(input.required){entry.setCustomValidity('Enter a date or choose one from the calendar.');entry.classList.add('is-invalid');return false}
  if(dateValueDescriptor?.set)dateValueDescriptor.set.call(input,'');else input.value='';
  input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));return true;
 }
 const parsed=parseDQTypedDate(raw);
 if(!parsed){entry.setCustomValidity('Enter a valid date such as 22-Nov-2026, or choose from the calendar.');entry.classList.add('is-invalid');return false}
 if(input.min&&parsed<input.min){entry.setCustomValidity('Date is earlier than the allowed range.');entry.classList.add('is-invalid');return false}
 if(input.max&&parsed>input.max){entry.setCustomValidity('Date is later than the allowed range.');entry.classList.add('is-invalid');return false}
 if(dateValueDescriptor?.set)dateValueDescriptor.set.call(input,parsed);else input.value=parsed;
 entry.setCustomValidity('');entry.classList.remove('is-invalid');
 input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
 syncDQDateDisplay(input);return true;
}
function enhanceDQDateInput(input){
 if(!(input instanceof HTMLInputElement)||input.type!=='date'||input.dataset.dqDateEnhanced==='1')return;
 input.dataset.dqDateEnhanced='1';
 const wrap=document.createElement('span');wrap.className='dq-date-wrap';
 input.parentNode.insertBefore(wrap,input);
 const entry=document.createElement('input');entry.type='text';entry.className='dq-date-entry';
 entry.placeholder='DD-MMM-YYYY';entry.autocomplete='off';entry.spellcheck=false;entry.inputMode='text';
 entry.setAttribute('aria-label',input.getAttribute('aria-label')||'Enter date in DD-MMM-YYYY format, or select from calendar');
 entry.required=input.required;input.required=false;
 entry.disabled=input.disabled;entry.readOnly=input.readOnly;
 const icon=document.createElement('span');icon.className='dq-date-icon';icon.textContent='▦';icon.setAttribute('aria-hidden','true');
 wrap.append(entry,icon,input);input.classList.add('dq-native-date-control');
 input.setAttribute('title','Select a date from the calendar');
 if(dateValueDescriptor?.get&&dateValueDescriptor?.set){
  Object.defineProperty(input,'value',{configurable:true,get(){return dateValueDescriptor.get.call(this)},set(value){dateValueDescriptor.set.call(this,value);syncDQDateDisplay(this)}});
 }
 entry.addEventListener('input',()=>{entry.setCustomValidity('');entry.classList.remove('is-invalid')});
 entry.addEventListener('change',()=>commitDQTypedDate(input,entry));
 entry.addEventListener('blur',()=>{if(entry.value.trim()!==''||input.value)commitDQTypedDate(input,entry)});
 entry.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();if(!commitDQTypedDate(input,entry))entry.reportValidity()}
 });
 input.addEventListener('input',()=>syncDQDateDisplay(input));input.addEventListener('change',()=>syncDQDateDisplay(input));syncDQDateDisplay(input);
}
function setupDQDateDisplays(){
 document.querySelectorAll('input[type="date"]').forEach(enhanceDQDateInput);
 if(document.documentElement.dataset.dqDateObserver)return;
 document.documentElement.dataset.dqDateObserver='1';
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
  if(node.nodeType!==1)return;if(node.matches?.('input[type="date"]'))enhanceDQDateInput(node);node.querySelectorAll?.('input[type="date"]').forEach(enhanceDQDateInput);
 }))).observe(document.body,{childList:true,subtree:true});
}
document.addEventListener('reset',event=>{const form=event.target;if(form instanceof HTMLFormElement)queueMicrotask(()=>form.querySelectorAll('input[type="date"]').forEach(syncDQDateDisplay))},true);

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
function billCredit(b){
 const calculated=Math.max(0,billTotal(b)-Number(b.cashPaid||0)-Number(b.bankPaid||0));
 const stored=Number(b.credit);
 // Old bills stored transit in their total/credit; transit is now kept outside the bill.
 if(Number(b.transitCost||0)>0)return calculated;
 return b.credit!==undefined&&b.credit!==null&&Number.isFinite(stored)?Math.max(0,stored):calculated;
}
const supplierOutstanding=name=>supplierBillBalances(name).reduce((t,row)=>t+row.remaining,0);
function purchaseLineBaseAmount(line){return Math.max(0,Number(line.amount??(Number(line.quantity||0)*Number(line.rate||0)))||0)}
function billLineSubtotal(bill){return (bill.lines||[]).reduce((total,line)=>total+purchaseLineBaseAmount(line),0)}
function billTotal(bill){
 const calculated=Math.max(0,billLineSubtotal(bill)-Number(bill.discount||0));
 const stored=Number(bill.total);
 // Older bills stored transit inside the bill total. Recalculate those bills without transit.
 if(Number(bill.transitCost||0)>0)return calculated;
 // Older imported bills can contain a zero placeholder even when their line values are present.
 if(bill.total!==undefined&&bill.total!==null&&Number.isFinite(stored)&&(stored>0||calculated===0))return Math.max(0,stored);
 return calculated;
}
function allocatePurchaseBillLines(bill,totalAmount){
 const lines=bill.lines||[],weights=lines.map(line=>purchaseLineBaseAmount(line));
 const weightTotal=weights.reduce((a,b)=>a+b,0),fallback=weightTotal>0?weights:lines.map(line=>Math.max(0,Number(line.quantity||0)));
 const denominator=fallback.reduce((a,b)=>a+b,0);let allocated=0;const map=new Map();
 lines.forEach((line,index)=>{
  let amount=0;
  if(index===lines.length-1)amount=roundPurchaseAmount(totalAmount-allocated);
  else if(denominator>0)amount=roundPurchaseAmount(totalAmount*fallback[index]/denominator);
  allocated+=amount;map.set(line.id||String(index),Math.max(0,amount));
 });
 return map;
}
function purchaseBillLineBillAmount(bill,line){
 const index=(bill.lines||[]).indexOf(line);
 return allocatePurchaseBillLines(bill,billTotal(bill)).get(line.id||String(index))??purchaseLineBaseAmount(line);
}
function purchaseBillLineCosts(bill){
 const landedTotal=roundPurchaseAmount(billTotal(bill)+Math.max(0,Number(bill.transitCost||0)));
 return allocatePurchaseBillLines(bill,landedTotal);
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
 db.purchaseBills.forEach(b=>{add('Cash',-Number(b.cashPaid||0));add('Bank',-Number(b.bankPaid||0));add(b.transitPaidFrom==='Bank'?'Bank':'Cash',-Number(b.transitCost||0))});
 // Supplier credit reduces balances only when a later payment is recorded.
 db.supplierPayments.forEach(p=>add(p.method||'Cash',-Number(p.amount||0)));
 // Loan advances change cash/bank when issued or received; settlements reverse that movement.
 db.loans.forEach(loan=>{
  const given=loan.type!=='taken';add(loan.method||'Cash',given?-Number(loan.amount||0):Number(loan.amount||0));
  (loan.settlements||[]).forEach(item=>add(item.method||'Cash',given?Number(item.amount||0):-Number(item.amount||0)));
 });
 return {cash,bank,total:cash+bank};
}
function showBalances(){
 const b=calculateBalances();
 [['earnedBalance',b.total],['cashBalance',b.cash],['bankBalance',b.bank],['reportEarnedBalance',b.total],['reportCashBalance',b.cash],['reportBankBalance',b.bank],['profileEarnedBalance',b.total],['profileCashBalance',b.cash],['profileBankBalance',b.bank],['pageTotalBalance',b.total],['pageCashBalance',b.cash],['pageBankBalance',b.bank]].forEach(([id,v])=>{if($(id))$(id).textContent=money(v)});
}
function updatePageBalanceTitle(tab){
 const titles={home:'Overview',purchaseBills:'Purchase',inventory:'Inventory',budget:'Budget',budgetViewPage:'Budget',production:'Production',supplierAccounts:'Supplier Accounts',supplierEntry:'Supplier Entry',payExpenseDue:'Outstanding',loans:'Loans',income:'Income',meals:'Meals',quests:'Daily Quest',questSetup:'Daily Quest',profile:'Profile',memberProfilePage:selectedMemberProfileName||'Member Profile',settings:'Settings',costChartPage:'Cost Chart',quickExpenses:'Quick Expenses',expenseEntries:'Expenses'};
 let title=titles[tab]||String(tab||'DayQuest').replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
 if(tab==='reports'){const selected=document.querySelector('[data-report-go].active')?.dataset.reportGo||'members';title=selected==='all'?'All Reports':(REPORT_TITLES[selected]||'Reports')}
 const element=$('pageContextTitle');if(element)element.textContent=title;showBalances();
}
const startWeek=d=>{let x=dateObj(d);x.setDate(x.getDate()-((x.getDay()+6)%7));return x.toISOString().slice(0,10)};
function questLocalDate(date=new Date()){
 const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
 return `${y}-${m}-${d}`;
}
function addQuestDays(date,days){const d=new Date(`${date}T12:00:00`);d.setDate(d.getDate()+days);return questLocalDate(d)}
function questIsScheduled(q,d){
 const start=String(q.startDate||q.date||''),end=String(q.endDate||'9999-12-31');
 if(start&&d<start||d>end)return false;
 const day=String(new Date(`${d}T12:00:00`).getDay());
 if(Array.isArray(q.repeatDays)&&q.repeatDays.length)return q.repeatDays.map(String).includes(day);
 return q.repeat==='daily'||q.date===d;
}
function dayQuests(d){return db.quests.filter(q=>questIsScheduled(q,d))}
function dayQuestsForNow(d){
 const now=new Date(),previous=addQuestDays(d,-1),carry=[];
 db.quests.forEach(q=>{
  if(!questIsScheduled(q,previous)||!questRanges(q).some(r=>String(r.end)<=String(r.start)))return;
  const status=questActiveRange(q,previous,now);
  if(status.status==='active'&&String(questRanges(q)[status.index].end)<=String(questRanges(q)[status.index].start))carry.push({...q,_occurrenceDate:previous});
 });
 const carryIds=new Set(carry.map(q=>q.id));
 return [...carry,...dayQuests(d).filter(q=>!carryIds.has(q.id)).map(q=>({...q,_occurrenceDate:d}))];
}
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

function applySideMenuOrder(){
 const nav=$('sideNav');if(!nav)return;
 const items=[...nav.children].filter(node=>node.dataset.menuItem);
 const byKey=new Map(items.map(node=>[node.dataset.menuItem,node]));
 const order=normalizeSideMenuOrder(db.sideMenuOrder);
 order.forEach(key=>{const node=byKey.get(key);if(node)nav.appendChild(node)});
 [...nav.children].filter(node=>node.dataset.menuItem).forEach((node,index)=>{
  const mark=node.querySelector('.side-link-mark');
  if(mark)mark.textContent=String(index+1).padStart(2,'0');
  node.setAttribute('aria-label',`Hold and drag to move ${node.querySelector('.side-link span:nth-child(2)')?.textContent||node.dataset.menuItem}`);
  node.title='Hold and drag to change menu order';
 });
 db.sideMenuOrder=order;
}
function setupSideMenuReordering(){
 const nav=$('sideNav');if(!nav)return;
 let active=null,holdTimer=null,suppressClickUntil=0;
 const clearTimer=()=>{if(holdTimer!==null){clearTimeout(holdTimer);holdTimer=null}};
 const begin=(item,x,y,pointerId,kind)=>{
  if(!item||item.parentElement!==nav)return;
  clearTimer();
  active={item,x,y,pointerId,kind,dragging:false};
  holdTimer=setTimeout(()=>{
   if(!active)return;
   active.dragging=true;item.classList.add('side-menu-dragging');
   nav.classList.add('side-menu-reordering');
   item.setAttribute('aria-grabbed','true');
   if(kind==='pointer'&&nav.setPointerCapture){try{nav.setPointerCapture(pointerId)}catch{}}
   if(kind==='touch'&&navigator.vibrate)navigator.vibrate(20);
  },380);
 };
 const move=(x,y,event)=>{
  if(!active)return;
  if(!active.dragging){
   if(Math.hypot(x-active.x,y-active.y)>9){clearTimer();active=null}
   return;
  }
  event?.preventDefault?.();
  const under=document.elementFromPoint(x,y)?.closest('[data-menu-item]');
  if(!under||under.parentElement!==nav||under===active.item)return;
  const rect=under.getBoundingClientRect();
  nav.insertBefore(active.item,y<rect.top+rect.height/2?under:under.nextElementSibling);
 };
 const finish=(persist=true)=>{
  clearTimer();
  if(!active)return;
  const dragged=active.dragging;
  active.item.classList.remove('side-menu-dragging');
  active.item.setAttribute('aria-grabbed','false');
  nav.classList.remove('side-menu-reordering');
  if(dragged){
   db.sideMenuOrder=normalizeSideMenuOrder([...nav.children].filter(node=>node.dataset.menuItem).map(node=>node.dataset.menuItem));
   suppressClickUntil=Date.now()+450;
   applySideMenuOrder();
   if(persist)save();
  }
  active=null;
 };
 // Mouse/pen: press and hold, then drag.
 nav.addEventListener('pointerdown',event=>{
  if(event.pointerType==='touch'||event.button!==0)return;
  const item=event.target.closest('[data-menu-item]');
  if(!item||item.parentElement!==nav)return;
  begin(item,event.clientX,event.clientY,event.pointerId,'pointer');
 });
 nav.addEventListener('pointermove',event=>{
  if(!active||active.kind!=='pointer'||event.pointerId!==active.pointerId)return;
  move(event.clientX,event.clientY,event);
 });
 nav.addEventListener('pointerup',event=>{if(active?.kind==='pointer'&&event.pointerId===active.pointerId)finish(true)});
 nav.addEventListener('pointercancel',event=>{if(active?.kind==='pointer'&&event.pointerId===active.pointerId)finish(true)});
 // Touch: use a non-passive move listener so a held item can be dragged instead of scrolling.
 nav.addEventListener('touchstart',event=>{
  if(event.touches.length!==1)return;
  const touch=event.touches[0],item=event.target.closest('[data-menu-item]');
  if(!item||item.parentElement!==nav)return;
  begin(item,touch.clientX,touch.clientY,touch.identifier,'touch');
 },{passive:true});
 nav.addEventListener('touchmove',event=>{
  if(!active||active.kind!=='touch')return;
  const touch=[...event.changedTouches].find(item=>item.identifier===active.pointerId);
  if(touch)move(touch.clientX,touch.clientY,event);
 },{passive:false});
 nav.addEventListener('touchend',event=>{
  if(active?.kind==='touch'&&[...event.changedTouches].some(touch=>touch.identifier===active.pointerId))finish(true);
 },{passive:true});
 nav.addEventListener('touchcancel',()=>{if(active?.kind==='touch')finish(true)},{passive:true});
 // A drag should not accidentally activate the menu item when the finger/mouse is released.
 nav.addEventListener('click',event=>{
  if(Date.now()>=suppressClickUntil)return;
  if(event.target.closest('[data-menu-item]')){event.preventDefault();event.stopImmediatePropagation()}
 },true);
 nav.addEventListener('contextmenu',event=>{
  if(nav.classList.contains('side-menu-reordering'))event.preventDefault();
 });
}
const OVERVIEW_SECTION_KEYS=['quickExpenses','quickSuppliers','todayActivity','quickActions','recentExpenses','recentIncome','todayQuests'];
function normalizeOverviewSectionOrder(order){
 const requested=Array.isArray(order)?order.map(String):[];
 const normalized=requested.filter((key,index)=>OVERVIEW_SECTION_KEYS.includes(key)&&requested.indexOf(key)===index);
 OVERVIEW_SECTION_KEYS.forEach(key=>{if(!normalized.includes(key))normalized.push(key)});
 return normalized;
}
function applyOverviewSectionOrder(){
 const home=$('home');if(!home)return;
 db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
 const order=normalizeOverviewSectionOrder(db.settings.overviewSectionOrder);
 const byKey=new Map([...home.children].filter(node=>node.dataset.overviewSection).map(node=>[node.dataset.overviewSection,node]));
 order.forEach(key=>{const node=byKey.get(key);if(node)home.appendChild(node)});
 db.settings.overviewSectionOrder=order;
}
function setupOverviewSectionReordering(){
 const home=$('home');if(!home||home.dataset.overviewSortBound==='true')return;
 home.dataset.overviewSortBound='true';
 let active=null,holdTimer=null,suppressClickUntil=0;
 const clearTimer=()=>{if(holdTimer!==null){clearTimeout(holdTimer);holdTimer=null}};
 const begin=(section,x,y,pointerId,kind)=>{
  if(db.settings?.overviewSortingEnabled===false||!section||section.parentElement!==home)return;
  clearTimer();active={section,x,y,pointerId,kind,dragging:false};
  holdTimer=setTimeout(()=>{
   if(!active||db.settings?.overviewSortingEnabled===false)return;
   active.dragging=true;section.classList.add('overview-section-dragging');home.classList.add('overview-sections-reordering');
   section.setAttribute('aria-grabbed','true');
   if(kind==='pointer'&&home.setPointerCapture){try{home.setPointerCapture(pointerId)}catch{}}
   if(kind==='touch'&&navigator.vibrate)navigator.vibrate(20);
  },420);
 };
 const move=(x,y,event)=>{
  if(!active)return;
  if(db.settings?.overviewSortingEnabled===false){clearTimer();active.section.classList.remove('overview-section-dragging');active=null;home.classList.remove('overview-sections-reordering');return}
  if(!active.dragging){
   if(Math.hypot(x-active.x,y-active.y)>9){clearTimer();active=null}
   return;
  }
  event?.preventDefault?.();
  const under=document.elementFromPoint(x,y)?.closest('[data-overview-section]');
  if(!under||under.parentElement!==home||under===active.section)return;
  const rect=under.getBoundingClientRect();
  home.insertBefore(active.section,y<rect.top+rect.height/2?under:under.nextElementSibling);
 };
 const finish=(persist=true)=>{
  clearTimer();if(!active)return;
  const dragged=active.dragging;
  active.section.classList.remove('overview-section-dragging');
  active.section.setAttribute('aria-grabbed','false');
  home.classList.remove('overview-sections-reordering');
  if(dragged){
   db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
   db.settings.overviewSectionOrder=normalizeOverviewSectionOrder([...home.children].filter(node=>node.dataset.overviewSection).map(node=>node.dataset.overviewSection));
   suppressClickUntil=Date.now()+500;
   applyOverviewSectionOrder();
   if(persist)save();
  }
  active=null;
 };
 home.addEventListener('pointerdown',event=>{
  if(db.settings?.overviewSortingEnabled===false||event.pointerType==='touch'||event.button!==0)return;
  const handle=event.target.closest('[data-overview-drag-handle]'),section=handle?.closest('[data-overview-section]');
  if(!handle||!section)return;
  begin(section,event.clientX,event.clientY,event.pointerId,'pointer');
 });
 home.addEventListener('pointermove',event=>{
  if(!active||active.kind!=='pointer'||event.pointerId!==active.pointerId)return;
  move(event.clientX,event.clientY,event);
 });
 home.addEventListener('pointerup',event=>{if(active?.kind==='pointer'&&event.pointerId===active.pointerId)finish(true)});
 home.addEventListener('pointercancel',event=>{if(active?.kind==='pointer'&&event.pointerId===active.pointerId)finish(true)});
 home.addEventListener('touchstart',event=>{
  if(db.settings?.overviewSortingEnabled===false||event.touches.length!==1)return;
  const touch=event.touches[0],handle=event.target.closest('[data-overview-drag-handle]'),section=handle?.closest('[data-overview-section]');
  if(!handle||!section)return;
  begin(section,touch.clientX,touch.clientY,touch.identifier,'touch');
 },{passive:true});
 home.addEventListener('touchmove',event=>{
  if(!active||active.kind!=='touch')return;
  const touch=[...event.changedTouches].find(item=>item.identifier===active.pointerId);
  if(touch)move(touch.clientX,touch.clientY,event);
 },{passive:false});
 home.addEventListener('touchend',event=>{
  if(active?.kind==='touch'&&[...event.changedTouches].some(item=>item.identifier===active.pointerId))finish(true);
 },{passive:true});
 home.addEventListener('touchcancel',()=>{if(active?.kind==='touch')finish(true)},{passive:true});
 home.addEventListener('click',event=>{
  if(Date.now()>=suppressClickUntil)return;
  if(event.target.closest('[data-overview-drag-handle]')){event.preventDefault();event.stopImmediatePropagation()}
 },true);
 home.addEventListener('contextmenu',event=>{
  if(home.classList.contains('overview-sections-reordering'))event.preventDefault();
 });
}
function updateBackButton(){
 const button=$('backButton');if(!button)return;
 const currentPage=document.querySelector('.panel.active')?.id||'home';
 const canGoBack=appPageHistory.length>0||currentPage!=='home';
 button.hidden=!canGoBack;
 button.disabled=!canGoBack;
}
function goBackToPreviousPage(){
 let previous='';
 while(appPageHistory.length&&!previous){
  const candidate=appPageHistory.pop();
  if($(candidate)?.classList.contains('panel'))previous=candidate;
 }
 if(previous)setTab(previous,{skipHistory:true});
 else if(document.querySelector('.panel.active')?.id!=='home')setTab('home',{skipHistory:true});
 else updateBackButton();
}
function setTab(t,options={}){
 const currentPage=document.querySelector('.panel.active')?.id;
 if(!options.skipHistory&&currentPage&&currentPage!==t){
  appPageHistory.push(currentPage);
  if(appPageHistory.length>40)appPageHistory.shift();
 }
 if(t!=='settings'&&adminCloudUnlocked)lockAdminCloudSettings();
 const tabs=[...document.querySelectorAll('.tab')];
 tabs.forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===t));
 const activeTab=tabs.find(b=>b.dataset.tab===(t==='budgetViewPage'?'budget':t)),activeGroup=activeTab?.closest('.side-group')||(t==='reports'?document.querySelector('[data-side-group="reports"]'):null);
 document.querySelectorAll('.side-group').forEach(group=>group.classList.toggle('has-active',group===activeGroup));
 if(t!=='reports')document.querySelectorAll('[data-report-go]').forEach(item=>item.classList.remove('active'));
 if(activeGroup)activeGroup.open=true;
 closeSidebar();
 if(t==='reports'){renderReport();if(!document.querySelector('[data-report-go].active'))activateReportSection('members')}
 if(t==='settings'){renderPurchaseCategorySettings();renderMasterLists();renderProductDictionary();renderMealPersonDates();renderNotificationSettings();$('quickButtonColorInput').value=db.settings.quickButtonColor||'#ee7d2f';$('quickButtonColorValue').textContent=(db.settings.quickButtonColor||'#ee7d2f').toUpperCase();if($('quickButtonVibration'))$('quickButtonVibration').checked=db.settings.quickButtonVibration!==false;if($('overviewSortingEnabled'))$('overviewSortingEnabled').checked=db.settings.overviewSortingEnabled!==false;$('requireSupplierForDuePurchase').checked=db.settings.requireSupplierForDuePurchase!==false;$('allowPurchaseBillEdits').checked=db.settings.allowPurchaseBillEdits!==false;fillQuickActionOptions($('quickActionIncomeType')?.value||'', $('quickActionIncomeBy')?.value||'');renderQuickMemberOptions(quickSelectedMembers());updateQuickActionTypeFields();renderQuickActionManager();}
 if(t==='payExpenseDue')renderExpenseDueList();
 if(t==='loans'){if(!$('loanDate').value)$('loanDate').value=today();renderLoans();}
 if(t==='quickExpenses'){renderQuickMemberOptions(quickSelectedMembers());fillQuickActionOptions($('quickActionIncomeType')?.value||'', $('quickActionIncomeBy')?.value||'');renderQuickActions();}
 if(t==='questSetup'){if($('questSetupList'))$('questSetupList').innerHTML=questHTML(dayQuests(questLocalDate()),true);}
 if(t==='inventory')renderInventory();
 if(t==='budget'){
  if(!$('budgetFromDate').value)$('budgetFromDate').value=today().slice(0,8)+'01';
  if(!$('budgetToDate').value)$('budgetToDate').value=today();
  renderBudget();
 }
 if(t==='production'){fillProductionOptions();renderProductionList();renderProductionInputs()}
 if(t==='supplierAccounts')renderSupplierAccounts();
 if(t==='supplierEntry'){renderSupplierEntryList();resetSupplierEntryForm()}
 if(t==='meals'){if(!$('mealControlDate').value)$('mealControlDate').value=today();if(!$('mealFromDate').value)$('mealFromDate').value=today();if(!$('mealToDate').value)$('mealToDate').value=today();renderMeals()}
 if(t==='purchaseBills'){fillChoices();renderPurchaseLines();renderSupplierAccounts();}
 updatePageBalanceTitle(t);
 updateBackButton();
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
$('backButton').onclick=goBackToPreviousPage;
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>setTab(b.dataset.go));
setupSideMenuReordering();applySideMenuOrder();setupOverviewSectionReordering();applyOverviewSectionOrder();
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
$('showCostChartBtn').onclick=()=>{
 renderReport();
 if($('costChartPageTotal'))$('costChartPageTotal').textContent=$('reportTotal').textContent;
 if($('costChartPageRange'))$('costChartPageRange').textContent=$('reportRange').textContent;
 setTab('costChartPage');
};
$('costChartBack').onclick=()=>{setTab('reports');activateReportSection('cost')};
window.addEventListener('resize',()=>{closeSidebar();syncMenuToggle()});
syncMenuToggle();
$('todayDate').textContent=fmt(today());
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
 const supplierSelect=$('purchaseSupplier');if(supplierSelect){const previous=supplierSelect.value;supplierSelect.innerHTML='<option value="">Select supplier (optional unless a due requires it)</option>'+db.suppliers.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');if(db.suppliers.includes(previous))supplierSelect.value=previous;}
 renderExpenseMemberOptions(currentCostMembers);
 fillGuestMemberOptions(selectedGuestMembers());
 renderProductNameSuggestions();

}
function calcTotal(){let v=(Number($('quantity').value)||0)*(Number($('rate').value)||0);$('calculatedTotal').textContent=money(v)}
$('quantity').oninput=calcTotal;$('rate').oninput=calcTotal;
function updateExpenseDueFields(){let show=$('paymentType').value==='Due',owed=$('dueDirection').value==='owed_to_me';$('dueFields').hidden=!show;$('duePerson').required=show;$('expenseDueDate').disabled=!show;$('duePaidFromField').hidden=!(show&&owed)}
$('paymentType').onchange=updateExpenseDueFields;$('dueDirection').onchange=updateExpenseDueFields;
$('incomePaymentType').onchange=()=>{let show=$('incomePaymentType').value==='Due';$('incomeDueFields').hidden=!show;$('incomeDuePerson').required=show;$('incomeDueDate').disabled=!show};
$('incomeAmount').oninput=()=>{$('incomeTotalPreview').textContent=money(Number($('incomeAmount').value)||0)};
$('incomeDate').value=today();$('collectDate').value=today();$('expenseDueActionDate').value=today();
$('addExpenseName').onclick=()=>{let n=prompt('Add an expense name:');if(n&&n.trim()){n=n.trim();if(!db.expenseNames.includes(n))db.expenseNames.push(n);fillChoices();$('expenseName').value=n;localSaveOnly()}};
function addUnitName(select,afterAdd){
 let n=prompt('Add a unit name (e.g. bottle, sack, jar, metre):');if(!n||!n.trim())return;
 n=n.trim();const existing=db.units.find(value=>value.toLocaleLowerCase()===n.toLocaleLowerCase());if(existing)n=existing;else db.units.push(n);
 fillChoices();renderMasterLists();if(typeof afterAdd==='function')afterAdd(n);else if(select){if(select.tagName==='SELECT'){select.innerHTML=db.units.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');select.value=n}else select.value=n}
 localSaveOnly();
}
$('addUnit').onclick=()=>addUnitName($('unitName'),n=>{$('unitName').value=n});
$('addProductionUnit').onclick=()=>addUnitName($('productionUnit'),n=>{fillProductionOptions();$('productionUnit').value=n});
$('addIncomeHead').onclick=()=>{
 const dialog=$('addIncomeHeadDialog'),input=$('newIncomeHeadName');
 if(!dialog||!input){alert('Income type dialog is unavailable.');return}
 input.value='';dialog.showModal();input.focus();
};
$('cancelIncomeHead').onclick=()=>$('addIncomeHeadDialog')?.close();
$('addIncomeHeadForm').onsubmit=e=>{
 e.preventDefault();
 const input=$('newIncomeHeadName'),dialog=$('addIncomeHeadDialog');
 let name=String(input?.value||'').trim();if(!name)return;
 const existing=db.incomeHeads.find(value=>value.toLocaleLowerCase()===name.toLocaleLowerCase());
 if(existing)name=existing;else db.incomeHeads.push(name);
 fillChoices();$('incomeSource').value=name;localSaveOnly();dialog?.close();
};
$('addIncomePerson').onclick=()=>{let n=prompt('Add the person who earned this income:');if(n&&n.trim()){n=n.trim();if(!db.incomePeople.includes(n))db.incomePeople.push(n);fillChoices();$('incomeBy').value=n;localSaveOnly()}};
function localSaveOnly(){localStorage.setItem('dayquest_v1',JSON.stringify(db));queueCloudSave();showBalances();notifySaveButtonSuccess()}

function renderProductDictionary(){
 db.productDictionary.sort((x,y)=>x.english.localeCompare(y.english,undefined,{sensitivity:'base'}));
 const list=$('productDictionaryList');if(!list)return;
 const query=String($('productDictionarySearch')?.value||'').trim().toLocaleLowerCase();
 const rows=db.productDictionary.filter(item=>!query||item.english.toLocaleLowerCase().includes(query)||item.bangla.toLocaleLowerCase().includes(query));
 list.innerHTML=rows.map(item=>{
  const index=db.productDictionary.indexOf(item);
  return `<div class="product-dictionary-row"><label>English <input data-dictionary-english value="${esc(item.english)}" maxlength="80"></label><label>বাংলা <input data-dictionary-bangla value="${esc(item.bangla)}" maxlength="80" lang="bn"></label><label class="dictionary-meal-check"><input type="checkbox" data-dictionary-meal ${item.meal?'checked':''}> Meals</label><div class="product-dictionary-actions"><button type="button" class="edit-btn" data-dictionary-save="${index}">Save</button><button type="button" class="delete" data-dictionary-delete="${index}">×</button></div></div>`;
 }).join('')||empty('No dictionary matches. Add a new English and Bangla product above.');
 if($('productDictionaryCount'))$('productDictionaryCount').textContent=`${db.productDictionary.length} dictionary entries`;
 list.querySelectorAll('[data-dictionary-save]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.dictionarySave),row=button.closest('.product-dictionary-row'),entry=db.productDictionary[index];if(!entry||!row)return;
  const english=row.querySelector('[data-dictionary-english]').value.trim(),bangla=row.querySelector('[data-dictionary-bangla]').value.trim();
  if(!english||!bangla){alert('Enter both the English and Bangla product names.');return}
  if(db.productDictionary.some((item,i)=>i!==index&&item.english.toLocaleLowerCase()===english.toLocaleLowerCase())){alert('That English product name already exists.');return}
  entry.english=english;entry.bangla=bangla;entry.meal=!!row.querySelector('[data-dictionary-meal]').checked;db.productDictionary=normalizeProductDictionary(db.productDictionary);
  renderProductDictionary();renderProductNameSuggestions();save();
 });
 list.querySelectorAll('[data-dictionary-delete]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.dictionaryDelete),entry=db.productDictionary[index];if(!entry)return;
  if(!confirm(`Remove “${entry.english} / ${entry.bangla}” from the Product Dictionary? Saved purchase records will not be changed.`))return;
  db.productDictionary.splice(index,1);renderProductDictionary();renderProductNameSuggestions();save();
 });
}
function productDictionaryMatch(value){
 const query=String(value||'').trim().toLocaleLowerCase();if(!query)return null;
 return db.productDictionary.find(item=>item.english.toLocaleLowerCase()===query||item.bangla.toLocaleLowerCase()===query)||null;
}
function updateProductDictionaryMatch(input){
 const hint=input?.closest('.purchase-line')?.querySelector('.pl-product-dictionary-match');if(hint){hint.textContent='';hint.hidden=true;}
}
function renderProductNameSuggestions(){
 const list=$('productNameSuggestions');if(list){
  const options=new Map();
  db.productNames.forEach(name=>{const key=String(name||'').trim();if(key&&!options.has(key.toLocaleLowerCase()))options.set(key.toLocaleLowerCase(),`<option value="${esc(key)}"></option>`)});
  db.productDictionary.forEach(item=>{
   const english=item.english.trim(),bangla=item.bangla.trim();
   if(english&&!options.has(english.toLocaleLowerCase()))options.set(english.toLocaleLowerCase(),`<option value="${esc(english)}" label="${esc(english+' · '+bangla)}"></option>`);
   if(bangla&&!options.has(bangla.toLocaleLowerCase()))options.set(bangla.toLocaleLowerCase(),`<option value="${esc(bangla)}" label="${esc(english+' · '+bangla)}"></option>`);
  });list.innerHTML=[...options.values()].join('');
 }
 const count=$('productCatalogCount');if(count)count.textContent=`${db.productNames.length} saved product${db.productNames.length===1?'':'s'}`;
}
function defaultPurchaseLine(product=''){
 return {lineId:null,product,category:db.purchaseCategories[0]||'Staples',productType:db.productTypes.includes('Other')?'Other':db.productTypes[0],spec:'',quantity:1,unit:db.units.includes('pcs')?'pcs':db.units[0],rate:0,amount:0,amountMode:'rate',calcError:'',amountPending:false,costType:'unassigned',costMember:''};
}
function addNewPurchaseProduct(index){
 const targetIndex=Number(index);if(!Number.isInteger(targetIndex)||targetIndex<0||!purchaseLines[targetIndex])return;
 const dialog=$('newProductEntryDialog'),form=$('newProductEntryForm');if(!dialog||!form)return;
 $('newProductEntryEnglish').value='';$('newProductEntryBangla').value='';$('newProductEntryMeal').checked=true;
 form.onsubmit=event=>{
  event.preventDefault();
  const name=$('newProductEntryEnglish').value.trim(),bangla=$('newProductEntryBangla').value.trim(),meal=$('newProductEntryMeal').checked;
  if(!name){alert('Enter a product name.');return}
  const existing=db.productNames.find(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase()),product=existing||name;
  if(!existing)db.productNames.unshift(product);
  const dictionaryItem=db.productDictionary.find(item=>item.english.toLocaleLowerCase()===name.toLocaleLowerCase());
  if(bangla){
   if(dictionaryItem){dictionaryItem.bangla=bangla;dictionaryItem.meal=meal}
   else db.productDictionary.push({english:name,bangla,meal});
   db.productDictionary.sort((x,y)=>x.english.localeCompare(y.english,undefined,{sensitivity:'base'}));
   renderProductDictionary();
  }
  purchaseLines[targetIndex].product=product;dialog.close();renderProductNameSuggestions();renderPurchaseLines();renderMasterLists();localSaveOnly();
  const target=$('purchaseLines').querySelector('[data-line-index="'+targetIndex+'"] .pl-product');if(target){target.focus();target.select()}
 };
 $('newProductEntryCancel').onclick=()=>dialog.close();
 dialog.showModal();$('newProductEntryEnglish').focus();
}

function addProductTypeToPurchaseLine(index){
 const line=purchaseLines[index];if(!line)return;
 const raw=prompt('Enter a product type (for example: Medicine, Grocery, Household):');if(raw===null)return;
 const name=raw.trim();if(!name){alert('Enter a product type.');return}
 const existing=db.productTypes.find(item=>item.toLocaleLowerCase()===name.toLocaleLowerCase());
 if(existing){line.productType=existing;alert('That product type already exists, so it has been selected for this line.')}
 else{db.productTypes.push(name);line.productType=name}
 renderPurchaseLines();renderMasterLists();localSaveOnly();
 const target=$('purchaseLines').querySelector(`[data-line-index="${index}"] .pl-product-type`);
 if(target)target.focus();
}

// Purchase bills, supplier creditor accounts and product purchase reporting
function unitInfo(unit){
 let u=String(unit||'pcs').trim().toLowerCase();
 const aliases=db.settings?.unitAliases||{};let guard=0;while(aliases[u]&&guard++<12)u=String(aliases[u]).trim().toLowerCase();
 if(['g','gram','grams'].includes(u))return {family:'mass',factor:1};
 if(['kg','kilogram','kilograms'].includes(u))return {family:'mass',factor:1000};
 if(['mg','milligram','milligrams'].includes(u))return {family:'mass',factor:0.001};
 if(['ml','millilitre','milliliter','millilitres','milliliters'].includes(u))return {family:'volume',factor:1};
 if(['l','litre','liter','litres','liters'].includes(u))return {family:'volume',factor:1000};
 if(['pc','pcs','piece','pieces'].includes(u))return {family:'count:pcs',factor:1};
 return {family:'unit:'+u,factor:1};
}
function unitConversionRatio(fromUnit,toUnit){
 const from=unitInfo(fromUnit),to=unitInfo(toUnit);
 if(!from||!to||from.family!==to.family||!Number.isFinite(from.factor)||!Number.isFinite(to.factor)||to.factor<=0)return null;
 return from.factor/to.factor;
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

function budgetRangeKey(from,to){return String(from||'')+'__'+String(to||'')}
function budgetPurchaseProducts(from,to){
 const groups=new Map();
 db.purchaseBills.filter(bill=>String(bill.date||'')>=from&&String(bill.date||'')<=to).forEach(bill=>(bill.lines||[]).forEach(line=>{
  const product=String(line.product||'').trim(),spec=String(line.spec||'').trim(),unit=String(line.unit||'pcs').trim()||'pcs';
  const quantity=Math.max(0,Number(line.quantity||0)),info=unitInfo(unit);
  if(!product||!(quantity>0)||!Number.isFinite(quantity))return;
  const key=productKey(product,spec,unit);
  let row=groups.get(key);
  if(!row){row={key,product,spec,unit,factor:info.factor,purchasedNorm:0,purchaseCost:0};groups.set(key,row)}
  row.purchasedNorm+=quantity*info.factor;
  row.purchaseCost+=purchaseLineCost(bill,line);
 }));
 return [...groups.values()].map(row=>{
  const purchasedQuantity=row.factor>0?row.purchasedNorm/row.factor:0;
  return {...row,purchasedQuantity,rate:purchasedQuantity>0?row.purchaseCost/purchasedQuantity:0,quantity:purchasedQuantity};
 }).sort((a,b)=>a.product.localeCompare(b.product,undefined,{sensitivity:'base'})||a.spec.localeCompare(b.spec,undefined,{sensitivity:'base'}));
}
function budgetAmount(rate,quantity){return roundPurchaseAmount(Math.max(0,Number(rate)||0)*Math.max(0,Number(quantity)||0))}
function updateBudgetTotals(){
 const list=$('budgetList');if(!list)return;
 let total=0;
 list.querySelectorAll('[data-budget-quantity]').forEach(input=>{
  const quantity=input.value.trim()===''?0:Number(input.value),rate=Number(input.dataset.budgetRate||0);
  const amount=Number.isFinite(quantity)&&quantity>=0?budgetAmount(rate,quantity):0;
  const row=input.closest('tr'),amountCell=row&&row.querySelector('[data-budget-line-total]');
  if(amountCell)amountCell.textContent=money(amount);
  total+=amount;
 });
 if($('budgetGrandTotal'))$('budgetGrandTotal').textContent=money(total);
}
function renderBudget(){
 const from=$('budgetFromDate')?$('budgetFromDate').value:'',to=$('budgetToDate')?$('budgetToDate').value:'',list=$('budgetList');
 if(!list)return;
 const plan=from&&to&&from<=to?db.budgetPlans[budgetRangeKey(from,to)]:null;
 if($('budgetViewBtn'))$('budgetViewBtn').disabled=!plan||!Array.isArray(plan.rows)||!plan.rows.length;
 if($('budgetRangeLabel'))$('budgetRangeLabel').textContent=from&&to?fmt(from)+' – '+fmt(to):'Choose a date range';
 if(!from||!to||from>to){
  list.innerHTML=empty('Choose a valid From and To date, then click Budget.');
  if($('budgetProductCount'))$('budgetProductCount').textContent='0 products';
  if($('budgetGrandTotal'))$('budgetGrandTotal').textContent=money(0);
  return;
 }
 if(!plan){
  list.innerHTML=empty('No budget has been generated for this date range. Click Budget to build the consolidated product list.');
  if($('budgetProductCount'))$('budgetProductCount').textContent='0 products';
  if($('budgetGrandTotal'))$('budgetGrandTotal').textContent=money(0);
  return;
 }
 const rows=Array.isArray(plan.rows)?plan.rows:[];
 if($('budgetProductCount'))$('budgetProductCount').textContent=rows.length+' product'+(rows.length===1?'':'s');
 list.innerHTML=rows.length?'<div class="budget-table-wrap"><table class="budget-table"><thead><tr><th>SL</th><th>Products</th><th>Rate</th><th>Quantity</th><th>Unit</th><th>Total Cost</th></tr></thead><tbody>'+
  rows.map((row,index)=>'<tr><td>'+String(index+1)+'</td><td><strong>'+esc(row.product)+'</strong>'+(row.spec?'<small>'+esc(row.spec)+'</small>':'')+'</td><td class="budget-rate">'+money(row.rate)+'</td><td><input class="budget-quantity-input" type="number" min="0" step="any" inputmode="decimal" value="'+Number(row.quantity??0)+'" data-budget-quantity data-budget-key="'+esc(row.key)+'" data-budget-rate="'+Number(row.rate||0)+'" aria-label="Budget quantity for '+esc(row.product)+'"></td><td>'+esc(row.unit)+'</td><td class="budget-line-total" data-budget-line-total>'+money(budgetAmount(row.rate,row.quantity))+'</td></tr>').join('')+
  '</tbody></table></div>':empty('No product purchases were found in this date range.');
 updateBudgetTotals();
}
function buildBudget(){
 const from=$('budgetFromDate').value,to=$('budgetToDate').value;
 if(!from||!to){alert('Select both the From and To dates before clicking Budget.');return}
 if(from>to){alert('The From date cannot be later than the To date.');return}
 const key=budgetRangeKey(from,to),existing=db.budgetPlans[key],oldQuantities=new Map((Array.isArray(existing&&existing.rows)?existing.rows:[]).map(row=>[String(row.key),Number(row.quantity??0)]));
 const rows=budgetPurchaseProducts(from,to).map(row=>({...row,quantity:oldQuantities.has(row.key)?oldQuantities.get(row.key):row.purchasedQuantity}));
 db.budgetPlans[key]={from,to,rows,builtAt:new Date().toISOString()};
 localSaveOnly();
 renderBudget();
}


function currentBudgetPlan(){
 const from=$('budgetFromDate')?.value||'',to=$('budgetToDate')?.value||'';
 if(!from||!to||from>to)return null;
 const plan=db.budgetPlans[budgetRangeKey(from,to)];
 return plan&&Array.isArray(plan.rows)?plan:null;
}
function budgetViewRows(plan){
 return (plan?.rows||[]).map((row,index)=>({
  sl:index+1,product:String(row.product||''),spec:String(row.spec||''),rate:Number(row.rate||0),
  quantity:Math.max(0,Number(row.quantity||0)),unit:String(row.unit||''),total:budgetAmount(row.rate,row.quantity)
 }));
}
function renderBudgetView(){
 const plan=currentBudgetPlan();
 if(!plan){$('budgetViewTable').innerHTML=empty('No saved budget is available. Return to Budget and click Budget to generate a list.');$('budgetViewTotal').textContent=money(0);$('budgetViewGrandTotal').textContent=money(0);$('budgetViewRange').textContent='No budget selected';$('budgetViewPeriod').textContent='';return}
 const rows=budgetViewRows(plan),total=rows.reduce((sum,row)=>sum+row.total,0),period=fmt(plan.from)+' – '+fmt(plan.to);
 $('budgetViewRange').textContent=period;
 $('budgetViewPeriod').textContent='From '+fmt(plan.from)+' to '+fmt(plan.to);
 $('budgetViewTotal').textContent=money(total);
 $('budgetViewGrandTotal').textContent=money(total);
 $('budgetViewTable').innerHTML='<div class="budget-table-wrap"><table class="budget-table budget-view-readonly"><thead><tr><th>SL</th><th>Products</th><th>Rate</th><th>Quantity</th><th>Unit</th><th>Total Cost</th></tr></thead><tbody>'+
  rows.map(row=>'<tr><td>'+row.sl+'</td><td><strong>'+esc(row.product)+'</strong>'+(row.spec?'<small>'+esc(row.spec)+'</small>':'')+'</td><td>'+money(row.rate)+'</td><td>'+numberText(row.quantity)+'</td><td>'+esc(row.unit)+'</td><td>'+money(row.total)+'</td></tr>').join('')+
  '</tbody></table></div>';
}
function budgetStatementHtml(plan){
 const rows=budgetViewRows(plan),total=rows.reduce((sum,row)=>sum+row.total,0);
 const body=rows.map(row=>'<tr><td>'+row.sl+'</td><td>'+esc(row.product)+(row.spec?' · '+esc(row.spec):'')+'</td><td>'+money(row.rate)+'</td><td>'+esc(numberText(row.quantity))+'</td><td>'+esc(row.unit)+'</td><td>'+money(row.total)+'</td></tr>').join('');
 return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DayQuest Budget Statement</title><style>'+
 'body{font-family:Arial,sans-serif;color:#182337;padding:24px}h1{font-size:21px;margin:0 0 6px}.period{font-size:12px;color:#667085;margin-bottom:18px}.grand{display:flex;justify-content:space-between;font-size:16px;font-weight:bold;margin-top:16px;padding:12px;background:#eef2f7}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border:1px solid #d8dee8;padding:8px;text-align:left}th{background:#eef2f7}td:nth-child(1){text-align:center;width:38px}td:nth-child(3),td:nth-child(6){white-space:nowrap;text-align:right}td:nth-child(4){text-align:right}@media print{body{padding:0}thead{display:table-header-group}tr{break-inside:avoid}}'+
 '</style></head><body><h1>DayQuest · Budget Statement</h1><div class="period">From '+esc(fmt(plan.from))+' to '+esc(fmt(plan.to))+'</div><table><thead><tr><th>SL</th><th>Products</th><th>Rate</th><th>Quantity</th><th>Unit</th><th>Total Cost</th></tr></thead><tbody>'+
 (body||'<tr><td colspan="6">No budget products.</td></tr>')+
 '</tbody></table><div class="grand"><span>Budget Total</span><strong>'+money(total)+'</strong></div></body></html>';
}
function exportBudgetStatement(format){
 const plan=currentBudgetPlan();
 if(!plan){alert('No saved budget is available for the selected date range.');return}
 const html=budgetStatementHtml(plan),period=String(plan.from||'')+'-'+String(plan.to||'');
 if(format==='excel'){
  const blob=new Blob(['\ufeff',html],{type:'application/vnd.ms-excel;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='dayquest-budget-'+period+'.xls';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);return;
 }
 const popup=window.open('','_blank');
 if(!popup){alert('Allow pop-ups for DayQuest to print or save this Budget as PDF.');return}
 popup.document.open();popup.document.write(html);popup.document.close();popup.focus();
 setTimeout(()=>{try{popup.print()}catch{}},350);
}

function purchaseLineAmount(line){
 const amount=Number(line.amount);
 return Number.isFinite(amount)?Math.max(0,amount):roundPurchaseAmount(Math.max(0,Number(line.quantity||0))*Math.max(0,Number(line.rate||0)));
}
function purchaseLineTemplate(line,index){
 const units=db.units.map(u=>`<option value="${esc(u)}" ${line.unit===u?'selected':''}>${esc(u)}</option>`).join('');
 return `<div class="purchase-line" data-line-index="${index}">
  <div class="purchase-line-top"><strong>Product ${index+1}</strong><button type="button" class="delete remove-purchase-line" data-index="${index}" ${purchaseLines.length===1?'disabled':''}>Remove</button></div>
  <div class="purchase-product-category-row"><div class="purchase-line-field-row"><label>Product name <input class="pl-product" list="productNameSuggestions" maxlength="80" value="${esc(line.product||'')}" placeholder="e.g. Rice / চাল" required></label><button type="button" class="mini-add pl-add-product" data-index="${index}" aria-label="Add product">＋ Add</button></div><label>Category <select class="pl-category" required>${db.purchaseCategories.map(category=>`<option value="${esc(category)}" ${String(line.category||'Staples').toLocaleLowerCase()===category.toLocaleLowerCase()?'selected':''}>${esc(category)}</option>`).join('')}</select></label></div>
  <div class="purchase-product-type-row"><div class="purchase-line-field-row"><label>Product type <select class="pl-product-type" required>${db.productTypes.map(type=>`<option value="${esc(type)}" ${String(line.productType||'Other').toLocaleLowerCase()===type.toLocaleLowerCase()?'selected':''}>${esc(type)}</option>`).join('')}</select></label><button type="button" class="mini-add pl-add-product-type" data-index="${index}">＋ Add</button></div></div>
  <div class="purchase-numbers-grid"><div class="form-grid"><label>Quantity <input class="pl-quantity" type="number" min="0.001" step="any" value="${Number(line.quantity??1)}" required></label><label>Unit <span class="select-add"><select class="pl-unit">${units}</select><button type="button" class="mini-add pl-add-unit" data-index="${index}">＋ Add</button></span></label></div>
  <div class="form-grid"><label>Rate per unit <input class="pl-rate" type="number" min="0" step="any" value="${Number(line.rate||0)}" required></label><label>Line amount <input class="pl-amount" type="number" min="0" step="any" value="${purchaseLineAmount(line)}" required></label></div></div>
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
  const prop=el.classList.contains('pl-product')?'product':el.classList.contains('pl-product-type')?'productType':el.classList.contains('pl-category')?'category':el.classList.contains('pl-quantity')?'quantity':el.classList.contains('pl-unit')?'unit':el.classList.contains('pl-rate')?'rate':'amount';
  const handle=()=>{
   const line=purchaseLines[index];if(!line)return;
   if(prop==='amount'){
    line.amount=Math.max(0,Number(el.value)||0);applyPurchaseLineAmount(index);
   }else if(prop==='quantity'||prop==='rate'){
    line[prop]=Number(el.value)||0;
    if(line.amountPending)applyPurchaseLineAmount(index);
    else {line.amount=roundPurchaseAmount(Math.max(0,Number(line.quantity||0))*Math.max(0,Number(line.rate||0)));line.calcError=''}
   }else if(prop==='unit'){
    const previousUnit=String(line.unit||'pcs'),nextUnit=String(el.value||'pcs');
    if(previousUnit!==nextUnit&&Number(line.quantity)>0){
     const ratio=unitConversionRatio(previousUnit,nextUnit);
     if(ratio!==null){
      const preservedAmount=purchaseLineAmount(line),convertedQuantity=Number((Number(line.quantity)*ratio).toFixed(6));
      if(convertedQuantity>0){line.quantity=convertedQuantity;line.rate=Number((preservedAmount/convertedQuantity).toFixed(8));line.amount=preservedAmount;}
     }
    }
    line.unit=nextUnit;
   }else line[prop]=el.value;
   updatePurchaseTotals();
  };
  if(el.tagName==='SELECT')el.addEventListener('change',handle);else el.addEventListener('input',handle);
 }));
 $('purchaseLines').querySelectorAll('.pl-product').forEach(input=>{const update=()=>updateProductDictionaryMatch(input);input.addEventListener('input',update);input.addEventListener('change',update);update()});
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
function currentPurchaseTotal(){return Math.max(0,roundPurchaseAmount(currentPurchaseSubtotal()-Number($('purchaseDiscount')?.value||0)))}
function updatePurchaseTotals(){
 purchaseLines.forEach((l,i)=>{
  const node=$('purchaseLines').querySelector(`[data-line-index="${i}"]`);if(!node)return;
  const amountField=node.querySelector('.pl-amount'),quantityField=node.querySelector('.pl-quantity'),rateField=node.querySelector('.pl-rate'),message=node.querySelector('.pl-calc-message');
  if(amountField&&document.activeElement!==amountField)amountField.value=purchaseLineAmount(l);
  if(quantityField&&document.activeElement!==quantityField)quantityField.value=Number(l.quantity??0);
  if(rateField&&document.activeElement!==rateField)rateField.value=Number(l.rate??0);
  if(message)message.textContent=l.calcError||'';
 });
 const subtotal=currentPurchaseSubtotal(),transit=Math.max(0,Number($('purchaseTransitCost')?.value||0)),discount=Math.max(0,Number($('purchaseDiscount')?.value||0)),total=currentPurchaseTotal(),landedTotal=roundPurchaseAmount(total+transit),cash=Number($('purchaseCashPaid').value||0),bank=Number($('purchaseBankPaid').value||0),credit=Math.max(0,total-cash-bank),balances=calculateBalances();
 if($('purchaseSubtotal'))$('purchaseSubtotal').textContent=money(subtotal);$('purchaseBillTotal').textContent=money(total);$('purchaseLandedCost').textContent=money(landedTotal);$('purchaseCreditTotal').textContent=money(credit);$('purchaseCashBalance').textContent=money(balances.cash);$('purchaseBankBalance').textContent=money(balances.bank);
 const paymentTooHigh=cash+bank>total+0.000001,discountTooHigh=discount>subtotal+0.000001,invalid=paymentTooHigh||discountTooHigh;$('purchaseCreditTotal').classList.toggle('invalid-total',invalid);$('purchaseBillSubmit').disabled=invalid;if(editingPurchaseBillId&&invalid&&$('purchaseEditHint')){$('purchaseEditHint').textContent=paymentTooHigh?'Cash paid plus bank paid is greater than the corrected bill total. Reduce one of the paid amounts before updating.':'The discount cannot exceed the product subtotal.';$('purchaseEditHint').hidden=false}

}

function updatePurchaseBillNo(){
 const date=$('purchaseDate').value,field=$('purchaseBillNo');if(!field||!date)return;
 if(editingPurchaseBillId&&date===purchaseBillOriginalDate){const original=db.purchaseBills.find(b=>b.id===editingPurchaseBillId);if(original&&original.billNo){field.value=original.billNo;return}}
 field.value=nextPurchaseBillNo(date,editingPurchaseBillId);
}
function resetPurchaseForm(){editingPurchaseBillId=null;purchaseBillOriginalDate='';if($('purchaseEditHint'))$('purchaseEditHint').hidden=true;$('purchaseBillForm').reset();$('purchaseAmountMode').value='rate';$('purchaseDate').value=today();$('purchaseBillNo').value='';updatePurchaseBillNo();$('purchaseCashPaid').value=0;$('purchaseBankPaid').value=0;if($('purchaseTransitCost'))$('purchaseTransitCost').value=0;if($('purchaseTransitPaidFrom'))$('purchaseTransitPaidFrom').value='Cash';if($('purchaseDiscount'))$('purchaseDiscount').value=0;$('purchaseBillSubmit').textContent='Save purchase bill';$('cancelPurchaseEdit').hidden=true;purchaseLines=[defaultPurchaseLine()];renderPurchaseLines();fillChoices()}
function purchaseFormNotice(message){
 if(editingPurchaseBillId&&$('purchaseEditHint')){$('purchaseEditHint').textContent=message;$('purchaseEditHint').hidden=false;return}
 alert(message);
}
$('budgetViewBtn').addEventListener('click',()=>{
 if(!currentBudgetPlan()){alert('Generate a budget first by selecting a date range and clicking Budget.');return}
 setTab('budgetViewPage');renderBudgetView();
});
$('budgetViewBack').addEventListener('click',()=>setTab('budget'));
$('budgetViewPrint').addEventListener('click',()=>exportBudgetStatement('print'));
$('budgetViewPdf').addEventListener('click',()=>exportBudgetStatement('pdf'));
$('budgetViewExcel').addEventListener('click',()=>exportBudgetStatement('excel'));
$('budgetFromDate').addEventListener('change',renderBudget);
$('budgetToDate').addEventListener('change',renderBudget);
$('buildBudgetBtn').addEventListener('click',buildBudget);
$('budgetList').addEventListener('input',event=>{
 const input=event.target.closest('[data-budget-quantity]');if(!input)return;
 updateBudgetTotals();
});
$('budgetList').addEventListener('change',event=>{
 const input=event.target.closest('[data-budget-quantity]');if(!input)return;
 const quantity=input.value.trim()===''?0:Number(input.value);
 if(!Number.isFinite(quantity)||quantity<0){alert('Enter a valid budget quantity of zero or more.');renderBudget();return}
 const from=$('budgetFromDate').value,to=$('budgetToDate').value,plan=db.budgetPlans[budgetRangeKey(from,to)];
 const row=plan&&Array.isArray(plan.rows)?plan.rows.find(item=>String(item.key)===String(input.dataset.budgetKey)):null;
 if(!row)return;
 row.quantity=quantity;
 localSaveOnly();
 updateBudgetTotals();
});
$('purchaseDate').addEventListener('change',updatePurchaseBillNo);
$('purchaseAmountMode').addEventListener('change',()=>{
 const mode=$('purchaseAmountMode').value==='quantity'?'quantity':'rate';
 purchaseLines.forEach((line,index)=>{line.amountMode=mode;if(purchaseLineAmount(line)>0)applyPurchaseLineAmount(index);else{line.calcError='';line.amountPending=false}});
 renderPurchaseLines();
});
$('addPurchaseLine').onclick=()=>{const line=defaultPurchaseLine();line.amountMode=$('purchaseAmountMode').value==='quantity'?'quantity':'rate';purchaseLines.push(line);renderPurchaseLines()};
$('purchaseCashPaid').oninput=updatePurchaseTotals;$('purchaseBankPaid').oninput=updatePurchaseTotals;$('purchaseTransitCost').oninput=updatePurchaseTotals;$('purchaseTransitPaidFrom').onchange=updatePurchaseTotals;$('purchaseDiscount').oninput=updatePurchaseTotals;
const purchaseSupplierDialog=$('purchaseSupplierDialog'),purchaseSupplierDialogForm=$('purchaseSupplierDialogForm'),purchaseSupplierDialogName=$('purchaseSupplierDialogName');
$('addSupplier').onclick=()=>{
 purchaseSupplierDialogName.value='';
 purchaseSupplierDialog.showModal();
 purchaseSupplierDialogName.focus();
};
$('purchaseSupplierDialogCancel').onclick=()=>purchaseSupplierDialog.close();
purchaseSupplierDialogForm.onsubmit=event=>{
 event.preventDefault();
 let name=purchaseSupplierDialogName.value.trim();
 if(!name){purchaseSupplierDialogName.focus();return}
 const existing=db.suppliers.find(value=>value.toLocaleLowerCase()===name.toLocaleLowerCase());
 if(existing)name=existing;else db.suppliers.push(name);
 fillChoices();renderMasterLists();$('purchaseSupplier').value=name;localSaveOnly();
 purchaseSupplierDialog.close();
};
$('purchaseBillForm').onsubmit=e=>{
 e.preventDefault();if(editingPurchaseBillId&&db.settings.allowPurchaseBillEdits===false){if($('purchaseEditHint')){$('purchaseEditHint').textContent='Editing is disabled. Enable “Allow editing saved purchase bills” in Settings, then reopen this bill.';$('purchaseEditHint').hidden=false}return}const supplierInput=$('purchaseSupplier').value.trim(),date=$('purchaseDate').value,cashPaid=Number($('purchaseCashPaid').value||0),bankPaid=Number($('purchaseBankPaid').value||0),subtotal=currentPurchaseSubtotal(),transitCost=Math.max(0,Number($('purchaseTransitCost').value||0)),transitPaidFrom=$('purchaseTransitPaidFrom').value==='Bank'?'Bank':'Cash',discount=Math.max(0,Number($('purchaseDiscount').value||0)),total=currentPurchaseTotal(),unpaid=Math.max(0,total-cashPaid-bankPaid);
 const supplier=supplierInput||(unpaid>0?'Unassigned supplier':'');
 const lines=purchaseLines.map(l=>({id:l.lineId||crypto.randomUUID(),product:String(l.product||'').trim(),category:String(l.category||db.purchaseCategories[0]||'Staples').trim(),productType:String(l.productType||'Other').trim()||'Other',spec:String(l.spec||'').trim(),quantity:Number(l.quantity),unit:String(l.unit||'pcs'),rate:Number(l.rate),amount:purchaseLineAmount(l),costType:['family','member','unassigned','members'].includes(l.costType)?l.costType:'unassigned',costMember:String(l.costMember||'').trim(),costMembers:Array.isArray(l.costMembers)?uniquePeople(l.costMembers):[]}));
 if(unpaid>0&&db.settings.requireSupplierForDuePurchase&&!supplierInput){purchaseFormNotice('Select a supplier because this purchase has an unpaid balance. You can change this rule in Settings.');return}
 if(!date){purchaseFormNotice('Select the purchase date.');return}
 if(!lines.length||purchaseLines.some(l=>l.calcError)||lines.some(l=>!l.product||!l.productType||!(l.quantity>0)||!(l.rate>=0)||!(l.amount>=0)||!Number.isFinite(l.quantity)||!Number.isFinite(l.rate)||!Number.isFinite(l.amount))){purchaseFormNotice('Enter a product name, product type, valid quantity, rate and line amount for every bill line. For amount-based calculation, enter the required quantity or rate first.');return}
 if(transitCost<0||discount<0||discount>subtotal+0.000001){purchaseFormNotice('Transit cost must be zero or greater, and discount cannot exceed the product subtotal. Transit cost is recorded separately from the bill.');return}
 if(cashPaid<0||bankPaid<0||cashPaid+bankPaid>total+0.000001){purchaseFormNotice('Cash paid plus bank paid cannot exceed the bill total. Adjust the payment amounts or the corrected bill total before updating.');return}
 const old=editingPurchaseBillId?db.purchaseBills.find(b=>b.id===editingPurchaseBillId):null;
 const billNo=old&&date===purchaseBillOriginalDate?String(old.billNo||'').trim():nextPurchaseBillNo(date,editingPurchaseBillId);
 if(!billNo){purchaseFormNotice('Could not generate a bill number. Check the purchase date and try again.');return}
 if(db.purchaseBills.some(b=>b.id!==editingPurchaseBillId&&String(b.billNo||'').trim().toLocaleLowerCase()===billNo.toLocaleLowerCase())){purchaseFormNotice('This bill number already exists. A new unique number has been generated; review it and update again.');updatePurchaseBillNo();return}
 const categories=uniquePeople(lines.map(line=>line.category));const values={supplier,category:categories.length===1?categories[0]:'Multiple categories',billNo,date,lines,subtotal,transitCost,transitPaidFrom,discount,total,cashPaid,bankPaid,credit:unpaid,note:$('purchaseNote').value.trim()};
 if(editingPurchaseBillId){
  if(!old){purchaseFormNotice('The original purchase bill could not be found. Refresh the page and reopen the bill.');return}
  const billConsumptions=db.consumptions.filter(c=>c.billId===editingPurchaseBillId);
  // Keep stock chronology valid: a source lot cannot be dated after something already consumed from it.
  if(billConsumptions.length){
   const firstUse=billConsumptions.map(c=>String(c.date||'')).filter(Boolean).sort()[0];
   if(firstUse&&date>firstUse){$('purchaseEditHint').textContent=`This bill has stock movements dated from ${fmt(firstUse)}. Set the purchase date to ${fmt(firstUse)} or earlier so stock history remains chronological.`;$('purchaseEditHint').hidden=false;return}
  }
  const unitConsumptionUpdates=[];
  for(const oldLine of (old.lines||[])){
   const linked=billConsumptions.filter(c=>c.lineId===oldLine.id);
   if(!linked.length)continue;
   const nextLine=lines.find(line=>line.id===oldLine.id);
   if(!nextLine){$('purchaseEditHint').textContent=`${oldLine.product||'A product line'} has already been used or sold. Keep that line in the bill; you can still correct its product name, unit, quantity, rate, amount, category and type.`;$('purchaseEditHint').hidden=false;return}
   const oldQuantity=Number(oldLine.quantity||0),nextQuantity=Number(nextLine.quantity||0);
   // Scale historical consumption by the corrected lot quantity. Compatible unit changes
   // already convert the purchase quantity in the form; custom units keep the entered count.
   const consumptionScale=oldQuantity>0?nextQuantity/oldQuantity:1;
   linked.forEach(record=>unitConsumptionUpdates.push({record,quantity:Number((Number(record.quantity||0)*consumptionScale).toFixed(6))}));
  }
  // Supplier payments are allocated dynamically against current bill balances (oldest bill first).
  // Do not block a correction just because the supplier has a payment history.
  unitConsumptionUpdates.forEach(update=>{update.record.quantity=update.quantity});
  Object.assign(old,values);
  recalculateProductionCostsFromInventory();
 }
 else db.purchaseBills.unshift({id:crypto.randomUUID(),...values});
 if(supplier&&!db.suppliers.includes(supplier))db.suppliers.push(supplier);lines.forEach(l=>{if(!db.productNames.includes(l.product))db.productNames.push(l.product);if(!db.purchaseCategories.includes(l.category))db.purchaseCategories.push(l.category);if(!db.productTypes.some(type=>type.toLocaleLowerCase()===l.productType.toLocaleLowerCase()))db.productTypes.push(l.productType);if(!db.units.includes(l.unit))db.units.push(l.unit)});
 const wasEditing=!!editingPurchaseBillId;resetPurchaseForm();save();alert(wasEditing?'Purchase bill updated successfully.':'Purchase bill saved successfully.');
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
// Rebuild production material values from the live inventory ledger after a source bill is corrected.
// DFS recalculation preserves dependencies when a production batch consumes another production batch.
function recalculateProductionCostsFromInventory(){
 const completed=new Set(),visiting=new Set();
 function recalculate(productionId){
  if(completed.has(productionId)||visiting.has(productionId))return;
  const batch=db.productions.find(item=>item.id===productionId);if(!batch)return;
  visiting.add(productionId);
  const entries=db.consumptions.filter(item=>item.productionId===productionId),groups=new Map(),owners=[];let ingredientCost=0;
  entries.forEach(entry=>{
   let source=resolveStockSource(entry.billId,entry.lineId);if(!source)return;
   if(source.sourceType==='production'){recalculate(source.source.id);source=resolveStockSource(entry.billId,entry.lineId)||source}
   const quantity=Math.max(0,Number(entry.quantity||0)),unitCost=source.quantity>0?Number(source.amount||0)/Number(source.quantity):0,cost=quantity*unitCost;
   ingredientCost+=cost;source.costMembers.forEach(name=>owners.push(name));
   const key=[source.product.toLocaleLowerCase(),source.spec.toLocaleLowerCase(),source.unit.toLocaleLowerCase()].join('::');
   const current=groups.get(key)||{product:source.product,unit:source.unit,quantity:0,cost:0};current.quantity+=quantity;current.cost+=cost;groups.set(key,current);
  });
  if(entries.length){
   batch.ingredientCost=roundPurchaseAmount(ingredientCost);
   batch.electricityCost=Math.max(0,Number(batch.electricityCost||0));
   batch.transitCost=Math.max(0,Number(batch.transitCost||0));
   batch.overheadCost=roundPurchaseAmount(batch.electricityCost+batch.transitCost);
   batch.totalCost=roundPurchaseAmount(batch.ingredientCost+batch.overheadCost);
   batch.unitCost=Number(batch.quantity)>0?batch.totalCost/Number(batch.quantity):0;
   batch.inputs=[...groups.values()].map(item=>({product:item.product,unit:item.unit,quantity:Number(item.quantity.toFixed(6)),cost:roundPurchaseAmount(item.cost)}));
   batch.costMembers=uniquePeople(owners);
   batch.overheadMembers=batch.costMembers.slice();
  }
  visiting.delete(productionId);completed.add(productionId);
 }
 db.productions.forEach(batch=>recalculate(batch.id));
}
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
  const unitCost=Number(record.quantity)>0?Number(amount)/Number(record.quantity):0;
  const sourceLabel=sourceType==='production'?'In-house production':(bill.supplier||'Cash purchase');
  const sourceNo=bill.billNo?`${sourceType==='production'?'Production':'Bill'} #${bill.billNo}`:'Not numbered';
  return `<article class="inventory-row" id="inventory-record-${domId}" data-inventory-ref="${esc(stockRef)}">
   <div class="inventory-row-head"><div><strong>${esc(record.product)}</strong></div></div>
   <div class="inventory-primary-stats">
    <div class="inventory-primary-stock"><small>In stock</small><strong>${numberText(remaining)} ${esc(record.unit)}</strong></div>
    <div class="inventory-primary-unit-cost"><small>Unit cost</small><strong>${money(unitCost)} / ${esc(record.unit)}</strong></div>
    <div class="inventory-primary-owners"><small>Cost owners</small><strong title="${esc(assignment)}">${esc(assignment)}</strong></div>
    <details class="inventory-row-details"><summary><span>Other details</span><span class="inventory-detail-arrow" aria-hidden="true">▾</span></summary>
     <div class="inventory-details-content">
      <div class="inventory-extra-stats">
       <span>Added<strong>${numberText(record.quantity)} ${esc(record.unit)}</strong></span>
       <span>Sold<strong>${numberText(sold)} ${esc(record.unit)}</strong></span>
       <span>Other used<strong>${numberText(otherUsed)} ${esc(record.unit)}</strong></span>
       <span>Total cost<strong>${money(amount)}</strong></span>
       <span>Product type<strong>${esc(record.productType||'Other')}</strong></span>
       <span>Source<strong>${sourceType==='production'?'Production':'Purchase'}</strong></span>
       <span>Supplier / source<strong>${esc(sourceLabel)}</strong></span>
       <span>Purchase / production date<strong>${esc(fmt(record.date))}</strong></span>
       <span>Bill / production no.<strong>${esc(sourceNo)}</strong></span>
       ${record.spec?`<span>Size / specification<strong>${esc(record.spec)}</strong></span>`:''}
      </div>
      <div class="inventory-row-actions"><div><strong class="assignment-label">Assign product cost (select one or more)</strong><div class="member-check-list" data-inventory-members>${inventoryMemberChecks(line)}</div></div><div class="inventory-buttons">
       ${sourceType==='purchase'&&db.settings.allowPurchaseBillEdits!==false?`<button type="button" class="edit-btn" data-edit-inventory-bill="${esc(bill.id)}">Edit recent bill</button>`:''}
       <button type="button" class="edit-btn" data-save-inventory-assignment>Save assignment</button>
       <button type="button" class="secondary" data-use-inventory ${remaining<=0.000001?'disabled':''}>Use stock</button>
      </div></div>
     </div>
    </details>
   </div>
  </article>`;
 }).join(''):empty('No inventory yet. Save a purchase bill or production batch to add products to your inventory.');
 list.querySelectorAll('[data-edit-inventory-bill]').forEach(button=>button.onclick=()=>editPurchaseBill(button.dataset.editInventoryBill));
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
function inventoryStatementRows(){
 return inventoryEntries().map(record=>{
  const unitCost=Number(record.quantity)>0?Number(record.amount||0)/Number(record.quantity):0;
  return [record.product,record.productType||'Other',record.spec||'',record.sourceType==='production'?'Production':'Purchase',record.bill.supplier||'In-house production',record.bill.billNo||'',record.date,numberText(record.quantity),record.unit,numberText(record.sold),numberText(record.otherUsed),numberText(record.remaining),money(unitCost),money(record.amount),record.costMembers.length?record.costMembers.join(', '):'Not assigned'];
 });
}
function inventoryStatementHtml(){
 const headers=['Product','Product type','Size / specification','Source','Supplier','Bill / production no.','Date','Added qty','Unit','Sold qty','Other used','In stock','Unit cost','Total cost','Cost owners'];
 const rows=inventoryStatementRows(),totalLots=rows.length,totalStock=inventoryEntries().reduce((t,r)=>t+Number(r.remaining||0),0),totalCost=inventoryEntries().reduce((t,r)=>t+Number(r.amount||0),0);
 const head=headers.map(value=>`<th>${esc(value)}</th>`).join(''),body=rows.map(row=>`<tr>${row.map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`).join('');
 return `<!doctype html><html><head><meta charset="utf-8"><title>DayQuest Inventory Statement</title><style>body{font-family:Arial,sans-serif;color:#182337;padding:22px}h1{font-size:20px;margin:0 0 6px}.meta{color:#667085;font-size:11px;margin-bottom:14px}.summary{display:flex;gap:24px;flex-wrap:wrap;margin:12px 0 18px}.summary strong{display:block;font-size:15px;margin-top:3px}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #d8dee8;padding:6px;text-align:left;vertical-align:top}th{background:#eef2f7}tr:nth-child(even){background:#fafbfd}@media print{body{padding:0}thead{display:table-header-group}tr{break-inside:avoid}}</style></head><body><h1>DayQuest · Inventory Statement</h1><div class="meta">Generated ${esc(fmt(today()))}</div><div class="summary"><div>Product lots<strong>${totalLots}</strong></div><div>Available stock<strong>${esc(numberText(totalStock))}</strong></div><div>Total inventory cost<strong>${esc(money(totalCost))}</strong></div></div><table><thead><tr>${head}</tr></thead><tbody>${body||`<tr><td colspan="${headers.length}">No inventory records</td></tr>`}</tbody></table></body></html>`;
}
function exportInventoryStatement(format){
 const html=inventoryStatementHtml();
 if(format==='excel'){
  const blob=new Blob(['\ufeff',html],{type:'application/vnd.ms-excel;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=`dayquest-inventory-statement-${today()}.xls`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
 }
 const popup=window.open('','_blank');if(!popup){alert('Allow pop-ups for DayQuest to print or save this inventory statement as PDF.');return}
 popup.document.open();popup.document.write(html);popup.document.close();popup.focus();setTimeout(()=>{try{popup.print()}catch{}},350);
}
$('inventoryExcelBtn').onclick=()=>exportInventoryStatement('excel');
$('inventoryPdfBtn').onclick=()=>exportInventoryStatement('pdf');

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
  <div class="production-input-product-row"><label>Product <select class="production-input-product" required><option value="">${buckets.length?'Select product':'No inventory stock'}</option>${options}${input.product&&!buckets.some(bucket=>bucket.product.toLocaleLowerCase()===input.product.toLocaleLowerCase()&&bucket.unit.toLocaleLowerCase()===input.unit.toLocaleLowerCase())?`<option value="${esc(selected)}" selected>${esc(input.product)} (${esc(input.unit)}) · No stock on production date</option>`:''}</select></label><button type="button" class="mini-add production-add-material-inline" aria-label="Add material" title="Add material">＋</button></div>
  <label>Quantity <input class="production-input-quantity" type="number" min="0.001" step="any" value="${Number(input.quantity||1)}" required></label>
  <label>Unit <input class="production-input-unit" value="${esc(input.unit||'')}" placeholder="—" readonly aria-readonly="true" tabindex="-1"></label>
  ${input.product?`<small class="production-input-stock">Available on ${fmt($('productionDate').value)}: ${numberText(available)} ${esc(input.unit)}</small>`:''}
  <button type="button" class="delete remove-production-input" data-index="${index}" ${productionInputs.length===1?'disabled':''}>Remove</button>
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
 $('productionInputs').querySelectorAll('.production-add-material-inline').forEach(button=>button.onclick=()=>{
  let index=productionInputs.findIndex(input=>!String(input.product||'').trim());if(index<0){productionInputs.push(defaultProductionInput());index=productionInputs.length-1}
  renderProductionInputs();updateProductionPreview();$('productionInputs').querySelectorAll('.production-input-product')[index]?.focus();
 });
 updateProductionPreview();
}
function allocateProductionMaterials(inputs,date){
 const buckets=buildSalesStockBuckets(null,date),consumptions=[],summaries=[],owners=[];let ingredientCost=0;
 for(const input of inputs){
  if(!input.product||!input.unit||!(Number(input.quantity)>0))return {error:'Choose a product and enter a positive quantity.'};
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

 $('productionSubmit').disabled=!!allocation.error||!productionInputs.length||!(quantity>0);
}
function fillProductionOptions(){
 const unit=$('productionUnit');if(unit){const prior=unit.value;unit.innerHTML=db.units.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');if(db.units.includes(prior))unit.value=prior;else if(db.units.includes('pcs'))unit.value='pcs'}
}
function resetProductionForm(){
 $('productionForm').reset();$('productionDate').value=today();$('productionNo').value=nextProductionNo(today());$('productionQuantity').value=1;$('productionElectricityCost').value=0;$('productionTransitCost').value=0;fillProductionOptions();productionInputs=[defaultProductionInput()];renderProductionInputs();
}
function renderProductionList(){
 const list=$('productionList');if(!list)return;
 const stockRows=inventoryEntries();
 const batches=db.productions.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 $('productionCount').textContent=`${batches.length} ${batches.length===1?'batch':'batches'}`;
 list.innerHTML=batches.length?batches.map(batch=>{
  const inputs=(batch.inputs||[]).map(item=>`${esc(item.product)} ${numberText(item.quantity)} ${esc(item.unit)} (${money(item.cost)})`).join(' · ');
  const regular=batch.regularProduct===true||db.productNames.some(name=>String(name).toLocaleLowerCase()===String(batch.product||'').toLocaleLowerCase());
  const stockRecord=stockRows.find(record=>record.billId===`production:${batch.id}`&&record.lineId==='output'),inStock=Number(stockRecord?.remaining??batch.quantity??0);
  return `<article class="production-batch" data-production-id="${esc(batch.id)}"><div class="production-batch-head"><div><strong>${esc(batch.product)}</strong><small>${esc(batch.productionNo||'Production')} · ${fmt(batch.date)} · Produced ${numberText(batch.quantity)} ${esc(batch.unit)} · In stock ${numberText(inStock)} ${esc(batch.unit)}</small></div><strong>${money(batch.totalCost)}</strong></div><div class="production-batch-grid"><span>Materials<strong>${money(batch.ingredientCost)}</strong></span><span>Electricity<strong>${money(batch.electricityCost)}</strong></span><span>Transit<strong>${money(batch.transitCost)}</strong></span><span>Cost per unit<strong>${money(batch.unitCost)}</strong></span></div><small class="production-batch-materials">Used: ${inputs||'No materials recorded'}</small><div class="production-batch-actions"><button type="button" class="edit-btn" data-open-production-stock>Open Inventory</button>${regular?'<span class="production-regular-label">Regular Product</span>':'<button type="button" class="secondary" data-transfer-regular>Transfer to Regular Product</button>'}<button type="button" class="delete" data-delete-production>Delete batch</button></div></article>`;
 }).join(''):empty('No production batches yet. Select inventory materials and save your first finished product batch.');
 list.querySelectorAll('[data-open-production-stock]').forEach(button=>button.onclick=()=>{const batch=button.closest('[data-production-id]');openInventoryLine(stockRefKey(`production:${batch.dataset.productionId}`,'output'))});
 list.querySelectorAll('[data-transfer-regular]').forEach(button=>button.onclick=()=>{
  const batch=db.productions.find(item=>item.id===button.closest('[data-production-id]')?.dataset.productionId);if(!batch)return;
  if(!db.productNames.some(name=>String(name).toLocaleLowerCase()===String(batch.product).toLocaleLowerCase()))db.productNames.push(batch.product);
  batch.regularProduct=true;renderProductNameSuggestions();save();alert(`${batch.product} is now available as a Regular Product. No additional cost has been added.`);
 });
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

['productionQuantity','productionElectricityCost','productionTransitCost'].forEach(id=>$(id).addEventListener('input',updateProductionPreview));
$('productionForm').onsubmit=e=>{
 e.preventDefault();const date=$('productionDate').value,productionNo=$('productionNo').value,product=$('productionProduct').value.trim(),quantity=Number($('productionQuantity').value),unit=$('productionUnit').value,electricityCost=Number($('productionElectricityCost').value||0),transitCost=Number($('productionTransitCost').value||0);
 if(!date||!product||!unit||!(quantity>0)||!Number.isFinite(quantity)){alert('Enter a production date, finished product name, positive quantity and unit.');return}
 if(!Number.isFinite(electricityCost)||!Number.isFinite(transitCost)||electricityCost<0||transitCost<0){alert('Electricity and transit costs must be zero or greater.');return}
 if(!productionInputs.length||productionInputs.some(input=>!input.product||!(Number(input.quantity)>0))){alert('Add at least one inventory material with a valid quantity.');return}
 const allocation=allocateProductionMaterials(productionInputs,date);if(allocation.error){alert(allocation.error);return}
 const totalCost=roundPurchaseAmount(allocation.ingredientCost+electricityCost+transitCost),id=crypto.randomUUID();
 if(db.productions.some(item=>String(item.productionNo||'').toLocaleLowerCase()===productionNo.toLocaleLowerCase())){alert('This production number already exists. Please refresh the form and try again.');$('productionNo').value=nextProductionNo(date);return}
 const batch={id,productionNo,date,product,regularProduct:false,quantity,unit,ingredientCost:allocation.ingredientCost,electricityCost,transitCost,totalCost,unitCost:quantity>0?totalCost/quantity:0,inputs:allocation.summaries,costMembers:allocation.costMembers,overheadMembers:allocation.costMembers.slice(),overheadCost:roundPurchaseAmount(electricityCost+transitCost)};
 db.productions.unshift(batch);
 allocation.consumptions.forEach(item=>db.consumptions.push({id:crypto.randomUUID(),...item,productionId:id,productionNo,date}));
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
  const billId=esc(b.id),lines=b.lines||[],products=lines.map(line=>{
   const lineId=esc(line.id),used=db.consumptions.filter(c=>c.billId===b.id&&c.lineId===line.id).reduce((t,c)=>t+Number(c.quantity||0),0),remaining=Math.max(0,Number(line.quantity||0)-used),amount=purchaseLineCost(b,line),owners=assignedMembers(line);
   return `<article class="purchase-bill-line" id="purchase-bill-line-${lineId}"><div class="purchase-bill-line-head"><strong>${esc(line.product||'Product')}${line.spec?` · ${esc(line.spec)}`:''}</strong><strong>${money(amount)}</strong></div><small>${esc(line.category||b.category||'Uncategorised')} · ${esc(line.productType||'Other')} · ${numberText(line.quantity)} ${esc(line.unit||'pcs')} × ${money(line.rate||0)}</small><div class="purchase-bill-stock"><span>Purchased <strong>${numberText(line.quantity)} ${esc(line.unit||'pcs')}</strong></span><span>Used <strong>${numberText(used)} ${esc(line.unit||'pcs')}</strong></span><span>In stock <strong>${numberText(remaining)} ${esc(line.unit||'pcs')}</strong></span><span>Assigned to <strong>${esc(owners.length?owners.join(', '):'Not assigned')}</strong></span></div><button type="button" class="edit-btn" data-view-inventory-line="${esc(stockRefKey(b.id,line.id))}">Open inventory record</button></article>`;
  }).join('');
  const label=`${b.supplier||'Cash purchase'}${b.billNo?` · #${b.billNo}`:''} · ${fmt(b.date)} · ${lines.length} item${lines.length===1?'':'s'}`;
  return `<article class="purchase-bill-card" id="purchase-bill-${billId}" data-purchase-bill-card="${billId}"><div class="purchase-bill-compact-row" data-bill-summary tabindex="0" aria-expanded="false"><span class="purchase-bill-compact-title">${esc(label)}</span><strong class="purchase-bill-compact-total">${money(billTotal(b))}</strong><button type="button" class="purchase-bill-more" data-bill-actions-toggle aria-label="Show actions for this purchase bill" aria-expanded="false" title="Bill actions">⋯</button></div><div class="purchase-bill-actions" data-bill-actions hidden>${b.supplier?`<button type="button" class="edit-btn" data-open-supplier="${esc(b.supplier)}">Account</button>`:''}<button type="button" class="edit-btn" data-bill-detail-toggle>View details</button>${db.settings.allowPurchaseBillEdits!==false?`<button type="button" class="edit-btn" data-edit-bill="${billId}">Edit bill</button>`:''}<button type="button" class="delete" data-delete-bill="${billId}">Delete</button></div><div class="purchase-bill-detail-panel" data-bill-detail hidden><div class="purchase-bill-detail-meta">${esc((lines).map(line=>line.category||b.category||'Uncategorised').filter((value,index,array)=>array.indexOf(value)===index).join(', '))} · Transit ${money(b.transitCost)} · Discount ${money(b.discount)} · Cash ${money(b.cashPaid)} · Bank ${money(b.bankPaid)} · Credit ${money(billCredit(b))}</div><div class="purchase-bill-products">${products||empty('No products on this bill.')}</div></div></article>`;
 }).join(''):empty('No purchase bills saved yet.');
 $('purchaseBillList').querySelectorAll('[data-open-supplier]').forEach(btn=>btn.onclick=()=>openSupplierAccount(btn.dataset.openSupplier));
 $('purchaseBillList').querySelectorAll('[data-edit-bill]').forEach(btn=>btn.onclick=()=>editPurchaseBill(btn.dataset.editBill));
 $('purchaseBillList').querySelectorAll('[data-delete-bill]').forEach(btn=>btn.onclick=()=>deletePurchaseBill(btn.dataset.deleteBill));
 $('purchaseBillList').querySelectorAll('[data-view-inventory-line]').forEach(btn=>btn.onclick=()=>openInventoryLine(btn.dataset.viewInventoryLine));
 $('purchaseBillList').querySelectorAll('[data-bill-detail-toggle]').forEach(btn=>btn.onclick=()=>{const panel=btn.closest('[data-purchase-bill-card]')?.querySelector('[data-bill-detail]');if(!panel)return;panel.hidden=!panel.hidden;btn.textContent=panel.hidden?'View details':'Hide details'});
}
function loanSettledAmount(loan){return (loan.settlements||[]).reduce((total,item)=>total+Math.max(0,Number(item.amount)||0),0)}
function loanOutstanding(loan){return Math.max(0,Number(loan.amount||0)-loanSettledAmount(loan))}
function loanMoneySummary(){
 const given=db.loans.filter(loan=>loan.type!=='taken').reduce((total,loan)=>total+loanOutstanding(loan),0);
 const taken=db.loans.filter(loan=>loan.type==='taken').reduce((total,loan)=>total+loanOutstanding(loan),0);
 return {given,taken,net:given-taken};
}
function buildLoanInstallmentSchedule(amount,count,firstDate,frequency){
 if(!firstDate)return [];
 const n=Math.max(1,Math.min(120,Math.floor(Number(count)||1))),cents=Math.round(Number(amount)*100),base=Math.floor(cents/n),remainder=cents-base*n,rows=[];
 for(let i=0;i<n;i++){
  const due=new Date(firstDate+'T12:00:00');
  if(frequency==='weekly')due.setDate(due.getDate()+7*i);
  else if(frequency==='fortnightly')due.setDate(due.getDate()+14*i);
  else{const day=due.getDate();due.setDate(1);due.setMonth(due.getMonth()+i);due.setDate(Math.min(day,new Date(due.getFullYear(),due.getMonth()+1,0).getDate()))}
  rows.push({id:crypto.randomUUID(),dueDate:due.toISOString().slice(0,10),amount:Number(((base+(i===n-1?remainder:0))/100).toFixed(2))});
 }
 return rows;
}
function loanInstallmentBalances(loan){
 const items=(loan.installments||[]).slice().sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
 const balances=new Map(items.map(item=>[item.id,Math.max(0,Number(item.amount)||0)]));
 const settlements=(loan.settlements||[]).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
 settlements.filter(item=>item.installmentId&&balances.has(item.installmentId)).forEach(item=>balances.set(item.installmentId,Math.max(0,(balances.get(item.installmentId)||0)-Math.max(0,Number(item.amount)||0))));
 let unassigned=settlements.filter(item=>!item.installmentId).reduce((total,item)=>total+Math.max(0,Number(item.amount)||0),0);
 items.forEach(item=>{if(unassigned<=0)return;const open=balances.get(item.id)||0,take=Math.min(open,unassigned);balances.set(item.id,open-take);unassigned-=take});
 return balances;
}
function loanInstallmentOutstanding(loan,installment){return loanInstallmentBalances(loan).get(installment.id)||0}
function resetLoanForm(){
 editingLoanId=null;$('loanForm').reset();$('loanDate').value=today();$('loanDueDate').value='';$('loanInstallmentCount').value=1;$('loanInstallmentFrequency').value='monthly';$('loanMethod').value='Cash';
 $('loanType').value='given';$('loanDueDateLabel').textContent='First installment date';$('loanFormTitle').textContent='Add loan';
 $('loanSaveButton').textContent='Save loan';$('loanCancelEdit').hidden=true;
}
function renderLoans(){
 const summary=loanMoneySummary();
 $('loanGivenOutstanding').textContent=money(summary.given);$('loanTakenOutstanding').textContent=money(summary.taken);$('loanNetOutstanding').textContent=money(summary.net);
 $('loanCount').textContent=`${db.loans.length} ${db.loans.length===1?'loan':'loans'}`;
 const rows=db.loans.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(a.id).localeCompare(String(b.id)));
 $('loanList').innerHTML=rows.length?rows.map(loan=>{
  const given=loan.type!=='taken',outstanding=loanOutstanding(loan),settled=loanSettledAmount(loan),title=given?'Loan given · To collect':'Loan taken · To repay';
  const pendingInstallments=(loan.installments||[]).filter(item=>loanInstallmentOutstanding(loan,item)>0.000001).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  const nextInstallment=pendingInstallments[0];
  const dateLabel=nextInstallment?(given?'Next collection ':'Next payment ')+fmt(nextInstallment.dueDate):(given?'Collection completed':'Repayment completed');
  const history=(loan.settlements||[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).map(item=>`<div class="loan-history-row"><span>${given?'Collected':'Repaid'} · ${fmt(item.date)} · ${esc(item.method||'Cash')}</span><strong>${money(item.amount)}</strong></div>`).join('');
  return `<article class="loan-card" data-loan-id="${esc(loan.id)}">
   <details class="loan-details-disclosure">
    <summary class="loan-register-summary" aria-label="Show loan register details">
     <span class="loan-register-name">${esc(loan.party||'Loan')}</span>
     <strong class="loan-outstanding-value">${money(outstanding)}</strong>
     <span class="loan-details-toggle-icon" aria-hidden="true">▾</span>
    </summary>
    <div class="loan-details-content">
     <div class="loan-card-actions">${outstanding>0.000001?`<button type="button" class="primary" data-loan-settle>${given?'Collect':'Pay'} loan</button>`:''}<button type="button" class="secondary" data-loan-edit>Edit</button><button type="button" class="delete" data-loan-delete>Delete</button></div>
     <small class="loan-note">${title} · ${fmt(loan.date)} · ${esc(loan.method||'Cash')}</small>
     <div class="loan-card-stats"><span>Loan amount<strong>${money(loan.amount)}</strong></span><span>Settled<strong>${money(settled)}</strong></span><span>${dateLabel}<strong>${outstanding<=0.000001?'Completed':loan.dueDate&&loan.dueDate<today()?'Overdue':'Outstanding'}</strong></span></div>
     ${loan.installments?.length?'<div class="loan-installments">'+loan.installments.map((item,index)=>{const left=loanInstallmentOutstanding(loan,item),status=left<=0.000001?"Paid":item.dueDate<today()?"Overdue":"Upcoming";return '<div class="loan-installment-row"><span>Installment '+(index+1)+' · '+fmt(item.dueDate)+' · '+status+'</span><strong>'+money(left)+' / '+money(item.amount)+'</strong></div>'}).join('')+'</div>':''}
     ${loan.note?`<small class="loan-note">${esc(loan.note)}</small>`:''}
     ${history?`<div class="loan-history">${history}</div>`:''}
    </div>
   </details>
  </article>`;
 }).join(''):empty('No loans recorded yet.');
 $('loanList').querySelectorAll('[data-loan-settle]').forEach(button=>button.onclick=()=>openLoanSettlement(button.closest('[data-loan-id]')?.dataset.loanId));
 $('loanList').querySelectorAll('[data-loan-edit]').forEach(button=>button.onclick=()=>editLoan(button.closest('[data-loan-id]')?.dataset.loanId));
 $('loanList').querySelectorAll('[data-loan-delete]').forEach(button=>button.onclick=()=>deleteLoan(button.closest('[data-loan-id]')?.dataset.loanId));
}
function editLoan(id){
 const loan=db.loans.find(item=>item.id===id);if(!loan)return;
 editingLoanId=id;$('loanType').value=loan.type;$('loanParty').value=loan.party;$('loanAmount').value=Number(loan.amount||0);$('loanMethod').value=loan.method||'Cash';$('loanDate').value=loan.date||today();$('loanDueDate').value=loan.installments&&loan.installments.length?loan.installments[0].dueDate:loan.dueDate||'';$('loanInstallmentCount').value=loan.installments&&loan.installments.length?loan.installments.length:(loan.installmentCount||1);$('loanInstallmentFrequency').value=loan.installmentFrequency||'monthly';$('loanNote').value=loan.note||'';
 $('loanDueDateLabel').textContent='First installment date';$('loanFormTitle').textContent='Edit loan';$('loanSaveButton').textContent='Update loan';$('loanCancelEdit').hidden=false;$('loanForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function deleteLoan(id){
 const loan=db.loans.find(item=>item.id===id);if(!loan)return;
 if(!confirm('Delete this loan and its collection / repayment history? The cash and bank balances will be recalculated.'))return;
 db.loans=db.loans.filter(item=>item.id!==id);if(editingLoanId===id)resetLoanForm();save();
}
function openLoanSettlement(id){
 const loan=db.loans.find(item=>item.id===id);if(!loan||loanOutstanding(loan)<=0.000001)return;
 settlingLoanId=id;const given=loan.type!=='taken',due=loanOutstanding(loan);
 $('loanSettlementTitle').textContent=given?'Collect loan':'Pay loan';
 $('loanSettlementBalance').textContent=`${loan.party} · Remaining ${money(due)}`;
 const openInstallments=(loan.installments||[]).filter(item=>loanInstallmentOutstanding(loan,item)>0.000001).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
 $('loanSettlementInstallment').innerHTML='<option value="">General payment / collection</option>'+openInstallments.map(item=>'<option value="'+esc(item.id)+'">Installment '+((loan.installments||[]).indexOf(item)+1)+' · '+fmt(item.dueDate)+' · '+money(loanInstallmentOutstanding(loan,item))+'</option>').join('');
 $('loanSettlementInstallmentLabel').hidden=!openInstallments.length;
 $('loanSettlementInstallment').value=openInstallments[0]?.id||'';
 const cap=openInstallments.length?loanInstallmentOutstanding(loan,openInstallments[0]):due;
 $('loanSettlementAmount').value=cap.toFixed(2);$('loanSettlementAmount').max=cap.toFixed(2);$('loanSettlementDate').value=today();$('loanSettlementMethod').value='Cash';
 $('loanSettlementDateLabel').childNodes[0].textContent=given?'Collection date ':'Repayment date ';
 $('loanSettlementDialog').showModal();
}
$('loanSettlementCancel').onclick=()=>{$('loanSettlementDialog').close();settlingLoanId=null};
$('loanSettlementInstallment').onchange=()=>{
 const loan=db.loans.find(item=>item.id===settlingLoanId),installment=loan?.installments?.find(item=>item.id===$('loanSettlementInstallment').value);
 const cap=installment?loanInstallmentOutstanding(loan,installment):loan?loanOutstanding(loan):0;
 $('loanSettlementAmount').value=cap.toFixed(2);$('loanSettlementAmount').max=cap.toFixed(2);
};
$('loanSettlementForm').onsubmit=event=>{
 event.preventDefault();const loan=db.loans.find(item=>item.id===settlingLoanId);if(!loan)return;
 const amount=Number($('loanSettlementAmount').value),date=$('loanSettlementDate').value,method=$('loanSettlementMethod').value,installmentId=$('loanSettlementInstallment').value||null,installment=loan.installments?.find(item=>item.id===installmentId),limit=installment?loanInstallmentOutstanding(loan,installment):loanOutstanding(loan);
 if(!date||!Number.isFinite(amount)||amount<=0||amount>limit+0.000001||amount>loanOutstanding(loan)+0.000001){alert('Enter a valid amount up to '+money(limit)+' for this installment.');return}
 loan.settlements.push({id:crypto.randomUUID(),amount,date,method:method==='Bank'?'Bank':'Cash',installmentId});
 $('loanSettlementDialog').close();settlingLoanId=null;save();
};
$('loanType').addEventListener('change',()=>{$('loanDueDateLabel').textContent='First installment date'});
$('loanCancelEdit').onclick=resetLoanForm;
$('loanForm').onsubmit=event=>{
 event.preventDefault();const type=$('loanType').value==='taken'?'taken':'given',party=$('loanParty').value.trim(),amount=Number($('loanAmount').value),method=$('loanMethod').value==='Bank'?'Bank':'Cash',date=$('loanDate').value,firstDueDate=$('loanDueDate').value,installmentCount=Math.max(1,Math.min(120,Math.floor(Number($('loanInstallmentCount').value)||1))),installmentFrequency=$('loanInstallmentFrequency').value,note=$('loanNote').value.trim();
 if(!party||!date||!Number.isFinite(amount)||amount<=0){alert('Enter a person or bank name, loan date and a valid amount.');return}
 if(installmentCount>1&&!firstDueDate){alert('Choose the first installment date when you add more than one installment.');return}
 if(firstDueDate&&firstDueDate<date){alert('The first installment date cannot be earlier than the loan date.');return}
 const installments=buildLoanInstallmentSchedule(amount,installmentCount,firstDueDate,installmentFrequency);
 if(editingLoanId){
  const loan=db.loans.find(item=>item.id===editingLoanId);if(!loan)return;
  if(amount<loanSettledAmount(loan)){alert('Loan amount cannot be less than the amount already collected or repaid.');return}
  if(loanSettledAmount(loan)>0.000001&&((loan.installments?.[0]?.dueDate||'')!==firstDueDate||(loan.installments?.length||1)!==installmentCount||(loan.installmentFrequency||'monthly')!==installmentFrequency)){alert('This loan already has a payment or collection. Its installment dates and count cannot be changed.');return}
  if(loanSettledAmount(loan)>0.000001)installments.forEach((item,index)=>{if(loan.installments?.[index]?.id)item.id=loan.installments[index].id});
  Object.assign(loan,{type,party,amount,method,date,dueDate:installments.at(-1)?.dueDate||'',installmentCount,installmentFrequency,installments:installments.length?installments:(loan.installments||[]),note});
 }else db.loans.unshift({id:crypto.randomUUID(),type,party,amount,method,date,dueDate:installments.at(-1)?.dueDate||'',installmentCount,installmentFrequency,installments,note,settlements:[]});
 resetLoanForm();save();
};
function revealPurchaseBillActions(card,focusFirst=false){
 if(!card)return;
 document.querySelectorAll('[data-purchase-bill-card].purchase-bill-actions-visible').forEach(openCard=>{if(openCard!==card)hidePurchaseBillActions(openCard)});
 const actions=card.querySelector('[data-bill-actions]'),row=card.querySelector('[data-bill-summary]'),toggle=card.querySelector('[data-bill-actions-toggle]');
 if(!actions||!row)return;
 actions.hidden=false;card.classList.add('purchase-bill-actions-visible');row.setAttribute('aria-expanded','true');toggle?.setAttribute('aria-expanded','true');
 if(focusFirst)actions.querySelector('button')?.focus({preventScroll:true});
}
function hidePurchaseBillActions(card){
 if(!card)return;
 const actions=card.querySelector('[data-bill-actions]'),row=card.querySelector('[data-bill-summary]'),detail=card.querySelector('[data-bill-detail]'),toggle=card.querySelector('[data-bill-actions-toggle]');
 if(actions)actions.hidden=true;if(detail)detail.hidden=true;
 card.classList.remove('purchase-bill-actions-visible');row?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-expanded','false');
 const view=card.querySelector('[data-bill-detail-toggle]');if(view)view.textContent='View details';
}
const purchaseBillListElement=$('purchaseBillList');
purchaseBillListElement?.addEventListener('click',event=>{
 const toggle=event.target.closest('[data-bill-actions-toggle]'),row=event.target.closest('[data-bill-summary]');
 if(!toggle&&!row)return;
 if(event.target.closest('[data-bill-actions]'))return;
 const card=(toggle||row).closest('[data-purchase-bill-card]');if(!card)return;
 event.preventDefault();
 const actions=card.querySelector('[data-bill-actions]');
 if(actions?.hidden)revealPurchaseBillActions(card);else hidePurchaseBillActions(card);
});
purchaseBillListElement?.addEventListener('contextmenu',event=>{
 const card=event.target.closest('[data-purchase-bill-card]');if(!card)return;
 event.preventDefault();revealPurchaseBillActions(card);
});
purchaseBillListElement?.addEventListener('keydown',event=>{
 const row=event.target.closest('[data-bill-summary]');if(!row||event.target.closest('button'))return;
 if(['Enter',' ','ContextMenu'].includes(event.key)||(event.shiftKey&&event.key==='F10')){
  event.preventDefault();const card=row.closest('[data-purchase-bill-card]');
  const actions=card?.querySelector('[data-bill-actions]');
  if(actions?.hidden)revealPurchaseBillActions(card,true);else hidePurchaseBillActions(card);
 }
});
document.addEventListener('click',event=>{
 const current=event.target.closest('[data-purchase-bill-card]');
 document.querySelectorAll('[data-purchase-bill-card].purchase-bill-actions-visible').forEach(card=>{if(card!==current)hidePurchaseBillActions(card)});
});
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
 if(db.settings.allowPurchaseBillEdits===false){setTab('settings');const hint=$('purchaseEditHint');if(hint){hint.textContent='Enable “Allow editing saved purchase bills” in Settings before editing this bill.';hint.hidden=false}return}
 const b=db.purchaseBills.find(x=>x.id===id);if(!b)return;
 setTab('purchaseBills');
 editingPurchaseBillId=id;purchaseBillOriginalDate=String(b.date||'');ensureOption($('purchaseSupplier'),b.supplier);$('purchaseSupplier').value=b.supplier;
 fillChoices();
 $('purchaseBillNo').value=b.billNo||'';$('purchaseAmountMode').value='rate';$('purchaseDate').value=b.date||today();$('purchaseCashPaid').value=Number(b.cashPaid||0);$('purchaseBankPaid').value=Number(b.bankPaid||0);$('purchaseTransitCost').value=Number(b.transitCost||0);$('purchaseTransitPaidFrom').value=b.transitPaidFrom==='Bank'?'Bank':'Cash';$('purchaseDiscount').value=Number(b.discount||0);$('purchaseNote').value=b.note||'';
 purchaseLines=(b.lines||[]).map(l=>({lineId:l.id||null,product:l.product||'',category:l.category||b.category||'Staples',productType:l.productType||'Other',spec:l.spec||'',quantity:Number(l.quantity||0),unit:l.unit||'pcs',rate:Number(l.rate||0),amount:Number(l.amount??(Number(l.quantity||0)*Number(l.rate||0))),amountMode:'rate',calcError:'',amountPending:false,costType:l.costType||'unassigned',costMember:l.costMember||'',costMembers:assignedMembers(l)}));
 purchaseLines.forEach(l=>{if(!db.units.includes(l.unit))db.units.push(l.unit)});if($('purchaseEditHint')){$('purchaseEditHint').hidden=false;const hasUsedLines=db.consumptions.some(c=>c.billId===id);$('purchaseEditHint').textContent=hasUsedLines?'You are updating a bill already linked to inventory use, production or sales. Keep the used line in place; quantity changes proportionally update linked stock movements, unit/price corrections recalculate downstream production costs, supplier balances and reports.':'You are updating a saved bill. Inventory, supplier balances, production costs and all reports recalculate when you save.';}renderPurchaseLines();$('purchaseBillSubmit').textContent='Update recent bill';$('cancelPurchaseEdit').hidden=false;$('purchaseBillForm').scrollIntoView({behavior:'smooth',block:'start'});
}
$('cancelPurchaseEdit').onclick=resetPurchaseForm;
function deletePurchaseBill(id){const b=db.purchaseBills.find(x=>x.id===id);if(!b)return;if(db.supplierPayments.some(p=>p.supplier===b.supplier)){alert('This supplier has payment history. Keep the bill to preserve the supplier ledger.');return}if(db.consumptions.some(c=>c.billId===id)){alert('This bill has stock usage records. It cannot be deleted because that would break the inventory history.');return}if(confirm('Delete this purchase bill?')){db.purchaseBills=db.purchaseBills.filter(x=>x.id!==id);save()}}

function resetExpenseForm(){
 editingExpenseId=null;$('expenseForm').reset();$('expenseDate').value=today();$('expenseDueDate').value='';$('expenseDueDate').disabled=true;$('quantity').value=1;
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
 $('dueDirection').value=x.dueDirection||'i_owe';$('duePerson').value=x.duePerson||'';$('expenseDueDate').value=x.dueDate||'';$('duePaidFrom').value=x.duePaidFrom||'Cash';
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
 const values={amount:quantity*rate,name,quantity,unit,rate,paymentType,costType:costMembers.length?'members':'unassigned',costMember:costMembers.length===1?costMembers[0]:'',costMembers,dueDirection:paymentType==='Due'?$('dueDirection').value:null,duePerson:paymentType==='Due'?$('duePerson').value.trim():null,dueDate:paymentType==='Due'?$('expenseDueDate').value||null:null,duePaidFrom:paymentType==='Due'&&$('dueDirection').value==='owed_to_me'?$('duePaidFrom').value:null,category:$('category').value,date:$('expenseDate').value,note:$('note').value.trim()};
 if(editingExpenseId){const existing=db.expenses.find(x=>x.id===editingExpenseId);if(existing){const settled=expenseSettledAmount(existing);if(settled>0&&(paymentType!=='Due'||quantity*rate<settled||$('dueDirection').value!==existing.dueDirection)){alert('This due already has payments or collections. Keep the Due type and direction, and set the amount to at least the amount already settled.');return}Object.assign(existing,values)}}
 else db.expenses.unshift({id:crypto.randomUUID(),...values});
 resetExpenseForm();save()};
function quickSelectedMembers(){return [...($('quickActionMembers')?.querySelectorAll('input[type=checkbox]:checked')||[])].map(input=>input.value)}
function renderQuickMemberOptions(selectedNames=[]){
 const list=$('quickActionMembers');if(!list)return;
 const selected=new Set(uniquePeople(selectedNames).map(n=>n.toLocaleLowerCase()));
 const names=assignablePeople();
 list.innerHTML=names.map(name=>`<label class="member-check"><input type="checkbox" value="${esc(name)}" ${selected.has(name.toLocaleLowerCase())?'checked':''}><span>${esc(name)}${db.guestPeople.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())?' · Guest':''}</span></label>`).join('')||'<span class="muted">Add family members in Profile or guest names below.</span>';
}
function fillQuickActionOptions(selectedType='',selectedPerson=''){
 const type=$('quickActionIncomeType'),person=$('quickActionIncomeBy');
 if(type){type.innerHTML=db.incomeHeads.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');if(db.incomeHeads.includes(selectedType))type.value=selectedType}
 if(person){person.innerHTML=db.incomePeople.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');if(db.incomePeople.includes(selectedPerson))person.value=selectedPerson;else if(db.incomePeople.includes(db.profile.name))person.value=db.profile.name}
}
function updateQuickActionTypeFields(){const isIncome=$('quickActionType').value==='income';$('quickExpenseConfig').hidden=isIncome;$('quickIncomeConfig').hidden=!isIncome;}
function resetQuickActionForm(){
 editingQuickActionId=null;$('quickActionForm').reset();$('quickActionId').value='';$('quickActionType').value='expense';$('quickActionPayment').value='Cash';$('quickActionFormTitle').textContent='Create quick button';$('quickActionSave').textContent='＋ Create button';$('quickActionCancel').hidden=true;updateQuickActionTypeFields();fillQuickActionOptions();renderQuickMemberOptions([]);
}
function editQuickAction(id){
 const action=db.quickActions.find(x=>x.id===id);if(!action)return;
 setTab('settings');const setup=$('quickActionSettings');if(setup)setup.open=true;
 editingQuickActionId=id;$('quickActionId').value=id;$('quickActionName').value=action.name||'';$('quickActionType').value=action.type||'expense';$('quickActionRate').value=Number(action.rate||0);$('quickActionPayment').value=action.paymentType||'Cash';$('quickActionCategory').value=action.category||'Other';
 fillQuickActionOptions(action.incomeType||'',action.incomeBy||'');renderQuickMemberOptions(action.costMembers||[]);updateQuickActionTypeFields();$('quickActionFormTitle').textContent='Edit quick button';$('quickActionSave').textContent='Save changes';$('quickActionCancel').hidden=false;$('quickActionForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function quickActionTransactions(action){
 const id=String(action?.id||'');if(!id)return [];
 return [
  ...db.expenses.filter(item=>String(item.quickActionId||'')===id).map(item=>({item,list:db.expenses,kind:'expense'})),
  ...db.incomes.filter(item=>String(item.quickActionId||'')===id).map(item=>({item,list:db.incomes,kind:'income'}))
 ];
}
function quickActionStats(action){
 const rows=quickActionTransactions(action),day=today(),todayRows=rows.filter(row=>String(row.item.date||'')===day);
 const units=row=>Math.max(0,Math.floor(Number(row.item.quantity)||1));
 const amount=row=>Number(row.item.amount)||0;
 return {
  totalCount:rows.reduce((total,row)=>total+units(row),0),
  dayCount:todayRows.reduce((total,row)=>total+units(row),0),
  totalCost:rows.reduce((total,row)=>total+amount(row),0),
  dayCost:todayRows.reduce((total,row)=>total+amount(row),0)
 };
}
function updateQuickActionModeButton(){
 const subtract=quickActionMode==='minus';
 ['quickActionModeToggle','overviewQuickActionModeToggle'].forEach(id=>{
  const button=$(id);if(!button)return;
  button.textContent=subtract?'− Minus':'＋ Add';
  button.classList.toggle('minus-mode',subtract);button.classList.toggle('add-mode',!subtract);
  button.setAttribute('aria-pressed',String(subtract));
  button.setAttribute('aria-label',`Current quick button mode: ${subtract?'Minus':'Add'}. Click to switch mode.`);
 });
}
function updateOverviewQuickTapButton(){
 const button=$('overviewQuickActionTapToggle');if(!button)return;
 const enabled=db.settings?.overviewQuickActionsEnabled!==false;
 button.textContent=enabled?'ON':'OFF';
 button.classList.toggle('is-on',enabled);
 button.classList.toggle('is-off',!enabled);
 button.setAttribute('aria-pressed',String(enabled));
 button.setAttribute('aria-label',`Overview Quick Expenses tap is ${enabled?'ON':'OFF'}. Click to switch.`);
}
function vibrateQuickButton(){
 if(db.settings?.quickButtonVibration===false||typeof navigator==='undefined')return false;
 // The Vibration API is supported by many Android browsers, but not iOS Safari.
 if(typeof navigator.vibrate!=='function')return false;
 try{
  navigator.vibrate(0);
  return navigator.vibrate([45,30,45])!==false;
 }catch(error){return false}
}
function bindQuickButtonHaptics(container){
 if(!container||container.dataset.hapticsBound==='true')return;
 container.dataset.hapticsBound='true';
 container.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse')return;
  const tile=event.target.closest('[data-quick-activate],[data-quick-supplier],[data-quest-advance]');
  if(!tile||tile.disabled)return;
  if(container.id==='overviewQuickActionList'&&db.settings?.overviewQuickActionsEnabled===false)return;
  if(container.id==='overviewQuickSupplierList'&&db.settings?.overviewQuickSuppliersEnabled===false)return;
  vibrateQuickButton();
 },{passive:true});
}
function renderQuickActions(){
 const list=$('quickActionList'),overview=$('overviewQuickActionList');
 if($('quickActionCount'))$('quickActionCount').textContent=`${db.quickActions.length} button${db.quickActions.length===1?'':'s'}`;
 updateQuickActionModeButton();
 updateOverviewQuickTapButton();
 const makeHtml=(isOverview=false)=>db.quickActions.length?db.quickActions.map(action=>{
  const stats=quickActionStats(action),tapDisabled=isOverview&&db.settings?.overviewQuickActionsEnabled===false;
  const disabled=(quickActionMode==='minus'&&stats.dayCount<1)||tapDisabled;
  const kind=action.type==='income'?'Income':'Expense';
  const aria=`${action.name}, ${kind}. Total count ${numberText(stats.totalCount)}, today count ${numberText(stats.dayCount)}, total cost ${numberText(stats.totalCost)}, today's cost ${numberText(stats.dayCost)}. ${tapDisabled?'Overview quick tap is OFF':quickActionMode==='minus'?'Click to subtract one of today’s entries':'Click to add one'}.`;
  return `<button type="button" class="quick-action-card ${quickActionMode==='minus'?'quick-action-minus':''}" data-quick-activate="${esc(action.id)}" aria-label="${esc(aria)}" ${disabled?'disabled':''}>
   <span class="quick-action-button-title">${esc(action.name)}</span>
   <span class="quick-action-button-stats">
    <span>T: <strong>${numberText(stats.totalCount)}</strong></span>
    <span>Day: <strong>${numberText(stats.dayCount)}</strong></span>
    <span>TC: <strong>${numberText(stats.totalCost)}</strong></span>
    <span>DC: <strong>${numberText(stats.dayCost)}</strong></span>
   </span>
   <span class="quick-action-button-kind">${kind}</span>
  </button>`;
 }).join(''):empty('No quick buttons yet. Open Settings → Create Quick Button to add one.');
 if(list)list.innerHTML=makeHtml(false);
 if(overview)overview.innerHTML=makeHtml(true);
}

function updateOverviewQuickSupplierTapButton(){
 const button=$('overviewQuickSupplierTapToggle');if(!button)return;
 const enabled=db.settings?.overviewQuickSuppliersEnabled!==false;
 button.textContent=enabled?'ON':'OFF';
 button.classList.toggle('is-on',enabled);
 button.classList.toggle('is-off',!enabled);
 button.setAttribute('aria-pressed',String(enabled));
 button.setAttribute('aria-label',`Overview Quick Suppliers tap is ${enabled?'ON':'OFF'}. Click to switch.`);
}
function renderQuickSuppliers(){
 const panel=$('overviewQuickSuppliersPanel'),list=$('overviewQuickSupplierList');if(!panel||!list)return;
 const names=db.suppliers.filter(name=>db.quickSuppliers.includes(name));
 const tapDisabled=db.settings?.overviewQuickSuppliersEnabled===false;
 updateOverviewQuickSupplierTapButton();
 panel.hidden=false;
 list.innerHTML=names.length?names.map(name=>{
  const bills=db.purchaseBills.filter(b=>b.supplier===name);
  const totalPurchase=bills.reduce((total,bill)=>total+billTotal(bill),0);
  const totalDue=supplierOutstanding(name);
  const paidOnBills=bills.reduce((total,bill)=>total+Number(bill.cashPaid||0)+Number(bill.bankPaid||0),0);
  const laterPayments=db.supplierPayments.filter(payment=>payment.supplier===name).reduce((total,payment)=>total+Number(payment.amount||0),0);
  const paid=paidOnBills+laterPayments;
  const aria=`${name}. Total purchase ${money(totalPurchase)}, total due ${money(totalDue)}, paid ${money(paid)}. ${tapDisabled?'Overview Quick Suppliers is OFF':'Open a new purchase form for this supplier.'}`;
  return `<button type="button" class="quick-action-card quick-supplier-card" data-quick-supplier="${esc(name)}" aria-label="${esc(aria)}" ${tapDisabled?'disabled':''}>
   <span class="quick-action-button-title">${esc(name)}</span>
   <span class="quick-action-button-stats">
    <span>TP: <strong>${money(totalPurchase)}</strong></span>
    <span>TD: <strong>${money(totalDue)}</strong></span>
    <span>P: <strong>${money(paid)}</strong></span>
   </span>
  </button>`;
 }).join(''):empty('No Quick Suppliers yet. Click the Quick Suppliers title to add supplier details, then enable Q in Settings → Custom Lists → Suppliers.');
 list.querySelectorAll('[data-quick-supplier]').forEach(button=>button.onclick=()=>{if(db.settings?.overviewQuickSuppliersEnabled===false)return;openQuickSupplierPurchase(button.dataset.quickSupplier)});
}
function openQuickSupplierPurchase(name){
 const supplier=String(name||'').trim();if(!supplier||!db.suppliers.includes(supplier))return;
 if(editingPurchaseBillId&&!confirm('Discard the current purchase bill edit and start a new bill?'))return;
 setTab('purchaseBills');
 resetPurchaseForm();
 $('purchaseSupplier').value=supplier;
 $('purchaseBillForm').scrollIntoView({behavior:'smooth',block:'start'});
 $('purchaseSupplier').focus({preventScroll:true});
}

function resetSupplierEntryForm(){
 $('supplierEntryForm').reset();$('supplierEntryOriginalName').value='';$('supplierEntryQuick').checked=false;
 $('supplierEntryFormTitle').textContent='Add supplier';$('supplierEntrySave').textContent='Save supplier';
 $('supplierEntryCancel').hidden=true;
}
function renderSupplierEntryList(){
 const list=$('supplierEntryList');if(!list)return;
 const names=db.suppliers.slice().sort((a,b)=>a.localeCompare(b));
 if($('supplierEntryCount'))$('supplierEntryCount').textContent=`${names.length} supplier${names.length===1?'':'s'}`;
 list.innerHTML=names.length?names.map(name=>{
  const detail=db.supplierDetails[name]||{};
  return `<article class="supplier-entry-row"><div class="supplier-entry-info"><strong>${esc(name)}</strong><span><b>Owner:</b> ${esc(detail.ownerName||'Not entered')}</span><span><b>Address:</b> ${esc(detail.address||'Not entered')}</span><span><b>Quick button:</b> ${db.quickSuppliers.includes(name)?'Q enabled':'Q disabled'}</span></div><button type="button" class="edit-btn" data-edit-supplier-entry="${esc(name)}">Edit details</button></article>`;
 }).join(''):empty('No suppliers saved yet. Add a supplier company above.');
 list.querySelectorAll('[data-edit-supplier-entry]').forEach(button=>button.onclick=()=>editSupplierEntry(button.dataset.editSupplierEntry));
}
function editSupplierEntry(name){
 const company=String(name||'').trim();if(!db.suppliers.includes(company))return;
 const detail=db.supplierDetails[company]||{};
 $('supplierEntryOriginalName').value=company;$('supplierEntryCompany').value=company;
 $('supplierEntryOwner').value=detail.ownerName||'';$('supplierEntryAddress').value=detail.address||'';$('supplierEntryQuick').checked=db.quickSuppliers.includes(company);
 $('supplierEntryFormTitle').textContent='Edit supplier details';$('supplierEntrySave').textContent='Update supplier';
 $('supplierEntryCancel').hidden=false;$('supplierEntryForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function saveSupplierEntry(){
 const original=$('supplierEntryOriginalName').value.trim(),company=$('supplierEntryCompany').value.trim();
 const ownerName=$('supplierEntryOwner').value.trim(),address=$('supplierEntryAddress').value.trim(),showQuick=$('supplierEntryQuick').checked;
 if(!company){alert('Enter the supplier company name.');$('supplierEntryCompany').focus();return}
 if(db.suppliers.some(name=>name.toLocaleLowerCase()===company.toLocaleLowerCase()&&name!==original)){
  alert('That supplier company already exists. Open it from the Supplier Directory to edit its details.');return;
 }
 if(original&&original!==company){
  const index=db.suppliers.indexOf(original);if(index<0)return;
  db.suppliers[index]=company;
  db.purchaseBills.forEach(bill=>{if(bill.supplier===original)bill.supplier=company});
  db.supplierPayments.forEach(payment=>{if(payment.supplier===original)payment.supplier=company});
  db.quickSuppliers=db.quickSuppliers.map(name=>name===original?company:name);
  const oldDetail=db.supplierDetails[original]||{};delete db.supplierDetails[original];
  db.supplierDetails[company]={...oldDetail,ownerName,address};
 }else{
  if(!db.suppliers.includes(company))db.suppliers.push(company);
  db.supplierDetails[company]={...(db.supplierDetails[company]||{}),ownerName,address};
 }
 if(showQuick){if(!db.quickSuppliers.includes(company))db.quickSuppliers.push(company)}else db.quickSuppliers=db.quickSuppliers.filter(name=>name!==company);resetSupplierEntryForm();fillChoices();renderMasterLists();renderSupplierEntryList();renderQuickSuppliers();renderSupplierAccounts();save();
}

function mealCountForDate(date){return Math.max(0,Math.floor(Number(db.mealPlan.dateCounts[date]??db.mealPlan.defaultCount)||0))}
function mealCountForMember(member,date){return Math.max(0,Math.floor(Number(db.mealPlan.memberCounts?.[date]?.[member]??mealCountForDate(date))||0))}
function mealMemberEnabled(member,date){return db.mealPlan.memberStatus?.[date]?.[member]!==false}
function mealProductCostForRange(from,to){
 let cost=0;
 db.purchaseBills.filter(b=>b.date>=from&&b.date<=to).forEach(b=>(b.lines||[]).forEach(line=>{
  const item=productDictionaryMatch(line.product);
  if(item?.meal)cost+=Number(line.amount??(Number(line.quantity||0)*Number(line.rate||0)))||0;
 }));
 return cost;
}
function mealGuestAssignedTo(guest,member){
 return (db.mealPlan.guestAssignments?.[mealPersonKey(guest)]||[]).some(name=>mealPersonKey(name)===mealPersonKey(member));
}
function mealGuestCheckState(guest,member,date){
 const count=mealCountForDate(date),saved=db.mealPlan.guestChecks?.[date]?.[mealPersonKey(guest)]?.[mealPersonKey(member)];
 return Array.from({length:count},(_,index)=>Array.isArray(saved)?saved[index]!==false:saved!==false);
}
function mealGuestChecked(guest,member,date,index=0){return mealGuestCheckState(guest,member,date)[index]!==false}
function mealGuestCheckedCount(guest,member,date){return mealGuestCheckState(guest,member,date).filter(Boolean).length}
function mealMemberGuestNames(member,date){
 return db.guestPeople.filter(guest=>mealGuestAssignedTo(guest,member)&&mealPersonInDateRange(guest,date,true));
}
function renderMeals(){
 const from=$('mealFromDate')?.value||today(),to=$('mealToDate')?.value||today(),date=$('mealControlDate')?.value||today();
 if($('mealDefaultCount'))$('mealDefaultCount').value=db.mealPlan.defaultCount;
 if($('mealDateEntry')&&$('mealDateEntry').value!==date)$('mealDateEntry').value=date;
 if($('mealDateCount'))$('mealDateCount').value=db.mealPlan.dateCounts[date]??db.mealPlan.defaultCount;
 const list=$('mealMemberControls');
 if(list)list.innerHTML=db.familyMembers.length?db.familyMembers.map(member=>{
  const enabled=mealMemberEnabled(member,date),count=enabled?mealCountForMember(member,date):0;
  const savedChecks=db.mealPlan.memberChecks?.[date]?.[member]||[];
  const checks=Array.from({length:count},(_,idx)=>savedChecks[idx]!==false);
  const mealBoxes=Array.from({length:count},(_,idx)=>'<label class="meal-slot-check"><input type="checkbox" data-meal-slot="'+idx+'" data-meal-slot-member="'+esc(member)+'" '+(checks[idx]?'checked':'')+'><span>M</span></label>').join('');
  const guestNames=mealMemberGuestNames(member,date);
  const guestBoxes=guestNames.flatMap(guest=>mealGuestCheckState(guest,member,date).map((checked,index)=>'<label class="meal-slot-check meal-guest-slot"><input type="checkbox" data-meal-guest-slot="'+esc(guest)+'" data-meal-guest-host="'+esc(member)+'" data-meal-guest-meal="'+index+'" '+(checked?'checked':'')+'><span>G</span></label>')).join('');
  const ownChecked=checks.filter(Boolean).length,guestChecked=guestNames.reduce((total,guest)=>total+mealGuestCheckedCount(guest,member,date),0);
  const total=ownChecked+guestChecked;
  return '<div class="meal-member-row"><strong>'+esc(member)+'</strong><label class="meal-toggle"><input type="checkbox" data-meal-member="'+esc(member)+'" '+(enabled?'checked':'')+'> A</label><div class="meal-slot-list">'+(enabled?mealBoxes:'')+guestBoxes+'</div><strong class="meal-member-total">T '+total+'</strong></div>';
 }).join(''):empty('Add family members in Profile first.');
 const totals=db.familyMembers.map(member=>{
  let total=0;
  if(from&&to&&from<=to){
   for(let d=dateObj(from),end=dateObj(to);d<=end;d.setDate(d.getDate()+1)){
    const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    if(mealMemberEnabled(member,key)){
     const saved=db.mealPlan.memberChecks?.[key]?.[member];
     total+=Array.from({length:mealCountForMember(member,key)},(_,idx)=>!Array.isArray(saved)||saved[idx]!==false).filter(Boolean).length;
    }
    db.guestPeople.filter(guest=>mealGuestAssignedTo(guest,member)&&mealPersonInDateRange(guest,key,true)).forEach(guest=>{total+=mealGuestCheckedCount(guest,member,key)});
   }
  }
  return {member,total};
 });
 const totalMeals=totals.reduce((n,x)=>n+x.total,0),mealProductCost=from&&to&&from<=to?mealProductCostForRange(from,to):0,costPerMeal=totalMeals?mealProductCost/totalMeals:0;
 if($('mealMemberTotals'))$('mealMemberTotals').innerHTML=totals.length?totals.map(x=>'<div class="meal-total-row"><strong>'+esc(x.member)+'</strong><span class="meal-total-count">T '+numberText(x.total)+'</span><strong class="meal-member-cost">'+money(x.total*costPerMeal)+'</strong></div>').join(''):empty('No family members added.');
 if($('mealRangeTotal'))$('mealRangeTotal').textContent='Meal Cost: '+money(mealProductCost)+' · Cost per meal '+money(costPerMeal);
}

function saveMealDefault(){const n=Number($('mealDefaultCount').value);if(!Number.isInteger(n)||n<0){alert('Enter a whole number of meals, zero or more.');return}db.mealPlan.defaultCount=n;save();renderMeals()}

function renderQuickActionManager(){
 const list=$('quickActionManagerList');if(!list)return;
 list.innerHTML=db.quickActions.length?db.quickActions.map(action=>`<div class="quick-action-manager-row"><div class="quick-action-manager-info"><strong>${esc(action.name)}</strong><span>${action.type==='income'?'Income':'Expense'} · ${money(action.rate)} per click</span></div><div class="quick-action-manager-tools"><button type="button" class="edit-btn" data-quick-edit="${esc(action.id)}">Edit</button><button type="button" class="delete" data-quick-delete="${esc(action.id)}">Delete</button></div></div>`).join(''):empty('No quick buttons created yet.');
}
function saveQuickAction(){
 const name=$('quickActionName').value.trim(),type=$('quickActionType').value,rate=Number($('quickActionRate').value),paymentType=$('quickActionPayment').value;
 if(!name||!(rate>0)||!Number.isFinite(rate)){alert('Enter a button name and a fixed rate greater than zero.');return}
 let values={name,type,rate,paymentType};
 if(type==='expense'){
  values.category=$('quickActionCategory').value||'Other';values.costMembers=quickSelectedMembers();
  if(!db.expenseNames.some(x=>x.toLocaleLowerCase()===name.toLocaleLowerCase()))db.expenseNames.push(name);
 }else{
  values.incomeType=$('quickActionIncomeType').value||'Other';values.incomeBy=$('quickActionIncomeBy').value||db.incomePeople[0]||'Unassigned';
  if(!db.incomeHeads.includes(values.incomeType))db.incomeHeads.push(values.incomeType);
  if(!db.incomePeople.includes(values.incomeBy))db.incomePeople.push(values.incomeBy);
 }
 if(editingQuickActionId){const existing=db.quickActions.find(x=>x.id===editingQuickActionId);if(existing)Object.assign(existing,values)}
 else db.quickActions.unshift({id:crypto.randomUUID(),...values});
 resetQuickActionForm();if($('quickActionSettings'))$('quickActionSettings').open=false;fillChoices();save();setTab('quickExpenses');
}
function addQuickActionOne(id){
 const action=db.quickActions.find(x=>x.id===id);if(!action)return;
 const rate=Number(action.rate||0),amount=Number(rate.toFixed(2)),date=today();
 if(!(rate>0)||!Number.isFinite(amount))return;
 const createdAt=new Date().toISOString();
 if(action.type==='income'){
  const incomeBy=action.incomeBy||db.incomePeople[0]||'Unassigned';
  db.incomes.unshift({id:crypto.randomUUID(),source:action.incomeType||'Other',incomeBy,amount,quantity:1,unit:'times',rate,paymentType:action.paymentType==='Bank'?'Bank':'Cash',duePerson:null,date,note:`Quick income button · ${action.name}`,quickActionId:action.id,quickActionName:action.name,createdAt,collections:[]});
  if(!db.incomeHeads.includes(action.incomeType||'Other'))db.incomeHeads.push(action.incomeType||'Other');if(!db.incomePeople.includes(incomeBy))db.incomePeople.push(incomeBy);
 }else{
  const costMembers=uniquePeople(action.costMembers||[]);
  db.expenses.unshift({id:crypto.randomUUID(),name:action.name,amount,quantity:1,unit:'times',rate,paymentType:action.paymentType==='Bank'?'Bank':'Cash',costType:costMembers.length?'members':'unassigned',costMember:costMembers.length===1?costMembers[0]:'',costMembers,dueDirection:null,duePerson:null,duePaidFrom:null,category:action.category||'Other',date,note:`Quick expense button · ${action.name}`,quickActionId:action.id,quickActionName:action.name,createdAt});
 }
 save();
}
function subtractQuickActionOne(id){
 const action=db.quickActions.find(x=>x.id===id);if(!action)return;
 const date=today(),preferred=action.type==='income'?db.incomes:db.expenses,other=action.type==='income'?db.expenses:db.incomes;
 let list=preferred,index=list.findIndex(item=>String(item.quickActionId||'')===String(id)&&String(item.date||'')===date);
 if(index<0){list=other;index=list.findIndex(item=>String(item.quickActionId||'')===String(id)&&String(item.date||'')===date)}
 if(index<0)return;
 const item=list[index];
 if(item.paymentType==='Due'||(list===db.expenses&&expenseSettledAmount(item)>0.000001)||(list===db.incomes&&Array.isArray(item.collections)&&item.collections.length)){
  alert('This quick entry has been changed to a due or has settlement history. Please manage it from the Expenses or Income list.');return;
 }
 const quantity=Math.max(1,Math.floor(Number(item.quantity)||1)),currentAmount=Number(item.amount)||0;
 const unitAmount=Number((currentAmount/quantity).toFixed(2));
 if(quantity>1){
  item.quantity=quantity-1;item.amount=Number((currentAmount-unitAmount).toFixed(2));item.rate=Number((item.amount/item.quantity).toFixed(4));
 }else list.splice(index,1);
 save();
}
$('quickActionType').onchange=updateQuickActionTypeFields;
const toggleQuickActionMode=()=>{quickActionMode=quickActionMode==='add'?'minus':'add';renderQuickActions()};
$('overviewQuickSupplierSetupLink').onclick=()=>{setTab('supplierEntry');$('supplierEntryForm').scrollIntoView({behavior:'smooth',block:'start'})};
$('supplierEntryForm').onsubmit=e=>{e.preventDefault();saveSupplierEntry()};
// New Product dialog controls are bound when the Purchase Form Add Product action is used.
$('mealDefaultSave').onclick=saveMealDefault;
$('mealDateSave').onclick=()=>{const date=$('mealDateEntry').value,n=Number($('mealDateCount').value);if(!date||!Number.isInteger(n)||n<0){alert('Choose a date and enter a whole number of meals, zero or more.');return}db.mealPlan.dateCounts[date]=n;$('mealControlDate').value=date;save();renderMeals()};
$('mealsBackOverview').onclick=()=>{setTab('home');document.getElementById('home')?.scrollIntoView({behavior:'instant',block:'start'})};
['mealFromDate','mealToDate','mealControlDate'].forEach(id=>$(id).addEventListener('change',renderMeals));
$('mealDateEntry').addEventListener('change',()=>{const date=$('mealDateEntry').value;$('mealControlDate').value=date;renderMeals()});
$('memberReportGuestAssignments').onclick=e=>{
 const button=e.target.closest('[data-report-save-guest]');if(!button)return;
 const row=button.closest('[data-report-guest-row]');if(!row)return;
 const guest=row.dataset.reportGuestRow,key=mealPersonKey(guest),relation=row.querySelector('[data-report-guest-relation]').value.trim(),entryDate=row.querySelector('[data-report-guest-entry]').value,outDate=row.querySelector('[data-report-guest-out]').value;
 if(outDate&&!entryDate){alert('Choose the guest entry date before setting an out date.');return}
 if(entryDate&&outDate&&outDate<entryDate){alert('Guest out date cannot be earlier than the entry date.');return}
 db.guestRelations=db.guestRelations||{};if(relation)db.guestRelations[key]=relation;else delete db.guestRelations[key];
 let stay=db.guests.find(item=>item.id===row.dataset.reportGuestId);
 if(entryDate){
  if(!stay){stay={id:crypto.randomUUID(),entryDate,outDate,members:[guest],purpose:'',relation};db.guests.unshift(stay)}
  else Object.assign(stay,{entryDate,outDate,relation});
 }else if(stay){alert('Keep the guest entry date or remove this guest stay from the Guest register.');return}
 save();renderMemberReportGuestAssignments();renderGuestReport();renderMealPersonDates();renderMeals();
};
$('memberReportGuestAssignments').onchange=e=>{
 const input=e.target.closest('[data-report-meal-assign-guest]');if(!input)return;
 const guest=input.dataset.reportMealAssignGuest,member=input.dataset.reportMealAssignMember,key=mealPersonKey(guest);
 db.mealPlan.guestAssignments=db.mealPlan.guestAssignments||{};
 const current=db.mealPlan.guestAssignments[key]||[];
 db.mealPlan.guestAssignments[key]=input.checked?uniquePeople([...current,member]):current.filter(name=>mealPersonKey(name)!==mealPersonKey(member));
 if(!db.mealPlan.guestAssignments[key].length)delete db.mealPlan.guestAssignments[key];
 save();renderMeals();
};
$('mealPersonDateSettings').onchange=e=>{
 const assign=e.target.closest('[data-meal-assign-guest]');
 if(assign){
  const guest=assign.dataset.mealAssignGuest,member=assign.dataset.mealAssignMember,key=mealPersonKey(guest);
  db.mealPlan.guestAssignments=db.mealPlan.guestAssignments||{};
  const current=db.mealPlan.guestAssignments[key]||[];
  db.mealPlan.guestAssignments[key]=assign.checked?uniquePeople([...current,member]):current.filter(name=>mealPersonKey(name)!==mealPersonKey(member));
  if(!db.mealPlan.guestAssignments[key].length)delete db.mealPlan.guestAssignments[key];
  save();renderMealPersonDates();renderMeals();return;
 }
 const input=e.target.closest('[data-meal-person-start],[data-meal-person-close]');if(!input)return;
 const row=input.closest('[data-meal-person-row]');if(!row)return;
 const name=row.dataset.mealPersonRow,key=mealPersonKey(name),startDate=row.querySelector('[data-meal-person-start]').value,closeDate=row.querySelector('[data-meal-person-close]').value;
 if(startDate&&closeDate&&closeDate<startDate){alert('Meal Close Date cannot be earlier than Meal Start Date.');renderMealPersonDates();return}
 db.mealPlan.personDates=db.mealPlan.personDates||{};
 if(!startDate&&!closeDate)delete db.mealPlan.personDates[key];
 else db.mealPlan.personDates[key]={startDate,closeDate,configured:true};
 save();renderMealPersonDates();renderMeals();
};
$('mealMemberControls').onchange=e=>{
 const toggle=e.target.closest('[data-meal-member]'),guestSlot=e.target.closest('[data-meal-guest-slot]'),slot=e.target.closest('[data-meal-slot]'),countInput=e.target.closest('[data-meal-count]'),date=$('mealControlDate').value;
 if(toggle){const member=toggle.dataset.mealMember;db.mealPlan.memberStatus[date]=db.mealPlan.memberStatus[date]||{};db.mealPlan.memberStatus[date][member]=toggle.checked;if(toggle.checked){db.mealPlan.memberChecks[date]=db.mealPlan.memberChecks[date]||{};db.mealPlan.memberChecks[date][member]=Array(mealCountForMember(member,date)).fill(true)}save();renderMeals();return}
 if(guestSlot){const guest=mealPersonKey(guestSlot.dataset.mealGuestSlot),host=mealPersonKey(guestSlot.dataset.mealGuestHost),index=Number(guestSlot.dataset.mealGuestMeal),count=mealCountForDate(date);db.mealPlan.guestChecks[date]=db.mealPlan.guestChecks[date]||{};db.mealPlan.guestChecks[date][guest]=db.mealPlan.guestChecks[date][guest]||{};const existing=db.mealPlan.guestChecks[date][guest][host],state=Array.from({length:count},(_,idx)=>Array.isArray(existing)?existing[idx]!==false:existing!==false);if(index>=0&&index<count)state[index]=guestSlot.checked;db.mealPlan.guestChecks[date][guest][host]=state;save();renderMeals();return}
 if(slot){const member=slot.dataset.mealSlotMember,index=Number(slot.dataset.mealSlot);db.mealPlan.memberChecks[date]=db.mealPlan.memberChecks[date]||{};const count=mealCountForMember(member,date),saved=db.mealPlan.memberChecks[date][member]||[];db.mealPlan.memberChecks[date][member]=Array.from({length:count},(_,idx)=>saved[idx]!==false);db.mealPlan.memberChecks[date][member][index]=slot.checked;save();renderMeals();return}
 if(countInput){const member=countInput.dataset.mealCount,n=Number(countInput.value);if(!Number.isInteger(n)||n<0){alert('Enter a whole number of meals, zero or more.');renderMeals();return}db.mealPlan.memberCounts[date]=db.mealPlan.memberCounts[date]||{};db.mealPlan.memberCounts[date][member]=n;save();renderMeals()}
};
$('supplierEntryCancel').onclick=resetSupplierEntryForm;
const openQuickExpenseSetup=()=>{
 setTab('settings');
 const setup=$('quickActionSettings');
 if(setup)setup.open=true;
 $('quickActionForm')?.scrollIntoView({behavior:'smooth',block:'start'});
};
$('overviewQuickSetupLink').onclick=openQuickExpenseSetup;
$('quickExpensesTitleSetupLink').onclick=openQuickExpenseSetup;
$('quickExpensesBackOverview').onclick=()=>{setTab('home');$('home')?.scrollIntoView({behavior:'instant',block:'start'});};
$('quickActionModeToggle').onclick=toggleQuickActionMode;
$('overviewQuickActionModeToggle').onclick=toggleQuickActionMode;
$('overviewQuickActionTapToggle').onclick=()=>{
 db.settings=db.settings||{};
 db.settings.overviewQuickActionsEnabled=db.settings.overviewQuickActionsEnabled===false;
 save();
};
$('overviewQuickSupplierTapToggle').onclick=()=>{
 db.settings=db.settings||{};
 db.settings.overviewQuickSuppliersEnabled=db.settings.overviewQuickSuppliersEnabled===false;
 save();
};
$('overviewSortingEnabled').onchange=()=>{
 db.settings=db.settings||{};
 db.settings.overviewSortingEnabled=$('overviewSortingEnabled').checked;
 save();
};

$('quickActionForm').onsubmit=e=>{e.preventDefault();saveQuickAction()};
$('quickActionCancel').onclick=()=>{resetQuickActionForm();if($('quickActionSettings'))$('quickActionSettings').open=false};
const handleQuickActionTileClick=e=>{
 const tile=e.target.closest('[data-quick-activate]');if(!tile||tile.disabled)return;
 if(tile.closest('#overviewQuickActionList')&&db.settings?.overviewQuickActionsEnabled===false)return;
 const id=tile.dataset.quickActivate;if(quickActionMode==='minus')subtractQuickActionOne(id);else addQuickActionOne(id);
};
$('quickActionList').onclick=handleQuickActionTileClick;
$('overviewQuickActionList').onclick=handleQuickActionTileClick;
bindQuickButtonHaptics($('quickActionList'));bindQuickButtonHaptics($('overviewQuickActionList'));bindQuickButtonHaptics($('overviewQuickSupplierList'));bindQuickButtonHaptics($('questList'));
$('quickActionManagerList').onclick=e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.dataset.quickEdit){editQuickAction(button.dataset.quickEdit);return}
 if(button.dataset.quickDelete){const id=button.dataset.quickDelete,action=db.quickActions.find(x=>x.id===id);if(!action)return;if(confirm(`Delete the quick button “${action.name}”? Existing recorded transactions will remain in Expenses and Income.`)){db.quickActions=db.quickActions.filter(x=>x.id!==id);if(editingQuickActionId===id)resetQuickActionForm();save()}}
};
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
 editingSalesMemoId=null;salesMemoLines=[defaultSalesMemoLine()];$('salesMemoForm').reset();$('salesMemoDate').value=today();$('salesMemoDueDate').value='';$('salesMemoDueDateField').hidden=true;$('salesMemoDueDate').disabled=true;$('salesMemoNo').value=nextSalesMemoNo(today());
 const preferred=db.profile.name&&db.incomePeople.includes(db.profile.name)?db.profile.name:(db.incomePeople[0]||'');$('salesMemoBy').value=preferred;
 $('salesMemoFormTitle').textContent='Create sales memo';$('salesMemoSubmit').textContent='Save sales memo';$('cancelSalesMemoEdit').hidden=true;$('salesMemoEditHint').hidden=true;
 renderSalesMemoLines();
}
function openSalesMemoForm(){resetSalesMemoForm();$('salesMemoWrap').hidden=false;$('salesMemoForm').scrollIntoView({behavior:'smooth',block:'start'});}
$('toggleSalesMemoForm').onclick=()=>{if($('salesMemoWrap').hidden)openSalesMemoForm();else{$('salesMemoWrap').hidden=true;resetSalesMemoForm()}};
$('salesMemoPayment').addEventListener('change',()=>{$('salesMemoDueDateField').hidden=$('salesMemoPayment').value!=='Due';$('salesMemoDueDate').disabled=$('salesMemoPayment').value!=='Due'});
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
 $('salesMemoPayment').value=x.paymentType||'Cash';$('salesMemoDueDate').value=x.dueDate||'';$('salesMemoDueDateField').hidden=$('salesMemoPayment').value!=='Due';$('salesMemoDueDate').disabled=$('salesMemoPayment').value!=='Due';$('salesMemoNote').value=x.note||'';
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
 const values={source:'Sales',incomeBy,amount,paymentType,duePerson:paymentType==='Due'?customerName:null,dueDate:paymentType==='Due'?$('salesMemoDueDate').value||null:null,date,note:$('salesMemoNote').value.trim(),salesMemo:{memoNo,customerName,customerPhone:$('salesMemoPhone').value.trim(),customerAddress:$('salesMemoAddress').value.trim(),items}};
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
 editingIncomeId=null;$('incomeForm').reset();$('incomeDate').value=today();$('incomeDueDate').value='';$('incomeDueDate').disabled=true;if($('incomeSource').options.length)$('incomeSource').selectedIndex=0;
 const preferred=db.profile.name&&db.incomePeople.includes(db.profile.name)?db.profile.name:(db.incomePeople[0]||'Unassigned');$('incomeBy').value=preferred;
 $('incomeDueFields').hidden=true;$('incomeDuePerson').required=false;
 $('incomeFormTitle').textContent='Add income';$('incomeSubmitBtn').textContent='Save income';$('cancelIncomeEdit').hidden=true;$('incomeEditHint').hidden=true;$('incomeTotalPreview').textContent=money(0);
}
function editIncome(id){
 const x=db.incomes.find(item=>item.id===id);if(!x)return;if(x.salesMemo){editSalesMemo(id);return;}
 editingIncomeId=id;ensureOption($('incomeSource'),x.source||'Other');$('incomeSource').value=x.source||'Other';
 const earner=x.incomeBy||'Unassigned';ensureOption($('incomeBy'),earner);$('incomeBy').value=earner;
 $('incomeAmount').value=Number(x.amount||0);$('incomePaymentType').value=x.paymentType||'Cash';
 $('incomeDuePerson').value=x.duePerson||'';$('incomeDueDate').value=x.dueDate||'';$('incomeDueFields').hidden=$('incomePaymentType').value!=='Due';$('incomeDuePerson').required=$('incomePaymentType').value==='Due';$('incomeDueDate').disabled=$('incomePaymentType').value!=='Due';
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
 const values={source,incomeBy,amount,paymentType,duePerson:paymentType==='Due'?duePerson:null,dueDate:paymentType==='Due'?$('incomeDueDate').value||null:null,date:$('incomeDate').value,note:$('incomeNote').value.trim()};
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
$('costGroupBy').onchange=renderReport;

const REPORT_TITLES={purchase:'Purchase Reports',assets:'Assets',members:'Members Report',production:'Production Report',creditors:'Creditors',debitors:'Debtors',cost:'Cost Report',income:'Income Report'};
let reportPresentationReady=false;
function prepareReportPresentation(){
 if(reportPresentationReady)return;reportPresentationReady=true;
 document.querySelectorAll('[data-report-pane]').forEach(pane=>{
  const key=pane.dataset.reportPane,title=REPORT_TITLES[key]||'Report';
  const toolbar=document.createElement('div');toolbar.className='report-tools';toolbar.innerHTML=`<strong>${title}</strong><div><button type="button" class="secondary report-export-btn" data-report-export="${key}" data-export-format="pdf">Print / PDF</button><button type="button" class="secondary report-export-btn" data-report-export="${key}" data-export-format="excel">Excel</button></div>`;
  const detail=document.createElement('details');detail.className='report-detail-disclosure';
  const summary=document.createElement('summary');summary.className='report-detail-summary';summary.innerHTML=`<span>${title}</span><span class="report-summary-metrics" data-report-summary="${key}">Summary</span><span class="report-summary-arrow" aria-hidden="true">▾</span>`;
  const content=document.createElement('div');content.className='report-detail-body';
  while(pane.firstChild)content.appendChild(pane.firstChild);
  detail.append(summary,content);pane.append(toolbar,detail);
 });
 document.querySelectorAll('[data-report-export]').forEach(button=>button.addEventListener('click',()=>exportReport(button.dataset.reportExport,button.dataset.exportFormat)));
}
function reportMetricText(id){const node=$(id);return node?node.textContent.trim():''}
function reportSummaryMetrics(key){
 const from=$('productReportFromDate')?.value||'',to=$('productReportToDate')?.value||'';
 if(!from||!to||from>to)return 'Select a valid date range';
 if(key==='purchase'){const bills=db.purchaseBills.filter(b=>b.date>=from&&b.date<=to),total=bills.reduce((t,b)=>t+billTotal(b),0);return `${money(total)} · ${bills.length} bills`}
 if(key==='assets')return `${reportMetricText('assetPurchaseTotal')} · ${reportMetricText('assetPurchaseLines')} lines`;
 if(key==='members')return `${reportMetricText('familyCostTotal')} shared · ${reportMetricText('memberDirectCostTotal')} direct`;
 if(key==='production')return `${reportMetricText('productionReportCost')} · ${reportMetricText('productionReportBatchCount')} batches`;
 if(key==='creditors')return `${reportMetricText('iOweTotal')} outstanding`;
 if(key==='debitors')return `${reportMetricText('owedToMeTotal')} receivable`;
 if(key==='cost')return `${reportMetricText('reportTotal')} total cost`;
 if(key==='income')return `${reportMetricText('reportIncomeTotal')} recorded · ${reportMetricText('reportIncomeCollected')} received`;
 return '';
}
function updateReportSummaryMetrics(){
 Object.keys(REPORT_TITLES).forEach(key=>{const node=document.querySelector(`[data-report-summary="${key}"]`);if(node)node.textContent=reportSummaryMetrics(key)});
}
function reportPurchaseRows(from,to){
 const settlements=supplierBillSettlementByBill(to),out=[];
 db.purchaseBills.filter(b=>String(b.date||'')>=from&&String(b.date||'')<=to).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).forEach(bill=>{
  const total=billTotal(bill),directPaid=Math.max(0,Number(bill.cashPaid||0))+Math.max(0,Number(bill.bankPaid||0));
  const settlement=settlements.get(String(bill.id))||{paid:0,discount:0,remaining:billCredit(bill)};
  const paid=Math.min(total,directPaid+Number(settlement.paid||0)),due=Math.max(0,Number(settlement.remaining??billCredit(bill)));
  (bill.lines||[]).forEach((line,index)=>{
   const lineAmount=purchaseLineCost(bill,line),billLineAmount=purchaseBillLineBillAmount(bill,line),share=total>0?billLineAmount/total:0,transitShare=Math.max(0,lineAmount-billLineAmount),lineId=line.id||String(index),quantity=Math.max(0,Number(line.quantity||0));
   const used=usedStockQuantity({billId:bill.id,lineId},{asOfDate:to}),stock=Math.max(0,quantity-used);
   out.push([fmt(bill.date),bill.billNo||'',bill.supplier||'Unassigned Supplier',line.category||bill.category||'Uncategorised',line.productType||'Other',line.product||'Unspecified product',quantity?`${numberText(quantity)} ${line.unit||'pcs'}`:'—',money(Number(line.rate||0)),money(lineAmount),money(paid*share+transitShare),money(due*share),`${numberText(stock)} ${line.unit||'pcs'}`]);
  });
 });
 return out;
}
function reportMemberSections(from,to){
 const entries=[];
 db.expenses.filter(x=>String(x.date||'')>=from&&String(x.date||'')<=to).forEach(x=>entries.push({date:x.date,source:'Expense',product:x.name||x.note||x.category||'Expense',quantity:Number(x.quantity||0)?`${numberText(x.quantity)} ${x.unit||''}`.trim():'—',amount:Number(x.amount||0),members:assignedMembers(x)}));
 db.purchaseBills.filter(b=>String(b.date||'')>=from&&String(b.date||'')<=to).forEach(b=>(b.lines||[]).forEach(line=>entries.push({date:b.date,source:'Purchase',product:line.product||'Product',quantity:`${numberText(line.quantity||0)} ${line.unit||'pcs'}`,amount:purchaseLineCost(b,line),members:assignedMembers(line)})));
 db.productions.filter(p=>String(p.date||'')>=from&&String(p.date||'')<=to&&Number(p.overheadCost||0)>0).forEach(p=>entries.push({date:p.date,source:'Production overhead',product:p.product||'Produced product',quantity:`${numberText(p.quantity||0)} ${p.unit||'pcs'}`,amount:Number(p.overheadCost||0),members:uniquePeople(p.overheadMembers||[])}));
 const detail=[],summary=new Map();
 entries.forEach(entry=>{
  const owners=uniquePeople(entry.members),share=owners.length?entry.amount/owners.length:0;
  if(!owners.length){detail.push([fmt(entry.date),'Unassigned',entry.source,entry.product,entry.quantity,money(entry.amount),'—','—']);return}
  owners.forEach(name=>{
   detail.push([fmt(entry.date),name,entry.source,entry.product,entry.quantity,money(entry.amount),money(share),owners.join(', ')]);
   const key=name.toLocaleLowerCase(),row=summary.get(key)||{name,direct:0,shared:0,total:0};
   if(owners.length===1)row.direct+=share;else row.shared+=share;row.total+=share;summary.set(key,row);
  });
 });
 const summaryRows=[...summary.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(x=>[x.name,money(x.direct),money(x.shared),money(x.total)]);
 const guestRows=db.guests.filter(g=>guestOverlapsRange(g,from,to)).map(g=>[g.members.join(', '),fmt(g.entryDate),g.outDate?fmt(g.outDate):'Not left yet',g.purpose||'—']);
 return {summaryRows,detailRows:detail,guestRows};
}
function reportProductionRows(from,to){
 return db.productions.filter(p=>String(p.date||'')>=from&&String(p.date||'')<=to).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).map(p=>[
  fmt(p.date),p.productionNo||'',p.product||'',p.productType||'Other',p.spec||'—',`${numberText(p.quantity||0)} ${p.unit||'pcs'}`,money(p.ingredientCost),money(p.electricityCost),money(p.transitCost),money(p.totalCost),money(p.unitCost),(p.inputs||[]).map(i=>`${i.product} ${numberText(i.quantity)} ${i.unit||''} (${money(i.cost)})`).join('; ')
 ]);
}
function reportCreditorRows(from,to){
 const rows=[],settlements=supplierBillSettlementByBill(to);
 db.purchaseBills.filter(b=>String(b.date||'')<=to).forEach(b=>{
  const settlement=settlements.get(String(b.id))||{paid:0,discount:0,remaining:billCredit(b)};
  if(!(String(b.date||'')>=from&&String(b.date||'')<=to)&&Number(settlement.remaining||0)<=0.000001)return;
  rows.push([fmt(b.date),b.supplier||'Unassigned Supplier','Purchase bill',b.billNo||'',money(billTotal(b)),money(Math.max(0,Number(b.cashPaid||0))+Math.max(0,Number(b.bankPaid||0))+Number(settlement.paid||0)),money(settlement.discount||0),money(settlement.remaining||0)]);
 });
 db.expenses.filter(x=>x.paymentType==='Due'&&x.dueDirection==='i_owe'&&String(x.date||'')<=to).forEach(x=>{
  const due=expenseOutstandingAt(x,to);if(!(String(x.date||'')>=from&&String(x.date||'')<=to)&&due<=0.000001)return;
  const settled=expenseSettlements(x).filter(s=>!s.date||String(s.date)<=to).reduce((t,s)=>t+Number(s.amount||0),0);
  rows.push([fmt(x.date),x.duePerson||'Unknown creditor','Expense due',x.name||x.category||x.note||'',money(x.amount),money(settled),'—',money(due)]);
 });
 return rows;
}
function reportDebtorRows(from,to){
 const rows=[];
 db.expenses.filter(x=>x.paymentType==='Due'&&x.dueDirection==='owed_to_me'&&String(x.date||'')<=to).forEach(x=>{
  const due=expenseOutstandingAt(x,to);if(!(String(x.date||'')>=from&&String(x.date||'')<=to)&&due<=0.000001)return;
  const received=expenseSettlements(x).filter(s=>!s.date||String(s.date)<=to).reduce((t,s)=>t+Number(s.amount||0),0);
  rows.push([fmt(x.date),x.duePerson||'Unknown debtor','Receivable expense',x.name||x.category||x.note||'',money(x.amount),money(received),money(due)]);
 });
 db.incomes.filter(x=>x.paymentType==='Due'&&String(x.date||'')<=to).forEach(x=>{
  const due=incomeOutstandingAt(x,to);if(!(String(x.date||'')>=from&&String(x.date||'')<=to)&&due<=0.000001)return;
  const received=incomeCollections(x).filter(c=>!c.date||String(c.date)<=to).reduce((t,c)=>t+Number(c.amount||0),0);
  rows.push([fmt(x.date),x.duePerson||'Unknown customer','Income due',x.source||'Income',money(x.amount),money(received),money(due)]);
 });
 return rows;
}
function reportIncomeRows(from,to){
 return db.incomes.filter(x=>String(x.date||'')>=from&&String(x.date||'')<=to).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).map(x=>{
  const received=x.paymentType==='Due'?incomeCollections(x).filter(c=>!c.date||String(c.date)<=to).reduce((t,c)=>t+Number(c.amount||0),0):Number(x.amount||0);
  return [fmt(x.date),'Income entry',x.source||'Other',x.description||x.note||'—',x.incomeBy||'Unassigned',x.paymentType||'Cash',money(x.amount),money(received),money(x.paymentType==='Due'?incomeOutstandingAt(x,to):0)];
 });
}
function reportIncomeCollectionRows(from,to){
 const rows=[];
 db.incomes.forEach(x=>incomeCollections(x).filter(c=>String(c.date||'')>=from&&String(c.date||'')<=to).forEach(c=>rows.push({date:String(c.date||''),row:[fmt(c.date),'Collection',x.source||'Other',x.description||x.note||'—',x.incomeBy||'Unassigned',c.method||'Cash',money(c.amount),money(c.amount),money(incomeOutstandingAt(x,to))]})));
 return rows.sort((a,b)=>a.date.localeCompare(b.date)).map(item=>item.row);
}
function reportAssetRows(from,to){return reportPurchaseRows(from,to).filter((row)=>String(row[3]||'').toLocaleLowerCase()==='assets')}
function reportCostRows(from,to){
 return buildCostReportRows(from,to).map(row=>[fmt(row.date),row.product,row.quantity,row.rate,money(row.paidAmount),money(row.dueAmount),row.supplier,row.inventoryStock]);
}
function reportTableSections(keys,from,to){
 const sections=[];
 keys.forEach(key=>{
  if(key==='purchase')sections.push({title:REPORT_TITLES[key],headers:['Date','Bill No.','Supplier','Category','Product Type','Product Name','Quantity','Rate','Line Cost','Paid Amount','Due Amount','Inventory Stock'],rows:reportPurchaseRows(from,to)});
  else if(key==='assets')sections.push({title:REPORT_TITLES[key],headers:['Date','Bill No.','Supplier','Category','Product Type','Asset / Product','Quantity','Rate','Line Cost','Paid Amount','Due Amount','Inventory Stock'],rows:reportAssetRows(from,to)});
  else if(key==='cost')sections.push({title:REPORT_TITLES[key],headers:['Date of Cost','Product Name','Quantity','Rate','Paid Amount','Due Amount','Supplier','Inventory Stock'],rows:reportCostRows(from,to)});
  else if(key==='production')sections.push({title:REPORT_TITLES[key],headers:['Production Date','Production No.','Finished Product','Product Type','Size','Produced Quantity','Material Cost','Electricity Cost','Transit Cost','Total Cost','Unit Cost','Materials Used'],rows:reportProductionRows(from,to)});
  else if(key==='members'){
   const member=reportMemberSections(from,to);
   sections.push({title:'Members Report · Member Cost Summary',headers:['Member','Personal Cost','Shared Cost Share','Total Member Cost'],rows:member.summaryRows});
   sections.push({title:'Members Report · Individual Cost Entries',headers:['Date','Member','Source','Product / Description','Quantity','Full Entry Cost','Member Share','All Cost Owners'],rows:member.detailRows});
   sections.push({title:'Members Report · Guest Stays',headers:['Guest Members','Entry Date','Out Date','Purpose'],rows:member.guestRows});
  }
  else if(key==='creditors')sections.push({title:REPORT_TITLES[key],headers:['Date','Creditor / Supplier','Entry Type','Bill / Description','Original Amount','Paid / Settled','Discount','Outstanding Due'],rows:reportCreditorRows(from,to)});
  else if(key==='debitors')sections.push({title:REPORT_TITLES[key],headers:['Date','Debtor / Customer','Entry Type','Description','Original Amount','Received / Collected','Outstanding Receivable'],rows:reportDebtorRows(from,to)});
  else if(key==='income'){
   const headers=['Date','Entry Type','Income Type','Description','Received From / Person','Payment Method','Recorded Amount','Collected Amount','Due Amount'];
   sections.push({title:'Income Report · Income Entries',headers,rows:reportIncomeRows(from,to)});
   sections.push({title:'Income Report · Collections Received',headers,rows:reportIncomeCollectionRows(from,to)});
  }
 });
 return sections;
}
function reportDocumentHtml(keys){
 const from=$('productReportFromDate')?.value||'',to=$('productReportToDate')?.value||'';
 const sections=reportTableSections(keys,from,to),sectionHtml=sections.map(section=>{
  const headers=section.headers.map(value=>`<th>${esc(value)}</th>`).join('');
  const rows=section.rows.map(row=>`<tr>${row.map(value=>`<td>${esc(value??'—')}</td>`).join('')}</tr>`).join('');
  const emptyRow=`<tr><td colspan="${section.headers.length}">No entries in the selected date range.</td></tr>`;
  return `<section class="report-section"><h2>${esc(section.title)}</h2><table><thead><tr>${headers}</tr></thead><tbody>${rows||emptyRow}</tbody></table></section>`;
 }).join('');
 const title=keys.length===1?REPORT_TITLES[keys[0]]:'DayQuest · All Reports';
 return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:landscape;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#182337;padding:18px}h1{font-size:21px;margin:0 0 5px}.period{font-size:11px;color:#667085;margin:0 0 16px}.report-section{margin:0 0 22px;break-inside:auto}.report-section h2{font-size:14px;margin:0 0 7px;padding:0 0 5px;border-bottom:1px solid #cbd3df}table{border-collapse:collapse;width:100%;font-size:8px;table-layout:auto}th,td{border:1px solid #cbd3df;padding:5px 5px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#edf1f6;white-space:normal;font-weight:700}tbody tr:nth-child(even){background:#fafbfd}thead{display:table-header-group}tr{break-inside:avoid}@media print{body{padding:0}h1{font-size:18px}.report-section{break-before:auto}.report-section h2{break-after:avoid}}</style></head><body><h1>${esc(title)}</h1><p class="period">Reporting period: ${esc(from)} to ${esc(to)}</p>${sectionHtml||'<p>No report data available.</p>'}</body></html>`;
}
function exportReport(key,format){
 const keys=key==='all'?Object.keys(REPORT_TITLES):[key];
 if(format==='excel'){
  const html=reportDocumentHtml(keys),blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dayquest-${key}-report-${today()}.xls`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
 }
 const popup=window.open('','_blank');if(!popup){alert('Allow pop-ups for DayQuest to print or save this report as PDF.');return}
 popup.document.open();popup.document.write(reportDocumentHtml(keys));popup.document.close();popup.focus();setTimeout(()=>{try{popup.print()}catch{}},350);
}
function activateReportSection(key){
 const known=['members','production','cost','income','creditors','debitors','assets','purchase'];
 const selected=key==='all'?'all':(known.includes(key)?key:'members');prepareReportPresentation();
 document.querySelectorAll('[data-report-go]').forEach(item=>item.classList.toggle('active',item.dataset.reportGo===selected));
 document.querySelectorAll('[data-report-pane]').forEach(pane=>{
  const visible=selected==='all'||pane.dataset.reportPane===selected;pane.hidden=!visible;pane.classList.toggle('report-pane-all',selected==='all');pane.classList.toggle('report-pane-single',selected!=='all');
  const detail=pane.querySelector('.report-detail-disclosure');if(detail){detail.open=selected!=='all';}
 });
 const group=document.querySelector('[data-side-group="reports"]');if(group){group.open=true;group.classList.add('has-active')}
 updateReportSummaryMetrics();
 updatePageBalanceTitle('reports');
 const target=selected==='all'?document.querySelector('[data-report-pane="purchase"]'):document.querySelector(`[data-report-pane="${selected}"]`);
 if(target&&$('reports')?.classList.contains('active'))target.scrollIntoView({behavior:'smooth',block:'start'});
}

document.querySelectorAll('[data-report-go]').forEach(button=>button.addEventListener('click',()=>{
 setTab('reports');activateReportSection(button.dataset.reportGo);
}));
function setColorDropdown(prefix,color){
 const select=$(prefix+'Select'),input=$(prefix+'Input'),value=$(prefix+'Value'),swatch=$(prefix+'Swatch');
 const normalized=String(color||'').toLowerCase();
 const hasPreset=!!select&&Array.from(select.options).some(option=>option.value===normalized);
 if(select)select.value=hasPreset?normalized:'other';
 if(input&&/^#[0-9a-f]{6}$/i.test(normalized))input.value=normalized;
 if(value)value.textContent=normalized.toUpperCase();
 if(swatch)swatch.style.background=normalized||'#f3f5f9';
}
function openCustomColorPicker(prefix){
 const input=$(prefix+'Input');
 if(input){
  try{if(typeof input.showPicker==='function')input.showPicker();else input.click()}catch{input.click()}
 }
}
function applyThemeColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const normalized=String(color).toLowerCase();
 document.documentElement.style.setProperty('--accent-color',normalized);
 const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=normalized;
 setColorDropdown('themeColor',normalized);
 if(persist){db.settings=db.settings||{};db.settings.themeColor=normalized;localSaveOnly()}
}
function applyFontColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const value=String(color).toLowerCase();
 document.documentElement.style.setProperty('--dq-font-color',value);
 const input=$('fontColorInput'),select=$('fontColorSelect'),swatch=$('fontColorSwatch'),label=$('fontColorValue');
 if(input)input.value=value;if(swatch)swatch.style.background=value;if(label)label.textContent=value.toUpperCase();
 if(select){const preset=[...select.options].some(option=>option.value.toLowerCase()===value.toLowerCase());select.value=preset?value:'other';}
 if(persist){db.settings.fontColor=value;save();}
}

function applyQuickButtonColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const normalized=String(color).toLowerCase();
 document.documentElement.style.setProperty('--quick-button-color',normalized);
 setColorDropdown('quickButtonColor',normalized);
 if(persist){db.settings=db.settings||{};db.settings.quickButtonColor=normalized;localSaveOnly()}
}
function applyBackgroundColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const normalized=String(color).toLowerCase();
 document.documentElement.style.setProperty('--page-background',normalized);
 setColorDropdown('backgroundColor',normalized);
 if(persist){db.settings=db.settings||{};db.settings.backgroundColor=normalized;localSaveOnly()}
}
function getReadableTextColor(color,light='#ffffff',dark='#172033'){
 const hex=String(color||'').replace('#','');
 if(!/^[0-9a-f]{6}$/i.test(hex))return light;
 const r=parseInt(hex.slice(0,2),16),g=parseInt(hex.slice(2,4),16),b=parseInt(hex.slice(4,6),16);
 const luminance=(0.299*r+0.587*g+0.114*b);
 return luminance>158?dark:light;
}
function applySideMenuColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const normalized=String(color).toLowerCase();
 const root=document.documentElement;
 root.style.setProperty('--sidebar-color',normalized);
 root.style.setProperty('--sidebar-text-color',getReadableTextColor(normalized));
 root.style.setProperty('--sidebar-muted-color',getReadableTextColor(normalized,'#d2dbe8','#45546a'));
 setColorDropdown('sideMenuColor',normalized);
 if(persist){db.settings=db.settings||{};db.settings.sideMenuColor=normalized;localSaveOnly()}
}
function applyTopBarColor(color,persist=true){
 if(!/^#[0-9a-f]{6}$/i.test(String(color||'')))return;
 const normalized=String(color).toLowerCase();
 document.documentElement.style.setProperty('--topbar-color',normalized);
 document.documentElement.style.setProperty('--topbar-text-color',getReadableTextColor(normalized));
 setColorDropdown('topBarColor',normalized);
 if(persist){db.settings=db.settings||{};db.settings.topBarColor=normalized;localSaveOnly()}
}
applySideMenuColor(db.settings.sideMenuColor||'#111d30',false);
applyTopBarColor(db.settings.topBarColor||'#101827',false);
applyQuickButtonColor(db.settings.quickButtonColor||'#ee7d2f',false);
applyBackgroundColor(db.settings.backgroundColor||'#f3f5f9',false);applyFontColor(db.settings.fontColor||'#263b5c',false);applyFontColor(db.settings.fontColor||'#263b5c',false);

const SETTINGS_MASTER_CONFIG={
 supplier:{list:'settingsSupplierList',array:'suppliers',input:'newSettingSupplier',form:'addSettingSupplierForm',title:'supplier'},
 productType:{list:'settingsProductTypeList',array:'productTypes',input:'newSettingProductType',form:'addSettingProductTypeForm',title:'product type'},
 unit:{list:'settingsUnitList',array:'units',input:'newSettingUnit',form:'addSettingUnitForm',title:'unit'}
};
function renderMasterLists(){
 Object.entries(SETTINGS_MASTER_CONFIG).forEach(([kind,cfg])=>{
  const list=$(cfg.list);if(!list)return;const values=db[cfg.array]||[];
  list.innerHTML=values.map((name,index)=>{
   const quickToggle=kind==='supplier'?(`<label class="quick-supplier-toggle" title="Show this supplier on Overview"><input type="checkbox" data-master-quick-supplier="${esc(name)}" ${db.quickSuppliers.includes(name)?'checked':''}><span>Q</span></label>`):'';
   const supplierDetail=kind==='supplier'?(db.supplierDetails[name]||{}):null;
   const subline=kind==='supplier'?[supplierDetail.ownerName,supplierDetail.address].filter(Boolean).join(' · '):'Available for new entries';
   return `<div class="category-setting-row"><span><strong>${esc(name)}</strong><small>${esc(subline||'Available for new entries')}</small></span><div>${quickToggle}<button type="button" class="edit-btn" data-master-rename="${kind}" data-index="${index}">Rename</button><button type="button" class="delete" data-master-delete="${kind}" data-index="${index}" aria-label="Delete ${esc(name)}">×</button></div></div>`;
  }).join('')||empty(`No ${cfg.title}s added yet.`);
  list.querySelectorAll('[data-master-quick-supplier]').forEach(input=>input.onchange=()=>{
   const name=input.dataset.masterQuickSupplier;
   if(input.checked&&!db.quickSuppliers.includes(name))db.quickSuppliers.push(name);
   if(!input.checked)db.quickSuppliers=db.quickSuppliers.filter(value=>value!==name);
   save();
  });
  list.querySelectorAll('[data-master-rename]').forEach(button=>button.onclick=()=>renameMasterValue(kind,Number(button.dataset.index)));
  list.querySelectorAll('[data-master-delete]').forEach(button=>button.onclick=()=>deleteMasterValue(kind,Number(button.dataset.index)));
 });
}
function renameMasterValue(kind,index){
 const cfg=SETTINGS_MASTER_CONFIG[kind],arr=db[cfg.array]||[],old=arr[index];if(!old)return;
 const raw=prompt(`Rename ${cfg.title}:`,old);if(raw===null)return;const next=raw.trim();if(!next){alert('Name cannot be empty.');return}
 if(arr.some((value,i)=>i!==index&&String(value).toLocaleLowerCase()===next.toLocaleLowerCase())){alert(`That ${cfg.title} already exists.`);return}
 if(kind==='supplier'){
  db.purchaseBills.forEach(b=>{if(b.supplier===old)b.supplier=next});db.supplierPayments.forEach(p=>{if(p.supplier===old)p.supplier=next});db.quickSuppliers=db.quickSuppliers.map(value=>value===old?next:value);if(db.supplierDetails[old]){db.supplierDetails[next]=db.supplierDetails[old];delete db.supplierDetails[old]}
 }else if(kind==='product'){
  db.purchaseBills.forEach(b=>(b.lines||[]).forEach(line=>{if(line.product===old)line.product=next}));
  db.productions.forEach(p=>{if(p.product===old)p.product=next;(p.inputs||[]).forEach(input=>{if(input.product===old)input.product=next})});
  db.consumptions.forEach(c=>{if(c.product===old)c.product=next});
  db.incomes.forEach(item=>(item.salesMemo?.items||[]).forEach(line=>{if(line.product===old)line.product=next}));
 }else if(kind==='productType'){
  db.purchaseBills.forEach(b=>(b.lines||[]).forEach(line=>{if(line.productType===old)line.productType=next}));
  db.productions.forEach(p=>{if(p.productType===old)p.productType=next});
  db.incomes.forEach(item=>(item.salesMemo?.items||[]).forEach(line=>{if(line.productType===old)line.productType=next}));
 }else if(kind==='unit'){
  db.settings.unitAliases=db.settings.unitAliases||{};let canonical=old,guard=0;while(db.settings.unitAliases[canonical]&&guard++<12)canonical=db.settings.unitAliases[canonical];db.settings.unitAliases[next.toLocaleLowerCase()]=canonical;delete db.settings.unitAliases[String(old).toLocaleLowerCase()];
  db.purchaseBills.forEach(b=>(b.lines||[]).forEach(line=>{if(line.unit===old)line.unit=next}));
  db.productions.forEach(p=>{if(p.unit===old)p.unit=next;(p.inputs||[]).forEach(input=>{if(input.unit===old)input.unit=next})});
  db.consumptions.forEach(c=>{if(c.unit===old)c.unit=next});
  db.incomes.forEach(item=>(item.salesMemo?.items||[]).forEach(line=>{if(line.unit===old)line.unit=next}));
 }
 arr[index]=next;fillChoices();renderMasterLists();renderPurchaseCategorySettings();save();
}
function deleteMasterValue(kind,index){
 const cfg=SETTINGS_MASTER_CONFIG[kind],arr=db[cfg.array]||[],name=arr[index];if(!name)return;
 let used=false;
 if(kind==='supplier')used=db.purchaseBills.some(b=>b.supplier===name)||db.supplierPayments.some(p=>p.supplier===name);
 if(kind==='product')used=db.purchaseBills.some(b=>(b.lines||[]).some(line=>line.product===name))||db.productions.some(p=>p.product===name||(p.inputs||[]).some(input=>input.product===name))||db.incomes.some(item=>(item.salesMemo?.items||[]).some(line=>line.product===name));
 if(kind==='productType')used=db.purchaseBills.some(b=>(b.lines||[]).some(line=>line.productType===name))||db.productions.some(p=>p.productType===name)||db.incomes.some(item=>(item.salesMemo?.items||[]).some(line=>line.productType===name));
 if(kind==='unit')used=db.purchaseBills.some(b=>(b.lines||[]).some(line=>line.unit===name))||db.productions.some(p=>p.unit===name||(p.inputs||[]).some(input=>input.unit===name))||db.consumptions.some(c=>c.unit===name)||db.incomes.some(item=>(item.salesMemo?.items||[]).some(line=>line.unit===name));
 if(used){alert(`This ${cfg.title} is used in saved transactions or inventory. Rename it instead; deletion is blocked to preserve history.`);return}
 if(confirm(`Delete ${cfg.title} “${name}”?`)){arr.splice(index,1);if(kind==='supplier'){db.quickSuppliers=db.quickSuppliers.filter(value=>value!==name);delete db.supplierDetails[name]}if(kind==='productType'&&!arr.length)arr.push('Other');if(kind==='unit'){if(!arr.length)arr.push('pcs');if(db.settings.unitAliases)delete db.settings.unitAliases[name]}fillChoices();renderMasterLists();save()}
}
Object.entries(SETTINGS_MASTER_CONFIG).forEach(([kind,cfg])=>{
 const form=$(cfg.form);if(!form)return;form.onsubmit=e=>{e.preventDefault();const field=$(cfg.input),name=field.value.trim();if(!name)return;const arr=db[cfg.array];if(arr.some(value=>String(value).toLocaleLowerCase()===name.toLocaleLowerCase())){alert(`That ${cfg.title} already exists.`);return}arr.push(name);field.value='';fillChoices();renderMasterLists();save()};
});

function renderPurchaseCategorySettings(){
 const list=$('purchaseCategoryList');if(!list)return;
 list.innerHTML=db.purchaseCategories.map((name,index)=>`<div class="category-setting-row"><span><strong>${esc(name)}</strong><small>Used on purchase bills and reports</small></span><div><button type="button" class="edit-btn" data-rename-category="${index}">Rename</button><button type="button" class="delete" data-delete-category="${index}" aria-label="Delete ${esc(name)}">×</button></div></div>`).join('')||empty('No purchase categories. Add one above.');
 list.querySelectorAll('[data-rename-category]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.renameCategory),old=db.purchaseCategories[index];if(!old)return;
  const raw=prompt('Rename purchase category:',old);if(raw===null)return;const next=raw.trim();if(!next){alert('Category name cannot be empty.');return}
  if(db.purchaseCategories.some((name,i)=>i!==index&&name.toLowerCase()===next.toLowerCase())){alert('That purchase category already exists.');return}
  db.purchaseBills.forEach(b=>{if((b.category||'Uncategorised')===old)b.category=next;(b.lines||[]).forEach(line=>{if((line.category||b.category||'Uncategorised')===old)line.category=next})});db.purchaseCategories[index]=next;fillChoices();renderPurchaseCategorySettings();save();
 });
 list.querySelectorAll('[data-delete-category]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.deleteCategory),name=db.purchaseCategories[index];if(!name)return;if(db.purchaseCategories.length===1){alert('Keep at least one purchase category.');return}
  if(db.purchaseBills.some(b=>(b.lines||[]).some(line=>(line.category||b.category||'Uncategorised')===name)||(!b.lines?.length&&(b.category||'Uncategorised')===name))){alert('This category is used by saved purchase lines. Rename it instead, or move those lines to another category before deleting.');return}
  if(confirm(`Delete the purchase category “${name}”?`)){db.purchaseCategories.splice(index,1);fillChoices();renderPurchaseCategorySettings();save()}
 });
}
$('requireSupplierForDuePurchase').checked=db.settings.requireSupplierForDuePurchase!==false;
$('requireSupplierForDuePurchase').onchange=e=>{db.settings.requireSupplierForDuePurchase=!!e.target.checked;save()};
$('allowPurchaseBillEdits').checked=db.settings.allowPurchaseBillEdits!==false;
$('allowPurchaseBillEdits').onchange=e=>{db.settings.allowPurchaseBillEdits=!!e.target.checked;if(!db.settings.allowPurchaseBillEdits&&editingPurchaseBillId)resetPurchaseForm();save()};
$('themeColorSelect').onchange=e=>e.target.value==='other'?openCustomColorPicker('themeColor'):applyThemeColor(e.target.value);
$('themeColorInput').oninput=e=>applyThemeColor(e.target.value);
$('quickButtonColorSelect').onchange=e=>e.target.value==='other'?openCustomColorPicker('quickButtonColor'):applyQuickButtonColor(e.target.value);
$('quickButtonColorInput').oninput=e=>applyQuickButtonColor(e.target.value);
$('backgroundColorSelect').onchange=e=>e.target.value==='other'?openCustomColorPicker('backgroundColor'):applyBackgroundColor(e.target.value);
$('backgroundColorInput').oninput=e=>applyBackgroundColor(e.target.value);
$('sideMenuColorSelect').onchange=e=>e.target.value==='other'?openCustomColorPicker('sideMenuColor'):applySideMenuColor(e.target.value);
$('sideMenuColorInput').oninput=e=>applySideMenuColor(e.target.value);
$('topBarColorSelect').onchange=e=>e.target.value==='other'?openCustomColorPicker('topBarColor'):applyTopBarColor(e.target.value);
$('topBarColorInput').oninput=e=>applyTopBarColor(e.target.value);
 $('fontColorSelect').onchange=e=>e.target.value==='other'?openCustomColorPicker('fontColor'):applyFontColor(e.target.value);
 $('fontColorInput').oninput=e=>applyFontColor(e.target.value);
$('quickButtonVibration').onchange=e=>{db.settings.quickButtonVibration=!!e.target.checked;save()};

$('addProductDictionaryForm').onsubmit=e=>{e.preventDefault();const english=$('newProductDictionaryEnglish').value.trim(),bangla=$('newProductDictionaryBangla').value.trim();if(!english||!bangla)return;if(db.productDictionary.some(item=>item.english.toLocaleLowerCase()===english.toLocaleLowerCase())){alert('That English product name already exists.');return}db.productDictionary.push({english,bangla,meal:$('newProductDictionaryMeal').checked});$('newProductDictionaryEnglish').value='';$('newProductDictionaryBangla').value='';$('newProductDictionaryMeal').checked=false;renderProductDictionary();renderProductNameSuggestions();save()};
$('productDictionarySearch').oninput=renderProductDictionary;
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
 const title=familyName?`${familyName} Day Quest`:'Day Quest';
 const sideTitle=$('sidebarBrandTitle'),sideSubtitle=$('sidebarBrandSubtitle');
 if(sideTitle)sideTitle.textContent=title;
 if(sideSubtitle)sideSubtitle.textContent=familyName?'Family dashboard':'Personal dashboard';
 document.title=title;
 const authTitle=$('authTitle');if(authTitle)authTitle.textContent='Day Quest';
}
function mealPersonKey(name){return String(name||'').trim().toLocaleLowerCase()}
function guestStayRangesForPerson(name){
 const key=mealPersonKey(name);
 return db.guests.filter(g=>(g.members||[]).some(person=>mealPersonKey(person)===key));
}
function mealPersonDateValues(name,isGuest=false){
 const saved=db.mealPlan.personDates?.[mealPersonKey(name)];
 if(saved&&saved.configured)return {startDate:String(saved.startDate||''),closeDate:String(saved.closeDate||'')};
 if(!isGuest)return {startDate:'',closeDate:''};
 const stays=guestStayRangesForPerson(name);
 if(!stays.length)return {startDate:'',closeDate:''};
 const startDate=stays.map(g=>String(g.entryDate||'')).filter(Boolean).sort()[0]||'';
 const activeStay=stays.some(g=>!g.outDate);
 const closeDate=activeStay?'':(stays.map(g=>String(g.outDate||'')).filter(Boolean).sort().slice(-1)[0]||'');
 return {startDate,closeDate};
}
function mealPersonInDateRange(name,date,isGuest=false){
 const saved=db.mealPlan.personDates?.[mealPersonKey(name)];
 if(saved?.configured||saved?.startDate||saved?.closeDate){
  return (!saved.startDate||date>=saved.startDate)&&(!saved.closeDate||date<=saved.closeDate);
 }
 if(!isGuest)return true;
 return guestStayRangesForPerson(name).some(g=>date>=String(g.entryDate||'')&&(!g.outDate||date<=g.outDate));
}
function mealPersonEnabled(name,date,isGuest=false){
 if(!mealPersonInDateRange(name,date,isGuest))return false;
 return isGuest?(db.mealPlan.guestStatus?.[date]?.[name]!==false):mealMemberEnabled(name,date);
}
function renderMealPersonDates(){
 const host=$('mealPersonDateSettings');if(!host)return;
 const rows=db.familyMembers.map(name=>{
  const dates=mealPersonDateValues(name,false);
  return '<div class="meal-person-date-row" data-meal-person-row="'+esc(name)+'"><strong>'+esc(name)+'</strong><label>Meal Start<input type="date" data-meal-person-start value="'+esc(dates.startDate)+'"></label><label>Meal Close<input type="date" data-meal-person-close value="'+esc(dates.closeDate)+'"></label></div>';
 }).join('');
 host.innerHTML='<div class="meal-person-date-group"><h4>Members</h4>'+(rows||'<p class="muted meal-person-date-empty">No family members added.</p>')+'</div>';
}
let memberLongPressTimer=null,selectedMemberProfileName='';
function updateMemberProfilePhotoPreview(){
 const p=ensureMemberProfile(selectedMemberProfileName),photo=p?.photoData||'';
 const image=$('memberProfilePhotoPreview'),fallback=$('memberProfilePhotoFallback');
 if(image){image.src=photo;image.hidden=!photo}
 if(fallback){fallback.hidden=!!photo;fallback.textContent=String(selectedMemberProfileName||'DQ').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'DQ'}
}
function openMemberIndividualPage(name){
 const profile=ensureMemberProfile(name);if(!profile)return;
 selectedMemberProfileName=String(name).trim();$('memberProfilePageTitle').textContent=selectedMemberProfileName;$('memberProfileName').value=selectedMemberProfileName;
 const fields=['Phone','Phone2','Email','Gender','Religion','BirthDate','Relation','Occupation','Country','Division','District','SubDistrict','Village','Road','Notes'];
 fields.forEach(field=>{const el=$('memberProfile'+field);if(el)el.value=profile[field[0].toLowerCase()+field.slice(1)]||''});
 updateMemberProfilePhotoPreview();setTab('memberProfilePage');
}
function renderFamilyMembers(){
 const list=$('familyMemberList');if(!list)return;
 list.innerHTML=db.familyMembers.map((name,index)=>{
  const photo=ensureMemberProfile(name)?.photoData||'';
  const avatar=photo?`<img src="${esc(photo)}" alt="" loading="lazy">`:`<span>${esc(name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase())}</span>`;
  return `<div class="family-member-row" data-family-member-name="${esc(name)}" tabindex="0" role="button" aria-label="Hold To Open: ${esc(name)}"><span class="family-member-avatar">${avatar}</span><span class="family-member-name"><strong>${esc(name)}</strong><small>Hold To Open</small></span><button type="button" class="delete" data-remove-family-member="${index}" aria-label="Remove ${esc(name)}">×</button></div>`;
 }).join('')||empty('No family members added yet.');
 list.querySelectorAll('.family-member-row').forEach(row=>{
  const start=event=>{if(event.target.closest('button')||(event.pointerType==='mouse'&&event.button!==0))return;clearTimeout(memberLongPressTimer);memberLongPressTimer=setTimeout(()=>openMemberIndividualPage(row.dataset.familyMemberName),650)};
  const cancel=()=>clearTimeout(memberLongPressTimer);
  row.addEventListener('pointerdown',start);row.addEventListener('pointerup',cancel);row.addEventListener('pointerleave',cancel);row.addEventListener('pointercancel',cancel);
  row.addEventListener('contextmenu',event=>{event.preventDefault();cancel();openMemberIndividualPage(row.dataset.familyMemberName)});
  row.addEventListener('keydown',event=>{if(event.target===row&&['Enter',' '].includes(event.key)){event.preventDefault();openMemberIndividualPage(row.dataset.familyMemberName)}});
 });
 list.querySelectorAll('[data-remove-family-member]').forEach(button=>button.onclick=()=>{
  const index=Number(button.dataset.removeFamilyMember),name=db.familyMembers[index];if(!name)return;
  if(memberProfileKey(name)===memberProfileKey(db.profile.name)){alert('The account holder is the first family member and cannot be removed.');return}
  if(!confirm(`Remove ${name} from the family member list? Past income records will keep this person's name.`))return;
  db.familyMembers.splice(index,1);delete db.memberProfiles[memberProfileKey(name)];renderFamilyMembers();fillChoices();save();
 });
}

function loadProfileForm(){
 $('profileName').value=db.profile.name||'';$('profilePhone').value=db.profile.phone||'';$('profilePhone2').value=db.profile.phone2||'';
 ['Country','Division','District','SubDistrict','Village','Road','Religion','Gender','BirthDate'].forEach(field=>{const key=field[0].toLowerCase()+field.slice(1);$('profile'+field).value=db.profile[key]||''});
 $('profileAddress').value=composeMemberAddress(db.profile)||db.profile.address||'';$('familyName').value=db.profile.familyName||'';
 $('openingCash').value=Number(db.profile.openingCash||0);$('openingBank').value=Number(db.profile.openingBank||0);
 updateAppBrand();updateProfilePhotoPreview();renderFamilyMembers();renderMealPersonDates();
}
initializeAddressCascades();
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
$('memberProfileBack').onclick=()=>setTab('profile');
$('memberProfilePhotoInput').onchange=event=>{
 const file=event.target.files?.[0];if(!file)return;
 if(!file.type.startsWith('image/')){alert('Choose an image file.');event.target.value='';return}
 if(file.size>10*1024*1024){alert('Choose an image smaller than 10 MB.');event.target.value='';return}
 const url=URL.createObjectURL(file),image=new Image();
 image.onload=()=>{
  try{
   const max=480,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
   canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
   const photoData=canvas.toDataURL('image/jpeg',0.82),p=ensureMemberProfile(selectedMemberProfileName);p.photoData=photoData;
   if(memberProfileKey(selectedMemberProfileName)===memberProfileKey(db.profile.name)){db.profile.photoData=photoData;updateProfilePhotoPreview()}
   updateMemberProfilePhotoPreview();renderFamilyMembers();save();alert('Member picture saved successfully.');
  }catch{alert('Could not process this picture. Try another photo.')}
  URL.revokeObjectURL(url);
 };
 image.onerror=()=>{URL.revokeObjectURL(url);alert('Could not open this picture. Try another photo.')};image.src=url;
};
$('removeMemberProfilePhoto').onclick=()=>{
 const p=ensureMemberProfile(selectedMemberProfileName);if(!p)return;p.photoData='';
 if(memberProfileKey(selectedMemberProfileName)===memberProfileKey(db.profile.name)){db.profile.photoData='';updateProfilePhotoPreview()}
 $('memberProfilePhotoInput').value='';updateMemberProfilePhotoPreview();renderFamilyMembers();save();alert('Member picture removed successfully.');
};
$('memberProfileForm').onsubmit=event=>{
 event.preventDefault();const name=selectedMemberProfileName;
 if(!name||!db.familyMembers.some(person=>memberProfileKey(person)===memberProfileKey(name))){alert('This family member is no longer in the member list.');setTab('profile');return}
 const p=ensureMemberProfile(name);
 Object.assign(p,{phone:$('memberProfilePhone').value.trim(),phone2:$('memberProfilePhone2').value.trim(),email:$('memberProfileEmail').value.trim(),gender:$('memberProfileGender').value,religion:$('memberProfileReligion').value.trim(),birthDate:$('memberProfileBirthDate').value,relation:$('memberProfileRelation').value.trim(),occupation:$('memberProfileOccupation').value.trim(),country:$('memberProfileCountry').value.trim(),division:$('memberProfileDivision').value.trim(),district:$('memberProfileDistrict').value.trim(),subDistrict:$('memberProfileSubDistrict').value.trim(),village:$('memberProfileVillage').value.trim(),road:$('memberProfileRoad').value.trim(),notes:$('memberProfileNotes').value.trim()});
 if(memberProfileKey(name)===memberProfileKey(db.profile.name)){Object.assign(db.profile,{phone:p.phone,phone2:p.phone2,gender:p.gender,religion:p.religion,birthDate:p.birthDate,country:p.country,division:p.division,district:p.district,subDistrict:p.subDistrict,village:p.village,road:p.road,address:composeMemberAddress(p)});loadProfileForm()}
 save();renderFamilyMembers();alert('Member information saved.');
};
$('familyName').addEventListener('input',updateAppBrand);
$('addFamilyMember').onclick=()=>{
 const input=$('newFamilyMember'),name=input.value.trim();if(!name){alert('Enter a family member name.');input.focus();return}
 if(db.familyMembers.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())){alert('This family member is already listed.');return}
 db.familyMembers.push(name);if(!db.incomePeople.includes(name))db.incomePeople.push(name);ensureMemberProfile(name);
 input.value='';renderFamilyMembers();renderMealPersonDates();fillChoices();save();
};
$('profileForm').onsubmit=e=>{
 e.preventDefault();const openingCash=Number($('openingCash').value),openingBank=Number($('openingBank').value);
 if(!Number.isFinite(openingCash)||openingCash<0||!Number.isFinite(openingBank)||openingBank<0){alert('Opening balances must be zero or greater.');return}
 const name=$('profileName').value.trim(),details={country:$('profileCountry').value.trim(),division:$('profileDivision').value.trim(),district:$('profileDistrict').value.trim(),subDistrict:$('profileSubDistrict').value.trim(),village:$('profileVillage').value.trim(),road:$('profileRoad').value.trim(),religion:$('profileReligion').value.trim(),gender:$('profileGender').value,birthDate:$('profileBirthDate').value};
 db.profile={...db.profile,...details,name,phone:$('profilePhone').value.trim(),phone2:$('profilePhone2').value.trim(),address:composeMemberAddress(details),familyName:$('familyName').value.trim(),openingCash,openingBank};
 if(name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase()))db.familyMembers.unshift(name);
 if(name&&!db.incomePeople.includes(name))db.incomePeople.unshift(name);
 if(name){const p=ensureMemberProfile(name);Object.assign(p,{phone:db.profile.phone,phone2:db.profile.phone2,...details})}
 fillChoices();renderFamilyMembers();updateProfilePhotoPreview();save();alert('Family profile and starting balances saved.');
};

function renderGuestMemberControls(){fillGuestMemberOptions(selectedGuestMembers());renderExpenseMemberOptions(selectedExpenseMembers())}
$('addGuestName').onclick=()=>{
 const input=$('newGuestName'),name=input.value.trim();if(!name){alert('Enter a guest name.');input.focus();return}
 if(assignablePeople().some(n=>n.toLocaleLowerCase()===name.toLocaleLowerCase())){alert('That name is already available in the member list.');return}
 db.guestPeople.push(name);input.value='';renderGuestMemberControls();renderMealPersonDates();fillChoices();save();
};
$('guestForm').onsubmit=e=>{
 e.preventDefault();const members=selectedGuestMembers(),entryDate=$('guestEntryDate').value,purpose=$('guestPurpose').value.trim(),relation=$('guestRelation').value.trim();
 if(!members.length){alert('Select at least one guest member.');return}
 if(!entryDate){alert('Choose the guest entry date.');return}
 if(!relation){alert('Enter the guest relation to the assigned family member.');$('guestRelation').focus();return}
 db.guestRelations=db.guestRelations||{};members.forEach(name=>{db.guestRelations[mealPersonKey(name)]=relation});
 db.guests.unshift({id:crypto.randomUUID(),entryDate,outDate:'',members,purpose,relation});
 $('guestForm').reset();$('guestEntryDate').value=today();fillGuestMemberOptions([]);renderGuestReport();renderMemberReportGuestAssignments();renderMealPersonDates();save();
};
$('guestEntryDate').value=today();

$('dailyQuestSetupLink').onclick=()=>setTab('questSetup');
$('addQuestTimeRange').onclick=()=>{
 const row=document.createElement('div');row.className='quest-time-range-row';row.dataset.timeRangeRow='';
 row.innerHTML='<label>Start <input type="time" name="questRangeStart" value="09:00"></label><label>End <input type="time" name="questRangeEnd" value="10:00"></label><button type="button" class="secondary compact" data-remove-time-range>Remove</button>';
 $('questTimeRanges').appendChild(row);
};
$('questTimeRanges').onclick=e=>{
 const remove=e.target.closest('[data-remove-time-range]');if(!remove)return;
 remove.closest('[data-time-range-row]').remove();
};
$('questList').onclick=e=>{
 const tile=e.target.closest('[data-quest-advance]');if(!tile||tile.disabled)return;
 const q=db.quests.find(item=>item.id===tile.dataset.questAdvance);if(!q)return;
 toggleQuest(q.id,Number(tile.dataset.rangeIndex),tile.dataset.questDate||questLocalDate());
};
$('questForm').onsubmit=e=>{
 e.preventDefault();
 const title=$('questTitle').value.trim(),times=Math.max(1,Math.floor(Number($('questTimes').value)||1)),eachTime=Number($('questEachTime').value),startDate=$('questStartDate').value,endDate=$('questEndDate').value;
 const repeatDays=[...document.querySelectorAll('[name="questDays"]:checked')].map(input=>input.value);
 const timeRangeRows=[...$('questTimeRanges').querySelectorAll('[data-time-range-row]')];
 const timeRanges=timeRangeRows.map(row=>({start:row.querySelector('[name="questRangeStart"]').value,end:row.querySelector('[name="questRangeEnd"]').value})).filter(r=>r.start||r.end).sort((a,b)=>a.start.localeCompare(b.start));
 if(!title||!(eachTime>0)||!Number.isFinite(eachTime)){alert('Enter a quest name and a valid Value greater than 0.');return}
 if(!startDate||!endDate||endDate<startDate){alert('Choose a valid Achievement Start Date and End Date.');return}
 if(!repeatDays.length){alert('Select at least one repeat day.');return}
 if(timeRanges.some(r=>!r.start||!r.end||r.start===r.end)){alert('Complete both Start and End times, or remove the time range. Start and End times cannot be the same.');return}
 const intervals=timeRanges.map(r=>{const start=Number(r.start.slice(0,2))*60+Number(r.start.slice(3,5));let end=Number(r.end.slice(0,2))*60+Number(r.end.slice(3,5));if(end<=start)end+=1440;return{start,end}});
 for(let i=0;i<intervals.length;i++)for(let j=i+1;j<intervals.length;j++)for(const shift of [-1440,0,1440]){
  if(Math.max(intervals[i].start,intervals[j].start+shift)<Math.min(intervals[i].end,intervals[j].end+shift)){alert('Time ranges must not overlap. Please adjust their start and end times.');return}
 }
 db.quests.push({id:crypto.randomUUID(),title,date:startDate,startDate,endDate,repeat:'weekly',repeatDays,times,eachTime,timeRanges});
 e.target.reset();$('questTitle').value='Namaz';$('questTimes').value=5;$('questEachTime').value=2;$('questStartDate').value=questLocalDate();$('questEndDate').value=questLocalDate();
 document.querySelectorAll('[name="questDays"]').forEach(input=>input.checked=true);
 $('questTimeRanges').innerHTML='';
 save()
};
$('questStartDate').value=questLocalDate();$('questEndDate').value=questLocalDate();
setInterval(()=>{
 const d=questLocalDate(),items=dayQuestsForNow(d);
 if($('questList'))$('questList').innerHTML=questTileHTML(items);
},30000);
function questRanges(q){return Array.isArray(q.timeRanges)&&q.timeRanges.length?q.timeRanges:[{start:'00:00',end:'23:59'}]}
function questRangeState(q,d,index){
 const count=Math.max(1,Math.floor(Number(q.times)||1)),raw=(db.checks[d]||{})[q.id];
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.ranges&&Array.isArray(raw.ranges[index]))return Array.from({length:count},(_,i)=>!!raw.ranges[index][i]);
 if(index===0&&Array.isArray(raw))return Array.from({length:count},(_,i)=>!!raw[i]);
 if(index===0&&raw===true)return Array(count).fill(true);
 return Array(count).fill(false);
}
function questCheckState(q,d){return questRanges(q).flatMap((r,i)=>questRangeState(q,d,i))}
function questCheckedCount(q,d){return questCheckState(q,d).filter(Boolean).length}
function questAchieved(q,d){return questCheckedCount(q,d)*Number(q.eachTime??1)}
function questTarget(q){return Math.max(1,Math.floor(Number(q.times)||1))*Number(q.eachTime??1)*questRanges(q).length}
function numberText(n){return Number(n).toLocaleString(undefined,{maximumFractionDigits:2})}
function completed(q,d){const state=questCheckState(q,d);return state.length>0&&state.every(Boolean)}
function questActiveRange(q,d,now=new Date()){
 const nowMs=now.getTime(),ranges=questRanges(q);
 for(let i=0;i<ranges.length;i++){
  const r=ranges[i],startAt=new Date(`${d}T${r.start}:00`),endAt=new Date(`${d}T${r.end}:00`);
  if(endAt<=startAt)endAt.setDate(endAt.getDate()+1);
  const state=questRangeState(q,d,i);
  if(state.every(Boolean))continue;
  if(nowMs>=endAt.getTime())continue;
  if(nowMs<startAt.getTime())return{status:'waiting',index:i,startAt,endAt,checked:state.filter(Boolean).length};
  return{status:'active',index:i,startAt,endAt,checked:state.filter(Boolean).length};
 }
 return{status:completed(q,d)?'completed':'expired',index:-1};
}
function questTimeText(value){
 const [h,m]=String(value||'00:00').split(':').map(Number),hour=h%12||12;
 return `${hour}:${String(m).padStart(2,"0")} ${h>=12?"PM":"AM"}`;
}
function toggleQuest(id,rangeIndex,d){
 const q=db.quests.find(x=>x.id===id);if(!q)return;
 const active=questActiveRange(q,d,new Date());if(active.status!=='active'||active.index!==rangeIndex)return;
 const state=questRangeState(q,d,rangeIndex),next=state.findIndex(value=>!value);if(next<0)return;
 state[next]=true;db.checks[d]??={};const raw=db.checks[d][id],ranges=raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.ranges?raw.ranges:{};
 ranges[rangeIndex]=state;db.checks[d][id]={ranges};save()
}
function delExpense(id){if(confirm('Delete this expense?')){if(editingExpenseId===id)resetExpenseForm();if(settlingExpenseId===id)closeExpenseDueAction();db.expenses=db.expenses.filter(x=>x.id!==id);save()}}
function delQuest(id){if(confirm('Delete this quest?')){db.quests=db.quests.filter(x=>x.id!==id);Object.values(db.checks).forEach(v=>delete v[id]);save()}}
function empty(msg){return `<div class="empty">${msg}</div>`}
function render(){
 applySideMenuOrder();applyOverviewSectionOrder();
 let d=today(),questDate=questLocalDate(),exToday=db.expenses.filter(x=>x.date===d),billsToday=db.purchaseBills.filter(x=>x.date===d),qToday=dayQuestsForNow(questDate),done=qToday.filter(q=>completed(q,q._occurrenceDate||questDate)).length;
 $('todayTotal').textContent=money(sum(exToday)+billsToday.reduce((t,b)=>t+billTotal(b),0));$('questProgress').textContent=`${done}/${qToday.length}`;$('questBar').style.width=(qToday.length?done/qToday.length*100:0)+'%';$('todayQuestLabel').textContent=`${done} quests done`;
 let ws=startWeek(d),ms=d.slice(0,7);$('weekTotal').textContent=money(sum(db.expenses.filter(x=>x.date>=ws&&x.date<=d))+db.purchaseBills.filter(b=>b.date>=ws&&b.date<=d).reduce((t,b)=>t+billTotal(b),0));$('monthTotal').textContent=money(sum(db.expenses.filter(x=>x.date.startsWith(ms)))+db.purchaseBills.filter(b=>b.date.startsWith(ms)).reduce((t,b)=>t+billTotal(b),0));
 $('todayIncome').textContent=money(db.incomes.reduce((t,x)=>t+incomeReceivedOn(x,d),0));$('monthIncome').textContent=money(incomeReceivedBetween(ms+'-01',d));showBalances();
 renderRecentExpenses();
 $('recentIncome').innerHTML=incomeHTML([...db.incomes].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4),false);
 $('todayQuests').innerHTML=questHTML(qToday.slice(0,4),false);
 $('expenseCount').textContent=`${db.expenses.length} expenses · ${db.purchaseBills.length} bills`;renderLoans();
 let filtered=db.expenses.filter(x=>( $('expenseFilter').value==='all'||x.category===$('expenseFilter').value)&&(`${x.note} ${x.category}`).toLowerCase().includes($('expenseSearch').value.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
 $('expenseList').innerHTML=expenseHTML(filtered,true);$('questList').innerHTML=questTileHTML(dayQuestsForNow(questDate));if($('questSetupList'))$('questSetupList').innerHTML=questHTML(dayQuests(questDate),true);renderQuickActions();renderQuickSuppliers();renderQuickActionManager();renderSupplierAccounts();renderInventory();renderProductionList();renderExpenseDueList();renderGuestReport();
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

function questTileHTML(items){
 return items.length?items.map(q=>{
  const d=q._occurrenceDate||questLocalDate(),state=questCheckState(q,d),checked=state.filter(Boolean).length,achieved=questAchieved(q,d),target=questTarget(q),active=questActiveRange(q,d,new Date()),ranges=questRanges(q),range=active.index>=0?ranges[active.index]:null;
  const rangeState=active.index>=0?questRangeState(q,d,active.index):[];
  const doneInRange=rangeState.filter(Boolean).length,rangeLabel=range?questTimeText(range.start)+' – '+questTimeText(range.end):'';
  const buttonText=active.status==='active'?'Tap to record · '+rangeLabel:active.status==='waiting'?'Next: '+rangeLabel:active.status==='completed'?'Completed for this date range':'All time ranges ended';
  const activeIndex=active.index>=0?active.index:0;
  return `<button type="button" class="quick-action-card daily-quest-tile" data-quest-advance="${esc(q.id)}" data-range-index="${activeIndex}" data-quest-date="${d}" aria-label="${esc(q.title)}. ${buttonText}"${active.status!=='active'?' disabled':''}>
   <span class="quick-action-button-title">${esc(q.title)}</span>
   <span class="quick-action-button-stats"><span>Done: <strong>${doneInRange}/${Math.max(1,Math.floor(Number(q.times)||1))}</strong></span><span>Achieved: <strong>${numberText(achieved)}/${numberText(target)}</strong></span></span>
   <span class="quick-action-button-kind">${buttonText}</span>
  </button>`;
 }).join(''):empty('No Daily Quests scheduled for this date.');
}
function questHTML(items,del){return items.length?items.map(q=>{
 const d=q._occurrenceDate||questLocalDate(),state=questCheckState(q,d),checked=state.filter(Boolean).length,achieved=questAchieved(q,d),target=questTarget(q);
 const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],days=Array.isArray(q.repeatDays)&&q.repeatDays.length?q.repeatDays.map(Number).sort((a,b)=>[6,0,1,2,3,4,5].indexOf(a)-[6,0,1,2,3,4,5].indexOf(b)).map(day=>dayNames[day]).join(', '):(q.repeat==='daily'?'Every day':'One day');
 const ranges=questRanges(q).map(r=>questTimeText(r.start)+' – '+questTimeText(r.end)).join(', ');
 return `<div class="quest-item ${completed(q,d)?'done':''}">
  <div class="quest-item-head"><div class="item-main"><div class="item-title">${esc(q.title)}</div><div class="item-sub">Repeat: ${esc(days)} · Dates: ${esc(q.startDate||q.date||'—')} to ${esc(q.endDate||'No end date')} · Times/range: ${numberText(Number(q.times||1))} · Value: ${numberText(Number(q.eachTime??1))} · ${esc(ranges)}</div></div>
   <div class="quest-score"><strong>Achieved: ${numberText(achieved)} / ${numberText(target)}</strong><span>${checked} / ${state.length} Times</span></div>
   ${del?`<button class="delete" onclick="delQuest('${q.id}')" aria-label="Delete ${esc(q.title)}">×</button>`:''}
  </div>
  <div class="quest-progress-track"><span style="width:${target?Math.min(100,achieved/target*100):0}%"></span></div>
 </div>`
 }).join(''):empty('No Daily Quests scheduled for today.')}

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
 const select=$('memberProductFilter'),list=$('memberProductConsumption');
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

 if(!movements.length){list.innerHTML=empty(selected?`No product stock consumption for ${esc(selected)}.`:'No product stock consumption.');return}
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
 list.innerHTML=db.guests.slice().sort((a,b)=>String(b.entryDate).localeCompare(String(a.entryDate))).map(g=>'<article class="guest-row" data-guest-id="'+esc(g.id)+'"><div class="guest-row-head"><div><strong>'+esc(g.members.join(', '))+'</strong><small>Entry: '+fmt(g.entryDate)+' · Out: '+(g.outDate?fmt(g.outDate):'Still staying')+' · Relation: '+esc(g.relation||'Not set')+(g.purpose?' · Purpose: '+esc(g.purpose):'')+'</small></div><span class="guest-status '+(g.outDate?'guest-left':'guest-staying')+'">'+(g.outDate?'Left':'Staying')+'</span></div></article>').join('')||empty('No guest entries yet.');
 const filteredGuests=db.guests.filter(g=>guestOverlapsRange(g,rangeStart,rangeEnd));
 report.innerHTML=filteredGuests.slice().sort((a,b)=>String(b.entryDate).localeCompare(String(a.entryDate))).map(g=>{
  const costs=guestStayCosts(g,rangeStart,rangeEnd);
  return '<article class="guest-report-row"><div><strong>'+esc(g.members.join(', '))+'</strong><small>Entry date: '+fmt(g.entryDate)+' · Out date: '+(g.outDate?fmt(g.outDate):'Still staying')+' · Relation: '+esc(g.relation||'Not set')+' · Purpose: '+esc(g.purpose||'Not specified')+'</small></div><div class="guest-report-costs"><span>Guest purpose cost<strong>'+money(costs.purposeCost)+'</strong></span><span>Family cost<strong>'+money(costs.sharedFamilyCost)+'</strong></span><span>Guest share<strong>'+money(costs.guestShareOfFamily)+'</strong></span></div></article>';
 }).join('')||empty('No guest stays in this report.');
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
 const bills=db.purchaseBills.filter(b=>String(b.date||'')>=from&&String(b.date||'')<=to);
 const rows=bills.flatMap(b=>(b.lines||[]).filter(line=>String(line.category||b.category||'').toLocaleLowerCase()==='assets').map(line=>({bill:b,line,amount:purchaseLineCost(b,line)})));
 const total=rows.reduce((sum,row)=>sum+row.amount,0);
 $('assetPurchaseTotal').textContent=money(total);$('assetPurchaseLines').textContent=String(rows.length);$('assetPurchaseBills').textContent=String(new Set(rows.map(row=>row.bill.id)).size);
 list.innerHTML=rows.length?rows.sort((a,b)=>String(b.bill.date||'').localeCompare(String(a.bill.date||''))).map(({bill,line,amount})=>`<article class="asset-report-row"><div><strong>${esc(line.product||'Asset')}${line.spec?` · ${esc(line.spec)}`:''}</strong><small>${fmt(bill.date)} · ${esc(bill.supplier||'Supplier')} · Bill ${esc(bill.billNo||'')}</small><small>${numberText(line.quantity)} ${esc(line.unit||'pcs')} · ${esc(line.productType||'Other')} · ${esc(line.category||bill.category||'Uncategorised')}</small></div><strong>${money(amount)}</strong></article>`).join(''):empty('No product lines with category Assets in the selected date range.');
}

function supplierBillSettlementByBill(asOfDate){
 const result=new Map();
 const supplierNames=[...new Set(db.purchaseBills.map(b=>String(b.supplier||'').trim()).filter(Boolean))];
 supplierNames.forEach(supplier=>{
  const rows=db.purchaseBills.filter(b=>String(b.supplier||'').trim()===supplier&&String(b.date||'')<=asOfDate).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.id).localeCompare(String(b.id))).map(b=>({bill:b,remaining:billCredit(b),paid:0,discount:0}));
  const payments=db.supplierPayments.filter(p=>p.supplier===supplier&&String(p.date||'')<=asOfDate).slice().sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.id).localeCompare(String(b.id)));
  payments.forEach(payment=>{
   let cash=Math.max(0,Number(payment.amount||0)),discount=Math.max(0,Number(payment.discount||0));
   rows.forEach(row=>{
    if(row.remaining<=0)return;
    if(cash>0){const applied=Math.min(row.remaining,cash);row.paid+=applied;row.remaining-=applied;cash-=applied}
    if(discount>0&&row.remaining>0){const applied=Math.min(row.remaining,discount);row.discount+=applied;row.remaining-=applied;discount-=applied}
   });
  });
  rows.forEach(row=>result.set(String(row.bill.id),{paid:row.paid,discount:row.discount,remaining:row.remaining}));
 });
 return result;
}
function buildCostReportRows(from,to){
 const rows=[],billSettlements=supplierBillSettlementByBill(to);
 db.purchaseBills.filter(b=>String(b.date||'')>=from&&String(b.date||'')<=to).forEach(bill=>{
  const billTotalAmount=billTotal(bill),directPaid=Math.min(billTotalAmount,Math.max(0,Number(bill.cashPaid||0))+Math.max(0,Number(bill.bankPaid||0)));
  const settlement=billSettlements.get(String(bill.id))||{paid:0,discount:0,remaining:billCredit(bill)};
  const totalPaid=Math.min(billTotalAmount,directPaid+Number(settlement.paid||0));
  const totalDue=Math.max(0,Number(settlement.remaining??billCredit(bill)));
  (bill.lines||[]).forEach((line,index)=>{
   const lineId=line.id||String(index),lineCost=purchaseLineCost(bill,line),billLineAmount=purchaseBillLineBillAmount(bill,line),share=billTotalAmount>0?billLineAmount/billTotalAmount:0,transitShare=Math.max(0,lineCost-billLineAmount);
   const quantity=Math.max(0,Number(line.quantity||0));
   const consumed=usedStockQuantity({billId:bill.id,lineId},{asOfDate:to});
   const stock=Math.max(0,quantity-consumed);
   rows.push({
    date:String(bill.date||''),product:String(line.product||'Unspecified product'),quantity:quantity>0?`${numberText(quantity)} ${String(line.unit||'pcs')}`:'—',
    rate:money(Number(line.rate||0)),paidAmount:totalPaid*share+transitShare,dueAmount:totalDue*share,supplier:String(bill.supplier||'Unassigned Supplier'),
    inventoryStock:`${numberText(stock)} ${String(line.unit||'pcs')}`,
    category:String(line.category||bill.category||'Uncategorised'),type:String(line.productType||'Other'),productGroup:String(line.product||'Unspecified product'),
    source:'Purchase',discountAllocated:Number(settlement.discount||0)*share
   });
  });
 });
 db.expenses.filter(item=>String(item.date||'')>=from&&String(item.date||'')<=to).forEach(item=>{
  const amount=Math.max(0,Number(item.amount||0)),quantity=Math.max(0,Number(item.quantity||0));
  const paid=item.paymentType==='Due'?expenseSettlements(item).filter(entry=>!entry.date||String(entry.date)<=to).reduce((total,entry)=>total+Number(entry.amount||0),0):amount;
  const due=item.paymentType==='Due'?expenseOutstandingAt(item,to):0;
  const product=String(item.name||item.note||item.category||'Expense');
  rows.push({
   date:String(item.date||''),product,quantity:quantity>0?`${numberText(quantity)} ${String(item.unit||'')}`.trim():'—',
   rate:money(Number(item.rate??(quantity>0?amount/quantity:amount))),paidAmount:paid,dueAmount:due,
   supplier:String(item.duePerson||'—'),inventoryStock:'—',category:String(item.category||'Uncategorised'),type:product,productGroup:product,source:'Expense',discountAllocated:0
  });
 });
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))||a.product.localeCompare(b.product));
}
function renderCostReport(from,to){
 const rows=buildCostReportRows(from,to),mode=$('costGroupBy')?.value||'category';
 const config={category:{field:'category',title:'Category'},type:{field:'type',title:'Type'},product:{field:'productGroup',title:'Product'}}[mode]||{field:'category',title:'Category'};
 const totals=new Map();rows.forEach(row=>{const label=row[config.field]||'Uncategorised';totals.set(label,(totals.get(label)||0)+row.paidAmount+row.dueAmount+row.discountAllocated)});
 $('costBreakdownTitle').textContent=`Cost by ${config.title}`;
 $('costReportRangeCaption').textContent=`${fmt(from)} – ${fmt(to)}`;
 $('categoryBreakdown').innerHTML=[...totals.entries()].sort((a,b)=>b[1]-a[1]).map(([name,total])=>`<div class="breakrow"><span>${esc(name)}</span><strong>${money(total)}</strong></div>`).join('')||empty('No costs in this date range.');
}
function costReportDocumentHtml(){
 const from=$('productReportFromDate')?.value||'',to=$('productReportToDate')?.value||'',rows=buildCostReportRows(from,to);
 const mode=$('costGroupBy')?.value||'category',modeLabel={category:'Category',type:'Type',product:'Product'}[mode]||'Category';
 const body=rows.map(row=>`<tr><td>${esc(fmt(row.date))}</td><td>${esc(row.product)}</td><td>${esc(row.quantity)}</td><td>${esc(row.rate)}</td><td>${esc(money(row.paidAmount))}</td><td>${esc(money(row.dueAmount))}</td><td>${esc(row.supplier)}</td><td>${esc(row.inventoryStock)}</td></tr>`).join('');
 const totalPaid=rows.reduce((total,row)=>total+row.paidAmount,0),totalDue=rows.reduce((total,row)=>total+row.dueAmount,0),discounts=rows.reduce((total,row)=>total+row.discountAllocated,0);
 return `<!doctype html><html><head><meta charset="utf-8"><title>DayQuest Cost Report</title><style>@page{size:landscape;margin:12mm}body{font-family:Arial,sans-serif;color:#182337;padding:18px}h1{font-size:20px;margin:0 0 6px}.meta{font-size:11px;color:#667085;margin:0 0 12px}.summary{display:flex;gap:22px;flex-wrap:wrap;margin:10px 0 16px;font-size:11px}.summary strong{display:block;font-size:14px;margin-top:3px}table{border-collapse:collapse;width:100%;font-size:9px}th,td{border:1px solid #cbd3df;padding:6px 7px;text-align:left;vertical-align:top}th{background:#edf1f6;white-space:nowrap}tbody tr:nth-child(even){background:#fafbfd}tfoot td{font-weight:700;background:#f1f4f8}@media print{body{padding:0}thead{display:table-header-group}tr{break-inside:avoid}}</style></head><body><h1>DayQuest · Cost Report</h1><p class="meta">Date of Cost: ${esc(from)} to ${esc(to)} · Cost grouped by ${esc(modeLabel)} · Inventory stock as of ${esc(fmt(to))}</p><div class="summary"><div>Total paid<strong>${esc(money(totalPaid))}</strong></div><div>Total due<strong>${esc(money(totalDue))}</strong></div><div>Discount settled<strong>${esc(money(discounts))}</strong></div><div>Cost entries<strong>${rows.length}</strong></div></div><table><thead><tr><th>Date of Cost</th><th>Product Name</th><th>Quantity</th><th>Rate</th><th>Paid Amount</th><th>Due Amount</th><th>Supplier</th><th>Inventory Stock</th></tr></thead><tbody>${body||'<tr><td colspan="8">No cost entries in the selected date range.</td></tr>'}</tbody><tfoot><tr><td colspan="4">Total</td><td>${esc(money(totalPaid))}</td><td>${esc(money(totalDue))}</td><td colspan="2">Inventory stock is shown per purchase lot as of the To date.</td></tr></tfoot></table></body></html>`;
}

function renderMemberReportGuestAssignments(){
 const host=$('memberReportGuestAssignments');if(!host)return;
 host.innerHTML=db.guestPeople.length?db.guestPeople.map(guest=>{
  const key=mealPersonKey(guest),assigned=db.mealPlan.guestAssignments?.[key]||[];
  const stay=guestStayRangesForPerson(guest).slice().sort((a,b)=>String(b.entryDate).localeCompare(String(a.entryDate)))[0]||null;
  const relation=String(stay?.relation||db.guestRelations?.[key]||'');
  const checks=db.familyMembers.map(member=>'<label><input type="checkbox" data-report-meal-assign-guest="'+esc(guest)+'" data-report-meal-assign-member="'+esc(member)+'" '+(assigned.some(name=>mealPersonKey(name)===mealPersonKey(member))?'checked':'')+'><span>'+esc(member)+'</span></label>').join('');
  return '<div class="member-report-guest-row" data-report-guest-row="'+esc(guest)+'" data-report-guest-id="'+esc(stay?.id||'')+'" aria-label="Guest assignment controls for '+esc(guest)+'"><span class="visually-hidden">'+esc(guest)+'</span><div class="member-report-guest-dates"><label>Relation<input type="text" maxlength="60" data-report-guest-relation value="'+esc(relation)+'" placeholder="Relation"></label><label>In<input type="date" data-report-guest-entry value="'+esc(stay?.entryDate||'')+'"></label><label>Out<input type="date" data-report-guest-out value="'+esc(stay?.outDate||'')+'" min="'+esc(stay?.entryDate||'')+'"></label><button type="button" class="edit-btn" data-report-save-guest>Save</button></div><div class="member-report-guest-checks">'+(checks||'<span class="muted">Add family members first.</span>')+'</div></div>';
 }).join(''):empty('No guest members added yet.');
}
function renderReport(){
 const from=$('productReportFromDate')?.value||'',to=$('productReportToDate')?.value||'';
 renderMemberReportGuestAssignments();
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
  if($('costReportRangeCaption'))$('costReportRangeCaption').textContent=message;
  if($('categoryBreakdown'))$('categoryBreakdown').innerHTML=empty(message);
  updateReportSummaryMetrics();
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
 if($('costChartPageTotal'))$('costChartPageTotal').textContent=money(total);
 if($('costChartPageRange'))$('costChartPageRange').textContent=`${fmt(from)} – ${fmt(to)}`;
 renderCostReport(from,to);
 renderProductPurchaseReport(from,to);renderDueReport(from,to);updateReportSummaryMetrics();
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

activateReportSection('members');purchaseLines=[defaultPurchaseLine()];renderPurchaseLines();fillChoices();renderQuickMemberOptions([]);fillQuickActionOptions();updateQuickActionTypeFields();$('purchaseDate').value=today();updatePurchaseBillNo();productionInputs=[defaultProductionInput()];fillProductionOptions();resetProductionForm();applyThemeColor(db.settings.themeColor,false);applySideMenuColor(db.settings.sideMenuColor||'#111d30',false);applyTopBarColor(db.settings.topBarColor||'#101827',false);renderPurchaseCategorySettings();renderMasterLists();
$('exportBtn').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`dayquest-backup-${today()}.json`;a.click();URL.revokeObjectURL(a.href)};
$('importFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!Array.isArray(x.expenses)||!Array.isArray(x.quests)||typeof x.checks!=='object')throw Error();if(!Array.isArray(x.incomes))x.incomes=[];if(!Array.isArray(x.loans))x.loans=[];if(!Array.isArray(x.quickActions))x.quickActions=[];if(!Array.isArray(x.purchaseBills))x.purchaseBills=[];if(!Array.isArray(x.supplierPayments))x.supplierPayments=[];if(!Array.isArray(x.suppliers))x.suppliers=[];if(!Array.isArray(x.productNames))x.productNames=[];if(!Array.isArray(x.productTypes))x.productTypes=['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];if(!Array.isArray(x.purchaseCategories))x.purchaseCategories=['Assets','Staples','Fixed Ex.'];if(!x.settings||typeof x.settings!=='object')x.settings={themeColor:'#263b5c'};if(!Array.isArray(x.consumptions))x.consumptions=[];if(!Array.isArray(x.productions))x.productions=[];if(!Array.isArray(x.incomeHeads))x.incomeHeads=['Salary','Business','Sales','Freelance','Rent','Gift','Other'];if(!Array.isArray(x.incomePeople))x.incomePeople=[];if(!x.profile||typeof x.profile!=='object')x.profile={name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};if(!Array.isArray(x.familyMembers))x.familyMembers=[];if(!Array.isArray(x.guestPeople))x.guestPeople=[];if(!Array.isArray(x.guests))x.guests=[];if(confirm('Replace current data with this backup?')){db=x;db.sideMenuOrder=normalizeSideMenuOrder(db.sideMenuOrder);db.supplierDetails=db.supplierDetails&&typeof db.supplierDetails==='object'&&!Array.isArray(db.supplierDetails)?db.supplierDetails:{};db.productDictionary=normalizeProductDictionary(db.productDictionary);db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.quickButtonColor||'')))db.settings.quickButtonColor='#ee7d2f';db.incomes=Array.isArray(db.incomes)?db.incomes:[];db.quickActions=Array.isArray(db.quickActions)?db.quickActions:[];db.expenses=Array.isArray(db.expenses)?db.expenses:[];db.expenses.forEach(item=>{item.costMember=String(item.costMember||'').trim()});db.purchaseBills=Array.isArray(db.purchaseBills)?db.purchaseBills:[];db.supplierPayments=Array.isArray(db.supplierPayments)?db.supplierPayments:[];db.suppliers=Array.isArray(db.suppliers)?[...new Set(db.suppliers)]:[];
db.supplierDetails=db.supplierDetails&&typeof db.supplierDetails==='object'&&!Array.isArray(db.supplierDetails)?db.supplierDetails:{};
db.quickSuppliers=Array.isArray(db.quickSuppliers)?[...new Set(db.quickSuppliers.filter(name=>db.suppliers.includes(name)))]:[];db.productNames=Array.isArray(db.productNames)?db.productNames:[];
db.productNames=[...new Map(db.productNames.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);db.productTypes=Array.isArray(db.productTypes)&&db.productTypes.length?db.productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];db.productTypes=[...new Map(db.productTypes.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([key,value])=>key&&value))].map(([key,value])=>value);db.consumptions=Array.isArray(db.consumptions)?db.consumptions:[];db.productions=Array.isArray(db.productions)?db.productions.filter(p=>p&&p.id&&p.product&&Number(p.quantity)>0):[];normalizePurchaseInventory();db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];db.settings=db.settings&&typeof db.settings==='object'?db.settings:{themeColor:'#263b5c'};if(typeof db.settings.requireSupplierForDuePurchase!=='boolean')db.settings.requireSupplierForDuePurchase=true;if(typeof db.settings.allowPurchaseBillEdits!=='boolean')db.settings.allowPurchaseBillEdits=true;db.expenseNames=Array.isArray(db.expenseNames)?db.expenseNames:['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];db.units=Array.isArray(db.units)?db.units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];db.purchaseBills.forEach(b=>{if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);(b.lines||[]).forEach(l=>{if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product)})});db.supplierPayments.forEach(p=>{if(p.supplier&&!db.suppliers.includes(p.supplier))db.suppliers.push(p.supplier)});db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];normalizePurchaseBillNumbers();db.profile=db.profile||{name:'',phone:'',phone2:'',familyName:'',photoData:'',openingCash:0,openingBank:0};db.profile.familyName=String(db.profile.familyName||'');db.profile.phone=String(db.profile.phone||'');db.profile.phone2=String(db.profile.phone2||'');db.profile.photoData=typeof db.profile.photoData==='string'&&db.profile.photoData.startsWith('data:image/')?db.profile.photoData:'';['country','division','district','subDistrict','village','road','religion','gender','birthDate'].forEach(field=>db.profile[field]=String(db.profile[field]||''));db.familyMembers=Array.isArray(db.familyMembers)?db.familyMembers.map(n=>String(n||'').trim()).filter(Boolean):[];db.memberProfiles=db.memberProfiles&&typeof db.memberProfiles==='object'&&!Array.isArray(db.memberProfiles)?db.memberProfiles:{};db.familyMembers=[...new Map(db.familyMembers.map(n=>[n.toLocaleLowerCase(),n])).values()];db.guestPeople=Array.isArray(db.guestPeople)?db.guestPeople.map(n=>String(n||'').trim()).filter(Boolean):[];db.guestPeople=[...new Map(db.guestPeople.map(n=>[n.toLocaleLowerCase(),n])).values()];db.guestRelations=db.guestRelations&&typeof db.guestRelations==='object'&&!Array.isArray(db.guestRelations)?db.guestRelations:{};db.guests=Array.isArray(db.guests)?db.guests.filter(g=>g&&Array.isArray(g.members)&&g.members.length&&/^\d{4}-\d{2}-\d{2}$/.test(String(g.entryDate||''))):[];db.guests.forEach(g=>{g.id=g.id||crypto.randomUUID();g.members=uniquePeople(g.members);g.outDate=String(g.outDate||'');if(g.outDate&&g.outDate<g.entryDate)g.outDate='';g.purpose=String(g.purpose||'');g.members.forEach(n=>{if(!assignablePeople().some(x=>x.toLocaleLowerCase()===String(n).toLocaleLowerCase()))db.guestPeople.push(String(n).trim())})});db.incomePeople=Array.isArray(db.incomePeople)?db.incomePeople:[];if(db.profile.name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===db.profile.name.toLocaleLowerCase()))db.familyMembers.unshift(db.profile.name);normalizeMemberAssignments();db.familyMembers.forEach(name=>{if(!db.incomePeople.includes(name))db.incomePeople.push(name)});db.incomes.forEach(item=>{item.incomeBy=String(item.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(item.incomeBy))db.incomePeople.push(item.incomeBy)});if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');fillChoices();loadProfileForm();applyThemeColor(db.settings.themeColor||'#263b5c',false);applySideMenuColor(db.settings.sideMenuColor||'#111d30',false);applyTopBarColor(db.settings.topBarColor||'#101827',false);applyQuickButtonColor(db.settings.quickButtonColor||'#ee7d2f',false);applyBackgroundColor(db.settings.backgroundColor||'#f3f5f9',false);applyFontColor(db.settings.fontColor||'#263b5c',false);applyFontColor(db.settings.fontColor||'#263b5c',false);renderPurchaseCategorySettings();renderMasterLists();save();alert('Backup restored.')}}catch{alert('That backup file is not valid.')}e.target.value=''};
const isAppleTouchDevice=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isAndroidDevice=/Android/i.test(navigator.userAgent);
const isMobileInstallDevice=isAppleTouchDevice||isAndroidDevice;
const isDayQuestStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches||window.matchMedia?.('(display-mode: fullscreen)').matches||navigator.standalone===true;
function updateDayQuestInstallButton(){
 const button=$('installBtn');if(!button)return;
 const installed=isDayQuestStandalone();
 button.hidden=installed||(!isMobileInstallDevice&&!deferredInstall);
 button.textContent='Install App';
 button.disabled=false;
 button.setAttribute('aria-label','Install DayQuest on this device');
}
function showDayQuestInstallHelp(){
 if(isAppleTouchDevice){
  alert('To install DayQuest on your iPhone or iPad:\n\n1. Open this page in Safari.\n2. Tap Share.\n3. Choose “Add to Home Screen”.\n4. Turn on “Open as Web App” if shown.\n5. Tap “Add”.');
  return;
 }
 if(isAndroidDevice){
  alert('To install DayQuest on Android:\n\n1. Open DayQuest in Chrome or Samsung Internet.\n2. Open the browser menu (⋮).\n3. Choose “Install app” or “Add to Home screen”.\n4. Confirm the installation.\n\nIf you do not see that option, open DayQuest directly in Chrome instead of an in-app browser, then refresh and try again.');
  return;
 }
 alert('Open DayQuest in your mobile browser and use the browser menu to choose “Install app” or “Add to Home screen”.');
}
updateDayQuestInstallButton();
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();
 deferredInstall=event;
 updateDayQuestInstallButton();
});
window.addEventListener('appinstalled',()=>{
 deferredInstall=null;
 updateDayQuestInstallButton();
});
$('installBtn').onclick=async()=>{
 const button=$('installBtn');
 if(isDayQuestStandalone()){updateDayQuestInstallButton();return}
 if(deferredInstall){
  const installEvent=deferredInstall;
  deferredInstall=null;
  button.disabled=true;
  button.textContent='Opening…';
  try{
   await installEvent.prompt();
   const choice=await installEvent.userChoice;
   if(choice?.outcome==='accepted'){
    button.hidden=true;
   }else{
    button.textContent='Install App';
    button.hidden=false;
   }
  }catch(error){
   console.warn('DayQuest install prompt could not be opened:',error);
   button.textContent='Install App';
   button.hidden=false;
   showDayQuestInstallHelp();
  }finally{
   button.disabled=false;
  }
  return;
 }
 showDayQuestInstallHelp();
};
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=20261122-income-type-dialog-v1').then(registration=>{
 console.info('DayQuest offline support is ready:',registration.scope);
}).catch(error=>{
 console.warn('DayQuest offline support could not be registered:',error);
}));
const DAYQUEST_APP_URL='https://rakibhosendj.github.io/dayquest/?register=1';
async function copyDayQuestAppLink(){
 const status=$('shareDayQuestAppLinkStatus');
 try{
  if(navigator.clipboard?.writeText&&window.isSecureContext){
   await navigator.clipboard.writeText(DAYQUEST_APP_URL);
  }else{
   const field=document.createElement('textarea');
   field.value=DAYQUEST_APP_URL;field.setAttribute('readonly','');
   field.style.position='fixed';field.style.left='-9999px';field.style.top='0';
   document.body.appendChild(field);field.select();
   const copied=document.execCommand('copy');field.remove();
   if(!copied)throw new Error('Clipboard copy was not available.');
  }
  if(status)status.textContent='DayQuest app link copied.';
  return true;
 }catch(error){
  console.warn('DayQuest could not copy the app link:',error);
  if(status)status.textContent='Could not copy the DayQuest app link automatically.';
  return false;
 }
}
$('shareDayQuestAppLink').onclick=async()=>{
 const status=$('shareDayQuestAppLinkStatus');
 if(status)status.textContent='';
 if(typeof navigator.share==='function'){
  try{
   await navigator.share({title:'DayQuest',url:DAYQUEST_APP_URL});
   if(status)status.textContent='DayQuest shared successfully.';
  }catch(error){
   if(error?.name==='AbortError')return;
   console.warn('DayQuest share sheet could not be opened:',error);
   await copyDayQuestAppLink();
  }
 }else await copyDayQuestAppLink();
};
$('copyDayQuestAppLink').onclick=copyDayQuestAppLink;
// DayQuest cloud authentication and family-wide data sync.
// The browser contains only the Supabase project URL and publishable/anon key.
// Authorization is enforced by PostgreSQL Row Level Security; never put a service-role key here.
const CLOUD_CONFIG_KEY='dayquest_cloud_config_v1';
const CLOUD_META_KEY='dayquest_cloud_meta_v1';
let supabaseClient=null,cloudUser=null,cloudVersion=0,cloudReady=false,cloudDirty=false,cloudConflict=false,cloudRemoteChanged=false,cloudHydrating=false,cloudPasswordRecovery=false,cloudSyncTimer=null,cloudPollTimer=null,cloudSyncBusy=false,cloudLocalRevision=0,cloudBackupSnapshot=null,cloudStatusHideTimer=null;
function readJsonStore(key,fallback=null){try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}}
function getCloudConfig(){
 const localConfig=readJsonStore(CLOUD_CONFIG_KEY,null);
 // A deployment-wide public configuration is shared by every device. A deliberate
 // per-device override is still available from Cloud connection settings.
 if(localConfig?.override===true&&localConfig.url&&localConfig.key)return localConfig;
 const shared=window.DAYQUEST_CLOUD_CONFIG||{};
 const sharedUrl=String(shared.supabaseUrl||shared.url||'').trim();
 const sharedKey=String(shared.publishableKey||shared.anonKey||shared.key||'').trim();
 if(sharedUrl&&sharedKey)return {url:sharedUrl,key:sharedKey,source:'deployment'};
 return localConfig;
}
function isForbiddenSupabaseKey(value){
 const key=String(value||'').trim();if(!key||/^sb_secret_/i.test(key)||/service_role/i.test(key))return true;
 const parts=key.split('.');if(parts.length===3){try{const payload=parts[1].replace(/-/g,'+').replace(/_/g,'/');const decoded=JSON.parse(atob(payload.padEnd(Math.ceil(payload.length/4)*4,'=')));if(String(decoded.role||'').toLowerCase()==='service_role')return true}catch{}}
 return false;
}
function getCloudMeta(){return readJsonStore(CLOUD_META_KEY,{userId:null,version:0,dirty:false})||{userId:null,version:0,dirty:false}}
function writeCloudMeta(patch={}){const current=getCloudMeta();const next={...current,...patch,updatedAt:new Date().toISOString()};localStorage.setItem(CLOUD_META_KEY,JSON.stringify(next));return next}
function setCloudStatus(message,{conflict=false,remote=false,offline=false,autoHideMs=0}={}){
 clearTimeout(cloudStatusHideTimer);cloudStatusHideTimer=null;
 const updateButton=$('settingsUpdateCloudData');
 if(updateButton)updateButton.hidden=!remote;
 const bar=$('cloudSyncBar');if(!bar)return;
 // New cloud data is announced only in Settings; do not show a persistent banner.
 if(remote&&!conflict){hideCloudStatus();return}
 const important=conflict||offline||/failed|error|not ready|not connected|could not|cannot|cancelled|empty|needs an internet/i.test(String(message));
 if(!important){hideCloudStatus();return;}
 bar.hidden=false;$('cloudStatusText').textContent=message;
 $('cloudLoadLatest').hidden=!conflict;$('cloudDownloadLocal').hidden=true;
 $('cloudSyncNow').disabled=offline||cloudSyncBusy;
 bar.classList.toggle('is-warning',true);
}
function hideCloudStatus(){clearTimeout(cloudStatusHideTimer);cloudStatusHideTimer=null;const bar=$('cloudSyncBar');if(bar)bar.hidden=true}
function downloadJsonFile(value,name){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function localHasRecords(value=db){
 const recordArrays=['expenses','incomes','loans','purchaseBills','supplierPayments','productions','consumptions','guests','quests','quickActions','familyMembers','guestPeople','suppliers','productNames','incomePeople'];
 if(recordArrays.some(key=>Array.isArray(value?.[key])&&value[key].length>0))return true;
 if(value?.checks&&Object.keys(value.checks).length>0)return true;
 const defaultLists={
  expenseNames:['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'],
  purchaseCategories:['Assets','Staples','Fixed Ex.'],
  productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'],
  units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'],
  incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other']
 };
 if(Object.entries(defaultLists).some(([key,defaults])=>Array.isArray(value?.[key])&&JSON.stringify(value[key])!==JSON.stringify(defaults)))return true;
 const profile=value?.profile||{};
 if(['name','phone','familyName','photoData'].some(key=>String(profile[key]||'').trim()))return true;
 if(Number(profile.openingCash||0)!==0||Number(profile.openingBank||0)!==0)return true;
 const settings=value?.settings||{};
 return Object.keys(settings).some(key=>!['themeColor','fontColor','requireSupplierForDuePurchase','allowPurchaseBillEdits'].includes(key));
}
function createEmptyDayQuestDatabase(){
 return {
  expenses:[],quests:[],checks:{},expenseNames:['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'],
  quickActions:[],purchaseCategories:['Assets','Staples','Fixed Ex.'],productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'],
  settings:{themeColor:'#263b5c',fontColor:'#263b5c',quickButtonColor:'#ee7d2f',backgroundColor:'#f3f5f9',sideMenuColor:'#111d30',topBarColor:'#101827',requireSupplierForDuePurchase:true,allowPurchaseBillEdits:true},
  units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'],incomes:[],incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'],incomePeople:[],
  profile:{name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0},familyMembers:[],guestPeople:[],guests:[],
  purchaseBills:[],supplierPayments:[],suppliers:[],productNames:[],consumptions:[],productions:[],loans:[]
 };
}
function makeSupabaseClient(){
 const config=getCloudConfig();if(!config?.url||!config?.key)return null;
 if(!window.supabase?.createClient)throw new Error('The Supabase library could not load. Connect to the internet and reload DayQuest.');
 return window.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'dayquest-supabase-auth-v1'}});
}
function rememberLoginIdentity(email,name=''){
 const identity={email:String(email||'').trim().toLowerCase(),name:String(name||'').trim()};
 if(!identity.email)return;
 try{localStorage.setItem('dayquest_last_login_identity_v1',JSON.stringify(identity))}catch{}
}
function getRememberedLoginIdentity(){
 try{const value=JSON.parse(localStorage.getItem('dayquest_last_login_identity_v1')||'null');return value&&typeof value.email==='string'?value:null}catch{return null}
}
function showAuthView(view,message=''){
 $('authScreen').hidden=false;$('appShell').hidden=true;document.title='Day Quest';hideCloudStatus();lockAdminCloudSettings();
 // Keep login fields directly interactive even after a failed session restore.
 ['loginEmail','loginPassword','signupFamilyName','signupMemberName','signupPhone','signupPhone2','signupCountry','signupDivision','signupDistrict','signupSubDistrict','signupVillage','signupRoad','signupGender','signupReligion','signupBirthDate','signupEmail','signupPassword','signupPasswordConfirm','recoveryPassword','recoveryPasswordConfirm'].forEach(id=>{const field=$(id);if(field){field.disabled=false;field.readOnly=false;field.removeAttribute('aria-disabled');field.style.pointerEvents='auto';field.style.userSelect='text'}});
 ['authSignupView','authLoginView','authResetView'].forEach(id=>$(id).hidden=true);
 // Cloud connection editing is available only after login in Settings → Administrator.
 const target={signup:'authSignupView',login:'authLoginView',reset:'authResetView'}[view]||'authLoginView';$(target).hidden=false;
 if(view==='login'){
  const remembered=getRememberedLoginIdentity();
  if(remembered&&$('loginEmail')&&!$('loginEmail').value)$('loginEmail').value=remembered.email;
 }
 $('authMessage').textContent=message;
}
function startAppSession(user,{offline=false}={}){
 $('authScreen').hidden=true;$('appShell').hidden=false;
 document.querySelectorAll('.side-group').forEach(group=>{group.open=false;group.classList.remove('has-active')});
 const familyName=String(db.profile?.familyName||user?.user_metadata?.family_name||'').trim();
 $('userGreeting').textContent=`Signed in: ${familyName||user?.email||'Family Account'}`;
 refreshAdminCloudConfig();
 if(offline)hideCloudStatus();
 else if(cloudConflict)setCloudStatus('Cloud conflict: another device has newer records. Automatically loading the latest cloud data.',{conflict:true});
 else if(cloudRemoteChanged)setCloudStatus('A newer cloud copy is available from another device.',{remote:true});
 else if(cloudReady)hideCloudStatus();
}
function normalizeCloudDatabase(raw){
 const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 db={...db,...value};
 db.sideMenuOrder=normalizeSideMenuOrder(value.sideMenuOrder??db.sideMenuOrder);
 db.supplierDetails=db.supplierDetails&&typeof db.supplierDetails==='object'&&!Array.isArray(db.supplierDetails)?db.supplierDetails:{};
 db.productDictionary=normalizeProductDictionary(Array.isArray(value.productDictionary)?value.productDictionary:db.productDictionary);
 db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
 if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.quickButtonColor||'')))db.settings.quickButtonColor='#ee7d2f';
 db.expenses=Array.isArray(db.expenses)?db.expenses:[];db.expenses.forEach(x=>{if(!['family','member','unassigned','members'].includes(x.costType))x.costType=x.costMember?'member':'unassigned';x.costMember=String(x.costMember||'').trim();if(x.costType==='member'&&!x.costMember)x.costType='unassigned'});
 db.quests=Array.isArray(db.quests)?db.quests:[];db.checks=db.checks&&typeof db.checks==='object'?db.checks:{};
 db.incomes=Array.isArray(db.incomes)?db.incomes:[];db.quickActions=Array.isArray(db.quickActions)?db.quickActions:[];
 db.loans=Array.isArray(db.loans)?db.loans:[];db.loans.forEach(loan=>{loan.id=String(loan.id||crypto.randomUUID());loan.type=loan.type==='taken'?'taken':'given';loan.amount=Math.max(0,Number(loan.amount)||0);loan.method=loan.method==='Bank'?'Bank':'Cash';loan.date=String(loan.date||'');loan.dueDate=String(loan.dueDate||'');loan.settlements=Array.isArray(loan.settlements)?loan.settlements:[];loan.installmentFrequency=['weekly','fortnightly','monthly'].includes(loan.installmentFrequency)?loan.installmentFrequency:'monthly';loan.installments=Array.isArray(loan.installments)?loan.installments:[];if(!loan.installments.length&&loan.dueDate)loan.installments=[{id:'legacy-'+loan.id,dueDate:loan.dueDate,amount:loan.amount}];loan.installments=loan.installments.map((item,index)=>({id:String(item.id||('installment-'+(index+1)+'-'+loan.id)),dueDate:String(item.dueDate||''),amount:Math.max(0,Number(item.amount)||0)})).filter(item=>item.dueDate&&item.amount>0);if(loan.installments.length)loan.dueDate=loan.installments[loan.installments.length-1].dueDate;loan.installmentCount=Math.max(1,Math.floor(Number(loan.installmentCount)||loan.installments.length||1))});
 db.settings.notificationPreferences={dailyQuest:true,expenseDue:true,incomeDue:true,loanGiven:true,loanTaken:true,enabled:false,...(db.settings.notificationPreferences&&typeof db.settings.notificationPreferences==='object'?db.settings.notificationPreferences:{})};
 db.purchaseBills=Array.isArray(db.purchaseBills)?db.purchaseBills:[];db.supplierPayments=Array.isArray(db.supplierPayments)?db.supplierPayments:[];
 db.suppliers=Array.isArray(db.suppliers)?[...new Set(db.suppliers)]:[];
db.supplierDetails=db.supplierDetails&&typeof db.supplierDetails==='object'&&!Array.isArray(db.supplierDetails)?db.supplierDetails:{};
db.quickSuppliers=Array.isArray(db.quickSuppliers)?[...new Set(db.quickSuppliers.filter(name=>db.suppliers.includes(name)))]:[];db.productNames=Array.isArray(db.productNames)?db.productNames:[];
 db.productTypes=Array.isArray(db.productTypes)&&db.productTypes.length?db.productTypes:['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];
 db.purchaseCategories=Array.isArray(db.purchaseCategories)&&db.purchaseCategories.length?db.purchaseCategories:['Assets','Staples','Fixed Ex.'];
 db.units=Array.isArray(db.units)&&db.units.length?db.units:['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];
 db.expenseNames=Array.isArray(db.expenseNames)?db.expenseNames:['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
 db.incomeHeads=Array.isArray(db.incomeHeads)?db.incomeHeads:['Salary','Business','Sales','Freelance','Rent','Gift','Other'];
 db.incomePeople=Array.isArray(db.incomePeople)?db.incomePeople:[];db.familyMembers=Array.isArray(db.familyMembers)?db.familyMembers.map(n=>String(n||'').trim()).filter(Boolean):[];
 db.guestPeople=Array.isArray(db.guestPeople)?db.guestPeople.map(n=>String(n||'').trim()).filter(Boolean):[];
 db.guests=Array.isArray(db.guests)?db.guests.filter(g=>g&&Array.isArray(g.members)&&g.members.length&&/^\d{4}-\d{2}-\d{2}$/.test(String(g.entryDate||''))):[];
 db.consumptions=Array.isArray(db.consumptions)?db.consumptions:[];db.productions=Array.isArray(db.productions)?db.productions.filter(x=>x&&x.id&&x.product&&Number(x.quantity)>0):[];
 db.profile=db.profile&&typeof db.profile==='object'?db.profile:{name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};
 db.profile.familyName=String(db.profile.familyName||'');db.profile.phone=String(db.profile.phone||'');db.profile.phone2=String(db.profile.phone2||'');db.profile.photoData=typeof db.profile.photoData==='string'&&db.profile.photoData.startsWith('data:image/')?db.profile.photoData:'';
 ['country','division','district','subDistrict','village','road','religion','gender','birthDate'].forEach(field=>db.profile[field]=String(db.profile[field]||''));
 db.memberProfiles=db.memberProfiles&&typeof db.memberProfiles==='object'&&!Array.isArray(db.memberProfiles)?db.memberProfiles:{};
 db.settings=db.settings&&typeof db.settings==='object'?db.settings:{themeColor:'#263b5c'};
 if(!/^#[0-9a-f]{6}$/i.test(String(db.settings.themeColor||'')))db.settings.themeColor='#263b5c';
 if(typeof db.settings.requireSupplierForDuePurchase!=='boolean')db.settings.requireSupplierForDuePurchase=true;
 if(typeof db.settings.allowPurchaseBillEdits!=='boolean')db.settings.allowPurchaseBillEdits=true;
 db.productNames=[...new Map(db.productNames.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([k,v])=>k&&v))].map(([k,v])=>v);
 db.productTypes=[...new Map(db.productTypes.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([k,v])=>k&&v))].map(([k,v])=>v);
 db.units=[...new Map(db.units.map(n=>[String(n||'').trim().toLocaleLowerCase(),String(n||'').trim()]).filter(([k,v])=>k&&v))].map(([k,v])=>v);
 if(db.profile.name&&!db.familyMembers.some(n=>n.toLocaleLowerCase()===db.profile.name.toLocaleLowerCase()))db.familyMembers.unshift(db.profile.name);
 ensureAccountHolderMember();
 db.guests.forEach(g=>{g.id=g.id||crypto.randomUUID();g.members=uniquePeople(g.members);g.outDate=String(g.outDate||'');if(g.outDate&&g.outDate<g.entryDate)g.outDate='';g.purpose=String(g.purpose||'');g.members.forEach(n=>{if(!assignablePeople().some(x=>x.toLocaleLowerCase()===n.toLocaleLowerCase()))db.guestPeople.push(n)})});
 db.supplierPayments.forEach(x=>{if(x.supplier&&!db.suppliers.includes(x.supplier))db.suppliers.push(x.supplier)});
 db.purchaseBills.forEach(b=>{if(b.supplier&&!db.suppliers.includes(b.supplier))db.suppliers.push(b.supplier);(b.lines||[]).forEach(l=>{if(l.product&&!db.productNames.includes(l.product))db.productNames.push(l.product)})});
 db.quickActions=db.quickActions.filter(a=>a&&typeof a==='object'&&String(a.name||'').trim()&&Number(a.rate)>0);
 db.quickActions.forEach(a=>{a.id=String(a.id||crypto.randomUUID());a.name=String(a.name||'').trim();a.type=a.type==='income'?'income':'expense';a.rate=Number(a.rate||0);a.paymentType=a.paymentType==='Bank'?'Bank':'Cash';if(a.type==='income'){a.incomeType=String(a.incomeType||'Other');a.incomeBy=String(a.incomeBy||'Unassigned');if(!db.incomeHeads.includes(a.incomeType))db.incomeHeads.push(a.incomeType);if(!db.incomePeople.includes(a.incomeBy))db.incomePeople.push(a.incomeBy)}else{a.category=String(a.category||'Other');a.costMembers=uniquePeople(a.costMembers||[]);if(!db.expenseNames.some(n=>n.toLocaleLowerCase()===a.name.toLocaleLowerCase()))db.expenseNames.push(a.name)}});
 normalizePurchaseBillNumbers();normalizePurchaseInventory();normalizeMemberAssignments();
 db.familyMembers.forEach(n=>{if(!db.incomePeople.includes(n))db.incomePeople.push(n)});
 db.incomes.forEach(x=>{x.incomeBy=String(x.incomeBy||'Unassigned').trim()||'Unassigned';if(!db.incomePeople.includes(x.incomeBy))db.incomePeople.push(x.incomeBy)});
 if(db.profile.name&&!db.incomePeople.includes(db.profile.name))db.incomePeople.unshift(db.profile.name);if(!db.incomePeople.includes('Unassigned'))db.incomePeople.push('Unassigned');
}
function refreshAfterCloudLoad(){
 try{fillChoices();fillQuickActionOptions();updateQuickActionTypeFields();renderQuickMemberOptions([]);fillProductionOptions();loadProfileForm();applyThemeColor(db.settings.themeColor||'#263b5c',false);applySideMenuColor(db.settings.sideMenuColor||'#111d30',false);applyTopBarColor(db.settings.topBarColor||'#101827',false);renderPurchaseCategorySettings();renderMasterLists();updateAppBrand();render();renderReport()}catch(error){console.error('DayQuest refresh after cloud load failed',error)}
}
function saveCloudMeta(version,dirty){writeCloudMeta({userId:cloudUser?.id||getCloudMeta().userId||null,version:Number(version||0),dirty:!!dirty})}
async function withCloudRequestTimeout(request,ms=20000){
 let timer;
 try{
  return await Promise.race([
   request,
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Cloud request timed out after 20 seconds. Check your internet connection and Supabase availability.')),ms)})
  ]);
 }finally{clearTimeout(timer)}
}
async function fetchCloudRow(){
 const request=supabaseClient.from('dayquest_family_data').select('payload,version,updated_at').eq('user_id',cloudUser.id).maybeSingle();
 const {data,error}=await withCloudRequestTimeout(request);
 if(error)throw error;return data||null;
}
async function fetchCloudVersion(){
 const request=supabaseClient.from('dayquest_family_data').select('version,updated_at').eq('user_id',cloudUser.id).maybeSingle();
 const {data,error}=await withCloudRequestTimeout(request);
 if(error)throw error;return data||null;
}
async function writeCloudSnapshot(payload,expectedVersion){
 // Apply the same hard timeout to the first cloud write as to database reads.
 // Without this, a stalled RPC can leave the login screen on "Loading" forever.
 const {data,error}=await withCloudRequestTimeout(
  supabaseClient.rpc('dayquest_save_family_data',{p_payload:payload,p_expected_version:Number(expectedVersion||0)}),
  20000
 );
 if(error)throw error;const rawVersion=Array.isArray(data)?data[0]?.dayquest_save_family_data??data[0]?.version??data[0]:data?.version??data;const version=Number(rawVersion);if(!Number.isFinite(version)||version<1)throw new Error('The cloud database returned an invalid version. Check the SQL migration and try again.');return version;
}
function queueCloudSave(){
 if(cloudHydrating)return;
 if(!cloudUser)return;
 cloudLocalRevision++;cloudDirty=true;saveCloudMeta(cloudVersion,true);
 if(cloudConflict){setCloudStatus('Cloud conflict: another device has newer records. Download this device copy or load the latest cloud data.',{conflict:true});return}
 if(!cloudReady||!navigator.onLine){hideCloudStatus();return}
 clearTimeout(cloudSyncTimer);hideCloudStatus();cloudSyncTimer=setTimeout(pushCloudData,900);
}
async function pushCloudData(){
 if(!cloudReady||!cloudUser||!navigator.onLine||cloudConflict||cloudSyncBusy)return;
 cloudSyncBusy=true;$('cloudSyncNow').disabled=true;
 const revision=cloudLocalRevision,expected=cloudVersion,payload=JSON.parse(JSON.stringify(db));
 try{
  const nextVersion=await writeCloudSnapshot(payload,expected);cloudVersion=nextVersion;cloudDirty=cloudLocalRevision!==revision;cloudRemoteChanged=false;saveCloudMeta(cloudVersion,cloudDirty);
  hideCloudStatus();
 }catch(error){
  if(/DAYQUEST_VERSION_CONFLICT/i.test(String(error.message||error))){cloudConflict=true;cloudReady=false;saveCloudMeta(cloudVersion,true);setCloudStatus('Another device updated the family records. Download this device copy or load the latest cloud data.',{conflict:true})}
  else{cloudDirty=true;saveCloudMeta(cloudVersion,true);setCloudStatus('Cloud sync failed. Your local changes are saved on this device; tap Sync now when connected.',{offline:!navigator.onLine});console.error('DayQuest cloud save failed',error)}
 }finally{cloudSyncBusy=false;$('cloudSyncNow').disabled=false;if(cloudReady&&cloudDirty&&!cloudConflict){clearTimeout(cloudSyncTimer);cloudSyncTimer=setTimeout(pushCloudData,500)}}
}
function saveLocalSafetyCopy(){cloudBackupSnapshot=JSON.parse(JSON.stringify(db));return cloudBackupSnapshot}
function downloadCurrentLocalCopy(){downloadJsonFile(cloudBackupSnapshot||db,`dayquest-local-copy-${today()}.json`)}
function applyRemoteRow(row,{downloadBackup=false}={}){
 if(downloadBackup)downloadJsonFile(db,`dayquest-before-cloud-restore-${today()}.json`);
 cloudHydrating=true;db=JSON.parse(JSON.stringify(row.payload||{}));normalizeCloudDatabase(db);localStorage.setItem('dayquest_v1',JSON.stringify(db));cloudVersion=Number(row.version||0);cloudDirty=false;cloudConflict=false;cloudRemoteChanged=false;cloudReady=true;saveCloudMeta(cloudVersion,false);cloudHydrating=false;refreshAfterCloudLoad();
}
async function handleCloudConflict(row){
 const baseVersion=Number(getCloudMeta().version||cloudVersion||0);
 if(!row||!row.payload){cloudConflict=true;cloudReady=false;cloudRemoteChanged=false;cloudVersion=baseVersion;saveCloudMeta(baseVersion,true);startAppSession(cloudUser);setCloudStatus('A sync conflict was detected, but the latest cloud data could not be loaded. Tap Load latest cloud data to retry.',{conflict:true});return}
 // Cloud data wins on conflicts: automatically download a safety copy, then replace this device's older/conflicting data.
 saveLocalSafetyCopy();
 applyRemoteRow(row,{downloadBackup:true});
 setCloudStatus('Conflict resolved. Latest cloud data has been synced to this device.',{autoHideMs:2500});
 startAppSession(cloudUser);startCloudPolling();
}
async function connectCloudSession(user,{silent=false}={}){
 cloudUser=user;const meta=getCloudMeta(),sameUser=meta.userId===user.id,linkedToOtherAccount=!!meta.userId&&!sameUser;
 let row=null;
 try{row=await fetchCloudRow()}catch(error){
  const networkFailure=!navigator.onLine||/failed to fetch|networkerror|load failed|timeout|offline/i.test(String(error.message||error));
  if(networkFailure&&sameUser){
   cloudReady=false;cloudVersion=Number(meta.version||0);cloudDirty=!!meta.dirty;
   startAppSession(user,{offline:true});return;
  }
  cloudReady=false;cloudUser=null;
  const message=networkFailure
   ?'This device needs an internet connection for the first sign-in or when switching Family Accounts. Your existing local records have not been changed.'
   :'Cloud Database Preparing......';
  showAuthView('login',message);return;
 }
 const hasLocal=localHasRecords(db);
 if(!hasLocal&&user?.user_metadata){
  const m=user.user_metadata,n=String(m.full_name||'').trim();
  if(n){const d={country:String(m.country||''),district:String(m.district||''),village:String(m.village||''),road:String(m.road||''),religion:String(m.religion||''),gender:String(m.gender||''),birthDate:String(m.birth_date||'')};
   db.profile={...db.profile,name:n,phone:String(m.phone||''),phone2:String(m.phone2||''),familyName:String(m.family_name||''),...d,address:String(m.address||composeMemberAddress(d))};
   db.familyMembers=uniquePeople([n,...db.familyMembers]);db.incomePeople=uniquePeople([n,...db.incomePeople]);db.memberProfiles=db.memberProfiles||{};
   db.memberProfiles[memberProfileKey(n)]={fullName:n,phone:db.profile.phone,phone2:db.profile.phone2,email:String(user.email||''),...d,relation:'',occupation:'',notes:''};
   localStorage.setItem('dayquest_v1',JSON.stringify(db));
  }
 }
 // Never upload one Family Account's cached local data into a different account.
 // This matters on shared computers and when multiple family accounts use one browser.
 if(linkedToOtherAccount&&hasLocal){
  // Switch accounts without showing a backup warning or Continue/Cancel prompt.
  // Preserve the previous account's local records by downloading a safety copy automatically.
  downloadJsonFile(db,`dayquest-previous-family-backup-${today()}.json`);
  if(row){applyRemoteRow(row);startAppSession(user);startCloudPolling();return}
  db=createEmptyDayQuestDatabase();normalizeCloudDatabase(db);localStorage.setItem('dayquest_v1',JSON.stringify(db));
  cloudVersion=0;cloudReady=true;cloudDirty=true;cloudConflict=false;cloudRemoteChanged=false;saveCloudMeta(0,true);
  try{const version=await writeCloudSnapshot(JSON.parse(JSON.stringify(db)),0);cloudVersion=version;cloudDirty=false;saveCloudMeta(version,false);refreshAfterCloudLoad();startAppSession(user);startCloudPolling();return}
  catch(writeError){cloudReady=false;cloudDirty=true;saveCloudMeta(0,true);startAppSession(user,{offline:!navigator.onLine});setCloudStatus('A clean account copy is saved on this device, but the first cloud save failed. Tap Sync now when online.',{offline:!navigator.onLine});console.error(writeError);return}
 }
 if(row){
  const remoteVersion=Number(row.version||0);
  if(sameUser&&meta.dirty){
   cloudVersion=Number(meta.version||0);cloudDirty=true;
   if(remoteVersion!==cloudVersion){await handleCloudConflict(row);return}
   cloudReady=true;try{await pushCloudData()}catch{}startAppSession(user);startCloudPolling();return;
  }
  if(sameUser&&!meta.dirty&&remoteVersion===Number(meta.version||0)){
   cloudVersion=remoteVersion;cloudReady=true;cloudDirty=false;startAppSession(user);startCloudPolling();return;
  }
  if(!sameUser&&hasLocal){
   const remoteHasRecords=localHasRecords(row.payload||{});
   // Preserve this device copy automatically; don't block sign-in with a
   // Continue/Cancel dialog that can leave the login screen waiting.
   downloadJsonFile(db,`dayquest-before-account-sync-${today()}.json`);
   if(!remoteHasRecords){
    cloudReady=true;cloudVersion=remoteVersion;cloudDirty=true;saveCloudMeta(remoteVersion,true);
    try{const nextVersion=await writeCloudSnapshot(JSON.parse(JSON.stringify(db)),remoteVersion);cloudVersion=nextVersion;cloudDirty=false;saveCloudMeta(nextVersion,false);startAppSession(user);startCloudPolling();return}
    catch(writeError){if(/DAYQUEST_VERSION_CONFLICT/i.test(String(writeError.message||writeError))){const latest=await fetchCloudRow();if(latest)await handleCloudConflict(latest);else throw writeError;return}cloudReady=false;startAppSession(user,{offline:!navigator.onLine});setCloudStatus('Could not migrate local records: '+(writeError.message||'cloud write failed'),{offline:!navigator.onLine});return}
   }
   applyRemoteRow(row);startAppSession(user);startCloudPolling();return;
  }
  if(sameUser&&!meta.dirty&&remoteVersion!==Number(meta.version||0)){
   applyRemoteRow(row);startAppSession(user);startCloudPolling();return;
  }
  applyRemoteRow(row);startAppSession(user);startCloudPolling();return;
 }
 // No cloud document exists yet. Only unlinked local data (no previous auth user ID)
 // can be used for first migration. A different account's local data was handled above.
 if(!db.profile.familyName&&user.user_metadata?.family_name)db.profile.familyName=String(user.user_metadata.family_name);
 if(hasLocal){
  // Keep a downloadable safety copy, then migrate the unlinked local records
  // automatically instead of waiting for a modal response during sign-in.
  saveLocalSafetyCopy();
  downloadJsonFile(db,`dayquest-before-first-cloud-upload-${today()}.json`);
 }
 if(!hasLocal&&user.user_metadata?.family_name)db.profile.familyName=String(user.user_metadata.family_name||'');
 cloudReady=true;cloudVersion=0;cloudDirty=true;saveCloudMeta(0,true);
 try{const version=await writeCloudSnapshot(JSON.parse(JSON.stringify(db)),0);cloudVersion=version;cloudDirty=false;cloudReady=true;saveCloudMeta(version,false);localStorage.setItem('dayquest_v1',JSON.stringify(db));startAppSession(user);startCloudPolling()}
 catch(writeError){if(/DAYQUEST_VERSION_CONFLICT/i.test(String(writeError.message||writeError))){const latest=await fetchCloudRow();await handleCloudConflict(latest)}else{cloudReady=false;startAppSession(user,{offline:!navigator.onLine});setCloudStatus('Your records are still saved locally, but the first cloud upload failed. Check cloud setup and tap Sync now.',{offline:!navigator.onLine});console.error(writeError)}}
}

function startCloudPolling(){clearInterval(cloudPollTimer);cloudPollTimer=setInterval(checkCloudForUpdates,20000)}
async function checkCloudForUpdates(){
 if(!cloudUser||!cloudReady||!navigator.onLine||cloudSyncBusy)return;
 try{
  const row=await fetchCloudVersion();if(!row)return;
  const version=Number(row.version||0);
  if(version>cloudVersion){
   if(cloudDirty||getCloudMeta().dirty){
    const fullRow=await fetchCloudRow();if(fullRow)await handleCloudConflict(fullRow);
   }else{
    cloudRemoteChanged=true;
    setCloudStatus('Newer family data is available from another device.',{remote:true});
   }
  }else if(version<=cloudVersion){
   cloudRemoteChanged=false;
   const updateButton=$('settingsUpdateCloudData');if(updateButton)updateButton.hidden=true;
  }
 }catch(error){console.warn('DayQuest cloud check failed',error)}
}
async function loadLatestCloudData(){
 try{
  const row=await fetchCloudRow();if(!row){setCloudStatus('No cloud data row was found.');return}
  if(Number(row.version||0)<=cloudVersion){cloudRemoteChanged=false;$('settingsUpdateCloudData').hidden=true;return}
  // Keep a local safety backup automatically, then load only when the user clicks Update.
  applyRemoteRow(row,{downloadBackup:true});
  $('settingsUpdateCloudData').hidden=true;
  startAppSession(cloudUser);startCloudPolling();
 }catch(error){setCloudStatus('Could not load cloud data: '+(error.message||'connection error'),{conflict:true})}
}
async function manualCloudSync(){
 if(!cloudUser){setCloudStatus('Log in to a Family Account to sync.');return}
 if(!navigator.onLine){setCloudStatus('Offline — changes remain on this device until reconnection.',{offline:true});return}
 if(cloudConflict||cloudRemoteChanged){await loadLatestCloudData();return}
 if(!cloudReady){await connectCloudSession(cloudUser,{silent:true});return}
 if(cloudDirty||getCloudMeta().dirty){await pushCloudData();return}
 await checkCloudForUpdates();if(!cloudRemoteChanged&&!cloudConflict)setCloudStatus('Cloud is up to date · '+new Date().toLocaleTimeString(),{autoHideMs:3000});
}
async function initAuth(){
 // Show a usable screen immediately; never leave both the login and app hidden while
 // the browser restores a Supabase session.
 showAuthView('login','Connecting to your family account…');
 const config=getCloudConfig();
 if(!config?.url||!config?.key){showAuthView('login','DayQuest cloud connection is not configured. Please contact your administrator.');return}
 try{supabaseClient=makeSupabaseClient()}catch(error){showAuthView('login','DayQuest could not start its cloud connection. Please contact your administrator. '+(error.message||''));return}
 if(!supabaseClient){showAuthView('login','DayQuest cloud connection is unavailable. Please contact your administrator.');return}
 supabaseClient.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){cloudPasswordRecovery=true;showAuthView('reset','Enter a new password for your Family Account.')}});
 try{
  const {data,error}=await withCloudRequestTimeout(supabaseClient.auth.getSession(),10000);
  if(error)throw error;
  if(cloudPasswordRecovery){showAuthView('reset','Enter a new password for your Family Account.');return}
  if(data.session){await connectCloudSession(data.session.user);return}
  showAuthView(new URLSearchParams(location.search).get('register')==='1'?'signup':'login');
 }catch(error){
  console.warn('DayQuest session restore failed:',error);
  showAuthView('login','Could not restore your cloud session. Please log in again. '+(error.message||''));
 }
}
function refreshAdminCloudConfig(){
 const config=getCloudConfig()||{};
 $('cloudProjectUrl').value=config.url||'';
 $('cloudPublishableKey').value=config.key||'';
 $('adminCloudConnectionStatus').textContent=config.override
  ?'A browser-specific cloud connection override is active on this device.'
  :config.source==='deployment'
   ?'Using the shared DayQuest deployment connection. All devices use cloud-config.js by default.'
   :'No cloud connection is configured. Ask an administrator to repair the published cloud-config.js file.';
}

function bytesToBase64(bytes){
 let binary='';for(const value of bytes)binary+=String.fromCharCode(value);return btoa(binary);
}
function base64ToBytes(value){
 return Uint8Array.from(atob(value),character=>character.charCodeAt(0));
}
async function deriveAdminPasswordHash(password,salt,iterations=ADMIN_PASSWORD_ITERATIONS){
 if(!window.crypto?.subtle)throw new Error('Secure password protection is unavailable in this browser. Update your browser and try again.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations,hash:'SHA-256'},key,256);
 return new Uint8Array(bits);
}
async function makeAdminPasswordRecord(password){
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const hash=await deriveAdminPasswordHash(password,salt);
 return {version:1,algorithm:'PBKDF2-SHA-256',iterations:ADMIN_PASSWORD_ITERATIONS,salt:bytesToBase64(salt),hash:bytesToBase64(hash)};
}
async function verifyAdminPassword(password,record){
 if(!record||record.algorithm!=='PBKDF2-SHA-256'||!record.salt||!record.hash)return false;
 const actual=await deriveAdminPasswordHash(password,base64ToBytes(record.salt),Math.max(100000,Math.min(600000,Number(record.iterations)||ADMIN_PASSWORD_ITERATIONS)));
 const expected=base64ToBytes(record.hash);
 if(actual.length!==expected.length)return false;
 let difference=0;for(let i=0;i<actual.length;i++)difference|=actual[i]^expected[i];
 return difference===0;
}
function getAdminPasswordRecord(){return db.settings?.adminPasswordRecord||null}
function refreshAdminAccessGate(){
 const configured=!!getAdminPasswordRecord();
 $('adminAccessConfirmRow').hidden=configured;
 $('adminAccessPassword').value='';
 $('adminAccessPassword').minLength=configured?1:10;
 $('adminAccessPassword').autocomplete=configured?'current-password':'new-password';
 $('adminAccessIntro').textContent=configured
  ?'Administrator settings are hidden. Enter the separate administrator password to unlock them.'
  :'First-time setup: the family account owner should create the separate administrator password before other family members use this app.';
 $('adminAccessSubmit').textContent=configured?'Unlock Administrator':'Set Administrator Password';
 $('adminAccessMessage').textContent='';
}
function lockAdminCloudSettings(){
 adminCloudUnlocked=false;
 const panel=$('adminCloudSettings'),gate=$('adminAccessCard'),details=$('adminCloudConnection');
 if(panel)panel.hidden=true;
 if(gate)gate.hidden=true;
 if(details)details.open=false;
 const password=$('adminAccessPassword');if(password)password.value='';
 const confirmPassword=$('adminAccessConfirmPassword');if(confirmPassword)confirmPassword.value='';
}
function revealAdminAccessGate(){
 if(adminCloudUnlocked)return;
 const gate=$('adminAccessCard');if(!gate)return;
 refreshAdminAccessGate();
 gate.hidden=false;
 $('adminAccessPassword').focus({preventScroll:true});
}
let adminAccessTapCount=0,adminAccessTapTimer=null;
function handleAdminAccessGesture(){
 if(adminCloudUnlocked)return;
 adminAccessTapCount++;
 if(adminAccessTapTimer!==null)clearTimeout(adminAccessTapTimer);
 adminAccessTapTimer=setTimeout(()=>{adminAccessTapCount=0;adminAccessTapTimer=null},2500);
 if(adminAccessTapCount>=5){
  adminAccessTapCount=0;clearTimeout(adminAccessTapTimer);adminAccessTapTimer=null;
  revealAdminAccessGate();
 }
}
const settingsAdminTrigger=$('settingsTitle');
if(settingsAdminTrigger){
 settingsAdminTrigger.addEventListener('click',handleAdminAccessGesture);
 settingsAdminTrigger.addEventListener('keydown',event=>{
  if(event.key==='Enter'||event.key===' '){event.preventDefault();handleAdminAccessGesture()}
 });
}
function unlockAdminCloudSettings(){
 adminCloudUnlocked=true;
 $('adminAccessCard').hidden=true;
 $('adminCloudSettings').hidden=false;
 $('adminCloudConnection').open=true;
 refreshAdminCloudConfig();
}
$('adminAccessForm').onsubmit=async e=>{
 e.preventDefault();
 const password=$('adminAccessPassword').value;
 const record=getAdminPasswordRecord();
 const button=$('adminAccessSubmit');button.disabled=true;
 $('adminAccessMessage').textContent='';
 try{
  if(record){
   if(!await verifyAdminPassword(password,record))throw new Error('Incorrect administrator password.');
  }else{
   const confirmation=$('adminAccessConfirmPassword').value;
   if(password.length<10)throw new Error('Use at least 10 characters for the administrator password.');
   if(password!==confirmation)throw new Error('The administrator passwords do not match.');
   db.settings=db.settings&&typeof db.settings==='object'?db.settings:{};
   db.settings.adminPasswordRecord=await makeAdminPasswordRecord(password);
   save();
   $('adminAccessMessage').textContent='Administrator password created and saved with the shared family settings.';
  }
  $('adminAccessPassword').value='';$('adminAccessConfirmPassword').value='';
  unlockAdminCloudSettings();
 }catch(error){$('adminAccessMessage').textContent=error.message||'Could not unlock administrator settings.'}
 finally{button.disabled=false}
};
$('adminLockButton').onclick=()=>lockAdminCloudSettings();
$('adminChangePasswordForm').onsubmit=async e=>{
 e.preventDefault();
 const current=$('adminCurrentPassword').value,newPassword=$('adminNewPassword').value,confirmation=$('adminConfirmNewPassword').value;
 const button=$('adminChangePasswordForm').querySelector('button[type="submit"]');button.disabled=true;
 $('adminChangePasswordMessage').textContent='';
 try{
  if(!adminCloudUnlocked)throw new Error('Unlock Administrator Access first.');
  if(!await verifyAdminPassword(current,getAdminPasswordRecord()))throw new Error('Current administrator password is incorrect.');
  if(newPassword.length<10)throw new Error('Use at least 10 characters for the new password.');
  if(newPassword!==confirmation)throw new Error('The new passwords do not match.');
  db.settings.adminPasswordRecord=await makeAdminPasswordRecord(newPassword);
  save();$('adminChangePasswordForm').reset();
  $('adminChangePasswordMessage').textContent='Administrator password updated.';
 }catch(error){$('adminChangePasswordMessage').textContent=error.message||'Could not update administrator password.'}
 finally{button.disabled=false}
};
$('cloudConfigForm').onsubmit=async e=>{
 e.preventDefault();const url=$('cloudProjectUrl').value.trim().replace(/\/+$/,''),key=$('cloudPublishableKey').value.trim();
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'&&parsed.hostname!=='localhost')throw new Error('Use your HTTPS Supabase project URL.');
  if(isForbiddenSupabaseKey(key))throw new Error('Use the public publishable key or legacy anon key only. Secret and service-role keys are blocked for safety.');
  if(!confirm('Save a cloud connection override for this browser? This will sign out and reload DayQuest.'))return;
  localStorage.setItem(CLOUD_CONFIG_KEY,JSON.stringify({url,key,override:true}));
  try{await supabaseClient?.auth.signOut()}catch(error){console.warn('Could not sign out before applying the new cloud connection.',error)}
  location.reload();
 }catch(error){$('adminCloudConfigMessage').textContent=error.message||'Enter a valid Supabase project URL and public key.'}
};
$('useSharedCloudConfig').onclick=async()=>{
 if(!confirm('Remove this browser’s cloud override and use the shared cloud-config.js settings? DayQuest will sign out and reload.'))return;
 localStorage.removeItem(CLOUD_CONFIG_KEY);
 try{await supabaseClient?.auth.signOut()}catch(error){console.warn('Could not sign out before restoring shared cloud settings.',error)}
 location.reload();
};
$('authSignupForm').onsubmit=async e=>{
 e.preventDefault();if(!supabaseClient){$('authMessage').textContent='Cloud connection unavailable. Please contact your DayQuest administrator.';return}
 const familyName=$('signupFamilyName').value.trim(),memberName=$('signupMemberName').value.trim(),phone=$('signupPhone').value.trim(),phone2=$('signupPhone2').value.trim(),country=$('signupCountry').value.trim(),division=$('signupDivision').value.trim(),district=$('signupDistrict').value.trim(),subDistrict=$('signupSubDistrict').value.trim(),village=$('signupVillage').value.trim(),road=$('signupRoad').value.trim(),religion=$('signupReligion').value.trim(),gender=$('signupGender').value,birthDate=$('signupBirthDate').value,email=$('signupEmail').value.trim().toLowerCase(),password=$('signupPassword').value,confirmPassword=$('signupPasswordConfirm').value;
 const address=composeMemberAddress({country,division,district,subDistrict,village,road});
 if(!familyName||!memberName||!country||!division||!district||!village){$('authMessage').textContent='Enter the family name, account holder name, country, division, district and village.';return}if(password.length<8){$('authMessage').textContent='Use a password with at least 8 characters.';return}if(password!==confirmPassword){$('authMessage').textContent='The passwords do not match.';return}
 const button=$('authSignupForm').querySelector('button[type="submit"]');button.disabled=true;$('authMessage').textContent='Creating your Family Account…';
 try{
  const metadata={family_name:familyName,full_name:memberName,phone,phone2,address,country,division,district,sub_district:subDistrict,village,road,religion,gender,birth_date:birthDate};
  rememberLoginIdentity(email,memberName);
  const {data,error}=await supabaseClient.auth.signUp({email,password,options:{emailRedirectTo:location.href.split('#')[0],data:metadata}});if(error)throw error;
  db.profile={...db.profile,name:memberName,phone,phone2,address,country,division,district,subDistrict,village,road,religion,gender,birthDate,familyName};
  db.familyMembers=uniquePeople([memberName,...db.familyMembers]);db.incomePeople=uniquePeople([memberName,...db.incomePeople]);
  db.memberProfiles=db.memberProfiles&&typeof db.memberProfiles==='object'?db.memberProfiles:{};
  db.memberProfiles[memberProfileKey(memberName)]={fullName:memberName,phone,phone2,email,gender,religion,birthDate,relation:'',occupation:'',country,division,district,subDistrict,village,road,notes:''};
  localSaveOnly();$('signupPassword').value='';$('signupPasswordConfirm').value='';
  if(data.session){await connectCloudSession(data.user||data.session.user)}else{showAuthView('login','Account created. Check your email for the confirmation link, then log in here.')}
 }
 catch(error){$('authMessage').textContent=error.message||'Could not create the Family Account.'}
 finally{button.disabled=false}
};
$('authLoginForm').onsubmit=async e=>{
 e.preventDefault();if(!supabaseClient){$('authMessage').textContent='Cloud Database Preparing......';return}
 const email=$('loginEmail').value.trim().toLowerCase(),password=$('loginPassword').value,button=$('authLoginForm').querySelector('button[type="submit"]');button.disabled=true;$('authMessage').textContent='Signing in…';
 try{const {data,error}=await withCloudRequestTimeout(supabaseClient.auth.signInWithPassword({email,password}),20000);if(error)throw error;rememberLoginIdentity(email,data.user?.user_metadata?.full_name||'');$('loginPassword').value='';$('authMessage').textContent='Signed in. Loading your family data…';await connectCloudSession(data.user||data.session.user)}
 catch(error){
  const code=String(error.code||'').toLowerCase(),message=String(error.message||'');
  const accountMissing=['user_not_found','email_not_found','account_not_found'].includes(code)||/user (does not exist|not found)|email (does not exist|not found)|account not found|not registered/i.test(message);
  if(accountMissing){$('signupEmail').value=email;showAuthView('signup','No registered Family Account was found for this email. Please create your Family Account.')}
  else{
   const connectionProblem=/fetch failed|failed to fetch|network|timeout|503|502|500|database|server error|temporarily unavailable/i.test(message)||!navigator.onLine;
   const text=connectionProblem?'Cloud Database Preparing......':(code==='invalid_credentials'?'Email or password is incorrect. If you have not registered yet, select Create Family Account.':(message||'Unable to log in. Please try again.'));
   $('authMessage').textContent=text;
   
  }
 }
 finally{button.disabled=false}
};
$('showLoginFromSignup').onclick=()=>showAuthView('login');$('showSignupFromLogin').onclick=()=>showAuthView('signup');
$('forgotCloudPassword').onclick=async()=>{
 const email=$('loginEmail').value.trim().toLowerCase();if(!email){$('authMessage').textContent='Enter your email address first.';return}
 try{const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:location.href.split('#')[0]});if(error)throw error;$('authMessage').textContent='If this email belongs to an account, a password reset link has been sent.'}
 catch(error){$('authMessage').textContent=error.message||'Could not request a password reset.'}
};
$('authResetForm').onsubmit=async e=>{
 e.preventDefault();const password=$('recoveryPassword').value,confirmPassword=$('recoveryPasswordConfirm').value;if(password.length<8){$('authMessage').textContent='Use at least 8 characters.';return}if(password!==confirmPassword){$('authMessage').textContent='The passwords do not match.';return}
 try{const {error}=await supabaseClient.auth.updateUser({password});if(error)throw error;await supabaseClient.auth.signOut();cloudPasswordRecovery=false;$('recoveryPassword').value='';$('recoveryPasswordConfirm').value='';showAuthView('login','Password updated. Log in with your new password.')}
 catch(error){$('authMessage').textContent=error.message||'Could not update the password.'}
};
$('loginPasswordChangeForm').onsubmit=async e=>{
 e.preventDefault();
 const currentPassword=$('loginCurrentPassword').value,newPassword=$('loginNewPassword').value,confirmation=$('loginConfirmNewPassword').value;
 const button=$('loginPasswordChangeSubmit'),message=$('loginPasswordChangeMessage');
 message.textContent='';
 if(!supabaseClient||!cloudUser){message.textContent='Sign in to your Family Account before changing its login password.';return}
 if(!navigator.onLine){message.textContent='Connect to the internet before changing your login password.';return}
 if(newPassword.length<8){message.textContent='Use at least 8 characters for the new password.';return}
 if(newPassword!==confirmation){message.textContent='The new passwords do not match.';return}
 const email=String(cloudUser.email||'').trim().toLowerCase();
 if(!email){message.textContent='The signed-in account email is unavailable. Please log out and log in again.';return}
 button.disabled=true;button.textContent='Updating password…';
 try{
  const {data:loginData,error:loginError}=await supabaseClient.auth.signInWithPassword({email,password:currentPassword});
  if(loginError)throw new Error('Current login password is incorrect.');
  if(loginData?.user?.id!==cloudUser.id)throw new Error('The login confirmation did not match this Family Account.');
  cloudUser=loginData.user;
  const {error:updateError}=await supabaseClient.auth.updateUser({password:newPassword});
  if(updateError)throw updateError;
  $('loginPasswordChangeForm').reset();
  message.textContent='Login password changed successfully. You can use the new password on your other devices.';
 }catch(error){
  message.textContent=error.message||'Could not change the login password. Please try again.';
 }finally{
  button.disabled=false;button.textContent='Change Login Password';
 }
};
function clearExpenseIncomeRecords(){
 const salesMemoIds=new Set(db.incomes.filter(item=>item.salesMemo).map(item=>String(item.id)));
 db.expenses=[];db.incomes=[];
 if(Array.isArray(db.consumptions)&&salesMemoIds.size)db.consumptions=db.consumptions.filter(item=>!salesMemoIds.has(String(item.salesMemoId||'')));
}
function clearGuestRecords(){
 const guestNames=new Set([...db.guestPeople,...db.guests.flatMap(item=>item.members||[])].map(mealPersonKey));
 db.guestPeople=[];db.guests=[];
 db.mealPlan.guestAssignments={};db.mealPlan.guestChecks={};db.mealPlan.guestStatus={};
 guestNames.forEach(key=>{if(db.mealPlan.personDates)delete db.mealPlan.personDates[key]});
}
function clearFamilyMemberRecords(){
 const memberNames=db.familyMembers.slice(),memberKeys=new Set(memberNames.map(mealPersonKey));
 db.familyMembers=[];
 db.incomePeople=db.incomePeople.filter(name=>!memberKeys.has(mealPersonKey(name)));
 ['memberStatus','memberCounts','memberChecks'].forEach(key=>{
  const days=db.mealPlan[key]||{};
  Object.values(days).forEach(day=>memberNames.forEach(name=>{delete day[name]}));
 });
 Object.entries(db.mealPlan.guestAssignments||{}).forEach(([guest,names])=>{
  const remaining=(names||[]).filter(name=>!memberKeys.has(mealPersonKey(name)));
  if(remaining.length)db.mealPlan.guestAssignments[guest]=remaining;else delete db.mealPlan.guestAssignments[guest];
 });
 memberKeys.forEach(key=>{if(db.mealPlan.personDates)delete db.mealPlan.personDates[key]});
}
function applyProfileDeleteSelection(groups){
 // Reports are generated from records, so clearing Reports also clears every data group that feeds report totals.
 if(groups.has('reports'))['transactions','purchases','inventory','production','guests','members','meals','quests','budgets','loans'].forEach(group=>groups.add(group));
 if(groups.has('loans'))db.loans=[];
 // Profile details are always part of Delete Profile.
 db.profile={name:'',phone:'',familyName:'',photoData:'',openingCash:0,openingBank:0};
 if(groups.has('transactions'))clearExpenseIncomeRecords();
 if(groups.has('purchases')){
  const billIds=new Set(db.purchaseBills.map(bill=>String(bill.id)));
  db.purchaseBills=[];db.supplierPayments=[];db.suppliers=[];db.supplierDetails={};db.quickSuppliers=[];
  db.consumptions=db.consumptions.filter(item=>!billIds.has(String(item.billId||'')));
 }
 if(groups.has('inventory'))db.consumptions=[];
 if(groups.has('production')){
  const productionIds=new Set(db.productions.map(item=>String(item.id)));
  db.productions=[];
  db.consumptions=db.consumptions.filter(item=>!productionIds.has(String(item.productionId||''))&&!productionIds.has(String(item.billId||'').replace(/^production:/,'')));
 }
 if(groups.has('guests'))clearGuestRecords();
 if(groups.has('members'))clearFamilyMemberRecords();
 if(groups.has('meals'))db.mealPlan={defaultCount:3,dateCounts:{},memberStatus:{},memberCounts:{},memberChecks:{},personDates:{},guestStatus:{},guestAssignments:{},guestChecks:{},costPerMeal:0};
 if(groups.has('quests')){db.quests=[];db.checks={};}
 if(groups.has('budgets'))db.budgetPlans={};
 if(groups.has('lists')){
  db.productNames=[];
  db.productDictionary=DEFAULT_PRODUCT_DICTIONARY.map(item=>({...item,meal:true}));
  db.expenseNames=['Groceries','Meal','Transport','Fuel','Rent','Electricity','Internet','Medicine','Shopping','Other'];
  db.incomeHeads=['Salary','Business','Sales','Freelance','Rent','Gift','Other'];
  db.purchaseCategories=['Assets','Staples','Fixed Ex.'];
  db.productTypes=['Food & Grocery','Medicine','Household','Personal Care','Clothing','Education','Utilities','Other'];
  db.units=['pcs','kg','g','litre','ml','hour','day','packet','box','trip','month'];
 }
 if(groups.has('quickButtons'))db.quickActions=[];
 if(groups.has('purchases')||groups.has('inventory')||groups.has('production'))recalculateProductionCostsFromInventory();
 $('profilePhotoInput').value='';
 loadProfileForm();fillChoices();renderPurchaseCategorySettings();renderMasterLists();renderProductDictionary();renderQuickMemberOptions([]);fillQuickActionOptions();
 save();
}
$('deleteProfileBtn').onclick=()=>{
 const dialog=$('deleteProfileDialog');
 if(!dialog||typeof dialog.showModal!=='function'){alert('DayQuest could not open the Delete Profile options. Please update your browser and try again.');return}
 dialog.querySelectorAll('[data-delete-group]').forEach(input=>input.checked=false);
 dialog.showModal();
};
$('deleteProfileCancel').onclick=()=>{$('deleteProfileDialog').close()};
$('confirmDeleteProfile').onclick=async()=>{
 const dialog=$('deleteProfileDialog'),button=$('confirmDeleteProfile');
 const groups=new Set([...dialog.querySelectorAll('[data-delete-group]:checked')].map(input=>input.dataset.deleteGroup));
 const labels=['Profile details',...Array.from(dialog.querySelectorAll('[data-delete-group]:checked')).map(input=>input.closest('label')?.querySelector('strong')?.textContent||input.dataset.deleteGroup)];
 const confirmed=await window.dayQuestConfirm('DayQuest will permanently delete the following selected data:\n\n'+labels.join('\n')+'\n\nReports will update from the remaining records. This action cannot be undone. Continue?');
 if(!confirmed)return;
 button.disabled=true;
 try{
  applyProfileDeleteSelection(groups);
  dialog.close();
  alert('DayQuest deleted the selected data. Any data you did not select has been kept.');
 }catch(error){
  console.error('DayQuest profile data deletion failed',error);
  alert('DayQuest could not complete the selected deletion. Your account login has not been deleted. Please check your data and try again.');
 }finally{button.disabled=false}
};
$('clearAllExpensesIncomeBtn').onclick=async()=>{
 const confirmed=await window.dayQuestConfirm('DayQuest will permanently clear all expense and income transactions, including Quick Expenses history, due balances, collections and sales memo entries. Quick button settings, family members, purchases, inventory, production and profile will remain. Continue?');
 if(!confirmed)return;
 clearExpenseIncomeRecords();save();
 alert('DayQuest cleared all expense and income transactions. Your quick button settings and other saved data remain.');
};
function requestDeleteAccountPassword(){
 const dialog=$('deleteAccountPasswordDialog'),input=$('deleteAccountPassword'),confirmButton=$('deleteAccountPasswordConfirm'),cancelButton=$('deleteAccountPasswordCancel');
 if(!dialog||typeof dialog.showModal!=='function')return Promise.resolve(window.prompt('DayQuest: Enter your current Family Account password to confirm permanent deletion:'));
 input.value='';
 return new Promise(resolve=>{
  let finished=false;
  const finish=value=>{
   if(finished)return;finished=true;
   dialog.close();confirmButton.removeEventListener('click',accept);cancelButton.removeEventListener('click',cancel);input.removeEventListener('keydown',onKey);dialog.removeEventListener('cancel',onCancel);
   resolve(value);
  };
  const accept=()=>finish(input.value),cancel=()=>finish(null),onKey=event=>{if(event.key==='Enter'){event.preventDefault();accept()}},onCancel=event=>{event.preventDefault();cancel()};
  confirmButton.addEventListener('click',accept);cancelButton.addEventListener('click',cancel);input.addEventListener('keydown',onKey);dialog.addEventListener('cancel',onCancel);
  dialog.showModal();input.focus();
 });
}
$('deleteAccountBtn').onclick=async()=>{
 if(!supabaseClient||!cloudUser||!navigator.onLine){alert('Connect to the internet and sign in to your Family Account before deleting it.');return}
 if(!await window.dayQuestConfirm('Permanently delete this DayQuest Family Account? This removes the account login and its cloud access for every family member using this shared account. This action cannot be undone. Export a backup first if you need to keep a copy.'))return;
 const password=await requestDeleteAccountPassword();
 if(password===null)return;
 if(!String(password).trim()){alert('DayQuest requires your Family Account password. The account was not deleted.');return}
 const button=$('deleteAccountBtn');button.disabled=true;button.textContent='Deleting account…';
 try{
  const email=String(cloudUser.email||'').trim();
  if(!email)throw new Error('The signed-in Family Account email could not be verified.');
  const {data:verified,error:verifyError}=await supabaseClient.auth.signInWithPassword({email,password});
  if(verifyError)throw verifyError;
  if(verified.user?.id!==cloudUser.id)throw new Error('The confirmed login does not match this Family Account.');
  const {data,error}=await supabaseClient.functions.invoke('delete-account');
  if(error)throw error;
  if(data?.success!==true)throw new Error(data?.error||'The server did not confirm account deletion.');
  clearInterval(cloudPollTimer);clearTimeout(cloudSyncTimer);clearTimeout(cloudStatusHideTimer);
  try{await supabaseClient.auth.signOut({scope:'local'})}catch{}
  localStorage.removeItem('dayquest_v1');localStorage.removeItem(CLOUD_META_KEY);localStorage.removeItem('dayquest-supabase-auth-v1');
  cloudReady=false;cloudUser=null;cloudDirty=false;cloudConflict=false;cloudRemoteChanged=false;cloudVersion=0;
  db=createEmptyDayQuestDatabase();showAuthView('login','Your DayQuest Family Account has been permanently deleted.');
 }catch(error){
  console.error('DayQuest account deletion failed',error);
  const detail=String(error?.message||error||'');
  const networkFailure=/failed to send a request|failed to fetch|networkerror|load failed/i.test(detail);
  alert(networkFailure
   ? 'DayQuest could not connect to the Supabase delete-account function. It may not be deployed yet. Please deploy the delete-account Edge Function in Supabase, then try again.'
   : 'Account deletion failed: '+(detail||'Please check the Supabase function settings and try again.'));
 }finally{
  button.disabled=false;button.textContent='Permanently Delete Account';
 }
};
$('logoutBtn').onclick=async()=>{
 try{if(supabaseClient)await supabaseClient.auth.signOut()}catch(error){console.error('Cloud sign out failed',error)}
 cloudReady=false;cloudUser=null;cloudDirty=false;cloudConflict=false;cloudRemoteChanged=false;clearInterval(cloudPollTimer);hideCloudStatus();$('loginPassword').value='';showAuthView('login','You have been logged out. Your local family data remains saved on this device.')
};
$('cloudSyncNow').onclick=manualCloudSync;$('cloudLoadLatest').onclick=loadLatestCloudData;$('settingsUpdateCloudData').onclick=loadLatestCloudData;$('cloudDownloadLocal').onclick=downloadCurrentLocalCopy;
window.addEventListener('online',async()=>{if(!cloudUser)return;if(cloudConflict)return;const meta=getCloudMeta();if(!cloudReady){await connectCloudSession(cloudUser,{silent:true});return}if(meta.dirty||cloudDirty){cloudReady=true;pushCloudData()}else checkCloudForUpdates()});
window.addEventListener('offline',()=>{if(cloudUser)hideCloudStatus()});

// DayQuest-owned alert dialog and branded native confirmation/input dialogs.
function notificationPrefs(){
 const value=db.settings.notificationPreferences&&typeof db.settings.notificationPreferences==='object'?db.settings.notificationPreferences:{};
 return {dailyQuest:value.dailyQuest!==false,expenseDue:value.expenseDue!==false,incomeDue:value.incomeDue!==false,loanGiven:value.loanGiven!==false,loanTaken:value.loanTaken!==false,enabled:value.enabled===true,timeZone:value.timeZone||Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Dhaka'};
}
function renderNotificationSettings(){
 const prefs=notificationPrefs();
 $('notifyDailyQuest').checked=prefs.dailyQuest;$('notifyExpenseDue').checked=prefs.expenseDue;$('notifyIncomeDue').checked=prefs.incomeDue;
 $('notifyLoanGiven').checked=prefs.loanGiven;$('notifyLoanTaken').checked=prefs.loanTaken;
 const available='Notification' in window;
 const permission=available?Notification.permission:'unsupported';
 $('notificationPermissionStatus').textContent=permission==='granted'
  ?(prefs.enabled?'Background notifications are enabled on this device for your selected reminder categories.':'')
  :permission==='denied'?'Notifications are blocked in browser settings. Allow DayQuest notifications in your browser settings.'
  :permission==='unsupported'?'This browser does not support notifications.'
  :'';
 $('enableDayQuestNotifications').disabled=!available;$('disableDayQuestNotifications').disabled=!available;
}
function saveNotificationPreferences(){
 db.settings.notificationPreferences={...notificationPrefs(),dailyQuest:$('notifyDailyQuest').checked,expenseDue:$('notifyExpenseDue').checked,incomeDue:$('notifyIncomeDue').checked,loanGiven:$('notifyLoanGiven').checked,loanTaken:$('notifyLoanTaken').checked,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Dhaka'};
 localSaveOnly();renderNotificationSettings();syncNotificationSubscriptionPreferences();
}
async function syncNotificationSubscriptionPreferences(){
 if(!navigator.onLine||!cloudUser||!notificationPrefs().enabled)return;
 try{
  const registration=await navigator.serviceWorker.ready,subscription=await registration.pushManager.getSubscription();
  if(subscription)await saveNotificationSubscription(subscription);
 }catch(error){console.warn('DayQuest could not refresh notification preferences on the push service:',error)}
}
function urlBase64ToUint8Array(value){
 const padding='='.repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64);
 return Uint8Array.from([...raw].map(char=>char.charCodeAt(0)));
}
async function saveNotificationSubscription(subscription,removeEndpoint=subscription?.endpoint||null){
 if(!supabaseClient||!cloudUser)throw new Error('Sign in to your DayQuest Family Account first.');
 const {error}=await supabaseClient.functions.invoke('save-notification-subscription',{body:{subscription:subscription?subscription.toJSON():null,endpoint:subscription?.endpoint||removeEndpoint||null,preferences:notificationPrefs()}});
 if(error)throw error;
}
['notifyDailyQuest','notifyExpenseDue','notifyIncomeDue','notifyLoanGiven','notifyLoanTaken'].forEach(id=>$(id).addEventListener('change',saveNotificationPreferences));
$('enableDayQuestNotifications').onclick=async()=>{
 if(!('Notification' in window)||!('serviceWorker' in navigator)||!('PushManager' in window)){alert('This browser does not support background push notifications.');return}
 if(!navigator.onLine||!supabaseClient||!cloudUser){alert('Connect to the internet and sign in to DayQuest before enabling background notifications.');return}
 const config=window.DAYQUEST_CLOUD_CONFIG||{},publicKey=String(config.vapidPublicKey||'').trim();
 if(!publicKey){alert('The DayQuest administrator must add the VAPID public key to the shared cloud configuration and configure the matching private key in Supabase before background notifications can be enabled.');renderNotificationSettings();return}
 try{
  const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
  if(permission!=='granted'){alert('Notification permission was not granted. You can change this in your browser settings.');renderNotificationSettings();return}
  const registration=await navigator.serviceWorker.ready;
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(publicKey)});
  db.settings.notificationPreferences={...notificationPrefs(),enabled:true};
  await saveNotificationSubscription(subscription);
  localSaveOnly();renderNotificationSettings();
  alert('DayQuest background notifications are enabled on this device for the selected reminders.');
 }catch(error){console.error('DayQuest push subscription failed',error);alert('DayQuest could not enable background notifications. Check that the push-notification database and Edge Function have been deployed, then try again.')}
};
$('disableDayQuestNotifications').onclick=async()=>{
 try{
  const registration=await navigator.serviceWorker?.getRegistration(),subscription=await registration?.pushManager?.getSubscription();
  if(subscription){await saveNotificationSubscription(null,subscription.endpoint);await subscription.unsubscribe()}
  db.settings.notificationPreferences={...notificationPrefs(),enabled:false};localSaveOnly();renderNotificationSettings();
  alert('DayQuest notifications are disabled on this device.');
 }catch(error){console.error('DayQuest push unsubscribe failed',error);alert('DayQuest could not update the notification subscription. Try again while online.')}
};
function installDayQuestMessageAlerts(){
 const dialog=$('dqMessageDialog'),title=$('dqMessageTitle'),message=$('dqMessageText'),ok=$('dqMessageOk');
 const nativeAlert=window.alert.bind(window),nativeConfirm=window.confirm.bind(window),nativePrompt=window.prompt.bind(window);
 const cleanMessage=value=>String(value??'')
  .replace(/\[[^\]]*\]\((?:https?:\/\/|www\.)[^)]+\)/gi,'')
  .replace(/\b(?:https?:\/\/|www\.)[^\s<>"']+/gi,'')
  .replace(/\b(?:github\.com|github\.io)(?:\/[^\s<>"']*)?/gi,'')
  .replace(/[ \t]{2,}/g,' ').trim();
 const withAppTitle=(callback,args)=>{
  const previousTitle=document.title;
  document.title='Day Quest';
  try{return callback(...args)}finally{document.title=previousTitle}
 };
 // Alerts use the in-app dialog. Message content is plain text, never HTML or a link.
 if(dialog&&title&&message&&ok){
  let queue=Promise.resolve();
  window.alert=value=>{
   const safeText=cleanMessage(value);
   queue=queue.then(()=>new Promise(resolve=>{
    title.textContent='DayQuest';
    message.textContent=safeText;
    ok.textContent='OK';
    $('dqMessageCancel').hidden=true;
    let finished=false;
    const done=()=>{
     if(finished)return;finished=true;
     dialog.close();ok.removeEventListener('click',done);resolve();
    };
    ok.addEventListener('click',done);
    dialog.addEventListener('cancel',event=>{event.preventDefault();done()},{once:true});
    dialog.showModal();
   })).catch(()=>withAppTitle(nativeAlert,[safeText]));
  };
 }else{
  window.alert=value=>withAppTitle(nativeAlert,[cleanMessage(value)]);
 }
 // Keep synchronous return values for existing app workflows while branding browser dialogs.
 window.dayQuestConfirm=messageText=>{
  const safeText=cleanMessage(messageText),cancel=$('dqMessageCancel');
  if(!(dialog&&title&&message&&ok&&cancel&&typeof dialog.showModal==='function'))return Promise.resolve(withAppTitle(nativeConfirm,[safeText]));
  return new Promise(resolve=>{
   title.textContent='DayQuest';
   message.textContent=safeText;
   ok.textContent='Continue';
   cancel.textContent='Cancel';
   cancel.hidden=false;
   let finished=false;
   const done=value=>{
    if(finished)return;finished=true;
    dialog.close();
    ok.removeEventListener('click',accept);
    cancel.removeEventListener('click',reject);
    dialog.removeEventListener('cancel',onCancel);
    cancel.hidden=true;ok.textContent='OK';
    resolve(value);
   };
   const accept=()=>done(true),reject=()=>done(false);
   const onCancel=event=>{event.preventDefault();reject()};
   ok.addEventListener('click',accept);
   cancel.addEventListener('click',reject);
   dialog.addEventListener('cancel',onCancel);
   dialog.showModal();
  });
 };
 window.confirm=messageText=>withAppTitle(nativeConfirm,[cleanMessage(messageText)]);
 window.prompt=function(messageText,defaultValue){
  const args=arguments.length>1?[cleanMessage(messageText),defaultValue]:[cleanMessage(messageText)];
  return withAppTitle(nativePrompt,args);
 };
}
installDayQuestMessageAlerts();
const nativeDayQuestAlert=window.alert;
window.alert=value=>{
 const action=pendingSaveAction,text=String(value??'');
 if(action?.saved&&/saved|updated|added|created|removed|deleted|recorded|completed|success/i.test(text)){action.noticeShown=true;pendingSaveAction=null}
 return nativeDayQuestAlert(value);
};
function trackSaveUpdateButton(button){
 if(!button)return;const label=String(button.textContent||button.getAttribute('aria-label')||'').trim();
 if(!/^(save|update)\b/i.test(label))return;
 if(pendingSaveAction&&Date.now()-pendingSaveAction.time<1000)return;
 pendingSaveAction={label,time:Date.now(),saved:false,noticeShown:false};
 setTimeout(()=>{if(pendingSaveAction&&Date.now()-pendingSaveAction.time>20000)pendingSaveAction=null},21000);
}
document.addEventListener('click',event=>trackSaveUpdateButton(event.target.closest('button')),true);
document.addEventListener('submit',event=>trackSaveUpdateButton(event.submitter),true);
updatePageBalanceTitle('home');
setupDQDateDisplays();
const reportToday=today();$('productReportFromDate').value=reportToday.slice(0,7)+'-01';$('productReportToDate').value=reportToday;fillChoices();loadProfileForm();calcTotal();$('dueFields').hidden=true;$('duePaidFromField').hidden=true;$('incomeDueFields').hidden=true;$('salesMemoWrap').hidden=true;resetSalesMemoForm();$('expenseDueActionForm').hidden=true;$('incomeCollectForm').hidden=true;$('incomeTotalPreview').textContent=money(0);render();initAuth();
