import type {
    NetworkFlowDefinition,
    NetworkFlowEdge,
    NetworkFlowNode,
} from '@/components/pages/articles/NetworkFlow/types';

// Scenario data for every `netflow` block on the site, keyed by the id written on
// the first line of the fence. Both scenarios of a diagram deliberately share the
// same node grid, so toggling between them changes the route and the outcome
// rather than rearranging the picture.

const dnsThroughVpn: NetworkFlowDefinition = {
    id: 'dns-vpn',
    title: 'How a DNS question travels with the VPN off and with the VPN on',
    scenarios: [
        {
            id: 'vpn-off',
            label: 'VPN off',
            summary: 'With the tunnel down, the router hands out the ISP DNS server, and every question is answered honestly. Nothing is filtered.',
            nodes: [
                {
                    id: 'device',
                    label: 'Desktop',
                    detail: 'asks for a name',
                    description: 'Your device does not choose a DNS server on its own. It uses whatever it was handed, which here is whatever the router says.',
                    column: 0,
                    row: 1,
                },
                {
                    id: 'router',
                    label: 'Router',
                    detail: 'hands out ISP DNS',
                    description: 'The router tells every device on the network which DNS server to use. Since Pi-hole was removed from this setting, that is now the ISP again.',
                    column: 1,
                    row: 1,
                },
                {
                    id: 'isp',
                    label: 'ISP DNS',
                    detail: 'filters nothing',
                    description: 'A normal DNS server. It answers every question it can, including the ones for ad and tracker domains.',
                    column: 2,
                    row: 1,
                },
                {
                    id: 'ad-served',
                    label: 'Ad loads',
                    detail: 'real address returned',
                    description: 'The ad domain resolves to a real address, your browser connects to it, and the ad appears.',
                    column: 3,
                    row: 0,
                    tone: 'blocked',
                },
                {
                    id: 'site-served',
                    label: 'Site loads',
                    detail: 'real address returned',
                    description: 'An ordinary website resolves normally. This half behaves the same whether the VPN is on or off.',
                    column: 3,
                    row: 2,
                    tone: 'allowed',
                },
            ],
            edges: [
                {
                    from: 'device',
                    to: 'router',
                    caption: 'Your device needs an address for a name, so it asks the DNS server it was given: the router.',
                },
                {
                    from: 'router',
                    to: 'isp',
                    caption: 'The router passes the question on to the ISP DNS server. Nothing here knows about blocklists.',
                },
                {
                    from: 'isp',
                    to: 'ad-served',
                    label: 'ad domain',
                    caption: 'An ad domain gets a real, working address back. The browser connects, and the ad loads.',
                    tone: 'blocked',
                },
                {
                    from: 'isp',
                    to: 'site-served',
                    label: 'normal site',
                    caption: 'A normal site also gets its real address, exactly as you would expect.',
                    tone: 'allowed',
                },
            ],
        },
        {
            id: 'vpn-on',
            label: 'VPN on',
            summary: 'The tunnel carries the DNS question to Pi-hole. Ad domains get a useless answer, everything else resolves normally, and the rest of your traffic still goes out the ordinary way.',
            nodes: [
                {
                    id: 'device',
                    label: 'Desktop',
                    detail: 'tunnel is up',
                    description: 'Turning the VPN on applies the DNS setting inside the client file. Turning it off puts the old one back automatically.',
                    column: 0,
                    row: 1,
                    tone: 'secure',
                },
                {
                    id: 'wg',
                    label: 'wg-easy',
                    detail: 'DNS = 192.168.0.20',
                    description: 'The WireGuard server. It does not filter anything itself. Its job is to hand each client Pi-hole as its DNS server.',
                    column: 1,
                    row: 1,
                    tone: 'secure',
                },
                {
                    id: 'pihole',
                    label: 'Pi-hole',
                    detail: '192.168.0.20',
                    description: 'The DNS server that lies on purpose. It checks each name against its blocklists before deciding how to answer.',
                    column: 2,
                    row: 1,
                },
                {
                    id: 'ad-blocked',
                    label: 'Ad blocked',
                    detail: 'nothing here',
                    description: 'Pi-hole answers with no usable address. The browser has nowhere to connect, so the ad never loads and no request is ever made.',
                    column: 3,
                    row: 0,
                    tone: 'blocked',
                },
                {
                    id: 'site-served',
                    label: 'Site loads',
                    detail: 'passed upstream',
                    description: 'Anything not on a blocklist is forwarded to a normal DNS server and answered as usual.',
                    column: 3,
                    row: 2,
                    tone: 'allowed',
                },
            ],
            edges: [
                {
                    from: 'device',
                    to: 'wg',
                    label: 'encrypted',
                    caption: 'The VPN is up, so the DNS question goes into the tunnel instead of to the router. Only the question travels this way, not your web pages.',
                    tone: 'secure',
                },
                {
                    from: 'wg',
                    to: 'pihole',
                    caption: 'wg-easy gave the client Pi-hole as its DNS server, so the question lands there.',
                    tone: 'secure',
                },
                {
                    from: 'pihole',
                    to: 'ad-blocked',
                    label: 'ad domain',
                    caption: 'The name is on a blocklist, so Pi-hole answers with nothing usable. That refusal is the whole ad blocker.',
                    tone: 'blocked',
                },
                {
                    from: 'pihole',
                    to: 'site-served',
                    label: 'normal site',
                    caption: 'Everything else is passed upstream and comes back with its real address, so normal browsing is untouched.',
                    tone: 'allowed',
                },
            ],
        },
    ],
};

