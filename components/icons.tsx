import type { SVGProps } from "react";

/**
 * Inline stroke icons (24×24, currentColor) recreated to match the Figma
 * vector component instances used throughout the SprintCheck design.
 * Stroke-based, 2px weight, round caps — the convention used in the file.
 */
export type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Sparkles = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6.3 6.3 1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" />
    <circle cx="12" cy="12" r="2.2" />
  </Base>
);

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Base>
);

export const CheckCircle = (p: IconProps) => (
  <Base {...p}>
    <path d="M21.5 11.1V12a9.5 9.5 0 1 1-5.6-8.7" />
    <path d="m8.5 11.5 3 3 8-8" />
  </Base>
);

export const ShieldCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const Lock = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Base>
);

export const Activity = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.33325 11.6662C3.17555 11.6668 3.02094 11.6226 2.88737 11.5387C2.75381 11.4549 2.64677 11.3349 2.5787 11.1926C2.51063 11.0504 2.48432 10.8917 2.50283 10.7351C2.52133 10.5785 2.5839 10.4304 2.68325 10.3079L10.9332 1.8079C10.9951 1.73647 11.0795 1.6882 11.1724 1.67101C11.2653 1.65382 11.3613 1.66874 11.4447 1.71332C11.528 1.7579 11.5937 1.82948 11.631 1.91632C11.6683 2.00317 11.675 2.10011 11.6499 2.19123L10.0499 7.2079C10.0027 7.33417 9.98689 7.47 10.0037 7.60374C10.0206 7.73748 10.0696 7.86513 10.1467 7.97575C10.2237 8.08638 10.3264 8.17666 10.446 8.23887C10.5656 8.30107 10.6984 8.33334 10.8332 8.3329H16.6666C16.8243 8.33236 16.9789 8.37658 17.1124 8.46042C17.246 8.54425 17.3531 8.66427 17.4211 8.80652C17.4892 8.94877 17.5155 9.10741 17.497 9.26402C17.4785 9.42062 17.4159 9.56877 17.3166 9.69123L9.06658 18.1912C9.00469 18.2627 8.92036 18.3109 8.82743 18.3281C8.73449 18.3453 8.63848 18.3304 8.55514 18.2858C8.4718 18.2412 8.40609 18.1697 8.3688 18.0828C8.33151 17.996 8.32485 17.899 8.34991 17.8079L9.94991 12.7912C9.99709 12.665 10.0129 12.5291 9.99609 12.3954C9.97924 12.2617 9.9302 12.134 9.85317 12.0234C9.77614 11.9128 9.67343 11.8225 9.55385 11.7603C9.43426 11.6981 9.30137 11.6658 9.16658 11.6662H3.33325Z" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const WorldIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1072_7529)">
      <path d="M17.95 12.5H14.1667C13.7246 12.5 13.3007 12.6756 12.9882 12.9882C12.6756 13.3007 12.5 13.7246 12.5 14.1667V17.95" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5.8335 2.7832V4.16654C5.8335 4.82958 6.09689 5.46546 6.56573 5.9343C7.03457 6.40314 7.67045 6.66654 8.3335 6.66654C8.77552 6.66654 9.19945 6.84213 9.51201 7.15469C9.82457 7.46725 10.0002 7.89118 10.0002 8.3332C10.0002 9.24987 10.7502 9.99987 11.6668 9.99987C12.1089 9.99987 12.5328 9.82427 12.8453 9.51171C13.1579 9.19915 13.3335 8.77523 13.3335 8.3332C13.3335 7.41654 14.0835 6.66654 15.0002 6.66654H17.6418" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.16683 18.292V15.0003C9.16683 14.5583 8.99123 14.1344 8.67867 13.8218C8.36611 13.5093 7.94219 13.3337 7.50016 13.3337C7.05813 13.3337 6.63421 13.1581 6.32165 12.8455C6.00909 12.5329 5.8335 12.109 5.8335 11.667V10.8337C5.8335 10.3916 5.6579 9.96771 5.34534 9.65515C5.03278 9.34259 4.60886 9.16699 4.16683 9.16699H1.7085" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M9.99984 18.3337C14.6022 18.3337 18.3332 14.6027 18.3332 10.0003C18.3332 5.39795 14.6022 1.66699 9.99984 1.66699C5.39746 1.66699 1.6665 5.39795 1.6665 10.0003C1.6665 14.6027 5.39746 18.3337 9.99984 18.3337Z" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_1072_7529">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

