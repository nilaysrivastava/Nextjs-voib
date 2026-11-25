function isTestStripeKey(key) {return typeof key==='string' && /^[sr]k_test_[A-Za-z0-9]+$/.test(key);}
function isAdministrator(user) {const groups=user?.app_metadata?.groups;if(!Array.isArray(groups))return false;return groups.includes('admin') || (user.app_metadata.demo===true && groups.includes('demo_admin'));}
function validSongPatch(body) {if(!body || typeof body.title!=='string' || typeof body.author!=='string')return null;const title=body.title.trim(),author=body.author.trim();return title.length>0&&title.length<=150&&author.length>0&&author.length<=100?{title,author}:null;}
module.exports={isTestStripeKey,isAdministrator,validSongPatch};
