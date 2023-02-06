module.exports = {
    mode: 'jit',
    purge: [
        './src/renderer/**/*.html',
        './src/renderer/**/*.{js,jsx,ts,tsx,vue}',
    ],
    theme: {
        fontFamily: {
            display: ['"Pixelated MS Sans Serif"', 'Arial'],
            body: ['"Pixelated MS Sans Serif"', 'Arial'],
        },
        extend: {
            colors: {
                primary: {
                    100: '#91C4D7',
                    200: '#65ACC8',
                    300: '#4FA0C0',
                    400: '#4091B1',
                    500: '#387F9B',
                    600: '#306D85',
                    700: '#285B6F',
                    800: '#204959',
                    900: '#183642',
                },
            },
        },
    },
    variants: {
        outline: ['focus', 'hover'],
        border: ['focus', 'hover'],
    },
    plugins: [],
};
