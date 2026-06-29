import ShinyTextAnimation from '@/components/animations/ShinyTextAnimation';
import HeroName from '@/components/pages/home/HeroArea/HeroName';
import ScrollDownCue from '@/components/pages/home/HeroArea/ScrollDownCue';
import SocialIcons from '@/components/pages/home/HeroArea/SocialIcons';
import WithGridAnimatedBackgroundWrapper from '@/components/wrappers/WithGridAnimatedBackgroundWrapper';
import {
    personFamilyName,
    personGivenName,
    professionalTitle,
} from '@/config/constants';
import { zain } from '@/config/fonts';
import { cn } from '@/utils/cn';

export default function HeroArea() {
    return (
        <WithGridAnimatedBackgroundWrapper id="hero">
            <div className={cn(zain.variable, 'font-display container mx-auto')}>
                <div className="flex min-h-[100svh] flex-col items-center">
                    <div className="flex w-full grow flex-col items-center justify-center py-6">
                        <div className="flex flex-col gap-y-2 px-4 sm:gap-y-3 md:gap-y-4 lg:items-end lg:justify-center">
                            <ShinyTextAnimation>
                                <h1 className="flex flex-wrap items-center justify-center gap-x-[0.25em] text-[length:clamp(2.75rem,14vw,6rem)] leading-none font-bold sm:text-8xl sm:leading-10 md:text-9xl md:leading-12">
                                    <HeroName
                                        words={[
                                            personGivenName,
                                            personFamilyName,
                                        ]}
                                    />
                                </h1>
                            </ShinyTextAnimation>
                            <p className="self-center text-center text-2xl leading-tight sm:leading-5 lg:self-end lg:pr-[5px]">
                                {professionalTitle}
                            </p>
                        </div>
                        <SocialIcons />
                    </div>
                    <ScrollDownCue />
                </div>
            </div>
        </WithGridAnimatedBackgroundWrapper>
    );
}
