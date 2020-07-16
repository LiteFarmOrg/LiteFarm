import React from "react";
import Table from '../../../../../../components/Table';
import moment from 'moment';
import {Alert} from 'react-bootstrap';

const Crop = ({shifts, startDate, endDate}) => {
  let data = [];
  let sortObj = {};
  let hasUnallocated = false;

  for(let s of shifts){
    if(moment(s.start_time).isBetween(moment(startDate), moment(endDate))){
      let cid = s.crop_id;
      if(!cid){
        cid = 'unallocated';
        hasUnallocated = true;
      }
      if(sortObj.hasOwnProperty(cid)){
        sortObj[cid].time += parseInt(s.duration, 10);
        sortObj[cid].labour_cost += (parseFloat(s.wage.amount) * (s.duration / 60));
      }
      else{
        let crop_name = s.crop_common_name;
        if(s.is_field && s.field_crop_id === null){
          crop_name = 'Unallocated*'
        }
        sortObj[cid] = {
          time: parseInt(s.duration, 10),
          labour_cost: (parseFloat(s.wage.amount) * (s.duration / 60)),
          crop: crop_name,
        }
      }
    }
  }

  let keys = Object.keys(sortObj);

  for(let k of keys){
    let obj = sortObj[k];
    data.push({
      crop: obj.crop,
      time: (obj.time / 60).toFixed(1).toString() + ' HR',
      labour_cost: '$' + obj.labour_cost.toFixed(2)
    })
  }


  const columns = [{
    id: 'crop',
    Header: 'Crop',
    accessor: d => d.crop,
    minWidth: 80
  }, {
    id: 'time',
    Header: 'Time',
    accessor: d => d.time,
    minWidth: 75
  }, {
    id: 'labour_cost',
    Header: 'Labour Cost',
    accessor: d => d.labour_cost,
  },
  ];

  return (
    <div>
    <Table
      columns={columns}
      data={data}
      showPagination={false}
      minRows={5}
      className="-striped -highlight"
    />
      {
        hasUnallocated &&
        <Alert bsStyle="warning" style={{marginTop: '8px'}}>
          *Unallocated means that a farm user have submitted a shift related to a Field that has no crop at the time of submission.<br/><br/>
          Unlike the unallocated value from the previous page, this value will remain the same regardless if a crop is added later.
        </Alert>
      }

    </div>
  )
};

export default Crop;
