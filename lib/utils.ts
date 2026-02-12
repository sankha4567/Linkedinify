export function getTimeAgo(timestamp:number):string{
  const seconds = Math.floor(Date.now() - timestamp)/1000;
  if(seconds < 60){
    return "just now";
  }
  else if(seconds < 3600){
    return `${Math.floor(seconds/60)}m`
  }
  else if(seconds < 86400){
    return `${Math.floor(seconds/3600)}hr`
  }
  else if(seconds < 604800){
    return `${Math.floor(seconds/86400)}d`
  }
  return new Date(timestamp).toLocaleDateString();
}