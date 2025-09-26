const coreEnergyMap = { '영웅': 9, '전설': 12, '유물': 15, '고대': 17 }

const coreDefaultTargetPointMap = { '영웅': 0, '전설': 14, '유물': 17, '고대': 17 };

const coreCoeffMap = {
    '영웅': {
        '질서': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150],
        },
        '혼돈': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            '해2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
            '달2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
        }
    },
    '전설': {
        '질서': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 400, 400, 400, 400],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 400, 400, 400, 400],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 250, 250, 250, 250, 250, 250, 250],
        },
        '혼돈': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 100, 100, 100, 100],
            '해2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 100, 100, 100, 100],
            '달2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 100, 100, 100, 100],
        }
    },
    '유물': {
        '질서': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 750, 767, 783, 800],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 750, 767, 783, 800],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 100, 100, 100, 250, 250, 250, 450, 467, 483, 500],
        },
        '혼돈': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 250, 267, 283, 300],
            '해2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 150, 167, 183, 200],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 250, 267, 283, 300],
            '달2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 150, 167, 183, 200],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 250, 267, 283, 300],
        }
    },
    '고대': {
        '질서': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 850, 867, 883, 900],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 850, 867, 883, 900],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 250, 250, 250, 550, 567, 583, 600],
        },
        '혼돈': {
            '해': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 350, 367, 383, 400],
            '해2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 250, 267, 283, 300],
            '달': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 350, 367, 383, 400],
            '달2': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 250, 267, 283, 300],
            '별': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 100, 100, 100, 250, 267, 283, 300],
        }
    }
};
export class Core {
    constructor({ grade, attr, type, point }) {
        this.grade = grade;
        this.attr = attr;
        this.type = type;
        this.point = point ?? coreDefaultTargetPointMap[this.grade] ?? 0;
        this.energy = coreEnergyMap[this.grade] ?? 0;
        this.coeff = (coreCoeffMap[grade]?.[attr]?.[type]) || Array(21).fill(0);
        // validate
        if (this.coeff.length != 21) throw new Error("내부 데이터 오류");
    }
    toString() {
        return `${this.grade} 등급 ${this.attr}의 ${this.type} 코어`
    }
}



const gem_possible_req = {
    'true,true,true': [3, 9],
    'true,true,false': [3, 8],
    'true,false,true': [3, 9],
    'true,false,false': [3, 7],
    'false,true,true': [4, 9],
    'false,true,false': [4, 8],
    'false,false,true': [5, 9],
};

export class Gem {
    constructor(obj) {
        // obj: {index, req, point, att, skill, boss}
        this.index = BigInt(obj.index);
        this.req = Number(obj.req);
        this.point = Number(obj.point);
        this.att = Number(obj.att) || 0;
        this.skill = Number(obj.skill) || 0;
        this.boss = Number(obj.boss) || 0;
        this.type = obj.type ?? '질서';
        // validate
        this._validate();
    }
    _validate() {
        if (this.att > 0 && this.skill > 0 && this.boss > 0) throw new Error('젬은 공격력, 추가 피해, 보스 피해 중 최대 2가지만 가질 수 있습니다.');
        let poss_alpha = true, poss_beta = true, poss_gamma = true;
        if (this.att) poss_gamma = false;
        if (this.skill) poss_beta = false;
        if (this.boss) poss_alpha = false;
        const key = `${poss_alpha},${poss_beta},${poss_gamma}`;
        const [ge, le] = gem_possible_req[key];
        if (!(this.req >= ge && this.req <= le)) throw new Error('예상되는 젬 세부 타입에서 나올 수 없는 필요 의지력입니다.');
    }
    toString() {
        let s = `[${this.type} ${String(this.index).padStart(2, ' ')}: ${this.req}W ${this.point}P`;
        if (this.att) s += ` 공${this.att}`;
        if (this.skill) s += ` 추${this.skill}`;
        if (this.boss) s += ` 보${this.boss}`;
        s += `]`;
        return s;
    }
    optionStrArray() {
        let s = [];
        if (this.att) {
            s.push(`공격력 Lv.${this.att}`);
        }
        if (this.skill) {

            s.push(`추가 피해 Lv.${this.skill}`);
        }
        if (this.boss) {
            s.push(`보스 피해 Lv.${this.boss}`);
        }
        while (s.length < 2) {
            s.push("-");
        }
        return s;
    }
    toCard() {
        const optionArray = this.optionStrArray();
        const card = document.createElement('div'); card.className = 'gem';
        card.style = 'width: 180px'; // 고정폭
        const h = document.createElement('h3'); h.textContent = `${this.req}W ${this.point}P`;
        const p = document.createElement('div');
        optionArray.forEach(text => {
            const div = document.createElement('div');
            div.className = 'gem-option'
            div.textContent = text;
            p.appendChild(div);
        });
        const row = document.createElement('div'); row.className = 'row';
        card.appendChild(h); card.appendChild(p); card.appendChild(row);
        return card
    }
}


