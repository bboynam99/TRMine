$(document).ready(function () {
    $(".link_anim").click(function() {
        event.preventDefault();

        var id = $(this).attr('href'),
            top = $(id).offset().top;
        $('body,html').animate({ scrollTop: top }, 1500);
    });
    $('.paste').click(function(){
        var ta = document.getElementById('cont');
        //производим его выделение
        var range = document.createRange();
        range.selectNode(ta);
        window.getSelection().addRange(range);
        document.execCommand('copy');
    })
    var button = document.getElementById('userButton');
    button.addEventListener('click', function () {
        //нашли наш контейнер
        var ta = document.getElementById('cont');
        //производим его выделение
        var range = document.createRange();
        range.selectNode(ta);
        window.getSelection().addRange(range);

        //пытаемся скопировать текст в буфер обмена
        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Can`t copy, boss');
        }
        //очистим выделение текста, чтобы пользователь "не парился"
        window.getSelection().removeAllRanges();
    });
    
})

function openFaq(id) {
    $('#item_faq_' + id).slideToggle(600);

}



