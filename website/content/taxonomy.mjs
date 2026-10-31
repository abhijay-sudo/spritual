export const universe = Object.freeze({id:'itihasa-purana', title:{en:'Itihasa & Purana',hi:'इतिहास और पुराण'}});
export const collections = Object.freeze([
 {slug:'ramayana',title:{en:'Ramayana',hi:'रामायण'},books:['valmiki-ramayana']},
 {slug:'krishna',title:{en:'Krishna',hi:'कृष्ण'},books:['bhagavata-purana']},
 {slug:'shiva',title:{en:'Shiva',hi:'शिव'},books:['shiva-purana','valmiki-ramayana']},
 {slug:'devi',title:{en:'Devi',hi:'देवी'},books:['devi-mahatmya','devi-bhagavata-purana']},
 {slug:'ganesha',title:{en:'Ganesha & Family',hi:'गणेश और परिवार'},books:['ganesha-purana','shiva-purana']},
 {slug:'mahabharata',title:{en:'Mahabharata',hi:'महाभारत'},books:['vyasa-mahabharata']},
]);
export const books = Object.freeze({
 'valmiki-ramayana':{title:'Valmiki Ramayana',arcKind:'Kanda'},
 'bhagavata-purana':{title:'Bhagavata Purana',arcKind:'Skandha'},
 'shiva-purana':{title:'Shiva Purana',arcKind:'Samhita'},
 'devi-mahatmya':{title:'Devi Mahatmya',arcKind:'Charita'},
 'devi-bhagavata-purana':{title:'Devi Bhagavata Purana',arcKind:'Skandha'},
 'ganesha-purana':{title:'Ganesha Purana',arcKind:'Khanda'},
 'vyasa-mahabharata':{title:'Vyasa Mahabharata',arcKind:'Parva'},
});
export const slugify = value => value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function bookKey(title){return Object.keys(books).find(key=>books[key].title===title);}
export function collectionPath(collection,lang='en'){return `${lang==='hi'?'/hi':''}/collections/${collection}/`;}
export function bookPath(story,lang='en'){return `${collectionPath(story.collection,lang)}books/${bookKey(story.book)}/`;}
export function arcPath(story,lang='en'){return `${bookPath(story,lang)}arcs/${slugify(story.arc)}/`;}
export function storyPath(story,lang='en'){return `${arcPath(story,lang)}stories/${story.slug}/`;}
export function pagePath(story,page,lang='en'){return `${storyPath(story,lang)}#page-${page}`;}

export const arcs = Object.freeze({
 'valmiki-ramayana':['Bala Kanda','Ayodhya Kanda','Aranya Kanda','Kishkindha Kanda','Sundara Kanda','Yuddha Kanda','Uttara Kanda'],
 'bhagavata-purana':Array.from({length:12},(_,i)=>`Skandha ${i+1}`),
 'shiva-purana':['Vidyeshvara Samhita','Rudra Samhita','Shatarudra Samhita','Kotirudra Samhita','Uma Samhita','Kailasa Samhita','Vayaviya Samhita'],
 'devi-mahatmya':['Prathama Charita','Madhyama Charita','Uttama Charita'],
 'devi-bhagavata-purana':Array.from({length:12},(_,i)=>`Skandha ${i+1}`),
 'ganesha-purana':['Upasana Khanda','Krida Khanda'],
 'vyasa-mahabharata':['Adi','Sabha','Vana','Virata','Udyoga','Bhishma','Drona','Karna','Shalya','Sauptika','Stri','Shanti','Anushasana','Ashvamedhika','Ashramavasika','Mausala','Mahaprasthanika','Svargarohana'].map(name=>name+' Parva'),
});
