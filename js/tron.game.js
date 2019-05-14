let html_coin = ' <i><img src="img/mn.png" alt=""></i>';
let dividents = [6, 25, 96, 330, 1020, 2100];
let company_prices = [4500, 17625, 66750, 232500, 705000, 1425000];
let user_balance = 0;
let user_coins = 0;

let tronWebJS = new TronWebJS(
    new TronWebJS.providers.HttpProvider(nodeUrl),
    new TronWebJS.providers.HttpProvider(nodeUrl),
    nodeUrl,
);

updateData();
setInterval(function(){
    updateData();
}, 5000);

function updateData(){
    tronWebJS.contract().at(CONTRACT_ADDRESS).then(contract => {
        contract.methods.totalPlayers().call().then(totalPlayers => {
            totalPlayers = tronWebJS.toDecimal(totalPlayers);
            $('#totalPlayers').html(format_number(totalPlayers));
            setCookie('totalPlayers', totalPlayers);
        });
    
        contract.methods.totalPayout().call().then(totalPayout => {
            totalPayout = parseFloat(Math.floor(tronWebJS.toDecimal(totalPayout) / Math.pow(10, 6))).toFixed(0);
            $('#totalPayout').html(format_number(totalPayout));
            setCookie('totalPayout', totalPayout);
            
            tronWebJS.trx.getBalance(CONTRACT_ADDRESS).then(balance => {
                balance = Math.floor(balance / Math.pow(10, 6));
                
                let totalDeposit = parseInt(balance, 10) + parseInt(totalPayout, 10);
                $('#totalDeposit').html(format_number(totalDeposit));
                setCookie('totalDeposit', totalDeposit);
            });
        });
        
        contract.methods.totalCompany().call().then(totalCompany => {
            totalCompany = tronWebJS.toDecimal(totalCompany);
            $('#totalCompany').html(format_number(totalCompany));
            setCookie('totalCompany', totalCompany);
        });
        
    }).catch(() => {
        let totalPlayers = getCookie("totalPlayers");
        let totalPayout  = getCookie("totalPayout");
        let totalDeposit = getCookie("totalDeposit");
        let totalCompany = getCookie("totalCompany");
        
        if(totalPlayers != undefined){
            $('#totalPlayers').html(format_number(totalPlayers));
        }
        if(totalPayout != undefined){
            $('#totalPayout').html(format_number(totalPayout));
        }
        if(totalPlayers != undefined){
            $('#totalDeposit').html(format_number(totalDeposit));
        }
        if(totalCompany != undefined){
            $('#totalCompany').html(format_number(totalCompany));
        }
    });
    
    $(document).ready(function(){
        let tronWeb = window.tronWeb;
        if(tronWeb && tronWeb.defaultAddress.base58){
            currentAccount = tronWeb.defaultAddress.base58;
            $('#currentAccount').html(currentAccount);
            
            tronWebJS.contract().at(CONTRACT_ADDRESS_2).then(contract => {
                contract.methods.coinsOf(currentAccount).call().then(stat => {
                    coinsForBuy = tronWebJS.toDecimal(stat.treasury);
                    coinsForSell = tronWebJS.toDecimal(stat.spare);
                    user_coins = coinsForBuy + coinsForSell;
                    
                    $('#user_coinsForBuy').html(format_number(coinsForBuy) + html_coin);
                    $('#user_coinsForSell').html(format_number(coinsForSell) + html_coin);
                    
                    // withdraw form
                    $('#withdrawWindow > div > div > span').filter(':first').html(format_number(coinsForSell) + html_coin);
                });
            });
            
            tronWebJS.contract().at(CONTRACT_ADDRESS).then(contract => {
                contract.methods.companyOf(currentAccount).call().then(player_companies => {
                    let user_companies_count = 0;
                    let user_dividents_count = 0;
                    for(let i = 0; i < player_companies.length; i++){
                        let count = tronWeb.toDecimal(player_companies[i]);
                        let divs  = tronWeb.toDecimal(player_companies[i]) * dividents[i];
                        user_companies_count += count;
                        user_dividents_count += divs;
                        
                        $('#building_'+(i+1)).html(format_number(count) + ' ' + $('#building_'+(i+1)).html().split(' ')[1] );
                    }
                    $('#user_companies').html(format_number(user_companies_count));
                    $('#user_dividents').html(format_number(user_dividents_count) + html_coin);
                    
                    if(user_companies_count > 0){
                        $('#currentAccountRef').attr('onmousedown', '');
                        $('#currentAccountRef').attr('onselectstart', '');
                        
                        let urlRef = window.location.host + window.location.pathname.split('game.html')[0] + '?ref!' + currentAccount;
                        $('#currentAccountRef').html(urlRef);
                    }
                });
            });
            
            // deposit form
            tronWebJS.trx.getBalance(currentAccount).then(balance => {
                user_balance = Math.floor(balance / Math.pow(10, 6)).toFixed(0);
                $('#depositWindow > div > div > span').filter(':first').html(user_balance + ' ' + $('#depositWindow > div > div > span').html().split(' ')[1]);
            });
            
            $('#accountFormNeedAuth').hide();
            $('[name="accountForm"]').show();
        } else {
            $('#accountFormNeedAuth').show();
            $('[name="accountForm"]').hide();
        }
    });
}

