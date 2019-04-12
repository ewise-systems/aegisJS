import 'whatwg-fetch'

// @ts-ignore
const ew = window.ew || {};

const baseUrl = 'https://pdv.ewise.com:8443';

ew.version = async cb => {
    try {
        // const myHeaders = new Headers();
        // myHeaders.append('Upgrade-Insecure-Requests', 1);

        const data = await window.fetch(baseUrl);
        console.log('-->', data);
        return data;
    } catch(e) {
        console.log('Failed fetch')
        return {}
    }
}

console.log('Creatsing ewise library');

(async () => {
    console.log(await ew.version());
})()