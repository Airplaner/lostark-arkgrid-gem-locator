import time
from dataclasses import dataclass
from enum import Enum, IntEnum, auto
from functools import cached_property, lru_cache
from typing import Annotated, Literal

from line_profiler import LineProfiler
from pydantic import BaseModel, Field, field_validator, model_validator

VERBOSE = False
MAX_GEM_OPTION_LEVEL = 120


def pp(v: float) -> str:
    """주어신 실수를 증감 %로 표시"""
    return f"{v * 100 - 100:.3f}%"


class GemOptionType(Enum):
    공격력 = auto()  # 공격력 %
    추가피해 = auto()  # 추가 피해 %
    보스피해 = auto()  # 보스 피해 %


class CoreGrade(IntEnum):
    영웅 = auto()
    전설 = auto()
    유물 = auto()
    고대 = auto()


class CoreAttr(IntEnum):
    질서 = auto()
    혼돈 = auto()


class CoreType(IntEnum):
    해 = auto()
    달 = auto()
    별 = auto()


class Core(BaseModel):
    grade: CoreGrade
    attr: CoreAttr
    type_: CoreType

    def __str__(self):
        return f"[{self.grade.name} 등급 - {self.attr.name}의 {self.type_.name} 코어]"

    @cached_property
    def coeff(self):
        """
        현재 코어의 포인트 당 증가하는 전투력을 tuple로 반환합니다.
        예를 들어 유물 질서 해 코어는 아래와 같습니다

        0P-9P는 전투력 0% 증가 (0)
        10P-13P는 전투력 1.50% 증가 (150)
        14P-16P는 전투력 4.00% 증가 (400)
        17P는 전투력 7.50% 증가 (750)
        18P는 전투력 7.67% 증가 (767)
        19P는 전투력 7.83% 증가 (783)
        20P는 전투력 8.00% 증가 (800)

        (0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 150, 150, 150, 150, 400, 400, 400, 750, 767, 783, 800)
        """
        combat_score_dict = {
            CoreGrade.영웅: {  # 10P
                CoreAttr.질서: {
                    CoreType.해: [0] * 10 + [150] * 11,
                    CoreType.달: [0] * 10 + [150] * 11,
                    CoreType.별: [0] * 10 + [150] * 11,
                }
            },
            CoreGrade.전설: {  # 14P옵션까지만 있음
                CoreAttr.질서: {
                    CoreType.해: [0] * 10 + [150] * 4 + [400] * 7,
                    CoreType.달: [0] * 10 + [150] * 4 + [400] * 7,
                    CoreType.별: [0] * 10 + [150] * 4 + [250] * 7,
                }
            },
            CoreGrade.유물: {
                CoreAttr.질서: {
                    CoreType.해: [0] * 10
                    + [150] * 4
                    + [400] * 3
                    + [750, 767, 783, 800],
                    CoreType.달: [0] * 10
                    + [150] * 4
                    + [400] * 3
                    + [750, 767, 783, 800],
                    CoreType.별: [0] * 10
                    + [100] * 4
                    + [250] * 3
                    + [450, 467, 483, 500],
                }
            },
            CoreGrade.고대: {
                CoreAttr.질서: {
                    CoreType.해: [0] * 10
                    + [150] * 4
                    + [400] * 3
                    + [850, 867, 883, 900],
                    CoreType.달: [0] * 10
                    + [150] * 4
                    + [400] * 3
                    + [850, 867, 883, 900],
                    CoreType.별: [0] * 10
                    + [150] * 4
                    + [250] * 3
                    + [550, 567, 583, 600],
                }
            },
        }

        result = tuple(combat_score_dict[self.grade][self.attr][self.type_])
        assert len(result) == 21
        return result

    @property
    def energy(self):
        """코어 공급 의지력"""
        core_energy = {
            CoreGrade.영웅: 9,  # 7 -> 9``
            CoreGrade.전설: 12,  # 11 -> 12
            CoreGrade.유물: 15,
            CoreGrade.고대: 17,
        }
        return core_energy[self.grade]

    @property
    def target_point(self):
        """코어 목표 포인트"""
        # 질서 17P의 경우 플레이 감성에 직접적으로 영향을 미치는 것이라 반드시 필요
        # Q. 당장 젬이 없어서 유물 17P 달성 조차 안 돼요 -> 그정도면 손으로
        # Q. XXX 혼돈의 경우 14P 실압근이 17P 발사대를 쉽게 이길 수 있음. 14P로 낮춰야 함
        core_target_point = {
            CoreGrade.영웅: 0,
            CoreGrade.전설: 14,
            CoreGrade.유물: 17,
            CoreGrade.고대: 17,
        }
        return core_target_point[self.grade]


