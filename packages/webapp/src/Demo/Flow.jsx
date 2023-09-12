import React from 'react';
import './index.scss';

export default function Flow({ activeLifecycle, lifecycleActions }) {
  return (
    <div>
      <b>useHookFormPersist lifecycle!</b>
      <div style={{ marginLeft: 15 }}>
        <div>
          <p className={activeLifecycle === 1 ? 'active' : ''} onClick={lifecycleActions[1]}>
            <b>1. [useEffect]</b> {`Is historyStack empty? → add the path.`}
          </p>
        </div>
      </div>
      <div style={{ marginLeft: 15 }}>
        <div>
          <p className={activeLifecycle === 2 ? 'active' : ''} onClick={lifecycleActions[2]}>
            <b>2. [useLayoutEffect cleanup function]</b> Are you staying in the form?
          </p>
        </div>
        <div style={{ marginLeft: 15 }}>
          <div>Yes</div>
          <div style={{ marginLeft: 15 }}>
            <div>
              <p className={activeLifecycle === 13 ? 'active' : ''} onClick={lifecycleActions[13]}>
                <b>3.</b> save formData
              </p>
            </div>
            <div>
              <p className={activeLifecycle === 3 ? 'active' : ''} onClick={lifecycleActions[3]}>
                <b>4.</b> PUSH → push the new path to historyStack
              </p>
            </div>
            <div>
              <p className={activeLifecycle === 4 ? 'active' : ''} onClick={lifecycleActions[4]}>
                <b>4.</b> POP → pop historyStack
              </p>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 15 }}>
          <div>No</div>
          <div style={{ marginLeft: 15 }}>
            <div>PUSH</div>
            <div style={{ marginLeft: 15 }}>
              <div>
                <p className={activeLifecycle === 5 ? 'active' : ''} onClick={lifecycleActions[5]}>
                  <b>3.</b> start listening history
                </p>
              </div>
              <div>
                <p className={activeLifecycle === 6 ? 'active' : ''} onClick={lifecycleActions[6]}>
                  <b>4.</b>{' '}
                  {`go back to the previous page of the form (history.go(-historyStack.length - 1))`}
                </p>
              </div>
              <div>
                <p className={activeLifecycle === 7 ? 'active' : ''} onClick={lifecycleActions[7]}>
                  <b>5.</b> unlisten
                </p>
              </div>
              <div>
                <p className={activeLifecycle === 8 ? 'active' : ''} onClick={lifecycleActions[8]}>
                  <b>6.</b> push the new path
                </p>
              </div>
            </div>
            <div>POP</div>
            <div style={{ marginLeft: 15 }}>
              <div>
                <p className={activeLifecycle === 9 ? 'active' : ''} onClick={lifecycleActions[9]}>
                  <b>3.</b> start listening history
                </p>
              </div>
              <div>
                <p
                  className={activeLifecycle === 10 ? 'active' : ''}
                  onClick={lifecycleActions[10]}
                >
                  <b>4.</b> go back to the previous page of the current page
                </p>
              </div>
              <div>
                <p
                  className={activeLifecycle === 11 ? 'active' : ''}
                  onClick={lifecycleActions[11]}
                >
                  <b>5.</b> unlisten
                </p>
              </div>
              <div>
                <p
                  className={activeLifecycle === 12 ? 'active' : ''}
                  onClick={lifecycleActions[12]}
                >
                  <b>6.</b> push the new path
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