export const BadgeCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
);

export const ShieldCheckTest = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.6668 10.8331C16.6668 14.9997 13.7502 17.0831 10.2835 18.2914C10.102 18.3529 9.90478 18.35 9.72516 18.2831C6.25016 17.0831 3.3335 14.9997 3.3335 10.8331V4.99972C3.3335 4.77871 3.42129 4.56675 3.57757 4.41047C3.73385 4.25419 3.94582 4.16639 4.16683 4.16639C5.8335 4.16639 7.91683 3.16639 9.36683 1.89972C9.54337 1.74889 9.76796 1.66602 10.0002 1.66602C10.2324 1.66602 10.457 1.74889 10.6335 1.89972C12.0918 3.17472 14.1668 4.16639 15.8335 4.16639C16.0545 4.16639 16.2665 4.25419 16.4228 4.41047C16.579 4.56675 16.6668 4.77871 16.6668 4.99972V10.8331Z" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const IdCard = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.0002 10C11.4698 10 10.9611 10.2107 10.586 10.5858C10.2109 10.9609 10.0002 11.4696 10.0002 12C10.0002 13.02 9.90023 14.51 9.74023 16" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14 13.1201C14 15.5001 14 19.5001 13 22.0001" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M17.29 21.02C17.41 20.42 17.72 18.72 17.79 18" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M2 12C2 9.90118 2.66037 7.85555 3.88758 6.1529C5.11478 4.45024 6.8466 3.17687 8.83772 2.51317C10.8288 1.84946 12.9783 1.82906 14.9817 2.45486C16.985 3.08067 18.7407 4.32094 20 6" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M2 16H2.01" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M21.7998 16C21.9998 14 21.9308 10.646 21.7998 10" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M5 19.5C5.5 18 6 15 6 12C5.99899 11.3189 6.11397 10.6425 6.34 10" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8.6499 22C8.8599 21.34 9.0999 20.68 9.2199 20" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 6.79994C9.9124 6.27317 10.9474 5.99593 12.001 5.99609C13.0545 5.99626 14.0894 6.27384 15.0017 6.8009C15.9139 7.32797 16.6713 8.08594 17.1976 8.99859C17.7239 9.91124 18.0007 10.9464 18 11.9999V13.9999" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const Fingerprint = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10H18" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M16 14H18" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M6.16992 15.0001C6.37606 14.4141 6.75902 13.9065 7.26594 13.5475C7.77286 13.1884 8.37873 12.9956 8.99992 12.9956C9.62111 12.9956 10.227 13.1884 10.7339 13.5475C11.2408 13.9065 11.6238 14.4141 11.8299 15.0001" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 13C10.1046 13 11 12.1046 11 11C11 9.89543 10.1046 9 9 9C7.89543 9 7 9.89543 7 11C7 12.1046 7.89543 13 9 13Z" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M20 5H4C2.89543 5 2 5.89543 2 7V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17V7C22 5.89543 21.1046 5 20 5Z" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const ScanFace = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 11L18 13L22 9" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const Smartphone = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.832 16.568C14.0385 16.6628 14.2712 16.6845 14.4917 16.6294C14.7122 16.5744 14.9073 16.4458 15.045 16.265L15.4 15.8C15.5863 15.5516 15.8279 15.35 16.1056 15.2111C16.3833 15.0723 16.6895 15 17 15H20C20.5304 15 21.0391 15.2107 21.4142 15.5858C21.7893 15.9609 22 16.4696 22 17V20C22 20.5304 21.7893 21.0391 21.4142 21.4142C21.0391 21.7893 20.5304 22 20 22C15.2261 22 10.6477 20.1036 7.27208 16.7279C3.89642 13.3523 2 8.7739 2 4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H7C7.53043 2 8.03914 2.21071 8.41421 2.58579C8.78929 2.96086 9 3.46957 9 4V7C9 7.31049 8.92771 7.61672 8.78885 7.89443C8.65 8.17214 8.44839 8.41371 8.2 8.6L7.732 8.951C7.54842 9.09118 7.41902 9.29059 7.36579 9.51535C7.31256 9.74012 7.33878 9.97638 7.44 10.184C8.80668 12.9599 11.0544 15.2048 13.832 16.568Z" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const MapPin = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="2.8" />
  </Base>
);

