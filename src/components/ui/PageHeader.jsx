import { memo } from 'react';
import SectionHeader from './SectionHeader';

/**
 * Standard page header: eyebrow + title + description on the left, and a
 * status / action cluster on the right. Matches the layout repeated across
 * every data page.
 */
export const PageHeader = memo(({ eyebrow, title, description, accent, children, className = '' }) => (
  <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
    <SectionHeader eyebrow={eyebrow} title={title} description={description} accent={accent} />
    {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
  </div>
));

export default PageHeader;
