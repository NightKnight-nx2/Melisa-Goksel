'use strict';
gsap.registerPlugin(ScrollTrigger);

const rand = (min, max) => Math.random() * (max - min) + min;

/* ─────────────────────────────────────────────────────────────
   STARS CANVAS FACTORY  — reusable for space & birthday
───────────────────────────────────────────────────────────── */
function makeStarCanvas(canvasEl, count, colorFn) {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  function resize() { canvasEl.width = canvasEl.offsetWidth; canvasEl.height = canvasEl.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({ length: count }, () => ({
    x: Math.random(), y: Math.random(),
    r: rand(0.3, 2.2), op: rand(0.3, 1), spd: rand(1.2, 4)
  }));
  let t = 0;
  (function draw() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    t += 0.012;
    stars.forEach(s => {
      const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.spd));
      ctx.beginPath();
      ctx.arc(s.x * canvasEl.width, s.y * canvasEl.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = colorFn(s.op * tw);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

/* ═══════════════════════════════════════════════════════════
   1. HERO — Daisies
═══════════════════════════════════════════════════════════ */
(function heroInit() {
  const container = document.getElementById('daisyContainer');
  if (!container) return;

  function makeDaisy(size, petalColor, centerColor) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 100 100');
    for (let i = 0; i < 12; i++) {
      const el = document.createElementNS(ns, 'ellipse');
      el.setAttribute('cx','50'); el.setAttribute('cy','22');
      el.setAttribute('rx','8');  el.setAttribute('ry','18');
      el.setAttribute('fill', petalColor);
      el.setAttribute('transform', `rotate(${(i/12)*360} 50 50)`);
      el.setAttribute('opacity','0.92');
      svg.appendChild(el);
    }
    const c1 = document.createElementNS(ns,'circle');
    c1.setAttribute('cx','50'); c1.setAttribute('cy','50'); c1.setAttribute('r','16'); c1.setAttribute('fill',centerColor);
    svg.appendChild(c1);
    const c2 = document.createElementNS(ns,'circle');
    c2.setAttribute('cx','50'); c2.setAttribute('cy','50'); c2.setAttribute('r','9');  c2.setAttribute('fill','rgba(0,0,0,0.25)');
    svg.appendChild(c2);
    return svg;
  }

  const palette = [
    { petal:'#f0e6ff', center:'#f5c518' }, { petal:'#e9d5ff', center:'#f0a030' },
    { petal:'#ffffff', center:'#ffd700' }, { petal:'#ddd6fe', center:'#e5a020' },
    { petal:'#f3e8ff', center:'#ff9f40' },
  ];

  const count = window.innerWidth < 600 ? 14 : 22;
  const daisies = [];

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'daisy';
    const size = rand(55, 130);
    const col  = palette[Math.floor(rand(0, palette.length))];
    wrap.appendChild(makeDaisy(size, col.petal, col.center));
    wrap.style.left    = rand(0, 95) + '%';
    wrap.style.top     = rand(5, 85) + '%';
    const baseOp = rand(0.3, 0.8);
    wrap.dataset.baseOp = baseOp;
    wrap.style.opacity  = baseOp;
    container.appendChild(wrap);
    daisies.push(wrap);

    /* Idle: rotation only — no conflict with scroll exit's x,y,opacity */
    gsap.to(wrap, {
      rotation: rand(-14, 14),
      duration: rand(2.5, 5), repeat: -1, yoyo: true,
      ease: 'sine.inOut', delay: rand(0, 3)
    });
  }

  /* Entrance */
  gsap.to('#heroSub',    { opacity:1, duration:1,   delay:0.3, ease:'power2.out' });
  gsap.to('#heroTitle',  { opacity:1, duration:1.2, delay:0.8, ease:'power2.out' });
  gsap.to('#scrollHint', { opacity:1, duration:1,   delay:2,   ease:'power2.out' });
  daisies.forEach((d, i) =>
    gsap.fromTo(d, { opacity:0, scale:0 }, {
      opacity: parseFloat(d.dataset.baseOp), scale:1,
      duration:0.8, delay:0.1 + i*0.08, ease:'back.out(1.7)'
    })
  );

  /* Scroll exit — scrubbed TIMELINE (x, y, opacity — no rotation conflict)
     Bidirectional: GSAP reverses the timeline when scrolling back up. */
  const exitTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end:   'bottom top',
      scrub: 1
    }
  });
  daisies.forEach((d, i) => {
    const angle  = (i / daisies.length) * 360;
    const dist   = 380 + i * 14;
    const baseOp = parseFloat(d.dataset.baseOp);
    exitTl.to(d, {
      x:       Math.cos(angle * Math.PI / 180) * dist,
      y:       Math.sin(angle * Math.PI / 180) * dist,
      opacity: 0,
      ease:   'power1.in',
      duration: 1
    }, 0); /* all at position 0 → start simultaneously */
  });
})();

