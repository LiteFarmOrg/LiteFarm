import React from 'react';

export default function Stack({ paths, pointer, name, style }) {
  const pathsCopy = [...paths];
  return (
    <div>
      <div
        style={{
          ...style,
          border: 'solid 2px grey',
          borderTop: 'none',
          display: 'flex',
          flexDirection: 'column',
          width: 200,
          height: 330,
          margin: 30,
          marginBottom: 10,
          alignItems: 'center',
          justifyContent: 'flex-end',
          textAlign: 'center',
        }}
      >
        {pathsCopy.reverse().map((path, index) => {
          return (
            <div
              key={index}
              style={{
                borderTop: 'solid 1px grey',
                width: '100%',
                background: pointer === paths.length - index - 1 ? 'lightGreen' : 'transparent',
              }}
            >
              {path}
            </div>
          );
        })}
      </div>
      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 50 }}>{name}</div>
    </div>
  );
}
