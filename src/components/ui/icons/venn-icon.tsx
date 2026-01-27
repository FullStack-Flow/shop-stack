import type * as React from "react";

const VennIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M55.5 41.333a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0"
    ></path>
    <path
      fill="#C2B4A3"
      d="M37.13 45.277a8.5 8.5 0 1 0 12.636 6.318c-.882.237-1.809.363-2.766.363a10.63 10.63 0 0 1-9.87-6.681M51.798 50.816q.159.903.16 1.85c0 2.962-1.212 5.641-3.166 7.568a8.5 8.5 0 0 0 8.078-14.957 10.66 10.66 0 0 1-5.072 5.539"
    ></path>
  </svg>
);

export default VennIcon;