/* ═══════════════════════════════════════════════════════════
   2. SPACE — Stars + Plüton orbit + Shooting stars
═══════════════════════════════════════════════════════════ */
(function spaceInit() {
  makeStarCanvas(
    document.getElementById('starsCanvas'), 300,
    op => `rgba(220,200,255,${op})`
  );

  /* Planet entrances (once) */
  ScrollTrigger.create({
    trigger: '#space',
    start: 'top 75%',
    once: true,
    onEnter() {
      /* Jüpiter */
      gsap.to('#jupiterWrapper', { opacity:1, scale:1, duration:1.6, ease:'power3.out' });
      /* Plüton */
      gsap.to('#plutoWrapper', { opacity:1, duration:1.2, delay:0.5, ease:'power2.out' });
      /* Quote */
      gsap.to('#spaceQuote', { opacity:1, y:0, duration:1.2, delay:1, ease:'power2.out' });
    }
  });

  /* Jüpiter sürekli yavaş döner (scroll'dan bağımsız) */
  gsap.to('#jupiterWrapper', {
    rotation: 360, duration: 90, repeat: -1, ease: 'none'
  });

  /* Plüton Jüpiter'in etrafında döner (scroll'dan bağımsız)
     plutoOrbit pivot noktası = Jüpiter merkezi (transform-origin: 0 0)
     plutoWrapper Plüton'u upright tutar (counter-rotation) */
  const ORBIT_DURATION = 18;
  gsap.to('#plutoOrbit', {
    rotation: 360, duration: ORBIT_DURATION, repeat: -1, ease: 'none',
    transformOrigin: '0 0'
  });
  gsap.to('#plutoWrapper', {
    rotation: -360, duration: ORBIT_DURATION, repeat: -1, ease: 'none',
    transformOrigin: '50% 50%'
  });

  /* Jüpiter yavaş yüzer */
  gsap.to('#jupiterWrapper', {
    y: -18, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.5
  });

  /* Kayan yıldızlar — scrubbed (bidirectional) */
  const starTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#space',
      start: 'top top',
      end:   'bottom top',
      scrub: 1.5
    }
  });
  starTl
    .fromTo('#shootingStar1',
      { x:'45vw',  y:'-5vh', opacity:0 },
      { x:'-25vw', y:'48vh', opacity:1, duration:0.4, ease:'none' }
    )
    .to('#shootingStar1', { opacity:0, duration:0.08, ease:'none' })
    .fromTo('#shootingStar2',
      { x:'70vw',  y:'-8vh', opacity:0 },
      { x:'-2vw',  y:'42vh', opacity:1, duration:0.3, ease:'none' }, '+=0.18'
    )
    .to('#shootingStar2', { opacity:0, duration:0.06, ease:'none' });
})();

