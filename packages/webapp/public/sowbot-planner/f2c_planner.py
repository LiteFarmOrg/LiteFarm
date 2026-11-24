"""
f2c_planner.py
──────────────
Field2Cover planning core: lat/lon <-> local-XY projection and the swath
generator. Standalone package (devkit_f2c_planner) with no NiceGUI/UI
dependency, so any caller can use it.

Originally lived inside devkit_ui/ui_node.py, coupled to the manual-drawing
mission workflow. First pulled into devkit_ui/f2c_planner.py so the
terrain-aware pipeline (devkit_ui/terrain_mask.py) could share the same
projection — anchored at the same lat0/lon0 — without reaching into
ui_node's internals. Promoted to its own package because "planning core"
and "web UI" are different concerns with different reasons to change, and
nothing about this module actually depends on devkit_ui.

devkit_ui still owns the manual-drawing UI and calls run_f2c() the same
way it always did, now via the devkit_f2c_planner dependency instead of a
same-package import.
"""

import math
import sys

# fields2cover is optional: it is built from source in docker/Dockerfile and is
# unavailable in the browser (Pyodide). Without it, run_f2c() falls back to a
# pure-shapely swath generator (backend='shapely').
try:
    # pylint: disable=import-error
    import fields2cover as f2c
except ImportError:  # pragma: no cover
    f2c = None
from shapely.geometry import LineString, MultiLineString, Polygon
from shapely.ops import unary_union

# offset_curve() (shapely >= 2.0) is used by run_contour_f2c() below. The
# repo doesn't pin a shapely version — it's installed generically in the
# Dockerfile, same as fields2cover — so this is flagged here rather than
# discovered as a cryptic AttributeError on an older pin.
_SHAPELY_OFFSET_CURVE_MIN_VERSION = '2.0'


def f2c_latlon_to_xy(lat: float, lon: float,
                      lat0: float, lon0: float) -> tuple[float, float]:
    """Project latitude/longitude degrees to (east, north) meters about (lat0, lon0).

    The anchor is also in degrees; the projection uses a local equirectangular approximation.
    """
    R = 6_378_137.0
    x = math.radians(lon - lon0) * R * math.cos(math.radians(lat0))
    y = math.radians(lat - lat0) * R
    return x, y


def f2c_xy_to_latlon(x: float, y: float,
                      lat0: float, lon0: float) -> tuple[float, float]:
    """Return (latitude, longitude) degrees from local (east, north) meters.

    Use the same anchor (lat0, lon0), in degrees, as f2c_latlon_to_xy.
    """
    R   = 6_378_137.0
    lat = lat0 + math.degrees(y / R)
    lon = lon0 + math.degrees(x / (R * math.cos(math.radians(lat0))))
    return lat, lon


def field_centroid_xy(corners_ll: list) -> tuple[float, float]:
    """Field boundary's spatial centroid, in the same local-xy frame
    run_f2c()/run_contour_f2c() use (anchored at corners_ll[0]).

    Callers pass this straight through as dem.select_reference_contour_xy()'s
    centroid_xy argument, to get a reference contour centred on the field —
    see that function's docstring for why centring keeps drift symmetric.
    """
    lat0, lon0 = corners_ll[0]
    poly = Polygon([f2c_latlon_to_xy(lat, lon, lat0, lon0) for lat, lon in corners_ll])
    if not poly.is_valid:
        poly = poly.buffer(0)
    return poly.centroid.x, poly.centroid.y


