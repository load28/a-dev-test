import { ReactNode } from 'react'

/**
 * Props for the LandingLayout component
 */
export interface LandingLayoutProps {
  /** Content for the left column */
  leftContent: ReactNode
  /** Content for the right column */
  rightContent: ReactNode
  /** Optional CSS class name for the container */
  className?: string
  /** Optional CSS class name for the left column */
  leftClassName?: string
  /** Optional CSS class name for the right column */
  rightClassName?: string
  /** Reverse column order on mobile (right column first) */
  reverseOnMobile?: boolean
}

/**
 * LandingLayout - A responsive 2-column layout component for landing pages
 *
 * Features:
 * - Desktop: Side-by-side 2-column layout (50/50 split)
 * - Tablet: Side-by-side with adjusted spacing
 * - Mobile: Stacked single column layout
 * - Customizable column order for mobile view
 *
 * @example
 * ```tsx
 * <LandingLayout
 *   leftContent={<HeroSection />}
 *   rightContent={<FeatureList />}
 *   reverseOnMobile={true}
 * />
 * ```
 */
export function LandingLayout({
  leftContent,
  rightContent,
  className = '',
  leftClassName = '',
  rightClassName = '',
  reverseOnMobile = false,
}: LandingLayoutProps) {
  const containerClasses = [
    'w-full',
    'min-h-screen',
    'mx-auto',
    'px-4',
    'sm:px-6',
    'lg:px-8',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const gridClasses = [
    'grid',
    'grid-cols-1',
    'lg:grid-cols-2',
    'gap-6',
    'lg:gap-8',
    'xl:gap-12',
    'items-center',
    'min-h-screen',
  ].join(' ')

  const leftColClasses = [
    'w-full',
    reverseOnMobile ? 'order-2 lg:order-1' : 'order-1',
    leftClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const rightColClasses = [
    'w-full',
    reverseOnMobile ? 'order-1 lg:order-2' : 'order-2',
    rightClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      <div className={gridClasses}>
        {/* Left Column */}
        <div className={leftColClasses}>
          <div className="max-w-full">{leftContent}</div>
        </div>

        {/* Right Column */}
        <div className={rightColClasses}>
          <div className="max-w-full">{rightContent}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * LandingSection - A utility component for consistent section styling within LandingLayout
 */
export interface LandingSectionProps {
  /** Section content */
  children: ReactNode
  /** Optional section title */
  title?: string
  /** Optional section subtitle */
  subtitle?: string
  /** Optional CSS class name */
  className?: string
  /** Center align content */
  centerAlign?: boolean
}

export function LandingSection({
  children,
  title,
  subtitle,
  className = '',
  centerAlign = false,
}: LandingSectionProps) {
  const sectionClasses = [
    'flex',
    'flex-col',
    'gap-4',
    'md:gap-6',
    centerAlign ? 'items-center text-center' : 'items-start',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClasses}>
      {title && (
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl">{subtitle}</p>
      )}
      <div className="w-full">{children}</div>
    </section>
  )
}

export default LandingLayout
