import Form from "../Form";
import Button from "../Form/Button";
import Radio from "../Form/Radio";
import React from "react";
import { Title } from '../Typography';

export default function PureRoleSelection({ onSubmit, title, inputs }) {
  return (
    <Form onSubmit={onSubmit} buttonGroup={<Button type={'submit'} fullLength>Continue</Button>}>
      <Title>{title}</Title>
      <Radio {...inputs[0]} />
      <Radio {...inputs[1]} />
      <Radio {...inputs[2]} />
    </Form>
  );
}
