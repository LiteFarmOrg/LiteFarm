import React from 'react';
import { pagePaths } from './constants';

const BrowserButtons = ({ pop, push, pointer, history }) => (
  <div style={{ marginRight: 20 }}>
    <button
      onClick={pop}
      disabled={!pointer}
      style={{ cursor: 'pointer', width: 30, height: 30, marginRight: 10 }}
    >{`←`}</button>
    <button
      onClick={push}
      disabled={history.length === pointer + 1}
      style={{ cursor: 'pointer', width: 30, height: 30 }}
    >{`→`}</button>
  </div>
);

export const WindowBar = ({
  currentPath,
  pop,
  push,
  pointer,
  history,
  urlPath,
  setUrlPath,
  pushPage,
}) => (
  <div style={{ width: '100%', border: 'solid 1px grey', display: 'flex' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <BrowserButtons pop={pop} push={push} pointer={pointer} history={history} />
    </div>
    <div style={{ background: 'lightgrey', borderRadius: 30, margin: 5, paddingLeft: 15, flex: 1 }}>
      https://app.litefarm.org
      <input
        value={urlPath || currentPath}
        onChange={(e) => setUrlPath(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            pushPage(urlPath);
          }
        }}
        style={{ border: 'none', background: 'transparent', width: 100, fontSize: 14 }}
      />
    </div>
  </div>
);

export const Navs = ({ setHistory, setPointer, pointer, history, setHistoryAction }) => (
  <div style={{ border: 'solid 2px grey', borderBottom: 'solid 1px grey', padding: 15 }}>
    <span>Navs: </span>
    {['/home', '/task', '/map', '/finance'].map((page) => {
      return (
        <span
          key={page}
          style={{ padding: 20, cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => {
            if (pointer + 1 !== history.length) {
              const historyCopy = [...history];
              historyCopy.length = pointer + 1;
              historyCopy.push(page);
              setHistory(historyCopy);
              setPointer(historyCopy.length - 1);
              setHistoryAction('PUSH');
              return;
            }
            setHistory([...history, page]);
            setPointer(pointer + 1);
            setHistoryAction('PUSH');
          }}
        >
          {page}
        </span>
      );
    })}
  </div>
);

export const CurrentPage = ({
  currentPath,
  goBackButton,
  formButtons,
  historyCancel,
  value,
  setValue,
}) => {
  const index = pagePaths.indexOf(currentPath);
  return (
    <div
      style={{
        width: '100%',
        height: 200,
        display: 'flex',
        flexDirection: 'column',
        border: 'solid 2px grey',
        borderTop: 'none',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        position: 'relative',
      }}
    >
      {[4, 5].includes(index) ? (
        <div style={{ position: 'absolute', top: 0, right: 0 }}>
          <button onClick={historyCancel}>Cancel</button>
        </div>
      ) : null}
      {index === 5 && (
        <div
          style={{
            position: 'absolute',
            bottom: 45,
          }}
        >
          <div style={{ height: 20 }}>
            Value: <input value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>
      )}
      {goBackButton(index)}
      <span style={{ paddingTop: index === 3 ? 21 : 0 }}>{currentPath}</span>
      {formButtons(index)}
    </div>
  );
};

export default function Browser({
  currentPath,
  pop,
  push,
  history,
  pointer,
  setHistory,
  setPointer,
  goBackButton,
  formButtons,
  urlPath,
  setUrlPath,
  pushPage,
  setHistoryAction,
  historyCancel,
  value,
  setValue,
}) {
  return (
    <div style={{ width: 450, margin: 20 }}>
      <WindowBar
        currentPath={currentPath}
        pop={pop}
        push={push}
        history={history}
        pointer={pointer}
        urlPath={urlPath}
        setUrlPath={setUrlPath}
        pushPage={pushPage}
      />
      <Navs
        setHistory={setHistory}
        setPointer={setPointer}
        pointer={pointer}
        history={history}
        setHistoryAction={setHistoryAction}
      />
      <CurrentPage
        currentPath={currentPath}
        goBackButton={goBackButton}
        formButtons={formButtons}
        historyCancel={historyCancel}
        value={value}
        setValue={setValue}
      />
    </div>
  );
}
