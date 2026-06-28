---
title: 'My Proxmox Home Lab Setup'
description: 'How I run a self-hosted home lab on Proxmox: LXC containers, VMs, networking, and the services I depend on every day.'
date: '2026-04-22'
tags: ['Home Lab', 'Proxmox', 'Self-Hosting']
cover: '/images/articles/proxmox-home-lab.svg'
---

Running my own infrastructure keeps me close to networking, automation, and what it takes to keep software online. Proxmox is the foundation.

## Containers vs. virtual machines

I default to LXC containers for lightweight services and reserve full VMs for workloads that need a real kernel or strict isolation.

## What runs on it

- A reverse proxy terminating TLS for every service.
- A WireGuard tunnel for secure remote access.
- Docker hosts for app stacks.
- Scheduled backups to a separate node.

## Lessons learned

Snapshot before every change, keep configuration in version control, and monitor early. A home lab is the cheapest place to make the mistakes you never want to make in production.

## Provisioning SSH access

A small helper I run to push my public key to a freshly created node:

https://gist.github.com/octocat/2a6851cde24cdaf4b85b
