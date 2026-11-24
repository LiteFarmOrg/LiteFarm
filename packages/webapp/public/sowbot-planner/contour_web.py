"""Browser glue for contour rows: recon.csv -> reference contour -> contour swaths.

Mirrors ui_node._plan_contour_rows() without the ROS imports, so it runs in
Pyodide. Returns None when the field is too flat for a reference contour
(the caller falls back to straight rows).
"""
import os
import tempfile

import numpy as np
from devkit_f2c_planner.f2c_planner import f2c_latlon_to_xy, run_contour_f2c, field_centroid_xy
from devkit_ui.dem import build_elevation_grid, load_recon_points, select_reference_contour_latlon


def plan_contour(corners_ll, obstacle_rings, csv_text, tool_width, pad_m, headland_m,
                 snake, resolution_m=1.0):
    """Plan contour rows from recon CSV text for a boundary in latitude/longitude degrees.

    tool_width is row spacing, pad_m expands obstacles, headland_m insets the field,
    and resolution_m is the elevation grid cell size, all in meters. snake reverses
    alternate rows. Return lists of (latitude, longitude) points, an empty list if
    no rows survive, or None if no usable reference contour exists.

    The temporary CSV is removed after loading, including on a load failure.
    CSV I/O, column and numeric errors, interpolation errors, and uncaught planner
    errors propagate; see load_recon_points, build_elevation_grid and run_contour_f2c.
    """
    with tempfile.NamedTemporaryFile('w', suffix='.csv', delete=False, newline='') as f:
        f.write(csv_text)
        path = f.name
    try:
        _, elevation, latlon = load_recon_points(path)
    finally:
        os.unlink(path)
    lat0, lon0 = corners_ll[0]
    # Re-anchor on corners_ll[0] so the grid and the field centroid share one frame.
    xy = np.array([f2c_latlon_to_xy(la, lo, lat0, lon0) for la, lo in latlon])
    grid, origin_xy, _ = build_elevation_grid(xy, elevation, resolution_m)
    ref = select_reference_contour_latlon(
        grid, resolution_m, origin_xy, field_centroid_xy(corners_ll), lat0, lon0)
    if ref is None:
        return None
    return run_contour_f2c(corners_ll, obstacle_rings, ref, tool_width, pad_m, headland_m, snake)
