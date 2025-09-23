
import json
with open("gems.json", "r") as fp:
    d = json.load(fp)
with open("gems.txt", "r") as fp:
    lines = fp.readlines()

for l in lines:
    gem = [int(i) for i in l.strip()]
    if len(gem) < 5:
        gem.append(0) # 보피

    d.append(gem)

with open("gems2.json", "w") as fp:
    json.dump(d, fp)