// The router-wide arrangement, before any of the VPN work. One scenario, because
// the section describes a single working state rather than something switchable:
// the interest is in the fan-in (every device, configured or not, is handed the
// same resolver) and in what Pi-hole does once the question reaches it.
const routerWidePihole: NetworkFlowDefinition = {
    id: 'router-pihole',
    title: 'How every device on the network reaches Pi-hole through the router',
    scenarios: [
        {
            id: 'router-wide',
            label: 'Router-wide',
            summary: 'One address typed into the router, and every device that joins is handed Pi-hole as its DNS server, including the ones nobody configured.',
            nodes: [
                {
                    id: 'phone',
                    label: 'Phone',
                    description: 'Never told about Pi-hole directly. It simply accepts whatever DNS server the router offers when it joins the WiFi.',
                    column: 0,
                    row: 0,
                },
                {
                    id: 'desktop',
                    label: 'Desktop',
                    description: 'Same story. No network settings were touched on it, and it is filtered anyway.',
                    column: 0,
                    row: 1,
                },
                {
                    id: 'new-device',
                    label: 'Any new device',
                    detail: 'joins the WiFi',
                    description: 'This is the part that makes the router-wide setup so appealing: anything that connects later is covered automatically, with nothing to configure.',
                    column: 0,
                    row: 2,
                },
                {
                    id: 'router',
                    label: 'Router',
                    detail: 'hands out 192.168.0.20',
                    description: 'The single point of control. Its DHCP settings tell every device on the network which DNS server to use, and it was pointed at Pi-hole instead of the ISP.',
                    column: 1,
                    row: 1,
                },
                {
                    id: 'pihole',
                    label: 'Pi-hole',
                    detail: '192.168.0.20',
                    description: 'An LXC container on the Proxmox server. It checks each name against its blocklists and decides whether to give a usable answer. This is also the machine the whole house now depends on.',
                    column: 2,
                    row: 1,
                },
                {
                    id: 'ad-blocked',
                    label: 'Ad blocked',
                    detail: 'nothing here',
                    description: 'Pi-hole answers an ad or tracker domain with no usable address, so the browser never connects and the ad never loads.',
                    column: 3,
                    row: 0,
                    tone: 'blocked',
                },
                {
                    id: 'site-served',
                    label: 'Site loads',
                    detail: 'real address',
                    description: 'Everything not on a blocklist is forwarded upstream and answered normally, so ordinary browsing is unaffected.',
                    column: 3,
                    row: 2,
                    tone: 'allowed',
                },
            ],
            edges: [
                {
                    from: 'phone',
                    to: 'router',
                    caption: 'The phone asks the router for an address, because the router is the DNS server it was handed when it joined.',
                },
                {
                    from: 'desktop',
                    to: 'router',
                    caption: 'The desktop does the same, with no per-device setting involved.',
                },
                {
                    from: 'new-device',
                    to: 'router',
                    caption: 'So does anything that connects for the first time. Nobody has to remember to set it up.',
                },
                {
                    from: 'router',
                    to: 'pihole',
                    label: 'all DNS',
                    caption: 'The router forwards every DNS question to 192.168.0.20. This one setting is what puts Pi-hole in front of the whole network.',
                },
                {
                    from: 'pihole',
                    to: 'ad-blocked',
                    label: 'ad domain',
                    caption: 'A name on a blocklist gets nothing usable back. That refusal is the entire ad blocker.',
                    tone: 'blocked',
                },
                {
                    from: 'pihole',
                    to: 'site-served',
                    label: 'normal site',
                    caption: 'Everything else is passed upstream and answered as usual.',
                    tone: 'allowed',
                },
            ],
        },
    ],
};

