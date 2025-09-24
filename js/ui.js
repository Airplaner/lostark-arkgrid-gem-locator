// ----------------------------- UI Logic -----------------------------
import { solve } from "./solver.js";
import { Gem, Core } from "./models.js"

const fileInput = document.getElementById('fileInput');
const gemsListEl = document.getElementById('gemsList');
const addForm = document.getElementById('addForm');
const solverOutput = document.getElementById('solverOutput');
const searchBox = document.getElementById('searchBox');

let gems = [];

const STORAGE_KEY = "myGems";
function saveGems() {
    const serialized = JSON.stringify(gems, (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
    });
    localStorage.setItem("myGems", serialized);
}

window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            let raw_gems = JSON.parse(saved);
            raw_gems.forEach(e => {
                gems.push(new Gem({
                    index: BigInt(e.index),
                    req: e.req,
                    point: e.point,
                    att: e.att,
                    skill: e.skill,
                    boss: e.boss,
                }))
            });
            // console.log("Loaded gems from storage:", gems);
            renderGems();
        } catch (e) {
            // console.error("Failed to parse saved gems:", e);
        }
    }
});

function reindexGems() { gems.forEach((g, i) => g.index = BigInt(i)); }

export function renderGems(filter) {
    reindexGems();
    gemsListEl.innerHTML = '';
    // const q = (filter || '').toString().toLowerCase();
    for (const g of gems) {
        const optionArray = g.optionStrArray();
        // if (q && !s.toLowerCase().includes(q)) continue;
        const card = document.createElement('div'); card.className = 'gem';
        const h = document.createElement('h3'); h.textContent = `${g.req}W ${g.point}P`;
        const p = document.createElement('div');
        optionArray.forEach(text => {
            const div = document.createElement('div');
            div.className = 'gem-option'
            div.textContent = text; // 배열 요소를 div 안에 넣음
            p.appendChild(div);
        });
        const row = document.createElement('div'); row.className = 'row';
        // const btnEdit = document.createElement('button'); btnEdit.textContent = 'Edit'; btnEdit.onclick = () => fillForm(g);
        const btnDel = document.createElement('button'); btnDel.textContent = '삭제'; btnDel.onclick = () => { gems = gems.filter(x => x.index !== g.index); renderGems(searchBox.value); };
        // row.appendChild(btnEdit);
        row.appendChild(btnDel);
        card.appendChild(h); card.appendChild(p); card.appendChild(row);
        gemsListEl.appendChild(card);
    }
    if (!gems.length) gemsListEl.innerHTML = '<div class="muted">젬이 없습니다.</div>';
}

function fillForm(g) {
    document.getElementById('f_req').value = g.req;
    document.getElementById('f_point').value = g.point;
    document.getElementById('f_att').value = g.att;
    document.getElementById('f_skill').value = g.skill;
    document.getElementById('f_boss').value = g.boss;
}

function saveToLocal() {
    const data = gems.map(g => [g.req, g.point, g.att, g.skill, g.boss]);
    localStorage.setItem('gems_data', JSON.stringify(data));
    alert('saved to localStorage');
}
function loadFromLocal() {
    const raw = localStorage.getItem('gems_data');
    if (!raw) { alert('no gems in localStorage'); return; }
    try {
        const arr = JSON.parse(raw);
        gems = arr.map((item, idx) => new Gem({ index: idx, req: item[0], point: item[1], att: item[2], skill: item[3], boss: item[4] }));
        renderGems();
    } catch (e) { alert('failed to load: ' + e.message); }
}

document.getElementById('btnLoadStorage').onclick = () => loadFromLocal();
document.getElementById('btnSaveStorage').onclick = () => saveToLocal();
document.getElementById('btnClearAll').onclick = () => { if (confirm('모든 젬을 삭제하겠습니까?')) { localStorage.removeItem(STORAGE_KEY); gems = []; renderGems(); } };

fileInput.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            gems = data.map((item, idx) => new Gem({ index: idx, req: item[0], point: item[1], att: item[2], skill: item[3], boss: item[4] }));
            renderGems();
        } catch (err) { alert('Invalid JSON file: ' + err.message); }
    };
    reader.readAsText(f, 'utf-8');
});

addForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    try {
        const obj = {
            index: BigInt(gems.length),
            req: Number(document.querySelector('input[name="f_req"]:checked').value),
            point: Number(document.querySelector('input[name="f_point"]:checked').value),
            att: Number(document.querySelector('input[name="f_attack"]:checked').value) || 0,
            skill: Number(document.querySelector('input[name="f_skill"]:checked').value) || 0,
            boss: Number(document.querySelector('input[name="f_boss"]:checked').value) || 0,
        };
        const g = new Gem(obj);
        gems.push(g);
        renderGems(searchBox.value);
        for (const name of ['f_attack', 'f_skill', 'f_boss']) {
            const radios = document.querySelectorAll(`input[name="${name}"]`);
            radios.forEach(r => r.checked = r.value == 0);
        }
        saveGems();
    } catch (err) { alert('invalid gem: ' + err.message); }
});

document.getElementById('btnGenerate').onclick = () => {
    const k = 63; const out = []; let seed = 42; function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed; }
    for (let i = 0; i < k; i++) {
        const gem_type = rand() % 3;
        const req = gem_type + 8 - (3 + (rand() % 3));
        const point = 3 + (rand() % 3);
        const att = gem_type !== 2 ? (rand() % 6) : 0;
        const skill = gem_type !== 1 ? (rand() % 6) : 0;
        const boss = gem_type !== 0 ? (rand() % 6) : 0;
        out.push(new Gem({ index: i, req, point, att, skill, boss }));
    }
    gems = out; renderGems(); saveGems();
};

document.getElementById('btnRunSolver').onclick = () => {
    // try {
    const coreGrades = [
        document.querySelector('input[name="core0"]:checked').value,
        document.querySelector('input[name="core1"]:checked').value,
        document.querySelector('input[name="core2"]:checked').value
    ];
    const cores = [new Core(coreGrades[0], '질서', '해'), new Core(coreGrades[1], '질서', '달'), new Core(coreGrades[2], '질서', '별')];
    const t0 = performance.now();
    let solve_precision = Number(document.querySelector('input[name="solvePrecision"]:checked').value) || 100
    const res = solve(gems, cores, Math.pow(10, solve_precision));
    const dt = (performance.now() - t0).toFixed(2);
    if (!res.assign) solverOutput.innerHTML = `<div class="muted">배치 실패! (${dt}ms)</div>`;
    else {
        solverOutput.innerHTML = `<div>전투력 증가량: ${(res.answer * 100 - 100).toFixed(2)}% (${dt}ms 소요)</div>`;
        res.assign.forEach(gs => {
            solverOutput.appendChild(
                gs.toCard(gems)
            )
        });
    }
    // } catch (err) { alert('solver error: ' + err.message); }
};

function formatGemSet(gs) {
    const included = gems.filter(g => (gs.used_bitmask & (1n << g.index)) !== 0n).map(g => g.toString()).join(' ');
    return `${included} -> ${gs.point}P, att${gs.att}, skill${gs.skill}, boss${gs.boss}`;
}


searchBox.addEventListener('input', () => renderGems(searchBox.value));

renderGems();

export function gemsToJSON(gemList, filename = 'gems.json') {
    const outputArray = gemList.map(gem => [
        gem.req,
        gem.point,
        gem.att,
        gem.skill,
        gem.boss
    ]);
    const blob = new Blob([JSON.stringify(outputArray, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
document.getElementById('btnSaveAsJSONFile').onclick = () => { gemsToJSON(gems, "gems.json") };
