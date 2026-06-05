/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '*.trycloudflare.com',
    '*.localtunnel.me',
    '*.ngrok-free.app'
  ]
};

export default nextConfig;
//setup for port forwarding