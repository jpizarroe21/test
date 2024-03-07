
function clickToCheckbox(elem, nameTribute) {
    var tableId = $(elem).closest('table').attr('id');
    var rowNum = parseInt($(elem).closest('tr').attr('data-rownum'));

    if(!$(elem).hasClass('classNC')) {
        if($(elem).is(':checked') == true){
            //console.log('TABLA: ' + tableId + ' - TRIBUTO: ' + nameTribute + ' - FILA: ' + rowNum  + ' (OLDEST)');
            if(thereIsOldestSelections(tableId, nameTribute, rowNum)){
                //Si hay deudas antiguas, entonces se desmarca el checkbox y se muestra un mensaje de alerta
                elem.checked = false;
                $.confirm({
                    title: 'Aviso',
                    content: '<p style="text-align:justify;">Estimado contribuyente existen pendientes anteriores al seleccionado, debe cancelar los de mayor antiguedad.</p>',
                    boxWidth: 'auto',
                    useBootstrap: false,
                    buttons: {
                        cancel: {
                            text: 'Aceptar',
                            btnClass: 'btn-orange',
                            action: function(){

                            }
                        }
                    }
                });
            }
        }else{
            if(thereIsNewestSelections(tableId, nameTribute, rowNum)){
                elem.checked = true;
                $.confirm({
                    title: 'Aviso',
                    content: '<p style="text-align:justify;">Estimado contribuyente, existen registros posteriores que se encuentran marcadados, primero desmarcarlos para poder desmarcar el que desea.</p>',
                    boxWidth: 'auto',
                    useBootstrap: false,
                    buttons: {
                        cancel: {
                            text: 'Aceptar',
                            btnClass: 'btn-orange',
                            action: function(){

                            }
                        }
                    }
                });
            }
        }
    }

    sumSelectedRowsTables();
    $("#"+tableId).find('input[type="checkbox"]').first().prop("checked", allIsMarked(tableId));

    //Verifica si se han seleccionado todos los registros de un tipo de tributo
    verifyAllSelectedByTribute();
}

function verifyAllSelectedByTribute(){
    Number.prototype.format = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };
    
    //Verifica si se han seleccionado todos los registros de un tipo de tributo
    checkAllSelectedTribute('IBI');  //Bienes Inmuebles
    checkAllSelectedTribute('BAS');  //Servicios Urbanos
    checkAllSelectedTribute('COM');  //Patentes Comerciales
    checkAllSelectedTribute('LIC');  //Patentes Licores
    checkAllSelectedTribute('CEM');  //Cementerio
    checkAllSelectedTribute('MER');  //Mercado
    checkAllSelectedTribute('CAN');  //Zona Maritimo Terrestre
    checkAllSelectedTribute('SPC');  //Permisos de Construccion
    checkAllSelectedTribute('OTR');  //Otras deudas 
    sumSelectedRowsTables();   
    
}

function checkAllSelectedTribute(codeTribute){
    //Obtener total items y de items seleccionados del mismo tributo
    var totalItemsTribute = 0;
    var totalItemsTributeSelected = 0;
    $('.classPayment' + codeTribute).each(function(){
        totalItemsTribute++;
        if($(this).is(':checked') == true){
            totalItemsTributeSelected++;
        }
    });

    //Marca o desmarca descuentos
    if(totalItemsTribute == totalItemsTributeSelected){
        //Si estan todos seleccionados procede a marcar todos los descuentos
        //$('.allDiscounts' + codeTribute).prop('checked', true);
        if($('#isDiscountApply'+codeTribute).val() == 1){
            $('.allDiscounts' + codeTribute).prop('checked', true);
        }
        sumDiscountRows(codeTribute);
    }else{
        //Si no estan todos seleccionados procede a desmarcar todos los descuentos
        //$('.allDiscounts' + codeTribute).prop('checked', false);
        $('.allDiscounts' + codeTribute).prop('checked', false);
        clearSumDiscountRows(codeTribute);
    }
        
    //NC
    var totalNC = 0;
    $('.allNC' + codeTribute).each(function(){
        if($(this).is(':checked') == true){
            totalNC = parseFloat(totalNC) + parseFloat($(this).attr('data-amount'));
        }
    });
    
    if(parseFloat(totalNC) > 0) {
        totalNC = parseFloat(totalNC) * -1;
    }
    
    $('#strongNC' + codeTribute).text('¢'+totalNC.format(2));
}

function sumDiscountRows(codeTribute) {
    var totalToPay = parseFloat('0.00');
   
    $('.allDiscounts'+codeTribute).each(function(){
        if($(this).is(':checked') == true){
            totalToPay = parseFloat(totalToPay) + parseFloat($(this).attr('data-amount'));
        }
    });
    
    if(parseFloat(totalToPay) > 0) {
        totalToPay = parseFloat(totalToPay) * -1;
    }
    
    $('#strongDescuento'+codeTribute).text('¢'+totalToPay.format(2));
}

function clearSumDiscountRows(codeTribute) {
    $('#strongDescuento'+codeTribute).text('¢0.00');
}

function sumTotalDiscount() {
    var totalGeneralToPay = parseFloat('0.00');
   
    $('.classDiscount').each(function(){
        if($(this).is(':checked') == true){
            totalGeneralToPay = parseFloat(totalGeneralToPay) + parseFloat($(this).attr('data-amount'));
        }
    });
    
    var auxtotalGeneralToPay = totalGeneralToPay;
    if(parseFloat(totalGeneralToPay) > 0) {
        auxtotalGeneralToPay = parseFloat(totalGeneralToPay) * -1;
    }
    
    $('#addDescuentoFinal').text('¢'+auxtotalGeneralToPay.format(2));
    
    return totalGeneralToPay;
}

function sumTotalNC() {
    var totalGeneralToPay = parseFloat('0.00');
   
    $('.classNC').each(function(){
        if($(this).is(':checked') == true){
            totalGeneralToPay = parseFloat(totalGeneralToPay) + parseFloat($(this).attr('data-amount'));
        }
    });
    
    var auxtotalGeneralToPay = totalGeneralToPay;
    if(parseFloat(totalGeneralToPay) > 0) {
        auxtotalGeneralToPay = parseFloat(totalGeneralToPay) * -1;
    }
    
    $('#addNCFinal').text('¢'+auxtotalGeneralToPay.format(2));
    
    return totalGeneralToPay;
}

function clickSelectAll(elem){
    var tableId = $(elem).attr('data-tableid');

    $('#'+tableId+' > tbody  > tr').each(function() {
        var idChk = $(this).find("input").first().attr('id');

        //Valida si es un monto a favor debe estar siempre seleccionado
        if((!$('#' + idChk).hasClass('classDiscount'))){
            $(this).find("input").first().prop("checked", elem.checked);
        }else{
            $(this).find("input").first().prop("checked", false);
        }
    });

    sumSelectedRowsTables();
    verifyAllSelectedByTribute();
}

function thereIsNewestSelections(tableId, nameTribute, selectedTrIndex){
    var response = false;

    $('#'+tableId+' > tbody  > tr.' + nameTribute).each(function(){
        var idChk = $(this).find("input").first().attr('id');
        if(($(this).find("input").first().is(':checked'))){
            if((!$('#' + idChk).hasClass('readonly')) && (!$('#' + idChk).hasClass('classDiscount')) && (!$('#' + idChk).hasClass('classNC'))){
                var rowNum = parseInt($(this).attr('data-rownum'));
                if(rowNum > selectedTrIndex){
                    response = true;
                    return false;
                }
            }
        }
    });
    return response;
}
