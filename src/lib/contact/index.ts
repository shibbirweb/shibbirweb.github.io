import { web3formsAccessKey } from '@/config/constants';
import { createWeb3FormsProvider } from '@/lib/contact/providers/web3forms';
import type { ContactProvider } from '@/lib/contact/types';

/**
 * The active contact provider. To switch vendors, import a different
 * `create...Provider` here and assign it; the form and UI stay untouched
 * because they depend only on the ContactProvider contract.
 */
export const contactProvider: ContactProvider = createWeb3FormsProvider({
    accessKey: web3formsAccessKey,
});

export type {
    ContactMessage,
    ContactSubmitResult,
    ContactProvider,
} from '@/lib/contact/types';
