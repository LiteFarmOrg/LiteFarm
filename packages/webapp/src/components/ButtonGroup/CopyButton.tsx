import { useState, useRef } from 'react';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import DoneIcon from '@material-ui/icons/Done';
import { copyTextToClipboard } from '../../util';

const useStyles = makeStyles({
  copyButton: {
    color: '#66738A',
  },
  copiedButton: {
    color: '#3ea992',
  },
});

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number>();

  const classes = useStyles();

  const handleClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    copyTextToClipboard(text);
    setCopied(true);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IconButton
      aria-label="copy"
      size="small"
      onClick={handleClick}
      className={copied ? classes.copiedButton : classes.copyButton}
    >
      {copied ? <DoneIcon /> : <FileCopyIcon />}
    </IconButton>
  );
}
