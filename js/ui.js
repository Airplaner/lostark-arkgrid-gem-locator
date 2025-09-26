// ----------------------------- UI Logic -----------------------------
import { Gem, Core, GemSet, GemSetPackTuple } from "./models.js"
import { getBestGemSetPacks, getGemSets } from "./solver.js";

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
function generateRandomGems(k) {
    let seed = 42
    function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed; }
    function randint(min, max) {
        // python random.randint
        return (rand() % (max - min + 1)) + min;
    }
    const out = [];
    for (const gemType of ['질서', '혼돈']) {
        for (let i = 0; i < k; i++) {
            // 젬 타입 (안정 60%, 견고 30%, 불안 10%)
            const subtype = randint(0, 9);
            const gemSubtype = subtype <= 5 ? 0 : subtype <= 8 ? 1 : 2;

            const req = gemSubtype + 8 - randint(4, 5);
            const point = randint(4, 5);
            const att = gemSubtype !== 2 ? randint(0, 5) : 0;
            const skill = gemSubtype !== 1 ? randint(0, 5) : 0;
            const boss = gemSubtype !== 0 ? randint(0, 5) : 0;
            const gem = new Gem({ index: i, req, point, att, skill, boss, type: gemType });

            // if (gemType === '혼돈') {
            //     gem.att = gemSubtype !== 2 ? randint(4, 5): 0;
            //     gem.skill = gemSubtype !== 1 ? randint(4, 5): 0;
            //     gem.boss = gemSubtype !== 0 ? randint(4, 5): 0;
            // }
            out.push(gem);
        }
    }
    return out;
};
document.getElementById('btnGenerate').onclick = () => {
    gems = generateRandomGems(50);
    renderGems();
    saveGems();
}

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


    // 시작
    const debugOutput = document.createElement("div");
    solverOutput.innerHTML = '';

    const gemsOrder = gems.filter(g => g.type === '질서');
    const gemsChaos = gems.filter(g => g.type === '혼돈');

    debugOutput.innerHTML += `<p>질서 젬 ${gemsOrder.length}개</p>`;
    debugOutput.innerHTML += `<p>혼돈 젬 ${gemsChaos.length}개</p>`;

    // 현재 젬으로 코어의 목표 포인트를 충족할 수 있는 젬 조합(GemSet) 생성
    const gemSetsOrder = [];
    const gemSetsChaos = [];

    coresOrder.forEach(core => {
        gemSetsOrder.push(getGemSets(gemsOrder, core));
    })
    coresChaos.forEach(core => {
        gemSetsChaos.push(getGemSets(gemsChaos, core));
    })
    const gemSetsTotal = gemSetsOrder.concat(gemSetsChaos);

    debugOutput.innerHTML += '<p>각 코어별 가능한 조합의 수</p>'
    debugOutput.innerHTML += `<p>질서의 해: ${gemSetsOrder[0].length}개</p>`;
    debugOutput.innerHTML += `<p>질서의 별: ${gemSetsOrder[1].length}개</p>`;
    debugOutput.innerHTML += `<p>질서의 달: ${gemSetsOrder[2].length}개</p>`;
    debugOutput.innerHTML += `<p>혼돈의 해: ${gemSetsChaos[0].length}개</p>`;
    debugOutput.innerHTML += `<p>혼돈의 별: ${gemSetsChaos[1].length}개</p>`;
    debugOutput.innerHTML += `<p>혼돈의 달: ${gemSetsChaos[2].length}개</p>`;


    // 공격력, 추가 피해, 보스 피해 Lv의 최대를 구함

    // 각 코어가 가진 젬 조합 중 가장 높은 공격력을 가지는 것을 고르는 것으로
    // 전체 공격력의 합의 최대치를 빠르게 구할 수 있음 (중복 무시)

    // 이를 공격력, 추가 피해, 보스 피해에 대해서 모두 수행
    // 각 comb 배열에서 key 값의 최대를 구하는 함수
    function maxInComb(comb, key) {
        let max = 0;
        for (const gem of comb) {
            if (gem[key] > max) max = gem[key];
        }
        return max;
    }

    // 공격력, 스킬, 보스 피해 합 계산
    let attMax = 0, skillMax = 0, bossMax = 0;

    for (const comb of gemSetsTotal) {
        attMax += maxInComb(comb, "att");
        skillMax += maxInComb(comb, "skill");
        bossMax += maxInComb(comb, "boss");
    }


    debugOutput.innerHTML += `<p>최대 공격력 Lv. ${attMax}</p>`
    debugOutput.innerHTML += `<p>최대 추가 피해 Lv. ${skillMax}</p>`
    debugOutput.innerHTML += `<p>최대 보스 피해 Lv. ${bossMax}</p>`

    // 해당 값을 바탕으로 모든 젬 조합(GemSet)이 증가시켜주는 전투력의 범위를 한정
    gemSetsTotal.forEach(gemSets => {
        gemSets.map(gemSet => gemSet.setScoreRange(attMax, skillMax, bossMax))
        gemSets.sort((a, b) => b.maxScore - a.maxScore);
    });

    // 질서 및 혼돈 코어에 대해서
    // 가장 높은 전투력을 증가시킬 것으로 예상되는 젬 조합 3개 (GemSetPack)들의 목록을 구함
    const gspOrder = getBestGemSetPacks(
        gemSetsOrder, attMax, skillMax, bossMax, solvePrecision
    );


    debugOutput.innerHTML += `<p>질서 코어에 가능한 조합의 수: ${gspOrder.length}</p>`
    const gspChaos = getBestGemSetPacks(
        gemSetsChaos, attMax, skillMax, bossMax, solvePrecision
    );


    debugOutput.innerHTML += `<p>혼돈 코어에 가능한 조합의 수: ${gspChaos.length}</p>`;

    // 질서 및 혼돈 GemSetPack에 대해서 모든 조합을 비교하여
    // 가장 높은 전투력을 증가시켜주는 GemSetPackTuple을 구함


    if (!gspOrder.length && !gspChaos.length) {
        solverOutput.innerHTML += "<p>질서 및 혼돈 배치 불가능</p>";
        return;
    }
    else if (!gspOrder.length) {
        solverOutput.innerHTML += "<p>질서 배치 불가능</p>";
        solverOutput.appendChild(gspChaos[0].toCard(gemsChaos));
        return;
    }
    else if (!gspChaos.length) {
        solverOutput.innerHTML += "<p>혼돈 배치 불가능</p>";
        solverOutput.appendChild(gspOrder[0].toCard(gemsOrder));
        return;
    }
    // 보통 서로를 무시한 (maxScore 기준) 경우가 최적해지만, 한쪽으로 기울어진 경우
    let answer = new GemSetPackTuple(gspOrder[0], gspChaos[0]);
    let isNewAnswer = false;
    const prevCard = answer.toCard(gems);

    // 너무 많아서 1000개까지만 봄
    for (const gsp1 of gspOrder.slice(0, 1000)) {
        for (const gsp2 of gspChaos.slice(0, 1000)) {
            if (gsp1.maxScore * gsp2.maxScore < answer.score) break;
            let gspt = new GemSetPackTuple(gsp1, gsp2);
            if (gspt.score > answer.score) {
                answer = gspt;
                isNewAnswer = true;
                console.log("new Answer come!");
            }
        }
    }

    if (isNewAnswer) {
        debugOutput.innerHTML += `<hr><p>아래는 새로운 알고리즘이 적용되기 이전의 답으로 현재보다 약간 낮음.</p>`
        debugOutput.appendChild(prevCard);
    }

    solverOutput.appendChild(answer.toCard(gems));
    solverOutput.appendChild(debugOutput);
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
