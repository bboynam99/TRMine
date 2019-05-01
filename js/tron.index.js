let tronWebJS = new TronWebJS(
    new TronWebJS.providers.HttpProvider(nodeUrl),
    new TronWebJS.providers.HttpProvider(nodeUrl),
    nodeUrl,
);

updateData();
setInterval(function(){
    updateData();
}, 5000);

let ref = window.location.href.split('ref!')[1];
if(ref != undefined){
    setCookie('refferal', ref);
}

function updateData(){
    tronWebJS.contract().at(CONTRACT_ADDRESS).then(contract => {
        contract.methods.totalPlayers().call().then(totalPlayers => {
            totalPlayers = tronWebJS.toDecimal(totalPlayers);
            $('#totalPlayers').html(format_number(totalPlayers) + '<br>' + $('#totalPlayers').html().split('<br>')[1]);
            setCookie('totalPlayers', totalPlayers);
        });
    
        contract.methods.totalPayout().call().then(totalPayout => {
            totalPayout = parseFloat(Math.floor(tronWebJS.toDecimal(totalPayout) / Math.pow(10, 6))).toFixed(0);
            $('#totalPayout').html(format_number(totalPayout) + ' TRX' + $('#totalPayout').html().split('TRX')[1]);
            setCookie('totalPayout', totalPayout);
            
            tronWebJS.trx.getBalance(CONTRACT_ADDRESS).then(balance => {
                balance = Math.floor(balance / Math.pow(10, 6));
                
                let totalDeposit = parseInt(balance, 10) + parseInt(totalPayout, 10);
                $('#totalDeposit').html(format_number(totalDeposit) + ' TRX' + $('#totalDeposit').html().split('TRX')[1]);
                setCookie('totalDeposit', totalDeposit);
            });
        });
    }).catch(() => {
        let totalPlayers = getCookie("totalPlayers");
        let totalPayout  = getCookie("totalPayout");
        let totalDeposit = getCookie("totalDeposit");
        
        if(totalPlayers != undefined){
            $('#totalPlayers').html(format_number(totalPlayers) + '<br>' + $('#totalPlayers').html().split('<br>')[1]);
        }
        if(totalPayout != undefined){
            $('#totalPayout').html(format_number(totalPayout) + '<br>' + $('#totalPayout').html().split('<br>')[1]);
        }
        if(totalPlayers != undefined){
            $('#totalDeposit').html(format_number(totalDeposit) + '<br>' + $('#totalDeposit').html().split('<br>')[1]);
        }
    });
}