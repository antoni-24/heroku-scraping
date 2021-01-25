const puppeteer = require('puppeteer-extra');
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors());

app.use(bodyParser.json());

const ip = process.env.IP || '0.0.0.0';
const port = process.env.PORT || 8080;


/*const getAPIData = async (userInfo) => {
    const results = {};
    const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });


    const apiInfo = await Promise.all([
        getSalaryAfterTax(browser, userInfo.state, userInfo.salary),
        getAverageRentByCity(browser, userInfo.cityValue)
    ]).then((res) => res);

    results.taxes = apiInfo[0];
    results.average_rent = apiInfo[1];

    await browser.close();
    return results;
};*/

app.post('/getdata',async (req, res) => {
    //const userInfo = req.body;
    const browser = await puppeteer.launch({headless: true});

    const page = await browser.newPage();

    await page.goto('https://reservas.machupicchu.gob.pe/inicio');
    await page.screenshot({path: 'mapi1.jpg'});

    //await page.type('#resAduGen', '6');
    await page.$eval('#fmGeneral #resAduGen', el => el.value = '4');
    await page.screenshot({path: 'mapi2.jpg'});

    //await page.click('#fmGeneral button');
    await page.evaluate(() => {
        document.querySelector('#fmGeneral button[type=submit]').click();
    });
    await page.waitForSelector('[id=fmRutaGeneral]');
    //await page.waitFor(5000);
    await page.screenshot({path: 'mapi3.jpg'});

    const data = await page.evaluate(() => {
    const elements = document.querySelector('#fmRutaGeneral .row');
        return elements.innerHTML;
    });
            
    await browser.close();
    
    res.contentType("text/plain");
    res.send(data);
    /*getAPIData(userInfo).then(result => {
        res.status(200).json(result);
    });*/
});

app.get('/pdf',async (req, res) => {
    res.json({'hola': 'hola'});
});


app.get('/', (req, res) => {
    res.contentType("text/plain");
    res.send('necesario registrarse');
});

app.listen(port, ip);

/*const getSalaryAfterTax = async (browser, state, salary) => {
    const page = await browser.newPage();

    //turns request interceptor on
    await page.setRequestInterception(true);

    //if the page makes a  request to a resource type of image or stylesheet then abort that request
    page.on('request', request => {
        if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') {
            request.abort();
        } else {
            request.continue();
        }
    });

    const promiseResult = await Promise.race([
        page.waitFor(10000),
        getTaxData(page, state, salary),
    ]);

    return !promiseResult ? {} : promiseResult;
};

const getTaxData = async (page, state, salary) => {

    await page.goto('https://salaryaftertax.com/us', {waitUntil: 'domcontentloaded'});

    await page.select('#province', state.replace('_', ' '));
    await page.select('#satSelectPeriod', 'YEARLY');
    await page.type('#satGrossSalary', salary);
    await page.keyboard.press('Enter');
    await page.waitForSelector('.sat-row-tax-details');

    const results = await page.evaluate(() => {
        let data = [];
        let elements = document.getElementsByClassName('sat-row-tax-details');
        for (let element of elements) {
            data.push({
                taxType: (element.children[0].innerHTML).split('>')[1].split('<')[0],
                taxValue: (element.children[3].innerHTML).split('>')[1].split('<')[0],
            }); // 0 = name;
        }
        return data;
    });

    return results;
};

const getAverageRentByCity = async (browser, city) => {
    try {
        const page = await browser.newPage();

        //turns request interceptor on
        await page.setRequestInterception(true);

        //if the page makes a  request to a resource type of image or stylesheet then abort that request
        page.on('request', request => {
            if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet') {
                request.abort();
            } else {
                request.continue();
            }
        });

        const promiseResult = await Promise.race([
            page.waitFor(10000),
            getRentData(page, city)
        ]);

        return !promiseResult ? {} : promiseResult;
    } catch (e) {
        console.log('error in rent');
    }

};

const getRentData = async (page, city) => {
    await page.goto('https://www.rentjungle.com/rentdata/', {waitUntil: 'domcontentloaded'});

    await page.select('#CityCity', city);
    await page.evaluate(() => document.querySelector('#SourceTypeRentdatahomeForm').submit());
    await page.waitForSelector('.google-visualization-table-table');

    const results = await page.evaluate(() => {
        let elements = document.getElementsByClassName('google-visualization-table-table')[0];
        return {
            month: elements.lastChild.lastChild.childNodes[0].innerHTML,
            allBeds: elements.lastChild.lastChild.childNodes[1].innerHTML,
            oneBed: elements.lastChild.lastChild.childNodes[2].innerHTML,
            twoBeds: elements.lastChild.lastChild.childNodes[3].innerHTML,
        };
    });

    return results;
};*/
