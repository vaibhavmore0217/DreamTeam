<script>
 
(function(){
  if(document.body && document.body.id === 'layout') return;

  var prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  document.addEventListener('DOMContentLoaded', function(){

     

   

    /* ─── 3. AUTO-TAG ELEMENTS FOR REVEAL ANIMATION ─── */
    // Mark homepage sections for reveal (keeping originals intact, just adding attribute)
    var sectionSelectors = [
      // Welcome section (h2 wrapper)
      'div[style*="padding:44px 10%"]',
      // What we offer cards grid
      'div[style*="grid-template-columns:repeat(auto-fit,minmax(210px,1fr))"]',
      // Stats strip
      'div[style*="padding:0 10% 52px"]',
      // Meet team grid wrapper
      'div[style*="padding:0 10% 56px"]',
      // Join community banner
      'div[style*="padding:0 10% 60px"]',
      // Custom slider
      '#lg-slider',
      // Section labels and titles
      '.lg-section-title', '.lg-section-lbl',
      // Comments
      '.comments',
      // Prefooter widgets
      '#prefooter .pf-full > *'
    ];
    sectionSelectors.forEach(function(sel){
      try{
        document.querySelectorAll(sel).forEach(function(el){
          if(!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', 'up');
        });
      }catch(e){}
    });

    /* ─── 4. STAGGERED CARDS - "What We Offer" + Stats + Team ─── */
    // Add stagger to inline grids
    document.querySelectorAll('div[style*="display:grid"][style*="grid-template-columns"]').forEach(function(grid){
      grid.setAttribute('data-stagger', '');
      // remove from grid the data-reveal so the children animate instead
      grid.removeAttribute('data-reveal');
    });

    // Stats strip flex - make children stagger
    document.querySelectorAll('div[style*="padding:0 10% 52px"]').forEach(function(s){
      s.setAttribute('data-stagger','');
      s.removeAttribute('data-reveal');
    });

    /* ─── 5. INTERSECTION OBSERVER FOR REVEAL + STAGGER + COUNTER ─── */
    if('IntersectionObserver' in window){
      var revealObs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(!e.isIntersecting) return;
          e.target.classList.add('lg-revealed');
          if(e.target.hasAttribute('data-stagger')){
            e.target.classList.add('lg-stagger-in');
            // delay each child
            Array.prototype.forEach.call(e.target.children, function(child, i){
              child.style.transitionDelay = (i * 0.09) + 's';
            });
          }
          if(e.target.hasAttribute('data-counter')){
            animateCounter(e.target);
          }
          revealObs.unobserve(e.target);
        });
      }, {threshold: 0.12, rootMargin: '0px 0px -8% 0px'});

      document.querySelectorAll('[data-reveal],[data-stagger]').forEach(function(el){
        revealObs.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal],[data-stagger]').forEach(function(el){
        el.classList.add('lg-revealed','lg-stagger-in');
      });
    }

    /* ─── 6. ANIMATED NUMBER COUNTER FOR STATS ─── */
    function animateCounter(el){
      var target = parseFloat(el.getAttribute('data-counter')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1600, start = performance.now();
      function step(now){
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        var v = Math.floor(target * eased);
        el.textContent = v + suffix;
        if(t < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
      }
      requestAnimationFrame(step);
    }

    // Tag stat numbers
    document.querySelectorAll('div[style*="padding:0 10% 52px"] div[style*="font-family:&quot;Playfair Display&quot;"][style*="font-size:30px"], .lg-stat-num').forEach(function(el){
      var txt = el.textContent.trim();
      // Only animate plain numbers like "4 L+", "6+", skip emoji/symbols
      var match = txt.match(/^(\d+)([^\d]*)$/);
      if(match){
        el.setAttribute('data-counter', match[1]);
        el.setAttribute('data-suffix', match[2]);
        el.textContent = '0' + match[2];
        // observe
        if('IntersectionObserver' in window){
          var co = new IntersectionObserver(function(es){
            es.forEach(function(e){ if(e.isIntersecting){ animateCounter(e.target); co.unobserve(e.target); } });
          },{threshold:0.4});
          co.observe(el);
        }
      }
    });

  
    /* ─── 8. MAGNETIC BUTTONS ─── */
    var magneticSels = [
      '.lg-btn-primary', '.lg-btn-outline', '.lg-read-more',
      'a[style*="background:linear-gradient(135deg,#FF2D6B"]',
      'a[style*="background:linear-gradient(135deg,#c41e50"]'
    ];
    var magBtns = [];
    magneticSels.forEach(function(sel){
      try{
        document.querySelectorAll(sel).forEach(function(el){
          el.classList.add('lg-magnetic','lg-ripple');
          magBtns.push(el);
        });
      }catch(e){}
    });

    if(!prefersReduced && !window.matchMedia('(pointer:coarse)').matches){
      magBtns.forEach(function(btn){
        btn.addEventListener('mousemove', function(e){
          var r = btn.getBoundingClientRect();
          var x = e.clientX - r.left - r.width / 2;
          var y = e.clientY - r.top - r.height / 2;
          btn.style.transform = 'translate(' + (x * 0.25) + 'px,' + (y * 0.25) + 'px)';
        });
        btn.addEventListener('mouseleave', function(){
          btn.style.transform = '';
        });
        btn.addEventListener('click', function(e){
          var r = btn.getBoundingClientRect();
          var fx = document.createElement('span');
          fx.className = 'lg-ripple-fx';
          fx.style.left = (e.clientX - r.left) + 'px';
          fx.style.top = (e.clientY - r.top) + 'px';
          fx.style.width = fx.style.height = (Math.max(r.width, r.height) * 0.5) + 'px';
          btn.appendChild(fx);
          setTimeout(function(){ if(fx.parentNode) fx.parentNode.removeChild(fx); }, 700);
        });
      });
    }

    /* ─── 9. WORD-BY-WORD HERO TITLE ANIMATION ─── */
    document.querySelectorAll('div[style*="padding:44px 10%"] h2').forEach(function(h){
      // Only split if not already done
      if(h.querySelector('.lg-word')) return;
      var nodes = Array.prototype.slice.call(h.childNodes);
      var i = 0;
      nodes.forEach(function(node){
        if(node.nodeType === 3){
          var words = node.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          words.forEach(function(w){
            if(w.trim() === ''){ frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span');
            s.className = 'lg-word';
            s.style.animationDelay = (i * 0.08) + 's';
            s.textContent = w;
            frag.appendChild(s);
            i++;
          });
          h.replaceChild(frag, node);
        } else if(node.nodeType === 1){
          // wrap span content too
          if(node.tagName.toLowerCase() === 'span'){
            node.classList.add('lg-word');
            node.style.animationDelay = (i * 0.08) + 's';
            i++;
          }
        }
      });
    });


    
    /* ─── 11. SMOOTH SCROLL FOR HASH LINKS ─── */
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var href = a.getAttribute('href');
        if(href.length > 1){
          var t = document.querySelector(href);
          if(t){
            e.preventDefault();
            window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth'});
          }
        }
      });
    });

    /* ─── 12. PARTICLES CANVAS - floating dots/hearts background ─── */
    (function(){
if(window.innerWidth < 600) return;

      var canvas = document.getElementById('lg-particles');
      if(!canvas) return;
      var ctx = canvas.getContext('2d');
      var DPR = 1; /* force 1 - 2x canvas = 2x GPU work */
      var w, h, particles;
      var COUNT = 35;

      function resize(){
        w = canvas.width = window.innerWidth * DPR;
        h = canvas.height = window.innerHeight * DPR;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
      }
      resize();
      window.addEventListener('resize', resize);

      function init(){
        particles = [];
        for(var i = 0; i < COUNT; i++){
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4 * DPR,
            vy: (Math.random() - 0.5) * 0.4 * DPR - 0.15 * DPR,
            r: (Math.random() * 2.5 + 1) * DPR,
            o: Math.random() * 0.6 + 0.2,
            hue: Math.random() < 0.5 ? '255,45,107' : '255,143,176'
          });
        }
      }
      init();

      function loop(){
        ctx.clearRect(0, 0, w, h);
        for(var i = 0; i < particles.length; i++){
          var p = particles[i];
          p.x += p.vx; p.y += p.vy;
          if(p.x < 0) p.x = w; else if(p.x > w) p.x = 0;
          if(p.y < -10) p.y = h; else if(p.y > h + 10) p.y = -10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + p.hue + ',' + p.o + ')';
          
          ctx.fill();
        }
        requestAnimationFrame(loop);
      }
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        loop();
      }
    })();

  
    /* ─── 14. TEAM FLIP CARDS - tap to toggle on touch ─── */
    document.querySelectorAll('.lg-team-flip').forEach(function(card){
      card.addEventListener('click', function(e){
        if(e.target.closest('a')) return;
        card.classList.toggle('lg-flipped');
      });
    });

    /* ─── 15. STAT MEGA COUNTER (separate from old counter) ─── */
    (function(){
      if(!('IntersectionObserver' in window)) return;
      var statObs = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            var n = en.target;
            var to = parseInt(n.getAttribute('data-count-to'), 10) || 0;
            var suffix = n.getAttribute('data-suffix') || '';
            var dur = 2000;
            var start = null;
            function step(t){
              if(!start) start = t;
              var prog = Math.min((t - start) / dur, 1);
              var ease = 1 - Math.pow(1 - prog, 3);
              var val = Math.floor(to * ease);
              var disp = val;
              if(to >= 100000) disp = (val / 100000).toFixed(val >= 100000 ? 1 : 0).replace(/\.0$/, '') + ' L';
              else if(to >= 1000) disp = (val / 1000).toFixed(val >= 1000 ? 1 : 0).replace(/\.0$/, '') + 'K';
              n.textContent = disp + suffix;
              if(prog < 1) requestAnimationFrame(step);
              else { 
                var finalDisp = to;
                if(to >= 100000) finalDisp = (to / 100000) + ' L';
                else if(to >= 1000) finalDisp = (to / 1000) + 'K';
                n.textContent = finalDisp + suffix;
              }
            }
            requestAnimationFrame(step);
            statObs.unobserve(n);
          }
        });
      }, {threshold: 0.4});
      document.querySelectorAll('.lg-stat-mega-num[data-count-to]').forEach(function(el){
        statObs.observe(el);
      });
    })();

    /* ─── 16. SCROLL REVEAL ANIMATIONS ─── */
    (function(){
      if(!('IntersectionObserver' in window)) return;
      var revealObs = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if(en.isIntersecting){
            en.target.classList.add('active');
            revealObs.unobserve(en.target);
          }
        });
      }, {threshold: 0.15, rootMargin: '0px 0px -50px 0px'});

      document.querySelectorAll('.lg-reveal, .lg-reveal-left, .lg-reveal-right').forEach(function(el){
        revealObs.observe(el);
      });
    })();

    /* ─── 17. PARALLAX BACKGROUND ON SCROLL ─── */
    (function(){
      var parallaxElements = document.querySelectorAll('.lg-parallax-bg');
      if(parallaxElements.length === 0) return;
      
      window.addEventListener('scroll', function(){
        parallaxElements.forEach(function(el){
          var rect = el.getBoundingClientRect();
          var scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
          var offset = scrollPercent * 20;
          el.style.transform = 'translateY(' + offset + 'px)';
        });
      }, {passive: true});
    })();

    /* ─── 18. ENHANCED CARD HOVER WITH LIGHT TRAIL ─── */
    document.querySelectorAll('.lg-post-card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / 10;
        var rotateY = (centerX - x) / 10;
        
        card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateZ(20px)';
      });
      
      card.addEventListener('mouseleave', function(){
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });

    

    /* ─── 20. AUTO-APPLY ANIMATIONS TO EXISTING ELEMENTS ─── */
    (function(){
      // Post cards - floating + reveal
      document.querySelectorAll('.lg-post-card').forEach(function(card, i){
        card.classList.add('lg-reveal');
        if(i % 3 === 0) card.classList.add('lg-float', 'lg-float-delay-1');
        else if(i % 3 === 1) card.classList.add('lg-float', 'lg-float-delay-2');
        else card.classList.add('lg-float', 'lg-float-delay-3');
      });

      // Stats - floating with stagger
      document.querySelectorAll('.lg-stat').forEach(function(stat, i){
        stat.classList.add('lg-float');
        if(i % 3 === 0) stat.classList.add('lg-float-delay-1');
        else if(i % 3 === 1) stat.classList.add('lg-float-delay-2');
        else stat.classList.add('lg-float-delay-3');
      });

      // Section titles - slide + reveal
      document.querySelectorAll('.lg-section-title').forEach(function(title){
        title.classList.add('lg-reveal-left');
      });

      // Section labels - glow effect
      document.querySelectorAll('.lg-section-lbl').forEach(function(lbl){
        lbl.classList.add('lg-glow');
      });

      // Hero badge - pulse glow
      document.querySelectorAll('.lg-hero-badge').forEach(function(badge){
        badge.classList.add('lg-glow');
      });

      // Content paragraphs in posts - reveal
      document.querySelectorAll('.lg-post-card p').forEach(function(p){
        p.classList.add('lg-reveal');
      });

      // Team flip cards - floating
      document.querySelectorAll('.lg-team-flip').forEach(function(card, i){
        card.classList.add('lg-float');
        if(i % 2 === 0) card.classList.add('lg-float-delay-1');
        else card.classList.add('lg-float-delay-2');
      });

      // Feature boxes - reveal right
      document.querySelectorAll('.lg-feature-box, .lg-card-box').forEach(function(box, i){
        if(i % 2 === 0) box.classList.add('lg-reveal-left');
        else box.classList.add('lg-reveal-right');
      });
    })();



  });
})();
 
</script>