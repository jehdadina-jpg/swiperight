import { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";
// Keeps the href-style call sites used across the UI while routing through react-router
const Link = forwardRef(function Link({ href, ...rest }, ref) {
    return <RouterLink ref={ref} to={href} {...rest}/>;
});
export default Link;
