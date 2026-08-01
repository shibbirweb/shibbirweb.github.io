---
title: 'Using Pi-hole Without Pinning My Whole Network to One DNS Server'
description: 'I put Pi-hole in my router, and my little Proxmox server became the thing the whole house depended on. Here is how a WireGuard VPN turned ad blocking into a switch I can turn on and off per device.'
date: '2026-08-01'
tags: ['Pi-hole', 'WireGuard', 'Proxmox', 'DNS', 'Homelab', 'Self-Hosting']
category: 'Homelab'
difficulty: 'Intermediate'
tech: ['Proxmox', 'Pi-hole', 'WireGuard', 'wg-easy', 'Docker']
learn:
    - 'What a DNS server actually does, and why Pi-hole blocks ads by simply refusing to answer some questions.'
    - 'Why putting Pi-hole in your router makes one small machine the thing every device in the house depends on.'
    - 'Why adding a second DNS server in the router does not give you a backup, and instead lets ads slip through at random.'
    - 'How a WireGuard config file carries its own DNS setting, so turning the VPN on and off also turns ad blocking on and off.'
    - 'How to run wg-easy in a Proxmox LXC container and point it at Pi-hole, including the container settings WireGuard needs.'
    - 'Why you do not need to send all your traffic through the VPN for this to work, and the one Pi-hole setting that silently ignores VPN clients.'
---

My Proxmox server sits in the corner of my room. The best thing running on it is Pi-hole. It is a small container with one job: it answers DNS questions, and it refuses to answer the ones that belong to ads.

I typed its IP address into my router once. After that, every device in my house stopped seeing ads, and none of them had to be told anything.

Then one day I looked at that setup and thought: what happens when this server is off? I did not wait to find out by accident. I walked over and cut its power to see.

## One line in my router, and all the ads were gone

Let me explain the piece that everything here depends on.

Every time you open a website, your device asks a question first: "what is the IP address for this name?" The thing that answers is called a DNS server. Your device cannot reach anything by name until something answers that question.

Pi-hole is a DNS server that lies on purpose. When the question is about an ad or tracker domain, Pi-hole answers "nothing here". Your browser then has nowhere to connect, so the ad never loads. It never sees your traffic and it never blocks anything else. It just gives a useless answer to questions it does not like.

My setup was the normal one. Pi-hole runs in an LXC container on my Proxmox server with a fixed address, `192.168.0.20`. In my router settings, I removed my ISP's DNS servers and put that one address instead. From then on, the router told every device that joined the WiFi to use Pi-hole.

```reactflow
title: How every device on the network reaches Pi-hole through the router

scenario "Router-wide"
> One address typed into the router, and every device that joins is handed Pi-hole as its DNS server, including the ones nobody configured.

Phone
> Never told about Pi-hole directly. It simply accepts whatever DNS server the router offers when it joins the WiFi.

Desktop
> Same story. No network settings were touched on it, and it is filtered anyway.

Any new device [joins the WiFi]
> This is the part that makes the router-wide setup so appealing: anything that connects later is covered automatically, with nothing to configure.

Router [hands out 192.168.0.20]
> The single point of control. Its DHCP settings tell every device on the network which DNS server to use, and it was pointed at Pi-hole instead of the ISP.

Pi-hole [192.168.0.20]
> An LXC container on the Proxmox server. It checks each name against its blocklists and decides whether to give a usable answer. This is also the machine the whole house now depends on.

Ad blocked [nothing here] {blocked}
> Pi-hole answers an ad or tracker domain with no usable address, so the browser never connects and the ad never loads.

Site loads [real address] {allowed}
> Everything not on a blocklist is forwarded upstream and answered normally, so ordinary browsing is unaffected.

Phone --> Router
> The phone asks the router for an address, because the router is the DNS server it was handed when it joined.

Desktop --> Router
> The desktop does the same, with no per-device setting involved.

Any new device --> Router
> So does anything that connects for the first time. Nobody has to remember to set it up.

Router --> Pi-hole (all DNS)
> The router forwards every DNS question to 192.168.0.20. This one setting is what puts Pi-hole in front of the whole network.

Pi-hole --> Ad blocked (ad domain) {blocked}
> A name on a blocklist gets nothing usable back. That refusal is the entire ad blocker.

Pi-hole --> Site loads (normal site) {allowed}
> Everything else is passed upstream and answered as usual.

mermaid:
    flowchart LR
        Phone["Phone"] --> Router
        Desktop["Desktop"] --> Router
        NewDevice["Any new device"] --> Router
        Router["Router<br/>hands out 192.168.0.20"] -->|"every DNS question"| Pihole["Pi-hole<br/>192.168.0.20"]
        Pihole -->|"it is an ad"| Blocked["Answers: nothing here"]
        Pihole -->|"everything else"| Upstream["Normal DNS server"]
```

