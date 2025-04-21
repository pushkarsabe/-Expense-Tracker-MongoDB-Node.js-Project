//event listener for buy premium button razorpay
document.getElementById('buyPremiumRazor').onclick = async (e) => {
    console.log('inside buy Premium expense');
    const token = localStorage.getItem('token');
    console.log('token:' + token);
    try {
        const response = await axios.get(`http://localhost:3000/purchase/premiummembership`, {
            headers: {
                "Authorization": token
            }
        });
        console.log('Razorpay response:', response);
        console.log('Razorpay :', response);

        const options = {
            'key': response.data.key_id,//key id generated from dashboard 
            'order_id': response.data.order.id, // for one time payement

            //to handle the success payement
            'handler': async function (response) {
                await axios.post(`http://localhost:3000/purchase/updatetransactionstatus`, {
                    order_id: options.order_id,
                    payment_id: response.razorpay_payment_id,
                },
                    { headers: { "Authorization": token } });

                displayMessage('You are a premium user now', 'success');
                document.getElementById('buyPremiumRazor').style.visibility = 'hidden';
                document.getElementById('premiumUserText').innerHTML = 'You are a premium user';

            }
        }

        var rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();
        rzp1.on('payment.failed', function (response) {
            console.log('rzp1 response = ' + JSON.stringify(response));
            displayMessage(response.error.description, 'error');
        })
    }
    catch (error) {
        console.log('Unhandled error:', error);
        displayMessage('Something went wrong', 'error');
    }
}//buyPremiumBtn

