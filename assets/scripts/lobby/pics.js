
const pics = {

    // Leader icon
    star: {
        path: 'pictures/leader.png',
        style: `
            position: absolute;
            z-index: 2;
            top: 72%;
            left: 82%;
            transform: translate(-50%, -50%);
            height: 64px;
        `,
        maxDims: {
            y: 64,
            // x: 32//Unused
        },
    },

    crown: {
        path: 'pictures/crown.png',
        style: `
            position: absolute;
            z-index: 2;
            top: 72%;
            left: 82%;
            transform: translate(-50%, -50%);
            width: 128px;
            height: 128px;
        `,
        maxDims: {
            y: 51,
            x: 51,
        },
    },

    crownBig: {
        path: 'pictures/crown.png',
        style: `
            position: absolute;
            z-index: 2;
            top: 63%;
            left: 90%;
            transform: translate(-50%, -50%);
            width: 128px;
            height: 128px;
        `,
        maxDims: {
            y: 90,
            x: 90,
        },
    },


    // Pick icon
    gun: {
        path: 'pictures/gun.png',
        position: {
            x: 2,
            y: 1.5,
        },
        maxDims: {
            y: 45,
            x: 128,
        },
    },

    shield: {
        path: 'pictures/shield.png',
        position: {
            x: 2,
            y: 1.85,
        },
        maxDims: {
            y: 51,
            x: 40,
        },
    },

    shieldOrange: {
        path: 'pictures/shield-orange.png',
        position: {
            x: 2,
            y: 1.85,
        },
        maxDims: {
            y: 51,
            x: 40,
        },
    },

    shieldOrangeBig: {
        path: 'pictures/shield-orange.png',
        position: {
            x: 4.5,
            y: 0.75,
        },
        maxDims: {
            y: 102,
            x: 80,
        },
    },


    // Assassin target icon
    bullet: {
        path: 'pictures/bullet.png',
        style: `
            top: -60px;
            position: absolute;
            transform: translate(-50%, 50%);
            width: 50px;
            height: 50px;
        `,
    },
    bulletDark: {
        path: 'pictures/bullet-dark.png',
        style: `
            top: -60px;
            position: absolute;
            transform: translate(-50%, 50%);
            width: 50px;
            height: 50px;
        `,
        maxHeight: '50px',
    },
    dagger: {
        path: 'pictures/dagger.png',
        style: `
            top: 0px;
            position: absolute;
            transform: translate(-50%, 0%);
            height: 100px;
        `,
        maxHeight: '100px',
    },


    // base res
    baseRes: {
        path: 'avatars/base-res.png',
    },

};
