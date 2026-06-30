'use client';

import { useEffect, useState } from 'react';
import { fetchMeta } from '@/components/admin/api';
import type { StudioMeta } from '@/lib/admin/types';

const EMPTY_META: StudioMeta = { tags: [], categories: [], series: [] };

/** Loads tag / category / series suggestions for the editor's pickers. */
export function useMeta(): StudioMeta {
    const [meta, setMeta] = useState<StudioMeta>(EMPTY_META);
    useEffect(() => {
        let active = true;
        fetchMeta()
            .then((result) => active && setMeta(result))
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);
    return meta;
}