//to decode the token 
function parseJWT(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

//function to hide the premium button and display the text
function showPremiumuser() {
    document.getElementById('buyPremiumRazor').style.visibility = 'hidden';
    document.getElementById('premiumUserText').innerHTML = 'You are a premium user';
}

//function to display the leader board details to premium user
function printPremiumLeaderBoardDetails(data) {
    const LeaderBoardsListContainer = document.getElementById('LeaderBoardsList');
    console.log('name = ' + data.name);
    console.log('totalExpenses = ' + data.totalExpenses);

    const LBli = document.createElement('li');
    const text = document.createTextNode(`Name : ${data.name} - Total Cost : ${data.totalExpenses}`);
    LBli.appendChild(text);
    LeaderBoardsListContainer.appendChild(LBli);
}//printPremiumLeaderBoardDetails

// Add a flag to track if the leaderboard has been shown
let leaderboardShown = false;
//to show LeaderBoard
async function showLeaderBoards(val) {
    // If leaderboard is already shown, do nothing
    if (leaderboardShown) {
        return;
    }
    console.log('user id = ' + val.id);
    const token = localStorage.getItem('token');

    try {

        const response = await axios.get(`http://localhost:3000/premium/showLeaderBoard`, {
            headers: {
                "Authorization": token
            }
        });
        console.log('showLeaderBoards response = ' + JSON.stringify(response));
        for (let i = 0; i < response.data.length; i++) {
            printPremiumLeaderBoardDetails(response.data[i]);
        }

        // Set the flag to true after displaying the leaderboard
        leaderboardShown = true;
    }
    catch (error) {
        console.log('Unhandled error:', error);
        displayMessage('Unhandled error!', 'error');
    }

}// showLeaderBoards

//function to display the downloaded files by the user
function printAllDownloads(data) {
    // console.log('printAllDownloads id = ', data._id);
    // console.log('file url = ', data.URL);

    const downloadTable = document.getElementById('downloadTable');
    // Create a table row
    const newRow = downloadTable.insertRow();
    // Insert cells into the row
    const fileCell = newRow.insertCell(0);
    // Populate the cells with data
    fileCell.textContent = data.URL;

}//printAllDownloads

//to print the expense data in list
function printAllExpenses(data) {
    console.log('inside printAllExpenses');
    console.log('data = ' + data.id);
    console.log('money = ' + data.money);
    // console.log('description = ' + data.description);
    // console.log('options = ' + data.options);
    const olExpenses = document.getElementById('olExpenses');

    const li = document.createElement('li');
    const text = document.createTextNode(`Money : ${data.money}, Description  : ${data.description},, Options  : ${data.options}`);
    li.appendChild(text);
    const deleteBTN = document.createElement('button');
    deleteBTN.id = data._id;
    deleteBTN.setAttribute('value', 'Delete');
    deleteBTN.textContent = 'Delete';
    li.appendChild(deleteBTN);

    deleteBTN.addEventListener('click', () => {
        deleteExpense(data._id);
    })
    olExpenses.appendChild(li);
}//printAllExpenses

function displayMessage(msg, type = 'info') {
    const container = document.getElementById('messageContainer');

    const message = document.createElement('div');
    message.className = `message ${type} fade-in-out`;
    message.textContent = msg;

    container.appendChild(message);

    // Remove after animation ends (3s)
    setTimeout(() => {
        container.removeChild(message);
    }, 3000);
}

//global scope so that other functions can also access this variable
let selectedRowOption = 5;

//to get the expense data and to check user is premium or not
document.addEventListener('DOMContentLoaded', async () => {
    console.log('inside DOMContentLoaded expense');
    const token = localStorage.getItem('token');
    console.log('token:' + token);

    if (!token) {
        displayMessage('Authentication failed. Please log in again.', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000)
        return;
    }

    const decodeToken = parseJWT(token);
    console.log('decodeToken:' + JSON.stringify(decodeToken));
    const isAdmin = decodeToken.ispremiumuser;
    if (isAdmin) {
        //if the user is premium then the buy premium will stay hidden and the you are a premium user will be shown
        showPremiumuser();
        const LBdiv = document.getElementById('leaderBoard-header').innerText = 'LeaderBoard List';

        const premiumUserDIV = document.getElementById('premiumUserLBDivBtn');
        const showLBtn = document.createElement('button');
        showLBtn.setAttribute('type', 'button');
        showLBtn.id = decodeToken.userid;
        const buttonText = document.createTextNode('Show LeaderBoard');
        showLBtn.appendChild(buttonText);
        showLBtn.setAttribute('onclick', 'showLeaderBoards(this)');
        showLBtn.style.padding = '10px';
        showLBtn.style.fontSize = 'large';
        showLBtn.style.marginTop = '20px';
        showLBtn.style.marginLeft = '20px';
        premiumUserDIV.appendChild(showLBtn);

        //if the user is preminum then display the chart data
        try {
            const response = await axios.get('http://localhost:3000/expense/get-expense',
                {
                    headers:
                        { "Authorization": token }
                })
            console.log('response ', response.data.expenses);
            displayChart(response.data.expenses);

        }
        catch (error) {
            console.log('error:', error);
        }

    }
    //hide heading for chart
    document.getElementById('expenseChartTitle').style.display = 'none';

    //to pagination
    let currentPage = 1;
    let numberOfRows = document.getElementById('numberOfRows');

    //if the user does not select the rows the this function will get called 
    await fetchExpenseDataPagination(selectedRowOption, currentPage);
    const olExpenses = document.getElementById('olExpenses');

    numberOfRows.addEventListener('change', async () => {
        console.log('inside DOMContentLoaded addEventListener change');
        selectedRowOption = numberOfRows.value;
        console.log('selectedRowOption = ' + selectedRowOption);
        //every time user choose no of rows the list should be empty then new no of rows should be added
        olExpenses.innerHTML = '';
        //if the user select the rows the this function will get called 
        await fetchExpenseDataPagination(selectedRowOption, currentPage);
    })

    try {
        console.log('token being sent = ', token);

        //get files for download
        const res = await axios.get('http://localhost:3000/expense/getFiles',
            {
                headers:
                    { "Authorization": token }
            })
        console.log('inside getFiles');
        console.log('res = ', res);

        displayMessage(res.data.message || 'Files received', 'success');

        for (let i = 0; i < res.data.downloadFiles.length; i++) {
            printAllDownloads(res.data.downloadFiles[i]);
        }
    }
    catch (error) {
        console.log('Unhandled error:', error);

    }

})//DOMContentLoaded


function displayChart(data) {
    console.log('inside displayChart');
    console.log('data ', data);

    const groupedMoney = {};

    data.forEach(item => {
        const option = item.options;
        const amount = item.money;

        if (!groupedMoney[option]) {
            groupedMoney[option] = 0;
        }

        groupedMoney[option] += amount;
    })
    console.log('Grouped money by option:', groupedMoney);

    const labels = Object.keys(groupedMoney);
    console.log('labels:', labels);
    const values = Object.values(groupedMoney);
    console.log('values:', values);

    const barCanvas = document.getElementById('barChart');
    const pieCanvas = document.getElementById('pieChart');

    // Destroy existing charts if they exist
    const existingBarChart = Chart.getChart(barCanvas);
    if (existingBarChart) existingBarChart.destroy();

    const existingPieChart = Chart.getChart(pieCanvas);
    if (existingPieChart) existingPieChart.destroy();


    //pie chart
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Total Expense',
                data: values,
                backgroundColor: [
                    '#f94144', '#f3722c', '#f9c74f',
                    '#90be6d', '#43aa8b', '#577590',
                    '#6a4c93', '#1982c4'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Expenses by Category - Pie Chart'
                }
            }
        }
    });

}//displayChart


