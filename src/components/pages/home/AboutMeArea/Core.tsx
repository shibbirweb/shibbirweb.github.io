import ExportedImage from 'next-image-export-optimizer';

// The central node of the diagram: the portrait with a soft accent glow. No
// name/title/quote, the portrait itself is the hub the facets wire into.
export default function Core() {
    return (
        <div className="relative z-10 flex justify-center lg:col-start-2 lg:row-start-2">
            <div className="relative">
                {/* Glow hues are aligned to the corners so each connector line
                    leaves a glow of its own colour: blue (top-left, Craft),
                    emerald (top-right, Range), rose (bottom-right, End to end),
                    orange (bottom-left, Now). */}
                <span
                    aria-hidden
                    className="absolute -inset-4 rounded-full opacity-60 blur-2xl"
                    style={{
                        backgroundImage:
                            'conic-gradient(from -45deg, var(--color-blue-500), var(--color-emerald-500), var(--color-rose-500), var(--color-orange-500), var(--color-blue-500))',
                    }}
                />
                <ExportedImage
                    src="images/shibbir-ahmed.jpg"
                    alt="Portrait of MD. Shibbir Ahmed"
                    width={224}
                    height={224}
                    className="ring-background relative size-40 rounded-full object-cover shadow-xl ring-4 sm:size-48"
                />
            </div>
        </div>
    );
}
