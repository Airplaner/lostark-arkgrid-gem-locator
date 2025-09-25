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
        const h = document.createElement('h3'); h.textContent = `${this.req}W ${this.point}P ${this.type}`;
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

export class GemSet {
    constructor(gems, core) {
        this.att = 0; this.skill = 0; this.boss = 0; this.point = 0; this.used_bitmask = 0n;
        for (const gem of gems) {
            this.used_bitmask |= 1n << gem.index;
            this.att += gem.att; this.skill += gem.skill; this.boss += gem.boss; this.point += gem.point;
        }
        this.core_combat_score = core.coeff[this.point] || 0;
        this.max_combat_power = (this.core_combat_score + 10000) / 10000
            * (Math.floor(this.att * 400 / 120) + 10000) / 10000
            * (Math.floor(this.skill * 700 / 120) + 10000) / 10000
            * (Math.floor(this.boss * 1000 / 120) + 10000) / 10000;
        this.min_combat_power = (this.core_combat_score + 10000) / 10000 // 추후 정교한 계산을 위해
            * (10400) / (Math.floor((120 - this.skill) * 400 / 120) + 10000)
            * (10700) / (Math.floor((120 - this.skill) * 700 / 120) + 10000)
            * (11000) / (Math.floor((120 - this.boss) * 1000 / 120) + 10000);
        this.core = core;
    }
}

// Worker로 주고 받은 후에는 prototype이 아니어서 분리
export function gemSetToard(used_bitmask, core, gems) {
    // 코어에 할당된 젬 목록을 가져온다.
    const included = gems.filter(g => (used_bitmask & (1n << g.index)) !== 0n);

    // root div 생성
    const card = document.createElement('div');
    card.className = 'gemSet';

    // core 정보를 h4에 생성
    const coreP = document.createElement('h4');
    core = new Core(core); // class로 변경
    coreP.textContent = core.toString(); // 문자열로 넣기
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