$('.value_inp').on('input', function (event) { 
    this.value = this.value.replace(/[^0-9]/g, '');
    if(this.value == "")
        this.value = 0;
    this.value = parseInt(this.value, 10);
});

$('#input_deposit').on('input', function (event) { 
    $('#button_deposit > span').html(this.value * 25);
    if(this.value == 0 || user_balance < parseInt(this.value, 10)){
        $('#button_deposit').hide();
    } else {
        $('#button_deposit').show();
    }
    
    if(user_balance < parseInt(this.value, 10)){
        $('#deposit_error_field').show();
    } else {
        $('#deposit_error_field').hide();
    }
});

$('#input_withdraw').on('input', function (event) { 
    let user_balance_coins = parseInt($('#withdrawWindow > div > div > span').filter(':first').html().split(' ')[0], 10);
    $('#button_withdraw > span').html(parseFloat(this.value/25).toFixed(2));
    if(this.value == 0 || user_balance_coins < parseInt(this.value, 10)){
        $('#button_withdraw').hide();
    } else {
        $('#button_withdraw').show();
    }
    
    if(user_balance_coins < parseInt(this.value, 10)){
        $('#withdraw_error_field').show();
    } else {
        $('#withdraw_error_field').hide();
    }
});

$('#input_buy').on('input', function (event) { 
    isEnoughCoinsForBuy();
});

function isEnoughCoinsForBuy(){
    let id = parseInt($('.item_modal_img img').attr('src').split('img/game/')[1].split('.png')[0], 10);
    $('#button_buy > span').html($('#input_buy').val() * company_prices[id-1]);
    if($('#input_buy').val() == 0 || user_coins < parseInt($('#input_buy').val(), 10) * company_prices[id-1]){
        $('#button_buy').hide();
    } else {
        $('#button_buy').show();
    }
    
    if(user_coins < parseInt($('#input_buy').val(), 10) * company_prices[id-1]){
        $('#buy_error_field').show();
    } else {
        $('#buy_error_field').hide();
    }
}

$('#button_deposit').on('click', function(){
    let _refferal = getCookie('refferal');
    if(_refferal == undefined)
        _refferal = currentAccount;
    
    window.tronWeb.contract().at(CONTRACT_ADDRESS).then(contract => {
        contract.methods.deposit(_refferal).send({'callValue': $('#input_deposit').val() * Math.pow(10, 6)}, function(data){
            console.log(data);
            $('#modal_bue').hide();
        });
    });
});

$('#button_withdraw').on('click', function(){
    window.tronWeb.contract().at(CONTRACT_ADDRESS).then(contract => {
        contract.methods.withdraw($('#input_withdraw').val()).send(function(data){
            console.log(data);
            $('#modal_vivod').hide();
        });
    });
});

$('#button_buy').on('click', function(){
    let id = parseInt($('.item_modal_img img').attr('src').split('img/game/')[1].split('.png')[0], 10);
    let number = $('#input_buy').val();
    window.tronWeb.contract().at(CONTRACT_ADDRESS).then(contract => {
        contract.methods.buy(id-1, number).send(function(data){
            console.log(data);
            $('#modal_item').hide();
        });
    });
});

function showItem(id, nameItem) {
    let tronWeb = window.tronWeb;
    if(tronWeb && tronWeb.defaultAddress.base58){
        $('#modal_item h3').html(nameItem);
        $('.item_modal_img img').attr('src', 'img/game/' + id + '.png');
        $('#modal_item').show();
        $('[name="company_description"]').hide();
        $('#company_description_'+id).show();
        
        $('#modal_item > div > div > div > span').filter(':first').html(user_coins + html_coin);
        
        $('#input_buy').val(1);
        isEnoughCoinsForBuy();
    } else {
        $('#modal_need_auth').show();
    }   
}

// statistic
function getStat(){
    $.get(STATISTIC, function(data) {
        setCookie('statistic', JSON.stringify(data));
        updateUserHistory(data);
        updateTops(data);
    }).fail(function() {
    
        let data = getCookie('statistic');
        if(data != undefined){
            data = JSON.parse(data);
            updateUserHistory(data);
            updateTops(data);
        }
    }); 
}