//function to get the number of expenses records after user selects number of rows
async function fetchExpenseDataPagination(selectedRowOption, currentPage) {
    console.log('inside fetchExpenseDataPagination');
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get(`http://localhost:3000/expense/get-expense?page=${currentPage}&numberOfRows=${selectedRowOption}`, {
            headers: {
                "Authorization": token
            }
        });
        //to print the expense data
        const expenseData = response.data.expenses;
        for (let i = 0; i < expenseData.length; i++) {
            printAllExpenses(expenseData[i]);
        }
        handleNavigationButtons(response.data);
    }
    catch (error) {
        console.log('Unhandled error:', error);
    }
}//fetchExpenseDataPagination

// Function to handle pagination buttons
function handleNavigationButtons({ currentPage, hasNextPage, nextPage, hasPreviousPage, previousPage, lastPage }) {
    console.log('inside andleNavigationButtons');
    console.log('currentPage = ' + currentPage);
    console.log('hasNextPage = ' + hasNextPage);
    console.log('nextPage = ' + nextPage);
    console.log('hasPreviousPage = ' + hasPreviousPage);
    console.log('previousPage = ' + previousPage);
    console.log('lastPage = ' + lastPage);
    console.log('selectedRowOption = ' + selectedRowOption);

    const paginationButttons = document.getElementById('paginationButttons');
    const olExpenses = document.getElementById('olExpenses');
    paginationButttons.innerHTML = '';
    if (hasPreviousPage) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = `<h3>${previousPage}</h3>`;
        prevButton.style.marginRight = '15px';
        prevButton.addEventListener('click', function () {
            olExpenses.innerHTML = '';
            getExpenses(previousPage);
        });
        paginationButttons.appendChild(prevButton);
    }

    const currentButton = document.createElement('button');
    currentButton.innerHTML = `<h4>${currentPage}</h4>`;
    currentButton.style.marginRight = '15px';
    currentButton.addEventListener('click', function () {
        location.reload();
    });
    paginationButttons.appendChild(currentButton);

    if (hasNextPage) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = `<h4>${nextPage}</h4>`;
        nextButton.style.marginRight = '15px';
        nextButton.addEventListener('click', function () {
            olExpenses.innerHTML = '';
            getExpenses(nextPage);
        });
        paginationButttons.appendChild(nextButton);
    }
}//handleNavigationButtons

