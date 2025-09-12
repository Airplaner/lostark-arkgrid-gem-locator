from dataclasses import dataclass

VERBOSE = False


@dataclass
class Gem:
    req: int  # 요구 의지력 1-5
    point: int  # 질서/혼돈 포인트 1-5
    att: int  # 공격력
    skill: int  # 추가 피해
    boss: int  # 보스 피해


@dataclass
class Core:
    energy: int  # 공급 의지력
    coeff: list[int]  # 0P, 10P, 14P, 17P, 18P, 19P, 20P 증가 전투력 계수


with open("./data/attack.txt") as fp:
    data_attack = list(map(int, fp.readlines()))  # data[i]는 i번째 공격력 증가량
    assert len(data_attack) == 121

with open("./data/boss.txt") as fp:
    data_boss = list(map(int, fp.readlines()))
    assert len(data_boss) == 121

with open("./data/skill.txt") as fp:
    data_skill = list(map(int, fp.readlines()))
    assert len(data_skill) == 121


def foo(
    gems: list[Gem],
    cores: list[Core],
):
    assert len(cores) <= 3
    return dfs(
        cores=cores,
        gems=gems,
        used=[-1] * 12,
        used_flag=[False] * 12,
        energy=[c.energy for c in cores],
        idx=0,
    )


answer = 0


def get_result(
    cores: list[Core],
    gems: list[Gem],
    used: list[int],
):
    global answer
    global data_skill
    global data_attack
    global data_boss

    lv_att = 0
    lv_boss = 0
    lv_skill = 0

    result = 1
    cplist = []  # verbose

    for core_idx, c in enumerate(cores):
        core_point = 0  # 현재 코어의 질서/혼돈 포인트 총합

        for gem_idx in range(4):
            i = core_idx * 4 + gem_idx
            if used[i] == -1:
                continue
            g = gems[used[i]]

            core_point += g.point
            lv_att += g.att
            lv_boss += g.boss
            lv_skill += g.skill

        if VERBOSE:
            cplist.append(core_point)
        if core_point >= 20:
            coeff = c.coeff[6]
        elif core_point >= 19:
            coeff = c.coeff[5]
        elif core_point >= 18:
            coeff = c.coeff[4]
        elif core_point >= 17:
            coeff = c.coeff[3]
        elif core_point >= 14:
            coeff = c.coeff[2]
        elif core_point >= 10:
            coeff = c.coeff[1]
        else:
            coeff = 0  # c.coeff[0]은 어짜피 0

        result *= (coeff + 10000) / 10000

    result *= (
        (data_attack[lv_att] + 10000)
        / 10000
        * (data_boss[lv_boss] + 10000)
        / 10000
        * (data_skill[lv_skill] + 10000)
        / 10000
    )

    if VERBOSE:
        u = [" " if i == -1 else str(i) for i in used]
        for i in range(3):
            print(f"[{' '.join(u[i * 4 : i * 4 + 4])}] {cplist[i]:2}P", end=" ")
        print(f"공{lv_att:3} 추{lv_skill:3} 보{lv_boss:3}", end=" ")
        print(f"{((result - 1) * 100):.7f}%")
    if result > answer:
        answer = result


def dfs(
    cores: list[Core],  # CONST 모든 코어들 (길이는 반드시 3)
    gems: list[Gem],  # CONST 모든 젬들 (길이는 1 이상)
    used: list[int],  # 사용한 젬의 idx (길이는 반드시 12)
    used_flag: list[bool],  # gems에서 i번째 젬을 사용했다면, used_flag[i]는 True
    energy: list[int],  # 코어마다 남은 에너지 (길이는 반드시 3)
    idx: int,
):
    # 종료 상황
    # 채울 코어가 없다면 가치 평가 및 종료
    if idx >= 12:
        return get_result(cores, gems, used)

    core_idx = idx // 4

    for gem_idx, gem in enumerate(gems):
        # 이미 사용했거나, 현재 코어에서 공급 가능한 에너지가 부족한 경우 생략
        if used_flag[gem_idx] or energy[core_idx] < gem.req:
            continue

        # 사용 처리 및 DFS
        used[idx] = gem_idx
        used_flag[gem_idx] = True
        energy[core_idx] -= gem.req

        dfs(
            cores=cores,
            gems=gems,
            used=used,
            used_flag=used_flag,
            energy=energy,
            idx=idx + 1,
        )

        # 원복
        used[idx] = -1
        used_flag[gem_idx] = False
        energy[core_idx] += gem.req

    # 이번 코어에 젬을 더 이상 할당하는 걸 포기하고, 다음 코어로 이동
    dfs(
        cores=cores,
        gems=gems,
        used=used,
        used_flag=used_flag,
        energy=energy,
        idx=idx - idx % 4 + 4,
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
    v = foo(
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
            Core(energy=15, coeff=[0, 150, 400, 750, 767, 783, 800]),
            Core(energy=15, coeff=[0, 150, 400, 850, 867, 883, 900]),
            Core(energy=15, coeff=[0, 150, 400, 750, 767, 783, 800]),
        ],
    )
    print(answer)
    # exit(0)
    answer = 0

    # full test
    v = foo(
        gems=generate_gems(k=10),
        cores=[
            Core(energy=15, coeff=[0, 150, 400, 750, 767, 783, 800]),
            Core(energy=15, coeff=[0, 150, 400, 750, 767, 783, 800]),
            Core(energy=15, coeff=[0, 150, 400, 750, 767, 783, 800]),
        ],
    )
    print(answer)
