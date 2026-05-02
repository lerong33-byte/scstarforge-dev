(function(){
var CC={pp:'rgba(200,158,48,0.82)',sg:'rgba(28,160,210,0.82)',wp:'rgba(220,72,40,0.82)',en:'rgba(180,168,48,0.82)',co:'rgba(18,178,148,0.82)',qd:'rgba(18,148,178,0.82)',rd:'rgba(158,152,172,0.55)'};
var CL={pp:'Pwr Plant',sg:'Shield',wp:'Weapons',en:'Engines',co:'Cooler',qd:'Q-Drive',rd:'Radar'};
var _mode='scm',_comps=null;
function cDraw(c,p){if(c.output)return 0;if(!c.dMax)return c.dMin||0;return c.dMin+(p/c.max)*(c.dMax-c.dMin);}
function pMult(p,m){return 0.5+(p/m);}
function buildComps(ship){
  var co=ship.comps?JSON.parse(ship.comps):{};
  var cnt=co.counts||{};
  var db=window.COMP_DB||{};
  var list=[];
  var ppN=co.pp||'Power Plant',ppC=cnt.pp||1;
  for(var i=0;i<ppC;i++){var d=(db.pp&&db.pp[ppN])||null;list.push({id:'pp'+i,cat:'pp',name:ppN+(ppC>1?' '+(i+1):''),pips:8,max:8,output:d?d.out:32,on:true});}
  var sgN=co.sg||'Shield Gen',sgC=cnt.sg||1;
  for(var i=0;i<sgC;i++){var d=(db.sg&&db.sg[sgN])||null;list.push({id:'sg'+i,cat:'sg',name:sgN+(sgC>1?' '+(i+1):''),pips:5,max:10,dMin:d?d.drawMin:3,dMax:d?d.drawMax:6,on:true});}
  list.push({id:'wp',cat:'wp',name:'Hardpoints',pips:5,max:10,dMin:0,dMax:13,on:true});
  list.push({id:'en',cat:'en',name:'Thrusters',pips:5,max:10,dMin:0,dMax:6,on:true});
  var coN=co.cooler||'Cooler',coC=cnt.cooler||1;
  for(var i=0;i<coC;i++)list.push({id:'co'+i,cat:'co',name:coN+(coC>1?' '+(i+1):''),pips:5,max:5,dMin:6,dMax:6,on:true});
  list.push({id:'qd',cat:'qd',name:co.qd||'Q-Drive',pips:3,max:3,dMin:3,dMax:3,on:true});
  list.push({id:'rd',cat:'rd',name:co.radar||'Radar',pips:2,max:2,dMin:1,dMax:1,on:true});
  return list;
}
function bpips(c){
  var el=document.getElementById('ppt-'+c.id);
  if(!el)return;
  el.innerHTML='';
  for(var i=0;i<c.max;i++){
    var d=document.createElement('div');
    d.className='pwr-pip '+(i<(c.on?c.pips:0)?c.cat:'e');
    (function(idx,comp){d.onclick=function(){if(!comp.on)return;comp.pips=idx+1;window.updatePwrRibbon();};}(i,c));
    el.appendChild(d);
  }
}
window.pwrTogComp=function(id){
  var c=_comps&&_comps.find(function(x){return x.id===id;});
  if(!c)return;c.on=!c.on;
  var tog=document.getElementById('pct-'+id);
  var row=document.getElementById('prc-'+id);
  if(tog)tog.className='pwr-ctog '+(c.on?'on':'off');
  if(row)row.className='pwr-comp'+(c.on?'':' offline');
  window.updatePwrRibbon();
};
window.pwrAdj=function(id,delta){
  var c=_comps&&_comps.find(function(x){return x.id===id;});
  if(!c||!c.on)return;c.pips=Math.max(0,Math.min(c.max,c.pips+delta));window.updatePwrRibbon();
};
window.pwrSetMode=function(m){
  _mode=m;
  var s=document.getElementById('pwrScmBtn'),n=document.getElementById('pwrNavBtn');
  if(s)s.className='pwr-mopt'+(m==='scm'?' on':'');
  if(n)n.className='pwr-mopt'+(m==='nav'?' on':'');
  var mr=document.getElementById('pwrModeRow'),pill=document.getElementById('pwrModePill');
  if(mr&&pill){var pw=mr.offsetWidth/2-2;pill.style.left=(m==='scm'?2:pw+2)+'px';pill.style.width=pw+'px';}
  window.updatePwrRibbon();
};
window.updatePwrRibbon=function(){
  if(!_comps)return;
  var out=0,draw=0,wpM=0,enM=0,sgHP=0;
  var sgs=_comps.filter(function(c){return c.cat==='sg';});
  var bSHP=window._hudBaseSHP||5400;
  _comps.forEach(function(c){
    bpips(c);
    if(c.output){var o=c.on?c.output:0;out+=o;var el=document.getElementById('pce-'+c.id);if(el)el.textContent=o+' EU';return;}
    var dr=c.on?cDraw(c,c.pips):0;draw+=dr;
    var el=document.getElementById('pce-'+c.id);if(el)el.textContent=Math.round(dr)+' EU';
    if(c.cat==='wp'&&c.on)wpM=pMult(c.pips,c.max);
    if(c.cat==='en'&&c.on)enM=pMult(c.pips,c.max);
    if(c.cat==='sg'&&c.on)sgHP+=Math.round((bSHP/sgs.length)*pMult(c.pips,c.max));
  });
  var lp=out>0?(draw/out)*100:999;
  var bg=lp>100?'linear-gradient(to right,#c02020,#e03030)':lp>85?'linear-gradient(to right,#b07820,#e0b030,#f0c040)':'linear-gradient(to right,#7a5010,#c08020,#e8b030)';
  var ef=document.getElementById('pwrEuFill');if(ef){ef.style.width=Math.min(100,lp)+'%';ef.style.background=bg;}
  var en=document.getElementById('pwrEuNums');if(en)en.textContent=Math.round(draw)+'/'+out+' EU';
  var es=document.getElementById('pwrEuStatus');
  if(es){if(lp>100){es.style.color='rgba(220,60,38,0.75)';es.textContent='OVERDRAW';}else{es.style.color='rgba(70,188,100,0.55)';es.textContent=Math.round(lp)+'% load';}}
  var dps=wpM>0?Math.round((window._hudBaseDPS||1444)*wpM):0;
  var spd=enM>0?Math.round((_mode==='scm'?(window._hudScm||226):(window._hudNav||1193))*enM):0;
  var el;
  el=document.getElementById('hudDps');if(el)el.textContent=dps.toLocaleString();
  el=document.getElementById('hudShp');if(el)el.textContent=sgHP.toLocaleString();
  el=document.getElementById('hudSpd');if(el)el.textContent=spd;
  el=document.getElementById('hudEu');if(el)el.textContent=out+' EU';
  el=document.getElementById('hudLoad');if(el)el.textContent=Math.round(lp)+'%';
};
function renderComps(){
  var flow=document.getElementById('pwrComps');if(!flow||!_comps)return;
  flow.innerHTML='';
  _comps.forEach(function(c){
    var hp=['wp','sg','en'].indexOf(c.cat)>-1;
    var el=document.createElement('div');
    el.id='prc-'+c.id;el.className='pwr-comp'+(c.on?'':' offline');
    var h='<div class="pwr-comp-head"><div class="pwr-ctog on" id="pct-'+c.id+'" onclick="pwrTogComp(''+c.id+'')"><div class="pwr-ctog-k"></div></div><span class="pwr-cname" style="color:'+CC[c.cat]+'">'+CL[c.cat]+'</span></div>';
    var s='<div class="pwr-csub">'+c.name+'</div>';
    var p='<div class="pwr-pip-track" id="ppt-'+c.id+'"></div>';
    var a=hp?'<div class="pwr-adj"><div class="pwr-adb" onclick="pwrAdj(''+c.id+'',-1)">−</div><div class="pwr-adb" onclick="pwrAdj(''+c.id+'',1)">+</div></div>':'';
    var e='<div class="pwr-ceu" style="color:'+CC[c.cat]+'" id="pce-'+c.id+'"></div>';
    el.innerHTML=h+s+p+'<div class="pwr-comp-foot">'+a+e+'</div>';
    flow.appendChild(el);
  });
}
function buildHpBand(ship){
  var band=document.getElementById('hpBand');if(!band)return;
  var slots=ship.slots?JSON.parse(ship.slots):[];
  var co=ship.comps?JSON.parse(ship.comps):{};
  var cnt=co.counts||{};
  var db=window.COMP_DB||{};
  var items=[];
  slots.forEach(function(sl){
    if(!sl.type||sl.type==='gun'||sl.type==='hardpoint'||sl.type==='turret'){
      var wN=sl.default||'';
      var wD=(db.gun&&db.gun[wN])||null;
      var dps=wD?Math.round((wD.dps||0)*(sl.count||1)):0;
      items.push({slot:sl.lbl||'HARDPOINT',sz:'w',name:wN||'Empty',val:dps,unit:'DPS',cls:'gd',isWep:true,wD:wD});
    }
  });
  var ppOut=_comps.filter(function(c){return c.cat==='pp';}).reduce(function(s,c){return s+(c.on?c.output:0);},0);
  var ppC=cnt.pp||1;items.push({slot:'POWER PLANT'+(ppC>1?' x'+ppC:''),sz:'p',name:co.pp||'Power Plant',val:ppOut,unit:'EU',cls:'gd'});
  var sgC=cnt.sg||1;items.push({slot:'SHIELD GEN'+(sgC>1?' x'+sgC:''),sz:'s',name:co.sg||'Shield Gen',val:Math.round(window._hudBaseSHP||0),unit:'HP',cls:'df'});
  var coC=cnt.cooler||1;items.push({slot:'COOLER'+(coC>1?' x'+coC:''),sz:'p',name:co.cooler||'Cooler',val:'',unit:'',cls:'tl'});
  items.push({slot:'Q-DRIVE',sz:'s',name:co.qd||'Q-Drive',val:ship.qdSpeed||'',unit:'Mm/s',cls:'tl'});
  var html='<div class="hp-flow-new">';
  items.slice(0,8).forEach(function(it){
    var dd='';
    if(it.isWep&&it.wD){dd='<div class="dd-pop-new"><div class="dd-stats-new"><div class="dd-stat-new"><div class="dd-sv gd">'+Math.round(it.wD.dps||0)+'</div><div class="dd-sl">DPS</div></div><div class="dd-stat-new"><div class="dd-sv fr">'+Math.round(it.wD.alpha||0)+'</div><div class="dd-sl">ALPHA</div></div><div class="dd-stat-new"><div class="dd-sv df">'+(it.wD.range||0)+'m</div><div class="dd-sl">RANGE</div></div><div class="dd-stat-new"><div class="dd-sv ch">'+(it.wD.draw||0)+' EU</div><div class="dd-sl">DRAW</div></div></div><div class="dd-loc-new">CenterMass / Area18</div></div>';}
    html+='<div class="hpi'+(it.isWep?' dd-wrap':'')+'"><span class="hpi-slot">'+it.slot+'</span><div class="hpi-name-row"><span class="hpi-sz '+it.sz+'">S?</span><span class="hpi-nm">'+it.name+'</span>'+(it.isWep?'<span class="hpi-on">ON</span>':'')+'</div><div class="hpi-dv"><span class="hpi-dps '+it.cls+'">'+(it.val||'—')+'</span>'+(it.unit?'<span class="hpi-u">'+it.unit+'</span>':'')+'</div></div>';
  });
  html+='</div>';band.innerHTML=html;
}
window.initHudScene=function(ship){
  if(!ship)return;
  var paneLo=document.getElementById('pane-lo');
  var aside=document.getElementById('mainAside');
  var body=document.querySelector('.body');
  var pane=document.querySelector('.pane');
  if(paneLo)paneLo.classList.add('has-ship');
  if(aside)aside.classList.add('has-ship');
  if(body)body.classList.add('has-ship');
  if(pane)pane.classList.add('has-ship');
  var db=window.COMP_DB||{};
  var co=ship.comps?JSON.parse(ship.comps):{};
  var cnt=co.counts||{};
  var sgN=co.sg||'',sgD=(db.sg&&db.sg[sgN])||null,sgC=cnt.sg||1;
  window._hudBaseSHP=sgD?sgD.totalHP*sgC:5400;
  window._hudBaseDPS=ship.baseDPS||1444;
  window._hudScm=ship.scm||226;
  window._hudNav=ship.nav||1193;
  _comps=buildComps(ship);
  renderComps();
  buildHpBand(ship);
  var ribbon=document.getElementById('pwrRibbon');
  var hpBand=document.getElementById('hpBand');
  var hudR=document.getElementById('hudRight');
  if(ribbon)ribbon.style.display='';
  if(hpBand)hpBand.style.display='';
  if(hudR)hudR.style.display='';
  setTimeout(function(){
    var mr=document.getElementById('pwrModeRow'),pill=document.getElementById('pwrModePill');
    if(mr&&pill){var pw=mr.offsetWidth/2-2;pill.style.left='2px';pill.style.width=pw+'px';}
    window.updatePwrRibbon();
  },120);
};
var _hookedBPP=false;
function hookBPP(){
  if(_hookedBPP)return;
  if(typeof window.buildPowerPanel==='function'){
    _hookedBPP=true;
    var orig=window.buildPowerPanel;
    window.buildPowerPanel=function(){
      orig.apply(this,arguments);
      setTimeout(function(){if(window._curShip)window.initHudScene(window._curShip);},250);
    };
  }
}
hookBPP();
var _chk=setInterval(function(){hookBPP();if(_hookedBPP)clearInterval(_chk);},400);
}());