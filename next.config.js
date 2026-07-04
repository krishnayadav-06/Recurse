/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '*.trycloudflare.com',
    '*.localtunnel.me',
    '*.ngrok-free.app'
  ],
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
//setup for port forwarding