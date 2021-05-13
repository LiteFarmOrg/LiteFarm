import Card from '../../components/Card';

export default function DocCard({ children }) {
  return (
    <Card
      color={'secondary'}
      style={{
        display: 'flex',
        rowGap: '16px',
        padding: '16px',
        flexDirection: 'column',
        marginBottom: '40px',
      }}
    >
      {children}
    </Card>
  );
}
