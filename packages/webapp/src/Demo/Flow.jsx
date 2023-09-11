import React from 'react';

export default function Flow() {
  return (
    <div>
      <b>useHookFormPersist lifecycle!</b>
      <div style={{ marginLeft: 15 }}>
        <div>
          <b>1. [useEffect]</b> Component mounted! If historyStack is empty, add the path.
        </div>
      </div>
      <div style={{ marginLeft: 15 }}>
        <div>
          <b>2. [useLayoutEffect cleanup function]</b> Before unmounting..., staying in the form?
        </div>
        <div style={{ marginLeft: 15 }}>
          <div>Yes</div>
          <div style={{ marginLeft: 15 }}>
            <div>
              <b>3.</b> PUSH → push the new path to historyStack
            </div>
            <div>
              <b>3.</b> POP → pop historyStack
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 15 }}>
          <div>No</div>
          <div style={{ marginLeft: 15 }}>
            <div>PUSH</div>
            <div style={{ marginLeft: 15 }}>
              <div>
                <b>3.</b> start listening history
              </div>
              <div>
                <b>4.</b> clear historyStack and go back to the previous page of the form
              </div>
              <div>
                <b>5.</b> unlisten
              </div>
              <div>
                <b>6.</b> push the new path
              </div>
            </div>
            <div>PUSH</div>
            <div style={{ marginLeft: 15 }}>
              <div>
                <b>3.</b> start listening history
              </div>
              <div>
                <b>4.</b> go back to the previous page of the form
              </div>
              <div>
                <b>5.</b> unlisten
              </div>
              <div>
                <b>6.</b> push the new path
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
