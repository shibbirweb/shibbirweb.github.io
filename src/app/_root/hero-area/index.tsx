import ShinyTextAnimation from '@/components/animations/ShinyTextAnimation';
import DownIcon from '@/components/icons/down';
import SocialIcons from './SocialIcons';
import WithGridAnimatedBackgroundWrapper from '@/components/wrappers/WithGridAnimatedBackgroundWrapper';
import { professionalTitle } from '@/config/constants';

export default function HeroArea() {
    return (
        <WithGridAnimatedBackgroundWrapper id="hero">
            <div className="container mx-auto">
                <div className="flex min-h-[100svh] flex-col items-center">
                    <div className="flex w-full grow flex-col items-center justify-center py-6">
                        <div className="flex flex-col gap-y-2 px-4 sm:gap-y-3 md:gap-y-4 lg:items-end lg:justify-center">
                            <ShinyTextAnimation>
                                <h1 className="flex flex-wrap items-center justify-center gap-x-8 text-[length:clamp(2.75rem,14vw,6rem)] leading-none font-bold sm:text-8xl sm:leading-10 md:gap-x-12 md:text-9xl md:leading-12">
                                    <span className="text-box-trim-trim-both text-box-edge-cap-alphabetic py-1">
                                        Shibbir
                                    </span>
                                    <span className="text-box-trim-trim-both text-box-edge-cap-alphabetic py-1">
                                        Ahmed
                                    </span>
                                </h1>
                            </ShinyTextAnimation>
                            <p className="self-center text-center text-2xl leading-tight sm:leading-5 lg:self-end lg:pr-[5px]">
                                {professionalTitle}
                            </p>
                        </div>
                        <SocialIcons />
                    </div>
                    <a
                        href="#about"
                        aria-label="Scroll to the about section"
                        className="text-foreground/40 hover:text-foreground/70 mb-6 transition-colors motion-safe:animate-bounce sm:mb-10"
                    >
                        <DownIcon
                            className="size-8"
                            aria-hidden="true"
                        />
                    </a>
                </div>
            </div>
        </WithGridAnimatedBackgroundWrapper>
    );
}
