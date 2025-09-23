import json
import re

REGEX_TAG = re.compile(r"<[^>]+>")
REGEX_IMAGE_TAG = re.compile(r"(?=<img[^>]*><\/img>)")
REGEX_BR = re.compile(r"<br>", flags=re.IGNORECASE)

REGEX_REQ = re.compile(r"필요 의지력 : (\d+)")
REGEX_POINT = re.compile(r"질서 포인트 : (\d)")  # 혼돈 제외
REGEX_ATTACK = re.compile(r"\[공격력\] Lv.(\d)")
REGEX_SKILL = re.compile(r"\[추가 피해\] Lv.(\d)")
REGEX_BOSS = re.compile(r"\[보스 피해\] Lv.(\d)")


def clean(s: str) -> str:
    s = re.sub(REGEX_BR, " ", s)
    s = re.sub(REGEX_TAG, "", s)
    return s.strip()


def fetch():
    """전정실 arkgrid"""
    import requests

    with open("jwt.txt", "r") as fp:
        jwt = fp.read().strip()

    charname = input("캐릭터명: ")
    res = requests.get(
        f"https://developer-lostark.game.onstove.com/armories/characters/{charname}/arkgrid",
        headers={"authorization": f"Bearer {jwt}"},
    ).json()

    with open("arkgrid.json", "w", encoding="utf-8") as fp:
        json.dump(res, fp, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    fetch()
    with open("arkgrid.json", "r", encoding="utf-8") as fp:
        d = json.load(fp)

    gems = list()
    for s in d["Slots"]:
        gems += s["Gems"]

    result = list()
    for g in gems:
        t = json.loads(g["Tooltip"])
        # Path("tooltip.json").write_text(json.dumps(t, ensure_ascii=False), encoding="utf-8")

        tooltips0 = clean(t["Element_004"]["value"]["Element_001"])
        req = int(REGEX_REQ.search(tooltips0).group(1))

        tooltips1 = clean(t["Element_006"]["value"]["Element_001"])
        if matches := REGEX_POINT.search(tooltips1):
            point = int(matches.group(1))
        else:
            continue  # TODO 혼돈젬

        attack = 0
        if matches := REGEX_ATTACK.search(tooltips1):
            attack = int(matches.group(1))

        skill = 0
        if matches := REGEX_SKILL.search(tooltips1):
            skill = int(matches.group(1))

        boss = 0
        if matches := REGEX_BOSS.search(tooltips1):
            boss = int(matches.group(1))

        result.append((req, point, attack, skill, boss))

    with open("gems.json", "w") as fp:
        json.dump(result, fp, indent=2)
