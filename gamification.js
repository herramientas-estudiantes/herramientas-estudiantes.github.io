// Gamification Engine V3
// Encargado de la UI de la Mascota, Tienda, Árbol de Habilidades y Ligas Simuladas

function initGamification() {
    injectModals();
    setupGamificationEvents();
    updatePetUI();
    generateLeagueBots();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamification);
} else {
    initGamification();
}

// ==========================================
// INYECCIÓN DE HTML (Modales)
// ==========================================
function injectModals() {
    const html = `
    <!-- MODAL: ÁRBOL DE HABILIDADES -->
    <div class="overlay" id="ov-skills">
      <div class="mbox" style="max-width:700px">
        <div class="mhead">
          <div class="mtitle">🧠 ÁRBOL DE HABILIDADES</div>
          <button class="mclose" data-ov="ov-skills">✕</button>
        </div>
        <div class="mbody">
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em;">Puntos de Habilidad (SP) Disponibles</div>
            <div style="font-size:32px; font-weight:700; color:var(--long); font-family:'Orbitron', monospace" id="skills-sp-count">0</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:4px;">Ganas 1 SP por cada nivel que subes.</div>
          </div>
          <div class="skills-tree" id="skills-tree" style="display:flex; flex-direction:column; gap:16px; padding:20px; background:var(--bg2); border-radius:12px; border:1px solid var(--border)">
            <!-- Se llena dinámicamente -->
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: TIENDA HACKER -->
    <div class="overlay" id="ov-shop">
      <div class="mbox" style="max-width:600px">
        <div class="mhead">
          <div class="mtitle">🛒 MERCADO NEGRO (Tienda)</div>
          <button class="mclose" data-ov="ov-shop">✕</button>
        </div>
        <div class="mbody">
          <div style="text-align:center; margin-bottom:20px;">
            <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em;">Tus Cyber-Créditos</div>
            <div style="font-size:32px; font-weight:700; color:var(--gold); font-family:'Orbitron', monospace" id="shop-cr-count">0 ¢</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:4px;">Ganas 50 ¢ por cada Pomodoro completado.</div>
          </div>
          <div class="shop-grid" id="shop-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <!-- Se llena dinámicamente -->
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: LIGAS -->
    <div class="overlay" id="ov-league">
      <div class="mbox" style="max-width:560px">
        <div class="mhead">
          <div class="mtitle">🏆 LIGA SEMANAL</div>
          <button class="mclose" data-ov="ov-league">✕</button>
        </div>
        <div class="mbody">
          <div style="text-align:center; margin-bottom:16px;">
            <div style="font-size:12px; color:var(--text-dim); text-transform:uppercase; letter-spacing:0.1em;">División Actual</div>
            <div style="font-size:24px; font-weight:700; color:var(--focus);" id="league-tier-name">Bronce</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:4px;">Ascenso/Descenso todos los domingos a las 23:59.</div>
          </div>
          <div style="background:var(--bg2); border:1px solid var(--border); border-radius:12px; padding:12px;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;" id="league-table">
              <!-- Se llena dinámicamente -->
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- MODAL: MASCOTA -->
    <div class="overlay" id="ov-pet">
      <div class="mbox" style="max-width:400px; text-align:center;">
        <div class="mhead">
          <div class="mtitle">🤖 CYBER-PET</div>
          <button class="mclose" data-ov="ov-pet">✕</button>
        </div>
        <div class="mbody">
          <div id="pet-modal-face" style="font-family:'Orbitron', monospace; font-size:48px; color:var(--short); margin:20px 0;">[^_^]</div>
          <div style="font-size:14px; color:var(--text); margin-bottom:12px;" id="pet-status-text">Tu mascota está a tope de energía.</div>
          <div style="width:100%; height:8px; background:var(--bg3); border-radius:4px; overflow:hidden; margin-bottom:20px;">
            <div id="pet-modal-energy" style="height:100%; width:100%; background:var(--short); transition:width 0.3s;"></div>
          </div>
          <p style="font-size:12px; color:var(--text-dim); line-height:1.6">Tu mascota se alimenta de tu concentración. Completa Pomodoros para recargar su batería. Si pasas varios días sin estudiar, se quedará sin energía.</p>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    // Re-bind close events for new modals
    document.querySelectorAll('#ov-skills .mclose, #ov-shop .mclose, #ov-league .mclose, #ov-pet .mclose').forEach(b => {
        b.addEventListener('click', () => closeOv(b.dataset.ov));
    });
}

function setupGamificationEvents() {
    // Nav Buttons
    const btnSkills = document.getElementById('btn-skills');
    const btnShop = document.getElementById('btn-shop');
    const btnLeague = document.getElementById('btn-league');

    if (btnSkills) btnSkills.addEventListener('click', () => { openOv('ov-skills'); renderSkills(); });
    if (btnShop) btnShop.addEventListener('click', () => { openOv('ov-shop'); renderShop(); });
    if (btnLeague) btnLeague.addEventListener('click', () => { openOv('ov-league'); renderLeague(); });
}

// ==========================================
// MASCOTA VIRTUAL
// ==========================================
window.updatePetUI = function() {
    const faceEl = document.getElementById('pet-face');
    const energyEl = document.getElementById('pet-energy');
    const modalFace = document.getElementById('pet-modal-face');
    const modalEnergy = document.getElementById('pet-modal-energy');
    const statusText = document.getElementById('pet-status-text');
    
    if (!faceEl) return;

    let e = S.pet.energy;
    let face = '[o_o]';
    let color = 'var(--short)';

    if (e >= 80) { face = '[^_^]'; color = 'var(--short)'; statusText && (statusText.textContent = "Tu mascota está feliz y con energía."); }
    else if (e >= 40) { face = '[o_o]'; color = 'var(--gold)'; statusText && (statusText.textContent = "Batería a la mitad. Haz algún Pomodoro."); }
    else if (e > 0) { face = '[-_-]'; color = 'var(--xp)'; statusText && (statusText.textContent = "Energía crítica. ¡Necesita focus!"); }
    else { face = '[x_x]'; color = '#ff3333'; statusText && (statusText.textContent = "Batería agotada. Completa un Pomodoro para revivirla."); }

    faceEl.textContent = face;
    faceEl.style.color = color;
    faceEl.style.textShadow = `0 0 8px ${color}`;
    energyEl.style.width = `${e}%`;
    energyEl.style.background = color;

    if (modalFace) {
        modalFace.textContent = face;
        modalFace.style.color = color;
        modalEnergy.style.width = `${e}%`;
        modalEnergy.style.background = color;
    }
}

// ==========================================
// ÁRBOL DE HABILIDADES
// ==========================================
const SKILLS = [
    { id: 't1_zen', name: 'Modo Zen', desc: 'Desbloquea el botón de Modo Zen para ocultar distracciones.', cost: 1, req: [] },
    { id: 't2a_theme', name: 'Terminal Hacker', desc: 'Desbloquea el tema visual de consola verde (PRÓXIMAMENTE).', cost: 2, req: ['t1_zen'] },
    { id: 't2b_battery', name: 'Batería Extendida', desc: 'Tu Cyber-Pet pierde energía un 50% más lento.', cost: 2, req: ['t1_zen'] },
    { id: 't3a_xp', name: 'Overclocking XP', desc: 'Gana +15 XP base adicionales en cada Pomodoro.', cost: 3, req: ['t2b_battery'] },
];

function renderSkills() {
    document.getElementById('skills-sp-count').textContent = S.skillPoints;
    const wrap = document.getElementById('skills-tree');
    wrap.innerHTML = '';

    SKILLS.forEach(sk => {
        const unlocked = S.skills.includes(sk.id);
        const canAfford = S.skillPoints >= sk.cost;
        const reqMet = sk.req.length === 0 || sk.req.every(r => S.skills.includes(r));
        const available = !unlocked && reqMet;

        let btnHtml = '';
        if (unlocked) {
            btnHtml = `<button disabled style="padding:6px 12px; background:transparent; color:var(--short); border:1px solid var(--short); border-radius:6px; font-size:11px;">✓ Desbloqueado</button>`;
        } else if (available) {
            btnHtml = `<button onclick="buySkill('${sk.id}')" style="padding:6px 12px; background:var(--long); color:#fff; border:none; border-radius:6px; font-size:11px; cursor:pointer; font-weight:600; opacity:${canAfford?1:0.5}">Desbloquear (${sk.cost} SP)</button>`;
        } else {
            btnHtml = `<button disabled style="padding:6px 12px; background:transparent; color:var(--text-faint); border:1px solid var(--text-faint); border-radius:6px; font-size:11px;">Bloqueado</button>`;
        }

        wrap.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px; border-left:4px solid ${unlocked?'var(--short)':available?'var(--long)':'var(--text-faint)'}">
            <div>
                <div style="font-size:14px; font-weight:600; color:${unlocked?'var(--short)':'var(--text)'}">${sk.name}</div>
                <div style="font-size:11px; color:var(--text-dim); margin-top:4px;">${sk.desc}</div>
                ${!reqMet ? `<div style="font-size:10px; color:#ff6b6b; margin-top:4px;">Requiere: ${sk.req.join(', ')}</div>` : ''}
            </div>
            <div>${btnHtml}</div>
        </div>`;
    });
}

