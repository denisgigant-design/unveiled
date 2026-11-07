import {team} from './brand.js?v=unveiled6';
import {journal,outreach} from './journal.js?v=unveiled6';import {media,shop} from './media.js?v=unveiled6';import {games} from './games.js';import {history} from './history.js';
export function renderFeature(route,ctx,root){({team,prayer:journal,outreach,media,shop,games,history}[route]||journal)(ctx,root);}
