
function showConversations() {
    showhide('details');
    showhide('conversations');
    var tbody = $('#responsestable tbody');
    tbody.empty();
    var table = $('#conversationstable');
    table.trigger('update');
}

function showhide(id) {
    var e = document.getElementById(id);
    e.style.display = (e.style.display == 'block') ? 'none' : 'block';
}

function createTable(queries = []) {
    var tbody = $('#responsestable tbody');
    tbody.empty();

    queries
        .map(q => {
            var tableRow = $('<tr></tr>');

            var tsCol = $('<td></td>');
            tsCol.text(q.ts);
            tsCol.appendTo(tableRow);

            var userIdCol = $('<td></td>');
            userIdCol.text(q.userid);
            userIdCol.appendTo(tableRow);

            var userNameCol = $('<td></td>');
            userNameCol.text(q.username);
            userNameCol.appendTo(tableRow);

            var queryCol = $('<td></td>');
            queryCol.text(q.query);
            queryCol.appendTo(tableRow);

            var actionCol = $('<td></td>');
            actionCol.text(q.action);
            actionCol.appendTo(tableRow);

            var intentCol = $('<td></td>');
            intentCol.text(q.intentname);
            intentCol.appendTo(tableRow);

            var botIdCol = $('<td></td>');
            botIdCol.text(q.botid);
            botIdCol.appendTo(tableRow);

            return tableRow;
        })
        .forEach(r => {
            r.appendTo(tbody);
        });

    var table = $('#responsestable');
    table.trigger('update');
}

function addRowHandlers() {
    var table = document.getElementById("conversationstable");
    if (table) {
        var rows = table.getElementsByTagName("tr");
        //TODO fix loop!
        for (i = 0; i < rows.length; i++) {
            var currentRow = table.rows[i];
            var createClickHandler = row => {
                return () => {
                    createTable(JSON.parse(row.dataset.queries));
                    showhide('details');
                    showhide('conversations');
                };
            };

            currentRow.ondblclick = createClickHandler(currentRow);
        }
    }
}
window.onload = addRowHandlers();

$(document).ready(function () {
    var table1 = $('#conversationstable');
    table1.trigger('update');

    var table = document.getElementById("conversationstable");
    if (table) {
        var rows = table.getElementsByTagName("tr");
        //TODO fix loop!
        for (i = 0; i < rows.length; i++) {
            var cells = table.rows[i].getElementsByTagName("td");

            if (cells.length) {
                const canvasCell = cells[5].getElementsByTagName("canvas");
                if (canvasCell.length) {
                    const ctx = canvasCell[0].getContext("2d");
                    new Chart(ctx, getConfiguration(table.rows[i]));
                }
            }
        }
    }

    const date1 = document.getElementById('date1');
    if (date1) date1.value = new Date().toDateInputValue();
    const date2 = document.getElementById('date2');
    if (date2) date2.value = new Date().toDateInputValue();
});

function getConfiguration(row) {
    return {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [parseInt(row.dataset.fallback), parseInt(row.dataset.total)],
                backgroundColor: [window.chartColors.red, window.chartColors.green,],
                label: 'Dataset 1'
            }]
            ,
            labels: [
                "Fall.",
                "Tot."
            ]
        },
        options: {
            responsive: true,
            legend: {
                display: false,
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    };
}

Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

