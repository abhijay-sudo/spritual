import type { HTMLAttributes, ReactNode } from "react";
export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "h1" | "h2" | "h3";
  roleStyle?: "body" | "reading" | "display" | "title" | "small" | "scripture";
  children: ReactNode;
}
export function Text({
  as: Tag = "p",
  roleStyle = "body",
  lang,
  children,
  className = "",
  ...rest
}: TextProps) {
  const script = lang?.startsWith("ta")
    ? "tamil"
    : lang?.startsWith("bn")
      ? "bengali"
      : lang?.startsWith("hi") ||
          (lang?.startsWith("sa") && !lang.includes("Latn"))
        ? "devanagari"
        : "latin";
  return (
    <Tag
      {...rest}
      lang={lang}
      data-script={script}
      className={`v2-text v2-text--${roleStyle} ${className}`}
    >
      {children}
    </Tag>
  );
}
