<script>
 
/* ── HEARTS CANVAS - Mobile optimized (no shadowBlur) ── */
(function(){
  var c=document.getElementById('lg-hearts-canvas');
  if(!c) return;
  var ctx=c.getContext('2d'),hearts=[],W,H;
  var isMobile=window.innerWidth<600;
  var COUNT=isMobile?7:14;
  var DPR=isMobile?1:Math.min(window.devicePixelRatio||1,2);
  function resize(){
    W=c.width=window.innerWidth*DPR; H=c.height=window.innerHeight*DPR;
    c.style.width=window.innerWidth+'px'; c.style.height=window.innerHeight+'px';
  }
  resize(); window.addEventListener('resize',resize);
  function H2(){
    this.x=Math.random()*W; this.y=H+20;
    this.s=(Math.random()*15+6)*DPR;
    this.vx=(Math.random()-.5)*1.1*DPR; this.vy=-(Math.random()*1.3+.4)*DPR;
 this.op=.85; this.r=Math.random()*Math.PI*2;
    this.rv=(Math.random()-.5)*.032; this.col='#ff0000';
  }
  H2.prototype.draw=function(){
    ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.r);
    ctx.globalAlpha=this.op; ctx.fillStyle=this.col;
    /* NO shadowBlur - was biggest perf killer */
    ctx.beginPath(); var s=this.s;
    ctx.moveTo(0,-s*.4);
    ctx.bezierCurveTo(s*.5,-s,s,-s*.3,s*.5,s*.3);
    ctx.bezierCurveTo(s*.2,s*.7,0,s,0,s);
    ctx.bezierCurveTo(0,s,-s*.2,s*.7,-s*.5,s*.3);
    ctx.bezierCurveTo(-s,-s*.3,-s*.5,-s,0,-s*.4);
    ctx.fill(); ctx.restore();
    this.x+=this.vx; this.y+=this.vy; this.r+=this.rv; this.op-=.0006;
  };
  for(var i=0;i<COUNT;i++){var h=new H2();h.y=Math.random()*H;hearts.push(h);}
  function anim(){
    ctx.clearRect(0,0,W,H);
    for(var i=hearts.length-1;i>=0;i--){
      hearts[i].draw();
      if(hearts[i].y<-40||hearts[i].op<=0){hearts.splice(i,1);hearts.push(new H2());}
    }
    requestAnimationFrame(anim);
  }
  anim();
})();
 
</script>