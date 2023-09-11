import React, { useEffect, useMemo, useState } from 'react';
import { pagePaths } from './constants';
import Pages from './Pages';
import Store from './Store';
import Flow from './Flow';
import Stack from './Stack';
import Browser from './Browser';

export default function Demo() {
  const [history, setHistory] = useState(['/home']);
  const [historyStack, setHistoryStack] = useState([]);
  const [pointer, setPointer] = useState(0);
  const [persistedPathsText, setPersistedPathsText] = useState(
    '/types, /add-expense,  /manage-types,  /readOnly-type,  /edit-type',
  );
  const [persistedPaths, setPersistedPaths] = useState([
    '/types',
    '/add-expense',
    '/manage-types',
    '/readOnly-type',
    '/edit-type',
  ]);
  const [formData, setFormData] = useState({});
  const [currentForm, setCurrentForm] = useState({});
  const [inTheForm, setInTheForm] = useState(false);
  const [pushedPath, setPushedPath] = useState('/');
  const [goBackNumber, setGoBackNumber] = useState(null);
  const [urlPath, setUrlPath] = useState('');

  const addTheFristPathToHistoryStack = (path) => {
    if (!historyStack.length) {
      setHistoryStack([path]);
    }
  };

  const isPageWithinTheForm = (path) => {
    return persistedPaths.includes(path);
  };

  const pushHistoryStack = (path) => {
    setHistoryStack([...historyStack, path]);
  };

  const popHistoryStack = () => {
    const historyStackCopy = [...historyStack];
    historyStackCopy.pop();
    setHistoryStack([...historyStackCopy]);
  };

  const resetForm = () => {
    setFormData({});
  };

  const updateFormData = () => {
    setFormData({ ...formData, ...currentForm });
  };

  const historyGo = (number) => {
    setPointer(Math.max(0, pointer + +number));
  };

  const clearHistoryStack = () => {
    setHistoryStack([]);
    historyGo(-historyStack.length - 1);
  };

  const push = () => {
    if (history.length - 1 >= pointer + 1) {
      setPointer(pointer + 1);
    }
  };

  const pop = () => {
    if (pointer) {
      setPointer(pointer - 1);
    }
  };

  const pushPage = (page) => {
    if (pushedPath !== '/') setPushedPath('/');
    if (pointer + 1 !== history.length) {
      const historyCopy = [...history];
      historyCopy.length = pointer + 1;
      historyCopy.push(page);
      setHistory(historyCopy);
      setPointer(historyCopy.length - 1);
    } else {
      setHistory([...history, page]);
      setPointer(pointer + 1);
    }
  };

  const reset = () => {
    setPointer(0);
    setHistory(['/home']);
    setHistoryStack([]);
  };

  useEffect(() => {
    if (isPageWithinTheForm(history[pointer])) {
      const todo = 'TODO: if pointer is not at the last page';
      if (!todo) {
        const historyStackCopy = [...historyStack];
        historyStackCopy.length = pointer - (history.length - historyStack.length) + 1;
        historyStackCopy.push(history[pointer]);
        setHistoryStack(historyStackCopy);
      } else {
        pushHistoryStack(history[history.length - 1]);
      }
    } else if (historyStack.length) {
      clearHistoryStack();
      resetForm();
    }
  }, [pointer]);

  const goBackButton = (index) => {
    if (index < 4) return <div></div>;
    return (
      <div onClick={pop} style={{ width: '100%', height: 21, cursor: 'pointer' }}>
        {history[pointer] === pagePaths[index] ? '⬅️' : ''}
      </div>
    );
  };

  const formButtons = (index) => {
    if (!index || index < 3) return <div></div>;

    const navigations = {
      3: [['add expense', '/types']],
      4: [
        ['tile', '/add-expense'],
        ['manage', '/manage-types'],
      ],
      5: [['save', '/finance']],
      6: [['tile', '/readOnly-type']],
      7: [['edit', '/edit-type']],
      8: [['save', '/manage-types']],
    };

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
        }}
      >
        {navigations[index].map(([text, path]) => {
          return (
            <button
              key={path}
              disabled={history[pointer] !== pagePaths[index]}
              onClick={() => pushPage(path)}
            >
              {text}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex' }}>
        <button onClick={reset} style={{ margin: 50, marginTop: 20 }}>
          reset
        </button>
        <div>
          <div>
            history.push({' '}
            <input
              value={pushedPath}
              onChange={(e) => setPushedPath(e.target.value)}
              style={{ paddingLeft: 10, border: 'solid 1px lightgrey' }}
            />{' '}
            )
            <button style={{ marginLeft: 10 }} onClick={() => pushPage(pushedPath)}>
              PUSH!
            </button>
          </div>
          <div>
            history.back
            <button style={{ marginLeft: 10 }} onClick={pop}>
              BACK!
            </button>
          </div>
          <div>
            history.go({' '}
            <input
              value={goBackNumber}
              onChange={(e) => setGoBackNumber(e.target.value)}
              style={{ paddingLeft: 10, border: 'solid 1px lightgrey' }}
            />{' '}
            )
            <button style={{ marginLeft: 10 }} onClick={() => historyGo(goBackNumber)}>
              GO!
            </button>
          </div>
          <div>
            persistedPaths({' '}
            <input
              value={persistedPathsText}
              onChange={(e) => setPersistedPathsText(e.target.value)}
              style={{ paddingLeft: 10, border: 'solid 1px lightgrey', width: 420 }}
            />{' '}
            )
            <button
              style={{ marginLeft: 10 }}
              onClick={() =>
                setPersistedPaths([
                  ...persistedPaths,
                  ...persistedPathsText.split(',').map((path) => path.trim()),
                ])
              }
            >
              ADD!
            </button>
            <button style={{ marginLeft: 10 }} onClick={() => setPersistedPaths([])}>
              CLEAR!
            </button>
          </div>
        </div>
      </div>
      <Pages
        currentPath={history[pointer]}
        goBackButton={goBackButton}
        formButtons={formButtons}
        pointer={pointer}
      />
      <div style={{ display: 'flex' }}>
        <div style={{}}>
          <Browser
            currentPath={history[pointer]}
            pop={pop}
            push={push}
            history={history}
            pointer={pointer}
            setHistory={setHistory}
            setPointer={setPointer}
            goBackButton={goBackButton}
            formButtons={formButtons}
            urlPath={urlPath}
            setUrlPath={setUrlPath}
            pushPage={pushPage}
          />
          <div style={{ display: 'flex', width: '100%', marginRight: 30 }}>
            <Stack paths={history} pointer={pointer} name="history" style={{ marginRight: 50 }} />
            <Stack
              paths={historyStack}
              pointer={pointer - (history.length - historyStack.length)}
              name="historyStack"
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Store persistedPaths={persistedPaths} historyStack={historyStack} formData={formData} />
          <Flow />
        </div>
      </div>
    </div>
  );
}
