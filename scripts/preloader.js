<script>
 
(function(){

  function hidePreloader(){var p=document.getElementById('lg-preloader');if(p&&!p.classList.contains('hide'))p.classList.add('hide');}
  window.addEventListener('load',function(){setTimeout(hidePreloader,1500);});
  document.addEventListener('DOMContentLoaded',function(){setTimeout(hidePreloader,3500);});
  setTimeout(hidePreloader,5000);

  document.addEventListener('DOMContentLoaded',function(){

    // Hide skip link
    document.querySelectorAll('.skip-link,a.screen-reader-text,.screen-reader-text').forEach(function(e){ e.style.display='none'; });

    // Build topbar - reads ALL nav links from original widget automatically
    var hdr = document.getElementById('headerbwrap');
    if(hdr){
      var topbar = document.createElement('div');
      topbar.className='lg-topbar'; topbar.id='lg-topbar';
      var inner = document.createElement('div');
      inner.className='lg-header-inner';

      // Logo
      var logo = document.createElement('a');
      logo.className='lg-logo-wrap'; logo.href='/';
      logo.innerHTML='<div class="lg-logo-icon"><i class="fas fa-heart"></i></div><div><div class="lg-site-title">Dream <em>Team</em></div><div class="lg-tagline">Love &#183; Relationships &#183; Life</div></div>';
      inner.appendChild(logo);

      // Nav - reads from original Blogger nav widget
      var origNav = hdr.querySelector('nav#main-nav');
      var ul = document.createElement('ul');
      ul.className='lg-nav-links';
      var liHome = document.createElement('li');
      if(window.location.pathname==='/'||window.location.pathname==='/index.html') liHome.className='active';
      liHome.innerHTML='<a href="/">&#8962; Home</a>';
      ul.appendChild(liHome);
      if(origNav){
        origNav.querySelectorAll('ul li').forEach(function(li){
          var a=li.querySelector('a'); if(!a) return;
          var newLi=document.createElement('li');
          if(li.id==='currentpage') newLi.className='active';
          var title=a.textContent.trim();
          var emoji='';
          if(title.toLowerCase().includes('disclaimer')) emoji='📜 ';
          else if(title.toLowerCase().includes('dream team')) emoji='👥 ';
          else if(title.toLowerCase().includes('q and a')) emoji='❓ ';
          else if(title.toLowerCase().includes('about')) emoji='ℹ️ ';
          else if(title.toLowerCase().includes('contact')) emoji='📞 ';
          else if(title.toLowerCase().includes('alert')) emoji='🔔 ';
          newLi.innerHTML='<a href="'+a.href+'">'+emoji+title+'</a>';
          ul.appendChild(newLi);
        });
      }
      var liCta=document.createElement('li'); liCta.className='lg-cta';
      liCta.innerHTML='<a href="/p/contact-us.html">&#9825; Ask Guru</a>';
      ul.appendChild(liCta);
      inner.appendChild(ul);

      // Mobile btn
      var mbtn=document.createElement('button');
      mbtn.className='lg-menu-btn'; mbtn.id='lg-menu-btn';
      mbtn.setAttribute('aria-label','Menu');
      mbtn.innerHTML='<i class="fas fa-bars" id="lg-micon"></i>';
      inner.appendChild(mbtn);

      topbar.appendChild(inner);
      hdr.innerHTML=''; hdr.appendChild(topbar);
    }

    // Mobile menu
    document.addEventListener('click',function(e){
      var nav=document.getElementById('lg-mobile-nav');
      if(!nav) return;
      if(e.target.closest('#lg-menu-btn')){
        e.stopPropagation();
        nav.classList.toggle('lg-open');
        var ic=document.getElementById('lg-micon');
        if(ic) ic.className=nav.classList.contains('lg-open')?'fas fa-times':'fas fa-bars';
        return;
      }
      if(nav.classList.contains('lg-open')&&!e.target.closest('#lg-mobile-nav')){
        nav.classList.remove('lg-open');
        var ic2=document.getElementById('lg-micon'); if(ic2) ic2.className='fas fa-bars';
      }
    });

    // Scroll - passive:true is critical for mobile smooth scroll
    window.addEventListener('scroll',function(){
      var tb=document.getElementById('lg-topbar');
      if(tb) tb.className=window.scrollY>60?'lg-topbar scrolled':'lg-topbar';
      var bt2=document.getElementById('lg-top-btn');
      if(bt2) bt2.className=window.scrollY>400?'show':'';
    },{passive:true});

    var bt=document.getElementById('lg-top-btn');
    if(bt) bt.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });

    // Scroll reveal
    // Panel tabs handled by page CSS

    if('IntersectionObserver' in window){
      var obs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('lg-visible'); });
      },{threshold:0.08});
      document.querySelectorAll('.post-outer').forEach(function(el,i){
        el.style.transitionDelay=(i*0.07)+'s'; obs.observe(el);
      });
    } else {
      document.querySelectorAll('.post-outer').forEach(function(el){ el.classList.add('lg-visible'); });
    }


 // Simple footer fix by AI
var footer = document.querySelector('footer.site-footer, footer#footer, #footer');

if (footer) {
    var yr = new Date().getFullYear();
    var bt2 = document.querySelector('h1.site-title a, .site-title a');
    var bn = bt2 ? bt2.textContent.trim() : 'Dream Team';

    // Footer HTML with Center Alignment and XML safe ampersand
    footer.innerHTML =
        '<div class="lg-footer-simple" style="color:#fff; text-align:center; padding:20px 10px;">' +
            '<div>' +
                '<div class="lg-footer-brand-name" style="color:#fff !important; font-size:24px; margin-bottom:10px;">&#9825; <span style="color:#fff !important;">' + bn + '</span></div>' +
                '<p class="sm-footer-desc" style="color:#fff !important; margin-bottom:15px; font-size:14px;">Copyright &copy; 2019- ' + yr + ' <span class="lg-hrt" style="color:#fff !important;"></span><br/><span style="color:#fff !important;">Design and maintained by Dream Team Members</span></p>' +
            '</div>' +
        '</div>';
}

});
})();
 
</script>