'use strict';
import * as baseFunction from './modules/functions.js';
import './vendors/vendors.js';
import callPrint from './print.js';
baseFunction.testWebP();

$('body').addClass('load');

var estimateData = [];

// Дописывание цены в опциях
const selects = document.querySelectorAll('select');
selects.forEach(select => {
    const fieldOptions = select.querySelectorAll('option');
    fieldOptions.forEach(item => {
        item.setAttribute('data-title', item.innerHTML);
        if (item.value.length > 0 && !select.getAttribute('data-currency-conversion')) {
            let localePrice = (+item.value).toLocaleString('RU-ru');
            item.innerHTML += ` ( ${localePrice} ₸ )`;
        }
    });
});

// Конвертация валют для полей с указанной ценой в рублях
const convertFields = document.querySelectorAll('[data-currency-conversion]');
convertFields.forEach(field => {
    const rate = field.dataset.currencyConversion;
    const fieldOptions = field.querySelectorAll('option');
    fieldOptions.forEach(item => {
        item.innerHTML += ` ( ${(item.value * rate).toLocaleString('RU-ru')} ₸ )`;
        if (item.value.length > 0) {
            item.value = item.value * rate;
        }
    });
});

// обьявление селектов
$('.styles-label select').select2({
    minimumResultsForSearch: -1,
    placeholder: "Выбор услуги",
});

// Событие выбора опции из селекта
$('.styles-label select').on('select2:select', function (e) {
    $(this).parent('.styles-label').addClass('selected');

    const selectedOption = e.params.data.element;
    const selectTargetId = e.target.getAttribute('data-select2-id');
    const isPresent = e.target.parentElement.querySelector('.togler input').checked
    const selectName = e.target.parentElement.querySelector('.select-placeholder').innerHTML;
    const selectedOptionId = selectedOption.getAttribute('data-select2-id');
    selectedOption.dataset.id = selectedOptionId;

    const compliteCount = e.target.parentElement.querySelector('.complite-count');
    if (compliteCount) {
        compliteCount.classList.remove('show');
    }

    const isSelectWidthCounter = e.target.hasAttribute('data-has-counter');
    let serviseValue = e.target.parentElement.querySelector('.styles-input input')?.value.trim();

    if (isSelectWidthCounter && serviseValue.length < 1) {
        return;
    }
    const optionCount = serviseValue ? serviseValue : null;
    addSelectedService({
        selectedOption,
        selectTargetId,
        selectName,
        isPresent,
        optionCount
    });
});


function addSelectedService(dataObj) {
    const { selectedOption, selectTargetId, selectName, isPresent, optionCount } = dataObj;
    const optionPrice = !optionCount ? selectedOption.value : selectedOption.value * optionCount;

    const service = {
        selectName,
        selectTargetId,
        optionId: selectedOption.dataset.id,
        optionPrice,
        optionTitle: selectedOption.dataset.title,
        optionDescription: selectedOption.dataset.description,
        exampleLink: selectedOption.dataset.exampleLink,
        isPresent,
        optionCount,
    }
    estimateData = estimateData.filter(item => item.selectTargetId !== service.selectTargetId);
    estimateData.push(service);
    renderPreview(estimateData);
}


// Сброс выбора опции по конкретному селекту
function resetSelect(e) {
    const target = e.target;
    if (!target.closest('.reset-select')) return;
    const resetBtn = target.closest('.reset-select');
    const parentLabel = resetBtn.closest('.styles-label, .solution');

    parentLabel.classList.remove('selected');
    const select = $(parentLabel).find('select');
    select.val(null).trigger('change');
    const selectId = select.attr('data-select2-id');
    estimateData = estimateData.filter(item => item.selectTargetId !== selectId);

    // Если есть поле вода, обнулить
    const numField = parentLabel.querySelector('.styles-label input[data-styles-field]');
    if (numField) numField.value = '';
    // Обнулить поля кастомного решения
    if (parentLabel.classList.contains('solution')) {
        parentLabel.querySelectorAll('input, textarea').forEach(item => item.value = '');
    }
    renderPreview(estimateData);
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


const estimatePreview = document.querySelector('#estimatePreview');

function renderPreview(serveseList) {
    const resList = serveseList.reduce((acc, servese) => {
        const {
            selectName,
            selectTargetId,
            optionId,
            optionPrice,
            optionTitle,
            optionDescription,
            exampleLink,
            isPresent,
            optionCount
        } = servese;
        const optionCountStr = optionCount
            ?
            `<div class="list-item__block">
                <span class="list-item__nameplate">Количество</span>
                <div class="list-item__data">${optionCount}</div>
            </div>`
            :
            "";
        const exampleLinkStr = exampleLink
            ?
            `<a href="${exampleLink}" target="_blank" class="example-link">Демо</a>`
            :
            "";
        const serviseItem = `
        <li class="list-item" data-present="${isPresent}">
        <div class="list-item__head">
            <div class="list-item__block list-item__name">
                <span class="list-item__nameplate">${selectName || "Наименование услуги"}</span>
                <div class="list-item__data" data-is-present>${optionTitle || "Имя услуги"}</div>
            </div>
            ${optionCountStr}
            <div class="list-item__block">
                <span class="list-item__nameplate">Стоимость</span>
                <div class="list-item__data is-price">${(+optionPrice).toLocaleString('RU-ru')} ₸</div>
            </div>
            <div class="show_more"></div>
        </div>
        <div class="list-item__footer">
            ${exampleLinkStr}
            <p class="list-item__descr">${optionDescription || ""}</p>
        </div>
    </li>`;
        return acc += serviseItem;
    }, '');

    estimatePreview.innerHTML = resList;
}


// Прослушка клика по документу
document.addEventListener('click', (e) => {
    resetSelect(e);
    toggleDescr(e);
    compliteCounterChanges(e);
});


function compliteCounterChanges(e) {
    const target = e.target;
    if (!target.closest('.complite-count')) return;
    const thisFieldSelect = e.target.closest('.styles-label').querySelector('select');
    console.log(thisFieldSelect);
}


function toggleDescr(e) {
    const target = e.target;
    if (!target.closest('.show_more')) return;
    const parentElem = target.closest('.list-item');
    $(parentElem).toggleClass('show');
    const toggleContent = parentElem.querySelector('.list-item__footer');
    $(toggleContent).slideToggle("slow");
}

document.querySelectorAll('.togler input[type="checkbox"]').forEach(item => {
    item.addEventListener('change', (e) => {
        const togler = e.target;
        const toglerParent = togler.closest('.styles-label');
        const select = toglerParent.querySelector('select');
        const selectId = select.getAttribute('data-select2-id');
        estimateData.forEach(servise => {
            if (servise.selectTargetId === selectId) {
                servise.isPresent = togler.checked
            }
        });
        renderPreview(estimateData);
    });
});

const counterFields = document.querySelectorAll('[data-counter-field]');
counterFields.forEach(field => {
    field.addEventListener('input', (e) => {
        const inputValue = e.target.value.trim();
        const compliteBtn = e.target.parentElement.querySelector('.complite-count');
        const thisFieldSelect = e.target.closest('.styles-label').querySelector('select');
        const thisFieldSelectValue = thisFieldSelect.value;

        if (inputValue.length > 0 && thisFieldSelectValue) {
            compliteBtn.classList.add('show');
        } else {
            compliteBtn.classList.remove('show');
        }
    });
});
