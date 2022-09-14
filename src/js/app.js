'use strict';
import * as baseFunction from './modules/functions.js';
import './vendors/vendors.js';
import callPrint from './print.js';
baseFunction.testWebP();

$('body').addClass('load');



// обьявление селектов
$('.styles-label select').select2({
    minimumResultsForSearch: -1,
    placeholder: "Выбрать услугу",
});

// Событие выбора опции из селекта
$('.styles-label select').on('select2:select', function (e) {
    $(this).parent('.styles-label').addClass('selected');
    const selectedValue = $(this).val();
});


// Прослушка клика по документу
document.addEventListener('click', (e) => {
    resetSelect(e);
});

// Сброс выбора опции по конкретному селекту
function resetSelect(e) {
    const target = e.target;
    if (!target.closest('.reset-select')) return;
    const resetBtn = target.closest('.reset-select');
    const parentLabel = resetBtn.closest('.styles-label, .solution');

    parentLabel.classList.remove('selected');
    const select = $(parentLabel).find('select');
    select.val(null).trigger('change');
    // Если есть поле вода, обнулить
    const numField = parentLabel.querySelector('.styles-label input[data-styles-field]');
    if (numField) numField.value = '';

    if (parentLabel.classList.contains('solution')) {
        parentLabel.querySelectorAll('input, textarea').forEach(item => item.value = '');
    }
}


const solutionFields = document.querySelectorAll('#solutionArea, #solutionPrice');

solutionFields.forEach(item => {
    item.addEventListener('input', (e) => {
        const target = e.target;
        const parentElem = target.closest('.solution');
        parentElem.classList.add('selected');
        const solutonData = [...solutionFields];
        const iterableData = solutonData.reduce((acc, item) => {
            acc += item.value.trim();
            return acc;
        }, '');

        if (!iterableData.length) {
            parentElem.classList.remove('selected');
        }
    });
});