export const Building = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12H14" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M10 8H14" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14 21V18C14 17.4696 13.7893 16.9609 13.4142 16.5858C13.0391 16.2107 12.5304 16 12 16C11.4696 16 10.9609 16.2107 10.5858 16.5858C10.2107 16.9609 10 17.4696 10 18V21" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M6 10H4C3.46957 10 2.96086 10.2107 2.58579 10.5858C2.21071 10.9609 2 11.4696 2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7H18" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M6 21V5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3H16C16.5304 3 17.0391 3.21071 17.4142 3.58579C17.7893 3.96086 18 4.46957 18 5V21" stroke="#FCFCFC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const Gauge = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 14 16 9" />
    <path d="M3.5 16a9 9 0 1 1 17 0" />
    <circle cx="12" cy="14" r="1.4" />
  </Base>
);

export const Workflow = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M6.5 10v3a3 3 0 0 0 3 3h4.5" />
  </Base>
);

export const FileCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="m9 15 2 2 4-4" />
  </Base>
);

export const Webhook = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 1 1 7.5 12.5" />
    <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
    <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
  </Base>
);

export const Users = (p: IconProps) => (
  <Base {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Base>
);

export const Code = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 13.3332L18.3333 9.99984L15 6.6665" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M4.99984 6.6665L1.6665 9.99984L4.99984 13.3332" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12.0832 3.3335L7.9165 16.6668" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const FlaskConical = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 15.8335H16.6667" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M3.3335 14.1665L8.3335 9.1665L3.3335 4.1665" stroke="#763BF1" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const SOC2 = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.85019 8.6201C3.70423 7.96262 3.72665 7.27894 3.91535 6.63244C4.10405 5.98593 4.45294 5.39754 4.92966 4.92182C5.40638 4.4461 5.9955 4.09844 6.6424 3.91109C7.2893 3.72374 7.97303 3.70276 8.63019 3.8501C8.9919 3.2844 9.4902 2.81886 10.0791 2.49638C10.6681 2.17391 11.3287 2.00488 12.0002 2.00488C12.6716 2.00488 13.3323 2.17391 13.9212 2.49638C14.5102 2.81886 15.0085 3.2844 15.3702 3.8501C16.0284 3.70212 16.7133 3.72301 17.3612 3.91081C18.0091 4.09862 18.599 4.44724 19.076 4.92425C19.5531 5.40126 19.9017 5.99117 20.0895 6.6391C20.2773 7.28703 20.2982 7.97193 20.1502 8.6301C20.7159 8.99181 21.1814 9.4901 21.5039 10.079C21.8264 10.668 21.9954 11.3286 21.9954 12.0001C21.9954 12.6715 21.8264 13.3322 21.5039 13.9211C21.1814 14.5101 20.7159 15.0084 20.1502 15.3701C20.2975 16.0273 20.2765 16.711 20.0892 17.3579C19.9018 18.0048 19.5542 18.5939 19.0785 19.0706C18.6027 19.5473 18.0144 19.8962 17.3679 20.0849C16.7213 20.2736 16.0377 20.2961 15.3802 20.1501C15.019 20.718 14.5203 21.1855 13.9303 21.5094C13.3404 21.8333 12.6782 22.0032 12.0052 22.0032C11.3322 22.0032 10.67 21.8333 10.0801 21.5094C9.49011 21.1855 8.99143 20.718 8.63019 20.1501C7.97303 20.2974 7.2893 20.2765 6.6424 20.0891C5.9955 19.9018 5.40638 19.5541 4.92966 19.0784C4.45294 18.6027 4.10405 18.0143 3.91535 17.3678C3.72665 16.7213 3.70423 16.0376 3.85019 15.3801C3.28015 15.0193 2.81061 14.5203 2.48524 13.9293C2.15988 13.3384 1.98926 12.6747 1.98926 12.0001C1.98926 11.3255 2.15988 10.6618 2.48524 10.0709C2.81061 9.47992 3.28015 8.98085 3.85019 8.6201Z" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M9 12L11 14L15 10" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
);

