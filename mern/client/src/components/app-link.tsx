import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps } from "react-router-dom";

type Props = Omit<LinkProps, "to"> & { href: string };

// Keeps the href-style call sites used across the UI while routing through react-router
const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, ...rest }, ref) {
  return <RouterLink ref={ref} to={href} {...rest} />;
});

export default Link;