function updateUserHistory(data){
    if(data.txs[currentAccount] != undefined){
        let transfers_popol_sum = 0;
        let transfers_vivod_sum = 0;
        let history_table_head = $('#history_table').html().split('</tr>')[0] + '</tr>';
        let history_table = '';
        for(let i = 0; i < data.txs[currentAccount].length; i++){
            if(data.txs[currentAccount][i]['call_value'] == undefined){
                data.txs[currentAccount][i]['call_value'] = 0;
            }
            
            if(data.txs[currentAccount][i]['method'] == 'buy'){
                continue;
            }
            let withdraw_style = "";
            let amount = 0;
            if(data.txs[currentAccount][i]['method'] == 'deposit'){
                if(data.txs[currentAccount][i]['call_value'] != undefined){
                    transfers_popol_sum += data.txs[currentAccount][i]['call_value'];
                }
                amount = Math.floor(data.txs[currentAccount][i]['call_value'] / Math.pow(10, 6));
            }
            if(data.txs[currentAccount][i]['method'] == 'withdraw'){
                if(data.txs[currentAccount][i]['call_value'] != undefined){
                    transfers_vivod_sum += data.txs[currentAccount][i]['call_value'];
                }
                withdraw_style = 'style="color: #32CD32;"';
                amount = Math.floor(data.txs[currentAccount][i]['call_value']);
            }
            
            let less0part = Math.floor(data.txs[currentAccount][i]['call_value'] * 100) % 100;
            if(less0part < 10) less0part = ''+0+less0part;
            history_table = '<tr>'+
                            '   <td class="text-left">'+getDateTime(data.txs[currentAccount][i]['timestamp'])+'</td>'+
                            '   <td>'+
                            '       <a target="_blank" href="https://tronscan.org/#/transaction/'+data.txs[currentAccount][i]['txid']+'">'+data.txs[currentAccount][i]['txid'].substring(0,15)+'...</a>'+
                            '   </td>'+
                            '   <td class="text-right" '+withdraw_style+'>'+format_number(amount)+'.'+less0part+' TRX</td>'+
                            '</tr>' + history_table;
        }
        
        $('#history_table').html(history_table_head + history_table);
        
        let less0part = (transfers_popol_sum / Math.pow(10, 6) * 100) % 100;
        if(less0part < 10) less0part = ''+0+less0part
        $('#transfers_popol_sum').html(format_number(Math.floor(transfers_popol_sum / Math.pow(10, 6))) + '.' + less0part);
        
        less0part = Math.floor(transfers_vivod_sum * 100) % 100;
        if(less0part < 10) less0part = ''+0+less0part;
        $('#transfers_vivod_sum').html(format_number(Math.floor(transfers_vivod_sum)) + '.' + less0part);
    }
}

function updateTops(data){
    let users = data['users'];
    let sort_users = users.sort(function(a,b){ 
        return b.dividents - a.dividents   
    });
    
    let top_liders = $('#table_liders_top').html().split('</tr>')[0] + '</tr>';
    let liders     = $('#table_liders').html().split('</tr>')[0] + '</tr>';
    for(let i = 0; i < sort_users.length; i++){
        if(i < 100){
            if(i < 3){
                top_liders +=   '<tr>'+
                                '   <td class="text-left">'+
                                '       <img src="img/top'+(i+1)+'.png" alt="">'+
                                '   </td>'+
                                '   <td class="text-center">'+
                                '       <a target="_blank" href="https://tronscan.org/#/address/'+sort_users[i].address+'">'+sort_users[i].address.substring(0,15)+'...</a>'+
                                '   </td>'+
                                '   <td class="text-right">'+
                                '       '+format_number(sort_users[i].dividents)+html_coin+
                                '   </td>'+
                                '</tr>';   
            } else {
                liders +=       '<tr>'+
                                '   <td class="text-left">'+
                                '       <span class="num_top">'+
                                '           '+(i+1)+
                                '       </span>'+
                                '   </td>'+
                                '   <td class="text-center">'+
                                '       <a target="_blank" href="https://tronscan.org/#/address/'+sort_users[i].address+'">'+sort_users[i].address.substring(0,15)+'...</a>'+
                                '   </td>'+
                                '   <td class="text-right">'+
                                '       '+format_number(sort_users[i].dividents)+html_coin+
                                '   </td>'+
                                '</tr>';
            }
        }
        if(sort_users[i].address == currentAccount){
            $('#user_top_place').html((i+1));   
        }
    }
    $('#table_liders_top').html(top_liders);
    $('#table_liders').html(liders);
}