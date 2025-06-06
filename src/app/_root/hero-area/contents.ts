import CodepenIcon from '@/components/icons/codepen';
import DevToIcon from '@/components/icons/dev.to';
import FacebookIcon from '@/components/icons/facebook';
import GithubIcon from '@/components/icons/github';
import LinkedinIcon from '@/components/icons/linkedin';
import MediumIcon from '@/components/icons/medium';
// import PatreonIcon from '@/components/icons/patreon';
import XIcon from '@/components/icons/x';

export const socialLinks: {
    name: string;
    Icon: React.ElementType;
    href: string;
    socialColorClassNames?: string;
}[] = [
    {
        name: 'GitHub',
        Icon: GithubIcon,
        href: 'https://github.com/shibbirweb',
        socialColorClassNames: 'hover:text-[#171515] dark:hover:text-white',
    },
    {
        name: 'LinkedIn',
        Icon: LinkedinIcon,
        href: 'https://www.linkedin.com/in/shibbirweb/',
        socialColorClassNames: 'hover:text-[#469EC8]',
    },
    {
        name: 'Facebook',
        Icon: FacebookIcon,
        href: 'https://www.facebook.com/shibbirweb',
        socialColorClassNames: 'hover:text-[#3B5998]',
    },
    {
        name: 'Codepen',
        Icon: CodepenIcon,
        href: 'https://codepen.io/shibbirweb',
        socialColorClassNames: 'hover:text-[#171515] dark:hover:text-white',
    },
    {
        name: 'X',
        Icon: XIcon,
        href: 'https://x.com/shibbirweb',
        socialColorClassNames: 'hover:text-[#000000] dark:hover:text-white',
    },
    {
        name: 'Medium',
        Icon: MediumIcon,
        href: 'https://medium.com/@shibbirweb',
        socialColorClassNames: 'hover:text-[#000000] dark:hover:text-white',
    },
    {
        name: 'Dev.to',
        Icon: DevToIcon,
        href: 'https://dev.to/shibbirweb',
        socialColorClassNames: 'hover:text-[#000000] dark:hover:text-white',
    },
    /* {
        Icon: PatreonIcon,
        href: 'https://www.patreon.com/shibbirweb',
        socialColorClassNames: 'hover:text-[#FF5900]',
    }, */
];
