import { LucideProps } from "lucide-react";

interface CustomIconProps extends LucideProps {
  fill?: string;
}

export const CustomBaselineIcon = ({ fill = "currentColor", ...props }: CustomIconProps) => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m6 16 6-12 6 12"/>
    <path d="M8 12h8"/>
    <path d="M4 20h16" stroke={fill} strokeWidth="4"/>
  </svg>
);

export const CustomHighlighterIcon = ({ fill = "currentColor", ...props }: CustomIconProps) => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m8.2 7.2-4.8 4.8v2.4h7.2l2.4-2.4"/>
    <path d="m18.6 8-3.68 3.68a1.6 1.6 0 0 1-2.24 0l-4.16-4.16a1.6 1.6 0 0 1 0-2.24L12.2 1.6"/>
    <path d="M4 20h16" stroke={fill} strokeWidth="4"/>
  </svg>
);

