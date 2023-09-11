import React, { useState } from 'react';
import { pagePaths } from './constants';

export default function Pages({ goBackButton, formButtons, pointer }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button onClick={() => setShow(!show)}>{show ? 'hide pages' : 'show pages'}</button>
      <div style={{ gap: 10, display: show ? 'flex' : 'none', marginBottom: 20 }}>
        {pagePaths.map((page, index) => {
          return (
            <div
              key={page}
              // onClick={() => {
              //   if (pointer + 1 !== history.length) {
              //     const historyCopy = [...history];
              //     historyCopy.length = pointer + 1;
              //     historyCopy.push(page);
              //     setHistory(historyCopy);
              //     setPointer(historyCopy.length - 1);
              //     return;
              //   }
              //   setHistory([...history, page]);
              //   setHistoryStack([...historyStack, page]);
              //   setPointer(pointer + 1);
              // }}
              style={{
                width: 120,
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                border: 'solid 2px grey',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                background: [4, 5].includes(index)
                  ? 'lightblue'
                  : [7, 8].includes(index)
                  ? 'lightpink'
                  : 'transparent',
              }}
            >
              {goBackButton(index)}
              <span style={{ paddingTop: index === 3 ? 21 : 0 }}>{page}</span>
              {formButtons(index)}
            </div>
          );
        })}
      </div>
    </>
  );
}
