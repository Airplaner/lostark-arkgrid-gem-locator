import { LRUCache } from "./utils.js";
import { GemSet, GemSetPack } from "./models.js"

function getPossibleGemIndexComb(gems, energy, point) {
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
export function getGemSets(gems, core) {
    // 주어진 gems를 core에 장착할 수 있는 모든 경우의 수를 GemSet으로 반환합니다.

    // ensure unique indices
    const idxs = new Set(gems.map(g => g.index));
    if (idxs.size !== gems.length) throw new Error('index 중복');

    const possibleCombination = [];
    for (const gemIndexList of getPossibleGemIndexComb(gems, core.energy, core.point)) {
        const used = gems.filter(g => gemIndexList.includes(g.index)).map(o => o);
        possibleCombination.push(new GemSet(used, core));
    }
    return possibleCombination;
}



export function getBestGemSetPacks(gemSets, attMax, skillMax, bossMax, maxCandidates) {
    if (gemSets.length != 3) throw new Error("GemSets length should be 3");

    const cache = new LRUCache(20000);
    function getCandidates(currentBitmask, coreIndex) {
        // 주어진 Core가 가진 GemSet 중 currentBitmask와 충돌하지 않는 GemSet의 목록을 반환
        const key = currentBitmask + '|' + coreIndex;
        const hit = cache.get(key);
        if (hit !== undefined) return hit;
        let res = [];
        for (const gs of gemSets[coreIndex]) {
            if ((gs.bitmask & currentBitmask) === 0n) {
                res.push(gs);
                if (res.length > maxCandidates) break;
            }
        }
        cache.set(key, res);
        return res;
    }
    if (gemSets.some(gs => gs.length === 0)) return [];

    let targetMin = 0; // 현재까지 찾은 배치 중 전투력 범위의 하한(min)의 가장 큰 값
    const gm2 = gemSets[1][0].maxScore;
    const gm3 = gemSets[2][0].maxScore;

    let answer = []
    for (const gs1 of gemSets[0]) {
        if (gs1.maxScore * gm2 * gm3 < targetMin) break;
        for (const gs2 of getCandidates(gs1.bitmask, 1)) {
            if (gs1.maxScore * gs2.maxScore * gm3 < targetMin) break;
            for (const gs3 of getCandidates(gs1.bitmask | gs2.bitmask, 2)) {
                if (gs1.maxScore * gs2.maxScore * gs3.maxScore < targetMin) break;
                // 세 개의 GemSet으로 얻을 수 있는 전투력 범위 구함
                let gsp = new GemSetPack(gs1, gs2, gs3, attMax, skillMax, bossMax);
                // 정답일 가능성이 있다면 후보에 추가
                if (gsp.maxScore > targetMin) {
                    answer.push(gsp);
                }
                // 새로운 젬 배치 (GemSetPack)가 보장하는 최소 전투력이 기존보다 높은 경우 갱신
                // 더 이상 후보가 아닌 요소를 answer에서 빼는 것은 마지막에 수행
                if (gsp.minScore > targetMin) {
                    targetMin = gsp.minScore;
                }
            }
        }
    }
    // maxScore이 targetMin보다 작은 경우엔 아예 후보조차 아님
    answer = answer.filter(g => g.maxScore >= targetMin)
    answer.sort((a, b) => b.maxScore - a.maxScore)
    return answer
}
