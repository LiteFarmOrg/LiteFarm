import React from 'react';
import { Label, Title, Text} from "../Typography";
import { ReactComponent as Back } from '../../assets/images/fieldCrops/back.svg';

function CropHeader({cropName, varietyName, supplierName}) {
  return (
    <div style={{ margin: '-24px -24px 0 -24px', backgroundColor: 'var(--grey200)', width: 'auto', height: '120px', zIndex: -1, overflow: 'hidden'}}>
      <div style={{ marginTop: '15px', paddingLeft: '25px' }}>
        <Back style={{ verticalAlign: 'text-bottom'}} />
        <Title style={{color: 'var(--teal900)', fontWeight: '600', fontSize: '24px', lineHeight: '32px', display:'inline-block', marginBottom: '14px' }}>{cropName}</Title>
      </div>
      <div style={{ marginTop: '-6px', paddingLeft: '25px'}}>
        <Label>Variety: <Text style={{display: 'inline', color: 'var(--teal900)', fontWeight: '600' }}> {varietyName} </Text></Label>
      </div>
      <div style={{ marginTop: '-6px', paddingLeft: '25px'}}>
        <Label>Supplier: <Text style={{display: 'inline', color: 'var(--teal900)', fontWeight: '600' }}> {supplierName} </Text></Label>
      </div>
      <div style={{ position: 'relative', right: '-50px', top: '-140px', float: 'right' }}>
        <img src={'crop-images/carrot.jpg'} style={{borderRadius: '100px'}} />
      </div>
    </div>
  )
}

export default CropHeader;
