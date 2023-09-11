import React from 'react';

export default function Store({ persistedPaths, historyStack, formData }) {
  return (
    <div
      style={{ border: 'solid 1px grey', width: 300, heigth: 300, padding: 10, marginRight: 50 }}
    >
      <div>{`hookFormPersistedReducer: {`}</div>
      <div style={{ marginLeft: 20 }}>
        <div>{`persistedPaths: [`}</div>
        <div>
          {persistedPaths.map((path) => (
            <div key={path} style={{ marginLeft: 20 }}>
              {path},
            </div>
          ))}
        </div>
        <div>{`],`}</div>
        <div>{`formData: {`}</div>
        <div></div>
        <div>{`},`}</div>
        <div>{`historyStack: [`}</div>
        <div>
          {historyStack.map((path) => (
            <div key={path} style={{ marginLeft: 20 }}>
              {path},
            </div>
          ))}
        </div>
        <div> {` ]`}</div>
      </div>
      {'}'}
    </div>
  );
}
