import { Title, Underlined } from '../../components/Typography';

export default function RenderSurvey() {
  const data = window.data;
  return (
    <div
      style={{
        backgroundColor: 'white',
        transform: 'translateY(-76px)',
        width: '100%',
        zIndex: 9999,
      }}
    >
      {Object.keys(data).map((label) => (
        <>
          <Title>{label}</Title>
          <Underlined>{data[label]}</Underlined>
        </>
      ))}
    </div>
  );
}