# OBSTACLE: shapely post-clipping for swath/obstacle avoidance.
#
# We do not trust F2C's interior-ring handling. Across F2C builds and
# Python-binding versions the behaviour of SG_BruteForce with respect to
# Cell holes is inconsistent — sometimes swaths are clipped against
# holes, sometimes they aren't, with no error either way. Field tests
# showed swaths running straight through marked obstacles even with CW-
# wound interior rings.
#
# The fix: generate swaths against the outer boundary (F2C's job), then
# compute swath_line.difference(union_of_obstacle_polygons) ourselves
# (shapely's job). This is observable, deterministic, and guarantees the
# lines you see on the Mission map are the lines the robot will follow.
#
# Obstacle rings are still added to the F2C Cell as a hint — belt and
# braces — but the safety net is the shapely post-clip.
#
# HEADLAND: optional Minkowski erosion of the field by headland_width_m
# before swath generation, so swaths don't start/end exactly at the
# field boundary. Done via F2C's HG_Const_gen; wrapped in try/except
# because the headland call can fail on degenerate / very narrow fields.
#
# SNAKE: optional boustrophedon ordering — every second swath reversed
# so end-of-swath-N is near start-of-swath-N+1. Done in Python rather
# than via f2c.RP_Snake to avoid depending on which route-planner API
# the local F2C build exposes. Snake-flip happens *before* shapely
# clipping so direction is preserved per-fragment when an obstacle
# splits a swath into pieces.
def run_f2c(corners_ll: list,
            obstacle_rings: list,
            tool_width: float,
            angle_deg: float,
            obstacle_pad_m: float = 0.0,
            headland_width_m: float = 0.0,
            snake_order: bool = True,
            backend: str = 'auto') -> list:
    """Generate straight-swath field rows for the boundary, clipped around obstacles.

    corners_ll and obstacle_rings contain (latitude, longitude) points in degrees.
    The first boundary corner anchors the local projection. tool_width is positive
    row spacing in meters; angle_deg is counterclockwise from east, modulo 180.
    Positive obstacle_pad_m expands obstacles and positive headland_width_m insets
    the field, both in meters. An empty inset, or failed F2C headland generation,
    falls back to the full boundary. snake_order reverses alternate swaths before
    obstacle clipping; clipped fragments at most half a tool width long are dropped.

    backend: 'f2c' (Fields2Cover), 'shapely' (pure Python, runs in Pyodide)
    or 'auto' (f2c if importable, else shapely).

    Returns lists of (latitude, longitude) points in traversal order, or an empty
    list when no swaths survive. Uncaught geometry and swath-generation errors propagate.

    Raises:
        ValueError: backend is unknown.
        ImportError: backend='f2c' is requested but Fields2Cover is unavailable.
        IndexError: corners_ll is empty.
    """
    if backend == 'auto':
        backend = 'f2c' if f2c is not None else 'shapely'
    if backend not in ('f2c', 'shapely'):
        raise ValueError(f'unknown backend {backend!r}')
    if backend == 'f2c' and f2c is None:
        raise ImportError('backend="f2c" requested but fields2cover is not installed')

    def _log(msg):
        """Write a prefixed diagnostic line to stderr."""
        print(f'[F2C] {msg}', file=sys.stderr, flush=True)

    _log(f'called: {len(corners_ll)} boundary pts, '
         f'{len(obstacle_rings)} obstacles, pad={obstacle_pad_m}m, '
         f'headland={headland_width_m}m, snake={snake_order}, '
         f'width={tool_width}m, angle={angle_deg}°')

    lat0, lon0 = corners_ll[0]

    if backend == 'shapely':
        return _run_shapely(corners_ll, obstacle_rings, tool_width, angle_deg,
                            obstacle_pad_m, headland_width_m, snake_order,
                            lat0, lon0, _log)

    # ── Outer boundary ────────────────────────────────────────────────
    outer = f2c.LinearRing()
    for lat, lon in corners_ll:
        x, y = f2c_latlon_to_xy(lat, lon, lat0, lon0)
        outer.addPoint(f2c.Point(x, y, 0))
    outer.closeRing()
    cell = f2c.Cell()
    cell.addRing(outer)

    # ── Obstacles: shapely polys for post-clip + F2C hole hints ──────
    obstacle_polys_xy = _build_obstacle_polys(
        obstacle_rings, lat0, lon0, obstacle_pad_m, _log, f2c_cell=cell)
    _log(f'built cell with {len(obstacle_polys_xy)} shapely obstacles')

    # ── Headland inset ───────────────────────────────────────────────
    # Shrinks the cover area by headland_width_m on all sides so the
    # robot has room to turn at field edges instead of starting/ending
    # swaths at the boundary itself. Skipped when 0 — preserves the
    # original behaviour for backwards compatibility with saved fields.
    swath_cell = cell
    if headland_width_m > 0:
        try:
            hg = f2c.HG_Const_gen()
            inner = hg.generateHeadlands(f2c.Cells(cell), headland_width_m)
            if inner.size() > 0:
                swath_cell = inner.getGeometry(0)
                _log(f'headland: inset {headland_width_m}m → '
                     f'{inner.size()} sub-cell(s)')
            else:
                _log(f'headland: inset {headland_width_m}m produced 0 '
                     f'cells (too wide?) — using full boundary')
        except Exception as e:
            _log(f'headland generation failed: {e} — using full boundary')

    # ── Swath generation ─────────────────────────────────────────────
    angle_rad = math.radians(angle_deg % 180)
    sg     = f2c.SG_BruteForce()
    swaths = sg.generateSwaths(angle_rad, tool_width, swath_cell)

    raw_xy: list = []
    for i in range(swaths.size()):
        path = swaths.at(i).getPath()
        pts  = []
        for j in range(path.size()):
            pt = path.getGeometry(j)
            pts.append((pt.getX(), pt.getY()))
        if len(pts) >= 2:
            raw_xy.append(pts)
    _log(f'F2C produced {len(raw_xy)} raw swaths')

    # ── Snake ordering (Python-side boustrophedon) ───────────────────
    # F2C's BruteForce returns swaths spatially sorted along the
    # perpendicular to `angle`. Reversing every other one means the end
    # of swath N is near the start of swath N+1 — minimising inter-row
    # travel and giving the topo graph a natural chain order.
    #
    # Done before shapely clipping so direction is preserved when an
    # obstacle splits a swath into multiple fragments.
    if snake_order and raw_xy:
        raw_xy = [list(reversed(pts)) if i % 2 == 1 else list(pts)
                  for i, pts in enumerate(raw_xy)]
        _log(f'snake-flipped {len(raw_xy)} swaths')

    # ── Post-clip swaths against obstacle union ──────────────────────
    if obstacle_polys_xy:
        raw_xy = _clip_lines_against_obstacles(
            raw_xy, obstacle_polys_xy, tool_width * 0.5, _log)

    # ── Project back to lat/lon ──────────────────────────────────────
    result: list = []
    for pts_xy in raw_xy:
        pts_ll = [f2c_xy_to_latlon(x, y, lat0, lon0) for x, y in pts_xy]
        if len(pts_ll) >= 2:
            result.append(pts_ll)
    _log(f'returning {len(result)} swaths to UI')
    return result


