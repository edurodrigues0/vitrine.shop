import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsConfigPaths()],
	test: {
		environment: "node",
		globals: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
		include: [
			"src/**/*.test.{js,ts}",
			"src/**/*.spec.{js,ts}",
			"src/**/*.e2e.spec.{js,ts}",
		],
		exclude: ["node_modules", "dist"],
	},
})

// BACKUP
// import path from "node:path";
// import { defineConfig } from "vitest/config";

// export default defineConfig({
// 	test: {
// 		globals: true,
// 		environment: "node",
// 		pool: "forks",
// 		coverage: {
// 			provider: "v8",
// 			reporter: ["text", "json", "html"],
// 			exclude: [
// 				"node_modules/",
// 				"dist/",
// 				"**/*.spec.ts",
// 				"**/*.test.ts",
// 				"**/types/**",
// 			],
// 		},
// 		include: ["src/**/*.{test,spec,e2e.spec}.{js,ts}"],
// 		exclude: ["node_modules", "dist"],
// 	},
// 	resolve: {
// 		alias: {
// 			"~": path.resolve(__dirname, "./src"),
// 		},
// 	},
// });
