export default function DocLink({ children, href }) {
  return (
    <a target={'_blank'} href={href} rel="noopener noreferrer">
      {children}
    </a>
  );
}
