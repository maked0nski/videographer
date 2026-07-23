import type { ResolvedProfile } from "@/types";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

const ICON_CLASS = "h-5 w-5";
const LINK_CLASS = "text-text-secondary hover:text-accent transition-colors";

function EmailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9l6 3-6 3V9z" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8.5" r="1.1" fill="currentColor" />
      <path d="M8 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12 17v-4.2c0-1.4.9-2.3 2.1-2.3s2 .9 2 2.3V17M12 11.2h1.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={ICON_CLASS} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13.2 19v-6h2l.3-2.4h-2.3V8.9c0-.7.2-1.2 1.3-1.2h1.1V5.6c-.2 0-.9-.1-1.7-.1-2 0-3.3 1.2-3.3 3.4v1.7H8.8v2.4h1.8V19"
        fill="currentColor"
      />
    </svg>
  );
}

/** Monochrome icon row for the About page's "Get in touch" section — no
 * per-platform brand colors, matching the site's black/white/accent
 * aesthetic. LinkedIn/Facebook only render when their optional URL is set.
 */
export function SocialLinks({
  profile,
  labels,
}: {
  profile: ResolvedProfile;
  labels: { email: string; instagram: string; youtube: string; linkedin: string; facebook: string };
}) {
  return (
    <ul className="flex flex-wrap gap-5">
      <li>
        <a href={`mailto:${profile.email}`} className={LINK_CLASS}>
          <VisuallyHidden>{labels.email}</VisuallyHidden>
          <EmailIcon />
        </a>
      </li>
      <li>
        <a href={profile.instagramUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
          <VisuallyHidden>{labels.instagram}</VisuallyHidden>
          <InstagramIcon />
        </a>
      </li>
      <li>
        <a href={profile.youtubeUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
          <VisuallyHidden>{labels.youtube}</VisuallyHidden>
          <YoutubeIcon />
        </a>
      </li>
      {profile.linkedinUrl && (
        <li>
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
            <VisuallyHidden>{labels.linkedin}</VisuallyHidden>
            <LinkedinIcon />
          </a>
        </li>
      )}
      {profile.facebookUrl && (
        <li>
          <a href={profile.facebookUrl} target="_blank" rel="noreferrer noopener" className={LINK_CLASS}>
            <VisuallyHidden>{labels.facebook}</VisuallyHidden>
            <FacebookIcon />
          </a>
        </li>
      )}
    </ul>
  );
}
