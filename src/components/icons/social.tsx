import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function FacebookIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      width="1em"
      height="1em"
      {...props}
    >
      <path d="M14 13.5h2.5l.5-3H14V8.5c0-.9.2-1.5 1.5-1.5H17V4.1C16.7 4 15.7 4 14.6 4 12.2 4 10.5 5.5 10.5 8.1V10.5H8v3h2.5V20h3.5v-6.5z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      width="1em"
      height="1em"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
