import { JsonLdScriptComponent } from '@/components/utils/JsonLdScriptComponent';
import HeroArea from './_root/hero-area';

export default function Home() {
    return (
        <section>
            {process.env.NODE_ENV === 'production' ? (
                <JsonLdScriptComponent />
            ) : null}
            <HeroArea />

            {/* <div
                id="about"
                className="flex h-screen flex-col items-center justify-center"
            >
                <p className="text-2xl font-bold">
                    I&apos;m a software engineer with a passion for building web
                    applications that are both functional and aesthetically
                    pleasing.
                </p>
            </div> */}
        </section>
    );
}
