/** A social platform the reader can share the article to (Copy link and the
 *  native share sheet are handled specially inside the component). */
export type ShareTarget = {
    name: string;
    Icon: React.ElementType;
    buildShareUrl: (params: { url: string; title: string }) => string;
    /** Per-brand hover tint, mirroring the hero SocialIcons colours. */
    brandHoverClassName?: string;
};
