/// <reference types="react-scripts" />

declare module '*.png' {
	const src: string;
	export default src;
}

declare module '*.jpg' {
	const src: string;
	export default src;
}

declare module '*.jpeg' {
	const src: string;
	export default src;
}

declare module '*.svg' {
	const src: string;
	export default src;
}

// Allow importing JS modules from TS files (e.g., App.js)
declare module '*.js' {
	const value: any;
	export default value;
}


