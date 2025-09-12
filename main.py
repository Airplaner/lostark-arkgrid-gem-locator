from dataclasses import dataclass
from enum import IntEnum, auto
from functools import lru_cache

VERBOSE = False


@dataclass
class Gem:
    req: int  # 요구 의지력 1-5
    point: int  # 질서/혼돈 포인트 1-5
    att: int  # 공격력
    skill: int  # 추가 피해
    boss: int  # 보스 피해


DP_STATE = tuple[
    int,  # Core #1 남은 의지력
    int,  # Core #2 남은 의지력
    int,  # Core #3 남은 의지력
    int,  # Core #1 질서/혼돈 포인트
    int,  # Core #2 질서/혼돈 포인트
    int,  # Core #3 질서/혼돈 포인트
    int,  # 전체 공격력 Lv. 합계
    int,  # 전체 추가 피해 Lv. 합계
    int,  # 전체 보스 피해 Lv. 합계
    int,  # 사용한 보석 bitmask (2^30)
]


with open("./data/attack.txt") as fp:
    data_attack = list(map(int, fp.readlines()))  # data[i]는 i번째 공격력 증가량
    assert len(data_attack) == 121

with open("./data/boss.txt") as fp:
    data_boss = list(map(int, fp.readlines()))
    assert len(data_boss) == 121

with open("./data/skill.txt") as fp:
    data_skill = list(map(int, fp.readlines()))
    assert len(data_skill) == 121

answer = 0


class CoreGrade(IntEnum):
    EPIC = auto()
    LEGENDARY = auto()
    RELIC = auto()
    ANCIENT = auto()


class CoreAttr(IntEnum):
    ORDER = auto()
    CHAOS = auto()


class CoreType(IntEnum):
    SUN = auto()
    MOON = auto()
    STAR = auto()


@dataclass(frozen=True)
class Core:
    grade: CoreGrade
    attr: CoreAttr
    type_: CoreType


core_info = {
    CoreGrade.LEGENDARY: {
        CoreAttr.ORDER: {
            CoreType.SUN: [0, 150, 400, 750, 767, 783, 800],
            CoreType.MOON: [0, 150, 400, 750, 767, 783, 800],
            CoreType.STAR: [0, 150, 250, 450, 467, 483, 500],
        }
    },
    CoreGrade.RELIC: {
        CoreAttr.ORDER: {
            CoreType.SUN: [0, 150, 400, 750, 767, 783, 800],
            CoreType.MOON: [0, 150, 400, 750, 767, 783, 800],
            CoreType.STAR: [0, 150, 250, 450, 467, 483, 500],
        }
    },
    CoreGrade.ANCIENT: {
        CoreAttr.ORDER: {
            CoreType.SUN: [0, 150, 400, 850, 867, 883, 900],
            CoreType.MOON: [0, 150, 400, 850, 867, 883, 900],
            CoreType.STAR: [0, 150, 250, 550, 567, 583, 600],
        }
    },
}
core_energy = {
    CoreGrade.EPIC: 7,
    CoreGrade.LEGENDARY: 11,
    CoreGrade.RELIC: 15,
    CoreGrade.ANCIENT: 17,
}


