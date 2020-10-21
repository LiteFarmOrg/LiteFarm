import React, {Component} from "react";
import PageTitle from "../../../../components/PageTitle";
import connect from "react-redux/es/connect/connect";
import defaultStyles from '../../styles.scss';
import styles from './styles.scss';
import {expenseTypeSelector} from "../../selectors";
import {Container, Row, Col} from 'react-bootstrap';
import EquipImg from '../../../../assets/images/log/equipment.svg';
import FertImg from '../../../../assets/images/log/fertilizing.svg';
import PestImg from '../../../../assets/images/log/bug.svg';
import FueldImg from '../../../../assets/images/log/fuel.svg';
import MachineImg from '../../../../assets/images/log/machinery.svg';
import SeedImg from '../../../../assets/images/log/seeding.svg';
import OtherImg from '../../../../assets/images/log/other.svg';
import LandImg from '../../../../assets/images/log/land.svg';
import {setSelectedExpense} from '../../actions'
import history from "../../../../history";


class ExpenseCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedStyle: {
        width: '80px',
        height: '80px',
        borderRadius: '50px',
        background: '#00756A',
        margin: '0 auto',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
      },
      unSelectedStyle: {
        width: '80px',
        height: '80px',
        borderRadius: '50px',
        margin: '0 auto',
        background: '#82CF9C',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08)',
      },
      selectedTypes: []
    };

    this.addRemoveType = this.addRemoveType.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  nextPage(){
    this.props.dispatch(setSelectedExpense(this.state.selectedTypes));
    history.push('/add_expense')
  }


  addRemoveType(id){
    let {selectedTypes} = this.state;
    if(selectedTypes.includes(id)){
      const index = selectedTypes.indexOf(id);
      selectedTypes.splice(index, 1);
    }else{
      selectedTypes.push(id);
    }
    this.setState({
      selectedTypes
    })
  }

  render() {
    const {expenseTypes} = this.props;
    const {selectedStyle, unSelectedStyle, selectedTypes} = this.state;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/Finances' title='New Expense (1 of 2)'/>
        <Container fluid={true} style={{marginLeft: 0, marginRight: 0, padding: '0 3%', marginTop: '5%', width: '100%'}}>
          <Row className="show-grid">
            {
              expenseTypes.length > 0 &&
              expenseTypes.map((type) => {
                return <Col xs={4} md={4} key={type.expense_type_id} style={{marginBottom: '12px'}}>
                    <div>
                      <div style={selectedTypes.includes(type.expense_type_id) ? selectedStyle : unSelectedStyle} onClick={()=>this.addRemoveType(type.expense_type_id)}>
                        {type.expense_name === 'Equipment' &&
                          <img src={EquipImg} alt="" className={styles.circleImg} id="t-1"/>
                        }
                        {type.expense_name === 'Fertilizer' &&
                        <img src={FertImg} alt="" className={styles.circleImg} id="t-2"/>
                        }
                        {type.expense_name === 'Machinery' &&
                        <img src={MachineImg} alt="" className={styles.circleImg} id="t-3"/>
                        }
                        {type.expense_name === 'Pesticide' &&
                        <img src={PestImg} alt="" className={styles.circleImg} id="t-4"/>
                        }
                        {type.expense_name === 'Fuel' &&
                        <img src={FueldImg} alt="" className={styles.circleImg} id="t-5"/>
                        }
                        {type.expense_name === 'Land' &&
                        <img src={LandImg} alt="" className={styles.circleImg} id="t-6"/>
                        }
                        {type.expense_name === 'Seeds' &&
                        <img src={SeedImg} alt="" className={styles.circleImg} id="t-7"/>
                        }
                        {type.expense_name === 'Other' &&
                        <img src={OtherImg} alt="" className={styles.circleImg} id="t-8"/>
                        }
                      </div>
                      <div className={styles.typeName}>{type.expense_name}</div>
                    </div>
                </Col>
              })
            }
          </Row>
        </Container>
        <div className={styles.bottomContainer}>
          <button className='btn btn-primary' onClick={()=>this.nextPage()}>Next</button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    expenseTypes: expenseTypeSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpenseCategories);
