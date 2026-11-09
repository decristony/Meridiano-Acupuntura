(() => {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cab = document.getElementById('cab');
  const sc = () => cab.classList.toggle('cheio', scrollY > 60);
  addEventListener('scroll', sc, { passive: true }); sc();
  const mb = document.querySelector('.menu-bt'), nav = document.querySelector('.nav');
  mb.addEventListener('click', () => { const a = nav.classList.toggle('aberto'); mb.setAttribute('aria-expanded', a); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('aberto'); mb.setAttribute('aria-expanded', false); }));

  // HERO: luzes do fundo que respiram (posições na foto, object-fit: cover, object-position 50% 50%)
  const hero = document.querySelector('.hero'), foto = hero.querySelector('.h-foto');
  const cones = [[.292, .147], [.36, .342], [.102, .405]];
  const brasas = [...hero.querySelectorAll('.brasas i')];
  const posBrasas = () => {
    const W = hero.clientWidth, H = hero.clientHeight;
    const iw = foto.naturalWidth || 2000, ih = foto.naturalHeight || 1333;
    if (W < 761) { brasas.forEach(b => b.style.display = 'none'); return; }
    const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
    const ox = (W - dw) * .5, oy = (H - dh) * .5;
    brasas.forEach((b, i) => { b.style.display = ''; b.style.setProperty('--x', (ox + cones[i][0] * dw) + 'px'); b.style.setProperty('--y', (oy + cones[i][1] * dh) + 'px'); });
  };
  foto.complete ? posBrasas() : foto.addEventListener('load', posBrasas);
  addEventListener('resize', posBrasas);

  // HERO: o título se forma a partir da fumaça e volta a se mover quando o cursor "sopra"
  const disp = document.getElementById('fDisp'), turb = document.getElementById('fTurb');
  const titulo = hero.querySelector('.h-titulo');
  if (!reduz && disp) {
    let t0 = performance.now(), sopro = 0, vivo = true;
    const passo = t => {
      const e = Math.min(1, (t - t0) / 2800);
      const base = 90 * Math.pow(1 - e, 2.2);
      sopro *= 0.94;
      const s = base + sopro;
      disp.setAttribute('scale', s.toFixed(2));
      turb.setAttribute('baseFrequency', `${(0.012 + Math.sin(t / 2400) * 0.002).toFixed(4)} ${(0.03 + Math.cos(t / 3000) * 0.004).toFixed(4)}`);
      if (s < 0.05 && e >= 1) { disp.setAttribute('scale', 0); vivo = false; return; }
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
    let ultimo = null;
    titulo.addEventListener('pointermove', ev => {
      const v = ultimo ? Math.hypot(ev.clientX - ultimo[0], ev.clientY - ultimo[1]) : 0;
      ultimo = [ev.clientX, ev.clientY];
      sopro = Math.min(16, sopro + v * 0.25);
      if (!vivo) { vivo = true; t0 = performance.now() - 2800; requestAnimationFrame(passo); }
    });
    titulo.addEventListener('pointerleave', () => { ultimo = null; });
  } else if (titulo) { titulo.style.filter = 'none'; }

  // LINHA DO MERIDIANO: pontos em cada seção, que acendem com a rolagem
  const linha = document.querySelector('.linha-meridiano'), enche = linha.querySelector('.enche');
  const main = document.querySelector('main');
  const secs = [...document.querySelectorAll('main section[data-ponto]')].slice(1);
  const pts = secs.map(s => {
    const p = document.createElement('i'); p.className = 'pt-m'; p.setAttribute('aria-hidden', 'true');
    p.innerHTML = `<span>${s.dataset.ponto}</span>`; main.appendChild(p); return { s, p };
  });
  const escuras = ['pausa', 'escuro'];
  let topoLinha = 0;
  const posPts = () => {
    topoLinha = linha.offsetTop;
    pts.forEach(o => { o.y = o.s.offsetTop + 60; o.p.style.top = o.y + 'px'; o.p.classList.toggle('esc', escuras.some(c => o.s.classList.contains(c))); });
  };
  const rola = () => {
    const meio = scrollY + innerHeight * .6;
    enche.style.setProperty('--fill', Math.max(0, meio - topoLinha) + 'px');
    pts.forEach(o => o.p.classList.toggle('aceso', meio > o.y));
  };
  addEventListener('load', () => { posPts(); rola(); });
  addEventListener('resize', () => { posPts(); rola(); });
  addEventListener('scroll', rola, { passive: true });
  posPts(); rola();

  // TERAPIAS: holofote quente que segue o cursor
  document.querySelectorAll('.tc').forEach(c => c.addEventListener('pointermove', e => {
    const b = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - b.left) + 'px'); c.style.setProperty('--my', (e.clientY - b.top) + 'px');
  }));

  // PLANO DE 8 SEMANAS
  const Q = {
    lombar: { img: 'tuina', alt: 'Mãos de terapeuta massageando as costas de um paciente', base: 8, tec: ['Acupuntura', 'Ventosaterapia', 'Tuiná'] },
    enxaqueca: { img: 'agulha', alt: 'Agulha de acupuntura fina inserida no ombro tatuado de um paciente', base: 8, tec: ['Acupuntura', 'Diário de crises', 'Fitoterapia'] },
    ansiedade: { img: 'moxa', alt: 'Mão de luva segurando um bastão de moxa aceso perto das costas de uma paciente', base: 7, tec: ['Acupuntura', 'Auriculoterapia', 'Respiração guiada'] },
    insonia: { img: 'ervas', alt: 'Tigela de madeira com raízes e ervas secas da fitoterapia chinesa', base: 7, tec: ['Acupuntura', 'Moxabustão', 'Fitoterapia'] },
    nausea: { img: 'agulha', alt: 'Agulha de acupuntura fina inserida no ombro tatuado de um paciente', base: 5, tec: ['Acupuntura', 'Ponto PC6 em casa', 'Obstetra informado'] },
    rinite: { img: 'ventosa', alt: 'Ventosas de vidro aplicadas nas costas de um paciente', base: 6, tec: ['Acupuntura', 'Moxabustão', 'Fitoterapia'] }
  };
  const TEMPO = ['dias', 'semanas', '3 meses', '6 meses', '1 ano', 'anos'];
  const tempo = document.getElementById('plTempo'), int = document.getElementById('plInt');
  const cal = document.getElementById('plCal'), img = document.getElementById('plImg');
  let h = '';
  for (let s = 0; s < 8; s++) h += `<div class="sem"><i class="d"></i><i class="d"></i><small>S${s + 1}</small></div>`;
  cal.innerHTML = h;
  const dots = [...cal.querySelectorAll('.sem')].map(s => [...s.querySelectorAll('.d')]);
  const atualiza = () => {
    const q = Q[document.querySelector('input[name=q]:checked').value];
    const t = +tempo.value, i = +int.value;
    document.getElementById('plTempoTxt').textContent = TEMPO[t];
    document.getElementById('plIntTxt').textContent = i + ' de 10';
    tempo.style.setProperty('--p', (t / 5 * 100) + '%'); int.style.setProperty('--p', ((i - 1) / 9 * 100) + '%');
    // semanas com duas sessões no início
    const duplas = Math.min(4, Math.round((t >= 3 ? 2 : 1) + (i >= 7 ? 2 : i >= 4 ? 1 : 0) - (q.base < 6 ? 1 : 0)));
    const total = Math.min(14, q.base + duplas - (t <= 1 && i <= 4 ? 2 : 0));
    let n = 0;
    dots.forEach((par, w) => {
      const d1 = w < 8 && n < total; if (d1) n++;
      const d2 = w < duplas && n < total; if (d2) n++;
      par[0].classList.toggle('on', d1); par[1].classList.toggle('on', d2);
    });
    document.getElementById('plSess').textContent = n;
    document.getElementById('plRitmo').textContent = duplas ? `Duas sessões por semana nas primeiras ${duplas === 1 ? 'semana' : duplas + ' semanas'}, depois uma.` : 'Uma sessão por semana, com reavaliação na quarta.';
    document.getElementById('plTec').innerHTML = q.tec.map(x => `<li>${x}</li>`).join('');
    const src = `assets/${q.img}-560.webp`;
    if (!img.src.endsWith(src)) {
      img.classList.add('sai');
      const pre = new Image(); pre.src = src;
      const tr = () => { img.src = src; img.alt = q.alt; requestAnimationFrame(() => img.classList.remove('sai')); };
      pre.decode ? pre.decode().then(tr, tr) : (pre.onload = tr);
    }
  };
  document.querySelectorAll('input[name=q]').forEach(r => r.addEventListener('change', atualiza));
  tempo.addEventListener('input', atualiza); int.addEventListener('input', atualiza);
  atualiza();

  // ENTRADAS SUAVES: um único IntersectionObserver; cada elemento entra uma vez, em cascata dentro do seu grupo
  if (!reduz && 'IntersectionObserver' in window) {
    const grupos = [
      ['.intro .rot, .intro-frase, .in-p, .in-dados div, .intro .acoes', 'txt'],
      ['.in-f1, .sp-foto, .pl-foto', 'img'],
      ['.in-f2', 'card'],
      ['.sec-h > *', 'txt'],
      ['.tc', 'card'],
      ['.sp-txt > .rot, .sp-txt > h2, .sp-txt > p, .tempos li, .sp-txt > .acoes', 'txt'],
      ['.pl-cab > *', 'txt'],
      ['.pl-corpo', 'card'],
      ['.pausa-txt > *', 'txt'],
      ['.es-in > .rot, .es-in > h2, .es-cols div, .es-in > .acoes', 'txt'],
      ['.pessoa', 'card'],
      ['.faq h2, .faq details, .ct-card', 'txt']
    ];
    const todos = [];
    grupos.forEach(([sel, tipo]) => {
      const els = [...document.querySelectorAll(sel)];
      const porSecao = new Map();
      els.forEach(el => {
        const sec = el.closest('section') || document.body;
        const i = porSecao.get(sec) || 0; porSecao.set(sec, i + 1);
        el.dataset.rv = tipo;
        el.style.setProperty('--d', (Math.min(i, 6) * 0.09 + (tipo === 'card' && el.classList.contains('in-f2') ? 0.35 : 0)).toFixed(2) + 's');
        todos.push(el);
      });
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    todos.forEach(el => io.observe(el));
    // quem chega por âncora ou recarrega no meio da página: o que já está acima da tela aparece pronto
    requestAnimationFrame(() => todos.forEach(el => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('on'); }));
  }
})();
