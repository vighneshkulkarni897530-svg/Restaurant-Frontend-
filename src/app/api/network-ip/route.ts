import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    const results: { name: string; ip: string; isWifi: boolean; isHotspot: boolean }[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          const lower = name.toLowerCase();
          const isHotspot =
            iface.address.startsWith('192.168.137.') ||
            lower.includes('hotspot') ||
            lower.includes('wi-fi 3') ||
            lower.includes('virtual');
          const isWifi =
            lower.includes('wi-fi') ||
            lower.includes('wlan') ||
            lower.includes('wireless') ||
            isHotspot;

          let displayName = name;
          if (isHotspot) {
            displayName = `Mobile Hotspot (${iface.address})`;
          } else if (isWifi) {
            displayName = `Wi-Fi Network (${iface.address})`;
          } else {
            displayName = `Ethernet / LAN (${iface.address})`;
          }

          results.push({
            name: displayName,
            ip: iface.address,
            isWifi,
            isHotspot,
          });
        }
      }
    }

    // Sort real Wi-Fi first, then Ethernet, then Hotspot
    results.sort((a, b) => {
      if (a.isWifi && !a.isHotspot) return -1;
      if (b.isWifi && !b.isHotspot) return 1;
      if (!a.isHotspot && b.isHotspot) return -1;
      if (a.isHotspot && !b.isHotspot) return 1;
      return 0;
    });

    const preferred = results.find((i) => i.isWifi && !i.isHotspot)?.ip || results[0]?.ip || '127.0.0.1';

    return NextResponse.json({
      success: true,
      preferredIp: preferred,
      frontendUrl: `http://${preferred}:3000`,
      interfaces: results,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      preferredIp: '127.0.0.1',
      frontendUrl: 'http://localhost:3000',
      interfaces: [],
      error: err.message,
    });
  }
}