def _swaths_shapely(poly: Polygon, tool_width: float, angle_rad: float) -> list:
    """Parallel swaths at angle_rad (from +x) spaced tool_width apart.

    Mirrors SG_BruteForce for a fixed angle: rotate so swaths run along x,
    first row half a width inside the lower extent, intersect each row with
    the polygon, rotate back. Concave fields give several fragments per row.
    """
    c, s = math.cos(-angle_rad), math.sin(-angle_rad)
    cb, sb = math.cos(angle_rad), math.sin(angle_rad)

    def rot(x, y):
        """Rotate local coordinates into the frame where swaths run along the x axis."""
        return x * c - y * s, x * s + y * c

    def unrot(x, y):
        """Rotate swath coordinates back into the original local frame."""
        return x * cb - y * sb, x * sb + y * cb

    polys = list(poly.geoms) if poly.geom_type == 'MultiPolygon' else [poly]
    out: list = []
    for part in polys:
        rp = Polygon([rot(x, y) for x, y in part.exterior.coords],
                     [[rot(x, y) for x, y in h.coords] for h in part.interiors])
        minx, miny, maxx, maxy = rp.bounds
        y = miny + tool_width / 2
        while y <= maxy:
            row = LineString([(minx - 1, y), (maxx + 1, y)]).intersection(rp)
            geoms = list(row.geoms) if hasattr(row, 'geoms') else [row]
            for g in sorted((g for g in geoms if g.geom_type == 'LineString' and g.length > 0),
                            key=lambda g: g.coords[0][0]):
                out.append([unrot(px, py) for px, py in g.coords])
            y += tool_width
    return out


