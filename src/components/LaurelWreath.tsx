import React from 'react';

interface LaurelWreathProps {
  className?: string;
}

export const LaurelWreath: React.FC<LaurelWreathProps> = ({
  className = 'w-24 h-24 sm:w-28 sm:h-28',
}) => {
  return (
    <svg
      viewBox="-80 -80 160 160"
      className={`${className} drop-shadow-[0_8px_22px_rgba(245,158,11,0.4)] select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Golden Leaf Light Gradient */}
        <linearGradient id="lw_goldLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="25%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Golden Leaf Shade Gradient */}
        <linearGradient id="lw_goldShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Branch Stem Gradient */}
        <linearGradient id="lw_stem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Golden Ribbon Tie Gradient */}
        <linearGradient id="lw_ribbon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="25%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FEF08A" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Golden Berry Gradient */}
        <radialGradient id="lw_berry" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="40%" stopColor="#FDE047" />
          <stop offset="85%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </radialGradient>

        {/* Soft Golden Glow behind the laurel */}
        <radialGradient id="lw_glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#D97706" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Gentle ambient glow that hugs the wreath */}
      <circle cx="0" cy="0" r="70" fill="url(#lw_glow)" />

      {/* REUSABLE SINGLE LAUREL BRANCH (RIGHT SIDE) */}
      <defs>
        <g id="lw_halfBranch">
          {/* Main Curved Stem */}
          <path
            d="M 0 56 C 28 54, 56 36, 56 -2 C 56 -26, 42 -52, 22 -65"
            stroke="url(#lw_stem)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Stem specular highlight line */}
          <path
            d="M 0 55 C 27 53, 54 35, 54 -2 C 54 -24, 41 -49, 23 -63"
            stroke="#FFFBEB"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* LEAF CLUSTER 1 (Near bottom: t ~ 0.1) */}
          {/* Inner Leaf */}
          <g transform="translate(14, 52) rotate(-55)">
            <path d="M 0 0 C -4 -7, -2 -16, 0 -22 C 2 -16, 4 -7, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -8, 1 -15, 0 -22" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Outer Leaf */}
          <g transform="translate(18, 54) rotate(40)">
            <path d="M 0 0 C -4 -8, -3 -18, 0 -24 C 3 -18, 4 -8, 0 0 Z" fill="url(#lw_goldShade)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -9, 1 -17, 0 -24" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Golden Berry */}
          <circle cx="16" cy="51" r="2.2" fill="url(#lw_berry)" stroke="#78350F" strokeWidth="0.5" />

          {/* LEAF CLUSTER 2 (t ~ 0.25) */}
          {/* Inner Leaf */}
          <g transform="translate(32, 40) rotate(-40)">
            <path d="M 0 0 C -5 -9, -3 -20, 0 -26 C 3 -20, 5 -9, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -10, 1 -18, 0 -26" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Outer Leaf */}
          <g transform="translate(37, 43) rotate(55)">
            <path d="M 0 0 C -5 -9, -3 -21, 0 -27 C 3 -21, 5 -9, 0 0 Z" fill="url(#lw_goldShade)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -10, 1 -19, 0 -27" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Golden Berry */}
          <circle cx="34" cy="38" r="2.4" fill="url(#lw_berry)" stroke="#78350F" strokeWidth="0.5" />

          {/* LEAF CLUSTER 3 (Middle curve: t ~ 0.45) */}
          {/* Inner Leaf */}
          <g transform="translate(48, 20) rotate(-22)">
            <path d="M 0 0 C -5 -10, -3 -22, 0 -28 C 3 -22, 5 -10, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -11, 1 -20, 0 -28" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Outer Leaf */}
          <g transform="translate(54, 22) rotate(70)">
            <path d="M 0 0 C -5 -10, -3 -22, 0 -28 C 3 -22, 5 -10, 0 0 Z" fill="url(#lw_goldShade)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -11, 1 -20, 0 -28" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Golden Berry pair */}
          <circle cx="51" cy="18" r="2.5" fill="url(#lw_berry)" stroke="#78350F" strokeWidth="0.5" />
          <circle cx="55" cy="15" r="2" fill="url(#lw_berry)" stroke="#78350F" strokeWidth="0.5" />

          {/* LEAF CLUSTER 4 (t ~ 0.65) */}
          {/* Inner Leaf */}
          <g transform="translate(55, -4) rotate(0)">
            <path d="M 0 0 C -5 -9, -3 -21, 0 -27 C 3 -21, 5 -9, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -10, 1 -19, 0 -27" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Outer Leaf */}
          <g transform="translate(60, -2) rotate(85)">
            <path d="M 0 0 C -5 -9, -3 -20, 0 -26 C 3 -20, 5 -9, 0 0 Z" fill="url(#lw_goldShade)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -10, 1 -18, 0 -26" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Golden Berry */}
          <circle cx="56" cy="-8" r="2.3" fill="url(#lw_berry)" stroke="#78350F" strokeWidth="0.5" />

          {/* LEAF CLUSTER 5 (t ~ 0.8) */}
          {/* Inner Leaf */}
          <g transform="translate(48, -27) rotate(22)">
            <path d="M 0 0 C -4 -8, -2 -19, 0 -24 C 2 -19, 4 -8, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -9, 1 -17, 0 -24" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Outer Leaf */}
          <g transform="translate(52, -24) rotate(98)">
            <path d="M 0 0 C -4 -8, -2 -18, 0 -23 C 2 -18, 4 -8, 0 0 Z" fill="url(#lw_goldShade)" stroke="#78350F" strokeWidth="0.6" />
            <path d="M 0 0 C 0 -9, 1 -16, 0 -23" stroke="#FFFBEB" strokeWidth="0.6" />
          </g>
          {/* Golden Berry */}
          <circle cx="47" cy="-30" r="2" fill="url(#lw_berry)" stroke="#78350F" strokeWidth="0.5" />

          {/* LEAF CLUSTER 6 (Near top tip: t ~ 0.95) */}
          {/* Inner Leaf */}
          <g transform="translate(34, -48) rotate(42)">
            <path d="M 0 0 C -3.5 -7, -2 -16, 0 -20 C 2 -16, 3.5 -7, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.5" />
            <path d="M 0 0 C 0 -8, 1 -14, 0 -20" stroke="#FFFBEB" strokeWidth="0.5" />
          </g>
          {/* Outer Leaf */}
          <g transform="translate(37, -46) rotate(115)">
            <path d="M 0 0 C -3.5 -7, -2 -15, 0 -19 C 2 -15, 3.5 -7, 0 0 Z" fill="url(#lw_goldShade)" stroke="#78350F" strokeWidth="0.5" />
            <path d="M 0 0 C 0 -7, 1 -13, 0 -19" stroke="#FFFBEB" strokeWidth="0.5" />
          </g>

          {/* Terminal Apex Leaf at the Tip */}
          <g transform="translate(22, -64) rotate(60)">
            <path d="M 0 0 C -3 -6, -1.5 -14, 0 -18 C 1.5 -14, 3 -6, 0 0 Z" fill="url(#lw_goldLight)" stroke="#78350F" strokeWidth="0.5" />
            <path d="M 0 0 C 0 -7, 0.8 -13, 0 -18" stroke="#FFFBEB" strokeWidth="0.5" />
          </g>
        </g>
      </defs>

      {/* RIGHT LAUREL BRANCH */}
      <use href="#lw_halfBranch" />

      {/* LEFT LAUREL BRANCH (Perfect mirror) */}
      <use href="#lw_halfBranch" transform="scale(-1, 1)" />

      {/* BOTTOM GOLDEN RIBBON TIE & BOW */}
      <g>
        {/* Left Ribbon Tail */}
        <path
          d="M -3 58 C -8 64, -14 71, -19 75 C -15 72, -13 69, -15 65 C -11 65, -8 63, -3 60 Z"
          fill="url(#lw_ribbon)"
          stroke="#78350F"
          strokeWidth="0.7"
        />
        {/* Right Ribbon Tail */}
        <path
          d="M 3 58 C 8 64, 14 71, 19 75 C 15 72, 13 69, 15 65 C 11 65, 8 63, 3 60 Z"
          fill="url(#lw_ribbon)"
          stroke="#78350F"
          strokeWidth="0.7"
        />

        {/* Central Ribbon Knot / Clasp */}
        <ellipse cx="0" cy="57" rx="6.5" ry="4.5" fill="url(#lw_ribbon)" stroke="#78350F" strokeWidth="0.8" />
        <ellipse cx="-1.5" cy="55.5" rx="2" ry="1.2" fill="#FFFBEB" opacity="0.8" />

        {/* Small Ribbon Wings (Bow loops) */}
        <path
          d="M -5 57 C -11 54, -13 58, -6 61 Z"
          fill="url(#lw_goldLight)"
          stroke="#78350F"
          strokeWidth="0.6"
        />
        <path
          d="M 5 57 C 11 54, 13 58, 6 61 Z"
          fill="url(#lw_goldLight)"
          stroke="#78350F"
          strokeWidth="0.6"
        />
      </g>

      {/* FLOATING VICTORY SPARKLES (DELICATE GLINTS) */}
      <g transform="translate(0, -68)">
        <path d="M 0 -4 Q 0 0 4 0 Q 0 0 0 4 Q 0 0 -4 0 Q 0 0 0 -4 Z" fill="#FFFBEB" />
      </g>
      <g transform="translate(48, -58)">
        <path d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z" fill="#FEF08A" />
      </g>
      <g transform="translate(-48, -58)">
        <path d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z" fill="#FEF08A" />
      </g>
    </svg>
  );
};
