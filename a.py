def foo(
    p10: int,
    p14: int | None = None,
    p17: int | None = None,
    p18: int | None = None,
    p19: int | None = None,
    p20: int | None = None,
):
    r = [0] * 10  # 0-9
    v = 0

    if p10:
        v = p10
    r += [v] * 4  # 10-13
    if p14:
        v = p14
    r += [v] * 3  # 14, 15, 16
    if p17:
        v = p17
    r += [v]
    if p18:
        v = p18
    r += [v]
    if p19:
        v = p19
    r += [v]
    if p20:
        v = p20
    r += [v]
    assert len(r) == 21
    print(r)
    return r


혼해_현란_영웅 = foo(50)
혼해_안정_영웅 = foo(0)

혼해_현란_전설 = foo(50, 100)
혼해_안정_전설 = foo(0, 50)


혼해_현란_유물 = foo(50, 100, 250, 267, 283, 300)
혼해_안정_유물 = foo(0, 50, 150, 167, 183, 200)

혼해_현란_고대 = foo(50, 100, 350, 367, 383, 400)
혼해_안정_고대 = foo(0, 50, 250, 267, 283, 300)

혼별 = foo(50, 100, 250, 267, 283, 300)
