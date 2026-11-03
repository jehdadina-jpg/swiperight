export default function Image({ priority, alt = "", ...rest }) {
    return <img alt={alt} loading={priority ? "eager" : "lazy"} {...rest}/>;
}
