import type { ImgHTMLAttributes } from "react";

type Props = ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean };

export default function Image({ priority, alt = "", ...rest }: Props) {
  return <img alt={alt} loading={priority ? "eager" : "lazy"} {...rest} />;
}
