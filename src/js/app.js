'use strict';
import * as baseFunction from './modules/functions.js';
import './vendors/vendors.js';
import IMask from 'imask';
import offerPrint from './offerPrint.js';
import contractPrint from './contractPrint.js';
baseFunction.testWebP();


function initApp() {
    // маска на поля где нужно вводить только числа
    document.querySelectorAll('.number-mask').forEach(input => {
        IMask(input, {
            mask: Number,
            thousandsSeparator: ' '
        });
    });

    // Плавное появление контента при загрузке страницы
    $('main').addClass('load');


    // HTML поля вывода данных
    const culcResultArea = document.querySelector('.calc-result');
    const dataFieldPrice = document.querySelector('[data-field-price]');
    const dataFieldSale = document.querySelector('[data-field-sale]');
    const dataFieldTotalPrice = document.querySelector('[data-field-total-price]');
    const calcOuterData = document.querySelector('.calc__outer-data');

    const offerDocument = document.querySelector('#offer-doc');
    const requisitesModal = document.querySelector('#requisitesModal');



    // Массив с данными по выбраным услугам
    var estimateData = [];

    // Поле отображения списка услуг
    const estimatePreview = document.querySelector('#estimatePreview');

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

    // Обьявление селектов
    $('.styles-label select').select2({
        minimumResultsForSearch: -1,
        placeholder: "Выбор услуги",
    });

    // Событие выбора опции из селекта
    $('.styles-label select').on('select2:select', function (e) {
        $(this).parent('.styles-label').addClass('selected');
        const target = e.target;
        const servicePriority = target.closest('[data-priority]')?.getAttribute('data-priority');
        const selectedOption = e.params.data.element;
        const selectTargetId = target.getAttribute('data-select2-id');
        const isPresent = target.parentElement.querySelector('.togler input').checked;
        const selectName = target.parentElement.querySelector('.select-placeholder').innerHTML;
        const selectedOptionId = selectedOption.getAttribute('data-select2-id');
        selectedOption.dataset.id = selectedOptionId;

        const dataOneClause = selectedOption.getAttribute('data-one-clause');
        const dataSecondClause = selectedOption.getAttribute('data-second-clause');
        const dataFourthPoint = selectedOption.getAttribute('data-fourth-point');


        const compliteCount = target.parentElement.querySelector('.complite-count');
        if (compliteCount) compliteCount.classList.remove('show');

        const isSelectWidthCounter = target.hasAttribute('data-has-counter');
        let serviseValue = target.parentElement.querySelector('.styles-input input')?.value
            .trim()
            .split(' ')
            .join('');

        if (isSelectWidthCounter && serviseValue.length < 1) return;

        const optionCount = serviseValue ? serviseValue : null;

        addSelectedService({
            selectedOption,
            selectTargetId,
            selectName,
            isPresent,
            optionCount,
            servicePriority,
            dataOneClause,
            dataSecondClause,
            dataFourthPoint
        });
    });

    // Обработка полей с возможностью ввести колличество услуги
    function compliteCounterChanges(e) {
        const target = e.target;
        if (!target.closest('.complite-count')) return;
        const servicePriority = target.closest('[data-priority]')?.getAttribute('data-priority');
        const thisFieldSelect = e.target.closest('.styles-label').querySelector('select');
        const jqSelect = $(thisFieldSelect).select2('data');
        const selectedOption = jqSelect[0].element;
        const dataOneClause = selectedOption.getAttribute('data-one-clause');
        const dataSecondClause = selectedOption.getAttribute('data-second-clause');
        const dataFourthPoint = selectedOption.getAttribute('data-fourth-point');

        const selectTargetId = thisFieldSelect.getAttribute('data-select2-id');
        const selectName = thisFieldSelect.parentElement.querySelector('.select-placeholder').innerHTML;
        const isPresent = thisFieldSelect.parentElement.querySelector('.togler input').checked;
        let serviseValue = thisFieldSelect.parentElement.querySelector('.styles-input input')?.value
            .trim()
            .split(' ')
            .join('');
        const optionCount = serviseValue ? serviseValue : null;
        addSelectedService({
            selectedOption,
            selectTargetId,
            selectName,
            isPresent,
            optionCount,
            servicePriority,
            dataOneClause,
            dataSecondClause,
            dataFourthPoint
        });
        target.classList.remove('show');
    }

    // Добавить выбранную услугу в список услуг
    function addSelectedService(dataObj) {
        const { selectedOption, selectTargetId, selectName, isPresent, optionCount, dataOneClause,
            dataSecondClause, dataFourthPoint } = dataObj;
        const optionPrice = !optionCount ? selectedOption.value : selectedOption.value * optionCount;
        // Формирование обьекта услуги
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
            servicePriority: dataObj.servicePriority,
            dataOneClause,
            dataSecondClause,
            dataFourthPoint,
        };

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

        // Если есть поле ввода, обнулить
        const numField = parentLabel.querySelector('.styles-label input[data-styles-field]');
        const compliteCountBtn = parentLabel.querySelector('.complite-count');
        if (compliteCountBtn) {
            compliteCountBtn.classList.remove('show');
        }

        if (numField) numField.value = '';
        // Обнулить поля кастомного решения
        if (parentLabel.classList.contains('solution')) {
            // parentLabel.querySelectorAll('input, textarea').forEach(item => item.value = '');
            estimateData = estimateData.filter(item => item.selectTargetId !== 'solutionArea');
        }
        renderPreview(estimateData);
    }

    // Описание отображения кнопки сброса полей в услуге нестандартных решений
    const solutionFields = document.querySelectorAll('#solutionArea, #solutionPrice');
    solutionFields.forEach(item => {
        item.addEventListener('input', (e) => {
            const target = e.target;
            const parentElem = target.closest('.solution');
            parentElem.classList.add('selected');
            const solutonData = [...solutionFields];
            const iterableData = solutonData.reduce((acc, item) => {
                acc += item.value.trim().split(' ').join('');
                return acc;
            }, '');

            if (!iterableData.length) {
                parentElem.classList.remove('selected');
            }

        });
    });

    // Функция генерации элементов списка услуг на основе массива данных  
    function renderPreview(serviceList) {
        // Показать/Скрыть предпросмотр сметы
        serviceList.length > 0 ? calcOuterData.classList.add('show') : calcOuterData.classList.remove('show')
        serviceList = serviceList.sort((a, b) => {
            return a.servicePriority - b.servicePriority;
        });
        const resList = serviceList.reduce((acc, service) => {
            const {
                selectName,
                selectTargetId,
                optionId,
                optionPrice,
                optionTitle,
                optionDescription,
                exampleLink,
                isPresent,
                optionCount,
                servicePriority
            } = service;
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
            const serviceItem = `
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
            <ul class="list-item__descr">
             ${optionDescription || ""}
            </ul>
        </div>
    </li>`;
            return acc += serviceItem;
        }, '');
        estimatePreview.innerHTML = resList;
        if (serviceList.length > 0) {
            culcResultArea.classList.add('show');
        } else {
            culcResultArea.classList.remove('show');
        }
        calculationResult(serviceList);
    }

    // Раскрытие описания услуги в списке услуг
    function toggleDescr(e) {
        const target = e.target;
        if (!target.closest('.show_more')) return;
        const parentElem = target.closest('.list-item');
        $(parentElem).toggleClass('show');
        const toggleContent = parentElem.querySelector('.list-item__footer');
        $(toggleContent).slideToggle("slow");
    }
    // Включение/выключение скидки на выбранную услугу
    document.querySelectorAll('.togler input[type="checkbox"]').forEach(item => {
        item.addEventListener('change', (e) => {
            const togler = e.target;
            const toglerParent = togler.closest('.styles-label, .solution');
            const select = toglerParent.querySelector('select');
            let selectId = '';
            if (select) {
                selectId = select.getAttribute('data-select2-id');
            }
            if (toglerParent.classList.contains('solution')) {
                selectId = 'solutionArea';
            }
            estimateData.forEach(servise => {
                if (servise.selectTargetId === selectId) {
                    servise.isPresent = togler.checked;
                }
            });
            renderPreview(estimateData);
        });
    });

    // Реализация показа и скрытия кнопки подтверждения в поле указания колличествавыбранной услуги
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


    // Добавление нестандартного решения в список услуг
    function addSolution(e) {
        const target = e.target;
        if (!target.closest('[data-add-solution]')) return;
        const servicePriority = target.closest('[data-priority]')?.getAttribute('data-priority');
        const solutionBlock = target.closest('.solution');
        const solutionPrice = solutionBlock.querySelector('#solutionPrice').value
            .split(' ')
            .join('');
        if (+solutionPrice.trim() < 1) solutionBlock.querySelector('.togler input').checked = true;

        let solutionText = solutionBlock.querySelector('#solutionArea');
        solutionText =
            solutionText.value.substring(0, solutionText.selectionStart) +
            "\n" +
            solutionText.value.substring(solutionText.selectionEnd, solutionText.value.length);
        solutionText = solutionText
            .split("\n")
            .filter(words => words.trim().length > 0)
            .map(words => {
                if (words.length > 0) {
                    return `<li>${words}</li>`;
                }
            })
            .join('');

        if (solutionText.length < 1) return;

        const isPresent = solutionBlock.querySelector('.togler input').checked;
        const dataObj = {
            selectName: 'Нестандартные решения',
            selectTargetId: 'solutionArea',
            optionId: null,
            optionPrice: solutionPrice,
            optionTitle: 'Реализация стороннего функционала',
            optionDescription: solutionText,
            exampleLink: null,
            isPresent,
            optionCount: null,
            servicePriority,
            dataSecondClause: solutionText,
            dataFourthPoint: 'Реализация стороннего функционала',
        };
        estimateData = estimateData.filter(item => item.selectTargetId !== 'solutionArea');
        estimateData.push(dataObj);
        renderPreview(estimateData);
    }

    // Вывод данных калькуляции в итоговую стоимость на странице расчёта
    function calculationResult(dataArr) {
        const priceWidthoutSale = dataArr.reduce((acc, service) => {
            return acc + Number(service.optionPrice);
        }, 0);

        const sale = dataArr.reduce((acc, service) => {
            const isPresent = service.isPresent;
            return isPresent ? acc + Number(service.optionPrice) : acc + 0;

        }, 0);

        const totalPrice = priceWidthoutSale - sale;

        dataFieldPrice.innerHTML = priceWidthoutSale.toLocaleString('RU-ru');
        dataFieldSale.innerHTML = sale.toLocaleString('RU-ru');
        dataFieldTotalPrice.innerHTML = totalPrice.toLocaleString('RU-ru');
    }


    // Прослушка кликов по документу
    document.addEventListener('click', (e) => {
        const target = e.target;
        resetSelect(e);
        toggleDescr(e);
        compliteCounterChanges(e);
        addSolution(e);

        // отправка на печать договора 
        if (target.closest('[data-print-contract]')) {
            requisitesModal.classList.add('show');
        }
        if (target.closest('[data-with-requisites]')) {
            contractPrint(estimateData, true);
        }

        if (target.closest('[data-without-requisites]')) {
            contractPrint(estimateData, false);
            const reqFieldsWithErrors = document.querySelectorAll('._req.error');
            if (reqFieldsWithErrors.length > 0) {
                reqFieldsWithErrors.forEach(item => {
                    item.classList.remove('error');
                });
            }
        }

        // отправка на печать КП  
        if (target.closest('[data-print-offer]')) {
            offerDocument.classList.remove('no-print');
            offerDocument.classList.add('print');
            offerPrint(estimateData);
            offerDocument.classList.remove('print');
            offerDocument.classList.add('no-print');
        }
    });


    const reqFields = document.querySelectorAll('._req');
    reqFields.forEach(field => {
        field.addEventListener('focus', (e) => {
            if (field.classList.contains) {
                field.classList.remove('error');
            }
        });
    }
    )
}



const someString = 'zlM@~GzBW8h|';
const loginModal = document.querySelector('#login-modal');
const loginBtn = document.querySelector('#loginBtn');

if (sessionStorage.getItem('loginTrue')) {
    loginModal.classList.remove('show');
    initApp();
} else {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const someStringValue = document.querySelector('#passordField').value.trim();
        if (someStringValue === someString) {
            loginModal.classList.remove('show');
            initApp();
            sessionStorage.setItem('loginTrue', true);
        } else {
            alert('Пароль не верный!');
        }
    });
}
