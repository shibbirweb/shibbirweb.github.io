import { cn } from '@/utils/cn';
import { socialLinks } from './contents';

export default function SocialIcons() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 select-none sm:gap-4">
            {socialLinks.map(({ Icon, href, socialColorClassNames }) => (
                <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        'p-2 transition-all duration-300 hover:scale-110',
                        socialColorClassNames
                    )}
                >
                    <Icon className="size-5 sm:size-6" />
                </a>
            ))}
        </div>
    );
}
