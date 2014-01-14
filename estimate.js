var Estimate =  {

    totsignature : '&#956;<sub>tot</sub>/&#963;<sub>tot</sub>',
    signature : ' (&#956;/&#963;)',
    taskcounter : 1,
    localStorageKey : 'estimate-data',

    addTaskTo : function(row) {
        var $task = $('.cloner > li.task').clone(true);
        var number = Estimate.taskcounter++;
        $task.find('input').each(function (i, elem) {
            var name = $(elem).attr('name');
            $(elem).attr('name', name.replace('-x', '-' + number));
        });
        row = row || $('form').find('li:last');
        $task.insertAfter(row);
        $task.children('input:text').val('task ' + (number));
        Estimate.storeTaskCounter();
    },

    storeTaskCounter : function() {
        console.log(Estimate.taskcounter);
        localStorage.setItem(Estimate.localStorageKey, '' + Estimate.taskcounter);
    },

    addTask : function(event) {
        var source = $(event.target).closest('li');
        Estimate.addTaskTo(source);
        source.next('li.task').find('input.description').select();
    },

    isNumber : function(candidate) {
        return !isNaN(parseInt(candidate));
    },

    popOutCSV : function() {
        var data =  'description,O,N,P,duration,deviation\n';
        $('.tasks ul li.task').each(
            function () {
                $(this).find('input').each(function () {
                    data += $(this).val() + ',';
                });
                var mu = $(this).find('span.mu').html();
                data += (mu || '') + ',';
                var sigma = $(this).find('span.sigma').html();
                data += sigma || '';
                data += '\n';
            });
        window.location.href = 'data:text/csv;charset=utf8,' + encodeURIComponent(data);
    },

    updateNumbers : function(){
        var mu_tot = 0;
        var sigma_tot = 0;
        $('.tasks input[type=number]').each(function () {
            Estimate.validate($(this));
        });

        $('.tasks ul li.task').each(
            function () {
                var opt = $(this).children('input.optimus').val();
                var norm = $(this).children('input.nominal').val();
                var worst = $(this).children('input.worst').val();
                if (Estimate.isNumber(opt) && Estimate.isNumber(norm) && Estimate.isNumber(worst)) {
                    var mu = (parseFloat(opt) + 4 * parseFloat(norm) + parseFloat(worst)) / 6.0;
                    var sigma = (parseFloat(worst) - parseFloat(opt)) / 6.0;
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
            Estimate.totsignature + '<br />' + mu_tot.toFixed(2) +
            '/' + Math.sqrt(sigma_tot).toFixed(2) + '</span>'));
    },


    validate : function(input) {
        if (Estimate.isNumber(input.val())) {
            input.removeClass('error');
        }
        else {
            input.addClass('error');
        }
    },

    init : function() {

        $('input[type=number]').live('keyup', function () {
            Estimate.updateNumbers();
        });

        $('img.add').live('click', function (event) {
            event.stopImmediatePropagation();
            Estimate.addTaskTo($(this).closest('li'));
        });
        $('img.delete').live('click', function () {
            if ($('.tasks ul li.task').size() > 1) {
                $(this).closest('li').remove();
                Estimate.taskcounter--;
                Estimate.storeTaskCounter();
                Estimate.updateNumbers();
            }
        });

        $('img.clear').click(
            function () {
                $('.tasks ul li.task').slice(1).remove();
                $('.tasks ul li.task input.optimus').removeClass('error').val('1');
                $('.tasks ul li.task input.nominal').removeClass('error').val('2');
                $('.tasks ul li.task input.worst').removeClass('error').val('3');
                $('.tasks ul li.task input.description').val('description');
                $('input:first').select();
                Estimate.taskcounter = 1;
                Estimate.storeTaskCounter();
            });

        $('img.download').click(function() { Estimate.popOutCSV(); });

        $('input').live('click', function () {
            $(this).select();
          }).bind('keydown', function (event) {
            if (event.keyCode == 13 && event.target == this && event.shiftKey) {
                var source = $(this).closest('li');
                Estimate.addTaskTo(source);
                source.find('+ li').find('input:first').select();
            }
            var inputIndex = $(this).closest('li.task').find('input').index($(this));
            // arrow down
            if (event.keyCode == 40) {
                // if we are on the last row
                if ($(this).closest('li').index() == $("div.tasks li.task:last").index()) {
                    Estimate.addTask(event);
                }
                // else navigate down
                else {
                    $(this).closest('li').next('li.task').find('input').eq(inputIndex).select();
                }
            }
            // arrow up
            if (event.keyCode == 38) {
                // case new row
                // case navigate down
                $(this).closest('li').prev('li.task').find('input').eq(inputIndex).select();
            }
        });

        $('.catcher').click(
            function () {
                $('.explanation').slideToggle('slow');
            });

        $('.tasks ul li.task input:first').select();
        $('[title]').tooltip();


        $('form').sisyphus({
            onBeforeRestore: Estimate.restoreDynamicRows
        });

    },// end init

    restoreDynamicRows : function() {
        var numberOfRows = localStorage.getItem(Estimate.localStorageKey);
        if (numberOfRows > 1) {
            for (var i = 2; i <= numberOfRows; i++) {
                Estimate.addTaskTo();
            }
        }
    }

};