// 값을 보기 좋게 바꿔주는 함수들
function coeffToInc(v, base = 10000) {
    // 400같은 정수를 4%로 반환
    return numberToInc((v + base) / base);
}
function numberToInc(v, fixed = 2) {
    // 1.23같은 실수를 23%로 반환
    return `${((v - 1) * 100).toFixed(fixed)}%`;
}

export class GemSet {
    // 코어에 젬을 장착한 상태
    constructor(gems, core) {
        this.att = 0;
        this.skill = 0;
        this.boss = 0;
        this.point = 0;

        this.bitmask = 0n;
        for (const gem of gems) {
            this.bitmask |= 1n << gem.index;
            this.att += gem.att;
            this.skill += gem.skill;
            this.boss += gem.boss;
            this.point += gem.point;
        }
        this.coreCoeff = core.coeff[this.point] || 0;
        this.core = core;
    }
    setScoreRange(attMax, skillMax, bossMax) {
        // 모든 시스템에서 얻을 수 있는 최대 공격력, 추가 피해, 보스 피해를 알 수 있으면
        // 이 GemSet으로 얻을 수 있는 전투력의 범위를 한정할 수 있다.
        const coreScore = (this.coreCoeff + 10000) / 10000;

        // 전투력 증가 최대치: Lv. 0 -> Lv. {레벨합산}일 때
        this.maxScore = coreScore
            * (Math.floor(this.att * 400 / 120) + 10000) / 10000
            * (Math.floor(this.skill * 700 / 120) + 10000) / 10000
            * (Math.floor(this.boss * 1000 / 120) + 10000) / 10000;
        // 전투력 증가 최소치: Lv. {최대레벨 - 레벨합산} -> Lv. {최대레벨}일 때
        this.minScore = coreScore
            * (Math.floor(attMax * 400 / 120) + 10000) / (Math.floor((attMax - this.att) * 400 / 120) + 10000)
            * (Math.floor(skillMax * 700 / 120) + 10000) / (Math.floor((skillMax - this.skill) * 700 / 120) + 10000)
            * (Math.floor(bossMax * 1000 / 120) + 10000) / (Math.floor((bossMax - this.boss) * 1000 / 120) + 10000);
    }
    toCard(gems) {
        // 코어에 할당된 젬 목록을 가져온다.
        const included = gems.filter(g => (this.bitmask & (1n << g.index)) !== 0n);

        // root div 생성
        const card = document.createElement('div');
        card.className = 'gemSet';

        // core 정보를 h4에 생성
        const coreP = document.createElement('h4');
        coreP.textContent = this.core.toString();
        coreP.textContent += ` ${this.point}P`
        card.appendChild(coreP);

        // 할당된 gem에게서 toCard 이후 assigned-gems div에 추가
        const gemContainer = document.createElement('div');
        gemContainer.className = 'assigned-gems'
        included.forEach(gem => {
            gemContainer.appendChild(gem.toCard())
        });
        card.appendChild(gemContainer);
        return card
    }
}
export class GemSetPack {
    // 질서 혹은 혼돈 3개의 코어에 대해 할당된 3개의 GemSet
    constructor(gs1, gs2, gs3, attMax, skillMax, bossMax) {
        this.gs1 = gs1;
        this.gs2 = gs2;
        this.gs3 = gs3;
        this.att = gs1.att + gs2.att + gs3.att;
        this.skill = gs1.skill + gs2.skill + gs3.skill;
        this.boss = gs1.boss + gs2.boss + gs3.boss;

        this.coreScore = (gs1.coreCoeff + 10000) / 10000
            * (gs2.coreCoeff + 10000) / 10000
            * (gs3.coreCoeff + 10000) / 10000;

        this.maxScore = this.coreScore
            * (Math.floor(this.att * 400 / 120) + 10000) / 10000
            * (Math.floor(this.skill * 700 / 120) + 10000) / 10000
            * (Math.floor(this.boss * 1000 / 120) + 10000) / 10000;
        this.minScore = this.coreScore
            * (Math.floor(attMax * 400 / 120) + 10000) / (Math.floor((attMax - this.att) * 400 / 120) + 10000)
            * (Math.floor(skillMax * 700 / 120) + 10000) / (Math.floor((skillMax - this.skill) * 700 / 120) + 10000)
            * (Math.floor(bossMax * 1000 / 120) + 10000) / (Math.floor((bossMax - this.boss) * 1000 / 120) + 10000);
    }
    toCard(gems) {
        const resultDiv = document.createElement('div');
        const resultDesc = document.createElement('h3');
        resultDiv.appendChild(resultDesc);
        resultDiv.appendChild(this.gs1.toCard(gems));
        resultDiv.appendChild(this.gs2.toCard(gems));
        resultDiv.appendChild(this.gs3.toCard(gems));
        return resultDiv;
    }
}
export class GemSetPackTuple {
    // GemSetPack이 두 개 있는 것, 즉 완성된 하나의 아크 그리드
    constructor(gsp1, gsp2) {
        this.gsp1 = gsp1;
        this.gsp2 = gsp2;
        this.att = gsp1.att + gsp2.att;
        this.skill = gsp1.skill + gsp2.skill;
        this.boss = gsp1.boss + gsp2.boss;
        this.score = gsp1.coreScore * gsp2.coreScore
            * (Math.floor(this.att * 400 / 120) + 10000) / 10000
            * (Math.floor(this.skill * 700 / 120) + 10000) / 10000
            * (Math.floor(this.boss * 1000 / 120) + 10000) / 10000;
    }
    toCard(gems) {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('gem-set-pack');
        resultDiv.appendChild(this.gsp1.toCard(gems.filter(g => g.type === '질서')));
        resultDiv.appendChild(this.gsp2.toCard(gems.filter(g => g.type === '혼돈')));
        resultDiv.appendChild(
            Object.assign(document.createElement('div'),
                { innerText: `전투력 증가량 +${numberToInc(this.score, 4)}` }
            )
        )
        // 공격력, 스킬, 보스 공격력 div 생성
        const stats = [
            { label: '공격력', value: this.att, coeff: 400 },
            { label: '스킬 공격', value: this.skill, coeff: 700 },
            { label: '보스 공격', value: this.boss, coeff: 1000 }
        ];

        stats.forEach(stat => {
            const div = document.createElement('div');
            const statScore = coeffToInc(Math.floor(stat.value * stat.coeff / 120));
            div.textContent = `${stat.label} Lv. ${stat.value} `
                + `(+${statScore})`;
            div.classList.add('gem-set-stat'); // 필요시 스타일링용 클래스
            resultDiv.appendChild(div);
        });

        [this.gsp1.gs1, this.gsp1.gs2, this.gsp1.gs3, this.gsp2.gs1, this.gsp2.gs2, this.gsp2.gs3].forEach(gs => {
            const div = document.createElement('div');
            div.textContent = `${gs.core} ${gs.point}P (+${coeffToInc(gs.coreCoeff)})`
            resultDiv.appendChild(div);
        })

        return resultDiv;
    }
}
