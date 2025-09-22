from dataclasses import dataclass
from enum import IntEnum, auto
from functools import lru_cache
from typing import Annotated

from pydantic import BaseModel, Field, field_validator, model_validator

VERBOSE = False


gem_possible_req = {
    (True, True, True): (3, 9),  # 안정, 견고, 불변
    (True, True, False): (3, 8),  # 안정, 견고
    (True, False, True): (3, 9),  # 안정, 불변
    (True, False, False): (3, 7),  # 안정
    (False, True, True): (4, 9),  # 견고, 불변
    (False, True, False): (4, 8),  # 견고
    (False, False, True): (5, 9),  # 불변
}


class Gem(BaseModel):
    req: Annotated[
        int,
        Field(
            title="필요 의지력",
            ge=3,  # 안정 의지력 효율 Lv. 5
            le=9,  # 불변 의지력 효율 Lv. 1
        ),
    ]
    point: Annotated[
        int,
        Field(
            title="질서/혼돈 포인트",
            ge=1,
            le=5,
        ),
    ]

    att: Annotated[
        int,
        Field(
            title="공격력 Lv.",
            ge=0,
            le=5,
        ),
    ]
    skill: Annotated[
        int,
        Field(
            title="추가 피해 Lv.",
            ge=0,
            le=5,
        ),
    ]
    boss: Annotated[
        int,
        Field(
            title="보스 피해 Lv.",
            ge=0,
            le=5,
        ),
    ]

    @model_validator(mode="after")
    def check_invalid_gem(self):
        poss_alpha = True  # 안정, 침식
        poss_beta = True  # 견고, 왜곡
        poss_gamma = True  # 불변, 붕괴

        # 공, 추피, 보피 중 최대 2개만 가질 수 있음
        if self.att > 0 and self.skill > 0 and self.boss > 0:
            raise ValueError(
                "젬은 공격력, 추가 피해, 보스 피해 중 최대 2가지만 가질 수 있습니다."
            )

        if self.att:
            poss_gamma = False  # not used yet

        if self.skill:
            poss_beta = False

        if self.boss:
            poss_alpha = False
        ge, le = gem_possible_req[(poss_alpha, poss_beta, poss_gamma)]
        if not (ge <= self.req <= le):
            raise ValueError(
                "예상되는 젬 세부 타입에서 나올 수 없는 필요 의지력입니다."
            )
        return self


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
core_slot_num = {
    CoreGrade.EPIC: 2,
    CoreGrade.LEGENDARY: 3,
    CoreGrade.RELIC: 4,
    CoreGrade.ANCIENT: 4,
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
        # print(core_points, lv1, lv2, lv3)
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
        s1: int,  # 남은 슬롯
        s2: int,
        s3: int,
    ) -> tuple[float, int]:  # 전투력, used_mask
        if used_mask == ((1 << N) - 1) or (s1 == 0 and s2 == 0 and s3 == 0):
            return calc_value((p1, p2, p3), lv1, lv2, lv3), used_mask

        # 현재 state에서 최적값
        best = calc_value((p1, p2, p3), lv1, lv2, lv3), used_mask
        for i in range(N):
            if used_mask & (1 << i):
                continue
            g = gems[i]

            if s1 > 0 and g.req + 3 * (s1 - 1) <= e1:
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
                    s1 - 1,
                    s2,
                    s3,
                )
                if candidate[0] > best[0]:
                    best = candidate

            if s2 > 0 and g.req + 3 * (s2 - 1) <= e2:
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
                    s2 - 1,
                    s3,
                )
                if candidate[0] > best[0]:
                    best = candidate

            if s3 > 0 and g.req + 3 * (s3 - 1) <= e3:
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
                    s3 - 1,
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
        s1=core_slot_num[cores[0].grade],
        s2=core_slot_num[cores[1].grade],
        s3=core_slot_num[cores[2].grade],
    )


def generate_gems(k: int = 10):
    result = list()
    import random

    for i in range(k):
        gem_type = random.randint(0, 2)  # 0안정 1견고 2침식
        g = Gem(
            req=gem_type + 8 - random.randint(3, 5),
            point=random.randint(3, 5),
            att=random.randint(0, 5) if gem_type != 2 else 0,
            skill=random.randint(0, 5) if gem_type != 1 else 0,
            boss=random.randint(0, 5) if gem_type != 0 else 0,
        )
        result.append(g)
    return result


if __name__ == "__main__":
    v = solve(
        gems=[
            Gem(
                req=3,
                point=5,
                att=2,
                skill=4,
                boss=0,
            ),
            Gem(
                req=8,
                point=4,
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
    # exit(0)
    # full test
    import json

    # with open("gems.json", "r", encoding="utf-8") as fp:
    #     raw_gems = json.load(fp)
    # gems = list()
    # for v in raw_gems:
    #     gems.append(Gem(*v))

    v = solve(
        gems=generate_gems(k=30),
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
