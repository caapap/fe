export const M1_MENU_KEYS = ['/collect-configs', '/network-devices', '/collect-templates', '/heartbeat-mgmt', '/heartbeat-status', '/pingmesh'];

export const isM1MenuPath = (pathname: string) => M1_MENU_KEYS.some((key) => pathname === key || pathname.startsWith(`${key}/`));
