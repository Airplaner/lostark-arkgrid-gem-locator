// ----------------------------- UI Logic -----------------------------
import { Gem, Core, GemSet, gemSetToard } from "./models.js"

const fileInput = document.getElementById('fileInput');
const gemsListEl = document.getElementById('gemsList');
const addForm = document.getElementById('addForm');
const solverOutput = document.getElementById('solverOutput');
const searchBox = document.getElementById('searchBox');

let gems = [];

const STORAGE_KEY = "myGems";
function saveGems() {
    // 현재 메모리에 있는 Gem 객체를 local storage에 저장
    const serialized = JSON.stringify(gems, (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value;
    });
    localStorage.setItem("myGems", serialized);
}

window.addEventListener("DOMContentLoaded", () => {
    // DOM 로드가 끝나면 local storage에서 Gem 객체 생성
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            let rawGems = JSON.parse(saved);
            rawGems.forEach(item => {
                gems.push(new Gem(item))
            });
            renderGems();
        } catch (e) {
        }
    }
});

function reindexGems() {
    // 모든 Gem을 타입, 의지력 오름차순, 포인트 내림차순으로 정렬
    // 이후 index를 0부터 매김
    // TODO BigInt 범위 때문에 각 타입별 젬은 63개 이하로 제한해야 함
    const typeOrder = { '질서': 0, '혼돈': 1 };

    gems.sort((a, b) => {
        // 1. 타입 순서 비교
        if (typeOrder[a.type] !== typeOrder[b.type]) {
            return typeOrder[a.type] - typeOrder[b.type];
        }

        // 2. req 오름차순
        if (a.req !== b.req) {
            return a.req - b.req;
        }

        // 3. point 내림차순
        return b.point - a.point;
    });

    // 각 타입별로 번호 0부터 매김
    ['질서', '혼돈'].forEach(type => {
        gems
            .filter(g => g.type === type)
            .forEach((g, i) => g.index = BigInt(i));
    });
}

export function renderGems() {
    reindexGems();
    gemsListEl.innerHTML = '';

    const gemType = document.querySelector('.gem-filter.primary')?.dataset.type || '';

    for (const g of (gemType ? gems.filter(g => g.type === gemType) : gems)) {
        // TODO Gem의 ToCard로 대체
        const optionArray = g.optionStrArray();
        const card = document.createElement('div'); card.className = 'gem';
        const h = document.createElement('h3'); h.textContent = `${g.req}W ${g.point}P (${g.type})`;
        const p = document.createElement('div');
        optionArray.forEach(text => {
            const div = document.createElement('div');
            div.className = 'gem-option'
            div.textContent = text; // 배열 요소를 div 안에 넣음
            p.appendChild(div);
        });
        const row = document.createElement('div'); row.className = 'row';

        // TODO 버튼 위치 조정
        const btnDel = document.createElement('button');
        btnDel.textContent = '삭제';
        btnDel.onclick = () => {
            gems = gems.filter(x => !(x.type === g.type && x.index === g.index));
            renderGems();
            saveGems();
        };
        row.appendChild(btnDel);
        card.appendChild(h); card.appendChild(p); card.appendChild(row);
        gemsListEl.appendChild(card);
    }
    if (!gems.length) gemsListEl.innerHTML = '<div class="muted">젬이 없습니다.</div>';
}

// gem filter를 하나만 활성화 가능하게 관리
const filterButtons = document.querySelectorAll('.gem-filter');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 모든 버튼에서 primary 제거
        filterButtons.forEach(b => b.classList.remove('primary'));
        // 클릭한 버튼만 primary 추가
        btn.classList.add('primary');
        // renderGems 호출, 선택된 타입만 보여줌
        renderGems();
    });
});

// 젬 초기화
document.getElementById('btnClearAll').onclick = () => {
    if (confirm('모든 젬을 삭제하겠습니까?')) {
        localStorage.removeItem(STORAGE_KEY);
        gems = [];
        renderGems();
    }
};

// 랜덤 젬 생성
document.getElementById('btnGenerate').onclick = () => {
    const k = 63; const out = []; let seed = 42; function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed; }
    for (const gemType of ['질서', '혼돈']) {
        for (let i = 0; i < k; i++) {
            const gemSubtype = rand() % 3; // 안정, 견고, 불안
            const req = gemSubtype + 8 - (3 + (rand() % 3));
            const point = 3 + (rand() % 3);
            const att = gemSubtype !== 2 ? (rand() % 6) : 0;
            const skill = gemSubtype !== 1 ? (rand() % 6) : 0;
            const boss = gemSubtype !== 0 ? (rand() % 6) : 0;
            out.push(new Gem({ index: i, req, point, att, skill, boss, type: gemType }));
        }
    }
    gems = out; renderGems(); saveGems();
};

