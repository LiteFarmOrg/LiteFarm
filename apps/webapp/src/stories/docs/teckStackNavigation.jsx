import { Title, Underlined } from '../../components/Typography';
import { colors } from '../../assets/theme';

export default function TechStackNavigation() {
  return (
    <>
      <Title>Steps for a backend - frontend story from a data flow perspective</Title>
      <ul>
        <li>
          <Underlined style={{ color: colors.brown700 }}>
            Create knex migration to create/modify tables in database
          </Underlined>
        </li>
        <li>
          <Underlined style={{ color: colors.brown700 }}>Create objection models</Underlined>
        </li>
        <li>
          <Underlined style={{ color: colors.brown700 }}>
            Endpoints and empty controllers
          </Underlined>
        </li>
        <li>
          <Underlined>Backend jest unit testing</Underlined>
        </li>
        <li>
          <Underlined>Implement controllers</Underlined>
        </li>
        <li>
          <Underlined>Create authorization/validation middlewares</Underlined>
        </li>
        <li>
          <Underlined>Run tests and make sure everything passes</Underlined>
        </li>
        <li>
          <Underlined>Create pure frontend components in storybook</Underlined>
        </li>
        <li>
          <Underlined style={{ color: colors.brown700 }}>
            res.data normalizer, redux slice, redux selectors to hold and access the data
          </Underlined>
        </li>
        <li>
          <Underlined style={{ color: colors.brown700 }}>
            Redux saga for get/post/put/patch request
          </Underlined>
        </li>
        <li>
          <Underlined>
            Container component to connect saga actions/selector with pure components
          </Underlined>
        </li>
        <li>
          <Underlined>
            Connect Route component with container components with react router
          </Underlined>
        </li>
        <li>
          <Underlined>Manual testing</Underlined>
        </li>
      </ul>
    </>
  );
}
