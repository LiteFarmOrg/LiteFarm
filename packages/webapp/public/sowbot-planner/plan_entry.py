"""Entry point called by planner.worker.js: one plan request in, one JSON result out.

This is the runPython block of Sowbot web/index.html (Agroecology-Lab/Sowbot, caatinga-dev, 8cefa4f)
turned into a function, so the worker can call it with plain arguments. The planning itself is
unchanged: contour_web.plan_contour() or f2c_planner.run_f2c(backend='shapely'), then
snake_connect.connect() for the connected path.
"""
import contextlib
import io
import json


def plan(req_json, recon_csv):
    """Plan rows for one field.

    req_json is a JSON object with field and obs (rings of [lat, lng]), w (row spacing, m),
    a (angle, degrees), h (headland, m), p (obstacle padding, m), s (snake), c (contour rows) and
    dr (survey grid resolution, m). recon_csv is the survey CSV text, used only when c is true.

    Returns JSON text: rows, tags ([row, fragment] per row), path (when s), contour (whether
    contour rows were used) and asked (whether they were requested). When contour rows are
    requested but no usable reference contour exists, straight rows are returned instead.
    """
    from devkit_f2c_planner import f2c_planner as P
    from snake_connect import connect

    r = json.loads(req_json)
    with contextlib.redirect_stderr(io.StringIO()):
        rows = None
        if r['c']:
            import contour_web
            rows = contour_web.plan_contour(
                r['field'], r['obs'], recon_csv, r['w'], r['p'], r['h'], r['s'], r['dr'])
        used = rows is not None
        if rows is None:
            rows = P.run_f2c(
                r['field'], r['obs'], r['w'], r['a'], r['p'], r['h'], r['s'], backend='shapely')
    rows = [[list(q) for q in row] for row in rows]
    tags = ([[i, 0] for i in range(len(rows))] if used
            else [list(t) for t in P.tag_rows(rows, r['field'], r['a'])])
    out = {'rows': rows, 'tags': tags, 'contour': used, 'asked': r['c']}
    if r['s']:
        out['path'] = connect(rows, r['field'], r['obs'], r['p'])
    return json.dumps(out)
