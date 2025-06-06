import SocialIcons from './SocialIcons';
import WithGridAnimatedBackgroundWrapper from '@/components/wrappers/WithGridAnimatedBackgroundWrapper';

export default function HeroArea() {
    return (
        <WithGridAnimatedBackgroundWrapper>
            <div className="container mx-auto">
                <div className="flex min-h-[100svh] flex-col items-center">
                    <div className="flex w-full grow flex-col items-center justify-center gap-y-8 py-6 sm:gap-y-0">
                        <div className="flex flex-col px-4 md:items-end md:justify-center">
                            <h1 className="flex flex-wrap items-center justify-center gap-x-4 text-8xl leading-16 font-bold min-[22.25rem]:text-9xl min-[22.25rem]:leading-20 sm:text-8xl sm:leading-10 md:text-9xl md:leading-12">
                                <span>Shibbir</span> <span>Ahmed</span>
                            </h1>
                            <p className="self-center text-2xl leading-2 sm:self-end sm:leading-normal">
                                Full Stack Developer
                            </p>
                        </div>
                        <SocialIcons />
                    </div>
                </div>
            </div>
        </WithGridAnimatedBackgroundWrapper>
    );
}