def _run_shapely(corners_ll, obstacle_rings, tool_width, angle_deg,
                 obstacle_pad_m, headland_width_m, snake_order, lat0, lon0, _log):
    """Pure-shapely twin of the F2C branch in run_f2c()."""
    field = Polygon([f2c_latlon_to_xy(lat, lon, lat0, lon0) for lat, lon in corners_ll])
    if not field.is_valid:
        field = field.buffer(0)
    obstacle_polys_xy = _build_obstacle_polys(
        obstacle_rings, lat0, lon0, obstacle_pad_m, _log, f2c_cell=None)

    swath_poly = field
    if headland_width_m > 0:
        inset = field.buffer(-headland_width_m, join_style=2)
        if inset.is_empty:
            _log(f'headland: inset {headland_width_m}m emptied the field, using full boundary')
        else:
            swath_poly = inset

    raw_xy = _swaths_shapely(swath_poly, tool_width, math.radians(angle_deg % 180))
    _log(f'shapely produced {len(raw_xy)} raw swaths')
    if snake_order and raw_xy:
        raw_xy = [list(reversed(p)) if i % 2 == 1 else list(p) for i, p in enumerate(raw_xy)]
    if obstacle_polys_xy:
        raw_xy = _clip_lines_against_obstacles(raw_xy, obstacle_polys_xy, tool_width * 0.5, _log)
    result = [[f2c_xy_to_latlon(x, y, lat0, lon0) for x, y in p] for p in raw_xy if len(p) >= 2]
    _log(f'returning {len(result)} swaths')
    return result


def tag_rows(rows_ll: list, corners_ll: list, angle_deg: float) -> list:
    """Return (row, frag) for each swath returned by run_f2c().

    Obstacle clipping splits one row into consecutive swaths. Those share a
    perpendicular offset (to the swath direction), so group on that. Row
    numbers count from 0 in order of first appearance; frag counts from 0
    within a row.
    """
    lat0, lon0 = corners_ll[0]
    a = math.radians(angle_deg % 180)
    tags, seen, frags = [], {}, {}
    for row in rows_ll:
        x, y = f2c_latlon_to_xy(row[0][0], row[0][1], lat0, lon0)
        key = round((-math.sin(a) * x + math.cos(a) * y) * 100)  # 1 cm bins
        rid = seen.setdefault(key, len(seen))
        frags[rid] = frags.get(rid, -1) + 1
        tags.append((rid, frags[rid]))
    return tags


def _build_obstacle_polys(obstacle_rings: list, lat0: float, lon0: float,
                           obstacle_pad_m: float, _log, f2c_cell=None) -> list:
    """Project obstacle_rings (lat/lon) to shapely polygons in local xy,
    repairing invalid geometry and applying padding. Shared by run_f2c()
    and run_contour_f2c() so the two swath styles can't drift apart on
    what counts as a valid obstacle.

    If f2c_cell is given (an f2c.Cell), also adds each obstacle as a hole
    ring on it — the "belt and braces" F2C hint described in the OBSTACLE
    comment above run_f2c(). run_contour_f2c() passes None here: its
    swaths aren't generated by F2C at all, so there's no F2C cell to hint.
    """
    obstacle_polys_xy: list = []
    for idx, ring_ll in enumerate(obstacle_rings):
        if len(ring_ll) < 3:
            _log(f'obstacle {idx}: skipped (only {len(ring_ll)} pts)')
            continue
        pts_xy = [f2c_latlon_to_xy(lat, lon, lat0, lon0)
                  for lat, lon in ring_ll]
        _log(f'obstacle {idx}: {len(pts_xy)} pts, '
             f'xy bbox=({min(p[0] for p in pts_xy):.1f},{min(p[1] for p in pts_xy):.1f}) '
             f'to ({max(p[0] for p in pts_xy):.1f},{max(p[1] for p in pts_xy):.1f})')

        poly = Polygon(pts_xy)
        was_valid = poly.is_valid
        _log(f'obstacle {idx}: shapely poly valid={was_valid} '
             f'empty={poly.is_empty} area={poly.area:.3f}m²')

        if not was_valid:
            poly = poly.buffer(0)
            if poly.is_valid and not poly.is_empty and poly.geom_type == 'Polygon':
                _log(f'obstacle {idx}: REPAIRED via buffer(0)')
            else:
                _log(f'obstacle {idx}: DROPPED (invalid, repair failed)')
                continue

        if obstacle_pad_m > 0:
            poly = poly.buffer(obstacle_pad_m, join_style=2, resolution=8)
            _log(f'obstacle {idx}: after buffer({obstacle_pad_m}m) '
                 f'empty={poly.is_empty} type={poly.geom_type} '
                 f'area={poly.area:.3f}m²')
        if poly.is_empty or poly.geom_type != 'Polygon':
            _log(f'obstacle {idx}: DROPPED (empty or non-Polygon)')
            continue
        obstacle_polys_xy.append(poly)

        if f2c_cell is not None:
            hole = f2c.LinearRing()
            for x, y in reversed(list(poly.exterior.coords)):
                hole.addPoint(f2c.Point(x, y, 0))
            hole.closeRing()
            f2c_cell.addRing(hole)

    return obstacle_polys_xy


