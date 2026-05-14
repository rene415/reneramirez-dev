// Structured resume data — feeds Professional.astro.
// To edit: just change strings here, push, redeploy.

export type Bullet = {
  label: string;       // short headline ('Zero-touch deploys')
  body: string;        // plain-language description
  detail?: string;     // optional resume-flavored detail line
};

export type Job = {
  company: string;
  location: string;
  role: string;
  start: string;       // 'Jan 2025'
  end: string;         // 'Present' or end date
  bullets: Bullet[];
};

export type Stat = {
  value: string;       // '95%', '50+', etc.
  label: string;       // 'less provisioning time'
  context?: string;    // tooltip text on hover
};

export type SkillGroup = {
  group: string;
  items: string[];
};

// ── Resume summary, rewritten in your voice ──────────────────
export const summary = `By day I'm a System Administrator at Mattson Technology in Fremont — automating the boring stuff, locking down endpoints across 5 countries, and keeping the team from drowning in repetitive tickets. Got here by way of five years in IT: starting on the wire in Vegas, running my own consulting company through hundreds of network upgrades, then climbing into the corporate sysadmin chair.`;

// ── Numbers that hit harder than paragraphs ──────────────────
export const stats: Stat[] = [
  { value: '5+',  label: 'years in IT',
    context: 'Field tech → consultant → sysadmin' },
  { value: '95%', label: 'less provisioning time',
    context: 'Cut new-laptop setup from 5 hours to 15 minutes via Windows Autopilot + Intune' },
  { value: '50+', label: 'sites refreshed',
    context: 'Network rebuilds across Grocery Outlet, Marin Housing, JP Morgan Chase, retail clients' },
  { value: '15h', label: 'saved per week',
    context: 'PowerShell + Graph API automation eliminated manual account-sync work' },
];

// ── Experience — plain-language descriptions ─────────────────
export const experience: Job[] = [
  {
    company: 'Mattson Technology',
    location: 'Fremont, CA',
    role: 'System Administrator',
    start: 'Jan 2025',
    end: 'Present',
    bullets: [
      {
        label: 'Zero-touch deploys',
        body: "Built the system that sets up a brand-new Windows laptop with all its apps, settings, and policies automatically when someone logs in for the first time — cut provisioning from 5 hours to 15 minutes.",
        detail: 'Windows Autopilot + Intune, department-specific configs pushed at first sign-in.',
      },
      {
        label: 'Endpoint security, 5 countries',
        body: "Designed 50+ security policies in Intune that lock down work laptops and stop company data from leaking, applied across our offices in Taiwan, Japan, Korea, Mexico, and India.",
        detail: 'Replaced legacy Group Policy with modern Intune DLP rules.',
      },
      {
        label: 'PowerShell automation',
        body: "Wrote scripts that keep user accounts in sync between the cloud and on-premise login systems automatically — saves the IT team about 15 hours every week.",
        detail: 'Microsoft Graph API + hybrid Entra ID ↔ on-prem Active Directory.',
      },
      {
        label: 'Drive encryption + internal tooling',
        body: "Got 85%+ of company laptops encrypted (so a lost laptop isn't a security incident), and stood up a self-hosted wiki for the IT team — central spot for runbooks, status, and project tracking.",
        detail: 'BitLocker / LAPS rollout; replaced licensed wiki SaaS with self-hosted Wiki.js.',
      },
    ],
  },
  {
    company: 'Mattson Technology',
    location: 'Fremont, CA',
    role: 'Desktop Support Technician',
    start: 'Nov 2024',
    end: 'Jan 2025',
    bullets: [
      {
        label: 'Promoted to SysAdmin in 8 months',
        body: "Kept 10–15 minute resolution times on 100+ tickets a month, and ran a 100-device hardware refresh — earned the promotion to System Administrator before the new year.",
      },
    ],
  },
  {
    company: 'Ramdel IT Services',
    location: 'SF Bay Area',
    role: 'Lead IT Technician (founder)',
    start: 'Jan 2022',
    end: 'Jan 2025',
    bullets: [
      {
        label: '50+ Grocery Outlet stores',
        body: "Led network upgrades across 50+ Grocery Outlet locations — worked alongside corporate engineering to fine-tune Wi-Fi placement until connectivity complaints basically stopped.",
        detail: 'Cisco / Juniper APs, retroactive cable plant work.',
      },
      {
        label: 'Enterprise network gear',
        body: "Deployed serious networking hardware for clients that can't be down — including JP Morgan Chase. Cisco Catalyst 9000s, Fortinet firewalls, Juniper, SonicWall.",
      },
      {
        label: 'Built a team',
        body: "Hired and trained junior techs to scale project delivery while still personally handling Tier 1/2 support for key accounts like Marin Housing Authority.",
      },
    ],
  },
  {
    company: 'AMG Tech Support',
    location: 'Las Vegas, NV',
    role: 'IT Field Technician',
    start: 'Mar 2020',
    end: 'Mar 2022',
    bullets: [
      {
        label: 'Hands-on the wire',
        body: "Pulled Cat5e/6 cable, installed demarc points (the wall jack where ISP service meets the building), and managed point-of-sale systems and enterprise hardware across 50+ retail and project sites.",
      },
    ],
  },
];

// ── Stack — grouped for quick scanning ───────────────────────
export const stack: SkillGroup[] = [
  { group: 'Cloud & identity',  items: ['Intune', 'Entra ID', 'Microsoft Graph API', 'Active Directory', 'Windows Autopilot'] },
  { group: 'Network',           items: ['Cisco Catalyst 9000', 'Fortinet', 'Juniper', 'Ubiquiti', 'SonicWall'] },
  { group: 'Scripting',         items: ['PowerShell', 'Ansible', 'Bash', 'Docker Compose'] },
  { group: 'Self-hosted',       items: ['Proxmox VE', 'TrueNAS', 'Docker', 'Cloudflare', 'Twingate'] },
  { group: 'Security',          items: ['BitLocker', 'LAPS', 'DLP', 'VLAN segmentation', 'Zero-trust access'] },
];

// ── Home lab — the meta moment ───────────────────────────────
export const homelab = {
  title: 'Enterprise-grade home data center',
  body: "Proxmox hypervisor running Ubuntu and Windows VMs, 10 GbE backbone with TrueNAS+ZFS storage, micro-segmented VLAN architecture on Unifi to keep IoT / cameras / servers off each other's networks. Twingate VPN for zero-trust admin access, Cloudflare reverse proxies for the public-facing sites, automated offsite replication to Backblaze. R&D sandbox too — I prototype open-source tools here and promote vetted ones into Mattson production. That's how Wiki.js replaced a licensed wiki SaaS.",
  punchline: "This site runs on it.",
};

// ── Certs ────────────────────────────────────────────────────
export const certs = [
  { name: 'CompTIA A+',                       when: 'May 2023' },
  { name: 'Google IT Support Professional',   when: 'Feb 2021' },
];

// ── Resume PDF location (in public/) ─────────────────────────
export const resumePdf = '/professional/' + encodeURIComponent('Rene Ramirez - Resume.pdf');
export const resumeFilename = 'Rene Ramirez - Resume.pdf';
