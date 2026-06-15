<script>
 
(function(){
  var wrap = document.getElementById('lg-slides-wrap');
  if(!wrap) return;
  var slides = wrap.querySelectorAll('.lg-slide');
  var total = slides.length;
  var cur = 0;
  var timer;

  var dotsWrap = document.getElementById('lg-sl-dots');
  if(dotsWrap){
    for(var i=0;i<total;i++){
      var d=document.createElement('button');
      d.className='lg-sl-dot'+(i===0?' active':'');
      d.setAttribute('data-i',i);
      (function(idx){
        d.addEventListener('click',function(){ goTo(idx); resetTimer(); });
      })(i);
      dotsWrap.appendChild(d);
    }
  }

  function goTo(n){
    cur=(n+total)%total;
    wrap.style.transform='translateX(-'+cur*100+'%)';
    if(dotsWrap){
      var dots=dotsWrap.querySelectorAll('.lg-sl-dot');
      for(var j=0;j<dots.length;j++) dots[j].classList.toggle('active',j===cur);
    }
  }
  function next(){ goTo(cur+1); }
  function prev(){ goTo(cur-1); }
  function resetTimer(){ clearInterval(timer); timer=setInterval(next,4000); }

  var nb=document.getElementById('lg-sl-next');
  var pb=document.getElementById('lg-sl-prev');
  if(nb) nb.addEventListener('click',function(){ next(); resetTimer(); });
  if(pb) pb.addEventListener('click',function(){ prev(); resetTimer(); });

  var tx=0;
  wrap.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
  wrap.addEventListener('touchend',function(e){
    var diff=tx-e.changedTouches[0].clientX;
    if(Math.abs(diff)>40){ diff>0?next():prev(); resetTimer(); }
  },{passive:true});

  resetTimer();
})();
 
</script>