def _clip_lines_against_obstacles(raw_xy: list, obstacle_polys_xy: list,
                                   min_fragment_len_m: float, _log,
                                   break_after: set[int] | None = None) -> list:
    """line.difference(obstacle_union) for every row, dropping fragments
    too short to be worth driving. Shared post-clip step for both swath
    styles — see the OBSTACLE comment above run_f2c() for why this is
    done in shapely rather than trusted to F2C's own hole handling.
    When provided, break_after is remapped in place and includes new gaps
    introduced by obstacle clipping.
    """
    obstacles_union = unary_union(obstacle_polys_xy)
    _log(f'obstacle union: type={obstacles_union.geom_type} '
         f'area={obstacles_union.area:.3f}m² '
         f'bounds={obstacles_union.bounds}')
    if raw_xy:
        sample = raw_xy[0]
        _log(f'first row: {len(sample)} pts, '
             f'from ({sample[0][0]:.1f},{sample[0][1]:.1f}) '
             f'to ({sample[-1][0]:.1f},{sample[-1][1]:.1f})')

    clipped: list = []
    clipped_breaks: set[int] = set()
    pending_break = False
    clipped_count, dropped_count = 0, 0
    for index, pts in enumerate(raw_xy):
        pending_break |= break_after is not None and index - 1 in break_after
        start = len(clipped)
        line = LineString(pts)
        intersects = line.intersects(obstacles_union)
        remaining = line.difference(obstacles_union)
        if remaining.is_empty:
            dropped_count += 1
            pending_break |= bool(clipped)
            continue
        geoms = (list(remaining.geoms)
                 if isinstance(remaining, MultiLineString)
                 else [remaining])
        for sub in geoms:
            if sub.length > min_fragment_len_m:
                if clipped and pending_break:
                    clipped_breaks.add(len(clipped) - 1)
                clipped.append(list(sub.coords))
                pending_break = True
                if intersects:
                    clipped_count += 1
        if len(clipped) > start:
            pending_break = False
        elif clipped:
            pending_break = True
    if break_after is not None:
        break_after.clear()
        break_after.update(clipped_breaks)
    _log(f'clipped {clipped_count} rows against obstacles, '
         f'{dropped_count} fully dropped, final={len(clipped)}')
    return clipped


