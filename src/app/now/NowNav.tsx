import Link from 'next/link';
import { nowNav } from './contents';

export default function NowNav() {
    return (
        <nav className="border-foreground/15 mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t pt-8 text-xl">
            {nowNav.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="text-foreground/70 hover:text-foreground transition-colors"
                >
                    {item.direction === 'back'
                        ? `← ${item.label}`
                        : `${item.label} →`}
                </Link>
            ))}
        </nav>
    );
}
