import Form from "../Form";
import Button from "../Form/Button";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import Checkbox from "../Form/Checkbox";
import React from "react";
import { Text, Title } from '../Typography';
export default function PureConsent({ onSubmit, checkboxArgs, onGoBack, text, disabled }) {
  return (
    <Form onSubmit={onSubmit} buttonGroup={
      <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'}
                                                                                          fullLength disabled={disabled}>Continue</Button></>
    }>
      <Title style={{marginBottom: '16px'}}>Our Data Policy</Title>
      <div style={{ width: '90%', overflowY: "scroll" }} className={clsx('paraText')}>
        <ReactMarkdown children={text}>
          <Text>{text}</Text>
        </ReactMarkdown>
      </div>
      <div style={{
        width: '100%',
        height: '38px',
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255,255 , 255, 1) 55.21%)",
        marginTop: "-28px",
        zIndex: '2000',
      }}>
      </div>
      <div>
        <Checkbox {...checkboxArgs}  />
      </div>
    </Form>
  )
}