// The outage test. Deliberately drawn as two paths leaving the same router rather
// than as a request and a reply: the point of the section is not that one query
// failed, it is that everything except name resolution kept working, which is what
// makes the failure so hard to recognise. A left-to-right grid cannot show a reply
// coming back anyway, so the dead path simply ends in the timeout it produced.
const outageWithoutPihole: NetworkFlowDefinition = {
    id: 'pihole-outage',
    title: 'What still works when the Pi-hole server loses power, and what does not',
    scenarios: [
        {
            id: 'server-off',
            label: 'Server off',
            summary: 'The router is still up on its UPS, so anything addressed by IP behaves perfectly. Only the DNS path is dead, which is why it feels like the internet is down when it is not.',
            nodes: [
                {
                    id: 'phone',
                    label: 'Phone',
                    detail: 'still on the WiFi',
                    description: 'Connected, full signal, nothing on screen suggesting a problem. It is doing exactly what it always does.',
                    column: 0,
                    row: 1,
                },
                {
                    id: 'router',
                    label: 'Router',
                    detail: 'on the UPS, still up',
                    description: 'Untouched by the power cut. It is routing packets perfectly and still handing out Pi-hole as the DNS server, because that is the only address it knows.',
                    column: 1,
                    row: 1,
                },
                {
                    id: 'pihole',
                    label: 'Pi-hole',
                    detail: 'server has no power',
                    description: 'Gone. The LXC container and the Proxmox host under it are both off, so nothing is listening on 192.168.0.20 at all.',
                    column: 2,
                    row: 0,
                    tone: 'blocked',
                },
                {
                    id: 'timeout',
                    label: 'No answer',
                    detail: 'every page fails',
                    description: 'The query gets no reply and eventually times out. Since every site is reached by name, the whole web appears to be down.',
                    column: 3,
                    row: 0,
                    tone: 'blocked',
                },
                {
                    id: 'by-ip',
                    label: 'Ping 1.1.1.1',
                    detail: 'reached by IP',
                    description: 'Anything addressed by number skips DNS completely, so it never touches the missing Pi-hole.',
                    column: 2,
                    row: 2,
                    tone: 'allowed',
                },
                {
                    id: 'replies',
                    label: 'Replies fine',
                    detail: 'network is healthy',
                    description: 'This is the confusing part. Packets flow, the connection is up, the router admin page loads. Every test except a name lookup says everything is fine.',
                    column: 3,
                    row: 2,
                    tone: 'allowed',
                },
            ],
            edges: [
                {
                    from: 'phone',
                    to: 'router',
                    caption: 'The phone asks for an address, the same way it does a thousand times a day.',
                },
                {
                    from: 'router',
                    to: 'pihole',
                    label: 'DNS question',
                    caption: 'The router forwards it to 192.168.0.20, because that is still the only DNS server it has been told about.',
                    tone: 'blocked',
                },
                {
                    from: 'pihole',
                    to: 'timeout',
                    caption: 'Nothing is there to answer. The question goes out and simply stops, and the phone waits until it gives up.',
                    tone: 'blocked',
                },
                {
                    from: 'router',
                    to: 'by-ip',
                    label: 'plain IP',
                    caption: 'Meanwhile anything that already knows its address needs no lookup, so it leaves the router untouched by any of this.',
                    tone: 'allowed',
                },
                {
                    from: 'by-ip',
                    to: 'replies',
                    caption: 'It answers instantly. Both halves of this picture are true at the same moment, and that is exactly why the failure is so hard to place.',
                    tone: 'allowed',
                },
            ],
        },
    ],
};

