import React from 'react';

export default function Store({ persistedPaths, historyStack, formData }) {
  return (
    <div
      style={{
        border: 'solid 1px grey',
        width: 300,
        heigth: 300,
        padding: 10,
        marginRight: 50,
        marginBottom: 50,
      }}
    >
      <div>{`hookFormPersistedReducer: {`}</div>
      <div style={{ marginLeft: 20 }}>
        <div>{`persistedPaths: [`}</div>
        <div>
          {persistedPaths.map((path, index) => (
            <div key={index} style={{ marginLeft: 20 }}>
              {path},
            </div>
          ))}
        </div>
        <div>{`],`}</div>
        <div>{`formData: {`}</div>
        <div style={{ marginLeft: 20 }}>
          {Object.keys(formData).map((key, ind) => {
            return (
              <div key={ind}>
                {key}: {formData[key]}
              </div>
            );
          })}
        </div>
        <div>{`},`}</div>
        <div>{`historyStack: [`}</div>
        <div>
          {historyStack.map((path, index) => (
            <div key={index} style={{ marginLeft: 20 }}>
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
