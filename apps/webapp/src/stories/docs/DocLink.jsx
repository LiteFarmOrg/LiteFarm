export default function DocLink({ children, href }) {
  return (
    <a target={'_blank'} href={href}>
      {children}
    </a>
  );
}
