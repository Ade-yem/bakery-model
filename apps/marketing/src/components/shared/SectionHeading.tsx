/**
 * @file Section Heading component with brand typography and alignment styles.
 */

import React from 'react';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * @description Standardized section header with eyebrow badge, title, and description.
 * @param {SectionHeadingProps} props - Heading configurations.
 * @returns {React.ReactElement} Semantic header block.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  theme = 'light',
  className = '',
}: SectionHeadingProps): React.ReactElement {
  const isDark = theme === 'dark';
  const isCenter = align === 'center';

  return (
    <div
      className={`max-w-3xl ${isCenter ? 'mx-auto text-center' : 'text-left'} ${className}`}
    >
      {eyebrow && (
        <div className={`mb-3 inline-flex items-center gap-2 ${isCenter ? 'justify-center' : ''}`}>
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border ${
              isDark
                ? 'bg-[#52C2C9]/10 text-[#52C2C9] border-[#52C2C9]/30'
                : 'bg-[#0B5C63]/10 text-[#0B5C63] border-[#0B5C63]/25'
            }`}
          >
            {eyebrow}
          </span>
        </div>
      )}

      <h2
        className={`text-3xl sm:text-4xl lg:text-4xl font-extrabold tracking-tight font-sans leading-tight ${
          isDark ? 'text-[#E9E4D2]' : 'text-[#10201F]'
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-base sm:text-lg font-normal leading-relaxed ${
            isDark ? 'text-[#E9E4D2]/80' : 'text-[#10201F]/80'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
