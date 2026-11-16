import { describe, expect, it } from 'vitest';
import { experienceSubline } from '@/components/pages/resume/experienceSubline';
import type { ExperienceEntry } from '@/components/pages/resume/types';

const entry: ExperienceEntry = {
    company: 'Acme',
    location: 'Dhaka, Bangladesh',
    positions: [],
};

describe('experienceSubline', () => {
    it('joins the location and the earlier titles with a middot', () => {
        expect(
            experienceSubline(entry, {
                role: 'Senior Engineer',
                period: '2022 - Present',
                promotedFrom: ['Intern', 'Engineer'],
            })
        ).toBe('Dhaka, Bangladesh · Promoted from Intern, Engineer');
    });

    it('returns only the location when there was no promotion', () => {
        expect(
            experienceSubline(entry, { role: 'Engineer', period: '2021' })
        ).toBe('Dhaka, Bangladesh');
    });

    it('treats an empty promotion list as no promotion', () => {
        expect(
            experienceSubline(entry, {
                role: 'Engineer',
                period: '2021',
                promotedFrom: [],
            })
        ).toBe('Dhaka, Bangladesh');
    });

    it('returns only the promotion when the location is missing', () => {
        expect(
            experienceSubline(
                { ...entry, location: undefined },
                { role: 'Lead', period: '2023', promotedFrom: ['Engineer'] }
            )
        ).toBe('Promoted from Engineer');
    });

    it('leads with the role context when there is one', () => {
        expect(
            experienceSubline(entry, {
                role: 'Engineer',
                period: '2021',
                context: 'Acme Portal, a booking platform',
                promotedFrom: ['Intern'],
            })
        ).toBe(
            'Acme Portal, a booking platform · Dhaka, Bangladesh · Promoted from Intern'
        );
    });

    it('returns an empty string when there is nothing to show', () => {
        expect(
            experienceSubline(
                { ...entry, location: undefined },
                { role: 'Engineer', period: '2021' }
            )
        ).toBe('');
    });
});