# CONTOUR ROWS: curved swaths that follow the terrain instead of F2C's
# single fixed sweep angle.
#
# F2C's own swath generator (SG_BruteForce, used by run_f2c() above) only
# produces straight parallel lines — its documented model assumes flat
# topography. That's not a config flag to change, it's the geometry core,
# so this doesn't patch F2C; it's a second, independent row generator that
# reuses run_f2c()'s projection and obstacle-clipping helpers instead of
# F2C's swath math.
#
# Method: offset a single reference line (dem.select_reference_contour_*(),
# the elevation isoline through the field centroid — see that module for
# why the centroid) by +/- n*tool_width using shapely's offset_curve(),
# both directions, until the offset runs off the field. This gives exact,
# constant row spacing everywhere — the trade-off, discussed and accepted
# rather than avoided, is that only the reference row itself is a true
# elevation contour; rows further out are geometrically parallel to it but
# will drift from the *actual* isoline at that offset, in proportion to
# how much the terrain curves between the two. Centring the reference on
# the field means that drift is at most ~half the field's cross-slope
# width in either direction rather than the full width.
#
# KNOWN LIMITATION, not yet handled: offset_curve() on a bendy reference
# line at a distance approaching the local radius of curvature can produce
# self-intersecting loops ("horns"), same failure mode any offset-curve
# algorithm has. Rows where this happens are logged and dropped rather
# than emitted looped/garbled — flagged as follow-up work once there's
# real field DEM data to know how often this actually bites, rather than
# guessed at now.
def _extend_line(line: LineString, dist: float, probe_m: float) -> LineString:
    """Extend both ends of line along their end tangents by dist metres.

    The reference contour only exists where the DEM does, so it is usually
    shorter than the field. Offsetting it as-is leaves the rest of the field
    uncovered. The tangent is taken over probe_m (not the last segment) so a
    noisy end vertex doesn't swing the extension.
    """
    if dist <= 0 or line.length == 0:
        return line
    probe = min(probe_m, line.length / 2)
    pts = list(line.coords)

    def _tip(end_pt, inner_pt):
        dx, dy = end_pt[0] - inner_pt.x, end_pt[1] - inner_pt.y
        n = math.hypot(dx, dy)
        return pts[0] if n == 0 else (end_pt[0] + dx / n * dist, end_pt[1] + dy / n * dist)

    tail = _tip(pts[-1], line.interpolate(line.length - probe))
    head = _tip(pts[0], line.interpolate(probe))
    return LineString([head, *pts, tail])


