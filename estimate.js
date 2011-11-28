var totsignature = '&#956;<sub>tot</sub>/&#963;<sub>tot</sub>';
var signature = ' (&#956;/&#963;)';
var addTaskTo = function(row)
{
    var task = $('.cloner > li').clone(true);
    task.insertAfter(row);
}
var addTask = function(event)
{
    var source = $(event.explicitOriginalTarget).closest('li');
    addTaskTo(source);
}

var isNumber = function(candidate)
{
    return !isNaN(parseInt(candidate));
}

var popOutCSV = function()
{
    var header = 'description,O,N,P,duration,deviation\n';
    var data = header;
    $('.tasks ul li').each(
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
}

var updateNumbers = function()
{
    var mu_tot = 0;
    var sigma_tot = 0;
    $('.tasks input[type=number]').each(function(){
        validate($(this));
        });

    $('.tasks > ul > li').each(
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
    $('.summary').empty().append($('<span class="totsum">' + totsignature + '<br />' + mu_tot.toFixed(2) + '/' + Math.sqrt(sigma_tot).toFixed(2) + '</span>'));
}

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
}

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
                if($('.tasks ul li').size() > 1)
                {
                    $(this).closest('li').remove();
                    updateNumbers();
                }
            });

    $('img.clear').click(
            function(){
                $('.tasks ul li').slice(1).remove();
                $('.tasks ul li input.optimus').removeClass('error').val('O');
                $('.tasks ul li input.nominal').removeClass('error').val('N');
                $('.tasks ul li input.worst').removeClass('error').val('P');
                $('.tasks ul li input.description').val('description');
            });

    $('img.download').click(
            function(event)
            {
                event.stopImmediatePropagation();
                popOutCSV();
            });

    $('.catcher').click(
            function()
            {
                $('.explanation').slideToggle('slow');
            });

    shortcut.add('Shift+enter', function(event){console.log('pressed key');addTask(event)});
    $('.tasks ul li input:first').select();
}// end init