/* ═══════════════════════════════════════════════════════════
   3. BUBBLE OVERLAY — Uzay→Bikini geçiş (bidirectional)
   Trigger: space section bitişinden bikini section ortasına
═══════════════════════════════════════════════════════════ */
(function bubbleOverlayInit() {
  const overlay = document.getElementById('bubbleOverlay');
  if (!overlay) return;

  const BUB_COUNT = 80;
  const bubEls    = [];

  for (let i = 0; i < BUB_COUNT; i++) {
    const b    = document.createElement('div');
    b.className = 'bub';
    const size  = rand(10, 70);
    b.style.cssText = `
      width:${size}px; height:${size}px;
      left:${rand(0, 96)}%;
      bottom:-${size + 20}px;
    `;
    overlay.appendChild(b);
    bubEls.push({ el: b, size, baseLeft: parseFloat(b.style.left) });
  }

  /* Trigger span: yaklaşık olarak space bölümünün sonu → bikini bölümünün ortası */
  ScrollTrigger.create({
    trigger: '#space',
    start: 'bottom 85%',     /* uzay bölümü biterken başla */
    endTrigger: '#bikini',
    end: 'center center',     /* bikini ortasında tam bitsin */
    scrub: 0.8,
    onUpdate(self) {
      const p = self.progress; // 0 → 1

      /* Görünürlük: 0→0.35 fade in, 0.35→0.65 tam görünür, 0.65→1 fade out */
      const vis = p < 0.35
        ? p / 0.35
        : p < 0.65
          ? 1
          : 1 - (p - 0.65) / 0.35;

      bubEls.forEach((b, i) => {
        const travel = (window.innerHeight * 1.35) * p;
        const wobble = Math.sin(p * Math.PI * 2 + i) * 18;
        gsap.set(b.el, {
          y:       -travel,
          x:       wobble,
          opacity: Math.max(0, vis * 0.85)
        });
      });
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   4. BİKİNİ — Ambient bubbles + Quote/Image reveal + Jellyfish
═══════════════════════════════════════════════════════════ */
(function bikiniInit() {
  /* Ambient bubbles */
  const ambEl = document.getElementById('ambientBubbles');
  if (ambEl) {
    for (let i = 0; i < 28; i++) {
      const b    = document.createElement('div');
      b.className = 'ambient-bubble';
      const size  = rand(5, 24);
      b.style.cssText = `
        width:${size}px; height:${size}px;
        left:${rand(0, 97)}%;
        bottom:${rand(-5, 15)}%;
        animation-duration:${rand(7, 18)}s;
        animation-delay:${rand(0, 8)}s;
      `;
      ambEl.appendChild(b);
    }
  }

  /* Quote + image scrubbed reveal */
  const revealTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#bikini',
      start: 'top 60%',
      end:   'center center',
      scrub: 1
    }
  });
  revealTl
    .to('#bikiniQuote', { opacity:1, y:0, duration:1 })
    .to('#bikiniImg',   { opacity:1,       duration:1 }, '-=0.5');

  /* Jellyfish — rastgele başlangıç pozisyonları, sürekli yüzer */
  const jfConfigs = [
    { id:'jf1', left:'8%',  top:'20%', scaleX:  1 },
    { id:'jf2', left:'75%', top:'15%', scaleX: -1 },
    { id:'jf3', left:'30%', top:'55%', scaleX:  1 },
    { id:'jf4', left:'60%', top:'40%', scaleX: -1 },
  ];
  jfConfigs.forEach(cfg => {
    const el = document.getElementById(cfg.id);
    if (!el) return;
    gsap.set(el, { left: cfg.left, top: cfg.top, scaleX: cfg.scaleX, opacity: 0 });
    /* Fade in when bikini section enters */
    ScrollTrigger.create({
      trigger: '#bikini', start: 'top 70%', once: true,
      onEnter: () => gsap.to(el, { opacity: rand(0.55, 0.9), duration: 1.2, delay: rand(0, 0.8) })
    });
    /* Continuous random float — x drift + y pulse */
    gsap.to(el, {
      x: () => rand(-30, 30),
      y: () => rand(-25, 25),
      duration: () => rand(3, 6),
      repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: rand(0, 3)
    });
    gsap.to(el, {
      scaleY: rand(0.88, 1.12),
      duration: rand(1.5, 2.5), repeat: -1, yoyo: true, ease: 'sine.inOut',
      delay: rand(0, 2)
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   5. MADAGASCAR — Quote fade + Marty scrub (bidirectional)
   FIX: start:'top center' / end:'bottom center' → karakter
        sayfa ortasındayken tam ekran ortasında olur.
═══════════════════════════════════════════════════════════ */
(function madagascarInit() {
  gsap.to('#madagascarQuote', {
    opacity: 1,
    scrollTrigger: {
      trigger: '#madagascar',
      start: 'top 65%', end: 'top 30%', scrub: 1
    }
  });

  /* Marty:  sağdan girer (x=110vw) → ortada (x≈0) → soldan çıkar (x=-110vw)
     50% progress = section centered on screen = x = 0                        */
  gsap.fromTo('#marty',
    { x: '110vw' },
    {
      x: '-110vw',
      ease: 'none',
      scrollTrigger: {
        trigger: '#madagascar',
        start: 'top center',    /* section top at viewport center → karakter sağda */
        end:   'bottom center', /* section bottom at viewport center → karakter solda */
        scrub: 1.2
      }
    }
  );
})();

/* ═══════════════════════════════════════════════════════════
   6. CARS — Quote fade + McQueen scrub (bidirectional)
═══════════════════════════════════════════════════════════ */
(function carsInit() {
  gsap.to('#carsQuote', {
    opacity: 1,
    scrollTrigger: {
      trigger: '#cars',
      start: 'top 65%', end: 'top 30%', scrub: 1
    }
  });

  gsap.fromTo('#lightning',
    { x: '110vw' },
    {
      x: '-110vw',
      ease: 'none',
      scrollTrigger: {
        trigger: '#cars',
        start: 'top center',
        end:   'bottom center',
        scrub: 1.2
      }
    }
  );
})();

/* ═══════════════════════════════════════════════════════════
   7. DESSERT — Sparkles + Item entrances (bidirectional)
═══════════════════════════════════════════════════════════ */
(function dessertInit() {
  const spkEl = document.getElementById('sparklesContainer');
  if (spkEl) {
    for (let i = 0; i < 30; i++) {
      const s = document.createElement('div');
      s.style.cssText = `
        position:absolute;
        width:${rand(2,6)}px; height:${rand(2,6)}px;
        background:rgba(${Math.floor(rand(180,255))},${Math.floor(rand(100,200))},255,.7);
        border-radius:50%;
        left:${rand(0,100)}%; top:${rand(0,100)}%;
      `;
      spkEl.appendChild(s);
      gsap.to(s, { y:rand(-30,30), x:rand(-20,20), opacity:rand(.2,1), duration:rand(2,5), repeat:-1, yoyo:true, ease:'sine.inOut', delay:rand(0,3) });
    }
  }

  const items = [
    { id:'#dess1', from:{ y:-200, x:0    } },
    { id:'#dess2', from:{ y:0,    x:-200 } },
    { id:'#dess3', from:{ y:0,    x:200  } },
    { id:'#dess4', from:{ y:-200, x:0    } },
  ];
  const dtl = gsap.timeline({
    scrollTrigger: { trigger:'#dessert', start:'top 70%', end:'center center', scrub:1 }
  });
  items.forEach(({ id, from }, i) => {
    dtl.fromTo(id,
      { opacity:0, ...from, rotation:rand(-20,20) },
      { opacity:1, x:0, y:0, rotation:0, duration:0.4, ease:'power2.out' },
      i * 0.12
    );
  });
  dtl.to('#dessertQuote', { opacity:1, y:0, duration:0.5 }, '-=0.1');

  items.forEach(({ id }, i) => {
    gsap.to(id, { y:rand(-10,10), rotation:rand(-3,3), duration:rand(2,3.5), repeat:-1, yoyo:true, ease:'sine.inOut', delay:i*0.2+1 });
  });
})();

/* ═══════════════════════════════════════════════════════════
   8. MEMORIES — Star canvas + Card stagger reveal
═══════════════════════════════════════════════════════════ */
(function memoriesInit() {
  makeStarCanvas(
    document.getElementById('memStarsCanvas'), 160,
    op => `rgba(200,170,255,${op})`
  );

  const memTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#memories',
      start: 'top 65%',
      end:   'center center',
      scrub: 1
    }
  });
  memTl
    .to('#memoriesHeading', { opacity:1, y:0, duration:0.5 })
    .to('#mem1', { opacity:1, y:0, duration:0.5 }, '-=0.1')
    .to('#mem2', { opacity:1, y:0, duration:0.5 }, '-=0.3')
    .to('#mem3', { opacity:1, y:0, duration:0.5 }, '-=0.3');
})();

/* ═══════════════════════════════════════════════════════════
   9. BIRTHDAY — Stars + Confetti + Reveal
═══════════════════════════════════════════════════════════ */
(function birthdayInit() {
  makeStarCanvas(
    document.getElementById('birthdayStars'), 130,
    op => `rgba(220,180,255,${op})`
  );

  const colors  = ['#a855f7','#c084fc','#e9d5ff','#7c3aed','#d946ef','#f0abfc'];
  const confEl   = document.getElementById('confettiContainer');

  function spawnConfetti() {
    if (!confEl) return;
    for (let i = 0; i < 55; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      const size = rand(5, 13);
      p.style.cssText = `
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(rand(0,colors.length))]};
        left:${rand(0,100)}%; top:-10px;
        border-radius:${Math.random()>.5?'50%':'2px'};
      `;
      confEl.appendChild(p);
      gsap.to(p, {
        y: window.innerHeight + 60, x: rand(-120,120),
        rotation: rand(0,720), opacity: 0,
        duration: rand(2,5), delay: rand(0,2),
        ease: 'power1.in', onComplete: () => p.remove()
      });
    }
  }

  ScrollTrigger.create({
    trigger: '#birthday', start: 'top 70%', once: true,
    onEnter() {
      gsap.to('#birthdayContent', { opacity:1, duration:1.6, ease:'power2.out' });
      spawnConfetti();
      setTimeout(spawnConfetti, 1500);
      setTimeout(spawnConfetti, 3200);
      gsap.to('#heartRow', { scale:1.15, duration:.8, repeat:-1, yoyo:true, ease:'sine.inOut', delay:1 });
    }
  });
})();