One setting, and everything on the network was covered. Devices I never touched. Devices that have no way to block ads on their own. Anything that connected later, without me doing a thing.

## I turned the server off on purpose to see what would break

Power cuts are normal here, so this was not a hard thing to imagine. What made me stop and think was which machines survive one.

My router is plugged into a small UPS. When the electricity goes, the router keeps running. The WiFi stays on. The line to my ISP stays up.

My Proxmox server is not on a UPS. It is my playground machine. I create containers on it, break them, and delete them. I reboot it when I change the wrong thing. It has no backup power, because it is a hobby machine.

So on paper, a power cut leaves me with a working router and no Pi-hole. And Pi-hole was the only DNS server every device in the house knew about.

I wanted to see it rather than assume it, so I switched the server off myself and picked up my phone.

```reactflow
title: What still works when the Pi-hole server loses power, and what does not

scenario "Server off"
> The router is still up on its UPS, so anything addressed by IP behaves perfectly. Only the DNS path is dead, which is why it feels like the internet is down when it is not.

Phone [still on the WiFi]
> Connected, full signal, nothing on screen suggesting a problem. It is doing exactly what it always does.

Router [on the UPS, still up]
> Untouched by the power cut. It is routing packets perfectly and still handing out Pi-hole as the DNS server, because that is the only address it knows.

Pi-hole [server has no power] {blocked}
> Gone. The LXC container and the Proxmox host under it are both off, so nothing is listening on 192.168.0.20 at all.

No answer [every page fails] {blocked}
> The query gets no reply and eventually times out. Since every site is reached by name, the whole web appears to be down.

Ping 1.1.1.1 [reached by IP] {allowed}
> Anything addressed by number skips DNS completely, so it never touches the missing Pi-hole.

Replies fine [network is healthy] {allowed}
> This is the confusing part. Packets flow, the connection is up, the router admin page loads. Every test except a name lookup says everything is fine.

Phone --> Router
> The phone asks for an address, the same way it does a thousand times a day.

Router --> Pi-hole (DNS question) {blocked}
> The router forwards it to 192.168.0.20, because that is still the only DNS server it has been told about.

Pi-hole --> No answer {blocked}
> Nothing is there to answer. The question goes out and simply stops, and the phone waits until it gives up.

Router --> Ping 1.1.1.1 (plain IP) {allowed}
> Meanwhile anything that already knows its address needs no lookup, so it leaves the router untouched by any of this.

Ping 1.1.1.1 --> Replies fine {allowed}
> It answers instantly. Both halves of this picture are true at the same moment, and that is exactly why the failure is so hard to place.

mermaid:
    sequenceDiagram
        participant Phone
        participant Router as Router (on UPS, still running)
        participant Pihole as Pi-hole (server has no power)
        Phone->>Router: Where is example.com?
        Router->>Pihole: Where is example.com?
        Note over Pihole: server is off
        Router--xPhone: no answer, then a timeout
        Note over Phone: WiFi works. Router works.<br/>But no website opens.
```

It was worse than I expected, and that is the useful part of doing the test.

I knew websites would stop opening. What I had not pictured was how healthy everything else would look. The WiFi icon was full. The router page opened fine, because you reach it by IP address. `1.1.1.1` answered every ping. The network was working perfectly. Only names had stopped working, and since we reach everything by name, it felt exactly like having no internet at all.

If that had happened during a real power cut, at night, I would not have started by suspecting DNS. I would have blamed the ISP and wasted an hour. Knowing that in advance was worth the two minutes the test took.

And it was not only power cuts. Every time I rebooted that container to change a setting, I was taking DNS away from everyone in the house. My toy machine had quietly become something the whole home depended on.

## Adding a second DNS server made it worse

The first idea everybody has is simple. Keep Pi-hole as the first DNS server in the router, and add a public one like `1.1.1.1` as the second. If the first one dies, the second takes over.

That sounds right, but it is not how it works.