window.buySkill = function(id) {
    const sk = SKILLS.find(s => s.id === id);
    if (!sk || S.skills.includes(id) || S.skillPoints < sk.cost) return;
    
    S.skillPoints -= sk.cost;
    S.skills.push(id);
    save();
    renderSkills();
    refreshXP();
    toast('t-done', 'HABILIDAD DESBLOQUEADA', sk.name);
}

// ==========================================
// TIENDA HACKER
// ==========================================
const ITEMS = [
    { id: 'streak_protector', name: 'Protector de Racha', icon: '🛡️', desc: 'Si un día no estudias, tu racha no se reiniciará a 0 (1 uso).', cost: 200 },
    { id: 'double_xp', name: 'Poción Overclock', icon: '⚡', desc: 'Multiplica x2 el XP que ganes en esta sesión (hasta recargar web).', cost: 500 },
];

function renderShop() {
    document.getElementById('shop-cr-count').textContent = S.credits + ' ¢';
    const wrap = document.getElementById('shop-grid');
    wrap.innerHTML = '';

    ITEMS.forEach(it => {
        let count = S.inventory.filter(x => x === it.id).length;
        if (it.id === 'double_xp' && S.activeBoosts.includes('double_xp')) count = "Activo";

        wrap.innerHTML += `
        <div style="background:var(--card); border:1px solid var(--border); border-radius:10px; padding:16px; text-align:center; position:relative;">
            ${count > 0 ? `<div style="position:absolute; top:8px; right:8px; background:var(--focus); color:#000; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:10px;">${count}</div>` : ''}
            <div style="font-size:32px; margin-bottom:8px;">${it.icon}</div>
            <div style="font-size:13px; font-weight:600; color:var(--text); margin-bottom:4px;">${it.name}</div>
            <div style="font-size:11px; color:var(--text-dim); line-height:1.4; margin-bottom:12px; height:46px;">${it.desc}</div>
            <button onclick="buyItem('${it.id}')" style="width:100%; padding:8px; background:rgba(255,214,0,0.1); border:1px solid rgba(255,214,0,0.3); color:var(--gold); border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; opacity:${S.credits >= it.cost ? 1 : 0.4}">
                Comprar (${it.cost} ¢)
            </button>
        </div>`;
    });
}

