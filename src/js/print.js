import sum_letters from './numTostring.js';

export default function callPrint(data) {

    const dataList = data.fullSettlementList;
    const tableRows = dataList.reduce((row, dataItem) => {
        const { metalType,
            metalThickness,
            cuttingLength,
            punchingCount,
            itemPrice, } = dataItem;

        const calculationItem = `
        <tr>
            <td>${metalType}, ${metalThickness} мм</td>
            <td>${cuttingLength.toLocaleString('ru-RU')} м</td>
            <td>${punchingCount.toLocaleString('ru-RU')} шт</td>
            <td>${itemPrice.toLocaleString('ru-RU')} ₸</td>
        </tr>`;
        row += calculationItem;
        return row;
    }, '');

    // Поле вывода даты и имени клиента
    const printDateAndClientName = document.querySelector('[data-print-date]');
    const clientName = data.clientName;
    const clienText = clientName.length > 0 ? `для клиента:&nbsp<strong style="display:inline">«${clientName}»</strong>` : '';
    printDateAndClientName.innerHTML = `Расчёт от ${new Date().toLocaleDateString('ru-RU')} за лазерную резку металла ${clienText}`;

    // Поле вывода строк таблицы расчёта
    const dataRenderRows = document.querySelector('[data-render-rows]');
    dataRenderRows.innerHTML = tableRows;

    // Поле вывода итоговой суммы цыфрами и прописью
    const dataResultText = document.querySelector('[data-result-text]');
    const finishResult = dataList.reduce((sum, current) => sum + current.itemPrice, 0);
    const finishResultInWords = sum_letters(finishResult);
    dataResultText.innerHTML = ` Общая стоимость: <strong style="display:inline;">${finishResult.toLocaleString('ru-RU')}</strong> (${finishResultInWords}) тенге.`;

    // Печать документа
    window.print();
}