A second DNS server is not a backup that waits its turn. Your device is free to use either one, whenever it wants. Some devices try them in order. Some ask both at the same time and use whichever replies first. Some remember which one was faster and keep using that one. A big public DNS server is usually faster than a small container in your house.

```reactflow
title: Why a second DNS server in the router leaks instead of failing over

Phone [asks for a name]
> It was handed two DNS servers and is free to use either. Nothing obliges it to prefer the first, and different devices make different choices.

Router [two DNS servers set]
> Pi-hole is listed first and a public resolver second. That order looks like a priority, but it is only a list, and nothing enforces it.

Pi-hole [192.168.0.20] {secure}
> When the query happens to land here, filtering works exactly as intended. This is the case people test, see working, and assume is the rule.

Ad blocked [as intended] {secure}
> The outcome you set the whole thing up for. It just is not the only outcome.

Public DNS [1.1.1.1] {blocked}
> A large public resolver on the open internet, usually quicker to answer than a small container at home doing blocklist lookups. Speed is often exactly what decides the race.

Ad shows up [the leak] {blocked}
> It knows nothing about your blocklists, so the ad domain resolves normally and the ad loads. Worse, the answer is cached, so the leak outlives the query that caused it.

scenario "Both"
> A second DNS server is not a backup waiting its turn. A device may use either one at any moment, so the same domain is blocked now and not blocked ten minutes from now.

Phone --> Router
> The device needs an address and turns to the DNS servers it was given.

Router --> Pi-hole (sometimes) {secure}
> Some of the time the question reaches Pi-hole, and everything behaves the way you designed it.

Pi-hole --> Ad blocked {secure}
> The name is refused, the ad never loads, and the setup looks like it is working.

Router --> Public DNS (sometimes) {blocked}
> The rest of the time it goes straight to the public resolver. Some devices try both at once and keep whichever replies first, and the public one usually wins.

Public DNS --> Ad shows up {blocked}
> That answer is honest, complete, and unfiltered, so the ad loads exactly as it would with no Pi-hole at all.

mermaid:
    flowchart LR
        Device["Phone"] --> Router["Router<br/>first: 192.168.0.20<br/>second: 1.1.1.1"]
        Router -->|"sometimes"| Pihole["Pi-hole<br/>ad blocked"]
        Router -->|"sometimes"| Public["Public DNS<br/>ad shows up"]

scenario "Primary DNS"
> The lucky path. The question reaches Pi-hole, the ad domain is refused, and everything looks like it is working. This is the run people test and then trust.

Phone --> Router
Router --> Pi-hole
Pi-hole --> Ad blocked

mermaid:
    flowchart LR
        Device["Phone"] --> Router["Router<br/>first: 192.168.0.20"]
        Router -->|"reached Pi-hole"| Pihole["Pi-hole<br/>192.168.0.20"]
        Pihole -->|"on a blocklist"| Blocked["Ad blocked<br/>as intended"]

scenario "Alternative DNS"
> The same request, the same second, a different answer. Nothing reaches Pi-hole, so nothing is filtered, and no error is reported anywhere.

Phone --> Router
Router --> Public DNS
Public DNS --> Ad shows up

mermaid:
    flowchart LR
        Device["Phone"] --> Router["Router<br/>second: 1.1.1.1"]
        Router -->|"skipped Pi-hole"| Public["Public DNS<br/>1.1.1.1"]
        Public -->|"knows no blocklists"| Served["Ad shows up<br/>the leak"]
```

So you do not get a backup. You get leaks. Some questions skip Pi-hole completely. Ads come back, but only sometimes. A local name works on one device and not on another. And because answers get cached, the same website is blocked in the morning and not blocked in the afternoon.

> **Note:** This is why the Pi-hole docs tell you to set only one DNS server. A clear failure is annoying, but you fix it in five minutes. A random failure that comes and goes will eat your whole evening, and you still will not be sure you understood it.

So the choice was simple: one DNS server in the router, or none at all.

## I set the DNS by hand on each device, and hated it

If the router cannot hold the setting, the devices can. I could leave the router on my ISP's DNS, so nothing in the house depends on my server, and set Pi-hole by hand only on my own devices.

That works. I did it. It is also painful in a way you only feel by the third device.

Every system hides the setting somewhere different. On Android it is inside the saved WiFi network's advanced settings, and it only applies to that one network. On iPhone it is also per network. On Windows it is in the adapter settings, and the WiFi and the cable port each need their own copy. If a machine uses both, that is two settings that have to agree.

