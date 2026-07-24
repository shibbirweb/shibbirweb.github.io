import FacebookIcon from '@/components/icons/facebook';
import LinkedinIcon from '@/components/icons/linkedin';
import WhatsAppIcon from '@/components/icons/whatsapp';
import XIcon from '@/components/icons/x';
import { twitterUsername } from '@/config/constants';
import type { ShareTarget } from '@/components/pages/articles/ShareMenu/types';

const twitterHandle = twitterUsername.replace('@', '');

/** The URL-based share targets, in menu order. Colours match the hero
 *  SocialIcons so the icons stay recognisable when a row is hovered. */
export const shareTargets: ShareTarget[] = [
    {
        name: 'X',
        Icon: XIcon,
        buildShareUrl: ({ url, title }) =>
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=${twitterHandle}`,
        brandHoverClassName: 'hover:text-[#000000] dark:hover:text-white',
    },
    {
        name: 'LinkedIn',
        Icon: LinkedinIcon,
        buildShareUrl: ({ url }) =>
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        brandHoverClassName: 'hover:text-[#469EC8]',
    },
    {
        name: 'Facebook',
        Icon: FacebookIcon,
        buildShareUrl: ({ url }) =>
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        brandHoverClassName: 'hover:text-[#3B5998]',
    },
    {
        name: 'WhatsApp',
        Icon: WhatsAppIcon,
        buildShareUrl: ({ url, title }) =>
            `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
        brandHoverClassName: 'hover:text-[#25D366]',
    },
];
