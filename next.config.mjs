/** @type {import('next').NextConfig} */
const nextConfig = {
  // image hostnames
  images: {
    domains: [
      "res.cloudinary.com",
      "localhost",
      "via.placeholder.com",
      "picsum.photos",
      "upload.wikimedia.org",
    ],
  },
};

export default nextConfig;
