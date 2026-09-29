import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Link, Route, Routes, useParams } from "react-router-dom";
import { SupabaseKnowledgeRepository } from "./supabaseRepository";
import { ConnectedStoryReader } from "./ConnectedStoryReader";
import { KnowledgeServiceError, type KnowledgeEntity, type KnowledgeLanguage, type KnowledgePassage,
  type KnowledgeRepository, type KnowledgeSearchResult, type KnowledgeSource, type KnowledgeStory,
  type KnowledgeWork } from "./types";
import type { KnowledgeSaveKind, KnowledgeSavedItem } from "./types";
import "../knowledge-universe.css";
import "./real-knowledge.css";

const tr = (language: KnowledgeLanguage,en: string,hi: string) => language === "hi" ? hi : en;
function href(item: KnowledgeSearchResult) {
  return item.kind === "entity" ? `/alpha/divine/${item.slug}` : item.kind === "story" ? `/alpha/stories/${item.slug}`
    : item.kind === "passage" ? `/alpha/episode/${encodeURIComponent(item.slug)}` : `/alpha/scriptures/${item.slug}`;
}
function errorCopy(language: KnowledgeLanguage,error: unknown) {
  if (error instanceof KnowledgeServiceError && error.code === "SEARCH_INVALID") return tr(language,"Use 2–120 characters without wildcards.","वाइल्डकार्ड के बिना २–१२० अक्षर लिखें।");
  return tr(language,"The knowledge service could not be checked. Try again when connected; no preview content has been substituted.","ज्ञान सेवा की जाँच नहीं हो सकी। जुड़ने पर फिर कोशिश करें; नमूना सामग्री नहीं दिखाई गई है।");
}
function useKnowledge<T>(load: () => Promise<T>, key: string) {
  const [revision,setRevision]=useState(0);
  const [state,setState]=useState<{kind:"loading"}|{kind:"error";error:unknown}|{kind:"ready";data:T}>({kind:"loading"});
  useEffect(()=>{
    let active=true;
    setState({kind:"loading"});
    load().then(data=>{if(active)setState({kind:"ready",data});},error=>{if(active)setState({kind:"error",error});});
    return ()=>{active=false;};
  // The key includes every argument that changes the request. A fresh revision retries.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,revision]);
  return {state,retry:()=>setRevision(value=>value+1)};
}
function Result<T>({load,language,children,empty}: {load:ReturnType<typeof useKnowledge<T>>;language:KnowledgeLanguage;
  children:(data:T)=>ReactNode;empty?:boolean}) {
  if(load.state.kind==="loading")return <p className="rk-status" role="status">{tr(language,"Checking published knowledge…","प्रकाशित सामग्री जाँची जा रही है…")}</p>;
  if(load.state.kind==="error")return <div className="rk-error" role="alert"><p>{errorCopy(language,load.state.error)}</p><button type="button" onClick={load.retry}>{tr(language,"Try again","फिर कोशिश करें")}</button></div>;
  if(empty && Array.isArray(load.state.data) && !load.state.data.length)return <p className="rk-empty">{tr(language,"No reviewed, rights-cleared material is published here yet.","यहाँ अभी कोई समीक्षित, अधिकार-स्पष्ट सामग्री प्रकाशित नहीं है।")}</p>;
  return <>{children(load.state.data)}</>;
}
function SourceCard({source,language}: {source:KnowledgeSource;language:KnowledgeLanguage}) {
  return <section className="ku-source-record"><h2>{tr(language,"Source and review","स्रोत और समीक्षा")}</h2><dl>
    <div><dt>{tr(language,"Reference","संदर्भ")}</dt><dd>{source.reference}</dd></div>
    <div><dt>{tr(language,"Edition","संस्करण")}</dt><dd>{source.edition}</dd></div>
    <div><dt>{tr(language,"Review","समीक्षा")}</dt><dd>{source.reviewer}</dd></div>
    <div><dt>{tr(language,"Source","स्रोत")}</dt><dd>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a> : source.title}</dd></div>
  </dl></section>;
}
function Header({language}:{language:KnowledgeLanguage}) {
  return <header className="rk-header"><Link className="rk-brand" to="/alpha/library">Spritual</Link><nav aria-label={tr(language,"Knowledge navigation","ज्ञान नेविगेशन")}>
    <Link to="/alpha/library">{tr(language,"Explore","खोजें")}</Link><Link to="/alpha/divine">{tr(language,"Divine","दिव्य")}</Link>
    <Link to="/alpha/scriptures">{tr(language,"Scriptures","ग्रंथ")}</Link><Link to="/alpha/stories">{tr(language,"Stories","कथाएँ")}</Link>
    <Link to="/alpha/life">{tr(language,"Ask","पूछें")}</Link><Link to="/alpha/my-day">{tr(language,"Saved","सहेजे")}</Link></nav></header>;
}
function SaveAction({repository,language,kind,id}:{repository:KnowledgeRepository;language:KnowledgeLanguage;kind:KnowledgeSaveKind;id:string}) {
  const [state,setState]=useState<"idle"|"saving"|"saved"|"auth"|"error">("idle");
  async function save(){setState("saving");try{await repository.setSave(kind,id,true);setState("saved");}
    catch(error){setState(error instanceof KnowledgeServiceError&&error.code==="AUTH_REQUIRED"?"auth":"error");}}
  return <div className="rk-save-action"><button type="button" onClick={save} disabled={state==="saving"||state==="saved"}>
    {state==="saved"?tr(language,"Saved to your list","आपकी सूची में सहेजा गया"):state==="saving"?tr(language,"Saving…","सहेजा जा रहा है…"):tr(language,"Save for later","बाद के लिए सहेजें")}</button>
    {state==="auth"&&<p role="alert">{tr(language,"Sign in to save across devices.","अन्य डिवाइस पर भी सहेजने के लिए साइन इन करें।")} <Link to="/alpha/today">{tr(language,"Sign in","साइन इन")}</Link></p>}
    {state==="error"&&<p role="alert">{tr(language,"Could not save. Check your connection and try again.","सहेज नहीं सके। इंटरनेट जाँचें और फिर कोशिश करें।")}</p>}</div>;
}
function Saved({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const load=useKnowledge(()=>repository.listSaves(language),`saves:${language}`);
  const [removing,setRemoving]=useState<string|null>(null);
  const [removeError,setRemoveError]=useState<string|null>(null);
  async function remove(item:KnowledgeSavedItem){setRemoving(`${item.kind}:${item.id}`);setRemoveError(null);
    try{await repository.setSave(item.kind,item.id,false);load.retry();}
    catch{setRemoveError(tr(language,"Could not remove this item. Try again.","यह सामग्री हट नहीं सकी। फिर कोशिश करें।"));}
    finally{setRemoving(null);}}
  if(load.state.kind==="error"&&load.state.error instanceof KnowledgeServiceError&&load.state.error.code==="AUTH_REQUIRED")
    return <div className="ku-page"><h1>{tr(language,"Your saved readings","आपके सहेजे हुए पाठ")}</h1><p>{tr(language,"Sign in to see readings saved to your account.","अपने खाते में सहेजे हुए पाठ देखने के लिए साइन इन करें।")}</p><Link className="ku-primary" to="/alpha/today">{tr(language,"Sign in","साइन इन")} →</Link></div>;
  return <div className="ku-page"><Link className="ku-back" to="/alpha/library">← {tr(language,"Explore","खोजें")}</Link><header className="ku-intro"><span className="ku-kicker">{tr(language,"PRIVATE TO YOUR ACCOUNT","केवल आपके खाते में")}</span><h1>{tr(language,"Your saved readings","आपके सहेजे हुए पाठ")}</h1><p>{tr(language,"A source that is withdrawn or loses rights stays marked unavailable until you remove it.","हटाया गया या अधिकार खो चुका स्रोत अनुपलब्ध दिखेगा, जब तक आप उसे नहीं हटाते।")}</p></header>
    {removeError&&<p role="alert" className="rk-error">{removeError}</p>}
    <Result load={load} language={language}>{items=>items.length?<div className="rk-saved-list">{items.map(item=><div className="rk-saved-row" key={`${item.kind}:${item.id}`}>
      <div><small>{item.kind}</small>{item.available&&item.slug?<Link to={href({kind:item.kind,id:item.id,slug:item.slug,title:item.title??"",reference:null,rank:0})}>{item.title}</Link>:<strong>{tr(language,"Unavailable · source or publication changed","अनुपलब्ध · स्रोत या प्रकाशन बदला है")}</strong>}</div>
      <button type="button" disabled={removing===`${item.kind}:${item.id}`} onClick={()=>void remove(item)}>{tr(language,"Remove","हटाएँ")}</button></div>)}</div>:<p className="rk-empty">{tr(language,"Nothing saved yet. Find a published reading and keep it here for later.","अभी कुछ सहेजा नहीं है। प्रकाशित पाठ चुनें और बाद के लिए यहाँ रखें।")}</p>}</Result></div>;
}
function Index({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const entities=useKnowledge(()=>repository.listEntities(language),`entities:${language}`);
  const works=useKnowledge(()=>repository.listWorks(language),`works:${language}`);
  const stories=useKnowledge(()=>repository.listStories(language),`stories:${language}`);
  return <div className="ku-page"><header className="ku-intro"><span className="ku-kicker">{tr(language,"EXPLORE · PUBLISHED SOURCES","खोजें · प्रकाशित स्रोत")}</span><h1>{tr(language,"Follow what is here.","जो उपलब्ध है, उसे पढ़ें।")}</h1><p>{tr(language,"Only currently published, rights-checked material appears. An empty collection is honest; it is not filled with demo text.","केवल वर्तमान प्रकाशित, अधिकार-जाँची सामग्री दिखाई जाती है। खाली संग्रह में नमूना पाठ नहीं भरा जाता।")}</p></header>
    <Link className="ku-primary" to="/alpha/search">{tr(language,"Search published knowledge","प्रकाशित ज्ञान खोजें")} →</Link>
    <section className="ku-related"><h2>{tr(language,"Divine and characters","दिव्य रूप और पात्र")}</h2><Result load={entities} language={language} empty>{items=><div className="ku-related-list">{items.map(item=><Link key={item.id} to={`/alpha/divine/${item.slug}`}><strong>{item.title}</strong><span>{item.source.reference} →</span></Link>)}</div>}</Result></section>
    <section className="ku-related"><h2>{tr(language,"Scriptures","ग्रंथ")}</h2><Result load={works} language={language} empty>{items=><div className="ku-related-list">{items.map(item=><Link key={item.slug} to={`/alpha/scriptures/${item.slug}`}><strong>{item.title}</strong><span>{item.passageCount} {tr(language,"available passages","उपलब्ध पाठ")} →</span></Link>)}</div>}</Result></section>
    <section className="ku-related"><h2>{tr(language,"Stories","कथाएँ")}</h2><Result load={stories} language={language} empty>{items=><div className="ku-related-list">{items.map(item=><Link key={item.id} to={`/alpha/stories/${item.slug}`}><strong>{item.title}</strong><span>{item.source.reference} →</span></Link>)}</div>}</Result></section>
  </div>;
}
function Entities({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const load=useKnowledge(()=>repository.listEntities(language),`entities:${language}`);
  return <div className="ku-page"><Link className="ku-back" to="/alpha/library">← {tr(language,"Explore","खोजें")}</Link><header className="ku-intro"><span className="ku-kicker">{tr(language,"DIVINE · CURRENTLY PUBLISHED","दिव्य · वर्तमान प्रकाशित")}</span><h1>{tr(language,"Meet a story. Follow its source.","कथा से मिलें। उसके स्रोत तक जाएँ।")}</h1></header><Result load={load} language={language} empty>{items=><div className="ku-entity-list">{items.map((item:KnowledgeEntity)=><Link className="ku-entity-row rk-entity-row" key={item.id} to={`/alpha/divine/${item.slug}`}><span className="rk-entity-art" aria-hidden="true"/><span className="ku-entity-row-copy"><small>{item.source.reference}</small><strong>{item.title}</strong><em>{item.description ?? item.tradition}</em><span>{tr(language,"Begin here","यहाँ से शुरू करें")} ↗</span></span></Link>)}</div>}</Result></div>;
}
function EntityDetail({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const {slug}=useParams();
  const load=useKnowledge(()=>repository.getEntity(slug??"",language),`entity:${slug}:${language}`);
  return <article className="ku-page"><Link className="ku-back" to="/alpha/divine">← {tr(language,"Divine","दिव्य")}</Link><Result load={load} language={language}>{item=>!item?<p className="rk-empty">{tr(language,"This entry is unavailable or no longer published.","यह प्रविष्टि उपलब्ध या प्रकाशित नहीं है।")}</p>:<><header className="ku-intro"><span className="ku-kicker">{tr(language,"PUBLISHED · SOURCE LINKED","प्रकाशित · स्रोत सहित")}</span><h1>{item.title}</h1><p>{item.description ?? item.tradition}</p></header><SaveAction repository={repository} language={language} kind="entity" id={item.id}/><SourceCard source={item.source} language={language}/><p className="ku-disclosure">{tr(language,"No deity speaks through this app. This is an editorial entry with a named review and current source rights.","ऐप किसी देवता की आवाज़ होने का दावा नहीं करता। यह नामित समीक्षा और वर्तमान स्रोत अधिकार वाली संपादकीय प्रविष्टि है।")}</p></>}</Result></article>;
}
function Stories({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const load=useKnowledge(()=>repository.listStories(language),`stories:${language}`);
  return <div className="ku-page"><Link className="ku-back" to="/alpha/library">← {tr(language,"Explore","खोजें")}</Link><header className="ku-intro"><span className="ku-kicker">{tr(language,"PUBLISHED STORIES","प्रकाशित कथाएँ")}</span><h1>{tr(language,"Enter through a story.","कथा से प्रवेश करें।")}</h1></header><Result load={load} language={language} empty>{items=><div className="ku-related-list">{items.map((item:KnowledgeStory)=><Link key={item.id} to={`/alpha/stories/${item.slug}`}><strong>{item.title}</strong><span>{item.source.reference} →</span></Link>)}</div>}</Result></div>;
}
function StoryDetail({repository,language,actorKey}:{repository:KnowledgeRepository;language:KnowledgeLanguage;actorKey:string}) {
  const {slug}=useParams();
  const load=useKnowledge(()=>repository.getStory(slug??"",language),`story:${slug}:${language}`);
  return <Result load={load} language={language}>{item=>!item?<div className="ku-page"><Link className="ku-back" to="/alpha/stories">← {tr(language,"Stories","कथाएँ")}</Link><p className="rk-empty">{tr(language,"This story is unavailable or no longer published.","यह कथा उपलब्ध या प्रकाशित नहीं है।")}</p></div>
    :<ConnectedStoryReader key={`${actorKey}:${item.id}`} item={item} language={language} actorKey={actorKey}
      saveAction={<SaveAction repository={repository} language={language} kind="story" id={item.id}/>}
      sourceCard={<SourceCard source={item.source} language={language}/>}/> }</Result>;
}
function Works({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const load=useKnowledge(()=>repository.listWorks(language),`works:${language}`);
  return <div className="ku-page"><Link className="ku-back" to="/alpha/library">← {tr(language,"Explore","खोजें")}</Link><header className="ku-intro"><span className="ku-kicker">{tr(language,"SCRIPTURES · AVAILABLE NOW","ग्रंथ · अभी उपलब्ध")}</span><h1>{tr(language,"Read what is here.","जो उपलब्ध है, वही पढ़ें।")}</h1></header><Result load={load} language={language} empty>{items=><div className="ku-work-list">{items.map((item:KnowledgeWork)=><Link key={item.slug} to={`/alpha/scriptures/${item.slug}`}><small>{item.passageCount} {tr(language,"PUBLISHED PASSAGES","प्रकाशित पाठ")}</small><strong>{item.title}</strong><em>{tr(language,"Explore this work","यह ग्रंथ देखें")} →</em></Link>)}</div>}</Result></div>;
}
function WorkDetail({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const {slug}=useParams();
  const works=useKnowledge(()=>repository.listWorks(language),`works:${language}`);
  const refs=useKnowledge(()=>repository.listWorkPassages(slug??"",language),`work:${slug}:${language}`);
  return <div className="ku-page"><Link className="ku-back" to="/alpha/scriptures">← {tr(language,"Scriptures","ग्रंथ")}</Link><Result load={works} language={language}>{items=>{const work=items.find(item=>item.slug===slug);return !work?<p className="rk-empty">{tr(language,"This work has no currently published readings.","इस ग्रंथ का अभी कोई प्रकाशित पाठ नहीं है।")}</p>:<><header className="ku-intro"><span className="ku-kicker">{tr(language,"PUBLISHED SELECTION","प्रकाशित चयन")}</span><h1>{work.title}</h1><p>{tr(language,"Only current, rights-cleared passages appear.","केवल वर्तमान, अधिकार-स्पष्ट पाठ दिखाई देते हैं।")}</p></header><Result load={refs} language={language} empty>{passages=><div className="ku-related-list">{passages.map(item=><Link key={item.canonicalId} to={`/alpha/episode/${encodeURIComponent(item.canonicalId)}`}><strong>{item.reference}</strong><span>{item.kind} →</span></Link>)}</div>}</Result></>;}}</Result></div>;
}
function PassageDetail({repository,language}:{repository:KnowledgeRepository;language:KnowledgeLanguage}) {
  const {id}=useParams();
  const load=useKnowledge(()=>repository.getPassage(id??"",language),`passage:${id}:${language}`);
  return <article className="ku-page"><Link className="ku-back" to="/alpha/scriptures">← {tr(language,"Scriptures","ग्रंथ")}</Link><Result load={load} language={language}>{item=>!item?<p className="rk-empty">{tr(language,"This passage is unavailable or its rights have changed.","यह पाठ उपलब्ध नहीं है या इसके अधिकार बदल गए हैं।")}</p>:<><header className="ku-intro"><span className="ku-kicker">{item.workTitle}</span><h1>{item.reference}</h1></header><SaveAction repository={repository} language={language} kind="passage" id={item.id}/>{item.renderings.map(rendering=><section className="rk-rendering" key={rendering.id}><small>{rendering.kind.replaceAll("_"," ")}</small><p lang={rendering.language}>{rendering.body}</p><SourceCard source={rendering.source} language={language}/></section>)}</>}</Result></article>;
}
function Search({repository,language,life=false}:{repository:KnowledgeRepository;language:KnowledgeLanguage;life?:boolean}) {
  const [draft,setDraft]=useState("");
  const [query,setQuery]=useState("");
  const load=useKnowledge(()=>query?repository.search(query,language):Promise.resolve([]),`search:${query}:${language}`);
  const submit=(event:FormEvent)=>{event.preventDefault();setQuery(draft.trim().slice(0,120));};
  return <div className="ku-page"><Link className="ku-back" to="/alpha/library">← {tr(language,"Explore","खोजें")}</Link><header className="ku-intro"><span className="ku-kicker">{life?tr(language,"LIFE → WISDOM","जीवन → ज्ञान"):tr(language,"SEARCH PUBLISHED KNOWLEDGE","प्रकाशित ज्ञान खोजें")}</span><h1>{life?tr(language,"Begin with a question.","एक सवाल से शुरू करें।"):tr(language,"Follow a name or source.","नाम या स्रोत से आगे बढ़ें।")}</h1><p>{tr(language,"Your words stay in this browser visit. Search checks published sources; it does not ask a model or invent a religious answer.","आपके शब्द इसी ब्राउज़र सत्र में रहते हैं। खोज प्रकाशित स्रोत जाँचती है; किसी मॉडल से नहीं पूछती या धार्मिक उत्तर नहीं गढ़ती।")}</p></header><form className="ku-search-form" onSubmit={submit}><label htmlFor="rk-query">{life?tr(language,"Your question","आपका सवाल"):tr(language,"Search","खोजें")}</label><div><input id="rk-query" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={120} autoComplete="off"/><button type="submit">{tr(language,"Find","ढूँढें")}</button></div></form>{query&&<Result load={load} language={language}>{items=>items.length?<div className="ku-result-list">{items.map(item=><Link key={`${item.kind}:${item.id}`} to={href(item)}><small>{item.kind.toUpperCase()}</small><strong>{item.title}</strong><span>{item.reference??tr(language,"Published source path","प्रकाशित स्रोत-पथ")}</span></Link>)}</div>:<p className="rk-empty">{tr(language,"No verified match here. Try a name or exact reference; we will not force a Gita verse into this question.","यहाँ कोई सत्यापित मेल नहीं मिला। नाम या सटीक संदर्भ लिखें; इस सवाल पर गीता का श्लोक नहीं थोपेंगे।")}</p>}</Result>}</div>;
}
export default function RealKnowledgeExperience({client,language,actorKey}:{client:SupabaseClient;language:KnowledgeLanguage;actorKey:string}) {
  const repository=useMemo(()=>new SupabaseKnowledgeRepository(client),[client]);
  return <div className="alpha real-shell rk-shell" lang={language}><Header language={language}/><main className="alpha-main" id="real-main"><Routes>
    <Route path="/alpha/library" element={<Index repository={repository} language={language}/>}/>
    <Route path="/alpha/divine" element={<Entities repository={repository} language={language}/>}/>
    <Route path="/alpha/divine/:slug" element={<EntityDetail repository={repository} language={language}/>}/>
    <Route path="/alpha/stories" element={<Stories repository={repository} language={language}/>}/>
    <Route path="/alpha/stories/:slug" element={<StoryDetail repository={repository} language={language} actorKey={actorKey}/>}/>
    <Route path="/alpha/scriptures" element={<Works repository={repository} language={language}/>}/>
    <Route path="/alpha/scriptures/:slug" element={<WorkDetail repository={repository} language={language}/>}/>
    <Route path="/alpha/episode/:id" element={<PassageDetail repository={repository} language={language}/>}/>
    <Route path="/alpha/search" element={<Search repository={repository} language={language}/>}/>
    <Route path="/alpha/life" element={<Search repository={repository} language={language} life/>}/>
    <Route path="/alpha/my-day" element={<Saved repository={repository} language={language}/>}/>
  </Routes></main></div>;
}
