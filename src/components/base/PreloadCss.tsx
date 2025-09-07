// Use a stable, env-based version string to avoid SSR/CSR mismatch.
// Set NEXT_PUBLIC_ASSETS_VERSION during deployments if cache busting is needed.
const version = process.env.NEXT_PUBLIC_ASSETS_VERSION ? `?v=${process.env.NEXT_PUBLIC_ASSETS_VERSION}` : '';

const ASSETS = 'https://cdn.jsdelivr.net/gh/itzzjarvis/Assets@main';
const cssList = [
	'/styles/fa/fa-min.css',
];

const cssUrls = cssList.map((path) => `${ASSETS}${path}${version}`);

export default function PreloadCss() {
    return (
        <>
            {cssUrls.map((href) => (
                <>
                    <link key={href + '-preload'} as='style' href={href} rel='preload' />
                    <link key={href} href={href} rel='stylesheet' />
                </>
            ))}
        </>
    );
}