export const ISO2700 = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
)

export const PCI = (p: IconProps) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 12H10" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M15 8H10" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M19 17V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H4" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M8 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V18C22 17.7348 21.8946 17.4804 21.7071 17.2929C21.5196 17.1054 21.2652 17 21 17H11C10.7348 17 10.4804 17.1054 10.2929 17.2929C10.1054 17.4804 10 17.7348 10 18V19C10 19.5304 9.78929 20.0391 9.41421 20.4142C9.03914 20.7893 8.53043 21 8 21ZM8 21C7.46957 21 6.96086 20.7893 6.58579 20.4142C6.21071 20.0391 6 19.5304 6 19V5C6 4.46957 5.78929 3.96086 5.41421 3.58579C5.03914 3.21071 4.53043 3 4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V7C2 7.26522 2.10536 7.51957 2.29289 7.70711C2.48043 7.89464 2.73478 8 3 8H6" stroke="#763BF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

)

export const BookOpen = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 7v14M12 7a4 4 0 0 0-4-4H3a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h6a3 3 0 0 1 3 2 3 3 0 0 1 3-2h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-5a4 4 0 0 0-4 4Z" />
  </Base>
);

export const KeyRound = (p: IconProps) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1101_6914)">
      <path d="M1.293 8.70659C1.10545 8.89408 1.00006 9.1484 1 9.41359V10.4996C1 10.6322 1.05268 10.7594 1.14645 10.8531C1.24021 10.9469 1.36739 10.9996 1.5 10.9996H3C3.13261 10.9996 3.25979 10.9469 3.35355 10.8531C3.44732 10.7594 3.5 10.6322 3.5 10.4996V9.99959C3.5 9.86698 3.55268 9.73981 3.64645 9.64604C3.74021 9.55227 3.86739 9.49959 4 9.49959H4.5C4.63261 9.49959 4.75979 9.44691 4.85355 9.35315C4.94732 9.25938 5 9.1322 5 8.99959V8.49959C5 8.36698 5.05268 8.23981 5.14645 8.14604C5.24021 8.05227 5.36739 7.99959 5.5 7.99959H5.586C5.85119 7.99954 6.10551 7.89414 6.293 7.70659L6.7 7.29959C7.39492 7.54166 8.15142 7.54074 8.84574 7.29697C9.54006 7.0532 10.1311 6.58101 10.5222 5.95765C10.9133 5.3343 11.0812 4.59668 10.9986 3.86546C10.9159 3.13424 10.5876 2.45272 10.0672 1.93238C9.54687 1.41204 8.86535 1.08368 8.13413 1.00104C7.40291 0.918389 6.66529 1.08634 6.04194 1.47741C5.41858 1.86849 4.9464 2.45953 4.70262 3.15385C4.45885 3.84818 4.45793 4.60467 4.7 5.29959L1.293 8.70659Z" stroke="#5B6375" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M8.25 4C8.38807 4 8.5 3.88807 8.5 3.75C8.5 3.61193 8.38807 3.5 8.25 3.5C8.11193 3.5 8 3.61193 8 3.75C8 3.88807 8.11193 4 8.25 4Z" fill="#5B6375" stroke="#5B6375" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <defs>
      <clipPath id="clip0_1101_6914">
        <rect width="12" height="12" fill="white" />
      </clipPath>
    </defs>
  </svg>

);

export const Star = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true" {...p}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
  </svg>
);

export const Plus = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);

export const Minus = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14" />
  </Base>
);

export const Menu = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);

export const X = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Base>
);

export const Terminal = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 8 4 4-4 4M13 16h6" />
  </Base>
);

export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const Play = (p: IconProps) => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.666504 2.00072C0.666434 1.76612 0.728267 1.53565 0.84576 1.33258C0.963252 1.12952 1.13224 0.961047 1.33567 0.844185C1.5391 0.727322 1.76976 0.666203 2.00436 0.667C2.23897 0.667796 2.46921 0.73048 2.67184 0.848721L10.6698 5.51405C10.8717 5.63117 11.0392 5.79922 11.1558 6.00139C11.2723 6.20356 11.3338 6.43279 11.334 6.66615C11.3342 6.89951 11.2731 7.12883 11.157 7.33121C11.0408 7.53358 10.8735 7.70192 10.6718 7.81939L2.67184 12.4861C2.46921 12.6043 2.23897 12.667 2.00436 12.6678C1.76976 12.6686 1.5391 12.6075 1.33567 12.4906C1.13224 12.3737 0.963252 12.2053 0.84576 12.0022C0.728267 11.7991 0.666434 11.5687 0.666504 11.3341V2.00072Z" stroke="#FCFCFC" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

);

