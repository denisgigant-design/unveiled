import {team} from './brand.js?v=unveiled7';
import {fellowship} from './fellowship.js?v=unveiled7';
import {journal,outreach} from './journal.js?v=unveiled7';import {media,shop} from './media.js?v=unveiled7';import {games} from './games.js';import {history} from './history.js';
export function renderFeature(route,ctx,root){({team,prayer:journal,outreach,media,shop,games,history,fellowship}[route]||journal)(ctx,root);}
