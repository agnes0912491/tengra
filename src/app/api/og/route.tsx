import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // ?title=<title>
        const hasTitle = searchParams.has('title');
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : 'Tengra Studio';

        return new ImageResponse(
            (
                <div
                    style={{
                        backgroundImage: 'linear-gradient(to bottom right, #051218, #001e2b)',
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        flexWrap: 'nowrap',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            justifyItems: 'center',
                        }}
                    >
                        {/* Logo placeholder */}
                        <svg
                            width="75"
                            height="75"
                            viewBox="0 0 75 75"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ margin: '0 20px' }}
                        >
                            <path d="M37.5 0L75 18.75V56.25L37.5 75L0 56.25V18.75L37.5 0Z" fill="#48d5ff" />
                        </svg>
                    </div>
                    <div
                        style={{
                            fontSize: 60,
                            fontStyle: 'normal',
                            letterSpacing: '-0.025em',
                            color: 'white',
                            marginTop: 30,
                            padding: '0 120px',
                            lineHeight: 1.4,
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            marginTop: 40,
                            fontSize: 24,
                            color: '#48d5ff',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}
                    >
                        Tengra Studio
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