Then comes the part that finished me off. When Pi-hole is actually down, and it is down because I am rebuilding it on purpose, every device I configured is now broken. I have to go back to each one and undo the setting, then set it again later.

I had turned one big problem into four small ones, and given myself manual work at both ends.

What I really wanted was a switch. Turn filtering on when I want it. Turn it off when I do not. No network settings, and something else should clean up after me.

## The idea: let the VPN carry the DNS setting

The answer was in a line I had been ignoring for years.

A WireGuard config file has a `DNS =` line in it. When you turn the VPN on, your device starts using that DNS server. When you turn the VPN off, your device goes back to whatever it was using before. Every WireGuard app on every platform does this automatically.

That is exactly the switch I wanted. It already exists. It is one tap on a phone. And it puts the old setting back by itself.

The only missing piece was a WireGuard server in my house that would tell its clients "use the Pi-hole next door".

So I added a second LXC container on the same Proxmox server, running [wg-easy](https://github.com/wg-easy/wg-easy).

## Setting up wg-easy in a second container

wg-easy is WireGuard plus a small web page for managing it. That web page is the reason I chose it. Adding a new device means typing a name and scanning a QR code with your phone, instead of copying keys around by hand.

I run it with Docker inside its own LXC container. Two things must be true about the container before WireGuard will work inside it:

```ini title="/etc/pve/lxc/<container-id>.conf"
features: nesting=1,keyctl=1
lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```

The first line lets Docker run inside the container at all. The other two give the container access to `/dev/net/tun`, which WireGuard needs to create its network interface. Without them you get a confusing error at startup that looks like a permission problem, because it is one.

Then the Docker setup. The one line this whole article is about is `WG_DEFAULT_DNS`:

```yaml title="docker-compose.yml"
services:
    wg-easy:
        image: ghcr.io/wg-easy/wg-easy:14
        container_name: wg-easy
        environment:
            - WG_HOST=192.168.0.21
            - PASSWORD_HASH=<hash for the web page login>
            - WG_DEFAULT_ADDRESS=10.8.0.x
            - WG_DEFAULT_DNS=192.168.0.20
            - WG_ALLOWED_IPS=10.8.0.0/24, 192.168.0.20/32
            - WG_PERSISTENT_KEEPALIVE=25
        volumes:
            - ./etc_wireguard:/etc/wireguard
        ports:
            - '51820:51820/udp'
            - '51821:51821/tcp'
        cap_add:
            - NET_ADMIN
            - SYS_MODULE
        sysctls:
            - net.ipv4.ip_forward=1
            - net.ipv4.conf.all.src_valid_mark=1
        restart: unless-stopped
```

`WG_DEFAULT_DNS` is the Pi-hole's address. wg-easy writes it into the `DNS =` line of every client file it creates. So every device I add gets filtered DNS for as long as its VPN is on, and normal DNS the moment it turns off. Newer versions of wg-easy ask for this in the web setup instead of an environment variable, but it is the same setting doing the same job.

`WG_HOST` is the address my devices dial to reach the VPN. Mine is `192.168.0.21`, the container's own address on my home network, because I only use this at home. That is worth saying clearly: this VPN never leaves the house. There is no port forwarded in my router and nothing of mine is reachable from the internet. It is a VPN used purely as a way to choose my DNS server, not as a way to get home from outside.

I also set the container itself to use Pi-hole as its DNS, so anything the box looks up is filtered too.

> **Note:** If you do want to reach this from outside your home, `WG_HOST` becomes a public address instead, and you need three more things: a forwarded UDP port in your router, a dynamic DNS hostname (home connections rarely keep the same public IP), and an ISP that actually gives you a public IP. Many home and mobile connections share one public address between lots of customers, called CGNAT, and there port forwarding cannot work at all. None of that is needed for what this article does.

> **Warning:** The wg-easy web page on port `51821` can manage your whole VPN. Keep it on your home network and never forward that port in your router.

## The two lines that matter in the client file

Here is what a client file looks like:

```ini title="phone.conf"
[Interface]
PrivateKey = <client private key>
Address = 10.8.0.2/24
DNS = 192.168.0.20

[Peer]
PublicKey = <server public key>
PresharedKey = <preshared key>
AllowedIPs = 10.8.0.0/24, 192.168.0.20/32
Endpoint = 192.168.0.21:51820
PersistentKeepalive = 25
```

`DNS` is the switch. That is the ad blocking, right there.

`AllowedIPs` is the interesting one. It decides which traffic goes through the VPN, and you need far less than you might think.

Look at what is listed: the VPN's own range, and one single address, the Pi-hole. That is all. DNS questions go through the tunnel. Everything else, the actual web pages, the videos, the app data, goes out the normal way as if the VPN were not running. You are not sending your internet through your house. You are only sending the questions.

That `/32` on the end matters more than it looks. It means "this one address only". You might expect to write the whole home range, `192.168.0.0/24`, instead. Do not, at least not while you are sitting on that same network. Your device is already on `192.168.0.0/24`, and so is the VPN server itself at `192.168.0.21`. Telling WireGuard to send that entire range into the tunnel includes the address the tunnel needs in order to work, which is a loop. A single-host route to the Pi-hole is more specific than your normal network route, so DNS follows the tunnel and nothing else changes.

Everything else at home stays directly reachable, because you are already on the same network as it. The tunnel is not there to carry you home. It is there to change which DNS server you use.

Here is the whole thing in one picture. Flip the tunnel on and off to see the route change, step through it a hop at a time, or select any box to read what it does:

```reactflow
title: How a DNS question travels with the VPN off and with the VPN on

Desktop
> Your device does not choose a DNS server on its own. With the tunnel down it uses whatever the router says; with the tunnel up it uses whatever the VPN client file says.

Router [hands out ISP DNS]
> The router tells every device on the network which DNS server to use. Since Pi-hole was removed from this setting, that is now the ISP again.

ISP DNS [filters nothing]
> A normal DNS server. It answers every question it can, including the ones for ad and tracker domains.

Ad loads [real address returned] {blocked}
> The ad domain resolves to a real address, your browser connects to it, and the ad appears.

wg-easy [DNS = 192.168.0.20] {secure}
> The WireGuard server. It does not filter anything itself. Its job is to hand each client Pi-hole as its DNS server.

Pi-hole [192.168.0.20]
> The DNS server that lies on purpose. It checks each name against its blocklists before deciding how to answer.

Ad blocked [nothing here] {blocked}
> Pi-hole answers with no usable address. The browser has nowhere to connect, so the ad never loads and no request is ever made.

Site loads [resolves normally] {allowed}
> An ordinary website resolves the same way either way. This half of the picture does not change when you flip the tunnel.

scenario "VPN off"
> With the tunnel down, the router hands out the ISP DNS server, and every question is answered honestly. Nothing is filtered.

Desktop --> Router
> Your device needs an address for a name, so it asks the DNS server it was given: the router.

Router --> ISP DNS
> The router passes the question on to the ISP DNS server. Nothing here knows about blocklists.

ISP DNS --> Ad loads (ad domain) {blocked}
> An ad domain gets a real, working address back. The browser connects, and the ad loads.

ISP DNS --> Site loads (normal site) {allowed}
> A normal site also gets its real address, exactly as you would expect.

mermaid:
    flowchart LR
        Desktop["Desktop"] --> Router["Router<br/>hands out ISP DNS"]
        Router --> IspDns["ISP DNS<br/>filters nothing"]
        IspDns -->|"ad domain"| AdLoads["Ad loads<br/>real address returned"]
        IspDns -->|"normal site"| SiteLoads["Site loads<br/>resolves normally"]

scenario "VPN on"
> The tunnel carries the DNS question to Pi-hole. Ad domains get a useless answer, everything else resolves normally, and the rest of your traffic still goes out the ordinary way.

Desktop --> wg-easy (encrypted) {secure}
> The VPN is up, so the DNS question goes into the tunnel instead of to the router. Only the question travels this way, not your web pages.

wg-easy --> Pi-hole {secure}
> wg-easy gave the client Pi-hole as its DNS server, so the question lands there.

Pi-hole --> Ad blocked (ad domain) {blocked}
> The name is on a blocklist, so Pi-hole answers with nothing usable. That refusal is the whole ad blocker.

Pi-hole --> Site loads (normal site) {allowed}
> Everything else is passed upstream and comes back with its real address, so normal browsing is untouched.

mermaid:
    flowchart LR
        Desktop["Desktop"] -->|"encrypted"| Wg["wg-easy<br/>DNS = 192.168.0.20"]
        Wg --> Pihole["Pi-hole<br/>192.168.0.20"]
        Pihole -->|"ad domain"| Blocked["Ad blocked<br/>nothing here"]
        Pihole -->|"normal site"| SiteLoads["Site loads<br/>resolves normally"]
```

And my router went back to my ISP's DNS servers. Nothing in the house depends on the Proxmox box any more.

## Pi-hole ignores the VPN until you tell it not to

There is one setting that will make all of this look broken while every part of it is actually working. It is worth knowing before you lose an evening to it.

By default, Pi-hole only answers devices on its own network. VPN clients are on `10.8.0.0/24`. Pi-hole is on `192.168.0.0/24`. Those are different networks. If the questions arrive with their original address, Pi-hole treats them as strangers and throws them away without replying. Your VPN connects fine and nothing resolves.

There are two ways around it, and they are a real trade-off:

- **Let wg-easy rewrite the addresses.** This is the default behavior. The container replaces the sender address on VPN traffic with its own home network address. Pi-hole then sees a neighbor asking, and answers normally. Nothing to configure. The cost is that all your VPN devices look like one device in the Pi-hole logs, so you lose per-device statistics.
- **Turn that off and let Pi-hole accept everyone.** Add a route in your router for `10.8.0.0/24` pointing at the wg-easy container, stop rewriting addresses, and change Pi-hole's setting to permit all origins. Now each device keeps its own address and shows up separately in the logs. It is more setup, and it only makes sense because Pi-hole is not reachable from outside your home.

> **Note:** If you choose the second option, make sure Pi-hole really is unreachable from the internet. A DNS server that answers anybody gets found quickly and used by strangers to attack other people. Permitting all origins is a decision about your home network, not about the internet.

## A bonus: my machines have names now

I did not plan this part, and it is the thing I use most.

Pi-hole can hold your own DNS names, pointing at addresses in your home. So I stopped remembering IP addresses:

| Name          | Goes to              |
| ------------- | -------------------- |
| `pve.home`    | the Proxmox server   |
| `pihole.home` | the Pi-hole web page |
| `vpn.home`    | the wg-easy web page |

Names like these only work if you are asking a DNS server that knows about them. Once I took Pi-hole out of the router, they stopped working, because my devices were asking my ISP and my ISP has never heard of `pve.home`.

Now they come back with the VPN. Turn it on, and my own names work again alongside the ad blocking. Turn it off, and they quietly stop. Same single switch, doing both jobs.

## What this still does not fix

I want to be honest about the holes, because there are several.

- **Anything that cannot run WireGuard is no longer covered.** A device with no VPN app, or one you cannot install software on, now uses my ISP's DNS and nobody filters it. The old setup covered every device on the network without asking any of them. This one only covers the devices I set up by hand.
- **Blocking is off by default now.** If the VPN is off, I see ads. That is the whole design, but it is also its weakest part, because a switch only helps when you remember it is there.
- **It only works at home.** My VPN server has no public address, so I cannot turn this on from mobile data or someone else's WiFi. Away from home I get my ads back. Opening it up would mean forwarding a port and depending on my ISP giving me a public address, and I did not want either.
- **The Proxmox server can still fail, but it costs much less.** If it is off, the VPN does not connect. That is it. Before, the whole house lost DNS while the router sat there on its UPS looking perfectly healthy.
- **Browsers can go around it.** Chrome and Firefox have a "secure DNS" feature that sends DNS questions straight to their own server over HTTPS and ignores your system setting. If you still see ads with the VPN on, check that first.
- **This is not a proper backup plan.** The real fix for my original problem is a second Pi-hole on a small machine that always stays on. I did not build that, because it means another box and keeping two blocklists in sync.

## Not perfect, but right for me

None of this is the correct solution, and I know it. The correct solution is two DNS servers on hardware that stays up.

But what I built did something more useful to me than being correct. It changed how much breaks when things go wrong.

The real question was never "how do I block ads". It was "what happens when my playground server goes down". The old answer was "everything stops, for everyone in the house, in the most confusing way possible". The new answer is "a switch on my own devices stops working, and I am the only one who notices".

I still get my ad blocking. I still get my own names for my own machines. My router holds a setting that keeps working no matter what I am breaking on the server. The whole cost is one toggle I press about once a day and mostly forget about.

Some homelab work is about building the right thing. Some of it is about noticing which failures you can live with. This was the second kind, and for the way I actually use my network, it is enough.