def solve(
    gems: list[Gem],
    cores: list[Core],
):
    N = len(gems)
    assert N <= 30

    # 현재 코어의 계수를 미리 가져옴
    coeffs: list[list[int]] = list()
    for core in cores:
        coeffs.append(core_info[core.grade][core.attr][core.type_])

    @lru_cache(maxsize=None)
    def calc_value(
        core_points: tuple[int, int, int],
        lv1: int,
        lv2: int,
        lv3: int,
    ):
        result = 1.0

        for i in range(3):
            core_point = core_points[i]
            coeff = coeffs[i]
            if core_point >= 20:
                result *= (coeff[6] + 10000) / 10000
            elif core_point >= 19:
                result *= (coeff[5] + 10000) / 10000
            elif core_point >= 18:
                result *= (coeff[4] + 10000) / 10000
            elif core_point >= 17:
                result *= (coeff[3] + 10000) / 10000
            elif core_point >= 14:
                result *= (coeff[2] + 10000) / 10000
            elif core_point >= 10:
                result *= (coeff[1] + 10000) / 10000

        result *= (
            (10000 + data_attack[lv1])
            / 10000
            * (10000 + data_skill[lv2])
            / 10000
            * (10000 + data_boss[lv3])
            / 10000
        )
        return result

    @lru_cache(maxsize=None)
    def dfs(
        e1: int,  # 남은 의지력
        e2: int,
        e3: int,
        p1: int,  # 현재 질서/혼돈 포인트
        p2: int,
        p3: int,
        lv1: int,  # 공격력
        lv2: int,  # 추가 피해
        lv3: int,  # 보스 피해
        used_mask: int,  # use
        s1: int,  # 사용한 슬롯
        s2: int,
        s3: int,
    ) -> tuple[float, int]:  # 전투력, used_mask
        if used_mask == ((1 << N) - 1) or (s1 == 4 and s2 == 4 and s3 == 4):
            return calc_value((p1, p2, p3), lv1, lv2, lv3), used_mask

        # 현재 state에서 최적값
        best = calc_value((p1, p2, p3), lv1, lv2, lv3), used_mask
        for i in range(N):
            if used_mask & (1 << i):
                continue
            g = gems[i]

            if s1 < 4 and e1 >= g.req:
                candidate = dfs(
                    e1 - g.req,
                    e2,
                    e3,
                    p1 + g.point,
                    p2,
                    p3,
                    lv1 + g.att,
                    lv2 + g.skill,
                    lv3 + g.boss,
                    used_mask | (1 << i),
                    s1 + 1,
                    s2,
                    s3,
                )
                if candidate[0] > best[0]:
                    best = candidate

            if s2 < 4 and e2 >= g.req:
                candidate = dfs(
                    e1,
                    e2 - g.req,
                    e3,
                    p1,
                    p2 + g.point,
                    p3,
                    lv1 + g.att,
                    lv2 + g.skill,
                    lv3 + g.boss,
                    used_mask | (1 << i),
                    s1,
                    s2 + 1,
                    s3,
                )
                if candidate[0] > best[0]:
                    best = candidate

            if s3 < 4 and e3 >= g.req:
                candidate = dfs(
                    e1,
                    e2,
                    e3 - g.req,
                    p1,
                    p2,
                    p3 + g.point,
                    lv1 + g.att,
                    lv2 + g.skill,
                    lv3 + g.boss,
                    used_mask | (1 << i),
                    s1,
                    s2,
                    s3 + 1,
                )
                if candidate[0] > best[0]:
                    best = candidate
        return best

    return dfs(
        e1=core_energy[cores[0].grade],
        e2=core_energy[cores[1].grade],
        e3=core_energy[cores[2].grade],
        p1=0,
        p2=0,
        p3=0,
        lv1=0,  # 공격력
        lv2=0,  # 추가 피해
        lv3=0,  # 보스 피해
        used_mask=0,
        s1=0,
        s2=0,
        s3=0,
    )


def generate_gems(k: int = 10):
    result = list()
    import random

    for i in range(k):
        result.append(
            Gem(
                req=random.randint(3, 5),
                point=random.randint(4, 5),
                att=random.randint(1, 5),
                skill=random.randint(1, 5),
                boss=random.randint(1, 5),
            )
        )
    return result


if __name__ == "__main__":
    v = solve(
        gems=[
            Gem(
                req=8,
                point=11,
                att=1,
                skill=1,
                boss=0,
            ),
            Gem(
                req=9,
                point=18,
                att=2,
                skill=0,
                boss=5,
            ),
        ],
        cores=[
            Core(
                CoreGrade.LEGENDARY,
                CoreAttr.ORDER,
                CoreType.SUN,
            ),
            Core(
                CoreGrade.LEGENDARY,
                CoreAttr.ORDER,
                CoreType.MOON,
            ),
            Core(
                CoreGrade.LEGENDARY,
                CoreAttr.ORDER,
                CoreType.STAR,
            ),
        ],
    )
    print(v[0], bin(v[1]))

    # full test
    import json

    with open("gems.json", "r", encoding="utf-8") as fp:
        raw_gems = json.load(fp)
    gems = list()
    for v in raw_gems:
        gems.append(Gem(*v))

    v = solve(
        gems=gems,
        cores=[
            Core(
                CoreGrade.LEGENDARY,
                CoreAttr.ORDER,
                CoreType.SUN,
            ),
            Core(
                CoreGrade.LEGENDARY,
                CoreAttr.ORDER,
                CoreType.MOON,
            ),
            Core(
                CoreGrade.RELIC,
                CoreAttr.ORDER,
                CoreType.STAR,
            ),
        ],
    )
    print(v[0], bin(v[1]))
