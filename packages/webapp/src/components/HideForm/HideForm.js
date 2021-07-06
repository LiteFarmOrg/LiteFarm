export function HideForm({ shouldHide, style, children }) {
  return <div style={{ ...style, display: shouldHide ? 'none' : undefined }}>{children}</div>;
}
