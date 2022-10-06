import sum_letters from './numTostring.js';


export default function contractPrint(estimateData, withRequisites) {
    const contractDocument = document.querySelector('#contract');


    const companyName = document.querySelector('#companyName');
    const companyDomain = document.querySelector('#companyDomain');
    const implementationPeriod = document.querySelector('#implementationPeriod');


    const dataContractCompany = document.querySelector('[data-contract-company]');
    const dataContractDate = document.querySelectorAll('[data-contract-date]');
    const dataFullPaymentList = document.querySelector('[data-full-payment-list]');
    const dataHalfPaymentList = document.querySelector('[data-half-payment-list]');
    const dataContractFullPayment = document.querySelector('[data-contract-full-payment]');
    const dataContractHalfPayment = document.querySelectorAll('[data-contract-half-payment]');
    const dataContractFinalPayment = document.querySelector('[data-contract-final-payment]');
    const dataWorkPerformedList = document.querySelector('[data-work-performed-list]');
    const dataContractPeriod = document.querySelector('[data-contract-period]');



    // Название компании заказчика
    dataContractPeriod.innerHTML = implementationPeriod.value.trim();
    // Вывод актуальной даты составления КП
    function pad(n) {
        if (n < 10)
            return "0" + n;
        return n;
    }
    let Data = new Date();
    let Year = Data.getFullYear();
    let Month = Data.getMonth();
    let Day = Data.getDate();
    let fMonth;
    // Преобразуем месяца
    switch (Month) {
        case 0: fMonth = "января"; break;
        case 1: fMonth = "февраля"; break;
        case 2: fMonth = "марта"; break;
        case 3: fMonth = "апреля"; break;
        case 4: fMonth = "мае"; break;
        case 5: fMonth = "июня"; break;
        case 6: fMonth = "июля"; break;
        case 7: fMonth = "августа"; break;
        case 8: fMonth = "сентября"; break;
        case 9: fMonth = "октября"; break;
        case 10: fMonth = "ноября"; break;
        case 11: fMonth = "декабря"; break;

    }
    dataContractDate.forEach(item => item.innerHTML = `«${pad(Day)}»` + " " + fMonth + " " + Year + " года");

    // Список работ со 100% предоплатой
    const fullPaymentList = estimateData
        .map(item => {
            if (item.dataOneClause && item.dataOneClause.includes('{SITENAME}')) {
                const companyDomainValue = companyDomain.value ? companyDomain.value : '';
                item.dataOneClause = item.dataOneClause.replace('{SITENAME}', companyDomainValue);
            }
            return item.dataOneClause;
        })
        .filter(item => item)
        .map(item => `<li>${item}</li>`)
        .join('');
    dataFullPaymentList.innerHTML = fullPaymentList;

    // Список работ со 50% предоплатой
    const halfPaymentList = estimateData
        .map(item => {
            if (item.dataSecondClause && item.dataSecondClause.includes('{COUNTER}')) {
                item.dataSecondClause = item.dataSecondClause.replace('{COUNTER}', item.optionCount);
            }
            return item.dataSecondClause;
        })
        .filter(item => item)
        .reduce((acc, item) => {
            acc.push(item.split('@@'));
            return acc;
        }, [])
        .flat(1)
        .map(item => {
            if (item.includes('<li>')) {
                return item
            } else {
                return `<li>${item}</li>`;
            }
        })
        .join('');
    dataHalfPaymentList.innerHTML = halfPaymentList;





    // Сумма работ по которым оплата 100%
    const contractFullPayment = estimateData
        .filter(item => item.dataOneClause && !item.isPresent)
        .reduce((acc, item) => {
            return acc += +item.optionPrice;
        }, 0);
    dataContractFullPayment.innerHTML = `${(+contractFullPayment).toLocaleString('ru-RU')} (${sum_letters(+contractFullPayment)})`;


    // Сумма работ по которым оплата 50%
    const contractHalfPayment = estimateData
        .filter(item => item.dataSecondClause && !item.isPresent && !item.dataOneClause)
        .reduce((acc, item) => {
            return acc += +item.optionPrice;
        }, 0);
    dataContractHalfPayment.forEach(item => {
        item.innerHTML = `${(+contractHalfPayment / 2).toLocaleString('ru-RU')} (${sum_letters(+contractHalfPayment / 2)})`;
    });

    // Итоговая стоимость договора
    const contractFinalPayment = contractHalfPayment + contractFullPayment;
    dataContractFinalPayment.innerHTML = `${(+contractFinalPayment).toLocaleString('ru-RU')} (${sum_letters(+contractFinalPayment)})`;



    // Переменные для полей ввода и вывода реквизитов 
    const ourRequisites = document.querySelector('[data-our-requisites]').innerHTML;
    const contractNumber = document.querySelector('#contractNumber');
    const directorName = document.querySelector('#directorName');
    const dataContractNumber = document.querySelector('[data-contract-number]');
    const dataClientRequisites = document.querySelector('[data-client-requisites]');
    const dataDirectorName = document.querySelector('[data-director-name]');
    let directorText = document.querySelector('#directorText').value.trim();
    directorText = directorText ? directorText + ',' : '';

    if (withRequisites) {
        const reqFields = document.querySelectorAll('._req');
        reqFields.forEach(field => {
            if (field.value.trim().length < 1) {
                field.classList.add('error');
            }
        });
        if (document.querySelector('._req.error')) return;


        dataContractNumber.innerHTML = contractNumber.value;
        dataDirectorName.innerHTML = directorName.value;

        let requisitesField = document.querySelector('#requisitesField');
        requisitesField =
            requisitesField.value.substring(0, requisitesField.selectionStart) +
            "\n" +
            requisitesField.value.substring(requisitesField.selectionEnd, requisitesField.value.length);
        requisitesField = requisitesField
            .split("\n")
            .filter(words => words.trim().length > 0)
            .map(words => {
                if (words.length > 0) {
                    return `<span class="requisit-item">${words}</span>`;
                }
            })
            .join('');
        dataClientRequisites.innerHTML = requisitesField;
        dataContractCompany.innerHTML = `«${companyName.value}», ${directorText}`;
    } else {
        dataClientRequisites.innerHTML = ourRequisites;
        dataContractCompany.innerHTML = `«${companyName.value}»,`;
        dataContractNumber.innerHTML = `__`;
        dataDirectorName.innerHTML = `_____________`;
    }

    // Печать документа
    contractDocument.classList.remove('no-print');
    contractDocument.classList.add('print');
    window.print();
    contractDocument.classList.remove('print');
    contractDocument.classList.add('no-print');
}
