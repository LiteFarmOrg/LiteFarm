import React from 'react';
import { Underlined, Info, Error, Label, Main, Semibold, Text, Title } from "../../components/Typography";

export default {
  title: 'Components/Typography',
  component: Underlined,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <><p style={{textDecorationLine: "underline"}}>
  It is preferred to use style prop to override css styles such as margin. If you pass in style from a stylesheet using css loader, it is not guaranteed to work as stylesheet loading order is unpredictable
</p>
  {AllFontTemplate(args)}
<Underlined style={args.style}/>

</>;

const AllFontTemplate = (args) => <>
  <Title style={args.style}/>
  <Semibold style={args.style}/>
  <Label style={args.style}/>
  <Label sm style={args.style}>Label with sm as prop</Label>
  <Main style={args.style}/>
  <Text style={args.style}/>
  <Info style={args.style}/>
  <Error style={args.style}/>
  <Underlined style={args.style}/>
</>

export const Override = Template.bind({});
Override.args = {
  style:{marginBottom: 0}
};

export const Primary = AllFontTemplate.bind({});
Primary.args = {
};