//to get the pages and print as pagination
async function getExpenses(page) {
    console.log('inside getExpenses');
    console.log('selectedRowOption = ' + selectedRowOption);
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:3000/expense/get-expense?page=${page}
    &numberOfRows=${selectedRowOption}`, {
        headers: {
            "Authorization": token
        }
    });
    //to print the expense data
    const expenseData = response.data.expenses;
    for (let i = 0; i < expenseData.length; i++) {
        printAllExpenses(expenseData[i]);
    }
    handleNavigationButtons(response.data);
}

//function to show download option and daily weekly expenses
async function downloadEpense() {
    console.log('inside download function');
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/expense/download', { headers: { "Authorization": token } })
        // console.log('res = ', JSON.stringify(res));

        var a = document.createElement("a");
        a.href = res.data.fileUrl;
        a.download = 'myexpense.csv';
        a.click();
        displayMessage('Expense file uploaded successfully', 'succes');
    }
    catch (error) {
        if (error.response.status === 401) {
            console.log("error message = " + error.response.data.message);
            displayMessage('Not A premium user', 'error');
        } 
        else {
            console.log("error message = " + error);
            displayMessage('error', 'error');
        }
    }
}//downloadEpense


async function submitData(event) {
    event.preventDefault();
    console.log('inside submitData expense');
    // Get values from the form
    const money = document.getElementById('inputMoney').value;
    const description = document.getElementById('inputDescription').value;
    const options = document.getElementById('options').value;

    console.log('money = ' + money);
    console.log('description = ' + description);
    console.log('options = ' + options);

    const obj = {
        money: money,
        description: description,
        options: options
    }

    try {
        const token = localStorage.getItem('token');
        console.log('token:' + token);
        const response = await axios.post(`http://localhost:3000/expense/add-expense`, obj, {
            headers: {
                "Authorization": token
            }
        });
        console.log('response data = ' + JSON.stringify(response.data));
        console.log('money = ' + response.data.newExpenseData.money);
        console.log('description = ' + response.data.newExpenseData.description);
        console.log('options = ' + response.data.newExpenseData.options);

        document.getElementById('inputMoney').value = "";
        document.getElementById('inputDescription').value = "";
        document.getElementById('options').value = "";

        displayMessage('Expense completed successfully!', 'success');

        printAllExpenses(response.data.newExpenseData);

        // Re-fetch updated data and update the chart
        const res = await axios.get('http://localhost:3000/expense/getAllExpense', {
            headers: { "Authorization": token }
        });
        console.log('res:' + res);

        displayChart(res.data.expenses);
    }
    catch (error) {
        // to handle the output response errors
        if (error.response.status == 400) {
            console.log('Error object:', error.response.data.message);
            displayMessage('Input fields are empty', 'error');
        }
        console.log('Unhandled error:', error);
    }

}//submitData

async function deleteExpense(id) {
    console.log('id:', id);
    console.log('inside deleteExpense expense');
    //to delete data from backend 
    const token = localStorage.getItem('token');
    const userInput = confirm('Are you sure you want to delete this expense?');
    if (userInput) {
        try {
            const response = await axios.delete(`http://localhost:3000/expense/delete-expense/${id}`, { headers: { "Authorization": token } });
            console.log('response:', response);
            displayMessage('Data deleted successfully', 'success');

            // Re-fetch updated data and update the chart
            const res = await axios.get('http://localhost:3000/expense/getAllExpense', {
                headers: { "Authorization": token }
            });

            //to delete data from frotend 
            const parentele = document.getElementById(id).parentNode;
            olExpenses.removeChild(parentele);

            displayChart(res.data.expenses);
        }
        catch (error) {
            console.log('Unhandled error:', error);
            //to handle the output response errors
            if (error.response.status == 400) {
                console.log('Id is empty', 'error');
            }
            else if (error.response.status == 404) {
                console.log('Expense not found or unauthorized', 'error');
            }
        }
    }

    else {
        displayMessage('User Do Not Want to Delete Expense', 'info');
    }
}//deleteExpense

