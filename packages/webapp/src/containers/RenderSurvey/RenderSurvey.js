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
      {Array.from(Array(100)).map((index) => (
        <>
          <Title>{data?.question}</Title>
          <Underlined>{data?.answer}</Underlined>
        </>
      ))}
    </div>
  );
}
