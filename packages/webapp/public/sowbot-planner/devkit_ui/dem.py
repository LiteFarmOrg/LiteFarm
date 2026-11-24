"""
dem.py
──────
Builds a DEM (elevation grid) from sparse recon points — the CSV logged by
devkit_driver/modules/recon_dem_logger.py — then derives a traversability
mask from it. This is the missing link between recon logging and
terrain_mask.py's ring vectorizer (see repo issue #110):

    recon.csv --[this module]--> elevation grid --[this module]--> traversable
        mask --[terrain_mask.py]--> obstacle_rings --[f2c_planner]--> run_f2c()

Interpolation backend: scipy.interpolate.RBFInterpolator. RTK recon points
are metres apart, not point-cloud density, so a thin-plate spline is enough
— no need for grid_map_pcl or a C++ dependency. `_interpolate_elevation()`
is the single seam to swap in verde.Spline later if RBF proves too crude on
real field data; the points-in/grid-out shape is the same for both, so that
swap should be a one-function change, not a rewrite. (Measured against
verde.Spline on synthetic noisy data: comparable accuracy at matched
regularization — the RBF-vs-Spline choice isn't the thing that matters
here, see below.)

`_choose_smoothing()`'s cross-validation loop is adapted from
verde.SplineCV's approach — grid-search a set of regularization candidates,
score each against held-out folds, keep the lowest-error one — credit:
fatiando/verde (github.com/fatiando/verde), BSD-3-Clause License,
Copyright (c) 2017 The Verde Developers. Reimplemented directly on top of
RBFInterpolator instead of depending on verde.SplineCV, because Verde's
*only* runtime dependency this module would actually use is that CV loop —
`import verde` unconditionally pulls in pandas, xarray, scikit-learn, dask,
and pooch (measured: ~2.4s import time) for a package meant to run on an
embedded SBC (Avaota A1). Not worth it for one grid-search loop.

`elevation_to_traversable()` mirrors the slope math in
devkit_bringup/config/terrain_traversability_filters.yaml's filter3/filter4
(acos(normal_z) threshold) so behaviour matches if that grid_map_filters
chain is ever wired in instead of this.

Pure functions, no ROS dependency — callers read the CSV themselves and
pass plain numpy arrays, same convention as terrain_mask.py.
"""

import csv
import logging
from pathlib import Path

import numpy as np
from scipy.interpolate import RBFInterpolator
from shapely.geometry import LineString, Point
from skimage import measure

# pylint: disable=import-error
from devkit_f2c_planner.f2c_planner import f2c_latlon_to_xy, f2c_xy_to_latlon
from devkit_ui.terrain_mask import traversability_mask_to_latlon_rings

# Candidate RBFInterpolator `smoothing` values tried by _choose_smoothing().
# 0.0 = exact interpolation (fits noise); higher values damp it out more.
# Matches the order of magnitude verde.SplineCV's own damping search swept
# in practice (1e-4..1) but doesn't need to match exactly — this is a coarse
# grid, not a claim that these are the optimal candidates for RTK data.
_SMOOTHING_CANDIDATES = (0.0, 1e-4, 1e-3, 1e-2, 0.1, 1.0)

# Below this many points, k-fold CV folds are too small to give a stable
# smoothing estimate — CV error on 1-2 held-out points per fold is noise,
# not signal. Fall back to a fixed mid-range default instead.
_MIN_POINTS_FOR_CV = 10

# Above this many points, skip CV — RBFInterpolator fit cost is roughly
# O(N^3), and _choose_smoothing() fits len(_SMOOTHING_CANDIDATES) * n_folds
# interpolators to search. Flagged (not measured) as a real cost for large
# recon drives — revisit this cutoff once you have field data at real scale.
_MAX_POINTS_FOR_CV = 2000

# Neighbours cap shared between _choose_smoothing()'s cross-validation and
# _interpolate_elevation()'s production fit — CV must score the same
# neighbours-limited estimator that actually gets used, or the smoothing
# value it picks is tuned for a different (global, neighbors=None) model.
_INTERP_NEIGHBORS = 150

# Maximum grid cells allowed in build_elevation_grid. Protects against
# OOM/excessive computation when resolution_m is too fine or the field is
# unexpectedly large. 4M cells (e.g. 2000x2000 grid) is roughly the upper
# bound for a large field at 0.5m resolution without hitting memory issues
# on typical hardware.
_MAX_GRID_CELLS = 4_000_000


