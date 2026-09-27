import { Link } from "react-router-dom";
import { graphEntities, graphStories, type GraphLanguage } from "../../../packages/content/src/knowledgeGraph";
import { useGraphSaves } from "./graphSaves";
import { EditorialImage, type EditorialAssetId } from "./EditorialImage";
import { entityMedia, storyMedia } from "./mediaRelations";
import "./knowledge-universe.css";

export function GraphSavedSection({ language }: { language: GraphLanguage }) {
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const { ids, error, toggle } = useGraphSaves();
  const art: Record<string, EditorialAssetId> = { ...entityMedia, ...storyMedia };
  const items = ids.map(id => { const entity = graphEntities.find(item => item.id === id); const story = graphStories.find(item => item.id === id); return entity ? { id, title: entity.name[language], href: `/alpha/divine/${entity.slug}`, kind: t("Divine entry", "दिव्य प्रवेश") } : story ? { id, title: story.title[language], href: story.href, kind: t("Story", "कथा") } : null; }).filter(item => item !== null);
  return <section className="ku-saved" lang={language} aria-labelledby="ku-saved-title"><span className="ku-kicker">{t("FROM THE KNOWLEDGE UNIVERSE", "ज्ञान-संसार से")}</span><h2 id="ku-saved-title">{t("Stories & entries", "कथाएँ और प्रविष्टियाँ")}</h2>{error && <p role="alert">{error}</p>}{items.length ? <div className="ku-saved-list">{items.map(item => <div key={item.id}><Link to={item.href}>{art[item.id] && <EditorialImage asset={art[item.id]} language={language} decorative/>}<span><small>{item.kind}</small><strong>{item.title}</strong></span></Link><button type="button" onClick={() => toggle(item.id)}>{t("Remove", "हटाएँ")}</button></div>)}</div> : <p>{t("Nothing from this collection saved yet. You can keep a story or entry for later.", "इस संग्रह से अभी कुछ सहेजा नहीं गया है। चाहें तो कोई कथा या प्रविष्टि बाद के लिए रख सकते हैं।")}</p>}<Link className="ku-saved-explore" to="/alpha/divine">{t("Explore Divine entries", "दिव्य प्रविष्टियाँ देखें")} ↗</Link></section>;
}
