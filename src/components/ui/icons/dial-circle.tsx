import type * as React from "react";

const DialCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 94 94"
    {...props}
  >
    <rect
      width="92"
      height="92"
      x="1"
      y="1"
      stroke="#262626"
      strokeDasharray="16 6"
      strokeWidth="2"
      rx="46"
    ></rect>
    <path
      stroke="#262626"
      strokeWidth="3"
      d="M79 47h15M0 47h15M47 15V0M47 94V79"
    ></path>
    <rect width="66" height="66" x="14" y="14" fill="#1A1A1A" rx="33"></rect>
    <path
      fill="#C2B4A3"
      d="M45.938 39.996A7.085 7.085 0 0 0 47 54.083a7.083 7.083 0 0 0 1.063-14.087v5.587a1.063 1.063 0 0 1-2.125 0zM48.417 34.958a1.417 1.417 0 1 1-2.834 0 1.417 1.417 0 0 1 2.834 0M59.042 48.417a1.417 1.417 0 1 1 0-2.834 1.417 1.417 0 0 1 0 2.834M34.958 48.417a1.417 1.417 0 1 1 0-2.834 1.417 1.417 0 0 1 0 2.834M39.487 37.484a1.417 1.417 0 1 1-2.004 2.003 1.417 1.417 0 0 1 2.004-2.004M56.517 54.513a1.416 1.416 0 1 1-2.004 2.004 1.416 1.416 0 0 1 2.004-2.004M56.517 39.487a1.417 1.417 0 1 1-2.004-2.004 1.417 1.417 0 0 1 2.004 2.004M39.487 56.516a1.417 1.417 0 1 1-2.004-2.003 1.417 1.417 0 0 1 2.004 2.003"
    ></path>
  </svg>
);

export default DialCircleIcon;