def run_contour_f2c(corners_ll: list,
                      obstacle_rings: list,
                      reference_line_ll: list,
                      tool_width: float,
                      obstacle_pad_m: float = 0.0,
                      headland_width_m: float = 0.0,
                      snake_order: bool = True,
                      max_rows_each_side: int = 500,
                      extend_reference: bool = True,
                      *, break_after: set[int] | None = None) -> list:
    """Generate rows at constant offsets from a reference curve, clipped to the field.

    corners_ll, obstacle_rings and reference_line_ll contain (latitude, longitude)
    points in degrees, projected about corners_ll[0]. tool_width is positive row
    spacing in meters. Positive obstacle_pad_m expands obstacles; positive
    headland_width_m insets the field, falling back to the full boundary if the
    inset is empty or is not a single polygon.

    extend_reference extends both ends along their end directions when the result
    does not cross itself. Try up to max_rows_each_side offsets on each side, stopping
    each side at its first unusable offset. Offset-curve errors are caught and stop
    that side; other geometry errors propagate. These offsets approximate terrain
    contours away from the reference line.

    Return swaths as lists of (latitude, longitude) points, ordered by signed offset.
    snake_order reverses alternate rows, including fragment order. With obstacles,
    fragments at most half a tool width long are dropped. Return an empty list for
    fewer than two reference points or when no rows survive. Empty corners_ll
    raises IndexError.

    If supplied, break_after is cleared and filled with zero-based output indices
    after which links must be skipped because of field or obstacle gaps.
    """

    if break_after is None:
        break_after = set()
    else:
        break_after.clear()

    def _log(msg):
        """Write a prefixed diagnostic line to stderr."""
        print(f'[F2C-contour] {msg}', file=sys.stderr, flush=True)

    _log(f'called: {len(corners_ll)} boundary pts, '
         f'{len(obstacle_rings)} obstacles, {len(reference_line_ll)} '
         f'reference pts, pad={obstacle_pad_m}m, headland={headland_width_m}m, '
         f'snake={snake_order}, width={tool_width}m')

    lat0, lon0 = corners_ll[0]

    field_poly = Polygon(
        [f2c_latlon_to_xy(lat, lon, lat0, lon0) for lat, lon in corners_ll])
    if not field_poly.is_valid:
        field_poly = field_poly.buffer(0)

    swath_poly = field_poly
    if headland_width_m > 0:
        inset = field_poly.buffer(-headland_width_m, join_style=2)
        if not inset.is_empty and inset.geom_type == 'Polygon':
            swath_poly = inset
            _log(f'headland: inset {headland_width_m}m ok')
        else:
            _log(f'headland: inset {headland_width_m}m emptied the field '
                 f'(too wide?) — using full boundary')

    obstacle_polys_xy = _build_obstacle_polys(
        obstacle_rings, lat0, lon0, obstacle_pad_m, _log, f2c_cell=None)

    ref_xy = [f2c_latlon_to_xy(lat, lon, lat0, lon0) for lat, lon in reference_line_ll]
    if len(ref_xy) < 2:
        _log(f'reference line has {len(ref_xy)} pts, need >= 2 — returning no rows')
        return []
    ref_line = LineString(ref_xy)
    if extend_reference:
        minx, miny, maxx, maxy = swath_poly.bounds
        extended = _extend_line(ref_line, math.hypot(maxx - minx, maxy - miny),
                                3 * tool_width)
        if extended.is_simple:
            ref_line = extended

    # ── Offset outward from the reference line until we run off the field ──
    def _row_at(offset_m: float) -> list | None:
        """Build one row offset from the reference line, or None if it can't be produced."""
        if offset_m == 0:
            line = ref_line
        else:
            try:
                line = ref_line.offset_curve(offset_m, join_style=2)
            except Exception as e:
                _log(f'offset_curve({offset_m:.1f}m) failed: {e}')
                return None
        if line.is_empty:
            return None
        if not line.is_simple:
            _log(f'offset {offset_m:.1f}m: self-intersecting ("horn") — dropped, '
                 f'see KNOWN LIMITATION in the module docstring')
            return None
        clipped = line.intersection(swath_poly)
        if clipped.is_empty:
            return None
        parts = [clipped] if clipped.geom_type == 'LineString' else getattr(clipped, 'geoms', [])
        pieces = [list(g.coords) for g in parts if g.geom_type == 'LineString' and len(g.coords) >= 2]
        return pieces or None

    rows_by_offset: dict = {}
    center = _row_at(0.0)
    if center is not None:
        rows_by_offset[0.0] = center

    for direction in (1, -1):
        for n in range(1, max_rows_each_side + 1):
            offset_m = direction * n * tool_width
            row = _row_at(offset_m)
            if row is None:
                _log(f'direction {direction:+d}: ran out at offset '
                     f'{offset_m - direction * tool_width:.1f}m ({n - 1} rows)')
                break
            rows_by_offset[offset_m] = row

    # ── Snake ordering, same as run_f2c() ────────────────────────────
    # A row that re-enters the field (concave boundary) yields several
    # pieces; flipping reverses the order of the pieces as well as each one.
    raw_xy = []
    for i, k in enumerate(sorted(rows_by_offset)):
        pieces = rows_by_offset[k]
        if snake_order and i % 2 == 1:
            pieces = [list(reversed(pc)) for pc in reversed(pieces)]
        for fragment, pc in enumerate(pieces):
            if fragment:
                break_after.add(len(raw_xy) - 1)
            raw_xy.append(list(pc))
    _log(f'generated {len(raw_xy)} contour rows before obstacle clipping')

    # ── Post-clip against obstacle union ──────────────────────────────
    if obstacle_polys_xy:
        raw_xy = _clip_lines_against_obstacles(
            raw_xy, obstacle_polys_xy, tool_width * 0.5, _log, break_after)

    result: list = []
    for pts_xy in raw_xy:
        pts_ll = [f2c_xy_to_latlon(x, y, lat0, lon0) for x, y in pts_xy]
        if len(pts_ll) >= 2:
            result.append(pts_ll)
    _log(f'returning {len(result)} contour rows to UI')
    return result