export const Copy = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Base>
);

export const Zap = (p: IconProps) => (
  <Base {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Base>
);

export const Mail = (p: IconProps) => (
  <Base {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Base>
);

export const ArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Base>
);

export const User = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Base>
);

export const Briefcase = (p: IconProps) => (
  <Base {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </Base>
);

export const Phone = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </Base>
);

export const LayoutGrid = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Base>
);

export const History = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </Base>
);

export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Base>
);

export const Receipt = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 2v20l1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1V2l-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1L5.5 3 4 2Z" />
    <path d="M8 7h8M8 11h8M8 15h5" />
  </Base>
);

export const CodeBrackets = (p: IconProps) => (
  <Base {...p}>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </Base>
);

export const Tag = (p: IconProps) => (
  <Base {...p}>
    <path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".75" fill="currentColor" />
  </Base>
);

export const LogOut = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </Base>
);

export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Base>
);

export const Bell = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Base>
);

export const Wallet = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </Base>
);

export const Pulse = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Base>
);

export const XCircle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
  </Base>
);

export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 17 17 7M7 7h10v10" />
  </Base>
);

export const ArrowDownRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 7l10 10M17 7v10H7" />
  </Base>
);

export const ArrowDownLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M17 7 7 17M17 17H7V7" />
  </Base>
);

export const TrendingDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M16 17h6v-6" />
    <path d="m22 17-8.5-8.5-5 5L2 7" />
  </Base>
);

export const Filter = (p: IconProps) => (
  <Base {...p}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
  </Base>
);

export const ExternalLink = (p: IconProps) => (
  <Base {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Base>
);

export const RefreshCw = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </Base>
);

export const FingerScan = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M5 18c.6-1.6 1-3.4 1-6a6 6 0 0 1 .5-2.4" />
    <path d="M9 7a6 6 0 0 1 9 5v2" />
    <path d="M12 11a2 2 0 0 0-2 2c0 1-.1 2.5-.3 4" />
    <path d="M14 13c0 2.4 0 6.4-1 9" />
    <path d="M8.7 22c.2-.66.4-1.3.5-2" />
  </Base>
);

export const CreditCard = (p: IconProps) => (
  <Base {...p}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Base>
);

export const FaceId = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01M15 9h.01" />
  </Base>
);

export const Car = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 10l-1.6-3.5c-.3-.7-1-1.2-1.8-1.2H9c-.8 0-1.5.5-1.8 1.2L5.6 10l-2.1.2C2.7 10.3 2 11.1 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </Base>
);

export const ClipboardList = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
  </Base>
);

export const Camera = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
    <circle cx="12" cy="13" r="3" />
  </Base>
);

export const Trash = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </Base>
);

export const Headset = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 14h3a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3" />
    <path d="M19 19v1a3 3 0 0 1-3 3h-4" />
  </Base>
);

export const Building2 = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
  </Base>
);

export const Key = (p: IconProps) => (
  <Base {...p}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </Base>
);

export const AlertTriangle = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Base>
);

export const MessageSquare = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </Base>
);

export const Save = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </Base>
);

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 18 6-6-6-6" />
  </Base>
);

export const ChevronLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="m15 18-6-6 6-6" />
  </Base>
);

export const TrendingUp = (p: IconProps) => (
  <Base {...p}>
    <path d="M16 7h6v6" />
    <path d="m22 7-8.5 8.5-5-5L2 17" />
  </Base>
);

export const Globe = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
  </Base>
);

export const Calendar = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Base>
);

export const Eye = (p: IconProps) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);

export const EyeOff = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-2.6 3.6M6.6 6.6A18 18 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5.4-1.5" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
  </Base>
);

export const Google = (p: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
    <path d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z" fill="#EA4335" />
  </svg>
);
