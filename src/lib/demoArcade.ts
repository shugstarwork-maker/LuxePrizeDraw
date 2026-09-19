export type DemoProfile={chips:number;ratings:{chess:number;connect4:number;draughts:number;poker:number};games:number;wins:number;streak:number;rewards:number;recent:string[]};
const key="luxe-demo-arcade-v1";
const initial:DemoProfile={chips:6600,ratings:{chess:550,connect4:620,draughts:480,poker:700},games:0,wins:0,streak:0,rewards:0,recent:["Welcome to Luxe Arcade demo mode"]};
export const loadDemo=():DemoProfile=>{try{return {...initial,...JSON.parse(localStorage.getItem(key)||"{}")} }catch{return initial}};
export const saveDemo=(profile:DemoProfile)=>localStorage.setItem(key,JSON.stringify(profile));
export const addDemoResult=(game:keyof DemoProfile["ratings"],won:boolean)=>{const profile=loadDemo();profile.games+=1;profile.wins+=won?1:0;profile.streak=won?profile.streak+1:0;profile.ratings[game]+=won?18:-10;profile.chips+=won?120:25;profile.recent=[`${won?"Won":"Finished"} a ${game} demo match`,...profile.recent].slice(0,4);saveDemo(profile);return profile};
