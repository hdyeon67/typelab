/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // typelab-core 는 컴파일하지 않고 TS 소스를 그대로 내보낸다(saju-core 선례).
  // 웹판·앱인토스판이 같은 소스를 공유하므로 소비 측에서 트랜스파일한다.
  transpilePackages: ["typelab-core"],
};

export default nextConfig;
