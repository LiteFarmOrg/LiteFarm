import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const NavbarBreadcrumbs = ({ breadcrumbs }) => {
  const crumbs = breadcrumbs?.map((crumb, i) => {
    const { label, section, link } = crumb;
    let lastCrumb = breadcrumbs.length - 1 === i;
    return lastCrumb ? (
      <Typography key={section}>{label}</Typography>
    ) : (
      <Link underline="hover" href={link} key={section}>
        {label}
      </Link>
    );
  });

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      maxItems={3}
      itemsBeforeCollapse={0}
      itemsAfterCollapse={2}
      aria-label="breadcrumb"
    >
      {crumbs}
    </Breadcrumbs>
  );
};

export default NavbarBreadcrumbs;
