import ExportedImage from 'next-image-export-optimizer';
import styles from '@/components/pages/home/AboutMeArea/Core.module.css';

// The central node of the diagram: the portrait with a soft, slowly pulsing
// accent glow. No name/title/quote, the portrait itself is the hub the facets
// wire into.
export default function Core() {
    return (
        <div className="relative z-10 flex justify-center lg:col-start-2 lg:row-start-2">
            <div className="relative">
                <span
                    aria-hidden
                    className={styles.glow}
                />
                <ExportedImage
                    src="images/shibbir-ahmed.jpg"
                    alt="Portrait of MD. Shibbir Ahmed"
                    width={224}
                    height={224}
                    draggable={false}
                    className="ring-background relative size-40 rounded-full object-cover shadow-xl ring-4 select-none [-webkit-user-drag:none] sm:size-48"
                />
            </div>
        </div>
    );
}
