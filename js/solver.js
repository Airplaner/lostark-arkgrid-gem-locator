import { LRUCache } from "./utils.js";
import { GemSet } from "./models.js"

function get_possible_gem_index_combinations(gems, energy, point) {
    // 주어진 gems을 사용해서 요구하는 energy와 point를 모두 충족하는 집합을 반환합니다.
    const n = gems.length;
    // if (!(energy === 12 || energy === 15 || energy === 17)) throw new Error('energy must be 12,15,17');
    // if (!(point === 14 || point === 17)) throw new Error('point must be 14 or 17');
    const result = [];
    const gem_tuples = gems.map(g => [g.index, g.req, g.point]);
    gem_tuples.sort((a, b) => a[1] - b[1]);
    const g = gem_tuples;
    for (let i = 0; i < n; i++) {
        const ei = energy - g[i][1];
        const pi = g[i][2];
        if (ei < 6) break;
        if (pi + 15 < point) continue;
        for (let j = i + 1; j < n; j++) {
            const ej = ei - g[j][1];
            const pj = pi + g[j][2];
            if (ej < 3) break;
            if (pj + 10 < point) continue;
            for (let k = j + 1; k < n; k++) {
                const ek = ej - g[k][1];
                const pk = pj + g[k][2];
                if (pk >= point && ek >= 0) result.push([g[i][0], g[j][0], g[k][0]]);
                if (ek < 3) break;
                if (pk + 5 < point) continue;
                for (let m = k + 1; m < n; m++) {
                    const el = ek - g[m][1];
                    const pl = pk + g[m][2];
                    if (el < 0) break;
                    if (pl >= point && el >= 0) result.push([g[i][0], g[j][0], g[k][0], g[m][0]]);
                }
            }
        }
    }
    return result;
}

function get_exact_combat_score(gs1, gs2, gs3) {
    // 주어진 GemSet 3개로 얻을 수 있는 전투력을 반환합니다.
    let result = 1; let att = 0, skill = 0, boss = 0;
    att += gs1.att; skill += gs1.skill; boss += gs1.boss; result *= (gs1.core_combat_score + 10000) / 10000;
    att += gs2.att; skill += gs2.skill; boss += gs2.boss; result *= (gs2.core_combat_score + 10000) / 10000;
    att += gs3.att; skill += gs3.skill; boss += gs3.boss; result *= (gs3.core_combat_score + 10000) / 10000;
    result *= (Math.floor(att * 400 / 120) + 10000) / 10000;
    result *= (Math.floor(skill * 700 / 120) + 10000) / 10000;
    result *= (Math.floor(boss * 1000 / 120) + 10000) / 10000;
    return result;
}

export function solve(gems, cores, max_candidates) {
    // ensure unique indices
    const idxs = new Set(gems.map(g => g.index));
    if (idxs.size !== gems.length) throw new Error('index 중복');
    if (cores.length !== 3) throw new Error('cores must be length 3');

    const gem_set_per_core = [];
    for (const core of cores) {
        const possible_combination = [];
        const combos = get_possible_gem_index_combinations(gems, core.energy(), core.target_point());
        for (const gem_index_list of combos) {
            const used = gems.filter(g => gem_index_list.includes(g.index)).map(o => o);
            possible_combination.push(new GemSet(used, core));
        }
        possible_combination.sort((a, b) => b.max_combat_power - a.max_combat_power);
        gem_set_per_core.push(possible_combination);
    }

    const cache = new LRUCache(20000);
    function get_candidates(current_mask, core_idx) {
        const key = current_mask + '|' + core_idx;
        const hit = cache.get(key);
        if (hit !== undefined) return hit;
        let res = [];
        for (const gs of gem_set_per_core[core_idx]) {
            if ((gs.used_bitmask & current_mask) === 0n) {
                res.push(gs);
                if (res.length > max_candidates) break;
            }
        }
        cache.set(key, res);
        return res;
    }

    let answer = 0; let assign = null;
    if (gem_set_per_core[0].length === 0 || gem_set_per_core[1].length === 0 || gem_set_per_core[2].length === 0) return { answer: 0, assign: null };
    const global_c1_max = gem_set_per_core[0][0].max_combat_power;
    const global_c2_max = gem_set_per_core[1][0].max_combat_power;
    const global_c3_max = gem_set_per_core[2][0].max_combat_power;

    for (const gs1 of gem_set_per_core[0]) {
        if (gs1.max_combat_power * global_c2_max * global_c3_max < answer) break;
        const candidates_gs2 = get_candidates(gs1.used_bitmask, 1);
        if (!candidates_gs2.length) continue;
        for (const gs2 of candidates_gs2) {
            if (gs1.max_combat_power * gs2.max_combat_power * global_c3_max < answer) break;
            const candidates_gs3 = get_candidates(gs1.used_bitmask | gs2.used_bitmask, 2);
            if (!candidates_gs3.length) continue;
            for (const gs3 of candidates_gs3) {
                if (gs1.max_combat_power * gs2.max_combat_power * gs3.max_combat_power < answer) break;
                const value = get_exact_combat_score(gs1, gs2, gs3);
                if (value >= answer) { answer = value; assign = [gs1, gs2, gs3]; }
            }
        }
    }
    return { answer, assign };
}
