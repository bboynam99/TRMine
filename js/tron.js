let TESTNET = true;
let CONTRACT_ADDRESS = "TG8Yf54Z7AotQo1p9SdGRzYpnaHwtSnFZk";
let CONTRACT_ADDRESS_2 = "TVrgrcnPv2pAMfz2GkTRGjpiA3vWkWgKHU";
let STATISTIC = "https://tronmine.pro/statistic";
let nodeUrl = "https://api.trongrid.io";
let currentAccount;

if(TESTNET){
    nodeUrl = "https://api.shasta.trongrid.io";
    CONTRACT_ADDRESS = "TG8Yf54Z7AotQo1p9SdGRzYpnaHwtSnFZk";
    CONTRACT_ADDRESS_2 = "TVrgrcnPv2pAMfz2GkTRGjpiA3vWkWgKHU";
}

$('[name="contract"]').attr('href', 'https://tronscan.org/#/contract/'+CONTRACT_ADDRESS);
$('[name="contract"]').attr('target', '_blank');

function format_number(number){
    if(number == undefined)
        number = 0;
    let str_number_last_pos = number.toString().length - 1;
    let result = "";
    for(let i = str_number_last_pos; i >= 0; i--){
        if((str_number_last_pos - i) % 3 == 0 && i != str_number_last_pos)
            result = "," + result;
        result = number.toString()[i] + result;
    }
    return result;
}

function getDateTime(datetime) {
    var date = new Date();
    if(datetime != undefined)
        date = new Date(datetime);
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}