// 젬 추가 버튼
addForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    try {
        const gemType = document.querySelector('input[name="f_type"]:checked').value
        const obj = {
            index: BigInt(gems.filter(g => g.type === gemType).length),
            req: Number(document.querySelector('input[name="f_req"]:checked').value),
            point: Number(document.querySelector('input[name="f_point"]:checked').value),
            att: Number(document.querySelector('input[name="f_attack"]:checked').value) || 0,
            skill: Number(document.querySelector('input[name="f_skill"]:checked').value) || 0,
            boss: Number(document.querySelector('input[name="f_boss"]:checked').value) || 0,
            type: gemType,
        };
        const g = new Gem(obj);
        gems.push(g);
        renderGems(searchBox.value);
        // 추가 이후 공용 옵션 초기화
        for (const name of ['f_attack', 'f_skill', 'f_boss']) {
            const radios = document.querySelectorAll(`input[name="${name}"]`);
            radios.forEach(r => r.checked = r.value == 0);
        }
        saveGems();
    } catch (err) { alert('invalid gem: ' + err.message); }
});

// worker에게 메시지를 받고 어떻게 행동할지 정의
function makeSolverWorkerHandler(kind, resultContainer) {
    return function (e) {
        const { type, current, result } = e.data;
        resultContainer.innerText = '분석 시작!'
        if (type === 'progress') {
            resultContainer.innerText = `진행 중 ... 현재 전투력: ${(current * 100 - 100).toFixed(4)}%`;
        } else if (type === 'done') {
            resultContainer.innerText = "";

            const res = result;
            const resultDiv = document.createElement('div');
            const resultDesc = document.createElement('h3');
            resultDiv.appendChild(resultDesc);

            if (!res.assign) {
                resultDesc.innerText = `${kind} 코어 배치 실패!`;
                resultDesc.classList.add('muted');
            } else {
                resultDesc.innerText = `${kind} 코어 전투력 증가량 ${(res.answer * 100 - 100).toFixed(4)}%`;
                res.assign.forEach(gs => {
                    resultDiv.appendChild(
                        gemSetToard(gs.used_bitmask, gs.core, gems.filter(g => g.type === kind))
                    );
                });
            }

            resultContainer.appendChild(resultDiv);
        }
    };
}

document.getElementById('btnRunSolver').onclick = () => {
    // Core 클래스 및 분석 요청 파라미터 가져오기
    const coreGrades = [
        document.querySelector('input[name="core0"]:checked').value,
        document.querySelector('input[name="core1"]:checked').value,
        document.querySelector('input[name="core2"]:checked').value,
        document.querySelector('input[name="core4"]:checked').value,
        document.querySelector('input[name="core5"]:checked').value,
        document.querySelector('input[name="core6"]:checked').value,
    ];
    const coreIsFirstRank = [
        true,
        true,
        true,
        document.querySelector('input[name="core4_rank"]').checked,
        document.querySelector('input[name="core5_rank"]').checked,
        true,
    ]
    const coresOrder = [
        new Core({ grade: coreGrades[0], attr: '질서', type: '해' }),
        new Core({ grade: coreGrades[1], attr: '질서', type: '달' }),
        new Core({ grade: coreGrades[2], attr: '질서', type: '별' })
    ]
    const coresChaos = [
        new Core({ grade: coreGrades[3], attr: '혼돈', type: coreIsFirstRank[3] ? '해' : '해2' }),
        new Core({ grade: coreGrades[4], attr: '혼돈', type: coreIsFirstRank[4] ? '달' : '달2' }),
        new Core({ grade: coreGrades[5], attr: '혼돈', type: '별' })
    ];
    const solvePrecision = Number(document.querySelector('input[name="solvePrecision"]:checked').value) || 2

    // UI 초기화
    const orderOutput = document.createElement('div');
    const chaosOutput = document.createElement('div');
    solverOutput.innerHTML = '';
    solverOutput.appendChild(orderOutput);
    solverOutput.appendChild(chaosOutput);

    // 분석용 워커 생성
    const worker1 = new Worker('./js/worker.js', { type: 'module' });
    const worker2 = new Worker('./js/worker.js', { type: 'module' });
    worker1.onmessage = makeSolverWorkerHandler('질서', orderOutput);
    worker2.onmessage = makeSolverWorkerHandler('혼돈', chaosOutput);

    // 분석 요청
    worker1.postMessage({
        gems: gems.filter(g => g.type === '질서'),
        cores: coresOrder,
        max_candidates: Math.pow(10, solvePrecision)
    });
    worker2.postMessage({
        gems: gems.filter(g => g.type === '혼돈'),
        cores: coresChaos,
        max_candidates: Math.pow(10, solvePrecision)
    });
};

// 내부 디버깅용
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

export function gemsToJSON(gemList, filename = 'gems.json') {
    const outputArray = gemList.map(gem => [
        gem.req,
        gem.point,
        gem.att,
        gem.skill,
        gem.boss,
        gem.type,
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
