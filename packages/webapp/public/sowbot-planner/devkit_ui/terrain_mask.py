"""
terrain_mask.py
────────────────
Bridges the grid_map traversability layer (see
devkit_bringup/config/terrain_traversability_filters.yaml) to
the devkit_f2c_planner package's run_f2c() vector input.

run_f2c() takes polygons (corners_ll, obstacle_rings — lists of lat/lon
points), not a raster. grid_map's `traversable` layer is a raster mask
(0/1 per cell). This module is the missing step: threshold -> trace the
boundary of the unsafe (0) region -> reproject each ring's vertices back to
lat/lon using the *same* equirectangular anchor devkit_f2c_planner already
uses, so the traced obstacle rings line up with whatever field boundary
run_f2c() is given.

Pure functions, no ROS/grid_map_msgs dependency here — callers decode the
GridMap message and pass in a plain numpy array + its resolution/origin, so
this stays unit-testable without a running node.
"""

import numpy as np
from skimage import measure

# pylint: disable=import-error
from devkit_f2c_planner.f2c_planner import f2c_xy_to_latlon


def traversability_mask_to_latlon_rings(
    mask: np.ndarray,
    resolution_m: float,
    origin_xy: tuple[float, float],
    anchor_lat: float,
    anchor_lon: float,
    threshold: float = 0.5,
    min_ring_area_m2: float = 1.0,
) -> list[list[tuple[float, float]]]:
    """Trace the unsafe (mask < threshold) region into lat/lon rings.

    Args:
        mask: 2D traversability layer, 1 = safe, 0 = unsafe (grid_map's
            `traversable` layer, or any array on that convention).
        resolution_m: metres per cell (grid_map's map resolution).
        origin_xy: (x, y) of mask[0, 0] in the same local-XY frame that
            anchor_lat/anchor_lon projects to via f2c_planner's
            equirectangular approximation.
        anchor_lat, anchor_lon: the SAME anchor run_f2c() will use for
            corners_ll[0] — mismatched anchors silently misalign the
            obstacle rings against the field boundary.
        threshold: contour level; cells below this are "unsafe".
        min_ring_area_m2: drop rings smaller than this (noise / single
            missed-coverage cells, not real unsafe regions).

    Returns:
        List of rings, each a list of (lat, lon) — directly usable as
        f2c_planner.run_f2c()'s obstacle_rings argument.
    """
    if mask.ndim != 2:
        raise ValueError(f'expected a 2D mask, got shape {mask.shape}')

    # Pad the mask with a safe (1.0) border to ensure contours are closed
    # even when unsafe regions touch the mask edge. Without padding,
    # find_contours may produce open contours at boundaries.
    padded_mask = np.pad(mask, pad_width=1, mode='constant', constant_values=1.0)

    # find_contours traces the boundary of the region *below* level by
    # default for a 0/1 mask thresholded at 0.5 — unsafe (0) cells are what
    # we want rings around, so this is the region we're tracing.
    contours_rc = measure.find_contours(padded_mask, level=threshold)

    rings_ll: list[list[tuple[float, float]]] = []
    for contour in contours_rc:
        # contour is an array of (row, col) float indices in the padded mask.
        # Adjust by -1 to account for the padding offset.
        area_m2 = _shoelace_area(contour) * (resolution_m ** 2)
        if area_m2 < min_ring_area_m2:
            continue

        ring_ll = []
        for row, col in contour:
            # Subtract 1 from row/col to convert from padded to original coordinates
            x = origin_xy[0] + (col - 1) * resolution_m
            y = origin_xy[1] + (row - 1) * resolution_m
            lat, lon = f2c_xy_to_latlon(x, y, anchor_lat, anchor_lon)
            ring_ll.append((lat, lon))
        rings_ll.append(ring_ll)

    return rings_ll


def _shoelace_area(contour_rc: np.ndarray) -> float:
    """Polygon area (in cell units²) via the shoelace formula."""
    rows = contour_rc[:, 0]
    cols = contour_rc[:, 1]
    return 0.5 * abs(
        np.dot(cols, np.roll(rows, 1)) - np.dot(rows, np.roll(cols, 1))
    )
