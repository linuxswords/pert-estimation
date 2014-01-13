var totsignature = '&#956;<sub>tot</sub>/&#963;<sub>tot</sub>';
var signature = ' (&#956;/&#963;)';
var taskcounter = 1;
var localStorageKey = 'estimate-data';
var addTaskTo = function(row)
{
    var $task = $('.cloner > li.task').clone(true);
    var number = taskcounter++;
    $task.find('input').each(function(i, elem){
        var name = $(elem).attr('name');
        $(elem).attr('name', name.replace('-x', '-' + number));
    });
    row = row || $('form').find('li:last');
    $task.insertAfter(row);
    $task.children('input:text').val('task ' + (number));
    storeTaskCounter();
};

var storeTaskCounter = function(){
    console.log(taskcounter);
    localStorage.setItem(localStorageKey,taskcounter);
}
var addTask = function(event)
{
    var source = $(event.target).closest('li');
    addTaskTo(source);
    source.next('li.task').find('input.description').select();
};

var isNumber = function(candidate)
{
    return !isNaN(parseInt(candidate));
};

var popOutCSV = function()
{
    var header = 'description,O,N,P,duration,deviation\n';
    var data = header;
    $('.tasks ul li.task').each(
            function()
            {
                $(this).find('input').each(function(){
                data += $(this).val() + ',';
                });
                var mu = $(this).find('span.mu').html();
                data += (mu || '') + ',';
                var sigma = $(this).find('span.sigma').html();
                data += sigma || '';
                data += '\n';
            });
    window.location='data:text/csv;charset=utf8,' + encodeURIComponent(data);
};

var updateNumbers = function()
{
    var mu_tot = 0;
    var sigma_tot = 0;
    $('.tasks input[type=number]').each(function(){
        validate($(this));
        });

    $('.tasks ul li.task').each(
           function(){
               var opt = $(this).children('input.optimus').val();
               var norm = $(this).children('input.nominal').val();
               var worst = $(this).children('input.worst').val();
               if(isNumber(opt) && isNumber(norm) && isNumber(worst))
                {
                    var mu = (parseFloat(opt) + 4 * parseFloat(norm) + parseFloat(worst))/6.0;
                    var sigma = (parseFloat(worst) - parseFloat(opt))/6.0;
                    $(this).find('.sum').remove();
                    $('<span class="sum">' + signature + 
                        ' <span class="mu">' + mu.toFixed(2) + 
                        '</span>/<span class="sigma">' + sigma.toFixed(2) + 
                        '</span></span>').insertAfter($(this).find('input.worst'));
                    mu_tot += parseFloat(mu);
                    sigma_tot += sigma * sigma;
                }
           });
    $('.summary').empty().append($('<span class="totsum">' + 
                totsignature + '<br />' + mu_tot.toFixed(2) + 
                '/' + Math.sqrt(sigma_tot).toFixed(2) + '</span>'));
};


var validate = function(input)
{
    if(isNumber(input.val()))
    {
        input.removeClass('error');
    }
    else
    {
        input.addClass('error');
    }
};

var init = function()
{
    $('input').live('click',function(){
        $(this).select();
      });

    $('input[type=number]').live('keyup',function(){
        updateNumbers();
      });

    $('img.add').live('click',function(event)
            {
                event.stopImmediatePropagation();
                addTaskTo($(this).closest('li'));
            });
    $('img.delete').live('click',function()
            {
                if($('.tasks ul li.task').size() > 1)
                {
                    $(this).closest('li').remove();
                    taskcounter--;
                    storeTaskCounter(taskcounter);
                    updateNumbers();
                }
            });

    $('img.clear').click(
            function(){
                $('.tasks ul li.task').slice(1).remove();
                $('.tasks ul li.task input.optimus').removeClass('error').val('1');
                $('.tasks ul li.task input.nominal').removeClass('error').val('2');
                $('.tasks ul li.task input.worst').removeClass('error').val('3');
                $('.tasks ul li.task input.description').val('description');
                $('input:first').select();
            });

    $('img.download').click(
            function(event)
            {
                popOutCSV();
            });
    $('input').bind('keydown', function(event){
        if(event.keyCode==13 && event.target == this && event.shiftKey)
        {
            var source = $(this).closest('li');
            addTaskTo(source);
            source.find('+ li').find('input:first').select();
        }
        // arrow down
        if(event.keyCode==40)
        {
            // if we are on the last row
            if($(this).closest('li').index() == $("div.tasks li.task:last").index())
            {
                addTask(event);
            }
            // else navigate down
            else
            {
                var inputIndex = $(this).closest('li.task').find('input').index($(this))
                $(this).closest('li').next('li.task').find('input').eq(inputIndex).select();
            }
        }
        // arrow up
        if(event.keyCode==38)
        {
            // case new row
            // case navigate down
            var inputIndex = $(this).closest('li.task').find('input').index($(this))
            $(this).closest('li').prev('li.task').find('input').eq(inputIndex).select();
        }
    });

    $('.tasks ul li.task input:first').select();

    $('.catcher').click(
            function()
            {
                $('.explanation').slideToggle('slow');
            });

    $('.tasks ul li.task input:first').select();
    $('[title]').tooltip();



    $('form').sisyphus({
        onBeforeRestore: restoreDynamicRows
    });

}// end init

function restoreDynamicRows(){
    var numberOfRows = localStorage.getItem(localStorageKey);
    if(numberOfRows > 1){
        for(var i = 2; i <= numberOfRows; i++){
            addTaskTo();
        }
    }
}