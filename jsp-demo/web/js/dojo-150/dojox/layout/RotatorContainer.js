/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/


if(!dojo._hasResource["dojox.layout.RotatorContainer"]){
dojo._hasResource["dojox.layout.RotatorContainer"]=true;
dojo.provide("dojox.layout.RotatorContainer");
dojo.require("dojo.fx");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.StackController");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");
dojo.declare("dojox.layout.RotatorContainer",[dijit.layout.StackContainer,dijit._Templated],{templateString:"<div class=\"dojoxRotatorContainer\"><div dojoAttachPoint=\"tabNode\"></div><div class=\"dojoxRotatorPager\" dojoAttachPoint=\"pagerNode\"></div><div class=\"dojoxRotatorContent\" dojoAttachPoint=\"containerNode\"></div></div>",showTabs:true,transitionDelay:5000,transition:"fade",transitionDuration:1000,autoStart:true,suspendOnHover:false,pauseOnManualChange:null,reverse:false,pagerId:"",cycles:-1,pagerClass:"dojox.layout.RotatorPager",postCreate:function(){
this.inherited(arguments);
dojo.style(this.domNode,"position","relative");
if(this.cycles-0==this.cycles&&this.cycles!=-1){
this.cycles++;
}else{
this.cycles=-1;
}
if(this.pauseOnManualChange===null){
this.pauseOnManualChange=!this.suspendOnHover;
}
var id=this.id||"rotator"+(new Date()).getTime(),sc=new dijit.layout.StackController({containerId:id},this.tabNode);
this.tabNode=sc.domNode;
this._stackController=sc;
dojo.style(this.tabNode,"display",this.showTabs?"":"none");
this.connect(sc,"onButtonClick","_manualChange");
this._subscriptions=[dojo.subscribe(this.id+"-cycle",this,"_cycle"),dojo.subscribe(this.id+"-state",this,"_state")];
var d=Math.round(this.transitionDelay*0.75);
if(d<this.transitionDuration){
this.transitionDuration=d;
}
if(this.suspendOnHover){
this.connect(this.domNode,"onmouseover","_onMouseOver");
this.connect(this.domNode,"onmouseout","_onMouseOut");
}
},startup:function(){
if(this._started){
return;
}
var c=this.getChildren();
for(var i=0,_1=c.length;i<_1;i++){
if(c[i].declaredClass==this.pagerClass){
this.pagerNode.appendChild(c[i].domNode);
break;
}
}
this.inherited(arguments);
if(this.autoStart){
setTimeout(dojo.hitch(this,"_play"),10);
}else{
this._updatePager();
}
},destroy:function(){
dojo.forEach(this._subscriptions,dojo.unsubscribe);
this.inherited(arguments);
},_setShowTabsAttr:function(_2){
this.showTabs=_2;
dojo.style(this.tabNode,"display",_2?"":"none");
},_updatePager:function(){
var c=this.getChildren();
dojo.publish(this.id+"-update",[this._playing,dojo.indexOf(c,this.selectedChildWidget)+1,c.length]);
},_onMouseOver:function(){
this._resetTimer();
this._over=true;
},_onMouseOut:function(){
this._over=false;
if(this._playing){
clearTimeout(this._timer);
this._timer=setTimeout(dojo.hitch(this,"_play",true),200);
}
},_resetTimer:function(){
clearTimeout(this._timer);
this._timer=null;
},_cycle:function(_3){
if(_3 instanceof Boolean||typeof _3=="boolean"){
this._manualChange();
}
var c=this.getChildren(),_4=c.length,i=dojo.indexOf(c,this.selectedChildWidget)+(_3===false||(_3!==true&&this.reverse)?-1:1);
this.selectChild(c[(i<_4?(i<0?_4-1:i):0)]);
this._updatePager();
},_manualChange:function(){
if(this.pauseOnManualChange){
this._playing=false;
}
this.cycles=-1;
},_play:function(_5){
this._playing=true;
this._resetTimer();
if(_5!==true&&this.cycles>0){
this.cycles--;
}
if(this.cycles==0){
this._pause();
}else{
if((!this.suspendOnHover||!this._over)&&this.transitionDelay){
this._timer=setTimeout(dojo.hitch(this,"_cycle"),this.selectedChildWidget.domNode.getAttribute("transitionDelay")||this.transitionDelay);
}
}
this._updatePager();
},_pause:function(){
this._playing=false;
this._resetTimer();
},_state:function(_6){
if(_6){
this.cycles=-1;
this._play();
}else{
this._pause();
}
},_transition:function(_7,_8){
this._resetTimer();
if(_8&&this.transitionDuration){
switch(this.transition){
case "fade":
this._fade(_7,_8);
return;
}
}
this._transitionEnd();
this.inherited(arguments);
},_transitionEnd:function(){
if(this._playing){
this._play();
}else{
this._updatePager();
}
},_fade:function(_9,_a){
this._styleNode(_a.domNode,1,1);
this._styleNode(_9.domNode,0,2);
this._showChild(_9);
if(this.doLayout&&_9.resize){
_9.resize(this._containerContentBox||this._contentBox);
}
var _b={duration:this.transitionDuration},_c=dojo.fx.combine([dojo["fadeOut"](dojo.mixin({node:_a.domNode},_b)),dojo["fadeIn"](dojo.mixin({node:_9.domNode},_b))]);
this.connect(_c,"onEnd",dojo.hitch(this,function(){
this._hideChild(_a);
this._transitionEnd();
}));
_c.play();
},_styleNode:function(_d,_e,_f){
dojo.style(_d,"opacity",_e);
dojo.style(_d,"zIndex",_f);
dojo.style(_d,"position","absolute");
}});
dojo.declare("dojox.layout.RotatorPager",[dijit._Widget,dijit._Templated,dijit._Contained],{widgetsInTemplate:true,rotatorId:"",postMixInProperties:function(){
this.templateString="<div>"+this.srcNodeRef.innerHTML+"</div>";
},postCreate:function(){
var p=dijit.byId(this.rotatorId)||this.getParent();
if(p&&p.declaredClass=="dojox.layout.RotatorContainer"){
if(this.previous){
dojo.connect(this.previous,"onClick",function(){
dojo.publish(p.id+"-cycle",[false]);
});
}
if(this.next){
dojo.connect(this.next,"onClick",function(){
dojo.publish(p.id+"-cycle",[true]);
});
}
if(this.playPause){
dojo.connect(this.playPause,"onClick",function(){
this.set("label",this.checked?"Pause":"Play");
dojo.publish(p.id+"-state",[this.checked]);
});
}
this._subscriptions=[dojo.subscribe(p.id+"-state",this,"_state"),dojo.subscribe(p.id+"-update",this,"_update")];
}
},destroy:function(){
dojo.forEach(this._subscriptions,dojo.unsubscribe);
this.inherited(arguments);
},_state:function(_10){
if(this.playPause&&this.playPause.checked!=_10){
this.playPause.attr("label",_10?"Pause":"Play");
this.playPause.attr("checked",_10);
}
},_update:function(_11,_12,_13){
this._state(_11);
if(this.current&&_12){
this.current.innerHTML=_12;
}
if(this.total&&_13){
this.total.innerHTML=_13;
}
}});
}
