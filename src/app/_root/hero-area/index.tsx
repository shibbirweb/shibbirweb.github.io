import DownIcon from '@/components/icons/down';
import GithubIcon from '@/components/icons/github';
import LinkedinIcon from '@/components/icons/linkedin';
import { socialLinks } from './contents';
import { cn } from '@/utils/cn';
import SocialIcons from './SocialIcons';

export default function HeroArea() {
    return (
        <div className="flex min-h-screen flex-col items-center">
            <div className="flex w-full grow flex-col items-center justify-center">
                <div className="flex flex-col items-end justify-center">
                    <h1 className="text-9xl leading-12 font-bold">
                        Shibbir Ahmed
                    </h1>
                    <p className="text-2xl">Full Stack Developer</p>
                </div>
                <SocialIcons />
            </div>
            {/* <a
                href="#about"
                className="animate-bounce py-10 text-black duration-300 dark:text-white"
            >
                <DownIcon className="size-7" />
            </a> */}
        </div>
    );
}
