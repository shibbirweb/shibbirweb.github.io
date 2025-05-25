import { cn } from '@/utils/cn';
import { socialLinks } from './contents';

export default function SocialIcons() {
    return (
        <div className="flex items-center gap-4">
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
                    <Icon className="size-6" />
                </a>
            ))}
        </div>
    );
}
