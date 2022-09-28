import sum_letters from './numTostring.js';


export default function callPrint(estimateData) {

    const companyName = document.querySelector('#companyName');
    const dataCompanyName = document.querySelector('[data-id="companyName"]');
    dataCompanyName.innerHTML = companyName.value;

    const companySpecialization = document.querySelector('#companySpecialization');
    const dataCompanySpecialization = document.querySelector('[data-id="companySpecialization"]');
    dataCompanySpecialization.innerHTML = companySpecialization.value;

    const companyCity = document.querySelector('#companyCity');
    const dataCompanyCity = document.querySelector('[data-id="companyCity"]');
    dataCompanyCity.innerHTML = companyCity.value;

    const companyDomain = document.querySelector('#companyDomain');
    const dataCompanyDomain = document.querySelector('[data-id="companyDomain"]');
    dataCompanyDomain.innerHTML = companyDomain.value;


    // Вывод актуальной даты составления КП
    const currentDateField = document.querySelector('[data-id="currentDate"]');
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
    currentDateField.innerHTML = Day + " " + fMonth + " " + Year + " года";

    // Формирование списка услуг в строки таблицы
    const tableRows = estimateData.reduce((row, dataItem) => {
        const { selectName,
            optionTitle,
            optionDescription,
            optionPrice,
            optionCount, } = dataItem;

        const calculationItem = `
        <tr>
            <td>
                <span class="setvise-table-title">${selectName}:</span>
                <span>${optionTitle}</span>
            </td>
            <td>${optionDescription}</td>
            <td>${optionCount || 1}</td>
            <td>${(+optionPrice).toLocaleString('ru-RU')} ₸</td>
        </tr>`;
        row += calculationItem;
        return row;
    }, '');

    // Поле вывода строк таблицы расчёта
    const dataRenderRows = document.querySelector('[data-render-rows]');
    dataRenderRows.innerHTML = tableRows;

    // Печать документа
    window.print();
}


