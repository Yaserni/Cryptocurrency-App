/// <reference path="jquery-3.6.0.js" />
"use strict";


// hide all pages beyond the home Page that dispaly 100 crypto currency
function homeButton() {
    $('#home').show();
    $('#about').hide();
    showAllCryptos()
}

// hide all pages beyond the about Page 
function aboutButton() {
    $('#home').hide();
    $('#about').show();
}

// hide all pages beyond the about live reports 
function liveReportsButton() {
    $('#home').hide();
    $('#about').hide();
}
let moreInformation = null;

let cryptoCoins;
async function showAllCryptos() {
    try {
        $("#coinsDiv").empty();
        $("#coinsDiv").append(`<div class="spinner-border" role="status">`);
        cryptoCoins = await getJSON("https://api.coingecko.com/api/v3/coins/list");
        displayCryptoCoin(cryptoCoins);


    } catch (err) {
        alert("Error! Can't load from the server!")
    }
}
// display 100 crypto currency 
function displayCryptoCoin(cryptoCoins) {
    let content = '';
    for (let index = 400; index < 500; index++) {
        const coin = cryptoCoins[index];
        // build the div (UI)
        const div = buildDivCoin(coin.name, coin.symbol, coin.id);
        content += div;
    }
    $("#coinsDiv").empty();
    $("#coinsDiv").append(content);
    // configurate the collapser
    configuration();
    // add event for the toggle button
    addEventLisnerToToggleButton();
}
// buildDivCoin - function that build the Div that show the crypto currency coins 
function buildDivCoin(coinName, coinSymbol, coinId) {
    const div = ` <div class = "card coinStyle" id = "${coinId}">
                <span id="${coinId}_name">${coinName}</span> <label class = "switch" >
                <input id="${coinId}_switch" type = "checkbox" name="radios">
                <span class="slider round"></span>
                </label><br>
                <span id="${coinId}_symbol">${coinSymbol}</span>
                <button type="button" class="btn btn-primary collapsible">More info</button>
                <div id="${coinId}_content" class="content">
                
                </div>
            </div>`;
    return div;
}

// Configuration function is used in order to configure all the collapsers buttons 
function configuration() {
    var coll = document.getElementsByClassName("collapsible");
    let i;
    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.display === "block") {

                content.style.display = "none";
            } else {
                content.style.display = "block";
                content.innerHTML = "";
                getMoreInfo(this);
            }
        });
    }
}
// get More Info about the selected cryto currency (price in dollar and euro and shekel + small image)
async function getMoreInfo(collapser) {
    let divCoin = $(collapser).parent();
    const coinId = divCoin.attr('id');
    const nameId = "Loader_" + coinId;
    divCoin.append(`<div id="${nameId}" class="spinner-border" role="status">
    <span class="sr-only">Loading...</span>
    </div>`);
    console.log(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    getData(coinId);

    // try {
    //     // get Form server 
    //     let lastDev = $(nodes).last('div')
    //     moreInformation = await getJSON(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    //     lastDev.empty();
    //     $(`#${coinId}_content`).html(`
    //     <img src = "${moreInformation.image['small']}">
    //     <br><span>${moreInformation.market_data.current_price['usd']}$</span><br>
    //     <span>${moreInformation.market_data.current_price['ils']}₪</span><br>
    //     <span>${moreInformation.market_data.current_price['eur']}€</span><br>
    //     `);
    //     removeLoader(coinId);


    // } catch (error) {
    //     console.log("Something wrong!!");
    //     alert("Error! while loading the data!!")
    // }
}

async function getDataFromServer(id) {
    console.log('in get data form server- ', `https://api.coingecko.com/api/v3/coins/${id}`);
    try {
        const moreInformation = await getJSON(`https://api.coingecko.com/api/v3/coins/${id}`);
        let data = {
            image: moreInformation.image['small'],
            usd: moreInformation.market_data.current_price['usd'],
            ils: moreInformation.market_data.current_price['ils'],
            eur: moreInformation.market_data.current_price['eur']
        }

        $(`#${id}_content`).append(`
                <img src = "${data.image}"><br>
                <span>${data.usd}$</span><br>
                <span>${data.ils}₪</span><br>
                <span>${data.eur}€</span><br>
            `);

        // BuildMoreInfo(id, data);
        removeLoader(id);
        setWithExpiry(id, data, 120000);
        // return data;
    } catch {
        alert("Error, Can't load data from the server!!!@");
    }

}

function BuildMoreInfo(id, data) {
    $(`#${id}_content`).append(`
    <img src = "${data.image}"><br>
    <span>${data.usd}$</span><br>
    <span>${data.ils}₪</span><br>
    <span>${data.eur}€</span><br>
`);
}

function setWithExpiry(key, value, ttl) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ttl,
    }
    localStorage.setItem(key, JSON.stringify(item))
}

