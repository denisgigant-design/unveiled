import {team,teaching} from './brand.js?v=unveiled11';
import {fellowship} from './fellowship.js?v=unveiled9';
import {journal,outreach} from './journal.js?v=unveiled9';import {media,shop} from './media.js?v=unveiled11';import {games} from './games.js';import {history} from './history.js?v=unveiled8';
export function renderFeature(route,ctx,root){({team,teaching,prayer:journal,outreach,media,shop,games,history,fellowship}[route]||journal)(ctx,root);}
