import Form from "../Form";
import Button from "../Form/Button";
import Radio from "../Form/Radio";
import OverlayTooltip from "../Tooltip";
import { Title, Underlined, Main } from '../Typography';
import PropTypes from "prop-types";
import React from "react";

export default function PureInterestedOrganic({ title, paragraph, inputs = [{}, {}], onSubmit, onGoBack, underlined, content }) {
  return <Form onSubmit={onSubmit} buttonGroup={
    <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'} fullLength>Continue</Button></>
  }>
    <Title>{title}</Title>
    <Main style={{marginBottom: '24px'}}>{paragraph}</Main>
    <Radio {...inputs[0]} checked={true} />
    <Radio style={{marginBottom: '32px'}} {...inputs[1]} />
    <OverlayTooltip content={content}>
      <Underlined>
        {underlined}
      </Underlined>
    </OverlayTooltip>
  </Form>
}

PureInterestedOrganic.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(PropTypes.exact({ label: PropTypes.string, info: PropTypes.string, icon: PropTypes.node })),
}
