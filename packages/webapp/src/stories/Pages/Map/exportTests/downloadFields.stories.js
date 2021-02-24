import React, { useEffect, useState } from 'react';
import decorators from '../../config/decorators';
import Field from '../../../../containers/Field';
import html2canvas from 'html2canvas';

export default {
  title: 'Page/Field',
  decorators: decorators,
  component: Html2CanvasWrapper,
};
const Html2CanvasWrapper = (...args) => {
  const [downloaded, setDownloaded] = useState(false);
  useEffect(() => {
    if (!downloaded) {
      setTimeout(() => {
        const node = document.getElementById('export');
        html2canvas(node, { useCORS: true }).then((canvas) => {
          const link = document.createElement('a');
          link.download = 'test.png';
          link.href = canvas.toDataURL();
          link.click();
        });
      }, 5000);
      setDownloaded(true);
    }
  }, []);
  return <Field {...args} />;
};
const Template = (args) => <Html2CanvasWrapper {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
