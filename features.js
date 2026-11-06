import {team} from './brand.js';
import {journal,outreach} from './journal.js';import {media,shop} from './media.js?v=unveiled3';import {games} from './games.js';import {history} from './history.js';
export function renderFeature(route,ctx,root){({team,prayer:journal,outreach,media,shop,games,history}[route]||journal)(ctx,root);}