class Env:
    def __init__(self):
        # load from txt
        data: dict[GemOptionType, list[int]] = dict()
        # data[i]는 해당 옵션이 Lv. i일 때 전투력 증가량
        with open("./data/attack.txt") as fp:
            data[GemOptionType.공격력] = list(map(int, fp.readlines()))
            assert len(data[GemOptionType.공격력]) == MAX_GEM_OPTION_LEVEL + 1

        with open("./data/skill.txt") as fp:
            data[GemOptionType.추가피해] = list(map(int, fp.readlines()))
            assert len(data[GemOptionType.추가피해]) == MAX_GEM_OPTION_LEVEL + 1

        with open("./data/boss.txt") as fp:
            data[GemOptionType.보스피해] = list(map(int, fp.readlines()))
            assert len(data[GemOptionType.보스피해]) == MAX_GEM_OPTION_LEVEL + 1

        self.data = data

        # init slope min max
        # 같은 공격력 Lv.5 여도, Lv.0->5되는 것과 Lv.115->120되는 것의 전투력 증가 비율은 차이가 있다.
        # 각 공 추 보에 대해서 lv.1-lv.20의 증감량의 최소 및 최대를 미리 구해놓음
        # 20인 이유는 하나의 코어에서 달성할 수 있는 옵션 레벨은 최대 4개*5레벨 = 20레벨
        self.slopes: dict[GemOptionType, dict[int, tuple[int, int]]] = {
            k: dict() for k in GemOptionType
        }
        for k in data:
            for lv in range(1, 21):
                i = 0
                _min, _max = None, None
                while i + lv < MAX_GEM_OPTION_LEVEL:
                    coeff = (data[k][i + lv] + 10000) / (data[k][i] + 10000)
                    i += 1

                    if _min is None or _min > coeff:
                        _min = coeff
                    if _max is None or _max < coeff:
                        _max = coeff

                self.slopes[k][lv] = _min, _max


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
    index: Annotated[
        int,
        Field(
            default="식별자",  # 식별자의 고유함은 solve 함수에서 확인
            ge=0,
            le=99,
        ),
    ]
    req: Annotated[
        int,
        Field(
            title="필요 의지력",
            ge=3,  # 안정 의지력 효율 Lv. 5일 때 필요 의지력 8 - 5 = 3
            le=9,  # 불변 의지력 효율 Lv. 1일 때 필요 의지력 10 - 1 = 9
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
        """젬이 실제로 존재 가능한 옵션인지 확인"""
        poss_alpha = True  # 안정, 침식
        poss_beta = True  # 견고, 왜곡
        poss_gamma = True  # 불변, 붕괴

        # 하나의 젬은 공, 추피, 보피 중 최대 2개만 가질 수 있음
        if self.att > 0 and self.skill > 0 and self.boss > 0:
            raise ValueError(
                "젬은 공격력, 추가 피해, 보스 피해 중 최대 2가지만 가질 수 있습니다."
            )

        if self.att:  # 공격력이 있다면 불변이 절대 아님
            poss_gamma = False

        if self.skill:  # 추가 피해가 있다면 견고가 절대 아님
            poss_beta = False

        if self.boss:  # 보스 피해가 있다면 안정이 절대 아님
            poss_alpha = False

        # 주어진 가능성에 따라서 존재할 수 있는 필요 의지력 범위 계산
        ge, le = gem_possible_req[(poss_alpha, poss_beta, poss_gamma)]
        if not (ge <= self.req <= le):
            raise ValueError(
                "예상되는 젬 세부 타입에서 나올 수 없는 필요 의지력입니다."
            )

        return self

    def __str__(self):
        """
        젬을 아래와 같은 형태의 문자열로 반환합니다.
        [ 4: 3W 5P 공2 추3]
        index, 필요 의지력, 질서/혼돈 포인트, 공용 옵션
        """
        result = f"[{self.index:2}: {self.req}W {self.point}P"
        if self.att:
            result += f" 공{self.att}"
        if self.skill:
            result += f" 추{self.skill}"
        if self.boss:
            result += f" 보{self.boss}"
        return result + "]"


def get_possible_gem_index_combinations(
    gems: list[Gem],
    energy: int,
    point: int,
) -> list[list[int]]:
    """
    gems에 대해서 공급 의지력 (energy)으로 목표 포인트 (point)를 달성할 수 있는
    모든 젬 조합을 젬들의 index list가 담긴 list로 반환합니다.
    """

    n = len(gems)

    # assertions
    assert n < 100
    assert energy in (12, 15, 17)
    assert point in (14, 17)

    result = []

    # 속도를 높이기 위해 tuple로 변경 (index, 의지력, 포인트)
    gem_tuples = [(g.index, g.req, g.point) for g in gems]
    # 의지력 기준 오름차순 정렬
    gem_tuples.sort(key=lambda x: x[1])
    g = gem_tuples  # alias
    # TODO 의지력 다음에는 포인트로 정렬해서 가망 없는 포인트 pruning을 조금 더 칼같이, 근데 지금 충분히 빠름

    # 젬은 반드시 3개 혹은 4개를 장착함
    # 1번째 슬롯에 사용할 젬 탐색
    for i in range(n):
        ei = energy - g[i][1]
        pi = g[i][2]

        # 첫 젬을 착용한 뒤 남은 의지력이 6 미만이면 필요한 최소 젬 개수 3개를 충족하지 못함
        # 의지력 오름차순 정렬이니 이후 젬들은 요구 의지력이 같거나 높으므로 볼 필요 없음 break
        if ei < 6:
            break

        # 남은 젬은 모두 5P여도 도달 불가능하면 다음 젬으로
        # TODO 포인트 기준으로도 정렬해놨다면 다음 젬이 아닌,
        # 현재 의지력보다 더 큰 의지력을 필요하는 젬으로 넘어가는 것이 더 빠름
        # 그러기 위해서는 의지력이 변동되는 구간을 미리 찾아놓아야 함
        if pi + 15 < point:
            continue

        # 2번째 슬롯에 사용할 젬 탐색
        for j in range(i + 1, n):
            ej = ei - g[j][1]
            pj = pi + g[j][2]

            # 남은 의지력이 3미만이면 최소 젬 개수 3개를 충족하지 못함
            # 이후 젬들은 요구 의지력이 같거나 높으므로 break
            if ej < 3:
                break

            # 남은 젬이 모두 5P여도 도달 불가능하면 다음 젬으로
            if pj + 10 < point:
                continue

            # 영웅 코어를 위해 1-2개만 배치하는 경우...하지만 사용자의 주된 관심사가 아니다.
            # if pj >= point and ej >= 0:
            #     result.append([g[i][0], g[j][0]])

            # 3번째 슬롯에 사용할 젬 탐색
            for k in range(j + 1, n):
                ek = ej - g[k][1]
                pk = pj + g[k][2]

                # 현재 젬 i, j, k이 목표를 달성한다면 조합에 추가
                # Q. 4번째 젬을 못 쓰는 순간에만 결과에 3개짜리를 추가해야하지 않나?
                # A. No. 이 코어에서 3개만 쓰고 다른 코어에서 4개를 쓰는 게 좋을 수도 있다.
                if pk >= point and ek >= 0:
                    result.append([g[i][0], g[j][0], g[k][0]])

                # 4번째 슬롯을 사용하려고 할 때, 남은 의지력이 3 미만이면 이후 젬들은 4번째 슬롯에 장착할 수 없음
                if ek < 3:
                    break

                # 남은 젬이 5P여도 도달 불가능하면 다음 젬으로
                if pk + 5 < point:
                    continue

                # 4번째 슬롯에 착용할 젬 탐색
                for m in range(k + 1, n):
                    el = ek - g[m][1]
                    pl = pk + g[m][2]
                    # 이번 젬을 사용할 수 없다면, 이후 젬들도 모두 사용할 수 없음
                    if el < 0:
                        break

                    # 현재 젬 i, j, k, l이 목표를 달성한다면 조합에 추가
                    if pl >= point and el >= 0:
                        result.append([g[i][0], g[j][0], g[k][0], g[m][0]])

    return result


class GemSet:
    """코어에 젬을 장착한 상태를 저장합니다."""

    def __init__(
        self,
        gems: list[Gem],  # 젬 목록
        core: Core,  # 코어
        env: Env,
    ):
        # 현재 코어에 장착된 젬에서
        # 공격력, 추가 피해, 보스 피해 레벨의 합산
        # 질서/혼돈 포인트의 합산을 계산한다.
        # 나중에 정확한 전투력 계산을 하기 위해 필요하니 public member로 저장
        self.att, self.skill, self.boss, self.point = 0, 0, 0, 0
        self.used_bitmask = 0
        for gem in gems:
            self.used_bitmask |= 1 << gem.index
            self.att += gem.att
            self.skill += gem.skill
            self.boss += gem.boss
            self.point += gem.point

        # 코어 옵션의 전투력 증가량 저장
        # 나중에 정확한 전투력 계산을 하기 위해 필요하니 public member로 저장
        self.core_combat_score = core.coeff[self.point]

        # 공, 추, 보는 실제 전투력 증가량이 다름
        default_power = (self.core_combat_score + 10000) / 10000
        min_power, max_power = default_power, default_power
        if self.att:
            min_power *= env.slopes[GemOptionType.공격력][self.att][0]
            max_power *= env.slopes[GemOptionType.공격력][self.att][1]

        if self.skill:
            min_power *= env.slopes[GemOptionType.추가피해][self.skill][0]
            max_power *= env.slopes[GemOptionType.추가피해][self.skill][1]

        if self.boss:
            min_power *= env.slopes[GemOptionType.보스피해][self.boss][0]
            max_power *= env.slopes[GemOptionType.보스피해][self.boss][1]

        self.combat_power_range = min_power, max_power


def get_exact_combat_score(
    gem_sets: tuple[GemSet, GemSet, GemSet],
    env: Env,
):
    """
    주어진 GemSet들의 정확한 전투력을 계산

    ps. 사실 혼돈 코어와 합연산이라서 완벽하게 정확하지는 않다.
    """
    result = 1
    att, skill, boss = 0, 0, 0

    for gs in gem_sets:
        att += gs.att
        skill += gs.skill
        boss += gs.boss
        result *= (gs.core_combat_score + 10000) / 10000

    # 전체 공격력, 추피, 보피 레벨로 인한 전투력 반영
    result *= (env.data[GemOptionType.공격력][att] + 10000) / 10000
    result *= (env.data[GemOptionType.추가피해][skill] + 10000) / 10000
    result *= (env.data[GemOptionType.보스피해][boss] + 10000) / 10000
    return result


def solve(
    gems: list[Gem],
    cores: list[Core],
):
    # assertion
    assert len(set([g.index for g in gems])) == len(gems)  # index 중복x

    # 환경 설정
    env = Env()

    # 코어 종류 분리
    order_cores = [c for c in cores if c.attr == CoreAttr.질서]
    chaos_cores = [c for c in cores if c.attr == CoreAttr.혼돈]  # not used yet
    assert len(order_cores) == 3
    # assert len(chaos_cores) == 3

    gem_set_per_core: list[list[GemSet]] = list()
    # 모든 질서 젬에 대해서
    for core in order_cores:
        possible_combination: list[GemSet] = list()

        # 현재 코어에서 목표를 달성할 수 있는 모든 젬 조합을 반환
        possible_gem_index_combinations = get_possible_gem_index_combinations(
            gems, core.energy, core.target_point
        )

        # 모든 젬 조합에 대해서 GemSet 객체로 변환
        # - bitmask 계산
        # - 장착 후 포인트 합산
        # - 전투력 증가 범위 계산
        for gem_index_list in possible_gem_index_combinations:
            possible_combination.append(
                GemSet([g for g in gems if g.index in gem_index_list], core, env)
            )
        # GemSet을 전투력 증가 범위 최대값에 대해 내림차순으로 정렬 (for prunning)
        possible_combination.sort(key=lambda x: x.combat_power_range[1], reverse=True)
        gem_set_per_core.append(possible_combination)

        # DEBUGGING
        print("-" * 20)
        print(core)
        print(f"공급 의지력 {core.energy} -> {core.target_point}P 달성")
        print(f"현재 가능한 조합: {len(possible_combination)}개")
        top_k = 5
        print(f"상위 {top_k}개 조합")
        for com in possible_combination[:top_k]:
            print("-", end=" ")
            w, p = 0, 0
            for g in gems:
                if 1 << g.index & com.used_bitmask:
                    print(g, end=" ")
                    w += g.req
                    p += g.point
            print(f"-> {w}W {p}P", end=" ")
            print(
                f"전투력: {com.combat_power_range[0] * 100 - 100:.3f}% - {com.combat_power_range[1] * 100 - 100:.3f}%"
            )

    # backtracking solving

    @lru_cache(maxsize=None)
    def get_candidates_with_maximum(current_mask: int, core_idx: int):
        result: list[GemSet] = [
            gs
            for gs in gem_set_per_core[core_idx]
            if gs.used_bitmask & current_mask == 0
        ]
        return result

    answer = 0
    assign = None
    globla_c1_max = gem_set_per_core[0][0].combat_power_range[1]  # core1의 최대
    global_c2_max = gem_set_per_core[1][0].combat_power_range[1]  # core2의 최대
    global_c3_max = gem_set_per_core[2][0].combat_power_range[1]  # core3의 최대

    for gs1 in gem_set_per_core[0]:
        # 1번째 코어에 대해서
        # 나머지 코어를 중복 무관 최대로 고른다고 가정해도 현재 최댓값보다 작다면 이후 코어는 볼 필요 없다
        # 사유는 모든 GemSet list는 내림차순 정렬되어 있음
        if gs1.combat_power_range[1] * global_c2_max * global_c3_max < answer:
            break

        # 2번째 코어에 사용 가능한 GemSet을 가져온다
        candidates_gs2 = get_candidates_with_maximum(gs1.used_bitmask, 1)
        if not candidates_gs2:
            continue

        for gs2 in candidates_gs2:
            # 2번째 코어에 대해서
            # 나머지 코어를 중복 무관 최대로 고른다고 가정해도 현재 최댓값보다 작다면 이후 코어는 볼 필요 없다
            if (
                gs1.combat_power_range[1] * gs2.combat_power_range[1] * global_c3_max
                < answer
            ):
                break

            # 3번째 코어에 사용 가능한 GemSet을 가져온다
            # 어떤 고성능 젬들 몇 가지를 코어1과 2에 분배해서 사용하는 경우 cache hit!
            candidates_gs3 = get_candidates_with_maximum(
                gs1.used_bitmask | gs2.used_bitmask, 2
            )
            if not candidates_gs3:
                continue

            for gs3 in candidates_gs3:
                if (
                    gs1.combat_power_range[1]
                    * gs2.combat_power_range[1]
                    * gs3.combat_power_range[1]
                    < answer
                ):
                    # 정확한 계산 전에 최댓값 곱해서 정답보다 적으면 더 이상 볼 필요 없다
                    break

                value = get_exact_combat_score((gs1, gs2, gs3), env)
                assert (
                    (
                        gs1.combat_power_range[0]
                        * gs2.combat_power_range[0]
                        * gs3.combat_power_range[0]
                    )
                    <= value
                    <= (
                        gs1.combat_power_range[1]
                        * gs2.combat_power_range[1]
                        * gs3.combat_power_range[1]
                    )
                )

                if value >= answer:
                    answer = value
                    assign = [gs1, gs2, gs3]

    return answer, assign


def generate_gems(k: int = 10):
    """
    안정, 견고, 불변 중 택1하여
    의지력 효율 Lv.3-5,
    질서 포인트 Lv.3-5,
    부가 옵션 Lv.0-5 으로 임의로 젬을 k개 생성하여 반환합니다.
    """
    result: list[Gem] = list()
    import random

    random.seed(42)

    for i in range(k):
        gem_type = random.randint(0, 2)  # 0안정 1견고 2침식
        g = Gem(
            index=i,
            req=gem_type + 8 - random.randint(3, 5),
            point=random.randint(3, 5),
            att=random.randint(0, 5) if gem_type != 2 else 0,
            skill=random.randint(0, 5) if gem_type != 1 else 0,
            boss=random.randint(0, 5) if gem_type != 0 else 0,
        )
        result.append(g)
    return result


TOTAL_GEM = 50


def profile_solve():
    gems = generate_gems(k=TOTAL_GEM)
    cores = [
        Core(grade=CoreGrade.유물, attr=CoreAttr.질서, type_=CoreType.해),
        Core(grade=CoreGrade.유물, attr=CoreAttr.질서, type_=CoreType.달),
        Core(grade=CoreGrade.유물, attr=CoreAttr.질서, type_=CoreType.별),
    ]
    solve(gems, cores)


if __name__ == "__main__":
    # lp = LineProfiler()
    # lp.add_function(solve)  # solve 내부를 추적
    # lp_wrapper = lp(profile_solve)
    # lp_wrapper()
    # lp.print_stats()
    # exit(0)

    gem_count = TOTAL_GEM
    gems = generate_gems(k=gem_count)
    print(f"랜덤 젬 {gem_count}개 생성 완료")

    cores = [
        Core(
            grade=CoreGrade.전설,
            attr=CoreAttr.질서,
            type_=CoreType.해,
        ),
        Core(
            grade=CoreGrade.유물,
            attr=CoreAttr.질서,
            type_=CoreType.달,
        ),
        Core(
            grade=CoreGrade.유물,
            attr=CoreAttr.질서,
            type_=CoreType.별,
        ),
    ]
    [c.coeff for c in cores]  # coeff 미리 계산해두기

    print("현재 코어 목록")
    for c in cores:
        print("-", c)

    env = Env()

    # import cProfile
    # import pstats

    # profiler = cProfile.Profile()

    # profiler.enable()
    print("\n\n\n풀이 시작")
    t = time.perf_counter()
    v = solve(gems=gems, cores=cores)
    print(f"풀이 완료 {time.perf_counter() - t:.5f}초\n\n\n")
    # profiler.disable()

    # for sk in ("cumtime", "pcalls"):
    #     stats = pstats.Stats(profiler).sort_stats(sk)
    #     stats.print_stats(30)  # 상위 30개만 출력

    combat_score, gem_set_list = v
    if gem_set_list is None:
        print("배치 실패!")
    else:
        print(f"증가 전투력 {pp(combat_score)}")
        for i in range(3):
            used_gems = [g for g in gems if 1 << g.index & gem_set_list[i].used_bitmask]
            w, p = 0, 0
            for g in used_gems:
                w += g.req
                p += g.point

            print(f"{cores[i]} 사용 의지력 {w}/{cores[i].energy} 공급 포인트 {p}P")
            for g in used_gems:
                print("-", g)
