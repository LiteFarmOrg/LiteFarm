import PureSensorReadingsLineChart from '../../src/components/SensorReadingsLineChart/index.jsx';

describe('<SensorReadingsLineChart>', () => {
  it('mounts', () => {
    cy.mount(<PureSensorReadingsLineChart />);
  });
});