// The secondary-DNS leak, told three ways. The default scenario runs both branches
// at once, which is the honest picture: the two "sometimes" labels and packets
// moving down both paths together say "unpredictable" better than any wording. The
// other two isolate a single route so it can be followed without the distraction of
// the other one. All three share `secondaryDnsNodes`, so the grid cannot shift when
// the reader toggles; the branch that is not in play simply has no edges and the
// scene fades it back automatically. Green marks the path that behaves as intended,
// red the one that quietly defeats the whole setup.
const secondaryDnsNodes: NetworkFlowNode[] = [
    {
        id: 'phone',
        label: 'Phone',
        detail: 'asks for a name',
        description: 'It was handed two DNS servers and is free to use either. Nothing obliges it to prefer the first, and different devices make different choices.',
        column: 0,
        row: 1,
    },
    {
        id: 'router',
        label: 'Router',
        detail: 'two DNS servers set',
        description: 'Pi-hole is listed first and a public resolver second. That order looks like a priority, but it is only a list, and nothing enforces it.',
        column: 1,
        row: 1,
    },
    {
        id: 'pihole',
        label: 'Pi-hole',
        detail: '192.168.0.20',
        description: 'When the query happens to land here, filtering works exactly as intended. This is the case people test, see working, and assume is the rule.',
        column: 2,
        row: 0,
        tone: 'secure',
    },
    {
        id: 'blocked',
        label: 'Ad blocked',
        detail: 'as intended',
        description: 'The outcome you set the whole thing up for. It just is not the only outcome.',
        column: 3,
        row: 0,
        tone: 'secure',
    },
    {
        id: 'public',
        label: 'Public DNS',
        detail: '1.1.1.1',
        description: 'A large public resolver on the open internet, usually quicker to answer than a small container at home doing blocklist lookups. Speed is often exactly what decides the race.',
        column: 2,
        row: 2,
        tone: 'blocked',
    },
    {
        id: 'served',
        label: 'Ad shows up',
        detail: 'the leak',
        description: 'It knows nothing about your blocklists, so the ad domain resolves normally and the ad loads. Worse, the answer is cached, so the leak outlives the query that caused it.',
        column: 3,
        row: 2,
        tone: 'blocked',
    },
];

/** The hop every scenario of the leak diagram starts with. */
const leakFirstHop: NetworkFlowEdge = {
    from: 'phone',
    to: 'router',
    caption: 'The device needs an address and turns to the DNS servers it was given.',
};

const leakPrimaryHops: NetworkFlowEdge[] = [
    {
        from: 'router',
        to: 'pihole',
        label: 'sometimes',
        caption: 'Some of the time the question reaches Pi-hole, and everything behaves the way you designed it.',
        tone: 'secure',
    },
    {
        from: 'pihole',
        to: 'blocked',
        caption: 'The name is refused, the ad never loads, and the setup looks like it is working.',
        tone: 'secure',
    },
];

const leakAlternativeHops: NetworkFlowEdge[] = [
    {
        from: 'router',
        to: 'public',
        label: 'sometimes',
        caption: 'The rest of the time it goes straight to the public resolver. Some devices try both at once and keep whichever replies first, and the public one usually wins.',
        tone: 'blocked',
    },
    {
        from: 'public',
        to: 'served',
        caption: 'That answer is honest, complete, and unfiltered, so the ad loads exactly as it would with no Pi-hole at all.',
        tone: 'blocked',
    },
];

const secondaryDnsLeak: NetworkFlowDefinition = {
    id: 'secondary-dns',
    title: 'Why a second DNS server in the router leaks instead of failing over',
    scenarios: [
        {
            id: 'either',
            label: 'Both',
            summary: 'A second DNS server is not a backup waiting its turn. A device may use either one at any moment, so the same domain is blocked now and not blocked ten minutes from now.',
            nodes: secondaryDnsNodes,
            edges: [leakFirstHop, ...leakPrimaryHops, ...leakAlternativeHops],
        },
        {
            id: 'primary',
            label: 'Primary DNS',
            summary: 'The lucky path. The question reaches Pi-hole, the ad domain is refused, and everything looks like it is working. This is the run people test and then trust.',
            nodes: secondaryDnsNodes,
            edges: [leakFirstHop, ...leakPrimaryHops],
        },
        {
            id: 'alternative',
            label: 'Alternative DNS',
            summary: 'The same request, the same second, a different answer. Nothing reaches Pi-hole, so nothing is filtered, and no error is reported anywhere.',
            nodes: secondaryDnsNodes,
            edges: [leakFirstHop, ...leakAlternativeHops],
        },
    ],
};
export const networkFlowDefinitions: NetworkFlowDefinition[] = [
    dnsThroughVpn,
    routerWidePihole,
    outageWithoutPihole,
    secondaryDnsLeak,
];

/** Looks up a diagram by the id written on the first line of a `netflow` fence. */
export function findNetworkFlowDefinition(
    id: string
): NetworkFlowDefinition | undefined {
    return networkFlowDefinitions.find((definition) => definition.id === id);
}
