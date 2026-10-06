"use client";
import {useEffect,useMemo,useState} from "react";
type M={name:string;emoji:string;max:number;power:number;skill:string};
type S={world:string;enemy:string;emoji:string;hp:number;atk:number;boss:boolean;reward:number};
type Save={level:number;coins:number;xp:number;stars:number;monster:number;wins:number;hp:number};
const monsters:M[]=[
{name:"Pyron",emoji:"🔥",max:120,power:22,skill:"Ember Surge"},
{name:"Voltix",emoji:"⚡",max:135,power:20,skill:"Volt Crash"},
{name:"Frostfang",emoji:"❄️",max:150,power:18,skill:"Glacial Bite"}];
const worlds=["Emerald Wilds","Burning Expanse","Frozen Abyss","Shadow Citadel","Cosmic Rift"];
const names=[["Ravager","👹"],["Stoneclaw","🗿"],["Nightmaw","🐺"],["Thorn Warden","🌿"],["Ash Reaper","🔥"],["Dune Tyrant","🦂"],["Blazehorn","🦬"],["Inferno King","😈"],["Frost Wraith","👻"],["Glacier Fang","🐲"],["Ice Colossus","🧊"],["Winter Queen","👑"],["Void Stalker","🕷️"],["Shadowfang","🐺"],["Dread Knight","⚔️"],["Rift Emperor","☠️"],["Star Eater","🌌"],["Nova Beast","☄️"],["Astral Titan","👾"],["Rift Sovereign","🌑"]] as const;
const stages:S[]=names.map(([enemy,emoji],i)=>({world:worlds[Math.floor(i/4)],enemy,emoji,hp:95+i*18+(i%4===3?45:0),atk:13+i*2+(i%4===3?6:0),boss:i%4===3,reward:35+i*12+(i%4===3?80:0)}));
const initial:Save={level:1,coins:250,xp:0,stars:6,monster:0,wins:0,hp:120};
export default function Home(){
const [s,setS]=useState<Save>(initial),[eh,setEh]=useState(stages[0].hp),[log,setLog]=useState("Choose your move. Every stage gets harder."),[ready,setReady]=useState(false),[user,setUser]=useState("");
const m=monsters[s.monster],stage=stages[Math.min(s.level-1,19)],done=s.level>20,dead=s.hp<=0;
useEffect(()=>{try{const x=localStorage.getItem("monster-rift-save");if(x)setS({...initial,...JSON.parse(x)});}catch{}const w=window as Window&{Telegram?:{WebApp?:{ready:()=>void;expand:()=>void;initDataUnsafe?:{user?:{first_name?:string;username?:string}}}}};const tg=w.Telegram?.WebApp;if(tg){tg.ready();tg.expand();const u=tg.initDataUnsafe?.user;if(u)setUser(u.first_name||u.username||"");}else{const sc=document.createElement("script");sc.src="https://telegram.org/js/telegram-web-app.js?63";sc.onload=()=>{const t=w.Telegram?.WebApp;if(t){t.ready();t.expand();}};document.head.appendChild(sc);}setReady(true);},[]);
useEffect(()=>{if(ready)localStorage.setItem("monster-rift-save",JSON.stringify(s));},[s,ready]);
useEffect(()=>{if(ready&&!done){setEh(stage.hp);setS(v=>({...v,hp:monsters[v.monster].max}));}},[s.level,ready]);
function win(){const n=s.level+1;if(n>20){setS(v=>({...v,wins:v.wins+1}));setLog("🏆 RIFT CONQUERED! All 20 launch stages cleared.");return;}const bonus=n%4===0?4:n%6===0?3:0;setS(v=>({...v,level:n,coins:v.coins+stage.reward,xp:v.xp+50,stars:v.stars+bonus,wins:v.wins+1,hp:monsters[v.monster].max}));setLog((stage.boss?"👑 BOSS CLEARED! ":"VICTORY! ")+"+"+stage.reward+" coins • +50 XP"+(bonus?" • +"+bonus+" ⭐":""))}
function hit(d:number,label:string){if(dead||done||eh<=0)return;const n=Math.max(0,eh-d);setEh(n);if(n===0){win();return;}setS(v=>({...v,hp:Math.max(0,v.hp-stage.atk)}));setLog(label+" dealt "+d+" damage. "+stage.enemy+" hits for "+stage.atk+".");}
function power(label:string,cost:number,dmg:number){if(s.stars<cost){setLog("Need "+cost+" ⭐ for "+label+".");return;}setS(v=>({...v,stars:v.stars-cost}));hit(dmg,label);}
function heal(){if(done)return;setS(v=>({...v,hp:m.max}));setLog("❤️ Full Heal restored HP.");}
function shield(){if(s.stars<3){setLog("Need 3 ⭐ for Shield.");return;}setS(v=>({...v,stars:v.stars-3,hp:Math.min(m.max,v.hp+45)}));setLog("🛡️ Shield restored 45 HP.");}
function swap(){const n=(s.monster+1)%3;setS(v=>({...v,monster:n,hp:monsters[n].max}));setLog("👾 Switched to "+monsters[n].name+".");}
function reset(){localStorage.removeItem("monster-rift-save");setS(initial);setEh(stages[0].hp);setLog("New Rift run started.");}
if(!ready)return <main><div className="loading">Loading Rift...</div></main>;
const world=Math.floor((Math.min(s.level,20)-1)/4)+1,progress=(s.xp%200)/2;
return <main><header><div><div className="brand">MONSTER <b>RIFT</b></div><div className="tag">BATTLE • POWER UP • CONQUER</div></div><div className="stats">⭐ {s.stars} &nbsp; 🪙 {s.coins}</div></header>
<section className="hero"><div><span className="pill">WORLD {world} • {stage.world.toUpperCase()} • LEVEL {Math.min(s.level,20)}</span><h1>Enter the <em>Rift.</em></h1><p>{user?"Welcome, "+user+". ":""}20 launch stages • 5 worlds • hard bosses • original monsters.</p></div><div className="orb">⚔️</div></section>
{done?<section className="complete card"><div className="boss-mark">👑</div><h2>RIFT CONQUERED</h2><p>You cleared every launch stage.</p><button className="primary" onClick={reset}>Restart Run</button></section>:<><section className="battle"><div className="card"><span>YOUR MONSTER</span><h2>{m.emoji} {m.name}</h2><div className="bar"><i style={{width:(s.hp/m.max*100)+"%"}}/></div><b>{s.hp} / {m.max} HP</b><div className="skill">{m.skill}</div></div><div className="vs">VS</div><div className={"card "+(stage.boss?"boss":"")}><span>{stage.boss?"👑 BOSS":"ENEMY"}</span><h2>{stage.emoji} {stage.enemy}</h2><div className="bar enemybar"><i style={{width:(eh/stage.hp*100)+"%"}}/></div><b>{eh} / {stage.hp} HP</b></div></section>
<div className="log">{log}</div><section className="moves">
<button onClick={()=>hit(m.power,"⚡ Quick Attack")}>⚡ Quick Attack</button><button onClick={()=>hit(m.power+14,"💥 Heavy Attack")}>💥 Heavy Attack</button><button onClick={()=>power("🌩️ Lightning",5,m.power+45)}>🌩️ Lightning <small>5⭐</small></button><button onClick={()=>power("❄️ Freeze",6,m.power+55)}>❄️ Freeze <small>6⭐</small></button><button onClick={shield}>🛡️ Shield <small>3⭐</small></button><button onClick={()=>power("😡 Rage",8,m.power+70)}>😡 Rage <small>8⭐</small></button><button onClick={()=>power("💥 Mega",10,m.power+95)}>💥 Mega <small>10⭐</small></button><button onClick={heal}>❤️ Full Heal</button></section>
<section className="progress"><div><span>RIFT XP</span><b>{s.xp} XP</b></div><div className="bar"><i style={{width:progress+"%"}}/></div></section>
<section className="bottom"><div>Stage <strong>{s.level}</strong>/20 • Wins <strong>{s.wins}</strong></div><div className="tabs"><button onClick={swap}>👾 Monster</button><button onClick={()=>setLog("⭐ Powers: Lightning • Freeze • Shield • Rage • Mega.")}>⭐ Powers</button><button onClick={()=>setLog("🏆 Global leaderboard: server validation is the next backend phase.")}>🏆 Rank</button><button onClick={reset}>↻ Reset</button></div></section></>}</main>}
