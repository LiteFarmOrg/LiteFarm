// Runs the Sowbot row planner (Pyodide) off the main thread. Classic worker, served as a static file.
// Protocol: main -> worker { id, req, csv }; worker -> main { id, status } while loading, then
// { id, ok: true, result } or { id, ok: false, error }. Status values are keys the UI translates.
// Python sources are Agroecology-Lab/Sowbot (MIT, see LICENSE-Sowbot.txt) and are fetched next to this file.

const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const BASE = new URL('.', self.location.href).href;

let pyPromise = null;
let contourPromise = null;

const fetchText = async (path) => {
  const response = await fetch(BASE + path);
  if (!response.ok) throw new Error(`${path} not found (HTTP ${response.status})`);
  return response.text();
};

const loadPython = (say) => {
  if (!pyPromise) {
    pyPromise = (async () => {
      say('LOADING_PYTHON');
      importScripts(PYODIDE_URL + 'pyodide.js');
      const py = await loadPyodide({ indexURL: PYODIDE_URL });
      await py.loadPackage(['numpy', 'shapely']);
      py.FS.mkdirTree('/lib/devkit_f2c_planner');
      py.FS.writeFile('/lib/devkit_f2c_planner/__init__.py', '');
      py.FS.writeFile('/lib/devkit_f2c_planner/f2c_planner.py', await fetchText('f2c_planner.py'));
      py.FS.writeFile('/lib/snake_connect.py', await fetchText('snake_connect.py'));
      py.FS.writeFile('/lib/plan_entry.py', await fetchText('plan_entry.py'));
      py.runPython("import sys; sys.path.insert(0, '/lib')");
      return py;
    })().catch((error) => {
      pyPromise = null;
      throw error;
    });
  }
  return pyPromise;
};

// scipy and scikit-image are large, so they load only for the first contour plan.
const loadContour = (py, say) => {
  if (!contourPromise) {
    contourPromise = (async () => {
      say('LOADING_CONTOUR');
      await py.loadPackage(['scipy', 'scikit-image']);
      py.FS.mkdirTree('/lib/devkit_ui');
      py.FS.writeFile('/lib/devkit_ui/__init__.py', '');
      py.FS.writeFile('/lib/devkit_ui/dem.py', await fetchText('devkit_ui/dem.py'));
      py.FS.writeFile(
        '/lib/devkit_ui/terrain_mask.py',
        await fetchText('devkit_ui/terrain_mask.py'),
      );
      py.FS.writeFile('/lib/contour_web.py', await fetchText('contour_web.py'));
    })().catch((error) => {
      contourPromise = null;
      throw error;
    });
  }
  return contourPromise;
};

self.onmessage = async ({ data: { id, req, csv } }) => {
  const say = (status) => self.postMessage({ id, status });
  try {
    const py = await loadPython(say);
    if (req.c) await loadContour(py, say);
    say('PLANNING');
    py.globals.set('req_json', JSON.stringify(req));
    py.globals.set('recon_csv', csv || '');
    const text = py.runPython('import plan_entry\nplan_entry.plan(req_json, recon_csv)');
    self.postMessage({ id, ok: true, result: JSON.parse(text) });
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  }
};