// get Data from local storage if it's found otherwise from from server
async function getData(id) {
    let data = getWithExpiry(id);
    if (data === null) {
        data = await getDataFromServer(id);
    }
    BuildMoreInfo(id, data);
    removeLoader(id);

}

// get data from local storage (search by Id) and delete the data that expiration time has been passed 
function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    // if the item doesn't exist, return null
    if (!itemStr) {
        return null
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(key);
        return null;
    }
    return item.value;
}


function removeLoader(id) {
    const nameId = "#Loader_" + id;
    $(nameId).remove()
}

function addEventLisnerToToggleButton() {
    $(".switch > input").click(toggleBottonFunc)
}
let toggledList = []
let lastCheck;
console.log(toggledList)

function toggleBottonFunc() {
    const inputId = this.id
    const id = inputId.split("_")[0]
    const symbol = $(`#${id}_symbol`).text()
    const name = $(`#${id}_name`).text()
    const check = document.getElementById(inputId).checked
    if (check == true) {
        if (toggledList.length < 5) {
            const crypt = {
                'id': id,
                'symbol': symbol,
                'name': name
            };
            pushToToggled(crypt);
        } else {
            document.getElementById(inputId).checked = false;
            lastCheck = inputId;
            dispalyModal();
        }
    } else {
        document.getElementById(inputId).checked = false;
        removeFormToggled(id)
    }
}
// remove from the toggled list
function removeFormToggled(itemId) {
    for (let i = 0; i < toggledList.length; i++) {
        if (toggledList[i].id === itemId) {
            toggledList.splice(i, 1);
            break;
        }
    }
}
// push to toggle list 
function pushToToggled(crypt) {
    const itemId = crypt.id;
    for (let i = 0; i < toggledList.length; i++) {
        if (toggledList[i].id === itemId) {
            return;
        }
    }
    toggledList.push(crypt);

}
// display the modal on the screen 
function dispalyModal() {
    $(".modal-body").empty();
    let body = "";
    for (let i = 0; i < 5; i++) {
        let item = toggledList[i];
        body += `
        <input type="radio" id="${item.id}_moadl" name="modal" >
        <label for="${item.id}_moadl">${item.name}</label><br>`
    };
    $(".modal-body").append(body);
    $("#modalDisplay").click();
}
// saving the modall after choosing which element not to select
function saveModal() {
    try {
        const id = $(".modal-body >input:checked").attr("id").split("_")[0];
        const toggleInput = id + "_switch";
        document.getElementById(toggleInput).checked = false;
        removeFormToggled(id);
        $("#" + lastCheck).click();
        $("#closebtn").click();
    } catch {
        $("#errorSelection").text('Please select one or click cancel');
    }
}
// check if the word founded in the str 
function checkAndFilter(str, word) {
    str = str.toLowerCase();
    word = word.toLowerCase();
    if (str.search(word) < 0)
        return false;
    else return true;

}
// Search function search only on the 100 displayed cryptocurrencies
function searchBySymbol() {
    let searchInput = document.getElementById('searchInput').value;
    if (searchInput === '' || searchInput === undefined) {
        $('.coinStyle').show();
        return;
    }
    searchInput = searchInput.toLowerCase();
    let cards = $('.coinStyle')
    let filtered = [];
    for (const card of cards) {
        const id = $(card).attr('id');
        const name = document.getElementById(`${id}_name`).innerText;
        const symbol = document.getElementById(`${id}_symbol`).innerText;
        if (checkAndFilter(name, searchInput) || checkAndFilter(symbol, searchInput))
            filtered.push(card);
        else
            $(card).hide();
    }
    console.log(filtered);
}