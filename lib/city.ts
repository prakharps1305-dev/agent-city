export const dimensions = [
  { id:'value', name:'Usefulness', question:'Does this solve a meaningful problem?', icon:'◎' },
  { id:'price', name:'Price & value', question:'Is the exchange worthwhile?', icon:'◈' },
  { id:'onboarding', name:'Getting started', question:'Can someone reach the first useful moment?', icon:'↗' },
  { id:'routine', name:'Everyday fit', question:'Does it fit the way someone actually lives?', icon:'◷' },
  { id:'trust', name:'Trust & control', question:'What must someone give up or believe?', icon:'◇' },
  { id:'access', name:'Accessibility', question:'Who might be unable to use this?', icon:'⊞' },
] as const;
export type Dimension = typeof dimensions[number]['id'];
export type Reaction = 'friction'|'opportunity'|'uncertain'|'neutral';
export type Persona = { id:string; name:string; age:number; role:string; archetype:string; color:string; initials:string; context:string; priority:string; constraint:string; spending:string };
export const personas:Persona[] = [
 {id:'maya',name:'Maya',age:40,role:'Shopkeeper & grandmother',archetype:'The household organiser',color:'#e4b3a2',initials:'MA',context:'Runs a small clothing shop and helps raise her granddaughter. Shares household decisions with her adult daughter. Uses WhatsApp and digital payments confidently.',priority:'Keeping a multigenerational household coordinated while preserving everyone’s preferences.',constraint:'Interrupted attention, shared purchases and multiple people affected by one decision.',spending:'Comfortably spends up to ₹500 per month on a household tool if it benefits several family members. No financial hardship is specified.'},
 {id:'arjun',name:'Arjun',age:21,role:'Working student',archetype:'The resourceful improviser',color:'#c9beed',initials:'AR',context:'Studies during the day and works café shifts. Rents with roommates, has an Android phone and a limited monthly discretionary budget.',priority:'Getting a useful result quickly without another recurring commitment.',constraint:'Unpredictable schedule, tight budget and shared space.',spending:'Has ₹600 per month for all optional apps and entertainment combined. Prefers a free tier or a one-time purchase.'},
 {id:'leah',name:'Leah',age:32,role:'Independent designer',archetype:'The selective early adopter',color:'#ebce89',initials:'LE',context:'Freelances for several clients, tries new tools and pays for those that save measurable time. Likes personalising workflows.',priority:'Creative control and a result she can adapt or export.',constraint:'Subscription fatigue and client deadlines.',spending:'Can comfortably pay ₹1000 per month for a personal convenience tool if its benefit is clear. Dislikes managing many subscriptions, rather than being unable to afford them.'},
 {id:'dev',name:'Dev',age:35,role:'Privacy engineer',archetype:'The considered sceptic',color:'#afcebd',initials:'DE',context:'Enjoys useful automation but inspects permissions. Keeps work and personal information separate. Comfortable with technical setup.',priority:'Data minimisation, clear ownership and the ability to undo automated choices.',constraint:'Will avoid products requiring unnecessary account access.',spending:'Happy to pay up to ₹1500 per month for software with meaningful value and appropriate privacy. Price is not usually his main concern.'},
 {id:'rosa',name:'Rosa',age:48,role:'Restaurant owner',archetype:'The practical operator',color:'#efb69b',initials:'RO',context:'Runs a small restaurant with six staff. Adopts technology when it survives a busy service and can be handed off to colleagues.',priority:'Reliability, shared workflows and predictable costs.',constraint:'Little tolerance for downtime, duplicate entry or elaborate setup.',spending:'Has a ₹3000 monthly business software budget. Personal spending capacity is unspecified; do not invent low profit margins.'},
 {id:'eli',name:'Eli',age:27,role:'Analyst & screen-reader user',archetype:'The independent navigator',color:'#a8c9e0',initials:'EL',context:'Blind analyst who uses keyboard navigation and a screen reader daily. Comfortable with complex software when controls are labelled and information is accessible.',priority:'Independently completing the entire task with equivalent information.',constraint:'Visual-only interactions, unlabeled controls and inaccessible exports.',spending:'Can comfortably spend ₹800 per month on a useful personal tool. Blindness does not imply a limited income.'},
 {id:'noor',name:'Noor',age:30,role:'Nurse on rotating shifts',archetype:'The time-poor realist',color:'#d1c4a7',initials:'NO',context:'Works changing day and night shifts. Plans around fatigue and prefers tools she can pick up after days away.',priority:'Low effort, flexibility and fewer decisions at the end of a shift.',constraint:'Routines change weekly; reminders and streaks can become burdens.',spending:'Has a stable salary and can afford ₹1000 per month for convenience. Changing shifts do not imply changing income.'},
 {id:'sam',name:'Sam',age:62,role:'Retired teacher & volunteer',archetype:'The community connector',color:'#bac5a4',initials:'SA',context:'Coordinates a neighbourhood repair club. Uses a laptop and phone, enjoys learning new tools and helps others get started.',priority:'Something useful to share, explain and keep using as a group.',constraint:'Mixed devices and skill levels in the group; needs a clear recovery path.',spending:'Can spend ₹1000 per month personally. The volunteer group has no shared software budget. Retirement does not imply financial hardship.'},
];
export type Idea = {title:string; description:string; audience:string; pricing:string; revision?:string};
export type Assessment = {dimension:Dimension; reaction:Reaction; severity:number; reason:string; assumption:string; experiment:string};
export type Evaluation = {personaId:string; assessments:Assessment[]};
export type Report = {id:string; createdAt:string; idea:Idea; evaluations:Evaluation[]; mode:'live'|'example'; model:string; previous?:Report; failures?:string[]};
export const reactionLabel:Record<Reaction,string>={friction:'Friction',opportunity:'Opportunity',uncertain:'Open question',neutral:'No strong signal'};
export function aggregate(evaluations:Evaluation[]) {
 return dimensions.map(d=>{const entries=evaluations.flatMap(e=>e.assessments.filter(a=>a.dimension===d.id).map(a=>({...a,personaId:e.personaId}))); const count=(r:Reaction)=>entries.filter(e=>e.reaction===r).length;
 return {...d,entries,friction:count('friction'),opportunity:count('opportunity'),uncertain:count('uncertain'),neutral:count('neutral'),split:count('friction')>0&&count('opportunity')>0};});
}
// Pick distinct explanations before filling remaining spots; no new model claims are introduced.
export function representatives(entries:(Assessment&{personaId:string})[],reaction?:Reaction){
 const candidates=entries.filter(e=>!reaction||e.reaction===reaction).sort((a,b)=>b.severity-a.severity); const selected:typeof candidates=[];
 const words=(s:string)=>new Set(s.toLowerCase().split(/\W+/).filter(w=>w.length>3));
 for(const c of candidates){const a=words(c.reason);const duplicate=selected.some(s=>{const b=words(s.reason);const overlap=[...a].filter(w=>b.has(w)).length;return overlap/Math.max(1,Math.min(a.size,b.size))>.65;}); if(!duplicate)selected.push(c);if(selected.length===3)break;}
 return selected;
}
export function validateEvaluation(value:unknown,personaId:string):Evaluation {
 if(!value||typeof value!=='object'||!Array.isArray((value as Evaluation).assessments))throw new Error('The model did not return an assessment.');
 const assessments=(value as Evaluation).assessments;
 if(assessments.length!==6||new Set(assessments.map(a=>a.dimension)).size!==6)throw new Error('The model did not evaluate all six dimensions.');
 for(const a of assessments){if(!dimensions.some(d=>d.id===a.dimension)||!['friction','opportunity','uncertain','neutral'].includes(a.reaction)||!Number.isInteger(a.severity)||a.severity<0||a.severity>3)throw new Error('The model returned an invalid signal.');for(const field of ['reason','assumption','experiment'] as const){if(typeof a[field]!=='string'||a[field].length<3||a[field].length>1600)throw new Error('The model returned an incomplete explanation.');}}
 return {personaId,assessments};
}
export const assessmentSchema={type:'object',properties:{assessments:{type:'array',minItems:6,maxItems:6,items:{type:'object',properties:{dimension:{type:'string',enum:dimensions.map(d=>d.id)},reaction:{type:'string',enum:['friction','opportunity','uncertain','neutral']},severity:{type:'integer',minimum:0,maximum:3},reason:{type:'string'},assumption:{type:'string'},experiment:{type:'string'}},required:['dimension','reaction','severity','reason','assumption','experiment'],additionalProperties:false}}},required:['assessments'],additionalProperties:false};

export function compareEvaluations(before:Evaluation[], after:Evaluation[]){
 const shared=new Set(before.map(e=>e.personaId).filter(id=>after.some(e=>e.personaId===id)));
 const prior=aggregate(before.filter(e=>shared.has(e.personaId)));
 const current=aggregate(after.filter(e=>shared.has(e.personaId)));
 return dimensions.map((d,i)=>({...d,shared:shared.size,before:prior[i].friction,after:current[i].friction,delta:current[i].friction-prior[i].friction}));
}
export function revisionDraft(idea:Idea):Idea{return {...idea,revision:idea.revision||''};}
