export const componentDecoratorsFullHeight = [
  (story) => {
    return <div style={{ height: "100vh" }}>{story()}</div>
  },
]
