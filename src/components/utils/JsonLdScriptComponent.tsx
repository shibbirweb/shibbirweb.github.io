import { jsonLd } from '@/utils/jsonLd';

export const JsonLdScriptComponent = () => {
    return (
        <script
            id="jsonld-person"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
            }}
        />
    );
};
