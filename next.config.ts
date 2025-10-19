import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	webpack: (config, { isServer }) => {
		// Ignore LICENSE and README files
		config.module.rules.push({
			test: /\/(LICENSE|README\.md)$/,
			type: "asset/source",
		});

		// Ignore native node modules (.node files)
		config.module.rules.push({
			test: /\.node$/,
			use: "node-loader",
		});

		// Externalize native modules for server-side
		if (isServer) {
			config.externals = config.externals || [];
			config.externals.push({
				"@libsql/darwin-arm64": "commonjs @libsql/darwin-arm64",
				"@libsql/linux-x64-gnu": "commonjs @libsql/linux-x64-gnu",
				"@libsql/linux-x64-musl": "commonjs @libsql/linux-x64-musl",
				"@libsql/win32-x64-msvc": "commonjs @libsql/win32-x64-msvc",
				libsql: "commonjs libsql",
			});
		}

		return config;
	},
	transpilePackages: ["@libsql/client"],
};

export default nextConfig;