def load_recon_points(csv_path: str | Path) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Read recon_dem_logger.py's CSV.

    Returns:
        xy: (N, 2) array of local x,y metres (the same columns
            recon_dem_logger.py writes from /odom — no re-projection here).
            This is recon_dem_logger.py's own /odom-anchored frame, NOT
            necessarily anchored at any particular lat/lon — callers that
            need xy in a frame anchored at a specific lat/lon (e.g.
            corners_ll[0], to match f2c_planner's contract that origin_xy
            and corners_ll[0] share an anchor) must re-project using
            latlon below, not use this xy directly.
        elevation: (N,) array of altitude, metres.
        latlon: (N, 2) array of lat,lon — the real-world position of each
            xy point, for re-anchoring into a different local frame.

    Raises:
        ValueError: if the CSV has fewer than 3 points — RBFInterpolator
            needs at least that many to fit a surface, and 3 points can't
            usefully be flagged as a bad fit for slope, so callers should
            treat this as "recon drive too short, log more points".
    """
    xs, ys, alts, lats, lons = [], [], [], [], []
    with open(csv_path, newline='', encoding='utf-8') as f:
        for row in csv.DictReader(f):
            xs.append(float(row['x']))
            ys.append(float(row['y']))
            alts.append(float(row['alt']))
            lats.append(float(row['lat']))
            lons.append(float(row['lon']))

    if len(xs) < 3:
        raise ValueError(
            f'recon CSV has {len(xs)} points, need >= 3 to fit a DEM surface '
            f'(got: {csv_path})')

    xy = np.column_stack([xs, ys])
    elevation = np.asarray(alts)
    latlon = np.column_stack([lats, lons])
    return xy, elevation, latlon


def build_elevation_grid(
    xy: np.ndarray,
    elevation: np.ndarray,
    resolution_m: float,
    padding_m: float = 2.0,
    smoothing: float | str = 'auto',
) -> tuple[np.ndarray, tuple[float, float], float]:
    """Interpolate scattered recon points onto a regular elevation grid.

    Args:
        xy: (N, 2) local x,y metres of recon points (see load_recon_points).
        elevation: (N,) altitude, metres.
        resolution_m: metres per cell — should match whatever
            terrain_traversability_filters.yaml / the traversable-mask
            consumer expects.
        padding_m: extend the grid this far past the recon points' bounding
            box in each direction. RBFInterpolator will happily extrapolate
            right to the field edge, but extrapolation quality degrades fast
            past the convex hull of the input points — pad a little, don't
            rely on it for the whole field boundary.
        smoothing: RBFInterpolator's `smoothing` parameter, or 'auto' (the
            default) to pick it via _choose_smoothing()'s cross-validation.
            Pass an explicit float to skip CV (e.g. for reproducible tests,
            or once you have a field-validated value you trust more).

    Returns:
        elevation_grid: 2D array, elevation_grid[0, 0] is the grid's
            southwest-most cell (row = y, col = x, matching terrain_mask.py's
            (row, col) -> (x, y) convention).
        origin_xy: (x, y) of elevation_grid[0, 0], in the same local-XY frame
            as `xy` — pass this straight through to
            traversability_mask_to_latlon_rings()'s origin_xy argument.
        smoothing_used: the smoothing value actually applied — inspect this
            when smoothing='auto' to see what CV picked; log it, don't
            discard it, if this ever misbehaves in the field.
    """
    if xy.shape[0] < 3:
        raise ValueError(f'need >= 3 points to interpolate, got {xy.shape[0]}')

    if not (np.isfinite(resolution_m) and resolution_m > 0):
        raise ValueError(
            f'resolution_m must be finite and positive, got {resolution_m}')

    if smoothing == 'auto':
        smoothing = _choose_smoothing(xy, elevation)

    x_min, y_min = xy.min(axis=0) - padding_m
    x_max, y_max = xy.max(axis=0) + padding_m

    n_cols = max(2, int(np.ceil((x_max - x_min) / resolution_m)))
    n_rows = max(2, int(np.ceil((y_max - y_min) / resolution_m)))

    if n_rows * n_cols > _MAX_GRID_CELLS:
        raise ValueError(
            f'requested grid size {n_rows} x {n_cols} = {n_rows * n_cols} cells '
            f'exceeds _MAX_GRID_CELLS={_MAX_GRID_CELLS} '
            f'(field extent: {x_max - x_min:.1f}m x {y_max - y_min:.1f}m, '
            f'resolution_m={resolution_m})')

    grid_x, grid_y = np.meshgrid(
        x_min + resolution_m * np.arange(n_cols),
        y_min + resolution_m * np.arange(n_rows),
    )

    elevation_grid = _interpolate_elevation(xy, elevation, grid_x, grid_y, smoothing)
    origin_xy = (x_min, y_min)
    return elevation_grid, origin_xy, smoothing


def _choose_smoothing(
    xy: np.ndarray,
    elevation: np.ndarray,
    candidates: tuple[float, ...] = _SMOOTHING_CANDIDATES,
    n_folds: int = 5,
    seed: int = 0,
) -> float:
    """Pick an RBFInterpolator `smoothing` value by k-fold cross-validation.

    Approach adapted from verde.SplineCV (see module docstring for
    attribution): hold out folds of the recon points, fit each candidate
    smoothing on the rest, score against the held-out points, keep whichever
    candidate has the lowest held-out RMSE. This replaces the hardcoded
    smoothing=0.1 this module used before — that value was never validated
    against anything.

    Falls back to a fixed mid-range candidate, skipping CV entirely, when
    there aren't enough points to fold meaningfully (< _MIN_POINTS_FOR_CV)
    or there are too many for the O(N^3) refit cost to be worth it
    (> _MAX_POINTS_FOR_CV) — see those constants' comments.
    """
    n = xy.shape[0]
    if n < _MIN_POINTS_FOR_CV or n > _MAX_POINTS_FOR_CV:
        return candidates[len(candidates) // 2]

    rng = np.random.default_rng(seed)
    fold_ids = rng.permutation(n) % n_folds

    best_smoothing = candidates[0]
    best_rmse = np.inf
    for candidate in candidates:
        squared_errors = []
        for fold in range(n_folds):
            test_mask = fold_ids == fold
            train_mask = ~test_mask
            if test_mask.sum() == 0 or train_mask.sum() < 3:
                continue
            neighbors = min(_INTERP_NEIGHBORS, int(train_mask.sum()))
            interpolator = RBFInterpolator(
                xy[train_mask], elevation[train_mask],
                kernel='thin_plate_spline', smoothing=candidate,
                neighbors=neighbors)
            predicted = interpolator(xy[test_mask])
            squared_errors.append((predicted - elevation[test_mask]) ** 2)

        if not squared_errors:
            continue
        rmse = float(np.sqrt(np.mean(np.concatenate(squared_errors))))
        if rmse < best_rmse:
            best_rmse = rmse
            best_smoothing = candidate

    return best_smoothing


def _interpolate_elevation(
    xy: np.ndarray,
    elevation: np.ndarray,
    grid_x: np.ndarray,
    grid_y: np.ndarray,
    smoothing: float,
) -> np.ndarray:
    """Single seam for the interpolation backend — swap for verde.Spline
    here if RBF turns out too crude on real field data. Both take
    (N, 2) point coords + (N,) values in, and return values on arbitrary
    query points out, so the swap shouldn't touch build_elevation_grid().

    thin_plate_spline is the RBF kernel closest to Verde's default
    biharmonic spline (same r^2*log(r) Green's function, see module
    docstring) — measured comparable accuracy between the two at matched
    regularization, so this isn't the seam that needs fixing right now;
    _choose_smoothing() picking the regularization was.

    Bounds neighbors to avoid O(n^3) memory/CPU blowup on large point sets:
    RBFInterpolator with neighbors=None (the default) uses all input points
    for every query, which is fine for sparse recon data (~hundreds of
    points) but degenerates quickly past that. 150 neighbors is enough to
    capture local terrain variation at typical recon densities without the
    full-matrix cost.
    """
    # Limit neighbors to avoid O(n^3) cost when xy is large. RTK recon points
    # are metres apart, so local interpolation with ~150 nearest neighbors
    # captures the terrain without needing the full point set.
    neighbors = min(_INTERP_NEIGHBORS, xy.shape[0])
    interpolator = RBFInterpolator(
        xy, elevation, kernel='thin_plate_spline', smoothing=smoothing,
        neighbors=neighbors)
    query_points = np.column_stack([grid_x.ravel(), grid_y.ravel()])
    return interpolator(query_points).reshape(grid_x.shape)


def elevation_to_traversable(
    elevation_grid: np.ndarray,
    resolution_m: float,
    max_slope_deg: float = 15.0,
) -> np.ndarray:
    """Slope -> binary traversable mask (1 = safe, 0 = unsafe), matching
    terrain_mask.py's expected convention.

    Same acos(normal_z)*180/pi formula as
    terrain_traversability_filters.yaml's filter3/filter4, but normal_z here
    comes from a finite-difference gradient (np.gradient over adjacent
    cells), not that filter chain's NormalVectorsFilter (least-squares plane
    fit over a 0.2m radius neighbourhood). The two will diverge on anything
    but a locally planar surface — don't assume swapping one for the other
    is a no-op without checking against real elevation data.
    max_slope_deg is still the placeholder from that yaml — untuned against
    real field slope data (issue #110), unchanged here.
    """
    grad_y, grad_x = np.gradient(elevation_grid, resolution_m)
    normal_z = 1.0 / np.sqrt(1.0 + grad_x ** 2 + grad_y ** 2)
    slope_deg = np.degrees(np.arccos(normal_z))
    return (slope_deg <= max_slope_deg).astype(np.float64)


def recon_csv_to_obstacle_rings(
    csv_path: str | Path,
    resolution_m: float,
    anchor_lat: float,
    anchor_lon: float,
    max_slope_deg: float = 15.0,
) -> list[list[tuple[float, float]]]:
    """End to end: recon CSV -> obstacle_rings ready for f2c_planner.run_f2c().

    anchor_lat/anchor_lon MUST be the same anchor run_f2c() will use for
    corners_ll[0]. Recon points are re-anchored onto anchor_lat/lon (via
    their own lat/lon columns) before the elevation grid is built, so
    origin_xy ends up in the same frame corners_ll[0] projects to,
    regardless of whatever frame recon_dem_logger.py originally logged
    xy in — see traversability_mask_to_latlon_rings()'s warning on
    mismatched anchors silently misaligning the rings against the field.
    """
    _xy_native, elevation, latlon = load_recon_points(csv_path)
    xy = np.array([f2c_latlon_to_xy(lat, lon, anchor_lat, anchor_lon)
                   for lat, lon in latlon])
    elevation_grid, origin_xy, _smoothing_used = build_elevation_grid(
        xy, elevation, resolution_m)
    traversable = elevation_to_traversable(elevation_grid, resolution_m, max_slope_deg)
    return traversability_mask_to_latlon_rings(
        traversable, resolution_m, origin_xy, anchor_lat, anchor_lon)


# CONTOUR ROWS: reference-line selection for f2c_planner.run_contour_f2c().
#
# "Sensible reference line" = the elevation isoline through the field's
# centroid, not an arbitrary level. Offsetting a curve at constant distance
# only approximates true elevation contours near that curve — the
# approximation gets worse the further you offset, in proportion to how
# much the terrain bends between the reference and the offset row (see the
# discussion this landed on: strict constant row spacing is being kept,
# so that drift is an accepted trade-off, not a bug to chase out).
#
# Centring the reference line spatially is the one lever available to keep
# that drift small everywhere rather than large on one side: every offset
# row travels at most ~half the field's cross-slope extent before running
# off the boundary, instead of the full width if the reference started at
# an edge. Using the *centroid's own elevation* as the contour level is a
# cheap way to get a centred line without a real optimisation — the
# isoline through a point necessarily passes through that point.
_LOGGER = logging.getLogger(__name__)


def _log(msg: str) -> None:
    """Emit a diagnostic message via the module logger."""
    _LOGGER.info(msg)


def select_reference_contour_xy(
    elevation_grid: np.ndarray,
    resolution_m: float,
    origin_xy: tuple[float, float],
    centroid_xy: tuple[float, float],
    simplify_tolerance_m: float | None = None,
    min_length_m: float = 1.0,
) -> list[tuple[float, float]] | None:
    """Pick and return the elevation isoline through `centroid_xy`.

    Args:
        elevation_grid, resolution_m, origin_xy: as returned by
            build_elevation_grid() — elevation_grid[row, col] sits at
            (origin_xy[0] + col*resolution_m, origin_xy[1] + row*resolution_m),
            matching terrain_mask.py's (row=y, col=x) convention.
        centroid_xy: (x, y) point to centre the reference line on — pass
            the field boundary polygon's centroid, in the same local-xy
            frame as origin_xy.
        simplify_tolerance_m: Douglas-Peucker tolerance applied to the
            traced contour before returning it. RBF-interpolated DEMs from
            sparse recon points are noisy at row-spacing wavelength;
            skipping this lets that noise get amplified into loops when
            f2c_planner offsets the line. Defaults to 1.5 * resolution_m
            when None — untuned against real field data, same caveat as
            elevation_to_traversable()'s max_slope_deg.
        min_length_m: discard contour components shorter than this — noise
            specks, not a usable reference line.

    Returns:
        List of (x, y) points tracing the isoline nearest centroid_xy, or
        None if no usable contour exists at the centroid's elevation (e.g.
        a field flat enough that find_contours returns nothing, or the
        centroid falling outside the interpolated grid). Callers should
        treat None as "this field doesn't need contour rows, fall back to
        run_f2c()'s straight swaths" rather than an error.
    """
    if simplify_tolerance_m is None:
        simplify_tolerance_m = 1.5 * resolution_m

    n_rows, n_cols = elevation_grid.shape
    col_f = (centroid_xy[0] - origin_xy[0]) / resolution_m
    row_f = (centroid_xy[1] - origin_xy[1]) / resolution_m
    if not (0 <= row_f <= n_rows - 1 and 0 <= col_f <= n_cols - 1):
        _log(f'centroid ({centroid_xy[0]:.1f},{centroid_xy[1]:.1f}) falls '
             f'outside the elevation grid — no reference contour')
        return None

    # Bilinear-ish: nearest cell is enough here, this only sets *which*
    # isoline we trace, not a value anything downstream depends on being
    # exact.
    level = float(elevation_grid[round(row_f), round(col_f)])

    contours_rc = measure.find_contours(elevation_grid, level=level)
    if not contours_rc:
        _log(f'no contour found at centroid elevation {level:.2f}m')
        return None

    def _to_xy(contour_rc: np.ndarray) -> list[tuple[float, float]]:
        """Convert contour (row, col) grid indices to real-world xy coordinates."""
        return [(origin_xy[0] + col * resolution_m, origin_xy[1] + row * resolution_m)
                for row, col in contour_rc]

    centroid_pt = Point(centroid_xy)
    best_line = None
    best_dist = float('inf')
    for contour_rc in contours_rc:
        pts_xy = _to_xy(contour_rc)
        if len(pts_xy) < 2:
            continue
        line = LineString(pts_xy)
        if line.length < min_length_m:
            continue
        dist = line.distance(centroid_pt)
        if dist < best_dist:
            best_dist = dist
            best_line = line

    if best_line is None:
        _log(f'{len(contours_rc)} contour piece(s) at level {level:.2f}m, '
             f'all below min_length_m={min_length_m}')
        return None

    simplified = best_line.simplify(simplify_tolerance_m, preserve_topology=False)
    _log(f'reference contour: level={level:.2f}m, {len(best_line.coords)} pts '
         f'-> {len(simplified.coords)} after simplify, '
         f'centroid_dist={best_dist:.2f}m')
    return list(simplified.coords)


def select_reference_contour_latlon(
    elevation_grid: np.ndarray,
    resolution_m: float,
    origin_xy: tuple[float, float],
    centroid_xy: tuple[float, float],
    anchor_lat: float,
    anchor_lon: float,
    simplify_tolerance_m: float | None = None,
    min_length_m: float = 1.0,
) -> list[tuple[float, float]] | None:
    """select_reference_contour_xy(), reprojected to lat/lon.

    anchor_lat/anchor_lon MUST be the same anchor run_contour_f2c() will
    use for corners_ll[0] — same warning as
    traversability_mask_to_latlon_rings(): mismatched anchors silently
    misalign the reference line against the field boundary.
    """
    line_xy = select_reference_contour_xy(
        elevation_grid, resolution_m, origin_xy, centroid_xy,
        simplify_tolerance_m, min_length_m)
    if line_xy is None:
        return None
    return [f2c_xy_to_latlon(x, y, anchor_lat, anchor_lon) for x, y in line_xy]
