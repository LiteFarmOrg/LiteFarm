import React, { useEffect, useState } from 'react';
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
  const [pushedPath, setPushedPath] = useState('/');
  const [goBackNumber, setGoBackNumber] = useState(null);
  const [urlPath, setUrlPath] = useState('');
  const [historyAction, setHistoryAction] = useState('');
  const [activeLifecycle, setActiveLifeCycle] = useState(0);
  const [value, setValue] = useState('');
  const [holdingPointer, setHoldingPointer] = useState([]);

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

  const historyGo = (number) => {
    setPointer(Math.max(0, pointer + +number));
    setHistoryAction(+number > 0 ? 'PUSH' : 'POP');
  };

  const push = () => {
    if (history.length - 1 >= pointer + 1) {
      if (isPageWithinTheForm(history[pointer])) {
        setHoldingPointer(['PUSH', pointer + 1]);
        setActiveLifeCycle(2);
      } else {
        setPointer(pointer + 1);
      }
      setHistoryAction('PUSH');
    }
  };

  const pop = (force) => {
    if (force === true) {
      setPointer(pointer - 1);
      setHistoryAction('POP');
      return;
    }
    if (pointer) {
      if (isPageWithinTheForm(history[pointer])) {
        setHoldingPointer(['POP', pointer - 1]);
        setActiveLifeCycle(2);
      } else {
        setPointer(pointer - 1);
      }
      setHistoryAction('POP');
    }
  };

  const pushPage = (page, holdPointer) => {
    if (pushedPath !== '/') setPushedPath('/');
    if (pointer + 1 !== history.length) {
      const historyCopy = [...history];
      historyCopy.length = pointer + 1;
      historyCopy.push(page);
      setHistory(historyCopy);
      if (holdPointer) {
        setHoldingPointer(['POP', historyCopy.length - 1]);
      } else {
        setPointer(historyCopy.length - 1);
        setHistoryAction('PUSH');
      }
    } else {
      setHistory([...history, page]);
      if (holdPointer) {
        setHoldingPointer(['PUSH', pointer + 1]);
      } else {
        setPointer(pointer + 1);
        setHistoryAction('PUSH');
      }
    }
  };

  const reset = () => {
    setPointer(0);
    setHistory(['/home']);
    setHistoryStack([]);
    setHistoryAction('');
  };

  const historyCancel = () => {
    historyGo(-historyStack.length);
  };

  useEffect(() => {
    if (isPageWithinTheForm(history[pointer])) {
      if (!activeLifecycle) {
        setActiveLifeCycle(1);
      }
    } else if (historyAction === 'PUSH' && persistedPaths.includes(history[pointer - 1])) {
      setActiveLifeCycle(2);
    } else if (historyStack.length) {
      setActiveLifeCycle(2);
    }
  }, [pointer]);

  useEffect(() => {
    if (holdingPointer[0]) {
      setActiveLifeCycle(2);
    }
  }, [holdingPointer[0]]);

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
        ['type 1', '/add-expense'],
        ['type 2', '/add-expense'],
        ['⚙️ manage', '/manage-types'],
      ],
      5: [['save', '/finance']],
      6: [['tile', '/readOnly-type']],
      7: [['edit', '/edit-type']],
      8: [['save', '/manage-types']],
    };

    const onClicks = {
      4: (text) => text !== 'manage' && setFormData({ ...formData, type: text }),
    };

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          width: '100%',
        }}
      >
        {navigations[index].map(([text, path], i) => {
          return (
            <button
              key={i}
              disabled={history[pointer] !== pagePaths[index]}
              onClick={() => {
                onClicks[index] && onClicks[index](text);
                pushPage(path, persistedPaths.includes(pagePaths[index]));
              }}
            >
              {text}
            </button>
          );
        })}
      </div>
    );
  };

  const movePointer = () => {
    if (!holdingPointer.length) return;
    const [action, newPointer] = holdingPointer;
    setPointer(newPointer);
    setHistoryAction(action);
    setHoldingPointer([]);
  };

  const cleanStore = () => {
    setFormData({});
    setPersistedPaths([]);
    setHistoryStack([]);
  };

  const lifecycleActions = {
    1: () => {
      if (activeLifecycle !== 1) return;
      addTheFristPathToHistoryStack(history[pointer]);
      setActiveLifeCycle(0);
      movePointer();
    },
    2: () => {
      if (activeLifecycle !== 2) return;
      if (isPageWithinTheForm(history[pointer + (historyAction === 'PUSH' ? 1 : -1)])) {
        setActiveLifeCycle(13);
      } else {
        if (historyAction === 'PUSH') {
          setActiveLifeCycle(5);
        } else if (historyAction === 'POP') {
          setActiveLifeCycle(9);
        }
      }
    },
    3: () => {
      if (activeLifecycle !== 3) return;
      pushHistoryStack(history[pointer + 1]);
      setActiveLifeCycle(0);
      movePointer();
    },
    4: () => {
      if (activeLifecycle !== 4) return;
      popHistoryStack();
      setActiveLifeCycle(0);
      movePointer();
    },
    5: () => activeLifecycle === 5 && setActiveLifeCycle(6),
    6: () => {
      if (activeLifecycle !== 6) return;
      historyGo(-historyStack.length - 1 + (holdingPointer.length ? 1 : 0));
      cleanStore();
      setActiveLifeCycle(7);
    },
    7: () => activeLifecycle === 7 && setActiveLifeCycle(8),
    8: () => {
      if (activeLifecycle !== 8) return;
      pushPage(history[history.length - 1]);
      setActiveLifeCycle(0);
      setHoldingPointer([]);
      setPointer(pointer + 1);
      cleanStore();
    },
    9: () => activeLifecycle === 9 && setActiveLifeCycle(10),
    10: () => {
      if (activeLifecycle !== 10) return;
      cleanStore();
      setPointer(pointer - (holdingPointer.length ? 2 : 1));
      setActiveLifeCycle(11);
    },
    11: () => activeLifecycle === 11 && setActiveLifeCycle(12),
    12: () => {
      if (activeLifecycle !== 12) return;
      pushPage(history[pointer + 1]);
      setActiveLifeCycle(0);
      movePointer();
      cleanStore();
    },
    13: () => {
      const newFormData = { ...formData };
      if (history[pointer] === '/add-expense') {
        newFormData.value = value;
      }
      setFormData(newFormData);
      if (historyAction === 'PUSH') {
        setActiveLifeCycle(3);
      } else if (historyAction === 'POP') {
        setActiveLifeCycle(4);
      }
    },
  };

  return (
    <div style={{ fontSize: 16 }}>
      <div style={{ display: 'flex' }}>
        <button onClick={reset} style={{ margin: 50, marginTop: 20 }}>
          reset
        </button>
        <div>
          <div>
            history.push({' '}
            <input
              value={pushedPath || ''}
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
              value={goBackNumber || ''}
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
              value={persistedPathsText || ''}
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
            setHistoryAction={setHistoryAction}
            historyCancel={historyCancel}
            value={value}
            setValue={setValue}
          />
          <div style={{ display: 'flex', width: '100%', marginRight: 30 }}>
            <Stack paths={history} pointer={pointer} name="history" style={{ marginRight: 50 }} />
            <Stack
              paths={historyStack}
              pointer={pointer - history.indexOf(historyStack?.[0])}
              name="historyStack"
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Store persistedPaths={persistedPaths} historyStack={historyStack} formData={formData} />
          {persistedPaths.length ? (
            <Flow activeLifecycle={activeLifecycle} lifecycleActions={lifecycleActions} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
