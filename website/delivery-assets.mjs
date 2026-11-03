// Only transport variants of the three already-reviewed public story art families.
// Original files remain the fallback and are never overwritten by the generator.
export const deliveryArt={
 epic:{file:'collection-ramayana',width:1120,height:1400,widths:[560,800,1120],sha256:'efdc72236075b1bb71f70a105ce33f6a577857a3872802963c6e53d5d848a242'},
 rama:{file:'world-rama',width:900,height:1200,widths:[560,800,900],sha256:'9fd66b52aca7f1ffad44be7355141c3856bec115018ae9f6afd955c31f5742ce'},
 hanuman:{file:'world-hanuman',width:900,height:1200,widths:[560,800,900],sha256:'ed6aef11868421a06b6c83f1c5f096ee2e7d1c8fbe698cc2b0a410927e2ded0a'},
};
export const deliveryFiles=Object.values(deliveryArt).flatMap(art=>art.widths.map(width=>`${art.file}-${width}.avif`));