window.buyItem = function(id) {
    const it = ITEMS.find(i => i.id === id);
    if (!it || S.credits < it.cost) return;

    if (id === 'double_xp' && S.activeBoosts.includes('double_xp')) {
        toast('t-warn', 'YA ACTIVO', 'El boost ya está funcionando.');
        return;
    }

    S.credits -= it.cost;
    
    if (id === 'double_xp') {
        S.activeBoosts.push('double_xp');
    } else {
        S.inventory.push(id);
    }
    
    save();
    renderShop();
    refreshXP();
    toast('t-done', 'COMPRA REALIZADA', it.name);
}

// ==========================================
// LIGAS SIMULADAS
// ==========================================
const TIERS = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Leyenda'];
const NAMES = ['Alex_99', 'EstudiantePro', 'PomodoroKing', 'NeoHacker', 'CyberStudy', 'Marta_Uni', 'Dev_Null', 'FocusMaster', 'David_X', 'Sara_Bio', 'Juan_Eng', 'LofiGirl', 'BetaTester', 'ZeroCool'];

function generateLeagueBots() {
    if (S.league.rivals.length > 0) return; // Ya generados

    // Generar 14 rivales aleatorios
    let selectedNames = [...NAMES].sort(() => 0.5 - Math.random()).slice(0, 14);
    
    S.league.rivals = selectedNames.map(name => {
        // Los bots de ligas altas hacen más puntos
        const baseXP = (S.league.tier + 1) * 200;
        const randomXP = Math.floor(Math.random() * 500);
        return { name, score: baseXP + randomXP };
    });
    save();
}

// Simular progreso de los bots diariamente (Llamado en loadState o al abrir)
window.simulateBots = function() {
    // Para simplificar, añadimos un poco de XP aleatorio a los bots cada vez que se abre la liga
    S.league.rivals.forEach(bot => {
        bot.score += Math.floor(Math.random() * ((S.league.tier+1) * 50));
    });
    save();
}

function renderLeague() {
    simulateBots();
    document.getElementById('league-tier-name').textContent = TIERS[S.league.tier];
    
    const table = document.getElementById('league-table');
    table.innerHTML = `
        <tr style="border-bottom:1px solid var(--border); color:var(--text-dim);">
            <th style="padding:10px; text-align:left;">#</th>
            <th style="padding:10px; text-align:left;">Usuario</th>
            <th style="padding:10px; text-align:right;">XP Semanal</th>
        </tr>
    `;

    // Unir usuario con bots y ordenar
    let all = [...S.league.rivals, { name: 'TÚ', score: S.league.weekScore, isUser: true }];
    all.sort((a, b) => b.score - a.score);

    all.forEach((player, index) => {
        let rowStyle = "";
        let nameColor = "var(--text)";
        
        if (player.isUser) {
            rowStyle = "background:rgba(0,212,255,0.1); font-weight:bold;";
            nameColor = "var(--focus)";
        }
        
        let rankColor = "var(--text-dim)";
        if (index < 3) rankColor = "var(--short)"; // Ascenso (Verde)
        if (index > all.length - 4) rankColor = "#ff6b6b"; // Descenso (Rojo)

        table.innerHTML += `
        <tr style="${rowStyle}; border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:10px; color:${rankColor}; font-weight:700;">${index + 1}</td>
            <td style="padding:10px; color:${nameColor};">${player.name}</td>
            <td style="padding:10px; text-align:right; font-family:'Orbitron', monospace;">${player.score}</td>
        </tr>`;
    });
}
