"""Joins planned rows into one boustrophedon path.

Copied from the SNAKE string in Sowbot web/index.html (Agroecology-Lab/Sowbot, caatinga-dev,
8cefa4f). Greedy: from the current end, go to the nearest unvisited row end whose connector stays
inside field minus (padded) obstacles; otherwise start a new pass.
"""
import math
from shapely.geometry import LineString, Polygon
from shapely.ops import unary_union
def connect(rows, field, obs, pad):
    la0, lo0 = field[0]; R = 6378137.0; c = math.cos(math.radians(la0))
    fw = lambda q: (math.radians(q[1]-lo0)*R*c, math.radians(q[0]-la0)*R)
    inv = lambda q: [la0+math.degrees(q[1]/R), lo0+math.degrees(q[0]/(R*c))]
    segs = [[fw(q) for q in r] for r in rows if len(r) > 1]
    if not segs: return []
    free = Polygon([fw(q) for q in field])
    if obs: free = free.difference(unary_union([Polygon([fw(q) for q in o]).buffer(pad) for o in obs]))
    free = free.buffer(0.2)
    paths = []; path = list(segs.pop(0))
    while segs:
        end = path[-1]
        cand = sorted((math.dist(end, s[-1 if rev else 0]), i, rev) for i, s in enumerate(segs) for rev in (0, 1))
        pick = next(((i, rev) for d, i, rev in cand if free.covers(LineString([end, segs[i][-1 if rev else 0]]))), None)
        if pick is None:
            paths.append(path); i, rev = cand[0][1], cand[0][2]; path = []
        else: i, rev = pick
        s = segs.pop(i)
        path += s[::-1] if rev else s
    paths.append(path)
    return [[inv(q) for q in p] for p in paths]
