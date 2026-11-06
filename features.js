import {journal,outreach} from './journal.js';import {media,shop} from './media.js';import {games} from './games.js';import {history} from './history.js';
export function renderFeature(route,ctx,root){({prayer:journal,outreach,media,shop,games,history}[route]||journal)(ctx,root);}
