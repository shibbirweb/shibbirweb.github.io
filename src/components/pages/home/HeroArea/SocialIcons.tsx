import { cn } from '@/utils/cn';
import { socialLinks } from '@/components/pages/home/HeroArea/contents';

export default function SocialIcons() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 select-none sm:gap-4">
            {socialLinks.map(({ name, Icon, href, socialColorClassNames }) => (
                <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    aria-label={name}
                    className={cn(
                        'p-2 transition-[color,transform] duration-300 motion-safe:hover:scale-110',
                        socialColorClassNames
                    )}
                >
                    <Icon
                        className="size-5 sm:size-6"
                        aria-hidden="true"
                    />
                </a>
            ))}
        </div>
    );
}
